<script setup lang="ts" generic="T extends Record<string, any>">
import type { ItemConfig } from '~/composables/useInfiniteCanvas'

interface InfiniteCanvasProps {
  gridSize: number
  initialPosition?: { x: number; y: number }
  class?: string
}

const props = withDefaults(defineProps<InfiniteCanvasProps>(), {
  gridSize: 160,
  initialPosition: () => ({ x: 0, y: 0 }),
})

const slots = defineSlots<{
  default(props: { item: ItemConfig }): any
}>()

const {
  containerRef,
  offset,
  isDragging,
  gridItems,
  isMoving,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleWheel,
} = useInfiniteCanvas({
  gridSize: props.gridSize,
  initialPosition: props.initialPosition,
})

// Computed styles
const containerStyle = computed(() => ({
  position: 'absolute' as const,
  inset: '0',
  touchAction: 'none' as const,
  overflow: 'hidden' as const,
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

const innerStyle = computed(() => ({
  position: 'absolute' as const,
  inset: '0',
  transform: `translate3d(${offset.value.x}px, ${offset.value.y}px, 0)`,
  willChange: 'transform',
}))

// Container dimensions
const containerDimensions = computed(() => {
  if (!containerRef.value) return { width: 0, height: 0 }
  const rect = containerRef.value.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
})
</script>

<template>
  <div
    ref="containerRef"
    :class="props.class"
    :style="containerStyle"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @wheel="handleWheel"
  >
    <div :style="innerStyle">
      <div
        v-for="item in gridItems"
        :key="`${item.position.x}-${item.position.y}`"
        :style="{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          width: `${gridSize}px`,
          height: `${gridSize}px`,
          transform: `translate3d(${
            item.position.x * gridSize + containerDimensions.width / 2
          }px, ${
            item.position.y * gridSize + containerDimensions.height / 2
          }px, 0)`,
          marginLeft: `-${gridSize / 2}px`,
          marginTop: `-${gridSize / 2}px`,
          willChange: 'transform',
        }"
      >
        <slot 
          :item="{ 
            gridIndex: item.gridIndex, 
            position: item.position, 
            isMoving 
          }" 
        />
      </div>
    </div>
  </div>
</template> 
