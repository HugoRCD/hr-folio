import {
  getMCPConfig,
  INTELLIGENCE_SOURCES,
  type IntelligenceSourceId,
  fetchSourceData,
  getTypefullySocialScopeBlock,
  processReport,
  writeToSandbox,
  syncToGit,
} from '../utils'

export interface TaskParams {
  taskId: string
  name: string
  sources: IntelligenceSourceId[]
  dateRange: string
  instructions: string
}

export async function taskWorkflow(params: TaskParams) {
  'use workflow'

  const chunks: string[] = []
  for (const sourceId of params.sources) {
    const mcp = getMCPConfig(sourceId)
    const { label } = INTELLIGENCE_SOURCES[sourceId]
    const scope = sourceId === 'typefully' ? `\n\n${getTypefullySocialScopeBlock()}` : ''
    const data = await fetchSourceData(
      mcp,
      `Date range: ${params.dateRange}. ${params.instructions}${scope}`,
      sourceId,
    )
    chunks.push(`## ${label}\n\n${data}`)
  }

  const combined = chunks.join('\n\n---\n\n')
  const report = await processReport(combined, params.instructions)

  const filename = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  await writeToSandbox(`tasks/${params.taskId}`, filename, report)
  await syncToGit(`tasks/${params.taskId}`, filename, report)
}
