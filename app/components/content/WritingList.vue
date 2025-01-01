<script setup lang="ts">
const { data, error } = await useAsyncData('feed', () => queryCollection('writing').order('date', 'DESC').limit(4).all())
if (!data.value || !error.value) createError({ statusCode: 404 })

const sortedPosts = computed(() => {
  if (!data.value) return []
  return [...data.value]
    .sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'))
      const dateB = new Date(b.date.split('/').reverse().join('-'))

      return dateB.getTime() - dateA.getTime()
    })
    .map((post, index) => ({ post, index }))
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <NuxtLink
      v-for="{ post, index } in sortedPosts"
      :key="post.title"
      :to="post.path"
      class="link text-secondary text-lg decoration-accent hover:underline font-extralight"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      {{ post.title }}
    </NuxtLink>
    <NuxtLink
      to="/writing"
      class="mt-2 link font-newsreader text-lg text-secondary hover:underline"
      aria-label="See more, go to all articles, writing, etc ..."
    >
      <span class="sr-only">More writing</span>
      See more
    </NuxtLink>
  </div>
</template>
