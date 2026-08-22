import type { CallSummary, CallUpdate, NeedsAttentionRow } from './types'

type CallRow = CallSummary | null | undefined
type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object'
}
const nullableString = (value: unknown) => value === null || typeof value === 'string'
const nullableNumber = (value: unknown) => value === null || (typeof value === 'number' && Number.isFinite(value))
const optionalString = (value: unknown) => value === undefined || nullableString(value)
const optionalNumber = (value: unknown) => value === undefined || nullableNumber(value)

function isTimelineEntry(value: unknown): boolean {
  if (!isRecord(value)) return false
  return typeof value.window === 'string'
    && nullableString(value.due_date)
    && (value.status === 'done' || value.status === 'due' || value.status === 'overdue' || value.status === 'upcoming')
    && optionalString(value.review_date)
    && optionalNumber(value.review_price)
    && optionalNumber(value.absolute_return_pct)
    && optionalString(value.thesis_status)
    && optionalString(value.review_file)
    && optionalString(value.memo_delta_file)
    && optionalString(value.stage_one_comment)
}

function isCallSummary(value: unknown): value is CallSummary {
  if (!isRecord(value) || typeof value.ticker !== 'string' || !value.ticker.trim()) return false
  if (typeof value.run_root !== 'string' || !value.run_root || typeof value.final_thesis_path !== 'string' || !value.final_thesis_path) return false
  if (!nullableString(value.company) || !nullableString(value.decision_date) || !nullableString(value.decision)) return false
  if (!nullableString(value.time_horizon) || !nullableString(value.currency) || !nullableString(value.latest_thesis_status)) return false
  if (!optionalString(value.latest_review_summary) || !optionalString(value.latest_review_date)) return false
  if (![value.entry_price, value.expected_return_pct, value.implied_target].every(optionalNumber)) return false
  if (!Array.isArray(value.timeline) || !value.timeline.every(isTimelineEntry)) return false
  if (value.next_checkpoint != null && (!isRecord(value.next_checkpoint)
    || typeof value.next_checkpoint.window !== 'string'
    || typeof value.next_checkpoint.status !== 'string'
    || !nullableString(value.next_checkpoint.due_date))) return false
  const forecasts = value.forecasts
  if (!isRecord(forecasts)) return false
  return ['open', 'confirmed', 'falsified', 'expired', 'other']
    .every((key) => typeof forecasts[key] === 'number' && Number.isFinite(forecasts[key]))
}

/** Deploy-skew boundary: only complete-enough call rows may reach either Current or History cards. */
export function publishedCalls(value: unknown): CallSummary[] {
  return Array.isArray(value) ? value.filter(isCallSummary) : []
}

function isCallUpdate(value: unknown): value is CallUpdate {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && !!value.id
    && typeof value.ticker === 'string' && !!value.ticker
    && (value.kind === 'call' || value.kind === 'review')
    && typeof value.headline === 'string' && !!value.headline
    && (value.tone === 'better' || value.tone === 'worse' || value.tone === 'same' || value.tone === 'info')
    && optionalString(value.company) && optionalString(value.at) && optionalString(value.detail)
    && typeof value.run_root === 'string'
    && (value.source_path === null || typeof value.source_path === 'string')
}

export function publishedCallUpdates(value: unknown): CallUpdate[] {
  return Array.isArray(value) ? value.filter(isCallUpdate) : []
}

function isNeedsAttentionRow(value: unknown): value is NeedsAttentionRow {
  if (!isRecord(value)) return false
  return (value.type === 'forecast' || value.type === 'kill_criteria')
    && typeof value.ticker === 'string' && !!value.ticker
    && typeof value.run_root === 'string' && !!value.run_root
    && typeof value.final_thesis_path === 'string' && !!value.final_thesis_path
    && typeof value.due_date === 'string' && typeof value.description === 'string'
    && optionalString(value.company)
}

export function publishedNeedsAttention(value: unknown): NeedsAttentionRow[] {
  return Array.isArray(value) ? value.filter(isNeedsAttentionRow) : []
}

function newestFirst(a: CallRow, b: CallRow): number {
  const ad = typeof a?.decision_date === 'string' ? a.decision_date : ''
  const bd = typeof b?.decision_date === 'string' ? b.decision_date : ''
  if (ad !== bd) return ad < bd ? 1 : -1
  const ar = typeof a?.run_root === 'string' ? a.run_root : ''
  const br = typeof b?.run_root === 'string' ? b.run_root : ''
  return br.localeCompare(ar)
}

/** One current published call per ticker; the complete dated ledger remains available as History. */
export function currentCalls(calls: unknown): CallSummary[] {
  const newest = new Map<string, CallSummary>()
  for (const call of publishedCalls(calls)) {
    const ticker = call.ticker.trim().toUpperCase()
    const prior = newest.get(ticker)
    if (!prior || newestFirst(call, prior) < 0) newest.set(ticker, call)
  }
  return [...newest.values()].sort(newestFirst)
}
