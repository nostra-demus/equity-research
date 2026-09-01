import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BrowserPerformanceCollector,
  normalizePerformanceOperation,
  performanceOutcomeForFetchError,
  performanceOutcomeForStatus,
} from './performance'

test('API operations discard query strings and dynamic identifiers', () => {
  assert.equal(normalizePerformanceOperation('/api/runs/RUN-secret-123?token=private'), '/api/runs/:runId')
  assert.equal(normalizePerformanceOperation('/api/news?query=confidential'), '/api/news/*')
  assert.equal(normalizePerformanceOperation('/api/output/run?path=analyses/TSLA'), '/api/output/run')
  assert.equal(normalizePerformanceOperation('/assets/company-TSLA.svg'), '/asset/*')
})

test('automatic timeouts are errors while caller aborts and expected absence are not', () => {
  assert.equal(performanceOutcomeForFetchError({ name: 'TimeoutError' }), 'error')
  assert.equal(performanceOutcomeForFetchError({ name: 'AbortError' }), 'cancelled')
  assert.equal(performanceOutcomeForStatus('/api/output/run', 404), 'cancelled')
  assert.equal(performanceOutcomeForStatus('/api/output/run', 500), 'error')
})

test('extreme lifecycle timings are bounded without poisoning their batch', async () => {
  const sent: unknown[][] = []
  const collector = new BrowserPerformanceCollector(async (samples) => { sent.push(samples); return true })
  collector.setMode('live')
  collector.record('browser.core_ready', 700_000)
  collector.record('browser.layout_shift', 11, 'score')
  await collector.flush()
  assert.deepEqual(sent[0]?.map((sample: any) => sample.value), [600_000, 10])
  collector.setMode('static')
})

test('the browser collector is batched, bounded, and best-effort', async () => {
  const sent: unknown[][] = []
  const collector = new BrowserPerformanceCollector(async (samples) => { sent.push(samples); return true })
  collector.setMode('live')
  collector.record('browser.api_latency', 12.37, 'ms', { operation: '/api/health' })
  collector.record('browser.subject_ready', 450, 'ms', { operation: '/subject/select' })
  await collector.flush()
  assert.equal(sent.length, 1)
  assert.deepEqual(sent[0]?.map((sample: any) => ({ name: sample.name, value: sample.value, operation: sample.operation })), [
    { name: 'browser.api_latency', value: 12.4, operation: '/api/health' },
    { name: 'browser.subject_ready', value: 450, operation: '/subject/select' },
  ])
  assert.equal(collector.pending().length, 0)
  collector.setMode('static')

  const offline = new BrowserPerformanceCollector(async () => false)
  offline.setMode('live')
  offline.record('browser.core_ready', 700)
  await offline.flush()
  assert.equal(offline.pending().length, 0, 'a failed upload is dropped instead of creating a permanent retry loop')
  offline.setMode('static')

  const throwing = new BrowserPerformanceCollector(async () => { throw new Error('offline') })
  throwing.setMode('live')
  throwing.record('browser.core_ready', 700)
  await assert.doesNotReject(() => throwing.flush(), 'telemetry transport errors never escape into cockpit work')
  throwing.setMode('static')
})

test('a failed browser batch reports its bounded loss on the next successful upload', async () => {
  const lossReports: number[] = []
  let attempt = 0
  const collector = new BrowserPerformanceCollector(async (_samples, _pageExit, droppedSamples) => {
    lossReports.push(droppedSamples)
    attempt++
    return attempt > 1
  })
  collector.setMode('live')
  collector.record('browser.core_ready', 700)
  await collector.flush()
  collector.record('browser.core_ready', 650)
  await collector.flush()

  assert.deepEqual(lossReports, [0, 1], 'the missing observation is reported once with the recovery batch')
  collector.setMode('static')
})

test('static/read-only mode stores and sends nothing', async () => {
  let calls = 0
  const collector = new BrowserPerformanceCollector(async () => { calls++; return true })
  collector.record('browser.core_ready', 800)
  collector.setMode('static')
  await collector.flush()
  assert.equal(calls, 0)
  assert.equal(collector.pending().length, 0)
})

test('page exit drains every pending batch because no later timer is guaranteed', async () => {
  const batches: Array<{ count: number; pageExit: boolean }> = []
  const collector = new BrowserPerformanceCollector(async (samples, pageExit) => {
    batches.push({ count: samples.length, pageExit })
    return true
  })
  collector.setMode('live')
  for (let index = 0; index < 121; index++) collector.record('browser.run_event_paint', index)
  await collector.flush(true)
  assert.deepEqual(batches, [
    { count: 50, pageExit: false },
    { count: 50, pageExit: true },
    { count: 21, pageExit: true },
  ])
  assert.equal(collector.pending().length, 0)
  collector.setMode('static')
})

test('a 360-event replay starts full batches without overflowing the bounded queue', async () => {
  const batches: number[] = []
  const losses: number[] = []
  let releaseFirst!: () => void
  const firstBlocked = new Promise<void>((resolve) => { releaseFirst = resolve })
  const collector = new BrowserPerformanceCollector(async (samples, _pageExit, droppedSamples) => {
    batches.push(samples.length)
    losses.push(droppedSamples)
    if (batches.length === 1) await firstBlocked
    return true
  })
  collector.setMode('live')
  for (let index = 0; index < 360; index++) collector.record('browser.run_event_paint', index)
  assert.equal(batches[0], 50, 'the first full batch starts immediately')
  assert.equal(collector.pending().length, 310)

  releaseFirst()
  for (let attempt = 0; attempt < 20 && (collector.pending().length || batches.length < 8); attempt++) {
    await collector.flush()
    await new Promise<void>((resolve) => setImmediate(resolve))
  }
  assert.deepEqual(batches, [50, 50, 50, 50, 50, 50, 50, 10])
  assert.deepEqual(losses, [0, 0, 0, 0, 0, 0, 0, 0])
  collector.setMode('static')
})

test('page exit does not duplicate the batch already in a keepalive upload', async () => {
  const calls: Array<{ values: number[]; pageExit: boolean }> = []
  let finishOrdinary!: () => void
  const ordinary = new Promise<void>((resolve) => { finishOrdinary = resolve })
  const collector = new BrowserPerformanceCollector(async (samples, pageExit) => {
    calls.push({ values: samples.map((sample) => sample.value), pageExit })
    if (!pageExit) await ordinary
    return true
  })
  collector.setMode('live')
  collector.record('browser.run_event_paint', 42)
  const inFlight = collector.flush()
  await new Promise<void>((resolve) => setImmediate(resolve))
  await collector.flush(true)
  assert.deepEqual(calls, [
    { values: [42], pageExit: false },
  ], 'the in-flight keepalive batch is not sent a second time during pagehide')
  finishOrdinary()
  await inFlight
  collector.setMode('static')
})

test('arbitrary context is collapsed before transport', async () => {
  let operation: string | undefined
  const collector = new BrowserPerformanceCollector(async (samples) => {
    operation = samples[0]?.operation
    return true
  })
  collector.setMode('live')
  collector.record('browser.subject_ready', 100, 'ms', { operation: '/ticker/TSLA' })
  await collector.flush()
  assert.equal(operation, '/context/other')
  collector.setMode('static')
})
