import assert from 'node:assert/strict'
import { CODEX_EXECUTION_PROFILE } from './provider'
import { normalizeRunSnapshotIdentity, reconcileRunIdentity, sseFrameForRun } from './runIdentity'

const adopted = {
  runId: 'run-1', ticker: 'AAA', swarmId: 'research', kind: 'full',
  provider: 'codex' as const,
  executionProfile: CODEX_EXECUTION_PROFILE,
  profileKey: CODEX_EXECUTION_PROFILE.key,
  model: CODEX_EXECUTION_PROFILE.parentModel,
  reasoningLevel: CODEX_EXECUTION_PROFILE.parentReasoning,
  chainId: 'chain-1', executionEpoch: 'epoch-1',
}

assert.ok(reconcileRunIdentity(adopted, { runId: 'run-1', type: 'run-heartbeat', chainId: 'chain-1' }))
assert.equal(reconcileRunIdentity(adopted, { runId: 'run-2', type: 'run-heartbeat' }), null)
assert.equal(reconcileRunIdentity(adopted, { runId: 'run-1', provider: 'claude' }), null)
assert.equal(reconcileRunIdentity(adopted, { runId: 'run-1', executionEpoch: 'epoch-2' }), null)
assert.equal(reconcileRunIdentity(adopted, {
  runId: 'run-1', provider: 'codex', executionProfile: CODEX_EXECUTION_PROFILE,
  profileKey: CODEX_EXECUTION_PROFILE.key, model: CODEX_EXECUTION_PROFILE.parentModel,
  reasoningLevel: 'high',
}), null, 'one contradictory scalar rejects an otherwise exact nested profile')

const snapshot = {
  ...adopted,
  continuation: true,
  status: 'running', agents: [], expected: [],
}
assert.equal(normalizeRunSnapshotIdentity(snapshot, { runId: 'run-1', ticker: 'AAA', swarmId: 'research' })?.continuation, true)
assert.equal(normalizeRunSnapshotIdentity({ ...snapshot, runId: 'other' }, { runId: 'run-1', ticker: 'AAA', swarmId: 'research' }), null)
assert.equal(normalizeRunSnapshotIdentity({ ...snapshot, ticker: 'BBB' }, { runId: 'run-1', ticker: 'AAA', swarmId: 'research' }), null)
assert.equal(normalizeRunSnapshotIdentity({ ...snapshot, swarmId: 'commodity' }, { runId: 'run-1', ticker: 'AAA', swarmId: 'research' }), null)
assert.equal(normalizeRunSnapshotIdentity({ ...snapshot, profileKey: 'codex:drift' }, { runId: 'run-1', ticker: 'AAA', swarmId: 'research' }), null)

assert.equal(sseFrameForRun({ type: 'run-done', runId: 'run-1' }, 'run-1', ['run-done']), true)
assert.equal(sseFrameForRun({ type: 'run-done', runId: 'run-2' }, 'run-1', ['run-done']), false)
assert.equal(sseFrameForRun({ type: 'made-up', runId: 'run-1' }, 'run-1', ['run-done']), false)

console.log('runIdentity.test.ts: immutable snapshot/SSE identity guards passed')
