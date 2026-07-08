import { z } from 'zod'

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
      .describe('Use page for MD routes; use work for entries in the works JSON collection (identify by stem).'),
    path: z
      .string()
      .optional()
      .describe('Site path when kind is page, e.g. /writing/my-post or /. May omit leading slash.'),
    stem: z
      .string()
      .optional()
      .describe('File stem when kind is work, e.g. hr-folio (matches 1.works/hr-folio.json).'),
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
      const page = await getPageByPath(p)
      if (!page) {
        throw createError({ statusCode: 404, message: `No page found for path ${p}` })
      }
      if (isDraftDoc(page)) {
        throw createError({ statusCode: 404, message: `No page found for path ${p}` })
      }

      let collection: 'writing' | 'clipboard' | 'content' = 'content'
      if (p.startsWith('/writing/')) collection = 'writing'
      else if (p.startsWith('/clipboard/')) collection = 'clipboard'

      return {
        collection,
        path: page.path,
        title: page.title,
        description: page.description,
        date: page.date,
        ...(page.tags ? { tags: page.tags } : {}),
        ...(page.draft !== undefined ? { draft: page.draft } : {}),
        rawbody: page.rawbody,
      }
    }

    if (!stem?.trim()) {
      throw createError({ statusCode: 400, message: 'stem is required when kind is work' })
    }
    const work = await getWorkByStem(stem.trim())
    if (!work) {
      throw createError({ statusCode: 404, message: `No work found for stem "${stem}"` })
    }
    return {
      collection: 'works' as const,
      stem: work.stem,
      entry: work,
    }
  },
})
