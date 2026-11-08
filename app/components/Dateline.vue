<script setup lang="ts">
// Where and when the page is written from, as at the head of a letter (<Dateline>): the place, the
// date, and the hour with the sun beside it. The place is wherever Hugo is (see
// /api/folio/whereabouts); the date and hour are local to it. Only known in the browser.
//
// With `peek`, resting on the hour has the page's corner lift and show what keeps it, right under it
// (see PagePeel): after a moment, so that passing over it does nothing. Only where there is a page
// to lift.
import { SUN_ICON, sunIcon } from '~/utils/daylight'

const { peek = false } = defineProps<{ peek?: boolean }>()
const daylight = useState<{ phase: string, time: string, date: string, elevation: number, place: { city: string, country: string, timeZone: string, lat: number, lon: number } } | undefined>('daylight')

// Next to the hour, the sun: today's path over the horizon, small, and where it is on it now.
// The same drawing as the sun viewer it leads to.
const ICON = SUN_ICON
const sunPath = computed(() => {
  const d = daylight.value
  return d?.place.timeZone ? sunIcon(d.place, d.time) : null
})

const lift = useState<string | null>('peel-peek', () => null)
let intent: ReturnType<typeof setTimeout> | undefined
// On a phone it is a long press: held, the corner lifts, and letting go does not follow the link.
let peeked = false
function enter(e: PointerEvent) {
  if (!peek) return
  clearTimeout(intent)
  peeked = false
  intent = setTimeout(() => {
    lift.value = 'clock'
    peeked = e.pointerType !== 'mouse'
  }, e.pointerType === 'mouse' ? 320 : 450)
}
function leave() {
  clearTimeout(intent)
}
function follow(e: MouseEvent) {
  if (!peeked) return
  e.preventDefault()
  peeked = false
}
onBeforeUnmount(() => clearTimeout(intent))
</script>

<template>
  <ClientOnly>
    <p v-if="daylight?.date" class="flex flex-col text-right" data-construct="dateline">
      <span class="font-redaction text-[15px] italic leading-5 text-highlighted">From {{ daylight.place.city }},</span>
      <span class="font-redaction text-[15px] italic leading-5 text-muted">{{ daylight.date }}</span>
      <span class="hour mt-1.5 flex justify-end" @pointerenter="enter" @pointerleave="leave" @pointerup="leave" @click.capture="follow">
        <!-- the sun reading explains itself: it leads to the light, in the article on the site -->
        <NuxtLink
          to="/writing/how-i-redrew-my-portfolio#light"
          title="How the page is lit"
          class="flex items-center justify-end gap-1.5 whitespace-nowrap font-mono text-[10px] tabular-nums tracking-[0.04em] text-muted/60 transition-colors hover:text-highlighted"
        >
          <svg
            v-if="sunPath"
            data-mech="sun"
            :width="ICON.w"
            :height="ICON.h"
            :viewBox="`0 0 ${ICON.w} ${ICON.h}`"
            class="shrink-0 overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="dateline-sky">
                <rect x="-1" y="-2" :width="ICON.w + 2" :height="ICON.horizon + 2" />
              </clipPath>
            </defs>
            <path :d="`M0 ${ICON.horizon}H${ICON.w}`" class="sun-horizon" />
            <path :d="sunPath.d" class="sun-night" />
            <path :d="sunPath.d" class="sun-day" clip-path="url(#dateline-sky)" />
            <circle :cx="sunPath.x" :cy="sunPath.y" r="1.9" class="sun-dot" :class="{ up: sunPath.up }" />
          </svg>
          <span data-mech="hour">{{ daylight.time }}</span> · {{ daylight.phase }}
        </NuxtLink>
      </span>
    </p>
  </ClientOnly>
</template>

<style scoped>
/* every line is mixed into the paper, so the day's path crossing the horizon never darkens */
.sun-horizon {
  fill: none;
  stroke: color-mix(in oklab, currentColor 45%, var(--ui-bg));
  stroke-width: 0.75;
}
.sun-night {
  fill: none;
  stroke: color-mix(in oklab, currentColor 30%, var(--ui-bg));
  stroke-width: 0.75;
  stroke-dasharray: 1 1.5;
}
.sun-day {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 1;
}
.sun-dot {
  fill: var(--ui-bg);
  stroke: color-mix(in oklab, currentColor 70%, var(--ui-bg));
  stroke-width: 0.75;
}
.sun-dot.up {
  fill: var(--ui-primary);
  stroke: none;
}
/* held on a phone, the hour lifts the page: no callout, no selection */
.hour {
  -webkit-touch-callout: none;
  user-select: none;
}
</style>
