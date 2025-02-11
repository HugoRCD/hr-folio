<script setup lang="ts">

const colorMode = useColorMode()
const reduceMotion = useCookie<boolean>('reduceMotion', {
  watch: true,
})

const switchTheme = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  colorMode.preference = colorMode.value
}

const startViewTransition = (theme: string) => {
  if (theme === colorMode.value) return
  if (reduceMotion.value) {
    switchTheme()
    return
  }
  if (!document.startViewTransition) {
    switchTheme()
    return
  }
  if (window.innerWidth < 768) {
    switchTheme()
    return
  }

  document.documentElement.classList.add('theme-transitioning')

  const transition = document.startViewTransition(() => {
    switchTheme()
  })

  transition.finished.then(() => {
    document.documentElement.classList.remove('theme-transitioning')
  })
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
.theme-transitioning::view-transition-group(root) {
  animation-duration: 1.5s;
}

.theme-transitioning::view-transition-new(root),
.theme-transitioning::view-transition-old(root) {
  mix-blend-mode: normal;
}

.theme-transitioning::view-transition-new(root) {
  animation-name: reveal-light;
}

.theme-transitioning::view-transition-old(root),
.dark.theme-transitioning::view-transition-old(root) {
  animation: none;
}

.dark.theme-transitioning::view-transition-new(root) {
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
