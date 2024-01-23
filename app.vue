<template>
  <Html class="overflow-hidden">
    <Body class="relative overflow-hidden h-screen">
      <div class="absolute size-72 bg-dark dark:bg-light blur-[200px] dark:blur-[200px] rounded-full z-40 -top-56" />
      <div
        class="absolute noise z-50 pointer-events-none inset-[-200%] h-[400%] w-[400%] bg-[url('/noise.png')] opacity-[10%]"
      />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<script setup lang="ts">
</script>
