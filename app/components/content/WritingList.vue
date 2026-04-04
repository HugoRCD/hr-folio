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
  credentials: 'include',
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
  <div class="flex flex-col gap-6">
    <component :is="limit > 0 ? 'h3' : 'h1'" class="font-serif text-lg italic text-highlighted">
      Writing<span class="text-primary">.</span>
    </component>

    <div v-if="isFullPage" class="flex justify-end">
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

    <div class="flex flex-col">
      <NuxtLink
        v-for="(post, index) in posts"
        :key="post.path"
        :to="post.path"
        class="group flex items-baseline justify-between gap-4 py-2 animate-in opacity-0"
        :class="{ 'bg-muted/5': highlightedIndex === index }"
        :style="{ animationDelay: `${index * 40}ms` }"
      >
        <span class="flex min-w-0 items-center gap-2 font-medium text-highlighted decoration-primary group-hover:underline">
          <span class="truncate">{{ post.title }}</span>
          <UBadge
            v-if="post.draft"
            size="xs"
            color="warning"
            variant="subtle"
            class="shrink-0"
          >
            Draft
          </UBadge>
        </span>
        <span class="flex shrink-0 items-baseline gap-2 text-sm text-muted/60">
          <span v-if="isFullPage && post.readingMinutes" class="text-muted/30">{{ post.readingMinutes }} min</span>
          {{ new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) }}
        </span>
      </NuxtLink>
    </div>
    <NuxtLink
      v-if="showViewAll"
      to="/writing"
      class="text-sm text-muted/50 transition-colors hover:text-highlighted"
    >
      All writing &rarr;
    </NuxtLink>
  </div>
</template>
