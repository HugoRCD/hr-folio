<script setup lang="ts">
import { CATEGORY_LABEL, type ThingItem } from '~/utils/things'

const { items } = defineProps<{
  items: ThingItem[]
}>()

const emit = defineEmits<{
  open: [item: ThingItem]
}>()
</script>

<template>
  <div class="list" role="list">
    <button
      v-for="item in items"
      :key="item.slug"
      type="button"
      class="row"
      role="listitem"
      :data-thing="item.slug"
      @click="emit('open', item)"
    >
      <span class="thumb" data-thing-media>
        <ThingsCutout :item />
      </span>
      <span class="copy">
        <span class="name">{{ item.name }}</span>
        <span class="sub">
          <span class="brand">{{ item.brand }}</span>
          <span class="dot" aria-hidden="true">·</span>
          <span class="cat">{{ CATEGORY_LABEL[item.category] }}</span>
        </span>
      </span>
      <span class="brand desk">{{ item.brand }}</span>
      <span class="cat desk">{{ CATEGORY_LABEL[item.category] }}</span>
      <span class="price">{{ formatPrice(item.price) }}</span>
    </button>
  </div>
</template>

<style scoped>
.list {
  width: 100%;
  padding: 4px 0 8px;
}
.row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 10px 16px;
  border: 0;
  border-bottom: 1px solid #E8E6E1;
  background: transparent;
  text-align: left;
  cursor: pointer;
  box-shadow: none;
  color: inherit;
}
.row:hover {
  background: #F7F6F3;
}
.thumb {
  display: grid;
  width: 48px;
  height: 48px;
  padding: 2px;
  overflow: hidden;
  flex: 0 0 auto;
}
.copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.name {
  font-size: 14px;
  color: #111111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sub,
.brand,
.cat {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.sub {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.sub .brand,
.sub .cat {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dot {
  opacity: 0.5;
}
.desk {
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price {
  font-family: var(--font-redaction);
  font-size: 16px;
  color: #111111;
  font-variant-numeric: tabular-nums;
  justify-self: end;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .row {
    grid-template-columns: 56px minmax(0, 1.4fr) minmax(0, 0.9fr) minmax(0, 0.7fr) auto;
    gap: 16px;
    padding: 12px 28px;
  }
  .thumb {
    width: 56px;
    height: 56px;
  }
  .sub {
    display: none;
  }
  .desk {
    display: block;
  }
}
</style>
