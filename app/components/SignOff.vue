<script setup lang="ts">
import { seenSinceLoad } from '~/utils/once'
// The close of the letter, set to the right as on a letter: a signing line is ruled across the
// right half of the column, then the name is written on it. The line is the script's baseline:
// the letters stand on it, the tail of the g and the swash of the H go through it, and the ink is
// over the line, as a pen's is over a printed rule. "Signed" opens it, on the same line.
const root = useTemplateRef<HTMLElement>('root')
const ink = useTemplateRef<{ write:() => void }>('ink')
const state = ref<'idle' | 'ruling' | 'signed'>('idle')
const still = ref(false)

const PEN_DELAY = 700 // ms: the line is ruled first, the pen lands as it nears the end

onMounted(() => {
  if (!root.value || matchMedia('(prefers-reduced-motion: reduce)').matches || seenSinceLoad('signed')) {
    still.value = true // already signed since the page loaded, or reduced motion: no ruling, no pen
    state.value = 'signed'
    return
  }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    io.disconnect()
    state.value = 'ruling'
    setTimeout(() => ink.value?.write(), PEN_DELAY)
  }, { threshold: 0.6 })
  io.observe(root.value)
})
</script>

<template>
  <div ref="root" class="sign-off" data-part="app/components/SignOff.vue" :class="{ still }" :data-state="state">
    <Signature ref="ink" class="relative z-[1]" manual align="end" @done="state = 'signed'" />
    <!-- at 64px the baseline is 466 units (29.8px) above the drawing's foot: the line goes up to 5px under it, so the name sits just above it -->
    <p class="label relative ml-auto -mt-[25px] mb-[24px] flex h-px w-1/2 items-center gap-3" aria-hidden="true">
      <span class="-mt-px font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Signed</span>
      <span class="rule h-px flex-1" />
    </p>
  </div>
</template>

<style scoped>
.rule {
  background: color-mix(in oklab, var(--ui-text) 16%, transparent);
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 900ms cubic-bezier(0.65, 0, 0.35, 1);
}
.label > span:not(.rule) {
  opacity: 0;
  transition: opacity 600ms ease 200ms;
}
.sign-off:not([data-state="idle"]) .rule {
  transform: scaleX(1);
}
.sign-off:not([data-state="idle"]) .rule {
  transition-delay: 150ms;
}
.sign-off:not([data-state="idle"]) .label > span {
  opacity: 1;
}
.still :is(.rule, .label > span) {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .rule, .label > span {
    transition: none;
  }
}
</style>
