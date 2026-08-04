// Theme DISCOVERY — the periodic step (hourly) that turns the unclustered pool into NEW themes, and
// keeps the theme set healthy (merge near-duplicates, retire dead ones). The clustering is fully
// deterministic (connected components over a shared-company / shared-topic graph — free, repeatable);
// the optional Claude-Haiku pass in llm.ts only NAMES + VALIDATES the clusters and proposes ripple
// companies, so turning the LLM off degrades gracefully to this deterministic baseline.

import { createHash } from 'node:crypto'
import { companyKeys, themeNarrativeTokens, intersectionSize, jaccard } from '../text-match'
import { rebuildThemeCompanies, overlapScore } from './assign'
import { ensureDaily } from './score'
import { themeStoryKey } from './story-key'
import type { Theme, ThemeItemView, ThemeMember, RelatedTheme } from './types'

export interface DiscoverConfig {
  minClusterItems: number // a real theme needs at least this many items
  minClusterCompanies: number // …and at least this many distinct companies (a flash is one stock)
  maxPoolScan: number // cap the O(n²) clustering to the most recent N unclustered items
  maxMembers: number
  retireHours: number // a parked theme with no flow for this long is retired
  mergeSharedCompanies: number // company-supported merge floor; still requires ≥2 shared narrative anchors
  mergeKeywordJaccard: number // …or with keyword jaccard above this
}
export const DEFAULT_DISCOVER_CONFIG: DiscoverConfig = {
  minClusterItems: 3,
  minClusterCompanies: 2,
  maxPoolScan: 600,
  maxMembers: 400,
  retireHours: 72,
  mergeSharedCompanies: 3,
  mergeKeywordJaccard: 0.5,
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'theme'
const themeId = (slug: string) => 'THM-' + createHash('sha256').update(slug).digest('hex').slice(0, 8)
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

/** One newest representative per story, returned in explicit oldest→newest source-time order. */
function uniqueStoryItems<T extends { event_id: string; dedup_group?: string; found_at?: string }>(items: T[]): T[] {
  const ordered = [...items].sort(oldestFirst)
  const seen = new Set<string>()
  const reversed: T[] = []
  for (let i = ordered.length - 1; i >= 0; i--) {
    const key = themeStoryKey(ordered[i])
    if (seen.has(key)) continue
    seen.add(key)
    reversed.push(ordered[i])
  }
  return reversed.reverse()
}

// memo: each item's company keys + theme-layer topic tokens (computed once for the clustering graph)
function itemSig(it: ThemeItemView, generic?: Set<string>): { keys: Set<string>; toks: Set<string> } {
  return { keys: companyKeys(it.companies), toks: themeNarrativeTokens(it.headline, it.companies, it.source_tier, generic) }
}

/** Connected-components clustering: a shared company is supporting context, never a theme by itself.
 *  Items connect on ≥3 narrative tokens, or on ≥2 when they also share a company. The stricter edge is
 *  important because connected components amplify one weak bridge into a giant incoherent cluster. */
export function clusterItems(items: ThemeItemView[], generic?: Set<string>): number[][] {
  const n = items.length
  const sigs = items.map((it) => itemSig(it, generic))
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const union = (a: number, b: number) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb }
  // Edge bar for FORMING a new cluster is deliberately strict (shared company OR ≥3 shared topic
  // tokens) — connected-components chains transitively, so a ≥2-token edge merges unrelated items
  // through generic bridge words. Assignment to an already-defined theme stays the looser ≥2 bar.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const companies = intersectionSize(sigs[i].keys, sigs[j].keys)
      const narrative = intersectionSize(sigs[i].toks, sigs[j].toks)
      if (narrative >= 3 || (companies >= 1 && narrative >= 2)) union(i, j)
    }
  }
  const groups = new Map<number, number[]>()
  for (let i = 0; i < n; i++) {
    const r = find(i)
    if (!groups.has(r)) groups.set(r, [])
    groups.get(r)!.push(i)
  }
  return [...groups.values()].sort((a, b) => b.length - a.length)
}

function memberOf(it: ThemeItemView): ThemeMember {
  return {
    event_id: it.event_id,
    dedup_group: it.dedup_group,
    headline: it.headline,
    headline_en: it.headline_en,
    found_at: it.found_at,
    score: typeof it.triage_score === 'number' ? it.triage_score : it.materiality_pre_score || 0,
    tier: it.source_tier || 'news',
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
  const unique = uniqueStoryItems(items)
  const id = clusterIdentity(unique, generic)
  const name = deterministicName(id)
  const slug = slugify(name)
  const members = unique.map(memberOf)
  const last_flow = members.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), members[0]?.found_at || iso(now))
  const theme: Theme = {
    theme_id: themeId(slug),
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
  // 1. recompute identity from the current members (clean tokenizer)
  const id = clusterIdentity(asViews(theme.members), generic)
  const probe: Theme = { ...theme, keywords: id.keywords, company_keys: id.company_keys, event_type_affinity: id.affinity }
  // 2. keep only members that still clear the assignment bar against the refreshed identity
  const kept = theme.members.filter((m) => overlapScore(companyKeys(m.companies), themeNarrativeTokens(m.headline, m.companies, m.tier, generic), m.event_types || [], probe).matched)
  // 3. retire if too little real signal is left to be a multi-company theme
  const distinct = new Set<string>()
  for (const m of kept) for (const k of companyKeys(m.companies)) distinct.add(k)
  const retire = kept.length < cfg.minClusterItems || distinct.size < cfg.minClusterCompanies
  if (retire) return { changed: true, retire: true, identityShift: 1, purgeShare: 1 }
  // 4. commit: kept members + refreshed identity, then a second identity pass tightened to the kept set
  theme.members = kept
  const id2 = clusterIdentity(asViews(kept), generic)
  theme.keywords = id2.keywords
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
  const topKeys = new Set(theme.company_keys.slice(0, 5))
  const kw = new Set(theme.keywords)
  let ok = 0
  for (const m of theme.members) {
    const companyHit = intersectionSize(companyKeys(m.companies), topKeys) >= 1
    const narrativeHit = kw.size ? intersectionSize(themeNarrativeTokens(m.headline, m.companies, m.tier, generic), kw) : 0
    const hit = narrativeHit >= 2 || (companyHit && narrativeHit >= 1)
    if (hit) ok++
  }
  return ok / theme.members.length
}

/** Discover new themes from the unclustered pool. Returns newly-created themes (status live) plus the
 *  leftover items that didn't form a qualifying cluster (kept in the pool for next time). */
export function discoverDeterministic(pool: ThemeItemView[], existing: Theme[], now: Date, cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG, generic?: Set<string>): { created: Theme[]; leftover: ThemeItemView[] } {
  // Deduplicate the WHOLE pool before taking the scan tail. Deduping only `scanRaw` left an older copy in
  // `skipped` whenever publisher copies straddled the maxPoolScan boundary, so the consumed story came
  // back on every later pass. Keep the newest representative and its true position in the pool.
  const uniquePool = uniqueStoryItems(pool)
  const scan = uniquePool.slice(-cfg.maxPoolScan)
  const skipped = uniquePool.slice(0, Math.max(0, uniquePool.length - cfg.maxPoolScan))
  const clusters = clusterItems(scan, generic)
  const created: Theme[] = []
  const leftover: ThemeItemView[] = [...skipped]
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
      leftover.push(...items) // not yet a theme — wait for more flow
      continue
    }
    const theme = createTheme(items, now, 'deterministic', generic)
    // quality guard: a theme needs an anchor — a RECURRING company, or at least one keyword that is
    // distinctive within this scan. A genuine macro wave passes (it carries a tariff target, a drug
    // name, "hormuz" — something below the bar); a cluster of wire-wide words does not.
    const anchored = theme.company_keys.length > 0 || theme.keywords.some((k) => (df.get(k) || 0) < genericBar)
    if (!anchored) {
      leftover.push(...items) // no real identity — stay in the pool until real anchors accrue
      continue
    }
    if (existingIds.has(theme.theme_id) || created.some((t) => t.theme_id === theme.theme_id)) {
      leftover.push(...items) // collides with a known theme id (same slug) — let assignment fold them in next cycle
      continue
    }
    created.push(theme)
    existingIds.add(theme.theme_id)
  }
  return { created, leftover }
}

/** Deterministic theme→theme edges: related (shared companies/keywords) / opposite (shared blast radius,
 *  beneficiary vs harmed). Recomputed each discovery pass. */
export function linkThemes(themes: Theme[], cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG): void {
  const live = themes.filter((t) => t.status === 'live')
  for (const a of live) {
    const aKeys = new Set(a.company_keys)
    const aKw = new Set(a.keywords)
    const aHarmed = a.companies.some((c) => c.side === 'harmed')
    const edges: RelatedTheme[] = []
    for (const b of live) {
      if (b.theme_id === a.theme_id) continue
      const shared = intersectionSize(aKeys, new Set(b.company_keys))
      const kw = jaccard(aKw, new Set(b.keywords))
      if (shared >= 2 || kw >= cfg.mergeKeywordJaccard * 0.6) {
        const bHarmed = b.companies.some((c) => c.side === 'harmed')
        edges.push({ theme_id: b.theme_id, name: b.name, shared_company_keys: shared, token_overlap: Math.round(kw * 100) / 100, kind: aHarmed !== bHarmed && shared >= 2 ? 'opposite' : 'related' })
      }
    }
    edges.sort((x, y) => y.shared_company_keys - x.shared_company_keys || y.token_overlap - x.token_overlap)
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
        const seen = new Set(keep.members.map(themeStoryKey))
        for (const m of drop.members) {
          const story = themeStoryKey(m)
          if (!seen.has(story)) { keep.members.push(m); seen.add(story) }
        }
        // Two individually ordered rings are not ordered after simple concatenation. Re-sort by source
        // time BEFORE applying the bounded tail, otherwise a large older drop can evict the keeper's
        // freshest evidence and leave last_flow pointing at a row that is no longer in the proof ring.
        keep.members.sort((a, b) => {
          const aMs = Date.parse(a.found_at); const bMs = Date.parse(b.found_at)
          const safeA = Number.isFinite(aMs) ? aMs : Number.NEGATIVE_INFINITY
          const safeB = Number.isFinite(bMs) ? bMs : Number.NEGATIVE_INFINITY
          return safeA - safeB
        })
        if (keep.members.length > cfg.maxMembers) keep.members.splice(0, keep.members.length - cfg.maxMembers)
        // Lifetime publisher-copy totals are not a useful measure of a theme. From this merge onward the
        // counter is repaired to the unique evidence carried by the bounded member ring.
        keep.member_count_total = keep.members.length
        keep.keywords = [...new Set([...keep.keywords, ...drop.keywords])].slice(0, 14)
        keep.company_keys = [...new Set([...keep.company_keys, ...drop.company_keys])].slice(0, 16)
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
        if (keep.generation !== 'deterministic') keep.needs_rename = true
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

  // retire: parked + no flow for retireHours
  const cutoff = now.getTime() - cfg.retireHours * 3_600_000
  for (const t of live()) {
    if (t.tier === 'parked' && new Date(t.last_flow).getTime() < cutoff) {
      t.status = 'retired'
      t.rev++
      changed.add(t.theme_id)
    }
  }
  return changed
}
