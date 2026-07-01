// Pure geometry for the Screener Globe view — same doctrine as globe-consts.ts: NO three.js import, so
// this stays in the main bundle's reach and is testable without WebGL. ScreenerGlobeScene converts the
// plain {x,y,z} points this module returns into THREE.Vector3/Mesh positions at mount.
//
// This is a DIFFERENT sphere from the research globe's (lib/globe-layout.ts computeGlobeLayout): that one
// places module/agent orbs by an abstract Fibonacci distribution with no real-world meaning. This one maps
// real latitude/longitude (from the server's geo-centroids.ts, itself mirrored loosely below) onto the
// same GLOBE.R shell, so a marker's position on screen corresponds to an actual place on Earth.
//
// Orientation convention (a judgement call — nothing upstream constrains it, so it is documented here):
// +Y is the north pole (matches globe-consts.ts's northBasis(), which already treats +Y as "true north"
// for the research globe's module columns). Longitude 0° (Greenwich) sits on +Z, the axis the research
// globe's camera sits on at rest (GlobeScene.tsx's SPHERE_CAM = (0, 2.5, 27), looking at the origin) —
// so an unrotated screener globe shows the Prime Meridian facing the viewer, same as the research globe
// shows its theta=0 seam facing the camera. Longitude increases eastward, which in this right-handed
// Y-up frame runs from +Z toward +X (i.e. x = sin(lon), z = cos(lon), both scaled by cos(lat)). The
// camera is user-rotatable (OrbitControls, matching the research globe), so this choice affects only the
// REST orientation, never correctness — any relative country-to-country geometry is invariant to it.

import { onSphere, type V3 } from '../components/swarm/globe/globe-consts'

export const SCREENER_GLOBE = {
  R: 10, // sphere radius (world units) — matches GLOBE.R so the two globes read at the same visual scale
  MARKER_BUMP: 0.14, // markers lifted just off the shell so they never z-fight it (mirrors GLOBE.BUMP_SURFACE)
  MARKER_R_MIN: 0.12, // smallest marker radius (a country with the lowest non-zero count in the snapshot)
  MARKER_R_MAX: 0.55, // largest marker radius (the country with maxCount)
}

// ---- minimal local structural types, shaped like the server's GlobeSnapshot (ui/server/src/news/globe.ts) ----
// The web side never imports server code (see lib/types.ts's FeedItem for the same convention) — these are
// intentionally the smallest shape buildGlobeMarkers actually reads, not a full mirror of every field the
// server response carries. A later phase that wires lib/api.ts's screenerGlobe() call can widen these (or
// re-point them at a fuller lib/types.ts mirror) without changing buildGlobeMarkers's own logic.
export interface GlobeCountryAggregateLike {
  country: string // ISO alpha-2
  countryName: string
  region: string
  lat: number
  lon: number
  count: number
  maxScore: number
  avgScore: number
  topThemes: string[]
}
export interface GlobeRegionAggregateLike {
  region: string
  lat: number
  lon: number
  count: number
  maxScore: number
  avgScore: number
}
export interface GlobeSnapshotLike {
  countries: GlobeCountryAggregateLike[]
  regions: GlobeRegionAggregateLike[]
  globalUnresolvedCount: number
  total: number
}

// One placed marker on the shell — everything ScreenerGlobeScene needs to draw + hit-test a country dot,
// with the source aggregate attached so click/hover can read count/score/themes without a second lookup.
export interface GlobeMarker {
  country: string // ISO alpha-2 — react key + the id scSelectGlobeCountry() will key off
  countryName: string
  region: string
  pos: V3 // on the SCREENER_GLOBE.R shell, bumped off the surface
  radius: number // marker mesh radius, scaled by count (see scaleMarkerRadius)
  count: number
  maxScore: number
  avgScore: number
  topThemes: string[]
  aggregate: GlobeCountryAggregateLike
}

/** Project a lat/lon (degrees) onto the globe shell at radius R (+ an optional outward bump). See the
 *  orientation note at the top of this file for the axis convention. */
export function latLonToSphere(lat: number, lon: number, bump = 0): V3 {
  const latRad = (lat * Math.PI) / 180
  const lonRad = (lon * Math.PI) / 180
  const cosLat = Math.cos(latRad)
  const p: V3 = {
    x: cosLat * Math.sin(lonRad),
    y: Math.sin(latRad),
    z: cosLat * Math.cos(lonRad),
  }
  return onSphere(p, SCREENER_GLOBE.R + bump)
}

/** Scale a country's marker radius by its event count, relative to the busiest country in the current
 *  snapshot (maxCount) — linear interpolation between MARKER_R_MIN and MARKER_R_MAX. A count of 0 (or a
 *  degenerate maxCount <= 0) collapses to MARKER_R_MIN rather than dividing by zero or going negative. */
export function scaleMarkerRadius(count: number, maxCount: number): number {
  const { MARKER_R_MIN, MARKER_R_MAX } = SCREENER_GLOBE
  if (maxCount <= 0 || count <= 0) return MARKER_R_MIN
  const t = Math.max(0, Math.min(1, count / maxCount))
  return MARKER_R_MIN + (MARKER_R_MAX - MARKER_R_MIN) * t
}

/** Build one marker per country aggregate in the snapshot, positioned + radius-scaled and ready for
 *  ScreenerGlobeScene to render. Pure — same snapshot in, same markers out, no store/DOM/three.js touched.
 *  Regions and globalUnresolvedCount are intentionally NOT turned into markers here: v1 only plots
 *  resolved countries on the sphere (per the plan's "Global/unknown" bucket living in the fallback list's
 *  explicit row, not as a fake marker with no real coordinate). */
export function buildGlobeMarkers(snapshot: GlobeSnapshotLike): GlobeMarker[] {
  const maxCount = snapshot.countries.reduce((m, c) => Math.max(m, c.count), 0)
  return snapshot.countries.map((c) => ({
    country: c.country,
    countryName: c.countryName,
    region: c.region,
    pos: latLonToSphere(c.lat, c.lon, SCREENER_GLOBE.MARKER_BUMP),
    radius: scaleMarkerRadius(c.count, maxCount),
    count: c.count,
    maxScore: c.maxScore,
    avgScore: c.avgScore,
    topThemes: c.topThemes,
    aggregate: c,
  }))
}
