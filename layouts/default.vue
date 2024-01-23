<template>
  <div class="flex flex-col justify-center items-center gap-3 p-6 sm:p-12 h-full">
    <div class="relative h-full p-6 sm:p-8 border-2 border-dark/20 dark:border-light/20 flex flex-col justify-center gap-3 w-full">
      <ThemeSelector class="absolute top-4 right-4 z-50" />
      <NuxtPage />
      <Signature class="absolute bottom-4 right-4 z-40 h-16 sm:h-20 fill-black dark:fill-white" />
    </div>
  </div>
</template>
