<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links = [] } = defineProps<{
  links: TocLink[]
}>()

const isOpen = ref(false)
const isMobile = ref(false)
const target = ref(null)

const { activeHeadings, updateHeadings } = useScrollspy()
const nuxtApp = useNuxtApp()

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

const handleInteraction = (event: 'enter' | 'leave' | 'click') => {
  if (isMobile.value) {
    if (event === 'click') {
      isOpen.value = !isOpen.value
    }
  } else {
    isOpen.value = event === 'enter'
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    ...document.querySelectorAll('h2'),
    ...document.querySelectorAll('h3')
  ])
})

onClickOutside(target, event => {
  if (isOpen.value) isOpen.value = false
})
</script>

<template>
  <div
    class="fixed z-50 scale-[0.9] sm:scale-[0.6] transition-all duration-300 ease-in-out right-2 top-1/2 -translate-y-1/2 origin-right"
    :class="[
      !isMobile && 'hover:scale-120'
    ]"
  >
    <div
      ref="target"
      class="rounded-md mx-auto transition-all duration-300 ease-in-out"
      :class="[
        isOpen ? 'bg-default/80 backdrop-blur-lg shadow-md border-[0.5px] border-default p-4' : 'p-0',
        isMobile && !isOpen ? 'bg-default/80 backdrop-blur-lg shadow-md border-[0.5px] border-default p-2 py-4 scale-50 origin-right' : ''
      ]"
      @mouseenter="handleInteraction('enter')"
      @mouseleave="handleInteraction('leave')"
      @click="isMobile && handleInteraction('click')"
    >
      <nav class="overflow-y-auto cursor-pointer">
        <div>
          <TocLinks
            :links
            :is-hover="isOpen"
            :active-headings
            :is-mobile
          />
        </div>
      </nav>
    </div>
  </div>
</template>
