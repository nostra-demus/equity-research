// Durable automatic decision reviews. The dispatcher decides only WHICH exact call/window is due; the
// injected ordinary launcher remains the sole authority for subject exclusivity, admission, readiness,
// activity logging and paid process lifecycle.
import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'
import { validExactReviewArtifacts } from './launcher'
import { listAllCalls } from './outputs'
import { bridgeMaterialReviewArtifact, bridgeMaterialReviewBytes } from './review-evidence-bridge'
import { publishedTreeAuthority, type PublishedTreeAuthority } from './git-publication'
import { acquireSingletonLock, releaseSingletonLock } from './singleton-lock'
import type { RunStatus } from './types'

export interface DueReview {
  ticker: string
  runRoot: string
  window: string
}

export interface ReviewLaunchResult { runId: string }

export type ReviewLauncher = (
  review: DueReview,
  onTerminal: (status: RunStatus) => void,
) => Promise<ReviewLaunchResult>

/**
 * Return false when no complete local artifact pair exists. Return true only after the exact pair is
 * visible through published authority. Throw when a saved pair exists but cannot be published safely.
 */
export type ReviewPublicationRecovery = (review: DueReview) => Promise<boolean>

export interface ReviewDispatchOptions {
  enabled?: boolean
  stateDir?: string
  tickMs?: number
  initialDelayMs?: number
  dailyCap?: number
  runningLeaseMs?: number
  retryBaseMs?: number
  retryMaxMs?: number
  now?: () => number
  discover?: () => DueReview[]
  reconcileEvidence?: () => number | void
  recoverPublication?: ReviewPublicationRecovery
  authoritativeDiscovery?: boolean
}

type ReviewJobStatus = 'reserved' | 'running' | 'retry_wait' | 'done' | 'held'

interface ReviewJob {
  key: string
  ticker: string
  run_root: string
  window: string
  status: ReviewJobStatus
  attempts: number
  run_id: string | null
  last_error: string | null
  next_attempt_at: string | null
  lease_expires_at: string | null
  created_at: string
  updated_at: string
  publication_pending?: boolean
}

interface ReviewState {
  version: 2
  date: string
  launches_today: number
  last_checked_at: string | null
  next_check_at: string | null
  jobs: Record<string, ReviewJob>
}

export interface ReviewDispatchStatus {
  enabled: boolean
  state: 'watching' | 'checking' | 'needs_attention'
  message: string
  last_checked_at: string | null
  next_check_at: string | null
  queued: number
  running: number
}

const STATE_FILE = 'review-dispatch.json'
const INITIALIZED_FILE = 'review-dispatch.initialized'
const INITIALIZING_FILE = 'review-dispatch.initializing'
const INITIALIZED_BYTES = 'review-dispatch-v2\n'
const INITIALIZING_BYTES = 'review-dispatch-first-write-v1\n'
const LOCK_FILE = 'review-dispatch.lock'
const DEFAULT_TICK_MS = Math.max(300, Number(process.env.REVIEW_TICK_SEC) || 3600) * 1000
const DEFAULT_DAILY_CAP = Math.max(1, Number(process.env.REVIEW_DAILY_CAP) || 8)
const DEFAULT_LEASE_MS = 6 * 60 * 60_000
const DEFAULT_RETRY_MS = 60_000
const MAX_RETRY_MS = 60 * 60_000
const JOB_STATUSES = new Set<ReviewJobStatus>(['reserved', 'running', 'retry_wait', 'done', 'held'])
const WINDOW_RE = /^(?:30d|90d|180d|365d|24m|36m|ad-hoc|post-mortem)$/
const RUN_ROOT_RE = /^analyses\/([A-Z0-9.\-]{1,15})_\d{4}-\d{2}-\d{2}$/
const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/

let timer: ReturnType<typeof setTimeout> | null = null
let passRunning = false
let schedulerPassRunning = false
let loopStateDir: string | null = null
let loopLauncher: ReviewLauncher | null = null
let loopOptions: ReturnType<typeof optionsOf> | null = null
let memory: { stateDir: string; state: ReviewState } | null = null
const unavailable = new Map<string, string>()
const evidenceUnavailable = new Map<string, string>()
const loopStartProblems = new Map<string, string>()
const discoveryUnavailable = new Map<string, string>()

const nowIso = (ms: number): string => new Date(ms).toISOString()
const day = (ms: number): string => nowIso(ms).slice(0, 10)
const nextUtcDay = (ms: number): number => Date.parse(`${day(ms)}T00:00:00.000Z`) + 86_400_000
const keyFor = (review: DueReview): string => `${review.runRoot}|${review.window}`
const fileFor = (stateDir: string): string => path.join(stateDir, STATE_FILE)
const initializedFor = (stateDir: string): string => path.join(stateDir, INITIALIZED_FILE)
const initializingFor = (stateDir: string): string => path.join(stateDir, INITIALIZING_FILE)
const log = (message: string) => console.log(`[review-dispatch] ${message}`) // eslint-disable-line no-console

function exactMarker(marker: string, expected: string): boolean {
  try {
    const stat = fs.lstatSync(marker)
    if (!stat.isFile() || stat.isSymbolicLink() || fs.readFileSync(marker, 'utf8') !== expected) {
      throw new Error(`review marker ${path.basename(marker)} is unsafe`)
    }
    return true
  } catch (error: any) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function missingUsedState(stateDir: string): boolean {
  return exactMarker(initializedFor(stateDir), INITIALIZED_BYTES)
}

function firstWriteWasInterrupted(stateDir: string): boolean {
  return exactMarker(initializingFor(stateDir), INITIALIZING_BYTES)
}

function createMarker(marker: string, bytes: string): void {
  let fd: number | null = null
  try {
    fd = fs.openSync(marker, 'wx', 0o600)
    fs.writeFileSync(fd, bytes, 'utf8')
    fs.fsyncSync(fd)
  } catch (error: any) {
    if (error?.code !== 'EEXIST') throw error
    exactMarker(marker, bytes)
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

function ensureFirstWriteIntent(stateDir: string): void {
  if (missingUsedState(stateDir)) return
  createMarker(initializingFor(stateDir), INITIALIZING_BYTES)
}

function completeFirstWrite(stateDir: string): void {
  createMarker(initializedFor(stateDir), INITIALIZED_BYTES)
  fsyncStateDir(stateDir)
  if (firstWriteWasInterrupted(stateDir)) {
    fs.unlinkSync(initializingFor(stateDir))
    fsyncStateDir(stateDir)
  }
}

type ReviewStateDirFsync = (stateDir: string) => void
let reviewStateDirFsync: ReviewStateDirFsync = (stateDir) => {
  const dir = fs.openSync(stateDir, 'r')
  try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
}

function fsyncStateDir(stateDir: string): void { reviewStateDirFsync(stateDir) }

/** Fault-injection seam for the paid-ledger durability boundary. */
export function __setReviewStateDirFsyncForTest(next: ReviewStateDirFsync): ReviewStateDirFsync {
  const previous = reviewStateDirFsync
  reviewStateDirFsync = next
  return previous
}

function optionsOf(input: ReviewDispatchOptions = {}) {
  const tickMs = Math.max(1_000, input.tickMs ?? DEFAULT_TICK_MS)
  return {
    // Paid scheduled reviews are exact opt-in. This server also runs on admin, failover and developer
    // machines; an unset flag must never make each copy an independent review owner.
    enabled: input.enabled ?? process.env.REVIEW_DISPATCH_ENABLED === '1',
    stateDir: input.stateDir ?? STATE_DIR,
    tickMs,
    initialDelayMs: Math.max(0, input.initialDelayMs ?? 12_000),
    dailyCap: Math.max(1, input.dailyCap ?? DEFAULT_DAILY_CAP),
    runningLeaseMs: Math.max(tickMs, input.runningLeaseMs ?? DEFAULT_LEASE_MS),
    retryBaseMs: Math.max(1_000, input.retryBaseMs ?? DEFAULT_RETRY_MS),
    retryMaxMs: Math.max(1_000, input.retryMaxMs ?? MAX_RETRY_MS),
    now: input.now,
    discover: input.discover,
    // A custom due-review source is a test/embedding seam and must opt into its own evidence scan.
    // Production uses the corrected Calls ledger and reconciles every finished review before discovery.
    reconcileEvidence: input.reconcileEvidence ?? (input.discover ? () => 0 : reconcileMaterialReviewEvidence),
    // The production server injects the exact local-pair detector + publisher. Custom discovery is also
    // a test/embedding seam, so it must opt into publication recovery instead of touching the real repo.
    recoverPublication: input.recoverPublication ?? (async () => false),
    authoritativeDiscovery: input.authoritativeDiscovery ?? input.discover === undefined,
  }
}

function emptyState(now: number): ReviewState {
  return { version: 2, date: day(now), launches_today: 0, last_checked_at: null, next_check_at: null, jobs: {} }
}

function isoOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && Number.isFinite(Date.parse(value)))
}

function validJob(key: string, value: unknown): value is ReviewJob {
  const job = value as ReviewJob
  const match = typeof job?.run_root === 'string' ? RUN_ROOT_RE.exec(job.run_root) : null
  return !!job && typeof job === 'object' && !Array.isArray(job)
    && job.key === key && key === `${job.run_root}|${job.window}`
    && !!match && match[1] === job.ticker && TICKER_RE.test(job.ticker) && WINDOW_RE.test(job.window)
    && JOB_STATUSES.has(job.status) && Number.isInteger(job.attempts) && job.attempts >= 0
    && (job.run_id === null || typeof job.run_id === 'string')
    && (job.last_error === null || typeof job.last_error === 'string')
    && isoOrNull(job.next_attempt_at) && isoOrNull(job.lease_expires_at)
    && (job.publication_pending === undefined || typeof job.publication_pending === 'boolean')
    && typeof job.created_at === 'string' && Number.isFinite(Date.parse(job.created_at))
    && typeof job.updated_at === 'string' && Number.isFinite(Date.parse(job.updated_at))
}

function readState(stateDir: string, now: number): ReviewState {
  let text: string
  try {
    text = fs.readFileSync(fileFor(stateDir), 'utf8')
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      if (missingUsedState(stateDir)) {
        const message = 'saved review history is missing after it was already used'
        unavailable.set(stateDir, message)
        throw Object.assign(new Error(message), { code: 'REVIEW_STATE_UNAVAILABLE' })
      }
      // The first-write intent is durable before any ledger rename, and no paid launch can occur until
      // writeState returns. Intent without ledger is therefore a producer-created pre-admission crash cut,
      // not lost paid history. Invalid marker bytes still throw and fail closed.
      try { firstWriteWasInterrupted(stateDir) }
      catch (markerError: any) {
        const message = `saved review initialization marker is unsafe (${String(markerError?.message || markerError)})`
        unavailable.set(stateDir, message)
        throw Object.assign(new Error(message), { code: 'REVIEW_STATE_UNAVAILABLE' })
      }
      unavailable.delete(stateDir)
      return emptyState(now)
    }
    const message = `saved review history is unreadable (${String(error?.code || error?.message || 'read error')})`
    unavailable.set(stateDir, message)
    throw Object.assign(new Error(message), { code: 'REVIEW_STATE_UNAVAILABLE' })
  }
  try {
    const raw = JSON.parse(text)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 2
        || typeof raw.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)
        || !Number.isInteger(raw.launches_today) || raw.launches_today < 0
        || !isoOrNull(raw.last_checked_at) || !isoOrNull(raw.next_check_at)
        || !raw.jobs || typeof raw.jobs !== 'object' || Array.isArray(raw.jobs)) throw new Error('invalid top-level schema')
    const entries = Object.entries(raw.jobs)
    if (entries.some(([key, job]) => !validJob(key, job))) throw new Error('invalid job schema')
    unavailable.delete(stateDir)
    return { ...raw, jobs: Object.fromEntries(entries) } as ReviewState
  } catch (error: any) {
    const message = `saved review history is corrupt (${String(error?.message || 'invalid JSON')})`
    unavailable.set(stateDir, message)
    throw Object.assign(new Error(message), { code: 'REVIEW_STATE_UNAVAILABLE' })
  }
}

function writeState(stateDir: string, state: ReviewState): void {
  fs.mkdirSync(stateDir, { recursive: true })
  // Make a recoverable pre-admission witness durable before the first ledger rename. The permanent
  // initialized marker follows the durable ledger and is never allowed to exist first. Every directory
  // fsync is required: an EIO/ENOSPC here must stop before the paid launcher, not become best-effort state.
  try {
    ensureFirstWriteIntent(stateDir)
    fsyncStateDir(stateDir)
  } catch (error: any) {
    unavailable.set(stateDir, `saved review initialization marker could not be saved (${String(error?.code || error?.message || 'write error')})`)
    throw error
  }
  const file = fileFor(stateDir)
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`
  let fd: number | null = null
  try {
    fd = fs.openSync(temp, 'wx', 0o600)
    fs.writeFileSync(fd, JSON.stringify(state, null, 2) + '\n', 'utf8')
    fs.fsyncSync(fd)
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
  try {
    fs.renameSync(temp, file)
    fsyncStateDir(stateDir)
    completeFirstWrite(stateDir)
  } catch (error) {
    try { fs.rmSync(temp, { force: true }) } catch { /* preserve original failure */ }
    throw error
  }
  memory = { stateDir, state }
  unavailable.delete(stateDir)
}

function resetDailyBudget(state: ReviewState, now: number): void {
  const today = day(now)
  if (state.date === today) return
  state.date = today
  state.launches_today = 0
}

function retryDelay(attempts: number, options: ReturnType<typeof optionsOf>): number {
  return Math.min(options.retryMaxMs, options.retryBaseMs * 2 ** Math.min(8, Math.max(0, attempts - 1)))
}

function errorInfo(error: any): { retry: boolean; settled: boolean; message: string } {
  const code = String(error?.code || error?.body?.code || '')
  const status = Number(error?.statusCode || 0)
  const settled = code === 'review_no_longer_due'
  const retry = code === 'subject_busy' || code === 'capacity' || status === 409 || status === 429 || status >= 500 || status === 0
  return { retry: !settled && retry, settled, message: String(error?.message || error?.body?.error || 'review could not start').slice(0, 400) }
}

function newJob(review: DueReview, key: string, at: number, status: ReviewJobStatus): ReviewJob {
  return {
    key,
    ticker: review.ticker,
    run_root: review.runRoot,
    window: review.window,
    status,
    attempts: 0,
    run_id: null,
    last_error: null,
    next_attempt_at: null,
    lease_expires_at: null,
    created_at: nowIso(at),
    updated_at: nowIso(at),
  }
}

function terminalUpdate(
  stateDir: string,
  key: string,
  status: RunStatus,
  options: ReturnType<typeof optionsOf>,
  now: () => number,
): void {
  let state: ReviewState
  const at = now()
  try { state = readState(stateDir, at) } catch { return }
  const job = state.jobs[key]
  if (!job) return
  job.updated_at = nowIso(at)
  job.lease_expires_at = null
  if (status === 'done') {
    job.status = 'done'
    job.last_error = null
    job.next_attempt_at = null
  } else if (status === 'error' || status === 'cancelled' || status === 'incomplete') {
    job.status = 'retry_wait'
    job.last_error = `review ended ${status}; it will retry safely`
    job.next_attempt_at = nowIso(at + retryDelay(job.attempts, options))
  } else return
  try { writeState(stateDir, state) } catch { unavailable.set(stateDir, 'saved review history could not be updated safely') }
}

/** Current due projection. Historical calls remain exact: ticker is parsed from their dated run root. */
export function dueReviews(): DueReview[] {
  const due: DueReview[] = []
  const calls: any[] = listAllCalls().calls
  for (const call of calls) {
    const runRoot = String(call?.run_root || '')
    const ticker = String(call?.ticker || '')
    const window = String(call?.next_checkpoint?.window || '')
    const match = RUN_ROOT_RE.exec(runRoot)
    if (match && match[1] === ticker && WINDOW_RE.test(window)
        && (call?.next_checkpoint?.status === 'due' || call?.next_checkpoint?.status === 'overdue')) {
      due.push({ ticker, runRoot, window })
    }
  }
  return due.sort((a, b) => keyFor(a).localeCompare(keyFor(b)))
}

/**
 * Recover material review evidence independently of the paid review job ledger. A process can stop after
 * the append-only review pair is durable but before its evidence note is queued; the now-finished window
 * is intentionally absent from dueReviews(), so this idempotent scan must not depend on due discovery.
 */
export function reconcileMaterialReviewEvidence(input: {
  calls?: any[]
  artifacts?: typeof validExactReviewArtifacts
  bridge?: typeof bridgeMaterialReviewArtifact
  bridgePublished?: typeof bridgeMaterialReviewBytes
  authority?: PublishedTreeAuthority
} = {}): number {
  const calls = input.calls ?? listAllCalls().calls
  const customLocalProjection = !!input.artifacts || !!input.bridge
  const artifacts = input.artifacts ?? validExactReviewArtifacts
  const bridge = input.bridge ?? bridgeMaterialReviewArtifact
  const bridgePublished = input.bridgePublished ?? bridgeMaterialReviewBytes
  const authority = customLocalProjection ? null : (input.authority ?? publishedTreeAuthority('analyses'))
  let queued = 0
  const failures: string[] = []
  for (const call of calls) {
    const ticker = String(call?.ticker || '')
    const runRoot = String(call?.run_root || '')
    const match = RUN_ROOT_RE.exec(runRoot)
    if (!match || match[1] !== ticker) continue
    for (const row of Array.isArray(call?.timeline) ? call.timeline : []) {
      const window = String(row?.window || '')
      if (row?.status !== 'done' || !WINDOW_RE.test(window)) continue
      if (customLocalProjection) {
        for (const artifact of artifacts(runRoot, ticker, window)) {
          try {
            if (bridge({ runRoot, ticker, window }, artifact.file)) queued++
          } catch (error: any) {
            failures.push(`${ticker} ${window}: ${String(error?.message || 'recovery error')}`)
          }
        }
        continue
      }
      const reviewPath = String(row?.review_file || '')
      const prefix = `${runRoot}/reviews/`
      if (!reviewPath.startsWith(prefix) || reviewPath.slice(prefix.length).includes('/')) {
        failures.push(`${ticker} ${window}: published review path is unavailable`)
        continue
      }
      const name = reviewPath.slice(prefix.length)
      try {
        if (!authority!.paths.has(reviewPath)) throw new Error('published review blob is unavailable')
        const rawText = authority!.readRequired(reviewPath).toString('utf8')
        if (bridgePublished({ runRoot, ticker, window, decisionDate: String(call?.decision_date || '') }, name, rawText)) queued++
      } catch (error: any) {
        failures.push(`${ticker} ${window}: ${String(error?.message || 'recovery error')}`)
      }
    }
  }
  if (failures.length) throw new Error(failures.slice(0, 3).join('; '))
  return queued
}

export async function dispatchDueReviews(
  launcher: ReviewLauncher,
  input: ReviewDispatchOptions = {},
): Promise<boolean> {
  const options = optionsOf(input)
  if (!options.enabled || passRunning) return false
  passRunning = true
  const now = options.now ?? Date.now
  const started = now()
  let state: ReviewState
  try {
    state = readState(options.stateDir, started)
    resetDailyBudget(state, started)
    try {
      options.reconcileEvidence()
      evidenceUnavailable.delete(options.stateDir)
    } catch (error: any) {
      const message = `saved review evidence could not be queued (${String(error?.message || 'recovery error')})`
      evidenceUnavailable.set(options.stateDir, message)
      // Keep recovering this evidence every pass, but do not let one call's temporary pool problem stop
      // unrelated scheduled checks. The status remains visibly needs-attention until reconciliation works.
      log(message)
    }
    const discovered = (options.discover ?? dueReviews)()
    if (!Array.isArray(discovered) || discovered.some((review) => {
      const match = RUN_ROOT_RE.exec(review?.runRoot || '')
      return !match || match[1] !== review.ticker || !WINDOW_RE.test(review.window)
    })) throw new Error('due review discovery returned an unsafe identity')
    discoveryUnavailable.delete(options.stateDir)

    // A process can stop after a saved pair is published but before this ledger records `done`, or
    // another owner can settle the window while our launch/retry lease is still present. Production
    // discovery then correctly omits the no-longer-due row. Reconcile only jobs whose exact publication
    // authority says settled; mere absence is never enough (it can also mean a discovery failure).
    const reconciledPublished = new Set<string>()
    if (options.authoritativeDiscovery) {
      for (const job of Object.values(state.jobs)) {
        if (job.status === 'done' || job.status === 'held') continue
        const lease = job.lease_expires_at ? Date.parse(job.lease_expires_at) : NaN
        if ((job.status === 'reserved' || job.status === 'running')
            && Number.isFinite(lease) && lease > started) continue
        try {
          const settled = await options.recoverPublication({ ticker: job.ticker, runRoot: job.run_root, window: job.window })
          if (!settled) continue
          job.status = 'done'
          job.run_id = null
          job.last_error = null
          job.next_attempt_at = null
          job.lease_expires_at = null
          job.publication_pending = false
          job.updated_at = nowIso(started)
          reconciledPublished.add(job.key)
        } catch { /* keep the exact job retryable below or on the next pass */ }
      }
    }

    state.last_checked_at = nowIso(started)
    state.next_check_at = nowIso(started + options.tickMs)
    writeState(options.stateDir, state)

    for (const review of [...new Map(discovered.map((row) => [keyFor(row), row])).values()]) {
      state = readState(options.stateDir, now())
      resetDailyBudget(state, now())
      const key = keyFor(review)
      // Discovery happened before publication reconciliation. Do not reopen a job that this same pass
      // just proved settled merely because the in-memory due snapshot is now one read behind.
      if (reconciledPublished.has(key)) continue
      let job = state.jobs[key]
      const at = now()
      if (job?.status === 'held') continue
      if (job?.status === 'done') {
        // With the production Calls projection, a discovered row is authoritative evidence that this
        // window is still due. Reopen stale ledgers written by an older process that trusted local-only
        // files. Custom discovery remains an explicit deterministic test/embedding seam and keeps dedupe.
        if (!options.authoritativeDiscovery) continue
        job.status = 'retry_wait'
        job.last_error = 'The saved review was not shared. Retrying safely.'
        job.next_attempt_at = null
        job.publication_pending = false
      }
      const lease = job?.lease_expires_at ? Date.parse(job.lease_expires_at) : NaN
      if ((job?.status === 'running' || job?.status === 'reserved') && Number.isFinite(lease) && lease > at) continue
      const next = job?.next_attempt_at ? Date.parse(job.next_attempt_at) : NaN
      if (job?.status === 'retry_wait' && Number.isFinite(next) && next > at) continue

      // A review can finish locally while its push fails. Publish those saved bytes before reserving a
      // second paid run. A true result is authoritative only because the injected callback's contract
      // requires it to re-read the published artifact pair after the push.
      try {
        const recovered = await options.recoverPublication(review)
        if (typeof recovered !== 'boolean') throw new Error('review publication recovery returned an invalid result')
        if (recovered) {
          job = state.jobs[key] = job ?? newJob(review, key, at, 'done')
          job.status = 'done'
          job.run_id = null
          job.last_error = null
          job.next_attempt_at = null
          job.lease_expires_at = null
          job.publication_pending = false
          job.updated_at = nowIso(at)
          writeState(options.stateDir, state)
          return false
        }
        // Once a saved pair has been observed, losing sight of it is not permission to buy the same
        // research again. Keep this exact job on its publication-only path until authority agrees.
        if (job?.publication_pending) throw new Error('saved review is still waiting to be published')
      } catch (error: any) {
        job = state.jobs[key] = job ?? newJob(review, key, at, 'retry_wait')
        job.status = 'retry_wait'
        job.attempts += 1
        job.run_id = null
        job.last_error = `saved review could not be published (${String(error?.message || 'publication error').slice(0, 320)}); it will retry safely`
        job.next_attempt_at = nowIso(at + retryDelay(job.attempts, options))
        job.lease_expires_at = null
        job.publication_pending = true
        job.updated_at = nowIso(at)
        writeState(options.stateDir, state)
        return false
      }
      if (state.launches_today >= options.dailyCap) {
        // A discovered due review does not disappear merely because today's paid allowance is used.
        // Persist every remaining exact key so status stays truthful and tomorrow's pass retries without
        // needing another discovery edge or any user action.
        job = state.jobs[key] = job ?? newJob(review, key, at, 'retry_wait')
        job.status = 'retry_wait'
        job.run_id = null
        job.last_error = 'Today’s automatic review allowance is used; this review will run after the reset.'
        job.next_attempt_at = nowIso(nextUtcDay(at))
        job.lease_expires_at = null
        job.publication_pending = false
        job.updated_at = nowIso(at)
        writeState(options.stateDir, state)
        continue
      }

      // Reserve + burn the daily slot BEFORE launcher admission. A crash after its early ACK cannot reopen
      // this exact run/window; a terminal error moves it to bounded retry without erasing its history.
      job = state.jobs[key] = job ?? newJob(review, key, at, 'reserved')
      job.status = 'reserved'
      job.attempts += 1
      job.updated_at = nowIso(at)
      job.lease_expires_at = nowIso(at + options.runningLeaseMs)
      job.next_attempt_at = null
      job.last_error = null
      job.publication_pending = false
      state.launches_today += 1
      writeState(options.stateDir, state)

      try {
        const launched = await launcher(review, (status) => terminalUpdate(options.stateDir, key, status, options, now))
        const after = now()
        state = readState(options.stateDir, after)
        const current = state.jobs[key]
        if (current?.status === 'reserved') {
          current.status = 'running'
          current.run_id = launched.runId
          current.updated_at = nowIso(after)
          current.lease_expires_at = nowIso(after + options.runningLeaseMs)
          writeState(options.stateDir, state)
        }
        return true // one launch per pass
      } catch (error: any) {
        const after = now()
        const info = errorInfo(error)
        try {
          state = readState(options.stateDir, after)
          const current = state.jobs[key]
          if (current) {
            current.status = info.settled ? 'done' : info.retry ? 'retry_wait' : 'held'
            current.last_error = info.settled ? null : info.message
            current.updated_at = nowIso(after)
            current.lease_expires_at = null
            current.next_attempt_at = info.retry ? nowIso(after + retryDelay(current.attempts, options)) : null
            if (info.settled) state.launches_today = Math.max(0, state.launches_today - 1)
            writeState(options.stateDir, state)
          }
        } catch {
          // The reservation is already durable. If the follow-up write fails, keep it reserved until its
          // lease expires instead of erasing the only evidence that a paid launch may have been admitted.
          unavailable.set(options.stateDir, 'saved review history could not be updated safely')
        }
        return false // bounded: never try a second paid review in the same pass
      }
    }
    return false
  } catch (error: any) {
    if (error?.code !== 'REVIEW_STATE_UNAVAILABLE') {
      discoveryUnavailable.set(options.stateDir,
        `Automatic reviews cannot read the saved Calls history (${String(error?.message || error || 'read error').slice(0, 160)}).`)
      try {
        const at = now()
        state = readState(options.stateDir, at)
        state.last_checked_at = nowIso(at)
        state.next_check_at = nowIso(at + options.tickMs)
        writeState(options.stateDir, state)
      } catch { /* preserve the existing ledger when authority becomes unavailable */ }
    }
    log(error?.code === 'REVIEW_STATE_UNAVAILABLE'
      ? String(error.message)
      : `pass failed: ${String(error?.message || error)}`)
    return false
  } finally {
    passRunning = false
  }
}

function releaseLoopOwner(stateDir: string): void {
  if (timer) clearTimeout(timer)
  timer = null
  schedulerPassRunning = false
  loopLauncher = null
  loopOptions = null
  if (loopStateDir === stateDir) releaseSingletonLock(stateDir, LOCK_FILE)
  loopStateDir = null
}

function schedule(delay: number): boolean {
  const launcher = loopLauncher
  const options = loopOptions
  if (!launcher || !options || loopStateDir !== options.stateDir) return false
  try {
    timer = setTimeout(async () => {
      timer = null
      if (loopLauncher !== launcher || loopOptions !== options || loopStateDir !== options.stateDir) return
      schedulerPassRunning = true
      try {
        await dispatchDueReviews(launcher, options)
        loopStartProblems.delete(options.stateDir)
      } catch (error: any) {
        loopStartProblems.set(options.stateDir,
          `Automatic review watcher stopped after an unexpected error (${String(error?.message || error || 'unknown error').slice(0, 160)}).`)
      } finally {
        schedulerPassRunning = false
      }
      if (loopLauncher !== launcher || loopOptions !== options || loopStateDir !== options.stateDir) return
      if (!schedule(options.tickMs)) {
        loopStartProblems.set(options.stateDir, 'Automatic review watcher could not schedule its next check.')
        releaseLoopOwner(options.stateDir)
      }
    }, delay)
    timer.unref?.()
    return true
  } catch (error: any) {
    timer = null
    loopStartProblems.set(options.stateDir,
      `Automatic review watcher could not start (${String(error?.message || error || 'scheduler error').slice(0, 160)}).`)
    return false
  }
}

export function startReviewLoop(launcher: ReviewLauncher, input: ReviewDispatchOptions = {}): boolean {
  const options = optionsOf(input)
  if (timer || loopLauncher || schedulerPassRunning) {
    if (loopStateDir !== options.stateDir) {
      loopStartProblems.set(options.stateDir, 'Automatic review watcher did not start because this process already owns another watcher.')
    }
    return false
  }
  try { memory = { stateDir: options.stateDir, state: readState(options.stateDir, (options.now ?? Date.now)()) } }
  catch { memory = null }
  if (!options.enabled) {
    log('loop off — set REVIEW_DISPATCH_ENABLED=1 to turn it on')
    return false
  }
  // The job ledger prevents one exact review/window from replaying after a crash. This retained kernel
  // lease closes the separate restart-overlap race where two server processes read the same free ledger
  // before either has reserved a job. The descriptor lives until stopReviewLoop/process exit; the stable
  // lock pathname is never deleted, so stale PIDs and unlink/recreate races cannot create two owners.
  if (!acquireSingletonLock(options.stateDir, LOCK_FILE)) {
    log('loop not started — another process owns automatic scheduled reviews')
    loopStartProblems.set(options.stateDir, 'Automatic review watcher did not start on this machine. Another process may already own it.')
    return false
  }
  loopStateDir = options.stateDir
  loopLauncher = launcher
  loopOptions = options
  loopStartProblems.delete(options.stateDir)
  if (!schedule(options.initialDelayMs)) {
    releaseLoopOwner(options.stateDir)
    return false
  }
  log(`loop on — exact due reviews every ${Math.round(options.tickMs / 1000)}s, ${options.dailyCap}/day`)
  return true
}

export function stopReviewLoop(): void {
  const stateDir = loopStateDir
  passRunning = false
  if (stateDir) releaseLoopOwner(stateDir)
  else {
    if (timer) clearTimeout(timer)
    timer = null
    schedulerPassRunning = false
    loopLauncher = null
    loopOptions = null
  }
}

export function readDispatchState(input: ReviewDispatchOptions = {}): ReviewState | null {
  const options = optionsOf(input)
  try { return readState(options.stateDir, (options.now ?? Date.now)()) }
  catch { return null }
}

export function getReviewDispatchStatus(input: ReviewDispatchOptions = {}): ReviewDispatchStatus {
  const options = optionsOf(input)
  let state: ReviewState
  if (memory?.stateDir === options.stateDir) state = memory.state
  else {
    try { state = readState(options.stateDir, (options.now ?? Date.now)()) }
    catch { state = emptyState((options.now ?? Date.now)()) }
  }
  const rows = Object.values(state.jobs)
  const running = rows.filter((job) => job.status === 'reserved' || job.status === 'running').length
  const queued = rows.filter((job) => job.status === 'retry_wait').length
  const held = rows.filter((job) => job.status === 'held').length
  if (!options.enabled) return { enabled: false, state: 'needs_attention', message: 'Automatic call reviews are turned off.', last_checked_at: state.last_checked_at, next_check_at: null, queued, running }
  if (unavailable.has(options.stateDir)) return { enabled: true, state: 'needs_attention', message: 'Automatic reviews are paused because their saved history cannot be read safely.', last_checked_at: state.last_checked_at, next_check_at: null, queued, running }
  if (evidenceUnavailable.has(options.stateDir)) return { enabled: true, state: 'needs_attention', message: 'A saved review could not be queued for the next automatic call update. The system will keep trying.', last_checked_at: state.last_checked_at, next_check_at: null, queued, running }
  if (discoveryUnavailable.has(options.stateDir)) return { enabled: true, state: 'needs_attention', message: 'Automatic reviews cannot read the saved Calls history safely.', last_checked_at: state.last_checked_at, next_check_at: null, queued, running }
  const ownsHealthyLoop = loopStateDir === options.stateDir
    && loopLauncher !== null
    && loopOptions?.stateDir === options.stateDir
    && (timer !== null || schedulerPassRunning)
  if (!ownsHealthyLoop) return {
    enabled: true,
    state: 'needs_attention',
    message: loopStartProblems.get(options.stateDir) || 'Automatic review watcher is not running on this machine.',
    last_checked_at: state.last_checked_at,
    next_check_at: null,
    queued,
    running,
  }
  if (held) return {
    enabled: true,
    state: 'needs_attention',
    message: held === 1
      ? 'A scheduled call review needs attention before it can continue.'
      : `${held} scheduled call reviews need attention before they can continue.`,
    last_checked_at: state.last_checked_at,
    next_check_at: state.next_check_at,
    queued,
    running,
  }
  if (running || queued) return { enabled: true, state: 'checking', message: running ? 'A scheduled call review is running.' : 'A scheduled call review will retry automatically.', last_checked_at: state.last_checked_at, next_check_at: state.next_check_at, queued, running }
  return { enabled: true, state: 'watching', message: 'Scheduled call reviews run automatically.', last_checked_at: state.last_checked_at, next_check_at: state.next_check_at, queued: 0, running: 0 }
}
