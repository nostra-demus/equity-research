// Curated lat/lon centroids for the Globe view — a small, hand-picked table (NOT a full geocoder),
// keyed the same way geography.ts is: ISO alpha-2 country code → a representative point (usually the
// capital or primary financial centre, whichever a reader would expect a marker to sit on). Kept as
// its own file, separate from geography.ts, so the resolver stays a pure text/lookup module and this
// data blob can grow (like GAZETTEER) without bloating it.
//
// Coverage: every country reachable through geography.ts's GAZETTEER (the text-match path
// resolveEventGeography can actually return) plus the other globally-major economies/markets likely to
// show up on the wire even before a matching gazetteer entry is added. Extensible: add a row, no code
// change elsewhere — computeGlobeSnapshot (news/globe.ts) falls back to REGION_CENTROIDS for any country
// this table doesn't (yet) cover, so an omission degrades to a coarser marker, never a crash or a drop.

import type { GeoRegion } from './geography'

export interface Centroid {
  lat: number
  lon: number
}

// ISO alpha-2 → a representative point. Sorted by region to make gaps easy to spot against geography.ts.
export const COUNTRY_CENTROIDS: Readonly<Record<string, Centroid>> = Object.freeze({
  // North America
  US: { lat: 38.9, lon: -77.0 }, // Washington DC
  CA: { lat: 45.4, lon: -75.7 }, // Ottawa
  MX: { lat: 19.4, lon: -99.1 }, // Mexico City
  PA: { lat: 9.0, lon: -79.5 }, // Panama City
  CU: { lat: 23.1, lon: -82.4 }, // Havana
  DO: { lat: 18.5, lon: -69.9 }, // Santo Domingo
  JM: { lat: 18.0, lon: -76.8 }, // Kingston
  BS: { lat: 25.0, lon: -77.4 }, // Nassau
  BM: { lat: 32.3, lon: -64.8 }, // Hamilton
  KY: { lat: 19.3, lon: -81.4 }, // George Town
  GT: { lat: 14.6, lon: -90.5 }, // Guatemala City
  CR: { lat: 9.9, lon: -84.1 }, // San José
  GL: { lat: 64.2, lon: -51.7 }, // Nuuk

  // South America
  BR: { lat: -23.6, lon: -46.6 }, // São Paulo (financial centre, not the capital — the market that matters here)
  AR: { lat: -34.6, lon: -58.4 }, // Buenos Aires
  CL: { lat: -33.4, lon: -70.7 }, // Santiago
  CO: { lat: 4.7, lon: -74.1 }, // Bogotá
  PE: { lat: -12.0, lon: -77.0 }, // Lima
  VE: { lat: 10.5, lon: -66.9 }, // Caracas
  EC: { lat: -0.2, lon: -78.5 }, // Quito
  BO: { lat: -16.5, lon: -68.1 }, // La Paz
  PY: { lat: -25.3, lon: -57.6 }, // Asunción
  UY: { lat: -34.9, lon: -56.2 }, // Montevideo
  GY: { lat: 6.8, lon: -58.2 }, // Georgetown

  // Europe
  GB: { lat: 51.5, lon: -0.1 }, // London
  IE: { lat: 53.3, lon: -6.3 }, // Dublin
  FR: { lat: 48.9, lon: 2.3 }, // Paris
  DE: { lat: 52.5, lon: 13.4 }, // Berlin
  IT: { lat: 41.9, lon: 12.5 }, // Rome
  ES: { lat: 40.4, lon: -3.7 }, // Madrid
  PT: { lat: 38.7, lon: -9.1 }, // Lisbon
  NL: { lat: 52.4, lon: 4.9 }, // Amsterdam
  BE: { lat: 50.8, lon: 4.4 }, // Brussels
  LU: { lat: 49.6, lon: 6.1 }, // Luxembourg
  CH: { lat: 47.4, lon: 8.5 }, // Zurich (financial centre)
  AT: { lat: 48.2, lon: 16.4 }, // Vienna
  SE: { lat: 59.3, lon: 18.1 }, // Stockholm
  NO: { lat: 59.9, lon: 10.7 }, // Oslo
  DK: { lat: 55.7, lon: 12.6 }, // Copenhagen
  FI: { lat: 60.2, lon: 24.9 }, // Helsinki
  IS: { lat: 64.1, lon: -21.9 }, // Reykjavík
  PL: { lat: 52.2, lon: 21.0 }, // Warsaw
  CZ: { lat: 50.1, lon: 14.4 }, // Prague
  SK: { lat: 48.1, lon: 17.1 }, // Bratislava
  HU: { lat: 47.5, lon: 19.0 }, // Budapest
  RO: { lat: 44.4, lon: 26.1 }, // Bucharest
  BG: { lat: 42.7, lon: 23.3 }, // Sofia
  GR: { lat: 37.98, lon: 23.7 }, // Athens
  HR: { lat: 45.8, lon: 16.0 }, // Zagreb
  SI: { lat: 46.1, lon: 14.5 }, // Ljubljana
  RS: { lat: 44.8, lon: 20.5 }, // Belgrade
  EE: { lat: 59.4, lon: 24.7 }, // Tallinn
  LV: { lat: 56.9, lon: 24.1 }, // Riga
  LT: { lat: 54.7, lon: 25.3 }, // Vilnius
  BY: { lat: 53.9, lon: 27.6 }, // Minsk
  UA: { lat: 50.4, lon: 30.5 }, // Kyiv
  MD: { lat: 47.0, lon: 28.9 }, // Chișinău
  RU: { lat: 55.75, lon: 37.6 }, // Moscow
  MT: { lat: 35.9, lon: 14.5 }, // Valletta
  CY: { lat: 35.2, lon: 33.4 }, // Nicosia
  MC: { lat: 43.7, lon: 7.4 }, // Monaco

  // Middle East
  AE: { lat: 25.2, lon: 55.3 }, // Dubai
  SA: { lat: 24.7, lon: 46.7 }, // Riyadh
  QA: { lat: 25.3, lon: 51.5 }, // Doha
  KW: { lat: 29.4, lon: 48.0 }, // Kuwait City
  BH: { lat: 26.2, lon: 50.6 }, // Manama
  OM: { lat: 23.6, lon: 58.6 }, // Muscat
  YE: { lat: 15.4, lon: 44.2 }, // Sana'a
  IQ: { lat: 33.3, lon: 44.4 }, // Baghdad
  IR: { lat: 35.7, lon: 51.4 }, // Tehran
  IL: { lat: 32.1, lon: 34.8 }, // Tel Aviv (financial centre)
  PS: { lat: 31.9, lon: 35.2 }, // Ramallah
  JO: { lat: 31.95, lon: 35.9 }, // Amman
  LB: { lat: 33.9, lon: 35.5 }, // Beirut
  SY: { lat: 33.5, lon: 36.3 }, // Damascus
  TR: { lat: 41.0, lon: 28.98 }, // Istanbul (financial centre)

  // Africa
  ZA: { lat: -26.2, lon: 28.0 }, // Johannesburg (financial centre)
  EG: { lat: 30.0, lon: 31.2 }, // Cairo
  NG: { lat: 6.5, lon: 3.4 }, // Lagos
  KE: { lat: -1.3, lon: 36.8 }, // Nairobi
  ET: { lat: 9.0, lon: 38.7 }, // Addis Ababa
  GH: { lat: 5.6, lon: -0.2 }, // Accra
  TZ: { lat: -6.8, lon: 39.3 }, // Dar es Salaam
  UG: { lat: 0.3, lon: 32.6 }, // Kampala
  DZ: { lat: 36.75, lon: 3.06 }, // Algiers
  MA: { lat: 33.97, lon: -6.85 }, // Rabat
  TN: { lat: 36.8, lon: 10.2 }, // Tunis
  LY: { lat: 32.9, lon: 13.2 }, // Tripoli
  SD: { lat: 15.5, lon: 32.6 }, // Khartoum
  AO: { lat: -8.8, lon: 13.2 }, // Luanda
  MU: { lat: -20.2, lon: 57.5 }, // Port Louis

  // Asia
  CN: { lat: 31.2, lon: 121.5 }, // Shanghai (financial centre)
  HK: { lat: 22.3, lon: 114.2 }, // Hong Kong
  TW: { lat: 25.0, lon: 121.6 }, // Taipei
  JP: { lat: 35.7, lon: 139.7 }, // Tokyo
  KR: { lat: 37.6, lon: 127.0 }, // Seoul
  KP: { lat: 39.0, lon: 125.75 }, // Pyongyang
  MN: { lat: 47.9, lon: 106.9 }, // Ulaanbaatar
  IN: { lat: 19.1, lon: 72.9 }, // Mumbai (financial centre)
  PK: { lat: 24.9, lon: 67.0 }, // Karachi (financial centre)
  BD: { lat: 23.8, lon: 90.4 }, // Dhaka
  LK: { lat: 6.9, lon: 79.9 }, // Colombo
  NP: { lat: 27.7, lon: 85.3 }, // Kathmandu
  AF: { lat: 34.6, lon: 69.2 }, // Kabul
  KZ: { lat: 43.2, lon: 76.9 }, // Almaty
  UZ: { lat: 41.3, lon: 69.2 }, // Tashkent
  AZ: { lat: 40.4, lon: 49.9 }, // Baku
  AM: { lat: 40.2, lon: 44.5 }, // Yerevan
  GE: { lat: 41.7, lon: 44.8 }, // Tbilisi
  SG: { lat: 1.35, lon: 103.8 }, // Singapore
  MY: { lat: 3.1, lon: 101.7 }, // Kuala Lumpur
  ID: { lat: -6.2, lon: 106.8 }, // Jakarta
  TH: { lat: 13.75, lon: 100.5 }, // Bangkok
  VN: { lat: 21.0, lon: 105.8 }, // Hanoi
  PH: { lat: 14.6, lon: 121.0 }, // Manila
  MM: { lat: 16.85, lon: 96.2 }, // Yangon
  KH: { lat: 11.6, lon: 104.9 }, // Phnom Penh
  LA: { lat: 18.0, lon: 102.6 }, // Vientiane
  BN: { lat: 4.9, lon: 114.9 }, // Bandar Seri Begawan
  MO: { lat: 22.2, lon: 113.5 }, // Macau

  // Oceania
  AU: { lat: -33.87, lon: 151.2 }, // Sydney (financial centre)
  NZ: { lat: -41.3, lon: 174.8 }, // Wellington
  PG: { lat: -9.5, lon: 147.2 }, // Port Moresby
  FJ: { lat: -18.1, lon: 178.4 }, // Suva
})

// The continent/sub-region → a fallback point, used when computeGlobeSnapshot (news/globe.ts) needs to
// place an item whose resolved region has no per-country centroid (or, for the region-level aggregate
// rows themselves, which are keyed by GeoRegion rather than by country). 'Global' has no fixed point —
// callers route Global/unresolved items to the explicit "Global / unknown" bucket instead of a marker.
export const REGION_CENTROIDS: Readonly<Record<GeoRegion, Centroid>> = Object.freeze({
  'North America': { lat: 45.0, lon: -100.0 },
  'South America': { lat: -15.0, lon: -60.0 },
  Europe: { lat: 50.0, lon: 15.0 },
  'Middle East': { lat: 27.0, lon: 45.0 },
  Africa: { lat: 2.0, lon: 20.0 },
  Asia: { lat: 30.0, lon: 95.0 },
  Oceania: { lat: -25.0, lon: 140.0 },
})
