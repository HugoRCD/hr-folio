// What Vercel knows about this very request, for the drawing under the page: where the visitor's
// network says they are (shown back to them only, never stored), the edge region that answered,
// the region the function ran in, and the deployment that served it. Locally, most of it is empty.
export default defineEventHandler((event) => {
  const log = useLogger(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const h = (name: string) => {
    const v = getRequestHeader(event, name)
    return v ? decodeURIComponent(v) : undefined
  }
  const num = (v?: string) => (v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v))

  // x-vercel-id reads like "cdg1::iad1::xxxxx-1712345678901-abcdef": edge first, then function
  const regions = (h('x-vercel-id') ?? '').split('::').filter(s => /^[a-z]{3}\d$/.test(s))
  const lat = num(h('x-vercel-ip-latitude'))
  const lon = num(h('x-vercel-ip-longitude'))
  const visitor = lat !== undefined && lon !== undefined
    ? { city: h('x-vercel-ip-city') ?? '', country: h('x-vercel-ip-country') ?? '', lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10 }
    : null
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  const result = {
    visitor,
    edge: regions[0] ?? null,
    fn: process.env.VERCEL_REGION ?? regions.at(-1) ?? null,
    deployment: {
      env: process.env.VERCEL_ENV ?? 'local',
      sha: sha ? sha.slice(0, 7) : null,
      message: process.env.VERCEL_GIT_COMMIT_MESSAGE?.split('\n')[0] ?? null,
      builtAt: useRuntimeConfig(event).builtAt,
    },
  }
  log.set({ request: { edge: result.edge, fn: result.fn, located: Boolean(visitor) } })
  return result
})
