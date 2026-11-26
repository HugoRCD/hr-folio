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

export type StudioPose = {
  slug: string
  x: number
  y: number
  width: number
  height: number
  scale: number
  z: number
  group: ThingCategory
  groupStart: boolean
}

export const CATEGORY_LABEL: Record<ThingCategory | 'all', string> = {
  all: 'All',
  wardrobe: 'Wardrobe',
  tech: 'Tech',
  home: 'Home',
  accessories: 'Accessories',
}

const HERO_SLUGS = new Set([
  'cartier-santos-dumont',
  'suitsupply-black-overcoat',
  'ferrari-jacquard-silk-tie-prancing-horse-rubino',
  'fujifilm-x100vi',
  'daals-sveti-black-curved-glass-coffee-table',
  'myrqvist-stenhammar-ii-black-calf',
  'herman-miller-sayl-black-pitch',
  'daals-maru-oak-dining-table',
  'charles-leclerc-knit-crewneck-sweater',
  'puma-scuderia-ferrari-2025-drivers-tee',
  'drmartens-2976-mono-chelsea-boots-black',
])

const SMALL_SLUGS = new Set([
  'ultrahuman-ring-air-raw-titanium',
  'suitsupply-black-belt',
  'suitsupply-black-silk-tie',
  'suitsupply-brown-silk-tie',
  'suitsupply-burgundy-silk-tie',
  'apple-finewoven-magsafe-wallet-black',
])

const ACCESSORY_LEAD = [
  'cartier-santos-dumont',
  'ferrari-jacquard-silk-tie-prancing-horse-rubino',
  'hermes-tournis-tresse-bracelet',
  'montblanc-horseshoe-buckle-leather-belt',
]

const WAVE = [0, -1, 0.55, -0.35, 0.9, -0.7, 0.25, -1.1, 0.7, -0.2]

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

function slotAspect(item: ThingItem) {
  if (item.slug.includes('tie')) return 0.3
  if (item.slug.includes('belt')) return 1.2
  if (item.slug.includes('bracelet') || item.slug.includes('ring') || item.slug.includes('wallet')) return 0.95
  if (item.slug.includes('stenhammar') || item.slug.includes('xt-4') || item.slug.includes('boots')) return 1.18
  if (item.slug.includes('santos') || item.slug.includes('x100vi')) return 0.78
  if (item.slug.includes('overcoat') || item.slug.includes('bomber')) return 0.5
  if (item.slug.includes('trousers') || item.slug.includes('jeans')) return 0.42
  return 0.72
}

export function thingScale(item: ThingItem) {
  if (HERO_SLUGS.has(item.slug)) return 1
  if (item.slug === 'hermes-tournis-tresse-bracelet' || item.slug === 'montblanc-horseshoe-buckle-leather-belt') return 0.52
  if (SMALL_SLUGS.has(item.slug)) return 0.36
  if (item.slug.includes('overcoat') || item.slug.includes('bomber')) return 0.9
  if (item.slug.includes('boots') || item.slug.includes('xt-4') || item.slug.includes('stenhammar')) return 0.82
  if (item.slug.includes('table') || item.slug.includes('chair') || item.slug.includes('sayl')) return 0.84
  if (item.slug.includes('trousers') || item.slug.includes('jeans')) return 0.78
  if (item.category === 'home') return 0.56
  if (item.category === 'tech') return 0.7
  if (item.category === 'wardrobe') return 0.68
  return 0.48
}

function presence(item: ThingItem) {
  if (HERO_SLUGS.has(item.slug)) return 0
  if (SMALL_SLUGS.has(item.slug)) return 3
  const scale = thingScale(item)
  if (scale >= 0.8) return 1
  return 2
}

export function composeStudio(items: ThingItem[], stageH: number): { poses: StudioPose[], width: number } {
  const height = Math.max(stageH, 420)
  const grouped: ThingItem[] = []
  for (const cat of THING_CATEGORIES) {
    const members = items
      .filter(item => item.category === cat)
      .sort((a, b) => {
        if (cat === 'accessories') {
          const ai = ACCESSORY_LEAD.indexOf(a.slug)
          const bi = ACCESSORY_LEAD.indexOf(b.slug)
          const ao = ai === -1 ? 50 : ai
          const bo = bi === -1 ? 50 : bi
          if (ao !== bo) return ao - bo
        }
        return presence(a) - presence(b) || (a.order ?? 0) - (b.order ?? 0)
      })
    grouped.push(...members)
  }

  const poses: StudioPose[] = []
  let x = 88
  let lastGroup: ThingCategory | undefined
  const manyGroups = new Set(grouped.map(item => item.category)).size > 1

  grouped.forEach((item, index) => {
    const scale = thingScale(item)
    const h = height * (0.54 * scale + 0.08)
    const w = Math.max(h * slotAspect(item), 64)
    const groupStart = manyGroups && item.category !== lastGroup
    if (groupStart && lastGroup) x += 108
    else if (scale >= 0.95) x += 28
    const wave = WAVE[index % WAVE.length]
    const stand = height * 0.78
    const y = stand - h + wave * height * 0.045
    poses.push({
      slug: item.slug,
      x,
      y,
      width: w,
      height: h,
      scale,
      z: Math.round(scale * 20),
      group: item.category,
      groupStart,
    })
    lastGroup = item.category
    x += w + 32 + scale * 18
  })

  return { poses, width: x + 120 }
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

export function studioSequence(items: ThingItem[]) {
  const { poses } = composeStudio(items, 640)
  const bySlug = new Map(items.map(item => [item.slug, item]))
  return poses.map(pose => bySlug.get(pose.slug)).filter((item): item is ThingItem => Boolean(item))
}

export function nearestPose(poses: StudioPose[], viewLeft: number, viewWidth: number) {
  const center = viewLeft + viewWidth / 2
  let best = 0
  let dist = Infinity
  poses.forEach((pose, i) => {
    const d = Math.abs(pose.x + pose.width / 2 - center)
    if (d < dist) {
      dist = d
      best = i
    }
  })
  return best
}
