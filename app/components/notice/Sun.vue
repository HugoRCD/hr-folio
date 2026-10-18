<script setup lang="ts">
import { contrast } from '~/utils/oklab'
import { lightFor, localInstant, offsetMinutes, sunAt } from '~/utils/daylight'

// How the page is lit: today's sun over the place in the dateline, and the ground it gives the
// page, hour by hour. The needle picks an hour, and the whole page takes that hour's light while
// you are here: the ground, light or dark, the hour in the dateline.

type Place = { city: string, timeZone: string, lat: number, lon: number }
const daylight = useState<{ place: Place } | undefined>('daylight')
const preview = useState<number | null>('daylight-at', () => null)

const DAY = 1440
const STEP = 10 // minutes between samples of the curve
const RUN = 12000 // ms for a whole day
const reduced = import.meta.client && matchMedia('(prefers-reduced-motion: reduce)').matches

const place = computed<Place>(() => daylight.value?.place ?? HOME_WHEREABOUTS)
const midnight = computed(() => localInstant('0:00', place.value.timeZone).getTime())
const at = (m: number) => new Date(midnight.value + m * 60000)
const nowMinutes = () => {
  const local = Date.now() + offsetMinutes(new Date(), place.value.timeZone) * 60000
  return Math.floor((local % 86400000) / 60000)
}

const now = ref(nowMinutes())
const t = ref(now.value)

function reading(m: number) {
  const sun = sunAt(at(m), place.value)
  const light = lightFor(sun.elevation, sun.morning)
  const { hex } = light
  // the red at this hour, wherever on its band the light puts it: it never drops under 4.6 : 1
  const red = contrast(light.red, hex)
  return { m, elevation: sun.elevation, dark: light.dark, phase: light.phase, ground: light.vars['--ui-bg']!, hex, red }
}

const day = computed(() => {
  const samples = Array.from({ length: DAY / STEP + 1 }, (_, i) => reading(i * STEP))
  const els = samples.map(s => s.elevation)
  const top = Math.ceil((Math.max(...els) + 5) / 10) * 10
  const bottom = Math.floor((Math.min(...els) - 5) / 10) * 10
  const y = (e: number) => ((top - e) / (top - bottom)) * 100
  // sunrise and sunset: where the curve crosses the horizon, to the minute
  const crossings: { m: number, rising: boolean }[] = []
  const stops: string[] = []
  samples.forEach((s, i) => {
    stops.push(`${s.ground} ${((s.m / DAY) * 100).toFixed(2)}%`)
    const next = samples[i + 1]
    if (next && s.dark !== next.dark) {
      const m = s.m + (STEP * s.elevation) / (s.elevation - next.elevation)
      crossings.push({ m, rising: s.dark })
      // the page switches at the horizon, not gradually: a hard edge in the strip
      const at = `${((m / DAY) * 100).toFixed(2)}%`
      stops.push(`${s.ground} ${at}`, `${next.ground} ${at}`)
    }
  })
  return {
    y,
    horizon: y(0),
    curve: samples.map((s, i) => `${i ? 'L' : 'M'}${s.m} ${y(s.elevation).toFixed(2)}`).join(''),
    strip: `linear-gradient(to right in oklab, ${stops.join(', ')})`,
    crossings,
  }
})

const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m) % 60).padStart(2, '0')}`
const pct = (m: number) => `${((m / DAY) * 100).toFixed(3)}%`
const current = computed(() => reading(t.value))
const away = computed(() => t.value !== now.value)

// the page follows the needle; on the present hour, or on leaving, it goes back to the clock
watch(t, (m) => {
  preview.value = m === now.value ? null : at(m).getTime()
})
onBeforeUnmount(() => {
  stop()
  preview.value = null
})

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    const was = now.value
    now.value = nowMinutes()
    if (t.value === was && !running.value) t.value = now.value
  }, 30000)
})
onBeforeUnmount(() => clearInterval(timer))

// a whole day in twelve seconds, once, then back to the present
const running = ref(false)
let raf = 0
function run() {
  stop()
  running.value = true
  const start = performance.now()
  const step = (time: number) => {
    const k = Math.min(1, (time - start) / RUN)
    t.value = Math.round(k * DAY) % DAY
    if (k < 1) raf = requestAnimationFrame(step)
    else {
      running.value = false
      t.value = now.value
    }
  }
  raf = requestAnimationFrame(step)
}
function stop() {
  cancelAnimationFrame(raf)
  running.value = false
}
</script>

<template>
  <figure class="sun">
    <div class="ends">
      <span>Today <b>{{ place.city }}</b></span>
      <span>{{ place.lat.toFixed(1) }}° {{ place.lat >= 0 ? 'N' : 'S' }}</span>
    </div>

    <div class="chart" :style="{ '--horizon': `${day.horizon}%` }" @pointerdown="stop">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <clipPath id="sun-above">
            <rect x="0" y="0" width="1440" :height="day.horizon" />
          </clipPath>
        </defs>
        <path :d="`M0 ${day.horizon}H1440`" class="horizon" />
        <path :d="day.curve" class="curve" />
        <path :d="day.curve" class="curve lit" clip-path="url(#sun-above)" />
      </svg>
      <span class="label horizon-label">0°</span>
      <span
        v-for="c in day.crossings"
        :key="c.m"
        class="label crossing"
        :class="{ rising: c.rising }"
        :style="{ left: pct(c.m) }"
      >
        {{ hhmm(c.m) }}
      </span>
      <span class="dot" :class="{ below: current.dark }" :style="{ left: pct(t), top: `${day.y(current.elevation)}%` }" aria-hidden="true" />
      <span class="needle" :style="{ left: pct(t) }" aria-hidden="true" />
      <input
        v-model.number="t"
        type="range"
        min="0"
        :max="DAY - 5"
        step="5"
        aria-label="Hour of the day"
        :aria-valuetext="`${hhmm(t)}, sun ${current.elevation.toFixed(1)} degrees, ${current.phase}`"
      >
    </div>

    <!-- the page's own ground, hour by hour: what the needle paints the page with -->
    <div class="strip" :style="{ backgroundImage: day.strip }" aria-hidden="true">
      <span class="needle" :style="{ left: pct(t) }" />
    </div>

    <div class="ruler" aria-hidden="true">
      <span v-for="h in 25" :key="h" class="tick" :class="{ long: (h - 1) % 6 === 0 }" :style="{ left: pct((h - 1) * 60) }" />
      <span v-for="h in [0, 6, 12, 18, 24]" :key="h" class="num" :class="{ yields: Math.abs(h * 60 - now) < 80 }" :style="{ left: pct(h * 60) }">{{ String(h).padStart(2, '0') }}</span>
      <span class="now" :style="{ left: pct(now) }">now</span>
    </div>

    <output class="readout">
      <span class="row">
        <span class="k">Hour</span><span class="v">{{ hhmm(t) }}</span>
        <button v-if="running" type="button" class="action" @click="stop">Stop</button>
        <button v-else-if="away" type="button" class="action" @click="t = now">Back to now</button>
        <button v-else-if="!reduced" type="button" class="action" @click="run">Run the day</button>
      </span>
      <span class="row">
        <span class="k">Sun</span><span class="v">{{ current.elevation >= 0 ? '+' : '−' }}{{ Math.abs(current.elevation).toFixed(1) }}°</span>
        <span class="r">{{ current.phase }}</span>
      </span>
      <span class="row">
        <span class="k">Page</span><span class="v">{{ current.hex }} · {{ current.dark ? 'dark' : 'light' }}</span>
        <span class="r">red {{ current.red.toFixed(2) }} : 1</span>
      </span>
    </output>
  </figure>
</template>

<style scoped>
.sun {
  margin: 32px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
}
.ends {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.ends b {
  margin-left: 6px;
  font-weight: 400;
  color: var(--ui-text-highlighted);
}

.chart {
  position: relative;
  height: 120px;
}
svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
svg path {
  fill: none;
  vector-effect: non-scaling-stroke;
}
.horizon {
  stroke: color-mix(in oklab, var(--ui-text) 35%, transparent);
  stroke-width: 1;
}
.curve {
  stroke: color-mix(in oklab, var(--ui-text) 30%, transparent);
  stroke-width: 1;
  stroke-dasharray: 2 3;
}
.curve.lit {
  stroke: var(--ui-primary);
  stroke-width: 1.25;
  stroke-dasharray: none;
}
.label {
  position: absolute;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}
.horizon-label {
  left: 0;
  top: calc(var(--horizon) - 15px);
}
/* sunrise reads to the left of its crossing, sunset to the right: always on the empty side */
.crossing {
  top: calc(var(--horizon) - 15px);
  padding-left: 6px;
}
.crossing.rising {
  padding: 0 6px 0 0;
  transform: translateX(-100%);
}
.dot {
  position: absolute;
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  border-radius: 50%;
  background: var(--ui-primary);
  pointer-events: none;
}
.dot.below {
  background: var(--ui-bg);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ui-text) 55%, transparent);
}
.needle {
  position: absolute;
  top: -6px;
  bottom: 0;
  width: 1px;
  margin-left: -0.5px;
  background: var(--ui-text-highlighted);
  pointer-events: none;
}
.strip .needle {
  top: -1px;
  bottom: -6px;
}
input {
  position: absolute;
  inset: -6px -6px -22px;
  width: calc(100% + 12px);
  height: calc(100% + 28px);
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  appearance: none;
  background: transparent;
}
input::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 148px;
}
input::-moz-range-thumb {
  width: 12px;
  height: 148px;
  border: 0;
}
.chart:has(input:focus-visible) {
  outline: 1px solid var(--ui-text-highlighted);
  outline-offset: 6px;
}

.strip {
  position: relative;
  height: 12px;
  margin-top: 4px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ui-text) 18%, transparent);
}

.ruler {
  position: relative;
  height: 22px;
  margin-top: 6px;
}
.tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 3px;
  margin-left: -0.5px;
  background: color-mix(in oklab, var(--ui-text) 30%, transparent);
}
.tick.long {
  height: 6px;
  background: color-mix(in oklab, var(--ui-text) 55%, transparent);
}
.num,
.now {
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  font-size: 9px;
}
.num:first-of-type { transform: none; }
.num:last-of-type { transform: translateX(-100%); }
.num.yields { visibility: hidden; }
.now {
  top: 0;
  padding-top: 8px;
  color: var(--ui-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: linear-gradient(currentColor, currentColor) center top / 1px 6px no-repeat;
}

.readout {
  display: flex;
  flex-direction: column;
  margin-top: 14px;
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 10%, transparent);
}
.row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid color-mix(in oklab, var(--ui-text) 6%, transparent);
  font-variant-numeric: tabular-nums;
}
.k {
  width: 72px;
  flex: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.v {
  color: var(--ui-text-highlighted);
  font-size: 11px;
}
.r {
  margin-left: auto;
  font-size: 11px;
  color: var(--ui-text);
}
.action {
  margin-left: auto;
  font: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-muted);
  cursor: pointer;
}
.action:hover {
  color: var(--ui-text-highlighted);
}
</style>
