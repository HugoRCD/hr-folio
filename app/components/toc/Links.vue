<script setup lang="ts">
import type { TocLink } from '@nuxt/content'
import { useScrollspy, useNuxtApp, useRouter } from '#imports'

const { activeHeadings, updateHeadings } = useScrollspy()

type ContentTocProps = {
  title?: string
  links: TocLink[]
  active?: string
  isHover: boolean
}


const { title = 'Table of Contents', links = [] } = defineProps<ContentTocProps>()

const nuxtApp = useNuxtApp()
const router = useRouter()

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    ...document.querySelectorAll('h2'),
    ...document.querySelectorAll('h3')
  ])
})

const emit = defineEmits(['move'])

const scrollToHeading = (id: string): void => {
  const encodedId = encodeURIComponent(id)
  router.push(`#${encodedId}`)
  emit('move', id)
}
</script>

<template>
  <div>
    <ul v-if="links?.length && isHover" class="space-y-2">
      <li
        v-for="link in links"
        :key="link.text"
        :class="[
          link.depth === 3 ? 'ml-4' : ''
        ]"
      >
        <a
          class="block truncate text-xs/6"
          :class="activeHeadings.includes(link.id) ? 'text-accent' : 'text-tertiary hover:text-gray-700 dark:hover:text-gray-200'"
          :href="`#${link.id}`"
          @click.prevent="scrollToHeading(link.id)"
        >
          {{ link.text }}
        </a>

        <Links v-if="link.children" :links="link.children" :is-hover />
      </li>
    </ul>
    <div v-else-if="links?.length" class="space-y-4">
      <div
        v-for="link in links"
        :key="link.text"
        class="flex flex-col items-end gap-1"
      >
        <div
          class="h-[4px] rounded-full transition-all duration-200 cursor-pointer"
          :class="[
            activeHeadings.includes(link.id)
              ? 'w-12 bg-accent'
              : 'w-8 bg-secondary/20',
            link.depth === 3 ? 'w-6' : ''
          ]"
          @click="scrollToHeading(link.id)"
        />

        <Links v-if="link.children" :links="link.children" :is-hover />
      </div>
    </div>
  </div>
</template>
