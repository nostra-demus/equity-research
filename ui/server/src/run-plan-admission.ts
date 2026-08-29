import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'

export type RunPlanRequestStatus = 'claimed' | 'admitted' | 'started' | 'failed_before_start'

export interface RunPlanRequestRecord {
  version: 1
  requestId: string
  planFingerprint: string
  user: string
  subject: string
  status: RunPlanRequestStatus
  createdAt: string
  updatedAt: string
  instanceId: string
  runId?: string
  response?: Record<string, unknown>
  failure?: string
}

export interface RunPlanRequestIntent {
  requestId: string
  planFingerprint: string
  user: string
  subject: string
}

export type RunPlanRequestClaim =
  | { kind: 'new'; record: RunPlanRequestRecord }
  | { kind: 'replay'; record: RunPlanRequestRecord }
  | { kind: 'in_progress'; record: RunPlanRequestRecord }
  | { kind: 'conflict'; record: RunPlanRequestRecord }

const INSTANCE_ID = crypto.randomUUID()
const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FINGERPRINT = /^sha256:[a-f0-9]{64}$/

function requestDir(stateDir: string): string {
  return path.join(path.resolve(stateDir), 'run-plan-requests')
}

function requestPath(requestId: string, stateDir: string): string {
  if (!REQUEST_ID.test(requestId)) throw new Error('invalid run-plan request id')
  return path.join(requestDir(stateDir), `${requestId.toLowerCase()}.json`)
}

async function ensurePrivateDirectory(directory: string): Promise<void> {
  try {
    const info = await fs.promises.lstat(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('run-plan request directory is unsafe')
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
    await fs.promises.mkdir(directory, { recursive: true, mode: 0o700 })
    const info = await fs.promises.lstat(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('run-plan request directory is unsafe')
  }
  await fs.promises.chmod(directory, 0o700)
}

async function syncDirectory(directory: string): Promise<void> {
  if (process.platform === 'win32') return
  let handle: fs.promises.FileHandle | null = null
  try {
    handle = await fs.promises.open(directory, fs.constants.O_RDONLY)
    await handle.sync()
  } finally {
    await handle?.close()
  }
}

function validRecord(value: unknown): value is RunPlanRequestRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return row.version === 1 && typeof row.requestId === 'string' && REQUEST_ID.test(row.requestId)
    && typeof row.planFingerprint === 'string' && FINGERPRINT.test(row.planFingerprint)
    && typeof row.user === 'string' && typeof row.subject === 'string'
    && ['claimed', 'admitted', 'started', 'failed_before_start'].includes(String(row.status))
    && typeof row.createdAt === 'string' && typeof row.updatedAt === 'string'
    && typeof row.instanceId === 'string'
}

async function readRecord(requestId: string, stateDir: string): Promise<RunPlanRequestRecord | null> {
  try {
    const target = requestPath(requestId, stateDir)
    const stat = await fs.promises.lstat(target)
    if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) return null
    const value = JSON.parse(await fs.promises.readFile(target, 'utf8'))
    return validRecord(value) ? value : null
  } catch {
    return null
  }
}

async function atomicWrite(record: RunPlanRequestRecord, stateDir: string, exclusive = false): Promise<void> {
  const directory = requestDir(stateDir)
  await ensurePrivateDirectory(directory)
  const target = requestPath(record.requestId, stateDir)
  if (exclusive) {
    const handle = await fs.promises.open(target, 'wx', 0o600)
    try {
      await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8')
      await handle.sync()
    } finally {
      await handle.close()
    }
    await syncDirectory(directory)
    return
  }
  const staged = path.join(directory, `.${record.requestId}.${process.pid}.${crypto.randomUUID()}.tmp`)
  const handle = await fs.promises.open(staged, 'wx', 0o600)
  try {
    await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
  await fs.promises.rename(staged, target)
  await syncDirectory(directory)
}

function sameIntent(record: RunPlanRequestRecord, intent: RunPlanRequestIntent): boolean {
  return record.requestId.toLowerCase() === intent.requestId.toLowerCase()
    && record.planFingerprint === intent.planFingerprint
    && record.user === intent.user
    && record.subject === intent.subject
}

export async function claimRunPlanRequest(
  intent: RunPlanRequestIntent,
  stateDir: string = STATE_DIR,
): Promise<RunPlanRequestClaim> {
  const existing = await readRecord(intent.requestId, stateDir)
  if (existing) {
    if (!sameIntent(existing, intent)) return { kind: 'conflict', record: existing }
    if (existing.status === 'admitted' || existing.status === 'started') return { kind: 'replay', record: existing }
    if (existing.status === 'claimed' && existing.instanceId === INSTANCE_ID) {
      return { kind: 'in_progress', record: existing }
    }
    const reclaimed: RunPlanRequestRecord = {
      ...existing,
      status: 'claimed',
      updatedAt: new Date().toISOString(),
      instanceId: INSTANCE_ID,
      failure: undefined,
    }
    await atomicWrite(reclaimed, stateDir)
    return { kind: 'new', record: reclaimed }
  }

  const now = new Date().toISOString()
  const record: RunPlanRequestRecord = {
    version: 1,
    requestId: intent.requestId.toLowerCase(),
    planFingerprint: intent.planFingerprint,
    user: intent.user,
    subject: intent.subject,
    status: 'claimed',
    createdAt: now,
    updatedAt: now,
    instanceId: INSTANCE_ID,
  }
  try {
    await atomicWrite(record, stateDir, true)
    return { kind: 'new', record }
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
    const raced = await readRecord(intent.requestId, stateDir)
    if (!raced) throw new Error('run-plan request receipt is unreadable')
    if (!sameIntent(raced, intent)) return { kind: 'conflict', record: raced }
    if (raced.status === 'admitted' || raced.status === 'started') return { kind: 'replay', record: raced }
    if (raced.status === 'claimed' && raced.instanceId === INSTANCE_ID) return { kind: 'in_progress', record: raced }
    const reclaimed: RunPlanRequestRecord = {
      ...raced, status: 'claimed', updatedAt: new Date().toISOString(), instanceId: INSTANCE_ID,
      failure: undefined,
    }
    await atomicWrite(reclaimed, stateDir)
    return { kind: 'new', record: reclaimed }
  }
}

async function updateRunPlanRequest(
  requestId: string,
  mutate: (record: RunPlanRequestRecord) => RunPlanRequestRecord,
  stateDir: string,
): Promise<RunPlanRequestRecord> {
  const record = await readRecord(requestId, stateDir)
  if (!record) throw new Error('run-plan request receipt is missing or unsafe')
  const next = mutate(record)
  await atomicWrite({ ...next, updatedAt: new Date().toISOString() }, stateDir)
  return next
}

export async function markRunPlanAdmitted(
  requestId: string,
  runId: string,
  response: Record<string, unknown>,
  stateDir: string = STATE_DIR,
): Promise<RunPlanRequestRecord> {
  return updateRunPlanRequest(requestId, (record) => ({
    ...record,
    status: record.status === 'started' ? 'started' : 'admitted',
    runId,
    response,
  }), stateDir)
}

export async function markRunPlanStarted(requestId: string, stateDir: string = STATE_DIR): Promise<RunPlanRequestRecord> {
  return updateRunPlanRequest(requestId, (record) => record.status === 'started'
    ? record
    : { ...record, status: 'started' }, stateDir)
}

export async function markRunPlanFailedBeforeStart(
  requestId: string,
  failure: string,
  stateDir: string = STATE_DIR,
): Promise<RunPlanRequestRecord> {
  return updateRunPlanRequest(requestId, (record) => record.status === 'started'
    ? record
    : { ...record, status: 'failed_before_start', failure: failure.slice(0, 500) }, stateDir)
}

export function readRunPlanRequest(requestId: string, stateDir: string = STATE_DIR): Promise<RunPlanRequestRecord | null> {
  return readRecord(requestId, stateDir)
}
