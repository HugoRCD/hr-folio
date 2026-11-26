export const THING_CATEGORIES = ['wardrobe', 'tech', 'home', 'accessories'] as const

export type ThingCategory = typeof THING_CATEGORIES[number]

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

export function formatAcquired(acquired?: string) {
  if (!acquired) return undefined
  const iso = acquired.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const date = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00Z`)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  }
  return acquired
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
