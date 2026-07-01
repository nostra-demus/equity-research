// GICS Tobacco/BAT-alias regression + Energy sector + sector/date-range + explainFeedFilterMatch trace.
// The BAT case is the actual reported bug: "British American Tobacco" (full name) already matches via
// the 'tobacco' keyword, but a headline that names the company only as "BAT"/"BATS"/"BTI" (the LLM's
// company-guess short form) matched NOTHING before the company-alias layer — invisible to the Tobacco
// filter and to facets. The alias layer is deliberately an EXACT match against the structured company
// guess (name/ticker), never a free-text scan, because "bat"/"bats" collide with the English word and
// with BATS Global Markets (the former US exchange operator) — the collision-guard tests below prove
// that design choice actually holds. Run: npx tsx test/gics-filter.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { searchFeed } from '../src/news/feed'
import { matchesFeedFilters, explainFeedFilterMatch } from '../src/news/feed-filter'
import { gicsOf } from '../src/news/gics'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-06-28T12:00:00Z')
const now = () => NOW
const dayAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10)
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gicsfilter-'))

let seq = 0
function item(p: Partial<FeedItem> & { ts: string }): FeedItem {
  seq++
  return {
    kind: 'item', event_id: `EVT-${String(seq).padStart(6, '0')}`, headline: 'A generic corporate update',
    url: `https://ex.com/${seq}`, domain: 'ex.com', source_name: 'Example Wire', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 50, band: 'watch', triage_reason: '', relevance: 'material',
    event_types: ['product'], issuer_linkage: 'primary', companies: [], size_bucket: 'unknown',
    dedup_status: 'new', inboxed: true, ...p,
  } as FeedItem
}
function writeDay(repo: string, date: string, items: FeedItem[]) {
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), items.map((it) => JSON.stringify(it)).join('\n') + '\n')
}

// ---- 1. THE REPORTED BUG: "BAT lifts profit guidance" buried deep, company-guessed as {name:"BAT"} ----
check('searchFeed finds a BAT-alias Tobacco match buried days deep (the reported bug)', () => {
  const repo = tmp()
  for (let d = 0; d <= 7; d++) {
    writeDay(repo, dayAgo(d), Array.from({ length: 15 }, () => item({ ts: `${dayAgo(d)}T10:00:00Z`, headline: 'Retailer posts quarterly sales' })))
  }
  const target = item({ ts: `${dayAgo(8)}T09:00:00Z`, headline: 'BAT lifts profit guidance', companies: [{ name: 'BAT', ticker: null, listing_country: 'GB' }] })
  writeDay(repo, dayAgo(8), [target])

  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { gicsSubSector: 'Tobacco' }), limit: 60 })
  assert.equal(snap.items.length, 1, 'the BAT-tagged item is found via the company-alias, not lost as untagged')
  assert.equal(snap.items[0].event_id, target.event_id)
  assert.equal(snap.exhausted, true)
})

// ---- 2. Tobacco via ticker alias BATS / BTI (no bare-word free-text match involved) ----
check('gicsOf tags Tobacco purely from an exact ticker alias "BTI", headline names no tobacco word', () => {
  const g = gicsOf({ headline: 'Q2 results beat expectations, guidance raised', companies: [{ name: 'BAT', ticker: 'BTI' }] })
  assert.ok(g.subSectors.has('Tobacco'), 'BTI ticker alias must tag Tobacco even with a neutral headline')
  assert.ok(g.sectors.has('Consumer Staples'))
})
check('gicsOf tags Tobacco purely from an exact ticker alias "BATS", headline names no tobacco word', () => {
  const g = gicsOf({ headline: 'Board approves a new buyback program', companies: [{ name: 'BAT', ticker: 'BATS' }] })
  assert.ok(g.subSectors.has('Tobacco'), 'BATS ticker alias must tag Tobacco even with a neutral headline')
})
check('gicsOf tags Tobacco purely from an exact name alias "bat" (case-insensitive), no keyword present', () => {
  const g = gicsOf({ headline: 'Guidance unchanged for the year', companies: [{ name: 'Bat', ticker: null }] })
  assert.ok(g.subSectors.has('Tobacco'))
})

// ---- 2b. THE COLLISION GUARD: "BATS" as BATS Global Markets (the exchange operator) must NOT tag Tobacco ----
check('gicsOf does NOT tag Tobacco when "BATS" appears only as free headline prose (collision guard)', () => {
  const g = gicsOf({ headline: "Cboe's BATS platform outage halts trading", companies: [] })
  assert.ok(!g.subSectors.has('Tobacco'), 'free-text "BATS" must never trigger Tobacco — only an exact company-guess alias may')
})
check('gicsOf does NOT tag Tobacco when the company name is "BATS Global Markets" (not an exact alias match)', () => {
  const g = gicsOf({ headline: 'Exchange operator reports monthly volumes', companies: [{ name: 'BATS Global Markets', ticker: 'CBOE' }] })
  assert.ok(!g.subSectors.has('Tobacco'), 'a longer company name containing "bats" must not exact-match the alias')
})
check('gicsOf does NOT tag Tobacco from the common English word "bat" in free headline prose', () => {
  const g = gicsOf({ headline: 'Analysts bat around new estimates for the sector', companies: [] })
  assert.ok(!g.subSectors.has('Tobacco'), 'the common word "bat" in prose must never trigger Tobacco')
})

// ---- 3. Tobacco via existing keyword — regression pin (must still work exactly as before) ----
check('gicsOf still tags Tobacco via the existing "tobacco" keyword on a full company name (regression pin)', () => {
  const g = gicsOf({ headline: 'British American Tobacco raises full-year outlook', companies: [{ name: 'British American Tobacco', ticker: null }] })
  assert.ok(g.subSectors.has('Tobacco'))
  assert.ok(g.sectors.has('Consumer Staples'))
})
check('gicsOf still tags Tobacco via "cigarette maker" keyword (regression pin)', () => {
  const g = gicsOf({ headline: 'Cigarette maker warns of falling volumes', companies: [] })
  assert.ok(g.subSectors.has('Tobacco'))
})

// ---- 4. Energy sector match + non-match ----
check('searchFeed finds an Energy / Oil & Gas E&P match via "shale" keyword', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Shale driller boosts output guidance', companies: [{ name: 'Example Shale Co', ticker: null }] })])
  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { gicsSubSector: 'Oil & Gas Exploration & Production' }), limit: 60 })
  assert.equal(snap.items.length, 1)
})
check('searchFeed excludes an unrelated item from the Energy sector filter', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(0), [item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Software vendor announces new release' })])
  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { gicsSector: 'Energy' }), limit: 60 })
  assert.equal(snap.items.length, 0)
})

// ---- 5. sector + date-range combo via searchFeed's fromDate/toDate ----
check('searchFeed combines a GICS sub-sector filter with a fromDate/toDate range', () => {
  const repo = tmp()
  writeDay(repo, dayAgo(20), [item({ ts: `${dayAgo(20)}T10:00:00Z`, headline: 'BAT lifts profit guidance', companies: [{ name: 'BAT', ticker: 'BTI' }] })]) // outside range (too old)
  writeDay(repo, dayAgo(10), [item({ ts: `${dayAgo(10)}T10:00:00Z`, headline: 'Tobacco maker reports steady demand' })]) // inside range
  writeDay(repo, dayAgo(3), [item({ ts: `${dayAgo(3)}T10:00:00Z`, headline: 'Tobacco firm cuts costs' })]) // outside range (too recent)

  const snap = searchFeed(repo, {
    now,
    predicate: (it) => matchesFeedFilters(it, { gicsSubSector: 'Tobacco' }),
    fromDate: dayAgo(15), toDate: dayAgo(5),
    limit: 60,
  })
  assert.equal(snap.items.length, 1, 'only the item inside the [fromDate,toDate] window is returned')
  assert.equal(snap.items[0].headline, 'Tobacco maker reports steady demand')
})

// ---- 6. search-text + sub-sector AND-combination ----
check('matchesFeedFilters ANDs a text search with a gicsSubSector filter (both must hold)', () => {
  const bat = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'BAT lifts profit guidance to 8%', companies: [{ name: 'BAT', ticker: 'BTI' }] })
  const other = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'BAT lifts profit guidance', companies: [{ name: 'BAT', ticker: 'BTI' }] }) // no "8%"
  assert.equal(matchesFeedFilters(bat, { gicsSubSector: 'Tobacco', text: '8%' }), true)
  assert.equal(matchesFeedFilters(other, { gicsSubSector: 'Tobacco', text: '8%' }), false, 'text clause must still gate even when GICS matches')
  assert.equal(matchesFeedFilters(bat, { gicsSubSector: 'Energy', text: '8%' }), false, 'GICS clause must still gate even when text matches')
})

// ---- 7. no false empty state: a sparse Tobacco/BAT match must be reachable via paging, not silently lost ----
check('searchFeed pages to a BAT-alias match behind an exactly-full page (no false "nothing more")', () => {
  const repo = tmp()
  const day0 = dayAgo(0)
  writeDay(repo, day0, [
    item({ ts: `${day0}T10:00:00Z`, headline: 'Cigarette maker A posts results' }),
    item({ ts: `${day0}T09:00:00Z`, headline: 'Cigarette maker B posts results' }),
  ])
  const deep = item({ ts: `${dayAgo(5)}T08:00:00Z`, headline: 'BAT lifts profit guidance', companies: [{ name: 'BAT', ticker: 'BTI' }] })
  writeDay(repo, dayAgo(5), [deep])

  const pred = (it: FeedItem) => matchesFeedFilters(it, { gicsSubSector: 'Tobacco' })
  const first = searchFeed(repo, { now, predicate: pred, limit: 2 })
  assert.equal(first.items.length, 2, 'returns a full page')
  assert.ok(first.nextCursor, 'a full page with an older match remaining must expose a cursor, not a silent dead-end')

  const seen = new Set<string>()
  let cursor: any = null
  for (let page = 0; page < 10; page++) {
    const snap = searchFeed(repo, { now, predicate: pred, limit: 2, cursor })
    for (const it of snap.items) seen.add(it.event_id)
    if (!snap.nextCursor) { assert.equal(snap.exhausted, true); break }
    cursor = snap.nextCursor
  }
  assert.ok(seen.has(deep.event_id), 'the BAT-alias match buried behind an exactly-full page is reachable via paging')
  assert.equal(seen.size, 3, 'all three Tobacco matches returned exactly once')
})

// ---- 8. explainFeedFilterMatch trace assertions ----
check('explainFeedFilterMatch: reports the exact company-alias term that matched Tobacco', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'BAT lifts profit guidance', companies: [{ name: 'BAT', ticker: 'BTI' }] })
  const ex = explainFeedFilterMatch(it, { gicsSubSector: 'Tobacco' })
  assert.equal(ex.matched, true)
  const gics = ex.checks.find((c) => c.clause === 'gics')
  assert.ok(gics?.passed)
  assert.match(gics!.detail, /company alias/, 'detail names the alias path, not a keyword')
  assert.match(gics!.detail, /bti/i, 'detail names the specific matched term')
})
check('explainFeedFilterMatch: reports the matched keyword when classification comes from free text', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Cigarette maker warns of falling volumes', companies: [] })
  const ex = explainFeedFilterMatch(it, { gicsSubSector: 'Tobacco' })
  assert.equal(ex.matched, true)
  const gics = ex.checks.find((c) => c.clause === 'gics')
  assert.match(gics!.detail, /keyword "cigarette maker"/)
})
check('explainFeedFilterMatch: reports a plain non-match reason when nothing hits Tobacco', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Retailer posts quarterly sales', companies: [] })
  const ex = explainFeedFilterMatch(it, { gicsSubSector: 'Tobacco' })
  assert.equal(ex.matched, false)
  const gics = ex.checks.find((c) => c.clause === 'gics')
  assert.equal(gics?.passed, false)
  assert.match(gics!.detail, /nothing in the headline/i)
})
check('explainFeedFilterMatch: records every set clause without short-circuiting on the first failure', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z`, headline: 'Retailer posts quarterly sales', country: 'US', companies: [] })
  const ex = explainFeedFilterMatch(it, { country: 'GB', gicsSubSector: 'Tobacco', band: 'pick' })
  assert.equal(ex.matched, false)
  assert.equal(ex.checks.length, 3, 'all three set clauses are recorded, not just the first failure')
  assert.ok(ex.checks.every((c) => c.passed === false))
})
check('explainFeedFilterMatch: an unset clause is not recorded (only active filters produce a check)', () => {
  const it = item({ ts: `${dayAgo(0)}T10:00:00Z` })
  const ex = explainFeedFilterMatch(it, { gicsSubSector: 'Tobacco' })
  assert.equal(ex.checks.length, 1, 'only the gics clause was set, so only one check is recorded')
})

console.log(`\ngics-filter.test.ts: ${passed} passed`)
