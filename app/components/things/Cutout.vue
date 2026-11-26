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
      :alt="thingAlt(item)"
      class="object"
      :fetchpriority="priority ? 'high' : 'auto'"
      :loading="priority ? 'eager' : 'lazy'"
      draggable="false"
      decoding="async"
    >
  </motion.div>
</template>

<style scoped>
.cutout {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  align-items: center;
  justify-content: center;
}
.object {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center bottom;
  user-select: none;
  pointer-events: none;
}
</style>
