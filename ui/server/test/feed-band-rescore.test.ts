// Band filter vs active-weight re-score ordering — the reported bug. The live wire displays each item's
// band under the CURRENTLY-active scoring weights (readFeed re-scores on read). A band filter routes to
// searchFeed. searchFeed must therefore evaluate the band predicate against the SAME current-weight band
// the wire shows — NOT the stale ingest-time band persisted on the firehose line. Before the fix,
// searchFeed re-scored only the returned page AFTER the predicate ran, so a Scoring-panel weight change
// that moved an item from watch→pick left it invisible to a band=pick filter even though the wire showed
// it as a pick (and, symmetrically, a stale pick would leak into a band=pick filter after it dropped to
// watch). The fix re-scores each scanned item under the active weights BEFORE the predicate.
//
// Pinned to: ui/server/src/news/feed.ts withActiveWeights (readFeed applies current weights on display),
// scoreToBand thresholds (pick ≥ 70, watch ≥ 40 — config.ts), and rank.ts reRankFromFactors.
// Run: npx tsx test/feed-band-rescore.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { searchFeed } from '../src/news/feed'
import { matchesFeedFilters } from '../src/news/feed-filter'
import { saveRankWeights, resetRankWeights, DEFAULT_RANK_WEIGHTS } from '../src/news/rank-weights'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-06-28T12:00:00Z')
const now = () => NOW
const dayAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10)
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bandrescore-'))

function writeDay(repo: string, date: string, items: FeedItem[]) {
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), items.map((it) => JSON.stringify(it)).join('\n') + '\n')
}

// An item persisted at ingest as a WATCH (score 69, below the pick threshold of 70) with a full rank_factors
// breakdown, so it is re-scorable. Default weights: 60 + (source_tier[news]=0 + scope[single_name]=6 +
// event[product]=3 + size[unknown]=0 + recency=0) * boost 1 = 69 → watch.
let seq = 0
function watchItem(p: Partial<FeedItem> & { ts: string }): FeedItem {
  seq++
  return {
    kind: 'item', event_id: `EVT-${String(seq).padStart(6, '0')}`, headline: 'Firm launches a new product line',
    url: `https://ex.com/${seq}`, domain: 'ex.com', source_name: 'Example Wire', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 69, band: 'watch', triage_reason: '', relevance: 'material',
    event_types: ['product'], issuer_linkage: 'primary', companies: [{ name: 'Example Co', ticker: 'EXCO' }],
    size_bucket: 'unknown', dedup_status: 'new', inboxed: true,
    rank_factors: { materiality: 60, source_tier: 0, scope: 6, event: 3, size: 0, recency: 0, boost_weight: 1, scope_id: 'single_name', source_tier_id: 'news' },
    ...p,
  } as FeedItem
}

// Sanity: at default weights the persisted watch item is genuinely a watch, and a band=pick filter must NOT
// return it (it is not a pick under any reading). Guards against a test that would pass trivially.
check('band=pick does NOT return a genuine watch item at default weights', () => {
  resetRankWeights()
  saveRankWeights(DEFAULT_RANK_WEIGHTS)
  const repo = tmp()
  writeDay(repo, dayAgo(1), [watchItem({ ts: `${dayAgo(1)}T10:00:00Z` })])
  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { band: 'pick' }), limit: 60 })
  assert.equal(snap.items.length, 0, 'a watch item must not match band=pick under default weights')
  resetRankWeights()
})

// THE BUG: raise the 'product' event weight so the SAME item re-scores to 60 + (0+6+20+0+0) = 86 → pick.
// The wire (readFeed) now shows it as a pick. A band=pick filter MUST find it. Before the fix it did not:
// the predicate saw the persisted watch band because the page was re-scored only afterward.
check('band=pick RETURNS an item that a Scoring-panel weight change moved watch→pick (the reported bug)', () => {
  resetRankWeights()
  saveRankWeights({ ...DEFAULT_RANK_WEIGHTS, event: { ...DEFAULT_RANK_WEIGHTS.event, product: 20 } })
  const repo = tmp()
  const target = watchItem({ ts: `${dayAgo(1)}T10:00:00Z` })
  writeDay(repo, dayAgo(1), [target])
  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { band: 'pick' }), limit: 60 })
  assert.equal(snap.items.length, 1, 'the current-weight pick must be found by a band=pick filter')
  assert.equal(snap.items[0].event_id, target.event_id)
  assert.equal(snap.items[0].band, 'pick', 'and it is returned with its current-weight band')
  resetRankWeights()
})

// SYMMETRIC LEAK: the persisted band was watch; a band=watch filter must NOT return it once it is a
// current-weight pick — otherwise the stale ingest band leaks a row into the wrong band bucket.
check('band=watch does NOT return an item that is now a current-weight pick (no stale-band leak)', () => {
  resetRankWeights()
  saveRankWeights({ ...DEFAULT_RANK_WEIGHTS, event: { ...DEFAULT_RANK_WEIGHTS.event, product: 20 } })
  const repo = tmp()
  writeDay(repo, dayAgo(1), [watchItem({ ts: `${dayAgo(1)}T10:00:00Z` })])
  const snap = searchFeed(repo, { now, predicate: (it) => matchesFeedFilters(it, { band: 'watch' }), limit: 60 })
  assert.equal(snap.items.length, 0, 'the item is a current-weight pick, so band=watch must exclude it')
  resetRankWeights()
})

console.log(`\nfeed-band-rescore.test.ts: ${passed} passed`)
