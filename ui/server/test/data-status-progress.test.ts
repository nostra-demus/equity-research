process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Real analyzer frames are monotonic and identify every file. Use plain text so this test is deterministic
// and never depends on Python/PDF/workbook tooling.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'data-status-progress-'))
process.env.ENGINE_REPO_ROOT = tmp
const pool = path.join(tmp, 'data', 'TESTX')
fs.mkdirSync(path.join(pool, 'Filings'), { recursive: true })
fs.writeFileSync(path.join(pool, 'Filings', 'annual.txt'), 'annual report')
for (let i = 0; i < 108; i += 1) fs.writeFileSync(path.join(pool, `document-${String(i).padStart(3, '0')}.txt`), `company note ${i}`)

const { analyzeTicker } = await import('../src/data-status')
const frames: Array<{ stage: string; completed: number; total: number; currentFile: string | null }> = []
const read = await analyzeTicker('TESTX', (p) => frames.push(p))
assert.equal(read.fileCount, 109, 'a new-company-sized pool completes without losing files')
assert.ok(frames.some((p) => p.stage === 'reading' && p.currentFile === 'document-000.txt'))
assert.ok(frames.some((p) => p.stage === 'reading' && p.currentFile === 'Filings/annual.txt'))
assert.equal(frames.at(-1)?.stage, 'checking')
const completed = frames.filter((p) => p.stage === 'reading').map((p) => p.completed)
assert.deepEqual(completed, [...completed].sort((a, b) => a - b), 'file progress is monotonic')
assert.ok(frames.filter((p) => p.stage === 'reading').every((p) => p.total === 109))

fs.rmSync(tmp, { recursive: true, force: true })
console.log('data-status-progress.test.ts: exact-file analyzer progress passed')
