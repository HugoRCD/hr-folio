<script setup lang="ts">
interface Image {
  id: string
  url: string
  width: number
  height: number
}

const IMAGE_COUNT = 30
const COLUMN_COUNT = 5
const GAP = 32

// Génère des images de tailles variées
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
const images = ref<Image[]>(
  Array.from({ length: IMAGE_COUNT }).map((_, i) => {
    const width = randomInt(220, 340)
    const height = randomInt(180, 320)
    return {
      id: String(i),
      url: `https://picsum.photos/seed/${i + 1}/${width}/${height}`,
      width,
      height,
    }
  })
)

// Masonry layout : on répartit les images dans des colonnes
const columns = computed(() => {
  const cols: Image[][] = Array.from({ length: COLUMN_COUNT }, () => [])
  images.value.forEach((img, i) => {
    cols[i % COLUMN_COUNT].push(img)
  })
  return cols
})

// Drag state
const offset = useState('playground-offset', () => ({ x: 0, y: 0 }))
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

// Dimensions du canvas virtuel
const COLUMN_WIDTH = 300 + GAP
const ROW_HEIGHT = 300 + GAP
const VIRTUAL_COLS = 3 // nombre de répétitions horizontales pour wrap
const VIRTUAL_ROWS = 3 // nombre de répétitions verticales pour wrap

// Pour chaque colonne, on calcule la hauteur totale
const columnHeights = computed(() =>
  columns.value.map(col =>
    col.reduce((sum, img) => sum + img.height + GAP, 0)
  )
)
</script>

<template>
  <div
    class="relative w-full h-[80vh] overflow-hidden cursor-grab active:cursor-grabbing select-none"
    @mousedown="handleMouseDown"
  >
    <div class="absolute left-0 top-0 w-full h-full">
      <template v-for="vx in VIRTUAL_COLS" :key="vx">
        <template v-for="vy in VIRTUAL_ROWS" :key="vy">
          <div
            v-for="(col, colIdx) in columns"
            :key="colIdx + '-' + vx + '-' + vy"
            :style="{
              position: 'absolute',
              left: ((colIdx * COLUMN_WIDTH) + (vx - 2) * COLUMN_COUNT * COLUMN_WIDTH + (offset.x % (COLUMN_COUNT * COLUMN_WIDTH))) + 'px',
              top: ((vy - 2) * Math.max(...columnHeights) + (offset.y % Math.max(...columnHeights))) + 'px',
              width: COLUMN_WIDTH + 'px',
            }"
          >
            <div
              v-for="(img, imgIdx) in col"
              :key="img.id"
              :style="{
                marginBottom: GAP + 'px',
                width: img.width + 'px',
                height: img.height + 'px',
                borderRadius: '1rem',
                boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.10)',
                background: '#fff',
                overflow: 'hidden',
              }"
              class="hover:scale-105 transition-transform"
            >
              <img
                :src="img.url"
                :alt="`Gallery image ${img.id}`"
                class="w-full h-full object-cover rounded-xl"
                draggable="false"
              >
            </div>
          </div>
        </template>
      </template>
    </div>
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
