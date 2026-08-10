import assert from 'node:assert/strict'
import { commodityDecisionProjection } from './commodityDecision'

const evidence = [{ conclusion: 'Real yields dominate.', cluster_ids: ['macro.real-yields'], source_vintage_ids: [`sha256:${'a'.repeat(64)}`] }]
const source = {
  swarm: 'commodity', action: 'Hold', target_exposure_risk_units: 0.5, forecast_confidence: 61,
  current_price: { value: 100, as_of: '2026-08-10' },
  required_series_coverage: { complete: true, generated_at: '2026-08-10T20:00:00Z' },
  expected_return_pct: 99,
  forecast_horizons: {
    tactical: { horizon: 'tactical', status: 'assessable', classification: 'positive', horizon_days: 60, target_date: '2026-10-09', confidence: 64, expected_return_components_pct: { implementable_return_pct: 8 }, loss_probability_pct: 30, downside_pct: -7, risk_reward: 1.14, cash_hurdle: { return_pct: 1 }, evidence_links: evidence },
    strategic: { horizon: 'strategic', status: 'assessable', classification: 'mixed', horizon_days: 365, target_date: '2027-08-10', confidence: 61, expected_return_components_pct: { implementable_return_pct: 5 }, loss_probability_pct: 45, downside_pct: -12, risk_reward: 0.42, cash_hurdle: { return_pct: 4 }, evidence_links: evidence },
  },
}

const result = commodityDecisionProjection(source)
assert.ok(result)
assert.equal(result.action, 'Hold')
assert.equal(result.conflict, true)
assert.equal(result.horizons[0].implementableReturnPct, 8)
assert.equal(result.horizons[1].implementableReturnPct, 5)
assert.equal('expectedReturnPct' in result, false, 'the UI projection must never expose a blended return')
assert.equal(JSON.stringify(result).includes('99'), false, 'legacy top-level expected return must not leak into commodity UI')
assert.deepEqual(result.horizons[0].evidenceLinks[0].clusterIds, ['macro.real-yields'])
assert.equal(commodityDecisionProjection({ swarm: 'commodity', action: 'Hold' }), null)

const capped = commodityDecisionProjection({
  ...source, post_mortem_action: 'Trim', post_mortem_target_exposure_risk_units: 0.25,
  post_review_confidence_score: 44,
})
assert.equal(capped?.action, 'Trim')
assert.equal(capped?.targetExposureRiskUnits, 0.25)
assert.equal(capped?.confidence, 44)

const synthesisCapped = commodityDecisionProjection({ ...source, confidence: 53 })
assert.equal(synthesisCapped?.confidence, 53, 'final synthesis confidence must beat the raw lower-horizon ceiling')

const malformedCap = commodityDecisionProjection({ ...source, post_mortem_action: 'Avoid' })
assert.equal(malformedCap?.targetExposureRiskUnits, 0, 'a missing post-mortem exposure must never pair Avoid with the original full unit')

const upgradingCap = commodityDecisionProjection({ ...source, post_mortem_action: 'Buy' })
assert.equal(upgradingCap?.action, 'Hold', 'a malformed post-mortem cannot upgrade the original action')
assert.equal(upgradingCap?.targetExposureRiskUnits, 0.5)

const inflatedConfidence = commodityDecisionProjection({ ...source, confidence: 35, post_review_confidence_score: 90 })
assert.equal(inflatedConfidence?.confidence, 35, 'post-review confidence can only lower the displayed cap')

assert.equal(commodityDecisionProjection({ ...source, post_mortem_action: 'AVOID' }), null,
  'a present invalid post-mortem action must invalidate the fresh projection')
assert.equal(commodityDecisionProjection({ ...source, post_review_confidence_score: -1 }), null,
  'a present out-of-range post-review confidence must invalidate the fresh projection')

assert.equal(commodityDecisionProjection({
  ...source,
  forecast_horizons: {
    tactical: { horizon: 'tactical', status: 'assessable', classification: 'garbage', horizon_days: 60, target_date: '2026-10-09', confidence: 60 },
    strategic: { horizon: 'strategic', status: 'assessable', classification: 'garbage', horizon_days: 365, target_date: '2027-08-10', confidence: 60 },
  },
}), null, 'present but structurally invalid horizons must fail closed')

assert.equal(commodityDecisionProjection({ ...source, action: 'Avoid' }), null,
  'the stored action must match the mechanical horizon matrix')

console.log('commodityDecision.test.ts: action-first dual-horizon projection passed')
