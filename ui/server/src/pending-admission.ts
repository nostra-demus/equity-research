import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { REPO_ROOT, STATE_DIR } from './config'
import type { ContinuationPlanReceipt } from './completion'
import type { RunProvider } from './providers/types'

export type PendingAdmissionAction = 'continue' | 'full'
export type PendingAdmissionStatus =
  | 'waiting_for_update'
  | 'admitting'
  | 'started'
  | 'needs_attention'
  | 'cancelled'

export interface PendingAdmissionRecord {
  version: 1
  requestId: string
  user: string
  userVia: 'cf-access' | 'local'
  ticker: string
  action: PendingAdmissionAction
  sourceRunRoot?: string
  provider: RunProvider
  model?: string
  reasoningLevel?: string
  expectedProfileKey?: string
  reuse: string[]
  originalPlan: ContinuationPlanReceipt
  requestedDeployCommit: string | null
  status: PendingAdmissionStatus
  createdAt: string
  updatedAt: string
  runId?: string
  response?: Record<string, unknown>
  attention?: string
  planDifference?: {
    beforeFingerprint: string
    afterFingerprint: string
    addedPayableOrbKeys: string[]
    removedPayableOrbKeys: string[]
  }
}

export interface PendingAdmissionIntent {
  requestId: string
  user: string
  userVia: 'cf-access' | 'local'
  ticker: string
  action: PendingAdmissionAction
  sourceRunRoot?: string
  provider: RunProvider
  model?: string
  reasoningLevel?: string
  expectedProfileKey?: string
  reuse: string[]
  originalPlan: ContinuationPlanReceipt
  requestedDeployCommit?: string | null
}

const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const TICKER = /^[A-Z0-9][A-Z0-9.\-]{0,14}$/
const RUN_ROOT = /^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/
const MODULE = /^[a-z0-9][a-z0-9-]{0,39}$/
const SHA = /^[0-9a-f]{40,64}$/
const FINGERPRINT = /^sha256:[a-f0-9]{64}$/
const STATUSES = new Set<PendingAdmissionStatus>([
  'waiting_for_update', 'admitting', 'started', 'needs_attention', 'cancelled',
])

function recordsDir(stateDir: string): string {
  return path.join(path.resolve(stateDir), 'pending-admissions')
}

function recordPath(requestId: string, stateDir: string): string {
  if (!REQUEST_ID.test(requestId)) throw new Error('invalid pending-admission request id')
  return path.join(recordsDir(stateDir), `${requestId.toLowerCase()}.json`)
}

function ensurePrivateDirectory(directory: string): void {
  if (fs.existsSync(directory)) {
    const info = fs.lstatSync(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('pending-admission directory is unsafe')
  } else {
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  }
  fs.chmodSync(directory, 0o700)
}

function syncDirectory(directory: string): void {
  const fd = fs.openSync(directory, fs.constants.O_RDONLY)
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

function validString(value: unknown, max = 500): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max && value === value.trim()
}

function validReceipt(value: unknown): value is ContinuationPlanReceipt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const receipt = value as Record<string, any>
  return receipt.version === 1
    && (receipt.action === 'continue' || receipt.action === 'complete')
    && validString(receipt.swarm, 40)
    && TICKER.test(String(receipt.subject))
    && Array.isArray(receipt.sourceRunRoots) && receipt.sourceRunRoots.every((root: unknown) => typeof root === 'string' && RUN_ROOT.test(root))
    && typeof receipt.targetRunRoot === 'string' && RUN_ROOT.test(receipt.targetRunRoot)
    && receipt.provider && (receipt.provider.id === 'claude' || receipt.provider.id === 'codex')
    && Array.isArray(receipt.reusableOrbKeys) && Array.isArray(receipt.payableOrbKeys)
    && receipt.dataPool && Number.isInteger(receipt.dataPool.files) && Number.isFinite(receipt.dataPool.newestMs)
    && FINGERPRINT.test(String(receipt.dataPool.sha256))
    && FINGERPRINT.test(String(receipt.sourceArtifactsSha256))
    && FINGERPRINT.test(String(receipt.fingerprint))
}

function validRecord(value: unknown): value is PendingAdmissionRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, any>
  if (row.version !== 1 || !REQUEST_ID.test(String(row.requestId)) || !validString(row.user, 200)
      || (row.userVia !== 'cf-access' && row.userVia !== 'local') || !TICKER.test(String(row.ticker))
      || (row.action !== 'continue' && row.action !== 'full') || !STATUSES.has(row.status)
      || (row.provider !== 'claude' && row.provider !== 'codex') || !Array.isArray(row.reuse)
      || row.reuse.some((name: unknown) => typeof name !== 'string' || !MODULE.test(name))
      || !validReceipt(row.originalPlan) || !validString(row.createdAt) || !validString(row.updatedAt)) return false
  if (row.sourceRunRoot !== undefined && (typeof row.sourceRunRoot !== 'string' || !RUN_ROOT.test(row.sourceRunRoot))) return false
  if (row.action === 'continue' && (!row.sourceRunRoot || row.originalPlan.action !== 'continue'
      || row.originalPlan.targetRunRoot !== row.sourceRunRoot)) return false
  if (row.action === 'full' && (row.sourceRunRoot !== undefined || row.originalPlan.action !== 'complete')) return false
  if (row.originalPlan.subject !== row.ticker || row.originalPlan.provider.id !== row.provider) return false
  if (row.requestedDeployCommit !== null && (typeof row.requestedDeployCommit !== 'string' || !SHA.test(row.requestedDeployCommit))) return false
  return true
}

function readFile(requestId: string, stateDir: string): PendingAdmissionRecord | null {
  try {
    const target = recordPath(requestId, stateDir)
    const info = fs.lstatSync(target)
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) !== 0 || info.nlink !== 1) return null
    const value = JSON.parse(fs.readFileSync(target, 'utf8'))
    return validRecord(value) ? value : null
  } catch { return null }
}

function atomicWrite(record: PendingAdmissionRecord, stateDir: string, exclusive = false): void {
  const directory = recordsDir(stateDir)
  ensurePrivateDirectory(directory)
  const target = recordPath(record.requestId, stateDir)
  if (exclusive) {
    const fd = fs.openSync(target, 'wx', 0o600)
    try {
      fs.writeFileSync(fd, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
      fs.fsyncSync(fd)
    } finally { fs.closeSync(fd) }
    syncDirectory(directory)
    return
  }
  const staged = path.join(directory, `.${record.requestId}.${process.pid}.${crypto.randomUUID()}.tmp`)
  const fd = fs.openSync(staged, 'wx', 0o600)
  try {
    fs.writeFileSync(fd, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    fs.fsyncSync(fd)
  } finally { fs.closeSync(fd) }
  fs.renameSync(staged, target)
  syncDirectory(directory)
}

function sameIntent(record: PendingAdmissionRecord, intent: PendingAdmissionIntent): boolean {
  return record.requestId === intent.requestId.toLowerCase()
    && record.user === intent.user && record.userVia === intent.userVia
    && record.ticker === intent.ticker && record.action === intent.action
    && record.sourceRunRoot === intent.sourceRunRoot && record.provider === intent.provider
    && record.model === intent.model && record.reasoningLevel === intent.reasoningLevel
    && record.expectedProfileKey === intent.expectedProfileKey
    && JSON.stringify(record.reuse) === JSON.stringify([...intent.reuse].sort())
    && record.originalPlan.fingerprint === intent.originalPlan.fingerprint
    && record.requestedDeployCommit === (intent.requestedDeployCommit ?? null)
}

export type EnqueuePendingAdmissionResult =
  | { kind: 'new' | 'existing'; record: PendingAdmissionRecord }
  | { kind: 'conflict'; record: PendingAdmissionRecord }

export function enqueuePendingAdmission(
  intent: PendingAdmissionIntent,
  stateDir: string = STATE_DIR,
): EnqueuePendingAdmissionResult {
  if (!REQUEST_ID.test(intent.requestId)) throw new Error('invalid pending-admission request id')
  const requestId = intent.requestId.toLowerCase()
  const existing = readFile(requestId, stateDir)
  if (existing) return sameIntent(existing, intent)
    ? { kind: 'existing', record: existing }
    : { kind: 'conflict', record: existing }
  const now = new Date().toISOString()
  const record: PendingAdmissionRecord = {
    version: 1,
    requestId,
    user: intent.user,
    userVia: intent.userVia,
    ticker: intent.ticker,
    action: intent.action,
    ...(intent.sourceRunRoot ? { sourceRunRoot: intent.sourceRunRoot } : {}),
    provider: intent.provider,
    ...(intent.model ? { model: intent.model } : {}),
    ...(intent.reasoningLevel ? { reasoningLevel: intent.reasoningLevel } : {}),
    ...(intent.expectedProfileKey ? { expectedProfileKey: intent.expectedProfileKey } : {}),
    reuse: [...intent.reuse].sort(),
    originalPlan: intent.originalPlan,
    requestedDeployCommit: intent.requestedDeployCommit ?? null,
    status: 'waiting_for_update',
    createdAt: now,
    updatedAt: now,
  }
  try {
    atomicWrite(record, stateDir, true)
    return { kind: 'new', record }
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
    const raced = readFile(requestId, stateDir)
    if (!raced) throw new Error('pending-admission receipt is unreadable')
    return sameIntent(raced, intent) ? { kind: 'existing', record: raced } : { kind: 'conflict', record: raced }
  }
}

function update(
  requestId: string,
  mutate: (record: PendingAdmissionRecord) => PendingAdmissionRecord,
  stateDir: string,
): PendingAdmissionRecord {
  const record = readFile(requestId, stateDir)
  if (!record) throw new Error('pending admission is missing or unsafe')
  const next = { ...mutate(record), updatedAt: new Date().toISOString() }
  if (!validRecord(next)) throw new Error('pending admission update is invalid')
  atomicWrite(next, stateDir)
  return next
}

export function readPendingAdmission(requestId: string, stateDir: string = STATE_DIR): PendingAdmissionRecord | null {
  return readFile(requestId, stateDir)
}

export function listPendingAdmissions(stateDir: string = STATE_DIR): PendingAdmissionRecord[] {
  const directory = recordsDir(stateDir)
  let names: string[]
  try {
    const info = fs.lstatSync(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) return []
    names = fs.readdirSync(directory)
  } catch { return [] }
  return names
    .filter((name) => REQUEST_ID.test(name.replace(/\.json$/, '')) && name.endsWith('.json'))
    .map((name) => readFile(name.slice(0, -5), stateDir))
    .filter((record): record is PendingAdmissionRecord => Boolean(record))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
}

export function markPendingAdmissionAdmitting(
  requestId: string,
  planDifference?: PendingAdmissionRecord['planDifference'],
  stateDir: string = STATE_DIR,
): PendingAdmissionRecord {
  return update(requestId, (record) => {
    // Cancellation wins until admission begins. A stale drain snapshot may never resurrect a request the
    // user cancelled while the engine was still waiting for its healthy release receipt.
    if (record.status === 'cancelled' || record.status === 'started' || record.status === 'needs_attention') return record
    return { ...record, status: 'admitting', attention: undefined, planDifference }
  }, stateDir)
}

export function markPendingAdmissionWaiting(
  requestId: string,
  attention?: string,
  stateDir: string = STATE_DIR,
): PendingAdmissionRecord {
  return update(requestId, (record) => {
    if (record.status === 'cancelled' || record.status === 'started' || record.status === 'needs_attention') return record
    return { ...record, status: 'waiting_for_update', ...(attention ? { attention: attention.slice(0, 500) } : { attention: undefined }) }
  }, stateDir)
}

export function markPendingAdmissionNeedsAttention(
  requestId: string,
  attention: string,
  stateDir: string = STATE_DIR,
): PendingAdmissionRecord {
  return update(requestId, (record) => record.status === 'cancelled' || record.status === 'started'
    ? record
    : { ...record, status: 'needs_attention', attention: attention.slice(0, 500) }, stateDir)
}

export function markPendingAdmissionStarted(
  requestId: string,
  runId: string | undefined,
  response: Record<string, unknown>,
  stateDir: string = STATE_DIR,
): PendingAdmissionRecord {
  return update(requestId, (record) => {
    if (record.status === 'cancelled') throw new Error('cancelled pending admission cannot be marked started')
    if (record.status === 'started') return record
    return { ...record, status: 'started', ...(runId ? { runId } : {}), response, attention: undefined }
  }, stateDir)
}

export function cancelPendingAdmission(
  requestId: string,
  actor: { user: string; isAdmin: boolean },
  stateDir: string = STATE_DIR,
): PendingAdmissionRecord {
  return update(requestId, (record) => {
    if (record.user !== actor.user && !actor.isAdmin) throw Object.assign(new Error('not authorized to cancel this request'), { statusCode: 403 })
    if (record.status === 'admitting' || record.status === 'started') {
      throw Object.assign(new Error('this request has already started admission and can no longer be cancelled'), { statusCode: 409 })
    }
    if (record.status === 'cancelled') return record
    return { ...record, status: 'cancelled', attention: undefined }
  }, stateDir)
}

export function pendingPlanDifference(
  before: ContinuationPlanReceipt,
  after: ContinuationPlanReceipt,
): NonNullable<PendingAdmissionRecord['planDifference']> {
  const oldKeys = new Set(before.payableOrbKeys)
  const newKeys = new Set(after.payableOrbKeys)
  return {
    beforeFingerprint: before.fingerprint,
    afterFingerprint: after.fingerprint,
    addedPayableOrbKeys: [...newKeys].filter((key) => !oldKeys.has(key)).sort(),
    removedPayableOrbKeys: [...oldKeys].filter((key) => !newKeys.has(key)).sort(),
  }
}

/** The writer-intent file is owner-only and contains "<target sha> <epoch>". Treat anything else as
 * unknown rather than widening a queued request around an untrusted deployment identity. */
export function pendingDeployCommit(intentPath: string): string | null {
  try {
    const info = fs.lstatSync(intentPath)
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) !== 0 || info.nlink !== 1) return null
    const [sha] = fs.readFileSync(intentPath, 'utf8').trim().split(/\s+/)
    return SHA.test(sha || '') ? sha : null
  } catch { return null }
}

/** A failed deploy must never be mistaken for "the update finished" merely because the writer-intent
 * disappeared. deploy.sh stamps this marker before releasing the barrier. A failure newer than the queued
 * click is therefore a Needs-attention boundary; successful deployment removes the marker. */
export function deploymentFailedAfter(
  createdAt: string,
  opsDir: string = path.join(os.homedir(), '.nostra-ops'),
): { sha: string; failedAt: number } | null {
  try {
    const target = path.join(path.resolve(opsDir), '.deploy.failed')
    const info = fs.lstatSync(target)
    const ownedByProcess = typeof process.getuid !== 'function' || info.uid === process.getuid()
    if (!info.isFile() || info.isSymbolicLink() || !ownedByProcess
        || info.nlink !== 1 || (info.mode & 0o022) !== 0 || info.size > 256) return null
    const [sha, epoch] = fs.readFileSync(target, 'utf8').trim().split(/\s+/)
    const failedAt = Number(epoch)
    const queuedAt = Date.parse(createdAt)
    if (!SHA.test(sha || '') || !Number.isSafeInteger(failedAt) || !Number.isFinite(queuedAt)) return null
    return failedAt * 1000 >= queuedAt ? { sha, failedAt } : null
  } catch { return null }
}

/** Successful deployment proof is the deployer's atomically replaced marker, not the absence of intent.
 * Its mtime must post-date the click, which also permits coalescing onto a newer all-green commit without
 * pretending an old marker admitted the request. */
export function deploymentSucceededAfter(
  createdAt: string,
  requestedDeployCommit?: string | null,
  opsDir: string = path.join(os.homedir(), '.nostra-ops'),
  repoRoot: string = REPO_ROOT,
): { sha: string; deployedAt: number } | null {
  try {
    const target = path.join(path.resolve(opsDir), '.deployed.sha')
    const info = fs.lstatSync(target)
    const ownedByProcess = typeof process.getuid !== 'function' || info.uid === process.getuid()
    if (!info.isFile() || info.isSymbolicLink() || !ownedByProcess
        || info.nlink !== 1 || (info.mode & 0o022) !== 0 || info.size > 256) return null
    const sha = fs.readFileSync(target, 'utf8').trim()
    const queuedAt = Date.parse(createdAt)
    if (!SHA.test(sha) || !Number.isFinite(queuedAt) || info.mtimeMs < queuedAt) return null
    // A newer all-green commit may coalesce the requested release, but an unrelated/older marker cannot.
    // Prove ancestry in the local production repository instead of trusting timestamps alone.
    if (requestedDeployCommit) {
      if (!SHA.test(requestedDeployCommit)) return null
      if (sha !== requestedDeployCommit) {
        const ancestry = spawnSync('git', ['merge-base', '--is-ancestor', requestedDeployCommit, sha], {
          cwd: repoRoot,
          stdio: 'ignore',
          timeout: 5_000,
        })
        if (ancestry.status !== 0) return null
      }
    }
    return { sha, deployedAt: info.mtimeMs }
  } catch { return null }
}
