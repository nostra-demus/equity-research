import assert from 'node:assert/strict'
import { publishedPaperPortfolio } from './paperPortfolioView'

const valid = {
  schema_version: 'ibkr-paper-portfolio/v1', broker: 'IBKR', mode: 'paper', status: 'connected', read_only: true,
  as_of: '2026-08-23T10:00:00Z', connection: { host: 'localhost', port: 7497, detail: 'connected' },
  account: {
    currency: 'USD', net_liquidation: 1_000_000, total_cash: 1_000_000, gross_position_value: 0,
    available_funds: 1_000_000, buying_power: 1_000_000, unrealized_pnl: null, realized_pnl: null, positions: [],
  },
  target: { valid: true, source_path: 'analyses/portfolio/2026-08-22_sizing.json', generated_at: '2026-08-22', gross_pct: 0, cash_pct: 100, positions: [], detail: 'cash' },
  reconciliation: { status: 'aligned', differences: [], detail: 'aligned' },
  execution: { status: 'locked', detail: 'read-only' },
}

assert.deepEqual(publishedPaperPortfolio(valid), valid)
assert.equal(publishedPaperPortfolio(null), null)
assert.equal(publishedPaperPortfolio({ ...valid, read_only: false }), null, 'the UI never renders a broker payload that is not explicitly read-only')
assert.equal(publishedPaperPortfolio({ ...valid, connection: { ...valid.connection, port: 7496 } }), null, 'the live-trading port is refused at the browser boundary too')
assert.equal(publishedPaperPortfolio({ ...valid, account: { ...valid.account, net_liquidation: Number.NaN } }), null, 'non-finite money cannot reach the dashboard')
assert.equal(publishedPaperPortfolio({ ...valid, target: { ...valid.target, positions: [{ ticker: 'AMZN', decision: 'Buy', model_weight_pct: Number.NaN }] } }), null, 'non-finite target weights fail closed')

console.log('ok  IBKR Paper browser projection is read-only, paper-port-only, and render-safe')
