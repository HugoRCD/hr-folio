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
    class="detail"
  >
    <p class="crumb">
      <NuxtLink :to="{ path: '/things', query: route.query }">
        Things
      </NuxtLink>
      <span aria-hidden="true">/</span>
      {{ item.name }}
    </p>

    <div class="split">
      <div class="figure">
        <ThingsCutout :item priority />
      </div>

      <div class="copy">
        <p class="brand">
          {{ item.brand }}
        </p>
        <h1 class="title">
          {{ item.name }}
        </h1>
        <p class="price">
          <ThingsPrice :price="item.price" />
        </p>
        <p v-if="href" class="links">
          <a
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
      </div>
    </div>

    <p class="affiliate">
      Some links are affiliate links.
    </p>
  </motion.article>
</template>

<style scoped>
.crumb {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 36px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.crumb a {
  color: var(--ui-text-muted);
  text-decoration: none;
  border: 0;
  box-shadow: none;
}
.crumb a:hover {
  color: var(--ui-text-highlighted);
}

.split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}
@media (min-width: 900px) {
  .split {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 72px;
  }
}

.figure {
  display: flex;
  min-height: min(58vh, 560px);
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.figure :deep(.cutout) {
  width: min(100%, 640px);
  height: min(62vh, 580px);
}
.figure :deep(.object) {
  max-width: 100%;
  max-height: 100%;
}

.copy {
  min-width: 0;
}
.brand {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.title {
  margin: 8px 0 0;
  font-family: var(--font-redaction);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 400;
  line-height: 1.15;
  color: #111111;
  text-wrap: balance;
}
.price {
  margin: 18px 0 0;
  font-family: var(--font-redaction);
  font-size: 28px;
  line-height: 1;
  color: #111111;
  font-variant-numeric: tabular-nums;
}
.links {
  margin: 20px 0 0;
}
.shop {
  font-size: 16px;
  color: #111111;
  text-decoration: none;
  border: 0;
  box-shadow: none;
  border-bottom: 1px solid var(--ui-primary);
}
.shop:hover {
  color: var(--ui-primary);
}
.note {
  margin: 28px 0 0;
  font-size: 16px;
  line-height: 28px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
.sheet {
  display: flex;
  flex-direction: column;
  margin-top: 32px;
}
.row {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid var(--ui-border);
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
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--ui-border);
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
  color: #111111;
}
.step:hover .dir {
  color: var(--ui-primary);
}

.affiliate {
  margin: 56px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.04em;
  color: var(--ui-text-dimmed);
}
</style>
