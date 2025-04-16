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
  label?: string
  textColor?: string
  bloomColor?: string
  bloomIntensity?: number
  class?: string
}>(), {
  label: 'Generating summary...',
  textColor: 'text-(--ui-text-muted)',
  bloomColor: '#ffffff',
  bloomIntensity: 1.18,
  class: 'font-semibold',
})

const textBloomRef = ref<HTMLElement | null>(null)
const contentHolderRef = ref<HTMLElement | null>(null)
const animatedTextRef = ref<HTMLElement | null>(null)

const rootStyles = computed(() => ({
  '--text-color': props.textColor,
  '--bloom-color': props.bloomColor,
  '--bloom-intensity': props.bloomIntensity
}))

const updateAnimation = (): void => {
  const contentHolder = contentHolderRef.value
  const animatedText = animatedTextRef.value

  if (contentHolder && animatedText) {
    const text = contentHolder.textContent?.trim() || props.label || ''

    animatedText.innerHTML = ''

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span')
      span.className = 'text-bloom-character'

      if (text[i] === ' ') {
        span.innerHTML = '&nbsp;'
      } else {
        span.textContent = text[i] || ''
      }

      span.style.animationDelay = `${i * 0.05}s`
      animatedText.appendChild(span)
    }
  }
}

watch(() => props.label, () => {
  nextTick(updateAnimation)
})

onMounted(updateAnimation)
onUpdated(updateAnimation)
</script>

<template>
  <div ref="textBloomRef" :style="rootStyles" class="text-bloom-container" :class="[props.class, props.textColor]">
    <div ref="contentHolderRef" class="hidden">
      <slot>{{ label }}</slot>
    </div>
    <div ref="animatedTextRef" />
  </div>
</template>

<style>
.text-bloom-container {
  perspective: 80px;
  transform-style: preserve-3d;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizelegibility;
}

.text-bloom-character {
  position: relative;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  display: inline-block;
  animation: bloom 2.4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
  letter-spacing: 0.01em;
  transform-origin: 100% 50%;
  transform-style: preserve-3d;
  will-change: transform, color;
}

@keyframes bloom {
  0% {
    transform: translate3D(0,0,0) scale(1) rotateY(0);
    color: var(--text-color, #46afc8);
    text-shadow: 0 0 0 rgba(0,0,0,0);
  }
  12% {
    transform: translate3D(2px,-1px,2px) scale(var(--bloom-intensity, 1.18)) rotateY(6deg);
    color: var(--bloom-color, #ffffff);
  }
  15% {
    text-shadow: 0 0 1px var(--bloom-color, #ffffff);
  }
  24% {
    transform: translate3D(0,0,0) scale(1) rotateY(0);
    color: var(--text-color, #46afc8);
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

## Props

The TextBloom component accepts the following props:

::field-group
  ::field{name="label" type="string"}
  Default to `Generating summary...` - The default text to display when no content is provided in the slot. This text will be animated with the bloom effect.
  ::

  ::field{name="textColor" type="string"}
  Default to `text-(--ui-text-muted)` - The color of the text in its normal state. You can use any valid CSS color value or Tailwind CSS class.
  ::

  ::field{name="bloomColor" type="string"}
  Default to `#ffffff` - The color that the text will bloom to during the animation. This should be a valid hex color code.
  ::

  ::field{name="bloomIntensity" type="number"}
  Default to `1.18` - Controls the intensity of the bloom effect. Higher values create a more pronounced bloom effect.
  ::

  ::field{name="class" type="string"}
  Default to `font-semibold` - Additional CSS classes to apply to the component. This allows for customizing the appearance beyond the built-in props.
  ::
::

## Usage

You can combine multiple props to customize the appearance of the TextBloom component:

:::code-preview

:::text-bloom
---
textColor: 'text-[#46afc8]'
bloomColor: '#78d8f3'
class: 'text-2xl font-bold'
---
I am thinking...
:::

#code

```vue
<TextBloom bloomColor="#78d8f3" textColor="text-[#46afc8]" class="text-2xl font-bold">
  I am thinking...
</TextBloom>
```
:::
