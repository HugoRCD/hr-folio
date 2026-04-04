<script setup lang="ts">
const { url = '', title = '', description = '', image = '' } = defineProps<{
  url: string
  title?: string
  description?: string
  image?: string
}>()

const domain = computed(() => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
})
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="group my-4 flex overflow-hidden rounded-lg border border-muted/10 transition-all hover:border-muted/30 hover:bg-muted/5"
  >
    <div v-if="image" class="hidden w-32 shrink-0 sm:block">
      <img
        :src="image"
        :alt="title"
        class="size-full object-cover"
        loading="lazy"
      >
    </div>
    <div class="flex min-w-0 flex-col justify-center gap-1 px-4 py-3">
      <span class="truncate text-sm font-medium text-highlighted group-hover:text-primary">{{ title || url }}</span>
      <span v-if="description" class="line-clamp-2 text-xs text-muted">{{ description }}</span>
      <span class="flex items-center gap-1 text-[11px] text-muted/50">
        <UIcon name="i-lucide-arrow-up-right" class="size-3" />
        {{ domain }}
      </span>
    </div>
  </a>
</template>
