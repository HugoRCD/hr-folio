<script setup lang="ts">
definePageMeta({
  layout: false,
})

type ItemType = 'image' | 'project' | 'tweet' | 'website' | 'app' | 'design' | 'branding' | 'code' | 'article'

interface CanvasItem {
  image: string
  title: string
  type: ItemType
  link: string
}

const items: CanvasItem[] = [
  {
    image: 'https://picsum.photos/seed/1/600/400',
    title: 'Beautiful Landscape',
    type: 'image',
    link: 'https://example.com/landscape'
  },
  {
    image: 'https://picsum.photos/seed/2/600/400', 
    title: 'Architecture Design',
    type: 'project',
    link: 'https://dribbble.com/shots/example'
  },
  {
    image: 'https://picsum.photos/seed/3/600/400',
    title: 'Nature Photography',
    type: 'image',
    link: 'https://unsplash.com/@example'
  },
  {
    image: 'https://picsum.photos/seed/4/600/400',
    title: 'Tweet Thread',
    type: 'tweet',
    link: 'https://twitter.com/example/status/123'
  },
  {
    image: 'https://picsum.photos/seed/5/600/400',
    title: 'Web Design',
    type: 'website',
    link: 'https://example.com'
  },
  {
    image: 'https://picsum.photos/seed/6/600/400',
    title: 'Mobile App',
    type: 'app',
    link: 'https://apps.apple.com/app/example'
  },
  {
    image: 'https://picsum.photos/seed/7/600/400',
    title: 'UI Components',
    type: 'design',
    link: 'https://figma.com/example'
  },
  {
    image: 'https://picsum.photos/seed/8/600/400',
    title: 'Brand Identity',
    type: 'branding',
    link: 'https://behance.net/example'
  },
  {
    image: 'https://picsum.photos/seed/9/600/400',
    title: 'Code Repository',
    type: 'code',
    link: 'https://github.com/example/repo'
  },
  {
    image: 'https://picsum.photos/seed/10/600/400',
    title: 'Blog Article',
    type: 'article',
    link: 'https://medium.com/@example/article'
  },
]

const handleItemClick = (item: CanvasItem) => {
  window.open(item.link, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden">
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    
    <InfiniteCanvas 
      :item-size="400"
      :gap="200"
      :items
      class="absolute inset-0"
      @item-click="handleItemClick"
    >
      <template #default="{ item, index, onItemClick }">
        <Motion
          :initial="{
            opacity: 0,
            filter: 'blur(20px)'
          }"
          :animate="{
            opacity: 1,
            filter: 'blur(0px)'
          }"
          :transition="{
            duration: 0.6,
            delay: Math.random() * 0.6
          }" 
          class="group relative size-full cursor-pointer select-none overflow-hidden transition-all duration-300 hover:scale-105 ease-in-out"
          :class="index % 2 === 0 ? 'rotate-2 hover:rotate-0' : '-rotate-2 hover:rotate-0'"
          @click="onItemClick"
        >
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br p-1 transition-all duration-300 border-2 border-default/50">
            <div class="relative size-full overflow-hidden rounded-xl">
              <img
                :src="item.image"
                :alt="item.title"
                class="size-full object-cover"
                :draggable="false"
              >
            </div>
          </div>
        </Motion>
      </template>
    </InfiniteCanvas>

    <div class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <div class="rounded-full bg-black/50 px-6 py-3 text-white backdrop-blur-sm">
        <p class="text-sm font-medium">
          Click items to open links • {{ items.length }} items
        </p>
      </div>
    </div>
  </div>
</template>
