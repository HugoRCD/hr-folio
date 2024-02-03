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
});
</script>

<template>
  <div
    class="flex flex-col gap-2"
    data-animate
    :style="{ '--stagger': number, '--delay': `${number * 0.05}s` }"
  >
    <div class="relative w-fit">
      <h2>
        {{ title }}
      </h2>
      <div class="absolute -bottom-0.5 -right-5 font-newsreader text-5xl italic opacity-[9%] sm:text-6xl">
        {{ number }}
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
