// Operator declarations about a holding that the statement cannot answer — currently which positions
// are cash equivalents. Hermetic: writes to a throwaway directory.
// Run: npx tsx test/portfolio-overrides.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  isCashEquivalent, MAX_CASH_EQUIVALENTS, readOverrides, setCashEquivalent,
} from '../src/portfolio-overrides'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fundbook-overrides-'))
let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}
function dir(name: string): string {
  const d = path.join(TMP, name)
  fs.mkdirSync(d, { recursive: true })
  return d
}

check('nothing is a cash equivalent until the operator says so', () => {
  // The broker cannot answer this: in a real export SGOV (a T-bill ETF), CANE (sugar) and GLDM (gold)
  // all arrive as subCategory="ETF". Defaulting any of them on would be a guess about the book.
  const d = dir('empty')
  assert.deepEqual(readOverrides(d).cashEquivalents, [])
  assert.equal(isCashEquivalent(readOverrides(d), 'SGOV'), false)
})

check('a declaration round-trips, upper-cased, and can be taken back', () => {
  const d = dir('roundtrip')
  setCashEquivalent(d, ' sgov ', true)
  assert.deepEqual(readOverrides(d).cashEquivalents, ['SGOV'])
  assert.equal(isCashEquivalent(readOverrides(d), 'sgov'), true)
  setCashEquivalent(d, 'SGOV', false)
  assert.deepEqual(readOverrides(d).cashEquivalents, [])
})

check('declaring twice is not two entries, and undeclaring what was never declared is a no-op', () => {
  const d = dir('idempotent')
  setCashEquivalent(d, 'SGOV', true)
  setCashEquivalent(d, 'sgov', true)
  assert.deepEqual(readOverrides(d).cashEquivalents, ['SGOV'])
  setCashEquivalent(d, 'BIL', false)
  assert.deepEqual(readOverrides(d).cashEquivalents, ['SGOV'])
})

check('an empty symbol is refused rather than stored', () => {
  const d = dir('blank')
  assert.throws(() => setCashEquivalent(d, '   ', true), /symbol is required/)
  assert.deepEqual(readOverrides(d).cashEquivalents, [])
})

check('a corrupt or hostile file reads as no declarations', () => {
  // These decorate the book; losing them must never cost the book itself.
  const d = dir('corrupt')
  const f = path.join(d, 'overrides.json')
  fs.writeFileSync(f, '{"cashEquivalents":')
  assert.deepEqual(readOverrides(d).cashEquivalents, [])
  fs.writeFileSync(f, '["SGOV"]')
  assert.deepEqual(readOverrides(d).cashEquivalents, [], 'a bare array is not the stored shape')
  fs.writeFileSync(f, JSON.stringify({ cashEquivalents: 'SGOV' }))
  assert.deepEqual(readOverrides(d).cashEquivalents, [], 'a string is not a list')
  fs.writeFileSync(f, JSON.stringify({ cashEquivalents: ['SGOV', 42, null, '', 'bil'] }))
  assert.deepEqual(readOverrides(d).cashEquivalents, ['BIL', 'SGOV'], 'readable entries survive the rest')
})

check('the list is bounded', () => {
  const d = dir('cap')
  for (let i = 0; i < MAX_CASH_EQUIVALENTS; i++) setCashEquivalent(d, `SYM${i}`, true)
  assert.throws(() => setCashEquivalent(d, 'ONEMORE', true), /no room/)
  // Taking one back still works at the cap — otherwise the operator would be stuck.
  assert.doesNotThrow(() => setCashEquivalent(d, 'SYM0', false))
  assert.equal(readOverrides(d).cashEquivalents.length, MAX_CASH_EQUIVALENTS - 1)
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
