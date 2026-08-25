import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../singleton-lock'
import { resolvedFirehoseFiles } from './firehose-files'

const DAY_MS = 86_400_000
const HALF_LIFE_MS = DAY_MS
const HISTORY_MS = 7 * DAY_MS
const MAX_RANGE_MS = 90 * DAY_MS
const MAX_LEDGER_BYTES = 64 * 1024 * 1024
const MAX_LEDGER_LINE_BYTES = 128 * 1024
const MAX_EVENT_SCAN = 500_000
const STATE_VERSION = 2
const EVENT_VERSION = 1

export type ProviderRouterOverride = 'auto' | 'shadow' | 'static'
export type ProviderRouterMode = 'static' | 'shadow' | 'adaptive' | 'static-fallback'
export type ProviderEligibilityReason =
  | 'eligible'
  | 'disabled'
  | 'cooldown'
  | 'credential-rejected'
  | 'ledger-unavailable'
  | 'hard-cap'
  | 'provider-day-exhausted'
  | 'paced'
  | 'contract-retry-limit'
  | 'minimum-priority'
  | 'aggregate-band'
  | 'demoted-local-band'
  | 'haiku-pressure'
  | 'reservation-unavailable'

export type ProviderFailureClass =
  | 'availability'
  | 'rate-limit'
  | 'provider-day-limit'
  | 'credential'
  | 'contract'
  | 'timeout'
  | 'plan-quota'
  | 'budget'
  | 'unknown'

export interface ProviderFitnessComponents {
  usableBatchYield: number
  usefulThroughput: number
  releasedCapacityUrgency: number
  failurePenalty: number
  costPenalty: number
}

export interface ProviderRoutingCandidate {
  id: string
  label?: string
  order: number
  band?: 'direct' | 'aggregate' | 'demoted-local'
  eligible: boolean
  eligibilityReason: ProviderEligibilityReason
  releasedCapacityUrgency: number
  consecutiveFailures?: number
  isHaiku?: boolean
}

export interface ProviderCandidateScore extends ProviderRoutingCandidate {
  score: number
  rank: number | null
  sampleSize: number
  explorationDue: boolean
  lastSelectedAt: string | null
  components: ProviderFitnessComponents
}

export interface ProviderRouterMetadata {
  requestedMode: ProviderRouterOverride
  mode: ProviderRouterMode
  reason: string
  shadowStartedAt: string | null
  activatesAt: string | null
  activatedAt: string | null
  outcomeCount: number
  providerCount: number
  pendingDecisions: number
  coverageComplete: boolean
}

export interface ProviderRoutingEvaluation {
  router: ProviderRouterMetadata
  candidates: ProviderCandidateScore[]
  selectedProviderId: string | null
  shadowProviderId: string | null
  exploration: boolean
}

interface ProviderAggregate {
  updatedAt: string
  successfulBatches: number
  networkCalls: number
  scoredItems: number
  elapsedSeconds: number
  sampleSize: number
  lastSelectedAt: string | null
  lastSuccessAt: string | null
}

interface DerivedRoutingState {
  version: 2
  rebuiltAt: string
  rebuildDay: string
  firstEventAt: string | null
  activatedAt: string | null
  lastMode: ProviderRouterMode | null
  outcomeCount: number
  decisionCount: number
  providers: Record<string, ProviderAggregate>
  pending: Record<string, string>
  corruptRows: number
  coverageGapDays: number
}

interface BaseEvent {
  v: 1
  ts: string
  cycleId: string
}

export interface ProviderStateSnapshotEvent extends BaseEvent {
  kind: 'provider_snapshot'
  phase: 'cycle-start' | 'cycle-complete'
  providers: Array<{
    id: string
    state: 'healthy' | 'paced' | 'cooling' | 'budget-spent' | 'unavailable' | 'disabled'
    eligible: boolean
    reason: ProviderEligibilityReason
    allowanceUsed?: number
    allowanceReleased?: number
    allowanceCap?: number
    consecutiveFailures?: number
  }>
}

export interface ProviderDecisionEvent extends BaseEvent {
  kind: 'provider_decision'
  decisionId: string
  mode: ProviderRouterMode
  actualProviderId: string | null
  shadowProviderId: string | null
  exploration: boolean
  candidates: Array<{
    id: string
    eligible: boolean
    reason: ProviderEligibilityReason
    score: number
    /** Legacy alias for shadowRank, retained so older trend clients remain readable. */
    rank: number | null
    actualRank: number | null
    shadowRank: number | null
    sampleSize: number
    components: ProviderFitnessComponents
  }>
}

export interface ProviderOutcomeEvent extends BaseEvent {
  kind: 'provider_outcome'
  decisionId: string
  providerId: string
  outcome: 'success' | 'failure'
  failureClass: ProviderFailureClass | null
  batchSize: number
  scoredItems: number
  networkCalls: number
  tokens: number
  costUsd: number
  elapsedMs: number
}

export interface ProviderTransitionEvent extends BaseEvent {
  kind: 'router_transition'
  from: ProviderRouterMode
  to: ProviderRouterMode
  reason: 'override' | 'shadow-gates-passed' | 'telemetry-unavailable' | 'telemetry-recovered'
}

export type PipelineAuditEvent = ProviderStateSnapshotEvent | ProviderDecisionEvent | ProviderOutcomeEvent | ProviderTransitionEvent

const ROUTER_MODES = new Set<ProviderRouterMode>(['static', 'shadow', 'adaptive', 'static-fallback'])
const ELIGIBILITY_REASONS = new Set<ProviderEligibilityReason>([
  'eligible', 'disabled', 'cooldown', 'credential-rejected', 'ledger-unavailable', 'hard-cap',
  'provider-day-exhausted', 'paced', 'contract-retry-limit', 'minimum-priority', 'aggregate-band',
  'demoted-local-band', 'haiku-pressure', 'reservation-unavailable',
])
const SNAPSHOT_STATES = new Set<ProviderStateSnapshotEvent['providers'][number]['state']>(['healthy', 'paced', 'cooling', 'budget-spent', 'unavailable', 'disabled'])
const FAILURE_CLASSES = new Set<ProviderFailureClass>(['availability', 'rate-limit', 'provider-day-limit', 'credential', 'contract', 'timeout', 'plan-quota', 'budget', 'unknown'])
const TRANSITION_REASONS = new Set<ProviderTransitionEvent['reason']>(['override', 'shadow-gates-passed', 'telemetry-unavailable', 'telemetry-recovered'])

export const CREDENTIAL_DEAD_AFTER_FAILS = 3
export function credentialRejected(reason: string | undefined, accessFails: number): boolean {
  return reason === 'provider-access' && accessFails >= CREDENTIAL_DEAD_AFTER_FAILS
}

export interface ProviderRoutingOptions {
  repoRoot: string
  stateDir: string
  archiveDir?: string
  requestedMode: ProviderRouterOverride
  shadowHours?: number
  minOutcomes?: number
  now?: number
}

function cleanProviderId(value: string): string {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._:-]+/g, '-').slice(0, 96)
}

function finite(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function unit(value: unknown): number {
  return Math.max(0, Math.min(1, finite(value)))
}

function nonnegativeInt(value: unknown): number {
  return Math.max(0, Math.trunc(finite(value)))
}

function round(value: number, digits = 6): number {
  const scale = 10 ** digits
  return Math.round((Number.isFinite(value) ? value : 0) * scale) / scale
}

function validIso(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function dayKey(now: number): string { return new Date(now).toISOString().slice(0, 10) }

function eachUtcDay(from: number, to: number): string[] {
  const out: string[] = []
  let cursor = Date.parse(`${dayKey(from)}T00:00:00.000Z`)
  const last = Date.parse(`${dayKey(Math.max(from, to - 1))}T00:00:00.000Z`)
  while (cursor <= last && out.length <= 92) {
    out.push(dayKey(cursor))
    cursor += DAY_MS
  }
  return out
}

function pipelinePath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_pipeline.ndjson`)
}

function archivePipelinePath(archiveDir: string, date: string): string {
  return path.join(archiveDir, `${date}_pipeline.ndjson`)
}

function statePath(stateDir: string): string { return path.join(stateDir, 'news-provider-fitness.json') }

function emptyState(now: number): DerivedRoutingState {
  return {
    version: 2,
    rebuiltAt: new Date(now).toISOString(),
    rebuildDay: dayKey(now),
    firstEventAt: null,
    activatedAt: null,
    lastMode: null,
    outcomeCount: 0,
    decisionCount: 0,
    providers: {},
    pending: {},
    corruptRows: 0,
    coverageGapDays: 0,
  }
}

function writeFileFully(fd: number, bytes: Buffer): void {
  let offset = 0
  while (offset < bytes.length) {
    const written = fs.writeSync(fd, bytes, offset, bytes.length - offset)
    if (written <= 0) throw new Error('short pipeline telemetry write')
    offset += written
  }
}

function fsyncParent(file: string): void {
  // Windows cannot open or fsync directory handles through Node. The file itself is still fsynced above;
  // POSIX hosts additionally persist the directory entry before acknowledging a new ledger/cache file.
  if (process.platform === 'win32') return
  const fd = fs.openSync(path.dirname(file), 'r')
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

/** Repair only an incomplete final row. Internal corruption remains visible to readers as an audit gap. */
export function repairPipelineTelemetryTail(fd: number): number {
  const size = fs.fstatSync(fd).size
  if (size === 0) return 0
  const scan = Math.min(size, MAX_LEDGER_LINE_BYTES)
  const tail = Buffer.alloc(scan)
  fs.readSync(fd, tail, 0, scan, size - scan)
  const newline = tail.lastIndexOf(0x0a)
  if (newline === scan - 1) return size
  if (newline < 0 && size > MAX_LEDGER_LINE_BYTES) throw new Error('pipeline telemetry tail exceeds row bound')
  const safe = newline < 0 ? 0 : size - scan + newline + 1
  const suffix = tail.subarray(newline + 1).toString('utf8').trim()
  try {
    const parsed: unknown = JSON.parse(suffix)
    if (isAuditEvent(parsed)) {
      const canonical = sanitizeEvent(parsed)
      if (canonical) {
        const bytes = Buffer.from(`${JSON.stringify(canonical)}\n`, 'utf8')
        fs.ftruncateSync(fd, safe)
        writeFileFully(fd, bytes)
        fs.fsyncSync(fd)
        return safe + bytes.length
      }
    }
  } catch { /* a partial JSON suffix is repaired by truncating to the last proven row */ }
  fs.ftruncateSync(fd, safe)
  fs.fsyncSync(fd)
  return safe
}

function sanitizeEvent(event: PipelineAuditEvent): PipelineAuditEvent | null {
  if (!validIso(event.ts) || !event.cycleId || event.v !== 1) return null
  const base = { v: 1 as const, ts: new Date(event.ts).toISOString(), cycleId: cleanProviderId(event.cycleId) }
  if (!base.cycleId) return null
  if (event.kind === 'provider_snapshot') {
    return {
      ...base,
      kind: event.kind,
      phase: event.phase,
      providers: event.providers.slice(0, 64).map((provider) => ({
        id: cleanProviderId(provider.id),
        state: provider.state,
        eligible: provider.eligible === true,
        reason: provider.reason,
        ...(provider.allowanceUsed === undefined ? {} : { allowanceUsed: Math.max(0, finite(provider.allowanceUsed)) }),
        ...(provider.allowanceReleased === undefined ? {} : { allowanceReleased: Math.max(0, finite(provider.allowanceReleased)) }),
        ...(provider.allowanceCap === undefined ? {} : { allowanceCap: Math.max(0, finite(provider.allowanceCap)) }),
        ...(provider.consecutiveFailures === undefined ? {} : { consecutiveFailures: nonnegativeInt(provider.consecutiveFailures) }),
      })).filter((provider) => provider.id),
    }
  }
  if (event.kind === 'provider_decision') {
    const decisionId = cleanProviderId(event.decisionId)
    if (!decisionId) return null
    return {
      ...base,
      kind: event.kind,
      decisionId,
      mode: event.mode,
      actualProviderId: event.actualProviderId ? cleanProviderId(event.actualProviderId) : null,
      shadowProviderId: event.shadowProviderId ? cleanProviderId(event.shadowProviderId) : null,
      exploration: event.exploration === true,
      candidates: event.candidates.slice(0, 64).map((candidate) => ({
        id: cleanProviderId(candidate.id),
        eligible: candidate.eligible === true,
        reason: candidate.reason,
        score: round(candidate.score),
        rank: candidate.rank == null ? null : Math.max(1, nonnegativeInt(candidate.rank)),
        actualRank: candidate.actualRank == null ? null : Math.max(1, nonnegativeInt(candidate.actualRank)),
        shadowRank: candidate.shadowRank == null
          ? (candidate.rank == null ? null : Math.max(1, nonnegativeInt(candidate.rank)))
          : Math.max(1, nonnegativeInt(candidate.shadowRank)),
        sampleSize: nonnegativeInt(candidate.sampleSize),
        components: {
          usableBatchYield: round(unit(candidate.components.usableBatchYield)),
          usefulThroughput: round(unit(candidate.components.usefulThroughput)),
          releasedCapacityUrgency: round(unit(candidate.components.releasedCapacityUrgency)),
          failurePenalty: round(Math.max(0, finite(candidate.components.failurePenalty))),
          costPenalty: round(Math.max(0, finite(candidate.components.costPenalty))),
        },
      })).filter((candidate) => candidate.id),
    }
  }
  if (event.kind === 'provider_outcome') {
    const decisionId = cleanProviderId(event.decisionId)
    const providerId = cleanProviderId(event.providerId)
    if (!decisionId || !providerId) return null
    return {
      ...base,
      kind: event.kind,
      decisionId,
      providerId,
      outcome: event.outcome,
      failureClass: event.outcome === 'failure' ? event.failureClass || 'unknown' : null,
      batchSize: nonnegativeInt(event.batchSize),
      scoredItems: nonnegativeInt(event.scoredItems),
      networkCalls: nonnegativeInt(event.networkCalls),
      tokens: nonnegativeInt(event.tokens),
      costUsd: round(Math.max(0, finite(event.costUsd)), 9),
      elapsedMs: nonnegativeInt(event.elapsedMs),
    }
  }
  return { ...base, kind: event.kind, from: event.from, to: event.to, reason: event.reason }
}

export function appendPipelineTelemetry(repoRoot: string, event: PipelineAuditEvent): boolean {
  if (!isAuditEvent(event)) return false
  const safe = sanitizeEvent(event)
  if (!safe) return false
  const bytes = Buffer.from(`${JSON.stringify(safe)}\n`, 'utf8')
  if (bytes.length > MAX_LEDGER_LINE_BYTES) return false
  const file = pipelinePath(repoRoot, safe.ts.slice(0, 10))
  let lock: number | undefined
  let fd: number | undefined
  let rollback: number | undefined
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    lock = acquireRetainedFlockSync(`${file}.lock`, { waitMs: 2_000, busyMessage: 'pipeline telemetry writer busy' })
    fd = fs.openSync(file, 'a+', 0o600)
    const size = repairPipelineTelemetryTail(fd)
    if (size + bytes.length > MAX_LEDGER_BYTES) return false
    rollback = size
    writeFileFully(fd, bytes)
    if (fs.fstatSync(fd).size !== size + bytes.length) throw new Error('pipeline telemetry append was short')
    fs.fsyncSync(fd)
    fsyncParent(file)
    rollback = undefined
    return true
  } catch {
    if (fd !== undefined && rollback !== undefined) {
      try { fs.ftruncateSync(fd, rollback); fs.fsyncSync(fd) } catch { /* leave the tail for repair */ }
    }
    return false
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* best effort */ }
    if (lock !== undefined) releaseRetainedFlock(lock)
  }
}

interface ReadEventsResult {
  events: PipelineAuditEvent[]
  missingDays: string[]
  corruptRows: number
  corruptDays: string[]
  unreadableDays: string[]
  scannedRows: number
  truncated: boolean
}

function isAuditEvent(value: unknown): value is PipelineAuditEvent {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  if (row.v !== EVENT_VERSION || !validIso(row.ts) || typeof row.cycleId !== 'string' || !cleanProviderId(row.cycleId)) return false
  if (row.kind === 'provider_snapshot') {
    if ((row.phase !== 'cycle-start' && row.phase !== 'cycle-complete') || !Array.isArray(row.providers)) return false
    return row.providers.length <= 64 && row.providers.every((provider) => {
      if (!provider || typeof provider !== 'object') return false
      const item = provider as Record<string, unknown>
      return typeof item.id === 'string' && typeof item.eligible === 'boolean'
        && SNAPSHOT_STATES.has(item.state as ProviderStateSnapshotEvent['providers'][number]['state'])
        && ELIGIBILITY_REASONS.has(item.reason as ProviderEligibilityReason)
        && ['allowanceUsed', 'allowanceReleased', 'allowanceCap', 'consecutiveFailures']
          .every((key) => item[key] === undefined || (typeof item[key] === 'number' && Number.isFinite(item[key])))
    })
  }
  if (row.kind === 'provider_decision') {
    if (typeof row.decisionId !== 'string' || !ROUTER_MODES.has(row.mode as ProviderRouterMode) || typeof row.exploration !== 'boolean' || !Array.isArray(row.candidates)) return false
    if (row.actualProviderId != null && typeof row.actualProviderId !== 'string') return false
    if (row.shadowProviderId != null && typeof row.shadowProviderId !== 'string') return false
    return row.candidates.length <= 64 && row.candidates.every((candidate) => {
      if (!candidate || typeof candidate !== 'object') return false
      const item = candidate as Record<string, unknown>
      const components = item.components as Record<string, unknown> | null
      return typeof item.id === 'string' && typeof item.eligible === 'boolean' && ELIGIBILITY_REASONS.has(item.reason as ProviderEligibilityReason)
        && typeof item.score === 'number' && Number.isFinite(item.score) && (item.rank == null || Number.isInteger(item.rank))
        && (item.actualRank == null || Number.isInteger(item.actualRank)) && (item.shadowRank == null || Number.isInteger(item.shadowRank))
        && typeof item.sampleSize === 'number' && Number.isFinite(item.sampleSize) && !!components
        && ['usableBatchYield', 'usefulThroughput', 'releasedCapacityUrgency', 'failurePenalty', 'costPenalty']
          .every((key) => typeof components[key] === 'number' && Number.isFinite(components[key]))
    })
  }
  if (row.kind === 'provider_outcome') {
    return typeof row.decisionId === 'string' && typeof row.providerId === 'string'
      && (row.outcome === 'success' || row.outcome === 'failure')
      && (row.outcome === 'success' ? row.failureClass == null : FAILURE_CLASSES.has(row.failureClass as ProviderFailureClass))
      && ['batchSize', 'scoredItems', 'networkCalls', 'tokens', 'costUsd', 'elapsedMs']
        .every((key) => typeof row[key] === 'number' && Number.isFinite(row[key]))
  }
  if (row.kind === 'router_transition') {
    return ROUTER_MODES.has(row.from as ProviderRouterMode) && ROUTER_MODES.has(row.to as ProviderRouterMode)
      && TRANSITION_REASONS.has(row.reason as ProviderTransitionEvent['reason'])
  }
  return false
}

function readPipelineEvents(
  repoRoot: string,
  archiveDir: string,
  from: number,
  to: number,
  maxRows = MAX_EVENT_SCAN,
): ReadEventsResult {
  const result: ReadEventsResult = { events: [], missingDays: [], corruptRows: 0, corruptDays: [], unreadableDays: [], scannedRows: 0, truncated: false }
  for (const date of eachUtcDay(from, to)) {
    const candidates = [pipelinePath(repoRoot, date), ...(archiveDir ? [archivePipelinePath(archiveDir, date)] : [])]
    let text: string | null = null
    let found = false
    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
      const file = candidates[candidateIndex]
      let readLock: number | undefined
      try {
        const isLocalAuthority = candidateIndex === 0
        if (isLocalAuthority && fs.existsSync(file)) {
          found = true
          readLock = acquireRetainedFlockSync(`${file}.lock`, { waitMs: 2_000, busyMessage: 'pipeline telemetry reader busy' })
        }
        const stat = fs.statSync(file)
        found = true
        if (stat.size > MAX_LEDGER_BYTES) { result.unreadableDays.push(date); break }
        text = fs.readFileSync(file, 'utf8')
        break
      } catch {
        if (found) { result.unreadableDays.push(date); break }
        // local is absent: try the permanent archive copy
      } finally {
        if (readLock !== undefined) releaseRetainedFlock(readLock)
      }
    }
    if (text == null) {
      if (!found && !result.unreadableDays.includes(date)) result.missingDays.push(date)
      continue
    }
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue
      result.scannedRows++
      if (result.scannedRows > maxRows) { result.truncated = true; return result }
      if (Buffer.byteLength(trimmed, 'utf8') > MAX_LEDGER_LINE_BYTES) { result.corruptRows++; result.corruptDays.push(date); continue }
      try {
        const parsed: unknown = JSON.parse(trimmed)
        if (!isAuditEvent(parsed)) { result.corruptRows++; result.corruptDays.push(date); continue }
        const safe = sanitizeEvent(parsed)
        if (!safe) { result.corruptRows++; result.corruptDays.push(date); continue }
        const time = Date.parse(safe.ts)
        if (time >= from && time < to) result.events.push(safe)
      } catch { result.corruptRows++; result.corruptDays.push(date) }
    }
  }
  result.events.sort((a, b) => a.ts.localeCompare(b.ts))
  return result
}

function decay(value: number, elapsedMs: number): number {
  return value * Math.pow(0.5, Math.max(0, elapsedMs) / HALF_LIFE_MS)
}

function applyOutcomeAggregate(state: DerivedRoutingState, providerId: string, event: ProviderOutcomeEvent): void {
  const prior = state.providers[providerId] || {
    updatedAt: event.ts,
    successfulBatches: 0,
    networkCalls: 0,
    scoredItems: 0,
    elapsedSeconds: 0,
    sampleSize: 0,
    lastSelectedAt: null,
    lastSuccessAt: null,
  }
  const elapsed = Math.max(0, Date.parse(event.ts) - Date.parse(prior.updatedAt))
  const aggregate: ProviderAggregate = {
    updatedAt: event.ts,
    successfulBatches: decay(prior.successfulBatches, elapsed) + (event.outcome === 'success' ? 1 : 0),
    networkCalls: decay(prior.networkCalls, elapsed) + event.networkCalls,
    scoredItems: decay(prior.scoredItems, elapsed) + event.scoredItems,
    elapsedSeconds: decay(prior.elapsedSeconds, elapsed) + event.elapsedMs / 1000,
    sampleSize: prior.sampleSize + event.networkCalls,
    lastSelectedAt: event.ts,
    lastSuccessAt: event.outcome === 'success' ? event.ts : prior.lastSuccessAt,
  }
  state.providers[providerId] = aggregate
}

function applyOutcome(state: DerivedRoutingState, event: ProviderOutcomeEvent): void {
  applyOutcomeAggregate(state, event.providerId, event)
  // Live diagnostics intentionally exposes Gemini as one pool card while triage audits the exact model.
  // Rebuild that pool projection from the same authoritative outcomes; never double-count activation.
  if (event.providerId.startsWith('gemini:')) applyOutcomeAggregate(state, 'gemini', event)
  state.outcomeCount++
  delete state.pending[event.decisionId]
}

function rebuildState(repoRoot: string, stateDir: string, archiveDir: string, now: number, stateLockHeld = false): { state: DerivedRoutingState; readable: boolean } {
  const state = emptyState(now)
  const read = readPipelineEvents(repoRoot, archiveDir, now - HISTORY_MS, now + 1, MAX_EVENT_SCAN)
  state.corruptRows = read.corruptRows
  for (const event of read.events) {
    state.firstEventAt ||= event.ts
    if (event.kind === 'provider_decision') {
      state.decisionCount++
      state.pending[event.decisionId] = event.ts
    } else if (event.kind === 'provider_outcome') {
      applyOutcome(state, event)
    } else if (event.kind === 'router_transition' && event.to === 'adaptive') {
      state.activatedAt = event.ts
      state.lastMode = event.to
    } else if (event.kind === 'router_transition') {
      state.lastMode = event.to
    }
  }
  if (state.firstEventAt) {
    const firstDay = state.firstEventAt.slice(0, 10)
    const currentDay = dayKey(now)
    state.coverageGapDays = read.missingDays.filter((date) => date > firstDay && date < currentDay).length
  }
  let readable = read.unreadableDays.length === 0 && !read.truncated && read.corruptRows === 0
  if (readable && !saveState(stateDir, state, stateLockHeld)) readable = false
  return { state, readable }
}

function loadState(options: ProviderRoutingOptions, now: number, stateLockHeld = false): { state: DerivedRoutingState; readable: boolean } {
  const file = statePath(options.stateDir)
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as DerivedRoutingState
    if (parsed.version !== STATE_VERSION || !validIso(parsed.rebuiltAt) || !parsed.providers || !parsed.pending || !Number.isInteger(parsed.coverageGapDays)) throw new Error('invalid state')
    if (parsed.rebuildDay === dayKey(now)) return { state: parsed, readable: parsed.corruptRows === 0 }
  } catch { /* rebuild from authority */ }
  return rebuildState(options.repoRoot, options.stateDir, options.archiveDir || '', now, stateLockHeld)
}

function saveState(stateDir: string, state: DerivedRoutingState, stateLockHeld = false): boolean {
  const file = statePath(stateDir)
  const temp = `${file}.${process.pid}.tmp`
  let fd: number | undefined
  let lock: number | undefined
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    if (!stateLockHeld) lock = acquireRetainedFlockSync(`${file}.lock`, { waitMs: 2_000, busyMessage: 'provider fitness cache writer busy' })
    fd = fs.openSync(temp, 'w', 0o600)
    writeFileFully(fd, Buffer.from(`${JSON.stringify(state)}\n`, 'utf8'))
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    fs.renameSync(temp, file)
    fsyncParent(file)
    return true
  } catch {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.unlinkSync(temp) } catch { /* best effort */ }
    return false
  } finally {
    if (lock !== undefined) releaseRetainedFlock(lock)
  }
}

function activationMetadata(
  state: DerivedRoutingState,
  options: ProviderRoutingOptions,
  readable: boolean,
  eligibleProviderIds: readonly string[],
  now: number,
): ProviderRouterMetadata {
  const shadowHours = Math.max(1, finite(options.shadowHours, 24))
  const minOutcomes = Math.max(1, nonnegativeInt(options.minOutcomes ?? 20))
  const first = state.firstEventAt
  const activatesAt = first ? new Date(Date.parse(first) + shadowHours * 3_600_000).toISOString() : null
  const enoughTime = activatesAt != null && now >= Date.parse(activatesAt)
  const providerCount = new Set(eligibleProviderIds).size === 0
    ? 0
    : [...new Set(eligibleProviderIds)].filter((id) => (state.providers[id]?.sampleSize || 0) > 0).length
  const enoughProviders = new Set(eligibleProviderIds).size < 2 || providerCount >= 2
  const noGaps = state.corruptRows === 0 && state.coverageGapDays === 0 && Object.keys(state.pending).length === 0
  const coverageComplete = readable && enoughTime && state.outcomeCount >= minOutcomes && enoughProviders && noGaps

  if (!readable) return {
    requestedMode: options.requestedMode,
    mode: 'static-fallback',
    reason: 'Pipeline telemetry is unreadable; the proven static route remains authoritative.',
    shadowStartedAt: first,
    activatesAt,
    activatedAt: state.activatedAt,
    outcomeCount: state.outcomeCount,
    providerCount,
    pendingDecisions: Object.keys(state.pending).length,
    coverageComplete: false,
  }
  if (options.requestedMode === 'static') return {
    requestedMode: options.requestedMode,
    mode: 'static',
    reason: 'Static routing is forced by NEWS_PROVIDER_ROUTER_MODE.',
    shadowStartedAt: first,
    activatesAt,
    activatedAt: state.activatedAt,
    outcomeCount: state.outcomeCount,
    providerCount,
    pendingDecisions: Object.keys(state.pending).length,
    coverageComplete,
  }
  if (options.requestedMode === 'shadow' || !coverageComplete) {
    const blockers = [
      !enoughTime ? `${shadowHours} readable hours` : '',
      state.outcomeCount < minOutcomes ? `${minOutcomes} completed outcomes` : '',
      !enoughProviders ? 'two-provider coverage' : '',
      !noGaps ? 'closure of audit gaps' : '',
    ].filter(Boolean)
    return {
      requestedMode: options.requestedMode,
      mode: 'shadow',
      reason: options.requestedMode === 'shadow' ? 'Shadow routing is forced by NEWS_PROVIDER_ROUTER_MODE.' : `Adaptive activation is waiting for ${blockers.join(', ')}.`,
      shadowStartedAt: first,
      activatesAt,
      activatedAt: state.activatedAt,
      outcomeCount: state.outcomeCount,
      providerCount,
      pendingDecisions: Object.keys(state.pending).length,
      coverageComplete: false,
    }
  }
  return {
    requestedMode: options.requestedMode,
    mode: 'adaptive',
    reason: 'The shadow coverage gates passed; scanner triage is ranked by audited provider fitness.',
    shadowStartedAt: first,
    activatesAt,
    activatedAt: state.activatedAt || new Date(now).toISOString(),
    outcomeCount: state.outcomeCount,
    providerCount,
    pendingDecisions: 0,
    coverageComplete: true,
  }
}

function scoreCandidates(state: DerivedRoutingState, candidates: readonly ProviderRoutingCandidate[], now: number): ProviderCandidateScore[] {
  const throughputs = candidates.map((candidate) => {
    const aggregate = state.providers[candidate.id]
    if (!aggregate) return 0
    const elapsed = Math.max(0, now - Date.parse(aggregate.updatedAt))
    const scoredItems = decay(aggregate.scoredItems, elapsed)
    const elapsedSeconds = decay(aggregate.elapsedSeconds, elapsed)
    return elapsedSeconds > 0 ? scoredItems / elapsedSeconds : 0
  })
  const bestThroughput = Math.max(0, ...throughputs.filter((_, index) => candidates[index]?.eligible))
  const scored = candidates.map((candidate, index): ProviderCandidateScore => {
    const aggregate = state.providers[candidate.id]
    const elapsed = aggregate ? Math.max(0, now - Date.parse(aggregate.updatedAt)) : 0
    const success = aggregate ? decay(aggregate.successfulBatches, elapsed) : 0
    const calls = aggregate ? decay(aggregate.networkCalls, elapsed) : 0
    const usableBatchYield = (success + 3) / (calls + 4)
    const usefulThroughput = bestThroughput > 0 ? throughputs[index] / bestThroughput : (candidate.eligible ? 1 : 0)
    const failures = Math.min(3, nonnegativeInt(candidate.consecutiveFailures))
    const failurePenalty = failures * 10
    const costPenalty = candidate.isHaiku ? 15 : 0
    const score = 45 * usableBatchYield + 25 * usefulThroughput + 30 * unit(candidate.releasedCapacityUrgency) - failurePenalty - costPenalty
    const lastSuccess = aggregate?.lastSuccessAt ? Date.parse(aggregate.lastSuccessAt) : 0
    const lastSelected = aggregate?.lastSelectedAt ? Date.parse(aggregate.lastSelectedAt) : 0
    const recoveryDue = Math.max(lastSuccess, lastSelected) === 0 || now - Math.max(lastSuccess, lastSelected) >= 6 * 3_600_000
    const underSampled = (aggregate?.sampleSize || 0) < 5
    const noPostRecoverySuccess = lastSelected > lastSuccess
    return {
      ...candidate,
      score: round(score),
      rank: null,
      sampleSize: aggregate?.sampleSize || 0,
      explorationDue: candidate.eligible && recoveryDue && (underSampled || noPostRecoverySuccess),
      lastSelectedAt: aggregate?.lastSelectedAt || null,
      components: {
        usableBatchYield: round(usableBatchYield),
        usefulThroughput: round(usefulThroughput),
        releasedCapacityUrgency: round(unit(candidate.releasedCapacityUrgency)),
        failurePenalty,
        costPenalty,
      },
    }
  })
  const bands = ['direct', 'aggregate', 'demoted-local'] as const
  for (const band of bands) {
    const ranked = scored.filter((candidate) => candidate.eligible && (candidate.band || 'direct') === band)
      .sort((left, right) => right.score - left.score || left.order - right.order || left.id.localeCompare(right.id))
    ranked.forEach((candidate, index) => { candidate.rank = index + 1 })
  }
  return scored
}

/** Evaluate scanner triage only. Hard eligibility and safety bands are supplied by the caller and are never
 * overridden here; fitness chooses only among already-eligible peers inside the same band. */
export function evaluateProviderRouting(options: ProviderRoutingOptions, candidates: readonly ProviderRoutingCandidate[]): ProviderRoutingEvaluation {
  const now = options.now ?? Date.now()
  const loaded = loadState(options, now)
  const normalized = candidates.map((candidate) => ({ ...candidate, id: cleanProviderId(candidate.id), releasedCapacityUrgency: unit(candidate.releasedCapacityUrgency) }))
  const direct = normalized.filter((candidate) => candidate.eligible && (candidate.band || 'direct') === 'direct')
  const router = activationMetadata(loaded.state, options, loaded.readable, direct.map((candidate) => candidate.id), now)
  const scores = scoreCandidates(loaded.state, normalized, now)
  const directScores = scores.filter((candidate) => candidate.eligible && (candidate.band || 'direct') === 'direct')
    .sort((left, right) => (left.rank || Infinity) - (right.rank || Infinity))
  let selected = directScores[0] || null
  let exploration = false
  if (directScores.length > 1 && loaded.state.decisionCount % 10 === 9) {
    const probe = directScores.filter((candidate) => candidate.explorationDue).sort((left, right) => left.sampleSize - right.sampleSize || left.order - right.order)[0]
    if (probe) { selected = probe; exploration = true }
  }
  return {
    router,
    candidates: scores,
    selectedProviderId: router.mode === 'adaptive' ? selected?.id || null : null,
    shadowProviderId: selected?.id || null,
    exploration,
  }
}

export function deterministicCycleId(startedAt: string): string {
  return `cycle-${createHash('sha256').update(startedAt).digest('hex').slice(0, 20)}`
}

export function deterministicDecisionId(cycleId: string, batchIndex: number, attemptIndex: number): string {
  return `${cleanProviderId(cycleId)}-b${Math.max(0, Math.trunc(batchIndex))}-a${Math.max(0, Math.trunc(attemptIndex))}`
}

function withStateTransaction(options: ProviderRoutingOptions, action: () => boolean): boolean {
  let lock: number | undefined
  try {
    fs.mkdirSync(options.stateDir, { recursive: true })
    lock = acquireRetainedFlockSync(`${statePath(options.stateDir)}.lock`, { waitMs: 2_000, busyMessage: 'provider fitness cache busy' })
    return action()
  } catch {
    return false
  } finally {
    if (lock !== undefined) releaseRetainedFlock(lock)
  }
}

export function recordProviderDecision(options: ProviderRoutingOptions, event: Omit<ProviderDecisionEvent, 'v'>): boolean {
  return withStateTransaction(options, () => {
    const now = options.now ?? Date.now()
    const loaded = loadState(options, now, true)
    if (!loaded.readable || !appendPipelineTelemetry(options.repoRoot, { ...event, v: 1 })) return false
    loaded.state.firstEventAt ||= event.ts
    loaded.state.decisionCount++
    loaded.state.pending[event.decisionId] = event.ts
    const saved = saveState(options.stateDir, loaded.state, true)
    if (!saved) try { fs.unlinkSync(statePath(options.stateDir)) } catch { /* force an authoritative rebuild */ }
    return saved
  })
}

export function recordProviderOutcome(options: ProviderRoutingOptions, event: Omit<ProviderOutcomeEvent, 'v'>): boolean {
  return withStateTransaction(options, () => {
    const now = options.now ?? Date.now()
    const loaded = loadState(options, now, true)
    if (!loaded.readable || !appendPipelineTelemetry(options.repoRoot, { ...event, v: 1 })) return false
    loaded.state.firstEventAt ||= event.ts
    applyOutcome(loaded.state, { ...event, v: 1 })
    const saved = saveState(options.stateDir, loaded.state, true)
    if (!saved) try { fs.unlinkSync(statePath(options.stateDir)) } catch { /* force an authoritative rebuild */ }
    return saved
  })
}

export function recordProviderSnapshot(repoRoot: string, event: Omit<ProviderStateSnapshotEvent, 'v'>): boolean {
  return appendPipelineTelemetry(repoRoot, { ...event, v: 1 })
}

export function recordRouterTransition(repoRoot: string, event: Omit<ProviderTransitionEvent, 'v'>): boolean {
  return appendPipelineTelemetry(repoRoot, { ...event, v: 1 })
}

export function recordRouterModeIfChanged(options: ProviderRoutingOptions, cycleId: string, metadata: ProviderRouterMetadata): boolean {
  return withStateTransaction(options, () => {
    const now = options.now ?? Date.now()
    const loaded = loadState(options, now, true)
    if (!loaded.readable) return false
    if (loaded.state.lastMode === metadata.mode) return true
    const from = loaded.state.lastMode || 'static'
    const reason: ProviderTransitionEvent['reason'] = metadata.mode === 'adaptive'
      ? 'shadow-gates-passed'
      : metadata.mode === 'static-fallback'
        ? 'telemetry-unavailable'
        : metadata.requestedMode === 'static' || metadata.requestedMode === 'shadow'
          ? 'override'
          : 'telemetry-recovered'
    const event: ProviderTransitionEvent = { v: 1, kind: 'router_transition', ts: new Date(now).toISOString(), cycleId, from, to: metadata.mode, reason }
    if (!appendPipelineTelemetry(options.repoRoot, event)) return false
    loaded.state.lastMode = metadata.mode
    if (metadata.mode === 'adaptive') loaded.state.activatedAt ||= event.ts
    const saved = saveState(options.stateDir, loaded.state, true)
    if (!saved) try { fs.unlinkSync(statePath(options.stateDir)) } catch { /* force rebuild */ }
    return saved
  })
}

export function currentProviderRouting(options: ProviderRoutingOptions, candidates: readonly ProviderRoutingCandidate[]): ProviderRoutingEvaluation {
  return evaluateProviderRouting(options, candidates)
}

export interface PipelineTrendBucket {
  start: string
  end: string
  inflowPerSecond: number | null
  scanningPerSecond: number | null
  backlog: number | null
  retired: number | null
  legacyLoss: number | null
  verified: boolean
  routerMode: ProviderRouterMode | null
  routerTransition: string | null
  providers: Record<string, { successes: number; failures: number; scoredItems: number; actualRank: number | null; shadowRank: number | null; health: string | null; routingChanges: number }>
}

export interface PipelineTrendResponse {
  from: string
  to: string
  bucketMs: number
  timezone: 'UTC'
  coverage: { complete: boolean; missingPipelineDays: string[]; missingFirehoseDays: string[]; corruptRows: number; unreadableDays: string[]; truncated: boolean }
  buckets: PipelineTrendBucket[]
  providers: Array<{
    id: string
    contributionShare: number
    usableBatchYield: number
    usefulThroughput: number
    releasedCapacityUtilization: number | null
    failures: number
    currentRank: number | null
  }>
}

function bucketSize(range: number, requested: string): number {
  const allowed: Record<string, number> = { '1m': 60_000, '5m': 300_000, '15m': 900_000, '1h': 3_600_000, '6h': 21_600_000, '1d': DAY_MS }
  if (allowed[requested]) return Math.max(allowed[requested], Math.ceil(range / 720 / 60_000) * 60_000)
  const minimum = Math.ceil(range / 720)
  return [60_000, 300_000, 900_000, 3_600_000, 6 * 3_600_000, DAY_MS].find((value) => value >= minimum) || Math.ceil(minimum / DAY_MS) * DAY_MS
}

interface FirehoseSummaryRow { ts: string; completed_at?: string; new_arrivals?: number; picked?: number; watched?: number; dropped?: number; backlog?: number; backlog_expired?: number; dropped_at_cap?: number; feed_commit_version?: number }

function readCycleSummaries(repoRoot: string, archiveDir: string, from: number, to: number): { rows: FirehoseSummaryRow[]; missing: string[]; corrupt: number; corruptDays: string[]; unreadable: string[] } {
  const out = { rows: [] as FirehoseSummaryRow[], missing: [] as string[], corrupt: 0, corruptDays: [] as string[], unreadable: [] as string[] }
  for (const date of eachUtcDay(from, to)) {
    let files: ReturnType<typeof resolvedFirehoseFiles>
    try { files = resolvedFirehoseFiles(repoRoot, date, archiveDir) }
    catch { out.unreadable.push(date); continue }
    if (!files.length) { out.missing.push(date); continue }
    for (const file of files) {
      let text: string
      try {
        const stat = fs.statSync(file.file)
        if (stat.size > 100 * 1024 * 1024) throw new Error('oversized firehose shard')
        text = fs.readFileSync(file.file, 'utf8')
      } catch { out.unreadable.push(date); break }
      for (const line of text.split('\n')) {
        if (!line.includes('"kind":"cycle_summary"')) continue
        try {
          const row = JSON.parse(line) as FirehoseSummaryRow & { kind?: string }
          if (row.kind !== 'cycle_summary' || !validIso(row.ts)) { out.corrupt++; out.corruptDays.push(date); continue }
          const time = Date.parse(row.completed_at || row.ts)
          if (time >= from && time < to) out.rows.push(row)
        } catch { out.corrupt++; out.corruptDays.push(date) }
      }
    }
  }
  return out
}

export function parseTrendRange(fromRaw: unknown, toRaw: unknown, now = Date.now()): { from: number; to: number } {
  const to = toRaw == null || toRaw === '' ? now : Date.parse(String(toRaw))
  const from = fromRaw == null || fromRaw === '' ? to - DAY_MS : Date.parse(String(fromRaw))
  if (!Number.isFinite(from) || !Number.isFinite(to) || from >= to) throw new Error('from and to must be valid UTC timestamps with from before to')
  if (to - from > MAX_RANGE_MS) throw new Error('trend range cannot exceed 90 days')
  return { from, to }
}

export function readPipelineTrend(repoRoot: string, archiveDir: string, from: number, to: number, requestedBucket = 'auto'): PipelineTrendResponse {
  if (from >= to || to - from > MAX_RANGE_MS) throw new Error('invalid trend range')
  const bucketMs = bucketSize(to - from, requestedBucket)
  const count = Math.ceil((to - from) / bucketMs)
  const buckets: PipelineTrendBucket[] = Array.from({ length: count }, (_, index) => ({
    start: new Date(from + index * bucketMs).toISOString(),
    end: new Date(Math.min(to, from + (index + 1) * bucketMs)).toISOString(),
    inflowPerSecond: null,
    scanningPerSecond: null,
    backlog: null,
    retired: null,
    legacyLoss: null,
    verified: false,
    routerMode: null,
    routerTransition: null,
    providers: {},
  }))
  const bucketAt = (time: number) => buckets[Math.min(buckets.length - 1, Math.max(0, Math.floor((time - from) / bucketMs)))]
  const firehose = readCycleSummaries(repoRoot, archiveDir, from, to)
  const flow = new Map<PipelineTrendBucket, { arrivals: number; scanned: number; retired: number; lost: number; verified: boolean }>()
  for (const row of firehose.rows) {
    const time = Date.parse(row.completed_at || row.ts)
    const bucket = bucketAt(time)
    const aggregate = flow.get(bucket) || { arrivals: 0, scanned: 0, retired: 0, lost: 0, verified: true }
    if (row.feed_commit_version !== 1 || row.new_arrivals == null) aggregate.verified = false
    else {
      aggregate.arrivals += nonnegativeInt(row.new_arrivals)
      aggregate.scanned += nonnegativeInt(row.picked) + nonnegativeInt(row.watched) + nonnegativeInt(row.dropped)
    }
    aggregate.retired += nonnegativeInt(row.backlog_expired)
    aggregate.lost += nonnegativeInt(row.dropped_at_cap)
    bucket.backlog = row.backlog == null ? bucket.backlog : nonnegativeInt(row.backlog)
    flow.set(bucket, aggregate)
  }
  for (const [bucket, aggregate] of flow) {
    const seconds = (Date.parse(bucket.end) - Date.parse(bucket.start)) / 1000
    bucket.verified = aggregate.verified
    if (aggregate.verified) {
      bucket.inflowPerSecond = round(aggregate.arrivals / seconds)
      bucket.scanningPerSecond = round(aggregate.scanned / seconds)
    }
    bucket.retired = aggregate.verified ? aggregate.retired : null
    bucket.legacyLoss = aggregate.verified ? aggregate.lost : null
  }

  const audit = readPipelineEvents(repoRoot, archiveDir, from, to)
  const totals = new Map<string, { successes: number; failures: number; scored: number; calls: number; elapsed: number; urgency: number; urgencyN: number; rank: number | null }>()
  const lastRanks = new Map<string, string>()
  for (const event of audit.events) {
    const bucket = bucketAt(Date.parse(event.ts))
    if (event.kind === 'provider_outcome') {
      const lane = bucket.providers[event.providerId] || { successes: 0, failures: 0, scoredItems: 0, actualRank: null, shadowRank: null, health: null, routingChanges: 0 }
      if (event.outcome === 'success') lane.successes++; else lane.failures++
      lane.scoredItems += event.scoredItems
      bucket.providers[event.providerId] = lane
      const total = totals.get(event.providerId) || { successes: 0, failures: 0, scored: 0, calls: 0, elapsed: 0, urgency: 0, urgencyN: 0, rank: null }
      if (event.outcome === 'success') total.successes++; else total.failures++
      total.scored += event.scoredItems; total.calls += event.networkCalls; total.elapsed += event.elapsedMs / 1000
      totals.set(event.providerId, total)
    } else if (event.kind === 'provider_decision') {
      bucket.routerMode = event.mode
      for (const candidate of event.candidates) {
        const lane = bucket.providers[candidate.id] || { successes: 0, failures: 0, scoredItems: 0, actualRank: null, shadowRank: null, health: null, routingChanges: 0 }
        const actualRank = candidate.actualRank ?? null
        const shadowRank = candidate.shadowRank ?? candidate.rank
        const rankKey = `${actualRank ?? '-'}:${shadowRank ?? '-'}`
        const priorRank = lastRanks.get(candidate.id)
        if (priorRank != null && priorRank !== rankKey) lane.routingChanges++
        lastRanks.set(candidate.id, rankKey)
        lane.actualRank = actualRank
        lane.shadowRank = shadowRank
        bucket.providers[candidate.id] = lane
        const total = totals.get(candidate.id) || { successes: 0, failures: 0, scored: 0, calls: 0, elapsed: 0, urgency: 0, urgencyN: 0, rank: null }
        total.urgency += candidate.components.releasedCapacityUrgency; total.urgencyN++; total.rank = candidate.rank
        totals.set(candidate.id, total)
      }
    } else if (event.kind === 'provider_snapshot') {
      for (const provider of event.providers) {
        const lane = bucket.providers[provider.id] || { successes: 0, failures: 0, scoredItems: 0, actualRank: null, shadowRank: null, health: null, routingChanges: 0 }
        lane.health = provider.state
        bucket.providers[provider.id] = lane
      }
    } else if (event.kind === 'router_transition') {
      bucket.routerMode = event.to
      bucket.routerTransition = `${event.from} → ${event.to}`
    }
  }
  const gapDays = new Set([
    ...audit.missingDays, ...audit.unreadableDays, ...audit.corruptDays,
    ...firehose.missing, ...firehose.unreadable, ...firehose.corruptDays,
  ])
  for (const bucket of buckets) {
    if (eachUtcDay(Date.parse(bucket.start), Date.parse(bucket.end)).some((date) => gapDays.has(date))) bucket.verified = false
  }
  const totalScored = [...totals.values()].reduce((sum, value) => sum + value.scored, 0)
  const providers = [...totals.entries()].map(([id, total]) => ({
    id,
    contributionShare: totalScored > 0 ? round(total.scored / totalScored) : 0,
    usableBatchYield: round((total.successes + 3) / (total.calls + 4)),
    usefulThroughput: total.elapsed > 0 ? round(total.scored / total.elapsed) : 0,
    releasedCapacityUtilization: total.urgencyN > 0 ? round(total.urgency / total.urgencyN) : null,
    failures: total.failures,
    currentRank: total.rank,
  })).sort((left, right) => {
    const leftRank = typeof left.currentRank === 'number' && Number.isFinite(left.currentRank) ? left.currentRank : null
    const rightRank = typeof right.currentRank === 'number' && Number.isFinite(right.currentRank) ? right.currentRank : null
    if (leftRank != null && rightRank != null && leftRank !== rightRank) return leftRank < rightRank ? -1 : 1
    if (leftRank != null) return -1
    if (rightRank != null) return 1
    if (left.contributionShare !== right.contributionShare) return right.contributionShare - left.contributionShare
    return left.id.localeCompare(right.id)
  })
  return {
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    bucketMs,
    timezone: 'UTC',
    coverage: {
      complete: audit.missingDays.length === 0 && firehose.missing.length === 0 && audit.corruptRows + firehose.corrupt === 0 && audit.unreadableDays.length + firehose.unreadable.length === 0 && !audit.truncated,
      missingPipelineDays: audit.missingDays,
      missingFirehoseDays: firehose.missing,
      corruptRows: audit.corruptRows + firehose.corrupt,
      unreadableDays: [...new Set([...audit.unreadableDays, ...firehose.unreadable])],
      truncated: audit.truncated,
    },
    buckets,
    providers,
  }
}

export interface PipelineTrendEventsResponse {
  events: PipelineAuditEvent[]
  nextCursor: string | null
  coverage: { corruptRows: number; unreadableDays: string[]; truncated: boolean }
}

export function readPipelineTrendEvents(
  repoRoot: string,
  archiveDir: string,
  from: number,
  to: number,
  providerIdRaw: string,
  cursorRaw: string,
  limitRaw: number,
): PipelineTrendEventsResponse {
  if (from >= to || to - from > MAX_RANGE_MS) throw new Error('invalid trend range')
  const providerId = cleanProviderId(providerIdRaw)
  const cursor = Math.max(0, nonnegativeInt(Number(cursorRaw || 0)))
  const limit = Math.max(1, Math.min(250, nonnegativeInt(limitRaw || 100)))
  const read = readPipelineEvents(repoRoot, archiveDir, from, to)
  const filtered = (providerId ? read.events.filter((event) => {
    if (event.kind === 'provider_outcome') return event.providerId === providerId
    if (event.kind === 'provider_decision') return event.actualProviderId === providerId || event.shadowProviderId === providerId || event.candidates.some((candidate) => candidate.id === providerId)
    if (event.kind === 'provider_snapshot') return event.providers.some((provider) => provider.id === providerId)
    return false
  }) : read.events).sort((left, right) => right.ts.localeCompare(left.ts))
  const events = filtered.slice(cursor, cursor + limit)
  return {
    events,
    nextCursor: cursor + events.length < filtered.length ? String(cursor + events.length) : null,
    coverage: { corruptRows: read.corruptRows, unreadableDays: read.unreadableDays, truncated: read.truncated },
  }
}
