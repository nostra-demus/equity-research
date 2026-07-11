// readFeed's post-hydrate predicate (feed.ts) — the wire's sparse-filter read. The early-stop must
// count MATCHES, not raw lines: a filter that keeps 1-in-11 items still fills its window by walking
// OLDER days instead of stopping at maxItems raw lines and returning a starved page. And with NO
// predicate the read behaves exactly as before (same count, same order, same early-stop on raw
// volume). Isolated tmp repos, no network. Run: npx tsx test/feed-predicate.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readFeed } from '../src/news/feed'
import { matchesFeedFilters } from '../src/news/feed-filter'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-06-28T12:00:00Z')
const now = () => NOW
const dayAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString().slice(0, 10)
const tmpdirs: string[] = []
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'feedpred-')); tmpdirs.push(d); return d }

let seq = 0
function item(p: Partial<FeedItem> & { ts: string }): FeedItem {
  seq++
  return {
    kind: 'item', event_id: `EVT-${String(seq).padStart(6, '0')}`, headline: 'Retailer posts quarterly sales',
    url: `https://ex.com/${seq}`, domain: 'ex.com', source_name: 'Example Wire', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 50, band: 'watch', triage_reason: '', relevance: 'material',
    event_types: ['macro_sector'], issuer_linkage: 'macro', companies: [], size_bucket: 'unknown',
    dedup_status: 'new', inboxed: true, ...p,
  }
}
function writeLines(repo: string, date: string, lines: object[]) {
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), lines.map((o) => JSON.stringify(o)).join('\n') + '\n')
}

// ---- fixture: 3 days, matches SPARSE — 5 GOLD items among 50 fillers per day (55 lines/day) ----
// The GOLD items are the newest of each day (11:0X vs the fillers' 10:XX) so the expected page is exact.
const repo = tmp()
const goldByDay: FeedItem[][] = []
for (let d = 0; d <= 2; d++) {
  const date = dayAgo(d)
  const gold = Array.from({ length: 5 }, (_, i) => item({ ts: `${date}T11:0${4 - i}:00Z`, headline: 'Gold climbs to a record high' }))
  const filler = Array.from({ length: 50 }, (_, i) => item({ ts: `${date}T10:${String(49 - i).padStart(2, '0')}:00Z` }))
  goldByDay.push(gold)
  const lines: object[] = [...gold, ...filler]
  // a cycle summary line rides along on the newest day — the predicate must never filter cycles
  if (d === 0) lines.push({ kind: 'cycle_summary', ts: `${date}T11:30:00Z`, ok: true, fetched: 55, candidates: 5, picked: 0, watched: 5, dropped: 0, inboxed: 5, groq_requests: 1, groq_tokens: 100 })
  writeLines(repo, date, lines)
}
const goldPred = (it: FeedItem) => matchesFeedFilters(it, { commodities: ['GOLD'] })

// ---- 1. the early-stop counts MATCHES: a sparse predicate fills its window across days ----
check('readFeed(days 3, maxItems 12, GOLD predicate) returns 12 GOLD matches spanning all 3 days', () => {
  const snap = readFeed(repo, 3, { now, maxItems: 12, predicate: goldPred })
  assert.equal(snap.items.length, 12, 'the window FILLS — early-stop counted matches, not the 55 raw lines of day 0')
  for (const it of snap.items) assert.ok((it.commodities || []).includes('GOLD'), `non-matching item leaked: ${it.headline}`)
  const days = new Set(snap.items.map((it) => it.ts.slice(0, 10)))
  assert.deepEqual([...days].sort().reverse(), [dayAgo(0), dayAgo(1), dayAgo(2)], 'matches span multiple days (5 + 5 + 2)')
  // newest-first, and exactly the expected page: day0's 5, day1's 5, day2's 2 newest
  const expected = [...goldByDay[0], ...goldByDay[1], ...goldByDay[2].slice(0, 2)].map((it) => it.event_id)
  assert.deepEqual(snap.items.map((it) => it.event_id), expected, 'newest-first order, capped at the 12 newest matches')
})

// ---- 2. no predicate → the pre-predicate behavior is unchanged (same count, order, early-stop) ----
check('readFeed with NO predicate keeps the plain-read contract: newest 12 raw items, day 0 only', () => {
  const snap = readFeed(repo, 3, { now, maxItems: 12 })
  assert.equal(snap.items.length, 12)
  assert.ok(snap.items.every((it) => it.ts.startsWith(dayAgo(0))), 'day 0 alone has 55 ≥ 12 items → older days are never opened (the raw early-stop)')
  // exact page: day0's 5 GOLD (11:0X) then the 7 newest fillers (10:49 … 10:43)
  const sorted = [...snap.items].sort((a, b) => (b.ts || '').localeCompare(a.ts || ''))
  assert.deepEqual(snap.items.map((it) => it.event_id), sorted.map((it) => it.event_id), 'newest-first order')
  assert.deepEqual(snap.items.slice(0, 5).map((it) => it.event_id), goldByDay[0].map((it) => it.event_id))
  // determinism: a second identical read returns the identical page (count + order)
  const again = readFeed(repo, 3, { now, maxItems: 12 })
  assert.deepEqual(again.items.map((it) => it.event_id), snap.items.map((it) => it.event_id))
})

// ---- 3. cycles ride through the predicate untouched ----
check('a predicate filters items only — cycle_summary lines still come back', () => {
  const snap = readFeed(repo, 3, { now, maxItems: 12, predicate: goldPred })
  assert.equal(snap.cycles.length, 1, 'the cycle summary is not subject to the item predicate')
  assert.equal(snap.cycles[0].fetched, 55)
})

// ---- 4. predicate + applyActiveWeights (the default): no throw, same matches at default weights ----
check('predicate with applyActiveWeights default does not throw and filters identically', () => {
  let snap: ReturnType<typeof readFeed> | undefined
  assert.doesNotThrow(() => { snap = readFeed(repo, 3, { now, maxItems: 12, predicate: goldPred }) })
  assert.equal(snap!.items.length, 12)
  // at default weights the re-score is a no-op, so opting OUT yields the same page
  const raw = readFeed(repo, 3, { now, maxItems: 12, predicate: goldPred, applyActiveWeights: false })
  assert.deepEqual(raw.items.map((it) => it.event_id), snap!.items.map((it) => it.event_id))
})

// ---- 5. a predicate matching nothing returns an empty page, never throws or hangs ----
check('a predicate with zero matches walks every day and returns [] honestly', () => {
  const snap = readFeed(repo, 3, { now, maxItems: 12, predicate: (it) => matchesFeedFilters(it, { commodities: ['COCOA'] }) })
  assert.deepEqual(snap.items, [])
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\nfeed-predicate.test.ts: ${passed} passed`)
