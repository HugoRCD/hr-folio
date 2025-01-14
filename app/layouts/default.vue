<script setup lang="ts">
const route = useRoute()
const router = useRouter()
</script>

<template>
  <div class="relative">
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    <main class="flex min-h-screen flex-col items-center justify-center p-3 sm:p-12">
      <div class="flex size-full max-w-7xl flex-1 flex-col justify-between gap-3 border-1 sm:border-2 border-main p-4 sm:p-6">
        <div class="flex w-full" :class="route.path !== '/' ? 'justify-between' : 'justify-end'">
          <NuxtLink v-if="route.path !== '/'" aria-label="Go back to home page" class="group cursor-pointer" to="/">
            <span class="font-newsreader italic hover:text-accent hover:underline">
              go back<span class="text-accent">.</span>
            </span>
          </NuxtLink>
          <ThemeSelector />
        </div>
        <slot />
        <CopyLink v-if="route.path.includes('/writing/') && route.name !== 'writing'" />
        <div class="flex justify-center sm:justify-end" :class="route.path !== '/' ? 'cursor-pointer' : 'cursor-default'" @click="router.push('/')">
          <Signature class="mt-4 flex h-16 fill-black dark:fill-white sm:mt-0 sm:h-20" />
        </div>
      </div>
      <span class="mt-2 text-xs text-center text-tertiary">
        This website is fully open-source, you can find the source code on <NuxtLink to="https://github.com/HugoRCD/hr-folio" class="underline">GitHub</NuxtLink>
      </span>
    </main>
  </div>
</template>
