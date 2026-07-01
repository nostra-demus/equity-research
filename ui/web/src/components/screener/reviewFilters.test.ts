// The batch-review filter predicate: each dimension in isolation, combined (AND semantics, matching
// FeedFilters.tsx's matchesFilters), and the no-false-positive guard for portfolioCompanies.
// Run: npx tsx src/components/screener/reviewFilters.test.ts
import assert from 'node:assert/strict'
import type { FeedItem } from '../../lib/types'
import { buildSourceTierOptions, emptyReviewFilters, matchesReviewFilters, type ReviewFilterState } from './ReviewFilters'
import { SOURCE_TIERS } from '../../lib/scope'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

function mkItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    kind: 'item',
    ts: '2026-07-01T00:00:00Z',
    event_id: 'EVT-000000000000',
    headline: 'A headline',
    url: 'https://example.com/a',
    domain: 'example.com',
    source_name: 'Reuters',
    via: 'rss',
    region: 'US',
    input_nature: 'news_headline',
    triage_score: 50,
    band: 'watch',
    triage_reason: '',
    relevance: 'material',
    event_types: [],
    issuer_linkage: '',
    companies: [],
    size_bucket: 'unknown',
    dedup_status: 'new',
    inboxed: false,
    ...overrides,
  }
}

const empty = () => emptyReviewFilters()
const on = (patch: Partial<ReviewFilterState>): ReviewFilterState => ({ ...empty(), ...patch })

check('no filters set -> everything matches', () => {
  assert.equal(matchesReviewFilters(mkItem(), empty(), new Set()), true)
})

check('highScore: triage_score >= 70 passes, below fails', () => {
  const f = on({ highScore: true })
  assert.equal(matchesReviewFilters(mkItem({ triage_score: 85 }), f, new Set()), true)
  assert.equal(matchesReviewFilters(mkItem({ triage_score: 40 }), f, new Set()), false)
  assert.equal(matchesReviewFilters(mkItem({ triage_score: 70 }), f, new Set()), true) // boundary is inclusive
})

check('lowConfidence: band === drop passes, others fail', () => {
  const f = on({ lowConfidence: true })
  assert.equal(matchesReviewFilters(mkItem({ band: 'drop' }), f, new Set()), true)
  assert.equal(matchesReviewFilters(mkItem({ band: 'watch' }), f, new Set()), false)
  assert.equal(matchesReviewFilters(mkItem({ band: 'pick' }), f, new Set()), false)
})

check('routineFilings: relevance === relevant_non_material passes, material/irrelevant fail', () => {
  const f = on({ routineFilings: true })
  assert.equal(matchesReviewFilters(mkItem({ relevance: 'relevant_non_material' }), f, new Set()), true)
  assert.equal(matchesReviewFilters(mkItem({ relevance: 'material' }), f, new Set()), false)
  assert.equal(matchesReviewFilters(mkItem({ relevance: 'irrelevant' }), f, new Set()), false)
})

// The wire stamps the SourceTierId (deriveSourceTier: 'news'/'unconfirmed'/'primary_filing'/…), NOT the
// display label ('News'/'Filing'). The filters MUST compare against those IDs — a label would match nothing
// on real data. (Regression guard for the label-vs-id bug: these assertions FAIL against the old
// label-based filter and PASS against the id-based one.)
check('genericMedia: news/unconfirmed source_tier IDs pass, filing/company/official_data fail', () => {
  const f = on({ genericMedia: true })
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'news' }), f, new Set()), true)
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'unconfirmed' }), f, new Set()), true)
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'primary_filing' }), f, new Set()), false)
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'company' }), f, new Set()), false)
  // the display LABEL must NOT match — it never appears on the wire
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'News' }), f, new Set()), false)
})

check('sourceTiers: direct multi-select match on the SourceTierId', () => {
  const f = on({ sourceTiers: new Set(['primary_filing', 'official_data']) })
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'primary_filing' }), f, new Set()), true)
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'news' }), f, new Set()), false)
  // the display LABEL 'Filing' is not the stamped value and must not match
  assert.equal(matchesReviewFilters(mkItem({ source_tier: 'Filing' }), f, new Set()), false)
})

check('portfolioCompanies: matches when a company ticker is in the covered set', () => {
  const f = on({ portfolioCompanies: true })
  const covered = new Set(['AAPL'])
  assert.equal(matchesReviewFilters(mkItem({ companies: [{ name: 'Apple', ticker: 'aapl', listing_country: 'US' }] }), f, covered), true)
  assert.equal(matchesReviewFilters(mkItem({ companies: [{ name: 'Other Co', ticker: 'ZZZZ', listing_country: 'US' }] }), f, covered), false)
})

check('portfolioCompanies: an item with no companies never false-positives', () => {
  const f = on({ portfolioCompanies: true })
  assert.equal(matchesReviewFilters(mkItem({ companies: [] }), f, new Set(['AAPL'])), false)
})

check('combined filters require ALL to pass (AND semantics)', () => {
  const f = on({ highScore: true, lowConfidence: true })
  // high score but NOT band=drop -> fails the combined check even though highScore alone would pass
  assert.equal(matchesReviewFilters(mkItem({ triage_score: 90, band: 'pick' }), f, new Set()), false)
  // band=drop but score below threshold -> fails even though lowConfidence alone would pass
  assert.equal(matchesReviewFilters(mkItem({ triage_score: 20, band: 'drop' }), f, new Set()), false)
  // both conditions hold at once -> the AND passes
  assert.equal(matchesReviewFilters(mkItem({ triage_score: 90, band: 'drop' }), f, new Set()), true)
})

// The chip options MUST cover every stamped source tier — including the lowest-trust 'social' (Reddit/forum)
// so reviewers can isolate the least-trustworthy cards. Deriving from SOURCE_TIERS guarantees no tier is
// silently dropped. (Regression guard: the old hand-listed options omitted 'social', so this FAILS against
// it and PASSES against the derived options.)
check('buildSourceTierOptions: includes every SOURCE_TIERS id, including social', () => {
  const opts = buildSourceTierOptions()
  const optIds = new Set(opts.map((o) => o.id))
  for (const id of Object.keys(SOURCE_TIERS)) assert.ok(optIds.has(id), `missing chip for tier '${id}'`)
  assert.ok(optIds.has('social'), 'the lowest-trust social tier must have a chip')
  assert.equal(opts.length, Object.keys(SOURCE_TIERS).length)
})

check('buildSourceTierOptions: ordered highest-trust -> lowest (social last), labels match SOURCE_TIERS', () => {
  const opts = buildSourceTierOptions()
  const ranks = opts.map((o) => SOURCE_TIERS[o.id as keyof typeof SOURCE_TIERS].rank)
  for (let i = 1; i < ranks.length; i++) assert.ok(ranks[i - 1] >= ranks[i], 'ranks must be non-increasing')
  assert.equal(opts[opts.length - 1].id, 'social') // rank 0 sits last
  for (const o of opts) assert.equal(o.label, SOURCE_TIERS[o.id as keyof typeof SOURCE_TIERS].label)
})

console.log(`\n${passed} checks passed`)
