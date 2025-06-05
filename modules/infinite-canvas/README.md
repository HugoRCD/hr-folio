# Infinite Canvas Module

A powerful Nuxt 3 module for creating infinite canvas experiences with drag, zoom, and virtualization support.

## Features

- ✨ **Infinite Canvas** - Smooth pan and zoom interactions
- 🎯 **Virtualization** - Only renders visible items for optimal performance
- 📱 **Touch Support** - Works on mobile and desktop
- 🔍 **Zoom System** - Configurable zoom with modifier keys
- 🗺️ **Minimap** - Visual navigation with actual item shapes
- 📦 **Scattered Layout** - Intelligent positioning with collision avoidance  
- 🖼️ **Image Preloading** - Elegant loading experience
- 🎨 **Fully Customizable** - Complete control over item rendering
- 📏 **Variable Sizes** - Support for different aspect ratios

## Installation

1. Add the module to your Nuxt project:

```bash
# Copy the module to your project
cp -r modules/infinite-canvas modules/
```

2. Register the module in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    './modules/infinite-canvas'
  ],
  infiniteCanvas: {
    prefix: 'Infinite' // Optional: customize component prefix
  }
})
```

## Components

### InfiniteCanvas

The main canvas component that handles all interactions and virtualization.

```vue
<template>
  <InfiniteCanvas 
    :items="canvasItems"
    :base-gap="50"
    :zoom-options="{
      minZoom: 0.5,
      maxZoom: 2.0,
      zoomFactor: 1.08,
      enableCtrl: true,
      enableMeta: true,
      enableAlt: true
    }"
    @item-click="handleItemClick"
  >
    <template #default="{ item, index, onItemClick }">
      <!-- Your custom item rendering -->
      <div @click="onItemClick">
        <img :src="item.image" :alt="item.title" />
        <h3>{{ item.title }}</h3>
      </div>
    </template>
  </InfiniteCanvas>
</template>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | required | Array of items to display |
| `baseGap` | `number` | `40` | Minimum gap between items |
| `zoomOptions` | `ZoomOptions` | `{}` | Zoom configuration |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `(item: T, index: number)` | Triggered when an item is clicked (not dragged) |

#### Slot Props

| Prop | Type | Description |
|------|------|-------------|
| `item` | `T` | The current item data |
| `index` | `number` | Item index |
| `position` | `Position` | Item position on canvas |
| `onItemClick` | `Function` | Click handler for the item |

### InfiniteCanvasMinimap

A minimap component showing the viewport and item positions.

```vue
<template>
  <InfiniteCanvasMinimap
    :items="items"
    :grid-items="canvas.gridItems"
    :offset="canvas.offset"
    :zoom="canvas.zoom"
    :container-dimensions="canvas.containerDimensions"
    :canvas-bounds="canvas.canvasBounds"
  />
</template>
```

### InfiniteCanvasLoader

An elegant loader component for image preloading.

```vue
<template>
  <InfiniteCanvasLoader
    :progress="loadingProgress"
    :is-visible="showLoader"
  />
</template>
```

## Composables

### useInfiniteCanvas

The core composable handling canvas logic.

```typescript
const canvas = useInfiniteCanvas({
  items: canvasItems,
  baseGap: 50,
  zoomOptions: {
    minZoom: 0.5,
    maxZoom: 2.0
  },
  containerRef: canvasElement
})
```

### useImagePreloader

Handles image preloading with progress tracking.

```typescript
const { progress, isComplete, startPreloading } = useImagePreloader({
  images: imageUrls,
  onProgress: (progress) => console.log(`Loading: ${progress}%`),
  onComplete: () => console.log('All images loaded!')
})

onMounted(() => {
  startPreloading()
})
```

## Types

### CanvasItem

```typescript
interface CanvasItem {
  image: string
  title: string
  type: string
  link: string
  width?: number
  height?: number
  [key: string]: any
}
```

### ZoomOptions

```typescript
interface ZoomOptions {
  minZoom?: number      // Default: 0.5 (50%)
  maxZoom?: number      // Default: 2.0 (200%)
  zoomFactor?: number   // Default: 1.08
  enableCtrl?: boolean  // Default: true
  enableMeta?: boolean  // Default: true (⌘ on Mac)
  enableAlt?: boolean   // Default: true
}
```

## Usage Examples

### Basic Portfolio Canvas

```vue
<script setup>
const items = [
  {
    image: '/project1.jpg',
    title: 'Project 1',
    type: 'project',
    link: 'https://example.com',
    width: 400,
    height: 300
  }
  // ... more items
]

const handleItemClick = (item) => {
  window.open(item.link, '_blank')
}
</script>

<template>
  <InfiniteCanvas :items="items" @item-click="handleItemClick">
    <template #default="{ item, onItemClick }">
      <div 
        class="canvas-item"
        @click="onItemClick"
      >
        <img :src="item.image" :alt="item.title" />
        <div class="overlay">
          <h3>{{ item.title }}</h3>
          <span class="type">{{ item.type }}</span>
        </div>
      </div>
    </template>
  </InfiniteCanvas>
</template>
```

### With Image Preloading

```vue
<script setup>
const items = ref([...])
const imageUrls = computed(() => items.value.map(item => item.image))

const { progress, isComplete, startPreloading } = useImagePreloader({
  images: imageUrls.value,
  onComplete: () => {
    // Hide loader, show canvas
  }
})

onMounted(() => {
  startPreloading()
})
</script>

<template>
  <div>
    <InfiniteCanvasLoader 
      :progress="progress" 
      :is-visible="!isComplete" 
    />
    
    <InfiniteCanvas 
      v-show="isComplete"
      :items="items"
    >
      <!-- Item template -->
    </InfiniteCanvas>
  </div>
</template>
```

## Configuration

You can configure the module in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  infiniteCanvas: {
    prefix: 'Canvas' // Components will be named CanvasInfinite, etc.
  }
})
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Tips

1. **Virtualization**: Only visible items are rendered, but consider your item count
2. **Image Optimization**: Use optimized images and consider using Nuxt Image
3. **Debounced Interactions**: The canvas automatically debounces resize events
4. **Memory Management**: Large canvases are automatically constrained

## License

MIT License - feel free to use in your projects! 