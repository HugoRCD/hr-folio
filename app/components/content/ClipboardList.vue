<script setup lang="ts">
const { limit = 0 } = defineProps<{
  limit?: number
}>()

const isFullPage = computed(() => limit === 0)

const { data: allPosts } = await useAsyncData('clipboard-list', () =>
  queryCollection('clipboard')
    .order('date', 'DESC')
    .all()
)

const posts = computed(() => {
  if (!allPosts.value) return []
  return limit > 0 ? allPosts.value.slice(0, limit) : allPosts.value
})

const showViewAll = computed(() => limit > 0)
</script>

<template>
  <div class="flex flex-col gap-6">
    <component :is="limit > 0 ? 'h3' : 'h1'" class="font-serif text-lg italic text-highlighted">
      Clipboard<span class="text-primary">.</span>
    </component>

    <div class="flex flex-col">
      <NuxtLink
        v-for="(post, index) in posts"
        :key="post.path"
        :to="post.path"
        class="group flex items-baseline justify-between gap-4 py-2 animate-in opacity-0"
        :style="{ animationDelay: `${index * 40}ms` }"
      >
        <span class="font-medium text-highlighted decoration-primary group-hover:underline">{{ post.title }}</span>
        <span class="shrink-0 text-sm text-muted/60">
          {{ new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
        </span>
      </NuxtLink>
    </div>

    <NuxtLink
      v-if="showViewAll"
      to="/clipboard"
      class="text-sm text-muted/50 transition-colors hover:text-highlighted"
    >
      All clipboard &rarr;
    </NuxtLink>
  </div>
</template>
