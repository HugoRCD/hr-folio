<script setup lang="ts">
// How much of the sheet's construction shows, from the fair copy to the working drawing, the
// default. In the colophon, four small sheets, each drawn the way the page would be: the fair copy,
// then its scale, its columns, its measurements. Pick one, or press D anywhere to step through.
// Remembered on this device.
const LEVELS = ['Fair copy', 'Scale', 'Grid', 'Drawing'] as const
const STORE = 'folio-detail'

const detail = useState<number>('detail', () => 3)

function onKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() !== 'd' || e.metaKey || e.ctrlKey || e.altKey) return
  const t = e.target
  if (t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"]')) return
  detail.value = (detail.value + 1) % LEVELS.length
}

// arrows move between the sheets, as in any set of choices
function onArrow(e: KeyboardEvent) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!step) return
  e.preventDefault()
  detail.value = (detail.value + step + LEVELS.length) % LEVELS.length
  const buttons = (e.currentTarget as HTMLElement).querySelectorAll('button')
  buttons[detail.value]?.focus()
}

// the Geneva wheel under the sheets turns a step a level: changed by hand, the page's corner lifts
// for a moment to show it (see PagePeel). Not for the level restored on arrival.
const peek = useState<string | null>('peel-peek', () => null)
let ready = false
let showWheel: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  // nothing saved is not level 0: a first visit keeps the default
  const raw = localStorage.getItem(STORE)
  const saved = raw === null ? Number.NaN : Number(raw)
  if (Number.isInteger(saved) && saved >= 0 && saved < LEVELS.length) detail.value = saved
  window.addEventListener('keydown', onKey)
  nextTick(() => (ready = true))
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(showWheel)
})
watch(detail, (level) => {
  try {
    localStorage.setItem(STORE, String(level))
  } catch {
    // private mode: the choice lasts for the visit
  }
  if (!ready) return
  clearTimeout(showWheel)
  showWheel = setTimeout(() => (peek.value = 'geneva'), 450)
})
</script>

<template>
  <div class="flex items-center gap-2.5">
    <div
      class="sheets flex items-center gap-1"
      role="radiogroup"
      aria-label="Detail of the drawing"
      data-mech="detail"
      @keydown="onArrow"
    >
      <button
        v-for="(name, i) in LEVELS"
        :key="name"
        type="button"
        role="radio"
        class="sheet"
        :class="{ on: i === detail }"
        :aria-checked="i === detail"
        :aria-label="name"
        :title="`${name} (D)`"
        :tabindex="i === detail ? 0 : -1"
        @click="detail = i"
      >
        <!-- a page, 11 by 14, and what this level adds to it; every line on a whole pixel -->
        <svg width="11" height="14" viewBox="0 0 11 14" aria-hidden="true">
          <rect x="0.5" y="0.5" width="10" height="13" :class="{ adds: i === 0 }" />
          <path v-if="i >= 1" d="M2 3.5H9M2.5 2.5V4.5M5.5 2.5V4.5M8.5 2.5V4.5" :class="{ adds: i === 1 }" />
          <path v-if="i >= 2" d="M4.5 5.5V9.5M6.5 5.5V9.5" :class="{ adds: i === 2 }" />
          <path v-if="i >= 3" d="M2 11.5H9M2.5 10.5V12.5M8.5 10.5V12.5" :class="{ adds: i === 3 }" />
        </svg>
      </button>
    </div>
    <output class="level hidden w-[60px] uppercase tracking-[0.06em] sm:inline" aria-live="polite">{{ LEVELS[detail] }}</output>
  </div>
</template>

<style scoped>
.sheet {
  display: grid;
  place-items: center;
  padding: 3px 1px;
  color: color-mix(in oklab, var(--ui-text-muted) 45%, var(--ui-bg));
  cursor: pointer;
  transition: color 0.3s ease;
}
.sheet:hover {
  color: var(--ui-text-muted);
}
.sheet.on {
  color: var(--ui-text-highlighted);
}
.sheet:focus-visible {
  outline: 1px solid color-mix(in oklab, var(--ui-primary) 60%, transparent);
  outline-offset: 1px;
}
svg {
  display: block;
  overflow: visible;
}
rect,
path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
  shape-rendering: crispEdges;
}
/* on the chosen sheet, what its level adds is in red */
.sheet.on .adds {
  stroke: var(--ui-primary);
}
.level {
  color: var(--ui-text-muted);
}
@media (prefers-reduced-motion: reduce) {
  .sheet {
    transition: none;
  }
}
</style>
