import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-routes-'))
process.env.ENGINE_STATE_DIR = stateDir

const { buildApp, withPerformanceReadDeadline } = await import('../src/server')
const runtime = await buildApp()

try {
  await assert.rejects(
    withPerformanceReadDeadline(new Promise<never>(() => {}), 5),
    /performance summary read timed out/,
    'a stalled telemetry filesystem has a hard HTTP deadline',
  )

  const health = await runtime.app.inject({ method: 'GET', url: '/api/health' })
  assert.equal(health.statusCode, 200)
  assert.match(String(health.headers['server-timing']), /^app;dur=\d+(?:\.\d)?$/,
    'ordinary API responses expose their own handler time to local performance traces')

  const crossOrigin = await runtime.app.inject({
    method: 'POST', url: '/api/performance/samples',
    headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
    payload: { samples: [] },
  })
  assert.equal(crossOrigin.statusCode, 403)

  const invalid = await runtime.app.inject({
    method: 'POST', url: '/api/performance/samples',
    payload: { samples: [{ name: 'browser.api_latency', value: 4, unit: 'ms', operation: '/company/TSLA' }] },
  })
  assert.equal(invalid.statusCode, 400)

  const accepted = await runtime.app.inject({
    method: 'POST', url: '/api/performance/samples',
    payload: {
      samples: [{ name: 'browser.api_latency', value: 42, unit: 'ms', operation: '/api/health', outcome: 'ok' }],
      droppedSamples: 2,
    },
  })
  assert.equal(accepted.statusCode, 202)
  assert.deepEqual(accepted.json(), { accepted: 1 })

  const summary = await runtime.app.inject({ method: 'GET', url: '/api/performance/summary?hours=24' })
  assert.equal(summary.statusCode, 200)
  assert.equal(summary.headers['cache-control'], 'no-store')
  assert.equal(summary.json().metrics.some((metric: any) => metric.name === 'browser.api_latency'
    && metric.operation === '/api/health' && metric.p95 === 42), true)
  assert.equal(summary.json().droppedSamples, 2, 'browser transport loss reaches the server health window')

  const serverSource = fs.readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8')
  const closeStarted = serverSource.indexOf('const appClosing = app.close()')
  const providerDrain = serverSource.indexOf('await drainProviderRunsForShutdown()', closeStarted)
  const closeAwaited = serverSource.indexOf('await appClosing', providerDrain)
  assert.ok(closeStarted >= 0 && providerDrain > closeStarted && closeAwaited > providerDrain,
    'shutdown stops admission immediately but drains durable writers before waiting on HTTP')
} finally {
  await runtime.app.close()
  fs.rmSync(stateDir, { recursive: true, force: true })
}

console.log('performance routes: passive collection, privacy guard, summary, and Server-Timing verified')
