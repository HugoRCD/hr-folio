import { createError } from 'h3'
import { useEvent } from 'nitropack/runtime'
import { queryCollection } from '@nuxt/content/server'
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
    const event = useEvent()

    if (kind === 'page') {
      if (!path?.trim()) {
        throw createError({ statusCode: 400, message: 'path is required when kind is page' })
      }
      const p = normalizePath(path)
      for (const col of ['writing', 'clipboard', 'content'] as const) {
        const doc = await queryCollection(event, col).path(p).first()
        if (!doc) continue
        return {
          collection: col,
          path: doc.path,
          title: doc.title,
          description: doc.description,
          date: doc.date,
          seo: doc.seo,
          ...('tags' in doc && doc.tags !== undefined ? { tags: doc.tags } : {}),
          ...('draft' in doc && doc.draft !== undefined ? { draft: doc.draft } : {}),
          rawbody: typeof doc.rawbody === 'string' ? doc.rawbody : undefined,
        }
      }
      throw createError({ statusCode: 404, message: `No page found for path ${p}` })
    }

    if (!stem?.trim()) {
      throw createError({ statusCode: 400, message: 'stem is required when kind is work' })
    }
    const s = stem.trim()
    const work = await queryCollection(event, 'works').where('stem', '=', s).first()
    if (!work) {
      throw createError({ statusCode: 404, message: `No work found for stem "${s}"` })
    }
    return {
      collection: 'works' as const,
      stem: work.stem,
      entry: work,
    }
  },
})
