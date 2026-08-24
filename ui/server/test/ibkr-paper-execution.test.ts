import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { createIbkrPaperExecutionService } from '../src/ibkr-paper-execution'
import type { BrokerSnapshot } from '../src/ibkr-paper'

const accountId = 'DU-TEST-PAPER'
const snapshot = (positions: BrokerSnapshot['positions'] = [], openOrders: NonNullable<BrokerSnapshot['openOrders']> = []): BrokerSnapshot => ({
  accountId, asOf: '2026-08-24T00:00:00Z', values: new Map([
    ['NetLiquidation', { value: 100_000, currency: 'USD' }],
    ['TotalCashValue', { value: 100_000, currency: 'USD' }],
  ]), positions, openOrders,
})
const selectedCall = {
  ticker: 'ACME', run_root: 'analyses/ACME_2026-08-24', integrity_status: 'verified', exchange: 'NASDAQ', timeline: [],
  frozen_call: { locked: true, decision: 'Buy', basket: 'Selected', confidence: 80, decision_date: '2026-08-24', entry_price: 100, currency: 'USD', source_path: 'x' },
}
const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-execution-'))
const placed: any[] = []
const service = createIbkrPaperExecutionService({
  stateDir, enabled: true, allowedAccountId: accountId, snapshotReader: async () => snapshot(),
  callsReader: async () => ({ calls: [selectedCall] }),
  quoteResolver: async () => ({ contract: { conId: 123, symbol: 'ACME', secType: 'STK' as any, exchange: 'SMART', currency: 'USD' }, price: 100, min_tick: 0.01 }),
  orderPlacer: async (input) => {
    placed.push(input)
    return { order_id: 7, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})

const sync = await service.sync('11111111-1111-4111-8111-111111111111')
assert.equal(sync.orders.length, 1)
assert.equal(sync.orders[0].quantity, 99, 'the 10% ceiling keeps a 1% entry-price safety reserve')
assert.equal(placed[0].action, 'BUY')
assert.equal(placed[0].limitPrice, 100.5)
assert.match(placed[0].orderRef, /^NOSTRA_PAPER:/)

let cancelled = 0
const cancelService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([], [{ order_id: 9, contract_id: 123, symbol: 'ACME', action: 'BUY', total_quantity: 10, order_type: 'MKT', status: 'Submitted', filled: 0, remaining: 10, average_fill_price: null, order_ref: 'NOSTRA_PAPER:x' }]),
  orderCanceller: async (id) => { cancelled = id; return { order_id: id, ticker: 'ACME', action: 'BUY', quantity: 10, status: 'Cancelled', detail: 'cancelled' } },
})
assert.equal((await cancelService.cancel(9, '22222222-2222-4222-8222-222222222222')).action, 'cancel')
assert.equal(cancelled, 9)

const closeOrders: any[] = []
const closeService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([{ contract_id: 456, symbol: 'SHORT', local_symbol: 'SHORT', security_type: 'STK', currency: 'USD', exchange: 'SMART', quantity: -12, average_cost: 50, market_price: 40, market_value: -480, unrealized_pnl: 120, realized_pnl: 0 }]),
  orderPlacer: async (input) => { closeOrders.push(input); return { order_id: 10, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' } },
})
const closed = await closeService.close(456, '33333333-3333-4333-8333-333333333333')
assert.equal(closed.orders[0].action, 'BUY', 'closing a short buys the shares back')
assert.equal(closed.orders[0].quantity, 12)

const liveRefused = createIbkrPaperExecutionService({ enabled: true, allowedAccountId: 'U-LIVE', snapshotReader: async () => ({ ...snapshot(), accountId: 'U-LIVE' }) })
await assert.rejects(() => liveRefused.sync('44444444-4444-4444-8444-444444444444'), /not identified as an IBKR paper account/)

let unsafePlacement = 0
const unexpectedHoldingService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([{ contract_id: 789, symbol: 'OTHER', local_symbol: 'OTHER', security_type: 'STK', currency: 'USD', exchange: 'SMART', quantity: 20, average_cost: 50, market_price: 50, market_value: 1_000, unrealized_pnl: 0, realized_pnl: 0 }]),
  callsReader: async () => ({ calls: [selectedCall] }),
  quoteResolver: async () => { throw new Error('quote should not run') },
  orderPlacer: async () => { unsafePlacement++; throw new Error('order should not run') },
})
const unexpectedBlocked = await unexpectedHoldingService.sync('55555555-5555-4555-8555-555555555555')
assert.equal(unexpectedBlocked.orders.length, 0)
assert.equal(unsafePlacement, 0)
assert.match(unexpectedBlocked.detail, /outside the current Nostra target/)

let pendingAfterFirst = false
let concurrentPlacements = 0
const serializedService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([], pendingAfterFirst ? [{ order_id: 41, contract_id: 123, symbol: 'ACME', action: 'BUY', total_quantity: 99, order_type: 'LMT', status: 'Submitted', filled: 0, remaining: 99, average_fill_price: null, order_ref: null }] : []),
  callsReader: async () => ({ calls: [selectedCall] }),
  quoteResolver: async () => ({ contract: { conId: 123, symbol: 'ACME', secType: 'STK' as any, exchange: 'SMART', currency: 'USD' }, price: 100, min_tick: 0.01 }),
  orderPlacer: async (input) => {
    await new Promise((resolve) => setTimeout(resolve, 20))
    pendingAfterFirst = true
    concurrentPlacements++
    return { order_id: 41, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
const concurrent = await Promise.all([
  serializedService.sync('66666666-6666-4666-8666-666666666666'),
  serializedService.sync('77777777-7777-4777-8777-777777777777'),
])
assert.equal(concurrentPlacements, 1, 'the full snapshot-to-order transaction is serialized')
assert.equal(concurrent.reduce((sum, row) => sum + row.orders.length, 0), 1)

let retryReads = 0
const retryService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => {
    retryReads++
    if (retryReads === 1) throw new Error('temporary paper snapshot failure')
    return snapshot()
  },
  callsReader: async () => ({ calls: [] }),
})
const retryKey = '88888888-8888-4888-8888-888888888888'
await assert.rejects(() => retryService.sync(retryKey), /temporary paper snapshot failure/)
assert.equal((await retryService.sync(retryKey)).ok, true, 'a failed idempotent command can be retried with the same receipt')
assert.equal(retryReads, 2)

console.log('\nibkr-paper-execution.test.ts: 7 passed')
