<script setup lang="ts">
import type { ThingItem } from '~/utils/things'

const { item, vt = false } = defineProps<{
  item: ThingItem
  vt?: boolean
}>()

const href = computed(() => thingHref(item))
const note = computed(() => thingNote(item))
const fields = computed(() => thingSpecs(item))
</script>

<template>
  <div class="copy">
    <p class="brand">
      {{ item.brand }}
    </p>
    <h1
      class="title"
      :style="vt ? { viewTransitionName: thingTitleVt(item.slug) } : undefined"
    >
      {{ item.name }}
    </h1>
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
        View at {{ item.brand }}
        <UIcon name="i-lucide-arrow-up-right" class="go" />
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
</template>

<style scoped>
.copy {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 28rem;
  margin: 0;
  padding: 0;
  text-align: left;
}
.brand,
.title,
.price,
.links,
.note,
.sheet {
  width: 100%;
  margin-left: 0;
  padding-left: 0;
  text-align: left;
}
.brand {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.title {
  margin: 10px 0 0;
  font-family: var(--font-redaction);
  font-size: clamp(28px, 4vw, 42px);
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin: 18px 0 0;
}
.shop {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid var(--ui-primary);
  background: transparent;
  font-size: 14px;
  line-height: 1.2;
  color: #111111;
  text-decoration: none;
  box-shadow: none;
  cursor: pointer;
}
.shop:hover {
  color: var(--ui-primary);
}
.go {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
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
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  margin: 0;
  padding: 10px 0;
  border-top: 1px solid var(--ui-border);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 18px;
}
.row dt {
  margin: 0;
  padding: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.row dd {
  margin: 0;
  padding: 0;
  color: var(--ui-text-muted);
  font-variant-numeric: tabular-nums;
  text-wrap: pretty;
}
</style>
