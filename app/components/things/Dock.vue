<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const props = defineProps<{
  items: ThingItem[]
  active?: ThingItem
}>()

const emit = defineEmits<{
  select: [item: ThingItem]
  details: [item: ThingItem]
}>()

const { spring, reduced } = useThingMotion()
const hover = ref<number | null>(null)
const rail = useTemplateRef<HTMLElement>('rail')
const root = useTemplateRef<HTMLElement>('root')
const compact = useMediaQuery('(max-width: 767px)')
const current = computed(() => props.active ?? props.items[0])
const index = computed(() => Math.max(0, props.items.findIndex(item => item.slug === current.value?.slug)))
const scrub = { on: false, x: 0, sl: 0, moved: false }

function mag(i: number) {
  if (compact.value) return i === index.value ? 1.08 : 1
  const focus = hover.value ?? index.value
  const d = Math.abs(i - focus)
  if (d === 0) return 1.38
  if (d === 1) return 1.14
  if (d === 2) return 1.05
  return 1
}

function select(item: ThingItem) {
  if (scrub.moved) return
  emit('select', item)
}

function move(delta: number) {
  if (!props.items.length) return
  const next = (index.value + delta + props.items.length) % props.items.length
  emit('select', props.items[next]!)
}

function onWheel(e: WheelEvent) {
  if (Math.abs(e.deltaY) + Math.abs(e.deltaX) < 8) return
  e.preventDefault()
  move(e.deltaY + e.deltaX > 0 ? 1 : -1)
}

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (document.querySelector('[role="dialog"]')) return
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    move(1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    move(-1)
  }
}

async function reveal(i = index.value) {
  await nextTick()
  const el = rail.value?.querySelectorAll<HTMLElement>('.bead')[i]
  el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduced.value ? 'auto' : 'smooth' })
}

watch(index, i => reveal(i))

function onRailDown(e: PointerEvent) {
  if (e.button !== 0) return
  const el = rail.value
  if (!el) return
  scrub.on = true
  scrub.moved = false
  scrub.x = e.clientX
  scrub.sl = el.scrollLeft
  el.setPointerCapture(e.pointerId)
}

function onRailMove(e: PointerEvent) {
  if (!scrub.on) return
  const el = rail.value
  if (!el) return
  const dx = e.clientX - scrub.x
  if (Math.abs(dx) > 4) scrub.moved = true
  el.scrollLeft = scrub.sl - dx
}

function onRailUp(e: PointerEvent) {
  if (!scrub.on) return
  scrub.on = false
  rail.value?.releasePointerCapture(e.pointerId)
}

onMounted(() => {
  const el = root.value
  el?.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)
  reveal(index.value)
})

onBeforeUnmount(() => {
  root.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="dock">
    <div class="stage">
      <AnimatePresence mode="wait">
        <motion.div
          v-if="current"
          :key="current.slug"
          class="hero"
          :initial="reduced ? false : { opacity: 0, scale: 0.98 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.98 }"
          :transition="spring"
        >
          <div class="cut">
            <span class="frame">
              <ThingsCutout :item="current" priority />
            </span>
            <span class="contact" aria-hidden="true" />
          </div>
          <ThingsCopy
            :item="current"
            docked
            @details="emit('details', current)"
          />
        </motion.div>
      </AnimatePresence>
    </div>

    <div
      ref="rail"
      class="rail"
      @mouseleave="hover = null"
      @pointerdown="onRailDown"
      @pointermove="onRailMove"
      @pointerup="onRailUp"
      @pointercancel="onRailUp"
    >
      <button
        v-for="(item, i) in items"
        :key="item.slug"
        type="button"
        class="bead"
        :class="{ on: item.slug === current?.slug }"
        :style="{ transform: `scale(${reduced ? 1 : mag(i)})` }"
        :aria-label="item.name"
        @mouseenter="hover = i"
        @focus="hover = i"
        @click="select(item)"
      >
        <span class="mini">
          <ThingsCutout :item />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dock {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 0;
  padding: 12px 28px 8px;
}
.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  width: 100%;
  max-width: 1180px;
  margin-inline: auto;
  align-items: center;
}
.cut {
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 0;
}
.frame {
  display: grid;
  width: min(100%, 520px);
  aspect-ratio: 4 / 5;
  padding: 7%;
  box-sizing: border-box;
  overflow: hidden;
}
.contact {
  position: absolute;
  left: 28%;
  right: 28%;
  bottom: 6%;
  height: 16px;
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.16) 0%, rgb(32 24 16 / 0) 72%);
  filter: blur(12px);
  pointer-events: none;
}
.rail {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 10px;
  flex-shrink: 0;
  height: 148px;
  padding: 12px 48px 72px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}
.rail::-webkit-scrollbar { display: none; }
.bead {
  flex: 0 0 auto;
  width: 56px;
  height: 70px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: 50% 100%;
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: none;
}
.mini {
  display: grid;
  width: 100%;
  height: 100%;
  padding: 6%;
  box-sizing: border-box;
  overflow: hidden;
  opacity: 0.55;
}
.bead.on .mini,
.bead:hover .mini {
  opacity: 1;
}

@media (min-width: 768px) {
  .stage {
    justify-content: center;
  }
  .hero {
    grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.85fr);
    gap: 56px;
  }
}

@media (max-width: 767px) {
  .stage {
    align-items: stretch;
    overflow: hidden;
    padding: 4px 18px 0;
  }
  .hero {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    height: auto;
    min-height: 0;
  }
  .cut {
    flex: 1;
    min-height: 0;
    align-items: center;
  }
  .frame {
    width: min(75vw, 100%);
    height: 100%;
    max-height: 100%;
    aspect-ratio: auto;
    padding: 2%;
  }
  .contact {
    bottom: 2%;
  }
  .rail {
    height: auto;
    gap: 8px;
    padding: 10px 16px calc(72px + env(safe-area-inset-bottom, 0px));
  }
  .bead {
    width: 48px;
    height: 58px;
  }
}
</style>
