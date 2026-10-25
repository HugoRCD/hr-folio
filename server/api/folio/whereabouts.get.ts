export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600')
  try {
    const stored = await useStorage('whereabouts').getItem<Whereabouts>('current')
    log.set({ whereabouts: { source: stored ? 'stored' : 'default' } })
    return stored ?? HOME_WHEREABOUTS
  } catch (error) {
    // no store configured or unreachable: home is a fine answer
    log.set({ whereabouts: { source: 'default', storeError: String(error) } })
    return HOME_WHEREABOUTS
  }
})
