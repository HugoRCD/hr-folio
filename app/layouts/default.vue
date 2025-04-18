<script setup lang="ts">
import { LayoutGroup } from 'motion-v'

const route = useRoute()
const router = useRouter()

const contentRef = ref(null)
const containerRef = ref(null)

const layoutTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  duration: 0.5
}
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }" class="relative">
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    <main class="flex min-h-screen flex-col items-center justify-center p-3 sm:p-12">
      <LayoutGroup id="main-layout">
        <Motion
          ref="containerRef"
          layout
          :transition="layoutTransition"
          class="flex size-full max-w-7xl flex-1 flex-col justify-between gap-3 border-1 sm:border-2 border-(--ui-border) p-4 sm:p-6"
        >
          <div class="flex w-full min-h-3" :class="route.path !== '/' ? 'justify-between' : 'justify-end'">
            <NuxtLink v-if="route.path !== '/'" aria-label="Go back to home page" class="group cursor-pointer" to="/">
              <span class="font-serif italic hover:text-accent hover:underline">
                go back<span class="text-accent">.</span>
              </span>
            </NuxtLink>
            <ThemeSelector />
          </div>

          <Motion ref="contentRef" layout>
            <slot />
          </Motion>

          <CopyLink v-if="route.path.includes('/writing/') && route.name !== 'writing'" />

          <Motion
            layout
            class="flex justify-center sm:justify-end"
            :class="route.path !== '/' ? 'cursor-pointer' : 'cursor-default'"
            @click="router.push('/')"
          >
            <Signature class="mt-4 flex h-16 fill-black dark:fill-white sm:mt-0 sm:h-20" />
          </Motion>
        </Motion>
      </LayoutGroup>

      <span class="mt-2 text-xs text-center text-(--ui-text-muted)">
        This website is fully open-source, you can find the source code on <NuxtLink to="https://github.com/HugoRCD/hr-folio" class="underline">GitHub</NuxtLink>
      </span>
    </main>
  </UApp>
</template>
