<script setup lang="ts">
definePageMeta({
  layout: false,
})


interface CanvasItem {
  image: string
  title: string
  link: string
  width?: number
  height?: number
}

const items: CanvasItem[] = [
  {
    image: '/assets/works/shelve.png',
    title: 'Shelve',
    link: 'https://shelve.cloud',
    width: 480,
    height: 270 // 16:9 ratio
  },
  {
    image: 'https://picsum.photos/seed/2/400/400', 
    title: 'Architecture Design',
    link: 'https://dribbble.com/shots/example',
    width: 300,
    height: 300 // Square
  },
  {
    image: 'https://picsum.photos/seed/3/300/450',
    title: 'Nature Photography',
    link: 'https://unsplash.com/@example',
    width: 250,
    height: 375 // 2:3 ratio
  },
  {
    image: 'https://picsum.photos/seed/4/400/300',
    title: 'Tweet Thread',
    link: 'https://twitter.com/example/status/123',
    width: 320,
    height: 240 // 4:3 ratio
  },
  {
    image: 'https://picsum.photos/seed/5/500/300',
    title: 'Web Design',
    link: 'https://example.com',
    width: 400,
    height: 240 // Wide format
  },
  {
    image: 'https://picsum.photos/seed/6/300/400',
    title: 'Mobile App',
    link: 'https://apps.apple.com/app/example',
    width: 240,
    height: 320 // Phone ratio
  },
  {
    image: 'https://picsum.photos/seed/7/350/350',
    title: 'UI Components',
    link: 'https://figma.com/example',
    width: 280,
    height: 280 // Square
  },
  {
    image: 'https://picsum.photos/seed/8/450/300',
    title: 'Brand Identity',
    link: 'https://behance.net/example',
    width: 360,
    height: 240 // 3:2 ratio
  },
  {
    image: 'https://picsum.photos/seed/9/350/200',
    title: 'Code Repository',
    link: 'https://github.com/example/repo',
    width: 350,
    height: 200 // Wide
  },
  {
    image: 'https://picsum.photos/seed/10/300/400',
    title: 'Blog Article',
    link: 'https://medium.com/@example/article',
    width: 260,
    height: 347 // Article format
  },
]

const handleItemClick = (item: CanvasItem) => {
  window.open(item.link, '_blank', 'noopener,noreferrer')
}

const imageUrls = computed(() => items.map(item => item.image))

const loaderProgress = ref(0)
const showLoader = ref(true)
const isImagesLoaded = ref(false)

const { progress, isComplete, startPreloading } = useImagePreloader({
  images: imageUrls.value,
  onProgress: (newProgress) => {
    loaderProgress.value = newProgress
  },
  onComplete: () => {
    isImagesLoaded.value = true
    setTimeout(() => {
      showLoader.value = false
    }, 500)
  }
})

onMounted(() => {
  startPreloading()
  // Force update dimensions when canvas ref is available
  nextTick(() => {
    if (canvasRef.value?.updateDimensions) {
      canvasRef.value.updateDimensions()
    }
  })
})

const canvasRef = ref<any>(null)

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
})

// Prevent browser navigation gestures
if (import.meta.client) {
  document.documentElement.style.overscrollBehavior = 'none'
  document.body.style.overscrollBehavior = 'none'
  document.body.style.touchAction = 'manipulation'
}
</script>

<template>
  <UApp class="canvas-page relative h-screen w-screen overflow-hidden" style="touch-action: none; overscroll-behavior: none;">
    <div class="absolute top-4 right-4 z-50 isolate touch-auto select-auto cursor-pointer">
      <ThemeSelector />
    </div>
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    
    <Canvas 
      ref="canvasRef"
      :items
      :base-gap="50"
      :zoom-options="{
        minZoom: 0.4,
        maxZoom: 2.2,
        zoomFactor: 1.08,
        enableCtrl: true,
        enableMeta: true,
        enableAlt: true
      }"
      class="absolute inset-0"
      @item-click="handleItemClick"
    >
      <template #default="{ item, onItemClick }">
        <Motion
          :initial="{
            opacity: 0,
            filter: 'blur(20px)',
            scale: 0.8
          }"
          :animate="isImagesLoaded ? {
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1
          } : {
            opacity: 0,
            filter: 'blur(20px)',
            scale: 0.8
          }"
          :transition="{
            duration: 0.8,
            delay: isImagesLoaded ? Math.random() * 0.8 : 0,
            ease: 'easeOut'
          }" 
          class="group relative size-full cursor-pointer select-none overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300"
          @click="onItemClick"
        >
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br p-1 border-2 border-default/50">
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
    </Canvas>

    <CanvasMinimap
      v-if="canvasRef"
      :items
      :grid-items="canvasRef.gridItems || []"
      :offset="canvasRef.offset || { x: 0, y: 0 }"
      :zoom="canvasRef.zoom || 1"
      :container-dimensions="canvasRef.containerDimensions || { width: 0, height: 0 }"
      :canvas-bounds="canvasRef.canvasBounds || { width: 0, height: 0 }"
    />

    <div class="pointer-events-none absolute bottom-4 left-4 z-40">
      <div class="rounded-lg bg-default/80 px-3 py-2 text-highlighted backdrop-blur-sm">
        <p class="text-xs opacity-75">
          <span class="sm:hidden">Tap items to open links</span><span class="hidden sm:inline">Click items to open links</span> • {{ items.length }} items
          <span v-if="canvasRef?.zoom" class="ml-2 opacity-60">
            • {{ Math.round((canvasRef.zoom || 1) * 100) }}%
          </span>
        </p>
      </div>
    </div>

    <!-- Zoom indicator - Desktop only -->
    <div class="pointer-events-none absolute top-4 left-4 z-40 hidden sm:block">
      <div class="rounded-lg bg-default/80 px-3 py-2 text-highlighted backdrop-blur-sm">
        <p class="text-xs opacity-75">
          Hold Ctrl/⌘/Alt + scroll to zoom (40%-220%)
        </p>
      </div>
    </div>

    <CanvasLoader
      :progress="loaderProgress"
      :is-visible="showLoader"
    />
  </UApp>
</template>
