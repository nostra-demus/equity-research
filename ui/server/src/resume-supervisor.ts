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
// staged --until partial (.target). OFF by default — set RESUME_SUPERVISOR_ENABLED=1 to turn it on (the
// cloud box does; a dev laptop stays dark so it never relaunches behind your back). Bounded by a
// max-concurrent cap, a per-subject cooldown, and a per-subject try cap so a genuinely-broken run can't
// loop forever. Single-instance locked so two engines on one state dir never double-resume.

import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, STATE_DIR } from './config'
import { getCreditStatus } from './credit'
import { finalDeliverablesPresent, launch } from './launcher'
import { hasRunMarker, readRunMarker } from './outputs'
import { listRuns } from './registry'
import { listResumableSignals } from './screener'
import { acquireSingletonLock, releaseSingletonLock } from './singleton-lock'
import { SubjectBusyError, subjectMutationLockKey, withSubjectLock } from './subject-lock'
import type { CreditPreflight } from './types'
import type { RunProvider } from './providers/types'
import { hasProvenLegacyClaudeLineage, readLastProviderSelection } from './execution-provenance'
import { autoResumeDue } from './resume-policy'
import { listResumableRuns } from './resumable'
import { continueExactSavedRun } from './continuation'

const LOCK_FILE = 'resume-supervisor.lock'
const ENABLED = process.env.RESUME_SUPERVISOR_ENABLED === '1'
const TICK_MS = Math.max(60, Number(process.env.RESUME_TICK_SEC) || 300) * 1000
const MAX_CONCURRENT = Math.max(1, Number(process.env.RESUME_MAX_CONCURRENT) || 2)
const MAX_TRIES = Math.max(1, Number(process.env.RESUME_MAX_TRIES) || 6)
const COOLDOWN_MS = Math.max(30, Number(process.env.RESUME_COOLDOWN_SEC) || 120) * 1000
const RESET_BUFFER_MS = Math.max(0, Number(process.env.RESUME_RESET_BUFFER_SEC) || 60) * 1000
// Only chase RECENT breaks — a plan reset (~5h) / a dropped connection / a reboot all land well inside
// this window; a multi-day-old partial is stale and left for the human (and can't loop the supervisor).
const MAX_AGE_MS = Math.max(1, Number(process.env.RESUME_MAX_AGE_HOURS) || 36) * 3600 * 1000

const tries = new Map<string, { count: number; lastAt: number }>() // per-subject, in-memory (reset on restart — disk re-derives the work)
const gaveUp = new Set<string>() // log the give-up once per subject

const log = (m: string) => console.log(`[resume] ${m}`) // eslint-disable-line no-console

export interface ResumableRun {
  kind: 'full' | 'signal'
  swarm?: string
  subject: string
  reason?: string
  resetsAt?: number
  runRoot?: string
  provider?: RunProvider
  model?: string
  reasoningLevel?: string
}

const DATE_SUFFIX = /_(\d{4}-\d{2}-\d{2})$/

// Research run folders that broke and should be continued. Disk-truth, like the screener scan: a folder
// is resumable iff it carries the .interrupted marker (a plan-limit / connection / kill break — NOT a
// clean budget truncation, which is the honest `incomplete` outcome and is never marked), is NOT
// deliberately aborted (.aborted), has NOT finished (no final thesis + decision record), is not currently
// live, and broke recently. The marker carries the break reason + the plan resetsAt.
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
    if (finalDeliverablesPresent(runRoot)) continue // already finished
    try { if (now - fs.statSync(abs).mtimeMs > MAX_AGE_MS) continue } catch { /* unreadable mtime — treat as eligible */ }
    const recorded = readLastProviderSelection(runRoot, 'interrupted')
    const selected = recorded ?? (hasProvenLegacyClaudeLineage(runRoot)
      ? { provider: 'claude' as RunProvider } : null)
    // `.interrupted` is provider-child-writable. It can describe why the process stopped, but it never
    // establishes execution identity. If it carries identity fields, require exact agreement with the
    // supervisor/committed selection; a conflict is held for manual review rather than silently switching.
    const markerConflicts = Boolean(selected && (
      ((marker.provider === 'codex' || marker.provider === 'claude') && marker.provider !== selected.provider)
      || (typeof marker.model === 'string' && recorded?.model !== marker.model)
      || (typeof marker.reasoningLevel === 'string' && recorded?.reasoningLevel !== marker.reasoningLevel)
    ))
    const provider: RunProvider | undefined = markerConflicts ? undefined : selected?.provider
    out.push({
      kind: 'full', subject: ticker, reason: marker.reason,
      resetsAt: typeof marker.resetsAt === 'number' ? marker.resetsAt : undefined,
      runRoot, provider,
      model: markerConflicts ? undefined : recorded?.model,
      reasoningLevel: markerConflicts ? undefined : recorded?.reasoningLevel,
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
  launchCandidate: (candidate: ResumableRun) => Promise<unknown>
}

const resumeSwarm = (candidate: ResumableRun): string =>
  candidate.swarm ?? (candidate.kind === 'full' ? 'research' : 'screener')

const defaultCandidateDispatchDeps: ResumeCandidateDispatchDeps = {
  withLock: withSubjectLock,
  liveSubjects: liveSubjectSet,
  stillResumable: (candidate, live, now) => {
    if (live.has(candidate.subject) || !isResumeDue(candidate, now)) return false
    if (candidate.kind === 'full' && (!candidate.swarm || candidate.swarm === 'research')) {
      return listResumableResearchRuns(live, now).some((current) =>
        current.subject === candidate.subject && current.runRoot === candidate.runRoot)
    }
    if (candidate.kind === 'signal') {
      return listResumableSignals(live).some((current) => current.sigId === candidate.subject)
    }
    return listResumableRuns().some((current) => current.kind === 'full'
      && current.swarm === candidate.swarm && current.subject === candidate.subject
      && current.runRoot === candidate.runRoot && typeof current.reason === 'string')
  },
  launchCandidate: (candidate) => {
    if (!candidate.provider) throw new Error('automatic resume has no supervisor-recorded provider')
    if (candidate.kind === 'full' && (!candidate.swarm || candidate.swarm === 'research')) {
      if (!candidate.runRoot) throw new Error('automatic resume has no exact saved run root')
      return continueExactSavedRun({
        swarm: 'research',
        subject: candidate.subject,
        runRoot: candidate.runRoot,
        kind: 'full',
        provider: candidate.provider,
        model: candidate.model,
        reasoningLevel: candidate.reasoningLevel,
        user: 'auto',
        userVia: 'local',
      })
    }
    return launch({
      kind: candidate.kind,
      ticker: candidate.subject,
      ...(candidate.swarm ? { swarm: candidate.swarm } : {}),
      provider: candidate.provider,
      model: candidate.model,
      reasoningLevel: candidate.reasoningLevel,
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
  try {
    return await deps.withLock(subjectMutationLockKey(swarm, candidate.subject), async () => {
      const live = deps.liveSubjects(swarm)
      if (live.has(candidate.subject) || !deps.stillResumable(candidate, live, now)) return 'stale'
      await deps.launchCandidate(candidate)
      return 'launched'
    })
  } catch (error) {
    if (error instanceof SubjectBusyError) return 'busy'
    throw error
  }
}

// One reconciler pass. Crash-safe: re-running picks up anything still interrupted on disk.
export async function dispatchResumableRuns(now: number = Date.now()): Promise<void> {
  if (!ENABLED) return
  const researchLive = liveSubjectSet('research')
  const screenerLive = liveSubjectSet('screener')
  const candidates: ResumableRun[] = [
    ...listResumableResearchRuns(researchLive, now),
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
      })),
  ]
  const liveBySwarm = new Map<string, Set<string>>([
    ['research', researchLive],
    ['screener', screenerLive],
  ])
  let launched = 0
  for (const c of candidates) {
    if (launched >= MAX_CONCURRENT) break
    const swarm = resumeSwarm(c)
    let live = liveBySwarm.get(swarm)
    if (!live) {
      live = liveSubjectSet(swarm)
      liveBySwarm.set(swarm, live)
    }
    if (live.has(c.subject)) continue // became live (we just launched its sibling, or a manual run)
    if (!c.provider) {
      if (!gaveUp.has(c.subject)) {
        gaveUp.add(c.subject)
        log(`holding ${c.subject} — its prior provider is not supervisor-attributed; resume it manually with an explicit provider`)
      }
      continue
    }
    const t = tries.get(c.subject)
    if (t && t.count >= MAX_TRIES) {
      if (!gaveUp.has(c.subject)) { gaveUp.add(c.subject); log(`giving up on ${c.subject} after ${MAX_TRIES} resume attempts — needs a look`) }
      continue
    }
    if (t && now - t.lastAt < COOLDOWN_MS) continue // cooling down
    if (!isResumeDue(c, now)) continue // a plan-limit pause still waiting for its reset
    const credit = getCreditStatus(c.provider)
    if (shouldHoldForCredit(credit, now)) {
      log(`${c.provider} usage limited — holding resume of ${c.subject}${typeof credit.resetsAt === 'number' ? ` until ~${new Date(credit.resetsAt * 1000).toISOString()}` : ''}`)
      continue
    }
    try {
      const outcome = await dispatchResumableCandidate(c, now)
      if (outcome !== 'launched') continue
      tries.set(c.subject, { count: (t?.count || 0) + 1, lastAt: now })
      live.add(c.subject)
      launched++
      log(`resumed ${c.kind} ${c.subject}${c.reason ? ` (was: ${c.reason})` : ''}`)
    } catch (e: any) {
      const code = e?.statusCode
      // 409 = already live (admission exclusivity), 429 = at the concurrency cap — both are transient
      // backpressure, not a failed attempt: leave it for the next tick and do NOT burn a try.
      if (code === 409 || code === 429) continue
      tries.set(c.subject, { count: (t?.count || 0) + 1, lastAt: now })
      log(`could not resume ${c.subject}: ${e?.message || e}`)
    }
  }
}

export function startResumeSupervisor(): void {
  if (!ENABLED) {
    log('idle — set RESUME_SUPERVISOR_ENABLED=1 to auto-continue interrupted runs when the plan limit resets or a connection drops (the cockpit still resumes screener runs while a browser is open)')
    return
  }
  // One supervisor per state dir — a second engine on the same dir must not double-resume.
  if (!acquireSingletonLock(STATE_DIR, LOCK_FILE)) {
    log('another engine already runs the resume supervisor for this state dir — staying passive')
    return
  }
  process.once('exit', () => releaseSingletonLock(STATE_DIR, LOCK_FILE))
  setTimeout(() => { void dispatchResumableRuns() }, 12000) // a beat after boot, so an interrupted run from before the restart continues
  const t = setInterval(() => { void dispatchResumableRuns() }, TICK_MS)
  t.unref?.()
  log(`on — reconciling every ${Math.round(TICK_MS / 1000)}s · max ${MAX_CONCURRENT} at once, ${MAX_TRIES} tries/run, ${Math.round(COOLDOWN_MS / 1000)}s cooldown · waits for the plan reset, never spends overage`)
}
