import { createCMSClient, type CMSClient, type CMSFetch } from '@comark/cms/client'

// `ReturnType<typeof createCMSClient>` collapses to `any` here — `createCMSClient`
// is generic and TS can't resolve its instantiation from the bare function
// reference, which silently degrades every `useCms()` caller. Name the
// concrete `CMSClient` interface instead.
let client: CMSClient | null = null

// Nuxt's `$fetch` has a deeply overloaded, route-aware type that scores every
// known route against the URL argument. Both assigning it to `CMSFetch` and
// calling it with a widened `string` blow the compiler's instantiation depth
// (TS2321) and silently degrade every `useCms()` call to `any`. Erasing the
// type via `unknown` first skips that route-matching entirely — `cmsFetch`
// still calls the real `$fetch` at runtime, just without its literal-route
// overloads at the type level.
const cmsFetch = $fetch as unknown as CMSFetch

/** Browser-safe CMS client backed by `/api/cms`, reusing Nuxt's `$fetch` for SSR payload hydration. */
export function useCms(): CMSClient {
  if (!client) {
    client = createCMSClient({ fetch: cmsFetch })
  }
  return client
}
