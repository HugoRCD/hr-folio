<script setup lang="ts">
useScriptPlausibleAnalytics({
  domain: 'hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const route = useRoute()

const { data: page } = await useAsyncData(`${route.path}`, () => queryContent(route.path).findOne())

if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })

useContentHead(page.value)

const { link } = useAppConfig()
const { name } = useSiteConfig()

const isWriting = computed(() => route.path.includes('/writing/'))

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
    if (isWriting.value)
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
    <MApp class="relative bg-transparent">
      <div v-if="isWriting" class="max-sm:hidden fixed z-50 scale-50 hover:scale-100 transition-transform duration-200 ease-in-out right-4 top-1/2 -translate-y-1/2 origin-right">
        <div class="bg-primary p-4 shadow-md w-fit rounded-md mx-auto border border-secondary/20">
          <Toc :links="page?.body?.toc?.links!" />
        </div>
      </div>
      <ContentRenderer v-if="page?.body" :value="page" :class="isWriting ? writingClass : contentClass" />
    </MApp>
  </Html>
</template>
