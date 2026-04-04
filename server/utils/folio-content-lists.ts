import type { H3Event } from 'h3'
import type { FolioClipboardListItem, FolioWritingListItem } from '../../types/folio-lists'

async function includeDraftsForRequest(event: H3Event): Promise<boolean> {
  const session = await getUserSession(event)
  if (!session?.user) return false
  return isFolioOwner(event, session.user)
}

export type { FolioClipboardListItem, FolioWritingListItem }

export async function getWritingListForRequest(event: H3Event): Promise<FolioWritingListItem[]> {
  const includeDrafts = await includeDraftsForRequest(event)
  let rows = await queryCollection(event, 'writing')
    .order('date', 'DESC')
    .all()

  if (!includeDrafts) {
    rows = rows.filter(r => !r.draft)
  }

  return rows.map(r => ({
    path: r.path,
    title: r.title,
    description: r.description,
    date: r.date,
    tags: r.tags,
    draft: Boolean(r.draft),
    readingMinutes: readingMinutesFromMarkdown(typeof r.rawbody === 'string' ? r.rawbody : ''),
  }))
}

export async function getClipboardListForRequest(event: H3Event): Promise<FolioClipboardListItem[]> {
  const includeDrafts = await includeDraftsForRequest(event)
  let rows = await queryCollection(event, 'clipboard')
    .order('date', 'DESC')
    .all()

  if (!includeDrafts) {
    rows = rows.filter(r => !r.draft)
  }

  return rows.map(r => ({
    path: r.path,
    title: r.title,
    date: r.date,
    draft: Boolean(r.draft),
  }))
}
