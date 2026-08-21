// Never-stuck guarantee: a run whose engine PROCESS has died but whose close handler never fired must not
// pin its subject's run-lock forever. reapDeadSubjectRuns() probes each in-flight run's child pid and
// finalizes the corpses, releasing the subject so the next launch is admitted. Run: npx tsx test/reap-stuck-run.test.ts
// Pure in-memory: fake `child` objects (a pid only), no real claude spawn, no disk writes (kind 'module'
// isn't a resumable full/rerun, so finalizeRunOnClose writes no .interrupted marker).
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  awaitRunsExited,
  bindTerminalGuard,
  cancel,
  childCouldReportDoneOnClose,
  clearTerminalGuardWork,
  descendantCloseTerminalProof,
  finalizeConfirmedSubjectCancellation,
  inspectTerminalCloseWatchdog,
  processTreeAlive,
  proveCloseProcessGroupExtinct,
  reapAllDeadRuns,
  reapDeadSubjectRuns,
  requireSubjectRunsExited,
  runHasUnfinishedTerminalWork,
  streamResultAwaitsProcessClose,
  subjectRunsAwaitingExit,
  trackTerminalGuardWork,
} from '../src/launcher'
import { admitRun } from '../src/admission'
import { MAX_CONCURRENT_RUNS, REPO_ROOT } from '../src/config'
import { createRun, finishRun, inFlightRunsForSubject, setActiveTickerRun, type RunState } from '../src/registry'
import { handleStreamLine } from '../src/stream-parser'
import type { RunKind, RunStatus } from '../src/types'

const T = 'ZZREAP'
const DATE = '2099-01-01'
const root = `analyses/${T}_${DATE}`
// business-model has NO upstream deps, so admission's D4 (deps-on-disk) never gates it — this isolates the
// run-LOCK behavior (D2/D2b) the reaper is about, with no fixture tree needed.
const bmTarget = path.join(REPO_ROOT, root, 'business-model/99_business-model-synthesis.md')

// A genuinely-dead pid: enormous and never assigned, so process.kill(pid, 0) raises ESRCH ("no such
// process"). No reuse race (unlike recycling a just-exited pid).
const DEAD_PID = 2_000_000_000

const tracked: RunState[] = []
function seed(kind: RunKind, status: RunStatus, child: { pid?: number } | null): RunState {
  return seedOn(T, kind, status, child)
}
// Seed on an arbitrary subject (its own run root + write target) so global-cap tests can fill the cap
// with dead children on OTHER tickers.
function seedOn(ticker: string, kind: RunKind, status: RunStatus, child: { pid?: number } | null): RunState {
  const subjRoot = `analyses/${ticker}_${DATE}`
  const run = createRun({
    kind, ticker, model: 'sonnet', prompt: '', runRoot: subjRoot, willCommitToMain: true,
    writeTargetsAbs: [path.join(REPO_ROOT, subjRoot, 'business-model/99_business-model-synthesis.md')],
    coveredModules: ['business-model'], readDepsAbs: [],
  })
  run.status = status
  run.child = child as any
  setActiveTickerRun(run.runId, ticker)
  tracked.push(run)
  return run
}
function clearAll() { for (const r of tracked.splice(0)) if (r.endedAt === undefined) finishRun(r, 'done') }

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 }
}
async function acheck(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 }
}

// A module run that conflicts with the seeded in-flight business-model run (same write target → D2/D2b).
const conflictReq = () => ({
  ticker: T, kind: 'module' as RunKind, coveredModules: ['business-model'],
  writeTargetsAbs: [bmTarget], readDepsAbs: [],
})

try {
  // 1) A dead-child run blocks admission, then the reaper clears it and admission passes — the exact
  //    "ran with 5 files, the run died, now I can never relaunch" trap, auto-healed.
  check('dead-child run is reaped → subject released → conflicting launch admitted', () => {
    const stuck = seed('module', 'running', { pid: DEAD_PID })
    assert.equal(admitRun(conflictReq()).ok, false, 'stuck run should block before reaping')
    const reaped = reapDeadSubjectRuns(T)
    assert.deepEqual(reaped, [stuck.runId], 'the dead run should be the one reaped')
    assert.ok(stuck.endedAt !== undefined, 'reaped run must be finalized (endedAt set)')
    assert.equal(inFlightRunsForSubject(T).length, 0, 'no run should remain in flight for the subject')
    assert.equal(admitRun(conflictReq()).ok, true, 'launch should now be admitted')
  })
  clearAll()

  // 2) A run with a LIVE child (our own pid) is left running — the reaper must never kill a healthy run.
  check('live-child run is NOT reaped', () => {
    const alive = seed('module', 'running', { pid: process.pid })
    assert.deepEqual(reapDeadSubjectRuns(T), [], 'a live run must not be reaped')
    assert.equal(alive.endedAt, undefined, 'a live run must stay in flight')
    assert.equal(inFlightRunsForSubject(T).length, 1)
  })
  clearAll()

  // 3) A run parked at the readiness gate (no child) is legitimately WAITING for the user, not dead — the
  //    reaper leaves it (a deliberate force stops those instead).
  check('gate-parked run (no child) is NOT reaped', () => {
    const parked = seed('module', 'awaiting-readiness-decision', null)
    assert.deepEqual(reapDeadSubjectRuns(T), [], 'a gate-parked run must not be reaped')
    assert.equal(parked.endedAt, undefined)
    assert.equal(inFlightRunsForSubject(T).length, 1)
  })
  clearAll()

  // 4) The GLOBAL cap (D5) counts in-flight runs across ALL subjects. If the cap is filled by dead
  //    children on OTHER tickers, a DIFFERENT-subject launch must still be admitted — the reaper has to
  //    sweep the whole registry, not just the launch's own subject. reapDeadSubjectRuns(fresh) reaps
  //    NOTHING (no dead run on `fresh`) and the launch still fails `capacity`; reapAllDeadRuns() clears the
  //    corpses and it passes. This is the "other tickers' dead runs block me" trap the global sweep fixes.
  check('dead children on OTHER subjects are reaped so a different-subject launch clears the D5 cap', () => {
    const others: RunState[] = []
    for (let i = 0; i < MAX_CONCURRENT_RUNS; i++) {
      others.push(seedOn(`ZZOTHER${i}`, 'module', 'running', { pid: DEAD_PID }))
    }
    const FRESH = 'ZZFRESH'
    const freshReq = () => ({
      ticker: FRESH, kind: 'module' as RunKind, coveredModules: ['business-model'],
      writeTargetsAbs: [path.join(REPO_ROOT, `analyses/${FRESH}_${DATE}`, 'business-model/99_business-model-synthesis.md')],
      readDepsAbs: [],
    })
    // The cap is full with dead corpses on other subjects → the fresh launch is blocked on capacity.
    assert.equal(admitRun(freshReq()).code, 'capacity', 'the global cap should be full of dead corpses')
    // The per-SUBJECT reaper only looks at FRESH (which has no run) — it reaps nothing and the cap stays full.
    assert.deepEqual(reapDeadSubjectRuns(FRESH), [], 'per-subject reap must not touch other subjects')
    assert.equal(admitRun(freshReq()).code, 'capacity', 'per-subject reap leaves the cross-subject corpses → still capped')
    // The GLOBAL reaper sweeps every subject, finalizes all the corpses, and the fresh launch is admitted.
    const reaped = reapAllDeadRuns()
    assert.equal(reaped.length, MAX_CONCURRENT_RUNS, 'the global reaper should finalize every dead cross-subject run')
    for (const o of others) assert.ok(o.endedAt !== undefined, 'each cross-subject corpse must be finalized')
    assert.equal(admitRun(freshReq()).ok, true, 'launch should now be admitted after the global reap')
  })
  clearAll()

  // 5-6) The FORCE double-write guard (from the sibling "wait for the killed engine to exit" fix): cancel()
  //   SIGTERMs and returns BEFORE the killed engine exits, yet the run has already left the in-flight set.
  //   awaitRunsExited (called by launch()'s force path after cancel) must block until the child processes are
  //   actually gone — otherwise admitRun would start a SECOND engine writing the SAME run dir concurrently.
  await acheck('awaitRunsExited: an already-exited child (dead pid) → true immediately (force may then admit)', async () => {
    assert.equal(await awaitRunsExited([seed('module', 'cancelled', { pid: DEAD_PID })], 1000), true)
  })
  clearAll()
  await acheck('awaitRunsExited: a STILL-ALIVE child → false at the timeout (force must NOT admit — the concurrent-double-write guard)', async () => {
    assert.equal(await awaitRunsExited([seed('module', 'cancelled', { pid: process.pid })], 120), false)
  })
  clearAll()

  await acheck('subject cancel: an unconfirmed child exit is a conflict, never permission to relaunch', async () => {
    const stillWriting = seed('module', 'cancelled', { pid: process.pid })
    await assert.rejects(
      requireSubjectRunsExited(T, [stillWriting], async () => false),
      (error: any) => error?.statusCode === 409 && /could not confirm/i.test(error?.message),
    )
  })
  clearAll()

  check('subject cancel: confirmed exit finalizes a run even when its close callback was lost', () => {
    const lostClose = seed('module', 'cancelled', { pid: DEAD_PID })
    assert.equal(lostClose.endedAt, undefined, 'the fixture starts in the stranded cancelled state')
    finalizeConfirmedSubjectCancellation([lostClose])
    assert.ok(lostClose.endedAt !== undefined, 'confirmed process exit must release the endedAt-based route lock')
    finalizeConfirmedSubjectCancellation([lostClose])
    assert.equal(lostClose.status, 'cancelled', 'a late/racing close remains idempotent')
  })
  clearAll()

  check('subject cancel retry: a cancelled but unfinalized writer remains in the stop set', () => {
    const stillAlive = seed('module', 'cancelled', { pid: process.pid })
    assert.deepEqual(subjectRunsAwaitingExit(T).map((run) => run.runId), [stillAlive.runId],
      'a second force/cancel attempt must not forget the first attempt merely because its status is cancelled')
  })
  clearAll()

  check('process-tree proof: a dead leader does not hide a live detached descendant group', () => {
    const pid = 4242
    const probed: number[] = []
    const alive = processTreeAlive(pid, (target) => {
      probed.push(target)
      return target === -pid // process group alive; leader pid itself is dead
    })
    assert.equal(alive, true)
    assert.deepEqual(probed, [-pid, pid], 'both the detached process group and its leader are probed')
  })

  await acheck('real-close proof TERM/KILLs a surviving descendant group before allowing finalization', async () => {
    const pid = 43210
    let groupAlive = true
    let clock = 0
    const signals: NodeJS.Signals[] = []
    const proof = await proveCloseProcessGroupExtinct(pid, {
      probe: (target) => target === -pid && groupAlive, // leader dead; descendant keeps its PGID alive
      signalGroup: (_pid, signal) => {
        signals.push(signal)
        if (signal === 'SIGKILL') groupAlive = false
      },
      now: () => clock,
      sleep: async (ms) => { clock += ms },
      termGraceMs: 10,
      killGraceMs: 10,
      pollMs: 5,
    })
    assert.deepEqual(proof, { extinct: true, descendantObserved: true, forced: true })
    assert.deepEqual(signals, ['SIGTERM', 'SIGKILL'])
  })

  check('stream error, Stop, signal, nonzero, and failed closes are all non-clean recovery cases', () => {
    const stopped = seed('module', 'running', { pid: DEAD_PID })
    stopped.cancelRequested = true
    assert.equal(childCouldReportDoneOnClose(stopped, { exitCode: 0 }), false, 'Stop is non-clean')

    const streamed = seed('module', 'running', { pid: DEAD_PID })
    handleStreamLine(streamed, JSON.stringify({
      type: 'result', subtype: 'error_max_turns', is_error: true, result: '99 landed before the cap',
    }))
    assert.equal(childCouldReportDoneOnClose(streamed, { exitCode: 1 }), false, 'stream error is non-clean')

    const signalled = seed('module', 'running', { pid: DEAD_PID })
    assert.equal(childCouldReportDoneOnClose(signalled, { signal: 'SIGTERM', isTerminated: true }), false,
      'signal termination is non-clean')

    const nonzero = seed('module', 'running', { pid: DEAD_PID })
    assert.equal(childCouldReportDoneOnClose(nonzero, { exitCode: 2 }), false, 'nonzero exit is non-clean')

    const failed = seed('module', 'running', { pid: DEAD_PID })
    assert.equal(childCouldReportDoneOnClose(failed, { exitCode: 0, failed: true }), false,
      'an execa failed result is non-clean')
  })
  clearAll()

  check('descendant recovery preserves terminal publication failure/receipt authority', () => {
    const publishFailed = {
      ok: false as const,
      reason: 'module_publish_failed',
      message: 'pending marker retained',
    }
    assert.deepEqual(descendantCloseTerminalProof(true, true, publishFailed), publishFailed,
      'a publication failure is not hidden by the descendant diagnosis')
    const published = descendantCloseTerminalProof(true, true, { ok: true })
    assert.equal(published.ok, false, 'published/validated bytes still report the orphan writer incomplete')
    if (!published.ok) assert.equal(published.reason, 'descendant_process_survived_close')
  })

  check('close source proves group extinction before sweep, terminal guard, and finalizer', () => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const source = fs.readFileSync(path.join(here, '..', 'src', 'launcher.ts'), 'utf8')
    const start = source.indexOf('const onClose = async (res: any) => {')
    const end = source.indexOf('\n  // Pass both fulfillment/rejection', start)
    const body = source.slice(start, end)
    const proof = body.indexOf('await proveCloseProcessGroupExtinct(run.child?.pid)')
    const sweep = body.indexOf('sweepRunOutputs(run)', proof)
    const guard = body.indexOf('beginTerminalGuardWork(run)', sweep)
    const failedGuardRecovery = body.indexOf('if (!terminalProof.ok)', guard)
    const cleanRecovery = body.indexOf('recoverNonCleanExactClose(run)', failedGuardRecovery)
    const nonCleanRecovery = body.indexOf('recoverNonCleanExactClose(run)', cleanRecovery + 1)
    const finalize = body.indexOf('finalizeRunOnClose(run, res, stderr, terminalProof)', nonCleanRecovery)
    assert.ok(start > 0 && end > start && proof > 0 && sweep > proof && guard > sweep
      && failedGuardRecovery > guard && cleanRecovery > failedGuardRecovery
      && nonCleanRecovery > cleanRecovery && finalize > nonCleanRecovery,
    'no output recovery/sweep/publication/finalization can precede process-group extinction proof')
  })

  check('streamed exact error retains claims until close proof and never runs terminal publication', () => {
    const errored = seed('module', 'running', { pid: DEAD_PID })
    let guardCalls = 0
    bindTerminalGuard(errored, () => { guardCalls++; return { ok: true } })
    handleStreamLine(errored, JSON.stringify({
      type: 'result', subtype: 'error_during_execution', is_error: true, result: 'failed before close',
    }))
    assert.equal(streamResultAwaitsProcessClose(errored), true)
    assert.equal(errored.endedAt, undefined, 'stream error cannot release the writer claim before close')
    assert.equal(inFlightRunsForSubject(T).length, 1)
    assert.equal(guardCalls, 0)

    assert.deepEqual(reapDeadSubjectRuns(T), [], 'first dead observation remains close-owned')
    assert.equal(inspectTerminalCloseWatchdog(errored, Number.MAX_SAFE_INTEGER, 0), 'started')
    assert.equal(errored.status, 'error', 'dead-group close fallback now performs the terminal release')
    assert.ok(errored.endedAt !== undefined)
    assert.equal(guardCalls, 0, 'an errored child never publishes exact output')
  })
  clearAll()

  await acheck('terminal publication is a live writer after child exit: cancel/force wait and keep the subject claimed', async () => {
    const publishing = seed('module', 'running', { pid: DEAD_PID })
    let resolve!: (value: { ok: true }) => void
    const work = new Promise<{ ok: true }>((done) => { resolve = done })
    trackTerminalGuardWork(publishing, work)
    assert.equal(runHasUnfinishedTerminalWork(publishing), true)

    await cancel(publishing.runId)
    assert.equal(publishing.status, 'running', 'cancel records intent but must not drop the in-flight claim mid-publish')
    assert.equal(publishing.cancelRequested, true)
    assert.equal(inFlightRunsForSubject(T).length, 1, 'the subject remains claimed while Git publication writes')
    assert.equal(await awaitRunsExited([publishing], 120), false,
      'force cannot treat a dead child as fully stopped while terminal publication is pending')
    assert.deepEqual(reapDeadSubjectRuns(T), [], 'the dead-child reaper must not finalize an active publisher')
    assert.equal(publishing.endedAt, undefined)

    resolve({ ok: true })
    await work
    clearTerminalGuardWork(publishing, work)
    finalizeConfirmedSubjectCancellation([publishing])
    assert.equal(publishing.status, 'cancelled', 'the recorded cancellation finalizes only after publication settles')
    assert.ok(publishing.endedAt !== undefined)
  })
  clearAll()

  await acheck('terminal publication blocks the global reaper until its writer token is cleared', async () => {
    const publishing = seed('module', 'running', { pid: DEAD_PID })
    let resolve!: (value: { ok: true }) => void
    const work = new Promise<{ ok: true }>((done) => { resolve = done })
    trackTerminalGuardWork(publishing, work)
    assert.deepEqual(reapAllDeadRuns(), [], 'global capacity healing also leaves terminal publishers alone')
    assert.equal(publishing.endedAt, undefined)

    resolve({ ok: true })
    await work
    clearTerminalGuardWork(publishing, work)
    assert.deepEqual(reapAllDeadRuns(), [publishing.runId], 'a truly abandoned dead run is reapable after publication ends')
    assert.ok(publishing.endedAt !== undefined)
  })
  clearAll()

  await acheck('dead PID before onClose stays close-owned; watchdog recovers marker-only and never guesses clean', async () => {
    const beforeClose = seed('module', 'running', { pid: DEAD_PID })
    let guardCalls = 0
    bindTerminalGuard(beforeClose, () => { guardCalls++; return { ok: true } })

    assert.deepEqual(reapDeadSubjectRuns(T), [], 'generic reaping cannot release a terminalGuard-bound run')
    assert.equal(beforeClose.endedAt, undefined)
    assert.equal(guardCalls, 0, 'ordinary close receives a grace period before fallback publication starts')

    assert.equal(inspectTerminalCloseWatchdog(beforeClose, Number.MAX_SAFE_INTEGER, 0), 'started')
    assert.equal(guardCalls, 0, 'without an exit result the watchdog never enters the Git-publishing guard')
    assert.equal(beforeClose.status, 'incomplete', 'unknown close outcome is conservative, never guessed done')
    assert.ok(beforeClose.endedAt !== undefined, 'claims release only after marker/quarantine recovery + finalizer')
    assert.equal(runHasUnfinishedTerminalWork(beforeClose), false)
    assert.equal(inspectTerminalCloseWatchdog(beforeClose, Number.MAX_SAFE_INTEGER, 0), 'inactive')
  })
  clearAll()

  console.log(`\n${passed}/18 reap-stuck-run checks passed`)
} finally {
  clearAll()
}
