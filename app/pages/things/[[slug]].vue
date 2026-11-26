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
  router.replace({ query })
}

const owned = computed(() => (allThings.value ?? []).filter(item => item.owned !== false))
const counts = computed(() => categoryCounts(owned.value))
const items = computed(() => inCategory(owned.value, category.value))

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
        :items="owned"
        :spring
      />
      <motion.section
        v-else
        key="index"
        class="studio-index"
        :initial="false"
      >
        <header class="mast">
          <h1 class="title">
            Things
          </h1>
          <p class="lede">
            Clothes, cameras, furniture, and the rest of the objects around the house.
          </p>
        </header>

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

        <ThingsGrid :items :spring />

        <p class="affiliate">
          Some links are affiliate links.
        </p>
      </motion.section>
    </AnimatePresence>
  </LayoutGroup>
</template>

<style scoped>
.mast {
  margin-bottom: 28px;
}
.title {
  margin: 0;
  font-family: var(--font-redaction);
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 400;
  line-height: 1.05;
  color: #111111;
}
.lede {
  max-width: 28rem;
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 24px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}

.cats {
  position: sticky;
  top: 0;
  z-index: 8;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  margin: 0 0 48px;
  padding: 18px 0 18px;
  background: #FAF9F7;
  border-bottom: 1px solid var(--ui-border);
}
.tab {
  padding: 0;
  border: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
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

.affiliate {
  margin: 64px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 0.04em;
  color: var(--ui-text-dimmed);
}

@media (prefers-reduced-motion: reduce) {
  .tab {
    transition: none;
  }
}
</style>
