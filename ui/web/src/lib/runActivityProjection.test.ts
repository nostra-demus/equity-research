import assert from 'node:assert/strict'
import { PAUSED_RUN_HELP, PAUSED_RUN_LABEL, projectRunActivity } from './runActivityProjection'
import type { NodeRuntime, ResumableRunInfo } from './types'

const savedFullRun: ResumableRunInfo = {
  swarm: 'research',
  subject: 'KAR',
  runRoot: 'analyses/KAR_2026-08-29',
  kind: 'full',
  doneCount: 0,
  totalCount: 7,
  unit: 'module',
}

const oldRuntime: Record<string, NodeRuntime> = {
  'business-model/market': { status: 'done', runId: 'old-run' },
  'business-model/synthesis': { status: 'queued', runId: 'old-run' },
  'valuation/model': { status: 'running', runId: 'old-run' },
}

const paused = projectRunActivity({
  subject: 'KAR',
  swarm: 'research',
  nodeRuntime: oldRuntime,
  activeRuns: {},
  resumableRuns: [savedFullRun],
})
assert.equal(paused.waitingToResume, true)
assert.deepEqual([...paused.activeModules], [])
assert.deepEqual([...paused.pausedModules], ['business-model', 'valuation'])
assert.deepEqual([...paused.pausedKeys], ['business-model/synthesis', 'valuation/model'])
assert.equal(PAUSED_RUN_LABEL, 'Paused · waiting to resume')
assert.match(PAUSED_RUN_HELP, /Complete old run.*Run full/)

const genuinelyStarting = projectRunActivity({
  subject: 'KAR',
  swarm: 'research',
  nodeRuntime: oldRuntime,
  activeRuns: { 'old-run': { runId: 'old-run', ticker: 'KAR', swarmId: 'research', status: 'starting' } },
  // The disk list can briefly remain stale after Resume is pressed. Live run truth must win immediately.
  resumableRuns: [savedFullRun],
})
assert.equal(genuinelyStarting.waitingToResume, false)
assert.deepEqual([...genuinelyStarting.activeModules], ['business-model', 'valuation'])
assert.deepEqual([...genuinelyStarting.pausedModules], [])

const normalizedIdentity = projectRunActivity({
  subject: ' kar ',
  swarm: ' Research ',
  nodeRuntime: oldRuntime,
  activeRuns: { 'old-run': { runId: 'old-run', ticker: 'kar', swarmId: 'RESEARCH', status: 'running' } },
  resumableRuns: [{ ...savedFullRun, subject: 'KAR', swarm: 'research' }],
})
assert.equal(normalizedIdentity.waitingToResume, false)
assert.deepEqual([...normalizedIdentity.activeModules], ['business-model', 'valuation'])
assert.deepEqual([...normalizedIdentity.pausedModules], [])

const mixedRuns = projectRunActivity({
  subject: 'KAR',
  swarm: 'research',
  nodeRuntime: {
    ...oldRuntime,
    'earnings/check': { status: 'queued', runId: 'new-run' },
  },
  activeRuns: { 'new-run': { runId: 'new-run', ticker: 'KAR', swarmId: 'research', status: 'running' } },
  resumableRuns: [savedFullRun],
})
assert.deepEqual([...mixedRuns.activeModules], ['earnings'])
assert.deepEqual([...mixedRuns.pausedModules], ['business-model', 'valuation'])

const ordinaryLiveRun = projectRunActivity({
  subject: 'KAR',
  swarm: 'research',
  nodeRuntime: { 'business-model/synthesis': { status: 'queued', runId: 'run-1' } },
  activeRuns: {},
  resumableRuns: [],
})
assert.equal(ordinaryLiveRun.waitingToResume, false)
assert.deepEqual([...ordinaryLiveRun.activeModules], ['business-model'])

const otherCompany = projectRunActivity({
  subject: 'KAR',
  swarm: 'research',
  nodeRuntime: { 'business-model/synthesis': { status: 'queued', runId: 'run-1' } },
  activeRuns: {},
  resumableRuns: [{ ...savedFullRun, subject: 'TSLA' }],
})
assert.equal(otherCompany.waitingToResume, false)
assert.deepEqual([...otherCompany.activeModules], ['business-model'])

console.log('runActivityProjection.test.ts: paused and live run display states passed')
