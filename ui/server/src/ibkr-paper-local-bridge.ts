import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { PaperExecutionResult } from './ibkr-paper-execution'
import type { CallPolicyTarget } from './paper-call-ledger'

const REVISION_RE = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/
const FINGERPRINT_RE = /^[0-9a-f]{64}$/

export type LocalPaperBridgeOutcome = 'aligned' | 'submitted' | 'pending' | 'blocked' | 'error'

export interface LocalPaperBridgeAttempt {
  schema_version: 'ibkr-paper-local-bridge/v1'
  at: string
  outcome: LocalPaperBridgeOutcome
  publication_revision: string | null
  target_fingerprint: string | null
  order_count: number
  skipped_count: number
  detail: string
}

interface LocalPaperBridgeDependencies {
  enabled: boolean
  operatorAuthorized: boolean
  stateDir: string
  revision: () => Promise<string> | string
  target: () => Promise<CallPolicyTarget>
  sync: (idempotencyKey: string, command: { reconcilePositions: true; publishedRevision: string }) => Promise<PaperExecutionResult>
  now?: () => Date
}

function safeErrorMessage(error: unknown): string {
  const raw = String(error instanceof Error ? error.message : error)
  const containsAbsolutePath = /(^|[\s("'`])\/(?=[^/\s])/u.test(raw)
    || /(^|[\s("'`])[A-Za-z]:[\/\\](?=[^\/\\\s])/u.test(raw)
  return containsAbsolutePath ? '[PATH]' : raw
}

function validAttempt(value: unknown): value is LocalPaperBridgeAttempt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return row.schema_version === 'ibkr-paper-local-bridge/v1'
    && typeof row.at === 'string'
    && typeof row.outcome === 'string' && ['aligned', 'submitted', 'pending', 'blocked', 'error'].includes(row.outcome)
    && (row.publication_revision === null
      || typeof row.publication_revision === 'string' && REVISION_RE.test(row.publication_revision))
    && (row.target_fingerprint === null
      || typeof row.target_fingerprint === 'string' && FINGERPRINT_RE.test(row.target_fingerprint))
    && typeof row.order_count === 'number' && Number.isSafeInteger(row.order_count) && row.order_count >= 0
    && typeof row.skipped_count === 'number' && Number.isSafeInteger(row.skipped_count) && row.skipped_count >= 0
    && typeof row.detail === 'string'
}

function readAttempt(stateDir: string): LocalPaperBridgeAttempt | null {
  const filename = path.join(stateDir, 'latest.json')
  try {
    const stat = fs.lstatSync(filename)
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 64 * 1024) return null
    const parsed: unknown = JSON.parse(fs.readFileSync(filename, 'utf8'))
    return validAttempt(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeAttempt(stateDir: string, attempt: LocalPaperBridgeAttempt): void {
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 })
  const filename = path.join(stateDir, 'latest.json')
  const staged = path.join(stateDir, `.latest.${process.pid}.${crypto.randomUUID()}.tmp`)
  const payload = `${JSON.stringify(attempt, null, 2)}\n`
  let fd: number | null = null
  try {
    fd = fs.openSync(staged, 'wx', 0o600)
    fs.writeFileSync(fd, payload, 'utf8')
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = null
    fs.renameSync(staged, filename)
    fs.chmodSync(filename, 0o600)
    fs.appendFileSync(path.join(stateDir, 'history.jsonl'), `${JSON.stringify(attempt)}\n`, { encoding: 'utf8', mode: 0o600 })
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch {}
    if (fs.existsSync(staged)) try { fs.unlinkSync(staged) } catch {}
  }
}

function asciiCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

export function paperTargetFingerprint(target: CallPolicyTarget): string {
  const positions = target.positions.map((row) => ({
    ticker: row.ticker,
    decision: row.decision,
    side: row.side,
    confidence: row.confidence,
    model_weight_pct: row.model_weight_pct,
    currency: row.currency,
    exchange: row.exchange,
    call_id: row.call_id,
    decision_date: row.decision_date,
  })).sort((a, b) => asciiCompare(`${a.ticker}:${a.call_id}`, `${b.ticker}:${b.call_id}`))
  const blocked = target.blocked_calls.map((row) => ({
    ticker: row.ticker,
    decision: row.decision,
    decision_date: row.decision_date,
    reason: row.reason,
  })).sort((a, b) => asciiCompare(
    `${a.ticker}:${a.decision_date}:${a.reason}`,
    `${b.ticker}:${b.decision_date}:${b.reason}`,
  ))
  return crypto.createHash('sha256').update(JSON.stringify({ valid: target.valid, positions, blocked })).digest('hex')
}

export async function runLocalPaperBridge(deps: LocalPaperBridgeDependencies): Promise<LocalPaperBridgeAttempt | null> {
  if (!deps.enabled) return null
  const now = deps.now ?? (() => new Date())
  let revision: string | null = null
  let fingerprint: string | null = null
  let attempt: LocalPaperBridgeAttempt
  try {
    if (!deps.operatorAuthorized) throw new Error('The configured local paper operator is not authorized.')
    revision = String(await deps.revision()).trim().toLowerCase()
    if (!REVISION_RE.test(revision)) throw new Error('The deployed publication revision is invalid.')
    const target = await deps.target()
    if (!target.valid) throw new Error(target.detail || 'The published Calls target is invalid.')
    fingerprint = paperTargetFingerprint(target)
    const prior = readAttempt(deps.stateDir)
    // This is also the manual-exit lock: after the exact target was aligned, a TWS close/cancel stays
    // authoritative until Research publishes a target-changing call or review.
    if (prior?.target_fingerprint === fingerprint && ['aligned', 'submitted'].includes(prior.outcome)) return prior

    const result = await deps.sync(`local-bridge-${revision.slice(0, 12)}-${fingerprint.slice(0, 12)}`, {
      reconcilePositions: true,
      publishedRevision: revision,
    })
    const detail = result.skipped.length
      ? `${result.detail} ${result.skipped.slice(0, 3).map((row) => `${row.ticker}: ${row.reason}`).join(' ')}`
      : result.detail
    attempt = {
      schema_version: 'ibkr-paper-local-bridge/v1', at: now().toISOString(),
      // A complete accepted intent is terminal for this target: a later operator cancellation must stay
      // cancelled. Only a phased close/reduction with deferred targets is polled until the next phase.
      outcome: result.orders.length
        ? result.skipped.length ? 'pending' : 'submitted'
        : result.skipped.length ? 'blocked' : 'aligned',
      publication_revision: revision, target_fingerprint: fingerprint,
      order_count: result.orders.length, skipped_count: result.skipped.length, detail,
    }
  } catch (error: unknown) {
    attempt = {
      schema_version: 'ibkr-paper-local-bridge/v1', at: now().toISOString(), outcome: 'error',
      publication_revision: revision, target_fingerprint: fingerprint,
      order_count: 0, skipped_count: 0,
      detail: `Local IBKR Paper bridge is waiting safely: ${safeErrorMessage(error)}`,
    }
  }
  writeAttempt(deps.stateDir, attempt)
  return attempt
}
