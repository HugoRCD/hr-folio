<script setup lang="ts">
import {
  CATEGORY_LABEL,
  EVERYDAY_LABEL,
  NUMERALS,
  type ThingItem,
  type ThingSort,
} from '#shared/utils/things'

// The index: one object at a time on the stage, and the inventory written out beside it, the way
// the home page lists its entries. Point at a line, scroll, or press the arrows, and the stage
// follows; click or press Enter to open the piece.
const { items, sort, plates, opened } = defineProps<{
  items: ThingItem[]
  sort: ThingSort
  plates: Record<string, number>
  opened?: string
}>()

const active = defineModel<string>('active', { required: true })

const emit = defineEmits<{
  open: [item: ThingItem]
}>()

const { reduced } = useThingMotion()
const rootEl = useTemplateRef<HTMLElement>('rootEl')
const stageEl = useTemplateRef<HTMLElement>('stageEl')
const frameEl = useTemplateRef<HTMLElement>('frameEl')
const listEl = useTemplateRef<HTMLElement>('listEl')

type Head = { numeral: string, label: string, count: number }
type Entry = { key: string, head?: Head, item?: ThingItem }

// in the curated order the index is cut into sections: every day first, then each use
const section = (item: ThingItem) => item.featured ? 'everyday' : item.category

const entries = computed<Entry[]>(() => {
  const out: Entry[] = []
  let head: Head | undefined
  let last: string | undefined
  let n = 0
  for (const item of items) {
    const key = section(item)
    if (sort === 'curated' && key !== last) {
      last = key
      head = { numeral: NUMERALS[n++] ?? '', label: item.featured ? EVERYDAY_LABEL : CATEGORY_LABEL[item.category], count: 0 }
      out.push({ key: `head-${key}`, head })
    }
    if (head) head.count++
    out.push({ key: item.slug, item })
  }
  return out
})

const current = computed(() => items.find(item => item.slug === active.value) ?? items[0])
const plate = (item?: ThingItem) => String(item ? plates[item.slug] ?? 0 : 0).padStart(2, '0')
const detail = computed(() => {
  const item = current.value
  return item ? [item.color, item.size].filter(Boolean).join(' · ') : ''
})

// a piece that has been filtered away hands the stage to the first one left
watch(() => items, (next) => {
  if (next.length && !next.some(item => item.slug === active.value)) active.value = next[0]!.slug
}, { immediate: true })

// down the list, the next piece rises onto the stage; up the list, it comes down onto it
const dir = ref(1)
watch(active, (next, prev) => {
  const ni = items.findIndex(item => item.slug === next)
  const pi = items.findIndex(item => item.slug === prev)
  dir.value = ni >= pi ? 1 : -1
})
const swap = computed(() => reduced.value ? 'none' : dir.value > 0 ? 'rise' : 'fall')

// --- the arrival: the index writes itself in, the piece settles, the marks are drawn ---------
const arriving = ref(true)
onMounted(() => {
  setTimeout(() => {
    arriving.value = false
  }, 1900)
})

// --- the red tick that runs along the index to the line in hand ------------------------------
const tickY = ref<number | null>(null)
function measureTick() {
  const row = listEl.value?.querySelector<HTMLElement>(`[data-row="${active.value}"]`)
  tickY.value = row ? row.offsetTop + row.offsetHeight / 2 : null
}
watch([active, entries], () => nextTick(measureTick))
useResizeObserver(listEl, measureTick)

// a line on its way out is taken out of the flow to fade. Where every line stood is noted before
// the list changes (Vue takes each one out before it reaches the next), and each is held there:
// otherwise all the leaving lines fall onto the same spot.
const stood = new WeakMap<Element, { top: number, left: number, width: number }>()
watch(entries, () => {
  for (const line of listEl.value?.children ?? []) {
    const el = line as HTMLElement
    stood.set(el, { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth })
  }
}, { flush: 'pre' })

function hold(el: Element) {
  const at = stood.get(el)
  if (!at) return
  const line = el as HTMLElement
  line.style.top = `${at.top}px`
  line.style.left = `${at.left}px`
  line.style.width = `${at.width}px`
}

// --- following the reader ----------------------------------------------------------------------
let pointer: { x: number, y: number } | null = null
let quietUntil = 0
let frame = 0

function narrow() {
  return window.matchMedia('(max-width: 899px)').matches
}

function rows() {
  return [...(listEl.value?.querySelectorAll<HTMLElement>('[data-row]') ?? [])]
}

// where the reading line sits: under the stage at the top of the page, at the foot of the window
// at the end of it, so every line on the index passes under it once
function readingLine() {
  const stage = stageEl.value?.getBoundingClientRect()
  const top = stage ? (narrow() ? stage.bottom : stage.top) : 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  return top + 24 + p * (window.innerHeight - top - 48)
}

function follow() {
  frame = 0
  if (opened || performance.now() < quietUntil || !listEl.value) return
  const box = listEl.value.getBoundingClientRect()
  if (pointer && pointer.x >= box.left && pointer.x <= box.right) {
    const row = document.elementFromPoint(pointer.x, pointer.y)?.closest<HTMLElement>('[data-row]')
    if (row?.dataset.row) active.value = row.dataset.row
    return
  }
  const line = readingLine()
  for (const row of rows()) {
    if (row.getBoundingClientRect().bottom >= line) {
      if (row.dataset.row) active.value = row.dataset.row
      return
    }
  }
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(follow)
}

function onPointer(e: PointerEvent) {
  pointer = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null
}

function onPointerOut(e: PointerEvent) {
  if (!e.relatedTarget) pointer = null
}

// keep a line in view without the reading line taking it back
function reveal(slug: string, center = false) {
  const row = listEl.value?.querySelector<HTMLElement>(`[data-row="${slug}"]`)
  const stage = stageEl.value?.getBoundingClientRect()
  if (!row || !stage) return
  const r = row.getBoundingClientRect()
  const top = (narrow() ? stage.bottom : stage.top) + 16
  const bottom = window.innerHeight - 24
  let by = 0
  if (center) by = r.top - (top + (bottom - top) / 2 - r.height / 2)
  else if (r.top < top) by = r.top - top
  else if (r.bottom > bottom) by = r.bottom - bottom
  if (!by) return
  quietUntil = performance.now() + 160
  window.scrollBy({ top: by, behavior: 'instant' })
}

function pick(item: ThingItem) {
  active.value = item.slug
}

function onRowPointer(e: PointerEvent, item: ThingItem) {
  if (e.pointerType === 'mouse') pick(item)
}

function onKey(e: KeyboardEvent) {
  if (opened || e.metaKey || e.ctrlKey || e.altKey) return
  const el = e.target as HTMLElement | null
  if (el?.closest('input, textarea, select, [contenteditable="true"], [role="listbox"]')) return
  if (document.querySelector('[role="dialog"]')) return
  const i = items.findIndex(item => item.slug === active.value)
  let next: ThingItem | undefined
  if (e.key === 'ArrowDown' || e.key === 'j') next = items[Math.min(items.length - 1, i + 1)]
  else if (e.key === 'ArrowUp' || e.key === 'k') next = items[Math.max(0, i - 1)]
  else if (e.key === 'Home') next = items.at(0)
  else if (e.key === 'End') next = items.at(-1)
  else if (e.key === 'Enter' && !el?.closest('button, a') && current.value) {
    e.preventDefault()
    emit('open', current.value)
    return
  }
  if (!next) return
  e.preventDefault()
  active.value = next.slug
  nextTick(() => reveal(next.slug))
  if (el?.closest('[data-row]')) listEl.value?.querySelector<HTMLElement>(`[data-row="${next.slug}"]`)?.focus({ preventScroll: true })
}

// back from a piece: the index is on the one you ended on
watch(() => opened, (slug) => {
  if (slug) {
    active.value = slug
    nextTick(() => reveal(slug, true))
  }
})

// --- the stage leans a little towards the pointer ---------------------------------------------
const lean = { x: 0, y: 0, tx: 0, ty: 0 }
let leanFrame = 0

function paintLean() {
  lean.x += (lean.tx - lean.x) * 0.12
  lean.y += (lean.ty - lean.y) * 0.12
  const el = frameEl.value
  if (el) {
    el.style.setProperty('--lx', lean.x.toFixed(4))
    el.style.setProperty('--ly', lean.y.toFixed(4))
  }
  const settled = Math.abs(lean.tx - lean.x) < 0.001 && Math.abs(lean.ty - lean.y) < 0.001
  leanFrame = settled ? 0 : requestAnimationFrame(paintLean)
}

function onStageMove(e: PointerEvent) {
  if (reduced.value || e.pointerType !== 'mouse' || !frameEl.value) return
  const r = frameEl.value.getBoundingClientRect()
  lean.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))
  lean.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))
  if (!leanFrame) leanFrame = requestAnimationFrame(paintLean)
}

function onStageLeave() {
  lean.tx = 0
  lean.ty = 0
  if (!leanFrame) leanFrame = requestAnimationFrame(paintLean)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('pointerout', onPointerOut, { passive: true })
  window.addEventListener('keydown', onKey)
  nextTick(measureTick)
  // a reload put back halfway down the index: the stage takes the line it came back to
  if (window.scrollY > 0) onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointer)
  document.removeEventListener('pointerout', onPointerOut)
  window.removeEventListener('keydown', onKey)
  cancelAnimationFrame(frame)
  cancelAnimationFrame(leanFrame)
})
</script>

<template>
  <div ref="rootEl" class="index-view" :class="{ arrive: arriving }">
    <section
      v-if="current"
      ref="stageEl"
      class="stage"
      :data-thing="current.slug"
      aria-label="On the stage"
    >
      <button
        type="button"
        class="set"
        :aria-label="`Open ${current.name}, ${current.brand}`"
        @click="emit('open', current)"
        @pointermove="onStageMove"
        @pointerleave="onStageLeave"
      >
        <span ref="frameEl" class="frame">
          <span class="mark tl" aria-hidden="true" />
          <span class="mark tr" aria-hidden="true" />
          <span class="mark bl" aria-hidden="true" />
          <span class="mark br" aria-hidden="true" />
          <span class="pl" aria-hidden="true">PL. {{ plate(current) }}</span>
          <span class="contact" aria-hidden="true" />
          <span class="plate" data-thing-media>
            <Transition :name="swap">
              <span :key="current.slug" class="shot">
                <ThingsCutout :item="current" priority />
              </span>
            </Transition>
          </span>
        </span>
      </button>

      <div class="caption">
        <p :key="`b-${current.slug}`" class="cap-brand in">
          {{ current.brand }}
        </p>
        <p :key="`n-${current.slug}`" class="cap-name in">
          {{ current.name }}
        </p>
        <p class="cap-meta">
          <span class="cap-price"><ThingsPrice :price="current.price" /></span>
          <span v-if="detail" :key="`d-${current.slug}`" class="cap-detail in">{{ detail }}</span>
        </p>
      </div>

      <p class="keys" aria-hidden="true">
        <kbd>↑</kbd><kbd>↓</kbd> to browse <span class="sep">·</span> <kbd>↵</kbd> to open
      </p>
    </section>

    <div ref="listEl" class="index">
      <span
        v-if="tickY !== null"
        class="tick"
        aria-hidden="true"
        :style="{ transform: `translateY(${tickY}px)` }"
      />
      <TransitionGroup name="rows" @before-leave="hold">
        <template v-for="(entry, i) in entries" :key="entry.key">
          <h2 v-if="entry.head" class="head" :style="{ '--i': i }">
            <span class="numeral" aria-hidden="true">{{ entry.head.numeral }}</span>
            <span class="label">{{ entry.head.label }}</span>
            <span class="rule" aria-hidden="true" />
            <span class="count">{{ entry.head.count }}</span>
          </h2>
          <button
            v-else-if="entry.item"
            type="button"
            class="row"
            :class="{ on: entry.item.slug === current?.slug }"
            :data-row="entry.item.slug"
            :aria-current="entry.item.slug === current?.slug ? 'true' : undefined"
            :style="{ '--i': i }"
            @pointerenter="onRowPointer($event, entry.item)"
            @focus="pick(entry.item)"
            @click="emit('open', entry.item)"
          >
            <span class="no">{{ plate(entry.item) }}</span>
            <span class="text">
              <span class="name">{{ entry.item.name }}</span>
              <span class="brand">{{ entry.item.brand }}</span>
            </span>
            <span class="lead" aria-hidden="true" />
            <span class="price">{{ formatPrice(entry.item.price) }}</span>
          </button>
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.index-view {
  --ink: #111111;
  --mute: #6B6B6B;
  --dim: #9A978F;
  --hair: #E8E6E1;
  --red: #CD1919;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
  width: 100%;
  max-width: 1480px;
  margin-inline: auto;
}

/* --- the stage ------------------------------------------------------------------------------ */
.stage {
  position: sticky;
  top: var(--chrome-h, 72px);
  z-index: 1;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  height: calc(100dvh - var(--chrome-h, 72px));
  padding: 28px 40px 28px 56px;
  box-sizing: border-box;
}
.set {
  position: relative;
  min-height: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  box-shadow: none;
  user-select: none;
  -webkit-user-select: none;
  container-type: size;
  -webkit-tap-highlight-color: transparent;
}
/* the plate, as large as the stage allows, 4:5, with room around it for the corner marks */
.frame {
  --lx: 0;
  --ly: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  height: min(100cqh - 48px, 640px, (100cqw - 48px) * 1.25);
  aspect-ratio: 4 / 5;
  translate: -50% -50%;
}
.plate {
  position: absolute;
  inset: 0;
  display: block;
  transform: perspective(1400px) rotateY(calc(var(--lx) * 5deg)) rotateX(calc(var(--ly) * -3.5deg)) translate3d(calc(var(--lx) * -4px), calc(var(--ly) * -3px), 0);
  will-change: transform;
}
.shot {
  position: absolute;
  inset: 0;
  display: grid;
  padding: 7% 7% 9%;
  box-sizing: border-box;
}
/* on the stage a piece stands on the floor, over its shadow, rather than floating in the frame */
.shot :deep(.object) {
  object-position: 50% 100%;
}
.contact {
  position: absolute;
  left: 50%;
  bottom: 4%;
  width: 52%;
  height: 18px;
  translate: calc(-50% + var(--lx, 0) * 8px) 0;
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.2) 0%, rgb(32 24 16 / 0) 72%);
  filter: blur(10px);
  pointer-events: none;
}
/* the plate's corners, marked as on a print to be trimmed */
.mark {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 0 solid #CFCBC3;
  pointer-events: none;
}
.mark.tl { top: -14px; left: -14px; border-top-width: 1px; border-left-width: 1px; transform-origin: top left; }
.mark.tr { top: -14px; right: -14px; border-top-width: 1px; border-right-width: 1px; transform-origin: top right; }
.mark.bl { bottom: -14px; left: -14px; border-bottom-width: 1px; border-left-width: 1px; transform-origin: bottom left; }
.mark.br { bottom: -14px; right: -14px; border-bottom-width: 1px; border-right-width: 1px; transform-origin: bottom right; }
.pl {
  position: absolute;
  top: 2px;
  left: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--dim);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.caption {
  display: grid;
  gap: 6px;
  padding-top: 24px;
  min-width: 0;
}
.cap-brand {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dim);
}
.cap-name {
  margin: 0;
  font-family: var(--font-redaction);
  font-size: clamp(26px, 2.6vw, 36px);
  line-height: 1.1;
  color: var(--ink);
  text-wrap: balance;
}
.cap-meta {
  display: flex;
  align-items: baseline;
  gap: 14px;
  min-width: 0;
  margin: 4px 0 0;
}
.cap-price {
  flex: none;
  font-family: var(--font-redaction);
  font-size: 18px;
  color: var(--dim);
  font-variant-numeric: tabular-nums;
}
.cap-detail {
  min-width: 0;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--mute);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.in {
  animation: caption-in 420ms var(--ease) both;
}
.keys {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 18px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--dim);
}
.keys kbd {
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border: 1px solid var(--hair);
  border-radius: 4px;
  background: #FFFFFF;
  font: inherit;
  color: var(--mute);
}
.keys .sep {
  margin-inline: 4px;
}

/* --- the index ------------------------------------------------------------------------------ */
.index {
  position: relative;
  padding: 36px 48px 96px 16px;
  min-width: 0;
}
.tick {
  position: absolute;
  top: -7px;
  left: 0;
  width: 1px;
  height: 14px;
  background: var(--red);
  transition: transform 260ms var(--ease);
  pointer-events: none;
}
.head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 44px 0 10px;
  line-height: 24px;
}
.head:first-of-type {
  margin-top: 0;
}
.numeral {
  width: 28px;
  flex: none;
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 15px;
  font-weight: 400;
  color: var(--red);
  user-select: none;
}
.label,
.count {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mute);
}
.count {
  color: var(--dim);
  font-variant-numeric: tabular-nums;
}
.rule {
  flex: 1;
  height: 1px;
  align-self: center;
  background: var(--hair);
}
.row {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 12px;
  width: 100%;
  padding: 9px 0;
  border: 0;
  background: transparent;
  text-align: left;
  color: var(--ink);
  cursor: zoom-in;
  box-shadow: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}
/* a line pressed or focused keeps its place and its ground: only the tick and the number say so */
.row:focus,
.row:focus-visible {
  outline: none;
  box-shadow: none;
}
.row:focus-visible .name {
  text-decoration: underline;
  text-decoration-color: var(--red);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}
.no {
  width: 28px;
  flex: none;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--dim);
  font-variant-numeric: tabular-nums;
  transition: color 160ms var(--ease);
}
.row.on .no {
  color: var(--red);
}
.text {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  flex: 0 1 auto;
  overflow: hidden;
}
.name {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  font-size: 15px;
  line-height: 22px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.brand {
  flex: none;
  font-size: 15px;
  line-height: 22px;
  color: var(--mute);
  white-space: nowrap;
}
.lead {
  flex: 1 1 16px;
  min-width: 16px;
  align-self: center;
  height: 1px;
  translate: 0 4px;
  background-image: radial-gradient(circle, #C9C5BC 0.6px, transparent 0.8px);
  background-size: 5px 1px;
  background-repeat: repeat-x;
  opacity: 0.9;
}
/* the price is there to be read, not announced: it stays quiet beside the name */
.price {
  flex: none;
  font-family: var(--font-redaction);
  font-size: 15px;
  color: #BDB9B0;
  font-variant-numeric: tabular-nums;
  transition: color 160ms var(--ease);
}
.row.on .price {
  color: var(--dim);
}
@media (hover: hover) {
  .row:hover .name {
    text-decoration: underline;
    text-decoration-color: var(--red);
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }
}

/* --- swapping the piece on the stage -------------------------------------------------------- */
.rise-enter-active,
.rise-leave-active,
.fall-enter-active,
.fall-leave-active {
  transition: opacity 300ms var(--ease), transform 420ms var(--ease), filter 300ms var(--ease);
}
.rise-enter-from { opacity: 0; transform: translateY(22px) scale(0.985); filter: blur(4px); }
.rise-leave-to { opacity: 0; transform: translateY(-14px) scale(1.01); filter: blur(4px); }
.fall-enter-from { opacity: 0; transform: translateY(-22px) scale(0.985); filter: blur(4px); }
.fall-leave-to { opacity: 0; transform: translateY(14px) scale(1.01); filter: blur(4px); }

/* --- rows that come, go and change places --------------------------------------------------- */
.rows-move {
  transition: transform 560ms var(--ease);
}
.rows-enter-active {
  transition: opacity 360ms var(--ease) 120ms, transform 420ms var(--ease) 120ms;
}
.rows-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.rows-leave-active {
  position: absolute;
  margin: 0;
  transition: opacity 180ms var(--ease);
  pointer-events: none;
}
.rows-leave-to {
  opacity: 0;
}

/* --- the arrival ---------------------------------------------------------------------------- */
.arrive .row,
.arrive .head {
  animation: line-in 760ms var(--ease) both;
  animation-delay: calc(min(var(--i), 22) * 26ms + 260ms);
}
.arrive .plate {
  animation: settle 1100ms var(--ease) 120ms both;
}
.arrive .contact {
  animation: land 1100ms var(--ease) 120ms both;
}
.arrive .mark {
  animation: draw 700ms var(--ease) both;
  animation-delay: 620ms;
}
.arrive .mark.tr { animation-delay: 700ms; }
.arrive .mark.br { animation-delay: 780ms; }
.arrive .mark.bl { animation-delay: 860ms; }
.arrive .pl,
.arrive .caption,
.arrive .keys {
  animation: line-in 760ms var(--ease) both;
  animation-delay: 560ms;
}
.arrive .keys {
  animation-delay: 1100ms;
}
.arrive .in {
  animation: none;
}

@keyframes line-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
@keyframes settle {
  from { opacity: 0; transform: perspective(1400px) translate3d(0, -28px, 0) rotateX(6deg); }
  to { opacity: 1; }
}
@keyframes land {
  from { opacity: 0; transform: scaleX(0.4); }
  to { opacity: 1; transform: none; }
}
@keyframes draw {
  from { transform: scale(0); opacity: 0; }
  to { transform: none; opacity: 1; }
}
@keyframes caption-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .arrive .row,
  .arrive .head,
  .arrive .plate,
  .arrive .contact,
  .arrive .mark,
  .arrive .pl,
  .arrive .caption,
  .arrive .keys,
  .in {
    animation: none;
  }
  .tick,
  .rows-move {
    transition: none;
  }
}

@media (hover: none), (max-width: 1099px) {
  .keys {
    display: none;
  }
}

/* --- a phone: the stage above, the index running under it ----------------------------------- */
@media (max-width: 899px) {
  .index-view {
    display: block;
  }
  .stage {
    top: var(--chrome-h, 96px);
    z-index: 3;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
    height: clamp(260px, 44svh, 420px);
    padding: 18px 16px 14px;
    background: #FAF9F7;
    border-bottom: 1px solid var(--hair);
  }
  .frame {
    height: min(100cqh - 8px, 360px, 100cqw * 1.25);
  }
  .mark {
    display: none;
  }
  .caption {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 2px 12px;
    padding-top: 10px;
  }
  .cap-brand {
    grid-column: 1;
    grid-row: 1;
  }
  .cap-name {
    grid-column: 1;
    grid-row: 2;
    overflow: hidden;
    font-size: 20px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cap-meta {
    grid-column: 2;
    grid-row: 2;
    margin: 0;
  }
  .cap-detail {
    display: none;
  }
  .cap-price {
    font-size: 18px;
  }
  .index {
    padding: 22px 16px calc(40px + 30svh);
  }
  .head {
    margin-top: 32px;
  }
  .row {
    gap: 10px;
    padding: 11px 0;
  }
  .no {
    width: 22px;
  }
  .text {
    flex-direction: column;
    gap: 1px;
  }
  .name {
    font-size: 15px;
  }
  .brand {
    font-family: var(--font-mono);
    font-size: 10px;
    line-height: 16px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .lead {
    visibility: hidden;
  }
}
</style>
