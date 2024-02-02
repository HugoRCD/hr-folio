<template>
  <ClientOnly>
    <div
      class="flex flex-row gap-2"
    >
      <span
        class="cursor-pointer"
        :class="$colorMode.value !== 'dark' ? 'opacity-60' : 'opacity-100'"
        @click="startViewTransition('dark')"
      >
        Dark
      </span>
      /
      <span
        class="cursor-pointer"
        :class="$colorMode.value !== 'light' ? 'opacity-60' : 'opacity-100'"
        @click="startViewTransition('light')"
      >
        Light
      </span>
    </div>
    <template #fallback>
      <div class="h-6" />
    </template>
  </ClientOnly>
</template>

<script setup>
const colorMode = useColorMode();

const switchTheme = () => {
  colorMode.value = colorMode.value === "dark" ? "light" : "dark";
  colorMode.preference = colorMode.value;
}

function startViewTransition(theme) {
  if (theme === colorMode.value) return;
  document.startViewTransition(switchTheme);
}
</script>

<style>
/* Dark/Light reveal effect */
::view-transition-group(root) {
  animation-duration: 0.6s;
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
