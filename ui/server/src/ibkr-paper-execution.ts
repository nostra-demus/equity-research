// Paper-only IBKR order controls. Every automatic or explicit command re-checks the private account allow-list,
// the DU paper-account prefix, localhost, and port 7497 before touching an order.
import fs from 'node:fs'
import path from 'node:path'
import {
  IBApi, EventName, MarketDataType, OrderAction, OrderType, SecType, TimeInForce,
  isNonFatalError, type Contract, type ContractDetails, type Order, type OrderStatus,
} from '@stoqey/ib'
import { REPO_ROOT, STATE_DIR } from './config'
import { listAllCalls } from './outputs'
import { buildCallPolicyTarget, type CallPolicyTarget, type CallPolicyTargetPosition } from './paper-call-ledger'
import { publishedTreeAuthority } from './published-git'
import {
  IBKR_PAPER_HOST, IBKR_PAPER_PORT, readIbkrPaperBrokerSnapshot,
  withIbkrPaperApiLock, invalidateIbkrPaperPortfolioCache, type BrokerPosition, type BrokerSnapshot,
} from './ibkr-paper'

const DEFAULT_CLIENT_ID = 0
const DEFAULT_TIMEOUT_MS = 10_000
const ORDER_REF_PREFIX = 'NOSTRA_PAPER:'
const SIZING_PRICE_RESERVE = 1.01
const PUBLISHED_REVISION_RE = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/
const PRICE_TICK = { BID: 1, ASK: 2, LAST: 4, CLOSE: 9, MARK: 37, DELAYED_BID: 66, DELAYED_ASK: 67, DELAYED_LAST: 68, DELAYED_CLOSE: 75 } as const

export type PaperExecutionAction = 'sync' | 'cancel' | 'close'
export interface PaperSyncOptions {
  /** Full reconciliation owns the dedicated Nostra paper account and may close or resize positions. */
  reconcilePositions?: boolean
  /** Exact verified publication commit. Automatic sync must never project through a moving cached ref. */
  publishedRevision?: string
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
  callsReader?: (publishedRevision?: string) => Promise<{ calls: unknown[] }>
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

type BrokerOpenOrder = NonNullable<BrokerSnapshot['openOrders']>[number]

interface ResolvedTargetPlan {
  target: CallPolicyTargetPosition
  quote: { contract: Contract; price: number; min_tick: number }
  signedQuantity: number
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

function safeErrorMessage(error: unknown): string {
  const raw = String(error instanceof Error ? error.message : error)
  const containsAbsolutePath = /(^|[\s("'`])\/(?=[^/\s])/u.test(raw)
    || /(^|[\s("'`])[A-Za-z]:\\(?=[^\\\s])/u.test(raw)
  return containsAbsolutePath ? '[PATH]' : raw
}

/** Map only known published-market labels to IBKR primary-exchange identifiers. */
function brokerExchangeId(value: unknown): string {
  const raw = normalized(value)
  if (!raw) return ''
  const head = raw.split(/[(:]/, 1)[0].trim()
  if (/^NASDAQ(?:GS|GM|CM)?$/.test(head)) return 'NASDAQ'
  if (['XTRA', 'XETRA'].includes(head)) return 'IBIS'
  if (['NYSE AMERICAN', 'NYSEAMERICAN'].includes(head)) return 'AMEX'
  if (['OSLO BØRS', 'OSLO BORS', 'OB'].includes(head)) return 'OSE'
  return head
}

function orderQuantityRemaining(order: BrokerOpenOrder): number | null {
  const remaining = finite(order.remaining)
  if (remaining !== null && remaining > 0) return remaining
  const total = finite(order.total_quantity)
  const filled = finite(order.filled) ?? 0
  const derived = total === null ? null : total - filled
  return derived !== null && derived > 0 ? derived : null
}

function contractIdOf(contract: Contract | null | undefined): number | null {
  const value = contract?.conId
  return typeof value === 'number' && Number.isFinite(value) && Number.isSafeInteger(value) && value > 0
    ? value
    : null
}

function positionMatchesPlan(position: BrokerPosition, plan: ResolvedTargetPlan): boolean {
  const contractId = contractIdOf(plan.quote.contract)
  return contractId !== null
    && position.security_type === 'STK'
    && position.contract_id === contractId
    && normalized(position.currency) === normalized(plan.target.currency)
}

function isRiskReducingTarget(currentQuantity: number, targetQuantity: number): boolean {
  return currentQuantity !== 0
    && Math.sign(currentQuantity) === Math.sign(targetQuantity)
    && Math.abs(targetQuantity) < Math.abs(currentQuantity)
}

function currentTargetOrderRef(orderRef: string, target: CallPolicyTargetPosition): boolean {
  return orderRef === `${ORDER_REF_PREFIX}${target.call_id}`.slice(0, 100)
    || orderRef === `${ORDER_REF_PREFIX}AUTO:REBALANCE:${target.call_id}`.slice(0, 100)
}

interface ExpectedPendingIntent {
  key: string
  action: 'BUY' | 'SELL'
  quantity: number
}

function expectedAutomaticCloseIntent(
  order: BrokerOpenOrder,
  positions: BrokerPosition[],
  targetExists: boolean,
  targetPlan: ResolvedTargetPlan | undefined,
): ExpectedPendingIntent | null {
  const orderRef = String(order.order_ref || '')
  const held = positions.find((row) => row.contract_id === order.contract_id
    && normalized(row.symbol) === normalized(order.symbol) && row.quantity !== 0)
  if (!held || !orderRef.startsWith(`${ORDER_REF_PREFIX}AUTO:CLOSE:${held.contract_id}:`)) return null
  if (targetExists && !targetPlan) return null
  if (targetPlan && positionMatchesPlan(held, targetPlan)
      && Math.sign(held.quantity) === Math.sign(targetPlan.signedQuantity)) return null
  const action: 'BUY' | 'SELL' = held.quantity < 0 ? 'BUY' : 'SELL'
  if (normalized(order.action) !== action) return null
  return { key: `close:${held.contract_id}:${action}`, action, quantity: Math.abs(held.quantity) }
}

function expectedTargetIntent(
  order: BrokerOpenOrder,
  positions: BrokerPosition[],
  plan: ResolvedTargetPlan,
): ExpectedPendingIntent | null {
  const contractId = contractIdOf(plan.quote.contract)
  if (contractId === null || order.contract_id !== contractId
      || !currentTargetOrderRef(String(order.order_ref || ''), plan.target)) return null
  const held = positions.filter((row) => positionMatchesPlan(row, plan))
  if (held.length > 1) return null
  const delta = plan.signedQuantity - (held[0]?.quantity ?? 0)
  if (Math.abs(delta) < 1e-9) return null
  const action: 'BUY' | 'SELL' = delta > 0 ? 'BUY' : 'SELL'
  if (normalized(order.action) !== action) return null
  return { key: `target:${contractId}:${plan.target.call_id}:${action}`, action, quantity: Math.abs(delta) }
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

function safeBrokerOrderState(snapshot: BrokerSnapshot): void {
  const positions = Array.isArray(snapshot.positions) ? snapshot.positions : null
  const openOrders = snapshot.openOrders === undefined
    ? []
    : Array.isArray(snapshot.openOrders) ? snapshot.openOrders : null
  const invalidPosition = positions === null || positions.some((row) => !row
    || !Number.isFinite(row.quantity)
    || !Number.isSafeInteger(row.contract_id) || row.contract_id <= 0)
  const invalidOrder = openOrders === null || openOrders.some((row) => !row
    || !Number.isSafeInteger(row.order_id) || row.order_id < 0
    || !Number.isSafeInteger(row.contract_id) || row.contract_id <= 0)
  if (invalidPosition || invalidOrder) {
    throw Object.assign(new Error('IBKR Paper returned an unusable position or order identity.'), {
      statusCode: 409, code: 'PAPER_BROKER_STATE_INVALID',
    })
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
  const statedExchange = brokerExchangeId(target.exchange)
  if (currency === 'USD') return {
    symbol: target.ticker, secType: SecType.STK, exchange: 'SMART', currency,
    ...(statedExchange ? { primaryExch: statedExchange } : {}),
  }
  return { symbol: target.ticker, secType: SecType.STK, exchange: statedExchange || 'SMART', currency }
}

export function selectExactPaperContractDetail(
  details: ContractDetails[],
  target: Pick<CallPolicyTargetPosition, 'ticker' | 'currency' | 'exchange'>,
): ContractDetails | null {
  const wantedCurrency = normalized(target.currency)
  const wantedExchange = brokerExchangeId(target.exchange)
  const matches = details.filter((row) => normalized(row.contract?.currency) === wantedCurrency
    && normalized(row.contract?.symbol || row.contract?.localSymbol) === normalized(target.ticker))
  const candidates = wantedExchange
    ? matches.filter((row) => [row.contract?.primaryExch, row.contract?.exchange]
      .some((value) => brokerExchangeId(value) === wantedExchange))
    : matches
  return candidates.length === 1 && finite(candidates[0]?.contract?.conId) !== null ? candidates[0] : null
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
        const selected = selectExactPaperContractDetail(details, target)
        if (!selected) return finish(new Error('paper_contract_ambiguous'))
        selectedContract = selected.contract
        const minTick = finite(selected.minTick)
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
  const callsReader = options.callsReader ?? (async (publishedRevision?: string) => {
    if (!publishedRevision) return listAllCalls()
    if (!PUBLISHED_REVISION_RE.test(publishedRevision)) throw new Error('paper_published_revision_invalid')
    return listAllCalls(await publishedTreeAuthority('analyses', REPO_ROOT, publishedRevision))
  })
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
    if (command.publishedRevision && !PUBLISHED_REVISION_RE.test(command.publishedRevision)) {
      throw Object.assign(new Error('The verified publication revision is invalid.'), { statusCode: 409, code: 'PAPER_TARGET_BLOCKED' })
    }
    let snapshot = await snapshotReader()
    safePaperAccount(snapshot, enabled, allowedAccountId)
    safeBrokerOrderState(snapshot)
    const calls = (await callsReader(command.publishedRevision)).calls ?? []
    const target: CallPolicyTarget = buildCallPolicyTarget(calls, now())
    if (!target.valid) throw Object.assign(new Error(target.detail), { statusCode: 409, code: 'PAPER_TARGET_BLOCKED' })
    const targetBySymbol = new Map(target.positions.map((row) => [normalized(row.ticker), row]))
    const blockedListingSymbols = new Set(target.blocked_calls
      .filter((row) => row.reason === 'ambiguous_listing')
      .map((row) => normalized(row.ticker)))
    const protectedTargetSymbols = new Set([...targetBySymbol.keys(), ...blockedListingSymbols])
    const orders: PaperExecutionOrderResult[] = []
    const skipped: { ticker: string; reason: string }[] = []

    const resolvePlans = async (broker: BrokerSnapshot): Promise<{
      plans: Map<string, ResolvedTargetPlan>
      errors: Map<string, string>
    }> => {
      const nav = snapshotValue(broker, 'NetLiquidation')
      const baseCurrency = accountCurrency(broker)
      if (nav === null || !Number.isFinite(nav) || nav <= 0 || !baseCurrency) {
        throw Object.assign(new Error('IBKR Paper did not provide a usable portfolio value.'), { statusCode: 409 })
      }
      const plans = new Map<string, ResolvedTargetPlan>()
      const errors = new Map<string, string>()
      for (const row of target.positions) {
        const symbol = normalized(row.ticker)
        if (normalized(row.currency) !== normalized(baseCurrency)) {
          errors.set(symbol, `Sizing needs ${row.currency}/${baseCurrency} FX support; this order stayed blocked.`)
          continue
        }
        try {
          const quote = await quoteResolver(row)
          if (!quote || contractIdOf(quote.contract) === null) throw new Error('paper_contract_has_no_exact_id')
          if (!Number.isFinite(quote.price) || quote.price <= 0) throw new Error('paper_quote_price_invalid')
          if (!Number.isFinite(quote.min_tick) || quote.min_tick <= 0) throw new Error('paper_quote_min_tick_invalid')
          if (!Number.isFinite(row.model_weight_pct)) throw new Error('paper_model_weight_invalid')
          const notional = nav * Math.abs(row.model_weight_pct) / 100
          const absoluteTarget = Math.floor(notional / (quote.price * SIZING_PRICE_RESERVE))
          if (absoluteTarget < 1) {
            errors.set(symbol, 'The 5%/10% target is smaller than one whole share.')
            continue
          }
          plans.set(symbol, { target: row, quote, signedQuantity: row.side === 'short' ? -absoluteTarget : absoluteTarget })
        } catch (error: unknown) {
          errors.set(symbol, `The exact paper contract or quote could not be resolved: ${safeErrorMessage(error)}`)
        }
      }
      return { plans, errors }
    }

    let resolved = await resolvePlans(snapshot)
    if (command.reconcilePositions) {
      // Every Nostra entry or automatic close/rebalance is re-derived from the newest target, exact
      // contract, live holding and remaining quantity. Explicit operator Close orders are left alone.
      // If any cancellation is attempted, a fresh broker snapshot is mandatory before another order.
      let cancellationAttempted = false
      const active = snapshot.positions.filter((row) => row.quantity !== 0)
      const managedOrders = (snapshot.openOrders ?? []).filter((open) => {
        const orderRef = String(open.order_ref || '')
        return orderRef.startsWith(ORDER_REF_PREFIX) && !orderRef.startsWith(`${ORDER_REF_PREFIX}CLOSE:`)
      })
      const intentGroups = new Map<string, { expected: ExpectedPendingIntent; orders: BrokerOpenOrder[] }>()
      for (const open of managedOrders) {
        const symbol = normalized(open.symbol)
        const orderRef = String(open.order_ref || '')
        const plan = resolved.plans.get(symbol)
        const expected = orderRef.startsWith(`${ORDER_REF_PREFIX}AUTO:CLOSE:`)
          ? expectedAutomaticCloseIntent(open, active, protectedTargetSymbols.has(symbol), plan)
          : plan ? expectedTargetIntent(open, active, plan) : null
        if (!expected) continue
        const group = intentGroups.get(expected.key)
        if (group) group.orders.push(open)
        else intentGroups.set(expected.key, { expected, orders: [open] })
      }
      const currentOrderIds = new Set<number>()
      for (const { expected, orders: candidates } of intentGroups.values()) {
        const remaining = candidates.map(orderQuantityRemaining)
        const aggregateRemaining = remaining.every((quantity) => quantity !== null)
          ? remaining.reduce<number>((sum, quantity) => sum + (quantity ?? 0), 0)
          : null
        // Ambiguous retries can leave two otherwise identical orders open. Never retain more than one:
        // duplicate orders are all cancelled and the exact remaining delta is rebuilt from a fresh snapshot.
        if (candidates.length === 1 && aggregateRemaining === expected.quantity) {
          currentOrderIds.add(candidates[0].order_id)
        }
      }
      for (const open of managedOrders) {
        if (currentOrderIds.has(open.order_id)) continue
        const symbol = normalized(open.symbol)
        const rawAction = normalized(open.action)
        const quantity = orderQuantityRemaining(open)
        if (!['BUY', 'SELL'].includes(rawAction) || quantity === null) {
          skipped.push({ ticker: symbol, reason: 'A superseded Nostra order could not be safely cancelled because its side or remaining quantity is missing.' })
          continue
        }
        cancellationAttempted = true
        try {
          orders.push(await orderCanceller(open.order_id, snapshot.accountId, symbol, rawAction as 'BUY' | 'SELL', quantity))
        } catch (error: unknown) {
          skipped.push({ ticker: symbol, reason: `The superseded Nostra order could not be cancelled: ${safeErrorMessage(error)}` })
        }
      }
      if (cancellationAttempted) {
        snapshot = await snapshotReader()
        safePaperAccount(snapshot, enabled, allowedAccountId)
        safeBrokerOrderState(snapshot)
        resolved = await resolvePlans(snapshot)
      }
    }

    const activePositions = snapshot.positions.filter((row) => row.quantity !== 0)
    const openOrders = snapshot.openOrders ?? []
    const pending = new Set(openOrders.map((row) => normalized(row.symbol)))
    const minimumOrderId = Math.max(0, ...openOrders.map((row) => row.order_id)) + 1
    const exactBySymbol = new Map<string, BrokerPosition[]>()
    const positionsToClose: BrokerPosition[] = []
    const protectedBlockers: string[] = []

    for (const [symbol, reason] of resolved.errors) skipped.push({ ticker: symbol, reason })
    if (command.reconcilePositions) {
      for (const held of activePositions) {
        const symbol = normalized(held.symbol)
        if (held.security_type !== 'STK') {
          protectedBlockers.push(symbol)
          skipped.push({ ticker: symbol, reason: 'Automatic reconciliation manages stock positions only and left this instrument untouched.' })
          continue
        }
        const plan = resolved.plans.get(symbol)
        if (!plan && protectedTargetSymbols.has(symbol)) {
          // A quote/FX failure or ambiguous listing is not authority to liquidate a holding that may
          // be the intended line.
          protectedBlockers.push(symbol)
          if (blockedListingSymbols.has(symbol)) {
            skipped.push({ ticker: symbol, reason: 'The published call has an ambiguous listing identity, so this holding was left untouched.' })
          }
          continue
        }
        if (plan && positionMatchesPlan(held, plan)) {
          if (Math.sign(held.quantity) !== Math.sign(plan.signedQuantity)) positionsToClose.push(held)
          else exactBySymbol.set(symbol, [...(exactBySymbol.get(symbol) ?? []), held])
        } else {
          // Same ticker on another contract is a different tradable line. Close it first; never net its
          // shares against the target contract.
          positionsToClose.push(held)
        }
      }

      for (const held of positionsToClose) {
        const symbol = normalized(held.symbol)
        if (pending.has(symbol)) {
          skipped.push({ ticker: symbol, reason: 'A paper order is already closing or changing this holding; reconciliation is waiting for its fill.' })
          continue
        }
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
          pending.add(symbol)
        } catch (error: unknown) {
          skipped.push({ ticker: symbol, reason: `The paper close was not sent: ${safeErrorMessage(error)}` })
        }
      }
    } else {
      // The conservative entry-only path remains available to callers which do not explicitly own the
      // dedicated account. The UI/manual retry and publication auto-sync both use full reconciliation.
      for (const held of activePositions) {
        const plan = resolved.plans.get(normalized(held.symbol))
        if (plan && positionMatchesPlan(held, plan)) {
          const symbol = normalized(held.symbol)
          exactBySymbol.set(symbol, [...(exactBySymbol.get(symbol) ?? []), held])
        } else protectedBlockers.push(normalized(held.symbol))
      }
    }

    // Full reconciliation may leave unsupported instruments or one unresolved target untouched, but
    // those blockers must not freeze independent stock targets forever. The legacy entry-only seam
    // remains conservative when it encounters a holding it does not own.
    const closePhaseActive = positionsToClose.length > 0 || (!command.reconcilePositions && protectedBlockers.length > 0)
    const riskReducingSymbols = new Set<string>()
    for (const row of target.positions) {
      const symbol = normalized(row.ticker)
      const plan = resolved.plans.get(symbol)
      const heldRows = exactBySymbol.get(symbol) ?? []
      if (plan && heldRows.length === 1 && isRiskReducingTarget(heldRows[0].quantity, plan.signedQuantity)) {
        riskReducingSymbols.add(symbol)
      }
    }
    const riskReductionPhaseActive = command.reconcilePositions && riskReducingSymbols.size > 0
    for (const row of target.positions) {
      const symbol = normalized(row.ticker)
      const plan = resolved.plans.get(symbol)
      if (!plan) continue
      const heldRows = exactBySymbol.get(symbol) ?? []
      if (heldRows.length > 1) {
        skipped.push({ ticker: symbol, reason: 'More than one broker position maps to the exact target contract, so reconciliation left it untouched.' })
        continue
      }
      const currentQuantity = heldRows[0]?.quantity ?? 0
      const delta = plan.signedQuantity - currentQuantity
      if (Math.abs(delta) < 1e-9) continue
      if (closePhaseActive) {
        skipped.push({
          ticker: symbol,
          reason: command.reconcilePositions
            ? 'Reconciliation will add or resize this target only after a fresh broker snapshot confirms all prior holdings are closed.'
            : 'Close the non-target paper positions before Sync adds a new trade.',
        })
        continue
      }
      if (riskReductionPhaseActive && !riskReducingSymbols.has(symbol)) {
        skipped.push({ ticker: symbol, reason: 'Reconciliation will add or enlarge this target only after a fresh broker snapshot confirms all required exposure reductions.' })
        continue
      }
      if (pending.has(symbol)) {
        skipped.push({ ticker: symbol, reason: 'A current TWS/API order already affects this exact target; reconciliation is waiting for its fill.' })
        continue
      }
      try {
        const action: 'BUY' | 'SELL' = delta > 0 ? 'BUY' : 'SELL'
        const limitPrice = guardedLimit(plan.quote.price, plan.quote.min_tick, action)
        if (!Number.isFinite(limitPrice) || limitPrice <= 0) throw new Error('paper_limit_price_invalid')
        orders.push(await orderPlacer({
          accountId: snapshot.accountId, contract: plan.quote.contract, ticker: symbol, action,
          quantity: Math.abs(delta), limitPrice, minimumOrderId,
          orderRef: currentQuantity === 0
            ? `${ORDER_REF_PREFIX}${row.call_id}`.slice(0, 100)
            : `${ORDER_REF_PREFIX}AUTO:REBALANCE:${row.call_id}`.slice(0, 100),
        }))
        pending.add(symbol)
      } catch (error: unknown) {
        skipped.push({ ticker: symbol, reason: `The 5%/10% paper order was not sent: ${safeErrorMessage(error)}` })
      }
    }

    if (orders.length) invalidateIbkrPaperPortfolioCache()
    const result: PaperExecutionResult = {
      ok: true, paper_only: true, action: 'sync', orders, skipped,
      detail: orders.length && skipped.length
        ? `${orders.length} paper order action${orders.length === 1 ? '' : 's'} accepted; ${skipped.length} item${skipped.length === 1 ? '' : 's'} still waiting or blocked.`
        : orders.length ? `${orders.length} paper order action${orders.length === 1 ? '' : 's'} accepted by TWS.`
          : skipped.length ? 'No paper order was sent because reconciliation is waiting or blocked.'
            : target.positions.length ? 'IBKR Paper already matches the exact 5%/10% Nostra target.' : target.detail,
    }
    audit(stateDir, now(), 'sync', result)
    return result
  }))

  const cancel = async (orderId: number, idempotencyKey: string): Promise<PaperExecutionResult> => once(`cancel:${orderId}:${idempotencyKey}`, () => withPaperCommandLock(async () => {
    const snapshot = await snapshotReader()
    safePaperAccount(snapshot, enabled, allowedAccountId)
    safeBrokerOrderState(snapshot)
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
    safeBrokerOrderState(snapshot)
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
