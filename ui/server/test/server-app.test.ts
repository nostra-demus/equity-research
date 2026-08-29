// Real in-memory route proof for the import-safe Fastify factory. Building an app must not claim the
// production singleton, install process handlers, open a port, recover provider children, or start a
// scheduler. Those effects belong only to BuiltServerApp.start().
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'

const signalCounts = () => ({
  sigterm: process.listenerCount('SIGTERM'),
  sigint: process.listenerCount('SIGINT'),
  uncaught: process.listenerCount('uncaughtException'),
  rejected: process.listenerCount('unhandledRejection'),
})

const before = signalCounts()
const { buildApp } = await import('../src/server')
const first = await buildApp()
const second = await buildApp()

assert.notEqual(first.app, second.app, 'buildApp returns an isolated Fastify instance')
assert.deepEqual(signalCounts(), before, 'building route apps installs no process handlers')

const health = await first.app.inject({ method: 'GET', url: '/api/health' })
assert.equal(health.statusCode, 200)
assert.equal(health.headers['cache-control'], 'no-store')
assert.equal(health.json().ok, true)

const activity = await first.app.inject({ method: 'GET', url: '/api/activity?status=readiness-checking' })
assert.equal(activity.statusCode, 200, 'canonical pre-spawn statuses are accepted by the real route')
assert.ok(Array.isArray(activity.json().rows))

const unreceiptedContinue = await first.app.inject({
  method: 'POST', url: '/api/thesis-plan/run',
  payload: {
    ticker: 'KAR', reuse: [], swarm: 'research', provider: 'claude',
    sourceRunRoot: 'analyses/KAR_2026-08-27',
  },
})
assert.equal(unreceiptedContinue.statusCode, 400, 'Continue fails closed when request id/plan receipt are absent')
assert.equal(unreceiptedContinue.json().error, 'invalid body')

await first.app.close()
await second.app.close()

console.log('server-app.test.ts: isolated factory + real injected routes passed')
