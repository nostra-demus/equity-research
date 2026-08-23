import assert from 'node:assert/strict'
import { publishedPaperExecutionResult, publishedPaperPortfolio } from './paperPortfolioView'

const valid = {
  schema_version: 'ibkr-paper-portfolio/v2', broker: 'IBKR', mode: 'paper', status: 'connected', paper_only: true,
  as_of: '2026-08-23T10:00:00Z', connection: { host: 'localhost', port: 7497, detail: 'connected' },
  account: {
    currency: 'USD', net_liquidation: 1_000_000, total_cash: 1_000_000, gross_position_value: 0,
    available_funds: 1_000_000, buying_power: 1_000_000, unrealized_pnl: null, realized_pnl: null, positions: [],
  },
  open_orders: [],
  history: {
    schema_version: 'nostra-paper-history/v1', available: true, unit: 'normalized_nav', starting_value: 100, present_value: 100,
    cash_value: 100, invested_value: 0, total_return_pct: 0, calls_examined: 1, non_trade_calls: 1,
    trade_calls: 0, open_trades: 0, closed_trades: 0,
    rules: { low_conviction_weight_pct: 5, high_conviction_weight_pct: 10, high_conviction_min_confidence: 75, eligible_baskets: ['Selected', 'Short'], provisional_calls_trade: false },
    trades: [], blocked_calls: [], detail: 'cash',
  },
  target: { valid: true, source_path: 'published Calls history', generated_at: '2026-08-22', gross_pct: 0, cash_pct: 100, positions: [], blocked_calls: [], detail: 'cash' },
  reconciliation: { status: 'aligned', differences: [], detail: 'aligned' },
  execution: { status: 'locked', can_execute: false, low_conviction_weight_pct: 5, high_conviction_weight_pct: 10, high_conviction_min_confidence: 75, detail: 'locked' },
}

assert.deepEqual(publishedPaperPortfolio(valid), valid)
assert.equal(publishedPaperPortfolio(null), null)
assert.equal(publishedPaperPortfolio({ ...valid, paper_only: false }), null, 'the UI never renders a broker payload that is not explicitly paper-only')
assert.equal(publishedPaperPortfolio({ ...valid, connection: { ...valid.connection, port: 7496 } }), null, 'the live-trading port is refused at the browser boundary too')
assert.equal(publishedPaperPortfolio({ ...valid, account: { ...valid.account, net_liquidation: Number.NaN } }), null, 'non-finite money cannot reach the dashboard')
assert.equal(publishedPaperPortfolio({ ...valid, target: { ...valid.target, gross_pct: Number.NaN } }), null, 'non-finite target weights fail closed')
const { account: _account, ...missingAccount } = valid
assert.equal(publishedPaperPortfolio(missingAccount), null, 'a partial v2 response cannot throw or imply an account')
assert.equal(publishedPaperPortfolio({ ...valid, history: { ...valid.history, rules: { ...valid.history.rules, eligible_baskets: ['Watchlist', 'Short'] } } }), null, 'only Selected and Short are executable')
assert.equal(publishedPaperPortfolio({ ...valid, status: 'disconnected', execution: { ...valid.execution, status: 'ready' } }), null, 'ready requires a connected account')
assert.equal(publishedPaperPortfolio({ ...valid, open_orders: [{ order_id: 1, contract_id: 1, symbol: 'ACME', action: 'BUY', total_quantity: 1, order_type: 'LMT', status: 'Submitted', filled: 0, remaining: 1, average_fill_price: null, nostra_managed: false, can_cancel: true }] }), null, 'a manual order can never claim Nostra cancellation authority')
const wrongWeight = { ticker: 'ACME', decision: 'Buy', side: 'long', conviction: 'low', confidence: 50, model_weight_pct: 7, currency: 'USD', exchange: 'NASDAQ', call_id: 'x', decision_date: '2026-08-23' }
assert.equal(publishedPaperPortfolio({ ...valid, target: { ...valid.target, gross_pct: 7, cash_pct: 93, positions: [wrongWeight] } }), null, 'only exact 5%/10% targets render')

const receipt = { ok: true, paper_only: true, action: 'sync', detail: 'ok', orders: [], skipped: [] }
assert.deepEqual(publishedPaperExecutionResult(receipt, 'sync'), receipt)
assert.equal(publishedPaperExecutionResult({ ...receipt, action: 'close' }, 'sync'), null)
assert.equal(publishedPaperExecutionResult({ ...receipt, orders: [{ order_id: 0 }] }, 'sync'), null)

console.log('ok  IBKR Paper browser projection is paper-only, port-locked, and render-safe')
