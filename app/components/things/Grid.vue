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
    class="wide pieces"
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
.wide {
  width: calc(100% + 48px);
  margin-inline: -24px;
}
@media (min-width: 1024px) {
  .wide {
    width: var(--sheet-width);
    margin-left: calc(-1 * (var(--sheet-index) + var(--sheet-gutter)));
    margin-right: 0;
  }
}

.pieces {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: 88px 64px;
  padding: 40px 8px 80px;
}
.pieces :deep(.piece) {
  flex: 1 1 300px;
  max-width: 460px;
  transition: opacity 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}

.pieces:hover :deep(.piece),
.pieces:has(:deep(.piece:focus-within)) :deep(.piece) {
  opacity: 0.28;
}
.pieces:hover :deep(.piece:hover),
.pieces:has(:deep(.piece:focus-within)) :deep(.piece:focus-within) {
  opacity: 1;
}

@media (max-width: 639px) {
  .pieces {
    gap: 56px 24px;
    padding-inline: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pieces :deep(.piece) {
    transition: none;
  }
}
</style>
