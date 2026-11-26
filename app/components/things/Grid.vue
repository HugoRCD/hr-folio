<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const { items, spring } = defineProps<{
  items: ThingItem[]
  spring: Record<string, unknown>
}>()
</script>

<template>
  <motion.div
    class="gallery"
    :transition="spring"
    :initial="false"
  >
    <AnimatePresence :initial="false">
      <ThingsPiece
        v-for="(item, index) in items"
        :key="item.slug"
        :item
        :index
        :spring
      />
    </AnimatePresence>
  </motion.div>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px 20px;
  align-items: stretch;
}

.gallery:hover :deep(.piece),
.gallery:has(:deep(.piece:focus-within)) :deep(.piece) {
  opacity: 0.42;
}
.gallery:hover :deep(.piece:hover),
.gallery:has(:deep(.piece:focus-within)) :deep(.piece:focus-within) {
  opacity: 1;
}
.gallery :deep(.piece) {
  transition: opacity 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}

@media (min-width: 768px) {
  .gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 56px 28px;
  }
}
@media (min-width: 1024px) {
  .gallery {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 72px 36px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .gallery :deep(.piece) {
    transition: none;
  }
}
</style>
