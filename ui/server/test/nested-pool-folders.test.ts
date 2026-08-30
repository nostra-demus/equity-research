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
write('Memos 2026-08/archive/nested-output.md', 'nested engine output — also excluded')
// externally-ingested doc — owned by listExternalFiles (typed external_data), never double-listed
write('external/yipit/panel.txt', 'alt-data panel body')

// ---- a second company exercising the extractor PARITY edge cases (Codex #457 findings) ----
// The PR's contract is "mirror extract_pool.py's exact skip rules so the two never disagree". These prove
// the four gaps Codex surfaced are closed, each pinned to the extractor's actual behaviour, not to code.
const dirY = path.join(TMP, 'data', 'TESTY')
const writeY = (rel: string, body = 'x') => {
  const full = path.join(dirY, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, body)
}
// (1) dot-DIRECTORY: extract_pool.py's os.walk descends into ".archive/" and yields the filing (it skips a
//     document only by its OWN basename). The cockpit pruned the dot-dir subtree and missed it. Must be SEEN.
writeY('.archive/Legacy_Annual_Report_FY23.pdf')
// (5) derived extractor cache: extract_pool.py skips a file whose immediate parent ends "_pool_extracts".
//     The cockpit counted them. Must be EXCLUDED.
writeY('INDIA_pool_extracts/manifest.json', '{"derived":true}')
writeY('INDIA_pool_extracts/annual.txt', 'extracted text — derived, not a source')
// (2) duplicate-basename UNDATED calls in two subfolders: the "<2 recent calls" cap keys distinctness on a
//     per-file fallback; keyed on the BASENAME these collapse to one and mis-fire the cap. Must count as TWO.
writeY('Calls A/Earnings Call.rtf', 'management earnings call — no date in name or body')
writeY('Calls B/Earnings Call.rtf', 'a different quarter earnings call — also undated')
// (3) multiply-linked file (st_nlink != 1): extract_pool.py rejects it; the cockpit admitted it. Both the
//     original and the hard link have nlink=2, so BOTH must be EXCLUDED. Guarded — skip if the FS refuses links.
let hardlinkMade = false
try {
  writeY('orig.txt', 'a real file')
  fs.linkSync(path.join(dirY, 'orig.txt'), path.join(dirY, 'dup.txt'))
  hardlinkMade = true
} catch { /* filesystem without hard-link support — the two files below simply won't exist */ }
// (6) NESTED external/ segment (review round 2): extract_pool.py's _is_external_rel treats "external" as an
//     external marker at ANY path segment, not just data/<T>/external/. A doc under Archive/external/... must
//     be excluded from the research pool entirely — never counted, never able to satisfy filing readiness.
writeY('Archive/external/provider/Nested_External_Annual_FY23.pdf')
// (7) case-variant sidecar (review round 3): extract_pool.py's _is_sidecar lowercases the basename before
//     checking the ".source.json" suffix. A nested "...SOURCE.JSON" sidecar must be excluded, not classified
//     as an annual filing.
writeY('Filings/Annual_Report_FY26.SOURCE.JSON', '{"provenance":true}')

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
    assert.equal(byPath('Memos 2026-08/archive/nested-output.md'), undefined,
      'the marker excludes the complete output subtree')
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

  // ---- extractor PARITY edge cases (Codex #457) — each pinned to extract_pool.py's actual behaviour ----
  const statusY = await analyzeTicker('TESTY')
  const byPathY = (p: string) => statusY.files.find((f) => (f.path ?? f.filename) === p)

  await check('(1) a filing inside a dot-DIRECTORY (".archive/") is listed — extractor descends into it', () => {
    const a = byPathY('.archive/Legacy_Annual_Report_FY23.pdf')
    assert.ok(a, 'the .archive filing is read (dot-dir descended, only dot-FILES are skipped)')
    assert.equal(a?.type, 'annual_filing', 'classified from its basename')
  })

  await check('(5) derived "_pool_extracts" cache files are EXCLUDED — extractor skips that parent', () => {
    assert.ok(!statusY.files.some((f) => (f.path ?? f.filename).includes('_pool_extracts')),
      'no file whose immediate parent ends in _pool_extracts is listed')
  })

  await check('(3) a multiply-linked file (nlink!=1) is EXCLUDED — both the original and its hard link', () => {
    if (!hardlinkMade) { console.log('       (skipped — filesystem has no hard-link support)'); return }
    assert.equal(byPathY('orig.txt'), undefined, 'the hard-linked original is not listed')
    assert.equal(byPathY('dup.txt'), undefined, 'the hard link is not listed')
  })

  await check('(2) two UNDATED same-basename calls in different subfolders count as TWO recent calls', () => {
    // both listed, distinct by path
    assert.ok(byPathY('Calls A/Earnings Call.rtf') && byPathY('Calls B/Earnings Call.rtf'), 'both calls listed')
    // and the earnings module must NOT fire the "<2 recent calls" cap — distinctness keys on path, not basename
    const earningsCaps = statusY.modules['earnings']?.caps ?? []
    assert.ok(!earningsCaps.some((c) => c.includes('fewer than 2 recent earnings calls')),
      `two distinct undated calls must not trip the <2-calls cap; caps=${JSON.stringify(earningsCaps)}`)
  })

  await check('TESTY fileCount excludes _pool_extracts + hard links (dot-dir filing + 2 calls counted)', () => {
    // .archive/Legacy_Annual + Calls A/call + Calls B/call = 3 ; the 2 _pool_extracts files contribute 0.
    // When hard links were made, orig.txt + dup.txt are both excluded (nlink=2) → 3. When the FS refused
    // links, orig.txt is a normal nlink=1 file and is legitimately counted → 4. The nested Archive/external/
    // filing and the case-variant "...SOURCE.JSON" sidecar each contribute 0 either way (both excluded —
    // the sidecar not routed to listExternalFiles either, since it is never a document at all).
    const expected = hardlinkMade ? 3 : 4
    assert.equal(statusY.fileCount, expected, `expected ${expected}, got ${statusY.fileCount}`)
  })

  await check('(6) a filing under a NESTED external/ segment is excluded entirely — any depth, not just top-level', () => {
    assert.equal(byPathY('Archive/external/provider/Nested_External_Annual_FY23.pdf'), undefined,
      'nested Archive/external/... filing is not listed as a pool document')
    assert.ok(!statusY.files.some((f) => (f.path ?? f.filename).includes('Nested_External_Annual_FY23')),
      'not present under any path, and not routed to external_data either (that lane owns only the ticker-root external/)')
  })

  await check('(7) a case-variant nested sidecar ("...SOURCE.JSON") is excluded, not classified as a filing', () => {
    assert.equal(byPathY('Filings/Annual_Report_FY26.SOURCE.JSON'), undefined,
      'the upper-case sidecar suffix is still recognized as a sidecar, not a document')
    assert.ok(!statusY.files.some((f) => (f.path ?? f.filename).includes('Annual_Report_FY26.SOURCE.JSON')),
      'not present under any path')
  })
}

try {
  await main()
} finally {
  fs.rmSync(TMP, { recursive: true, force: true })
}
console.log(`\nnested-pool-folders.test.ts: ${passed} passed`)
