// Deterministic trade-readiness score for a news cluster.
//
// This is deliberately stricter than the wire's materiality score. Loud news is not automatically a
// trade. Missing price, liquidity, consensus, or a dated catalyst creates visible caps. The score helps
// rank what to check next; it never claims expected return and never replaces Signal Check.

import type { FeedItem } from './types'

export const TRADE_SCORE_POLICY_VERSION = 'evidence_gate_v2' as const

export type TradeEvidence = Pick<FeedItem, 'event_id' | 'ts' | 'source_name' | 'source_tier' | 'triage_score' | 'dedup_group' | 'companies' | 'scheduled_events' | 'event_direction'> & {
  materiality_pre_score?: number
  /** A body-read economic-impact label, when one exists. Never substitute the composite triage score. */
  impact_magnitude?: 'low' | 'medium' | 'high' | 'critical' | null
}

export interface TradeScoreBreakdown {
  evidence: number
  impact: number
  specificity: number
  timing: number
  expression: number
  corroboration: number
  learning_adjustment: number
}

export interface TradeScore {
  score: number
  uncappedScore: number
  cap: number
  readiness: 'check_now' | 'needs_data' | 'watch_only'
  direction: 'long' | 'short' | 'mixed' | 'unknown'
  breakdown: TradeScoreBreakdown
  missingChecks: string[]
  reasons: string[]
}

export interface ScoreTradeOptions {
  nowMs?: number
  ticker?: string | null
  exchange?: string | null
  pricedIn?: 'priced' | 'room' | 'unknown'
  /** Model-authored display copy only. It must never independently prove a dated catalyst. */
  whyNow?: string | null
  learningAdjustment?: number
  /** True only after a listing source, quote adapter, or equivalent has verified the supplied ticker. */
  tickerVerified?: boolean
  /** True only after an independent directory/filing/quote source verified the listing venue. */
  listingVerified?: boolean
  /** True only after live liquidity has been checked. */
  liquidityVerified?: boolean
  /** Backward-compatible combined proof; equivalent to listingVerified + liquidityVerified. */
  listingLiquidityVerified?: boolean
}

function sourcePoints(item: TradeEvidence): number {
  switch (item.source_tier) {
    case 'primary_filing': return 25
    case 'official_data': return 23
    case 'company': return 18
    case 'news': return 14
    case 'unconfirmed': return 7
    case 'social': return 3
    default: return 0
  }
}

function directionOf(items: TradeEvidence[]): TradeScore['direction'] {
  const dirs = new Set(items.map((i) => i.event_direction).filter((x) => x && x !== 'unknown' && x !== 'neutral'))
  if (dirs.size !== 1) return dirs.size ? 'mixed' : 'unknown'
  const d = [...dirs][0]
  return d === 'positive' ? 'long' : d === 'negative' ? 'short' : 'mixed'
}

/** A model may express evidence, but may not reverse it. Unknown evidence stays research-only through the
 * market-data caps; mixed evidence authorizes only an explicit pair, never a naked directional bet. */
export function directionMatchesEvidence(
  proposed: 'long' | 'short' | 'pair',
  evidence: TradeScore['direction'],
): boolean {
  if (evidence === 'unknown') return true
  if (evidence === 'mixed') return proposed === 'pair'
  return proposed === evidence
}

function hasFutureDateOrWindow(text: string, nowMs: number): boolean {
  if (!text.trim()) return false
  const utcDayEnd = (year: number, month: number, day: number): number => {
    if (![year, month, day].every(Number.isInteger) || month < 1 || month > 12 || day < 1 || day > 31) return NaN
    const parsed = Date.UTC(year, month - 1, day, 23, 59, 59)
    const roundTrip = new Date(parsed)
    return roundTrip.getUTCFullYear() === year && roundTrip.getUTCMonth() === month - 1 && roundTrip.getUTCDate() === day
      ? parsed : NaN
  }
  // A relative window is useful only when it is both positive and genuinely forward. This rejects
  // model/source strings such as "in 0 days" and "no earnings within 30 days" that state no catalyst.
  const relative = text.match(/\b(?:tomorrow|next\s+(?:week|month|quarter)|(?:within|in)\s+(\d+)\s+(?:day|week|month)s?)\b/i)
  if (relative) {
    const clausePrefix = text.slice(Math.max(0, (relative.index ?? 0) - 80), relative.index ?? 0).split(/[.!;:]/).pop() || ''
    const negated = /\b(?:no|not|none|without)\b/i.test(clausePrefix)
    const count = relative[1] === undefined ? 1 : Number(relative[1])
    if (!negated && Number.isInteger(count) && count > 0) return true
  }
  const isoDates = text.match(/\b20\d{2}-\d{1,2}-\d{1,2}\b/g) || []
  if (isoDates.some((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const parsed = utcDayEnd(year, month, day)
    return Number.isFinite(parsed) && parsed >= nowMs
  })) return true
  const numericDates = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]20\d{2}\b/g) || []
  if (numericDates.some((value) => {
    const [a, b, year] = value.split(/[/-]/).map(Number)
    // Accept either common ordering; the later valid interpretation must still be in the future.
    const candidates = [utcDayEnd(year, a, b), utcDayEnd(year, b, a)]
    return candidates.some((parsed) => Number.isFinite(parsed) && parsed >= nowMs)
  })) return true
  const quarter = text.match(/\bQ([1-4])\s*(20\d{2})\b/i)
  if (quarter) {
    const end = Date.UTC(Number(quarter[2]), Number(quarter[1]) * 3, 0, 23, 59, 59)
    if (end >= nowMs) return true
  }
  return false
}

export function scoreTradeCluster(items: TradeEvidence[], opts: ScoreTradeOptions = {}): TradeScore {
  const unique = [...new Map(items.map((item) => [item.event_id, item])).values()]
  const nowMs = opts.nowMs ?? Date.now()
  const storyGroups = new Map<string, TradeEvidence[]>()
  for (const item of unique) {
    const group = String(item.dedup_group || item.event_id).trim()
    storyGroups.set(group, [...(storyGroups.get(group) || []), item])
  }
  const independentSources = new Set(
    [...storyGroups.values()]
      .map((group) => String(group[0]?.source_name || '').trim().toLowerCase())
      .filter(Boolean),
  )
  const rawImpact = Math.max(0, ...unique.map((i) => Number(i.materiality_pre_score || 0)))
  const impactLabels = { low: 20, medium: 50, high: 75, critical: 100 } as const
  const labelledImpact = Math.max(0, ...unique.map((i) => i.impact_magnitude ? impactLabels[i.impact_magnitude] : 0))
  const topImpact = Math.max(rawImpact, labelledImpact)
  const evidence = Math.min(25, Math.max(0, ...unique.map(sourcePoints)))
  const impact = Math.round(Math.min(25, topImpact / 4))
  const companyRows = unique.flatMap((i) => i.companies || [])
  const guessedTicker = opts.ticker || companyRows.find((c) => c.ticker)?.ticker || null
  const ticker = opts.tickerVerified === true ? opts.ticker || null : null
  const specificity = ticker ? 15 : guessedTicker ? 7 : companyRows.length ? 5 : 2
  const newestMs = Math.max(0, ...unique.map((i) => Date.parse(i.ts)).filter(Number.isFinite))
  const ageHours = newestMs ? Math.max(0, (nowMs - newestMs) / 3_600_000) : Number.POSITIVE_INFINITY
  const datedScheduledEvent = unique.some((i) => (i.scheduled_events || []).some((event) => hasFutureDateOrWindow(String(event), nowMs)))
  // `whyNow` is generated after the evidence rows are selected. A date invented or reformatted there
  // cannot clear a deterministic evidence gate; only the server-carried source row may do so.
  const hasDatedCatalyst = datedScheduledEvent
  const timing = hasDatedCatalyst ? 15 : ageHours <= 24 ? 10 : ageHours <= 7 * 24 ? 6 : 2
  const listingVerified = Boolean(ticker && opts.exchange && (opts.listingVerified === true || opts.listingLiquidityVerified === true))
  const liquidityVerified = listingVerified && (opts.liquidityVerified === true || opts.listingLiquidityVerified === true)
  const expression = liquidityVerified ? 10 : listingVerified ? 6 : ticker ? 4 : 0
  const independentStories = storyGroups.size
  const corroboration = independentStories >= 2 && independentSources.size >= 2
    ? Math.min(10, (Math.min(independentStories, independentSources.size) - 1) * 4 + 2)
    : 0
  const learning = Math.max(-8, Math.min(8, Math.round(opts.learningAdjustment || 0)))
  const breakdown: TradeScoreBreakdown = { evidence, impact, specificity, timing, expression, corroboration, learning_adjustment: learning }
  const uncappedScore = Math.max(0, Math.min(100, Object.values(breakdown).reduce((a, b) => a + b, 0)))
  const missingChecks: string[] = []
  let cap = 100
  if (!ticker) { missingChecks.push('verified listed ticker'); cap = Math.min(cap, 45) }
  if (!listingVerified) { missingChecks.push('verified listing'); cap = Math.min(cap, 55) }
  if (!liquidityVerified) { missingChecks.push('live liquidity'); cap = Math.min(cap, 62) }
  if (!hasDatedCatalyst) { missingChecks.push('dated catalyst'); cap = Math.min(cap, 65) }
  if (!topImpact) { missingChecks.push('raw economic impact'); cap = Math.min(cap, 65) }
  // `priced_in` is a model-authored skim, not a live market check. It is useful only as a small ordering
  // hint for which lead to research first: known priced-in risk ranks below uncertainty, which ranks below
  // possible room. All three remain below the news-only ceiling until price reaction and consensus are
  // independently measured by Signal Check.
  const pricedIn = opts.pricedIn === 'priced' || opts.pricedIn === 'room' || opts.pricedIn === 'unknown'
    ? opts.pricedIn : 'unknown'
  if (pricedIn === 'priced') {
    missingChecks.push('priced-in risk')
    cap = Math.min(cap, 55)
  } else if (pricedIn === 'unknown') {
    missingChecks.push('price and market expectations')
    cap = Math.min(cap, 60)
  } else {
    cap = Math.min(cap, 62)
  }
  if ((independentStories < 2 || independentSources.size < 2) && evidence < 23) { missingChecks.push('independent confirmation'); cap = Math.min(cap, 62) }
  // The news archive never carries the complete live price/liquidity/consensus snapshot. Keep that gap
  // explicit and capped even when the skim guesses `room`; model opinion cannot verify market edge.
  missingChecks.push('live price, liquidity, and consensus')
  cap = Math.min(cap, 62)
  const score = Math.min(uncappedScore, cap)
  const readiness: TradeScore['readiness'] = !ticker || !listingVerified ? 'watch_only'
    : score >= 45 ? 'needs_data' : 'watch_only'
  const reasons = [
    `${independentStories} independent story cluster${independentStories === 1 ? '' : 's'} across ${independentSources.size} source${independentSources.size === 1 ? '' : 's'}`,
    topImpact ? `top raw economic impact ${topImpact}/100` : 'raw economic impact not measured',
    ticker ? `verified ticker ${ticker}` : guessedTicker ? `unverified ticker guess ${guessedTicker}` : 'no verified ticker',
    listingVerified ? `listing verified at ${opts.exchange}` : 'listing not independently verified',
    liquidityVerified ? 'live liquidity checked' : 'live liquidity not checked',
    hasDatedCatalyst ? 'future dated trigger present' : 'timing not proven',
    pricedIn === 'priced'
      ? 'skim says the event may already be priced in'
      : pricedIn === 'room'
        ? 'skim says room may remain; this is an unverified research-priority hint only'
        : 'market reaction and expectations not assessed',
  ]
  return { score, uncappedScore, cap, readiness, direction: directionOf(unique), breakdown, missingChecks, reasons }
}
