<script setup lang="ts">
// A section of a sheet-style article (::sheet-section{numeral="I" label="The red"}), laid out as on
// the notice: its mark in the index margin, its prose and entries in the measure, notes beside it.
defineProps<{
  numeral: string
  label: string
}>()
</script>

<template>
  <section class="sheet-section relative">
    <SectionMark :numeral :label />
    <slot />
  </section>
</template>

<style scoped>
.sheet-section {
  scroll-margin-top: 48px;
}
.sheet-section > :deep(p) {
  max-width: 528px; /* the measure, in pixels: a width in ch would change when the font arrives */
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
/* a section that opens with prose starts where an entry would, level with its mark */
.sheet-section :deep(.section-mark + p) {
  margin-top: 0;
  padding-top: 8px;
}
.sheet-section > :deep(p + p) {
  margin-top: 16px;
}
.sheet-section > :deep(:not(p) + p) {
  margin-top: 32px;
}
.sheet-section :deep(.section-mark + .entries) {
  margin-top: 0;
}
</style>
