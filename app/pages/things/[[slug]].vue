<script setup lang="ts">
import { AnimatePresence, LayoutGroup, motion } from 'motion-v'
import { THING_CATEGORIES, CATEGORY_LABEL, type ThingItem, type ThingCategory } from '~/utils/things'

definePageMeta({
  key: 'things',
})

const route = useRoute()
const router = useRouter()
const { seo } = useFolioConfig()
const { spring } = useThingMotion()

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

type View = 'carousel' | 'grid'
const categories: Array<ThingCategory | 'all'> = ['all', ...THING_CATEGORIES]
const views: { key: View, label: string }[] = [
  { key: 'carousel', label: 'Carousel' },
  { key: 'grid', label: 'Grid' },
]

const category = computed<ThingCategory | 'all'>(() => {
  const q = route.query.cat
  return typeof q === 'string' && categories.includes(q as ThingCategory | 'all')
    ? q as ThingCategory | 'all'
    : 'all'
})
const view = computed<View>(() => route.query.view === 'grid' ? 'grid' : 'carousel')

function setCategory(next: ThingCategory | 'all') {
  const query = { ...route.query }
  if (next === 'all') delete query.cat
  else query.cat = next
  router.replace({ query })
}

function setView(next: View) {
  const query = { ...route.query }
  if (next === 'carousel') delete query.view
  else query.view = next
  router.replace({ query })
}

const items = computed(() => inCategory((allThings.value ?? []).filter(item => item.owned !== false), category.value))
const noun = computed(() => items.value.length === 1 ? 'piece' : 'pieces')

const title = computed(() => selected.value?.name ?? 'Things')
const description = computed(() => {
  if (!selected.value) return 'Clothes, cameras, furniture, and the rest of the objects around the house.'
  return `${selected.value.brand}. ${selected.value.note ?? CATEGORY_LABEL[selected.value.category]}`
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
    <AnimatePresence :initial="false">
      <ThingsDetail
        v-if="selected"
        :key="selected.slug"
        :item="selected"
        :items="allThings ?? []"
        :spring
      />
      <motion.section
        v-else
        key="index"
        layout
        class="relative flex flex-col"
        :transition="spring"
        :initial="false"
      >
        <SectionMark numeral="§" label="Things" as="h1" />

        <div class="in-note filters z-10 top-2 mb-3 flex items-center gap-4 lg:mb-0 lg:flex-col lg:items-stretch lg:gap-0">
          <div class="flex flex-wrap gap-x-4 lg:flex-col lg:gap-0" role="tablist" aria-label="Filter by use">
            <button
              v-for="c in categories"
              :key="c"
              type="button"
              role="tab"
              :aria-selected="category === c"
              class="tab flex items-center gap-2 text-left font-mono text-[10px] uppercase leading-6 tracking-[0.08em]"
              :class="{ active: category === c }"
              @click="setCategory(c)"
            >
              <span class="tick" aria-hidden="true" />
              {{ CATEGORY_LABEL[c] }}
            </button>
          </div>
          <div class="flex flex-wrap gap-x-4 lg:mt-5 lg:flex-col lg:gap-0" role="tablist" aria-label="Choose a view">
            <button
              v-for="v in views"
              :key="v.key"
              type="button"
              role="tab"
              :aria-selected="view === v.key"
              class="tab flex items-center gap-2 text-left font-mono text-[10px] uppercase leading-6 tracking-[0.08em]"
              :class="{ active: view === v.key }"
              @click="setView(v.key)"
            >
              <span class="tick" aria-hidden="true" />
              {{ v.label }}
            </button>
          </div>
          <p class="count font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50 lg:mt-5">
            {{ items.length }} {{ noun }}
          </p>
        </div>

        <AnimatePresence :initial="false">
          <ThingsStage
            v-if="view === 'carousel'"
            key="carousel"
            :items
            :spring
          />
          <ThingsGrid
            v-else
            key="grid"
            :items
            :spring
          />
        </AnimatePresence>

        <p class="affiliate">
          Some links are affiliate links.
        </p>
      </motion.section>
    </AnimatePresence>
  </LayoutGroup>
</template>

<style scoped>
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

.filters {
  z-index: 10;
}

.affiliate {
  margin: 48px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.04em;
  color: var(--ui-text-dimmed);
}

@media (prefers-reduced-motion: reduce) {
  .tab,
  .tick::after {
    transition: none;
  }
}
</style>
