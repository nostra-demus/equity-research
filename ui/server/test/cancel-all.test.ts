// The kill switch: cancelAll() stops every in-flight run (including child-less pre-spawn and
// gate-parked runs) and haltAllChains() prevents a chained full run's NEXT step from launching
// after a stop — even when the current step finishes cleanly afterwards.
// Run: npx tsx test/cancel-all.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { cancelAll, captureChainEpoch, haltAllChains, haltChain } from '../src/launcher'
import { createRun, inFlightRunsForSubject, setActiveSubjectRun, type RunState } from '../src/registry'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

// Run roots live in a TEMP dir, never under the repo's analyses/. cancelAll() finalizes a gate-parked run
// by writing a real `.aborted` marker (launcher.ts -> writeRunMarker), and writeRunMarker only writes when
// the resolved root is inside ANALYSES_DIR — so a repo-relative root here meant every server-test run
// rewrote the TRACKED file analyses/ZZKILLB_2099-01-01/.aborted with a fresh timestamp. That stray data
// mutation then rode along in whatever CODE branch the author happened to be on, breaking the §28 two-lane
// split: it leaked into #298 (reverted by 86b8146) and again into #371. The manual workaround in
// ui/.claude/skills/verify/SKILL.md ("git checkout -- it before committing") is exactly the kind of step a
// human or agent forgets. A temp root makes the marker write a harmless no-op and the leak unrepresentable.
// Nothing here asserts on the marker — the test is about cancelAll's semantics.
const TEST_RUN_ROOT = path.join(os.tmpdir(), 'nostra-cancel-all-test')

function mkRun(kind: any, ticker: string, status: any): RunState {
  const run = createRun({
    kind, ticker, model: 'sonnet', prompt: '', user: 'test', userVia: 'local',
    runRoot: path.join(TEST_RUN_ROOT, `${ticker}_2099-01-01`), willCommitToMain: false,
    writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  run.status = status
  setActiveSubjectRun(run.runId, ticker)
  return run
}

await check('chain epoch: a step finishing AFTER stop-everything must not advance the chain', () => {
  const alive = captureChainEpoch()
  assert.equal(alive(), true) // chain may advance while no stop happened
  haltAllChains()
  assert.equal(alive(), false) // the probe a running step captured at launch now says halt
  const fresh = captureChainEpoch()
  assert.equal(fresh(), true) // a NEW chain started after the stop advances normally
})

await check('chain cancellation is scoped: stopping one subject leaves another chain live', () => {
  const first = captureChainEpoch('chain-first')
  const second = captureChainEpoch('chain-second')
  haltChain('chain-first')
  assert.equal(first(), false)
  assert.equal(second(), true)
})

await check('cancelAll stops running and gate-parked runs, releases their subjects, skips finished ones', async () => {
  const running = mkRun('module', 'ZZKILLA', 'running') // child-less pre-spawn window
  const parked = mkRun('full', 'ZZKILLB', 'awaiting-readiness-decision') // paused at the gate
  const done = mkRun('module', 'ZZKILLC', 'running')
  done.status = 'done'
  done.endedAt = Date.now() // already finalized — must not be touched

  const cancelled = await cancelAll()
  assert.ok(cancelled.includes(running.runId))
  assert.ok(cancelled.includes(parked.runId))
  assert.ok(!cancelled.includes(done.runId))
  assert.equal(running.status, 'cancelled')
  assert.equal(parked.status, 'cancelled')
  assert.ok(parked.endedAt !== undefined) // gate-parked runs are finalized directly (no process to close)
  assert.equal(inFlightRunsForSubject('ZZKILLB').length, 0) // subject released — admission unblocked

  // idempotent: nothing left to stop
  const again = await cancelAll()
  assert.ok(!again.includes(running.runId) && !again.includes(parked.runId))
})

console.log(`\n${passed} checks passed`)
