import assert from 'node:assert/strict'
import { activityExecutionKey, buildActivityUnits, exactResumableForActivity } from './activityGroups'
import type { ActivityRow, ResumableRunInfo } from './types'

function row(runId: string, overrides: Partial<ActivityRow> = {}): ActivityRow {
  return {
    runId,
    user: 'local',
    userVia: 'local',
    kind: 'module',
    ticker: 'GOLD',
    swarm: 'commodity',
    runRoot: 'analyses/GOLD_2026-08-21',
    module: 'supply',
    provider: 'claude',
    launchedAt: 1_000,
    finishedAt: 2_000,
    status: 'done',
    ...overrides,
  }
}

// A stable commodity folder is not an execution identity. A failed Claude attempt and a later Codex
// retry remain separate rows, so failure, provider, and cost cannot leak into the new attempt's rollup.
const separateEpochs = buildActivityUnits([
  row('new-codex', { executionEpoch: 'attempt-b', provider: 'codex', launchedAt: 4_000, finishedAt: 5_000 }),
  row('old-claude', { executionEpoch: 'attempt-a', provider: 'claude', status: 'error', costUsd: 9, launchedAt: 1_000 }),
], true)
assert.equal(separateEpochs.runCount, 2)
assert.deepEqual(separateEpochs.units.map((unit) => unit.kind), ['row', 'row'])
assert.equal(separateEpochs.units[0].kind === 'row' ? separateEpochs.units[0].row.provider : null, 'codex')
assert.equal(separateEpochs.units[0].kind === 'row' ? separateEpochs.units[0].row.costUsd : null, undefined)

// Mixed is meaningful only inside one execution chain.
const sameEpoch = buildActivityUnits([
  row('chain-2', { executionEpoch: 'full-chain', provider: 'codex', module: 'master', launchedAt: 2_000, finishedAt: 3_000 }),
  row('chain-1', { executionEpoch: 'full-chain', provider: 'claude', module: 'supply', launchedAt: 1_000, finishedAt: 2_000, costUsd: 2 }),
], true)
assert.equal(sameEpoch.runCount, 1)
assert.equal(sameEpoch.units[0].kind, 'group')
if (sameEpoch.units[0].kind === 'group') {
  assert.equal(sameEpoch.units[0].group.key, 'epoch:full-chain')
  assert.equal(sameEpoch.units[0].group.provider, 'mixed')
  assert.equal(sameEpoch.units[0].group.costUsd, 2)
  assert.equal(sameEpoch.units[0].group.status, 'done')
}

const partiallyObserved = buildActivityUnits([
  row('known-child', { executionEpoch: 'partial-chain', provider: 'codex', launchedAt: 2_000 }),
  row('unknown-child', { executionEpoch: 'partial-chain', provider: undefined, launchedAt: 1_000 }),
], true)
assert.equal(partiallyObserved.units[0].kind === 'group' ? partiallyObserved.units[0].group.provider : null, 'unknown',
  'one attributed child cannot launder an unattributed sibling into a single-provider group')
assert.equal(partiallyObserved.units[0].kind === 'group' ? partiallyObserved.units[0].group.profileKey : null, 'unknown')

// `chainId` is the rolling-deploy alias when executionEpoch has not reached a row yet.
const chainAlias = buildActivityUnits([
  row('alias-2', { chainId: 'chain-compatible', launchedAt: 2_000 }),
  row('alias-1', { chainId: 'chain-compatible', launchedAt: 1_000 }),
], true)
assert.equal(chainAlias.units[0].kind, 'group')
assert.equal(chainAlias.units[0].kind === 'group' ? chainAlias.units[0].group.key : null, 'epoch:chain-compatible')

// executionEpoch is authoritative if both fields are present; a reused chain alias cannot merge epochs.
const epochPrecedence = buildActivityUnits([
  row('precedence-2', { executionEpoch: 'epoch-2', chainId: 'reused-chain', launchedAt: 2_000 }),
  row('precedence-1', { executionEpoch: 'epoch-1', chainId: 'reused-chain', launchedAt: 1_000 }),
], true)
assert.equal(epochPrecedence.runCount, 2)
assert.deepEqual(epochPrecedence.units.map((unit) => unit.kind), ['row', 'row'])

// Old rows have no epoch, so retain the historical runRoot grouping rather than breaking old history.
const legacy = buildActivityUnits([
  row('legacy-2', { launchedAt: 2_000 }),
  row('legacy-1', { launchedAt: 1_000 }),
], true)
assert.equal(activityExecutionKey(legacy.units[0].kind === 'group' ? legacy.units[0].group.children[0] : legacy.units[0].row), 'legacy-root:analyses/GOLD_2026-08-21')
assert.equal(legacy.units[0].kind, 'group')
assert.equal(legacy.units[0].kind === 'group' ? legacy.units[0].group.key : null, 'legacy-root:analyses/GOLD_2026-08-21')

// Filters that may have removed sibling steps keep the honest flat subset.
assert.deepEqual(buildActivityUnits(sameEpoch.units[0].kind === 'group' ? sameEpoch.units[0].group.children : [], false).units.map((unit) => unit.kind), ['row', 'row'])

const resumable: ResumableRunInfo = {
  swarm: 'commodity', subject: 'GOLD', runRoot: 'analyses/GOLD_2026-08-21', kind: 'module', module: 'supply',
  doneCount: 1, totalCount: 2, unit: 'agent',
}
assert.equal(exactResumableForActivity(row('exact'), [resumable]), resumable)
assert.equal(exactResumableForActivity(row('wrong-swarm', { swarm: 'research' }), [resumable]), undefined)
assert.equal(exactResumableForActivity(row('wrong-root', { runRoot: 'analyses/GOLD_other' }), [resumable]), undefined)
assert.equal(exactResumableForActivity(row('wrong-module', { module: 'demand' }), [resumable]), undefined)
assert.equal(exactResumableForActivity(row('legacy', { runRoot: undefined }), [resumable]), undefined,
  'legacy activity without an exact folder never gets a mutation affordance')
assert.equal(exactResumableForActivity(row('chained-child', { kind: 'rerun', chained: true }), [{ ...resumable, kind: 'full', unit: 'module' }]), undefined,
  'a chained child cannot ambiguously alias to the whole-run resume')

console.log('activityGroups.test.ts: execution grouping and exact resume joins passed')
