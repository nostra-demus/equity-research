import assert from 'node:assert/strict'
import test from 'node:test'
import { BrowserPerformanceCollector, normalizePerformanceOperation } from './performance'

test('API operations discard query strings and dynamic identifiers', () => {
  assert.equal(normalizePerformanceOperation('/api/runs/RUN-secret-123?token=private'), '/api/runs/:runId')
  assert.equal(normalizePerformanceOperation('/api/news?query=confidential'), '/api/news/*')
  assert.equal(normalizePerformanceOperation('/api/output/run?path=analyses/TSLA'), '/api/output/run')
  assert.equal(normalizePerformanceOperation('/assets/company-TSLA.svg'), '/asset/*')
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

  const retrying = new BrowserPerformanceCollector(async () => false)
  retrying.setMode('live')
  retrying.record('browser.core_ready', 700)
  await retrying.flush()
  assert.equal(retrying.pending().length, 1, 'a failed ordinary upload remains queued for a later try')
  retrying.setMode('static')
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
  const batches: number[] = []
  const collector = new BrowserPerformanceCollector(async (samples, pageExit) => {
    assert.equal(pageExit, true)
    batches.push(samples.length)
    return true
  })
  collector.setMode('live')
  for (let index = 0; index < 121; index++) collector.record('browser.run_event_paint', index)
  await collector.flush(true)
  assert.deepEqual(batches, [50, 50, 21])
  assert.equal(collector.pending().length, 0)
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
