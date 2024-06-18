<script setup lang="ts">
const { page } = useContent()

useContentHead(page)

const { link } = useAppConfig()

useSeoMeta({
  title: page.title,
  description: page.description,
  twitterTitle: page.title,
  twitterDescription: page.description,
  twitterCard: 'summary_large_image'
})

useHead({
  title: page.title,
  titleTemplate() {
    return page.title
  },
  link,
})
</script>

<template>
  <LayoutWrapper>
    <ContentDoc class="writing enter-content mb-4 mt-8">
      <template #not-found>
        <DocumentDrivenNotFound />
      </template>
    </ContentDoc>
  </LayoutWrapper>
</template>
