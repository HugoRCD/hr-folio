<script setup lang="ts">
interface MinimapProps {
  items: Array<any>
  gridItems: Array<{ position: { x: number; y: number }; index: number }>
  itemSize: number
  gap: number
  offset: { x: number; y: number }
  containerDimensions: { width: number; height: number }
  canvasBounds: { width: number; height: number }
}

const props = defineProps<MinimapProps>()

// Minimap dimensions
const MINIMAP_SIZE = 120

// Calculate minimap scale
const minimapScale = computed(() => {
  const scaleX = MINIMAP_SIZE / props.canvasBounds.width
  const scaleY = MINIMAP_SIZE / props.canvasBounds.height
  return Math.min(scaleX, scaleY)
})

// Calculate minimap dimensions based on scale
const minimapDimensions = computed(() => ({
  width: props.canvasBounds.width * minimapScale.value,
  height: props.canvasBounds.height * minimapScale.value
}))

// Convert grid items to minimap positions
const minimapItems = computed(() => {
  return props.gridItems.map(item => ({
    ...item,
    minimapPosition: {
      x: item.position.x * minimapScale.value,
      y: item.position.y * minimapScale.value
    }
  }))
})

// Calculate viewport rectangle in minimap coordinates
const viewportRect = computed(() => {
  const { width, height } = props.containerDimensions
  
  // Current viewport position in canvas coordinates (top-left corner)
  const viewportX = -props.offset.x
  const viewportY = -props.offset.y
  
  // Convert to minimap coordinates
  const minimapX = viewportX * minimapScale.value
  const minimapY = viewportY * minimapScale.value
  const minimapWidth = width * minimapScale.value
  const minimapHeight = height * minimapScale.value
  
  return {
    x: Math.max(0, Math.min(minimapDimensions.value.width - minimapWidth, minimapX)),
    y: Math.max(0, Math.min(minimapDimensions.value.height - minimapHeight, minimapY)),
    width: Math.min(minimapDimensions.value.width, minimapWidth),
    height: Math.min(minimapDimensions.value.height, minimapHeight)
  }
})
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 pointer-events-none">
    <div class="relative overflow-hidden rounded-lg border border-white/20 bg-black/40 p-2 backdrop-blur-sm">
      <!-- Minimap container -->
      <div 
        class="relative"
        :style="{ width: MINIMAP_SIZE + 'px', height: MINIMAP_SIZE + 'px' }"
      >
        <!-- Centered minimap content -->
        <div
          class="absolute bg-white/5"
          :style="{
            left: (MINIMAP_SIZE - minimapDimensions.width) / 2 + 'px',
            top: (MINIMAP_SIZE - minimapDimensions.height) / 2 + 'px',
            width: minimapDimensions.width + 'px',
            height: minimapDimensions.height + 'px'
          }"
        >
          <!-- Items as small dots -->
          <div
            v-for="item in minimapItems"
            :key="item.index"
            class="absolute bg-white/70 rounded-full"
            :style="{
              width: '2px',
              height: '2px',
              left: item.minimapPosition.x + 'px',
              top: item.minimapPosition.y + 'px'
            }"
          />

          <!-- Viewport indicator -->
          <div
            class="absolute border border-blue-400/80 bg-blue-400/10"
            :style="{
              left: viewportRect.x + 'px',
              top: viewportRect.y + 'px',
              width: viewportRect.width + 'px',
              height: viewportRect.height + 'px',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template> 
