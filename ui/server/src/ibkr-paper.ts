// Read-only IBKR Paper portfolio projection for the Calls dashboard.
//
// This module deliberately has NO order-submission function. The first release proves that the engine
// can connect to the expected paper TWS port, read one account, and reconcile it with the latest
// whole-book sizing artifact before any execution authority is introduced. Keeping the broker read on a
// separate endpoint means a closed/restarting TWS can never take down the immutable Calls ledger.
import fs from 'node:fs'
import path from 'node:path'
import { IBApi, EventName, isNonFatalError, type Contract } from '@stoqey/ib'
import { REPO_ROOT, STATE_DIR } from './config'

export const IBKR_PAPER_HOST = '127.0.0.1' as const
export const IBKR_PAPER_PORT = 7497 as const
const DEFAULT_CLIENT_ID = 192
const DEFAULT_TIMEOUT_MS = 6_000
const DEFAULT_CACHE_MS = 10_000
const TARGET_WEIGHT_TOLERANCE_PCT = 0.25

export type IbkrPaperStatus = 'connected' | 'disconnected' | 'disabled' | 'error'

export interface IbkrPaperPosition {
  symbol: string
  local_symbol: string | null
  security_type: string | null
  currency: string | null
  exchange: string | null
  quantity: number
  average_cost: number | null
  market_price: number | null
  market_value: number | null
  unrealized_pnl: number | null
  realized_pnl: number | null
  portfolio_weight_pct: number | null
}

export interface IbkrPaperAccount {
  currency: string | null
  net_liquidation: number | null
  total_cash: number | null
  gross_position_value: number | null
  available_funds: number | null
  buying_power: number | null
  unrealized_pnl: number | null
  realized_pnl: number | null
  positions: IbkrPaperPosition[]
}

export interface PaperTargetPosition {
  ticker: string
  decision: string | null
  model_weight_pct: number
}

export interface PaperPortfolioTarget {
  valid: boolean
  source_path: string | null
  generated_at: string | null
  gross_pct: number | null
  cash_pct: number | null
  positions: PaperTargetPosition[]
  detail: string
}

export type PaperPortfolioDifferenceKind =
  | 'missing_position'
  | 'unexpected_position'
  | 'weight_mismatch'

export interface PaperPortfolioDifference {
  kind: PaperPortfolioDifferenceKind
  ticker: string
  target_weight_pct: number | null
  actual_weight_pct: number | null
  detail: string
}

export interface IbkrPaperPortfolioRead {
  schema_version: 'ibkr-paper-portfolio/v1'
  broker: 'IBKR'
  mode: 'paper'
  status: IbkrPaperStatus
  read_only: true
  as_of: string
  connection: {
    host: 'localhost'
    port: 7497
    detail: string
  }
  account: IbkrPaperAccount | null
  target: PaperPortfolioTarget
  reconciliation: {
    status: 'aligned' | 'differences' | 'unavailable' | 'blocked'
    differences: PaperPortfolioDifference[]
    detail: string
  }
  execution: {
    status: 'locked'
    detail: string
  }
}

interface BrokerPosition extends Omit<IbkrPaperPosition, 'portfolio_weight_pct'> {}
interface BrokerSnapshot {
  accountId: string
  asOf: string
  values: Map<string, { value: number; currency: string | null }>
  positions: BrokerPosition[]
}

interface PaperPortfolioServiceOptions {
  repoRoot?: string
  stateDir?: string
  enabled?: boolean
  clientId?: number
  timeoutMs?: number
  cacheMs?: number
  now?: () => Date
  brokerReader?: () => Promise<BrokerSnapshot>
}

function finiteNumber(value: unknown): number | null {
  const n = Number(value)
  // IB's protocol uses enormous MAX_VALUE sentinels for absent optional numeric fields.
  return Number.isFinite(n) && Math.abs(n) < 1e100 ? n : null
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizedSymbol(value: unknown): string {
  return String(value ?? '').trim().toUpperCase()
}

function sizingRank(name: string): [string, number] | null {
  const match = /^(\d{4}-\d{2}-\d{2})_sizing(?:_v(\d+))?\.json$/.exec(name)
  return match ? [match[1], Number(match[2] ?? 1)] : null
}

function newerSizingName(a: string, b: string): number {
  const ar = sizingRank(a)!
  const br = sizingRank(b)!
  if (ar[0] !== br[0]) return ar[0] < br[0] ? 1 : -1
  if (ar[1] !== br[1]) return br[1] - ar[1]
  return a < b ? 1 : a > b ? -1 : 0
}

/**
 * Read the newest whole-book sizing instruction. Unlike the watchlist decoration reader, a damaged
 * newest file does not silently fall back to an older book: that would turn stale research into a trade
 * instruction. A scoped one-name sizing run is intentionally skipped because it is not the full book.
 */
export function readPaperPortfolioTarget(repoRoot: string = REPO_ROOT): PaperPortfolioTarget {
  const dir = path.join(repoRoot, 'analyses', 'portfolio')
  let names: string[]
  try {
    names = fs.readdirSync(dir).filter((name) => sizingRank(name)).sort(newerSizingName)
  } catch {
    return { valid: false, source_path: null, generated_at: null, gross_pct: null, cash_pct: null, positions: [], detail: 'No whole-book sizing file is available.' }
  }
  if (!names.length) {
    return { valid: false, source_path: null, generated_at: null, gross_pct: null, cash_pct: null, positions: [], detail: 'No whole-book sizing file is available.' }
  }

  for (const name of names) {
    const sourcePath = `analyses/portfolio/${name}`
    let raw: any
    try {
      raw = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
    } catch {
      // The newest candidate might have been a whole-book write interrupted mid-publication. Do not
      // reach past it for something older and silently call that current execution authority.
      return { valid: false, source_path: sourcePath, generated_at: null, gross_pct: null, cash_pct: null, positions: [], detail: 'The newest sizing file is unreadable. Execution stays locked.' }
    }
    if (String(raw?.scope ?? '').trim() !== 'all') continue
    if (!Array.isArray(raw?.positions) || !raw?.book || typeof raw.book !== 'object') {
      return { valid: false, source_path: sourcePath, generated_at: nullableText(raw?.generated_at), gross_pct: null, cash_pct: null, positions: [], detail: 'The newest whole-book sizing file is incomplete. Execution stays locked.' }
    }

    const positions: PaperTargetPosition[] = []
    const seen = new Set<string>()
    for (const row of raw.positions) {
      const ticker = normalizedSymbol(row?.ticker)
      const weight = finiteNumber(row?.model_weight_pct)
      if (!ticker || weight === null || weight === 0 || Math.abs(weight) > 100 || seen.has(ticker)) {
        return { valid: false, source_path: sourcePath, generated_at: nullableText(raw?.generated_at), gross_pct: null, cash_pct: null, positions: [], detail: 'A target position is invalid or duplicated. Execution stays locked.' }
      }
      seen.add(ticker)
      positions.push({ ticker, decision: nullableText(row?.decision), model_weight_pct: weight })
    }

    const gross = finiteNumber(raw.book.gross_pct)
    const cash = finiteNumber(raw.book.cash_pct)
    const calculatedGross = positions.reduce((sum, row) => sum + Math.abs(row.model_weight_pct), 0)
    if (gross === null || cash === null || gross < 0 || gross > 100 || cash < 0 || cash > 100
      || Math.abs(calculatedGross - gross) > TARGET_WEIGHT_TOLERANCE_PCT
      || Math.abs((gross + cash) - 100) > TARGET_WEIGHT_TOLERANCE_PCT) {
      return { valid: false, source_path: sourcePath, generated_at: nullableText(raw?.generated_at), gross_pct: gross, cash_pct: cash, positions: [], detail: 'The target weights do not reconcile with the book totals. Execution stays locked.' }
    }

    return {
      valid: true,
      source_path: sourcePath,
      generated_at: nullableText(raw?.generated_at),
      gross_pct: gross,
      cash_pct: cash,
      positions,
      detail: positions.length
        ? `${positions.length} sized paper position${positions.length === 1 ? '' : 's'} in the latest approved whole-book run.`
        : 'No call clears the sizing bar. Nostra’s approved paper target is 100% cash.',
    }
  }

  return { valid: false, source_path: null, generated_at: null, gross_pct: null, cash_pct: null, positions: [], detail: 'No whole-book sizing file is available.' }
}

function valueOf(snapshot: BrokerSnapshot, key: string): number | null {
  return snapshot.values.get(key)?.value ?? null
}

function accountFromSnapshot(snapshot: BrokerSnapshot): IbkrPaperAccount {
  const netLiquidation = valueOf(snapshot, 'NetLiquidation')
  const currency = snapshot.values.get('NetLiquidation')?.currency ?? null
  const positions = snapshot.positions
    .filter((row) => row.quantity !== 0)
    .map((row) => ({
      ...row,
      portfolio_weight_pct: netLiquidation && row.market_value !== null
        ? (row.market_value / netLiquidation) * 100
        : null,
    }))
    .sort((a, b) => Math.abs(b.market_value ?? 0) - Math.abs(a.market_value ?? 0) || a.symbol.localeCompare(b.symbol))
  return {
    currency,
    net_liquidation: netLiquidation,
    total_cash: valueOf(snapshot, 'TotalCashValue'),
    gross_position_value: valueOf(snapshot, 'GrossPositionValue'),
    available_funds: valueOf(snapshot, 'AvailableFunds'),
    buying_power: valueOf(snapshot, 'BuyingPower'),
    unrealized_pnl: valueOf(snapshot, 'UnrealizedPnL'),
    realized_pnl: valueOf(snapshot, 'RealizedPnL'),
    positions,
  }
}

export function reconcilePaperPortfolio(target: PaperPortfolioTarget, account: IbkrPaperAccount | null): IbkrPaperPortfolioRead['reconciliation'] {
  if (!target.valid) return { status: 'blocked', differences: [], detail: target.detail }
  if (!account) return { status: 'unavailable', differences: [], detail: 'Connect TWS Paper to compare actual holdings with Nostra’s approved target.' }

  const targets = new Map(target.positions.map((row) => [normalizedSymbol(row.ticker), row]))
  const actual = new Map(account.positions.map((row) => [normalizedSymbol(row.symbol), row]))
  const differences: PaperPortfolioDifference[] = []

  for (const [ticker, wanted] of targets) {
    const held = actual.get(ticker)
    if (!held) {
      differences.push({ kind: 'missing_position', ticker, target_weight_pct: wanted.model_weight_pct, actual_weight_pct: 0, detail: `${ticker} is sized at ${wanted.model_weight_pct}% by Nostra but is not in IBKR Paper.` })
      continue
    }
    const actualWeight = held.portfolio_weight_pct
    if (actualWeight === null || Math.abs(actualWeight - wanted.model_weight_pct) > TARGET_WEIGHT_TOLERANCE_PCT) {
      differences.push({ kind: 'weight_mismatch', ticker, target_weight_pct: wanted.model_weight_pct, actual_weight_pct: actualWeight, detail: actualWeight === null
        ? `${ticker} is present, but its portfolio weight cannot be checked yet.`
        : `${ticker} is ${actualWeight.toFixed(2)}% in IBKR Paper versus Nostra’s ${wanted.model_weight_pct}% target.` })
    }
  }
  for (const [ticker, held] of actual) {
    if (targets.has(ticker)) continue
    differences.push({ kind: 'unexpected_position', ticker, target_weight_pct: 0, actual_weight_pct: held.portfolio_weight_pct, detail: `${ticker} is in IBKR Paper but is not in Nostra’s latest sized book.` })
  }

  return differences.length
    ? { status: 'differences', differences, detail: `${differences.length} difference${differences.length === 1 ? '' : 's'} between IBKR Paper and Nostra’s latest sized book.` }
    : { status: 'aligned', differences: [], detail: target.positions.length ? 'IBKR Paper matches Nostra’s latest sized book.' : 'IBKR Paper is empty and Nostra’s approved target is 100% cash.' }
}

export async function readIbkrPaperBrokerSnapshot(options: { clientId?: number; timeoutMs?: number; now?: () => Date } = {}): Promise<BrokerSnapshot> {
  const clientId = Number.isInteger(options.clientId) && Number(options.clientId) > 0 ? Number(options.clientId) : DEFAULT_CLIENT_ID
  const timeoutMs = Number.isFinite(options.timeoutMs) ? Math.min(15_000, Math.max(1_000, Number(options.timeoutMs))) : DEFAULT_TIMEOUT_MS
  const now = options.now ?? (() => new Date())

  return await new Promise<BrokerSnapshot>((resolve, reject) => {
    const ib = new IBApi({ host: IBKR_PAPER_HOST, port: IBKR_PAPER_PORT, clientId })
    const accounts = new Set<string>()
    const values = new Map<string, { value: number; currency: string | null }>()
    const positions = new Map<string, BrokerPosition>()
    let subscribedAccount: string | null = null
    let settled = false

    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (subscribedAccount) {
        try { ib.reqAccountUpdates(false, subscribedAccount) } catch { /* socket may already be closed */ }
      }
      try { ib.disconnect() } catch { /* already disconnected */ }
      if (error) return reject(error)
      if (accounts.size !== 1 || !subscribedAccount) return reject(new Error('paper_account_ambiguous'))
      resolve({ accountId: subscribedAccount, asOf: now().toISOString(), values, positions: [...positions.values()] })
    }

    const timer = setTimeout(() => finish(new Error('paper_snapshot_timeout')), timeoutMs)
    ib.on(EventName.managedAccounts, (raw: string) => {
      for (const account of String(raw ?? '').split(',').map((value) => value.trim()).filter(Boolean)) accounts.add(account)
      if (accounts.size !== 1 || subscribedAccount) return
      subscribedAccount = [...accounts][0]
      ib.reqAccountUpdates(true, subscribedAccount)
    })
      .on(EventName.updateAccountValue, (key: string, raw: string, currency: string, accountName: string) => {
        if (!subscribedAccount || accountName !== subscribedAccount) return
        const value = finiteNumber(raw)
        if (value !== null) values.set(key, { value, currency: nullableText(currency) })
      })
      .on(EventName.updatePortfolio, (
        contract: Contract,
        rawQuantity: number,
        rawMarketPrice: number,
        rawMarketValue: number,
        rawAverageCost?: number,
        rawUnrealized?: number,
        rawRealized?: number,
        accountName?: string,
      ) => {
        if (!subscribedAccount || accountName !== subscribedAccount) return
        const quantity = finiteNumber(rawQuantity)
        const symbol = normalizedSymbol(contract?.symbol || contract?.localSymbol)
        if (quantity === null || !symbol) return
        const conId = finiteNumber(contract?.conId)
        const key = conId !== null && conId > 0
          ? String(conId)
          : `${symbol}|${contract?.localSymbol ?? ''}|${contract?.currency ?? ''}|${contract?.primaryExch || contract?.exchange || ''}`
        positions.set(key, {
          symbol,
          local_symbol: nullableText(contract?.localSymbol),
          security_type: nullableText(contract?.secType),
          currency: nullableText(contract?.currency),
          exchange: nullableText(contract?.primaryExch || contract?.exchange),
          quantity,
          average_cost: finiteNumber(rawAverageCost),
          market_price: finiteNumber(rawMarketPrice),
          market_value: finiteNumber(rawMarketValue),
          unrealized_pnl: finiteNumber(rawUnrealized),
          realized_pnl: finiteNumber(rawRealized),
        })
      })
      .once(EventName.accountDownloadEnd, (accountName: string) => {
        if (subscribedAccount && accountName === subscribedAccount) finish()
      })
      .on(EventName.error, (error: Error, code: number) => {
        if (!isNonFatalError(code, error)) finish(new Error(`paper_api_error_${Number(code) || 'unknown'}`))
      })
      .once(EventName.disconnected, () => {
        if (!settled) finish(new Error('paper_disconnected'))
      })

    try { ib.connect() } catch { finish(new Error('paper_connect_failed')) }
  })
}

function appendConnectionTransition(stateDir: string, previous: IbkrPaperStatus | null, next: IbkrPaperStatus, at: string, positionCount: number, targetCount: number): void {
  if (previous === next) return
  const dir = path.join(stateDir, 'ibkr-paper')
  const file = path.join(dir, 'events.jsonl')
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
    fs.appendFileSync(file, `${JSON.stringify({ schema_version: 'ibkr-paper-event/v1', at, event: 'connection-status', status: next, position_count: positionCount, target_position_count: targetCount })}\n`, { encoding: 'utf8', mode: 0o600 })
    try { fs.chmodSync(file, 0o600) } catch { /* best effort on filesystems without POSIX modes */ }
  } catch {
    // Observability must never make the read-only broker projection unavailable.
  }
}

export function createIbkrPaperPortfolioService(options: PaperPortfolioServiceOptions = {}): () => Promise<IbkrPaperPortfolioRead> {
  const repoRoot = path.resolve(options.repoRoot ?? REPO_ROOT)
  const stateDir = path.resolve(options.stateDir ?? STATE_DIR)
  const enabled = options.enabled ?? process.env.ENGINE_IBKR_PAPER_DISABLED !== '1'
  const clientId = options.clientId ?? Number(process.env.ENGINE_IBKR_PAPER_CLIENT_ID || DEFAULT_CLIENT_ID)
  const timeoutMs = options.timeoutMs ?? Number(process.env.ENGINE_IBKR_PAPER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
  const cacheMs = Number.isFinite(options.cacheMs) ? Math.max(0, Number(options.cacheMs)) : DEFAULT_CACHE_MS
  const now = options.now ?? (() => new Date())
  const brokerReader = options.brokerReader ?? (() => readIbkrPaperBrokerSnapshot({ clientId, timeoutMs, now }))
  let cached: { at: number; value: IbkrPaperPortfolioRead } | null = null
  let pending: Promise<IbkrPaperPortfolioRead> | null = null
  let lastRecordedStatus: IbkrPaperStatus | null = null

  const read = async (): Promise<IbkrPaperPortfolioRead> => {
    const at = now()
    const target = readPaperPortfolioTarget(repoRoot)
    if (!enabled) {
      const disabled: IbkrPaperPortfolioRead = {
        schema_version: 'ibkr-paper-portfolio/v1', broker: 'IBKR', mode: 'paper', status: 'disabled', read_only: true, as_of: at.toISOString(),
        connection: { host: 'localhost', port: IBKR_PAPER_PORT, detail: 'IBKR Paper reading is disabled by the local engine configuration.' },
        account: null, target, reconciliation: reconcilePaperPortfolio(target, null),
        execution: { status: 'locked', detail: 'Order submission is not installed. This release is read-only.' },
      }
      appendConnectionTransition(stateDir, lastRecordedStatus, disabled.status, disabled.as_of, 0, target.positions.length)
      lastRecordedStatus = disabled.status
      return disabled
    }

    try {
      const snapshot = await brokerReader()
      const account = accountFromSnapshot(snapshot)
      const connected: IbkrPaperPortfolioRead = {
        schema_version: 'ibkr-paper-portfolio/v1', broker: 'IBKR', mode: 'paper', status: 'connected', read_only: true, as_of: snapshot.asOf,
        connection: { host: 'localhost', port: IBKR_PAPER_PORT, detail: 'Connected to TWS on the standard paper-trading port.' },
        account, target, reconciliation: reconcilePaperPortfolio(target, account),
        execution: { status: 'locked', detail: 'Order submission is not installed. First verify this read-only portfolio and reconciliation.' },
      }
      appendConnectionTransition(stateDir, lastRecordedStatus, connected.status, connected.as_of, account.positions.length, target.positions.length)
      lastRecordedStatus = connected.status
      return connected
    } catch (error: any) {
      const disconnected = ['paper_connect_failed', 'paper_disconnected'].includes(String(error?.message))
      const failed: IbkrPaperPortfolioRead = {
        schema_version: 'ibkr-paper-portfolio/v1', broker: 'IBKR', mode: 'paper', status: disconnected ? 'disconnected' : 'error', read_only: true, as_of: at.toISOString(),
        connection: { host: 'localhost', port: IBKR_PAPER_PORT, detail: disconnected
          ? 'TWS Paper is not reachable. Keep TWS open, logged into Paper, with Socket Clients enabled on port 7497.'
          : 'TWS Paper did not return a safe single-account snapshot. Execution remains locked.' },
        account: null, target, reconciliation: reconcilePaperPortfolio(target, null),
        execution: { status: 'locked', detail: 'Order submission is not installed. This release is read-only.' },
      }
      appendConnectionTransition(stateDir, lastRecordedStatus, failed.status, failed.as_of, 0, target.positions.length)
      lastRecordedStatus = failed.status
      return failed
    }
  }

  return async () => {
    const currentMs = now().getTime()
    if (cached && currentMs - cached.at < cacheMs) return cached.value
    if (pending) return pending
    pending = read().then((value) => {
      cached = { at: now().getTime(), value }
      return value
    }).finally(() => { pending = null })
    return pending
  }
}

export const readIbkrPaperPortfolio = createIbkrPaperPortfolioService()
