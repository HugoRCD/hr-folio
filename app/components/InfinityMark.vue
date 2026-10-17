<script setup lang="ts">
import { seenThisVisit } from '~/utils/once'
// "Until further notice", drawn rather than typed: a lemniscate, slightly inclined like a hand
// would write it, ruled once in the red when it comes into view. A glint then travels the
// loop, slowly, without end.
const { width = 26 } = defineProps<{ width?: number }>()

// lemniscate of Bernoulli, sampled; x in [-1, 1], y in about [-0.35, 0.35]
const N = 120
const SLANT = Math.tan((12 * Math.PI) / 180)
const points = Array.from({ length: N }, (_, i) => {
  const t = (i / N) * Math.PI * 2 - Math.PI / 2 // start at the crossing, heading up-right
  const d = 1 + Math.sin(t) ** 2
  const x = Math.cos(t) / d
  const y = (Math.sin(t) * Math.cos(t)) / d
  return [x - y * SLANT, -y] as const
})
const d = `M${points.map(([x, y]) => `${(x * 50).toFixed(2)} ${(y * 50).toFixed(2)}`).join('L')}Z`
const height = width * 0.42

const root = useTemplateRef<SVGSVGElement>('root')
const drawn = ref(false)
const still = ref(false)
onMounted(() => {
  // drawn once per visit; afterwards it is there, with only the glint still travelling
  if (!root.value || matchMedia('(prefers-reduced-motion: reduce)').matches || seenThisVisit('infinity')) {
    still.value = true
    drawn.value = true
    return
  }
  const io = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    io.disconnect()
    seenThisVisit('infinity', true)
    drawn.value = true
  }, { threshold: 1 })
  io.observe(root.value)
})
</script>

<template>
  <svg
    ref="root"
    class="infinity"
    data-construct="infinity"
    :class="{ drawn, still }"
    viewBox="-56 -21 112 42"
    :width
    :height
    role="img"
    aria-label="ongoing"
  >
    <path class="ink" :d pathLength="1" />
    <path class="glint" :d pathLength="1" />
  </svg>
</template>

<style scoped>
.infinity {
  display: inline-block;
  overflow: visible;
  vertical-align: -0.12em;
}
path {
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
.glint {
  stroke: color-mix(in oklab, white 70%, var(--ui-primary));
  stroke-width: 5.5;
  stroke-dasharray: 0.07 0.93;
  stroke-dashoffset: 1;
  opacity: 0;
}
.drawn .ink {
  stroke-dashoffset: 0;
}
.drawn .glint {
  animation: travel 9s linear 2.2s infinite, glint-in 1.2s ease 2.2s forwards;
}
:global(.light) .glint {
  stroke: color-mix(in oklab, white 55%, var(--ui-primary));
}
.still .ink {
  transition: none;
}
.still.drawn .glint {
  animation: travel 9s linear infinite;
  opacity: 0.85;
}
@keyframes travel {
  to { stroke-dashoffset: 0; }
}
@keyframes glint-in {
  to { opacity: 0.85; }
}
@media (prefers-reduced-motion: reduce) {
  .ink { transition: none; }
  .glint { display: none; }
}
</style>
