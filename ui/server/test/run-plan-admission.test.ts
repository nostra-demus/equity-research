process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  claimRunPlanRequest, markRunPlanAdmitted, markRunPlanFailedBeforeStart,
  markRunPlanStarted, readRunPlanRequest,
} from '../src/run-plan-admission'

const state = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-run-plan-request-'))
const requestId = crypto.randomUUID()
const intent = {
  requestId,
  planFingerprint: `sha256:${'a'.repeat(64)}`,
  user: 'owner@example.com',
  subject: 'KAR',
}

try {
  assert.equal((await claimRunPlanRequest(intent, state)).kind, 'new')
  assert.equal((await claimRunPlanRequest(intent, state)).kind, 'in_progress', 'a double click cannot claim twice')
  assert.equal((await claimRunPlanRequest({ ...intent, user: 'other@example.com' }, state)).kind, 'conflict')

  await markRunPlanFailedBeforeStart(requestId, 'provider unavailable', state)
  assert.equal((await claimRunPlanRequest(intent, state)).kind, 'new', 'the same click may retry before any child starts')

  await markRunPlanStarted(requestId, state)
  await markRunPlanFailedBeforeStart(requestId, 'late error must not reopen spend', state)
  assert.equal((await readRunPlanRequest(requestId, state))?.status, 'started')
  assert.equal((await claimRunPlanRequest(intent, state)).kind, 'replay', 'a started request is never reclaimed')

  const response = { runId: 'run-1', requestId }
  await markRunPlanAdmitted(requestId, 'run-1', response, state)
  const replay = await claimRunPlanRequest(intent, state)
  assert.equal(replay.kind, 'replay')
  assert.deepEqual(replay.record.response, response)

  const crashId = crypto.randomUUID()
  const crashIntent = { ...intent, requestId: crashId }
  assert.equal((await claimRunPlanRequest(crashIntent, state)).kind, 'new')
  const crashReceipt = path.join(state, 'run-plan-requests', `${crashId}.json`)
  const stale = JSON.parse(fs.readFileSync(crashReceipt, 'utf8'))
  fs.writeFileSync(crashReceipt, `${JSON.stringify({ ...stale, instanceId: 'dead-engine-instance' }, null, 2)}\n`)
  assert.equal((await claimRunPlanRequest(crashIntent, state)).kind, 'new',
    'a new engine instance reclaims a crash-stuck pre-spend claim with the same request id')

  const unsafeState = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-run-plan-unsafe-'))
  try {
    fs.symlinkSync(os.tmpdir(), path.join(unsafeState, 'run-plan-requests'))
    await assert.rejects(claimRunPlanRequest({ ...intent, requestId: crypto.randomUUID() }, unsafeState), /unsafe/)
  } finally {
    fs.rmSync(unsafeState, { recursive: true, force: true })
  }

  console.log('run-plan request receipts: retry-before-spend, replay-after-start, conflict, and symlink guards passed')
} finally {
  fs.rmSync(state, { recursive: true, force: true })
}
