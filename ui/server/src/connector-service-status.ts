// One conservative projection of the Mac Pro connector service. Feed incidents remain in run_ledger.ndjson;
// this module answers only whether the OS supervisor and its scheduled sweep prove the service is alive.
// Neither file is trusted by name alone: reads are bounded, no-follow and stable across the open/read window.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { DATA_DIR, REPO_ROOT } from './config'

export type ConnectorServiceState =
  | 'starting'
  | 'checking'
  | 'online'
  | 'paused_drive'
  | 'disabled_admin'
  | 'blocked_unsafe'
  | 'foreign_writer'

export interface ConnectorFetchServiceStatus {
  contractVersion: 2
  state: ConnectorServiceState
  note: string
  autoRetryArmed: boolean
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

export interface RunnerHeartbeatV1 {
  schema_version: 1
  service: 'connector-fetcher'
  state: 'running' | 'completed' | 'failed'
  interval_seconds: 900
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

export interface RunnerHeartbeatV2 extends Omit<RunnerHeartbeatV1, 'schema_version'> {
  schema_version: 2
  run_id: string
  deployed_commit: string
}

export type RunnerHeartbeat = RunnerHeartbeatV1 | RunnerHeartbeatV2

export interface ConnectorSupervisorSignal {
  schema_version: 1
  service: 'connector-supervisor'
  updated_at: string
  state: 'starting' | 'online' | 'paused_drive' | 'disabled_admin' | 'blocked_unsafe' | 'foreign_writer'
  reason: 'verified_first_sweep' | 'sweep_in_progress' | 'awaiting_heartbeat' | 'retry_cooldown'
    | 'transition_busy' | 'install_failed' | 'heartbeat_legacy' | 'heartbeat_invalid' | 'heartbeat_stale'
    | 'heartbeat_failed' | 'drive_unavailable' | 'pool_unconfigured' | 'pool_mismatch'
    | 'pool_identity_unsafe' | 'admin_role' | 'role_absent' | 'role_unsafe' | 'plist_unsafe'
    | 'foreign_heartbeat' | 'transition_unsafe'
  role: 'doer' | 'legacy_doer' | 'admin' | 'absent' | 'unsafe'
  pool: 'ready' | 'unavailable' | 'unconfigured' | 'mismatch' | 'unsafe'
  scheduler: 'loaded' | 'unloaded' | 'missing' | 'unsafe'
  ready: boolean
  auto_retry_armed: boolean
  activation_started_at: string | null
  last_attempt_at: string | null
  retry_not_before: string | null
  expected_host: string | null
  desired_commit: string | null
  expected_run_id: string | null
  observed_host: string | null
  deployed_commit: string | null
  run_id: string | null
}

const RUNNER_STATUS_PATH = path.join(DATA_DIR, '_connectors', 'runner_status.json')
const SUPERVISOR_STATUS_PATH = path.join(os.homedir(), '.nostra-ops', 'connector-supervisor.json')
const MAX_STATUS_BYTES = 32 * 1024
const INTERVAL_SECONDS = 900
const SUPERVISOR_FRESH_MS = 5 * 60_000
const RUNNER_FRESH_MS = 3 * INTERVAL_SECONDS * 1000
const FUTURE_TOLERANCE_MS = 5 * 60_000
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/
const SHA_RE = /^[0-9a-f]{40}$/
const RUN_ID_RE = /^[0-9a-f]{32}$/
const ERROR_RE = /^[a-z][a-z0-9_]{0,63}$/
const SAFE_HOST_RE = /^[^\u0000-\u0020\u007f]{1,255}$/

const RUNNER_V1_KEYS = new Set([
  'schema_version', 'service', 'state', 'interval_seconds', 'host', 'pid', 'sweep_started_at',
  'last_progress_at', 'sweep_completed_at', 'processed_rows', 'failed_rows', 'skipped_manifests', 'error_code',
])
const RUNNER_V2_KEYS = new Set([...RUNNER_V1_KEYS, 'run_id', 'deployed_commit'])
const SUPERVISOR_KEYS = new Set([
  'schema_version', 'service', 'updated_at', 'state', 'reason', 'role', 'pool', 'scheduler', 'ready',
  'auto_retry_armed', 'activation_started_at', 'last_attempt_at', 'retry_not_before', 'expected_host',
  'desired_commit', 'expected_run_id', 'observed_host', 'deployed_commit', 'run_id',
])
const SUPERVISOR_STATES = new Set(['starting', 'online', 'paused_drive', 'disabled_admin', 'blocked_unsafe', 'foreign_writer'])
const SUPERVISOR_REASONS = new Set([
  'verified_first_sweep', 'sweep_in_progress', 'awaiting_heartbeat', 'retry_cooldown', 'transition_busy',
  'install_failed', 'heartbeat_legacy', 'heartbeat_invalid', 'heartbeat_stale', 'heartbeat_failed',
  'drive_unavailable', 'pool_unconfigured', 'pool_mismatch', 'pool_identity_unsafe', 'admin_role',
  'role_absent', 'role_unsafe', 'plist_unsafe', 'foreign_heartbeat', 'transition_unsafe',
])
const STARTING_REASONS = new Set([
  'sweep_in_progress', 'awaiting_heartbeat', 'retry_cooldown', 'transition_busy', 'install_failed',
  'heartbeat_legacy', 'heartbeat_invalid', 'heartbeat_stale', 'heartbeat_failed',
])
const ROLES = new Set(['doer', 'legacy_doer', 'admin', 'absent', 'unsafe'])
const POOLS = new Set(['ready', 'unavailable', 'unconfigured', 'mismatch', 'unsafe'])
const SCHEDULERS = new Set(['loaded', 'unloaded', 'missing', 'unsafe'])

function exactKeys(value: Record<string, unknown>, keys: Set<string>): boolean {
  const actual = Object.keys(value)
  return actual.length === keys.size && actual.every((key) => keys.has(key))
}

function isoMs(value: unknown): number | null {
  if (typeof value !== 'string' || !ISO_RE.test(value)) return null
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed) || Number(value.slice(0, 4)) < 1) return null
  return new Date(parsed).toISOString() === `${value.slice(0, 23)}Z` ? parsed : null
}

function isoMicros(value: string): bigint {
  return BigInt(isoMs(value)!) * 1000n + BigInt(value.slice(23, 26))
}

const nonNegativeInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0
const safeHost = (value: unknown): value is string =>
  typeof value === 'string' && SAFE_HOST_RE.test(value)
const nullable = <T>(value: unknown, guard: (candidate: unknown) => candidate is T): value is T | null =>
  value === null || guard(value)
const timestamp = (value: unknown): value is string => isoMs(value) !== null

export function parseRunnerHeartbeat(raw: unknown): RunnerHeartbeat | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  const version = value.schema_version
  const keys = version === 1 ? RUNNER_V1_KEYS : version === 2 ? RUNNER_V2_KEYS : null
  if (!keys || !exactKeys(value, keys) || value.service !== 'connector-fetcher'
    || !['running', 'completed', 'failed'].includes(String(value.state))
    || value.interval_seconds !== INTERVAL_SECONDS || !safeHost(value.host)
    || !nonNegativeInt(value.pid) || value.pid === 0
    || isoMs(value.sweep_started_at) === null || isoMs(value.last_progress_at) === null
    || (value.sweep_completed_at !== null && isoMs(value.sweep_completed_at) === null)
    || !nonNegativeInt(value.processed_rows) || !nonNegativeInt(value.failed_rows)
    || !nonNegativeInt(value.skipped_manifests) || value.failed_rows > value.processed_rows
    || (value.error_code !== null && (typeof value.error_code !== 'string' || !ERROR_RE.test(value.error_code)))) return null
  if (version === 2 && (typeof value.run_id !== 'string' || !RUN_ID_RE.test(value.run_id)
    || typeof value.deployed_commit !== 'string' || !SHA_RE.test(value.deployed_commit))) return null
  const state = value.state as RunnerHeartbeat['state']
  if ((state === 'running' && (value.sweep_completed_at !== null || value.error_code !== null))
    || (state === 'completed' && (value.sweep_completed_at === null || value.error_code !== null))
    || (state === 'failed' && (value.sweep_completed_at === null || value.error_code === null))) return null
  const started = isoMicros(value.sweep_started_at as string)
  const progress = isoMicros(value.last_progress_at as string)
  const completed = value.sweep_completed_at === null ? null : isoMicros(value.sweep_completed_at as string)
  if (progress < started || (completed !== null && completed < progress)) return null
  return value as unknown as RunnerHeartbeat
}

export function parseConnectorSupervisor(raw: unknown): ConnectorSupervisorSignal | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  if (!exactKeys(value, SUPERVISOR_KEYS) || value.schema_version !== 1 || value.service !== 'connector-supervisor'
    || !timestamp(value.updated_at) || !SUPERVISOR_STATES.has(String(value.state))
    || !SUPERVISOR_REASONS.has(String(value.reason)) || !ROLES.has(String(value.role))
    || !POOLS.has(String(value.pool)) || !SCHEDULERS.has(String(value.scheduler))
    || typeof value.ready !== 'boolean' || typeof value.auto_retry_armed !== 'boolean'
    || !nullable(value.activation_started_at, timestamp) || !nullable(value.last_attempt_at, timestamp)
    || !nullable(value.retry_not_before, timestamp) || !nullable(value.expected_host, safeHost)
    || !nullable(value.observed_host, safeHost)
    || !nullable(value.desired_commit, (v): v is string => typeof v === 'string' && SHA_RE.test(v))
    || !nullable(value.deployed_commit, (v): v is string => typeof v === 'string' && SHA_RE.test(v))
    || !nullable(value.expected_run_id, (v): v is string => typeof v === 'string' && RUN_ID_RE.test(v))
    || !nullable(value.run_id, (v): v is string => typeof v === 'string' && RUN_ID_RE.test(v))) return null
  if (value.ready !== (value.state === 'online')) return null
  const updated = isoMicros(value.updated_at as string)
  const activation = value.activation_started_at === null ? null : isoMicros(value.activation_started_at as string)
  const lastAttempt = value.last_attempt_at === null ? null : isoMicros(value.last_attempt_at as string)
  const retryNotBefore = value.retry_not_before === null ? null : isoMicros(value.retry_not_before as string)
  if ((activation !== null && activation > updated) || (lastAttempt !== null && lastAttempt > updated)
    || (retryNotBefore !== null && retryNotBefore > updated + BigInt(FUTURE_TOLERANCE_MS) * 1000n)) return null
  const semanticState = value.state as ConnectorSupervisorSignal['state']
  if ((semanticState === 'online' && (value.reason !== 'verified_first_sweep'
      || !['doer', 'legacy_doer'].includes(String(value.role)) || value.pool !== 'ready'
      || value.scheduler !== 'loaded' || value.auto_retry_armed !== true))
    || (semanticState === 'starting' && (!STARTING_REASONS.has(String(value.reason))
      || (value.reason === 'transition_busy' && value.auto_retry_armed !== true)))
    || (semanticState === 'paused_drive' && (!['unloaded', 'missing'].includes(String(value.scheduler)) || !(
      (value.reason === 'drive_unavailable' && value.pool === 'unavailable')
      || (value.reason === 'pool_unconfigured' && value.pool === 'unconfigured')
      || (value.reason === 'pool_mismatch' && value.pool === 'mismatch'))))
    || (semanticState === 'disabled_admin' && !((value.role === 'admin' && value.reason === 'admin_role')
      || (value.role === 'absent' && value.reason === 'role_absent')))
    || (semanticState === 'disabled_admin' && !['unloaded', 'missing'].includes(String(value.scheduler)))
    || (semanticState === 'blocked_unsafe' && !(
      (value.reason === 'role_unsafe' && value.role === 'unsafe')
      || (value.reason === 'pool_identity_unsafe' && value.pool === 'unsafe')
      || (value.reason === 'plist_unsafe' && value.scheduler === 'unsafe')
      || (value.reason === 'transition_unsafe' && value.auto_retry_armed === false)))
    || (semanticState === 'foreign_writer' && (value.reason !== 'foreign_heartbeat'
      || !['unloaded', 'missing'].includes(String(value.scheduler))))) return null
  return value as unknown as ConnectorSupervisorSignal
}

function emptyStatus(state: ConnectorServiceState, note: string, autoRetryArmed = false): ConnectorFetchServiceStatus {
  return {
    contractVersion: 2, state, note, autoRetryArmed, intervalMin: INTERVAL_SECONDS / 60, host: null,
    lastStartedAt: null, lastProgressAt: null, lastCompletedAt: null, nextExpectedAt: null,
    processedRows: 0, failedRows: 0, skippedManifests: 0,
  }
}

function withRunner(base: ConnectorFetchServiceStatus, runner: RunnerHeartbeat | null): ConnectorFetchServiceStatus {
  if (!runner) return base
  const completedMs = runner.sweep_completed_at === null ? null : isoMs(runner.sweep_completed_at)
  return {
    ...base, host: runner.host, lastStartedAt: new Date(isoMs(runner.sweep_started_at)!).toISOString(),
    lastProgressAt: new Date(isoMs(runner.last_progress_at)!).toISOString(),
    lastCompletedAt: completedMs === null ? null : new Date(completedMs).toISOString(),
    nextExpectedAt: completedMs === null ? null : new Date(completedMs + runner.interval_seconds * 1000).toISOString(),
    processedRows: runner.processed_rows, failedRows: runner.failed_rows, skippedManifests: runner.skipped_manifests,
  }
}

export function classifyConnectorService(
  supervisor: ConnectorSupervisorSignal | null,
  runner: RunnerHeartbeat | null,
  nowMs = Date.now(),
  currentCommit: string | null = null,
  localHost: string | null = null,
): ConnectorFetchServiceStatus {
  if (!supervisor) return withRunner(emptyStatus('starting', 'Service status is not yet verified.'), runner)
  const updatedUs = isoMicros(supervisor.updated_at)
  const nowUs = BigInt(nowMs) * 1000n
  if (updatedUs > nowUs + BigInt(FUTURE_TOLERANCE_MS) * 1000n
    || nowUs - updatedUs > BigInt(SUPERVISOR_FRESH_MS) * 1000n) {
    return withRunner(emptyStatus('starting', 'Service status is stale, so Online cannot be verified.'), runner)
  }
  const retry = supervisor.auto_retry_armed
  if (supervisor.state === 'paused_drive') {
    const note = supervisor.reason === 'pool_unconfigured'
      ? 'This Mac has no data pool configured.'
      : supervisor.reason === 'pool_mismatch'
        ? 'This Mac points to a different data pool.'
        : 'Drive or the data pool is unavailable.'
    return withRunner(emptyStatus('paused_drive', note, retry), runner)
  }
  if (supervisor.state === 'disabled_admin') return withRunner(emptyStatus(
    'disabled_admin', supervisor.reason === 'role_absent'
      ? 'This Mac has no data-writer role.'
      : 'This Mac is configured as an admin, not the data writer.', retry,
  ), runner)
  if (supervisor.state === 'blocked_unsafe') {
    const note = supervisor.reason === 'role_unsafe'
      ? 'The data-writer role file failed a safety check.'
      : supervisor.reason === 'pool_identity_unsafe'
        ? 'The data pool identity failed a safety check.'
        : supervisor.reason === 'transition_unsafe'
          ? 'The scheduler transition lock failed a safety check.'
          : 'The scheduler setup failed a safety check.'
    return withRunner(emptyStatus('blocked_unsafe', note, retry), runner)
  }
  if (supervisor.state === 'foreign_writer') return withRunner(emptyStatus('foreign_writer', 'Another Mac is the active data writer.', retry), runner)
  if (supervisor.reason === 'heartbeat_failed') {
    return withRunner(emptyStatus('starting', 'The last scheduled check failed, so Online is not verified.', retry), runner)
  }
  if (supervisor.reason === 'heartbeat_invalid') {
    return withRunner(emptyStatus('starting', 'The latest check-in was invalid, so Online is not verified.', retry), runner)
  }
  if (supervisor.reason === 'heartbeat_stale') {
    return withRunner(emptyStatus('starting', 'The last scheduled check is stale, so Online is not verified.', retry), runner)
  }
  if (supervisor.reason === 'install_failed') {
    return withRunner(emptyStatus('starting', 'The service setup did not finish.', retry), runner)
  }
  if (supervisor.reason === 'retry_cooldown') {
    return withRunner(emptyStatus('starting', 'Waiting for the next safe retry window.', retry), runner)
  }
  if (supervisor.reason === 'transition_busy') {
    return withRunner(emptyStatus('starting', 'Another safe service update is in progress.', retry), runner)
  }
  if (!runner) return emptyStatus('starting', 'Waiting for a valid connector sweep.', retry)
  if (runner.schema_version !== 2) {
    return withRunner(emptyStatus('starting', 'A legacy sweep was seen, but it cannot prove this deployment is Online.', retry), runner)
  }

  const runnerSeen = runner.sweep_completed_at === null ? runner.last_progress_at : runner.sweep_completed_at
  const runnerSeenUs = isoMicros(runnerSeen)
  const runnerFreshWindow = runner.state === 'running'
    ? Math.max(4 * runner.interval_seconds * 1000, 60 * 60_000)
    : RUNNER_FRESH_MS
  const runnerFresh = runnerSeenUs <= nowUs + BigInt(FUTURE_TOLERANCE_MS) * 1000n
    && nowUs - runnerSeenUs < BigInt(runnerFreshWindow) * 1000n
  const identityMatches = supervisor.expected_host !== null && supervisor.expected_host === supervisor.observed_host
    && localHost !== null && supervisor.expected_host === localHost
    && supervisor.expected_host === runner.host && supervisor.desired_commit !== null
    && currentCommit !== null && supervisor.desired_commit === currentCommit
    && supervisor.desired_commit === supervisor.deployed_commit
    && supervisor.desired_commit === runner.deployed_commit && supervisor.expected_run_id !== null
    && supervisor.expected_run_id === supervisor.run_id && supervisor.expected_run_id === runner.run_id
  const activationUs = supervisor.activation_started_at === null ? null : isoMicros(supervisor.activation_started_at)
  const runnerStartedUs = isoMicros(runner.sweep_started_at)
  const startedAfterActivation = activationUs !== null && runnerStartedUs >= activationUs
    && runnerStartedUs <= updatedUs + BigInt(FUTURE_TOLERANCE_MS) * 1000n
    && runnerSeenUs <= updatedUs + BigInt(FUTURE_TOLERANCE_MS) * 1000n
  const base = withRunner(emptyStatus('starting', 'Waiting for a verified sweep from this deployment.', retry), runner)

  if (supervisor.state === 'starting' && supervisor.reason === 'sweep_in_progress'
    && supervisor.auto_retry_armed && runner.state === 'running'
    && identityMatches && startedAfterActivation && runnerFresh) {
    return { ...base, state: 'checking', note: `Checking feeds now (${runner.processed_rows} finished).` }
  }
  const online = supervisor.state === 'online' && supervisor.reason === 'verified_first_sweep'
    && ['doer', 'legacy_doer'].includes(supervisor.role) && supervisor.pool === 'ready'
    && supervisor.scheduler === 'loaded' && supervisor.ready && supervisor.auto_retry_armed && identityMatches && startedAfterActivation
    && runner.state === 'completed' && runner.processed_rows > 0 && runnerFresh
  if (online) return { ...base, state: 'online', note: 'Scheduled checks are Online and verified on this deployment.' }
  return base
}

interface ReadOptions {
  runnerPath?: string
  supervisorPath?: string
  nowMs?: number
  currentCommit?: string | null
  resolveCurrentCommit?: () => string | null
  localHost?: string | null
  /** Test-only race injector; production callers leave this unset. */
  statusReadHook?: (file: string, phase: 'after_lstat' | 'after_open') => void
}

function currentProdCommit(): string | null {
  let value: string | null = null
  try {
    const found = execFileSync('/usr/bin/git', ['rev-parse', '--verify', 'HEAD'], {
      cwd: REPO_ROOT, encoding: 'utf8', timeout: 2_000, stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    value = SHA_RE.test(found) ? found : null
  } catch { /* unavailable HEAD cannot prove Online */ }
  return value
}

function readJsonNoFollow(
  file: string,
  ownerOnly: boolean,
  hook?: (file: string, phase: 'after_lstat' | 'after_open') => void,
): unknown | null {
  let fd: number | null = null
  try {
    const parentPath = path.dirname(file)
    const parent = fs.lstatSync(parentPath)
    if (!parent.isDirectory() || parent.isSymbolicLink()) throw new Error('unsafe status directory')
    const before = fs.lstatSync(file)
    if (!before.isFile() || before.isSymbolicLink() || before.size <= 0 || before.size > MAX_STATUS_BYTES) {
      throw new Error('unsafe status file')
    }
    const uid = typeof process.getuid === 'function' ? process.getuid() : before.uid
    if (before.uid !== uid || before.nlink !== 1 || (before.mode & 0o022) !== 0
      || (ownerOnly && (parent.uid !== uid || (parent.mode & 0o022) !== 0 || (before.mode & 0o077) !== 0))) {
      throw new Error('status file is not safely owned')
    }
    hook?.(file, 'after_lstat')
    fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const opened = fs.fstatSync(fd)
    if (!opened.isFile() || opened.size !== before.size || opened.dev !== before.dev || opened.ino !== before.ino
      || opened.uid !== before.uid || opened.nlink !== before.nlink || opened.mode !== before.mode
      || opened.uid !== uid || opened.nlink !== 1 || (opened.mode & 0o022) !== 0
      || (ownerOnly && (opened.mode & 0o077) !== 0)) {
      throw new Error('status file changed during open')
    }
    hook?.(file, 'after_open')
    const bytes = Buffer.alloc(opened.size)
    if (fs.readSync(fd, bytes, 0, opened.size, 0) !== opened.size) throw new Error('short status read')
    const after = fs.fstatSync(fd)
    const named = fs.lstatSync(file)
    const parentAfter = fs.lstatSync(parentPath)
    if (after.dev !== opened.dev || after.ino !== opened.ino || after.size !== opened.size
      || after.mtimeMs !== opened.mtimeMs || after.ctimeMs !== opened.ctimeMs || after.uid !== opened.uid
      || after.nlink !== opened.nlink || after.mode !== opened.mode || named.isSymbolicLink()
      || named.dev !== opened.dev || named.ino !== opened.ino || named.size !== opened.size
      || named.mtimeMs !== opened.mtimeMs || named.ctimeMs !== opened.ctimeMs || named.uid !== opened.uid
      || named.nlink !== opened.nlink || named.mode !== opened.mode
      || after.uid !== uid || after.nlink !== 1 || (after.mode & 0o022) !== 0
      || named.uid !== uid || named.nlink !== 1 || (named.mode & 0o022) !== 0
      || (ownerOnly && ((after.mode & 0o077) !== 0 || (named.mode & 0o077) !== 0))
      || !parentAfter.isDirectory() || parentAfter.isSymbolicLink()
      || parentAfter.dev !== parent.dev || parentAfter.ino !== parent.ino || parentAfter.uid !== parent.uid
      || parentAfter.mode !== parent.mode || parentAfter.mtimeMs !== parent.mtimeMs
      || parentAfter.ctimeMs !== parent.ctimeMs || parentAfter.nlink !== parent.nlink
      || (ownerOnly && (parentAfter.uid !== uid || (parentAfter.mode & 0o022) !== 0))) {
      throw new Error('status file changed during read')
    }
    return JSON.parse(bytes.toString('utf8'))
  } catch {
    return null
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

export function readConnectorFetchServiceStatus(poolAvailable: boolean, options: ReadOptions = {}): ConnectorFetchServiceStatus {
  const supervisor = parseConnectorSupervisor(readJsonNoFollow(
    options.supervisorPath ?? SUPERVISOR_STATUS_PATH, true, options.statusReadHook,
  ))
  const runner = parseRunnerHeartbeat(readJsonNoFollow(
    options.runnerPath ?? RUNNER_STATUS_PATH, false, options.statusReadHook,
  ))
  const nowMs = options.nowMs ?? Date.now()
  // Resolve HEAD on every projection. A short cache can leave Online green across a production fast-forward.
  const currentCommit = options.currentCommit === undefined
    ? (options.resolveCurrentCommit ? options.resolveCurrentCommit() : currentProdCommit())
    : options.currentCommit
  const localHost = options.localHost === undefined ? (() => {
    const value = os.hostname().trim()
    return safeHost(value) ? value : null
  })() : options.localHost
  const projected = classifyConnectorService(supervisor, runner, nowMs, currentCommit, localHost)
  if (!poolAvailable && !['paused_drive', 'disabled_admin', 'blocked_unsafe', 'foreign_writer'].includes(projected.state)) {
    // A missing local pool does not prove that a loaded writer was fenced. Only the supervisor may certify
    // Paused — Drive after it has unloaded the scheduler; otherwise fail closed without promising auto-retry.
    return withRunner(emptyStatus('starting', 'The data pool is unavailable, and scheduler shutdown is not verified.'), runner)
  }
  return projected
}
