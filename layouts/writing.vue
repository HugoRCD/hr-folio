<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt";
const { og, link } = useAppConfig();
const { name } = useSiteConfig();

useHead({
  titleTemplate: "",
  htmlAttrs: {
    lang: "en",
  },
  link
})
</script>

<template>
  <div class="relative">
    <SpeedInsights />
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-light dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[7%]" />
    </div>
    <main class="flex min-h-screen flex-col items-center justify-center bg-light p-4 dark:bg-dark sm:p-12">
      <LayoutLetterCard>
        <LayoutNavbar />
        <ContentDoc class="writing mt-6" />
        <CopyLink />
        <LayoutFooter />
      </LayoutLetterCard>
    </main>
    <Toasts
      position="top-center"
      close-button
      :toast-options="{
        style: {
          backgroundColor: 'var(--background-color)',
        }
      }"
    />
  </div>
</template>

