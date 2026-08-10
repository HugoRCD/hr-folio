<script setup lang="ts">
type TocLink = { id: string, text: string, depth: number, children?: TocLink[] }
type FolioPage = { path: string, data: PageData, meta: { toc?: { links: TocLink[] } }, nodes: unknown[] }

const route = useRoute()

const isArticle = computed(() => route.path.includes('/writing/'))
const isClipboard = computed(() => route.path.includes('/clipboard/'))

// `clientContent` calls straight into `content.handler()` — during SSR its
// `fetch` is Nuxt's `$fetch`, an in-process call with no network hop, and the
// resulting payload is hydrated on the client with no refetch. Going through
// `clientContent` directly (instead of a bespoke `/api/folio/page` proxy) also
// means client-side navigations hit `/api/content/get/**`, which is cacheable
// (unlike the old proxy's `no-store` header), rather than always paying a full
// server round trip on every article click.
const asyncPage = useAsyncData<FolioPage | null>(
  () => `folio-page:${route.path}`,
  () => clientContent.get<PageData>(route.path) as Promise<FolioPage | null>,
  { watch: [() => route.path] },
)
const { data: page, error: pageError } = asyncPage

// Registered *before* awaiting `asyncPage` below, on purpose: `useSeoPage` and
// `useFolioConfig` (`useAppConfig` under the hood) need Vue's synchronous
// component-setup context to inject into the right Nuxt app — see the comment in
// `useSeoPage.ts`. `page.value` is still `undefined` at this point; `useSeoPage`
// takes the ref itself and reads through it reactively once resolved.
const { seo, socials, profile } = useFolioConfig()
useSeoPage(computed(() => page.value?.data), isArticle.value)

await asyncPage

if (pageError.value || !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const mdcVars = computed(() => ({ ...seo, ...profile, ...socials, date: page.value?.data.date }))

const readingTime = computed(() => {
  if (!isArticle.value) return 0
  return useReadingTime(page.value?.nodes)
})
</script>

<template>
  <div v-if="page">
    <Toc v-if="isArticle" :links="page.meta.toc?.links ?? []" />
    <div v-if="isArticle && readingTime" class="mb-6 flex items-center gap-2 text-sm text-muted/50">
      <span>{{ new Date(page.data.date!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
      <span class="text-muted/20">&middot;</span>
      <span>{{ readingTime }} min read</span>
    </div>
    <div v-if="isClipboard" class="mb-2 flex items-center gap-2 text-sm text-muted/50">
      <span>{{ new Date(page.data.date!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
    </div>
    <MarkdownDocument
      :value="page"
      :class="[
        isArticle ? 'mb-4 prose-breakout' : isClipboard ? 'mb-4 prose-compact prose-breakout' : 'mb-4 flex flex-1 flex-col gap-12 sm:gap-16',
      ]"
      :data="mdcVars"
    />
  </div>
</template>
