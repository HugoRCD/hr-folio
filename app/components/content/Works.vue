<script setup lang="ts">
import { Cursor, usePointerPosition } from 'motion-plus-vue'
import {
  clamp,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion-v'

const { category } = defineProps<{
  category?: string
}>()

const { data: works, error } = await useAsyncData(`works-${category}`, () => {
  return queryCollection('works')
    .where('category', '=', category)
    .order('date', 'DESC')
    .all()
})
if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Works not found',
    fatal: true,
  })
}

const position = usePointerPosition()

function usePointerToSkew(axisMotionValue: any) {
  const velocity = useVelocity(axisMotionValue)
  const maxVelocity = useTransform(velocity, (v: number) => clamp(-500, 500, v))
  const smoothVelocity = useSpring(maxVelocity, {
    damping: 20,
    stiffness: 300,
  })
  return useTransform(smoothVelocity, [0, 500], [0, -5], {
    clamp: false,
  })
}

const skewX = usePointerToSkew(position.x)
const skewY = usePointerToSkew(position.y)

const hoveredIndex = ref<number | null>(null)
const isAnyItemHovered = ref(false)
const imageLoading = ref(false)

watch(hoveredIndex, (newVal) => {
  if (newVal !== null) {
    isAnyItemHovered.value = true
    imageLoading.value = true

    if (hoveredWork.value) {
      const img = new Image()
      img.src = getWorkImage(hoveredWork.value) || ''
      img.onload = () => {
        imageLoading.value = false
      }
      img.onerror = () => {
        imageLoading.value = false
      }
    }
  }
})

const hoveredWork = computed(() => {
  if (hoveredIndex.value !== null && works.value && works.value[hoveredIndex.value]) {
    return works.value[hoveredIndex.value]
  }
  return null
})

const showCursor = computed((): boolean => {
  return !!(isAnyItemHovered.value && hoveredWork.value && getWorkImage(hoveredWork.value))
})

const workImage = computed(() => {
  if (!hoveredWork.value) return null
  return getWorkImage(hoveredWork.value)
})

const enterTransition = {
  duration: 0.5,
  ease: [0, 0.54, 0.37, 0.97],
}

const exitTransition = {
  duration: 0.2,
  ease: 'easeIn',
}

function getWorkImage(work: any): string | null {
  if (!work) return null

  if (work.screenshotUrl) {
    return work.screenshotUrl
  }

  const name = work.name.replace(/\s+/g, '-').toLowerCase()
  return `/assets/works/${name}.png`
}

function handleMouseLeave() {
  hoveredIndex.value = null
  isAnyItemHovered.value = false
}
</script>

<template>
  <div @mouseleave="handleMouseLeave">
    <div class="mt-4 grid grid-cols-1 font-normal gap-8 sm:grid-cols-2">
      <NuxtLink
        v-for="(work, index) in works"
        :key="work.name"
        :to="work.url"
        target="_blank"
        class="group relative cursor-pointer"
        data-animate
        :aria-label="`Open ${work.name}`"
        :style="{ '--stagger': index }"
        @mouseenter="hoveredIndex = index"
      >
        <div class="absolute right-0 top-0 font-serif text-5xl italic opacity-15 sm:text-3xl">
          {{ work.release }}
        </div>
        <h3 class="font-serif italic text-2xl decoration-primary group-hover:underline">
          {{ work.name }}<span class="text-primary">.</span>
        </h3>
        <p class="text-[--ui-text-muted] font-extralight sm:text-base">
          {{ work.description }}
        </p>
      </NuxtLink>
    </div>

    <Cursor
      :show="showCursor"
      follow
      :offset="{ x: 15, y: 15 }"
      :variants="{
        default: {
          clipPath: 'inset(0% 0% 0% 0%)',
          transition: enterTransition
        },
        exit: {
          clipPath: 'inset(50% 50% 50% 50%)',
          transition: exitTransition
        }
      }"
      :style="{ skewX, skewY, originX: 0, originY: 0 }"
    >
      <Motion
        v-if="workImage"
        :variants="{
          default: {
            scale: 1,
            transition: enterTransition
          },
          exit: {
            scale: 1.5,
            transition: exitTransition
          }
        }"
        class="overflow-hidden rounded-md shadow-lg sm:w-[320px] sm:h-[180px] md:w-[400px] md:h-[250px] lg:w-[480px] lg:h-[300px] relative"
      >
        <NuxtImg
          v-if="workImage"
          :src="workImage"
          format="webp"
          preload
          :alt="`Image for ${hoveredWork?.name}`"
          class="block size-full object-cover"
        />
      </Motion>
    </Cursor>
  </div>
</template>
