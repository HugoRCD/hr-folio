<script setup lang="ts">
import { motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const { item, index, spring } = defineProps<{
  item: ThingItem
  index: number
  spring: Record<string, unknown>
}>()

const { reduced } = useThingMotion()
const href = computed(() => thingHref(item))
const number = computed(() => String(index + 1).padStart(2, '0'))
</script>

<template>
  <motion.article
    layout
    class="piece"
    :transition="spring"
    :initial="false"
    :exit="{ opacity: 0 }"
    :while-hover="reduced ? undefined : { y: -10 }"
  >
    <NuxtLink :to="thingPath(item)" class="hit">
      <span class="numeral" aria-hidden="true">{{ number }}</span>
      <ThingsCutout :item :priority="index < 2" class="photo" />
      <p class="caption">
        <span class="name">{{ item.name }}</span>
        <span class="meta">
          <ThingsPrice :price="item.price" />
        </span>
      </p>
    </NuxtLink>
    <a
      v-if="href"
      :href
      class="shop"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ item.brand }}
    </a>
  </motion.article>
</template>

<style scoped>
.piece {
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 12px 8px;
}
.hit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  text-decoration: none;
  color: inherit;
  border: 0;
  box-shadow: none;
}
.hit:focus-visible {
  box-shadow: none;
}
.numeral {
  position: absolute;
  top: 0;
  left: 12px;
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 13px;
  color: var(--ui-primary);
  user-select: none;
}
.photo {
  width: 100%;
}
.photo :deep(.object) {
  max-height: min(52vh, 480px);
  margin-inline: auto;
}
.caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0;
  text-align: center;
}
.name {
  font-size: 15px;
  line-height: 22px;
  color: var(--ui-text-highlighted);
  text-wrap: balance;
}
.meta {
  font-family: var(--font-redaction);
  font-size: 16px;
  line-height: 22px;
  color: var(--ui-text-muted);
  font-variant-numeric: tabular-nums;
}
.shop {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  text-decoration: none;
  border: 0;
  box-shadow: none;
  border-bottom: 1px solid var(--ui-primary);
}
.shop:hover {
  color: var(--ui-primary);
}
</style>
