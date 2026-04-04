<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
const { agentLabel } = useAgentBrand()
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }">
    <SearchCommand />
    <ThemeSelector class="fixed right-6 top-6 z-50" />

    <main class="mx-auto flex min-h-dvh max-w-xl flex-col px-6 py-12 sm:py-20">
      <NuxtLink
        v-if="!isHome"
        to="/"
        class="mb-8 flex items-center gap-1 text-sm text-muted/50 transition-colors hover:text-highlighted"
      >
        &larr; Home
      </NuxtLink>

      <div class="flex-1">
        <slot />
      </div>

      <footer class="mt-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted/40">
        <span>&copy; {{ new Date().getFullYear() }}</span>
        <div class="flex items-center gap-3 font-mono text-[10px] text-muted/25">
          <NuxtLink
            to="/chat"
            class="inline-flex items-center gap-1 transition-colors hover:text-muted"
          >
            <UIcon name="custom:ai" class="size-3 opacity-90" /> {{ agentLabel }}
          </NuxtLink>
          <span class="text-muted/15" aria-hidden="true">|</span>
          <span>⌘K</span>
        </div>
      </footer>
    </main>
  </UApp>
</template>
