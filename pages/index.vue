<script setup lang="ts">
const { socials } = useAppConfig();

const { data } = await useAsyncData("feed", () =>
    queryContent("/writing").sort({ date: -1 }).find()
);
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col">
      <h2 class="text-lg font-newsreader italic">
        Hugo Richard
      </h2>
      <h1 class="text-2xl sm:text-3xl font-newsreader italic text-accent">
        Developer and Designer
      </h1>
      <p class="text-balance font-light max-w-lg text-sm sm:text-base">
        I like to make things, lots of things and i'm pretty good at it. I believe in a more simple and meaningful web.
        I'm on a mission to make the web a better place, giving meaning and soul to the content we create online.
      </p>
    </div>
    <!--    <p class="blurred">
      But also a fucking genius
    </p>-->
    <div class="flex flex-col gap-2">
      <h2 class="italic font-newsreader text-xl">
        Writing
      </h2>
      <div class="flex flex-col gap-2 w-fit">
        <NuxtLink
          v-for="post in data"
          :key="post.title"
          :to="post._path"
          class="link"
        >
          {{ post.title }}
        </NuxtLink>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <h2 class="italic font-newsreader text-xl">
        Socials
      </h2>
      <div class="flex flex-col gap-2 w-fit">
        <NuxtLink
          v-for="social in socials"
          :key="social.name"
          class="link group flex items-center"
          :to="social.link"
          target="_blank"
        >
          {{ social.name }}<span class="i-lucide-arrow-up-right text-lg hidden group-hover:block" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
