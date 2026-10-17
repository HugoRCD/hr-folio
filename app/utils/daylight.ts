// The site is lit by the sun over London, where Hugo works.
// Pure functions: solar elevation for an instant, then the page's light for that elevation.

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
  let h = ((gmst * 15 + lon - ra) % 360 + 540) % 360 - 180 // hour angle, -180..180
  const elevation = Math.asin(Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(h * rad)) / rad
  return { elevation, morning: h < 0, hourAngle: h }
}

type Oklch = [l: number, c: number, h: number]

// Grounds, chosen so text contrast never drops: the page only switches
// between light and dark at sunrise and sunset, and drifts within each side.
const GROUND = {
  day: [1, 0, 0] as Oklch, // noon: pure white
  dawn: [0.976, 0.007, 250] as Oklch, // first light: cool, blue-grey
  golden: [0.978, 0.008, 78] as Oklch, // last light: a trace of warmth, never cream
  blueMorning: [0.175, 0.022, 262] as Oklch, // before sunrise
  blueEvening: [0.175, 0.022, 300] as Oklch, // after sunset, violet
  night: [0.135, 0, 0] as Oklch, // #020202
}

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

export function lightFor(elevation: number, morning: boolean) {
  const dark = elevation < 0
  let ground: Oklch
  let border: Oklch
  if (dark) {
    // 0 → -10°: from twilight blue/violet to plain night.
    const t = smooth(clamp01(-elevation / 10))
    ground = mixOklch(morning ? GROUND.blueMorning : GROUND.blueEvening, GROUND.night, t)
    border = [ground[0] + 0.11, ground[1] * 1.2, ground[2]]
  } else {
    // 0 → 14°: from first or last light to plain white.
    const t = smooth(clamp01(elevation / 14))
    ground = mixOklch(morning ? GROUND.dawn : GROUND.golden, GROUND.day, t)
    border = [ground[0] - 0.08, ground[1] * 1.6, ground[2]]
  }
  return {
    dark,
    phase: phaseOf(elevation, morning),
    vars: {
      '--ui-bg': css(ground),
      '--ui-border': css(border),
      '--code-bg': css([ground[0] + (dark ? 0.02 : -0.02), ground[1], ground[2]]),
      '--code-border': css(border),
      '--sun-elevation': elevation.toFixed(2),
    } as Record<string, string>,
  }
}
