import { getMCPConfig, INTELLIGENCE_SOURCES, fetchSourceData, processReport, writeToSandbox, syncToGit } from '../utils'

export async function githubWorkflow(date: string) {
  'use workflow'

  const mcp = getMCPConfig('github')
  const { template } = INTELLIGENCE_SOURCES.github
  const data = await fetchSourceData(
    mcp,
    `Fetch all my GitHub activity for the full calendar day ${date} (Europe/Paris timezone): commits pushed, pull requests opened/merged/reviewed, issues created/closed, and any other notable activity.`,
    'github',
  )
  const summary = await processReport(data, `Generate a daily summary for ${date} following this template:\n\n${template}`)
  await writeToSandbox('github', date, summary)
  await syncToGit('github', date, summary)
}
