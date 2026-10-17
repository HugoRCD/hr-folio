<script setup lang="ts">
import { seenThisVisit } from '~/utils/once'
// The sheet's construction, drawn in its margins. It comes in levels of detail, set with the
// Detail control in the colophon, each adding something of a different kind:
//   1 Scale    the five column widths, once, above the letterhead
//   2 Grid     the column edges, full height, broken around text and plates
//   3 Drawing  the working drawing: the space between sections, the portrait in a square and
//              a circle, the specification of each type style, crop marks on plates
// Measured from the live layout. Rules: 12px clear of any text or image, labels 6px from
// their line, a label that would overlap another is dropped.

type Level = 1 | 2 | 3
type Tone = 'red' | 'faint' | 'guide'
type Shape = { level: Level, seq: number, dur?: number } & (
  | { kind: 'path', d: string, tone?: Tone }
  | { kind: 'text', x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end', rotate?: boolean }
)

const route = useRoute()
const detail = useState<number>('detail', () => 1)
const shapes = ref<Shape[]>([])
const size = ref({ w: 0, h: 0 })
const ready = ref(false)

const CLEAR = 12
const LABEL_GAP = 6
const crisp = (n: number) => Math.round(n) + 0.5

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
  const seq = { 1: 0, 2: 0, 3: 0 }
  const next = (level: Level) => seq[level]++
  const path = (level: Level, d: string, tone?: Tone, dur?: number) => out.push({ kind: 'path', level, seq: next(level), d, tone, dur })
  const line = (level: Level, x1: number, y1: number, x2: number, y2: number, tone?: Tone) => path(level, `M${x1} ${y1}L${x2} ${y2}`, tone)
  // a dimension line drawn from its middle outward, with end ticks
  const dimension = (level: Level, x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const s = next(level)
    out.push({ kind: 'path', level, seq: s, d: `M${mx} ${my}L${x1} ${y1}` }, { kind: 'path', level, seq: s, d: `M${mx} ${my}L${x2} ${y2}` })
    const vertical = x1 === x2
    for (const [x, y] of [[x1, y1], [x2, y2]] as const) {
      out.push({ kind: 'path', level, seq: s + 1, d: vertical ? `M${x - 3} ${y}h6` : `M${x} ${y - 3}v6` })
    }
  }
  const label = (level: Level, x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', rotate = false) => {
    const w = text.length * 5.6 + 2
    const h = 10
    const bx = rotate ? x - h : anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2
    const by = rotate ? y - w / 2 : y - 8
    const box = new DOMRect(bx, by, rotate ? h : w, rotate ? w : h)
    if (taken.some(t => box.left < t.right + 4 && box.right > t.left - 4 && box.top < t.bottom + 2 && box.bottom > t.top - 2)) return false
    taken.push(box)
    out.push({ kind: 'text', level, seq: next(level), x, y, text, anchor, rotate })
    return true
  }

  // 1 Scale: the columns, dimensioned once at the top of the sheet.
  const header = document.querySelector('header')
  const top = crisp((header?.getBoundingClientRect().top ?? 40) + sy - 20)
  const W = size.value.w
  const R = crisp(main.getBoundingClientRect().right + sx) // the measure's right edge
  const edges = narrow ? [L, R] : [S0, crisp(S0 + index), L, crisp(L + measureW), crisp(L + measureW + gutter), S1]
  if (narrow) {
    path(1, `M0 ${top}H${W}`, 'faint', 1.4)
    edges.forEach(x => path(1, `M${x} ${top - 3}v6`))
    for (const [a, b] of [[0, L], [L, R], [R, W]] as const) label(1, (a + b) / 2, top - LABEL_GAP, `${Math.round(b - a)}`)
  } else {
    path(1, `M${S0} ${top}L${S1} ${top}`, 'faint', 1.4)
    edges.forEach(x => path(1, `M${x} ${top - 3}v6`))
    const widths = [index, gutter, measureW, gutter, note]
    for (let i = 0; i < edges.length - 1; i++) {
      label(1, (edges[i]! + edges[i + 1]!) / 2, top - LABEL_GAP, `${widths[i]}`)
    }
  }

  // 2 Grid: the column edges, from the scale to the foot of the sheet. They break around every
  // line of text and every image they would touch, like hidden lines on a drawing, and around
  // plates with the full clearance.
  type Box = { left: number, right: number, top: number, bottom: number, pad: number }
  const toBox = (r: DOMRect, pad: number): Box => ({ left: r.left + sx, right: r.right + sx, top: r.top + sy, bottom: r.bottom + sy, pad })
  const plates = [...main.querySelectorAll<HTMLElement>('.code-block, .prose-breakout figure, .prose-breakout img, .prose-breakout video')]
    .map(el => toBox(el.getBoundingClientRect(), CLEAR))
  const ink: Box[] = []
  const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue
    range.selectNodeContents(n)
    for (const r of range.getClientRects()) ink.push(toBox(r, 6))
  }
  sheet.querySelectorAll('img, svg').forEach(el => ink.push(toBox(el.getBoundingClientRect(), 6)))
  // sticky blocks (the article contents) travel down their parent: keep that whole run clear
  sheet.querySelectorAll<HTMLElement>('.sticky').forEach((el) => {
    range.selectNodeContents(el)
    const r = range.getBoundingClientRect() // the extent of its text, not its box
    const run = el.parentElement!.getBoundingClientRect()
    ink.push({ left: r.left + sx, right: r.right + sx, top: run.top + sy, bottom: run.bottom + sy, pad: 6 })
  })
  const obstacles = [...plates, ...ink]
  const foot = Math.round(sheetBottom - 24)
  const minRun = narrow ? 16 : 4 // on a phone the edges touch every line: only keep the real gaps
  edges.forEach((x) => {
    const cuts = obstacles.filter(o => x > o.left - 4 && x < o.right + 4).sort((a, b) => a.top - b.top)
    let y = top + CLEAR
    let d = ''
    for (const o of cuts) {
      const stop = Math.round(o.top - o.pad)
      if (stop - y >= minRun) d += `M${x} ${y}V${stop}`
      y = Math.max(y, Math.round(o.bottom + o.pad))
    }
    if (foot - y >= minRun) d += `M${x} ${y}V${foot}`
    if (d) path(2, d, 'guide', 2.4)
  })

  // 3 Drawing: the space between sections at the sheet's right edge, the same number every time;
  // the portrait inscribed in a square and a circle, its side dimensioned.
  const sections = [...main.querySelectorAll<HTMLElement>('section')]
    .filter(s => s.querySelector('[data-construct="mark"], [data-construct="figure"]') && s.offsetParent)
    .map(s => s.getBoundingClientRect())
    .sort((a, b) => a.top - b.top)
  const rx = narrow ? crisp(W - 15) : crisp(S1 - CLEAR) // inside the sheet's edge, clear of its guide
  for (let i = 1; i < sections.length; i++) {
    const a = crisp(sections[i - 1]!.bottom + sy)
    const b = crisp(sections[i]!.top + sy)
    if (b - a < 16) continue
    dimension(3, rx, a, rx, b)
    const gap = Math.round(b - a)
    // the rhythm, in lines of the 24px leading where it divides evenly
    if (narrow) label(3, W - 6, (a + b) / 2, `${gap}`, 'middle', true)
    else label(3, rx - LABEL_GAP, (a + b) / 2 + 3, gap % 24 ? `${gap}` : `${gap} = ${gap / 24} × 24`, 'end')
  }
  if (narrow) {
    shapes.value = out
    return
  }

  const fig = document.querySelector<HTMLElement>('[data-construct="figure"]')
  if (fig && fig.offsetWidth > 60) {
    // The portrait as the square of a golden rectangle, set 12px clear of the picture, with the
    // rest of the rectangle divided into its squares and the spiral drawn through them, into the
    // empty index margin and towards the face. Nothing crosses the picture or its caption.
    const r = fig.getBoundingClientRect()
    const x = Math.round(r.left + sx)
    const y = Math.round(r.top + sy)
    const s = Math.round(r.width)
    const S = s + CLEAR * 2 // the square, around the picture
    const X = crisp(x - CLEAR)
    const Y = crisp(y - CLEAR)
    // Fibonacci-sized squares: S = a + b, a = b + c, b = c + e (136 = 84 + 52, 52 + 32, 32 + 20)
    const a = Math.round(S * 0.618)
    const b = S - a
    const c = a - b
    const e = b - c
    const left = X - a
    // the bottom edge breaks around the caption, as the guides do around text
    const cap = fig.parentElement?.querySelector('figcaption')?.getBoundingClientRect()
    const bottom = Y + S
    if (cap && cap.width && cap.top + sy < bottom + 6 && cap.bottom + sy > bottom - 6) {
      const g0 = Math.round(cap.left + sx - 6)
      const g1 = Math.round(cap.right + sx + 6)
      path(3, `M${left} ${bottom}H${Math.max(left, g0)}${g1 < X + S ? `M${g1} ${bottom}H${X + S}` : ''}`, 'faint', 1.4)
      path(3, `M${left} ${bottom}V${Y}H${X + S}V${bottom}`, 'faint', 1.6)
    } else {
      path(3, `M${left} ${Y}H${X + S}V${bottom}H${left}Z`, 'faint', 1.6)
    }
    // the divisions: the square, then each smaller square in turn
    path(3, `M${X} ${Y}V${bottom}M${left} ${Y + b}H${X}M${left + b} ${Y}V${Y + b}M${X - c} ${Y + c}H${X}M${X - e} ${Y + c}V${Y + b}`, 'faint', 1.4)
    // the spiral, one quarter per square, from the large square's corner to its eye
    path(3, `M${X} ${bottom}A${a} ${a} 0 0 1 ${left} ${Y + b}A${b} ${b} 0 0 1 ${left + b} ${Y}A${c} ${c} 0 0 1 ${X} ${Y + c}A${e} ${e} 0 0 1 ${X - e} ${Y + b}`, undefined, 2.2)
    // each square's side, and the series they make: each the sum of the next two, so the ratio
    // between neighbours closes on φ (136/84 = 1.619, 84/52 = 1.615, 52/32 = 1.625 …)
    label(3, X - 6, Y + b + 14, `${a}`, 'end')
    label(3, left + b - 6, Y + b - 6, `${b}`, 'end')
    label(3, left, bottom + 14, `${S} : ${a} : ${b} : ${c} → φ`, 'start')
    // the picture's side, dimensioned above it
    const yd = crisp(Y - CLEAR)
    dimension(3, x, yd, x + s, yd)
    line(3, x + 0.5, yd + 3, x + 0.5, Y - 3, 'faint')
    line(3, x + s - 0.5, yd + 3, x + s - 0.5, Y - 3, 'faint')
    label(3, x + s / 2, yd - LABEL_GAP, `${s}`)
  }

  // 3 Drawing: crop marks around plates, like a press sheet.
  plates.forEach((p) => {
    const x1 = crisp(p.left)
    const y1 = crisp(p.top)
    const x2 = crisp(p.right)
    const y2 = crisp(p.bottom)
    const m = 8
    const k = 8
    path(3, `M${x1 - m - k} ${y1}h${k}M${x1} ${y1 - m - k}v${k}M${x2 + m} ${y1}h${k}M${x2} ${y1 - m - k}v${k}M${x1 - m - k} ${y2}h${k}M${x1} ${y2 + m}v${k}M${x2 + m} ${y2}h${k}M${x2} ${y2 + m}v${k}`)
  })

  // 3 Drawing: the type specification, once per style, in the note margin on the line it describes.
  sheet.querySelectorAll<HTMLElement>('.in-note').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.height) taken.push(new DOMRect(r.left + sx - 4, r.top + sy - 4, r.width + 8, r.height + 8))
  })
  const noteLeft = L + measureW + gutter
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
    const spec = `${family} ${fontSize}${leading}${weight}${cs.fontStyle === 'italic' ? ' it.' : ''}`
    if (seen.has(spec)) continue
    seen.add(spec)
    const baseline = first.top + sy + (first.height + fontSize * 0.7) / 2
    if (label(3, noteLeft + 12, baseline, spec, 'start')) path(3, `M${noteLeft} ${crisp(baseline - 3)}h6`, 'red', 0.5)
  }

  // 3 Drawing: the ∞ is a lemniscate of Bernoulli, and is drawn from its equation
  const inf = main.querySelector<SVGElement>('[data-construct="infinity"]')
  if (inf) {
    const r = inf.getBoundingClientRect()
    const y = r.bottom + sy + 14
    if (label(3, noteLeft + 12, y, '(x² + y²)² = a²(x² − y²)', 'start')) path(3, `M${noteLeft} ${crisp(y - 3)}h6`, 'red', 0.5)
  }

  shapes.value = out
}

let raf = 0
const schedule = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(measure)
}

// entries slide in by a few pixels; measure once they have landed
async function settled() {
  const running = document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity)
  await Promise.race([Promise.allSettled(running.map(a => a.finished)), new Promise(r => setTimeout(r, 1200))])
}

async function redraw() {
  ready.value = false
  await settled()
  measure()
  // two frames: the shapes mount at rest, then transition to the current level
  requestAnimationFrame(() => requestAnimationFrame(() => (ready.value = true)))
}

// Lines draw themselves on the first load of a visit and when a level is chosen. Otherwise (other
// pages, later refreshes) the drawing is simply there, faded in with the page.
const instant = ref(false)

let ro: ResizeObserver | undefined
onMounted(() => {
  window.addEventListener('resize', schedule)
  ro = new ResizeObserver(schedule)
  const main = document.querySelector('main')
  if (main) ro.observe(main)
  document.fonts.ready.then(() => {
    if (seenThisVisit('construction', true)) instant.value = true
    redraw().then(() => setTimeout(() => (instant.value = false), 600))
  })
})
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('resize', schedule)
})

watch(() => route.path, async () => {
  instant.value = true
  ready.value = false
  await nextTick()
  await settled()
  measure()
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ready.value = true
    setTimeout(() => (instant.value = false), 600)
  }))
})
</script>

<template>
  <svg
    v-if="shapes.length"
    class="construction"
    :class="{ instant, shown: ready }"
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
        :class="[s.tone, { on: ready && s.level <= detail }]"
        :style="{ '--seq': s.seq, '--dur': `${s.dur ?? 1.1}s` }"
      />
      <text
        v-else
        :x="s.x"
        :y="s.y"
        :text-anchor="s.anchor"
        :transform="s.rotate ? `rotate(-90 ${s.x} ${s.y})` : undefined"
        :dominant-baseline="s.rotate ? 'middle' : undefined"
        :class="{ on: ready && s.level <= detail }"
        :style="{ '--seq': s.seq }"
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
.construction.instant {
  opacity: 0;
  transition: opacity 0.5s ease;
}
.construction.instant.shown {
  opacity: 1;
}
.construction.instant :is(path, text) {
  transition: none !important;
}
/* Lines draw on along their own direction when their level comes in, staggered within the
   level, and retract quickly and together when it goes. */
path {
  fill: none;
  stroke: color-mix(in oklab, var(--ui-text) 28%, transparent);
  stroke-width: 0.75;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 0.45s cubic-bezier(0.4, 0, 1, 1);
}
path.on {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--dur) cubic-bezier(0.65, 0, 0.35, 1);
  transition-delay: min(calc(var(--seq) * 45ms), 900ms);
}
path.faint {
  stroke: color-mix(in oklab, var(--ui-text) 13%, transparent);
}
path.guide {
  stroke: color-mix(in oklab, var(--ui-text) 7%, transparent);
}
path.red {
  stroke: color-mix(in oklab, var(--ui-primary) 80%, transparent);
}
text {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  fill: color-mix(in oklab, var(--ui-text) 42%, transparent);
  opacity: 0;
  transition: opacity 0.25s ease;
}
text.on {
  opacity: 1;
  transition: opacity 0.6s ease;
  transition-delay: calc(450ms + min(calc(var(--seq) * 45ms), 900ms));
}
@media (prefers-reduced-motion: reduce) {
  path, path.on, text, text.on {
    transition: none;
  }
}
</style>
