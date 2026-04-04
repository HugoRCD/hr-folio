<script setup lang="ts">
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
const searchInput = ref<HTMLInputElement | null>(null)

function toggleTag(tag: string) {
  const current = [...selectedTags]
  const idx = current.indexOf(tag)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(tag)
  emit('update:selectedTags', current)
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === '/' && document.activeElement !== searchInput.value && !isOpen.value) {
    e.preventDefault()
    isOpen.value = true
  }
})

watch(isOpen, (open) => {
  if (open) nextTick(() => searchInput.value?.focus())
})

const hasActiveFilters = computed(() => !!search || selectedTags.length > 0)

defineExpose({ searchInput })
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-[11px] text-muted/50">{{ count }} {{ label }}</span>
    <UPopover v-model:open="isOpen" :content="{ align: 'end', side: 'bottom', sideOffset: 8 }">
      <button
        class="relative transition-colors"
        :class="hasActiveFilters ? 'text-primary' : 'text-muted/40 hover:text-muted/60'"
      >
        <UIcon name="i-lucide-search" class="size-3.5" />
        <span
          v-if="hasActiveFilters"
          class="absolute -right-0.5 -top-0.5 size-1 rounded-full bg-primary"
        />
      </button>
      <template #content>
        <div class="flex w-64 flex-col gap-3 p-3">
          <div class="relative">
            <input
              ref="searchInput"
              type="text"
              :value="search"
              placeholder="Search..."
              class="w-full border-0 border-b border-muted/20 bg-transparent py-1 text-sm text-highlighted outline-hidden placeholder:text-muted/50 focus:border-primary/40"
              @input="emit('update:search', ($event.target as HTMLInputElement).value)"
            >
            <kbd class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-muted/30">/</kbd>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-[11px]">
              <button
                :class="sort === 'newest' ? 'text-highlighted' : 'text-muted/50 hover:text-muted/70'"
                @click="emit('update:sort', 'newest')"
              >
                newest
              </button>
              <span class="text-muted/30">·</span>
              <button
                :class="sort === 'a-z' ? 'text-highlighted' : 'text-muted/50 hover:text-muted/70'"
                @click="emit('update:sort', 'a-z')"
              >
                a-z
              </button>
            </div>
            <button
              v-if="hasActiveFilters"
              class="text-[11px] text-muted/50 hover:text-muted/70"
              @click="emit('update:search', ''); emit('update:selectedTags', [])"
            >
              clear
            </button>
          </div>
          <div v-if="tags.length" class="flex flex-wrap gap-x-2 gap-y-1">
            <button
              v-for="tag in tags"
              :key="tag"
              class="text-[11px] transition-colors"
              :class="selectedTags.includes(tag) ? 'text-primary' : 'text-muted/50 hover:text-muted/70'"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
