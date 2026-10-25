<script setup lang="ts">
import { seenSinceLoad } from '~/utils/once'
import { monogramPath } from '~/utils/signature'

// The home page and what lies under it, drawn apart (::page-layers). Both sheets are drawn in the
// page's own pixels, on its five columns (224 · 48 · 528 · 48 · 176) with the margins around them,
// so the letter is laid out as the home page is: the monogram and the portrait on the left, the
// name and the rows in the measure, the dateline, the hour and the notes on the right. Underneath,
// on Envers, the same blocks in outline, the movement and the sun's day under the hour, and the
// title block in the bottom left. The two sheets first lie together, then the letter rises and its
// bottom right corner turns back. Drawn once.
type P3 = [number, number, number]
const SW = 1024 // the sheet's columns, in the page's pixels
const SD = 960
const F = { x0: -72, y0: -64, x1: SW + 72, y1: SD + 40 } // the paper, margins included
const K = 120 / (F.x1 - F.x0) // pixels to drawing units
const GAP = 84 // how far the letter rises, in drawing units
const FOLD = 160 // the corner's fold, in pixels along each edge
const LIFT = 150 // how far the corner turns about its fold, in degrees

const C30 = Math.cos(Math.PI / 6)
// a point on or above a sheet, in pixels (z in drawing units), to the drawing
const project = ([x, y, z]: P3) => [(x - y) * K * C30, (x + y) * K * 0.5 - z] as const
const pts = (list: P3[]) => list.map(p => project(p).map(n => n.toFixed(2)).join(',')).join(' ')
// everything drawn flat on a sheet, in pixels, is set on it by this one matrix
const PLANE = `matrix(${K * C30} ${K * 0.5} ${-K * C30} ${K * 0.5} 0 0)`

// the letter, its corner cut where it folds
const paper = `${F.x0},${F.y0} ${F.x1},${F.y0} ${F.x1},${F.y1 - FOLD} ${F.x1 - FOLD},${F.y1} ${F.x0},${F.y1}`
const columns = [0, 224, 272, 800, 848, 1024]
const sections = [410, 546, 762]
const rows = [
  { y: 545, name: 41, desc: 190, end: 'year' },
  { y: 585, name: 72, desc: 118, end: 'year' },
  { y: 625, name: 73, desc: 145, end: 'year' },
  { y: 761, name: 41, desc: 310, end: 'role' },
  { y: 801, name: 50, desc: 205, end: 'role' },
  { y: 841, name: 36, desc: 190, end: 'role' },
]
// the measurements in the notes column: 96 = 4 × 24 between the sections
const brackets = [[313, 410], [450, 546], [665, 762]]

// the corner turning about its fold
const theta = ref(0)
const flap = computed(() => {
  const a = (theta.value * Math.PI) / 180
  const h = FOLD / 2
  const tip: P3 = [F.x1 - h + Math.cos(a) * h, F.y1 - h + Math.cos(a) * h, Math.sin(a) * Math.SQRT2 * h * K]
  return pts([[F.x1 - FOLD, F.y1, 0], [F.x1, F.y1 - FOLD, 0], tip])
})

// underneath: the movement and the sun's day under the hour, and the title block
const wheels = [
  { x: 960, y: 112, r: 50, teeth: 36, spokes: 4 },
  { x: 884, y: 172, r: 30, teeth: 24, spokes: 3 },
  { x: 1000, y: 210, r: 18, teeth: 0, spokes: 0 },
]
const ring = (w: { r: number, teeth: number }) => Array.from({ length: w.teeth }, (_, i) => (i / w.teeth) * 2 * Math.PI)
const spokes = (w: { spokes: number }) => Array.from({ length: w.spokes }, (_, i) => (i / w.spokes) * 2 * Math.PI + 0.4)
const sun = Array.from({ length: 41 }, (_, i) => {
  const t = i / 40
  return `${860 + t * 150},${330 - Math.sin(t * Math.PI) * 46 + 14}`
}).join(' ')
const block = { x: 0, y: 600, w: 460, h: 340, split: 190 }
const blockRows = Array.from({ length: 8 }, (_, i) => block.y + 64 + i * 30)

// where the letter's corners stand over the drawing's
const register = ([[F.x0, F.y0], [F.x1, F.y0], [F.x0, F.y1]] as const).map(([x, y]) => {
  const [x1, y1] = project([x, y, 0])
  const [x2, y2] = project([x, y, GAP])
  return { x1, y1, x2, y2 }
})

const right = project([F.x1, F.y0, 0])
const left = project([F.x0, F.y1, 0])
const front = project([F.x1, F.y1, 0])
const back = project([F.x0, F.y0, GAP])
const VB = { x: left[0] - 4, y: back[1] - 4, w: right[0] + 76 - (left[0] - 4), h: front[1] + 4 - (back[1] - 4) }
const labelAt = (z: number) => ({ left: `${((right[0] - VB.x) / VB.w) * 100}%`, top: `${((right[1] - z - VB.y) / VB.h) * 100}%` })

const root = useTemplateRef<HTMLElement>('root')
const shown = ref(false)
let io: IntersectionObserver | undefined
let raf = 0
function lift(from: number) {
  const step = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - from) / 700))
    theta.value = LIFT * (1 - (1 - t) ** 3)
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}
onMounted(() => {
  if (seenSinceLoad('page-layers') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = true
    theta.value = LIFT
    return
  }
  io = new IntersectionObserver(([e]) => {
    if (e && e.intersectionRatio > 0.6 && !shown.value) {
      shown.value = true
      seenSinceLoad('page-layers', true)
      io?.disconnect()
      lift(performance.now() + 900)
    }
  }, { threshold: [0.6] })
  if (root.value) io.observe(root.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<template>
  <figure ref="root" class="layers" :class="{ shown }">
    <div class="stage">
      <svg :viewBox="`${VB.x} ${VB.y} ${VB.w} ${VB.h}`" role="img" aria-label="The home page drawn apart: the letter lifted above the drawing that lies under it, its bottom right corner turning back">
        <!-- underneath, on Envers -->
        <g :transform="PLANE">
          <rect class="ground" :x="F.x0" :y="F.y0" :width="F.x1 - F.x0" :height="F.y1 - F.y0" />
          <line
            v-for="i in 35"
            :key="`gx${i}`"
            class="grid"
            :x1="F.x0 + i * 32"
            :y1="F.y0"
            :x2="F.x0 + i * 32"
            :y2="F.y1"
          />
          <line
            v-for="i in 31"
            :key="`gy${i}`"
            class="grid"
            :x1="F.x0"
            :y1="F.y0 + i * 32"
            :x2="F.x1"
            :y2="F.y0 + i * 32"
          />
          <line
            v-for="x in columns"
            :key="`uc${x}`"
            class="faint"
            :x1="x"
            :y1="0"
            :x2="x"
            :y2="SD"
          />
          <rect class="ghost" x="111" y="164" width="112" height="112" />
          <rect class="ghost" x="272" y="160" width="528" height="140" />
          <rect class="ghost" x="272" y="396" width="226" height="26" />
          <rect
            v-for="r in rows"
            :key="`gr${r.y}`"
            class="ghost"
            x="272"
            :y="r.y - 14"
            width="528"
            height="28"
          />
          <template v-for="(w, n) in wheels" :key="`w${n}`">
            <circle class="bone" :cx="w.x" :cy="w.y" :r="w.teeth ? w.r - 6 : w.r" />
            <line
              v-for="(a, i) in ring(w)"
              :key="`t${n}-${i}`"
              class="bone"
              :x1="w.x + Math.cos(a) * (w.r - 6)"
              :y1="w.y + Math.sin(a) * (w.r - 6)"
              :x2="w.x + Math.cos(a) * w.r"
              :y2="w.y + Math.sin(a) * w.r"
            />
            <line
              v-for="(a, i) in spokes(w)"
              :key="`s${n}-${i}`"
              class="bone"
              :x1="w.x + Math.cos(a) * 8"
              :y1="w.y + Math.sin(a) * 8"
              :x2="w.x + Math.cos(a) * (w.r - 12)"
              :y2="w.y + Math.sin(a) * (w.r - 12)"
            />
            <circle class="bone" :cx="w.x" :cy="w.y" :r="w.teeth ? 8 : 12" />
          </template>
          <line class="faint" x1="856" y1="344" x2="1014" y2="344" />
          <polyline class="bone" :points="sun" />
          <circle class="sun" cx="935" cy="298" r="5" />
          <rect class="bone" :x="block.x" :y="block.y" :width="block.w" :height="block.h" />
          <line class="bone" :x1="block.x" :y1="block.y + 34" :x2="block.x + block.w" :y2="block.y + 34" />
          <line class="bar" :x1="block.x + 16" :y1="block.y + 17" :x2="block.x + 120" :y2="block.y + 17" />
          <line class="bone" :x1="block.split" :y1="block.y + 34" :x2="block.split" :y2="block.y + block.h" />
          <template v-for="(y, i) in blockRows" :key="`br${i}`">
            <line class="faint" :x1="block.split" :y1="y" :x2="block.x + block.w" :y2="y" />
            <line class="text" :x1="block.split + 14" :y1="y - 15" :x2="block.split + 60" :y2="y - 15" />
            <line class="text" :x1="block.split + 84" :y1="y - 15" :x2="block.split + 140 + (i % 3) * 30" :y2="y - 15" />
          </template>
          <line
            v-for="i in 6"
            :key="`bar${i}`"
            class="bar"
            :x1="block.x + 24 + i * 10"
            :y1="block.y + 60 + i * 20"
            :x2="block.x + 44 + i * 18"
            :y2="block.y + 60 + i * 20"
          />
          <line class="faint" :x1="block.x + 20" :y1="block.y + 196" :x2="block.split - 20" :y2="block.y + 196" />
          <circle class="bone" :cx="block.x + 76" :cy="block.y + block.h - 66" r="42" />
          <circle class="faint" :cx="block.x + 76" :cy="block.y + block.h - 66" r="33" />
        </g>
        <g class="register">
          <line v-for="(l, i) in register" :key="`r${i}`" v-bind="l" />
        </g>
        <!-- the letter -->
        <g class="letter">
          <g :transform="PLANE">
            <polygon class="paper" :points="paper" />
            <!-- the ruler over the columns, and the columns themselves -->
            <line class="column strong" x1="0" y1="-20" :x2="SW" y2="-20" />
            <line
              v-for="x in columns"
              :key="`rt${x}`"
              class="column strong"
              :x1="x"
              y1="-26"
              :x2="x"
              y2="-14"
            />
            <line
              v-for="x in columns"
              :key="`c${x}`"
              class="column"
              :x1="x"
              y1="0"
              :x2="x"
              :y2="SD"
            />
            <path class="red-ink" :d="monogramPath" transform="translate(4 32) scale(0.042) translate(61 773)" />
            <line class="ink thin" x1="932" y1="40" x2="1024" y2="40" />
            <line class="ink thin" x1="918" y1="62" x2="1024" y2="62" />
            <circle class="red-ink" cx="940" cy="86" r="4" />
            <line class="faint-ink" x1="956" y1="88" x2="1024" y2="88" />
            <line class="column strong" x1="111" y1="150" x2="223" y2="150" />
            <line class="column strong" x1="111" y1="144" x2="111" y2="156" />
            <line class="column strong" x1="223" y1="144" x2="223" y2="156" />
            <rect class="portrait" x="111" y="164" width="112" height="112" />
            <line class="faint-ink" x1="196" y1="296" x2="223" y2="296" />
            <line class="ink title" x1="272" y1="178" x2="490" y2="178" />
            <line class="faint-ink" x1="272" y1="216" x2="400" y2="216" />
            <line class="red-stroke" x1="410" y1="216" x2="470" y2="216" />
            <line class="faint-ink" x1="480" y1="216" x2="520" y2="216" />
            <line class="faint-ink" x1="272" y1="257" x2="790" y2="257" />
            <line class="faint-ink" x1="272" y1="281" x2="362" y2="281" />
            <rect
              v-for="i in 7"
              :key="`i${i}`"
              class="icon"
              :x="272 + (i - 1) * 34"
              y="402"
              width="14"
              height="14"
            />
            <template v-for="y in sections" :key="`n${y}`">
              <line class="red-stroke" x1="0" :y1="y" x2="10" :y2="y" />
              <line class="faint-ink" x1="40" :y1="y" x2="86" :y2="y" />
              <line class="column strong" x1="100" :y1="y" x2="222" :y2="y" />
            </template>
            <template v-for="(r, i) in rows" :key="`row${i}`">
              <line class="ink" x1="272" :y1="r.y" :x2="272 + r.name" :y2="r.y" />
              <line class="faint-ink" :x1="284 + r.name" :y1="r.y" :x2="284 + r.name + r.desc" :y2="r.y" />
              <line class="leader" :x1="296 + r.name + r.desc" :y1="r.y" :x2="r.end === 'year' ? 710 : 744" :y2="r.y" />
              <line class="faint-ink" :x1="r.end === 'year' ? 722 : 756" :y1="r.y" :x2="i === 0 ? 772 : 800" :y2="r.y" />
              <line
                v-if="i === 0"
                class="red-stroke"
                x1="780"
                :y1="r.y"
                x2="800"
                :y2="r.y"
              />
            </template>
            <!-- the notes: the fonts beside the name, the measurements between the sections -->
            <template v-for="y in [189, 218, 567]" :key="`note${y}`">
              <line class="red-stroke thin" x1="852" :y1="y" x2="858" :y2="y" />
              <line class="faint-ink" x1="864" :y1="y" x2="940" :y2="y" />
            </template>
            <template v-for="[a, b] in brackets" :key="`m${a}`">
              <line class="column strong" x1="1013" :y1="a" x2="1013" :y2="b" />
              <line class="column strong" x1="1008" :y1="a" x2="1018" :y2="a" />
              <line class="column strong" x1="1008" :y1="b" x2="1018" :y2="b" />
              <line class="faint-ink" x1="940" :y1="(a + b) / 2" x2="1000" :y2="(a + b) / 2" />
            </template>
          </g>
          <polygon class="flap" :points="flap" />
        </g>
      </svg>
      <span class="label" :style="labelAt(GAP)">The letter</span>
      <span class="label" :style="labelAt(0)">Underneath</span>
    </div>
  </figure>
</template>

<style scoped>
.layers {
  margin: 32px 0 8px;
}
.stage {
  position: relative;
}
svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
line,
rect,
circle,
polygon,
polyline {
  vector-effect: non-scaling-stroke;
}
.ground {
  fill: #901112;
}
.grid {
  stroke: rgb(235 235 235 / 0.08);
  stroke-width: 0.5px;
}
.ghost {
  fill: none;
  stroke: rgb(235 235 235 / 0.4);
  stroke-width: 0.5px;
}
.bone {
  fill: none;
  stroke: #ebebeb;
  stroke-width: 0.6px;
}
.bar {
  stroke: #ebebeb;
  stroke-width: 1.4px;
}
.text {
  stroke: rgb(235 235 235 / 0.6);
  stroke-width: 0.8px;
}
.sun {
  fill: #ebebeb;
}
.faint {
  fill: none;
  stroke: rgb(235 235 235 / 0.3);
  stroke-width: 0.5px;
}
.register line {
  stroke: color-mix(in oklab, var(--ui-text) 28%, transparent);
  stroke-width: 0.5px;
  stroke-dasharray: 2 2;
  transform-box: fill-box;
  transform-origin: bottom;
  transform: scaleY(0);
}
/* the letter takes the page's own ground and ink, by day and by night */
.paper {
  fill: var(--ui-bg);
  stroke: color-mix(in oklab, var(--ui-text) 30%, transparent);
  stroke-width: 0.5px;
}
.column {
  stroke: color-mix(in oklab, var(--ui-text) 9%, transparent);
  stroke-width: 0.5px;
}
.column.strong {
  stroke: color-mix(in oklab, var(--ui-text) 22%, transparent);
}
.leader {
  stroke: color-mix(in oklab, var(--ui-text) 22%, transparent);
  stroke-width: 0.6px;
  stroke-dasharray: 1 2;
}
.ink {
  stroke: color-mix(in oklab, var(--ui-text-highlighted) 70%, transparent);
  stroke-width: 1.4px;
}
.ink.thin {
  stroke-width: 1px;
}
.ink.title {
  stroke-width: 2.4px;
}
.faint-ink {
  stroke: color-mix(in oklab, var(--ui-text) 30%, transparent);
  stroke-width: 1px;
}
.red-ink {
  fill: var(--ui-primary);
}
.red-stroke {
  stroke: var(--ui-primary);
  stroke-width: 1.4px;
}
.red-stroke.thin {
  stroke-width: 0.8px;
}
.icon {
  fill: color-mix(in oklab, var(--ui-text) 40%, transparent);
}
/* the portrait is a black and white photograph, dark by day and by night */
.portrait {
  fill: #262626;
  stroke: color-mix(in oklab, var(--ui-text) 25%, transparent);
  stroke-width: 0.5px;
}
.flap {
  fill: color-mix(in oklab, var(--ui-bg) 92%, var(--ui-text));
  stroke: color-mix(in oklab, var(--ui-text) 30%, transparent);
  stroke-width: 0.5px;
}
.letter {
  transition: transform 0.9s cubic-bezier(0.65, 0, 0.35, 1);
  filter: drop-shadow(0 6px 6px rgb(0 0 0 / 0.12));
}
.shown .letter {
  transform: translateY(calc(-1px * v-bind(GAP)));
}
.shown .register line {
  transform: scaleY(1);
  transition: transform 0.9s cubic-bezier(0.65, 0, 0.35, 1);
}
.label {
  position: absolute;
  transform: translate(10px, -50%);
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  opacity: 0;
  transition: opacity 0.4s ease 0.9s;
}
.shown .label {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .letter,
  .register line,
  .label {
    transition: none !important;
  }
}
</style>
