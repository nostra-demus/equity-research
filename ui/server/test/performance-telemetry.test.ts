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
  assert.equal(fs.existsSync(oldFile), false)
})
