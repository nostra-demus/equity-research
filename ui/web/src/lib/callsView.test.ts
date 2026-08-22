import assert from 'node:assert/strict'
import { currentCalls, publishedCalls, publishedCallUpdates, publishedNeedsAttention } from './callsView'
import type { CallSummary, CallUpdate, NeedsAttentionRow } from './types'

const call = (ticker: string, date: string, requestedRunRoot?: string): CallSummary => {
  const runRoot = requestedRunRoot || `analyses/${ticker.trim().toUpperCase()}_${date}`
  return ({
  ticker, company: null, decision_date: date, decision: 'Watchlist', basket: null,
  decision_is_post_mortem_capped: false, confidence: null, confidence_is_post_review: false,
  integrity_status: 'verified', integrity_verdict: null, integrity_banner: false,
  time_horizon: null, entry_price: null, currency: null, expected_return_pct: null,
  implied_target: null, downside_risk_pct: null, kill_criteria_count: 0,
  forecasts: { open: 0, confirmed: 0, falsified: 0, expired: 0, other: 0 },
  run_root: runRoot, final_thesis_path: `${runRoot}/final_thesis.md`, latest_thesis_status: null,
  next_checkpoint: null, review_count: 0, timeline: [],
  needs_attention: { forecasts_overdue: [], kill_criteria_overdue: [] },
  })
}

const rows = currentCalls([
  call('ACME', '2026-08-01'),
  call('BETA', '2026-08-03'),
  call(' acme ', '2026-08-10'),
  call('BETA', '2026-08-03', 'analyses/BETA_2026-08-03_v2'),
])

assert.deepEqual(rows.map((row) => row.run_root), [
  'analyses/ACME_2026-08-10',
  'analyses/BETA_2026-08-03_v2',
], 'Current keeps the newest dated published call per normalized ticker')
assert.equal(currentCalls([call('', '2026-08-11')]).length, 0, 'a nameless row cannot become a current call')
assert.equal(currentCalls(null).length, 0, 'a missing calls field fails closed')
assert.equal(currentCalls([
  undefined,
  { ticker: null } as unknown as CallSummary,
  call('SAFE', '2026-08-12'),
]).length, 1, 'malformed rows cannot take down the Current view')
assert.deepEqual(publishedCalls([null, { ticker: 'PARTIAL' }, call('SAFE', '2026-08-12')])
  .map((row) => row.ticker), ['SAFE'], 'History receives only render-safe call rows')
const invalidNumber = call('NAN', '2026-08-12')
invalidNumber.expected_return_pct = Number.NaN
assert.equal(publishedCalls([invalidNumber]).length, 0, 'non-finite call numbers fail closed')
for (const field of ['confidence', 'downside_risk_pct', 'kill_criteria_count', 'review_count'] as const) {
  const invalid = call(`BAD-${field}`, '2026-08-12')
  invalid[field] = Number.NaN
  assert.equal(publishedCalls([invalid]).length, 0, `non-finite ${field} fails closed`)
}
assert.equal(publishedCalls([{
  ...call('LEGACY', '2026-08-11'),
  entry_price: undefined,
  expected_return_pct: undefined,
  implied_target: undefined,
}]).length, 1, 'omitted optional call numbers survive deploy skew')
const invalidTimelineNumber = call('BAD-TIMELINE', '2026-08-12')
invalidTimelineNumber.timeline = [{
  window: '30d', due_date: '2026-09-11', status: 'done',
  benchmark_relative_return_pct: Number.NaN,
}]
assert.equal(publishedCalls([invalidTimelineNumber]).length, 0,
  'non-finite scorecard numbers fail closed')
for (const field of ['forecasts_confirmed', 'forecasts_falsified', 'review_count'] as const) {
  const invalid = call(`BAD-TIMELINE-${field}`, '2026-08-12')
  invalid.timeline = [{
    window: '30d', due_date: '2026-09-11', status: 'done', [field]: Number.NaN,
  }]
  assert.equal(publishedCalls([invalid]).length, 0, `non-finite timeline ${field} fails closed`)
}

const update: CallUpdate = {
  id: 'review:SAFE:2026-08-12', ticker: 'SAFE', company: null, at: '2026-08-12', kind: 'review',
  headline: 'SAFE: no clear change yet', detail: null, tone: 'same', run_root: 'analyses/SAFE_2026-08-12',
  source_path: 'analyses/SAFE_2026-08-12/reviews/review.md',
}
assert.deepEqual(publishedCallUpdates([null, { id: 'partial' }, update]), [update], 'Updates skips malformed rows')
assert.equal(publishedCallUpdates([{
  ...update,
  company: undefined,
  at: undefined,
  detail: undefined,
}]).length, 1, 'omitted optional update labels survive deploy skew')

const attention: NeedsAttentionRow = {
  type: 'forecast', ticker: 'SAFE', company: null, run_root: 'analyses/SAFE_2026-08-12',
  final_thesis_path: 'analyses/SAFE_2026-08-12/final_thesis.md', due_date: '2026-08-11', description: 'check it',
}
assert.deepEqual(publishedNeedsAttention([undefined, { type: 'forecast' }, attention]), [attention], 'Needs Attention skips malformed rows')
assert.equal(publishedNeedsAttention([{ ...attention, company: undefined }]).length, 1,
  'an omitted optional company survives deploy skew')

console.log('ok  Calls Current view is one newest published record per ticker')
