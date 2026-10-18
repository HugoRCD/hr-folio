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
  max-width: 65ch;
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
</style>
