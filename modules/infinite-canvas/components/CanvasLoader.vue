<script setup lang="ts">
interface LoaderProps {
  title?: string
  description?: string
  progress: number
  isVisible: boolean
}

const props = withDefaults(defineProps<LoaderProps>(), {
  title: 'Loading Canvas',
  description: 'Preparing your visual journey...',
})

const circumference = 2 * Math.PI * 45
const strokeDashoffset = computed(() => {
  return circumference - (props.progress * circumference)
})

const progressPercent = computed(() => {
  return Math.round(props.progress * 100)
})
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black"
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
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              stroke-width="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.8)"
              stroke-width="2"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset
              class="transition-all duration-300 ease-out"
            />
          </svg>
          
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xl font-medium text-white">
              {{ progressPercent }}%
            </span>
          </div>
        </div>

        <div class="text-center">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.2 }"
          >
            <h2 class="text-2xl font-light text-white mb-2">
              {{ title }}
            </h2>
            <p class="text-sm text-white/60">
              {{ description }}
            </p>
          </Motion>
        </div>

        <div class="flex space-x-2">
          <div
            v-for="i in 3"
            :key="i"
            class="size-2 rounded-full bg-white/40"
            :class="{
              'animate-pulse': progress < 1,
            }"
            :style="{
              animationDelay: `${i * 0.2}s`
            }"
          />
        </div>
      </div>

      <div class="pointer-events-none absolute inset-0">
        <div class="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>
    </div>
  </Transition>
</template> 
