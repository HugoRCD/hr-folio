import { LIGHT_VARS, lightFor, localInstant, redAt, sunAt } from '~/utils/daylight'

const CACHE_KEY = 'folio-whereabouts'
const MANUAL_KEY = 'folio-theme-manual'

// How long the page takes to go from light to dark (or back) when the sun crosses the horizon:
// slowly in real time, quickly under the needle of the sun viewer.
const CROSSFADE = { clock: 2400, preview: 450 }

function cached(): Whereabouts {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return { ...HOME_WHEREABOUTS, ...JSON.parse(raw) }
  } catch {
    // private mode or a corrupt entry: start from home
  }
  return HOME_WHEREABOUTS
}

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const colorMode = useColorMode()
  const state = useState('daylight', () => ({
    phase: 'day', time: '', date: '', elevation: 45, dark: false, simulated: false,
    place: { city: HOME_WHEREABOUTS.city, country: HOME_WHEREABOUTS.country, timeZone: HOME_WHEREABOUTS.timeZone, lat: HOME_WHEREABOUTS.lat, lon: HOME_WHEREABOUTS.lon },
  }))

  // An instant to show instead of the clock (the sun viewer on /notice). While it is set the page
  // takes its light even over a theme picked by hand; that choice comes back when it is cleared.
  const preview = useState<number | null>('daylight-at', () => null)
  let held: string | null = null
  // Light or dark picked by hand, for the rest of the visit, until the sun is followed again.
  const manual = useState<boolean>('daylight-manual', () => false)
  // A point on the red's band chosen by hand (the red viewer on /notice), instead of the light's.
  const redHeld = useState<number | null>('red-at', () => null)
  let ready = false
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  let where = cached()
  const speed = Number(route.query.speed ?? 1) || 1
  const simulated = Boolean(route.query.hour || speed !== 1)
  let start = route.query.hour ? localInstant(String(route.query.hour), where.timeZone) : new Date()
  let t0 = performance.now()
  const clockTime = () => new Date(start.getTime() + (performance.now() - t0) * speed)
  // how far the page's clock is from the real one (?hour=), for the instruments that read it
  const skew = useState<number>('daylight-skew', () => 0)
  skew.value = start.getTime() - Date.now()

  function apply(fade = 0) {
    const at = preview.value === null ? clockTime() : new Date(preview.value)
    const sun = sunAt(at, where)
    const light = lightFor(sun.elevation, sun.morning, redHeld.value)
    const root = document.documentElement
    // A theme picked by hand wins: daylight steps aside until the sun is followed again.
    if (manual.value && preview.value === null) {
      for (const k of LIGHT_VARS) root.style.removeProperty(k)
      if (held !== null) colorMode.preference = held
      held = null
      if (redHeld.value === null) root.style.removeProperty('--ui-primary')
      else root.style.setProperty('--ui-primary', redAt(redHeld.value, colorMode.value === 'dark'), 'important')
    } else {
      if (manual.value && held === null) held = colorMode.preference
      const want = light.dark ? 'dark' : 'light'
      const commit = () => {
        for (const [k, v] of Object.entries(light.vars)) root.style.setProperty(k, v)
        // the stylesheet's red is !important (Nuxt UI sets its own): the light's has to be too
        root.style.setProperty('--ui-primary', light.red, 'important')
        if (colorMode.preference !== want) colorMode.preference = want
        return nextTick()
      }
      // Light and dark swap every colour at once: when the sun crosses the horizon the new page
      // fades in over the old one instead of cutting to it.
      if (fade && colorMode.preference !== want && !reduced && document.startViewTransition) {
        const t = document.startViewTransition(commit)
        t.ready.then(() => root.animate({ opacity: [0, 1] }, { duration: fade, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {})
      } else {
        commit()
      }
    }
    Object.assign(state.value, {
      phase: light.phase,
      time: new Intl.DateTimeFormat('en-GB', { timeZone: where.timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(at),
      date: new Intl.DateTimeFormat('en-GB', { timeZone: where.timeZone, day: 'numeric', month: 'long', year: 'numeric' }).format(at),
      elevation: sun.elevation,
      dark: light.dark,
      simulated,
      place: { city: where.city, country: where.country, timeZone: where.timeZone, lat: where.lat, lon: where.lon },
    })
  }

  // Wait for the colour-mode module to restore its stored preference, then take over.
  onNuxtReady(async () => {
    manual.value = Boolean(sessionStorage.getItem(MANUAL_KEY))
    apply()
    ready = true
    watch(preview, () => apply(CROSSFADE.preview))
    // a red held on its band is lifted on black: follow the mode too
    watch([redHeld, () => colorMode.value], () => apply())
    watch(manual, (on) => {
      if (on) sessionStorage.setItem(MANUAL_KEY, '1')
      else sessionStorage.removeItem(MANUAL_KEY)
    })
    // Real time: the light moves slowly, twice a minute is enough. Accelerated: about ten times a second.
    setInterval(() => apply(CROSSFADE.clock), speed === 1 ? 30000 : 100)
    try {
      const fresh = await $fetch<Whereabouts>('/api/folio/whereabouts')
      const zoneChanged = fresh.timeZone !== where.timeZone
      where = fresh
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
      // a simulated hour is local to the place: re-anchor it if the zone moved
      if (zoneChanged && route.query.hour) {
        start = localInstant(String(route.query.hour), where.timeZone)
        t0 = performance.now()
        skew.value = start.getTime() - Date.now()
      }
      apply(CROSSFADE.clock)
    } catch {
      // offline or the endpoint is down: keep the last known place
    }
  })

  return {
    provide: {
      daylight: {
        /** Light or dark by hand; `null` hands the page back to the sun. Applied at once, unanimated: the caller owns the transition. */
        byHand(mode: 'light' | 'dark' | null) {
          manual.value = mode !== null
          held = null
          if (mode === null) {
            if (ready) apply()
            return
          }
          const root = document.documentElement
          for (const k of LIGHT_VARS) root.style.removeProperty(k)
          if (redHeld.value === null) root.style.removeProperty('--ui-primary')
          colorMode.preference = mode
        },
      },
    },
  }
})
