// Theme DISCOVERY — the periodic step (hourly) that turns the unclustered pool into NEW themes, and
// keeps the theme set healthy (merge near-duplicates, retire dead ones). The clustering is fully
// deterministic (connected components over a shared-company / shared-topic graph — free, repeatable);
// the optional Claude-Haiku pass in llm.ts only NAMES + VALIDATES the clusters and proposes ripple
// companies, so turning the LLM off degrades gracefully to this deterministic baseline.

import { createHash } from 'node:crypto'
import { companyKeys, topicTokens, intersectionSize, jaccard } from '../text-match'
import { rebuildThemeCompanies, overlapScore } from './assign'
import { ensureDaily } from './score'
import type { Theme, ThemeItemView, ThemeMember, RelatedTheme } from './types'

export interface DiscoverConfig {
  minClusterItems: number // a real theme needs at least this many items
  minClusterCompanies: number // …and at least this many distinct companies (a flash is one stock)
  maxPoolScan: number // cap the O(n²) clustering to the most recent N unclustered items
  maxMembers: number
  retireHours: number // a parked theme with no flow for this long is retired
  mergeSharedCompanies: number // merge two live themes sharing ≥ this many company keys
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

// memo: each item's company keys + topic tokens (computed once for the clustering graph)
function itemSig(it: ThemeItemView): { keys: Set<string>; toks: Set<string> } {
  return { keys: companyKeys(it.companies), toks: topicTokens(it.headline, it.companies) }
}

/** Connected-components clustering: items i,j share an edge when they share a company OR ≥2 topic
 *  tokens (the "actually about the same thing" bar). Returns clusters of indices, largest first. */
export function clusterItems(items: ThemeItemView[]): number[][] {
  const n = items.length
  const sigs = items.map(itemSig)
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const union = (a: number, b: number) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb }
  // Edge bar for FORMING a new cluster is deliberately strict (shared company OR ≥3 shared topic
  // tokens) — connected-components chains transitively, so a ≥2-token edge merges unrelated items
  // through generic bridge words. Assignment to an already-defined theme stays the looser ≥2 bar.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (intersectionSize(sigs[i].keys, sigs[j].keys) >= 1 || intersectionSize(sigs[i].toks, sigs[j].toks) >= 3) union(i, j)
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
    headline: it.headline,
    found_at: it.found_at,
    score: typeof it.triage_score === 'number' ? it.triage_score : it.materiality_pre_score || 0,
    tier: it.source_tier || 'news',
    companies: (it.companies || []).slice(0, 4),
    event_types: (it.event_types || []).slice(0, 6),
    issuer_linkage: it.issuer_linkage,
  }
}

/** The recurring keywords/companies/event-types that DEFINE a cluster (appear in ≥2 items). */
function clusterIdentity(items: ThemeItemView[]): { keywords: string[]; company_keys: string[]; affinity: string[]; topCompanyName: string } {
  const tokFreq = new Map<string, number>()
  const keyFreq = new Map<string, number>()
  const keyName = new Map<string, string>()
  const evFreq = new Map<string, number>()
  for (const it of items) {
    for (const t of topicTokens(it.headline, it.companies)) tokFreq.set(t, (tokFreq.get(t) || 0) + 1)
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
  return { keywords: keywords.length ? keywords : [...tokFreq.keys()].slice(0, 6), company_keys, affinity, topCompanyName }
}

/** A crude deterministic name (the Claude pass replaces it with a narrative one). */
function deterministicName(id: ReturnType<typeof clusterIdentity>): string {
  if (id.topCompanyName) return id.topCompanyName + (id.keywords[0] && !id.topCompanyName.toLowerCase().includes(id.keywords[0]) ? ` · ${id.keywords[0]}` : '')
  return id.keywords.slice(0, 3).join(' · ') || 'Emerging cluster'
}

/** Build a fresh Theme from a cluster of items. */
export function createTheme(items: ThemeItemView[], now: Date, generation: Theme['generation'] = 'deterministic'): Theme {
  const id = clusterIdentity(items)
  const name = deterministicName(id)
  const slug = slugify(name)
  const members = items.map(memberOf)
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
export function refreshThemeIdentity(theme: Theme, cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG): { changed: boolean; retire: boolean } {
  if (theme.status !== 'live' || !theme.members.length) return { changed: false, retire: false }
  const before = { count: theme.members.length, kw: theme.keywords.join('|') }
  // 1. recompute identity from the current members (clean tokenizer)
  const id = clusterIdentity(theme.members as unknown as ThemeItemView[])
  const probe: Theme = { ...theme, keywords: id.keywords, company_keys: id.company_keys, event_type_affinity: id.affinity }
  // 2. keep only members that still clear the assignment bar against the refreshed identity
  const kept = theme.members.filter((m) => overlapScore(companyKeys(m.companies), topicTokens(m.headline, m.companies), m.event_types || [], probe).matched)
  // 3. retire if too little real signal is left to be a multi-company theme
  const distinct = new Set<string>()
  for (const m of kept) for (const k of companyKeys(m.companies)) distinct.add(k)
  const retire = kept.length < cfg.minClusterItems || distinct.size < cfg.minClusterCompanies
  if (retire) return { changed: true, retire: true }
  // 4. commit: kept members + refreshed identity, then a second identity pass tightened to the kept set
  theme.members = kept
  const id2 = clusterIdentity(kept as unknown as ThemeItemView[])
  theme.keywords = id2.keywords
  theme.company_keys = id2.company_keys
  theme.event_type_affinity = id2.affinity
  rebuildThemeCompanies(theme)
  const changed = kept.length !== before.count || theme.keywords.join('|') !== before.kw
  if (changed) theme.rev++
  return { changed, retire: false }
}

/** Discover new themes from the unclustered pool. Returns newly-created themes (status live) plus the
 *  leftover items that didn't form a qualifying cluster (kept in the pool for next time). */
export function discoverDeterministic(pool: ThemeItemView[], existing: Theme[], now: Date, cfg: DiscoverConfig = DEFAULT_DISCOVER_CONFIG): { created: Theme[]; leftover: ThemeItemView[] } {
  const scan = pool.slice(-cfg.maxPoolScan)
  const skipped = pool.slice(0, Math.max(0, pool.length - cfg.maxPoolScan))
  const clusters = clusterItems(scan)
  const created: Theme[] = []
  const leftover: ThemeItemView[] = [...skipped]
  const existingIds = new Set(existing.map((t) => t.theme_id))
  for (const idxs of clusters) {
    const items = idxs.map((i) => scan[i])
    const distinctCompanies = new Set<string>()
    for (const it of items) for (const k of companyKeys(it.companies)) distinctCompanies.add(k)
    if (items.length < cfg.minClusterItems || distinctCompanies.size < cfg.minClusterCompanies) {
      leftover.push(...items) // not yet a theme — wait for more flow
      continue
    }
    const theme = createTheme(items, now)
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
      const kw = jaccard(new Set(keep.keywords), new Set(drop.keywords))
      if (shared >= cfg.mergeSharedCompanies || kw >= cfg.mergeKeywordJaccard) {
        const seen = new Set(keep.members.map((m) => m.event_id))
        for (const m of drop.members) if (!seen.has(m.event_id)) keep.members.push(m)
        if (keep.members.length > cfg.maxMembers) keep.members.splice(0, keep.members.length - cfg.maxMembers)
        keep.member_count_total += drop.member_count_total
        keep.keywords = [...new Set([...keep.keywords, ...drop.keywords])].slice(0, 14)
        keep.company_keys = [...new Set([...keep.company_keys, ...drop.company_keys])].slice(0, 16)
        if (drop.last_flow > keep.last_flow) keep.last_flow = drop.last_flow
        // re-seed keep's daily ring from the combined, de-duplicated member ring so a merge neither loses
        // the folded-in theme's flow nor double-counts events that were members of BOTH themes (an item
        // can belong to up to maxThemesPerItem themes). Recent-day truth comes from the member ring; daily
        // history older than the ring is bounded-loss on the rare merge, which is acceptable (§3 — never
        // over-report). The hourly series self-heals the same way (it's rebuilt from members each cycle).
        keep.flow_daily = undefined
        keep.flow_daily_day = undefined
        ensureDaily(keep, now.getTime())
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
