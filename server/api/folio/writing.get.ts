export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const items = await getWritingListForRequest(event)
  log.set({ writing: { count: items.length } })
  return items
})
