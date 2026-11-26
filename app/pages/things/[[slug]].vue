<script setup lang="ts">
import { AnimatePresence } from 'motion-v'
import { THING_CATEGORIES, type ThingItem, type ThingCategory, type ThingConcept } from '~/utils/things'

definePageMeta({
  key: 'things',
  layout: 'things',
})

const route = useRoute()
const router = useRouter()
const { seo } = useFolioConfig()

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
const concept = computed(() => thingConcept(route.query.concept))
const overlay = computed(() => {
  if (!selected.value) return false
  if (concept.value !== 'dock') return true
  return route.query.sheet === '1'
})

const category = computed<ThingCategory | 'all'>(() => {
  const q = route.query.cat
  return typeof q === 'string' && categories.includes(q as ThingCategory | 'all')
    ? q as ThingCategory | 'all'
    : 'all'
})

function studioQuery(partial: Record<string, string | undefined> = {}) {
  const query: Record<string, string> = {}
  const nextConcept = (partial.concept ?? concept.value) as ThingConcept
  const nextCat = (partial.cat ?? category.value) as ThingCategory | 'all'
  if (nextConcept !== 'dock') query.concept = nextConcept
  if (nextCat !== 'all') query.cat = nextCat
  return query
}

function setCategory(next: ThingCategory | 'all') {
  router.replace({ path: '/things', query: studioQuery({ cat: next }) })
}

function setConcept(next: ThingConcept) {
  router.replace({ path: route.path, query: studioQuery({ concept: next }) })
}

function open(item: ThingItem) {
  router.push({ path: thingPath(item), query: studioQuery() })
}

function close() {
  const path = concept.value === 'dock' && selected.value
    ? thingPath(selected.value)
    : '/things'
  router.push({ path, query: studioQuery() })
}

function go(item: ThingItem) {
  router.replace({ path: thingPath(item), query: studioQuery() })
}

function details(item: ThingItem) {
  router.push({ path: thingPath(item), query: { ...studioQuery(), sheet: '1' } })
}

const owned = computed(() => (allThings.value ?? []).filter(item => item.owned !== false))
const counts = computed(() => categoryCounts(owned.value))
const filtered = computed(() => inCategory(owned.value, category.value))
const active = computed(() => {
  if (selected.value && filtered.value.some(item => item.slug === selected.value!.slug)) return selected.value
  return filtered.value[0]
})

const title = computed(() => selected.value?.name ?? 'Things')
const description = computed(() => selected.value?.brand ?? 'Objects around the house, standing in a studio.')

useHead({
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

onMounted(() => prefetchThingImages(owned.value))
</script>

<template>
  <div class="page" :class="[`concept-${concept}`]">
    <ThingsChrome
      :category
      :counts
      :total="owned.length"
      :filtered="filtered.length"
      @category="setCategory"
    />

    <ThingsDock
      v-if="concept === 'dock'"
      :items="filtered"
      :active
      @select="go"
      @details="details"
    />
    <ThingsLookbook
      v-else-if="concept === 'lookbook'"
      :items="filtered"
      @open="open"
    />
    <ThingsWall
      v-else-if="concept === 'wall'"
      :items="filtered"
      @open="open"
    />
    <ThingsArchive
      v-else-if="concept === 'index'"
      :items="filtered"
      @open="open"
    />
    <ThingsRunway
      v-else
      :items="filtered"
      @open="open"
    />

    <Teleport to="body">
      <AnimatePresence>
        <ThingsStage
          v-if="overlay && selected"
          :item="selected"
          :items="filtered.length ? filtered : owned"
          @close="close"
          @go="go"
        />
      </AnimatePresence>
    </Teleport>

    <ThingsSwitcher :concept @concept="setConcept" />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #FAF9F7;
}
.page.concept-dock,
.page.concept-wall,
.page.concept-runway {
  height: 100dvh;
  overflow: hidden;
}
.page :deep(.dock),
.page :deep(.wall),
.page :deep(.runway) {
  flex: 1;
  min-height: 0;
  height: auto;
}
.page :deep(.lookbook),
.page :deep(.archive) {
  flex: 0 0 auto;
  width: 100%;
}
</style>
