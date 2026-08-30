process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
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
  __setPostReviewCalibration, __setPublicationAuthoritySealer, __setSupervisorCommitter, __setSupervisorCommitVerifier,
  drainPublicationIntents, finalizeRunOnClose, queuePublicationIntent, recoverReadyPublications, requiresSupervisorPublication,
  supervisePublication,
} from '../src/launcher'

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

const root = `analyses/ZZPROVSUP_${Date.now()}`
const absolute = path.join(REPO_ROOT, root)
const extraCleanup: string[] = []
fs.mkdirSync(absolute, { recursive: true })
fs.writeFileSync(path.join(absolute, 'decision_record.json'), JSON.stringify({ ticker: 'ZZPROVSUP', version: 1 }) + '\n')

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

  fs.writeFileSync(path.join(absolute, 'decision_record.json'), JSON.stringify({ ticker: 'ZZPROVSUP', version: 2 }) + '\n')
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
  fs.writeFileSync(path.join(deferredAbsolute, 'decision_record.json'), '{"ticker":"ZZDEFER","version":1}\n')
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
  fs.writeFileSync(path.join(deferredAbsolute, 'decision_record.json'), '{"ticker":"ZZDEFER","version":2}\n')
  let deferredCommits = 0
  const deferredCommitter = __setSupervisorCommitter(async () => {
    deferredCommits++
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
    assert.equal(deferred.publicationCompleted, true)
    assert.ok(JSON.parse(fs.readFileSync(path.join(deferredAbsolute, 'decision_record.json'), 'utf8')).execution_provenance)
    assert.doesNotMatch(fs.readFileSync(path.join(deferredAbsolute, 'RUN_METADATA.md'), 'utf8'), /to be filled/)
  } finally {
    __setSupervisorCommitter(deferredCommitter)
    __setSupervisorCommitVerifier(deferredVerifier)
    finishRun(deferred, 'done')
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
