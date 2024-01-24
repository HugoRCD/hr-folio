<template>
  <Html lang="en">
    <Body class="relative">
      <div class="absolute size-44 sm:size-72 dark:bg-light blur-[200px] dark:blur-[200px] rounded-full z-40 -top-56" />
      <div class="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-hidden">
        <div class="absolute noise z-50 pointer-events-none inset-[-200%] h-[900%] w-[400%] bg-[url('/noise.png')] opacity-[10%]" />
      </div>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>
<script setup lang="ts">
</script>
