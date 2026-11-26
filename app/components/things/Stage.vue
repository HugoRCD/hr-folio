<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const { items, spring } = defineProps<{
  items: ThingItem[]
  spring: Record<string, unknown>
}>()

const { reduced, glide } = useThingMotion()
const route = useRoute()

const SLOT = 270
const index = ref(0)
const tug = ref(0)
const dragging = ref(false)
const didDrag = ref(false)

const current = computed(() => items[index.value] ?? items[0])
const href = computed(() => current.value ? thingHref(current.value) : undefined)
const specs = computed(() => {
  const item = current.value
  if (!item) return []
  return [item.material, item.size, item.color].filter((value): value is string => Boolean(value))
})
const number = computed(() => String(index.value + 1).padStart(2, '0'))
const total = computed(() => String(items.length).padStart(2, '0'))

watch(() => items.map(item => item.slug).join('|'), (next, prev) => {
  if (next === prev) return
  const keep = current.value ? items.findIndex(item => item.slug === current.value!.slug) : -1
  index.value = keep >= 0 ? keep : 0
  tug.value = 0
})

watch(() => items.length, (n) => {
  if (index.value >= n) index.value = Math.max(0, n - 1)
})

function wrap(i: number) {
  const n = items.length
  if (n <= 0) return 0
  return ((i % n) + n) % n
}

function go(next: number) {
  if (items.length <= 1) return
  index.value = wrap(next)
  tug.value = 0
}

function pose(i: number) {
  const d = i - index.value + tug.value / SLOT
  const abs = Math.abs(d)
  return {
    x: d * SLOT,
    scale: reduced.value ? 1 : Math.max(0.58, 1 - abs * 0.22),
    opacity: abs < 0.04 ? 1 : Math.max(0.18, 1 - abs * 0.42),
    zIndex: Math.round(20 - abs * 8),
  }
}

function transitionFor(i: number) {
  if (dragging.value) return { duration: 0 }
  const abs = Math.abs(i - index.value)
  return abs <= 1 ? glide.value : spring
}

let startX = 0
let lastX = 0
let lastT = 0
let velocity = 0

function onPointerDown(e: PointerEvent) {
  if (items.length <= 1) return
  if ((e.target as HTMLElement).closest('a, button')) return
  dragging.value = true
  didDrag.value = false
  startX = e.clientX
  lastX = e.clientX
  lastT = performance.now()
  velocity = 0
  tug.value = 0
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return
  const now = performance.now()
  const dx = e.clientX - lastX
  const dt = now - lastT
  tug.value = e.clientX - startX
  if (Math.abs(tug.value) > 8) didDrag.value = true
  if (dt > 0) velocity = dx / dt * 1000
  lastX = e.clientX
  lastT = now
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  const should = tug.value < -SLOT * 0.22 || velocity < -520
    ? 1
    : tug.value > SLOT * 0.22 || velocity > 520
      ? -1
      : 0
  if (should) go(index.value + should)
  else tug.value = 0
  velocity = 0
}

function onSlotClick(i: number) {
  if (didDrag.value) return
  if (i === index.value) return
  go(i)
}

function onWheel(e: WheelEvent) {
  if (items.length <= 1) return
  const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
  if (!horizontal && document.activeElement !== e.currentTarget) return
  const delta = horizontal ? e.deltaX : e.deltaY
  if (Math.abs(delta) < 12) return
  e.preventDefault()
  go(index.value + (delta > 0 ? 1 : -1))
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (document.querySelector('[role="dialog"]')) return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    go(index.value + 1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    go(index.value - 1)
  }
}

let wheelLock = false
function onWheelGuarded(e: WheelEvent) {
  if (wheelLock && !reduced.value) return
  onWheel(e)
  if (e.defaultPrevented) {
    wheelLock = true
    window.setTimeout(() => {
      wheelLock = false
    }, 420)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})

function thingTo(item: ThingItem) {
  return { path: thingPath(item), query: route.query }
}
</script>

<template>
  <div v-if="current" class="wide">
    <div
      class="stage"
      role="region"
      aria-roledescription="carousel"
      aria-label="Things"
      tabindex="0"
      :data-dragging="dragging ? '' : undefined"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @wheel="onWheelGuarded"
    >
      <AnimatePresence :initial="false">
        <motion.div
          v-for="(item, i) in items"
          :key="item.slug"
          class="slot"
          :style="{ zIndex: pose(i).zIndex }"
          :initial="false"
          :animate="{ x: pose(i).x, scale: pose(i).scale, opacity: pose(i).opacity }"
          :exit="{ opacity: 0, scale: 0.86 }"
          :transition="transitionFor(i)"
          :data-active="i === index ? '' : undefined"
          @click="onSlotClick(i)"
        >
          <NuxtLink
            v-if="i === index"
            :to="thingTo(item)"
            class="hit"
            :aria-current="true"
            @click="didDrag ? $event.preventDefault() : undefined"
          >
            <ThingsCutout :item priority shared />
          </NuxtLink>
          <button
            v-else
            type="button"
            class="hit"
            :aria-label="item.name"
            @click="onSlotClick(i)"
          >
            <ThingsCutout :item :shared="false" />
          </button>
        </motion.div>
      </AnimatePresence>

      <button
        v-if="items.length > 1"
        type="button"
        class="nudge prev"
        aria-label="Previous"
        @click="go(index - 1)"
      >
        ←
      </button>
      <button
        v-if="items.length > 1"
        type="button"
        class="nudge next"
        aria-label="Next"
        @click="go(index + 1)"
      >
        →
      </button>
    </div>

    <div class="caption">
      <p class="count" aria-hidden="true">
        {{ number }}
        <span>/</span>
        {{ total }}
      </p>
      <AnimatePresence :initial="false" mode="wait">
        <motion.div
          :key="current.slug"
          class="who"
          :initial="reduced ? false : { opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="reduced ? undefined : { opacity: 0, y: -8 }"
          :transition="spring"
        >
          <h2 class="name">
            {{ current.name }}
          </h2>
          <p class="brand">
            {{ current.brand }}
          </p>
        </motion.div>
      </AnimatePresence>
      <p class="price">
        <ThingsPrice :price="current.price" />
      </p>
      <AnimatePresence :initial="false" mode="wait">
        <motion.div
          :key="`${current.slug}-meta`"
          class="meta"
          :initial="reduced ? false : { opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="reduced ? undefined : { opacity: 0 }"
          :transition="spring"
        >
          <p v-if="specs.length" class="specs">
            {{ specs.join(' · ') }}
          </p>
          <p class="links">
            <a
              v-if="href"
              :href
              target="_blank"
              rel="noopener noreferrer"
              class="shop"
            >
              {{ current.brand }}
            </a>
            <NuxtLink :to="thingTo(current)" class="closer">
              Closer
            </NuxtLink>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.wide {
  width: calc(100% + 48px);
  margin-inline: -24px;
}
@media (min-width: 1024px) {
  .wide {
    width: var(--sheet-width);
    margin-left: calc(-1 * (var(--sheet-index) + var(--sheet-gutter)));
    margin-right: 0;
    clip-path: inset(0 var(--sheet-note) 0 0);
  }
}

.stage {
  position: relative;
  isolation: isolate;
  height: min(68vh, 620px);
  min-height: 340px;
  margin-top: 8px;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  outline: none;
}
.stage[data-dragging] {
  cursor: grabbing;
}
.stage:focus-visible {
  box-shadow: none;
}

.slot {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 12%;
  will-change: transform, opacity;
}
.hit {
  display: flex;
  max-width: min(72vw, 540px);
  max-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  text-decoration: none;
  color: inherit;
  border: 0;
  box-shadow: none;
  cursor: inherit;
}
.hit:focus-visible {
  box-shadow: none;
}
.slot :deep(.object) {
  max-height: min(58vh, 540px);
  max-width: min(70vw, 560px);
}

.nudge {
  position: absolute;
  top: 50%;
  z-index: 30;
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1;
  color: color-mix(in oklab, var(--ui-text-muted) 55%, transparent);
  cursor: pointer;
}
.nudge:hover,
.nudge:focus-visible {
  color: var(--ui-text-highlighted);
  box-shadow: none;
}
.nudge.prev {
  left: 4px;
}
.nudge.next {
  right: 4px;
}

.caption,
.who,
.meta {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.caption {
  gap: 0;
  max-width: 36rem;
  margin: 28px auto 0;
  padding-inline: 24px;
  text-align: center;
}
.who,
.meta {
  width: 100%;
}
.count {
  margin: 0 0 14px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.count span {
  margin-inline: 6px;
  color: color-mix(in oklab, var(--ui-text-dimmed) 50%, transparent);
}
.name {
  margin: 0;
  font-family: var(--font-redaction);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 400;
  line-height: 1.15;
  color: var(--ui-text-highlighted);
  text-wrap: balance;
}
.brand {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}
.price {
  margin: 14px 0 0;
  font-family: var(--font-redaction);
  font-size: 28px;
  line-height: 1;
  color: var(--ui-text-highlighted);
  font-variant-numeric: tabular-nums;
}
.specs {
  margin: 14px 0 0;
  max-width: 28rem;
  font-size: 14px;
  line-height: 22px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
.links {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 20px;
  margin: 22px 0 0;
}
.shop,
.closer {
  font-size: 15px;
  line-height: 22px;
  text-decoration: none;
  border: 0;
  box-shadow: none;
}
.shop {
  color: var(--ui-text-highlighted);
  border-bottom: 1px solid var(--ui-primary);
}
.shop:hover {
  color: var(--ui-primary);
}
.closer {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}
.closer:hover {
  color: var(--ui-text-highlighted);
}

@media (max-width: 639px) {
  .stage {
    height: min(54vh, 420px);
    min-height: 260px;
  }
  .slot {
    padding-inline: 12px;
  }
  .nudge {
    display: none;
  }
}
</style>
