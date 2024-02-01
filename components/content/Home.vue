<script setup lang="ts">
const { socials, appName } = useAppConfig();

const { data } = await useAsyncData("feed", () =>
    queryContent("/writing").sort({ date: -1 }).find()
);

useHead({
  title: "",
  titleTemplate: appName
});

defineOgImage({ url: '/social-preview.jpg', width: 1200, height: 630, alt: "Home image" });
</script>

<template>
  <div class="flex flex-col gap-8">
    <div
      class="flex flex-col"
      data-animate
      style="--stagger: 1"
    >
      <NuxtImg
        src="/hugo.webp"
        alt="Hugo Richard"
        width="80"
        height="80"
        sizes="160"
        class="mb-2 size-20 rounded-full object-cover"
      />
      <h2 class="w-fit font-newsreader text-lg italic">
        Hugo Richard
      </h2>
      <h1 class="font-newsreader text-2xl italic text-accent sm:text-3xl">
        Developer and Designer
      </h1>
      <p class="max-w-[600px] text-pretty text-sm font-extralight sm:text-base">
        I like to make things, lots of things and i'm pretty good at it. I believe in a more simple and meaningful web.
        I'm on a mission to make the web a better place, giving meaning and soul to the content we create online.
      </p>
    </div>
    <div
      class="flex flex-col gap-2"
      data-animate
      style="--stagger: 2"
    >
      <h2 class="font-newsreader text-xl italic">
        Writing
      </h2>
      <div class="flex w-fit flex-col gap-2">
        <NuxtLink
          v-for="post in data"
          :key="post.title"
          :to="post._path"
          class="link font-extralight"
        >
          {{ post.title }}
        </NuxtLink>
        <NuxtLink
          to="/writing"
          class="link text-sm font-[400]"
          aria-label="See more, go to writing page"
        >
          See more
        </NuxtLink>
      </div>
    </div>
    <div
      class="flex flex-col gap-2"
      data-animate
      style="--stagger: 3"
    >
      <h2 class="font-newsreader text-xl italic">
        Socials
      </h2>
      <div class="grid w-fit grid-cols-3 gap-2">
        <NuxtLink
          v-for="social in socials"
          :key="social.name"
          class="link group flex items-center"
          :to="social.link"
          target="_blank"
        >
          {{ social.name }}<span class="i-lucide-arrow-up-right text-lg opacity-0 group-hover:opacity-100" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
