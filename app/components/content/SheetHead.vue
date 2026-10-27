<template>
  <!-- the head of a sheet-style article (::sheet-head): its title and a few lines of context -->
  <header class="sheet-head">
    <slot />
  </header>
</template>

<style scoped>
.sheet-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sheet-head :deep(h1) {
  margin: 0;
}
.sheet-head :deep(p) {
  max-width: 528px; /* the measure, in pixels: a width in ch would change when the font arrives */
  margin: 0;
  font-size: 16px;
  line-height: 28px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
</style>
