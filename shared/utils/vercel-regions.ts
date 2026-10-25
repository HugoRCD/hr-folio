/** Vercel's regions, by code, with the city they serve from (coordinates to 0.1°, the nearest airport). */
export const VERCEL_REGIONS: Record<string, { city: string, lat: number, lon: number }> = {
  arn1: { city: 'Stockholm', lat: 59.7, lon: 17.9 },
  bom1: { city: 'Mumbai', lat: 19.1, lon: 72.9 },
  cdg1: { city: 'Paris', lat: 49.0, lon: 2.5 },
  cle1: { city: 'Cleveland', lat: 41.4, lon: -81.8 },
  cpt1: { city: 'Cape Town', lat: -34.0, lon: 18.6 },
  dub1: { city: 'Dublin', lat: 53.4, lon: -6.3 },
  dxb1: { city: 'Dubai', lat: 25.3, lon: 55.4 },
  fra1: { city: 'Frankfurt', lat: 50.0, lon: 8.6 },
  gru1: { city: 'São Paulo', lat: -23.4, lon: -46.5 },
  hkg1: { city: 'Hong Kong', lat: 22.3, lon: 113.9 },
  hnd1: { city: 'Tokyo', lat: 35.5, lon: 139.8 },
  iad1: { city: 'Washington, D.C.', lat: 38.9, lon: -77.5 },
  icn1: { city: 'Seoul', lat: 37.5, lon: 126.4 },
  kix1: { city: 'Osaka', lat: 34.4, lon: 135.2 },
  lhr1: { city: 'London', lat: 51.5, lon: -0.5 },
  pdx1: { city: 'Portland', lat: 45.6, lon: -122.6 },
  sfo1: { city: 'San Francisco', lat: 37.6, lon: -122.4 },
  sin1: { city: 'Singapore', lat: 1.4, lon: 104.0 },
  syd1: { city: 'Sydney', lat: -33.9, lon: 151.2 },
  yul1: { city: 'Montréal', lat: 45.5, lon: -73.7 },
}

/** Great-circle distance in km (haversine, mean Earth radius). */
export function greatCircleKm(a: { lat: number, lon: number }, b: { lat: number, lon: number }) {
  const r = Math.PI / 180
  const dLat = (b.lat - a.lat) * r
  const dLon = (b.lon - a.lon) * r
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}
