export type FolioWritingListItem = {
  path: string
  title: string
  description: string
  date: string
  tags?: string[]
  readingMinutes: number
}

export type FolioClipboardListItem = {
  path: string
  title: string
  date: string
}
