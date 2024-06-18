<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(`notes-${route.path}`, () => queryContent(route.path).findOne())

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useContentHead(page.value)

const { link } = useAppConfig()

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  twitterTitle: page.value.title,
  twitterDescription: page.value.description,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.value.title,
  titleTemplate() {
    return page.value?.title || 'Page not found'
  },
  link,
})
</script>

<template>
  <div>
    <ContentRenderer v-if="page?.body" :value="page" class="writing mb-4 mt-8" />
  </div>
</template>
