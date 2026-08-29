process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { continueExactSavedRun, exactContinuationCandidate, type ExactContinuationDeps } from '../src/continuation'
import type { LaunchParams } from '../src/launcher'
import type { ResumableRunInfo } from '../src/resumable'

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
const deps: ExactContinuationDeps = {
  resumable: () => [saved],
  launch: async (params) => {
    launched = params
    return { runId: 'run-1', preflight: {} as any }
  },
}

await continueExactSavedRun({
  swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full',
  provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
  expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  user: 'ceekay@muns.io', userVia: 'cf-access',
}, deps)

assert.deepEqual(launched, {
  kind: 'full', ticker: 'KAR', module: undefined,
  provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
  expectedProfileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  user: 'ceekay@muns.io', userVia: 'cf-access',
  runRoot: saved.runRoot, continuation: true,
}, 'provider/profile/user and exact saved root reach the one launcher boundary')

let staleLaunches = 0
await assert.rejects(
  continueExactSavedRun({
    swarm: 'research', subject: 'KAR', runRoot: saved.runRoot, kind: 'full', provider: 'claude',
  }, {
    resumable: () => [],
    launch: async () => { staleLaunches++; return { runId: 'impossible', preflight: {} as any } },
  }),
  (error: any) => error?.statusCode === 409 && error?.body?.code === 'saved_run_changed',
)
assert.equal(staleLaunches, 0, 'a changed saved identity fails before the launcher/provider boundary')

console.log('exact continuation: identity, profile preservation, and no-fallback rejection passed')
