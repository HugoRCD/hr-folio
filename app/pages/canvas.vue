<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

definePageMeta({
  layout: false
})

useHead({
  title: 'Canvas',
})

interface Image {
  id: string
  url: string
  width: number
  height: number
}

const IMAGE_COUNT = 200
const COLUMN_COUNT = 5
const GAP = 32

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const images = Array.from({ length: IMAGE_COUNT }).map((_, i) => ({
  id: String(i),
  url: `https://picsum.photos/seed/${i}/300/200`,
  width: 300,
  height: 200 + (i % 3) * 40,
}))

const columns = computed(() => {
  const cols: Image[][] = Array.from({ length: COLUMN_COUNT }, () => [])
  images.forEach((img, i) => {
    cols[i % COLUMN_COUNT]?.push(img)
  })
  return cols
})

const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const offsetStart = ref({ x: 0, y: 0 })

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  offsetStart.value = { ...offset.value }
}
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  offset.value = {
    x: offsetStart.value.x + (e.clientX - dragStart.value.x),
    y: offsetStart.value.y + (e.clientY - dragStart.value.y),
  }
}
const handleMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})

const COLUMN_WIDTH = 300 + GAP
const ROW_HEIGHT = 300 + GAP
const VIRTUAL_COLS = 2
const VIRTUAL_ROWS = 2

const columnHeights = computed(() =>
  columns.value.map(col =>
    col.reduce((sum, img) => sum + img.height + GAP, 0)
  )
)
</script>

<template>
  <div class="h-screen w-full bg-black">
    <DynamicScroller
      :items="images"
      :min-item-size="220"
      class="w-full h-full"
      key-field="id"
      page-mode
    >
      <template #default="{ item }">
        <DynamicScrollerItem :item :active="true" :size-dependencies="[item.height]">
          <div
            class="m-4 rounded-xl shadow-lg bg-white overflow-hidden"
            :style="{ width: item.width + 'px', height: item.height + 'px' }"
          >
            <img
              :src="item.url"
              :alt="`Image ${item.id}`"
              class="w-full h-full object-cover"
              loading="lazy"
            >
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<style scoped>
.grab {
  cursor: grab;
}

.grabbing {
  cursor: grabbing;
}
</style> 
