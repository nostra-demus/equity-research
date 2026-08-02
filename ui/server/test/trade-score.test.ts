process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { scoreTradeCluster, type TradeEvidence } from '../src/news/trade-score'

const now = Date.parse('2026-08-02T12:00:00Z')
function evidence(id: string, source: string, tier: TradeEvidence['source_tier'] = 'news'): TradeEvidence {
  return {
    event_id: id, ts: '2026-08-02T10:00:00Z', source_name: source, source_tier: tier,
    triage_score: 94, companies: [], scheduled_events: [], event_direction: 'positive',
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
assert.ok(weak.score <= 62, 'one non-primary source cannot pass the confirmation cap')
assert.ok(weak.missingChecks.includes('independent confirmation'))

const strong = scoreTradeCluster([
  { ...evidence('E3', 'SEC', 'primary_filing'), companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }], scheduled_events: ['earnings'] },
  { ...evidence('E4', 'Reuters'), companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }], scheduled_events: ['earnings'] },
], { nowMs: now, ticker: 'AMZN', exchange: 'NASDAQ', pricedIn: 'room', whyNow: 'Earnings on 2026-08-06', learningAdjustment: 99 })
assert.ok(strong.score > weak.score)
assert.equal(strong.breakdown.learning_adjustment, 8, 'learning can never move a score by more than eight points')
assert.ok(strong.missingChecks.includes('live price, liquidity, and consensus'), 'news alone never claims a finished trade')

console.log('\n1 trade-score test file passed')
