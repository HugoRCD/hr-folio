<script setup lang="ts">
import type { LoaderProps } from '../types'

const props = withDefaults(defineProps<LoaderProps>(), {
  title: 'Loading Canvas',
  description: 'Preparing your visual journey...',
})

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Calculate progress percentage for display
 */
const percent = computed(() => Math.round(props.progress * 100))

/**
 * Calculate stroke dash offset for circular progress
 */
const dashOffset = computed(() => CIRCUMFERENCE * (1 - props.progress))

/**
 * Animation props for the content reveal
 */
const contentAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.2 }
}

/**
 * Check if loading is complete
 */
const isComplete = computed(() => props.progress >= 1)
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    leave-active-class="transition-all duration-700 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-default"
    >
      <div class="pointer-events-none fixed inset-0 size-full overflow-hidden">
        <div class="noise pointer-events-none absolute inset-[-200%] size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
      </div>

      <div class="relative flex flex-col items-center space-y-8">
        <div class="relative">
          <svg
            class="size-24 -rotate-90 transform"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              :r="RADIUS"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              stroke-width="2"
            />
            <circle
              cx="50"
              cy="50"
              :r="RADIUS"
              fill="none"
              stroke="rgba(255, 255, 255, 0.8)"
              stroke-width="2"
              stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="dashOffset"
              class="transition-all duration-300 ease-out"
            />
          </svg>
          
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xl font-medium text-highlighted">
              {{ percent }}%
            </span>
          </div>
        </div>

        <div class="text-center">
          <Motion v-bind="contentAnimation">
            <h2 class="text-2xl font-light text-highlighted mb-2">
              {{ title }}
            </h2>
            <p class="text-sm text-highlighted/60">
              {{ description }}
            </p>
          </Motion>
        </div>

        <div class="flex space-x-2">
          <div
            v-for="i in 3"
            :key="i"
            class="size-2 rounded-full bg-inverted/40"
            :class="{ 'animate-pulse': !isComplete }"
            :style="{ animationDelay: `${i * 0.2}s` }"
          />
        </div>
      </div>

      <div class="pointer-events-none absolute inset-0">
        <div class="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-inverted/5 blur-3xl" />
      </div>
    </div>
  </Transition>
</template> 
