export type ActionNowLabel = 'Hold' | 'Add' | 'Exit' | 'Stay away' | 'Keep watching'
export type OutcomeClass = 'worked' | 'failed' | 'mixed' | 'unscored'

interface ReviewLike {
  window: string
  status: string
  review_date?: string | null
  due_date?: string | null
  review_price?: number | null
  absolute_return_pct?: number | null
  benchmark_relative_return_pct?: number | null
  thesis_status?: string | null
  decision_quality?: string | null
  thesis_delta_verdict?: string | null
  memo_delta_summary?: string | null
  action_now?: { label?: string | null; reason?: string | null; recorded?: boolean } | null
  confidence_update?: { before?: number | null; after?: number | null; change_reason?: string | null } | null
  next_check?: { date?: string | null; label?: string | null; trigger?: string | null } | null
  learning?: {
    why_right_or_wrong?: string | null
    error_source?: string | null
    rule_for_future?: string | null
    future_research_check?: string | null
  } | null
  lessons?: string[]
  error_taxonomy?: string[]
  watch_items?: string[]
  review_file?: string | null
  memo_delta_file?: string | null
}

interface CallLike {
  ticker: string
  company?: string | null
  decision_date?: string | null
  decision?: string | null
  basket?: string | null
  confidence?: number | null
  entry_price?: number | null
  currency?: string | null
  run_root?: string
  final_thesis_path?: string | null
  timeline?: ReviewLike[]
  next_checkpoint?: { window?: string | null; due_date?: string | null; status?: string | null } | null
}

export interface CallsScorecardHorizon {
  window: '30d' | '90d' | '180d' | '365d'
  reviewed: number
  worked: number
  failed: number
  mixed: number
  unscored: number
  average_return_pct: number | null
  average_vs_benchmark_pct: number | null
}

export interface CallsScorecard {
  assessed_calls: number
  worked: number
  failed: number
  mixed: number
  unscored: number
  average_return_pct: number | null
  average_vs_benchmark_pct: number | null
  horizons: CallsScorecardHorizon[]
  confidence_check: {
    status: 'too_little_data' | 'aligned' | 'not_aligned'
    scored_calls: number
    detail: string
    bands: { label: string; calls: number; worked_pct: number | null }[]
  }
}

export interface CallMemoryItem {
  ticker: string
  company: string | null
  decision_date: string | null
  original_decision: string | null
  original_confidence: number | null
  original_price: number | null
  currency: string | null
  latest_review_date: string | null
  latest_price: number | null
  price_change_pct: number | null
  benchmark_relative_pct: number | null
  thesis_status: string | null
  decision_quality: string | null
  action_now: ActionNowLabel
  action_reason: string
  confidence_after: number | null
  confidence_reason: string | null
  why_right_or_wrong: string | null
  error_taxonomy: string[]
  future_research_check: string | null
  next_check_date: string | null
  next_check_label: string | null
  source_path: string | null
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const normalized = (value: unknown): string => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const companyCore = (value: unknown): string => normalized(value)
  .split(' ').filter((word) => !['the', 'com', 'inc', 'incorporated', 'corp', 'corporation', 'company', 'co', 'ltd', 'limited', 'plc', 'pjsc', 'sa', 'ag', 'nv'].includes(word)).join(' ')

export function directionAdjusted(basket: string | null | undefined, value: number | null | undefined): number | null {
  if (!finite(value)) return null
  const direction = normalized(basket)
  return direction === 'short' || direction === 'rejected' ? -value : value
}

export function classifyDecisionQuality(value: string | null | undefined): OutcomeClass {
  switch (normalized(value)) {
    case 'skill': return 'worked'
    case 'genuine miss': return 'failed'
    case 'luck': return 'mixed'
    default: return 'unscored'
  }
}

function reviewDate(row: ReviewLike): string {
  return row.review_date || row.due_date || ''
}

export function latestDoneReview(timeline: ReviewLike[] | null | undefined): ReviewLike | null {
  const done = (Array.isArray(timeline) ? timeline : []).filter((row) => row?.status === 'done')
  return done.sort((a, b) => reviewDate(a) < reviewDate(b) ? 1 : reviewDate(a) > reviewDate(b) ? -1 : String(b.review_file || '').localeCompare(String(a.review_file || '')))[0] || null
}

function average(values: Array<number | null>): number | null {
  const kept = values.filter(finite)
  if (!kept.length) return null
  return Math.round((kept.reduce((sum, value) => sum + value, 0) / kept.length) * 100) / 100
}

function confidenceCheck(calls: CallLike[]): CallsScorecard['confidence_check'] {
  const scored = calls.map((call) => ({ call, outcome: classifyDecisionQuality(latestDoneReview(call.timeline)?.decision_quality) }))
    .filter((row) => (row.outcome === 'worked' || row.outcome === 'failed') && finite(row.call.confidence))
  const ranges = [
    { label: 'Below 50', min: 0, max: 49.999 },
    { label: '50–69', min: 50, max: 69.999 },
    { label: '70–84', min: 70, max: 84.999 },
    { label: '85+', min: 85, max: 100 },
  ]
  const bands = ranges.map((range) => {
    const rows = scored.filter(({ call }) => call.confidence! >= range.min && call.confidence! <= range.max)
    const worked = rows.filter((row) => row.outcome === 'worked').length
    return { label: range.label, calls: rows.length, worked_pct: rows.length ? Math.round((worked / rows.length) * 1000) / 10 : null }
  })
  const usable = bands.filter((band) => band.calls >= 2 && band.worked_pct !== null)
  if (scored.length < 8 || usable.length < 2) {
    return {
      status: 'too_little_data', scored_calls: scored.length, bands,
      detail: `Too little data: ${scored.length} scored call${scored.length === 1 ? '' : 's'}. Conviction is not a probability; this check starts after 8 scored calls across at least 2 confidence bands.`,
    }
  }
  const aligned = usable.every((band, index) => index === 0 || band.worked_pct! + 10 >= usable[index - 1].worked_pct!)
  return {
    status: aligned ? 'aligned' : 'not_aligned', scored_calls: scored.length, bands,
    detail: aligned
      ? 'Higher-confidence calls have generally worked more often. This is a ranking check, not a probability claim.'
      : 'Higher-confidence calls have not worked more often. Nostra should lower or rework its conviction rules.',
  }
}

export function buildCallsScorecard(calls: CallLike[]): CallsScorecard {
  const rows = calls.map((call) => ({ call, review: latestDoneReview(call.timeline) }))
  const classes = rows.map(({ review }) => classifyDecisionQuality(review?.decision_quality))
  const count = (value: OutcomeClass) => classes.filter((row) => row === value).length
  const outcomeReturns = rows.map(({ call, review }) => directionAdjusted(call.basket, review?.absolute_return_pct))
  const benchmarkReturns = rows.map(({ call, review }) => directionAdjusted(call.basket, review?.benchmark_relative_return_pct))
  const horizons = (['30d', '90d', '180d', '365d'] as const).map((window) => {
    const windowRows = calls.flatMap((call) => {
      const review = (call.timeline || []).filter((row) => row.status === 'done' && normalized(row.window) === window).sort((a, b) => reviewDate(a) < reviewDate(b) ? 1 : -1)[0]
      return review ? [{ call, review }] : []
    })
    const windowClasses = windowRows.map(({ review }) => classifyDecisionQuality(review.decision_quality))
    const windowCount = (value: OutcomeClass) => windowClasses.filter((row) => row === value).length
    return {
      window, reviewed: windowRows.length,
      worked: windowCount('worked'), failed: windowCount('failed'), mixed: windowCount('mixed'), unscored: windowCount('unscored'),
      average_return_pct: average(windowRows.map(({ call, review }) => directionAdjusted(call.basket, review.absolute_return_pct))),
      average_vs_benchmark_pct: average(windowRows.map(({ call, review }) => directionAdjusted(call.basket, review.benchmark_relative_return_pct))),
    }
  })
  return {
    assessed_calls: count('worked') + count('failed'), worked: count('worked'), failed: count('failed'),
    mixed: count('mixed'), unscored: count('unscored'), average_return_pct: average(outcomeReturns),
    average_vs_benchmark_pct: average(benchmarkReturns), horizons, confidence_check: confidenceCheck(calls),
  }
}

const ACTIONS = new Set<ActionNowLabel>(['Hold', 'Add', 'Exit', 'Stay away', 'Keep watching'])

export function actionNowForCall(call: CallLike, review = latestDoneReview(call.timeline)): { label: ActionNowLabel; reason: string } {
  const explicit = review?.action_now?.label
  if (explicit && ACTIONS.has(explicit as ActionNowLabel)) {
    return { label: explicit as ActionNowLabel, reason: review?.action_now?.reason || 'Recorded in the latest review.' }
  }
  const decision = normalized(call.decision)
  const basket = normalized(call.basket)
  const thesis = normalized(review?.thesis_status)
  const quality = normalized(review?.decision_quality)
  const broken = thesis === 'broken' || thesis === 'at risk' || quality === 'genuine miss'
  const working = thesis === 'confirmed' || thesis === 'on track' || quality === 'skill'
  const inferred = review ? 'Conservative read of the latest review; no separate action was recorded.' : 'No review action has been recorded yet.'
  if (basket === 'short') return { label: broken ? 'Exit' : 'Hold', reason: inferred }
  if (decision === 'strong buy' || decision === 'buy' || decision === 'starter position only' || basket === 'selected') {
    return { label: broken ? 'Exit' : 'Hold', reason: inferred }
  }
  if (decision === 'avoid' || basket === 'rejected') {
    return { label: broken ? 'Keep watching' : 'Stay away', reason: inferred }
  }
  if (decision === 'watchlist') {
    return { label: working ? 'Stay away' : 'Keep watching', reason: inferred }
  }
  return { label: 'Keep watching', reason: 'No separate action was recorded.' }
}

function exactEntityMatchIndex(call: CallLike, identifiers: string[]): number {
  const ticker = normalized(call.ticker)
  const company = normalized(call.company)
  const core = companyCore(call.company)
  return identifiers.findIndex((raw) => {
    const id = normalized(raw)
    const idCore = companyCore(raw)
    if (!id) return false
    if (id === ticker || (company && id === company) || (core.length >= 5 && idCore === core)) return true
    const padded = ` ${id} `
    return (ticker.length >= 3 && padded.includes(` ${ticker} `)) || (company.length >= 5 && padded.includes(` ${company} `)) || (core.length >= 5 && ` ${idCore} `.includes(` ${core} `))
  })
}

function namedWatchItem(review: ReviewLike | null): string | null {
  const items = Array.isArray(review?.watch_items) ? review!.watch_items! : []
  const ranked = items.map((item, index) => {
    const lower = item.toLowerCase()
    let score = 0
    if (/\b(q[1-4]|h[12]|fy\d{2,4}|results?|earnings|sales|pre-sales|backlog|margin|maturity|dividend|filing)\b/.test(lower)) score += 5
    if (/\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/.test(lower)) score += 3
    if (lower.includes('/research:')) score -= 4
    return { item, score, index }
  }).sort((a, b) => b.score - a.score || a.index - b.index)
  const item = ranked[0]?.item || null
  return item && item.length > 220 ? `${item.slice(0, 217).trimEnd()}…` : item
}

export function selectCallMemories(calls: CallLike[], identifiers: string[], cap = 3): CallMemoryItem[] {
  const newestByTicker = new Map<string, { call: CallLike; matchRank: number }>()
  for (const call of calls) {
    if (!call?.ticker) continue
    const matchRank = exactEntityMatchIndex(call, identifiers)
    if (matchRank < 0) continue
    const key = normalized(call.ticker)
    const prior = newestByTicker.get(key)
    if (!prior || String(call.decision_date || '') > String(prior.call.decision_date || '')) newestByTicker.set(key, { call, matchRank })
  }
  return [...newestByTicker.values()]
    .sort((a, b) => a.matchRank - b.matchRank || (String(a.call.decision_date || '') < String(b.call.decision_date || '') ? 1 : -1))
    .slice(0, cap).map(({ call }) => {
    const latest = latestDoneReview(call.timeline)
    const action = actionNowForCall(call, latest)
    const why = latest?.learning?.why_right_or_wrong || latest?.lessons?.[0] || latest?.memo_delta_summary || null
    const watch = namedWatchItem(latest)
    const future = latest?.learning?.future_research_check || latest?.learning?.rule_for_future || watch || null
    return {
      ticker: call.ticker, company: call.company || null, decision_date: call.decision_date || null,
      original_decision: call.decision || null, original_confidence: finite(call.confidence) ? call.confidence : null,
      original_price: finite(call.entry_price) ? call.entry_price : null, currency: call.currency || null,
      latest_review_date: latest?.review_date || null, latest_price: finite(latest?.review_price) ? latest!.review_price! : null,
      price_change_pct: finite(latest?.absolute_return_pct) ? latest!.absolute_return_pct! : null,
      benchmark_relative_pct: finite(latest?.benchmark_relative_return_pct) ? latest!.benchmark_relative_return_pct! : null,
      thesis_status: latest?.thesis_status || null, decision_quality: latest?.decision_quality || null,
      action_now: action.label, action_reason: action.reason,
      confidence_after: finite(latest?.confidence_update?.after) ? latest!.confidence_update!.after! : null,
      confidence_reason: latest?.confidence_update?.change_reason || null, why_right_or_wrong: why,
      error_taxonomy: Array.isArray(latest?.error_taxonomy) ? latest!.error_taxonomy! : [],
      future_research_check: future, next_check_date: latest?.next_check?.date || call.next_checkpoint?.due_date || null,
      next_check_label: latest?.next_check?.label || watch || call.next_checkpoint?.window || null,
      source_path: latest?.memo_delta_file || latest?.review_file || call.final_thesis_path || null,
    }
    })
}

function fmtPct(value: number | null): string {
  if (!finite(value)) return 'not recorded'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

function fmtPrice(currency: string | null, value: number | null): string {
  return finite(value) ? `${currency || ''} ${value}`.trim() : 'not recorded'
}

export function decisionMemoryBlock(memories: CallMemoryItem[]): string {
  return memories.map((memory, index) => [
    `[M${index + 1}] ${memory.ticker}${memory.company ? ` — ${memory.company}` : ''}`,
    `FROZEN ORIGINAL: Nostra rated it ${memory.original_decision || 'Not recorded'} on ${memory.decision_date || 'date not recorded'} at ${fmtPrice(memory.currency, memory.original_price)}. Original conviction: ${finite(memory.original_confidence) ? `${memory.original_confidence}/100` : 'not recorded'}.`,
    `LATEST OUTCOME: reviewed ${memory.latest_review_date || 'not yet'}; price ${fmtPrice(memory.currency, memory.latest_price)}; price change since call ${fmtPct(memory.price_change_pct)}; versus benchmark ${fmtPct(memory.benchmark_relative_pct)}; thesis ${memory.thesis_status || 'not scored'}; decision quality ${memory.decision_quality || 'not scored'}.`,
    `ACTION NOW: ${memory.action_now}. ${memory.action_reason}`,
    `CONFIDENCE: ${finite(memory.confidence_after) ? `${memory.original_confidence ?? 'not recorded'} → ${memory.confidence_after}/100` : `${memory.original_confidence ?? 'not recorded'} → not re-scored`}${memory.confidence_reason ? ` — ${memory.confidence_reason}` : ''}.`,
    `WHY / LEARNING: ${memory.why_right_or_wrong || 'Not recorded yet.'}${memory.error_taxonomy.length ? ` Error tags: ${memory.error_taxonomy.join(', ')}.` : ''}`,
    `RECHECK NOW: ${memory.future_research_check || 'No specific learned check recorded yet.'}`,
    `NEXT CHECK: ${memory.next_check_date || 'not scheduled'}${memory.next_check_label ? ` — ${memory.next_check_label}` : ''}.`,
    `SOURCE: ${memory.source_path || 'published decision ledger'}`,
  ].join('\n')).join('\n\n')
}
