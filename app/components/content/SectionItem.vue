<script setup lang="ts">
type SectionItemProps = {
  title: string
  description?: string
  number: number
  size?: string
}

const { size = 'max-w-[600px]' } = defineProps<SectionItemProps>()
</script>

<template>
  <Motion layout class="flex flex-col" data-animate :style="{ '--stagger': number, '--delay': `${number * 0.05}s` }">
    <h2 class="relative w-fit font-serif text-2xl sm:text-3xl italic">
      {{ title }}<span class="text-primary">.</span>
      <span class="absolute -bottom-0.5 -right-5 font-serif text-5xl italic opacity-[9%] sm:text-6xl">
        {{ number }}
      </span>
    </h2>
    <p v-if="description" class="text-pretty font-light text-muted italic text-sm">
      {{ description }}
    </p>
    <div :class="size" class="text-pretty font-light mt-2">
      <slot />
    </div>
  </Motion>
</template>


