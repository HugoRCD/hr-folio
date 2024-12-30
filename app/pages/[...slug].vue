<script setup lang="ts">
useScriptPlausibleAnalytics({
  domain: 'hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path(route.path).first())
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })

const { link, seo, socials, profile } = useAppConfig()

const mdcVars = ref({
  ...profile,
  ...socials
})

const isWriting = computed(() => route.path.includes('/writing/'))

useSeoMeta({
  ogSiteName: 'Hugo Richard',
  author: profile.name,
  title: page.value.title,
  description: page.value.description,
  twitterTitle: page.value.title,
  twitterDescription: page.value.description,
  ogImage: page.value.image,
  twitterImage: page.value.image,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.value.title,
  titleTemplate(title) {
    if (route.path === '/')
      return title || seo.title
    if (isWriting.value)
      return title
    return `${title} | ${seo.title}`
  },
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    },
    {
      name: 'charset',
      content: 'utf-8'
    }
  ],
  link,
})

const writingClass = 'mb-4 mt-8'
const contentClass = 'mb-4 mt-8 flex flex-1 flex-col justify-around gap-8 sm:gap-12'
</script>

<template>
  <Html :lang="seo.lang">
    <MApp class="relative bg-transparent">
      <Toc v-if="isWriting" :links="page?.body?.toc?.links!" />
      <!--      <MContentFloatingToc v-if="isWriting" :links="page?.body?.toc?.links!" />-->
      <ContentRenderer v-if="page" :value="page" :class="isWriting ? writingClass : contentClass" :data="mdcVars" />
    </MApp>
  </Html>
</template>
