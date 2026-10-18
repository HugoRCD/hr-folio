<script setup lang="ts">
// The page's movement, drawn as a plan (see utils/movement): it keeps the page's time. The going
// train always runs on the real clock, beat by beat; the hands show the hour the page is set to,
// which is the clock unless the crown (or the sun viewer) has set another. Setting a watch moves
// the hands, not the train, and so it is here: the hands travel to the new hour, the train runs on.
import { angles, B, balance, C, centres, CROWN, D, E, F, fork, GOING, I, MOTION, P, T, VIEW } from '~/utils/movement'
import { secondsOfDay, zoneOffsetMs } from '~/utils/zone'

const { width = 240, tone = 'page', shown = true, running = false, at = null, crown = false, pulled = false, turn = 0 } = defineProps<{
  /** px */
  width?: number
  /** ink on the page, or bone on the red underneath */
  tone?: 'page' | 'bone'
  /** drawn in: false until it is first shown, then true */
  shown?: boolean
  /** beating: only while it can be seen */
  running?: boolean
  /** the instant the hands show; null follows the clock */
  at?: number | null
  /** draw the crown, and take the hand on it */
  crown?: boolean
  /** the crown pulled out to the setting position */
  pulled?: boolean
  /** radians the whole plan is turned by from outside: the hands and the sun still read upright */
  turn?: number
}>()
const emit = defineEmits<{ crownDown: [PointerEvent], crownKey: [KeyboardEvent] }>()

const daylight = useState<{ elevation: number, time: string, place: { timeZone?: string } } | undefined>('daylight')
const timeZone = computed(() => daylight.value?.place.timeZone ?? 'Europe/London')
// the 24-hour wheel's sun: filled while it is up at the hour the hands show, open while it is down
const sunUp = computed(() => (daylight.value?.elevation ?? 1) >= 0)
const skew = useState<number>('daylight-skew', () => 0) // the page's clock, if ?hour= moved it

// the sun's rays, eight of them, around the disc the 24-hour wheel carries
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4
  const p = (r: number) => `${(r * Math.sin(a)).toFixed(2)} ${(-10 - r * Math.cos(a)).toFixed(2)}`
  return `M${p(3.3)}L${p(4.9)}`
}).join('')

const VB = VIEW.split(' ').map(Number) as [number, number, number, number]
const height = Math.round((width * VB[3]) / VB[2])
const u = VB[2] / width // a screen pixel, in drawing units

const els = new Map<string, SVGGElement>()
const setEl = (id: string) => (el: unknown) => {
  if (el) els.set(id, el as SVGGElement)
}
const place = (id: string, p: { x: number, y: number }, rad: number) =>
  els.get(id)?.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${(rad * 180 / Math.PI).toFixed(3)})`)

const reduced = import.meta.client && matchMedia('(prefers-reduced-motion: reduce)').matches
let offset = 0
let offsetAt = 0
let shownH: number | null = null // the seconds the hands show now, on their way to the target
let last = 0
let raf = 0
let timer: ReturnType<typeof setInterval> | undefined

function frame(now = performance.now()) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0)
  last = now
  const clock = Date.now() + skew.value
  if (clock - offsetAt > 60000) {
    offset = zoneOffsetMs(new Date(clock), timeZone.value)
    offsetAt = clock
  }
  const t = secondsOfDay(clock, offset)
  const target = at === null ? t : secondsOfDay(at, zoneOffsetMs(new Date(at), timeZone.value))
  if (shownH === null || reduced) {
    shownH = target
  } else {
    // the shorter way round the day, and an even approach whatever the frame rate
    const diff = ((target - shownH + 43200) % 86400 + 86400) % 86400 - 43200
    shownH = Math.abs(diff) < 0.5 ? target : (shownH + diff * (1 - Math.exp(-dt / 0.09)) + 86400) % 86400
  }
  const a = angles(t, shownH, reduced)
  place('C', C, a.C)
  place('T', T, a.T)
  place('F', F, a.F)
  place('E', E, a.E)
  place('B', B, a.B)
  place('S', B, a.S)
  place('P', P, a.P)
  place('H', C, a.H)
  place('I', I, a.I)
  place('D', D, a.D)
  place('sun', D, a.day + Math.PI - turn)
  place('hH', C, a.H - turn)
  place('hM', C, a.minute - turn)
  if (running && !reduced) raf = requestAnimationFrame(frame)
}

function start() {
  stop()
  last = performance.now()
  if (reduced) {
    frame()
    timer = setInterval(frame, 1000)
  } else {
    raf = requestAnimationFrame(frame)
  }
}
function stop() {
  cancelAnimationFrame(raf)
  clearInterval(timer)
}

onMounted(() => {
  frame() // everything in place once, even before it runs
  if (running) start()
})
watch(() => running, on => (on ? start() : stop()))
// set while it is still: one frame to move the hands there
watch(() => at, () => {
  if (!running) {
    shownH = null
    frame()
  }
})
watch(timeZone, () => (offsetAt = 0))
onBeforeUnmount(stop)
</script>

<template>
  <svg
    :viewBox="VIEW"
    :width
    :height
    class="movement"
    :class="[tone, { shown }]"
    :style="{ '--u': u }"
    aria-hidden="true"
  >
    <!-- the line of centres, from arbor to arbor -->
    <path class="faint" :d="centres" />

    <!-- the going train -->
    <g v-for="(w, i) in GOING" :key="w.id" :ref="setEl(w.id)" :style="{ '--i': i }">
      <path v-for="(d, k) in w.paths" :key="k" class="draw" :d pathLength="1" />
      <path class="draw thin" :d="w.rim" pathLength="1" />
      <path class="draw thin" :d="w.spokes" pathLength="1" />
      <circle r="1" class="jewel" />
    </g>
    <g :ref="setEl('P')" style="--i: 4">
      <path class="draw" :d="fork" pathLength="1" />
      <circle r="1.6" class="jewel" />
    </g>
    <g :ref="setEl('S')" style="--i: 5">
      <path class="draw thin" :d="balance.spring" pathLength="1" />
    </g>
    <g :ref="setEl('B')" style="--i: 5">
      <path class="draw" :d="balance.rim" pathLength="1" />
      <path class="draw" :d="balance.arm" pathLength="1" />
      <circle
        v-for="(s, k) in balance.screws"
        :key="k"
        :cx="s.x"
        :cy="s.y"
        r="1"
        class="screw"
      />
    </g>

    <!-- the motion works, on the dial side: hour wheel, intermediate wheel, 24-hour wheel -->
    <g v-for="(w, i) in MOTION" :key="w.id" :ref="setEl(w.id)" class="motion" :style="{ '--i': 6 + i * 0.5 }">
      <path class="draw" :d="w.path" pathLength="1" />
      <path v-if="w.rim" class="draw thin" :d="w.rim" pathLength="1" />
      <path v-if="w.spokes" class="draw thin" :d="w.spokes" pathLength="1" />
    </g>
    <g :ref="setEl('sun')" class="sun" :class="{ up: sunUp }">
      <circle cx="0" cy="-10" r="2.2" />
      <path class="rays" :d="RAYS" />
    </g>

    <!-- the crown and its stem, at three o'clock -->
    <g v-if="crown" class="crown-set" :class="{ pulled }">
      <path class="stem" :d="`M${C.x + 34} ${C.y}H${CROWN.x}`" />
      <g
        class="crown"
        :transform="`translate(${CROWN.x} ${CROWN.y})`"
        @pointerdown="emit('crownDown', $event)"
      >
        <rect x="-6" y="-20" width="26" height="40" fill="transparent" />
        <g class="knob">
          <rect x="0" y="-5.5" width="7" height="11" rx="1.2" />
          <path d="M1.4 -5.5V5.5M2.8 -5.5V5.5M4.2 -5.5V5.5M5.6 -5.5V5.5" />
        </g>
      </g>
    </g>

    <!-- the hands, above it all -->
    <g :ref="setEl('hH')" class="hand">
      <path d="M0 4L1.4 -2L0 -16L-1.4 -2Z" />
    </g>
    <g :ref="setEl('hM')" class="hand">
      <path d="M0 5L1 -3L0 -26L-1 -3Z" />
      <circle r="1.8" />
    </g>
  </svg>
</template>

<style scoped>
/* every colour is mixed into its ground, never see-through: where wheels cross, nothing darkens */
.movement {
  --ink: color-mix(in oklab, var(--ui-text) 46%, var(--ui-bg));
  --thin: color-mix(in oklab, var(--ui-text) 22%, var(--ui-bg));
  --faint: color-mix(in oklab, var(--ui-text) 14%, var(--ui-bg));
  --hand: var(--ui-text-highlighted);
  --accent: var(--ui-primary);
  --accent-thin: color-mix(in oklab, var(--ui-primary) 45%, var(--ui-bg));
  display: block;
  overflow: visible;
}
.movement.bone {
  --ink: color-mix(in oklab, #ebebeb 82%, #901112);
  --thin: color-mix(in oklab, #ebebeb 42%, #901112);
  --faint: color-mix(in oklab, #ebebeb 22%, #901112);
  --hand: #ffffff;
  --accent: #ffffff;
  --accent-thin: color-mix(in oklab, #ebebeb 55%, #901112);
}
path {
  fill: none;
  stroke: var(--ink);
  stroke-width: calc(var(--u) * 0.6);
  stroke-linejoin: round;
}
.thin {
  stroke: var(--thin);
}
.faint {
  stroke: var(--faint);
  stroke-dasharray: calc(var(--u) * 1) calc(var(--u) * 3);
}
.motion path {
  stroke: var(--accent);
}
.motion .thin {
  stroke: var(--accent-thin);
}
.jewel,
.screw {
  fill: var(--ink);
}
.sun circle {
  fill: var(--ui-bg);
  stroke: var(--accent);
  stroke-width: calc(var(--u) * 0.75);
}
.bone .sun circle {
  fill: #901112;
}
.sun.up circle {
  fill: var(--accent);
}
.sun .rays {
  stroke: var(--accent-thin);
  stroke-width: calc(var(--u) * 0.6);
  stroke-linecap: round;
}
.sun.up .rays {
  stroke: var(--accent);
}
.hand path,
.hand circle {
  fill: var(--hand);
  stroke: none;
}
.stem {
  stroke: var(--thin);
  stroke-dasharray: calc(var(--u) * 2) calc(var(--u) * 2);
}
.crown {
  cursor: ns-resize;
  touch-action: none; /* the crown takes the finger; the rest of the drawing still scrolls */
}
.knob {
  transition: transform 0.25s cubic-bezier(0.2, 0.75, 0.2, 1);
}
.knob rect {
  fill: var(--ui-bg);
  stroke: var(--ink);
  stroke-width: calc(var(--u) * 0.75);
}
.knob path {
  stroke: var(--thin);
}
/* pulled out to set the hands, as on the watch */
.pulled .knob {
  transform: translateX(3px);
}
.crown:hover .knob rect,
.pulled .knob rect {
  stroke: var(--accent);
}

/* drawn in once, wheel after wheel, the first time it is shown */
.draw {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.3s cubic-bezier(0.65, 0, 0.35, 1);
  transition-delay: calc(var(--i, 0) * 110ms);
}
.shown .draw {
  stroke-dashoffset: 0;
}
.faint,
.jewel,
.screw,
.sun,
.hand,
.crown-set {
  opacity: 0;
  transition: opacity 0.6s ease 0.9s;
}
.shown :is(.faint, .jewel, .screw, .sun, .hand, .crown-set) {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .draw, .faint, .jewel, .screw, .sun, .hand, .crown-set {
    transition: none;
  }
}
</style>
