// Realised-cohort calibration for immutable qualified-idea admissions.
//
// Diagnostics are descriptive until a horizon-bucket AND direction cohort is independently large and
// diverse. A future-dated result, malformed derived metric, or conflicting duplicate is never counted.

import fs from 'node:fs'
import path from 'node:path'
import {
  readQualifiedIdeaCohortEntriesText,
  readQualifiedIdeaOutcomesText,
  type QualifiedIdeaCohortEntry,
  type QualifiedIdeaOutcome,
} from './qualified-idea-outcomes'
import { parseRfc3339Ms } from './rfc3339'
import { QUALIFICATION_POLICIES, QUALIFICATION_POLICY_VERSION } from './qualified-ideas'

export const QUALIFIED_IDEA_CALIBRATION_SCHEMA = 'qualified-idea-calibration/v2' as const
export const QUALIFIED_CALIBRATION_MIN_OUTCOMES = 30
export const QUALIFIED_CALIBRATION_MIN_TICKERS = 20
export const QUALIFIED_CALIBRATION_MIN_BENCHMARK_COVERAGE_PCT = 80

export interface QualifiedIdeaCalibrationStats {
  outcomes: number
  unique_ideas: number
  unique_tickers: number
  average_predicted_positive_pct: number | null
  realized_positive_pct: number | null
  positive_calibration_gap_pp: number | null
  mean_brier_positive: number | null
  average_predicted_return_pct: number | null
  average_realized_return_pct: number | null
  mean_absolute_return_error_pct: number | null
  return_forecast_error_pct: number | null
  scenario_range_coverage_pct: number | null
  tail_loss_breach_pct: number | null
  average_max_adverse_excursion_pct: number | null
  average_excess_vs_benchmark_pct: number | null
  benchmark_observations: number
  benchmark_coverage_pct: number | null
}

export interface QualifiedIdeaCalibrationCohort {
  horizon_bucket: string
  direction: 'long' | 'short'
  status: 'pre_data' | 'insufficient' | 'measured'
  reason: string
  stats: QualifiedIdeaCalibrationStats
}

export interface QualifiedIdeaCalibrationSummary {
  schema_version: typeof QUALIFIED_IDEA_CALIBRATION_SCHEMA
  policy_version: string
  generated_at: string
  status: 'pre_data' | 'insufficient' | 'measured'
  reason: string
  minimums: { outcomes: number; unique_tickers: number; benchmark_coverage_pct: number }
  valid_outcome_count: number
  invalid_outcome_count: number
  conflicting_outcome_count: number
  future_outcome_count: number
  excluded_nonstanding_count: number
  overall: QualifiedIdeaCalibrationStats
  by_horizon: Record<string, QualifiedIdeaCalibrationStats>
  by_horizon_direction: Record<string, QualifiedIdeaCalibrationCohort>
}

function finite(v: unknown): v is number { return typeof v === 'number' && Number.isFinite(v) }
function round(v: number, places = 2): number {
  const p = 10 ** places
  return Math.round((v + Number.EPSILON) * p) / p
}
function mean(xs: number[], places = 2): number | null { return xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length, places) : null }
function pct(n: number, d: number): number | null { return d > 0 ? round(n * 100 / d) : null }

function registeredPolicyVersion(v: unknown): v is string {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(QUALIFICATION_POLICIES, v)
}

/**
 * Bind a realised row to the exact immutable admission that entered the cohort. JSON tuple encoding avoids
 * delimiter collisions in producer-controlled identifiers, while normalising the due timestamp makes two
 * equivalent RFC3339 spellings compare as the same frozen horizon.
 */
function cohortJoinKey(entry: QualifiedIdeaCohortEntry): string {
  return JSON.stringify([
    entry.candidate.policy_version,
    entry.candidate.idea_id,
    entry.candidate.run_root,
    new Date(parseRfc3339Ms(entry.candidate.horizon.end)).toISOString(),
    entry.admission_id,
    entry.admission_sha256,
    entry.candidate_sha256,
    entry.market_evidence_sha256,
  ])
}

function outcomeJoinKey(outcome: QualifiedIdeaOutcome): string {
  return JSON.stringify([
    outcome.policy_version,
    outcome.idea_id,
    outcome.run_root,
    new Date(parseRfc3339Ms(outcome.horizon_due_at)).toISOString(),
    outcome.admission_id,
    outcome.admission_sha256,
    outcome.candidate_sha256,
    outcome.market_evidence_sha256,
  ])
}

export function qualifiedIdeaHorizonBucket(days: number): string {
  if (days < 120) return '90-119d'
  if (days < 150) return '120-149d'
  return '150-183d'
}

export function qualifiedIdeaCalibrationCohortKey(days: number, direction: 'long' | 'short'): string {
  return `${qualifiedIdeaHorizonBucket(days)}|${direction}`
}

function stats(rows: QualifiedIdeaOutcome[]): QualifiedIdeaCalibrationStats {
  const predictedPositive = rows.map((x) => x.predicted_positive_probability_pct)
  const realizedPositive = rows.filter((x) => x.realized_positive).length
  const predictedAvg = mean(predictedPositive)
  const realizedPct = pct(realizedPositive, rows.length)
  const benchmark = rows.map((x) => x.excess_vs_benchmark_pct).filter(finite)
  return {
    outcomes: rows.length,
    unique_ideas: new Set(rows.map((x) => x.idea_id)).size,
    unique_tickers: new Set(rows.map((x) => `${x.exchange.trim().toUpperCase()}|${x.ticker.trim().toUpperCase()}`)).size,
    average_predicted_positive_pct: predictedAvg,
    realized_positive_pct: realizedPct,
    positive_calibration_gap_pp: predictedAvg == null || realizedPct == null ? null : round(realizedPct - predictedAvg),
    mean_brier_positive: mean(rows.map((x) => x.brier_positive_return), 4),
    average_predicted_return_pct: mean(rows.map((x) => x.predicted_expected_return_pct)),
    average_realized_return_pct: mean(rows.map((x) => x.realized_strategy_return_pct)),
    mean_absolute_return_error_pct: mean(rows.map((x) => Math.abs(x.realized_strategy_return_pct - x.predicted_expected_return_pct))),
    return_forecast_error_pct: mean(rows.map((x) => x.realized_strategy_return_pct - x.predicted_expected_return_pct)),
    scenario_range_coverage_pct: pct(rows.filter((x) => x.within_scenario_range).length, rows.length),
    tail_loss_breach_pct: pct(rows.filter((x) => x.tail_loss_breached).length, rows.length),
    average_max_adverse_excursion_pct: mean(rows.map((x) => x.max_adverse_excursion_pct)),
    average_excess_vs_benchmark_pct: mean(benchmark),
    benchmark_observations: benchmark.length,
    benchmark_coverage_pct: pct(benchmark.length, rows.length),
  }
}

function cohortState(bucket: string, direction: 'long' | 'short', rows: QualifiedIdeaOutcome[]): QualifiedIdeaCalibrationCohort {
  const cohortStats = stats(rows)
  if (!rows.length) return {
    horizon_bucket: bucket, direction, status: 'pre_data',
    reason: `No ${direction} outcomes have resolved in the ${bucket} horizon bucket.`, stats: cohortStats,
  }
  const measured = rows.length >= QUALIFIED_CALIBRATION_MIN_OUTCOMES &&
    cohortStats.unique_tickers >= QUALIFIED_CALIBRATION_MIN_TICKERS &&
    (cohortStats.benchmark_coverage_pct ?? 0) >= QUALIFIED_CALIBRATION_MIN_BENCHMARK_COVERAGE_PCT
  return {
    horizon_bucket: bucket,
    direction,
    status: measured ? 'measured' : 'insufficient',
    reason: measured
      ? `${rows.length} ${direction} outcomes across ${cohortStats.unique_tickers} listings make this ${bucket} cohort measurable.`
      : `${rows.length}/${QUALIFIED_CALIBRATION_MIN_OUTCOMES} outcomes, ${cohortStats.unique_tickers}/${QUALIFIED_CALIBRATION_MIN_TICKERS} listings, and ${cohortStats.benchmark_coverage_pct ?? 0}%/${QUALIFIED_CALIBRATION_MIN_BENCHMARK_COVERAGE_PCT}% benchmark coverage; do not tune this ${bucket} ${direction} cohort.`,
    stats: cohortStats,
  }
}

export function qualifiedIdeaCalibrationStatusFor(
  summary: QualifiedIdeaCalibrationSummary,
  policyVersion: string,
  horizonDays: number,
  direction: 'long' | 'short',
): 'pre_data' | 'insufficient' | 'measured' {
  if (summary.policy_version !== policyVersion || !registeredPolicyVersion(policyVersion) || !Number.isInteger(horizonDays) || horizonDays < 90 || horizonDays > 183) return 'pre_data'
  return summary.by_horizon_direction[qualifiedIdeaCalibrationCohortKey(horizonDays, direction)]?.status ?? 'pre_data'
}

export function summarizeQualifiedIdeaCalibration(
  repoRoot: string,
  nowMs = Date.now(),
  policyVersion = QUALIFICATION_POLICY_VERSION,
): QualifiedIdeaCalibrationSummary {
  if (!registeredPolicyVersion(policyVersion)) throw new Error(`Cannot calibrate unregistered qualification policy: ${policyVersion}`)
  const ledgerDir = path.join(repoRoot, 'screener', 'ledger')
  const readText = (file: string): string => { try { return fs.readFileSync(file, 'utf8') } catch { return '' } }
  const cohorts = readQualifiedIdeaCohortEntriesText(readText(path.join(ledgerDir, 'qualified_idea_cohort_entries.ndjson')))
  const read = readQualifiedIdeaOutcomesText(readText(path.join(ledgerDir, 'qualified_idea_outcomes.ndjson')))
  const eligibleCohorts = new Set(
    cohorts.rows
      .filter((entry) => entry.candidate.policy_version === policyVersion)
      .map(cohortJoinKey),
  )
  let excluded = 0
  let future = 0
  const rows: QualifiedIdeaOutcome[] = []
  for (const row of read.rows) {
    if (registeredPolicyVersion(row.policy_version) && row.policy_version !== policyVersion) continue
    if (row.policy_version !== policyVersion) continue
    if (parseRfc3339Ms(row.horizon_ended_at) > nowMs || parseRfc3339Ms(row.resolved_at) > nowMs) { future++; continue }
    if (!eligibleCohorts.has(outcomeJoinKey(row))) { excluded++; continue }
    rows.push(row)
  }
  const overall = stats(rows)
  const buckets = ['90-119d', '120-149d', '150-183d']
  const byHorizon: Record<string, QualifiedIdeaCalibrationStats> = {}
  const byDirection: Record<string, QualifiedIdeaCalibrationCohort> = {}
  for (const bucket of buckets) {
    const horizonRows = rows.filter((x) => qualifiedIdeaHorizonBucket(x.horizon_days) === bucket)
    byHorizon[bucket] = stats(horizonRows)
    for (const direction of ['long', 'short'] as const) {
      byDirection[`${bucket}|${direction}`] = cohortState(bucket, direction, horizonRows.filter((x) => x.direction === direction))
    }
  }
  const cohortValues = Object.values(byDirection)
  const measuredCount = cohortValues.filter((x) => x.status === 'measured').length
  const nonemptyCount = cohortValues.filter((x) => x.stats.outcomes > 0).length
  const status: QualifiedIdeaCalibrationSummary['status'] = measuredCount > 0 ? 'measured' : rows.length ? 'insufficient' : 'pre_data'
  const reason = status === 'pre_data'
    ? 'No integrity-cleared, non-future 3-6 month outcomes have resolved yet; thresholds remain pre-data priors.'
    : status === 'measured'
      ? `${measuredCount}/${nonemptyCount} non-empty horizon-and-direction cohorts clear the measurement floor; only those cells may inform policy review.`
      : `${rows.length} outcomes exist, but no horizon-and-direction cohort independently clears the sample, listing-diversity, and benchmark-coverage floors.`
  return {
    schema_version: QUALIFIED_IDEA_CALIBRATION_SCHEMA,
    policy_version: policyVersion,
    generated_at: new Date(nowMs).toISOString(),
    status,
    reason,
    minimums: {
      outcomes: QUALIFIED_CALIBRATION_MIN_OUTCOMES,
      unique_tickers: QUALIFIED_CALIBRATION_MIN_TICKERS,
      benchmark_coverage_pct: QUALIFIED_CALIBRATION_MIN_BENCHMARK_COVERAGE_PCT,
    },
    valid_outcome_count: rows.length,
    invalid_outcome_count: read.invalid_count,
    conflicting_outcome_count: read.conflicting_count,
    future_outcome_count: future,
    excluded_nonstanding_count: excluded,
    overall,
    by_horizon: byHorizon,
    by_horizon_direction: byDirection,
  }
}
