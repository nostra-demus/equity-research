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
import { admitRun } from '../src/admission'
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

function mkRun(kind: 'full' | 'module' | 'parity', ticker: string): { run: RunState; events: SseEvent[] } {
  const run = createRun({
    kind, ticker, provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
    profileKey: 'claude:sonnet:default',
    executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
    prompt: '', user: 'test', userVia: 'local',
    runRoot: `analyses/${ticker}_${DATE}`, willCommitToMain: true,
    writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  run.status = 'running'
  run.publicationCompleted = true
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
    const root = path.join(ANALYSES_DIR, `ZZFINA_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
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
    assert.equal(readRunMarker(`analyses/ZZFINA_${DATE}`, '.interrupted')?.reason, 'incomplete_deliverables',
      'a clean incomplete Claude Full is queued for exact-root autonomous continuation')
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

  // 2b. A forward full run explicitly marked for immutable Ideas publication is not complete merely
  // because the master wrote its thesis. The admission freezer is the only writer allowed to clear this
  // marker, after it has atomically frozen an admitted/not-admitted/not-applicable result.
  check('close keeps a thesis-bearing full run incomplete while immutable Ideas publication is pending', () => {
    const root = path.join(ANALYSES_DIR, `ZZFINPUB_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    fs.writeFileSync(path.join(root, 'final_thesis.md'), '# thesis\n')
    fs.writeFileSync(path.join(root, 'decision_record.json'), '{}\n')
    fs.writeFileSync(path.join(root, '.requires_idea_publication'), '')
    const { run, events } = mkRun('full', 'ZZFINPUB')
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'incomplete')
    assert.match(String(run.note), /immutable Ideas publication did not finish/)
    const evt = events.find((e) => e.type === 'run-error') as any
    assert.equal(evt?.reason, 'incomplete_deliverables')
    assert.match(String(evt?.message), /immutable Ideas publication did not/)
    assert.ok(!events.find((e) => e.type === 'run-done'), 'an unpublished thesis must never emit run-done')
  })

  check('fresh terminal artifacts cannot report success before supervisor publication', () => {
    const root = path.join(ANALYSES_DIR, `ZZPUB_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    fs.writeFileSync(path.join(root, 'final_thesis.md'), '# retained thesis\n')
    fs.writeFileSync(path.join(root, 'decision_record.json'), '{}\n')
    const { run, events } = mkRun('full', 'ZZPUB')
    run.publicationCompleted = false
    run.lastProviderMessage = 'I stopped before requesting publication because the canonical commit step was unavailable. token=super-secret-value'
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'error')
    assert.equal((events.find((event) => event.type === 'run-error') as any)?.reason, 'publication_failed')
    assert.match(
      String((events.find((event) => event.type === 'run-error') as any)?.message),
      /Provider final message:[\s\S]*canonical commit step was unavailable/,
    )
    assert.doesNotMatch(String((events.find((event) => event.type === 'run-error') as any)?.message), /super-secret-value/)
    assert.ok(fs.existsSync(path.join(root, 'final_thesis.md')), 'failed publication retains authored artifacts')
    assert.match(fs.readFileSync(path.join(root, 'RUN_FAILURE.md'), 'utf8'), /canonical commit step was unavailable/)
    assert.equal(readRunMarker(`analyses/ZZPUB_${DATE}`, '.interrupted')?.reason, 'publication_failed')
  })

  check('Codex clean exit without turn.completed names every unresolved canonical output', () => {
    const root = path.join(ANALYSES_DIR, `ZZCODEX_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(path.join(root, 'business-model'), { recursive: true })
    const { run, events } = mkRun('module', 'ZZCODEX')
    run.provider = 'codex'
    run.model = 'gpt-5.6-sol'
    run.reasoningLevel = 'max'
    run.profileKey = 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh'
    run.executionProfile = {
      key: run.profileKey,
      parentModel: 'gpt-5.6-sol',
      parentReasoning: 'max',
      specialistModel: 'gpt-5.6-terra',
      specialistReasoning: 'xhigh',
    }
    run.module = 'business-model'
    run.chained = true
    run.chainId = '11111111-1111-4111-8111-111111111111'
    run.expected = new Map([
      ['business-model/09_moat', {
        key: 'business-model/09_moat', module: 'business-model', name: 'moat', layer: 3,
        outputRel: 'business-model/09_moat.md',
      }],
      ['business-model/99_business-model-synthesis', {
        key: 'business-model/99_business-model-synthesis', module: 'business-model',
        name: 'business-model-synthesizer', layer: 4,
        outputRel: 'business-model/99_business-model-synthesis.md',
      }],
    ])
    run.agents.set('business-model/09_moat', {
      key: 'business-model/09_moat', module: 'business-model', name: 'moat', layer: 3, status: 'running',
    })
    run.nativeThreadToAgent.set('native-moat', 'business-model/09_moat')
    run.nativeAgentStates.set('native-moat', 'running')
    run.lastProviderMessage = 'Neither moat nor synthesis has been accepted. Both remain in flight.'

    finalizeRunOnClose(run, { exitCode: 0 }, '')

    assert.equal(run.status, 'error')
    const failed = events.find((event) => event.type === 'run-error') as any
    assert.equal(failed?.reason, 'codex_incomplete_orchestration')
    assert.match(String(failed?.message), /business-model\/09_moat/)
    assert.match(String(failed?.message), /business-model\/99_business-model-synthesis/)
    assert.match(String(failed?.message), /native=running/)
    assert.match(String(failed?.message), /Both remain in flight/)
    assert.ok(!events.find((event) => event.type === 'run-done'))
    assert.equal(readRunMarker(`analyses/ZZCODEX_${DATE}`, '.interrupted')?.reason, 'codex_incomplete_orchestration',
      'a clean incomplete Codex chain child preserves the exact-root recovery queue')
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

  // 5. A provider can emit a structured error while its detached Task processes are still alive. Keep
  //    admission held until process close; otherwise an overlapping writer can start into the same root.
  check('stream error holds admission until process close finalizes the run', () => {
    const { run } = mkRun('module', 'ZZFIND')
    handleStreamLine(run, '{malformed provider noise')
    assert.equal(run.status, 'running', 'a malformed line is non-terminal')
    handleStreamLine(run, errorResult)
    assert.equal(run.status, 'running', 'structured failure must not release a still-live process tree')
    assert.equal(run.endedAt, undefined)
    assert.equal(inFlightRunsForSubject('ZZFIND').length, 1)
    const overlap = admitRun({
      ticker: 'ZZFIND', kind: 'full', coveredModules: [], writeTargetsAbs: [], readDepsAbs: [],
    })
    assert.equal(overlap.ok, false, 'a second overlapping launch stays blocked before close')
    assert.equal((overlap as any).code, 'exclusivity')
    finalizeRunOnClose(run, { exitCode: 1 }, 'boom')
    assert.equal(run.status, 'error')
    assert.ok(run.endedAt !== undefined)
    assert.equal(inFlightRunsForSubject('ZZFIND').length, 0)
  })

  check('provider final text is retained as a bounded terminal diagnostic', () => {
    const { run } = mkRun('module', 'ZZPROVIDERMSG')
    run.provider = 'codex'
    handleStreamLine(run, JSON.stringify({
      type: 'item.completed', item: { type: 'agent_message', text: `  ${'x'.repeat(4_100)}  ` },
    }))
    assert.equal(run.lastProviderMessage?.length, 4_000)
    assert.equal(run.lastProviderMessage, 'x'.repeat(4_000))
  })

  check('parity adjudication cannot report success before terminal supervisor verification', () => {
    const { run, events } = mkRun('parity', 'ZZPARITY')
    run.willCommitToMain = false
    run.publicationCompleted = false
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'error')
    assert.equal((events.find((event) => event.type === 'run-error') as any)?.reason, 'parity_verification_missing')
  })

  check('stable commodity quota failure remains resumable despite an older decision record', () => {
    const runRoot = 'commodity/runs/ZZCOMQ'
    const root = path.join(REPO_ROOT, runRoot)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    fs.writeFileSync(path.join(root, 'decision_record.json'), '{"action":"Hold","old":true}\n')
    const run = createRun({
      kind: 'full', ticker: 'ZZCOMQ', subjectId: 'ZZCOMQ', swarmId: 'commodity', unit: 'commodity',
      provider: 'claude', model: 'sonnet', reasoningLevel: 'default', profileKey: 'claude:sonnet:default',
      executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
      prompt: '', user: 'test', userVia: 'local', runRoot, willCommitToMain: true,
      writeTargetsAbs: [], coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
    })
    run.status = 'running'
    run.provenanceEpoch = run.runId
    run.publicationCompleted = false
    setActiveSubjectRun(run.runId, run.subjectId, run.swarmId)
    handleStreamLine(run, JSON.stringify({
      type: 'result', subtype: 'out_of_credits', is_error: true, result: 'plan limit reached',
    }))
    finalizeRunOnClose(run, { exitCode: 1 }, 'plan limit reached')
    assert.equal(run.status, 'error')
    const marker = readRunMarker(runRoot, '.interrupted')
    assert.equal(marker?.reason, 'out_of_credits')
    assert.equal(marker?.executionEpoch, run.runId)
    assert.ok(fs.existsSync(path.join(root, 'decision_record.json')), 'the prior terminal record remains retained')
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

  check('a failed frozen module keeps local diagnostics but never invokes Git publication', () => {
    const root = path.join(ANALYSES_DIR, `ZZPARMOD_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    const committed: unknown[] = []
    const prev = __setFailureNoteCommitter((...args) => committed.push(args))
    try {
      const { run } = mkRun('module', 'ZZPARMOD')
      run.module = 'valuation'
      run.chained = true
      run.parityCanary = true
      run.parityCanaryStage = 'module'
      finalizeRunOnClose(run, { exitCode: 1 }, 'frozen valuation child failed')
      assert.equal(run.status, 'error')
      assert.ok(fs.existsSync(path.join(root, 'RUN_FAILURE.md')),
        'the bounded diagnostic remains available to the canary status surface')
      assert.ok(readRunMarker(`analyses/ZZPARMOD_${DATE}`, '.interrupted'),
        'the immutable interruption authority remains on disk')
      assert.equal(committed.length, 0,
        'an intermediate parity failure cannot mutate HEAD while siblings drain')
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

  // 9. Persist the structured failure immediately, but finalize only after the process-group-safe close boundary.
  check('a stream-result error (error_max_turns) records the SAME failure note as a close-time error', () => {
    const root = path.join(ANALYSES_DIR, `ZZFINI_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    const committed: Array<{ runRoot: string; file: string; msg: string }> = []
    const prev = __setFailureNoteCommitter((runRoot, file, msg) => committed.push({ runRoot, file, msg }))
    try {
      const { run } = mkRun('full', 'ZZFINI')
      const streamError = JSON.stringify({ type: 'result', subtype: 'error_max_turns', is_error: true, result: 'ran out of turns mid-valuation' })
      handleStreamLine(run, streamError)
      assert.equal(run.status, 'running', 'the stream result keeps admission until process close')
      assert.equal(run.endedAt, undefined)
      const md = fs.readFileSync(path.join(root, 'RUN_FAILURE.md'), 'utf8')
      assert.match(md, /reason: error_max_turns/)
      assert.match(md, /ran out of turns mid-valuation/)
      assert.equal(committed.length, 1, 'RUN_FAILURE.md must be committed from the stream-result path too')
      const marker = readRunMarker(`analyses/ZZFINI_${DATE}`, '.interrupted') as any
      assert.equal(marker?.reason, 'error_max_turns')
      assert.match(String(run.note), /error_max_turns/, 'the durable activity-log note is set too')
      finalizeRunOnClose(run, { exitCode: 1 }, 'ignored')
      assert.equal(run.status, 'error')
      assert.ok(run.endedAt !== undefined)
      assert.equal(committed.length, 1, 'close must not record a second failure note')
    } finally {
      __setFailureNoteCommitter(prev)
    }
  })

  // 10. Findings 5/12/14: a SAME-DAY relaunch into a folder that already holds final_thesis.md +
  //     decision_record.json from an EARLIER, genuinely-completed run must NOT let those stale files (a)
  //     suppress recordRunFailure's note (Finding 5), or (b) make the run-done success-override branch
  //     treat a fresh, real failure as done (Findings 12/14). The files are backdated well past the
  //     shipped-by-this-attempt skew tolerance so they read as provably stale, not a timing artifact.
  check('a same-day relaunch with STALE deliverables from an earlier run still records a fresh failure', () => {
    const root = path.join(ANALYSES_DIR, `ZZFINJ_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    const thesisPath = path.join(root, 'final_thesis.md')
    const decisionPath = path.join(root, 'decision_record.json')
    fs.writeFileSync(thesisPath, '# stale thesis from an earlier completed run\n')
    fs.writeFileSync(decisionPath, '{}\n')
    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    fs.utimesSync(thesisPath, anHourAgo, anHourAgo)
    fs.utimesSync(decisionPath, anHourAgo, anHourAgo)
    const committed: Array<{ runRoot: string; file: string; msg: string }> = []
    const prev = __setFailureNoteCommitter((runRoot, file, msg) => committed.push({ runRoot, file, msg }))
    try {
      const { run, events } = mkRun('full', 'ZZFINJ') // startedAt = now, well AFTER the backdated files
      finalizeRunOnClose(run, { exitCode: 1 }, 'a fresh failure this same-day relaunch attempt')
      assert.equal(run.status, 'error', 'stale deliverables from an earlier run must not be mistaken for THIS attempt shipping')
      assert.ok(!events.find((e) => e.type === 'run-done'), 'no run-done for a fresh failure just because old files sit in the folder')
      assert.ok(fs.existsSync(path.join(root, 'RUN_FAILURE.md')), 'the fresh failure must still get a RUN_FAILURE.md')
      assert.equal(committed.length, 1)
      const marker = readRunMarker(`analyses/ZZFINJ_${DATE}`, '.interrupted') as any
      assert.equal(marker?.reason, 'nonzero_exit', 'the fresh failure must still mark .interrupted so the resume supervisor can find it')
      assert.match(String(run.note), /nonzero_exit/, 'the durable note must carry the fresh failure, not be suppressed')
    } finally {
      __setFailureNoteCommitter(prev)
    }
  })

  // 11. Finding 12 (bottom-else clear-guard): a SIBLING chained module finishing CLEANLY must not clear a
  //     FRESH RUN_FAILURE.md that a DIFFERENT sibling's genuine failure just wrote for THIS SAME attempt,
  //     just because stale final_thesis/decision_record from an earlier completed run sit in the folder.
  check('the CLI verdict is captured on a CLEAN result, not only on an error', () => {
    // THE regression that matters for diagnosability. The parser read cost/turns/duration off the
    // `result` message and DISCARDED subtype/is_error/api_error_status unless it was an error — so a
    // clean-but-truncated exit left no record anywhere of how the orchestrator ended. Those three
    // fields are the only thing separating "it finished early on its own" from "a cap or API error
    // stopped it", and their absence is why months of module stalls could not be diagnosed at all.
    const { run } = mkRun('module', 'ZZCLI')
    handleStreamLine(run, JSON.stringify({
      type: 'result', subtype: 'success', is_error: false, total_cost_usd: 1.5,
    }))
    assert.equal(run.cliResult?.subtype, 'success', 'a CLEAN result records its subtype')
    assert.equal(run.cliResult?.isError, false)
    assert.equal(run.status, 'running', 'and capturing it must not finalize the run')

    // an API-error result carries its status code through too
    const { run: run2 } = mkRun('module', 'ZZCLI2')
    handleStreamLine(run2, JSON.stringify({
      type: 'result', subtype: 'error_during_execution', is_error: true,
      api_error_status: 429, total_cost_usd: 0.2,
    }))
    assert.equal(run2.cliResult?.apiErrorStatus, 429)
    assert.equal(run2.cliResult?.isError, true)
    assert.equal(run2.endedAt, undefined, 'API error also retains claims until close')
    finalizeRunOnClose(run2, { exitCode: 1 }, '')
    assert.ok(run2.endedAt !== undefined)
  })

  check('a fail-fast Insufficient triage is a correct abort, NOT an incomplete run', () => {
    // The false-positive twin of the incomplete branch. A triage returning Insufficient aborts the module
    // BY DESIGN — no synthesis, no commit (every module command says so). Reporting that as "incomplete"
    // would manufacture a failure, which is the same defect class pointed the other way.
    const root = path.join(ANALYSES_DIR, `ZZFAIL_${DATE}`)
    cleanupDirs.push(root)
    const modDir = path.join(root, 'business-model')
    fs.mkdirSync(modDir, { recursive: true })
    const triage = path.join(modDir, '00_data-triage.md')
    fs.writeFileSync(triage, '# Data triage\n\n**Verdict:** Insufficient data\n')
    const { run } = mkRun('module', 'ZZFAIL')
    run.module = 'business-model'
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'done', 'a reasoned Insufficient abort is not a stall')

    // …and the same folder with a SUFFICIENT verdict and still no synthesis IS incomplete.
    fs.writeFileSync(triage, '# Data triage\n\n**Verdict:** Sufficient\n')
    const { run: run2 } = mkRun('module', 'ZZFAIL')
    run2.module = 'business-model'
    finalizeRunOnClose(run2, { exitCode: 0 }, '')
    assert.equal(run2.status, 'incomplete', 'a sufficient triage with no synthesis is a real stall')

    const current99 = path.join(modDir, '99_business-model-synthesis.md')
    fs.writeFileSync(current99, '# cut-off synthesis\n\n```json\n{"partial":true}\n')
    const { run: run3 } = mkRun('module', 'ZZFAIL')
    run3.module = 'business-model'
    finalizeRunOnClose(run3, { exitCode: 0 }, '')
    assert.equal(run3.status, 'incomplete', 'a malformed current synthesis cannot make a clean child look done')

    fs.rmSync(current99)
    fs.writeFileSync(path.join(modDir, '99_retired-business-model-synthesis.md'), '# obsolete but valid\n')
    const { run: run4 } = mkRun('module', 'ZZFAIL')
    run4.module = 'business-model'
    finalizeRunOnClose(run4, { exitCode: 0 }, '')
    assert.equal(run4.status, 'incomplete', 'an obsolete 99 filename cannot stand in for the discovered synthesis')
  })

  check('a standalone MODULE stop is RECORDED — and per-module, so a shared folder keeps every record', () => {
    // Recording was gated behind isResumableResearchRun, so a solo `module` launch wrote nothing on any
    // stop path. And the dedup was keyed on runRoot alone, so several module runs into ONE folder
    // collapsed to a single record — it would have eaten the very evidence this change creates.
    const root = path.join(ANALYSES_DIR, `ZZREC_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    const committed: unknown[] = []
    const prev = __setFailureNoteCommitter((...a) => committed.push(a))
    try {
      const { run: a } = mkRun('module', 'ZZREC')
      a.module = 'management-governance'
      finalizeRunOnClose(a, { exitCode: 1 }, 'boom')
      assert.equal(committed.length, 1, 'a solo module stop is recorded at all')

      const { run: b } = mkRun('module', 'ZZREC')
      b.module = 'earnings'                       // SAME folder, different module
      finalizeRunOnClose(b, { exitCode: 1 }, 'boom')
      assert.equal(committed.length, 2, 'a second module in the same folder keeps its own record')

      const { run: c } = mkRun('module', 'ZZREC')
      c.module = 'earnings'                       // same folder AND same module -> deduped
      finalizeRunOnClose(c, { exitCode: 1 }, 'boom')
      assert.equal(committed.length, 2, 'the same module does not double-record')
    } finally {
      __setFailureNoteCommitter(prev)
    }
  })

  check('a plan usage-limit stop is classified out_of_credits, not nonzero_exit', () => {
    // The old /credit|rate limit/ pattern missed the CLI's actual wording, so a real plan stop was
    // labelled nonzero_exit, no resetsAt was stamped, and the resume supervisor relaunched straight
    // back into the exhausted window.
    const root = path.join(ANALYSES_DIR, `ZZLIM_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    const { run } = mkRun('module', 'ZZLIM')
    run.module = 'earnings'
    finalizeRunOnClose(run, { exitCode: 1 }, 'Claude AI usage limit reached. Your limit will reset at 3pm.')
    assert.match(String(run.note), /out_of_credits/, 'the CLI wording is recognised as a plan stop')
  })

  check('a MODULE run that stopped before its synthesis is incomplete, not done', () => {
    // The defect this locks: a module run that exited 0 having stalled mid-pipeline fell through every
    // branch to `done`. So a governance pass that died after 12 of 14 orbs was recorded as a SUCCESS —
    // no error, no reports button, nothing to tell the user why the module was still empty. Chronic and
    // cross-module: ORCL business-model 2026-08-14 and TSLA earnings 2026-07-24 have the same silhouette.
    const root = path.join(ANALYSES_DIR, `ZZMODU_${DATE}`)
    cleanupDirs.push(root)
    const modDir = path.join(root, 'management-governance')
    fs.mkdirSync(modDir, { recursive: true })
    fs.writeFileSync(path.join(modDir, '00_governance-data-triage.md'), '# triage\n')
    fs.writeFileSync(path.join(modDir, '01_management-and-track-record.md'), '# track record\n')

    const { run } = mkRun('module', 'ZZMODU')
    run.module = 'management-governance'
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'incomplete', 'no synthesis on disk → incomplete, never a silent done')
    assert.match(String(run.note), /management-governance stopped before its synthesis/)

    // …and the note names what DID land, so "it just stops" becomes "2 steps saved, here they are".
    const { run: run2 } = mkRun('module', 'ZZMODU')
    run2.module = 'management-governance'
    finalizeRunOnClose(run2, { exitCode: 0 }, '')
    assert.match(String(run2.note), /2\//, 'the note counts the steps that landed')
  })

  check('a MODULE run that DID write its synthesis is done', () => {
    const root = path.join(ANALYSES_DIR, `ZZMODOK_${DATE}`)
    cleanupDirs.push(root)
    const modDir = path.join(root, 'earnings')
    fs.mkdirSync(modDir, { recursive: true })
    fs.writeFileSync(path.join(modDir, '99_earnings-synthesis.md'), '# earnings synthesis\n')
    const { run } = mkRun('module', 'ZZMODOK')
    run.module = 'earnings'
    finalizeRunOnClose(run, { exitCode: 0 }, '')
    assert.equal(run.status, 'done', 'a synthesis on disk is the module deliverable — report success')
  })

  check('a cleanly-finishing sibling module does not wipe a sibling failure just because stale deliverables exist', () => {
    const root = path.join(ANALYSES_DIR, `ZZFINK_${DATE}`)
    cleanupDirs.push(root)
    fs.mkdirSync(root, { recursive: true })
    const thesisPath = path.join(root, 'final_thesis.md')
    const decisionPath = path.join(root, 'decision_record.json')
    fs.writeFileSync(thesisPath, '# stale thesis from an earlier completed run\n')
    fs.writeFileSync(decisionPath, '{}\n')
    const anHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    fs.utimesSync(thesisPath, anHourAgo, anHourAgo)
    fs.utimesSync(decisionPath, anHourAgo, anHourAgo)
    const committed: unknown[] = []
    const prev = __setFailureNoteCommitter((...a) => committed.push(a))
    try {
      // sibling A (valuation) fails first in THIS new attempt — records a fresh RUN_FAILURE.md
      const { run: runA } = mkRun('full', 'ZZFINK')
      runA.module = 'valuation'
      finalizeRunOnClose(runA, { exitCode: 1 }, 'valuation broke in this fresh attempt')
      assert.ok(fs.existsSync(path.join(root, 'RUN_FAILURE.md')), 'sibling A recorded the fresh failure')
      const freshFailureContent = fs.readFileSync(path.join(root, 'RUN_FAILURE.md'), 'utf8')
      // sibling B (a different chained module) finishes CLEANLY moments later
      const { run: runB } = mkRun('module', 'ZZFINK')
      runB.chained = true
      finalizeRunOnClose(runB, { exitCode: 0 }, '')
      assert.equal(runB.status, 'done', 'sibling B itself finished cleanly')
      assert.ok(fs.existsSync(path.join(root, 'RUN_FAILURE.md')), 'sibling B must NOT delete the fresh failure note from sibling A')
      assert.equal(fs.readFileSync(path.join(root, 'RUN_FAILURE.md'), 'utf8'), freshFailureContent, 'the failure note content is untouched')
    } finally {
      __setFailureNoteCommitter(prev)
    }
  })
} finally {
  for (const d of cleanupDirs) fs.rmSync(d, { recursive: true, force: true })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
