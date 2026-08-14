import fs from 'node:fs'
import path from 'node:path'
import { createHash, randomBytes } from 'node:crypto'
import { STATE_DIR } from './config'
import { acquireRetainedFlockSync, releaseRetainedFlock } from './singleton-lock'

type IntakeJobState = 'checking' | 'retry_wait'
interface IntakeJobOwner {
  swarm: string
  subject: string
  run_root: string
  decision_fingerprint: string
}
interface IntakeJob {
  state: IntakeJobState
  updated_at: string
  next_attempt_at: string | null
  /** Missing only on the backward-compatible status rows written before durable paid-work leases. */
  owner: IntakeJobOwner | null
  owner_key: string | null
  pool_newest_ms: number | null
  pool_fingerprint: string | null
  lease_id: string | null
  lease_expires_at: string | null
}
interface IntakeState {
  version: 1
  updated_at: string
  last_checked_at: string | null
  jobs: Record<string, IntakeJob>
  events: Record<string, AutomaticIntakeEvent>
}
export interface AutomaticIntakeEvent {
  id: string
  ticker: string
  run_root: string
  plan_path: string
  plan_sha256: string
  decision_fingerprint: string
  verdict: 'note_only' | 'scoped_rerun' | 'insufficient'
  at: string
  headline: string
  detail: string | null
}
export interface AutomaticIntakeOutcome {
  ticker: string
  runRoot: string
  planPath: string
  planSha256: string
  decisionFingerprint: string
  verdict: AutomaticIntakeEvent['verdict']
  summary?: string | null
}
export interface AutomaticIntakeStatus {
  enabled: boolean
  state: 'watching' | 'checking' | 'needs_attention'
  message: string
  last_checked_at: string | null
  next_check_at: string | null
  queued: number
  running: number
}

export interface AutomaticIntakeLeaseIdentity {
  ticker: string
  swarm: string
  runRoot: string
  decisionFingerprint: string
  poolNewestMs: number
}

export interface AutomaticIntakeLease extends AutomaticIntakeLeaseIdentity {
  ownerKey: string
  poolFingerprint: string
  leaseId: string
  leaseExpiresAt: string
}

export type AutomaticIntakeLeaseClaim =
  | { status: 'claimed'; lease: AutomaticIntakeLease }
  | { status: 'busy'; leaseExpiresAt: string | null }
  | { status: 'retry_wait'; nextAttemptAt: string | null }
  | { status: 'unavailable' }

const runtimeByStateDir = new Map<string, { timerActive: boolean; passActive: boolean; problem: string | null }>()

/** Runtime truth is owned by server.ts, where the retained reconciliation timer and pass live. An env flag
 * alone is not proof that new company files will ever be revisited after startup. */
export function setAutomaticIntakeRuntime(
  input: { timerActive: boolean; passActive?: boolean; problem?: string | null },
  stateDir = STATE_DIR,
): void {
  runtimeByStateDir.set(stateDir, {
    timerActive: input.timerActive,
    passActive: input.passActive ?? false,
    problem: input.problem ?? null,
  })
}

const FILE = 'automatic-intake-status.json'
const INITIALIZED_FILE = 'automatic-intake-status.initialized'
const MUTATION_LOCK_FILE = 'automatic-intake-status.flock'
export const AUTOMATIC_INTAKE_LEASE_MS = 6 * 60 * 60_000
const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/
const SWARM_RE = /^[a-z0-9][a-z0-9-]{0,39}$/
const unavailable = new Map<string, string>()
const mutationUnavailable = new Set<string>()
const iso = (ms: number) => new Date(ms).toISOString()
const fileFor = (stateDir: string) => path.join(stateDir, FILE)
const initializedFor = (stateDir: string) => path.join(stateDir, INITIALIZED_FILE)
const lockFor = (stateDir: string) => path.join(stateDir, MUTATION_LOCK_FILE)
const SHA_RE = /^sha256:[a-f0-9]{64}$/
const LEASE_RE = /^[a-f0-9]{32}$/
const PLAN_RE = /^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}\/intake\/[A-Za-z0-9._-]+\.json$/
const RUN_RE = /^analyses\/([A-Z0-9.\-]{1,15})_\d{4}-\d{2}-\d{2}$/
const empty = (now: number): IntakeState => ({ version: 1, updated_at: iso(now), last_checked_at: null, jobs: {}, events: {} })
const STATUS_ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/
const validIso = (value: unknown): value is string => {
  if (typeof value !== 'string' || !STATUS_ISO_RE.test(value)) return false
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return false
  const canonical = value.includes('.')
    ? value.replace(/\.(\d{1,3})Z$/, (_match, digits: string) => `.${digits.padEnd(3, '0')}Z`)
    : value.replace(/Z$/, '.000Z')
  return new Date(ms).toISOString() === canonical
}
const validIsoOrNull = (value: unknown): value is string | null => value === null || validIso(value)
const sha256 = (value: string): string => `sha256:${createHash('sha256').update(value, 'utf8').digest('hex')}`

function safeRunRoot(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 700
    && !path.posix.isAbsolute(value) && !/[\\\x00-\x1f\x7f]/.test(value)
    && path.posix.normalize(value) === value && !value.startsWith('./') && !value.includes('//')
    && !value.split('/').some((part) => !part || part === '.' || part === '..')
}

function normalizedLeaseIdentity(input: AutomaticIntakeLeaseIdentity): AutomaticIntakeLeaseIdentity | null {
  const newest = Math.floor(input.poolNewestMs)
  if (!TICKER_RE.test(input.ticker) || !SWARM_RE.test(input.swarm) || !safeRunRoot(input.runRoot)
      || !SHA_RE.test(input.decisionFingerprint) || !Number.isSafeInteger(newest) || newest <= 0) return null
  return { ...input, poolNewestMs: newest }
}

function ownerKeyFor(input: Pick<AutomaticIntakeLeaseIdentity, 'ticker' | 'swarm' | 'runRoot' | 'decisionFingerprint'>): string {
  return sha256([input.swarm, input.ticker, input.runRoot, input.decisionFingerprint].join('\0'))
}

function poolFingerprintFor(ownerKey: string, newestMs: number): string {
  return sha256(`${ownerKey}\0${newestMs}`)
}

function exactJob(job: IntakeJob): boolean {
  return job.owner !== null && job.owner_key !== null && job.pool_newest_ms !== null
    && job.pool_fingerprint !== null
}

function missingUsedState(stateDir: string): boolean {
  try { fs.lstatSync(initializedFor(stateDir)); return true }
  catch (error: any) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function ensureInitializedMarker(stateDir: string): void {
  const marker = initializedFor(stateDir)
  let fd: number | null = null
  try {
    fd = fs.openSync(marker, 'wx', 0o600)
    fs.writeFileSync(fd, 'automatic-intake-status-v1\n', 'utf8')
    fs.fsyncSync(fd)
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
    const stat = fs.lstatSync(marker)
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('automatic intake status marker is unsafe')
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

function normalizeJob(ticker: string, raw: any): IntakeJob | null {
  if (!TICKER_RE.test(ticker) || !raw || !['checking', 'retry_wait'].includes(raw.state)
      || !validIso(raw.updated_at) || !validIsoOrNull(raw.next_attempt_at)) return null
  const authorityFields = [raw.owner, raw.owner_key, raw.pool_newest_ms, raw.pool_fingerprint,
    raw.lease_id, raw.lease_expires_at]
  // Compatibility: rollout must retain an already-running/retrying v1 row instead of declaring the whole
  // paid-work authority corrupt. It receives an inferred lease during admission and is rewritten exactly.
  if (authorityFields.every((value) => value === undefined || value === null)) {
    return {
      state: raw.state,
      updated_at: raw.updated_at,
      next_attempt_at: raw.next_attempt_at,
      owner: null,
      owner_key: null,
      pool_newest_ms: null,
      pool_fingerprint: null,
      lease_id: null,
      lease_expires_at: null,
    }
  }
  const owner = raw.owner
  if (!owner || typeof owner !== 'object' || Array.isArray(owner)
      || !SWARM_RE.test(owner.swarm) || owner.subject !== ticker || !safeRunRoot(owner.run_root)
      || !SHA_RE.test(owner.decision_fingerprint) || !SHA_RE.test(raw.owner_key)
      || !Number.isSafeInteger(raw.pool_newest_ms) || raw.pool_newest_ms <= 0
      || !SHA_RE.test(raw.pool_fingerprint)
      || !(raw.lease_id === null || (typeof raw.lease_id === 'string' && LEASE_RE.test(raw.lease_id)))
      || !validIsoOrNull(raw.lease_expires_at)) return null
  const identity = {
    ticker,
    swarm: owner.swarm,
    runRoot: owner.run_root,
    decisionFingerprint: owner.decision_fingerprint,
  }
  if (raw.owner_key !== ownerKeyFor(identity)
      || raw.pool_fingerprint !== poolFingerprintFor(raw.owner_key, raw.pool_newest_ms)
      || (raw.state === 'checking' && (!raw.lease_id || !raw.lease_expires_at))
      || (raw.state === 'retry_wait' && (raw.lease_id !== null || raw.lease_expires_at !== null))) return null
  return {
    state: raw.state,
    updated_at: raw.updated_at,
    next_attempt_at: raw.next_attempt_at,
    owner: {
      swarm: owner.swarm,
      subject: ticker,
      run_root: owner.run_root,
      decision_fingerprint: owner.decision_fingerprint,
    },
    owner_key: raw.owner_key,
    pool_newest_ms: raw.pool_newest_ms,
    pool_fingerprint: raw.pool_fingerprint,
    lease_id: raw.lease_id,
    lease_expires_at: raw.lease_expires_at,
  }
}

function read(stateDir: string, now: number): IntakeState {
  let text: string
  try { text = fs.readFileSync(fileFor(stateDir), 'utf8') }
  catch (error: any) {
    if (error?.code === 'ENOENT') {
      if (missingUsedState(stateDir)) {
        unavailable.set(stateDir, 'Automatic new-data history is missing and cannot be trusted.')
        throw error
      }
      if (!mutationUnavailable.has(stateDir)) unavailable.delete(stateDir)
      return empty(now)
    }
    unavailable.set(stateDir, 'Automatic new-data status cannot be read safely.')
    throw error
  }
  try {
    const raw = JSON.parse(text)
    if (!raw || raw.version !== 1 || !validIso(raw.updated_at)
        || !(raw.last_checked_at === null || validIso(raw.last_checked_at))
        || !raw.jobs || typeof raw.jobs !== 'object' || Array.isArray(raw.jobs)) throw new Error('bad intake status')
    // Backward-compatible schema growth: v1 files written before notification events had no `events` key.
    // The job state is still authoritative; treating absence as an empty event map avoids falsely pausing
    // production during rollout. A PRESENT malformed map still fails closed.
    if (raw.events === undefined) raw.events = {}
    if (!raw.events || typeof raw.events !== 'object' || Array.isArray(raw.events)) throw new Error('bad intake events')
    const jobs: Record<string, IntakeJob> = {}
    for (const [ticker, job] of Object.entries(raw.jobs) as Array<[string, any]>) {
      const normalized = normalizeJob(ticker, job)
      if (!normalized) throw new Error('bad intake job')
      jobs[ticker] = normalized
    }
    for (const [id, event] of Object.entries(raw.events) as Array<[string, any]>) {
      const match = RUN_RE.exec(event?.run_root || '')
      if (!/^[a-f0-9]{24}$/.test(id) || event?.id !== id || !match || match[1] !== event.ticker
          || !PLAN_RE.test(event.plan_path) || !SHA_RE.test(event.plan_sha256)
          || !SHA_RE.test(event.decision_fingerprint)
          || !['note_only', 'scoped_rerun', 'insufficient'].includes(event.verdict)
          || !validIso(event.at) || typeof event.headline !== 'string'
          || !(event.detail === null || typeof event.detail === 'string')) throw new Error('bad intake event')
    }
    if (!mutationUnavailable.has(stateDir)) unavailable.delete(stateDir)
    return { ...raw, jobs } as IntakeState
  } catch (error) {
    unavailable.set(stateDir, 'Automatic new-data status is damaged and cannot be trusted.')
    throw error
  }
}

function write(stateDir: string, state: IntakeState): void {
  fs.mkdirSync(stateDir, { recursive: true })
  const file = fileFor(stateDir)
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`
  let fd: number | null = null
  try {
    fd = fs.openSync(temp, 'wx', 0o600)
    fs.writeFileSync(fd, JSON.stringify(state, null, 2) + '\n', 'utf8')
    fs.fsyncSync(fd)
  } catch (error) {
    try { fs.rmSync(temp, { force: true }) } catch { /* preserve original error */ }
    throw error
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
  // Once notification/job history has been used, deletion of the main file is authority loss, never a
  // fresh empty ledger. Create this durable companion before publishing the first main file: if either
  // write fails, the surviving marker makes every later read fail closed instead of reopening history.
  try { ensureInitializedMarker(stateDir) }
  catch (error) { try { fs.rmSync(temp, { force: true }) } catch {}; throw error }
  try { fs.renameSync(temp, file) }
  catch (error) { try { fs.rmSync(temp, { force: true }) } catch {}; throw error }
  try {
    const dir = fs.openSync(stateDir, 'r')
    try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
  } catch { /* directory fsync is not available on every filesystem */ }
  mutationUnavailable.delete(stateDir)
  unavailable.delete(stateDir)
}

function transact<T>(
  stateDir: string,
  now: number,
  unavailableValue: T,
  fn: (state: IntakeState, at: number) => { value: T; changed: boolean },
): T {
  let lock: number | null = null
  try {
    lock = acquireRetainedFlockSync(lockFor(stateDir), {
      waitMs: 2_000,
      busyMessage: 'automatic intake status is being updated by another process',
    })
    const state = read(stateDir, now)
    const result = fn(state, now)
    if (result.changed) {
      state.updated_at = iso(now)
      write(stateDir, state)
    }
    return result.value
  } catch (error: any) {
    // Preserve the more useful missing/corrupt/read diagnosis set by read(). A lock or write failure is
    // still authority loss for paid admission, but must never overwrite the ledger with a fresh state.
    if (!unavailable.has(stateDir)) {
      mutationUnavailable.add(stateDir)
      unavailable.set(stateDir, error?.code === 'EBUSY'
        ? 'Automatic new-data status is busy and cannot admit another check safely.'
        : 'Automatic new-data status could not be saved safely.')
    }
    return unavailableValue
  } finally {
    if (lock !== null) releaseRetainedFlock(lock)
  }
}

function mutate(stateDir: string, fn: (state: IntakeState, now: number) => boolean | void, now = Date.now()): boolean {
  return transact(stateDir, now, false, (state, at) => ({ value: true, changed: fn(state, at) !== false }))
}

export function markAutomaticIntakeChecking(ticker: string, stateDir = STATE_DIR, now = Date.now()): void {
  if (!TICKER_RE.test(ticker)) return
  mutate(stateDir, (state, at) => {
    // Legacy/non-paid status callers may describe work, but they may never overwrite an exact paid lease.
    if (state.jobs[ticker] && exactJob(state.jobs[ticker])) return false
    state.jobs[ticker] = {
      state: 'checking', updated_at: iso(at), next_attempt_at: null,
      owner: null, owner_key: null, pool_newest_ms: null, pool_fingerprint: null,
      lease_id: null, lease_expires_at: null,
    }
  }, now)
}

export function markAutomaticIntakeRetry(ticker: string, nextAttemptMs: number, stateDir = STATE_DIR, now = Date.now()): void {
  if (!TICKER_RE.test(ticker)) return
  mutate(stateDir, (state, at) => {
    if (state.jobs[ticker] && exactJob(state.jobs[ticker])) return false
    state.last_checked_at = iso(at)
    state.jobs[ticker] = {
      state: 'retry_wait', updated_at: iso(at), next_attempt_at: iso(Math.max(at, nextAttemptMs)),
      owner: null, owner_key: null, pool_newest_ms: null, pool_fingerprint: null,
      lease_id: null, lease_expires_at: null,
    }
  }, now)
}

export function markAutomaticIntakeDone(ticker: string, stateDir = STATE_DIR, now = Date.now()): void {
  if (!TICKER_RE.test(ticker)) return
  mutate(stateDir, (state, at) => {
    if (state.jobs[ticker] && exactJob(state.jobs[ticker])) return false
    state.last_checked_at = iso(at)
    delete state.jobs[ticker]
  }, now)
}

function jobMatchesIdentity(job: IntakeJob, identity: AutomaticIntakeLeaseIdentity): boolean {
  const ownerKey = ownerKeyFor(identity)
  return exactJob(job) && job.owner_key === ownerKey
    && job.pool_newest_ms === identity.poolNewestMs
    && job.pool_fingerprint === poolFingerprintFor(ownerKey, identity.poolNewestMs)
}

function validLeaseToken(lease: AutomaticIntakeLease): AutomaticIntakeLease | null {
  const identity = normalizedLeaseIdentity(lease)
  if (!identity || !SHA_RE.test(lease.ownerKey) || !SHA_RE.test(lease.poolFingerprint)
      || !LEASE_RE.test(lease.leaseId) || !validIso(lease.leaseExpiresAt)) return null
  const ownerKey = ownerKeyFor(identity)
  if (lease.ownerKey !== ownerKey
      || lease.poolFingerprint !== poolFingerprintFor(ownerKey, identity.poolNewestMs)) return null
  return { ...lease, ...identity }
}

function jobMatchesLease(job: IntakeJob, lease: AutomaticIntakeLease): boolean {
  return job.state === 'checking' && jobMatchesIdentity(job, lease)
    && job.lease_id === lease.leaseId && job.lease_expires_at === lease.leaseExpiresAt
}

/**
 * Atomically persist the exact paid-work identity before launch. The file transaction is protected by a
 * retained kernel flock, so another server process observes this lease instead of racing the same read.
 * A process crash leaves the durable lease behind; only its expiry permits a safe retry.
 */
export function claimAutomaticIntakeLease(
  input: AutomaticIntakeLeaseIdentity,
  options: { stateDir?: string; now?: number; leaseMs?: number } = {},
): AutomaticIntakeLeaseClaim {
  const identity = normalizedLeaseIdentity(input)
  if (!identity) return { status: 'unavailable' }
  const stateDir = options.stateDir ?? STATE_DIR
  const now = options.now ?? Date.now()
  const leaseMs = Math.max(1, Math.trunc(options.leaseMs ?? AUTOMATIC_INTAKE_LEASE_MS))
  const ownerKey = ownerKeyFor(identity)
  const poolFingerprint = poolFingerprintFor(ownerKey, identity.poolNewestMs)
  return transact<AutomaticIntakeLeaseClaim>(stateDir, now, { status: 'unavailable' }, (state, at) => {
    const current = state.jobs[identity.ticker]
    if (current?.state === 'checking') {
      const storedExpiry = current.lease_expires_at ? Date.parse(current.lease_expires_at) : NaN
      // A legacy checking row has no exact identity, but may still represent an already-paid child from
      // the process we just replaced. Give it one conservative lease window from its durable timestamp.
      const effectiveExpiry = Number.isFinite(storedExpiry)
        ? storedExpiry
        : Date.parse(current.updated_at) + leaseMs
      if (effectiveExpiry > at) {
        return {
          value: { status: 'busy', leaseExpiresAt: Number.isFinite(storedExpiry) ? current.lease_expires_at : iso(effectiveExpiry) },
          changed: false,
        }
      }
    }
    if (current?.state === 'retry_wait') {
      const next = current.next_attempt_at ? Date.parse(current.next_attempt_at) : NaN
      // A newer call/pool identity may supersede a completed failed attempt immediately. The old terminal
      // token was retired on retry. For the same (or unknowable legacy) identity, honor the durable wait.
      if (Number.isFinite(next) && next > at && (!exactJob(current) || jobMatchesIdentity(current, identity))) {
        return { value: { status: 'retry_wait', nextAttemptAt: current.next_attempt_at }, changed: false }
      }
    }
    const leaseId = randomBytes(16).toString('hex')
    const leaseExpiresAt = iso(at + leaseMs)
    const lease: AutomaticIntakeLease = {
      ...identity,
      ownerKey,
      poolFingerprint,
      leaseId,
      leaseExpiresAt,
    }
    state.jobs[identity.ticker] = {
      state: 'checking',
      updated_at: iso(at),
      next_attempt_at: null,
      owner: {
        swarm: identity.swarm,
        subject: identity.ticker,
        run_root: identity.runRoot,
        decision_fingerprint: identity.decisionFingerprint,
      },
      owner_key: ownerKey,
      pool_newest_ms: identity.poolNewestMs,
      pool_fingerprint: poolFingerprint,
      lease_id: leaseId,
      lease_expires_at: leaseExpiresAt,
    }
    return { value: { status: 'claimed', lease }, changed: true }
  })
}

/** Complete only the attempt that owns the current token. A late callback from an expired attempt is inert. */
export function completeAutomaticIntakeLease(
  token: AutomaticIntakeLease,
  stateDir = STATE_DIR,
  now = Date.now(),
): boolean {
  const lease = validLeaseToken(token)
  if (!lease) return false
  return transact(stateDir, now, false, (state, at) => {
    const current = state.jobs[lease.ticker]
    if (!current || !jobMatchesLease(current, lease)) return { value: false, changed: false }
    state.last_checked_at = iso(at)
    delete state.jobs[lease.ticker]
    return { value: true, changed: true }
  })
}

/** Retire one known-ended attempt and retain its exact identity until the scheduled retry. */
export function retryAutomaticIntakeLease(
  token: AutomaticIntakeLease,
  nextAttemptMs: number,
  stateDir = STATE_DIR,
  now = Date.now(),
): boolean {
  const lease = validLeaseToken(token)
  if (!lease) return false
  return transact(stateDir, now, false, (state, at) => {
    const current = state.jobs[lease.ticker]
    if (!current || !jobMatchesLease(current, lease)) return { value: false, changed: false }
    state.last_checked_at = iso(at)
    current.state = 'retry_wait'
    current.updated_at = iso(at)
    current.next_attempt_at = iso(Math.max(at, nextAttemptMs))
    // Retire the attempt token now. A duplicated/late terminal callback cannot change this wait, and the
    // next admission receives a fresh token even when it retries the same immutable owner/pool identity.
    current.lease_id = null
    current.lease_expires_at = null
    return { value: true, changed: true }
  })
}

/** A durable exact plan can settle its own owner/pool lease during restart reconciliation. */
export function settleAutomaticIntakeIdentity(
  input: AutomaticIntakeLeaseIdentity,
  stateDir = STATE_DIR,
  now = Date.now(),
): boolean {
  const identity = normalizedLeaseIdentity(input)
  if (!identity) return false
  return transact(stateDir, now, false, (state, at) => {
    const current = state.jobs[identity.ticker]
    if (current && !jobMatchesIdentity(current, identity)) return { value: false, changed: false }
    state.last_checked_at = iso(at)
    if (current) delete state.jobs[identity.ticker]
    return { value: true, changed: true }
  })
}

function outcomeId(outcome: AutomaticIntakeOutcome): string {
  return createHash('sha256')
    .update(`${outcome.ticker}\0${outcome.runRoot}\0${outcome.planPath}\0${outcome.planSha256}\0${outcome.decisionFingerprint}`)
    .digest('hex').slice(0, 24)
}

export function recordAutomaticIntakeOutcome(
  outcome: AutomaticIntakeOutcome,
  stateDir = STATE_DIR,
  now = Date.now(),
): string | null {
  const run = RUN_RE.exec(outcome.runRoot)
  if (!TICKER_RE.test(outcome.ticker) || !run || run[1] !== outcome.ticker
      || !PLAN_RE.test(outcome.planPath) || !outcome.planPath.startsWith(`${outcome.runRoot}/intake/`)
      || !SHA_RE.test(outcome.planSha256) || !SHA_RE.test(outcome.decisionFingerprint)
      || !['note_only', 'scoped_rerun', 'insufficient'].includes(outcome.verdict)) return null
  const id = outcomeId(outcome)
  mutate(stateDir, (state, at) => {
    if (state.events[id]) return
    const headline = outcome.verdict === 'note_only'
      ? 'Checked new data. The call did not change.'
      : outcome.verdict === 'scoped_rerun'
        ? 'Checked new data. The call is being updated.'
        : 'Checked new data. There was not enough proof to change the call.'
    state.events[id] = {
      id,
      ticker: outcome.ticker,
      run_root: outcome.runRoot,
      plan_path: outcome.planPath,
      plan_sha256: outcome.planSha256,
      decision_fingerprint: outcome.decisionFingerprint,
      verdict: outcome.verdict,
      at: iso(at),
      headline,
      // The plan itself remains the evidence link. Prompt-authored summaries can be dense research prose;
      // the notification deliberately stays one short, fixed sentence.
      detail: null,
    }
    // Never prune identity receipts: doing so could let a later restart/reconcile recreate an old event.
    // Intake cadence is low and each row is small; durable no-duplicate semantics matter more than a cap.
  }, now)
  return unavailable.has(stateDir) ? null : id
}

export function listAutomaticIntakeOutcomes(stateDir = STATE_DIR, now = Date.now()): AutomaticIntakeEvent[] {
  try {
    return Object.values(read(stateDir, now).events)
      .sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id))
  } catch { return [] }
}

export function getAutomaticIntakeStatus(input: { enabled?: boolean; stateDir?: string; now?: number } = {}): AutomaticIntakeStatus {
  const enabled = input.enabled ?? process.env.INTAKE_AUTO_ANALYZE === '1'
  const stateDir = input.stateDir ?? STATE_DIR
  const now = input.now ?? Date.now()
  let state = empty(now)
  try { state = read(stateDir, now) } catch { /* explicit unavailable state below */ }
  const jobs = Object.values(state.jobs)
  const checkingLeaseLive = (job: IntakeJob): boolean => {
    if (job.state !== 'checking') return false
    if (!job.lease_expires_at) return true // backward-compatible in-process/rollout status
    return Date.parse(job.lease_expires_at) > now
  }
  const running = jobs.filter(checkingLeaseLive).length
  const queued = jobs.filter((job) => job.state === 'retry_wait'
    || (job.state === 'checking' && !checkingLeaseLive(job))).length
  const next = jobs.flatMap((job) => [job.next_attempt_at, job.state === 'checking' ? job.lease_expires_at : null])
    .filter((value): value is string => !!value && Date.parse(value) > now).sort()[0] || null
  if (!enabled) return { enabled: false, state: 'needs_attention', message: 'Automatic new-data checks are off.', last_checked_at: state.last_checked_at, next_check_at: null, queued, running }
  if (unavailable.has(stateDir)) return { enabled: true, state: 'needs_attention', message: unavailable.get(stateDir)!, last_checked_at: state.last_checked_at, next_check_at: null, queued, running }
  const runtime = runtimeByStateDir.get(stateDir)
  if (runtime?.problem) return {
    enabled: true,
    state: 'needs_attention',
    message: runtime.problem,
    last_checked_at: state.last_checked_at,
    next_check_at: null,
    queued,
    running,
  }
  if (!runtime || (!runtime.timerActive && !runtime.passActive)) return {
    enabled: true,
    state: 'needs_attention',
    message: runtime?.problem || 'Automatic new-data watcher is not running on this machine.',
    last_checked_at: state.last_checked_at,
    next_check_at: null,
    queued,
    running,
  }
  if (running || queued) return {
    enabled: true, state: 'checking',
    message: running ? 'New company information is being read now.' : 'A new-data check will retry automatically.',
    last_checked_at: state.last_checked_at, next_check_at: next, queued, running,
  }
  return { enabled: true, state: 'watching', message: 'Watching company folders and material news.', last_checked_at: state.last_checked_at, next_check_at: null, queued: 0, running: 0 }
}
