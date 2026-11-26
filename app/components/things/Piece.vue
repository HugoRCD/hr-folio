<script setup lang="ts">
import { motion } from 'motion-v'
import type { ThingItem } from '~/utils/things'

const { item, index, spring } = defineProps<{
  item: ThingItem
  index: number
  spring: Record<string, unknown>
}>()

const frame = useTemplateRef<HTMLElement>('frame')
const active = ref(false)
const size = ref({ w: 0, h: 0 })
let observer: ResizeObserver | undefined

function measure() {
  const el = frame.value
  if (!el) return
  const r = el.getBoundingClientRect()
  size.value = { w: Math.round(r.width), h: Math.round(r.height) }
}

onMounted(() => {
  measure()
  if (!frame.value) return
  observer = new ResizeObserver(measure)
  observer.observe(frame.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <motion.article
    layout
    class="piece"
    :transition="spring"
    :initial="false"
    :exit="{ opacity: 0 }"
    @mouseenter="active = true"
    @mouseleave="active = false"
    @focusin="active = true"
    @focusout="active = false"
  >
    <NuxtLink :to="thingPath(item)" class="hit">
      <div class="stage">
        <motion.div
          :layout-id="`thing-${item.slug}`"
          :transition="spring"
          :initial="false"
          class="cutout"
        >
          <img
            ref="frame"
            :src="item.image"
            :alt="item.name"
            class="object"
            :class="{ featured: item.featured, ink: item.image.endsWith('.svg') }"
            draggable="false"
            decoding="async"
          >
        </motion.div>
        <ThingsSpecPlate
          :item
          :index
          :width="size.w"
          :height="size.h"
          :on="active"
        />
      </div>
      <p class="caption">
        <span class="name">{{ item.name }}</span>
        <span class="brand">{{ item.brand }}</span>
      </p>
    </NuxtLink>
  </motion.article>
</template>

<style scoped>
.piece {
  min-width: 0;
}
.hit {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-decoration: none;
  color: inherit;
  border: 0;
  box-shadow: none;
}
.hit:focus-visible {
  box-shadow: none;
}
.stage {
  position: relative;
  display: flex;
  min-height: 196px;
  align-items: flex-end;
  justify-content: center;
  padding: 8px 12px 4px;
}
.cutout {
  display: flex;
  max-width: 100%;
  align-items: flex-end;
  justify-content: center;
}
.object {
  display: block;
  max-width: 100%;
  height: 188px;
  width: auto;
  object-fit: contain;
  object-position: bottom center;
  color: var(--ui-text-highlighted);
  user-select: none;
}
.object.featured {
  height: 228px;
}
.dark .object.ink {
  filter: invert(1);
}
.caption {
  display: none;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}
.name {
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-text-highlighted);
}
.brand {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
}

/* phones have no hover: the name sits under the object, as a caption on a plate */
@media (max-width: 639px) {
  .caption {
    display: flex;
  }
}
@media (hover: hover) and (pointer: fine) {
  .hit:focus-visible .caption {
    display: flex;
  }
}
</style>
