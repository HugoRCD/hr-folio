<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt";
const { appName } = useAppConfig();

useHead({
  titleTemplate: `%s - ${appName}`,
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
});
</script>

<template>
  <Html lang="en">
    <Body class="relative">
      <SpeedInsights />
      <div class="absolute pointer-events-none size-44 sm:size-72 opacity-50 dark:bg-light blur-[200px] dark:blur-[200px] rounded-full z-40 -top-56" />
      <div class="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-hidden">
        <div class="absolute noise z-50 pointer-events-none inset-[-200%] size-[400%] bg-[url('/noise.png')] opacity-[7%]" />
      </div>
      <NuxtLayout class="bg-light dark:bg-dark">
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>
