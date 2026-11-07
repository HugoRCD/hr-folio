<script setup lang="ts">
import type { NuxtError } from '#app'
import { type Known, nearest } from '~/utils/nearest'
import { monogramPath, monogramViewBox } from '~/utils/signature'

// A page that isn't there: no letter on this sheet, only the drawing underneath, on its red, and
// on it the letter that came back (ErrorEnvelope). Any other error gets the same desk, with the
// envelope refused rather than unknown at the address.
const props = defineProps<{
  error?: NuxtError
}>()

const code = computed(() => {
  const n = Number(props.error?.statusCode)
  return Number.isFinite(n) && n > 0 ? n : 500
})
const is404 = computed(() => code.value === 404)
const route = useRoute()
const path = computed(() => decodeURI(route.path))

useHead({
  title: () => is404.value ? 'Page not found' : 'Something went wrong',
  meta: [{ name: 'robots', content: 'noindex' }],
})

// where else to go: the sheet's own pages, in the words they describe themselves with
const PLACES = [
  { path: '/', title: 'Home', sub: 'Software Engineer & Designer at Vercel' },
  { path: '/works', title: 'Works', sub: 'Projects I\'ve built and contributed to' },
  { path: '/writing', title: 'Writing', sub: 'Articles about development, design, and building things' },
  { path: '/clipboard', title: 'Clipboard', sub: 'Weekly picks: music, links, videos' },
]

type Page = Known & { date?: string }
// the pages it might have been meant for, read on the server so they are in the letter from the start
const requestFetch = useRequestFetch()
const { data: known } = await useAsyncData('error-known-pages', async () => {
  const [writing, clipboard] = await Promise.all([
    requestFetch<Array<{ path: string, title: string, date?: string }>>('/api/folio/writing').catch(() => []),
    requestFetch<Array<{ path: string, title: string, date?: string }>>('/api/folio/clipboard').catch(() => []),
  ])
  return [
    ...writing.map(w => ({ path: w.path, title: w.title, kind: 'Writing', date: w.date })),
    ...clipboard.map(c => ({ path: c.path, title: c.title, kind: 'Clipboard', date: c.date })),
    ...PLACES.map(p => ({ path: p.path, title: p.title, kind: 'Page' })),
  ] as Page[]
})
const near = computed(() => is404.value ? nearest(path.value, known.value ?? []) as Page[] : [])

const daylight = useState<{ time: string, date: string, phase: string, place: { city: string } } | undefined>('daylight')
</script>

<template>
  <div class="ground">
    <header class="top">
      <NuxtLink to="/" aria-label="Hugo Richard, home" class="home">
        <svg :viewBox="monogramViewBox" aria-hidden="true"><path :d="monogramPath" /></svg>
      </NuxtLink>
      <!-- the dateline, as on every sheet: held at its height so nothing moves when it arrives -->
      <p class="dateline">
        <ClientOnly>
          <template v-if="daylight?.date">
            <span class="serif">From {{ daylight.place.city }},</span>
            <span class="serif dim">{{ daylight.date }}</span>
            <span class="hour">{{ daylight.time }} · {{ daylight.phase }}</span>
          </template>
        </ClientOnly>
      </p>
    </header>

    <main class="desk">
      <!-- the sheet's title, said plainly before the envelope tells it -->
      <hgroup class="title">
        <p>Error {{ code }}</p>
        <h1>{{ is404 ? 'Page not found' : 'Something went wrong' }}</h1>
      </hgroup>
      <ErrorEnvelope :path :code :near :places="PLACES" />
    </main>

    <footer class="bottom">
      <span>hugorcd.com</span>
      <NuxtLink to="/" class="back">
        Back to the index &rarr;
      </NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
/* Envers: the red under every page, and its drafting grid */
.ground {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
  padding: 40px;
  overflow: hidden;
  background-color: #901112;
  background-image:
    linear-gradient(rgb(235 235 235 / 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgb(235 235 235 / 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: -1px -1px;
  color: #ebebeb;
}
.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.home svg {
  height: 44px;
  width: auto;
  fill: #ebebeb;
  transition: opacity 0.2s ease;
}
.home:hover svg {
  opacity: 0.75;
}
.dateline {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}
.serif {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 15px;
  line-height: 20px;
}
.serif.dim {
  color: rgb(235 235 235 / 0.7);
}
.hour {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgb(235 235 235 / 0.7);
}
.desk {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 52px;
  padding-block: 24px 88px;
}
.title {
  transition: opacity 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.title p {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(235 235 235 / 0.75);
}
/* once the envelope is open, the letter says it: the title gives way to the open flap */
.desk:has(.at-open, .at-rising, .at-out) .title {
  opacity: 0;
}
.title h1 {
  font-family: var(--font-redaction);
  font-size: 36px;
  line-height: 40px;
  font-weight: 400;
}
.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(235 235 235 / 0.7);
}
.back {
  transition: color 0.2s ease;
}
.back:hover {
  color: #ebebeb;
}
@media (max-width: 639px) {
  .ground {
    padding: 24px;
  }
  .desk {
    gap: 56px;
    padding-block: 32px 80px;
  }
  .title h1 {
    font-size: 30px;
    line-height: 36px;
  }
}
</style>
