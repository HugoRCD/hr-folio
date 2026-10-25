// One performance mark, when the app has hydrated, so the drawing under the page can show
// how this page came to be: request, response, parse, paint, hydrate.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    if (!performance.getEntriesByName('folio:hydrated').length) performance.mark('folio:hydrated')
  })
})
