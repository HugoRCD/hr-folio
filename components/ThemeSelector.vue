<template>
  <ClientOnly>
    <div class="flex flex-row gap-2">
      <span
        class="cursor-pointer"
        :class="$colorMode.value !== 'dark' ? 'opacity-60' : 'opacity-100'"
        @click="$colorMode.preference = 'dark'"
      >
        Dark
      </span>
      /
      <span
        class="cursor-pointer"
        :class="$colorMode.value !== 'light' ? 'opacity-60' : 'opacity-100'"
        @click="$colorMode.preference = 'light'"
      >
        Light
      </span>
    </div>
    <template #fallback>
      <div class="h-6" />
    </template>
  </ClientOnly>
</template>
