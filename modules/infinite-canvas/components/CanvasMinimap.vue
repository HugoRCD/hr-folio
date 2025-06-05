<script setup lang="ts">
interface MinimapProps {
  items: Array<any>
  gridItems: Array<{ 
    position: { x: number; y: number }
    index: number
    width: number
    height: number
  }>
  offset: { x: number; y: number }
  zoom: number
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

// Convert grid items to minimap positions with real dimensions
const minimapItems = computed(() => {
  return props.gridItems.map(item => {
    const scaledWidth = (item.width || 300) * minimapScale.value
    const scaledHeight = (item.height || 300) * minimapScale.value
    
    return {
      ...item,
      minimapPosition: {
        x: item.position.x * minimapScale.value,
        y: item.position.y * minimapScale.value
      },
      minimapSize: {
        width: Math.max(2, scaledWidth),
        height: Math.max(2, scaledHeight)
      }
    }
  })
})

// Calculate viewport rectangle in minimap coordinates with zoom
const viewportRect = computed(() => {
  const { width, height } = props.containerDimensions
  const currentZoom = props.zoom
  
  // Current viewport position in canvas coordinates (accounting for zoom)
  const viewportX = (-props.offset.x) / currentZoom
  const viewportY = (-props.offset.y) / currentZoom
  
  // Actual viewport size in canvas coordinates (smaller when zoomed in)
  const actualViewportWidth = width / currentZoom
  const actualViewportHeight = height / currentZoom
  
  // Convert to minimap coordinates
  const minimapX = viewportX * minimapScale.value
  const minimapY = viewportY * minimapScale.value
  const minimapWidth = actualViewportWidth * minimapScale.value
  const minimapHeight = actualViewportHeight * minimapScale.value
  
  return {
    x: Math.max(0, Math.min(minimapDimensions.value.width - minimapWidth, minimapX)),
    y: Math.max(0, Math.min(minimapDimensions.value.height - minimapHeight, minimapY)),
    width: Math.min(minimapDimensions.value.width, minimapWidth),
    height: Math.min(minimapDimensions.value.height, minimapHeight)
  }
})
</script>

<template>
  <div class="fixed bottom-4 right-4 pointer-events-none">
    <div class="relative overflow-hidden rounded-lg border border-default bg-default/40 p-2 backdrop-blur-sm shadow-lg">
      <!-- Minimap container -->
      <div 
        class="relative"
        :style="{ width: MINIMAP_SIZE + 'px', height: MINIMAP_SIZE + 'px' }"
      >
        <!-- Centered minimap content -->
        <div
          class="absolute bg-muted/50"
          :style="{
            left: (MINIMAP_SIZE - minimapDimensions.width) / 2 + 'px',
            top: (MINIMAP_SIZE - minimapDimensions.height) / 2 + 'px',
            width: minimapDimensions.width + 'px',
            height: minimapDimensions.height + 'px'
          }"
        >
          <!-- Items with real shapes -->
          <div
            v-for="item in minimapItems"
            :key="item.index"
            class="absolute bg-accented border border-inverted/30 rounded-sm"
            :style="{
              width: item.minimapSize.width + 'px',
              height: item.minimapSize.height + 'px',
              left: item.minimapPosition.x + 'px',
              top: item.minimapPosition.y + 'px'
            }"
          />

          <!-- Viewport indicator -->
          <div
            class="absolute border border-primary bg-primary/10"
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
