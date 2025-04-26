<script setup lang="ts">
import type { Collections } from '@nuxt/content'

defineProps<{
  posts: Collections['writing'][]
}>()
</script>

<template>
  <div class="mt-6 flex flex-col gap-8">
    <NuxtLink
      v-for="(post, index) in posts"
      :key="post.title"
      :to="post.path"
      class="group relative max-w-prose"
      data-animate
      :style="{ '--stagger': index }"
      :aria-label="`Read ${post.title}`"
    >
      <div class="font-serif text-lg italic opacity-50">
        {{ new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
      </div>
      <h3 class="text-2xl font-serif font-medium italic decoration-primary group-hover:underline">
        {{ post.title }}
      </h3>
      <p class="text-sm text-muted">
        {{ post.description }}
      </p>
    </NuxtLink>
  </div>
</template>
