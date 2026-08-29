import assert from 'node:assert/strict'
import type { DataScanProgress, DataStatus } from './types'

;(globalThis as any).window = { __ENGINE_LIVE__: true }

const progress = (stage: DataScanProgress['stage'], completed: number): DataScanProgress => ({
  scanId: 'scan-1', ticker: 'NU', stage, completed, total: 109,
  currentFile: stage === 'reading' ? 'Filings/Q2.pdf' : null,
  error: null, startedAt: 1, updatedAt: completed + 2,
})
const status = { ticker: 'NU', fileCount: 109, hasAnyData: true } as DataStatus
let resultReads = 0

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input)
  if (url.endsWith('/scan') && init?.method === 'POST') {
    return Response.json({ progress: progress('finding', 0) }, { status: 202 })
  }
  if (url.endsWith('/result')) {
    resultReads += 1
    return resultReads === 1
      ? Response.json({ status: 'running', progress: progress('reading', 33), data: null }, { status: 202 })
      : Response.json({ status: 'ready', progress: progress('ready', 109), data: status })
  }
  throw new Error(`unexpected fetch ${url}`)
}) as typeof fetch

const { api } = await import('./api')
const seen: DataScanProgress[] = []
const read = await api.dataStatus('NU', undefined, (frame) => seen.push(frame))
assert.equal(read.fileCount, 109)
assert.deepEqual(seen.map((frame) => `${frame.stage}:${frame.completed}`), [
  'finding:0',
  'reading:33',
  'ready:109',
])

console.log('dataScanApi.test.ts: status polling keeps progress visible without SSE passed')
