// Client mirror of the server's scoring weights (ui/server/src/news/rank-weights.ts) + the formula that
// turns an item's breakdown into a score (rank.ts reRankFromFactors). The browser can't import server
// code, so the SHAPE + defaults + formula live here too — same pattern as scope.ts. The server is the
// source of truth for the ACTIVE values (fetched via /api/news/rank-weights); these defaults are the
// fallback for the read-only static showcase and the "reset" baseline. The Scoring panel renders its
// controls from the section metadata below and previews edits with scoreUnderWeights() — no server round
// trip, so a slider drag re-ranks the visible wire instantly.

import { SCOPES, SOURCE_TIERS } from './scope'
import { plainSize, plainTheme } from './plain'
import type { FeedItem } from './types'

export interface RankWeights {
  source_tier: Record<string, number>
  scope: Record<string, number>
  event: Record<string, number>
  size: Record<string, number>
  recency: Record<string, number> // keys '1' '3' '6' '12' '24' 'more'
  boost_weight: number
}

export interface RankWeightsState {
  active: RankWeights
  defaults: RankWeights
  customised: boolean
}

// Mirror of the server's DEFAULT_RANK_WEIGHTS — keep the two in sync (a test asserts the server set).
export const DEFAULT_RANK_WEIGHTS: RankWeights = {
  source_tier: { primary_filing: 8, official_data: 5, company: 3, news: 0, unconfirmed: -8 },
  scope: { single_name: 6, multi_name: 5, policy: 2, commodity: 1, sector: 0, macro: -4, unknown: -2 },
  event: { mna: 9, guidance_change: 7, debt_credit: 7, capital_actions: 6, litigation_enforcement: 6, earnings_revenue_margin: 5, management: 4, regulatory: 4, cybersecurity: 4, product: 3, commercial: 3, operations: 2, macro_sector: 1, rumor: -3 },
  size: { mega: 2, large: 2, mid: 1, small: -1, unknown: 0 },
  recency: { '1': 5, '3': 4, '6': 3, '12': 2, '24': 1, more: 0 },
  boost_weight: 1,
}

const FRESH_ROWS: { id: string; label: string }[] = [
  { id: '1', label: 'Under an hour old' },
  { id: '3', label: 'Under 3 hours old' },
  { id: '6', label: 'Under 6 hours old' },
  { id: '12', label: 'Under 12 hours old' },
  { id: '24', label: 'Under a day old' },
  { id: 'more', label: 'Over a day old' },
]

// One editable section of the panel. `group` keys into RankWeights; `rows` are the points knobs in
// display order, each with a plain label + (optional) one-line meaning reused from the existing vocab.
export interface WeightSection {
  group: 'source_tier' | 'scope' | 'event' | 'size' | 'recency'
  title: string
  hint: string
  rows: { id: string; label: string; meaning?: string }[]
}

export const WEIGHT_SECTIONS: WeightSection[] = [
  {
    group: 'source_tier',
    title: 'Where it came from',
    hint: 'Points added for how trustworthy the source is (a filing beats a rumour).',
    rows: Object.keys(DEFAULT_RANK_WEIGHTS.source_tier).map((id) => ({ id, label: SOURCE_TIERS[id as keyof typeof SOURCE_TIERS]?.label ?? id, meaning: SOURCE_TIERS[id as keyof typeof SOURCE_TIERS]?.meaning })),
  },
  {
    group: 'scope',
    title: 'How specific it is',
    hint: 'Points for how investable it is — one named company beats an economy-wide read.',
    rows: Object.keys(DEFAULT_RANK_WEIGHTS.scope).map((id) => ({ id, label: SCOPES[id as keyof typeof SCOPES]?.label ?? id, meaning: SCOPES[id as keyof typeof SCOPES]?.meaning })),
  },
  {
    group: 'event',
    title: 'What kind of event',
    hint: 'Points for the biggest event in the headline (only the strongest one counts).',
    rows: Object.keys(DEFAULT_RANK_WEIGHTS.event).map((id) => ({ id, label: plainTheme(id) })),
  },
  {
    group: 'size',
    title: 'Company size',
    hint: 'Points for how big — and so how liquid / investable — the company is.',
    rows: Object.keys(DEFAULT_RANK_WEIGHTS.size).map((id) => ({ id, label: plainSize(id) })),
  },
  {
    group: 'recency',
    title: 'How fresh it is',
    hint: 'Points for newness. Tuning these only affects items scored from now on.',
    rows: FRESH_ROWS,
  },
]

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

// Mirror of rank.ts eventBonus: the strongest event counts; a bare rumour shows its penalty.
function eventBonus(types: (string | null)[] | null | undefined, ev: Record<string, number>): number {
  const t = (types || []).map((x) => String(x || '').toLowerCase()).filter(Boolean)
  if (!t.length) return 0
  if (t.includes('rumor') && t.every((k) => (ev[k] ?? 0) <= 0)) return ev.rumor ?? 0
  return Math.max(0, ...t.map((k) => ev[k] ?? 0))
}

// Mirror of rank.ts reRankFromFactors — recompute one item's score under a weight set, reusing the
// breakdown captured at ingest (so it's a pure function of the weights, clock-independent). Items with no
// breakdown (older lines) keep their served score. This is what the panel preview and the server agree on.
export function scoreUnderWeights(item: FeedItem, w: RankWeights): number {
  const rf = item.rank_factors
  if (!rf) return item.triage_score
  const source_tier = w.source_tier[rf.source_tier_id] ?? 0
  const scope = w.scope[rf.scope_id] ?? 0
  const event = eventBonus(item.event_types, w.event)
  const size = w.size[String(item.size_bucket || 'unknown').toLowerCase()] ?? 0
  const recency = Number(rf.recency) || 0
  const boost = (source_tier + scope + event + size + recency) * clamp(w.boost_weight, 0, 2)
  return clamp(Math.round(rf.materiality + boost), 0, 100)
}

export const rankWeightsEqual = (a: RankWeights, b: RankWeights): boolean => JSON.stringify(a) === JSON.stringify(b)
