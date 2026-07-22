<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }">
    <SearchCommand />
    <div class="fixed right-6 top-6 z-50 flex items-center gap-2">
      <ThemeSelector />
    </div>

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
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-muted/25">
          <span>⌘K</span>
        </div>
      </footer>
    </main>
  </UApp>
</template>
