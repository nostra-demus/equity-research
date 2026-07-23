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
import { filterCompanies } from './entities'
import { companyClauseSet, listingConflicts, nameOccurs, type FeedFilterQuery } from './feed-filter'

// the most-mentioned companies to return for the ticker autofill — bounds the payload; a rarer symbol the
// list omits still filters, because CompanyFilter falls back to applying a free-typed ticker directly.
const MAX_COMPANY_FACETS = 1000
// other spellings kept per company (beyond the primary `name`) — bounds the payload; a spelling this cuts
// is still a rare tail (the "best" name already covers the most-mentioned form).
const MAX_ALIASES = 5

const normCompany = (s: unknown): string =>
  String(s ?? '').toLowerCase().replace(/\s+/g, ' ').replace(/[.,]/g, '').replace(/\(.*?\)/g, '').replace(/^the /, '').trim()

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
  // scrubbed of country/agency guesses (entities.ts). listing_country carried through so alias aggregation
  // can tell two DIFFERENT companies that happen to share a ticker letters-for-letters on different
  // exchanges (e.g. CAT: Caterpillar on NYSE vs Catapult Group International on ASX) apart — see
  // buildCompanyFacet's `compatibleCountries` (Codex review, PR #319).
  companies: { ticker: string | null; name: string; listingCountry: string | null }[]
}

export interface FacetCount { key: string; label: string; count: number; parent?: string }
// A distinct company on the wire + its archive mention count — the source for the ticker autofill.
// `aliases`: other spellings the archive has tagged for the SAME company identity (e.g. a short form like
// "Amazon" alongside the more-common "Amazon.com Inc.") — capped, most-mentioned first, excludes `name`
// itself. An UNTAGGED item using one of these spellings would otherwise be invisible to a pick that only
// tested the single "best" name (Codex review, PR #317): the picked suggestion now carries every observed
// spelling so the headline/company-blob match tests each one, not just the most common.
// `listingCountry`: the definite (non-null) listing_country evidence for this identity, when the archive's
// tagging agrees on exactly one — null when unknown/mixed. Two mentions sharing ticker LETTERS but proven
// (by disagreeing definite countries) to be different issuers are split into SEPARATE CompanyFacet entries
// by buildCompanyFacet (e.g. NYSE:CAT Caterpillar vs ASX:CAT Catapult Group International) — this field is
// what lets a pick, and matchesCompany's ticker check, tell them apart (Codex review, PR #319).
export interface CompanyFacet { ticker: string | null; name: string; count: number; aliases: string[]; listingCountry: string | null }
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
  companies: CompanyFacet[] // distinct companies (deduped by ticker) with mention counts — the ticker autofill
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
        // scrubbed of country/agency/junk guesses (entities.ts) so the autofill only offers investable firms
        companies: filterCompanies(it.companies).map((c) => ({ ticker: c.ticker || null, name: c.name, listingCountry: c.listing_country || null })),
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
  if (companyClauseSet(q.company)) {
    const t = (q.company!.ticker || '').toUpperCase()
    const names = [q.company!.name, ...(q.company!.aliases || [])].filter((s): s is string => !!s).map((s) => s.toLowerCase())
    const tickerHit = !!t && r.companies.some((c) => (c.ticker || '').toUpperCase() === t && !listingConflicts(q.company!.listingCountry, c.listingCountry))
    // A facet row carries no headline, so the name clause is approximated over the company blob (name +
    // ticker) only — enough for the counts shown next to OTHER facets while a company is picked. The
    // authoritative name match (which also scans the headline) is matchesFeedFilters at the search site.
    // Same whole-word matcher as the search site, so the approximation differs only by the missing headline.
    // Tests every alias too (not just the picked "best" spelling), so the count stays consistent with the
    // search results it's shown alongside.
    const nameHit = names.length > 0 && r.companies.some((c) => names.some((n) => nameOccurs(`${c.name} ${c.ticker || ''}`.toLowerCase(), n)))
    if (!tickerHit && !nameHit) return false
  }
  return true
}

// Is `country` (a single mention's listing_country) consistent with a cluster's accumulated evidence?
// Unknown (null) never conflicts with anything — it neither proves nor disproves the cluster's identity.
// Once a cluster has adopted ONE definite country, a mention with a DIFFERENT definite country cannot join
// it (that is precisely how two same-ticker-letters issuers on different exchanges get told apart).
const countryCompatible = (clusterCountries: Set<string | null>, country: string | null): boolean => {
  if (country == null) return true
  const known = [...clusterCountries].filter((c): c is string => c != null)
  return known.length === 0 || known.includes(country)
}

interface CompanyCluster {
  ticker: string | null
  // per-spelling mention count + the listing countries seen with THAT spelling — learned from the WHOLE
  // archive (allRows), never scoped to a transient other-filter context (Codex review, PR #319: aliases
  // must not disappear just because the user also has e.g. a country/sector filter active).
  names: Map<string, { count: number; countries: Set<string | null> }>
  countries: Set<string | null> // union across every mention in this cluster — see countryCompatible
  rows: number // mentions AMONG companyRows only — the exposed, filter-context-scoped count
}

/** Dedup the archive's tagged companies into an autofill list. Keyed by ticker (upcased) when known — else
 *  a normalized name — so a name-only guess collapses into its tickered sibling (learned across ALL rows).
 *  Within one ticker key, mentions are further split into listing-identity CLUSTERS: a mention only joins a
 *  cluster when its listing_country doesn't contradict what the cluster already knows, so two real, distinct
 *  issuers that happen to reuse the same ticker letters on different exchanges (the archive has both NYSE:CAT
 *  Caterpillar and ASX:CAT Catapult Group International) become two separate CompanyFacet entries instead of
 *  one merged, ambiguous one (Codex review, PR #319 — this used to only gate the ALIAS list, leaving the
 *  underlying ticker match itself still willing to accept either issuer's tagged items).
 *  `count` is the number of matching rows mentioning the company; the display name is its most-used spelling. */
function buildCompanyFacet(companyRows: FacetRow[], allRows: FacetRow[]): CompanyFacet[] {
  const companyRowSet = new Set(companyRows)
  // Learn name→ticker, but only for names that map to exactly ONE ticker across the archive. A name seen
  // under two different tickers is ambiguous — folding a name-only mention into either would credit it to
  // the wrong company and inflate that company's count, so such names are left un-folded (their own N: key).
  const nameTickers = new Map<string, Set<string>>()
  for (const r of allRows) for (const c of r.companies) {
    if (!c.ticker) continue
    const nn = normCompany(c.name)
    if (!nn) continue
    let s = nameTickers.get(nn)
    if (!s) { s = new Set<string>(); nameTickers.set(nn, s) }
    s.add(c.ticker.toUpperCase())
  }
  const nameToTicker = new Map<string, string>()
  for (const [nn, tks] of nameTickers) if (tks.size === 1) nameToTicker.set(nn, [...tks][0])

  // ONE pass over the WHOLE archive (allRows) builds identity clusters (names, aliases, listing country) —
  // so alias eligibility never depends on which other filters happen to be active. `rows` (the exposed
  // count) increments only for rows that are ALSO in the active-filter-scoped companyRows subset.
  const clustersByBase = new Map<string, CompanyCluster[]>()
  for (const r of allRows) {
    const inFilteredContext = companyRowSet.has(r)
    const seen = new Map<string, { ticker: string | null; name: string; country: string | null }>() // one credit per key per row
    for (const c of r.companies) {
      const nn = normCompany(c.name)
      if (!nn) continue
      const tk = (c.ticker && c.ticker.toUpperCase()) || nameToTicker.get(nn) || ''
      const baseKey = tk ? `T:${tk}` : `N:${nn}`
      if (!seen.has(baseKey)) seen.set(baseKey, { ticker: tk || null, name: c.name, country: c.listingCountry })
    }
    for (const [baseKey, meta] of seen) {
      let clusters = clustersByBase.get(baseKey)
      if (!clusters) { clusters = []; clustersByBase.set(baseKey, clusters) }
      let cluster = clusters.find((cl) => countryCompatible(cl.countries, meta.country))
      if (!cluster) {
        cluster = { ticker: meta.ticker, names: new Map(), countries: new Set(), rows: 0 }
        clusters.push(cluster)
      }
      if (inFilteredContext) cluster.rows += 1
      const nm = cluster.names.get(meta.name) || { count: 0, countries: new Set<string | null>() }
      nm.count += 1
      nm.countries.add(meta.country)
      cluster.names.set(meta.name, nm)
      cluster.countries.add(meta.country)
      if (!cluster.ticker && meta.ticker) cluster.ticker = meta.ticker
    }
  }

  const out: CompanyFacet[] = []
  for (const clusters of clustersByBase.values()) {
    for (const cluster of clusters) {
      if (cluster.rows === 0) continue // no mention survives the active filter context — omit, as before
      const tickerUpper = (cluster.ticker || '').toUpperCase()
      // Pick the primary display/free-text name from the most-tagged spelling — but SKIP a spelling that is
      // just the bare ticker SYMBOL (the archive sometimes tags the ticker AS the name more often than any
      // real spelling — "CAT" for Catapult). That symbol is matched precisely by the exact-ticker clause; if
      // it became the primary `name` it would ALSO free-text match an ordinary short word ("cat", "all") in
      // unrelated headlines — the same harm the alias list below already guards against, but the primary name
      // used to escape it (Codex re-review, PR #319). The skip is case-SENSITIVE against the uppercase ticker,
      // so it drops the symbol form ("CAT") yet keeps a real mixed-case name that merely shares the letters
      // ("Meta" for ticker META). Fall back to the ticker spelling only when NO real-name spelling exists, so
      // a company only ever tagged by its symbol still gets a display name (exact-ticker still carries its matching).
      let name = ''
      let best = -1
      for (const [nm, v] of cluster.names) {
        if (nm === tickerUpper) continue
        if (v.count > best || (v.count === best && nm.length > name.length)) { best = v.count; name = nm }
      }
      if (!name) for (const [nm, v] of cluster.names) if (v.count > best) { best = v.count; name = nm }
      // every OTHER spelling in this (already listing-consistent) cluster, most-mentioned first, capped —
      // EXCLUDING a spelling that is just the ticker symbol itself (the archive sometimes records a ticker
      // as an alternate "name": e.g. "CAT" for Catapult, "ALL" for Allstate). Exact-ticker matching already
      // covers that spelling precisely; offering it ALSO as a free-text name alias would let ordinary short
      // English words ("the cat", "all week") false-match an unrelated headline (Codex review, PR #319).
      const aliases = [...cluster.names.entries()]
        .filter(([nm]) => nm !== name && nm.toUpperCase() !== tickerUpper)
        .sort((x, y) => y[1].count - x[1].count || x[0].localeCompare(y[0]))
        .slice(0, MAX_ALIASES)
        .map(([nm]) => nm)
      const definiteCountries = [...cluster.countries].filter((c): c is string => c != null)
      out.push({ ticker: cluster.ticker, name, count: cluster.rows, aliases, listingCountry: definiteCountries.length === 1 ? definiteCountries[0] : null })
    }
  }
  out.sort((x, y) => y.count - x.count || x.name.localeCompare(y.name))
  return out.slice(0, MAX_COMPANY_FACETS)
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
  const companyRows = rows.filter((r) => rowMatches(r, without(q, 'company')))

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
  const companies = buildCompanyFacet(companyRows, rows)

  const total = rows.filter((r) => rowMatches(r, q)).length
  return { countries, regions, sectors, subSectors, sources, themes, scopes, commodities, topics, scheduledEvents, companies, total, builtThroughDate, builtAt: now().toISOString() }
}
