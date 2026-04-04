<script setup lang="ts">
const { url = '' } = defineProps<{
  url: string
}>()

const embedUrl = computed(() => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
})

const mounted = ref(false)
const loaded = ref(false)
onMounted(() => { mounted.value = true })
</script>

<template>
  <div v-if="embedUrl" class="breakout relative my-4 aspect-video">
    <div v-if="!loaded" class="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/5">
      <div class="size-8 animate-spin rounded-full border-2 border-muted/20 border-t-primary" />
    </div>
    <iframe
      v-if="mounted"
      :src="embedUrl"
      class="absolute inset-0 block size-full rounded-lg"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowfullscreen
      loading="lazy"
      style="border: 0"
      @load="loaded = true"
    />
  </div>
</template>
