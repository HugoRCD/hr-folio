<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error?: NuxtError
}>()

const code = computed(() => {
  const n = Number(props.error?.statusCode)
  return Number.isFinite(n) && n > 0 ? n : 500
})
const is404 = computed(() => code.value === 404)

function goHome() {
  clearError({ redirect: '/' })
}

const homeBtnClass =
  'border-b border-primary font-[inherit] text-highlighted transition-colors hover:text-primary'
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-lg flex-col items-center justify-center bg-default px-6 py-16 text-center sm:min-h-[min(32rem,calc(100dvh-10rem))] sm:py-20"
  >
    <h1 class="font-serif text-7xl italic text-highlighted">
      {{ code }}
    </h1>
    <p class="mt-6 max-w-sm text-sm/6 text-muted">
      <template v-if="is404">
        I think you're lost, let's go back
        <button type="button" :class="homeBtnClass" @click="goHome">
          home
        </button>.
      </template>
      <template v-else>
        Something went wrong —
        <button type="button" :class="homeBtnClass" @click="goHome">
          back home
        </button>.
      </template>
    </p>
  </div>
</template>
