// The few ways things move on the page when they are run frame by frame rather than by CSS: a pen
// along a stroke, a value easing toward another, a spring. Each is written in seconds, so a part
// moves the same way at 60 or at 120 frames a second.

/** A pen's pace along a stroke: mostly steady, eased a little where it starts and where it lifts. */
export const penEase = (u: number) => 0.6 * u + 0.4 * (0.5 - Math.cos(Math.PI * u) / 2)

/** The share of the gap closed in `dt` seconds by a value that closes 63% of it every `tau` seconds. */
export const approach = (dt: number, tau: number) => 1 - Math.exp(-dt / tau)

/** `v` moved toward `to` for `dt` seconds (see approach). */
export const toward = (v: number, to: number, tau: number, dt: number) => v + (to - v) * approach(dt, tau)

/** A damped spring: `k` its stiffness; `zeta` 1 settles without going past, below 1 with a small overshoot. */
export type Spring = { k: number, zeta: number }

/** One step of `dt` seconds of a spring pulling `x` (at velocity `v`) toward `target`. */
export function springStep({ x, v }: { x: number, v: number }, target: number, dt: number, { k, zeta }: Spring) {
  const a = -k * (x - target) - 2 * Math.sqrt(k) * zeta * v
  const nv = v + a * dt
  return { x: x + nv * dt, v: nv }
}
