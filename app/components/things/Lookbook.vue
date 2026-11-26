<script setup lang="ts">
import type { ThingItem } from '~/utils/things'

const { items } = defineProps<{
  items: ThingItem[]
}>()

const emit = defineEmits<{
  open: [item: ThingItem]
}>()
</script>

<template>
  <div class="lookbook">
    <button
      v-for="item in items"
      :key="item.slug"
      type="button"
      class="card"
      :data-thing="item.slug"
      @click="emit('open', item)"
    >
      <span class="frame" data-thing-media>
        <ThingsCutout :item />
      </span>
      <span class="contact" aria-hidden="true" />
      <span class="meta">
        <span class="brand">{{ item.brand }}</span>
        <span class="name">{{ item.name }}</span>
        <span class="price">{{ formatPrice(item.price) }}</span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.lookbook {
  position: relative;
  z-index: 0;
  isolation: isolate;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 32px 14px;
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding: 20px 16px 8px;
}
.card {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  box-shadow: none;
  text-align: left;
  color: inherit;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (hover: hover) {
  .card:hover {
    transform: translateY(-6px);
  }
}
.frame {
  display: grid;
  width: 100%;
  aspect-ratio: 4 / 5;
  padding: 8%;
  box-sizing: border-box;
  overflow: hidden;
}
.contact {
  display: block;
  width: 56%;
  height: 12px;
  margin: -4px auto 0;
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.16) 0%, rgb(32 24 16 / 0) 72%);
  filter: blur(8px);
}
.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 14px;
}
.brand {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.name {
  font-size: 14px;
  line-height: 1.3;
  min-height: 1.3em;
  color: #111111;
}
.price {
  font-family: var(--font-redaction);
  font-size: 16px;
  color: #6B6B6B;
}

@media (min-width: 768px) {
  .lookbook {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 48px 28px;
    padding: 36px 28px 12px;
  }
}
@media (min-width: 1100px) {
  .lookbook {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 64px 36px;
  }
}
</style>
