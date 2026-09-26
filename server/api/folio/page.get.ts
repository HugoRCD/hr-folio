import { createError } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { path } = getQuery(event)
  if (typeof path !== 'string' || path.length < 1 || !path.startsWith('/')) {
    log.set({ requested: { path: typeof path === 'string' ? path : null } })
    throw createError({
      status: 400,
      message: 'Invalid path',
      why: 'The query parameter "path" must be a non-empty string starting with "/"',
      fix: 'Pass an absolute content path, for example /blog/my-post',
    })
  }

  const page = await queryCollection(event, 'content').path(path).first()
  if (!page) {
    log.set({ requested: { path } })
    throw createError({
      status: 404,
      message: 'Page not found',
      why: `No content page matches the path "${path}"`,
      fix: 'Check the path against the published pages, or look at /api/folio/writing for the list',
    })
  }

  log.set({ content: { path: page.path } })
  return page
})
