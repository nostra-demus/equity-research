import assert from 'node:assert/strict'
import { currentCalls } from './callsView'
import type { CallSummary } from './types'

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

console.log('ok  Calls Current view is one newest published record per ticker')
