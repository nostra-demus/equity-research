// Automatic IBKR Paper synchronization. This is deliberately downstream of the publication supervisor:
// only a fully verified, terminally published Research call can request a sync. The execution service
// remains the safety authority (DU allow-list, localhost:7497, 5%/10% sizing and duplicate protection).
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { STATE_DIR } from './config'
import type { PaperExecutionResult } from './ibkr-paper-execution'

const AUTO_SYNC_FILE = 'automatic-sync.json'

export interface PaperAutoSyncAttempt {
  schema_version: 'ibkr-paper-auto-sync/v1'
  at: string
  outcome: 'orders_sent' | 'partial' | 'aligned' | 'no_order' | 'error'
  trigger: 'publication'
  run_id: string | null
  run_kind: string | null
  ticker: string | null
  order_count: number
  skipped_count: number
  detail: string
}

export interface PaperAutoSyncRead {
  enabled: boolean
  last_attempt: PaperAutoSyncAttempt | null
}

export interface PublishedResearchRun {
  runId: string
  kind: string
  ticker: string
  swarmId: string
  willCommitToMain: boolean
  publicationCompleted?: boolean
  publicationPhase?: string
  publicationRevision?: string
}

interface AutoSyncOptions {
  enabled?: boolean
  stateDir?: string
  now?: () => Date
  sync?: (idempotencyKey: string, options: { reconcilePositions: true; publishedRevision: string }) => Promise<PaperExecutionResult>
}

function statusPath(stateDir: string): string {
  return path.join(stateDir, 'ibkr-paper', AUTO_SYNC_FILE)
}

function validAttempt(value: unknown): value is PaperAutoSyncAttempt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return row.schema_version === 'ibkr-paper-auto-sync/v1'
    && typeof row.at === 'string'
    && typeof row.outcome === 'string' && ['orders_sent', 'partial', 'aligned', 'no_order', 'error'].includes(row.outcome)
    && row.trigger === 'publication'
    && (row.run_id === null || typeof row.run_id === 'string')
    && (row.run_kind === null || typeof row.run_kind === 'string')
    && (row.ticker === null || typeof row.ticker === 'string')
    && typeof row.order_count === 'number' && Number.isInteger(row.order_count) && row.order_count >= 0
    && typeof row.skipped_count === 'number' && Number.isInteger(row.skipped_count) && row.skipped_count >= 0
    && typeof row.detail === 'string'
}

function readAttempt(stateDir: string): PaperAutoSyncAttempt | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(statusPath(stateDir), 'utf8'))
    return validAttempt(parsed) ? parsed : null
  } catch { return null }
}

function writeAttempt(stateDir: string, attempt: PaperAutoSyncAttempt): void {
  const dir = path.join(stateDir, 'ibkr-paper')
  const target = statusPath(stateDir)
  let staged = ''
  try {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
    staged = path.join(dir, `.${AUTO_SYNC_FILE}.${process.pid}.${randomUUID()}.tmp`)
    fs.writeFileSync(staged, `${JSON.stringify(attempt)}\n`, { encoding: 'utf8', mode: 0o600, flag: 'wx' })
    fs.renameSync(staged, target)
    fs.chmodSync(target, 0o600)
    fs.appendFileSync(path.join(dir, 'automatic-sync.jsonl'), `${JSON.stringify(attempt)}\n`, { encoding: 'utf8', mode: 0o600 })
  } catch {
    if (staged) { try { fs.unlinkSync(staged) } catch {} }
    // Broker state is authoritative. A local observability write must never turn a safe paper result
    // into a retry that could submit the same intent again.
  }
}

function safeErrorMessage(error: unknown): string {
  const raw = String(error instanceof Error ? error.message : error)
  return raw
    .replace(/(^|[\s("'`])\/(?:[^/\s"'`]+\/)*[^/\s"'`]+/g, '$1[PATH]')
    .replace(/(^|[\s("'`])[A-Za-z]:\\(?:[^\\\s"'`]+\\)*[^\\\s"'`]+/g, '$1[PATH]')
}

export function isAutomaticPaperSyncRun(run: PublishedResearchRun): boolean {
  return run.swarmId === 'research'
    && ['full', 'rerun', 'review'].includes(run.kind)
    && run.willCommitToMain
    && run.publicationCompleted === true
    && run.publicationPhase === 'terminal-complete'
    && /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(run.publicationRevision || '')
}

export function createIbkrPaperAutoSync(options: AutoSyncOptions = {}) {
  const stateDir = path.resolve(options.stateDir ?? STATE_DIR)
  const enabled = options.enabled ?? (
    process.env.ENGINE_IBKR_PAPER_AUTO_SYNC === '1'
    && process.env.ENGINE_IBKR_PAPER_EXECUTION === '1'
  )
  const now = options.now ?? (() => new Date())
  const sync = options.sync ?? (async (idempotencyKey: string, command: { reconcilePositions: true; publishedRevision: string }) => {
    const { ibkrPaperExecution } = await import('./ibkr-paper-execution')
    return ibkrPaperExecution.sync(idempotencyKey, command)
  })
  let tail: Promise<PaperAutoSyncAttempt | null> = Promise.resolve(null)
  const publishedRuns = new Set<string>()

  const afterPublishedRun = (run: PublishedResearchRun): Promise<PaperAutoSyncAttempt | null> => {
    if (!enabled || !isAutomaticPaperSyncRun(run) || publishedRuns.has(run.runId)) return Promise.resolve(null)
    publishedRuns.add(run.runId)
    const execute = async (): Promise<PaperAutoSyncAttempt> => {
      const identity = { run_id: run.runId, run_kind: run.kind, ticker: run.ticker }
      let attempt: PaperAutoSyncAttempt
      try {
        const result = await sync(randomUUID(), { reconcilePositions: true, publishedRevision: run.publicationRevision! })
        const partial = result.orders.length > 0 && result.skipped.length > 0
        const detail = partial
          ? `${result.detail} ${result.skipped.slice(0, 3).map((row) => `${row.ticker}: ${row.reason}`).join(' ')}`
          : result.detail
        attempt = {
          schema_version: 'ibkr-paper-auto-sync/v1', at: now().toISOString(), trigger: 'publication', ...identity,
          outcome: partial ? 'partial' : result.orders.length ? 'orders_sent' : result.skipped.length ? 'no_order' : 'aligned',
          order_count: result.orders.length, skipped_count: result.skipped.length, detail,
        }
      } catch (error: unknown) {
        attempt = {
          schema_version: 'ibkr-paper-auto-sync/v1', at: now().toISOString(), trigger: 'publication', ...identity,
          outcome: 'error', order_count: 0, skipped_count: 0,
          detail: `Automatic paper sync could not run safely: ${safeErrorMessage(error)}`,
        }
      }
      writeAttempt(stateDir, attempt)
      return attempt
    }
    // One broker snapshot-to-order transaction at a time, including coincident publication and timer
    // ticks. The execution layer independently serializes manual buttons against this same order path.
    tail = tail.then(execute, execute)
    return tail
  }

  const scheduleAfterPublishedRun = (run: PublishedResearchRun): void => { void afterPublishedRun(run) }
  const read = (): PaperAutoSyncRead => ({ enabled, last_attempt: readAttempt(stateDir) })
  const drain = async (): Promise<void> => {
    // Shutdown waits for broker work to finish, but an observability/runtime failure must not leave
    // the process alive forever after the broker transaction has already ended.
    try { await tail } catch {}
  }

  return { afterPublishedRun, scheduleAfterPublishedRun, read, drain }
}

export const ibkrPaperAutoSync = createIbkrPaperAutoSync()
export const scheduleIbkrPaperAutoSyncAfterPublication = (run: PublishedResearchRun): void => ibkrPaperAutoSync.scheduleAfterPublishedRun(run)
export const runIbkrPaperAutoSyncAfterPublication = (run: PublishedResearchRun): Promise<PaperAutoSyncAttempt | null> => ibkrPaperAutoSync.afterPublishedRun(run)
export const readIbkrPaperAutoSync = (): PaperAutoSyncRead => ibkrPaperAutoSync.read()
export const drainIbkrPaperAutoSync = (): Promise<void> => ibkrPaperAutoSync.drain()
