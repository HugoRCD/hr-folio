<script setup lang="ts">
// The head of the sheet, as on a letter: the monogram, and where and when it is written from.
// The place is wherever Hugo is (see /api/folio/whereabouts); the date and hour are local to it.
import { monogramPath, monogramViewBox } from '~/utils/signature'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const daylight = useState<{ phase: string, time: string, date: string, elevation: number, place: { city: string, country: string } } | undefined>('daylight')

// the sun's height as a small dial: a quarter arc, a hand at the elevation
const hand = computed(() => {
  const e = Math.max(-18, Math.min(90, daylight.value?.elevation ?? 0))
  const a = (e * Math.PI) / 180
  return { x: 2 + Math.cos(a) * 12, y: 14 - Math.sin(a) * 12, below: e < 0 }
})
</script>

<template>
  <header class="relative mb-14 lg:mb-20">
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
        <ClientOnly>
          <p v-if="daylight?.date" class="flex flex-col text-right" data-construct="dateline">
            <span class="font-redaction text-[15px] italic leading-5 text-highlighted">{{ daylight.place.city }},</span>
            <span class="font-redaction text-[15px] italic leading-5 text-muted">{{ daylight.date }}</span>
            <span class="mt-1.5 flex items-center justify-end gap-1.5 whitespace-nowrap font-mono text-[10px] tabular-nums tracking-[0.04em] text-muted/60">
              <svg width="16" height="16" viewBox="0 0 16 16" class="shrink-0 overflow-visible" aria-hidden="true">
                <path d="M2 14H15M2 14V2" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width=".75" />
                <path
                  d="M14 14A12 12 0 0 0 2 2"
                  fill="none"
                  stroke="currentColor"
                  stroke-opacity=".25"
                  stroke-width=".75"
                  stroke-dasharray="1 2"
                />
                <path :d="`M2 14L${hand.x} ${hand.y}`" fill="none" class="stroke-primary" stroke-width="1" :stroke-opacity="hand.below ? .45 : 1" />
              </svg>
              {{ daylight.time }} · {{ daylight.phase }}
            </span>
          </p>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>
