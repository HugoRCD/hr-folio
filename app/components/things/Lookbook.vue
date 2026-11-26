<script setup lang="ts">
import { motion } from 'motion-v'
import { THING_CATEGORIES, CATEGORY_LABEL, type ThingItem } from '~/utils/things'

const { items } = defineProps<{
  items: ThingItem[]
}>()

const emit = defineEmits<{
  open: [item: ThingItem]
}>()

const { spring, reduced } = useThingMotion()
const hover = ref<string | null>(null)

const chapters = computed(() => {
  return THING_CATEGORIES
    .map(cat => ({ cat, items: items.filter(item => item.category === cat) }))
    .filter(ch => ch.items.length)
})
</script>

<template>
  <div class="lookbook">
    <section v-for="ch in chapters" :key="ch.cat" class="chapter">
      <header class="head">
        <p class="kicker">
          {{ CATEGORY_LABEL[ch.cat] }}
        </p>
        <p class="count">
          {{ ch.items.length }}
        </p>
      </header>
      <div class="row">
        <motion.button
          v-for="item in ch.items"
          :key="item.slug"
          type="button"
          class="card"
          :class="{ dim: hover && hover !== item.slug }"
          :while-hover="reduced ? false : { y: -8 }"
          :transition="spring"
          @mouseenter="hover = item.slug"
          @mouseleave="hover = hover === item.slug ? null : hover"
          @click="emit('open', item)"
        >
          <span class="frame">
            <ThingsCutout :item />
          </span>
          <span class="contact" aria-hidden="true" />
          <span class="whisper">
            <span class="name">{{ item.name }}</span>
            <span class="brand">{{ item.brand }}</span>
            <span class="price">{{ formatPrice(item.price) }}</span>
          </span>
        </motion.button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lookbook {
  flex: 0 0 auto;
  width: 100%;
  padding: 36px 28px calc(108px + env(safe-area-inset-bottom, 0px));
  max-width: 1280px;
  margin-inline: auto;
}
.chapter + .chapter {
  margin-top: 88px;
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 28px;
}
.kicker {
  margin: 0;
  font-family: var(--font-redaction);
  font-size: 28px;
  color: #111111;
}
.count {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ui-text-dimmed);
}
.row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 48px 28px;
}
.card {
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
  transition: opacity 0.35s ease;
}
.card.dim {
  opacity: 0.42;
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
.whisper {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 16px;
}
.name {
  font-size: 14px;
  color: #111111;
}
.brand {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.price {
  font-family: var(--font-redaction);
  font-size: 16px;
  color: #6B6B6B;
}

@media (max-width: 767px) {
  .lookbook {
    padding: 20px 16px calc(96px + env(safe-area-inset-bottom, 0px));
  }
  .chapter + .chapter {
    margin-top: 56px;
  }
  .kicker {
    font-size: 24px;
  }
  .row {
    gap: 28px 14px;
  }
}

@media (min-width: 768px) {
  .row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 1100px) {
  .row { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 64px 36px; }
}
</style>
