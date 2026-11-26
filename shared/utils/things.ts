export const THING_CATEGORIES = ['wardrobe', 'tech', 'home', 'accessories'] as const

export type ThingCategory = typeof THING_CATEGORIES[number]

export const THING_VIEWS = ['list', 'lookbook'] as const

export type ThingView = typeof THING_VIEWS[number]

export const THING_SORTS = ['curated', 'price-desc', 'price-asc', 'brand'] as const

export type ThingSort = typeof THING_SORTS[number]

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

// the sections of the inventory are numbered like the hours on the dial
export const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

// what is worn or carried every day comes first, in the order it was picked
export const EVERYDAY_LABEL = 'Every day'

export const VIEW_LABEL: Record<ThingView, string> = {
  list: 'Index',
  lookbook: 'Lookbook',
}

export const SORT_LABEL: Record<ThingSort, string> = {
  curated: 'By Category',
  'price-desc': 'Price: High to Low',
  'price-asc': 'Price: Low to High',
  brand: 'Brand A-Z',
}

export const SORT_SHORT: Record<ThingSort, string> = {
  curated: 'By Category',
  'price-desc': 'High to Low',
  'price-asc': 'Low to High',
  brand: 'Brand A-Z',
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

export function thingView(value: unknown): ThingView {
  return value === 'lookbook' ? 'lookbook' : 'list'
}

export function thingSort(value: unknown): ThingSort {
  return typeof value === 'string' && THING_SORTS.includes(value as ThingSort)
    ? value as ThingSort
    : 'curated'
}

const CATEGORY_RANK: Record<string, number> = {
  wardrobe: 0,
  tech: 1,
  home: 2,
  accessories: 3,
}

export function sortThings<T extends {
  name: string
  brand?: string
  category?: string
  featured?: boolean
  order?: number
  price?: { amount: number }
}>(items: T[], sort: ThingSort = 'curated') {
  const rows = [...items]
  if (sort === 'price-desc') {
    return rows.sort((a, b) => (b.price?.amount ?? 0) - (a.price?.amount ?? 0) || a.name.localeCompare(b.name))
  }
  if (sort === 'price-asc') {
    return rows.sort((a, b) => (a.price?.amount ?? 0) - (b.price?.amount ?? 0) || a.name.localeCompare(b.name))
  }
  if (sort === 'brand') {
    return rows.sort((a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name))
  }
  return rows.sort((a, b) => {
    const fr = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    if (fr) return fr
    if (a.featured && b.featured) return (a.order ?? 99) - (b.order ?? 99)
    const cr = (CATEGORY_RANK[a.category ?? ''] ?? 9) - (CATEGORY_RANK[b.category ?? ''] ?? 9)
    if (cr) return cr
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
