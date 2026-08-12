process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { directionMatchesEvidence, scoreTradeCluster, TRADE_SCORE_POLICY_VERSION, type TradeEvidence } from '../src/news/trade-score'

const now = Date.parse('2026-08-02T12:00:00Z')
function evidence(id: string, source: string, tier: TradeEvidence['source_tier'] = 'news'): TradeEvidence {
  return {
    event_id: id, ts: '2026-08-02T10:00:00Z', source_name: source, source_tier: tier,
    triage_score: 94, materiality_pre_score: 72, companies: [], scheduled_events: [], event_direction: 'positive',
  }
}

const broad = scoreTradeCluster([evidence('E1', 'Reuters')], { nowMs: now })
assert.ok(broad.score <= 45, 'no verified ticker is hard-capped')
assert.equal(broad.readiness, 'watch_only')
assert.ok(broad.missingChecks.includes('verified listed ticker'))
assert.ok(broad.missingChecks.includes('price and market expectations'))

const weak = scoreTradeCluster([
  { ...evidence('E2', 'Blog'), companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] },
], { nowMs: now, ticker: 'AMZN', exchange: 'NASDAQ', pricedIn: 'unknown' })
assert.ok(weak.score <= 45, 'a guessed ticker and exchange cannot clear verification caps')
assert.equal(weak.readiness, 'watch_only')
assert.ok(weak.missingChecks.includes('independent confirmation'))

const strong = scoreTradeCluster([
  { ...evidence('E3', 'SEC', 'primary_filing'), dedup_group: 'STORY-1', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }], scheduled_events: ['earnings'] },
  { ...evidence('E4', 'Reuters'), dedup_group: 'STORY-2', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }], scheduled_events: ['earnings'] },
], { nowMs: now, ticker: 'AMZN', exchange: 'NASDAQ', tickerVerified: true, listingLiquidityVerified: true, pricedIn: 'room', whyNow: 'Earnings on 2026-08-06', learningAdjustment: 99 })
assert.ok(strong.score > weak.score)
assert.equal(strong.breakdown.learning_adjustment, 8, 'learning can never move a score by more than eight points')
assert.ok(strong.missingChecks.includes('live price, liquidity, and consensus'), 'news alone never claims a finished trade')
assert.equal(strong.cap, 62, 'a model-authored room guess cannot clear the news-only market-data cap')
assert.equal(strong.readiness, 'needs_data', 'news-only scoring never returns a trade-ready verdict')

const highEvidence = [
  { ...evidence('E8', 'SEC', 'primary_filing'), dedup_group: 'STORY-8', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }], scheduled_events: ['earnings on 2026-08-06'] },
  { ...evidence('E9', 'Reuters'), dedup_group: 'STORY-9', companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }], scheduled_events: ['earnings on 2026-08-06'] },
]
const marketOpts = { nowMs: now, ticker: 'AMZN', exchange: 'NASDAQ', tickerVerified: true, listingLiquidityVerified: true } as const
const priced = scoreTradeCluster(highEvidence, { ...marketOpts, pricedIn: 'priced' })
const unknown = scoreTradeCluster(highEvidence, { ...marketOpts, pricedIn: 'unknown' })
const room = scoreTradeCluster(highEvidence, { ...marketOpts, pricedIn: 'room' })
assert.deepEqual([priced.score, unknown.score, room.score], [55, 60, 62], 'priced-in is only a capped research-priority ordering')
assert.equal(TRADE_SCORE_POLICY_VERSION, 'evidence_gate_v2')
const malformedPricedIn = scoreTradeCluster(highEvidence, { ...marketOpts, pricedIn: 'optimistic' as any })
assert.equal(malformedPricedIn.cap, 60, 'an invalid runtime priced-in value fails closed to unknown, never room')
assert.ok(priced.missingChecks.includes('priced-in risk'))
assert.ok(unknown.missingChecks.includes('price and market expectations'))
for (const read of [priced, unknown, room]) {
  assert.ok(read.missingChecks.includes('live price, liquidity, and consensus'))
  assert.notEqual(read.readiness, 'check_now')
}
assert.ok(room.reasons.some((reason) => reason.includes('unverified research-priority hint only')))

const syndicated = scoreTradeCluster([
  { ...evidence('E5', 'Reuters'), dedup_group: 'ONE-STORY' },
  { ...evidence('E6', 'Yahoo'), dedup_group: 'ONE-STORY' },
], { nowMs: now })
assert.equal(syndicated.breakdown.corroboration, 0, 'publisher copies in one story cluster are not independent confirmation')

const sourceAliases = scoreTradeCluster([
  { ...evidence('E5a', 'Reuters'), dedup_group: 'STORY-A' },
  { ...evidence('E5b', '  REUTERS  '), dedup_group: 'STORY-B' },
], { nowMs: now })
assert.equal(sourceAliases.breakdown.corroboration, 0, 'casing and whitespace cannot turn one outlet into independent corroboration')
assert.ok(sourceAliases.missingChecks.includes('independent confirmation'))

const expectedEvidenceByTier: Array<[TradeEvidence['source_tier'], number]> = [
  ['primary_filing', 25], ['official_data', 23], ['company', 18],
  ['news', 14], ['unconfirmed', 7], ['social', 3],
]
for (const [tier, expected] of expectedEvidenceByTier) {
  const scored = scoreTradeCluster([{ ...evidence(`tier-${tier}`, 'Source', tier) }], { nowMs: now })
  assert.equal(scored.breakdown.evidence, expected, `${tier} receives its explicit source-hierarchy weight`)
}
const malformedTier = scoreTradeCluster([{ ...evidence('tier-bad', 'Source'), source_tier: 'garbage' as any }], { nowMs: now })
assert.equal(malformedTier.breakdown.evidence, 0, 'unknown runtime source tiers fail closed to the evidence floor')

const categoryOnly = scoreTradeCluster([
  { ...evidence('E7', 'SEC', 'primary_filing'), scheduled_events: ['earnings'], companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] },
], { nowMs: now, ticker: 'AMZN', exchange: 'NASDAQ', tickerVerified: true, listingLiquidityVerified: true, pricedIn: 'room' })
assert.ok(categoryOnly.missingChecks.includes('dated catalyst'), 'a scheduled-event category without a future date is not a dated catalyst')

for (const impossibleDate of ['earnings 99/99/2026', 'earnings 2026-02-30']) {
  const malformedDate = scoreTradeCluster([
    { ...evidence('E-bad-date', 'SEC', 'primary_filing'), scheduled_events: [impossibleDate] },
  ], { ...marketOpts, pricedIn: 'room' })
  assert.ok(malformedDate.missingChecks.includes('dated catalyst'), `${impossibleDate} cannot manufacture a future trigger`)
  assert.ok(malformedDate.reasons.includes('timing not proven'))
}

for (const absentWindow of ['earnings in 0 days', 'no earnings within 30 days']) {
  const noCatalyst = scoreTradeCluster([
    { ...evidence('E-no-window', 'SEC', 'primary_filing'), scheduled_events: [absentWindow] },
  ], { ...marketOpts, pricedIn: 'room' })
  assert.ok(noCatalyst.missingChecks.includes('dated catalyst'), `${absentWindow} states no future trigger`)
  assert.ok(noCatalyst.reasons.includes('timing not proven'))
}

const inventedWhyNowDate = scoreTradeCluster([
  { ...evidence('E10', 'SEC', 'primary_filing'), scheduled_events: ['earnings'], companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] },
], {
  nowMs: now, ticker: 'AMZN', exchange: 'NASDAQ', tickerVerified: true,
  listingLiquidityVerified: true, pricedIn: 'room', whyNow: 'The model says earnings are on 2026-08-06',
})
assert.ok(inventedWhyNowDate.missingChecks.includes('dated catalyst'), 'model-authored why-now copy cannot prove a source-bound date')

assert.equal(directionMatchesEvidence('long', 'long'), true)
assert.equal(directionMatchesEvidence('short', 'short'), true)
assert.equal(directionMatchesEvidence('long', 'short'), false, 'provider output cannot reverse negative source evidence into a long')
assert.equal(directionMatchesEvidence('short', 'long'), false, 'provider output cannot reverse positive source evidence into a short')
assert.equal(directionMatchesEvidence('long', 'mixed'), false, 'mixed evidence cannot authorize a naked directional trade')
assert.equal(directionMatchesEvidence('pair', 'mixed'), true)
assert.equal(directionMatchesEvidence('long', 'unknown'), true, 'unknown evidence remains a needs-data lead rather than being guessed')

console.log('\n1 trade-score test file passed')
