/** Where Hugo is, at city level. Drives the daylight and the dateline under the signature. */
export interface Whereabouts {
  city: string
  country: string
  countryCode: string
  /** rounded to 0.1° (about 11 km): enough for the sun, not enough to find anyone */
  lat: number
  lon: number
  timeZone: string
  /** ISO date of the last move, null for the default */
  since: string | null
}

export const HOME_WHEREABOUTS: Whereabouts = {
  city: 'London',
  country: 'United Kingdom',
  countryCode: 'GB',
  lat: 51.5,
  lon: -0.1,
  timeZone: 'Europe/London',
  since: null,
}

export const roundCoordinate = (n: number) => Math.round(n * 10) / 10
