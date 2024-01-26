<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt"
</script>

<template>
  <Html lang="en">
    <Body class="relative">
      <SpeedInsights />
      <div class="absolute size-44 sm:size-72 opacity-50 dark:bg-light blur-[200px] dark:blur-[200px] rounded-full z-40 -top-56" />
      <div class="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-hidden">
        <div class="absolute noise z-50 pointer-events-none inset-[-200%] size-[400%] bg-[url('/noise.png')] opacity-[7%]" />
      </div>
      <NuxtLayout class="bg-light dark:bg-dark">
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>
