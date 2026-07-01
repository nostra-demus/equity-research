// The Screener Globe's aggregation endpoint (news/globe.ts) — country FAN-OUT (a multi-country item
// increments every country it names, not just one), the sinceDays recency window bound, the
// portfolioRelevant filter (an analyses/<TICKER>_* folder = "covered"), and the globalUnresolvedCount
// "Global / unknown" bucket (an unresolved item is counted, never dropped). Fixture pattern copied from
// feed-search.test.ts: isolated tmp repos, no network. Run: npx tsx test/globe.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { computeGlobeSnapshot, invalidateGlobeSnapshot } from '../src/news/globe'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-06-28T12:00:00Z')
const now = () => NOW
const dayAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10)
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'globe-'))

let seq = 0
function item(p: Partial<FeedItem> & { ts: string }): FeedItem {
  seq++
  return {
    kind: 'item', event_id: `EVT-${String(seq).padStart(6, '0')}`, headline: 'A generic corporate update',
    url: `https://ex.com/${seq}`, domain: 'ex.com', source_name: 'Example Wire', via: 'rss', region: 'GLOBAL',
    input_nature: 'news_headline', triage_score: 50, band: 'watch', triage_reason: '', relevance: 'material',
    event_types: ['macro'], issuer_linkage: 'macro', companies: [], size_bucket: 'unknown',
    dedup_status: 'new', inboxed: true,
    // Every fixture stamps geography_country EXPLICITLY so hydrate()'s read-time backfill never kicks in
    // (needsEventGeo is false whenever the field is already present) — the fixture's geography is exactly
    // what the test says, not whatever resolveEventGeography would derive from the placeholder headline.
    geography_country: [], geography_region: 'Global', event_location_confidence: 'low', geography_reason: 'fixture default',
    ...p,
  }
}
function writeDay(repo: string, date: string, items: FeedItem[]) {
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  const lines = items.map((it) => JSON.stringify(it)).join('\n') + '\n'
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), lines)
}

// ---- 1. fan-out: a two-country item increments BOTH country buckets, not just one ----
check('computeGlobeSnapshot fans a multi-country item out to both country buckets', () => {
  invalidateGlobeSnapshot()
  const repo = tmp()
  writeDay(repo, dayAgo(1), [
    item({ ts: `${dayAgo(1)}T09:00:00Z`, headline: 'US weighs sanctions on Iran', geography_country: ['US', 'IR'], geography_region: 'Global', event_location_confidence: 'medium' }),
    item({ ts: `${dayAgo(1)}T10:00:00Z`, headline: 'UAE defense contractor wins order', geography_country: ['AE'], geography_region: 'Middle East', event_location_confidence: 'high' }),
  ])
  const snap = computeGlobeSnapshot(repo, { sinceDays: 7 }, { now })
  const us = snap.countries.find((c) => c.country === 'US')
  const ir = snap.countries.find((c) => c.country === 'IR')
  const ae = snap.countries.find((c) => c.country === 'AE')
  assert.ok(us && us.count === 1, 'US bucket incremented by the two-country item')
  assert.ok(ir && ir.count === 1, 'IR bucket ALSO incremented by the same item (fan-out, not just the first country)')
  assert.ok(ae && ae.count === 1, 'the single-country AE item is unaffected')
  assert.equal(snap.total, 2, 'total counts each item once, regardless of how many countries it fanned out to')
  assert.equal(us!.region, 'North America')
  assert.equal(ir!.region, 'Middle East')
  // region rollup agrees with the per-country buckets it was derived from
  const middleEast = snap.regions.find((r) => r.region === 'Middle East')
  assert.ok(middleEast && middleEast.count === 2, 'Middle East region rolls up IR + AE = 2')
})

// ---- 2. sinceDays windowing: the window is a bound on the N MOST-RECENT DATES THAT HAVE DATA (a slice
//    of listFirehoseDates, not a calendar-day cutoff) — so the test needs enough populated days between
//    the recent and the old item that a narrow window's slice genuinely excludes the old one. ----
check('computeGlobeSnapshot respects the sinceDays window bound', () => {
  invalidateGlobeSnapshot()
  const repo = tmp()
  // 5 populated days (today .. 4 days ago), each a filler US item, plus the recent AE item on day 0
  for (let d = 0; d <= 4; d++) {
    writeDay(repo, dayAgo(d), [item({ ts: `${dayAgo(d)}T08:00:00Z`, headline: 'US filler', geography_country: ['US'], geography_region: 'North America', event_location_confidence: 'low' })])
  }
  writeDay(repo, dayAgo(0), [
    item({ ts: `${dayAgo(0)}T08:00:00Z`, headline: 'US filler', geography_country: ['US'], geography_region: 'North America', event_location_confidence: 'low' }),
    item({ ts: `${dayAgo(0)}T09:00:00Z`, headline: 'Recent AE item', geography_country: ['AE'], geography_region: 'Middle East', event_location_confidence: 'high' }),
  ])
  // a 20-days-old AE item, well outside a 5-populated-day window
  writeDay(repo, dayAgo(20), [item({ ts: `${dayAgo(20)}T09:00:00Z`, headline: 'Old AE item', geography_country: ['AE'], geography_region: 'Middle East', event_location_confidence: 'high' })])

  const narrow = computeGlobeSnapshot(repo, { sinceDays: 5 }, { now })
  assert.equal(narrow.sinceDays, 5)
  assert.equal(narrow.countries.find((c) => c.country === 'AE')?.count, 1, 'only the recent AE item is inside the 5-populated-day window')

  invalidateGlobeSnapshot()
  const wide = computeGlobeSnapshot(repo, { sinceDays: 30 }, { now })
  assert.equal(wide.countries.find((c) => c.country === 'AE')?.count, 2, 'widening the window to 30 days picks up the old AE item too')
})

// ---- 2b. sinceDays is clamped: below 1 floors to 1, above MAX_DAYS (400) caps at 400. Note: 0 itself is
//    falsy in JS, so `q.sinceDays || DEFAULT_SINCE_DAYS` treats an explicit 0 as "not provided" and falls
//    back to the 30-day default rather than flooring to 1 — documented here as the real, verified behavior
//    (a caller wanting "today only" must pass 1, not 0). A genuinely negative value floors to 1. ----
check('computeGlobeSnapshot clamps sinceDays into [1, 400]; an explicit 0 falls back to the 30-day default', () => {
  invalidateGlobeSnapshot()
  const repo = tmp()
  writeDay(repo, dayAgo(0), [item({ ts: `${dayAgo(0)}T09:00:00Z`, geography_country: ['AE'], geography_region: 'Middle East', event_location_confidence: 'high' })])
  const zero = computeGlobeSnapshot(repo, { sinceDays: 0 }, { now })
  assert.equal(zero.sinceDays, 30, 'sinceDays=0 is falsy — falls back to the DEFAULT_SINCE_DAYS floor, not 1')
  invalidateGlobeSnapshot()
  const negative = computeGlobeSnapshot(repo, { sinceDays: -5 }, { now })
  assert.equal(negative.sinceDays, 1, 'a genuinely negative sinceDays floors to 1')
  invalidateGlobeSnapshot()
  const tooHigh = computeGlobeSnapshot(repo, { sinceDays: 999999 }, { now })
  assert.equal(tooHigh.sinceDays, 400, 'an oversized sinceDays caps at MAX_DAYS (400)')
})

// ---- 3. portfolioRelevant: only events whose guessed company has an existing analyses/<TICKER>_* folder ----
check('computeGlobeSnapshot portfolioRelevant filters to companies with an existing analyses/<TICKER> run', () => {
  invalidateGlobeSnapshot()
  const repo = tmp()
  fs.mkdirSync(path.join(repo, 'analyses', 'ACME_20260601-120000'), { recursive: true })
  writeDay(repo, dayAgo(1), [
    item({
      ts: `${dayAgo(1)}T09:00:00Z`, headline: 'Acme Corp posts results', geography_country: ['US'], geography_region: 'North America', event_location_confidence: 'high',
      companies: [{ name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' }],
    }),
    item({
      ts: `${dayAgo(1)}T10:00:00Z`, headline: 'Unrelated Co posts results', geography_country: ['US'], geography_region: 'North America', event_location_confidence: 'high',
      companies: [{ name: 'Unrelated Co', ticker: 'ZZZZ', listing_country: 'US' }],
    }),
  ])

  const all = computeGlobeSnapshot(repo, { sinceDays: 7 }, { now })
  assert.equal(all.total, 2, 'no filter — both events counted')
  assert.equal(all.countries.find((c) => c.country === 'US')?.count, 2)

  invalidateGlobeSnapshot()
  const covered = computeGlobeSnapshot(repo, { sinceDays: 7, portfolioRelevant: true }, { now })
  assert.equal(covered.total, 1, 'only the ACME event survives — ZZZZ has no analyses/ run')
  assert.equal(covered.countries.find((c) => c.country === 'US')?.count, 1)
})

// ---- 4. globalUnresolvedCount: an item with geography_country == [] is counted, never dropped ----
check('computeGlobeSnapshot counts unresolved items in globalUnresolvedCount, never drops them', () => {
  invalidateGlobeSnapshot()
  const repo = tmp()
  writeDay(repo, dayAgo(1), [
    item({ ts: `${dayAgo(1)}T09:00:00Z`, headline: 'AE item', geography_country: ['AE'], geography_region: 'Middle East', event_location_confidence: 'high' }),
    item({ ts: `${dayAgo(1)}T10:00:00Z`, headline: 'Unresolvable global macro item', geography_country: [], geography_region: 'Global', event_location_confidence: 'low' }),
    item({ ts: `${dayAgo(1)}T11:00:00Z`, headline: 'Another unresolvable item', geography_country: [], geography_region: 'Global', event_location_confidence: 'low' }),
  ])
  const snap = computeGlobeSnapshot(repo, { sinceDays: 7 }, { now })
  assert.equal(snap.globalUnresolvedCount, 2, 'both unresolved items land in the honest Global/unknown bucket')
  assert.equal(snap.total, 3, 'total includes the unresolved items too — they are counted, not dropped')
  assert.equal(snap.countries.length, 1, 'only the one resolved country produces a country aggregate')
})

// ---- 5. old lines with no geography_country at all (undefined, pre-Globe-field) fall back via `country` ----
check('computeGlobeSnapshot falls back to the legacy single country field on pre-Globe-field lines', () => {
  invalidateGlobeSnapshot()
  const repo = tmp()
  const old: any = item({ ts: `${dayAgo(1)}T09:00:00Z`, headline: 'Dubai aerospace group expands defense unit', country: 'AE' })
  delete old.geography_country
  delete old.geography_region
  delete old.event_location_confidence
  delete old.geography_reason
  writeDay(repo, dayAgo(1), [old])
  const snap = computeGlobeSnapshot(repo, { sinceDays: 7 }, { now })
  // hydrate() backfills geography_country on read from the headline (same "Dubai" gazetteer hit as
  // resolveCountry uses) — so this line is NOT silently dropped despite predating the Globe fields.
  assert.equal(snap.total, 1)
  assert.equal(snap.countries.find((c) => c.country === 'AE')?.count, 1)
})

console.log(`\nglobe.test.ts: ${passed} passed`)
