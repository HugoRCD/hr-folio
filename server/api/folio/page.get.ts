import { createError } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { path } = getQuery(event)
  if (typeof path !== 'string' || path.length < 1 || !path.startsWith('/')) {
    throw createError({
      status: 400,
      message: 'Invalid path',
      why: 'the query string must include a page path starting with /',
      fix: 'pass a content path such as ?path=/writing/my-post',
    })
  }

  log.set({ page: { path } })

  const page = await queryCollection(event, 'content').path(path).first()
  if (!page) {
    throw createError({
      status: 404,
      message: 'Page not found',
      why: 'no published content page exists at the requested path',
      fix: 'check the path against the published pages of the site',
    })
  }

  log.set({ page: { title: page.title } })
  return page
})

