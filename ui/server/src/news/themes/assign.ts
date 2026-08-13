// Per-cycle theme ASSIGNMENT — the cheap, deterministic step that runs every cycle. For each material
// item it scores overlap against every LIVE theme (reusing the exact company-name + topic-token match
// the enrichment "related events" finder uses) and adds the item to every theme it clears the bar for
// (an item can belong to several themes — an Nvidia print is both "AI data-center buildout" and
// "semiconductors"). Items matching no theme become the unclustered pool that discovery clusters next.
// Pure data transforms; no I/O, no LLM (a tiny Groq tie-break is an optional caller concern).

import type { CompanyGuess } from '../types'
import { deriveCommodities } from '../commodities'
import { companyKeys, themeNarrativeTokens, intersectionSize, topicTokens } from '../text-match'
import { companyImpact } from './order'
import { bumpDaily } from './score'
import { boundThemeFamilyHistory, sameThemeStoryObservation, themeStoryFamilyKey } from './story-key'
import { assignmentAnchors } from './core'
import { sourcePriority } from './evidence'
import type { Theme, ThemeItemView, ThemeMember, ThemeCompany } from './types'

export interface AssignConfig {
  maxThemesPerItem: number // cap multi-membership so one item can't smear across everything
  maxMembers: number // member-ring cap per theme
}
export const DEFAULT_ASSIGN_CONFIG: AssignConfig = { maxThemesPerItem: 3, maxMembers: 400 }

const isCompanyLinkage = (l?: string) => l === 'primary' || l === 'secondary'

/** Canonical bytes for one persisted representative. Optional legacy fields are normalized to the
 * values the assignment writer emits, so replaying the exact source item against a freshly discovered
 * member is still a no-op (`undefined` country vs the writer's explicit `null`, for example). The same
 * key is the final, order-independent tie-break for genuinely different representatives that arrive at
 * the exact same source priority and clock. */
function memberRepresentativeKey(member: ThemeMember): string {
  return JSON.stringify([
    member.event_id,
    member.dedup_group ?? null,
    member.headline,
    member.headline_en ?? null,
    member.found_at,
    member.score,
    member.tier,
    member.source_name ?? null,
    member.url ?? null,
    (Array.isArray(member.companies) ? member.companies : []).map((company) => [
      company.name,
      company.ticker ?? null,
      company.listing_country ?? null,
    ]),
    Array.isArray(member.event_types) ? member.event_types : [],
    member.issuer_linkage ?? null,
    member.country ?? null,
    member.region ?? null,
    Array.isArray(member.commodities) ? member.commodities : [],
  ])
}

/** Keep a bounded audit ring: at most six observations per family and never more than maxMembers total.
 * Pending debt is reconciled to the retained ring, so an update flood cannot create unbounded state. */
export function narrativeReferenceEventIds(theme: Pick<Theme, 'narrative'>): Set<string> {
  return new Set([
    theme.narrative?.why_now_event_id,
    ...(theme.narrative?.evidence || []).map((row) => row.event_id),
    ...(theme.narrative?.context_event_ids || []),
    ...(theme.narrative?.expressions || []).flatMap((expression) => expression.evidence_event_ids || []),
  ].filter((eventId): eventId is string => typeof eventId === 'string' && Boolean(eventId)))
}

export function boundThemeMembers(theme: Theme, maxMembers: number): void {
  const pendingBefore = [...new Set(theme.pending_narrative_event_ids || [])]
  const pendingSet = new Set(pendingBefore)
  const narrativeReferenceIds = narrativeReferenceEventIds(theme)
  const hadNarrativeDebt = Boolean(theme.narrative && (
    theme.needs_narrative_update === true
    || theme.narrative_update_overflow === true
    || pendingBefore.length > 0
  ))
  const stanceById = new Map((theme.narrative?.evidence || []).map((row) => [row.event_id, row.stance]))
  theme.members = boundThemeFamilyHistory(theme.members, maxMembers, {
    priority: (member) => sourcePriority(member.tier),
    stance: (member) => stanceById.get(String(member.event_id)),
    preferred: (member) => pendingSet.has(String(member.event_id)),
  })
  const retained = new Set(theme.members.map((member) => member.event_id))
  const pending = pendingBefore.filter((eventId) => retained.has(eventId))
  const lostNarrativeReference = Boolean(theme.narrative
    && [...narrativeReferenceIds].some((eventId) => !retained.has(eventId)))
  // `needs_narrative_update:true` with no corresponding FIFO is legacy evidence that an older bounded
  // write already lost the row. Likewise, a cap that cannot retain every current pending ID must leave a
  // durable quarantine marker. The same applies when the cap evicts why-now, classified evidence, context,
  // or expression proof: persisting a narrative edge to a missing member makes that contract invalid at
  // reload, so the loss must survive independently of the narrative object as explicit rebuild debt.
  if ((theme.needs_narrative_update === true && pendingBefore.length === 0)
    || pending.length < pendingBefore.length || lostNarrativeReference) theme.narrative_update_overflow = true
  if (pending.length) theme.pending_narrative_event_ids = pending
  else delete theme.pending_narrative_event_ids
  // Losing a pending row to the hard cap is conservative data compression, not classification. Keep the
  // thesis quarantined until the compiler explicitly clears the debt; never turn eviction into approval.
  if (hadNarrativeDebt || theme.narrative_update_overflow) theme.needs_narrative_update = true
}

function narrativeKeywords(theme: Theme, generic?: Set<string>): Set<string> {
  const contractAnchors = assignmentAnchors(theme)
  if (contractAnchors.length === 2) return new Set(contractAnchors.filter((token) => !generic?.has(token)))
  const companyWords = new Set<string>()
  for (const c of theme.companies || []) {
    for (const token of topicTokens(null, [c])) companyWords.add(token)
    for (const token of topicTokens(c.name, [])) companyWords.add(token)
  }
  return new Set((theme.keywords || []).filter((token) => !companyWords.has(token) && !generic?.has(token)))
}

/** Overlap score of an item against a theme. A company hit can rank two valid matches, never create one.
 * Joining requires the complete validated anchor pair, or three shared tokens for a contractless legacy
 * cluster waiting to be migrated. */
export function overlapScore(itemCompanyKeys: Set<string>, itemTokens: Set<string>, itemEventTypes: string[], theme: Theme, generic?: Set<string>): { score: number; matched: boolean } {
  const themeCompanyKeys = new Set(theme.company_keys)
  const themeKeywords = narrativeKeywords(theme, generic)
  const companyOverlap = intersectionSize(itemCompanyKeys, themeCompanyKeys)
  const tokenOverlap = intersectionSize(itemTokens, themeKeywords)
  const affinity = (itemEventTypes || []).some((t) => theme.event_type_affinity.includes(t)) ? 1 : 0
  const contractAnchors = assignmentAnchors(theme).filter((token) => !generic?.has(token))
  // A validated thesis owns its exact two-anchor membership rule. Company overlap is a ranking signal
  // only; it can never pull a story into the theme. Contractless legacy clusters use a stricter
  // three-token floor while they await automatic revalidation, which stops them absorbing more noise.
  const matched = contractAnchors.length === 2 ? tokenOverlap === 2 : tokenOverlap >= 3
  return { score: 3 * companyOverlap + tokenOverlap + affinity, matched }
}

/** Aggregate a theme's companies + sectors from its member ring and (re)assign order tiers. Members are
 *  the source of truth, so this is idempotent and self-healing — recomputed whenever members change. */
export function rebuildThemeCompanies(theme: Theme): void {
  interface Acc { name: string; ticker: string | null; listing_country: string | null; key: string; count: number; scoreSum: number; linkage: Record<string, number>; events: Record<string, number>; last: string; soloHeadlines: string[] }
  const byKey = new Map<string, Acc>()
  for (const m of (Array.isArray(theme.members) ? theme.members : [])) {
    // Ledger rows cross a runtime boundary with no schema migration. A legacy/partial member may carry a
    // truthy non-array `companies` value; treating that as no company proof keeps every index fail-soft.
    const memberCompanies = Array.isArray(m.companies) ? m.companies : []
    // real, investable companies named in THIS member (countries/agencies/people already filtered out)
    const realKeys = memberCompanies.map((c) => companyKeys([c]).values().next().value as string | undefined).filter(Boolean) as string[]
    const solo = new Set(realKeys).size === 1 // single-subject member → its side is safe to read from the headline
    for (const c of memberCompanies) {
      const key = companyKeys([c]).values().next().value as string | undefined
      if (!key) continue // not a real company (country/agency/person) → skipped
      let a = byKey.get(key)
      if (!a) {
        a = { name: c.name, ticker: c.ticker ?? null, listing_country: c.listing_country ?? null, key, count: 0, scoreSum: 0, linkage: {}, events: {}, last: m.found_at, soloHeadlines: [] }
        byKey.set(key, a)
      }
      a.count++
      a.scoreSum += m.score || 0
      if (c.ticker && !a.ticker) a.ticker = c.ticker
      if (m.issuer_linkage) a.linkage[m.issuer_linkage] = (a.linkage[m.issuer_linkage] || 0) + 1
      for (const ev of (Array.isArray(m.event_types) ? m.event_types : [])) a.events[ev] = (a.events[ev] || 0) + 1
      if (m.found_at > a.last) a.last = m.found_at
      if (solo && m.headline) a.soloHeadlines.push(m.headline)
    }
  }
  const dominant = (votes: Record<string, number>): string => Object.entries(votes).sort((x, y) => y[1] - x[1])[0]?.[0] || ''
  const companies: ThemeCompany[] = [...byKey.values()].map((a) => {
    const { impact, order, side } = companyImpact({
      mention_count: a.count,
      avg_score: a.count ? a.scoreSum / a.count : 0,
      dominant_linkage: (dominant(a.linkage) as any) || '',
      dominant_event_type: dominant(a.events),
      solo_headlines: a.soloHeadlines,
    })
    return { name: a.name, ticker: a.ticker, listing_country: a.listing_country, name_key: a.key, order, side, impact, mention_count: a.count, last_seen: a.last }
  })
  // most-central first (order tier, then mentions, then composite)
  companies.sort((x, y) => x.order - y.order || y.mention_count - x.mention_count || y.impact.composite - x.impact.composite)
  theme.companies = companies.slice(0, 40)
}

export interface AssignResult {
  assignments: Map<string, string[]> // event_id -> theme_ids it joined
  unclustered: ThemeItemView[] // items that matched no theme
  touched: Set<string> // theme_ids whose members changed this cycle
}

/** Assign a batch of material items to existing themes. Mutates the themes in place (members ring,
 *  companies, last_flow, rev). Returns the per-item theme_ids, the unclustered pool, and which themes
 *  changed (so the caller can rescore + emit only those). */
export function assignThemes(items: ThemeItemView[], themes: Theme[], cfg: AssignConfig = DEFAULT_ASSIGN_CONFIG, now: Date = new Date(), generic?: Set<string>): AssignResult {
  // Raw/legacy clusters are migration input, not destinations. Until a validator has compiled a causal
  // contract they cannot absorb more stories and snowball their own lexical identity.
  const live = themes.filter((t) => t.status === 'live' && t.narrative && !t.needs_rename)
  const nowMs = now.getTime()
  const assignments = new Map<string, string[]>()
  const unclustered: ThemeItemView[] = []
  const touched = new Set<string>()

  for (const it of items) {
    const itemCompanyKeys = companyKeys(it.companies)
    // Narrative-only theme tokens: calendar/event boilerplate, corpus-generic words, and the issuer's
    // own name are suppressed. A routine filing therefore contributes no narrative and cannot inflate a
    // theme merely because it names the same company (see text-match.ts).
    const itemTokens = themeNarrativeTokens(it.headline, it.companies, it.source_tier, generic)
    const evs = it.event_types || []
    const family = themeStoryFamilyKey(it)
    const hits: { theme: Theme; score: number }[] = []
    for (const theme of live) {
      const { score, matched } = overlapScore(itemCompanyKeys, itemTokens, evs, theme, generic)
      // A correction/reversal/restoration may no longer repeat the thesis anchors. The wire family is an
      // exact identity link, so route it back to the theme that already owns that family for adjudication.
      const existingFamily = family && theme.members.some((member) => themeStoryFamilyKey(member) === family)
      if (matched || existingFamily) hits.push({ theme, score: score + (existingFamily ? 10_000 : 0) })
    }
    if (!hits.length) {
      unclustered.push(it)
      continue
    }
    hits.sort((a, b) => b.score - a.score)
    const chosen = hits.slice(0, cfg.maxThemesPerItem)
    const joined: string[] = []
    for (const { theme } of chosen) {
      const member: ThemeMember = {
        event_id: it.event_id,
        dedup_group: it.dedup_group,
        headline: it.headline,
        headline_en: it.headline_en, // carry the translation so a member older than the feed window still renders in English
        ...(it.source_is_english === true ? { source_is_english: true as const } : {}),
        found_at: it.found_at,
        ...(it.observed_at ? { observed_at: it.observed_at } : {}),
        score: typeof it.triage_score === 'number' ? it.triage_score : it.materiality_pre_score || 0,
        tier: it.source_tier || 'news',
        source_name: it.source_name,
        url: it.url,
        companies: (it.companies || []).slice(0, 4) as CompanyGuess[],
        event_types: evs.slice(0, 6),
        issuer_linkage: it.issuer_linkage,
        country: it.country ?? null, // carry the event's country so the themes view can be sliced by geography
        region: it.region, // + the domain-region floor, so the lazy resolver matches the archive exactly
        // carry the canonical commodity tag(s) so the themes view can be sliced per commodity, exactly
        // like country/geo above — derived here (zero-cost) when the item didn't arrive pre-tagged
        ...(() => { const cs = it.commodities ?? deriveCommodities(it); return cs && cs.length ? { commodities: cs } : {} })(),
      }
      const existingIndex = theme.members.findIndex((existing) => sameThemeStoryObservation(existing, it))
      if (existingIndex >= 0) {
        const existing = theme.members[existingIndex]
        // One syndicated story is still one observation, but its canonical representative must improve
        // when a filing/official/company source arrives after a weaker publisher copy. Replacing rather
        // than double-counting preserves honest breadth. A changed event id is re-adjudicated because the
        // old classification cannot be silently transferred to different provenance.
        const memberMs = Date.parse(member.found_at)
        const existingMs = Date.parse(existing.found_at)
        const memberPriority = sourcePriority(member.tier)
        const existingPriority = sourcePriority(existing.tier)
        const memberKey = memberRepresentativeKey(member)
        const existingKey = memberRepresentativeKey(existing)
        const exactReplay = memberKey === existingKey
        const memberIsNewer = Number.isFinite(memberMs)
          && (!Number.isFinite(existingMs) || memberMs > existingMs)
        const clocksTie = (Number.isFinite(memberMs) && Number.isFinite(existingMs) && memberMs === existingMs)
          || (!Number.isFinite(memberMs) && !Number.isFinite(existingMs))
        // Source hierarchy wins before recency. At an equal source clock, different canonical copies use
        // a stable lexical winner so arrival order cannot change the ledger. An exact replay never mutates
        // the member, revision, queue clock, or touched set.
        const shouldReplace = !exactReplay && (memberPriority > existingPriority
          || (memberPriority === existingPriority
            && (memberIsNewer || (clocksTie && memberKey > existingKey))))
        if (shouldReplace) {
          // Triage refreshes can change score/metadata without creating a new source revision. The inbox
          // clock is immutable for that exact observation, so never move it forward on replacement.
          theme.members[existingIndex] = {
            ...member,
            observed_at: existing.observed_at || member.observed_at,
            // Exact legacy observations cannot acquire positive language proof on a refresh.
            ...(existing.source_is_english === true ? { source_is_english: true as const } : { source_is_english: undefined }),
          }
          if (member.found_at > theme.last_flow) theme.last_flow = member.found_at
          theme.rev++
          if (theme.narrative && member.event_id !== existing.event_id) {
            const wasQueued = theme.needs_narrative_update === true
            const pending = (theme.pending_narrative_event_ids || []).filter((eventId) => eventId !== existing.event_id)
            theme.pending_narrative_event_ids = [...new Set([...pending, member.event_id])]
            theme.needs_narrative_update = true
            if (!wasQueued) theme.validation_queued_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
          }
          boundThemeMembers(theme, cfg.maxMembers)
          touched.add(theme.theme_id)
        }
        joined.push(theme.theme_id) // already the same story — record membership, never count it twice
        continue
      }
      const familyAlreadyPresent = theme.members.some((existing) => themeStoryFamilyKey(existing) === family)
      theme.members.push(member)
      if (!familyAlreadyPresent) {
        theme.member_count_total++
        bumpDaily(theme, it.found_at, nowMs) // one underlying story contributes once, even when its audit history has updates
      }
      if (it.found_at > theme.last_flow) theme.last_flow = it.found_at
      theme.rev++
      if (theme.narrative) {
        const wasQueued = theme.needs_narrative_update === true
        theme.pending_narrative_event_ids = [...new Set([...(theme.pending_narrative_event_ids || []), it.event_id])]
        theme.needs_narrative_update = true
        if (!wasQueued) theme.validation_queued_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
      }
      boundThemeMembers(theme, cfg.maxMembers)
      touched.add(theme.theme_id)
      joined.push(theme.theme_id)
    }
    assignments.set(it.event_id, joined)
  }

  for (const t of themes) if (touched.has(t.theme_id)) rebuildThemeCompanies(t)
  return { assignments, unclustered, touched }
}
