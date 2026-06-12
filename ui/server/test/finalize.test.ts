// Run-finalization integrity (PR12 review): the process-close handler is the SINGLE success
// finalizer. A clean stream `result` must not mark a run done before the close-time deliverable
// checks (the full/rerun missing-final-thesis guard), and a cancelled run must still be finalized
// on close so its subject is released. Run: npx tsx test/finalize.test.ts
// keep the perpetual cockpit audit log free of fixture runs (read dynamically in activity-log append)
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from '../src/config'
import { finalizeRunOnClose } from '../src/launcher'
import { createRun, finishRun, inFlightRunsForSubject, setActiveSubjectRun, type RunState } from '../src/registry'
import { handleStreamLine } from '../src/stream-parser'
import type { SseEvent } from '../src/types'

const DATE = '2099-01-01'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

function mkRun(kind: 'full' | 'module', ticker: string): { run: RunState; events: SseEvent[] } {
  const run = createRun({
    kind, ticker, model: 'sonnet', prompt: '', user: 'test', userVia: 'local',
    runRoot: `analyses/${ticker}_${DATE}`, willCommitToMain: true,
    writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  run.status = 'running'
  setActiveSubjectRun(run.runId, ticker)
  const events: SseEvent[] = []
  run.subscribers.add({ id: 'finalize-test', send: (e) => events.push(e) })
  return { run, events }
}

const cleanResult = JSON.stringify({ type: 'result', subtype: 'success', is_error: false, total_cost_usd: 1.25, num_turns: 7, duration_ms: 1000 })
const errorResult = JSON.stringify({ type: 'result', subtype: 'error_max_turns', is_error: true, total_cost_usd: 0.5 })

const cleanupDirs: string[] = []
try {
  // 1. THE regression: clean `result` + clean exit on a full run with NO final deliverables
  //    must end INCOMPLETE, not done (the stream parser used to finish it as done first).
  check('clean result does not finalize; close marks a deliverable-less full run incomplete', () => {
    const { run, events } = mkRun('full', 'ZZFINA')
    handleStreamLine(run, cleanResult)
    assert.equal(run.status, 'running', 'clean result must NOT finalize the run')
    assert.equal(run.costUsd, 1.25) // metadata still recorded at result time
    assert.ok(!events.find((e) => e.type === 'run-done'), 'run-done must wait for process close')
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'incomplete')
    assert.ok(run.endedAt !== undefined)
    assert.equal(inFlightRunsForSubject('ZZFINA').length, 0, 'subject must be released')
    const evt = events.find((e) => e.type === 'run-error') as any
    assert.equal(evt?.reason, 'incomplete_deliverables')
  })

  // 2. with the deliverables on disk, the same path ends done (and carries the final paths)
  check('close marks a full run done when final_thesis + decision_record exist', () => {
    const root = path.join(ANALYSES_DIR, `ZZFINB_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    fs.writeFileSync(path.join(root, 'final_thesis.md'), '# thesis\n')
    fs.writeFileSync(path.join(root, 'decision_record.json'), '{}\n')
    const { run, events } = mkRun('full', 'ZZFINB')
    handleStreamLine(run, cleanResult)
    assert.equal(run.status, 'running')
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'done')
    const done = events.find((e) => e.type === 'run-done') as any
    assert.equal(done?.finalThesisPath, `analyses/ZZFINB_${DATE}/final_thesis.md`)
    assert.equal(inFlightRunsForSubject('ZZFINB').length, 0)
  })

  // 3. a cancel() sets status='cancelled' directly — close must STILL finalize and release the
  //    subject (the old status-gated close handler skipped it, leaking the subject until restart).
  check('cancelled run is finalized on close and releases its subject', () => {
    const { run } = mkRun('module', 'ZZFINC')
    run.status = 'cancelled'
    finalizeRunOnClose(run, { killed: true }, '')
    assert.equal(run.status, 'cancelled')
    assert.ok(run.endedAt !== undefined)
    assert.equal(inFlightRunsForSubject('ZZFINC').length, 0, 'cancelled subject must be released')
  })

  // 4. an EXTERNAL kill (not cancel()) must finalize as an error — execa 9 reports it via
  //    isTerminated/signal with exitCode undefined; the old `res.killed` check missed it and the
  //    run fell through to "done" (a killed handoff would even toast "memo seeded ✓").
  check('externally killed run finalizes as error, not done', () => {
    const { run, events } = mkRun('module', 'ZZFINE')
    finalizeRunOnClose(run, { isTerminated: true, signal: 'SIGKILL', exitCode: undefined }, '')
    assert.equal(run.status, 'error')
    const evt = events.find((e) => e.type === 'run-error') as any
    assert.equal(evt?.reason, 'terminated_SIGKILL')
    assert.equal(inFlightRunsForSubject('ZZFINE').length, 0)
  })

  // 5. an error result still finalizes early, and close does not double-finalize it
  check('error result finalizes early; close is a no-op afterwards', () => {
    const { run } = mkRun('module', 'ZZFIND')
    handleStreamLine(run, errorResult)
    assert.equal(run.status, 'error')
    const endedAt = run.endedAt
    finalizeRunOnClose(run, { exitCode: 1 }, 'boom')
    assert.equal(run.status, 'error')
    assert.equal(run.endedAt, endedAt, 'close must not re-finalize an already-ended run')
    assert.equal(inFlightRunsForSubject('ZZFIND').length, 0)
  })
} finally {
  for (const d of cleanupDirs) fs.rmSync(d, { recursive: true, force: true })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
