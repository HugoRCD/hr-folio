<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(`${route.path}`, () => queryContent(route.path).findOne())

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useContentHead(page.value)

const { link } = useAppConfig()
const { name } = useSiteConfig()

useSeoMeta({
  ogSiteName: 'Hugo Richard',
  title: page.value.title,
  description: page.value.description,
  twitterTitle: page.value.title,
  twitterDescription: page.value.description,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.value.title,
  titleTemplate(title) {
    if (route.path === '/')
      return title || name
    return `${title} | ${name}`
  },
  link,
})
</script>

<template>
  <div>
    <ContentRenderer v-if="page?.body" :value="page" class="content mb-4 mt-8 flex flex-1 flex-col justify-around gap-8 sm:gap-12" />
  </div>
</template>
