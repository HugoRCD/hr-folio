<script setup lang="ts">
defineProps<{
  author?: string
}>()
</script>

<template>
  <div class="my-6 border-l-2 border-primary/40 pl-5">
    <div class="font-serif text-lg/7 italic text-highlighted">
      <slot />
    </div>
    <span v-if="author" class="mt-2 block text-sm text-muted/60">— {{ author }}</span>
  </div>
</template>
