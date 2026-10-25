<script setup lang="ts">
// The sheet in miniature, to scale (::sheet-plate): the five columns every page is laid on.
const COLUMNS = [
  { w: 224, name: 'Index' },
  { w: 48 },
  { w: 528, name: 'Measure' },
  { w: 48 },
  { w: 176, name: 'Notes' },
]
const SHEET = COLUMNS.reduce((sum, c) => sum + c.w, 0)
</script>

<template>
  <figure class="plate" aria-label="The five columns of the sheet">
    <div class="dim">
      <span>{{ SHEET }}</span>
    </div>
    <div class="flex">
      <div v-for="(c, i) in COLUMNS" :key="i" class="col" :class="{ gutter: !c.name }" :style="{ flex: c.w }">
        <span class="w">{{ c.w }}</span>
        <span v-if="c.name" class="name">{{ c.name }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.plate {
  margin: 32px 0 0;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--ui-text-muted);
}
.dim {
  position: relative;
  height: 14px;
  margin-bottom: 6px;
  border-inline: 1px solid color-mix(in oklab, var(--ui-text) 35%, transparent);
  text-align: center;
}
.dim::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 7px;
  height: 1px;
  background: color-mix(in oklab, var(--ui-text) 25%, transparent);
}
.dim span {
  position: relative;
  padding: 0 6px;
  background: var(--ui-bg);
}
.col {
  display: flex;
  min-width: 0;
  height: 72px;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px;
  box-shadow: inset 0 0 0 0.5px color-mix(in oklab, var(--ui-text) 30%, transparent);
}
.col.gutter {
  padding-inline: 0;
  align-items: center;
  background: repeating-linear-gradient(135deg, transparent 0 4px, color-mix(in oklab, var(--ui-text) 8%, transparent) 4px 5px);
}
.col .name {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-highlighted);
}
</style>
