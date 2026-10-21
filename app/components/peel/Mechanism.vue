<script setup lang="ts">
// The mechanism under the page. Everything on the page that moves by itself sits over the part
// that moves it, at the same place: lifting the paper shows what is behind what you were reading.
//   1 the movement, under the hour: its hands under the figures, its 24-hour wheel, which carries
//     a sun round once a day, under the sun beside the hour
//   2 the cam, turned with it, cut to the shape of today's sun: a lobe for the day
//   3 the rack that rides the cam, and the dial its pinion turns: the sun's height over the
//     horizon, which lights the page
//   4 the rod down the sheet's edge, the lever it moves, and the day and night disc the lever
//     turns, under the light dot: while the page follows the sun the disc turns with it; set by
//     hand, the lever is thrown off the rod to day or night and held there by its jumper
//   5 the Geneva wheel under the detail sheets: four slots, one level a step
//   6 the barrel under the ∞: wound, and held by its click, so it only ever turns one way
//   7 under the portrait, its negative: the same picture on film, light and dark swapped
//   8 above the sound button, the chime: the button pushes its slide, and it strikes two notes
// Measured from the live page each time the drawing underneath is made; the balloons are then
// placed where they cover the least.
import { localInstant, sunAt } from '~/utils/daylight'
import { angles, C, circle, D, mesh, pitch, polar, toothed, VIEW } from '~/utils/movement'

type Pt = { x: number, y: number }
const { uncovered = [], running = false } = defineProps<{ uncovered?: string[], running?: boolean }>()
const has = (id: string) => uncovered.includes(id)

type Place = { lat: number, lon: number, timeZone: string }
const daylight = useState<{ time: string, phase: string, elevation: number, place: Place } | undefined>('daylight')
const preview = useState<number | null>('daylight-at', () => null)
const manual = useState<boolean>('daylight-manual', () => false)
const detail = useState<number>('detail', () => 3)
const colorMode = useColorMode()

// The lever and the Geneva wheel are moved by hand, from the page above them, out of sight: the page
// is not lifted for them, they are in their new place for whoever lifts the corner
const shown = reactive({ dark: colorMode.value === 'dark', manual: manual.value, detail: detail.value })
watch([() => colorMode.value, manual], ([mode, byHand]) => {
  shown.dark = mode === 'dark'
  shown.manual = byHand
})
watch(detail, level => (shown.detail = level))

const VB = VIEW.split(' ').map(Number) as [number, number, number, number]
const CD = { x: D.x - C.x, y: D.y - C.y }
const deg = (rad: number) => (rad * 180) / Math.PI

// the cam and what rides it, in px: the cam stays inside the root of the wheel it is fixed to
const R_MIN = 6.5
const R_MAX = 13.5
const RR = 2.4 // the roller
const TRAVEL = R_MAX - R_MIN
const RACK = 46 // the rack's length
const DR = 20 // the sun's dial
const THROW = 6 // how far past the rod's travel the lever is thrown by hand
const DISC = 6.5 // the day and night disc, the size of the dot above it
const GENEVA = 24 // centre distance; the crank and the star both reach a·sin 45°

type Layout = {
  w: number
  h: number
  clock: {
    hour: Pt
    k: number
    rot: number
    width: number
    origin: Pt
    sun: Pt
    idler: Pt
    wheel: Pt
    /** what lies above: the sun beside the hour, and the hour's figures */
    icon: Pt
    figures: { l: number, r: number, t: number, b: number }
  } | null
  rodX: number | null
  hand: Pt | null
  geneva: Pt | null
  barrel: Pt | null
  /** the portrait's negative, drawn where the portrait is above */
  plate: (Pt & { w: number, h: number, src: string }) | null
  /** the chime, above the sound button */
  sound: Pt | null
}
const L = shallowRef<Layout | null>(null)

function measure(root: HTMLElement) {
  const base = root.getBoundingClientRect()
  const find = (sel: string) => {
    const el = document.querySelector(`.paper ${sel}`)
    const r = el?.getBoundingClientRect()
    if (!r?.width) return null
    return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2, right: r.right - base.left }
  }
  const hour = find('[data-mech="hour"]')
  const sun = find('[data-mech="sun"]')
  const local = (sel: string) => {
    const r = document.querySelector(`.paper ${sel}`)?.getBoundingClientRect()
    return r ? { l: r.left - base.left, r: r.right - base.left, t: r.top - base.top, b: r.bottom - base.top } : null
  }
  const iconBox = local('[data-mech="sun"]')
  const figures = local('[data-mech="hour"]')
  const edge = find('footer .in-note')
  let clock: Layout['clock'] = null
  if (hour && sun && iconBox && figures) {
    // the plan turned and scaled so the centre arbor is under the figures, the 24-hour wheel under the sun
    const v = { x: sun.x - hour.x, y: sun.y - hour.y }
    const k = Math.min(1.6, Math.max(0.6, Math.hypot(v.x, v.y) / Math.hypot(CD.x, CD.y)))
    const rot = Math.atan2(v.y, v.x) - Math.atan2(CD.y, CD.x)
    const dx = CD.x * k
    const dy = CD.y * k
    const at = { x: hour.x + dx * Math.cos(rot) - dy * Math.sin(rot), y: hour.y + dx * Math.sin(rot) + dy * Math.cos(rot) }
    // the cam's arbor, below, driven 1:1 through an idler so it turns with the 24-hour wheel
    const idler = polar(at, (pitch(40) + pitch(30)) * k, 60)
    const wheel = polar(idler, (pitch(30) + pitch(40)) * k, 120)
    clock = {
      hour: { x: hour.x, y: hour.y },
      k,
      rot,
      width: VB[2] * k,
      origin: { x: (C.x - VB[0]) * k, y: (C.y - VB[1]) * k },
      sun: at,
      idler,
      wheel,
      icon: { x: iconBox.l, y: iconBox.t },
      figures,
    }
  }
  const hand = find('[data-mech="by-hand"]')
  L.value = {
    w: base.width,
    h: base.height,
    clock,
    rodX: clock && hand && edge ? Math.min(base.width - 10, edge.right + 18) : null,
    hand,
    geneva: find('[data-mech="detail"]'),
    barrel: find('main [data-construct="infinity"]'),
    // under the photo: only on a wide sheet, where the plate is large
    plate: (() => {
      const f = local('[data-construct="figure"]')
      const src = document.querySelector<HTMLImageElement>('img[data-construct="figure"]')?.currentSrc
      return f && src && window.innerWidth >= 1024 ? { x: (f.l + f.r) / 2, y: (f.t + f.b) / 2, w: f.r - f.l, h: f.b - f.t, src } : null
    })(),
    sound: find('[data-mech="sound"]'),
  }
}

// --- the plate: the portrait's negative -------------------------------------------------------
// The picture above as it sits on a square frame of roll film, seen on a light box: where the
// photo is light the film is dense, where it is dark the film is clear. The film runs a little past
// the frame either side, with its maker's line and the frame number printed in the edges.
const REBATE = 12 // the film's edge above and below the frame
const RUN = 18 // how far the strip runs past the frame before it was cut
const neg = computed(() => {
  const p = L.value?.plate
  if (!p) return null
  const fx = p.x - p.w / 2
  const fy = p.y - p.h / 2
  return { fx, fy, fw: p.w, fh: p.h, x: fx - RUN, y: fy - REBATE, w: p.w + RUN * 2, h: p.h + REBATE * 2 }
})

// --- the repeater, above the sound button ------------------------------------------------------
// Drawn in the empty margin above the button, at a size it can be read. The button pushes a slide
// up; the slide's rack turns the strike train, and as it runs back down the train lifts the
// hammers onto two gongs, held to an even pace by the governor. In the repeater's own units, its
// gongs' centre at 0 0, the button straight below at 24 118.
const { enabled: soundOn } = useHoverSound()
const repeater = useRepeater()
const GONG_HIGH = 34
const GONG_LOW = 39
const HEEL = 64 // where both gongs are held, the bearing of the heel block
const GAP = 40 // the gongs stop here, short of the heel, to let the slide in
const SLIDE_X = 24
const BUTTON_Y = 118
const STROKE = 10 // how far the button pushes the slide
const RP = 5 // the strike pinion the rack turns
const PINION = { x: SLIDE_X - 2 - RP - 0.6, y: 8 }
const GOV = polar(PINION, 11 + 3.2, 205) // the governor's arbor, off the strike wheel
const gongArc = (r: number) => {
  const a = polar({ x: 0, y: 0 }, r, HEEL)
  const b = polar({ x: 0, y: 0 }, r, GAP)
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)}A${r} ${r} 0 1 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}
const heel = (() => {
  const c = [GONG_HIGH - 2, GONG_LOW + 2].flatMap(r => [polar({ x: 0, y: 0 }, r, HEEL - 1), polar({ x: 0, y: 0 }, r, HEEL + 5)])
  return `M${c[0]!.x.toFixed(2)} ${c[0]!.y.toFixed(2)}L${c[2]!.x.toFixed(2)} ${c[2]!.y.toFixed(2)}L${c[3]!.x.toFixed(2)} ${c[3]!.y.toFixed(2)}L${c[1]!.x.toFixed(2)} ${c[1]!.y.toFixed(2)}Z`
})()
// each hammer lies along its gong, pivoted behind its head, so a turn takes the head straight off
// the wire; between blows it is held off by its spring
const hammers = ([['low', GONG_LOW, 82, 108], ['high', GONG_HIGH, 104, 134]] as const).map(([gong, r, at, from]) => {
  const head = polar({ x: 0, y: 0 }, r - 2.6, at)
  const pivot = polar({ x: 0, y: 0 }, r - 7, from)
  const v = { x: head.x - pivot.x, y: head.y - pivot.y }
  // which way round the pivot takes the head towards the centre
  const away = v.x * -head.y - v.y * -head.x > 0 ? 1 : -1
  const spring = polar(pivot, 7, deg(Math.atan2(v.y, v.x)) + 180)
  return { gong, pivot, v, rest: 11 * away, spring }
})
// the slide: pushed home quickly, then let run back over the whole strike
const slide = reactive({ at: 0, s: 0.35, ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)' })
let release: ReturnType<typeof setTimeout> | undefined
watch(repeater.striking, (on) => {
  clearTimeout(release)
  if (!on) {
    Object.assign(slide, { at: 0, s: 0.4, ease: 'ease-out' })
    return
  }
  Object.assign(slide, { at: STROKE, s: 0.35, ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)' })
  release = setTimeout(() => Object.assign(slide, { at: 0, s: repeater.length.value + 0.2, ease: 'linear' }), repeater.lead * 1000)
})
onBeforeUnmount(() => clearTimeout(release))
const rep = computed(() => {
  const s = L.value?.sound
  if (!s) return null
  // a little smaller on a phone, where the margin is narrow
  const k = (L.value?.w ?? 1024) < 640 ? 0.85 : 1.25
  return { k, o: { x: s.x - SLIDE_X * k, y: s.y - BUTTON_Y * k } }
})
const slideMove = computed(() => ({ transform: `translateY(${-slide.at}px)`, transition: `transform ${slide.s}s ${slide.ease}` }))
const pinionTurn = computed(() => ({ transform: `translate(${PINION.x}px, ${PINION.y}px) rotate(${deg(-slide.at / RP).toFixed(2)}deg)`, transition: `transform ${slide.s}s ${slide.ease}` }))
// pushed by hand under the page, it strikes too: heard if the sound is on, else only seen
function pushSlide() {
  repeater.chime(!soundOn.value)
}

// --- the hour, and today's sun ----------------------------------------------------------------

const hourSec = computed(() => {
  const [h = 0, m = 0] = (daylight.value?.time ?? '12:00').split(':').map(Number)
  return h * 3600 + m * 60
})
const day = computed(() => {
  const place = daylight.value?.place
  if (!place?.timeZone) return null
  const midnight = localInstant('0:00', place.timeZone).getTime()
  const els = Array.from({ length: 97 }, (_, i) => sunAt(new Date(midnight + i * 900000), place).elevation)
  return { els, top: Math.max(...els) }
})
// the cam's radius for a sun height: smallest at night, largest at the day's top, so the day is
// the cam's lobe and the rack goes down as the sun goes up
const radius = (e: number, top: number) => R_MIN + ((Math.min(top, Math.max(-18, e)) + 18) / (top + 18)) * TRAVEL
// the cam's radius every quarter of an hour, eased where the night's flat meets the slope so the
// roller rides it without a corner (a cutter would leave it so)
const radii = computed(() => {
  if (!day.value) return []
  const { els, top } = day.value
  const ease = (r: number[]) => r.map((_, i) => [-3, -2, -1, 0, 1, 2, 3].reduce((sum, k) => sum + r[(i + k + 96) % 96]!, 0) / 7)
  return ease(ease(els.slice(0, 96).map(e => radius(e, top))))
})
const camAt = (f: number) => {
  const r = radii.value
  if (!r.length) return R_MIN
  const x = (((f % 1) + 1) % 1) * 96
  const i = Math.floor(x)
  return r[i % 96]! + (r[(i + 1) % 96]! - r[i % 96]!) * (x - i)
}
const camPath = computed(() => {
  const r = radii.value
  if (!r.length) return ''
  // the point at the roller (straight below the arbor) at hour h, once the cam is turned to h
  return `M${r.map((rad, i) => {
    const a = Math.PI / 2 - (Math.PI * 2 * i) / 96
    return `${(rad * Math.cos(a)).toFixed(2)} ${(rad * Math.sin(a)).toFixed(2)}`
  }).join('L')}Z`
})

const state = computed(() => {
  const c = L.value?.clock
  if (!c || !day.value) return null
  const f = hourSec.value / 86400
  const r = camAt(f)
  const roller = c.wheel.y + r + RR
  const u = (r - R_MIN) / TRAVEL // 0 at night, 1 at the day's top
  // the 24-hour wheel as the page sees it, and the idler and cam wheel it drives
  const dAngle = angles(0, hourSec.value, true).D + c.rot
  const iAngle = -dAngle * (40 / 30) + mesh(c.sun, c.idler, 40, 30)
  const wAngle = -iAngle * (30 / 40) + mesh(c.idler, c.wheel, 30, 40)
  return { f, roller, offset: roller - (c.wheel.y + R_MIN + RR), u, iAngle, wAngle }
})

// the lever: its long arm on the rod's pin while the sun is in charge, thrown past either end of
// the rod's travel by hand; its short arm turns the disc under the dot, day up or night up
const lever = computed(() => {
  const h = L.value?.hand
  const x = L.value?.rodX
  if (!h || !x || !state.value) return null
  const pivot = { x: h.x + DISC + 9.5, y: h.y }
  const end = { x, y: h.y + (shown.manual ? (shown.dark ? -THROW : TRAVEL + THROW) : state.value.offset) }
  const a = Math.atan2(end.y - pivot.y, end.x - pivot.x)
  const tip = { x: pivot.x - 8 * Math.cos(a), y: pivot.y - 8 * Math.sin(a) }
  // following the sun the disc turns with it, never quite all the way; by hand it is day or night
  const disc = shown.manual ? (shown.dark ? 180 : 0) : 150 - 120 * (state.value.offset / TRAVEL)
  return { pivot, end, tip, disc, pin: { x, y: h.y + state.value.offset } }
})

// The sun's dial. The pinion turns the hand through the day's whole range, −18° to the day's top,
// for the rack's whole travel: its radius is cut for today. The hand is the sun's height over a
// horizon drawn level, the ground hatched below it, as on an altitude quadrant.
const dial = computed(() => {
  const c = L.value?.clock
  if (!c || !day.value || !state.value) return null
  const top = Math.round(day.value.top)
  const span = ((top + 18) * Math.PI) / 180
  const rp = TRAVEL / span
  const o = { x: c.wheel.x + 1 + rp, y: c.wheel.y + R_MAX + RR + 30 }
  const e = -18 + state.value.u * (top + 18)
  const arc = (from: number, to: number) => {
    const a = polar(o, DR, -from)
    const b = polar(o, DR, -to)
    return `M${a.x.toFixed(2)} ${a.y.toFixed(2)}A${DR} ${DR} 0 0 0 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
  }
  const hatch = Array.from({ length: 6 }, (_, i) => o.x + 6 + i * 3).map(x => `M${x} ${o.y + 0.8}l-2.4 2.4`).join('')
  return {
    o,
    rp,
    top,
    pinion: -deg(state.value.offset / rp),
    hand: -e,
    sky: arc(0, top),
    below: arc(-18, 0),
    horizon: `M${o.x} ${o.y}H${o.x + DR + 5}`,
    hatch,
    marks: [-18, top].map(m => ({ m, tick: (() => {
      const a = polar(o, DR - 2, -m)
      const b = polar(o, DR + 2, -m)
      return `M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`
    })(), label: polar(o, DR + 5, -m) })),
  }
})
const sunRays = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4
  return `M${(3.6 * Math.cos(a)).toFixed(2)} ${(3.6 * Math.sin(a)).toFixed(2)}L${(5.4 * Math.cos(a)).toFixed(2)} ${(5.4 * Math.sin(a)).toFixed(2)}`
}).join('')


// --- drawing helpers --------------------------------------------------------------------------

const tf = (p: Pt, rotDeg = 0, scale = 1) => ({ transform: `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px) rotate(${rotDeg.toFixed(3)}deg) scale(${scale})` })
const at = (p: Pt, d: number, a: number) => polar(p, d, a)

// --- the balloons -------------------------------------------------------------------------------
// The part's number in a circle, its leader drawn to the part, and beside it what the part is and
// what it does. Each is placed, once the parts are drawn, where it covers the least: not the
// parts, not the copy of the page around them, not another balloon, and inside the window.
const NAMES: Record<number, [string, string, string]> = {
  1: ['Movement', 'keeps the time', 'clock'],
  2: ['Cam', 'today\'s sun', 'clock'],
  3: ['Sun\'s height', 'lights the page', 'clock'],
  4: ['Lever and disc', 'light or dark', 'hand'],
  5: ['Geneva wheel', 'level of detail', 'geneva'],
  6: ['Barrel', 'the mainspring', 'barrel'],
  7: ['Plate 1', 'the negative', 'plate'],
  8: ['Chime', 'two notes', 'sound'],
}
// Each balloon is also a pin: pointed at or tapped, it says in two plain sentences why the part
// is there, and where to read more. Only under the sheet: the page above explains nothing.
const STORY = '/writing/how-i-redrew-my-portfolio'
const WHY: Record<number, [string, string]> = {
  1: ['Keeps the time at the top of the page, at 21,600 beats an hour, like the Santos-Dumont I wear.', 'underneath'],
  2: ['Its outline is today\'s sun where I am. The raised part is the daylight.', 'light'],
  3: ['Reads how high the sun is from the cam. That sets how light or dark the page is.', 'light'],
  4: ['Moved by the dot in the footer. It sets the page to light or dark, or back to following the sun.', 'light'],
  5: ['Turned by the four sheets in the footer. Each level of detail moves it a quarter turn.', 'sheet'],
  6: ['Holds the spring that drives the movement. Its click lets it turn one way only, so it sits under the ∞.', 'infinity'],
  7: ['The portrait as it sits on film, before it is printed: what is light above is dark here.', 'light'],
  8: ['Pushed by the sound button. It strikes two notes, then again every quarter hour while the sound is on.', 'underneath'],
}
const pinned = ref<number | null>(null)
let unpin: ReturnType<typeof setTimeout> | undefined
function pin(n: number | null) {
  clearTimeout(unpin)
  pinned.value = n
}
const leave = () => {
  clearTimeout(unpin)
  unpin = setTimeout(() => (pinned.value = null), 260)
}
watch(() => running, (on) => {
  if (!on) pin(null)
})
// The note goes where it is wholly off the paper and inside the window, covering as few of the
// parts as it can: below, above or beside its balloon, whichever does best.
const fold = useState<{ m: Pt, n: Pt } | null>('peel-fold', () => null)
const mroot = useTemplateRef<HTMLElement>('mroot')
const W = 200
// from the note's corner to the centre of its number, which sits on the balloon: close at the
// side, so the note stops short of the balloon's own label
const RX = 13
const RY = 17
const cardEl = useTemplateRef<HTMLElement>('cardEl')
const cardH = ref(120)
const card = computed(() => {
  const b = spots.value.find(s => s.n === pinned.value)
  const why = pinned.value === null ? undefined : WHY[pinned.value]
  const root = mroot.value
  if (!b || !why || !L.value || !root) return null
  const base = root.getBoundingClientRect()
  const parts = [...root.querySelectorAll<Element>('g.part:not(.balloon) > *, .movement-at')]
    .map(el => el.getBoundingClientRect()).filter(r => r.width && r.height)
  // the balloons' own words stay readable while a note is open: the note keeps off them
  const words = [...root.querySelectorAll<Element>('.balloon :is(.name, .note)')]
    .map(el => el.getBoundingClientRect()).filter(r => r.width && r.height)
  const f = fold.value
  const off = (x: number, y: number) => (f ? (x - f.m.x) * f.n.x + (y - f.m.y) * f.n.y : 1)
  const H = cardH.value
  const vw = document.documentElement.clientWidth
  // it opens down and away from its label, so the label stays in view; else the other way, else up
  const sides = b.anchor === 'start' ? ['l', 'r'] as const : ['r', 'l'] as const
  const tries = (['d', 'u'] as const).flatMap(v => sides.map(h => ({ h, v })))
  let best = { h: sides[0], v: 'd' as 'd' | 'u', left: 0, top: 0 }
  let score = Infinity
  tries.forEach(({ h, v }, i) => {
    const left = h === 'r' ? b.x - RX : b.x - W + RX
    const top = v === 'd' ? b.y - RY : b.y - H + RY
    const x = base.left + left
    const y = base.top + top
    const corners = [[x, y], [x + W, y], [x, y + H], [x + W, y + H]] as const
    const under = corners.reduce((sum, [cx, cy]) => sum + Math.max(0, 14 - off(cx, cy)), 0)
    const outside = Math.max(0, 12 - x) + Math.max(0, x + W - vw + 12) + Math.max(0, 12 - y) + Math.max(0, y + H - innerHeight + 12)
    const covers = parts.reduce((sum, r) => sum + Math.max(0, Math.min(x + W, r.right) - Math.max(x, r.left)) * Math.max(0, Math.min(y + H, r.bottom) - Math.max(y, r.top)), 0)
    const hides = words.reduce((sum, r) => sum + Math.max(0, Math.min(x + W, r.right) - Math.max(x, r.left)) * Math.max(0, Math.min(y + H, r.bottom) - Math.max(y, r.top)), 0)
    const s = (under + outside) * 1000 + hides * 40 + covers + i * 50
    if (s < score) {
      score = s
      best = { h, v, left, top }
    }
  })
  // and whatever happens, it is kept inside the window
  best.left = Math.min(Math.max(best.left, 12 - base.left), vw - 12 - W - base.left)
  best.top = Math.min(Math.max(best.top, 12 - base.top), innerHeight - 12 - H - base.top)
  return { n: b.n, name: b.name, text: why[0], href: `${STORY}#${why[1]}`, ...best }
})
// the note's real height, once it is drawn, decides whether it fits below or has to open upwards
watch(pinned, () => nextTick(() => {
  if (cardEl.value) cardH.value = cardEl.value.offsetHeight
}))

type Box = { l: number, t: number, r: number, b: number }
type Spot = { n: number, name: string, note: string, part: string, x: number, y: number, tx: number, anchor: 'start' | 'end', leader: string }
const spots = shallowRef<Spot[]>([])

// where each balloon's leader ends, on its part
const anchors = computed(() => {
  const l = L.value
  if (!l) return []
  const c = l.clock
  return [
    c && { n: 1, to: { x: c.hour.x - 18, y: c.hour.y - 24 } },
    c && { n: 2, to: { x: c.wheel.x - R_MIN - 2, y: c.wheel.y } },
    c && dial.value && { n: 3, to: polar(dial.value.o, DR, -dial.value.top / 2) },
    lever.value && { n: 4, to: lever.value.pivot },
    l.geneva && { n: 5, to: { x: l.geneva.x - STAR * 0.6, y: l.geneva.y + STAR * 0.6 } },
    l.barrel && { n: 6, to: polar(l.barrel, 22, 225) },
    l.plate && { n: 7, to: { x: l.plate.x - l.plate.w / 2, y: l.plate.y + l.plate.h / 4 } },
    rep.value && { n: 8, to: polar(rep.value.o, GONG_LOW * rep.value.k, 205) },
  ].filter(Boolean) as { n: number, to: Pt }[]
})

const area = (a: Box, b: Box) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t))
const inside = (p: Pt, b: Box) => p.x > b.l && p.x < b.r && p.y > b.t && p.y < b.b
// Geist Mono advances 0.6em; the names are spaced 0.08em, the notes 0.04em
const textWidth = (s: string, spacing: number) => s.length * 6.5 * (0.6 + spacing)

function place(root: HTMLElement) {
  if (!L.value) return
  const base = root.getBoundingClientRect()
  const W = Math.min(base.width, document.documentElement.clientWidth - base.left)
  const H = base.height
  const box = (r: DOMRect): Box => ({ l: r.left - base.left, t: r.top - base.top, r: r.right - base.left, b: r.bottom - base.top })
  // the parts themselves, piece by piece
  // a little room around everything, so nothing is placed touching
  const grow = (b: Box, g: number): Box => ({ l: b.l - g, t: b.t - g, r: b.r + g, b: b.b + g })
  const parts: Box[] = []
  root.querySelectorAll('.mechanism :is(path, circle, text, rect)').forEach((el) => {
    if (el.closest('.balloon') || el.classList.contains('push')) return
    const r = el.getBoundingClientRect()
    if (r.width || r.height) parts.push(grow(box(r), el.tagName === 'text' ? 3 : 1.5))
  })
  // the copy of the page, line by line, where it is still shown; and the dashed outlines of its blocks
  const words: Box[] = []
  const edges: Box[] = []
  const copy = root.querySelector('.drawing')
  if (copy) {
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement
      if (!n.textContent?.trim() || !el || getComputedStyle(el).visibility === 'hidden') continue
      range.selectNodeContents(n)
      for (const r of range.getClientRects()) if (r.width) words.push(grow(box(r), 2))
    }
    copy.querySelectorAll<HTMLElement>(':is(h1, h2, h3, h4, p, li, pre, time)').forEach((el) => {
      if (getComputedStyle(el).outlineStyle === 'none') return
      const b = box(el.getBoundingClientRect())
      edges.push({ ...b, b: b.t + 2 }, { ...b, t: b.b - 2 }, { ...b, r: b.l + 2 }, { ...b, l: b.r - 2 })
    })
  }
  const placed: Box[] = []
  const out: Spot[] = []
  for (const { n, to } of anchors.value) {
    const [name, note, part] = NAMES[n]!
    const w = Math.max(textWidth(name, 0.08), textWidth(note, 0.04))
    let best: { cost: number, spot: Spot, boxes: Box[] } | null = null
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6
      for (const d of [24, 34, 46, 60]) {
        const x = to.x + d * Math.cos(a)
        const y = to.y + d * Math.sin(a)
        const sides: ('l' | 'r')[] = Math.cos(a) < -0.3 ? ['l'] : Math.cos(a) > 0.3 ? ['r'] : ['l', 'r']
        for (const side of sides) {
          // an unnumbered note has no ring: its text starts where its leader does
          const gap = n ? 10 : 2
          const ring: Box = n ? { l: x - 7, t: y - 7, r: x + 7, b: y + 7 } : { l: x - 2, t: y - 7, r: x + 2, b: y + 10 }
          const label: Box = side === 'l' ? { l: x - gap - 1 - w, t: y - 7, r: x, b: y + 10 } : { l: x, t: y - 7, r: x + gap + 1 + w, b: y + 10 }
          const all: Box = { l: Math.min(ring.l, label.l), t: ring.t, r: Math.max(ring.r, label.r), b: label.b }
          let cost = d * 0.6
          // outside the window, or off the drawing
          const clipped = (all.r - all.l) * (all.b - all.t) - area(all, { l: 6, t: 6, r: W - 6, b: H - 6 })
          cost += clipped * 50
          for (const p of parts) cost += area(all, p) * 3
          for (const p of words) cost += area(all, p) * 5
          for (const p of edges) cost += area(all, p) * 3
          for (const p of placed) cost += area(all, p) * 30
          // a leader across a line of copy, or another balloon
          for (let t = 0.15; t < 1; t += 0.1) {
            const q = { x: x + (to.x - x) * t, y: y + (to.y - y) * t }
            if (words.some(b => inside(q, b))) cost += 12
            if (placed.some(b => inside(q, b))) cost += 60
          }
          if (best && cost >= best.cost) continue
          const s0 = n ? { x: x + 6 * Math.cos(a + Math.PI), y: y + 6 * Math.sin(a + Math.PI) } : { x, y: y + 3 }
          best = {
            cost,
            boxes: [all],
            spot: {
              n,
              name,
              note,
              part,
              x,
              y,
              tx: side === 'l' ? x - gap : x + gap,
              anchor: side === 'l' ? 'end' : 'start',
              leader: `M${s0.x.toFixed(1)} ${s0.y.toFixed(1)}L${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
            },
          }
        }
      }
    }
    if (!best) continue
    placed.push(...best.boxes)
    out.push(best.spot)
  }
  spots.value = out
}

// the Geneva wheel: a star of four slots, with a hollow between each pair where the driver's
// locking disc turns, and the star's rim between slot and hollow
const STAR = GENEVA * Math.SQRT1_2
const LOCK = STAR * 0.56 // the locking disc's radius
const star = (() => {
  const slot = 1.9
  const bottom = GENEVA - STAR + 0.6 // the crank pin reaches this deep
  const d = Math.asin(slot / STAR)
  const th = Math.acos((STAR ** 2 + GENEVA ** 2 - LOCK ** 2) / (2 * STAR * GENEVA)) // where a hollow meets the rim
  const rim = (r: number, t: number): Pt => ({ x: r * Math.cos(t), y: r * Math.sin(t) })
  const pts: Pt[] = []
  const arc = (c: Pt, r: number, from: Pt, to: Pt) => {
    const f1 = Math.atan2(from.y - c.y, from.x - c.x)
    let f2 = Math.atan2(to.y - c.y, to.x - c.x)
    while (f2 - f1 > Math.PI) f2 -= Math.PI * 2
    while (f1 - f2 > Math.PI) f2 += Math.PI * 2
    for (let k = 0; k <= 10; k++) pts.push({ x: c.x + r * Math.cos(f1 + ((f2 - f1) * k) / 10), y: c.y + r * Math.sin(f1 + ((f2 - f1) * k) / 10) })
  }
  const o = { x: 0, y: 0 }
  for (let i = 0; i < 4; i++) {
    const t = ((i * 90 + 45) * Math.PI) / 180
    const n = { x: -Math.sin(t), y: Math.cos(t) } // across the slot
    const edge = (r: number, side: number) => ({ x: r * Math.cos(t) + side * slot * n.x, y: r * Math.sin(t) + side * slot * n.y })
    pts.push(edge(STAR, -1), edge(bottom, -1), edge(bottom, 1), edge(STAR, 1))
    const bis = t + Math.PI / 4
    const q = rim(GENEVA, bis)
    arc(o, STAR, rim(STAR, t + d), rim(STAR, bis - th))
    arc(q, LOCK, rim(STAR, bis - th), rim(STAR, bis + th))
    arc(o, STAR, rim(STAR, bis + th), rim(STAR, t + Math.PI / 2 - d))
  }
  return `M${pts.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('L')}Z`
})()
const driverDisc = (() => {
  // the locking disc, cut away on the pin's side so the star can turn
  const r = LOCK - 0.6
  const a = 0.95
  return `M${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}A${r} ${r} 0 1 1 ${(r * Math.cos(-a)).toFixed(2)} ${(r * Math.sin(-a)).toFixed(2)}A${r * 0.9} ${r * 0.9} 0 0 0 ${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`
})()

// the barrel: drum, mainspring, ratchet and click
const spring = (() => {
  const pts: string[] = []
  for (let i = 0; i <= 300; i++) {
    const a = (i / 300) * Math.PI * 2 * 7
    const r = 5 + (i / 300) * 19
    pts.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}`
})()
const click = (() => {
  const pivot = at({ x: 0, y: 0 }, 21, -40)
  const tip = at({ x: 0, y: 0 }, 11.6, -88)
  const springEnd = at({ x: 0, y: 0 }, 25, 5)
  return {
    pivot,
    pawl: `M${pivot.x.toFixed(2)} ${pivot.y.toFixed(2)}L${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`,
    spring: `M${pivot.x.toFixed(2)} ${(pivot.y - 1).toFixed(2)}Q${(pivot.x + 6).toFixed(2)} ${(pivot.y + 2).toFixed(2)} ${springEnd.x.toFixed(2)} ${springEnd.y.toFixed(2)}`,
  }
})()

// the half of the disc that is night, drawn below the arbor: turned 180°, night is up
const nightHalf = `M${-DISC} 0A${DISC} ${DISC} 0 0 0 ${DISC} 0Z`

defineExpose({ measure, place })
</script>

<template>
  <div v-if="L" ref="mroot" class="mechanism">
    <!-- 1 the movement, turned so its hands are under the figures of the hour -->
    <div
      v-if="L.clock"
      class="movement-at"
      data-instrument="clock"
      aria-hidden="true"
      :style="{
        left: `${L.clock.hour.x - L.clock.origin.x}px`,
        top: `${L.clock.hour.y - L.clock.origin.y}px`,
        transformOrigin: `${L.clock.origin.x}px ${L.clock.origin.y}px`,
        transform: `rotate(${L.clock.rot}rad)`,
      }"
    >
      <Movement
        tone="bone"
        :width="L.clock.width"
        :turn="L.clock.rot"
        :shown="has('clock')"
        :running="running && has('clock')"
        :at="preview"
      />
    </div>

    <svg :width="L.w" :height="L.h" :viewBox="`0 0 ${L.w} ${L.h}`" class="parts">
      <!-- 2, 3: the cam and its rack, and the sun's dial -->
      <g v-if="L.clock && state" data-instrument="clock" aria-hidden="true" class="part" :class="{ shown: has('clock') }">
        <g class="moving" :style="tf(L.clock.idler, deg(state.iAngle), L.clock.k)">
          <path class="draw" :d="toothed(30, 'wheel')" pathLength="1" :style="{ strokeWidth: 0.6 / L.clock.k }" />
          <path class="draw thin" :d="circle(2.4)" pathLength="1" :style="{ strokeWidth: 0.6 / L.clock.k }" />
        </g>
        <g class="moving" :style="tf(L.clock.wheel, deg(state.wAngle), L.clock.k)">
          <path class="draw thin" :d="toothed(40, 'wheel')" pathLength="1" :style="{ strokeWidth: 0.6 / L.clock.k }" />
        </g>
        <g class="moving" :style="tf(L.clock.wheel, state.f * 360)">
          <!-- a solid plate on the wheel's face: the wheel's rim shows around it -->
          <path class="plate" :d="camPath" />
          <path class="draw cam" :d="camPath" pathLength="1" />
          <path class="draw thin" :d="circle(2.6)" pathLength="1" />
          <!-- noon on the cam: where the day's top is cut -->
          <path class="thin" :d="`M0 ${-R_MIN + 1.5}V${-R_MIN - 1.5}`" :style="{ transform: 'rotate(180deg)' }" />
          <circle r="1.2" class="dot" />
        </g>

        <!-- the rack: a roller on the cam, a toothed rod held in two guides -->
        <g class="moving" :style="tf({ x: L.clock.wheel.x, y: state.roller })">
          <circle :r="RR" class="roller" />
          <path class="draw" :d="`M-0.8 ${RR}V${RACK}M0.8 ${RR}V${RACK}`" pathLength="1" />
          <path class="thin" :d="Array.from({ length: 15 }, (_, i) => `M0.8 ${16 + i * 1.9}h1.4`).join('')" />
        </g>
        <path class="thin" :d="`M${L.clock.wheel.x - 3.5} ${L.clock.wheel.y + 34}h2.2M${L.clock.wheel.x + 3.5} ${L.clock.wheel.y + 34}h-1.4M${L.clock.wheel.x - 3.5} ${L.clock.wheel.y + 52}h2.2`" />

        <!-- the pinion, and the sun's height on its dial: the horizon level, the ground hatched
             below it, the sun at the end of the hand -->
        <template v-if="dial">
          <g class="moving" :style="tf(dial.o, dial.pinion)">
            <path class="draw thin" :d="toothed(12, 'pinion', dial.rp)" pathLength="1" />
          </g>
          <path class="draw" :d="dial.sky" pathLength="1" />
          <path class="draw thin" :d="dial.below" pathLength="1" />
          <path class="draw" :d="dial.horizon" pathLength="1" />
          <path class="thin" :d="dial.hatch" />
          <path v-for="m in dial.marks" :key="m.m" class="thin" :d="m.tick" />
          <g class="moving" :style="tf(dial.o, dial.hand)">
            <path class="hand" :d="`M-2 0H${DR - 6}`" />
            <circle r="1.4" class="dot" />
            <g :style="{ transform: `translate(${DR}px, 0)` }" class="sun-glyph" :class="{ up: (daylight?.elevation ?? 0) >= 0 }">
              <circle r="2.6" />
              <path :d="sunRays" />
            </g>
          </g>
        </template>
      </g>


      <!-- 4 the rod down the sheet's edge, and the lever under the light dot -->
      <g v-if="L.clock && L.rodX && L.hand && state" class="part" :class="{ shown: has('clock') || has('hand') }">
        <g class="moving" :style="tf({ x: 0, y: state.offset })">
          <path class="draw" :d="`M${L.clock.wheel.x} ${L.clock.wheel.y + R_MIN + RR + RACK}H${L.rodX}`" pathLength="1" />
          <!-- the rod, broken in its middle as a long part is on a drawing -->
          <path
            class="draw"
            :d="(() => {
              const top = L.clock.wheel.y + R_MIN + RR + RACK
              const bottom = L.hand.y
              const mid = (top + bottom) / 2
              const x = L.rodX
              return `M${x - 1} ${top}V${mid - 8}M${x + 1} ${top}V${mid - 6}M${x - 1} ${mid + 6}V${bottom}M${x + 1} ${mid + 8}V${bottom}`
            })()"
            pathLength="1"
          />
          <path class="thin" :d="`M${L.rodX - 4} ${(L.clock.wheel.y + R_MIN + RR + RACK + L.hand.y) / 2 - 6}l3 -3l3 3l3 -3M${L.rodX - 4} ${(L.clock.wheel.y + R_MIN + RR + RACK + L.hand.y) / 2 + 9}l3 -3l3 3l3 -3`" />
        </g>
      </g>
      <g v-if="L.rodX && L.hand && lever" data-instrument="hand" aria-hidden="true" class="part" :class="{ shown: has('hand') }">
        <!-- the rod's pin, where the lever rides while the sun is in charge -->
        <circle :cx="lever.pin.x" :cy="lever.pin.y" r="1.6" class="pivot" />
        <!-- the disc under the dot: day up, or night up -->
        <g class="moving" :style="tf(L.hand, lever.disc)">
          <path class="night" :d="nightHalf" />
          <path class="draw" :d="circle(DISC)" pathLength="1" />
          <path class="thin" :d="`M${-DISC} 0H${DISC}`" />
        </g>
        <circle :cx="L.hand.x" :cy="L.hand.y" r="1" class="dot" />
        <!-- the lever, on its pivot between the disc and the rod -->
        <g class="moving">
          <path class="draw" :d="`M${lever.tip.x} ${lever.tip.y}L${lever.end.x} ${lever.end.y}`" pathLength="1" />
          <circle :cx="lever.tip.x" :cy="lever.tip.y" r="1.1" class="dot" />
          <circle :cx="lever.end.x" :cy="lever.end.y" r="2.4" class="eye" />
        </g>
        <circle :cx="lever.pivot.x" :cy="lever.pivot.y" r="1.8" class="pivot" />
        <!-- the jumper that holds it thrown, either way -->
        <path class="thin" :d="`M${lever.pivot.x + 10} ${L.hand.y + 12}q4 -4 8 0t8 0t8 0`" />
      </g>

      <!-- 5 the Geneva wheel under the detail sheets -->
      <g v-if="L.geneva" data-instrument="geneva" aria-hidden="true" class="part" :class="{ shown: has('geneva') }">
        <g class="moving slow" :style="tf(L.geneva, -shown.detail * 90)">
          <path class="draw" :d="star" pathLength="1" />
          <circle r="1.6" class="dot" />
        </g>
        <g class="moving slow" :style="tf({ x: L.geneva.x - GENEVA, y: L.geneva.y }, shown.detail * 360 + 180)">
          <path class="draw thin" :d="driverDisc" pathLength="1" />
          <path class="draw" :d="`M0 0L${STAR} 0`" pathLength="1" />
          <circle :cx="STAR" cy="0" r="1.6" class="dot" />
          <circle r="1.4" class="dot" />
        </g>
      </g>

      <!-- 6 the barrel under the ∞ -->
      <g v-if="L.barrel" data-instrument="barrel" aria-hidden="true" class="part" :class="{ shown: has('barrel') }">
        <g :style="tf(L.barrel)">
          <path class="draw" :d="toothed(75, 'wheel', 30)" pathLength="1" />
          <path class="draw thin" :d="circle(26)" pathLength="1" />
          <path class="draw thin" :d="spring" pathLength="1" />
          <path class="draw" :d="toothed(24, 'escape', 13)" pathLength="1" />
          <path class="draw thin" d="M-3 -3h6v6h-6z" pathLength="1" />
          <path class="draw" :d="click.pawl" pathLength="1" />
          <path class="draw thin" :d="click.spring" pathLength="1" />
          <circle :cx="click.pivot.x" :cy="click.pivot.y" r="1.6" class="dot" />
        </g>
      </g>

      <!-- 7 the plate: the portrait's negative, under the portrait -->
      <g v-if="L.plate && neg" data-instrument="plate" aria-hidden="true" class="part" :class="{ shown: has('plate') }">
        <defs>
          <!-- density: the film darkens as the photo is light, and stays clear where it is dark -->
          <filter
            id="negative-density"
            color-interpolation-filters="sRGB"
            x="0"
            y="0"
            width="1"
            height="1"
          >
            <feColorMatrix type="matrix" values="0 0 0 0 0.07  0 0 0 0 0.03  0 0 0 0 0.03  0.3 0.6 0.1 0 0" />
            <!-- as film answers light: the shadows still lay down some density, the highlights a lot -->
            <feComponentTransfer>
              <feFuncA type="gamma" amplitude="1.2" exponent="0.72" offset="0" />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect class="film" :x="neg.x" :y="neg.y" :width="neg.w" :height="neg.h" />
        <rect
          class="fog"
          :x="neg.fx"
          :y="neg.fy"
          :width="neg.fw"
          :height="neg.fh"
          rx="1.5"
        />
        <image
          class="density"
          :href="L.plate.src"
          :x="neg.fx"
          :y="neg.fy"
          :width="neg.fw"
          :height="neg.fh"
          preserveAspectRatio="xMidYMid slice"
          filter="url(#negative-density)"
        />
        <!-- the strip's edges, cut square at both ends -->
        <path class="draw thin" :d="`M${neg.x} ${neg.y}h${neg.w}v${neg.h}h${-neg.w}Z`" pathLength="1" />
        <!-- printed in the edges: the film, and the frame number -->
        <text class="edge" :x="neg.fx" :y="neg.fy - 4">HR 400</text>
        <text class="edge" :x="neg.fx + neg.fw / 2" :y="neg.fy + neg.fh + 8.5" text-anchor="middle">1</text>
        <text class="edge" :x="neg.fx + neg.fw" :y="neg.fy + neg.fh + 8.5" text-anchor="end">▸</text>
      </g>

      <!-- 8 the chime above the sound button: its gongs, hammers, strike train and slide -->
      <g v-if="rep" data-instrument="sound" aria-hidden="true" class="part" :class="{ shown: has('sound') }">
        <g :style="tf(rep.o, 0, rep.k)">
          <!-- the gongs: two wires round the works, both held in the heel -->
          <path class="draw gong" :class="{ ring: repeater.hammer.value === 'low' }" :d="gongArc(GONG_LOW)" pathLength="1" />
          <path class="draw gong" :class="{ ring: repeater.hammer.value === 'high' }" :d="gongArc(GONG_HIGH)" pathLength="1" />
          <path class="draw" :d="heel" pathLength="1" />
          <!-- the hammers, each on its pivot with the spring that holds it off the wire -->
          <g v-for="h in hammers" :key="h.gong">
            <path class="thin" :d="`M${h.pivot.x.toFixed(2)} ${h.pivot.y.toFixed(2)}Q${((h.pivot.x + h.spring.x) / 2 + 2).toFixed(2)} ${((h.pivot.y + h.spring.y) / 2 - 2).toFixed(2)} ${h.spring.x.toFixed(2)} ${h.spring.y.toFixed(2)}`" />
            <g class="hammer" :class="{ down: repeater.hammer.value === h.gong }" :style="tf(h.pivot, repeater.hammer.value === h.gong ? 0 : h.rest)">
              <path class="draw arm" :d="`M0 0L${h.v.x.toFixed(2)} ${h.v.y.toFixed(2)}`" pathLength="1" />
              <circle :cx="h.v.x" :cy="h.v.y" r="2.6" class="dot" />
            </g>
            <circle :cx="h.pivot.x" :cy="h.pivot.y" r="1.5" class="pivot" />
          </g>
          <!-- the strike train: the pinion the rack turns, its wheel, and the governor that keeps the pace -->
          <g :style="pinionTurn">
            <path class="draw" :d="toothed(12, 'pinion', RP)" pathLength="1" />
            <path class="draw thin" :d="toothed(36, 'wheel', 11)" pathLength="1" />
            <circle r="1.2" class="dot" />
          </g>
          <g :style="tf(GOV)">
            <g class="governor" :class="{ spin: repeater.striking.value }">
              <path class="draw thin" :d="toothed(8, 'pinion', 3.2)" pathLength="1" />
              <path class="draw" d="M-8 -1.2h16v2.4h-16z" pathLength="1" />
            </g>
            <circle r="1" class="dot" />
          </g>
          <!-- the slide, from the button: a rack at its top, a slot on two screws, its foot under the button -->
          <g :style="slideMove">
            <path class="draw" :d="`M${SLIDE_X - 2} -4H${SLIDE_X + 2}V${BUTTON_Y - 10}H${SLIDE_X - 2}Z`" pathLength="1" />
            <path class="thin" :d="Array.from({ length: 12 }, (_, i) => `M${SLIDE_X - 2} ${-1 + i * 1.9}h-1.3`).join('')" />
            <path class="draw thin" :d="`M${SLIDE_X - 0.8} 64V90a0.8 0.8 0 0 0 1.6 0V64a0.8 0.8 0 0 0 -1.6 0`" pathLength="1" />
            <path class="draw" :d="`M${SLIDE_X - 4} ${BUTTON_Y - 16}h8v6h-8z`" pathLength="1" />
          </g>
          <circle
            v-for="y in [68, 78]"
            :key="y"
            :cx="SLIDE_X"
            :cy="y"
            r="1.3"
            class="pivot"
          />
          <!-- under the page, the slide can be pushed by hand -->
          <rect
            :x="SLIDE_X - 46"
            y="-46"
            width="92"
            :height="BUTTON_Y + 36"
            class="push"
            :class="{ live: running && has('sound') }"
            @click="pushSlide"
          />
        </g>
      </g>

      <!-- the balloons, each with what its part is and does, placed where they cover the least -->
      <g
        v-for="(b, i) in spots"
        :key="b.n"
        :style="{ '--i': i }"
        class="part balloon"
        :data-reveal="b.part"
        :class="{ shown: has(b.part), live: running && has(b.part), on: pinned === b.n }"
        :tabindex="running && has(b.part) && WHY[b.n] ? 0 : undefined"
        role="button"
        :aria-label="`${b.name}: why it is there`"
        :aria-expanded="pinned === b.n"
        @pointerenter="$event.pointerType === 'mouse' && pin(b.n)"
        @pointerleave="$event.pointerType === 'mouse' && leave()"
        @click="pin(pinned === b.n ? null : b.n)"
        @focus="pin(b.n)"
        @blur="leave"
        @keydown.escape="pin(null)"
      >
        <path :d="b.leader" />
        <template v-if="b.n">
          <!-- a larger, invisible target than the 6px circle, for a finger -->
          <circle :cx="b.x" :cy="b.y" r="13" class="hit" />
          <circle :cx="b.x" :cy="b.y" r="6" />
          <text :x="b.x" :y="b.y + 2.6" text-anchor="middle">{{ b.n }}</text>
        </template>
        <text :x="b.tx" :y="b.y - 0.5" :text-anchor="b.anchor" class="name">{{ b.name }}</text>
        <text :x="b.tx" :y="b.y + 7.5" :text-anchor="b.anchor" class="note">{{ b.note }}</text>
      </g>
    </svg>

    <!-- the pin's note opens out of its balloon: its number is drawn on the balloon's own circle -->
    <Transition name="pin">
      <div
        v-if="card"
        ref="cardEl"
        class="pin-card"
        :class="[`h-${card.h}`, `v-${card.v}`]"
        :style="{ left: `${card.left}px`, top: `${card.top}px`, width: `${W}px` }"
        @pointerenter="pin(card.n)"
        @pointerleave="leave"
      >
        <p class="pin-head">
          <svg class="pin-n" width="14" height="14" viewBox="-7 -7 14 14" aria-hidden="true">
            <circle r="6" />
            <text y="2.6" text-anchor="middle">{{ card.n }}</text>
          </svg>
          <span>{{ card.name }}</span>
        </p>
        <p class="pin-text">
          {{ card.text }}
        </p>
        <NuxtLink :to="card.href" class="pin-more">
          Read more &rarr;
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* bone on the red, every colour mixed into the red: crossings never darken */
.mechanism {
  --ink: color-mix(in oklab, #ebebeb 82%, #901112);
  --thin: color-mix(in oklab, #ebebeb 46%, #901112);
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}
.movement-at {
  position: absolute;
}
.parts {
  position: absolute;
  inset: 0;
  overflow: visible;
}
path {
  fill: none;
  stroke: var(--ink);
  stroke-width: 0.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.thin {
  stroke: var(--thin);
}
.cam {
  stroke-width: 0.75;
}
.plate {
  fill: color-mix(in oklab, #ebebeb 9%, #901112);
  stroke: none;
}
/* the negative, as on a light box: clear film is bone, the image and the edge print are density */
.film {
  fill: #f3f2ee;
}
.fog {
  fill: #e6e4de;
}
.edge {
  font-size: 6px;
  letter-spacing: 0.12em;
  fill: rgb(18 8 8 / 0.7);
}
.night {
  fill: var(--thin);
  stroke: none;
}
.eye {
  fill: none;
  stroke: var(--ink);
  stroke-width: 0.6;
}
.hand {
  stroke: #ffffff;
  stroke-width: 1.1;
}
.sun-glyph circle {
  fill: #901112;
  stroke: #ffffff;
  stroke-width: 0.7;
}
.sun-glyph.up circle {
  fill: #ffffff;
}
.sun-glyph path {
  stroke: #ffffff;
  stroke-width: 0.7;
}
.sun-glyph:not(.up) path {
  stroke: var(--thin);
}
.dot,
.pivot {
  fill: var(--ink);
}
.roller {
  fill: #901112;
  stroke: var(--ink);
  stroke-width: 0.6;
}
text {
  font-family: var(--font-mono);
  font-size: 7px;
  letter-spacing: 0.04em;
  fill: var(--thin);
}
.caption {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.part.balloon :is(text, circle, path) {
  transition-delay: calc(1.3s + var(--i, 0) * 0.18s);
}
.balloon.live {
  pointer-events: auto;
  cursor: help;
  outline: none;
}
.balloon .hit {
  fill: transparent;
  stroke: none;
}
.balloon.live.on circle:not(.hit),
.balloon.live:focus-visible circle:not(.hit) {
  fill: var(--ink);
}
.balloon.live.on text:not(.name):not(.note),
.balloon.live:focus-visible text:not(.name):not(.note) {
  fill: #901112;
}
.pin-card {
  position: absolute;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: auto;
  padding: 10px;
  background: #901112;
  border: 1px solid rgb(235 235 235 / 0.55);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.01em;
  color: rgb(235 235 235 / 0.92);
}
/* opening upwards, the head stays by the balloon, at the bottom */
.pin-card.v-u {
  flex-direction: column-reverse;
}
.pin-head {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 14px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
}
.pin-card.h-l .pin-head {
  flex-direction: row-reverse;
}
.pin-n {
  flex: none;
  overflow: visible;
}
.pin-card.h-r .pin-n {
  margin-left: -4px;
}
.pin-card.h-l .pin-n {
  margin-right: -4px;
}
.pin-n circle {
  fill: #ebebeb;
  stroke: #ebebeb;
  stroke-width: 0.6;
}
.pin-n text {
  font-family: var(--font-mono);
  font-size: 7.5px;
  fill: #901112;
}
.pin-more {
  align-self: flex-start;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(235 235 235 / 0.7);
  transition: color 0.2s ease;
}
.pin-more:hover {
  color: #ffffff;
}
.pin-enter-active,
.pin-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.pin-enter-from,
.pin-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
.balloon circle {
  fill: #901112;
  stroke: var(--ink);
  stroke-width: 0.6;
}
.balloon path {
  stroke: var(--thin);
}
.balloon text {
  font-size: 7.5px;
  fill: var(--ink);
}
.balloon .name {
  font-size: 6.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.balloon .note {
  font-size: 6.5px;
  fill: var(--thin);
}

/* each part drawn in once, the first time it is uncovered, then simply there */
.draw {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.3s cubic-bezier(0.65, 0, 0.35, 1) 0.15s;
}
.shown .draw {
  stroke-dashoffset: 0;
}
.part :is(text, circle, rect, image, .hand, path:not(.draw)) {
  opacity: 0;
  transition: opacity 0.6s ease 0.9s;
}
.part.shown :is(text, circle, rect, image, .hand, path:not(.draw)) {
  opacity: 1;
}
/* the parts move as the page's hour does: the cam with the crown, the star a level at a time */
.moving {
  transition: transform 0.9s cubic-bezier(0.45, 0, 0.25, 1);
}
.moving.slow {
  transition-duration: 1.1s;
}
/* the chime: the wire flashes as it is struck, the hammers fall fast and come back slower */
.gong {
  stroke-width: 0.8;
  transition: stroke-dashoffset 1.3s cubic-bezier(0.65, 0, 0.35, 1) 0.15s, stroke 0.7s ease-out;
}
.gong.ring {
  stroke: #ffffff;
  transition-duration: 1.3s, 0s;
}
.arm {
  stroke-width: 1;
}
.hammer {
  transition: transform 0.16s ease-out;
}
.hammer.down {
  transition-duration: 0.05s;
  transition-timing-function: ease-in;
}
.governor.spin {
  animation: govern 0.3s linear infinite;
}
@keyframes govern {
  to {
    transform: rotate(360deg);
  }
}
.push {
  fill: transparent;
  stroke: none;
  pointer-events: none;
}
.push.live {
  pointer-events: auto;
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .governor.spin {
    animation: none;
  }
  .draw, .moving, .part :is(text, circle, .hand, path:not(.draw)) {
    transition: none;
  }
}
</style>
