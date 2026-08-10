// `comarkContent()`'s fs sources only snapshot content once at init — without an
// explicit `watch()`, editing a `.md`/`.json` file requires a full dev server
// restart to be reflected (see https://content.comark.dev/cache/caching). Only
// relevant in dev: on Vercel the filesystem is read-only and immutable per deploy.
export default defineNitroPlugin(() => {
  if (import.meta.dev) {
    // The FTS index (see `server/utils/content.ts`) is built lazily on first
    // `content.search()` call and otherwise never refreshes — without this, editing
    // a file's content in dev would leave search results stale until a restart.
    content.hooks.hook('watch:file:update', () => content.resetSearchIndex())
    content.hooks.hook('watch:file:remove', () => content.resetSearchIndex())
    content.watch().catch(err => console.error('[content] watch failed', err))
  }
})
