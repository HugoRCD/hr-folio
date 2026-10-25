import type { ContentCollectionItem } from '@nuxt/content'

export function useSeoPage(page: ContentCollectionItem, isWriting: boolean) {
  const route = useRoute()
  const { seo } = useFolioConfig()

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
    const raw = (page as unknown as { rawbody?: string }).rawbody
    defineOgImage('WritingPost', {
      title,
      description,
      date: page.date,
      minutes: raw ? useReadingTime(raw) : undefined,
    }, { width: 1200, height: 630 })
  } else {
    useSeoMeta({
      ogImage: '/og/index.jpg',
      twitterImage: '/og/index.jpg',
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
