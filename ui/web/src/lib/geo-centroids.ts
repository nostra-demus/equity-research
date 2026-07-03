// Approximate country / region centroids for the screener pulse map — enough to drop a news bloom onto an
// equirectangular world. Country keys are ISO 3166-1 alpha-2 (FeedItem.country, from news/geography.ts); the
// legacy 8-bucket region (FeedItem.region) is the fallback when no country resolved. Coarse BY DESIGN: a pulse
// map wants "roughly where", not survey precision. Add a row to extend — no code change needed anywhere else.

export type LatLng = { lat: number; lng: number }

export const COUNTRY_CENTROIDS: Record<string, LatLng> = {
  US: { lat: 39, lng: -98 }, CA: { lat: 56, lng: -106 }, MX: { lat: 23, lng: -102 },
  BR: { lat: -10, lng: -52 }, AR: { lat: -34, lng: -64 }, CL: { lat: -33, lng: -71 }, CO: { lat: 4, lng: -73 },
  GB: { lat: 54, lng: -2 }, IE: { lat: 53, lng: -8 }, FR: { lat: 47, lng: 2 }, DE: { lat: 51, lng: 10 },
  ES: { lat: 40, lng: -4 }, IT: { lat: 42, lng: 13 }, NL: { lat: 52, lng: 5 }, CH: { lat: 47, lng: 8 },
  SE: { lat: 62, lng: 15 }, NO: { lat: 62, lng: 10 }, FI: { lat: 64, lng: 26 }, PL: { lat: 52, lng: 19 },
  RU: { lat: 61, lng: 90 }, TR: { lat: 39, lng: 35 }, IL: { lat: 31, lng: 35 }, AE: { lat: 24, lng: 54 },
  SA: { lat: 24, lng: 45 }, QA: { lat: 25, lng: 51 }, EG: { lat: 27, lng: 30 }, ZA: { lat: -29, lng: 24 },
  NG: { lat: 9, lng: 8 }, KE: { lat: 0, lng: 38 }, IN: { lat: 22, lng: 79 }, PK: { lat: 30, lng: 70 },
  BD: { lat: 24, lng: 90 }, LK: { lat: 8, lng: 81 }, CN: { lat: 35, lng: 105 }, HK: { lat: 22, lng: 114 },
  TW: { lat: 24, lng: 121 }, JP: { lat: 36, lng: 138 }, KR: { lat: 37, lng: 128 }, SG: { lat: 1, lng: 104 },
  ID: { lat: -2, lng: 118 }, TH: { lat: 15, lng: 101 }, VN: { lat: 16, lng: 108 }, MY: { lat: 4, lng: 102 },
  PH: { lat: 13, lng: 122 }, AU: { lat: -25, lng: 134 }, NZ: { lat: -42, lng: 172 },
}

// legacy 8-bucket region → a representative point, used when no ISO country resolved.
export const REGION_CENTROIDS: Record<string, LatLng> = {
  US: COUNTRY_CENTROIDS.US, IN: COUNTRY_CENTROIDS.IN, JP: COUNTRY_CENTROIDS.JP,
  GB: COUNTRY_CENTROIDS.GB, CN: COUNTRY_CENTROIDS.CN, KR: COUNTRY_CENTROIDS.KR,
  GLOBAL: { lat: 8, lng: 0 }, // a neutral mid-Atlantic anchor for genuinely global stories
  OTHER: { lat: -46, lng: -150 }, // parked in empty ocean, clearly off the majors, so "unplaced" reads as such
}

// Resolve an item's geography to a stable bucket KEY + centroid. Prefer the precise ISO country; fall back to
// the coarse region; null when neither is known (the caller drops it from the map).
export function resolveGeo(country?: string | null, region?: string | null): { key: string; ll: LatLng } | null {
  if (country && COUNTRY_CENTROIDS[country]) return { key: country, ll: COUNTRY_CENTROIDS[country] }
  if (region && REGION_CENTROIDS[region]) return { key: region, ll: REGION_CENTROIDS[region] }
  return null
}

// equirectangular projection into a WIDTH×HEIGHT box (WIDTH:HEIGHT must be 2:1 for undistorted placement).
export function project(ll: LatLng, width: number, height: number): { x: number; y: number } {
  return { x: ((ll.lng + 180) / 360) * width, y: ((90 - ll.lat) / 180) * height }
}
