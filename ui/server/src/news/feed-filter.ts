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
import { commoditiesOf } from './commodities'
import { deriveTopics } from './topics'
import { deriveScheduledEvents } from './schedule'
import { companyNameMatches, nameOccurs, normTicker, pickTickerSet, tickerHitAny } from './symbology'

// nameOccurs moved to symbology.ts (shared with the facet index + the global symbol directory);
// re-exported here so existing importers and the web-twin lockstep note keep one stable home.
export { nameOccurs }

/** The item's subject topics — the hydrated field, or a lazy derive for a synthetic/un-hydrated item
 *  (the same trick as commoditiesOf/gicsOf above). deriveTopics reads only headline/headline_en. */
const topicsOf = (it: FeedItem): string[] => it.topics || deriveTopics(it)
/** The item's scheduled/forward events — hydrated field or a lazy derive (same trick). */
const scheduledEventsOf = (it: FeedItem): string[] => it.scheduled_events || deriveScheduledEvents(it)

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
  scope?: string // exact scope bucket (news/scope.ts ScopeId) — e.g. a wire swarm's declared event_scope
  commodities?: string[] // canonical commodity subjects (news/commodities.ts) — OR within the set
  topics?: string[] // CapIQ-style subject topics (news/topics.ts) — OR within the set
  scheduledEvents?: string[] // forward/scheduled corporate events (news/schedule.ts) — OR within the set
  // the wire-membership DISJUNCTION: item passes when its scope equals this value OR it carries any
  // canonical commodity tag. This is what "on the commodity wire" means (a gold-miner single_name
  // story is GOLD-wire material even though its scope isn't 'commodity') — one clause, so the archive
  // search and the live rail's client-side projection (ui/web lib/wire.ts itemOnWire) agree exactly.
  wireScope?: string
  // Pick-a-company filter (the ticker autofill): match an item tagged with this EXACT ticker OR whose
  // headline/company blob contains this name OR any of its known aliases. Sending both ticker and name (the
  // picked suggestion carries both) maximises recall — the ticker catches items the name misses and
  // vice-versa. `aliases` are OTHER spellings the archive has tagged for the same company identity (e.g. a
  // short form like "Amazon" alongside "Amazon.com Inc.") — carried so an untagged older item using a
  // less-common spelling still matches, not just the one "best" name (Codex review, PR #317). Any of
  // ticker/name/an alias alone still matches. `listingCountry`: when the picked facet has a definite
  // listing_country, an item's OWN definite (non-null) listing_country for that ticker must not DISAGREE —
  // this is what stops two different issuers that happen to reuse the same ticker letters on different
  // exchanges (the archive has both NYSE:CAT Caterpillar and ASX:CAT Catapult Group International) from
  // matching each other's tagged items via a bare ticker match (Codex review, PR #319). Unknown on either
  // side is never a conflict — this narrows a proven mismatch, it never costs recall on missing data.
  // `tickerAliases`: the company's OTHER listing symbols from the global symbol directory
  // (news/symbology.ts — e.g. a pick of the US OTC ADR NHYDY carries Oslo's NHY.OL), matched exactly OR on
  // the exchange-suffix-stripped base, so the archive tag "NHY" still hits. Distinct from `aliases`, which
  // are NAME spellings.
  company?: { ticker?: string; name?: string; aliases?: string[]; tickerAliases?: string[]; listingCountry?: string | null }
  text?: string // substring over headline / translation / company name+ticker
}

/** Is the pick-a-company clause actually ON? Ticker OR name OR a non-empty alias list (name OR ticker
 *  aliases) — an alias-only query (no ticker/name, e.g. a raw API caller that only sends `companyAliases`)
 *  must still activate the clause, not silently no-op and fall through to "everything matches" (Codex
 *  review, PR #319). Shared by every site that gates on "is a company picked" so none of them can drift
 *  out of sync with matchesCompany itself. */
export function companyClauseSet(company: { ticker?: string; name?: string; aliases?: string[]; tickerAliases?: string[]; listingCountry?: string | null } | undefined): boolean {
  return !!(company && (company.ticker || company.name || company.aliases?.length || company.tickerAliases?.length))
}

/** Do a picked company's definite listing_country and an item's OWN definite listing_country for its
 *  ticker tag DISAGREE? Only a genuine, evidenced conflict (both sides non-null and different) counts —
 *  unknown on either side is never treated as a mismatch, so missing extraction never costs recall. Shared
 *  by matchesCompany/explainFeedFilterMatch (server) and their client twin so the exact-ticker match can
 *  tell apart two different issuers reusing the same ticker letters on different exchanges. */
export function listingConflicts(picked: string | null | undefined, itemCountry: string | null | undefined): boolean {
  return !!picked && !!itemCountry && picked !== itemCountry
}

/** True when at least one structured (server-side) filter is set — the cockpit switches to archive search. */
export function hasAnyFilter(q: FeedFilterQuery): boolean {
  return (
    (q.themes?.length ?? 0) > 0 ||
    !!q.country || !!q.geoRegion || !!q.source || !!q.band || !!q.size || !!q.linkage ||
    !!q.gicsSector || !!q.gicsSubSector || !!q.scope || (q.commodities?.length ?? 0) > 0 ||
    (q.topics?.length ?? 0) > 0 || (q.scheduledEvents?.length ?? 0) > 0 || !!q.wireScope ||
    companyClauseSet(q.company) || !!(q.text && q.text.trim())
  )
}

/** Does the item satisfy the pick-a-company clause? Any of the pick's ticker spellings (the picked symbol
 *  + its cross-listing tickerAliases; exact or exchange-suffix-equivalent — symbology.ts) against the
 *  tagged tickers, each hit still subject to the listing-country conflict guard — OR the company named
 *  whole-word (legal-suffix-tolerant, symbology.ts companyNameMatches) under its picked name or any name
 *  alias over the headline/company blob. Shared by matchesFeedFilters and the debug explainer so the two
 *  never drift. */
function matchesCompany(it: FeedItem, company: { ticker?: string; name?: string; aliases?: string[]; tickerAliases?: string[]; listingCountry?: string | null }): boolean {
  const picks = pickTickerSet({ ticker: company.ticker, aliases: company.tickerAliases })
  const tickerHit = picks.length > 0 && (it.companies || []).some((c) => tickerHitAny(c.ticker, picks) && !listingConflicts(company.listingCountry, c.listing_country))
  const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
  const names = [company.name, ...(company.aliases || [])].filter((s): s is string => !!s)
  const nameHit = names.some((n) => companyNameMatches(hay, n))
  return tickerHit || nameHit
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
  if (q.scope && (it.scope || '') !== q.scope) return false
  // commoditiesOf lazily derives when the item was never hydrated (synthetic /debug/explain items) —
  // same trick as the lazy gicsOf above
  if (q.commodities && q.commodities.length > 0 && !commoditiesOf(it).some((c) => q.commodities!.includes(c))) return false
  if (q.topics && q.topics.length > 0 && !topicsOf(it).some((t) => q.topics!.includes(t))) return false
  if (q.scheduledEvents && q.scheduledEvents.length > 0 && !scheduledEventsOf(it).some((s) => q.scheduledEvents!.includes(s))) return false
  if (q.wireScope && (it.scope || '') !== q.wireScope && commoditiesOf(it).length === 0) return false
  if (companyClauseSet(q.company) && !matchesCompany(it, q.company!)) return false
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
  const commoditiesRaw = str(raw.commodities)
  const topicsRaw = str(raw.topics)
  const scheduledRaw = str(raw.scheduledEvents)
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
    scope: str(raw.scope),
    commodities: commoditiesRaw ? commoditiesRaw.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean) : undefined,
    // topic ids are lowercase (news/topics.ts TopicId) — no upcasing, unlike commodity headings
    topics: topicsRaw ? topicsRaw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : undefined,
    // scheduled-event kinds are lowercase ids (news/schedule.ts ScheduledEventKind)
    scheduledEvents: scheduledRaw ? scheduledRaw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : undefined,
    wireScope: str(raw.wireScope),
    // pick-a-company: ticker + tickerAliases upcased (tags carry upper-case symbols); name/aliases stay
    // verbatim for the substring
    company: (() => {
      const ticker = str(raw.companyTicker)?.toUpperCase()
      const name = str(raw.companyName)
      // '|' not ',' — some tagged company names contain a comma (e.g. "Foo Corp, Inc."), which a comma-split
      // would wrongly break into two aliases; '|' never appears in a company name.
      const aliasesRaw = str(raw.companyAliases)
      const aliases = aliasesRaw ? aliasesRaw.split('|').map((a) => a.trim()).filter(Boolean) : undefined
      // ',' is fine for TICKER aliases — a symbol never contains a comma
      const tickerAliasesRaw = str(raw.companyTickerAliases)
      const tickerAliases = tickerAliasesRaw ? tickerAliasesRaw.split(',').map((a) => a.trim().toUpperCase()).filter(Boolean) : undefined
      const listingCountry = str(raw.companyListingCountry)?.toUpperCase()
      // aliases ALONE (no ticker/name) is a valid, real query shape (companyClauseSet honours it) — a raw
      // API caller sending only `companyAliases` must not be dropped here before it even reaches that gate
      // (Codex review, PR #319). Each field is spread in only when present, not just filtered to `undefined`
      // — so e.g. an alias-only query returns `{ aliases: [...] }`, never `{ ticker: undefined, name:
      // undefined, aliases: [...] }` (the latter breaks a plain deepEqual against the intended shape).
      if (!ticker && !name && !aliases?.length && !tickerAliases?.length) return undefined
      return { ...(ticker ? { ticker } : {}), ...(name ? { name } : {}), ...(aliases?.length ? { aliases } : {}), ...(tickerAliases?.length ? { tickerAliases } : {}), ...(listingCountry ? { listingCountry } : {}) }
    })(),
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
  if (q.scope) {
    const s = it.scope || ''
    checks.push({ clause: 'scope', passed: s === q.scope, detail: s === q.scope ? `scope ${s} matches` : `item scope "${s || 'unset'}" ≠ requested "${q.scope}"` })
  }
  if (q.commodities && q.commodities.length > 0) {
    const have = commoditiesOf(it)
    const hit = have.filter((c) => q.commodities!.includes(c))
    checks.push({ clause: 'commodities', passed: hit.length > 0, detail: hit.length ? `matched commodity subject(s): ${hit.join(', ')}` : `item commodities [${have.join(', ') || 'none'}] do not include any of [${q.commodities.join(', ')}]` })
  }
  if (q.topics && q.topics.length > 0) {
    const have = topicsOf(it)
    const hit = have.filter((t) => q.topics!.includes(t))
    checks.push({ clause: 'topics', passed: hit.length > 0, detail: hit.length ? `matched subject topic(s): ${hit.join(', ')}` : `item topics [${have.join(', ') || 'none'}] do not include any of [${q.topics.join(', ')}]` })
  }
  if (q.scheduledEvents && q.scheduledEvents.length > 0) {
    const have = scheduledEventsOf(it)
    const hit = have.filter((s) => q.scheduledEvents!.includes(s))
    checks.push({ clause: 'scheduledEvents', passed: hit.length > 0, detail: hit.length ? `matched forward event(s): ${hit.join(', ')}` : `item scheduled events [${have.join(', ') || 'none'}] do not include any of [${q.scheduledEvents.join(', ')}]` })
  }
  if (q.wireScope) {
    const have = commoditiesOf(it)
    const pass = (it.scope || '') === q.wireScope || have.length > 0
    checks.push({ clause: 'wireScope', passed: pass, detail: pass ? (have.length ? `on the wire via commodity tag(s): ${have.join(', ')}` : `on the wire via scope ${q.wireScope}`) : `item scope "${it.scope || 'unset'}" ≠ "${q.wireScope}" and it carries no commodity tag` })
  }
  if (companyClauseSet(q.company)) {
    const picks = pickTickerSet({ ticker: q.company!.ticker, aliases: q.company!.tickerAliases })
    const names = [q.company!.name, ...(q.company!.aliases || [])].filter((s): s is string => !!s)
    const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
    const tickerTag = picks.length ? (it.companies || []).find((c) => tickerHitAny(c.ticker, picks)) : undefined
    const tickerConflicted = !!tickerTag && listingConflicts(q.company!.listingCountry, tickerTag.listing_country)
    const tickerHit = !!tickerTag && !tickerConflicted
    const nameMatch = names.find((n) => companyNameMatches(hay, n))
    const want = [picks.length && `ticker(s) ${picks.join('/')}`, names.length && `name/alias ${names.map((n) => `“${n}”`).join(' / ')}`].filter(Boolean).join(' OR ')
    const tagN = tickerTag ? normTicker(tickerTag.ticker) : ''
    const via = tickerHit
      ? tagN === normTicker(q.company!.ticker || '') ? `exact ticker ${tagN}` : `ticker alias ${tagN} (of ${picks.join('/')})`
      : nameMatch ? `name “${nameMatch}” in headline/company blob` : ''
    const missDetail = tickerConflicted
      ? `ticker ${tagN} is tagged, but its listing_country "${tickerTag!.listing_country}" disagrees with the picked "${q.company!.listingCountry}" — a different issuer sharing the same ticker letters`
      : `no company matched ${want}`
    checks.push({ clause: 'company', passed: tickerHit || !!nameMatch, detail: tickerHit || nameMatch ? `matched via ${via}` : missDetail })
  }
  if (q.text && q.text.trim()) {
    const needle = q.text.trim().toLowerCase()
    const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
    const hit = hay.includes(needle)
    checks.push({ clause: 'text', passed: hit, detail: hit ? `text "${needle}" found in headline/company blob` : `text "${needle}" not found in headline, translation, or company name/ticker` })
  }

  return { matched: checks.every((c) => c.passed), checks }
}
