import { getMCPConfig, INTELLIGENCE_SOURCES, fetchSourceData, getTypefullySocialScopeBlock, processReport, writeToSandbox, syncToGit } from '../utils'

export async function typefullyWorkflow(date: string) {
  'use workflow'

  const mcp = getMCPConfig('typefully')
  const { template } = INTELLIGENCE_SOURCES.typefully
  const data = await fetchSourceData(
    mcp,
    `Fetch all my Typefully activity for the full calendar day ${date} (Europe/Paris timezone): for my personal scoped social set only — drafts and scheduled posts (relevant statuses; paginate), queue for that day if within the allowed window, X (\`x\`) analytics for posts on that calendar day (use start_date and end_date as the same YYYY-MM-DD for that day), and any notable updates.\n\n${getTypefullySocialScopeBlock()}`,
    'typefully',
  )
  const summary = await processReport(data, `Generate a daily summary for ${date} following this template:\n\n${template}`)
  await writeToSandbox('typefully', date, summary)
  await syncToGit('typefully', date, summary)
}
