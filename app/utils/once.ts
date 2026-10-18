// What has already been drawn since the page was loaded. Arriving on the site, on any page or by a
// refresh, draws everything once; moving between pages afterwards finds it already there.
const drawn = new Set<string>()

/** Whether something has already been drawn since this load, and mark it as drawn. */
export function seenSinceLoad(key: string, mark = false) {
  const seen = drawn.has(key)
  if (mark && import.meta.client) drawn.add(key)
  return seen
}
