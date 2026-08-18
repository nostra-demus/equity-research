// Watchlist persistence (src/watchlist.ts readEntries / writeEntry / readSizingDecoration).
//
// The contract is that a damaged file degrades ONE row rather than emptying the list or throwing, that a
// crash mid-write cannot leave a half-parsed entry behind, and that a scoped or corrupt sizing file
// changes the engine's DECORATION without ever changing who is on the list.
// Run: npx tsx test/watchlist-store.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { WATCH_ID_RE, isWatchId, newEntryId, readEntries, readSizingDecoration, writeEntry, makeListing, type WatchEntry } from '../src/watchlist'

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log('  ok ', name) } catch (e) { console.error('  FAIL', name); console.error('   ', e); process.exitCode = 1 }
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'wl-'))

const mk = (id: string, ticker: string): WatchEntry => ({
  schema_version: 'watchlist-entry/v1', entry_id: id, origin: 'manual',
  listing: makeListing({ ticker, currency: 'USD' }), engine_ref: null, why: 'w',
  conviction: null, review_date: null, tags: [], triggers: [], attachments: [],
  archive: null, history: [], created_at: '2026-08-01T00:00:00Z', created_by: 't', updated_at: '2026-08-01T00:00:00Z',
})

check('ids match the documented shape and validate', () => {
  const id = newEntryId(new Date('2026-08-18T12:00:00Z'))
  assert.match(id, WATCH_ID_RE)
  assert.ok(isWatchId(id))
  assert.ok(!isWatchId('WL-2026818-abcd'), 'a malformed id is refused')
  assert.ok(!isWatchId('../../etc/passwd'))
})

check('two ids minted in the same millisecond do not collide', () => {
  const now = new Date('2026-08-18T12:00:00Z')
  assert.notEqual(newEntryId(now), newEntryId(now), 'archive -> restore -> archive within a second must not dedupe')
})

check('a missing directory reads as empty, never throws', () => {
  const { entries, unreadable } = readEntries(path.join(tmp(), 'nope'))
  assert.deepEqual(entries, [])
  assert.deepEqual(unreadable, [])
})

check('a write can be read back, atomically — no .tmp left behind', () => {
  const d = tmp()
  writeEntry(mk('WL-20260818-aaaaaaaa', 'AMZN'), d)
  const { entries } = readEntries(d)
  assert.equal(entries.length, 1)
  assert.equal(entries[0].listing.ticker, 'AMZN')
  assert.ok(!fs.readdirSync(d).some((n) => n.includes('.tmp-')), 'no temp file survives a successful write')
})

check('one damaged file degrades one row — the rest still load', () => {
  const d = tmp()
  writeEntry(mk('WL-20260818-aaaaaaaa', 'AMZN'), d)
  writeEntry(mk('WL-20260818-bbbbbbbb', 'BG'), d)
  fs.writeFileSync(path.join(d, 'WL-20260818-cccccccc.json'), '{ truncated')
  fs.writeFileSync(path.join(d, 'WL-20260818-dddddddd.json'), '[1,2,3]')
  const { entries, unreadable } = readEntries(d)
  assert.equal(entries.length, 2, 'the good rows survive')
  assert.equal(unreadable.length, 2, 'the bad ones are reported, not silently dropped')
})

// ---- sizing decoration ----
const writeSizing = (dir: string, name: string, body: unknown) => {
  fs.mkdirSync(path.join(dir, 'portfolio'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'portfolio', name), JSON.stringify(body))
}

check('the newest whole-book sizing file decorates', () => {
  const d = tmp()
  writeSizing(d, '2026-08-15_sizing.json', { scope: 'all', generated_at: '2026-08-15', watch: [{ ticker: 'AMZN', size_in_trigger: 'old' }] })
  writeSizing(d, '2026-08-16_sizing.json', { scope: 'all', generated_at: '2026-08-16', watch: [{ ticker: 'AMZN', size_in_trigger: 'new' }] })
  const deco = readSizingDecoration(d)
  assert.equal(deco.generated_at, '2026-08-16')
  assert.equal(deco.byTicker.get('AMZN')?.[0].size_in_trigger, 'new')
})

check('a SCOPED sizing run is skipped — it must not truncate the book', () => {
  const d = tmp()
  writeSizing(d, '2026-08-16_sizing.json', { scope: 'all', generated_at: '2026-08-16', watch: [{ ticker: 'AMZN' }, { ticker: 'BG' }] })
  writeSizing(d, '2026-08-17_sizing.json', { scope: 'AMZN', generated_at: '2026-08-17', watch: [{ ticker: 'AMZN' }] })
  const deco = readSizingDecoration(d)
  assert.equal(deco.generated_at, '2026-08-16')
  assert.equal(deco.byTicker.size, 2, 'the whole-book file still decorates both names')
})

check('a corrupt newest file falls through to the next-newest', () => {
  const d = tmp()
  writeSizing(d, '2026-08-16_sizing.json', { scope: 'all', generated_at: '2026-08-16', watch: [{ ticker: 'AMZN' }] })
  fs.writeFileSync(path.join(d, 'portfolio', '2026-08-17_sizing.json'), '{ nope')
  assert.equal(readSizingDecoration(d).generated_at, '2026-08-16')
})

check('no portfolio folder at all is empty decoration, not a throw', () => {
  const deco = readSizingDecoration(tmp())
  assert.equal(deco.file, null)
  assert.equal(deco.byTicker.size, 0)
})

console.log(`\nwatchlist-store.test.ts: ${passed} passed`)
