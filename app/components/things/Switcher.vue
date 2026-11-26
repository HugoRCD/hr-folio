<script setup lang="ts">
import { THING_CONCEPTS, CONCEPT_LABEL, CONCEPT_INDEX, type ThingConcept } from '~/utils/things'

const { concept } = defineProps<{
  concept: ThingConcept
}>()

const emit = defineEmits<{
  concept: [next: ThingConcept]
}>()
</script>

<template>
  <nav class="switcher" aria-label="Layout concept">
    <button
      v-for="c in THING_CONCEPTS"
      :key="c"
      type="button"
      class="opt"
      :class="{ active: concept === c }"
      @click="emit('concept', c)"
    >
      <span class="num">{{ CONCEPT_INDEX[c] }}</span>
      {{ CONCEPT_LABEL[c] }}
    </button>
  </nav>
</template>

<style scoped>
.switcher {
  position: fixed;
  left: 50%;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  z-index: 90;
  display: flex;
  gap: 2px;
  width: max-content;
  max-width: calc(100vw - 24px);
  padding: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  transform: translateX(-50%);
  background: rgb(250 249 247 / 0.92);
  border: 1px solid #E8E6E1;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgb(17 17 17 / 0.04);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.switcher::-webkit-scrollbar {
  display: none;
}
.opt {
  flex: 0 0 auto;
  padding: 7px 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  cursor: pointer;
  box-shadow: none;
  white-space: nowrap;
}
.opt:hover {
  color: #111111;
}
.opt.active {
  background: #111111;
  color: #FAF9F7;
}
.num {
  margin-right: 6px;
  opacity: 0.55;
}

@media (max-width: 767px) {
  .switcher {
    left: 12px;
    right: 12px;
    bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    width: auto;
    max-width: none;
    transform: none;
    padding: 3px;
    justify-content: flex-start;
  }
  .opt {
    padding: 6px 7px;
    font-size: 10px;
    letter-spacing: 0.03em;
  }
  .num {
    margin-right: 3px;
  }
}
</style>
