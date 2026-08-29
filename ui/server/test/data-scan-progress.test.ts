process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import type { DataStatus } from '../src/types'

const status = (ticker: string) => ({ ticker } as DataStatus)

// The coordinator is tested with a controllable analyzer: two browser requests must share one file scan,
// and a reconnect must be able to read the exact latest snapshot.
const { createDataScanCoordinator } = await import('../src/data-scan')
let analyzeCalls = 0
let release!: () => void
const gate = new Promise<void>((resolve) => { release = resolve })
const coordinator = createDataScanCoordinator(async (ticker, progress) => {
  analyzeCalls += 1
  progress({ stage: 'reading', completed: 0, total: 2, currentFile: 'Annual.pdf' })
  await gate
  progress({ stage: 'reading', completed: 1, total: 2, currentFile: 'Quarterly.pdf' })
  progress({ stage: 'checking', completed: 2, total: 2, currentFile: null })
  return status(ticker)
})

const seen: string[] = []
const unsubscribe = coordinator.subscribe((p) => seen.push(`${p.stage}:${p.completed}:${p.currentFile ?? ''}`))
const first = coordinator.run('NU')
const second = coordinator.run('NU')
assert.equal(first, second, 'refresh/reconnect attaches to the same in-flight scan')
assert.equal(analyzeCalls, 1, 'one ticker scan runs once')
assert.equal(coordinator.current('NU')?.currentFile, 'Annual.pdf')
release()
assert.equal((await first).ticker, 'NU')
assert.equal(coordinator.current('NU')?.stage, 'ready')
assert.equal(coordinator.current('NU')?.completed, 2)
assert.deepEqual(seen, [
  'finding:0:',
  'reading:0:Annual.pdf',
  'reading:0:Annual.pdf', // second request joins and immediately receives the current snapshot
  'reading:1:Quarterly.pdf',
  'checking:2:',
  'ready:2:',
])
unsubscribe()

// A failed file remains named in the retained snapshot; a user retry is a new scan, not a stuck promise.
let attempts = 0
const retrying = createDataScanCoordinator(async (ticker, progress) => {
  attempts += 1
  progress({ stage: 'reading', completed: 3, total: 5, currentFile: 'Filings/Q2.pdf' })
  if (attempts === 1) throw new Error('/private/server/path must not leak')
  progress({ stage: 'checking', completed: 5, total: 5, currentFile: null })
  return status(ticker)
})
await assert.rejects(retrying.run('NU'))
assert.equal(retrying.current('NU')?.stage, 'failed')
assert.equal(retrying.current('NU')?.error, 'Could not read Filings/Q2.pdf.')
await retrying.run('NU')
assert.equal(attempts, 2)
assert.equal(retrying.current('NU')?.stage, 'ready')

const noPathLeak = createDataScanCoordinator(async () => {
  throw new Error('/private/server/secret/readiness.json')
})
await assert.rejects(noPathLeak.run('NU'))
assert.equal(noPathLeak.current('NU')?.error, 'The data scan stopped.')

const invalidMetrics = createDataScanCoordinator(async (ticker, progress) => {
  progress({ stage: 'reading', completed: 1, total: 2, currentFile: 'one.pdf' })
  progress({ stage: 'reading', completed: Number.NaN, total: Number.MAX_VALUE, currentFile: 'two.pdf' })
  progress({ stage: 'checking', completed: 2, total: 2, currentFile: null })
  return status(ticker)
})
const invalidSeen: Array<[number, number]> = []
invalidMetrics.subscribe((frame) => invalidSeen.push([frame.completed, frame.total]))
await invalidMetrics.run('NU')
assert.equal(invalidSeen.some(([completed, total]) => !Number.isSafeInteger(completed) || !Number.isSafeInteger(total)), false)

console.log('data-scan-progress.test.ts: reconnect, failure, retry, and exact-file progress passed')
