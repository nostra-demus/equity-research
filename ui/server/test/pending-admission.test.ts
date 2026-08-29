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
  readPendingAdmission,
} from '../src/pending-admission'
import type { ContinuationPlanReceipt } from '../src/completion'

function receipt(action: 'continue' | 'complete', payable: string[]): ContinuationPlanReceipt {
  const root = 'analyses/KAR_2026-08-28'
  return {
    version: 1,
    action,
    swarm: 'research',
    subject: 'KAR',
    sourceRunRoots: action === 'continue' ? [root] : [],
    targetRunRoot: root,
    provider: { id: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max', profileKey: 'codex:sol-terra' },
    reusableOrbKeys: ['business-model/01_identity'],
    payableOrbKeys: payable,
    dataPool: { files: 12, newestMs: 123, sha256: `sha256:${'a'.repeat(64)}` },
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
  cancelPendingAdmission(requestId, { user: 'owner@example.com', isAdmin: false }, state)
  assert.equal(readPendingAdmission(requestId, state)?.status, 'cancelled')
  assert.equal(markPendingAdmissionAdmitting(requestId, undefined, state).status, 'cancelled', 'a stale drain cannot resurrect a cancelled request')
  assert.equal(markPendingAdmissionNeedsAttention(requestId, 'late failure', state).status, 'cancelled', 'late drain diagnostics preserve cancellation')
  assert.throws(() => markPendingAdmissionStarted(requestId, 'too-late', { runId: 'too-late' }, state), /cancelled/)

  const startedId = crypto.randomUUID()
  assert.equal(enqueuePendingAdmission({ ...intent, requestId: startedId }, state).kind, 'new')
  markPendingAdmissionStarted(startedId, 'run-1', { runId: 'run-1' }, state)
  assert.equal(readPendingAdmission(startedId, state)?.runId, 'run-1')
  assert.throws(() => cancelPendingAdmission(startedId, { user: 'owner@example.com', isAdmin: false }, state), /no longer be cancelled/)

  const changed = receipt('continue', ['valuation/02_model', 'master/synthesizer'])
  const difference = pendingPlanDifference(original, changed)
  assert.deepEqual(difference.addedPayableOrbKeys, ['valuation/02_model'])
  assert.deepEqual(difference.removedPayableOrbKeys, ['earnings/01_triage'])

  const intentFile = path.join(state, 'provider-deploy-pending')
  fs.writeFileSync(intentFile, `${'e'.repeat(40)} 123\n`, { mode: 0o600 })
  assert.equal(pendingDeployCommit(intentFile), 'e'.repeat(40))
  fs.chmodSync(intentFile, 0o644)
  assert.equal(pendingDeployCommit(intentFile), null, 'a world-readable deploy intent is not trusted')

  const ops = path.join(state, 'ops')
  fs.mkdirSync(ops)
  fs.writeFileSync(path.join(ops, '.deploy.failed'), `${'f'.repeat(40)} 1609459200\n`)
  assert.deepEqual(deploymentFailedAfter('2020-12-31T23:59:59.000Z', ops), { sha: 'f'.repeat(40), failedAt: 1609459200 })
  assert.equal(deploymentFailedAfter('2021-01-01T00:00:01.000Z', ops), null, 'an older failure cannot block a later click')
  fs.rmSync(path.join(ops, '.deploy.failed'))
  fs.symlinkSync(intentFile, path.join(ops, '.deploy.failed'))
  assert.equal(deploymentFailedAfter('2020-12-31T23:59:59.000Z', ops), null, 'a symlinked failure marker is not trusted')
  fs.rmSync(path.join(ops, '.deploy.failed'))
  const deployedMarker = path.join(ops, '.deployed.sha')
  fs.writeFileSync(deployedMarker, `${'9'.repeat(40)}\n`)
  const deployedAt = fs.statSync(deployedMarker).mtimeMs
  assert.equal(deploymentSucceededAfter(new Date(deployedAt + 1_000).toISOString(), null, ops), null, 'an old healthy marker cannot admit a newer click')
  assert.equal(deploymentSucceededAfter(new Date(deployedAt - 1_000).toISOString(), '9'.repeat(40), ops)?.sha, '9'.repeat(40))

  const unsafe = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pending-unsafe-'))
  try {
    fs.symlinkSync(os.tmpdir(), path.join(unsafe, 'pending-admissions'))
    assert.throws(() => enqueuePendingAdmission({ ...intent, requestId: crypto.randomUUID() }, unsafe), /unsafe/)
  } finally { fs.rmSync(unsafe, { recursive: true, force: true }) }

  console.log('pending admissions: durable identity, cancel ownership, plan diff, and symlink guards passed')
} finally {
  fs.rmSync(state, { recursive: true, force: true })
}
