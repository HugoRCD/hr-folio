// /og/things/<slug>.jpg, the share card of one piece, numbered as on the page
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'file')?.replace(/\.jpg$/, '')
  const { site, items } = await thingsCatalog(event)
  const plate = items.findIndex(item => item.slug === slug)
  const item = items[plate]
  if (!item) throw createError({ statusCode: 404 })
  setHeader(event, 'content-type', 'image/jpeg')
  return renderThingCard({ ...item, image: item.image.slice(site.length), plate: plate + 1 })
})
