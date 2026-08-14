// Deterministic qualification for the 3-6 month Ideas board.
//
// The news skim is a high-recall LEAD generator. It must never become an investment idea merely because
// an LLM used confident language. A qualified idea is a separate, machine-checkable artifact: verified
// security identity and liquidity, a fresh price, a loss-bearing 90-183 day scenario distribution, a
// dated catalyst, a settleable falsifier, sufficient research, and no unresolved integrity/risk lock.
//
// This module intentionally does NOT emit one opaque "idea score". With little realised history, a
// weighted score would turn uncalibrated preferences into false precision. Qualified ideas are placed on
// risk/return Pareto layers instead: an idea is dominated only when another offers at least as much
// calibration-haircut expected return with no more tail loss, worst-case loss, or loss probability.
// Within each frontier, independently bounded evidence confidence orders the ideas. That keeps the
// "maximum upside / minimum downside" trade-off visible without hiding one risk dimension in a score.

import { parseRfc3339Ms } from './rfc3339'
import { z } from 'zod'

export const QUALIFIED_IDEA_SCHEMA = 'qualified-idea/v1' as const
export const IDEA_ASSESSMENT_SCHEMA = 'idea-assessment/v1' as const
export const QUALIFICATION_POLICY_VERSION = 'ideas-policy/precal-v1' as const
export const QUALIFIED_IDEA_RANKING_POLICY_V1 = 'ideas-ranking/calibration-shrinkage-v1' as const
export const QUALIFIED_IDEA_RANKING_POLICY_VERSION = 'ideas-ranking/calibration-shrinkage-v2' as const
export type QualifiedIdeaRankingPolicyVersion =
  | typeof QUALIFIED_IDEA_RANKING_POLICY_V1
  | typeof QUALIFIED_IDEA_RANKING_POLICY_VERSION

export type IdeaDirection = 'long' | 'short'
export type QualificationStatus = 'qualified' | 'needs_research' | 'does_not_clear'
export type IdeaCalibrationStatus = 'pre_data' | 'insufficient' | 'measured' | 'calibrated'

export interface QualificationPolicy {
  horizonMinDays: number
  horizonMaxDays: number
  entryMaxSkewDays: number
  quoteMaxAgeDays: number
  liquidityMaxAgeDays: number
  liquidityLookbackMinDays: number
  liquidityMinCoveragePct: number
  marketRiskLookbackMinDays: number
  minMedianDailyValueUsd: number
  minDataSufficiency: number
  minEdgeScore: number
  minExpectedReturnPct: number
  maxTailLossPct: number
  maxWorstCaseLossPct: number
  minAdverseProbabilityPct: number
  minAdverseMovePct: number
  minAdverseVsOrdinaryMove: number
  minFavorableVsOrdinaryMove: number
  tailProbabilityPct: number
  probabilityTolerancePct: number
  returnReconciliationTolerancePct: number
}

// Conservative pre-calibration priors. They are isolated here so the outcome loop can replace them from
// realised 90/180-day cohorts later; they are policy gates, not claimed empirical optima.
const PRECAL_V1_POLICY: Readonly<QualificationPolicy> = Object.freeze({
  horizonMinDays: 90,
  horizonMaxDays: 183,
  entryMaxSkewDays: 3,
  quoteMaxAgeDays: 7, // about five trading days, weekend-safe
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
})
export const QUALIFICATION_POLICIES: Readonly<Record<string, Readonly<QualificationPolicy>>> = Object.freeze({
  [QUALIFICATION_POLICY_VERSION]: PRECAL_V1_POLICY,
})
export const DEFAULT_QUALIFICATION_POLICY = PRECAL_V1_POLICY

export interface CalibrationRankingRule {
  positiveReturnRetention: number
  evidenceInputFloor: number
  evidenceConfidenceAtFloor: number
  evidenceConfidenceCap: number
  rationale: string
}

// Ranking is deliberately more skeptical than admission. A candidate may clear the raw 10% expected-
// return gate while its scenario probabilities are still priors. We therefore retain only part of a
// positive forecast until exact-horizon outcomes validate the probability model. Negative forecasts are
// never reduced: shrinking a forecast loss toward zero would make a weak idea look safer. Evidence
// confidence starts with the weaker of data sufficiency and proven edge. A hard 50 cap alone would make
// every production-qualified idea tie at exactly 50 because the admission floor is already 50. Instead,
// the uncalibrated input is monotonically compressed: the 50-point evidence floor maps to 40, perfect
// evidence maps to the 50-point cap, and sub-floor evidence is scaled down on the same conservative
// basis. This preserves evidence ordering without pretending probability calibration is proven. These
// are policy constants, not fitted coefficients; changing them requires a new policy version so an
// earlier frontier remains reproducible.
const CALIBRATION_SHRINKAGE_V2_RULES: Readonly<Record<IdeaCalibrationStatus, Readonly<CalibrationRankingRule>>> = Object.freeze({
  pre_data: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'No exact-horizon outcomes have resolved, so only 35% of each positive scenario return is retained while losses remain fully counted; evidence is compressed into a conservative 0-50 confidence band.',
  }),
  insufficient: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'Some outcomes exist but the cohort is too small or narrow to learn from, so the scenario-level upside haircut remains in force and losses remain fully counted.',
  }),
  measured: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'The sample is large enough to measure, but measurement alone does not prove forecast skill, so the scenario-level upside haircut remains in force and losses remain fully counted.',
  }),
  calibrated: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'Calibrated is reserved until an out-of-sample quality gate exists; the scenario-level upside haircut remains in force and losses remain fully counted.',
  }),
})
// V1 is retained as a replay boundary for any board or audit snapshot produced while that policy was
// under evaluation. Its return algorithm haircuts a positive NET expected return. V2 supersedes it for
// live ranking because V1 also softened the loss scenarios embedded in that net number.
const CALIBRATION_SHRINKAGE_V1_RULES: Readonly<Record<IdeaCalibrationStatus, Readonly<CalibrationRankingRule>>> = Object.freeze({
  pre_data: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'No exact-horizon outcomes have resolved, so 65% of claimed upside is removed and evidence is compressed into a conservative 0-50 confidence band.',
  }),
  insufficient: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'Some outcomes exist but the cohort is too small or narrow to learn from, so the pre-data haircut remains in force.',
  }),
  measured: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'The sample is large enough to measure, but measurement alone does not prove forecast skill, so the pre-data haircut remains in force.',
  }),
  calibrated: Object.freeze({
    positiveReturnRetention: 0.35,
    evidenceInputFloor: 50,
    evidenceConfidenceAtFloor: 40,
    evidenceConfidenceCap: 50,
    rationale: 'Calibrated is reserved until an out-of-sample quality gate exists; the pre-data haircut remains in force.',
  }),
})
export const QUALIFIED_IDEA_RANKING_POLICIES: Readonly<Record<string, Readonly<Record<IdeaCalibrationStatus, Readonly<CalibrationRankingRule>>>>> = Object.freeze({
  [QUALIFIED_IDEA_RANKING_POLICY_V1]: CALIBRATION_SHRINKAGE_V1_RULES,
  [QUALIFIED_IDEA_RANKING_POLICY_VERSION]: CALIBRATION_SHRINKAGE_V2_RULES,
})
// Backward-compatible name for callers that inspect the active policy. The versioned registry above is
// the replay boundary: changing these constants requires a new policy key, never an in-place relabel.
export const QUALIFIED_IDEA_CALIBRATION_RANKING_RULES = CALIBRATION_SHRINKAGE_V2_RULES

export interface QualifiedIdeaCandidate {
  schema_version: typeof QUALIFIED_IDEA_SCHEMA
  // Kept as a string so a future default can retain earlier policy versions in the registry and grade
  // their frozen cohorts without reclassifying them under today's thresholds.
  policy_version: string
  idea_id: string
  market_evidence_sha256: string
  projection_manifest_sha256: string
  run_root: string
  decision_date: string
  created_at: string
  instrument: {
    ticker: string
    company: string
    exchange: string
    currency: string
    direction: IdeaDirection
    asset_type: 'equity'
  }
  horizon: {
    start: string
    end: string
  }
  quote: {
    price: number
    as_of: string
    source: string
    identity_verified: boolean
    stale: boolean
  }
  liquidity: {
    verified: boolean
    as_of: string
    source: string
    lookback_days: number
    observed_sessions: number
    coverage_pct: number
    window_start: string
    window_end: string
    median_daily_value_usd: number
    currency_conversion: {
      pair: string
      rate_usd_per_currency: number
      as_of: string
      source: string
    }
  }
  market_risk: {
    as_of: string
    source: string
    lookback_days: number
    ordinary_move_pct: number
  }
  research: {
    decision: string
    integrity_status: 'verified' | 'provisional' | 'unaudited'
    data_sufficiency_score: number
    edge_score: number
    edge_proof: string
    hard_cap_active: boolean
    hard_cap_reason: string | null
    unresolved_red_flags: Array<{ id: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; description: string }>
    calibration_status: IdeaCalibrationStatus
  }
  catalyst: {
    forecast_id: string
    name: string
    window_start: string
    window_end: string
    source: string
    status_at_admission: 'scheduled_unresolved'
    status_as_of: string
    causal_steps: string[]
    bullish_trigger: string
    bearish_trigger: string
  }
  falsifier: {
    condition: string
    metric: string
    threshold: string
    deadline: string
    source: string
  }
  valuation_bridge: {
    source_horizon_days: number
    method: 'same_horizon' | 'catalyst_partial_convergence' | 'event_payoff' | 'other'
    convergence_fraction: number | null
    rationale: string
    source: string
  }
  scenarios: Array<{
    scenario_id: string
    label: string
    probability_pct: number
    price_target: number
    source_price_target: number
    return_pct?: number | null
    conditions: string[]
    source: string
    joint_probability_basis?: string | null
  }>
}

/** The synthesizer writes this wrapper on EVERY new full run, including an honest no-candidate result. */
export interface IdeaAssessment {
  schema_version: typeof IDEA_ASSESSMENT_SCHEMA
  assessment_id: string
  run_root: string
  created_at: string
  ticker: string
  company: string | null
  status: 'candidate' | 'not_assessable'
  gaps: string[]
  candidate: QualifiedIdeaCandidate | null
}

const strictText = z.string().min(1)
const score = z.number().finite().min(0).max(100)
const redFlagSchema = z.object({
  id: strictText,
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
  description: strictText,
}).strict()

/** Runtime mirror of the producer contract. `.strict()` makes additional JSON keys fail closed too. */
export const qualifiedIdeaCandidateRuntimeSchema: z.ZodType<QualifiedIdeaCandidate> = z.object({
  schema_version: z.literal(QUALIFIED_IDEA_SCHEMA),
  policy_version: strictText,
  idea_id: strictText,
  market_evidence_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  projection_manifest_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  run_root: strictText,
  decision_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  created_at: strictText,
  instrument: z.object({
    ticker: strictText,
    company: strictText,
    exchange: strictText,
    currency: strictText,
    direction: z.enum(['long', 'short']),
    asset_type: z.literal('equity'),
  }).strict(),
  horizon: z.object({ start: strictText, end: strictText }).strict(),
  quote: z.object({
    price: z.number().finite().positive(),
    as_of: strictText,
    source: strictText,
    identity_verified: z.boolean(),
    stale: z.boolean(),
  }).strict(),
  liquidity: z.object({
    verified: z.boolean(),
    as_of: strictText,
    source: strictText,
    lookback_days: z.number().int().nonnegative(),
    observed_sessions: z.number().int().nonnegative(),
    coverage_pct: z.number().finite().min(0).max(100),
    window_start: strictText,
    window_end: strictText,
    median_daily_value_usd: z.number().finite().nonnegative(),
    currency_conversion: z.object({
      pair: strictText,
      rate_usd_per_currency: z.number().finite().positive(),
      as_of: strictText,
      source: strictText,
    }).strict(),
  }).strict(),
  market_risk: z.object({
    as_of: strictText,
    source: strictText,
    lookback_days: z.number().int().nonnegative(),
    ordinary_move_pct: z.number().finite().positive(),
  }).strict(),
  research: z.object({
    decision: strictText,
    integrity_status: z.enum(['verified', 'provisional', 'unaudited']),
    data_sufficiency_score: score,
    edge_score: score,
    edge_proof: z.string().min(20),
    hard_cap_active: z.boolean(),
    hard_cap_reason: z.string().min(1).nullable(),
    unresolved_red_flags: z.array(redFlagSchema),
    calibration_status: z.enum(['pre_data', 'insufficient', 'measured', 'calibrated']),
  }).strict(),
  catalyst: z.object({
    forecast_id: strictText,
    name: strictText,
    window_start: strictText,
    window_end: strictText,
    source: strictText,
    status_at_admission: z.literal('scheduled_unresolved'),
    status_as_of: strictText,
    causal_steps: z.array(z.string().min(10)).min(2),
    bullish_trigger: z.string().min(10),
    bearish_trigger: z.string().min(10),
  }).strict(),
  falsifier: z.object({
    condition: z.string().min(20),
    metric: strictText,
    threshold: strictText,
    deadline: strictText,
    source: strictText,
  }).strict(),
  valuation_bridge: z.object({
    source_horizon_days: z.number().int().positive(),
    method: z.enum(['same_horizon', 'catalyst_partial_convergence', 'event_payoff', 'other']),
    convergence_fraction: z.number().finite().positive().max(1).nullable(),
    rationale: z.string().min(20),
    source: strictText,
  }).strict(),
  scenarios: z.array(z.object({
    scenario_id: strictText,
    label: strictText,
    probability_pct: z.number().finite().positive().max(100),
    price_target: z.number().finite().positive(),
    source_price_target: z.number().finite().positive(),
    return_pct: z.number().finite().nullable().optional(),
    conditions: z.array(z.string().min(5)).min(1),
    source: strictText,
    joint_probability_basis: z.string().min(1).nullable().optional(),
  }).strict()).min(3).max(7),
}).strict()

export const ideaAssessmentRuntimeSchema: z.ZodType<IdeaAssessment> = z.object({
  schema_version: z.literal(IDEA_ASSESSMENT_SCHEMA),
  assessment_id: strictText,
  run_root: strictText,
  created_at: strictText,
  ticker: strictText,
  company: strictText.nullable(),
  status: z.enum(['candidate', 'not_assessable']),
  gaps: z.array(strictText),
  candidate: qualifiedIdeaCandidateRuntimeSchema.nullable(),
}).strict().superRefine((value, ctx) => {
  const validCandidate = value.status === 'candidate' && value.candidate !== null && value.gaps.length === 0
  const validGap = value.status === 'not_assessable' && value.candidate === null && value.gaps.length > 0
  if (!validCandidate && !validGap) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Assessment status, candidate, and gaps do not reconcile.' })
  if (value.status === 'candidate' && value.candidate?.research.calibration_status !== 'pre_data') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Producer calibration status must be pre_data.' })
  }
})

export type QualificationIssueCode =
  | 'invalid_schema'
  | 'invalid_policy_version'
  | 'invalid_provenance'
  | 'invalid_identity'
  | 'invalid_market_evidence'
  | 'short_execution_unverified'
  | 'invalid_horizon'
  | 'entry_time_mismatch'
  | 'stale_quote'
  | 'unverified_quote'
  | 'unverified_liquidity'
  | 'thin_liquidity'
  | 'missing_market_risk'
  | 'non_actionable_decision'
  | 'decision_direction_mismatch'
  | 'authoritative_research_mismatch'
  | 'authoritative_market_mismatch'
  | 'research_not_verified'
  | 'invalid_risk_state'
  | 'invalid_calibration_state'
  | 'low_data_sufficiency'
  | 'low_edge'
  | 'missing_edge_proof'
  | 'hard_rating_cap'
  | 'critical_red_flag'
  | 'invalid_catalyst'
  | 'invalid_falsifier'
  | 'missing_horizon_bridge'
  | 'invalid_scenarios'
  | 'scenario_probability_sum'
  | 'scenario_return_mismatch'
  | 'scenario_conjunction_unjustified'
  | 'scenario_no_real_loss'
  | 'scenario_span_too_narrow'
  | 'expected_return_below_bar'
  | 'conservative_return_below_bar'
  | 'tail_loss_above_budget'
  | 'worst_case_loss_above_budget'

export interface QualificationIssue {
  code: QualificationIssueCode
  message: string
  disposition: 'research' | 'reject'
}

export interface QualifiedIdeaMetrics {
  expected_return_pct: number
  loss_probability_pct: number
  worst_case_loss_pct: number
  tail_loss_pct: number
  best_case_return_pct: number
  probability_sum_pct: number
  scenario_returns: Array<{ label: string; probability_pct: number; return_pct: number }>
}

export interface QualifiedIdeaRanking {
  policy_version: QualifiedIdeaRankingPolicyVersion
  calibration_status: IdeaCalibrationStatus
  raw_expected_return_pct: number
  positive_return_retention: number
  return_haircut_pct: number
  conservative_expected_return_pct: number
  uncapped_evidence_confidence_score: number
  evidence_confidence_cap: number
  evidence_confidence_score: number
  rationale: string
}

export interface QualifiedIdeaEvaluation {
  candidate: QualifiedIdeaCandidate
  status: QualificationStatus
  issues: QualificationIssue[]
  metrics: QualifiedIdeaMetrics | null
  ranking: QualifiedIdeaRanking | null
  pareto_layer: number | null
  calibration_note: string
  admission?: {
    admission_id: string
    admission_sha256: string
    candidate_sha256: string
    frozen_at: string
  }
}

const DAY_MS = 86_400_000
const CLOCK_SKEW_MS = 5 * 60_000
const ACTIONABLE = new Set(['Strong Buy', 'Buy', 'Starter Position Only', 'Short Candidate'])

function finite(v: unknown): v is number { return typeof v === 'number' && Number.isFinite(v) }
function dateMs(v: unknown): number {
  return parseRfc3339Ms(v)
}
function nonBlank(v: unknown, min = 1): boolean { return typeof v === 'string' && v.trim().length >= min }
function round(n: number, places = 2): number {
  const p = 10 ** places
  return Math.round((n + Number.EPSILON) * p) / p
}

function positionReturn(direction: IdeaDirection, entry: number, target: number): number {
  const longReturn = ((target - entry) / entry) * 100
  return direction === 'long' ? longReturn : -longReturn
}

/**
 * Expected loss magnitude over the worst `tailPct` probability mass of a discrete distribution.
 * Favorable rows inside a partially filled tail contribute zero loss; they can never cancel a worse
 * row. That matters when a rare near-total loss is followed by a large favorable state.
 */
export function expectedShortfallLoss(
  scenarios: Array<{ probability_pct: number; return_pct: number }>,
  tailPct: number,
): number {
  if (!finite(tailPct) || tailPct <= 0 || tailPct > 100) return NaN
  let remaining = tailPct
  let weighted = 0
  for (const row of [...scenarios].sort((a, b) => a.return_pct - b.return_pct)) {
    if (remaining <= 0) break
    const take = Math.min(remaining, row.probability_pct)
    if (take > 0) weighted += Math.max(0, -row.return_pct) * take
    remaining -= take
  }
  if (remaining > 1e-9) return NaN
  return weighted / tailPct
}

function metricsFor(candidate: QualifiedIdeaCandidate, policy: QualificationPolicy): QualifiedIdeaMetrics | null {
  const entry = candidate?.quote?.price
  const scenarios = candidate?.scenarios
  if (!finite(entry) || entry <= 0 || !Array.isArray(scenarios) || !scenarios.length) return null
  const returns: Array<{ label: string; probability_pct: number; return_pct: number }> = []
  for (const s of scenarios) {
    if (
      !nonBlank(s?.label) || !finite(s?.probability_pct) || s.probability_pct <= 0 || s.probability_pct > 100 ||
      !finite(s?.price_target) || s.price_target <= 0 || !finite(s?.source_price_target) || s.source_price_target <= 0
    ) return null
    returns.push({
      label: s.label.trim(),
      probability_pct: s.probability_pct,
      return_pct: positionReturn(candidate.instrument.direction, entry, s.price_target),
    })
  }
  const probabilitySum = returns.reduce((n, s) => n + s.probability_pct, 0)
  const expected = returns.reduce((n, s) => n + (s.probability_pct / 100) * s.return_pct, 0)
  const lossProbability = returns.filter((s) => s.return_pct < 0).reduce((n, s) => n + s.probability_pct, 0)
  const worst = Math.max(0, -Math.min(...returns.map((s) => s.return_pct)))
  const best = Math.max(...returns.map((s) => s.return_pct))
  const tail = expectedShortfallLoss(returns, policy.tailProbabilityPct)
  if (![probabilitySum, expected, lossProbability, worst, best, tail].every(finite)) return null
  return {
    expected_return_pct: round(expected),
    loss_probability_pct: round(lossProbability),
    worst_case_loss_pct: round(worst),
    tail_loss_pct: round(tail),
    best_case_return_pct: round(best),
    probability_sum_pct: round(probabilitySum, 4),
    scenario_returns: returns.map((s) => ({ ...s, return_pct: round(s.return_pct) })),
  }
}

export function qualifiedIdeaRankingForPolicy(
  candidate: QualifiedIdeaCandidate,
  metrics: QualifiedIdeaMetrics | null,
  policyVersion: string,
): QualifiedIdeaRanking | null {
  if (!metrics) return null
  const calibrationStatus = candidate?.research?.calibration_status
  const rule = QUALIFIED_IDEA_RANKING_POLICIES[policyVersion]?.[calibrationStatus]
  const dataSufficiency = candidate?.research?.data_sufficiency_score
  const edge = candidate?.research?.edge_score
  if (!rule || !finite(dataSufficiency) || !finite(edge)
    || (policyVersion !== QUALIFIED_IDEA_RANKING_POLICY_V1 && policyVersion !== QUALIFIED_IDEA_RANKING_POLICY_VERSION)) return null

  const rawExpectedReturn = metrics.expected_return_pct
  const conservativeExpectedReturn = policyVersion === QUALIFIED_IDEA_RANKING_POLICY_V1
    ? rawExpectedReturn > 0 ? rawExpectedReturn * rule.positiveReturnRetention : rawExpectedReturn
    : metrics.scenario_returns.reduce((sum, scenario) => {
      const adjustedReturn = scenario.return_pct > 0
        ? scenario.return_pct * rule.positiveReturnRetention
        : scenario.return_pct
      return sum + (scenario.probability_pct / 100) * adjustedReturn
    }, 0)
  const uncappedEvidenceConfidence = Math.min(dataSufficiency, edge)
  const evidenceConfidence = uncappedEvidenceConfidence <= rule.evidenceInputFloor
    ? uncappedEvidenceConfidence * (rule.evidenceConfidenceAtFloor / rule.evidenceInputFloor)
    : rule.evidenceConfidenceAtFloor +
      ((uncappedEvidenceConfidence - rule.evidenceInputFloor) / (100 - rule.evidenceInputFloor)) *
      (rule.evidenceConfidenceCap - rule.evidenceConfidenceAtFloor)
  return {
    policy_version: policyVersion,
    calibration_status: calibrationStatus,
    raw_expected_return_pct: rawExpectedReturn,
    positive_return_retention: rule.positiveReturnRetention,
    return_haircut_pct: round((1 - rule.positiveReturnRetention) * 100),
    conservative_expected_return_pct: round(conservativeExpectedReturn),
    uncapped_evidence_confidence_score: round(uncappedEvidenceConfidence),
    evidence_confidence_cap: rule.evidenceConfidenceCap,
    evidence_confidence_score: round(Math.min(evidenceConfidence, rule.evidenceConfidenceCap)),
    rationale: rule.rationale,
  }
}

function rankingFor(candidate: QualifiedIdeaCandidate, metrics: QualifiedIdeaMetrics | null): QualifiedIdeaRanking | null {
  return qualifiedIdeaRankingForPolicy(candidate, metrics, QUALIFIED_IDEA_RANKING_POLICY_VERSION)
}

function add(issues: QualificationIssue[], code: QualificationIssueCode, message: string, disposition: QualificationIssue['disposition']): void {
  if (!issues.some((x) => x.code === code)) issues.push({ code, message, disposition })
}

/**
 * Evaluate one already-structured candidate. This is pure and fail-closed: malformed or absent evidence
 * cannot produce `qualified`. `nowMs` is injected so replay/backtests never leak the wall clock.
 */
export function evaluateQualifiedIdea(
  candidate: QualifiedIdeaCandidate,
  opts: { nowMs?: number; policy?: Partial<QualificationPolicy> } = {},
): QualifiedIdeaEvaluation {
  const nowMs = opts.nowMs ?? Date.now()
  const frozenPolicy = QUALIFICATION_POLICIES[candidate?.policy_version]
  // The fallback lets the evaluator continue collecting every other issue on an unknown version; the
  // invalid-policy issue below still prevents qualification.
  const policy: QualificationPolicy = { ...(frozenPolicy ?? DEFAULT_QUALIFICATION_POLICY), ...(opts.policy ?? {}) }
  const issues: QualificationIssue[] = []

  if (!qualifiedIdeaCandidateRuntimeSchema.safeParse(candidate).success) add(issues, 'invalid_schema', `Candidate does not satisfy the strict ${QUALIFIED_IDEA_SCHEMA} runtime contract.`, 'research')
  if (!frozenPolicy) add(issues, 'invalid_policy_version', `Admission policy ${String(candidate?.policy_version || '(missing)')} is not registered.`, 'research')
  const createdAt = dateMs(candidate?.created_at)
  const runDate = String(candidate?.run_root ?? '').match(/_(\d{4}-\d{2}-\d{2})$/)?.[1]
  const runDayStart = Date.parse(`${candidate?.decision_date ?? ''}T00:00:00Z`)
  const runDaySkewMs = 14 * 60 * 60_000 // covers every real IANA UTC offset without assuming the host timezone
  if (!nonBlank(candidate?.idea_id) || !/^analyses\/[^/]+_\d{4}-\d{2}-\d{2}$/.test(String(candidate?.run_root ?? '')) || !finite(createdAt) || createdAt > nowMs + CLOCK_SKEW_MS || runDate !== candidate?.decision_date || !finite(runDayStart) || createdAt < runDayStart - runDaySkewMs || createdAt > runDayStart + DAY_MS + runDaySkewMs) {
    add(issues, 'invalid_provenance', 'The idea needs a stable id, a valid creation time, and one explicit decision date matching the dated research run.', 'research')
  }
  if (!/^[a-f0-9]{64}$/.test(String(candidate?.market_evidence_sha256 ?? ''))) {
    add(issues, 'invalid_market_evidence', 'The candidate must reference one canonical frozen market-evidence snapshot.', 'research')
  }
  if (!/^[a-f0-9]{64}$/.test(String(candidate?.projection_manifest_sha256 ?? ''))) {
    add(issues, 'invalid_provenance', 'The candidate must reference the immutable post-audit projection manifest.', 'research')
  }
  const instrument = candidate?.instrument
  if (!/^[-A-Z0-9.]{1,24}$/.test(String(instrument?.ticker ?? '')) || !nonBlank(instrument?.company) || !nonBlank(instrument?.exchange) || !/^[A-Z]{3}$/.test(String(instrument?.currency ?? '')) || !['long', 'short'].includes(String(instrument?.direction)) || instrument?.asset_type !== 'equity') {
    add(issues, 'invalid_identity', 'Ticker, company, exchange, currency, direction, and equity asset type must identify one listed stock.', 'research')
  }
  // v1 deliberately carries no source-bound borrow availability, recall risk, or borrow fee. Until that
  // execution contract exists, a mathematically attractive short is research output, not an executable
  // qualified idea; silently assuming borrow would understate its downside and expected cost.
  if (instrument?.direction === 'short') {
    add(issues, 'short_execution_unverified', 'Short candidates require source-bound borrow availability, recall risk, and borrow cost; the v1 artifact does not carry them.', 'reject')
  }

  const horizonStart = dateMs(candidate?.horizon?.start)
  const horizonEnd = dateMs(candidate?.horizon?.end)
  const horizonDays = (horizonEnd - horizonStart) / DAY_MS
  if (!finite(horizonStart) || !finite(horizonEnd) || horizonEnd <= horizonStart || horizonDays < policy.horizonMinDays || horizonDays > policy.horizonMaxDays) {
    add(issues, 'invalid_horizon', `Holding window must be ${policy.horizonMinDays}-${policy.horizonMaxDays} days.`, 'research')
  }

  const quote = candidate?.quote
  const quoteAt = dateMs(quote?.as_of)
  if (!finite(quote?.price) || quote.price <= 0 || !nonBlank(quote?.source) || quote?.identity_verified !== true || quote?.stale !== false) {
    add(issues, 'unverified_quote', 'A positive, source-bound quote with verified security identity is required.', 'research')
  }
  if (!finite(quoteAt) || quote?.stale === true || nowMs - quoteAt > policy.quoteMaxAgeDays * DAY_MS || quoteAt > nowMs + CLOCK_SKEW_MS || (finite(createdAt) && quoteAt > createdAt + CLOCK_SKEW_MS)) {
    add(issues, 'stale_quote', `Quote must be no more than ${policy.quoteMaxAgeDays} calendar days old.`, 'research')
  }
  if (
    !finite(horizonStart) || !finite(quoteAt) || !finite(createdAt) ||
    horizonStart < createdAt || horizonStart < quoteAt ||
    horizonStart - quoteAt > policy.entryMaxSkewDays * DAY_MS ||
    horizonStart - createdAt > policy.entryMaxSkewDays * DAY_MS
  ) {
    add(issues, 'entry_time_mismatch', `The holding-period start, frozen quote, and artifact creation must agree within ${policy.entryMaxSkewDays} days.`, 'research')
  }

  const liquidity = candidate?.liquidity
  const liquidityAt = dateMs(liquidity?.as_of)
  const liquidityStart = dateMs(liquidity?.window_start)
  const liquidityEnd = dateMs(liquidity?.window_end)
  const conversion = liquidity?.currency_conversion
  const conversionAt = dateMs(conversion?.as_of)
  const expectedPair = instrument?.currency ? `${instrument.currency}/USD` : ''
  if (
    liquidity?.verified !== true || !nonBlank(liquidity?.source) || !finite(liquidityAt) || liquidityAt > nowMs + CLOCK_SKEW_MS || (finite(createdAt) && liquidityAt > createdAt + CLOCK_SKEW_MS) ||
    !Number.isInteger(liquidity?.lookback_days) || liquidity.lookback_days < policy.liquidityLookbackMinDays ||
    !Number.isInteger(liquidity?.observed_sessions) || liquidity.observed_sessions < 0 || liquidity.observed_sessions > liquidity.lookback_days ||
    !finite(liquidity?.coverage_pct) || liquidity.coverage_pct < policy.liquidityMinCoveragePct || liquidity.coverage_pct > 100 ||
    Math.abs(liquidity.coverage_pct - (liquidity.observed_sessions / liquidity.lookback_days) * 100) > 0.15 ||
    !finite(liquidityStart) || !finite(liquidityEnd) || liquidityEnd < liquidityStart ||
    liquidityEnd - liquidityStart < (liquidity.lookback_days - 1) * DAY_MS ||
    liquidityAt < liquidityStart || liquidityAt > liquidityEnd || liquidityEnd !== quoteAt ||
    liquidityEnd - liquidityAt > 14 * DAY_MS ||
    nowMs - liquidityAt > policy.liquidityMaxAgeDays * DAY_MS ||
    conversion?.pair !== expectedPair || !finite(conversion?.rate_usd_per_currency) || conversion.rate_usd_per_currency <= 0 ||
    !finite(conversionAt) || conversionAt > quoteAt || quoteAt - conversionAt > 14 * DAY_MS || !nonBlank(conversion?.source)
  ) {
    add(issues, 'unverified_liquidity', `Liquidity needs a fresh fixed ${policy.liquidityLookbackMinDays}-session window with at least ${policy.liquidityMinCoveragePct}% measured close × volume coverage and a source-bound USD conversion.`, 'research')
  }
  if (!finite(liquidity?.median_daily_value_usd) || liquidity.median_daily_value_usd < policy.minMedianDailyValueUsd) {
    add(issues, 'thin_liquidity', `Median daily traded value must be at least $${policy.minMedianDailyValueUsd.toLocaleString('en-US')}.`, 'reject')
  }

  const marketRisk = candidate?.market_risk
  const riskAt = dateMs(marketRisk?.as_of)
  if (!finite(marketRisk?.ordinary_move_pct) || marketRisk.ordinary_move_pct <= 0 || !nonBlank(marketRisk?.source) || !finite(riskAt) || riskAt > nowMs + CLOCK_SKEW_MS || (finite(createdAt) && riskAt > createdAt + CLOCK_SKEW_MS) || nowMs - riskAt > policy.liquidityMaxAgeDays * DAY_MS || !Number.isInteger(marketRisk?.lookback_days) || marketRisk.lookback_days < policy.marketRiskLookbackMinDays) {
    add(issues, 'missing_market_risk', `A fresh median absolute five-session move from at least ${policy.marketRiskLookbackMinDays} sessions is required for the scenario span check.`, 'research')
  }

  const research = candidate?.research
  if (!ACTIONABLE.has(String(research?.decision ?? ''))) add(issues, 'non_actionable_decision', 'Only an actionable standing research decision can qualify.', 'reject')
  const directionMatchesDecision = instrument?.direction === 'short'
    ? research?.decision === 'Short Candidate'
    : instrument?.direction === 'long' && ['Strong Buy', 'Buy', 'Starter Position Only'].includes(String(research?.decision ?? ''))
  if (!directionMatchesDecision) add(issues, 'decision_direction_mismatch', 'The research decision must authorize the candidate direction.', 'reject')
  if (research?.integrity_status !== 'verified') add(issues, 'research_not_verified', 'The source research must clear its integrity review.', 'research')
  const flags = research?.unresolved_red_flags
  const flagsValid = Array.isArray(flags) && flags.every((x) =>
    nonBlank(x?.id) && ['Critical', 'High', 'Medium', 'Low'].includes(String(x?.severity)) && nonBlank(x?.description),
  )
  const hardCapStateValid = research?.hard_cap_active === true
    ? nonBlank(research?.hard_cap_reason)
    : research?.hard_cap_active === false && research?.hard_cap_reason === null
  if (!hardCapStateValid || !flagsValid) {
    add(issues, 'invalid_risk_state', 'Rating-cap and unresolved-red-flag state must be explicit and structurally valid.', 'research')
  }
  if (!['pre_data', 'insufficient', 'measured', 'calibrated'].includes(String(research?.calibration_status ?? ''))) {
    add(issues, 'invalid_calibration_state', 'Calibration state must be explicit; missing history is pre-data, not calibrated.', 'research')
  } else if (research?.calibration_status === 'calibrated') {
    add(issues, 'invalid_calibration_state', 'Calibrated is reserved until a registered out-of-sample quality gate can produce it.', 'research')
  }
  if (!finite(research?.data_sufficiency_score) || research.data_sufficiency_score < 0 || research.data_sufficiency_score > 100 || research.data_sufficiency_score < policy.minDataSufficiency) add(issues, 'low_data_sufficiency', `Data sufficiency must be a 0-100 score of at least ${policy.minDataSufficiency}.`, 'research')
  if (!finite(research?.edge_score) || research.edge_score < 0 || research.edge_score > 100 || research.edge_score < policy.minEdgeScore) add(issues, 'low_edge', `Proven edge must be a 0-100 score of at least ${policy.minEdgeScore}.`, 'reject')
  if (!nonBlank(research?.edge_proof, 20)) add(issues, 'missing_edge_proof', 'The claimed edge needs a specific falsifiable proof.', 'research')
  if (research?.hard_cap_active === true) add(issues, 'hard_rating_cap', research.hard_cap_reason || 'An unresolved rating cap is active.', 'reject')
  if (Array.isArray(flags) && flags.some((x) => x?.severity === 'Critical')) add(issues, 'critical_red_flag', 'An unresolved Critical red flag blocks qualification.', 'reject')

  const catalyst = candidate?.catalyst
  const catalystStart = dateMs(catalyst?.window_start)
  const catalystEnd = dateMs(catalyst?.window_end)
  const catalystStatusAt = dateMs(catalyst?.status_as_of)
  if (!nonBlank(catalyst?.forecast_id) || !nonBlank(catalyst?.name) || !nonBlank(catalyst?.source) || catalyst?.status_at_admission !== 'scheduled_unresolved' || !finite(catalystStatusAt) || catalystStatusAt > createdAt + CLOCK_SKEW_MS || nowMs - catalystStatusAt > policy.quoteMaxAgeDays * DAY_MS || !finite(catalystStart) || !finite(catalystEnd) || catalystStart < createdAt || catalystEnd < nowMs || catalystEnd < catalystStart || (finite(horizonStart) && catalystStart < horizonStart) || (finite(horizonEnd) && catalystEnd > horizonEnd) || !Array.isArray(catalyst?.causal_steps) || catalyst.causal_steps.length < 2 || !catalyst.causal_steps.every((x) => nonBlank(x, 10)) || !nonBlank(catalyst?.bullish_trigger, 10) || !nonBlank(catalyst?.bearish_trigger, 10)) {
    add(issues, 'invalid_catalyst', 'A source-bound, still-live catalyst inside the holding window needs a causal chain and symmetric triggers.', 'research')
  }

  const falsifier = candidate?.falsifier
  const falsifierDeadline = dateMs(falsifier?.deadline)
  if (!nonBlank(falsifier?.condition, 20) || !nonBlank(falsifier?.metric) || !nonBlank(falsifier?.threshold) || !nonBlank(falsifier?.source) || !finite(falsifierDeadline) || falsifierDeadline < nowMs || (finite(horizonStart) && falsifierDeadline < horizonStart) || (finite(horizonEnd) && falsifierDeadline > horizonEnd)) {
    add(issues, 'invalid_falsifier', 'The falsifier must be observable, source-bound, and settle within the holding window.', 'research')
  }

  const bridge = candidate?.valuation_bridge
  const bridgeMethods = new Set(['same_horizon', 'catalyst_partial_convergence', 'event_payoff'])
  const bridgeMethodValid = bridgeMethods.has(String(bridge?.method ?? ''))
  const partialBridgeValid = bridge?.method === 'catalyst_partial_convergence'
    ? finite(bridge?.convergence_fraction) && bridge.convergence_fraction > 0 && bridge.convergence_fraction < 1
    : bridge?.convergence_fraction === null
  if (!Number.isInteger(bridge?.source_horizon_days) || bridge.source_horizon_days <= 0 || !bridgeMethodValid || !partialBridgeValid || !nonBlank(bridge?.source) || !nonBlank(bridge?.rationale, 20)) {
    add(issues, 'missing_horizon_bridge', 'Scenario targets need a source horizon and an explicit bridge into 3-6 months.', 'research')
  } else if (finite(horizonDays)) {
    const sourceIsLonger = bridge.source_horizon_days > horizonDays + 7
    const sourceIsSameHorizon = Math.abs(bridge.source_horizon_days - horizonDays) <= 7
    if (bridge.method === 'same_horizon' && !sourceIsSameHorizon) {
      add(issues, 'missing_horizon_bridge', 'A same-horizon target must be sourced from within seven days of the actual holding horizon.', 'research')
    }
    if (sourceIsLonger && bridge.method !== 'catalyst_partial_convergence') {
      add(issues, 'missing_horizon_bridge', 'A longer-horizon fair value requires a bounded catalyst-partial-convergence bridge.', 'research')
    }
    if (!sourceIsLonger && bridge.method === 'catalyst_partial_convergence') {
      add(issues, 'missing_horizon_bridge', 'A same-window source target must not be artificially discounted through a partial-convergence bridge.', 'research')
    }
    if (bridge.method === 'catalyst_partial_convergence' && finite(bridge.convergence_fraction)) {
      const maximumTimeFraction = Math.min(0.99, horizonDays / bridge.source_horizon_days + 0.05)
      if (bridge.convergence_fraction > maximumTimeFraction) {
        add(issues, 'missing_horizon_bridge', 'Partial convergence cannot exceed the holding-window share of the source horizon without a separately modelled event payoff.', 'research')
      }
    }
    if (bridge.method === 'event_payoff' && bridge.source_horizon_days > horizonDays + 7) {
      add(issues, 'missing_horizon_bridge', 'An event-payoff target must settle inside the actual holding horizon.', 'research')
    }
  }

  const scenarios = candidate?.scenarios
  const metrics = metricsFor(candidate, policy)
  const quotePrice = finite(quote?.price) && quote.price > 0 ? quote.price : null
  if (!Array.isArray(scenarios) || scenarios.length < 3 || scenarios.length > 7 || !metrics || new Set((scenarios || []).map((s) => String(s?.scenario_id ?? '').trim())).size !== scenarios?.length || new Set((scenarios || []).map((s) => String(s?.label ?? '').trim())).size !== scenarios?.length || !(scenarios || []).every((s) =>
    nonBlank(s?.scenario_id) && nonBlank(s?.source) &&
    Array.isArray(s?.conditions) && s.conditions.length > 0 && s.conditions.every((x) => nonBlank(x, 5)) &&
    (s.return_pct == null || finite(s.return_pct)),
  )) {
    add(issues, 'invalid_scenarios', 'Three to seven unique, source-bound, positive-probability scenarios with explicit conditions are required.', 'research')
  }
  if (metrics && Math.abs(metrics.probability_sum_pct - 100) > policy.probabilityTolerancePct) {
    add(issues, 'scenario_probability_sum', `Scenario probabilities total ${metrics.probability_sum_pct}%, not 100%.`, 'research')
  }
  if (metrics && Array.isArray(scenarios) && quotePrice !== null) {
    for (let i = 0; i < scenarios.length; i++) {
      const stated = scenarios[i]?.return_pct
      const computed = metrics.scenario_returns[i]?.return_pct
      if (finite(stated) && finite(computed) && Math.abs(stated - computed) > policy.returnReconciliationTolerancePct) {
        add(issues, 'scenario_return_mismatch', `Scenario ${scenarios[i].label} return does not reconcile to its target and quote.`, 'research')
      }
      if ((scenarios[i]?.conditions?.length ?? 0) > 1 && !nonBlank(scenarios[i]?.joint_probability_basis, 20)) {
        add(issues, 'scenario_conjunction_unjustified', `Scenario ${scenarios[i]?.label || i + 1} joins multiple conditions without a joint-probability basis.`, 'research')
      }
      const sourceTarget = scenarios[i]?.source_price_target
      const expectedTarget = bridge?.method === 'catalyst_partial_convergence' && finite(bridge?.convergence_fraction)
        ? quotePrice + bridge.convergence_fraction * (sourceTarget - quotePrice)
        : sourceTarget
      if (!finite(sourceTarget) || sourceTarget <= 0 || !finite(expectedTarget) || Math.abs(expectedTarget - scenarios[i].price_target) > Math.max(0.01, quotePrice * 0.0005)) {
        add(issues, 'missing_horizon_bridge', `Scenario ${scenarios[i]?.label || i + 1} target does not reconcile to its frozen source target and bridge.`, 'research')
      }
    }
    const adverseMoveBar = Math.max(
      policy.minAdverseMovePct,
      finite(marketRisk?.ordinary_move_pct) ? marketRisk.ordinary_move_pct * policy.minAdverseVsOrdinaryMove : 0,
    )
    const adverseMass = metrics.scenario_returns.filter((s) => s.return_pct <= -adverseMoveBar).reduce((n, s) => n + s.probability_pct, 0)
    if (adverseMass < policy.minAdverseProbabilityPct) {
      add(issues, 'scenario_no_real_loss', `At least ${policy.minAdverseProbabilityPct}% probability must sit in a loss of ${round(adverseMoveBar)}% or worse.`, 'research')
    }
    if (finite(marketRisk?.ordinary_move_pct) && metrics.best_case_return_pct < marketRisk.ordinary_move_pct * policy.minFavorableVsOrdinaryMove) {
      add(issues, 'scenario_span_too_narrow', 'The favorable case does not span one ordinary realised move.', 'research')
    }
    if (metrics.expected_return_pct < policy.minExpectedReturnPct) add(issues, 'expected_return_below_bar', `Expected return ${metrics.expected_return_pct}% is below the ${policy.minExpectedReturnPct}% policy bar.`, 'reject')
    if (metrics.tail_loss_pct > policy.maxTailLossPct) add(issues, 'tail_loss_above_budget', `Worst-${policy.tailProbabilityPct}% expected loss ${metrics.tail_loss_pct}% exceeds the ${policy.maxTailLossPct}% risk budget.`, 'reject')
    if (metrics.worst_case_loss_pct > policy.maxWorstCaseLossPct) add(issues, 'worst_case_loss_above_budget', `Worst-case loss ${metrics.worst_case_loss_pct}% exceeds the ${policy.maxWorstCaseLossPct}% permanent-loss budget.`, 'reject')
  }

  const hasReject = issues.some((x) => x.disposition === 'reject')
  const status: QualificationStatus = issues.length === 0 ? 'qualified' : hasReject ? 'does_not_clear' : 'needs_research'
  const calibrationNote = research?.calibration_status === 'calibrated'
    ? 'Reserved state: no live calibration-quality gate exists, so the candidate cannot qualify.'
    : research?.calibration_status === 'measured'
      ? 'Sample floor met: calibration diagnostics are measurable, but that alone does not prove the probabilities accurate.'
      : 'Pre-data: probabilities and policy thresholds are auditable priors until enough exact-horizon outcomes resolve.'
  return { candidate, status, issues, metrics, ranking: rankingFor(candidate, metrics), pareto_layer: null, calibration_note: calibrationNote }
}

function dominates(a: QualifiedIdeaEvaluation, b: QualifiedIdeaEvaluation): boolean {
  const A = a.metrics
  const B = b.metrics
  const ARank = a.ranking
  const BRank = b.ranking
  if (!A || !B || !ARank || !BRank) return false
  const noLessReturn = ARank.conservative_expected_return_pct >= BRank.conservative_expected_return_pct
  const noMoreRisk = A.tail_loss_pct <= B.tail_loss_pct &&
    A.worst_case_loss_pct <= B.worst_case_loss_pct && A.loss_probability_pct <= B.loss_probability_pct
  const strictlyBetter = ARank.conservative_expected_return_pct > BRank.conservative_expected_return_pct ||
    A.tail_loss_pct < B.tail_loss_pct ||
    A.worst_case_loss_pct < B.worst_case_loss_pct || A.loss_probability_pct < B.loss_probability_pct
  return noLessReturn && noMoreRisk && strictlyBetter
}

/** Assign non-dominated conservative-return/risk layers, then order each frontier by evidence quality. */
export function rankQualifiedIdeas(
  evaluations: QualifiedIdeaEvaluation[],
  rankingPolicyVersion: string = QUALIFIED_IDEA_RANKING_POLICY_VERSION,
): QualifiedIdeaEvaluation[] {
  const remaining: QualifiedIdeaEvaluation[] = evaluations
    .filter((x) => x.status === 'qualified' && x.metrics)
    .map((x): QualifiedIdeaEvaluation => ({
      ...x,
      ranking: qualifiedIdeaRankingForPolicy(x.candidate, x.metrics, rankingPolicyVersion),
      pareto_layer: null,
    }))
    .filter((x) => x.ranking)
  const ranked: QualifiedIdeaEvaluation[] = []
  let layer = 1
  while (remaining.length) {
    const frontier = remaining.filter((candidate) => !remaining.some((other) => other !== candidate && dominates(other, candidate)))
    frontier.sort((a, b) =>
      (b.ranking!.evidence_confidence_score - a.ranking!.evidence_confidence_score) ||
      (b.ranking!.conservative_expected_return_pct - a.ranking!.conservative_expected_return_pct) ||
      (a.metrics!.tail_loss_pct - b.metrics!.tail_loss_pct) ||
      (a.metrics!.worst_case_loss_pct - b.metrics!.worst_case_loss_pct) ||
      (a.metrics!.loss_probability_pct - b.metrics!.loss_probability_pct) ||
      (b.candidate.research.edge_score - a.candidate.research.edge_score) ||
      a.candidate.idea_id.localeCompare(b.candidate.idea_id),
    )
    for (const item of frontier) {
      item.pareto_layer = layer
      ranked.push(item)
      const idx = remaining.indexOf(item)
      if (idx >= 0) remaining.splice(idx, 1)
      else {
        const byId = remaining.findIndex((x) => x.candidate.idea_id === item.candidate.idea_id)
        if (byId >= 0) remaining.splice(byId, 1)
      }
    }
    layer++
  }
  return ranked
}
