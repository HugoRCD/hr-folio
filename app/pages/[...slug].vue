<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first()
)
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })

const { seo, socials, profile } = useFolioConfig()
const mdcVars = ref({ ...seo, ...profile, ...socials, date: page.value?.date })

const isArticle = computed(() => route.path.includes('/writing/'))

useSeoPage(page.value, isArticle.value)

const readingTime = computed(() => {
  if (!isArticle.value) return 0
  const raw = (page.value as unknown as Record<string, unknown>)?.rawbody as string | undefined
  return useReadingTime(raw)
})
</script>

<template>
  <div v-if="page">
    <Toc v-if="isArticle" :links="page.body.toc?.links!" />
    <div v-if="isArticle && readingTime" class="mb-6 flex items-center gap-2 text-sm text-muted/50">
      <span>{{ new Date(page.date!).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
      <span class="text-muted/20">&middot;</span>
      <span>{{ readingTime }} min read</span>
    </div>
    <ContentRenderer
      :value="page"
      :class="isArticle ? 'mb-4 prose-breakout' : 'mb-4 flex flex-1 flex-col gap-12 sm:gap-16'"
      :data="mdcVars"
    />
  </div>
</template>
