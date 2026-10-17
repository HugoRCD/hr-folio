<script setup lang="ts">
// The sun over the day where Hugo is: its elevation hour by hour, the horizon, civil twilight,
// sunrise and sunset, and where it stands now. The same model that lights the page.
import { sunAt } from '~/utils/daylight'
import { zoneOffsetMs } from '~/utils/zone'

const { shown = false } = defineProps<{ shown?: boolean }>()

type Daylight = { time: string, elevation: number, phase: string, place: { city: string, lat?: number, lon?: number, timeZone?: string } }
const daylight = useState<Daylight | undefined>('daylight')

const W = 236
const TOP = 14
const BASE = 84 // the time axis
const FLOOR = 74 // the plot's lowest line: night runs along it, clear of the axis
const hhmm = (h: number) => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`

const chart = computed(() => {
  const place = daylight.value?.place
  if (place?.lat === undefined || place.lon === undefined) return null
  const tz = place.timeZone ?? 'Europe/London'
  const now = new Date()
  const offset = zoneOffsetMs(now, tz)
  const midnight = Math.floor((now.getTime() + offset) / 86400000) * 86400000 - offset
  const samples = Array.from({ length: 241 }, (_, i) => {
    const h = (i / 240) * 24
    return { h, e: sunAt(new Date(midnight + h * 3600000), { lat: place.lat!, lon: place.lon! }).elevation }
  })
  const max = Math.max(...samples.map(s => s.e))
  const hi = Math.max(20, Math.ceil((max + 4) / 10) * 10)
  const lo = -24
  const x = (h: number) => (h / 24) * W
  const y = (e: number) => TOP + ((hi - Math.max(lo, Math.min(hi, e))) / (hi - lo)) * (FLOOR - TOP)
  const d = `M${samples.map(s => `${x(s.h).toFixed(1)} ${y(s.e).toFixed(1)}`).join('L')}`
  // crossings of the horizon, interpolated between samples
  const crossings: { h: number, rising: boolean }[] = []
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1]!
    const b = samples[i]!
    if ((a.e < 0) !== (b.e < 0)) crossings.push({ h: a.h + ((0 - a.e) / (b.e - a.e)) * (b.h - a.h), rising: b.e > a.e })
  }
  const peak = samples.reduce((m, s) => (s.e > m.e ? s : m))
  return { d, x, y, hi, crossings, peak, horizon: y(0), civil: y(-6) }
})

const current = computed(() => {
  const c = chart.value
  const d = daylight.value
  if (!c || !d?.time) return null
  const [h = 0, m = 0] = d.time.split(':').map(Number)
  const hours = h + m / 60
  return { x: c.x(hours), y: c.y(d.elevation), label: `${d.time} · ${d.elevation >= 0 ? '+' : '−'}${Math.abs(d.elevation).toFixed(1)}° · ${d.phase}` }
})
</script>

<template>
  <svg v-if="chart" :viewBox="`0 0 ${W} 98`" class="sun" :class="{ shown }" aria-hidden="true">
    <defs>
      <clipPath id="sun-above">
        <rect x="0" :y="TOP - 4" :width="W" :height="chart.horizon - TOP + 4" />
      </clipPath>
    </defs>
    <!-- axes: hours below, the horizon and civil twilight -->
    <path class="axis draw" :d="`M0 ${BASE}H${W}`" pathLength="1" style="--i: 0" />
    <g class="labels">
      <template v-for="h in [0, 3, 6, 9, 12, 15, 18, 21, 24]" :key="h">
        <path class="axis" :d="`M${chart.x(h)} ${BASE}v${h % 6 ? 2 : 4}`" />
        <text v-if="h % 6 === 0" :x="chart.x(h)" :y="BASE + 12" :text-anchor="h === 0 ? 'start' : h === 24 ? 'end' : 'middle'">{{ String(h).padStart(2, '0') }}</text>
      </template>
      <text :x="W" :y="chart.horizon - 3" text-anchor="end">0°</text>
      <text :x="W" :y="chart.civil + 9" text-anchor="end">−6°</text>
    </g>
    <path class="horizon draw" :d="`M0 ${chart.horizon}H${W}`" pathLength="1" style="--i: 1" />
    <path class="civil" :d="`M0 ${chart.civil}H${W}`" />

    <!-- the day's path, faint below the horizon, full above it -->
    <path class="curve-below draw" :d="chart.d" pathLength="1" style="--i: 2" />
    <path class="curve draw" :d="chart.d" pathLength="1" clip-path="url(#sun-above)" style="--i: 2" />

    <g class="labels">
      <g v-for="c in chart.crossings" :key="c.h">
        <path class="axis" :d="`M${chart.x(c.h)} ${chart.horizon - 3}v6`" />
        <text :x="chart.x(c.h)" :y="chart.horizon + 11" text-anchor="middle">{{ hhmm(c.h) }}</text>
      </g>
      <text :x="chart.x(chart.peak.h)" :y="chart.y(chart.peak.e) - 5" text-anchor="middle">+{{ chart.peak.e.toFixed(1) }}°</text>
    </g>

    <!-- now -->
    <g v-if="current" class="now">
      <path class="drop" :d="`M${current.x} ${current.y}V${BASE}`" />
      <circle class="pulse" :cx="current.x" :cy="current.y" r="2.4" />
      <circle class="dot" :cx="current.x" :cy="current.y" r="2.4" />
    </g>
  </svg>
  <!-- where it stands now, said in words below the chart rather than over it -->
  <p v-if="current" class="now-line" :class="{ shown }">
    <span>Now</span><span>{{ current.label }}</span>
  </p>
</template>

<style scoped>
.sun {
  display: block;
  width: 100%;
  overflow: visible;
}
path {
  fill: none;
  stroke-width: 0.75;
}
.axis {
  stroke: rgb(235 235 235 / 0.4);
}
.horizon {
  stroke: rgb(235 235 235 / 0.55);
}
.civil {
  stroke: rgb(235 235 235 / 0.25);
  stroke-dasharray: 2 3;
}
.curve {
  stroke: #fff;
  stroke-width: 1.1;
}
.curve-below {
  stroke: rgb(235 235 235 / 0.3);
  stroke-dasharray: 1 1;
}
.draw {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.6s cubic-bezier(0.65, 0, 0.35, 1);
  transition-delay: calc(var(--i, 0) * 180ms);
}
.shown .draw {
  stroke-dashoffset: 0;
}
text {
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.04em;
  fill: rgb(235 235 235 / 0.65);
}
.labels,
.now {
  opacity: 0;
  transition: opacity 0.6s ease 1.2s;
}
.shown :is(.labels, .now) {
  opacity: 1;
}
.drop {
  stroke: rgb(235 235 235 / 0.45);
  stroke-dasharray: 1 2;
}
.dot {
  fill: #fff;
}
.pulse {
  fill: none;
  stroke: #fff;
  stroke-width: 0.75;
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 2.8s ease-out 1.6s 2 both;
}
.now text {
  fill: #fff;
}
.now-line {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(235 235 235 / 0.55);
  opacity: 0;
  transition: opacity 0.6s ease 1.2s;
}
.now-line span:last-child {
  color: #fff;
}
.now-line.shown {
  opacity: 1;
}
@keyframes pulse {
  from { transform: scale(1); opacity: 0.9; }
  to { transform: scale(4.5); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .draw, .labels, .now { transition: none; }
  .pulse { display: none; }
}
</style>
