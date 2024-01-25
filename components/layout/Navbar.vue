<template>
  <div
    class="flex w-full justify-end"
    :class="{'justify-between': $route.path !== '/'}"
  >
    <NuxtLink
      v-if="$route.path !== '/'"
      to="/"
      class="cursor-pointer group"
    >
      <span class="font-newsreader italic hover:text-accent hover:underline">
        go back
      </span>
    </NuxtLink>
    <ThemeSelector />
  </div>
</template>
