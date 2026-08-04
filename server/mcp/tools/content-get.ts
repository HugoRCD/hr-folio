import { z } from 'zod'
import { renderMarkdown } from 'comark/render'

function normalizePath(p: string) {
  const t = p.trim()
  if (!t.startsWith('/')) return `/${t}`
  return t
}

export default defineMcpTool({
  name: 'content-get',
  title: 'Get content',
  description:
    'Load one markdown page (writing, clipboard, or main content) by site path, or one works JSON row by file stem. Returns markdown source as rawbody for pages.',
  group: 'content',
  annotations: { readOnlyHint: true, openWorldHint: false },
  inputSchema: {
    kind: z
      .enum(['page', 'work'])
      .describe('Use page for MD routes; use work for entries in the works source (identify by stem).'),
    path: z
      .string()
      .optional()
      .describe('Site path when kind is page, e.g. /writing/my-post or /. May omit leading slash.'),
    stem: z
      .string()
      .optional()
      .describe('File stem when kind is work, e.g. hr-folio (matches content/works/hr-folio.json).'),
  },
  inputExamples: [
    { kind: 'page', path: '/writing/not-an-impostor' },
    { kind: 'work', stem: 'nuxt-mcp-toolkit' },
  ],
  handler: async ({ kind, path, stem }) => {
    if (kind === 'page') {
      if (!path?.trim()) {
        throw createError({ statusCode: 400, message: 'path is required when kind is page' })
      }
      const p = normalizePath(path)
      const doc = await cms.get(p)
      if (!doc) {
        throw createError({ statusCode: 404, message: `No page found for path ${p}` })
      }
      const data = doc.data as PageData
      const rawbody = await renderMarkdown({ frontmatter: doc.data, meta: doc.meta, nodes: doc.nodes })
      return {
        path: doc.path,
        title: data.title,
        description: data.description,
        date: data.date,
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        rawbody,
      }
    }

    if (!stem?.trim()) {
      throw createError({ statusCode: 400, message: 'stem is required when kind is work' })
    }
    const s = stem.trim()
    const works = await cms.list(['works'])
    const work = works.find(w => w.meta.stem === s)
    if (!work) {
      throw createError({ statusCode: 404, message: `No work found for stem "${s}"` })
    }
    return {
      collection: 'works' as const,
      stem: work.meta.stem,
      entry: work.data as WorkData,
    }
  },
})
