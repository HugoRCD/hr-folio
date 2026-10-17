import { createError } from 'evlog'
import { z } from 'zod'

function isTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone })
    return true
  } catch {
    return false
  }
}

const explicit = z.object({
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().min(1).max(80),
  countryCode: z.string().trim().length(2).toUpperCase().optional(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  timeZone: z.string().refine(isTimeZone, 'Unknown IANA time zone'),
})
// just a place name: resolved with Open-Meteo's geocoder
const byName = z.object({ city: z.string().trim().min(1).max(80), country: z.string().trim().max(80).optional() })

interface GeoResult { name: string, latitude: number, longitude: number, timezone: string, country: string, country_code: string }

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  requireWhereaboutsToken(event)
  const body = await readBody(event)

  let place: Omit<Whereabouts, 'since'>
  const full = explicit.safeParse(body)
  if (full.success) {
    place = { ...full.data, countryCode: full.data.countryCode ?? '', lat: roundCoordinate(full.data.lat), lon: roundCoordinate(full.data.lon) }
  } else {
    const named = byName.safeParse(body)
    if (!named.success) {
      throw createError({
        status: 400,
        message: 'Invalid whereabouts',
        why: 'The body needs a city, optionally a country, or the full set: city, country, lat, lon, timeZone',
        fix: 'Send {"city":"Lisbon"} or {"city":"Lisbon","country":"Portugal","lat":38.7,"lon":-9.1,"timeZone":"Europe/Lisbon"}',
      })
    }
    const { results = [] } = await $fetch<{ results?: GeoResult[] }>('https://geocoding-api.open-meteo.com/v1/search', {
      query: { name: named.data.city, count: 10, language: 'en', format: 'json' },
    })
    const wanted = named.data.country?.toLowerCase()
    const hit = results.find(r => !wanted || r.country.toLowerCase() === wanted || r.country_code.toLowerCase() === wanted)
    if (!hit) {
      log.set({ whereabouts: { query: named.data } })
      throw createError({
        status: 404,
        message: 'Place not found',
        why: `The geocoder has no match for "${named.data.city}"${wanted ? ` in ${named.data.country}` : ''}`,
        fix: 'Check the spelling, add the country, or send lat, lon and timeZone yourself',
      })
    }
    place = { city: hit.name, country: hit.country, countryCode: hit.country_code, lat: roundCoordinate(hit.latitude), lon: roundCoordinate(hit.longitude), timeZone: hit.timezone }
  }

  const storage = useStorage('whereabouts')
  const previous = await storage.getItem<Whereabouts>('current')
  const moved = !previous || previous.city !== place.city || previous.country !== place.country
  const next: Whereabouts = { ...place, since: moved ? new Date().toISOString() : previous!.since }
  await storage.setItem('current', next)
  log.set({ whereabouts: { city: next.city, country: next.country, moved } })
  return next
})
