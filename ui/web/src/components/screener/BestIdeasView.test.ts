import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { BoardIdea, QualifiedIdeaEvaluation, QualifiedIdeasBoard } from '../../lib/types'
import {
  IdeasTabs,
  QualifiedIdeaCard,
  ideaScorePresentation,
  ideaThemeAttribution,
  ideasEmptyMessage,
  ideasForSide,
  normalizeQualifiedIdeaRow,
  normalizeQualifiedIdeasBoard,
  qualifiedIdeaCalibrationPresentation,
  qualifiedIdeaCatalystWindowLabel,
  qualifiedIdeaHorizonLabel,
  qualifiedIdeaQuoteLabel,
  qualifiedIdeaReturnTag,
  qualifiedIdeaSourceRows,
  qualifiedIdeasForSide,
  qualifiedIdeasOutcomeNotice,
  qualifiedIdeasRuntimeWarning,
  qualifiedIdeasWarning,
  qualifiedOutcomeHealthWarning,
} from './BestIdeasView'

const tabsHtml = renderToStaticMarkup(createElement(IdeasTabs, { active: 'long', onSelect: () => {} }))
assert.equal(tabsHtml.match(/role="tab"/g)?.length, 2, 'the Ideas surface has exactly two tabs')
assert.match(tabsHtml, />LONG<\/button>/)
assert.match(tabsHtml, />SHORT<\/button>/)
assert.match(tabsHtml, /id="ideas-long-tab"[^>]*aria-selected="true"/)
assert.match(tabsHtml, /id="ideas-short-tab"[^>]*aria-selected="false"/)
assert.match(tabsHtml, /id="ideas-long-tab"[^>]*tabindex="0"/)
assert.match(tabsHtml, /id="ideas-short-tab"[^>]*tabindex="-1"/)

const nowMs = Date.parse('2026-08-12T12:00:00Z')
const idea = (ideaId: string, direction: BoardIdea['direction'], patch: Partial<BoardIdea> = {}) => ({
  idea_id: ideaId,
  direction,
  stale: false,
  decay_at: '2026-08-13T12:00:00Z',
  ...patch,
}) as BoardIdea
const mixedIdeas = [
  idea('long-live', 'long'),
  idea('short-live', 'short'),
  idea('pair-live', 'pair', { pair_with: 'PAIR-SHORT' }),
  idea('pair-missing-leg', 'pair', { pair_with: null }),
  idea('long-stale-flag', 'long', { stale: true }),
  idea('short-expired', 'short', { decay_at: '2026-08-11T12:00:00Z' }),
]

assert.deepEqual(ideasForSide(mixedIdeas, 'long', nowMs).map((row) => row.idea_id), ['long-live', 'pair-live'])
assert.deepEqual(ideasForSide(mixedIdeas, 'short', nowMs).map((row) => row.idea_id), ['short-live', 'pair-live'])

const qualified = (ideaId: string, direction: 'long' | 'short', horizonEnd = '2026-12-10T10:00:00Z') => {
  const ticker = ideaId.toUpperCase().replace(/[^-A-Z0-9.]/g, '').slice(0, 20)
  return ({
  candidate: {
    schema_version: 'qualified-idea/v1',
    policy_version: 'ideas-policy/precal-v1',
    market_evidence_sha256: 'b'.repeat(64),
    projection_manifest_sha256: 'c'.repeat(64),
    run_root: `analyses/${ticker}_2026-08-12`,
    decision_date: '2026-08-12',
    created_at: '2026-08-12T09:00:00Z',
    idea_id: ideaId,
    instrument: { ticker, company: 'Example Co', exchange: 'NYSE', currency: 'USD', direction, asset_type: 'equity' },
    quote: { price: 100, identity_verified: true, stale: false, as_of: '2026-08-12T08:00:00Z', source: 'Primary close' },
    liquidity: {
      verified: true, as_of: '2026-08-12T08:00:00Z', source: 'Primary close and volume',
      lookback_days: 60, observed_sessions: 60, coverage_pct: 100,
      window_start: '2026-06-14T08:00:00Z', window_end: '2026-08-12T08:00:00Z', median_daily_value_usd: 25_000_000,
      currency_conversion: { pair: 'USD/USD', rate_usd_per_currency: 1, as_of: '2026-08-12T08:00:00Z', source: 'USD base currency' },
    },
    market_risk: { as_of: '2026-08-12T08:00:00Z', source: 'Primary adjusted closes', lookback_days: 60, ordinary_move_pct: 5 },
    research: {
      edge_proof: 'A dated earnings change is not priced in.', calibration_status: 'pre_data',
      decision: direction === 'long' ? 'Buy' : 'Short Candidate', integrity_status: 'verified',
      data_sufficiency_score: 70, edge_score: 60, hard_cap_active: false, hard_cap_reason: null, unresolved_red_flags: [],
    },
    catalyst: {
      forecast_id: 'FC-1', name: 'Quarterly results', status_at_admission: 'scheduled_unresolved', status_as_of: '2026-08-12T08:00:00Z',
      window_start: '2026-10-20T00:00:00Z', window_end: '2026-10-28T23:59:00Z', source: 'Company filing',
      causal_steps: ['Revenue changes the earnings outlook.', 'The changed outlook moves fair value.'],
      bullish_trigger: 'Revenue growth exceeds 10%.', bearish_trigger: 'Revenue growth falls below 3%.',
    },
    falsifier: {
      condition: 'The expected margin gain does not occur.', metric: 'Operating margin', threshold: 'No year-on-year gain',
      deadline: '2026-12-01T00:00:00Z', source: 'Forecast ledger',
    },
    valuation_bridge: {
      source_horizon_days: 120, method: 'same_horizon', convergence_fraction: null,
      rationale: 'The source targets use the same holding period.', source: 'Valuation workpaper',
    },
    horizon: { start: '2026-08-12T10:00:00Z', end: horizonEnd },
    scenarios: [
      { scenario_id: 'bear', label: 'Bear', probability_pct: 20, price_target: 90, source_price_target: 90, conditions: ['Margins contract.'], source: 'Valuation', joint_probability_basis: null },
      { scenario_id: 'base', label: 'Base', probability_pct: 50, price_target: 130, source_price_target: 130, conditions: ['Margins improve.'], source: 'Valuation', joint_probability_basis: null },
      { scenario_id: 'bull', label: 'Bull', probability_pct: 30, price_target: 170, source_price_target: 170, conditions: ['Growth accelerates.'], source: 'Valuation', joint_probability_basis: null },
    ],
  },
  status: 'qualified',
  issues: [],
  metrics: {
    expected_return_pct: 34,
    loss_probability_pct: 20,
    worst_case_loss_pct: 10,
    tail_loss_pct: 10,
    best_case_return_pct: 70,
    probability_sum_pct: 100,
    scenario_returns: [
      { label: 'Bear', probability_pct: 20, return_pct: -10 },
      { label: 'Base', probability_pct: 50, return_pct: 30 },
      { label: 'Bull', probability_pct: 30, return_pct: 70 },
    ],
  },
  ranking: {
    policy_version: 'ideas-ranking/calibration-shrinkage-v1',
    calibration_status: 'pre_data',
    raw_expected_return_pct: 34,
    positive_return_retention: 0.35,
    return_haircut_pct: 65,
    conservative_expected_return_pct: 11.9,
    uncapped_evidence_confidence_score: 60,
    evidence_confidence_cap: 50,
    evidence_confidence_score: 42,
    rationale: 'No exact-horizon outcomes have resolved, so 65% of claimed upside is removed and evidence is compressed into a conservative 0-50 confidence band.',
  },
  pareto_layer: 1,
  admission: {
    admission_id: `ADM-${ideaId}`, admission_sha256: 'd'.repeat(64), candidate_sha256: 'e'.repeat(64), frozen_at: '2026-08-12T09:05:00Z',
  },
  calibration_note: 'Pre-data: probabilities and policy thresholds are auditable priors until enough exact-horizon outcomes resolve.',
  }) as unknown as QualifiedIdeaEvaluation
}
const outcomeHealth = {
  schema_version: 'qualified-idea-outcomes-health/v2',
  repository_scope_sha256: 'a'.repeat(64),
  pass_id: 'QOHP-000000000001-abcdefabcdef',
  pass_sequence: 1,
  pass_started_at: '2026-08-12T09:00:00Z',
  updated_at: '2026-08-12T10:00:00Z',
  expires_at: '2026-08-12T15:00:00Z',
  status: 'healthy',
  outcome: 'nothing_due',
  reason: 'No forecast endpoint is due.',
  terminal: true,
  qualified_idea_count: 2,
  admission_count: 2,
  admission_appended_count: 0,
  admission_existing_count: 2,
  admission_conflict_count: 0,
  due_count: 0,
  appended_count: 0,
  existing_count: 0,
  unresolved_count: 0,
  endpoint_pending_count: 0,
  not_due_count: 2,
  ledger_invalid_count: 0,
  ledger_conflict_count: 0,
  missing_history: [],
  missing_comparators: [],
  provider_failures: [],
  errors: [],
}
const qualifiedPolicy = {
  horizonMinDays: 90,
  horizonMaxDays: 183,
  entryMaxSkewDays: 3,
  quoteMaxAgeDays: 7,
  liquidityMaxAgeDays: 14,
  liquidityLookbackMinDays: 60,
  liquidityMinCoveragePct: 90,
  marketRiskLookbackMinDays: 60,
  minMedianDailyValueUsd: 5_000_000,
  minDataSufficiency: 70,
  minEdgeScore: 50,
  minExpectedReturnPct: 10,
  maxTailLossPct: 20,
  maxWorstCaseLossPct: 35,
  minAdverseProbabilityPct: 10,
  minAdverseMovePct: 5,
  minAdverseVsOrdinaryMove: 1,
  minFavorableVsOrdinaryMove: 1,
  tailProbabilityPct: 20,
  probabilityTolerancePct: 0.05,
  returnReconciliationTolerancePct: 0.15,
}
const qualifiedBoard = {
  schema_version: 'qualified-ideas-board/v1',
  generated_at: '2026-08-12T10:00:00Z',
  policy_version: 'ideas-policy/precal-v1',
  ranking_policy_version: 'ideas-ranking/calibration-shrinkage-v1',
  policy: qualifiedPolicy,
  health: {
    status: 'healthy', outcome: 'qualified', reason: 'One or more ideas qualified.',
    artifact_count: 2, assessment_count: 2, parsed_count: 2, invalid_count: 0,
    incomplete_count: 0, publishing_count: 0, not_assessable_count: 0,
    qualified_count: 2, needs_research_count: 0, does_not_clear_count: 0, measured_count: 0,
  },
  outcome_health_state: 'valid',
  outcome_health: outcomeHealth,
  qualified: [qualified('qualified-long', 'long'), qualified('qualified-second', 'long')],
} as unknown as QualifiedIdeasBoard
assert.deepEqual(qualifiedIdeasForSide(qualifiedBoard, 'long').map((row) => row.candidate.idea_id), ['qualified-long', 'qualified-second'])
assert.deepEqual(qualifiedIdeasForSide(qualifiedBoard, 'short').map((row) => row.candidate.idea_id), [])

const normalizedQualifiedBoard = normalizeQualifiedIdeasBoard(qualifiedBoard)
assert.equal(normalizedQualifiedBoard.invalidRowCount, 0)
assert.equal(normalizedQualifiedBoard.board?.qualified.length, 2)
const reorderedQualifiedBoard = normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  qualified: [...qualifiedBoard.qualified].reverse().map((row) => ({ ...row, pareto_layer: 99 })),
})
assert.deepEqual(
  reorderedQualifiedBoard.board?.qualified.map((row) => [row.candidate.idea_id, row.pareto_layer]),
  [['qualified-long', 1], ['qualified-second', 1]],
  'client recomputes the server Pareto order and layer instead of trusting payload order',
)
assert.equal(normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  qualified: [qualifiedBoard.qualified[0], structuredClone(qualifiedBoard.qualified[0])],
}).board, null, 'duplicate idea/listing identities fail closed')
const partlyMalformedQualifiedBoard = normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  health: { ...qualifiedBoard.health, artifact_count: 3, assessment_count: 3, parsed_count: 3, qualified_count: 3 },
  qualified: [...qualifiedBoard.qualified, { candidate: null }],
})
assert.equal(partlyMalformedQualifiedBoard.invalidRowCount, 1)
assert.equal(partlyMalformedQualifiedBoard.board?.qualified.length, 2)
assert.deepEqual(qualifiedIdeasRuntimeWarning(partlyMalformedQualifiedBoard), {
  label: '1 malformed research forecast hidden.',
  title: 'Those rows could not be shown safely. Refresh the research board before relying on this list.',
})
assert.equal(normalizeQualifiedIdeaRow({ candidate: null }), null)
assert.ok(normalizeQualifiedIdeaRow(qualified('row-only-defaults', 'long')), 'row-only validation uses the server tolerance defaults')
assert.equal(normalizeQualifiedIdeasBoard({ schema_version: 'qualified-ideas-board/v99' }).board, null)
assert.equal(normalizeQualifiedIdeasBoard({ ...qualifiedBoard, schema_version: 'qualified-ideas-board/v2' }).board, null, 'a future board schema cannot silently widen the trusted contract')
assert.equal(normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  policy: { ...qualifiedBoard.policy, probabilityTolerancePct: 100, returnReconciliationTolerancePct: 100 },
}).board, null, 'a payload cannot widen the frozen server tolerances')

const rejectedQualifiedRow = structuredClone(qualified('rejected-row', 'long')) as unknown as Record<string, unknown>
rejectedQualifiedRow.status = 'does_not_clear'
rejectedQualifiedRow.issues = [{ code: 'expected_return_below_bar', message: 'Below bar.', disposition: 'reject' }]
assert.equal(normalizeQualifiedIdeaRow(rejectedQualifiedRow, qualifiedBoard.policy), null, 'a rejected evaluation cannot render from the qualified array')

const badProbabilityRow = structuredClone(qualified('bad-probability', 'long')) as unknown as QualifiedIdeaEvaluation
badProbabilityRow.candidate.scenarios[0].probability_pct = 15
assert.equal(normalizeQualifiedIdeaRow(badProbabilityRow, qualifiedBoard.policy), null, 'scenario probabilities must reconcile to 100%')

const duplicateScenarioRow = structuredClone(qualified('duplicate-scenario', 'long')) as unknown as QualifiedIdeaEvaluation
duplicateScenarioRow.candidate.scenarios[1].scenario_id = duplicateScenarioRow.candidate.scenarios[0].scenario_id
assert.equal(normalizeQualifiedIdeaRow(duplicateScenarioRow, qualifiedBoard.policy), null, 'scenario IDs must be unique')
const duplicateLabelRow = structuredClone(qualified('duplicate-label', 'long')) as unknown as QualifiedIdeaEvaluation
duplicateLabelRow.candidate.scenarios[1].label = duplicateLabelRow.candidate.scenarios[0].label
assert.equal(normalizeQualifiedIdeaRow(duplicateLabelRow, qualifiedBoard.policy), null, 'scenario labels must be unique')

const badExpectedReturnRow = structuredClone(qualified('bad-expected-return', 'long')) as unknown as QualifiedIdeaEvaluation
badExpectedReturnRow.metrics!.expected_return_pct = 30
assert.equal(normalizeQualifiedIdeaRow(badExpectedReturnRow, qualifiedBoard.policy), null, 'aggregate expected return must reconcile to the scenario distribution')

const badLossProbabilityRow = structuredClone(qualified('bad-loss-probability', 'long')) as unknown as QualifiedIdeaEvaluation
badLossProbabilityRow.metrics!.loss_probability_pct = 0
assert.equal(normalizeQualifiedIdeaRow(badLossProbabilityRow, qualifiedBoard.policy), null, 'loss probability must reconcile to the scenario distribution')
const badWorstCaseRow = structuredClone(qualified('bad-worst-case', 'long')) as unknown as QualifiedIdeaEvaluation
badWorstCaseRow.metrics!.worst_case_loss_pct = 0
assert.equal(normalizeQualifiedIdeaRow(badWorstCaseRow, qualifiedBoard.policy), null, 'worst-case loss must reconcile to the scenario distribution')
const badTailLossRow = structuredClone(qualified('bad-tail-loss', 'long')) as unknown as QualifiedIdeaEvaluation
badTailLossRow.metrics!.tail_loss_pct = 0
assert.equal(normalizeQualifiedIdeaRow(badTailLossRow, qualifiedBoard.policy), null, 'tail loss must use the server expected-shortfall calculation')
const badBestCaseRow = structuredClone(qualified('bad-best-case', 'long')) as unknown as QualifiedIdeaEvaluation
badBestCaseRow.metrics!.best_case_return_pct = 99
assert.equal(normalizeQualifiedIdeaRow(badBestCaseRow, qualifiedBoard.policy), null, 'best-case return must reconcile even when it is not printed')

const badTargetReturnRow = structuredClone(qualified('bad-target-return', 'long')) as unknown as QualifiedIdeaEvaluation
badTargetReturnRow.metrics!.scenario_returns[0].return_pct = -5
assert.equal(normalizeQualifiedIdeaRow(badTargetReturnRow, qualifiedBoard.policy), null, 'scenario return must reconcile to the frozen quote and target')

const reorderedMetricRows = structuredClone(qualified('stable-label-match', 'long')) as unknown as QualifiedIdeaEvaluation
reorderedMetricRows.metrics!.scenario_returns.reverse()
assert.ok(normalizeQualifiedIdeaRow(reorderedMetricRows, qualifiedBoard.policy), 'scenario returns match by stable label rather than array index')

const legacyNoRankingRow = structuredClone(qualified('legacy-no-ranking', 'long')) as unknown as QualifiedIdeaEvaluation
legacyNoRankingRow.ranking = null
assert.equal(normalizeQualifiedIdeaRow(legacyNoRankingRow, qualifiedBoard.policy), null, 'an older row without ranking cannot headline an unadjusted return')
const missingRankingContractRow = structuredClone(qualified('missing-ranking-contract', 'long')) as unknown as QualifiedIdeaEvaluation
delete (missingRankingContractRow.ranking as unknown as Record<string, unknown>).policy_version
assert.equal(normalizeQualifiedIdeaRow(missingRankingContractRow, qualifiedBoard.policy), null, 'a partial ranking object fails closed')
const impossibleRankingScoreRow = structuredClone(qualified('ranking-score-999', 'long')) as unknown as QualifiedIdeaEvaluation
impossibleRankingScoreRow.ranking!.evidence_confidence_score = 999
assert.equal(normalizeQualifiedIdeaRow(impossibleRankingScoreRow, qualifiedBoard.policy), null, 'an impossible 999 evidence-confidence score fails closed')
const mismatchedRankingMathRow = structuredClone(qualified('ranking-math-mismatch', 'long')) as unknown as QualifiedIdeaEvaluation
mismatchedRankingMathRow.ranking!.conservative_expected_return_pct = 11
assert.equal(normalizeQualifiedIdeaRow(mismatchedRankingMathRow, qualifiedBoard.policy), null, 'conservative return must reconcile to raw return and retention')
const mismatchedRankingHaircutRow = structuredClone(qualified('ranking-haircut-mismatch', 'long')) as unknown as QualifiedIdeaEvaluation
mismatchedRankingHaircutRow.ranking!.return_haircut_pct = 5
assert.equal(normalizeQualifiedIdeaRow(mismatchedRankingHaircutRow, qualifiedBoard.policy), null, 'the printed haircut must reconcile to retention')
const unknownRankingPolicyRow = structuredClone(qualified('ranking-policy-mismatch', 'long')) as unknown as QualifiedIdeaEvaluation
unknownRankingPolicyRow.ranking!.policy_version = 'ideas-ranking/future-v99'
assert.equal(normalizeQualifiedIdeaRow(unknownRankingPolicyRow, qualifiedBoard.policy), null, 'an unknown ranking policy cannot be presented as policy-adjusted')
const unshrunkRankingRow = structuredClone(qualified('ranking-no-shrinkage', 'long')) as unknown as QualifiedIdeaEvaluation
unshrunkRankingRow.ranking!.positive_return_retention = 1
unshrunkRankingRow.ranking!.return_haircut_pct = 0
unshrunkRankingRow.ranking!.conservative_expected_return_pct = 12.5
assert.equal(normalizeQualifiedIdeaRow(unshrunkRankingRow, qualifiedBoard.policy), null, 'a payload cannot remove the frozen 65% positive-return haircut')
const detachedConfidenceRow = structuredClone(qualified('ranking-confidence-mismatch', 'long')) as unknown as QualifiedIdeaEvaluation
detachedConfidenceRow.ranking!.uncapped_evidence_confidence_score = 90
detachedConfidenceRow.ranking!.evidence_confidence_score = 48
assert.equal(normalizeQualifiedIdeaRow(detachedConfidenceRow, qualifiedBoard.policy), null, 'evidence confidence must derive from the weaker research score')
const unsupportedCalibratedRow = structuredClone(qualified('unsupported-calibrated', 'long')) as unknown as QualifiedIdeaEvaluation
unsupportedCalibratedRow.candidate.research.calibration_status = 'calibrated'
unsupportedCalibratedRow.ranking!.calibration_status = 'calibrated'
assert.equal(normalizeQualifiedIdeaRow(unsupportedCalibratedRow, qualifiedBoard.policy), null, 'calibrated remains reserved until the server implements its quality gate')

const eligibilityDefects: Array<[string, (row: QualifiedIdeaEvaluation) => void]> = [
  ['a v1 short has no verified borrow contract', (row) => {
    row.candidate.instrument.direction = 'short'
    row.candidate.research.decision = 'Short Candidate'
  }],
  ['the immutable market-evidence digest is missing', (row) => { row.candidate.market_evidence_sha256 = '' }],
  ['the run identity does not match the listed ticker', (row) => { row.candidate.run_root = 'analyses/OTHER_2026-08-12' }],
  ['the quote identity is not verified', (row) => { row.candidate.quote.identity_verified = false }],
  ['the quote is marked stale', (row) => { row.candidate.quote.stale = true }],
  ['liquidity is not verified', (row) => { row.candidate.liquidity.verified = false }],
  ['liquidity falls below the dollar-volume floor', (row) => { row.candidate.liquidity.median_daily_value_usd = 1 }],
  ['ordinary-move evidence is absent', (row) => { row.candidate.market_risk.ordinary_move_pct = 0 }],
  ['scenario downside does not span an ordinary move', (row) => { row.candidate.market_risk.ordinary_move_pct = 15 }],
  ['the decision is not actionable', (row) => { row.candidate.research.decision = 'Watchlist' }],
  ['research integrity is not verified', (row) => { row.candidate.research.integrity_status = 'provisional' }],
  ['data sufficiency misses policy', (row) => { row.candidate.research.data_sufficiency_score = 69 }],
  ['proven edge misses policy', (row) => { row.candidate.research.edge_score = 49 }],
  ['a hard rating cap is active', (row) => {
    row.candidate.research.hard_cap_active = true
    row.candidate.research.hard_cap_reason = 'Unresolved solvency cap.'
  }],
  ['a Critical red flag remains', (row) => {
    row.candidate.research.unresolved_red_flags = [{ id: 'RF-C', severity: 'Critical', description: 'Going-concern risk is unresolved.' }]
  }],
  ['the holding horizon is outside 3-6 months', (row) => { row.candidate.horizon.end = '2027-02-12T10:00:00Z' }],
  ['the catalyst is not frozen as scheduled and unresolved', (row) => { row.candidate.catalyst.status_at_admission = 'resolved' as 'scheduled_unresolved' }],
  ['the catalyst has no causal chain', (row) => { row.candidate.catalyst.causal_steps = ['Only one step.'] }],
  ['the falsifier settles outside the horizon', (row) => { row.candidate.falsifier.deadline = '2027-01-01T00:00:00Z' }],
  ['the valuation bridge is unsupported', (row) => { row.candidate.valuation_bridge.method = 'other' }],
  ['a scenario target is detached from its frozen source target', (row) => { row.candidate.scenarios[1].source_price_target = 150 }],
  ['a multi-condition scenario has no joint-probability basis', (row) => {
    row.candidate.scenarios[0].conditions = ['Margins contract.', 'Demand contracts.']
    row.candidate.scenarios[0].joint_probability_basis = null
  }],
  ['the immutable admission seal is absent', (row) => { row.admission = undefined }],
  ['the holding period begins before final admission', (row) => { row.admission!.frozen_at = '2026-08-12T11:00:00Z' }],
  ['the server Pareto layer is absent', (row) => { row.pareto_layer = null }],
  ['the frozen calibration note is altered', (row) => { row.calibration_note = 'Fully calibrated.' }],
]
for (const [label, mutate] of eligibilityDefects) {
  const row = structuredClone(qualified(`gate-${eligibilityDefects.findIndex(([name]) => name === label)}`, 'long')) as QualifiedIdeaEvaluation
  assert.ok(normalizeQualifiedIdeaRow(row, qualifiedBoard.policy, nowMs), `${label}: control fixture qualifies before mutation`)
  mutate(row)
  assert.equal(normalizeQualifiedIdeaRow(row, qualifiedBoard.policy, nowMs), null, label)
}
assert.equal(
  normalizeQualifiedIdeaRow(qualified('freshness-expired', 'long'), qualifiedBoard.policy, Date.parse('2026-08-20T12:00:00Z')),
  null,
  'server freshness gates are rerun at the board evaluation clock',
)

const lowConservativeReturn = structuredClone(qualified('low-adjusted-return', 'long')) as QualifiedIdeaEvaluation
lowConservativeReturn.candidate.scenarios = [
  { ...lowConservativeReturn.candidate.scenarios[0], price_target: 90, source_price_target: 90, probability_pct: 20 },
  { ...lowConservativeReturn.candidate.scenarios[1], price_target: 120, source_price_target: 120, probability_pct: 50 },
  { ...lowConservativeReturn.candidate.scenarios[2], price_target: 160, source_price_target: 160, probability_pct: 30 },
]
lowConservativeReturn.metrics = {
  expected_return_pct: 26, loss_probability_pct: 20, worst_case_loss_pct: 10, tail_loss_pct: 10,
  best_case_return_pct: 60, probability_sum_pct: 100,
  scenario_returns: [
    { label: 'Bear', probability_pct: 20, return_pct: -10 },
    { label: 'Base', probability_pct: 50, return_pct: 20 },
    { label: 'Bull', probability_pct: 30, return_pct: 60 },
  ],
}
lowConservativeReturn.ranking = { ...lowConservativeReturn.ranking!, raw_expected_return_pct: 26, conservative_expected_return_pct: 9.1 }
assert.equal(normalizeQualifiedIdeaRow(lowConservativeReturn, qualifiedBoard.policy, nowMs), null, 'raw upside cannot qualify when its policy-adjusted return misses the live bar')

const excessiveLoss = structuredClone(qualified('loss-budget', 'long')) as QualifiedIdeaEvaluation
excessiveLoss.candidate.scenarios = [
  { ...excessiveLoss.candidate.scenarios[0], price_target: 60, source_price_target: 60, probability_pct: 20 },
  { ...excessiveLoss.candidate.scenarios[1], price_target: 140, source_price_target: 140, probability_pct: 50 },
  { ...excessiveLoss.candidate.scenarios[2], price_target: 180, source_price_target: 180, probability_pct: 30 },
]
excessiveLoss.metrics = {
  expected_return_pct: 36, loss_probability_pct: 20, worst_case_loss_pct: 40, tail_loss_pct: 40,
  best_case_return_pct: 80, probability_sum_pct: 100,
  scenario_returns: [
    { label: 'Bear', probability_pct: 20, return_pct: -40 },
    { label: 'Base', probability_pct: 50, return_pct: 40 },
    { label: 'Bull', probability_pct: 30, return_pct: 80 },
  ],
}
excessiveLoss.ranking = { ...excessiveLoss.ranking!, raw_expected_return_pct: 36, conservative_expected_return_pct: 12.6 }
assert.equal(normalizeQualifiedIdeaRow(excessiveLoss, qualifiedBoard.policy, nowMs), null, 'tail and worst-case loss budgets remain hard gates')

const roundedLossBoundary = structuredClone(qualified('rounded-loss-boundary', 'long')) as QualifiedIdeaEvaluation
roundedLossBoundary.candidate.scenarios = [
  { ...roundedLossBoundary.candidate.scenarios[0], price_target: 79.996, source_price_target: 79.996, probability_pct: 20 },
  { ...roundedLossBoundary.candidate.scenarios[1], price_target: 140, source_price_target: 140, probability_pct: 50 },
  { ...roundedLossBoundary.candidate.scenarios[2], price_target: 180, source_price_target: 180, probability_pct: 30 },
]
roundedLossBoundary.metrics = {
  expected_return_pct: 40, loss_probability_pct: 20, worst_case_loss_pct: 20, tail_loss_pct: 20,
  best_case_return_pct: 80, probability_sum_pct: 100,
  scenario_returns: [
    { label: 'Bear', probability_pct: 20, return_pct: -20 },
    { label: 'Base', probability_pct: 50, return_pct: 40 },
    { label: 'Bull', probability_pct: 30, return_pct: 80 },
  ],
}
roundedLossBoundary.ranking = { ...roundedLossBoundary.ranking!, raw_expected_return_pct: 40, conservative_expected_return_pct: 14 }
assert.ok(normalizeQualifiedIdeaRow(roundedLossBoundary, qualifiedBoard.policy, nowMs), 'eligibility gates use the same rounded metrics as the server at an exact loss-budget boundary')

assert.equal(normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  health: { ...qualifiedBoard.health, status: 'healthy', outcome: 'none_clear' },
}).board, null, 'none_clear cannot coexist with qualified rows')
assert.equal(normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  health: { ...qualifiedBoard.health, qualified_count: 1 },
}).board, null, 'the qualified count must reconcile to the board rows')
assert.equal(normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  ranking_policy_version: undefined,
  qualified: qualifiedBoard.qualified.map((row) => ({ ...row, ranking: null })),
}).board, null, 'removing every ranking row cannot downgrade the board to raw actionable returns')
assert.equal(normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  generated_at: '2026-08-12T13:00:00Z',
}, nowMs).board, null, 'a future board clock cannot make future evidence look current')

const missingOutcomeHealth = normalizeQualifiedIdeasBoard({ ...qualifiedBoard, outcome_health: null })
assert.equal(missingOutcomeHealth.board?.outcome_health_state, 'unknown', 'valid state without a valid health record fails closed')
assert.deepEqual(qualifiedOutcomeHealthWarning(missingOutcomeHealth.board), {
  label: 'Outcome checks unavailable.',
  title: 'No trustworthy outcome-health check is available.',
})
const malformedOutcomeHealth = normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  outcome_health_state: 'expired',
  outcome_health: { ...outcomeHealth, schema_version: 'qualified-idea-outcomes-health/v1' },
})
assert.equal(malformedOutcomeHealth.board?.outcome_health_state, 'unknown', 'expired state with malformed evidence also fails closed')
const incoherentOutcomeHealth = normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  outcome_health: { ...outcomeHealth, status: 'healthy', outcome: 'provider_failed' },
})
assert.equal(incoherentOutcomeHealth.board?.outcome_health_state, 'unknown', 'an impossible health status/outcome pairing fails closed')
const futureOutcomeHealth = normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  outcome_health: {
    ...outcomeHealth,
    pass_started_at: '2026-08-12T12:30:00Z',
    updated_at: '2026-08-12T13:00:00Z',
    expires_at: '2099-08-12T13:30:00Z',
  },
}, nowMs)
assert.equal(futureOutcomeHealth.board?.outcome_health_state, 'unknown', 'future health cannot mask a stopped outcome loop')
const indefiniteOutcomeHealth = normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  outcome_health: { ...outcomeHealth, expires_at: '2099-08-12T13:30:00Z' },
}, nowMs)
assert.equal(indefiniteOutcomeHealth.board?.outcome_health_state, 'unknown', 'an unbounded green expiry cannot suppress warnings indefinitely')

assert.deepEqual(qualifiedIdeaReturnTag({
  metrics: { expected_return_pct: 24.8 },
  ranking: { conservative_expected_return_pct: 8.7 },
} as QualifiedIdeaEvaluation), {
  label: 'policy-adjusted +8.7%',
  title: 'Raw scenario return +24.8%',
})
assert.equal(qualifiedIdeaReturnTag({
  metrics: { expected_return_pct: 12.5 },
} as QualifiedIdeaEvaluation), null, 'raw return is never a headline fallback')
assert.equal(qualifiedIdeaReturnTag({ metrics: null } as QualifiedIdeaEvaluation), null)

assert.deepEqual(qualifiedIdeasWarning({
  health: { status: 'degraded', incomplete_count: 2, reason: 'Admission artifacts missing.' },
} as unknown as QualifiedIdeasBoard), {
  label: '2 research runs not published',
  title: 'Admission artifacts missing.',
})
assert.deepEqual(qualifiedIdeasWarning({
  health: { status: 'degraded', reason: 'Storage read failed.' },
} as unknown as QualifiedIdeasBoard), {
  label: 'Research results incomplete',
  title: 'Storage read failed.',
})
assert.equal(qualifiedIdeasWarning({ health: { status: 'healthy' } } as unknown as QualifiedIdeasBoard), null)

const trustedEmptySources = {
  leadsAvailable: true,
  leadHealth: { schema_version: 'ideas-health/v1', status: 'healthy' },
  qualified: normalizedQualifiedBoard,
}
const preDataQualifiedBoard = normalizeQualifiedIdeasBoard({
  ...qualifiedBoard,
  health: {
    ...qualifiedBoard.health,
    status: 'pre_data', outcome: 'no_artifacts', reason: 'No research artifacts yet.',
    artifact_count: 0, assessment_count: 0, parsed_count: 0, not_assessable_count: 0,
    qualified_count: 0, needs_research_count: 0, does_not_clear_count: 0, measured_count: 0,
  },
  qualified: [],
})
assert.equal(ideasEmptyMessage('long', trustedEmptySources), 'No LONG ideas.')
assert.equal(ideasEmptyMessage('short', {
  ...trustedEmptySources,
  leadHealth: { schema_version: 'ideas-health/v1', status: 'running' },
}), 'Checking for ideas…')
assert.equal(ideasEmptyMessage('long', {
  ...trustedEmptySources,
  qualified: preDataQualifiedBoard,
}), 'Checking for ideas…', 'qualified research that has not run yet is checking, not a clean empty result')
assert.equal(ideasEmptyMessage('long', {
  ...trustedEmptySources,
  leadHealth: { status: 'healthy' },
}), 'Ideas unavailable.', 'a lead-health object without its trusted schema cannot prove an empty result')
assert.equal(ideasEmptyMessage('short', {
  ...trustedEmptySources,
  qualified: normalizeQualifiedIdeasBoard(null),
}), 'Ideas unavailable.', 'healthy leads alone cannot prove no qualified forecast exists')
assert.equal(ideasEmptyMessage('long', {
  ...trustedEmptySources,
  qualified: normalizeQualifiedIdeasBoard({
    ...qualifiedBoard,
    health: { ...qualifiedBoard.health, status: 'degraded' },
  }),
}), 'Ideas unavailable.', 'a degraded qualified source cannot support a clean empty claim')
assert.equal(ideasEmptyMessage('short', {
  ...trustedEmptySources,
  qualified: partlyMalformedQualifiedBoard,
}), 'Ideas unavailable.', 'a board with hidden malformed rows cannot support a clean empty claim')

assert.deepEqual(qualifiedIdeasOutcomeNotice({
  health: { status: 'healthy', outcome: 'none_clear', reason: 'All completed assessments failed at least one gate.' },
} as unknown as QualifiedIdeasBoard), {
  label: 'Full research: no idea clears the bar.',
  title: 'All completed assessments failed at least one gate.',
})
assert.equal(qualifiedIdeasOutcomeNotice({
  health: { status: 'healthy', outcome: 'qualified' },
} as unknown as QualifiedIdeasBoard), null)
assert.equal(qualifiedIdeasOutcomeNotice({
  health: { status: 'degraded', outcome: 'none_clear' },
} as unknown as QualifiedIdeasBoard), null)

assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'expired',
  outcome_health: { ...outcomeHealth, reason: 'Last pass expired at noon.' },
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), {
  label: 'Outcome checks are out of date.',
  title: 'Last pass expired at noon.',
})
assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'unknown', outcome_health: null,
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), {
  label: 'Outcome checks unavailable.',
  title: 'No trustworthy outcome-health check is available.',
})
assert.equal(qualifiedOutcomeHealthWarning({
  health: { status: 'pre_data' }, outcome_health_state: 'unknown', outcome_health: null,
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), null, 'a normal pre-data board stays quiet even before the first outcome loop')
assert.equal(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'valid', outcome_health: outcomeHealth,
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), null)
assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'valid', outcome_health: null,
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), {
  label: 'Outcome checks unavailable.',
  title: 'No trustworthy outcome-health check is available.',
})
assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'valid', outcome_health: outcomeHealth,
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T16:00:00Z')), {
  label: 'Outcome checks are out of date.',
  title: 'No forecast endpoint is due.',
}, 'a cached snapshot is expired locally even if its saved state still says valid')
assert.equal(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'valid',
  outcome_health: {
    ...outcomeHealth, status: 'pre_data', outcome: 'no_qualified_ideas', reason: 'No qualified cohort exists yet.',
    qualified_idea_count: 0, admission_count: 0, admission_existing_count: 0, not_due_count: 0,
  },
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), null, 'normal pre-data adds no extra banner')
assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'valid',
  outcome_health: {
    ...outcomeHealth, status: 'degraded', outcome: 'history_missing', reason: 'Price history is incomplete.',
    due_count: 1, unresolved_count: 1, missing_history: ['XYZ'],
  },
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), {
  label: 'Outcome checks degraded.',
  title: 'Price history is incomplete.',
})
assert.deepEqual(qualifiedOutcomeHealthWarning({
  outcome_health_state: 'valid',
  outcome_health: {
    ...outcomeHealth, status: 'error', outcome: 'provider_failed', reason: 'Market provider failed.',
    provider_failures: [{ symbol: 'XYZ', role: 'security', code: 'provider_timeout', reason: 'Provider timed out.' }],
  },
} as unknown as QualifiedIdeasBoard, Date.parse('2026-08-12T12:00:00Z')), {
  label: 'Outcome checks failed.',
  title: 'Market provider failed.',
})

assert.equal(
  qualifiedIdeaHorizonLabel({ start: '2026-08-12T00:00:00Z', end: '2027-02-12T00:00:00Z' }),
  '6mo forecast · Aug 12, 2026 → Feb 12, 2027',
)
assert.equal(qualifiedIdeaHorizonLabel({ start: 'bad', end: '2027-02-12T00:00:00Z' }), null)
assert.equal(
  qualifiedIdeaQuoteLabel({ price: 123.4567, as_of: '2026-08-12T21:00:00Z' }, 'usd'),
  'frozen quote USD 123.4567 · as of Aug 12, 2026',
)
assert.equal(qualifiedIdeaQuoteLabel({ price: 0, as_of: '2026-08-12T21:00:00Z' }, 'USD'), null)
assert.equal(
  qualifiedIdeaCatalystWindowLabel({ window_start: '2026-10-20T00:00:00Z', window_end: '2026-10-28T23:59:00Z' }),
  'Oct 20, 2026 → Oct 28, 2026',
)
assert.equal(qualifiedIdeaCatalystWindowLabel({ window_start: 'bad', window_end: '2026-10-28T23:59:00Z' }), null)

assert.deepEqual(ideaScorePresentation({ trade_score_basis: 'pre_edge_proxy_legacy' }), {
  label: 'pre-edge proxy',
  title: 'A legacy surface estimate — not trade readiness and not the locked edge score from full research.',
})
assert.equal(ideaScorePresentation({ trade_score_basis: 'evidence_gate_v2' }).label, 'trade readiness')

const qualifiedCardIdea = qualified('XYZ', 'long')
qualifiedCardIdea.candidate.run_root = 'analyses/XYZ_2026-08-12'
qualifiedCardIdea.candidate.quote = {
  ...qualifiedCardIdea.candidate.quote,
  price: 123.45,
  as_of: '2026-08-12T08:00:00Z',
  source: 'Primary exchange close',
}
qualifiedCardIdea.candidate.research = {
  ...qualifiedCardIdea.candidate.research,
  edge_proof: 'The market is missing a dated earnings inflection.',
  unresolved_red_flags: [
    { id: 'RF-1', severity: 'High', description: 'Debt covenant headroom is not proven.' },
    { id: 'RF-2', severity: 'Medium', description: 'Customer concentration remains elevated.' },
  ],
}
qualifiedCardIdea.candidate.catalyst = {
  ...qualifiedCardIdea.candidate.catalyst,
  name: 'Q4 results',
  window_start: '2026-10-20T00:00:00Z',
  window_end: '2026-10-28T23:59:00Z',
  bullish_trigger: 'Revenue growth exceeds 12% and guidance rises.',
  bearish_trigger: 'Revenue growth falls below 5% or guidance is cut.',
  source: 'FY26 Q3 filing',
}
qualifiedCardIdea.candidate.falsifier = {
  ...qualifiedCardIdea.candidate.falsifier,
  condition: 'Net retention falls below 100%.',
  deadline: '2026-12-01T00:00:00Z',
  source: 'FY26 forecast ledger',
}
qualifiedCardIdea.candidate.scenarios = [
  {
    scenario_id: 'bear', label: 'Bear', probability_pct: 20, price_target: 111.105, source_price_target: 111.105,
    conditions: ['Growth stalls.', 'Margins contract.'], source: 'FY26 downside case', joint_probability_basis: 'Both conditions reflect one recession state.',
  },
  {
    scenario_id: 'base', label: 'Base', probability_pct: 50, price_target: 160.485, source_price_target: 160.485,
    conditions: ['Guidance is met.'], source: 'FY26 valuation summary', joint_probability_basis: null,
  },
  {
    scenario_id: 'bull', label: 'Bull', probability_pct: 30, price_target: 209.865, source_price_target: 209.865,
    conditions: ['Growth exceeds guidance.'], source: 'FY26 valuation summary', joint_probability_basis: null,
  },
]
qualifiedCardIdea.metrics = {
  ...qualifiedCardIdea.metrics!,
  expected_return_pct: 34,
  worst_case_loss_pct: 10,
  loss_probability_pct: 20,
  tail_loss_pct: 10,
  best_case_return_pct: 70,
  scenario_returns: [
    { label: 'Bear', probability_pct: 20, return_pct: -10 },
    { label: 'Base', probability_pct: 50, return_pct: 30 },
    { label: 'Bull', probability_pct: 30, return_pct: 70 },
  ],
}
qualifiedCardIdea.ranking = {
  ...qualifiedCardIdea.ranking!,
  calibration_status: 'pre_data',
  raw_expected_return_pct: 34,
  conservative_expected_return_pct: 11.9,
  evidence_confidence_score: 42,
}
qualifiedCardIdea.calibration_note = 'Pre-data: probabilities and policy thresholds are auditable priors until enough exact-horizon outcomes resolve.'

assert.deepEqual(qualifiedIdeaSourceRows(qualifiedCardIdea.candidate), [
  { label: 'Research decision', source: 'analyses/XYZ_2026-08-12' },
  { label: 'Quote', source: 'Primary exchange close' },
  { label: 'Catalyst', source: 'FY26 Q3 filing' },
  { label: 'Falsifier', source: 'FY26 forecast ledger' },
  { label: 'Scenarios', source: 'FY26 downside case · FY26 valuation summary' },
])
assert.deepEqual(qualifiedIdeaCalibrationPresentation(qualifiedCardIdea), {
  label: 'pre-data probabilities · not calibrated · evidence confidence 42/100',
  note: 'Pre-data: probabilities and policy thresholds are auditable priors until enough exact-horizon outcomes resolve.',
  warning: true,
})
const calibratedIdea = qualified('calibrated', 'long')
calibratedIdea.candidate.research.calibration_status = 'calibrated'
calibratedIdea.ranking = { ...calibratedIdea.ranking!, calibration_status: 'calibrated', evidence_confidence_cap: 80, evidence_confidence_score: 78 }
calibratedIdea.calibration_note = 'Forecast errors are measured against resolved outcomes.'
assert.deepEqual(qualifiedIdeaCalibrationPresentation(calibratedIdea), {
  label: 'unsupported calibration state · evidence confidence 78/100',
  note: 'Forecast errors are measured against resolved outcomes.',
  warning: true,
})
const qualifiedCardHtml = renderToStaticMarkup(createElement(QualifiedIdeaCard, {
  idea: qualifiedCardIdea,
  policy: qualifiedBoard.policy,
  nowMs,
}))
assert.match(qualifiedCardHtml, /policy-adjusted \+11\.9%/)
assert.match(qualifiedCardHtml, /pre-data probabilities · not calibrated · evidence confidence 42\/100/)
assert.match(qualifiedCardHtml, /Calibration note —<\/span> Pre-data: probabilities and policy thresholds are auditable priors until enough exact-horizon outcomes resolve\./)
assert.match(qualifiedCardHtml, /frozen quote USD 123\.45 · as of Aug 12, 2026/)
assert.match(qualifiedCardHtml, /4mo forecast · Aug 12, 2026 → Dec 10, 2026/)
assert.match(qualifiedCardHtml, /Q4 results/)
assert.match(qualifiedCardHtml, /Oct 20, 2026 → Oct 28, 2026/)
assert.match(qualifiedCardHtml, /Catalyst triggers/)
assert.match(qualifiedCardHtml, /Revenue growth exceeds 12% and guidance rises\./)
assert.match(qualifiedCardHtml, /Revenue growth falls below 5% or guidance is cut\./)
assert.match(qualifiedCardHtml, /falsifier by Dec 1, 2026/)
assert.match(qualifiedCardHtml, /Net retention falls below 100%\./)
assert.match(qualifiedCardHtml, /worst case 10\.0% loss/)
assert.match(qualifiedCardHtml, /loss chance 20\.0%/)
assert.match(qualifiedCardHtml, /tail loss 10\.0%/)
assert.match(qualifiedCardHtml, /Scenarios \(3\)/)
assert.match(qualifiedCardHtml, /<strong>Bear<\/strong> · 20\.0% probability · target USD 111\.105 · return -10\.0%/)
assert.match(qualifiedCardHtml, /Growth stalls\./)
assert.match(qualifiedCardHtml, /Margins contract\./)
assert.match(qualifiedCardHtml, /Joint probability basis —<\/span> Both conditions reflect one recession state\./)
assert.match(qualifiedCardHtml, /2 unresolved risks/)
assert.match(qualifiedCardHtml, /<strong>High<\/strong> — Debt covenant headroom is not proven\./)
assert.match(qualifiedCardHtml, /<strong>Medium<\/strong> — Customer concentration remains elevated\./)
assert.match(qualifiedCardHtml, /Evidence sources/)
assert.match(qualifiedCardHtml, /Primary exchange close/)
assert.match(qualifiedCardHtml, /FY26 Q3 filing/)
assert.match(qualifiedCardHtml, /FY26 forecast ledger/)
assert.match(qualifiedCardHtml, /FY26 downside case · FY26 valuation summary/)

const refreshCardHtml = renderToStaticMarkup(createElement(QualifiedIdeaCard, {
  idea: qualified('expired-forecast', 'long'),
  policy: qualifiedBoard.policy,
  evaluatedAtMs: nowMs,
  nowMs: Date.parse('2026-12-11T12:00:00Z'),
}))
assert.match(refreshCardHtml, /Refresh required · frozen forecast only/)
assert.match(refreshCardHtml, /<li>catalyst is no longer proven scheduled and unresolved<\/li>/)
assert.match(refreshCardHtml, /<li>falsifier deadline passed<\/li>/)
assert.match(refreshCardHtml, /<li>holding horizon ended<\/li>/)
assert.equal(
  renderToStaticMarkup(createElement(QualifiedIdeaCard, { idea: {} as QualifiedIdeaEvaluation })),
  '',
  'a malformed qualified row is excluded instead of crashing during nested reads',
)
const malformedMetricIdea = qualified('bad-metric', 'long') as unknown as { metrics: Record<string, unknown> }
malformedMetricIdea.metrics.tail_loss_pct = 'not-a-number'
assert.equal(
  renderToStaticMarkup(createElement(QualifiedIdeaCard, { idea: malformedMetricIdea as unknown as QualifiedIdeaEvaluation })),
  '',
  'a malformed risk metric is excluded before toFixed can throw',
)

const sourceThemes = [{ theme_id: 'THM-1', theme_rev: 3 }]
assert.deepEqual(
  ideaThemeAttribution({ origin_type: 'theme', source_themes: sourceThemes }),
  {
    label: 'found through Themes',
    title: 'This lead entered the skim through a theme that cleared the evidence gate',
  },
)
assert.deepEqual(
  ideaThemeAttribution({ origin_type: 'mixed', source_themes: sourceThemes }),
  {
    label: 'theme corroborated',
    title: 'This lead appeared on the wire and was corroborated by a theme that cleared the evidence gate',
  },
)
assert.equal(ideaThemeAttribution({ origin_type: 'wire', source_themes: sourceThemes }), null)
assert.equal(ideaThemeAttribution({ origin_type: 'theme', source_themes: [] }), null)

console.log('BestIdeasView tabs, side filtering, and theme-attribution tests passed')
