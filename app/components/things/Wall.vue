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
const pan = reactive({ x: 0, y: 0 })
const drag = reactive({ on: false, moved: false, x: 0, y: 0, px: 0, py: 0 })
const hover = ref<string | null>(null)
const view = reactive({ w: 1200, h: 800 })
const zoom = ref(1)
const narrow = useMediaQuery('(max-width: 767px)')
const pts = new Map<number, { x: number, y: number }>()
const pinching = ref(false)
let pinch0 = 0
let zoom0 = 1

const CELL = computed(() => narrow.value ? 128 : 220)
const GAP = computed(() => narrow.value ? 36 : 72)
const COLS = computed(() => narrow.value ? 4 : 7)

const board = computed(() => {
  const cell = CELL.value
  const gap = GAP.value
  const cols = COLS.value
  const cells = props.items.map((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      item,
      x: 48 + col * (cell + gap) + (row % 2) * 20,
      y: 32 + row * (cell * 1.2 + gap),
    }
  })
  const width = 48 + cols * (cell + gap) + 80
  const rows = Math.ceil(props.items.length / cols) || 1
  const height = 32 + rows * (cell * 1.2 + gap) + 80
  return { cells, width, height, cell }
})

const max = computed(() => ({
  x: Math.max(0, board.value.width * zoom.value - view.w),
  y: Math.max(0, board.value.height * zoom.value - view.h),
}))

function clamp() {
  pan.x = Math.max(0, Math.min(max.value.x, pan.x))
  pan.y = Math.max(0, Math.min(max.value.y, pan.y))
}

function setZoom(next: number) {
  zoom.value = Math.min(1.8, Math.max(0.55, next))
  clamp()
}

function measure() {
  const el = viewport.value
  if (!el) return
  view.w = el.clientWidth
  view.h = el.clientHeight
  clamp()
}

function dist() {
  const a = [...pts.values()]
  if (a.length < 2) return 0
  const dx = a[0]!.x - a[1]!.x
  const dy = a[0]!.y - a[1]!.y
  return Math.hypot(dx, dy)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  if (e.ctrlKey || e.metaKey) {
    setZoom(zoom.value * (e.deltaY > 0 ? 0.96 : 1.04))
    return
  }
  pan.x += e.deltaX + (e.shiftKey ? e.deltaY : 0)
  pan.y += e.shiftKey ? 0 : e.deltaY
  clamp()
}

function onDown(e: PointerEvent) {
  if (e.button !== 0) return
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pts.size >= 2) {
    pinch0 = dist()
    zoom0 = zoom.value
    pinching.value = true
    drag.on = false
    viewport.value?.setPointerCapture(e.pointerId)
    return
  }
  drag.on = true
  drag.moved = false
  drag.x = e.clientX
  drag.y = e.clientY
  drag.px = pan.x
  drag.py = pan.y
  viewport.value?.setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pts.size >= 2 && pinch0) {
    const d = dist()
    if (d) setZoom(zoom0 * (d / pinch0))
    drag.moved = true
    return
  }
  if (!drag.on) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true
  pan.x = drag.px - dx
  pan.y = drag.py - dy
  clamp()
}

function onUp(e: PointerEvent) {
  pts.delete(e.pointerId)
  if (pts.size < 2) {
    pinch0 = 0
    pinching.value = false
  }
  if (!drag.on) return
  drag.on = false
  viewport.value?.releasePointerCapture(e.pointerId)
}

function open(item: ThingItem) {
  if (drag.moved) return
  emit('open', item)
}

let observer: ResizeObserver | undefined

onMounted(() => {
  measure()
  const el = viewport.value
  el?.addEventListener('wheel', onWheel, { passive: false })
  observer = new ResizeObserver(measure)
  if (el) observer.observe(el)
})

onBeforeUnmount(() => {
  viewport.value?.removeEventListener('wheel', onWheel)
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="viewport"
    class="wall"
    :class="{ grabbing: drag.on }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <motion.div
      class="board"
      :animate="{ x: -pan.x, y: -pan.y, scale: zoom }"
      :transition="drag.on || reduced || pinching ? { duration: 0 } : glide"
      :style="{ width: `${board.width}px`, height: `${board.height}px` }"
    >
      <motion.button
        v-for="cell in board.cells"
        :key="cell.item.slug"
        type="button"
        class="cell"
        :class="{ dim: hover && hover !== cell.item.slug }"
        :style="{ left: `${cell.x}px`, top: `${cell.y}px`, width: `${board.cell}px`, height: `${board.cell * 1.2}px` }"
        :while-hover="reduced ? false : { y: -8 }"
        :transition="spring"
        @mouseenter="hover = cell.item.slug"
        @mouseleave="hover = hover === cell.item.slug ? null : hover"
        @click="open(cell.item)"
      >
        <span class="frame">
          <ThingsCutout :item="cell.item" />
        </span>
        <span class="contact" aria-hidden="true" />
      </motion.button>
    </motion.div>

    <div class="zoom" aria-label="Zoom" @pointerdown.stop>
      <button type="button" class="zbtn" aria-label="Zoom out" @click="setZoom(zoom - 0.15)">
        -
      </button>
      <button type="button" class="zbtn" aria-label="Zoom in" @click="setZoom(zoom + 0.15)">
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.wall {
  position: relative;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  touch-action: none;
  background: #FAF9F7;
}
.wall.grabbing { cursor: grabbing; }
.board {
  position: relative;
  transform-origin: 0 0;
  will-change: transform;
}
.cell {
  position: absolute;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  box-shadow: none;
  transition: opacity 0.35s ease;
}
.cell.dim { opacity: 0.4; }
.frame {
  display: grid;
  width: 100%;
  height: 84%;
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
.zoom {
  display: none;
  position: absolute;
  left: 12px;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  z-index: 5;
  gap: 6px;
}
.zbtn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #E8E6E1;
  border-radius: 999px;
  background: rgb(250 249 247 / 0.92);
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: 1;
  color: #111111;
  cursor: pointer;
  box-shadow: none;
}

@media (max-width: 767px) {
  .zoom {
    display: flex;
  }
}
</style>
