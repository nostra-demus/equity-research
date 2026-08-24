// Deterministic paper-policy projection over Nostra's append-only Calls history.
//
// IBKR cannot backdate a fill. Old calls therefore use a currency-neutral 100-unit replay at the
// decision price and the latest completed review mark. Live IBKR orders are a separate, current-only
// target. The split prevents a broker statement from pretending a historical fill happened.

export const HIGH_CONVICTION_MIN = 75
export const LOW_CONVICTION_WEIGHT_PCT = 5
export const HIGH_CONVICTION_WEIGHT_PCT = 10

export type PaperCallSide = 'long' | 'short'
export type PaperConviction = 'low' | 'high'
export type PaperCallBlockReason =
  | 'provisional' | 'unverified' | 'missing_frozen_call' | 'invalid_decision_date'
  | 'future_call' | 'superseded' | 'missing_confidence' | 'missing_price'
  | 'missing_currency' | 'review_exit' | 'review_action_missing'
  | 'insufficient_cash' | 'ambiguous_listing'

export interface HistoricalPaperTrade {
  trade_id: string
  ticker: string
  decision: string
  side: PaperCallSide
  conviction: PaperConviction
  confidence: number
  target_weight_pct: number
  decision_date: string
  entry_price: number
  currency: string
  status: 'open' | 'closed'
  exit_date: string | null
  exit_price: number | null
  price_as_of: string
  current_price: number
  position_return_pct: number
  allocated_units: number
  current_value_units: number
  mark_source: 'decision' | 'review' | 'later_call'
  detail: string
}

export interface PaperCallBlock {
  ticker: string
  decision: string
  decision_date: string | null
  reason: PaperCallBlockReason
  detail: string
}

export interface HistoricalPaperPortfolio {
  schema_version: 'nostra-paper-history/v1'
  available: boolean
  unit: 'normalized_nav'
  starting_value: 100
  present_value: number
  cash_value: number
  invested_value: number
  total_return_pct: number
  calls_examined: number
  non_trade_calls: number
  trade_calls: number
  open_trades: number
  closed_trades: number
  rules: {
    low_conviction_weight_pct: 5
    high_conviction_weight_pct: 10
    high_conviction_min_confidence: 75
    eligible_baskets: ['Selected', 'Short']
    provisional_calls_trade: false
  }
  trades: HistoricalPaperTrade[]
  blocked_calls: PaperCallBlock[]
  detail: string
}

export interface CallPolicyTargetPosition {
  ticker: string
  decision: string
  side: PaperCallSide
  conviction: PaperConviction
  confidence: number
  model_weight_pct: number
  currency: string
  exchange: string | null
  call_id: string
  decision_date: string
}

export interface CallPolicyTarget {
  valid: boolean
  source_path: 'published Calls history' | null
  generated_at: string
  gross_pct: number | null
  cash_pct: number | null
  positions: CallPolicyTargetPosition[]
  blocked_calls: PaperCallBlock[]
  detail: string
}

type LooseCall = Record<string, unknown>

function looseObject(value: unknown): LooseCall | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as LooseCall : null
}

function looseRows(value: unknown): LooseCall[] {
  return Array.isArray(value)
    ? value.map(looseObject).filter((row): row is LooseCall => row !== null)
    : []
}

function positive(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 && Math.abs(n) < 1e100 ? n : null
}

function score(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isoDate(value: unknown): string | null {
  const raw = text(value)
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const parsed = new Date(`${raw}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === raw ? raw : null
}

function policyDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.ENGINE_DECISION_TIME_ZONE || 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now)
}

function frozen(call: LooseCall): LooseCall | null {
  const value = looseObject(call.frozen_call)
  return value?.locked === true ? value : null
}

function decisionDate(call: LooseCall): string | null {
  return isoDate(frozen(call)?.decision_date) || isoDate(call?.decision_date)
}

function sideFor(call: LooseCall): PaperCallSide | null {
  const basket = text(frozen(call)?.basket)
  if (basket === 'Selected') return 'long'
  if (basket === 'Short') return 'short'
  return null
}

function sizing(confidence: number): { conviction: PaperConviction; weight: 5 | 10 } {
  return confidence >= HIGH_CONVICTION_MIN
    ? { conviction: 'high', weight: HIGH_CONVICTION_WEIGHT_PCT }
    : { conviction: 'low', weight: LOW_CONVICTION_WEIGHT_PCT }
}

function latestDoneReview(call: LooseCall): LooseCall | null {
  const rows = looseRows(call.timeline)
    .filter((row) => row.status === 'done' && isoDate(row.review_date))
    .sort((a, b) => String(a.review_date).localeCompare(String(b.review_date)))
  return rows.at(-1) ?? null
}

function latestReviewMark(call: LooseCall): { price: number; date: string } | null {
  const rows = looseRows(call.timeline)
    .filter((row) => row.status === 'done' && positive(row.review_price) !== null && isoDate(row.review_date))
    .sort((a, b) => String(a.review_date).localeCompare(String(b.review_date)))
  const row = rows.at(-1)
  return row ? { price: positive(row.review_price)!, date: isoDate(row.review_date)! } : null
}

function blockBase(call: LooseCall): Pick<PaperCallBlock, 'ticker' | 'decision' | 'decision_date'> {
  const f = frozen(call)
  return {
    ticker: text(call?.ticker)?.toUpperCase() || 'UNKNOWN',
    decision: text(f?.decision) || text(call?.decision) || 'Unknown',
    decision_date: decisionDate(call),
  }
}

/** Immutable-authority failures must not supersede the last trusted call. */
function authorityBlock(call: LooseCall, today: string): PaperCallBlock | null {
  const base = blockBase(call)
  const f = frozen(call)
  if (!f) return { ...base, reason: 'missing_frozen_call', detail: `${base.ticker} has no immutable decision-time snapshot. It cannot alter history or the broker target.` }
  if (!decisionDate(call)) return { ...base, reason: 'invalid_decision_date', detail: `${base.ticker} has no valid decision date. It cannot trade.` }
  if (decisionDate(call)! > today) return { ...base, reason: 'future_call', detail: `${base.ticker} is dated ${decisionDate(call)}, after ${today}. It cannot trade early.` }
  if (call?.superseded === true) return { ...base, reason: 'superseded', detail: `${base.ticker} remains visible in append-only history but was corrected by ${text(call?.superseded_by) || 'a later record'}.` }
  if (call?.integrity_status === 'provisional') return { ...base, reason: 'provisional', detail: `${base.ticker} is provisional. It is tracked but cannot change a verified target or reach IBKR.` }
  if (call?.integrity_status !== 'verified') return { ...base, reason: 'unverified', detail: `${base.ticker} is not evidence-verified under the current ledger standard. It cannot trade.` }
  return null
}

function tradeBlock(call: LooseCall, today: string): PaperCallBlock | null {
  const authority = authorityBlock(call, today)
  if (authority) return authority
  const base = blockBase(call)
  const f = frozen(call)!
  if (score(f.confidence) === null) return { ...base, reason: 'missing_confidence', detail: `${base.ticker} has no frozen 0–100 confidence, so Nostra cannot choose 5% or 10%.` }
  if (positive(f.entry_price) === null) return { ...base, reason: 'missing_price', detail: `${base.ticker} has no valid recorded call price, so the trade is not invented.` }
  if (!text(f.currency)) return { ...base, reason: 'missing_currency', detail: `${base.ticker} has no recorded currency, so the trade is blocked.` }
  return null
}

function datedCalls(calls: LooseCall[]): LooseCall[] {
  return [...calls].filter((call) => (decisionDate(call) || text(call?.decision_date)) && text(call?.ticker)).sort((a, b) => {
    const ad = decisionDate(a) || text(a?.decision_date) || ''
    const bd = decisionDate(b) || text(b?.decision_date) || ''
    if (ad !== bd) return ad.localeCompare(bd)
    return String(a.run_root || '').localeCompare(String(b.run_root || ''))
  })
}

function listingKey(call: LooseCall): string {
  const f = frozen(call)
  return [text(call?.ticker)?.toUpperCase(), text(f?.currency)?.toUpperCase(), text(call?.exchange)?.toUpperCase()].map((v) => v || '').join('|')
}

/** Replay every append-only published call without hindsight-changing its decision or confidence. */
export function buildHistoricalPaperPortfolio(rawCalls: unknown, now: Date = new Date()): HistoricalPaperPortfolio {
  const calls = datedCalls(looseRows(rawCalls))
  const today = policyDate(now)
  let cash = 100
  let nonTradeCalls = 0
  const trades: HistoricalPaperTrade[] = []
  const openByListing = new Map<string, HistoricalPaperTrade>()
  const blocked: PaperCallBlock[] = []

  for (const call of calls) {
    const authority = authorityBlock(call, today)
    if (authority) { blocked.push(authority); continue }
    const f = frozen(call)!
    const ticker = text(call.ticker)!.toUpperCase()
    const date = decisionDate(call)!
    const currency = text(f.currency) || ''
    const key = listingKey(call)
    const entry = positive(f.entry_price)
    const prior = openByListing.get(key)
    // Only a later verified call for the same listing may close the earlier lot. Provisional, future,
    // superseded, or cross-currency rows never cancel a valid position.
    if (prior && entry !== null && currency === prior.currency) {
      const rawReturn = ((entry - prior.entry_price) / prior.entry_price) * 100
      const signedReturn = prior.side === 'short' ? -rawReturn : rawReturn
      prior.status = 'closed'
      prior.exit_date = date
      prior.exit_price = entry
      prior.price_as_of = date
      prior.current_price = entry
      prior.position_return_pct = signedReturn
      prior.current_value_units = prior.allocated_units * (1 + signedReturn / 100)
      prior.mark_source = 'later_call'
      prior.detail = `Closed when Nostra published its next verified ${ticker} listing call on ${date}.`
      cash += prior.current_value_units
      openByListing.delete(key)
    }

    const side = sideFor(call)
    if (!side) { nonTradeCalls++; continue }
    const reason = tradeBlock(call, today)
    if (reason) { blocked.push(reason); continue }
    const confidence = score(f.confidence)!
    const { conviction, weight } = sizing(confidence)
    // A synchronized event-time NAV does not exist for every currency/listing. Fixed initial-capital
    // units avoid leaking a later review mark backwards into an earlier sizing decision.
    const allocation = weight
    if (allocation > cash + 1e-9) {
      blocked.push({ ticker, decision: text(f.decision) || 'Unknown', decision_date: date, reason: 'insufficient_cash', detail: `${ticker} needed ${weight} initial-capital units but the replay had insufficient free cash.` })
      continue
    }
    cash -= allocation
    const mark = latestReviewMark(call)
    const currentPrice = mark?.price ?? positive(f.entry_price)!
    const rawReturn = ((currentPrice - positive(f.entry_price)!) / positive(f.entry_price)!) * 100
    const signedReturn = side === 'short' ? -rawReturn : rawReturn
    const trade: HistoricalPaperTrade = {
      trade_id: text(call.run_root) || `${ticker}-${date}`,
      ticker, decision: text(f.decision) || text(call.decision) || 'Unknown', side, conviction,
      confidence, target_weight_pct: weight, decision_date: date, entry_price: positive(f.entry_price)!,
      currency, status: 'open', exit_date: null, exit_price: null,
      price_as_of: mark?.date ?? date, current_price: currentPrice, position_return_pct: signedReturn,
      allocated_units: allocation, current_value_units: allocation * (1 + signedReturn / 100),
      mark_source: mark ? 'review' : 'decision',
      detail: mark ? `Marked to the latest completed review on ${mark.date}.` : 'No completed review price yet; value remains at the recorded call price.',
    }
    trades.push(trade)
    openByListing.set(key, trade)
  }

  const invested = [...openByListing.values()].reduce((sum, row) => sum + row.current_value_units, 0)
  const present = cash + invested
  return {
    schema_version: 'nostra-paper-history/v1', available: true, unit: 'normalized_nav', starting_value: 100,
    present_value: present, cash_value: cash, invested_value: invested, total_return_pct: present - 100,
    calls_examined: calls.length, non_trade_calls: nonTradeCalls, trade_calls: trades.length,
    open_trades: openByListing.size, closed_trades: trades.length - openByListing.size,
    rules: {
      low_conviction_weight_pct: LOW_CONVICTION_WEIGHT_PCT,
      high_conviction_weight_pct: HIGH_CONVICTION_WEIGHT_PCT,
      high_conviction_min_confidence: HIGH_CONVICTION_MIN,
      eligible_baskets: ['Selected', 'Short'], provisional_calls_trade: false,
    },
    trades, blocked_calls: blocked,
    detail: trades.length
      ? 'Historical calls use fixed 5/10 units of initial capital and their own latest dated review marks. This currency-neutral replay is not a backdated IBKR statement or one same-date live NAV.'
      : 'No published call clears the historical trade rules. The normalized replay remains in cash.',
  }
}

function currentReview(call: LooseCall): { action: string | null; reason: string | null; confidence: number | null; thesisStatus: string | null } {
  const timeline = latestDoneReview(call)
  const latestAction = looseObject(call.latest_action_now)
  const timelineAction = looseObject(timeline?.action_now)
  const latestConfidence = looseObject(call.latest_confidence_update)
  const timelineConfidence = looseObject(timeline?.confidence_update)
  const action = text(latestAction?.label) || text(timelineAction?.label)
  const reason = text(latestAction?.reason) || text(timelineAction?.reason)
  const confidence = score(latestConfidence?.after) ?? score(timelineConfidence?.after)
  return { action, reason, confidence, thesisStatus: text(call?.latest_thesis_status)?.toLowerCase() || text(timeline?.thesis_status)?.toLowerCase() || null }
}

/** The latest trusted call per exact listing becomes today's broker target. */
export function buildCallPolicyTarget(rawCalls: unknown, now: Date = new Date()): CallPolicyTarget {
  const calls = datedCalls(looseRows(rawCalls))
  const today = policyDate(now)
  const latestTrusted = new Map<string, LooseCall>()
  const blocked: PaperCallBlock[] = []
  for (const call of calls) {
    const authority = authorityBlock(call, today)
    if (authority) { blocked.push(authority); continue }
    latestTrusted.set(listingKey(call), call)
  }

  const positions: CallPolicyTargetPosition[] = []
  for (const call of [...latestTrusted.values()].sort((a, b) => listingKey(a).localeCompare(listingKey(b)))) {
    const side = sideFor(call)
    if (!side) continue
    const f = frozen(call)!
    const ticker = text(call.ticker)!.toUpperCase()
    const review = currentReview(call)
    if (['Exit', 'Stay away', 'Keep watching'].includes(review.action || '') || ['broken', 'expired'].includes(review.thesisStatus || '')) {
      blocked.push({ ...blockBase(call), reason: 'review_exit', detail: review.reason || `${ticker}'s latest completed review says ${review.action || review.thesisStatus}; no new position may open.` })
      continue
    }
    if (!review.action && review.thesisStatus === 'at-risk') {
      blocked.push({ ...blockBase(call), reason: 'review_action_missing', detail: `${ticker}'s latest review is at-risk but records no current action. Execution waits for an explicit Hold, Add, or Exit.` })
      continue
    }
    const reason = tradeBlock(call, today)
    if (reason) { blocked.push(reason); continue }
    const confidence = review.confidence ?? score(f.confidence)!
    const { conviction, weight } = sizing(confidence)
    positions.push({
      ticker, decision: text(f.decision) || text(call.decision) || 'Unknown', side, conviction, confidence,
      model_weight_pct: side === 'short' ? -weight : weight, currency: text(f.currency)!,
      exchange: text(call.exchange), call_id: text(call.run_root) || `${ticker}-${decisionDate(call)}`,
      decision_date: decisionDate(call)!,
    })
  }

  // A bare ticker cannot safely identify two simultaneous listings at the broker boundary.
  const counts = new Map<string, number>()
  for (const row of positions) counts.set(row.ticker, (counts.get(row.ticker) || 0) + 1)
  const ambiguous = new Set([...counts].filter(([, count]) => count > 1).map(([ticker]) => ticker))
  const safePositions = positions.filter((row) => !ambiguous.has(row.ticker))
  for (const ticker of ambiguous) blocked.push({ ticker, decision: 'Blocked', decision_date: null, reason: 'ambiguous_listing', detail: `${ticker} maps to more than one current listing. No order is sent until the listing identity is unique.` })

  const gross = safePositions.reduce((sum, row) => sum + Math.abs(row.model_weight_pct), 0)
  const valid = gross <= 100
  if (!valid) blocked.push({ ticker: 'PORTFOLIO', decision: 'Blocked', decision_date: null, reason: 'insufficient_cash', detail: 'Eligible calls exceed 100% gross exposure. No broker target is published until the book is reduced.' })
  return {
    valid, source_path: 'published Calls history', generated_at: now.toISOString(),
    gross_pct: valid ? gross : null, cash_pct: valid ? 100 - gross : null,
    positions: valid ? safePositions : [], blocked_calls: blocked,
    detail: !valid ? 'Eligible calls exceed the 100% exposure cap. Execution is blocked.'
      : safePositions.length ? `${safePositions.length} current verified call${safePositions.length === 1 ? '' : 's'} clear the 5%/10% paper policy.`
        : blocked.length ? 'No current call is safe to execute. The broker target remains blocked or cash.'
          : 'No current call says Selected or Short. The paper target is 100% cash.',
  }
}
