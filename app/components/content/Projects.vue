<script setup lang="ts">
const { featured = false } = defineProps<{
  featured?: boolean
}>()

type Tab = 'all' | 'projects' | 'work'
type SortMode = 'newest' | 'a-z'

const route = useRoute()
const router = useRouter()

const validTabs: Tab[] = ['all', 'projects', 'work']
const defaultTab: Tab = featured ? 'projects' : 'all'
const initialTab = validTabs.includes(route.query.tab as Tab) ? (route.query.tab as Tab) : defaultTab
const activeTab = ref<Tab>(initialTab)

const searchQuery = ref((route.query.q as string) || '')
const sortMode = ref<SortMode>('newest')
const selectedTags = ref<string[]>([])

watch(activeTab, (tab) => {
  if (!featured) {
    const query: Record<string, string> = {}
    if (tab !== 'all') query.tab = tab
    if (searchQuery.value) query.q = searchQuery.value
    router.replace({ query })
  }
  nextTick(() => {
    displayedProjects.value.forEach((p) => {
      preloadImage(getScreenshot(p))
    })
  })
})

watch(searchQuery, (q) => {
  if (!featured) {
    const query: Record<string, string> = {}
    if (activeTab.value !== 'all') query.tab = activeTab.value
    if (q) query.q = q
    router.replace({ query })
  }
})

const { data: allProjects } = await useAsyncData('projects', () =>
  queryCollection('works')
    .order('date', 'DESC')
    .all()
)

const featuredNames = ['Evlog', 'Shelve', 'Canvas', 'GitHub Tools']
const featuredWorkNames = ['Nuxt MCP Toolkit', 'Docus', 'Nuxt.com', 'Nuxt UI']

const tabs: { key: Tab, label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'projects', label: 'Projects' },
  { key: 'work', label: 'At Work' },
]

const allTags = computed(() => {
  if (!allProjects.value) return []
  const tagSet = new Set<string>()
  allProjects.value.forEach((p) => {
    if (p.tags) p.tags.forEach((t: string) => tagSet.add(t))
  })
  return [...tagSet].sort()
})

const displayedProjects = computed(() => {
  if (!allProjects.value) return []

  let items = allProjects.value
  if (activeTab.value === 'projects') items = items.filter(p => p.category !== 'ecosystem')
  else if (activeTab.value === 'work') items = items.filter(p => p.category === 'ecosystem')

  if (featured) {
    if (activeTab.value === 'projects') return items.filter(p => featuredNames.includes(p.name))
    if (activeTab.value === 'work') return items.filter(p => featuredWorkNames.includes(p.name))
    return items.filter(p => featuredNames.includes(p.name) || featuredWorkNames.includes(p.name))
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(p =>
      p.name.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
    )
  }

  if (selectedTags.value.length) {
    items = items.filter(p =>
      p.tags && selectedTags.value.every(t => p.tags!.includes(t))
    )
  }

  if (sortMode.value === 'a-z') {
    items = [...items].sort((a, b) => a.name.localeCompare(b.name))
  }

  return items
})

const toolbarRef = ref<{ searchInput: HTMLInputElement | null } | null>(null)
const searchInputRef = computed(() => toolbarRef.value?.searchInput ?? null)

const { highlightedIndex } = !featured
  ? useListNavigation(
      computed(() => displayedProjects.value.map(p => ({ url: p.url }))),
      searchInputRef as Ref<HTMLInputElement | null>,
    )
  : { highlightedIndex: ref(-1) }

const hoveredProject = ref<string | null>(null)
const cursorX = ref(0)
const cursorY = ref(0)
const preloadedImages = new Set<string>()

function getScreenshot(project: { name: string, screenshotUrl?: string }) {
  if (project.screenshotUrl) return project.screenshotUrl
  return `/works/${project.name.toLowerCase().replace(/\s+/g, '-')}.png`
}

function preloadImage(src: string) {
  if (preloadedImages.has(src)) return
  preloadedImages.add(src)
  const img = new Image()
  img.src = src
}

function onMouseMove(e: MouseEvent) {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
}

function onProjectHover(project: { name: string, screenshotUrl?: string }) {
  hoveredProject.value = project.name
  preloadImage(getScreenshot(project))
}

onMounted(() => {
  displayedProjects.value.forEach((p) => {
    preloadImage(getScreenshot(p))
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-baseline justify-between">
      <component :is="featured ? 'h3' : 'h1'" class="font-serif text-lg italic text-highlighted">
        Projects<span class="text-primary">.</span>
      </component>
      <div class="flex gap-3 text-sm">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="relative pb-0.5 transition-colors duration-200"
          :class="activeTab === tab.key ? 'text-highlighted' : 'text-muted/40 hover:text-muted'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <Transition name="indicator">
            <span
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-0 h-px w-full bg-primary"
            />
          </Transition>
        </button>
      </div>
    </div>

    <div v-if="!featured" class="flex justify-end">
      <ListToolbar
        ref="toolbarRef"
        :count="displayedProjects.length"
        label="projects"
        :tags="allTags"
        :search="searchQuery"
        :sort="sortMode"
        :selected-tags="selectedTags"
        @update:search="searchQuery = $event"
        @update:sort="sortMode = $event"
        @update:selected-tags="selectedTags = $event"
      />
    </div>

    <div
      @mousemove="onMouseMove"
      @mouseleave="hoveredProject = null"
    >
      <Transition name="fade" mode="out-in">
        <div :key="activeTab" class="flex flex-col">
          <NuxtLink
            v-for="(project, index) in displayedProjects"
            :key="project.name"
            :to="project.url"
            target="_blank"
            class="group flex items-baseline justify-between gap-4 py-2 opacity-0 animate-in"
            :class="{ 'bg-muted/5': highlightedIndex === index }"
            :style="{ animationDelay: `${index * 40}ms` }"
            @mouseenter="onProjectHover(project)"
          >
            <span class="shrink-0 font-medium text-highlighted decoration-primary group-hover:underline">{{ project.name }}</span>
            <span class="truncate text-right text-sm text-muted">{{ project.description }}</span>
          </NuxtLink>
        </div>
      </Transition>
    </div>

    <Teleport to="body">
      <Transition name="preview">
        <div
          v-if="hoveredProject"
          class="pointer-events-none fixed z-50 hidden w-72 overflow-hidden rounded-sm border border-muted/10 shadow-2xl sm:block"
          :style="{ left: `${cursorX + 16}px`, top: `${cursorY + 16}px` }"
        >
          <NuxtImg
            :src="getScreenshot(displayedProjects.find(p => p.name === hoveredProject)!)"
            :alt="hoveredProject"
            format="webp"
            width="288"
            class="block w-full"
          />
        </div>
      </Transition>
    </Teleport>

    <NuxtLink
      v-if="featured"
      to="/works"
      class="text-sm text-muted/50 transition-colors hover:text-muted"
    >
      View all &rarr;
    </NuxtLink>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.2s ease;
}
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.indicator-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.indicator-leave-active {
  transition: opacity 0.15s ease;
}
.indicator-enter-from {
  opacity: 0;
  transform: scaleX(0);
}
.indicator-leave-to {
  opacity: 0;
}

.preview-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.preview-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.preview-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.preview-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
