<script setup lang="ts">
// The watch has stopped, and its hands read the error: 4:04. It is drawn the way a
// watch is designed, in pencil on paper, after the one Hugo wears: a Santos-Dumont, large model.
// Every measure is taken off a face-on picture of the watch (a unit is one of its pixels, the
// centre is the hands' arbor): the case and its flanks, which leave the sides in a
// curve and run up into narrow horns, with the strap set between them; the bezel, near square, its
// corners rounded, its eight screws two to a side; the recess down to the dial; the railway track,
// SWISS MADE in it under the VI; the twelve Roman numerals on the hours of a round dial, each
// standing between the central square and the track, slanted along its hour rather than turned,
// IIII as Cartier writes it, and a name hidden in the VII; the slim sword hands; the beaded crown
// and its cabochon. Graphite throughout, blue pencil for the blued steel and the stone. The sketch
// draws itself once; then the crown can be wound (drag it, click it, scroll on the watch, or use
// the arrow keys), and with enough turns the hands set themselves to the time and run.
type Link = { path: string, title: string }
const { code, path, near, places } = defineProps<{ code: number, path: string, near: Link[], places: Link[] }>()
const is404 = computed(() => code === 404)
const links = computed(() => {
  const first = near.slice(0, 1).map(p => ({ path: p.path, title: p.title }))
  return [...first, ...places.filter(p => !first.some(f => f.path === p.path)).slice(0, 4 - first.length)]
})

// the time it stopped at is the error: 404 is 4:04, 500 is 5:00
const stopped = { h: Math.floor(code / 100) % 12, m: code % 100 < 60 ? code % 100 : 0 }
const stoppedAt = `${Math.floor(code / 100)}:${String(stopped.m).padStart(2, '0')}`

// rounded, so the server and the browser write the same numbers
const r2 = (n: number) => Math.round(n * 100) / 100
const deg = Math.PI / 180
type Box = { hx: number, hy: number, r: number }

// a rounded rectangle, its corners Bezier curves
function rounded({ hx, hy, r }: Box) {
  const c = r * 0.45
  return `M${r2(-hx + r)} ${-hy}H${r2(hx - r)}C${r2(hx - r + c)} ${-hy} ${hx} ${r2(-hy + r - c)} ${hx} ${r2(-hy + r)}`
    + `V${r2(hy - r)}C${hx} ${r2(hy - r + c)} ${r2(hx - r + c)} ${hy} ${r2(hx - r)} ${hy}`
    + `H${r2(-hx + r)}C${r2(-hx + r - c)} ${hy} ${-hx} ${r2(hy - r + c)} ${-hx} ${r2(hy - r)}`
    + `V${r2(-hy + r)}C${-hx} ${r2(-hy + r - c)} ${r2(-hx + r - c)} ${-hy} ${r2(-hx + r)} ${-hy}Z`
}

// --- the case --------------------------------------------------------------------------------------
const CASE = { side: 186.5, start: 122, end: 250, notch: 189, hornIn: 102 }
// the flank, from where it leaves the side to the end of the horn: [distance past the side's end,
// half-width], measured off the picture and averaged top and bottom. It leaves the side in a curve,
// runs out on a slant, and eases back towards upright as it reaches the horn.
const FLANK: Array<[number, number]> = [
  [-16, 186.5],
  [0, 186.5],
  [16, 183.7],
  [32, 177.1],
  [48, 165.5],
  [64, 154],
  [80, 144.2],
  [96, 136],
  [112, 129.3],
  [128, 121.2],
  [144, 116],
]
// the flank as a smooth curve through those points (Catmull-Rom), for one corner of the case:
// sx and sy pick the corner, reverse runs it from the horn back to the side
function flank(sx: number, sy: number, reverse = false, inset = 0) {
  const p = FLANK.map(([d, x]) => [sx * (x - inset), sy * (CASE.start + d)] as [number, number])
  const pts = reverse ? [...p].reverse() : p
  let d = ''
  for (let i = 1; i < pts.length - 2; i++) {
    const [a, b, c, e] = [pts[i - 1]!, pts[i]!, pts[i + 1]!, pts[i + 2]!]
    d += `C${r2(b[0] + (c[0] - a[0]) / 6)} ${r2(b[1] + (c[1] - a[1]) / 6)} ${r2(c[0] - (e[0] - b[0]) / 6)} ${r2(c[1] - (e[1] - b[1]) / 6)} ${r2(c[0])} ${r2(c[1])}`
  }
  return d
}
// the case seen from above: the sides, the flanks, the horns, and between them the notch the strap
// goes into
const silhouette = `M${-CASE.hornIn} ${-CASE.end}V${-CASE.notch}H${CASE.hornIn}V${-CASE.end}H121.2${flank(1, -1, true)}`
  + `V${CASE.start}${flank(1, 1)}H${CASE.hornIn}V${CASE.notch}H${-CASE.hornIn}V${CASE.end}H-121.2${flank(-1, 1, true)}`
  + `V${-CASE.start}${flank(-1, -1)}Z`
// the edge of the polished bevel along each flank, just inside it
const bevel = [[1, -1], [1, 1], [-1, 1], [-1, -1]].map(([sx, sy]) =>
  `M${sx! * (CASE.side - 5)} ${sy! * (CASE.start + 4)}${flank(sx!, sy!, false, 5)}`).join('')

// --- the bezel, and the way down to the dial -------------------------------------------------------
const BEZEL: Box = { hx: 173.5, hy: 169, r: 40 }
const LIP: Box = { hx: 169.5, hy: 165, r: 36 } // the polished edge round it
const LIP_IN: Box = { hx: 149, hy: 144.5, r: 23 } // and round the opening
const OPEN: Box = { hx: 145.5, hy: 141, r: 20 }
const RINGS: Box[] = [{ hx: 141.5, hy: 137, r: 17 }, { hx: 133.5, hy: 130, r: 12 }]
const TRACK_OUT: Box = { hx: 128.5, hy: 125.5, r: 9 }
const TRACK_IN: Box = { hx: 121.5, hy: 119, r: 6 }
const FRAME: Box = { hx: 115.5, hy: 113.5, r: 4 }
const SQUARE: Box = { hx: 66, hy: 64, r: 1.5 }
// where the bezel's sloping faces meet, at its corners
const miters = [[1, -1], [1, 1], [-1, 1], [-1, -1]].map(([sx, sy]) => {
  const at = (b: Box) => [sx! * r2(b.hx - b.r + b.r * Math.SQRT1_2), sy! * r2(b.hy - b.r + b.r * Math.SQRT1_2)]
  const [x1, y1] = at(LIP)
  const [x2, y2] = at(OPEN)
  return { x1, y1, x2, y2 }
})
// eight screws, two to a side, in the middle of the bezel's band; each slot turned its own way
const screws = [
  [-90.5, -155.5, 132],
  [90.5, -155.5, 128],
  [159, -93, 58],
  [159, 93, 62],
  [90.5, 155.5, 135],
  [-90.5, 155.5, 131],
  [-159, 93, 55],
  [-159, -93, 60],
].map(([x, y, r]) => ({ x: x!, y: y!, r: r! }))
// construction: each edge of the bezel drawn a little past it, as a pencil does
const OVER = 12
const overshoot = [
  [-BEZEL.hx - OVER, -BEZEL.hy, BEZEL.hx + OVER, -BEZEL.hy],
  [-BEZEL.hx - OVER, BEZEL.hy, BEZEL.hx + OVER, BEZEL.hy],
  [-BEZEL.hx, -BEZEL.hy - OVER, -BEZEL.hx, BEZEL.hy + OVER],
  [BEZEL.hx, -BEZEL.hy - OVER, BEZEL.hx, BEZEL.hy + OVER],
]

// --- the dial ----------------------------------------------------------------------------------------
// where a ray from the centre at angle a (0 at XII, clockwise) meets a rectangle of half-sizes hx, hy
const onRect = (a: number, { hx, hy }: { hx: number, hy: number }) => {
  const dx = Math.sin(a * deg)
  const dy = -Math.cos(a * deg)
  const t = Math.min(hx / Math.abs(dx || 1e-9), hy / Math.abs(dy || 1e-9))
  return { x: dx * t, y: dy * t }
}
// the railway: a mark for every minute, laid along its ray from the centre, so the marks lean at the
// corners; heavier every five minutes. SWISS and MADE take the place of the two marks either side of VI.
const track = Array.from({ length: 60 }, (_, i) => {
  const a = onRect(i * 6, TRACK_IN)
  const b = onRect(i * 6, TRACK_OUT)
  return { x1: r2(a.x), y1: r2(a.y), x2: r2(b.x), y2: r2(b.y), five: i % 5 === 0, i }
}).filter(t => t.i !== 29 && t.i !== 31)

// The numerals stand on the hours of a round dial, every thirty degrees, between the central square
// (their feet) and the track (their heads). They are not turned to their hour but slanted along it,
// so their feet and heads stay parallel to the side they stand on, as Cartier draws them.
const FOOT = { hx: 70, hy: 68.5 }
const HEAD = { hx: 112, hy: 110 }
// Cartier's Roman letters, upright, the foot at 0 and the head at -h: thick and thin strokes, hairline
// serifs; the corner numerals are the same letters, slanted further
const STEM = 3.4 // the thick upright
const DIAG = 3.7 // the thick diagonal, measured across
const HAIR = 1.1 // the thin diagonal
const SERIF = 0.9
const OUTSET = 1.4 // how far a serif runs past its stroke
const WIDE = { I: 5.4, X: 23.5, V: 24 } as Record<string, number>
const GAP = 0.6
function letters(n: string, h: number) {
  const width = [...n].reduce((w, c) => w + WIDE[c]!, 0) + GAP * (n.length - 1)
  let x = -width / 2
  let d = ''
  let secret: { x: number, y: number, a: number } | null = null
  const rect = (x0: number, y0: number, w: number, hh: number) => `M${r2(x0)} ${r2(y0)}h${r2(w)}v${r2(hh)}h${r2(-w)}Z`
  const quad = (pts: number[][]) => `M${pts.map(p => `${r2(p[0]!)} ${r2(p[1]!)}`).join('L')}Z`
  for (const c of n) {
    const w = WIDE[c]!
    const m = OUTSET
    if (c === 'I') {
      d += rect(x + (w - STEM) / 2, -h + SERIF, STEM, h - 2 * SERIF) + rect(x, -h, w, SERIF) + rect(x, -SERIF, w, SERIF)
    } else if (c === 'V') {
      const mid = x + w / 2
      // the thick stroke falls from the left, the thin one from the right, to a point at the foot
      d += quad([[x + m, -h + SERIF], [x + m + DIAG, -h + SERIF], [mid + 0.9, 0], [mid - 1.2, 0]])
      d += quad([[x + w - m - HAIR, -h + SERIF], [x + w - m, -h + SERIF], [mid + 1, 0], [mid + 0.2, 0]])
      d += rect(x, -h, 2 * m + DIAG, SERIF) + rect(x + w - 2 * m - HAIR, -h, 2 * m + HAIR, SERIF)
      const sx = x + m + DIAG / 2
      secret ??= { x: (sx + mid) / 2, y: -h / 2, a: Math.atan2(h, mid - sx) / deg }
    } else {
      d += quad([[x + m, -h + SERIF], [x + m + DIAG, -h + SERIF], [x + w - m, -SERIF], [x + w - m - DIAG, -SERIF]])
      d += quad([[x + w - m - HAIR, -h + SERIF], [x + w - m, -h + SERIF], [x + m + HAIR, -SERIF], [x + m, -SERIF]])
      d += rect(x, -h, 2 * m + DIAG, SERIF) + rect(x + w - 2 * m - HAIR, -h, 2 * m + HAIR, SERIF)
      d += rect(x, -SERIF, 2 * m + HAIR, SERIF) + rect(x + w - 2 * m - DIAG, -SERIF, 2 * m + DIAG, SERIF)
    }
    x += w + GAP
  }
  return { d, secret }
}
// each side's outward direction (n) and the direction its letters run in (t)
const SIDES = [
  { n: [0, -1], t: [1, 0], foot: FOOT.hy, head: HEAD.hy },
  { n: [1, 0], t: [0, 1], foot: FOOT.hx, head: HEAD.hx },
  { n: [0, 1], t: [-1, 0], foot: FOOT.hy, head: HEAD.hy },
  { n: [-1, 0], t: [0, -1], foot: FOOT.hx, head: HEAD.hx },
]
const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']
const numerals = ROMAN.map((n, i) => {
  const a = i * 30
  const side = Math.round(a / 90) % 4
  const { n: nn, t, foot, head } = SIDES[side]!
  // the hour's slant from the side's normal
  const k = Math.tan((((a - side * 90 + 540) % 360) - 180) * deg)
  const dx = nn[0]! + t[0]! * k
  const dy = nn[1]! + t[1]! * k
  const g = letters(n, head - foot)
  // the upright letters, carried onto the slant: across stays across, up runs along the hour
  return { n, d: g.d, secret: n === 'VII' ? g.secret : null, m: `matrix(${t[0]} ${t[1]} ${r2(-dx)} ${r2(-dy)} ${r2(foot * dx)} ${r2(foot * dy)})` }
})

// the slim sword hands of blued steel, pointing up, of length len: widening a little to a short point
const sword = (len: number) => `M-1.5 9L-2.5 ${r2(-len * 0.88)}L0 ${-len}L2.5 ${r2(-len * 0.88)}L1.5 9Z`
const HOUR = { d: sword(76), ridge: 'M0 -13V-72' }
const MINUTE = { d: sword(117), ridge: 'M0 -13V-112' }

// --- the crown, measured off the picture -------------------------------------------------------------
// A bulb of polished steel: narrow where it leaves the case, widest at its ring of beads, then
// narrowing again, as a cone, to the collar the stone is set in. The stone is a pointed cabochon:
// round shoulders, then straight sides to a sharp point, 26 long and 34 across.
const crownBody = 'M188.5 -24C190 -27.5 194 -29 198 -29C202.5 -29 206 -25.5 209 -22C211 -20 212.5 -18.5 214.5 -17.5V17.5C212.5 18.5 211 20 209 22C206 25.5 202.5 29 198 29C194 29 190 27.5 188.5 24Z'
const STONE = 'M214.5 -17C219.5 -17 225 -14.5 229.5 -10.5L240.5 0L229.5 10.5C225 14.5 219.5 17 214.5 17Z'

// --- the hands ----------------------------------------------------------------------------------
const minute = ref(stopped.m * 6)
const hour = ref(stopped.h * 30 + stopped.m * 0.5)
const daylight = useState<{ place: { timeZone: string } } | undefined>('daylight')
// minutes past twelve on the dial, now, where Hugo is
function now() {
  const tz = daylight.value?.place.timeZone ?? 'Europe/London'
  const [h = 0, m = 0, s = 0] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number)
  return (h % 12) * 60 + m + s / 60
}

// --- winding -------------------------------------------------------------------------------------
const TURNS = 12
const wound = ref(0) // in turns
const knurl = ref(0)
// The beads are spheres set round the crown's rim, seen side on: each is a circle at R sin a, and
// those turned away pass behind the crown, where only their tops show above its edge. Winding rolls
// the ring half a bead a turn, eased, so each turn is seen.
const RING = { x: 198.5, r: 28.5, n: 17, bead: 3.4 }
const spin = ref(0)
let spinRaf = 0
function roll() {
  cancelAnimationFrame(spinRaf)
  const step = () => {
    const d = knurl.value - spin.value
    spin.value = Math.abs(d) < 0.01 ? knurl.value : spin.value + d * 0.22
    if (spin.value !== knurl.value) spinRaf = requestAnimationFrame(step)
  }
  if (reduced.value) spin.value = knurl.value
  else spinRaf = requestAnimationFrame(step)
}
const beads = computed(() => {
  const step = (2 * Math.PI) / RING.n
  return Array.from({ length: RING.n }, (_, i) => {
    const a = i * step + (spin.value / 8) * step
    const y = RING.r * Math.sin(a)
    // a little shading on each, low on the side away from the light
    const shade = `M${r2(RING.x + 2.3 * Math.cos(15 * deg))} ${r2(y + 2.3 * Math.sin(15 * deg))}A2.3 2.3 0 0 1 ${r2(RING.x + 2.3 * Math.cos(105 * deg))} ${r2(y + 2.3 * Math.sin(105 * deg))}`
    return { i, y: r2(y), z: Math.cos(a), shade }
  }).filter(b => b.z > -0.4).sort((p, q) => p.z - q.z)
})
const beadsBehind = computed(() => beads.value.filter(b => b.z < 0))
const beadsInFront = computed(() => beads.value.filter(b => b.z >= 0))
const running = ref(false)
const reduced = ref(false)
const shown = ref(false)
let raf = 0
let tick: ReturnType<typeof setInterval> | undefined
function wind(turns: number) {
  if (running.value || turns <= 0) return
  wound.value = Math.min(TURNS, wound.value + turns)
  knurl.value += turns * 4
  roll()
  if (wound.value >= TURNS) start()
}
function start() {
  running.value = true
  // set forward, as a watch is: the minute hand goes round, and the hour hand follows at a twelfth
  const from = stopped.h * 60 + stopped.m
  const forward = (now() - from + 720) % 720
  const t0 = performance.now()
  const D = reduced.value ? 0 : Math.min(2400, 900 + forward * 2)
  const step = (t: number) => {
    const k = D ? Math.min(1, (t - t0) / D) : 1
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
    const at = from + forward * e
    minute.value = at * 6
    hour.value = at * 0.5
    if (k < 1) raf = requestAnimationFrame(step)
    else tick = setInterval(follow, 1000)
  }
  raf = requestAnimationFrame(step)
}
function follow() {
  const at = now()
  minute.value = at * 6
  hour.value = at * 0.5
}
let drag: number | null = null
function down(e: PointerEvent) {
  drag = e.clientY
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (drag === null) return
  const dy = drag - e.clientY
  drag = e.clientY
  wind(Math.abs(dy) / 40)
}
function up() {
  drag = null
}
function key(e: KeyboardEvent) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
    e.preventDefault()
    wind(1)
  }
}
function wheel(e: WheelEvent) {
  if (running.value) return
  e.preventDefault()
  wind(Math.min(1, Math.abs(e.deltaY) / 120))
}
onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  requestAnimationFrame(() => {
    shown.value = true
  })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  cancelAnimationFrame(spinRaf)
  clearInterval(tick)
})
</script>

<template>
  <ErrorFrame>
    <div class="watch-scene" :class="{ running, shown }">
      <svg class="watch" viewBox="-290 -345 580 690" aria-hidden="true" @wheel="wheel">
        <defs>
          <!-- graphite on paper: the line wavers a little, and the paper's tooth shows through it -->
          <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="wave" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="wave"
              scale="1.8"
              xChannelSelector="R"
              yChannelSelector="G"
              result="drawn"
            />
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="8" result="tooth" />
            <feColorMatrix in="tooth" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 -0.55" result="grain" />
            <feComposite in="drawn" in2="grain" operator="in" />
          </filter>
          <!-- the numerals are inked more firmly: a softer grain, and a steadier hand -->
          <filter id="pencil-firm" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="wave" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="wave"
              scale="0.6"
              xChannelSelector="R"
              yChannelSelector="G"
              result="drawn"
            />
            <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="11" result="tooth" />
            <feColorMatrix in="tooth" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2 0 0 0 -0.1" result="grain" />
            <feComposite in="drawn" in2="grain" operator="in" />
          </filter>
          <!-- the shading: hatched at 45 degrees -->
          <pattern id="w-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="3" class="hatch-line" />
          </pattern>
          <pattern id="w-hatch-dense" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="2" class="hatch-line dense" />
          </pattern>
          <!-- the brushing on the case, running from horn to horn -->
          <pattern id="w-brush" width="4" height="40" patternUnits="userSpaceOnUse">
            <line x1="1" y1="0" x2="1" y2="40" class="brush-line" />
          </pattern>
          <!-- the side away from the light, bottom right -->
          <linearGradient id="w-shade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
            <stop offset="1" stop-color="#fff" />
          </linearGradient>
          <mask id="w-shade-mask">
            <rect x="-290" y="-345" width="580" height="690" fill="url(#w-shade)" />
          </mask>
          <linearGradient id="w-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0" />
            <stop offset="0.85" stop-color="#fff" />
          </linearGradient>
          <mask id="w-strap-mask">
            <rect x="-140" y="-345" width="280" :height="345 - CASE.notch" fill="url(#w-fade)" />
            <rect
              x="-140"
              :y="CASE.notch"
              width="280"
              :height="345 - CASE.notch"
              fill="url(#w-fade)"
              :transform="`rotate(180 0 ${(CASE.notch + 345) / 2})`"
            />
          </mask>
          <clipPath id="w-crown-clip">
            <path :d="crownBody" />
          </clipPath>
          <clipPath id="w-stone-clip">
            <path :d="STONE" />
          </clipPath>
          <pattern id="w-hatch-blue" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="2.2" class="hatch-blue" />
          </pattern>
        </defs>

        <g filter="url(#pencil)">
          <!-- construction: the centre lines, through and past the watch -->
          <g class="construction draw" style="--d: 0s">
            <line x1="-262" y1="0" x2="262" y2="0" pathLength="1" />
            <line x1="0" y1="-268" x2="0" y2="330" pathLength="1" />
          </g>
          <!-- the dimensions: 31.4 across the case, 43.5 from horn to horn -->
          <g class="dims fade" style="--d: 2.6s">
            <line x1="-128" :y1="-CASE.end" x2="-244" :y2="-CASE.end" />
            <line x1="-128" :y1="CASE.end" x2="-244" :y2="CASE.end" />
            <line x1="-236" :y1="-CASE.end" x2="-236" :y2="CASE.end" />
            <line x1="-240" :y1="-CASE.end + 4" x2="-232" :y2="-CASE.end - 4" />
            <line x1="-240" :y1="CASE.end + 4" x2="-232" :y2="CASE.end - 4" />
            <text transform="translate(-242 -80) rotate(-90)" text-anchor="middle">43.5</text>
            <line :x1="-CASE.side" :y1="-CASE.start - 8" :x2="-CASE.side" y2="-298" />
            <line :x1="CASE.side" :y1="-CASE.start - 8" :x2="CASE.side" y2="-298" />
            <line :x1="-CASE.side" y1="-290" x2="-22" y2="-290" />
            <line x1="22" y1="-290" :x2="CASE.side" y2="-290" />
            <line :x1="-CASE.side - 4" y1="-286" :x2="-CASE.side + 4" y2="-294" />
            <line :x1="CASE.side - 4" y1="-286" :x2="CASE.side + 4" y2="-294" />
            <text x="0" y="-286.5" text-anchor="middle">31.4</text>
          </g>

          <!-- the strap, only begun: set in its notch between the horns, its stitching, fading away -->
          <g mask="url(#w-strap-mask)" class="strap fade" style="--d: 1.8s">
            <line
              v-for="sx in [-1, 1]"
              :key="`st${sx}`"
              :x1="sx * CASE.hornIn"
              y1="-345"
              :x2="sx * CASE.hornIn"
              :y2="-CASE.end"
            />
            <line
              v-for="sx in [-1, 1]"
              :key="`sb${sx}`"
              :x1="sx * CASE.hornIn"
              :y1="CASE.end"
              :x2="sx * CASE.hornIn"
              y2="345"
            />
            <line
              v-for="sx in [-1, 1]"
              :key="`tt${sx}`"
              :x1="sx * (CASE.hornIn - 7)"
              y1="-345"
              :x2="sx * (CASE.hornIn - 7)"
              :y2="-CASE.notch - 6"
              class="stitch"
            />
            <line
              v-for="sx in [-1, 1]"
              :key="`tb${sx}`"
              :x1="sx * (CASE.hornIn - 7)"
              :y1="CASE.notch + 6"
              :x2="sx * (CASE.hornIn - 7)"
              y2="345"
              class="stitch"
            />
          </g>

          <!-- the case: brushed, shaded away from the light, its outline, the bevel along its flanks -->
          <path :d="`${silhouette}${rounded(BEZEL)}`" fill="url(#w-brush)" fill-rule="evenodd" class="fade" style="--d: 2s" />
          <path
            :d="`${silhouette}${rounded(BEZEL)}`"
            fill="url(#w-hatch)"
            fill-rule="evenodd"
            mask="url(#w-shade-mask)"
            class="fade"
            style="--d: 2.2s"
          />
          <path :d="silhouette" class="ink bold draw" pathLength="1" style="--d: 0.4s" />
          <path :d="bevel" class="fine draw" pathLength="1" style="--d: 0.9s" />

          <!-- the bezel: its edges drawn past the corners, the polished lip, where its faces meet -->
          <g class="construction fine-over draw" style="--d: 0.2s">
            <line
              v-for="(l, i) in overshoot"
              :key="i"
              :x1="l[0]"
              :y1="l[1]"
              :x2="l[2]"
              :y2="l[3]"
              pathLength="1"
            />
          </g>
          <path
            :d="`${rounded(BEZEL)}${rounded(OPEN)}`"
            fill="url(#w-hatch)"
            fill-rule="evenodd"
            mask="url(#w-shade-mask)"
            class="fade"
            style="--d: 2.2s"
          />
          <path :d="rounded(BEZEL)" class="ink bold draw" pathLength="1" style="--d: 0.6s" />
          <path :d="rounded(LIP)" class="fine draw" pathLength="1" style="--d: 0.8s" />
          <path :d="rounded(LIP_IN)" class="fine light draw" pathLength="1" style="--d: 0.85s" />
          <path :d="rounded(OPEN)" class="ink draw" pathLength="1" style="--d: 0.9s" />
          <line v-for="(m, i) in miters" :key="`m${i}`" v-bind="m" class="faint fade" style="--d: 1.7s" />
          <g class="fade" style="--d: 1.4s">
            <g v-for="(s, i) in screws" :key="i" :transform="`translate(${s.x} ${s.y})`">
              <circle r="7.5" class="ink" />
              <circle r="6" class="fine" />
              <line
                x1="-5.4"
                y1="0"
                x2="5.4"
                y2="0"
                :transform="`rotate(${s.r})`"
                class="slot"
              />
            </g>
          </g>

          <!-- the recess down to the dial, in shadow -->
          <path :d="`${rounded(OPEN)}${rounded(TRACK_OUT)}`" fill="url(#w-hatch-dense)" fill-rule="evenodd" class="fade" style="--d: 2.2s" />
          <path
            v-for="(r, i) in RINGS"
            :key="`r${i}`"
            :d="rounded(r)"
            class="fine draw"
            pathLength="1"
            :style="{ '--d': `${1 + i * 0.1}s` }"
          />

          <!-- the railway, with SWISS MADE in it under the VI -->
          <g class="fade" style="--d: 1.1s">
            <path :d="rounded(TRACK_OUT)" class="fine" />
            <path :d="rounded(TRACK_IN)" class="fine" />
            <line
              v-for="t in track"
              :key="`t${t.i}`"
              :x1="t.x1"
              :y1="t.y1"
              :x2="t.x2"
              :y2="t.y2"
              class="sleeper"
              :class="{ five: t.five }"
            />
            <text x="-15.2" :y="(TRACK_IN.hy + TRACK_OUT.hy) / 2" text-anchor="middle" dominant-baseline="central" class="made">SWISS</text>
            <text x="15.2" :y="(TRACK_IN.hy + TRACK_OUT.hy) / 2" text-anchor="middle" dominant-baseline="central" class="made">MADE</text>
            <path :d="rounded(FRAME)" class="fine light" />
            <path :d="rounded(SQUARE)" class="fine light" />
          </g>
        </g>

        <!-- the crown, with the firmer pencil so the stone keeps its point: the tube, the beads behind,
             the steel, the beads in front, the cone to the collar, the stone -->
        <g filter="url(#pencil-firm)" class="crown">
          <path :d="`M${CASE.side} -6H188.5V6H${CASE.side}`" class="ink draw" pathLength="1" style="--d: 1.2s" />
          <g class="fade" style="--d: 1.3s">
            <circle
              v-for="b in beadsBehind"
              :key="`bb${b.i}`"
              :cx="RING.x"
              :cy="b.y"
              :r="RING.bead"
              class="bead"
            />
          </g>
          <path :d="crownBody" class="paper-fill fade" style="--d: 1.3s" />
          <g clip-path="url(#w-crown-clip)" class="fade" style="--d: 1.6s">
            <rect x="188" y="-30" width="4.5" height="60" fill="url(#w-hatch-dense)" />
            <rect x="188" y="12" width="28" height="20" fill="url(#w-hatch)" />
          </g>
          <path :d="crownBody" class="ink draw" pathLength="1" style="--d: 1.25s" />
          <g class="fade" style="--d: 1.45s">
            <path d="M194.2 -28.4V28.4M201.8 -28.4V28.4" class="fine light" />
            <path d="M209.6 -21.6C210.6 -8 210.6 8 209.6 21.6" class="fine light" />
            <path d="M212.7 -18.7V18.7" class="fine" />
            <g v-for="b in beadsInFront" :key="`bf${b.i}`">
              <circle :cx="RING.x" :cy="b.y" :r="RING.bead" class="bead" />
              <path :d="b.shade" class="bead-shade" />
            </g>
          </g>
          <path :d="STONE" class="stone-fill fade" style="--d: 1.4s" />
          <g clip-path="url(#w-stone-clip)" class="fade" style="--d: 1.6s">
            <rect x="214" y="2.5" width="28" height="16" fill="url(#w-hatch-blue)" />
          </g>
          <path d="M217.5 -12.4C221.5 -12.4 225.5 -10.4 228.6 -7.4L234.6 -1.6" class="blue-fine fade" style="--d: 1.6s" />
          <ellipse
            cx="220.5"
            cy="-11.6"
            rx="2.6"
            ry="0.9"
            transform="rotate(-10 220.5 -11.6)"
            class="glint fade"
            style="--d: 1.6s"
          />
          <path :d="STONE" class="stone draw" pathLength="1" style="--d: 1.35s" />
        </g>

        <!-- the numerals, slanted along their hours, and the name under XII -->
        <g filter="url(#pencil-firm)" class="numerals fade" style="--d: 1.6s">
          <g v-for="n in numerals" :key="n.n" :transform="n.m">
            <path :d="n.d" class="numeral" />
            <text v-if="n.secret" :transform="`translate(${r2(n.secret.x)} ${r2(n.secret.y)}) rotate(${r2(n.secret.a)})`" class="secret" text-anchor="middle" dominant-baseline="central">HUGO</text>
          </g>
          <text x="1.3" y="-38.5" text-anchor="middle" dominant-baseline="central" class="signature">HUGO</text>
        </g>

        <!-- the hands are solid steel: nothing printed on the dial shows through them. The pencil
             leaves its grain in what it draws, so they are laid on a sheet of paper cut to their shape -->
        <g class="hands-under fade" style="--d: 2s">
          <path :d="HOUR.d" :transform="`rotate(${hour})`" />
          <path :d="MINUTE.d" :transform="`rotate(${minute})`" />
          <circle r="11" />
        </g>
        <!-- the hands, in blue pencil -->
        <g filter="url(#pencil)" class="hands fade" style="--d: 2s">
          <g :transform="`rotate(${hour})`">
            <path :d="HOUR.d" class="blue hand" />
            <path :d="HOUR.ridge" class="blue-fine" />
          </g>
          <g :transform="`rotate(${minute})`">
            <path :d="MINUTE.d" class="blue hand" />
            <path :d="MINUTE.ridge" class="blue-fine" />
          </g>
          <circle r="11" class="blue hand" />
          <circle r="7.5" class="blue-fine" />
          <circle r="2.2" class="pin" />
        </g>
      </svg>

      <!-- the crown is the control: over the drawing, where the crown is -->
      <button
        type="button"
        class="crown-hit"
        :aria-label="running ? 'The watch is running' : `Wind the crown (${Math.floor(wound)} of ${TURNS} turns)`"
        :disabled="running"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
        @click="wind(1)"
        @keydown="key"
      />

      <div class="caption">
        <h1 class="line">
          {{ running ? 'Back on time.' : `It stopped at ${stoppedAt}.` }}
        </h1>
        <p class="sub">
          Error {{ code }} · {{ is404 ? 'Page not found' : 'Something went wrong' }}
          <span class="path">{{ path }}</span>
        </p>
        <div v-if="!running" class="wind" aria-hidden="true">
          <span class="turns">
            <i v-for="i in TURNS" :key="i" :class="{ on: i <= wound }" />
          </span>
          <span class="hint">Wind the crown</span>
        </div>
        <nav v-else class="links" aria-label="Where to go instead">
          <NuxtLink v-for="l in links" :key="l.path" :to="l.path">
            {{ l.title }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </ErrorFrame>
</template>

<style scoped>
.watch-scene {
  /* the order every part is drawn in is given in seconds (--d); the whole is drawn at this pace */
  --pace: 0.42;
  --w: min(400px, 78vw);
  --graphite: #2f2b27;
  --blue: #2a4aa8;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.watch {
  width: var(--w);
  height: auto;
  overflow: visible;
  -webkit-user-select: none;
  user-select: none;
}
/* the pencil: a firm line for the outlines, a light one for what is inside them */
.ink {
  fill: none;
  stroke: var(--graphite);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ink.bold {
  stroke-width: 1.6;
}
.fine {
  fill: none;
  stroke: var(--graphite);
  stroke-width: 0.6;
  stroke-opacity: 0.75;
}
.fine.light {
  stroke-opacity: 0.4;
}
.faint {
  stroke: var(--graphite);
  stroke-width: 0.5;
  stroke-opacity: 0.35;
}
.construction line {
  stroke: var(--graphite);
  stroke-width: 0.45;
  stroke-opacity: 0.35;
  stroke-dasharray: 14 3 2 3;
}
.construction.fine-over line {
  stroke-opacity: 0.4;
  stroke-dasharray: none;
}
.brush-line {
  stroke: var(--graphite);
  stroke-width: 0.3;
  stroke-opacity: 0.18;
}
.hatch-line {
  stroke: var(--graphite);
  stroke-width: 0.45;
  stroke-opacity: 0.55;
}
.hatch-line.dense {
  stroke-width: 0.5;
  stroke-opacity: 0.5;
}
.dims line {
  stroke: var(--graphite);
  stroke-width: 0.5;
  stroke-opacity: 0.55;
}
.dims text {
  fill: var(--graphite);
  fill-opacity: 0.7;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
}
.strap line {
  stroke: var(--graphite);
  stroke-width: 0.9;
}
.strap .stitch {
  stroke-width: 0.6;
  stroke-dasharray: 3 2.6;
  stroke-opacity: 0.7;
}
.bead {
  fill: #efe9de;
  stroke: var(--graphite);
  stroke-width: 0.6;
}
.bead.small {
  stroke-opacity: 0.7;
}
.paper-fill {
  fill: #efe9de;
}
.bead-shade {
  fill: none;
  stroke: var(--graphite);
  stroke-width: 0.45;
  stroke-opacity: 0.55;
}
/* the stone: blue pencil, its tip drawn to a point */
.stone {
  fill: none;
  stroke: var(--blue);
  stroke-width: 0.95;
  stroke-linejoin: miter;
  stroke-miterlimit: 12;
}
.stone-fill {
  fill: rgb(42 74 168 / 0.2);
}
.hatch-blue {
  stroke: var(--blue);
  stroke-width: 0.5;
  stroke-opacity: 0.6;
}
.glint {
  fill: #efe9de;
  fill-opacity: 0.9;
}
.slot {
  stroke: var(--graphite);
  stroke-width: 1.3;
  stroke-linecap: round;
}
.sleeper {
  stroke: var(--graphite);
  stroke-width: 0.6;
}
.sleeper.five {
  stroke-width: 1.8;
}
.numeral {
  fill: var(--graphite);
}
.secret {
  fill: #efe9de;
  font-family: var(--font-mono);
  font-size: 1.2px;
  letter-spacing: 0.04em;
}
.signature {
  fill: var(--graphite);
  font-family: var(--font-redaction);
  font-size: 12.5px;
  letter-spacing: 0.21em;
}
.made {
  fill: var(--graphite);
  fill-opacity: 0.85;
  font-family: var(--font-redaction);
  font-size: 3.6px;
  letter-spacing: 0.14em;
}
/* blue pencil: the blued steel of the hands, and the stone in the crown */
.blue {
  fill: rgb(42 74 168 / 0.3);
  stroke: var(--blue);
  stroke-width: 0.9;
  stroke-linejoin: round;
}
.blue-fine {
  fill: none;
  stroke: var(--blue);
  stroke-width: 0.5;
}
.hands-under {
  fill: #efe9de;
}
.pin {
  fill: #efe9de;
  stroke: var(--blue);
  stroke-width: 0.6;
}

/* drawn once: the outlines are traced, then the rest is filled in */
.draw,
.draw line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.shown .draw,
.shown .draw line {
  animation: trace 0.55s cubic-bezier(0.55, 0, 0.35, 1) calc(var(--d) * var(--pace)) forwards;
}
.shown .construction.draw line {
  animation-duration: 0.7s;
}
.fade {
  opacity: 0;
}
.shown .fade {
  animation: appear 0.45s ease calc(var(--d) * var(--pace)) forwards;
}

/* the crown is at 3 o'clock, 213 of the drawing's 580 from the middle */
.crown-hit {
  position: absolute;
  top: calc(var(--w) * 690 / 580 / 2);
  left: 50%;
  width: 44px;
  height: 60px;
  translate: calc(var(--w) * 213 / 580 - 22px) -50%;
  border-radius: 12px;
  cursor: grab;
  touch-action: none;
}
.crown-hit:active {
  cursor: grabbing;
}
.crown-hit:disabled {
  cursor: default;
}
.crown-hit:focus-visible {
  outline: 1px solid #901112;
  outline-offset: 2px;
}
.caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.line {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 30px;
  line-height: 36px;
  font-weight: 400;
}
.sub {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(28 25 23 / 0.55);
}
.path {
  margin-left: 8px;
  text-transform: none;
  text-decoration: line-through;
  text-decoration-color: #cd1919;
}
.wind {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}
.turns {
  display: flex;
  gap: 4px;
}
.turns i {
  width: 10px;
  height: 2px;
  background: rgb(28 25 23 / 0.15);
  transition: background 0.2s ease;
}
.turns i.on {
  background: #901112;
}
.hint {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(28 25 23 / 0.6);
}
.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 20px;
  margin-top: 14px;
  animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) 1.6s backwards;
}
.links a {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 17px;
  color: #1c1917;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: text-decoration-color 0.2s ease;
}
.links a:hover,
.links a:focus-visible {
  text-decoration-color: #901112;
  outline: none;
}
@keyframes trace {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes appear {
  to {
    opacity: 1;
  }
}
@keyframes rise {
  from {
    opacity: 0;
    translate: 0 6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .shown .draw,
  .shown .draw line,
  .shown .fade {
    animation-duration: 0s;
    animation-delay: 0s;
  }
  .links {
    animation: none;
  }
}
</style>
