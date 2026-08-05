import { createContentClient, type ContentFetch } from 'comark-content/client'

// Nuxt's `$fetch` has a deeply overloaded, route-aware type that scores every
// known route against the URL argument. Both assigning it to `ContentFetch`
// and calling it through a `ContentFetch`-typed wrapper blow the compiler's
// instantiation depth (TS2321) and silently degrade `clientContent` to `any`.
// Erasing the type via `unknown` first skips that route-matching entirely —
// this still calls the real `$fetch` at runtime, just without its literal-route
// overloads at the type level. https://content.comark.dev/integrations/nuxt
// does `fetch: $fetch` directly — that only works there because their example
// app has no typed API routes for `$fetch` to overload against.
const contentFetch = $fetch as unknown as ContentFetch

/** Browser-safe content client backed by `/api/content`, reusing Nuxt's `$fetch` for SSR payload hydration. */
export const clientContent = createContentClient({ fetch: contentFetch })
