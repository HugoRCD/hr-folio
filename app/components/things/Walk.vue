<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const props = defineProps<{
  items: ThingItem[]
}>()

const { spring, glide, arrive, reduced } = useThingMotion()
const route = useRoute()
const viewport = useTemplateRef<HTMLElement>('viewport')
const stageH = ref(640)
const viewW = ref(1200)
const pan = ref(0)
const dragging = ref(false)
const hoverSlug = ref<string | null>(null)
const grab = { x: 0, pan: 0 }

const studio = computed(() => composeStudio(props.items, stageH.value))
const poses = computed(() => studio.value.poses)
const figures = computed(() => poses.value.flatMap((pose) => {
  const item = props.items.find(row => row.slug === pose.slug)
  return item ? [{ pose, item }] : []
}))
const canvasW = computed(() => studio.value.width)
const maxPan = computed(() => Math.max(0, canvasW.value - viewW.value))

function clampPan(value: number) {
  return Math.max(0, Math.min(maxPan.value, value))
}

function poseFor(slug: string) {
  return poses.value.find(pose => pose.slug === slug)
}

function panToSlug(slug: string) {
  const pose = poseFor(slug)
  if (!pose) return
  pan.value = clampPan(pose.x + pose.width / 2 - viewW.value / 2)
}

function dimFor(slug: string): 'self' | 'near' | 'far' {
  if (!hoverSlug.value || reduced.value) return 'far'
  if (slug === hoverSlug.value) return 'self'
  const i = poses.value.findIndex(pose => pose.slug === slug)
  const h = poses.value.findIndex(pose => pose.slug === hoverSlug.value)
  return Math.abs(i - h) === 1 ? 'near' : 'far'
}

function measure() {
  const el = viewport.value
  if (!el) return
  viewW.value = el.clientWidth
  stageH.value = el.clientHeight
  pan.value = clampPan(pan.value)
}

function onWheel(e: WheelEvent) {
  if (window.matchMedia('(max-width: 899px)').matches) return
  e.preventDefault()
  pan.value = clampPan(pan.value + e.deltaY + e.deltaX)
}

function onPointerDown(e: PointerEvent) {
  if (window.matchMedia('(max-width: 899px)').matches) return
  if (e.button !== 0) return
  if ((e.target as HTMLElement | null)?.closest('.hit')) return
  dragging.value = true
  grab.x = e.clientX
  grab.pan = pan.value
  viewport.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  pan.value = clampPan(grab.pan - (e.clientX - grab.x))
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  viewport.value?.releasePointerCapture(e.pointerId)
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (document.querySelector('[role="dialog"]')) return
  if (window.matchMedia('(max-width: 899px)').matches) return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    pan.value = clampPan(pan.value + Math.round(viewW.value * 0.42))
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    pan.value = clampPan(pan.value - Math.round(viewW.value * 0.42))
  } else if (e.key === 'Home') {
    e.preventDefault()
    pan.value = 0
  } else if (e.key === 'End') {
    e.preventDefault()
    pan.value = maxPan.value
  }
}

const place = computed(() => nearestPose(poses.value, pan.value, viewW.value))
const placeLabel = computed(() => {
  const n = props.items.length
  if (!n) return '00 · 00'
  return `${String(place.value + 1).padStart(2, '0')} · ${String(n).padStart(2, '0')}`
})

watch(() => props.items.map(item => item.slug).join(','), () => {
  pan.value = 0
})

watch(() => route.query.at, (at) => {
  if (typeof at === 'string' && at) panToSlug(at)
})

onMounted(() => {
  measure()
  const { at } = route.query
  if (typeof at === 'string' && at) panToSlug(at)
  const el = viewport.value
  el?.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)
  const ro = new ResizeObserver(measure)
  if (el) ro.observe(el)
  onBeforeUnmount(() => {
    el?.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKey)
    ro.disconnect()
  })
})
</script>

<template>
  <div
    ref="viewport"
    class="viewport"
    :class="{ grabbing: dragging }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <motion.div
      class="canvas"
      :animate="{ x: -pan }"
      :transition="dragging || reduced ? { duration: 0 } : glide"
      :style="{ width: `${canvasW}px` }"
    >
      <AnimatePresence :initial="false">
        <ThingsFigure
          v-for="(figure, index) in figures"
          :key="figure.pose.slug"
          :item="figure.item"
          :pose="figure.pose"
          :index
          :dim="dimFor(figure.pose.slug)"
          :spring
          :arrive
          @enter="hoverSlug = figure.pose.slug"
          @leave="hoverSlug = hoverSlug === figure.pose.slug ? null : hoverSlug"
        />
      </AnimatePresence>
    </motion.div>
    <p class="progress" aria-live="polite">
      {{ placeLabel }}
    </p>
    <p class="affiliate">
      Some links are affiliate links.
    </p>
    <div class="vignette" aria-hidden="true" />
  </div>
</template>

<style scoped>
.viewport {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  touch-action: pan-y;
  background: #FAF9F7;
}
.viewport.grabbing {
  cursor: grabbing;
}
.canvas {
  position: relative;
  height: 100%;
  will-change: transform;
}
.progress,
.affiliate {
  position: absolute;
  bottom: 22px;
  z-index: 12;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--ui-text-dimmed);
  pointer-events: none;
}
.progress {
  left: 28px;
}
.affiliate {
  right: 28px;
}
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 6;
  background: radial-gradient(ellipse at center, rgb(250 249 247 / 0) 52%, rgb(28 22 16 / 0.045) 100%);
}

@media (max-width: 899px) {
  .viewport {
    height: 100dvh;
    overflow-x: hidden;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    cursor: auto;
  }
  .canvas {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 8vh;
    width: 100% !important;
    height: auto;
    padding: 18vh 0 16vh;
    transform: none !important;
  }
  .progress {
    display: none;
  }
  .affiliate {
    position: static;
    padding: 0 24px 28px;
    text-align: center;
  }
}
</style>
