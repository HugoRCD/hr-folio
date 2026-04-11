import { start } from 'workflow/api'
import { taskWorkflow } from '../../workflows/intelligence/sources/task'

export default defineEventHandler(async (event) => {
  await requireFolioOwnerSession(event)

  const { name, sources, dateRange, instructions } = await readBody(event)

  if (!name || !sources?.length || !dateRange || !instructions) {
    throw createError({ statusCode: 400, message: 'Missing required fields: name, sources, dateRange, instructions' })
  }

  const taskId = `task-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`
  const run = await start(taskWorkflow, [{ taskId, name, sources, dateRange, instructions }])

  return { runId: run.runId, taskId, name }
})
