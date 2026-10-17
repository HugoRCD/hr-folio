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
  hoveredProject.value = null
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
    .all()
)

const featuredNames = ['Evlog', 'Shelve', 'Canvas', 'GitHub Tools']
const featuredWorkNames = ['Nuxt MCP Toolkit', 'Docus', 'Nuxt.com', 'Nuxt UI', 'Knowledge Agent', 'Comark']

function sortByOrder(items: typeof allProjects.value, order: string[]) {
  return [...items!].sort((a, b) => {
    const ai = order.indexOf(a.name)
    const bi = order.indexOf(b.name)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return 0
  })
}

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
    if (activeTab.value === 'projects') return sortByOrder(items.filter(p => featuredNames.includes(p.name)), featuredNames)
    if (activeTab.value === 'work') return sortByOrder(items.filter(p => featuredWorkNames.includes(p.name)), featuredWorkNames)
    const allFeatured = [...featuredNames, ...featuredWorkNames]
    return sortByOrder(items.filter(p => allFeatured.includes(p.name)), allFeatured)
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

  if (sortMode.value === 'newest') {
    items = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else if (sortMode.value === 'a-z') {
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

function onProjectHover(project: { name: string, screenshotUrl?: string }, e: MouseEvent) {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  hoveredProject.value = project.name
  preloadImage(getScreenshot(project))
}

// a row on its way out keeps its place while it fades, instead of falling to the top of the list
// (measured before the list updates: by the time Vue calls the leave hook they already read 0)
const list = useTemplateRef<{ $el: HTMLElement }>('list')
const lastTops = new Map<string, number>()
watch(displayedProjects, () => {
  lastTops.clear()
  list.value?.$el.querySelectorAll<HTMLElement>('[data-row]').forEach(row => lastTops.set(row.dataset.row!, row.offsetTop))
}, { flush: 'pre' })
function pin(el: Element) {
  const row = el as HTMLElement
  row.style.top = `${lastTops.get(row.dataset.row!) ?? row.offsetTop}px`
}

const listHeight = ref(0)
let listObserver: ResizeObserver | undefined
// the first paint uses the page's entrance; after that, the list's own transitions take over
const settled = ref(false)

onMounted(() => {
  displayedProjects.value.forEach((p) => {
    preloadImage(getScreenshot(p))
  })
  setTimeout(() => (settled.value = true), 300 + displayedProjects.value.length * 40)
  const el = list.value?.$el
  if (!el) return
  listObserver = new ResizeObserver(() => (listHeight.value = el.offsetHeight))
  listObserver.observe(el)
})
onBeforeUnmount(() => listObserver?.disconnect())
</script>

<template>
  <section class="relative flex flex-col">
    <SectionMark :numeral="featured ? 'III' : '§'" label="Projects" :as="featured ? 'h3' : 'h1'" />
    <!-- filters and search are notes in the right margin on wide screens, so the mark keeps the first entry's line -->
    <div class="in-note top-2 mb-3 flex items-center gap-4 lg:mb-0 lg:flex-col lg:items-stretch lg:gap-0">
      <div class="flex gap-4 lg:flex-col lg:gap-0" role="tablist" aria-label="Filter projects">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          role="tab"
          :aria-selected="activeTab === tab.key"
          class="tab flex items-center gap-2 text-left font-mono text-[10px] uppercase leading-6 tracking-[0.08em]"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tick" aria-hidden="true" />
          {{ tab.label }}
        </button>
      </div>
      <ListToolbar
        v-if="!featured"
        ref="toolbarRef"
        class="ml-auto lg:ml-5 lg:mt-5"
        :count="displayedProjects.length"
        label="projects"
        :tags="allTags"
        :search="searchQuery"
        :sort="sortMode"
        :selected-tags
        @update:search="searchQuery = $event"
        @update:sort="sortMode = $event"
        @update:selected-tags="selectedTags = $event"
      />
    </div>

    <div
      @mousemove="onMouseMove"
      @mouseleave="hoveredProject = null"
    >
      <!-- rows that stay slide to their new place, new ones settle in, the list's height follows -->
      <div class="rows" :class="{ sized: listHeight }" :style="{ height: listHeight ? `${listHeight}px` : undefined }">
        <!-- block flow, not flex: a leaving row taken out of the flow stays where it was -->
        <TransitionGroup ref="list" name="row" tag="div" class="relative" @before-leave="pin">
          <NuxtLink
            v-for="(project, index) in displayedProjects"
            :key="project.name"
            :data-row="project.name"
            :to="project.url"
            target="_blank"
            class="group relative flex items-baseline gap-4 py-2"
            :class="[{ 'bg-muted/5': highlightedIndex === index }, !settled && 'animate-in opacity-0']"
            :style="{ '--i': index, 'animationDelay': settled ? undefined : `${index * 40}ms` }"
            @mouseenter="onProjectHover(project, $event)"
          >
            <span class="flex shrink-0 items-baseline">
              <span class="in-gutter font-mono text-[10px] tabular-nums text-muted/40" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="font-medium text-highlighted decoration-primary underline-offset-4 group-hover:underline">{{ project.name }}</span>
            </span>
            <span class="ml-auto truncate text-right text-sm text-muted">{{ project.description }}</span>
          </NuxtLink>
        </TransitionGroup>
      </div>
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
      class="mt-2 self-start font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50 transition-colors hover:text-highlighted"
    >
      All projects &rarr;
    </NuxtLink>
  </section>
</template>

<style scoped>
/* tabs: the active one's tick is ruled in red, the others keep a faint stub */
.tab {
  color: color-mix(in oklab, var(--ui-text-muted) 45%, transparent);
  transition: color 0.35s ease;
}
.tab:hover {
  color: var(--ui-text-muted);
}
.tab.active {
  color: var(--ui-text-highlighted);
}
.tick {
  position: relative;
  width: 12px;
  height: 1px;
  background: color-mix(in oklab, currentColor 30%, transparent);
}
.tick::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--ui-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}
.tab.active .tick::after {
  transform: scaleX(1);
}

/* the list */
.rows.sized {
  transition: height 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}
.row-move {
  transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}
.row-enter-active {
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.2, 0, 0, 1);
  transition-delay: calc(170ms + var(--i) * 30ms); /* after the outgoing rows are gone: no two lines on one line */
}
.row-leave-active {
  position: absolute;
  inset-inline: 0;
  transition: opacity 0.16s ease;
}
.row-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.row-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .rows.sized, .row-move, .row-enter-active, .row-leave-active, .tick::after {
    transition: none;
  }
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
