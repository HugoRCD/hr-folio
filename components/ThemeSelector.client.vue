<script setup lang="ts">
</script>

<template>
  <div class="flex flex-row text-zinc-900 dark:text-zinc-100 transition-all duration-300 gap-2">
    <span
      class="cursor-pointer"
      :class="$colorMode.value !== 'dark' ? 'opacity-50' : 'opacity-100'"
      @click="$colorMode.preference = 'dark'"
    >
      Dark
    </span>
    /
    <span
      class="cursor-pointer"
      :class="$colorMode.value !== 'light' ? 'opacity-50' : 'opacity-100'"
      @click="$colorMode.preference = 'light'"
    >
      Light
    </span>
  </div>
</template>

<style scoped lang="scss">

</style>
