<script setup lang="ts">
const { data, error } = await useAsyncData('feed', () =>
  queryContent('/writing/').find()
)

if (!data.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div
    class="flex flex-col gap-3"
  >
    <NuxtLink
      v-for="(post, index) in data"
      :key="post.title"
      :to="post._path"
      class="link text-lg"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      {{ post.title }}
    </NuxtLink>
    <NuxtLink
      to="/writing"
      class="link mt-2 font-newsreader font-medium"
      aria-label="See more, go to all articles, writing, etc ..."
    >
      <span class="sr-only">More writing</span>
      More
    </NuxtLink>
  </div>
</template>
