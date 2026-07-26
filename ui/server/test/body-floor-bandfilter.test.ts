// A body verdict FLOORS an item's band (news/impact-floor.ts → rank.ts). The band FILTER (Pick/Watch/Drop)
// must therefore see the body verdict during the PRE-FILTER score in readFeed/searchFeed — otherwise the
// Pick filter matches items on their stale headline-only band and drops the very items the body read
// rescued, before the display re-rank (which does pass the verdicts) ever runs. That is the §24 failure this
// whole feature exists to prevent, resurfacing inside the filtered view. Red before the pre-filter passes
// the verdict map; green after.
//
// STATE_DIR is resolved at config load from ENGINE_STATE_DIR — so set it and write the cache BEFORE the
// dynamic import of feed/impact-floor (a static import would load config first, freezing STATE_DIR).
// Run: npx tsx test/body-floor-bandfilter.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bandfloor-state-'))
process.env.ENGINE_STATE_DIR = stateDir
// the body read: HIGH, firm confidence → floors the rescued item to the high tier (70 = pick)
fs.writeFileSync(path.join(stateDir, 'news-enrich-cache.json'), JSON.stringify({ 'EVT-rescued': { news_impact: { impact_magnitude: 'high', confidence: 90 } } }))

const { searchFeed, readFeed } = await import('../src/news/feed')
const { invalidateBodyVerdicts } = await import('../src/news/impact-floor')
const { matchesFeedFilters } = await import('../src/news/feed-filter')

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bandfloor-repo-'))
const inbox = path.join(repo, 'screener', 'inbox')
fs.mkdirSync(inbox, { recursive: true })
const NOW = new Date('2026-07-25T12:00:00Z')
const day = '2026-07-25'
// a headline-only item: materiality 10, nothing else → score 10, band 'drop'. Its BODY reads high.
const rescued = {
  kind: 'item', event_id: 'EVT-rescued', ts: `${day}T10:00:00Z`, headline: 'Small firm quietly does a big thing',
  url: 'https://ex.com/1', domain: 'ex.com', source_name: 'News', via: 'rss', region: 'US', input_nature: 'news_headline',
  triage_score: 10, band: 'drop', event_types: [] as string[], companies: [{ name: 'Acme', ticker: 'ACME' }], size_bucket: 'large',
  rank_factors: { materiality: 10, source_tier: 0, scope: 0, event: 0, size: 0, recency: 0, materiality_label_floor: 0, quantified: 0, boost_weight: 1, scope_id: 'company', source_tier_id: 'news', event_id: null, size_bucket: 'large' },
}
fs.writeFileSync(path.join(inbox, `${day}_firehose.ndjson`), JSON.stringify(rescued) + '\n')
invalidateBodyVerdicts()

check('searchFeed: the Pick band filter INCLUDES an item the body read floored up to pick', () => {
  const snap = searchFeed(repo, { now: () => NOW, predicate: (it) => matchesFeedFilters(it, { band: 'pick' }), limit: 60 })
  const hit = snap.items.find((i) => i.event_id === 'EVT-rescued')
  assert.ok(hit, 'the body-rescued item survives the Pick filter — the pre-filter score saw the body verdict')
  assert.equal(hit!.band, 'pick', 'and it is shown at pick')
  assert.ok(hit!.triage_score >= 70, 'floored to the high tier')
})

check('searchFeed: it is correctly EXCLUDED from the Drop filter it no longer belongs to', () => {
  const snap = searchFeed(repo, { now: () => NOW, predicate: (it) => matchesFeedFilters(it, { band: 'drop' }), limit: 60 })
  assert.equal(snap.items.find((i) => i.event_id === 'EVT-rescued'), undefined, 'the body floor moved it out of drop')
})

check('readFeed: the same Pick filter includes the body-rescued item', () => {
  const snap = readFeed(repo, 2, { now: () => NOW, maxItems: 100, predicate: (it) => matchesFeedFilters(it, { band: 'pick' }) })
  assert.ok(snap.items.find((i) => i.event_id === 'EVT-rescued'), 'readFeed pre-filter also sees the body verdict')
})

console.log(`\nbody-floor-bandfilter.test.ts: ${passed} passed`)
