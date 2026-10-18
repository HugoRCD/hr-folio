<script setup lang="ts">
import { lightFor, localInstant, offsetMinutes, sunAt } from '~/utils/daylight'
import { seenSinceLoad } from '~/utils/once'

// The movement, with its crown (::crown-viewer). Pull the crown and turn it, as on a watch: the
// hands move, and the whole page takes the light of the hour they show. It sets the same hour as
// the sun viewer's needle, so the two always agree.

type Place = { city: string, timeZone: string, lat: number, lon: number }
const daylight = useState<{ place: Place } | undefined>('daylight')
const preview = useState<number | null>('daylight-at', () => null)

const DAY = 1440
const PER_PX = 2 // minutes a pixel of turning moves the hands

const place = computed<Place>(() => daylight.value?.place ?? HOME_WHEREABOUTS)
const midnight = computed(() => localInstant('0:00', place.value.timeZone).getTime())
const skew = useState<number>('daylight-skew', () => 0) // the page's clock, if ?hour= moved it
const nowMinutes = () => {
  const local = Date.now() + skew.value + offsetMinutes(new Date(), place.value.timeZone) * 60000
  return Math.floor((local % 86400000) / 60000)
}
const minutesOf = (instant: number) => Math.round((instant - midnight.value) / 60000)
const wrap = (m: number) => ((Math.round(m) % DAY) + DAY) % DAY
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

// the hour the hands show: the clock, or the one set
const set = computed(() => preview.value !== null)
const m = ref(nowMinutes())
watch(preview, (v) => {
  m.value = v === null ? nowMinutes() : wrap(minutesOf(v))
}, { immediate: true })
function setTo(next: number) {
  const w = wrap(next)
  m.value = w
  preview.value = w === nowMinutes() ? null : midnight.value + w * 60000
}
function backToNow() {
  preview.value = null
}

const reading = computed(() => {
  const sun = sunAt(new Date(midnight.value + m.value * 60000), place.value)
  const light = lightFor(sun.elevation, sun.morning)
  return { elevation: sun.elevation, phase: light.phase, hex: light.hex, dark: light.dark }
})

// the hand on the crown: pulled out while held, turned by moving up (forward) or down (back)
const pulled = ref(false)
function onDown(e: PointerEvent) {
  e.preventDefault()
  const el = e.currentTarget as Element
  el.setPointerCapture(e.pointerId)
  pulled.value = true
  const y0 = e.clientY
  const m0 = m.value
  const move = (ev: PointerEvent) => setTo(m0 + (y0 - ev.clientY) * PER_PX)
  const up = () => {
    pulled.value = false
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
}
function onKey(e: KeyboardEvent) {
  const step = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 60, PageDown: -60 }[e.key]
  if (e.key === 'Escape' || e.key === 'Home') {
    e.preventDefault()
    backToNow()
    return
  }
  if (!step) return
  e.preventDefault()
  setTo(m.value + step)
}

// drawn once a load; beating only while it is in view
const root = useTemplateRef<HTMLElement>('root')
const shown = ref(false)
const inView = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  if (seenSinceLoad('crown-viewer')) shown.value = true
  io = new IntersectionObserver(([e]) => {
    inView.value = !!e?.isIntersecting
    if (e && e.intersectionRatio > 0.4 && !shown.value) {
      shown.value = true
      seenSinceLoad('crown-viewer', true)
    }
  }, { threshold: [0, 0.4] })
  if (root.value) io.observe(root.value)
})
// the figure only exists once ClientOnly has rendered it
watch(root, (el, was) => {
  if (was) io?.unobserve(was)
  if (el) io?.observe(el)
})
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  tick = setInterval(() => {
    if (!set.value) m.value = nowMinutes()
  }, 30000)
})
onBeforeUnmount(() => {
  io?.disconnect()
  clearInterval(tick)
  preview.value = null
})
</script>

<template>
  <!-- it reads the clock and the place, so it renders in the browser; its height is held meanwhile -->
  <ClientOnly>
    <figure ref="root" class="crown-viewer">
      <div
        class="dial"
        role="slider"
        tabindex="0"
        aria-label="Crown: set the hour"
        :aria-valuemin="0"
        :aria-valuemax="DAY - 1"
        :aria-valuenow="m"
        :aria-valuetext="`${hhmm(m)}, sun ${reading.elevation.toFixed(1)} degrees, ${reading.phase}`"
        @keydown="onKey"
        @focus="pulled = true"
        @blur="pulled = false"
      >
        <Movement
          :width="264"
          :shown
          :running="inView"
          :at="preview"
          crown
          :pulled
          @crown-down="onDown"
        />
      </div>

      <output class="readout">
        <span class="row">
          <span class="k">Hour</span><span class="v">{{ hhmm(m) }}</span>
          <button v-if="set" type="button" class="action" @click="backToNow">Back to now</button>
          <span v-else class="r hint">Turn the crown</span>
        </span>
        <span class="row">
          <span class="k">Sun</span><span class="v">{{ reading.elevation >= 0 ? '+' : '−' }}{{ Math.abs(reading.elevation).toFixed(1) }}°</span>
          <span class="r">{{ reading.phase }}</span>
        </span>
        <span class="row">
          <span class="k">Page</span><span class="v">{{ reading.hex }}</span>
          <span class="r">{{ reading.dark ? 'dark' : 'light' }}</span>
        </span>
        <span class="row">
          <span class="k">Beat</span><span class="v">21,600 vph</span>
          <span class="r">3 Hz</span>
        </span>
      </output>
    </figure>
    <template #fallback>
      <div class="space" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.crown-viewer {
  display: flex;
  align-items: center;
  gap: 32px;
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
}
.dial {
  flex: none;
  border-radius: 2px;
  outline: none;
}
.dial:focus-visible {
  outline: 1px solid var(--ui-text-highlighted);
  outline-offset: 6px;
}
.space {
  height: 200px;
}
.readout {
  display: flex;
  flex: 1;
  flex-direction: column;
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 10%, var(--ui-bg));
}
.row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid color-mix(in oklab, var(--ui-text) 6%, var(--ui-bg));
  font-variant-numeric: tabular-nums;
}
.k {
  width: 48px;
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
.hint {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-muted);
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
@media (max-width: 639px) {
  .crown-viewer {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .dial {
    align-self: center;
  }
}
</style>
