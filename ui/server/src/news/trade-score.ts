// Deterministic trade-readiness score for a news cluster.
//
// This is deliberately stricter than the wire's materiality score. Loud news is not automatically a
// trade. Missing price, liquidity, consensus, or a dated catalyst creates visible caps. The score helps
// rank what to check next; it never claims expected return and never replaces Signal Check.

import type { FeedItem } from './types'

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
  return item.source_tier === 'primary_filing' ? 25
    : item.source_tier === 'official_data' ? 23
      : item.source_tier === 'company' ? 18
        : item.source_tier === 'social' ? 3
          : 14
}

function directionOf(items: TradeEvidence[]): TradeScore['direction'] {
  const dirs = new Set(items.map((i) => i.event_direction).filter((x) => x && x !== 'unknown' && x !== 'neutral'))
  if (dirs.size !== 1) return dirs.size ? 'mixed' : 'unknown'
  const d = [...dirs][0]
  return d === 'positive' ? 'long' : d === 'negative' ? 'short' : 'mixed'
}

function hasFutureDateOrWindow(text: string, nowMs: number): boolean {
  if (!text.trim()) return false
  // Relative windows are forward-looking by construction. Bare categories such as "earnings" are not.
  if (/\b(?:tomorrow|next\s+(?:week|month|quarter)|within\s+\d+\s+(?:day|week|month)s?|in\s+\d+\s+(?:day|week|month)s?)\b/i.test(text)) return true
  const isoDates = text.match(/\b20\d{2}-\d{1,2}-\d{1,2}\b/g) || []
  if (isoDates.some((value) => {
    const parsed = Date.parse(`${value}T23:59:59Z`)
    return Number.isFinite(parsed) && parsed >= nowMs
  })) return true
  const numericDates = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]20\d{2}\b/g) || []
  if (numericDates.some((value) => {
    const [a, b, year] = value.split(/[/-]/).map(Number)
    // Accept either common ordering; the later valid interpretation must still be in the future.
    const candidates = [Date.UTC(year, a - 1, b, 23, 59, 59), Date.UTC(year, b - 1, a, 23, 59, 59)]
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
  const independentSources = new Set([...storyGroups.values()].map((group) => group[0]?.source_name).filter(Boolean))
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
  const datedWhyNow = hasFutureDateOrWindow(opts.whyNow || '', nowMs)
  const hasDatedCatalyst = datedScheduledEvent || datedWhyNow
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
  if (!opts.pricedIn || opts.pricedIn === 'unknown') { missingChecks.push('price and market expectations'); cap = Math.min(cap, 68) }
  if ((independentStories < 2 || independentSources.size < 2) && evidence < 23) { missingChecks.push('independent confirmation'); cap = Math.min(cap, 62) }
  // The news archive does not carry a verified live price/liquidity/consensus snapshot. This check is
  // always explicit at the chat tier and is exactly what the downstream gauntlet must resolve.
  if (!missingChecks.includes('price and market expectations')) missingChecks.push('live price, liquidity, and consensus')
  const score = Math.min(uncappedScore, cap)
  const readiness: TradeScore['readiness'] = !ticker || !listingVerified ? 'watch_only'
    : liquidityVerified && score >= 65 && missingChecks.length <= 2 ? 'check_now'
      : score >= 45 ? 'needs_data' : 'watch_only'
  const reasons = [
    `${independentStories} independent story cluster${independentStories === 1 ? '' : 's'} across ${independentSources.size} source${independentSources.size === 1 ? '' : 's'}`,
    topImpact ? `top raw economic impact ${topImpact}/100` : 'raw economic impact not measured',
    ticker ? `verified ticker ${ticker}` : guessedTicker ? `unverified ticker guess ${guessedTicker}` : 'no verified ticker',
    listingVerified ? `listing verified at ${opts.exchange}` : 'listing not independently verified',
    liquidityVerified ? 'live liquidity checked' : 'live liquidity not checked',
    hasDatedCatalyst ? 'future dated trigger present' : 'timing not proven',
  ]
  return { score, uncappedScore, cap, readiness, direction: directionOf(unique), breakdown, missingChecks, reasons }
}
