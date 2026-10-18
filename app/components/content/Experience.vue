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
  <section class="relative">
    <SectionMark numeral="II" label="Experience" as="h3" />
    <ol class="flex flex-col">
      <li
        v-for="item in items"
        :key="item.company"
      >
        <component
          :is="item.url ? 'a' : 'div'"
          :href="item.url"
          :target="item.url ? '_blank' : undefined"
          :rel="item.url ? 'noopener noreferrer' : undefined"
          class="entry group flex items-baseline gap-3 py-2"
        >
          <span class="entry-title shrink-0 font-medium text-highlighted decoration-primary underline-offset-4" :class="item.url && 'group-hover:underline'">{{ item.company }}</span>
          <span class="entry-sub truncate text-sm text-muted">{{ item.role }}</span>
          <span class="leader" aria-hidden="true" />
          <span class="shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-muted/70">
            <!-- YAML reads a lone year as a number -->
            <template v-if="String(item.period).endsWith('∞')">{{ String(item.period).slice(0, -1) }}<InfinityMark class="ml-0.5" /></template>
            <template v-else>{{ item.period }}</template>
          </span>
        </component>
      </li>
    </ol>
  </section>
</template>
