<script setup lang="ts">
const { page } = useContent()

useContentHead(page)

const { link } = useAppConfig()
const { name } = useSiteConfig()
const route = useRoute()

useSeoMeta({
  title: page.title,
  description: page.description,
  twitterTitle: page.title,
  twitterDescription: page.description,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.title,
  titleTemplate(title) {
    if (route.path === '/')
      return title || name
    return `${title} | ${name}`
  },
  link,
})
</script>

<template>
  <LayoutWrapper>
    <ContentDoc class="content mb-4 mt-8 flex flex-1 flex-col justify-around gap-8 sm:gap-12">
      <template #not-found>
        <DocumentDrivenNotFound />
      </template>
    </ContentDoc>
  </LayoutWrapper>
</template>
