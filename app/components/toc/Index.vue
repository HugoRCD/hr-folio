<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { title = 'Table of Contents', links = [] } = defineProps<{
  title?: string
  links: TocLink[]
}>()
</script>

<template>
  <div class="max-sm:hidden fixed z-50 scale-[0.3] hover:scale-100 transition-transform duration-200 ease-in-out right-4 top-1/2 -translate-y-1/2 origin-right">
    <div class="bg-primary p-4 shadow-md w-fit rounded-md mx-auto border border-secondary/20">
      <nav class="overflow-y-auto">
        <div>
          <button v-if="links?.length" tabindex="-1" class="group flex w-full items-center gap-1.5 lg:cursor-text lg:select-text">
            <span class="truncate text-sm/6 font-newsreader italic font-light font-semibold">{{ title }}</span>
          </button>
          <TocLinks :links />
        </div>
      </nav>
    </div>
  </div>
</template>
