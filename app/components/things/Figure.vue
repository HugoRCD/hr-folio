<script setup lang="ts">
import { motion } from 'motion-v'
import type { StudioPose, ThingItem } from '~/utils/things'

const { item, pose, index, dim, spring, arrive } = defineProps<{
  item: ThingItem
  pose: StudioPose
  index: number
  dim: 'self' | 'near' | 'far'
  spring: Record<string, unknown>
  arrive: Record<string, unknown>
}>()

const emit = defineEmits<{
  enter: []
  leave: []
}>()

const { reduced } = useThingMotion()
const route = useRoute()
const lift = computed(() => reduced.value ? false : { y: -10 })
const fresh = ref(true)
onMounted(() => {
  window.setTimeout(() => {
    fresh.value = false 
  }, 1100)
})
const move = computed(() => {
  if (fresh.value && !reduced.value) {
    return { ...arrive, delay: Math.min(index * 0.045, 0.48) }
  }
  return spring
})

function thingTo() {
  const query = { ...route.query, at: item.slug }
  return { path: thingPath(item), query }
}
</script>

<template>
  <motion.article
    layout
    class="figure"
    :class="[dim, { hero: pose.scale >= 0.95 }]"
    :style="{
      left: `${pose.x}px`,
      top: `${pose.y}px`,
      width: `${pose.width}px`,
      height: `${pose.height}px`,
      zIndex: dim === 'self' ? 8 : pose.z,
    }"
    :transition="move"
    :initial="reduced ? false : { opacity: 0, y: 16, scale: 0.92 }"
    :animate="{ opacity: dim === 'near' ? 0.55 : 1, y: 0, scale: dim === 'near' ? 0.98 : 1 }"
    :exit="{ opacity: 0, scale: 0.92, transition: { duration: reduced ? 0 : 0.18 } }"
    @mouseenter="emit('enter')"
    @mouseleave="emit('leave')"
    @focusin="emit('enter')"
    @focusout="emit('leave')"
  >
    <p v-if="pose.groupStart" class="mark">
      {{ CATEGORY_LABEL[pose.group] }}
    </p>
    <NuxtLink
      :to="thingTo()"
      class="hit"
    >
      <motion.div
        class="stand"
        :while-hover="lift"
        :transition="spring"
      >
        <ThingsCutout :item :priority="index < 6" />
        <span class="contact" aria-hidden="true" />
      </motion.div>
      <span class="whisper">
        <span class="name">{{ item.name }}</span>
        <span class="brand">{{ item.brand }}</span>
        <span class="price">{{ formatPrice(item.price) }}</span>
      </span>
    </NuxtLink>
  </motion.article>
</template>

<style scoped>
.figure {
  position: absolute;
  margin: 0;
  min-width: 0;
}
.mark {
  position: absolute;
  top: -28px;
  left: 0;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  pointer-events: none;
}
.hit {
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
  border: 0;
  box-shadow: none;
  cursor: zoom-in;
}
.hit:focus-visible {
  box-shadow: none;
  outline: 1px solid rgb(17 17 17 / 0.25);
  outline-offset: 6px;
}
.stand {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: center bottom;
}
.contact {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 1%;
  height: 16px;
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.22) 0%, rgb(32 24 16 / 0) 72%);
  filter: blur(10px);
  transform: scaleY(0.65);
  pointer-events: none;
  z-index: 0;
}
.stand :deep(.cutout) {
  position: relative;
  z-index: 1;
}
.figure:hover .contact,
.figure:focus-within .contact {
  left: 8%;
  right: 8%;
  filter: blur(16px);
  transform: scaleY(0.9);
  background: radial-gradient(ellipse at center, rgb(32 24 16 / 0.3) 0%, rgb(32 24 16 / 0) 74%);
}
.whisper {
  position: absolute;
  left: 50%;
  top: calc(100% + 10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: max-content;
  max-width: 16rem;
  margin: 0;
  padding: 0;
  text-align: center;
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
  transition: opacity 0.35s cubic-bezier(0.65, 0, 0.35, 1), transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
  pointer-events: none;
  z-index: 3;
}
.figure:hover .whisper,
.figure:focus-within .whisper {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.name {
  font-size: 13px;
  line-height: 18px;
  color: #111111;
  text-wrap: balance;
}
.brand {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9A9A9A;
}
.price {
  font-family: var(--font-redaction);
  font-size: 14px;
  line-height: 18px;
  color: #6B6B6B;
}
.near {
  filter: none;
}
@media (max-width: 899px) {
  .figure {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: min(82vw, 420px) !important;
    height: min(78svh, 640px) !important;
    margin: 0 auto;
    scroll-snap-align: center;
    flex: 0 0 auto;
  }
  .whisper {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .mark {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .whisper {
    transition: none;
  }
}
</style>
