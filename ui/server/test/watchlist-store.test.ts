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
import { WATCH_ID_RE, isWatchId, newEntryId, pickEntryForListing, readEntries, readRunScenarios, readSizingDecoration, writeEntry, makeListing, type WatchEntry } from '../src/watchlist'
import { cleanTicker } from '../src/news/symbology'

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

// ---- regressions: defects found in review, pinned so they cannot return ----

check('an entry with no listing is quarantined, not allowed to 500 the whole read', () => {
  const d = tmp()
  writeEntry(mk('WL-20260818-aaaaaaaa', 'AMZN'), d)
  // a valid entry_id but no listing: every consumer keys on listing_key
  fs.writeFileSync(path.join(d, 'WL-20260818-eeeeeeee.json'), JSON.stringify({ entry_id: 'WL-20260818-eeeeeeee', why: 'x' }))
  fs.writeFileSync(path.join(d, 'WL-20260818-ffffffff.json'), JSON.stringify({ entry_id: 'WL-20260818-ffffffff', listing: { ticker: 'X' } }))
  const { entries, unreadable } = readEntries(d)
  assert.equal(entries.length, 1, 'the good row survives')
  assert.equal(unreadable.length, 2, 'both malformed rows are reported')
  assert.doesNotThrow(() => entries.map((e) => e.listing.listing_key))
})

check('two entries for one listing resolve to the SAME one everywhere (newest by created_at)', () => {
  const older = { ...mk('WL-20260818-11111111', 'BG'), created_at: '2026-08-01T00:00:00Z' }
  const newer = { ...mk('WL-20260818-22222222', 'BG'), created_at: '2026-08-09T00:00:00Z' }
  // deliberately out of filename order, so "first found" and "newest" differ
  const picked = pickEntryForListing([older, newer], older.listing.listing_key)
  assert.equal(picked?.entry_id, 'WL-20260818-22222222', 'the archive button and the merge must agree')
  assert.equal(pickEntryForListing([newer, older], older.listing.listing_key)?.entry_id, 'WL-20260818-22222222')
  assert.equal(pickEntryForListing([], 'NOPE|USD'), null)
})

check('an NSE symbol with an ampersand survives the listing grammar', () => {
  // TICKER_RE (used for PATH segments) has no '&', but cleanTicker deliberately admits it for NSE and
  // /resolve returns such symbols. Watchlist files are named by entry_id, never by ticker, so the
  // stricter path grammar must not be what gates adding one.
  assert.ok(cleanTicker('M&M.NS'), 'M&M.NS is a real listing')
  assert.equal(makeListing({ ticker: 'M&M.NS', currency: 'INR' }).listing_key, 'M&M.NS|INR')
  assert.equal(makeListing({ ticker: 'm&m.ns', currency: 'inr' }).listing_key, 'M&M.NS|INR', 'normalised either way')
})

check('the newest sizing file is chosen by generated_at, not by filename', () => {
  const d = tmp()
  // _v10 sorts UNDER _v9 by filename — the reason the server keys on the in-file date
  writeSizing(d, '2026-08-16_sizing_v9.json', { scope: 'all', generated_at: '2026-08-16', watch: [{ ticker: 'OLD' }] })
  writeSizing(d, '2026-08-16_sizing_v10.json', { scope: 'all', generated_at: '2026-08-17', watch: [{ ticker: 'NEW' }] })
  const deco = readSizingDecoration(d)
  assert.equal(deco.generated_at, '2026-08-17')
  assert.ok(deco.byTicker.has('NEW'), 'the genuinely newer run decorates')
})

console.log(`\nwatchlist-store.test.ts: ${passed} passed`)

// ── readRunScenarios: the structured targets behind the adopt prompt ────────────────────────────────
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wl-scen-'))
  const write = (run: string, body: unknown) => {
    fs.mkdirSync(path.join(dir, run), { recursive: true })
    fs.writeFileSync(path.join(dir, run, 'decision_record.json'), JSON.stringify(body))
  }

  // the real shape, including the two things the UI must not paper over: labels are NOT a fixed
  // vocabulary, and many scenario rows carry no `source` at all
  write('HAIER_2026-08-13', { currency: 'CNY', decision_date: '2026-08-13', scenarios: [
    { label: 'bull', price_target: 31.78, probability: 20, source: 'valuation/07 §3' },
    { label: 'bear_cyclical', price_target: 16.79, probability: 25 },
    { label: 'tail_structural_avoid_ruin', price_target: 4, probability: 5, source: 'valuation/07 §3' },
    { label: 'no target here', probability: 10 },
  ] })
  const got = readRunScenarios('HAIER_2026-08-13', dir)
  assert.equal(got?.currency, 'CNY')
  assert.deepEqual(got?.scenarios.map((x) => x.label), ['bull', 'bear_cyclical', 'tail_structural_avoid_ruin'],
    'a scenario with no usable target is dropped, not shown blank')
  assert.equal(got?.scenarios[1].source, null, 'an absent source stays null — never defaulted into a citation')
  assert.equal(got?.scenarios[0].source, 'valuation/07 §3')
  // the ruin tail is present and NOT singled out: picking the lowest would offer 4.00 as an entry price
  assert.equal(got?.scenarios[2].price_target, 4)

  // a record with no scenarios is a fact about the RUN; a missing record is a fact about our coverage
  write('BG_2026-06-01', { currency: 'USD', scenarios: [] })
  assert.deepEqual(readRunScenarios('BG_2026-06-01', dir)?.scenarios, [], 'record present, nothing priced')
  assert.equal(readRunScenarios('NOPE_2026-01-01', dir), null, 'no record at all')

  // the row carries the ledger's repo-relative form, which must resolve to the same record
  assert.equal(readRunScenarios('analyses/HAIER_2026-08-13', dir)?.scenarios.length, 3,
    'the "analyses/" prefix the row actually carries is accepted')

  // run_root arrives from a client parameter, so traversal must not resolve outside analyses/
  fs.writeFileSync(path.join(dir, 'decision_record.json'), JSON.stringify({ scenarios: [{ label: 'x', price_target: 9 }] }))
  for (const bad of ['../', '..', 'a/../..', '/etc', 'HAIER_2026-08-13/../HAIER_2026-08-13', '.hidden',
                     'analyses/../..', 'analyses/a/b', 'other/HAIER_2026-08-13']) {
    assert.equal(readRunScenarios(bad, dir), null, `refused: ${bad}`)
  }

  // a corrupt or non-JSON record degrades to "no record", never throws
  write('BAD_2026-01-01', 'not json' as never)
  fs.writeFileSync(path.join(dir, 'BAD_2026-01-01', 'decision_record.json'), '{ not json')
  assert.equal(readRunScenarios('BAD_2026-01-01', dir), null)
  console.log('  ok  readRunScenarios: structured targets, honest absences, and no path traversal')
  fs.rmSync(dir, { recursive: true, force: true })
}
