<script setup lang="ts">
import { monogramPath } from '~/utils/signature'

// The drawing of the watch, on its own (<ErrorSketch>): Hugo's Santos-Dumont, large model, in pencil,
// every measure taken off a face-on picture of it (a unit is one of its pixels, the centre is the
// hands' arbor). The page around it decides where the hands are (hour and minute, in degrees from
// XII), how far the crown has turned (spin), and whether the dimensions are drawn.
//
// With the loupe, it can be looked at closely: press on it, and it is drawn again at six times its
// size, still sharp. Close up there is more on the dial than can be seen from where you stand:
// words in the thick strokes of the numerals, as Cartier hides its name in the VII; a line round
// the central square that is writing; the error, in the track, where the minute hand stopped; and
// the monogram at six o'clock.
//
// The graphite isn't fixed. A quick pass over the drawing, with the cursor or a finger, smudges it, as
// a finger smudges pencil: the lines it crosses are dragged a little the way it went, and thinned.
// Bare paper stays bare. A slow movement only passes over. The hands are steel, on top of the
// drawing, and nothing smudges them.
const { hour = 122, minute = 24, spin = 0, dims = true, smudge = true, loupe = false, code = 404, path = '' } = defineProps<{
  hour?: number
  minute?: number
  spin?: number
  dims?: boolean
  smudge?: boolean
  loupe?: boolean
  /** the error, and the address that led to it: they are engraved on the dial */
  code?: number
  path?: string
}>()

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
// the thick stroke of a letter, as a place to engrave: its middle, its angle, how long and how wide
type Stroke = { x: number, y: number, a: number, len: number, th: number }
function letters(n: string, h: number) {
  const width = [...n].reduce((w, c) => w + WIDE[c]!, 0) + GAP * (n.length - 1)
  let x = -width / 2
  let d = ''
  const strokes: Stroke[] = []
  const rect = (x0: number, y0: number, w: number, hh: number) => `M${r2(x0)} ${r2(y0)}h${r2(w)}v${r2(hh)}h${r2(-w)}Z`
  const quad = (pts: number[][]) => `M${pts.map(p => `${r2(p[0]!)} ${r2(p[1]!)}`).join('L')}Z`
  for (const c of n) {
    const w = WIDE[c]!
    const m = OUTSET
    if (c === 'I') {
      d += rect(x + (w - STEM) / 2, -h + SERIF, STEM, h - 2 * SERIF) + rect(x, -h, w, SERIF) + rect(x, -SERIF, w, SERIF)
      strokes.push({ x: x + w / 2, y: -h / 2, a: 90, len: h - 2 * SERIF - 3, th: STEM })
    } else if (c === 'V') {
      const mid = x + w / 2
      // the thick stroke falls from the left, the thin one from the right, to a point at the foot
      d += quad([[x + m, -h + SERIF], [x + m + DIAG, -h + SERIF], [mid + 0.9, 0], [mid - 1.2, 0]])
      d += quad([[x + w - m - HAIR, -h + SERIF], [x + w - m, -h + SERIF], [mid + 1, 0], [mid + 0.2, 0]])
      d += rect(x, -h, 2 * m + DIAG, SERIF) + rect(x + w - 2 * m - HAIR, -h, 2 * m + HAIR, SERIF)
      // it narrows to its point: only its upper part is wide enough to write in
      const sx = x + m + DIAG / 2
      strokes.push({ x: (sx + mid) / 2, y: -h / 2, a: Math.atan2(h, mid - sx) / deg, len: Math.hypot(h, mid - sx) * 0.6, th: 2.6 })
    } else {
      d += quad([[x + m, -h + SERIF], [x + m + DIAG, -h + SERIF], [x + w - m, -SERIF], [x + w - m - DIAG, -SERIF]])
      d += quad([[x + w - m - HAIR, -h + SERIF], [x + w - m, -h + SERIF], [x + m + HAIR, -SERIF], [x + m, -SERIF]])
      d += rect(x, -h, 2 * m + DIAG, SERIF) + rect(x + w - 2 * m - HAIR, -h, 2 * m + HAIR, SERIF)
      d += rect(x, -SERIF, 2 * m + HAIR, SERIF) + rect(x + w - 2 * m - DIAG, -SERIF, 2 * m + DIAG, SERIF)
      const run = w - 2 * m - DIAG
      const rise = h - 2 * SERIF
      const len = Math.hypot(run, rise)
      strokes.push({ x: x + w / 2, y: -h / 2, a: Math.atan2(rise, run) / deg, len: len * 0.82, th: (DIAG * rise) / len })
    }
    x += w + GAP
  }
  return { d, strokes }
}
// each side's outward direction (n) and the direction its letters run in (t)
const SIDES = [
  { n: [0, -1], t: [1, 0], foot: FOOT.hy, head: HEAD.hy },
  { n: [1, 0], t: [0, 1], foot: FOOT.hx, head: HEAD.hx },
  { n: [0, 1], t: [-1, 0], foot: FOOT.hy, head: HEAD.hy },
  { n: [-1, 0], t: [0, -1], foot: FOOT.hx, head: HEAD.hx },
]
const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']
// What is written in the numerals, too small to be read without the loupe, by hour and by stroke:
// the watch's name at the top, and who made it first, when; the movement beside the crown that
// winds it; in the 4 of 404 the address that was asked for; Hugo's name in the VII, where Cartier
// hides its own; at IX where he was when he bought it, and at XI what he says about work. Some
// numerals have nothing in them.
const ENGRAVED: Record<number, Array<string | null>> = {
  0: ['SANTOS-DUMONT'],
  1: ['LOUIS CARTIER · 1904'],
  3: ['430 MC', 'HAND-WOUND', '21,600 VPH'],
  4: ['@path'],
  7: ['HUGO'],
  9: [null, 'VERCEL'],
  11: ['ITERATE TO GREATNESS'],
}
const MONO = 0.6 // a mono letter's width, in ems
const numerals = ROMAN.map((n, i) => {
  const a = i * 30
  const side = Math.round(a / 90) % 4
  const { n: nn, t, foot, head } = SIDES[side]!
  // the hour's slant from the side's normal
  const k = Math.tan((((a - side * 90 + 540) % 360) - 180) * deg)
  const dx = nn[0]! + t[0]! * k
  const dy = nn[1]! + t[1]! * k
  const g = letters(n, head - foot)
  // each word set along its stroke, the way round that reads left to right, or downwards, on the dial
  const words = (ENGRAVED[i] ?? []).flatMap((word, k) => {
    const st = g.strokes[k]
    const text = word === '@path' ? (path || `ERROR ${code}`) : word
    if (!st || !text) return []
    const rad = st.a * deg
    const sx = t[0]! * Math.cos(rad) - dx * Math.sin(rad)
    const sy = t[1]! * Math.cos(rad) - dy * Math.sin(rad)
    const a = sx < -0.2 || (Math.abs(sx) <= 0.2 && sy < 0) ? st.a + 180 : st.a
    const size = Math.min(1.9, st.th * 0.56)
    const long = text.length * size * (MONO + 0.04) > st.len
    return [{ text, x: r2(st.x), y: r2(st.y), a: r2(a), size: r2(size), fit: long ? r2(st.len) : undefined }]
  })
  // the upright letters, carried onto the slant: across stays across, up runs along the hour
  return { n, d: g.d, words, m: `matrix(${t[0]} ${t[1]} ${r2(-dx)} ${r2(-dy)} ${r2(foot * dx)} ${r2(foot * dy)})` }
})

// The line round the central square, looked at closely, is writing, as on a banknote: the error,
// over and over, fitted to the line's length (about 517 units, less a gap where it starts).
const PHRASE = code === 404 ? 'ERROR 404 · PAGE NOT FOUND · ' : `ERROR ${code} · SOMETHING WENT WRONG · `
const MICRO = { size: 1.6, length: 511 }
const microprint = PHRASE.repeat(Math.floor(MICRO.length / (MICRO.size * (MONO + 0.06)) / PHRASE.length)).trimEnd()
// The error again, in the track, in the minute after the one the minute hand stopped at: the one it
// can't get to.
const STUCK_AT = code % 100 < 60 ? code % 100 : 0
const inTrack = (() => {
  const a = (STUCK_AT + 0.5) * 6
  const p = onRect(a, { hx: (TRACK_IN.hx + TRACK_OUT.hx) / 2, hy: (TRACK_IN.hy + TRACK_OUT.hy) / 2 })
  return { x: r2(p.x), y: r2(p.y), a: Math.round(a / 90) % 4 * 90 }
})()
// and at six o'clock, just inside the track, the monogram, where some watchmakers etch theirs
const MONOGRAM = { h: 4.4, cx: 489, cy: -301.5, at: 116.4 }
const monogram = `translate(0 ${MONOGRAM.at}) scale(${Math.round((MONOGRAM.h / 943) * 1e5) / 1e5}) translate(${-MONOGRAM.cx} ${-MONOGRAM.cy})`

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

// --- the crown's beads ---------------------------------------------------------------------------
// spheres set round the crown's rim, seen side on: each is a circle at R sin a, and those turned
// away pass behind the crown, where only their tops show above its edge
const RING = { x: 198.5, r: 28.5, n: 17, bead: 3.4 }
const beads = computed(() => {
  const step = (2 * Math.PI) / RING.n
  return Array.from({ length: RING.n }, (_, i) => {
    const a = i * step + (spin / 8) * step
    const y = RING.r * Math.sin(a)
    // a little shading on each, low on the side away from the light
    const shade = `M${r2(RING.x + 2.3 * Math.cos(15 * deg))} ${r2(y + 2.3 * Math.sin(15 * deg))}A2.3 2.3 0 0 1 ${r2(RING.x + 2.3 * Math.cos(105 * deg))} ${r2(y + 2.3 * Math.sin(105 * deg))}`
    return { i, y: r2(y), z: Math.cos(a), shade }
  }).filter(b => b.z > -0.4).sort((p, q) => p.z - q.z)
})
const beadsBehind = computed(() => beads.value.filter(b => b.z < 0))
const beadsInFront = computed(() => beads.value.filter(b => b.z >= 0))

// --- smudging --------------------------------------------------------------------------------------
// Once it has drawn itself, the drawing is copied to pixels, paper and lines. A quick pass smudges
// that copy, as a finger smudges pencil: under it the graphite is spread, softly and a little the way
// it goes, so the lines it crosses lose their edge and go paler, and a faint haze of what came off
// them settles round them, in the paper's grain. Nothing is carried further than the finger is wide.
// A slow movement only passes over; going over the same place again spreads it a little more. Only
// where it has rubbed is the copy shown over the drawing; everywhere else the lines stay as drawn.
const sheet = ref<HTMLDivElement>()
const drawing = ref<SVGSVGElement>()
const rubbed = ref<HTMLCanvasElement>()
const FINGER = 12 // its radius, in px
const SOFT = 3 // how far it spreads the graphite, in px
const PULL = 2 // how far it pulls it the way it goes, at each look, in px
const SLOW = 0.8 // px a millisecond: slower than this, the cursor only passes over
const FAST = 4 // and from this speed it smudges as much as it ever does
const LIFT = 0.45 // at that speed, in one pass, how far the lines under it go towards smudged
const SETTLE = 0.75 // and how much of what came off them settles round them, in the grain
const STEP = 0.3 // the finger's steps along its way, as a part of its radius
type Pt = { x: number, y: number }
let dpr = 1
let r = 0 // the finger's radius, in the copy's pixels
let margin = 0 // and how far round it the spreading reaches
let work: CanvasRenderingContext2D | undefined // the copy, smudged
let reach: CanvasRenderingContext2D | undefined // where it has been rubbed: where the copy is shown
let look: CanvasRenderingContext2D | undefined // what is under the finger, pulled the way it goes
let low: CanvasRenderingContext2D | undefined // the same, taken down to soften it
let soft: CanvasRenderingContext2D | undefined // and back up, spread
let stamp: CanvasRenderingContext2D | undefined
let tip: HTMLCanvasElement | undefined // the finger's soft round
let tooth: HTMLCanvasElement | undefined // the paper's grain, the size of the sheet
let dirty: { x0: number, y0: number, x1: number, y1: number } | null = null
let frame = 0
let preparing = 0
let last: (Pt & { t: number }) | null = null
let speed = 0
// the pointer is holding something (the loupe, the dial): it doesn't smudge meanwhile
const held = ref(false)

function blank(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}
// a soft round, full in the middle and gone at its edge
function round(size: number, colour = '#000') {
  const c = blank(size, size)
  const g = c.getContext('2d')!
  const fill = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  fill.addColorStop(0, 'rgba(0,0,0,1)')
  fill.addColorStop(0.4, 'rgba(0,0,0,0.85)')
  fill.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = fill
  g.fillRect(0, 0, size, size)
  g.globalCompositeOperation = 'source-in'
  g.fillStyle = colour
  g.fillRect(0, 0, size, size)
  return c
}
// the paper: the first ground behind the drawing
function paperOf(el: Element) {
  for (let e: Element | null = el; e; e = e.parentElement) {
    const c = getComputedStyle(e).backgroundColor
    if (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)') return c
  }
  return '#efe9de'
}

// An image can't reach the page's fonts, so the faces the drawing's words are set in are written
// into the copy, read from the page's own stylesheets.
async function faces(families: Set<string>) {
  const found: Array<{ rule: CSSFontFaceRule, base: string }> = []
  const walk = (rules: CSSRuleList, base: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) found.push({ rule, base })
      else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules, base)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules, sheet.href ?? window.location.href)
    } catch {
      // another origin's stylesheet: nothing the drawing uses
    }
  }
  const css = await Promise.all(found.map(async ({ rule, base }) => {
    const { style } = rule
    const family = style.getPropertyValue('font-family').replace(/["']/g, '').trim()
    if (!families.has(family) || !['', 'normal'].includes(style.getPropertyValue('font-style'))) return ''
    const url = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(style.getPropertyValue('src'))?.[1]
    if (!url) return ''
    const blob = await fetch(new URL(url, base)).then(res => res.blob()).catch(() => null)
    if (!blob) return ''
    const data = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(blob)
    })
    const range = style.getPropertyValue('unicode-range')
    return `@font-face{font-family:"${family}";font-style:normal;font-weight:${style.getPropertyValue('font-weight') || '400'};${range ? `unicode-range:${range};` : ''}src:url(${data})}`
  }))
  return css.join('')
}

// The drawing, as pixels: a copy of it with every style written onto it and its fonts in it, drawn
// in full on the paper's colour.
const PAINT = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'font-family', 'font-size', 'font-style', 'font-weight', 'letter-spacing']
async function rasterise(svg: SVGSVGElement, w: number, h: number, paper: string) {
  const copy = svg.cloneNode(true) as SVGSVGElement
  const from = svg.querySelectorAll('*')
  const to = copy.querySelectorAll('*')
  from.forEach((node, i) => {
    const cs = getComputedStyle(node)
    const paint = PAINT.map(p => `${p}:${cs.getPropertyValue(p)}`)
    const opacity = node.classList.contains('fade') ? '1' : cs.opacity
    to[i]!.setAttribute('style', [...paint, 'stroke-dashoffset:0', `opacity:${opacity}`].join(';'))
  })
  const families = new Set(Array.from(svg.querySelectorAll('text')).map(t => getComputedStyle(t).fontFamily.split(',')[0]!.replace(/["']/g, '').trim()))
  const fonts = await faces(families)
  if (fonts) {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    style.textContent = fonts
    copy.prepend(style)
  }
  copy.removeAttribute('class')
  copy.setAttribute('width', String(w))
  copy.setAttribute('height', String(h))
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    const g = blank(w, h).getContext('2d')!
    g.fillStyle = paper
    g.fillRect(0, 0, w, h)
    g.drawImage(img, 0, 0, w, h)
    return g
  } finally {
    URL.revokeObjectURL(url)
  }
}

// the paper's tooth, fixed to the sheet: what settles, settles on its ridges
function teeth(w: number, h: number) {
  const n = 64
  const seed = blank(n, n)
  const g = seed.getContext('2d')!
  const img = g.createImageData(n, n)
  for (let i = 0; i < n * n; i++) {
    const v = Math.random()
    img.data[i * 4 + 3] = Math.round(255 * (0.2 + 0.8 * v * v))
  }
  g.putImageData(img, 0, 0)
  // a grain a pixel or so across, whatever the screen
  const size = Math.round(n * Math.max(1, dpr * 0.75))
  const tile = blank(size, size)
  const t = tile.getContext('2d')!
  t.imageSmoothingQuality = 'high'
  t.drawImage(seed, 0, 0, size, size)
  const sheet = blank(w, h)
  const s = sheet.getContext('2d')!
  s.fillStyle = s.createPattern(tile, 'repeat')!
  s.fillRect(0, 0, w, h)
  return sheet
}
const context = (w: number, h: number) => {
  const g = blank(w, h).getContext('2d')!
  g.imageSmoothingQuality = 'high'
  return g
}

async function prepare() {
  const el = sheet.value
  if (!el || !drawing.value || !rubbed.value) return
  const ratio = Math.min(3, window.devicePixelRatio || 1)
  const w = Math.round(el.clientWidth * ratio)
  const h = Math.round(el.clientHeight * ratio)
  if (!w || !h || (work?.canvas.width === w && work.canvas.height === h)) return
  const token = ++preparing
  const copy = await rasterise(drawing.value, w, h, paperOf(el)).catch(() => undefined)
  if (!copy || token !== preparing || !rubbed.value) return
  dpr = ratio
  work = copy
  reach = context(w, h)
  // a new size starts clean: what was smudged at the old one is let go
  rubbed.value.width = w
  rubbed.value.height = h
  r = Math.max(6, Math.round(FINGER * dpr))
  const q = Math.max(2, Math.round(SOFT * dpr))
  margin = 2 * q + Math.ceil(3 * PULL * dpr)
  const s = 2 * (r + margin)
  look = context(s, s)
  low = context(Math.ceil(s / q), Math.ceil(s / q))
  soft = context(s, s)
  stamp = context(2 * r, 2 * r)
  tip = round(2 * r)
  tooth = teeth(w, h)
  dirty = null
  last = null
}

// the finger, kept on the sheet
function inside(x: number, y: number): Pt {
  const c = work!.canvas
  return { x: Math.min(Math.max(x, r), c.width - r), y: Math.min(Math.max(y, r), c.height - r) }
}
// One touch of the finger, at a point, going the way u, with a part a of its full effect.
function smear(at: Pt, u: Pt, a: number, b: number) {
  const s = look!.canvas.width
  const half = s / 2
  const pull = PULL * dpr
  // what is under it, pulled the way it goes: four looks, each a little further back, averaged
  for (let i = 0; i < 4; i++) {
    look!.globalCompositeOperation = i ? 'source-over' : 'copy'
    look!.globalAlpha = 1 / (i + 1)
    look!.drawImage(work!.canvas, at.x - half - u.x * pull * i, at.y - half - u.y * pull * i, s, s, 0, 0, s, s)
  }
  // spread: taken down, and back up
  const lw = low!.canvas.width
  low!.globalCompositeOperation = 'copy'
  low!.drawImage(look!.canvas, 0, 0, s, s, 0, 0, lw, lw)
  soft!.globalCompositeOperation = 'copy'
  soft!.drawImage(low!.canvas, 0, 0, lw, lw, 0, 0, s, s)
  // through the finger's round
  const d = 2 * r
  stamp!.globalCompositeOperation = 'copy'
  stamp!.drawImage(soft!.canvas, margin, margin, d, d, 0, 0, d, d)
  stamp!.globalCompositeOperation = 'destination-in'
  stamp!.drawImage(tip!, 0, 0)
  // the lines go paler, towards what they'd be spread out; bare paper can't go paler
  work!.globalCompositeOperation = 'lighten'
  work!.globalAlpha = a
  work!.drawImage(stamp!.canvas, at.x - r, at.y - r)
  // and what came off them settles on the paper round them, in its grain; graphite can't go darker
  stamp!.drawImage(tooth!, at.x - r, at.y - r, d, d, 0, 0, d, d)
  work!.globalCompositeOperation = 'darken'
  work!.globalAlpha = b
  work!.drawImage(stamp!.canvas, at.x - r, at.y - r)
  work!.globalCompositeOperation = 'source-over'
  work!.globalAlpha = 1
  reach!.drawImage(tip!, at.x - r, at.y - r)
  dirty = {
    x0: Math.min(dirty?.x0 ?? Infinity, at.x - r),
    y0: Math.min(dirty?.y0 ?? Infinity, at.y - r),
    x1: Math.max(dirty?.x1 ?? -Infinity, at.x + r),
    y1: Math.max(dirty?.y1 ?? -Infinity, at.y + r),
  }
}
// what has changed, shown: the copy, where it has been rubbed
function show() {
  frame = 0
  const view = rubbed.value?.getContext('2d')
  if (!dirty || !view || !work || !reach) return
  const x0 = Math.max(0, Math.floor(dirty.x0))
  const y0 = Math.max(0, Math.floor(dirty.y0))
  const w = Math.min(view.canvas.width, Math.ceil(dirty.x1)) - x0
  const h = Math.min(view.canvas.height, Math.ceil(dirty.y1)) - y0
  dirty = null
  if (w <= 0 || h <= 0) return
  view.save()
  view.beginPath()
  view.rect(x0, y0, w, h)
  view.clip()
  view.globalCompositeOperation = 'copy'
  view.drawImage(work.canvas, x0, y0, w, h, x0, y0, w, h)
  view.globalCompositeOperation = 'destination-in'
  view.drawImage(reach.canvas, x0, y0, w, h, x0, y0, w, h)
  view.restore()
}
function rub(x: number, y: number, t: number, touch: boolean) {
  const prev = last
  if (!prev || t - prev.t > 80) {
    last = { x, y, t }
    speed = 0
    return
  }
  const dx = x - prev.x
  const dy = y - prev.y
  const dist = Math.hypot(dx, dy)
  if (dist < 0.5) return
  last = { x, y, t }
  speed = speed * 0.6 + (dist / Math.max(1, t - prev.t)) * 0.4
  const slow = touch ? SLOW / 2 : SLOW
  const f = Math.min(1, Math.max(0, (speed - slow) / (FAST - slow)))
  const k = f * f * (3 - 2 * f)
  if (!k) return
  // the steps, at most a hundred to a movement however long; each does its share of one pass
  const n = Math.min(100, Math.max(1, Math.ceil((dist * dpr) / (r * STEP))))
  const share = (dist * dpr) / n / (2 * r)
  const a = 1 - (1 - LIFT * k) ** share
  const b = 1 - (1 - SETTLE * k) ** share
  const u = { x: dx / dist, y: dy / dist }
  for (let i = 1; i <= n; i++) smear(inside((prev.x + (dx * i) / n) * dpr, (prev.y + (dy * i) / n) * dpr), u, a, b)
  frame ||= requestAnimationFrame(show)
}
function smudgeAt(e: PointerEvent) {
  if (!work || !smudge || held.value) return
  const box = sheet.value!.getBoundingClientRect()
  const all = e.getCoalescedEvents?.()
  for (const p of all?.length ? all : [e]) rub(p.clientX - box.left, p.clientY - box.top, p.timeStamp, e.pointerType !== 'mouse')
}

// --- the loupe -----------------------------------------------------------------------------------
// The drawing again, in a round lens, its view box narrowed to the part under the pointer: drawn,
// not enlarged, so it stays sharp. What has been smudged is enlarged into it from the copy. With a
// finger, it waits for the finger to rest a moment (a quick stroke is a smudge), and sits above it.
const ZOOM = 6
const lens = reactive({ on: false, p: { x: 0, y: 0 }, c: { x: 0, y: 0 }, r: 78 })
const lensPaint = ref<HTMLCanvasElement>()
let resting: ReturnType<typeof setTimeout> | undefined
let pressed: Pt | null = null
function aim(e: PointerEvent) {
  const box = sheet.value!.getBoundingClientRect()
  const p = { x: e.clientX - box.left, y: e.clientY - box.top }
  lens.r = Math.round(Math.min(78, box.width * 0.22))
  lens.p = p
  lens.c = e.pointerType === 'mouse' ? p : { x: p.x, y: p.y - lens.r - 28 }
  paintLens()
}
const unit = () => 580 / (sheet.value?.clientWidth || 580)
const lensBox = computed(() => {
  const u = unit()
  const side = ((2 * lens.r) / ZOOM) * u
  return `${r2(-290 + (lens.p.x - lens.r / ZOOM) * u)} ${r2(-345 + (lens.p.y - lens.r / ZOOM) * u)} ${r2(side)} ${r2(side)}`
})
const lensStyle = computed(() => ({ width: `${2 * lens.r}px`, height: `${2 * lens.r}px`, translate: `${lens.c.x - lens.r}px ${lens.c.y - lens.r}px` }))
function paintLens() {
  const c = lensPaint.value
  const from = rubbed.value
  if (!lens.on || !c || !from || !work) return
  const size = Math.round(2 * lens.r * Math.min(3, window.devicePixelRatio || 1))
  if (c.width !== size) c.width = c.height = size
  const g = c.getContext('2d')!
  g.imageSmoothingQuality = 'high'
  g.clearRect(0, 0, size, size)
  const side = ((2 * lens.r) / ZOOM) * dpr
  g.drawImage(from, (lens.p.x - lens.r / ZOOM) * dpr, (lens.p.y - lens.r / ZOOM) * dpr, side, side, 0, 0, size, size)
}
function showLens(on: boolean) {
  lens.on = on
  held.value = on
  if (on) nextTick(paintLens)
}

function down(e: PointerEvent) {
  // the crown, or anything else set on the drawing, is pressed, not looked at
  if (e.button !== 0 || !loupe || (e.target as Element).closest('button, a')) return
  sheet.value!.setPointerCapture(e.pointerId)
  pressed = { x: e.clientX, y: e.clientY }
  aim(e)
  if (e.pointerType === 'mouse') showLens(true)
  else resting = setTimeout(() => showLens(true), 220)
}
function move(e: PointerEvent) {
  if (pressed) {
    // a finger that moves on before resting was smudging, not looking
    if (!lens.on && Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) > 10) {
      clearTimeout(resting)
      pressed = null
    } else {
      aim(e)
    }
  }
  smudgeAt(e)
}
function up() {
  clearTimeout(resting)
  pressed = null
  if (lens.on) showLens(false)
}
function leave() {
  last = null
}
const views = computed(() => (loupe ? ['plate', 'lens'] : ['plate']))
const setDrawing = (el: unknown) => {
  drawing.value = (el ?? undefined) as SVGSVGElement | undefined
}
const setRubbed = (el: unknown) => {
  rubbed.value = (el ?? undefined) as HTMLCanvasElement | undefined
}
const setLensPaint = (el: unknown) => {
  lensPaint.value = (el ?? undefined) as HTMLCanvasElement | undefined
}

const shown = ref(false)
let wait: ReturnType<typeof setTimeout> | undefined
let again: ReturnType<typeof setTimeout> | undefined
let observer: ResizeObserver | undefined
onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  requestAnimationFrame(() => {
    shown.value = true
  })
  if (!smudge) return
  // once the drawing has drawn itself
  wait = setTimeout(() => {
    prepare()
    observer = new ResizeObserver(() => {
      clearTimeout(again)
      again = setTimeout(prepare, 200)
    })
    observer.observe(sheet.value!)
  }, reduced ? 0 : 1900)
})
onBeforeUnmount(() => {
  clearTimeout(wait)
  clearTimeout(again)
  clearTimeout(resting)
  cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="sheet"
    class="sketch"
    :class="{ shown, smudge, loupe, held }"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointerleave="leave"
    @pointercancel="up"
  >
    <!-- the drawing, and in the loupe the same drawing again, closer -->
    <div v-for="v in views" :key="v" :class="[v, { on: v === 'lens' && lens.on }]" :style="v === 'lens' ? lensStyle : undefined">
      <svg :ref="v === 'plate' ? setDrawing : undefined" class="drawing" :viewBox="v === 'plate' ? '-290 -345 580 690' : lensBox" aria-hidden="true">
        <defs v-if="v === 'plate'">
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
          <g v-if="dims" class="dims fade" style="--d: 2.6s">
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
            v-for="(ring, i) in RINGS"
            :key="`r${i}`"
            :d="rounded(ring)"
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
            <text
              v-for="(w, k) in n.words"
              :key="k"
              :transform="`translate(${w.x} ${w.y}) rotate(${w.a})`"
              :font-size="w.size"
              :textLength="w.fit"
              :lengthAdjust="w.fit ? 'spacingAndGlyphs' : undefined"
              class="secret"
              text-anchor="middle"
              dominant-baseline="central"
            >
              {{ w.text }}
            </text>
          </g>
          <text x="1.3" y="-38.5" text-anchor="middle" dominant-baseline="central" class="signature">HUGO</text>
        </g>

        <!-- printed, too small for the pencil's waver: the line round the square, which is writing; the
             error in the track; the monogram at six -->
        <g class="engraved fade" style="--d: 1.1s">
          <defs>
            <path :id="`w-square-${v}`" :d="rounded(SQUARE)" />
          </defs>
          <text class="microprint" dominant-baseline="central">
            <textPath :href="`#w-square-${v}`" startOffset="2" :textLength="MICRO.length" lengthAdjust="spacingAndGlyphs">{{ microprint }}</textPath>
          </text>
          <text :transform="`translate(${inTrack.x} ${inTrack.y}) rotate(${inTrack.a})`" class="in-track" text-anchor="middle" dominant-baseline="central">{{ code }}</text>
          <path :d="monogramPath" :transform="monogram" class="monogram" />
        </g>
      </svg>

      <!-- the drawing as it has been smudged, where it has been -->
      <canvas v-if="smudge && v === 'plate'" :ref="setRubbed" class="rubbed" aria-hidden="true" />
      <canvas v-if="smudge && v === 'lens'" :ref="setLensPaint" class="rubbed" aria-hidden="true" />

      <svg class="over" :viewBox="v === 'plate' ? '-290 -345 580 690' : lensBox" aria-hidden="true">
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
    </div>
    <slot />
  </div>
</template>

<style scoped>
.sketch {
  /* the order every part is drawn in is given in seconds (--d); the whole is drawn at this pace */
  --pace: 0.42;
  --graphite: #2f2b27;
  --blue: #2a4aa8;
  position: relative;
  width: var(--w, min(400px, 78vw));
  aspect-ratio: 580 / 690;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
/* a finger smudges sideways; up and down, the page still scrolls under it */
.sketch.smudge {
  touch-action: pan-y;
}
.plate,
.drawing,
.rubbed,
.over {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
/* the loupe: a round lens, its rim, the light falling off towards its edge */
.lens {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  overflow: hidden;
  border-radius: 50%;
  background: #efe9de;
  box-shadow:
    0 0 0 1.25px rgb(47 43 39 / 0.75),
    0 14px 34px rgb(40 30 20 / 0.22),
    0 3px 8px rgb(40 30 20 / 0.12);
  pointer-events: none;
  visibility: hidden;
  opacity: 0;
  scale: 0.82;
  transition:
    opacity 0.14s ease,
    scale 0.18s ease,
    visibility 0s linear 0.18s;
}
.lens.on {
  visibility: visible;
  opacity: 1;
  scale: 1;
  transition:
    opacity 0.12s ease,
    scale 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.15);
}
.lens::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 3px rgb(239 233 222 / 0.7),
    inset 0 0 0 3.75px rgb(47 43 39 / 0.3),
    inset 0 0 22px rgb(47 43 39 / 0.14);
}
.lens .drawing,
.lens .rubbed,
.lens .over {
  overflow: hidden;
}
.sketch.loupe {
  cursor: zoom-in;
}
.sketch.loupe.held {
  cursor: none;
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
/* what is written in the numerals' strokes: a speck, until it is looked at through the loupe */
.secret {
  fill: #efe9de;
  font-family: var(--font-mono);
  font-size: 1.9px;
  letter-spacing: 0.04em;
}
/* from where you stand, a fine grey line */
.microprint {
  fill: var(--graphite);
  fill-opacity: 0.5;
  font-family: var(--font-mono);
  font-size: 1.6px;
  letter-spacing: 0.06em;
}
.in-track {
  fill: var(--graphite);
  fill-opacity: 0.75;
  font-family: var(--font-mono);
  font-size: 2.3px;
  letter-spacing: 0.08em;
}
.monogram {
  fill: var(--graphite);
  fill-opacity: 0.6;
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
@media (prefers-reduced-motion: reduce) {
  .shown .draw,
  .shown .draw line,
  .shown .fade {
    animation-duration: 0s;
    animation-delay: 0s;
  }
}
</style>
