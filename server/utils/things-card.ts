import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import satori from 'satori'

// The share cards of /things, in black and white: each piece photographed in one low light on a
// dark ground, with a cast shadow and film grain, and its name set beside it. Rendered at build time
// from the catalogue and the cutouts, so a new piece gets its card on the next deploy.

const W = 1200
const H = 630
const PUBLIC = join(process.cwd(), 'public')

type Ink = { r: number, g: number, b: number }
const hex = (h: string): Ink => ({ r: Number.parseInt(h.slice(1, 3), 16), g: Number.parseInt(h.slice(3, 5), 16), b: Number.parseInt(h.slice(5, 7), 16) })

let fonts: Promise<Parameters<typeof satori>[1]['fonts']> | undefined
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(PUBLIC, 'fonts/Redaction-Regular.ttf')),
    readFile(join(PUBLIC, 'fonts/Redaction-Italic.ttf')),
    useStorage('assets:server').getItemRaw('fonts/Geist-Regular.ttf'),
    useStorage('assets:server').getItemRaw('fonts/GeistMono-Regular.ttf'),
  ]).then(([red, redItalic, geist, mono]) => [
    { name: 'Redaction', data: red, weight: 400, style: 'normal' },
    { name: 'Redaction', data: redItalic, weight: 400, style: 'italic' },
    { name: 'Geist', data: geist as Buffer, weight: 400, style: 'normal' },
    { name: 'Geist Mono', data: mono as Buffer, weight: 400, style: 'normal' },
  ] as const)
  return fonts
}

// a seeded generator, so a card's grain is the same on every build
function random(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

// the ground: near black, lifted by one light from the upper left
function ground(cx: number, cy: number, rx: number, ry: number) {
  const canvas = new Float32Array(W * H * 3)
  const dark = hex('#0d0d0d')
  const lit = hex('#3a3936')
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = Math.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2))
      const i = (y * W + x) * 3
      canvas[i] = dark.r + (lit.r - dark.r) * t
      canvas[i + 1] = dark.g + (lit.g - dark.g) * t
      canvas[i + 2] = dark.b + (lit.b - dark.b) * t
    }
  }
  return canvas
}

type Layer = { rgba: Buffer, w: number, h: number }

function over(canvas: Float32Array, { rgba, w, h }: Layer, [ox, oy]: [number, number], { tint, opacity = 1 }: { tint?: Ink, opacity?: number } = {}) {
  for (let y = 0; y < h; y++) {
    const cy = y + oy
    if (cy < 0 || cy >= H) continue
    for (let x = 0; x < w; x++) {
      const cx = x + ox
      if (cx < 0 || cx >= W) continue
      const s = (y * w + x) * 4
      const a = (rgba[s + 3]! / 255) * opacity
      if (!a) continue
      const d = (cy * W + cx) * 3
      canvas[d] = canvas[d]! + ((tint ? tint.r : rgba[s]!) - canvas[d]!) * a
      canvas[d + 1] = canvas[d + 1]! + ((tint ? tint.g : rgba[s + 1]!) - canvas[d + 1]!) * a
      canvas[d + 2] = canvas[d + 2]! + ((tint ? tint.b : rgba[s + 2]!) - canvas[d + 2]!) * a
    }
  }
}

/**
 * A cutout in black and white, fitted into a box. The masks of some cutouts were scaled up from a
 * coarse one, and their edges step in blocks a few pixels high: invisible on the page's pale ground,
 * plain on black. The mask is blurred and cut again on a soft curve, which keeps the outline and
 * rounds off the steps.
 */
async function photograph(path: string, boxW: number, boxH: number, gamma?: number) {
  const { data, info } = await sharp(join(PUBLIC, path)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  let x0 = width, y0 = height, x1 = -1, y1 = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 8) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  const cw = x1 - x0 + 1
  const ch = y1 - y0 + 1
  const alpha = Buffer.alloc(cw * ch)
  const grey = Buffer.alloc(cw * ch)
  let sum = 0
  let count = 0
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const s = ((y + y0) * width + x + x0) * 4
      const a = data[s + 3]!
      const v = 0.299 * data[s]! + 0.587 * data[s + 1]! + 0.114 * data[s + 2]!
      alpha[y * cw + x] = a
      grey[y * cw + x] = v
      if (a > 128) {
        sum += v
        count++
      }
    }
  }
  const smooth = await sharp(alpha, { raw: { width: cw, height: ch, channels: 1 } }).blur(Math.max(1, Math.max(cw, ch) / 120)).extractChannel(0).raw().toBuffer()
  // dark pieces are lifted, so their cloth or leather still reads on the black
  const lum = count ? sum / count / 255 : 0.5
  const g = gamma ?? (lum < 0.25 ? 0.62 : lum < 0.4 ? 0.78 : 0.92)
  const rgba = Buffer.alloc(cw * ch * 4)
  for (let i = 0; i < cw * ch; i++) {
    const v = Math.round(255 * (grey[i]! / 255) ** g)
    const t = Math.min(1, Math.max(0, (smooth[i]! / 255 - 0.3) / 0.4))
    rgba[i * 4] = v
    rgba[i * 4 + 1] = v
    rgba[i * 4 + 2] = v
    rgba[i * 4 + 3] = Math.round(255 * t * t * (3 - 2 * t))
  }
  const k = Math.min(boxW / cw, boxH / ch)
  const w = Math.max(1, Math.round(cw * k))
  const h = Math.max(1, Math.round(ch * k))
  const out = await sharp(rgba, { raw: { width: cw, height: ch, channels: 4 } }).resize(w, h).raw().toBuffer()
  return { rgba: out, w, h }
}

// a soft shadow cast away from the light, and a tight one where the piece meets the ground
async function place(canvas: Float32Array, piece: Layer, [x, y]: [number, number], [dx, dy, blur, opacity]: [number, number, number, number]) {
  for (const [ox, oy, r, op] of [[dx, dy, blur, opacity], [3, 4, 3, 0.35]] as const) {
    const pad = r * 3
    const pw = piece.w + 2 * pad
    const ph = piece.h + 2 * pad
    const mask = Buffer.alloc(pw * ph * 4)
    for (let yy = 0; yy < piece.h; yy++) {
      for (let xx = 0; xx < piece.w; xx++) mask[((yy + pad) * pw + xx + pad) * 4 + 3] = piece.rgba[(yy * piece.w + xx) * 4 + 3]!
    }
    const soft = await sharp(mask, { raw: { width: pw, height: ph, channels: 4 } }).blur(r).raw().toBuffer()
    over(canvas, { rgba: soft, w: pw, h: ph }, [x - pad + ox, y - pad + oy], { tint: { r: 0, g: 0, b: 0 }, opacity: op })
  }
  over(canvas, piece, [x, y])
}

type Node = { type: string, props: Record<string, unknown> }
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } })
const label = (s: string, top: number, color: string) => el('div', { position: 'absolute', left: 64, top, fontFamily: 'Geist Mono', fontSize: 12, letterSpacing: '0.12em', color }, s)

async function finish(canvas: Float32Array, type: Node, seed: number, grain: number) {
  const svg = await satori(type as never, { width: W, height: H, fonts: await loadFonts() as never })
  const text = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer()
  over(canvas, { rgba: text, w: W, h: H }, [0, 0])
  const rnd = random(seed)
  const out = Buffer.alloc(W * H * 3)
  for (let i = 0; i < W * H; i++) {
    // film grain: one gaussian sample per pixel, the same on all three channels
    const n = Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd()) * grain
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.min(255, Math.max(0, Math.round(canvas[i * 3 + c]! + n)))
  }
  return sharp(out, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 74, progressive: true, mozjpeg: true }).toBuffer()
}

// the name, set as large as three lines allow, its last line sitting on the same baseline on every card
function nameSize(name: string) {
  for (const size of [88, 76, 66, 58, 50]) {
    const lines = name.split(' ').reduce<string[]>((acc, word) => {
      const last = acc.at(-1)
      if (last !== undefined && (last.length + word.length + 1) * size * 0.47 <= 500) acc[acc.length - 1] = `${last} ${word}`
      else acc.push(word)
      return acc
    }, [])
    if (lines.length <= 3 && lines.every(l => l.length * size * 0.47 <= 520)) return size
  }
  return 50
}

export type ThingCard = { name: string, brand: string, color?: string, image: string, section: string, plate: number }

export async function renderThingCard(item: ThingCard) {
  const canvas = ground(860, 200, 500, 360)
  const piece = await photograph(item.image, 520, 540)
  const x = 620 + Math.round((520 - piece.w) / 2)
  const y = piece.h < 540 * 0.7 ? 44 + Math.round((540 - piece.h) / 2) : 44 + 540 - piece.h
  await place(canvas, piece, [x, y], [-40, 26, 30, 0.65])

  const size = nameSize(item.name)
  const color = item.color && item.color.length < 28 && !item.name.toLowerCase().includes(item.color.split(',')[0]!.toLowerCase()) ? item.color : ''
  const type = el('div', { display: 'flex', position: 'relative', width: W, height: H }, [
    label(`PL. ${String(item.plate).padStart(2, '0')}  ·  ${item.section.toUpperCase()}`, 72, '#7a7a7a'),
    el('div', { position: 'absolute', left: 60, top: 0, width: 540, height: 382, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }, [el('div', { fontFamily: 'Redaction', fontSize: size, lineHeight: 1.02, color: '#ECECEC' }, item.name),]),
    el('div', { position: 'absolute', left: 64, top: 392, display: 'flex', alignItems: 'baseline' }, [
      el('span', { fontFamily: 'Redaction', fontStyle: 'italic', fontSize: 30, color: '#E1342D' }, item.brand),
      ...(color ? [el('span', { fontFamily: 'Geist', fontSize: 24, color: '#9a9a9a' }, `, ${color}`)] : []),
    ]),
    label('HUGORCD.COM / THINGS', 572, '#6a6a6a'),
  ])
  return finish(canvas, type, item.plate, 4)
}

// the collection's card: the overcoat, the watch and the scent worn with it
export async function renderThingsCard() {
  const canvas = ground(820, 200, 520, 360)
  await place(canvas, await photograph('/images/things/suitsupply-black-overcoat.webp', 1000, 700, 0.62), [560, 0], [-50, 30, 40, 0.6])
  await place(canvas, await photograph('/images/things/cartier-santos-dumont.webp', 1000, 300, 0.92), [880, 168], [-34, 26, 22, 0.7])
  await place(canvas, await photograph('/images/things/mfk-oud-satin-mood.webp', 1000, 210, 0.92), [1036, 300], [-30, 22, 18, 0.7])
  const type = el('div', { display: 'flex', position: 'relative', width: W, height: H }, [
    label('THINGS  ·  I TO V', 72, '#7a7a7a'),
    el('div', { position: 'absolute', left: 58, top: 222, fontFamily: 'Redaction', fontSize: 112, lineHeight: 1, color: '#ECECEC' }, 'Things'),
    el('div', { position: 'absolute', left: 64, top: 366, display: 'flex', alignItems: 'baseline', fontFamily: 'Geist', fontSize: 26, color: '#9a9a9a' }, [
      el('span', {}, 'What Hugo wears,\u00A0'),
      el('span', { fontFamily: 'Redaction', fontStyle: 'italic', fontSize: 30, color: '#E1342D' }, 'carries'),
      el('span', {}, '\u00A0and keeps'),
    ]),
    label('HUGORCD.COM', 572, '#6a6a6a'),
  ])
  return finish(canvas, type, 7, 6)
}
