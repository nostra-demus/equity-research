// hydrate() reads persisted firehose lines that can span schema versions; a malformed/legacy `companies`
// field that is a non-array truthy value must NOT crash the read (Gemini medium r3635665843 — .map on a
// non-array throws). Drives the REAL read path readDayItems → hydrate against a temp firehose fixture; no
// repo file is touched. Red-on-old: the throw is swallowed by readDayItems' per-line catch and the whole
// row is DROPPED (items.length falls); green-on-new: the row survives with companies normalised to [].
// Run: npx tsx test/feed-hydrate.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readDayItems } from '../src/news/feed'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'feed-hydrate-'))
const DATE = '2026-07-23'
const inbox = path.join(TMP, 'screener', 'inbox')
fs.mkdirSync(inbox, { recursive: true })
const lines = [
  JSON.stringify({ kind: 'item', id: 'a', headline: 'Row with a non-array companies field', companies: { ticker: 'X' } }),
  JSON.stringify({ kind: 'item', id: 'b', headline: 'Row with no companies field at all' }),
  JSON.stringify({ kind: 'item', id: 'c', headline: 'Row with a normal companies array', companies: [{ name: 'Acme', ticker: 'null' }] }),
]
fs.writeFileSync(path.join(inbox, `${DATE}_firehose.ndjson`), lines.join('\n'))

try {
  check('readDayItems→hydrate tolerates a non-array companies field (no .map crash, row survives)', () => {
    const { items } = readDayItems(TMP, DATE, '')
    assert.equal(items.length, 3, 'all three rows survive — a bad companies field must not drop the row')
    const a = items.find((i) => i.id === 'a')
    assert.deepEqual(a?.companies, [], 'a non-array companies is normalised to []')
    const b = items.find((i) => i.id === 'b')
    assert.deepEqual(b?.companies, [], 'an absent companies is []')
    const c = items.find((i) => i.id === 'c')
    assert.equal(c?.companies?.length, 1, 'a good companies array is kept')
    assert.equal(c?.companies?.[0].ticker, null, 'and its junk "null" ticker is still scrubbed on read')
  })
} finally {
  fs.rmSync(TMP, { recursive: true, force: true })
}

console.log(`\nfeed-hydrate.test.ts: ${passed} passed`)
