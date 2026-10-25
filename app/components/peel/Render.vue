<script setup lang="ts">
// How this page came to be on this screen, from the browser's own timings of the first load:
// the server's answer, the bytes, the parse, the first paint, the app taking over.
const { shown = false } = defineProps<{ shown?: boolean }>()

type Row = { label: string, from: number, to: number, mark?: boolean }

const data = ref<{ rows: Row[], total: number, protocol: string, size: string } | null>(null)

onMounted(() => {
  const n = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (!n) return
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
  const hydrated = performance.getEntriesByName('folio:hydrated')[0]?.startTime
  const rows: Row[] = [
    { label: 'Server', from: n.requestStart, to: n.responseStart },
    { label: 'Download', from: n.responseStart, to: n.responseEnd },
    { label: 'Parse', from: n.responseEnd, to: n.domInteractive },
  ]
  if (fcp) rows.push({ label: 'First paint', from: fcp, to: fcp, mark: true })
  if (hydrated) rows.push({ label: 'Hydrate', from: n.domInteractive, to: hydrated })
  rows.push({ label: 'Loaded', from: n.loadEventEnd || n.domComplete, to: n.loadEventEnd || n.domComplete, mark: true })
  const total = Math.max(...rows.map(r => r.to), 1)
  const kb = n.transferSize ? `${(n.transferSize / 1024).toFixed(1)} kB` : 'cached'
  data.value = { rows, total, protocol: n.nextHopProtocol || '—', size: kb }
})

const W = 236
const LABEL = 58
const ms = (v: number) => `${Math.round(v)} ms`
const scale = computed(() => (data.value ? (W - LABEL - 44) / data.value.total : 1))
</script>

<template>
  <div v-if="data" class="render" :class="{ shown }">
    <svg :viewBox="`0 0 ${W} ${data.rows.length * 14 + 16}`" aria-hidden="true">
      <!-- the time axis, with a tick every tenth of the whole -->
      <path class="axis" :d="`M${LABEL} ${data.rows.length * 14 + 4}H${W - 44}`" />
      <path v-for="i in 11" :key="i" class="axis" :d="`M${LABEL + ((i - 1) / 10) * (W - LABEL - 44)} ${data.rows.length * 14 + 4}v${(i - 1) % 5 ? 2 : 4}`" />
      <text :x="LABEL" :y="data.rows.length * 14 + 14" class="dim">0</text>
      <text :x="W - 44" :y="data.rows.length * 14 + 14" class="dim" text-anchor="end">{{ ms(data.total) }}</text>

      <g v-for="(r, i) in data.rows" :key="r.label" :style="{ '--i': i }">
        <text :x="0" :y="i * 14 + 9" class="dim">{{ r.label }}</text>
        <path class="guide" :d="`M${LABEL} ${i * 14 + 6}H${W - 44}`" />
        <template v-if="r.mark">
          <path class="mark" :d="`M${LABEL + r.from * scale} ${i * 14 + 1}v10`" />
        </template>
        <rect
          v-else
          class="bar"
          :x="LABEL + r.from * scale"
          :y="i * 14 + 3"
          :width="Math.max(1, (r.to - r.from) * scale)"
          height="6"
        />
        <text :x="W" :y="i * 14 + 9" text-anchor="end">{{ ms(r.mark ? r.from : r.to - r.from) }}</text>
      </g>
      <!-- a playhead runs the whole once, then rests at the end -->
      <path class="playhead" :d="`M${LABEL} 0V${data.rows.length * 14 + 4}`" :style="{ '--run': `${W - 44 - LABEL}px` }" />
    </svg>
    <p class="foot">
      <span>First load</span><span>{{ data.protocol }} · {{ data.size }}</span>
    </p>
  </div>
</template>

<style scoped>
.render svg {
  display: block;
  width: 100%;
  overflow: visible;
}
text {
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.04em;
  fill: rgb(235 235 235 / 0.9);
}
text.dim {
  fill: rgb(235 235 235 / 0.55);
  text-transform: uppercase;
}
path {
  fill: none;
  stroke-width: 0.75;
}
.axis {
  stroke: rgb(235 235 235 / 0.4);
}
.guide {
  stroke: rgb(235 235 235 / 0.1);
}
.bar {
  fill: rgb(235 235 235 / 0.85);
  transform-box: fill-box;
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
  transition-delay: calc(200ms + var(--i) * 160ms);
}
.mark {
  stroke: #fff;
  stroke-width: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
  transition-delay: calc(200ms + var(--i) * 160ms);
}
.shown .bar {
  transform: scaleX(1);
}
.shown .mark {
  opacity: 1;
}
.playhead {
  stroke: #fff;
  stroke-opacity: 0;
  stroke-width: 0.75;
}
.shown .playhead {
  animation: run 2.2s cubic-bezier(0.45, 0, 0.55, 1) 0.2s forwards;
}
@keyframes run {
  0% { stroke-opacity: 0.8; transform: translateX(0); }
  92% { stroke-opacity: 0.8; }
  100% { stroke-opacity: 0; transform: translateX(var(--run)); }
}
.foot {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(235 235 235 / 0.55);
}
@media (prefers-reduced-motion: reduce) {
  .bar, .mark { transition: none; }
  .shown .playhead { animation: none; }
}
</style>
