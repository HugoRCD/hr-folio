import { createContentClient, type ContentClient, type ContentFetch } from 'comark-content/client'

// `ReturnType<typeof createContentClient>` collapses to `any` here —
// `createContentClient` is generic and TS can't resolve its instantiation from
// the bare function reference, which silently degrades every `useContent()`
// caller. Name the concrete `ContentClient` interface instead.
let client: ContentClient | null = null

// Nuxt's `$fetch` has a deeply overloaded, route-aware type that scores every
// known route against the URL argument. Both assigning it to `ContentFetch`
// and calling it with a widened `string` blow the compiler's instantiation
// depth (TS2321) and silently degrade every `useContent()` call to `any`.
// Erasing the type via `unknown` first skips that route-matching entirely —
// `contentFetch` still calls the real `$fetch` at runtime, just without its
// literal-route overloads at the type level.
const contentFetch = $fetch as unknown as ContentFetch

/** Browser-safe content client backed by `/api/content`, reusing Nuxt's `$fetch` for SSR payload hydration. */
export function useContent(): ContentClient {
  if (!client) {
    client = createContentClient({ basePath: '/api/content', fetch: contentFetch })
  }
  return client
}
