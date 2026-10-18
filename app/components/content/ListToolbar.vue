<script setup lang="ts">
// The list's count, and what finds in it. Opened (the lens, or / anywhere), a small sheet is laid
// over the margin under the count, drawn like the rest: a ruled line to write on, the order and
// the subjects marked with the same ticks as the tabs, crop marks at its corners. Esc, a click
// elsewhere, or the lens again puts it away.
type SortMode = 'newest' | 'a-z'

const {
  count = 0,
  label = 'items',
  tags = [],
  sort = 'newest',
  search = '',
  selectedTags = [],
} = defineProps<{
  count?: number
  label?: string
  tags?: string[]
  sort?: SortMode
  search?: string
  selectedTags?: string[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:sort': [value: SortMode]
  'update:selectedTags': [value: string[]]
}>()

const isOpen = ref(false)
const root = useTemplateRef<HTMLElement>('root')
const searchInput = ref<HTMLInputElement | null>(null)

function toggleTag(tag: string) {
  const current = [...selectedTags]
  const idx = current.indexOf(tag)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(tag)
  emit('update:selectedTags', current)
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
    return
  }
  const t = e.target
  if (t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"]')) return
  if (e.key === '/' && !isOpen.value) {
    e.preventDefault()
    isOpen.value = true
  }
})
onClickOutside(root, () => (isOpen.value = false))

// Wider than the note margin it opens from, so on wide screens it keeps to the margin's right
// edge (the page's) and reaches left over the gutter, rather than hanging off the sheet.
const shift = ref(0)
watch(isOpen, (open) => {
  if (!open) return
  const el = root.value
  if (el && window.innerWidth >= 1024) {
    const edge = el.closest('.in-note')?.getBoundingClientRect().right ?? window.innerWidth - 24
    shift.value = Math.min(0, Math.round(edge - el.getBoundingClientRect().left - 256))
  } else shift.value = 0
  nextTick(() => searchInput.value?.focus())
})

const noun = computed(() => count === 1 ? label.replace(/s$/, '') : label)
const hasActiveFilters = computed(() => !!search || selectedTags.length > 0)
const clear = () => {
  emit('update:search', '')
  emit('update:selectedTags', [])
}

defineExpose({ searchInput })
</script>

<template>
  <div ref="root" class="toolbar relative flex items-center gap-2">
    <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50">{{ count }} {{ noun }}</span>
    <button
      type="button"
      class="lens relative transition-colors"
      :class="hasActiveFilters || isOpen ? 'text-primary' : 'text-muted/40 hover:text-muted/60'"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? 'Close the search' : `Search the ${label}`"
      @click="isOpen = !isOpen"
    >
      <UIcon name="i-lucide-search" class="size-3.5" />
      <span v-if="hasActiveFilters" class="absolute -right-0.5 -top-0.5 size-1 rounded-full bg-primary" />
    </button>

    <Transition name="unroll">
      <div v-if="isOpen" class="finder" :style="shift ? { left: `${shift}px` } : undefined" role="dialog" :aria-label="`Search the ${label}`">
        <span class="crop tl" aria-hidden="true" /><span class="crop tr" aria-hidden="true" />
        <span class="crop bl" aria-hidden="true" /><span class="crop br" aria-hidden="true" />

        <label class="find">
          <span class="title">Find</span>
          <input
            ref="searchInput"
            type="text"
            :value="search"
            :placeholder="`in ${count} ${noun}`"
            spellcheck="false"
            autocomplete="off"
            @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          >
          <button type="button" class="esc" tabindex="-1" @click="isOpen = false">esc</button>
        </label>

        <div class="row order">
          <span class="key">Order</span>
          <button
            v-for="mode in (['newest', 'a-z'] as const)"
            :key="mode"
            type="button"
            class="option"
            :class="{ on: sort === mode }"
            :aria-pressed="sort === mode"
            @click="emit('update:sort', mode)"
          >
            <span class="tick" aria-hidden="true" />{{ mode === 'a-z' ? 'a–z' : mode }}
          </button>
          <button v-if="hasActiveFilters" type="button" class="clear" @click="clear">
            clear
          </button>
        </div>

        <div v-if="tags.length" class="row subjects">
          <span class="key">Subjects</span>
          <span class="tags">
            <button
              v-for="tag in tags"
              :key="tag"
              type="button"
              class="tag"
              :class="{ on: selectedTags.includes(tag) }"
              :aria-pressed="selectedTags.includes(tag)"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* a small sheet on the page, drawn like the index: the paper's own ground, a hairline frame,
   crop marks off its corners, the field to write on ruled in red */
.finder {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  z-index: 40;
  width: min(300px, calc(100vw - 48px));
  background: var(--ui-bg);
  border: 1px solid color-mix(in oklab, var(--ui-text) 24%, var(--ui-bg));
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
}
@media (min-width: 1024px) {
  /* in the note margin, from the count's left edge */
  .finder {
    right: auto;
    left: 0;
    width: 256px;
  }
}
.crop {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 0 solid color-mix(in oklab, var(--ui-text) 40%, var(--ui-bg));
  pointer-events: none;
}
.crop.tl { top: -5px; left: -5px; border-top-width: 1px; border-left-width: 1px; }
.crop.tr { top: -5px; right: -5px; border-top-width: 1px; border-right-width: 1px; }
.crop.bl { bottom: -5px; left: -5px; border-bottom-width: 1px; border-left-width: 1px; }
.crop.br { bottom: -5px; right: -5px; border-bottom-width: 1px; border-right-width: 1px; }

.find {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid var(--ui-primary);
}
.find .title {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 14px;
  letter-spacing: 0;
  color: var(--ui-primary);
}
.find input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  border-radius: 0;
  background: transparent;
  outline: none;
  box-shadow: none;
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--ui-text-highlighted);
}
.find input::placeholder {
  color: var(--ui-text-dimmed);
}
.esc,
.key,
.clear {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-dimmed);
}
.esc:hover {
  color: var(--ui-text-highlighted);
}

.row {
  padding: 8px 12px;
}
.row + .row {
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 10%, var(--ui-bg));
}
.order {
  display: flex;
  align-items: center;
  gap: 12px;
}
.order .key {
  width: 56px;
}
.clear {
  margin-left: auto;
  color: var(--ui-primary);
}
.subjects .key {
  display: block;
  margin-bottom: 4px;
}

/* the order, ticked like the tabs: red when chosen */
.option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 20px;
  color: var(--ui-text-dimmed);
  transition: color 0.2s ease;
}
.option:hover,
.option.on {
  color: var(--ui-text-highlighted);
}
.tick {
  width: 12px;
  height: 1px;
  background: color-mix(in oklab, currentColor 35%, var(--ui-bg));
  transform: scaleX(0.67);
  transform-origin: left;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.option.on .tick {
  background: var(--ui-primary);
  transform: none;
}

/* the subjects as words in a line, underlined in red when chosen */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  max-height: 104px;
  overflow-y: auto;
}
.tag {
  line-height: 20px;
  color: var(--ui-text-dimmed);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
}
.tag:hover {
  color: var(--ui-text-highlighted);
}
.tag.on {
  color: var(--ui-text-highlighted);
  text-decoration-color: var(--ui-primary);
}
.option:focus-visible,
.tag:focus-visible,
.esc:focus-visible,
.clear:focus-visible {
  outline: 1px dotted var(--ui-primary);
  outline-offset: 2px;
}

/* laid down from the top edge, as a sheet is unrolled; taken up the same way */
.unroll-enter-active,
.unroll-leave-active {
  transition: clip-path 0.32s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.2s ease;
}
.unroll-enter-from,
.unroll-leave-to {
  clip-path: inset(-8px -8px 100% -8px);
  opacity: 0;
}
.unroll-enter-to,
.unroll-leave-from {
  clip-path: inset(-8px -8px -8px -8px);
}
@media (prefers-reduced-motion: reduce) {
  .unroll-enter-active,
  .unroll-leave-active,
  .tick,
  .option,
  .tag {
    transition: none;
  }
}
</style>
