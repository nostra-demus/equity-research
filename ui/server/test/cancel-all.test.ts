// The kill switch: cancelAll() stops every in-flight run (including child-less pre-spawn and
// gate-parked runs) and haltAllChains() prevents a chained full run's NEXT step from launching
// after a stop — even when the current step finishes cleanly afterwards.
// Run: npx tsx test/cancel-all.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { cancelAll, captureChainEpoch, haltAllChains } from '../src/launcher'
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

function mkRun(kind: any, ticker: string, status: any): RunState {
  const run = createRun({
    kind, ticker, model: 'sonnet', prompt: '', user: 'test', userVia: 'local',
    runRoot: `analyses/${ticker}_2099-01-01`, willCommitToMain: false,
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
