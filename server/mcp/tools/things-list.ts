import { z } from 'zod'
import { THING_CATEGORIES, THING_SORTS } from '#shared/utils/things'

export default defineMcpTool({
  name: 'things-list',
  title: 'List things',
  description:
    'Every object Hugo owns, as on /things: name, brand, use, section (Every day first, then each use), price in GBP, colour, material, size, and absolute page, image and shop URLs. Filter by use or text, or sort by price or brand. The same list is at /things.md.',
  group: 'content',
  annotations: { readOnlyHint: true, openWorldHint: false },
  inputSchema: {
    category: z
      .enum(THING_CATEGORIES)
      .optional()
      .describe('Only one use. Omit for all.'),
    everyday: z
      .boolean()
      .optional()
      .describe('true for only the pieces Hugo wears or carries every day.'),
    search: z
      .string()
      .optional()
      .describe('Case-insensitive filter on name, brand, colour and material.'),
    sort: z
      .enum(THING_SORTS)
      .default('curated')
      .describe('curated is the page order: every day first, then each use in Hugo\'s order.'),
  },
  inputExamples: [
    {},
    { everyday: true },
    { category: 'accessories', sort: 'price-desc' },
    { search: 'watch' },
  ],
  cache: '5m',
  handler: async ({ category, everyday, search, sort }) => {
    const { site, items } = await thingsCatalog(useEvent(), sort)
    const q = search?.trim().toLowerCase()
    const rows = items.filter(item =>
      (!category || item.category === category)
      && (everyday === undefined || item.everyday === everyday)
      && (!q || [item.name, item.brand, item.color, item.material].some(v => v?.toLowerCase().includes(q))))
    return { index: `${site}/things`, markdown: `${site}/things.md`, count: rows.length, things: rows }
  },
})
