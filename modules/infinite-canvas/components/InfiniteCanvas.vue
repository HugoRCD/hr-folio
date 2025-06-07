<script setup lang="ts" generic="T = any">
interface ZoomOptions {
  minZoom?: number
  maxZoom?: number
  zoomFactor?: number
  enableCtrl?: boolean
  enableMeta?: boolean
  enableAlt?: boolean
}

interface InfiniteCanvasProps {
  items: T[]
  baseGap?: number
  zoomOptions?: ZoomOptions
}

interface InfiniteCanvasEmits {
  itemClick: [item: T, index: number]
}

const props = withDefaults(defineProps<InfiniteCanvasProps>(), {
  baseGap: 40
})

const emit = defineEmits<InfiniteCanvasEmits>()

// Template refs
const containerRef = ref<HTMLElement | null>(null)

// Canvas logic
const canvas = useInfiniteCanvas({
  items: props.items as any[],
  baseGap: props.baseGap,
  zoomOptions: props.zoomOptions,
  containerRef
})

const {
  offset,
  zoom,
  visibleItems,
  gridItems,
  containerDimensions,
  canvasBounds,
  canClick,
  updateDimensions,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleWheel,
  navigateTo
} = canvas

// Destructure touch handlers separately to avoid conflicts
const { handleTouchStart, handleTouchMove, handleTouchEnd } = canvas

// Handle item clicks
const handleItemClick = (item: T, index: number, event: Event) => {
  if (!canClick.value) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    return false
  }
  
  emit('itemClick', item, index)
}

// Mouse event handlers
const handleMouseDown = (event: MouseEvent) => {
  handlePointerDown(event.clientX, event.clientY)
}

const handleMouseMove = (event: MouseEvent) => {
  event.preventDefault()
  handlePointerMove(event.clientX, event.clientY)
}

const handleMouseUp = (event: MouseEvent) => {
  handlePointerUp(event.clientX, event.clientY)
}

// Touch event handlers with proper cancelable check and preventDefault
const handleTouchStartWrapper = (event: TouchEvent) => {
  try {
    // Only prevent default if the event is cancelable
    if (event.cancelable) {
      event.preventDefault()
    }
    handleTouchStart(event)
  } catch (error) {
    // Silently ignore touch errors on mobile
  }
}

const handleTouchMoveWrapper = (event: TouchEvent) => {
  try {
    // Only prevent default if the event is cancelable
    if (event.cancelable) {
      event.preventDefault()
    }
    handleTouchMove(event)
  } catch (error) {
    // Silently ignore touch errors on mobile
  }
}

const handleTouchEndWrapper = (event: TouchEvent) => {
  try {
    handleTouchEnd(event)
  } catch (error) {
    // Silently ignore touch errors on mobile
  }
}

// Lifecycle
onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
  
  // Add touch listeners with proper options for mobile
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('touchstart', handleTouchStartWrapper, { passive: false })
      containerRef.value.addEventListener('touchmove', handleTouchMoveWrapper, { passive: false })
      containerRef.value.addEventListener('touchend', handleTouchEndWrapper, { passive: true })
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
  
  // Clean up touch listeners
  if (containerRef.value) {
    containerRef.value.removeEventListener('touchstart', handleTouchStartWrapper)
    containerRef.value.removeEventListener('touchmove', handleTouchMoveWrapper)  
    containerRef.value.removeEventListener('touchend', handleTouchEndWrapper)
  }
})

// Expose public API with reactive values
defineExpose({
  navigateTo,
  offset: readonly(offset),
  zoom: readonly(zoom),
  gridItems: readonly(gridItems),
  containerDimensions: readonly(containerDimensions),
  canvasBounds: readonly(canvasBounds)
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative h-full w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-x touch-pan-y overscroll-none"
    style="touch-action: none; overscroll-behavior: none;"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @wheel.prevent="handleWheel"
  >
    <!-- Canvas -->
    <div
      class="absolute origin-top-left"
      :style="{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
        width: `${canvasBounds.width}px`,
        height: `${canvasBounds.height}px`
      }"
    >
      <!-- Visible items -->
      <div
        v-for="gridItem in visibleItems"
        :key="gridItem.index"
        class="absolute"
        :style="{
          left: `${gridItem.position.x}px`,
          top: `${gridItem.position.y}px`,
          width: `${gridItem.width}px`,
          height: `${gridItem.height}px`
        }"
      >
        <slot
          v-if="items[gridItem.index]"
          :item="items[gridItem.index]!"
          :index="gridItem.index"
          :position="gridItem.position"
          :on-item-click="(event: Event) => handleItemClick(items[gridItem.index]!, gridItem.index, event)"
        />
      </div>
    </div>
  </div>
</template> 
