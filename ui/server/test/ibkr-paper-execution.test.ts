import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { createIbkrPaperExecutionService, selectExactPaperContractDetail } from '../src/ibkr-paper-execution'
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
const nasdaqContract = {
  contract: { conId: 1_001, symbol: 'ACME', currency: 'USD', exchange: 'SMART', primaryExch: 'NASDAQ' },
  minTick: 0.01,
} as any
const nyseContract = {
  contract: { conId: 1_002, symbol: 'ACME', currency: 'USD', exchange: 'SMART', primaryExch: 'NYSE' },
  minTick: 0.01,
} as any
assert.equal(selectExactPaperContractDetail([nasdaqContract, nyseContract], {
  ticker: 'ACME', currency: 'USD', exchange: 'NasdaqGS',
})?.contract.conId, 1_001, 'a published Nasdaq label resolves only the Nasdaq IBKR listing')
assert.equal(selectExactPaperContractDetail([nasdaqContract], {
  ticker: 'ACME', currency: 'USD', exchange: 'NYSE',
}), null, 'a same-ticker same-currency listing on the wrong exchange fails closed')
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
  quoteResolver: async () => ({
    contract: { conId: 123, symbol: 'ACME', secType: 'STK' as any, exchange: 'SMART', primaryExch: 'NASDAQ', currency: 'USD' },
    price: 100, min_tick: 0.01,
  }),
  orderPlacer: async () => { unsafePlacement++; throw new Error('order should not run') },
})
const unexpectedBlocked = await unexpectedHoldingService.sync('55555555-5555-4555-8555-555555555555')
assert.equal(unexpectedBlocked.orders.length, 0)
assert.equal(unsafePlacement, 0)
assert.match(unexpectedBlocked.detail, /waiting or blocked/)
assert.match(unexpectedBlocked.skipped.find((row) => row.ticker === 'ACME')?.reason || '', /Close the non-target paper positions/)

const automaticCloseOrders: any[] = []
const automaticClose = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([{ contract_id: 790, symbol: 'OLD', local_symbol: 'OLD', security_type: 'STK', currency: 'USD', exchange: 'SMART', quantity: 20, average_cost: 50, market_price: 50, market_value: 1_000, unrealized_pnl: 0, realized_pnl: 0 }]),
  callsReader: async () => ({ calls: [] }),
  orderPlacer: async (input) => { automaticCloseOrders.push(input); return { order_id: 50, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' } },
})
const autoClosed = await automaticClose.sync('99999999-9999-4999-8999-999999999999', { reconcilePositions: true })
assert.equal(autoClosed.orders[0].action, 'SELL', 'a published 100%-cash target closes a long in the dedicated paper account')
assert.equal(automaticCloseOrders[0].limitPrice, undefined, 'removing a holding uses an exact market close')
assert.match(automaticCloseOrders[0].orderRef, /^NOSTRA_PAPER:AUTO:CLOSE:/)

const rebalanceOrders: any[] = []
const automaticRebalance = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([{ contract_id: 123, symbol: 'ACME', local_symbol: 'ACME', security_type: 'STK', currency: 'USD', exchange: 'SMART', quantity: 50, average_cost: 100, market_price: 100, market_value: 5_000, unrealized_pnl: 0, realized_pnl: 0 }]),
  callsReader: async () => ({ calls: [selectedCall] }),
  quoteResolver: async () => ({ contract: { conId: 123, symbol: 'ACME', secType: 'STK' as any, exchange: 'SMART', currency: 'USD' }, price: 100, min_tick: 0.01 }),
  orderPlacer: async (input) => { rebalanceOrders.push(input); return { order_id: 51, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' } },
})
await automaticRebalance.sync('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', { reconcilePositions: true })
assert.equal(rebalanceOrders[0].action, 'BUY')
assert.equal(rebalanceOrders[0].quantity, 49, '50 held shares are adjusted to the 99-share high-conviction target')
assert.match(rebalanceOrders[0].orderRef, /^NOSTRA_PAPER:AUTO:REBALANCE:/)

let staleCancelled = 0
const staleOrder = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([], [{ order_id: 52, contract_id: 123, symbol: 'OLD', action: 'BUY', total_quantity: 20, order_type: 'LMT', status: 'Submitted', filled: 0, remaining: 20, average_fill_price: null, order_ref: 'NOSTRA_PAPER:analyses/OLD_2026-08-01' }]),
  callsReader: async () => ({ calls: [] }),
  orderCanceller: async (id) => { staleCancelled = id; return { order_id: id, ticker: 'OLD', action: 'BUY', quantity: 20, status: 'Cancelled', detail: 'cancelled' } },
})
await staleOrder.sync('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', { reconcilePositions: true })
assert.equal(staleCancelled, 52, 'a superseded unfilled Nostra entry is cancelled before it can fill')

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

const acmePosition = (contractId: number, quantity: number, exchange = 'NASDAQ'): BrokerSnapshot['positions'][number] => ({
  contract_id: contractId, symbol: 'ACME', local_symbol: 'ACME', security_type: 'STK', currency: 'USD', exchange,
  quantity, average_cost: 100, market_price: 100, market_value: quantity * 100, unrealized_pnl: 0, realized_pnl: 0,
})
const quote = async () => ({
  contract: { conId: 123, symbol: 'ACME', secType: 'STK' as any, exchange: 'SMART', primaryExch: 'NASDAQ', currency: 'USD' },
  price: 100, min_tick: 0.01,
})

let replacementReads = 0
let replacementCancelled = 0
const replacementOrders: any[] = []
const supersededAutomatic = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => {
    replacementReads++
    return snapshot([acmePosition(123, 5)], replacementReads === 1 ? [{
      order_id: 60, contract_id: 123, symbol: 'ACME', action: 'SELL', total_quantity: 5, order_type: 'MKT',
      status: 'Submitted', filled: 0, remaining: 5, average_fill_price: null,
      order_ref: 'NOSTRA_PAPER:AUTO:CLOSE:123:old-publication',
    }] : [])
  },
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderCanceller: async (id) => {
    replacementCancelled = id
    return { order_id: id, ticker: 'ACME', action: 'SELL', quantity: 5, status: 'Cancelled', detail: 'cancelled' }
  },
  orderPlacer: async (input) => {
    replacementOrders.push(input)
    return { order_id: 61, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
await supersededAutomatic.sync('c1111111-1111-4111-8111-111111111111', { reconcilePositions: true })
assert.equal(replacementCancelled, 60, 'an obsolete automatic close is cancelled when a later call keeps the holding')
assert.equal(replacementReads, 2, 'the broker is re-read after a cancellation before replacement sizing')
assert.equal(replacementOrders[0].quantity, 94, 'the replacement uses the fresh five-share holding, not the pre-cancel order state')

let wrongSizeReads = 0
let wrongSizeCancelled = 0
const correctedSizeOrders: any[] = []
const wrongPendingSize = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => {
    wrongSizeReads++
    return snapshot([], wrongSizeReads === 1 ? [{
      order_id: 62, contract_id: 123, symbol: 'ACME', action: 'BUY', total_quantity: 49, order_type: 'LMT',
      status: 'Submitted', filled: 0, remaining: 49, average_fill_price: null,
      order_ref: 'NOSTRA_PAPER:analyses/ACME_2026-08-24',
    }] : [])
  },
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderCanceller: async (id) => {
    wrongSizeCancelled = id
    return { order_id: id, ticker: 'ACME', action: 'BUY', quantity: 49, status: 'Cancelled', detail: 'cancelled' }
  },
  orderPlacer: async (input) => {
    correctedSizeOrders.push(input)
    return { order_id: 63, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
await wrongPendingSize.sync('c2222222-2222-4222-8222-222222222222', { reconcilePositions: true })
assert.equal(wrongSizeCancelled, 62, 'same call and side are not enough when the pending order has the old 5% size')
assert.equal(correctedSizeOrders[0].quantity, 99, 'the stale 5% order is replaced by the current 10% whole-share target')

let staleRebalanceReads = 0
let staleRebalanceCancelled = 0
const freshRebalanceOrders: any[] = []
const staleRebalance = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => {
    staleRebalanceReads++
    return snapshot([acmePosition(123, staleRebalanceReads === 1 ? 50 : 55)], staleRebalanceReads === 1 ? [{
      order_id: 66, contract_id: 123, symbol: 'ACME', action: 'BUY', total_quantity: 10, order_type: 'LMT',
      status: 'Submitted', filled: 0, remaining: 10, average_fill_price: null,
      order_ref: 'NOSTRA_PAPER:AUTO:REBALANCE:analyses/ACME_2026-08-24',
    }] : [])
  },
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderCanceller: async (id) => {
    staleRebalanceCancelled = id
    return { order_id: id, ticker: 'ACME', action: 'BUY', quantity: 10, status: 'Cancelled', detail: 'cancelled' }
  },
  orderPlacer: async (input) => {
    freshRebalanceOrders.push(input)
    return { order_id: 67, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
await staleRebalance.sync('c2555555-2222-4222-8222-222222222222', { reconcilePositions: true })
assert.equal(staleRebalanceCancelled, 66, 'an automatic rebalance with obsolete remaining size is superseded')
assert.equal(freshRebalanceOrders[0].quantity, 44, 'a partial fill observed after cancellation reduces the replacement quantity')

const rotationOrders: any[] = []
const rotation = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([{
    contract_id: 700, symbol: 'OLD', local_symbol: 'OLD', security_type: 'STK', currency: 'USD', exchange: 'NYSE',
    quantity: 20, average_cost: 50, market_price: 50, market_value: 1_000, unrealized_pnl: 0, realized_pnl: 0,
  }]),
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderPlacer: async (input) => {
    rotationOrders.push(input)
    return { order_id: 64, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
const rotationResult = await rotation.sync('c3333333-3333-4333-8333-333333333333', { reconcilePositions: true })
assert.deepEqual(rotationOrders.map((row) => row.ticker), ['OLD'], 'a replacement cannot open until the old holding close is confirmed filled')
assert.match(rotationResult.skipped.find((row) => row.ticker === 'ACME')?.reason || '', /fresh broker snapshot confirms/)

const listingOrders: any[] = []
const exactListing = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([acmePosition(999, 20, 'NYSE')]),
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderPlacer: async (input) => {
    listingOrders.push(input)
    return { order_id: 65, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
await exactListing.sync('c4444444-4444-4444-8444-444444444444', { reconcilePositions: true })
assert.equal(listingOrders.length, 1)
assert.equal(listingOrders[0].contract.conId, 999, 'a same-symbol holding on another tradable line is closed, never netted against the target')
assert.equal(listingOrders[0].limitPrice, undefined, 'the exact wrong listing closes before the correct listing may open')

let authorityRevision = ''
const exactAuthority = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId, snapshotReader: async () => snapshot(),
  callsReader: async (revision) => { authorityRevision = revision || ''; return { calls: [] } },
})
await exactAuthority.sync('c5555555-5555-4555-8555-555555555555', {
  reconcilePositions: true, publishedRevision: 'd'.repeat(40),
})
assert.equal(authorityRevision, 'd'.repeat(40), 'execution projects Calls through the verified publication revision')

let invalidNavPlacements = 0
const invalidNav = snapshot()
invalidNav.values.set('NetLiquidation', { value: Number.NaN, currency: 'USD' })
const invalidNavService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId, snapshotReader: async () => invalidNav,
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderPlacer: async () => { invalidNavPlacements++; throw new Error('order should not run') },
})
await assert.rejects(
  () => invalidNavService.sync('c6666666-6666-4666-8666-666666666666', { reconcilePositions: true }),
  /usable portfolio value/,
)
assert.equal(invalidNavPlacements, 0, 'a non-finite broker NAV cannot reach order sizing')

let invalidQuotePlacements = 0
const invalidQuoteService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId, snapshotReader: async () => snapshot(),
  callsReader: async () => ({ calls: [selectedCall] }),
  quoteResolver: async () => ({ ...(await quote()), price: Number.NaN }),
  orderPlacer: async () => { invalidQuotePlacements++; throw new Error('order should not run') },
})
const invalidQuoteResult = await invalidQuoteService.sync(
  'c7777777-7777-4777-8777-777777777777', { reconcilePositions: true },
)
assert.equal(invalidQuotePlacements, 0, 'a non-finite market quote cannot reach order sizing')
assert.match(invalidQuoteResult.skipped[0]?.reason || '', /paper_quote_price_invalid/)

let invalidTickPlacements = 0
const invalidTickService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId, snapshotReader: async () => snapshot(),
  callsReader: async () => ({ calls: [selectedCall] }),
  quoteResolver: async () => ({ ...(await quote()), min_tick: Number.NaN }),
  orderPlacer: async () => { invalidTickPlacements++; throw new Error('order should not run') },
})
const invalidTickResult = await invalidTickService.sync(
  'c7888888-7777-4777-8777-777777777777', { reconcilePositions: true },
)
assert.equal(invalidTickPlacements, 0, 'a non-finite minimum tick cannot reach limit-price construction')
assert.match(invalidTickResult.skipped[0]?.reason || '', /paper_quote_min_tick_invalid/)

const independentOrders: any[] = []
const unsupportedInstrument = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([{
    contract_id: 888, symbol: 'ACME CALL', local_symbol: 'ACME  260918C00100000', security_type: 'OPT',
    currency: 'USD', exchange: 'SMART', quantity: 1, average_cost: 5, market_price: 5,
    market_value: 500, unrealized_pnl: 0, realized_pnl: 0,
  }]),
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderPlacer: async (input) => {
    independentOrders.push(input)
    return { order_id: 68, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
await unsupportedInstrument.sync('c8888888-8888-4888-8888-888888888888', { reconcilePositions: true })
assert.deepEqual(independentOrders.map((row) => row.ticker), ['ACME'],
  'an unsupported instrument stays untouched without permanently freezing an independent stock target')

let invalidPositionPlacements = 0
const invalidPositionService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([acmePosition(123, Number.NaN)]),
  callsReader: async () => ({ calls: [selectedCall] }), quoteResolver: quote,
  orderPlacer: async () => { invalidPositionPlacements++; throw new Error('order should not run') },
})
await assert.rejects(
  () => invalidPositionService.sync('c8999999-8888-4888-8888-888888888888', { reconcilePositions: true }),
  /unusable position or order identity/,
)
assert.equal(invalidPositionPlacements, 0, 'a non-finite TWS position quantity fails the broker boundary closed')

for (const [index, malformedSnapshot] of [
  { ...snapshot(), positions: {} as any },
  { ...snapshot(), openOrders: [null as any] },
].entries()) {
  const malformedBrokerService = createIbkrPaperExecutionService({
    enabled: true, allowedAccountId: accountId, snapshotReader: async () => malformedSnapshot,
    callsReader: async () => ({ calls: [] }),
  })
  await assert.rejects(
    () => malformedBrokerService.sync(`c900000${index}-8888-4888-8888-888888888888`, { reconcilePositions: true }),
    /unusable position or order identity/,
    'malformed broker collections and rows fail closed at the execution boundary',
  )
}

let ambiguousPlacements = 0
const ambiguousListingService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([acmePosition(123, 20)]),
  callsReader: async () => ({ calls: [
    selectedCall,
    { ...selectedCall, exchange: 'NYSE', run_root: 'analyses/ACME_2026-08-23' },
  ] }),
  quoteResolver: async () => { throw new Error('ambiguous target must not resolve a contract') },
  orderPlacer: async () => { ambiguousPlacements++; throw new Error('order should not run') },
})
const ambiguousResult = await ambiguousListingService.sync(
  'c9111111-8888-4888-8888-888888888888', { reconcilePositions: true },
)
assert.equal(ambiguousPlacements, 0, 'an ambiguous published listing cannot liquidate either possible holding')
assert.match(ambiguousResult.skipped[0]?.reason || '', /ambiguous listing identity/)

const reductionOrders: any[] = []
const reductionFirstService = createIbkrPaperExecutionService({
  enabled: true, allowedAccountId: accountId,
  snapshotReader: async () => snapshot([acmePosition(123, 99)]),
  callsReader: async () => ({ calls: [
    { ...selectedCall, frozen_call: { ...selectedCall.frozen_call, confidence: 60 } },
    {
      ...selectedCall, ticker: 'BETA', run_root: 'analyses/BETA_2026-08-24',
      frozen_call: { ...selectedCall.frozen_call, confidence: 80 },
    },
  ] }),
  quoteResolver: async (target) => ({
    contract: { conId: target.ticker === 'ACME' ? 123 : 321, symbol: target.ticker, secType: 'STK' as any, exchange: 'SMART', currency: 'USD' },
    price: 100, min_tick: 0.01,
  }),
  orderPlacer: async (input) => {
    reductionOrders.push(input)
    return { order_id: 69, ticker: input.ticker, action: input.action, quantity: input.quantity, status: 'Submitted', detail: 'accepted' }
  },
})
const reductionResult = await reductionFirstService.sync(
  'c9222222-8888-4888-8888-888888888888', { reconcilePositions: true },
)
assert.deepEqual(reductionOrders.map((row) => [row.ticker, row.action, row.quantity]), [['ACME', 'SELL', 50]],
  'the 10%-to-5% reduction is submitted before a new target may consume that exposure')
assert.match(reductionResult.skipped.find((row) => row.ticker === 'BETA')?.reason || '', /exposure reductions/)

console.log('\nibkr-paper-execution.test.ts: 23 passed')
