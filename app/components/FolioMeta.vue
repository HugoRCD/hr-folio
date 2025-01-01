<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content'

const { page, isWriting } = defineProps<{
  page: ContentCollectionItem
  isWriting: boolean
}>()

useScriptPlausibleAnalytics({
  domain: 'hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const route = useRoute()
const { link, seo, profile } = useAppConfig()

const getPageSEO = () => ({
  title: isWriting ? page?.title : page?.title || seo.title,
  description: isWriting ? page?.description : page?.description || seo.description,
})

const getTitleTemplate = (title: string | undefined) => {
  if (route.path === '/') return title || `${seo.title} | ${profile.job}`
  if (isWriting) return title
  return `${title} | ${seo.title} - ${profile.job}`
}

const pageSEO = getPageSEO()

defineOgImageComponent(isWriting ? 'WritingPost' : 'Main', {
  ...pageSEO,
  avatar: profile.picture
}, {
  fonts: ['Geist:400', 'Geist:600'],
})

useSeoMeta({
  ogSiteName: seo.title,
  ogType: isWriting ? 'article' : 'website',
  author: profile.name,
  title: pageSEO.title,
  description: pageSEO.description,
  twitterTitle: pageSEO.title,
  twitterDescription: pageSEO.description,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.title,
  titleTemplate: getTitleTemplate,
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
  <slot />
</template>

