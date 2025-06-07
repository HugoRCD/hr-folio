<script setup lang="ts">
import type { MinimapProps } from '../types'

const props = defineProps<MinimapProps>()

const MINIMAP_SIZE = 120

/**
 * Calculate the scale factor to fit canvas in minimap
 */
const scale = computed(() => {
  const { width, height } = props.canvasBounds
  return Math.min(MINIMAP_SIZE / width, MINIMAP_SIZE / height)
})

/**
 * Actual minimap dimensions after scaling
 */
const dimensions = computed(() => ({
  width: props.canvasBounds.width * scale.value,
  height: props.canvasBounds.height * scale.value
}))

/**
 * Positioning to center the minimap content
 */
const centerOffset = computed(() => ({
  x: (MINIMAP_SIZE - dimensions.value.width) / 2,
  y: (MINIMAP_SIZE - dimensions.value.height) / 2
}))

/**
 * Transform grid items to minimap coordinates with proper scaling
 */
const items = computed(() => 
  props.gridItems.map(item => ({
    index: item.index,
    x: item.position.x * scale.value,
    y: item.position.y * scale.value,
    width: Math.max(2, item.width * scale.value),
    height: Math.max(2, item.height * scale.value)
  }))
)

/**
 * Calculate viewport rectangle in minimap space
 */
const viewport = computed(() => {
  const { width, height } = props.containerDimensions
  const { zoom } = props
  
  // Canvas coordinates of current viewport
  const viewX = -props.offset.x / zoom
  const viewY = -props.offset.y / zoom
  const viewWidth = width / zoom
  const viewHeight = height / zoom
  
  // Convert to minimap coordinates
  const x = viewX * scale.value
  const y = viewY * scale.value
  const w = viewWidth * scale.value
  const h = viewHeight * scale.value
  
  return {
    x: Math.max(0, Math.min(dimensions.value.width - w, x)),
    y: Math.max(0, Math.min(dimensions.value.height - h, y)),
    width: Math.min(dimensions.value.width, w),
    height: Math.min(dimensions.value.height, h)
  }
})
</script>

<template>
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
          left: centerOffset.x + 'px',
          top: centerOffset.y + 'px',
          width: dimensions.width + 'px',
          height: dimensions.height + 'px'
        }"
      >
        <!-- Items with real shapes -->
        <div
          v-for="item in items"
          :key="item.index"
          class="absolute bg-accented border border-inverted/30 rounded-sm"
          :style="{
            width: item.width + 'px',
            height: item.height + 'px',
            left: item.x + 'px',
            top: item.y + 'px'
          }"
        />

        <!-- Viewport indicator -->
        <div
          class="absolute border border-primary bg-primary/10"
          :style="{
            left: viewport.x + 'px',
            top: viewport.y + 'px',
            width: viewport.width + 'px',
            height: viewport.height + 'px',
          }"
        />
      </div>
    </div>
  </div>
</template> 
