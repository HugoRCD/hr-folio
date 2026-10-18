// The site is lit by the sun over London, where Hugo works.
// Pure functions: solar elevation for an instant, then the page's light for that elevation.
import { contrast, hexToOklab, mixOklab, oklabToHex } from './oklab'

export const LONDON = { lat: 51.5072, lon: -0.1276 }

const rad = Math.PI / 180

/** Solar elevation (degrees) and whether it is morning, for an instant and a place. Accurate to well under a degree. */
export function sunAt(date: Date, { lat, lon } = LONDON) {
  const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0
  const g = (357.529 + 0.98560028 * d) * rad
  const q = 280.459 + 0.98564736 * d
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad
  const e = (23.439 - 0.00000036 * d) * rad
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / rad
  const dec = Math.asin(Math.sin(e) * Math.sin(L))
  const gmst = 18.697374558 + 24.06570982441908 * d
  const h = ((gmst * 15 + lon - ra) % 360 + 540) % 360 - 180 // hour angle, -180..180
  const elevation = Math.asin(Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(h * rad)) / rad
  return { elevation, morning: h < 0, hourAngle: h }
}

/** Minutes the given zone is ahead of UTC at that instant. */
export function offsetMinutes(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(at)
  const n = (t: string) => Number(parts.find(p => p.type === t)!.value)
  return (Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute')) - Math.floor(at.getTime() / 60000) * 60000) / 60000
}

/** `17:40` today, in the given zone (the day is today's there). */
export function localInstant(hhmm: string, timeZone: string) {
  const [h, m = '0'] = hhmm.split(':')
  const now = new Date(Date.now() + offsetMinutes(new Date(), timeZone) * 60000) // the zone's wall clock, read as UTC
  const guess = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), Number(h), Number(m)))
  return new Date(guess.getTime() - offsetMinutes(guess, timeZone) * 60000)
}

export type Oklch = [l: number, c: number, h: number]

// The page dims with the sun instead of switching at the horizon. Through the afternoon the white
// goes to parchment, through the evening the dark goes from violet to black, and everything on the
// ground moves with it so that nothing loses its contrast:
// - each text tone keeps the contrast it has at noon (or at midnight) on whatever the ground is;
// - the red slides along the band it is mixed from: towards Cartier's darker red as the light
//   falls, towards Ferrari's lifted red at dusk, back to halfway by day and by night.
// Light and dark still swap at the horizon (the text has to), from parchment to dusk violet.
const GROUND = {
  day: [1, 0, 0] as Oklch, // noon: white
  dawn: [0.9, 0.018, 250] as Oklch, // the first light, at the horizon: blue-grey, #D5DFEA
  golden: [0.9, 0.028, 78] as Oklch, // the last light, at the horizon: parchment, #E8DCCA
  blueMorning: [0.2, 0.04, 262] as Oklch, // before sunrise, at the horizon
  blueEvening: [0.2, 0.04, 300] as Oklch, // after sunset, at the horizon: violet, #191125
  night: [0.0847, 0, 0] as Oklch, // #020202
}
// how far from the horizon the light still moves, above and below (astronomical twilight ends at -18°)
const SPAN = { up: 18, down: 18 }

// the text tones, as Nuxt UI's neutral scale sets them, on white and on #020202
const TONES = ['highlighted', 'text', 'toned', 'muted', 'dimmed'] as const
const TONE_L = {
  light: { highlighted: 0.205, text: 0.371, toned: 0.439, muted: 0.556, dimmed: 0.708 },
  dark: { highlighted: 1, text: 0.922, toned: 0.87, muted: 0.708, dimmed: 0.556 },
}
const BASE = { light: '#FFFFFF', dark: '#020202' }

const CARTIER = '#C10016'
const FERRARI = '#DA291C'
const LIFT = 0.054 // on black every red is lifted by this much lightness, as Ferrari lifts its own
const MIN = 4.6 // the red's floor, a little over AA

export type Phase = 'night' | 'blue hour' | 'sunrise' | 'morning' | 'day' | 'afternoon' | 'golden hour' | 'dusk'

export function phaseOf(elevation: number, morning: boolean): Phase {
  if (elevation < -6) return 'night'
  if (elevation < 0) return morning ? 'blue hour' : 'dusk'
  if (elevation < 6) return morning ? 'sunrise' : 'golden hour'
  if (elevation < 20) return morning ? 'morning' : 'afternoon'
  return 'day'
}

const smooth = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

function mixOklch(a: Oklch, b: Oklch, t: number): Oklch {
  // Mix in OKLab (not LCH) so a grey end does not swing the hue.
  const [al, ac, ah] = a
  const [bl, bc, bh] = b
  const ax = ac * Math.cos(ah * rad), ay = ac * Math.sin(ah * rad)
  const bx = bc * Math.cos(bh * rad), by = bc * Math.sin(bh * rad)
  const x = ax + (bx - ax) * t, y = ay + (by - ay) * t
  return [al + (bl - al) * t, Math.hypot(x, y), (Math.atan2(y, x) / rad + 360) % 360]
}

const css = ([l, c, h]: Oklch) => `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(1)})`
export const oklchToHex = ([l, c, h]: Oklch) => oklabToHex([l, c * Math.cos(h * rad), c * Math.sin(h * rad)])
const grey = (l: number) => oklabToHex([l, 0, 0])

/** The grey that has, on `ground`, the contrast `l0` has on the base ground. */
function hold(l0: number, dark: boolean, ground: string, groundL: number) {
  const want = contrast(grey(l0), dark ? BASE.dark : BASE.light)
  let lo = dark ? groundL : 0
  let hi = dark ? 1 : groundL
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2
    const enough = contrast(grey(m), ground) >= want
    if (dark === enough) hi = m
    else lo = m
  }
  return dark ? hi : lo
}

/** The red at `t` on the Cartier–Ferrari band, lifted on black. */
export function redAt(t: number, dark: boolean) {
  const red = mixOklab(CARTIER, FERRARI, t)
  if (!dark) return red
  const [l, a, b] = hexToOklab(red)
  return oklabToHex([l + LIFT, a, b])
}

/** Where on the band the red sits for this ground: halfway when it can, else as near as holds MIN. */
function redFor(dark: boolean, ground: string) {
  if (contrast(redAt(0.5, dark), ground) >= MIN) return 0.5
  // on light grounds the red darkens towards Cartier (t → 0), on dark ones it lifts towards Ferrari (t → 1)
  let lo = dark ? 0.5 : 0
  let hi = dark ? 1 : 0.5
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2
    if ((contrast(redAt(m, dark), ground) >= MIN) === dark) hi = m
    else lo = m
  }
  return dark ? hi : lo
}

export const LIGHT_VARS = ['--ui-bg', '--ui-bg-muted', '--ui-bg-elevated', '--ui-bg-inverted', '--ui-border', '--ui-border-muted', '--code-bg', '--code-border', '--sun-elevation', ...TONES.map(t => t === 'text' ? '--ui-text' : `--ui-text-${t}`)]

/** The page's light for a sun height. `redT` overrides where the red sits on its band. */
export function lightFor(elevation: number, morning: boolean, redT: number | null = null) {
  const dark = elevation < 0
  const k = dark ? smooth(clamp01(-elevation / SPAN.down)) : smooth(clamp01(elevation / SPAN.up))
  const ground = dark
    ? mixOklch(morning ? GROUND.blueMorning : GROUND.blueEvening, GROUND.night, k)
    : mixOklch(morning ? GROUND.dawn : GROUND.golden, GROUND.day, k)
  const hex = oklchToHex(ground)
  const step = (d: number): Oklch => [ground[0] + (dark ? d : -d), ground[1] * (dark ? 1.2 : 1.6), ground[2]]
  const tones = Object.fromEntries(TONES.map(t => [t, hold(TONE_L[dark ? 'dark' : 'light'][t], dark, hex, ground[0])])) as Record<typeof TONES[number], number>
  const t = redT ?? redFor(dark, hex)
  const red = redAt(t, dark)
  const vars: Record<string, string> = {
    '--ui-bg': css(ground),
    '--ui-bg-muted': css(step(0.025)),
    '--ui-bg-elevated': css(step(0.035)),
    '--ui-border': css(step(0.08)),
    '--ui-border-muted': css(step(0.045)),
    '--code-bg': css(step(0.02)),
    '--code-border': css(step(0.08)),
    '--sun-elevation': elevation.toFixed(2),
  }
  for (const tone of TONES) vars[tone === 'text' ? '--ui-text' : `--ui-text-${tone}`] = css([tones[tone], 0, 0])
  vars['--ui-bg-inverted'] = css([tones.highlighted, 0, 0])
  return { dark, ground, hex, red, redT: t, phase: phaseOf(elevation, morning), vars }
}
