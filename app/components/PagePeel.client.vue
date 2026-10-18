<script setup lang="ts">
// Any corner of the page can be lifted, to see the working drawing underneath (PeelUnderside).
//
// It is a real fold, not a picture of one. A corner C of the window is pulled to P; the fold is
// the perpendicular bisector of CP. The paper is clipped to the side of the fold away from C, and
// the flap is the clipped-off part reflected across the fold. At rest only the bottom-right corner
// shows, as a small dog-ear drawn on its own (no clip); the other corners turn up when the pointer
// comes near them. The drawing underneath is built when the page is first lifted.
//
// Resting on the hour in the dateline lifts the top-right corner by itself, slowly, just far
// enough to show the movement under it, and lays it down again when the pointer moves on.

type Pt = { x: number, y: number }
type Mode = 'off' | 'rest' | 'lifted'
type Corner = 'tl' | 'tr' | 'bl' | 'br'

const CORNERS: Corner[] = ['tl', 'tr', 'bl', 'br']
const HOME: Corner = 'br'
const REST = 24 // the dog-ear's legs, px
const HOVER = 46
const NUDGE = 40
const OPEN = 520 // opened from the keyboard, if the data block cannot be measured
const PINNED = 300 // pulled past this, the page stays where it was left

const route = useRoute()
const colorMode = useColorMode()
const underside = useTemplateRef<{ build:() => void, invalidate: () => void, rects: () => { id: string, label: boolean, rect: DOMRect }[] }>('underside')

// which part a peek is for: the hour asks while it is rested on, the light dot and the detail
// ruler when they are moved; and, once the corner has settled, which part is now in view
const peek = useState<string | null>('peel-peek', () => null)
const openOn = useState<{ part: string, at: number } | null>('peel-open-on', () => null)
const mode = ref<Mode>('off')
const corner = ref<Corner>(HOME)
const open = ref(false)
const dragging = ref(false)
const view = ref({ w: 0, h: 0 })
const p = reactive({ x: 0, y: 0 }) // where the corner is
let vel = { x: 0, y: 0 }
let target: Pt = { x: 0, y: 0 }
let raf = 0
let reduced = false

const cornerPt = (k: Corner): Pt => ({ x: k[1] === 'r' ? view.value.w : 0, y: k[0] === 'b' ? view.value.h : 0 })
const atLegs = (legs: number, k: Corner = corner.value): Pt => {
  const c = cornerPt(k)
  return { x: c.x + (k[1] === 'r' ? -legs : legs), y: c.y + (k[0] === 'b' ? -legs : legs) }
}
// Where to pull a corner so that a box near it is wholly past the fold. In the corner's own
// distances the fold cuts the edges at X and Y; the box's far point (w, h) is clear when
// w/X + h/Y ≤ 1, so X = 2w, Y = 2h. The corner goes to the reflection of itself in that line.
function reveal(k: Corner, r: { left: number, top: number, right: number, bottom: number }): Pt {
  const PAD = 18
  const w = (k[1] === 'r' ? view.value.w - r.left : r.right) + PAD
  const h = (k[0] === 'b' ? view.value.h - r.top : r.bottom) + PAD
  const X = 2 * w
  const Y = 2 * h
  const d2 = (4 * X * X * Y * Y) / (X * X + Y * Y)
  const c = cornerPt(k)
  const dx = d2 / (2 * X)
  const dy = d2 / (2 * Y)
  return { x: c.x + (k[1] === 'r' ? -dx : dx), y: c.y + (k[0] === 'b' ? -dy : dy) }
}
// a part's box, with its balloons unless only the part itself is asked for
function union(id: string, labels = true) {
  const rs = (underside.value?.rects() ?? []).filter(b => b.id === id && (labels || !b.label)).map(b => b.rect)
  if (!rs.length) return null
  return {
    left: Math.min(...rs.map(r => r.left)),
    top: Math.min(...rs.map(r => r.top)),
    right: Math.max(...rs.map(r => r.right)),
    bottom: Math.max(...rs.map(r => r.bottom)),
  }
}

const place = (q: Pt) => {
  p.x = q.x
  p.y = q.y
}

// --- geometry ---------------------------------------------------------------------------------

function fold() {
  const c = cornerPt(corner.value)
  const vx = c.x - p.x
  const vy = c.y - p.y
  // a corner pushed back past itself (a spring overshooting) is simply flat: otherwise the fold
  // turns around and takes the whole window with it
  const inward = (corner.value[1] === 'r' ? vx : -vx) + (corner.value[0] === 'b' ? vy : -vy)
  const d = inward > 0 ? Math.hypot(vx, vy) : 0
  const n = d ? { x: vx / d, y: vy / d } : { x: 0, y: 0 } // from the fold toward the corner
  const m = { x: (c.x + p.x) / 2, y: (c.y + p.y) / 2 }
  return { n, m, d }
}

// keep the part of a polygon where f >= 0 (one Sutherland–Hodgman pass)
function cut(poly: Pt[], f: (q: Pt) => number) {
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!
    const b = poly[(i + 1) % poly.length]!
    const fa = f(a)
    const fb = f(b)
    if (fa >= 0) out.push(a)
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb)
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return out
}

const rect = (w: number, h: number): Pt[] => [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }]
const poly = (pts: Pt[]) => `polygon(${pts.map(q => `${q.x.toFixed(1)}px ${q.y.toFixed(1)}px`).join(',')})`

// a linear gradient across the whole window, from the fold line along `dir`
function along(dir: Pt, from: Pt, stops: [string, number][]) {
  const { w, h } = view.value
  const angle = Math.atan2(dir.x, -dir.y)
  const len = Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle))
  const start = { x: w / 2 - (dir.x * len) / 2, y: h / 2 - (dir.y * len) / 2 }
  const o = (from.x - start.x) * dir.x + (from.y - start.y) * dir.y
  return `linear-gradient(${angle}rad, ${stops.map(([c, at]) => `${c} ${(o + at).toFixed(1)}px`).join(', ')})`
}

const shape = computed(() => {
  if (mode.value === 'off') return null
  const { n, m, d } = fold()
  if (d < 1) return null // nothing lifted: draw nothing, rather than a degenerate fold
  const side = (q: Pt) => (q.x - m.x) * n.x + (q.y - m.y) * n.y
  const lifted = cut(rect(view.value.w, view.value.h), side) // the part of the window that is off the paper
  const flap = lifted.map((q) => {
    const s = side(q)
    return { x: q.x - 2 * s * n.x, y: q.y - 2 * s * n.y }
  })
  const back = { x: -n.x, y: -n.y }
  // the back of the paper: in the crease's shadow, then the rolled edge catching the light,
  // a soft band where the sheet curves, and flatter toward the tip
  const paperBack: [string, number][] = colorMode.value === 'dark'
    ? [['#080808', 0], ['#3c3c3c', 0.9], ['#121212', 3.5], ['#1d1d1d', d * 0.12], ['#2a2a2a', d * 0.24], ['#1a1a1a', d * 0.6]]
    : [['#c4c4c2', 0], ['#ffffff', 0.9], ['#d6d6d4', 3.5], ['#e9e9e7', d * 0.12], ['#f8f8f6', d * 0.24], ['#e6e6e4', d * 0.6]]
  // the flap casts its shadow away from the corner, onto the page
  const k = Math.min(1, d / 260)
  return {
    lifted: poly(lifted),
    flap: poly(flap),
    flapShade: along(back, m, paperBack),
    underShade: along(n, m, [['rgba(0,0,0,0.42)', 0], ['rgba(0,0,0,0.12)', Math.min(48, d * 0.2)], ['rgba(0,0,0,0)', Math.min(120, d * 0.45)]]),
    shadow: `drop-shadow(${(back.x * 1).toFixed(1)}px ${(back.y * 1).toFixed(1)}px 1px rgb(0 0 0 / 0.22)) drop-shadow(${(back.x * (3 + 9 * k)).toFixed(1)}px ${(back.y * (3 + 9 * k)).toFixed(1)}px ${(5 + 17 * k).toFixed(0)}px rgb(0 0 0 / ${(0.16 + 0.22 * k).toFixed(2)}))`,
    m,
    n,
  }
})

// The paper itself is clipped only while lifted, in its own (document) coordinates. Set on every
// change rather than on the next frame, so it can never be left behind by a fold that has gone.
function clipPaper() {
  const paper = document.querySelector<HTMLElement>('.paper')
  if (!paper) return
  const { n, m, d } = fold()
  if (mode.value !== 'lifted' || d < 1) {
    paper.style.clipPath = ''
    return
  }
  const md = { x: m.x + window.scrollX, y: m.y + window.scrollY }
  const keep = cut(rect(paper.offsetWidth, paper.offsetHeight), q => -((q.x - md.x) * n.x + (q.y - md.y) * n.y))
  paper.style.clipPath = poly(keep)
}
watch([() => p.x, () => p.y, mode, corner], clipPaper, { flush: 'sync' })

// --- what the fold uncovers --------------------------------------------------------------------

const uncovered = ref<string[]>([])
// Once an instrument has been uncovered it stays drawn for the rest of the visit: lifting the page
// again shows it as it was, rather than drawing it all over again.
function updateUncovered() {
  if (mode.value !== 'lifted') return
  const { n, m, d } = fold()
  if (d < 1) return
  const side = (x: number, y: number) => (x - m.x) * n.x + (y - m.y) * n.y
  // once uncovered, an instrument stays drawn until the page is laid down again
  // measured each time: the mechanism's parts lie on the page, in its coordinates
  const now = (underside.value?.rects() ?? [])
    .filter(({ rect: r }) => [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]].some(([x, y]) => side(x!, y!) > 0))
    .map(b => b.id)
  const next = [...new Set([...uncovered.value, ...now])]
  if (next.length !== uncovered.value.length) uncovered.value = next
}
watch([() => p.x, () => p.y, mode], updateUncovered)

// --- motion -----------------------------------------------------------------------------------

// `zeta` below 1 lets the paper settle with the smallest flop; laying it down uses 1 (no flop)
function settleTo(t: Pt, then?: () => void, zeta = 0.78, k = 210) {
  target = t
  cancelAnimationFrame(raf)
  if (reduced) {
    place(t)
    then?.()
    return
  }
  let last = performance.now()
  const step = (now: number) => {
    const dt = Math.min(0.032, (now - last) / 1000)
    last = now
    const c = 2 * Math.sqrt(k) * zeta
    for (const axis of ['x', 'y'] as const) {
      const a = -k * (p[axis] - target[axis]) - c * vel[axis]
      vel[axis] += a * dt
      p[axis] += vel[axis] * dt
    }
    if (Math.hypot(p.x - target.x, p.y - target.y) < 0.3 && Math.hypot(vel.x, vel.y) < 2) {
      place(target)
      vel = { x: 0, y: 0 }
      then?.()
      return
    }
    raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

function lift() {
  stopNudges()
  if (mode.value === 'lifted') return
  underside.value?.build()
  mode.value = 'lifted'
  // the page is held: it does not scroll under the hand (the clip is in page coordinates, and a
  // scroll would leave it a frame behind). Scrollbars are hidden site-wide, so nothing shifts.
  document.documentElement.style.overflow = 'hidden'
  try {
    sessionStorage.setItem('folio-peeled', '1')
  } catch {
    // private mode: the corner may nudge again next visit
  }
}

// lay the page down: the corner falls back, then the dog-ear returns to its home corner
let closing = false
function rest() {
  if (closing) return // already on its way down: another wheel tick changes nothing
  closing = true
  peeking = null
  clearTimeout(hold)
  peek.value = null
  openOn.value = null
  open.value = false
  const k = corner.value
  settleTo(atLegs(k === HOME ? REST : 0.5), () => {
    closing = false
    if (open.value || dragging.value) return
    mode.value = 'rest'
    document.documentElement.style.overflow = ''
    if (k !== HOME) home()
  }, 1)
}

function home() {
  corner.value = HOME
  place(atLegs(0.5))
  settleTo(atLegs(REST))
}

// From the keyboard the page opens at the bottom-left corner, where the sheet's data is, with
// the way to the other sheet: far enough for the whole block to be past the fold.
async function toggle() {
  if (open.value) return rest()
  corner.value = 'bl'
  place(atLegs(0.5))
  lift()
  open.value = true
  await nextTick()
  const r = union('data')
  settleTo(r ? reveal('bl', r) : atLegs(OPEN))
}

// --- a part, looked at: the corner lifts just enough to show what is under it -----------------
// The hour while it is rested on (top right); the lever and the Geneva wheel for a moment after
// the light or the detail is changed by hand (bottom right), so the part is seen moving.
const PEEK_CORNER: Record<string, Corner> = { clock: 'tr', hand: 'br', geneva: 'br' }
const HOLD = 2400
let peeking: string | null = null
let hold: ReturnType<typeof setTimeout> | undefined
async function startPeek(part: string) {
  if (peeking === part && part !== 'clock') {
    // moved again while it is showing: show it a little longer
    clearTimeout(hold)
    openOn.value = { part, at: performance.now() }
    hold = setTimeout(() => peeking === part && rest(), HOLD)
    return
  }
  if (mode.value !== 'rest' || dragging.value) {
    peek.value = null
    return
  }
  const k = PEEK_CORNER[part] ?? 'tr'
  underside.value?.build()
  // once to draw the parts, once more for the balloons placed around them
  await nextTick()
  await nextTick()
  const own = union(part, false)
  const all = union(part)
  const { w, h } = view.value
  // only what is on screen: a part scrolled out of view has nothing to show. A part that runs off
  // the window's edge (a narrow window) is shown as far as the window goes.
  const cx = own && (own.left + own.right) / 2
  const cy = own && (own.top + own.bottom) / 2
  if (!own || !all || cx! < 0 || cx! > w || cy! < 0 || cy! > h) {
    peek.value = null
    return
  }
  stopNudges()
  corner.value = k
  place(atLegs(0.5))
  lift()
  peeking = part
  // slower than a hand would pull it, and without a flop: it is the page showing, not thrown
  const r = { left: Math.max(0, all.left), top: Math.max(0, all.top), right: Math.min(w, all.right), bottom: Math.min(h, all.bottom) }
  settleTo(reveal(k, r), () => {
    if (peeking !== part) return
    openOn.value = { part, at: performance.now() }
    if (part !== 'clock') hold = setTimeout(() => peeking === part && rest(), HOLD)
  }, 1, 55)
}
watch(peek, (part) => {
  if (part) startPeek(part)
})
// the hour's peek stays lifted while the pointer is on the hour or over what it uncovered
function onPeekMove(e: PointerEvent) {
  if (peeking !== 'clock' || dragging.value) return
  const { n, m, d } = fold()
  const over = d >= 1 && (e.clientX - m.x) * n.x + (e.clientY - m.y) * n.y > 0
  const hour = document.querySelector('.paper [data-mech="hour"]')?.closest('a')?.getBoundingClientRect()
  const onHour = hour && e.clientX > hour.left - 12 && e.clientX < hour.right + 12 && e.clientY > hour.top - 10 && e.clientY < hour.bottom + 10
  if (!over && !onHour) rest()
}

let grab = { x: 0, y: 0 }
function onDown(e: PointerEvent, k: Corner = corner.value) {
  if (e.button !== 0) return
  e.preventDefault()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  cancelAnimationFrame(raf)
  closing = false
  if (k !== corner.value) {
    corner.value = k
    place(atLegs(REST))
  }
  dragging.value = true
  peeking = null // taken in hand: it is an ordinary lift from here
  clearTimeout(hold)
  grab = { x: p.x - e.clientX, y: p.y - e.clientY }
  lift()
}
function onMove(e: PointerEvent) {
  if (!dragging.value) return
  const { w, h } = view.value
  place({ x: Math.min(w * 1.2, Math.max(-w * 0.2, e.clientX + grab.x)), y: Math.min(h * 1.2, Math.max(-h * 0.2, e.clientY + grab.y)) })
}
function onUp() {
  if (!dragging.value) return
  dragging.value = false
  const c = cornerPt(corner.value)
  const legs = Math.hypot(c.x - p.x, c.y - p.y) / Math.SQRT2
  if (legs > PINNED) {
    open.value = true
    vel = { x: 0, y: 0 }
  } else {
    rest()
  }
}

// near a corner, that corner turns up; away from it, it lies flat again
function onEnter(k: Corner) {
  if (mode.value !== 'rest' || dragging.value) return
  stopNudges()
  if (k !== corner.value) {
    corner.value = k
    place(atLegs(0.5))
  }
  settleTo(atLegs(HOVER))
}
function onLeave(k: Corner) {
  if (mode.value !== 'rest' || dragging.value || k !== corner.value) return
  if (k === HOME) settleTo(atLegs(REST))
  else settleTo(atLegs(0.5), () => mode.value === 'rest' && !dragging.value && corner.value === k && home())
}

// The first time, the corner lifts a little by itself, twice, so the eye finds it.
let nudges: ReturnType<typeof setTimeout>[] = []
function stopNudges() {
  nudges.forEach(clearTimeout)
  nudges = []
}
function nudge() {
  if (mode.value !== 'rest' || dragging.value || corner.value !== HOME) return
  settleTo(atLegs(NUDGE), () => nudges.push(setTimeout(() => mode.value === 'rest' && corner.value === HOME && settleTo(atLegs(REST)), 220)))
}

// --- lifecycle ------------------------------------------------------------------------------

let mq: MediaQueryList | undefined
// on a phone, only the home corner turns up (the others sit over the letterhead), and a tap
// anywhere off the paper lays it back down
const touch = ref(false)
function onTapOff(e: PointerEvent) {
  if (e.pointerType === 'mouse' || mode.value !== 'lifted' || dragging.value) return
  if ((e.target as Element | null)?.closest('.flap, .dog-ear, .data, .tag')) return
  rest()
}
function measureView() {
  view.value = { w: document.documentElement.clientWidth, h: window.innerHeight }
}
function enable() {
  if (!mq?.matches) {
    cancelAnimationFrame(raf)
    mode.value = 'off'
    document.documentElement.style.overflow = ''
    return
  }
  measureView()
  if (mode.value === 'off') {
    corner.value = HOME
    place(atLegs(REST))
    mode.value = 'rest'
  }
}

function onResize() {
  measureView()
  underside.value?.invalidate()
  if (mode.value === 'lifted') rest()
  else if (mode.value === 'rest') place(atLegs(corner.value === HOME ? REST : 0.5))
}
// a wheel on a page that is held open lets go of it; while dragging, it is ignored
function onWheel(e: WheelEvent) {
  if (mode.value !== 'lifted') return
  e.preventDefault()
  if (!dragging.value) rest()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && mode.value === 'lifted') rest()
}
function onBlur() {
  if (dragging.value) onUp()
}

onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  mq = matchMedia('(min-width: 1024px) and (pointer: fine), (pointer: coarse)')
  touch.value = matchMedia('(pointer: coarse)').matches
  mq.addEventListener('change', enable)
  window.addEventListener('resize', onResize)
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)
  window.addEventListener('blur', onBlur)
  window.addEventListener('pointermove', onPeekMove)
  window.addEventListener('pointerdown', onTapOff)
  enable()
  let seen = false
  try {
    seen = Boolean(sessionStorage.getItem('folio-peeled'))
  } catch {
    // private mode: nudge
  }
  if (!seen && !reduced) nudges = [setTimeout(nudge, 2400), setTimeout(nudge, 16000)]
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  stopNudges()
  clearTimeout(hold)
  mq?.removeEventListener('change', enable)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('blur', onBlur)
  window.removeEventListener('pointermove', onPeekMove)
  window.removeEventListener('pointerdown', onTapOff)
  const paper = document.querySelector<HTMLElement>('.paper')
  if (paper) paper.style.clipPath = ''
  document.documentElement.style.overflow = ''
})

// another page, another drawing: let the corner fall back first
watch(() => route.path, () => {
  if (mode.value === 'lifted') rest()
})
</script>

<template>
  <template v-if="mode !== 'off'">
    <!-- underneath (behind the paper in the desk's stacking) -->
    <PeelUnderside ref="underside" :uncovered :active="mode === 'lifted'" />
    <div v-if="shape && mode === 'lifted'" class="under-shade" :style="{ clipPath: shape.lifted, backgroundImage: shape.underShade }" />

    <!-- at rest the uncovered corner is drawn on its own, so the paper needs no clip -->
    <div v-if="shape && mode === 'rest'" class="corner-ground" :style="{ clipPath: shape.lifted }" />

    <!-- the back of the lifted paper -->
    <div v-if="shape" class="flap-shadow" :style="{ filter: shape.shadow }">
      <div
        class="flap"
        :style="{ clipPath: shape.flap, backgroundImage: shape.flapShade }"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
        @lostpointercapture="onUp"
      />
    </div>

    <template v-for="k in CORNERS" :key="k">
      <button
        v-if="(mode === 'rest' && (!touch || k === HOME)) || (dragging && k === corner)"
        type="button"
        class="dog-ear"
        :class="k"
        :tabindex="k === HOME ? 0 : -1"
        :aria-hidden="k === HOME ? undefined : 'true'"
        :aria-label="k === HOME ? 'Lift the corner of the page' : undefined"
        @pointerenter="onEnter(k)"
        @pointerleave="onLeave(k)"
        @pointerdown="onDown($event, k)"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
        @lostpointercapture="onUp"
        @click.prevent
        @keydown.enter.prevent="toggle"
        @keydown.space.prevent="toggle"
      />
    </template>
    <button v-if="open" type="button" class="sr-only" @click="rest()">
      Lay the page back down
    </button>
  </template>
</template>

<style scoped>
.under-shade,
.corner-ground {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
/* the sliver of the drawing seen under the dog-ear: the same red and grid as underneath */
.corner-ground {
  z-index: 30;
  background-color: #901112;
  background-image:
    linear-gradient(rgb(235 235 235 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgb(235 235 235 / 0.08) 1px, transparent 1px);
  background-size: 8px 8px;
  background-attachment: fixed;
}
.flap-shadow {
  position: fixed;
  inset: 0;
  z-index: 31;
  pointer-events: none;
}
.flap {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}
.flap:active {
  cursor: grabbing;
}
.dog-ear {
  position: fixed;
  z-index: 32;
  width: 72px;
  height: 72px;
  cursor: grab;
  touch-action: none;
  background: transparent;
}
/* only the corner triangle catches the pointer */
.dog-ear.br { right: 0; bottom: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%); }
.dog-ear.bl { left: 0; bottom: 0; clip-path: polygon(0 0, 100% 100%, 0 100%); }
.dog-ear.tr { right: 0; top: 0; clip-path: polygon(0 0, 100% 0, 100% 100%); }
.dog-ear.tl { left: 0; top: 0; clip-path: polygon(0 0, 100% 0, 0 100%); }
.dog-ear:focus-visible {
  outline: 1px solid var(--ui-primary);
  outline-offset: -10px;
}
</style>
