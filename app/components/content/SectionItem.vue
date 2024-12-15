<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    default: 'max-w-[600px]'
  }
})
</script>

<template>
  <div
    class="flex flex-col gap-2"
    data-animate
    :style="{ '--stagger': number, '--delay': `${number * 0.05}s` }"
  >
    <div class="relative w-fit">
      <h2 class="font-newsreader text-2xl sm:text-3xl italic text-secondary">
        {{ title }}<span class="text-accent">.</span>
      </h2>
      <div class="absolute -bottom-0.5 -right-5 font-newsreader text-5xl italic opacity-[9%] sm:text-6xl">
        {{ number }}
      </div>
    </div>
    <div :class="size" class="text-pretty text-tertiary text-sm font-extralight sm:text-base">
      <slot />
    </div>
  </div>
</template>


