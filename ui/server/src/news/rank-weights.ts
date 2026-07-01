// Runtime-tunable scoring weights — the knobs behind the composite triage score (rank.ts). These used
// to be hardcoded consts; they now live in one JSON file under the engine state dir so the cockpit's
// Scoring panel can edit them WITHOUT a redeploy (PUT /api/news/rank-weights). The change is GLOBAL by
// construction — one shared config drives every item's score, never per-event. The defaults below are
// the exact values rank.ts shipped with, so an engine with no saved file scores identically to before.
//
// Persistence: STATE_DIR/rank-weights.json (gitignored, survives restarts/deploys like the activity log).
// Loading is merge-over-defaults, so a partial file is fine and a NEWLY-added event type / source tier
// auto-falls-back to its default (§26 zero-touch — adding a vocabulary term needs no edit here).

import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR, NEWS } from '../config'

// One editable weight set. Every value is additive points on the 0–100 scale (rank.ts sums them onto
// the Groq base, then clamps). recency is the points per fixed freshness bucket (thresholds stay fixed
// in rank.ts; only the points are tunable). boost_weight scales the whole adjustment (0 = pure Groq).
export interface RankWeights {
  source_tier: Record<string, number> // §4 hierarchy: primary_filing / official_data / company / news / unconfirmed / social
  scope: Record<string, number> // single_name / multi_name / policy / commodity / sector / macro / unknown
  event: Record<string, number> // mna / guidance_change / … / rumor — the strongest matching type counts
  size: Record<string, number> // mega / large / mid / small / unknown
  recency: Record<string, number> // points per bucket, keys: '1' '3' '6' '12' '24' 'more' (hours)
  boost_weight: number // global multiplier on the summed adjustment (0–2)
}

// The shipped defaults — identical to rank.ts's original const tables. Changing a value here changes the
// out-of-the-box scoring; changing it via the panel overrides it per-engine in the saved JSON.
export const DEFAULT_RANK_WEIGHTS: RankWeights = {
  source_tier: { primary_filing: 8, official_data: 5, company: 3, news: 0, unconfirmed: -8, social: -12 },
  // geopolitical (war/military escalation) and generic_media (roundups/listicles) added per CLAUDE.md
  // §24: an escalation matters even with no company named, while a "Top 10" piece naming several
  // companies is the OPPOSITE of a single-stock idea and must not earn the old multi_name lift.
  // commodity bumped 1 → 4: a real supply/inventory shock is market-wide, not a minor footnote.
  scope: { single_name: 6, multi_name: 5, policy: 2, commodity: 4, sector: 0, macro: -4, geopolitical: 9, generic_media: -10, unknown: -2 },
  // capex (6): tied with capital_actions — a major capex plan (a new fab, a multi-billion AI-infra
  // build) is a real capital-allocation signal, comparable to a buyback or debt raise, though less
  // immediately estimate-moving than an M&A (9) or a guidance cut (7). Previously capex had no
  // dedicated bucket and fell into weak operations(2)/commercial(3), under-scoring it relative to its
  // actual materiality (the quantifiedImpactBonus above already credits a capex headline WITH a $
  // figure; this credits the event itself, figure or not).
  event: { mna: 9, guidance_change: 7, debt_credit: 7, capital_actions: 6, litigation_enforcement: 6, capex: 6, earnings_revenue_margin: 5, management: 4, regulatory: 4, cybersecurity: 4, product: 3, commercial: 3, operations: 2, macro_sector: 1, rumor: -3 },
  size: { mega: 2, large: 2, mid: 1, small: -1, unknown: 0 },
  recency: { '1': 5, '3': 4, '6': 3, '12': 2, '24': 1, more: 0 },
  boost_weight: 1,
}

const FILE = path.join(STATE_DIR, 'rank-weights.json')
const PT_MIN = -50
const PT_MAX = 50

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

/** Merge a (possibly partial, possibly untrusted) override over a base set: known keys take the clamped
 *  override, missing keys keep the base. Unknown extra keys are dropped — the active set is always shaped
 *  by the defaults' vocabulary, so a stale saved file can't inject junk categories. */
function mergeWeights(base: RankWeights, over: Partial<RankWeights> | null | undefined): RankWeights {
  const grp = (b: Record<string, number>, o: unknown): Record<string, number> => {
    const out: Record<string, number> = { ...b }
    if (o && typeof o === 'object') for (const k of Object.keys(b)) {
      const v = (o as Record<string, unknown>)[k]
      if (isNum(v)) out[k] = clamp(Math.round(v), PT_MIN, PT_MAX)
    }
    return out
  }
  return {
    source_tier: grp(base.source_tier, over?.source_tier),
    scope: grp(base.scope, over?.scope),
    event: grp(base.event, over?.event),
    size: grp(base.size, over?.size),
    recency: grp(base.recency, over?.recency),
    boost_weight: isNum(over?.boost_weight) ? clamp(Number(over!.boost_weight), 0, 2) : base.boost_weight,
  }
}

// In-memory active set, loaded once. The shipped default seeds boost_weight from the existing env knob
// (NEWS_RANK_BOOST_WEIGHT) so current behaviour is preserved until the user saves from the panel.
let active: RankWeights | null = null
function shippedDefaults(): RankWeights {
  return { ...DEFAULT_RANK_WEIGHTS, boost_weight: NEWS.rankBoostWeight }
}

/** The active weight set (cached). First call reads the saved file (if any) merged over the defaults. */
export function getRankWeights(): RankWeights {
  if (active) return active
  let saved: Partial<RankWeights> | null = null
  try { saved = JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { saved = null }
  active = mergeWeights(shippedDefaults(), saved)
  return active
}

/** Validate + persist an override (merged over the current active set) and update the in-memory copy.
 *  Returns the new active set. Never throws on a bad value — out-of-range/non-numeric inputs are clamped
 *  or ignored by mergeWeights, so a malformed PUT degrades to "no change", it doesn't corrupt scoring. */
export function saveRankWeights(over: Partial<RankWeights>): RankWeights {
  active = mergeWeights(getRankWeights(), over)
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true })
    fs.writeFileSync(FILE, JSON.stringify(active, null, 2))
  } catch { /* persistence is best-effort; the in-memory set still governs this process */ }
  return active
}

/** Reset to the shipped defaults (and remove the saved override file). Returns the defaults. */
export function resetRankWeights(): RankWeights {
  active = shippedDefaults()
  try { fs.rmSync(FILE, { force: true }) } catch { /* ignore */ }
  return active
}

/** The shipped defaults the panel resets to / compares against (boost seeded from the env knob). Pure. */
export function defaultRankWeights(): RankWeights {
  return shippedDefaults()
}

/** True when the active set differs from the shipped defaults (the panel shows a "customised" badge). */
export function rankWeightsCustomised(): boolean {
  return JSON.stringify(getRankWeights()) !== JSON.stringify(shippedDefaults())
}
