<script setup lang="ts">
// How much of the sheet's construction shows, from the fair copy to the working drawing.
// A small ruler in the colophon; D steps through it from anywhere. Remembered on this device.
const LEVELS = ['Fair copy', 'Scale', 'Grid', 'Drawing'] as const
const STORE = 'folio-detail'

const detail = useState<number>('detail', () => 1)
const id = useId()

function onKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() !== 'd' || e.metaKey || e.ctrlKey || e.altKey) return
  const t = e.target as HTMLElement | null
  if (t?.closest('input:not([type="range"]), textarea, select, [contenteditable="true"]')) return
  detail.value = (detail.value + 1) % LEVELS.length
}

onMounted(() => {
  const saved = Number(localStorage.getItem(STORE))
  if (Number.isInteger(saved) && saved >= 0 && saved < LEVELS.length) detail.value = saved
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
watch(detail, (level) => {
  try {
    localStorage.setItem(STORE, String(level))
  } catch {
    // private mode: the choice lasts for the visit
  }
})

const at = (i: number) => `${(i / (LEVELS.length - 1)) * 100}%`
</script>

<template>
  <div class="flex items-center gap-2.5" :title="`Detail: ${LEVELS[detail]} (D)`">
    <div class="ruler" :style="{ '--at': at(detail) }">
      <span class="track" />
      <span v-for="(_, i) in LEVELS" :key="i" class="tick" :class="{ past: i <= detail }" :style="{ left: at(i) }" />
      <span class="hand" />
      <input
        :id
        v-model.number="detail"
        type="range"
        min="0"
        :max="LEVELS.length - 1"
        step="1"
        aria-label="Detail"
        :aria-valuetext="LEVELS[detail]"
      >
    </div>
    <output :for="id" class="min-w-[9ch] font-mono text-[10px] uppercase tracking-[0.06em]">{{ LEVELS[detail] }}</output>
  </div>
</template>

<style scoped>
.ruler {
  position: relative;
  width: 30px;
  height: 12px;
}
.track {
  position: absolute;
  inset-inline: 0;
  top: 8px;
  height: 1px;
  background: color-mix(in oklab, currentColor 35%, transparent);
}
.tick {
  position: absolute;
  top: 5px;
  width: 1px;
  height: 3px;
  margin-left: -0.5px;
  background: color-mix(in oklab, currentColor 35%, transparent);
  transition: background-color 0.4s ease;
}
.tick.past {
  background: currentColor;
}
.hand {
  position: absolute;
  top: 1px;
  left: var(--at);
  width: 1.5px;
  height: 8px;
  margin-left: -0.75px;
  background: var(--ui-primary);
  transition: left 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}
/* the native range does the work, invisibly: pointer, keyboard, screen readers */
input {
  position: absolute;
  inset: -6px;
  width: calc(100% + 12px);
  height: calc(100% + 12px);
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  appearance: none;
  background: transparent;
}
/* a 12px thumb on a range 12px wider than the ruler: its centre travels exactly the ruler */
input::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
}
input::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 0;
}
.ruler:has(input:focus-visible) {
  outline: 1px solid color-mix(in oklab, var(--ui-primary) 60%, transparent);
  outline-offset: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .tick, .hand {
    transition: none;
  }
}
</style>
