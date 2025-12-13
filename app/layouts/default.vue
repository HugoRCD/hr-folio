<script setup lang="ts">
const route = useRoute()
const router = useRouter()
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }" class="relative">
    <main class="flex min-h-screen flex-col p-3 sm:p-12">
      <div class="flex size-full mx-auto max-w-7xl flex-1 flex-col gap-3 border sm:border-2 border-default p-4 sm:p-6">
        <div class="flex w-full min-h-3" :class="route.path !== '/' ? 'justify-between' : 'justify-end'">
          <NuxtLink v-if="route.path !== '/'" aria-label="Go back to home page" class="group cursor-pointer" to="/">
            <span class="font-serif italic hover:text-primary hover:underline">
              go back<span class="text-primary">.</span>
            </span>
          </NuxtLink>
          <ThemeSelector />
        </div>

        <div class="flex-1">
          <slot />
        </div>

        <CopyLink v-if="route.path.includes('/writing/') && route.name !== 'writing'" />

        <div
          class="flex items-end justify-end"
          :class="route.path !== '/' ? 'cursor-pointer' : 'cursor-default'"
          @click="router.push('/')"
        >
          <Signature class="mt-4 flex h-16 fill-black dark:fill-white sm:mt-0 sm:h-20" />
        </div>
      </div>

      <span class="mt-2 text-xs text-center text-muted">
        This website is fully open-source, you can find the source code on <NuxtLink to="https://github.com/HugoRCD/hr-folio" class="underline">GitHub</NuxtLink>
      </span>
    </main>
  </UApp>
</template>
