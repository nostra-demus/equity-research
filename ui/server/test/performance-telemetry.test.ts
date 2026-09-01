import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { PerformanceTelemetry, performanceOutcomeForResponse, validateBrowserPerformanceSamples } from '../src/performance-telemetry'

const NOW = Date.parse('2026-09-01T12:00:00.000Z')

test('browser telemetry accepts only the fixed privacy-safe contract', () => {
  const accepted = validateBrowserPerformanceSamples({ samples: [{
    name: 'browser.api_latency', value: 18.234, unit: 'ms', ts: NOW,
    operation: '/api/runs/:runId', outcome: 'ok',
  }], droppedSamples: 3 }, NOW)
  assert.deepEqual(accepted, {
    samples: [{
      name: 'browser.api_latency', value: 18.2, unit: 'ms', ts: NOW,
      operation: '/api/runs/:runId', outcome: 'ok',
    }],
    droppedSamples: 3,
  })

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
  assert.equal(validateBrowserPerformanceSamples({ samples: [], droppedSamples: 10_001 }, NOW), null,
    'a client loss report is an integer with a strict bound')
})

test('an expected missing run is not classified as a speed failure', () => {
  assert.equal(performanceOutcomeForResponse('/api/output/run', 404), 'cancelled')
  assert.equal(performanceOutcomeForResponse('/api/output/run', 500), 'error')
  assert.equal(performanceOutcomeForResponse('/api/health', 404), 'error')
})

test('backend heartbeat alone cannot publish a system-wide Fast verdict', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-coverage-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const telemetry = new PerformanceTelemetry(stateDir, { flushDelayMs: 60_000 })
  for (let index = 0; index < 20; index++) telemetry.recordServer(10, '/api/health', 'ok', NOW - index)

  const summary = await telemetry.summary(24, NOW)
  assert.equal(summary.metrics.find((metric) => metric.operation === '/api/health')?.status, 'good')
  assert.equal(summary.status, 'learning', 'Fast requires browser boot, selection, live paint, and round-trip coverage')

  const complete = new PerformanceTelemetry(stateDir, { flushDelayMs: 60_000 })
  for (let index = 0; index < 20; index++) {
    complete.recordBrowser([
      { name: 'browser.api_latency', value: 20, unit: 'ms', operation: '/api/health', ts: NOW - index },
      { name: 'browser.run_event_paint', value: 50, unit: 'ms', operation: '/event/run-activity', ts: NOW - index },
    ])
    if (index < 10) complete.recordBrowser([
      { name: 'browser.core_ready', value: 500, unit: 'ms', operation: '/boot/core', ts: NOW - index },
      { name: 'browser.subject_ready', value: 500, unit: 'ms', operation: '/subject/select', ts: NOW - index },
    ])
  }
  assert.equal((await complete.summary(24, NOW)).status, 'good', 'complete in-budget core coverage can publish Fast')
})

test('one severe long task is an immediate incident', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-freeze-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const telemetry = new PerformanceTelemetry(stateDir, { flushDelayMs: 60_000 })
  telemetry.recordBrowser([{ name: 'browser.long_task', value: 2_000, unit: 'ms', ts: NOW }])

  const summary = await telemetry.summary(24, NOW)
  assert.equal(summary.metrics.find((metric) => metric.name === 'browser.long_task')?.status, 'needs_attention')
  assert.equal(summary.status, 'needs_attention')
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
  assert.equal(summary.release, 'test')
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
  const afterCorruption = await new PerformanceTelemetry(stateDir, { release: 'test' }).summary(24, NOW)
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

test('collection loss survives restart and remains isolated to its release', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-drop-restart-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const first = new PerformanceTelemetry(stateDir, {
    maxDailyBytes: 1, flushDelayMs: 60_000, release: 'release-a',
  })
  first.recordServer(1, '/api/health', 'ok', NOW)
  assert.equal((await first.summary(24, NOW)).droppedSamples, 1)

  const restarted = new PerformanceTelemetry(stateDir, { release: 'release-a' })
  assert.equal((await restarted.summary(24, NOW + 1)).droppedSamples, 1,
    'a routine server restart cannot erase an active measurement-loss incident')

  const nextRelease = new PerformanceTelemetry(stateDir, { release: 'release-b' })
  assert.equal((await nextRelease.summary(24, NOW + 1)).droppedSamples, 0,
    'an old release loss cannot turn a new release red')
})

test('many losses schedule one persistence operation', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-drop-coalesce-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const telemetry = new PerformanceTelemetry(stateDir, { release: 'test', flushDelayMs: 60_000 })
  const persist = (telemetry as any).persistDroppedSamples.bind(telemetry)
  let persistCalls = 0
  ;(telemetry as any).persistDroppedSamples = () => {
    persistCalls++
    return persist()
  }

  for (let index = 0; index < 500; index++) telemetry.recordBrowser([], 1)
  assert.equal(persistCalls, 0, 'loss accounting itself creates no promise or disk write per observation')
  await telemetry.flush()
  assert.equal(persistCalls, 1)
  assert.equal((await telemetry.summary(24, NOW)).droppedSamples, 500)
})

test('summaries use only the active deployed release', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-release-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const oldRelease = new PerformanceTelemetry(stateDir, { release: 'old', flushDelayMs: 60_000 })
  for (let index = 0; index < 20; index++) oldRelease.recordServer(5, '/api/health', 'ok', NOW - index)
  await oldRelease.flush()

  const activeRelease = new PerformanceTelemetry(stateDir, { release: 'active', flushDelayMs: 60_000 })
  activeRelease.recordServer(900, '/api/health', 'ok', NOW)
  const summary = await activeRelease.summary(24, NOW)
  assert.equal(summary.release, 'active')
  assert.equal(summary.sampleCount, 1)
  assert.equal(summary.metrics.find((metric) => metric.operation === '/api/health')?.p95, 900,
    'a large fast history from the old deploy cannot dilute the new deploy')
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

test('retention keeps the UTC day that straddles the exact cutoff', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-boundary-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const perfDir = path.join(stateDir, 'performance')
  fs.mkdirSync(perfDir, { recursive: true })
  const boundary = path.join(perfDir, '2026-09-01.jsonl')
  const expired = path.join(perfDir, '2026-08-31.jsonl')
  fs.writeFileSync(boundary, '{}\n')
  fs.writeFileSync(expired, '{}\n')

  await new PerformanceTelemetry(stateDir, { release: 'test' }).summary(
    24, Date.parse('2026-09-15T12:00:00.000Z'),
  )
  assert.equal(fs.existsSync(boundary), true)
  assert.equal(fs.existsSync(expired), false)
})

test('concurrent summary windows share one filesystem read', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-single-flight-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const telemetry = new PerformanceTelemetry(stateDir, { release: 'test' })
  const originalRead = (telemetry as any).readSamples.bind(telemetry)
  let releaseRead!: () => void
  const blocked = new Promise<void>((resolve) => { releaseRead = resolve })
  let reads = 0
  ;(telemetry as any).readSamples = async (...args: unknown[]) => {
    reads++
    await blocked
    return originalRead(...args)
  }

  const first = telemetry.summary(24, NOW)
  const second = telemetry.summary(168, NOW)
  for (let attempt = 0; attempt < 20 && reads === 0; attempt++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 1))
  }
  assert.equal(reads, 1, 'different accepted windows project one shared history snapshot')
  releaseRead()
  await Promise.all([first, second])
  assert.equal(reads, 1, 'the shared read covers both current and baseline windows')
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

test('an interrupted JSONL tail cannot consume the next successful sample', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-tail-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const originalAppend = fs.promises.appendFile
  let interrupt = true
  ;(fs.promises as any).appendFile = async (file: fs.PathLike, data: string, options: unknown) => {
    if (interrupt) {
      interrupt = false
      fs.appendFileSync(file, String(data).slice(0, 12))
      throw new Error('simulated interrupted append')
    }
    return (originalAppend as any)(file, data, options)
  }
  t.after(() => { (fs.promises as any).appendFile = originalAppend })

  const telemetry = new PerformanceTelemetry(stateDir, { flushDelayMs: 60_000 })
  telemetry.recordServer(10, '/api/health', 'ok', NOW)
  await telemetry.flush()
  telemetry.recordServer(20, '/api/health', 'ok', NOW + 1)
  await telemetry.flush()

  const summary = await telemetry.summary(24, NOW + 2)
  const health = summary.metrics.find((metric) => metric.operation === '/api/health')
  assert.equal(health?.count, 1)
  assert.equal(health?.p95, 20)
  assert.equal(summary.droppedSamples, 1, 'the failed batch remains visible as measurement loss')
})

test('a multi-day append failure counts only rows that were not persisted', async (t) => {
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-performance-partial-batch-'))
  t.after(() => fs.rmSync(stateDir, { recursive: true, force: true }))
  const originalAppend = fs.promises.appendFile
  ;(fs.promises as any).appendFile = async (file: fs.PathLike, data: string, options: unknown) => {
    if (String(file).endsWith('2026-09-02.jsonl')) throw new Error('simulated second-day failure')
    return (originalAppend as any)(file, data, options)
  }
  t.after(() => { (fs.promises as any).appendFile = originalAppend })

  const telemetry = new PerformanceTelemetry(stateDir, { release: 'test', flushDelayMs: 60_000 })
  telemetry.recordServer(10, '/api/health', 'ok', Date.parse('2026-09-01T23:59:59.000Z'))
  telemetry.recordServer(20, '/api/health', 'ok', Date.parse('2026-09-02T00:00:01.000Z'))
  await telemetry.flush()

  const summary = await telemetry.summary(48, Date.parse('2026-09-02T12:00:00.000Z'))
  assert.equal(summary.sampleCount, 1)
  assert.equal(summary.droppedSamples, 1, 'the already-durable first-day row is not counted as lost')
})
