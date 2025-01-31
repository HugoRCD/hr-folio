<script setup lang="ts">
const { size = '12px', align } = defineProps<{
  name: string
  class?: any
  size?: string
  align?: boolean
}>()
</script>

<template>
  <Icon :name :size class="text-font-primary" :class="[align ? 'icon' : '']" />
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: sub;
}
</style>
