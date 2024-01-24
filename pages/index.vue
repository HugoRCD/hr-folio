<script setup lang="ts">
const { socials } = useAppConfig();

const { data } = await useAsyncData("feed", () =>
    queryContent("/writing").sort({ date: -1 }).find()
);
</script>

<template>
  <div>
    <div class="flex flex-col">
      <h2 class="text-lg font-newsreader italic">
        Hugo Richard
      </h2>
      <h1 class="text-3xl font-newsreader italic text-accent">
        Developer and Designer
      </h1>
    </div>
    <p class="text-balance font-light max-w-lg">
      I like to make things, lots of things and i'm pretty good at it. I believe in a more simple and meaningful web.
      I'm on a mission to make the web a better place, giving meaning and soul to the content we create online.
    </p>
    <!--    <p class="blurred">
      But also a fucking genius
    </p>-->
    <div class="mt-4 flex flex-col gap-2 w-fit">
      <NuxtLink
        v-for="post in data"
        :key="post.title"
        :to="post._path"
        class="link"
      >
        {{ post.title }}
      </NuxtLink>
    </div>
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
  </div>
</template>

<style scoped>

</style>
