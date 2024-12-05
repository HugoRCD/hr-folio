<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links = [] } = defineProps<{
  links: TocLink[]
}>()

const isHover = ref(false)

const { activeHeadings, updateHeadings } = useScrollspy()
const nuxtApp = useNuxtApp()

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    ...document.querySelectorAll('h2'),
    ...document.querySelectorAll('h3')
  ])
})
</script>

<template>
  <div class="fixed z-50 scale-[0.6] hover:scale-100 transition-all duration-300 ease-in-out right-2 top-1/2 -translate-y-1/2 origin-right">
    <div
      class="rounded-md mx-auto transition-all duration-300 ease-in-out"
      :class="[
        isHover ? 'bg-primary shadow-md border border-secondary/20 p-4' : 'p-0 border-transparent'
      ]"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <nav class="overflow-y-auto">
        <div>
          <TocLinks :links :is-hover :active-headings />
        </div>
      </nav>
    </div>
  </div>
</template>
