<script setup lang="ts">
import type { Known } from '~/utils/nearest'
import { instead } from '~/utils/nearest'
import { stoppedAt } from '~/utils/stopped'

// The watch, stopped at the error, and under it, in plain words, what happened and where to go.
// Press on the watch and the loupe looks at it closely; rub it quickly and the graphite smudges.
// It is stuck, too: once it has been drawn, and each time the crown is turned, the minute hand
// tries for the next minute, strains, and falls back to where it stopped.
const { code, path, near, places } = defineProps<{ code: number, path: string, near: Known[], places: Known[] }>()
const is404 = computed(() => code === 404)
const at = stoppedAt(code)
const links = computed(() => instead(near, places))

// --- stuck ---------------------------------------------------------------------------------------
const minute = ref(at.minute)
const hour = ref(at.hour)
const spin = ref(0)
const REACH = 0.72 * 6 // how far towards the next minute it gets, in degrees
let raf = 0
let first: ReturnType<typeof setTimeout> | undefined
let trying = false
let reduced = false
function attempt() {
  if (trying || reduced) return
  trying = true
  const t0 = performance.now()
  const turned = spin.value
  const frame = (t: number) => {
    const ms = t - t0
    let d = 0
    if (ms < 620) {
      // it creeps up, as the crown turns
      const u = ms / 620
      d = REACH * u * u * (3 - 2 * u)
      spin.value = turned + 6 * u
    } else if (ms < 920) {
      // strains against whatever holds it
      const u = (ms - 620) / 300
      d = REACH + 0.3 * Math.sin(u * Math.PI * 8) * (1 - u)
    } else {
      // and falls back, past where it was, and settles
      const u = (ms - 920) / 1000
      d = u < 1 ? REACH * Math.exp(-5 * u) * Math.cos(Math.PI * 2 * 2.2 * u) : 0
    }
    minute.value = at.minute + d
    hour.value = at.hour + d / 12
    if (ms < 1920) {
      raf = requestAnimationFrame(frame)
    } else {
      minute.value = at.minute
      hour.value = at.hour
      trying = false
    }
  }
  raf = requestAnimationFrame(frame)
}
onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // once the drawing has drawn itself
  first = setTimeout(attempt, 1700)
})
onBeforeUnmount(() => {
  clearTimeout(first)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <ErrorFrame>
    <div class="scene">
      <ErrorSketch
        :hour
        :minute
        :spin
        :dims="false"
        loupe
      >
        <button type="button" class="turn" aria-label="Turn the crown" @click="attempt" />
      </ErrorSketch>
      <div class="caption">
        <p class="code">
          Error {{ code }}
        </p>
        <h1 class="title">
          {{ is404 ? 'Page not found' : 'Something went wrong' }}
        </h1>
        <p v-if="is404" class="where">
          There's nothing at <s>{{ path }}</s>
        </p>
        <nav class="links" aria-label="Where to go instead">
          <NuxtLink v-for="l in links" :key="l.path" :to="l.path">
            {{ l.title }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </ErrorFrame>
</template>

<style scoped>
.scene {
  --w: min(380px, 74vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
/* the crown, at three o'clock: 214 of the drawing's 580 from its middle */
.turn {
  position: absolute;
  top: 50%;
  left: calc(50% + 214 * 100% / 580);
  width: 40px;
  height: 56px;
  translate: -50% -50%;
  border-radius: 12px;
  cursor: pointer;
}
.turn:focus-visible {
  outline: 1px solid var(--ui-primary);
  outline-offset: 2px;
}
.caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.code {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ui-primary);
}
.title {
  margin-top: 6px;
  font-family: var(--font-redaction);
  font-style: italic;
  font-weight: 400;
  font-size: 34px;
  line-height: 40px;
  color: var(--ui-text-highlighted);
}
.where {
  margin-top: 4px;
  font-size: 15px;
  color: var(--ui-text-muted);
}
.where s {
  display: inline-block;
  overflow-wrap: anywhere;
  font-family: var(--font-mono);
  font-size: 13px;
  text-decoration-color: var(--ui-primary);
}
.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 20px;
  margin-top: 18px;
}
.links a {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 17px;
  color: var(--ui-text-highlighted);
  text-decoration: underline;
  text-decoration-color: var(--ui-border);
  text-underline-offset: 4px;
  transition: text-decoration-color 0.2s ease;
}
.links a:hover,
.links a:focus-visible {
  text-decoration-color: var(--ui-primary);
  outline: none;
}
</style>
