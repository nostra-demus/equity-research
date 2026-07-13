// Archive-wide FACETS — the available geographies / sectors / sub-sectors / sources / themes, WITH COUNTS,
// over the WHOLE since-inception archive (not the 2-day window). This is what lets the cockpit dropdowns
// reflect the archive: "United Arab Emirates (3)" appears because the archive holds 3 such items, even
// when none are in the last two days.
//
// Backed by a lazily-built, TTL-cached in-memory index of compact per-item rows (one gics/geo pass per
// item, amortised across every facets call in the TTL window). Counts honour the ACTIVE filter context:
// each facet excludes its OWN dimension (so "if I pick this country, N results"). The free-text filter is
// not a facet dimension and is ignored here. Build is bounded (days + lines) so it can't run away.

import { listFirehoseDates, readDayItems } from './feed'
import { gicsOf, GICS_SECTORS, gicsSubSectorsFor } from './gics'
import { COUNTRIES, GEO_REGIONS, regionOfCountry } from './geography'
import { topicLabel } from './topics'
import { scheduledEventLabel } from './schedule'
import type { FeedFilterQuery } from './feed-filter'

// sub-sector label → its parent GICS sector, for the drill-down grouping (built once from the taxonomy)
const SUBSECTOR_PARENT = new Map<string, string>(
  GICS_SECTORS.flatMap((s) => gicsSubSectorsFor(s).map((sub) => [sub, s] as const)),
)

interface FacetRow {
  country: string | null
  geoRegion: string | null
  sectors: string[]
  subSectors: string[]
  source: string
  themes: string[]
  size: string
  band: string
  linkage: string
  scope: string
  commodities: string[]
  topics: string[]
  scheduledEvents: string[]
}

export interface FacetCount { key: string; label: string; count: number; parent?: string }
export interface Facets {
  countries: FacetCount[] // key = ISO alpha-2, parent = continent
  regions: FacetCount[] // continents
  sectors: FacetCount[]
  subSectors: FacetCount[] // parent = sector
  sources: FacetCount[]
  themes: FacetCount[]
  scopes: FacetCount[] // scope buckets (news/scope.ts ScopeId)
  commodities: FacetCount[] // canonical commodity subjects (news/commodities.ts) — key = profile heading
  topics: FacetCount[] // CapIQ-style subject topics (news/topics.ts) — key = topic id, label = plain name
  scheduledEvents: FacetCount[] // forward/scheduled corporate events (news/schedule.ts) — the §17 catalyst axis
  total: number // items matching the FULL active filter
  builtThroughDate: string | null // oldest day in the index — "searched all history back to <date>"
  builtAt: string
}

const TTL_MS = 10 * 60 * 1000
const MAX_DAYS = 400
const MAX_LINES = 1_500_000

// keyed by repoRoot|archiveDir so distinct repos (and tests) never share an index
const cache = new Map<string, { rows: FacetRow[]; builtThroughDate: string | null; builtAt: number }>()

const bandOf = (it: { band?: string; triage_score?: number }): string =>
  it.band || (typeof it.triage_score === 'number' ? (it.triage_score >= 70 ? 'pick' : it.triage_score >= 40 ? 'watch' : 'drop') : '')

function buildRows(repoRoot: string, archiveDir: string, nowMs: number): { rows: FacetRow[]; builtThroughDate: string | null } {
  const dates = listFirehoseDates(repoRoot, archiveDir).slice(0, MAX_DAYS)
  const rows: FacetRow[] = []
  let lines = 0
  let builtThroughDate: string | null = null
  for (const date of dates) {
    const { items, lines: n } = readDayItems(repoRoot, date, archiveDir)
    lines += n
    if (items.length) builtThroughDate = date // dates are newest-first, so the last with data is the oldest
    for (const it of items) {
      const g = gicsOf(it)
      const country = it.country || null
      rows.push({
        country,
        geoRegion: regionOfCountry(country),
        sectors: [...g.sectors],
        subSectors: [...g.subSectors],
        source: it.source_name || '',
        themes: it.event_types || [],
        size: it.size_bucket || 'unknown',
        band: bandOf(it),
        linkage: it.issuer_linkage || '',
        scope: it.scope || '', // hydrate already ran in readDayItems, so these are always filled
        commodities: it.commodities || [],
        topics: it.topics || [], // derived on read in hydrate (news/topics.ts) — always an array
        scheduledEvents: it.scheduled_events || [], // derived on read in hydrate (news/schedule.ts)
      })
    }
    if (lines >= MAX_LINES) break
  }
  cache.set(`${repoRoot}|${archiveDir}`, { rows, builtThroughDate, builtAt: nowMs })
  return { rows, builtThroughDate }
}

function getRows(repoRoot: string, archiveDir: string, now: () => Date): { rows: FacetRow[]; builtThroughDate: string | null } {
  const nowMs = now().getTime()
  const hit = cache.get(`${repoRoot}|${archiveDir}`)
  if (hit && nowMs - hit.builtAt < TTL_MS) return { rows: hit.rows, builtThroughDate: hit.builtThroughDate }
  return buildRows(repoRoot, archiveDir, nowMs)
}

/** Drop the cached index — call from an ingest-cycle hook so a new day shows up before the TTL lapses. */
export function invalidateFacets(): void { cache.clear() }

// row matches a filter (structured dims only; free text is not a facet dimension)
function rowMatches(r: FacetRow, q: FeedFilterQuery): boolean {
  if (q.themes && q.themes.length > 0 && !r.themes.some((t) => q.themes!.includes(t))) return false
  if (q.country && (r.country || '') !== q.country) return false
  if (q.geoRegion && r.geoRegion !== q.geoRegion) return false
  if (q.source && r.source !== q.source) return false
  if (q.band && r.band !== q.band) return false
  if (q.size && r.size !== q.size) return false
  if (q.linkage && r.linkage !== q.linkage) return false
  if (q.gicsSector && !r.sectors.includes(q.gicsSector)) return false
  if (q.gicsSubSector && !r.subSectors.includes(q.gicsSubSector)) return false
  if (q.scope && r.scope !== q.scope) return false
  if (q.commodities && q.commodities.length > 0 && !r.commodities.some((c) => q.commodities!.includes(c))) return false
  if (q.topics && q.topics.length > 0 && !r.topics.some((t) => q.topics!.includes(t))) return false
  if (q.scheduledEvents && q.scheduledEvents.length > 0 && !r.scheduledEvents.some((s) => q.scheduledEvents!.includes(s))) return false
  if (q.wireScope && r.scope !== q.wireScope && r.commodities.length === 0) return false
  return true
}

// a filter with some keys cleared — so a facet never constrains on its own dimension
const without = (q: FeedFilterQuery, ...keys: (keyof FeedFilterQuery)[]): FeedFilterQuery => {
  const c: FeedFilterQuery = { ...q }
  for (const k of keys) delete c[k]
  return c
}
const tally = (rows: FacetRow[], pick: (r: FacetRow) => string[]): Map<string, number> => {
  const m = new Map<string, number>()
  for (const r of rows) for (const k of pick(r)) if (k) m.set(k, (m.get(k) || 0) + 1)
  return m
}
const sortCounts = (a: FacetCount, b: FacetCount) => b.count - a.count || a.label.localeCompare(b.label)

/** Compute every facet's counts under the active filter `q` (each facet excludes its own dimension). */
export function computeFacets(repoRoot: string, q: FeedFilterQuery, opts: { archiveDir?: string; now?: () => Date } = {}): Facets {
  const now = opts.now || (() => new Date())
  const { rows, builtThroughDate } = getRows(repoRoot, opts.archiveDir || '', now)

  const countryRows = rows.filter((r) => rowMatches(r, without(q, 'country'))) // keep geoRegion so we list within the picked continent
  const regionRows = rows.filter((r) => rowMatches(r, without(q, 'country', 'geoRegion')))
  const sectorRows = rows.filter((r) => rowMatches(r, without(q, 'gicsSector', 'gicsSubSector')))
  const subSectorRows = rows.filter((r) => rowMatches(r, without(q, 'gicsSubSector')))
  const sourceRows = rows.filter((r) => rowMatches(r, without(q, 'source')))
  const themeRows = rows.filter((r) => rowMatches(r, without(q, 'themes')))
  const scopeRows = rows.filter((r) => rowMatches(r, without(q, 'scope')))
  const commodityRows = rows.filter((r) => rowMatches(r, without(q, 'commodities')))
  const topicRows = rows.filter((r) => rowMatches(r, without(q, 'topics')))
  const scheduledEventRows = rows.filter((r) => rowMatches(r, without(q, 'scheduledEvents')))

  const countryCounts = tally(countryRows, (r) => (r.country ? [r.country] : []))
  const regionCounts = tally(regionRows, (r) => (r.geoRegion ? [r.geoRegion] : []))
  const sectorCounts = tally(sectorRows, (r) => r.sectors)
  const subSectorCounts = tally(subSectorRows, (r) => r.subSectors)
  const sourceCounts = tally(sourceRows, (r) => [r.source])
  const themeCounts = tally(themeRows, (r) => r.themes)
  const scopeCounts = tally(scopeRows, (r) => (r.scope ? [r.scope] : []))
  const commodityCounts = tally(commodityRows, (r) => r.commodities)
  const topicCounts = tally(topicRows, (r) => r.topics)
  const scheduledEventCounts = tally(scheduledEventRows, (r) => r.scheduledEvents)

  const countries: FacetCount[] = [...countryCounts].map(([key, count]) => ({ key, label: COUNTRIES[key]?.name || key, count, parent: regionOfCountry(key) || undefined })).sort(sortCounts)
  const regions: FacetCount[] = GEO_REGIONS.map((g) => ({ key: g, label: g, count: regionCounts.get(g) || 0 })).filter((f) => f.count > 0).sort(sortCounts)
  const sectors: FacetCount[] = [...sectorCounts].map(([key, count]) => ({ key, label: key, count })).sort(sortCounts)
  const subSectors: FacetCount[] = [...subSectorCounts].map(([key, count]) => ({ key, label: key, count, parent: SUBSECTOR_PARENT.get(key) })).sort(sortCounts)
  const sources: FacetCount[] = [...sourceCounts].map(([key, count]) => ({ key, label: key, count })).sort(sortCounts)
  const themes: FacetCount[] = [...themeCounts].map(([key, count]) => ({ key, label: key, count })).sort(sortCounts)
  const scopes: FacetCount[] = [...scopeCounts].map(([key, count]) => ({ key, label: key, count })).sort(sortCounts)
  const commodities: FacetCount[] = [...commodityCounts].map(([key, count]) => ({ key, label: key, count })).sort(sortCounts)
  const topics: FacetCount[] = [...topicCounts].map(([key, count]) => ({ key, label: topicLabel(key), count })).sort(sortCounts)
  const scheduledEvents: FacetCount[] = [...scheduledEventCounts].map(([key, count]) => ({ key, label: scheduledEventLabel(key), count })).sort(sortCounts)

  const total = rows.filter((r) => rowMatches(r, q)).length
  return { countries, regions, sectors, subSectors, sources, themes, scopes, commodities, topics, scheduledEvents, total, builtThroughDate, builtAt: now().toISOString() }
}
