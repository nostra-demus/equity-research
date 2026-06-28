// Archive-spanning search + facets — the core "false nothing" regression. A sparse match buried days
// deep in the archive (older than a pile of newer non-matching items) must still be found, an OLD line
// with NO stored country must still resolve on read (no-backfill geography), paging must be loss-free,
// and the facet index must surface "United Arab Emirates" with a count. Isolated tmp repos, no network.
// Run: npx tsx test/feed-search.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { searchFeed } from '../src/news/feed'
import { matchesFeedFilters } from '../src/news/feed-filter'
import { computeFacets, invalidateFacets } from '../src/news/facets'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-06-28T12:00:00Z')
const now = () => NOW
const dayAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10)
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'feedsearch-'))

let seq = 0
function item(p: Partial<FeedItem> & { ts: string }): FeedItem {
  seq++
  return {
    kind: 'item', event_id: `EVT-${String(seq).padStart(6, '0')}`, headline: 'A generic corporate update',
    url: `https://ex.com/${seq}`, domain: 'ex.com', source_name: 'Example Wire', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 50, band: 'watch', triage_reason: '', relevance: 'material',
    event_types: ['product'], issuer_linkage: 'macro', companies: [], size_bucket: 'unknown',
    dedup_status: 'new', inboxed: true, ...p,
  }
}
function writeDay(repo: string, date: string, items: FeedItem[]) {
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  const lines = items.map((it) => JSON.stringify(it)).join('\n') + '\n'
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), lines)
}

// ---- 1. the false-nothing regression: a sparse match 8 days deep, behind many newer non-matches ----
check('searchFeed finds a sparse Aerospace & Defense / AE match buried days deep', () => {
  const repo = tmp()
  // 0..7 days ago: 20 filler items/day, none defense, country US — the "newest N" a windowed read returns
  for (let d = 0; d <= 7; d++) {
    writeDay(repo, dayAgo(d), Array.from({ length: 20 }, () => item({ ts: `${dayAgo(d)}T10:00:00Z`, country: 'US', headline: 'Retailer posts quarterly sales' })))
  }
  // 8 days ago: the one true match
  const target = item({ ts: `${dayAgo(8)}T09:00:00Z`, country: 'AE', headline: 'UAE defense firm wins missile contract' })
  writeDay(repo, dayAgo(8), [target])

  const snap = searchFeed(repo, {
    now,
    predicate: (it) => matchesFeedFilters(it, { gicsSubSector: 'Aerospace & Defense', country: 'AE' }),
    limit: 60,
  })
  assert.equal(snap.items.length, 1, 'the deep match is found, not lost behind newer items')
  assert.equal(snap.items[0].event_id, target.event_id)
  assert.equal(snap.scannedThroughDate, dayAgo(8), 'scanned all the way back to the match day')
  assert.equal(snap.exhausted, true, 'reached the archive floor with a single match (no false "more")')
  assert.equal(snap.nextCursor, null)
})

// ---- 2. no-backfill geography: an OLD line with NO country field resolves on read via the headline ----
check('searchFeed resolves country on read for a line written before the country field', () => {
  const repo = tmp()
  const old: any = item({ ts: `${dayAgo(5)}T08:00:00Z`, headline: 'Dubai aerospace group expands defense unit' })
  delete old.country // simulate an archived line that predates the country field
  writeDay(repo, dayAgo(5), [old])

  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { country: 'AE', gicsSector: 'Industrials' }), limit: 60 })
  assert.equal(snap.items.length, 1, 'hydrate() derived AE from the headline — the archive is filterable with no backfill')
})

// ---- 3. paging is loss-free across pages (compound ts,event_id cursor; same-minute ties) ----
check('searchFeed pages without loss or duplication', () => {
  const repo = tmp()
  // 7 defense/AE matches, several sharing the exact same minute (the cursor tie case)
  const day = dayAgo(1)
  const matches = Array.from({ length: 7 }, (_, i) => item({ ts: `${day}T0${i < 3 ? '9' : '8'}:30:00Z`, country: 'AE', headline: 'UAE missile maker update' }))
  writeDay(repo, day, matches)

  const seen = new Set<string>()
  let cursor: any = null
  for (let page = 0; page < 10; page++) {
    const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { gicsSubSector: 'Aerospace & Defense' }), limit: 2, cursor })
    for (const it of snap.items) { assert.ok(!seen.has(it.event_id), `no duplicate ${it.event_id}`); seen.add(it.event_id) }
    if (!snap.nextCursor) break
    cursor = snap.nextCursor
  }
  assert.equal(seen.size, 7, 'every match returned exactly once across pages')
})

// ---- 4. facets: the archive surfaces UAE (under Middle East) and the Aerospace & Defense sub-sector ----
check('computeFacets surfaces UAE with a count, under Middle East, plus the sub-sector', () => {
  invalidateFacets()
  const repo = tmp()
  writeDay(repo, dayAgo(2), [
    item({ ts: `${dayAgo(2)}T10:00:00Z`, country: 'AE', headline: 'UAE defense contractor wins order' }),
    item({ ts: `${dayAgo(2)}T11:00:00Z`, country: 'AE', headline: 'Dubai missile maker expands' }),
    item({ ts: `${dayAgo(2)}T12:00:00Z`, country: 'US', headline: 'US bank reports earnings' }),
  ])
  const f = computeFacets(repo, {}, { now })
  const ae = f.countries.find((c) => c.key === 'AE')
  assert.ok(ae && ae.count === 2, 'UAE shows a count of 2')
  assert.equal(ae!.parent, 'Middle East')
  assert.ok(f.regions.find((r) => r.key === 'Middle East'), 'the Middle East continent is listed')
  assert.ok(f.subSectors.find((s) => s.key === 'Aerospace & Defense'), 'the Aerospace & Defense sub-sector is listed')
  assert.equal(f.total, 3)

  // narrowing by country=AE re-counts the OTHER facets in that context (sub-sectors now only the AE ones)
  const fAe = computeFacets(repo, { country: 'AE' }, { now })
  assert.equal(fAe.total, 2)
  assert.ok(fAe.subSectors.find((s) => s.key === 'Aerospace & Defense'))
})

// ---- 5. exact-full-page boundary: a page that lands EXACTLY on `limit` must still expose older matches ----
// Regression for the cursor-loss bug: when the days scanned to reach the page brought the running match
// total to EXACTLY `limit`, the loop stopped with `matches.length === limit`, computed hasMore=false and
// nextCursor=null while older matching days were never scanned — silently hiding them (the "false nothing"
// this function exists to kill). The scan must overflow by one (or reach the floor) before declaring done.
check('searchFeed does not drop older matches when a page fills to EXACTLY the limit', () => {
  const repo = tmp()
  const day0 = dayAgo(0)
  // exactly `limit` (=2) matches on the newest day…
  writeDay(repo, day0, [
    item({ ts: `${day0}T10:00:00Z`, country: 'AE', headline: 'UAE defense firm A wins order' }),
    item({ ts: `${day0}T09:00:00Z`, country: 'AE', headline: 'UAE defense firm B wins order' }),
  ])
  // …and one MORE match five days older, which must remain reachable
  const deep = item({ ts: `${dayAgo(5)}T08:00:00Z`, country: 'AE', headline: 'UAE missile maker deep match' })
  writeDay(repo, dayAgo(5), [deep])

  const pred = (it: FeedItem) => matchesFeedFilters(it, { gicsSubSector: 'Aerospace & Defense', country: 'AE' })
  // single call: a full page at exactly the limit must NOT claim to be done while older data exists
  const first = searchFeed(repo, { now, predicate: pred, limit: 2 })
  assert.equal(first.items.length, 2, 'returns a full page')
  assert.ok(first.nextCursor, 'a full page with older matches remaining must expose a cursor, not a silent dead-end')
  assert.equal(first.exhausted, false, 'not exhausted — an older match remains')

  // page through: the deep match must be reachable, exactly once, ending in an honest exhausted state
  const seen = new Set<string>()
  let cursor: any = null
  for (let page = 0; page < 10; page++) {
    const snap = searchFeed(repo, { now, predicate: pred, limit: 2, cursor })
    for (const it of snap.items) { assert.ok(!seen.has(it.event_id), `no duplicate ${it.event_id}`); seen.add(it.event_id) }
    if (!snap.nextCursor) { assert.equal(snap.exhausted, true, 'final page reports exhausted'); break }
    cursor = snap.nextCursor
  }
  assert.ok(seen.has(deep.event_id), 'the older match buried behind an exactly-full page is reachable via paging')
  assert.equal(seen.size, 3, 'all three matches returned exactly once')
})

// ---- 6. budget-stop cursor must ADVANCE past a single day that alone exhausts the line budget ----
// Regression: when one day's line count >= maxLinesScan while it yields a partial page, the resume cursor
// used to be that same day's midnight ({ts:`<day>T00:00:00Z`,id:''}). The next call re-read that day,
// afterCursor excluded all of it, the budget tripped again at d=0, and an IDENTICAL cursor was returned
// forever — an infinite client paging loop that permanently hid every older match (the "false nothing").
// Contract (feed.ts searchFeed): paging is loss-free and the cursor strictly advances toward the floor.
check('searchFeed advances the budget cursor past a fat day so deeper matches stay reachable (no stall)', () => {
  const repo = tmp()
  const day0 = dayAgo(0)
  // newest day: 2 AE matches (10:00, 09:00) + 15 newer US filler lines → 17 lines, alone over a small budget
  writeDay(repo, day0, [
    item({ ts: `${day0}T10:00:00Z`, country: 'AE', headline: 'UAE defense firm A wins order' }),
    item({ ts: `${day0}T09:00:00Z`, country: 'AE', headline: 'UAE defense firm B wins order' }),
    ...Array.from({ length: 15 }, () => item({ ts: `${day0}T11:00:00Z`, country: 'US', headline: 'Retailer posts quarterly sales' })),
  ])
  // a deeper AE match five days older — only reachable if the cursor advances past the fat day0
  const deep = item({ ts: `${dayAgo(5)}T08:00:00Z`, country: 'AE', headline: 'UAE missile maker deep match' })
  writeDay(repo, dayAgo(5), [deep])

  const pred = (it: FeedItem) => matchesFeedFilters(it, { gicsSubSector: 'Aerospace & Defense', country: 'AE' })
  const seen = new Set<string>()
  const cursorsSeen = new Set<string>()
  let cursor: any = null
  let pages = 0
  for (; pages < 12; pages++) {
    const snap = searchFeed(repo, { now, predicate: pred, limit: 2, maxLinesScan: 10, cursor })
    for (const it of snap.items) { assert.ok(!seen.has(it.event_id), `no duplicate ${it.event_id}`); seen.add(it.event_id) }
    if (!snap.nextCursor) { assert.equal(snap.exhausted, true, 'final page reports exhausted'); break }
    const key = `${snap.nextCursor.ts}|${snap.nextCursor.id}`
    assert.ok(!cursorsSeen.has(key), `cursor must strictly advance, not repeat (${key}) — a repeat is the infinite-loop bug`)
    cursorsSeen.add(key)
    cursor = snap.nextCursor
  }
  assert.ok(pages < 12, 'paging terminated (did not spin to the page cap)')
  assert.ok(seen.has(deep.event_id), 'the deep match behind a budget-exhausting day is reachable')
  assert.equal(seen.size, 3, 'all three AE matches returned exactly once')
})

// ---- 7. malformed cursor.ts / impossible toDate must NOT throw (would be an unhandled route 500 + leak) ----
// Regression: startDate flowed straight into new Date(`${startDate}T00:00:00Z`) — new Date(NaN).toISOString()
// throws RangeError, and /api/news/search has no try/catch or global error handler, so "abc"/"2026-13-45"
// returned HTTP 500 leaking "Invalid time value". searchFeed must be total over any string input.
check('searchFeed does not throw on a malformed cursor.ts or an impossible toDate', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [item({ ts: `${dayAgo(0)}T10:00:00Z`, country: 'AE', headline: 'UAE defense order' })])
  const pred = () => true
  assert.doesNotThrow(() => searchFeed(repo, { now, predicate: pred, cursor: { ts: 'abc', id: '' } }), 'a non-date cursor.ts must not crash')
  assert.doesNotThrow(() => searchFeed(repo, { now, predicate: pred, toDate: '2026-13-45' }), 'an impossible toDate must not crash')
  const snap = searchFeed(repo, { now, predicate: pred, cursor: { ts: 'abc', id: '' } })
  assert.ok(Array.isArray(snap.items), 'still returns a usable snapshot (falls back to today)')
})

// ---- 8. loss-free paging when >limit same-ts items have an EMPTY event_id (url tiebreak) ----
// Regression: the cursor tie-break was event_id only; out-of-contract items with an empty event_id sharing
// a ts collapsed to one indistinguishable cursor and every one past the first was dropped across the page
// boundary. Real items always carry both event_id and url; the idKey fallback to url keeps the (ts,key)
// order total. Contract (feed.ts SearchCursor / idKey): paging is loss-free at minute granularity.
check('searchFeed pages without loss when same-ts items have an empty event_id (url disambiguates)', () => {
  const repo = tmp()
  const day = dayAgo(1)
  // three matches, identical ts, empty event_id, but distinct url (the realistic out-of-contract case)
  writeDay(repo, day, [
    item({ ts: `${day}T09:00:00Z`, event_id: '', url: 'https://ex.com/aaa', country: 'AE', headline: 'UAE missile maker a' }),
    item({ ts: `${day}T09:00:00Z`, event_id: '', url: 'https://ex.com/bbb', country: 'AE', headline: 'UAE missile maker b' }),
    item({ ts: `${day}T09:00:00Z`, event_id: '', url: 'https://ex.com/ccc', country: 'AE', headline: 'UAE missile maker c' }),
  ])
  const pred = (it: FeedItem) => matchesFeedFilters(it, { gicsSubSector: 'Aerospace & Defense', country: 'AE' })
  const seen = new Set<string>()
  let cursor: any = null
  for (let page = 0; page < 10; page++) {
    const snap = searchFeed(repo, { now, predicate: pred, limit: 2, cursor })
    for (const it of snap.items) { assert.ok(!seen.has(it.url), `no duplicate ${it.url}`); seen.add(it.url) }
    if (!snap.nextCursor) break
    cursor = snap.nextCursor
  }
  assert.equal(seen.size, 3, 'all three empty-event_id matches returned exactly once across the page boundary')
})

console.log(`\nfeed-search.test.ts: ${passed} passed`)
