import { generateText, stepCountIs } from 'ai'
import type { LanguageModel } from 'ai'
import { createMCPClient } from '@ai-sdk/mcp'
import type { MCPConfig } from './mcp'
import { INTELLIGENCE_MODEL, INTELLIGENCE_MAX_STEPS } from './config'
import type { IntelligenceSourceId } from './sources'
import { getTypefullySocialScopeBlock } from './typefully-scope'

/**
 * Typefully's hosted MCP rejects the SDK default (`2025-11-25`).
 * Since @ai-sdk/mcp v1 hardcodes LATEST_PROTOCOL_VERSION in both the header and the
 * initialize request body, we intercept fetch to override both.
 */
const TYPEFULLY_MCP_PROTOCOL_VERSION = process.env.TYPEFULLY_MCP_PROTOCOL_VERSION ?? '2025-06-18'

function createVersionedFetch(version: string): typeof globalThis.fetch {
  return (input, init) => {
    const headers = new Headers((init?.headers as HeadersInit | undefined) ?? {})
    headers.set('mcp-protocol-version', version)

    let body = init?.body
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body) as { params?: { protocolVersion?: string } }
        if (parsed?.params?.protocolVersion) {
          parsed.params.protocolVersion = version
          body = JSON.stringify(parsed)
        }
      } catch { /* non-JSON body — leave as-is */ }
    }

    return globalThis.fetch(input, { ...init, headers, body })
  }
}

function extractionSystemForSource(sourceId: IntelligenceSourceId | undefined): string {
  const base = [
    'You are a data extraction agent. Use the available tools to fetch the requested data. Return the raw data in a clear, structured format. Do not summarize or analyze — just extract and organize.',
    '',
    'Relevance: When listing repositories, projects, or initiatives, prioritize items that have had meaningful activity in roughly the last three weeks (commits, PRs, issues, or other updates). Skip or barely mention long-dormant work unless it is clearly required by the user\'s exact date range or request, so the output stays useful and avoids noise from stale projects.',
  ]

  if (sourceId === 'typefully') {
    base.push(
      '',
      getTypefullySocialScopeBlock(),
      '',
      'Typefully-specific extraction:',
      '- Call typefully_get_me, then typefully_list_social_sets only to resolve the scoped social_set_id above; do not pull drafts or analytics for other sets.',
      '- For that social set only: typefully_list_drafts (status: draft, scheduled, published, error as useful; order by -updated_at or -published_at; paginate, limit up to 50 per page).',
      '- For scheduled queue visibility in range: typefully_get_queue (start_date / end_date; max range 62 days).',
      '- For published post metrics on X: typefully_list_social_set_analytics_posts with platform "x", start_date and end_date as YYYY-MM-DD matching the user\'s date range (analytics currently supports X only).',
      '- Optional: typefully_list_tags, typefully_get_social_set_details for the scoped set only.',
      '- Return structured raw facts: draft text snippets, statuses, schedule times, analytics fields per post — no narrative summary.',
    )
  }

  return base.join('\n')
}

export async function fetchSourceData(
  mcp: MCPConfig,
  prompt: string,
  sourceId?: IntelligenceSourceId,
  options?: { model?: LanguageModel, maxSteps?: number },
): Promise<string> {
  'use step'

  const url = mcp.url?.trim()
  if (!url) {
    throw new Error('[intelligence] MCP URL is missing for this source.')
  }

  const mcpClient = await createMCPClient({
    transport:
      sourceId === 'typefully'
        ? {
          type: 'http',
          url,
          headers: mcp.headers,
          fetch: createVersionedFetch(TYPEFULLY_MCP_PROTOCOL_VERSION),
        }
        : { type: 'http', url, headers: mcp.headers },
  })
  const tools = await mcpClient.tools()

  try {
    const result = await generateText({
      model: options?.model ?? INTELLIGENCE_MODEL,
      tools,
      system: extractionSystemForSource(sourceId),
      prompt,
      stopWhen: options?.maxSteps !== undefined ? stepCountIs(options.maxSteps) : INTELLIGENCE_MAX_STEPS,
    })
    return result.text
  } finally {
    await mcpClient.close()
  }
}
