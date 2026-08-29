import assert from 'node:assert/strict'
import { dataScanCopy, dataScanPercent, isDataScanProgress } from './dataScan'
import type { DataScanProgress, DataScanStage } from './types'

const scan = (stage: DataScanStage, completed: number, total = 109, currentFile: string | null = null): DataScanProgress => ({
  scanId: 'scan-1', ticker: 'NU', stage, completed, total, currentFile, error: null, startedAt: 1, updatedAt: 2,
})

assert.deepEqual(dataScanCopy(scan('finding', 0)), { title: 'Finding files', detail: 'Checking NU’s folder.' })
assert.deepEqual(dataScanCopy(scan('reading', 33, 109, 'Filings/Q2.pdf')), { title: 'Reading file 34 of 109', detail: 'Filings/Q2.pdf' })
assert.deepEqual(dataScanCopy(scan('checking', 109)), { title: 'Checking readiness', detail: '109 files read.' })
assert.deepEqual(dataScanCopy(scan('ready', 109)), { title: 'Ready — 109 files read', detail: 'Data and readiness are up to date.' })
assert.equal(dataScanPercent(scan('finding', 0)), 4)
assert.equal(dataScanPercent(scan('ready', 109)), 100)

const failed = { ...scan('failed', 33, 109, 'Filings/Q2.pdf'), error: 'Could not read Filings/Q2.pdf.' }
assert.deepEqual(dataScanCopy(failed), { title: 'Reading stopped', detail: 'Could not read Filings/Q2.pdf.' })
assert.equal(isDataScanProgress(failed), true)
assert.equal(isDataScanProgress({ ...failed, total: -1 }), false)
assert.equal(isDataScanProgress({ ...failed, stage: 'mystery' }), false)

console.log('dataScan.test.ts: short progress, completion, and failure copy passed')
