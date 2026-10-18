// Colour mixing in OKLab (Björn Ottosson, 2020), where equal steps look like equal steps,
// and WCAG contrast. Used by the notice to show how the site's red is made.

type Lab = [number, number, number]

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function rgb(hex: string): Lab {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => toLinear(v / 255)) as Lab
}

export function hexToOklab(hex: string): Lab {
  const [r, g, b] = rgb(hex)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

export function oklabToHex([lightness, a, b]: Lab) {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return `#${lin.map(c => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

export function mixOklab(from: string, to: string, t: number) {
  const a = hexToOklab(from)
  const b = hexToOklab(to)
  return oklabToHex(a.map((v, i) => v + (b[i]! - v) * t) as Lab)
}

export function oklch(hex: string) {
  const [lightness, a, b] = hexToOklab(hex)
  return { l: lightness, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 }
}

const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(fg: string, bg: string) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}
