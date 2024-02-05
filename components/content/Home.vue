<template>
  <div
    class="flex flex-col"
    data-animate
    style="--stagger: 1"
  >
    <NuxtImg
      src="/hugo.webp"
      alt="Hugo Richard"
      width="80"
      height="80"
      sizes="160"
      class="mb-2 size-20 rounded-full object-cover"
    />
    <h3>
      Hugo Richard
    </h3>
    <h1 class="font-newsreader text-2xl font-medium italic text-accent sm:text-3xl">
      Developer and Designer
    </h1>
    <p class="max-w-[600px] text-pretty">
      <slot />
    </p>
  </div>
</template>
