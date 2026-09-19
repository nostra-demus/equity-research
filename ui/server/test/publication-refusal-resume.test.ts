// A publication the supervisor REFUSES for a reason no retry can change (the data catalogue's FAIL verdict
// on the proposed tree) must never be continued automatically: every automatic continuation of a full chain
// deletes the terminal artifacts and pays for the master synthesizer again, then meets the same refusal
// (CONTRIBUTING.md: no automatic paid retry, no retry loop that hides the cause). A TRANSIENT publication
// failure (push / network / lost race) must keep auto-resuming exactly as before, and an explicit manual
// resume must stay available — including after the master already wrote its thesis, where the ordinary
// Continue route used to dead-end with `already_complete`. The two classes are told apart by a typed error
// and a distinct durable reason — never by reading an error message.
//
// This file never executes `dispatchResumableRuns`: that loop scans the real analyses/ tree and can start a
// real paid provider run. Its lanes are pinned through the functions it calls.
//
// Run: npx tsx test/publication-refusal-resume.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Ready-publication receipts and snapshots are protected supervisor state. Keep this file's out of the
// developer's real state directory; config reads ENGINE_STATE_DIR at module evaluation.
const stateDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-publication-refusal-')))
process.env.ENGINE_STATE_DIR = stateDir

const { REPO_ROOT } = await import('../src/config')
const {
  COMMIT_RUN_REFUSED_EXIT_CODE, PublicationRefusedError, commitRunCommitter, drainPublicationForClose,
  publicationCommitError, recordPublicationFailure, writeInterruptionMarker,
  __setFailureNoteCommitter, __setPostReviewCalibration, __setSupervisorCommitter, __setSupervisorCommitVerifier,
  finalizeRunOnClose, queuePublicationIntent,
} = await import('../src/launcher')
const { beginExecutionAttempt } = await import('../src/execution-provenance')
const { readRunMarker } = await import('../src/outputs')
const { createRun, finishRun, setActiveSubjectRun } = await import('../src/registry')
const { PUBLICATION_REFUSED_REASON, autoResumeDue, requiresManualResume } = await import('../src/resume-policy')
const { listResumableRuns } = await import('../src/resumable')
const {
  dispatchRecoverableChainIntent, isResumeDue, listResumableResearchRuns, noteManualResumeHold,
  resumeHeldChainManually,
} = await import('../src/resume-supervisor')
import type { RunState } from '../src/registry'
import type { RunProvider } from '../src/providers/types'
import type { PreparedRunPlanTransaction, RecoverableChainIntentRecord } from '../src/run-plan-transaction'
import type { SseEvent } from '../src/types'

const DATE = '2099-01-01'
const now = Date.now()
const PAST = Math.floor((now - 3600 * 1000) / 1000)

let passed = 0
let skipped = 0
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
/** A guard whose target does not exist yet must say so out loud and must NOT count as a pass. */
function skip(name: string, why: string) {
  skipped++
  console.log(`  SKIP  ${name}\n        ${why}`)
}

const PROFILES = {
  claude: {
    model: 'sonnet', reasoningLevel: 'default', profileKey: 'claude:sonnet:default',
    executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
  },
  codex: {
    model: 'gpt-5.6-sol', reasoningLevel: 'max', profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    executionProfile: {
      key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
      specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
    },
  },
} as const

const cleanupDirs: string[] = [stateDir]
const cleanup = () => { for (const d of cleanupDirs) fs.rmSync(d, { recursive: true, force: true }) }
// Fixture roots live in the real analyses/ tree (the finalizer and projections resolve REPO_ROOT). A killed
// run must not leave `.interrupted` fixtures behind for a live supervisor or the cockpit to list.
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { cleanup(); process.exit(130) })

/** The terminal master of a chained full run: it wrote its thesis, then publication did not complete. */
function mkMaster(provider: RunProvider, ticker: string): { run: RunState; events: SseEvent[]; runRoot: string } {
  const runRoot = `analyses/${ticker}_${DATE}`
  const abs = path.join(REPO_ROOT, runRoot)
  cleanupDirs.push(abs)
  fs.rmSync(abs, { recursive: true, force: true })
  fs.mkdirSync(abs, { recursive: true })
  fs.writeFileSync(path.join(abs, 'final_thesis.md'), '# thesis\n')
  fs.writeFileSync(path.join(abs, 'decision_record.json'), '{}\n')
  const run = createRun({
    kind: 'rerun', ticker, provider, ...PROFILES[provider], prompt: '', user: 'test', userVia: 'local',
    runRoot, willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  run.module = 'master'
  run.agent = 'synthesizer'
  run.chained = true
  run.status = 'running'
  run.publicationRequested = true
  run.publicationCompleted = false
  // A real terminal master always ends with a closing summary, capped at 4,000 characters. Every durable
  // surface keeps only the tail of a message, so a fixture without one would hide a truncated cause.
  run.lastProviderMessage = `Final thesis written. ${'The memo and dossier are complete. '.repeat(120)}`.slice(0, 4000)
  setActiveSubjectRun(run.runId, ticker)
  const events: SseEvent[] = []
  run.subscribers.add({ id: 'publication-refusal-test', send: (e) => events.push(e) })
  return { run, events, runRoot }
}

/** What execa reports when commit-run.sh exits with the given code. */
const execaExit = (exitCode: number, stderr: string) => Object.assign(
  new Error(`Command failed with exit code ${exitCode}: bash scripts/commit-run.sh 'msg' -- ${'analyses/X/f.md '.repeat(40)}\n\n${stderr}`),
  { exitCode, stderr },
)
const commitRunExit = (exitCode: number, stderr: string) => publicationCommitError(execaExit(exitCode, stderr))
const CATALOGUE_STDERR = 'DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data: analyses/X_2099-01-01/stray.json\n'
  + 'commit-run: data catalogue rejected the staged publication — nothing was committed or pushed'
const PUSH_STDERR = 'commit-run: data reconciliation lost three remote races; commit abc remains local — retry later'

/** A harmless stand-in for scripts/commit-run.sh so the REAL production committer (and its catch) runs. */
function fakeCommitRun(exitCode: number, stderr: string): string {
  const dir = fs.mkdtempSync(path.join(stateDir, 'fake-commit-run-'))
  const script = path.join(dir, 'commit-run.sh')
  fs.writeFileSync(script, `#!/usr/bin/env bash\ncat >&2 <<'EOF'\n${stderr}\nEOF\nexit ${exitCode}\n`, { mode: 0o700 })
  return script
}

const previousNoteCommitter = __setFailureNoteCommitter(() => { /* never spawn real git from a fixture */ })
const previousCalibration = __setPostReviewCalibration(async () => { /* never spawn the calibrator */ })
try {
  // ---- the shared pure policy (headless supervisor + browser-facing projections) -------------------------
  await check('policy: a refused publication is never automatically due, whatever else the marker says', () => {
    assert.equal(PUBLICATION_REFUSED_REASON, 'publication_refused')
    assert.equal(requiresManualResume(PUBLICATION_REFUSED_REASON), true)
    assert.equal(autoResumeDue(PUBLICATION_REFUSED_REASON, undefined, now), false)
    assert.equal(autoResumeDue(PUBLICATION_REFUSED_REASON, PAST, now), false,
      'a passed reset time is quota telemetry; it cannot make a deterministic refusal retryable')
    assert.equal(isResumeDue({ kind: 'full', subject: 'X', reason: PUBLICATION_REFUSED_REASON }, now), false)
  })

  await check('policy: a transient publication failure and every other break still auto-resume', () => {
    for (const reason of ['publication_failed', 'nonzero_exit', 'terminated_SIGKILL', 'incomplete_deliverables', undefined]) {
      assert.equal(requiresManualResume(reason), false, String(reason))
      assert.equal(autoResumeDue(reason, undefined, now), true, String(reason))
    }
    assert.equal(autoResumeDue('out_of_credits', undefined, now), false, 'the quota hold is unchanged')
    assert.equal(autoResumeDue('out_of_credits', PAST, now), true, 'a passed quota reset is still due')
  })

  await check('policy: the rule is written into the canonical cockpit contract, not only into code', () => {
    const contract = fs.readFileSync(path.join(REPO_ROOT, 'frameworks', 'PROVIDER_TRANSPARENT_COCKPIT.md'), 'utf8')
    assert.match(contract, /`publication_refused`/)
    assert.match(contract, /never continued automatically/)
    assert.match(contract, /manual Resume stays available/)
    assert.match(contract, /No automatic writer may downgrade/)
  })

  // ---- classification: a structured signal, never an error-message match ---------------------------------
  await check('classification: only commit-run.sh\'s dedicated refusal exit code is a deterministic refusal', () => {
    const refused = commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR)
    assert.ok(refused instanceof PublicationRefusedError)
    assert.equal((refused as Error).message, CATALOGUE_STDERR,
      'the refusal carries the validator\'s own explanation, not the process runner\'s command line')
    assert.equal((refused as any).cause?.exitCode, COMMIT_RUN_REFUSED_EXIT_CODE, 'the raw helper error stays attached')
    const silent = publicationCommitError(execaExit(COMMIT_RUN_REFUSED_EXIT_CODE, '   \n'))
    assert.ok(silent instanceof PublicationRefusedError)
    assert.match((silent as Error).message, new RegExp(`Command failed with exit code ${COMMIT_RUN_REFUSED_EXIT_CODE}`), 'whitespace-only stderr never masks the message')
    for (const code of [2, 3, 4, 5]) {
      // Same catalogue TEXT, different exit code: the text must not decide the class.
      const other = execaExit(code, CATALOGUE_STDERR)
      assert.equal(publicationCommitError(other), other, `exit ${code} is passed through untouched`)
    }
    const timeout = Object.assign(new Error('Command timed out after 1200000 milliseconds'), { timedOut: true })
    assert.equal(publicationCommitError(timeout), timeout, 'a helper that never reported is not a refusal')
    assert.equal(publicationCommitError(new Error('spawn bash ENOENT')) instanceof PublicationRefusedError, false)
  })

  await check('classification contract: commit-run.sh exits with that code exactly at its catalogue gate', () => {
    const script = fs.readFileSync(path.join(REPO_ROOT, 'scripts', 'commit-run.sh'), 'utf8')
    const gate = /validate_data_catalogue\.py" --repo "\$TOP" --index\nCATALOGUE_STATUS=\$\?\n([\s\S]*?)\nfi\n\n/.exec(script)
    assert.ok(gate, 'the shape of the pre-commit catalogue gate in scripts/commit-run.sh changed: re-verify that ONLY '
      + 'the validator\'s FAIL status reaches the reserved refusal exit code, then update this pattern')
    assert.match(
      gate![1],
      new RegExp(`if \\[ "\\$CATALOGUE_STATUS" -eq 1 \\]; then\\n[^\\n]*\\n\\s*exit ${COMMIT_RUN_REFUSED_EXIT_CODE}\\n\\s*fi\\n`),
      'only the validator\'s own FAIL verdict (status 1) may exit with the code the supervisor treats as a refusal',
    )
    assert.match(gate![1], /\n\s*exit 5$/, 'a validator that never ran stays a generic, retryable failure')
    // Anywhere on a non-comment line, including the script's inline `|| { …; exit N; }` form.
    const refusalExits = script.split('\n')
      .filter((line) => !/^\s*#/.test(line) && new RegExp(`\\bexit\\s+${COMMIT_RUN_REFUSED_EXIT_CODE}\\b`).test(line))
    assert.equal(refusalExits.length, 1, 'no other commit-run.sh failure may borrow the refusal exit code')
  })

  // Any OTHER place the supervisor invokes the catalogue validator is a second source of the same
  // deterministic verdict (#709 adds one ahead of snapshot sealing). Whichever change lands second must make
  // it throw the typed refusal for the validator's FAIL status, or that refusal would be recorded as the
  // transient `publication_failed` and auto-resumed again. Armed on the validator's name rather than on a
  // function name, so a rename or a move cannot disarm it.
  {
    const name = 'classification contract: every supervisor-side catalogue gate throws the typed refusal on a FAIL verdict'
    const srcDir = path.join(REPO_ROOT, 'ui', 'server', 'src')
    const gates = fs.readdirSync(srcDir).filter((f) => f.endsWith('.ts')).flatMap((file) => {
      const source = fs.readFileSync(path.join(srcDir, file), 'utf8')
      const found: { file: string; window: string }[] = []
      for (let at = source.indexOf('validate_data_catalogue.py'); at >= 0; at = source.indexOf('validate_data_catalogue.py', at + 1)) {
        const lineStart = source.lastIndexOf('\n', at) + 1
        if (/^\s*(\/\/|\*|\/\*)/.test(source.slice(lineStart, at))) continue // a mention in a comment is not a gate
        found.push({ file, window: source.slice(Math.max(0, at - 1500), at + 1500) })
      }
      return found
    })
    if (gates.length === 0) {
      skip(name, 'no supervisor-side validator invocation exists in ui/server/src yet; scripts/commit-run.sh (pinned above) is the only live gate')
    } else {
      await check(name, () => {
        for (const gate of gates) {
          assert.match(gate.window, /new PublicationRefusedError\(/,
            `${gate.file}: a catalogue FAIL verdict must be thrown as PublicationRefusedError (see launcher.ts)`)
          assert.match(gate.window, /\.status\s*[!=]==\s*1\b/,
            `${gate.file}: only the validator's FAIL status (1) is a refusal; a timeout or spawn failure proved nothing `
            + 'about the paths and must stay a plain, transient Error. Any other deterministic refusal at the same '
            + 'gate (for example a snapshot entry limit) must throw the typed refusal too.')
        }
      })
    }
  }

  // ---- the two production joints, driven for real ---------------------------------------------------------
  await check('production joints: the real committer types the refusal and the real close step records it', async () => {
    const root = `analyses/ZZPUBREFDRAIN_${Date.now()}`
    cleanupDirs.push(path.join(REPO_ROOT, root))
    fs.mkdirSync(path.join(REPO_ROOT, root, 'reviews'), { recursive: true })
    for (const [label, exitCode, stderr, expectedRefused] of [
      ['refused', COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR, true],
      ['transient', 4, PUSH_STDERR, false],
    ] as const) {
      // Reviews are append-only: each attempt publishes its own new file, written after its run exists.
      const relative = `${root}/reviews/2099-01-03_${label}_review.json`
      const run = createRun({
        kind: 'review', ticker: 'ZZPUBREFDRAIN', provider: 'claude', ...PROFILES.claude, prompt: '', user: 'test',
        userVia: 'local', runRoot: root, willCommitToMain: true,
        writeTargetsAbs: [path.dirname(path.join(REPO_ROOT, relative))], coveredModules: [], readDepsAbs: [],
        closeWatcher: undefined, expected: new Map(),
      })
      run.publicationToken = randomUUID()
      beginExecutionAttempt(run)
      fs.writeFileSync(path.join(REPO_ROOT, relative), `{"verdict":"${label} fixture"}\n`)
      // commitRunCommitter IS the production committer; only the helper script it runs is a stand-in.
      const priorCommitter = __setSupervisorCommitter(commitRunCommitter(fakeCommitRun(exitCode, stderr)))
      const priorVerifier = __setSupervisorCommitVerifier(async () => {})
      try {
        await queuePublicationIntent(run.runId, run.publicationToken, {
          phase: 'commit', message: `${label} fixture`, pathspecs: [relative],
        })
        const failure = await drainPublicationForClose(run)
        assert.ok(failure, `${label}: the close step must report the failure`)
        assert.equal(run.publicationRefused, expectedRefused, `${label}: class recorded on the run`)
        assert.equal(run.publicationError, failure)
        assert.equal(run.publicationPhase, 'terminal-failed')
        assert.equal(run.publicationToken, undefined, `${label}: the publication capability is retired`)
        if (expectedRefused) assert.equal(failure, CATALOGUE_STDERR)
      } finally {
        __setSupervisorCommitter(priorCommitter)
        __setSupervisorCommitVerifier(priorVerifier)
        finishRun(run, 'error')
      }
    }
  })

  await check('production joints: the close handler and the default committer are wired to those functions', () => {
    const launcher = fs.readFileSync(path.join(REPO_ROOT, 'ui', 'server', 'src', 'launcher.ts'), 'utf8')
    assert.match(launcher, /let supervisorCommitter: SupervisorCommitter = commitRunCommitter\(\)/,
      'production must publish through commitRunCommitter — the function whose catch types a refusal')
    assert.match(launcher, /publicationDrainError = await drainPublicationForClose\(run\)/,
      'the close handler must drain through drainPublicationForClose — the step that records the refusal class')
    assert.equal(launcher.split('await drainPublicationIntents(run)').length - 1, 1,
      'drainPublicationIntents is awaited in exactly one place: inside drainPublicationForClose')
  })

  // ---- the single finalizer: distinct durable reason, identical for both providers (doctrine §30) --------
  const refusedRoots: Partial<Record<RunProvider, string>> = {}
  for (const provider of ['claude', 'codex'] as const) {
    await check(`finalize (${provider}): a refused publication is recorded as publication_refused and still shows why`, () => {
      const { run, events, runRoot } = mkMaster(provider, `ZZPUBREF${provider.toUpperCase()}`)
      refusedRoots[provider] = runRoot
      recordPublicationFailure(run, commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR))
      finalizeRunOnClose(run, { failed: true, exitCode: 5 }, '')
      assert.equal(run.status, 'error')
      const event = events.find((e) => e.type === 'run-error') as any
      assert.equal(event?.reason, PUBLICATION_REFUSED_REASON)
      assert.match(String(run.note), /^publication_refused: /)
      assert.match(String(run.note), /resume it manually/i, 'the Activity row says a human is needed')
      assert.match(String(event?.message), /resume it manually/i)
      const marker = readRunMarker(runRoot, '.interrupted')
      assert.equal(marker?.reason, PUBLICATION_REFUSED_REASON, 'the durable marker carries the distinct reason')
      // The fixture carries a 4,000-character provider closing message. Both 2,000-character surfaces must
      // still hold the cause the notice refers to, and the notice itself.
      for (const [surface, text] of [
        ['.interrupted', String(marker?.message)],
        ['RUN_FAILURE.md', fs.readFileSync(path.join(REPO_ROOT, runRoot, 'RUN_FAILURE.md'), 'utf8')],
      ] as const) {
        assert.match(text, /DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data: analyses\/X_2099-01-01\/stray\.json/,
          `${surface}: the cause survives a long provider message`)
        assert.match(text, /Fix the cause shown above, then resume it manually\./, `${surface}: the notice survives`)
        assert.ok(text.indexOf('DATA-CATALOGUE: FAIL') < text.indexOf('Fix the cause shown above'),
          `${surface}: the cause really is above the notice`)
      }
      assert.ok(fs.existsSync(path.join(REPO_ROOT, runRoot, 'final_thesis.md')), 'authored work is retained')
    })

    await check(`finalize (${provider}): a transient publication failure keeps the auto-resumable reason`, () => {
      const { run, events, runRoot } = mkMaster(provider, `ZZPUBTRN${provider.toUpperCase()}`)
      recordPublicationFailure(run, commitRunExit(4, PUSH_STDERR))
      finalizeRunOnClose(run, { failed: true, exitCode: 5 }, '')
      assert.equal((events.find((e) => e.type === 'run-error') as any)?.reason, 'publication_failed')
      assert.equal(readRunMarker(runRoot, '.interrupted')?.reason, 'publication_failed')
      assert.doesNotMatch(String(run.note), /resume it manually/i)
      const item = listResumableResearchRuns(new Set(), now).find((r) => r.runRoot === runRoot)
      assert.ok(item, 'a transient publication failure stays in the supervisor queue')
      assert.equal(item!.provider, provider, 'its interruption authority is sealed for this exact provider')
      assert.equal(isResumeDue(item!, now), true, 'and is due immediately, exactly as before')
    })
  }

  await check('finalize: a very long refusal explanation is bounded so the notice is never pushed out', () => {
    const { run, runRoot } = mkMaster('claude', 'ZZPUBREFLONG')
    const long = `DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data: ${'analyses/X_2099-01-01/some/deep/uncatalogued-artifact.json, '.repeat(80)}`
    recordPublicationFailure(run, publicationCommitError(execaExit(COMMIT_RUN_REFUSED_EXIT_CODE, long)))
    finalizeRunOnClose(run, { failed: true, exitCode: 5 }, '')
    const message = String(readRunMarker(runRoot, '.interrupted')?.message)
    assert.match(message, /DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data/)
    assert.match(message, /resume it manually\.$/)
  })

  await check('finalize: a clean exit that never published is refused only when the supervisor refused it', () => {
    const refused = mkMaster('claude', 'ZZPUBREFCLEAN')
    recordPublicationFailure(refused.run, commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR))
    finalizeRunOnClose(refused.run, { exitCode: 0 }, '')
    assert.equal(readRunMarker(refused.runRoot, '.interrupted')?.reason, PUBLICATION_REFUSED_REASON)

    const silent = mkMaster('claude', 'ZZPUBNOREQ')
    silent.run.publicationRequested = false
    finalizeRunOnClose(silent.run, { exitCode: 0 }, '')
    assert.equal(readRunMarker(silent.runRoot, '.interrupted')?.reason, 'publication_failed',
      'a provider that never asked to publish may succeed on its next attempt: not a deterministic refusal')
  })

  // The terminal-proof branch outranks the publication branch in the finalizer. Before the fix a refusal whose
  // close also saw a surviving process-group member was recorded under the auto-resumable proof reason.
  await check('finalize: a refusal is still recorded when the close also fails its terminal proof', () => {
    const { run, events, runRoot } = mkMaster('claude', 'ZZPUBREFPROOF')
    recordPublicationFailure(run, commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR))
    finalizeRunOnClose(run, { failed: true, exitCode: 5 }, '', {
      ok: false, reason: 'descendant_process_survived_close', message: 'a detached helper outlived the provider leader',
    })
    assert.equal(run.status, 'incomplete')
    const marker = readRunMarker(runRoot, '.interrupted')
    assert.equal(marker?.reason, PUBLICATION_REFUSED_REASON)
    assert.match(String(marker?.message), /DATA-CATALOGUE: FAIL/)
    assert.match(String(marker?.message), /a detached helper outlived the provider leader/, 'the second fact is kept too')
    assert.equal((events.find((e) => e.type === 'run-error') as any)?.reason, PUBLICATION_REFUSED_REASON)
    assert.match(String(run.note), /resume it manually/i)

    const plain = mkMaster('claude', 'ZZPUBPROOFONLY')
    plain.run.publicationCompleted = true
    finalizeRunOnClose(plain.run, { exitCode: 0 }, '', { ok: false, reason: 'descendant_process_survived_close', message: 'm' })
    assert.equal(readRunMarker(plain.runRoot, '.interrupted')?.reason, 'descendant_process_survived_close',
      'without a refusal the proof reason is recorded exactly as before')
  })

  // `.interrupted` is one last-writer-wins file per root, and it is what holds every automatic lane.
  await check('marker: no automatic writer downgrades a refusal, and a refusal always wins over an earlier break', () => {
    const { run, runRoot } = mkMaster('claude', 'ZZPUBREFSIB')
    recordPublicationFailure(run, commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR))
    finalizeRunOnClose(run, { failed: true, exitCode: 5 }, '')
    const refusedBytes = fs.readFileSync(path.join(REPO_ROOT, runRoot, '.interrupted'), 'utf8')
    // A same-wave sibling module of the same chain breaks transiently AFTER the refusal was recorded.
    const sibling = createRun({
      kind: 'module', ticker: 'ZZPUBREFSIB', provider: 'claude', ...PROFILES.claude, prompt: '', user: 'test',
      userVia: 'local', runRoot, willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
      closeWatcher: undefined, expected: new Map(),
    })
    sibling.module = 'valuation'
    sibling.chained = true
    sibling.status = 'running'
    finalizeRunOnClose(sibling, { failed: true, exitCode: 1 }, 'connection reset')
    assert.equal(sibling.status, 'error')
    assert.equal(fs.readFileSync(path.join(REPO_ROOT, runRoot, '.interrupted'), 'utf8'), refusedBytes,
      'the sibling\'s auto-resumable break must not replace the refusal marker byte for byte')

    // The reverse order: this same attempt already sealed an auto-resumable marker (a graceful shutdown during
    // publication) when its refusal is recorded. The stable-bytes rule must not keep the weaker reason.
    const early = mkMaster('claude', 'ZZPUBREFUPG')
    writeInterruptionMarker(early.run, 'supervisor_shutdown', 'The cockpit stopped while this run was active.')
    assert.equal(readRunMarker(early.runRoot, '.interrupted')?.reason, 'supervisor_shutdown')
    recordPublicationFailure(early.run, commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR))
    finalizeRunOnClose(early.run, { failed: true, exitCode: 5 }, '')
    assert.equal(readRunMarker(early.runRoot, '.interrupted')?.reason, PUBLICATION_REFUSED_REASON)
  })

  // ---- both auto-resume queues hold it; the manual projection still offers it ----------------------------
  await check('supervisor queue + browser projection: held from auto-resume, still offered for manual resume', () => {
    const projections = listResumableRuns()
    for (const provider of ['claude', 'codex'] as const) {
      const runRoot = refusedRoots[provider]!
      const queued = listResumableResearchRuns(new Set(), now).find((r) => r.runRoot === runRoot)
      assert.ok(queued, `${provider}: the refused run stays visible to the supervisor`)
      assert.equal(queued!.reason, PUBLICATION_REFUSED_REASON)
      assert.equal(queued!.provider, provider, `${provider}: held by policy, not merely because its provider is unknown`)
      assert.equal(isResumeDue(queued!, now), false, `${provider}: never automatically due`)
      const offered = projections.find((r) => r.runRoot === runRoot && r.kind === 'full')
      assert.ok(offered, `${provider}: a human can still resume it from the cockpit`)
      assert.equal(offered!.reason, PUBLICATION_REFUSED_REASON)
      assert.equal(offered!.autoResumeDue, false, `${provider}: the browser is told not to auto-resume it`)
    }
    const claude = projections.find((r) => r.runRoot === refusedRoots.claude && r.kind === 'full')!
    const codex = projections.find((r) => r.runRoot === refusedRoots.codex && r.kind === 'full')!
    assert.deepEqual(
      { reason: claude.reason, autoResumeDue: claude.autoResumeDue, kind: claude.kind },
      { reason: codex.reason, autoResumeDue: codex.autoResumeDue, kind: codex.kind },
      'Claude and Codex present the identical held state',
    )
  })

  await check('supervisor log: a hold is announced once, and announced again if the same root is refused later', () => {
    const lines: string[] = []
    const original = console.log
    console.log = (...args: unknown[]) => { lines.push(args.join(' ')) }
    try {
      noteManualResumeHold('test\0root', 'ZZNOTE', true)
      noteManualResumeHold('test\0root', 'ZZNOTE', true)
      assert.equal(lines.length, 1, 'one line per hold, not one per five-minute tick')
      assert.match(lines[0], /\[resume\] Needs attention: ZZNOTE's publication was refused/)
      assert.match(lines[0], /resume it manually/)
      noteManualResumeHold('test\0root', 'ZZNOTE', false)
      noteManualResumeHold('test\0root', 'ZZNOTE', true)
      assert.equal(lines.length, 2)
    } finally { console.log = original }
  })

  // ---- the protected full-chain lane: it never consulted the policy and re-paid the master every tick ----
  const chainRecord = (runRoot: string, provider: RunProvider): RecoverableChainIntentRecord => ({
    version: 1, requestId: randomUUID(), subject: path.basename(runRoot).replace(/_\d{4}-\d{2}-\d{2}$/, ''),
    targetRunRoot: runRoot, integritySha256: `sha256:${'0'.repeat(64)}`,
    reviewedPlan: { continuationReceipt: { action: 'continue' } },
    intent: {
      chainId: randomUUID(), user: 'original-requester', userVia: 'local', masterState: 'failed', terminalStatus: null,
      selection: {
        provider, model: PROFILES[provider].model, reasoningLevel: PROFILES[provider].reasoningLevel,
        profileKey: PROFILES[provider].profileKey, executionProfile: PROFILES[provider].executionProfile,
      },
    },
  } as unknown as RecoverableChainIntentRecord)

  const chainDeps = (record: RecoverableChainIntentRecord, calls: Record<string, number>) => {
    const count = (name: string) => { calls[name] = (calls[name] ?? 0) + 1 }
    return {
      withLock: async (_key: string, callback: () => Promise<any>) => { count('withLock'); return callback() },
      readRecord: async () => record,
      usage: async () => { count('usage'); return { ok: true, checked: true } },
      providerAvailable: async () => { count('providerAvailable') },
      live: () => false,
      resolveProfile: () => { count('resolveProfile'); return record.intent.selection },
      revalidatePlan: async () => { count('revalidatePlan'); return record.reviewedPlan },
      reopen: async () => { count('reopen'); return {} as PreparedRunPlanTransaction },
      published: () => false,
      terminalizePublished: async () => { count('terminalizePublished') },
      sanitize: () => { count('sanitize') },
      launchChain: async () => { count('launchChain'); return { runId: 'fixture-run', preflight: { provider: record.intent.selection.provider }, chained: true } as any },
    } as any
  }
  const work = (calls: Record<string, number>) => Object.fromEntries(Object.entries(calls).filter(([name]) => name !== 'withLock'))

  for (const provider of ['claude', 'codex'] as const) {
    await check(`full chain (${provider}): a refused publication is held before usage, sanitation, or a paid master`, async () => {
      const runRoot = refusedRoots[provider]!
      const thesis = path.join(REPO_ROOT, runRoot, 'final_thesis.md')
      const before = fs.readFileSync(thesis, 'utf8')
      const record = chainRecord(runRoot, provider)
      const calls: Record<string, number> = {}
      // No `manualResumeReason` dep is injected: the production reader of the run root's durable marker
      // must be the default, so a caller that forgets the dep cannot lose the hold.
      const outcome = await dispatchRecoverableChainIntent(record, now, chainDeps(record, calls))
      assert.equal(outcome, 'manual_resume_required')
      assert.deepEqual(work(calls), {}, 'no credit probe, plan rebuild, root sanitation, or provider launch happened')
      assert.equal(fs.readFileSync(thesis, 'utf8'), before, 'the authored thesis is not deleted for a doomed retry')
      assert.equal(readRunMarker(runRoot, '.interrupted')?.reason, PUBLICATION_REFUSED_REASON,
        'the hold is durable: the next tick and the next process see the same refusal')
      const again = await dispatchRecoverableChainIntent(record, now + 24 * 3600 * 1000, chainDeps(record, calls))
      assert.equal(again, 'manual_resume_required', 'the hold does not age out into a paid retry')
      assert.deepEqual(work(calls), {})
    })
  }

  await check('full chain: a transient publication failure is still continued automatically', async () => {
    const { run, runRoot } = mkMaster('claude', 'ZZPUBTRNCHAIN')
    recordPublicationFailure(run, commitRunExit(4, PUSH_STDERR))
    finalizeRunOnClose(run, { failed: true, exitCode: 5 }, '')
    const record = chainRecord(runRoot, 'claude')
    const calls: Record<string, number> = {}
    assert.equal(await dispatchRecoverableChainIntent(record, now, chainDeps(record, calls)), 'launched')
    assert.equal(calls.launchChain, 1)
  })

  await check('full chain: a sealed publication is reconciled without spend even if a refusal marker lingers', async () => {
    const runRoot = refusedRoots.claude!
    const record = chainRecord(runRoot, 'claude')
    const calls: Record<string, number> = {}
    const deps = { ...chainDeps(record, calls), published: () => true }
    assert.equal(await dispatchRecoverableChainIntent(record, now, deps), 'completed',
      'a manual resume that published closes the chain; the hold never blocks zero-spend reconciliation')
    assert.equal(calls.terminalizePublished, 1)
    assert.equal(calls.launchChain ?? 0, 0)
  })

  // ---- the explicit human exit from the hold --------------------------------------------------------------
  // The master already wrote its thesis, so the planner calls the saved run complete and the ordinary Continue
  // route answered `already_complete`. On main only the automatic lane ever got past that state; holding that
  // lane without this exit would be a dead end (doctrine §30).
  for (const provider of ['claude', 'codex'] as const) {
    await check(`manual resume (${provider}): a person's Continue re-enters the SAME protected lane with the hold lifted`, async () => {
      const runRoot = refusedRoots[provider]!
      const record = chainRecord(runRoot, provider)
      const calls: Record<string, number> = {}
      const lines: string[] = []
      const original = console.log
      console.log = (...args: unknown[]) => { lines.push(args.join(' ')) }
      let result
      try {
        result = await resumeHeldChainManually({
          subject: record.subject, runRoot, user: 'analyst@example.test',
          selection: {
            provider, model: PROFILES[provider].model, reasoningLevel: PROFILES[provider].reasoningLevel,
            expectedProfileKey: PROFILES[provider].profileKey,
          },
        }, {
          listChains: async () => [record],
          heldReason: (r) => readRunMarker(r.targetRunRoot, '.interrupted')?.reason,
          dispatch: dispatchRecoverableChainIntent,
          chainDeps: chainDeps(record, calls),
        })
      } finally { console.log = original }
      assert.equal(result.kind, 'launched')
      assert.equal((result as any).launch.runId, 'fixture-run', 'the route can answer with the real launch receipt')
      assert.deepEqual(work(calls), { usage: 1, providerAvailable: 1, resolveProfile: 1, revalidatePlan: 1, reopen: 1, sanitize: 1, launchChain: 1 },
        'exactly the automatic lane\'s own recovery steps ran, once, including its credit and provider checks')
      assert.ok(lines.some((line) => /analyst@example\.test manually resumed/.test(line)), 'who lifted the hold is logged')
      assert.equal(readRunMarker(runRoot, '.interrupted')?.reason, PUBLICATION_REFUSED_REASON,
        'lifting the hold for one dispatch does not rewrite the durable record (the launch itself clears it)')
    })
  }

  await check('manual resume: it acts on nothing except a chain held for exactly this reason', async () => {
    const refusedRoot = refusedRoots.claude!
    const record = chainRecord(refusedRoot, 'claude')
    const selection = { provider: 'claude' as const, expectedProfileKey: PROFILES.claude.profileKey }
    const calls: Record<string, number> = {}
    const base = {
      listChains: async () => [record],
      heldReason: (r: RecoverableChainIntentRecord) => readRunMarker(r.targetRunRoot, '.interrupted')?.reason as string | undefined,
      dispatch: dispatchRecoverableChainIntent,
      chainDeps: chainDeps(record, calls),
    }
    assert.deepEqual(await resumeHeldChainManually(
      { subject: record.subject, runRoot: `analyses/${record.subject}_2099-02-02`, user: 'u', selection }, base,
    ), { kind: 'not_held' }, 'a different root of the same subject')
    assert.deepEqual(await resumeHeldChainManually(
      { subject: 'OTHER', runRoot: refusedRoot, user: 'u', selection }, base,
    ), { kind: 'not_held' }, 'a different subject')
    assert.deepEqual(await resumeHeldChainManually(
      { subject: record.subject, runRoot: refusedRoot, user: 'u', selection }, { ...base, listChains: async () => [] },
    ), { kind: 'not_held' }, 'no protected chain owns the root')
    assert.deepEqual(await resumeHeldChainManually(
      { subject: record.subject, runRoot: refusedRoot, user: 'u', selection }, { ...base, heldReason: () => 'publication_failed' },
    ), { kind: 'not_held' }, 'a transient failure is the automatic lane\'s job, not a second launch path')
    assert.deepEqual(work(calls), {}, 'none of those reached a credit probe, a root mutation, or a launch')

    const mismatch = await resumeHeldChainManually({
      subject: record.subject, runRoot: refusedRoot, user: 'u',
      selection: { provider: 'codex', expectedProfileKey: PROFILES.codex.profileKey },
    }, base)
    assert.equal(mismatch.kind, 'profile_mismatch', 'the lane can only continue under the profile it froze at admission')
    assert.equal((mismatch as any).frozen.profileKey, PROFILES.claude.profileKey, 'and the answer names that profile')
    assert.deepEqual(work(calls), {})

    const lockedCalls: Record<string, number> = {}
    await resumeHeldChainManually(
      { subject: record.subject, runRoot: refusedRoot, user: 'u', selection, lockHeld: true },
      { ...base, chainDeps: chainDeps(record, lockedCalls) },
    )
    assert.equal(lockedCalls.withLock ?? 0, 0, 'a caller that already owns the subject lock is not asked to take it twice')
    assert.equal(lockedCalls.launchChain, 1)

    const limited = await resumeHeldChainManually(
      { subject: record.subject, runRoot: refusedRoot, user: 'u', selection },
      { ...base, chainDeps: { ...chainDeps(record, {}), usage: async () => ({ ok: true, checked: false }) } },
    )
    assert.deepEqual(limited, { kind: 'waiting' }, 'a human resume still never spends into unknown plan usage')
  })

  await check('manual resume: the Continue route hands a complete-but-held run to it instead of dead-ending', () => {
    const server = fs.readFileSync(path.join(REPO_ROOT, 'ui', 'server', 'src', 'server.ts'), 'utf8')
    const branch = /if \(plan\.complete\) \{\n([\s\S]*?)\n      \}\n\n      const freshFull/.exec(server)
    assert.ok(branch, 'the plan.complete branch of POST /api/thesis-plan/run changed shape: re-verify the held-chain exit')
    assert.match(branch![1], /await resumeHeldChainManually\(\{[\s\S]*?lockHeld: true,?\s*\}\)/,
      'a held chain must be offered to resumeHeldChainManually (the route already owns the subject lock)')
    assert.ok(branch![1].indexOf('resumeHeldChainManually') < branch![1].lastIndexOf("code: 'already_complete'"),
      'and only what is NOT such a held chain may still answer already_complete')
  })
} finally {
  __setFailureNoteCommitter(previousNoteCommitter)
  __setPostReviewCalibration(previousCalibration)
  cleanup()
}

console.log(`\n${passed} checks passed${skipped ? `, ${skipped} skipped (target not present yet)` : ''}${process.exitCode ? ' (with failures)' : ''}`)
