// Operational heartbeat for the OS-level connector fetcher.  This is deliberately separate from
// run_ledger.ndjson: the ledger answers "what happened to this feed?", while this file answers the
// root-cause question "is the scheduled service itself alive?".  A stopped scheduler must therefore
// surface as one incident instead of making every never-run feed look independently broken.
//
// The Python runner owns data/_connectors/runner_status.json and replaces it atomically.  This reader is
// read-only, size-bounded and no-follow.  Malformed or stale telemetry never makes a feed usable; it only
// changes the operational explanation shown by the Data Library.
import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config'

export type ConnectorFetchServiceState = 'online' | 'running' | 'late' | 'failed' | 'not_started' | 'unknown'

export interface ConnectorFetchServiceStatus {
  state: ConnectorFetchServiceState
  note: string
  intervalMin: number
  host: string | null
  lastStartedAt: string | null
  lastProgressAt: string | null
  lastCompletedAt: string | null
  nextExpectedAt: string | null
  processedRows: number
  failedRows: number
  skippedManifests: number
}

interface RunnerHeartbeat {
  schema_version: 1
  service: 'connector-fetcher'
  state: 'running' | 'completed' | 'failed'
  interval_seconds: number
  host: string
  pid: number
  sweep_started_at: string
  last_progress_at: string
  sweep_completed_at: string | null
  processed_rows: number
  failed_rows: number
  skipped_manifests: number
  error_code: string | null
}

const STATUS_PATH = path.join(DATA_DIR, '_connectors', 'runner_status.json')
const MAX_STATUS_BYTES = 32 * 1024
const DEFAULT_INTERVAL_MIN = 15
const RUNNER_INTERVAL_SECONDS = 900
const RUNNER_HEARTBEAT_KEYS = new Set([
  'schema_version', 'service', 'state', 'interval_seconds', 'host', 'pid', 'sweep_started_at',
  'last_progress_at', 'sweep_completed_at', 'processed_rows', 'failed_rows', 'skipped_manifests', 'error_code',
])
const RUNNER_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/

const isoMs = (value: unknown): number | null => {
  if (typeof value !== 'string' || !RUNNER_ISO_RE.test(value)) return null
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed) || Number(value.slice(0, 4)) < 1) return null
  // Date.parse normalizes impossible calendar values (for example 31 April) into a different valid day.
  // The producer's Python datetime rejects them, so require the parsed UTC millisecond prefix to round-trip
  // exactly; the final three microsecond digits remain precision that JavaScript cannot represent.
  return new Date(parsed).toISOString() === `${value.slice(0, 23)}Z` ? parsed : null
}
const nonNegativeInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0

export function parseRunnerHeartbeat(raw: unknown): RunnerHeartbeat | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  const keys = Object.keys(value)
  if (keys.length !== RUNNER_HEARTBEAT_KEYS.size || keys.some((key) => !RUNNER_HEARTBEAT_KEYS.has(key))) return null
  const interval = value.interval_seconds
  if (value.schema_version !== 1 || value.service !== 'connector-fetcher'
    || !['running', 'completed', 'failed'].includes(String(value.state))
    || interval !== RUNNER_INTERVAL_SECONDS
    || typeof value.host !== 'string' || !value.host.trim() || value.host.length > 255
    || /[\u0000-\u001f\u007f]/.test(value.host)
    || !nonNegativeInt(value.pid) || value.pid === 0
    || isoMs(value.sweep_started_at) === null || isoMs(value.last_progress_at) === null
    || (value.sweep_completed_at !== null && isoMs(value.sweep_completed_at) === null)
    || !nonNegativeInt(value.processed_rows) || !nonNegativeInt(value.failed_rows)
    || !nonNegativeInt(value.skipped_manifests)
    || value.failed_rows > value.processed_rows
    || (value.error_code !== null && (typeof value.error_code !== 'string'
      || !/^[a-z][a-z0-9_]{0,63}$/.test(value.error_code)))) return null
  const state = value.state as RunnerHeartbeat['state']
  if ((state === 'running' && (value.sweep_completed_at !== null || value.error_code !== null))
    || (state === 'completed' && (value.sweep_completed_at === null || value.error_code !== null))
    || (state === 'failed' && (value.sweep_completed_at === null || value.error_code === null))) return null
  const started = isoMs(value.sweep_started_at)!
  const progress = isoMs(value.last_progress_at)!
  const completed = value.sweep_completed_at === null ? null : isoMs(value.sweep_completed_at)!
  if (progress < started || (completed !== null && completed < progress)) return null
  return value as unknown as RunnerHeartbeat
}

export function classifyConnectorFetchService(raw: RunnerHeartbeat | null, nowMs = Date.now()): ConnectorFetchServiceStatus {
  if (!raw) {
    return {
      state: 'not_started', note: 'No scheduled connector sweep has checked in yet.',
      intervalMin: DEFAULT_INTERVAL_MIN, host: null, lastStartedAt: null, lastProgressAt: null,
      lastCompletedAt: null, nextExpectedAt: null, processedRows: 0, failedRows: 0, skippedManifests: 0,
    }
  }
  const intervalMs = raw.interval_seconds * 1000
  // Three missed schedule ticks is enough to call a service late, while progress updates keep a legitimately
  // long initial sweep alive.  Never accept a future heartbeat as proof of health (clock skew → unknown).
  const lateAfterMs = raw.state === 'running'
    ? Math.max(intervalMs * 4, 60 * 60_000)
    : Math.max(intervalMs * 3, 45 * 60_000)
  const progressMs = isoMs(raw.last_progress_at)!
  const completedMs = raw.sweep_completed_at === null ? null : isoMs(raw.sweep_completed_at)
  const seenMs = raw.state === 'completed' && completedMs !== null ? completedMs : progressMs
  const future = seenMs > nowMs + 5 * 60_000
  const late = nowMs - seenMs >= lateAfterMs
  const lastCompletedAt = completedMs === null ? null : new Date(completedMs).toISOString()
  const nextExpectedAt = completedMs === null ? null : new Date(completedMs + intervalMs).toISOString()

  let state: ConnectorFetchServiceState
  let note: string
  if (future) {
    state = 'unknown'; note = 'The connector-service clock is ahead of this server, so health cannot be proven.'
  } else if (late) {
    state = 'late'; note = 'The scheduled data service missed at least three check-ins; the Mac watchdog will restart it.'
  } else if (raw.state === 'failed') {
    state = 'failed'; note = 'The last connector sweep stopped unexpectedly; the Mac scheduler will retry it.'
  } else if (raw.state === 'running') {
    state = 'running'; note = `The data service is checking feeds now (${raw.processed_rows} finished so far).`
  } else {
    state = 'online'; note = 'The scheduled data service is online.'
  }
  return {
    state, note, intervalMin: raw.interval_seconds / 60, host: raw.host,
    lastStartedAt: new Date(isoMs(raw.sweep_started_at)!).toISOString(),
    lastProgressAt: new Date(progressMs).toISOString(), lastCompletedAt, nextExpectedAt,
    processedRows: raw.processed_rows, failedRows: raw.failed_rows, skippedManifests: raw.skipped_manifests,
  }
}

export function readConnectorFetchServiceStatus(poolAvailable: boolean): ConnectorFetchServiceStatus {
  if (!poolAvailable) {
    return {
      state: 'unknown', note: 'The data pool is not mounted on this host, so scheduler health is not visible here.',
      intervalMin: DEFAULT_INTERVAL_MIN, host: null, lastStartedAt: null, lastProgressAt: null,
      lastCompletedAt: null, nextExpectedAt: null, processedRows: 0, failedRows: 0, skippedManifests: 0,
    }
  }
  let fd: number | null = null
  try {
    const before = fs.lstatSync(STATUS_PATH)
    if (!before.isFile() || before.isSymbolicLink() || before.size <= 0 || before.size > MAX_STATUS_BYTES) {
      throw new Error('unsafe status file')
    }
    fd = fs.openSync(STATUS_PATH, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const opened = fs.fstatSync(fd)
    if (!opened.isFile() || opened.size !== before.size || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error('status file changed during open')
    }
    const bytes = Buffer.alloc(opened.size)
    const read = fs.readSync(fd, bytes, 0, opened.size, 0)
    if (read !== opened.size) throw new Error('short status read')
    const after = fs.fstatSync(fd)
    if (after.dev !== opened.dev || after.ino !== opened.ino || after.size !== opened.size
      || after.mtimeMs !== opened.mtimeMs) throw new Error('status file changed during read')
    const parsed = parseRunnerHeartbeat(JSON.parse(bytes.toString('utf8')))
    if (!parsed) throw new Error('invalid status contract')
    return classifyConnectorFetchService(parsed)
  } catch (error: any) {
    if (error?.code === 'ENOENT') return classifyConnectorFetchService(null)
    return {
      state: 'unknown', note: 'The connector-service heartbeat is unreadable, so service health cannot be proven.',
      intervalMin: DEFAULT_INTERVAL_MIN, host: null, lastStartedAt: null, lastProgressAt: null,
      lastCompletedAt: null, nextExpectedAt: null, processedRows: 0, failedRows: 0, skippedManifests: 0,
    }
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}
