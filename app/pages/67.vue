<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: '67',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

defineOgImage(false)
</script>

<template>
  <div class="fixed inset-0 bg-black">
    <NuxtImg
      src="/images/67.png"
      alt=""
      class="size-full object-contain"
      densities="x1 x2"
      loading="eager"
      fetchpriority="high"
    />
  </div>
</template>
