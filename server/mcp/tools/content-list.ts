import { z } from 'zod'

const collectionId = z.enum(['content', 'writing', 'clipboard', 'works'])

/** `content.search()` returns section-level hits; `id` is `path` or `path#headingId` — strip the anchor to get the document path. */
function toDocPath(id: string) {
  return id.split('#')[0]!
}

export default defineMcpTool({
  name: 'content-list',
  title: 'List content',
  description:
    'Compact index of site pages, writing, clipboard notes, and works. Use to discover paths and stems before calling content-get.',
  group: 'content',
  annotations: { readOnlyHint: true, openWorldHint: false },
  inputSchema: {
    collections: z
      .array(collectionId)
      .optional()
      .describe('Collections to query. Omit to query all four.'),
    search: z
      .string()
      .optional()
      .describe('Full-text search across titles, headings, and body content (via FTS5), ranked by relevance.'),
    limitPerCollection: z
      .number()
      .min(1)
      .max(200)
      .default(120)
      .describe('Maximum rows per collection, applied after search filtering.'),
  },
  inputExamples: [
    { limitPerCollection: 80 },
    { collections: ['writing', 'works'], search: 'nuxt' },
  ],
  cache: '2m',
  handler: async ({ collections, search, limitPerCollection }) => {
    const want = collections ?? (['content', 'writing', 'clipboard', 'works'] as const)
    const q = search?.trim() ?? ''
    const likePattern = `%${q}%`

    // Full-text search (headings + body, not just title/description/tags) instead of
    // manual substring matching — `pages` are real markdown documents, so the
    // `sqliteFullTextSearch` plugin (ranked, indexes every heading) fits. `works` are
    // flat JSON records with no body/headings to index, so `sqlQuery` (a structured
    // `LIKE` scan across its fields) fits better there. Both plugins are configured
    // on the shared `content` instance in `server/utils/content.ts`.
    const [pagesHits, worksMatches] = q
      ? await Promise.all([
        content.search(['pages'], q, { limit: 500 }),
        content.query('works').orWhere(group => group
          .where('data.name', 'LIKE', likePattern)
          .where('data.description', 'LIKE', likePattern)
          .where('data.url', 'LIKE', likePattern)
          .where('data.category', 'LIKE', likePattern)
          .where('data.tags', 'LIKE', likePattern)).all(),
      ])
      : [null, null]
    const matchedPages = pagesHits && new Set(pagesHits.map(h => toDocPath(h.id)))
    const matchedWorks = worksMatches && new Set(worksMatches.map(r => r.path))

    const pages = await content.list(['pages'])
    const byPrefix = (prefix: string) =>
      pages.filter(p => p.path.startsWith(prefix)).sort((a, b) => byDateDesc(a.data, b.data))

    const out: Record<string, unknown> = {}

    for (const col of want) {
      if (col === 'works') {
        let rows = (await content.list(['works']))
          .sort((a, b) => byDateDesc(a.data, b.data))
        if (matchedWorks) rows = rows.filter(item => matchedWorks.has(item.path))
        out.works = rows.slice(0, limitPerCollection).map((item) => {
          const w = item.data
          return {
            stem: item.meta.stem,
            name: w.name,
            description: w.description,
            category: w.category,
            date: w.date,
            url: w.url,
            release: w.release,
            tags: w.tags,
          }
        })
        continue
      }

      const rows = col === 'content'
        ? pages.sort((a, b) => byDateDesc(a.data, b.data))
        : byPrefix(`/${col}/`)

      const filtered = (matchedPages ? rows.filter(r => matchedPages.has(r.path)) : rows).slice(0, limitPerCollection)

      // The `content` collection id must not become the output key: a top-level
      // `content` array makes the MCP toolkit mistake this object for an
      // already-built CallToolResult (which also has a `content` array) and skip
      // wrapping it, producing an invalid response. Use `pages` instead.
      const outKey = col === 'content' ? 'pages' : col
      out[outKey] = filtered.map((r) => {
        const { data } = r
        return {
          path: r.path,
          title: data.title,
          description: data.description,
          date: data.date,
          ...(data.tags ? { tags: data.tags } : {}),
        }
      })
    }

    return out
  },
})
