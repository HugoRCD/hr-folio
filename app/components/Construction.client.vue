<script setup lang="ts">
// The sheet's construction, drawn in its margins. It comes in levels of detail, set with the
// Detail control in the colophon, each adding something of a different kind:
//   1 Scale    the five column widths, once, above the letterhead
//   2 Grid     the column edges, full height, broken around text and plates
//   3 Drawing  the working drawing: the space between sections, the portrait's side, the
//              specification of each type style, crop marks on plates
// Measured from the live layout. Rules: no line touches anything it does not belong to (text,
// images, rules, borders, the drawing's own marks), labels 6px from their line, a label that
// would overlap another is dropped. Every line is a solid colour, mixed into the paper, so where
// two lines meet there is never a darker crossing.
//
// It is drawn once, when the page is first loaded, the way a draughtsman would: the scale is ruled
// across the top, the column edges come down the sheet one after the other, and the measurements
// are added as that pen passes them. Moving to another page, the drawing is simply there. At the
// Drawing level the sheet is still being worked on: now and then, one measurement in view is
// rubbed out and drawn again.

type Level = 1 | 2 | 3
type Tone = 'red' | 'faint' | 'guide'
type Ease = 'rule' | 'pen' | 'linear'
// `at`: seconds into its level's drawing; `dur`: how long the pen takes over it; `g`: the
// measurement it belongs to, redrawn together (-1: none)
type Shape = { level: Level, at: number, dur: number, g: number } & (
  | { kind: 'path', d: string, tone?: Tone, ease: Ease }
  | { kind: 'text', x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end', rotate?: boolean }
)

const PEN = 1400 // px/s, the pen's speed along a long rule
const STAGE: Record<Level, number> = { 1: 0, 2: 0.55, 3: 0.95 } // s, when each level starts
const EASE: Record<Ease, string> = {
  rule: 'cubic-bezier(0.3, 0, 0.3, 1)', // a rule drawn against a straightedge: a start, an end
  pen: 'cubic-bezier(0.45, 0, 0.35, 1)',
  linear: 'linear', // one long line broken into pieces: the pen keeps its speed across the gaps
}

const route = useRoute()
const detail = useState<number>('detail', () => 3)
const shapes = ref<Shape[]>([])
const size = ref({ w: 0, h: 0 })
const ready = ref(false)
// the lowest level being drawn now: the levels above it wait for it, as on the first drawing
const base = ref<Level>(1)
// A measurement worked on again: rubbed out (`resting`), then drawn again more slowly than the
// first time (`replay`), in fresh red ink (`fresh`) that dries back to the drawing's grey.
const resting = ref<number | null>(null)
const replay = ref<{ g: number, from: number } | null>(null)
const fresh = ref<number | null>(null)
const SLOW = 3 // the redraw takes three times as long as the first drawing
let groups = new Map<number, { y: number, from: number, to: number }>()

function delay(s: Shape) {
  if (replay.value?.g === s.g) return `${((s.at - replay.value.from) * SLOW).toFixed(3)}s`
  return `${Math.max(0, s.at + STAGE[s.level] - STAGE[base.value]).toFixed(3)}s`
}
const dur = (s: Shape) => `${(replay.value?.g === s.g ? Math.max(0.7, s.dur * SLOW) : s.dur).toFixed(3)}s`
const on = (s: Shape) => ready.value && s.level <= detail.value && (s.g < 0 || s.g !== resting.value)
const state = (s: Shape) => ({
  on: on(s),
  erasing: s.g >= 0 && s.g === resting.value,
  fresh: s.g >= 0 && s.g === fresh.value,
})

const CLEAR = 12
const LABEL_GAP = 6
const CROP = 8 // crop marks: 8px out from the plate, 8px long
const crisp = (n: number) => Math.round(n) + 0.5
// the pixel column or row an edge's last pixel is in, for the far side of a box
const crispEnd = (n: number) => Math.round(n) - 0.5

type Box = { left: number, right: number, top: number, bottom: number, pad: number }

function measure() {
  const main = document.querySelector<HTMLElement>('main.measure')
  const sheet = document.querySelector<HTMLElement>('.sheet')
  if (!main || !sheet) {
    shapes.value = []
    return
  }
  // On a phone the sheet is a single column between two 24px margins: the construction keeps to
  // what fits there (its widths, its two edges, the rhythm down the right margin).
  const narrow = window.innerWidth < 1024
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => Number.parseFloat(css.getPropertyValue(name))
  const index = v('--sheet-index')
  const gutter = v('--sheet-gutter')
  const measureW = v('--sheet-measure')
  const note = v('--sheet-note')
  const sx = window.scrollX
  const sy = window.scrollY
  const L = crisp(main.getBoundingClientRect().left + sx) // the measure's left edge
  const S0 = crisp(L - index - gutter) // the sheet's left edge
  const S1 = crisp(L + measureW + gutter + note) // the sheet's right edge
  const sheetBottom = sheet.getBoundingClientRect().bottom + sy
  // The overlay is as wide as the window, never wider: sized from the scroll width it would
  // keep the page as wide as it once was and scroll sideways after a resize.
  size.value = { w: document.documentElement.clientWidth, h: Math.ceil(sheetBottom) }

  const out: Shape[] = []
  const taken: DOMRect[] = []
  const found = new Map<number, { y: number, from: number }>()
  let g = -1
  let nextGroup = 0
  // one measurement: everything drawn inside belongs to it, and is redrawn with it
  const group = (y: number, draw: () => void) => {
    g = nextGroup++
    const first = out.length
    draw()
    const mine = out.slice(first)
    if (mine.length) found.set(g, { y, from: Math.min(...mine.map(s => s.at)), to: Math.max(...mine.map(s => s.at + s.dur)) })
    g = -1
  }
  // when the pen coming down the sheet from the top of the window reaches y
  const front = (y: number) => Math.max(0, y - sy) / PEN
  const path = (level: Level, d: string, at: number, dur: number, tone?: Tone, ease: Ease = 'pen') =>
    out.push({ kind: 'path', level, at, dur, d, tone, ease, g })
  // a dimension line drawn from its middle outward, then its end ticks (unless extension lines
  // close it instead); returns when it is done
  const dimension = (level: Level, x1: number, y1: number, x2: number, y2: number, at: number, ticks = true) => {
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const dur = Math.max(0.3, Math.hypot(x2 - x1, y2 - y1) / 2 / 500)
    path(level, `M${mx} ${my}L${x1} ${y1}`, at, dur)
    path(level, `M${mx} ${my}L${x2} ${y2}`, at, dur)
    if (!ticks) return at + dur
    const vertical = x1 === x2
    for (const [x, y] of [[x1, y1], [x2, y2]] as const) {
      path(level, vertical ? `M${x - 3} ${y}h6` : `M${x} ${y - 3}v6`, at + dur, 0.15)
    }
    return at + dur + 0.15
  }
  const label = (level: Level, x: number, y: number, text: string, at: number, anchor: 'start' | 'middle' | 'end' = 'middle', rotate = false) => {
    const w = text.length * 5.6 + 2
    const h = 10
    const bx = rotate ? x - h : anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2
    const by = rotate ? y - w / 2 : y - 8
    const box = new DOMRect(bx, by, rotate ? h : w, rotate ? w : h)
    if (taken.some(t => box.left < t.right + 4 && box.right > t.left - 4 && box.top < t.bottom + 2 && box.bottom > t.top - 2)) return false
    taken.push(box)
    out.push({ kind: 'text', level, at, dur: 0.5, x, y, text, anchor, rotate, g })
    return true
  }

  // 1 Scale: the columns, dimensioned once at the top of the sheet.
  const header = document.querySelector('header')
  const top = crisp((header?.getBoundingClientRect().top ?? 40) + sy - 20)
  const W = size.value.w
  const R = crisp(main.getBoundingClientRect().right + sx) // the measure's right edge
  const edges = narrow ? [L, R] : [S0, crisp(S0 + index), L, crisp(L + measureW), crisp(L + measureW + gutter), S1]
  // ruled left to right; each tick and width is set down as the pen passes it
  const [r0, r1] = narrow ? [0, W] : [S0, S1]
  const ruled = (r1 - r0) / PEN + 0.15
  const passes = (x: number) => ((x - r0) / (r1 - r0)) * ruled
  path(1, `M${r0} ${top}H${r1}`, 0, ruled, 'faint', 'rule')
  edges.forEach(x => path(1, `M${x} ${top - 3}v6`, passes(x), 0.15))
  const spans = narrow
    ? [[0, L], [L, R], [R, W]] as const
    : edges.slice(1).map((x, i) => [edges[i]!, x] as const)
  // read from the column's own edges: the lines' edges sit half a pixel over, onto the pixel grid
  const box = main.getBoundingClientRect()
  const widths = narrow ? [box.left, box.width, W - box.right].map(Math.round) : [index, gutter, measureW, gutter, note]
  spans.forEach(([a, b], i) => label(1, (a + b) / 2, top - LABEL_GAP, `${widths[i]}`, passes(b)))

  // What the column edges must not touch. Plates keep the whole of their crop marks clear; text,
  // images, rules and borders keep 6px.
  const toBox = (r: DOMRect, pad: number): Box => ({ left: r.left + sx, right: r.right + sx, top: r.top + sy, bottom: r.bottom + sy, pad })
  // a plate is the outermost of these: an image inside a figure is the same plate, marked once
  const PLATE = '.code-block, .prose-breakout figure, .prose-breakout img, .prose-breakout video'
  const plates = [...main.querySelectorAll<HTMLElement>(PLATE)]
    .filter(el => !el.parentElement?.closest(PLATE))
    .map(el => toBox(el.getBoundingClientRect(), 0))
  const obstacles: Box[] = plates.map(p => ({ ...p, pad: 2 * CROP + 6 }))
  const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim() || n.parentElement?.closest('[data-ignore]')) continue
    range.selectNodeContents(n)
    for (const r of range.getClientRects()) obstacles.push(toBox(r, 6))
  }
  for (const el of sheet.querySelectorAll('*')) {
    if (el.closest('[data-ignore]')) continue
    const r = el.getBoundingClientRect()
    if (el instanceof HTMLImageElement || el instanceof SVGSVGElement) {
      obstacles.push(toBox(r, 6))
      continue
    }
    if (el instanceof SVGElement || !r.width || !r.height) continue
    // anything drawn as a line: each side's border, or a box a pixel or two thin with a fill
    const cs = getComputedStyle(el)
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      const bw = Number.parseFloat(cs.getPropertyValue(`border-${side}-width`))
      if (!bw || cs.getPropertyValue(`border-${side}-style`) === 'none') continue
      const b = toBox(r, 6)
      if (side === 'top') b.bottom = b.top + bw
      if (side === 'bottom') b.top = b.bottom - bw
      if (side === 'left') b.right = b.left + bw
      if (side === 'right') b.left = b.right - bw
      obstacles.push(b)
    }
    if (Math.min(r.width, r.height) <= 2 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') obstacles.push(toBox(r, 6))
  }
  // sticky blocks (the article contents) travel down their parent: keep that whole run clear
  sheet.querySelectorAll<HTMLElement>('.sticky').forEach((el) => {
    range.selectNodeContents(el)
    const r = range.getBoundingClientRect() // the extent of its text, not its box
    const run = el.parentElement!.getBoundingClientRect()
    obstacles.push({ left: r.left + sx, right: r.right + sx, top: run.top + sy, bottom: run.bottom + sy, pad: 6 })
  })
  // the portrait's dimension, above it
  const fig = narrow ? null : document.querySelector<HTMLElement>('[data-construct="figure"]')
  const figure = fig && fig.offsetWidth > 60 ? fig.getBoundingClientRect() : null
  if (figure) obstacles.push({ ...toBox(figure, 6), top: figure.top + sy - CLEAR - 18 })

  // 2 Grid: the column edges, from the scale to the foot of the sheet, broken around all of the
  // above like hidden lines on a drawing. Each edge comes down at the pen's speed, one just after
  // the other, lifting over what it breaks around: every run is its own stroke.
  const foot = Math.round(sheetBottom - 24)
  const minRun = narrow ? 16 : 4 // on a phone the edges touch every line: only keep the real gaps
  edges.forEach((x, i) => {
    const cuts = obstacles.filter(o => x > o.left - o.pad && x < o.right + o.pad).sort((a, b) => a.top - b.top)
    const start = i * 0.08
    const run = (from: number, to: number) => path(2, `M${x} ${from}V${to}`, start + front(from), (to - from) / PEN, 'guide', 'linear')
    let y = top + CLEAR
    for (const o of cuts) {
      const stop = Math.round(o.top - o.pad)
      if (stop - y >= minRun) run(y, stop)
      y = Math.max(y, Math.round(o.bottom + o.pad))
    }
    if (foot - y >= minRun) run(y, foot)
  })

  // 3 Drawing: the space between sections at the sheet's right edge, the same number every time.
  const sections = [...main.querySelectorAll<HTMLElement>('section')]
    .filter(s => s.querySelector('[data-construct="mark"], [data-construct="figure"]') && s.offsetParent)
    .map(s => s.getBoundingClientRect())
    .sort((a, b) => a.top - b.top)
  // inside the sheet's edge, clear of its guide. Narrow, in the middle of the margin right of the
  // measure, where there is one wide enough (a tablet)
  const margin = W - R
  const rx = narrow ? crisp(R + margin / 2) : crisp(S1 - CLEAR)
  // a phone's 24px margin has no room for a dimension: it would sit against the screen's edge
  for (let i = 1; i < (narrow && margin < 48 ? 0 : sections.length); i++) {
    const a = crisp(sections[i - 1]!.bottom + sy)
    const b = crisp(sections[i]!.top + sy)
    if (b - a < 16) continue
    group((a + b) / 2, () => {
      const done = dimension(3, rx, a, rx, b, front((a + b) / 2))
      const gap = Math.round(b - a)
      // the rhythm, in lines of the 24px leading where it divides evenly
      if (narrow) label(3, rx + 9, (a + b) / 2, `${gap}`, done, 'middle', true)
      else label(3, rx - LABEL_GAP, (a + b) / 2 + 3, gap % 24 ? `${gap}` : `${gap} = ${gap / 24} × 24`, done, 'end')
    })
  }
  if (narrow) {
    shapes.value = out
    groups = found
    return
  }

  if (figure) {
    // The portrait's side, dimensioned above it. Its extension lines run down the picture's
    // first and last pixel columns, and close the dimension line themselves: one stroke each,
    // no tick laid over them.
    const x1 = crisp(figure.left + sx)
    const x2 = crispEnd(figure.right + sx)
    const y = Math.round(figure.top + sy)
    const yd = crisp(y - CLEAR)
    group(yd, () => {
      const done = dimension(3, x1, yd, x2, yd, front(yd), false)
      path(3, `M${x1} ${yd - 3}V${y - 3}`, done - 0.1, 0.2)
      path(3, `M${x2} ${yd - 3}V${y - 3}`, done - 0.1, 0.2)
      label(3, (x1 + x2) / 2, yd - LABEL_GAP, `${Math.round(figure.width)}`, done)
    })
  }

  // 3 Drawing: crop marks around plates, like a press sheet, on the plate's own outer pixels.
  plates.forEach((p) => {
    const x1 = crisp(p.left)
    const y1 = crisp(p.top)
    const x2 = crispEnd(p.right)
    const y2 = crispEnd(p.bottom)
    const m = CROP
    const k = CROP
    // where a column edge already runs along the plate's side, it is that side's mark: a vertical
    // arm beside it would read as a second, misplaced line
    const own = (x: number) => !edges.some(e => Math.abs(e - x) < 3)
    const arms = (y: number, dy: number) => [
      `M${x1 - m - k} ${y}h${k}`,
      own(x1) ? `M${x1} ${y + dy}v${k}` : '',
      `M${x2 + m} ${y}h${k}`,
      own(x2) ? `M${x2} ${y + dy}v${k}` : '',
    ].join('')
    group((y1 + y2) / 2, () => {
      path(3, arms(y1, -m - k), front(y1), 0.4)
      path(3, arms(y2, m), front(y2), 0.4)
    })
  })

  // 3 Drawing: the type specification, once per style, in the note margin on the line it
  // describes. Its red mark stands off the column edge rather than touching it.
  sheet.querySelectorAll<HTMLElement>('.in-note').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.height) taken.push(new DOMRect(r.left + sx - 4, r.top + sy - 4, r.width + 8, r.height + 8))
  })
  const noteLeft = crisp(L + measureW + gutter)
  const spec = (y: number, text: string) => group(y, () => {
    if (label(3, noteLeft + 12, y, text, front(y) + 0.25, 'start')) path(3, `M${noteLeft + 4} ${crisp(y - 3)}h4`, front(y), 0.25, 'red')
  })
  const seen = new Set<string>()
  for (const el of main.querySelectorAll<HTMLElement>('h1, h2, h3, p, pre, li a .font-medium, time')) {
    if (seen.size >= 8 || el.closest('.in-index, .in-note') || !el.offsetParent) continue
    const text = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent?.trim()) ?? el.querySelector('code') ?? el
    range.selectNodeContents(text)
    const [first] = range.getClientRects()
    if (!first) continue
    const cs = getComputedStyle(el)
    const family = cs.fontFamily.split(',')[0]!.replace(/["']/g, '').trim()
    const fontSize = Math.round(Number.parseFloat(cs.fontSize))
    const leading = cs.lineHeight === 'normal' ? '' : `/${Math.round(Number.parseFloat(cs.lineHeight))}`
    const weight = cs.fontWeight === '400' ? '' : ` ${cs.fontWeight}`
    const name = `${family} ${fontSize}${leading}${weight}${cs.fontStyle === 'italic' ? ' it.' : ''}`
    if (seen.has(name)) continue
    seen.add(name)
    spec(first.top + sy + (first.height + fontSize * 0.7) / 2, name)
  }

  // 3 Drawing: the ∞ is a lemniscate of Bernoulli, and is drawn from its equation
  const inf = main.querySelector<SVGElement>('[data-construct="infinity"]')
  if (inf) spec(inf.getBoundingClientRect().bottom + sy + 14, '(x² + y²)² = a²(x² − y²)')

  shapes.value = out
  groups = found
}

let raf = 0
const schedule = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(measure)
}

const frame = () => new Promise(r => requestAnimationFrame(r))
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

// Lines draw themselves when the page is loaded and when a level is chosen. On the pages visited
// after that, the drawing is set down at once, already finished.
const instant = ref(false)

watch(detail, (now, was) => {
  if (now > was) base.value = (was + 1) as Level
})

// At the Drawing level, every few seconds, one measurement in view is rubbed out and drawn again.
let alive: ReturnType<typeof setTimeout> | undefined
let reduced = false
function breathe() {
  alive = setTimeout(async () => {
    if (detail.value === 3 && ready.value && !instant.value && !document.hidden && !reduced && !replay.value) {
      const lo = scrollY + 48
      const hi = scrollY + innerHeight - 48
      const inView = [...groups].filter(([, m]) => m.y > lo && m.y < hi)
      const pick = inView[Math.floor(Math.random() * inView.length)]
      if (pick) {
        const [g, m] = pick
        resting.value = g // rubbed out, back along each line
        await wait(1100)
        fresh.value = g
        replay.value = { g, from: m.from }
        resting.value = null // drawn again, in fresh ink
        await wait(((m.to - m.from) * SLOW + 0.9) * 1000)
        fresh.value = null // the ink dries back to grey
        await wait(2600)
        if (replay.value?.g === g) replay.value = null
      }
    }
    breathe()
  }, 3500 + Math.random() * 3500)
}

let ro: ResizeObserver | undefined
onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('resize', schedule)
  ro = new ResizeObserver(schedule)
  const main = document.querySelector('main')
  if (main) ro.observe(main)
  document.fonts.ready.then(async () => {
    measure()
    base.value = 1
    // two frames: the shapes mount at rest, then draw up to the current level
    await frame()
    await frame()
    ready.value = true
  })
  breathe()
})
onBeforeUnmount(() => {
  ro?.disconnect()
  clearTimeout(alive)
  window.removeEventListener('resize', schedule)
})

watch(() => route.path, async () => {
  instant.value = true
  ready.value = false
  replay.value = null
  resting.value = null
  fresh.value = null
  await nextTick()
  await frame()
  measure()
  ready.value = true
  await frame()
  await frame()
  instant.value = false
})
</script>

<template>
  <svg
    v-if="shapes.length"
    class="construction"
    :class="{ instant }"
    :width="size.w"
    :height="size.h"
    :viewBox="`0 0 ${size.w} ${size.h}`"
    aria-hidden="true"
  >
    <template v-for="(s, i) in shapes" :key="i">
      <path
        v-if="s.kind === 'path'"
        :d="s.d"
        pathLength="1"
        :class="[s.tone, state(s)]"
        :style="{ '--delay': delay(s), '--dur': dur(s), '--ease': EASE[s.ease] }"
      />
      <text
        v-else
        :x="s.x"
        :y="s.y"
        :text-anchor="s.anchor"
        :transform="s.rotate ? `rotate(-90 ${s.x} ${s.y})` : undefined"
        :dominant-baseline="s.rotate ? 'middle' : undefined"
        :class="state(s)"
        :style="{ '--delay': delay(s) }"
      >
        {{ s.text }}
      </text>
    </template>
  </svg>
</template>

<style scoped>
.construction {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.construction.instant :is(path, text) {
  transition: none !important;
}
/* Lines draw on along their own direction when their level comes in, each when the pen reaches
   it, and retract quickly and together when it goes. Colours are mixed into the paper, never
   made see-through: where two lines meet, nothing darkens. */
path {
  fill: none;
  stroke: color-mix(in oklab, var(--ui-text) 28%, var(--ui-bg));
  stroke-width: 0.75;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 0.45s cubic-bezier(0.4, 0, 1, 1);
}
path.on {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--dur) var(--ease) var(--delay), stroke 2.4s ease;
}
/* worked on again: rubbed out slowly, back along the line; redrawn in fresh ink, which then
   dries back to the line's own colour */
path.erasing {
  transition: stroke-dashoffset 0.9s cubic-bezier(0.45, 0, 0.55, 1);
}
path.on.fresh {
  stroke: color-mix(in oklab, var(--ui-primary) 75%, var(--ui-bg));
  transition: stroke-dashoffset var(--dur) var(--ease) var(--delay), stroke 0s;
}
path.faint {
  stroke: color-mix(in oklab, var(--ui-text) 13%, var(--ui-bg));
}
path.guide {
  stroke: color-mix(in oklab, var(--ui-text) 7%, var(--ui-bg));
}
path.red {
  stroke: color-mix(in oklab, var(--ui-primary) 80%, var(--ui-bg));
}
text {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  fill: color-mix(in oklab, var(--ui-text) 42%, var(--ui-bg));
  opacity: 0;
  transition: opacity 0.25s ease;
}
text.on {
  opacity: 1;
  transition: opacity 0.5s ease var(--delay), fill 2.4s ease;
}
text.erasing {
  transition: opacity 0.6s ease;
}
text.on.fresh {
  fill: color-mix(in oklab, var(--ui-primary) 75%, var(--ui-bg));
  transition: opacity 0.6s ease var(--delay), fill 0s;
}
@media (prefers-reduced-motion: reduce) {
  path, path.on, text, text.on {
    transition: none;
  }
}
</style>
