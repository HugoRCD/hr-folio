<script setup lang="ts">
const route = useRoute()

function copyArticleLinkToClipboard() {
  useClipboard({
    toCopy: `${window.location.origin}${route.path}`,
    callback: () => toast.success('Article link copied to clipboard !')
  })
}
</script>

<template>
  <div>
    <span
      class="link mt-4 cursor-pointer select-none"
      @click="copyArticleLinkToClipboard()"
    >
      Copy article link
    </span>
  </div>
</template>
