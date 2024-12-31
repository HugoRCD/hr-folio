<script setup lang="ts">
useScriptPlausibleAnalytics({
  domain: 'hrcd.fr',
  scriptInput: {
    src: 'https://analytics.hrcd.fr/js/script.js',
  }
})

const route = useRoute()
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first()
)
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })

const { link, seo, socials, profile } = useAppConfig()
const mdcVars = ref({ ...seo, ...profile, ...socials })
const isWriting = computed(() => route.path.includes('/writing/'))

const getPageSEO = () => ({
  title: isWriting.value ? page.value?.title : page.value?.title || seo.title,
  description: isWriting.value ? page.value?.description : page.value?.description || seo.description,
})

const getTitleTemplate = (title: string | undefined) => {
  if (route.path === '/') return title || `${seo.title} | ${profile.job}`
  if (isWriting.value) return title
  return `${title} | ${seo.title} - ${profile.job}`
}

const pageSEO = getPageSEO()

defineOgImageComponent(isWriting.value ? 'WritingPost' : 'Main', {
  ...pageSEO,
  icon: page.value.icon,
  avatar: profile.picture
}, {
  fonts: ['Geist:400', 'Geist:600'],
})

useSeoMeta({
  ogSiteName: seo.title,
  ogType: isWriting.value ? 'article' : 'website',
  author: profile.name,
  title: pageSEO.title,
  description: pageSEO.description,
  twitterTitle: pageSEO.title,
  twitterDescription: pageSEO.description,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.value.title,
  titleTemplate: getTitleTemplate,
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'charset', content: 'utf-8' },
    { name: 'robots', content: 'index, follow' },
    { name: 'color-scheme', content: 'light dark' }
  ],
  link,
})

const contentClasses = {
  writing: 'mb-4 mt-8',
  default: 'mb-4 mt-8 flex flex-1 flex-col justify-around gap-8 sm:gap-12'
}
</script>

<template>
  <Html :lang="seo.lang">
    <MApp class="relative bg-transparent">
      <Toc v-if="isWriting" :links="page?.body?.toc?.links!" />
      <ContentRenderer
        v-if="page"
        :value="page"
        :class="isWriting ? contentClasses.writing : contentClasses.default"
        :data="mdcVars"
      />
    </MApp>
  </Html>
</template>
