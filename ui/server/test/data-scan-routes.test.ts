process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'data-scan-routes-'))
process.env.ENGINE_REPO_ROOT = tmp
const pool = path.join(tmp, 'data', 'TESTX')
fs.mkdirSync(pool, { recursive: true })
for (let i = 0; i < 109; i += 1) fs.writeFileSync(path.join(pool, `document-${String(i).padStart(3, '0')}.txt`), `note ${i}`)

const { buildApp } = await import('../src/server')
const built = await buildApp()

const start = await built.app.inject({ method: 'POST', url: '/api/data-status/TESTX/scan' })
assert.equal(start.statusCode, 202, 'starting a large scan returns immediately')
assert.equal(start.headers['cache-control'], 'no-store')
assert.equal(start.json().progress.ticker, 'TESTX')

const traversal = await built.app.inject({ method: 'POST', url: '/api/data-status/../scan' })
assert.equal(traversal.statusCode, 404, 'a traversal-shaped path cannot reach the ticker route')
const punctuation = await built.app.inject({ method: 'POST', url: '/api/data-status/---/scan' })
assert.equal(punctuation.statusCode, 400, 'an all-punctuation subject cannot reach the filesystem')

let result: ReturnType<typeof start.json> | null = null
for (let i = 0; i < 100; i += 1) {
  const read = await built.app.inject({ method: 'GET', url: '/api/data-status/TESTX/result' })
  assert.equal(read.headers['cache-control'], 'no-store')
  const body = read.json()
  if (body.status === 'ready') { result = body; break }
  await new Promise((resolve) => setTimeout(resolve, 10))
}
assert.ok(result, 'short status reads eventually expose the final result')
assert.equal(result.data.fileCount, 109)
assert.equal(result.progress.stage, 'ready')
assert.equal(result.progress.completed, 109)

const progress = await built.app.inject({ method: 'GET', url: '/api/data-status/TESTX/progress' })
assert.equal(progress.json().progress.scanId, start.json().progress.scanId)

await built.app.close()
fs.rmSync(tmp, { recursive: true, force: true })
console.log('data-scan-routes.test.ts: large scan start/status/result route lifecycle passed')
