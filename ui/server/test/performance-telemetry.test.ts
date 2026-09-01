import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { PerformanceTelemetry, validateBrowserPerformanceSamples } from '../src/performance-telemetry'

const NOW = Date.parse('2026-09-01T12:00:00.000Z')

test('browser telemetry accepts only the fixed privacy-safe contract', () => {
  const accepted = validateBrowserPerformanceSamples({ samples: [{
    name: 'browser.api_latency', value: 18.234, unit: 'ms', ts: NOW,
    operation: '/api/runs/:runId', outcome: 'ok',
  }] }, NOW)
  assert.deepEqual(accepted, [{
    name: 'browser.api_latency', value: 18.2, unit: 'ms', ts: NOW,
    operation: '/api/runs/:runId', outcome: 'ok',
  }])

  assert.equal(validateBrowserPerformanceSamples({ samples: [{
    name: 'browser.api_latency', value: 10, unit: 'ms', ts: NOW, operation: '/ticker/TSLA',
  }] }, NOW), null, 'a ticker-shaped arbitrary dimension cannot enter the ledger')
  assert.equal(validateBrowserPerformanceSamples({ samples: [{
    name: 'browser.api_latency', value: 10, unit: 'ms', ts: NOW, operation: '/api/runs/:runId', ticker: 'TSLA',
  }] }, NOW), null, 'unknown fields are rejected')
  assert.equal(validateBrowserPerformanceSamples({ samples: [{
    name: 'server.api_latency', value: 10, unit: 'ms', ts: NOW,
  }] }, NOW), null, 'the browser cannot forge backend timings')
  assert.equal(validateBrowserPerformanceSamples({ samples: [{
    name: 'browser.layout_shift', value: 11, unit: 'score', ts: NOW,
  }] }, NOW), null, 'unbounded values are rejected')
  assert.equal(validateBrowserPerformanceSamples({ samples: [{
    name: 'browser.layout_shift', value: 0.01, unit: 'ms', ts: NOW,
  }] }, NOW), null, 'a metric cannot be submitted with a different unit')
})

test('durable summaries apply p75/p95 budgets and compare with a recent baseline', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const telemetry = new PerformanceTelemetry(stateDir, { flushDelayMs: 60_000, release: 'test' })
  for (let index = 0; index < 20; index++) {
    telemetry.recordBrowser([{
      name: 'browser.core_ready', value: 450 + index, unit: 'ms', ts: NOW - 60_000,
      operation: '/boot/core',
    }])
    telemetry.recordBrowser([{
      name: 'browser.core_ready', value: 950 + index, unit: 'ms', ts: NOW - 2 * 24 * 60 * 60_000,
      operation: '/boot/core',
    }])
    telemetry.recordServer(300 + index, '/api/health', 'ok', NOW - 60_000)
  }
  telemetry.recordServer(900, '/api/news/*', 'ok', NOW - 60_000)

  const summary = await telemetry.summary(24, NOW)
  assert.equal(summary.sampleCount, 41)
  assert.equal(summary.status, 'needs_attention', 'one measured budget miss is never averaged away')
  const ready = summary.metrics.find((metric) => metric.name === 'browser.core_ready')
  assert.equal(ready?.status, 'good')
  assert.equal(ready?.trend, 'faster')
  assert.equal(ready?.p95, 468)
  const health = summary.metrics.find((metric) => metric.name === 'server.api_latency' && metric.operation === '/api/health')
  assert.equal(health?.status, 'needs_attention')
  assert.equal(health?.budget, 250)
  const news = summary.metrics.find((metric) => metric.operation === '/api/news/*')
  assert.equal(news?.status, 'observed', 'non-control-plane work is measured without an arbitrary pass/fail budget')

  const file = path.join(stateDir, 'performance', '2026-09-01.jsonl')
  const raw = fs.readFileSync(file, 'utf8')
  assert.doesNotMatch(raw, /TSLA|run-[a-z0-9]|question|response/i)
  assert.equal(fs.statSync(file).mode & 0o777, 0o600)

  fs.appendFileSync(file, 'null\n42\n[]\n{"version":1}\n')
  const afterCorruption = await new PerformanceTelemetry(stateDir).summary(24, NOW)
  assert.equal(afterCorruption.metrics.find((metric) => metric.name === 'browser.core_ready')?.count, 20,
    'corrupt JSON values are isolated without hiding valid timing rows')
})

test('daily storage is capped and old timing files are pruned', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-cap-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const perfDir = path.join(stateDir, 'performance')
  fs.mkdirSync(perfDir, { recursive: true })
  const oldFile = path.join(perfDir, '2000-01-01.jsonl')
  fs.writeFileSync(oldFile, '{}\n')
  const telemetry = new PerformanceTelemetry(stateDir, { maxDailyBytes: 1, flushDelayMs: 60_000 })
  telemetry.recordServer(1, '/api/health')
  const summary = await telemetry.summary(24)
  assert.equal(summary.droppedSamples, 1)
  assert.equal(summary.status, 'needs_attention', 'collection loss cannot be presented as a green speed verdict')
  assert.equal(fs.existsSync(oldFile), false)
})

test('collection loss expires from health after the selected summary window', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-drop-window-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const observedAt = Date.now()
  const telemetry = new PerformanceTelemetry(stateDir, { maxDailyBytes: 1, flushDelayMs: 60_000 })
  telemetry.recordServer(1, '/api/health', 'ok', observedAt)

  const duringIncident = await telemetry.summary(24, observedAt)
  assert.equal(duringIncident.droppedSamples, 1)
  assert.equal(duringIncident.status, 'needs_attention')

  const afterWindow = await telemetry.summary(24, observedAt + 26 * 60 * 60_000)
  assert.equal(afterWindow.droppedSamples, 0)
  assert.equal(afterWindow.status, 'learning', 'one old collection incident cannot degrade health forever')
})

test('a summary read enforces retention even when collection is idle', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-idle-prune-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const perfDir = path.join(stateDir, 'performance')
  fs.mkdirSync(perfDir, { recursive: true })
  const oldFile = path.join(perfDir, '2000-01-01.jsonl')
  fs.writeFileSync(oldFile, '{}\n')

  await new PerformanceTelemetry(stateDir).summary(24, NOW)
  assert.equal(fs.existsSync(oldFile), false)
})

test('fast API failures do not satisfy latency budgets', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-errors-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const telemetry = new PerformanceTelemetry(stateDir, { flushDelayMs: 60_000 })
  for (let index = 0; index < 20; index++) telemetry.recordServer(2, '/api/health', 'error', NOW - index)

  const summary = await telemetry.summary(24, NOW)
  const health = summary.metrics.find((metric) => metric.operation === '/api/health')
  assert.equal(health?.status, 'needs_attention')
  assert.equal(health?.successCount, 0)
  assert.equal(health?.errorCount, 20)
  assert.equal(health?.errorRate, 1)
  assert.equal(health?.p95, 0, 'failed responses are excluded from the latency percentile')
})

test('a stalled writer leaves only a bounded in-memory tail', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-stall-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const originalAppend = fs.promises.appendFile
  let releaseWrite!: () => void
  const blocked = new Promise<void>((resolve) => { releaseWrite = resolve })
  ;(fs.promises as any).appendFile = async (...args: unknown[]) => {
    await blocked
    return (originalAppend as any)(...args)
  }
  t.after(() => { (fs.promises as any).appendFile = originalAppend })

  const telemetry = new PerformanceTelemetry(stateDir, { flushDelayMs: 60_000, maxPendingSamples: 100 })
  telemetry.recordServer(1, '/api/health', 'ok', NOW)
  const firstWrite = telemetry.flush()
  await new Promise<void>((resolve) => setImmediate(resolve))
  for (let index = 0; index < 125; index++) telemetry.recordServer(2, '/api/health', 'ok', NOW + index)
  releaseWrite()
  await firstWrite
  const summary = await telemetry.summary(24, NOW + 1_000)
  assert.equal(summary.sampleCount, 101)
  assert.equal(summary.droppedSamples, 25)
  assert.equal(summary.status, 'needs_attention')
})
