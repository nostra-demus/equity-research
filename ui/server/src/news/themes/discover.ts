// Theme DISCOVERY — the periodic step (hourly) that turns the unclustered pool into NEW themes, and
// keeps the theme set healthy (merge near-duplicates, retire dead ones). The clustering is fully
// deterministic (connected components over a shared-company / shared-topic graph — free, repeatable);
// the optional Claude-Haiku pass in llm.ts only NAMES + VALIDATES the clusters and proposes ripple
// companies, so turning the LLM off degrades gracefully to this deterministic baseline.

import { createHash } from 'node:crypto'
import { companyKeys, themeNarrativeTokens, intersectionSize, jaccard } from '../text-match'
import { narrativeReferenceEventIds, rebuildThemeCompanies } from './assign'
import { ensureDaily } from './score'
import { boundThemeFamilyHistory, resolveThemeFamilyState, themeStoryFamilyKey, type ThemeFamilyClassification } from './story-key'
import { selectNarrativeCore } from './core'
import { sourcePriority } from './evidence'
import type { Theme, ThemeItemView, ThemeMember, RelatedTheme } from './types'

export interface DiscoverConfig {
  minClusterItems: number // a real theme needs at least this many items
  minClusterCompanies: number // …and at least this many distinct companies (a flash is one stock)
  maxPoolScan: number // cap the O(n²) clustering to the most recent N unclustered items
  maxMembers: number
  retireHours: number // a parked theme with no flow for this long is retired
  thesisRetireDays: number // validated theses persist as durable research memory through quiet news
  mergeSharedCompanies: number // company-supported merge floor; still requires ≥2 shared narrative anchors
  mergeKeywordJaccard: number // …or with keyword jaccard above this
}
export const DEFAULT_DISCOVER_CONFIG: DiscoverConfig = {
  minClusterItems: 3,
  minClusterCompanies: 2,
  maxPoolScan: 600,
  maxMembers: 400,
  retireHours: 72,
  thesisRetireDays: 180,
  mergeSharedCompanies: 3,
  mergeKeywordJaccard: 0.5,
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'theme'
const themeId = (slug: string, anchors: string[], evidenceKeys: string[]) => 'THM-' + createHash('sha256')
  // A display label is mutable and often collides ("Emerging cluster", one recurring issuer). Bind the
  // durable identity to the deterministic anchor/evidence core so two unrelated clusters cannot alias and
  // a later rename cannot change the id.
  .update(JSON.stringify({ slug, anchors: [...anchors].sort(), evidence: [...evidenceKeys].sort() }))
  .digest('hex').slice(0, 8)
const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z')

const oldestFirst = <T extends { event_id: string; found_at?: string }>(a: T, b: T): number => {
  const aMs = typeof a.found_at === 'string' ? Date.parse(a.found_at) : Number.NaN
  const bMs = typeof b.found_at === 'string' ? Date.parse(b.found_at) : Number.NaN
  // Invalid legacy pool clocks are oldest, so they can never displace known-fresh rows from the scan
  // tail. ThemeItemView normally has a valid clock; this is defensive for persisted pool JSON.
  const safeA = Number.isFinite(aMs) ? aMs : Number.NEGATIVE_INFINITY
  const safeB = Number.isFinite(bMs) ? bMs : Number.NEGATIVE_INFINITY
  // Array#sort is stable: equal source clocks preserve pool arrival order, so the later publisher copy
  // remains the representative selected by the reverse dedup pass below.
  return safeA - safeB
}

/** One newest representative per underlying family, returned in explicit oldest→newest source-time order. */
export function familyRepresentativeItems<T extends { event_id: string; dedup_group?: string; found_at?: string }>(items: T[]): T[] {
  const ordered = [...items].sort(oldestFirst)
  const seen = new Set<string>()
  const reversed: T[] = []
  for (let i = ordered.length - 1; i >= 0; i--) {
    const key = themeStoryFamilyKey(ordered[i])
    if (seen.has(key)) continue
    seen.add(key)
    reversed.push(ordered[i])
  }
  return reversed.reverse()
}

function narrativeFamilyClassifications(theme: Theme): ThemeFamilyClassification<ThemeMember>[] {
  if (!theme.narrative) return []
  const memberById = new Map(theme.members.map((member) => [member.event_id, member]))
  return [
    ...theme.narrative.evidence.flatMap((row) => {
      const member = memberById.get(row.event_id)
      return member ? [{ member, stance: row.stance }] : []
    }),
    ...theme.narrative.context_event_ids.flatMap((eventId) => {
      const member = memberById.get(eventId)
      return member ? [{ member, stance: 'context' as const }] : []
    }),
  ]
}

function activeNarrativeFamilyState(theme: Theme): ThemeFamilyClassification<ThemeMember>[] {
  return resolveThemeFamilyState(narrativeFamilyClassifications(theme), (member) => sourcePriority(member.tier))
    .filter((row) => row.stance === 'supports' || row.stance === 'challenges')
}

/** Current support representative per classified family, plus one row for each still-unclassified family. */
function coreFamilyMembers(theme: Theme): ThemeMember[] {
  const representatives = familyRepresentativeItems(theme.members)
  if (!theme.narrative) {
    // Legacy clusters still need every family representative during self-heal; only discovery/score
    // cardinality collapses families. Dropping all but the newest one here lets repeated contaminants
    // certify themselves and prevents the dense real core from purging unrelated rows.
    return theme.members
  }
  const classifications = narrativeFamilyClassifications(theme)
  const classifiedFamilies = new Set(classifications.map((row) => themeStoryFamilyKey(row.member)))
  const activeSupport = activeNarrativeFamilyState(theme)
    .filter((row) => row.stance === 'supports')
    .map((row) => row.member)
  return [...activeSupport, ...representatives.filter((member) => !classifiedFamilies.has(themeStoryFamilyKey(member)))]
}

// memo: each item's company keys + theme-layer topic tokens (computed once for the clustering graph)
function itemSig(it: ThemeItemView, generic?: Set<string>): { keys: Set<string>; toks: Set<string> } {
  return { keys: companyKeys(it.companies), toks: themeNarrativeTokens(it.headline, it.companies, it.source_tier, generic) }
}

/** Dense anchor-pair clustering. Every row in a returned multi-row cluster carries the SAME narrative
 * pair. This deliberately gives up some recall: a bridge headline may touch two narratives, but it cannot
 * fuse their unrelated rows through connected-component transitivity. Unclaimed rows remain singletons
 * and can form later when corroborating evidence arrives. */
export function clusterItems(items: ThemeItemView[], generic?: Set<string>): number[][] {
  const sigs = items.map((it) => itemSig(it, generic))
  const tokenDf = new Map<string, number>()
  const candidates = new Map<string, number[]>()
  for (let row = 0; row < sigs.length; row++) {
    const tokens = [...sigs[row].toks].sort().slice(0, 18)
    for (const token of tokens) tokenDf.set(token, (tokenDf.get(token) || 0) + 1)
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const key = `${tokens[i]}\u0000${tokens[j]}`
        const rows = candidates.get(key) || []
        rows.push(row)
        candidates.set(key, rows)
      }
    }
  }

  const ranked = [...candidates.entries()]
    .filter(([, rows]) => rows.length >= 2)
    .sort((a, b) => {
      const bySupport = b[1].length - a[1].length
      if (bySupport) return bySupport
      const [a1, a2] = a[0].split('\u0000'); const [b1, b2] = b[0].split('\u0000')
      const aDf = (tokenDf.get(a1) || 0) + (tokenDf.get(a2) || 0)
      const bDf = (tokenDf.get(b1) || 0) + (tokenDf.get(b2) || 0)
      return aDf - bDf || a[0].localeCompare(b[0])
    })
  const claimed = new Set<number>()
  const groups: number[][] = []
  for (const [, support] of ranked) {
    const available = support.filter((index) => !claimed.has(index))
    if (available.length < 2) continue
    groups.push(available)
    for (const index of available) claimed.add(index)
  }
  for (let index = 0; index < items.length; index++) if (!claimed.has(index)) groups.push([index])
  return groups.sort((a, b) => b.length - a.length || a[0] - b[0])
}

function memberOf(it: ThemeItemView): ThemeMember {
  return {
    event_id: it.event_id,
    dedup_group: it.dedup_group,
    headline: it.headline,
    headline_en: it.headline_en,
    ...(it.source_is_english === true ? { source_is_english: true as const } : {}),
    found_at: it.found_at,
    ...(it.observed_at ? { observed_at: it.observed_at } : {}),
    score: typeof it.triage_score === 'number' ? it.triage_score : it.materiality_pre_score || 0,
    tier: it.source_tier || 'news',
    source_name: it.source_name,
    url: it.url,
    companies: (it.companies || []).slice(0, 4),
    event_types: (it.event_types || []).slice(0, 6),
    issuer_linkage: it.issuer_linkage,
    country: it.country,
    region: it.region,
    commodities: Array.isArray(it.commodities) ? [...it.commodities] : undefined,
  }
}

/** The recurring keywords/companies/event-types that DEFINE a cluster (appear in ≥2 items). */
function clusterIdentity(items: ThemeItemView[], generic?: Set<string>): { keywords: string[]; company_keys: string[]; affinity: string[]; topCompanyName: string } {
  const tokFreq = new Map<string, number>()
  const keyFreq = new Map<string, number>()
  const keyName = new Map<string, string>()
  const evFreq = new Map<string, number>()
  for (const it of items) {
    for (const t of themeNarrativeTokens(it.headline, it.companies, it.source_tier, generic)) tokFreq.set(t, (tokFreq.get(t) || 0) + 1)
    for (const c of it.companies || []) {
      const k = companyKeys([c]).values().next().value as string | undefined
      if (!k) continue
      keyFreq.set(k, (keyFreq.get(k) || 0) + 1)
      if (!keyName.has(k)) keyName.set(k, c.name)
    }
    for (const ev of it.event_types || []) evFreq.set(ev, (evFreq.get(ev) || 0) + 1)
  }
  const recurring = (m: Map<string, number>, min: number) => [...m.entries()].filter(([, c]) => c >= min).sort((a, b) => b[1] - a[1])
  const keywords = recurring(tokFreq, 2).slice(0, 10).map(([t]) => t)
  const companyEntries = recurring(keyFreq, 2)
  const company_keys = companyEntries.slice(0, 12).map(([k]) => k)
  const affinity = recurring(evFreq, 2).slice(0, 4).map(([e]) => e)
  const topCompanyName = companyEntries[0] ? keyName.get(companyEntries[0][0]) || '' : ''
  // NO fallback when nothing recurs: keywords may be EMPTY. The old "first member's tokens" fallback
  // was the self-heal's blind spot — a theme whose junk keywords stopped recurring inherited arbitrary
  // member tokens as its refreshed identity, its members re-matched against them, and the junk theme
  // survived every heal pass. An empty keyword list is honest: the cluster is company-anchored or it
  // is nothing (deterministicName already falls back to the top company / 'Emerging cluster').
  return { keywords, company_keys, affinity, topCompanyName }
}

/** A crude deterministic name (the Claude pass replaces it with a narrative one). */
function deterministicName(id: ReturnType<typeof clusterIdentity>): string {
  if (id.topCompanyName) return id.topCompanyName + (id.keywords[0] && !id.topCompanyName.toLowerCase().includes(id.keywords[0]) ? ` · ${id.keywords[0]}` : '')
  return id.keywords.slice(0, 3).join(' · ') || 'Emerging cluster'
}

/** Build a fresh Theme from a cluster of items. */
export function createTheme(items: ThemeItemView[], now: Date, generation: Theme['generation'] = 'deterministic', generic?: Set<string>): Theme {
  const unique = familyRepresentativeItems(items)
  const id = clusterIdentity(unique, generic)
  const name = deterministicName(id)
  const slug = slugify(name)
  const members = unique.map(memberOf)
  const last_flow = members.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), members[0]?.found_at || iso(now))
  const theme: Theme = {
    theme_id: themeId(slug, id.keywords.slice(0, 4), unique.map(themeStoryFamilyKey)),
    name,
    slug,
    description: `Recurring news around ${name}.`,
    keywords: id.keywords,
    company_keys: id.company_keys,
    event_type_affinity: id.affinity,
    members,
    member_count_total: members.length,
    companies: [],
    sectors: [],
    scores: { freshness: 0, magnitude: 0, breadth: 0, persistence: 0, composite: 0 },
    tier: 'cooling',
    fresh_flow: 0,
    flow_series: [],
    related_themes: [],
    status: 'live',
    merged_into: null,
    first_seen: iso(now),
    last_flow,
    generation,
    rev: 1,
    needs_validation: generation === 'deterministic' ? true : undefined,
    // A fresh cluster can be much larger than one bounded model prompt. Queue every retained story now so
    // the compiler drains the complete evidence set FIFO across later passes; otherwise the first sample
    // silently becomes the whole classification ledger and large coherent themes can never clear the
    // coherence gate.
    pending_narrative_event_ids: generation === 'deterministic' ? members.map((member) => member.event_id) : undefined,
    validation_queued_at: generation === 'deterministic' ? iso(now) : undefined,
  }
  rebuildThemeCompanies(theme)
  return theme
}

/**
 * SELF-HEAL a live theme: re-derive its keyword/company identity from its CURRENT members using the
 * up-to-date tokenizer, then drop members that no longer match (a company hit OR ≥2 shared topic tokens —
 * the same bar assignment uses). This drains themes that were seeded before the tokenizer learned to
 * ignore SEC form codes ("424b2"/"filer"): the universal-magnet keywords disappear, and the routine
 * prospectus filings from unrelated banks that only ever attached THROUGH that magnet fall away. Healthy
 * themes are unaffected — recomputing identity from their own members reproduces the same keywords and
 * every member still matches (idempotent). Mutates the theme in place. Returns whether it changed and
 * whether it has decayed below the cluster minimums (caller retires it).
 */
export function refreshThemeIdentity(theme: Theme, cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG, now?: Date, generic?: Set<string>): { changed: boolean; retire: boolean; identityShift: number; purgeShare: number } {
  if (theme.status !== 'live' || !theme.members.length) return { changed: false, retire: false, identityShift: 0, purgeShare: 0 }
  const before = { count: theme.members.length, kw: theme.keywords.join('|') }
  const beforeKw = new Set(theme.keywords)
  // members persist source_tier as `tier` — map it back so the routine-filing gate inside themeTokens
  // applies at heal time exactly as it does at assignment time
  const asViews = (ms: ThemeMember[]) => ms.map((m) => ({ ...m, source_tier: m.tier })) as unknown as ThemeItemView[]
  // 1. select ONE dense core before deriving identity. The old algorithm derived a union identity from the
  // contaminated bag and then tested that same bag against it, allowing repeated contaminants to certify
  // themselves. A validated contract fixes the pair; a legacy row chooses its densest pair afresh.
  const declared = theme.narrative?.anchor_terms || []
  // A rolling boilerplate shift can invalidate a once-specific contract. Do not use that invalid pair to
  // purge its own evidence: the engine queues the full row for compiler re-grounding, which must find a
  // different exact non-generic pair before assignment resumes.
  if (declared.some((anchor) => generic?.has(anchor))) {
    return { changed: false, retire: false, identityShift: 0, purgeShare: 0 }
  }
  const activeFamilyState = activeNarrativeFamilyState(theme)
  let core = selectNarrativeCore(theme.narrative ? coreFamilyMembers(theme) : theme.members, declared, generic)
  if (core.anchors.length < 2 || new Set(core.members.map(themeStoryFamilyKey)).size < cfg.minClusterItems) {
    // A validated three-family thesis does not stop existing when one family's current state becomes a
    // cancellation, denial or restoration whose wording no longer repeats the frozen anchors. Re-ground
    // identity on its explicitly classified historical support, while qualification continues to resolve
    // the CURRENT family state and therefore keeps a challenged thesis non-actionable. Requiring both the
    // original dense core and the current family cardinality prevents same-family audit rows from rescuing
    // a cluster that never cleared the admission bar.
    const historicalSupport = narrativeFamilyClassifications(theme)
      .filter((row) => row.stance === 'supports')
      .map((row) => row.member)
    const historicalCore = selectNarrativeCore(historicalSupport, declared, generic)
    const historicalFamilies = new Set(historicalCore.members.map(themeStoryFamilyKey)).size
    const activeFamilies = new Set(activeFamilyState.map((row) => themeStoryFamilyKey(row.member))).size
    if (!theme.narrative || historicalCore.anchors.length < 2
      || historicalFamilies < cfg.minClusterItems || activeFamilies < cfg.minClusterItems) {
      return { changed: true, retire: true, identityShift: 1, purgeShare: 1 }
    }
    core = historicalCore
  }
  const challengeIds = new Set((theme.narrative?.evidence || []).filter((row) => row.stance === 'challenges').map((row) => row.event_id))
  const pendingBefore = [...new Set(theme.pending_narrative_event_ids || [])]
  const classifiedIds = new Set([
    ...(theme.narrative?.evidence || []).map((row) => row.event_id),
    ...(theme.narrative?.context_event_ids || []),
  ])
  // Fresh deterministic themes seed a pending list for first validation. Do not confuse that bootstrap
  // queue with UPDATE debt while self-healing; only ids outside a compiled narrative are update debt.
  const hasUnclassifiedPending = pendingBefore.some((eventId) => !classifiedIds.has(eventId))
  const hadNarrativeDebt = Boolean(theme.narrative
    && (theme.narrative_update_overflow === true
      || (theme.needs_narrative_update === true && hasUnclassifiedPending)))
  const pendingIds = new Set(hadNarrativeDebt ? pendingBefore : [])
  const coreMemberIds = new Set(core.members.map((member) => member.event_id))
  const activeStateIds = new Set(activeFamilyState.map((row) => row.member.event_id))
  const ordinaryKept = [
    ...core.members,
    ...theme.members.filter((member) => (activeStateIds.has(member.event_id) || challengeIds.has(member.event_id))
      && !coreMemberIds.has(member.event_id)),
  ]
  const stanceById = new Map((theme.narrative?.evidence || []).map((row) => [row.event_id, row.stance]))
  const filteredMembers = theme.members.filter((member) =>
    coreMemberIds.has(member.event_id) || activeStateIds.has(member.event_id)
      || challengeIds.has(member.event_id) || pendingIds.has(member.event_id))
  const kept = hadNarrativeDebt
    ? boundThemeFamilyHistory(filteredMembers, cfg.maxMembers, {
        priority: (member) => sourcePriority(member.tier),
        stance: (member) => stanceById.get(String(member.event_id)),
        preferred: (member) => pendingIds.has(String(member.event_id)),
      })
    : ordinaryKept.slice(-cfg.maxMembers)
  // 3. retire if too little real signal is left to be a multi-company theme
  const distinct = new Set<string>()
  for (const m of kept) for (const k of companyKeys(m.companies)) distinct.add(k)
  const keptFamilies = new Set(kept.map(themeStoryFamilyKey).filter(Boolean))
  const retire = keptFamilies.size < cfg.minClusterItems || distinct.size < cfg.minClusterCompanies
  if (retire) return { changed: true, retire: true, identityShift: 1, purgeShare: 1 }
  // 4. commit: kept members + identity derived only from that coherent core
  theme.members = kept
  const retainedIds = new Set(kept.map((member) => member.event_id))
  const retainedPending = hadNarrativeDebt
    ? pendingBefore.filter((eventId) => retainedIds.has(eventId))
    : theme.needs_validation ? kept.map((member) => member.event_id) : []
  if (retainedPending.length) theme.pending_narrative_event_ids = retainedPending
  else delete theme.pending_narrative_event_ids
  if (hadNarrativeDebt && retainedPending.length < pendingBefore.length) theme.narrative_update_overflow = true
  if (hadNarrativeDebt || theme.narrative_update_overflow) theme.needs_narrative_update = true
  const id2 = clusterIdentity(asViews(kept), generic)
  theme.keywords = [...new Set([...(core.anchors || []), ...id2.keywords])].slice(0, 14)
  theme.company_keys = id2.company_keys
  theme.event_type_affinity = id2.affinity
  rebuildThemeCompanies(theme)
  // dropping members invalidated the flow accounting derived from them: recompute last_flow from the kept
  // set, and reset+reseed the daily ring (mirrors the merge path above). Without this, purging the NEWEST
  // members leaves last_flow too recent — dodging mergeAndRetire's `parked && last_flow < cutoff` retire
  // test — and flow_daily keeps the purged events' counts, over-reporting the 7d/1m/3m window flow (§3,
  // never over-report). kept is non-empty here (an under-min cluster already retired above).
  theme.last_flow = kept.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), kept[0].found_at)
  theme.flow_daily = undefined
  theme.flow_daily_day = undefined
  if (now) ensureDaily(theme, now.getTime()) // engine always passes now; without it the next cycle's ensureDaily/rollDaily reseeds
  const changed = kept.length !== before.count || theme.keywords.join('|') !== before.kw
  if (changed) theme.rev++
  // how far the identity moved — the engine flags an LLM-named theme for re-naming when the heal shifted
  // its keywords or purged enough members that the persisted name/description likely describe the OLD mix
  const identityShift = 1 - jaccard(beforeKw, new Set(theme.keywords))
  const purgeShare = before.count ? 1 - kept.length / before.count : 0
  return { changed, retire: false, identityShift, purgeShare }
}

/** Cheap deterministic purity read: the share of members that name a top-5 identity company OR share ≥2
 *  (non-generic) identity keywords. O(members). Used by the engine as an EARLY heal trigger between
 *  discovery cycles — a theme drifting below the bar gets refreshThemeIdentity now instead of waiting
 *  for the cadence. Not a scoring input: the heal makes prolonged incoherence structurally impossible,
 *  so demotion machinery would be dead weight. */
export function coherenceOf(theme: Theme, generic?: Set<string>): number {
  if (!theme.members.length) return 1
  const familyMembers = coreFamilyMembers(theme)
  const core = selectNarrativeCore(familyMembers, theme.narrative?.anchor_terms || [], generic)
  return core.members.length / familyMembers.length
}

/** Discover new themes from the unclustered pool. Returns newly-created themes (status live) plus the
 *  leftover items that didn't form a qualifying cluster (kept in the pool for next time). */
export function discoverDeterministic(pool: ThemeItemView[], existing: Theme[], now: Date, cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG, generic?: Set<string>): { created: Theme[]; leftover: ThemeItemView[] } {
  // Family representatives drive scan/cardinality only. The raw bounded pool remains the audit source for
  // both created themes and leftovers; collapsing it here erased a cancellation/restoration on a first
  // under-min pass, so a later corroborating family could form a theme from only the restored headline.
  const allPool = [...pool].sort(oldestFirst)
  const uniquePool = familyRepresentativeItems(allPool)
  const scan = uniquePool.slice(-cfg.maxPoolScan)
  const skipped = uniquePool.slice(0, Math.max(0, uniquePool.length - cfg.maxPoolScan))
  const clusters = clusterItems(scan, generic)
  const created: Theme[] = []
  const leftoverFamilies = new Set(skipped.map(themeStoryFamilyKey))
  const existingIds = new Set(existing.map((t) => t.theme_id))
  // scan-relative document frequency: a token carried by ≥25% of the scan pool is wire-wide vocabulary
  // this pass, not a theme identity. Used below to refuse clusters glued together ONLY by such words
  // (the "results · ended · march" failure shape) even when future boilerplate isn't in any static list.
  const df = new Map<string, number>()
  for (const it of scan) for (const t of themeNarrativeTokens(it.headline, it.companies, it.source_tier, generic)) df.set(t, (df.get(t) || 0) + 1)
  const genericBar = Math.max(10, Math.ceil(scan.length * 0.25))
  for (const idxs of clusters) {
    const items = idxs.map((i) => scan[i])
    const distinctCompanies = new Set<string>()
    for (const it of items) for (const k of companyKeys(it.companies)) distinctCompanies.add(k)
    if (items.length < cfg.minClusterItems || distinctCompanies.size < cfg.minClusterCompanies) {
      for (const item of items) leftoverFamilies.add(themeStoryFamilyKey(item)) // not yet a theme — wait for more flow
      continue
    }
    const theme = createTheme(items, now, 'deterministic', generic)
    // Family representatives decide cardinality and cluster identity, but the created theme keeps a
    // bounded audit excerpt for every selected family: original/current changes, adverse/restorative
    // states, and best provenance. This preserves disconfirmation without letting updates form a theme.
    const selectedFamilies = new Set(items.map(themeStoryFamilyKey))
    const selectedHistory = allPool.filter((row) => selectedFamilies.has(themeStoryFamilyKey(row)))
    const selectedAudit = boundThemeFamilyHistory(selectedHistory.map(memberOf), selectedHistory.length, {
      priority: (member) => sourcePriority(member.tier),
    })
    // Consuming a qualifying cluster when its complete bounded audit cannot fit makes the excluded
    // families/updates disappear from both the Theme and the unclustered pool. Keep the whole cluster in
    // the durable pool instead; a later pass with capacity (or a different scan composition) can rebuild
    // it without approving a subset selected only by recency.
    const auditedFamilies = new Set(selectedAudit.map(themeStoryFamilyKey))
    if (selectedAudit.length > Math.max(0, Math.floor(cfg.maxMembers))
      || [...selectedFamilies].some((family) => !auditedFamilies.has(family))) {
      for (const item of items) leftoverFamilies.add(themeStoryFamilyKey(item))
      continue
    }
    theme.members = selectedAudit
    theme.member_count_total = selectedFamilies.size
    theme.pending_narrative_event_ids = theme.members.map((member) => member.event_id)
    theme.last_flow = theme.members.reduce((latest, member) => member.found_at > latest ? member.found_at : latest, '')
    rebuildThemeCompanies(theme)
    // quality guard: a theme needs an anchor — a RECURRING company, or at least one keyword that is
    // distinctive within this scan. A genuine macro wave passes (it carries a tariff target, a drug
    // name, "hormuz" — something below the bar); a cluster of wire-wide words does not.
    const anchored = theme.company_keys.length > 0 || theme.keywords.some((k) => (df.get(k) || 0) < genericBar)
    if (!anchored) {
      for (const item of items) leftoverFamilies.add(themeStoryFamilyKey(item)) // no real identity — wait for real anchors
      continue
    }
    if (existingIds.has(theme.theme_id) || created.some((t) => t.theme_id === theme.theme_id)) {
      for (const item of items) leftoverFamilies.add(themeStoryFamilyKey(item)) // let assignment fold them in next cycle
      continue
    }
    created.push(theme)
    existingIds.add(theme.theme_id)
  }
  // Retain bounded history for every unconsumed family, while consumed families disappear in full. Source
  // hierarchy resolves exact observation collisions, and the family cap prevents one update storm from
  // turning the cold pool into unbounded storage.
  const leftover = boundThemeFamilyHistory(
    allPool.filter((row) => leftoverFamilies.has(themeStoryFamilyKey(row))),
    allPool.length,
    { priority: (row) => sourcePriority(row.source_tier) },
  )
  return { created, leftover }
}

const CAUSAL_STOP = new Set(['the', 'and', 'for', 'that', 'this', 'with', 'from', 'into', 'through', 'will', 'would', 'could', 'more', 'less', 'than', 'then', 'their', 'named', 'evidence', 'company', 'companies'])
const causalTokens = (theme: Theme): Set<string> => {
  const text = [theme.narrative?.thesis, ...(theme.narrative?.mechanism_steps || []), ...(theme.narrative?.expressions || []).map((expression) => expression.mechanism)].join(' ').toLowerCase()
  return new Set((text.match(/[a-z][a-z0-9-]{2,}/g) || []).filter((token) => !CAUSAL_STOP.has(token)))
}

const expressionRelation = (a: Theme, b: Theme): { shared: number; opposite: boolean } => {
  let shared = 0
  let opposite = false
  for (const left of a.narrative?.expressions || []) {
    const leftMechanism = new Set((left.mechanism.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter((token) => !CAUSAL_STOP.has(token)))
    for (const right of b.narrative?.expressions || []) {
      if (left.name_key !== right.name_key) continue
      const rightMechanism = new Set((right.mechanism.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter((token) => !CAUSAL_STOP.has(token)))
      if (intersectionSize(leftMechanism, rightMechanism) < 2) continue // same ticker alone proves nothing
      shared++
      if (left.side !== right.side) opposite = true
    }
  }
  return { shared, opposite }
}

/** Link only validator-approved causal contracts. Shared issuers and raw keyword overlap are deliberately
 * absent: two theses must share a validated anchor/mechanism structure or the same sourced expression with
 * materially overlapping economic mechanisms. */
export function linkThemes(themes: Theme[], cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG): void {
  // Raw lexical clusters have no causal relationship to expose. Link only validator-approved theses.
  const live = themes.filter((t) => t.status === 'live' && t.narrative)
  for (const theme of themes) if (theme.status === 'live' && !theme.narrative) theme.related_themes = []
  for (const a of live) {
    const aCausal = causalTokens(a)
    const aAnchors = new Set(a.narrative!.anchor_terms)
    const edges: RelatedTheme[] = []
    for (const b of live) {
      if (b.theme_id === a.theme_id) continue
      const bCausal = causalTokens(b)
      const causalShared = intersectionSize(aCausal, bCausal)
      const causalOverlap = jaccard(aCausal, bCausal)
      const anchorShared = intersectionSize(aAnchors, new Set(b.narrative!.anchor_terms))
      const expressions = expressionRelation(a, b)
      const sameCausalStructure = anchorShared === 2 && causalShared >= 2
      const sameExpressionMechanism = expressions.shared > 0 && causalShared >= 2 && causalOverlap >= 0.2
      if (!sameCausalStructure && !sameExpressionMechanism) continue
      edges.push({
        theme_id: b.theme_id,
        name: b.name,
        shared_company_keys: expressions.shared,
        token_overlap: Math.round(causalOverlap * 100) / 100,
        kind: expressions.opposite ? 'opposite' : 'related',
      })
    }
    edges.sort((x, y) => y.shared_company_keys - x.shared_company_keys || y.token_overlap - x.token_overlap || x.theme_id.localeCompare(y.theme_id))
    a.related_themes = edges.slice(0, 6)
  }
}

/** Merge near-duplicate live themes (younger/lower-composite folds into the elder) and retire dead ones.
 *  Returns the set of theme_ids that changed (for re-persist + SSE). */
export function mergeAndRetire(themes: Theme[], now: Date, cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG): Set<string> {
  const changed = new Set<string>()
  const live = () => themes.filter((t) => t.status === 'live')

  // merge: scan pairs; fold the lower-composite into the higher
  const arr = live().sort((a, b) => b.scores.composite - a.scores.composite || (a.first_seen < b.first_seen ? -1 : 1))
  for (let i = 0; i < arr.length; i++) {
    const keep = arr[i]
    if (keep.status !== 'live') continue
    for (let j = i + 1; j < arr.length; j++) {
      const drop = arr[j]
      if (drop.status !== 'live') continue
      // Never merge a validated causal contract into a raw bag, or two contracts that do not share the
      // same complete anchor pair. Similar companies/topics are not proof of the same economic thesis.
      if (Boolean(keep.narrative) !== Boolean(drop.narrative)) continue
      if (keep.narrative && drop.narrative) {
        const sharedAnchors = intersectionSize(new Set(keep.narrative.anchor_terms), new Set(drop.narrative.anchor_terms))
        if (sharedAnchors !== 2) continue
        // Matching anchor words identify a subject, not a directionally identical investment thesis.
        // Merge validated contracts only when their full causal language is substantially the same and
        // no shared expression points in the opposite direction. Otherwise preserve both contracts and
        // let linkThemes expose their related/opposite relationship without destroying either thesis.
        const keepCausal = causalTokens(keep)
        const dropCausal = causalTokens(drop)
        const causalShared = intersectionSize(keepCausal, dropCausal)
        const causalOverlap = jaccard(keepCausal, dropCausal)
        const expressions = expressionRelation(keep, drop)
        if (expressions.opposite || causalShared < 4 || causalOverlap < 0.45) continue
      }
      const shared = intersectionSize(new Set(keep.company_keys), new Set(drop.company_keys))
      const keepKeywords = new Set(keep.keywords)
      const dropKeywords = new Set(drop.keywords)
      const narrativeOverlap = intersectionSize(keepKeywords, dropKeywords)
      const kw = jaccard(keepKeywords, dropKeywords)
      // Shared issuers can carry unrelated stories (e.g. capacity expansion vs a cyber incident). Company
      // overlap may SUPPORT a merge only when at least two narrative anchors also overlap; keyword-jaccard
      // remains the independent near-duplicate path and already implies a shared narrative.
      const companySupported = shared >= cfg.mergeSharedCompanies && narrativeOverlap >= 2
      const narrativeDuplicate = narrativeOverlap >= 2 && kw >= cfg.mergeKeywordJaccard
      if (companySupported || narrativeDuplicate) {
        const keepFamiliesBefore = new Set(keep.members.map(themeStoryFamilyKey))
        const dropFamiliesBefore = new Set(drop.members.map(themeStoryFamilyKey))
        const retainedFamilyOverlap = [...dropFamiliesBefore].filter((family) => keepFamiliesBefore.has(family)).length
        const mergedLifetimeFamilyCount = Math.max(
          new Set([...keepFamiliesBefore, ...dropFamiliesBefore]).size,
          Math.max(keepFamiliesBefore.size, keep.member_count_total || 0)
            + Math.max(dropFamiliesBefore.size, drop.member_count_total || 0)
            - retainedFamilyOverlap,
        )
        const explicitChallengeIds = new Set([
          ...(keep.narrative?.evidence || []).filter((row) => row.stance === 'challenges').map((row) => row.event_id),
          ...(drop.narrative?.evidence || []).filter((row) => row.stance === 'challenges').map((row) => row.event_id),
        ])
        const keeperClassifiedIds = new Set((keep.narrative?.evidence || []).map((row) => row.event_id))
        const mergedPendingIds = new Set([
          ...(keep.pending_narrative_event_ids || []),
          ...(drop.pending_narrative_event_ids || []),
          ...(drop.narrative?.evidence || []).filter((row) => row.stance === 'challenges').map((row) => row.event_id),
        ])
        const mergedAuditIds = new Set([
          ...narrativeReferenceEventIds(keep),
          ...narrativeReferenceEventIds(drop),
          ...mergedPendingIds,
        ])
        const hadMergedNarrativeDebt = keep.needs_narrative_update === true
          || drop.needs_narrative_update === true
          || keep.narrative_update_overflow === true
          || drop.narrative_update_overflow === true
          || mergedPendingIds.size > 0
        // Combine first, then let boundThemeFamilyHistory resolve exact observation collisions by source
        // hierarchy. Pre-deduping here kept whichever theme happened to win the merge ordering, allowing a
        // wire copy on the keeper to erase the folded theme's filing for the same event id.
        keep.members.push(...drop.members)
        // Two individually ordered rings are not ordered after simple concatenation. Re-sort by source
        // time BEFORE applying the bounded tail, otherwise a large older drop can evict the keeper's
        // freshest evidence and leave last_flow pointing at a row that is no longer in the proof ring.
        keep.members.sort((a, b) => {
          const aMs = Date.parse(a.found_at); const bMs = Date.parse(b.found_at)
          const safeA = Number.isFinite(aMs) ? aMs : Number.NEGATIVE_INFINITY
          const safeB = Number.isFinite(bMs) ? bMs : Number.NEGATIVE_INFINITY
          return safeA - safeB
        })
        const mergedCore = selectNarrativeCore(coreFamilyMembers(keep), keep.narrative?.anchor_terms || [])
        if (keep.generation !== 'deterministic') {
          for (const member of mergedCore.members) if (!keeperClassifiedIds.has(member.event_id)) mergedPendingIds.add(member.event_id)
        }
        // Challenges do not need to repeat the thesis anchors—their job is to falsify them. Keep every
        // explicit challenge from both contracts through the revalidation pass instead of pruning the
        // very evidence that could reverse the call.
        const challenges = keep.members.filter((member) => explicitChallengeIds.has(member.event_id))
        const challengeSet = new Set(challenges.map((member) => member.event_id))
        // Pending rows have not yet been adjudicated and therefore cannot be reconstructed from the old
        // narrative after a merge. Keep them beside explicit challenges; only the remaining slots are
        // filled by the shared anchor core. This prevents bounded-ring pruning from silently declaring
        // an unreviewed update classified.
        // Keep a bounded audit history. A burst can never grow either the member ring or its pending debt
        // past maxMembers; up to six newest observations per family remain available for state review.
        const mergedStanceById = new Map([
          ...(keep.narrative?.evidence || []),
          ...(drop.narrative?.evidence || []),
        ].map((row) => [row.event_id, row.stance]))
        keep.members = boundThemeFamilyHistory(keep.members, cfg.maxMembers, {
          priority: (member) => sourcePriority(member.tier),
          stance: (member) => mergedStanceById.get(String(member.event_id)),
          // Only rows that are genuinely unclassified by either pre-merge narrative get priority. Fresh
          // deterministic validation queues contain every historical member and must still resolve the
          // global hard cap by recency rather than arbitrary set insertion order.
          preferred: (member) => mergedPendingIds.has(String(member.event_id))
            && !mergedStanceById.has(String(member.event_id)),
        })
        // Preserve lifetime underlying-family cardinality across the fold. Observation history is bounded
        // and can contain several rows per family; neither raw member length nor a post-cap union is the
        // lifetime story count.
        keep.member_count_total = mergedLifetimeFamilyCount
        const retainedCoreIds = new Set(mergedCore.members.map((member) => member.event_id))
        const mergedIdentity = clusterIdentity(keep.members.filter((member) => retainedCoreIds.has(member.event_id) && !challengeSet.has(member.event_id)).map((member) => ({ ...member, source_tier: member.tier })) as ThemeItemView[])
        keep.keywords = [...new Set([...(mergedCore.anchors || []), ...mergedIdentity.keywords])].slice(0, 14)
        keep.company_keys = mergedIdentity.company_keys
        keep.event_type_affinity = mergedIdentity.affinity
        keep.last_flow = keep.members.reduce((latest, member) => {
          const memberMs = Date.parse(member.found_at)
          const latestMs = Date.parse(latest)
          return Number.isFinite(memberMs) && (!Number.isFinite(latestMs) || memberMs > latestMs) ? member.found_at : latest
        }, '')
        // re-seed keep's daily ring from the combined, de-duplicated member ring so a merge neither loses
        // the folded-in theme's flow nor double-counts events that were members of BOTH themes (an item
        // can belong to up to maxThemesPerItem themes). Recent-day truth comes from the member ring; daily
        // history older than the ring is bounded-loss on the rare merge, which is acceptable (§3 — never
        // over-report). The hourly series self-heals the same way (it's rebuilt from members each cycle).
        keep.flow_daily = undefined
        keep.flow_daily_day = undefined
        ensureDaily(keep, now.getTime())
        // The validator approved the PRE-merge narrative. Combining two clusters can change the name's
        // meaning and can add exactly the evidence/expression that clears admission, so fail closed until
        // the merged keeper is explicitly re-grounded on a later discovery pass.
        const retainedPendingIds = [...mergedPendingIds].filter((eventId) => keep.members.some((member) => member.event_id === eventId))
        const retainedMemberIds = new Set(keep.members.map((member) => member.event_id))
        const lostMergedAudit = [...mergedAuditIds].some((eventId) => !retainedMemberIds.has(eventId))
        keep.pending_narrative_event_ids = retainedPendingIds
        if (retainedPendingIds.length < mergedPendingIds.size
          || lostMergedAudit
          || keep.narrative_update_overflow === true
          || drop.narrative_update_overflow === true) keep.narrative_update_overflow = true
        if (keep.generation === 'deterministic') {
          // More than one fresh cluster can be discovered in a pass while the bounded compiler validates
          // only part of that batch. If two raw clusters merge, carry BOTH queues onto the keeper; retaining
          // the folded members without their debt would make half the evidence permanently invisible to the
          // validator even though qualification still counted it in the denominator.
          keep.needs_validation = true
          // Raw clusters have no narrative object to carry proof-loss state. If the merged validation FIFO
          // exceeded the audit cap, mark the same durable rebuild debt used by validated themes and never
          // let the compiler approve only the surviving subset.
          if (keep.narrative_update_overflow) keep.needs_narrative_update = true
          keep.validation_queued_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
          delete keep.validation_attempted_at
        } else {
          // A hard-cap eviction is not a classification. Preserve the quarantine flag even when only a
          // bounded subset of the merged pending queue can remain in the member audit ring.
          keep.needs_narrative_update = hadMergedNarrativeDebt || keep.narrative_update_overflow || undefined
          keep.needs_rename = true
          keep.validation_queued_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z')
          delete keep.validation_attempted_at
        }
        keep.rev++
        rebuildThemeCompanies(keep)
        drop.status = 'merged'
        drop.merged_into = keep.theme_id
        drop.rev++
        changed.add(keep.theme_id)
        changed.add(drop.theme_id)
      }
    }
  }

  // Retirement is age-based, not heat-gated. Magnitude and breadth deliberately do not decay, so using
  // `tier === parked` kept a broad year-old thesis alive forever despite the explicit 180-day horizon.
  const rawCutoff = now.getTime() - cfg.retireHours * 3_600_000
  const thesisCutoff = now.getTime() - cfg.thesisRetireDays * 24 * 3_600_000
  for (const t of live()) {
    const cutoff = t.narrative ? thesisCutoff : rawCutoff
    // A validated thesis ages from its latest explicit support/challenge classification. Raw matching
    // traffic, neutral context and still-pending rows are heat/review inputs, not evidence that the thesis
    // remains alive. Contractless clusters retain the legacy raw-flow clock.
    const memberById = new Map(t.members.map((member) => [member.event_id, member]))
    const evidenceClock = t.narrative
      ? Math.max(0, ...t.narrative.evidence.map((row) => Date.parse(memberById.get(row.event_id)?.found_at || '') || 0))
      : Date.parse(t.last_flow)
    const lifecycleFallback = Date.parse(t.narrative?.validated_at || t.first_seen) || 0
    if ((evidenceClock || lifecycleFallback) < cutoff) {
      t.status = 'retired'
      t.rev++
      changed.add(t.theme_id)
    }
  }
  return changed
}
