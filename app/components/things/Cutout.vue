<script setup lang="ts">
import type { ThingItem } from '~/utils/things'

const { item, priority = false, vt = '' } = defineProps<{
  item: ThingItem
  priority?: boolean
  vt?: string
}>()
</script>

<template>
  <span class="cut">
    <img
      :src="item.image"
      :alt="thingAlt(item)"
      class="object"
      :style="vt ? { viewTransitionName: vt } : undefined"
      :fetchpriority="priority ? 'high' : 'auto'"
      :loading="priority ? 'eager' : 'lazy'"
      draggable="false"
      :decoding="priority ? 'sync' : 'async'"
    >
  </span>
</template>

<style scoped>
.cut {
  display: grid;
  place-items: stretch;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
.object {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  object-fit: contain;
  object-position: center;
  user-select: none;
  pointer-events: none;
}
</style>
