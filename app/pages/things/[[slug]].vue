<script setup lang="ts">
import { AnimatePresence, LayoutGroup, motion } from 'motion-v'
import { THING_CATEGORIES, CATEGORY_LABEL, type ThingItem, type ThingCategory } from '~/utils/things'

definePageMeta({
  key: 'things',
  layout: 'things',
})

const route = useRoute()
const router = useRouter()
const { seo } = useFolioConfig()
const { spring, arrive } = useThingMotion()

const { data: allThings } = await useAsyncData('things', async () => {
  const rows = await queryCollection('things').all()
  return sortThings(rows as unknown as ThingItem[])
})

const slug = computed(() => {
  const s = route.params.slug
  return typeof s === 'string' && s.length ? s : ''
})

const selected = computed(() => allThings.value?.find(item => item.slug === slug.value))

if (slug.value && !selected.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

watch([slug, allThings], ([s, list]) => {
  if (s && list && !list.some(item => item.slug === s)) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }
})

const categories: Array<ThingCategory | 'all'> = ['all', ...THING_CATEGORIES]

const category = computed<ThingCategory | 'all'>(() => {
  const q = route.query.cat
  return typeof q === 'string' && categories.includes(q as ThingCategory | 'all')
    ? q as ThingCategory | 'all'
    : 'all'
})

function setCategory(next: ThingCategory | 'all') {
  const query = { ...route.query }
  if (next === 'all') delete query.cat
  else query.cat = next
  delete query.at
  if (slug.value) {
    router.replace({ path: '/things', query })
    return
  }
  router.replace({ query })
}

const owned = computed(() => (allThings.value ?? []).filter(item => item.owned !== false))
const counts = computed(() => categoryCounts(owned.value))
const walkItems = computed(() => studioSequence(inCategory(owned.value, category.value)))
const detailItems = computed(() => walkItems.value.length ? walkItems.value : studioSequence(owned.value))

const title = computed(() => selected.value?.name ?? 'Things')
const description = computed(() => {
  if (!selected.value) return 'Objects around the house, standing in a studio.'
  return selected.value.brand
})

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
</script>

<template>
  <LayoutGroup>
    <motion.div
      class="bar"
      :initial="{ opacity: 0, y: -8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="arrive"
    >
      <p class="word">
        Things.
      </p>
      <div class="cats" role="tablist" aria-label="Filter by use">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          role="tab"
          :aria-selected="category === c"
          class="tab"
          :class="{ active: category === c }"
          @click="setCategory(c)"
        >
          {{ CATEGORY_LABEL[c] }}
          <span class="n">({{ counts[c] }})</span>
        </button>
      </div>
    </motion.div>

    <AnimatePresence :initial="false" mode="sync">
      <ThingsDetail
        v-if="selected"
        key="detail"
        :item="selected"
        :items="detailItems"
        :spring
      />
      <ThingsWalk
        v-else
        key="walk"
        :items="walkItems"
      />
    </AnimatePresence>
  </LayoutGroup>
</template>

<style scoped>
.bar {
  position: absolute;
  top: 22px;
  left: 148px;
  right: 28px;
  z-index: 28;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 14px 28px;
  pointer-events: none;
}
.bar > * {
  pointer-events: auto;
}
.word {
  margin: 0;
  font-family: var(--font-redaction);
  font-size: 28px;
  line-height: 1;
  color: #111111;
}
.cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
}
.tab {
  padding: 0;
  border: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 20px;
  color: var(--ui-text-dimmed);
  cursor: pointer;
  box-shadow: none;
}
.tab:hover {
  color: #111111;
}
.tab.active {
  color: #111111;
  box-shadow: 0 1px 0 0 var(--ui-primary);
}
.tab:focus-visible {
  box-shadow: 0 1px 0 0 var(--ui-primary);
}
.n {
  color: inherit;
  opacity: 0.55;
}

@media (max-width: 899px) {
  .bar {
    left: 24px;
    right: 24px;
    top: 72px;
  }
}
</style>
