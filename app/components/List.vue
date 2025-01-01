<script setup lang="ts">
type Post = {
  title: string
  date: string
  description: string
  path: string
}

type ListProps = {
  data: Post[]
  sort?: 'asc' | 'desc'
}

const { data, sort = 'desc' } = defineProps<ListProps>()

const sortedPosts = computed(() => {
  return [...data]
    .sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'))
      const dateB = new Date(b.date.split('/').reverse().join('-'))

      return sort === 'desc'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime()
    })
    .map((post, index) => ({ post, index }))
})
</script>

<template>
  <div class="mt-6 flex flex-col gap-8">
    <NuxtLink
      v-for="{ post, index } in sortedPosts"
      :key="post.title"
      :to="post.path"
      class="group relative max-w-prose"
      data-animate
      :style="{ '--stagger': index }"
      :aria-label="`Read ${post.title}`"
    >
      <div class="font-newsreader text-lg italic opacity-50">
        {{ post.date }}
      </div>
      <h3 class="text-2xl font-newsreader font-medium italic decoration-accent group-hover:underline">
        {{ post.title }}
      </h3>
      <p class="text-sm">
        {{ post.description }}
      </p>
    </NuxtLink>
  </div>
</template>
