<template>
  <MApp class="relative flex h-screen flex-col items-center justify-center">
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    <h1 class="text-center font-newsreader text-7xl italic">
      404
    </h1>
    <p class="text-center">
      I think you're lost, let's go back
      <NuxtLink
        to="/"
        class="font-medium italic text-accent hover:underline"
      >
        home
      </NuxtLink>.
    </p>
  </MApp>
</template>
