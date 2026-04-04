---
title: Progressive Blur
description: Create a bloom effect on a text to simulate thinking or loading.
date: 2025-04-16
draft: true
---

# Progressive Blur

::code-preview
::div{class="relative overflow-y-auto" style="height: 200px;"}
:blur
Officia proident in eu pariatur ad fugiat dolor laboris non duis quis. Commodo adipisicing labore nisi Lorem voluptate mollit cillum deserunt voluptate ea ullamco aliquip enim. Ullamco id nisi veniam nostrud ad exercitation aute adipisicing amet adipisicing incididunt Lorem est nulla. Qui aliquip cillum incididunt mollit dolore ex officia consectetur et non pariatur. Fugiat tempor tempor dolore in deserunt ad velit elit quis.

Officia proident in eu pariatur ad fugiat dolor laboris non duis quis. Commodo adipisicing labore nisi Lorem voluptate mollit cillum deserunt voluptate ea ullamco aliquip enim. Ullamco id nisi veniam nostrud ad exercitation aute adipisicing amet adipisicing incididunt Lorem est nulla. Qui aliquip cillum incididunt mollit dolore ex officia consectetur et non pariatur. Fugiat tempor tempor dolore in deserunt ad velit elit quis.

Officia proident in eu pariatur ad fugiat dolor laboris non duis quis. Commodo adipisicing labore nisi Lorem voluptate mollit cillum deserunt voluptate ea ullamco aliquip enim. Ullamco id nisi veniam nostrud ad exercitation aute adipisicing amet adipisicing incididunt Lorem est nulla. Qui aliquip cillum incididunt mollit dolore ex officia consectetur et non pariatur. Fugiat tempor tempor dolore in deserunt ad velit elit quis.
::

#code
:::code-collapse{class="[&>div>pre]:rounded-t-none [&>div]:my-0"}
```vue [Blur.vue]
<script setup lang="ts">
  const { position = 'top', size = 75 } = defineProps<{
    position: 'top' | 'bottom' | 'both'
    size?: number
  }>()

  const blurLevels = [1, 2, 3, 6, 12]
  const bottomOpacity = ref(1)

  const positions = {
    top: {
      class: 'top-0',
      gradient: 'gradient-mask-b-0'
    },
    bottom: {
      class: 'bottom-0',
      gradient: 'gradient-mask-t-0'
    }
  }

  const updateBottomOpacity = () => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY

    const distanceToBottom = documentHeight - (scrollTop + windowHeight)

    const transitionZone = 200

    if (distanceToBottom <= transitionZone) {
      bottomOpacity.value = distanceToBottom / transitionZone
    } else {
      bottomOpacity.value = 1
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', updateBottomOpacity)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateBottomOpacity)
  })
</script>

<template>
  <div class="pointer-events-none">
    <template v-for="pos in ['top', 'bottom']" :key="pos">
      <div
        v-if="position === pos || position === 'both'"
        :class="`fixed inset-x-0 ${positions[pos].class} isolate h-24`"
        :style="{ height: `${size}px` }"
      >
        <div
          v-for="blur in blurLevels"
          :key="blur"
          :style="{
            '-webkit-backdrop-filter': `blur(${blur}px)`,
            'backdrop-filter': `blur(${blur}px)`,
            opacity: pos === 'bottom' ? bottomOpacity : 1
          }"
          :class="[
            'absolute inset-0',
            positions[pos].gradient,
            `blur-[${blur}px]`
          ]"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
  .gradient-mask-b-0 {
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, transparent 100%);
  }

  .gradient-mask-t-0 {
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, transparent 100%);
  }
</style>
```
:::
::

## Props
