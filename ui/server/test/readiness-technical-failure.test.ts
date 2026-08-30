process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.READINESS_RETRY_ATTEMPTS = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-readiness-technical-'))
process.env.ENGINE_REPO_ROOT = root
const tickerDir = path.join(root, 'data', 'TESTX')
fs.mkdirSync(tickerDir, { recursive: true })
fs.writeFileSync(path.join(tickerDir, 'annual-report.txt'), 'real non-empty evidence')

try {
  // No extractor script exists in this isolated root, so the bounded subprocess check fails while the
  // parser-free walk still proves that user data exists. The UI/report must not promise a run that the
  // immutable-generation admission boundary will (correctly) refuse to start.
  const { runReadiness } = await import('../src/readiness')
  const report = await runReadiness('TESTX', 'full', undefined, {
    outDir: path.join(root, 'analyses', 'TESTX_2099-01-01', '_pool_extracts'),
  })
  const issue = report.issues.find((candidate) => candidate.code === 'check_failed')
  assert.equal(issue?.severity, 'blocker')
  assert.match(issue?.message ?? '', /No provider was started/)
  assert.doesNotMatch(issue?.message ?? '', /decision|click|run anyway/i,
    'technical exhaustion is an autonomous pre-spend failure, never a chain human panel')
  assert.doesNotMatch(issue?.message ?? '', /will continue/i)
  assert.equal(report.frozenPool, undefined)
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('readiness-technical-failure.test.ts: technical failure never invents continuation')
