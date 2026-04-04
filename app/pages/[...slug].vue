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
</script>

<template>
  <div v-if="page">
    <Toc v-if="isArticle" :links="page.body.toc?.links!" />
    <ContentRenderer
      :value="page"
      :class="isArticle ? 'mb-4' : 'mb-4 flex flex-1 flex-col gap-12 sm:gap-16'"
      :data="mdcVars"
    />
  </div>
</template>
