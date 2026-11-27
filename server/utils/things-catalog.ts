import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { CATEGORY_LABEL, EVERYDAY_LABEL, NUMERALS, formatPrice, sortThings, thingHref, thingPath, type ThingItem, type ThingSort } from '#shared/utils/things'

// The /things inventory for agents: the same pieces, in the same curated order and sections as the
// page (every day first, then each use), with absolute links. Read by /things.md and the things-list
// MCP tool, so both always say what the page says.
export async function thingsCatalog(event: H3Event, sort: ThingSort = 'curated') {
  const { folio } = useRuntimeConfig(event)
  const site = folio.seo.url.replace(/\/$/, '')
  const rows = await queryCollection(event, 'things').all() as unknown as ThingItem[]
  const items = sortThings(rows.filter(item => item.owned !== false), sort).map(item => ({
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    category: item.category,
    section: sort === 'curated' && item.featured ? EVERYDAY_LABEL : CATEGORY_LABEL[item.category],
    everyday: Boolean(item.featured),
    price: item.price,
    priceLabel: formatPrice(item.price),
    color: item.color,
    material: item.material,
    size: item.size,
    page: `${site}${thingPath(item)}`,
    image: `${site}${item.image}`,
    shop: thingHref(item),
  }))
  return { site, items }
}

export function thingsMarkdown({ site, items }: Awaited<ReturnType<typeof thingsCatalog>>) {
  const lines = [
    '# Things',
    '',
    `The objects Hugo Richard owns and uses, ${items.length} of them, as listed at ${site}/things. The pieces he wears or carries every day come first, then each use. Prices are retail prices in GBP.`,
    '',
  ]
  let section = ''
  let n = 0
  for (const item of items) {
    if (item.section !== section) {
      ({ section } = item)
      lines.push(`## ${NUMERALS[n++]}. ${section}`, '')
    }
    lines.push(`- [${item.name}](${item.page}), ${item.brand}, ${item.priceLabel}`)
    if (item.color) lines.push(`  - Colour: ${item.color}`)
    if (item.size) lines.push(`  - Size: ${item.size}`)
    if (item.material) lines.push(`  - Material: ${item.material}`)
    if (item.shop) lines.push(`  - Shop: ${item.shop}`)
    lines.push(`  - Image: ${item.image}`)
  }
  lines.push('')
  return lines.join('\n')
}
