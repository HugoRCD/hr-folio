import { generateText } from 'ai'
import { createMCPClient } from '@ai-sdk/mcp'
import type { MCPConfig } from './mcp'
import { INTELLIGENCE_MODEL, INTELLIGENCE_MAX_STEPS } from './config'

export async function fetchSourceData(
  mcp: MCPConfig,
  prompt: string,
): Promise<string> {
  'use step'

  const mcpClient = await createMCPClient({
    transport: { type: 'http', url: mcp.url, headers: mcp.headers },
  })
  const tools = await mcpClient.tools()

  try {
    const result = await generateText({
      model: INTELLIGENCE_MODEL,
      tools,
      system: [
        'You are a data extraction agent. Use the available tools to fetch the requested data. Return the raw data in a clear, structured format. Do not summarize or analyze — just extract and organize.',
        '',
        'Relevance: When listing repositories, projects, or initiatives, prioritize items that have had meaningful activity in roughly the last three weeks (commits, PRs, issues, or other updates). Skip or barely mention long-dormant work unless it is clearly required by the user’s exact date range or request, so the output stays useful and avoids noise from stale projects.',
      ].join('\n'),
      prompt,
      stopWhen: INTELLIGENCE_MAX_STEPS,
    })
    return result.text
  } finally {
    await mcpClient.close()
  }
}
