<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const items = ref<TabsItem[]>([
  {
    label: 'About me',
    slot: 'about'
  },
  {
    label: 'Timeline',
    slot: 'timeline'
  }
])
</script>

<template>
  <UTabs 
    size="md"
    variant="link"
    :items
    class="w-full"
    data-animate
    style="--stagger: 1;"
    :ui="{
      trigger: 'data-[state=active]:text-highlighted',
      label: 'relative w-fit font-serif text-2xl sm:text-2xl italic font-normal'
    }"
  >
    <template #trailing="{ item }">
      <span class="text-primary text-lg -left-2">
        .
      </span>
      <span v-if="item.label === 'About me'" class="absolute -bottom-0.5 -right-5 font-serif text-5xl font-normal italic opacity-[9%] sm:text-6xl">
        1
      </span>
      <span v-if="item.label === 'Timeline'" class="absolute -bottom-0.5 -right-5 font-serif text-5xl font-normal italic opacity-[9%] sm:text-6xl">
        2
      </span>
    </template>

    <template #about>
      <slot name="about" />
    </template>

    <template #timeline>
      <slot name="timeline" />
    </template>
  </UTabs>
</template>
