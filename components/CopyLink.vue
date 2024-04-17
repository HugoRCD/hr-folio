<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl

function copyArticleLinkToClipboard() {
  const input = document.createElement('input')
  input.setAttribute('value', siteUrl + useRoute().path)
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  toast.success('Article link copied to clipboard !')
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

<style scoped>

</style>
