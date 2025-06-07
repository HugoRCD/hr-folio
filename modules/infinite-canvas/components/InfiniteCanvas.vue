<script setup lang="ts" generic="T extends CanvasItem">
import type { InfiniteCanvasProps, InfiniteCanvasEmits, CanvasItem } from '../types'
import { PHYSICS } from '../constants'

const props = withDefaults(defineProps<InfiniteCanvasProps<T>>(), {
  baseGap: 40
})

const emit = defineEmits<InfiniteCanvasEmits<T>>()

const containerRef = ref<HTMLElement | null>(null)

const {
  offset,
  zoom,
  visibleItems,
  gridItems,
  containerDimensions,
  canvasBounds,
  canClick,
  updateDimensions,
  handlePointerDown: handlePointerDownCore,
  handlePointerMove: handlePointerMoveCore,
  handlePointerUp: handlePointerUpCore,
  handleWheel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  navigateTo
} = useInfiniteCanvas({
  items: props.items as CanvasItem[],
  baseGap: props.baseGap,
  zoomOptions: props.zoomOptions,
  containerRef
})

// Track drag state for click handling
const isCurrentlyDragging = ref(false)
const dragStartPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const totalDragDistance = ref(0)

const handlePointerDown = (event: PointerEvent) => {
  handlePointerDownCore(event.clientX, event.clientY)
  isCurrentlyDragging.value = false
  dragStartPosition.value = { x: event.clientX, y: event.clientY }
  totalDragDistance.value = 0
}

const handlePointerMove = (event: PointerEvent) => {
  const currentPos = { x: event.clientX, y: event.clientY }
  const distance = Math.sqrt(
    Math.pow(currentPos.x - dragStartPosition.value.x, 2) + 
    Math.pow(currentPos.y - dragStartPosition.value.y, 2)
  )
  
  if (distance > PHYSICS.DRAG_THRESHOLD) {
    isCurrentlyDragging.value = true
  }
  
  totalDragDistance.value = distance
  handlePointerMoveCore(event.clientX, event.clientY)
}

const handlePointerUp = (event: PointerEvent) => {
  handlePointerUpCore(event.clientX, event.clientY)
  
  if (isCurrentlyDragging.value) {
    setTimeout(() => {
      isCurrentlyDragging.value = false
    }, 100)
  }
}

const handleItemClick = (item: T | undefined, index: number) => {
  if (item && canClick.value && !isCurrentlyDragging.value && totalDragDistance.value <= PHYSICS.DRAG_THRESHOLD) {
    emit('itemClick', item, index)
  }
}

onMounted(() => {
  updateDimensions()
  useResizeObserver(containerRef, updateDimensions)
})

defineExpose({
  offset,
  zoom,
  visibleItems,
  gridItems,
  containerDimensions,
  canvasBounds,
  updateDimensions,
  navigateTo
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative size-full overflow-hidden touch-none select-none"
    style="touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div
      class="absolute transform-gpu will-change-transform"
      :style="{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }"
    >
      <div
        v-for="(gridItem, visibleIndex) in visibleItems"
        :key="gridItem.index"
        class="absolute transform-gpu will-change-transform"
        :style="{
          left: `${gridItem.position.x}px`,
          top: `${gridItem.position.y}px`,
          width: `${gridItem.width}px`,
          height: `${gridItem.height}px`,
          backfaceVisibility: 'hidden',
        }"
      >
        <slot
          v-if="props.items[gridItem.index]"
          :item="props.items[gridItem.index]"
          :index="gridItem.index"
          :visible-index
          :on-item-click="() => handleItemClick(props.items[gridItem.index], gridItem.index)"
        />
      </div>
    </div>
  </div>
</template> 
