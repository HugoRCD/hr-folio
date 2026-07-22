import type { H3Event } from 'h3'
import type { FolioClipboardListItem, FolioWritingListItem } from '../../types/folio-lists'

export type { FolioClipboardListItem, FolioWritingListItem }

export async function getWritingListForRequest(event: H3Event): Promise<FolioWritingListItem[]> {
  const rows = await queryCollection(event, 'writing')
    .order('date', 'DESC')
    .all()

  return rows.map(r => ({
    path: r.path,
    title: r.title,
    description: r.description,
    date: r.date,
    tags: r.tags,
    readingMinutes: readingMinutesFromMarkdown(typeof r.rawbody === 'string' ? r.rawbody : ''),
  }))
}

export async function getClipboardListForRequest(event: H3Event): Promise<FolioClipboardListItem[]> {
  const rows = await queryCollection(event, 'clipboard')
    .order('date', 'DESC')
    .all()

  return rows.map(r => ({
    path: r.path,
    title: r.title,
    date: r.date,
  }))
}
