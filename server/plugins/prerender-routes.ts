export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('prerender:routes', async (routes) => {
    const contentRoutes = await getPublishedPrerenderRoutes()
    for (const route of contentRoutes) {
      routes.add(route)
    }
  })
})
