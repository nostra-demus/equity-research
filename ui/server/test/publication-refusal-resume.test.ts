// A publication the supervisor REFUSES for a reason no retry can change (the data catalogue rejects a path
// in the run root) must never be continued automatically: every automatic continuation of a full chain
// deletes the terminal artifacts and pays for the master synthesizer again, then meets the same refusal
// (CONTRIBUTING.md: no automatic paid retry, no retry loop that hides the cause). A TRANSIENT publication
// failure (push / network / lost race) must keep auto-resuming exactly as before, and an explicit manual
// resume must stay available for both. The two are told apart by a typed error and a distinct durable
// reason — never by reading an error message.
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
  COMMIT_RUN_REFUSED_EXIT_CODE, PublicationRefusedError, publicationCommitError, recordPublicationFailure,
  __setFailureNoteCommitter, __setSupervisorCommitter, __setSupervisorCommitVerifier,
  drainPublicationIntents, finalizeRunOnClose, queuePublicationIntent,
} = await import('../src/launcher')
const { beginExecutionAttempt } = await import('../src/execution-provenance')
const { readRunMarker } = await import('../src/outputs')
const { createRun, finishRun, setActiveSubjectRun } = await import('../src/registry')
const { PUBLICATION_REFUSED_REASON, autoResumeDue, requiresManualResume } = await import('../src/resume-policy')
const { listResumableRuns } = await import('../src/resumable')
const {
  dispatchRecoverableChainIntent, isResumeDue, listResumableResearchRuns,
} = await import('../src/resume-supervisor')
import type { RunState } from '../src/registry'
import type { RunProvider } from '../src/providers/types'
import type { PreparedRunPlanTransaction, RecoverableChainIntentRecord } from '../src/run-plan-transaction'
import type { SseEvent } from '../src/types'

const DATE = '2099-01-01'
const now = Date.now()
const PAST = Math.floor((now - 3600 * 1000) / 1000)

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

/** The terminal master of a chained full run: it wrote its thesis, then publication did not complete. */
function mkMaster(provider: RunProvider, ticker: string): { run: RunState; events: SseEvent[]; runRoot: string } {
  const runRoot = `analyses/${ticker}_${DATE}`
  const abs = path.join(REPO_ROOT, runRoot)
  cleanupDirs.push(abs)
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
  setActiveSubjectRun(run.runId, ticker)
  const events: SseEvent[] = []
  run.subscribers.add({ id: 'publication-refusal-test', send: (e) => events.push(e) })
  return { run, events, runRoot }
}

/** What the production committer throws when commit-run.sh exits with the given code. */
const commitRunExit = (exitCode: number, stderr: string) => publicationCommitError(Object.assign(
  new Error(`Command failed with exit code ${exitCode}: bash scripts/commit-run.sh\n${stderr}`),
  { exitCode, stderr },
))
const CATALOGUE_STDERR = 'DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data: analyses/X_2099-01-01/stray.json\n'
  + 'commit-run: data catalogue rejected the staged publication — nothing was committed or pushed'
const PUSH_STDERR = 'commit-run: data reconciliation lost three remote races; commit abc remains local — retry later'

const cleanupDirs: string[] = [stateDir]
const previousNoteCommitter = __setFailureNoteCommitter(() => { /* never spawn real git from a fixture */ })
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
  })

  // ---- classification: a structured signal, never an error-message match ---------------------------------
  await check('classification: only commit-run.sh\'s dedicated refusal exit code is a deterministic refusal', () => {
    const refused = commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR)
    assert.ok(refused instanceof PublicationRefusedError)
    assert.match(refused.message, /DATA-CATALOGUE: FAIL/, 'the refusal keeps the validator\'s own explanation')
    for (const code of [2, 3, 4, 5]) {
      // Same catalogue TEXT, different exit code: the text must not decide the class.
      assert.equal(commitRunExit(code, CATALOGUE_STDERR) instanceof PublicationRefusedError, false, `exit ${code}`)
    }
    const timeout = Object.assign(new Error('Command timed out after 1200000 milliseconds'), { timedOut: true })
    assert.equal(publicationCommitError(timeout), timeout, 'a helper that never reported is not a refusal')
    assert.equal(publicationCommitError(new Error('spawn bash ENOENT')) instanceof PublicationRefusedError, false)
  })

  await check('classification contract: commit-run.sh exits with that code exactly at its catalogue gate', () => {
    const script = fs.readFileSync(path.join(REPO_ROOT, 'scripts', 'commit-run.sh'), 'utf8')
    const gate = /validate_data_catalogue\.py" --repo "\$TOP" --index\nCATALOGUE_STATUS=\$\?\n([\s\S]*?)\nfi\n\n/.exec(script)
    assert.ok(gate, 'the pre-commit catalogue gate must still exist in scripts/commit-run.sh')
    assert.match(
      gate![1],
      new RegExp(`if \\[ "\\$CATALOGUE_STATUS" -eq 1 \\]; then\\n[^\\n]*\\n\\s*exit ${COMMIT_RUN_REFUSED_EXIT_CODE}\\n\\s*fi\\n`),
      'only the validator\'s own FAIL verdict (status 1) may exit with the code the supervisor treats as a refusal',
    )
    assert.match(gate![1], /\n\s*exit 5$/, 'a validator that could not run stays a generic, retryable failure')
    const refusalExits = script.split('\n')
      .filter((line) => new RegExp(`^\\s*exit ${COMMIT_RUN_REFUSED_EXIT_CODE}\\b`).test(line))
    assert.equal(refusalExits.length, 1, 'no other commit-run.sh failure may borrow the refusal exit code')
  })

  // #709 moves the same catalogue verdict ahead of snapshot sealing, inside launcher.ts. Whichever change
  // lands second must make that gate throw the typed refusal too, or a pre-seal refusal would be recorded
  // as a transient `publication_failed` and auto-resumed again. This fails loudly the moment that function
  // exists un-wired; until then the commit-run.sh contract above is the live gate.
  await check('classification contract: a pre-seal catalogue gate in launcher.ts must throw the typed refusal', () => {
    const launcher = fs.readFileSync(path.join(REPO_ROOT, 'ui', 'server', 'src', 'launcher.ts'), 'utf8')
    const start = launcher.indexOf('function assertPublicationPathsCatalogued(')
    if (start < 0) return
    const body = launcher.slice(start, launcher.indexOf('\n}\n', start))
    assert.match(body, /PublicationRefusedError/,
      'assertPublicationPathsCatalogued must throw PublicationRefusedError when the validator returns its FAIL '
      + 'verdict (exit status 1), and a plain Error when the validator could not run (timeout/spawn failure)')
  })

  // ---- the typed refusal survives the real drain path ----------------------------------------------------
  await check('drain: the typed refusal reaches the close owner unwrapped and is recorded on the run', async () => {
    const root = `analyses/ZZPUBREFDRAIN_${Date.now()}`
    cleanupDirs.push(path.join(REPO_ROOT, root))
    fs.mkdirSync(path.join(REPO_ROOT, root, 'reviews'), { recursive: true })
    for (const [label, thrown, expectedRefused] of [
      ['refused', () => commitRunExit(COMMIT_RUN_REFUSED_EXIT_CODE, CATALOGUE_STDERR), true],
      ['transient', () => commitRunExit(4, PUSH_STDERR), false],
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
      const priorCommitter = __setSupervisorCommitter(async () => { throw thrown() })
      const priorVerifier = __setSupervisorCommitVerifier(async () => {})
      try {
        await queuePublicationIntent(run.runId, run.publicationToken, {
          phase: 'commit', message: `${label} fixture`, pathspecs: [relative],
        })
        let caught: unknown
        try { await drainPublicationIntents(run) } catch (error) { caught = error }
        assert.ok(caught, `${label}: the drain must reject`)
        assert.equal(caught instanceof PublicationRefusedError, expectedRefused, `${label}: error class at the close owner`)
        recordPublicationFailure(run, caught)
        assert.equal(run.publicationRefused, expectedRefused, `${label}: durable run flag`)
        assert.equal(run.publicationError, String((caught as Error).message))
      } finally {
        __setSupervisorCommitter(priorCommitter)
        __setSupervisorCommitVerifier(priorVerifier)
        finishRun(run, 'error')
      }
    }
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
      const marker = readRunMarker(runRoot, '.interrupted')
      assert.equal(marker?.reason, PUBLICATION_REFUSED_REASON, 'the durable marker carries the distinct reason')
      assert.match(String(marker?.message), /DATA-CATALOGUE: FAIL/, 'the cause is kept for the human who must fix it')
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
      assert.equal(isResumeDue(item!, now), true, 'and is due immediately, exactly as before')
    })
  }

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

  // ---- both auto-resume queues hold it; the manual projection still offers it ----------------------------
  await check('supervisor queue + browser projection: held from auto-resume, still offered for manual resume', () => {
    const projections = listResumableRuns()
    for (const provider of ['claude', 'codex'] as const) {
      const runRoot = refusedRoots[provider]!
      const queued = listResumableResearchRuns(new Set(), now).find((r) => r.runRoot === runRoot)
      assert.ok(queued, `${provider}: the refused run stays visible to the supervisor`)
      assert.equal(queued!.reason, PUBLICATION_REFUSED_REASON)
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

  // ---- the protected full-chain lane: it never consulted the policy and re-paid the master every tick ----
  const chainRecord = (runRoot: string, provider: RunProvider): RecoverableChainIntentRecord => ({
    version: 1, requestId: randomUUID(), subject: path.basename(runRoot).replace(/_\d{4}-\d{2}-\d{2}$/, ''),
    targetRunRoot: runRoot, integritySha256: `sha256:${'0'.repeat(64)}`,
    reviewedPlan: { continuationReceipt: { action: 'continue' } },
    intent: {
      chainId: randomUUID(), user: 'test', userVia: 'local', masterState: 'failed', terminalStatus: null,
      selection: {
        provider, model: PROFILES[provider].model, reasoningLevel: PROFILES[provider].reasoningLevel,
        profileKey: PROFILES[provider].profileKey, executionProfile: PROFILES[provider].executionProfile,
      },
    },
  } as unknown as RecoverableChainIntentRecord)

  const chainDeps = (record: RecoverableChainIntentRecord, calls: Record<string, number>) => {
    const count = (name: string) => { calls[name] = (calls[name] ?? 0) + 1 }
    return {
      withLock: async (_key: string, callback: () => Promise<any>) => callback(),
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
      launchChain: async () => { count('launchChain'); return { runId: 'fixture' } as any },
    } as any
  }

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
      assert.deepEqual(calls, {}, 'no credit probe, plan rebuild, root sanitation, or provider launch happened')
      assert.equal(fs.readFileSync(thesis, 'utf8'), before, 'the authored thesis is not deleted for a doomed retry')
      assert.equal(readRunMarker(runRoot, '.interrupted')?.reason, PUBLICATION_REFUSED_REASON,
        'the hold is durable: the next tick and the next process see the same refusal')
      const again = await dispatchRecoverableChainIntent(record, now + 24 * 3600 * 1000, chainDeps(record, calls))
      assert.equal(again, 'manual_resume_required', 'the hold does not age out into a paid retry')
      assert.deepEqual(calls, {})
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
} finally {
  __setFailureNoteCommitter(previousNoteCommitter)
  for (const d of cleanupDirs) fs.rmSync(d, { recursive: true, force: true })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
