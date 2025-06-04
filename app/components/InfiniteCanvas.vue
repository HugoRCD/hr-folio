<script setup lang="ts" generic="T = any">
interface InfiniteCanvasProps {
  itemSize: number
  gap?: number
  items: T[]
  initialPosition?: { x: number; y: number }
  overscan?: number
  class?: string
}

const props = withDefaults(defineProps<InfiniteCanvasProps>(), {
  gap: 0,
  initialPosition: () => ({ x: 0, y: 0 }),
  overscan: 2,
})

const slots = defineSlots<{
  default(props: { 
    item: T
    index: number
    position: { x: number; y: number }
    isMoving: boolean
    isActuallyDragging: boolean
    onItemClick: (event: MouseEvent) => void
  }): any
}>()

const emit = defineEmits<{
  itemClick: [item: T, event: MouseEvent]
}>()

const {
  containerRef,
  offset,
  isDragging,
  isActuallyDragging,
  gridItems,
  isMoving,
  containerDimensions,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleWheel,
} = useInfiniteCanvas({
  itemSize: props.itemSize,
  gap: props.gap,
  items: props.items,
  initialPosition: props.initialPosition,
  overscan: props.overscan,
})

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

const getItemStyle = (gridItem: any) => {
  const effectiveItemSize = props.itemSize + props.gap
  const x = gridItem.position.x * effectiveItemSize + containerDimensions.value.width / 2
  const y = gridItem.position.y * effectiveItemSize + containerDimensions.value.height / 2

  return {
    position: 'absolute' as const,
    width: `${props.itemSize}px`,
    height: `${props.itemSize}px`,
    transform: `translate3d(${x}px, ${y}px, 0)`,
    marginLeft: `-${props.itemSize / 2}px`,
    marginTop: `-${props.itemSize / 2}px`,
    willChange: 'transform',
  }
}

// Handle item clicks - only fire if not dragging
const handleItemClick = (item: T, event: MouseEvent) => {
  if (isActuallyDragging.value || isDragging.value) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    return false
  }
  
  emit('itemClick', item, event)
}

// Wrapper to ensure no clicks during drag
const createItemClickHandler = (item: T) => {
  return (event: MouseEvent) => {
    handleItemClick(item, event)
  }
}
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
        v-for="gridItem in gridItems"
        :key="`${gridItem.position.x}-${gridItem.position.y}`"
        :style="getItemStyle(gridItem)"
      >
        <slot 
          v-if="items[gridItem.index]"
          :item="items[gridItem.index]!"
          :index="gridItem.index"
          :position="gridItem.position"
          :is-moving
          :is-actually-dragging
          :on-item-click="createItemClickHandler(items[gridItem.index]!)"
        />
      </div>
    </div>
  </div>
</template> 
