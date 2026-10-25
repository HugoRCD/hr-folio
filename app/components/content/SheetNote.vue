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
/* the prose paragraph sets its own 28px leading and the links their own weight and ink: in the
   margin a note is set tight and quiet, in its own grey, as the notes of a drawing are */
.note :deep(p) {
  margin: 0;
  line-height: inherit;
}
.note :deep(a) {
  font-weight: inherit;
  color: var(--ui-text-muted);
  border-bottom: 1px solid color-mix(in oklab, currentColor 35%, transparent);
}
.note :deep(a:hover) {
  color: var(--ui-text-highlighted);
  border-bottom-color: var(--ui-primary);
}
/* a value in a note is set as the note is, in the same mono at the same size: the article's code
   pill was twice the note's height and broke its lines apart */
.note :deep(code) {
  display: inline;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: none;
  font: inherit;
  color: var(--ui-text-muted);
}
@media (min-width: 1024px) {
  .note {
    top: 9px;
    margin-top: 0;
  }
}
</style>
