<script setup lang="ts">
type SectionItemProps = {
  title: string
  number: number
  size?: string
}

const { size = 'max-w-[600px]' } = defineProps<SectionItemProps>()
</script>

<template>
  <div class="flex flex-col gap-2" data-animate :style="{ '--stagger': number, '--delay': `${number * 0.05}s` }">
    <h2 class="relative w-fit font-newsreader text-2xl sm:text-3xl italic text-secondary">
      {{ title }}<span class="text-accent">.</span>
      <span class="absolute -bottom-0.5 -right-5 font-newsreader text-5xl italic opacity-[9%] sm:text-6xl">
        {{ number }}
      </span>
    </h2>
    <div :class="size" class="text-pretty text-tertiary font-light">
      <slot />
    </div>
  </div>
</template>


