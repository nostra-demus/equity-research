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
import type { Band, EventMaterialityLabel } from './types'

export interface RankInput {
  materiality_pre_score?: number | null
  issuer_linkage?: string | null
  companies?: { name?: string; ticker?: string | null }[] | null
  event_types?: string[] | null
  input_nature?: string | null
  headline?: string | null
  headline_en?: string | null // English translation, when present — scanned for the quantified-impact bonus
  size_bucket?: string | null
  found_at?: string | null // ISO — for the recency bonus
  event_materiality_label?: EventMaterialityLabel | string | null // the model's own raw severity call (news/triage/groq.ts) — feeds materialityLabelBoost
}

export interface RankFactors {
  materiality: number // the Groq base (0–100), the anchor
  source_tier: number // §4 hierarchy bonus
  scope: number // company-vs-broad bonus
  event: number // strongest event-type bonus
  size: number // company-size bonus
  recency: number // freshness bonus
  // a FLOOR correction: when the model's own event_materiality_label says high/critical but its
  // numeric materiality_pre_score undershoots that tier's floor, lift the score (never lower it).
  // Computed once at ingest from event_materiality_label + the raw score (not a function of the
  // tunable weight set) and PERSISTED — reRankFromFactors carries it through unchanged, same
  // treatment as `recency`.
  materiality_label_floor: number
  // a flat bonus when the headline carries BOTH a quantified figure (currency amount, range,
  // percentage, bps) AND an impact keyword (warns/guidance/cut/capex/fine/deal/…) — defense-in-depth
  // for "quantified estimate/guidance/valuation impact", independent of the LLM's own number. Same
  // persisted/pass-through treatment as materiality_label_floor.
  quantified: number
  boost_weight?: number // global multiplier applied to (source_tier+scope+event+size+recency+materiality_label_floor+quantified) for THIS score (1 = none); always set on output, optional on input (records predating the field)
  scope_id: ScopeId
  source_tier_id: SourceTierId
}

// Fixed severity-tier floors (aligned with the existing pickThreshold=70/watchThreshold=40 bands, plus
// a new "critical" band above PROMOTE). Not panel-tunable — these are doctrine bands, not a preference
// weight (CLAUDE.md §10/§12: a label must be explainable from a fixed rule, not a vibe).
export const MATERIALITY_LABEL_FLOOR: Record<string, number> = { critical: 85, high: 70, medium: 45, low: 0 }

/** The correction: how many points to add to lift rawScore up to the label's floor (0 if it's already there). */
export function materialityLabelBoost(label: string | null | undefined, rawScore: number): number {
  const floor = MATERIALITY_LABEL_FLOOR[String(label || '').toLowerCase()]
  if (floor == null) return 0
  return Math.max(0, floor - rawScore)
}

/** The FINAL, score-consistent label — re-derived from the boosted score so it can never contradict
 *  what's shown (the inverse of materialityLabelBoost's thresholds). Exported for runCycle.ts. */
export function deriveMaterialityLabel(score: number): EventMaterialityLabel {
  if (score >= MATERIALITY_LABEL_FLOOR.critical) return 'critical'
  if (score >= MATERIALITY_LABEL_FLOOR.high) return 'high'
  if (score >= MATERIALITY_LABEL_FLOOR.medium) return 'medium'
  return 'low'
}

// A quantified figure: a currency amount (with optional range), a percentage, or basis points. Paired
// with an IMPACT keyword below so a bare incidental number ("opens 3rd store") doesn't trigger it.
const QUANTIFIED_NUMBER_RE = /[$€£¥₹]\s?\d[\d,.]*(\s?[-–to]+\s?[$€£¥₹]?\s?\d[\d,.]*)?\s?(bn|billion|tn|trillion|m\b|mn|million|cr\b|crore|lakh|k\b|thousand)?|\d+(\.\d+)?\s?%|\d[\d,.]*\s?(bps|basis points)/i
// Matched with WHOLE-WORD boundaries (hasImpactWord), so every inflected form a headline actually uses
// must be listed explicitly — a bare stem like 'invest' would otherwise miss 'invests', and word
// boundaries (correctly) stop it firing inside 'investors'. This is the fix for the 'invest'→"investors"
// false positive (Thread D) while keeping the real 'to invest'/'invests' hits AND the 'fine'/'fines'
// coverage the substring form used to give for free.
const IMPACT_KEYWORDS = [
  'warns', 'warned', 'warning', 'net loss', 'profit warning', 'guidance', 'forecast', 'cuts', 'cut its',
  'lowers', 'lowered', 'raises', 'raised', 'downgrade', 'upgrade', 'capex', 'invest', 'invests', 'investment',
  'fine', 'fined', 'fines', 'penalty', 'settlement', 'write-down', 'writedown', 'impairment', 'default',
  'bankrupt', 'deal valued', 'valued at', 'acquire', 'acquisition', 'to buy', 'takeover', 'misses',
  'beats', 'shortfall', 'deficit',
]
const QUANTIFIED_BONUS = 6

/** Whole-word(ish) match on BOTH outer edges (mirrors scope.ts hasTerm), so a stem keyword like
 *  'invest' fires on "invest"/"invests" but NEVER inside "investors"/"investor" (routine price-chatter
 *  — "Shares fall 5% as investors weigh results" must not earn the +6 impact bonus). Multi-word keywords
 *  ('cut its', 'net loss', 'to buy') are bounded at their outer edges only, so they still match. We scan
 *  every occurrence so a real standalone hit later in the string still counts. */
function hasImpactWord(hay: string, term: string): boolean {
  const t = term.trim()
  if (!t) return false
  for (let from = 0; ; ) {
    const i = hay.indexOf(t, from)
    if (i < 0) return false
    const before = i === 0 ? ' ' : hay[i - 1]
    const after = i + t.length >= hay.length ? ' ' : hay[i + t.length]
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true
    from = i + 1
  }
}

/** A flat bonus when the headline pairs a quantified figure with an impact keyword. */
export function quantifiedImpactBonus(headline: string | null | undefined, headlineEn?: string | null): number {
  const hay = ' ' + String((headlineEn && headlineEn.trim()) || headline || '').toLowerCase() + ' '
  if (!QUANTIFIED_NUMBER_RE.test(hay)) return 0
  return IMPACT_KEYWORDS.some((k) => hasImpactWord(hay, k)) ? QUANTIFIED_BONUS : 0
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
  const materiality_label_floor = materialityLabelBoost(it.event_materiality_label, materiality)
  const quantified = quantifiedImpactBonus(it.headline, it.headline_en)

  const w = clamp(weights.boost_weight, 0, 2)
  const boost = (source_tier + scope + event + size + recency + materiality_label_floor + quantified) * w
  const rank_score = clamp(Math.round(materiality + boost), 0, 100)

  return {
    rank_score,
    rank_factors: { materiality, source_tier, scope, event, size, recency, materiality_label_floor, quantified, boost_weight: w, scope_id, source_tier_id },
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
  // same treatment as recency: fixed at ingest (not a function of the tunable weight set), carried
  // through unchanged. 0 for an older record that predates these fields.
  const materiality_label_floor = Number(rf.materiality_label_floor) || 0
  const quantified = Number(rf.quantified) || 0

  const w = clamp(weights.boost_weight, 0, 2)
  const boost = (source_tier + scope + event + size + recency + materiality_label_floor + quantified) * w
  const rank_score = clamp(Math.round(materiality + boost), 0, 100)

  return {
    rank_score,
    rank_factors: { materiality, source_tier, scope, event, size, recency, materiality_label_floor, quantified, boost_weight: w, scope_id: rf.scope_id, source_tier_id: rf.source_tier_id },
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
export function capSocialBand(band: Band, sourceTierId: SourceTierId, caution = false): Band {
  if (sourceTierId !== 'social') return band
  // caution_only feeds (r/wallstreetbets) are a crowding/euphoria flag — "caution input only, never a
  // source, weighted lowest" (reddit_feeds.json / SWARM.md). A regular social item may still be a `watch`
  // lead (an r/Layoffs early-warning); a caution item must never even be a watch lead, so it caps to
  // `drop` — visible chatter in the wire, but never inbox-eligible (inboxed = band !== 'drop').
  if (caution) return 'drop'
  return band === 'pick' ? 'watch' : band
}

/**
 * DOCTRINE CAP (CLAUDE.md §4/§24) — the SCORE twin of capSocialBand. capSocialBand stops a `social`
 * item DISPLAYING as a top `pick`, but the inbox and the wire ORDER by triage_score (write-inbox
 * mergeInbox sorts by it; the ranked wire reads it), so an uncapped high score still lets a Reddit post
 * float above filings/news and eat a scarce inbox slot — the cap on the band alone doesn't reach the
 * ordering. Clamp a social item's priority to just below the pick threshold so its ORDER honors the cap
 * too: it can never sort among the picks. The raw Groq read survives in rank_factors.materiality for the
 * audit trail; only the composite priority is clamped. Every other tier passes through unchanged.
 *
 * A caution_only social item (r/wallstreetbets) is "weighted lowest": when watchThreshold is supplied,
 * its score is clamped below the WATCH line (not just the pick line), so it can never out-sort a real
 * watch lead for a scarce inbox slot and its band lands in `drop`, in lockstep with capSocialBand.
 */
export function capSocialScore(score: number, sourceTierId: SourceTierId, pickThreshold: number, watchThreshold?: number, caution = false): number {
  if (sourceTierId !== 'social') return score
  if (caution && watchThreshold != null) return Math.min(score, Math.max(0, Math.round(watchThreshold) - 1))
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
export function preTriagePriority(it: { input_nature?: string | null; headline?: string | null; found_at?: string | null }, now: Date = new Date(), weights: RankWeights = getRankWeights()): number {
  const tierId = deriveSourceTier({ input_nature: it.input_nature })
  const tier = sourceTierRank(tierId) // 5 (filing) … 2 (news) … 0 (social); no event_types pre-triage
  const hay = ' ' + String(it.headline || '').toLowerCase() + ' '
  // §4/§24 DOCTRINE CAP, at the triage QUEUE. A `social` (Reddit) item is discovery/corroboration only
  // and must never jump AHEAD of a trusted source for the scarce Groq budget. r/Layoffs etc. are full of
  // PRE_KEYWORDS ('layoffs', 'default', 'fraud', 'resign'…), so without this a low-trust post would score
  // tier 0 + material 12 = 12+ and out-rank routine news (2×3=6) and even company items (3×3=9) in the
  // queue, spending paid triage on Reddit before filings/news. Suppress the keyword lift for social.
  const material = tierId !== 'social' && PRE_KEYWORDS.some((k) => hay.includes(k)) ? 12 : 0 // bigger than the filing↔news tier gap (3×3=9)
  // ALSO suppress the freshness lift for social. recency points are panel-tunable up to +50 (rank-weights
  // PT_MAX), so leaving the recency bonus on a social item would let a fresh Reddit post score 0 + 0 +
  // recency and leapfrog an OLDER trusted item (e.g. day-old news at 2×3 + 0 = 6) the moment the freshness
  // weight is raised above the tier gap — re-opening the exact queue-jump this cap closes. With both the
  // keyword AND freshness lifts removed, a social item's queue priority is a flat tier×3 = 0, strictly
  // below every non-social tier's floor (unconfirmed 1×3 = 3) no matter how recency is tuned.
  const fresh = tierId === 'social' ? 0 : recencyBonus(it.found_at, now, weights.recency)
  return tier * 3 + material + fresh
}

// re-export the tier rank for any caller that wants the raw §4 number
export function sourceTierRank(id: SourceTierId): number {
  return SOURCE_TIERS[id]?.rank ?? 0
}
