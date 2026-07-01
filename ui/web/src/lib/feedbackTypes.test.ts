// The client's FEEDBACK_TYPES/feedbackLabel must never drift from the server's
// ui/server/src/screener-feedback.ts FEEDBACK_TYPES (the two can't share an import — client can't pull
// in server code). This locks the exact 8 values + labels so a future edit to one side gets caught here.
// Run: npx tsx src/lib/feedbackTypes.test.ts
import assert from 'node:assert/strict'
import { FEEDBACK_TYPES, feedbackInputFromItem, feedbackLabel } from './feedbackTypes'
import type { FeedItem } from './types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const EXPECTED = ['irrelevant', 'score_too_high', 'score_too_low', 'wrong_company', 'wrong_sector', 'duplicate_stale', 'should_be_higher', 'other']

check('exactly the 8 feedback types, matching the server enum in order', () => {
  assert.deepEqual(FEEDBACK_TYPES, EXPECTED)
})

check('every type has a non-empty, distinct label', () => {
  const labels = FEEDBACK_TYPES.map(feedbackLabel)
  for (const l of labels) assert.ok(l && l.trim().length > 0)
  assert.equal(new Set(labels).size, labels.length)
})

// feedbackInputFromItem must snapshot the SAME company the rail/ReviewPanel display — the first entry
// passing isCompanyNameClient — NOT the raw companies[0]. When companies[0] is a country/regulator/index,
// the old companies[0] version recorded the wrong company_name/ticker. (Regression guard: these FAIL against
// the old companies[0] builder and PASS against the isCompanyNameClient-based one.)
function mkFeedItem(companies: FeedItem['companies']): FeedItem {
  return {
    kind: 'item', ts: '2026-07-01T00:00:00Z', event_id: 'EVT-000000000001', headline: 'H', url: 'https://x/y',
    domain: 'x', source_name: 'Reuters', via: 'rss', region: 'US', input_nature: 'news_headline',
    triage_score: 50, band: 'watch', triage_reason: '', relevance: 'material', event_types: [],
    issuer_linkage: '', companies, size_bucket: 'unknown', dedup_status: 'new', inboxed: false,
  }
}

check('feedbackInputFromItem: skips a leading country/regulator and records the first real company', () => {
  const it = mkFeedItem([
    { name: 'India', ticker: null, listing_country: 'IN' },
    { name: 'Tata Motors', ticker: 'TATAMOTORS', listing_country: 'IN' },
  ])
  const rec = feedbackInputFromItem(it, 'irrelevant', '')
  assert.equal(rec.company_name, 'Tata Motors')
  assert.equal(rec.company_ticker, 'TATAMOTORS')
})

check('feedbackInputFromItem: still records companies[0] when it is a real company', () => {
  const it = mkFeedItem([{ name: 'Apple', ticker: 'AAPL', listing_country: 'US' }])
  const rec = feedbackInputFromItem(it, 'irrelevant', '')
  assert.equal(rec.company_name, 'Apple')
  assert.equal(rec.company_ticker, 'AAPL')
})

check('feedbackInputFromItem: records no company when none pass the predicate (matches UI showing none)', () => {
  const it = mkFeedItem([{ name: 'European Commission', ticker: null, listing_country: null }])
  const rec = feedbackInputFromItem(it, 'irrelevant', '')
  assert.equal(rec.company_name, undefined)
  assert.equal(rec.company_ticker, undefined)
})

console.log(`\n${passed} checks passed`)
