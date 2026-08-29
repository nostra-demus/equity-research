import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
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
const TERMINAL_STATUSES = new Set<PendingAdmissionStatus>(['started', 'needs_attention', 'cancelled'])
const execFileAsync = promisify(execFile)
const ancestryCache = new Map<string, boolean>()

function recordsDir(stateDir: string): string {
  return path.join(path.resolve(stateDir), 'pending-admissions')
}

function archiveDir(stateDir: string, status: 'started' | 'needs_attention' | 'cancelled'): string {
  return path.join(path.resolve(stateDir), 'pending-admissions-archive', status)
}

function recordPathIn(requestId: string, directory: string): string {
  if (!REQUEST_ID.test(requestId)) throw new Error('invalid pending-admission request id')
  return path.join(directory, `${requestId.toLowerCase()}.json`)
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
  // Windows raises EPERM opening a directory for fsync and does not support fsync on one at all;
  // the durability this buys is a POSIX guarantee, so skip it there rather than fail the write.
  if (process.platform === 'win32') return
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
    && Array.isArray(receipt.reusableOrbKeys) && receipt.reusableOrbKeys.every((k: unknown) => typeof k === 'string')
    && Array.isArray(receipt.payableOrbKeys) && receipt.payableOrbKeys.every((k: unknown) => typeof k === 'string')
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

function readFileAt(requestId: string, directory: string): PendingAdmissionRecord | null {
  try {
    const target = recordPathIn(requestId, directory)
    const info = fs.lstatSync(target)
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) !== 0 || info.nlink !== 1) return null
    const value = JSON.parse(fs.readFileSync(target, 'utf8'))
    return validRecord(value) ? value : null
  } catch { return null }
}

function locateRecord(requestId: string, stateDir: string): { record: PendingAdmissionRecord; directory: string } | null {
  const active = recordsDir(stateDir)
  const record = readFileAt(requestId, active)
  if (record) return { record, directory: active }
  for (const status of ['started', 'needs_attention', 'cancelled'] as const) {
    const archive = archiveDir(stateDir, status)
    const archived = readFileAt(requestId, archive)
    if (archived) return { record: archived, directory: archive }
  }
  return null
}

function atomicWrite(record: PendingAdmissionRecord, directory: string, exclusive = false): void {
  ensurePrivateDirectory(directory)
  const target = recordPathIn(record.requestId, directory)
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

function moveRecord(requestId: string, sourceDirectory: string, targetDirectory: string): void {
  ensurePrivateDirectory(targetDirectory)
  const source = recordPathIn(requestId, sourceDirectory)
  const target = recordPathIn(requestId, targetDirectory)
  fs.renameSync(source, target)
  syncDirectory(sourceDirectory)
  syncDirectory(targetDirectory)
}

function directoryForStatus(status: PendingAdmissionStatus, stateDir: string): string {
  return TERMINAL_STATUSES.has(status)
    ? archiveDir(stateDir, status as 'started' | 'needs_attention' | 'cancelled')
    : recordsDir(stateDir)
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
  const existing = locateRecord(requestId, stateDir)?.record ?? null
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
    atomicWrite(record, recordsDir(stateDir), true)
    return { kind: 'new', record }
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
    const raced = locateRecord(requestId, stateDir)?.record ?? null
    if (!raced) throw new Error('pending-admission receipt is unreadable')
    return sameIntent(raced, intent) ? { kind: 'existing', record: raced } : { kind: 'conflict', record: raced }
  }
}

function update(
  requestId: string,
  mutate: (record: PendingAdmissionRecord) => PendingAdmissionRecord,
  stateDir: string,
): PendingAdmissionRecord {
  const located = locateRecord(requestId, stateDir)
  if (!located) throw new Error('pending admission is missing or unsafe')
  const { record } = located
  const next = { ...mutate(record), updatedAt: new Date().toISOString() }
  if (!validRecord(next)) throw new Error('pending admission update is invalid')
  atomicWrite(next, located.directory)
  const destination = directoryForStatus(next.status, stateDir)
  if (located.directory !== destination) moveRecord(requestId, located.directory, destination)
  return next
}

export function readPendingAdmission(requestId: string, stateDir: string = STATE_DIR): PendingAdmissionRecord | null {
  return locateRecord(requestId, stateDir)?.record ?? null
}

function listDirectory(directory: string): PendingAdmissionRecord[] {
  let names: string[]
  try {
    const info = fs.lstatSync(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) return []
    names = fs.readdirSync(directory)
  } catch { return [] }
  return names
    .filter((name) => REQUEST_ID.test(name.replace(/\.json$/, '')) && name.endsWith('.json'))
    .map((name) => readFileAt(name.slice(0, -5), directory))
    .filter((record): record is PendingAdmissionRecord => Boolean(record))
}

export function listPendingAdmissions(
  stateDir: string = STATE_DIR,
  includeNeedsAttention = false,
): PendingAdmissionRecord[] {
  return [
    ...listDirectory(recordsDir(stateDir)),
    ...(includeNeedsAttention ? listDirectory(archiveDir(stateDir, 'needs_attention')) : []),
  ]
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

/** A deployment may remove paid work from Continue (a saving), but it may not add spend the user never
 * reviewed. Full remains the separately typed action and is therefore evaluated as a full plan. */
export function pendingPlanMayAutoStart(
  action: PendingAdmissionAction,
  difference: NonNullable<PendingAdmissionRecord['planDifference']>,
): boolean {
  return action === 'full' || difference.addedPayableOrbKeys.length === 0
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
    return info.mtimeMs >= queuedAt ? { sha, failedAt } : null
  } catch { return null }
}

/** Successful deployment proof is the deployer's atomically replaced marker, not the absence of intent.
 * Its mtime must post-date the click, which also permits coalescing onto a newer all-green commit without
 * pretending an old marker admitted the request. */
export async function deploymentSucceededAfter(
  createdAt: string,
  requestedDeployCommit?: string | null,
  opsDir: string = path.join(os.homedir(), '.nostra-ops'),
  repoRoot: string = REPO_ROOT,
): Promise<{ sha: string; deployedAt: number } | null> {
  try {
    const successReceipt = path.join(path.resolve(opsDir), '.deploy.succeeded')
    const legacyMarker = path.join(path.resolve(opsDir), '.deployed.sha')
    const target = fs.existsSync(successReceipt) ? successReceipt : legacyMarker
    const info = fs.lstatSync(target)
    const ownedByProcess = typeof process.getuid !== 'function' || info.uid === process.getuid()
    if (!info.isFile() || info.isSymbolicLink() || !ownedByProcess
        || info.nlink !== 1 || (info.mode & 0o022) !== 0 || info.size > 256) return null
    const parts = fs.readFileSync(target, 'utf8').trim().split(/\s+/)
    const [sha] = parts
    const queuedAt = Date.parse(createdAt)
    const stampedAt = target === successReceipt ? Number(parts[1]) : info.mtimeMs
    if (!SHA.test(sha) || !Number.isFinite(queuedAt) || !Number.isSafeInteger(Math.trunc(stampedAt))
        || stampedAt < queuedAt) return null
    // A newer all-green commit may coalesce the requested release, but an unrelated/older marker cannot.
    // Prove ancestry in the local production repository instead of trusting timestamps alone.
    if (requestedDeployCommit) {
      if (!SHA.test(requestedDeployCommit)) return null
      if (sha !== requestedDeployCommit) {
        const key = `${path.resolve(repoRoot)}\0${requestedDeployCommit}\0${sha}`
        let isAncestor = ancestryCache.get(key)
        if (isAncestor === undefined) {
          try {
            await execFileAsync('git', ['merge-base', '--is-ancestor', requestedDeployCommit, sha], {
              cwd: repoRoot,
              timeout: 5_000,
            })
            isAncestor = true
          } catch { isAncestor = false }
          ancestryCache.set(key, isAncestor)
          if (ancestryCache.size > 256) ancestryCache.delete(ancestryCache.keys().next().value!)
        }
        if (!isAncestor) return null
      }
    }
    return { sha, deployedAt: stampedAt }
  } catch { return null }
}
