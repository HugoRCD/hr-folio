import { start } from 'workflow/api'
import { getParisCalendarDateISO } from '../../utils/intelligence-date'
import { githubWorkflow } from '../../workflows/intelligence/sources/github'
import { linearWorkflow } from '../../workflows/intelligence/sources/linear'

const workflows: Record<string, (date: string) => Promise<void>> = {
  github: githubWorkflow,
  linear: linearWorkflow,
}

export default defineEventHandler(async (event) => {
  await requireIntelligenceAuth(event)

  const source = getRouterParam(event, 'source')
  if (!source || !workflows[source]) {
    throw createError({ statusCode: 404, message: `Unknown intelligence source: ${source}` })
  }

  const date = getParisCalendarDateISO()
  const run = await start(workflows[source]!, [date])

  return { runId: run.runId, source, date }
})
