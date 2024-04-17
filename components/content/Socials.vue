<script setup lang="ts">
const { socials } = useAppConfig()
</script>

<template>
  <div class="mt-2 grid w-fit grid-cols-3 gap-3">
    <NuxtLink
      v-for="social in socials"
      :key="social.name"
      class="link group flex items-center"
      :aria-label="`Go to ${social.name} profile`"
      :to="social.link"
      target="_blank"
    >
      {{ social.name }}<span class="i-lucide-arrow-up-right text-lg opacity-0 group-hover:opacity-100" />
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
