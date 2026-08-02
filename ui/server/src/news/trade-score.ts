// Deterministic trade-readiness score for a news cluster.
//
// This is deliberately stricter than the wire's materiality score. Loud news is not automatically a
// trade. Missing price, liquidity, consensus, or a dated catalyst creates visible caps. The score helps
// rank what to check next; it never claims expected return and never replaces Signal Check.

import type { FeedItem } from './types'

export type TradeEvidence = Pick<FeedItem, 'event_id' | 'ts' | 'source_name' | 'source_tier' | 'triage_score' | 'companies' | 'scheduled_events' | 'event_direction'>

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

function hasDateOrWindow(text: string): boolean {
  return /\b(?:20\d{2}|q[1-4]|fy\d{2,4}|today|tomorrow|this (?:week|month|quarter)|next (?:week|month|quarter)|\d{1,2}[/-]\d{1,2}|\d+\s*(?:day|week|month)s?)\b/i.test(text)
}

export function scoreTradeCluster(items: TradeEvidence[], opts: ScoreTradeOptions = {}): TradeScore {
  const unique = [...new Map(items.map((item) => [item.event_id, item])).values()]
  const nowMs = opts.nowMs ?? Date.now()
  const sources = new Set(unique.map((i) => i.source_name).filter(Boolean))
  const topMateriality = Math.max(0, ...unique.map((i) => Number(i.triage_score || 0)))
  const evidence = Math.min(25, Math.max(0, ...unique.map(sourcePoints)))
  const impact = Math.round(Math.min(25, topMateriality / 4))
  const companyRows = unique.flatMap((i) => i.companies || [])
  const ticker = opts.ticker || companyRows.find((c) => c.ticker)?.ticker || null
  const specificity = ticker ? 15 : companyRows.length ? 9 : 2
  const newestMs = Math.max(0, ...unique.map((i) => Date.parse(i.ts)).filter(Number.isFinite))
  const ageHours = newestMs ? Math.max(0, (nowMs - newestMs) / 3_600_000) : Number.POSITIVE_INFINITY
  const scheduled = unique.some((i) => (i.scheduled_events || []).length > 0)
  const datedWhyNow = hasDateOrWindow(opts.whyNow || '')
  const timing = scheduled || datedWhyNow ? 15 : ageHours <= 24 ? 10 : ageHours <= 7 * 24 ? 6 : 2
  const expression = ticker ? (opts.exchange ? 10 : 7) : 0
  const corroboration = Math.min(10, Math.max(0, (sources.size - 1) * 4 + (unique.length > 1 ? 2 : 0)))
  const learning = Math.max(-8, Math.min(8, Math.round(opts.learningAdjustment || 0)))
  const breakdown: TradeScoreBreakdown = { evidence, impact, specificity, timing, expression, corroboration, learning_adjustment: learning }
  const uncappedScore = Math.max(0, Math.min(100, Object.values(breakdown).reduce((a, b) => a + b, 0)))
  const missingChecks: string[] = []
  let cap = 100
  if (!ticker) { missingChecks.push('verified listed ticker'); cap = Math.min(cap, 45) }
  if (!opts.exchange) { missingChecks.push('listing and liquidity'); cap = Math.min(cap, 72) }
  if (!scheduled && !datedWhyNow) { missingChecks.push('dated catalyst'); cap = Math.min(cap, 65) }
  if (!opts.pricedIn || opts.pricedIn === 'unknown') { missingChecks.push('price and market expectations'); cap = Math.min(cap, 68) }
  if (sources.size < 2 && evidence < 23) { missingChecks.push('independent confirmation'); cap = Math.min(cap, 62) }
  // The news archive does not carry a verified live price/liquidity/consensus snapshot. This check is
  // always explicit at the chat tier and is exactly what the downstream gauntlet must resolve.
  if (!missingChecks.includes('price and market expectations')) missingChecks.push('live price, liquidity, and consensus')
  const score = Math.min(uncappedScore, cap)
  const readiness: TradeScore['readiness'] = !ticker ? 'watch_only'
    : score >= 65 && missingChecks.length <= 2 ? 'check_now'
      : score >= 45 ? 'needs_data' : 'watch_only'
  const reasons = [
    `${sources.size} independent source${sources.size === 1 ? '' : 's'}`,
    `top news materiality ${topMateriality}/100`,
    ticker ? `specific ticker ${ticker}` : 'no verified ticker',
    scheduled || datedWhyNow ? 'dated trigger present' : 'timing not proven',
  ]
  return { score, uncappedScore, cap, readiness, direction: directionOf(unique), breakdown, missingChecks, reasons }
}
