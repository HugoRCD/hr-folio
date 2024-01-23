<template>
  <Html>
    <Body class="relative dark:overflow-hidden h-screen transition-colors duration-300 ease-in-out bg-light dark:bg-dark">
      <div
        class="noise z-50 pointer-events-none bg-left-top absolute inset-[-200%] h-[400%] w-[400%] bg-[url('/noise.png')] opacity-[10%]"
      />
      <ThemeSelector class="absolute top-2 right-2 z-50" />
      <NuxtPage />
    </Body>
  </Html>
</template>

<script setup lang="ts">
</script>
