<script setup lang="ts">
import { motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const { item, priority = false, shared = true } = defineProps<{
  item: ThingItem
  priority?: boolean
  shared?: boolean
}>()

const { spring } = useThingMotion()
</script>

<template>
  <motion.div
    :layout-id="shared ? `thing-${item.slug}` : undefined"
    :transition="spring"
    :initial="false"
    class="cutout"
  >
    <img
      :src="item.image"
      :alt="item.name"
      class="object"
      :fetchpriority="priority ? 'high' : 'auto'"
      draggable="false"
      decoding="async"
    >
  </motion.div>
</template>

<style scoped>
.cutout {
  display: flex;
  max-width: 100%;
  align-items: center;
  justify-content: center;
}
.object {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  object-position: center;
  user-select: none;
  pointer-events: none;
}
</style>
