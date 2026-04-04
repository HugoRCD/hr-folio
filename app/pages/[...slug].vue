<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content'

const route = useRoute()
const requestFetch = useRequestFetch()

const { data: page, error: pageError } = await useAsyncData<ContentCollectionItem>(
  () => `folio-page:${route.path}`,
  () => requestFetch<ContentCollectionItem>('/api/folio/page', { query: { path: route.path } }),
  { watch: [() => route.path] },
)

if (pageError.value || !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const { seo, socials, profile } = useFolioConfig()
const mdcVars = computed(() => ({ ...seo, ...profile, ...socials, date: page.value?.date }))

const isArticle = computed(() => route.path.includes('/writing/'))
const isClipboard = computed(() => route.path.includes('/clipboard/'))
const isDraft = computed(() => Boolean((page.value as { draft?: boolean } | null)?.draft))

useSeoPage(page.value, isArticle.value)

const readingTime = computed(() => {
  if (!isArticle.value) return 0
  const raw = (page.value as unknown as Record<string, unknown>)?.rawbody as string | undefined
  return useReadingTime(raw)
})
</script>

<template>
  <div v-if="page">
    <div
      v-if="isDraft"
      class="mb-6 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90"
    >
      <span class="font-medium">Draft</span>
      <span class="text-muted"> — only you can see this page when signed in as the site owner.</span>
    </div>
    <Toc v-if="isArticle" :links="page.body.toc?.links!" />
    <div v-if="isArticle && readingTime" class="mb-6 flex items-center gap-2 text-sm text-muted/50">
      <span>{{ new Date(page.date!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
      <span class="text-muted/20">&middot;</span>
      <span>{{ readingTime }} min read</span>
    </div>
    <div v-if="isClipboard" class="mb-2 flex items-center gap-2 text-sm text-muted/50">
      <span>{{ new Date(page.date!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
    </div>
    <ContentRenderer
      :value="page"
      :class="[
        isArticle ? 'mb-4 prose-breakout' : isClipboard ? 'mb-4 prose-compact prose-breakout' : 'mb-4 flex flex-1 flex-col gap-12 sm:gap-16',
      ]"
      :data="mdcVars"
    />
  </div>
</template>
