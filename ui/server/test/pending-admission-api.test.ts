process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const state = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pending-api-'))
process.env.ENGINE_STATE_DIR = state
const ticker = 'ZZQUEUE'
const dataRoot = path.resolve('..', '..', 'data')
const tickerRoot = path.join(dataRoot, ticker)
const parentExisted = fs.existsSync(dataRoot)
fs.mkdirSync(tickerRoot, { recursive: true })
fs.writeFileSync(path.join(state, 'provider-deploy-pending'), `${'7'.repeat(40)} 1\n`, { mode: 0o600 })

try {
  const { buildApp } = await import('../src/server')
  const built = await buildApp()
  const requestId = crypto.randomUUID()
  const payload = { kind: 'full', ticker, confirmTicker: ticker, requestId, provider: 'claude' }
  const first = await built.app.inject({ method: 'POST', url: '/api/launch', payload })
  assert.equal(first.statusCode, 202)
  assert.equal(first.json().queued, true)
  assert.equal(first.json().runId, undefined, 'waiting is not represented by a fake run id')

  const repeat = await built.app.inject({ method: 'POST', url: '/api/launch', payload })
  assert.equal(repeat.statusCode, 202, 'double click replays the one durable waiting intent')

  const own = await built.app.inject({ method: 'GET', url: '/api/pending-admissions' })
  assert.equal(own.statusCode, 200)
  assert.equal(own.json().requests.length, 1)
  assert.equal(own.json().requests[0].originalPlan, undefined, 'public Activity shape does not expose the private plan receipt')

  const stranger = await built.app.inject({
    method: 'GET', url: '/api/pending-admissions', headers: { 'cf-access-authenticated-user-email': 'stranger@example.com' },
  })
  assert.equal(stranger.json().requests.length, 0, 'users cannot inspect another user’s waiting request')

  const cancelled = await built.app.inject({ method: 'POST', url: `/api/pending-admissions/${requestId}/cancel` })
  assert.equal(cancelled.statusCode, 200)
  const cancelledReplay = await built.app.inject({ method: 'POST', url: '/api/launch', payload })
  assert.equal(cancelledReplay.statusCode, 409)
  assert.equal(cancelledReplay.json().code, 'request_cancelled')
  const after = await built.app.inject({ method: 'GET', url: '/api/pending-admissions' })
  assert.equal(after.json().requests.length, 0)

  const startedRequestId = crypto.randomUUID()
  const startedPayload = { ...payload, requestId: startedRequestId }
  assert.equal((await built.app.inject({ method: 'POST', url: '/api/launch', payload: startedPayload })).statusCode, 202)
  const { markPendingAdmissionStarted } = await import('../src/pending-admission')
  markPendingAdmissionStarted(startedRequestId, 'accepted-once', { runId: 'accepted-once', preflight: { fixture: true } }, state)
  fs.rmSync(path.join(state, 'provider-deploy-pending'))
  const startedReplay = await built.app.inject({ method: 'POST', url: '/api/launch', payload: startedPayload })
  assert.equal(startedReplay.statusCode, 200)
  assert.equal(startedReplay.json().runId, 'accepted-once', 'post-update replay returns the one durable result instead of launching twice')
  await built.app.close()
  console.log('pending admission API: one no-spend queue entry, refresh truth, privacy, and pre-start cancel passed')
} finally {
  fs.rmSync(tickerRoot, { recursive: true, force: true })
  if (!parentExisted) {
    try { fs.rmdirSync(dataRoot) } catch {}
  }
  fs.rmSync(state, { recursive: true, force: true })
}
