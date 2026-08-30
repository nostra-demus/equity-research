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
const preparedAttemptRegistration = launchBody.indexOf('transaction.registerPaidChildAttempt(attemptId)')
const registeredLaunch = launchBody.indexOf('await launchRegistered(', preparedAttemptRegistration)
const delegatedSchedulerRelease = launchBody.indexOf('if (transaction && attemptId && result.chained)', registeredLaunch)
const providerAvailability = launchBody.indexOf('await assertProviderAvailable(', registeredLaunch)
assert.ok(
  preparedAttemptRegistration >= 0
    && preparedAttemptRegistration < registeredLaunch
    && registeredLaunch < providerAvailability,
  'every prepared-root child registers synchronously before provider availability can reject a sibling',
)
assert.equal(
  launchBody.slice(0, preparedAttemptRegistration).replace(/\/\/.*$/gm, '').includes('await '),
  false,
  'prepared-root ownership is visible before launch() first yields',
)
assert.ok(registeredLaunch < delegatedSchedulerRelease && delegatedSchedulerRelease < providerAvailability,
  'the provider-less outer Full attempt releases after delegating to real child attempts')
assert.match(source, /intakeReceiptIntentStillActionable\([\s\S]*params\.intakeReceipt/,
  'admission CAS re-reads the exact plan/hash/source/orb intent')
const chainedAcquire = launchBody.indexOf('const releasePoolClaim = acquireSharedDataPoolClaim(swarmId, ticker, kind)')
const chainedCas = launchBody.indexOf('assertLaunchBindingsStillCurrent(swarmId, ticker, params)', chainedAcquire)
const chainedReap = launchBody.indexOf('reapAllDeadRuns()', chainedCas)
const chainedForce = launchBody.indexOf('if (params.force)', chainedCas)
const chainedForceStop = launchBody.indexOf('await stopSubjectForForce(ticker, swarmId)', chainedForce)
const chainedPostForceCas = launchBody.indexOf('assertLaunchBindingsStillCurrent(swarmId, ticker, params)', chainedForceStop)
const chainedLaunch = launchBody.indexOf('return await launchFullChained(', chainedPostForceCas)
assert.ok(chainedAcquire >= 0 && chainedAcquire < chainedCas, 'a chained full reserves its pool before the first CAS')
assert.ok(chainedCas < chainedForce && chainedForce < chainedReap && chainedReap < chainedForceStop,
  'a chained full performs its CAS before force can stop the old subject')
assert.equal(
  launchBody.slice(chainedCas, chainedForceStop).replace(/\/\/.*$/gm, '').includes('await '),
  false,
  'a chained full cannot yield between its first CAS and registry cleanup',
)
assert.ok(chainedForceStop < chainedPostForceCas && chainedPostForceCas < chainedLaunch,
  'a chained full re-reads its bindings after force cancellation and before scheduler mutation')

const normalAcquire = launchBody.indexOf('const releasePoolClaim = acquireSharedDataPoolClaim(swarmId, subjectId, kind)')
const normalCas = launchBody.indexOf('assertLaunchBindingsStillCurrent(swarmId, subjectId, params)', normalAcquire)
const normalReap = launchBody.indexOf('reapAllDeadRuns()', normalCas)
const normalForce = launchBody.indexOf('if (params.force)', normalReap)
const normalForceStop = launchBody.indexOf('await stopSubjectForForce(subjectId, swarmId)', normalForce)
const preAdmissionCas = launchBody.indexOf('assertLaunchBindingsStillCurrent(swarmId, subjectId, params)', normalForceStop)
const admission = launchBody.indexOf('const decision = admitRun(', preAdmissionCas)
assert.ok(normalAcquire >= 0 && normalAcquire < normalCas && normalCas < normalReap,
  'an ordinary launch reserves its pool and checks bindings before registry cleanup')
assert.ok(normalReap < normalForce && normalForce < normalForceStop,
  'an ordinary force uses the shared stop/drain/finalize helper')
assert.ok(normalForceStop < preAdmissionCas && preAdmissionCas < admission,
  'ordinary bindings are re-read after force cancellation and immediately before admission')
const normalFullBranch = launchBody.indexOf("if (kind === 'full') {")
const chainedFullReturn = launchBody.indexOf('return await launchFullChained(', normalFullBranch)
const ordinaryAdmission = launchBody.indexOf('const decision = admitRun(', chainedFullReturn)
assert.ok(normalFullBranch >= 0 && normalFullBranch < chainedFullReturn && chainedFullReturn < ordinaryAdmission,
  'every normal Full returns through the chained scheduler before ordinary provider admission')
assert.equal(
  launchBody.slice(normalFullBranch, chainedFullReturn).replace(/\/\/.*$/gm, '').includes('FULL_PER_MODULE'),
  false,
  'host configuration cannot restore the legacy monolithic Full path',
)

// The same two bindings are checked after the provider adapter's potentially slow launch/preflight probe
// and directly before provenance is recorded and the paid child process is created.
const spawnStart = source.indexOf('async function spawnEngine(run: RunState)')
const spawnEnd = source.indexOf('\n// Kill the run', spawnStart)
assert.ok(spawnStart >= 0 && spawnEnd > spawnStart, 'spawnEngine() source boundary must remain discoverable')
const spawnBody = source.slice(spawnStart, spawnEnd)
const buildLaunch = spawnBody.indexOf('launchSpec = await adapter.buildLaunch(')
const finalCas = spawnBody.indexOf('const beforeSpawn = changedLaunchBinding()', buildLaunch)
const paidBoundarySeal = spawnBody.indexOf('preparedTransaction.markPaidChildSpawning(preparedAttemptId!,', finalCas)
const finalCancelGuard = spawnBody.indexOf(
  "if (run.cancelRequested || run.endedAt !== undefined || run.status === 'cancelled')",
  paidBoundarySeal,
)
const finalFrozenProof = spawnBody.indexOf('frozenEvidenceBindingForRun(run, true)', finalCancelGuard)
const provenanceAppend = spawnBody.indexOf('appendExecutionAttempt(run)', finalCas)
const paidSpawn = spawnBody.indexOf('child = execa(gatedCommand', finalCas)
assert.ok(
  buildLaunch >= 0
    && buildLaunch < finalCas
    && finalCas < provenanceAppend
    && provenanceAppend < paidSpawn,
  'final CAS must sit after provider buildLaunch and before provenance or paid execa',
)
assert.ok(
  paidBoundarySeal >= 0
    && paidBoundarySeal < finalCancelGuard
    && finalCancelGuard < finalFrozenProof
    && finalFrozenProof < provenanceAppend,
  'a cancel during durable sealing aborts before spend, then source and isolated capability are re-proved',
)
assert.match(spawnBody, /intakeReceiptByRun\.get\(run\)[\s\S]*intakeReceiptIntentStillActionable/,
  'the immediately-pre-execa CAS re-reads the exact plan/orb and stops duplicate spend')
const processLease = spawnBody.indexOf('const proof = persistProviderProcessLease(run, providerSpawnGate)', paidSpawn)
const genericProof = spawnBody.indexOf('recordProviderSpawnGateProcessProof(providerSpawnGate, proof)', processLease)
const transactionProof = spawnBody.indexOf('await preparedTransaction.markPaidChildSpawnReady', genericProof)
const gateRelease = spawnBody.indexOf('releaseProviderSpawnGate(providerSpawnGate)', transactionProof)
const startedReceipt = spawnBody.indexOf('await preparedTransaction?.markPaidChildStarted', gateRelease)
assert.ok(
  paidSpawn < processLease && processLease < genericProof && genericProof < transactionProof
    && transactionProof < gateRelease && gateRelease < startedReceipt,
  'the trampoline cannot invoke a paid provider before lease + generic proof + transaction proof are durable',
)

const cancelStart = source.indexOf('export async function cancel(runId: string)')
const cancelEnd = source.indexOf('\n// Run the deterministic data-readiness check', cancelStart)
assert.ok(cancelStart >= 0 && cancelEnd > cancelStart, 'cancel() source boundary must remain discoverable')
const cancelBody = source.slice(cancelStart, cancelEnd)
const protectedCancellation = cancelBody.indexOf('await protectedChain.cancelChainIntent({')
const visibleCancel = cancelBody.indexOf('run.cancelRequested = true', protectedCancellation)
const abortedMarker = cancelBody.indexOf("writeRunMarker(run.runRoot, '.aborted'", visibleCancel)
const chainHalt = cancelBody.indexOf('if (run.chained) haltChain(run.chainId)', abortedMarker)
const childKill = cancelBody.indexOf('killProcessTree(run)', chainHalt)
assert.ok(
  protectedCancellation >= 0
    && protectedCancellation < visibleCancel
    && visibleCancel < abortedMarker
    && abortedMarker < chainHalt
    && chainHalt < childKill,
  'protected chain cancellation is fsynced before visible acknowledgement, marker, scheduler halt, or child kill',
)

console.log('launcher-binding-order: all checks passed')
