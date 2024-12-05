<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { title = 'Table of Contents', links = [] } = defineProps<{
  title?: string
  links: TocLink[]
}>()

const isHover = ref(false)
</script>

<template>
  <div class="max-sm:hidden fixed z-50 scale-[0.6] hover:scale-100 transition-transform duration-200 ease-in-out right-2 top-1/2 -translate-y-1/2 origin-right">
    <div
      class="w-fit rounded-md mx-auto"
      :class="[
        isHover ? 'bg-primary p-4 shadow-md  border border-secondary/20' : ''
      ]"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <nav class="overflow-y-auto">
        <div>
          <button v-if="links?.length && isHover" tabindex="-1" class="group flex w-full items-center gap-1.5 lg:cursor-text lg:select-text">
            <span class="truncate text-sm/6 font-newsreader italic font-light font-semibold">{{ title }}</span>
          </button>
          <TocLinks :links :is-hover />
        </div>
      </nav>
    </div>
  </div>
</template>
