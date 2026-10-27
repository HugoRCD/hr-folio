<script setup lang="ts">
// A line set apart (::sheet-quote{by="Vercel"}): the words in the red italic of the numerals,
// the source beneath them in the margin's mono, after a short rule.
defineProps<{
  by?: string
}>()
</script>

<template>
  <figure class="quote">
    <blockquote class="font-redaction italic text-primary">
      <slot />
    </blockquote>
    <figcaption v-if="by">
      {{ by }}
    </figcaption>
  </figure>
</template>

<style scoped>
.quote {
  margin: 32px 0;
}
.quote:first-child {
  margin-top: 0;
}
/* opening a section, its words sit on the same baseline as the section's mark */
.section-mark + .quote {
  margin-top: -2px;
}
blockquote {
  font-size: 32px;
  line-height: 40px;
  text-wrap: balance;
}
blockquote :deep(p) {
  margin: 0;
  line-height: inherit;
}
figcaption {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}
figcaption::before {
  content: '';
  width: 24px;
  height: 1px;
  background: currentColor;
  opacity: 0.5;
}
@media (max-width: 639px) {
  blockquote {
    font-size: 26px;
    line-height: 32px;
  }
}
</style>
