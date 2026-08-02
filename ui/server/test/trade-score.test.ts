process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { scoreTradeCluster, type TradeEvidence } from '../src/news/trade-score'

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

const syndicated = scoreTradeCluster([
  { ...evidence('E5', 'Reuters'), dedup_group: 'ONE-STORY' },
  { ...evidence('E6', 'Yahoo'), dedup_group: 'ONE-STORY' },
], { nowMs: now })
assert.equal(syndicated.breakdown.corroboration, 0, 'publisher copies in one story cluster are not independent confirmation')

const categoryOnly = scoreTradeCluster([
  { ...evidence('E7', 'SEC', 'primary_filing'), scheduled_events: ['earnings'], companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] },
], { nowMs: now, ticker: 'AMZN', exchange: 'NASDAQ', tickerVerified: true, listingLiquidityVerified: true, pricedIn: 'room' })
assert.ok(categoryOnly.missingChecks.includes('dated catalyst'), 'a scheduled-event category without a future date is not a dated catalyst')

console.log('\n1 trade-score test file passed')
