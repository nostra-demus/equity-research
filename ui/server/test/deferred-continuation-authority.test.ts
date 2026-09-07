process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { launch, type LaunchParams } from '../src/launcher'
import { getProviderAdapter } from '../src/providers/registry'
import type { PreparedRunPlanTransaction, PreSpendRetryAuthority } from '../src/run-plan-transaction'

// Exercise the real launch authority boundary. The disabled provider is the next gate, so even the
// accepted cases cannot start a provider, create a run, or spend anything.
const previous = process.env.ENGINE_CODEX_ENABLED
delete process.env.ENGINE_CODEX_ENABLED
const resolved = getProviderAdapter('codex').resolveProfile({})
const root = 'analyses/ZDCAUTH_2099-04-02'
const chainId = randomUUID()
const authority: PreSpendRetryAuthority = {
  reason: 'engine_restarted_before_spend', recoveryRequestId: chainId,
  provider: resolved.provider, model: resolved.model, reasoningLevel: resolved.reasoningLevel ?? null,
  profileKey: resolved.profileKey, executionProfile: resolved.executionProfile,
  localAttempts: 1, notBeforeMs: 0,
}
let registrations = 0
let deferrals = 0
const transaction = () => ({
  requestId: randomUUID(),
  preparation: { targetRunRoot: root, stagingRootAbs: '/not-used', carried: [], doneOrbKeys: [], ranClean: [] },
  recoveredChainIntent: { chainId }, continuationRetryAuthority: authority,
  registerPaidChildAttempt: () => { registrations++ },
  deferPreSpendRetry: async () => { deferrals++; return {} },
  rollbackIfUnstarted: async () => undefined,
}) as unknown as PreparedRunPlanTransaction
const params = (kind: 'full' | 'module' | 'rerun'): LaunchParams => ({
  kind, ticker: 'ZDCAUTH', continuation: true, runRoot: root,
  ...(kind !== 'full' ? { chained: true, chainId, module: kind === 'rerun' ? 'master' : 'business-model' } : {}),
  provider: resolved.provider, model: resolved.model, reasoningLevel: resolved.reasoningLevel,
  expectedProfileKey: resolved.profileKey,
  preparedRunPlanTransaction: transaction(), preSpendRetryAuthority: authority,
})
try {
  for (const kind of ['full', 'module', 'rerun'] as const) {
    await assert.rejects(launch(params(kind)), (error: any) => error?.code === 'PROVIDER_DISABLED',
      `${kind} keeps its protected Continue authority until the independent provider availability gate`)
  }
  const valid = params('module')
  const mismatches: LaunchParams[] = [
    { ...valid, continuation: false },
    { ...valid, runRoot: 'analyses/ZDCAUTH_2099-04-03' },
    { ...valid, chainId: randomUUID() },
    { ...valid, chained: false },
    { ...valid, preSpendRetryAuthority: { ...authority, recoveryRequestId: randomUUID() } },
    { ...valid, preparedRunPlanTransaction: { ...transaction(), continuationRetryAuthority: undefined } },
  ]
  for (const mismatch of mismatches) {
    await assert.rejects(launch(mismatch), (error: any) => error?.code === 'pre_spend_retry_authority_changed',
      'a caller cannot repurpose the protected Continue transaction by changing a flag or identity')
  }
  assert.equal(registrations, 9)
  assert.equal(deferrals, 3, 'only the three correctly bound unavailable launches reach retry deferral')
  console.log('deferred Continue launch authority: exact full/module/master accepted; substitutions rejected before provider')
} finally {
  if (previous === undefined) delete process.env.ENGINE_CODEX_ENABLED
  else process.env.ENGINE_CODEX_ENABLED = previous
}
