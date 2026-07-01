// GLOBE SNAPSHOT — country/region-level aggregation of the news wire for the Screener Globe view.
//
// Unlike facets.ts (which indexes the WHOLE since-inception archive so dropdown counts reflect the full
// history), the globe wants "what's live now": it walks a bounded, recent window (`sinceDays`, default 30,
// capped 400) via the same listFirehoseDates/readDayItems the facet index uses, and re-aggregates on every
// TTL miss rather than maintaining a standing row index. A globe view is opened far less often than a
// facet dropdown, and its own filters (sinceDays, portfolioRelevant) change the window itself, so a
// pre-built all-history row cache would buy little and cost a lot of memory.
//
// FAN-OUT is the one behavior that has no equivalent in facets.ts: an item can name MORE than one country
// (news/geography.ts resolveEventGeography, e.g. a US-Iran sanctions headline → ['US','IR']), and every
// distinct country it names gets its own increment — a two-country item lights up both markers, not just
// one. Items that resolve to no country at all ([]) are never dropped: they are counted in
// `globalUnresolvedCount`, the explicit "Global / unknown" bucket (CLAUDE.md §3/§8 — an honest miss beats
// a forced bucket, and it must still be visible, not silently discarded).

import fs from 'node:fs'
import path from 'node:path'
import { listFirehoseDates, readDayItems } from './feed'
import { matchesFeedFilters, type FeedFilterContext, type FeedFilterQuery } from './feed-filter'
import { countryName, regionOfCountry, type GeoRegion } from './geography'
import { COUNTRY_CENTROIDS, REGION_CENTROIDS, type Centroid } from './geo-centroids'
import type { FeedItem } from './types'

/** The globe's query: every existing feed-filter dimension, plus the two the globe adds. */
export interface GlobeQuery extends FeedFilterQuery {
  sinceDays?: number // recency window in days; default 30, capped at MAX_DAYS (400)
  portfolioRelevant?: boolean // restrict to events whose guessed company has an existing analyses/<TICKER> run
}

/** A capped, de-identified pointer into the wire — the panel's "sample events" list reads these. */
export interface GlobeEventRef {
  event_id: string
  headline: string
  headline_en?: string | null
  ts: string
  triage_score: number
  source_name: string
}

export interface GlobeCountryAggregate {
  country: string // ISO alpha-2
  countryName: string
  region: GeoRegion
  lat: number
  lon: number
  count: number
  maxScore: number
  avgScore: number
  topThemes: string[] // event_types, most frequent first, capped
  sample: GlobeEventRef[] // capped sample of the highest-priority matching events
}

export interface GlobeRegionAggregate {
  region: GeoRegion
  lat: number
  lon: number
  count: number
  maxScore: number
  avgScore: number
}

export interface GlobeSnapshot {
  countries: GlobeCountryAggregate[]
  regions: GlobeRegionAggregate[]
  globalUnresolvedCount: number // items with geography_country == [] — the honest "Global / unknown" bucket
  total: number // items matching the full active filter (countries + unresolved)
  sinceDays: number // the window actually applied (after clamping)
  builtAt: string
}

const TTL_MS = 5 * 60 * 1000 // shorter than facets' 10 min — the globe wants fresher placement
const DEFAULT_SINCE_DAYS = 30
const MAX_DAYS = 400
const MAX_LINES = 500_000 // a bounded recent-window scan, not facets.ts's full-archive walk
const TOP_THEMES_CAP = 5
const SAMPLE_CAP = 8

// keyed by repoRoot|archiveDir|sinceDays|portfolioRelevant — a distinct window/context gets its own entry
const cache = new Map<string, { snapshot: GlobeSnapshot; builtAt: number }>()

/** Drop the cached snapshot(s) — call from the same ingest-cycle hook that already calls invalidateFacets(),
 *  so a fresh cycle's new items/countries show up before the TTL lapses. */
export function invalidateGlobeSnapshot(): void { cache.clear() }

/** The analyses/<TICKER>_<timestamp> folder-existence check `portfolioRelevant` filters against — the
 *  same "prior coverage" pattern data-status.ts's latestDecision() and roster.ts's findLatestRunRoot()
 *  already use (a ticker is "covered" when at least one analyses/<TICKER>_* run folder exists). */
function coveredTickersFrom(analysesDir: string): ReadonlySet<string> {
  const tickers = new Set<string>()
  try {
    for (const name of fs.readdirSync(analysesDir)) {
      const i = name.indexOf('_')
      if (i > 0) tickers.add(name.slice(0, i).toUpperCase())
    }
  } catch { /* analyses/ missing — empty coverage, never throw */ }
  return tickers
}

interface Bucket {
  count: number
  maxScore: number
  scoreSum: number
  themeCounts: Map<string, number>
  // capped max-heap-lite: keep the SAMPLE_CAP highest-triage_score items seen, sorted desc
  sample: GlobeEventRef[]
}

function newBucket(): Bucket {
  return { count: 0, maxScore: 0, scoreSum: 0, themeCounts: new Map(), sample: [] }
}

function addToBucket(b: Bucket, it: FeedItem): void {
  b.count++
  const score = typeof it.triage_score === 'number' ? it.triage_score : 0
  b.maxScore = Math.max(b.maxScore, score)
  b.scoreSum += score
  for (const t of it.event_types || []) b.themeCounts.set(t, (b.themeCounts.get(t) || 0) + 1)
  // insert into the capped sample, kept sorted by score desc, then drop the tail past SAMPLE_CAP
  const ref: GlobeEventRef = {
    event_id: it.event_id,
    headline: it.headline,
    headline_en: it.headline_en,
    ts: it.ts,
    triage_score: score,
    source_name: it.source_name,
  }
  const pos = b.sample.findIndex((r) => r.triage_score < score)
  if (pos === -1) b.sample.push(ref)
  else b.sample.splice(pos, 0, ref)
  if (b.sample.length > SAMPLE_CAP) b.sample.length = SAMPLE_CAP
}

function topThemes(b: Bucket): string[] {
  return [...b.themeCounts.entries()].sort((a, z) => z[1] - a[1] || a[0].localeCompare(z[0])).slice(0, TOP_THEMES_CAP).map(([k]) => k)
}

function centroidFor(cc: string): Centroid | null {
  return COUNTRY_CENTROIDS[cc] || null
}

function buildSnapshot(repoRoot: string, q: GlobeQuery, archiveDir: string, sinceDays: number, nowMs: number): GlobeSnapshot {
  const dates = listFirehoseDates(repoRoot, archiveDir).slice(0, sinceDays)
  // resolved ONCE per snapshot build (not per item) — the filesystem check `portfolioRelevant` needs,
  // handed to matchesFeedFilters as ctx so the predicate itself stays pure/testable
  const ctx: FeedFilterContext = q.portfolioRelevant ? { coveredTickers: coveredTickersFrom(path.join(repoRoot, 'analyses')) } : {}

  const countryBuckets = new Map<string, Bucket>()
  let globalUnresolvedCount = 0
  let total = 0
  let lines = 0

  outer: for (const date of dates) {
    const { items, lines: n } = readDayItems(repoRoot, date, archiveDir)
    lines += n
    for (const it of items) {
      if (!matchesFeedFilters(it, q, ctx)) continue
      total++
      const countries = it.geography_country ?? (it.country ? [it.country] : [])
      if (!countries.length) {
        globalUnresolvedCount++
        continue
      }
      // FAN-OUT: increment every distinct country the item names, not just the first
      for (const cc of new Set(countries)) {
        let b = countryBuckets.get(cc)
        if (!b) { b = newBucket(); countryBuckets.set(cc, b) }
        addToBucket(b, it)
      }
    }
    if (lines >= MAX_LINES) break outer
  }

  const countries: GlobeCountryAggregate[] = [...countryBuckets.entries()]
    .map(([cc, b]) => {
      const region = regionOfCountry(cc)
      const centroid = centroidFor(cc) || (region ? REGION_CENTROIDS[region] : null)
      if (!region || !centroid) return null // unmapped code (shouldn't happen off the shared vocabulary) — skip rather than mis-place
      return {
        country: cc,
        countryName: countryName(cc),
        region,
        lat: centroid.lat,
        lon: centroid.lon,
        count: b.count,
        maxScore: b.maxScore,
        avgScore: b.count ? b.scoreSum / b.count : 0,
        topThemes: topThemes(b),
        sample: b.sample,
      }
    })
    .filter((x): x is GlobeCountryAggregate => x !== null)
    .sort((a, z) => z.count - a.count || a.country.localeCompare(z.country))

  // region rollup — derived from the same per-country buckets, so it always agrees with the country list
  const regionBuckets = new Map<GeoRegion, { count: number; maxScore: number; scoreSum: number }>()
  for (const c of countries) {
    let r = regionBuckets.get(c.region)
    if (!r) { r = { count: 0, maxScore: 0, scoreSum: 0 }; regionBuckets.set(c.region, r) }
    r.count += c.count
    r.maxScore = Math.max(r.maxScore, c.maxScore)
    r.scoreSum += c.avgScore * c.count
  }
  const regions: GlobeRegionAggregate[] = [...regionBuckets.entries()]
    .map(([region, r]) => ({ region, lat: REGION_CENTROIDS[region].lat, lon: REGION_CENTROIDS[region].lon, count: r.count, maxScore: r.maxScore, avgScore: r.count ? r.scoreSum / r.count : 0 }))
    .sort((a, z) => z.count - a.count || a.region.localeCompare(z.region))

  return { countries, regions, globalUnresolvedCount, total, sinceDays, builtAt: new Date(nowMs).toISOString() }
}

/** Compute (or serve from a 5-minute TTL cache) the Globe view's country/region aggregation for query `q`. */
export function computeGlobeSnapshot(repoRoot: string, q: GlobeQuery, opts: { archiveDir?: string; now?: () => Date } = {}): GlobeSnapshot {
  const now = opts.now || (() => new Date())
  const nowMs = now().getTime()
  const archiveDir = opts.archiveDir || ''
  const sinceDays = Math.min(MAX_DAYS, Math.max(1, Math.floor(q.sinceDays || DEFAULT_SINCE_DAYS)))
  const q2: GlobeQuery = { ...q, sinceDays }
  const key = `${repoRoot}|${archiveDir}|${sinceDays}|${JSON.stringify({ ...q2, sinceDays: undefined })}`
  const hit = cache.get(key)
  if (hit && nowMs - hit.builtAt < TTL_MS) return hit.snapshot
  const snapshot = buildSnapshot(repoRoot, q2, archiveDir, sinceDays, nowMs)
  cache.set(key, { snapshot, builtAt: nowMs })
  return snapshot
}
