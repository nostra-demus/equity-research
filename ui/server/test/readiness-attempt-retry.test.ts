// The readiness retry unit is the whole frozen-snapshot transaction, not just Python extraction.
// Run: npx tsx test/readiness-attempt-retry.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.READINESS_RETRY_ATTEMPTS = '2'
process.env.READINESS_RETRY_DELAY_MS = '25'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-readiness-attempt-'))
process.env.ENGINE_REPO_ROOT = root

const { runReadiness } = await import('../src/readiness')
const digest = 'a'.repeat(64)
const ticker = 'RETRYSAFE'
const dataDir = path.join(root, 'data', ticker)
const frozenPaths = {
  generationDir: path.join(root, 'frozen', digest),
  evidenceRoot: path.join(root, 'frozen', digest, 'raw'),
}
const extracted = (issues: any[] = [], fileCount = 1) => ({
  data_path: dataDir,
  generation_digest: digest,
  file_count: fileCount,
  usable_count: fileCount,
  issues,
  entities: [],
})
const presence = (fileCount = 1) => ({
  state: fileCount === 0 ? 'empty' as const : 'nonempty' as const,
  fileCount,
  nonEmptyFileCount: fileCount,
})

try {
  {
    let extracts = 0
    let verifies = 0
    let classifications = 0
    const report = await runReadiness(ticker, 'full', undefined, { technicalIO: {
      extract: async () => { extracts++; return extracted() },
      verifyFrozenGeneration: () => {
        verifies++
        if (verifies === 1) throw new Error('transient protected manifest read')
        return frozenPaths
      },
      inspectFrozenPresence: (rootPath) => {
        assert.equal(rootPath, frozenPaths.evidenceRoot, 'retry never falls back to the mutable live pool')
        return presence()
      },
      classifyExact: async () => { classifications++; return {} },
    } })
    assert.equal(report.overall, 'clean')
    assert.equal(report.frozenPool?.generationDigest, digest)
    assert.equal(extracts, 2, 'the full transaction restarts at extraction after manifest verification fails')
    assert.equal(verifies, 2)
    assert.equal(classifications, 1)
  }

  {
    let extracts = 0
    let classifications = 0
    const report = await runReadiness(ticker, 'full', undefined, { technicalIO: {
      extract: async () => { extracts++; return extracted() },
      verifyFrozenGeneration: () => frozenPaths,
      inspectFrozenPresence: () => presence(),
      classifyExact: async () => {
        classifications++
        if (classifications === 1) throw new Error('transient exact classifier fault')
        return {}
      },
    } })
    assert.equal(report.overall, 'clean')
    assert.equal(extracts, 2, 'classification failure retries the complete technical attempt')
    assert.equal(classifications, 2)
  }

  {
    let extracts = 0
    let verifies = 0
    const report = await runReadiness(ticker, 'full', undefined, { technicalIO: {
      extract: async () => { extracts++; return extracted() },
      verifyFrozenGeneration: () => { verifies++; throw new Error('permanent protected manifest fault') },
    } })
    assert.equal(extracts, 2)
    assert.equal(verifies, 2, 'permanent manifest failure stops after the exact bounded attempt count')
    assert.equal(report.issues[0]?.code, 'check_failed')
    assert.equal(report.frozenPool, undefined)
    assert.equal(report.physicalPool?.state, 'unknown')
  }

  {
    let extracts = 0
    let classifications = 0
    const report = await runReadiness(ticker, 'full', undefined, { technicalIO: {
      extract: async () => { extracts++; return extracted() },
      verifyFrozenGeneration: () => frozenPaths,
      inspectFrozenPresence: () => presence(),
      classifyExact: async () => { classifications++; throw new Error('permanent exact classifier fault') },
    } })
    assert.equal(extracts, 2)
    assert.equal(classifications, 2, 'permanent classifier failure stops after the exact bounded attempt count')
    assert.equal(report.issues[0]?.code, 'check_failed')
    assert.match(report.issues[0]?.evidence ?? '', /2 bounded attempt/)
  }

  {
    let extracts = 0
    const report = await runReadiness(ticker, 'full', undefined, { technicalIO: {
      extract: async () => {
        extracts++
        return extracted([{ code: 'empty_file', severity: 'blocker', message: 'One input is empty.' }])
      },
      verifyFrozenGeneration: () => frozenPaths,
      inspectFrozenPresence: () => ({ state: 'empty', fileCount: 1, nonEmptyFileCount: 0 }),
      classifyExact: async () => ({}),
    } })
    assert.equal(extracts, 1, 'a successful proven data verdict is not retried')
    assert.equal(report.issues[0]?.code, 'empty_file')
  }

  {
    let extracts = 0
    let classifications = 0
    const report = await runReadiness(ticker, 'full', undefined, { technicalIO: {
      extract: async () => {
        extracts++
        return extracted([{ code: 'zero_files', severity: 'blocker', message: 'No files.' }], 0)
      },
      verifyFrozenGeneration: () => frozenPaths,
      inspectFrozenPresence: () => presence(0),
      classifyExact: async () => { classifications++; return {} },
    } })
    assert.equal(extracts, 1, 'a successful proven empty generation is not retried')
    assert.equal(classifications, 0)
    assert.equal(report.issues[0]?.code, 'zero_files')
  }
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('readiness-attempt-retry.test.ts: whole-transaction bounded retries and verdict finality passed')
