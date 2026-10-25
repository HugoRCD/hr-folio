<script setup lang="ts">
// What is under the page: the same sheet as a working drawing on the red, the mechanism that
// runs it (PeelMechanism, each part under what it moves), and in the bottom-left corner the
// sheet's data: how it reached you (the request), what it is (the title block) and the list of
// its parts. Everything draws itself once, the first time it is uncovered, and is simply there
// afterwards.
const { uncovered = [], active = false } = defineProps<{ uncovered?: string[], active?: boolean }>()

const route = useRoute()
const daylight = useState<{ phase: string, time: string, elevation: number, place: { city: string, lat?: number, lon?: number, timeZone?: string } } | undefined>('daylight')
const detail = useState<number>('detail', () => 3)
const nuxtVersion = useNuxtApp().versions?.nuxt

const drawing = useTemplateRef<HTMLElement>('drawing')
const mechanism = useTemplateRef<{ measure:(root: HTMLElement) => void, place: (root: HTMLElement) => void }>('mechanism')

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

// --- the revisions, and the inspection stamp ----------------------------------------------------
// As on a drawing: the revision block lists the sheet's last changes, the stamp says it passed
// inspection before it left the workshop (modules/inspection, run at every build).
type Revision = { n: number, sha: string, date: string, message: string }
const revisions = ref<{ total: number | null, revisions: Revision[] } | null>(null)
async function loadRevisions() {
  if (revisions.value) return
  try {
    revisions.value = await $fetch('/api/folio/revisions')
  } catch {
    revisions.value = { total: null, revisions: [] }
  }
}
const inspection = useRuntimeConfig().public.inspection as { at: string, sha: string | null, checked: number, red: { ratio: number, floor: number }, text: { ratio: number, floor: number } } | undefined
const shortDate = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso))
// the stamp's ring: a circle the inscription runs round, from the top, clockwise
const RING = 27
const ringPath = `M40 ${40 - RING}A${RING} ${RING} 0 1 1 ${(40 - 0.01).toFixed(2)} ${40 - RING}`

// --- part numbers -------------------------------------------------------------------------------
// Each block of the page carries the file that draws it (data-part). Underneath, the file's path
// is written at the block's corner, and leads to that file as it is in this deployment.
type Tag = { path: string, name: string, x: number, y: number }
const tags = shallowRef<Tag[]>([])
const REPO = 'https://github.com/HugoRCD/hr-folio/blob'
// the file as it is in this deployment, once the request has said which one it is
const fileUrl = (path: string) => `${REPO}/${request.value?.deployment.sha ?? 'main'}/${path}`
function placeTags() {
  if (!root.value) return
  const base = root.value.getBoundingClientRect()
  const taken = rects().map(b => b.rect)
  const hits = (l: number, t: number, w: number, h: number) =>
    taken.some(r => l < r.right && l + w > r.left && t < r.bottom && t + h > r.top)
  const out: Tag[] = []
  document.querySelectorAll<HTMLElement>('.paper [data-part]').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    const path = el.dataset.part!
    const name = path.split('/').at(-1)!
    // just above the block's top-left corner, as a part number sits by its part
    const x = r.left - base.left
    const y = r.top - base.top - 15
    if (hits(r.left, r.top - 15, name.length * 6 + 24, 14)) return
    out.push({ path, name, x, y })
  })
  tags.value = out
}
const root = useTemplateRef<HTMLElement>('root')
const has = (id: string) => uncovered.includes(id)

// --- the copy of the sheet --------------------------------------------------------------------

const PAD = 16 // copy text keeps this far from an instrument

// The copy is made once per page, and again only if the window changes size.
let builtFor = ''
let drawnOnce = false
function invalidate() {
  builtFor = ''
}

/** Everything the page shows when it is lifted: the copy, and what Vercel knows about the request. */
function build() {
  loadRequest()
  loadRevisions()
  copy()
  finish()
  draw()
}

/** The copy, made ahead of the lift while the hand rests on a corner, a step at a time. */
function prepare() {
  copy()
  stepLater()
}

// Making the copy is too much work for one frame: it is done in steps, one per idle moment, so
// nothing moves less smoothly while it is made. A lift that comes before the last step takes the
// rest at once, each step after the page has caught up with the one before.
let steps: (() => void)[] = []
let idle: number | undefined
let finishing = false
function stepLater() {
  if (!steps.length) return
  const step = () => {
    steps.shift()?.()
    stepLater()
  }
  // (Safari has no idle callback: a frame later is nearly as good)
  idle = 'requestIdleCallback' in window ? requestIdleCallback(step, { timeout: 400 }) : window.setTimeout(step, 16)
}
function stopSteps() {
  if ('cancelIdleCallback' in window) cancelIdleCallback(idle as number)
  clearTimeout(idle)
}
async function finish() {
  if (finishing) return
  finishing = true
  stopSteps()
  while (steps.length) {
    steps.shift()!()
    await nextTick()
  }
  finishing = false
}
onBeforeUnmount(stopSteps)

function copy() {
  const host = drawing.value
  const sheet = document.querySelector<HTMLElement>('.paper .sheet')
  if (!host || !sheet || builtFor === route.path) return
  builtFor = route.path
  stopSteps()
  steps = [
    () => clone(host, sheet),
    // the mechanism is measured from the same page, then the copy is cleared around it
    () => root.value && mechanism.value?.measure(root.value),
    clearAround,
    // the balloons go where they cover the least of what is left
    () => root.value && mechanism.value?.place(root.value),
    () => {
      clearing()
      placeTags()
    },
  ]
}

function clone(host: HTMLElement, sheet: HTMLElement) {
  const sources = [document.querySelector<SVGSVGElement>('.paper .construction'), sheet].filter(src => src !== null)
  // the pictures' sizes, read from the page before anything changes, so it is laid out only once
  // (a picture in the copy has no size of its own until the copy is in the document)
  const sizes = sources.map(src => [...src.querySelectorAll('img, video, iframe')].map(el => el.getBoundingClientRect()))
  host.replaceChildren()
  sources.forEach((src, i) => {
    const twin = src.cloneNode(true) as HTMLElement
    // the copy must never answer for the page: no ids, no hooks
    twin.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
    twin.querySelectorAll('[data-construct], [data-signature], [data-row]').forEach((el) => {
      el.removeAttribute('data-construct')
      el.removeAttribute('data-signature')
      el.removeAttribute('data-row')
    })
    twin.classList.remove('instant')
    // pictures become what they are on a drawing: a frame with its diagonals
    twin.querySelectorAll('img, video, iframe').forEach((el, k) => {
      const r = sizes[i]![k]!
      const ph = document.createElement('span')
      ph.className = `${(el as HTMLElement).className} plate`
      ph.style.width = `${r.width}px`
      ph.style.height = `${r.height}px`
      el.replaceWith(ph)
    })
    host.append(twin)
  })
  // the copy's construction is drawn the first time the page is lifted (draw); after that it is just there
  host.querySelectorAll('.construction :is(path, text)').forEach(el => el.classList.toggle('on', drawnOnce))
}

// the first lift of the visit draws the copy's construction line by line, as the page's own was drawn
function draw() {
  const lines = drawing.value?.querySelectorAll('.construction :is(path, text)')
  if (drawnOnce || !lines?.length) return
  drawnOnce = true
  requestAnimationFrame(() => requestAnimationFrame(() => lines.forEach(el => el.classList.add('on'))))
}

// Nothing of the copy runs under an instrument: any line of text it would touch is left out
// whole, rather than cut by the instrument's edge.
function clearAround() {
  const host = drawing.value
  if (!host || !root.value) return
  const boxes = [...root.value.querySelectorAll<HTMLElement>('[data-instrument]')].map(el => el.getBoundingClientRect())
  const hits = (r: DOMRect) => boxes.some(b => r.right > b.left - PAD && r.left < b.right + PAD && r.bottom > b.top - PAD && r.top < b.bottom + PAD)
  // every box is read before anything is changed, so the copy is laid out once, not once per line
  const unlined: HTMLElement[] = []
  const hidden: HTMLElement[] = []
  for (const el of host.querySelectorAll<HTMLElement>('*')) {
    // a block's dashed outline would run through the part: the block stays, its outline goes
    if (el.matches(':is(h1, h2, h3, h4, p, li, pre, time)') && hits(el.getBoundingClientRect())) unlined.push(el)
    const textual = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent?.trim())
    const leaf = el.matches('.plate, svg:not(.construction), .leader, .rule, .tick, .construction text')
    if (!textual && !leaf) continue
    if (el.closest('svg:not(.construction)') && el.tagName.toLowerCase() !== 'svg') continue
    const r = el.getBoundingClientRect()
    if (r.width && hits(r)) hidden.push(el)
  }
  unlined.forEach(el => el.style.outline = 'none')
  hidden.forEach(el => el.style.visibility = 'hidden')
}

// Around each part and its balloon the copy fades out, so the mechanism sits on the plain ground
// rather than over the headings and outlines of the page: one clearing per part, all of them
// kept at once (an intersection of masks).
const FADE = 36
function clearing() {
  const host = drawing.value
  if (!host || !root.value) return
  const base = host.getBoundingClientRect()
  const layers = [...root.value.querySelectorAll<HTMLElement | SVGElement>('.mechanism :is([data-instrument], .balloon)')]
    .map(el => el.getBoundingClientRect())
    .filter(r => r.width && r.height)
    .map((r) => {
      const cx = r.left - base.left + r.width / 2
      const cy = r.top - base.top + r.height / 2
      const rx = r.width / 2 * Math.SQRT2 + FADE
      const ry = r.height / 2 * Math.SQRT2 + FADE
      return `radial-gradient(${rx.toFixed(0)}px ${ry.toFixed(0)}px at ${cx.toFixed(0)}px ${cy.toFixed(0)}px, transparent ${(100 * (1 - FADE / Math.min(rx, ry))).toFixed(0)}%, #000 100%)`
    })
  host.style.maskImage = layers.join(', ')
  host.style.maskComposite = layers.map(() => 'intersect').join(', ')
}

/** The instruments' boxes in the window, for the fold to test; `label` for the balloons naming them. */
function rects() {
  return [...(root.value?.querySelectorAll<HTMLElement | SVGElement>('[data-instrument], [data-reveal]') ?? [])].map(el => ({
    id: (el.dataset.instrument ?? el.dataset.reveal)!,
    label: !el.dataset.instrument,
    rect: el.getBoundingClientRect(),
  }))
}

defineExpose({ build, prepare, invalidate, rects })

// --- the title block --------------------------------------------------------------------------

const clock = ref('')
let tick: ReturnType<typeof setInterval> | undefined
function setClock() {
  const tz = daylight.value?.place.timeZone ?? 'Europe/London'
  clock.value = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date())
}
watch(() => active && has('data'), (on) => {
  clearInterval(tick)
  if (!on) return
  setClock()
  tick = setInterval(setClock, 1000)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(tick))

const STORY = '/writing/how-i-redrew-my-portfolio'
const onStory = computed(() => route.path === STORY)
const deg = (v?: number, pos = 'N', neg = 'S') => (v === undefined ? '—' : `${Math.abs(v).toFixed(1)}° ${v >= 0 ? pos : neg}`)
// what the block keeps on a phone, where it shares the turned page with the drawing
const KEY_ROWS: string[] = ['Place', 'Local time', 'Sun', 'Revision']
const block = computed(() => {
  const d = daylight.value
  const levels = ['Fair copy', 'Scale', 'Grid', 'Drawing']
  return [
    ['Sheet', route.path === '/' ? 'Index' : route.path],
    ['Drawn by', 'Hugo Richard'],
    ['Place', d ? `${d.place.city}, ${deg(d.place.lat)} ${deg(d.place.lon, 'E', 'W')}` : '—'],
    ['Local time', clock.value || d?.time || '—'],
    ['Sun', d ? `${d.elevation >= 0 ? '+' : '−'}${Math.abs(d.elevation).toFixed(1)}° · ${d.phase}` : '—'],
    ['Revision', request.value?.deployment.sha ? `${request.value.deployment.sha} · ${request.value.deployment.env}` : (request.value ? 'local' : '—')],
    ['Detail', levels[detail.value] ?? '—'],
    ['Built with', `Nuxt${nuxtVersion ? ` ${nuxtVersion}` : ''} · Nitro · Vercel`],
  ] as const
})
</script>

<template>
  <div ref="root" class="underside">
    <div ref="drawing" class="drawing" aria-hidden="true" inert />

    <PeelMechanism ref="mechanism" :uncovered :running="active" />

    <!-- part numbers: the file that draws each block, at its corner -->
    <div class="tags" :class="{ live: active }">
      <a
        v-for="t in tags"
        :key="t.path"
        :href="fileUrl(t.path)"
        target="_blank"
        rel="noopener"
        class="tag"
        :title="t.path"
        :style="{ left: `${t.x}px`, top: `${t.y}px` }"
      >
        {{ t.name }} <span aria-hidden="true">↗</span>
      </a>
    </div>

    <!-- the sheet's data, in one place: the one thing down here that answers the hand is the way
         to the other sheet -->
    <section class="instrument bl data" data-instrument="data" :class="{ shown: has('data') }" :inert="!(active && has('data'))">
      <header>
        <span class="title">hugorcd.com</span>
        <NuxtLink :to="onStory ? '/' : STORY" class="sheet-link">
          {{ onStory ? '← Index' : 'How it was drawn →' }}
        </NuxtLink>
      </header>
      <div class="columns">
        <div class="col" aria-hidden="true">
          <p class="sub">
            <span>The request</span><span>Fig. 1</span>
          </p>
          <div class="body">
            <PeelRoute ref="route2" :info="request" :shown="has('data')" />
            <div class="rule-between" />
            <PeelRender :shown="has('data')" />
          </div>
          <div v-if="route2?.total" class="equation">
            <p class="math">
              <i>t</i> ≥ 2<i>d</i> ⁄ <i>v</i> = {{ route2.total.toFixed(1) }} ms
            </p>
            <p class="caption">
              The least time a reply can take: twice the distance <i>d</i>, at the speed of light in glass fibre, <i>v</i> ≈ 200 000 km/s.
            </p>
          </div>
        </div>
        <div class="col">
          <dl>
            <div v-for="([k, v], i) in block" :key="k" class="tb-row" :class="{ minor: !KEY_ROWS.includes(k) }" :style="{ '--i': i }">
              <dt>{{ k }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
          <template v-if="revisions?.revisions.length">
            <p class="sub revs-head">
              <span>Revisions</span><span>{{ revisions.total }} so far</span>
            </p>
            <ol class="revs">
              <li v-for="(r, i) in revisions.revisions" :key="r.sha" class="tb-row" :style="{ '--i': i + 10 }">
                <span class="rev-n">{{ r.n }}</span>
                <span class="rev-date">{{ shortDate(r.date) }}</span>
                <span class="rev-msg" :title="r.message">{{ r.message }}</span>
              </li>
            </ol>
          </template>
          <!-- the inspection stamp, inked in once the block is uncovered -->
          <div v-if="inspection" class="stamp-row">
            <svg
              class="stamp"
              viewBox="0 0 80 80"
              width="80"
              height="80"
              role="img"
              :aria-label="`Inspected and reviewed by Hugo, ${shortDate(inspection.at)}`"
            >
              <defs>
                <path id="stamp-ring" :d="ringPath" />
              </defs>
              <circle cx="40" cy="40" r="37" />
              <circle cx="40" cy="40" r="22" />
              <text class="ring"><textPath href="#stamp-ring" startOffset="0" :textLength="(2 * Math.PI * RING - 4).toFixed(1)" lengthAdjust="spacing">INSPECTED · REVIEWED BY HUGO · </textPath></text>
              <text x="40" y="38" text-anchor="middle" class="date">{{ shortDate(inspection.at).toUpperCase() }}</text>
              <text x="40" y="47" text-anchor="middle" class="sha">{{ inspection.sha || 'local' }}</text>
            </svg>
            <p class="stamp-note">
              Every version is reviewed before it goes online.
            </p>
          </div>
        </div>
      </div>
    </section>
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
.bl { bottom: 20px; left: 20px; }
.data {
  width: 537px;
}
.columns {
  display: grid;
  grid-template-columns: 268px 268px;
}
.col + .col {
  border-left: 1px solid rgb(235 235 235 / 0.3);
}
.sub {
  display: flex;
  justify-content: space-between;
  padding: 5px 8px;
  border-bottom: 1px solid rgb(235 235 235 / 0.3);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(235 235 235 / 0.65);
}
.sub > :first-child {
  color: var(--bone);
}
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
.instrument header > :last-child:not(.title) {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(235 235 235 / 0.65);
}
/* the only live thing underneath: it takes the pointer, and underlines in bone like any link */
.sheet-link {
  pointer-events: auto;
  text-decoration: underline;
  text-decoration-color: rgb(235 235 235 / 0.3);
  text-underline-offset: 3px;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
}
.instrument header .sheet-link:hover,
.instrument header .sheet-link:focus-visible {
  color: var(--bone);
  text-decoration-color: var(--bone);
  outline: none;
}
.body {
  padding: 12px 15px 10px;
}
/* each instrument's frame is ruled in when it is uncovered */
.instrument {
  clip-path: inset(0 100% 100% 0);
  transition: clip-path 0.55s cubic-bezier(0.65, 0, 0.35, 1);
}
.bl { clip-path: inset(100% 100% 0 0); }
.instrument.shown {
  clip-path: inset(0 0 0 0);
}

/* each instrument closes on the equation it runs on, and what it means in words */
.equation {
  padding: 7px 15px 9px;
  border-top: 1px solid rgb(235 235 235 / 0.3);
  opacity: 0;
  transition: opacity 0.6s ease 1.4s;
}
.equation .math {
  font-family: var(--font-redaction);
  font-size: 14px;
  line-height: 20px;
  color: var(--bone);
  white-space: nowrap;
}
.equation .caption {
  margin-top: 3px;
  font-family: var(--font-mono);
  font-size: 9px;
  line-height: 13px;
  letter-spacing: 0.02em;
  color: rgb(235 235 235 / 0.62);
}
.equation i {
  font-family: var(--font-redaction);
  font-style: italic;
  letter-spacing: 0;
}
.equation .caption i {
  font-size: 11px;
  color: var(--bone);
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

/* --- revisions and the stamp --- */
.revs-head {
  border-top: 1px solid rgb(235 235 235 / 0.3);
}
.revs li {
  display: grid;
  grid-template-columns: 30px 46px 1fr;
  align-items: baseline;
  padding: 3px 8px;
}
.rev-n {
  font-variant-numeric: tabular-nums;
}
.rev-date {
  color: rgb(235 235 235 / 0.6);
}
.rev-msg {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.stamp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-top: 1px solid rgb(235 235 235 / 0.3);
}
.stamp {
  flex-shrink: 0;
  transform: rotate(-8deg);
  opacity: 0;
  scale: 1.15;
  transition: opacity 0.35s ease 1.4s, scale 0.35s cubic-bezier(0.3, 0, 0.2, 1) 1.4s;
}
.shown .stamp {
  opacity: 0.92;
  scale: 1;
}
.stamp circle {
  fill: none;
  stroke: var(--bone);
  stroke-width: 1;
}
.stamp text {
  fill: var(--bone);
  font-family: var(--font-mono);
}
.stamp .ring {
  font-size: 6.4px;
  letter-spacing: 0.1em;
}
.stamp .date {
  font-size: 8px;
  letter-spacing: 0.08em;
}
.stamp .sha {
  font-size: 6.5px;
  fill: rgb(235 235 235 / 0.7);
}
.stamp-note {
  font-size: 9px;
  line-height: 13px;
  color: rgb(235 235 235 / 0.72);
}

/* --- part numbers: the files, at the corners of what they draw --- */
.tags {
  position: absolute;
  inset: 0;
  z-index: 15;
}
.tag {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 9px;
  line-height: 14px;
  letter-spacing: 0.04em;
  color: rgb(235 235 235 / 0.75);
  white-space: nowrap;
  text-decoration: underline;
  text-decoration-color: rgb(235 235 235 / 0.35);
  text-underline-offset: 2px;
  pointer-events: none;
}
.tags.live .tag {
  pointer-events: auto;
}
.tag:hover {
  color: #ffffff;
  text-decoration-color: currentColor;
}

/* on a touch screen the sheet is turned over and stands at the left edge: the block starts clear of it */
@media (pointer: coarse) {
  .data.bl {
    left: 56px;
  }
}
/* on a phone the block takes the width there is and only what matters on the spot (where, when,
   the sun, the revision, the stamp), so the drawing and the mechanism above it can be seen */
@media (max-width: 640px) {
  .data {
    width: auto;
    right: 12px;
    bottom: 12px;
  }
  .tb-row.minor,
  .revs-head,
  .revs {
    display: none;
  }
  .columns {
    grid-template-columns: 1fr;
  }
  .columns > .col:first-child {
    display: none;
  }
  .col + .col {
    border-left: 0;
  }
}

/* --- the copy of the sheet, recoloured as a drawing: bone line on red --- */
.drawing {
  position: absolute;
  inset: 0;
  contain: strict;
  --ui-bg: #901112;
  --ui-text: #ebebeb;
  --ui-text-highlighted: #ffffff;
  --ui-text-muted: rgb(235 235 235 / 0.72);
  --ui-text-dimmed: rgb(235 235 235 / 0.5);
  --ui-primary: #ebebeb;
  --ui-border: rgb(235 235 235 / 0.3);
}
/* the copy is a drawing, not a second page: nothing in it moves, not even the ∞ beam, which would
   otherwise go round under the paper for the rest of the visit */
.drawing :deep(*) {
  animation: none !important;
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
@media (prefers-reduced-motion: reduce) {
  .instrument, .tb-row, .equation, .stamp {
    transition: none;
  }
}
</style>
