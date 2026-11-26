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
    layout
    class="breakout pieces"
    :transition="spring"
    :initial="false"
  >
    <AnimatePresence :initial="false" mode="popLayout">
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
.pieces {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px 32px;
  align-items: end;
}

/* a piece in hand stays, its neighbours step back */
.pieces:hover :deep(.piece),
.pieces:has(:deep(.piece:focus-within)) :deep(.piece) {
  opacity: 0.34;
}
.pieces:hover :deep(.piece:hover),
.pieces:has(:deep(.piece:focus-within)) :deep(.piece:focus-within) {
  opacity: 1;
}
.pieces :deep(.piece) {
  transition: opacity 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}

@media (max-width: 639px) {
  .pieces {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pieces :deep(.piece) {
    transition: none;
  }
}
</style>
