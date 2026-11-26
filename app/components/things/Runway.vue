<script setup lang="ts">
import { motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const props = defineProps<{
  items: ThingItem[]
}>()

const emit = defineEmits<{
  open: [item: ThingItem]
}>()

const { spring, glide, reduced } = useThingMotion()
const viewport = useTemplateRef<HTMLElement>('viewport')
const pan = ref(0)
const dragging = ref(false)
const moved = ref(false)
const hover = ref<string | null>(null)
const grab = { x: 0, pan: 0 }
const viewW = ref(1200)
const SLOT = 240
const narrow = useMediaQuery('(max-width: 767px)')

const width = computed(() => 80 + props.items.length * SLOT + 80)
const maxPan = computed(() => Math.max(0, width.value - viewW.value))

function clamp(v: number) {
  return Math.max(0, Math.min(maxPan.value, v))
}

function onWheel(e: WheelEvent) {
  if (narrow.value) return
  e.preventDefault()
  pan.value = clamp(pan.value + e.deltaY + e.deltaX)
}

function onDown(e: PointerEvent) {
  if (narrow.value) return
  if (e.button !== 0) return
  dragging.value = true
  moved.value = false
  grab.x = e.clientX
  grab.pan = pan.value
  viewport.value?.setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - grab.x
  if (Math.abs(dx) > 6) moved.value = true
  pan.value = clamp(grab.pan - dx)
}

function onUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  viewport.value?.releasePointerCapture(e.pointerId)
}

function open(item: ThingItem) {
  if (moved.value) return
  emit('open', item)
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    pan.value = clamp(pan.value + SLOT)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    pan.value = clamp(pan.value - SLOT)
  } else if (e.key === 'Home') pan.value = 0
  else if (e.key === 'End') pan.value = maxPan.value
}

let observer: ResizeObserver | undefined

onMounted(() => {
  viewW.value = viewport.value?.clientWidth ?? 1200
  const el = viewport.value
  el?.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)
  observer = new ResizeObserver(() => {
    viewW.value = el?.clientWidth ?? 1200 
  })
  if (el) observer.observe(el)
})

onBeforeUnmount(() => {
  viewport.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('keydown', onKey)
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="viewport"
    class="runway"
    :class="{ grabbing: dragging }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <motion.div
      class="strip"
      :animate="{ x: -pan }"
      :transition="dragging || reduced ? { duration: 0 } : glide"
      :style="{ width: `${width}px` }"
    >
      <motion.button
        v-for="item in items"
        :key="item.slug"
        type="button"
        class="slot"
        :class="{ dim: hover && hover !== item.slug }"
        :while-hover="reduced ? false : { y: -8 }"
        :transition="spring"
        @mouseenter="hover = item.slug"
        @mouseleave="hover = hover === item.slug ? null : hover"
        @click="open(item)"
      >
        <span class="frame">
          <ThingsCutout :item />
        </span>
        <span class="contact" aria-hidden="true" />
        <span class="whisper">
          <span class="name">{{ item.name }}</span>
          <span class="brand">{{ item.brand }}</span>
          <span class="price">{{ formatPrice(item.price) }}</span>
        </span>
      </motion.button>
    </motion.div>
  </div>
</template>

<style scoped>
.runway {
  overflow: hidden;
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
}
.runway.grabbing { cursor: grabbing; }
.strip {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 40px 80px;
  will-change: transform;
}
.slot {
  flex: 0 0 232px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  box-shadow: none;
  color: inherit;
  text-align: left;
  transition: opacity 0.35s ease;
}
.slot.dim { opacity: 0.4; }
.frame {
  display: grid;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 8%;
  box-sizing: border-box;
  overflow: hidden;
}
.contact {
  display: block;
  width: 50%;
  height: 10px;
  margin: 0 auto;
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.16) 0%, rgb(32 24 16 / 0) 72%);
  filter: blur(8px);
}
.whisper {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 14px;
  min-height: 58px;
}
.name {
  font-size: 13px;
  color: #111111;
}
.brand {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.price {
  font-family: var(--font-redaction);
  font-size: 15px;
  color: #6B6B6B;
}

@media (max-width: 767px) {
  .runway {
    overflow-x: auto;
    overflow-y: hidden;
    cursor: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .runway::-webkit-scrollbar {
    display: none;
  }
  .strip {
    transform: none !important;
    align-items: center;
    min-height: 100%;
    padding: 12px 18px calc(80px + env(safe-area-inset-bottom, 0px));
  }
  .slot {
    flex-basis: min(72vw, 260px);
    scroll-snap-align: center;
  }
}
</style>
