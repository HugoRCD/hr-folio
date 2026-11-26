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
    'Load one markdown page (writing, clipboard, or main content) by site path, a works JSON row by file stem, or a things JSON row by file stem. Returns markdown source as rawbody for pages.',
  group: 'content',
  annotations: { readOnlyHint: true, openWorldHint: false },
  inputSchema: {
    kind: z
      .enum(['page', 'work', 'thing'])
      .describe('Use page for MD routes; work for 1.works JSON (stem); thing for 4.things JSON (stem).'),
    path: z
      .string()
      .optional()
      .describe('Site path when kind is page, e.g. /writing/my-post or /. May omit leading slash.'),
    stem: z
      .string()
      .optional()
      .describe('File stem when kind is work or thing, e.g. hr-folio or santos-dumont.'),
  },
  inputExamples: [
    { kind: 'page', path: '/writing/not-an-impostor' },
    { kind: 'work', stem: 'nuxt-mcp-toolkit' },
    { kind: 'thing', stem: 'santos-dumont' },
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
          rawbody: typeof doc.rawbody === 'string' ? doc.rawbody : undefined,
        }
      }
      throw createError({ statusCode: 404, message: `No page found for path ${p}` })
    }

    if (!stem?.trim()) {
      throw createError({ statusCode: 400, message: `stem is required when kind is ${kind}` })
    }
    const s = stem.trim()

    if (kind === 'thing') {
      const thing = await queryCollection(event, 'things').where('slug', '=', s).first()
        ?? await queryCollection(event, 'things').where('stem', '=', s).first()
      if (!thing) {
        throw createError({ statusCode: 404, message: `No thing found for slug "${s}"` })
      }
      return {
        collection: 'things' as const,
        stem: thing.stem,
        slug: thing.slug,
        path: `/things/${thing.slug}`,
        entry: thing,
      }
    }

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
