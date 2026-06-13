// Composite ranking — turns the cheap Groq title-score into a defensible PRIORITY for the inbox.
//
// Why this exists: the Groq pre-score reads the TITLE only. That systematically UNDER-rates terse
// primary filings — an "8-K - Acme Corp (Filer)" or an NSE "Acme Ltd: Outcome of Board Meeting" can
// be a buyback, an M&A, or a default, yet the bare title scores low, so it gets buried beneath a
// verbose news headline. That inverts the source hierarchy (CLAUDE.md §4: filings > official data >
// company PR > news > rumour). This layer corrects it DETERMINISTICALLY — no extra LLM call, so it is
// free and repeatable (CLAUDE.md §12: every score must be explainable from evidence rows, not vibes).
//
// rank_score = clamp( materiality                       // the Groq read stays the anchor
//                     + source-tier bonus               // §4 hierarchy (the bias fix)
//                     + scope bonus                      // company-specific > broad/macro
//                     + strongest event-type bonus       // M&A / guidance / default / enforcement …
//                     + size bonus                       // bigger = more investable / liquid
//                     + recency bonus , 0, 100)
// Weights are modest on purpose: a plain news item barely moves; a material filing or a rumour moves a
// lot. Every component is returned in rank_factors so the cockpit can show the WHY.

import { deriveScope, deriveSourceTier, familyOf, SOURCE_TIERS, type ScopeId, type SourceTierId } from './scope'

export interface RankInput {
  materiality_pre_score?: number | null
  issuer_linkage?: string | null
  companies?: { name?: string; ticker?: string | null }[] | null
  event_types?: string[] | null
  input_nature?: string | null
  headline?: string | null
  size_bucket?: string | null
  found_at?: string | null // ISO — for the recency bonus
}

export interface RankFactors {
  materiality: number // the Groq base (0–100), the anchor
  source_tier: number // §4 hierarchy bonus
  scope: number // company-vs-broad bonus
  event: number // strongest event-type bonus
  size: number // company-size bonus
  recency: number // freshness bonus
  scope_id: ScopeId
  source_tier_id: SourceTierId
}

export interface Ranked {
  rank_score: number
  rank_factors: RankFactors
}

// --- weights (all additive points on the 0–100 scale; tune via NEWS_RANK_BOOST_WEIGHT) ---

// §4 source hierarchy — the bias fix. A primary filing/exchange disclosure earns the most lift
// because the title-only Groq read most under-rates it; a rumour is pushed down hard.
const TIER_BONUS: Record<SourceTierId, number> = {
  primary_filing: 8,
  official_data: 5,
  company: 3,
  news: 0,
  unconfirmed: -8,
}

// Actionability — a specific listed name can become a single-stock idea; macro is context, not a stock.
const SCOPE_BONUS: Record<ScopeId, number> = {
  single_name: 6,
  multi_name: 5,
  policy: 2,
  commodity: 1,
  sector: 0,
  macro: -4,
  unknown: -2,
}

// Strongest event in the headline (we take the MAX, never the sum — one big event drives priority).
const EVENT_BONUS: Record<string, number> = {
  mna: 9,
  guidance_change: 7,
  debt_credit: 7,
  capital_actions: 6,
  litigation_enforcement: 6,
  earnings_revenue_margin: 5,
  management: 4,
  regulatory: 4,
  cybersecurity: 4,
  product: 3,
  commercial: 3,
  operations: 2,
  macro_sector: 1,
  rumor: -3,
}

const SIZE_BONUS: Record<string, number> = { mega: 2, large: 2, mid: 1, small: -1, unknown: 0 }

function recencyBonus(foundAt: string | null | undefined, now: Date): number {
  if (!foundAt) return 0
  const t = new Date(foundAt).getTime()
  if (Number.isNaN(t)) return 0
  const hrs = (now.getTime() - t) / 3_600_000
  if (hrs < 0) return 5 // future-stamped (clock skew) — treat as brand new
  if (hrs < 1) return 5
  if (hrs < 3) return 4
  if (hrs < 6) return 3
  if (hrs < 12) return 2
  if (hrs < 24) return 1
  return 0
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/**
 * Compute the composite priority for one item. `boostWeight` scales the deterministic adjustment
 * (1 = full; 0 = pure Groq score) so the blend is tunable without a code change.
 */
export function rankScore(it: RankInput, now: Date = new Date(), boostWeight = 1): Ranked {
  const materiality = clamp(Math.round(Number(it.materiality_pre_score) || 0), 0, 100)
  const scope_id = deriveScope(it)
  const source_tier_id = deriveSourceTier(it)

  const source_tier = TIER_BONUS[source_tier_id] ?? 0
  const scope = SCOPE_BONUS[scope_id] ?? 0
  const types = (it.event_types || []).map((t) => String(t).toLowerCase())
  const event = types.length ? Math.max(0, ...types.map((t) => EVENT_BONUS[t] ?? 0), ...(types.includes('rumor') ? [EVENT_BONUS.rumor] : [])) : 0
  // include the rumor penalty even though it's negative (Math.max with 0 would drop it) — only when rumor is the ONLY signal
  const eventAdj = types.includes('rumor') && types.every((t) => (EVENT_BONUS[t] ?? 0) <= 0) ? EVENT_BONUS.rumor : event
  const size = SIZE_BONUS[String(it.size_bucket || 'unknown').toLowerCase()] ?? 0
  const recency = recencyBonus(it.found_at, now)

  const w = clamp(boostWeight, 0, 2)
  const boost = (source_tier + scope + eventAdj + size + recency) * w
  const rank_score = clamp(Math.round(materiality + boost), 0, 100)

  return {
    rank_score,
    rank_factors: { materiality, source_tier, scope, event: eventAdj, size, recency, scope_id, source_tier_id },
  }
}

/** Family (company vs broad) for the winning scope — handy for the UI without re-deriving. */
export function rankFamily(f: RankFactors): 'company' | 'broad' | 'unknown' {
  return familyOf(f.scope_id)
}

// re-export the tier rank for any caller that wants the raw §4 number
export function sourceTierRank(id: SourceTierId): number {
  return SOURCE_TIERS[id]?.rank ?? 0
}
