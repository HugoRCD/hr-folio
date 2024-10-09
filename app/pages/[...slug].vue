<script setup lang="ts">
useScriptPlausibleAnalytics({
  domain: 'hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

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
  author: 'Hugo Richard',
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
    if (route.path.includes('/writing/'))
      return title
    return `${title} | ${name}`
  },
  link,
})

const writingClass = 'writing mb-4 mt-8'
const contentClass = 'content mb-4 mt-8 flex flex-1 flex-col justify-around gap-8 sm:gap-12'
</script>

<template>
  <Html lang="en">
    <MApp>
      <ContentRenderer v-if="page?.body" :value="page" :class="route.path.includes('/writing/') ? writingClass : contentClass" />
    </MApp>
  </Html>
</template>
