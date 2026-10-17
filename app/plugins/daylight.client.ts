import { lightFor, sunAt } from '~/utils/daylight'

const CACHE_KEY = 'folio-whereabouts'

/** Minutes the given zone is ahead of UTC at that instant. */
function offsetMinutes(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(at)
  const n = (t: string) => Number(parts.find(p => p.type === t)!.value)
  return (Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute')) - Math.floor(at.getTime() / 60000) * 60000) / 60000
}

/** `?hour=17:40` means 17:40 today, wherever Hugo is. */
function localInstant(hhmm: string, timeZone: string) {
  const [h, m = '0'] = hhmm.split(':')
  const now = new Date()
  const guess = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), Number(h), Number(m)))
  return new Date(guess.getTime() - offsetMinutes(guess, timeZone) * 60000)
}

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

  let where = cached()
  const speed = Number(route.query.speed ?? 1) || 1
  const simulated = Boolean(route.query.hour || speed !== 1)
  let start = route.query.hour ? localInstant(String(route.query.hour), where.timeZone) : new Date()
  let t0 = performance.now()
  const clockTime = () => new Date(start.getTime() + (performance.now() - t0) * speed)

  function apply() {
    const at = clockTime()
    const sun = sunAt(at, where)
    const light = lightFor(sun.elevation, sun.morning)
    const root = document.documentElement
    // The theme button still wins: once someone picks light or dark, daylight steps aside.
    if (sessionStorage.getItem('folio-theme-manual')) {
      for (const k of Object.keys(light.vars)) root.style.removeProperty(k)
    } else {
      for (const [k, v] of Object.entries(light.vars)) root.style.setProperty(k, v)
      const want = light.dark ? 'dark' : 'light'
      if (colorMode.preference !== want) colorMode.preference = want
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
    apply()
    // Real time: the light moves slowly, twice a minute is enough. Accelerated: about ten times a second.
    setInterval(apply, speed === 1 ? 30000 : 100)
    try {
      const fresh = await $fetch<Whereabouts>('/api/folio/whereabouts')
      const zoneChanged = fresh.timeZone !== where.timeZone
      where = fresh
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
      // a simulated hour is local to the place: re-anchor it if the zone moved
      if (zoneChanged && route.query.hour) {
        start = localInstant(String(route.query.hour), where.timeZone)
        t0 = performance.now()
      }
      apply()
    } catch {
      // offline or the endpoint is down: keep the last known place
    }
  })
})
