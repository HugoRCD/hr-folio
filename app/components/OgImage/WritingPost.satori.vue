<script setup lang="ts">
import { monogramPath, monogramViewBox } from '~/utils/signature'

// The card an article is shared with: the sheet itself, as it reads on the site. The letterhead
// (the monogram, the dateline), the title in red, the column's edges ruled faintly with their
// widths, and the corner of the page turned up on the red drawing underneath.
const props = defineProps<{
  title?: string
  description?: string
  date?: string
  minutes?: number
}>()

const W = 1200
const H = 630
// the card's own columns: a margin, the measure, a margin; the words keep clear of the measure's
// ruled edges by INSET, as text keeps off a drawing's border
const M = 56
const L = 120
const R = 1080
const RULE_Y = 40
const INSET = 48
const X0 = L + INSET
const X1 = R - INSET

const ink = '#0a0a0a'
const red = '#CD1919'
const deep = '#901112'
const faint = '#ececec'

// a long title is set smaller, so it keeps to three lines at most
const size = computed(() => ((props.title?.length ?? 0) > 52 ? 52 : 62))

const dated = computed(() => props.date
  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' }).format(new Date(props.date))
  : '')

// The dog-ear, in its own box of side S whose bottom-right is the card's corner. The corner is
// pulled up along two legs of EAR: the red is uncovered where it was (A, B, the corner), and the
// flap is that triangle folded over the line AB, onto the page.
const EAR = 52
const S = EAR + 10
const A = `${S - EAR},${S}`
const B = `${S},${S - EAR}`
const tip = `${S - EAR},${S - EAR}`
// the 8px grid of the drawing underneath, cut to the uncovered triangle (x + y >= 2S - EAR)
const grid = Array.from({ length: Math.floor(EAR / 8) }, (_, i) => S - EAR + 8 * (i + 1))
  .map(c => `M${c} ${2 * S - EAR - c}V${S}M${2 * S - EAR - c} ${c}H${S}`)
  .join('')
</script>

<template>
  <div :style="{ position: 'relative', display: 'flex', width: `${W}px`, height: `${H}px`, backgroundColor: '#ffffff', fontFamily: 'Geist' }">
    <!-- construction: the measure's edges, and the ruler that gives the columns' widths -->
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" :style="{ position: 'absolute', top: '0px', left: '0px' }">
      <path :d="`M${L + 0.5} ${RULE_Y}V${H}M${R + 0.5} ${RULE_Y}V${H}`" :stroke="faint" stroke-width="1" fill="none" />
      <path :d="`M${M} ${RULE_Y + 0.5}H${W - M}`" stroke="#e2e2e2" stroke-width="1" fill="none" />
      <path :d="[M, L, R, W - M].map(x => `M${x + 0.5} ${RULE_Y - 4}v8`).join('')" stroke="#cfcfcf" stroke-width="1" fill="none" />
    </svg>
    <div :style="{ position: 'absolute', top: `${RULE_Y - 26}px`, left: `${M}px`, width: `${W - 2 * M}px`, display: 'flex', fontFamily: 'Geist Mono', fontSize: '13px', letterSpacing: '0.04em', color: '#a3a3a3' }">
      <div :style="{ width: `${L - M}px`, display: 'flex', justifyContent: 'center' }">
        {{ L - M }}
      </div>
      <div :style="{ width: `${R - L}px`, display: 'flex', justifyContent: 'center' }">
        {{ R - L }}
      </div>
      <div :style="{ width: `${W - M - R}px`, display: 'flex', justifyContent: 'center' }">
        {{ W - M - R }}
      </div>
    </div>

    <!-- the letterhead -->
    <div :style="{ position: 'absolute', top: '84px', left: `${X0}px`, width: `${X1 - X0}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }">
      <svg :viewBox="monogramViewBox" width="58" height="50">
        <path :d="monogramPath" :fill="deep" />
      </svg>
      <!-- the italic is written as a plain style: the renderer reads the template for the faces it
           needs, and does not look inside a bound one -->
      <div v-if="dated" style="font-style: italic;" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'Redaction', fontSize: '20px', lineHeight: 1.3 }">
        <span :style="{ color: ink }">From London,</span>
        <span :style="{ color: '#737373' }">{{ dated }}</span>
      </div>
    </div>

    <!-- the title, set low on the sheet as a letter's heading is, just above its foot -->
    <div :style="{ position: 'absolute', bottom: '124px', left: `${X0}px`, width: `${X1 - X0}px`, display: 'flex', flexDirection: 'column', gap: '20px' }">
      <span :style="{ fontFamily: 'Redaction', fontSize: `${size}px`, lineHeight: 1.04, letterSpacing: '-0.02em', color: red }">
        {{ title }}
      </span>
      <span v-if="description" :style="{ display: 'block', fontSize: '24px', lineHeight: 1.45, color: '#737373', maxWidth: '760px', lineClamp: 2 }">
        {{ description }}
      </span>
    </div>

    <!-- the foot of the sheet -->
    <div :style="{ position: 'absolute', bottom: '48px', left: `${X0}px`, width: `${X1 - X0}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: `1px solid ${faint}`, fontFamily: 'Geist Mono', fontSize: '15px', letterSpacing: '0.06em', color: '#8a8a8a' }">
      <span>HUGORCD.COM</span>
      <span v-if="minutes">{{ minutes }} MIN READ</span>
    </div>

    <!-- the corner, turned up on the red drawing underneath -->
    <svg :width="S" :height="S" :viewBox="`0 0 ${S} ${S}`" :style="{ position: 'absolute', right: '0px', bottom: '0px' }">
      <polygon :points="`${A} ${B} ${S},${S}`" :fill="deep" />
      <path :d="grid" stroke="rgba(235,235,235,0.12)" stroke-width="1" fill="none" />
      <!-- the flap's shadow on the page, softest first, then the back of the paper -->
      <polygon :points="`${A} ${B} ${S - EAR - 7},${S - EAR - 7}`" fill="rgba(0,0,0,0.03)" />
      <polygon :points="`${A} ${B} ${S - EAR - 3},${S - EAR - 3}`" fill="rgba(0,0,0,0.05)" />
      <defs>
        <linearGradient
          id="back"
          :x1="S - EAR / 2"
          :y1="S - EAR / 2"
          :x2="S - EAR"
          :y2="S - EAR"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stop-color="#d9d9d7" />
          <stop offset="0.12" stop-color="#ececea" />
          <stop offset="1" stop-color="#f7f7f5" />
        </linearGradient>
      </defs>
      <polygon :points="`${A} ${B} ${tip}`" fill="url(#back)" />
      <path :d="`M${A.replace(',', ' ')}L${B.replace(',', ' ')}`" stroke="#ffffff" stroke-width="1.5" />
    </svg>
  </div>
</template>
