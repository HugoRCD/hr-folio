<script setup lang="ts">
const { data, error } = await useAsyncData('feed', () => queryCollection('writing').limit(4).all())

if (!data.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div class="flex flex-col gap-3">
    <NuxtLink
      v-for="(post, index) in data"
      :key="post.title"
      :to="post.path"
      class="link text-secondary text-lg decoration-accent hover:underline"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      {{ post.title }}
    </NuxtLink>
    <NuxtLink
      to="/writing"
      class="link mt-2 font-newsreader tracking-wider text-lg"
      aria-label="See more, go to all articles, writing, etc ..."
    >
      <span class="sr-only">More writing</span>
      More
    </NuxtLink>
  </div>
</template>
