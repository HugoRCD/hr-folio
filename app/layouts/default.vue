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
  titleTemplate: (title) => {
    if (route.path === '/') return title || name
    if (route.path.includes('/writing/') || route.path.includes('/notes/')) return title
    return `${title} | ${name}`
  },
  htmlAttrs: {
    lang: 'en',
  },
  link,
})

const mainClass = computed(() => {
  if (route.path.includes('/writing/') || route.path.includes('/notes/')) {
    return 'writing enter-content mb-4 mt-8'
  }
  return 'content mb-4 mt-8 flex flex-1 flex-col justify-around gap-8 sm:gap-12'
})
</script>

<template>
  <div class="relative">
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    <main class="bg-light dark:bg-dark flex min-h-screen flex-col items-center justify-center p-3 sm:p-12">
      <LayoutLetterCard>
        <LayoutNavbar />
        <ContentDoc :class="mainClass">
          <template #not-found>
            <DocumentDrivenNotFound />
          </template>
        </ContentDoc>
        <CopyLink v-if="route.path.includes('/writing')" />
        <LayoutFooter />
      </LayoutLetterCard>
      <OssInfo />
    </main>
    <MToasts
      position="top-center"
      close-button
      :toast-options="{
        style: {
          backgroundColor: 'var(--primary-color)'
        }
      }"
    />
  </div>
</template>
