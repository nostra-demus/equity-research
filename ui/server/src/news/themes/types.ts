// Shapes for the dynamic themes layer — living investment narratives (e.g. "AI data-center buildout",
// "China rebound") that the ranked news firehose is bucketed into. Deliberately dependency-light
// (only the news CompanyGuess type) so the whole themes engine is unit-testable with no I/O.

import type { CompanyGuess, FeedItem } from '../types'

export type ThemeTier = 'hot' | 'active' | 'cooling' | 'parked'
export type ThemeStatus = 'live' | 'merged' | 'retired'
export type OrderTier = 1 | 2 | 3 // first / second / third order (direct → ripple)
export type ImpactSide = 'beneficiary' | 'harmed' | 'mixed'

// The beneficiary-map 4×25 impact rubric (.claude/agents/screener/thesis-structure/03_beneficiary-map.md),
// reused verbatim so a theme's company ordering speaks the same language as the gauntlet's tiers.
export interface Impact {
  directness: number // 0–25 (25 = one-step/immediate, 15 = two-step, 5 = three+ step)
  magnitude: number // 0–25 (size of the effect)
  speed: number // 0–25 (how fast it plays out)
  reversibility: number // 0–25 (25 = structurally permanent, 5 = easily hedged/substituted)
  composite: number // sum, 0–100
}

export interface ThemeCompany {
  name: string
  ticker: string | null
  listing_country: string | null
  name_key: string // normName() — the join key
  order: OrderTier
  side: ImpactSide
  impact: Impact
  mention_count: number // # member items naming this company (the realness anchor)
  last_seen: string // ISO
}

export interface ThemeSector {
  sector: string // GICS-ish label, no ticker
  order: OrderTier
  side: ImpactSide
  impact: Impact
}

export interface ThemeScores {
  freshness: number // recent flow, time-decayed
  magnitude: number // volume × member materiality/source-tier
  breadth: number // distinct companies/sectors — realness (a flash scores low)
  persistence: number // fraction of recent windows with flow (sustained vs one burst)
  composite: number // 0–100 — the rank key
}

// A compact per-member record kept on the theme (a bounded ring, newest kept) — enough for the
// deterministic scorer to compute freshness/magnitude/persistence without re-reading the firehose.
// The full event is resolved against readFeed() only on the deep-dive API call.
export interface ThemeMember {
  event_id: string
  headline: string
  found_at: string // ISO
  score: number // the item's composite triage_score (0–100)
  tier: string // source_tier (primary_filing … unconfirmed)
  // carried so the theme's company list + order tiers can be rebuilt from its members (score.ts
  // ignores these; assign.ts/order.ts use them). Kept compact.
  companies?: CompanyGuess[]
  event_types?: string[]
  issuer_linkage?: string
}

export interface RelatedTheme {
  theme_id: string
  name: string
  shared_company_keys: number
  token_overlap: number // jaccard of keyword sets
  kind: 'related' | 'opposite' // opposite = same blast radius, beneficiary vs harmed (a pair trade)
}

export interface Theme {
  theme_id: string // THM-<sha256-8 of slug> — content-stable across rebuilds
  name: string // "AI data-center buildout"
  slug: string
  description: string // one plain-English line (§21)
  // membership criteria (deterministic assignment — no LLM at assign time)
  keywords: string[] // anchor topic tokens (lowercased)
  company_keys: string[] // normName keys that strongly belong
  event_type_affinity: string[] // e.g. ['product','capital_actions']
  // members — a bounded ring (newest kept, cap themesMaxMembers); carries just enough to score
  // without re-reading the firehose. The deep-dive API resolves event_id → full FeedItem.
  members: ThemeMember[]
  member_count_total: number // lifetime counter (uncapped)
  companies: ThemeCompany[]
  sectors: ThemeSector[]
  // ranking
  scores: ThemeScores
  tier: ThemeTier
  fresh_flow: number // # members added in the last freshness window (for the UI sparkline tip)
  flow_series: number[] // recent per-window member counts (the sparkline data; bounded)
  related_themes: RelatedTheme[]
  // lifecycle
  status: ThemeStatus
  merged_into: string | null
  first_seen: string
  last_flow: string // ISO of the most recent member item
  generation: 'deterministic' | 'groq' | 'claude' // provenance of the discovery/naming
  rev: number // bumped on every mutation (SSE dedup / change detection)
}

// A compact projection for the live SSE bus + the index list view (no member arrays).
export interface ThemeSummary {
  theme_id: string
  name: string
  description: string
  tier: ThemeTier
  composite: number
  fresh_flow: number
  flow_series: number[]
  member_count: number
  top_companies: { name: string; ticker: string | null; order: OrderTier; side: ImpactSide }[]
  related_themes: { theme_id: string; name: string; kind: 'related' | 'opposite' }[]
  last_flow: string
  rev: number
}

export interface ThemesIndex {
  generated_at: string
  themes: ThemeSummary[]
  counts: { hot: number; active: number; cooling: number; parked: number; retired: number; total: number }
}

export interface CompaniesByOrder {
  first: ThemeCompany[]
  second: ThemeCompany[]
  third: ThemeCompany[]
}

// The deep-dive payload: a theme + its ranked member events (full FeedItems) + companies grouped by order.
export interface ThemeDetail {
  theme: ThemeSummary
  scores: ThemeScores
  members: FeedItem[]
  companies_by_order: CompaniesByOrder
  sectors: ThemeSector[]
  related_themes: RelatedTheme[]
  keywords: string[]
}

// The minimal item view the themes engine needs from a triaged item / feed item (so assign/score can
// run over either a fresh TriagedItem or a backfilled FeedItem without coupling to their full shapes).
export interface ThemeItemView {
  event_id: string
  headline: string
  found_at: string // ISO
  companies?: CompanyGuess[]
  event_types?: string[]
  issuer_linkage?: string
  triage_score?: number
  materiality_pre_score?: number
  source_tier?: string
  scope?: string
  region?: string
}

// One mutation line appended to screener/ledger/themes.ndjson (last-line-per-theme_id wins on rebuild).
export interface ThemeMutation {
  kind: 'theme'
  ts: string
  theme: Theme
}
