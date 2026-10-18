<script setup lang="ts">
import { contrast, hexToOklab, mixOklab, oklabToHex, oklch } from '~/utils/oklab'

// How the site's red is made: Cartier's and Ferrari's, mixed in OKLab. The needle picks a point
// on the mix, and the page's own red follows it while you are here.

const CARTIER = '#C10016'
const FERRARI = '#DA291C'
const WHITE = '#FFFFFF'
const BLACK = '#020202'
const LIFT = 0.054 // on black every red is lifted by this much lightness, as Ferrari lifts its own
const HALF = 0.5

const light = (t: number) => mixOklab(CARTIER, FERRARI, t)
function dark(t: number) {
  const [lightness, a, b] = hexToOklab(light(t))
  return oklabToHex([lightness + LIFT, a, b])
}

// from here on, the red on black passes AA as well (it always does on white)
const PASS = (() => {
  for (let t = 0; t <= 1; t += 0.001) if (contrast(dark(t), BLACK) >= 4.5) return t
  return 1
})()

const id = useId()
const t = ref(HALF)

const reading = computed(() => {
  const l = light(t.value)
  const d = dark(t.value)
  return {
    light: { hex: l, ratio: contrast(l, WHITE) },
    dark: { hex: d, ratio: contrast(d, BLACK) },
    lch: oklch(l), // the red on black is this, lifted: one reading for both
  }
})
const pct = (v: number) => `${(v * 100).toFixed(2)}%`

// the page's red follows the needle (the daylight plugin paints it); at the halfway point, or on
// leaving, the red goes back to wherever the light puts it
const held = useState<number | null>('red-at', () => null)
watch(t, (v) => {
  held.value = v === HALF ? null : v
})
onBeforeUnmount(() => {
  held.value = null
})
</script>

<template>
  <figure class="red">
    <div class="ends">
      <span>Cartier <b>{{ CARTIER }}</b></span>
      <span>Ferrari <b>{{ FERRARI }}</b></span>
    </div>

    <div class="band" :style="{ '--at': pct(t), '--half': pct(HALF) }">
      <span class="mid" aria-hidden="true" />
      <span class="needle" aria-hidden="true" />
      <input
        :id
        v-model.number="t"
        type="range"
        min="0"
        max="1"
        step="0.015625"
        aria-label="Mix, from Cartier's red to Ferrari's"
        :aria-valuetext="`${Math.round(t * 100)}% Ferrari: ${reading.light.hex}`"
      >
    </div>

    <!-- the ruler: eighths, with the halfway point named, and where the red holds on both grounds -->
    <div class="ruler" aria-hidden="true">
      <span v-for="i in 9" :key="i" class="tick" :class="{ long: (i - 1) % 4 === 0 }" :style="{ left: pct((i - 1) / 8) }" />
      <span class="num" style="left: 0">0</span>
      <span class="num" :style="{ left: pct(HALF) }">½</span>
      <span class="num" style="left: 100%">1</span>
    </div>
    <div class="pass" :style="{ '--from': pct(PASS) }" aria-hidden="true">
      <span class="bracket" />
      <span class="label">AA on white and on black</span>
    </div>

    <output :for="id" class="readout">
      <span class="row"><span class="k">On white</span><span class="v">{{ reading.light.hex }}</span><span class="r" :class="{ low: reading.light.ratio < 4.5 }">{{ reading.light.ratio.toFixed(2) }} : 1</span></span>
      <span class="row"><span class="k">On black</span><span class="v">{{ reading.dark.hex }}</span><span class="r" :class="{ low: reading.dark.ratio < 4.5 }">{{ reading.dark.ratio.toFixed(2) }} : 1</span></span>
      <span class="row">
        <span class="k">OKLCH</span><span class="v">{{ reading.lch.l.toFixed(3) }} {{ reading.lch.c.toFixed(3) }} {{ reading.lch.h.toFixed(1) }}°</span>
        <button type="button" class="reset" :class="{ away: t !== HALF }" :tabindex="t === HALF ? -1 : 0" @click="t = HALF">Back to ½</button>
      </span>
    </output>
  </figure>
</template>

<style scoped>
.red {
  margin: 32px 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
}
.ends {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.ends b {
  margin-left: 6px;
  font-weight: 400;
  color: var(--ui-text-highlighted);
}

/* the mix itself: the only place on the sheet where the red is laid down as a ground */
.band {
  position: relative;
  height: 48px;
  background: linear-gradient(to right in oklab, #C10016, #DA291C);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ui-text) 10%, transparent);
}
html.dark .band {
  background: linear-gradient(to right in oklab, #D52729, #EE4030);
}
.mid,
.needle {
  position: absolute;
  width: 1px;
  pointer-events: none;
}
.mid {
  top: 0;
  bottom: 0;
  left: var(--half);
  background: rgb(255 255 255 / 0.35);
}
/* the needle reaches past the band on both sides, like a reading hand */
.needle {
  top: -6px;
  bottom: -6px;
  left: var(--at);
  margin-left: -0.5px;
  background: var(--ui-text-highlighted);
}
/* the native range does the work, invisibly: pointer, keyboard, screen readers */
input {
  position: absolute;
  inset: -6px -6px;
  width: calc(100% + 12px);
  height: calc(100% + 12px);
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  appearance: none;
  background: transparent;
}
input::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 60px;
}
input::-moz-range-thumb {
  width: 12px;
  height: 60px;
  border: 0;
}
.band:has(input:focus-visible) {
  outline: 1px solid var(--ui-text-highlighted);
  outline-offset: 6px;
}

.ruler {
  position: relative;
  height: 22px;
  margin-top: 6px;
}
.tick {
  position: absolute;
  top: 0;
  width: 1px;
  height: 3px;
  margin-left: -0.5px;
  background: color-mix(in oklab, var(--ui-text) 30%, transparent);
}
.tick.long {
  height: 6px;
  background: color-mix(in oklab, var(--ui-text) 55%, transparent);
}
.num {
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  font-size: 9px;
}
.num:first-of-type { transform: none; }
.num:last-of-type { transform: translateX(-100%); }

.pass {
  position: relative;
  height: 20px;
  margin-left: var(--from);
}
.bracket {
  position: absolute;
  inset: 0 0 auto;
  height: 5px;
  border: 1px solid color-mix(in oklab, var(--ui-text) 35%, transparent);
  border-top: 0;
}
.label {
  position: absolute;
  right: 0;
  top: 8px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.readout {
  display: flex;
  flex-direction: column;
  margin-top: 14px;
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 10%, transparent);
}
.row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid color-mix(in oklab, var(--ui-text) 6%, transparent);
  font-variant-numeric: tabular-nums;
}
.k {
  width: 72px;
  flex: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.v {
  color: var(--ui-text-highlighted);
  font-size: 11px;
}
.r {
  margin-left: auto;
  font-size: 11px;
  color: var(--ui-text);
}
.r.low {
  color: var(--ui-text-dimmed);
  text-decoration: line-through;
}
.reset {
  margin-left: auto;
  font: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.reset.away {
  opacity: 1;
}
.reset:hover {
  color: var(--ui-text-highlighted);
}
</style>
