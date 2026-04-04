<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()

const items = ref<TabsItem[]>([
  {
    label: 'About me',
    value: 'about',
    slot: 'about',
    to: '/about'
  },
  {
    label: 'Timeline',
    value: 'timeline',
    slot: 'timeline',
    to: '/about/timeline'
  }
])

const active = computed({
  get() {
    return route.path === '/about/timeline' ? 'timeline' : 'about'
  },
  set(tab) {
    router.push(tab === 'timeline' ? '/about/timeline' : '/about')
  }
})
</script>

<template>
  <UTabs
    v-model="active"
    size="md"
    variant="link"
    :items
    class="w-full"
    :ui="{
      trigger: 'data-[state=active]:text-highlighted',
      label: 'relative w-fit font-serif text-2xl sm:text-2xl italic font-normal'
    }"
  >
    <template #trailing="{ item }">
      <span v-if="item.label === 'About me'" class="absolute -bottom-0.5 -right-3 font-serif text-5xl font-normal italic opacity-[9%] sm:text-6xl">
        1
      </span>
      <span v-if="item.label === 'Timeline'" class="absolute -bottom-0.5 -right-3 font-serif text-5xl font-normal italic opacity-[9%] sm:text-6xl">
        2
      </span>
    </template>

    <template #about>
      <div style="--stagger: 2;">
        <slot name="about" />
      </div>
    </template>

    <template #timeline>
      <div style="--stagger: 2;">
        <slot name="timeline" />
      </div>
    </template>
  </UTabs>
</template>
