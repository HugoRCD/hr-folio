export default defineNitroPlugin(async () => {
  if (!import.meta.dev) return

  const { cms } = await import('../utils/cms')
  await cms.watch()
})
