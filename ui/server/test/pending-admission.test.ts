process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  cancelPendingAdmission, deploymentFailedAfter, deploymentSucceededAfter, enqueuePendingAdmission, listPendingAdmissions,
  markPendingAdmissionAdmitting, markPendingAdmissionNeedsAttention,
  markPendingAdmissionStarted, pendingDeployCommit, pendingPlanDifference,
  pendingPlanMayAutoStart, pendingReceiptMatchesIntent,
  readPendingAdmission,
} from '../src/pending-admission'
import type { ContinuationPlanReceipt } from '../src/completion'

function receipt(action: 'continue' | 'complete', payable: string[]): ContinuationPlanReceipt {
  const root = 'analyses/KAR_2026-08-28'
  return {
    version: 2,
    action,
    swarm: 'research',
    subject: 'KAR',
    sourceRunRoots: action === 'continue' ? [root] : [],
    targetRunRoot: root,
    provider: { id: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max', profileKey: 'codex:sol-terra' },
    reusableOrbKeys: ['business-model/01_identity'],
    payableOrbKeys: payable,
    dataPool: { files: 12, newestMs: 123, sha256: `sha256:${'a'.repeat(64)}` },
    evidenceGenerationDigest: action === 'continue' ? 'e'.repeat(64) : null,
    reusableArtifacts: [],
    reusableArtifactsSha256: `sha256:${'f'.repeat(64)}`,
    verifiedLineageSha256: `sha256:${'9'.repeat(64)}`,
    sourceArtifactsSha256: `sha256:${'b'.repeat(64)}`,
    fingerprint: `sha256:${(payable.length ? 'c' : 'd').repeat(64)}`,
  }
}

const state = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pending-admission-'))
try {
  const requestId = crypto.randomUUID()
  const original = receipt('continue', ['earnings/01_triage', 'master/synthesizer'])
  const intent = {
    requestId,
    user: 'owner@example.com',
    userVia: 'cf-access' as const,
    ticker: 'KAR',
    action: 'continue' as const,
    sourceRunRoot: original.targetRunRoot,
    provider: 'codex' as const,
    model: 'gpt-5.6-sol',
    reasoningLevel: 'max',
    expectedProfileKey: 'codex:sol-terra',
    reuse: ['business-model'],
    originalPlan: original,
    requestedDeployCommit: '1'.repeat(40),
  }
  assert.equal(enqueuePendingAdmission(intent, state).kind, 'new')
  assert.equal(enqueuePendingAdmission(intent, state).kind, 'existing', 'double click returns one durable intent')
  assert.equal(enqueuePendingAdmission({ ...intent, user: 'attacker@example.com' }, state).kind, 'conflict')
  assert.equal(enqueuePendingAdmission({ ...intent, requestedDeployCommit: '2'.repeat(40) }, state).kind, 'conflict',
    'one request id cannot be rebound to a different deployment')
  assert.equal(listPendingAdmissions(state).length, 1)
  assert.equal(fs.statSync(path.join(state, 'pending-admissions', `${requestId}.json`)).mode & 0o077, 0)

  assert.throws(() => cancelPendingAdmission(requestId, { user: 'attacker@example.com', isAdmin: false }, state), /not authorized/)
  markPendingAdmissionAdmitting(requestId, undefined, state)
  assert.throws(() => cancelPendingAdmission(requestId, { user: 'owner@example.com', isAdmin: false }, state), /no longer be cancelled/)
  markPendingAdmissionNeedsAttention(requestId, 'provider unavailable', state)
  assert.equal(readPendingAdmission(requestId, state)?.status, 'needs_attention')
  assert.equal(listPendingAdmissions(state).length, 0, 'terminal attention does not stay in the hot drain scan')
  assert.equal(listPendingAdmissions(state, true)[0]?.status, 'needs_attention', 'Activity can still read durable attention')
  cancelPendingAdmission(requestId, { user: 'owner@example.com', isAdmin: false }, state)
  assert.equal(readPendingAdmission(requestId, state)?.status, 'cancelled')
  assert.equal(markPendingAdmissionAdmitting(requestId, undefined, state).status, 'cancelled', 'a stale drain cannot resurrect a cancelled request')
  assert.equal(markPendingAdmissionNeedsAttention(requestId, 'late failure', state).status, 'cancelled', 'late drain diagnostics preserve cancellation')
  assert.throws(() => markPendingAdmissionStarted(requestId, 'too-late', { runId: 'too-late' }, state), /cancelled/)

  const startedId = crypto.randomUUID()
  assert.equal(enqueuePendingAdmission({ ...intent, requestId: startedId }, state).kind, 'new')
  markPendingAdmissionStarted(startedId, 'run-1', { runId: 'run-1' }, state)
  assert.equal(readPendingAdmission(startedId, state)?.runId, 'run-1')
  assert.equal(fs.existsSync(path.join(state, 'pending-admissions', `${startedId}.json`)), false,
    'terminal receipts leave the hot polling directory')
  assert.equal(fs.existsSync(path.join(state, 'pending-admissions-archive', 'started', `${startedId}.json`)), true)
  assert.equal(listPendingAdmissions(state).some((record) => record.requestId === startedId), false)
  assert.throws(() => cancelPendingAdmission(startedId, { user: 'owner@example.com', isAdmin: false }, state), /no longer be cancelled/)

  const changed = receipt('continue', ['valuation/02_model', 'master/synthesizer'])
  const difference = pendingPlanDifference(original, changed)
  assert.deepEqual(difference.addedPayableOrbKeys, ['valuation/02_model'])
  assert.deepEqual(difference.removedPayableOrbKeys, ['earnings/01_triage'])
  assert.equal(pendingPlanMayAutoStart('continue', difference), false, 'new paid continuation work requires a fresh review')
  assert.equal(pendingPlanMayAutoStart('continue', pendingPlanDifference(original, receipt('continue', ['master/synthesizer']))), true,
    'an update that only removes paid work may start once')

  const queuedContinue = { action: 'continue' as const, ticker: 'KAR', sourceRunRoot: original.targetRunRoot, provider: 'codex' as const }
  assert.equal(pendingReceiptMatchesIntent(queuedContinue, original, false), true,
    'an unchanged v2 queued Continue passes the real drain receipt boundary')
  assert.equal(pendingReceiptMatchesIntent(queuedContinue, { ...original, version: 1 }, false), false,
    'legacy receipts cannot enter the v2 drain')
  assert.equal(pendingReceiptMatchesIntent(queuedContinue, original, true), false,
    'a completed saved root cannot be restarted as Continue')
  assert.equal(pendingReceiptMatchesIntent(queuedContinue, { ...original, targetRunRoot: 'analyses/KAR_2026-08-29' }, false), false,
    'queued Continue stays bound to its exact saved root')

  const queuedFull = { action: 'full' as const, ticker: 'KAR', provider: 'codex' as const }
  const fullReceipt = receipt('complete', ['business-model/01_identity', 'master/synthesizer'])
  assert.equal(pendingReceiptMatchesIntent(queuedFull, fullReceipt, false), true,
    'an unchanged v2 queued Full passes the same drain receipt boundary')
  assert.equal(pendingPlanMayAutoStart('full', pendingPlanDifference(fullReceipt, fullReceipt)), true,
    'the unchanged queued Full proceeds from validation to one automatic admission')

  const intentFile = path.join(state, 'provider-deploy-pending')
  fs.writeFileSync(intentFile, `${'e'.repeat(40)} 123\n`, { mode: 0o600 })
  assert.equal(pendingDeployCommit(intentFile), 'e'.repeat(40))
  fs.chmodSync(intentFile, 0o644)
  assert.equal(pendingDeployCommit(intentFile), null, 'a world-readable deploy intent is not trusted')

  const ops = path.join(state, 'ops')
  fs.mkdirSync(ops)
  fs.writeFileSync(path.join(ops, '.deploy.failed'), `${'f'.repeat(40)} 1609459200\n`)
  fs.utimesSync(path.join(ops, '.deploy.failed'), 1609459200, 1609459200)
  assert.deepEqual(deploymentFailedAfter('2020-12-31T23:59:59.000Z', ops), { sha: 'f'.repeat(40), failedAt: 1609459200 })
  assert.equal(deploymentFailedAfter('2021-01-01T00:00:01.000Z', ops), null, 'an older failure cannot block a later click')
  fs.rmSync(path.join(ops, '.deploy.failed'))
  fs.symlinkSync(intentFile, path.join(ops, '.deploy.failed'))
  assert.equal(deploymentFailedAfter('2020-12-31T23:59:59.000Z', ops), null, 'a symlinked failure marker is not trusted')
  fs.rmSync(path.join(ops, '.deploy.failed'))
  const deployedMarker = path.join(ops, '.deployed.sha')
  fs.writeFileSync(deployedMarker, `${'9'.repeat(40)}\n`)
  const deployedAt = fs.statSync(deployedMarker).mtimeMs
  assert.equal(await deploymentSucceededAfter(new Date(deployedAt + 1_000).toISOString(), null, ops), null, 'an old healthy marker cannot admit a newer click')
  assert.equal((await deploymentSucceededAfter(new Date(deployedAt - 1_000).toISOString(), '9'.repeat(40), ops))?.sha, '9'.repeat(40))
  const successReceipt = path.join(ops, '.deploy.succeeded')
  fs.writeFileSync(successReceipt, `${'9'.repeat(40)} 1700000000123\n`, { mode: 0o600 })
  fs.utimesSync(successReceipt, 1_600_000_000, 1_600_000_000)
  assert.equal((await deploymentSucceededAfter('2023-11-14T22:13:20.000Z', '9'.repeat(40), ops))?.deployedAt, 1_700_000_000_123,
    'the millisecond success receipt, not a rounded shell epoch or stale marker mtime, proves completion')

  const unsafe = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pending-unsafe-'))
  try {
    fs.symlinkSync(os.tmpdir(), path.join(unsafe, 'pending-admissions'))
    assert.throws(() => enqueuePendingAdmission({ ...intent, requestId: crypto.randomUUID() }, unsafe), /unsafe/)
  } finally { fs.rmSync(unsafe, { recursive: true, force: true }) }

  console.log('pending admissions: durable identity, cancel ownership, plan diff, and symlink guards passed')
} finally {
  fs.rmSync(state, { recursive: true, force: true })
}
