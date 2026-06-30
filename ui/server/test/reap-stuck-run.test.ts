// Never-stuck guarantee: a run whose engine PROCESS has died but whose close handler never fired must not
// pin its subject's run-lock forever. reapDeadSubjectRuns() probes each in-flight run's child pid and
// finalizes the corpses, releasing the subject so the next launch is admitted. Run: npx tsx test/reap-stuck-run.test.ts
// Pure in-memory: fake `child` objects (a pid only), no real claude spawn, no disk writes (kind 'module'
// isn't a resumable full/rerun, so finalizeRunOnClose writes no .interrupted marker).
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import path from 'node:path'
import { reapDeadSubjectRuns } from '../src/launcher'
import { admitRun } from '../src/admission'
import { REPO_ROOT } from '../src/config'
import { createRun, finishRun, inFlightRunsForSubject, setActiveTickerRun, type RunState } from '../src/registry'
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
  const run = createRun({
    kind, ticker: T, model: 'sonnet', prompt: '', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [bmTarget], coveredModules: ['business-model'], readDepsAbs: [],
  })
  run.status = status
  run.child = child as any
  setActiveTickerRun(run.runId, T)
  tracked.push(run)
  return run
}
function clearAll() { for (const r of tracked.splice(0)) if (r.endedAt === undefined) finishRun(r, 'done') }

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
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

  console.log(`\n${passed}/3 reap-stuck-run checks passed`)
} finally {
  clearAll()
}
