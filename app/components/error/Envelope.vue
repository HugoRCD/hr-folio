<script setup lang="ts">
import { monogramPath, monogramViewBox } from '~/utils/signature'

// The letter that came back (<ErrorEnvelope>): an envelope on the drawing sheet, addressed to the
// page that isn't there, with the address struck out and La Poste's "Retour à l'envoyeur" on it.
// Click it and it turns over; break the wax seal and the flap opens, and the postcard inside rises
// out and lies on top: the way back. Everything on the envelope is measured in a 560-wide unit
// (--u), so it keeps its proportions on a phone; the postcard is measured on itself (--p).
type Page = { path: string, title: string, kind: string, date?: string }
type Place = { path: string, title: string, sub: string }
const { path, code = 404, near = [], places = [] } = defineProps<{
  path: string
  code?: number
  near?: Page[]
  places?: Place[]
}>()

const is404 = computed(() => code === 404)
const daylight = useState<{ time: string, date: string, place: { city: string, timeZone: string } } | undefined>('daylight')
const city = computed(() => daylight.value?.place.city ?? 'London')
const date = computed(() => daylight.value?.date ?? '')
// the postmark's date and hour: 07 NOV 26, 18 H
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const postmark = computed(() => {
  const d = daylight.value
  if (!mounted.value || !d?.time) return { date: '', hour: '' }
  const date = new Intl.DateTimeFormat('en-GB', { timeZone: d.place.timeZone, day: '2-digit', month: 'short', year: '2-digit' }).format(new Date())
  return { date: date.toUpperCase(), hour: `${d.time.slice(0, 2)} H` }
})

// the reasons on the stamp: a page that isn't there is not known at the address; anything else, refused
const REASONS = ['Address incomplete', 'Not known at this address', 'Refused', 'Gone away']
const ticked = computed(() => is404.value ? 1 : 2)

// --- what has been done to it -----------------------------------------------------------------
type Stage = 'front' | 'turning' | 'back' | 'broken' | 'open' | 'rising' | 'out'
const stage = ref<Stage>('front')
const flip = ref({ angle: 0, ms: 0, ease: 'linear' })
const reduced = ref(false)
const wait = (ms: number) => new Promise(r => setTimeout(r, reduced.value ? 0 : ms))
const frame = () => new Promise(r => requestAnimationFrame(r))
const seal = useTemplateRef<HTMLButtonElement>('seal')
const back = useTemplateRef<HTMLElement>('back')
const letter = useTemplateRef<HTMLElement>('letter')

// turned over in two halves, so the back is drawn flat once it faces you (the flap needs it)
async function turn() {
  if (stage.value !== 'front') return
  stage.value = 'turning'
  flip.value = { angle: 90, ms: 280, ease: 'cubic-bezier(0.5, 0, 0.75, 0)' }
  await wait(280)
  flip.value = { angle: -90, ms: 0, ease: 'linear' }
  stage.value = 'back'
  await nextTick()
  await frame()
  await frame()
  flip.value = { angle: 0, ms: 420, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' }
  seal.value?.focus({ preventScroll: true })
}

// inside is a postcard. It rises until it is clear of the pocket (but never out of the window),
// and only then comes in front of the envelope and is laid on it, centred: brought forward while
// still inside, it would show through the envelope's front
const rise = ref(0)
const out = ref(0)
function measure() {
  if (!back.value || !letter.value) return
  const H = back.value.offsetHeight
  const top = letter.value.offsetTop
  const h = letter.value.offsetHeight
  const onScreen = back.value.getBoundingClientRect().top + top
  rise.value = Math.max(H * 0.18 - top - h, 16 - onScreen)
  out.value = H / 2 - top - h / 2
}
// written on the address lines: the page it was probably meant for, then the sheet's own pages
const destinations = computed(() => {
  const first = near.slice(0, 1).map(p => ({ path: p.path, title: p.title }))
  const rest = places.filter(p => !first.some(f => f.path === p.path)).map(p => ({ path: p.path, title: p.title }))
  return [...first, ...rest].slice(0, 4)
})
async function open() {
  if (stage.value !== 'back') return
  stage.value = 'broken'
  await wait(300)
  stage.value = 'open'
  await wait(520)
  measure()
  stage.value = 'rising'
  await wait(620)
  stage.value = 'out'
  await wait(560)
  letter.value?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
}

// --- a little tilt towards the pointer, while it is an object to pick up -----------------------
const tilt = ref({ x: 0, y: 0 })
let target = { x: 0, y: 0 }
let raf = 0
function follow() {
  const t = tilt.value
  const nx = t.x + (target.x - t.x) * 0.12
  const ny = t.y + (target.y - t.y) * 0.12
  tilt.value = { x: nx, y: ny }
  raf = Math.abs(target.x - nx) + Math.abs(target.y - ny) > 0.01 ? requestAnimationFrame(follow) : 0
}
function aim(e: PointerEvent) {
  if (reduced.value || e.pointerType !== 'mouse') return
  // only the front tilts: on the back, the flap, the pocket and the card lie a pixel apart, and a
  // tilt would push them through one another
  const still = stage.value !== 'front'
  target = still ? { x: 0, y: 0 } : { x: -(e.clientY / innerHeight - 0.5) * 8, y: (e.clientX / innerWidth - 0.5) * 12 }
  if (!raf) raf = requestAnimationFrame(follow)
}
watch(stage, (s) => {
  if (s === 'front') return
  target = { x: 0, y: 0 }
  if (!raf) raf = requestAnimationFrame(follow)
})
onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('pointermove', aim)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', aim)
  cancelAnimationFrame(raf)
})

// --- drawn parts --------------------------------------------------------------------------------
// the stamp's perforations: holes in the paper's colour along its edges
const perforations = (() => {
  const holes: Array<[number, number]> = []
  for (let x = 3; x <= 69; x += 6) holes.push([x, 0], [x, 88])
  for (let y = 4; y <= 84; y += 6) holes.push([0, y], [72, y])
  return holes
})()
// the cancellation's waves
const waves = [30, 40, 50, 60].map((y) => {
  let d = `M86 ${y}`
  for (let x = 86; x <= 168; x += 2) d += `L${x} ${(y + Math.sin((x - 86) / 3.4) * 2.6).toFixed(2)}`
  return d
})
// the address is written smaller when it is long, as a hand would, before it has to be cut short
const addressSize = computed(() => Math.max(16, Math.min(24, (24 * 23) / `hugorcd.com${path}`.length)).toFixed(1))
// the sorting office's barcode along the foot: four kinds of bar (full, up, down, short), read
// from the address, so the same address always prints the same code
const bars = computed(() => {
  let h = 2166136261
  for (const c of `${code}${path}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return Array.from({ length: 58 }, (_, i) => {
    h = Math.imul(h ^ (h >>> 13), 0x5BD1E995) ^ i
    return ((h >>> 3) & 3) as 0 | 1 | 2 | 3
  })
})
// the wax, poured: a puddle a little uneven, with a few drops that ran out from under the press.
// It is drawn as a height map (the opacity is the height) and lit by a filter, so the rim the
// press pushed up, the sunken medallion and the raised H catch the light as wax does.
const puddle = (() => {
  let d = ''
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2
    const r = 50 * (1 + 0.07 * Math.sin(a * 2 + 1.1) + 0.045 * Math.sin(a * 3 + 2.3) + 0.04 * Math.sin(a * 5 + 0.6) + 0.025 * Math.sin(a * 9 + 1.9) + 0.015 * Math.sin(a * 14 + 0.3))
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`
  }
  return `${d}Z`
})()
const drops = [[-38, 5.5], [127, 6.5], [200, 4.2], [312, 3.6]].map(([deg, r]) => {
  const a = (deg! * Math.PI) / 180
  const d = 50 + r! * 0.4
  return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: r! }
})
// the rim the press pushed up: never quite round
const rim = (() => {
  let d = ''
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2
    const r = 38.5 * (1 + 0.02 * Math.sin(a * 3 + 0.4) + 0.012 * Math.sin(a * 7 + 2.2))
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`
  }
  return `${d}Z`
})()
const crack = '2,-70 -3,-38 5,-12 -2,14 4,40 -1,70'
// the light: one lamp, high on the top left, that doesn't move
const light = { x: -80, y: -100, z: 130 }
// the chips that fly off when the seal breaks
const chips = [
  { x: -14, y: -22, r: -40, s: 1 },
  { x: 18, y: -8, r: 70, s: 0.8 },
  { x: -6, y: 26, r: 120, s: 0.65 },
]
</script>

<template>
  <div class="envelope" :class="[`at-${stage}`]">
    <!-- a DL envelope, 220 by 110 mm, the long one letters are sent in, measured as everything on the sheet is -->
    <div class="dim w" aria-hidden="true">
      <span>220</span>
    </div>
    <div class="dim h" aria-hidden="true">
      <span>110</span>
    </div>

    <div class="tilt" :style="{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }">
      <div class="shadow" />
      <div class="flipper" :style="{ transform: `rotateY(${flip.angle}deg)`, transition: `transform ${flip.ms}ms ${flip.ease}` }">
        <!-- the front: who it is from, who it was for, and why it came back -->
        <button
          v-if="stage === 'front' || stage === 'turning'"
          type="button"
          class="face front"
          :aria-label="`Error ${code}: an envelope addressed to hugorcd.com${path}, returned to sender. Turn it over`"
          @click="turn"
        >
          <span class="sender" aria-hidden="true">
            <svg :viewBox="monogramViewBox" class="mono"><path :d="monogramPath" /></svg>
            <span class="from"><span>Hugo Richard</span><span>{{ city }}</span></span>
          </span>

          <svg class="postage" viewBox="0 0 72 88" aria-hidden="true">
            <rect width="72" height="88" class="stamp-paper" />
            <circle
              v-for="([x, y], i) in perforations"
              :key="i"
              :cx="x"
              :cy="y"
              r="2.3"
              class="hole"
            />
            <rect x="6" y="6" width="60" height="76" class="stamp-field" />
            <svg :viewBox="monogramViewBox" x="15" y="16" width="42" height="36"><path :d="monogramPath" class="stamp-mono" /></svg>
            <text x="61" y="75" text-anchor="end" class="stamp-value">£4.04</text>
          </svg>

          <svg class="postmark" viewBox="0 0 170 92" aria-hidden="true">
            <defs>
              <path id="postmark-ring" d="M28.37 21.73A30 30 0 0 1 63.63 70.27A30 30 0 0 1 28.37 21.73" />
            </defs>
            <circle cx="46" cy="46" r="37" />
            <circle cx="46" cy="46" r="25" />
            <text class="pm-ring"><textPath href="#postmark-ring" textLength="186" lengthAdjust="spacing">{{ city.toUpperCase() }} · {{ postmark.date || '—' }} · {{ postmark.hour || '—' }} · </textPath></text>
            <text x="46" y="50" text-anchor="middle" class="pm-code">{{ code }}</text>
            <text x="46" y="59" text-anchor="middle" class="pm-small">{{ is404 ? 'NOT FOUND' : 'REFUSED' }}</text>
            <path v-for="(d, i) in waves" :key="i" :d />
          </svg>

          <span class="address" aria-hidden="true">
            <span class="a-path">
              <span class="a-path-text" :style="{ fontSize: `calc(var(--u) * ${addressSize})` }">hugorcd.com{{ path }}</span>
              <svg class="strike" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M-2 6.5C20 4.6 45 7.6 70 5.2S95 4.8 102 5.6" pathLength="1" /></svg>
            </span>
            <span class="a-note">{{ is404 ? 'No such page' : 'Try again later' }}</span>
          </span>

          <svg class="barcode" viewBox="0 0 232 14" aria-hidden="true">
            <rect
              v-for="(b, i) in bars"
              :key="i"
              :x="i * 4"
              :y="b === 0 || b === 1 ? 0 : 4.5"
              width="1.6"
              :height="b === 0 ? 14 : b === 3 ? 5 : 9.5"
            />
          </svg>

          <span class="return" aria-hidden="true">
            <span class="r-head">Return to sender</span>
            <span class="r-list">
              <span v-for="(r, i) in REASONS" :key="r" class="r-row">
                <span class="r-box">
                  <svg v-if="i === ticked" viewBox="0 0 12 12" class="cross">
                    <path d="M2.2 2.6C4.6 5.2 7.4 8.1 9.9 10.1" pathLength="1" />
                    <path d="M10.2 1.8C7.7 4.6 5 7.5 1.6 10.4" pathLength="1" />
                  </svg>
                </span>
                {{ r }}
              </span>
            </span>
            <span class="r-foot">Ref. Error {{ code }}</span>
          </span>
        </button>

        <!-- the back: the flap, sealed with the H; the postcard waits in the pocket -->
        <div v-else ref="back" class="face back" @click="open">
          <div class="inside" />
          <div class="flap" :class="{ open: ['open', 'rising', 'out'].includes(stage) }">
            <svg class="flap-face outer" viewBox="0 0 560 396" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0H560L295 222Q280 233 265 222Z" />
            </svg>
            <svg class="flap-face inner" viewBox="0 0 560 396" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0H560L295 222Q280 233 265 222Z" />
            </svg>
            <div class="flap-grain" aria-hidden="true" />
            <button ref="seal" type="button" class="seal" aria-label="Break the seal and read the postcard" @click.stop="open">
              <svg viewBox="-64 -64 128 128" aria-hidden="true">
                <defs>
                  <filter
                    id="wax-light"
                    x="-15%"
                    y="-15%"
                    width="130%"
                    height="130%"
                    color-interpolation-filters="sRGB"
                  >
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="smooth" />
                    <!-- wax is never quite smooth: a faint unevenness, so its sheen breaks up as on the real thing -->
                    <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="3" />
                    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.07 0 0 0 0" />
                    <feComposite in2="smooth" operator="arithmetic" k2="1" k3="1" result="height" />
                    <feComponentTransfer in="SourceAlpha" result="solid">
                      <feFuncA type="linear" slope="6" />
                    </feComponentTransfer>
                    <feGaussianBlur in="solid" stdDeviation="0.35" result="cover" />
                    <feDiffuseLighting in="height" surfaceScale="4.3" diffuseConstant="1.08" lighting-color="#fff" result="diffuse">
                      <fePointLight :x="light.x" :y="light.y" :z="light.z" />
                    </feDiffuseLighting>
                    <feSpecularLighting
                      in="height"
                      surfaceScale="4.3"
                      specularConstant="0.38"
                      specularExponent="32"
                      lighting-color="#f3d6cf"
                      result="specular"
                    >
                      <fePointLight :x="light.x" :y="light.y" :z="light.z" />
                    </feSpecularLighting>
                    <feFlood flood-color="#ad181d" />
                    <feComposite in2="cover" operator="in" result="deep" />
                    <!-- where the wax ran thin it is lighter and warmer: the paper shows through it a little -->
                    <feComposite
                      in="cover"
                      in2="SourceAlpha"
                      operator="arithmetic"
                      k2="0.7"
                      k3="-1.4"
                      result="thin"
                    />
                    <feFlood flood-color="#d4473f" />
                    <feComposite in2="thin" operator="in" result="tint" />
                    <feComposite in="tint" in2="deep" operator="over" result="base" />
                    <feBlend in="diffuse" in2="base" mode="multiply" result="lit" />
                    <!-- some light from the room too, so the side away from the lamp is dark red, not black -->
                    <feComposite in="lit" in2="base" operator="arithmetic" k2="0.72" k3="0.36" />
                    <feComposite in2="cover" operator="in" result="shaded" />
                    <feComposite in="specular" in2="cover" operator="in" result="shine" />
                    <feComposite in="shine" in2="shaded" operator="arithmetic" k2="0.62" k3="1" />
                  </filter>
                  <clipPath id="seal-left"><polygon :points="`-70,-70 ${crack} -70,70`" /></clipPath>
                  <clipPath id="seal-right"><polygon :points="`70,-70 ${crack} 70,70`" /></clipPath>
                </defs>
                <g v-for="side in ['left', 'right']" :key="side" :class="`half ${side}`" :clip-path="`url(#seal-${side})`">
                  <g filter="url(#wax-light)" class="height">
                    <path :d="puddle" fill-opacity="0.4" />
                    <circle
                      v-for="(d, i) in drops"
                      :key="i"
                      :cx="d.x"
                      :cy="d.y"
                      :r="d.r"
                      fill-opacity="0.34"
                    />
                    <g transform="translate(1.5 -1) rotate(-5)">
                      <circle r="34" fill-opacity="0.58" />
                      <path :d="rim" fill="none" stroke="#fff" stroke-width="8" />
                      <circle r="30.5" fill="none" stroke="#fff" stroke-width="1.2" />
                      <!-- the H stands up out of the medallion, thickened so it reads in the wax -->
                      <svg
                        :viewBox="monogramViewBox"
                        x="-25"
                        y="-21.5"
                        width="50"
                        height="43"
                        overflow="visible"
                      >
                        <path :d="monogramPath" stroke="#fff" stroke-width="34" stroke-linejoin="round" />
                      </svg>
                    </g>
                  </g>
                </g>
                <path class="crack" :d="`M${crack.replaceAll(' ', 'L')}`" />
              </svg>
              <span v-for="(c, i) in chips" :key="i" class="chip" :style="{ '--x': c.x, '--y': c.y, '--r': `${c.r}deg`, '--s': c.s }" />
            </button>
          </div>

          <!-- the postcard inside, its back laid out as the divided backs of old cards were: a message
               on the left, the address on the right, a box for the stamp -->
          <article
            ref="letter"
            class="card"
            :class="{ rising: stage === 'rising', out: stage === 'out' }"
            :style="{ '--rise': `${rise}px`, '--out': `${out}px` }"
            :inert="stage !== 'out'"
          >
            <p class="c-head">
              Post card
            </p>
            <div class="c-body">
              <div class="c-message">
                <p class="c-label">
                  For correspondence
                </p>
                <p class="c-title">
                  {{ is404 ? 'Page not found' : 'Something went wrong' }}
                </p>
                <p class="c-text">
                  <template v-if="is404">
                    I think you're lost. There's nothing at <span class="c-path">{{ path }}</span>, or not any more.
                  </template>
                  <template v-else>
                    Something broke on my side. Try again in a moment.
                  </template>
                </p>
                <p class="c-sign" aria-label="Hugo">
                  Hugo
                </p>
              </div>
              <div class="c-address">
                <p class="c-label">
                  For address only
                </p>
                <span class="c-stamp" aria-hidden="true">Place<br>stamp<br>here</span>
                <ul class="c-lines" aria-label="Where to go instead">
                  <li v-for="d in destinations" :key="d.path">
                    <NuxtLink :to="d.path" class="c-line">
                      {{ d.title }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </article>

          <div class="grain" aria-hidden="true" />
          <svg class="pocket" viewBox="0 0 560 396" preserveAspectRatio="none" aria-hidden="true">
            <path class="pocket-paper" d="M0 0L280 206L560 0V396H0Z" />
            <path class="pocket-bottom" d="M0 396L280 232L560 396Z" />
            <path class="pocket-seam" d="M0 0L280 206L560 0M0 396L280 232L560 396" />
          </svg>
        </div>
      </div>
    </div>

    <p class="hint" aria-hidden="true">
      <template v-if="stage === 'front' || stage === 'turning'">
        Turn it over
      </template>
      <template v-else-if="stage === 'back'">
        Break the seal
      </template>
    </p>
  </div>
</template>

<style scoped>
.envelope {
  --paper: #f3efe6;
  --paper-back: #ece7dc;
  --paper-inside: #d9d1c1;
  --red: #cd1919;
  --ink: rgb(28 24 22 / 0.72);
  /* the paper: a fine tooth, and long fibres running across it */
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.32 0 0 0 0 0.27 0 0 0 0 0.2 0.22 0 0 0 -0.06'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='360'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.004 0.18' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.3 0 0 0 0 0.22 0.09 0 0 0 -0.035'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E");
  /* a rubber stamp never inks evenly: a few specks where the ink didn't take */
  --wear: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 7 0 0 0 -2.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23w)'/%3E%3C/svg%3E");
  --u: calc(100cqw / 560);
  position: relative;
  width: min(720px, calc(100vw - 48px));
  aspect-ratio: 2 / 1;
  container-type: inline-size;
  perspective: 1600px;
}
.tilt,
.flipper,
.face {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}
.shadow {
  position: absolute;
  inset: 0;
  border-radius: calc(var(--u) * 4);
  box-shadow: 0 calc(var(--u) * 30) calc(var(--u) * 50) calc(var(--u) * -18) rgb(0 0 0 / 0.55), 0 2px 6px rgb(0 0 0 / 0.25);
  transform: translateZ(-1px);
  transition: opacity 0.6s ease;
}
.at-out .shadow {
  opacity: 0.6;
}
.face {
  display: block;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: calc(var(--u) * 4);
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.face:focus-visible,
.seal:focus-visible {
  outline: 1px solid #ebebeb;
  outline-offset: 4px;
}

/* --- the front ------------------------------------------------------------------------------- */
.front {
  background-color: var(--paper);
  background-image: var(--grain);
  background-size: 180px, 360px;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.04);
  overflow: hidden;
}
.sender {
  position: absolute;
  left: calc(var(--u) * 30);
  top: calc(var(--u) * 26);
  display: flex;
  align-items: flex-start;
  gap: calc(var(--u) * 12);
}
.mono {
  height: calc(var(--u) * 34);
  width: auto;
  fill: #901112;
}
.from {
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--u) * 2);
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: calc(var(--u) * 14.5);
  line-height: 1.3;
  color: rgb(23 23 23 / 0.75);
}
.postage {
  position: absolute;
  right: calc(var(--u) * 26);
  top: calc(var(--u) * 22);
  width: calc(var(--u) * 62);
  height: calc(var(--u) * 76);
  transform: rotate(1.5deg);
  overflow: visible;
}
.stamp-paper {
  fill: #fdfcf8;
}
.hole {
  fill: var(--paper);
}
.stamp-field {
  fill: #901112;
}
.stamp-mono {
  fill: #f3efe6;
}
.stamp-value {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 11px;
  fill: #f3efe6;
}
.postmark {
  mask: var(--wear);
  mask-size: 120px;
  position: absolute;
  right: calc(var(--u) * 30);
  top: calc(var(--u) * 18);
  width: calc(var(--u) * 166);
  height: calc(var(--u) * 90);
  transform: rotate(-7deg);
  overflow: visible;
}
.postmark circle,
.postmark > path {
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.2;
}
.postmark text {
  fill: var(--ink);
  font-family: var(--font-mono);
}
.pm-ring {
  font-size: 6px;
  letter-spacing: 0.06em;
}
.pm-code {
  font-family: var(--font-redaction) !important;
  font-style: italic;
  font-size: 19px;
}
.pm-small {
  font-size: 5.6px;
  letter-spacing: 0.14em;
}
.address {
  position: absolute;
  left: calc(var(--u) * 252);
  top: calc(var(--u) * 128);
  display: flex;
  flex-direction: column;
  gap: calc(var(--u) * 2);
  max-width: calc(var(--u) * 270);
}
.a-path {
  position: relative;
  align-self: flex-start;
  max-width: 100%;
}
.a-path-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: calc(var(--u) * 24);
  line-height: 1.5;
  color: #171717;
}
/* the postman's pen through the address, drawn left to right */
.strike {
  position: absolute;
  left: -3%;
  top: 25%;
  width: 106%;
  height: 50%;
  overflow: visible;
  clip-path: inset(-50% 100% -50% -2%);
  animation: write 0.45s cubic-bezier(0.4, 0, 0.6, 1) 1.5s forwards;
}
.strike path {
  fill: none;
  stroke: var(--red);
  stroke-width: 1.6;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
/* the postman's word, in red pen, under the address he struck */
.a-note {
  align-self: flex-start;
  margin: calc(var(--u) * -2) 0 0 calc(var(--u) * 28);
  font-family: var(--font-signature);
  font-size: calc(var(--u) * 34);
  line-height: 1.1;
  color: var(--red);
  rotate: -4deg;
  clip-path: inset(-20% 100% -20% -10%);
  animation: write 0.7s cubic-bezier(0.45, 0, 0.3, 1) 2s forwards;
}
.barcode {
  position: absolute;
  right: calc(var(--u) * 28);
  bottom: calc(var(--u) * 20);
  width: calc(var(--u) * 200);
  height: calc(var(--u) * 12);
  fill: rgb(28 24 22 / 0.62);
}
/* the return stamp, inked once */
.return {
  position: absolute;
  left: calc(var(--u) * 44);
  bottom: calc(var(--u) * 22);
  display: flex;
  flex-direction: column;
  gap: calc(var(--u) * 2);
  width: calc(var(--u) * 182);
  padding: calc(var(--u) * 3);
  border: calc(var(--u) * 1.5) solid var(--red);
  border-radius: calc(var(--u) * 3);
  color: var(--red);
  opacity: 0;
  transform: rotate(-6deg) scale(1.14);
  animation: ink 0.3s cubic-bezier(0.3, 0, 0.2, 1) 0.5s forwards;
  mix-blend-mode: multiply;
  mask: var(--wear);
  mask-size: 140px;
}
.r-head,
.r-list {
  border: calc(var(--u) * 0.75) solid var(--red);
}
.r-head {
  padding: calc(var(--u) * 4) calc(var(--u) * 6) calc(var(--u) * 3);
  font-family: var(--font-mono);
  font-size: calc(var(--u) * 9.5);
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
}
.r-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--u) * 3);
  padding: calc(var(--u) * 5) calc(var(--u) * 7);
}
.r-row {
  display: flex;
  white-space: nowrap;
  align-items: center;
  gap: calc(var(--u) * 7);
  font-family: var(--font-mono);
  font-size: calc(var(--u) * 8.8);
  line-height: 1.3;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.r-foot {
  padding: calc(var(--u) * 2) calc(var(--u) * 6) calc(var(--u) * 1);
  font-family: var(--font-mono);
  font-size: calc(var(--u) * 8.5);
  line-height: 1.3;
  letter-spacing: 0.08em;
  text-align: right;
  text-transform: uppercase;
}
.r-box {
  position: relative;
  width: calc(var(--u) * 9);
  height: calc(var(--u) * 9);
  flex: none;
  border: calc(var(--u) * 0.75) solid var(--red);
}
.cross {
  position: absolute;
  inset: calc(var(--u) * -3);
  overflow: visible;
}
.cross path {
  fill: none;
  stroke: #171717;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 0.16s cubic-bezier(0.4, 0, 0.6, 1) 1.05s forwards;
}
.cross path:last-child {
  animation-delay: 1.28s;
}

/* --- the back --------------------------------------------------------------------------------- */
.back {
  cursor: pointer;
}
.at-out .back {
  cursor: default;
}
.inside {
  position: absolute;
  inset: 0;
  border-radius: calc(var(--u) * 4);
  background: var(--paper-inside);
}
.pocket {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: translateZ(2px);
  pointer-events: none;
}
.pocket-paper {
  fill: var(--paper-back);
}
.pocket-bottom {
  fill: rgb(255 255 255 / 0.22);
}
.pocket-seam {
  fill: none;
  stroke: rgb(0 0 0 / 0.08);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.flap {
  position: absolute;
  inset: 0;
  transform-origin: 50% 0;
  transform-style: preserve-3d;
  transform: translateZ(3px) rotateX(0deg);
  transition: transform 0.52s cubic-bezier(0.45, 0, 0.2, 1);
  pointer-events: none;
}
.flap.open {
  transform: translateZ(-1px) rotateX(180deg);
}
.flap-face {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}
.flap-face.outer path {
  fill: #e6e0d3;
  stroke: rgb(0 0 0 / 0.07);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.flap-face.outer {
  filter: drop-shadow(0 calc(var(--u) * 2) calc(var(--u) * 2) rgb(0 0 0 / 0.12));
}
.flap-face.inner {
  transform: rotateY(180deg);
}
.flap-face.inner path {
  fill: #cfc6b4;
}
.seal {
  position: absolute;
  left: 50%;
  top: 53%;
  width: calc(var(--u) * 116);
  aspect-ratio: 1;
  translate: -50% -50%;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  pointer-events: auto;
  backface-visibility: hidden;
  /* the wax sits on the paper: a tight dark contact, and a soft shadow away from the light */
  filter: drop-shadow(0 calc(var(--u) * 1) calc(var(--u) * 0.6) rgb(60 0 0 / 0.45)) drop-shadow(calc(var(--u) * 2) calc(var(--u) * 4) calc(var(--u) * 4) rgb(40 0 0 / 0.22));
}
.seal svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.height {
  fill: #fff;
}
.half {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}
.at-broken .half.left,
.at-open .half.left,
.at-rising .half.left,
.at-out .half.left {
  transform: translate(-6px, 2px) rotate(-9deg);
}
.at-broken .half.right,
.at-open .half.right,
.at-rising .half.right,
.at-out .half.right {
  transform: translate(6px, 4px) rotate(8deg);
}
/* the crack runs through the wax a moment before it gives */
.crack {
  fill: none;
  stroke: rgb(50 0 3 / 0.7);
  stroke-width: 1.2;
  stroke-linejoin: round;
  stroke-dasharray: 150;
  stroke-dashoffset: 150;
  clip-path: circle(46px);
}
.at-broken .crack,
.at-open .crack,
.at-rising .crack,
.at-out .crack {
  stroke-dashoffset: 0;
  opacity: 0;
  transition: stroke-dashoffset 0.14s ease-in, opacity 0.1s linear 0.16s;
}
/* three chips of wax, thrown off as it breaks */
.chip {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--u) * 11 * var(--s));
  aspect-ratio: 1.3;
  clip-path: polygon(10% 0, 100% 30%, 80% 100%, 0 70%);
  background: linear-gradient(135deg, #d8343a, #7d0c11);
  opacity: 0;
  pointer-events: none;
}
.at-broken .chip {
  animation: chip 0.75s cubic-bezier(0.2, 0.6, 0.4, 1) 0.12s forwards;
}
@keyframes chip {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--x) * var(--u) * 3), calc(var(--y) * var(--u) * 3 + var(--u) * 60)) rotate(var(--r));
  }
}

/* --- the postcard ---------------------------------------------------------------------------- */
.grain {
  position: absolute;
  inset: 0;
  border-radius: calc(var(--u) * 4);
  background-image: var(--grain);
  background-size: 180px, 360px;
  transform: translateZ(2.5px);
  pointer-events: none;
}
.flap-grain {
  position: absolute;
  inset: 0;
  background-image: var(--grain);
  background-size: 180px, 360px;
  clip-path: polygon(0 0, 100% 0, 52.7% 56%, 50% 58.8%, 47.3% 56%);
  backface-visibility: hidden;
  pointer-events: none;
}
.card {
  --p: calc(100cqw / 600);
  position: absolute;
  top: calc(var(--u) * 14);
  left: calc(var(--u) * 102.5);
  width: calc(var(--u) * 355);
  aspect-ratio: 148 / 105;
  display: flex;
  flex-direction: column;
  padding: calc(var(--p) * 22) calc(var(--p) * 28) calc(var(--p) * 26);
  container-type: inline-size;
  background-color: #f7f3ea;
  background-image: var(--grain);
  background-size: 180px, 360px;
  color: #2b2622;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgb(0 0 0 / 0.08), inset 0 0 0 1px rgb(0 0 0 / 0.03);
  transform: translateZ(1px);
  translate: 0 0;
  transition: translate 0.6s cubic-bezier(0.22, 1, 0.36, 1), rotate 0.7s cubic-bezier(0.34, 1.4, 0.64, 1), scale 0.7s cubic-bezier(0.34, 1.3, 0.64, 1), box-shadow 0.6s ease;
  cursor: default;
}
.card.rising {
  translate: 0 var(--rise);
}
.card.out {
  translate: 0 var(--out);
  rotate: -2.5deg;
  scale: var(--card-scale, 1.34);
  transform: translateZ(4px);
  box-shadow: 0 1px 1px rgb(0 0 0 / 0.1), 0 26px 50px -18px rgb(0 0 0 / 0.55);
}
.c-head {
  font-family: var(--font-redaction);
  font-size: calc(var(--p) * 19);
  letter-spacing: 0.32em;
  text-align: center;
  text-transform: uppercase;
  color: #2b2622;
}
.c-body {
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr;
  margin-top: calc(var(--p) * 14);
}
.c-message {
  display: flex;
  flex-direction: column;
  padding-right: calc(var(--p) * 22);
}
/* the line down the middle of a divided back */
.c-address {
  position: relative;
  padding-left: calc(var(--p) * 22);
  border-left: 1px solid rgb(43 38 34 / 0.45);
}
.c-label {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: calc(var(--p) * 10.5);
  color: rgb(43 38 34 / 0.55);
}
.c-title {
  margin-top: calc(var(--p) * 14);
  font-family: var(--font-redaction);
  font-size: calc(var(--p) * 25);
  line-height: 1.15;
  color: #1c1917;
}
.c-text {
  margin-top: calc(var(--p) * 10);
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: calc(var(--p) * 15.5);
  line-height: 1.45;
  color: rgb(43 38 34 / 0.85);
  text-wrap: pretty;
}
.c-path {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 0.82em;
  text-decoration: line-through;
  text-decoration-color: var(--red);
  overflow-wrap: anywhere;
}
.c-sign {
  margin-top: auto;
  font-family: var(--font-signature);
  font-size: calc(var(--p) * 46);
  line-height: 1;
  color: #901112;
}
.c-stamp {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: calc(var(--p) * 62);
  height: calc(var(--p) * 74);
  border: 1px dashed rgb(43 38 34 / 0.4);
  font-family: var(--font-mono);
  font-size: calc(var(--p) * 7.5);
  line-height: 1.5;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
  color: rgb(43 38 34 / 0.45);
}
.c-lines {
  display: flex;
  flex-direction: column;
  margin-top: calc(var(--p) * 92);
}
.c-lines li {
  border-bottom: 1px solid rgb(43 38 34 / 0.3);
}
.c-line {
  position: relative;
  display: block;
  overflow: hidden;
  padding: calc(var(--p) * 9) 0 calc(var(--p) * 3);
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: calc(var(--p) * 18);
  line-height: 1.2;
  color: #1c1917;
  transition: color 0.2s ease, padding-left 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
/* pointed at, a line is chosen: the pen marks it with a small red arrow */
.c-line::before {
  content: '→';
  position: absolute;
  left: 0;
  font-style: normal;
  color: var(--red);
  opacity: 0;
  translate: -6px 0;
  transition: opacity 0.2s ease, translate 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.c-line:hover,
.c-line:focus-visible {
  padding-left: calc(var(--p) * 22);
  color: #901112;
  outline: none;
}
.c-line:hover::before,
.c-line:focus-visible::before {
  opacity: 1;
  translate: 0 0;
}

/* --- around it -------------------------------------------------------------------------------- */
.dim {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgb(235 235 235 / 0.6);
  transition: opacity 0.4s ease;
}
.dim.w {
  left: 0;
  right: 0;
  top: -28px;
  height: 9px;
  border-inline: 1px solid rgb(235 235 235 / 0.3);
  text-align: center;
}
.dim.w::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 4px;
  height: 1px;
  background: rgb(235 235 235 / 0.3);
}
.dim.h {
  top: 0;
  bottom: 0;
  right: -28px;
  width: 9px;
  border-block: 1px solid rgb(235 235 235 / 0.3);
}
.dim.h::before {
  content: '';
  position: absolute;
  inset-block: 0;
  left: 4px;
  width: 1px;
  background: rgb(235 235 235 / 0.3);
}
.dim span {
  position: relative;
  padding: 0 6px;
  background: #901112;
  line-height: 9px;
}
.dim.h span {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  rotate: 90deg;
}
.at-rising .dim,
.at-out .dim {
  opacity: 0;
}
/* on a phone there is no room beside the envelope for its height */
@media (max-width: 639px) {
  .card {
    --card-scale: 1.6;
  }
  .dim.h {
    display: none;
  }
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 32px);
  min-height: 12px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(235 235 235 / 0.8);
}

@keyframes ink {
  to {
    opacity: 1;
    transform: rotate(-6deg) scale(1);
  }
}
@keyframes write {
  to {
    clip-path: inset(-20% -10% -20% -10%);
  }
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .return,
  .a-note,
  .strike,
  .cross path {
    animation-duration: 0s;
    animation-delay: 0s;
  }
  .flap,
  .card,
  .half,
  .shadow {
    transition: none;
  }
}
</style>
