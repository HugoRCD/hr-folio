// `content.handler()` returns a Web-standard `Response`. Returning it as-is works
// fine uncached, but Nitro's route-rule caching (`swr`/`isr` on `/api/content/**`
// below) snapshots the event handler's *return value* to store/replay it — and a
// `Response` instance has no own enumerable properties (`status`/`headers`/`body`
// are prototype getters), so it serializes to `{}`. Every cache-hit after the
// first request then replayed that empty object, breaking `clientContent.get()`
// for any cached path (see the `useSeoPage` "reading 'title'" crash this caused).
// Unwrapping into H3-native status/headers/body makes the *actual* payload what
// gets cached and replayed.
export default defineEventHandler(async (event) => {
  const res = await content.handler(toWebRequest(event))
  setResponseStatus(event, res.status, res.statusText)
  for (const [key, value] of res.headers) {
    setResponseHeader(event, key, value)
  }
  const contentType = res.headers.get('content-type') ?? ''
  return contentType.includes('application/json') ? res.json() : res.text()
})
