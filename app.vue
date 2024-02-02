<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt";

useSeoMeta({
  twitterTitle: '[twitter:title]',
  twitterDescription: '[twitter:description]',
  twitterImage: '[twitter:image]',
  twitterCard: 'summary'
})

useHead({
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ],
})
</script>

<template>
  <Html lang="en">
    <Body class="relative">
      <SpeedInsights />
      <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-light dark:blur-[200px] sm:size-72" />
      <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
        <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[7%]" />
      </div>
      <main class="flex min-h-screen flex-col items-center justify-center bg-light p-4 dark:bg-dark sm:p-12">
        <LayoutLetterCard>
          <LayoutNavbar />
          <ContentDoc class="mt-4 flex flex-1 flex-col justify-center gap-8" />
          <LayoutFooter />
        </LayoutLetterCard>
      </main>
      <Toasts
        position="top-center"
        :toast-options="{
          style: {
            backgroundColor: 'var(--background-color)',
          }
        }"
      />
    </Body>
  </Html>
</template>

