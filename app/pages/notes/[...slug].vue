<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('notes').path(route.path).first()
)
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })

const { link, seo, profile } = useAppConfig()

const getPageSEO = () => ({
  title: page.value?.title,
  description: page.value?.description,
})

const pageSEO = getPageSEO()

defineOgImageComponent('WritingPost', {
  ...pageSEO,
}, {
  fonts: ['Geist:400', 'Geist:600'],
})

useSeoMeta({
  ogSiteName: seo.title,
  ogType: 'article',
  author: profile.name,
  title: pageSEO.title,
  description: pageSEO.description,
  twitterTitle: pageSEO.title,
  twitterDescription: pageSEO.description,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.value.title,
  titleTemplate: page.value.title,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'charset', content: 'utf-8' },
    { name: 'robots', content: 'index, follow' },
    { name: 'color-scheme', content: 'light dark' }
  ],
  link,
})
</script>

<template>
  <Html :lang="seo.lang">
    <MApp class="relative bg-transparent">
      <ContentRenderer
        v-if="page"
        :value="page"
        class="mb-4 mt-8"
      />
    </MApp>
  </Html>
</template>
