<template>
  <Html class="overflow-hidden">
    <Body class="relative overflow-hidden h-screen transition-colors duration-300 ease-in-out bg-light dark:bg-dark">
      <div class="absolute size-72 bg-dark dark:bg-light blur-[200px] dark:blur-[200px] rounded-full z-40 -top-56" />
      <div
        class="noise z-50 pointer-events-none absolute inset-[-200%] h-[400%] w-[400%] bg-[url('/noise.png')] opacity-[10%]"
      />
      <div class="flex flex-col justify-center items-center gap-3 p-6 sm:p-12 h-full">
        <div class="relative h-full p-8 border-2 border-dark/20 dark:border-light/20 flex flex-col justify-center gap-3 w-full">
          <ThemeSelector class="absolute top-4 right-4 z-50" />
          <NuxtPage />
          <Signature class="absolute bottom-4 right-4 z-40 h-20 fill-black dark:fill-white" />
        </div>
      </div>
    </Body>
  </Html>
</template>

<script setup lang="ts">
</script>
