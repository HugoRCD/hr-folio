<script setup lang="ts">
const props = defineProps<{
  name: string
  class?: any
}>()
</script>

<template>
  <MIcon :name size="12px" class="text-font-primary" :class="props.class" />
</template>
