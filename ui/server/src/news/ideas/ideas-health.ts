// Runtime health for the PM-skim idea pass. This state is deliberately separate from ideas-pass.json:
// the latter is only the hash/interval throttle, while this file answers the operational question "is
// the pass working, waiting, or failing?". Every eligibility decision is persisted, but provider stamps
// retain strict meanings: last_attempt_at changes only immediately before a real provider batch and
// last_success_at changes on every ok provider result, including a valid empty [] result.

import fs from 'node:fs'
import path from 'node:path'
import { isRfc3339 } from '../../rfc3339'
import { isSurfacedIdeaSnapshot, readIdeaSnapshotStore, type IdeaSnapshotStoreStatus } from './ideas-store'

export const IDEAS_HEALTH_SCHEMA_VERSION = 'ideas-health/v1' as const

export type IdeasHealthStatus = 'disabled' | 'waiting' | 'deferred' | 'running' | 'healthy' | 'degraded' | 'error'
export type IdeasHealthOutcome = 'not_run' | 'skipped' | 'success_empty' | 'success_with_ideas' | 'failed'
export type IdeasHealthReasonCode =
  | 'disabled'
  | 'never_run'
  | 'ingester_disabled'
  | 'insufficient_inputs'
  | 'min_interval'
  | 'inputs_unchanged'
  | 'missing_api_key'
  | 'provider_cooldown'
  | 'daily_budget'
  | 'paced_budget'
  | 'rate_limiter_busy'
  | 'provider_error'
  | 'internal_error'
  | 'stale_running'
  | 'stale_health'
  | 'health_corrupt'
  | 'stale_inputs'
  | 'snapshot_store_error'
  | 'write_conflict'

export interface IdeaSnapshotStoreDiagnostics {
  status: IdeaSnapshotStoreStatus
  file_count: number
  valid_count: number
  corrupt_count: number
  invalid_count: number
  unprojectable_count: number
  error: string | null
}

export interface IdeasHealthV1 {
  schema_version: typeof IDEAS_HEALTH_SCHEMA_VERSION
  enabled: boolean
  status: IdeasHealthStatus
  outcome: IdeasHealthOutcome
  reason_code: IdeasHealthReasonCode | null
  reason: string | null
  updated_at: string
  last_attempt_at: string | null
  last_success_at: string | null
  next_eligible_at: string | null
  input_count: number
  produced_count: number
  live_count: number
  stale_count: number
  snapshot_store: IdeaSnapshotStoreDiagnostics
}

export interface IdeaSnapshotCounts { live_count: number; stale_count: number }
export interface IdeaSnapshotState extends IdeaSnapshotCounts { snapshot_store: IdeaSnapshotStoreDiagnostics }

const HEALTH_FILE = 'ideas-health.json'
// surfaceIdeasBatch is bounded to two 30s requests plus one short retry delay. If the process dies after
// writing "running", fail closed after two minutes instead of showing a spinner forever after restart.
const STALE_RUNNING_MS = 120_000
// A healthy/waiting snapshot is evidence of a live scheduler, not a perpetual certificate. Keep the
// historical two-hour floor for normal deployments, but expand it when the configured producer loop is
// slower so a healthy pass cannot be declared dead before its next scheduled opportunity.
const IDEAS_HEALTH_MIN_LIVENESS_MS = 2 * 60 * 60_000
export function ideasHealthLivenessMs(loopIntervalMs: number): number {
  const interval = Number.isFinite(loopIntervalMs) && loopIntervalMs > 0
    ? Math.min(loopIntervalMs, Math.floor(Number.MAX_SAFE_INTEGER / 2))
    : 0
  return Math.max(IDEAS_HEALTH_MIN_LIVENESS_MS, Math.ceil(interval * 2))
}
export const IDEAS_HEALTH_LIVENESS_MS = ideasHealthLivenessMs(0)

const STATUSES = new Set<IdeasHealthStatus>(['disabled', 'waiting', 'deferred', 'running', 'healthy', 'degraded', 'error'])
const OUTCOMES = new Set<IdeasHealthOutcome>(['not_run', 'skipped', 'success_empty', 'success_with_ideas', 'failed'])
const REASONS = new Set<IdeasHealthReasonCode>([
  'disabled', 'never_run', 'ingester_disabled', 'insufficient_inputs', 'min_interval', 'inputs_unchanged',
  'missing_api_key', 'provider_cooldown', 'daily_budget', 'paced_budget', 'rate_limiter_busy',
  'provider_error', 'internal_error', 'stale_running', 'stale_health', 'health_corrupt', 'stale_inputs',
  'snapshot_store_error', 'write_conflict',
])

function iso(ms: number): string { return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z') }
function nonNegativeInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}
function nullableString(v: unknown): string | null { return typeof v === 'string' && v ? v : null }
function validCount(v: unknown): boolean { return typeof v === 'number' && Number.isInteger(v) && v >= 0 }
function validNullableDate(v: unknown): boolean {
  return v === null || isRfc3339(v)
}

function emptySnapshotStore(status: IdeaSnapshotStoreStatus = 'missing'): IdeaSnapshotStoreDiagnostics {
  return { status, file_count: 0, valid_count: 0, corrupt_count: 0, invalid_count: 0, unprojectable_count: 0, error: null }
}

function waitingState(nowMs: number, state: IdeaSnapshotState): IdeasHealthV1 {
  return {
    schema_version: IDEAS_HEALTH_SCHEMA_VERSION,
    enabled: true,
    status: 'waiting',
    outcome: 'not_run',
    reason_code: 'never_run',
    reason: 'The idea pass has not made a provider attempt yet.',
    updated_at: iso(nowMs),
    last_attempt_at: null,
    last_success_at: null,
    next_eligible_at: null,
    input_count: 0,
    produced_count: 0,
    ...state,
  }
}

/** Persist one startup heartbeat only when no health record exists. A reader must never fabricate this
 * heartbeat on demand, because doing so would make a scheduler that never started look perpetually fresh. */
export function initializeIdeasHealth(stateDir: string, repoRoot: string, nowMs = Date.now()): IdeasHealthV1 | null {
  if (inspectPersistedIdeasHealth(stateDir).status !== 'missing') return null
  const health = waitingState(nowMs, inspectIdeaSnapshots(repoRoot, nowMs))
  writeIdeasHealth(stateDir, health)
  return health
}

/** Current snapshot counts plus store integrity, using the same fail-closed validity/decay rule as the
 * live API. A missing directory is a clean empty store; malformed files are separately diagnosable. */
export function inspectIdeaSnapshots(repoRoot: string, nowMs = Date.now()): IdeaSnapshotState {
  let live = 0
  let stale = 0
  let unprojectable = 0
  const store = readIdeaSnapshotStore(repoRoot)
  for (const idea of store.snapshots) {
    if (!isSurfacedIdeaSnapshot(idea)) { unprojectable++; continue }
    const decay = isRfc3339(idea.decay_at) ? Date.parse(idea.decay_at) : NaN
    // A malformed/missing decay must not create an immortal "live" lead. The runtime board projection
    // uses the same fail-closed rule and keeps the row inspectable only in its cooling lane.
    if (!Number.isFinite(decay) || decay <= nowMs) stale++
    else live++
  }
  return {
    live_count: live,
    stale_count: stale,
    snapshot_store: {
      status: store.status === 'ok' && unprojectable ? 'degraded' : store.status,
      file_count: store.file_count,
      valid_count: live + stale,
      corrupt_count: store.corrupt_count,
      invalid_count: store.invalid_count,
      unprojectable_count: unprojectable,
      error: store.error,
    },
  }
}

/** Count-only compatibility helper for existing board callers/tests. */
export function countIdeaSnapshots(repoRoot: string, nowMs = Date.now()): IdeaSnapshotCounts {
  const { live_count, stale_count } = inspectIdeaSnapshots(repoRoot, nowMs)
  return { live_count, stale_count }
}

export type PersistedIdeasHealthRead =
  | { status: 'missing'; health: null; error: null }
  | { status: 'corrupt'; health: null; error: string }
  | { status: 'ok'; health: IdeasHealthV1; error: null }

/** Strict v1 reader with missing/corrupt distinction for the operational view. */
export function inspectPersistedIdeasHealth(stateDir: string): PersistedIdeasHealthRead {
  const fp = path.join(stateDir, HEALTH_FILE)
  let raw: string
  try { raw = fs.readFileSync(fp, 'utf8') } catch (e: any) {
    if (e?.code === 'ENOENT') return { status: 'missing', health: null, error: null }
    return { status: 'corrupt', health: null, error: String(e?.message || e).slice(0, 240) }
  }
  try {
    const o: any = JSON.parse(raw)
    const bad = (message: string): PersistedIdeasHealthRead => ({ status: 'corrupt', health: null, error: message })
    if (o?.schema_version !== IDEAS_HEALTH_SCHEMA_VERSION) return bad('unsupported or missing health schema')
    if (typeof o.enabled !== 'boolean' || !STATUSES.has(o.status) || !OUTCOMES.has(o.outcome)) return bad('invalid status or outcome')
    if (o.reason_code !== null && !REASONS.has(o.reason_code)) return bad('invalid reason code')
    if (!isRfc3339(o.updated_at)) return bad('invalid updated_at')
    if (o.reason !== null && typeof o.reason !== 'string') return bad('invalid reason')
    if (![o.last_attempt_at, o.last_success_at, o.next_eligible_at].every(validNullableDate)) return bad('invalid lifecycle timestamp')
    if (![o.input_count, o.produced_count, o.live_count, o.stale_count].every(validCount)) return bad('invalid counter')
    if (o.status === 'running' && !isRfc3339(o.last_attempt_at)) return bad('running state has no attempt timestamp')
    if (o.outcome === 'success_empty' && o.produced_count !== 0) return bad('success_empty has a non-zero produced_count')
    if (o.outcome === 'success_with_ideas' && o.produced_count < 1) return bad('success_with_ideas has no produced ideas')
    const rawStore = o.snapshot_store
    let snapshotStore: IdeaSnapshotStoreDiagnostics
    if (rawStore === undefined) {
      // Backward compatibility for an older v1 writer. Absence is distinct from a present-but-corrupt
      // diagnostics object; the latter must fail closed.
      snapshotStore = { ...emptySnapshotStore(o.live_count + o.stale_count ? 'ok' : 'missing'), valid_count: o.live_count + o.stale_count }
    } else {
      const storeValid = rawStore && typeof rawStore === 'object'
        && ['missing', 'ok', 'degraded', 'unreadable'].includes(rawStore.status)
        && [rawStore.file_count, rawStore.valid_count, rawStore.corrupt_count, rawStore.invalid_count, rawStore.unprojectable_count].every(validCount)
        && (rawStore.error === null || typeof rawStore.error === 'string')
      if (!storeValid) return bad('invalid snapshot-store diagnostics')
      if (rawStore.valid_count !== o.live_count + o.stale_count) return bad('snapshot-store count does not reconcile')
      if (rawStore.valid_count + rawStore.corrupt_count + rawStore.invalid_count + rawStore.unprojectable_count !== rawStore.file_count) return bad('snapshot-store file totals do not reconcile')
      snapshotStore = rawStore
    }
    return { status: 'ok', error: null, health: {
      schema_version: IDEAS_HEALTH_SCHEMA_VERSION,
      enabled: o.enabled,
      status: o.status,
      outcome: o.outcome,
      reason_code: nullableString(o.reason_code) as IdeasHealthReasonCode | null,
      reason: nullableString(o.reason),
      updated_at: o.updated_at,
      last_attempt_at: nullableString(o.last_attempt_at),
      last_success_at: nullableString(o.last_success_at),
      next_eligible_at: nullableString(o.next_eligible_at),
      input_count: nonNegativeInt(o.input_count),
      produced_count: nonNegativeInt(o.produced_count),
      live_count: nonNegativeInt(o.live_count),
      stale_count: nonNegativeInt(o.stale_count),
      snapshot_store: snapshotStore,
    } }
  } catch (e: any) {
    return { status: 'corrupt', health: null, error: String(e?.message || e).slice(0, 240) }
  }
}

/** Compatibility reader. Prefer inspectPersistedIdeasHealth where missing vs corrupt affects truth. */
export function readPersistedIdeasHealth(stateDir: string): IdeasHealthV1 | null {
  return inspectPersistedIdeasHealth(stateDir).health
}

/** Atomic best-effort persistence. Health must never be allowed to break the pass it observes. */
export function writeIdeasHealth(stateDir: string, health: IdeasHealthV1): void {
  const file = path.join(stateDir, HEALTH_FILE)
  const tmp = `${file}.tmp.${process.pid}`
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(tmp, JSON.stringify(health, null, 2) + '\n')
    fs.renameSync(tmp, file)
  } catch {
    // A missed health write loses diagnostics, not idea output or budget accounting.
  } finally {
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp) } catch { /* best effort */ }
  }
}

/** Merge a transition onto the last known state and persist a complete v1 record. */
export function updateIdeasHealth(
  stateDir: string,
  patch: Partial<Omit<IdeasHealthV1, 'schema_version' | 'updated_at'>>,
  nowMs = Date.now(),
  state: IdeaSnapshotState = { live_count: 0, stale_count: 0, snapshot_store: emptySnapshotStore() },
): IdeasHealthV1 {
  const prior = readPersistedIdeasHealth(stateDir) || waitingState(nowMs, state)
  const next: IdeasHealthV1 = {
    ...prior,
    ...patch,
    schema_version: IDEAS_HEALTH_SCHEMA_VERSION,
    enabled: patch.enabled ?? true,
    updated_at: iso(nowMs),
    live_count: state.live_count,
    stale_count: state.stale_count,
    snapshot_store: state.snapshot_store,
  }
  writeIdeasHealth(stateDir, next)
  return next
}

/**
 * Runtime board view. The live NEWS.ideasEnabled switch is authoritative over both the persisted record
 * and any stale ideas_health object in the generated board. A stale persisted "running" state is also
 * downgraded fail-closed, which makes a crash visible instead of leaving a permanent spinner.
 */
export function readIdeasHealth(
  stateDir: string,
  repoRoot: string,
  enabled: boolean,
  nowMs = Date.now(),
  livenessMs = IDEAS_HEALTH_LIVENESS_MS,
): IdeasHealthV1 {
  const state = inspectIdeaSnapshots(repoRoot, nowMs)
  const persistedRead = inspectPersistedIdeasHealth(stateDir)
  const base = persistedRead.health || waitingState(nowMs, state)
  if (!enabled) {
    return {
      ...base,
      enabled: false,
      status: 'disabled',
      reason_code: 'disabled',
      reason: 'The idea pass is disabled by IDEAS_ENABLED.',
      updated_at: iso(nowMs),
      next_eligible_at: null,
      ...state,
    }
  }
  if (persistedRead.status === 'corrupt') {
    const cached = state.live_count + state.stale_count > 0
    return {
      ...waitingState(nowMs, state),
      status: cached ? 'degraded' : 'error',
      outcome: 'failed',
      reason_code: 'health_corrupt',
      reason: `The idea-pass health record is corrupt: ${persistedRead.error}`,
    }
  }
  if (persistedRead.status === 'missing') {
    const cached = state.live_count + state.stale_count > 0
    return {
      ...base,
      status: cached ? 'degraded' : 'error',
      outcome: 'failed',
      reason_code: 'never_run',
      reason: 'No idea-pass startup heartbeat exists; the scheduler may not have started or health persistence failed.',
      ...state,
    }
  }
  // A kill switch may have been removed since the persisted record was written. Configuration is live
  // truth; until the next scheduler tick, show an enabled waiting state instead of `enabled:true` paired
  // with the stale word "disabled".
  if (base.status === 'disabled') return waitingState(nowMs, state)
  const attempted = base.last_attempt_at ? Date.parse(base.last_attempt_at) : NaN
  const updated = Date.parse(base.updated_at)
  const futureLifecycle = [updated, attempted, base.last_success_at ? Date.parse(base.last_success_at) : NaN]
    .some((stamp) => Number.isFinite(stamp) && stamp > nowMs + 5 * 60_000)
  if (futureLifecycle) {
    const cached = state.live_count + state.stale_count > 0
    return {
      ...base,
      enabled: true,
      status: cached ? 'degraded' : 'error',
      outcome: 'failed',
      reason_code: 'health_corrupt',
      reason: 'The idea-pass health record contains a future lifecycle timestamp.',
      updated_at: iso(nowMs),
      next_eligible_at: null,
      produced_count: 0,
      ...state,
    }
  }
  if (base.status === 'running' && Number.isFinite(attempted) && nowMs - attempted > STALE_RUNNING_MS) {
    const cached = state.live_count + state.stale_count > 0
    return {
      ...base,
      status: cached ? 'degraded' : 'error',
      outcome: 'failed',
      reason_code: 'stale_running',
      reason: 'The last provider attempt did not record a completion; the process may have stopped mid-pass.',
      updated_at: iso(nowMs),
      next_eligible_at: null,
      produced_count: 0,
      ...state,
    }
  }
  const liveState = base.status === 'healthy' || base.status === 'waiting' || base.status === 'deferred'
  if (liveState && Number.isFinite(updated) && nowMs - updated > Math.max(1, livenessMs)) {
    const cached = state.live_count + state.stale_count > 0
    return {
      ...base,
      enabled: true,
      status: cached ? 'degraded' : 'error',
      outcome: 'failed',
      reason_code: 'stale_health',
      reason: 'The idea-pass health heartbeat expired; the scheduler may not be running.',
      updated_at: iso(nowMs),
      next_eligible_at: null,
      produced_count: 0,
      ...state,
    }
  }
  if ((state.snapshot_store.status === 'degraded' || state.snapshot_store.status === 'unreadable')
      && (base.status === 'healthy' || base.status === 'waiting' || base.status === 'deferred')) {
    return {
      ...base,
      enabled: true,
      status: 'degraded',
      reason_code: 'snapshot_store_error',
      reason: 'The last provider pass succeeded, but one or more persisted lead snapshots cannot be read safely.',
      ...state,
    }
  }
  if (base.outcome === 'success_with_ideas' && state.snapshot_store.valid_count < base.produced_count) {
    return {
      ...base,
      enabled: true,
      status: 'error',
      outcome: 'failed',
      reason_code: 'snapshot_store_error',
      reason: `The provider reported ${base.produced_count} persisted lead${base.produced_count === 1 ? '' : 's'}, but only ${state.snapshot_store.valid_count} projectable snapshot${state.snapshot_store.valid_count === 1 ? '' : 's'} remain.`,
      produced_count: 0,
      ...state,
    }
  }
  return { ...base, enabled: true, ...state }
}
