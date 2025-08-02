---
title: Fader
description: A component that creates smooth gradient fade effects to indicate hidden content on vertical scroll.
date: 2025-08-02
---

# Fader

A component that creates smooth gradient fade effects to indicate hidden content on vertical scroll.

## Basic Examples

### Top Fader

::code-preview
  ::div{class="relative overflow-y-auto border border-default rounded-lg" style="height: 300px; width: 100%; max-width: 500px;"}
  :fader{side="top" height="100"}
  ::div{class="p-4 *:my-0"}
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.

  Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.

  Explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

  Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est.
  ::
::

### Bottom Fader

::code-preview
  ::div{class="relative overflow-y-auto border border-default rounded-lg" style="height: 300px; width: 100%; max-width: 500px;"}
  ::div{class="p-4 *:my-0"}
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.

  Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.

  Explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores.
  ::
  :fader{side="bottom" height="100"}
::

### Both Top & Bottom

::code-preview
  ::div{class="relative overflow-y-auto border border-default rounded-lg" style="height: 300px; width: 100%; max-width: 500px;"}
  :fader{side="top" height="100"}
  ::div{class="p-4 *:my-0"}
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.

  Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.

  Explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

  Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui dolorem.
  ::
  :fader{side="bottom" height="100"}
::

## Smart Scroll Example

::code-preview
  :smart-fader-example
::

## Component Code

::code-collapse{class="[&>div>pre]:rounded-t-none [&>div]:my-0"}
```vue [Fader.vue]
<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface Props {
  stop?: string
  blur?: string
  height?: number
  side: 'top' | 'bottom'
  style?: CSSProperties
}

const props = withDefaults(defineProps<Props>(), {
  stop: '25%',
  blur: '1px',
  height: 150,
})
</script>

<template>
  <div
    aria-hidden="true"
    class="fader"
    :data-side="props.side"
    :style="{
      '--stop': props.stop,
      '--blur': props.blur,
      '--height': `${props.height}px`,
      ...props.style
    }"
  />
</template>

<style scoped>
.fader {
  position: sticky;
  width: 100%;
  height: var(--height);
  pointer-events: none;
  user-select: none;
  backdrop-filter: blur(var(--blur));
  z-index: 10;
}

.fader[data-side="top"] {
  top: 0;
  background: linear-gradient(to top, transparent, var(--ui-bg));
  mask-image: linear-gradient(to bottom, var(--ui-bg) var(--stop), transparent);
  margin-bottom: calc(var(--height) * -1);
}

.fader[data-side="bottom"] {
  bottom: 0;
  background: linear-gradient(to bottom, transparent, var(--ui-bg));
  mask-image: linear-gradient(to top, var(--ui-bg) var(--stop), transparent);
  margin-top: calc(var(--height) * -1);
}
</style>
```
::

## Smart Scroll Example

::code-collapse{class="[&>div>pre]:rounded-t-none [&>div]:my-0"}
```vue [SmartFaderExample.vue]
<script setup lang="ts">
import { ref } from 'vue'

const topFaderOpacity = ref(0)
const bottomFaderOpacity = ref(1)

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  
  // Top fader: appears progressively as we scroll down
  topFaderOpacity.value = clamp(scrollTop / 100, 0, 1)
  
  // Bottom fader: disappears progressively as we approach the bottom
  const distanceFromBottom = scrollHeight - clientHeight - scrollTop
  bottomFaderOpacity.value = clamp(distanceFromBottom / 100, 0, 1)
}
</script>

<template>
  <div 
    class="relative overflow-y-auto border border-default rounded-lg"
    style="height: 300px; width: 100%; max-width: 500px;"
    @scroll="handleScroll"
  >
    <Fader 
      side="top" 
      :height="100" 
      :style="{ opacity: topFaderOpacity }"
    />
    
    <div class="p-4 *:my-0">
      <!-- Long content with multiple paragraphs -->
    </div>
    
    <Fader 
      side="bottom" 
      :height="100" 
      :style="{ opacity: bottomFaderOpacity }"
    />
  </div>
</template>
```
::

## Usage Examples

### Basic Usage
```vue
<template>
  <div class="relative overflow-y-auto h-64">
    <Fader side="top" />
    <div class="p-4">
      Your scrollable content
    </div>
  </div>
</template>
```

### Multiple Faders
```vue
<template>
  <div class="relative overflow-y-auto h-64">
    <Fader side="top" height="60" />
    <div class="p-4">
      Content with faders on both ends
    </div>
    <Fader side="bottom" height="60" />
  </div>
</template>
```



## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'top' \| 'bottom'` | **Required** | Position of the fader |
| `stop` | `string` | `'25%'` | Gradient stop point for the fade effect |
| `blur` | `string` | `'1px'` | Backdrop blur intensity |
| `height` | `number` | `150` | Height of the fader in pixels |
| `style` | `CSSProperties` | `undefined` | Additional CSS styles |

## How It Works

The Fader component uses CSS gradients and masks to create a smooth fade effect that indicates hidden content.

### Core CSS Implementation
- **Gradient Effects**: Uses `linear-gradient` for background and `mask-image` for fade transitions
- **Sticky Positioning**: `position: sticky` keeps faders fixed to their designated side during scroll
- **No Layout Impact**: Negative margins prevent the fader from taking up layout space
- **Hardware Acceleration**: Uses `backdrop-filter` and CSS transforms for optimal performance

### JavaScript Integration (Optional)
- **Basic Usage**: No JavaScript required - just place the component and it works
- **Advanced Usage**: Can be combined with scroll listeners for dynamic opacity control
- **Smart Behavior**: Scroll detection allows progressive opacity changes based on scroll position

Key benefits:
- **Lightweight**: Minimal CSS-based implementation 
- **Flexible**: Works standalone or with JavaScript enhancements
- **Performant**: Uses hardware-accelerated CSS properties
- **Accessible**: No interference with scroll behavior or content layout