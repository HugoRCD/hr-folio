<script setup lang="ts">
const { data, error } = await useAsyncData('feed', () =>
  queryCollection('writing')
    .order('date', 'DESC')
    .limit(4)
    .all()
)
if (!data.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div class="flex flex-col text-lg gap-3">
    <NuxtLink
      v-for="(post, index) in data"
      :key="post.title"
      :to="post.path"
      class="link decoration-accent hover:underline font-extralight"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      {{ post.title }}
    </NuxtLink>
    <NuxtLink
      to="/writing"
      class="mt-2 link font-serif text-lg hover:underline"
      aria-label="See more, go to all articles, writing, etc ..."
    >
      <span class="sr-only">More writing</span>
      See more
    </NuxtLink>
  </div>
</template>
