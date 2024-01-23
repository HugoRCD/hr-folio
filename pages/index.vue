<script setup lang="ts">
const { socials } = useAppConfig();
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-3 p-12 h-full">
    <div class="relative h-full p-8 border-2 border-dark/20 dark:border-light/20 flex flex-col justify-center gap-3 w-full">
      <div class="size-52 bg-white blur-[200px] rounded-full z-40 absolute -top-56" />
      <h1 class="text-4xl font-newsreader italic">
        Hi i'm Hugo
      </h1>
      <p class="text-balance max-w-md">
        Developer and <span class="underline font-bold text-accent">designer</span>, i like to make things, lots of
        things and i'm pretty good at it
      </p>
      <p class="blurred">
        But also a fucking genius
      </p>
      <div class="mt-4 flex flex-col gap-2 w-fit">
        <NuxtLink
          v-for="social in socials"
          :key="social.name"
          class="link group cursor-pointer font-newsreader flex items-center gap-1 text-xl"
          :to="social.link"
          target="_blank"
        >
          {{ social.name }}<span class="i-lucide-arrow-up-right font-light hidden group-hover:block" />
        </NuxtLink>
      </div>
      <Signature class="absolute bottom-4 right-4 z-40 h-20 fill-black dark:fill-white" />
    </div>
  </div>
</template>

<style scoped>

</style>
