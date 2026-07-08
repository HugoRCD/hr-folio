import type { H3Event } from 'h3'
import type { FolioClipboardListItem, FolioWritingListItem } from '../../types/folio-lists'
import { listClipboard, listWriting } from '../utils/folio-cms'
import { readingMinutesFromMarkdown } from '../utils/reading-minutes'

async function includeDraftsForRequest(event: H3Event): Promise<boolean> {
  const session = await getUserSession(event)
  if (!session?.user) return false
  return isFolioOwner(event, session.user)
}

export type { FolioClipboardListItem, FolioWritingListItem }

export async function getWritingListForRequest(event: H3Event): Promise<FolioWritingListItem[]> {
  const includeDrafts = await includeDraftsForRequest(event)
  const rows = await listWriting(includeDrafts)

  return rows.map(r => ({
    path: r.path,
    title: r.title,
    description: r.description,
    date: r.date,
    tags: r.tags,
    draft: Boolean(r.draft),
    readingMinutes: readingMinutesFromMarkdown(r.rawbody ?? ''),
  }))
}

export async function getClipboardListForRequest(event: H3Event): Promise<FolioClipboardListItem[]> {
  const includeDrafts = await includeDraftsForRequest(event)
  const rows = await listClipboard(includeDrafts)

  return rows.map(r => ({
    path: r.path,
    title: r.title,
    date: r.date,
    draft: Boolean(r.draft),
  }))
}
