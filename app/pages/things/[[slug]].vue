<script setup lang="ts">
import { AnimatePresence, LayoutGroup, motion } from 'motion-v'
import { THING_ROOMS, ROOM_LABEL, type ThingItem, type ThingRoom } from '~/utils/things'

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

type View = 'catalogue' | 'ledger'
const rooms: Array<ThingRoom | 'all'> = ['all', ...THING_ROOMS]
const views: { key: View, label: string }[] = [
  { key: 'catalogue', label: 'Catalogue' },
  { key: 'ledger', label: 'Ledger' },
]

const room = computed<ThingRoom | 'all'>(() => {
  const q = route.query.room
  return typeof q === 'string' && rooms.includes(q as ThingRoom | 'all')
    ? q as ThingRoom | 'all'
    : 'all'
})
const view = computed<View>(() => route.query.view === 'ledger' ? 'ledger' : 'catalogue')

function setRoom(next: ThingRoom | 'all') {
  const query = { ...route.query }
  if (next === 'all') delete query.room
  else query.room = next
  router.replace({ query })
}

function setView(next: View) {
  const query = { ...route.query }
  if (next === 'catalogue') delete query.view
  else query.view = next
  router.replace({ query })
}

const items = computed(() => inRoom((allThings.value ?? []).filter(item => item.owned !== false), room.value))
const noun = computed(() => items.value.length === 1 ? 'piece' : 'pieces')

const title = computed(() => selected.value?.name ?? 'Things')
const description = computed(() => {
  if (!selected.value) return 'Clothes, furniture, and the things on the desk.'
  return `${selected.value.brand}. ${selected.value.note ?? ROOM_LABEL[selected.value.room]}`
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

        <div class="in-note top-2 mb-3 flex items-center gap-4 lg:mb-0 lg:flex-col lg:items-stretch lg:gap-0">
          <div class="flex flex-wrap gap-x-4 lg:flex-col lg:gap-0" role="tablist" aria-label="Filter by room">
            <button
              v-for="r in rooms"
              :key="r"
              type="button"
              role="tab"
              :aria-selected="room === r"
              class="tab flex items-center gap-2 text-left font-mono text-[10px] uppercase leading-6 tracking-[0.08em]"
              :class="{ active: room === r }"
              @click="setRoom(r)"
            >
              <span class="tick" aria-hidden="true" />
              {{ ROOM_LABEL[r] }}
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

        <AnimatePresence :initial="false" mode="popLayout">
          <ThingsCatalogue
            v-if="view === 'catalogue'"
            key="catalogue"
            :items
            :spring
          />
          <ThingsLedger
            v-else
            key="ledger"
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
