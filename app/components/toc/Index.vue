<script setup lang="ts">
import type { TocLink } from '@nuxt/content'
import { AnimatePresence, motion } from 'motion-v'

const { links = [] } = defineProps<{
  links: TocLink[]
}>()

const isOpen = ref(false)
const target = ref<HTMLElement | null>(null)
const isMobile = useMediaQuery('(max-width: 639px)')

const { activeHeadings, updateHeadings } = useScrollspy()
const nuxtApp = useNuxtApp()

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    ...document.querySelectorAll('h2'),
    ...document.querySelectorAll('h3'),
  ])
})

onClickOutside(target, () => {
  isOpen.value = false
})

const flatLinks = computed(() => {
  const flat: TocLink[] = []
  function walk(items: TocLink[]) {
    for (const item of items) {
      flat.push(item)
      if (item.children) walk(item.children)
    }
  }
  walk(links)
  return flat
})

function onEnter() {
  if (!isMobile.value) isOpen.value = true
}
function onLeave() {
  if (!isMobile.value) isOpen.value = false
}
function toggle() {
  if (isMobile.value) isOpen.value = !isOpen.value
}

const router = useRouter()
function scrollTo(id: string) {
  router.push(`#${encodeURIComponent(id)}`)
}

const barSpring = { type: 'spring' as const, stiffness: 350, damping: 30 }
const fastSpring = { type: 'spring' as const, stiffness: 500, damping: 35 }

const colorMode = useColorMode()
const inactiveBarColor = computed(() =>
  colorMode.value === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
)
</script>

<template>
  <div
    ref="target"
    class="fixed right-4 top-1/2 z-50 -translate-y-1/2 cursor-pointer"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="toggle"
  >
    <div class="relative">
      <AnimatePresence>
        <motion.nav
          v-if="isOpen"
          key="expanded"
          class="flex flex-col items-end gap-0.5 py-2 pr-1 sm:bg-transparent sm:backdrop-blur-none"
          :class="isMobile && 'bg-default/95 backdrop-blur-lg border border-muted/10 p-3 shadow-lg'"
          :initial="{ opacity: 0, x: 6 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: 6 }"
          :transition="fastSpring"
        >
          <motion.a
            v-for="(link, i) in flatLinks"
            :key="link.id"
            class="block truncate text-right text-xs/6 transition-colors duration-150"
            :class="[
              activeHeadings.includes(link.id) ? 'text-primary' : 'text-muted hover:text-highlighted',
              link.depth === 3 ? 'max-w-32 text-[11px]/5' : 'max-w-44',
            ]"
            :href="`#${link.id}`"
            :initial="{ opacity: 0, x: 8 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ ...fastSpring, delay: i * 0.02 }"
            @click.prevent="scrollTo(link.id)"
          >
            {{ link.text }}
          </motion.a>
        </motion.nav>
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          v-if="!isOpen"
          key="collapsed"
          class="absolute right-0 top-1/2 -translate-y-1/2"
        >
          <div
            class="flex flex-col items-end gap-1.5 py-2"
            :class="isMobile && 'scale-75 origin-right'"
          >
            <motion.div
              v-for="link in flatLinks"
              :key="link.id"
              class="h-[2px]"
              :animate="{
                width: activeHeadings.includes(link.id)
                  ? (link.depth === 3 ? '14px' : '24px')
                  : (link.depth === 3 ? '8px' : '16px'),
                backgroundColor: activeHeadings.includes(link.id)
                  ? 'rgb(40, 83, 255)'
                  : inactiveBarColor,
              }"
              :transition="barSpring"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
