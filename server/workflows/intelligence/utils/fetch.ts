import { generateText } from 'ai'
import { createMCPClient } from '@ai-sdk/mcp'
import type { MCPConfig } from './mcp.ts'
import { INTELLIGENCE_MODEL, INTELLIGENCE_MAX_STEPS } from './config.ts'
import type { IntelligenceSourceId } from './sources.ts'
import { getTypefullySocialScopeBlock } from './typefully-scope.ts'

/** Typefully’s hosted MCP rejects the SDK default (`2025-11-25`); negotiate a supported version. */
const TYPEFULLY_MCP_PROTOCOL_VERSION = '2025-06-18'

function extractionSystemForSource(sourceId: IntelligenceSourceId | undefined): string {
  const base = [
    'You are a data extraction agent. Use the available tools to fetch the requested data. Return the raw data in a clear, structured format. Do not summarize or analyze — just extract and organize.',
    '',
    'Relevance: When listing repositories, projects, or initiatives, prioritize items that have had meaningful activity in roughly the last three weeks (commits, PRs, issues, or other updates). Skip or barely mention long-dormant work unless it is clearly required by the user’s exact date range or request, so the output stays useful and avoids noise from stale projects.',
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
      '- For published post metrics on X: typefully_list_social_set_analytics_posts with platform "x", start_date and end_date as YYYY-MM-DD matching the user’s date range (analytics currently supports X only).',
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
          protocolVersion: process.env.TYPEFULLY_MCP_PROTOCOL_VERSION ?? TYPEFULLY_MCP_PROTOCOL_VERSION,
        }
        : { type: 'http', url, headers: mcp.headers },
  })
  const tools = await mcpClient.tools()

  try {
    const result = await generateText({
      model: INTELLIGENCE_MODEL,
      tools,
      system: extractionSystemForSource(sourceId),
      prompt,
      stopWhen: INTELLIGENCE_MAX_STEPS,
    })
    return result.text
  } finally {
    await mcpClient.close()
  }
}
