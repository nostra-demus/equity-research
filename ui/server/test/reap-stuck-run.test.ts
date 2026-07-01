// Never-stuck guarantee: a run whose engine PROCESS has died but whose close handler never fired must not
// pin its subject's run-lock forever. reapDeadSubjectRuns() probes each in-flight run's child pid and
// finalizes the corpses, releasing the subject so the next launch is admitted. Run: npx tsx test/reap-stuck-run.test.ts
// Pure in-memory: fake `child` objects (a pid only), no real claude spawn, no disk writes (kind 'module'
// isn't a resumable full/rerun, so finalizeRunOnClose writes no .interrupted marker).
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import path from 'node:path'
import { awaitRunsExited, reapAllDeadRuns, reapDeadSubjectRuns } from '../src/launcher'
import { admitRun } from '../src/admission'
import { MAX_CONCURRENT_RUNS, REPO_ROOT } from '../src/config'
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

  console.log(`\n${passed}/6 reap-stuck-run checks passed`)
} finally {
  clearAll()
}
