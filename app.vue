<template>
  <Html class="overflow-hidden">
    <Body class="relative overflow-hidden h-screen transition-colors duration-300 ease-in-out bg-light dark:bg-dark">
      <div class="absolute size-72 bg-dark dark:bg-light blur-[200px] dark:blur-[200px] rounded-full z-40 -top-56" />
      <div
        class="noise z-50 pointer-events-none absolute inset-[-200%] h-[400%] w-[400%] bg-[url('/noise.png')] opacity-[10%]"
      />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<script setup lang="ts">
</script>
