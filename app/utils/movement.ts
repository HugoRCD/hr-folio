// The page's movement: a hand-wound watch train, drawn as a plan, that keeps the page's time.
//
// The going train is a real one for 21,600 vph (3 Hz):
//   centre wheel 80 → third pinion 10, third wheel 75 → fourth pinion 10, fourth wheel 84 →
//   escape pinion 7: 8 × 7.5 × 12 = 720, so the escape wheel turns 720 times an hour. It has 15
//   teeth and lets one go every two beats: 720 × 15 × 2 = 21,600 beats an hour, 6 a second.
// The motion works carry the hands: the hour wheel (20) turns once in twelve hours and, through
// an intermediate wheel (16), the 24-hour wheel (40) once a day. That is the wheel the sun reads.
//
// Every wheel is phased so that its teeth mesh with its driver's, whatever the angle.

export type Pt = { x: number, y: number }
type Kind = 'wheel' | 'pinion' | 'escape'

const M = 0.8 // module: a wheel of t teeth has a pitch radius of t × M / 2
const deg = Math.PI / 180
export const pitch = (t: number) => (t * M) / 2
export const polar = (o: Pt, d: number, a: number): Pt => ({ x: o.x + d * Math.cos(a * deg), y: o.y + d * Math.sin(a * deg) })

export function toothed(t: number, kind: Kind, r = pitch(t)) {
  const step = (Math.PI * 2) / t
  const pts: [number, number][] = []
  const at = (rad: number, a: number) => pts.push([rad * Math.cos(a), rad * Math.sin(a)])
  for (let i = 0; i < t; i++) {
    const a = i * step
    if (kind === 'escape') {
      // ratchet teeth, leaning the way the wheel turns
      at(r - 3, a)
      at(r, a - step * 0.55)
      at(r - 0.8, a - step * 0.72)
    } else {
      const ro = r + M
      const ri = r - 1.25 * M
      at(ri, a - step * 0.32)
      at(ro, a - step * 0.15)
      at(ro, a + step * 0.15)
      at(ri, a + step * 0.32)
    }
  }
  return `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`
}

export const circle = (r: number) => `M${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`

/** crossings from the hub to the rim, as on a finished wheel */
export function spokes(n: number, r0: number, r1: number) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    for (const s of [0.16, -0.16]) {
      d += `M${(r0 * Math.cos(a)).toFixed(2)} ${(r0 * Math.sin(a)).toFixed(2)}L${(r1 * Math.cos(a + s)).toFixed(2)} ${(r1 * Math.sin(a + s)).toFixed(2)}`
    }
  }
  return d
}

/** the angle the driven wheel needs, at driver angle 0, so a tooth of the driver sits in one of its gaps */
export const mesh = (from: Pt, to: Pt, t1: number, t2: number) => {
  const th = Math.atan2(to.y - from.y, to.x - from.x)
  return th + Math.PI - Math.PI / t2 + th * (t1 / t2)
}

// --- the layout -------------------------------------------------------------------------------

export const TRAIN = { centre: 80, third: [75, 10], fourth: [84, 10], escape: [15, 7], hour: 20, inter: 16, day: 40 } as const
export const VIEW = '-86 -60 176 128'

export const C = { x: -40, y: 20 } // the centre: hands, hour wheel
export const T = polar(C, pitch(80) + pitch(10), -60)
export const F = polar(T, pitch(75) + pitch(10), -15)
export const E = polar(F, pitch(84) + pitch(7), 40)
export const B = polar(E, 40, -60) // the balance
export const P = polar(E, 22, -60) // the pallet fork's pivot
export const I = polar(C, pitch(20) + pitch(16), 150) // the intermediate wheel
export const D = polar(I, pitch(16) + pitch(40), 120) // the 24-hour wheel
export const CROWN = { x: 76, y: C.y } // at three o'clock, on the line of the centre

const offT = mesh(C, T, 80, 10)
const offF = mesh(T, F, 75, 10)
const offE = mesh(F, E, 84, 7)
const offI = mesh(C, I, 20, 16)
const offD = mesh(I, D, 16, 40)

type Spec = { id: string, at: Pt, t: number, kind?: Kind, arms?: number, pinion?: number, r?: number }
const wheel = ({ id, at, t, kind = 'wheel', arms = 5, pinion, r = pitch(t) }: Spec) => {
  const rim = r - (kind === 'escape' ? 3 : 1.25 * M) - 2.2
  return {
    id,
    at,
    paths: [toothed(t, kind, r), ...(pinion ? [toothed(pinion, 'pinion')] : [])],
    rim: circle(rim),
    spokes: spokes(arms, 3.6, rim),
  }
}

export const GOING = [
  wheel({ id: 'C', at: C, t: 80 }),
  wheel({ id: 'T', at: T, t: 75, pinion: 10 }),
  wheel({ id: 'F', at: F, t: 84, pinion: 10 }),
  wheel({ id: 'E', at: E, t: 15, kind: 'escape', arms: 4, pinion: 7, r: 9.5 }),
]
export const MOTION = [
  { id: 'H', at: C, path: toothed(20, 'pinion') },
  { id: 'I', at: I, path: toothed(16, 'pinion') },
  { id: 'D', at: D, path: toothed(40, 'wheel'), rim: circle(pitch(40) - 3), spokes: spokes(4, 3, pitch(40) - 3) },
]

// the balance: rim, arm, timing screws, and its hairspring
export const balance = {
  rim: `${circle(18)}${circle(15.8)}`,
  arm: 'M-15.8 0H15.8',
  screws: Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8
    return { x: 19.1 * Math.cos(a), y: 19.1 * Math.sin(a) }
  }),
  spring: (() => {
    const pts: string[] = []
    for (let i = 0; i <= 240; i++) {
      const a = (i / 240) * Math.PI * 2 * 5.5
      const r = 2 + (i / 240) * 9.5
      pts.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`)
    }
    return `M${pts.join('L')}`
  })(),
}

// the fork: an anchor whose two stones meet the escape wheel, and a fork towards the balance
const toE = Math.atan2(E.y - P.y, E.x - P.x) / deg
const stoneA = polar(E, 12, -60 - 40)
const stoneB = polar(E, 12, -60 + 40)
const forkEnd = polar(P, 12, toE + 180)
export const fork = `M${(stoneA.x - P.x).toFixed(2)} ${(stoneA.y - P.y).toFixed(2)}L0 0L${(stoneB.x - P.x).toFixed(2)} ${(stoneB.y - P.y).toFixed(2)}M0 0L${(forkEnd.x - P.x).toFixed(2)} ${(forkEnd.y - P.y).toFixed(2)}`

export const centres = [C, T, F, E, B].map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('')

// --- the motion -------------------------------------------------------------------------------

export const BEATS = 6 // a second: 3 Hz
const easeOut = (u: number) => 1 - (1 - u) ** 3

/**
 * Every angle, in radians, for the going train at `t` (seconds of the local day, the real clock)
 * and the hands at `h` (seconds of the local day they show, which the crown can set).
 */
export function angles(t: number, h: number, still = false) {
  const beats = t * BEATS
  const b = Math.floor(beats)
  const snap = still ? 0 : easeOut(Math.min(1, (beats - b) / 0.12))
  const stepped = (b + snap) / BEATS // seconds, advancing in sixth-of-a-second jumps
  const rC = (Math.PI * 2 * (stepped % 3600)) / 3600
  const rT = -rC * (80 / 10) + offT
  const rF = -rT * (75 / 10) + offF
  const rE = -rF * (84 / 7) + offE
  // the balance swings 220° each way, three times a second, through the centre on every beat
  const swing = still ? 0 : 220 * deg * Math.sin(Math.PI * 2 * 3 * (t % 1))
  const forkTilt = (b % 2 ? 1 : -1) * (still ? 1 : snap * 2 - 1) * 7 * deg
  // the motion works, from the hours the hands show
  const rH = ((h / 3600) % 12 / 12) * Math.PI * 2
  const rI = -rH * (20 / 16) + offI
  const rD = -rI * (16 / 40) + offD
  return { C: rC, T: rT, F: rF, E: rE, B: swing, S: swing * 0.06, P: forkTilt, H: rH, I: rI, D: rD, minute: ((h % 3600) / 3600) * Math.PI * 2, day: (h / 86400) * Math.PI * 2 }
}
