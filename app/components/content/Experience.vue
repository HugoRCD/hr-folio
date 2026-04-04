<script setup lang="ts">
defineProps<{
  items: Array<{
    company: string
    role: string
    period: string
    url?: string
  }>
}>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="font-serif text-lg italic text-highlighted">
      Experience<span class="text-primary">.</span>
    </h3>
    <div class="flex flex-col">
      <template v-for="(item, index) in items" :key="item.company">
        <NuxtLink
          v-if="item.url"
          :to="item.url"
          target="_blank"
          class="group flex items-baseline justify-between gap-4 py-2 animate-in opacity-0"
          :style="{ animationDelay: `${index * 40}ms` }"
        >
          <div class="flex items-baseline gap-2">
            <span class="font-medium text-highlighted decoration-primary group-hover:underline">{{ item.company }}</span>
            <span class="text-sm text-muted">{{ item.role }}</span>
          </div>
          <span class="shrink-0 text-sm text-muted/60">{{ item.period }}</span>
        </NuxtLink>
        <div
          v-else
          class="flex items-baseline justify-between gap-4 py-2 animate-in opacity-0"
          :style="{ animationDelay: `${index * 40}ms` }"
        >
          <div class="flex items-baseline gap-2">
            <span class="font-medium text-highlighted">{{ item.company }}</span>
            <span class="text-sm text-muted">{{ item.role }}</span>
          </div>
          <span class="shrink-0 text-sm text-muted/60">{{ item.period }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
