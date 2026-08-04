import { z } from 'zod'

const collectionId = z.enum(['content', 'writing', 'clipboard', 'works'])

function byDateDesc(a: { date?: string }, b: { date?: string }) {
  return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
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
      .describe('Case-insensitive filter on titles, descriptions, names, URLs, tags, category, and a prefix of the markdown body.'),
    limitPerCollection: z
      .number()
      .min(1)
      .max(200)
      .default(120)
      .describe('Maximum rows per collection before search filtering.'),
  },
  inputExamples: [
    { limitPerCollection: 80 },
    { collections: ['writing', 'works'], search: 'nuxt' },
  ],
  cache: '2m',
  handler: async ({ collections, search, limitPerCollection }) => {
    const want = collections ?? (['content', 'writing', 'clipboard', 'works'] as const)
    const q = search?.trim().toLowerCase() ?? ''

    const match = (text: string | null | undefined) => {
      if (!q) return true
      return (text ?? '').toLowerCase().includes(q)
    }

    const matchTags = (tags: string[] | undefined) => {
      if (!q) return true
      if (!tags?.length) return false
      return tags.some(t => t.toLowerCase().includes(q))
    }

    const pages = await cms.list(['pages'])
    const byPrefix = (prefix: string) =>
      pages.filter(p => p.path.startsWith(prefix)).sort((a, b) => byDateDesc(a.data as PageData, b.data as PageData))

    const out: Record<string, unknown> = {}

    for (const col of want) {
      if (col === 'works') {
        let rows = (await cms.list(['works']))
          .sort((a, b) => byDateDesc(a.data as WorkData, b.data as WorkData))
          .slice(0, limitPerCollection)
        if (q) {
          rows = rows.filter((item) => {
            const w = item.data as WorkData
            return match(w.name) || match(w.description) || match(w.url) || match(w.category) || matchTags(w.tags)
          })
        }
        out.works = rows.map((item) => {
          const w = item.data as WorkData
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
        ? pages.sort((a, b) => byDateDesc(a.data as PageData, b.data as PageData)).slice(0, limitPerCollection)
        : byPrefix(`/${col}/`).slice(0, limitPerCollection)

      const filtered = q
        ? await Promise.all(rows.map(async (r) => {
          const data = r.data as PageData
          if (match(data.title) || match(data.description) || matchTags(data.tags)) return r
          const full = await cms.get(r.path)
          return plainTextFromNodes(full?.nodes).slice(0, 8000).toLowerCase().includes(q) ? r : null
        })).then(rows => rows.filter((r): r is NonNullable<typeof r> => r !== null))
        : rows

      // The `content` collection id must not become the output key: a top-level
      // `content` array makes the MCP toolkit mistake this object for an
      // already-built CallToolResult (which also has a `content` array) and skip
      // wrapping it, producing an invalid response. Use `pages` instead.
      const outKey = col === 'content' ? 'pages' : col
      out[outKey] = filtered.map((r) => {
        const data = r.data as PageData
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
