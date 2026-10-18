<script setup lang="ts">
import { seenSinceLoad } from '~/utils/once'
// "Until further notice", drawn rather than typed: a lemniscate, slightly inclined like a hand
// would write it, ruled once in the red when it comes into view. Then a small beam of light goes
// round it, slowly, without end: it is the one thing on the page that never stops.
//
// Pointed at, the mark itself grows into a detail, like a magnified view on a drawing, on a patch
// of paper that fades into the page. There it is drawn again the way it is defined: a lemniscate
// of Bernoulli is every point whose distances to two fixed points, its foci, multiply to the same
// number. The ink lifts back to a pencil line, the axis is ruled, the foci are marked, then a pen
// goes round, tied to both foci by a thread, inking the curve behind it. Let go, the pen finishes
// its line, the construction is cleared, and the detail shrinks back into the mark.
//
// One timeline, run by script frame by frame, so that any change of mind (leaving halfway,
// coming back) carries on from where it is rather than jumping.
const { width = 26 } = defineProps<{ width?: number }>()

// lemniscate of Bernoulli, sampled upright; the 12° slant is the group's skew, so everything
// drawn with it is in the curve's own frame and stays true to it
const A = 50 // half-width, in viewBox units
const FOCUS = A / Math.SQRT2
const N = 160
const points = Array.from({ length: N }, (_, i) => {
  const t = (i / N) * Math.PI * 2 - Math.PI / 2 // start at the crossing, heading up-right
  const d = 1 + Math.sin(t) ** 2
  return [(Math.cos(t) / d) * A, -((Math.sin(t) * Math.cos(t)) / d) * A] as const
})
const d = `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`
const height = width * 0.42
const INK = 5.5 // the mark's stroke, in viewBox units

// the detail: 1.5px a unit, so the loop is 150px across. At its smallest it is exactly the mark,
// same units, same stroke, so the one turns into the other.
const SCALE = 1.5
const BOX = { w: 172, h: 92 }
const GROW = width / 112 / SCALE

const root = useTemplateRef<SVGSVGElement>('root')
const detailEl = useTemplateRef<HTMLElement>('detailEl')
const paper = useTemplateRef<HTMLElement>('paper')
const axis = useTemplateRef<SVGGElement>('axis')
const sketch = useTemplateRef<SVGPathElement>('sketch')
const line = useTemplateRef<SVGPathElement>('line')
const foci = useTemplateRef<SVGPathElement>('foci')
const pen = useTemplateRef<SVGCircleElement>('pen')
const threads = useTemplateRef<SVGGElement>('threads')
const eq = useTemplateRef<SVGTextElement>('eq')

const drawn = ref(false)
const still = ref(false)
const awake = ref(false) // in view: the beam only travels while it can be seen
const mounted = ref(false) // the detail exists from the first time it is opened
const active = ref(false) // the detail is showing, at any size
let study = false
let io: IntersectionObserver | undefined

// the timeline, in seconds from opening
const T = {
  lift: [0.3, 0.65], // the ink lifts to a pencil line
  axis: [0.35, 0.8], // the axis is ruled out from the centre
  foci: [0.55, 0.85],
  pen: [0.75, 0.95], // the pen and its threads come in
  ink: 0.85, // the pen starts round
  loop: 2.4,
}
const DRIFT = T.loop / 0.6 // afterwards it keeps going, at the speed it ended on
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const span = (t: number, [a, b]: number[]) => {
  const u = clamp((t - a!) / (b! - a!))
  return u * u * (3 - 2 * u)
}
const ease = (u: number) => 0.6 * u + 0.4 * (0.5 - Math.cos(Math.PI * u) / 2)
// moves `v` toward `to`, the same way whatever the frame rate: τ is the time to cover 63%
const toward = (v: number, to: number, tau: number, dt: number) => v + (to - v) * (1 - Math.exp(-dt / tau))

let raf = 0
let target = 0 // 1 open, 0 closed
let size = 0 // 0 the mark, 1 the detail
let t = 0 // time since opening
let shown = 0 // how much of the construction shows, 1 while open
let progress = 1 // how much of the curve is inked
let pos = 0 // where the pen is, in turns
let last = 0

function step(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  if (target) {
    t += dt
    shown = toward(shown, 1, 0.08, dt)
    size = toward(size, 1, 0.12, dt)
    if (t < T.ink) {
      progress = t < T.lift[1]! ? 1 : 0 // swapped while the ink is lifted, so it never shows
      pos = 0
    } else if (t < T.ink + T.loop) {
      pos = ease((t - T.ink) / T.loop)
      progress = pos
    } else {
      pos = 1 + (t - T.ink - T.loop) / DRIFT
      progress = 1
    }
  } else {
    // let go: the pen finishes its line and the construction clears, then it shrinks back
    progress = toward(progress, 1, 0.07, dt)
    shown = toward(shown, 0, 0.07, dt)
    if (shown < 0.3) size = toward(size, 0, 0.11, dt)
  }
  const lifted = target ? span(t, T.lift) * (t < T.ink ? 1 : 0) : 0
  const s = GROW + (1 - GROW) * size
  const px = 1 / (SCALE * s) // a screen pixel, in viewBox units
  const inking = target && t >= T.ink ? 1 : 0

  detailEl.value!.style.transform = `translate(-50%, -50%) scale(${s})`
  paper.value!.style.opacity = String(size)
  // the ink thins as it grows: the mark's weight at its size, a fine 2px line at full size
  line.value!.style.strokeWidth = String(INK + (2 * px - INK) * Math.sqrt(size))
  line.value!.style.strokeDashoffset = String(1 - progress)
  line.value!.style.opacity = String(inking || !target ? 1 : 1 - lifted)
  sketch.value!.style.strokeWidth = String(0.75 * px)
  sketch.value!.style.opacity = String(shown * (target ? span(t, T.lift) : 1))
  axis.value!.style.opacity = String(shown)
  for (const p of axis.value!.children as HTMLCollectionOf<SVGPathElement>) {
    p.style.strokeWidth = String(0.75 * px)
    p.style.strokeDashoffset = String(1 - (target ? span(t, T.axis) : 1))
  }
  foci.value!.style.strokeWidth = String(0.75 * px)
  foci.value!.style.opacity = String(shown * (target ? span(t, T.foci) : 1))
  const penIn = shown * (target ? span(t, T.pen) : 1)
  const settled = target ? span(t, [T.ink + T.loop, T.ink + T.loop + 0.8]) : 0
  pen.value!.style.opacity = String(penIn)
  pen.value!.setAttribute('r', String(1.6 * px))
  threads.value!.style.opacity = String(penIn * (1 - 0.45 * settled))
  eq.value!.style.opacity = String(shown * settled)

  const path = line.value!
  const p = path.getPointAtLength((pos % 1) * path.getTotalLength())
  pen.value!.setAttribute('cx', p.x.toFixed(2))
  pen.value!.setAttribute('cy', p.y.toFixed(2))
  for (const l of threads.value!.children as HTMLCollectionOf<SVGLineElement>) {
    l.style.strokeWidth = String(0.75 * px)
    l.setAttribute('x2', p.x.toFixed(2))
    l.setAttribute('y2', p.y.toFixed(2))
  }

  if (!target && size < 0.002) {
    active.value = false
    size = 0
    return
  }
  raf = requestAnimationFrame(step)
}

async function enter() {
  if (!study || !drawn.value) return
  if (!mounted.value) {
    mounted.value = true
    await nextTick()
  }
  // coming back while it is still large: carry on drawing; otherwise start the drawing again
  if (!(active.value && size > 0.6 && t >= T.ink + T.loop)) t = 0
  target = 1
  if (active.value) return
  active.value = true
  last = performance.now()
  raf = requestAnimationFrame(step)
}

function leave() {
  target = 0
}

onMounted(() => {
  study = matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches
  if (!root.value) return
  // drawn once per load; on the pages visited after that it is simply there
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || seenSinceLoad('infinity')) {
    still.value = true
    drawn.value = true
  }
  io = new IntersectionObserver(([e]) => {
    awake.value = !!e?.isIntersecting
    if (drawn.value || !e || e.intersectionRatio < 1) return
    seenSinceLoad('infinity', true)
    drawn.value = true
  }, { threshold: [0, 1] })
  io.observe(root.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<template>
  <span class="mark" :class="{ active }" @pointerenter="enter" @pointerleave="leave">
    <svg
      ref="root"
      class="infinity"
      data-construct="infinity"
      :class="{ drawn, still, awake }"
      viewBox="-56 -21 112 42"
      :width
      :height
      role="img"
      aria-label="ongoing"
    >
      <!-- a little more to point at than the stroke itself -->
      <rect
        x="-64"
        y="-30"
        width="128"
        height="60"
        fill="transparent"
        pointer-events="all"
      />
      <g transform="skewX(12)">
        <path class="ink" :d pathLength="1" />
        <g class="beam">
          <path class="tail" :d pathLength="1" style="--len: 0.16" />
          <path class="body" :d pathLength="1" style="--len: 0.07" />
          <path class="head" :d pathLength="1" style="--len: 0.025" />
        </g>
      </g>
    </svg>

    <span
      v-if="mounted"
      ref="detailEl"
      class="detail"
      data-ignore
      aria-hidden="true"
    >
      <span ref="paper" class="paper" />
      <svg
        data-ignore
        :viewBox="`${-BOX.w / 2} ${-BOX.h / 2} ${BOX.w} ${BOX.h}`"
        :width="BOX.w * SCALE"
        :height="BOX.h * SCALE"
      >
        <g transform="skewX(12)">
          <!-- two halves, so both are ruled out from the centre at once -->
          <g ref="axis" class="axis">
            <path :d="`M0 0H${-A - 10}`" pathLength="1" />
            <path :d="`M0 0H${A + 10}`" pathLength="1" />
          </g>
          <path ref="sketch" class="sketch" :d />
          <g ref="threads" class="thread">
            <line :x1="-FOCUS" y1="0" :x2="-FOCUS" y2="0" />
            <line :x1="FOCUS" y1="0" :x2="FOCUS" y2="0" />
          </g>
          <path ref="line" class="line" :d pathLength="1" />
          <path ref="foci" class="focus" :d="`M${-FOCUS - 2.5} 0h5M${-FOCUS} -2.5v5M${FOCUS - 2.5} 0h5M${FOCUS} -2.5v5`" />
          <circle ref="pen" class="pen" cx="0" cy="0" r="1" />
        </g>
        <text ref="eq" class="eq" x="0" :y="A * 0.72" text-anchor="middle">d₁ · d₂ = a²/2</text>
      </svg>
    </span>
  </span>
</template>

<style scoped>
.mark {
  position: relative;
  display: inline-block;
  vertical-align: -0.12em;
}
.infinity {
  display: block;
  overflow: visible;
}
/* while the detail shows, the mark is the detail: it hands over its ink */
.active .infinity {
  visibility: hidden;
}
path, line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ink {
  stroke: var(--ui-primary);
  stroke-width: 5.5;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.8s cubic-bezier(0.45, 0, 0.25, 1) 0.2s;
}
.drawn .ink {
  stroke-dashoffset: 0;
}
.still .ink {
  transition: none;
}

/* the beam: a bright point with a fading tail, three dashes ending at the same place */
.beam path {
  stroke: color-mix(in oklab, white 72%, var(--ui-primary));
  stroke-width: 5.5;
  stroke-dasharray: var(--len) calc(1 - var(--len));
  stroke-dashoffset: calc(1 + var(--len));
  animation: wander 7s linear infinite paused;
}
/* not `:global(.light) .beam path`: Vue compiles that to `.light` alone, which matches <html> */
html.light .beam path {
  stroke: color-mix(in oklab, white 58%, var(--ui-primary));
}
.beam {
  opacity: 0;
  transition: opacity 1.2s ease 2.2s; /* after the ink has been ruled */
}
.still .beam {
  transition-delay: 0s;
}
.drawn .beam {
  opacity: 1;
}
.awake.drawn .beam path {
  animation-play-state: running;
}
.tail { opacity: 0.18; }
.body { opacity: 0.4; }
.head { opacity: 0.9; }
@keyframes wander {
  to { stroke-dashoffset: var(--len); }
}

/* the detail: every value below is set frame by frame from the timeline */
.detail {
  position: absolute;
  z-index: 30;
  top: 50%;
  left: 50%;
  padding: 24px 40px;
  pointer-events: none;
  visibility: hidden;
  transform: translate(-50%, -50%) scale(0);
}
.active .detail {
  visibility: visible;
  pointer-events: auto; /* the whole detail can be looked at without it closing */
}
.paper {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse closest-side, var(--ui-bg) 62%, transparent);
  opacity: 0;
}
.detail svg {
  position: relative;
  display: block;
  overflow: visible;
}
.axis path {
  stroke: color-mix(in oklab, var(--ui-text) 24%, var(--ui-bg));
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
}
.axis, .sketch, .focus, .thread, .pen, .eq {
  opacity: 0;
}
.sketch {
  stroke: color-mix(in oklab, var(--ui-text) 16%, var(--ui-bg));
}
.focus {
  stroke: var(--ui-primary);
}
.thread line {
  stroke: color-mix(in oklab, var(--ui-primary) 50%, var(--ui-bg));
}
.line {
  stroke: var(--ui-primary);
  stroke-width: 5.5;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 0;
}
.pen {
  fill: var(--ui-primary);
}
.eq {
  font-family: var(--font-mono);
  font-size: 6px; /* 9px at the detail's scale */
  letter-spacing: 0.04em;
  fill: color-mix(in oklab, var(--ui-text) 45%, var(--ui-bg));
}
@media (prefers-reduced-motion: reduce) {
  .ink { transition: none; }
  .beam { display: none; }
}
</style>
