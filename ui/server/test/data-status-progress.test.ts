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

const { analyzeTicker, evaluateModules, readinessHas } = await import('../src/data-status')
const frames: Array<{ stage: string; completed: number; total: number; currentFile: string | null }> = []
const read = await analyzeTicker('TESTX', (p) => frames.push(p))
assert.equal(read.fileCount, 109, 'a new-company-sized pool completes without losing files')
assert.ok(frames.some((p) => p.stage === 'reading' && p.currentFile === 'document-000.txt'))
assert.ok(frames.some((p) => p.stage === 'reading' && p.currentFile === 'Filings/annual.txt'))
assert.equal(frames.at(-1)?.stage, 'checking')
const completed = frames.filter((p) => p.stage === 'reading').map((p) => p.completed)
assert.deepEqual(completed, [...completed].sort((a, b) => a - b), 'file progress is monotonic')
assert.ok(frames.filter((p) => p.stage === 'reading').every((p) => p.total === 109))

// A chained readiness pass classifies the immutable raw generation, not the live Drive folder it copied.
// Mutating Drive after the freeze must not change the module coverage/providers later receive.
const frozenEvidence = path.join(tmp, 'analyses', 'TESTX_2099-01-01', '_pool_extracts',
  '.extract-generations', 'frozen', 'raw', 'TESTX')
fs.cpSync(pool, frozenEvidence, { recursive: true })
fs.mkdirSync(path.join(frozenEvidence, 'external', 'Vendor'), { recursive: true })
fs.writeFileSync(path.join(frozenEvidence, 'external', 'Vendor', 'peer-call.txt'), 'peer earnings call transcript')
fs.writeFileSync(path.join(frozenEvidence, 'external', 'Vendor', 'peer-call.txt.source.json'), JSON.stringify({
  provider: 'Vendor', source_type: 'peer_transcript', tier: 6, as_of: '2099-01-01',
}))
const frozenBefore = await analyzeTicker('TESTX', undefined, { exactDataDir: frozenEvidence })
assert.equal(frozenBefore.fileCount, 110, 'the frozen authority enumerates every source and excludes its sidecar')
assert.ok(frozenBefore.files.some((file) => file.path === 'Filings/annual.txt'), 'a frozen filing is classified')
assert.ok(
  frozenBefore.files.some((file) => file.filename === 'external/Vendor/peer-call.txt'
    && file.external?.sourceType === 'peer_transcript'),
  'a frozen external source keeps its provenance classification',
)
assert.equal(
  evaluateModules(frozenBefore.files, ['business-model'])['business-model']?.status,
  'Partial',
  'the frozen annual filing lifts business-model readiness above Insufficient',
)
assert.equal(readinessHas(frozenBefore.files, 'external:peer_transcript'), true)
fs.writeFileSync(path.join(pool, 'Current Price Quote 2099.txt'), 'live-only mutation after freeze')
fs.rmSync(path.join(pool, 'Filings', 'annual.txt'))
const hiddenLive = path.join(tmp, 'data', 'TESTX-live-hidden')
fs.renameSync(pool, hiddenLive)
const frozenAfter = await analyzeTicker('TESTX', undefined, { exactDataDir: frozenEvidence })
assert.deepEqual(
  {
    files: frozenAfter.files.map((file) => file.path ?? file.filename),
    modules: frozenAfter.modules,
    coverage: frozenAfter.coverage,
  },
  {
    files: frozenBefore.files.map((file) => file.path ?? file.filename),
    modules: frozenBefore.modules,
    coverage: frozenBefore.coverage,
  },
  'post-freeze live mutations cannot change readiness files or module coverage',
)
fs.renameSync(hiddenLive, pool)
const changedLive = await analyzeTicker('TESTX')
assert.notDeepEqual(
  changedLive.files.map((file) => file.path ?? file.filename),
  frozenAfter.files.map((file) => file.path ?? file.filename),
  'control: the live pool really did change while the frozen classifier stayed stable',
)

fs.rmSync(tmp, { recursive: true, force: true })
console.log('data-status-progress.test.ts: exact-file analyzer progress passed')
