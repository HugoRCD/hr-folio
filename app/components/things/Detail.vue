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
const note = computed(() => thingNote(item))

const fields = computed(() => {
  const rows: Array<[string, string]> = [
    ['Brand', item.brand],
    ['Use', CATEGORY_LABEL[item.category]],
    ['Material', item.material ?? ''],
    ['Colour', item.color ?? ''],
    ['Size', item.size ?? ''],
  ]
  return rows.filter(([, value]) => value)
})

function thingTo(target: ThingItem) {
  return { path: thingPath(target), query: route.query }
}

function closeTo() {
  const query = { ...route.query, at: item.slug }
  return { path: '/things', query }
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (document.querySelector('[role="dialog"]')) return
  if (e.key === 'Escape') {
    navigateTo(closeTo())
  } else if (e.key === 'ArrowRight' && nearby.value.next) {
    navigateTo(thingTo(nearby.value.next))
  } else if (e.key === 'ArrowLeft' && nearby.value.prev) {
    navigateTo(thingTo(nearby.value.prev))
  }
}

function onGround(e: MouseEvent) {
  const el = e.target as HTMLElement | null
  if (!el) return
  if (el.closest('.hero, .copy, .peek, .close')) return
  navigateTo(closeTo())
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <motion.article
    class="stage"
    :initial="false"
    :transition="spring"
    @click="onGround"
  >
    <NuxtLink :to="closeTo()" class="close">
      Close
    </NuxtLink>

    <NuxtLink
      v-if="nearby.prev"
      :to="thingTo(nearby.prev)"
      class="peek prev"
      :aria-label="nearby.prev.name"
    >
      <ThingsCutout :key="nearby.prev.slug" :item="nearby.prev" />
    </NuxtLink>

    <div class="hero">
      <ThingsCutout :key="item.slug" :item priority />
      <span class="contact" aria-hidden="true" />
    </div>

    <NuxtLink
      v-if="nearby.next"
      :to="thingTo(nearby.next)"
      class="peek next"
      :aria-label="nearby.next.name"
    >
      <ThingsCutout :key="nearby.next.slug" :item="nearby.next" />
    </NuxtLink>

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
          View at {{ item.brand }} ↗
        </a>
      </p>
      <p v-if="note" class="note">
        {{ note }}
      </p>
      <dl class="sheet">
        <div v-for="[label, value] in fields" :key="label" class="row">
          <dt>{{ label }}</dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
    </div>

    <p class="affiliate">
      Some links are affiliate links.
    </p>
  </motion.article>
</template>

<style scoped>
.stage {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100dvh;
  padding: 88px 24px 48px;
  cursor: default;
  background: #FAF9F7;
}
.close {
  position: absolute;
  top: 28px;
  right: 28px;
  z-index: 8;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  text-decoration: none;
  border: 0;
  box-shadow: none;
}
.close:hover {
  color: #111111;
}

.peek {
  display: none;
}

.hero {
  position: relative;
  display: flex;
  min-height: min(62vh, 560px);
  align-items: flex-end;
  justify-content: center;
  padding: 12px 12px 36px;
}
.hero :deep(.cutout) {
  width: min(100%, 720px);
  height: min(62vh, 580px);
}
.contact {
  position: absolute;
  left: 22%;
  right: 22%;
  bottom: 18px;
  height: 22px;
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.22) 0%, rgb(32 24 16 / 0) 72%);
  filter: blur(14px);
  pointer-events: none;
}

.copy {
  min-width: 0;
  max-width: 28rem;
  margin-inline: auto;
}
.brand {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.title {
  margin: 8px 0 0;
  font-family: var(--font-redaction);
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 400;
  line-height: 1.12;
  color: #111111;
  text-wrap: balance;
}
.price {
  margin: 16px 0 0;
  font-family: var(--font-redaction);
  font-size: 26px;
  line-height: 1;
  color: #111111;
  font-variant-numeric: tabular-nums;
}
.links {
  margin: 18px 0 0;
}
.shop {
  font-size: 14px;
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
  margin: 22px 0 0;
  font-size: 16px;
  line-height: 26px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
.sheet {
  display: flex;
  flex-direction: column;
  margin-top: 28px;
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

.affiliate {
  margin: 40px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.04em;
  color: var(--ui-text-dimmed);
}

@media (min-width: 900px) {
  .stage {
    grid-template-columns: 12vw minmax(0, 1.2fr) minmax(0, 0.8fr) 12vw;
    grid-template-areas: "prev hero copy next";
    align-items: center;
    gap: 12px;
    padding: 64px 0 48px;
  }
  .peek {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34vh;
    overflow: visible;
    opacity: 0.34;
    cursor: zoom-in;
    text-decoration: none;
    border: 0;
    box-shadow: none;
    transition: opacity 0.35s cubic-bezier(0.65, 0, 0.35, 1);
  }
  .peek:hover {
    opacity: 0.78;
  }
  .peek.prev {
    grid-area: prev;
  }
  .peek.next {
    grid-area: next;
  }
  .peek :deep(.cutout) {
    width: 80%;
    height: 100%;
  }
  .hero {
    grid-area: hero;
    min-height: 72vh;
  }
  .copy {
    grid-area: copy;
    margin-inline: 0 48px;
  }
  .affiliate {
    position: absolute;
    right: 28px;
    bottom: 22px;
    margin: 0;
  }
}
</style>
