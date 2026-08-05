import type { FolioClipboardListItem, FolioWritingListItem } from '../../types/folio-lists'

export type { FolioClipboardListItem, FolioWritingListItem }

export async function getWritingListForRequest(): Promise<FolioWritingListItem[]> {
  const items = await content.list(['pages'])
  const posts = items.filter(item => item.path.startsWith('/writing/'))

  const list = await Promise.all(posts.map(async (item) => {
    const { data } = item
    const full = await content.get(item.path)
    return {
      path: item.path,
      title: data.title!,
      description: data.description!,
      date: data.date!,
      tags: data.tags,
      readingMinutes: readingMinutesFromNodes(full?.nodes),
    }
  }))

  return list.sort(byDateDesc)
}

export async function getClipboardListForRequest(): Promise<FolioClipboardListItem[]> {
  const items = await content.list(['pages'])

  return items
    .filter(item => item.path.startsWith('/clipboard/'))
    .map((item) => {
      const { data } = item
      return { path: item.path, title: data.title!, date: data.date! }
    })
    .sort(byDateDesc)
}
