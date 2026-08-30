// Forever-living resume supervisor — the SERVER-SIDE driver that continues interrupted runs with NO
// browser open.
//
// PR #80 gave the screener a disk-truth "resumable" scan, but the only thing that ACTED on it was the
// cockpit's browser store (_maybeAutoResume, fired on a board fetch). On a headless, always-on box (the
// cloud host) no browser is ever open, so nothing relaunched — and research runs had no resume at all.
// This loop closes both gaps: a periodic, crash-safe reconciler that scans the run folders on disk
// (the in-memory registry is wiped on restart, so disk is the only surviving truth) and relaunches the
// interrupted ones through the normal launch() path — so admission still prevents double-launches.
//
// Two interruptions it heals, per the user's goal:
//   • plan usage limit hit → WAIT until the limit's resetsAt (stamped on disk in the .interrupted marker,
//     so the wait survives a reboot), then continue. It NEVER relaunches while the plan is spending
//     overage — running out of plan usage pauses, it does not start paid billing.
//   • dropped connection / closed laptop / reboot → the broken run is picked up on the next tick.
//
// Idempotent: a resumed full skips the modules already finished on disk (launchFullChained seeds `done`),
// and the screener gauntlet skips finished modules. Never resurrects a deliberate stop (.aborted) or a
// staged --until partial (.target). ON by default so a server restart cannot strand a two-hour run; an
// operator can explicitly disable it with RESUME_SUPERVISOR_ENABLED=0 for maintenance. Bounded by a
// max-concurrent cap and exponential per-run backoff. It never ages an interruption out, and a durable
// progress receipt slows repeated paid attempts after distinct children prove they made the exact same zero
// progress without permanently stranding the only child that could advance it. Single-instance locked so
// two engines on one state dir never double-resume.

import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, STATE_DIR } from './config'
import {
  assertProviderAvailable, checkProviderUsage, finalDeliverablesPresent, launch, launchFullChained,
  subjectChainActive,
} from './launcher'
import { hasRunMarker, readRunMarker } from './outputs'
import { listRuns } from './registry'
import { listResumableSignals } from './screener'
import { acquireSingletonLock, releaseSingletonLock } from './singleton-lock'
import { SubjectBusyError, subjectMutationLockKey, withSubjectLock } from './subject-lock'
import type { CreditPreflight } from './types'
import type { RunProvider } from './providers/types'
import {
  hasProvenLegacyClaudeLineage, readLastProviderSelection, readProviderInterruptionAuthority,
  readProviderPublicationAuthority,
} from './execution-provenance'
import { autoResumeDue } from './resume-policy'
import { listResumableRuns } from './resumable'
import {
  admitExactSavedRunContinuation, automaticContinuationRequestId, reviewExactSavedRunContinuation,
  type ReviewedExactContinuation,
} from './continuation'
import { readVerifiedOutputLineage } from './evidence-lineage'
import { RESEARCH_SWARM_ID } from './swarms'
import { canonicalJsonText } from './canonical-json'
import {
  sanitizeRecoverableChainRoot, thesisPlanForRequest, type ThesisPlan,
} from './completion'
import { getProviderAdapter } from './providers/registry'
import {
  listCancelledChainIntents, listDeferredPreSpendRetries, listRecoverableChainIntents, readDeferredPreSpendRetry,
  readRecoverableChainIntent, rearmDeferredPreSpendRetry, resumeRecoverableChainIntent,
  type CancelledChainIntentRecord, type DeferredPreSpendRetryRecord,
  type PreSpendRetryProfile, type PreparedRunPlanTransaction,
  type RecoverableChainIntentRecord,
} from './run-plan-transaction'
import {
  markRunPlanAdmitted, markRunPlanFailedBeforeStart, markRunPlanStarted, readRunPlanRequest,
} from './run-plan-admission'

const LOCK_FILE = 'resume-supervisor.lock'
// Checked-in autonomous recovery is the safe production default. Operators may explicitly disable it for
// maintenance/dev with RESUME_SUPERVISOR_ENABLED=0; an absent variable must never strand a two-hour run.
const ENABLED = process.env.RESUME_SUPERVISOR_ENABLED !== '0'
const TICK_MS = Math.max(60, Number(process.env.RESUME_TICK_SEC) || 300) * 1000
const MAX_CONCURRENT = Math.max(1, Number(process.env.RESUME_MAX_CONCURRENT) || 2)
const COOLDOWN_MS = Math.max(30, Number(process.env.RESUME_COOLDOWN_SEC) || 120) * 1000
const MAX_BACKOFF_MS = Math.max(COOLDOWN_MS, Number(process.env.RESUME_MAX_BACKOFF_SEC) * 1000 || 30 * 60 * 1000)
const IDENTICAL_PROGRESS_LIMIT = Math.max(2, Number(process.env.RESUME_IDENTICAL_PROGRESS_LIMIT) || 3)
const RESET_BUFFER_MS = Math.max(0, Number(process.env.RESUME_RESET_BUFFER_SEC) || 60) * 1000

const tries = new Map<string, { count: number; lastAt: number }>()
const gaveUp = new Set<string>() // log a permanent identity hold or one durable retry window once

const log = (m: string) => console.log(`[resume] ${m}`) // eslint-disable-line no-console

export interface ResumableRun {
  kind: 'full' | 'module' | 'signal'
  swarm?: string
  subject: string
  module?: string
  reason?: string
  resetsAt?: number
  runRoot?: string
  provider?: RunProvider
  model?: string
  reasoningLevel?: string
  expectedProfileKey?: string
  /** Exact protected provider attempt that wrote the currently sealed interruption marker. */
  interruptionId?: string
}

interface DurableResumeProgress {
  version: 1
  runRoot: string
  provider: RunProvider
  profileKey: string
  progressFingerprint: string
  interruptionId: string
  identicalProgressAttempts: number
  status: 'retrying' | 'needs_attention'
  /** Durable capped-backoff deadline for this exact interruption. Informational `needs_attention` never
   * turns this into a permanent hold: the same exact root remains eligible once this deadline passes. */
  nextEligibleAt?: string
  updatedAt: string
}

export interface ResumeProgressDecision {
  allow: boolean
  progressAdvanced: boolean
  identicalProgressAttempts: number
  status: DurableResumeProgress['status']
  nextEligibleAt: number
}

const PROGRESS_FINGERPRINT = /^sha256:[a-f0-9]{64}$/
const RESUME_PROGRESS_DIR = 'resume-progress'

function exactResumeKey(candidate: Pick<ResumableRun, 'runRoot' | 'provider' | 'expectedProfileKey'>): string {
  return createHash('sha256').update(JSON.stringify({
    runRoot: candidate.runRoot ?? '',
    provider: candidate.provider ?? '',
    profileKey: candidate.expectedProfileKey ?? '',
  }), 'utf8').digest('hex')
}

function resumeAttemptKey(candidate: ResumableRun): string {
  return candidate.runRoot
    ? exactResumeKey(candidate)
    : `${resumeSwarm(candidate)}\0${candidate.subject}`
}

function retryDelayMs(count: number): number {
  return Math.min(MAX_BACKOFF_MS, COOLDOWN_MS * 2 ** Math.min(Math.max(0, count - 1), 8))
}

function progressDirectory(stateDir: string): string {
  // macOS exposes canonical parent aliases such as /var -> /private/var. The configured state directory
  // itself must still be a real owner directory (never a symlink), but its canonical absolute spelling is
  // the security boundary for descendants. Comparing a canonical child with the caller's lexical alias
  // falsely rejected every durable retry record under os.tmpdir and could hold all recovery forever.
  const resolved = path.resolve(stateDir)
  fs.mkdirSync(resolved, { recursive: true, mode: 0o700 })
  const info = fs.lstatSync(resolved)
  if (!info.isDirectory() || info.isSymbolicLink()) {
    throw new Error('resume progress state root is unsafe')
  }
  if (process.platform !== 'win32' && typeof process.getuid === 'function' && info.uid !== process.getuid()) {
    throw new Error('resume progress state root is not owner-owned')
  }
  return path.join(fs.realpathSync(resolved), RESUME_PROGRESS_DIR)
}

function progressPath(candidate: ResumableRun, stateDir: string): string {
  return path.join(progressDirectory(stateDir), `${exactResumeKey(candidate)}.json`)
}

function ensureOwnerOnlyDirectory(directory: string): void {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  const info = fs.lstatSync(directory)
  if (!info.isDirectory() || info.isSymbolicLink() || fs.realpathSync(directory) !== path.resolve(directory)) {
    throw new Error('resume progress state directory is unsafe')
  }
  if (process.platform !== 'win32') {
    if (typeof process.getuid === 'function' && info.uid !== process.getuid()) {
      throw new Error('resume progress state directory is not owner-owned')
    }
    fs.chmodSync(directory, 0o700)
  }
}

function syncDirectory(directory: string): void {
  if (process.platform === 'win32') return
  const fd = fs.openSync(directory, fs.constants.O_RDONLY)
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

function validDurableProgress(value: unknown, candidate: ResumableRun): value is DurableResumeProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return row.version === 1 && row.runRoot === candidate.runRoot && row.provider === candidate.provider
    && row.profileKey === candidate.expectedProfileKey
    && typeof row.progressFingerprint === 'string' && PROGRESS_FINGERPRINT.test(row.progressFingerprint)
    && typeof row.interruptionId === 'string' && row.interruptionId.length > 0
    && Number.isInteger(row.identicalProgressAttempts) && Number(row.identicalProgressAttempts) >= 0
    && (row.status === 'retrying' || row.status === 'needs_attention')
    && (row.nextEligibleAt === undefined
      || (typeof row.nextEligibleAt === 'string' && Number.isFinite(Date.parse(row.nextEligibleAt))))
    && typeof row.updatedAt === 'string' && Number.isFinite(Date.parse(row.updatedAt))
}

function readDurableProgress(candidate: ResumableRun, stateDir: string): DurableResumeProgress | null {
  const target = progressPath(candidate, stateDir)
  let fd: number | null = null
  try {
    fd = fs.openSync(target, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const before = fs.fstatSync(fd)
    if (!before.isFile() || before.nlink !== 1
        || (process.platform !== 'win32' && (before.mode & 0o077) !== 0)) {
      throw new Error('resume progress state is not one owner-only regular file')
    }
    const value = JSON.parse(fs.readFileSync(fd, 'utf8'))
    const after = fs.fstatSync(fd)
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
        || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
      throw new Error('resume progress state changed while being read')
    }
    if (!validDurableProgress(value, candidate)) throw new Error('resume progress state is invalid')
    return value
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null
    throw error
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
}

function writeDurableProgress(candidate: ResumableRun, record: DurableResumeProgress, stateDir: string): void {
  const directory = progressDirectory(stateDir)
  ensureOwnerOnlyDirectory(directory)
  const target = progressPath(candidate, stateDir)
  const temporary = path.join(directory, `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`)
  let fd: number | null = null
  try {
    fd = fs.openSync(
      temporary,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600,
    )
    fs.writeFileSync(fd, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = null
    fs.renameSync(temporary, target)
    if (process.platform !== 'win32') fs.chmodSync(target, 0o600)
    syncDirectory(directory)
  } catch (error) {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.unlinkSync(temporary) } catch { /* renamed or never created */ }
    throw error
  }
}

/** Protected output progress only: ambient provider files and marker timestamps cannot fake progress. */
export function resumeProgressFingerprint(runRoot: string): string {
  const verified = readVerifiedOutputLineage(runRoot)
  return `sha256:${createHash('sha256').update(JSON.stringify({
    runRoot,
    entries: verified.entries.map((entry) => ({
      output: entry.output_rel,
      sha256: entry.sha256,
      generation: entry.generation_digest,
    })),
  }), 'utf8').digest('hex')}`
}

/**
 * Persist one exact root/profile progress baseline before an automatic paid continuation. A restart that
 * sees the same interruption replays its durable request and does not count twice. A later protected child
 * with the same verified outputs increments the no-progress count. Repeated zero-progress children are
 * surfaced as Needs attention and receive a durable capped backoff, but are never abandoned: only another
 * exact child can advance the fingerprint. Protected artifact progress clears both the count and deadline.
 */
export function evaluateResumeProgress(
  candidate: ResumableRun,
  stateDir: string = STATE_DIR,
  fingerprint: (runRoot: string) => string = resumeProgressFingerprint,
  now: number = Date.now(),
): ResumeProgressDecision {
  if (!candidate.runRoot || !candidate.provider || !candidate.expectedProfileKey || !candidate.interruptionId) {
    throw new Error('automatic resume progress requires exact root/provider/profile/interruption identity')
  }
  const currentFingerprint = fingerprint(candidate.runRoot)
  if (!PROGRESS_FINGERPRINT.test(currentFingerprint)) throw new Error('automatic resume progress proof is invalid')
  const prior = readDurableProgress(candidate, stateDir)
  const sameInterruption = prior?.interruptionId === candidate.interruptionId
  const progressAdvanced = prior !== null && prior.progressFingerprint !== currentFingerprint
  const identicalProgressAttempts = !prior || progressAdvanced
    ? 0
    : sameInterruption ? prior.identicalProgressAttempts : prior.identicalProgressAttempts + 1
  const status: DurableResumeProgress['status'] = identicalProgressAttempts >= IDENTICAL_PROGRESS_LIMIT
    ? 'needs_attention'
    : 'retrying'
  // A newly observed paid interruption schedules one durable delay. Re-reading that SAME interruption must
  // not slide the deadline forever; a restart recovers the exact timestamp and becomes eligible when due.
  const priorDeadline = prior?.nextEligibleAt ? Date.parse(prior.nextEligibleAt) : NaN
  const nextEligibleAt = !prior || progressAdvanced
    ? now
    : sameInterruption && Number.isFinite(priorDeadline)
      ? priorDeadline
      : now + retryDelayMs(Math.max(1, identicalProgressAttempts))
  writeDurableProgress(candidate, {
    version: 1,
    runRoot: candidate.runRoot,
    provider: candidate.provider,
    profileKey: candidate.expectedProfileKey,
    progressFingerprint: currentFingerprint,
    interruptionId: candidate.interruptionId,
    identicalProgressAttempts,
    status,
    nextEligibleAt: new Date(nextEligibleAt).toISOString(),
    updatedAt: new Date(now).toISOString(),
  }, stateDir)
  return { allow: now >= nextEligibleAt, progressAdvanced, identicalProgressAttempts, status, nextEligibleAt }
}

const DATE_SUFFIX = /_(\d{4}-\d{2}-\d{2})$/

// Research run folders that broke and should be continued. Disk-truth, like the screener scan: a folder
// is resumable iff it carries the .interrupted marker (a plan-limit / connection / kill break — NOT a
// clean budget truncation, which is the honest `incomplete` outcome and is never marked), is NOT
// deliberately aborted (.aborted), has NOT finished (no final thesis + decision record), and is not currently
// live. Interruptions never age out. The marker carries the break reason + the plan resetsAt.
export function listResumableResearchRuns(liveSubjects: Set<string>, now: number = Date.now()): ResumableRun[] {
  let entries: string[] = []
  try { entries = fs.readdirSync(ANALYSES_DIR) } catch { return [] }
  const out: ResumableRun[] = []
  for (const dir of entries) {
    const m = DATE_SUFFIX.exec(dir)
    if (!m) continue // not a "<TICKER>_<YYYY-MM-DD>" run folder
    const ticker = dir.slice(0, m.index)
    if (!ticker || liveSubjects.has(ticker)) continue // currently running — not interrupted
    const runRoot = `analyses/${dir}`
    const abs = path.join(ANALYSES_DIR, dir)
    try { if (!fs.statSync(abs).isDirectory()) continue } catch { continue }
    const marker = readRunMarker(runRoot, '.interrupted')
    if (!marker) continue // only a recorded interruption is auto-resumed
    if (hasRunMarker(runRoot, '.aborted')) continue // user stopped it on purpose
    const markerRunId = typeof marker.runId === 'string' ? marker.runId : undefined
    const authority = markerRunId ? readProviderInterruptionAuthority(runRoot, markerRunId) : null
    const markerModule = typeof marker.module === 'string' && /^[a-z0-9][a-z0-9-]{0,39}$/.test(marker.module)
      ? marker.module : undefined
    // A failed exact module Continue may live inside a root that already has an older final thesis. The
    // marker-selected module is still unfinished and must be completed without converting it to Full.
    if (!markerModule && finalDeliverablesPresent(runRoot)) continue
    const selected = authority
    // `.interrupted` is provider-child-writable. It can describe why the process stopped, but it never
    // establishes execution identity. If it carries identity fields, require exact agreement with the
    // supervisor/committed selection; a conflict is held for manual review rather than silently switching.
    const markerConflicts = Boolean(selected && (
      ((marker.provider === 'codex' || marker.provider === 'claude') && marker.provider !== selected.provider)
      || (typeof marker.model === 'string' && selected?.model !== marker.model)
      || (typeof marker.reasoningLevel === 'string' && selected?.reasoningLevel !== marker.reasoningLevel)
      || (typeof marker.runId === 'string' && marker.runId !== authority?.interruptionRunId)
      || (typeof marker.attemptId === 'string' && marker.attemptId !== authority?.runId)
    ))
    const provider: RunProvider | undefined = markerConflicts ? undefined : selected?.provider
    out.push({
      kind: markerModule ? 'module' : 'full', swarm: 'research', subject: ticker,
      ...(markerModule ? { module: markerModule } : {}), reason: marker.reason,
      resetsAt: typeof marker.resetsAt === 'number' ? marker.resetsAt : undefined,
      runRoot, provider,
      model: markerConflicts ? undefined : selected?.model,
      reasoningLevel: markerConflicts ? undefined : selected?.reasoningLevel,
      expectedProfileKey: markerConflicts ? undefined : selected?.profileKey,
      interruptionId: markerConflicts ? undefined : authority?.interruptionRunId,
    })
  }
  return out
}

// HOLD everything when the plan is genuinely out of usage right now: never relaunch into a hard
// rate-limit (it would just re-break), and NEVER while overage is being spent (the no-paid-billing
// guarantee — running out of plan pauses, it does not charge). A window whose resetsAt has already
// passed no longer holds (the limit reset). Pure — unit-tested.
export function shouldHoldForCredit(credit: CreditPreflight, now: number): boolean {
  // Unknown telemetry is not spare capacity. After restart the cache is deliberately empty; treating
  // {ok:true, checked:false} as permission would immediately relaunch an exhausted provider.
  if (credit.checked !== true) return true
  const overage = credit.isUsingOverage === true || Object.values(credit.windows || {}).some((w) => w?.isUsingOverage === true)
  if (overage) return true
  // a currently-rejected binding window with a future reset → wait for the reset
  if (credit.ok === false && typeof credit.resetsAt === 'number' && credit.resetsAt * 1000 > now) return true
  for (const w of Object.values(credit.windows || {})) {
    if (w?.status === 'rejected' && typeof w.resetsAt === 'number' && w.resetsAt * 1000 > now) return true
  }
  return false
}

// Is this specific run due to resume NOW? A plan-limit break waits until its own resetsAt (+ buffer);
// every other break (connection / kill / reboot) is due immediately (still gated by the cooldown). Pure.
export function isResumeDue(item: ResumableRun, now: number, bufferMs: number = RESET_BUFFER_MS): boolean {
  return autoResumeDue(item.reason, item.resetsAt, now, bufferMs)
}

export function liveSubjectSet(swarmId: string): Set<string> {
  return new Set(listRuns()
    // Cancellation changes the display status before the process group exits. endedAt is the close/finalize
    // proof, so a due disk candidate cannot auto-launch into that still-writing shutdown window.
    .filter((run) => run.swarmId === swarmId && run.endedAt === undefined)
    .map((run) => run.subjectId))
}

export type ResumeDispatchOutcome = 'launched' | 'busy' | 'stale'

export interface ResumeCandidateDispatchDeps {
  withLock: typeof withSubjectLock
  liveSubjects: (swarm: string) => Set<string>
  stillResumable: (candidate: ResumableRun, live: Set<string>, now: number) => boolean
  /** Proposal is built before the mutex; the final launch path recomputes it under the mutex as a CAS. */
  reviewCandidate: (candidate: ResumableRun) => Promise<ReviewedExactContinuation | null>
  launchCandidate: (candidate: ResumableRun, review: ReviewedExactContinuation | null) => Promise<unknown>
}

const resumeSwarm = (candidate: ResumableRun): string =>
  candidate.swarm ?? (candidate.kind === 'signal' ? 'screener' : 'research')

const defaultCandidateDispatchDeps: ResumeCandidateDispatchDeps = {
  withLock: withSubjectLock,
  liveSubjects: liveSubjectSet,
  stillResumable: (candidate, live, now) => {
    if (live.has(candidate.subject) || !isResumeDue(candidate, now)) return false
    if ((candidate.kind === 'full' || candidate.kind === 'module')
        && (!candidate.swarm || candidate.swarm === 'research')) {
      return listResumableResearchRuns(live, now).some((current) =>
        current.subject === candidate.subject && current.runRoot === candidate.runRoot
        && current.kind === candidate.kind && current.module === candidate.module
        && current.provider === candidate.provider && current.model === candidate.model
        && current.reasoningLevel === candidate.reasoningLevel
        && current.expectedProfileKey === candidate.expectedProfileKey
        && current.interruptionId === candidate.interruptionId
        && current.reason === candidate.reason)
    }
    if (candidate.kind === 'signal') {
      return listResumableSignals(live).some((current) => current.sigId === candidate.subject)
    }
    return listResumableRuns().some((current) => current.kind === 'full'
      && current.swarm === candidate.swarm && current.subject === candidate.subject
      && current.runRoot === candidate.runRoot && typeof current.reason === 'string')
  },
  reviewCandidate: async (candidate) => {
    if ((candidate.kind !== 'full' && candidate.kind !== 'module')
        || (candidate.swarm && candidate.swarm !== 'research')) return null
    if (!candidate.provider || !candidate.runRoot || !candidate.interruptionId) {
      throw new Error('automatic resume has no exact supervisor-sealed interruption identity')
    }
    const requestId = automaticContinuationRequestId(candidate.runRoot, candidate.interruptionId)
    return reviewExactSavedRunContinuation({
      swarm: 'research', subject: candidate.subject, runRoot: candidate.runRoot,
      kind: candidate.kind, ...(candidate.module ? { module: candidate.module } : {}),
      provider: candidate.provider, model: candidate.model, reasoningLevel: candidate.reasoningLevel,
      expectedProfileKey: candidate.expectedProfileKey,
      user: 'auto', userVia: 'local', requestId,
    })
  },
  launchCandidate: async (candidate, review) => {
    if (!candidate.provider) throw new Error('automatic resume has no supervisor-recorded provider')
    if ((candidate.kind === 'full' || candidate.kind === 'module')
        && (!candidate.swarm || candidate.swarm === 'research')) {
      if (!candidate.runRoot || !candidate.interruptionId) {
        throw new Error('automatic resume has no exact reviewed continuation transaction')
      }
      if (!review) throw new Error('automatic resume has no exact reviewed continuation transaction')
      return (await admitExactSavedRunContinuation({
        swarm: 'research',
        subject: candidate.subject,
        runRoot: candidate.runRoot,
        kind: candidate.kind,
        ...(candidate.module ? { module: candidate.module } : {}),
        provider: candidate.provider,
        model: candidate.model,
        reasoningLevel: candidate.reasoningLevel,
        expectedProfileKey: candidate.expectedProfileKey,
        user: 'auto',
        userVia: 'local',
        reviewed: review,
      })).response
    }
    return launch({
      kind: candidate.kind,
      ticker: candidate.subject,
      ...(candidate.swarm ? { swarm: candidate.swarm } : {}),
      provider: candidate.provider,
      model: candidate.model,
      reasoningLevel: candidate.reasoningLevel,
      expectedProfileKey: candidate.expectedProfileKey,
    })
  },
}

/**
 * Final autonomous-resume boundary. Planning is intentionally outside the mutex, but disk eligibility,
 * registry liveness and the launch ACK are re-read/held inside the SAME subject mutation lock used by exact
 * module staging. Thus either side wins atomically: a staging route already holding the key keeps the
 * supervisor out without any launch mutation, while a supervisor that owns it registers its RunState before
 * the route can enter and perform its own busy-before-staging check.
 */
export async function dispatchResumableCandidate(
  candidate: ResumableRun,
  now: number,
  deps: ResumeCandidateDispatchDeps = defaultCandidateDispatchDeps,
): Promise<ResumeDispatchOutcome> {
  const swarm = resumeSwarm(candidate)
  // Planning can hash a large saved tree. Keep it outside the mutation mutex, then treat it only as a
  // proposal: the exact continuation admission recomputes the v2 receipt while this lock is held.
  if (deps.liveSubjects(swarm).has(candidate.subject)) return 'stale'
  const reviewed = await deps.reviewCandidate(candidate)
  try {
    return await deps.withLock(subjectMutationLockKey(swarm, candidate.subject), async () => {
      const live = deps.liveSubjects(swarm)
      if (live.has(candidate.subject) || !deps.stillResumable(candidate, live, now)) return 'stale'
      await deps.launchCandidate(candidate, reviewed)
      return 'launched'
    })
  } catch (error) {
    if (error instanceof SubjectBusyError) return 'busy'
    throw error
  }
}

export type DeferredPreSpendDispatchOutcome = 'launched' | 'waiting' | 'stale' | 'needs_attention' | 'busy'

export interface DeferredPreSpendDispatchDeps {
  withLock: typeof withSubjectLock
  readRecord: (requestId: string) => Promise<DeferredPreSpendRetryRecord | null>
  usage: typeof checkProviderUsage
  providerAvailable: typeof assertProviderAvailable
  revalidatePlan: (record: DeferredPreSpendRetryRecord) => Promise<ThesisPlan>
  resolveProfile: (record: DeferredPreSpendRetryRecord) => PreSpendRetryProfile
  rearm: (
    record: DeferredPreSpendRetryRecord,
    plan: ThesisPlan,
    profile: PreSpendRetryProfile,
  ) => Promise<PreparedRunPlanTransaction>
  requestUser: (requestId: string) => Promise<{ user: string; subject: string } | null>
  launch: typeof launch
  markAdmitted: typeof markRunPlanAdmitted
}

const defaultDeferredPreSpendDispatchDeps: DeferredPreSpendDispatchDeps = {
  withLock: withSubjectLock,
  readRecord: (requestId) => readDeferredPreSpendRetry(requestId),
  usage: checkProviderUsage,
  providerAvailable: assertProviderAvailable,
  revalidatePlan: (record) => thesisPlanForRequest(
    record.subject,
    RESEARCH_SWARM_ID,
    record.reviewedPlan.reuse,
    undefined,
    {
      provider: record.authority.provider,
      model: record.authority.model,
      reasoningLevel: record.authority.reasoningLevel ?? undefined,
      expectedProfileKey: record.authority.profileKey,
    },
    { freshRunRoot: record.targetRunRoot },
  ),
  resolveProfile: (record) => {
    const resolved = getProviderAdapter(record.authority.provider).resolveProfile({
      model: record.authority.model,
      reasoningLevel: record.authority.reasoningLevel ?? undefined,
      profileKey: record.authority.profileKey,
    })
    return {
      provider: resolved.provider,
      model: resolved.model,
      reasoningLevel: resolved.reasoningLevel ?? null,
      profileKey: resolved.profileKey,
      executionProfile: resolved.executionProfile,
    }
  },
  rearm: (record, revalidatedPlan, resolvedProfile) => rearmDeferredPreSpendRetry(
    { record, revalidatedPlan, resolvedProfile },
    {
      onStarted: async () => { await markRunPlanStarted(record.requestId) },
      onRolledBack: async (reason) => { await markRunPlanFailedBeforeStart(record.requestId, reason) },
    },
  ),
  requestUser: async (requestId) => {
    const request = await readRunPlanRequest(requestId)
    return request ? { user: request.user, subject: request.subject } : null
  },
  launch,
  markAdmitted: markRunPlanAdmitted,
}

/** Restart-safe pre-spend admission. The complete original v2 plan is recomputed under the subject lock;
 * data/roster/profile/target drift therefore holds the request for attention without publishing a root or
 * spending. A second tick observes the journal transition and cannot create another paid attempt. */
export async function dispatchDeferredPreSpendRetry(
  initial: DeferredPreSpendRetryRecord,
  now: number = Date.now(),
  deps: DeferredPreSpendDispatchDeps = defaultDeferredPreSpendDispatchDeps,
): Promise<DeferredPreSpendDispatchOutcome> {
  if (now < initial.notBeforeMs) return 'waiting'
  let credit: CreditPreflight
  try { credit = await deps.usage(initial.authority.provider) ?? { ok: true, checked: false } } catch {
    credit = { ok: true, checked: false }
  }
  if (shouldHoldForCredit(credit, now)) return 'waiting'
  try { await deps.providerAvailable(initial.authority.provider) } catch { return 'waiting' }

  try {
    return await deps.withLock(subjectMutationLockKey(RESEARCH_SWARM_ID, initial.subject), async () => {
      const current = await deps.readRecord(initial.requestId)
      if (!current || current.integritySha256 !== initial.integritySha256) return 'stale'
      if (Date.now() < current.notBeforeMs) return 'waiting'
      if (liveSubjectSet(RESEARCH_SWARM_ID).has(current.subject)) return 'busy'
      const request = await deps.requestUser(current.requestId)
      if (!request || request.subject !== current.subject) return 'needs_attention'
      let plan: ThesisPlan
      let profile: PreSpendRetryProfile
      try {
        profile = deps.resolveProfile(current)
        plan = await deps.revalidatePlan(current)
      } catch {
        return 'needs_attention'
      }
      let transaction: PreparedRunPlanTransaction
      try { transaction = await deps.rearm(current, plan, profile) } catch { return 'needs_attention' }
      try {
        const out = await deps.launch({
          kind: 'full', ticker: current.subject,
          provider: profile.provider, model: profile.model,
          reasoningLevel: profile.reasoningLevel ?? undefined,
          expectedProfileKey: profile.profileKey,
          user: request.user,
          userVia: request.user === 'local' ? 'local' : 'cf-access',
          preparedRunPlanTransaction: transaction,
          preSpendRetryAuthority: current.authority,
        })
        await deps.markAdmitted(current.requestId, out.runId, {
          ...out,
          requestId: current.requestId,
          planFingerprint: current.reviewedPlan.continuationReceipt.fingerprint,
          carried: transaction.preparation.carried,
          reused: current.reviewedPlan.reuse,
          willRun: current.reviewedPlan.run,
          preparedDoneOrbKeys: transaction.preparation.doneOrbKeys,
          ranClean: transaction.preparation.ranClean,
        })
        return 'launched'
      } catch (error: any) {
        if (error?.preSpendRetryDeferred === true
            && error?.preSpendRetryRequestId === current.requestId) return 'waiting'
        try { await transaction.rollbackIfUnstarted(String(error?.message || error)) } catch {}
        return 'needs_attention'
      }
    })
  } catch (error) {
    if (error instanceof SubjectBusyError) return 'busy'
    throw error
  }
}

function receiptOrbUniverse(plan: ThesisPlan): string[] {
  return [...new Set([
    ...plan.continuationReceipt.reusableOrbKeys,
    ...plan.continuationReceipt.payableOrbKeys,
  ])].sort()
}

/** Rebuild the immutable inputs of a started chain while deliberately ignoring its own newly completed
 * outputs. The original receipt remains the authority; current disk bytes may only move payable orbs into
 * the durable chain intent, never add/remove roster identities, change data, or substitute a profile. */
export async function revalidateRecoverableChainPlan(record: RecoverableChainIntentRecord): Promise<ThesisPlan> {
  const original = record.reviewedPlan
  const selection = {
    provider: record.intent.selection.provider,
    model: record.intent.selection.model,
    reasoningLevel: record.intent.selection.reasoningLevel ?? undefined,
    expectedProfileKey: record.intent.selection.profileKey,
  }
  const current = await thesisPlanForRequest(
    record.subject,
    RESEARCH_SWARM_ID,
    original.reuse,
    undefined,
    selection,
    original.continuationReceipt.action === 'continue'
      ? { continuationRunRoot: record.targetRunRoot }
      : { freshRunRoot: record.targetRunRoot, recoverFrozenGeneration: true },
  )
  const stableOriginal = {
    swarm: original.swarm,
    subject: original.subject,
    targetRunRoot: original.targetRunRoot,
    provider: original.continuationReceipt.provider,
    action: original.continuationReceipt.action,
    dataPool: original.continuationReceipt.action === 'continue'
      ? original.continuationReceipt.dataPool
      : { files: original.continuationReceipt.dataPool.files },
    evidenceGenerationDigest: original.continuationReceipt.action === 'continue'
      ? original.continuationReceipt.evidenceGenerationDigest : null,
    roster: original.modules.map((entry) => ({ module: entry.module, totalAgents: entry.totalAgents })),
    orbUniverse: receiptOrbUniverse(original),
  }
  const stableCurrent = {
    swarm: current.swarm,
    subject: current.subject,
    targetRunRoot: current.targetRunRoot,
    provider: current.continuationReceipt.provider,
    action: current.continuationReceipt.action,
    dataPool: original.continuationReceipt.action === 'continue'
      ? current.continuationReceipt.dataPool
      : { files: current.continuationReceipt.dataPool.files },
    evidenceGenerationDigest: original.continuationReceipt.action === 'continue'
      ? current.continuationReceipt.evidenceGenerationDigest : null,
    roster: current.modules.map((entry) => ({ module: entry.module, totalAgents: entry.totalAgents })),
    orbUniverse: receiptOrbUniverse(current),
  }
  if (canonicalJsonText(stableOriginal) !== canonicalJsonText(stableCurrent)) {
    throw new Error('recoverable full-chain immutable plan inputs changed')
  }
  const lineage = new Map(readVerifiedOutputLineage(record.targetRunRoot).entries
    .map((entry) => [entry.output_rel, entry]))
  if (original.continuationReceipt.action === 'complete') {
    const generation = current.continuationReceipt.evidenceGenerationDigest
    if (!generation) throw new Error('recoverable fresh Full has no protected frozen generation')
    for (const completed of record.intent.completed) {
      for (const artifact of completed.artifacts) {
        const protectedArtifact = lineage.get(artifact.outputRel)
        if (!protectedArtifact || protectedArtifact.sha256 !== artifact.sha256
            || protectedArtifact.generation_digest !== generation) {
          throw new Error(`recoverable fresh Full generation changed: ${artifact.outputRel}`)
        }
      }
    }
  }
  if (original.continuationReceipt.reusableArtifacts.length > 0) {
    for (const artifact of original.continuationReceipt.reusableArtifacts) {
      const currentArtifact = lineage.get(artifact.output_rel)
      if (!currentArtifact || currentArtifact.sha256 !== artifact.sha256
          || currentArtifact.generation_digest !== artifact.generation_digest
          || currentArtifact.attempt_id !== artifact.attempt_id) {
        throw new Error(`recoverable full-chain reusable evidence changed: ${artifact.output_rel}`)
      }
    }
  }
  return original
}

export type RecoverableChainDispatchOutcome = DeferredPreSpendDispatchOutcome | 'completed'

export interface RecoverableChainDispatchDeps {
  withLock: typeof withSubjectLock
  readRecord: (requestId: string) => Promise<RecoverableChainIntentRecord | null>
  usage: typeof checkProviderUsage
  providerAvailable: typeof assertProviderAvailable
  live: (subject: string) => boolean
  resolveProfile: (record: RecoverableChainIntentRecord) => PreSpendRetryProfile
  revalidatePlan: (record: RecoverableChainIntentRecord) => Promise<ThesisPlan>
  reopen: (
    record: RecoverableChainIntentRecord,
    plan: ThesisPlan,
    profile: PreSpendRetryProfile,
  ) => Promise<PreparedRunPlanTransaction>
  published: (record: RecoverableChainIntentRecord, profile: PreSpendRetryProfile) => boolean
  terminalizePublished: (
    transaction: PreparedRunPlanTransaction,
    record: RecoverableChainIntentRecord,
  ) => Promise<void>
  sanitize: (record: RecoverableChainIntentRecord) => void
  launchChain: typeof launchFullChained
}

/** A final file pair is not enough: only the supervisor's owner-only publication record, re-hashed on
 * read and bound to this exact frozen provider profile, can close a crashed chain without another master. */
export function recoverableChainPublicationIsSealed(
  record: RecoverableChainIntentRecord,
  profile: PreSpendRetryProfile,
): boolean {
  if (!finalDeliverablesPresent(record.targetRunRoot)) return false
  const authority = readProviderPublicationAuthority(record.targetRunRoot)
  if (!authority) return false
  const expected = {
    provider: profile.provider, model: profile.model,
    reasoningLevel: profile.reasoningLevel ?? null,
    profileKey: profile.profileKey, executionProfile: profile.executionProfile,
  }
  const actual = {
    provider: authority.provider, model: authority.model,
    reasoningLevel: authority.reasoningLevel ?? null,
    profileKey: authority.profileKey, executionProfile: authority.executionProfile,
  }
  const thesis = `${record.targetRunRoot}/final_thesis.md`
  const decision = `${record.targetRunRoot}/decision_record.json`
  return canonicalJsonText(expected) === canonicalJsonText(actual)
    && typeof authority.artifactHashes[thesis] === 'string'
    && typeof authority.artifactHashes[decision] === 'string'
}

export async function terminalizeRecoverablePublishedChain(
  transaction: PreparedRunPlanTransaction,
  record: RecoverableChainIntentRecord,
): Promise<void> {
  await transaction.recordChainProgress({
    completed: record.intent.completed,
    nextModules: [],
    inflightModules: [],
    masterState: 'published',
  })
  await transaction.recordChainTerminal('done')
}

const defaultRecoverableChainDispatchDeps: RecoverableChainDispatchDeps = {
  withLock: withSubjectLock,
  readRecord: (requestId) => readRecoverableChainIntent(requestId),
  usage: checkProviderUsage,
  providerAvailable: assertProviderAvailable,
  live: (subject) => liveSubjectSet(RESEARCH_SWARM_ID).has(subject)
    || subjectChainActive(subject, RESEARCH_SWARM_ID),
  resolveProfile: (record) => {
    const resolved = getProviderAdapter(record.intent.selection.provider).resolveProfile({
      model: record.intent.selection.model,
      reasoningLevel: record.intent.selection.reasoningLevel ?? undefined,
      profileKey: record.intent.selection.profileKey,
    })
    return {
      provider: resolved.provider,
      model: resolved.model,
      reasoningLevel: resolved.reasoningLevel ?? null,
      profileKey: resolved.profileKey,
      executionProfile: resolved.executionProfile,
    }
  },
  revalidatePlan: revalidateRecoverableChainPlan,
  reopen: (record, revalidatedPlan, resolvedProfile) => resumeRecoverableChainIntent({
    record, revalidatedPlan, resolvedProfile,
  }),
  published: recoverableChainPublicationIsSealed,
  terminalizePublished: terminalizeRecoverablePublishedChain,
  sanitize: (record) => sanitizeRecoverableChainRoot({
    runRoot: record.targetRunRoot,
    reviewedPlan: record.reviewedPlan,
    doneOrbKeys: record.reviewedPlan.continuationReceipt.reusableOrbKeys
      .filter((key) => key !== 'master/synthesizer'),
    completed: record.intent.completed,
  }),
  launchChain: launchFullChained,
}

export async function dispatchRecoverableChainIntent(
  initial: RecoverableChainIntentRecord,
  now: number = Date.now(),
  deps: RecoverableChainDispatchDeps = defaultRecoverableChainDispatchDeps,
): Promise<RecoverableChainDispatchOutcome> {
  try {
    return await deps.withLock(subjectMutationLockKey(RESEARCH_SWARM_ID, initial.subject), async () => {
      const current = await deps.readRecord(initial.requestId)
      if (!current || current.integritySha256 !== initial.integritySha256) return 'stale'
      if (deps.live(current.subject)) return 'busy'
      // A fully-published master needs no provider and spends nothing. Reconcile it from the immutable,
      // hash-bound publication authority before consulting today's usage, provider installation, or profile
      // configuration. Those mutable checks may legitimately have changed after the exact master committed;
      // they must not strand (or repay) already-finished work.
      if (deps.published(current, current.intent.selection)) {
        let transaction: PreparedRunPlanTransaction
        try {
          transaction = await deps.reopen(current, current.reviewedPlan, current.intent.selection)
          await deps.terminalizePublished(transaction, current)
        } catch { return 'needs_attention' }
        return 'completed'
      }
      let credit: CreditPreflight
      try { credit = await deps.usage(current.intent.selection.provider) ?? { ok: true, checked: false } } catch {
        credit = { ok: true, checked: false }
      }
      if (shouldHoldForCredit(credit, now)) return 'waiting'
      try { await deps.providerAvailable(current.intent.selection.provider) } catch { return 'waiting' }
      let profile: PreSpendRetryProfile
      let plan: ThesisPlan
      try {
        profile = deps.resolveProfile(current)
        plan = await deps.revalidatePlan(current)
      } catch { return 'needs_attention' }
      let transaction: PreparedRunPlanTransaction
      try { transaction = await deps.reopen(current, plan, profile) } catch { return 'needs_attention' }
      try { deps.sanitize(current) } catch { return 'needs_attention' }
      try {
        await deps.launchChain(
          current.subject,
          current.intent.user,
          current.intent.userVia,
          {
            provider: profile.provider,
            model: profile.model,
            reasoningLevel: profile.reasoningLevel ?? undefined,
            expectedProfileKey: profile.profileKey,
          },
          undefined,
          undefined,
          undefined,
          {
            runRoot: current.targetRunRoot,
            continuation: current.reviewedPlan.continuationReceipt.action === 'continue',
            recoveryRequestId: current.intent.chainId,
            preparedRunPlanTransaction: transaction,
          },
        )
        return 'launched'
      } catch { return 'waiting' }
    })
  } catch (error) {
    if (error instanceof SubjectBusyError) return 'busy'
    throw error
  }
}

export interface ProtectedRecoveryQueueDeps {
  listChains: () => Promise<RecoverableChainIntentRecord[]>
  listCancelled: () => Promise<CancelledChainIntentRecord[]>
  listDeferred: () => Promise<DeferredPreSpendRetryRecord[]>
  dispatchChain: (record: RecoverableChainIntentRecord, now: number) => Promise<RecoverableChainDispatchOutcome>
  dispatchDeferred: (record: DeferredPreSpendRetryRecord, now: number) => Promise<DeferredPreSpendDispatchOutcome>
}

/** The durable transaction journal outranks mutable run-root markers. If cancellation authority cannot be
 * read safely, hold all legacy research recovery; otherwise exclude every exact root owned by a protected
 * chain, deferred admission, or cancellation tombstone. */
export function legacyResearchCandidatesAfterProtectedRecovery(
  candidates: ResumableRun[],
  protectedRoots: ReadonlySet<string>,
  protectedAuthorityVerified: boolean,
): ResumableRun[] {
  if (!protectedAuthorityVerified) return []
  return candidates.filter((candidate) => !candidate.runRoot || !protectedRoots.has(candidate.runRoot))
}

const defaultProtectedRecoveryQueueDeps: ProtectedRecoveryQueueDeps = {
  listChains: () => listRecoverableChainIntents(),
  listCancelled: () => listCancelledChainIntents(),
  listDeferred: () => listDeferredPreSpendRetries(),
  dispatchChain: dispatchRecoverableChainIntent,
  dispatchDeferred: dispatchDeferredPreSpendRetry,
}

// One reconciler pass. Crash-safe: re-running picks up anything still interrupted on disk.
export async function dispatchResumableRuns(
  now: number = Date.now(),
  protectedDeps: ProtectedRecoveryQueueDeps = defaultProtectedRecoveryQueueDeps,
): Promise<void> {
  if (!ENABLED) return
  let launched = 0
  const protectedResearchRoots = new Set<string>()
  let protectedAuthorityVerified = true
  try {
    for (const record of await protectedDeps.listCancelled()) {
      // The V3 transaction journal is the durable cancellation authority. It remains queryable after the
      // chain leaves the recoverable list, so a stale/missing mutable `.aborted` marker can never resurrect
      // the deliberately stopped exact root through the legacy scanner.
      protectedResearchRoots.add(record.targetRunRoot)
    }
  } catch (error: any) {
    protectedAuthorityVerified = false
    log(`could not verify durable full-chain cancellations: ${String(error?.message || error)}; holding legacy research recovery`)
  }
  let chains: RecoverableChainIntentRecord[] = []
  try { chains = await protectedDeps.listChains() } catch (error: any) {
    protectedAuthorityVerified = false
    log(`could not verify recoverable full-chain admissions: ${String(error?.message || error)}`)
  }
  for (const record of chains) protectedResearchRoots.add(record.targetRunRoot)
  // Already-paid chain work wins admission priority over new/pre-spend work. A protected chain record also
  // suppresses any legacy .interrupted marker for the same root, even when revalidation needs attention.
  for (const record of chains) {
    if (launched >= MAX_CONCURRENT) break
    try {
      const outcome = await protectedDeps.dispatchChain(record, now)
      if (outcome === 'launched') {
        launched++
        log(`continued exact full-chain ${record.subject} from its protected restart point`)
      } else if (outcome === 'completed') {
        log(`reconciled already-published exact full-chain ${record.subject} without another provider call`)
      } else if (outcome === 'needs_attention') {
        log(`Needs attention: ${record.subject}'s protected full chain changed; no current-plan substitute was started.`)
      }
    } catch (error: any) {
      log(`could not continue protected full-chain ${record.subject}: ${String(error?.message || error)}`)
    }
  }
  let deferred: DeferredPreSpendRetryRecord[] = []
  try { deferred = await protectedDeps.listDeferred() } catch (error: any) {
    protectedAuthorityVerified = false
    log(`could not verify deferred pre-spend admissions: ${String(error?.message || error)}`)
  }
  for (const record of deferred) protectedResearchRoots.add(record.targetRunRoot)
  for (const record of deferred) {
    if (launched >= MAX_CONCURRENT) break
    try {
      const outcome = await protectedDeps.dispatchDeferred(record, now)
      if (outcome === 'launched') {
        launched++
        log(`restarted exact reviewed Full ${record.subject} after its pre-spend check recovered`)
      } else if (outcome === 'needs_attention') {
        log(`Needs attention: ${record.subject}'s exact reviewed Full changed before its pre-spend retry; nothing was started.`)
      }
    } catch (error: any) {
      log(`could not rearm exact reviewed Full ${record.subject}: ${String(error?.message || error)}`)
    }
  }
  const researchLive = liveSubjectSet('research')
  const screenerLive = liveSubjectSet('screener')
  const candidates: ResumableRun[] = [
    ...legacyResearchCandidatesAfterProtectedRecovery(
      listResumableResearchRuns(researchLive, now), protectedResearchRoots, protectedAuthorityVerified,
    ),
    ...listResumableSignals(screenerLive).map((s) => {
      const runRoot = `screener/runs/${s.sigId}`
      const recorded = readLastProviderSelection(runRoot, 'interrupted')
      return {
        kind: 'signal' as const,
        subject: s.sigId,
        runRoot,
        reason: s.reason,
        resetsAt: s.resetsAt,
        provider: recorded?.provider ?? (hasProvenLegacyClaudeLineage(runRoot) ? 'claude' as RunProvider : undefined),
        model: recorded?.model,
        reasoningLevel: recorded?.reasoningLevel,
      }
    }),
    ...listResumableRuns()
      .filter((item) => item.swarm !== 'research' && item.swarm !== 'screener'
        && item.kind === 'full' && typeof item.reason === 'string')
      .map((item) => ({
        kind: 'full' as const,
        swarm: item.swarm,
        subject: item.subject,
        runRoot: item.runRoot,
        reason: item.reason,
        resetsAt: item.resetsAt,
        provider: item.provider,
        model: item.executionProfile?.parentModel,
        reasoningLevel: item.executionProfile?.parentReasoning,
        expectedProfileKey: item.executionProfile?.key,
      })),
  ]
  const liveBySwarm = new Map<string, Set<string>>([
    ['research', researchLive],
    ['screener', screenerLive],
  ])
  for (const c of candidates) {
    if (launched >= MAX_CONCURRENT) break
    const swarm = resumeSwarm(c)
    const attemptKey = resumeAttemptKey(c)
    let live = liveBySwarm.get(swarm)
    if (!live) {
      live = liveSubjectSet(swarm)
      liveBySwarm.set(swarm, live)
    }
    if (live.has(c.subject)) continue // became live (we just launched its sibling, or a manual run)
    if (!c.provider) {
      if (!gaveUp.has(attemptKey)) {
        gaveUp.add(attemptKey)
        log(`holding ${c.subject} — its prior provider is not supervisor-attributed; resume it manually with an explicit provider`)
      }
      continue
    }
    let t = tries.get(attemptKey)
    if (t && now - t.lastAt < retryDelayMs(t.count)) continue
    if (!isResumeDue(c, now)) continue // a plan-limit pause still waiting for its reset

    const exactResearchContinue = (c.kind === 'full' || c.kind === 'module')
      && (!c.swarm || c.swarm === 'research')
    if (exactResearchContinue) {
      let progress: ResumeProgressDecision
      try {
        progress = evaluateResumeProgress(c)
      } catch (error: any) {
        log(`holding ${c.subject} — its protected progress state could not be verified: ${error?.message || error}`)
        continue
      }
      if (progress.progressAdvanced) {
        tries.delete(attemptKey)
        t = undefined
        gaveUp.delete(attemptKey)
      }
      if (!progress.allow) {
        if (!gaveUp.has(attemptKey)) {
          gaveUp.add(attemptKey)
          log(`Needs attention: ${c.subject} made no protected output progress across ${progress.identicalProgressAttempts} distinct continuation attempts. Exact recovery remains active and will retry after ${new Date(progress.nextEligibleAt).toISOString()}.`)
        }
        continue
      }
      // The durable deadline passed. Keep the warning truthful, but do not let a log-once set become an
      // execution gate: this exact child is the only mechanism that can ever advance the fingerprint.
      gaveUp.delete(attemptKey)
    }
    // Usage reads are provider-local subscription telemetry and never start research. Refresh on every due
    // recovery decision; if the provider exposes no reliable fresh reading (or the probe fails), hold rather
    // than treating an old/empty cache as permission to spend.
    let credit: CreditPreflight
    try {
      credit = await checkProviderUsage(c.provider) ?? { ok: true, checked: false }
    } catch {
      credit = { ok: true, checked: false }
    }
    if (shouldHoldForCredit(credit, now)) {
      log(`${c.provider} usage limited — holding resume of ${c.subject}${typeof credit.resetsAt === 'number' ? ` until ~${new Date(credit.resetsAt * 1000).toISOString()}` : ''}`)
      continue
    }
    try {
      const outcome = await dispatchResumableCandidate(c, now)
      if (outcome !== 'launched') continue
      tries.set(attemptKey, { count: (t?.count || 0) + 1, lastAt: now })
      live.add(c.subject)
      launched++
      log(`resumed ${c.kind} ${c.subject}${c.reason ? ` (was: ${c.reason})` : ''}`)
    } catch (e: any) {
      const code = e?.statusCode
      // 409 = already live (admission exclusivity), 429 = at the concurrency cap — both are transient
      // backpressure, not a failed attempt: leave it for the next tick and do NOT burn a try.
      if (code === 409 || code === 429) continue
      tries.set(attemptKey, { count: (t?.count || 0) + 1, lastAt: now })
      log(`could not resume ${c.subject}: ${e?.message || e}`)
    }
  }
}

export async function startResumeSupervisor(): Promise<void> {
  if (!ENABLED) {
    log('idle — RESUME_SUPERVISOR_ENABLED=0 explicitly disabled autonomous recovery')
    return
  }
  // One supervisor per state dir — a second engine on the same dir must not double-resume.
  if (!acquireSingletonLock(STATE_DIR, LOCK_FILE)) {
    log('another engine already runs the resume supervisor for this state dir — staying passive')
    return
  }
  process.once('exit', () => releaseSingletonLock(STATE_DIR, LOCK_FILE))
  // Reconcile protected/legacy disk truth once before the caller enables any new-work drain. In particular,
  // an already-paid chain must register its exact recovery launch before a queued post-update admission can
  // consume capacity or touch the same subject.
  try { await dispatchResumableRuns() } catch (error: any) {
    log(`initial recovery pass failed closed: ${String(error?.message || error)}`)
  }
  const t = setInterval(() => { void dispatchResumableRuns() }, TICK_MS)
  t.unref?.()
  log(`on — reconciling every ${Math.round(TICK_MS / 1000)}s · max ${MAX_CONCURRENT} at once · ${Math.round(COOLDOWN_MS / 1000)}s–${Math.round(MAX_BACKOFF_MS / 1000)}s retry backoff · no age expiry · waits for the plan reset, never spends overage`)
}

export interface ProtectedSubjectRecoveryDeps {
  listChains: () => Promise<RecoverableChainIntentRecord[]>
  live: (subject: string) => boolean
}

/** Pending/new work must wait behind an already-paid exact chain for the same subject. An unreadable
 * protected journal fails closed: admitting current-plan work would be the unsafe choice. */
export async function protectedResearchRecoveryOwnsSubject(
  subject: string,
  deps: ProtectedSubjectRecoveryDeps = {
    listChains: () => listRecoverableChainIntents(),
    live: (candidate) => liveSubjectSet(RESEARCH_SWARM_ID).has(candidate)
      || subjectChainActive(candidate, RESEARCH_SWARM_ID),
  },
): Promise<boolean> {
  try {
    if ((await deps.listChains()).some((record) => record.subject === subject)) return true
  } catch { return true }
  return deps.live(subject)
}
