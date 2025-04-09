<script setup lang="ts">
import type { BlobObject } from '@nuxthub/core'

const blobs = ref<BlobObject[]>([])
const hasMore = ref(true)
const cursor = ref()

async function loadMore() {
  if (!hasMore.value) {
    return
  }
  const res = await $fetch('/api/blobs', {
    query: {
      limit: 10,
      cursor: cursor.value
    }
  })
  blobs.value.push(...res.blobs)
  hasMore.value = res.hasMore
  cursor.value = res.cursor
}

loadMore()
</script>

<template>
  <div>
    <NuxtImg
      v-for="blob in blobs"
      :key="blob.pathname"
      :src="`/images/${blob.pathname}`"
      :alt="blob.pathname"
      class="w-28"
    />
    <UButton label="Load more" @click="loadMore" />
  </div>
</template>
