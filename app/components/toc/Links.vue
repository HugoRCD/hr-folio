<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links = [], isHover, isMobile } = defineProps<{
  links: TocLink[]
  active?: string
  isHover: boolean
  activeHeadings: string[]
  isMobile: boolean
}>()

const router = useRouter()

const scrollToHeading = (id: string): void => {
  if (!isMobile || (isMobile && isHover)) {
    const encodedId = encodeURIComponent(id)
    router.push(`#${encodedId}`)
  }
}
</script>

<template>
  <div>
    <Transition
      enter-active-class="transition-all duration-100 ease-in-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-100 ease-in-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <ul v-if="links?.length && isHover" class="space-y-2">
        <li
          v-for="link in links"
          :key="link.text"
          :class="[
            link.depth === 3 ? 'ml-4' : ''
          ]"
        >
          <a
            class="block truncate text-xs/6 transition-all duration-500 ease-in-out"
            :class="activeHeadings.includes(link.id) ? 'text-accent' : 'text-(--ui-text-muted)'"
            :href="`#${link.id}`"
            @click.prevent="scrollToHeading(link.id)"
          >
            {{ link.text }}
          </a>

          <Links
            v-if="link.children"
            :links="link.children"
            :is-hover
            :active-headings
            :is-mobile
          />
        </li>
      </ul>
      <div v-else-if="links?.length" class="space-y-4">
        <div
          v-for="link in links"
          :key="link.text"
          class="flex flex-col items-end gap-1"
        >
          <div
            class="h-[4px] rounded-full transition-all duration-500 ease-in-out"
            :class="[
              activeHeadings.includes(link.id)
                ? 'w-12 bg-accent'
                : 'w-8 bg-(--ui-bg-accented)',
              link.depth === 3 ? 'w-6' : '',
              isMobile ? 'cursor-default' : 'cursor-pointer'
            ]"
          />

          <Links
            v-if="link.children"
            :links="link.children"
            :is-hover
            :active-headings
            :is-mobile
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
