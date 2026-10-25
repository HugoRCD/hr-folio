<script setup lang="ts">
import { penEase as ease } from '~/utils/motion'
import { seenSinceLoad } from '~/utils/once'
// Signed once, at the end. The ink is revealed by a pen that follows the centreline of each
// letter in writing order, so it reads as written rather than wiped in.
import { signatureDuration, signatureOrigin, signatureOutline, signaturePen, signatureViewBox } from '~/utils/signature'

const { size = 64, pace = 2.4, manual = false, align = 'start' } = defineProps<{
  /** em size of the script, in px */
  size?: number
  /** seconds the whole signature takes to write */
  pace?: number
  /** wait for write() instead of starting when scrolled into view */
  manual?: boolean
  /** which edge of the column the ink sits on */
  align?: 'start' | 'end'
}>()
const emit = defineEmits<{ done: [] }>()

const uid = 'signature' // one signature per page; useId() drifted between server and client here
const root = useTemplateRef<SVGSVGElement>('root')
const state = ref<'idle' | 'waiting' | 'writing' | 'done'>('idle')

const scale = pace / signatureDuration
const strokes = signaturePen.map(p => ({ ...p, t: p.t * scale, dur: p.dur * scale }))
// pen-down groups, to ease each one in and out like a hand starting and lifting
const groups = new Map<number, { from: number, to: number }>()
for (const s of strokes) {
  const g = groups.get(s.stroke)
  const end = s.t + s.dur
  if (!g) groups.set(s.stroke, { from: s.t, to: end })
  else g.to = Math.max(g.to, end)
}

const width = `${(signatureOrigin.width / 1000) * size}px`
const height = `${(signatureOrigin.height / 1000) * size}px`
// the viewBox is padded around the swashes; pull it back so the ink sits on the column edge
const INK_MARGIN = 48 // units of padding the generator leaves around the ink
const inset = `${(INK_MARGIN / 1000) * size}px`

function write() {
  const svg = root.value
  if (!svg) return
  const pens = [...svg.querySelectorAll<SVGPathElement>('[data-pen]')]
  state.value = 'writing'
  const start = performance.now()
  const frame = (now: number) => {
    const t = (now - start) / 1000
    pens.forEach((el, i) => {
      const s = strokes[i]!
      const g = groups.get(s.stroke)!
      // time warped within the pen-down, then mapped back onto this segment
      const gt = g.from + ease(Math.min(1, Math.max(0, (t - g.from) / (g.to - g.from)))) * (g.to - g.from)
      const f = Math.min(1, Math.max(0, (gt - s.t) / s.dur))
      el.style.strokeDashoffset = String(1 - f)
    })
    if (t < pace + 0.05) {
      requestAnimationFrame(frame)
    } else {
      state.value = 'done'
      seenSinceLoad('signed', true)
      emit('done')
    }
  }
  requestAnimationFrame(frame)
}

defineExpose({ write })

onMounted(() => {
  const svg = root.value
  // written once per load: on the pages visited after that, the name is simply there
  if (!svg || matchMedia('(prefers-reduced-motion: reduce)').matches || seenSinceLoad('signed')) {
    state.value = 'done'
    return
  }
  state.value = 'waiting'
  if (manual) return
  const io = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    io.disconnect()
    write()
  }, { threshold: 0.7 })
  io.observe(svg)
})
</script>

<template>
  <svg
    ref="root"
    data-signature
    :data-state="state"
    class="signature block select-none overflow-visible"
    :viewBox="signatureViewBox"
    :style="align === 'end' ? { width, height, marginLeft: 'auto', marginRight: `-${inset}` } : { width, height, marginLeft: `-${inset}` }"
    role="img"
    aria-label="Hugo"
  >
    <defs>
      <mask
        :id="`${uid}-pen`"
        maskUnits="userSpaceOnUse"
        :x="signatureOrigin.x"
        :y="signatureOrigin.y"
        :width="signatureOrigin.width"
        :height="signatureOrigin.height"
      >
        <path
          v-for="(p, i) in strokes"
          :key="i"
          data-pen
          :d="p.d"
          pathLength="1"
          fill="none"
          stroke="white"
          :stroke-width="p.w"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="1 1"
          stroke-dashoffset="1"
        />
      </mask>
    </defs>
    <!-- the mask lives on the group: on the path it would inherit the y-flip -->
    <g :mask="state === 'waiting' || state === 'writing' ? `url(#${uid}-pen)` : undefined">
      <path :d="signatureOutline" transform="scale(1 -1)" fill="currentColor" />
    </g>
  </svg>
</template>

<style scoped>
.signature {
  color: #901112;
}
html.dark .signature {
  color: var(--ui-primary);
}
</style>
