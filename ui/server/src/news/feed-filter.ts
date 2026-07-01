// The CANONICAL feed filter predicate — server-side, so the archive search + facets (server.ts) and the
// cockpit filter IDENTICALLY. The browser keeps a mirror at ui/web/src/components/screener/FeedFilters.tsx
// (matchesFilters). Keep the two in lockstep: every clause here has a twin there.
//
// Geography is COUNTRY-level (news/geography.ts): `country` is an ISO 3166-1 alpha-2 code, `geoRegion` is
// its continent rollup — the two levels of the Continent → Country drill-down. GICS is server-side
// (news/gics.ts), classified lazily only when a sector/sub-sector filter is set.

import type { FeedItem } from './types'
import { gicsOf, explainGicsOf } from './gics'
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

/** Does this item satisfy every set clause of the filter? Mirrors the web matchesFilters exactly. */
export function matchesFeedFilters(it: FeedItem, q: FeedFilterQuery): boolean {
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
  }
}

export interface FeedFilterCheck { clause: string; passed: boolean; detail: string }
export interface FeedFilterExplanation { matched: boolean; checks: FeedFilterCheck[] }

/** Name which keyword or company alias matched the requested GICS sector/sub-sector (or state plainly
 *  that nothing did) — the GICS clause of explainFeedFilterMatch below. */
function explainGics(it: FeedItem, wantSector?: string, wantSubSector?: string): FeedFilterCheck {
  const details = explainGicsOf(it)
  const relevant = details.filter((d) => (!wantSubSector || d.subSector === wantSubSector) && (!wantSector || d.sector === wantSector))
  if (relevant.length) {
    const named = relevant.map((d) => `${d.subSector} via ${d.via === 'keyword' ? `keyword "${d.term}"` : `company alias (${d.term})`}`).join('; ')
    return { clause: 'gics', passed: true, detail: `matched: ${named}` }
  }
  const label = [wantSector, wantSubSector].filter(Boolean).join(' → ') || 'the requested GICS filter'
  return { clause: 'gics', passed: false, detail: `nothing in the headline, translation, company name/ticker, or known aliases matched ${label}` }
}

/** DEBUG ONLY — the "why did/didn't this item match this filter" trace. Checks the exact same clauses as
 *  matchesFeedFilters, in the same order, but records a pass/fail + human-readable detail per clause
 *  instead of short-circuiting on the first failure, so a caller can see every reason at once. Only
 *  clauses whose filter key is actually SET produce a check (an unset clause is vacuously true and adds
 *  no noise). Not on the hot path — call this only when a human wants to know why. */
export function explainFeedFilterMatch(it: FeedItem, q: FeedFilterQuery): FeedFilterExplanation {
  const checks: FeedFilterCheck[] = []

  if (q.themes && q.themes.length > 0) {
    const hit = (it.event_types || []).filter((t) => q.themes!.includes(t))
    checks.push({ clause: 'themes', passed: hit.length > 0, detail: hit.length ? `matched theme(s): ${hit.join(', ')}` : `item themes [${(it.event_types || []).join(', ') || 'none'}] do not include any of [${q.themes.join(', ')}]` })
  }
  if (q.country) {
    const c = it.country || ''
    checks.push({ clause: 'country', passed: c === q.country, detail: c === q.country ? `country ${c} matches` : `item country "${c || 'unset'}" ≠ requested "${q.country}"` })
  }
  if (q.geoRegion) {
    const r = regionOfCountry(it.country)
    checks.push({ clause: 'geoRegion', passed: r === q.geoRegion, detail: r === q.geoRegion ? `region ${r} matches` : `item region "${r || 'unset'}" (from country "${it.country || 'unset'}") ≠ requested "${q.geoRegion}"` })
  }
  if (q.source) {
    const s = it.source_name || ''
    checks.push({ clause: 'source', passed: s === q.source, detail: s === q.source ? 'source matches' : `item source "${s}" ≠ requested "${q.source}"` })
  }
  if (q.band) {
    const b = bandOf(it)
    checks.push({ clause: 'band', passed: b === q.band, detail: b === q.band ? `band ${b} matches` : `item band "${b || 'unset'}" ≠ requested "${q.band}"` })
  }
  if (q.size) {
    const s = it.size_bucket || 'unknown'
    checks.push({ clause: 'size', passed: s === q.size, detail: s === q.size ? `size ${s} matches` : `item size "${s}" ≠ requested "${q.size}"` })
  }
  if (q.linkage) {
    const l = it.issuer_linkage || ''
    checks.push({ clause: 'linkage', passed: l === q.linkage, detail: l === q.linkage ? `linkage ${l} matches` : `item linkage "${l || 'unset'}" ≠ requested "${q.linkage}"` })
  }
  if (q.gicsSector || q.gicsSubSector) {
    checks.push(explainGics(it, q.gicsSector, q.gicsSubSector))
  }
  if (q.text && q.text.trim()) {
    const needle = q.text.trim().toLowerCase()
    const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
    const hit = hay.includes(needle)
    checks.push({ clause: 'text', passed: hit, detail: hit ? `text "${needle}" found in headline/company blob` : `text "${needle}" not found in headline, translation, or company name/ticker` })
  }

  return { matched: checks.every((c) => c.passed), checks }
}
