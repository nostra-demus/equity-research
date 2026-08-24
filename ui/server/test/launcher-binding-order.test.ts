// Exact-call / automatic-intake launch CAS ordering.
// Run: npx tsx test/launcher-binding-order.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveParityBindingPath } from '../src/execution-provenance'
import { intakeOwnerBindingMatches } from '../src/launcher'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
assert.equal(
  resolveParityBindingPath('analyses/provider-parity/freeze/AMZN_2026-08-24.json'),
  path.join(repoRoot, 'analyses/provider-parity/freeze/AMZN_2026-08-24.json'),
  'repository-relative parity bindings relocate with the deployed worktree',
)
assert.equal(resolveParityBindingPath('../outside.json'), null, 'relative parity bindings cannot traverse the repository')
assert.equal(resolveParityBindingPath('analyses\\outside.json'), null, 'parity bindings reject cross-platform separators')
assert.equal(
  resolveParityBindingPath(path.join(path.dirname(repoRoot), 'outside.json')),
  null,
  'legacy absolute parity bindings cannot escape the deployed repository',
)

const ownerA = {
  swarm: 'research',
  runRoot: 'analyses/GOLD_2026-08-13',
  decisionFingerprint: 'a'.repeat(64),
}
const ownerB = {
  swarm: 'commodity',
  runRoot: 'commodity/runs/GOLD',
  decisionFingerprint: 'b'.repeat(64),
}

assert.equal(intakeOwnerBindingMatches(ownerA, ownerA), true, 'the exact bound owner remains authorized')
assert.equal(
  intakeOwnerBindingMatches(ownerA, ownerB),
  false,
  'stale owner A cannot authorize a launch after the current owner becomes B',
)
assert.equal(
  intakeOwnerBindingMatches(ownerA, null),
  false,
  'cross-swarm ambiguity resolves to null and must fail closed',
)

// Pin the security-significant production ordering without spawning or cancelling real processes. The
// pure equality checks above prove A != B; this source-order assertion proves launch() evaluates that CAS
// before it can reap/finalize registry state or enter the force-cancel loop. No await exists in that span,
// so the Node event loop cannot swap B in after the check but before the first cancel side effect.
const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, '..', 'src', 'launcher.ts'), 'utf8')
const launchStart = source.indexOf('export async function launch(params: LaunchParams)')
const launchEnd = source.indexOf('\nasync function continueLaunch(', launchStart)
assert.ok(launchStart >= 0 && launchEnd > launchStart, 'launch() source boundary must remain discoverable')
const launchBody = source.slice(launchStart, launchEnd)
assert.match(source, /intakeReceiptIntentStillActionable\([\s\S]*params\.intakeReceipt/,
  'admission CAS re-reads the exact plan/hash/source/orb intent')
const preMutationCas = launchBody.indexOf('assertLaunchBindingsStillCurrent(swarmId, subjectId, params)')
const reap = launchBody.indexOf('reapAllDeadRuns()', preMutationCas)
const force = launchBody.indexOf('if (params.force)', preMutationCas)
const firstForceCancel = launchBody.indexOf('await cancel(r.runId)', force)
assert.ok(preMutationCas >= 0, 'launch() must perform its selected-decision/owner CAS')
assert.ok(preMutationCas < reap, 'CAS must precede dead-run finalization')
assert.ok(reap < force && force < firstForceCancel, 'CAS must precede every force-cancel side effect')
assert.equal(
  launchBody.slice(preMutationCas, firstForceCancel).includes('await '),
  false,
  'no event-loop yield may reopen a CAS-to-force-cancel race',
)
const preAdmissionCas = launchBody.indexOf('assertLaunchBindingsStillCurrent(swarmId, subjectId, params)', firstForceCancel)
const admission = launchBody.indexOf('const decision = admitRun(', preAdmissionCas)
assert.ok(firstForceCancel < preAdmissionCas && preAdmissionCas < admission,
  'bindings are re-read after force cancellation and immediately before admission')
const fullRelaunchReset = launchBody.indexOf('resetAdmittedFullRelaunch(runRoot)', admission)
assert.ok(fullRelaunchReset > admission,
  'a monolithic full clears the exact-only aborted pause only after successful admission')

// The same two bindings are checked after the provider adapter's potentially slow launch/preflight probe
// and directly before provenance is recorded and the paid child process is created.
const spawnStart = source.indexOf('async function spawnEngine(run: RunState)')
const spawnEnd = source.indexOf('\n// Kill the run', spawnStart)
assert.ok(spawnStart >= 0 && spawnEnd > spawnStart, 'spawnEngine() source boundary must remain discoverable')
const spawnBody = source.slice(spawnStart, spawnEnd)
const buildLaunch = spawnBody.indexOf('launchSpec = await adapter.buildLaunch(')
const finalCas = spawnBody.indexOf('const beforeSpawn = changedLaunchBinding()', buildLaunch)
const provenanceAppend = spawnBody.indexOf('appendExecutionAttempt(run)', finalCas)
const paidSpawn = spawnBody.indexOf('child = execa(launchSpec.command', finalCas)
assert.ok(
  buildLaunch >= 0
    && buildLaunch < finalCas
    && finalCas < provenanceAppend
    && provenanceAppend < paidSpawn,
  'final CAS must sit after provider buildLaunch and before provenance or paid execa',
)
assert.match(spawnBody, /intakeReceiptByRun\.get\(run\)[\s\S]*intakeReceiptIntentStillActionable/,
  'the immediately-pre-execa CAS re-reads the exact plan/orb and stops duplicate spend')

console.log('launcher-binding-order: all checks passed')
