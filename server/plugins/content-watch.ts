// `comarkContent()`'s fs sources only snapshot content once at init — without an
// explicit `watch()`, editing a `.md`/`.json` file requires a full dev server
// restart to be reflected (see https://content.comark.dev/cache/caching). Only
// relevant in dev: on Vercel the filesystem is read-only and immutable per deploy.
export default defineNitroPlugin(() => {
  if (import.meta.dev) {
    content.watch().catch(err => console.error('[content] watch failed', err))
  }
})
