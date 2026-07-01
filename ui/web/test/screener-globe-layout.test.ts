// Pure layout math for the Screener Globe (lib/screener-globe-layout.ts) — latLonToSphere places a
// lat/lon point on the shell at the right radius and axis orientation, scaleMarkerRadius interpolates a
// count into [MARKER_R_MIN, MARKER_R_MAX] without dividing by zero, and buildGlobeMarkers turns a
// GlobeSnapshot into one positioned+radius-scaled marker per country. No three.js, no DOM — matches the
// module's own "pure geometry" doctrine. Run: npx tsx test/screener-globe-layout.test.ts
import assert from 'node:assert/strict'
import {
  SCREENER_GLOBE,
  latLonToSphere,
  scaleMarkerRadius,
  buildGlobeMarkers,
  type GlobeSnapshotLike,
} from '../src/lib/screener-globe-layout'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const R = SCREENER_GLOBE.R
const dist = (p: { x: number; y: number; z: number }) => Math.hypot(p.x, p.y, p.z)
const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps

// ---- latLonToSphere ----
check('latLonToSphere: every point lands exactly on the sphere shell radius (+ optional bump)', () => {
  const p0 = latLonToSphere(0, 0)
  assert.ok(close(dist(p0), R), `radius ${dist(p0)} should equal SCREENER_GLOBE.R (${R})`)
  const bumped = latLonToSphere(12.3, -45.6, SCREENER_GLOBE.MARKER_BUMP)
  assert.ok(close(dist(bumped), R + SCREENER_GLOBE.MARKER_BUMP), 'a bump pushes the point out to R + bump, still on a sphere centered at the origin')
})
check('latLonToSphere: the north pole (lat=90) sits on +Y; the equator has y=0', () => {
  const north = latLonToSphere(90, 0)
  assert.ok(close(north.y, R), 'lat=90 maps to +Y at radius R (the documented "+Y is north" convention)')
  assert.ok(close(north.x, 0) && close(north.z, 0), 'the pole has no x/z component')
  const eq = latLonToSphere(0, 40)
  assert.ok(close(eq.y, 0), 'the equator (lat=0) has y=0 regardless of longitude')
})
check('latLonToSphere: lon=0 (Greenwich) sits on +Z per the documented orientation convention', () => {
  const p = latLonToSphere(0, 0)
  assert.ok(close(p.z, R), 'lon=0 at the equator lands on +Z at radius R')
  assert.ok(close(p.x, 0))
})
check('latLonToSphere: longitude increases eastward from +Z toward +X (lon=90 → +X)', () => {
  const p = latLonToSphere(0, 90)
  assert.ok(close(p.x, R, 1e-6), 'lon=90 at the equator lands on +X')
  assert.ok(close(p.z, 0, 1e-6))
})

// ---- scaleMarkerRadius ----
check('scaleMarkerRadius: count 0 or a non-positive maxCount collapses to MARKER_R_MIN (no divide-by-zero)', () => {
  assert.equal(scaleMarkerRadius(0, 10), SCREENER_GLOBE.MARKER_R_MIN)
  assert.equal(scaleMarkerRadius(5, 0), SCREENER_GLOBE.MARKER_R_MIN, 'a degenerate maxCount <= 0 never divides by zero')
  assert.equal(scaleMarkerRadius(-3, 10), SCREENER_GLOBE.MARKER_R_MIN, 'a negative count also floors to MARKER_R_MIN')
})
check('scaleMarkerRadius: count == maxCount hits MARKER_R_MAX exactly; interpolates linearly between', () => {
  assert.equal(scaleMarkerRadius(10, 10), SCREENER_GLOBE.MARKER_R_MAX)
  const half = scaleMarkerRadius(5, 10)
  const mid = (SCREENER_GLOBE.MARKER_R_MIN + SCREENER_GLOBE.MARKER_R_MAX) / 2
  assert.ok(close(half, mid, 1e-9), `count at 50% of maxCount should sit at the midpoint radius (got ${half}, expected ${mid})`)
})
check('scaleMarkerRadius: a count above maxCount is clamped to MARKER_R_MAX, never overshoots', () => {
  assert.equal(scaleMarkerRadius(999, 10), SCREENER_GLOBE.MARKER_R_MAX)
})

// ---- buildGlobeMarkers ----
function snapshotWith(countries: GlobeSnapshotLike['countries']): GlobeSnapshotLike {
  return { countries, regions: [], globalUnresolvedCount: 0, total: countries.reduce((s, c) => s + c.count, 0) }
}
check('buildGlobeMarkers: one marker per country, positioned on the shell and radius-scaled by count', () => {
  const snap = snapshotWith([
    { country: 'US', countryName: 'United States', region: 'North America', lat: 38.9, lon: -77.0, count: 10, maxScore: 80, avgScore: 55, topThemes: ['macro'] },
    { country: 'AE', countryName: 'United Arab Emirates', region: 'Middle East', lat: 25.2, lon: 55.3, count: 2, maxScore: 60, avgScore: 60, topThemes: [] },
  ])
  const markers = buildGlobeMarkers(snap)
  assert.equal(markers.length, 2, 'one marker per country aggregate')
  const us = markers.find((m) => m.country === 'US')!
  const ae = markers.find((m) => m.country === 'AE')!
  assert.ok(us && ae)
  assert.ok(close(dist(us.pos), R + SCREENER_GLOBE.MARKER_BUMP), 'marker position sits on the bumped shell radius')
  assert.equal(us.radius, SCREENER_GLOBE.MARKER_R_MAX, 'the busiest country (count == maxCount) gets the largest radius')
  assert.ok(ae.radius < us.radius, 'a less-busy country gets a smaller radius than the busiest one')
  assert.equal(us.countryName, 'United States')
  assert.equal(us.aggregate, snap.countries[0], 'the source aggregate is attached for click/hover reads with no second lookup')
})
check('buildGlobeMarkers: an empty snapshot (no countries) yields no markers, never throws', () => {
  const markers = buildGlobeMarkers(snapshotWith([]))
  assert.deepEqual(markers, [])
})
check('buildGlobeMarkers: regions and globalUnresolvedCount are NOT turned into markers (v1 plots resolved countries only)', () => {
  const snap: GlobeSnapshotLike = {
    countries: [{ country: 'IN', countryName: 'India', region: 'Asia', lat: 19.1, lon: 72.9, count: 3, maxScore: 50, avgScore: 40, topThemes: [] }],
    regions: [{ region: 'Asia', lat: 30, lon: 95, count: 3, maxScore: 50, avgScore: 40 }],
    globalUnresolvedCount: 12,
    total: 15,
  }
  const markers = buildGlobeMarkers(snap)
  assert.equal(markers.length, 1, 'exactly one marker — for the one resolved country, nothing for regions/unresolved')
})

console.log(`\nscreener-globe-layout.test.ts: ${passed} passed`)
