<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
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

      <footer class="mt-16 flex items-center justify-between text-sm text-muted/40">
        <span>&copy; {{ new Date().getFullYear() }}</span>
        <span class="font-mono text-[10px] text-muted/25">⌘K</span>
      </footer>
    </main>
  </UApp>
</template>
