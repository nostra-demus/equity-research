process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const state = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-estimate-'))
process.env.ENGINE_STATE_DIR = state
const { estimateFromComparableRuns } = await import('../src/activity-log')
const exactScope = `sha256:${'a'.repeat(64)}`

function event(runId: string, eventType: 'launched' | 'finished', index: number, overrides: Record<string, unknown> = {}) {
  return {
    v: 1, event: eventType, ts: 1_700_000_000_000 + index, runId,
    user: 'owner@example.com', userVia: 'cf-access', kind: 'full', ticker: 'KAR', swarm: 'research',
    provider: 'claude', profileKey: 'claude:opus:default', model: 'opus',
    scopeFingerprint: exactScope,
    ...(eventType === 'finished' ? { status: 'done', durationMs: (index + 1) * 60_000, costUsd: index + 1 } : {}),
    ...overrides,
  }
}

try {
  const rows: Record<string, unknown>[] = []
  for (let i = 0; i < 3; i++) {
    rows.push(event(`run-${i}`, 'launched', i))
    rows.push(event(`run-${i}`, 'finished', i, { durationMs: (10 + i * 5) * 60_000, costUsd: 20 + i * 10 }))
  }
  // Different profile and unfinished work must never calibrate the selected execution profile.
  rows.push(event('other', 'launched', 20, { profileKey: 'claude:sonnet:default' }))
  rows.push(event('other', 'finished', 21, { profileKey: 'claude:sonnet:default', durationMs: 999 * 60_000, costUsd: 999 }))
  rows.push(event('running', 'launched', 30))
  fs.writeFileSync(path.join(state, 'activity-log.jsonl'), rows.map((row) => JSON.stringify(row)).join('\n') + '\n')

  const estimate = estimateFromComparableRuns({ kind: 'full', provider: 'claude', profileKey: 'claude:opus:default', swarm: 'research', scopeFingerprint: exactScope })
  assert.equal(estimate.source, 'comparable_completed_runs')
  assert.deepEqual(estimate.minutesRange, [10, 20])
  assert.deepEqual(estimate.costUsdRange, [20, 40])
  assert.equal(estimate.durationSampleSize, 3)
  assert.equal(estimate.costSampleSize, 3)

  const thin = estimateFromComparableRuns({ kind: 'full', provider: 'claude', profileKey: 'claude:sonnet:default', swarm: 'research', scopeFingerprint: exactScope })
  assert.equal(thin.source, 'unavailable')
  assert.equal(thin.minutesRange, undefined)

  const wrongScope = estimateFromComparableRuns({ kind: 'full', provider: 'claude', profileKey: 'claude:opus:default', swarm: 'research', scopeFingerprint: `sha256:${'b'.repeat(64)}` })
  assert.equal(wrongScope.source, 'unavailable', 'a roster/orb-scope change cannot reuse a historical band')

  const codex = estimateFromComparableRuns({ kind: 'full', provider: 'codex', profileKey: 'codex:sol-terra', swarm: 'research', scopeFingerprint: exactScope })
  assert.equal(codex.costSampleSize, 0, 'Codex never invents a dollar estimate from subscription use')
  assert.equal(codex.costUsdRange, undefined)
  console.log('historical estimates: exact profile, minimum sample, observed range, and Codex allowance truth passed')
} finally {
  fs.rmSync(state, { recursive: true, force: true })
}
