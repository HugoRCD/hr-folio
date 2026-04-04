<script setup lang="ts">
const { url = '' } = defineProps<{
  url: string
}>()

const embedUrl = computed(() => {
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
  if (!match) return null
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`
})

const mounted = ref(false)
const loaded = ref(false)
onMounted(() => { mounted.value = true })
</script>

<template>
  <div v-if="embedUrl" class="breakout relative my-4 h-[152px]">
    <div v-if="!loaded" class="absolute inset-0 flex items-center justify-center rounded-xl bg-muted/5">
      <div class="size-5 animate-spin rounded-full border-2 border-muted/20 border-t-primary" />
    </div>
    <iframe
      v-if="mounted"
      :src="embedUrl"
      width="100%"
      height="152"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      class="relative block rounded-xl"
      style="border: 0"
      @load="loaded = true"
    />
  </div>
</template>
