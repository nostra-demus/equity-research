// Exact protected restart lanes: frozen Full input + terminal publication reconciliation.
// Run: npx tsx test/protected-recovery-supervisor.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const stateDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-protected-recovery-')))
process.env.ENGINE_STATE_DIR = stateDir

const { DATA_DIR, REPO_ROOT } = await import('../src/config')
const {
  assessChainedReadinessOnce, clearChainedReadiness,
} = await import('../src/launcher')
const {
  thesisPlanForRequest,
} = await import('../src/completion')
const {
  dispatchRecoverableChainIntent, recoverableChainPublicationIsSealed,
  legacyResearchCandidatesAfterProtectedRecovery, protectedResearchRecoveryOwnsSubject,
  revalidateRecoverableChainPlan, terminalizeRecoverablePublishedChain,
} = await import('../src/resume-supervisor')
const {
  captureOutputLineageAttempt, readVerifiedOutputLineage, settleOutputLineageAttempt,
} = await import('../src/evidence-lineage')
const {
  readProviderPublicationAuthority, recordRecoveredPublicationAuthority,
} = await import('../src/execution-provenance')
import type {
  PreSpendRetryProfile, PreparedRunPlanTransaction, RecoverableChainIntentRecord,
} from '../src/run-plan-transaction'
import type { ReadinessReport } from '../src/types'

function canonicalGenerationJson(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalGenerationJson).join(',')}]`
  const record = value as Record<string, unknown>
  const compareCodePoints = (left: string, right: string) => {
    const a = [...left].map((item) => item.codePointAt(0) ?? 0)
    const b = [...right].map((item) => item.codePointAt(0) ?? 0)
    for (let index = 0; index < Math.min(a.length, b.length); index++) {
      if (a[index] !== b[index]) return a[index] - b[index]
    }
    return a.length - b.length
  }
  return `{${Object.keys(record).sort(compareCodePoints).map((key) =>
    `${JSON.stringify(key)}:${canonicalGenerationJson(record[key])}`).join(',')}}`
}

function writeFrozenPool(binding: { ticker: string; runRoot: string }) {
  const dataPath = path.join(DATA_DIR, binding.ticker)
  const outDir = path.join(REPO_ROOT, binding.runRoot, '_pool_extracts')
  const rawPrefix = `raw/${binding.ticker}`
  const raw = Buffer.from('immutable original evidence\n')
  const rawDigest = createHash('sha256').update(raw).digest('hex')
  const inputs = { 'evidence.txt': rawDigest }
  const artifacts = { [`${rawPrefix}/evidence.txt`]: rawDigest }
  const sources = [{
    file: 'evidence.txt', path: 'evidence.txt', extract: `${rawPrefix}/evidence.txt`, sheets: [],
  }]
  const bindingJson = canonicalGenerationJson({
    schema_version: 'pool-generation/v2',
    binding_format: 'python-json-sort-keys-compact-utf8/v1',
    data_path: dataPath,
    out_dir: outDir,
    vision_mode: false,
    offline_extraction_complete: true,
    raw_prefix: rawPrefix,
    inputs,
    sources,
    entities: [],
    artifacts,
  })
  const generationDigest = createHash('sha256').update(bindingJson, 'utf8').digest('hex')
  const generationDir = path.join(outDir, '.extract-generations', generationDigest)
  const evidenceRoot = path.join(generationDir, rawPrefix)
  fs.mkdirSync(evidenceRoot, { recursive: true })
  fs.writeFileSync(path.join(evidenceRoot, 'evidence.txt'), raw)
  fs.writeFileSync(path.join(generationDir, 'manifest.json'), JSON.stringify({
    data_path: dataPath,
    out_dir: outDir,
    vision_mode: false,
    offline_extraction_complete: true,
    sources: sources.map((source) => ({
      ...source, extract: `.extract-generations/${generationDigest}/${source.extract}`,
    })),
    entities: [],
    generation: {
      schema_version: 'pool-generation/v2', digest: generationDigest,
      binding_json: bindingJson, raw_prefix: rawPrefix, inputs, artifacts,
    },
  }))
  if (process.platform !== 'win32') {
    for (const directory of [evidenceRoot, path.dirname(evidenceRoot), generationDir]) {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isFile()) fs.chmodSync(path.join(directory, entry.name), 0o444)
      }
      fs.chmodSync(directory, 0o555)
    }
  }
  return { dataPath, outDir, generationDigest, generationDir, evidenceRoot }
}

const ticker = `ZR${Date.now().toString().slice(-8)}`
const dataRoot = path.join(DATA_DIR, ticker)
const selection = {
  provider: 'claude' as const,
  model: 'sonnet',
  reasoningLevel: 'default',
  expectedProfileKey: 'claude:sonnet:default',
}
const profile: PreSpendRetryProfile = {
  provider: 'claude', model: 'sonnet', reasoningLevel: 'default',
  profileKey: 'claude:sonnet:default',
  executionProfile: {
    key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default',
  },
}
let runRootAbs = ''
let chainId = ''

try {
  fs.mkdirSync(dataRoot, { recursive: true })
  fs.writeFileSync(path.join(dataRoot, 'evidence.txt'), 'original live evidence\n')
  const reviewed = await thesisPlanForRequest(ticker, 'research', [], undefined, selection)
  assert.equal(reviewed.continuationReceipt.action, 'complete')
  runRootAbs = path.join(REPO_ROOT, reviewed.targetRunRoot)
  fs.mkdirSync(runRootAbs, { recursive: true })

  const frozenPool = writeFrozenPool({ ticker, runRoot: reviewed.targetRunRoot })
  const readiness: ReadinessReport = {
    ticker, kind: 'full', overall: 'clean', fileCount: 1, usableCount: 1,
    physicalPool: { state: 'nonempty', fileCount: 1, nonEmptyFileCount: 1 },
    entities: [], issues: [], ts: Date.now(), frozenPool,
  }
  chainId = randomUUID()
  await assessChainedReadinessOnce(
    chainId, 'initial-full-owner', { ticker, runRoot: reviewed.targetRunRoot },
    async () => readiness, { stateDir },
  )
  clearChainedReadiness(chainId)

  const intentBase: RecoverableChainIntentRecord['intent'] = {
    version: 1,
    chainId,
    user: 'fixture',
    userVia: 'local',
    selection: profile,
    modules: reviewed.modules.map((module) => ({
      module: module.module, dependsOn: [],
      synthesisOutputs: [`${module.module}/99_${module.module}-synthesis.md`],
    })),
    completed: [],
    nextModules: reviewed.run.slice(0, 1),
    inflightModules: [],
    masterState: 'pending',
    startedAt: new Date().toISOString(),
    progressAt: new Date().toISOString(),
    terminalStatus: null,
    terminalAt: null,
  }
  const record = (completed: RecoverableChainIntentRecord['intent']['completed'] = []): RecoverableChainIntentRecord => ({
    version: 1,
    requestId: randomUUID(),
    subject: ticker,
    targetRunRoot: reviewed.targetRunRoot,
    reviewedPlan: reviewed,
    intent: { ...intentBase, completed },
    integritySha256: `sha256:${'a'.repeat(64)}`,
  })

  // A paid Full can crash before its first module closes. Its exact root's protected frozen receipt is
  // sufficient restart authority; today's Drive is not consulted and no completed-artifact witness is needed.
  fs.writeFileSync(path.join(dataRoot, 'evidence.txt'), 'mutated live evidence after paid start\n')
  const preSpendStyleRecheck = await thesisPlanForRequest(
    ticker, 'research', reviewed.reuse, undefined, selection,
    { freshRunRoot: reviewed.targetRunRoot },
  )
  assert.equal(preSpendStyleRecheck.continuationReceipt.evidenceGenerationDigest, null,
    'an unreleased pre-spend retry still recomputes live data rather than inventing a frozen receipt')
  assert.notEqual(preSpendStyleRecheck.continuationReceipt.dataPool.sha256,
    reviewed.continuationReceipt.dataPool.sha256,
    'changed live data is rejected by the ordinary pre-spend exact-receipt CAS')
  const recoveredBeforeFirstModule = await thesisPlanForRequest(
    ticker, 'research', reviewed.reuse, undefined, selection,
    { freshRunRoot: reviewed.targetRunRoot, recoverFrozenGeneration: true },
  )
  assert.equal(recoveredBeforeFirstModule.continuationReceipt.evidenceGenerationDigest, frozenPool.generationDigest)
  assert.equal(recoveredBeforeFirstModule.continuationReceipt.dataPool.sha256,
    `sha256:${frozenPool.generationDigest}`)
  assert.equal((await revalidateRecoverableChainPlan(record())).continuationReceipt.fingerprint,
    reviewed.continuationReceipt.fingerprint,
    'a pre-first-module restart reopens the original plan despite changed live Drive bytes')

  // The same proof remains after a module closes. Bind one synthesis to the frozen generation, mutate Drive
  // again, and verify restart retains that module while planning only against the same immutable generation.
  const completedModule = reviewed.modules.find((module) => module.module === 'business-model')
    ?? reviewed.modules[0]
  assert.ok(completedModule, 'research fixture has at least one module')
  const outputRel = `${completedModule.module}/99_${completedModule.module}-synthesis.md`
  const lineageAttempt = captureOutputLineageAttempt({
    runRoot: reviewed.targetRunRoot,
    outputRels: [outputRel],
    generationDigest: frozenPool.generationDigest,
    attemptId: randomUUID(),
    provider: profile.provider,
    profileKey: profile.profileKey,
  })
  const outputAbs = path.join(runRootAbs, outputRel)
  fs.mkdirSync(path.dirname(outputAbs), { recursive: true })
  fs.writeFileSync(outputAbs, '# Module synthesis\n\n## Verdict\n\nSufficient frozen fixture evidence.\n')
  settleOutputLineageAttempt(lineageAttempt)
  const sealedOutput = readVerifiedOutputLineage(reviewed.targetRunRoot).entries
    .find((entry) => entry.output_rel === outputRel)
  assert.ok(sealedOutput, 'completed module output is lineage-bound')
  fs.writeFileSync(path.join(dataRoot, 'evidence.txt'), 'a second unrelated Drive mutation\n')
  const afterModule = record([{
    module: completedModule.module,
    artifacts: [{ outputRel, sha256: sealedOutput!.sha256 }],
  }])
  assert.equal((await revalidateRecoverableChainPlan(afterModule)).continuationReceipt.fingerprint,
    reviewed.continuationReceipt.fingerprint,
    'post-module restart uses the same frozen generation and original exact receipt')

  // Simulate the final crash window: master artifacts and their provider/profile publication authority are
  // durable, but the chain journal still says `running`. Recovery must seal that journal before sanitizer
  // and make zero provider calls, preserving the exact published bytes.
  const finalThesis = path.join(runRootAbs, 'final_thesis.md')
  const decision = path.join(runRootAbs, 'decision_record.json')
  fs.writeFileSync(finalThesis, '# Final thesis\n\nPublished exactly once.\n')
  fs.writeFileSync(decision, '{"decision":"Watchlist"}\n')
  const hash = (absolute: string) => `sha256:${createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')}`
  const publicationHashes = {
    [`${reviewed.targetRunRoot}/final_thesis.md`]: hash(finalThesis),
    [`${reviewed.targetRunRoot}/decision_record.json`]: hash(decision),
  }
  recordRecoveredPublicationAuthority({
    runId: randomUUID(), runRoot: reviewed.targetRunRoot,
    provider: profile.provider, model: profile.model,
    reasoningLevel: profile.reasoningLevel ?? undefined,
    profileKey: profile.profileKey, executionProfile: profile.executionProfile,
  }, publicationHashes)
  assert.deepEqual(readProviderPublicationAuthority(reviewed.targetRunRoot)?.artifactHashes, publicationHashes)
  const publishedRecord: RecoverableChainIntentRecord = {
    ...afterModule,
    intent: { ...afterModule.intent, nextModules: [], masterState: 'running' },
  }
  assert.equal(recoverableChainPublicationIsSealed(publishedRecord, profile), true)

  let sanitized = 0
  let launched = 0
  let progress = 0
  let terminal = 0
  let usageChecks = 0
  let availabilityChecks = 0
  let profileResolutions = 0
  const fakeTransaction = {
    recordChainProgress: async (input: any) => {
      progress++
      assert.equal(input.masterState, 'published')
      assert.deepEqual(input.nextModules, [])
      assert.deepEqual(input.inflightModules, [])
    },
    recordChainTerminal: async (status: string) => {
      terminal++
      assert.equal(status, 'done')
    },
  } as unknown as PreparedRunPlanTransaction
  const outcome = await dispatchRecoverableChainIntent(publishedRecord, Date.now(), {
    withLock: async (_key, callback) => callback(),
    readRecord: async () => publishedRecord,
    usage: async () => { usageChecks++; return { ok: false, checked: true, isUsingOverage: true } },
    providerAvailable: async () => { availabilityChecks++; throw new Error('provider removed after publication') },
    live: () => false,
    resolveProfile: () => { profileResolutions++; throw new Error('profile changed after publication') },
    revalidatePlan: async () => reviewed,
    reopen: async () => fakeTransaction,
    published: recoverableChainPublicationIsSealed,
    terminalizePublished: terminalizeRecoverablePublishedChain,
    sanitize: () => { sanitized++ },
    launchChain: async () => { launched++; return [] },
  })
  assert.equal(outcome, 'completed')
  assert.equal(progress, 1)
  assert.equal(terminal, 1)
  assert.equal(usageChecks, 0, 'zero-spend publication reconciliation does not depend on current credit')
  assert.equal(availabilityChecks, 0, 'zero-spend publication reconciliation does not require a provider')
  assert.equal(profileResolutions, 0, 'stored exact publication identity closes the journal after config changes')
  assert.equal(sanitized, 0, 'published output is never deleted by restart sanitation')
  assert.equal(launched, 0, 'published master is never paid for twice')
  assert.equal(hash(finalThesis), publicationHashes[`${reviewed.targetRunRoot}/final_thesis.md`])
  assert.equal(hash(decision), publicationHashes[`${reviewed.targetRunRoot}/decision_record.json`])

  fs.writeFileSync(finalThesis, '# tampered after publication\n')
  assert.equal(recoverableChainPublicationIsSealed(publishedRecord, profile), false,
    'changed final bytes cannot borrow the protected publication authority')

  // Cancellation is fsynced before process termination. A supervisor that read the old record just before
  // that write must reread under the subject lock; the terminal journal then makes it stale before usage,
  // sanitation, or any provider boundary.
  let workAfterCancelledReread = 0
  const cancelledRace = await dispatchRecoverableChainIntent(publishedRecord, Date.now(), {
    withLock: async (_key, callback) => callback(),
    readRecord: async () => null,
    usage: async () => { workAfterCancelledReread++; return { ok: true, checked: true } },
    providerAvailable: async () => { workAfterCancelledReread++ },
    live: () => { workAfterCancelledReread++; return false },
    resolveProfile: () => { workAfterCancelledReread++; return profile },
    revalidatePlan: async () => { workAfterCancelledReread++; return reviewed },
    reopen: async () => { workAfterCancelledReread++; return fakeTransaction },
    published: () => { workAfterCancelledReread++; return false },
    terminalizePublished: async () => { workAfterCancelledReread++ },
    sanitize: () => { workAfterCancelledReread++ },
    launchChain: async () => { workAfterCancelledReread++; return [] },
  })
  assert.equal(cancelledRace, 'stale')
  assert.equal(workAfterCancelledReread, 0,
    'durably-cancelled chain cannot reach any current-plan, filesystem, or paid recovery work')

  const staleLegacy = [{
    kind: 'full' as const, swarm: 'research', subject: ticker,
    runRoot: reviewed.targetRunRoot, provider: 'claude' as const,
  }]
  assert.deepEqual(legacyResearchCandidatesAfterProtectedRecovery(
    staleLegacy, new Set([reviewed.targetRunRoot]), true,
  ), [], 'durable cancellation tombstone suppresses a stale legacy interruption marker for the exact root')
  assert.deepEqual(legacyResearchCandidatesAfterProtectedRecovery(staleLegacy, new Set(), false), [],
    'unreadable cancellation authority fails closed instead of trusting mutable run-root markers')

  assert.equal(await protectedResearchRecoveryOwnsSubject(ticker, {
    listChains: async () => [publishedRecord], live: () => false,
  }), true, 'a durable already-paid chain holds same-subject pending admission')
  assert.equal(await protectedResearchRecoveryOwnsSubject(ticker, {
    listChains: async () => { throw new Error('unsafe journal') }, live: () => false,
  }), true, 'an unreadable protected journal holds new work rather than risking a second spend')
  assert.equal(await protectedResearchRecoveryOwnsSubject(ticker, {
    listChains: async () => [], live: () => false,
  }), false, 'pending admission may proceed only after protected chain truth is terminal and not live')

  console.log('protected recovery supervisor: frozen restart + publication/cancel/boot priority passed')
} finally {
  if (chainId) clearChainedReadiness(chainId)
  if (runRootAbs) {
    // Frozen generations are read-only by design; relax only this isolated fixture before cleanup.
    if (process.platform !== 'win32' && fs.existsSync(runRootAbs)) {
      const makeWritable = (directory: string) => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
          if (entry.isDirectory() && !entry.isSymbolicLink()) makeWritable(path.join(directory, entry.name))
        }
        fs.chmodSync(directory, 0o755)
      }
      makeWritable(runRootAbs)
    }
    fs.rmSync(runRootAbs, { recursive: true, force: true })
  }
  fs.rmSync(dataRoot, { recursive: true, force: true })
  fs.rmSync(stateDir, { recursive: true, force: true })
}
