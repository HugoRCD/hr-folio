<script setup lang="ts">
// One entry of a sheet (::sheet-entry{term="Cartier" font="redaction"}): the term in a fixed column,
// set in what it describes when that helps, the definition beside it.
const { font, red = false } = defineProps<{
  term?: string
  font?: 'redaction' | 'redaction-italic' | 'sans' | 'mono' | 'signature' | 'infinity'
  red?: boolean | string
}>()

const termClass = computed(() => {
  const colour = red ? 'text-primary' : 'text-highlighted'
  switch (font) {
    case 'redaction': return `font-redaction text-base ${colour}`
    case 'redaction-italic': return `font-redaction italic ${colour}`
    case 'sans': return `font-sans text-base ${colour}`
    case 'mono': return `font-mono text-sm ${colour}`
    case 'signature': return red ? 'font-signature text-2xl leading-6 text-primary' : 'font-signature text-3xl leading-6 text-[#901112] dark:text-[#E1342D]'
    case 'infinity': return 'flex items-center'
    default: return 'label'
  }
})
</script>

<template>
  <div class="entry">
    <dt :class="termClass">
      <InfinityMark v-if="font === 'infinity'" :width="40" />
      <template v-else>
        {{ term }}
      </template>
    </dt>
    <dd>
      <slot />
    </dd>
  </div>
</template>

<style scoped>
.entry {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 8px 0;
}
.entry + .entry {
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 6%, transparent);
}
dt {
  width: 128px;
  flex: none;
}
dt.label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}
dd {
  font-size: 14px;
  line-height: 24px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
dd :deep(p) {
  margin: 0;
}
dd :deep(p + p) {
  margin-top: 12px;
}
@media (max-width: 639px) {
  .entry {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
