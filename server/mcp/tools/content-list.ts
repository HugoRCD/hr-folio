import { z } from 'zod'

const collectionId = z.enum(['content', 'writing', 'clipboard', 'works'])

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
      .describe('Case-insensitive filter on titles, descriptions, names, URLs, tags, category, and a prefix of markdown body.'),
    includeDrafts: z
      .boolean()
      .default(false)
      .describe('When true, include writing and clipboard entries marked draft.'),
    limitPerCollection: z
      .number()
      .min(1)
      .max(200)
      .default(120)
      .describe('Maximum rows per collection before search filtering.'),
  },
  inputExamples: [
    { includeDrafts: false, limitPerCollection: 80 },
    { collections: ['writing', 'works'], search: 'nuxt', includeDrafts: false },
  ],
  cache: '2m',
  handler: async ({ collections, search, includeDrafts, limitPerCollection }) => {
    const event = useEvent()
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

    const out: Record<string, unknown> = {}

    for (const col of want) {
      if (col === 'works') {
        let rows = await queryCollection(event, 'works')
          .order('date', 'DESC')
          .limit(limitPerCollection)
          .all()
        if (q) {
          rows = rows.filter(
            w =>
              match(w.name)
              || match(w.description)
              || match(w.url)
              || match(w.category)
              || matchTags(w.tags),
          )
        }
        out.works = rows.map(w => ({
          stem: w.stem,
          name: w.name,
          description: w.description,
          category: w.category,
          date: w.date,
          url: w.url,
          release: w.release,
          tags: w.tags,
        }))
        continue
      }

      let rows = await queryCollection(event, col)
        .order('date', 'DESC')
        .limit(limitPerCollection)
        .all()

      if ((col === 'writing' || col === 'clipboard') && !includeDrafts) {
        rows = rows.filter(r => !(r as { draft?: boolean }).draft)
      }

      if (q) {
        rows = rows.filter((r) => {
          const raw = typeof r.rawbody === 'string' ? r.rawbody : ''
          return (
            match(r.title)
            || match(r.description)
            || ('tags' in r && matchTags(r.tags))
            || match(raw.slice(0, 8000))
          )
        })
      }

      out[col] = rows.map((r) => ({
        path: r.path,
        title: r.title,
        description: r.description,
        date: r.date,
        ...('tags' in r && r.tags ? { tags: r.tags } : {}),
        ...((col === 'writing' || col === 'clipboard')
          ? { draft: Boolean((r as { draft?: boolean }).draft) }
          : {}),
      }))
    }

    return out
  },
})
