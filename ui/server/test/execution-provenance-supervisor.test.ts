process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { REPO_ROOT, STATE_DIR } from '../src/config'
import {
  artifactIsFresh, beginExecutionAttempt, canonicalManifestPath, executionEpochAttemptCount,
  projectionLineageRows, readLastProviderSelection, readProviderInterruptionAuthority, readProviderPreSpawnFailureAuthority,
  recordAdmittedProviderSelection, releaseExecutionEpochAfterPublication,
  sealProviderPreSpawnFailureAuthority,
} from '../src/execution-provenance'
import { createRun, finishRun } from '../src/registry'
import { writeRunMarker } from '../src/outputs'
import {
  __setPostReviewCalibration, __setPublicationAuthoritySealer, __setSupersededPublicationProbe,
  __setSupervisorCommitter, __setSupervisorCommitVerifier,
  SUPERVISOR_CONTROL_MARKERS, supersededPublicationPaths, drainPublicationIntents, finalizeRunOnClose, listReadyPublicationFailures, queuePublicationIntent, recoverReadyPublications, requiresSupervisorPublication,
  supervisePublication, trackedTerminalDeletionDisposition,
} from '../src/launcher'

const resumedDeletion = {
  kind: 'rerun' as const, swarmId: 'research', chained: true,
  runRoot: 'analyses/NU_2026-08-31',
}
assert.equal(trackedTerminalDeletionDisposition(
  resumedDeletion, 'analyses/NU_2026-08-31/valuation/valuation_dossier.md',
), 'restore', 'a resumed run retains older tracked files absent from its saved source')
assert.equal(trackedTerminalDeletionDisposition(
  { ...resumedDeletion, runRoot: 'analyses\\NU_2026-08-31' },
  'analyses\\NU_2026-08-31\\valuation\\valuation_dossier.md',
), 'restore', 'run-root containment is stable across path separators')
assert.equal(trackedTerminalDeletionDisposition(
  resumedDeletion, 'analyses/NU_2026-08-31/RUN_FAILURE.md',
), 'allow', 'the exact stale failure note remains the sole legitimate terminal deletion')
assert.equal(trackedTerminalDeletionDisposition(
  resumedDeletion, 'analyses/OTHER_2026-08-31/valuation/valuation_dossier.md',
), 'forbid', 'a continuation cannot restore or delete another run root')

assert.equal(requiresSupervisorPublication('full'), true)
assert.equal(requiresSupervisorPublication('module'), true)
assert.equal(requiresSupervisorPublication('rerun'), true)
assert.equal(requiresSupervisorPublication('agent'), false)
assert.equal(requiresSupervisorPublication('screener-agent'), false)
assert.equal(requiresSupervisorPublication('parity'), false)
assert.equal(requiresSupervisorPublication('module', 'module'), false,
  'a frozen intermediate child must not enter the terminal publication protocol')
assert.equal(requiresSupervisorPublication('full', 'final'), true,
  'the frozen terminal adjudicator must stamp and verify its decision before success')

// The snapshot sweep drops supervisor control markers, and the pre-seal check refuses anything else the
// data catalogue does not cover. In a RESEARCH run root (analyses/<RUN>/) the catalogue lists exact file
// names, and the two must agree there: a name may be dropped only while the catalogue rejects it. If the
// catalogue ever lists one by name, dropping it would silently withhold catalogued data, so fail here and
// force the decision instead. This says nothing about blanket-glob stores (commodity/runs/**,
// screener/runs/**), which accept any file name; scripts/test_commit_run.py pins that gap on purpose.
assert.ok(SUPERVISOR_CONTROL_MARKERS.size > 0, 'the control-marker guard must never scan an empty set')
for (const marker of SUPERVISOR_CONTROL_MARKERS) {
  const verdict = spawnSync('python3', [
    path.join(REPO_ROOT, 'scripts', 'validate_data_catalogue.py'), '--repo', REPO_ROOT, '--paths',
  ], { cwd: REPO_ROOT, input: `analyses/ZZGUARD_2099-01-01/${marker}`, encoding: 'utf8' })
  assert.equal(verdict.status, 1, `validator must reach a verdict for ${marker}: ${verdict.stderr}`)
  assert.match(verdict.stderr, /has uncatalogued data/,
    `${marker} is excluded from publication as control state, so a research run root must not catalogue it`)
}

// The supervisor applies commit-run.sh's creation-time gate to every NEW analyses/<RUN>/decision_record.json
// before it seals a snapshot, so a fixture that is meant to publish must be a record that gate accepts.
// These three fields are the minimum: the same shape scripts/test_commit_run.py uses for a valid record.
const decisionFixture = (fields: Record<string, unknown>): string => JSON.stringify({
  decision_date: '2099-01-01', data_needs_schema_version: '2.0', data_needs: [], ...fields,
}) + '\n'

const root = `analyses/ZZPROVSUP_${Date.now()}`
const absolute = path.join(REPO_ROOT, root)
const extraCleanup: string[] = []
fs.mkdirSync(absolute, { recursive: true })
fs.writeFileSync(path.join(absolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPROVSUP', version: 1 }))

const profile = { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
const run = createRun({
  kind: 'full', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
  profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test', userVia: 'local',
  runRoot: root, willCommitToMain: true, writeTargetsAbs: [absolute], coveredModules: [], readDepsAbs: [],
  closeWatcher: undefined, expected: new Map(),
})
run.provenanceEpoch = run.runId
run.publicationToken = 'test-supervisor-capability'

try {
  beginExecutionAttempt(run)
  const moduleCanary = createRun({
    kind: 'module', ticker: 'ZZPROVSUP', module: 'business-model', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test', userVia: 'local',
    runRoot: root, willCommitToMain: false, writeTargetsAbs: [absolute], coveredModules: ['business-model'],
    readDepsAbs: [], closeWatcher: undefined, expected: new Map(), parityCanary: true,
  })
  moduleCanary.publicationToken = 'test-module-canary-capability'
  await assert.rejects(
    queuePublicationIntent(moduleCanary.runId, moduleCanary.publicationToken, { phase: 'commit', pathspecs: [root] }),
    /only the terminal full canary may publish/,
    'an intermediate frozen module cannot queue a Git/publication request',
  )
  await assert.rejects(
    supervisePublication(moduleCanary.runId, moduleCanary.publicationToken, { phase: 'stamp', pathspecs: [root] }),
    /only the terminal full canary may publish/,
    'the trusted publication boundary independently rejects an intermediate frozen module',
  )
  finishRun(moduleCanary, 'error')
  await assert.rejects(
    supervisePublication(run.runId, run.publicationToken, {
      phase: 'commit', message: 'forged code publication', pathspecs: ['ui/server/src/server.ts'],
    }),
    /non-data publication pathspec/,
    'a cockpit child cannot use its capability to request a code path',
  )
  assert.equal(artifactIsFresh(run, 'decision_record.json'), false, 'pre-spawn bytes are the freshness baseline')

  // The provider may edit, forge, or delete the historical child-visible manifest. Canonical rows live in
  // supervisor state and remain byte-for-byte independent of it.
  const fake = path.join(absolute, '.execution-provenance.jsonl')
  fs.writeFileSync(fake, JSON.stringify({ provider: 'codex', model: 'forged', decision_author: true }) + '\n')
  const canonical = canonicalManifestPath(run)
  let rows = fs.readFileSync(canonical, 'utf8')
  assert.match(rows, /"provider":"claude"/)
  assert.doesNotMatch(rows, /forged/)
  fs.rmSync(fake, { force: true })
  rows = fs.readFileSync(canonicalManifestPath(run), 'utf8')
  assert.match(rows, /"provider":"claude"/, 'deleting the fake manifest has no effect')

  const insideTarget = path.join(absolute, 'inside-target.json')
  fs.writeFileSync(insideTarget, JSON.stringify({ ticker: 'ZZPROVSUP', forged: 'inside-link' }) + '\n')
  fs.rmSync(path.join(absolute, 'decision_record.json'))
  fs.symlinkSync('inside-target.json', path.join(absolute, 'decision_record.json'))
  await assert.rejects(
    supervisePublication(run.runId, run.publicationToken, {
      phase: 'stamp', message: 'inside symlink', pathspecs: [root],
    }),
    /regular non-symlink file/,
    'a terminal artifact may not redirect to another file inside the repository',
  )

  const outsideTarget = path.join(path.dirname(absolute), `outside-${randomUUID()}.json`)
  fs.writeFileSync(outsideTarget, JSON.stringify({ ticker: 'ZZPROVSUP', forged: 'outside-link' }) + '\n')
  fs.unlinkSync(path.join(absolute, 'decision_record.json'))
  fs.symlinkSync(outsideTarget, path.join(absolute, 'decision_record.json'))
  await assert.rejects(
    supervisePublication(run.runId, run.publicationToken, {
      phase: 'stamp', message: 'outside symlink', pathspecs: [root],
    }),
    /regular non-symlink file/,
    'a terminal artifact may not redirect outside the repository',
  )
  fs.rmSync(outsideTarget, { force: true })
  // unlinkSync, not rmSync: decision_record.json is now a DANGLING symlink (its target was just
  // removed), and rmSync resolves the target, finds nothing and returns as if it had succeeded —
  // leaving the link in place. The surviving symlink then failed the metadata-only assertion below.
  fs.unlinkSync(path.join(absolute, 'decision_record.json'))

  fs.writeFileSync(path.join(absolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPROVSUP', version: 2 }))
  assert.equal(artifactIsFresh(run, 'decision_record.json'), true, 'only current-attempt artifact bytes are publishable')

  const originalAuthor = run.currentExecutionAttempts?.find((row) =>
    row.attribution === 'recorded' && row.decision_author === true)
  assert.ok(originalAuthor, 'the initial terminal process is the recorded decision author')
  const originalBaseline = run.publicationBaselines?.['decision_record.json']
  run.providerAttemptId = randomUUID()
  run.automaticContinuationRetainsDecisionAuthor = true
  beginExecutionAttempt(run)
  assert.equal(run.publicationBaselines?.['decision_record.json'], originalBaseline,
    'an automatic continuation preserves the logical run freshness baseline')
  assert.equal(artifactIsFresh(run, 'decision_record.json'), true,
    'an unchanged decision from the first process remains publishable by its continuation')
  const retainedAuthor = run.executionAttempts?.find((row) =>
    row.attempt_id === originalAuthor?.attempt_id && row.attribution === 'recorded')
  assert.equal(retainedAuthor?.decision_author, true,
    'the process that authored the verdict retains calibration attribution')
  const publicationContinuation = run.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')
  assert.equal(publicationContinuation?.decision_author, false,
    'a publication-only continuation is a recorded contributor, not the decision author')
  assert.deepEqual(publicationContinuation?.decision_artifacts, [],
    'a publication-only continuation does not claim the retained decision artifact')

  const protectedRecoveryRoot = `${root}_protected-recovery`
  const protectedRecoveryAbsolute = path.join(REPO_ROOT, protectedRecoveryRoot)
  extraCleanup.push(protectedRecoveryAbsolute)
  fs.mkdirSync(protectedRecoveryAbsolute, { recursive: true })
  const protectedRecovery = createRun({
    kind: 'full', ticker: 'ZZPROTECTED', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test',
    userVia: 'local', runRoot: protectedRecoveryRoot, willCommitToMain: false,
    writeTargetsAbs: [protectedRecoveryAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
    protectedPriorExecutionAttempts: [{ ...originalAuthor! }],
  })
  beginExecutionAttempt(protectedRecovery)
  const importedProtected = protectedRecovery.executionAttempts?.find((row) =>
    row.attempt_id === originalAuthor?.attempt_id)
  assert.equal(importedProtected?.attribution, 'recorded')
  assert.equal(importedProtected?.decision_author, false,
    'an interrupted prior author is retained as observed lineage but cannot author the replacement verdict')
  assert.deepEqual(importedProtected?.scope, ['live_prior_attempt'])
  assert.equal(protectedRecovery.currentExecutionAttempts?.find((row) =>
    row.attribution === 'recorded')?.decision_author, true,
    'the recovery terminal process authors the replacement verdict')
  finishRun(protectedRecovery, 'error')

  const preSpawnRoot = `${root}_pre-spawn-recovery`
  const preSpawnAbsolute = path.join(REPO_ROOT, preSpawnRoot)
  extraCleanup.push(preSpawnAbsolute)
  fs.mkdirSync(preSpawnAbsolute, { recursive: true })
  const priorObserved = createRun({
    kind: 'full', ticker: 'ZZPRESPAWN', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test',
    userVia: 'local', runRoot: preSpawnRoot, willCommitToMain: false,
    writeTargetsAbs: [preSpawnAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  beginExecutionAttempt(priorObserved)
  finishRun(priorObserved, 'error')
  const failedBeforeSpawn = createRun({
    kind: 'full', ticker: 'ZZPRESPAWN', provider: 'codex',
    executionProfile: { key: 'codex:test', parentModel: 'gpt-test', parentReasoning: 'max' },
    profileKey: 'codex:test', model: 'gpt-test', reasoningLevel: 'max', prompt: '', user: 'test',
    userVia: 'local', runRoot: preSpawnRoot, willCommitToMain: false,
    writeTargetsAbs: [preSpawnAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  recordAdmittedProviderSelection(failedBeforeSpawn)
  assert.equal(readProviderPreSpawnFailureAuthority(preSpawnRoot)?.runId, failedBeforeSpawn.runId,
    'an admitted attempt absent from the protected prior manifest is proven to have failed before spawn')
  writeRunMarker(preSpawnRoot, '.interrupted', {
    reason: 'continuation_spawn_failed', provider: 'codex', model: 'gpt-test', reasoningLevel: 'max',
    profileKey: 'codex:test', runId: failedBeforeSpawn.runId, attemptId: failedBeforeSpawn.runId,
  })
  sealProviderPreSpawnFailureAuthority(preSpawnRoot, failedBeforeSpawn.runId)
  assert.equal(readProviderInterruptionAuthority(preSpawnRoot)?.runId, failedBeforeSpawn.runId,
    'the exact no-process admission can be re-armed without fabricating a provider attempt')
  assert.equal(readProviderPreSpawnFailureAuthority(preSpawnRoot), null,
    'a sealed interruption no longer qualifies through the admitted pre-spawn fallback')
  finishRun(failedBeforeSpawn, 'error')

  const imported = projectionLineageRows({ execution_provenance: {
    provider_mode: 'single_provider', profile_key: 'claude:opus:default',
    contributors: [{ provider: 'claude', model: 'opus', reasoning_level: 'default', attribution: 'recorded', scopes: ['modules'] }],
    cli_versions: { claude: '1.2.3' },
  } }, 'lineage:valuation')
  assert.equal(imported.length, 1)
  assert.equal(imported[0].provider, 'claude')
  assert.equal(imported[0].attribution, 'configured')
  assert.equal(imported[0].decision_author, false)
  const combined = [...imported, ...(run.currentExecutionAttempts ?? [])]
  assert.deepEqual(new Set(combined.map((row) => row.provider)), new Set(['claude']))
  const codexCurrent = (run.currentExecutionAttempts ?? []).map((row) => ({ ...row, provider: 'codex' }))
  assert.deepEqual(new Set([...imported, ...codexCurrent].map((row) => row.provider)), new Set(['claude', 'codex']),
    'a Claude source continued by Codex remains mixed rather than crediting the finisher')

  const epoch = randomUUID()
  const siblingRoot = `${root}_siblings`
  fs.mkdirSync(path.join(REPO_ROOT, siblingRoot), { recursive: true })
  const sibling = (module: string) => ({
    ...run, runId: randomUUID(), kind: 'module' as const, module, agent: undefined,
    runRoot: siblingRoot,
    provenanceEpoch: epoch, chainId: epoch, publicationCompleted: false,
    executionAttempts: undefined, currentExecutionAttempts: undefined, publicationBaselines: undefined,
  })
  const first = sibling('business-model')
  const second = sibling('earnings')
  beginExecutionAttempt(first)
  beginExecutionAttempt(second)
  assert.equal(executionEpochAttemptCount(epoch), 2, 'concurrent siblings share and retain the epoch')
  first.publicationCompleted = true
  releaseExecutionEpochAfterPublication(first)
  assert.equal(executionEpochAttemptCount(epoch), 2, 'an intermediate sibling cannot clear shared lineage')
  const terminal = {
    ...sibling('master'), kind: 'rerun' as const, agent: 'synthesizer', publicationCompleted: true,
  }
  beginExecutionAttempt(terminal)
  assert.equal(executionEpochAttemptCount(epoch), 3)
  releaseExecutionEpochAfterPublication(terminal)
  assert.equal(executionEpochAttemptCount(epoch), 0, 'terminal publication releases the long-lived epoch')

  // Quota/error continuations can accumulate several attempts in one root before any terminal receipt
  // exists. Every supervisor-observed contributor must survive: Claude -> Codex -> Claude cannot forget
  // the first provider merely because a later attempt overwrote the live root slot.
  const retryRoot = `${root}_quota-chain`
  extraCleanup.push(path.join(REPO_ROOT, retryRoot))
  fs.mkdirSync(path.join(REPO_ROOT, retryRoot, 'business-model'), { recursive: true })
  const attempt = (provider: 'claude' | 'codex') => ({
    ...run,
    runId: randomUUID(),
    provider,
    model: provider === 'claude' ? 'sonnet' : 'gpt-5.6-sol',
    reasoningLevel: provider === 'claude' ? 'default' : 'max',
    profileKey: provider === 'claude' ? 'claude:sonnet:default' : 'codex:gpt-5.6-sol:max',
    executionProfile: provider === 'claude' ? profile : {
      key: 'codex:gpt-5.6-sol:max', parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
    },
    runRoot: retryRoot,
    provenanceEpoch: randomUUID(),
    executionAttempts: undefined,
    currentExecutionAttempts: undefined,
    publicationBaselines: undefined,
  })
  const quotaClaude = attempt('claude')
  beginExecutionAttempt(quotaClaude)
  const quotaClaudeAttemptId = quotaClaude.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')?.attempt_id
  fs.writeFileSync(path.join(REPO_ROOT, retryRoot, 'business-model', '01_retained.md'), '# retained before quota stop\n')
  const quotaCodex = attempt('codex')
  beginExecutionAttempt(quotaCodex)
  const quotaCodexAttemptId = quotaCodex.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')?.attempt_id
  const terminalClaude = attempt('claude')
  beginExecutionAttempt(terminalClaude)
  const terminalClaudeAttemptId = terminalClaude.currentExecutionAttempts?.find((row) => row.attribution === 'recorded')?.attempt_id
  const recordedChain = (terminalClaude.executionAttempts ?? []).filter((row) => row.attribution === 'recorded')
  assert.deepEqual(new Set(recordedChain.map((row) => row.attempt_id)),
    new Set([quotaClaudeAttemptId, quotaCodexAttemptId, terminalClaudeAttemptId]),
    'three same-root attempts retain every canonical attempt identity before publication')
  assert.deepEqual(new Set(recordedChain.map((row) => row.provider)), new Set(['claude', 'codex']),
    'retained output across an explicit provider switch remains mixed')
  fs.rmSync(path.join(REPO_ROOT, retryRoot), { recursive: true, force: true })

  // A tracked child can ask to publish while it and detached descendants are still alive, but that request
  // is intent only. Stamping and Git begin exclusively in the close-owned drain after process extinction.
  const deferredRoot = `${root}_deferred-publication`
  const deferredAbsolute = path.join(REPO_ROOT, deferredRoot)
  extraCleanup.push(deferredAbsolute)
  fs.mkdirSync(deferredAbsolute, { recursive: true })
  fs.writeFileSync(path.join(deferredAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZDEFER', version: 1 }))
  fs.writeFileSync(path.join(deferredAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const deferred = createRun({
    kind: 'full', ticker: 'ZZDEFER', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: deferredRoot, willCommitToMain: true,
    writeTargetsAbs: [deferredAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  deferred.publicationToken = randomUUID()
  beginExecutionAttempt(deferred)
  fs.writeFileSync(path.join(deferredAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZDEFER', version: 2 }))
  // The Idea-publication gate is still on disk while the supervisor commits (it is cleared only afterwards),
  // and /research:full publishes the whole run root. The gate is control state the data catalogue rejects:
  // sealed into the snapshot it made a publication no retry could publish (2026-09-17 outage).
  fs.writeFileSync(path.join(deferredAbsolute, '.requires_idea_publication'), '')
  // The resume marker is the same class of control state: a technical-readiness retry preserves it and the
  // `done` path clears it only after publication, so it is on disk while a run-root pathspec is swept.
  writeRunMarker(deferredRoot, '.interrupted', { reason: 'fixture: marker still on disk at publication' })
  let deferredCommits = 0
  const deferredPublishedPaths: string[][] = []
  const deferredCommitter = __setSupervisorCommitter(async (_message, pathspecs) => {
    deferredCommits++
    deferredPublishedPaths.push([...pathspecs])
    return 'COMMIT_SHA=2222222222222222222222222222222222222222'
  })
  const deferredVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    const queued = await queuePublicationIntent(deferred.runId, deferred.publicationToken, {
      phase: 'commit', message: 'deferred fixture', pathspecs: [deferredRoot],
    })
    assert.equal(queued.phase, 'queued')
    assert.equal(deferredCommits, 0, 'child-time request cannot stamp or invoke Git')
    assert.equal(JSON.parse(fs.readFileSync(path.join(deferredAbsolute, 'decision_record.json'), 'utf8')).execution_provenance, undefined)
    await drainPublicationIntents(deferred)
    assert.equal(deferredCommits, 2, 'the close-owned drain publishes the primary bytes then the deterministic SHA backfill')
    assert.ok(deferredPublishedPaths[0].includes(`${deferredRoot}/decision_record.json`))
    assert.deepEqual(deferredPublishedPaths.flat().filter((item) => item.endsWith('.requires_idea_publication')), [],
      'a run-root pathspec never sweeps the supervisor publication gate into the immutable snapshot')
    assert.deepEqual(deferredPublishedPaths.flat().filter((item) => item.endsWith('.interrupted')), [],
      'a run-root pathspec never sweeps the supervisor resume marker into the immutable snapshot')
    assert.equal(fs.existsSync(path.join(deferredAbsolute, '.interrupted')), true,
      'excluding control state from the snapshot never removes it from disk')
    assert.equal(deferred.publicationCompleted, true)
    assert.ok(JSON.parse(fs.readFileSync(path.join(deferredAbsolute, 'decision_record.json'), 'utf8')).execution_provenance)
    assert.doesNotMatch(fs.readFileSync(path.join(deferredAbsolute, 'RUN_METADATA.md'), 'utf8'), /to be filled/)
  } finally {
    __setSupervisorCommitter(deferredCommitter)
    __setSupervisorCommitVerifier(deferredVerifier)
    finishRun(deferred, 'done')
  }

  // A path list the data catalogue rejects must be refused BEFORE it is sealed. Sealed, it becomes an
  // immutable digest-signed receipt that can never publish and is retried at every startup. The real-world
  // instance is an audit artifact such as the human readiness-override trace: it is not control state, so it
  // is not silently excluded, and the catalogue has no entry for it. This fixture uses a neutral name so the
  // test keeps holding whichever way that file's catalogue decision goes. The refusal must land on the live
  // run (still in Activity) and leave nothing behind for recovery to retry.
  const presealRoot = `${root}_preseal-refusal`
  const presealAbsolute = path.join(REPO_ROOT, presealRoot)
  extraCleanup.push(presealAbsolute)
  fs.mkdirSync(presealAbsolute, { recursive: true })
  fs.writeFileSync(path.join(presealAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPRESEAL', version: 1 }))
  fs.writeFileSync(path.join(presealAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const preseal = createRun({
    kind: 'full', ticker: 'ZZPRESEAL', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: presealRoot, willCommitToMain: true,
    writeTargetsAbs: [presealAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  preseal.publicationToken = randomUUID()
  beginExecutionAttempt(preseal)
  fs.writeFileSync(path.join(presealAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZPRESEAL', version: 2 }))
  fs.writeFileSync(path.join(presealAbsolute, 'zz_uncatalogued_audit_trace.json'), '{"fixture":true}\n')
  const presealReceipt = path.join(STATE_DIR, 'publication-ready', `${preseal.runId}.json`)
  const snapshotDirectories = () => fs.readdirSync(STATE_DIR).filter((name) => name.startsWith('publication-snapshot-')).sort()
  const snapshotsBefore = snapshotDirectories()
  let presealCommits = 0
  const presealCommitter = __setSupervisorCommitter(async () => {
    presealCommits++
    return 'COMMIT_SHA=6666666666666666666666666666666666666666'
  })
  const presealVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(preseal.runId, preseal.publicationToken, {
      phase: 'commit', message: 'pre-seal refusal fixture', pathspecs: [presealRoot],
    })
    await assert.rejects(
      drainPublicationIntents(preseal),
      (error: any) => /refused before its path list was frozen/.test(String(error?.message))
        && /DATA-CATALOGUE: FAIL/.test(String(error?.message))
        && String(error?.message).includes(`${presealRoot}/zz_uncatalogued_audit_trace.json`),
      'an uncatalogued path fails the live publication and names the file that needs a catalogue decision',
    )
    assert.equal(presealCommits, 0, 'a refused path list never reaches Git')
    assert.equal(fs.existsSync(presealReceipt), false, 'a refused path list is never sealed into a ready receipt')
    assert.deepEqual(snapshotDirectories(), snapshotsBefore, 'a refused path list leaves no protected snapshot behind')
    assert.notEqual(preseal.publicationCompleted, true)
    // Assert on this run's own receipt only: the state directory is shared with every other block here.
    await recoverReadyPublications()
    assert.deepEqual(listReadyPublicationFailures().filter((item) => item.entry === `${preseal.runId}.json`), [],
      'with no receipt there is nothing for startup to retry forever')
    assert.equal(fs.existsSync(path.join(presealAbsolute, 'zz_uncatalogued_audit_trace.json')), true,
      'the audit trace is refused, never deleted or silently dropped')
  } finally {
    __setSupervisorCommitter(presealCommitter)
    __setSupervisorCommitVerifier(presealVerifier)
    finishRun(preseal, 'error')
    // A regression that seals before refusing must not strand a receipt whose run root the cleanup below
    // deletes: the next run's recovery pass would then fail on it on this machine until cleared by hand.
    fs.rmSync(presealReceipt, { force: true })
    for (const name of snapshotDirectories()) {
      if (!snapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // "Anything short of a clean PASS refuses": a validator that cannot reach a verdict must never be read as
  // permission to seal. Shadow python3 with one that exits non-zero and says nothing.
  const blindRelative = `${root}/reviews/2099-01-06_blind_validator_review.json`
  const blindAbsolute = path.join(REPO_ROOT, blindRelative)
  fs.mkdirSync(path.dirname(blindAbsolute), { recursive: true })
  const blindRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(blindAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  blindRun.publicationToken = randomUUID()
  beginExecutionAttempt(blindRun)
  fs.writeFileSync(blindAbsolute, '{"verdict":"a catalogued path the validator never gets to judge"}\n')
  const blindReceipt = path.join(STATE_DIR, 'publication-ready', `${blindRun.runId}.json`)
  const shimDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'blind-validator-'))
  fs.writeFileSync(path.join(shimDirectory, 'python3'), '#!/bin/sh\nexit 3\n', { mode: 0o755 })
  const originalPath = process.env.PATH
  let blindCommits = 0
  const blindCommitter = __setSupervisorCommitter(async () => {
    blindCommits++
    return 'COMMIT_SHA=9999999999999999999999999999999999999999'
  })
  const blindVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(blindRun.runId, blindRun.publicationToken, {
      phase: 'commit', message: 'blind validator fixture', pathspecs: [blindRelative],
    })
    process.env.PATH = `${shimDirectory}${path.delimiter}${originalPath ?? ''}`
    await assert.rejects(drainPublicationIntents(blindRun), /refused before its path list was frozen/,
      'a validator that cannot reach a verdict refuses the publication instead of waving it through')
    assert.equal(blindCommits, 0)
    assert.equal(fs.existsSync(blindReceipt), false, 'an unchecked path list is never sealed')
  } finally {
    process.env.PATH = originalPath
    __setSupervisorCommitter(blindCommitter)
    __setSupervisorCommitVerifier(blindVerifier)
    finishRun(blindRun, 'error')
    fs.rmSync(blindReceipt, { force: true })
    fs.rmSync(shimDirectory, { recursive: true, force: true })
  }

  // commit-run.sh refuses a supervisor snapshot manifest above 512 entries, and no retry changes a sealed
  // list's length. Every file here is catalogued (analyses/*/*.md), so only the count can refuse it.
  const crowdedRoot = `${root}_crowded`
  const crowdedAbsolute = path.join(REPO_ROOT, crowdedRoot)
  extraCleanup.push(crowdedAbsolute)
  fs.mkdirSync(crowdedAbsolute, { recursive: true })
  fs.writeFileSync(path.join(crowdedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZCROWD', version: 1 }))
  fs.writeFileSync(path.join(crowdedAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const crowded = createRun({
    kind: 'full', ticker: 'ZZCROWD', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: crowdedRoot, willCommitToMain: true,
    writeTargetsAbs: [crowdedAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  crowded.publicationToken = randomUUID()
  beginExecutionAttempt(crowded)
  fs.writeFileSync(path.join(crowdedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZCROWD', version: 2 }))
  for (let index = 0; index < 512; index++) fs.writeFileSync(path.join(crowdedAbsolute, `note-${index}.md`), 'x\n')
  const crowdedReceipt = path.join(STATE_DIR, 'publication-ready', `${crowded.runId}.json`)
  const crowdedSnapshotsBefore = snapshotDirectories()
  let crowdedCommits = 0
  const crowdedCommitter = __setSupervisorCommitter(async () => {
    crowdedCommits++
    return 'COMMIT_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  })
  const crowdedVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(crowded.runId, crowded.publicationToken, {
      phase: 'commit', message: 'crowded fixture', pathspecs: [crowdedRoot],
    })
    await assert.rejects(drainPublicationIntents(crowded), /exceed the 512-entry limit/,
      'a path list commit-run.sh is certain to refuse is never sealed')
    assert.equal(crowdedCommits, 0)
    assert.equal(fs.existsSync(crowdedReceipt), false)
  } finally {
    __setSupervisorCommitter(crowdedCommitter)
    __setSupervisorCommitVerifier(crowdedVerifier)
    finishRun(crowded, 'error')
    fs.rmSync(crowdedReceipt, { force: true })
    for (const name of snapshotDirectories()) {
      if (!crowdedSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // commit-run.sh has a second deterministic gate after staging: `eval.py --data-needs-prewrite` on every
  // newly staged analyses/<RUN>/decision_record.json (exit 5). The command prompts run it before asking to
  // publish, but the model is not the boundary. Sealed, a record that fails it is rejected identically at
  // every startup retry, so the supervisor must ask the same gate about the FROZEN bytes before sealing.
  // The committer is mocked here, so without the pre-seal check nothing in this suite would refuse it.
  const gateRoot = `${root}_decision-gate-refusal`
  const gateAbsolute = path.join(REPO_ROOT, gateRoot)
  extraCleanup.push(gateAbsolute)
  fs.mkdirSync(gateAbsolute, { recursive: true })
  fs.writeFileSync(path.join(gateAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZGATE', version: 1 }))
  fs.writeFileSync(path.join(gateAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const gateRun = createRun({
    kind: 'full', ticker: 'ZZGATE', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: gateRoot, willCommitToMain: true,
    writeTargetsAbs: [gateAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  gateRun.publicationToken = randomUUID()
  beginExecutionAttempt(gateRun)
  // Every path here is catalogued, so the path-list check above passes: only the record's CONTENT is wrong.
  fs.writeFileSync(path.join(gateAbsolute, 'decision_record.json'),
    decisionFixture({ ticker: 'ZZGATE', version: 2, data_needs: 'not-an-array' }))
  const gateReceipt = path.join(STATE_DIR, 'publication-ready', `${gateRun.runId}.json`)
  const gateSnapshotsBefore = snapshotDirectories()
  // Interpose on the gate only, to record what the supervisor handed it; everything else (the catalogue
  // validator, the gate's own eval.py call) reaches the real interpreter untouched.
  const realPython = spawnSync('python3', ['-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' }).stdout.trim()
  assert.ok(path.isAbsolute(realPython), 'the fixture needs the real interpreter to delegate to')
  const gateShimDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'decision-gate-tap-'))
  const gateStdinLog = path.join(gateShimDirectory, 'gate-stdin')
  fs.writeFileSync(path.join(gateShimDirectory, 'python3'), [
    '#!/bin/sh',
    'case "${1:-}" in',
    `  */decision_publication_gate.py) cat > '${gateStdinLog}'; exec '${realPython}' "$@" < '${gateStdinLog}' ;;`,
    'esac',
    `exec '${realPython}' "$@"`,
    '',
  ].join('\n'), { mode: 0o755 })
  const gateOriginalPath = process.env.PATH
  let gateCommits = 0
  const gateCommitter = __setSupervisorCommitter(async () => {
    gateCommits++
    return 'COMMIT_SHA=7777777777777777777777777777777777777777'
  })
  const gateVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(gateRun.runId, gateRun.publicationToken, {
      phase: 'commit', message: 'decision gate refusal fixture', pathspecs: [gateRoot],
    })
    process.env.PATH = `${gateShimDirectory}${path.delimiter}${gateOriginalPath ?? ''}`
    await assert.rejects(
      drainPublicationIntents(gateRun),
      (error: any) => /refused before its frozen snapshot was sealed/.test(String(error?.message))
        && /DATA-NEEDS-PREWRITE: FAIL/.test(String(error?.message))
        && String(error?.message).includes(`${gateRoot}/decision_record.json`),
      'a new decision record commit-run.sh will reject fails the live publication and names the record',
    )
    process.env.PATH = gateOriginalPath
    assert.equal(gateCommits, 0, 'a record the creation-time gate rejects never reaches Git')
    assert.equal(fs.existsSync(gateReceipt), false, 'a rejected record is never sealed into a ready receipt')
    assert.deepEqual(snapshotDirectories(), gateSnapshotsBefore, 'a rejected record leaves no protected snapshot behind')
    assert.notEqual(gateRun.publicationCompleted, true)
    await recoverReadyPublications()
    assert.deepEqual(listReadyPublicationFailures().filter((item) => item.entry === `${gateRun.runId}.json`), [],
      'with no receipt there is nothing for startup to retry forever')
    assert.equal(fs.existsSync(path.join(gateAbsolute, 'decision_record.json')), true,
      'the rejected record is refused, never deleted')
    // The verdict must be about the bytes commit-run.sh will stage. Those are the frozen snapshot files in
    // protected supervisor state, not the run-root file a still-running descendant could rewrite.
    const handed = fs.readFileSync(gateStdinLog, 'utf8').split('\0')
    assert.ok(handed.length >= 2 && handed.length % 2 === 0, 'the gate receives (publication path, bytes file) pairs')
    const handedRecord = handed.indexOf(`${gateRoot}/decision_record.json`)
    assert.ok(handedRecord >= 0 && handedRecord % 2 === 0, 'the decision record is among the publication paths handed over')
    for (let index = 1; index < handed.length; index += 2) {
      assert.ok(handed[index].startsWith(`${path.join(STATE_DIR, 'publication-snapshot-')}`),
        `the gate judges frozen snapshot bytes, never a worktree path: ${handed[index]}`)
    }
  } finally {
    process.env.PATH = gateOriginalPath
    __setSupervisorCommitter(gateCommitter)
    __setSupervisorCommitVerifier(gateVerifier)
    finishRun(gateRun, 'error')
    fs.rmSync(gateReceipt, { force: true })
    fs.rmSync(gateShimDirectory, { recursive: true, force: true })
    for (const name of snapshotDirectories()) {
      if (!gateSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // A gate that cannot reach a verdict is not permission to seal. The blind-validator block above cannot
  // prove this call site: its shim fails the FIRST python3 call (the catalogue). This shim lets the catalogue
  // validator through and silences only the decision gate, which runs for every snapshot. It "says" one
  // blank line: whitespace-only stderr is truthy, and a refusal built from it used to name nothing at all.
  const muteRelative = `${root}/reviews/2099-01-07_mute_gate_review.json`
  const muteAbsolute = path.join(REPO_ROOT, muteRelative)
  fs.mkdirSync(path.dirname(muteAbsolute), { recursive: true })
  const muteRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(muteAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  muteRun.publicationToken = randomUUID()
  beginExecutionAttempt(muteRun)
  fs.writeFileSync(muteAbsolute, '{"verdict":"a catalogued review the decision gate never gets to judge"}\n')
  const muteReceipt = path.join(STATE_DIR, 'publication-ready', `${muteRun.runId}.json`)
  const muteSnapshotsBefore = snapshotDirectories()
  const muteShimDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'decision-gate-mute-'))
  fs.writeFileSync(path.join(muteShimDirectory, 'python3'), [
    '#!/bin/sh',
    'case "${1:-}" in */decision_publication_gate.py) echo "" >&2; exit 3 ;; esac',
    `exec '${realPython}' "$@"`,
    '',
  ].join('\n'), { mode: 0o755 })
  let muteCommits = 0
  const muteCommitter = __setSupervisorCommitter(async () => {
    muteCommits++
    return 'COMMIT_SHA=8888888888888888888888888888888888888888'
  })
  const muteVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(muteRun.runId, muteRun.publicationToken, {
      phase: 'commit', message: 'mute decision gate fixture', pathspecs: [muteRelative],
    })
    process.env.PATH = `${muteShimDirectory}${path.delimiter}${gateOriginalPath ?? ''}`
    await assert.rejects(
      drainPublicationIntents(muteRun),
      // The size limit shares this prefix, so the prefix alone would not show WHICH check refused. The
      // detail must fall back to the failed command, which names the gate script.
      (error: any) => /refused before its frozen snapshot was sealed: \S/.test(String(error?.message))
        && /decision_publication_gate\.py/.test(String(error?.message)),
      'a decision gate that cannot reach a verdict refuses the publication, and the refusal says what failed',
    )
    assert.equal(muteCommits, 0)
    assert.equal(fs.existsSync(muteReceipt), false, 'an unjudged snapshot is never sealed')
    assert.deepEqual(snapshotDirectories(), muteSnapshotsBefore, 'an unjudged snapshot is not left behind')
  } finally {
    process.env.PATH = gateOriginalPath
    __setSupervisorCommitter(muteCommitter)
    __setSupervisorCommitVerifier(muteVerifier)
    finishRun(muteRun, 'error')
    fs.rmSync(muteReceipt, { force: true })
    fs.rmSync(muteShimDirectory, { recursive: true, force: true })
    for (const name of snapshotDirectories()) {
      if (!muteSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // commit-run.sh's snapshot staging also refuses one file above 128 MiB, and no retry shrinks a sealed file.
  // The file is sparse: the refusal comes from its stat, so nothing of that size is read, copied or written
  // by this test. (The exact boundary is not pinned, because a file AT the limit would be read in full.)
  const oversizedRoot = `${root}_oversized`
  const oversizedAbsolute = path.join(REPO_ROOT, oversizedRoot)
  extraCleanup.push(oversizedAbsolute)
  fs.mkdirSync(oversizedAbsolute, { recursive: true })
  fs.writeFileSync(path.join(oversizedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZHUGE', version: 1 }))
  fs.writeFileSync(path.join(oversizedAbsolute, 'RUN_METADATA.md'), 'Commit SHA: (to be filled after commit)\n')
  const oversized = createRun({
    kind: 'full', ticker: 'ZZHUGE', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: oversizedRoot, willCommitToMain: true,
    writeTargetsAbs: [oversizedAbsolute], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  oversized.publicationToken = randomUUID()
  beginExecutionAttempt(oversized)
  fs.writeFileSync(path.join(oversizedAbsolute, 'decision_record.json'), decisionFixture({ ticker: 'ZZHUGE', version: 2 }))
  fs.writeFileSync(path.join(oversizedAbsolute, 'oversized-note.md'), '')
  fs.truncateSync(path.join(oversizedAbsolute, 'oversized-note.md'), 128 * 1024 * 1024 + 1)
  const oversizedReceipt = path.join(STATE_DIR, 'publication-ready', `${oversized.runId}.json`)
  const oversizedSnapshotsBefore = snapshotDirectories()
  let oversizedCommits = 0
  const oversizedCommitter = __setSupervisorCommitter(async () => {
    oversizedCommits++
    return 'COMMIT_SHA=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
  })
  const oversizedVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(oversized.runId, oversized.publicationToken, {
      phase: 'commit', message: 'oversized fixture', pathspecs: [oversizedRoot],
    })
    await assert.rejects(
      drainPublicationIntents(oversized),
      (error: any) => /refused before its frozen snapshot was sealed/.test(String(error?.message))
        && String(error?.message).includes(`${oversizedRoot}/oversized-note.md`)
        && /above the 134217728-byte limit/.test(String(error?.message)),
      'a file commit-run.sh is certain to refuse is never sealed, and the refusal names it',
    )
    assert.equal(oversizedCommits, 0)
    assert.equal(fs.existsSync(oversizedReceipt), false)
    assert.deepEqual(snapshotDirectories(), oversizedSnapshotsBefore, 'a refused file leaves no protected snapshot behind')
  } finally {
    __setSupervisorCommitter(oversizedCommitter)
    __setSupervisorCommitVerifier(oversizedVerifier)
    finishRun(oversized, 'error')
    fs.rmSync(oversizedReceipt, { force: true })
    for (const name of snapshotDirectories()) {
      if (!oversizedSnapshotsBefore.includes(name)) fs.rmSync(path.join(STATE_DIR, name), { recursive: true, force: true })
    }
  }

  // Once the provider group is extinct, a Git/push failure retains a protected immutable ready receipt.
  // A restart retries that exact snapshot without launching either provider or trusting mutable HEAD.
  const recoveryRelative = `${root}/reviews/2099-01-03_recovery_review.json`
  const recoveryAbsolute = path.join(REPO_ROOT, recoveryRelative)
  fs.mkdirSync(path.dirname(recoveryAbsolute), { recursive: true })
  const recoveryRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(recoveryAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  recoveryRun.publicationToken = randomUUID()
  beginExecutionAttempt(recoveryRun)
  fs.writeFileSync(recoveryAbsolute, '{"verdict":"ready recovery fixture"}\n')
  const failedRecoveryCommitter = __setSupervisorCommitter(async () => { throw new Error('fixture push failed') })
  const recoveryVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(recoveryRun.runId, recoveryRun.publicationToken, {
      phase: 'commit', message: 'ready recovery fixture', pathspecs: [recoveryRelative],
    })
    await assert.rejects(drainPublicationIntents(recoveryRun), /fixture push failed/)
    let retried = 0
    const retryCommitter = __setSupervisorCommitter(async () => {
      retried++
      return 'COMMIT_SHA=3333333333333333333333333333333333333333'
    })
    try {
      assert.equal(await recoverReadyPublications(), 1)
      assert.equal(retried, 1, 'providerless recovery publishes the one protected snapshot exactly once')
      assert.equal(await recoverReadyPublications(), 0, 'a cleared ready receipt cannot replay')
    } finally { __setSupervisorCommitter(retryCommitter) }
  } finally {
    __setSupervisorCommitter(failedRecoveryCommitter)
    __setSupervisorCommitVerifier(recoveryVerifier)
    finishRun(recoveryRun, 'error')
  }

  // A retained receipt commits the OLD bytes frozen when it was sealed. The live path keeps admitting runs
  // while a receipt is retained, and /research:rerun writes into the latest existing run root, so a newer run
  // can publish the same paths before the old receipt is retried. Retrying it then reverts published
  // research to stale bytes. A superseded receipt must commit nothing, stay on disk, and be reported.
  const supersededRelative = `${root}/reviews/2099-01-05_superseded_review.json`
  const supersededAbsolute = path.join(REPO_ROOT, supersededRelative)
  const supersededRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(supersededAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  supersededRun.publicationToken = randomUUID()
  beginExecutionAttempt(supersededRun)
  fs.writeFileSync(supersededAbsolute, '{"verdict":"sealed before a newer run published this path"}\n')
  const supersededReceipt = path.join(STATE_DIR, 'publication-ready', `${supersededRun.runId}.json`)
  const supersededFailedCommitter = __setSupervisorCommitter(async () => { throw new Error('fixture push failed') })
  const supersededVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    await queuePublicationIntent(supersededRun.runId, supersededRun.publicationToken, {
      phase: 'commit', message: 'superseded fixture', pathspecs: [supersededRelative],
    })
    await assert.rejects(drainPublicationIntents(supersededRun), /fixture push failed/)
    assert.equal(fs.existsSync(supersededReceipt), true, 'the failed live commit retained its sealed receipt')
    const sealedAt = JSON.parse(fs.readFileSync(supersededReceipt, 'utf8')).created_at as string
    const snapshotDirectory = path.dirname(JSON.parse(fs.readFileSync(supersededReceipt, 'utf8')).snapshot_manifest)

    let staleCommits = 0
    const staleCommitter = __setSupervisorCommitter(async () => {
      staleCommits++
      return 'COMMIT_SHA=7777777777777777777777777777777777777777'
    })
    const probed: Array<{ entries: Array<{ path: string; snapshot: string }>; sealedAt: string; ownCommit?: string }> = []
    // The real probe reads git history, and this suite runs inside the real checkout where a test must never
    // create commits. It is covered against a throwaway repository in publication-supersession.test.ts.
    const realProbe = __setSupersededPublicationProbe((input) => {
      probed.push(input)
      return [{ path: supersededRelative, commit: '8'.repeat(40), committedAt: Math.floor(Date.parse(sealedAt) / 1000) + 600 }]
    })
    assert.equal(realProbe, supersededPublicationPaths,
      'production recovery is wired to the real git probe, not to a stub that always answers "not superseded"')
    try {
      assert.equal(await recoverReadyPublications(), 0, 'a superseded receipt is not counted as recovered')
      assert.equal(staleCommits, 0, 'a superseded receipt never reaches Git: its stale bytes must not revert newer ones')
      assert.equal(fs.existsSync(supersededReceipt), true, 'a superseded receipt is retained, never deleted')
      assert.equal(fs.existsSync(snapshotDirectory), true, 'its immutable snapshot is retained with it')
      const reported = listReadyPublicationFailures().filter((item) => item.entry === `${supersededRun.runId}.json`)
      assert.equal(reported.length, 1, 'the refusal is reported through the stuck-publication surface')
      assert.match(reported[0].error, /superseded and was not committed/)
      assert.ok(reported[0].error.includes(supersededRelative), 'the report names the path a newer run published')
      assert.deepEqual(probed.map((input) => [input.entries.map((item) => item.path), input.sealedAt]),
        [[[supersededRelative], sealedAt]],
        "the check is driven by the signed receipt's own path list and creation time, with no new receipt field")
    } finally { __setSupersededPublicationProbe(realProbe) }

    // Once nothing newer stands in the way, the same receipt publishes through the real probe: HEAD has
    // never published this fixture path, so the ordinary first-publication retry is unaffected.
    try {
      assert.equal(await recoverReadyPublications(), 1, 'a receipt that is not superseded still recovers')
      assert.equal(staleCommits, 1)
      assert.equal(fs.existsSync(supersededReceipt), false)
      assert.deepEqual(listReadyPublicationFailures().filter((item) => item.entry === `${supersededRun.runId}.json`), [],
        'a later successful pass clears the report')
    } finally { __setSupervisorCommitter(staleCommitter) }
  } finally {
    __setSupervisorCommitter(supersededFailedCommitter)
    __setSupervisorCommitVerifier(supersededVerifier)
    finishRun(supersededRun, 'error')
    fs.rmSync(supersededReceipt, { force: true })
  }

  // Retained receipts are retried NEWEST FIRST. A recovery commit is stamped "now", not the time its bytes
  // were sealed, so an older receipt retried first makes a newer one that shares a path look superseded by
  // it, and the older bytes win. The real case: a push fails, the run is auto-resumed into the same run root
  // under a new run id, the network is still down, and both receipts are retained. Receipt files are named
  // by random run id, so name order is arbitrary. To make the old name-order deterministic here, the run
  // whose id sorts FIRST is sealed first: name order would retry the OLDER receipt first.
  const orderedRuns = [0, 1].map((index) => {
    const relative = `${root}/reviews/2099-01-07_ordering_${index}_review.json`
    const created = createRun({
      kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
      profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
      userVia: 'local', runRoot: root, willCommitToMain: true,
      writeTargetsAbs: [path.dirname(path.join(REPO_ROOT, relative))], coveredModules: [], readDepsAbs: [],
      closeWatcher: undefined, expected: new Map(),
    })
    created.publicationToken = randomUUID()
    return { run: created, relative }
  }).sort((a, b) => `${a.run.runId}.json`.localeCompare(`${b.run.runId}.json`))
  const [olderSealed, newerSealed] = orderedRuns
  const orderingReceipts = orderedRuns.map(({ run: item }) => path.join(STATE_DIR, 'publication-ready', `${item.runId}.json`))
  const orderingFailedCommitter = __setSupervisorCommitter(async () => { throw new Error('fixture push failed') })
  const orderingVerifier = __setSupervisorCommitVerifier(async () => {})
  try {
    for (const [index, { run: item, relative }] of orderedRuns.entries()) {
      beginExecutionAttempt(item)
      fs.writeFileSync(path.join(REPO_ROOT, relative), `{"verdict":"ordering fixture, sealed ${index === 0 ? 'first' : 'second'}"}\n`)
      await queuePublicationIntent(item.runId, item.publicationToken!, {
        phase: 'commit', message: `ordering fixture sealed ${index === 0 ? 'first' : 'second'}`, pathspecs: [relative],
      })
      await assert.rejects(drainPublicationIntents(item), /fixture push failed/)
      await new Promise((resolve) => setTimeout(resolve, 25)) // created_at has millisecond resolution
    }
    const [olderAt, newerAt] = orderingReceipts.map((file) => Date.parse(JSON.parse(fs.readFileSync(file, 'utf8')).created_at))
    assert.ok(olderAt < newerAt, 'the fixture sealed the name-first receipt strictly earlier')
    const retried: string[] = []
    const orderingCommitter = __setSupervisorCommitter(async (message) => {
      retried.push(message)
      return 'COMMIT_SHA=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    })
    try {
      await recoverReadyPublications()
      assert.deepEqual(retried.filter((message) => message.startsWith('ordering fixture')),
        ['ordering fixture sealed second', 'ordering fixture sealed first'],
        'the newest receipt is retried first, so its bytes publish and an older overlapping receipt is the one refused')
      assert.ok(olderSealed.run.runId < newerSealed.run.runId, 'name order alone would have retried the older receipt first')
    } finally { __setSupervisorCommitter(orderingCommitter) }
  } finally {
    __setSupervisorCommitter(orderingFailedCommitter)
    __setSupervisorCommitVerifier(orderingVerifier)
    for (const { run: item } of orderedRuns) finishRun(item, 'error')
    for (const file of orderingReceipts) fs.rmSync(file, { force: true })
  }

  // Commit verification can succeed and the process can die before the provider/profile publication seal.
  // The ready receipt must still exist at that point. Startup recovers from it without another provider,
  // writes the durable published authority, and only then clears the receipt.
  const postCommitRoot = `${root}_postcommit`
  extraCleanup.push(path.join(REPO_ROOT, postCommitRoot))
  const postCommitRelative = `${postCommitRoot}/reviews/2099-01-04_post_commit_crash_review.json`
  const postCommitAbsolute = path.join(REPO_ROOT, postCommitRelative)
  fs.mkdirSync(path.dirname(postCommitAbsolute), { recursive: true })
  const postCommitRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: postCommitRoot, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(postCommitAbsolute)], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  postCommitRun.publicationToken = randomUUID()
  beginExecutionAttempt(postCommitRun)
  fs.writeFileSync(postCommitAbsolute, '{"verdict":"post-commit crash fixture"}\n')
  let directCommits = 0
  let providerCalls = 0 // this test never invokes launch/build/spawn; recovery is supervisor-only
  const postCommitCommitter = __setSupervisorCommitter(async () => {
    directCommits++
    return 'COMMIT_SHA=4444444444444444444444444444444444444444'
  })
  const postCommitVerifier = __setSupervisorCommitVerifier(async () => {})
  const postCommitSealer = __setPublicationAuthoritySealer(() => {
    throw new Error('fixture crash before publication authority fsync')
  })
  try {
    await queuePublicationIntent(postCommitRun.runId, postCommitRun.publicationToken, {
      phase: 'commit', message: 'post-commit crash fixture', pathspecs: [postCommitRelative],
    })
    await assert.rejects(drainPublicationIntents(postCommitRun), /fixture crash before publication authority fsync/)
    assert.equal(directCommits, 1, 'the immutable snapshot was already verified by Git before the crash')
    assert.equal(postCommitRun.publicationCompleted, false,
      'commit success is provisional until provider/profile publication authority is durable')
    assert.equal(postCommitRun.publicationPhase, 'terminal-failed')
    assert.match(postCommitRun.publicationError ?? '', /publication authority could not be sealed/)
    assert.equal(readLastProviderSelection(postCommitRoot, 'published'), null,
      'the injected crash happened before durable published provider authority')

    finalizeRunOnClose(postCommitRun, { exitCode: 0, failed: false }, '')
    assert.notEqual(postCommitRun.status, 'done',
      'provider close cannot terminalize a publication whose protected authority failed to fsync')

    // Two startup/test workers may both observe the same directory entry. Deterministically remove it
    // after readdir but before open: the losing reader skips an atomically consumed receipt, while the
    // restored identical receipt below remains available for the real providerless recovery assertion.
    const readyPath = path.join(STATE_DIR, 'publication-ready', `${postCommitRun.runId}.json`)
    const heldReadyPath = `${readyPath}.race-held`
    const originalOpenSync = fs.openSync.bind(fs)
    let removedBeforeOpen = false
    ;(fs as any).openSync = (target: fs.PathLike, ...args: any[]) => {
      if (!removedBeforeOpen && path.resolve(String(target)) === path.resolve(readyPath)) {
        fs.renameSync(readyPath, heldReadyPath)
        removedBeforeOpen = true
      }
      return (originalOpenSync as any)(target, ...args)
    }
    try {
      assert.equal(await recoverReadyPublications(), 0,
        'a receipt consumed between directory scan and open is a safe skip, not engine failure')
      assert.equal(removedBeforeOpen, true)
    } finally {
      ;(fs as any).openSync = originalOpenSync
      if (fs.existsSync(heldReadyPath)) fs.renameSync(heldReadyPath, readyPath)
    }

    // 2026-09-17 outage: this pass runs before listen(), so a rejection that escaped it stopped the whole
    // cockpit and launchd restarted it straight back into the same rejection until an operator intervened. A sealed
    // publication Git/the catalogue refuses must be reported and retained, never thrown.
    const rejectingCommitter = __setSupervisorCommitter(async () => {
      throw Object.assign(new Error('Command failed with exit code 5'), {
        stderr: 'DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data',
      })
    })
    try {
      assert.equal(await recoverReadyPublications(), 0,
        'a sealed publication that cannot publish is reported, not thrown into the startup path')
      assert.equal(fs.existsSync(readyPath), true, 'the rejected receipt is retained for the next recovery pass')
      assert.deepEqual(listReadyPublicationFailures().map((item) => [item.entry, item.error]), [
        [`${postCommitRun.runId}.json`, 'DATA-CATALOGUE: FAIL — proposed tree has uncatalogued data'],
      ])
    } finally { __setSupervisorCommitter(rejectingCommitter) }

    __setPublicationAuthoritySealer(postCommitSealer)
    let recoveryCommits = 0
    const recoveryCommitter = __setSupervisorCommitter(async () => {
      recoveryCommits++
      return 'COMMIT_SHA=5555555555555555555555555555555555555555'
    })
    try {
      assert.equal(await recoverReadyPublications(), 1,
        'startup finds the still-retained ready receipt and seals the exact snapshot')
      assert.equal(recoveryCommits, 1)
      assert.equal(providerCalls, 0, 'provider recovery is never involved in the publication crash window')
      assert.equal(readLastProviderSelection(postCommitRoot, 'published')?.profileKey, profile.key)
      assert.equal(await recoverReadyPublications(), 0, 'the receipt clears only after authority is durable')
      assert.deepEqual(listReadyPublicationFailures(), [], 'a later successful pass clears the reported failure')
    } finally { __setSupervisorCommitter(recoveryCommitter) }
  } finally {
    __setPublicationAuthoritySealer(postCommitSealer)
    __setSupervisorCommitter(postCommitCommitter)
    __setSupervisorCommitVerifier(postCommitVerifier)
    finishRun(postCommitRun, 'error')
  }

  const configuredRoot = `${root}_configured-carry`
  extraCleanup.push(path.join(REPO_ROOT, configuredRoot))
  fs.mkdirSync(path.join(REPO_ROOT, configuredRoot), { recursive: true })
  const configured = attempt('codex')
  configured.runRoot = configuredRoot
  configured.executionProfile = {
    key: configured.profileKey, parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
    specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
  }
  configured.expected = new Map([['fixture', {
    key: 'fixture', module: 'business-model', name: 'fixture', layer: 1, outputRel: 'business-model/01_fixture.md',
  }]])
  beginExecutionAttempt(configured)
  const configuredRow = configured.currentExecutionAttempts?.find((row) => row.attribution === 'configured')
  assert.ok(configuredRow, 'fixture must contain a configured-only specialist row')
  const configuredContinuation = attempt('claude')
  configuredContinuation.runRoot = configuredRoot
  beginExecutionAttempt(configuredContinuation)
  const importedConfigured = configuredContinuation.executionAttempts?.find((row) =>
    row.attempt_id === configuredRow?.attempt_id && row.model === configuredRow?.model)
  assert.equal(importedConfigured?.attribution, 'configured',
    'configured-only lineage is never promoted to runtime-recorded during carry-forward')

  const sealedRoot = `${root}_sealed-carry`
  const sealedAbsolute = path.join(REPO_ROOT, sealedRoot)
  extraCleanup.push(sealedAbsolute)
  fs.mkdirSync(sealedAbsolute, { recursive: true })
  const sealedClaude = attempt('claude')
  sealedClaude.runRoot = sealedRoot
  beginExecutionAttempt(sealedClaude)
  const sealedDecision = path.join(sealedAbsolute, 'decision_record.json')
  fs.writeFileSync(sealedDecision, '{"ticker":"ZZSEALED","version":1}\n')
  const sealedRelative = `${sealedRoot}/decision_record.json`
  sealedClaude.publicationCompleted = true
  sealedClaude.publicationArtifactHashes = {
    [sealedRelative]: `sha256:${createHash('sha256').update(fs.readFileSync(sealedDecision)).digest('hex')}`,
  }
  releaseExecutionEpochAfterPublication(sealedClaude)
  const sealedCodex = attempt('codex')
  sealedCodex.runRoot = sealedRoot
  beginExecutionAttempt(sealedCodex)
  assert.deepEqual(new Set((sealedCodex.executionAttempts ?? []).map((row) => row.provider)),
    new Set(['claude', 'codex']),
    'a just-published Claude pipeline remains mixed when Codex continues the same root')

  // The screener integrity step intentionally patches only the immutable ledger copy. Publication must
  // accept exactly that deterministic ledger-only field while still rejecting every other divergence.
  const signalId = `SIG-20990101-${Date.now().toString(16).slice(-8).padStart(8, '0')}`
  const signalRoot = `screener/runs/${signalId}`
  const signalAbsolute = path.join(REPO_ROOT, signalRoot)
  const thesisId = `THS-${signalId}-v1`
  const ledgerRelative = `screener/ledger/theses/${thesisId}.json`
  const ledgerAbsolute = path.join(REPO_ROOT, ledgerRelative)
  extraCleanup.push(signalAbsolute, ledgerAbsolute)
  fs.mkdirSync(signalAbsolute, { recursive: true })
  fs.mkdirSync(path.dirname(ledgerAbsolute), { recursive: true })
  const signal = createRun({
    kind: 'signal', ticker: signalId, subjectId: signalId, swarmId: 'screener', unit: 'signal',
    provider: 'claude', executionProfile: profile, profileKey: profile.key, model: 'sonnet',
    reasoningLevel: 'default', prompt: '', user: 'test', userVia: 'local', runRoot: signalRoot,
    willCommitToMain: true, writeTargetsAbs: [signalAbsolute, ledgerAbsolute], coveredModules: [],
    readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  signal.publicationToken = 'signal-supervisor-capability'
  beginExecutionAttempt(signal)
  const thesis = { meta: { thesis_id: thesisId }, score: 73, decision: 'WATCH' }
  fs.writeFileSync(path.join(signalAbsolute, 'thesis_record.json'), `${JSON.stringify(thesis)}\n`)
  const review = {
    verdict: 'Survives with haircut', routing: 'Proceed', reviewed_at: '2099-01-01T00:00:00Z',
    edge_score_haircut_note: 'fixture deterministic haircut',
  }
  fs.writeFileSync(path.join(signalAbsolute, 'thesis_integrity_review.json'), `${JSON.stringify(review)}\n`)
  fs.writeFileSync(ledgerAbsolute, `${JSON.stringify({
    ...thesis,
    forged_model_ledger_field: 'must be discarded',
    integrity_review: {
      ...review,
      review_file: `${signalRoot}/thesis_integrity_review.json`,
    },
  })}\n`)
  const stamped = await supervisePublication(signal.runId, signal.publicationToken, { phase: 'stamp' })
  assert.deepEqual(new Set(stamped.artifacts), new Set([`${signalRoot}/thesis_record.json`, ledgerRelative]))
  const projectedLedger = JSON.parse(fs.readFileSync(ledgerAbsolute, 'utf8'))
  assert.equal(projectedLedger.integrity_review.verdict, 'Survives with haircut')
  assert.equal(projectedLedger.forged_model_ledger_field, undefined,
    'the immutable ledger is derived from the run thesis, never trusted from model-prewritten bytes')
  finishRun(signal, 'done')
  fs.rmSync(signalAbsolute, { recursive: true, force: true })
  fs.rmSync(ledgerAbsolute, { force: true })

  // A child may request only an incidental in-scope file. The supervisor must force every terminal
  // artifact and its receipt into the exact commit and verify those committed blobs before completion.
  const metadataRelative = `${root}/RUN_METADATA.md`
  fs.writeFileSync(path.join(REPO_ROOT, metadataRelative), '# fixture metadata\n')
  let forcedPathspecs: string[] = []
  let verifiedRequired: string[] = []
  const terminalCommitter = __setSupervisorCommitter(async (_message, pathspecs) => {
    forcedPathspecs = [...pathspecs]
    return 'COMMIT_SHA=1111111111111111111111111111111111111111'
  })
  const terminalVerifier = __setSupervisorCommitVerifier(async (_output, requiredPaths) => {
    verifiedRequired = [...requiredPaths]
  })
  try {
    await supervisePublication(run.runId, run.publicationToken!, {
      phase: 'commit', message: 'metadata-only request', pathspecs: [metadataRelative],
    })
    const receiptRelative = `${root}/execution_provenance.receipt.json`
    for (const required of [`${root}/decision_record.json`, receiptRelative]) {
      assert.ok(forcedPathspecs.includes(required), `${required} must be forced into the commit pathspecs`)
      assert.ok(verifiedRequired.includes(required), `${required} must be verified in the committed HEAD`)
    }
    assert.equal(run.publicationCompleted, true)
  } finally {
    __setSupervisorCommitter(terminalCommitter)
    __setSupervisorCommitVerifier(terminalVerifier)
  }

  // A tracked decision review refreshes calibration deterministically only after its data publication
  // succeeds; no second model turn is involved.
  const reviewRelative = `${root}/reviews/2099-01-01_decision_review.json`
  const reviewAbsolute = path.join(REPO_ROOT, reviewRelative)
  fs.mkdirSync(path.dirname(reviewAbsolute), { recursive: true })
  const reviewRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true, writeTargetsAbs: [path.dirname(reviewAbsolute)],
    coveredModules: [], readDepsAbs: [], closeWatcher: undefined, expected: new Map(),
  })
  reviewRun.publicationToken = 'review-supervisor-capability'
  beginExecutionAttempt(reviewRun)
  fs.writeFileSync(reviewAbsolute, '{"verdict":"fixture"}\n')
  await assert.rejects(supervisePublication(reviewRun.runId, reviewRun.publicationToken, {
    phase: 'commit', pathspecs: [`${root}/reviews/*_decision_review.json`],
  }), /wildcard review commits are forbidden/)
  await assert.rejects(supervisePublication(reviewRun.runId, reviewRun.publicationToken, {
    phase: 'commit', pathspecs: ['analyses'],
  }), /may publish only exact files/)
  let commits = 0
  let calibrations = 0
  const priorCommitter = __setSupervisorCommitter(async (_message, pathspecs) => {
    commits++
    assert.deepEqual(pathspecs, [reviewRelative])
    return `COMMIT_SHA=${'4'.repeat(40)}`
  })
  const priorCalibration = __setPostReviewCalibration(async () => { calibrations++ })
  const priorVerifier = __setSupervisorCommitVerifier(async (_output, requiredPaths) => {
    assert.deepEqual(requiredPaths, [reviewRelative])
  })
  try {
    const reviewPublication = await supervisePublication(reviewRun.runId, reviewRun.publicationToken, {
      phase: 'commit', message: 'fixture review', pathspecs: [reviewRelative],
    })
    assert.equal(reviewPublication.output, `COMMIT_SHA=${'4'.repeat(40)}`)
    assert.equal(commits, 1)
    assert.equal(calibrations, 1, 'deterministic calibration runs exactly once after review publication')
  } finally {
    __setSupervisorCommitter(priorCommitter)
    __setPostReviewCalibration(priorCalibration)
    __setSupervisorCommitVerifier(priorVerifier)
    finishRun(reviewRun, 'done')
  }

  const mismatchRelative = `${root}/reviews/2099-01-02_decision_review.json`
  const mismatchRun = createRun({
    kind: 'review', ticker: 'ZZPROVSUP', provider: 'claude', executionProfile: profile,
    profileKey: profile.key, model: 'sonnet', reasoningLevel: 'default', prompt: '', user: 'test',
    userVia: 'local', runRoot: root, willCommitToMain: true,
    writeTargetsAbs: [path.dirname(path.join(REPO_ROOT, mismatchRelative))], coveredModules: [], readDepsAbs: [],
    closeWatcher: undefined, expected: new Map(),
  })
  mismatchRun.publicationToken = 'mismatch-supervisor-capability'
  beginExecutionAttempt(mismatchRun)
  fs.writeFileSync(path.join(REPO_ROOT, mismatchRelative), '{"verdict":"mismatch fixture"}\n')
  await assert.rejects(supervisePublication(mismatchRun.runId, mismatchRun.publicationToken, {
    phase: 'commit', pathspecs: [reviewRelative],
  }), /append-only and cannot overwrite/)
  const mismatchCommitter = __setSupervisorCommitter(async () => 'COMMIT_SHA=0000000000000000000000000000000000000000')
  const mismatchVerifier = __setSupervisorCommitVerifier(async () => { throw new Error('committed blob mismatch') })
  try {
    await assert.rejects(supervisePublication(mismatchRun.runId, mismatchRun.publicationToken, {
      phase: 'commit', pathspecs: [mismatchRelative],
    }), /committed blob mismatch/)
    assert.notEqual(mismatchRun.publicationCompleted, true, 'post-commit verification failure cannot mark publication complete')
  } finally {
    __setSupervisorCommitter(mismatchCommitter)
    __setSupervisorCommitVerifier(mismatchVerifier)
    finishRun(mismatchRun, 'error')
  }
} finally {
  finishRun(run, 'done')
  for (const target of extraCleanup) fs.rmSync(target, { recursive: true, force: true })
  fs.rmSync(absolute, { recursive: true, force: true })
  fs.rmSync(`${absolute}_siblings`, { recursive: true, force: true })
}

console.log('PASS: supervisor-owned provenance, freshness, and durable lineage')
