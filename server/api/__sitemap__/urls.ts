import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
import { serverQueryContent } from '#content/server'
import { asSitemapUrl, defineSitemapEventHandler } from '#imports'

// @ts-expect-error - We don't need to define the event type
export default defineSitemapEventHandler(async (e) => {
  const contentList = await serverQueryContent(e).find() as ParsedContent[]
  if (!contentList) return []
  const writingContent = contentList.filter(c => {
    if (!c._path) return false
    return c._path.startsWith('/writing')
  })
  return writingContent.map((c) => {
    if (!c._path) return undefined
    return asSitemapUrl({
      loc: `/writing/${ c._path.replace('/writing/', '') }`,
      lastmod: c.date
    })
  })
})

