<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { ROOM_LABEL, type ThingItem } from '~/utils/things'

const { items, spring } = defineProps<{
  items: ThingItem[]
  spring: Record<string, unknown>
}>()
</script>

<template>
  <motion.ol layout class="flex flex-col" :transition="spring" :initial="false">
    <AnimatePresence :initial="false" mode="popLayout">
      <motion.li
        v-for="(item, index) in items"
        :key="item.slug"
        layout
        class="relative"
        :style="{ '--i': index }"
        :transition="spring"
        :initial="false"
        :exit="{ opacity: 0 }"
      >
        <NuxtLink
          :to="thingPath(item)"
          class="entry group flex items-baseline gap-3 py-2"
        >
          <span class="entry-title flex min-w-0 items-baseline">
            <span class="in-gutter font-mono text-[10px] tabular-nums text-muted/40" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="min-w-0 truncate font-medium text-highlighted decoration-primary underline-offset-4 group-hover:underline">{{ item.name }}</span>
          </span>
          <span class="leader" aria-hidden="true" />
          <span class="entry-sub flex shrink-0 items-baseline gap-3">
            <span class="truncate text-sm text-muted">{{ item.brand }}</span>
            <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50">{{ ROOM_LABEL[item.room] }}</span>
            <time class="font-mono text-xs tabular-nums text-muted/70">{{ acquiredYear(item.acquired) }}</time>
            <span class="font-mono text-xs tabular-nums text-muted/70">{{ formatPrice(item.price) }}</span>
          </span>
        </NuxtLink>
      </motion.li>
    </AnimatePresence>
  </motion.ol>
</template>
