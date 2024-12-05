<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { title = 'Table of Contents', links = [] } = defineProps<{
  title?: string
  links: TocLink[]
}>()
</script>

<template>
  <nav class="overflow-y-auto">
    <div>
      <button v-if="links?.length" tabindex="-1" class="group flex w-full items-center gap-1.5 lg:cursor-text lg:select-text">
        <span class="truncate text-sm/6 font-newsreader italic font-light font-semibold">{{ title }}</span>
      </button>
      <TocLinks :links />
    </div>
  </nav>
</template>
