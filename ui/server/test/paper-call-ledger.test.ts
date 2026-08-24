import assert from 'node:assert/strict'
import { buildCallPolicyTarget, buildHistoricalPaperPortfolio } from '../src/paper-call-ledger'

const call = (ticker: string, date: string, basket: string, confidence: number, entry: number, extra: Record<string, unknown> = {}) => ({
  ticker, run_root: `analyses/${ticker}_${date}`, integrity_status: 'verified', exchange: 'NASDAQ',
  frozen_call: { locked: true, decision: basket === 'Short' ? 'Short Candidate' : basket === 'Selected' ? 'Buy' : 'Watchlist', basket, confidence, decision_date: date, entry_price: entry, currency: 'USD', source_path: 'x' },
  timeline: [], ...extra,
})

const calls = [
  call('LOW', '2026-01-01', 'Selected', 74, 100, { timeline: [{ status: 'done', review_date: '2026-02-01', review_price: 110 }] }),
  call('HIGH', '2026-01-02', 'Short', 75, 200, { timeline: [{ status: 'done', review_date: '2026-02-02', review_price: 180 }] }),
  call('NOPE', '2026-01-03', 'Watchlist', 99, 50, { next_checkpoint: { window: '30d', due_date: '2026-02-02' } }),
]
const history = buildHistoricalPaperPortfolio(calls)
assert.equal(history.trade_calls, 2)
assert.equal(history.non_trade_calls, 1)
assert.equal(history.trades[0].target_weight_pct, 5)
assert.equal(history.trades[0].position_return_pct, 10)
assert.equal(history.trades[1].target_weight_pct, 10)
assert.equal(history.trades[1].position_return_pct, 10, 'a falling short position has a positive return')
assert.equal(history.present_value, 101.5)
assert.equal(history.call_states.length, 3, 'every old call has a visible state, including intentional no-trades')
assert.deepEqual(history.call_states.map((row) => [row.ticker, row.state, row.allocation_pct]), [
  ['LOW', 'open', 5],
  ['HIGH', 'open', 10],
  ['NOPE', 'no_position', null],
])
assert.equal(history.call_states[2].price_move_pct, null, 'the call price is not repeated as a fake later result')
assert.deepEqual([history.call_states[2].next_check_label, history.call_states[2].next_check_date], ['30d', '2026-02-02'])
assert.match(history.call_states[2].detail, /not an instruction to buy or short/)

const provisional = call('BLOCK', '2026-01-04', 'Selected', 90, 100, { integrity_status: 'provisional' })
const blocked = buildHistoricalPaperPortfolio([provisional])
assert.equal(blocked.trade_calls, 0)
assert.equal(blocked.cash_value, 100)
assert.equal(blocked.blocked_calls[0].reason, 'provisional')
assert.deepEqual([blocked.call_states[0].decision, blocked.call_states[0].state, blocked.call_states[0].block_reason], ['Buy', 'blocked', 'provisional'])

const unverified = call('UNVERIFIED', '2026-01-05', 'Selected', 90, 100, { integrity_status: 'unknown' })
const unverifiedTarget = buildCallPolicyTarget([unverified])
assert.equal(unverifiedTarget.positions.length, 0)
assert.equal(unverifiedTarget.cash_pct, 100)
assert.equal(unverifiedTarget.blocked_calls[0].reason, 'unverified')

const target = buildCallPolicyTarget([
  call('FLIP', '2026-01-01', 'Selected', 80, 100),
  call('FLIP', '2026-02-01', 'Watchlist', 80, 110),
  call('SHORT', '2026-02-01', 'Short', 60, 100),
])
assert.deepEqual(target.positions.map((row) => [row.ticker, row.model_weight_pct]), [['SHORT', -5]])
assert.equal(target.cash_pct, 95)

const crossCurrency = buildHistoricalPaperPortfolio([
  call('DUAL', '2026-01-01', 'Selected', 80, 100, { exchange: 'NASDAQ' }),
  call('DUAL', '2026-02-01', 'Selected', 80, 200, { exchange: 'HKEX', frozen_call: { locked: true, decision: 'Buy', basket: 'Selected', confidence: 80, decision_date: '2026-02-01', entry_price: 200, currency: 'HKD', source_path: 'x' } }),
])
assert.equal(crossCurrency.present_value, 100, 'same ticker in two currencies cannot overwrite an open lot')
assert.equal(crossCurrency.open_trades, 2)

const closedHistory = buildHistoricalPaperPortfolio([
  call('CLOSE', '2026-01-01', 'Selected', 80, 100),
  call('CLOSE', '2026-02-01', 'Watchlist', 80, 120),
])
assert.deepEqual([
  closedHistory.call_states[0].state,
  closedHistory.call_states[0].position_return_pct,
  closedHistory.call_states[0].mark_source,
  closedHistory.call_states[1].state,
], ['closed', 20, 'later_call', 'no_position'])

const trustedSurvives = buildCallPolicyTarget([
  call('TRUST', '2026-01-01', 'Selected', 80, 100),
  call('TRUST', '2026-02-01', 'Watchlist', 80, 110, { integrity_status: 'provisional' }),
], new Date('2026-08-24T00:00:00Z'))
assert.equal(trustedSurvives.positions[0].ticker, 'TRUST', 'a provisional row cannot cancel the last verified target')
assert.equal(trustedSurvives.blocked_calls[0].reason, 'provisional')

const reviewed = buildCallPolicyTarget([
  call('CUT', '2026-01-01', 'Selected', 78, 100, { latest_action_now: { label: 'Hold', reason: 'Still valid' }, latest_confidence_update: { after: 72 } }),
  call('EXIT', '2026-01-01', 'Selected', 90, 100, { latest_action_now: { label: 'Exit', reason: 'The thesis broke' }, latest_thesis_status: 'broken' }),
  call('FUTURE', '2026-08-25', 'Selected', 90, 100),
], new Date('2026-08-24T00:00:00Z'))
assert.deepEqual(reviewed.positions.map((row) => [row.ticker, row.model_weight_pct]), [['CUT', 5]], 'current sizing uses the latest review confidence but history remains frozen')
assert.deepEqual(new Set(reviewed.blocked_calls.map((row) => row.reason)), new Set(['review_exit', 'future_call']))

const overCap = buildCallPolicyTarget(Array.from({ length: 11 }, (_, index) => call(`CAP${index}`, '2026-01-01', 'Selected', 80, 100)))
assert.equal(overCap.valid, false)
assert.equal(overCap.positions.length, 0)
assert.equal(overCap.cash_pct, null)

console.log('\npaper-call-ledger.test.ts: 8 passed')
