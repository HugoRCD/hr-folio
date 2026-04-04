export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { path } = getQuery(event)
  if (typeof path !== 'string' || path.length < 1 || !path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const page = await queryCollection(event, 'content').path(path).first()
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  await assertPublishedOrOwner(event, page)
  return page
})
