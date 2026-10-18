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
// Measured from the live page each time the
// drawing underneath is made; the balloons are then placed where they cover the least.
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

// The lever and the Geneva wheel are moved by hand, from the page above them, and the page's corner
// lifts for a moment to show it (see PagePeel). So they move once they are in view, rather than
// under the paper; if the corner never lifts (scrolled away), a moment later anyway.
const openOn = useState<{ part: string, at: number } | null>('peel-open-on', () => null)
const shown = reactive({ dark: colorMode.value === 'dark', manual: manual.value, detail: detail.value })
const waiting = new Map<string, { apply:() => void, timer: ReturnType<typeof setTimeout> }>()
function whenSeen(part: string, apply: () => void) {
  clearTimeout(waiting.get(part)?.timer)
  waiting.set(part, { apply, timer: setTimeout(() => (waiting.delete(part), apply()), 3200) })
}
watch(openOn, (o) => {
  const w = o && waiting.get(o.part)
  if (!w) return
  clearTimeout(w.timer)
  waiting.delete(o!.part)
  setTimeout(w.apply, 220)
})
watch([() => colorMode.value, manual], ([mode, byHand]) => whenSeen('hand', () => {
  shown.dark = mode === 'dark'
  shown.manual = byHand
}))
watch(detail, level => whenSeen('geneva', () => (shown.detail = level)))
onBeforeUnmount(() => waiting.forEach(w => clearTimeout(w.timer)))

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
  }
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
  1: ['Movement', 'keeps the hour', 'clock'],
  2: ['Cam', 'cut to today\'s sun', 'clock'],
  3: ['Sun\'s height', 'over the horizon', 'clock'],
  4: ['Lever and disc', 'the light, by hand', 'hand'],
  5: ['Geneva wheel', 'a step a level', 'geneva'],
  6: ['Barrel', 'wound, turns one way', 'barrel'],
}
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
    if (el.closest('.balloon')) return
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
  <div v-if="L" class="mechanism" aria-hidden="true">
    <!-- 1 the movement, turned so its hands are under the figures of the hour -->
    <div
      v-if="L.clock"
      class="movement-at"
      data-instrument="clock"
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
      <g v-if="L.clock && state" data-instrument="clock" class="part" :class="{ shown: has('clock') }">
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
      <g v-if="L.rodX && L.hand && lever" data-instrument="hand" class="part" :class="{ shown: has('hand') }">
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
      <g v-if="L.geneva" data-instrument="geneva" class="part" :class="{ shown: has('geneva') }">
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
      <g v-if="L.barrel" data-instrument="barrel" class="part" :class="{ shown: has('barrel') }">
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

      <!-- the balloons, each with what its part is and does, placed where they cover the least -->
      <g
        v-for="(b, i) in spots"
        :key="b.n"
        :style="{ '--i': i }"
        class="part balloon"
        :data-reveal="b.part"
        :class="{ shown: has(b.part) }"
      >
        <path :d="b.leader" />
        <template v-if="b.n">
          <circle :cx="b.x" :cy="b.y" r="6" />
          <text :x="b.x" :y="b.y + 2.6" text-anchor="middle">{{ b.n }}</text>
        </template>
        <text :x="b.tx" :y="b.y - 0.5" :text-anchor="b.anchor" class="name">{{ b.name }}</text>
        <text :x="b.tx" :y="b.y + 7.5" :text-anchor="b.anchor" class="note">{{ b.note }}</text>
      </g>
    </svg>
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
.part :is(text, circle, rect, .hand, path:not(.draw)) {
  opacity: 0;
  transition: opacity 0.6s ease 0.9s;
}
.part.shown :is(text, circle, rect, .hand, path:not(.draw)) {
  opacity: 1;
}
/* the parts move as the page's hour does: the cam with the crown, the star a level at a time */
.moving {
  transition: transform 0.9s cubic-bezier(0.45, 0, 0.25, 1);
}
.moving.slow {
  transition-duration: 1.1s;
}
@media (prefers-reduced-motion: reduce) {
  .draw, .moving, .part :is(text, circle, .hand, path:not(.draw)) {
    transition: none;
  }
}
</style>
