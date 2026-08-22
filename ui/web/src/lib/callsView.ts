import type { CallSummary, CallsScorecard, CallUpdate, NeedsAttentionRow } from './types'

type CallRow = CallSummary | null | undefined
type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object'
}
const nullableString = (value: unknown) => value === null || typeof value === 'string'
const nullableNumber = (value: unknown) => value === null || (typeof value === 'number' && Number.isFinite(value))
const optionalString = (value: unknown) => value === undefined || nullableString(value)
const optionalNumber = (value: unknown) => value === undefined || nullableNumber(value)
const optionalStringArray = (value: unknown) => value === undefined || (Array.isArray(value) && value.every((row) => typeof row === 'string'))
const optionalConfidence = (value: unknown) => value === undefined || value === null
  || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)

function optionalLearningObjects(value: UnknownRecord): boolean {
  if (value.action_now !== undefined && value.action_now !== null && (!isRecord(value.action_now)
    || !['Hold', 'Add', 'Exit', 'Stay away', 'Keep watching'].includes(String(value.action_now.label))
    || typeof value.action_now.reason !== 'string')) return false
  if (value.confidence_update !== undefined && value.confidence_update !== null && (!isRecord(value.confidence_update)
    || !optionalConfidence(value.confidence_update.before) || !optionalConfidence(value.confidence_update.after)
    || !optionalString(value.confidence_update.change_reason))) return false
  if (value.next_check !== undefined && value.next_check !== null && (!isRecord(value.next_check)
    || !optionalString(value.next_check.date) || !optionalString(value.next_check.label) || !optionalString(value.next_check.trigger))) return false
  if (value.learning !== undefined && value.learning !== null && (!isRecord(value.learning)
    || !optionalString(value.learning.why_right_or_wrong) || !optionalString(value.learning.error_source)
    || !optionalString(value.learning.rule_for_future) || !optionalString(value.learning.future_research_check))) return false
  return optionalStringArray(value.lessons) && optionalStringArray(value.error_taxonomy) && optionalStringArray(value.watch_items)
}

function isTimelineEntry(value: unknown): boolean {
  if (!isRecord(value)) return false
  return typeof value.window === 'string'
    && nullableString(value.due_date)
    && (value.status === 'done' || value.status === 'due' || value.status === 'overdue' || value.status === 'upcoming')
    && optionalString(value.review_date)
    && optionalNumber(value.review_price)
    && optionalNumber(value.absolute_return_pct)
    && optionalNumber(value.benchmark_relative_return_pct)
    && optionalString(value.thesis_status)
    && optionalString(value.decision_quality)
    && optionalString(value.thesis_delta_verdict)
    && optionalString(value.memo_delta_summary)
    && optionalString(value.review_file)
    && optionalString(value.memo_delta_file)
    && optionalString(value.stage_one_comment)
    && optionalNumber(value.forecasts_confirmed)
    && optionalNumber(value.forecasts_falsified)
    && optionalNumber(value.review_count)
    && optionalLearningObjects(value)
}

function isCallSummary(value: unknown): value is CallSummary {
  if (!isRecord(value) || typeof value.ticker !== 'string' || !value.ticker.trim()) return false
  if (typeof value.run_root !== 'string' || !value.run_root || typeof value.final_thesis_path !== 'string' || !value.final_thesis_path) return false
  if (!nullableString(value.company) || !nullableString(value.decision_date) || !nullableString(value.decision)) return false
  if (!nullableString(value.time_horizon) || !nullableString(value.currency) || !nullableString(value.latest_thesis_status)) return false
  if (!optionalString(value.latest_review_summary) || !optionalString(value.latest_review_date)) return false
  if (![value.confidence, value.entry_price, value.expected_return_pct, value.implied_target, value.downside_risk_pct]
    .every(optionalNumber)) return false
  if (typeof value.kill_criteria_count !== 'number' || !Number.isFinite(value.kill_criteria_count)) return false
  if (typeof value.review_count !== 'number' || !Number.isFinite(value.review_count)) return false
  if (!Array.isArray(value.timeline) || !value.timeline.every(isTimelineEntry)) return false
  if (value.frozen_call !== undefined && (!isRecord(value.frozen_call) || value.frozen_call.locked !== true
    || !nullableString(value.frozen_call.decision) || !nullableString(value.frozen_call.basket)
    || !optionalConfidence(value.frozen_call.confidence) || !nullableString(value.frozen_call.decision_date)
    || !nullableNumber(value.frozen_call.entry_price) || !nullableString(value.frozen_call.currency)
    || typeof value.frozen_call.source_path !== 'string')) return false
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

export function publishedCallsScorecard(value: unknown): CallsScorecard | null {
  if (!isRecord(value)) return null
  if (!['assessed_calls', 'excluded_provisional', 'worked', 'failed', 'mixed', 'unscored'].every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]))) return null
  if (!nullableNumber(value.average_return_pct) || !nullableNumber(value.average_vs_benchmark_pct)) return null
  if (!Array.isArray(value.horizons) || !value.horizons.every((row) => isRecord(row)
    && ['30d', '90d', '180d', '365d'].includes(String(row.window))
    && ['reviewed', 'worked', 'failed', 'mixed', 'unscored'].every((key) => typeof row[key] === 'number' && Number.isFinite(row[key]))
    && nullableNumber(row.average_return_pct) && nullableNumber(row.average_vs_benchmark_pct))) return null
  if (value.horizons.length !== 4 || new Set(value.horizons.map((row) => isRecord(row) ? String(row.window) : '')).size !== 4) return null
  if (!isRecord(value.confidence_check)
    || !['too_little_data', 'aligned', 'not_aligned'].includes(String(value.confidence_check.status))
    || typeof value.confidence_check.scored_calls !== 'number' || typeof value.confidence_check.detail !== 'string'
    || !Array.isArray(value.confidence_check.bands)
    || !value.confidence_check.bands.every((band) => isRecord(band)
      && typeof band.label === 'string' && typeof band.calls === 'number' && Number.isFinite(band.calls)
      && optionalConfidence(band.worked_pct))) return null
  return value as unknown as CallsScorecard
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
