<script setup lang="ts">
definePageMeta({
  layout: false,
})


const IMAGE_COUNT = 20

const images = Array.from({ length: IMAGE_COUNT }).map((_, i) => ({
  id: String(i),
  url: `https://picsum.photos/seed/${i}/300/200`,
  width: 300,
  height: 200 + (i % 3) * 40,
}))
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden">
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>

    <InfiniteCanvas 
      :grid-size="160" 
      class="absolute inset-0 z-10"
      :initial-position="{ x: 0, y: 0 }"
    >
      <template #default="{ item }">
        <div class="absolute inset-1 flex items-center justify-center">
          <Motion
            v-if="images[item.gridIndex % images.length]"
            as="img"
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)'
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)'
            }"
            :transition="{
              duration: 0.4,
              delay: Math.random() * 0.2
            }"
            :src="images[item.gridIndex % images.length]?.url"
            :alt="`Image ${item.gridIndex}`"
            draggable="false"
            class="size-full rounded-lg object-cover shadow-lg"
          />
        </div>
      </template>
    </InfiniteCanvas>

    <div class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <div class="rounded-full bg-black/20 px-4 py-2 text-white backdrop-blur-sm">
        <p class="text-sm font-medium">
          Drag, scroll, or swipe to explore
        </p>
      </div>
    </div>
  </div>
</template>
