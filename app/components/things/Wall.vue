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

const CELL = 220
const GAP = 72
const COLS = 7

const board = computed(() => {
  const cells = props.items.map((item, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    return {
      item,
      x: 80 + col * (CELL + GAP) + (row % 2) * 36,
      y: 48 + row * (CELL * 1.2 + GAP),
    }
  })
  const width = 80 + COLS * (CELL + GAP) + 120
  const rows = Math.ceil(props.items.length / COLS) || 1
  const height = 48 + rows * (CELL * 1.2 + GAP) + 80
  return { cells, width, height }
})

const max = computed(() => ({
  x: Math.max(0, board.value.width - view.w),
  y: Math.max(0, board.value.height - view.h),
}))

function clamp() {
  pan.x = Math.max(0, Math.min(max.value.x, pan.x))
  pan.y = Math.max(0, Math.min(max.value.y, pan.y))
}

function measure() {
  const el = viewport.value
  if (!el) return
  view.w = el.clientWidth
  view.h = el.clientHeight
  clamp()
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  pan.x += e.deltaX + (e.shiftKey ? e.deltaY : 0)
  pan.y += e.shiftKey ? 0 : e.deltaY
  clamp()
}

function onDown(e: PointerEvent) {
  if (e.button !== 0) return
  drag.on = true
  drag.moved = false
  drag.x = e.clientX
  drag.y = e.clientY
  drag.px = pan.x
  drag.py = pan.y
  viewport.value?.setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (!drag.on) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true
  pan.x = drag.px - dx
  pan.y = drag.py - dy
  clamp()
}

function onUp(e: PointerEvent) {
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
      :animate="{ x: -pan.x, y: -pan.y }"
      :transition="drag.on || reduced ? { duration: 0 } : glide"
      :style="{ width: `${board.width}px`, height: `${board.height}px` }"
    >
      <motion.button
        v-for="cell in board.cells"
        :key="cell.item.slug"
        type="button"
        class="cell"
        :class="{ dim: hover && hover !== cell.item.slug }"
        :style="{ left: `${cell.x}px`, top: `${cell.y}px` }"
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
  </div>
</template>

<style scoped>
.wall {
  position: relative;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  background: #FAF9F7;
}
.wall.grabbing { cursor: grabbing; }
.board {
  position: relative;
  will-change: transform;
}
.cell {
  position: absolute;
  width: 220px;
  height: 264px;
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
  height: 220px;
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

@media (max-width: 899px) {
  .wall {
    height: auto;
    overflow: visible;
    cursor: auto;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px 16px;
    width: 100% !important;
    height: auto !important;
    padding: 20px 16px 100px;
    transform: none !important;
  }
  .cell {
    position: relative;
    left: auto !important;
    top: auto !important;
    width: 100%;
    height: auto;
  }
  .frame { height: auto; aspect-ratio: 4 / 5; }
}
</style>
