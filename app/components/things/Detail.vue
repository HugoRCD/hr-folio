<script setup lang="ts">
import { motion } from 'motion-v'
import { ROOM_LABEL, type ThingItem } from '~/utils/things'

const { item, items, spring } = defineProps<{
  item: ThingItem
  items: ThingItem[]
  spring: Record<string, unknown>
}>()

const nearby = computed(() => neighbours(items, item.slug))
const href = computed(() => thingHref(item))
const number = computed(() => {
  const i = items.findIndex(t => t.slug === item.slug)
  return String((i >= 0 ? i : 0) + 1).padStart(2, '0')
})

const fields = computed(() => {
  const rows: Array<[string, string]> = [
    ['Brand', item.brand],
    ['Room', ROOM_LABEL[item.room]],
    ['Category', item.category],
    ['Material', item.material ?? ''],
    ['Colour', item.color ?? ''],
    ['Size', item.size ?? ''],
    ['Acquired', acquiredYear(item.acquired) ?? item.acquired ?? ''],
    ['Price', formatPrice(item.price)],
  ]
  return rows.filter(([, value]) => value)
})
</script>

<template>
  <motion.article
    :initial="false"
    :transition="spring"
    class="relative"
  >
    <div class="section-mark in-index flex items-baseline gap-3">
      <span class="numeral" aria-hidden="true">{{ number }}</span>
      <NuxtLink to="/things" class="label">
        Things
      </NuxtLink>
      <span class="rule" aria-hidden="true" />
    </div>

    <aside class="in-note sheet">
      <p class="key">
        Specification
      </p>
      <dl>
        <div v-for="[label, value] in fields" :key="label" class="row">
          <dt>{{ label }}</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
      <a
        v-if="href"
        :href
        target="_blank"
        rel="noopener noreferrer"
        class="out"
      >
        {{ item.brand }}
      </a>
      <p v-if="nearby.length" class="key also">
        Also
      </p>
      <ul v-if="nearby.length" class="near">
        <li v-for="n in nearby" :key="n.slug">
          <NuxtLink :to="thingPath(n)">
            {{ n.name }}
          </NuxtLink>
        </li>
      </ul>
    </aside>

    <motion.div
      :layout-id="`thing-${item.slug}`"
      :transition="spring"
      :initial="false"
      class="breakout figure"
    >
      <img
        :src="item.image"
        :alt="item.name"
        class="object"
        :class="{ ink: item.image.endsWith('.svg') }"
        data-construct="figure"
        draggable="false"
        decoding="async"
      >
    </motion.div>

    <h1 class="title">
      {{ item.name }}
    </h1>
    <p v-if="item.note" class="note">
      {{ item.note }}
    </p>
    <p class="affiliate">
      Some links are affiliate links.
    </p>
  </motion.article>
</template>

<style scoped>
.section-mark {
  margin-bottom: 12px;
  line-height: 24px;
}
@media (min-width: 1024px) {
  .section-mark {
    top: 9px;
    margin: 0;
  }
}
.numeral {
  width: 28px;
  flex: none;
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 15px;
  color: var(--ui-primary);
  user-select: none;
}
.label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  font-weight: 400;
  text-decoration: none;
  border: 0;
  box-shadow: none;
}
.label:hover {
  color: var(--ui-text-highlighted);
}
.rule {
  flex: 1;
  height: 1px;
  align-self: center;
  background: color-mix(in oklab, var(--ui-text) 12%, transparent);
}

.figure {
  display: flex;
  min-height: 280px;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  color: var(--ui-text-highlighted);
}
.figure img {
  display: block;
  max-width: min(100%, 420px);
  height: 380px;
  width: auto;
  object-fit: contain;
  object-position: center;
  user-select: none;
}
.dark .object.ink {
  filter: invert(1);
}

.title {
  margin: 0 0 12px;
  font-family: var(--font-redaction);
  font-size: 32px;
  font-weight: 400;
  line-height: 40px;
  color: var(--ui-text-highlighted);
  text-wrap: balance;
}
.note {
  max-width: 528px;
  margin: 0;
  font-size: 16px;
  line-height: 28px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
.affiliate {
  margin: 48px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.04em;
  color: var(--ui-text-dimmed);
}

.sheet {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 24px;
  margin-bottom: 28px;
}
.key {
  margin: 0 0 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.key.also {
  margin-top: 20px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 12%, transparent);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
}
.row dt {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.row dd {
  margin: 0;
  max-width: 58%;
  text-align: right;
  color: var(--ui-text-muted);
  font-variant-numeric: tabular-nums;
}
.out {
  align-self: flex-start;
  margin-top: 12px;
  font-size: 14px;
  color: var(--ui-text-highlighted);
  text-decoration: none;
  border-bottom: 1px solid var(--ui-primary);
}
.out:hover {
  color: var(--ui-primary);
}
.near {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.near a {
  display: block;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-text-toned);
  text-decoration: none;
  border: 0;
  box-shadow: none;
  text-wrap: pretty;
}
.near a:hover {
  color: var(--ui-text-highlighted);
  text-decoration: underline;
  text-decoration-color: var(--ui-primary);
  text-underline-offset: 3px;
}

@media (min-width: 1024px) {
  .sheet {
    top: 8px;
    margin-top: 0;
    margin-bottom: 0;
  }
}
</style>
