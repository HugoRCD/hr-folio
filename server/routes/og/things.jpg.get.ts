// /og/things.jpg, the share card of the whole collection
export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'image/jpeg')
  return renderThingsCard()
})
