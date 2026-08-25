// Full-chain readiness semantics. Run: npx tsx test/full-chain-readiness.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { readinessNeedsDecision, readinessScopeForRun } from '../src/launcher'
import type { ReadinessIssue, ReadinessReport, RunKind } from '../src/types'

const run = (kind: RunKind, chained: boolean, module?: string) => ({ kind, chained, module })
const report = (overall: ReadinessReport['overall'], issues: ReadinessIssue[]): ReadinessReport => ({
  ticker: 'ZZREADY', kind: 'full', overall, fileCount: 1, usableCount: 1, entities: [], issues, ts: Date.now(),
})

assert.deepEqual(readinessScopeForRun(run('module', true, 'earnings')), { kind: 'full' },
  'a chained module inherits the full-decision readiness contract')
assert.deepEqual(readinessScopeForRun(run('module', false, 'earnings')), { kind: 'module', module: 'earnings' },
  'a standalone module keeps its strict target-scoped readiness contract')
assert.deepEqual(readinessScopeForRun(run('full', false)), { kind: 'full', module: undefined })

const moduleCap = report('degraded', [{
  code: 'module_insufficient', severity: 'degrade', module: 'earnings', message: 'Earnings data is insufficient.',
}])
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), moduleCap), false,
  'one insufficient module caps the full decision but does not strand its chain child')
assert.equal(readinessNeedsDecision(run('full', false), moduleCap), true,
  'ordinary full launches preserve the existing operator review for degraded data')
assert.equal(readinessNeedsDecision(run('module', false, 'earnings'), moduleCap), true,
  'standalone module launches remain strict')

const blocker = report('blocked', [{ code: 'zero_files', severity: 'blocker', message: 'No files.' }])
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), blocker), true,
  'full-chain scope never bypasses a blocker')
const otherDegrade = report('degraded', [{ code: 'entity_disagreement', severity: 'degrade', message: 'Entity mismatch.' }])
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), otherDegrade), true,
  'only declared module-insufficiency caps auto-proceed; unrelated degradation still pauses')
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), report('clean', [])), false)

console.log('PASS: full-chain readiness scope and fail-safe decision semantics')
