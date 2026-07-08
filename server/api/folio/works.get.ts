export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  return listWorks()
})
