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
import { getRankWeights, type RankWeights } from './rank-weights'
import type { Band } from './types'

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
  boost_weight?: number // global multiplier applied to (source_tier+scope+event+size+recency) for THIS score (1 = none); always set on output, optional on input (records predating the field)
  scope_id: ScopeId
  source_tier_id: SourceTierId
}

export interface Ranked {
  rank_score: number
  rank_factors: RankFactors
}

// --- weights ---
// The additive-points tables (source tier, scope, event, size, recency) and the global boost multiplier
// now live in rank-weights.ts (DEFAULT_RANK_WEIGHTS = the original consts) so the cockpit Scoring panel
// can tune them at runtime. Everything below READS the active set; the defaults reproduce prior scoring.

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

// Strongest event in the headline (we take the MAX, never the sum — one big event drives priority). The
// rumor penalty is negative, so Math.max(0, …) would normally drop it; let it show only when rumor is the
// ONLY signal (every type non-positive), so a bare rumour is pushed down rather than scored neutral.
function eventBonus(eventTypes: (string | null | undefined)[] | null | undefined, ev: Record<string, number>): number {
  const types = (eventTypes || []).map((t) => String(t || '').toLowerCase()).filter(Boolean)
  if (!types.length) return 0
  const positive = Math.max(0, ...types.map((t) => ev[t] ?? 0))
  if (types.includes('rumor') && types.every((t) => (ev[t] ?? 0) <= 0)) return ev.rumor ?? 0
  return positive
}

// Freshness → points. The thresholds are fixed; the points per bucket are tunable (weights.recency).
function recencyBonus(foundAt: string | null | undefined, now: Date, pts: Record<string, number>): number {
  if (!foundAt) return 0
  const t = new Date(foundAt).getTime()
  if (Number.isNaN(t)) return 0
  const hrs = (now.getTime() - t) / 3_600_000
  if (hrs < 1) return pts['1'] ?? 0 // includes future-stamped (clock skew) — treat as brand new
  if (hrs < 3) return pts['3'] ?? 0
  if (hrs < 6) return pts['6'] ?? 0
  if (hrs < 12) return pts['12'] ?? 0
  if (hrs < 24) return pts['24'] ?? 0
  return pts.more ?? 0
}

/**
 * Compute the composite priority for one item from scratch (used at INGEST). Reads the active weight set
 * (rank-weights.ts) so a panel edit changes future scoring with no redeploy; pass `weights` to score
 * against a specific set (tests, what-if). boost_weight scales the adjustment (1 = full; 0 = pure Groq).
 */
export function rankScore(it: RankInput, now: Date = new Date(), weights: RankWeights = getRankWeights()): Ranked {
  const materiality = clamp(Math.round(Number(it.materiality_pre_score) || 0), 0, 100)
  const scope_id = deriveScope(it)
  const source_tier_id = deriveSourceTier(it)

  const source_tier = weights.source_tier[source_tier_id] ?? 0
  const scope = weights.scope[scope_id] ?? 0
  const event = eventBonus(it.event_types, weights.event)
  const size = weights.size[String(it.size_bucket || 'unknown').toLowerCase()] ?? 0
  const recency = recencyBonus(it.found_at, now, weights.recency)

  const w = clamp(weights.boost_weight, 0, 2)
  const boost = (source_tier + scope + event + size + recency) * w
  const rank_score = clamp(Math.round(materiality + boost), 0, 100)

  return {
    rank_score,
    rank_factors: { materiality, source_tier, scope, event, size, recency, boost_weight: w, scope_id, source_tier_id },
  }
}

/**
 * Re-score an ALREADY-RANKED item under a (possibly new) weight set, for the live wire display. Reuses
 * the breakdown captured at ingest — the Groq base (materiality), the won scope/source-tier ids, and the
 * freshness points — and recomputes the tier/scope/event/size adjustments + boost from `weights`. Keeping
 * the persisted recency makes the re-rank a pure function of the WEIGHTS (not the clock), so at default
 * weights the wire is unchanged and a panel edit is the only thing that moves a score.
 */
export function reRankFromFactors(
  rf: RankFactors,
  item: { event_types?: (string | null)[] | null; size_bucket?: string | null },
  weights: RankWeights = getRankWeights(),
): Ranked {
  const materiality = clamp(Math.round(Number(rf.materiality) || 0), 0, 100)
  const source_tier = weights.source_tier[rf.source_tier_id] ?? 0
  const scope = weights.scope[rf.scope_id] ?? 0
  const event = eventBonus(item.event_types, weights.event)
  const size = weights.size[String(item.size_bucket || 'unknown').toLowerCase()] ?? 0
  const recency = Number(rf.recency) || 0 // freshness as captured at ingest — clock-independent

  const w = clamp(weights.boost_weight, 0, 2)
  const boost = (source_tier + scope + event + size + recency) * w
  const rank_score = clamp(Math.round(materiality + boost), 0, 100)

  return {
    rank_score,
    rank_factors: { materiality, source_tier, scope, event, size, recency, boost_weight: w, scope_id: rf.scope_id, source_tier_id: rf.source_tier_id },
  }
}

/** Family (company vs broad) for the winning scope — handy for the UI without re-deriving. */
export function rankFamily(f: RankFactors): 'company' | 'broad' | 'unknown' {
  return familyOf(f.scope_id)
}

/**
 * DOCTRINE CAP (CLAUDE.md §4/§24): a `social` item (Reddit) is discovery / corroboration only and can
 * NEVER reach the top `pick` band — corroborate, never drive. The strongly-negative social source-tier
 * weight already pushes it down, but a weight alone isn't a guarantee (a Scoring-panel edit, or a high
 * Groq read on a real-looking post, could still clear the pick threshold), so this clamps it hard.
 * Applied in runCycle right after scoreToBand; exported so the rule is independently testable. Every
 * other tier passes through unchanged.
 */
export function capSocialBand(band: Band, sourceTierId: SourceTierId): Band {
  return sourceTierId === 'social' && band === 'pick' ? 'watch' : band
}

/**
 * DOCTRINE CAP (CLAUDE.md §4/§24) — the SCORE twin of capSocialBand. capSocialBand stops a `social`
 * item DISPLAYING as a top `pick`, but the inbox and the wire ORDER by triage_score (write-inbox
 * mergeInbox sorts by it; the ranked wire reads it), so an uncapped high score still lets a Reddit post
 * float above filings/news and eat a scarce inbox slot — the cap on the band alone doesn't reach the
 * ordering. Clamp a social item's priority to just below the pick threshold so its ORDER honors the cap
 * too: it can never sort among the picks. The raw Groq read survives in rank_factors.materiality for the
 * audit trail; only the composite priority is clamped. Every other tier passes through unchanged.
 */
export function capSocialScore(score: number, sourceTierId: SourceTierId, pickThreshold: number): number {
  if (sourceTierId !== 'social') return score
  return Math.min(score, Math.max(0, Math.round(pickThreshold) - 1))
}

// High-value terms a buy-side PM would jump on — cheap to scan on the title BEFORE the LLM runs.
// Substrings (not whole-word) on purpose: 'acqui' catches acquire/acquisition/acquired; 'investigat'
// catches investigation/investigated. Used only to ORDER the triage queue, never to score.
const PRE_KEYWORDS = [
  'acqui', 'merger', 'takeover', 'buyout', 'tender offer', 'open offer', 'stake sale', 'divest',
  'spin-off', 'spinoff', 'demerger', 'block deal', 'preferential issue', 'rights issue', 'qip',
  'bankrupt', 'insolven', 'default', 'restructur', 'liquidat', 'wind-up', 'going concern', 'nclt',
  'guidance', 'profit warning', 'downgrade', 'upgrade', 'buyback', 'repurchase', 'dividend', 'bonus issue',
  'results', 'earnings', 'fraud', 'probe', 'investigat', 'lawsuit', 'charged', 'penalt', 'fine ',
  'sanction', 'recall', 'resign', 'steps down', 'ceo', 'cfo', 'auditor', 'delisting', 'rate cut',
  'rate hike', 'rate decision', 'acquire', 'to buy', 'merges', 'fundrais', 'raises ', 'cuts ', 'warns',
]

/**
 * Cheap, deterministic PRE-triage priority — used to ORDER the queue so the scarce Groq budget scores
 * the most promising items first (the budget/rate-limit is the binding constraint). Uses only fields
 * present BEFORE the LLM runs (input_nature → §4 tier; the title; recency). Weighted so a MATERIAL
 * item (a takeover/default/guidance keyword) outranks a routine filing of any tier, which in turn
 * outranks routine news — material-first, then primary sources, then the rest.
 */
export function preTriagePriority(it: { input_nature?: string | null; headline?: string | null; found_at?: string | null }, now: Date = new Date()): number {
  const tier = sourceTierRank(deriveSourceTier({ input_nature: it.input_nature })) // 5 (filing) … 2 (news); no event_types pre-triage
  const hay = ' ' + String(it.headline || '').toLowerCase() + ' '
  const material = PRE_KEYWORDS.some((k) => hay.includes(k)) ? 12 : 0 // bigger than the filing↔news tier gap (3×3=9)
  return tier * 3 + material + recencyBonus(it.found_at, now, getRankWeights().recency)
}

// re-export the tier rank for any caller that wants the raw §4 number
export function sourceTierRank(id: SourceTierId): number {
  return SOURCE_TIERS[id]?.rank ?? 0
}
