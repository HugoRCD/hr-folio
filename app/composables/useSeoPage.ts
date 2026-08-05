/**
 * Every composable below (`useHead`, `useSeoMeta`, `useSchemaOrg`, `defineOgImage`,
 * `useFolioConfig`/`useAppConfig`) needs Vue's "current instance" to inject into the
 * right Nuxt app context. That context is only reliably available while still
 * inside the component's synchronous setup — Vue restores it across an `await` via
 * `withAsyncContext`, but that restoration isn't safe under concurrent SSR
 * requests (observed as an intermittent "Cannot read properties of undefined
 * (reading 'title')" crash, the config context from a *different* concurrent
 * request "leaking" in). So `useSeoPage` must be called synchronously, before any
 * `await` in the caller — see `[...slug].vue`. `page` is passed as a `Ref` (still
 * `undefined` at call time, populated once the async fetch resolves) and every
 * value derived from it is passed to `useHead`/`useSeoMeta` as a getter function,
 * so unhead re-reads it reactively once the data lands instead of us needing to
 * wait for it here.
 */
export function useSeoPage(page: Ref<PageData | undefined>, isWriting: boolean) {
  const route = useRoute()
  const { seo, profile } = useFolioConfig()

  const title = computed(() => page.value?.title || seo?.title)
  const description = computed(() => page.value?.description || seo?.description)

  useHead({
    title: () => page.value?.title,
    titleTemplate: (t) => {
      if (route.path === '/') return t || `${seo?.title}, ${seo?.description}`
      if (isWriting) return t || seo?.title
      return t ? `${t} | ${seo?.title}` : seo?.title
    },
  })

  useSeoMeta({
    ogSiteName: seo?.title,
    ogType: isWriting ? 'article' : 'website',
    author: seo?.title,
    title,
    description,
    twitterTitle: title,
    twitterDescription: description,
    twitterCard: 'summary_large_image',
  })

  if (isWriting) {
    defineOgImage('WritingPost', {
      title,
      description,
      avatar: profile?.picture,
    })
  } else {
    useSeoMeta({
      ogImage: '/og/index.jpg',
      twitterImage: '/og/index.jpg',
    })
  }

  if (isWriting) {
    useSchemaOrg([
      defineArticle({
        headline: () => page.value?.title,
        description: () => page.value?.description,
        datePublished: () => page.value?.date,
        author: { '@type': 'Person', name: seo?.title },
      }),
    ])
  } else {
    useSchemaOrg([defineWebPage()])
  }
}
