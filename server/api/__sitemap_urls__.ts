export default defineEventHandler(async () => {
  const items = await listAllItems()
  const urls: string[] = []

  for (const item of items) {
    if (item.meta.extension !== '.md') continue
    if (Boolean(item.data.draft)) continue
    urls.push(item.path)
  }

  return urls.map(loc => ({ loc }))
})
