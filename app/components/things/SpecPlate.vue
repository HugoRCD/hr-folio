<script setup lang="ts">
import type { ThingItem } from '~/utils/things'

const { item, index, width = 0, height = 0, on = false } = defineProps<{
  item: ThingItem
  index: number
  width?: number
  height?: number
  on?: boolean
}>()
</script>

<template>
  <!-- a technical plate, drawn around the piece in hand: crop marks, two dimensions, the house and the price -->
  <div class="plate" :class="{ on }" aria-hidden="true">
    <span class="crop tl" /><span class="crop tr" /><span class="crop bl" /><span class="crop br" />
    <span v-if="width" class="dim top">{{ width }}</span>
    <span v-if="height" class="dim right">{{ height }}</span>
    <span class="idx">{{ String(index + 1).padStart(2, '0') }}</span>
    <span class="foot">
      <span class="brand">{{ item.brand }}</span>
      <span class="price">{{ formatPrice(item.price) }}</span>
    </span>
  </div>
</template>

<style scoped>
.plate {
  position: absolute;
  inset: -14px;
  border: 1px solid color-mix(in oklab, var(--ui-text) 12%, transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s cubic-bezier(0.65, 0, 0.35, 1), border-color 0.35s ease;
}
.plate.on {
  opacity: 1;
  border-color: color-mix(in oklab, var(--ui-text) 30%, transparent);
}
.crop {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 0 solid color-mix(in oklab, var(--ui-text) 40%, var(--ui-bg));
}
.crop.tl { top: -5px; left: -5px; border-top-width: 1px; border-left-width: 1px; }
.crop.tr { top: -5px; right: -5px; border-top-width: 1px; border-right-width: 1px; }
.crop.bl { bottom: -5px; left: -5px; border-bottom-width: 1px; border-left-width: 1px; }
.crop.br { bottom: -5px; right: -5px; border-bottom-width: 1px; border-right-width: 1px; }

.dim,
.idx,
.foot {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  font-variant-numeric: tabular-nums;
}
.dim.top {
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
}
.dim.right {
  right: -22px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: center;
}
.idx {
  top: -16px;
  left: 8px;
  color: var(--ui-primary);
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 13px;
  letter-spacing: 0;
  text-transform: none;
}
.foot {
  right: 0;
  bottom: -18px;
  left: 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  text-transform: none;
  letter-spacing: 0.04em;
}
.price {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .plate {
    transition: none;
  }
}
</style>
