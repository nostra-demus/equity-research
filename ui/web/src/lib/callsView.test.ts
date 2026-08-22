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

const update: CallUpdate = {
  id: 'review:SAFE:2026-08-12', ticker: 'SAFE', company: null, at: '2026-08-12', kind: 'review',
  headline: 'SAFE: no clear change yet', detail: null, tone: 'same', run_root: 'analyses/SAFE_2026-08-12',
  source_path: 'analyses/SAFE_2026-08-12/reviews/review.md',
}
assert.deepEqual(publishedCallUpdates([null, { id: 'partial' }, update]), [update], 'Updates skips malformed rows')

const attention: NeedsAttentionRow = {
  type: 'forecast', ticker: 'SAFE', company: null, run_root: 'analyses/SAFE_2026-08-12',
  final_thesis_path: 'analyses/SAFE_2026-08-12/final_thesis.md', due_date: '2026-08-11', description: 'check it',
}
assert.deepEqual(publishedNeedsAttention([undefined, { type: 'forecast' }, attention]), [attention], 'Needs Attention skips malformed rows')

console.log('ok  Calls Current view is one newest published record per ticker')
