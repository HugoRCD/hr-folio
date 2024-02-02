<script setup lang="ts">
const { socials } = useAppConfig();
</script>

<template>
  <div
    class="flex flex-col gap-2"
  >
    <h2 class="font-newsreader text-xl font-medium italic">
      Socials
    </h2>
    <div class="grid w-fit grid-cols-3 gap-2">
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
  </div>
</template>

<style scoped>

</style>
