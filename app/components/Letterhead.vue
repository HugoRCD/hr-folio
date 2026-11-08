<script setup lang="ts">
// The head of the sheet, as on a letter: the monogram, and where and when it is written from
// (<Dateline>). Resting on its hour lifts the page's corner.
import { monogramPath, monogramViewBox } from '~/utils/signature'

const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <header class="relative mb-14 lg:mb-20" data-part="app/components/Letterhead.vue">
    <div class="measure flex min-h-11 items-start gap-5">
      <!-- monogram: the H of the signature -->
      <NuxtLink to="/" aria-label="Hugo Richard, home" class="in-index top-0 flex lg:justify-start">
        <svg :viewBox="monogramViewBox" class="h-11 w-auto text-[#901112] dark:text-primary" aria-hidden="true">
          <path :d="monogramPath" fill="currentColor" />
        </svg>
      </NuxtLink>

      <NuxtLink
        v-if="!isHome"
        to="/"
        class="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted/50 transition-colors hover:text-highlighted lg:mt-4"
      >
        &larr; Index
      </NuxtLink>

      <!-- dateline, against the sheet's right edge as on a letter. It is only known in the browser,
           so its three lines (62px) are held from the start: nothing below moves when it arrives. -->
      <div class="in-note top-0 ml-auto flex min-h-[62px] justify-end">
        <Dateline peek />
      </div>
    </div>
  </header>
</template>
