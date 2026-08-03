process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  evaluateQualifiedIdea,
  expectedShortfallLoss,
  rankQualifiedIdeas,
  type QualifiedIdeaCandidate,
} from '../src/qualified-ideas'

const NOW = Date.parse('2026-08-03T12:00:00Z')

function candidate(id = 'QIDEA-valid'): QualifiedIdeaCandidate {
  return {
    schema_version: 'qualified-idea/v1',
    policy_version: 'ideas-policy/precal-v1',
    idea_id: id,
    market_evidence_sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    projection_manifest_sha256: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    run_root: 'analyses/TEST_2026-08-03',
    decision_date: '2026-08-03',
    created_at: '2026-08-03T10:00:00Z',
    instrument: { ticker: 'TEST', company: 'Test Holdings', exchange: 'NYSE', currency: 'USD', direction: 'long', asset_type: 'equity' },
    horizon: { start: '2026-08-03T10:00:00Z', end: '2027-01-30T10:00:00Z' },
    quote: { price: 100, as_of: '2026-08-03T10:00:00Z', source: 'exchange close', identity_verified: true, stale: false },
    liquidity: { verified: true, as_of: '2026-08-03T10:00:00Z', source: 'exchange OHLCV', lookback_days: 60, observed_sessions: 60, coverage_pct: 100, window_start: '2026-05-11T10:00:00Z', window_end: '2026-08-03T10:00:00Z', median_daily_value_usd: 50_000_000, currency_conversion: { pair: 'USD/USD', rate_usd_per_currency: 1, as_of: '2026-08-03T10:00:00Z', source: 'USD listing currency' } },
    market_risk: { as_of: '2026-08-03T10:00:00Z', source: 'adjusted exchange closes', lookback_days: 60, ordinary_move_pct: 8 },
    research: {
      decision: 'Buy', integrity_status: 'verified', data_sufficiency_score: 82, edge_score: 66,
      edge_proof: 'FY27 filed unit economics exceed the frozen consensus baseline by 12%.',
      hard_cap_active: false, hard_cap_reason: null, unresolved_red_flags: [], calibration_status: 'pre_data',
    },
    catalyst: {
      forecast_id: 'FC-TEST-Q3',
      name: 'Q3 results', window_start: '2026-10-20T00:00:00Z', window_end: '2026-10-25T00:00:00Z',
      source: 'company financial calendar', status_at_admission: 'scheduled_unresolved', status_as_of: '2026-08-03T10:00:00Z', causal_steps: ['Company reports the disclosed KPI.', 'Consensus revises the same KPI and valuation.'],
      bullish_trigger: 'Reported KPI is at least 112 against consensus 100.', bearish_trigger: 'Reported KPI is below consensus 100.',
    },
    falsifier: {
      condition: 'The variant is falsified if the reported KPI is below 100.', metric: 'reported KPI', threshold: '< 100',
      deadline: '2026-10-25T00:00:00Z', source: 'Q3 filing',
    },
    valuation_bridge: {
      source_horizon_days: 180, method: 'same_horizon', convergence_fraction: null,
      rationale: 'Targets are derived directly from the Q3 event payoff inside this holding window.', source: 'valuation event model',
    },
    scenarios: [
      { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 140, source_price_target: 140, return_pct: 40, conditions: ['KPI reaches at least 120'], source: 'frozen event model' },
      { scenario_id: 'base', label: 'base', probability_pct: 55, price_target: 118, source_price_target: 118, return_pct: 18, conditions: ['KPI reaches 108 to 119'], source: 'frozen event model' },
      { scenario_id: 'bear', label: 'bear', probability_pct: 20, price_target: 88, source_price_target: 88, return_pct: -12, conditions: ['KPI is below 108'], source: 'frozen event model' },
    ],
  }
}

const valid = evaluateQualifiedIdea(candidate(), { nowMs: NOW })
assert.equal(valid.status, 'qualified')
assert.equal(valid.issues.length, 0)
assert.deepEqual(valid.metrics, {
  expected_return_pct: 17.5,
  loss_probability_pct: 20,
  worst_case_loss_pct: 12,
  tail_loss_pct: 12,
  best_case_return_pct: 40,
  probability_sum_pct: 100,
  scenario_returns: [
    { label: 'bull', probability_pct: 25, return_pct: 40 },
    { label: 'base', probability_pct: 55, return_pct: 18 },
    { label: 'bear', probability_pct: 20, return_pct: -12 },
  ],
})
assert.match(valid.calibration_note, /Pre-data/)

const wrongPolicy = candidate('QIDEA-policy') as any
wrongPolicy.policy_version = 'ideas-policy/future'
assert.ok(evaluateQualifiedIdea(wrongPolicy, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_policy_version'))

const dateOnly = candidate('QIDEA-date-only')
dateOnly.created_at = '2026-08-03'
assert.ok(evaluateQualifiedIdea(dateOnly, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_provenance'), 'date-only values are not machine timestamps')
const impossibleDate = candidate('QIDEA-impossible-date')
impossibleDate.created_at = '2026-02-30T10:00:00Z'
assert.ok(evaluateQualifiedIdea(impossibleDate, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_provenance'), 'calendar-normalized impossible dates fail closed')

const oldRunReuse = candidate('QIDEA-old-run-reuse')
oldRunReuse.decision_date = '2020-01-01'
assert.ok(evaluateQualifiedIdea(oldRunReuse, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_provenance'), 'fresh evidence cannot be written into an older dated run')

const timezoneBoundary = candidate('QIDEA-timezone-boundary')
timezoneBoundary.created_at = '2026-08-02T18:31:00Z' // 00:01 on the declared run day in Asia/Kolkata
timezoneBoundary.horizon.start = timezoneBoundary.created_at
timezoneBoundary.horizon.end = new Date(Date.parse(timezoneBoundary.created_at) + 180 * 86_400_000).toISOString()
timezoneBoundary.quote.as_of = timezoneBoundary.created_at
timezoneBoundary.liquidity.as_of = timezoneBoundary.created_at
timezoneBoundary.liquidity.window_end = timezoneBoundary.created_at
timezoneBoundary.market_risk.as_of = timezoneBoundary.created_at
timezoneBoundary.catalyst.status_as_of = timezoneBoundary.created_at
assert.ok(!evaluateQualifiedIdea(timezoneBoundary, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_provenance'), 'the explicit run day accepts valid timezone-boundary UTC timestamps')

const short = candidate('QIDEA-short')
short.instrument.direction = 'short'
short.research.decision = 'Short Candidate'
short.scenarios = [
  { scenario_id: 'thesis_works', label: 'thesis_works', probability_pct: 55, price_target: 70, source_price_target: 70, conditions: ['Earnings miss the pinned estimate'], source: 'frozen event model' },
  { scenario_id: 'partial', label: 'partial', probability_pct: 25, price_target: 90, source_price_target: 90, conditions: ['Earnings meet but guidance falls'], source: 'frozen event model' },
  { scenario_id: 'squeeze', label: 'squeeze', probability_pct: 20, price_target: 115, source_price_target: 115, conditions: ['Earnings and guidance beat'], source: 'frozen event model' },
]
const shortResult = evaluateQualifiedIdea(short, { nowMs: NOW })
assert.equal(shortResult.status, 'does_not_clear')
assert.ok(shortResult.issues.some((x) => x.code === 'short_execution_unverified'))
assert.deepEqual(shortResult.metrics?.scenario_returns.map((x) => x.return_pct), [30, 10, -15], 'short returns are position-signed')

const wrongProb = candidate('QIDEA-prob')
wrongProb.scenarios[0].probability_pct = 30
assert.ok(evaluateQualifiedIdea(wrongProb, { nowMs: NOW }).issues.some((x) => x.code === 'scenario_probability_sum'))

const noLoss = candidate('QIDEA-noloss')
noLoss.scenarios[2].price_target = 102
assert.ok(evaluateQualifiedIdea(noLoss, { nowMs: NOW }).issues.some((x) => x.code === 'scenario_no_real_loss'))

const stale = candidate('QIDEA-stale')
stale.quote.as_of = '2026-07-01T00:00:00Z'
assert.ok(evaluateQualifiedIdea(stale, { nowMs: NOW }).issues.some((x) => x.code === 'stale_quote'))

const missingFreshness = candidate('QIDEA-missing-freshness')
delete (missingFreshness.quote as any).stale
assert.ok(evaluateQualifiedIdea(missingFreshness, { nowMs: NOW }).issues.some((x) => x.code === 'unverified_quote'), 'freshness must be explicitly proven false, not inferred from a missing flag')

const noBridge = candidate('QIDEA-bridge')
noBridge.valuation_bridge = {
  source_horizon_days: 365, method: 'same_horizon', convergence_fraction: null,
  rationale: 'These are twelve-month values copied without a 3-6 month convergence case.', source: '12m DCF',
}
assert.ok(evaluateQualifiedIdea(noBridge, { nowMs: NOW }).issues.some((x) => x.code === 'missing_horizon_bridge'))

const fakeSameHorizon = candidate('QIDEA-one-day-source')
fakeSameHorizon.valuation_bridge.source_horizon_days = 1
assert.ok(evaluateQualifiedIdea(fakeSameHorizon, { nowMs: NOW }).issues.some((x) => x.code === 'missing_horizon_bridge'), 'a one-day source cannot be relabeled same-horizon')

const fullLongHorizon = candidate('QIDEA-full-long-horizon')
fullLongHorizon.valuation_bridge = { source_horizon_days: 1_825, method: 'catalyst_partial_convergence', convergence_fraction: 1, rationale: 'A five-year target is asserted to converge completely during one short event window.', source: 'five-year model' }
assert.ok(evaluateQualifiedIdea(fullLongHorizon, { nowMs: NOW }).issues.some((x) => x.code === 'missing_horizon_bridge'), 'partial convergence must be strictly less than full convergence and bounded by time')

const capped = candidate('QIDEA-cap')
capped.research.hard_cap_active = true
capped.research.hard_cap_reason = 'Unresolved solvency lock.'
capped.research.unresolved_red_flags = [{ id: 'RF-SOLV-1', severity: 'Critical', description: 'Covenant breach.' }]
const cappedResult = evaluateQualifiedIdea(capped, { nowMs: NOW })
assert.equal(cappedResult.status, 'does_not_clear')
assert.ok(cappedResult.issues.some((x) => x.code === 'hard_rating_cap'))
assert.ok(cappedResult.issues.some((x) => x.code === 'critical_red_flag'))

const conjunction = candidate('QIDEA-conjunction')
conjunction.scenarios[0].conditions = ['Revenue beats', 'Margins expand', 'The multiple expands']
assert.ok(evaluateQualifiedIdea(conjunction, { nowMs: NOW }).issues.some((x) => x.code === 'scenario_conjunction_unjustified'))
conjunction.scenarios[0].joint_probability_basis = 'The three conditions share the same disclosed volume driver and are not treated as independent.'
assert.ok(!evaluateQualifiedIdea(conjunction, { nowMs: NOW }).issues.some((x) => x.code === 'scenario_conjunction_unjustified'))

const narrow = candidate('QIDEA-narrow')
narrow.market_risk.ordinary_move_pct = 50
assert.ok(evaluateQualifiedIdea(narrow, { nowMs: NOW }).issues.some((x) => x.code === 'scenario_span_too_narrow'))

const needsAudit = candidate('QIDEA-audit')
needsAudit.research.integrity_status = 'unaudited'
assert.equal(evaluateQualifiedIdea(needsAudit, { nowMs: NOW }).status, 'needs_research')

const entryLeak = candidate('QIDEA-entry-leak')
entryLeak.horizon.start = '2026-06-01T00:00:00Z'
entryLeak.horizon.end = '2026-11-28T00:00:00Z'
assert.ok(evaluateQualifiedIdea(entryLeak, { nowMs: NOW }).issues.some((x) => x.code === 'entry_time_mismatch'), 'a fresh quote cannot be attached to a holding period that began months ago')

const implicitRisk = candidate('QIDEA-implicit-risk')
;(implicitRisk.research as any).hard_cap_active = undefined
;(implicitRisk.research as any).unresolved_red_flags = undefined
assert.ok(evaluateQualifiedIdea(implicitRisk, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_risk_state'), 'missing risk state fails closed')

const contradictoryRisk = candidate('QIDEA-contradictory-risk')
contradictoryRisk.research.hard_cap_reason = 'A stale reason must not coexist with hard_cap_active=false.'
assert.ok(evaluateQualifiedIdea(contradictoryRisk, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_risk_state'), 'inactive caps require a null reason so stale cap state cannot be hidden')

const malformedReturn = candidate('QIDEA-malformed-return')
;(malformedReturn.scenarios[0] as any).return_pct = '40'
assert.ok(evaluateQualifiedIdea(malformedReturn, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_scenarios'))

const catastrophic = candidate('QIDEA-catastrophic')
catastrophic.scenarios = [
  { scenario_id: 'up_one', label: 'up_one', probability_pct: 45, price_target: 200, source_price_target: 200, conditions: ['The catalyst succeeds'], source: 'frozen event model' },
  { scenario_id: 'up_two', label: 'up_two', probability_pct: 45, price_target: 200, source_price_target: 200, conditions: ['The catalyst partly succeeds'], source: 'frozen event model' },
  { scenario_id: 'wipeout', label: 'wipeout', probability_pct: 10, price_target: 0.01, source_price_target: 0.01, conditions: ['The company fails'], source: 'frozen event model' },
]
const catastrophicResult = evaluateQualifiedIdea(catastrophic, { nowMs: NOW })
assert.notEqual(catastrophicResult.status, 'qualified', 'a rare near-total loss cannot be canceled by favorable tail mass')
assert.ok(catastrophicResult.issues.some((x) => x.code === 'tail_loss_above_budget'))
assert.ok(catastrophicResult.issues.some((x) => x.code === 'worst_case_loss_above_budget'))

const directionMismatch = candidate('QIDEA-direction-mismatch')
directionMismatch.research.decision = 'Short Candidate'
assert.ok(evaluateQualifiedIdea(directionMismatch, { nowMs: NOW }).issues.some((x) => x.code === 'decision_direction_mismatch'))

const decorativeBridge = candidate('QIDEA-decorative-bridge')
decorativeBridge.valuation_bridge = {
  source_horizon_days: 365, method: 'catalyst_partial_convergence', convergence_fraction: 0.01,
  rationale: 'Only one percent of a twelve-month source value is assumed inside the event window.', source: '12m valuation',
}
decorativeBridge.scenarios[0].source_price_target = 160
decorativeBridge.scenarios[1].source_price_target = 130
decorativeBridge.scenarios[2].source_price_target = 80
assert.ok(evaluateQualifiedIdea(decorativeBridge, { nowMs: NOW }).issues.some((x) => x.code === 'missing_horizon_bridge'), 'the stated fraction must reproduce every shorter-window target')

const impossibleScore = candidate('QIDEA-score-overflow') as any
impossibleScore.research.edge_score = 1_000
assert.ok(evaluateQualifiedIdea(impossibleScore, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_schema'))
const fractionalSessions = candidate('QIDEA-fractional-sessions') as any
fractionalSessions.liquidity.lookback_days = 60.5
assert.ok(evaluateQualifiedIdea(fractionalSessions, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_schema'))

const futureEvidence = candidate('QIDEA-future-evidence')
futureEvidence.quote.as_of = '2026-08-03T11:00:00Z'
assert.ok(evaluateQualifiedIdea(futureEvidence, { nowMs: NOW }).issues.some((x) => x.code === 'stale_quote'), 'evidence observed after candidate creation fails closed')
const alreadyStartedCatalyst = candidate('QIDEA-known-catalyst')
alreadyStartedCatalyst.catalyst.window_start = '2026-08-03T09:00:00Z'
assert.ok(evaluateQualifiedIdea(alreadyStartedCatalyst, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_catalyst'))

const inProgressCatalyst = candidate('QIDEA-in-progress-catalyst')
inProgressCatalyst.catalyst.window_start = '2026-08-03T11:00:00Z'
assert.ok(!evaluateQualifiedIdea(inProgressCatalyst, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_catalyst'), 'a still-open catalyst window remains live when its unresolved-status evidence is current')

const staleCatalystStatus = candidate('QIDEA-stale-catalyst-status')
staleCatalystStatus.catalyst.status_as_of = '2020-01-01T00:00:00Z'
assert.ok(evaluateQualifiedIdea(staleCatalystStatus, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_catalyst'), 'a stale unresolved-status assertion cannot qualify')

const earlyFalsifier = candidate('QIDEA-early-falsifier')
earlyFalsifier.horizon.start = '2026-08-04T00:00:00Z'
earlyFalsifier.horizon.end = '2027-01-31T00:00:00Z'
earlyFalsifier.falsifier.deadline = '2026-08-03T13:00:00Z'
assert.ok(evaluateQualifiedIdea(earlyFalsifier, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_falsifier'), 'the falsifier cannot settle before the holding period starts')

const recentMissingVolume = candidate('QIDEA-recent-missing-volume')
recentMissingVolume.liquidity.as_of = '2026-08-01T10:00:00Z'
assert.ok(!evaluateQualifiedIdea(recentMissingVolume, { nowMs: NOW }).issues.some((x) => x.code === 'unverified_liquidity'), 'a fixed window remains valid when its latest price session lacks volume but measured coverage is sufficient')

const impossibleSessionSpan = candidate('QIDEA-impossible-session-span')
impossibleSessionSpan.liquidity.window_start = '2026-08-02T10:00:00Z'
assert.ok(evaluateQualifiedIdea(impossibleSessionSpan, { nowMs: NOW }).issues.some((x) => x.code === 'unverified_liquidity'), '60 claimed sessions cannot fit inside one calendar day')

const duplicateScenarioId = candidate('QIDEA-duplicate-scenario-id')
duplicateScenarioId.scenarios[1].scenario_id = duplicateScenarioId.scenarios[0].scenario_id
assert.ok(evaluateQualifiedIdea(duplicateScenarioId, { nowMs: NOW }).issues.some((x) => x.code === 'invalid_scenarios'), 'scenario authority ids must be unique')

assert.equal(expectedShortfallLoss([
  { probability_pct: 10, return_pct: -30 },
  { probability_pct: 20, return_pct: -10 },
  { probability_pct: 70, return_pct: 20 },
], 20), 20, 'tail metric takes all of the worst 10% and half of the next 20% mass')
assert.equal(expectedShortfallLoss([
  { probability_pct: 10, return_pct: -99.99 },
  { probability_pct: 90, return_pct: 100 },
], 20), 49.995, 'favorable probability mass inside the selected tail cannot cancel loss magnitude')

const highReturn = candidate('QIDEA-high-return')
highReturn.scenarios = [
  { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 160, source_price_target: 160, conditions: ['KPI reaches 140'], source: 'frozen event model' },
  { scenario_id: 'base', label: 'base', probability_pct: 55, price_target: 130, source_price_target: 130, conditions: ['KPI reaches 115'], source: 'frozen event model' },
  { scenario_id: 'bear', label: 'bear', probability_pct: 20, price_target: 80, source_price_target: 80, conditions: ['KPI misses 100'], source: 'frozen event model' },
]
const lowRisk = candidate('QIDEA-low-risk')
lowRisk.scenarios = [
  { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 130, source_price_target: 130, conditions: ['KPI reaches 125'], source: 'frozen event model' },
  { scenario_id: 'base', label: 'base', probability_pct: 55, price_target: 116, source_price_target: 116, conditions: ['KPI reaches 110'], source: 'frozen event model' },
  { scenario_id: 'bear', label: 'bear', probability_pct: 20, price_target: 92, source_price_target: 92, conditions: ['KPI misses 100'], source: 'frozen event model' },
]
const dominated = candidate('QIDEA-dominated')
dominated.scenarios = [
  { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 125, source_price_target: 125, conditions: ['KPI reaches 120'], source: 'frozen event model' },
  { scenario_id: 'base', label: 'base', probability_pct: 55, price_target: 112, source_price_target: 112, conditions: ['KPI reaches 108'], source: 'frozen event model' },
  { scenario_id: 'bear', label: 'bear', probability_pct: 20, price_target: 90, source_price_target: 90, conditions: ['KPI misses 100'], source: 'frozen event model' },
]
const ranked = rankQualifiedIdeas([highReturn, lowRisk, dominated].map((x) => evaluateQualifiedIdea(x, { nowMs: NOW })))
assert.deepEqual(ranked.filter((x) => x.pareto_layer === 1).map((x) => x.candidate.idea_id), ['QIDEA-high-return', 'QIDEA-low-risk'])
assert.equal(ranked.find((x) => x.candidate.idea_id === 'QIDEA-dominated')?.pareto_layer, 2)

console.log('\n1 qualified-ideas test file passed')
