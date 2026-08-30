process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  admitExactSavedRunContinuation, automaticContinuationRequestId, continueExactSavedRun,
  exactContinuationCandidate, exactModuleContinuationScope, reviewExactSavedRunContinuation,
  type ExactContinuationAdmissionDeps, type ExactContinuationDeps,
} from '../src/continuation'
import type { LaunchParams } from '../src/launcher'
import type { ResumableRunInfo } from '../src/resumable'
import type { PreparedRunPlanTransaction } from '../src/run-plan-transaction'
import { buildSwarmGraph } from '../src/roster'

const saved: ResumableRunInfo = {
  swarm: 'research',
  subject: 'KAR',
  runRoot: 'analyses/KAR_2026-08-27',
  kind: 'full',
  doneCount: 4,
  totalCount: 7,
  unit: 'module',
}

assert.equal(exactContinuationCandidate({
  swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full',
}, [saved]), saved)
assert.equal(exactContinuationCandidate({
  swarm: 'research', subject: ' kar ', runRoot: saved.runRoot, kind: 'full',
}, [saved]), saved, 'saved-run identity comparison defensively normalizes the ticker')
assert.equal(exactContinuationCandidate({
  swarm: 'research', subject: 'KAR', runRoot: 'analyses/KAR_2026-08-29', kind: 'full',
}, [saved]), null, 'a newer/today root is never substituted for the selected saved root')

let launched: LaunchParams | null = null
const prepared: PreparedRunPlanTransaction = {
  requestId: '11111111-1111-5111-8111-111111111111',
  preparation: {
    stagingRootAbs: '/private/staged', targetRunRoot: saved.runRoot,
    carried: [], doneOrbKeys: ['beta/01_beta-thing'], ranClean: [],
  },
  registerPaidChildAttempt() {},
  async activate() {},
  async markPaidChildSpawning() { return {} as any },
  async markPaidChildSpawnReady() {},
  async markPaidChildStarted() {},
  async rollbackIfUnstarted() {},
}
const deps: ExactContinuationDeps = {
  resumable: () => [saved],
  launch: async (params) => {
    launched = params
    return { runId: 'run-1', preflight: {} as any }
  },
}

await continueExactSavedRun({
  swarm: 'research', subject: ' kar ', runRoot: saved.runRoot, kind: 'full',
  provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
  expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  user: 'ceekay@muns.io', userVia: 'cf-access',
  preparedRunPlanTransaction: prepared,
}, deps)

assert.deepEqual(launched, {
  kind: 'full', ticker: 'KAR', module: undefined,
  provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
  expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  user: 'ceekay@muns.io', userVia: 'cf-access',
  runRoot: saved.runRoot, continuation: true,
  requireExistingFrozenPoolReceipt: true,
  preparedRunPlanTransaction: prepared,
}, 'provider/profile/user and the server-owned saved identity reach the one launcher boundary')

let unsafeLaunches = 0
await assert.rejects(
  continueExactSavedRun({
    swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full', provider: 'claude',
  }, {
    resumable: () => [saved],
    launch: async () => { unsafeLaunches++; return { runId: 'impossible', preflight: {} as any } },
  }),
  (error: any) => error?.body?.code === 'continuation_transaction_required',
)
assert.equal(unsafeLaunches, 0, 'a direct research Continue without private transaction fails before launch')

let staleLaunches = 0
await assert.rejects(
  continueExactSavedRun({
    swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full', provider: 'claude',
    preparedRunPlanTransaction: prepared,
  }, {
    resumable: () => [],
    launch: async () => { staleLaunches++; return { runId: 'impossible', preflight: {} as any } },
  }),
  (error: any) => error?.statusCode === 409 && error?.body?.code === 'saved_run_changed',
)
assert.equal(staleLaunches, 0, 'a changed saved identity fails before the launcher/provider boundary')

const requestId = automaticContinuationRequestId(saved.runRoot, '22222222-2222-4222-8222-222222222222')
assert.equal(requestId, automaticContinuationRequestId(saved.runRoot, '22222222-2222-4222-8222-222222222222'),
  'one protected interruption derives one stable request identity across restarts')
assert.notEqual(requestId, automaticContinuationRequestId(saved.runRoot, '33333333-3333-4333-8333-333333333333'),
  'a later interrupted provider attempt receives a new request identity')

const receipt = {
  version: 2, action: 'continue', swarm: 'research', subject: 'KAR', sourceRunRoots: [saved.runRoot],
  targetRunRoot: saved.runRoot,
  provider: { id: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max', profileKey: 'profile' },
  reusableOrbKeys: ['alpha/01_alpha'], payableOrbKeys: ['beta/01_beta'],
  dataPool: { files: 1, newestMs: 1, sha256: `sha256:${'a'.repeat(64)}` },
  evidenceGenerationDigest: 'a'.repeat(64), reusableArtifacts: [],
  reusableArtifactsSha256: `sha256:${'b'.repeat(64)}`,
  verifiedLineageSha256: `sha256:${'c'.repeat(64)}`,
  sourceArtifactsSha256: `sha256:${'d'.repeat(64)}`,
  fingerprint: `sha256:${'e'.repeat(64)}`,
} as const
const plan = {
  complete: false, targetRunRoot: saved.runRoot, reuse: ['alpha'], run: ['beta'],
  continuationReceipt: receipt,
} as any
let claims = 0
let preparations = 0
let paidAttempts = 0
let admitted = 0
const admissionDeps: ExactContinuationAdmissionDeps = {
  resumable: () => [saved],
  plan: async () => plan,
  receiptMatches: (left, right) => left.fingerprint === right.fingerprint,
  claim: async (intent) => {
    claims++
    return {
      kind: 'new',
      record: {
        version: 1, requestId: intent.requestId, planFingerprint: intent.planFingerprint,
        user: intent.user, subject: intent.subject, status: 'claimed',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), instanceId: 'fixture',
      },
    }
  },
  prepare: async () => { preparations++; return prepared },
  launch: async (params) => {
    paidAttempts++
    assert.equal(params.runRoot, saved.runRoot)
    assert.equal(params.preparedRunPlanTransaction, prepared)
    return { runId: 'headless-run', preflight: {} as any }
  },
  markAdmitted: async () => { admitted++ },
  markStarted: async () => {},
  markFailed: async () => {},
}

const reviewed = await reviewExactSavedRunContinuation({
  swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full', provider: 'codex',
  model: 'gpt-5.6-sol', reasoningLevel: 'max', expectedProfileKey: 'profile', requestId,
}, admissionDeps)
const admittedResult = await admitExactSavedRunContinuation({
  swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full', provider: 'codex',
  model: 'gpt-5.6-sol', reasoningLevel: 'max', expectedProfileKey: 'profile', user: 'auto', userVia: 'local',
  reviewed,
}, admissionDeps)
assert.equal(admittedResult.replay, false)
assert.deepEqual({ claims, preparations, paidAttempts, admitted }, {
  claims: 1, preparations: 1, paidAttempts: 1, admitted: 1,
}, 'headless Continue performs one CAS claim, one private transaction, and one paid launch')

const savedModule: ResumableRunInfo = {
  ...saved, kind: 'module', module: 'management-governance', doneCount: 1, totalCount: 14, unit: 'orb',
}
const exactModuleNode = buildSwarmGraph('research').modules.find((node) => node.name === savedModule.module)!
const exactModuleAgents = Object.values(exactModuleNode.layers).flat()
const exactDoneKey = exactModuleAgents.find((agent) => !agent.isSynthesis)!.key
const modulePlan = {
  ...plan,
  run: [savedModule.module],
  reuse: [],
  modules: [{
    module: savedModule.module, state: 'partial', runnable: true, blockedBy: [],
    doneOrbKeys: [exactDoneKey], willRunAgents: exactModuleAgents.length - 1,
  }],
  exactModuleScope: { module: savedModule.module, savedInputs: [] },
} as any
const reviewedModuleScope = exactModuleContinuationScope(modulePlan, savedModule.module!)
const reviewedModule = await reviewExactSavedRunContinuation({
  swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'module', module: savedModule.module,
  provider: 'codex', expectedProfileKey: 'profile',
  requestId: '44444444-4444-5444-8444-444444444444',
}, {
  resumable: () => [savedModule],
  plan: async () => modulePlan,
})
assert.deepEqual(reviewedModule.exactModule, reviewedModuleScope,
  'headless review freezes exact module inputs, reusable orbs, and payable specialist/synthesis identities')
let genericModulePrepares = 0
let privateModulePrepares = 0
let moduleLaunches = 0
await admitExactSavedRunContinuation({
  swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'module', module: savedModule.module,
  provider: 'codex', expectedProfileKey: 'profile',
  reviewed: reviewedModule,
  launchOptions: {
    deferModuleMemo: true,
    exactModuleResume: true,
    exactModuleInputs: [],
    exactModuleRunRoot: saved.runRoot,
    exactModuleWritableOrbs: reviewedModuleScope.writableOrbs,
    exactModuleSynthesisOrbs: reviewedModuleScope.synthesisOrbs,
    preSpawnGuard: () => ({ ok: true }),
    terminalGuard: async () => ({ ok: true }),
  },
  prepareTransaction: async () => { privateModulePrepares++; return prepared },
}, {
  ...admissionDeps,
  resumable: () => [savedModule],
  plan: async () => modulePlan,
  prepare: async () => { genericModulePrepares++; return prepared },
  claim: async (intent) => ({
    kind: 'new',
    record: {
      version: 1, requestId: intent.requestId, planFingerprint: intent.planFingerprint,
      user: intent.user, subject: intent.subject, status: 'claimed',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), instanceId: 'fixture',
    },
  }),
  launch: async (params) => {
    moduleLaunches++
    assert.equal(params.kind, 'module')
    assert.equal(params.module, savedModule.module)
    assert.equal(params.runRoot, saved.runRoot)
    assert.equal(params.continuation, true)
    assert.equal(params.chained, true)
    assert.equal(params.chainId, prepared.requestId)
    assert.equal(params.requireExistingFrozenPoolReceipt, true)
    assert.equal(params.exactModuleResume, true)
    assert.deepEqual(params.exactModuleInputs, [])
    return { runId: 'module-run', preflight: {} as any }
  },
})
assert.deepEqual({ genericModulePrepares, privateModulePrepares, moduleLaunches }, {
  genericModulePrepares: 0, privateModulePrepares: 1, moduleLaunches: 1,
}, 'exact module Continue uses its scoped private transaction and one frozen paid launch')

let changedClaims = 0
await assert.rejects(
  admitExactSavedRunContinuation({
    swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full', provider: 'codex', reviewed,
  }, {
    ...admissionDeps,
    plan: async () => ({ ...plan, continuationReceipt: { ...receipt, fingerprint: `sha256:${'f'.repeat(64)}` } }),
    claim: async (...args) => { changedClaims++; return admissionDeps.claim(...args) },
  }),
  (error: any) => error?.body?.code === 'plan_changed',
)
assert.equal(changedClaims, 0, 'a changed reusable/payable plan fails before its durable claim and spend')

let changedModuleClaims = 0
let changedModulePrepares = 0
let changedModuleLaunches = 0
await assert.rejects(
  admitExactSavedRunContinuation({
    swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'module', module: savedModule.module,
    provider: 'codex', expectedProfileKey: 'profile',
    reviewed: {
      requestId: '55555555-5555-5555-8555-555555555555', continuationReceipt: receipt, reuse: [],
      exactModule: reviewedModuleScope,
    },
    prepareTransaction: async () => { changedModulePrepares++; return prepared },
  }, {
    ...admissionDeps,
    resumable: () => [savedModule],
    plan: async () => ({ ...modulePlan, continuationReceipt: { ...receipt, fingerprint: `sha256:${'8'.repeat(64)}` } }),
    claim: async (...args) => { changedModuleClaims++; return admissionDeps.claim(...args) },
    launch: async () => { changedModuleLaunches++; return { runId: 'impossible', preflight: {} as any } },
  }),
  (error: any) => error?.body?.code === 'plan_changed',
)
assert.deepEqual({ changedModuleClaims, changedModulePrepares, changedModuleLaunches }, {
  changedModuleClaims: 0, changedModulePrepares: 0, changedModuleLaunches: 0,
}, 'module artifact drift after modal consent fails before durable claim, private writes, or provider child')

let replayPrepares = 0
let replayLaunches = 0
const replay = await admitExactSavedRunContinuation({
  swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full', provider: 'codex', reviewed,
}, {
  ...admissionDeps,
  claim: async () => ({
    kind: 'replay',
    record: {
      version: 1, requestId, planFingerprint: receipt.fingerprint, user: 'auto', subject: 'KAR',
      status: 'started', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      instanceId: 'prior', runId: 'headless-run', response: { runId: 'headless-run' },
    },
  }),
  prepare: async (...args) => { replayPrepares++; return admissionDeps.prepare(...args) },
  launch: async (...args) => { replayLaunches++; return admissionDeps.launch(...args) },
})
assert.equal(replay.replay, true)
assert.deepEqual(replay.response, { runId: 'headless-run' })
assert.equal(replayPrepares, 0)
assert.equal(replayLaunches, 0, 'a restarted supervisor replays the one durable attempt instead of spending twice')

console.log('exact continuation: exact transaction, CAS, durable at-most-once identity, and no fallback passed')
