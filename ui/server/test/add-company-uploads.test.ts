// Add-company + in-app upload validation, and the reserved / non-ticker folder filter — pure-function
// unit tests (no Drive, no network, no real data mount). Run: npx tsx test/add-company-uploads.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { isReservedDataFolder } from '../src/config'
import { isValidTicker, validateNewTicker, sanitizeUploadFilename } from '../src/sandbox'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'folders-'))

// ---- reserved (non-company) folders ----
check('the news-archive mirror is reserved in every casing', () => {
  assert.equal(isReservedDataFolder('news-archive'), true)
  assert.equal(isReservedDataFolder('NEWS-ARCHIVE'), true)
  assert.equal(isReservedDataFolder('News-Archive'), true)
})
check('real company folders are NOT reserved', () => {
  for (const t of ['AAPL', 'RELIANCE', 'RELIANCE.NS', 'BRK-B', 'TMCV']) assert.equal(isReservedDataFolder(t), false)
})
check('a NEWS_ARCHIVE_DIR resolving INSIDE data/ reserves its basename; a separate mount does not', () => {
  const dataDir = tmp()
  fs.mkdirSync(path.join(dataDir, 'mirror'))
  assert.equal(isReservedDataFolder('mirror', dataDir, path.join(dataDir, 'mirror')), true)
  // an archive dir that is a SEPARATE mount (outside data/) must not reserve a same-named real company
  const outside = tmp()
  fs.mkdirSync(path.join(outside, 'mirror'))
  assert.equal(isReservedDataFolder('mirror', dataDir, path.join(outside, 'mirror')), false)
})

// ---- the picker filter: only valid, non-reserved tickers are companies (Change A) ----
check('the listTickers predicate keeps valid non-reserved tickers, drops the rest', () => {
  const keep = (n: string) => isValidTicker(n) && !isReservedDataFolder(n)
  assert.equal(keep('AAPL'), true)
  assert.equal(keep('RELIANCE.NS'), true)
  assert.equal(keep('reliance'), false)      // lowercase → not a valid ticker (hidden per product choice)
  assert.equal(keep('TATA MOTORS'), false)   // space
  assert.equal(keep('news-archive'), false)  // reserved + invalid
  assert.equal(keep('NEWS-ARCHIVE'), false)  // reserved even though it's a valid ticker SHAPE
})

// ---- new-ticker validation (the POST /api/tickers gate) ----
check('validateNewTicker accepts a clean symbol (trimmed)', () => {
  assert.deepEqual(validateNewTicker('AAPL'), { ok: true, ticker: 'AAPL' })
  assert.deepEqual(validateNewTicker('  RELIANCE.NS '), { ok: true, ticker: 'RELIANCE.NS' })
})
check('validateNewTicker rejects with the right reason + suggestion', () => {
  const lc = validateNewTicker('aapl')
  assert.equal(lc.ok, false); assert.match((lc as any).reason, /uppercase/); assert.equal((lc as any).suggested, 'AAPL')
  const sp = validateNewTicker('TATA MOTORS')
  assert.equal(sp.ok, false); assert.match((sp as any).reason, /space/); assert.equal((sp as any).suggested, 'TATAMOTORS')
  assert.equal(validateNewTicker('TOOLONGTICKERNAME').ok, false) // 17 chars > 15
  const rv = validateNewTicker('NEWS-ARCHIVE') // valid shape, but a reserved system name
  assert.equal(rv.ok, false); assert.match((rv as any).reason, /reserved/)
})
check('validateNewTicker / isValidTicker reject all-punctuation names (., .., ---)', () => {
  for (const bad of ['.', '..', '---', '-.-']) {
    const r = validateNewTicker(bad)
    assert.equal(r.ok, false, `${bad} must be rejected`)
    assert.match((r as any).reason, /letter or number/)
    assert.equal(isValidTicker(bad), false, `isValidTicker(${bad}) must be false`)
  }
  // genuine symbols (incl. dot/hyphen + alphanumerics) still pass
  for (const ok of ['A', 'AAPL', 'BRK-B', 'RELIANCE.NS']) assert.equal(isValidTicker(ok), true, `${ok}`)
})

// ---- upload filename sanitization ----
check('sanitizeUploadFilename accepts allowed docs (case-insensitive extension)', () => {
  assert.deepEqual(sanitizeUploadFilename('Annual Report FY24.pdf'), { ok: true, name: 'Annual Report FY24.pdf' })
  assert.deepEqual(sanitizeUploadFilename('deck.PPTX'), { ok: true, name: 'deck.PPTX' })
})
check('sanitizeUploadFilename strips path components (traversal / abs / Windows) then re-checks', () => {
  // a real doc reached via traversal keeps only its basename and is accepted
  assert.deepEqual(sanitizeUploadFilename('../../tmp/Q1 results.pdf'), { ok: true, name: 'Q1 results.pdf' })
  // dangerous payloads reduce to their basename and are then rejected by the allow-list
  assert.equal(sanitizeUploadFilename('../../etc/passwd').ok, false)
  assert.equal(sanitizeUploadFilename('..\\..\\win.exe').ok, false)
  assert.equal(sanitizeUploadFilename('/etc/shadow').ok, false)
})
check('sanitizeUploadFilename rejects dotfiles, control chars, over-length, unsupported types', () => {
  assert.equal(sanitizeUploadFilename('.nostradamus_output').ok, false)
  assert.equal(sanitizeUploadFilename('.DS_Store').ok, false)
  assert.equal(sanitizeUploadFilename('bad\x00name.pdf').ok, false)
  assert.equal(sanitizeUploadFilename('a'.repeat(200) + '.pdf').ok, false)
  assert.equal(sanitizeUploadFilename('notes.exe').ok, false)
  assert.equal(sanitizeUploadFilename('noextension').ok, false)
})

console.log(`\nadd-company + uploads: ${passed} checks passed`)
