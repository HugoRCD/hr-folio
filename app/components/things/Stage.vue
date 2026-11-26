<script setup lang="ts">
import type { ThingItem } from '#shared/utils/things'

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
const dockEl = useTemplateRef<HTMLElement>('dockEl')
const scrollerEl = useTemplateRef<HTMLElement>('scrollerEl')
const dragX = ref(0)
const dragging = ref(false)

let startX = 0
let startY = 0
let axis: 'h' | 'v' | null = null
let pointerId: number | null = null

watch(() => item.slug, (next, prev) => {
  if (!prev) return
  const ni = items.findIndex(row => row.slug === next)
  const pi = items.findIndex(row => row.slug === prev)
  if (ni < 0 || pi < 0) return
  if (pi === items.length - 1 && ni === 0) dir.value = 1
  else if (pi === 0 && ni === items.length - 1) dir.value = -1
  else dir.value = ni > pi ? 1 : -1
})

function scrollDock(smooth = true) {
  const root = dockEl.value
  const current = root?.querySelector<HTMLElement>('[data-dock-current="true"]')
  current?.scrollIntoView({
    inline: 'center',
    block: 'nearest',
    behavior: smooth ? 'smooth' : 'instant',
  })
}

watch(
  () => item.slug,
  () => {
    nextTick(() => scrollDock(true))
  },
)


const slide = computed(() => {
  if (reduced.value) return ''
  return dir.value > 0 ? 'slide-next' : 'slide-prev'
})

const shotStyle = computed(() => {
  if (!dragging.value && !dragX.value) return undefined
  return {
    transform: `translateX(${dragX.value}px)`,
    transition: dragging.value ? 'none' : undefined,
  }
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
  if (el.closest('.hero, .copy, .copy-slot, .peek, .close, .dock')) return
  emit('close')
}

function coarse() {
  return import.meta.client && window.matchMedia('(max-width: 767px)').matches
}

function onPointerDown(e: PointerEvent) {
  if (!coarse() || e.pointerType === 'mouse') return
  const { clientX, clientY, pointerId: id } = e
  startX = clientX
  startY = clientY
  axis = null
  pointerId = id
  dragging.value = true
  dragX.value = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== pointerId) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!axis) {
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    axis = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
  }
  if (axis === 'h') {
    e.preventDefault()
    dragX.value = dx
  }
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value || (pointerId !== null && e.pointerId !== pointerId)) return
  const dx = dragX.value
  const dy = e.clientY - startY
  const used = axis
  const atTop = (scrollerEl.value?.scrollTop ?? 0) < 8
  dragging.value = false
  pointerId = null
  axis = null
  dragX.value = 0
  if (used === 'h') {
    if (dx < -72 && nearby.value.next) emit('go', nearby.value.next)
    else if (dx > 72 && nearby.value.prev) emit('go', nearby.value.prev)
  } else if (used === 'v' && atTop && dy > 88) {
    emit('close')
  }
}

function onPointerCancel() {
  dragging.value = false
  pointerId = null
  axis = null
  dragX.value = 0
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  nextTick(() => scrollDock(false))
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <article class="stage" @click="onGround">
    <button type="button" class="close" @click="emit('close')">
      Close
    </button>

    <div
      ref="scrollerEl"
      class="scroller"
    >
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

      <div
        class="hero"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <span class="frame" data-thing-hero>
          <Transition :name="slide">
            <span :key="item.slug" class="shot" :style="shotStyle">
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
    </div>

    <nav
      ref="dockEl"
      class="dock"
      aria-label="Pieces"
    >
      <button
        v-for="row in items"
        :key="row.slug"
        type="button"
        class="dock-item"
        :class="{ on: row.slug === item.slug }"
        :data-dock-current="row.slug === item.slug ? 'true' : undefined"
        :aria-current="row.slug === item.slug ? 'true' : undefined"
        :aria-label="row.name"
        @click="emit('go', row)"
      >
        <span class="dock-frame">
          <ThingsCutout :item="row" />
        </span>
      </button>
    </nav>
  </article>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 50;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  background: #FAF9F7;
  -webkit-tap-highlight-color: transparent;
}
.scroller {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 28px;
  padding: 88px 24px 48px;
  overflow: auto;
  overscroll-behavior: contain;
}
.close {
  position: absolute;
  top: 22px;
  right: 28px;
  z-index: 8;
  min-height: 44px;
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
  -webkit-tap-highlight-color: transparent;
}
.close:hover {
  color: #111111;
}
.close:active {
  transform: scale(0.98);
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
  touch-action: pan-y;
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
  will-change: transform;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
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
.dock {
  display: none;
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
  .scroller {
    display: grid;
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
  .scroller {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 16px;
    padding: calc(52px + env(safe-area-inset-top, 0px)) 18px 20px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .close {
    top: calc(8px + env(safe-area-inset-top, 0px));
    right: 16px;
    z-index: 9;
  }
  .hero {
    width: 100%;
    max-height: 42vh;
  }
  .frame {
    max-width: min(75vw, 100%);
    max-height: 42vh;
    margin-inline: auto;
  }
  .copy-slot {
    max-width: 100%;
    min-height: 0;
  }
  .dock {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 8px 12px calc(10px + env(safe-area-inset-bottom, 0px));
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    background: #FAF9F7;
    border-top: 1px solid #E8E6E1;
  }
  .dock::-webkit-scrollbar {
    display: none;
  }
  .dock-item {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 12px;
    background: #F7F6F3;
    box-shadow: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .dock-item:active {
    transform: scale(0.98);
  }
  .dock-item.on {
    border-color: #CD1919;
    background: #FFFFFF;
  }
  .dock-frame {
    display: grid;
    width: 40px;
    height: 40px;
    overflow: hidden;
  }
}
</style>
