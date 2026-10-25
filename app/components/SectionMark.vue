<script setup lang="ts">
// A section's mark, set in the index margin on wide screens: a numeral, a label,
// and a hairline that leads to the first entry and stops at the gutter.
const { as = 'h2' } = defineProps<{
  numeral: string
  label: string
  as?: 'h1' | 'h2' | 'h3'
}>()
</script>

<template>
  <component :is="as" class="section-mark in-index flex items-baseline gap-3" data-construct="mark">
    <span class="numeral" aria-hidden="true">{{ numeral }}</span>
    <span class="label">{{ label }}</span>
    <span class="rule" aria-hidden="true" />
  </component>
</template>

<style scoped>
.section-mark {
  margin-bottom: 12px;
  line-height: 24px;
}
@media (min-width: 1024px) {
  .section-mark {
    /* the first entry's 8px padding, plus 1px: a 10px mono label and a 16px title centred
       in the same 24px line differ by a pixel at the baseline (measured) */
    top: 9px;
    margin: 0;
  }
}
.numeral {
  width: 28px;
  flex: none;
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 15px;
  color: var(--ui-primary);
  /* a mark in the margin, not words: it is not picked up with the label */
  user-select: none;
}
.label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
  font-weight: 400;
}
.rule {
  flex: 1;
  height: 1px;
  align-self: center;
  background: color-mix(in oklab, var(--ui-text) 12%, transparent);
}
</style>
