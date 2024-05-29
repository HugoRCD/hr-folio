<script setup lang="ts">
const colorMode = useColorMode()

const switchTheme = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  colorMode.preference = colorMode.value
}

function startViewTransition(theme: string) {
  if (theme === colorMode.value) return
  if (!document.startViewTransition) {
    switchTheme()
    return
  }
  if (window.innerWidth < 768) {
    switchTheme()
    return
  }
  document.startViewTransition(switchTheme)
}
</script>

<template>
  <ClientOnly>
    <div class="flex flex-row gap-2 text-secondary">
      <div
        class="flex cursor-pointer items-center gap-2"
        @click="startViewTransition('dark')"
      >
        <div
          class="size-3 border-2 border-black dark:border-white"
          :class="{ 'bg-black dark:bg-white': $colorMode.value === 'dark' }"
        />
        <span>Dark</span>
      </div>
      <span>|</span>
      <div
        class="flex cursor-pointer items-center gap-2"
        @click="startViewTransition('light')"
      >
        <div
          class="size-3 border-2 border-black dark:border-white"
          :class="{ 'bg-black dark:bg-white': $colorMode.value === 'light' }"
        />
        <span>Light</span>
      </div>
    </div>
    <template #fallback>
      <div class="h-6" />
    </template>
  </ClientOnly>
</template>

<style>
/* Dark/Light reveal effect */
::view-transition-group(root) {
  animation-duration: 1.5s;
}
::view-transition-new(root),
::view-transition-old(root) {
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  animation-name: reveal-light;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
}
.dark::view-transition-new(root) {
  animation-name: reveal-dark;
}

@keyframes reveal-dark {
  from {
    clip-path: polygon(-30% 0, -30% 0, -15% 100%, -10% 115%);
  }
  to {
    clip-path: polygon(-30% 0, 130% 0, 115% 100%, -10% 115%);
  }
}

@keyframes reveal-light {
  from {
    clip-path: polygon(130% 0, 130% 0, 115% 100%, 110% 115%);
  }
  to {
    clip-path: polygon(130% 0, -30% 0, -15% 100%, 110% 115%);
  }
}

</style>
