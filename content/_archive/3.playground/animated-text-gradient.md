---
title: Animated Text Gradient
description: A simple animated text gradient using Tailwind CSS.
date: 2025-04-18
---

# Animated Text Gradient

This component creates a text with an animated gradient effect. The gradient smoothly moves across the text, creating a dynamic and eye-catching visual effect that can be customized with different colors and animation speeds.

:::code-preview
:animated-text-gradient

#code
::::code-collapse{class="[&>div>pre]:rounded-t-none [&>div]:my-0"}
```vue [AnimatedTextGradient.vue]
<script setup lang="ts">
const props = withDefaults(defineProps<{
  text?: string
  gradient?: string
  class?: string
  speed?: number
}>(), {
  text: 'This is a text',
  gradient: 'bg-radial from-pink-400 to-sky-500',
  class: 'font-semibold',
  speed: 1.5
})

const styleVars = {
  '--animated-speed': `${props.speed}s`
}
</script>

<template>
  <span
    :class="[
      'inline-block bg-clip-text text-transparent animate-gradient',
      gradient,
      props.class
    ]"
    :style="styleVars"
  >
    <slot>{{ text }}</slot>
  </span>
</template>

<style scoped>
.animate-gradient {
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: animatedTextGradient-to-right var(--animated-speed) linear infinite;
}
@keyframes animatedTextGradient-to-right {
  to {
    background-position: 200% center;
  }
}
</style>
```
::::
:::

## Props

The AnimatedTextGradient component accepts the following props:

:::field-group
  ::field{name="text" type="string"}
  Default to `This is a text` - The default text to display when no content is provided in the slot.
  ::

  ::field{name="gradient" type="string"}
  Default to `bg-radial from-pink-400 to-sky-500` - The gradient to apply to the text. You can use any valid Tailwind CSS gradient classes.
  ::

  ::field{name="speed" type="number"}
  Default to `1.5` - Controls the speed of the gradient animation in seconds. Lower values create faster animations.
  ::

  ::field{name="class" type="string"}
  Default to `font-semibold` - Additional CSS classes to apply to the component. This allows for customizing the appearance beyond the built-in props.
  ::
:::

## Usage

You can combine multiple props to customize the appearance of the AnimatedTextGradient component:

::code-preview
:::animated-text-gradient
---
text: "Customized gradient text"
gradient: "bg-gradient-to-r from-blue-500 to-cyan-500"
class: "text-2xl font-bold"
---
:::

#code
```vue
<AnimatedTextGradient 
  text="Customized gradient text"
  gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
  class="text-2xl font-bold"
/>
```
::
