export const THING_CATEGORIES = ['wardrobe', 'tech', 'home', 'accessories'] as const

export type ThingCategory = typeof THING_CATEGORIES[number]

export const THING_CONCEPTS = ['dock', 'lookbook', 'wall', 'index', 'runway'] as const

export type ThingConcept = typeof THING_CONCEPTS[number]

export type ThingPrice = {
  amount: number
  currency: string
}

export type ThingItem = {
  stem: string
  slug: string
  name: string
  brand: string
  category: ThingCategory
  color?: string
  size?: string
  material?: string
  acquired?: string
  price: ThingPrice
  image: string
  images?: string[]
  note?: string
  url?: string
  affiliateUrl?: string
  featured?: boolean
  owned?: boolean
  order?: number
}

export const CATEGORY_LABEL: Record<ThingCategory | 'all', string> = {
  all: 'All',
  wardrobe: 'Wardrobe',
  tech: 'Tech',
  home: 'Home',
  accessories: 'Accessories',
}

export const CONCEPT_LABEL: Record<ThingConcept, string> = {
  dock: 'Dock',
  lookbook: 'Lookbook',
  wall: 'Wall',
  index: 'Index',
  runway: 'Runway',
}

export const CONCEPT_INDEX: Record<ThingConcept, string> = {
  dock: '01',
  lookbook: '02',
  wall: '03',
  index: '04',
  runway: '05',
}

export function formatPrice(price: ThingPrice) {
  const whole = Number.isInteger(price.amount)
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: price.currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(price.amount)
}

export function thingPath(item: { slug?: string, stem?: string }) {
  const slug = item.slug ?? item.stem?.split('/').pop()
  return `/things/${slug}`
}

export function thingHref(item: Pick<ThingItem, 'affiliateUrl' | 'url'>) {
  return item.affiliateUrl ?? item.url
}

export function thingNote(item: Pick<ThingItem, 'note'>) {
  const note = item.note?.trim()
  return note ? note : undefined
}

export function thingAlt(item: Pick<ThingItem, 'name' | 'brand'>) {
  return `${item.name}, ${item.brand}`
}

export function thingSpecs(item: ThingItem) {
  const rows: Array<[string, string]> = [
    ['Brand', item.brand],
    ['Use', CATEGORY_LABEL[item.category]],
    ['Material', item.material ?? ''],
    ['Colour', item.color ?? ''],
    ['Size', item.size ?? ''],
  ]
  return rows.filter(([, value]) => value)
}

export function thingConcept(value: unknown): ThingConcept {
  return typeof value === 'string' && THING_CONCEPTS.includes(value as ThingConcept)
    ? value as ThingConcept
    : 'dock'
}

export function sortThings<T extends { name: string, order?: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    const ao = a.order ?? 99
    const bo = b.order ?? 99
    if (ao !== bo) return ao - bo
    return a.name.localeCompare(b.name)
  })
}

export function inCategory(items: ThingItem[], category: ThingCategory | 'all') {
  if (category === 'all') return items
  return items.filter(item => item.category === category)
}

export function categoryCounts(items: ThingItem[]) {
  const counts: Record<ThingCategory | 'all', number> = {
    all: items.length,
    wardrobe: 0,
    tech: 0,
    home: 0,
    accessories: 0,
  }
  for (const item of items) counts[item.category] += 1
  return counts
}

export function isThingsPath(path: string) {
  return path === '/things' || path.startsWith('/things/')
}

export function adjacent(items: ThingItem[], slug: string) {
  const i = items.findIndex(item => item.slug === slug)
  if (i < 0 || items.length === 0) return { prev: undefined, next: undefined }
  const prev = items[(i - 1 + items.length) % items.length]
  const next = items[(i + 1) % items.length]
  return {
    prev: prev?.slug === slug ? undefined : prev,
    next: next?.slug === slug ? undefined : next,
  }
}

export function prefetchThingImages(items: ThingItem[]) {
  if (!import.meta.client) return
  for (const item of items) {
    const img = new Image()
    img.decoding = 'async'
    img.src = item.image
  }
}
