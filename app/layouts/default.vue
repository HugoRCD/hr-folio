<script setup lang="ts">
const route = useRoute()
const router = useRouter()
</script>

<template>
  <UApp :tooltip="{ delayDuration: 0 }" class="relative">
    <ThemeSelector class="absolute top-4 right-4 z-50" />
    <main class="flex min-h-screen flex-col p-6">
      <div class="flex-1">
        <slot />
      </div>

      <CopyLink v-if="route.path.includes('/writing/') && route.name !== 'writing'" />

      <div
        class="flex items-end justify-end"
        :class="route.path !== '/' ? 'cursor-pointer' : 'cursor-default'"
        @click="router.push('/')"
      >
        <Signature class="mt-4 flex h-16 text-highlighted sm:mt-0 sm:h-20" />
      </div>
    </main>
  </UApp>
</template>
