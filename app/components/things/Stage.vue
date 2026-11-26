<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const { item, items } = defineProps<{
  item: ThingItem
  items: ThingItem[]
}>()

const emit = defineEmits<{
  close: []
  go: [target: ThingItem]
}>()

const { spring, reduced } = useThingMotion()
const nearby = computed(() => adjacent(items, item.slug))

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (document.querySelector('[role="dialog"]')) return
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowRight' && nearby.value.next) emit('go', nearby.value.next)
  else if (e.key === 'ArrowLeft' && nearby.value.prev) emit('go', nearby.value.prev)
}

function onGround(e: MouseEvent) {
  const el = e.target as HTMLElement | null
  if (!el) return
  if (el.closest('.hero, .copy, .copy-slot, .peek, .close')) return
  emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <motion.article
    class="stage"
    :initial="false"
    :animate="{ opacity: 1 }"
    :exit="{ opacity: 0 }"
    :transition="spring"
    @click="onGround"
  >
    <button type="button" class="close" @click="emit('close')">
      Close
    </button>

    <button
      v-if="nearby.prev"
      type="button"
      class="peek prev"
      :aria-label="nearby.prev.name"
      @click="emit('go', nearby.prev)"
    >
      <span class="frame">
        <ThingsCutout :item="nearby.prev" />
      </span>
    </button>

    <AnimatePresence mode="wait">
      <motion.div
        :key="item.slug"
        class="hero"
        :initial="reduced ? false : { opacity: 0, scale: 0.985 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.985 }"
        :transition="spring"
      >
        <span class="frame">
          <ThingsCutout :item priority />
        </span>
        <span class="contact" aria-hidden="true" />
      </motion.div>
    </AnimatePresence>

    <button
      v-if="nearby.next"
      type="button"
      class="peek next"
      :aria-label="nearby.next.name"
      @click="emit('go', nearby.next)"
    >
      <span class="frame">
        <ThingsCutout :item="nearby.next" />
      </span>
    </button>

    <AnimatePresence mode="wait">
      <motion.div
        :key="`${item.slug}-copy`"
        class="copy-slot"
        :initial="reduced ? false : { opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -8 }"
        :transition="spring"
      >
        <ThingsCopy :item />
      </motion.div>
    </AnimatePresence>
  </motion.article>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 28px;
  padding: 88px 24px 48px;
  overflow: auto;
  background: #FAF9F7;
  will-change: opacity;
}
.close {
  position: absolute;
  top: 22px;
  right: 28px;
  z-index: 8;
  padding: 0;
  border: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  cursor: pointer;
  box-shadow: none;
}
.close:hover {
  color: #111111;
}
.copy-slot {
  width: 100%;
  max-width: 28rem;
}
.peek {
  display: none;
}
.hero {
  position: relative;
  display: grid;
  min-height: min(58vh, 520px);
  place-items: center;
}
.frame {
  display: grid;
  width: 100%;
  max-width: 560px;
  aspect-ratio: 4 / 5;
  padding: 6%;
  box-sizing: border-box;
  overflow: hidden;
}
.contact {
  position: absolute;
  left: 24%;
  right: 24%;
  bottom: 8%;
  height: 18px;
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.18) 0%, rgb(32 24 16 / 0) 72%);
  filter: blur(12px);
  pointer-events: none;
}

@media (min-width: 900px) {
  .stage {
    grid-template-columns: 10vw minmax(0, 1.1fr) minmax(20rem, 0.85fr) 10vw;
    grid-template-areas: "prev hero copy next";
    gap: 8px 16px;
    padding: 72px 0 40px;
    overflow: hidden;
  }
  .peek {
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    opacity: 0.32;
    cursor: zoom-in;
    box-shadow: none;
  }
  .peek:hover {
    opacity: 0.7;
  }
  .peek.prev { grid-area: prev; }
  .peek.next { grid-area: next; }
  .peek .frame {
    width: 72%;
    max-width: 140px;
    aspect-ratio: 4 / 5;
    padding: 4%;
  }
  .hero { grid-area: hero; }
  .copy-slot {
    grid-area: copy;
    justify-self: start;
    align-self: center;
    width: 100%;
    max-width: 28rem;
  }
}
</style>
