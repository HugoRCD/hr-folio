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
    twitterSite: '@hugorcd',
    twitterCreator: '@hugorcd',
    ogLocale: 'en_GB',
    ...(isWriting && page.date ? { articlePublishedTime: page.date, articleAuthor: [seo.url] } : {}),
  })

  if (isWriting) {
    const raw = (page as unknown as { rawbody?: string }).rawbody
    defineOgImage('WritingPost', {
      title,
      description,
      date: page.date,
      minutes: raw ? useReadingTime(raw) : undefined,
    }, { width: 1200, height: 630, alt: `${title}, by Hugo Richard` })
  } else {
    useSeoMeta({
      // a new name rather than the old one replaced: the networks keep an image by its URL
      ogImage: '/og/home.jpg',
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: 'Hugo Richard, Software Engineer & Designer at Vercel',
      twitterImage: '/og/home.jpg',
      twitterImageAlt: 'Hugo Richard, Software Engineer & Designer at Vercel',
    })
  }

  if (isWriting) {
    useSchemaOrg([
      defineArticle({
        headline: page.title,
        description: page.description,
        datePublished: page.date,
        // no author given: it is the site's own identity, rather than a second, anonymous Person
      }),
    ])
  } else {
    useSchemaOrg([defineWebPage()])
  }
}
