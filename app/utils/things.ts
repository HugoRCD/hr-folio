export const THING_ROOMS = ['wardrobe', 'apartment', 'desk', 'everyday'] as const

export type ThingRoom = typeof THING_ROOMS[number]

export type ThingPrice = {
  amount: number
  currency: string
}

export type ThingItem = {
  stem: string
  slug: string
  name: string
  brand: string
  room: ThingRoom
  category: string
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

export const ROOM_LABEL: Record<ThingRoom | 'all', string> = {
  all: 'All',
  wardrobe: 'Wardrobe',
  apartment: 'Apartment',
  desk: 'Desk',
  everyday: 'Everyday',
}

export function formatPrice(price: ThingPrice) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount)
}

export function thingPath(item: { slug?: string, stem?: string }) {
  const slug = item.slug ?? item.stem?.split('/').pop()
  return `/things/${slug}`
}

export function thingHref(item: Pick<ThingItem, 'affiliateUrl' | 'url'>) {
  return item.affiliateUrl ?? item.url
}

export function acquiredYear(acquired?: string) {
  if (!acquired) return undefined
  const year = acquired.match(/^\d{4}/)?.[0]
  return year
}

export function sortThings<T extends { name: string, order?: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    const ao = a.order ?? 99
    const bo = b.order ?? 99
    if (ao !== bo) return ao - bo
    return a.name.localeCompare(b.name)
  })
}

export function inRoom(items: ThingItem[], room: ThingRoom | 'all') {
  if (room === 'all') return items
  return items.filter(item => item.room === room)
}

export function neighbours(items: ThingItem[], slug: string, count = 3) {
  const current = items.find(item => item.slug === slug)
  if (!current) return items.filter(item => item.slug !== slug).slice(0, count)
  const rest = items.filter(item => item.slug !== slug)
  const same = rest.filter(item => item.room === current.room)
  const other = rest.filter(item => item.room !== current.room)
  return [...same, ...other].slice(0, count)
}
