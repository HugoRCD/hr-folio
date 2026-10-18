<script setup lang="ts">
import type { FolioWritingListItem } from '~/types/folio-lists'

type SortMode = 'newest' | 'a-z'

const { limit = 0 } = defineProps<{
  limit?: number
}>()

const isFullPage = computed(() => limit === 0)
const route = useRoute()
const router = useRouter()

const searchQuery = ref((route.query.q as string) || '')
const sortMode = ref<SortMode>('newest')
const selectedTags = ref<string[]>([])

const { data: allPosts } = await useFetch<FolioWritingListItem[]>('/api/folio/writing', {
  key: 'folio-writing-list',
})

const allTags = computed(() => {
  if (!allPosts.value) return []
  const tagSet = new Set<string>()
  allPosts.value.forEach((p) => {
    if (p.tags) p.tags.forEach((t: string) => tagSet.add(t))
  })
  return [...tagSet].sort()
})

const posts = computed(() => {
  if (!allPosts.value) return []

  let items = [...allPosts.value]

  if (isFullPage.value) {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      items = items.filter(p =>
        p.title.toLowerCase().includes(q)
        || p.description?.toLowerCase().includes(q)
        || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      )
    }

    if (selectedTags.value.length) {
      items = items.filter(p =>
        p.tags && selectedTags.value.every(t => p.tags!.includes(t))
      )
    }

    if (sortMode.value === 'a-z') {
      items.sort((a, b) => a.title.localeCompare(b.title))
    }
  } else {
    items = items.slice(0, limit)
  }

  return items
})

const showViewAll = computed(() => limit > 0)

watch(searchQuery, (q) => {
  if (!isFullPage.value) return
  const query: Record<string, string> = {}
  if (q) query.q = q
  router.replace({ query })
})

const toolbarRef = ref<{ searchInput: HTMLInputElement | null } | null>(null)
const searchInputRef = computed(() => toolbarRef.value?.searchInput ?? null)

const { highlightedIndex } = isFullPage.value
  ? useListNavigation(
    computed(() => posts.value.map(p => ({ path: p.path }))),
    searchInputRef as Ref<HTMLInputElement | null>,
  )
  : { highlightedIndex: ref(-1) }
</script>

<template>
  <section class="relative flex flex-col">
    <SectionMark :numeral="limit > 0 ? 'IV' : '§'" label="Writing" :as="limit > 0 ? 'h3' : 'h1'" />

    <div v-if="isFullPage" class="in-note top-2 mb-3 flex items-center justify-end lg:mb-0 lg:h-6 lg:justify-start">
      <ListToolbar
        ref="toolbarRef"
        :count="posts.length"
        label="articles"
        :tags="allTags"
        :search="searchQuery"
        :sort="sortMode"
        :selected-tags
        @update:search="searchQuery = $event"
        @update:sort="sortMode = $event"
        @update:selected-tags="selectedTags = $event"
      />
    </div>

    <ol class="flex flex-col">
      <li v-for="(post, index) in posts" :key="post.path" class="relative">
        <NuxtLink
          :to="post.path"
          class="group flex items-baseline gap-3 py-2"
          :class="{ 'bg-muted/5': highlightedIndex === index }"
        >
          <span class="flex min-w-0 items-baseline">
            <span class="in-gutter font-mono text-[10px] tabular-nums text-muted/40" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="min-w-0 truncate font-medium text-highlighted decoration-primary underline-offset-4 group-hover:underline">{{ post.title }}</span>
          </span>
          <span class="leader" aria-hidden="true" />
          <span v-if="isFullPage && post.readingMinutes" class="shrink-0 font-mono text-xs tabular-nums text-muted/40">{{ post.readingMinutes }} min</span>
          <time :datetime="post.date" class="shrink-0 font-mono text-xs tabular-nums text-muted/70">{{ new Date(post.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' }) }}</time>
        </NuxtLink>
      </li>
    </ol>
    <NuxtLink
      v-if="showViewAll"
      to="/writing"
      class="mt-2 self-start font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50 transition-colors hover:text-highlighted"
    >
      All writing &rarr;
    </NuxtLink>
  </section>
</template>
