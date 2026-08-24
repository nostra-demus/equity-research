// Paper-only IBKR order controls. Every automatic or explicit command re-checks the private account allow-list,
// the DU paper-account prefix, localhost, and port 7497 before touching an order.
import fs from 'node:fs'
import path from 'node:path'
import {
  IBApi, EventName, MarketDataType, OrderAction, OrderType, SecType, TimeInForce,
  isNonFatalError, type Contract, type ContractDetails, type Order, type OrderStatus,
} from '@stoqey/ib'
import { STATE_DIR } from './config'
import { listAllCalls } from './outputs'
import { buildCallPolicyTarget, type CallPolicyTarget, type CallPolicyTargetPosition } from './paper-call-ledger'
import {
  IBKR_PAPER_HOST, IBKR_PAPER_PORT, readIbkrPaperBrokerSnapshot,
  withIbkrPaperApiLock, invalidateIbkrPaperPortfolioCache, type BrokerPosition, type BrokerSnapshot,
} from './ibkr-paper'

const DEFAULT_CLIENT_ID = 0
const DEFAULT_TIMEOUT_MS = 10_000
const ORDER_REF_PREFIX = 'NOSTRA_PAPER:'
const SIZING_PRICE_RESERVE = 1.01
const PRICE_TICK = { BID: 1, ASK: 2, LAST: 4, CLOSE: 9, MARK: 37, DELAYED_BID: 66, DELAYED_ASK: 67, DELAYED_LAST: 68, DELAYED_CLOSE: 75 } as const

export type PaperExecutionAction = 'sync' | 'cancel' | 'close'
export interface PaperSyncOptions {
  /** Automatic publication sync owns the dedicated Nostra paper account and reconciles its positions. */
  reconcilePositions?: boolean
}
export interface PaperExecutionOrderResult {
  order_id: number
  ticker: string
  action: 'BUY' | 'SELL'
  quantity: number
  status: string
  detail: string
}
export interface PaperExecutionResult {
  ok: true
  paper_only: true
  action: PaperExecutionAction
  detail: string
  orders: PaperExecutionOrderResult[]
  skipped: { ticker: string; reason: string }[]
}

interface ExecutionOptions {
  stateDir?: string
  clientId?: number
  timeoutMs?: number
  enabled?: boolean
  allowedAccountId?: string
  now?: () => Date
  snapshotReader?: () => Promise<BrokerSnapshot>
  callsReader?: () => Promise<{ calls: unknown[] }>
  quoteResolver?: (target: CallPolicyTargetPosition) => Promise<{ contract: Contract; price: number; min_tick: number }>
  orderPlacer?: (input: PlaceOrderInput) => Promise<PaperExecutionOrderResult>
  orderCanceller?: (orderId: number, accountId: string, ticker: string, action: 'BUY' | 'SELL', quantity: number) => Promise<PaperExecutionOrderResult>
}

interface PlaceOrderInput {
  accountId: string
  contract: Contract
  ticker: string
  action: 'BUY' | 'SELL'
  quantity: number
  limitPrice?: number
  minimumOrderId?: number
  orderRef: string
}

let paperCommandTail: Promise<void> = Promise.resolve()
function withPaperCommandLock<T>(run: () => Promise<T>): Promise<T> {
  const result = paperCommandTail.then(run, run)
  paperCommandTail = result.then(() => undefined, () => undefined)
  return result
}

function finite(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) && Math.abs(n) < 1e100 ? n : null
}

function normalized(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function safePaperAccount(snapshot: BrokerSnapshot, enabled: boolean, allowedAccountId: string): void {
  if (!enabled) throw Object.assign(new Error('Paper execution is disabled.'), { statusCode: 409, code: 'PAPER_EXECUTION_DISABLED' })
  if (!allowedAccountId || snapshot.accountId !== allowedAccountId) {
    throw Object.assign(new Error('The connected account does not match the private paper-account allow-list.'), { statusCode: 403, code: 'PAPER_ACCOUNT_NOT_ALLOWED' })
  }
  if (!snapshot.accountId.startsWith('DU')) {
    throw Object.assign(new Error('The connected account is not identified as an IBKR paper account.'), { statusCode: 403, code: 'LIVE_ACCOUNT_REFUSED' })
  }
}

function snapshotValue(snapshot: BrokerSnapshot, key: string): number | null {
  return snapshot.values.get(key)?.value ?? null
}

function accountCurrency(snapshot: BrokerSnapshot): string | null {
  return snapshot.values.get('NetLiquidation')?.currency ?? null
}

function stockRequest(target: CallPolicyTargetPosition): Contract {
  const currency = normalized(target.currency)
  const statedExchange = normalized(target.exchange)
  if (currency === 'USD') return {
    symbol: target.ticker, secType: SecType.STK, exchange: 'SMART', currency,
    ...(statedExchange ? { primaryExch: statedExchange } : {}),
  }
  return { symbol: target.ticker, secType: SecType.STK, exchange: statedExchange || 'SMART', currency }
}

function orderError(args: unknown[]): { error: Error; code: number; reqId: number } {
  if (args[0] instanceof Error) return { error: args[0], code: Number(args[1]) || 0, reqId: Number(args[2]) || -1 }
  return { reqId: Number(args[0]) || -1, code: Number(args[1]) || 0, error: new Error(String(args[2] || 'IBKR API error')) }
}

function guardedLimit(reference: number, minTick: number, action: 'BUY' | 'SELL'): number {
  const guarded = reference * (action === 'BUY' ? 1.005 : 0.995)
  const ticks = action === 'BUY' ? Math.ceil(guarded / minTick) : Math.floor(guarded / minTick)
  return Number((ticks * minTick).toFixed(10))
}

async function placeOrderThroughTws(input: PlaceOrderInput, options: { clientId: number; timeoutMs: number }): Promise<PaperExecutionOrderResult> {
  return await new Promise((resolve, reject) => {
    const ib = new IBApi({ host: IBKR_PAPER_HOST, port: IBKR_PAPER_PORT, clientId: options.clientId })
    let accountSeen = false
    let nextOrderId: number | null = null
    let submittedId: number | null = null
    let settled = false
    const finish = (error?: Error, status = 'Submitted') => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { ib.disconnect() } catch {}
      if (error) return reject(error)
      const orderKind = input.limitPrice ? `limit order at ${input.limitPrice}` : 'market close order'
      resolve({ order_id: submittedId!, ticker: input.ticker, action: input.action, quantity: input.quantity, status, detail: `${input.action} ${input.quantity} ${input.ticker} accepted by TWS Paper as a ${orderKind}.` })
    }
    const submit = () => {
      if (!accountSeen || nextOrderId === null || submittedId !== null) return
      submittedId = nextOrderId
      const order: Order = {
        action: input.action === 'BUY' ? OrderAction.BUY : OrderAction.SELL,
        totalQuantity: input.quantity, orderType: input.limitPrice ? OrderType.LMT : OrderType.MKT,
        ...(input.limitPrice ? { lmtPrice: input.limitPrice } : {}), tif: TimeInForce.DAY,
        account: input.accountId, orderRef: input.orderRef, transmit: true,
        outsideRth: false, overridePercentageConstraints: false,
      }
      try { ib.placeOrder(submittedId, input.contract, order) } catch { finish(new Error('paper_order_submit_failed')) }
    }
    const timer = setTimeout(() => finish(new Error('paper_order_timeout')), options.timeoutMs)
    ib.on(EventName.managedAccounts, (raw: string) => {
      const accounts = String(raw || '').split(',').map((v) => v.trim()).filter(Boolean)
      if (accounts.length !== 1 || accounts[0] !== input.accountId) return finish(new Error('paper_account_changed'))
      accountSeen = true; submit()
    })
      .once(EventName.nextValidId, (id: number) => { nextOrderId = Math.max(Number(id), input.minimumOrderId || 0); submit() })
      .on(EventName.orderStatus, (id: number, status: OrderStatus) => {
        if (id !== submittedId) return
        const value = String(status)
        if (['Cancelled', 'ApiCancelled', 'Inactive'].includes(value)) finish(new Error(`paper_order_${value.toLowerCase()}`))
        else if (['PendingSubmit', 'PreSubmitted', 'Submitted', 'Filled'].includes(value)) finish(undefined, value)
      })
      .on(EventName.openOrder, (id: number, _contract: Contract, _order: Order, state: any) => {
        if (id !== submittedId) return
        const value = String(state?.status || '')
        if (value === 'Inactive') finish(new Error('paper_order_inactive'))
        else if (['PendingSubmit', 'PreSubmitted', 'Submitted', 'Filled'].includes(value)) finish(undefined, value)
      })
      .on(EventName.error, (...args: unknown[]) => {
        const got = orderError(args)
        if (submittedId !== null && got.reqId === submittedId && !isNonFatalError(got.code, got.error)) finish(new Error(`paper_order_rejected_${got.code || 'unknown'}`))
      })
      .once(EventName.disconnected, () => { if (!settled) finish(new Error('paper_disconnected')) })
    try { ib.connect() } catch { finish(new Error('paper_connect_failed')) }
  })
}

async function cancelOrderThroughTws(orderId: number, accountId: string, ticker: string, action: 'BUY' | 'SELL', quantity: number, options: { clientId: number; timeoutMs: number }): Promise<PaperExecutionOrderResult> {
  return await new Promise((resolve, reject) => {
    const ib = new IBApi({ host: IBKR_PAPER_HOST, port: IBKR_PAPER_PORT, clientId: options.clientId })
    let accountSeen = false
    let apiReady = false
    let sent = false
    let settled = false
    const finish = (error?: Error, status = 'Cancelled') => {
      if (settled) return
      settled = true; clearTimeout(timer)
      try { ib.disconnect() } catch {}
      if (error) return reject(error)
      resolve({ order_id: orderId, ticker, action, quantity, status, detail: `${ticker} order ${orderId} was cancelled in TWS Paper.` })
    }
    const cancel = () => {
      if (!accountSeen || !apiReady || sent) return
      sent = true
      try { ib.cancelOrder(orderId) } catch { finish(new Error('paper_cancel_failed')) }
    }
    const timer = setTimeout(() => finish(new Error('paper_cancel_timeout')), options.timeoutMs)
    ib.on(EventName.managedAccounts, (raw: string) => {
      const accounts = String(raw || '').split(',').map((v) => v.trim()).filter(Boolean)
      if (accounts.length !== 1 || accounts[0] !== accountId) return finish(new Error('paper_account_changed'))
      accountSeen = true; cancel()
    })
      .once(EventName.nextValidId, () => { apiReady = true; cancel() })
      .on(EventName.orderStatus, (id: number, status: OrderStatus) => {
        if (id !== orderId) return
        const value = String(status)
        if (['Cancelled', 'ApiCancelled'].includes(value)) finish(undefined, value)
        if (value === 'Filled') finish(new Error('paper_cancel_too_late'))
      })
      .on(EventName.error, (...args: unknown[]) => {
        const got = orderError(args)
        if (got.reqId !== orderId) return
        if (got.code === 202) finish(undefined, 'Cancelled')
        else if (!isNonFatalError(got.code, got.error)) finish(new Error(`paper_cancel_rejected_${got.code || 'unknown'}`))
      })
      .once(EventName.disconnected, () => { if (!settled) finish(new Error('paper_disconnected')) })
    try { ib.connect() } catch { finish(new Error('paper_connect_failed')) }
  })
}

async function resolveContractAndPrice(target: CallPolicyTargetPosition, options: { clientId: number; timeoutMs: number }): Promise<{ contract: Contract; price: number; min_tick: number }> {
  return await new Promise((resolve, reject) => {
    const ib = new IBApi({ host: IBKR_PAPER_HOST, port: IBKR_PAPER_PORT, clientId: options.clientId })
    const contractReqId = 71001
    const marketReqId = 71002
    const details: ContractDetails[] = []
    const prices = new Map<number, number>()
    let selectedContract: Contract | null = null
    let selectedMinTick = 0.01
    let settled = false
    const finish = (error?: Error, value?: { contract: Contract; price: number; min_tick: number }) => {
      if (settled) return
      settled = true; clearTimeout(timer)
      try { ib.cancelMktData(marketReqId) } catch {}
      try { ib.disconnect() } catch {}
      if (error) return reject(error)
      resolve(value!)
    }
    const timer = setTimeout(() => finish(new Error('paper_quote_timeout')), options.timeoutMs)
    ib.once(EventName.nextValidId, () => {
      try { ib.reqContractDetails(contractReqId, stockRequest(target)) } catch { finish(new Error('paper_contract_request_failed')) }
    })
      .on(EventName.contractDetails, (reqId: number, row: ContractDetails) => { if (reqId === contractReqId) details.push(row) })
      .on(EventName.contractDetailsEnd, (reqId: number) => {
        if (reqId !== contractReqId) return
        const wantedCurrency = normalized(target.currency)
        const wantedExchange = normalized(target.exchange)
        const matches = details.filter((row) => normalized(row.contract?.currency) === wantedCurrency
          && normalized(row.contract?.symbol || row.contract?.localSymbol) === normalized(target.ticker))
        const exact = wantedExchange ? matches.filter((row) => [row.contract?.primaryExch, row.contract?.exchange].some((value) => normalized(value) === wantedExchange)) : matches
        const candidates = exact.length ? exact : matches
        if (candidates.length !== 1 || !finite(candidates[0]?.contract?.conId)) return finish(new Error('paper_contract_ambiguous'))
        selectedContract = candidates[0].contract
        const minTick = finite(candidates[0].minTick)
        selectedMinTick = minTick !== null && minTick > 0 ? minTick : 0.01
        try {
          ib.reqMarketDataType(MarketDataType.DELAYED)
          ib.reqMktData(marketReqId, selectedContract, '', true, false)
        } catch { finish(new Error('paper_quote_request_failed')) }
      })
      .on(EventName.tickPrice, (reqId: number, field: number, raw: number) => {
        const price = finite(raw)
        if (reqId === marketReqId && price !== null && price > 0) prices.set(Number(field), price)
      })
      .on(EventName.tickSnapshotEnd, (reqId: number) => {
        if (reqId !== marketReqId) return
        const bid = prices.get(PRICE_TICK.BID) ?? prices.get(PRICE_TICK.DELAYED_BID)
        const ask = prices.get(PRICE_TICK.ASK) ?? prices.get(PRICE_TICK.DELAYED_ASK)
        const price = (target.side === 'long' ? ask : bid)
          ?? prices.get(PRICE_TICK.LAST) ?? prices.get(PRICE_TICK.DELAYED_LAST) ?? prices.get(PRICE_TICK.MARK)
          ?? (bid && ask ? (bid + ask) / 2 : undefined) ?? prices.get(PRICE_TICK.CLOSE) ?? prices.get(PRICE_TICK.DELAYED_CLOSE)
        if (!selectedContract || !price) return finish(new Error('paper_quote_unavailable'))
        finish(undefined, { contract: selectedContract, price, min_tick: selectedMinTick })
      })
      .on(EventName.error, (...args: unknown[]) => {
        const got = orderError(args)
        if ([contractReqId, marketReqId].includes(got.reqId) && !isNonFatalError(got.code, got.error)) finish(new Error(`paper_quote_error_${got.code || 'unknown'}`))
      })
      .once(EventName.disconnected, () => { if (!settled) finish(new Error('paper_disconnected')) })
    try { ib.connect() } catch { finish(new Error('paper_connect_failed')) }
  })
}

function audit(stateDir: string, now: Date, action: PaperExecutionAction, result: PaperExecutionResult): void {
  const dir = path.join(stateDir, 'ibkr-paper')
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
    fs.appendFileSync(path.join(dir, 'execution.jsonl'), `${JSON.stringify({ schema_version: 'ibkr-paper-execution/v1', at: now.toISOString(), action, order_count: result.orders.length, skipped: result.skipped })}\n`, { encoding: 'utf8', mode: 0o600 })
  } catch { /* broker result remains authoritative even if local observability fails */ }
}

export function createIbkrPaperExecutionService(options: ExecutionOptions = {}) {
  const stateDir = path.resolve(options.stateDir ?? STATE_DIR)
  const clientId = Number.isInteger(options.clientId) ? Number(options.clientId) : Number(process.env.ENGINE_IBKR_PAPER_CLIENT_ID || DEFAULT_CLIENT_ID)
  const timeoutMs = Number.isFinite(options.timeoutMs) ? Number(options.timeoutMs) : Number(process.env.ENGINE_IBKR_PAPER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
  const enabled = options.enabled ?? process.env.ENGINE_IBKR_PAPER_EXECUTION === '1'
  const allowedAccountId = String(options.allowedAccountId ?? process.env.ENGINE_IBKR_PAPER_ACCOUNT_ID ?? '').trim()
  const now = options.now ?? (() => new Date())
  const snapshotReader = options.snapshotReader ?? (() => readIbkrPaperBrokerSnapshot({ clientId, timeoutMs, now }))
  const callsReader = options.callsReader ?? listAllCalls
  const quoteResolver = options.quoteResolver ?? ((target) => withIbkrPaperApiLock(() => resolveContractAndPrice(target, { clientId, timeoutMs })))
  const orderPlacer = options.orderPlacer ?? ((input) => withIbkrPaperApiLock(() => placeOrderThroughTws(input, { clientId, timeoutMs })))
  const orderCanceller = options.orderCanceller ?? ((orderId, accountId, ticker, action, quantity) => withIbkrPaperApiLock(() => cancelOrderThroughTws(orderId, accountId, ticker, action, quantity, { clientId, timeoutMs })))
  const idempotent = new Map<string, Promise<PaperExecutionResult>>()

  const once = (key: string, run: () => Promise<PaperExecutionResult>) => {
    const prior = idempotent.get(key)
    if (prior) return prior
    const pending = run()
    idempotent.set(key, pending)
    pending.catch(() => {
      // A failed command has not changed broker state and must remain retryable with the same browser
      // receipt. Successful receipts stay cached so a double-click cannot submit twice.
      if (idempotent.get(key) === pending) idempotent.delete(key)
    })
    setTimeout(() => idempotent.delete(key), 10 * 60_000).unref?.()
    return pending
  }

  const sync = async (idempotencyKey: string, command: PaperSyncOptions = {}): Promise<PaperExecutionResult> => once(`sync:${idempotencyKey}`, () => withPaperCommandLock(async () => {
    const snapshot = await snapshotReader()
    safePaperAccount(snapshot, enabled, allowedAccountId)
    const calls = (await callsReader()).calls ?? []
    const target: CallPolicyTarget = buildCallPolicyTarget(calls, now())
    if (!target.valid) throw Object.assign(new Error(target.detail), { statusCode: 409, code: 'PAPER_TARGET_BLOCKED' })
    const activePositions = snapshot.positions.filter((row) => row.quantity !== 0)
    const openOrders = snapshot.openOrders ?? []
    const pending = new Set(openOrders.map((row) => normalized(row.symbol)))
    const targetBySymbol = new Map(target.positions.map((row) => [normalized(row.ticker), row]))
    const targetSymbols = new Set(targetBySymbol.keys())
    const minimumOrderId = Math.max(0, ...(snapshot.openOrders ?? []).map((row) => row.order_id)) + 1
    const orders: PaperExecutionOrderResult[] = []
    const skipped: { ticker: string; reason: string }[] = []
    const processedTargets = new Set<string>()
    const closingSymbols = new Set<string>()
    const nav = snapshotValue(snapshot, 'NetLiquidation')
    const baseCurrency = accountCurrency(snapshot)
    if (nav === null || nav <= 0 || !baseCurrency) throw Object.assign(new Error('IBKR Paper did not provide a usable portfolio value.'), { statusCode: 409 })

    if (command.reconcilePositions) {
      // A newly published call supersedes an unfilled Nostra entry from an older call. Cancel only the
      // entry orders carrying Nostra's own orderRef; manual orders and close/rebalance orders are never
      // touched here.
      for (const open of openOrders) {
        const symbol = normalized(open.symbol)
        const orderRef = String(open.order_ref || '')
        if (!orderRef.startsWith(ORDER_REF_PREFIX)
            || orderRef.startsWith(`${ORDER_REF_PREFIX}CLOSE:`)
            || orderRef.startsWith(`${ORDER_REF_PREFIX}AUTO:`)) continue
        const wanted = targetBySymbol.get(symbol)
        const wantedAction = wanted?.side === 'short' ? 'SELL' : wanted ? 'BUY' : null
        const wantedRef = wanted ? `${ORDER_REF_PREFIX}${wanted.call_id}`.slice(0, 100) : null
        if (wantedAction === normalized(open.action) && wantedRef === orderRef) continue
        const rawAction = normalized(open.action)
        const quantity = finite(open.total_quantity)
        if (!['BUY', 'SELL'].includes(rawAction) || quantity === null || quantity <= 0) {
          skipped.push({ ticker: symbol, reason: 'An older Nostra order could not be safely cancelled because its side or quantity is missing.' })
          continue
        }
        try {
          orders.push(await orderCanceller(open.order_id, snapshot.accountId, symbol, rawAction as 'BUY' | 'SELL', quantity))
          pending.delete(symbol)
        } catch (error: any) {
          skipped.push({ ticker: symbol, reason: `The superseded Nostra order could not be cancelled: ${String(error?.message || error)}` })
        }
      }

      // Automatic mode treats this allow-listed DU account as Nostra's dedicated paper portfolio. It
      // closes holdings removed by the new call and adjusts an existing holding to the exact 5%/10%
      // target. Manual Sync retains the older, conservative "show the difference" behaviour.
      for (const held of activePositions) {
        const symbol = normalized(held.symbol)
        if (held.security_type !== 'STK') {
          skipped.push({ ticker: symbol, reason: 'Automatic reconciliation manages stock positions only and left this instrument untouched.' })
          if (targetBySymbol.has(symbol)) processedTargets.add(symbol)
          continue
        }
        const heldRows = activePositions.filter((row) => normalized(row.symbol) === symbol)
        if (heldRows.length > 1) {
          skipped.push({ ticker: symbol, reason: 'More than one broker position maps to this ticker, so automatic reconciliation left it untouched.' })
          if (targetBySymbol.has(symbol)) processedTargets.add(symbol)
          continue
        }
        if (pending.has(symbol)) {
          skipped.push({ ticker: symbol, reason: 'An open TWS/API order already affects this holding, so automatic reconciliation waited.' })
          if (targetBySymbol.has(symbol)) processedTargets.add(symbol)
          continue
        }
        const wanted = targetBySymbol.get(symbol)
        if (!wanted) {
          const action: 'BUY' | 'SELL' = held.quantity < 0 ? 'BUY' : 'SELL'
          const contract: Contract = {
            conId: held.contract_id, symbol: held.symbol, localSymbol: held.local_symbol ?? undefined,
            secType: SecType.STK, exchange: held.exchange || 'SMART', currency: held.currency ?? undefined,
          }
          try {
            orders.push(await orderPlacer({
              accountId: snapshot.accountId, contract, ticker: symbol, action, quantity: Math.abs(held.quantity), minimumOrderId,
              orderRef: `${ORDER_REF_PREFIX}AUTO:CLOSE:${held.contract_id}:${now().toISOString()}`.slice(0, 100),
            }))
            closingSymbols.add(symbol)
          } catch (error: any) {
            skipped.push({ ticker: symbol, reason: `The holding is no longer in Nostra's target but its paper close was not sent: ${String(error?.message || error)}` })
          }
          continue
        }
        processedTargets.add(symbol)
        if (normalized(wanted.currency) !== normalized(baseCurrency)) {
          skipped.push({ ticker: symbol, reason: `Sizing needs ${wanted.currency}/${baseCurrency} FX support; automatic reconciliation left this holding untouched.` })
          continue
        }
        try {
          const quote = await quoteResolver(wanted)
          const notional = nav * Math.abs(wanted.model_weight_pct) / 100
          const absoluteTarget = Math.floor(notional / (quote.price * SIZING_PRICE_RESERVE))
          if (absoluteTarget < 1) { skipped.push({ ticker: symbol, reason: 'The 5%/10% target is smaller than one whole share.' }); continue }
          const signedTarget = wanted.side === 'short' ? -absoluteTarget : absoluteTarget
          const delta = signedTarget - held.quantity
          if (Math.abs(delta) < 1e-9) {
            skipped.push({ ticker: symbol, reason: 'The paper holding already has the correct whole-share 5%/10% size.' })
            continue
          }
          const action: 'BUY' | 'SELL' = delta > 0 ? 'BUY' : 'SELL'
          const limitPrice = guardedLimit(quote.price, quote.min_tick, action)
          orders.push(await orderPlacer({
            accountId: snapshot.accountId, contract: quote.contract, ticker: symbol, action, quantity: Math.abs(delta), limitPrice, minimumOrderId,
            orderRef: `${ORDER_REF_PREFIX}AUTO:REBALANCE:${wanted.call_id}`.slice(0, 100),
          }))
        } catch (error: any) {
          skipped.push({ ticker: symbol, reason: `The automatic 5%/10% rebalance was not sent: ${String(error?.message || error)}` })
        }
      }
    }

    const unexpectedHeld = activePositions
      .filter((row) => !targetSymbols.has(normalized(row.symbol)) && !closingSymbols.has(normalized(row.symbol)))
      .map((row) => normalized(row.symbol))
    for (const row of target.positions) {
      if (processedTargets.has(normalized(row.ticker))) continue
      if (unexpectedHeld.length) {
        skipped.push({ ticker: row.ticker, reason: `Close the non-target position${unexpectedHeld.length === 1 ? '' : 's'} (${unexpectedHeld.join(', ')}) before Sync adds a new trade.` })
        continue
      }
      if (pending.has(row.ticker)) { skipped.push({ ticker: row.ticker, reason: 'An open TWS/API order already exists for this ticker. Sync will not double it.' }); continue }
      const heldRows = activePositions.filter((position) => normalized(position.symbol) === row.ticker)
      if (heldRows.length > 1) { skipped.push({ ticker: row.ticker, reason: 'More than one broker position maps to this ticker. Close or reconcile them before Sync.' }); continue }
      if (heldRows.length === 1) {
        const held = heldRows[0]
        const correctDirection = (row.side === 'long' && held.quantity > 0) || (row.side === 'short' && held.quantity < 0)
        const actualWeight = held.market_value === null ? null : (held.market_value / nav) * 100
        if (!correctDirection) skipped.push({ ticker: row.ticker, reason: `IBKR holds the opposite side. Use Close to cash, wait for the fill, then Sync the ${row.side} target.` })
        else if (actualWeight === null || Math.abs(actualWeight - row.model_weight_pct) > 0.25) skipped.push({ ticker: row.ticker, reason: `The existing position is not the ${row.model_weight_pct}% target. Close it to cash before applying the new 5%/10% size.` })
        else skipped.push({ ticker: row.ticker, reason: 'The existing position already matches this call closely enough; Sync did not double it.' })
        continue
      }
      if (normalized(row.currency) !== normalized(baseCurrency)) { skipped.push({ ticker: row.ticker, reason: `Sizing needs ${row.currency}/${baseCurrency} FX support; this order stayed blocked.` }); continue }
      try {
        const quote = await quoteResolver(row)
        const notional = nav * Math.abs(row.model_weight_pct) / 100
        // Reserve 1% inside the requested ceiling, then use a 0.5%-guarded limit order. This prevents
        // a stale/delayed snapshot from becoming an unbounded market entry.
        const quantity = Math.floor(notional / (quote.price * SIZING_PRICE_RESERVE))
        if (quantity < 1) { skipped.push({ ticker: row.ticker, reason: 'The 5%/10% target is smaller than one whole share.' }); continue }
        const action: 'BUY' | 'SELL' = row.side === 'short' ? 'SELL' : 'BUY'
        const limitPrice = guardedLimit(quote.price, quote.min_tick, action)
        if (!Number.isFinite(limitPrice) || limitPrice <= 0) throw new Error('paper_limit_price_invalid')
        orders.push(await orderPlacer({
          accountId: snapshot.accountId, contract: quote.contract, ticker: row.ticker, action, quantity, limitPrice, minimumOrderId,
          orderRef: `${ORDER_REF_PREFIX}${row.call_id}`.slice(0, 100),
        }))
      } catch (error: any) {
        skipped.push({ ticker: row.ticker, reason: `Not sent: ${String(error?.message || error)}` })
      }
    }
    if (orders.length) invalidateIbkrPaperPortfolioCache()
    const result: PaperExecutionResult = {
      ok: true, paper_only: true, action: 'sync', orders, skipped,
      detail: orders.length ? `${orders.length} paper order action${orders.length === 1 ? '' : 's'} accepted by TWS.`
        : unexpectedHeld.length && target.positions.length ? 'No order was sent while IBKR Paper contains a position outside the current Nostra target.'
          : target.positions.length ? 'No new order was needed or safe to send.' : target.detail,
    }
    audit(stateDir, now(), 'sync', result)
    return result
  }))

  const cancel = async (orderId: number, idempotencyKey: string): Promise<PaperExecutionResult> => once(`cancel:${orderId}:${idempotencyKey}`, () => withPaperCommandLock(async () => {
    const snapshot = await snapshotReader()
    safePaperAccount(snapshot, enabled, allowedAccountId)
    const order = (snapshot.openOrders ?? []).find((row) => row.order_id === orderId)
    if (!order || !order.order_ref?.startsWith(ORDER_REF_PREFIX)) throw Object.assign(new Error('Only an open order created by Nostra can be cancelled here.'), { statusCode: 404 })
    const rawAction = normalized(order.action)
    if (!['BUY', 'SELL'].includes(rawAction)) throw Object.assign(new Error('The open order has no safe side to cancel.'), { statusCode: 409 })
    const action = rawAction as 'BUY' | 'SELL'
    const quantity = finite(order.total_quantity)
    if (quantity === null || quantity <= 0) throw Object.assign(new Error('The open order has no safe quantity to cancel.'), { statusCode: 409 })
    const placed = await orderCanceller(orderId, snapshot.accountId, order.symbol, action, quantity)
    invalidateIbkrPaperPortfolioCache()
    const result: PaperExecutionResult = { ok: true, paper_only: true, action: 'cancel', orders: [placed], skipped: [], detail: placed.detail }
    audit(stateDir, now(), 'cancel', result)
    return result
  }))

  const close = async (contractId: number, idempotencyKey: string): Promise<PaperExecutionResult> => once(`close:${contractId}:${idempotencyKey}`, () => withPaperCommandLock(async () => {
    const snapshot = await snapshotReader()
    safePaperAccount(snapshot, enabled, allowedAccountId)
    const position: BrokerPosition | undefined = snapshot.positions.find((row) => row.contract_id === contractId && row.quantity !== 0)
    if (!position || position.security_type !== 'STK') throw Object.assign(new Error('That open stock position was not found in the latest paper snapshot.'), { statusCode: 404 })
    if ((snapshot.openOrders ?? []).some((row) => row.contract_id === contractId || normalized(row.symbol) === normalized(position.symbol))) {
      throw Object.assign(new Error('An open TWS/API order already affects this position. Cancel it or wait for it to fill before closing again.'), { statusCode: 409 })
    }
    const action: 'BUY' | 'SELL' = position.quantity < 0 ? 'BUY' : 'SELL'
    const quantity = Math.abs(position.quantity)
    const contract: Contract = {
      conId: position.contract_id, symbol: position.symbol, localSymbol: position.local_symbol ?? undefined,
      secType: SecType.STK, exchange: position.exchange || 'SMART', currency: position.currency ?? undefined,
    }
    const minimumOrderId = Math.max(0, ...(snapshot.openOrders ?? []).map((row) => row.order_id)) + 1
    const placed = await orderPlacer({ accountId: snapshot.accountId, contract, ticker: position.symbol, action, quantity, minimumOrderId, orderRef: `${ORDER_REF_PREFIX}CLOSE:${position.contract_id}:${now().toISOString()}`.slice(0, 100) })
    invalidateIbkrPaperPortfolioCache()
    const result: PaperExecutionResult = {
      ok: true, paper_only: true, action: 'close', orders: [placed], skipped: [],
      detail: `${action} ${quantity} ${position.symbol} was sent to close the paper position. Its value returns to cash after IBKR marks the fill.`,
    }
    audit(stateDir, now(), 'close', result)
    return result
  }))

  return { sync, cancel, close }
}

export const ibkrPaperExecution = createIbkrPaperExecutionService()
