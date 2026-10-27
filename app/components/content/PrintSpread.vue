<script setup lang="ts">
// A few archive prints laid on the desk (::print-spread), overlapping a little, each at its own
// angle, as photographs are spread out on a workbench. Each is placed by hand in the article
// (x, y and w in % of the spread, r in degrees), so the spread reads as arranged, not scattered.
// Pointed at or tapped, a print comes to the top of the pile.
type Print = {
  src: string
  alt: string
  caption?: string
  ratio: string // the picture's own width/height, so it holds its place before it loads
  x: number
  y: number
  w: number
  r: number
}

const { prints, ratio = '528/340' } = defineProps<{
  prints: Print[]
  ratio?: string // the spread's own width/height
}>()

const top = ref<number | null>(null)
</script>

<template>
  <div class="spread" :style="{ aspectRatio: ratio }">
    <figure
      v-for="(p, i) in prints"
      :key="p.src"
      class="print"
      :class="{ top: top === i }"
      tabindex="0"
      :style="{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, zIndex: top === i ? prints.length + 1 : i + 1, '--r': `${p.r}deg` }"
      @pointerenter="top = i"
      @focus="top = i"
    >
      <img :src="p.src" :alt="p.alt" :style="{ aspectRatio: p.ratio }" loading="lazy" decoding="async">
      <figcaption v-if="p.caption">
        {{ p.caption }}
      </figcaption>
    </figure>
  </div>
</template>

<style scoped>
.spread {
  position: relative;
  width: 100%;
  margin: 32px 0 8px;
}
/* The prints are laid on the desk, not set in the column: they leave the measure. On the sheet they
   cross the gutter on the left, and the gutter and the empty note margin on the right, out to the
   edge of the plate (a section's notes hang at its top, the spreads come further down). Narrower,
   they take what is left either side of the measure, up to 96px. */
@media (min-width: 640px) and (max-width: 1023px) {
  .spread {
    --bleed: clamp(0px, (100vw - 576px) / 2 - 16px, 96px);
    width: calc(100% + var(--bleed) * 2);
    margin-inline: calc(var(--bleed) * -1);
  }
}
@media (min-width: 1024px) {
  .spread {
    width: calc(100% + var(--sheet-gutter) * 2 + var(--sheet-note));
    margin-left: calc(var(--sheet-gutter) * -1);
  }
}
/* a print: the picture in its white margin, a caption written in the margin underneath */
.print {
  position: absolute;
  margin: 0;
  padding: 5px 5px 0;
  background: #fbfbf9;
  box-shadow: 0 1px 1px rgb(0 0 0 / 0.12), 0 4px 10px -2px rgb(0 0 0 / 0.14);
  transform: rotate(var(--r));
  transition: transform 0.22s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.22s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: default;
  -webkit-tap-highlight-color: transparent;
}
.print.top {
  transform: rotate(calc(var(--r) * 0.4)) translateY(-3px);
  box-shadow: 0 1px 1px rgb(0 0 0 / 0.1), 0 12px 24px -6px rgb(0 0 0 / 0.24);
}
.print:focus-visible {
  outline: 1px solid var(--ui-primary);
  outline-offset: 2px;
}
.print img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  background: #e6e6e3;
}
figcaption {
  padding: 5px 1px 6px;
  font-family: var(--font-mono);
  font-size: 8.5px;
  line-height: 11px;
  letter-spacing: 0.02em;
  color: #6f6f6c;
  /* a caption says what the picture is to someone who has not looked it up: written in full,
     over two lines if it needs them, rather than cut short */
  text-wrap: balance;
  /* the next print may lie over this one's right edge: the words keep clear of it */
  max-width: 84%;
}
@media (min-width: 1024px) {
  /* the prints are half as large again out here: their captions with them */
  figcaption {
    font-size: 10px;
    line-height: 13px;
  }
  .print {
    padding: 6px 6px 0;
  }
}
/* at night the prints lie in the dark too: dimmer, and their shadow is lost in the ground */
html.dark .print {
  filter: brightness(0.92);
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.04), 0 6px 14px -4px rgb(0 0 0 / 0.6);
}
@media (max-width: 639px) {
  figcaption {
    font-size: 7px;
    line-height: 9px;
    /* the prints are narrow here: the caption takes more of the margin, to stay on fewer lines */
    max-width: 94%;
  }
  .print {
    padding: 3px 3px 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .print {
    transition: none;
  }
  .print.top {
    transform: rotate(var(--r));
  }
}
</style>
