// Nested Google-Drive subfolders in the data pool. A user's company folder often groups documents in
// subfolders ("Filings 4/", "Transcript Digest/") rather than as a flat list. The research orbs already
// read the whole tree (extract_pool.py's iter_pool_files walks it with os.walk); this proves the cockpit's
// own listing / readiness / count now match — so a filing inside a subfolder is SEEN, classified, and
// counted, and the user never has to move files to the top level. Proven END-TO-END through analyzeTicker()
// and listTickers() against a temp DATA_DIR (ENGINE_REPO_ROOT override) — nothing under the repo is touched.
// Run: npx tsx test/nested-pool-folders.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'nested-pool-'))
process.env.ENGINE_REPO_ROOT = TMP // config's DATA_DIR = TMP/data — set BEFORE importing data-status
const { analyzeTicker, listTickers } = await import('../src/data-status')

let passed = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- build a realistic nested pool ----
const dir = path.join(TMP, 'data', 'TESTX')
const write = (rel: string, body = 'x') => {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, body)
}
write('top_note.txt', 'a loose top-level note')                       // top-level → no `path`
write('Filings 4/Annual_Report_FY26.pdf')                            // nested annual filing
write('Filings 4/Q1 2026 Earnings Call.rtf')                         // nested transcript
write('Filings 3/Annual_Report_FY26.pdf')                            // SAME basename, different subfolder
write('Transcript Digest/Q4 2025 Earnings Call.rtf')                 // deeper-named subfolder
// engine-written output folder — its files must be EXCLUDED exactly as extract_pool.py excludes them
write('Memos 2026-08/thesis.md', '# thesis')
write('Memos 2026-08/.nostradamus_output', 'engine output — excluded from the pool')
// externally-ingested doc — owned by listExternalFiles (typed external_data), never double-listed
write('external/yipit/panel.txt', 'alt-data panel body')

async function main() {
  const status = await analyzeTicker('TESTX')
  const byPath = (p: string) => status.files.find((f) => (f.path ?? f.filename) === p)

  await check('a top-level file still has NO `path` (byte-identical to before)', () => {
    const top = byPath('top_note.txt')
    assert.ok(top, 'the top-level note is listed')
    assert.equal(top?.path, undefined, 'no path field for a top-level file')
    assert.equal(top?.filename, 'top_note.txt')
  })

  await check('a filing in a subfolder is read, with basename as `filename` and the subfolder in `path`', () => {
    const a = byPath('Filings 4/Annual_Report_FY26.pdf')
    assert.ok(a, 'the nested annual report is listed')
    assert.equal(a?.filename, 'Annual_Report_FY26.pdf', 'filename stays the basename (classification-safe)')
    assert.equal(a?.path, 'Filings 4/Annual_Report_FY26.pdf', 'path carries the subfolder location (posix)')
    assert.equal(a?.type, 'annual_filing', 'classified from the basename, not contaminated by the folder name')
  })

  await check('duplicate basenames across two subfolders stay DISTINCT (both listed, distinct paths)', () => {
    const inF4 = byPath('Filings 4/Annual_Report_FY26.pdf')
    const inF3 = byPath('Filings 3/Annual_Report_FY26.pdf')
    assert.ok(inF4 && inF3, 'both same-named annuals appear')
    assert.notEqual(inF4?.path, inF3?.path, 'they are distinguishable by path')
  })

  await check('a nested earnings call is classified as a transcript (folder name does not leak in)', () => {
    assert.equal(byPath('Filings 4/Q1 2026 Earnings Call.rtf')?.type, 'transcript')
    assert.equal(byPath('Transcript Digest/Q4 2025 Earnings Call.rtf')?.type, 'transcript')
  })

  await check('engine-written output (a folder with .nostradamus_output) is EXCLUDED', () => {
    assert.equal(byPath('Memos 2026-08/thesis.md'), undefined, 'the engine\'s own thesis is not re-ingested')
    assert.ok(!status.files.some((f) => f.filename === 'thesis.md'), 'not present under any path either')
  })

  await check('an external/ document is listed ONCE, as external_data (not double-listed)', () => {
    // external files keep their full pool-relative path as `filename` (listExternalFiles convention);
    // the recursive main walk excludes external/, so there is exactly one row and it is typed external_data.
    const ext = status.files.filter((f) => (f.path ?? f.filename).startsWith('external/'))
    assert.equal(ext.length, 1, 'exactly one row for the external doc')
    assert.equal(ext[0]?.filename, 'external/yipit/panel.txt', 'the external doc keeps its relative path')
    assert.equal(ext[0]?.type, 'external_data', 'typed external_data by listExternalFiles, not a normal type')
    assert.equal(ext[0]?.external?.provider, 'yipit', 'provider from the containing folder')
  })

  await check('the coverage view now sees the nested annual report as present', () => {
    const annual = status.coverage.find((g) => g.key === 'annual')
    assert.equal(annual?.present, true, 'annual coverage satisfied by the subfolder filing')
  })

  await check('fileCount counts the recursive pool (5 own docs + 1 external), excluding engine output', () => {
    // own docs: top_note, Filings4/annual, Filings4/call, Filings3/annual, Transcript Digest/call = 5
    // + external panel = 6 ; the Memos output folder contributes 0
    assert.equal(status.fileCount, 6, `expected 6, got ${status.fileCount}`)
  })

  await check('listTickers reports the same recursive count for the picker chip', () => {
    const t = listTickers().tickers.find((x) => x.ticker === 'TESTX')
    assert.ok(t, 'TESTX is a listed company')
    assert.equal(t?.fileCount, 6, `picker fileCount should match analyzeTicker, got ${t?.fileCount}`)
  })
}

try {
  await main()
} finally {
  fs.rmSync(TMP, { recursive: true, force: true })
}
console.log(`\nnested-pool-folders.test.ts: ${passed} passed`)
