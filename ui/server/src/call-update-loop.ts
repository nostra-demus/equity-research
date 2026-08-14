import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'
import { acquireSingletonLock, releaseSingletonLock } from './singleton-lock'
import type { RunStatus } from './types'

export interface AutomaticCallPlan {
  key: string
  ticker: string
  runRoot: string
  planSha256: string
  decisionFingerprint: string
  targetRunRoot?: string | null
  input: {
    ticker: string
    swarm: string
    runRoot: string
    decisionFingerprint: string
    planPath: string
    planSha256: string
    sourceDecisionFingerprint: string
  }
}

export function automaticCallPlanKey(plan: {
  ticker: string
  runRoot: string
  planSha256: string
  decisionFingerprint: string
}): string {
  return [plan.ticker, plan.runRoot, plan.decisionFingerprint, plan.planSha256].join('|')
}

export interface AutomaticCallLaunch {
  runId: string
  /** True only when exact result bytes are already present in shared Git authority. */
  durable?: boolean
  targetRunRoot?: string | null
}

export interface AutomaticCallUpdateDeps {
  discover: () => AutomaticCallPlan[]
  execute: (
    plan: AutomaticCallPlan,
    onTerminal: (status: RunStatus) => void,
  ) => Promise<AutomaticCallLaunch>
  requestAnalysis?: (ticker: string) => void
  now?: () => number
}

type JobStatus = 'queued' | 'launching' | 'running' | 'verifying' | 'retry_wait' | 'done' | 'held'

interface AutomaticCallJob {
  key: string
  ticker: string
  run_root: string
  plan_sha256: string
  decision_fingerprint: string
  target_run_root: string | null
  /** A paid attempt finished locally, but its exact result still needs shared-publication proof. */
  publication_pending: boolean
  input: AutomaticCallPlan['input'] | null
  status: JobStatus
  active: boolean
  attempts: number
  run_id: string | null
  last_error: string | null
  next_attempt_at: string | null
  lease_expires_at: string | null
  created_at: string
  updated_at: string
}

interface AutomaticCallState {
  version: 1
  updated_at: string
  last_checked_at: string | null
  next_check_at: string | null
  jobs: Record<string, AutomaticCallJob>
}

export interface AutomaticCallUpdateStatus {
  enabled: boolean
  state: 'watching' | 'checking' | 'needs_attention'
  message: string
  last_checked_at: string | null
  next_check_at: string | null
  queued: number
  running: number
}

export interface AutomaticCallLoopOptions {
  enabled?: boolean
  intervalMs?: number
  initialDelayMs?: number
  stateDir?: string
  runningLeaseMs?: number
  retryBaseMs?: number
  retryMaxMs?: number
}

const STATE_FILE = 'automatic-call-updates.json'
const INITIALIZED_FILE = 'automatic-call-updates.initialized'
const INITIALIZING_FILE = 'automatic-call-updates.initializing'
const INITIALIZED_BYTES = 'automatic-call-updates-v1\n'
const INITIALIZING_BYTES = 'automatic-call-updates-first-write-v1\n'
const LOCK_FILE = 'automatic-call-updates.lock'
const DEFAULT_INTERVAL_MS = 60_000
const DEFAULT_RUNNING_LEASE_MS = 6 * 60 * 60_000
const DEFAULT_RETRY_BASE_MS = 60_000
const DEFAULT_RETRY_MAX_MS = 60 * 60_000
const MAX_RETAINED_JOBS = 300

let loopTimer: ReturnType<typeof setTimeout> | null = null
let loopRunning = false
let schedulerPassRunning = false
let singletonStateDir: string | null = null
let singletonDeps: AutomaticCallUpdateDeps | null = null
let singletonOptions: Required<AutomaticCallLoopOptions> | null = null
let memoryState: { stateDir: string; state: AutomaticCallState } | null = null
const unavailableState = new Map<string, string>()
const loopStartProblems = new Map<string, string>()
const reconciliationProblems = new Map<string, string>()

const iso = (ms: number): string => new Date(ms).toISOString()

function emptyState(now: number): AutomaticCallState {
  return { version: 1, updated_at: iso(now), last_checked_at: null, next_check_at: null, jobs: {} }
}

function statePath(stateDir: string): string {
  return path.join(stateDir, STATE_FILE)
}

function initializedPath(stateDir: string): string {
  return path.join(stateDir, INITIALIZED_FILE)
}

function initializingPath(stateDir: string): string {
  return path.join(stateDir, INITIALIZING_FILE)
}

function exactMarker(pathname: string, expected: string): boolean {
  try {
    const stat = fs.lstatSync(pathname)
    if (!stat.isFile() || stat.isSymbolicLink() || fs.readFileSync(pathname, 'utf8') !== expected) {
      throw new Error(`automatic call marker ${path.basename(pathname)} is unsafe`)
    }
    return true
  } catch (error: any) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function missingUsedState(stateDir: string): boolean {
  return exactMarker(initializedPath(stateDir), INITIALIZED_BYTES)
}

function firstWriteWasInterrupted(stateDir: string): boolean {
  return exactMarker(initializingPath(stateDir), INITIALIZING_BYTES)
}

function createMarker(pathname: string, bytes: string): void {
  let fd: number | null = null
  try {
    fd = fs.openSync(pathname, 'wx', 0o600)
    fs.writeFileSync(fd, bytes, 'utf8')
    fs.fsyncSync(fd)
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
    exactMarker(pathname, bytes)
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

function ensureFirstWriteIntent(stateDir: string): void {
  if (missingUsedState(stateDir)) return
  createMarker(initializingPath(stateDir), INITIALIZING_BYTES)
}

function completeFirstWrite(stateDir: string): void {
  createMarker(initializedPath(stateDir), INITIALIZED_BYTES)
  fsyncStateDir(stateDir)
  const intent = initializingPath(stateDir)
  if (firstWriteWasInterrupted(stateDir)) {
    fs.unlinkSync(intent)
    fsyncStateDir(stateDir)
  }
}

function fsyncStateDir(stateDir: string): void {
  const dir = fs.openSync(stateDir, 'r')
  try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
}

const JOB_STATUSES = new Set<JobStatus>(['queued', 'launching', 'running', 'verifying', 'retry_wait', 'done', 'held'])
const SHA256_RE = /^sha256:[a-f0-9]{64}$/
const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/
const TARGET_RUN_RE = /^analyses\/([A-Z0-9.\-]{1,15})_\d{4}-\d{2}-\d{2}$/

function isoOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && Number.isFinite(Date.parse(value)))
}

function validJob(key: string, value: unknown): value is AutomaticCallJob {
  const job = value as AutomaticCallJob
  return !!job && typeof job === 'object' && !Array.isArray(job)
    && job.key === key && TICKER_RE.test(job.ticker) && typeof job.run_root === 'string' && job.run_root.length > 0
    && SHA256_RE.test(job.plan_sha256) && SHA256_RE.test(job.decision_fingerprint)
    && (job.target_run_root === undefined || job.target_run_root === null
      || TARGET_RUN_RE.exec(job.target_run_root)?.[1] === job.ticker)
    && (job.publication_pending === undefined || typeof job.publication_pending === 'boolean')
    && job.key === automaticCallPlanKey({
      ticker: job.ticker,
      runRoot: job.run_root,
      planSha256: job.plan_sha256,
      decisionFingerprint: job.decision_fingerprint,
    })
    && (job.input === undefined || job.input === null || (
      job.input.ticker === job.ticker && job.input.runRoot === job.run_root
      && job.input.planSha256 === job.plan_sha256
      && job.input.decisionFingerprint === job.decision_fingerprint
      && job.input.sourceDecisionFingerprint === job.decision_fingerprint
      && typeof job.input.swarm === 'string' && /^[a-z0-9-]{1,40}$/.test(job.input.swarm)
      && typeof job.input.planPath === 'string' && job.input.planPath.length > 0 && job.input.planPath.length <= 700
    ))
    && JOB_STATUSES.has(job.status) && typeof job.active === 'boolean'
    && Number.isInteger(job.attempts) && job.attempts >= 0
    && (job.run_id === null || typeof job.run_id === 'string')
    && (job.last_error === null || typeof job.last_error === 'string')
    && isoOrNull(job.next_attempt_at) && isoOrNull(job.lease_expires_at)
    && typeof job.created_at === 'string' && Number.isFinite(Date.parse(job.created_at))
    && typeof job.updated_at === 'string' && Number.isFinite(Date.parse(job.updated_at))
}

function readState(stateDir: string, now: number): AutomaticCallState {
  const file = statePath(stateDir)
  let text: string
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      if (missingUsedState(stateDir)) {
        const detail = 'automatic call state is missing after it was already used'
        unavailableState.set(stateDir, detail)
        throw Object.assign(new Error(detail), { code: 'CALL_UPDATE_STATE_UNAVAILABLE' })
      }
      // A durable first-write intent is created before the initial ledger rename, while no paid launch
      // can start until writeState returns. If the process dies in that narrow gap, an absent ledger is
      // provably unused and may be rebuilt automatically; every post-use absence still stops above.
      firstWriteWasInterrupted(stateDir)
      unavailableState.delete(stateDir)
      return emptyState(now)
    }
    const detail = `automatic call state is unreadable (${String(error?.code || error?.message || 'read error')})`
    unavailableState.set(stateDir, detail)
    throw Object.assign(new Error(detail), { code: 'CALL_UPDATE_STATE_UNAVAILABLE' })
  }
  try {
    const raw = JSON.parse(text)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 1
        || typeof raw.updated_at !== 'string' || !Number.isFinite(Date.parse(raw.updated_at))
        || !isoOrNull(raw.last_checked_at) || !isoOrNull(raw.next_check_at)
        || !raw.jobs || typeof raw.jobs !== 'object' || Array.isArray(raw.jobs)) {
      throw new Error('invalid top-level schema')
    }
    const entries = Object.entries(raw.jobs)
    if (entries.some(([key, job]) => !validJob(key, job))) throw new Error('invalid job schema')
    const jobs = Object.fromEntries(entries.map(([key, value]) => [key, {
      ...(value as AutomaticCallJob), input: (value as AutomaticCallJob).input ?? null,
      target_run_root: (value as AutomaticCallJob).target_run_root ?? null,
      // Older ledgers used `verifying` as the only publication witness. Preserve that meaning while
      // migrating in memory so a restart cannot turn a finished-but-unshared result into ordinary work.
      publication_pending: (value as AutomaticCallJob).publication_pending
        ?? (value as AutomaticCallJob).status === 'verifying',
    }])) as Record<string, AutomaticCallJob>
    unavailableState.delete(stateDir)
    return {
      version: 1,
      updated_at: raw.updated_at,
      last_checked_at: raw.last_checked_at,
      next_check_at: raw.next_check_at,
      jobs,
    }
  } catch (error: any) {
    const detail = `automatic call state is corrupt (${String(error?.message || 'invalid JSON')})`
    unavailableState.set(stateDir, detail)
    throw Object.assign(new Error(detail), { code: 'CALL_UPDATE_STATE_UNAVAILABLE' })
  }
}

function writeState(stateDir: string, state: AutomaticCallState): void {
  fs.mkdirSync(stateDir, { recursive: true })
  // A separate first-write intent becomes durable before the first ledger rename. No paid launch can
  // start until this function returns, so intent-without-ledger is a recoverable pre-admission crash cut.
  // The permanent initialized witness is written only after the ledger rename itself is durable.
  try {
    ensureFirstWriteIntent(stateDir)
    fsyncStateDir(stateDir)
  } catch (error: any) {
    unavailableState.set(stateDir, `automatic call initialization marker could not be saved (${String(error?.code || error?.message || 'write error')})`)
    throw error
  }
  const file = statePath(stateDir)
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  try {
    const fd = fs.openSync(tmp, 'w', 0o600)
    try {
      fs.writeFileSync(fd, JSON.stringify(state, null, 2) + '\n', 'utf8')
      fs.fsyncSync(fd)
    } finally {
      fs.closeSync(fd)
    }
    fs.renameSync(tmp, file)
    fsyncStateDir(stateDir)
    completeFirstWrite(stateDir)
  } catch (error: any) {
    try { fs.unlinkSync(tmp) } catch { /* rename may already have consumed it */ }
    unavailableState.set(stateDir, `automatic call state could not be saved durably (${String(error?.code || error?.message || 'write error')})`)
    throw error
  }
  memoryState = { stateDir, state }
  unavailableState.delete(stateDir)
}

function normalizedOptions(options: AutomaticCallLoopOptions): Required<AutomaticCallLoopOptions> {
  const intervalMs = Math.max(1_000, options.intervalMs ?? DEFAULT_INTERVAL_MS)
  return {
    // Paid autonomous research is exact opt-in. The engine also runs on admin and temporary failover
    // hosts; an unset flag must never turn all of those processes into independent update owners.
    enabled: options.enabled ?? process.env.CALL_UPDATE_AUTO_ENABLED === '1',
    intervalMs,
    initialDelayMs: Math.max(0, options.initialDelayMs ?? 15_000),
    stateDir: options.stateDir ?? STATE_DIR,
    runningLeaseMs: Math.max(intervalMs, options.runningLeaseMs ?? DEFAULT_RUNNING_LEASE_MS),
    retryBaseMs: Math.max(1_000, options.retryBaseMs ?? DEFAULT_RETRY_BASE_MS),
    retryMaxMs: Math.max(1_000, options.retryMaxMs ?? DEFAULT_RETRY_MAX_MS),
  }
}

function backoffMs(attempts: number, options: Required<AutomaticCallLoopOptions>): number {
  return Math.min(options.retryMaxMs, options.retryBaseMs * (2 ** Math.min(8, Math.max(0, attempts - 1))))
}

function terminalFailure(status: RunStatus): boolean {
  return status === 'error' || status === 'cancelled' || status === 'incomplete'
}

function classifyError(error: any): { retry: boolean; message: string; code: string } {
  const code = String(error?.code || error?.body?.code || '')
  const status = Number(error?.statusCode || 0)
  // This is an exact, deterministic authority mismatch—not an outage. Its endpoint is deliberately 503
  // because automation cannot proceed, but retrying the same immutable bytes forever cannot heal it.
  const nonRetryable = code === 'publication_recovery_unsafe'
  const retryable = !nonRetryable && (code === 'subject_busy' || code === 'same_day_complete_queued'
    || code === 'run_incomplete' || status === 429 || status >= 500 || status === 0)
  return {
    retry: retryable,
    code,
    message: String(error?.message || error?.body?.error || 'automatic update could not start').slice(0, 500),
  }
}

function prune(state: AutomaticCallState): void {
  const rows = Object.values(state.jobs)
  if (rows.length <= MAX_RETAINED_JOBS) return
  const removable = rows
    .filter((job) => !job.active && (job.status === 'done' || job.status === 'held'))
    .sort((a, b) => a.updated_at.localeCompare(b.updated_at))
  for (const job of removable.slice(0, Math.max(0, rows.length - MAX_RETAINED_JOBS))) delete state.jobs[job.key]
}

function finishJob(
  stateDir: string,
  key: string,
  status: RunStatus,
  options: Required<AutomaticCallLoopOptions>,
  now: () => number,
): void {
  const at = now()
  let state: AutomaticCallState
  try { state = readState(stateDir, at) } catch { return }
  const job = state.jobs[key]
  if (!job) return
  job.updated_at = iso(at)
  job.lease_expires_at = null
  if (status === 'done') {
    // A child exit only proves that files were written on this machine. It does not prove the resulting
    // call survived commit/push. Keep the immutable plan in a verification state until authoritative
    // discovery proves the plan is no longer actionable. If the same key is still present, it is retried;
    // this prevents an uncommitted result from permanently retiring paid work after restart/failover.
    job.status = 'verifying'
    job.publication_pending = true
    job.last_error = null
    job.next_attempt_at = null
  } else if (terminalFailure(status)) {
    job.status = 'retry_wait'
    // Once the server has persisted an exact target, even a failed child may have completed modules,
    // written the master pair, or reached a later immutable seal. Keep that target as a durable recovery
    // phase across restart/date rollover; the stage inspector decides whether to resume gates, commit, or
    // publish. Only an explicit cancellation abandons automatic recovery.
    job.publication_pending = status !== 'cancelled' && !!job.target_run_root
    job.last_error = job.publication_pending
      ? `run ended ${status}; the exact staged call will resume safely`
      : `run ended ${status}; the system will retry safely`
    job.next_attempt_at = iso(at + backoffMs(job.attempts, options))
  } else {
    return
  }
  state.updated_at = iso(at)
  writeState(stateDir, state)
}

/** One durable reconciliation pass. Exported so tests and the server's startup path can run it now. */
export async function reconcileAutomaticCallUpdates(
  deps: AutomaticCallUpdateDeps,
  optionsInput: AutomaticCallLoopOptions = {},
): Promise<void> {
  const options = normalizedOptions(optionsInput)
  if (!options.enabled || loopRunning) return
  loopRunning = true
  const now = deps.now ?? Date.now
  const started = now()
  let state: AutomaticCallState
  try {
    state = readState(options.stateDir, started)
    const discovered = deps.discover()
    if (!Array.isArray(discovered) || discovered.some((plan) =>
      !plan || !TICKER_RE.test(plan.ticker) || !plan.runRoot || !SHA256_RE.test(plan.planSha256)
      || !SHA256_RE.test(plan.decisionFingerprint)
      || plan.key !== automaticCallPlanKey(plan)
      || plan.input.ticker !== plan.ticker || plan.input.runRoot !== plan.runRoot
      || !plan.input || plan.input.planSha256 !== plan.planSha256
      || plan.input.decisionFingerprint !== plan.decisionFingerprint
      || plan.input.sourceDecisionFingerprint !== plan.decisionFingerprint)) {
      throw new Error('automatic plan discovery returned an invalid exact identity')
    }
    reconciliationProblems.delete(options.stateDir)
    const unique = new Map(discovered.map((plan) => [plan.key, plan]))
    const publicationRecoveryKeys = new Set<string>()
    for (const job of Object.values(state.jobs)) {
      job.active = false
      const lease = job.lease_expires_at ? Date.parse(job.lease_expires_at) : NaN
      const orphanedFinishedAttempt = (job.status === 'running' || job.status === 'launching')
        && Number.isFinite(lease) && lease <= started && !!job.target_run_root
      if (!job.publication_pending && job.status !== 'verifying' && !orphanedFinishedAttempt) continue
      // `publication_pending` is a durable phase, not a transient status. Keep it independently runnable
      // after a crash between queue persistence and execute(), and after a temporary push/fetch failure.
      // Otherwise a newer intake plan could hide this already-paid result and cause duplicate work.
      job.publication_pending = true
      job.updated_at = iso(started)
      job.run_id = null
      if (job.input && job.target_run_root) {
        // The source plan may have been replaced after this exact run finished locally. Keep its complete
        // launch identity in the durable job so publication recovery can save that result independently;
        // never call a newer plan complete merely because the older one disappeared from discovery.
        // Stored target identity always wins while publication is pending. Fresh discovery calculates a
        // new dated folder after midnight; replacing yesterday's target would lose the finished result and
        // could pay for the same immutable plan twice.
        unique.set(job.key, {
          key: job.key,
          ticker: job.ticker,
          runRoot: job.run_root,
          planSha256: job.plan_sha256,
          decisionFingerprint: job.decision_fingerprint,
          targetRunRoot: job.target_run_root,
          input: job.input,
        })
        publicationRecoveryKeys.add(job.key)
        job.active = true
        if (job.status === 'verifying') {
          job.status = 'queued'
          job.next_attempt_at = null
        } else if (orphanedFinishedAttempt) {
          job.status = 'queued'
          job.next_attempt_at = null
        }
        job.last_error = 'A finished call still needs to be shared. Retrying only the save step.'
      } else if (unique.has(job.key)) {
        // Compatibility for a pre-target ledger. The exact source plan is still authoritative, so it may
        // run normally and return the target identity. Never fabricate a target directory.
        job.status = 'queued'
        job.next_attempt_at = null
        job.active = true
        job.last_error = 'The last result was not saved as a durable new call. Retrying safely.'
      } else {
        job.active = true
        job.status = 'held'
        job.last_error = 'A saved call could not be matched to its exact update plan. The system stopped safely.'
      }
    }
    for (const plan of unique.values()) {
      let job = state.jobs[plan.key]
      if (!job) {
        const at = iso(started)
        job = state.jobs[plan.key] = {
          key: plan.key,
          ticker: plan.ticker,
          run_root: plan.runRoot,
          plan_sha256: plan.planSha256,
          decision_fingerprint: plan.decisionFingerprint,
          target_run_root: plan.targetRunRoot ?? null,
          publication_pending: false,
          input: plan.input,
          status: 'queued',
          active: true,
          attempts: 0,
          run_id: null,
          last_error: null,
          next_attempt_at: null,
          lease_expires_at: null,
          created_at: at,
          updated_at: at,
        }
      } else {
        job.active = true
        job.input = plan.input
        if (plan.targetRunRoot && !job.publication_pending) job.target_run_root = plan.targetRunRoot
        // Compatibility and recovery guard: an older process may have marked a local terminal result
        // done before durable discovery changed. A completed key that is authoritative/actionable again
        // is not complete; reopen it instead of silently skipping it forever.
        if (job.status === 'done') {
          job.status = 'queued'
          job.run_id = null
          job.last_error = 'The saved call result is missing. Retrying safely.'
          job.next_attempt_at = null
          job.lease_expires_at = null
          job.publication_pending = false
          job.updated_at = iso(started)
        }
      }
    }

    // Persist discovery before launching. A crash after this point replays the same immutable plan key.
    state.last_checked_at = iso(started)
    state.next_check_at = iso(started + options.intervalMs)
    state.updated_at = iso(started)
    prune(state)
    writeState(options.stateDir, state)

    // One automatic paid launch per pass. The ordinary launcher remains the global concurrency and
    // readiness authority; serial dispatch also prevents this loop from creating its own burst.
    const candidates = [...unique.values()].sort((a, b) =>
      Number(publicationRecoveryKeys.has(b.key)) - Number(publicationRecoveryKeys.has(a.key))
      || a.ticker.localeCompare(b.ticker))
    for (const plan of candidates) {
      state = readState(options.stateDir, now())
      const job = state.jobs[plan.key]
      if (!job || job.status === 'done' || job.status === 'held') continue
      const at = now()
      const lease = job.lease_expires_at ? Date.parse(job.lease_expires_at) : NaN
      if ((job.status === 'running' || job.status === 'launching') && Number.isFinite(lease) && lease > at) continue
      const next = job.next_attempt_at ? Date.parse(job.next_attempt_at) : NaN
      if (job.status === 'retry_wait' && Number.isFinite(next) && next > at) continue

      job.status = 'launching'
      job.attempts += 1
      job.updated_at = iso(at)
      job.lease_expires_at = iso(at + options.runningLeaseMs)
      job.last_error = null
      writeState(options.stateDir, state)

      try {
        const launched = await deps.execute(plan, (terminal) => {
          finishJob(options.stateDir, plan.key, terminal, options, now)
        })
        const after = now()
        state = readState(options.stateDir, after)
        const current = state.jobs[plan.key]
        if (current && launched.targetRunRoot && TARGET_RUN_RE.exec(launched.targetRunRoot)?.[1] === current.ticker) {
          current.target_run_root = launched.targetRunRoot
          // The terminal callback may have moved this job to `verifying` before the early launch ACK
          // returns. Persist the target independently so a midnight/restart cannot lose publication identity.
          writeState(options.stateDir, state)
        }
        if (current && launched.durable === true) {
          current.status = 'done'
          current.publication_pending = false
          current.run_id = launched.runId
          current.last_error = null
          current.next_attempt_at = null
          current.lease_expires_at = null
          current.updated_at = iso(after)
          writeState(options.stateDir, state)
        } else if (current && current.status === 'launching') {
          current.status = 'running'
          current.run_id = launched.runId
          current.updated_at = iso(after)
          current.lease_expires_at = iso(after + options.runningLeaseMs)
          writeState(options.stateDir, state)
        }
        break
      } catch (error: any) {
        const after = now()
        const classification = classifyError(error)
        state = readState(options.stateDir, after)
        const current = state.jobs[plan.key]
        if (current) {
          // An expired child lease carries only an early target ACK; it is not proof that the child ever
          // wrote a recoverable result. When the exact source plan has since been superseded and the
          // target inspector found no saved/pre-seal work, execute() returns `no_plan`. Retire that ghost
          // identity instead of preserving `publication_pending` forever and keeping Calls red. Any real
          // target progress is classified before current-plan validation and therefore never reaches this
          // branch. If the same plan is still authoritative, ordinary discovery reopens this done row.
          const supersededEmptyAttempt = classification.code === 'no_plan' && current.publication_pending
          current.status = supersededEmptyAttempt ? 'done' : classification.retry ? 'retry_wait' : 'held'
          current.publication_pending = supersededEmptyAttempt ? false : current.publication_pending
          current.active = supersededEmptyAttempt ? false : current.active
          current.last_error = supersededEmptyAttempt ? null : classification.message
          current.updated_at = iso(after)
          current.lease_expires_at = null
          current.next_attempt_at = !supersededEmptyAttempt && classification.retry
            ? iso(after + backoffMs(current.attempts, options))
            : null
          writeState(options.stateDir, state)
        }
        // A stale/replaced/widened plan is never weakened or forced through. Ask the cheap intake pass to
        // re-scope current data; a new immutable plan key will then enter the queue automatically.
        if (!classification.retry) deps.requestAnalysis?.(plan.ticker)
        // Keep the one-attempt-per-pass contract even on failure. In particular, never start a newer
        // paid plan while an older completed result is waiting for a safe publication retry.
        break
      }
    }
  } catch (error: any) {
    // A corrupt/unreadable ledger is authority unavailable, not a fresh ledger. Never overwrite it and
    // never launch: retaining the bad bytes is the only way to recover completed paid-plan keys.
    if (error?.code !== 'CALL_UPDATE_STATE_UNAVAILABLE') {
      reconciliationProblems.set(options.stateDir,
        `Automatic call updates cannot read the saved Calls history (${String(error?.message || error || 'read error').slice(0, 160)}).`)
      const at = now()
      try {
        state = readState(options.stateDir, at)
        state.last_checked_at = iso(at)
        state.next_check_at = iso(at + options.intervalMs)
        state.updated_at = iso(at)
        writeState(options.stateDir, state)
      } catch { /* state became unavailable while handling the first error: preserve it */ }
    }
    // Discovery failure does not fabricate work. The next interval repeats the disk projection.
    console.error( // eslint-disable-line no-console
      '[automatic-call-updates] reconciliation failed:',
      error?.code === 'CALL_UPDATE_STATE_UNAVAILABLE' ? String(error.message) : error,
    )
  } finally {
    loopRunning = false
  }
}

function releaseLoopOwner(stateDir: string): void {
  if (loopTimer) clearTimeout(loopTimer)
  loopTimer = null
  schedulerPassRunning = false
  singletonDeps = null
  singletonOptions = null
  if (singletonStateDir === stateDir) releaseSingletonLock(stateDir, LOCK_FILE)
  singletonStateDir = null
}

function scheduleNext(delayMs: number): boolean {
  const deps = singletonDeps
  const options = singletonOptions
  if (!deps || !options || singletonStateDir !== options.stateDir) return false
  try {
    loopTimer = setTimeout(async () => {
      loopTimer = null
      if (singletonDeps !== deps || singletonOptions !== options || singletonStateDir !== options.stateDir) return
      schedulerPassRunning = true
      try {
        await reconcileAutomaticCallUpdates(deps, options)
        loopStartProblems.delete(options.stateDir)
      } catch (error: any) {
        loopStartProblems.set(options.stateDir,
          `Automatic call update watcher stopped after an unexpected error (${String(error?.message || error || 'unknown error').slice(0, 160)}).`)
      } finally {
        schedulerPassRunning = false
      }
      if (singletonDeps !== deps || singletonOptions !== options || singletonStateDir !== options.stateDir) return
      if (!scheduleNext(options.intervalMs)) {
        loopStartProblems.set(options.stateDir, 'Automatic call update watcher could not schedule its next check.')
        releaseLoopOwner(options.stateDir)
      }
    }, delayMs)
    loopTimer.unref?.()
    return true
  } catch (error: any) {
    loopTimer = null
    loopStartProblems.set(options.stateDir,
      `Automatic call update watcher could not start (${String(error?.message || error || 'scheduler error').slice(0, 160)}).`)
    return false
  }
}

export function startAutomaticCallUpdateLoop(
  deps: AutomaticCallUpdateDeps,
  optionsInput: AutomaticCallLoopOptions = {},
): boolean {
  const options = normalizedOptions(optionsInput)
  if (loopTimer || singletonDeps || schedulerPassRunning) {
    if (singletonStateDir !== options.stateDir) {
      loopStartProblems.set(options.stateDir, 'Automatic call update watcher did not start because this process already owns another watcher.')
    }
    return false
  }
  try {
    memoryState = { stateDir: options.stateDir, state: readState(options.stateDir, (deps.now ?? Date.now)()) }
  } catch {
    memoryState = null
  }
  if (!options.enabled) return false
  if (!acquireSingletonLock(options.stateDir, LOCK_FILE)) {
    loopStartProblems.set(options.stateDir, 'Automatic call update watcher did not start on this machine. Another process may already own it.')
    return false
  }
  singletonStateDir = options.stateDir
  singletonDeps = deps
  singletonOptions = options
  loopStartProblems.delete(options.stateDir)
  if (!scheduleNext(options.initialDelayMs)) {
    releaseLoopOwner(options.stateDir)
    return false
  }
  return true
}

export function stopAutomaticCallUpdateLoop(): void {
  const stateDir = singletonStateDir
  loopRunning = false
  if (stateDir) releaseLoopOwner(stateDir)
  else {
    if (loopTimer) clearTimeout(loopTimer)
    loopTimer = null
    schedulerPassRunning = false
    singletonDeps = null
    singletonOptions = null
  }
}

export function getAutomaticCallUpdateStatus(optionsInput: AutomaticCallLoopOptions = {}): AutomaticCallUpdateStatus {
  const options = normalizedOptions(optionsInput)
  const enabled = options.enabled
  let state: AutomaticCallState
  if (memoryState?.stateDir === options.stateDir) state = memoryState.state
  else {
    try { state = readState(options.stateDir, Date.now()) }
    catch { state = emptyState(Date.now()) }
  }
  const active = Object.values(state.jobs).filter((job) => job.active)
  const running = active.filter((job) => job.status === 'launching' || job.status === 'running' || job.status === 'verifying').length
  const queued = active.filter((job) => job.status === 'queued' || job.status === 'retry_wait').length
  const held = active.filter((job) => job.status === 'held').length
  const stateUnavailable = unavailableState.get(options.stateDir)
  if (!enabled) {
    return {
      enabled: false,
      state: 'needs_attention',
      message: 'Automatic call updates are turned off.',
      last_checked_at: state.last_checked_at,
      next_check_at: null,
      queued,
      running,
    }
  }
  if (stateUnavailable) {
    return {
      enabled: true,
      state: 'needs_attention',
      message: 'Automatic updates are paused because their saved history cannot be read safely.',
      last_checked_at: state.last_checked_at,
      next_check_at: null,
      queued,
      running,
    }
  }
  const reconciliationProblem = reconciliationProblems.get(options.stateDir)
  if (reconciliationProblem) {
    return {
      enabled: true,
      state: 'needs_attention',
      message: reconciliationProblem,
      last_checked_at: state.last_checked_at,
      next_check_at: null,
      queued,
      running,
    }
  }
  const ownsHealthyLoop = singletonStateDir === options.stateDir
    && singletonDeps !== null
    && singletonOptions?.stateDir === options.stateDir
    && (loopTimer !== null || schedulerPassRunning)
  if (!ownsHealthyLoop) {
    return {
      enabled: true,
      state: 'needs_attention',
      message: loopStartProblems.get(options.stateDir) || 'Automatic call update watcher is not running on this machine.',
      last_checked_at: state.last_checked_at,
      next_check_at: null,
      queued,
      running,
    }
  }
  if (running || queued) {
    return {
      enabled: true,
      state: 'checking',
      message: running ? 'New information is being checked now.' : 'New information is queued and will be checked automatically.',
      last_checked_at: state.last_checked_at,
      next_check_at: state.next_check_at,
      queued,
      running,
    }
  }
  if (held) {
    return {
      enabled: true,
      state: 'needs_attention',
      message: 'The last update was not safe to run. The system is checking the data again automatically.',
      last_checked_at: state.last_checked_at,
      next_check_at: state.next_check_at,
      queued,
      running,
    }
  }
  return {
    enabled: true,
    state: 'watching',
    message: 'Watching safe rerun plans. You do not need to do anything.',
    last_checked_at: state.last_checked_at,
    next_check_at: state.next_check_at,
    queued: 0,
    running: 0,
  }
}
