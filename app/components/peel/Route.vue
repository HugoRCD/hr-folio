<script setup lang="ts">
// The path this page took to reach the visitor: their city, the Vercel edge that answered, the
// region the page was rendered in. Each hop is the great-circle distance, and under it the least
// time a round trip can take through glass fibre, where light goes at about 200 000 km/s.
type Place = { label: string, sub: string, lat: number, lon: number }
type RequestInfo = {
  visitor: { city: string, country: string, lat: number, lon: number } | null
  edge: string | null
  fn: string | null
}

const { info, shown = false } = defineProps<{ info: RequestInfo | null, shown?: boolean }>()

const FIBRE_KM_PER_MS = 299_792.458 * (2 / 3) / 1000

const route = computed(() => {
  if (!info) return null
  const stops: Place[] = []
  if (info.visitor) stops.push({ label: 'You', sub: info.visitor.city || info.visitor.country, lat: info.visitor.lat, lon: info.visitor.lon })
  for (const code of [info.edge, info.fn]) {
    const r = code ? VERCEL_REGIONS[code] : undefined
    if (r && !stops.some(s => s.label === code)) stops.push({ label: code!, sub: r.city, lat: r.lat, lon: r.lon })
  }
  if (stops.length < 2) return { stops, hops: [], total: 0 }
  const hops = stops.slice(1).map((s, i) => {
    const km = greatCircleKm(stops[i]!, s)
    return { km, ms: (2 * km) / FIBRE_KM_PER_MS }
  })
  return { stops, hops, total: hops.reduce((t, h) => t + h.ms, 0) }
})

const W = 236
const x = (i: number, n: number) => (n < 2 ? W / 2 : 6 + (i / (n - 1)) * (W - 12))
const km = (v: number) => (v < 10 ? `${v.toFixed(1)} km` : `${Math.round(v).toLocaleString('en-GB')} km`)
defineExpose({ total: computed(() => route.value?.total ?? 0) })
</script>

<template>
  <div class="route" :class="{ shown }">
    <svg v-if="route && route.stops.length > 1" :viewBox="`0 0 ${W} 50`" aria-hidden="true">
      <path class="line" :d="`M${x(0, route.stops.length)} 22H${x(route.stops.length - 1, route.stops.length)}`" pathLength="1" />
      <g v-for="(s, i) in route.stops" :key="s.label" class="stop" :style="{ '--i': i }">
        <circle :cx="x(i, route.stops.length)" cy="22" r="2.6" />
        <text :x="x(i, route.stops.length)" y="10" :text-anchor="i === 0 ? 'start' : i === route.stops.length - 1 ? 'end' : 'middle'" class="code">{{ s.label }}</text>
        <text :x="x(i, route.stops.length)" y="38" :text-anchor="i === 0 ? 'start' : i === route.stops.length - 1 ? 'end' : 'middle'" class="dim">{{ s.sub }}</text>
      </g>
      <g v-for="(h, i) in route.hops" :key="i" class="hop" :style="{ '--i': i + 1 }">
        <text :x="(x(i, route.stops.length) + x(i + 1, route.stops.length)) / 2" y="18" text-anchor="middle">{{ km(h.km) }}</text>
        <text :x="(x(i, route.stops.length) + x(i + 1, route.stops.length)) / 2" y="31" text-anchor="middle" class="dim">≥ {{ h.ms.toFixed(1) }} ms</text>
      </g>
      <!-- a request goes out and comes back, once -->
      <circle class="packet" cy="22" r="1.6" :style="{ '--from': `${x(0, route.stops.length)}px`, '--to': `${x(route.stops.length - 1, route.stops.length)}px` }" />
    </svg>
    <p v-else class="local">
      Served from this computer, not from Vercel: there is no route to draw. Online, this shows your city, the Vercel edge that answered and where the page was rendered.
    </p>
  </div>
</template>

<style scoped>
svg {
  display: block;
  width: 100%;
  overflow: visible;
}
.line {
  fill: none;
  stroke: rgb(235 235 235 / 0.55);
  stroke-width: 0.75;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.65, 0, 0.35, 1) 0.2s;
}
.shown .line {
  stroke-dashoffset: 0;
}
text {
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.04em;
  fill: rgb(235 235 235 / 0.95);
}
text.code {
  text-transform: uppercase;
}
text.dim {
  fill: rgb(235 235 235 / 0.55);
}
circle {
  fill: var(--ground, #901112);
  stroke: #fff;
  stroke-width: 0.75;
}
.stop,
.hop {
  opacity: 0;
  transition: opacity 0.5s ease;
  transition-delay: calc(300ms + var(--i) * 350ms);
}
.shown :is(.stop, .hop) {
  opacity: 1;
}
.packet {
  fill: #fff;
  stroke: none;
  opacity: 0;
}
.shown .packet {
  animation: there-and-back 3.2s cubic-bezier(0.45, 0, 0.55, 1) 1.4s 1 both;
}
@keyframes there-and-back {
  0% { transform: translateX(var(--from)); opacity: 0; }
  6% { opacity: 1; }
  50% { transform: translateX(var(--to)); }
  94% { opacity: 1; }
  100% { transform: translateX(var(--from)); opacity: 0; }
}
.local {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  color: rgb(235 235 235 / 0.55);
}
@media (prefers-reduced-motion: reduce) {
  .line, .stop, .hop { transition: none; }
  .shown .packet { animation: none; }
}
</style>
