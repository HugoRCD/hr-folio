<template>
  <!-- notes and sources for a section (::sheet-note), in the note margin on wide screens -->
  <aside class="in-note note">
    <slot />
  </aside>
</template>

<style scoped>
.note {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  color: var(--ui-text-dimmed);
}
.note :deep(p) {
  margin: 0;
}
@media (min-width: 1024px) {
  .note {
    top: 9px;
    margin-top: 0;
  }
}
</style>
