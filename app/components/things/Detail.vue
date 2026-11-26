<script setup lang="ts">
import { motion } from 'motion-v'
import { CATEGORY_LABEL, type ThingItem } from '~/utils/things'

const { item, items, spring } = defineProps<{
  item: ThingItem
  items: ThingItem[]
  spring: Record<string, unknown>
}>()

const route = useRoute()
const nearby = computed(() => adjacent(items, item.slug))
const href = computed(() => thingHref(item))
const number = computed(() => {
  const i = items.findIndex(t => t.slug === item.slug)
  return String((i >= 0 ? i : 0) + 1).padStart(2, '0')
})
const acquired = computed(() => formatAcquired(item.acquired))

const fields = computed(() => {
  const rows: Array<[string, string]> = [
    ['Brand', item.brand],
    ['Use', CATEGORY_LABEL[item.category]],
    ['Material', item.material ?? ''],
    ['Colour', item.color ?? ''],
    ['Size', item.size ?? ''],
    ['Acquired', acquired.value ?? ''],
  ]
  return rows.filter(([, value]) => value)
})

function thingTo(target: ThingItem) {
  return { path: thingPath(target), query: route.query }
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (document.querySelector('[role="dialog"]')) return
  if (e.key === 'ArrowRight' && nearby.value.next) {
    navigateTo(thingTo(nearby.value.next))
  } else if (e.key === 'ArrowLeft' && nearby.value.prev) {
    navigateTo(thingTo(nearby.value.prev))
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <motion.article
    :initial="false"
    :transition="spring"
    class="relative"
  >
    <div class="section-mark in-index flex items-baseline gap-3">
      <span class="numeral" aria-hidden="true">{{ number }}</span>
      <NuxtLink :to="{ path: '/things', query: route.query }" class="label">
        Things
      </NuxtLink>
      <span class="rule" aria-hidden="true" />
    </div>

    <div class="wide figure">
      <ThingsCutout :item priority />
    </div>

    <h1 class="title">
      {{ item.name }}
    </h1>
    <p class="brand">
      {{ item.brand }}
    </p>
    <p class="price">
      <ThingsPrice :price="item.price" />
    </p>
    <p class="links">
      <a
        v-if="href"
        :href
        target="_blank"
        rel="noopener noreferrer"
        class="shop"
      >
        {{ item.brand }}
      </a>
    </p>
    <p v-if="item.note" class="note">
      {{ item.note }}
    </p>
    <dl class="sheet">
      <div v-for="[label, value] in fields" :key="label" class="row">
        <dt>{{ label }}</dt>
        <dd>{{ value }}</dd>
      </div>
    </dl>

    <nav v-if="nearby.prev || nearby.next" class="pager" aria-label="Other pieces">
      <NuxtLink
        v-if="nearby.prev"
        :to="thingTo(nearby.prev)"
        class="step prev"
      >
        <span class="dir">← Previous</span>
        <span class="who">{{ nearby.prev.name }}</span>
      </NuxtLink>
      <span v-else class="step" />
      <NuxtLink
        v-if="nearby.next"
        :to="thingTo(nearby.next)"
        class="step next"
      >
        <span class="dir">Next →</span>
        <span class="who">{{ nearby.next.name }}</span>
      </NuxtLink>
    </nav>

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

.figure {
  display: flex;
  min-height: min(58vh, 560px);
  align-items: center;
  justify-content: center;
  margin-bottom: 36px;
  padding: 24px 16px;
}
.figure :deep(.object) {
  max-width: min(90vw, 760px);
  max-height: min(64vh, 580px);
}

.title {
  margin: 0 0 8px;
  font-family: var(--font-redaction);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 400;
  line-height: 1.15;
  color: var(--ui-text-highlighted);
  text-wrap: balance;
}
.brand {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.price {
  margin: 16px 0 0;
  font-family: var(--font-redaction);
  font-size: 28px;
  line-height: 1;
  color: var(--ui-text-highlighted);
  font-variant-numeric: tabular-nums;
}
.links {
  margin: 18px 0 0;
}
.shop {
  font-size: 16px;
  color: var(--ui-text-highlighted);
  text-decoration: none;
  border: 0;
  box-shadow: none;
  border-bottom: 1px solid var(--ui-primary);
}
.shop:hover {
  color: var(--ui-primary);
}
.note {
  max-width: 528px;
  margin: 28px 0 0;
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
  max-width: 528px;
  margin-top: 36px;
}
.row {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 12%, transparent);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 18px;
}
.row dt {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.row dd {
  margin: 0;
  color: var(--ui-text-muted);
  font-variant-numeric: tabular-nums;
  text-wrap: pretty;
}

.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 12%, transparent);
}
.step {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  text-decoration: none;
  border: 0;
  box-shadow: none;
  color: inherit;
}
.step.next {
  text-align: right;
  justify-self: end;
}
.dir {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.who {
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-text-toned);
  text-wrap: pretty;
}
.step:hover .who {
  color: var(--ui-text-highlighted);
}
.step:hover .dir {
  color: var(--ui-primary);
}

</style>
