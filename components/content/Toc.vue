<script setup lang="ts">
const { path } = useRoute()

const { data, error } = await useAsyncData(path, () =>
  queryContent(path).find()
)

if (!data.value || !error.value) createError({ statusCode: 404 })
</script>

<template>
  <div
    class="mt-6 flex flex-col gap-8"
  >
    <NuxtLink
      v-for="(post, index) in data"
      :key="post.title"
      :to="post._path"
      class="group relative max-w-prose"
      data-animate
      :aria-label="`Read ${post.title}`"
      :style="{ '--stagger': index }"
    >
      <h3 class="text-3xl font-medium italic decoration-accent group-hover:underline">
        {{ post.title }}
      </h3>
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
