<script setup lang="ts">
// What is under the page: the same sheet as a working drawing on the red, and in each corner of
// the window an instrument showing something that actually drives the page, live. Each corner of
// the paper can be lifted, so each corner has its own: the render, the sun, the movement, and the
// drawing's title block. An instrument draws itself in when the fold first uncovers it, and only
// runs while it can be seen.
const { uncovered = [], active = false } = defineProps<{ uncovered?: string[], active?: boolean }>()

const route = useRoute()
const daylight = useState<{ phase: string, time: string, elevation: number, place: { city: string, lat?: number, lon?: number, timeZone?: string } } | undefined>('daylight')
const detail = useState<number>('detail', () => 1)
const nuxtVersion = useNuxtApp().versions?.nuxt

const drawing = useTemplateRef<HTMLElement>('drawing')

// what Vercel knows about this request (see /api/folio/request), fetched the first time the page is lifted
type RequestInfo = { visitor: { city: string, country: string, lat: number, lon: number } | null, edge: string | null, fn: string | null, deployment: { env: string, sha: string | null, message: string | null, builtAt: string } }
const request = ref<RequestInfo | null>(null)
const route2 = useTemplateRef<{ total: number }>('route2')
async function loadRequest() {
  if (request.value) return
  try {
    request.value = await $fetch<RequestInfo>('/api/folio/request')
  } catch {
    // offline: the request instrument says so
  }
}
const root = useTemplateRef<HTMLElement>('root')
const has = (id: string) => uncovered.includes(id)

// --- the copy of the sheet --------------------------------------------------------------------

const PAD = 16 // copy text keeps this far from an instrument

function build() {
  loadRequest()
  const host = drawing.value
  const sheet = document.querySelector<HTMLElement>('.paper .sheet')
  if (!host || !sheet) return
  host.replaceChildren()
  const construction = document.querySelector<SVGSVGElement>('.paper .construction')
  for (const src of [construction, sheet]) {
    if (!src) continue
    const copy = src.cloneNode(true) as HTMLElement
    // the copy must never answer for the page: no ids, no hooks
    copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
    copy.querySelectorAll('[data-construct], [data-signature], [data-row]').forEach((el) => {
      el.removeAttribute('data-construct')
      el.removeAttribute('data-signature')
      el.removeAttribute('data-row')
    })
    copy.classList.remove('instant')
    // pictures become what they are on a drawing: a frame with its diagonals
    copy.querySelectorAll('img, video, iframe').forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect()
      const ph = document.createElement('span')
      ph.className = `${(el as HTMLElement).className} plate`
      ph.style.width = `${r.width}px`
      ph.style.height = `${r.height}px`
      el.replaceWith(ph)
    })
    host.append(copy)
  }
  // the copy's construction draws itself again, line by line, as the page comes up
  const lines = host.querySelectorAll('.construction :is(path, text)')
  lines.forEach(el => el.classList.remove('on'))
  requestAnimationFrame(() => requestAnimationFrame(() => lines.forEach(el => el.classList.add('on'))))
  clearAround()
}

// Nothing of the copy runs under an instrument: any line of text it would touch is left out
// whole, rather than cut by the instrument's edge.
function clearAround() {
  const host = drawing.value
  if (!host || !root.value) return
  const boxes = [...root.value.querySelectorAll<HTMLElement>('[data-instrument]')].map(el => el.getBoundingClientRect())
  const hits = (r: DOMRect) => boxes.some(b => r.right > b.left - PAD && r.left < b.right + PAD && r.bottom > b.top - PAD && r.top < b.bottom + PAD)
  const candidates = host.querySelectorAll<HTMLElement | SVGElement>('*')
  for (const el of candidates) {
    const textual = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent?.trim())
    const leaf = el.matches('.plate, svg:not(.construction), .leader, .rule, .tick, .construction text')
    if (!textual && !leaf) continue
    if (el.closest('svg:not(.construction)') && el.tagName.toLowerCase() !== 'svg') continue
    const r = el.getBoundingClientRect()
    if (r.width && hits(r)) (el as HTMLElement).style.visibility = 'hidden'
  }
}

/** The instruments' boxes in the window, for the fold to test. */
function rects() {
  return [...(root.value?.querySelectorAll<HTMLElement>('[data-instrument]') ?? [])].map(el => ({ id: el.dataset.instrument!, rect: el.getBoundingClientRect() }))
}

defineExpose({ build, rects })

// --- the title block --------------------------------------------------------------------------

const clock = ref('')
let tick: ReturnType<typeof setInterval> | undefined
function setClock() {
  const tz = daylight.value?.place.timeZone ?? 'Europe/London'
  clock.value = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date())
}
watch(() => active && has('block'), (on) => {
  clearInterval(tick)
  if (!on) return
  setClock()
  tick = setInterval(setClock, 1000)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(tick))

const deg = (v?: number, pos = 'N', neg = 'S') => (v === undefined ? '—' : `${Math.abs(v).toFixed(1)}° ${v >= 0 ? pos : neg}`)
const block = computed(() => {
  const d = daylight.value
  const levels = ['Fair copy', 'Scale', 'Grid', 'Drawing']
  return [
    ['Sheet', route.path === '/' ? 'Index' : route.path],
    ['Drawn by', 'Hugo Richard'],
    ['Place', d ? `${d.place.city}, ${deg(d.place.lat)} ${deg(d.place.lon, 'E', 'W')}` : '—'],
    ['Local time', clock.value || d?.time || '—'],
    ['Sun', d ? `${d.elevation >= 0 ? '+' : '−'}${Math.abs(d.elevation).toFixed(1)}° · ${d.phase}` : '—'],
    ['Grid', '224 · 48 · 528 · 48 · 176'],
    ['Revision', request.value?.deployment.sha ? `${request.value.deployment.sha} · ${request.value.deployment.env}` : (request.value ? 'local' : '—')],
    ['Detail', levels[detail.value] ?? '—'],
    ['Built with', `Nuxt${nuxtVersion ? ` ${nuxtVersion}` : ''} · Nitro · Vercel`],
  ] as const
})
</script>

<template>
  <div ref="root" class="underside" aria-hidden="true" inert>
    <div ref="drawing" class="drawing" />

    <section class="instrument tl" data-instrument="render" :class="{ shown: has('render') }">
      <header><span class="title">The request</span><span>Fig. 1</span></header>
      <div class="body">
        <PeelRoute ref="route2" :info="request" :shown="has('render')" />
        <div class="rule-between" />
        <PeelRender :shown="has('render')" />
      </div>
      <p class="equation">
        <i>t</i> ≥ 2<i>d</i> ⁄ ⅔<i>c</i><span>{{ route2?.total ? `≥ ${route2.total.toFixed(1)} ms there and back` : 'light in fibre' }}</span>
      </p>
    </section>

    <section class="instrument tr" data-instrument="sun" :class="{ shown: has('sun') }">
      <header><span class="title">The sun</span><span>{{ daylight?.place.city ?? '' }} · Fig. 2</span></header>
      <div class="body">
        <PeelSun :shown="has('sun')" />
      </div>
      <p class="equation">
        sin <i>h</i> = sin <i>φ</i> sin <i>δ</i> + cos <i>φ</i> cos <i>δ</i> cos <i>H</i><span>elevation</span>
      </p>
    </section>

    <section class="instrument bl" data-instrument="movement" :class="{ shown: has('movement') }">
      <header><span class="title">The movement</span><span>28 800 vph · Fig. 3</span></header>
      <div class="body">
        <PeelMovement :shown="has('movement')" :running="active && has('movement')" :time-zone="daylight?.place.timeZone" />
      </div>
      <p class="equation">
        <sup>64</sup>⁄<sub>8</sub> · <sup>60</sup>⁄<sub>8</sub> · <sup>72</sup>⁄<sub>6</sub> = 720<span>escape turns an hour</span>
      </p>
    </section>

    <dl class="instrument br title-block" data-instrument="block" :class="{ shown: has('block') }">
      <header><span class="title">hugorcd.com</span><span>Sheet 1 / 1</span></header>
      <div v-for="([k, v], i) in block" :key="k" class="tb-row" :style="{ '--i': i }">
        <dt>{{ k }}</dt>
        <dd>{{ v }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
/* The red under the page: the ink of the signature, as a ground, on a faint drafting grid that
   stays put with the window, like the paper it is drawn on. */
.underside {
  --ground: #901112;
  --bone: #ebebeb;
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  color: var(--bone);
  pointer-events: none;
  background-color: var(--ground);
  background-image:
    linear-gradient(rgb(235 235 235 / 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgb(235 235 235 / 0.055) 1px, transparent 1px),
    linear-gradient(rgb(235 235 235 / 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgb(235 235 235 / 0.025) 1px, transparent 1px);
  background-size: 48px 48px, 48px 48px, 8px 8px, 8px 8px;
  background-attachment: fixed;
}

/* --- instruments: one per corner, on their own ground, above the copy --- */
.instrument {
  position: fixed;
  z-index: 20;
  width: 268px;
  background: var(--ground);
  border: 1px solid rgb(235 235 235 / 0.55);
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  line-height: 14px;
  color: rgb(235 235 235 / 0.9);
}
.tl { top: 20px; left: 20px; }
.tr { top: 20px; right: 20px; }
.bl { bottom: 20px; left: 20px; }
.br { bottom: 20px; right: 20px; }
.instrument header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 6px 8px;
  border-bottom: 1px solid rgb(235 235 235 / 0.55);
}
.instrument header .title {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 14px;
  letter-spacing: 0;
  line-height: 18px;
  color: var(--bone);
}
.instrument header span:last-child {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(235 235 235 / 0.65);
}
.body {
  padding: 12px 15px 10px;
}
/* each instrument's frame is ruled in when it is uncovered */
.instrument {
  clip-path: inset(0 100% 100% 0);
  transition: clip-path 0.55s cubic-bezier(0.65, 0, 0.35, 1);
}
.tr { clip-path: inset(0 0 100% 100%); }
.bl { clip-path: inset(100% 100% 0 0); }
.br { clip-path: inset(100% 0 0 100%); }
.instrument.shown {
  clip-path: inset(0 0 0 0);
}

/* each instrument closes on the equation it runs on */
.equation {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 8px 6px;
  border-top: 1px solid rgb(235 235 235 / 0.3);
  font-family: var(--font-redaction);
  font-size: 13px;
  letter-spacing: 0.01em;
  line-height: 18px;
  color: var(--bone);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.6s ease 1.4s;
}
.equation i {
  font-style: italic;
}
.equation sup,
.equation sub {
  font-size: 9px;
  line-height: 0;
}
.equation span {
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(235 235 235 / 0.55);
}
.shown .equation {
  opacity: 1;
}
.rule-between {
  height: 1px;
  margin: 10px 0 12px;
  background: rgb(235 235 235 / 0.18);
}
.tb-row {
  display: grid;
  grid-template-columns: 84px 1fr;
  opacity: 0;
  transition: opacity 0.4s ease;
  transition-delay: calc(250ms + var(--i) * 50ms);
}
.shown .tb-row {
  opacity: 1;
}
.tb-row + .tb-row {
  border-top: 1px solid rgb(235 235 235 / 0.18);
}
.tb-row dt {
  padding: 3px 8px;
  border-right: 1px solid rgb(235 235 235 / 0.18);
  text-transform: uppercase;
  color: rgb(235 235 235 / 0.55);
}
.tb-row dd {
  padding: 3px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}

/* --- the copy of the sheet, recoloured as a drawing: bone line on red --- */
.drawing {
  position: absolute;
  inset: 0;
  --ui-bg: #901112;
  --ui-text: #ebebeb;
  --ui-text-highlighted: #ffffff;
  --ui-text-muted: rgb(235 235 235 / 0.72);
  --ui-text-dimmed: rgb(235 235 235 / 0.5);
  --ui-primary: #ebebeb;
  --ui-border: rgb(235 235 235 / 0.3);
}
.drawing :deep(*) {
  color: inherit;
  background-color: transparent !important;
  box-shadow: none !important;
  text-decoration-color: currentColor !important;
  border-color: rgb(235 235 235 / 0.3) !important;
}
.drawing :deep(.sheet) {
  color: rgb(235 235 235 / 0.88);
}
.drawing :deep(:is(h1, h2, h3, h4, p, li, pre, time)) {
  outline: 1px dashed rgb(235 235 235 / 0.12);
  outline-offset: 2px;
}
.drawing :deep(pre *),
.drawing :deep(code *) {
  color: inherit !important;
}
.drawing :deep(.plate) {
  display: block;
  border: 1px solid rgb(235 235 235 / 0.5);
  background:
    linear-gradient(to top right, transparent calc(50% - 0.5px), rgb(235 235 235 / 0.4) 50%, transparent calc(50% + 0.5px)),
    linear-gradient(to bottom right, transparent calc(50% - 0.5px), rgb(235 235 235 / 0.4) 50%, transparent calc(50% + 0.5px)) !important;
}
.drawing :deep(svg) {
  color: rgb(235 235 235 / 0.9) !important;
}
.drawing :deep(.construction path) {
  stroke: rgb(235 235 235 / 0.4) !important;
}
.drawing :deep(.construction path.guide) {
  stroke: rgb(235 235 235 / 0.2) !important;
}
.drawing :deep(.construction text) {
  fill: rgb(235 235 235 / 0.75) !important;
}
.drawing :deep(.animate-in) {
  animation: none !important;
  opacity: 1 !important;
}
@media (prefers-reduced-motion: reduce) {
  .instrument, .tb-row {
    transition: none;
  }
}
</style>
