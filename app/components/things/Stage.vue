<script setup lang="ts">
import type { ThingItem } from '~/utils/things'

const { item, items } = defineProps<{
  item: ThingItem
  items: ThingItem[]
}>()

const emit = defineEmits<{
  close: []
  go: [target: ThingItem]
}>()

const { reduced } = useThingMotion()
const nearby = computed(() => adjacent(items, item.slug))
const dir = ref(1)

watch(() => item.slug, (next, prev) => {
  if (!prev) return
  const ni = items.findIndex(row => row.slug === next)
  const pi = items.findIndex(row => row.slug === prev)
  if (ni < 0 || pi < 0) return
  if (pi === items.length - 1 && ni === 0) dir.value = 1
  else if (pi === 0 && ni === items.length - 1) dir.value = -1
  else dir.value = ni > pi ? 1 : -1
})

const slide = computed(() => {
  if (reduced.value) return ''
  return dir.value > 0 ? 'slide-next' : 'slide-prev'
})

function preload(target?: ThingItem) {
  if (!import.meta.client || !target) return
  const img = new Image()
  img.decoding = 'async'
  img.src = target.image
}

watch(
  () => [item, nearby.value.prev, nearby.value.next] as const,
  () => {
    preload(nearby.value.prev)
    preload(nearby.value.next)
  },
  { immediate: true },
)

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
  <article class="stage" @click="onGround">
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

    <div class="hero">
      <span class="frame" data-thing-hero>
        <Transition :name="slide">
          <span :key="item.slug" class="shot">
            <ThingsCutout :item priority />
          </span>
        </Transition>
      </span>
      <span class="contact" aria-hidden="true" />
    </div>

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

    <div class="copy-slot">
      <Transition :name="slide">
        <ThingsCopy :key="item.slug" :item />
      </Transition>
    </div>
  </article>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 50;
  isolation: isolate;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 28px;
  padding: 88px 24px 48px;
  overflow: auto;
  overscroll-behavior: contain;
  background: #FAF9F7;
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
  position: relative;
  width: 100%;
  max-width: 28rem;
  min-height: 26rem;
}
.peek {
  display: none;
}
.hero {
  position: relative;
  display: grid;
  place-items: center;
}
.frame {
  position: relative;
  display: grid;
  width: 100%;
  max-width: 560px;
  aspect-ratio: 4 / 5;
  box-sizing: border-box;
  overflow: hidden;
}
.shot {
  display: grid;
  position: absolute;
  inset: 0;
  padding: 6%;
  box-sizing: border-box;
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

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active,
:deep(.slide-next-enter-active),
:deep(.slide-next-leave-active),
:deep(.slide-prev-enter-active),
:deep(.slide-prev-leave-active) {
  transition: opacity 160ms cubic-bezier(0.22, 1, 0.36, 1), transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-next-leave-active,
.slide-prev-leave-active,
:deep(.slide-next-leave-active),
:deep(.slide-prev-leave-active) {
  position: absolute;
  inset: 0;
}
.slide-next-enter-from,
:deep(.slide-next-enter-from) {
  opacity: 0;
  transform: translateX(10px);
}
.slide-next-leave-to,
:deep(.slide-next-leave-to) {
  opacity: 0;
  transform: translateX(-10px);
}
.slide-prev-enter-from,
:deep(.slide-prev-enter-from) {
  opacity: 0;
  transform: translateX(-10px);
}
.slide-prev-leave-to,
:deep(.slide-prev-leave-to) {
  opacity: 0;
  transform: translateX(10px);
}

@media (min-width: 768px) {
  .stage {
    grid-template-columns: 10vw minmax(0, 1.1fr) minmax(20rem, 0.85fr) 10vw;
    grid-template-areas: "prev hero copy next";
    gap: 8px 16px;
    padding: 72px 0 40px;
    overflow: auto;
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
    min-height: 26rem;
  }
}

@media (max-width: 767px) {
  .stage {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 16px;
    padding: 0 18px calc(28px + env(safe-area-inset-bottom, 0px));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .close {
    position: sticky;
    top: 0;
    right: auto;
    align-self: flex-end;
    padding: 16px 0 8px;
    background: #FAF9F7;
  }
  .hero {
    width: 100%;
    max-height: 46vh;
  }
  .frame {
    max-width: min(75vw, 100%);
    max-height: 46vh;
    margin-inline: auto;
  }
  .copy-slot {
    max-width: 100%;
    min-height: 0;
  }
}
</style>
