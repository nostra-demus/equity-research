// The CANONICAL feed filter predicate — server-side, so the archive search + facets (server.ts) and the
// cockpit filter IDENTICALLY. The browser keeps a mirror at ui/web/src/components/screener/FeedFilters.tsx
// (matchesFilters). Keep the two in lockstep: every clause here has a twin there.
//
// Geography is COUNTRY-level (news/geography.ts): `country` is an ISO 3166-1 alpha-2 code, `geoRegion` is
// its continent rollup — the two levels of the Continent → Country drill-down. GICS is server-side
// (news/gics.ts), classified lazily only when a sector/sub-sector filter is set.

import type { FeedItem } from './types'
import { gicsOf } from './gics'
import { regionOfCountry } from './geography'

export interface FeedFilterQuery {
  themes?: string[] // event_type tags — OR within the set
  country?: string // ISO alpha-2 — the leaf of the geography drill-down
  geoRegion?: string // continent group — the branch of the geography drill-down
  source?: string // exact source_name
  band?: string // pick | watch | drop
  size?: string // size_bucket
  linkage?: string // issuer_linkage
  gicsSector?: string // a GICS sector
  gicsSubSector?: string // a sub-sector within gicsSector
  text?: string // substring over headline / translation / company name+ticker
  // Screener Globe view only: restrict to events whose guessed company has an existing analyses/<TICKER>
  // run — "prior coverage" as a proxy for "portfolio relevant" (no other definition exists in the
  // codebase). Evaluated via the `ctx.coveredTickers` set matchesFeedFilters is given below, since the
  // filesystem check itself doesn't belong in a pure predicate — the caller resolves it once per request.
  portfolioRelevant?: boolean
}

/** Context a caller can supply alongside the query for filter dimensions that need data outside the item
 *  itself. Additive/optional so every existing matchesFeedFilters call site keeps compiling untouched. */
export interface FeedFilterContext {
  coveredTickers?: ReadonlySet<string> // uppercased tickers with at least one analyses/<TICKER>_* run folder
}

/** True when at least one structured (server-side) filter is set — the cockpit switches to archive search. */
export function hasAnyFilter(q: FeedFilterQuery): boolean {
  return (
    (q.themes?.length ?? 0) > 0 ||
    !!q.country || !!q.geoRegion || !!q.source || !!q.band || !!q.size || !!q.linkage ||
    !!q.gicsSector || !!q.gicsSubSector || !!(q.text && q.text.trim())
  )
}

const bandOf = (it: FeedItem): string =>
  it.band || (typeof it.triage_score === 'number' ? (it.triage_score >= 70 ? 'pick' : it.triage_score >= 40 ? 'watch' : 'drop') : '')

/** Does this item satisfy every set clause of the filter? Mirrors the web matchesFilters exactly.
 *  `ctx` is additive and optional (existing callers that omit it keep compiling unchanged) — it carries
 *  data a pure per-item predicate can't derive on its own, currently just `coveredTickers` for
 *  `portfolioRelevant`. When `q.portfolioRelevant` is set but `ctx.coveredTickers` is omitted, the clause
 *  is skipped (an honest no-op, not a silent "everything passes" or a crash) — same "never fabricate" spirit
 *  as the rest of the filter, just applied to a caller-supplied context instead of the item's own data. */
export function matchesFeedFilters(it: FeedItem, q: FeedFilterQuery, ctx: FeedFilterContext = {}): boolean {
  if (q.themes && q.themes.length > 0 && !(it.event_types || []).some((t) => q.themes!.includes(t))) return false
  if (q.country && (it.country || '') !== q.country) return false
  if (q.geoRegion && regionOfCountry(it.country) !== q.geoRegion) return false
  if (q.source && (it.source_name || '') !== q.source) return false
  if (q.band && bandOf(it) !== q.band) return false
  if (q.size && (it.size_bucket || 'unknown') !== q.size) return false
  if (q.linkage && (it.issuer_linkage || '') !== q.linkage) return false
  if (q.gicsSector || q.gicsSubSector) {
    const g = gicsOf(it)
    if (q.gicsSector && !g.sectors.has(q.gicsSector)) return false
    if (q.gicsSubSector && !g.subSectors.has(q.gicsSubSector)) return false
  }
  if (q.portfolioRelevant && ctx.coveredTickers) {
    if (!(it.companies || []).some((c) => c.ticker && ctx.coveredTickers!.has(c.ticker.toUpperCase()))) return false
  }
  if (q.text && q.text.trim()) {
    const needle = q.text.trim().toLowerCase()
    const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
    if (!hay.includes(needle)) return false
  }
  return true
}

/** Parse a Fastify query object into a FeedFilterQuery (strings → typed fields; themes is comma-separated). */
export function parseFeedFilterQuery(raw: Record<string, unknown>): FeedFilterQuery {
  const str = (v: unknown): string | undefined => {
    const s = typeof v === 'string' ? v.trim() : ''
    return s || undefined
  }
  const themesRaw = str(raw.themes)
  return {
    themes: themesRaw ? themesRaw.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    country: str(raw.country)?.toUpperCase(),
    geoRegion: str(raw.geoRegion),
    source: str(raw.source),
    band: str(raw.band),
    size: str(raw.size),
    linkage: str(raw.linkage),
    gicsSector: str(raw.gicsSector),
    gicsSubSector: str(raw.gicsSubSector),
    text: str(raw.text),
    portfolioRelevant: raw.portfolioRelevant === 'true' || raw.portfolioRelevant === '1' || raw.portfolioRelevant === true ? true : undefined,
  }
}
