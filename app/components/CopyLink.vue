<script setup lang="ts">
const route = useRoute()

async function copyArticleLinkToClipboard() {
  const link = `${window.location.origin}${route.path}`
  try {
    await navigator.clipboard.writeText(link)
    toast.success('Article link copied to clipboard !')
  } catch (error) {
    toast.error('Failed to copy link to clipboard')
  }
}
</script>

<template>
  <div>
    <span
      class="mt-4 cursor-pointer select-none text-muted hover:text-highlighted"
      @click="copyArticleLinkToClipboard()"
    >
      Copy article link
    </span>
  </div>
</template>
