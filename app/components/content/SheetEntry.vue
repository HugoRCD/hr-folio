<script setup lang="ts">
// One entry of a sheet (::sheet-entry{term="Cartier" font="redaction"}): the term in a fixed column,
// set in what it describes when that helps, the definition beside it. A colour's entry carries its
// chip (swatch="#CD1919"), so the name is read beside the colour it names.
const { font, red = false, swatch } = defineProps<{
  term?: string
  swatch?: string
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
        <span v-if="swatch" class="chip" :style="{ backgroundColor: swatch }" aria-hidden="true" />{{ term }}
        <span v-if="swatch" class="hex">{{ swatch }}</span>
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
.hex {
  display: block;
  margin-top: 2px;
  padding-left: 18px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
}
.chip {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 8px;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ui-text) 14%, transparent);
}
dt.label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}
dd {
  font-size: 16px;
  line-height: 28px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
dd :deep(p) {
  margin: 0;
  line-height: inherit;
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
