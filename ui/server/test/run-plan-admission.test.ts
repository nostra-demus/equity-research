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
  assert.equal(claimRunPlanRequest(intent, state).kind, 'new')
  assert.equal(claimRunPlanRequest(intent, state).kind, 'in_progress', 'a double click cannot claim twice')
  assert.equal(claimRunPlanRequest({ ...intent, user: 'other@example.com' }, state).kind, 'conflict')

  markRunPlanFailedBeforeStart(requestId, 'provider unavailable', state)
  assert.equal(claimRunPlanRequest(intent, state).kind, 'new', 'the same click may retry before any child starts')

  markRunPlanStarted(requestId, state)
  markRunPlanFailedBeforeStart(requestId, 'late error must not reopen spend', state)
  assert.equal(readRunPlanRequest(requestId, state)?.status, 'started')
  assert.equal(claimRunPlanRequest(intent, state).kind, 'replay', 'a started request is never reclaimed')

  const response = { runId: 'run-1', requestId }
  markRunPlanAdmitted(requestId, 'run-1', response, state)
  const replay = claimRunPlanRequest(intent, state)
  assert.equal(replay.kind, 'replay')
  assert.deepEqual(replay.record.response, response)

  const unsafeState = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-run-plan-unsafe-'))
  try {
    fs.symlinkSync(os.tmpdir(), path.join(unsafeState, 'run-plan-requests'))
    assert.throws(() => claimRunPlanRequest({ ...intent, requestId: crypto.randomUUID() }, unsafeState), /unsafe/)
  } finally {
    fs.rmSync(unsafeState, { recursive: true, force: true })
  }

  console.log('run-plan request receipts: retry-before-spend, replay-after-start, conflict, and symlink guards passed')
} finally {
  fs.rmSync(state, { recursive: true, force: true })
}
