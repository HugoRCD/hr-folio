<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { CATEGORY_LABEL, type ThingItem } from '~/utils/things'

const props = defineProps<{
  items: ThingItem[]
}>()

const emit = defineEmits<{
  open: [item: ThingItem]
}>()

const { spring, reduced } = useThingMotion()
const hover = ref<string | null>(null)
const preview = computed(() => {
  const slug = hover.value
  return props.items.find(item => item.slug === slug) ?? props.items[0]
})
</script>

<template>
  <div class="archive">
    <div class="list" role="list">
      <button
        v-for="item in items"
        :key="item.slug"
        type="button"
        class="row"
        :class="{ on: preview?.slug === item.slug }"
        role="listitem"
        @mouseenter="hover = item.slug"
        @focus="hover = item.slug"
        @click="emit('open', item)"
      >
        <span class="name">{{ item.name }}</span>
        <span class="brand">{{ item.brand }}</span>
        <span class="cat">{{ CATEGORY_LABEL[item.category] }}</span>
        <span class="price">{{ formatPrice(item.price) }}</span>
      </button>
    </div>

    <div class="pane" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          v-if="preview"
          :key="preview.slug"
          class="preview"
          :initial="reduced ? false : { opacity: 0, scale: 0.98 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.98 }"
          :transition="spring"
        >
          <span class="frame">
            <ThingsCutout :item="preview" priority />
          </span>
          <span class="contact" aria-hidden="true" />
          <p class="who">
            {{ preview.name }}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.archive {
  display: grid;
  grid-template-columns: 1fr;
  min-height: calc(100dvh - 72px);
}
.list {
  padding: 8px 0 120px;
}
.row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 0.8fr) auto;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 14px 28px;
  border: 0;
  border-bottom: 1px solid #E8E6E1;
  background: transparent;
  text-align: left;
  cursor: pointer;
  box-shadow: none;
  color: inherit;
}
.row:hover,
.row.on {
  background: #F7F6F3;
}
.name {
  font-size: 14px;
  color: #111111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brand,
.cat {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price {
  font-family: var(--font-redaction);
  font-size: 15px;
  color: #111111;
  font-variant-numeric: tabular-nums;
  justify-self: end;
}
.pane {
  display: none;
}

@media (min-width: 900px) {
  .archive {
    grid-template-columns: minmax(0, 1.15fr) minmax(22rem, 0.85fr);
  }
  .pane {
    display: flex;
    position: sticky;
    top: 72px;
    height: calc(100dvh - 72px);
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #FAF9F7;
    border-left: 1px solid #E8E6E1;
  }
  .preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(100%, 420px);
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
    width: 48%;
    height: 12px;
    background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.16) 0%, rgb(32 24 16 / 0) 72%);
    filter: blur(8px);
  }
  .who {
    margin: 18px 0 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ui-text-dimmed);
  }
}

@media (max-width: 899px) {
  .row {
    grid-template-columns: 1fr auto;
    padding: 12px 18px;
  }
  .brand, .cat { display: none; }
}
</style>
