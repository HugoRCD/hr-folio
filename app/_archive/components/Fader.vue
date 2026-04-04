<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface Props {
  stop?: string
  blur?: string
  height?: number
  side: 'top' | 'bottom'
  style?: CSSProperties
}

const props = withDefaults(defineProps<Props>(), {
  stop: '25%',
  blur: '1px',
  height: 150,
})
</script>

<template>
  <div
    aria-hidden="true"
    class="fader"
    :data-side="props.side"
    :style="{
      '--stop': props.stop,
      '--blur': props.blur,
      '--height': `${props.height}px`,
      ...props.style
    }"
  />
</template>

<style scoped>
.fader {
  position: sticky;
  width: 100%;
  height: var(--height);
  pointer-events: none;
  user-select: none;
  backdrop-filter: blur(var(--blur));
  z-index: 10;
}

.fader[data-side="top"] {
  top: 0;
  background: linear-gradient(to top, transparent, var(--ui-bg));
  mask-image: linear-gradient(to bottom, var(--ui-bg) var(--stop), transparent);
  margin-bottom: calc(var(--height) * -1);
}

.fader[data-side="bottom"] {
  bottom: 0;
  background: linear-gradient(to bottom, transparent, var(--ui-bg));
  mask-image: linear-gradient(to top, var(--ui-bg) var(--stop), transparent);
  margin-top: calc(var(--height) * -1);
}
</style>
