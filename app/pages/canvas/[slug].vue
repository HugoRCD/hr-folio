<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/nuxt'
import { Analytics } from '@vercel/analytics/nuxt'
import type { CanvasItem } from '~~/modules/infinite-canvas/types'

definePageMeta({
  layout: false,
})

const route = useRoute()
const slug = route.params.slug as string

const { data } = await useAsyncData(`canvas-${slug}`, () => 
  queryCollection('canvas').path(`/canvas/${slug}`).first()
)

if (!data.value) {
  throw createError({ 
    statusCode: 404, 
    statusMessage: `Canvas "${slug}" not found` 
  })
}

const isMobile = computed(() => {
  if (!import.meta.client) return false
  return isMobileDevice(navigator.userAgent, window.innerWidth)
})

const handleItemClick = (item: CanvasItem) => {
  // Disable clicks on mobile devices
  if (isMobile.value) {
    return
  }
  
  // Desktop-only click handling
  if (import.meta.client) {
    window.open(item.link, '_blank', 'noopener,noreferrer')
  }
}

const imageUrls = computed(() => data.value?.items.map(item => item.image))

const loaderProgress = ref(0)
const showLoader = ref(true)
const isImagesLoaded = ref(false)

const hoveredItemIndex = ref<number | null>(null)

const { startPreloading } = useImagePreloader({
  images: imageUrls.value || [],
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
  nextTick(() => {
    if (canvasRef.value?.updateDimensions) {
      canvasRef.value.updateDimensions()
    }
  })
})

const canvasRef = ref<any>(null)

// Prevent browser navigation gestures
if (import.meta.client) {
  document.documentElement.style.overscrollBehavior = 'none'
  document.body.style.overscrollBehavior = 'none'
  document.body.style.touchAction = 'manipulation'
}

const canvasTitle = computed(() => {
  const titleMap: Record<string, string> = {
    works: 'Loading Works Canvas',
    photos: 'Loading Photo Canvas',
  }
  return titleMap[slug] || `Loading ${slug.charAt(0).toUpperCase() + slug.slice(1)} Canvas`
})
</script>

<template>
  <UApp v-if="data" class="canvas-page relative h-screen w-screen overflow-hidden" style="touch-action: none; overscroll-behavior: none;">
    <FolioMeta :page="data" :is-writing="false" />
    <SpeedInsights />
    <Analytics />
    <div class="absolute top-4 right-4 z-50 isolate touch-auto select-auto cursor-pointer">
      <ThemeSelector />
    </div>
    
    <div class="absolute top-4 left-4 z-50 isolate touch-auto select-auto cursor-pointer">
      <NuxtLink v-if="route.path !== '/'" aria-label="Go back to home page" class="group cursor-pointer" to="/">
        <span class="font-serif italic hover:text-primary hover:underline">
          go back<span class="text-primary">.</span>
        </span>
      </NuxtLink>
    </div>
    
    <div class="pointer-events-none absolute -top-56 z-40 size-44 rounded-full opacity-50 blur-[200px] dark:bg-white dark:blur-[200px] sm:size-72" />
    <div class="pointer-events-none fixed inset-0 z-40 size-full overflow-hidden">
      <div class="noise pointer-events-none absolute inset-[-200%] z-50 size-[400%] bg-[url('/noise.png')] opacity-[4%]" />
    </div>
    
    <Canvas 
      ref="canvasRef"
      :items="data?.items || []"
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
      <template #default="{ item, index, onItemClick }">
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
          class="group relative size-full select-none overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300"
          :class="[
            isMobile ? 'cursor-default' : 'cursor-pointer',
            index % 2 === 0 ? 'rotate-1' : '-rotate-1'
          ]"
          data-canvas-item
          @click="onItemClick"
          @mouseenter="hoveredItemIndex = index"
          @mouseleave="hoveredItemIndex = null"
        >
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br p-1 border-2 border-default/50">
            <div class="relative size-full overflow-hidden rounded-xl">
              <video
                v-if="item && isVideo(item.image)"
                :src="item.image"
                class="size-full object-cover"
                autoplay
                loop
                muted
                playsinline
                :draggable="false"
              />
              <img
                v-else-if="item"
                :src="item.image"
                :alt="item.title"
                class="size-full object-cover"
                :draggable="false"
              >
              
              <!-- Item details overlay -->
              <Motion
                v-if="!isMobile"
                :initial="{ opacity: 0, scale: 0.95, transformOrigin: 'bottom left' }"
                :animate="hoveredItemIndex === index ? { 
                  opacity: 1, 
                  scale: 1,
                  transformOrigin: 'bottom left'
                } : { 
                  opacity: 0, 
                  scale: 0.95,
                  transformOrigin: 'bottom left'
                }"
                :transition="{
                  duration: 0.2,
                  ease: 'easeOut'
                }"
                class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-[2px] p-4 rounded-xl"
              >
                <Motion
                  :initial="{ y: 20, opacity: 0 }"
                  :animate="hoveredItemIndex === index ? { 
                    y: 0, 
                    opacity: 1 
                  } : { 
                    y: 20, 
                    opacity: 0 
                  }"
                  :transition="{
                    duration: 0.25,
                    delay: 0.05,
                    ease: 'easeOut'
                  }"
                >
                  <div class="flex items-start gap-2">
                    <div class="flex-1">
                      <h3 class="font-medium text-white mb-1 line-clamp-2 leading-tight">
                        {{ item?.title }}
                      </h3>
                      <p 
                        v-if="item?.description" 
                        class="text-sm text-white/85 line-clamp-2"
                      >
                        {{ item.description }}
                      </p>
                    </div>
                    <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4 text-white/70 flex-shrink-0 mt-0.5" />
                  </div>
                </Motion>
              </Motion>
            </div>
          </div>
        </Motion>
      </template>
    </Canvas>

    <div v-if="canvasRef" class="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 pointer-events-none">
      <CanvasMinimap
        :items="data?.items || []"
        :grid-items="canvasRef.gridItems || []"
        :offset="canvasRef.offset || { x: 0, y: 0 }"
        :zoom="canvasRef.zoom || 1"
        :container-dimensions="canvasRef.containerDimensions || { width: 0, height: 0 }"
        :canvas-bounds="canvasRef.canvasBounds || { width: 0, height: 0 }"
        class="scale-85 sm:scale-100 origin-bottom-right"
      />
    </div>

    <div class="pointer-events-none absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-40 flex flex-col gap-2">
      <div class="rounded-lg bg-default/80 px-3 py-2 text-highlighted backdrop-blur-sm">
        <p class="text-xs opacity-75">
          <span class="sm:hidden">{{ data?.items.length }} items</span><span class="hidden sm:inline">Click items to open links • {{ data?.items.length }} items</span>
          <span v-if="canvasRef?.zoom" class="ml-2 opacity-60">
            • {{ Math.round((canvasRef.zoom || 1) * 100) }}%
          </span>
        </p>
      </div>
      <div class="hidden sm:block rounded-lg bg-default/80 px-3 py-2 text-highlighted backdrop-blur-sm">
        <p class="text-xs opacity-75">
          Hold Ctrl/⌘/Alt + scroll to zoom (40%-220%)
        </p>
      </div>
    </div>

    <CanvasLoader
      :progress="loaderProgress"
      :is-visible="showLoader"
      :title="canvasTitle"
    />
  </UApp>
</template> 
