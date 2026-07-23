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
  // vice-versa. `aliases` are OTHER spellings the archive has tagged for the same ticker (e.g. a short form
  // like "Amazon" alongside "Amazon.com Inc.") — carried so an untagged older item using a less-common
  // spelling still matches, not just the one "best" name (Codex review, PR #317). Any of ticker/name/an
  // alias alone still matches.
  company?: { ticker?: string; name?: string; aliases?: string[] }
  text?: string // substring over headline / translation / company name+ticker
}

/** True when at least one structured (server-side) filter is set — the cockpit switches to archive search. */
export function hasAnyFilter(q: FeedFilterQuery): boolean {
  return (
    (q.themes?.length ?? 0) > 0 ||
    !!q.country || !!q.geoRegion || !!q.source || !!q.band || !!q.size || !!q.linkage ||
    !!q.gicsSector || !!q.gicsSubSector || !!q.scope || (q.commodities?.length ?? 0) > 0 ||
    (q.topics?.length ?? 0) > 0 || (q.scheduledEvents?.length ?? 0) > 0 || !!q.wireScope ||
    !!(q.company && (q.company.ticker || q.company.name)) || !!(q.text && q.text.trim())
  )
}

/** Whole-word occurrence of `needle` in `hay` (both already lowercased). Word chars are ASCII [a-z0-9], so
 *  "amazon" hits "amazon's results" / "amazon.com" but NOT "amazons" / "metadata" / "metal" — the precision
 *  partner to the recall-first design. ASCII-only word chars ⇒ it stays PERMISSIVE for CJK / space-less
 *  scripts (every char reads as a boundary there), so a non-Latin headline never loses a match. MUST stay
 *  identical to the web twin `nameOccurs` in ui/web/src/components/screener/FeedFilters.tsx, and it is reused
 *  by the facet index (ui/server/src/news/facets.ts) so all three sites match a company name the same way. */
export function nameOccurs(hay: string, needle: string): boolean {
  if (!needle) return false
  const word = (ch: string) => (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')
  const headWord = word(needle[0])
  const tailWord = word(needle[needle.length - 1])
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const before = i === 0 ? '' : hay[i - 1]
    const after = i + needle.length >= hay.length ? '' : hay[i + needle.length]
    if ((!before || !word(before) || !headWord) && (!after || !word(after) || !tailWord)) return true
  }
  return false
}

/** Does the item satisfy the pick-a-company clause? Exact ticker OR whole-word name (or any alias) over the
 *  headline/company blob. Shared by matchesFeedFilters and the debug explainer so the two never drift. */
function matchesCompany(it: FeedItem, company: { ticker?: string; name?: string; aliases?: string[] }): boolean {
  const t = (company.ticker || '').toUpperCase()
  const names = [company.name, ...(company.aliases || [])].filter((s): s is string => !!s).map((s) => s.toLowerCase())
  const tickerHit = !!t && (it.companies || []).some((c) => (c.ticker || '').toUpperCase() === t)
  const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
  const nameHit = names.some((n) => nameOccurs(hay, n))
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
  if (q.company && (q.company.ticker || q.company.name) && !matchesCompany(it, q.company)) return false
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
    // pick-a-company: ticker is upcased (tags carry upper-case symbols); name/aliases stay verbatim for the substring
    company: (() => {
      const ticker = str(raw.companyTicker)?.toUpperCase()
      const name = str(raw.companyName)
      // '|' not ',' — some tagged company names contain a comma (e.g. "Foo Corp, Inc."), which a comma-split
      // would wrongly break into two aliases; '|' never appears in a company name.
      const aliasesRaw = str(raw.companyAliases)
      const aliases = aliasesRaw ? aliasesRaw.split('|').map((a) => a.trim()).filter(Boolean) : undefined
      return ticker || name ? { ticker, name, ...(aliases?.length ? { aliases } : {}) } : undefined
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
  if (q.company && (q.company.ticker || q.company.name)) {
    const t = (q.company.ticker || '').toUpperCase()
    const names = [q.company.name, ...(q.company.aliases || [])].filter((s): s is string => !!s)
    const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
    const tickerHit = !!t && (it.companies || []).some((c) => (c.ticker || '').toUpperCase() === t)
    const nameMatch = names.find((n) => nameOccurs(hay, n.toLowerCase()))
    const want = [t && `ticker ${t}`, names.length && `name/alias ${names.map((n) => `“${n}”`).join(' / ')}`].filter(Boolean).join(' OR ')
    const via = tickerHit ? `exact ticker ${t}` : nameMatch ? `name “${nameMatch}” in headline/company blob` : ''
    checks.push({ clause: 'company', passed: tickerHit || !!nameMatch, detail: tickerHit || nameMatch ? `matched via ${via}` : `no company matched ${want}` })
  }
  if (q.text && q.text.trim()) {
    const needle = q.text.trim().toLowerCase()
    const hay = `${it.headline} ${it.headline_en || ''} ${(it.companies || []).map((c) => `${c.name} ${c.ticker || ''}`).join(' ')}`.toLowerCase()
    const hit = hay.includes(needle)
    checks.push({ clause: 'text', passed: hit, detail: hit ? `text "${needle}" found in headline/company blob` : `text "${needle}" not found in headline, translation, or company name/ticker` })
  }

  return { matched: checks.every((c) => c.passed), checks }
}
