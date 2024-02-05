<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col">
    <NuxtImg
      src="/hugo.webp"
      alt="Hugo Richard"
      width="80"
      height="80"
      sizes="160"
      class="mb-2 size-36 rounded-full object-cover"
    />
    <div class="mt-6 flex max-w-2xl flex-col gap-3 text-pretty">
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
