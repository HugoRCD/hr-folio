<script setup lang="ts">
import { motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const { item, index, spring } = defineProps<{
  item: ThingItem
  index: number
  spring: Record<string, unknown>
}>()

const { reduced } = useThingMotion()
const route = useRoute()
const lift = computed(() => reduced.value ? false : { y: -6, scale: 1.03 })

function thingTo() {
  return { path: thingPath(item), query: route.query }
}
</script>

<template>
  <motion.article
    layout="position"
    class="piece"
    :transition="spring"
    :initial="false"
    :exit="{ opacity: 0, transition: { duration: reduced ? 0 : 0.18 } }"
  >
    <NuxtLink :to="thingTo()" class="hit">
      <motion.div
        class="frame"
        :while-hover="lift"
        :transition="spring"
      >
        <div class="slot">
          <ThingsCutout :item :priority="index < 8" />
        </div>
      </motion.div>
      <p class="caption">
        <span class="name">{{ item.name }}</span>
        <span class="brand">{{ item.brand }}</span>
        <span class="price">{{ formatPrice(item.price) }}</span>
      </p>
    </NuxtLink>
  </motion.article>
</template>

<style scoped>
.piece {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.hit {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  text-decoration: none;
  color: inherit;
  border: 0;
  box-shadow: none;
}
.hit:focus-visible {
  box-shadow: none;
}
.frame {
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  height: 0;
  padding-bottom: 125%;
  transform-origin: center center;
}
.slot {
  position: absolute;
  inset: 8%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
}
.frame :deep(.object) {
  filter: drop-shadow(0 1px 0 rgb(17 17 17 / 0));
  transition: filter 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}
.piece:hover .frame :deep(.object),
.piece:focus-within .frame :deep(.object) {
  filter: drop-shadow(0 18px 22px rgb(17 17 17 / 0.12));
}
.caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding-inline: 8px;
  text-align: center;
}
.name {
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-text-highlighted);
  text-wrap: balance;
}
.brand {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.price {
  margin-top: 4px;
  font-family: var(--font-redaction);
  font-size: 16px;
  line-height: 22px;
  color: #111111;
  font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) {
  .frame :deep(.object) {
    transition: none;
  }
}
</style>
