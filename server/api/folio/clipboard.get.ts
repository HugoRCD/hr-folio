export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const items = await getClipboardListForRequest(event)
  log.set({ clipboard: { count: items.length } })
  return items
})
