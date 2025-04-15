---
title: Text Bloom Effect
description: Create a bloom effect on a text to simulate thinking or loading.
date: 2025-04-16
---

# Text Bloom Effect

This effect creates a bloom animation on text, simulating a "thinking" or "loading" state. The text appears to bloom and fade in, giving a dynamic and engaging visual effect.

::code-preview
:text-bloom

#code

:::code-collapse{class="[&>div>pre]:rounded-t-none [&>div]:my-0"}
```vue [TextBloom.vue]
<script setup lang="ts">
  const props = withDefaults(defineProps<{
    bloomColor?: string
    textColor?: string
    class?: string
  }>(), {
    bloomColor: '#fff',
    textColor: 'text-(--ui-text-muted)',
    class: 'text-base font-semibold'
  })

  const bloomTextEl = ref(null)

  const calculateBloomColors = (baseColor: string) => {
    if (!baseColor) return null

    const lighten = (hex: string, amount: number) => {
      let r = parseInt(hex.slice(1, 3), 16)
      let g = parseInt(hex.slice(3, 5), 16)
      let b = parseInt(hex.slice(5, 7), 16)

      r = Math.min(255, r + Math.floor((255 - r) * amount))
      g = Math.min(255, g + Math.floor((255 - g) * amount))
      b = Math.min(255, b + Math.floor((255 - b) * amount))

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    return {
      base: baseColor,
      light: lighten(baseColor, 0.60),
      medium: lighten(baseColor, 0.3),
      dark: lighten(baseColor, 0.1)
    }
  }

  const applyBloomEffect = (el: HTMLElement | null) => {
    if (!el) return

    const text = el.textContent || ''
    el.innerHTML = ''

    if (props.bloomColor) {
      const colors = calculateBloomColors(props.bloomColor)
      if (colors) {
        el.style.setProperty('--bloom-color-base', colors.base)
        el.style.setProperty('--bloom-color-light', colors.light)
        el.style.setProperty('--bloom-color-medium', colors.medium)
        el.style.setProperty('--bloom-color-dark', colors.dark)
      }
    }

    Array.from(text).forEach((char, i) => {
      const span = document.createElement('span')
      span.className = 'bloom-char'
      span.style.setProperty('--i', i.toString())

      if (char === ' ') {
        span.innerHTML = '&nbsp;'
      } else {
        span.textContent = char
      }

      el.appendChild(span)
    })
  }

  onMounted(() => {
    applyBloomEffect(bloomTextEl.value)
  })

  watch(() => props.bloomColor, () => {
    applyBloomEffect(bloomTextEl.value)
  })
</script>

<template>
  <div ref="bloomTextEl" class="[transform-style:preserve-3d]" :data-color="bloomColor" :class="[props.class, props.textColor]">
    <slot>Generating summary...</slot>
  </div>
</template>

<style>
  @reference '../../assets/style/main.css';

  .bloom-char {
    @apply relative inline-block [transform-style:preserve-3d] [transform-origin:100%_50%] [letter-spacing:0.01em];
    transition: all 0.3s ease;
    animation: var(--animate-bloom);
    animation-delay: calc(var(--i, 0) * 0.05s);
  }

  @keyframes bloom {
    0% {
      transform: translate3D(0,0,0) scale(1) rotateY(0);
      color: var(--bloom-color-base);
      text-shadow: 0 0 0 rgba(var(--bloom-color-base), 0);
    }
    12% {
      transform: translate3D(2px,-1px,2px) scale(1.3) rotateY(6deg);
      color: var(--bloom-color-light);
    }
    15% {
      text-shadow: 0 0 1px var(--bloom-color-medium);
    }
    24% {
      transform: translate3D(0,0,0) scale(1) rotateY(0);
      color: var(--bloom-color-dark);
      opacity: 1;
    }
    36% {
      transform: translate3D(0,0,0) scale(1);
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
</style>
```
:::
::

## Usage

You can pass the `bloomColor` and `textColor` props to customize the colors of the bloom effect and the text. The default text color is set to `text-(--ui-text-muted)`.

::code-preview

::text-bloom
---
textColor: 'text-[#46afc8]'
bloomColor: '#78d8f3'
class: 'text-2xl font-bold'
---
I am thinking...
::

#code

```vue
<TextBloom bloomColor="#78d8f3" textColor="text-[#46afc8]" class="text-2xl font-bold">
  I am thinking...
</TextBloom>
```
::
