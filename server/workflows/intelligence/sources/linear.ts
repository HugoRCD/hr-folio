import { getMCPConfig, INTELLIGENCE_SOURCES, fetchSourceData, processReport, writeToSandbox, syncToGit } from '../utils'

export async function linearWorkflow(date: string) {
  'use workflow'

  const mcp = getMCPConfig('linear')
  const { template } = INTELLIGENCE_SOURCES.linear
  const data = await fetchSourceData(
    mcp,
    `Fetch all my Linear activity for the full calendar day ${date} (Europe/Paris timezone): issues completed, issues in progress, upcoming issues due this week, current cycle progress, and any notable comments or updates.`,
    'linear',
  )
  const summary = await processReport(data, `Generate a daily summary for ${date} following this template:\n\n${template}`)
  await writeToSandbox('linear', date, summary)
  await syncToGit('linear', date, summary)
}
