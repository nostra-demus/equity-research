// IBKR Paper safety contract: the latest whole-book sizing is the only target authority, broker account
// ids never reach the public projection, and a broker outage degrades this one panel rather than Calls.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createIbkrPaperPortfolioService, readPaperPortfolioTarget, reconcilePaperPortfolio, type IbkrPaperAccount } from '../src/ibkr-paper'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try { await fn(); passed++; console.log('  ok ', name) } catch (error) { console.error('  FAIL', name); console.error(error); process.exitCode = 1 }
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ibkr-paper-'))
function writeSizing(root: string, name: string, body: unknown): void {
  const dir = path.join(root, 'analyses', 'portfolio')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, name), typeof body === 'string' ? body : JSON.stringify(body))
}
const cashBook = (generated = '2026-08-22') => ({
  schema_version: '1.0', generated_at: generated, scope: 'all', positions: [],
  book: { gross_pct: 0, cash_pct: 100 },
})

await check('a valid zero-position book means 100% cash, not a synthetic trade', () => {
  const root = tmp()
  writeSizing(root, '2026-08-22_sizing.json', cashBook())
  const target = readPaperPortfolioTarget(root)
  assert.equal(target.valid, true)
  assert.equal(target.cash_pct, 100)
  assert.deepEqual(target.positions, [])
  assert.match(target.detail, /100% cash/)
})

await check('a newer scoped run is skipped because it cannot truncate the whole book', () => {
  const root = tmp()
  writeSizing(root, '2026-08-22_sizing.json', {
    ...cashBook('2026-08-22'), positions: [{ ticker: 'AMZN', decision: 'Buy', model_weight_pct: 4 }],
    book: { gross_pct: 4, cash_pct: 96 },
  })
  writeSizing(root, '2026-08-23_sizing.json', { scope: 'AMZN', generated_at: '2026-08-23', positions: [], book: { gross_pct: 0, cash_pct: 100 } })
  assert.deepEqual(readPaperPortfolioTarget(root).positions.map((row) => row.ticker), ['AMZN'])
})

await check('an unreadable newest candidate blocks stale fallback', () => {
  const root = tmp()
  writeSizing(root, '2026-08-22_sizing.json', cashBook())
  writeSizing(root, '2026-08-23_sizing.json', '{ broken')
  const target = readPaperPortfolioTarget(root)
  assert.equal(target.valid, false)
  assert.match(target.detail, /unreadable/)
  assert.equal(target.source_path, 'analyses/portfolio/2026-08-23_sizing.json')
})

await check('duplicate or unreconciled weights fail closed', () => {
  const root = tmp()
  writeSizing(root, '2026-08-22_sizing.json', {
    ...cashBook(), positions: [
      { ticker: 'AMZN', decision: 'Buy', model_weight_pct: 4 },
      { ticker: 'AMZN', decision: 'Buy', model_weight_pct: 4 },
    ], book: { gross_pct: 8, cash_pct: 92 },
  })
  assert.equal(readPaperPortfolioTarget(root).valid, false)

  const second = tmp()
  writeSizing(second, '2026-08-22_sizing.json', {
    ...cashBook(), positions: [{ ticker: 'AMZN', decision: 'Buy', model_weight_pct: 4 }],
    book: { gross_pct: 20, cash_pct: 80 },
  })
  assert.equal(readPaperPortfolioTarget(second).valid, false)
})

const account = (positions: IbkrPaperAccount['positions']): IbkrPaperAccount => ({
  currency: 'USD', net_liquidation: 1_000_000, total_cash: 1_000_000,
  gross_position_value: 0, available_funds: 1_000_000, buying_power: 1_000_000,
  unrealized_pnl: null, realized_pnl: null, positions,
})

await check('empty IBKR Paper and an empty sized book reconcile exactly', () => {
  const target = { valid: true, source_path: 'analyses/portfolio/x.json', generated_at: '2026-08-22', gross_pct: 0, cash_pct: 100, positions: [], detail: 'cash' }
  assert.equal(reconcilePaperPortfolio(target, account([])).status, 'aligned')
})

await check('missing, unexpected, and wrong-weight holdings are named separately', () => {
  const target = {
    valid: true, source_path: 'analyses/portfolio/x.json', generated_at: '2026-08-22', gross_pct: 6, cash_pct: 94,
    positions: [{ ticker: 'AMZN', decision: 'Buy', model_weight_pct: 4 }, { ticker: 'MSFT', decision: 'Buy', model_weight_pct: 2 }], detail: 'two',
  }
  const got = reconcilePaperPortfolio(target, account([
    { symbol: 'AMZN', local_symbol: null, security_type: 'STK', currency: 'USD', exchange: 'SMART', quantity: 10, average_cost: 100, market_price: 110, market_value: 30_000, unrealized_pnl: 100, realized_pnl: 0, portfolio_weight_pct: 3 },
    { symbol: 'TSLA', local_symbol: null, security_type: 'STK', currency: 'USD', exchange: 'SMART', quantity: 2, average_cost: 100, market_price: 100, market_value: 1_000, unrealized_pnl: 0, realized_pnl: 0, portfolio_weight_pct: 0.1 },
  ]))
  assert.equal(got.status, 'differences')
  assert.deepEqual(got.differences.map((row) => row.kind).sort(), ['missing_position', 'unexpected_position', 'weight_mismatch'])
})

await check('the public service projection omits the IBKR account identifier and caches broker reads', async () => {
  const root = tmp()
  const state = path.join(root, '.state')
  writeSizing(root, '2026-08-22_sizing.json', cashBook())
  let reads = 0
  const service = createIbkrPaperPortfolioService({
    repoRoot: root, stateDir: state, cacheMs: 60_000, now: () => new Date('2026-08-23T10:00:00Z'),
    brokerReader: async () => {
      reads++
      return { accountId: 'PRIVATE-PAPER-ID', asOf: '2026-08-23T10:00:00Z', values: new Map([
        ['NetLiquidation', { value: 1_000_000, currency: 'USD' }],
        ['TotalCashValue', { value: 1_000_000, currency: 'USD' }],
        ['GrossPositionValue', { value: 0, currency: 'USD' }],
      ]), positions: [] }
    },
  })
  const first = await service()
  const second = await service()
  assert.equal(first.status, 'connected')
  assert.equal(first.reconciliation.status, 'aligned')
  assert.equal(reads, 1)
  assert.ok(!JSON.stringify(first).includes('PRIVATE-PAPER-ID'))
  assert.deepEqual(second, first)
  const audit = fs.readFileSync(path.join(state, 'ibkr-paper', 'events.jsonl'), 'utf8')
  assert.ok(!audit.includes('PRIVATE-PAPER-ID'))
})

await check('a connection failure stays a read-only panel result', async () => {
  const root = tmp()
  writeSizing(root, '2026-08-22_sizing.json', cashBook())
  const service = createIbkrPaperPortfolioService({
    repoRoot: root, stateDir: path.join(root, '.state'), cacheMs: 0,
    brokerReader: async () => { throw new Error('paper_connect_failed') },
  })
  const got = await service()
  assert.equal(got.status, 'disconnected')
  assert.equal(got.account, null)
  assert.equal(got.execution.status, 'locked')
  assert.equal(got.reconciliation.status, 'unavailable')
})

console.log(`\nibkr-paper.test.ts: ${passed} passed`)
