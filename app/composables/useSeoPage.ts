import type { ContentCollectionItem } from '@nuxt/content'

export function useSeoPage(page: ContentCollectionItem, isWriting: boolean) {
  const route = useRoute()
  const { seo, profile } = useFolioConfig()

  const title = page?.title || seo?.title
  const description = page?.description || seo?.description

  useHead({
    title: page.title,
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
      ogImage: '/og/index.png',
      twitterImage: '/og/index.png',
    })
  }

  if (isWriting) {
    useSchemaOrg([
      defineArticle({
        headline: page.title,
        description: page.description,
        datePublished: page.date,
        author: { '@type': 'Person', name: seo?.title },
      }),
    ])
  } else {
    useSchemaOrg([defineWebPage()])
  }
}
