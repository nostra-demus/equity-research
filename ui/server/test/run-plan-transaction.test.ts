process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execa } from 'execa'
import { ANALYSES_DIR, REPO_ROOT } from '../src/config'
import { continuationPlanReceiptFingerprint, thesisPlan } from '../src/completion'
import { preparedProviderContinuationAttemptId } from '../src/launcher'
import {
  listDeferredPreSpendRetries,
  listCancelledChainIntents,
  listRecoverableChainIntents,
  prepareRunPlanTransaction,
  readDeferredPreSpendRetry,
  readCancelledChainIntent,
  readRecoverableChainIntent,
  rearmDeferredPreSpendRetry,
  recoverRunPlanTransactions,
  resumeRecoverableChainIntent,
  type PreSpendRetryAuthority,
} from '../src/run-plan-transaction'
import {
  providerSpawnCommandDigest,
  PROVIDER_SPAWN_GATE_DIR_ENV,
  PROVIDER_SPAWN_GATE_TOKEN_ENV,
  PROVIDER_SPAWN_TRAMPOLINE,
  recordProviderSpawnGateProcessProof,
  releaseProviderSpawnGate,
} from '../src/provider-spawn-gate'

const stateParent = path.join(REPO_ROOT, '.run-plan-transaction-tests')
fs.mkdirSync(stateParent, { recursive: true })
const state = fs.mkdtempSync(path.join(stateParent, 'state-'))
const selection = { provider: 'claude' as const, model: 'sonnet', reasoningLevel: 'default', expectedProfileKey: 'claude:sonnet:default' }
const createdTargets: string[] = []
const createdRequests: string[] = []

function newRequestId(): string {
  const requestId = crypto.randomUUID()
  createdRequests.push(requestId)
  return requestId
}

function freshPlan(subject: string) {
  const plan = thesisPlan(subject, 'research', [], undefined, selection)
  createdTargets.push(path.join(REPO_ROOT, plan.targetRunRoot))
  return plan
}

const fixtureCommandDigest = `sha256:${'1'.repeat(64)}`
const fixtureProof = () => ({
  pid: Math.max(2, process.pid),
  processStarted: new Date().toString(),
  leaseSha256: `sha256:${'2'.repeat(64)}`,
})
const fixtureIdentity = () => ({
  runId: crypto.randomUUID(),
  providerAttemptId: crypto.randomUUID(),
  commandDigest: fixtureCommandDigest,
})
function retryAuthority(notBeforeMs: number = Date.now()): PreSpendRetryAuthority {
  return {
    reason: 'technical_readiness_failed_before_spend',
    recoveryRequestId: crypto.randomUUID(),
    provider: 'claude',
    model: 'sonnet',
    reasoningLevel: 'default',
    profileKey: 'claude:sonnet:default',
    executionProfile: {
      key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default',
    },
    localAttempts: 3,
    notBeforeMs,
  }
}
async function intent(transaction: Awaited<ReturnType<typeof prepareRunPlanTransaction>>, attemptId: string) {
  return transaction.markPaidChildSpawning(attemptId, fixtureIdentity())
}

async function sealStarted(transaction: Awaited<ReturnType<typeof prepareRunPlanTransaction>>, attemptId: string) {
  const gate = await intent(transaction, attemptId)
  const proof = fixtureProof()
  recordProviderSpawnGateProcessProof(gate, proof)
  await transaction.markPaidChildSpawnReady(attemptId, proof)
  releaseProviderSpawnGate(gate)
  await transaction.markPaidChildStarted(attemptId)
  return gate
}

function fakeProviderSpec(invocations: string, label: string) {
  const args = ['-e', `require('node:fs').appendFileSync(${JSON.stringify(invocations)}, ${JSON.stringify(`${label}\n`)})`]
  return {
    command: process.execPath,
    args,
    commandDigest: providerSpawnCommandDigest(process.execPath, args, REPO_ROOT),
  }
}

async function createFakeGate(
  transaction: Awaited<ReturnType<typeof prepareRunPlanTransaction>>,
  attemptId: string,
  invocations: string,
  label: string,
) {
  const spec = fakeProviderSpec(invocations, label)
  const gate = await transaction.markPaidChildSpawning(attemptId, {
    runId: crypto.randomUUID(), providerAttemptId: crypto.randomUUID(), commandDigest: spec.commandDigest,
  })
  return { gate, spec }
}

function spawnFake(gate: Awaited<ReturnType<typeof createFakeGate>>['gate'], spec: ReturnType<typeof fakeProviderSpec>) {
  return execa(process.execPath, [PROVIDER_SPAWN_TRAMPOLINE, spec.command, ...spec.args], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      [PROVIDER_SPAWN_GATE_DIR_ENV]: gate.directory,
      [PROVIDER_SPAWN_GATE_TOKEN_ENV]: gate.releaseToken,
    },
    extendEnv: false,
    reject: false,
    detached: true,
  })
}

async function readyFake(
  transaction: Awaited<ReturnType<typeof prepareRunPlanTransaction>>,
  attemptId: string,
  gate: Awaited<ReturnType<typeof createFakeGate>>['gate'],
  pid: number,
) {
  const proof = {
    pid,
    processStarted: new Date().toString(),
    leaseSha256: `sha256:${'3'.repeat(64)}`,
  }
  recordProviderSpawnGateProcessProof(gate, proof)
  await transaction.markPaidChildSpawnReady(attemptId, proof)
}

function invocationRows(absolute: string): string[] {
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8').trim().split('\n').filter(Boolean) : []
}

try {
  const absentPlan = freshPlan('ZZTXNA')
  const absent = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNA', absentPlan, {}, state)
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), false, 'private prepare creates no fake run root')
  await absent.activate()
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), true)
  await absent.rollbackIfUnstarted('fixture pre-spawn failure')
  assert.equal(fs.existsSync(path.join(REPO_ROOT, absentPlan.targetRunRoot)), false, 'pre-spawn rollback removes a new root')

  const fractionalPlan = freshPlan('ZZTXNW')
  fractionalPlan.dataPool.newestMs = 1.125
  fractionalPlan.continuationReceipt.dataPool.newestMs = 1.125
  const { fingerprint: _fractionalFingerprint, ...fractionalPayload } = fractionalPlan.continuationReceipt
  fractionalPlan.continuationReceipt.fingerprint = continuationPlanReceiptFingerprint(fractionalPayload)
  const fractional = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNW', fractionalPlan, {}, state)
  await fractional.rollbackIfUnstarted('fixture cleanup')
  assert.equal(fs.existsSync(path.join(REPO_ROOT, fractionalPlan.targetRunRoot)), false,
    'valid fractional filesystem mtimes do not block a paid plan before spend')

  const failedPreparationPlan = freshPlan('ZZTXNP')
  const failedPreparationRequest = newRequestId()
  await assert.rejects(
    prepareRunPlanTransaction(failedPreparationRequest, 'ZZTXNP', failedPreparationPlan, {
      prepare: () => { throw new Error('fixture sanitizer failure') },
    }, state),
    /fixture sanitizer failure/,
  )
  const retriedPreparation = await prepareRunPlanTransaction(
    failedPreparationRequest, 'ZZTXNP', failedPreparationPlan, {}, state,
  )
  await retriedPreparation.rollbackIfUnstarted('fixture cleanup')
  assert.equal(fs.existsSync(path.join(REPO_ROOT, failedPreparationPlan.targetRunRoot)), false,
    'a private sanitizer failure leaves no fake root or unreadable request that blocks a safe retry')

  const existingPlan = freshPlan('ZZTXNB')
  const existingTarget = path.join(REPO_ROOT, existingPlan.targetRunRoot)
  fs.mkdirSync(existingTarget, { recursive: true })
  fs.writeFileSync(path.join(existingTarget, 'original.txt'), 'original\n')
  const existing = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNB', existingPlan, {}, state)
  fs.writeFileSync(path.join(existing.preparation.stagingRootAbs, 'new.txt'), 'new\n')
  await existing.activate()
  assert.equal(fs.existsSync(path.join(existingTarget, 'new.txt')), true)
  await existing.rollbackIfUnstarted('fixture admission failure')
  assert.equal(fs.readFileSync(path.join(existingTarget, 'original.txt'), 'utf8'), 'original\n')
  assert.equal(fs.existsSync(path.join(existingTarget, 'new.txt')), false, 'rollback restores the byte-identical prior root')

  const startedPlan = freshPlan('ZZTXNC')
  const startedTarget = path.join(REPO_ROOT, startedPlan.targetRunRoot)
  const startedRequest = newRequestId()
  const started = await prepareRunPlanTransaction(startedRequest, 'ZZTXNC', startedPlan, {}, state)
  fs.writeFileSync(path.join(started.preparation.stagingRootAbs, 'started.txt'), 'paid child owns this root\n')
  await started.registerPaidChildAttempt('started-child')
  await started.activate()
  await sealStarted(started, 'started-child')
  await started.rollbackIfUnstarted('must be ignored')
  await recoverRunPlanTransactions(state)
  assert.equal(fs.readFileSync(path.join(startedTarget, 'started.txt'), 'utf8'), 'paid child owns this root\n')
  await assert.rejects(
    prepareRunPlanTransaction(startedRequest, 'ZZTXNC', startedPlan, {}, state),
    /already crossed the paid provider boundary/,
    'a started request can never prepare a second attempt',
  )

  const crashPlan = freshPlan('ZZTXND')
  const crashTarget = path.join(REPO_ROOT, crashPlan.targetRunRoot)
  const crash = await prepareRunPlanTransaction(newRequestId(), 'ZZTXND', crashPlan, {}, state)
  await crash.activate()
  await recoverRunPlanTransactions(state)
  assert.equal(fs.existsSync(crashTarget), false, 'restart recovery removes an activated root with no paid child')

  const spawningPlan = freshPlan('ZZTXNE')
  const spawningTarget = path.join(REPO_ROOT, spawningPlan.targetRunRoot)
  const spawningRequest = newRequestId()
  const spawning = await prepareRunPlanTransaction(spawningRequest, 'ZZTXNE', spawningPlan, {}, state)
  await spawning.registerPaidChildAttempt('maybe-spawned-child')
  await spawning.activate()
  await intent(spawning, 'maybe-spawned-child')
  await recoverRunPlanTransactions(state)
  assert.equal(fs.existsSync(spawningTarget), false,
    'restart rolls back an intent whose trampoline gate proves the provider was never released')
  const spawningRetry = await prepareRunPlanTransaction(spawningRequest, 'ZZTXNE', spawningPlan, {}, state)
  await spawningRetry.rollbackIfUnstarted('safe retry cleanup')

  const failedSpawnPlan = freshPlan('ZZTXNF')
  const failedSpawnTarget = path.join(REPO_ROOT, failedSpawnPlan.targetRunRoot)
  const failedSpawn = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNF', failedSpawnPlan, {}, state)
  await failedSpawn.registerPaidChildAttempt('failed-spawn-child')
  await failedSpawn.activate()
  await intent(failedSpawn, 'failed-spawn-child')
  await failedSpawn.rollbackIfUnstarted('spawn synchronously failed and no child exists', 'failed-spawn-child')
  assert.equal(fs.existsSync(failedSpawnTarget), false, 'a proved no-child spawn failure rolls back atomically')

  const siblingPlan = freshPlan('ZZTXNG')
  const siblingTarget = path.join(REPO_ROOT, siblingPlan.targetRunRoot)
  let siblingStartedHooks = 0
  let siblingRollbackHooks = 0
  const siblings = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNG', siblingPlan, {
    onStarted: () => { siblingStartedHooks += 1 },
    onRolledBack: () => { siblingRollbackHooks += 1 },
  }, state)
  fs.writeFileSync(path.join(siblings.preparation.stagingRootAbs, 'siblings.txt'), 'shared paid root\n')
  await Promise.all([
    siblings.registerPaidChildAttempt('same-wave-a'),
    siblings.registerPaidChildAttempt('same-wave-b'),
  ])
  await siblings.activate()
  await Promise.all([
    intent(siblings, 'same-wave-a').then(() =>
      siblings.rollbackIfUnstarted('sibling A failed before execa', 'same-wave-a')),
    (async () => {
      const gate = await intent(siblings, 'same-wave-b')
      const proof = fixtureProof()
      recordProviderSpawnGateProcessProof(gate, proof)
      await siblings.markPaidChildSpawnReady('same-wave-b', proof)
      releaseProviderSpawnGate(gate)
      await siblings.markPaidChildStarted('same-wave-b')
    })(),
  ])
  await siblings.rollbackIfUnstarted('late duplicate sibling cleanup', 'same-wave-b')
  assert.equal(fs.readFileSync(path.join(siblingTarget, 'siblings.txt'), 'utf8'), 'shared paid root\n',
    'one failed sibling never restores or deletes the root owned by a paid sibling')
  assert.equal(siblingStartedHooks, 1, 'the chain request is sealed started exactly once')
  assert.equal(siblingRollbackHooks, 0, 'a started sibling suppresses every late rollback')

  const allFailedPlan = freshPlan('ZZTXNH')
  const allFailedTarget = path.join(REPO_ROOT, allFailedPlan.targetRunRoot)
  const allFailed = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNH', allFailedPlan, {}, state)
  await Promise.all([
    allFailed.registerPaidChildAttempt('failed-a'),
    allFailed.registerPaidChildAttempt('failed-b'),
  ])
  await allFailed.activate()
  await intent(allFailed, 'failed-a')
  await allFailed.rollbackIfUnstarted('first sibling failed', 'failed-a')
  assert.equal(fs.existsSync(allFailedTarget), true, 'one pending sibling keeps the admitted root alive')
  await allFailed.rollbackIfUnstarted('last sibling failed before spawn', 'failed-b')
  assert.equal(fs.existsSync(allFailedTarget), false, 'the last proved-childless sibling rolls back once')

  const delegatedPlan = freshPlan('ZZTXNI')
  const delegatedTarget = path.join(REPO_ROOT, delegatedPlan.targetRunRoot)
  const delegated = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNI', delegatedPlan, {}, state)
  delegated.registerPaidChildAttempt('outer-full-scheduler')
  delegated.registerPaidChildAttempt('first-real-child')
  await delegated.activate()
  await delegated.rollbackIfUnstarted('first real child rejected before spawn', 'first-real-child')
  assert.equal(fs.existsSync(delegatedTarget), true,
    'the scheduler setup attempt holds the target until delegation returns')
  await delegated.rollbackIfUnstarted('scheduler delegated to the failed child', 'outer-full-scheduler')
  assert.equal(fs.existsSync(delegatedTarget), false,
    'a provider-less outer Full attempt releases after delegation and cannot leak a fake target')

  // Crash-injection matrix: the fake paid command can execute only after generic process proof,
  // transaction child proof, and the one-shot gate release are all durable.
  const invocations = path.join(stateParent, 'provider-invocations.txt')

  const beforeSpawnPlan = freshPlan('ZZTXNJ')
  const beforeSpawn = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNJ', beforeSpawnPlan, {}, state)
  beforeSpawn.registerPaidChildAttempt('before-wrapper-spawn')
  await beforeSpawn.activate()
  await createFakeGate(beforeSpawn, 'before-wrapper-spawn', invocations, 'before-wrapper-spawn')
  await recoverRunPlanTransactions(state)
  assert.equal(fs.existsSync(path.join(REPO_ROOT, beforeSpawnPlan.targetRunRoot)), false,
    'crash after intent but before wrapper spawn restores the prior canonical root')
  assert.deepEqual(invocationRows(invocations), [])

  const afterWrapperPlan = freshPlan('ZZTXNK')
  const afterWrapper = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNK', afterWrapperPlan, {}, state)
  afterWrapper.registerPaidChildAttempt('after-wrapper-spawn')
  await afterWrapper.activate()
  const afterWrapperGate = await createFakeGate(afterWrapper, 'after-wrapper-spawn', invocations, 'after-wrapper-spawn')
  const blockedWrapper = spawnFake(afterWrapperGate.gate, afterWrapperGate.spec)
  await new Promise((resolve) => setTimeout(resolve, 60))
  assert.deepEqual(invocationRows(invocations), [], 'spawned trampoline cannot invoke provider before proof')
  await recoverRunPlanTransactions(state)
  await blockedWrapper
  assert.deepEqual(invocationRows(invocations), [], 'restart aborts an unproved trampoline without spend')

  const beforeReleasePlan = freshPlan('ZZTXNL')
  const beforeRelease = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNL', beforeReleasePlan, {}, state)
  beforeRelease.registerPaidChildAttempt('before-gate-release')
  await beforeRelease.activate()
  const beforeReleaseGate = await createFakeGate(beforeRelease, 'before-gate-release', invocations, 'before-gate-release')
  const provedWrapper = spawnFake(beforeReleaseGate.gate, beforeReleaseGate.spec)
  await readyFake(beforeRelease, 'before-gate-release', beforeReleaseGate.gate, provedWrapper.pid!)
  await new Promise((resolve) => setTimeout(resolve, 60))
  assert.deepEqual(invocationRows(invocations), [], 'two durable proofs still do not spend before release')
  await recoverRunPlanTransactions(state)
  await provedWrapper
  assert.deepEqual(invocationRows(invocations), [], 'crash before gate release remains retryable and unspent')

  const afterReleasePlan = freshPlan('ZZTXNM')
  const afterReleaseRequest = newRequestId()
  const afterRelease = await prepareRunPlanTransaction(afterReleaseRequest, 'ZZTXNM', afterReleasePlan, {}, state)
  afterRelease.registerPaidChildAttempt('after-gate-release')
  await afterRelease.activate()
  const afterReleaseGate = await createFakeGate(afterRelease, 'after-gate-release', invocations, 'after-gate-release')
  const releasedWrapper = spawnFake(afterReleaseGate.gate, afterReleaseGate.spec)
  await readyFake(afterRelease, 'after-gate-release', afterReleaseGate.gate, releasedWrapper.pid!)
  releaseProviderSpawnGate(afterReleaseGate.gate)
  await releasedWrapper
  // Inject restart before markPaidChildStarted: the released gate itself is the authoritative paid boundary.
  await recoverRunPlanTransactions(state)
  assert.equal(fs.existsSync(path.join(REPO_ROOT, afterReleasePlan.targetRunRoot)), true)
  assert.deepEqual(invocationRows(invocations), ['after-gate-release'])
  await assert.rejects(
    prepareRunPlanTransaction(afterReleaseRequest, 'ZZTXNM', afterReleasePlan, {}, state),
    /already crossed the paid provider boundary/,
  )

  const impossibleOrderPlan = freshPlan('ZZTXNN')
  const impossibleOrder = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNN', impossibleOrderPlan, {}, state)
  impossibleOrder.registerPaidChildAttempt('started-before-proof')
  await impossibleOrder.activate()
  await createFakeGate(impossibleOrder, 'started-before-proof', invocations, 'started-before-proof')
  await assert.rejects(
    impossibleOrder.markPaidChildStarted('started-before-proof'),
    /before its durable spawn gate was released|before spawn boundary was sealed/,
    'post-start/pre-process-lease is an unrepresentable state',
  )
  await impossibleOrder.rollbackIfUnstarted('ordering assertion cleanup', 'started-before-proof')
  assert.deepEqual(invocationRows(invocations), ['after-gate-release'])

  // One request/root spans every Full child. A global first release disables rollback but never blocks a
  // later unique child attempt: dependency waves and the terminal master each receive their own gate.
  const sequentialPlan = freshPlan('ZZTXNO')
  const sequential = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNO', sequentialPlan, {}, state)
  await sequential.activate()
  for (const [attemptId, label] of [
    ['module-a', 'sequential-a'], ['module-b', 'sequential-b'], ['terminal-master', 'sequential-master'],
  ] as const) {
    sequential.registerPaidChildAttempt(attemptId)
    const owned = await createFakeGate(sequential, attemptId, invocations, label)
    const child = spawnFake(owned.gate, owned.spec)
    await readyFake(sequential, attemptId, owned.gate, child.pid!)
    releaseProviderSpawnGate(owned.gate)
    await sequential.markPaidChildStarted(attemptId)
    await child
  }

  // Codex process 2 remains one logical run/root, but cannot reuse process 1's released transaction gate.
  const codexContinuationPlan = freshPlan('ZZTXNT')
  const codexContinuation = await prepareRunPlanTransaction(
    newRequestId(), 'ZZTXNT', codexContinuationPlan, {}, state,
  )
  await codexContinuation.activate()
  const logicalAttempt = 'codex-logical-module'
  codexContinuation.registerPaidChildAttempt(logicalAttempt)
  const codexProcess1 = await createFakeGate(
    codexContinuation, logicalAttempt, invocations, 'codex-process-1',
  )
  const codexChild1 = spawnFake(codexProcess1.gate, codexProcess1.spec)
  await readyFake(codexContinuation, logicalAttempt, codexProcess1.gate, codexChild1.pid!)
  releaseProviderSpawnGate(codexProcess1.gate)
  await codexContinuation.markPaidChildStarted(logicalAttempt)
  await codexChild1
  const codexProcess2Attempt = preparedProviderContinuationAttemptId(logicalAttempt, crypto.randomUUID())
  codexContinuation.registerPaidChildAttempt(codexProcess2Attempt)
  const codexProcess2 = await createFakeGate(
    codexContinuation, codexProcess2Attempt, invocations, 'codex-process-2',
  )
  const codexChild2 = spawnFake(codexProcess2.gate, codexProcess2.spec)
  await readyFake(codexContinuation, codexProcess2Attempt, codexProcess2.gate, codexChild2.pid!)
  releaseProviderSpawnGate(codexProcess2.gate)
  await codexContinuation.markPaidChildStarted(codexProcess2Attempt)
  await codexChild2
  assert.deepEqual(invocationRows(invocations).filter((row) => row.startsWith('codex-process-')), [
    'codex-process-1', 'codex-process-2',
  ], 'two provider processes cross two distinct gates exactly once under one transaction/root')

  const staggeredPlan = freshPlan('ZZTXNQ')
  const staggered = await prepareRunPlanTransaction(newRequestId(), 'ZZTXNQ', staggeredPlan, {}, state)
  staggered.registerPaidChildAttempt('staggered-a')
  staggered.registerPaidChildAttempt('staggered-b')
  await staggered.activate()
  const staggeredA = await createFakeGate(staggered, 'staggered-a', invocations, 'staggered-a')
  const staggeredAChild = spawnFake(staggeredA.gate, staggeredA.spec)
  await readyFake(staggered, 'staggered-a', staggeredA.gate, staggeredAChild.pid!)
  releaseProviderSpawnGate(staggeredA.gate)
  await staggered.markPaidChildStarted('staggered-a')
  await staggeredAChild
  // B was registered in the same initial wave but intentionally creates its gate after A sealed `started`.
  const staggeredB = await createFakeGate(staggered, 'staggered-b', invocations, 'staggered-b')
  const staggeredBChild = spawnFake(staggeredB.gate, staggeredB.spec)
  await readyFake(staggered, 'staggered-b', staggeredB.gate, staggeredBChild.pid!)
  releaseProviderSpawnGate(staggeredB.gate)
  await staggered.markPaidChildStarted('staggered-b')
  await staggeredBChild

  assert.deepEqual(invocationRows(invocations), [
    'after-gate-release',
    'sequential-a', 'sequential-b', 'sequential-master',
    'codex-process-1', 'codex-process-2',
    'staggered-a', 'staggered-b',
  ], 'every released child executes exactly once; every pre-release crash executes zero times')

  // A released child is not the end of a Full request. The existing transaction journal owns the exact
  // scheduler intent through every no-RunState gap, including module A -> B and final module -> master.
  const chainPlan = freshPlan('ZZTXNU')
  const chainRequest = newRequestId()
  const chain = await prepareRunPlanTransaction(chainRequest, 'ZZTXNU', chainPlan, {}, state)
  const chainId = crypto.randomUUID()
  const chainProfile = {
    provider: 'claude' as const,
    model: 'sonnet',
    reasoningLevel: 'default',
    profileKey: 'claude:sonnet:default',
    executionProfile: {
      key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default',
    },
  }
  const artifactA = { outputRel: 'a/99_a-synthesis.md', sha256: `sha256:${'a'.repeat(64)}` }
  const artifactB = { outputRel: 'b/99_b-synthesis.md', sha256: `sha256:${'b'.repeat(64)}` }
  await chain.activate()
  await chain.beginChainIntent({
    chainId,
    user: 'tester',
    userVia: 'local',
    selection: chainProfile,
    modules: [
      { module: 'a', dependsOn: [], synthesisOutputs: [artifactA.outputRel] },
      { module: 'b', dependsOn: ['a'], synthesisOutputs: [artifactB.outputRel] },
    ],
    completed: [],
    nextModules: ['a'],
  })
  chain.registerPaidChildAttempt('chain-module-a')
  await sealStarted(chain, 'chain-module-a')
  await chain.recordChainProgress({
    completed: [{ module: 'a', artifacts: [artifactA] }],
    nextModules: ['b'],
    inflightModules: [],
    masterState: 'pending',
  })
  await recoverRunPlanTransactions(state) // crash after A closes and before B owns a RunState
  const afterModuleGap = await readRecoverableChainIntent(chainRequest, state)
  assert.ok(afterModuleGap, 'the exact chain remains discoverable with no live child between waves')
  assert.equal(afterModuleGap.targetRunRoot, chainPlan.targetRunRoot)
  assert.deepEqual(afterModuleGap.intent.completed, [{ module: 'a', artifacts: [artifactA] }],
    'restart retains the completed module hash instead of paying for A again')
  assert.deepEqual(afterModuleGap.intent.nextModules, ['b'])
  assert.equal(afterModuleGap.intent.selection.profileKey, chainProfile.profileKey)
  assert.ok((await listRecoverableChainIntents(state)).some((record) => record.requestId === chainRequest))
  const alteredChainRecord = structuredClone(afterModuleGap)
  alteredChainRecord.intent.nextModules = ['a']
  await assert.rejects(
    resumeRecoverableChainIntent({
      record: alteredChainRecord,
      revalidatedPlan: chainPlan,
      resolvedProfile: chainProfile,
    }, {}, state),
    /record was altered/,
    'a caller cannot rewrite the remaining work after reading the protected chain intent',
  )
  const changedChainPlan = structuredClone(chainPlan)
  changedChainPlan.run = [...changedChainPlan.run, 'invented-current-module']
  await assert.rejects(
    resumeRecoverableChainIntent({
      record: afterModuleGap,
      revalidatedPlan: changedChainPlan,
      resolvedProfile: chainProfile,
    }, {}, state),
    /plan changed/,
    'restart cannot widen the original exact receipt with current Full scope',
  )
  await assert.rejects(
    resumeRecoverableChainIntent({
      record: afterModuleGap,
      revalidatedPlan: chainPlan,
      resolvedProfile: {
        provider: 'claude', model: 'opus', reasoningLevel: 'default',
        profileKey: 'claude:opus:default',
        executionProfile: {
          key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default',
        },
      },
    }, {}, state),
    /provider capability changed/,
    'restart cannot substitute a provider model or profile',
  )
  const recoveredChain = await resumeRecoverableChainIntent({
    record: afterModuleGap,
    revalidatedPlan: chainPlan,
    resolvedProfile: chainProfile,
  }, {}, state)
  assert.deepEqual(recoveredChain.recoveredChainIntent, afterModuleGap.intent,
    'the reopened scheduler receives only journal-sealed completion evidence')
  recoveredChain.registerPaidChildAttempt('chain-module-b')
  await sealStarted(recoveredChain, 'chain-module-b')
  await recoveredChain.recordChainProgress({
    completed: [
      { module: 'a', artifacts: [artifactA] },
      { module: 'b', artifacts: [artifactB] },
    ],
    nextModules: [],
    inflightModules: [],
    masterState: 'ready',
  })
  await recoverRunPlanTransactions(state) // crash after final module closes and before master registration
  const beforeMaster = await readRecoverableChainIntent(chainRequest, state)
  assert.ok(beforeMaster)
  assert.equal(beforeMaster.intent.masterState, 'ready')
  assert.deepEqual(beforeMaster.intent.completed.map((entry) => entry.module), ['a', 'b'])
  const recoveredMaster = await resumeRecoverableChainIntent({
    record: beforeMaster,
    revalidatedPlan: chainPlan,
    resolvedProfile: chainProfile,
  }, {}, state)
  recoveredMaster.registerPaidChildAttempt('chain-terminal-master')
  await sealStarted(recoveredMaster, 'chain-terminal-master')
  await recoveredMaster.recordChainProgress({
    completed: beforeMaster.intent.completed,
    nextModules: [],
    inflightModules: [],
    masterState: 'published',
  })
  await recoveredMaster.recordChainTerminal('done')
  assert.equal(await readRecoverableChainIntent(chainRequest, state), null,
    'only published terminal output removes the chain from automatic recovery')

  // User cancellation is sealed before SIGTERM/close. Inject a supervisor crash immediately after the
  // durable call: the paid child has no close callback, yet startup has exact authority never to revive it.
  const cancelledPlan = freshPlan('ZZTXNV')
  const cancelledRequest = newRequestId()
  const cancelledChainId = crypto.randomUUID()
  const cancelled = await prepareRunPlanTransaction(cancelledRequest, 'ZZTXNV', cancelledPlan, {}, state)
  await cancelled.activate()
  await cancelled.beginChainIntent({
    chainId: cancelledChainId,
    user: 'tester',
    userVia: 'local',
    selection: chainProfile,
    modules: [{ module: 'a', dependsOn: [], synthesisOutputs: [artifactA.outputRel] }],
    completed: [],
    nextModules: ['a'],
  })
  cancelled.registerPaidChildAttempt('cancelled-live-child')
  await sealStarted(cancelled, 'cancelled-live-child')
  const cancellationIdentity = {
    requestId: cancelledRequest,
    chainId: cancelledChainId,
    targetRunRoot: cancelledPlan.targetRunRoot,
  }
  await assert.rejects(
    cancelled.cancelChainIntent({ ...cancellationIdentity, targetRunRoot: chainPlan.targetRunRoot }),
    /identity does not match/,
    'a cancel for another root cannot terminalize this paid chain',
  )
  await cancelled.cancelChainIntent(cancellationIdentity)
  await cancelled.cancelChainIntent(cancellationIdentity) // double-click/retry is idempotent
  const cancelledRecord = await readCancelledChainIntent(cancelledRequest, state)
  assert.deepEqual({
    requestId: cancelledRecord?.requestId,
    chainId: cancelledRecord?.chainId,
    targetRunRoot: cancelledRecord?.targetRunRoot,
  }, {
    requestId: cancelledRequest,
    chainId: cancelledChainId,
    targetRunRoot: cancelledPlan.targetRunRoot,
  })
  assert.equal(await readRecoverableChainIntent(cancelledRequest, state), null,
    'the protected chain leaves automatic recovery before any process-close callback')
  await recoverRunPlanTransactions(state) // simulated crash before close callback
  assert.equal(await readRecoverableChainIntent(cancelledRequest, state), null)
  assert.ok((await listCancelledChainIntents(state)).some((record) =>
    record.requestId === cancelledRequest && record.targetRunRoot === cancelledPlan.targetRunRoot),
  'durable cancellation remains queryable after startup reconciliation')

  // An ACKed launch that exhausts local technical checks becomes a protected exact retry, not a fake
  // canonical run, a failed request, or a rebuilt Full plan after restart.
  const deferredPlan = freshPlan('ZZTXNR')
  const deferredTarget = path.join(REPO_ROOT, deferredPlan.targetRunRoot)
  const deferredRequest = newRequestId()
  const deferred = await prepareRunPlanTransaction(deferredRequest, 'ZZTXNR', deferredPlan, {}, state)
  fs.writeFileSync(path.join(deferred.preparation.stagingRootAbs, 'retained-private.txt'), 'exact reviewed bytes\n')
  deferred.registerPaidChildAttempt('bounded-readiness-check')
  await deferred.activate()
  const dueAt = Date.now() + 10_000
  const authority = retryAuthority(dueAt)
  const deferredRecord = await deferred.deferPreSpendRetry(authority)
  assert.equal(fs.existsSync(deferredTarget), false, 'a new target disappears while its exact retry waits')
  assert.equal(fs.existsSync(path.join(deferred.preparation.stagingRootAbs, 'retained-private.txt')), true,
    'the sanitized exact plan remains private for revalidation')
  assert.equal(deferredRecord.reviewedPlan.continuationReceipt.fingerprint,
    deferredPlan.continuationReceipt.fingerprint)
  assert.deepEqual(deferredRecord.reviewedPlan.continuationReceipt.payableOrbKeys,
    deferredPlan.continuationReceipt.payableOrbKeys, 'the exact payable identities survive deferral')
  assert.deepEqual((await listDeferredPreSpendRetries(state)).map((record) => record.requestId), [deferredRequest])
  await assert.rejects(
    prepareRunPlanTransaction(deferredRequest, 'ZZTXNR', deferredPlan, {}, state),
    /waiting for an exact pre-spend retry/,
    'ordinary preparation cannot replace a protected retry with current Full scope',
  )
  await assert.rejects(
    rearmDeferredPreSpendRetry({
      record: deferredRecord,
      revalidatedPlan: deferredPlan,
      resolvedProfile: {
        provider: authority.provider, model: authority.model, reasoningLevel: authority.reasoningLevel,
        profileKey: authority.profileKey, executionProfile: authority.executionProfile,
      },
      nowMs: dueAt - 1,
    }, {}, state),
    /not due yet/,
  )
  const widenedPlan = structuredClone(deferredPlan)
  widenedPlan.run = [...widenedPlan.run, 'invented-current-module']
  await assert.rejects(
    rearmDeferredPreSpendRetry({
      record: deferredRecord,
      revalidatedPlan: widenedPlan,
      resolvedProfile: {
        provider: authority.provider, model: authority.model, reasoningLevel: authority.reasoningLevel,
        profileKey: authority.profileKey, executionProfile: authority.executionProfile,
      },
      nowMs: dueAt,
    }, {}, state),
    /plan changed/,
    'a deploy/data/roster change cannot widen the frozen retry',
  )
  await assert.rejects(
    rearmDeferredPreSpendRetry({
      record: deferredRecord,
      revalidatedPlan: deferredPlan,
      resolvedProfile: {
        provider: 'claude', model: 'opus', reasoningLevel: 'default',
        profileKey: 'claude:opus:default',
        executionProfile: {
          key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default',
        },
      },
      nowMs: dueAt,
    }, {}, state),
    /provider capability changed/,
  )
  const firstRearm = await rearmDeferredPreSpendRetry({
    record: deferredRecord,
    revalidatedPlan: deferredPlan,
    resolvedProfile: {
      provider: authority.provider, model: authority.model, reasoningLevel: authority.reasoningLevel,
      profileKey: authority.profileKey, executionProfile: authority.executionProfile,
    },
    nowMs: dueAt,
  }, {}, state)
  // Restart before reactivation returns to waiting without exposing or deleting the retained plan.
  const rearmRecovery = await recoverRunPlanTransactions(state)
  assert.deepEqual(rearmRecovery.waitingPreSpendRetry, [deferredRequest])
  assert.equal(fs.existsSync(deferredTarget), false)
  assert.equal(fs.existsSync(path.join(firstRearm.preparation.stagingRootAbs, 'retained-private.txt')), true)
  const recoveredRecord = await readDeferredPreSpendRetry(deferredRequest, state)
  assert.ok(recoveredRecord)
  assert.equal(recoveredRecord.rearmCount, 1)
  const finalRearm = await rearmDeferredPreSpendRetry({
    record: recoveredRecord,
    revalidatedPlan: deferredPlan,
    resolvedProfile: {
      provider: authority.provider, model: authority.model, reasoningLevel: authority.reasoningLevel,
      profileKey: authority.profileKey, executionProfile: authority.executionProfile,
    },
    nowMs: dueAt,
  }, {}, state)
  finalRearm.registerPaidChildAttempt('recovered-exact-child')
  await finalRearm.activate()
  await sealStarted(finalRearm, 'recovered-exact-child')
  assert.equal(fs.readFileSync(path.join(deferredTarget, 'retained-private.txt'), 'utf8'), 'exact reviewed bytes\n')
  assert.equal(await readDeferredPreSpendRetry(deferredRequest, state), null,
    'a released exact child removes the record from the waiting lane')

  // A prior canonical root is restored byte-for-byte while the new exact tree waits privately.
  const restoredPlan = freshPlan('ZZTXNS')
  const restoredTarget = path.join(REPO_ROOT, restoredPlan.targetRunRoot)
  fs.mkdirSync(restoredTarget, { recursive: true })
  fs.writeFileSync(path.join(restoredTarget, 'original.txt'), 'original canonical bytes\n')
  const restoredRequest = newRequestId()
  const restored = await prepareRunPlanTransaction(restoredRequest, 'ZZTXNS', restoredPlan, {}, state)
  fs.writeFileSync(path.join(restored.preparation.stagingRootAbs, 'new-private.txt'), 'new exact bytes\n')
  await restored.activate()
  const restoredRecord = await restored.deferPreSpendRetry(retryAuthority())
  assert.equal(fs.readFileSync(path.join(restoredTarget, 'original.txt'), 'utf8'), 'original canonical bytes\n')
  assert.equal(fs.existsSync(path.join(restoredTarget, 'new-private.txt')), false)
  assert.equal(fs.existsSync(path.join(restored.preparation.stagingRootAbs, 'new-private.txt')), true)

  // Owner-only files are not enough by themselves: any byte-level journal or caller-record alteration
  // invalidates the integrity seal and cannot be rearmed.
  const alteredRecord = structuredClone(restoredRecord)
  alteredRecord.authority.localAttempts += 1
  await assert.rejects(
    rearmDeferredPreSpendRetry({
      record: alteredRecord,
      revalidatedPlan: restoredPlan,
      resolvedProfile: {
        provider: restoredRecord.authority.provider,
        model: restoredRecord.authority.model,
        reasoningLevel: restoredRecord.authority.reasoningLevel,
        profileKey: restoredRecord.authority.profileKey,
        executionProfile: restoredRecord.authority.executionProfile,
      },
    }, {}, state),
    /record was altered/,
  )
  const restoredJournal = path.join(state, 'run-plan-transactions', restoredRequest, 'transaction.json')
  const tampered = JSON.parse(fs.readFileSync(restoredJournal, 'utf8'))
  tampered.reviewedPlan.run = [...tampered.reviewedPlan.run, 'tampered-module']
  fs.writeFileSync(restoredJournal, `${JSON.stringify(tampered, null, 2)}\n`, { mode: 0o600 })
  await assert.rejects(readDeferredPreSpendRetry(restoredRequest, state), /unsafe or altered/)

  console.log('run-plan transaction: atomic recovery, gated crash windows, exact deferred retry, and per-child no-double-spend passed')
} finally {
  for (const target of createdTargets) fs.rmSync(target, { recursive: true, force: true })
  for (const requestId of createdRequests) {
    fs.rmSync(path.join(ANALYSES_DIR, '.run-plan-transactions', requestId), { recursive: true, force: true })
  }
  fs.rmSync(stateParent, { recursive: true, force: true })
}
