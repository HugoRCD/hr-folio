# Infinite Canvas Module

A high-performance, scrollable canvas for Nuxt applications with drag, zoom, and touch support.

## Features

- 🚀 **Performance optimized** with viewport culling and virtualization
- 📱 **Mobile-first** with touch gestures and pinch-to-zoom
- 🎯 **TypeScript support** with comprehensive type definitions
- 🎨 **Customizable** components and styling
- 📊 **Built-in minimap** for navigation
- ⚡ **Smooth animations** with momentum and physics

## Installation

Copy this module to your `modules` folder and add it will automatically be loaded by Nuxt.

## Basic Usage

```vue
<template>
  <Canvas 
    :items="items"
    :base-gap="50"
    @item-click="handleItemClick"
  >
    <template #default="{ item, index, onItemClick }">
      <div @click="onItemClick">
        <img :src="item.image" :alt="item.title" />
        <h3>{{ item.title }}</h3>
      </div>
    </template>
  </Canvas>
</template>

<script setup>
const items = ref([
  { 
    image: '/image1.jpg', 
    title: 'Item 1', 
    link: 'https://example.com' 
  },
  // ... more items
])

const handleItemClick = (item, index) => {
  window.open(item.link, '_blank')
}
</script>
```

## Components

### Canvas

The main infinite canvas component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CanvasItem[]` | `[]` | Array of items to display |
| `baseGap` | `number` | `40` | Minimum gap between items (px) |
| `zoomOptions` | `ZoomOptions` | `{}` | Zoom configuration |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `item-click` | `(item, index)` | Fired when an item is clicked |

#### Slot Props

| Prop | Type | Description |
|------|------|-------------|
| `item` | `T` | The item data |
| `index` | `number` | Item index |
| `visibleIndex` | `number` | Index among visible items |
| `onItemClick` | `Function` | Click handler for the item |

### CanvasMinimap

Navigation minimap component.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `CanvasItem[]` | Canvas items |
| `gridItems` | `GridItem[]` | Positioned grid items |
| `offset` | `Position` | Current canvas offset |
| `zoom` | `number` | Current zoom level |
| `containerDimensions` | `ContainerDimensions` | Container size |
| `canvasBounds` | `CanvasBounds` | Canvas boundaries |

### CanvasLoader

Loading progress component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | `number` | `0` | Loading progress (0-1) |
| `isVisible` | `boolean` | `true` | Whether loader is visible |
| `title` | `string` | `undefined` | Optional title |
| `description` | `string` | `undefined` | Optional description |

## Composables

### useInfiniteCanvas

Core canvas functionality composable.

```ts
const canvas = useInfiniteCanvas({
  items: myItems,
  baseGap: 50,
  zoomOptions: {
    minZoom: 0.4,
    maxZoom: 2.2
  },
  containerRef
})
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `items` | `CanvasItem[]` | Items to display |
| `baseGap` | `number` | Gap between items |
| `zoomOptions` | `ZoomOptions` | Zoom configuration |
| `containerRef` | `Ref<HTMLElement>` | Container element reference |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `offset` | `Ref<Position>` | Current canvas offset |
| `zoom` | `Ref<number>` | Current zoom level |
| `visibleItems` | `ComputedRef<GridItem[]>` | Currently visible items |
| `gridItems` | `ComputedRef<GridItem[]>` | All positioned items |
| `canClick` | `Ref<boolean>` | Whether clicks are allowed |
| `updateDimensions` | `Function` | Update container dimensions |
| `navigateTo` | `Function` | Navigate to position |

### useImagePreloader

Media preloading composable.

```ts
const { progress, isComplete, startPreloading } = useImagePreloader({
  images: imageUrls,
  onProgress: (progress) => console.log(`${progress * 100}%`),
  onComplete: () => console.log('Done!')
})
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `images` | `string[]` | Array of image/video URLs |
| `onProgress` | `Function` | Progress callback (0-1) |
| `onComplete` | `Function` | Completion callback |

## Types

### CanvasItem

```ts
interface CanvasItem {
  image: string      // URL to image or video
  title: string      // Display title
  link: string       // External link URL
  width?: number     // Item width (default: 300)
  height?: number    // Item height (default: 300)
  [key: string]: any // Additional properties
}
```

### ZoomOptions

```ts
interface ZoomOptions {
  minZoom?: number      // Minimum zoom level (default: 0.4)
  maxZoom?: number      // Maximum zoom level (default: 2.2)
  zoomFactor?: number   // Zoom step factor (default: 1.08)
  enableCtrl?: boolean  // Enable Ctrl+scroll zoom (default: true)
  enableMeta?: boolean  // Enable Cmd+scroll zoom (default: true)
  enableAlt?: boolean   // Enable Alt+scroll zoom (default: true)
}
```

## Utilities

### isVideo(url)

Detects if a URL points to a video file.

```ts
if (isVideo(item.image)) {
  // Render video element
}
```

### isMobileDevice(userAgent, windowWidth)

Detects mobile devices.

```ts
const isMobile = isMobileDevice(navigator.userAgent, window.innerWidth)
```

### getTouchDistance(touch1, touch2)

Calculates distance between two touch points.

### getTouchCenter(touch1, touch2)

Calculates center point between two touches.

## Performance

The module includes several performance optimizations:

- **Viewport culling**: Only renders visible items
- **Adaptive throttling**: Reduces event frequency at high zoom
- **Item limiting**: Caps visible items based on zoom level
- **GPU acceleration**: Uses `transform3d` and `will-change`
- **Distance sorting**: Prioritizes items closest to viewport center

## License

MIT 