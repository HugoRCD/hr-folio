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
