<script setup lang="ts">
// A watch movement, drawn as a plan, running on the time where Hugo is. The train is a real one:
// centre wheel 64 → third pinion 8, third wheel 60 → fourth pinion 8, fourth wheel 72 → escape
// pinion 6. So the centre arbor turns once an hour, the fourth once a minute, and the 20-tooth
// escape wheel 12 times a minute, released half a tooth per beat: 8 beats a second, 28,800 vph.
// Every wheel is rotated from one stepped clock, and each pair is phased so its teeth mesh.
import { secondsOfDay, zoneOffsetMs } from '~/utils/zone'

const { running = false, shown = false, timeZone = 'Europe/London' } = defineProps<{
  running?: boolean
  shown?: boolean
  timeZone?: string
}>()

type Teeth = { t: number, r: number, kind: 'wheel' | 'pinion' | 'escape' }
const M = 1 // module

function toothed({ t, r, kind }: Teeth) {
  const step = (Math.PI * 2) / t
  const pts: [number, number][] = []
  const at = (rad: number, a: number) => pts.push([rad * Math.cos(a), rad * Math.sin(a)])
  for (let i = 0; i < t; i++) {
    const a = i * step
    if (kind === 'escape') {
      // club-less ratchet teeth, leaning the way the wheel turns
      at(r - 3.4, a)
      at(r, a - step * 0.55)
      at(r - 0.9, a - step * 0.72)
    } else {
      const ro = r + M
      const ri = r - 1.25 * M
      at(ri, a - step * 0.32)
      at(ro, a - step * 0.15)
      at(ro, a + step * 0.15)
      at(ri, a + step * 0.32)
    }
  }
  return `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`
}

const circle = (r: number) => `M${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`

// spokes: crossings from the hub to the rim, as on a finished wheel
function spokes(n: number, r0: number, r1: number) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const b = a + 0.16
    const c = a - 0.16
    d += `M${(r0 * Math.cos(a)).toFixed(2)} ${(r0 * Math.sin(a)).toFixed(2)}L${(r1 * Math.cos(b)).toFixed(2)} ${(r1 * Math.sin(b)).toFixed(2)}`
    d += `M${(r0 * Math.cos(a)).toFixed(2)} ${(r0 * Math.sin(a)).toFixed(2)}L${(r1 * Math.cos(c)).toFixed(2)} ${(r1 * Math.sin(c)).toFixed(2)}`
  }
  return d
}

const deg = Math.PI / 180
const polar = (o: { x: number, y: number }, d: number, a: number) => ({ x: o.x + d * Math.cos(a * deg), y: o.y + d * Math.sin(a * deg) })

const C = { x: -50, y: 22 }
const T = polar(C, 32 + 4, -25)
const F = polar(T, 30 + 4, -75)
const E = polar(F, 36 + 3, 0)
const B = polar(E, 40, 70)
const P = polar(E, 22, 70) // the pallet fork's pivot

// tooth phase so that a tooth of the driver sits in a gap of the driven at the line of centres
const mesh = (from: { x: number, y: number }, to: { x: number, y: number }, t1: number, t2: number) => {
  const th = Math.atan2(to.y - from.y, to.x - from.x)
  return th + Math.PI - Math.PI / t2 + th * (t1 / t2)
}
const offT = mesh(C, T, 64, 8)
const offF = mesh(T, F, 60, 8)
const offE = mesh(F, E, 72, 6)

const parts = [
  { id: 'C', at: C, layers: [{ t: 64, r: 32, kind: 'wheel' as const }], rim: 32 - 1.25 - 3, spokes: 5, tone: 0.55 },
  { id: 'T', at: T, layers: [{ t: 60, r: 30, kind: 'wheel' as const }, { t: 8, r: 4, kind: 'pinion' as const }], rim: 30 - 1.25 - 3, spokes: 5, tone: 0.7 },
  { id: 'F', at: F, layers: [{ t: 72, r: 36, kind: 'wheel' as const }, { t: 8, r: 4, kind: 'pinion' as const }], rim: 36 - 1.25 - 3, spokes: 5, tone: 0.85 },
  { id: 'E', at: E, layers: [{ t: 20, r: 13, kind: 'escape' as const }, { t: 6, r: 3, kind: 'pinion' as const }], rim: 13 - 3.4 - 2, spokes: 4, tone: 1 },
].map(p => ({ ...p, paths: p.layers.map(toothed), spokePath: spokes(p.spokes, 4, p.rim), rimPath: circle(p.rim) }))

// the balance: rim, arms, timing screws, and its hairspring
const balanceRim = `${circle(20)}${circle(17.6)}`
const balanceArms = 'M-17.6 0H17.6'
const screws = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8
  return { x: 21.2 * Math.cos(a), y: 21.2 * Math.sin(a) }
})
const hairspring = (() => {
  const pts: string[] = []
  for (let i = 0; i <= 240; i++) {
    const a = (i / 240) * Math.PI * 2 * 5.5
    const r = 2.2 + (i / 240) * 10.5
    pts.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}`
})()

// the fork: an anchor whose two stones meet the escape wheel, and a fork towards the balance
const toE = Math.atan2(E.y - P.y, E.x - P.x) / deg
const stoneA = polar(E, 14.5, 70 - 40)
const stoneB = polar(E, 14.5, 70 + 40)
const forkEnd = polar(P, 13, toE + 180)
const fork = `M${stoneA.x - P.x} ${stoneA.y - P.y}L0 0L${stoneB.x - P.x} ${stoneB.y - P.y}M0 0L${forkEnd.x - P.x} ${forkEnd.y - P.y}`
  + `m-2 -1.5l2 1.5l-2 1.5`

const els = new Map<string, SVGGElement>()
const setEl = (id: string) => (el: unknown) => {
  if (el) els.set(id, el as SVGGElement)
}
const rot = (id: string, x: number, y: number, rad: number) => els.get(id)?.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(rad / deg).toFixed(3)})`)

let offset = 0
let offsetAt = 0
let raf = 0
let timer: ReturnType<typeof setInterval> | undefined
const reduced = import.meta.client && matchMedia('(prefers-reduced-motion: reduce)').matches
const ease = (u: number) => 1 - (1 - u) ** 3

function frame() {
  const now = Date.now()
  if (now - offsetAt > 60000) {
    offset = zoneOffsetMs(new Date(now), timeZone)
    offsetAt = now
  }
  const t = secondsOfDay(now, offset)
  const beats = t * 8
  const b = Math.floor(beats)
  const snap = reduced ? 0 : ease(Math.min(1, (beats - b) / 0.14))
  const stepped = (b + snap) / 8 // seconds, advancing in eighth-second jumps
  const rC = (Math.PI * 2 * (stepped % 3600)) / 3600
  const rT = -rC * 8 + offT
  const rF = -rT * 7.5 + offF
  const rE = -rF * 12 + offE
  rot('C', C.x, C.y, rC)
  rot('T', T.x, T.y, rT)
  rot('F', F.x, F.y, rF)
  rot('E', E.x, E.y, rE)
  // the balance swings 220° each way at 4 Hz, through the centre on every beat
  const swing = reduced ? 0 : 220 * deg * Math.sin(Math.PI * 2 * 4 * (t % 1))
  rot('B', B.x, B.y, swing)
  rot('S', B.x, B.y, swing * 0.06)
  rot('P', P.x, P.y, ((b % 2 ? 1 : -1) * (reduced ? 1 : (snap * 2 - 1)) * 6) * deg)
  // the hands: hours and minutes on the centre arbor, seconds on the fourth
  const minutes = (t % 3600) / 60
  rot('hM', C.x, C.y, (minutes / 60) * Math.PI * 2)
  rot('hH', C.x, C.y, ((t / 3600) % 12 / 12) * Math.PI * 2)
  rot('hS', F.x, F.y, ((stepped % 60) / 60) * Math.PI * 2)
  if (running && !reduced) raf = requestAnimationFrame(frame)
}

function start() {
  stop()
  offsetAt = 0
  if (reduced) {
    frame()
    timer = setInterval(frame, 1000)
  } else {
    raf = requestAnimationFrame(frame)
  }
}
function stop() {
  cancelAnimationFrame(raf)
  if (timer) clearInterval(timer)
}

onMounted(() => {
  frame() // place everything once, even before it runs
  if (running) start()
})
watch(() => running, on => (on ? start() : stop()))
watch(() => timeZone, () => (offsetAt = 0))
onBeforeUnmount(stop)
</script>

<template>
  <svg viewBox="-90 -70 160 130" class="movement" :class="{ shown }" aria-hidden="true">
    <!-- the line of centres, from arbor to arbor -->
    <path class="faint" :d="`M${C.x} ${C.y}L${T.x.toFixed(2)} ${T.y.toFixed(2)}L${F.x.toFixed(2)} ${F.y.toFixed(2)}L${E.x.toFixed(2)} ${E.y.toFixed(2)}L${B.x.toFixed(2)} ${B.y.toFixed(2)}`" />

    <g v-for="(p, i) in parts" :key="p.id" :ref="setEl(p.id)" :style="{ '--i': i + 1, '--tone': p.tone }">
      <path v-for="(d, k) in p.paths" :key="k" class="draw" :d pathLength="1" />
      <path class="draw thin" :d="p.rimPath" pathLength="1" />
      <path class="draw thin" :d="p.spokePath" pathLength="1" />
      <path class="draw thin" :d="circle(2.6)" pathLength="1" />
      <circle r="0.9" class="jewel" />
    </g>

    <g :ref="setEl('P')" style="--i: 5">
      <path class="draw" :d="fork" pathLength="1" />
      <circle r="1.8" class="pivot" />
    </g>

    <g :ref="setEl('S')" style="--i: 6">
      <path class="draw thin" :d="hairspring" pathLength="1" />
    </g>
    <g :ref="setEl('B')" style="--i: 6">
      <path class="draw" :d="balanceRim" pathLength="1" />
      <path class="draw" :d="balanceArms" pathLength="1" />
      <circle
        v-for="(s, k) in screws"
        :key="k"
        :cx="s.x"
        :cy="s.y"
        r="1.1"
        class="screw"
      />
      <path class="draw thin" :d="circle(4.5)" pathLength="1" />
    </g>

    <!-- the hands, above the train -->
    <g :ref="setEl('hH')" class="hand" style="--i: 7">
      <path d="M0 3V-17" stroke-width="1.6" />
    </g>
    <g :ref="setEl('hM')" class="hand" style="--i: 7">
      <path d="M0 4V-27" stroke-width="1.1" />
    </g>
    <g :ref="setEl('hS')" class="hand seconds" style="--i: 7">
      <path d="M0 7V-31" stroke-width="0.6" />
      <circle r="1.6" />
    </g>
  </svg>
</template>

<style scoped>
.movement {
  display: block;
  width: 100%;
  overflow: visible;
}
path {
  fill: none;
  stroke: rgb(235 235 235 / calc(var(--tone, 1) * 0.85));
  stroke-width: 0.5;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
.thin {
  stroke: rgb(235 235 235 / calc(var(--tone, 1) * 0.42));
}
.faint {
  stroke: rgb(235 235 235 / 0.16);
  stroke-dasharray: 1 3;
}
.draw {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.4s cubic-bezier(0.65, 0, 0.35, 1);
  transition-delay: calc(var(--i, 0) * 110ms);
}
.faint {
  opacity: 0;
  transition: opacity 0.8s ease;
}
.shown .faint {
  opacity: 1;
}
.shown .draw {
  stroke-dashoffset: 0;
}
.jewel,
.screw,
.pivot {
  fill: rgb(235 235 235 / 0.85);
  opacity: 0;
  transition: opacity 0.6s ease;
  transition-delay: calc(400ms + var(--i, 0) * 110ms);
}
.screw {
  fill: rgb(235 235 235 / 0.5);
}
.hand path {
  stroke: #fff;
  stroke-linecap: round;
  vector-effect: none;
}
.hand.seconds circle {
  fill: #fff;
}
.hand {
  opacity: 0;
  transition: opacity 0.6s ease 1.1s;
}
.shown :is(.jewel, .screw, .pivot, .hand) {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .draw, .jewel, .screw, .pivot, .hand {
    transition: none;
  }
}
</style>
