// A.3 — the pre-spawn data-readiness gate decision flow. Verifies decideReadiness() without spawning
// a real CLI (deferredSpawn is stubbed): a blocked run can't proceed, a degraded run can, cancel/404/409.
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { IN_FLIGHT_STATUSES, createRun, inFlightRunsForTicker, setActiveTickerRun, type RunState } from '../src/registry'
import { cancel, decideReadiness, finalizeRunOnClose } from '../src/launcher'
import { REPO_ROOT } from '../src/config'
import type { ReadinessReport } from '../src/types'

let pass = 0
function ok(cond: boolean, msg: string) {
  assert.ok(cond, msg)
  console.log('  ok ', msg)
  pass++
}

function report(overall: ReadinessReport['overall'], blocker = false): ReadinessReport {
  const issues = blocker
    ? [{ code: 'zero_usable_data', severity: 'blocker' as const, message: 'no usable data' }]
    : overall === 'degraded'
      ? [{ code: 'entity_disagreement', severity: 'degrade' as const, message: 'may mix entities' }]
      : []
  return { ticker: 'TEST', kind: 'full', overall, fileCount: 1, usableCount: 1, entities: [], issues, ts: Date.now() }
}

function mkAwaiting(rep: ReadinessReport): { run: RunState; spawned: () => boolean } {
  let spawned = false
  const run = createRun({
    kind: 'full', ticker: 'TEST', model: 'haiku', prompt: 'x', user: 'local', userVia: 'local',
    runRoot: 'analyses/TEST_X', willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
  })
  run.status = 'awaiting-readiness-decision'
  run.readiness = rep
  run.deferredSpawn = async () => { spawned = true; run.status = 'running' }
  return { run, spawned: () => spawned }
}

async function main() {
  // 1. proceed on a DEGRADED (no-blocker) run -> spawns the deferred engine
  {
    const { run, spawned } = mkAwaiting(report('degraded'))
    const res = await decideReadiness(run.runId, 'proceed', 'local')
    ok(res.ok && res.status === 'running' && spawned(), 'proceed (no blockers) spawns the deferred engine')
  }
  // 2. proceed PAST A BLOCKER -> rejected 409, engine NOT spawned
  {
    const { run, spawned } = mkAwaiting(report('blocked', true))
    const res = await decideReadiness(run.runId, 'proceed', 'local')
    ok(!res.ok && res.httpStatus === 409 && !spawned(), 'proceed past a blocker is rejected (409); engine NOT spawned')
  }
  // 4. cancel -> finishes as cancelled, engine NOT spawned
  {
    const { run, spawned } = mkAwaiting(report('blocked', true))
    const res = await decideReadiness(run.runId, 'cancel', 'local')
    ok(res.ok && res.status === 'cancelled' && !spawned() && run.status === 'cancelled', 'cancel finishes the run; engine NOT spawned')
  }
  // 5. a decision on a run NOT awaiting the gate -> 409
  {
    const { run } = mkAwaiting(report('degraded'))
    run.status = 'running'
    const res = await decideReadiness(run.runId, 'proceed', 'local')
    ok(!res.ok && res.httpStatus === 409, 'a decision on a run not awaiting the gate is rejected (409)')
  }
  // 6. unknown run -> 404
  {
    const res = await decideReadiness('00000000-0000-0000-0000-000000000000', 'proceed', 'local')
    ok(!res.ok && res.httpStatus === 404, 'a decision on an unknown run is 404')
  }

  // ---- A.4: override (typed-ack) + the indelible trace sidecar ----
  const TEST_ROOT = 'analyses/.test_readiness_gate'
  const traceFile = (sub: string) => path.join(REPO_ROOT, TEST_ROOT, sub, 'readiness_override.json')
  fs.rmSync(path.join(REPO_ROOT, TEST_ROOT), { recursive: true, force: true })

  // 7. override a BLOCKER without the typed ticker -> 412; not spawned; no trace
  {
    const { run, spawned } = mkAwaiting(report('blocked', true))
    run.runRoot = `${TEST_ROOT}/r7`
    const res = await decideReadiness(run.runId, 'override', 'admin', 'WRONG')
    ok(!res.ok && res.httpStatus === 412 && !spawned() && !fs.existsSync(traceFile('r7')), 'override without the typed ticker is 412; no spawn, no trace written')
  }
  // 8. override a BLOCKER WITH the ticker (case-insensitive) -> proceeds + writes the trace
  {
    const { run, spawned } = mkAwaiting(report('blocked', true))
    run.runRoot = `${TEST_ROOT}/r8`
    const res = await decideReadiness(run.runId, 'override', 'admin@x', 'test')
    const t = fs.existsSync(traceFile('r8')) ? JSON.parse(fs.readFileSync(traceFile('r8'), 'utf8')) : null
    ok(res.ok && spawned() && t?.action === 'override-blocker' && t?.decided_by === 'admin@x' && t?.issues.length === 1,
      'override with the typed ticker proceeds + writes the override-blocker trace (issues + decided_by)')
  }
  // 9. proceed on a DEGRADED gate -> also records a trace (a human accepted the gaps)
  {
    const { run, spawned } = mkAwaiting(report('degraded'))
    run.runRoot = `${TEST_ROOT}/r9`
    const res = await decideReadiness(run.runId, 'proceed', 'local')
    const t = fs.existsSync(traceFile('r9')) ? JSON.parse(fs.readFileSync(traceFile('r9'), 'utf8')) : null
    ok(res.ok && spawned() && t?.action === 'proceed-degraded', 'proceed on a degraded gate records a proceed-degraded trace')
  }
  // 10. concurrent decisions on one run -> exactly ONE spawn (no double-spawn race). The stub sets
  //     status AFTER an await, mimicking spawnEngine's buildArgs await — the window the race lived in.
  {
    let spawns = 0
    const { run } = mkAwaiting(report('degraded'))
    run.runRoot = `${TEST_ROOT}/r10`
    run.deferredSpawn = async () => { await Promise.resolve(); spawns++; run.status = 'running' }
    const results = await Promise.all([
      decideReadiness(run.runId, 'proceed', 'local'),
      decideReadiness(run.runId, 'proceed', 'local'),
    ])
    const okCount = results.filter((r) => r.ok).length
    ok(spawns === 1 && okCount === 1, 'concurrent decisions spawn the engine exactly once (no double-spawn race)')
  }
  fs.rmSync(path.join(REPO_ROOT, TEST_ROOT), { recursive: true, force: true })

  // 11. a gate-paused run is IN-FLIGHT for admission (HIGH-severity audit fix) — both pre-spawn gate
  //     states must be in IN_FLIGHT_STATUSES so a paused run still holds its ticker claim + a slot
  {
    ok(IN_FLIGHT_STATUSES.has('readiness-checking') && IN_FLIGHT_STATUSES.has('awaiting-readiness-decision'),
      'both pre-spawn gate states are in IN_FLIGHT_STATUSES')
    const { run } = mkAwaiting(report('blocked', true)) // status = awaiting-readiness-decision
    run.ticker = 'GATEHOLD'
    setActiveTickerRun(run.runId, 'GATEHOLD')
    ok(inFlightRunsForTicker('GATEHOLD').some((r) => r.runId === run.runId),
      'a run paused at the gate is counted in-flight (blocks a concurrent same-ticker run; not self-healed away)')
  }
  // 12. cancel() works on a gate-paused run (it has no child to kill)
  {
    const { run } = mkAwaiting(report('blocked', true))
    const cancelled = await cancel(run.runId)
    ok(cancelled === true && run.status === 'cancelled', 'cancel() finishes a gate-paused run that has no child')
  }
  // 13. cancel() on a RUNNING run WITH a live child: marks it cancelled + SIGTERMs the child, then the
  //     PR12 single finalizer (finalizeRunOnClose) finalizes on process close — emits run-error(cancelled),
  //     sets endedAt, and releases the ticker. cancel() no longer finalizes synchronously: the finalizer's
  //     endedAt gate (not the old status whitelist) is what stops the cancel-stuck-on-running leak. The
  //     finalizer takes the status==='cancelled' branch BEFORE the external-kill branch, so a SIGTERM'd
  //     cancelled run is reported as cancelled, not "terminated_*".
  {
    const { run } = mkAwaiting(report('degraded'))
    run.ticker = 'CANCELLIVE'
    run.status = 'running'
    let killed = ''
    run.child = { kill: (sig: string) => { killed = sig } } as any
    run.eventLog.length = 0
    setActiveTickerRun(run.runId, 'CANCELLIVE')
    const cancelled = await cancel(run.runId)
    ok(cancelled === true && killed === 'SIGTERM' && run.status === 'cancelled', 'cancel marks the run cancelled + SIGTERMs the live child')
    // the child then exits -> onClose -> finalizeRunOnClose does the terminal emit + release on close:
    finalizeRunOnClose(run, { isTerminated: true, signal: 'SIGTERM', exitCode: undefined }, '')
    const emitted = run.eventLog.some((e: any) => e.type === 'run-error' && e.status === 'cancelled')
    ok(emitted && run.endedAt !== undefined, 'finalizeRunOnClose emits run-error(cancelled) + sets endedAt for the SIGTERM-cancelled run')
    ok(!inFlightRunsForTicker('CANCELLIVE').some((r) => r.runId === run.runId), 'the cancelled run releases its ticker on close')
  }
  // 14. cancel() on an already-finalized run is a no-op (no double-finalize / double-emit)
  {
    const { run } = mkAwaiting(report('degraded'))
    run.status = 'cancelled'
    run.endedAt = Date.now()
    const again = await cancel(run.runId)
    ok(again === false, 'cancel() on an already-finalized run returns false')
  }
  // 15. AUDIT FIX (cancel-during-gate revive) — a run finalized (endedAt set) while it still reads
  //     'awaiting-readiness-decision' must NOT be revived to 'running' or spawn its engine on a late
  //     proceed. decideReadiness's entry guard only checks STATUS, so proceedSpawn's endedAt guard is the
  //     line of defense (Reviewer A: "a user can POST proceed to the phantom; it passes the status guard").
  //     RED before the fix: proceedSpawn set status='running' + spawned the deferred engine.
  {
    const TEST_ROOT15 = 'analyses/.test_readiness_gate'
    const { run, spawned } = mkAwaiting(report('degraded'))
    run.runRoot = `${TEST_ROOT15}/r15`
    run.endedAt = Date.now() // cancel() finalized it during the gate's async window; status still reads awaiting
    const res = await decideReadiness(run.runId, 'proceed', 'local')
    ok(!res.ok && !spawned() && res.status === 'cancelled',
      'a finalized run is not revived/spawned by a late proceed (no phantom in-flight run)')
    fs.rmSync(path.join(REPO_ROOT, TEST_ROOT15), { recursive: true, force: true })
  }
  // 16. AUDIT FIX (single terminal event) — cancel() on a run still in the pre-spawn gate check
  //     (status 'readiness-checking', no child) finalizes with EXACTLY ONE run-error(cancelled) emit and
  //     releases the run. The gate added an async window; cancel must finalize it once, never fall through
  //     to a state spawnEngine would later double-emit from.
  {
    const { run } = mkAwaiting(report('degraded'))
    run.status = 'readiness-checking'
    run.eventLog.length = 0
    const cancelled = await cancel(run.runId)
    const cancelEmits = run.eventLog.filter((e: any) => e.type === 'run-error' && e.status === 'cancelled').length
    ok(cancelled === true && run.status === 'cancelled' && run.endedAt !== undefined && cancelEmits === 1,
      'cancel() in the readiness-checking window finalizes once (exactly one terminal cancelled event)')
  }
  // 17. AUDIT FIX (recheck double-spawn) — the recheck branch claims the run SYNCHRONOUSLY
  //     (status -> readiness-checking) before its async re-check, so a concurrent decision (a double-
  //     clicked re-check, or recheck racing proceed) hits the entry guard and is rejected instead of both
  //     passing it and each spawning an engine CLI for one run. RED before the fix: recheck left status
  //     'awaiting-readiness-decision' across the await, so the concurrent proceed reached proceedSpawn.
  {
    const TEST_ROOT17 = 'analyses/.test_readiness_gate'
    const { run, spawned } = mkAwaiting(report('degraded'))
    run.runRoot = `${TEST_ROOT17}/r17`
    const p = decideReadiness(run.runId, 'recheck', 'local') // claims status synchronously, then awaits the real check
    ok(run.status === 'readiness-checking', 'recheck claims the run synchronously (readiness-checking) before its async re-check')
    const concurrent = await decideReadiness(run.runId, 'proceed', 'local') // sees readiness-checking -> entry guard
    ok(!concurrent.ok && concurrent.httpStatus === 409 && !spawned(), 'a concurrent decision during the recheck window is rejected — no second spawn')
    await p.catch(() => {}) // drain the recheck (runReadiness on the no-data TEST ticker -> blocker -> re-opens)
    fs.rmSync(path.join(REPO_ROOT, TEST_ROOT17), { recursive: true, force: true })
  }

  console.log(`\n  ${pass} checks passed`)
}
main().catch((e) => { console.error(e); process.exit(1) })
