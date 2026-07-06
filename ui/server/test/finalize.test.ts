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
import { finalizeRunOnClose, __setFailureNoteCommitter } from '../src/launcher'
import { readRunMarker } from '../src/outputs'
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

  // 6. A1+A2+A3: a broken chained/full run enriches the .interrupted marker (module + stderr tail), writes
  //    + commits a DISTINCT RUN_FAILURE.md (never the RUN_METADATA success contract) with modules-done
  //    (excluding the broken module) + reason + stderr tail, and sets the durable activity-log note. Git
  //    spawn stubbed.
  check('a broken chained/full run: marker + RUN_FAILURE.md + activity note (never touches RUN_METADATA)', () => {
    const root = path.join(ANALYSES_DIR, `ZZFINF_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(path.join(root, 'business-model'), { recursive: true })
    fs.writeFileSync(path.join(root, 'business-model', '99_business-model-synthesis.md'), '# done\n')
    const committed: Array<{ runRoot: string; file: string; msg: string }> = []
    const prev = __setFailureNoteCommitter((runRoot, file, msg) => committed.push({ runRoot, file, msg }))
    try {
      const { run } = mkRun('full', 'ZZFINF')
      run.module = 'valuation' // the chained step that was running when it broke
      // stderr carries a fake secret — it MUST be redacted everywhere it is persisted (RUN_FAILURE.md is
      // committed to a public repo; the marker + activity note surface in the UI).
      const SECRET = 'sk-ant-api03-SECRET1234567890abcdefg'
      finalizeRunOnClose(run, { exitCode: 1 }, `FATAL in valuation: auth failed with key ${SECRET}`)
      assert.equal(run.status, 'error')
      // A2 — a DISTINCT RUN_FAILURE.md, never the RUN_METADATA success contract
      assert.ok(!fs.existsSync(path.join(root, 'RUN_METADATA.md')), 'must NOT write the RUN_METADATA success contract')
      const md = fs.readFileSync(path.join(root, 'RUN_FAILURE.md'), 'utf8')
      assert.match(md, /status: FAILED/)
      assert.match(md, /stopped_at: valuation/)
      assert.match(md, /reason: nonzero_exit/)
      assert.match(md, /- business-model/)                // finished module, from disk
      assert.doesNotMatch(md, /^- valuation$/m)           // the broken module is NOT listed as completed
      assert.match(md, /FATAL in valuation/)              // non-secret context preserved
      assert.doesNotMatch(md, /SECRET1234567890abcdefg/)  // #4: the secret is REDACTED before commit
      assert.match(md, /REDACTED/)
      assert.equal(committed.length, 1)
      assert.equal(committed[0].file, 'RUN_FAILURE.md')
      assert.equal(committed[0].runRoot, `analyses/ZZFINF_${DATE}`)
      // A1 — the .interrupted marker carries the module + (redacted) stderr tail
      const marker = readRunMarker(`analyses/ZZFINF_${DATE}`, '.interrupted') as any
      assert.equal(marker?.module, 'valuation')
      assert.match(String(marker?.message), /FATAL in valuation/)
      assert.doesNotMatch(String(marker?.message), /SECRET1234567890/) // redacted in the on-host marker too
      // A3 — the durable activity-log note carries the (redacted) reason (⚠ pill + hover in the cockpit)
      assert.match(String(run.note), /nonzero_exit: FATAL in valuation/)
      assert.doesNotMatch(String(run.note), /SECRET1234567890/)
    } finally {
      __setFailureNoteCommitter(prev)
    }
  })

  // 7. THE audit fix: a run that SHIPPED its terminal deliverables but whose process then exits nonzero
  //    must NOT be stamped failed — it finalizes DONE (the research succeeded; a trailing nonzero on the
  //    final commit does not un-ship it): no RUN_FAILURE.md, no .interrupted marker, no commit, and — the
  //    review follow-up (Codex #2) — NO failure reason in run.note polluting the durable activity log.
  check('a completed run that exits nonzero finalizes DONE, not failed (no note, no RUN_FAILURE.md)', () => {
    const root = path.join(ANALYSES_DIR, `ZZFING_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    fs.writeFileSync(path.join(root, 'final_thesis.md'), '# thesis\n')
    fs.writeFileSync(path.join(root, 'decision_record.json'), '{}\n')
    const committed: unknown[] = []
    const prev = __setFailureNoteCommitter((...a) => committed.push(a))
    try {
      const { run, events } = mkRun('full', 'ZZFING')
      finalizeRunOnClose(run, { exitCode: 1 }, 'trailing nonzero after a completed run')
      assert.equal(run.status, 'done', 'a shipped run that exits nonzero is DONE, not error')
      assert.ok(events.find((e) => e.type === 'run-done'), 'a run-done event is emitted for the shipped run')
      assert.doesNotMatch(String(run.note ?? ''), /nonzero_exit|terminated_/, 'no failure reason in the durable note')
      assert.ok(!fs.existsSync(path.join(root, 'RUN_FAILURE.md')), 'a completed run must not get a failure note')
      assert.ok(!readRunMarker(`analyses/ZZFING_${DATE}`, '.interrupted'), 'a completed run must not be marked interrupted')
      assert.equal(committed.length, 0, 'no failure commit for a completed run')
      assert.equal(inFlightRunsForSubject('ZZFING').length, 0)
    } finally {
      __setFailureNoteCommitter(prev)
    }
  })

  // 8. Review follow-up (Codex #3): a chained step whose 99_*-synthesis.md is already on disk when the
  //    process exits nonzero (a commit/handoff failed AFTER the module completed) is COMPLETE and must stay
  //    in the "Modules completed" inventory — resume will skip it — with the failed phase reported
  //    separately in stopped_at, never contradicting the completed list.
  check('a stopped module whose synthesis is on disk stays in the completed inventory (disk truth)', () => {
    const root = path.join(ANALYSES_DIR, `ZZFINH_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(path.join(root, 'valuation'), { recursive: true })
    fs.writeFileSync(path.join(root, 'valuation', '99_valuation-synthesis.md'), '# done\n')
    const committed: Array<{ runRoot: string; file: string; msg: string }> = []
    const prev = __setFailureNoteCommitter((runRoot, file, msg) => committed.push({ runRoot, file, msg }))
    try {
      const { run } = mkRun('full', 'ZZFINH')
      run.module = 'valuation' // broke on valuation's commit/handoff — its synthesis is already on disk
      finalizeRunOnClose(run, { exitCode: 1 }, 'commit failed after valuation synthesis')
      assert.equal(run.status, 'error')
      const md = fs.readFileSync(path.join(root, 'RUN_FAILURE.md'), 'utf8')
      assert.match(md, /^- valuation$/m, 'a module complete on disk must be listed as completed')
      assert.match(md, /stopped_at: after valuation \(its synthesis shipped\)/, 'the failed phase is reported without contradicting the completed list')
    } finally {
      __setFailureNoteCommitter(prev)
    }
  })
} finally {
  for (const d of cleanupDirs) fs.rmSync(d, { recursive: true, force: true })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
