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
import { findFeedItemById, readFeed, searchFeed } from '../src/news/feed'
import { explainFeedFilterMatch, matchesFeedFilters, parseFeedFilterQuery } from '../src/news/feed-filter'
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

// ═══ commodity-wire filter clauses (scope / commodities / wireScope) — appended checks ═══

// ---- 9. parseFeedFilterQuery: the new keys parse (commodities comma-list uppercased) ----
check('parseFeedFilterQuery parses commodities (comma-list, uppercased), scope, and wireScope', () => {
  const q = parseFeedFilterQuery({ commodities: 'gold,sugar', scope: 'commodity', wireScope: 'commodity' })
  assert.deepEqual(q.commodities, ['GOLD', 'SUGAR'])
  assert.equal(q.scope, 'commodity')
  assert.equal(q.wireScope, 'commodity')
  // unset keys stay absent, and a blank string is not a filter
  const empty = parseFeedFilterQuery({ commodities: '  ', scope: '', wireScope: undefined })
  assert.equal(empty.commodities, undefined)
  assert.equal(empty.scope, undefined)
  assert.equal(empty.wireScope, undefined)
})

// ---- 10. matchesFeedFilters: scope exact-match, commodities intersection, wireScope disjunction ----
check('matchesFeedFilters: scope is an exact-match clause', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, scope: 'commodity' })
  assert.equal(matchesFeedFilters(it, { scope: 'commodity' }), true)
  assert.equal(matchesFeedFilters(it, { scope: 'macro' }), false)
})

check('matchesFeedFilters: commodities is an intersection (OR within the set)', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, scope: 'commodity', commodities: ['GOLD', 'COPPER'] })
  assert.equal(matchesFeedFilters(it, { commodities: ['COPPER'] }), true, 'any shared subject matches')
  assert.equal(matchesFeedFilters(it, { commodities: ['WHEAT', 'GOLD'] }), true)
  assert.equal(matchesFeedFilters(it, { commodities: ['WHEAT'] }), false)
})

check('matchesFeedFilters: wireScope is the disjunction — scope match OR any commodity tag', () => {
  // a gold-miner single_name story IS commodity-wire material via its tag…
  const miner = item({ ts: `${dayAgo(0)}T10:00:00Z`, scope: 'single_name', commodities: ['GOLD'] })
  assert.equal(matchesFeedFilters(miner, { wireScope: 'commodity' }), true, 'a tagged single_name item is ON the wire')
  // …a macro story with no tags is NOT…
  const macro = item({ ts: `${dayAgo(0)}T10:00:00Z`, scope: 'macro', commodities: [], headline: 'GDP growth beats forecast' })
  assert.equal(matchesFeedFilters(macro, { wireScope: 'commodity' }), false, 'untagged off-scope item is OFF the wire')
  // …and an untagged commodity-scope story is (the scope arm of the disjunction)
  const broad = item({ ts: `${dayAgo(0)}T10:00:00Z`, scope: 'commodity', commodities: [], headline: 'Palm oil exports jump' })
  assert.equal(matchesFeedFilters(broad, { wireScope: 'commodity' }), true, 'an untagged commodity-scope item is ON the wire')
})

check('matchesFeedFilters: an item with NO commodities field lazily derives from its headline', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Wheat futures surge' }) // never hydrated, no commodities key
  assert.equal(matchesFeedFilters(it, { commodities: ['WHEAT'] }), true, 'commoditiesOf derives on the fly (synthetic /debug items)')
  assert.equal(matchesFeedFilters(it, { wireScope: 'commodity' }), true, 'the derived tag also satisfies the wire disjunction')
})

// ---- 11. archive search: a GOLD item buried days deep is found by the commodities predicate ----
check('searchFeed finds a sparse GOLD match buried days deep (commodities clause over the archive)', () => {
  const repo = tmp()
  for (let d = 0; d <= 5; d++) {
    writeDay(repo, dayAgo(d), Array.from({ length: 20 }, () => item({ ts: `${dayAgo(d)}T10:00:00Z`, headline: 'Retailer posts quarterly sales' })))
  }
  // 6 days ago: the one GOLD item — an OLD line with NO commodity fields (hydrate derives on read)
  const target = item({ ts: `${dayAgo(6)}T09:00:00Z`, headline: 'Gold climbs to a record high' })
  writeDay(repo, dayAgo(6), [target])

  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { commodities: ['GOLD'] }), limit: 60 })
  assert.equal(snap.items.length, 1, 'the buried GOLD match is found, not lost behind newer non-commodity items')
  assert.equal(snap.items[0].event_id, target.event_id)
  assert.deepEqual(snap.items[0].commodities, ['GOLD'], 'the served item carries the derived tag')
  assert.equal(snap.exhausted, true)
})

// ---- 12. facets: commodities + scopes counts, each excluding its OWN dimension ----
check('computeFacets surfaces commodities + scopes counts; picking a commodity never zeroes its own facet', () => {
  const repo = tmp() // fresh tmpdir — the facet index caches per repoRoot|archiveDir
  writeDay(repo, dayAgo(1), [
    item({ ts: `${dayAgo(1)}T10:00:00Z`, scope: 'commodity', commodities: ['GOLD'], commodity: 'GOLD', headline: 'Gold climbs to a record high' }),
    item({ ts: `${dayAgo(1)}T11:00:00Z`, scope: 'commodity', commodities: ['GOLD'], commodity: 'GOLD', headline: 'Gold extends its rally' }),
    item({ ts: `${dayAgo(1)}T12:00:00Z`, scope: 'single_name', commodities: ['COPPER'], commodity: 'COPPER', headline: 'Miner rallies as copper climbs' }),
    item({ ts: `${dayAgo(1)}T13:00:00Z`, scope: 'macro', commodities: [], headline: 'GDP growth beats forecast' }),
  ])
  const f = computeFacets(repo, {}, { now })
  assert.equal(f.commodities.find((c) => c.key === 'GOLD')?.count, 2)
  assert.equal(f.commodities.find((c) => c.key === 'COPPER')?.count, 1)
  assert.equal(f.scopes.find((s) => s.key === 'commodity')?.count, 2)
  assert.equal(f.scopes.find((s) => s.key === 'single_name')?.count, 1)
  assert.equal(f.scopes.find((s) => s.key === 'macro')?.count, 1)
  assert.equal(f.total, 4)

  // own-dimension exclusion: with commodities=GOLD active, the commodities facet still shows BOTH
  // subjects (the "if I picked this instead" counts), while every other facet narrows to GOLD rows
  const fGold = computeFacets(repo, { commodities: ['GOLD'] }, { now })
  assert.equal(fGold.commodities.find((c) => c.key === 'GOLD')?.count, 2, 'the active pick keeps its count')
  assert.equal(fGold.commodities.find((c) => c.key === 'COPPER')?.count, 1, 'the sibling subject is NOT zeroed by the pick')
  assert.deepEqual(fGold.scopes.map((s) => s.key), ['commodity'], 'the scopes facet narrows to the GOLD rows')
  assert.equal(fGold.total, 2)

  // the wire disjunction as a facet context: scope-match OR tagged → 3 of the 4 rows
  const fWire = computeFacets(repo, { wireScope: 'commodity' }, { now })
  assert.equal(fWire.total, 3, 'wire membership = scope commodity (2) + tagged single_name (1); the untagged macro row is out')
})

// ---- 13. explainFeedFilterMatch names the new clauses with pass/fail ----
check("explainFeedFilterMatch reports 'scope' / 'commodities' / 'wireScope' clauses", () => {
  const q = { scope: 'commodity', commodities: ['GOLD'], wireScope: 'commodity' }
  const hit = item({ ts: `${dayAgo(0)}T10:00:00Z`, scope: 'commodity', commodities: ['GOLD'] })
  const ex = explainFeedFilterMatch(hit, q)
  assert.equal(ex.matched, true)
  const clauses = ex.checks.map((c) => c.clause)
  assert.ok(clauses.includes('scope') && clauses.includes('commodities') && clauses.includes('wireScope'), `missing clause in [${clauses.join(', ')}]`)
  assert.ok(ex.checks.every((c) => c.passed))
  assert.ok(ex.checks.find((c) => c.clause === 'wireScope')!.detail.includes('GOLD'), 'the wire pass names the tag that carried it')

  const miss = item({ ts: `${dayAgo(0)}T10:00:00Z`, scope: 'macro', commodities: [], headline: 'GDP growth beats forecast' })
  const exMiss = explainFeedFilterMatch(miss, q)
  assert.equal(exMiss.matched, false)
  for (const clause of ['scope', 'commodities', 'wireScope']) {
    const c = exMiss.checks.find((x) => x.clause === clause)
    assert.ok(c && c.passed === false, `${clause} should be reported as failed`)
    assert.ok(c!.detail.length > 0, `${clause} carries a human-readable detail`)
  }
})

// ---- findFeedItemById: the targeted, archive-aware single-record lookup -----------------------------
// readFeed answers "the newest N items in the last D days" — so an event OLDER than that window, or one
// on a busy day past the maxItems cap, is invisible to it even though the wire happily shows it. The
// reader needs the record itself (its RSS lede, its story cluster), so it needs a lookup with neither
// bound. These pin the contract: found wherever the wire can show it, exact, bounded, and never guessing.

check('findFeedItemById: finds a record readFeed cannot see — older than the window AND past the item cap', () => {
  const repo = tmp()
  // day 0: more items than readFeed's cap would keep, so the recent window is full of noise
  writeDay(repo, dayAgo(0), Array.from({ length: 40 }, () => item({ ts: `${dayAgo(0)}T10:00:00Z` })))
  const target = item({ ts: `${dayAgo(9)}T08:15:00Z`, headline: 'Amazon may be losing its biggest competitive edge', snippet: 'The stored lede that IS the article body.' } as any)
  writeDay(repo, dayAgo(9), [target])

  assert.equal(readFeed(repo, 2, { now, maxItems: 2000 }).items.some((i) => i.event_id === target.event_id), false, 'precondition: readFeed cannot see it')

  const hit = findFeedItemById(repo, target.event_id, { now, tsHint: target.ts })
  assert.ok(hit, 'the targeted lookup finds it')
  assert.equal(hit!.event_id, target.event_id)
  assert.equal((hit as any).snippet, 'The stored lede that IS the article body.', 'the PERSISTED snippet comes back intact — this is what the reader was losing')
})

check('findFeedItemById: a single-item result keeps its stored dedup_group (withDedup must not re-cluster it)', () => {
  const repo = tmp()
  const target = { ...item({ ts: `${dayAgo(4)}T08:15:00Z` }), dedup_group: 'EVT-cluster-anchor' } as FeedItem
  writeDay(repo, dayAgo(4), [target])
  const hit = findFeedItemById(repo, target.event_id, { now, tsHint: target.ts })
  assert.equal(hit?.dedup_group, 'EVT-cluster-anchor', 'the story-cluster id survives — it is how the reader finds another outlet running the same story')
})

check('findFeedItemById: an unknown id returns null (no nearest-match, no borrowed record)', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(1), [item({ ts: `${dayAgo(1)}T10:00:00Z` })])
  assert.equal(findFeedItemById(repo, 'EVT-nope', { now, tsHint: `${dayAgo(1)}T10:00:00Z` }), null)
  assert.equal(findFeedItemById(repo, '', { now }), null, 'an empty id short-circuits')
})

check('findFeedItemById: the ts hint only picks WHICH day to open — a wrong hint never matches a different event', () => {
  const repo = tmp()
  const decoy = item({ ts: `${dayAgo(1)}T10:00:00Z`, headline: 'A different story entirely' })
  const target = item({ ts: `${dayAgo(6)}T10:00:00Z` })
  writeDay(repo, dayAgo(1), [decoy])
  writeDay(repo, dayAgo(6), [target])
  // hint points at the decoy's day: we must get NOTHING for the target, never the decoy standing in for it
  assert.equal(findFeedItemById(repo, target.event_id, { now, tsHint: `${dayAgo(1)}T10:00:00Z` }), null)
  // a future-dated hint (a skewed or hostile clock) is clamped to today — it reads today/yesterday like a
  // hintless open would, never forward into days that cannot exist, and still never matches another event
  assert.equal(findFeedItemById(repo, target.event_id, { now, tsHint: '2099-01-01T00:00:00Z' }), null, 'clamped, and still no wrong match')
  assert.equal(findFeedItemById(repo, decoy.event_id, { now, tsHint: '2099-01-01T00:00:00Z' })?.event_id, decoy.event_id, 'clamped to today → still reads the real recent days')
  // a garbage hint degrades to the bounded no-hint walk, which still finds it
  assert.ok(findFeedItemById(repo, target.event_id, { now, tsHint: 'not-a-date' }), 'unparseable hint falls back to the walk')
})

check('findFeedItemById: reads the cloud ARCHIVE when the day is gone from the local inbox', () => {
  const repo = tmp()
  const archive = tmp()
  const target = item({ ts: `${dayAgo(3)}T08:15:00Z`, snippet: 'archived lede' } as any)
  fs.writeFileSync(path.join(archive, `${dayAgo(3)}_firehose.ndjson`), JSON.stringify({ kind: 'item', ...target }) + '\n')
  assert.equal(findFeedItemById(repo, target.event_id, { now, tsHint: target.ts }), null, 'not on local disk')
  const hit = findFeedItemById(repo, target.event_id, { now, tsHint: target.ts, archiveDir: archive })
  assert.equal(hit?.event_id, target.event_id, 'found in the archive — the same mount the wire searches')
})

check('findFeedItemById: the no-hint walk is bounded — it does not reach past its day window', () => {
  const repo = tmp()
  const target = item({ ts: `${dayAgo(30)}T08:15:00Z` })
  writeDay(repo, dayAgo(30), [target])
  assert.equal(findFeedItemById(repo, target.event_id, { now, daysBack: 3 }), null, 'outside the walk window → null, not an unbounded archive scan')
  assert.ok(findFeedItemById(repo, target.event_id, { now, tsHint: target.ts }), 'a hint reaches it directly, at one day-file of cost')
})

console.log(`\nfeed-search.test.ts: ${passed} passed`)
