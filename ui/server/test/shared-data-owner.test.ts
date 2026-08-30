// Shared data/<SUBJECT> ownership guard — pure policy + production-boundary ordering.
// Run: npx tsx test/shared-data-owner.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  classifyIntakeOwnerRefusal,
  isSharedDataPoolConsumer,
  sharedDataPoolConflict,
  type FinishedIntakeOwner,
} from '../src/intake-owner'

const owner = (swarm: string, runRoot: string): FinishedIntakeOwner => ({ swarm, subject: 'GOLD', runRoot })
const research = owner('research', 'analyses/GOLD_2026-08-13')
const commodity = owner('commodity', 'commodity/runs/GOLD')

assert.deepEqual(
  sharedDataPoolConflict('research', [research, commodity], []),
  { code: 'shared_data_owner_ambiguous', owners: ['commodity', 'research'] },
  'a finished equity GOLD plus finished commodity GOLD is ambiguous for every launch',
)
assert.deepEqual(
  sharedDataPoolConflict('research', [commodity], []),
  { code: 'shared_data_owner_mismatch', owners: ['commodity'] },
  'one finished owner permits only its own cockpit',
)
assert.equal(sharedDataPoolConflict('commodity', [commodity], []), null, 'the sole matching owner remains usable')

assert.equal(sharedDataPoolConflict('research', [], []), null, 'an unowned label permits the first launch')
assert.deepEqual(
  sharedDataPoolConflict('commodity', [], [{ swarm: 'research', runId: 'first-run' }]),
  {
    code: 'shared_data_subject_busy',
    owners: [],
    blockingSwarm: 'research',
    blockingRunId: 'first-run',
  },
  'while ownership is zero, the first in-flight launch reserves the bare label across swarms',
)
assert.equal(
  sharedDataPoolConflict('research', [], [{ swarm: 'research' }]),
  null,
  'same-swarm nested claims remain possible for the chained-full scheduler',
)
assert.equal(
  sharedDataPoolConflict('research', [], [{ swarm: 'commodity', runId: 'commodity-live' }])?.code,
  'shared_data_subject_busy',
  'commodity-first blocks a later research handoff target reservation',
)
assert.equal(
  sharedDataPoolConflict('commodity', [], [{ swarm: 'research', runId: 'handoff-live' }])?.code,
  'shared_data_subject_busy',
  'handoff-first exposes its target as a research claim and blocks commodity',
)

for (const kind of ['full', 'module', 'agent', 'rerun', 'doc-intake'] as const) {
  assert.equal(isSharedDataPoolConsumer(kind, 'constellation'), true, `${kind} consumes the constellation data pool`)
}
assert.equal(isSharedDataPoolConsumer('review', 'constellation'), false, 'outcome review reads published calls, not the pool')
assert.equal(isSharedDataPoolConsumer('signal', 'flow'), false, 'flow swarms use their own signal store')

// Do not import server.ts or launch a real process. Pin the security-significant ordering statically:
// acquire is synchronous check-then-claim; both launch paths acquire before their first mutation; the
// paid boundary rechecks the generic pool guard after buildArgs and immediately before execa.
const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, '..', 'src', 'launcher.ts'), 'utf8')

const acquireStart = source.indexOf('function acquireSharedDataPoolClaim(')
const acquireEnd = source.indexOf('\n/** The paid launch', acquireStart)
assert.ok(acquireStart >= 0 && acquireEnd > acquireStart, 'pending-claim helper remains discoverable')
const acquireBody = source.slice(acquireStart, acquireEnd)
const ownershipCheck = acquireBody.indexOf('currentSharedDataPoolConflict(')
const pendingSet = acquireBody.indexOf('bySwarm.set(')
assert.ok(ownershipCheck >= 0 && ownershipCheck < pendingSet, 'ownership is checked before the pending label is claimed')
assert.equal(acquireBody.slice(ownershipCheck, pendingSet).replace(/\/\/.*$/gm, '').includes('await '), false,
  'zero-owner check-and-claim cannot yield')

const launchStart = source.indexOf('export async function launch(params: LaunchParams)')
const launchEnd = source.indexOf('\nasync function continueLaunch(', launchStart)
assert.ok(launchStart >= 0 && launchEnd > launchStart, 'launch() remains discoverable')
const launchBody = source.slice(launchStart, launchEnd)
const chainedAcquire = launchBody.indexOf('const releasePoolClaim = acquireSharedDataPoolClaim(swarmId, ticker, kind)')
const chainedMutation = launchBody.indexOf('return await launchFullChained(', chainedAcquire)
assert.ok(chainedAcquire >= 0 && chainedAcquire < chainedMutation, 'chained full reserves the pool before its scheduler marker write')

const normalAcquire = launchBody.indexOf('const releasePoolClaim = acquireSharedDataPoolClaim(swarmId, subjectId, kind)')
const firstCas = launchBody.indexOf('assertLaunchBindingsStillCurrent(swarmId, subjectId, params)', normalAcquire)
const firstMutation = launchBody.indexOf('reapAllDeadRuns()', firstCas)
assert.ok(normalAcquire >= 0 && normalAcquire < firstCas && firstCas < firstMutation,
  'ordinary launches reserve the pool before the first registry/filesystem mutation')
assert.equal(launchBody.slice(normalAcquire, firstMutation).replace(/\/\/.*$/gm, '').includes('await '), false,
  'ordinary zero-owner reservation cannot interleave before the first mutation')

const force = launchBody.indexOf('if (params.force)', firstMutation)
const afterForce = launchBody.indexOf('const afterForcePoolConflict = currentSharedDataPoolConflict(', force)
const admission = launchBody.indexOf('const decision = admitRun(', afterForce)
assert.ok(force >= 0 && force < afterForce && afterForce < admission,
  'ownership is re-read after the force-stop await and before admission')

const spawnStart = source.indexOf('async function spawnEngine(run: RunState)')
const spawnEnd = source.indexOf('\n// Kill the run', spawnStart)
assert.ok(spawnStart >= 0 && spawnEnd > spawnStart, 'spawnEngine() remains discoverable')
const spawnBody = source.slice(spawnStart, spawnEnd)
assert.match(spawnBody, /currentSharedDataPoolConflict\(run\.swarmId, run\.subjectId, run\.kind, run\.runId\)/,
  'the final paid-process CAS includes generic shared-pool ownership')
const buildLaunch = spawnBody.indexOf('launchSpec = await adapter.buildLaunch(')
const memoryProof = spawnBody.indexOf('await verifyResearchMemoryBeforeSpawn(run)', buildLaunch)
const finalCas = spawnBody.indexOf('const finalSpawnBinding = changedLaunchBinding()', memoryProof)
const finalScopeCas = spawnBody.indexOf('const finalSpawnGuard = evaluatePreSpawnGuard(', finalCas)
const paidSpawn = spawnBody.indexOf('child = execa(gatedCommand', finalScopeCas)
assert.ok(buildLaunch >= 0 && buildLaunch < finalCas && finalCas < paidSpawn,
  'shared-pool ownership is rechecked after the provider launch probe and immediately before paid execa')
assert.ok(memoryProof > buildLaunch && memoryProof < finalCas && finalCas < finalScopeCas && finalScopeCas < paidSpawn,
  'shared-pool and exact-scope CAS both run after every asynchronous memory/journal proof')
const targetLookup = spawnBody.indexOf('const target = sharedPoolTargetByRun.get(run)')
const targetOwners = spawnBody.indexOf('listFinishedIntakeOwners(target.subject)', targetLookup)
assert.ok(targetLookup >= 0 && targetOwners > targetLookup && targetOwners < buildLaunch,
  'a handoff target is re-resolved in the shared launch-boundary probe')
assert.ok(spawnBody.indexOf('const beforeArgs = changedLaunchBinding()', targetOwners) < buildLaunch,
  'a newly ambiguous handoff target is caught before argument construction')
assert.ok(finalCas > buildLaunch,
  'the same target-aware probe runs again after the async buildArgs boundary')

console.log('shared-data-owner: all checks passed')

// ---- why a refusal happened, not just that one did ----------------------------------------------
// resolveUniqueFinishedIntakeOwner collapses four states into one null, so every send-to-research
// refusal used to read "This label is not owned unambiguously by a finished research call." A company
// that simply had no finished run therefore reported an ownership CLASH that did not exist, and the
// reader went looking for a second cockpit instead of finishing the run.
const decided = { swarm: 'research', runRoot: 'analyses/GOLD_2026-08-13', decisionFingerprint: 'fp-1' }

assert.deepEqual(
  classifyIntakeOwnerRefusal('research', [], null),
  { code: 'shared_data_owner_none' },
  'no finished run at all is NOT ambiguity — it is an empty pool',
)
assert.deepEqual(
  classifyIntakeOwnerRefusal('research', [research, commodity], null),
  { code: 'shared_data_owner_ambiguous', owners: ['commodity', 'research'] },
  'two cockpits finishing the same label is the real ambiguous case',
)
assert.deepEqual(
  classifyIntakeOwnerRefusal('research', [commodity], null),
  { code: 'shared_data_owner_mismatch', owners: ['commodity'] },
  'a sole owner in another cockpit is a mismatch, never ambiguity',
)
assert.deepEqual(
  classifyIntakeOwnerRefusal('research', [research], null),
  { code: 'shared_data_owner_undecided', owners: ['research'] },
  'the right cockpit owns it but no usable decision record exists — a finished thesis whose decision never landed',
)
assert.equal(
  classifyIntakeOwnerRefusal('research', [research], decided),
  null,
  'a sole research owner with a resolved decision is not a refusal',
)
assert.deepEqual(
  classifyIntakeOwnerRefusal('research', [research], { ...decided, swarm: 'commodity' }),
  { code: 'shared_data_owner_undecided', owners: ['research'] },
  'a resolver answering for a DIFFERENT swarm is never accepted as this swarm’s owner',
)
