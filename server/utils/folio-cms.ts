import type { CMSFile, CMSListFile } from '@comark/cms'
import { parseFrontmatter } from 'comark'
import type { TocLink } from 'comark/plugins/toc'
import type { FolioAbout, FolioPage, FolioWork } from '../../types/folio-page'
import { cms } from './cms'

type CmsListItem = CMSListFile<Record<string, unknown>>

function workStem(metaStem: string): string {
  const parts = metaStem.split('/')
  return parts[parts.length - 1] ?? metaStem
}

function isMarkdown(item: CmsListItem) {
  return item.meta.extension === '.md'
}

function isWork(item: CmsListItem) {
  return item.meta.key.includes('1.works/') && item.meta.extension === '.json'
}

function isAbout(item: CmsListItem) {
  return item.meta.stem === 'about' && item.meta.extension === '.json'
}

function isWriting(item: CmsListItem) {
  return isMarkdown(item) && item.path.startsWith('/writing/')
}

function isClipboard(item: CmsListItem) {
  return isMarkdown(item) && item.path.startsWith('/clipboard/')
}

function isContentPage(item: CmsListItem) {
  return isMarkdown(item)
}

function sortByDateDesc<T extends { date?: string }>(rows: T[]) {
  return [...rows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

export async function getRawMarkdown(file: CMSFile): Promise<string | undefined> {
  if (file.meta.extension !== '.md') return undefined
  const source = cms.getSource(file.meta.source)
  if (!source) return undefined
  const sourceKey = file.meta.key.replace(`${file.meta.source}/`, '')
  const raw = await source.getItem(sourceKey)
  if (typeof raw !== 'string') return undefined
  return parseFrontmatter(raw).content
}

function toFolioPage(file: CMSFile, rawbody?: string): FolioPage {
  const data = file.data as Record<string, unknown>
  const tocMeta = (file.meta as { toc?: { links?: TocLink[] } }).toc

  return {
    path: file.path,
    title: typeof data.title === 'string' ? data.title : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    date: typeof data.date === 'string' ? data.date : undefined,
    image: typeof data.image === 'string' ? data.image : undefined,
    draft: Boolean(data.draft),
    tags: Array.isArray(data.tags) ? data.tags as string[] : undefined,
    nodes: file.nodes,
    toc: tocMeta?.links ? { links: tocMeta.links } : undefined,
    rawbody,
  }
}

export async function getPageByPath(path: string): Promise<FolioPage | null> {
  const file = await cms.get(path)
  if (!file || file.meta.kind !== 'document' || file.meta.extension !== '.md') {
    return null
  }
  const rawbody = await getRawMarkdown(file)
  return toFolioPage(file, rawbody)
}

export async function listAllItems(): Promise<CmsListItem[]> {
  await cms.init()
  return cms.list() as Promise<CmsListItem[]>
}

async function getRawbodyForListItem(item: CmsListItem): Promise<string> {
  const source = cms.getSource(item.meta.source)
  if (!source || item.meta.extension !== '.md') return ''
  const sourceKey = item.meta.key.replace(`${item.meta.source}/`, '')
  const raw = await source.getItem(sourceKey)
  if (typeof raw !== 'string') return ''
  return parseFrontmatter(raw).content
}

export async function listWriting(includeDrafts = false) {
  const items = (await listAllItems()).filter(isWriting)
  const rows = await Promise.all(items.map(async (item) => ({
    path: item.path,
    title: String(item.data.title ?? ''),
    description: String(item.data.description ?? ''),
    date: String(item.data.date ?? ''),
    tags: Array.isArray(item.data.tags) ? item.data.tags as string[] : undefined,
    draft: Boolean(item.data.draft),
    rawbody: await getRawbodyForListItem(item),
  })))

  const sorted = sortByDateDesc(rows)
  return includeDrafts ? sorted : sorted.filter(r => !r.draft)
}

export async function listClipboard(includeDrafts = false) {
  const rows = sortByDateDesc(
    (await listAllItems())
      .filter(isClipboard)
      .map(item => ({
        path: item.path,
        title: String(item.data.title ?? ''),
        date: String(item.data.date ?? ''),
        draft: Boolean(item.data.draft),
        rawbody: typeof item.data.rawbody === 'string' ? item.data.rawbody : undefined,
      })),
  )
  return includeDrafts ? rows : rows.filter(r => !r.draft)
}

export async function listWorks(): Promise<FolioWork[]> {
  return sortByDateDesc(
    (await listAllItems())
      .filter(isWork)
      .map(item => ({
        stem: workStem(item.meta.stem),
        name: String(item.data.name ?? ''),
        description: String(item.data.description ?? ''),
        category: String(item.data.category ?? ''),
        release: typeof item.data.release === 'string' ? item.data.release : undefined,
        date: String(item.data.date ?? ''),
        url: String(item.data.url ?? ''),
        github: typeof item.data.github === 'string' ? item.data.github : undefined,
        screenshotUrl: typeof item.data.screenshotUrl === 'string' ? item.data.screenshotUrl : undefined,
        screenshotOptions: item.data.screenshotOptions as FolioWork['screenshotOptions'],
        tags: Array.isArray(item.data.tags) ? item.data.tags as string[] : undefined,
      })),
  )
}

export async function getWorkByStem(stem: string): Promise<FolioWork | null> {
  const works = await listWorks()
  return works.find(w => w.stem === stem.trim()) ?? null
}

export async function getAbout(): Promise<FolioAbout | null> {
  const item = (await listAllItems()).find(isAbout)
  if (!item) return null
  return item.data as FolioAbout
}

export async function listContentPages() {
  return (await listAllItems()).filter(isContentPage)
}

export async function getPageRawbodyByPath(path: string): Promise<string | undefined> {
  const file = await cms.get(path)
  if (!file || file.meta.extension !== '.md') return undefined
  return getRawMarkdown(file)
}

export async function getPublishedPrerenderRoutes(): Promise<string[]> {
  const items = await listAllItems()
  const routes = new Set<string>(['/', '/writing', '/works', '/clipboard'])

  for (const item of items) {
    if (!isMarkdown(item)) continue
    if (Boolean(item.data.draft)) continue
    routes.add(item.path)
  }

  return [...routes]
}

export {
  isAbout,
  isClipboard,
  isContentPage,
  isMarkdown,
  isWork,
  isWriting,
  sortByDateDesc,
  workStem,
}
