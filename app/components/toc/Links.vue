<script setup lang="ts">
import type { TocLink } from '@nuxt/content'
import { useScrollspy, useNuxtApp, useRouter } from '#imports'

const { activeHeadings, updateHeadings } = useScrollspy()

type ContentTocProps = {
  title?: string
  links: TocLink[]
  active?: string
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
  <ul v-if="links?.length">
    <li v-for="link in links" :key="link.text" :class="link.depth === 3 ? 'ml-3' : ''">
      <a
        class="block truncate text-xs/6"
        :class="activeHeadings.includes(link.id) ? 'text-accent' : 'text-tertiary hover:text-gray-700 dark:hover:text-gray-200'"
        :href="`#${link.id}`"
        @click.prevent="scrollToHeading(link.id)"
      >
        {{ link.text }}
      </a>

      <Links v-if="link.children" :links="link.children" />
    </li>
  </ul>
</template>
