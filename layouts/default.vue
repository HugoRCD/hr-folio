<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt";
const { link } = useAppConfig();
const { name, description } = useSiteConfig();

useSeoMeta({
  title: name,
  twitterTitle: name,
  twitterDescription: description,
  twitterCard: 'summary_large_image'
})

useHead({
  titleTemplate: name,
  htmlAttrs: {
    lang: "en",
  },
  link
})
</script>

<template>
  <div class="relative">
    <SpeedInsights />
    <div class="dark:bg-light pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[7%]" />
    </div>
    <main class="bg-light dark:bg-dark flex min-h-screen flex-col items-center justify-center p-3 sm:p-12">
      <LayoutLetterCard>
        <LayoutNavbar />
        <ContentDoc class="my-6 flex flex-1 flex-col justify-around gap-12 sm:gap-12" />
        <LayoutFooter />
      </LayoutLetterCard>
    </main>
    <Toasts
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

