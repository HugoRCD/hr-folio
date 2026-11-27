<script setup lang="ts">
import { THING_CATEGORIES, type ThingItem, type ThingCategory, type ThingSort, type ThingView } from '#shared/utils/things'

definePageMeta({
  key: 'things',
  layout: 'things',
})

const route = useRoute()
const router = useRouter()
const { seo } = useFolioConfig()
const { withFilterTransition, withViewSwitch, withHeroTransition } = useThingTransition()

const { data: allThings } = await useAsyncData('things', async () => {
  const rows = await queryCollection('things').all()
  return sortThings(rows as unknown as ThingItem[])
})

const slug = computed(() => {
  const s = route.params.slug
  return typeof s === 'string' && s.length ? s : ''
})

const selected = computed(() => allThings.value?.find(item => item.slug === slug.value))

watchEffect(() => {
  if (slug.value && allThings.value && !selected.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }
})

const categories: Array<ThingCategory | 'all'> = ['all', ...THING_CATEGORIES]
const view = computed(() => thingView(route.query.view))
const sort = computed(() => thingSort(route.query.sort))

const category = computed<ThingCategory | 'all'>(() => {
  const q = route.query.cat
  return typeof q === 'string' && categories.includes(q as ThingCategory | 'all')
    ? q as ThingCategory | 'all'
    : 'all'
})

function studioQuery(partial: {
  cat?: ThingCategory | 'all'
  view?: ThingView
  sort?: ThingSort
} = {}) {
  const query: Record<string, string> = {}
  const nextView = partial.view ?? view.value
  const nextCat = partial.cat ?? category.value
  const nextSort = partial.sort ?? sort.value
  if (nextView !== 'list') query.view = nextView
  if (nextCat !== 'all') query.cat = nextCat
  if (nextSort !== 'curated') query.sort = nextSort
  return query
}

// the index moves its own lines into place; the lookbook's pictures go through a view transition
function refine(update: () => Promise<unknown>) {
  if (view.value === 'list') return update()
  return withFilterTransition(async () => {
    await update()
  })
}

async function setCategory(next: ThingCategory | 'all') {
  const keep = selected.value && (next === 'all' || selected.value.category === next)
  await refine(() => router.replace({
    path: keep ? route.path : '/things',
    query: studioQuery({ cat: next }),
  }))
  // another use is another list: the index starts again at its head, with its first piece on the stage
  if (view.value === 'list' && !selected.value) {
    active.value = filtered.value[0]?.slug ?? active.value
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}

function setView(next: ThingView) {
  withViewSwitch(() => router.replace({ path: route.path, query: studioQuery({ view: next }) }))
}

function setSort(next: ThingSort) {
  refine(() => router.replace({ path: route.path, query: studioQuery({ sort: next }) }))
}

async function open(item: ThingItem) {
  if (view.value === 'list' && active.value !== item.slug) {
    // the piece is put on the stage first, so it is the stage that opens
    active.value = item.slug
    await nextTick()
    await new Promise(requestAnimationFrame)
  }
  withHeroTransition(item.slug, () => router.push({ path: thingPath(item), query: studioQuery() }))
}

function close() {
  const slug = selected.value?.slug
  if (!slug) {
    router.push({ path: '/things', query: studioQuery() })
    return
  }
  withHeroTransition(slug, () => router.push({ path: '/things', query: studioQuery() }))
}

function go(item: ThingItem) {
  router.replace({ path: thingPath(item), query: studioQuery() })
}

const owned = computed(() => (allThings.value ?? []).filter(item => item.owned !== false))
const counts = computed(() => categoryCounts(owned.value))
const filtered = computed(() => sortThings(inCategory(owned.value, category.value), sort.value))
const stageItems = computed(() => sortThings(owned.value, sort.value))

// each piece keeps its number in the inventory, however the index is sorted
const plates = computed(() => Object.fromEntries(sortThings(owned.value).map((item, i) => [item.slug, i + 1])))

// the piece on the index's stage
const active = ref(selected.value?.slug ?? filtered.value[0]?.slug ?? '')

// the stage sits under the header, however tall the header wraps
const chrome = useTemplateRef<{ $el: HTMLElement }>('chrome')
const { height: chromeHeight } = useElementSize(() => chrome.value?.$el, undefined, { box: 'border-box' })
const pageStyle = computed(() => chromeHeight.value ? { '--chrome-h': `${Math.round(chromeHeight.value)}px` } : undefined)

const title = computed(() => selected.value?.name ?? 'Things')
const description = computed(() => selected.value
  ? `${selected.value.name} by ${selected.value.brand}, one of the things Hugo Richard owns and uses.`
  : 'The things Hugo Richard owns and uses: what he wears and carries every day, the clothes, tech and objects at home.')

useHead({
  // the same inventory, as Markdown, for agents
  link: [{ rel: 'alternate', type: 'text/markdown', href: '/things.md', title: 'Things (Markdown)' }],
  title,
  titleTemplate: (t) => t ? `${t} | ${seo?.title}` : seo?.title,
})

useSeoMeta({
  ogSiteName: seo?.title,
  ogType: 'website',
  author: seo?.title,
  title,
  description,
  twitterTitle: title,
  twitterDescription: description,
  twitterCard: 'summary_large_image',
  twitterSite: '@hugorcd',
  twitterCreator: '@hugorcd',
  ogLocale: 'en_GB',
  ogImage: '/og/home.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Hugo Richard, Software Engineer & Designer at Vercel',
  twitterImage: '/og/home.jpg',
})

useSchemaOrg([defineWebPage()])

// every cutout is fetched once the page is up, so the stage never waits for one
onMounted(() => {
  for (const item of owned.value) {
    const img = new Image()
    img.decoding = 'async'
    img.src = item.image
  }
})

watch(selected, (item) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('things-overlay', Boolean(item))
}, { immediate: true })

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.documentElement.classList.remove('things-overlay')
})
</script>

<template>
  <div class="page" :style="pageStyle">
    <ThingsChrome
      ref="chrome"
      :category
      :counts
      :view
      :sort
      @category="setCategory"
      @view="setView"
      @sort="setSort"
    />

    <div class="studio-body">
      <ThingsLookbook
        v-if="view === 'lookbook'"
        :items="filtered"
        @open="open"
      />
      <ThingsList
        v-else
        v-model:active="active"
        :items="filtered"
        :sort
        :plates
        :opened="selected?.slug"
        @open="open"
      />
    </div>

    <Teleport to="body">
      <ThingsStage
        v-if="selected"
        :item="selected"
        :items="stageItems"
        @close="close"
        @go="go"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #FAF9F7;
}
.studio-body {
  position: relative;
  z-index: 0;
  isolation: isolate;
  flex: 1 0 auto;
  min-width: 0;
}
</style>
