// Ideas is deliberately a two-tab skim: live LONG ideas and live SHORT ideas. Within either tab, qualified
// 3-6 month forecasts are the primary surface and news-only leads stay in a separate collapsed research
// queue. The payload's direction is authoritative; stale leads stay out, while an expired qualified
// forecast remains visibly frozen for audit and pair trades appear under each of their explicit legs.
//
// Deliberate honesty, per the doctrine: a news score is labelled research priority, never investment
// conviction (§7); a macro/commodity bet is flagged, not dressed as a single-name pick (§14); and when nothing
// clears the bar the view SAYS SO (§24, the Rejector) instead of manufacturing a pick. It fails closed on a
// missing ideas array (deploy skew, DESIGN.md §5), ships loading/empty/error states (§4), and — because it
// auto-refreshes on the board poll (a live tick) — never uses a mount/exit animation that a re-render could
// freeze (DESIGN.md §3, the LiveFeed rule); the only motion is a one-shot CSS fade keyed per idea.

import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import type { ArchivedBoardIdea, BoardIdea, IdeasArchive, IdeasArchiveHealth, IdeasArchiveRetentionSide, IdeasArchiveSideCounts, QualifiedIdeaEvaluation, QualifiedIdeasBoard } from '../../lib/types'
import { ideaIsStaleNow, qualifiedIdeaFreshnessNow } from '../../lib/ideasView'

const MACRO_TYPES = new Set(['macro_conditional', 'commodity_conditional', 'policy_conditional', 'fx_rates', 'liquidity_positioning'])

// The same thumb glyphs the reader uses, so a rating feels identical across the cockpit.
const THUMB_UP = 'M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4.5-7a2 2 0 0 1 3.7 1.3L14.5 9H20a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 18.7 20H7'
const THUMB_DOWN = 'M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3zm0 0-4.5 7a2 2 0 0 1-3.7-1.3L9.5 15H4a2 2 0 0 1-2-2.3l1.3-7A2 2 0 0 1 5.3 4H17'
const UP_REASONS = ['clean setup', 'timely', 'non-obvious']
const DOWN_REASONS = ['not tradable', 'priced in', 'wrong way', 'too vague']

export type IdeaSide = 'long' | 'short'
const IDEA_SIDES: readonly IdeaSide[] = ['long', 'short']
const QUALIFIED_BOARD_SCHEMA = 'qualified-ideas-board/v1'
const QUALIFIED_HEALTH_STATUSES = new Set(['pre_data', 'healthy', 'degraded'])
const QUALIFIED_HEALTH_OUTCOMES = new Set(['no_artifacts', 'publishing', 'none_clear', 'qualified', 'invalid_artifacts', 'storage_error'])
const OUTCOME_HEALTH_STATUSES = new Set(['pre_data', 'healthy', 'degraded', 'error'])
const OUTCOME_HEALTH_OUTCOMES = new Set(['no_qualified_ideas', 'nothing_due', 'endpoint_pending', 'resolved', 'history_missing', 'admission_failed', 'provider_failed', 'failed'])
const QUALIFICATION_POLICY_VERSION = 'ideas-policy/precal-v1'
const RANKING_POLICY_VERSION = 'ideas-ranking/calibration-shrinkage-v2'
const DEFAULT_PROBABILITY_TOLERANCE_PCT = 0.05
const DEFAULT_RETURN_RECONCILIATION_TOLERANCE_PCT = 0.15
const SERVER_ROUNDING_TOLERANCE = 1e-7
const DAY_MS = 86_400_000
const CLOCK_SKEW_MS = 5 * 60_000
const RUN_DAY_SKEW_MS = 14 * 60 * 60_000
const OUTCOME_HEALTH_MIN_TTL_MS = 30 * 60_000
const OUTCOME_HEALTH_MAX_TTL_MS = 24 * 60 * 60_000
const LEAD_RESEARCH_PRIORITY_CAP = 62
const LEGACY_LEAD_RESEARCH_PRIORITY_CAP = 44
const ACTIONABLE_LONG_DECISIONS = new Set(['Strong Buy', 'Buy', 'Starter Position Only'])
const CALIBRATION_NOTES = Object.freeze({
  pre_data: 'Pre-data: probabilities and policy thresholds are auditable priors until enough exact-horizon outcomes resolve.',
  insufficient: 'Pre-data: probabilities and policy thresholds are auditable priors until enough exact-horizon outcomes resolve.',
  measured: 'Sample floor met: calibration diagnostics are measurable, but that alone does not prove the probabilities accurate.',
})
const RANKING_RATIONALES = Object.freeze({
  pre_data: 'No exact-horizon outcomes have resolved, so only 35% of each positive scenario return is retained while losses remain fully counted; evidence is compressed into a conservative 0-50 confidence band.',
  insufficient: 'Some outcomes exist but the cohort is too small or narrow to learn from, so the scenario-level upside haircut remains in force and losses remain fully counted.',
  measured: 'The sample is large enough to measure, but measurement alone does not prove forecast skill, so the scenario-level upside haircut remains in force and losses remain fully counted.',
})
const FROZEN_QUALIFICATION_POLICY: Readonly<QualifiedIdeasBoard['policy']> = Object.freeze({
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
  probabilityTolerancePct: DEFAULT_PROBABILITY_TOLERANCE_PCT,
  returnReconciliationTolerancePct: DEFAULT_RETURN_RECONCILIATION_TOLERANCE_PCT,
})
const FROZEN_POLICY_KEYS = Object.keys(FROZEN_QUALIFICATION_POLICY) as Array<keyof QualifiedIdeasBoard['policy']>
const OUTCOME_COUNT_KEYS = [
  'pass_sequence', 'qualified_idea_count', 'admission_count', 'admission_appended_count',
  'admission_existing_count', 'admission_conflict_count', 'due_count', 'appended_count',
  'existing_count', 'unresolved_count', 'endpoint_pending_count', 'not_due_count',
  'ledger_invalid_count', 'ledger_conflict_count',
] as const
const HEALTH_COUNT_KEYS = [
  'artifact_count', 'assessment_count', 'parsed_count', 'invalid_count', 'not_assessable_count',
  'qualified_count', 'needs_research_count', 'does_not_clear_count', 'measured_count',
] as const
const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|([+-])(\d{2}):(\d{2}))$/
const IDEA_VERSION = /^IDEAV-[a-f0-9]{16}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function nonBlank(value: unknown, min = 1): value is string {
  return typeof value === 'string' && value.trim().length >= min
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function stringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(nonBlank)
}

function parseRfc3339Ms(value: unknown): number {
  if (typeof value !== 'string') return NaN
  const match = RFC3339.exec(value)
  if (!match) return NaN
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  const offsetHour = match[8] == null ? 0 : Number(match[8])
  const offsetMinute = match[9] == null ? 0 : Number(match[9])
  if (
    year < 1900 || month < 1 || month > 12 || day < 1
    || day > new Date(Date.UTC(year, month, 0)).getUTCDate()
    || hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59
  ) return NaN
  return Date.parse(value.replace('t', 'T').replace(/z$/, 'Z'))
}

function serverRound(value: number, places = 2): number {
  const precision = 10 ** places
  return Math.round((value + Number.EPSILON) * precision) / precision
}

function closeTo(left: number, right: number, tolerance = SERVER_ROUNDING_TOLERANCE): boolean {
  return Math.abs(left - right) <= tolerance
}

function frozenPolicy(value: unknown): QualifiedIdeasBoard['policy'] | null {
  if (!isRecord(value)) return null
  return FROZEN_POLICY_KEYS.every((key) => finiteNumber(value[key]) && value[key] === FROZEN_QUALIFICATION_POLICY[key])
    ? value as unknown as QualifiedIdeasBoard['policy']
    : null
}

function expectedShortfallLoss(
  scenarios: Array<{ probability_pct: number; return_pct: number }>,
  tailPct: number,
): number {
  if (!finiteNumber(tailPct) || tailPct <= 0 || tailPct > 100) return NaN
  let remaining = tailPct
  let weighted = 0
  for (const scenario of [...scenarios].sort((left, right) => left.return_pct - right.return_pct)) {
    if (remaining <= 0) break
    const take = Math.min(remaining, scenario.probability_pct)
    if (take > 0) weighted += Math.max(0, -scenario.return_pct) * take
    remaining -= take
  }
  return remaining > 1e-9 ? NaN : weighted / tailPct
}

function outcomeHealthRecord(value: unknown, nowMs = Date.now()): Record<string, unknown> | null {
  if (!isRecord(value)
    || value.schema_version !== 'qualified-idea-outcomes-health/v2'
    || !/^[a-f0-9]{64}$/.test(String(value.repository_scope_sha256 ?? ''))
    || !/^QOHP-\d{12}-[a-f0-9]{12}$/.test(String(value.pass_id ?? ''))
    || !OUTCOME_HEALTH_STATUSES.has(String(value.status))
    || !OUTCOME_HEALTH_OUTCOMES.has(String(value.outcome))
    || !nonBlank(value.reason)
    || value.terminal !== true
  ) return null
  const started = parseRfc3339Ms(value.pass_started_at)
  const updated = parseRfc3339Ms(value.updated_at)
  const expires = parseRfc3339Ms(value.expires_at)
  const passNumber = Number(String(value.pass_id).match(/^QOHP-(\d{12})-/)?.[1])
  const statusOutcomeCoherent = (value.status === 'pre_data' && value.outcome === 'no_qualified_ideas')
    || (value.status === 'healthy' && ['nothing_due', 'endpoint_pending', 'resolved'].includes(String(value.outcome)))
    || (value.status === 'degraded' && ['history_missing', 'admission_failed', 'resolved', 'failed'].includes(String(value.outcome)))
    || (value.status === 'error' && ['provider_failed', 'failed'].includes(String(value.outcome)))
  const count = (key: typeof OUTCOME_COUNT_KEYS[number]) => Number(value[key])
  const outcomeCountsCoherent = count('due_count') === count('appended_count') + count('existing_count') + count('unresolved_count') + count('endpoint_pending_count')
    && (value.outcome !== 'no_qualified_ideas' || (count('qualified_idea_count') === 0 && count('admission_count') === 0 && count('due_count') === 0 && count('appended_count') === 0 && count('existing_count') === 0 && count('endpoint_pending_count') === 0))
    && (value.outcome !== 'nothing_due' || (count('due_count') === 0 && count('appended_count') === 0 && count('existing_count') === 0 && count('endpoint_pending_count') === 0))
    && (value.outcome !== 'endpoint_pending' || (count('endpoint_pending_count') > 0 && count('due_count') === count('endpoint_pending_count') && count('appended_count') === 0 && count('existing_count') === 0 && count('unresolved_count') === 0))
    && (value.outcome !== 'resolved' || count('appended_count') + count('existing_count') > 0)
    && (value.outcome !== 'history_missing' || count('unresolved_count') > 0)
  const providerFailures = Array.isArray(value.provider_failures) ? value.provider_failures : null
  const providerFailuresValid = providerFailures !== null && providerFailures.every((failure) => isRecord(failure)
    && nonBlank(failure.symbol) && ['security', 'benchmark', 'sector'].includes(String(failure.role))
    && ['history_not_found', 'provider_timeout', 'provider_execution_failed', 'provider_output_invalid', 'provider_contract_invalid'].includes(String(failure.code))
    && nonBlank(failure.reason))
  const securityProviderFailed = providerFailuresValid && providerFailures!.some((failure) => isRecord(failure)
    && failure.role === 'security' && failure.code !== 'history_not_found')
  if (!statusOutcomeCoherent
    || ![started, updated, expires].every(Number.isFinite)
    || started > updated || updated > nowMs || started > nowMs || updated >= expires
    || expires - updated < OUTCOME_HEALTH_MIN_TTL_MS || expires - updated > OUTCOME_HEALTH_MAX_TTL_MS
    || passNumber !== value.pass_sequence
    || !OUTCOME_COUNT_KEYS.every((key) => Number.isInteger(value[key]) && Number(value[key]) >= 0)
    || !outcomeCountsCoherent
    || (value.outcome === 'provider_failed' && !securityProviderFailed)
    || !['missing_history', 'missing_comparators', 'errors'].every((key) => stringList(value[key]))
    || !providerFailuresValid
  ) return null
  return value
}

/** The API boundary is not a trust boundary: rolling deploys and damaged snapshots can put an older or
 * malformed object in the typed store. Validate every nested field this view reads before rendering it. */
export function normalizeQualifiedIdeaRow(
  value: unknown,
  policy?: Partial<QualifiedIdeasBoard['policy']> | null,
  evaluatedAtMs = Date.now(),
): QualifiedIdeaEvaluation | null {
  if (!isRecord(value) || !isRecord(value.candidate) || !isRecord(value.metrics)) return null
  const activePolicy = policy == null ? FROZEN_QUALIFICATION_POLICY : frozenPolicy(policy)
  if (!activePolicy || !Number.isFinite(evaluatedAtMs)) return null
  const candidate = value.candidate
  const instrument = candidate.instrument
  const horizon = candidate.horizon
  const quote = candidate.quote
  const liquidity = candidate.liquidity
  const marketRisk = candidate.market_risk
  const research = candidate.research
  const catalyst = candidate.catalyst
  const falsifier = candidate.falsifier
  const scenarios = candidate.scenarios
  const metrics = value.metrics
  const probabilityTolerance = activePolicy.probabilityTolerancePct
  const returnTolerance = activePolicy.returnReconciliationTolerancePct
  const sha256 = (raw: unknown) => typeof raw === 'string' && /^[a-f0-9]{64}$/.test(raw)
  const timestamp = (raw: unknown) => parseRfc3339Ms(raw)
  const createdAt = timestamp(candidate.created_at)
  const quoteAt = isRecord(quote) ? timestamp(quote.as_of) : NaN
  const horizonStart = isRecord(horizon) ? timestamp(horizon.start) : NaN
  const horizonEnd = isRecord(horizon) ? timestamp(horizon.end) : NaN
  const horizonDays = (horizonEnd - horizonStart) / DAY_MS
  const runIdentity = /^analyses\/([^/]+)_(\d{4}-\d{2}-\d{2})$/.exec(String(candidate.run_root ?? ''))
  const runDayStart = Date.parse(`${String(candidate.decision_date ?? '')}T00:00:00Z`)

  if (
    value.status !== 'qualified' || !Array.isArray(value.issues) || value.issues.length !== 0
    || candidate.schema_version !== 'qualified-idea/v1'
    || candidate.policy_version !== QUALIFICATION_POLICY_VERSION
    || !nonBlank(candidate.idea_id) || !nonBlank(candidate.run_root)
    || !sha256(candidate.market_evidence_sha256) || !sha256(candidate.projection_manifest_sha256)
    || !runIdentity || runIdentity[2] !== candidate.decision_date
    || !Number.isFinite(runDayStart) || new Date(runDayStart).toISOString().slice(0, 10) !== candidate.decision_date
    || !Number.isFinite(createdAt) || createdAt > evaluatedAtMs + CLOCK_SKEW_MS
    || createdAt < runDayStart - RUN_DAY_SKEW_MS || createdAt > runDayStart + DAY_MS + RUN_DAY_SKEW_MS
    || !isRecord(instrument) || instrument.direction !== 'long' || instrument.asset_type !== 'equity'
    || !/^[-A-Z0-9.]{1,24}$/.test(String(instrument.ticker ?? '')) || !nonBlank(instrument.company)
    || !nonBlank(instrument.exchange) || !/^[A-Z]{3}$/.test(String(instrument.currency ?? ''))
    || !isRecord(horizon) || !Number.isFinite(horizonStart) || !Number.isFinite(horizonEnd)
    || horizonEnd <= horizonStart || horizonDays < activePolicy.horizonMinDays || horizonDays > activePolicy.horizonMaxDays
    || !isRecord(quote) || !finiteNumber(quote.price) || quote.price <= 0 || !nonBlank(quote.source)
    || quote.identity_verified !== true || quote.stale !== false || !Number.isFinite(quoteAt)
    || evaluatedAtMs - quoteAt > activePolicy.quoteMaxAgeDays * DAY_MS
    || quoteAt > evaluatedAtMs + CLOCK_SKEW_MS || quoteAt > createdAt + CLOCK_SKEW_MS
    || horizonStart < createdAt || horizonStart < quoteAt
    || horizonStart - quoteAt > activePolicy.entryMaxSkewDays * DAY_MS
    || horizonStart - createdAt > activePolicy.entryMaxSkewDays * DAY_MS
    || !isRecord(liquidity) || !isRecord(liquidity.currency_conversion)
    || !isRecord(marketRisk)
    || !isRecord(research) || !nonBlank(research.edge_proof, 20)
    || !['pre_data', 'insufficient', 'measured'].includes(String(research.calibration_status))
    || !ACTIONABLE_LONG_DECISIONS.has(String(research.decision)) || research.integrity_status !== 'verified'
    || research.hard_cap_active !== false || research.hard_cap_reason !== null
    || !finiteNumber(research.data_sufficiency_score) || research.data_sufficiency_score < activePolicy.minDataSufficiency || research.data_sufficiency_score > 100
    || !finiteNumber(research.edge_score) || research.edge_score < activePolicy.minEdgeScore || research.edge_score > 100
    || !Array.isArray(research.unresolved_red_flags)
    || !research.unresolved_red_flags.every((flag) => isRecord(flag)
      && nonBlank(flag.id) && ['Critical', 'High', 'Medium', 'Low'].includes(String(flag.severity))
      && nonBlank(flag.description))
    || research.unresolved_red_flags.some((flag) => isRecord(flag) && flag.severity === 'Critical')
    || !isRecord(catalyst) || !nonBlank(catalyst.forecast_id) || !nonBlank(catalyst.name)
    || !nonBlank(catalyst.source) || catalyst.status_at_admission !== 'scheduled_unresolved'
    || !Array.isArray(catalyst.causal_steps) || catalyst.causal_steps.length < 2
    || !catalyst.causal_steps.every((step) => nonBlank(step, 10))
    || !nonBlank(catalyst.bullish_trigger, 10) || !nonBlank(catalyst.bearish_trigger, 10)
    || !isRecord(falsifier) || !nonBlank(falsifier.condition, 20) || !nonBlank(falsifier.metric)
    || !nonBlank(falsifier.threshold) || !nonBlank(falsifier.source)
    || !isRecord(candidate.valuation_bridge)
    || !Array.isArray(scenarios) || scenarios.length < 3 || scenarios.length > 7
    || !scenarios.every((scenario) => isRecord(scenario)
      && nonBlank(scenario.scenario_id) && nonBlank(scenario.label)
      && finiteNumber(scenario.probability_pct) && scenario.probability_pct > 0 && scenario.probability_pct <= 100
      && finiteNumber(scenario.price_target) && scenario.price_target > 0
      && finiteNumber(scenario.source_price_target) && scenario.source_price_target > 0
      && (scenario.return_pct == null || finiteNumber(scenario.return_pct))
      && nonBlank(scenario.source) && stringList(scenario.conditions) && scenario.conditions.length > 0
      && scenario.conditions.every((condition) => nonBlank(condition, 5))
      && (scenario.joint_probability_basis == null || nonBlank(scenario.joint_probability_basis)))
    || !['expected_return_pct', 'loss_probability_pct', 'worst_case_loss_pct', 'tail_loss_pct', 'best_case_return_pct', 'probability_sum_pct'].every((key) => finiteNumber(metrics[key]))
    || (metrics.loss_probability_pct as number) < 0 || (metrics.loss_probability_pct as number) > 100
    || (metrics.worst_case_loss_pct as number) < 0 || (metrics.tail_loss_pct as number) < 0
    || !Array.isArray(metrics.scenario_returns)
    || !metrics.scenario_returns.every((scenario) => isRecord(scenario) && nonBlank(scenario.label)
      && finiteNumber(scenario.probability_pct) && finiteNumber(scenario.return_pct))
    || !nonBlank(value.calibration_note)
    || !Number.isInteger(value.pareto_layer) || Number(value.pareto_layer) < 1
    || !isRecord(value.admission) || !nonBlank(value.admission.admission_id)
    || !sha256(value.admission.admission_sha256) || !sha256(value.admission.candidate_sha256)
    || !Number.isFinite(timestamp(value.admission.frozen_at))
  ) return null

  if (runIdentity[1].toUpperCase() !== String(instrument.ticker).toUpperCase()) return null
  const calibrationStatus = String(research.calibration_status) as keyof typeof CALIBRATION_NOTES
  if (value.calibration_note !== CALIBRATION_NOTES[calibrationStatus]) return null
  const admissionFrozenAt = timestamp((value.admission as Record<string, unknown>).frozen_at)
  if (admissionFrozenAt < createdAt || admissionFrozenAt > evaluatedAtMs + CLOCK_SKEW_MS
    || admissionFrozenAt < runDayStart - RUN_DAY_SKEW_MS || admissionFrozenAt > runDayStart + DAY_MS + RUN_DAY_SKEW_MS
    || horizonStart < admissionFrozenAt
  ) return null

  const liquidityAt = timestamp(liquidity.as_of)
  const liquidityStart = timestamp(liquidity.window_start)
  const liquidityEnd = timestamp(liquidity.window_end)
  const conversion = liquidity.currency_conversion as Record<string, unknown>
  const conversionAt = timestamp(conversion.as_of)
  if (liquidity.verified !== true || !nonBlank(liquidity.source)
    || !Number.isFinite(liquidityAt) || liquidityAt > evaluatedAtMs + CLOCK_SKEW_MS || liquidityAt > createdAt + CLOCK_SKEW_MS
    || !Number.isInteger(liquidity.lookback_days) || Number(liquidity.lookback_days) < activePolicy.liquidityLookbackMinDays
    || !Number.isInteger(liquidity.observed_sessions) || Number(liquidity.observed_sessions) < 0
    || Number(liquidity.observed_sessions) > Number(liquidity.lookback_days)
    || !finiteNumber(liquidity.coverage_pct) || liquidity.coverage_pct < activePolicy.liquidityMinCoveragePct || liquidity.coverage_pct > 100
    || Math.abs(liquidity.coverage_pct - (Number(liquidity.observed_sessions) / Number(liquidity.lookback_days)) * 100) > 0.15
    || !Number.isFinite(liquidityStart) || !Number.isFinite(liquidityEnd) || liquidityEnd < liquidityStart
    || liquidityEnd - liquidityStart < (Number(liquidity.lookback_days) - 1) * DAY_MS
    || liquidityAt < liquidityStart || liquidityAt > liquidityEnd || liquidityEnd !== quoteAt
    || liquidityEnd - liquidityAt > 14 * DAY_MS || evaluatedAtMs - liquidityAt > activePolicy.liquidityMaxAgeDays * DAY_MS
    || !finiteNumber(liquidity.median_daily_value_usd) || liquidity.median_daily_value_usd < activePolicy.minMedianDailyValueUsd
    || conversion.pair !== `${String(instrument.currency)}/USD`
    || !finiteNumber(conversion.rate_usd_per_currency) || conversion.rate_usd_per_currency <= 0
    || !Number.isFinite(conversionAt) || conversionAt > quoteAt || quoteAt - conversionAt > 14 * DAY_MS
    || !nonBlank(conversion.source)
  ) return null

  const riskAt = timestamp(marketRisk.as_of)
  if (!finiteNumber(marketRisk.ordinary_move_pct) || marketRisk.ordinary_move_pct <= 0 || !nonBlank(marketRisk.source)
    || !Number.isFinite(riskAt) || riskAt > evaluatedAtMs + CLOCK_SKEW_MS || riskAt > createdAt + CLOCK_SKEW_MS
    || evaluatedAtMs - riskAt > activePolicy.liquidityMaxAgeDays * DAY_MS
    || !Number.isInteger(marketRisk.lookback_days) || Number(marketRisk.lookback_days) < activePolicy.marketRiskLookbackMinDays
  ) return null

  const catalystStart = timestamp(catalyst.window_start)
  const catalystEnd = timestamp(catalyst.window_end)
  const catalystStatusAt = timestamp(catalyst.status_as_of)
  if (!Number.isFinite(catalystStart) || !Number.isFinite(catalystEnd) || !Number.isFinite(catalystStatusAt)
    || catalystStatusAt > createdAt + CLOCK_SKEW_MS || evaluatedAtMs - catalystStatusAt > activePolicy.quoteMaxAgeDays * DAY_MS
    || catalystStart < createdAt || catalystStart < admissionFrozenAt || catalystEnd < evaluatedAtMs || catalystEnd < catalystStart
    || catalystStart < horizonStart || catalystEnd > horizonEnd
  ) return null

  const falsifierDeadline = timestamp(falsifier.deadline)
  if (!Number.isFinite(falsifierDeadline) || falsifierDeadline < evaluatedAtMs
    || falsifierDeadline < horizonStart || falsifierDeadline > horizonEnd
  ) return null

  const bridge = candidate.valuation_bridge as Record<string, unknown>
  const bridgeMethod = String(bridge.method ?? '')
  const sourceHorizonDays = Number(bridge.source_horizon_days)
  const convergence = bridge.convergence_fraction
  const sourceIsLonger = sourceHorizonDays > horizonDays + 7
  const sourceIsSameHorizon = Math.abs(sourceHorizonDays - horizonDays) <= 7
  if (!Number.isInteger(sourceHorizonDays) || sourceHorizonDays <= 0
    || !['same_horizon', 'catalyst_partial_convergence', 'event_payoff'].includes(bridgeMethod)
    || !nonBlank(bridge.rationale, 20) || !nonBlank(bridge.source)
    || (bridgeMethod === 'catalyst_partial_convergence'
      ? !finiteNumber(convergence) || convergence <= 0 || convergence >= 1
      : convergence !== null)
    || (bridgeMethod === 'same_horizon' && !sourceIsSameHorizon)
    || (sourceIsLonger && bridgeMethod !== 'catalyst_partial_convergence')
    || (!sourceIsLonger && bridgeMethod === 'catalyst_partial_convergence')
    || (bridgeMethod === 'catalyst_partial_convergence' && finiteNumber(convergence)
      && convergence > Math.min(0.99, horizonDays / sourceHorizonDays + 0.05))
    || (bridgeMethod === 'event_payoff' && sourceHorizonDays > horizonDays + 7)
  ) return null

  const scenarioIds = scenarios.map((scenario) => String((scenario as Record<string, unknown>).scenario_id).trim())
  const scenarioLabels = scenarios.map((scenario) => String((scenario as Record<string, unknown>).label).trim())
  const metricLabels = metrics.scenario_returns.map((scenario) => String((scenario as Record<string, unknown>).label).trim())
  const probabilitySum = scenarios.reduce((sum, scenario) => sum + Number((scenario as Record<string, unknown>).probability_pct), 0)
  if (new Set(scenarioIds).size !== scenarios.length
    || new Set(scenarioLabels).size !== scenarios.length
    || new Set(metricLabels).size !== metrics.scenario_returns.length
    || metrics.scenario_returns.length !== scenarios.length
    || Math.abs(probabilitySum - 100) > probabilityTolerance
    || !closeTo(Number(metrics.probability_sum_pct), serverRound(probabilitySum, 4))
  ) return null

  const metricByLabel = new Map(metrics.scenario_returns.map((scenario) => {
    const row = scenario as Record<string, unknown>
    return [String(row.label).trim(), row]
  }))
  const computedReturns: Array<{ probability_pct: number; return_pct: number }> = []
  for (const rawScenario of scenarios) {
    const scenario = rawScenario as Record<string, unknown>
    const label = String(scenario.label).trim()
    const metricScenario = metricByLabel.get(label)
    if (!metricScenario) return null
    const probability = Number(scenario.probability_pct)
    if (!closeTo(Number(metricScenario.probability_pct), probability)) return null
    const longReturn = ((Number(scenario.price_target) - Number(quote.price)) / Number(quote.price)) * 100
    const targetReturn = longReturn // v1 qualified cards are long-only until source-bound borrow evidence exists
    const metricReturn = Number(metricScenario.return_pct)
    if (!closeTo(metricReturn, serverRound(targetReturn))
      || (finiteNumber(scenario.return_pct) && Math.abs(scenario.return_pct - serverRound(targetReturn)) > returnTolerance)
      || (scenario.conditions as string[]).length > 1 && !nonBlank(scenario.joint_probability_basis, 20)) return null
    const sourceTarget = Number(scenario.source_price_target)
    const expectedTarget = bridgeMethod === 'catalyst_partial_convergence' && finiteNumber(convergence)
      ? Number(quote.price) + convergence * (sourceTarget - Number(quote.price))
      : sourceTarget
    if (Math.abs(expectedTarget - Number(scenario.price_target)) > Math.max(0.01, Number(quote.price) * 0.0005)) return null
    computedReturns.push({ probability_pct: probability, return_pct: targetReturn })
  }
  const expectedReturn = computedReturns.reduce((sum, scenario) => sum + (scenario.probability_pct / 100) * scenario.return_pct, 0)
  const lossProbability = computedReturns.filter((scenario) => scenario.return_pct < 0).reduce((sum, scenario) => sum + scenario.probability_pct, 0)
  const worstCaseLoss = Math.max(0, -Math.min(...computedReturns.map((scenario) => scenario.return_pct)))
  const bestCaseReturn = Math.max(...computedReturns.map((scenario) => scenario.return_pct))
  const tailLoss = expectedShortfallLoss(computedReturns, activePolicy.tailProbabilityPct)
  if (!finiteNumber(tailLoss)
    || !closeTo(Number(metrics.expected_return_pct), serverRound(expectedReturn))
    || !closeTo(Number(metrics.loss_probability_pct), serverRound(lossProbability))
    || !closeTo(Number(metrics.worst_case_loss_pct), serverRound(worstCaseLoss))
    || !closeTo(Number(metrics.tail_loss_pct), serverRound(tailLoss))
    || !closeTo(Number(metrics.best_case_return_pct), serverRound(bestCaseReturn))
    || Number(metrics.expected_return_pct) < activePolicy.minExpectedReturnPct
    || Number(metrics.tail_loss_pct) > activePolicy.maxTailLossPct
    || Number(metrics.worst_case_loss_pct) > activePolicy.maxWorstCaseLossPct
  ) return null

  const adverseMoveBar = Math.max(activePolicy.minAdverseMovePct, Number(marketRisk.ordinary_move_pct) * activePolicy.minAdverseVsOrdinaryMove)
  const roundedReturns = computedReturns.map((scenario) => ({ ...scenario, return_pct: serverRound(scenario.return_pct) }))
  const adverseMass = roundedReturns.filter((scenario) => scenario.return_pct <= -adverseMoveBar)
    .reduce((sum, scenario) => sum + scenario.probability_pct, 0)
  if (adverseMass < activePolicy.minAdverseProbabilityPct
    || Number(metrics.best_case_return_pct) < Number(marketRisk.ordinary_move_pct) * activePolicy.minFavorableVsOrdinaryMove
  ) return null

  if (!isRecord(value.ranking)) return null
  const ranking = value.ranking
  if (ranking.policy_version !== RANKING_POLICY_VERSION
      || !['pre_data', 'insufficient', 'measured'].includes(String(ranking.calibration_status))
      || ranking.calibration_status !== research.calibration_status
      || !finiteNumber(ranking.raw_expected_return_pct)
      || !finiteNumber(ranking.positive_return_retention)
      || ranking.positive_return_retention !== 0.35
      || !finiteNumber(ranking.return_haircut_pct) || ranking.return_haircut_pct < 0 || ranking.return_haircut_pct > 100
      || !finiteNumber(ranking.conservative_expected_return_pct)
      || !finiteNumber(ranking.uncapped_evidence_confidence_score)
      || ranking.uncapped_evidence_confidence_score < 0 || ranking.uncapped_evidence_confidence_score > 100
      || !finiteNumber(ranking.evidence_confidence_cap)
      || ranking.evidence_confidence_cap !== 50
      || !finiteNumber(ranking.evidence_confidence_score)
      || ranking.evidence_confidence_score < 0 || ranking.evidence_confidence_score > ranking.evidence_confidence_cap
      || ranking.rationale !== RANKING_RATIONALES[calibrationStatus]
  ) return null
  const raw = ranking.raw_expected_return_pct
  const uncappedEvidence = Math.min(Number(research.data_sufficiency_score), Number(research.edge_score))
  const evidenceConfidence = uncappedEvidence <= 50
    ? uncappedEvidence * 0.8
    : 40 + ((uncappedEvidence - 50) / 50) * 10
  const expectedConservative = roundedReturns.reduce((sum, scenario) => {
    const adjustedReturn = scenario.return_pct > 0 ? scenario.return_pct * 0.35 : scenario.return_pct
    return sum + (scenario.probability_pct / 100) * adjustedReturn
  }, 0)
  if (!closeTo(raw, Number(metrics.expected_return_pct))
    || !closeTo(ranking.conservative_expected_return_pct, serverRound(expectedConservative))
    || ranking.conservative_expected_return_pct < activePolicy.minExpectedReturnPct
    || !closeTo(ranking.return_haircut_pct, 65)
    || !closeTo(ranking.uncapped_evidence_confidence_score, serverRound(uncappedEvidence))
    || !closeTo(ranking.evidence_confidence_score, serverRound(Math.min(evidenceConfidence, 50)))
  ) return null
  return value as unknown as QualifiedIdeaEvaluation
}

export interface QualifiedIdeasRuntime {
  board: QualifiedIdeasBoard | null
  invalidRowCount: number
  reason: string | null
}

function qualifiedDominates(left: QualifiedIdeaEvaluation, right: QualifiedIdeaEvaluation): boolean {
  const leftMetrics = left.metrics!
  const rightMetrics = right.metrics!
  const leftReturn = left.ranking!.conservative_expected_return_pct
  const rightReturn = right.ranking!.conservative_expected_return_pct
  const noWorse = leftReturn >= rightReturn
    && leftMetrics.tail_loss_pct <= rightMetrics.tail_loss_pct
    && leftMetrics.worst_case_loss_pct <= rightMetrics.worst_case_loss_pct
    && leftMetrics.loss_probability_pct <= rightMetrics.loss_probability_pct
  const better = leftReturn > rightReturn
    || leftMetrics.tail_loss_pct < rightMetrics.tail_loss_pct
    || leftMetrics.worst_case_loss_pct < rightMetrics.worst_case_loss_pct
    || leftMetrics.loss_probability_pct < rightMetrics.loss_probability_pct
  return noWorse && better
}

/** Rebuild the server's Pareto ordering so array order and pareto_layer cannot be altered in transit. */
function rankQualifiedRows(rows: QualifiedIdeaEvaluation[]): QualifiedIdeaEvaluation[] {
  const remaining = [...rows]
  const ranked: QualifiedIdeaEvaluation[] = []
  let layer = 1
  while (remaining.length > 0) {
    const frontier = remaining.filter((candidate) => !remaining.some((other) => other !== candidate && qualifiedDominates(other, candidate)))
    frontier.sort((left, right) =>
      (right.ranking!.evidence_confidence_score - left.ranking!.evidence_confidence_score)
      || (right.ranking!.conservative_expected_return_pct - left.ranking!.conservative_expected_return_pct)
      || (left.metrics!.tail_loss_pct - right.metrics!.tail_loss_pct)
      || (left.metrics!.worst_case_loss_pct - right.metrics!.worst_case_loss_pct)
      || (left.metrics!.loss_probability_pct - right.metrics!.loss_probability_pct)
      || (right.candidate.research.edge_score - left.candidate.research.edge_score)
      || left.candidate.idea_id.localeCompare(right.candidate.idea_id),
    )
    for (const row of frontier) {
      ranked.push({ ...row, pareto_layer: layer })
      remaining.splice(remaining.indexOf(row), 1)
    }
    layer++
  }
  return ranked
}

function qualifiedBoardHealth(value: unknown, qualifiedLength: number): Record<string, unknown> | null {
  if (!isRecord(value)
    || !QUALIFIED_HEALTH_STATUSES.has(String(value.status))
    || !QUALIFIED_HEALTH_OUTCOMES.has(String(value.outcome))
    || !nonBlank(value.reason)
    || !HEALTH_COUNT_KEYS.every((key) => Number.isInteger(value[key]) && Number(value[key]) >= 0)
    || (value.incomplete_count != null && (!Number.isInteger(value.incomplete_count) || Number(value.incomplete_count) < 0))
    || (value.publishing_count != null && (!Number.isInteger(value.publishing_count) || Number(value.publishing_count) < 0))
  ) return null
  const statusOutcomeCoherent = (value.status === 'pre_data' && value.outcome === 'no_artifacts')
    || (value.status === 'healthy' && ['publishing', 'none_clear', 'qualified'].includes(String(value.outcome)))
    || (value.status === 'degraded' && ['none_clear', 'qualified', 'invalid_artifacts', 'storage_error'].includes(String(value.outcome)))
  const parsedCount = Number(value.parsed_count)
  const qualifiedCount = Number(value.qualified_count)
  const partitionCount = qualifiedCount + Number(value.needs_research_count) + Number(value.does_not_clear_count)
  const outcomeRowsCoherent = qualifiedCount === qualifiedLength
    && parsedCount === partitionCount
    && Number(value.measured_count) <= parsedCount
    && (value.outcome !== 'qualified' || qualifiedCount > 0)
    && (value.outcome === 'qualified' || qualifiedCount === 0)
    && (value.outcome !== 'no_artifacts' || (Number(value.artifact_count) === 0 && parsedCount === 0 && Number(value.not_assessable_count) === 0))
    && (value.outcome !== 'publishing' || (qualifiedCount === 0 && Number(value.publishing_count ?? 0) > 0))
  return statusOutcomeCoherent && outcomeRowsCoherent ? value : null
}

/** Normalize only the qualified-board fields this component consumes. Valid frozen rows remain available
 * even when board health is degraded; bad rows are omitted and explicitly counted for the truth notice. */
export function normalizeQualifiedIdeasBoard(value: unknown, nowMs = Date.now()): QualifiedIdeasRuntime {
  if (!isRecord(value)) return { board: null, invalidRowCount: 0, reason: 'Qualified research was not supplied.' }
  const health = qualifiedBoardHealth(value.health, Array.isArray(value.qualified) ? value.qualified.length : -1)
  const policy = frozenPolicy(value.policy)
  const qualified = value.qualified
  const generatedAt = parseRfc3339Ms(value.generated_at)
  if (
    value.schema_version !== QUALIFIED_BOARD_SCHEMA
    || value.policy_version !== QUALIFICATION_POLICY_VERSION
    || !health || !policy
    || value.ranking_policy_version !== RANKING_POLICY_VERSION
    || !Number.isFinite(generatedAt) || generatedAt > nowMs + CLOCK_SKEW_MS
    || !['valid', 'expired', 'unknown'].includes(String(value.outcome_health_state))
    || !Array.isArray(qualified)
  ) return { board: null, invalidRowCount: 0, reason: 'Qualified research payload is malformed or from an unsupported version.' }

  const rows = qualified.map((row) => normalizeQualifiedIdeaRow(row, policy as Partial<QualifiedIdeasBoard['policy']>, generatedAt))
  const validRows = rows.filter((row): row is QualifiedIdeaEvaluation => row !== null)
  const ideaKeys = validRows.map((row) => row.candidate.idea_id)
  const listingKeys = validRows.map((row) => `${row.candidate.instrument.exchange.toUpperCase()}|${row.candidate.instrument.ticker.toUpperCase()}|${row.candidate.instrument.direction}`)
  if (new Set(ideaKeys).size !== validRows.length || new Set(listingKeys).size !== validRows.length) {
    return { board: null, invalidRowCount: 0, reason: 'Qualified research contains duplicate idea or listing identities.' }
  }
  const rankedRows = rankQualifiedRows(validRows)
  const safeHealth = {
    ...health,
    reason: typeof health.reason === 'string' ? health.reason : '',
    incomplete_count: finiteNumber(health.incomplete_count) ? health.incomplete_count : 0,
  }
  const statedOutcomeHealthState = String(value.outcome_health_state)
  const parsedOutcomeHealth = outcomeHealthRecord(value.outcome_health, nowMs)
  const outcomeHealthState = statedOutcomeHealthState !== 'unknown' && !parsedOutcomeHealth
    ? 'unknown'
    : parsedOutcomeHealth && parseRfc3339Ms(parsedOutcomeHealth.expires_at) <= nowMs
      ? 'expired'
      : statedOutcomeHealthState
  const outcomeHealth = outcomeHealthState === 'unknown' ? null : parsedOutcomeHealth
  return {
    board: {
      ...value,
      health: safeHealth,
      policy,
      outcome_health: outcomeHealth,
      outcome_health_state: outcomeHealthState,
      qualified: rankedRows,
    } as unknown as QualifiedIdeasBoard,
    invalidRowCount: qualified.length - validRows.length,
    reason: null,
  }
}

/** A pair is shown once for each explicit leg: its primary ticker is long and pair_with is short. */
function ideaMatchesSide(idea: Pick<BoardIdea, 'direction' | 'pair_with'>, side: IdeaSide): boolean {
  return idea.direction === side || (idea.direction === 'pair' && Boolean(idea.pair_with))
}

export function ideasForSide(ideas: readonly BoardIdea[], side: IdeaSide, nowMs = Date.now()): BoardIdea[] {
  return ideas.filter((idea) => !ideaIsStaleNow(idea, nowMs) && ideaMatchesSide(idea, side))
}

export interface ArchivedIdeasSideView {
  ideas: ArchivedLeadViewRow[]
  totalCount: number
  shownCount: number
  hiddenCount: number
  unconfirmedCount: number | null
  health: IdeasArchiveHealth | null
  retention: IdeasArchiveRetentionSide | null
  countsExact: boolean
}

type ArchivedLeadViewRow = Omit<ArchivedBoardIdea, 'idea_version' | 'idea_version_started_at'> & {
  idea_version?: string
  idea_version_started_at?: string
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}

function archiveCounts(value: unknown): IdeasArchiveSideCounts | null {
  if (!isRecord(value)
    || !nonNegativeInteger(value.total_count)
    || !nonNegativeInteger(value.shown_count)
    || !nonNegativeInteger(value.hidden_count)
    || value.shown_count + value.hidden_count !== value.total_count
  ) return null
  return value as unknown as IdeasArchiveSideCounts
}

function archiveUnconfirmedCounts(value: unknown): { long: number; short: number } | null {
  if (!isRecord(value)
    || !nonNegativeInteger(value.long)
    || !nonNegativeInteger(value.short)
  ) return null
  return { long: value.long, short: value.short }
}

function archiveHealth(value: unknown): IdeasArchiveHealth | null {
  if (!isRecord(value)
    || !['missing', 'ok', 'degraded', 'unreadable'].includes(String(value.status))
    || !nonNegativeInteger(value.file_count)
    || !nonNegativeInteger(value.suppression_count)
    || !nonNegativeInteger(value.corrupt_count)
    || !nonNegativeInteger(value.invalid_count)
    || !(value.error === null || typeof value.error === 'string')
  ) return null
  return value as unknown as IdeasArchiveHealth
}

function archiveRetentionSide(value: unknown): IdeasArchiveRetentionSide | null {
  if (!isRecord(value)
    || !nonNegativeInteger(value.evicted_count)
    || !(value.oldest_retained_at === null || Number.isFinite(parseRfc3339Ms(value.oldest_retained_at)))
  ) return null
  return value as unknown as IdeasArchiveRetentionSide
}

function normalizedIdeasArchive(value: unknown): IdeasArchive | null {
  if (!isRecord(value) || value.schema_version !== 'ideas-archive/v1' || !Array.isArray(value.rows)) return null
  const long = isRecord(value.side_counts) ? archiveCounts(value.side_counts.long) : null
  const short = isRecord(value.side_counts) ? archiveCounts(value.side_counts.short) : null
  const health = archiveHealth(value.health)
  const retention = isRecord(value.retention) ? archiveRetentionSide(value.retention) : null
  const retainedLong = isRecord(value.retention) && isRecord(value.retention.side_counts)
    ? archiveRetentionSide(value.retention.side_counts.long) : null
  const retainedShort = isRecord(value.retention) && isRecord(value.retention.side_counts)
    ? archiveRetentionSide(value.retention.side_counts.short) : null
  const unconfirmedCounts = value.unconfirmed_counts === undefined
    ? null
    : archiveUnconfirmedCounts(value.unconfirmed_counts)
  if (!long || !short || !health || !retention || !retainedLong || !retainedShort
    || !isRecord(value.retention) || typeof value.retention.truncated !== 'boolean'
    || value.retention.truncated !== (retention.evicted_count > 0)
    || retainedLong.evicted_count > retention.evicted_count
    || retainedShort.evicted_count > retention.evicted_count
    || !nonNegativeInteger(value.total_count)
    || !nonNegativeInteger(value.shown_count)
    || !nonNegativeInteger(value.hidden_count)
    || value.shown_count + value.hidden_count !== value.total_count
    || value.rows.length !== value.shown_count
  ) return null
  const rows = value.rows.filter(archivedBoardIdea)
  const rowKeys = rows.map(exactIdeaVersionKey)
  if (rows.length !== value.rows.length
    || new Set(rowKeys).size !== rows.length
    || rows.filter((row) => ideaMatchesSide(row, 'long')).length !== long.shown_count
    || rows.filter((row) => ideaMatchesSide(row, 'short')).length !== short.shown_count
  ) return null
  // History-audit counts are optional and independent from the saved rows. If only that metadata is
  // absent or malformed, keep the valid timeline and expose the count as unknown rather than zero.
  const { unconfirmed_counts: _discardedUnconfirmedCounts, ...archive } = value
  return {
    ...archive,
    ...(unconfirmedCounts ? { unconfirmed_counts: unconfirmedCounts } : {}),
  } as unknown as IdeasArchive
}

function archivedBoardIdea(value: unknown): value is ArchivedBoardIdea {
  return isRecord(value)
    && nonBlank(value.idea_id)
    && typeof value.idea_version === 'string' && IDEA_VERSION.test(value.idea_version)
    && Number.isFinite(parseRfc3339Ms(value.idea_version_started_at))
    && nonBlank(value.ticker)
    && (value.company === null || typeof value.company === 'string')
    && (value.exchange === null || typeof value.exchange === 'string')
    && ['long', 'short', 'pair'].includes(String(value.direction))
    && (value.direction !== 'pair' || nonBlank(value.pair_with))
    && typeof value.reason === 'string'
    && typeof value.why_now === 'string'
    && finiteNumber(value.trade_score)
    && ['evidence_gate_v1', 'evidence_gate_v2', 'pre_edge_proxy_legacy'].includes(String(value.trade_score_basis))
    && Array.isArray(value.missing_checks) && value.missing_checks.every((item) => typeof item === 'string')
    && nonBlank(value.thesis_type)
    && Array.isArray(value.source_headlines) && value.source_headlines.every((item) => typeof item === 'string')
    && (value.source_url === null || typeof value.source_url === 'string')
    && (value.source_name === null || typeof value.source_name === 'string')
    && typeof value.newest_source_at === 'string'
    && Number.isFinite(parseRfc3339Ms(value.decay_at))
    && value.status === 'expired'
    && value.stale === true
    && value.promoted_signal_id === null
    && Number.isFinite(parseRfc3339Ms(value.archived_at))
    && value.audit_only === true
    && ['expired', 'expired_pruned', 'historical_board_expired', 'latest_board_current'].includes(String(value.archive_reason))
}

function fallbackArchivedIdea(idea: BoardIdea): ArchivedLeadViewRow {
  return {
    ...idea,
    ...(typeof idea.idea_version === 'string' && IDEA_VERSION.test(idea.idea_version) ? { idea_version: idea.idea_version } : {}),
    ...(Number.isFinite(parseRfc3339Ms(idea.idea_version_started_at))
      ? { idea_version_started_at: idea.idea_version_started_at }
      : Number.isFinite(parseRfc3339Ms(idea.updated_at)) ? { idea_version_started_at: idea.updated_at } : {}),
    status: 'expired',
    stale: true,
    promoted_signal_id: null,
    archived_at: Number.isFinite(parseRfc3339Ms(idea.decay_at)) ? idea.decay_at : '',
    archive_reason: 'expired',
    audit_only: true,
  }
}

function exactIdeaVersionKey(idea: Pick<BoardIdea, 'idea_id' | 'idea_version' | 'idea_version_started_at'>): string | null {
  return typeof idea.idea_version === 'string' && IDEA_VERSION.test(idea.idea_version)
    && Number.isFinite(parseRfc3339Ms(idea.idea_version_started_at))
    ? `${idea.idea_id}|${idea.idea_version}|${idea.idea_version_started_at}`
    : null
}

function archiveRenderKey(idea: ArchivedLeadViewRow): string {
  return exactIdeaVersionKey(idea) || `${idea.idea_id}|legacy-current|${idea.idea_version_started_at || idea.updated_at || idea.decay_at}`
}

function archivedIdeaTime(idea: ArchivedLeadViewRow): number {
  const decay = parseRfc3339Ms(idea.decay_at)
  if (Number.isFinite(decay)) return decay
  const archived = parseRfc3339Ms(idea.archived_at)
  return Number.isFinite(archived) ? archived : 0
}

/** Merge the new bounded archive with stale rows from `board.ideas` during a rolling deploy. Any current
 * snapshot suppresses only its exact immutable version; prior versions of the same ticker and direction
 * remain visible as distinct audit history. */
export function archivedIdeasForSide(
  currentIdeas: readonly BoardIdea[],
  archiveValue: unknown,
  side: IdeaSide,
  nowMs = Date.now(),
): ArchivedIdeasSideView {
  const archive = normalizedIdeasArchive(archiveValue)
  const malformedHealth: IdeasArchiveHealth | null = archiveValue != null && !archive
    ? {
        status: 'unreadable', file_count: 0, suppression_count: 0,
        corrupt_count: 0, invalid_count: 1, error: 'archive_payload_malformed',
      }
    : null
  const currentVersions = new Set(currentIdeas.map(exactIdeaVersionKey).filter((key): key is string => Boolean(key)))
  const byVersion = new Map<string, ArchivedLeadViewRow>()
  const representedArchiveKeys = new Set<string>()
  const suppressedWithoutFallback = new Set<string>()
  const staleCurrentKeys = new Set(currentIdeas
    .filter((idea) => idea.status !== 'promoted' && ideaMatchesSide(idea, side) && ideaIsStaleNow(idea, nowMs))
    .map((idea) => exactIdeaVersionKey(idea) || `${idea.idea_id}|legacy-current`))

  for (const candidate of archive?.rows || []) {
    if (!archivedBoardIdea(candidate) || !ideaMatchesSide(candidate, side)) continue
    const key = archiveRenderKey(candidate)
    representedArchiveKeys.add(key)
    if (currentVersions.has(key)) {
      if (!staleCurrentKeys.has(key)) suppressedWithoutFallback.add(key)
      continue
    }
    const prior = byVersion.get(key)
    if (!prior || archivedIdeaTime(candidate) > archivedIdeaTime(prior)) byVersion.set(key, candidate)
  }
  // The client clock can expire a row before the next successful poll. Re-project that latest current
  // snapshot into the earlier lane immediately; malformed decay also fails closed here.
  for (const idea of currentIdeas) {
    if (idea.status === 'promoted' || !ideaMatchesSide(idea, side) || !ideaIsStaleNow(idea, nowMs)) continue
    const archived = fallbackArchivedIdea(idea)
    byVersion.set(archiveRenderKey(archived), archived)
  }

  const ideas = [...byVersion.values()].sort((left, right) => archivedIdeaTime(right) - archivedIdeaTime(left)
    || left.idea_id.localeCompare(right.idea_id) || String(left.idea_version || '').localeCompare(String(right.idea_version || '')))
  const stated = archive?.side_counts[side]
  const totalCount = Math.max(ideas.length, stated?.total_count || 0)
  const fallbackOutsideArchive = [...staleCurrentKeys].some((key) => !representedArchiveKeys.has(key))
  const countsExact = Boolean(archive) && !fallbackOutsideArchive && suppressedWithoutFallback.size === 0
  return {
    ideas,
    totalCount,
    shownCount: ideas.length,
    hiddenCount: Math.max(0, totalCount - ideas.length),
    unconfirmedCount: archive?.unconfirmed_counts?.[side] ?? null,
    health: archive?.health || malformedHealth,
    retention: archive?.retention.side_counts[side] || null,
    countsExact,
  }
}

export function qualifiedIdeasForSide(board: QualifiedIdeasBoard | null | undefined, side: IdeaSide): QualifiedIdeaEvaluation[] {
  if (!board || !Array.isArray(board.qualified)) return []
  const evaluatedAtMs = parseRfc3339Ms(board.generated_at)
  if (!Number.isFinite(evaluatedAtMs)) return []
  return board.qualified
    .map((row) => normalizeQualifiedIdeaRow(row, board.policy, evaluatedAtMs))
    .filter((idea): idea is QualifiedIdeaEvaluation => idea?.candidate.instrument.direction === side)
}

export function currentQualifiedIdeasForSide(
  board: QualifiedIdeasBoard | null | undefined,
  side: IdeaSide,
  nowMs = Date.now(),
): QualifiedIdeaEvaluation[] {
  return qualifiedIdeasForSide(board, side)
    .filter((idea) => !qualifiedIdeaFreshnessNow(idea, board?.policy, nowMs).refreshRequired)
}

export interface QualifiedIdeasEmptyStatePresentation {
  heading: string
  body: string
  healthReason: string | null
  state: 'checked' | 'checking' | 'unavailable'
}

/** The primary empty state is owned entirely by full research. News leads must never turn it off. */
export function qualifiedIdeasEmptyState(
  side: IdeaSide,
  runtime: QualifiedIdeasRuntime,
  nowMs = Date.now(),
): QualifiedIdeasEmptyStatePresentation | null {
  if (currentQualifiedIdeasForSide(runtime.board, side, nowMs).length > 0) return null
  const board = runtime.board
  const health = board?.health
  const frozenCount = qualifiedIdeasForSide(board, side).length
  const cleanBoard = Boolean(board) && runtime.invalidRowCount === 0
  const checked = cleanBoard
    && health?.status === 'healthy'
    && ['none_clear', 'qualified'].includes(String(health.outcome))
  const checking = cleanBoard
    && (health?.status === 'pre_data' || ['no_artifacts', 'publishing'].includes(String(health?.outcome)))
  const direction = side.toUpperCase()
  const healthReason = frozenCount > 0
    ? `${frozenCount} prior qualified forecast${frozenCount === 1 ? ' is' : 's are'} frozen for audit because ${frozenCount === 1 ? 'its' : 'their'} live evidence is no longer current.`
    : cleanBoard && nonBlank(health?.reason) ? health.reason.trim() : null
  const body = `For this side, default to no position. Do not open a ${direction} position from news leads; wait until a full-research forecast clears the 3–6 month bar.`

  if (checked) return {
    heading: `No qualified ${direction} 3–6 month idea.`,
    body,
    healthReason,
    state: 'checked',
  }
  if (checking) return {
    heading: `No qualified ${direction} 3–6 month idea yet.`,
    body,
    healthReason,
    state: 'checking',
  }
  return {
    heading: `No verified qualified ${direction} 3–6 month idea can be shown.`,
    body,
    healthReason,
    state: 'unavailable',
  }
}

export function IdeasTabs({ active, onSelect }: { active: IdeaSide; onSelect: (side: IdeaSide) => void }) {
  return (
    <div className="bideas__tabs" role="tablist" aria-label="Idea direction">
      {IDEA_SIDES.map((side) => (
        <button
          key={side}
          id={`ideas-${side}-tab`}
          type="button"
          role="tab"
          aria-controls={`ideas-${side}-panel`}
          aria-selected={active === side}
          tabIndex={active === side ? 0 : -1}
          className={`bideas__tab bideas__tab--${side}${active === side ? ' bideas__tab--on' : ''}`}
          onClick={() => onSelect(side)}
          onKeyDown={(event) => {
            const keyTarget = event.key === 'Home'
              ? 'long'
              : event.key === 'End'
                ? 'short'
                : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
                  ? side === 'long' ? 'short' : 'long'
                : null
            if (!keyTarget) return
            event.preventDefault()
            onSelect(keyTarget)
            document.getElementById(`ideas-${keyTarget}-tab`)?.focus()
          }}
        >
          {side.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// 👍/👎 on a surfaced idea — the self-grading loop, in the reader's exact visual language. A thumb click
// files the vote instantly (optimistic) and reveals an OPTIONAL one-tap reason above it; clicking the lit
// thumb again un-votes. Reasons refine the vote but are never required — fast by default.
function IdeaFeedback({ idea }: { idea: BoardIdea }) {
  const rate = useStore((s) => s.scRateIdea)
  const [open, setOpen] = useState<null | 'up' | 'down'>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])
  // While the reason popover is open, Escape or an outside click dismisses it, and focus moves into the
  // group so a keyboard / screen-reader user actually reaches (and hears) the reason chips.
  useEffect(() => {
    if (!open) return
    rootRef.current?.querySelector<HTMLButtonElement>('.ideafb__chip')?.focus()
    const onDown = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(null) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  const vote = idea.feedback

  const clickThumb = (pol: 'up' | 'down') => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (vote === pol) { setOpen(null); void rate(idea, 'clear'); return } // toggle off
    setOpen(pol)
    void rate(idea, pol) // files immediately; the reason is an optional refinement
    closeTimer.current = setTimeout(() => setOpen(null), 5000)
  }
  const pickReason = (pol: 'up' | 'down', reason: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(null); void rate(idea, pol, reason) }

  return (
    <div className="ideafb" ref={rootRef}>
      {open && (
        <span className="ideafb__reasons" role="group" aria-label="Why?">
          {(open === 'up' ? UP_REASONS : DOWN_REASONS).map((r) => (
            <button key={r} type="button" className="ideafb__chip" onClick={() => pickReason(open, r)}>{r}</button>
          ))}
        </span>
      )}
      <span className={`ideafb__shell${vote ? ' ideafb__shell--rated' : ''}`} role="group" aria-label="Rate this idea">
        <button type="button" className={`ideafb__thumb ideafb__thumb--up${vote === 'up' ? ' ideafb__thumb--on' : ''}`} onClick={() => clickThumb('up')} aria-pressed={vote === 'up'} aria-label="Good idea" title="Good idea">
          <svg viewBox="0 0 24 24" aria-hidden><path d={THUMB_UP} /></svg>
        </button>
        <button type="button" className={`ideafb__thumb ideafb__thumb--down${vote === 'down' ? ' ideafb__thumb--on' : ''}`} onClick={() => clickThumb('down')} aria-pressed={vote === 'down'} aria-label="Not a good idea" title="Not a good idea">
          <svg viewBox="0 0 24 24" aria-hidden><path d={THUMB_DOWN} /></svg>
        </button>
      </span>
    </div>
  )
}

function agoLabel(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const mins = Math.max(0, Math.round((Date.now() - t) / 60_000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 48) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

function prettyType(t: string): string { return t.replace(/_/g, ' ') }

export interface IdeaThemeAttribution {
  label: 'found through Themes' | 'theme corroborated'
  title: string
}

/** Keep provenance language narrower than the underlying data. A theme-only lead was discovered through
 * Themes; a mixed lead was already present on the wire and Themes supplied corroborating evidence. */
export function ideaThemeAttribution(
  idea: Pick<BoardIdea, 'origin_type' | 'source_themes'>,
): IdeaThemeAttribution | null {
  if (!idea.source_themes?.length) return null
  if (idea.origin_type === 'theme') {
    return {
      label: 'found through Themes',
      title: 'This lead entered the skim through a theme that cleared the evidence gate',
    }
  }
  if (idea.origin_type === 'mixed') {
    return {
      label: 'theme corroborated',
      title: 'This lead appeared on the wire and was corroborated by a theme that cleared the evidence gate',
    }
  }
  return null
}

// A paid gauntlet run is a real spend, so the CTA arms on the first click and fires on the second (the
// cockpit's "Scan now" idiom), auto-disarming after a few seconds. Self-contained: manages its own arm /
// sending / error state and calls the store directly, so the card list stays declarative.
function PromoteButton({ idea }: { idea: BoardIdea }) {
  const promote = useStore((s) => s.scPromoteIdea)
  const [phase, setPhase] = useState<'idle' | 'armed' | 'sending'>('idle')
  const [err, setErr] = useState<string | null>(null)
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (armTimer.current) clearTimeout(armTimer.current) }, [])

  if (idea.status === 'promoted') return <span className="bidea__sent">In the machine</span>
  if (idea.promotion_available === false) {
    return <span className="bidea__sent" title="Recovered from a committed board snapshot; strict promotion inputs are unavailable">Read-only recovery</span>
  }

  const rated = idea.prior_coverage?.has_run
  const onClick = () => {
    if (phase === 'sending') return
    if (phase === 'idle') {
      setErr(null)
      setPhase('armed')
      if (armTimer.current) clearTimeout(armTimer.current)
      armTimer.current = setTimeout(() => setPhase('idle'), 4000)
      return
    }
    if (armTimer.current) clearTimeout(armTimer.current)
    setPhase('sending')
    promote(idea).then(
      () => { /* board refresh flips the card to promoted; if it survives, reset */ setPhase('idle') },
      (e: any) => { setErr(e?.message || 'launch failed'); setPhase('idle') },
    )
  }

  const label = phase === 'sending' ? 'Sending…' : phase === 'armed' ? 'Confirm · run the machine' : rated ? 'Re-run the machine →' : 'Run the full machine →'

  return (
    <span className="bidea__ctawrap">
      <button
        type="button"
        className={`bidea__cta${phase === 'armed' ? ' bidea__cta--armed' : ''}`}
        onClick={onClick}
        title={phase === 'armed' ? 'Click again to launch the paid gauntlet' : 'Send this idea into the full paid screener gauntlet for a deep check'}
      >
        {label}
      </button>
      {err && <span className="bidea__err" role="alert">{err}</span>}
    </span>
  )
}

function signedPct(value: number): string { return `${value > 0 ? '+' : ''}${value.toFixed(1)}%` }

export function qualifiedIdeaReturnTag(idea: Pick<QualifiedIdeaEvaluation, 'metrics' | 'ranking'>): { label: string; title?: string } | null {
  const raw = idea.metrics?.expected_return_pct
  const adjusted = idea.ranking?.conservative_expected_return_pct
  if (typeof adjusted !== 'number' || !Number.isFinite(adjusted)) return null
  return {
    label: `policy-adjusted ${signedPct(adjusted)}`,
    title: typeof raw === 'number' && Number.isFinite(raw) ? `Raw scenario return ${signedPct(raw)}` : undefined,
  }
}

export function qualifiedIdeasWarning(board: QualifiedIdeasBoard | null | undefined): { label: string; title?: string } | null {
  if (board?.health.status !== 'degraded') return null
  const incomplete = board.health.incomplete_count ?? 0
  return {
    label: incomplete > 0
      ? `${incomplete} research run${incomplete === 1 ? '' : 's'} not published`
      : 'Research results incomplete',
    title: board.health.reason || undefined,
  }
}

export function qualifiedIdeasRuntimeWarning(runtime: QualifiedIdeasRuntime): { label: string; title?: string } | null {
  if (!runtime.board) return {
    label: 'Qualified research unavailable.',
    title: runtime.reason || undefined,
  }
  if (runtime.invalidRowCount > 0) return {
    label: `${runtime.invalidRowCount} malformed research forecast${runtime.invalidRowCount === 1 ? '' : 's'} hidden.`,
    title: 'Those rows could not be shown safely. Refresh the research board before relying on this list.',
  }
  return null
}

export function qualifiedIdeasOutcomeNotice(board: QualifiedIdeasBoard | null | undefined): { label: string; title?: string } | null {
  if (board?.health.status !== 'healthy' || board.health.outcome !== 'none_clear') return null
  return {
    label: 'Full research: no idea clears the bar.',
    title: board.health.reason || undefined,
  }
}

export function qualifiedOutcomeHealthWarning(
  board: QualifiedIdeasBoard | null | undefined,
  nowMs = Date.now(),
): { label: string; title?: string } | null {
  if (!board) return null
  if (board.health?.status === 'pre_data') return null
  const health = outcomeHealthRecord(board.outcome_health, nowMs)
  if (!health || board.outcome_health_state === 'unknown') return {
    label: 'Outcome checks unavailable.',
    title: 'No trustworthy outcome-health check is available.',
  }
  const expiredAt = Date.parse(String(health.expires_at))
  if (board.outcome_health_state === 'expired' || !Number.isFinite(expiredAt) || expiredAt <= nowMs) return {
    label: 'Outcome checks are out of date.',
    title: String(health.reason) || 'The latest outcome-health check has expired.',
  }
  // Normal pre-data is already expressed by the empty/checking copy. Reserve a separate banner for a
  // real integrity, freshness, or runtime defect so the two-tab skim stays quiet when nothing has run.
  if (health.status === 'pre_data') return null
  if (health.status === 'degraded') return {
    label: 'Outcome checks degraded.',
    title: String(health.reason),
  }
  if (health.status === 'error') return {
    label: 'Outcome checks failed.',
    title: String(health.reason),
  }
  return board.outcome_health_state === 'valid' && health.status === 'healthy'
    ? null
    : { label: 'Outcome checks unavailable.', title: String(health.reason) }
}

const SHORT_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
})

function qualifiedShortDate(value: string): string | null {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? SHORT_DATE.format(timestamp) : null
}

export function qualifiedIdeaQuoteLabel(
  quote: Pick<QualifiedIdeaEvaluation['candidate']['quote'], 'price' | 'as_of'>,
  currency: string,
): string | null {
  const asOf = qualifiedShortDate(quote.as_of)
  if (!Number.isFinite(quote.price) || quote.price <= 0 || !asOf) return null
  const price = quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  const unit = currency.trim().toUpperCase()
  return `frozen quote ${unit ? `${unit} ` : ''}${price} · as of ${asOf}`
}

export function qualifiedIdeaCatalystWindowLabel(
  catalyst: Pick<QualifiedIdeaEvaluation['candidate']['catalyst'], 'window_start' | 'window_end'>,
): string | null {
  const start = Date.parse(catalyst.window_start)
  const end = Date.parse(catalyst.window_end)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  return `${SHORT_DATE.format(start)} → ${SHORT_DATE.format(end)}`
}

export function qualifiedIdeaHorizonLabel(horizon: QualifiedIdeaEvaluation['candidate']['horizon']): string | null {
  const start = Date.parse(horizon.start)
  const end = Date.parse(horizon.end)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null
  const months = Math.max(1, Math.round((end - start) / (30.4375 * 86_400_000)))
  return `${months}mo forecast · ${SHORT_DATE.format(start)} → ${SHORT_DATE.format(end)}`
}

export interface QualifiedIdeaCalibrationPresentation {
  label: string
  note: string
  warning: boolean
}

/** Say plainly whether the probabilities have real outcome history behind them. The versioned ranking
 * contract is mandatory; the frozen research status keeps every displayed record honest. */
export function qualifiedIdeaCalibrationPresentation(idea: QualifiedIdeaEvaluation): QualifiedIdeaCalibrationPresentation {
  const status = idea.ranking?.calibration_status || idea.candidate.research.calibration_status
  const statusLabel = status === 'calibrated'
    ? 'unsupported calibration state'
    : status === 'measured'
      ? 'measured, not yet calibrated'
      : status === 'insufficient'
        ? 'not calibrated · too few outcomes'
        : 'pre-data probabilities · not calibrated'
  const confidence = idea.ranking?.evidence_confidence_score
  return {
    label: typeof confidence === 'number' && Number.isFinite(confidence)
      ? `${statusLabel} · evidence confidence ${confidence.toFixed(0)}/100`
      : statusLabel,
    note: idea.calibration_note,
    warning: status === 'pre_data' || status === 'insufficient' || status === 'calibrated',
  }
}

export interface QualifiedIdeaSourceRow { label: string; source: string }

/** Keep the card compact while retaining the actual attribution behind each material displayed claim. */
export function qualifiedIdeaSourceRows(candidate: QualifiedIdeaEvaluation['candidate']): QualifiedIdeaSourceRow[] {
  const scenarioSources = [...new Set((candidate.scenarios || []).map((scenario) => scenario.source?.trim()).filter(Boolean))]
  return [
    { label: 'Research decision', source: candidate.run_root },
    { label: 'Quote', source: candidate.quote.source || '' },
    { label: 'Catalyst', source: candidate.catalyst.source || '' },
    { label: 'Falsifier', source: candidate.falsifier.source || '' },
    { label: 'Scenarios', source: scenarioSources.join(' · ') },
  ].filter((row) => row.source.trim())
}

export function ideaScorePresentation(idea: Pick<BoardIdea, 'trade_score_basis'>): { label: string; title: string } {
  if (idea.trade_score_basis === 'evidence_gate_v2') return {
    label: 'lead research priority',
    title: 'News-only research priority, capped at 62/100 pending verified live price, liquidity, consensus, and full research. It is not investment conviction or a recommendation.',
  }
  if (idea.trade_score_basis === 'evidence_gate_v1') return {
    label: 'legacy lead research priority',
    title: 'Legacy news-only score from an earlier policy, capped at 44/100 in the current projection. It is not comparable with the current lead research priority, which is capped at 62/100 pending verified live price, liquidity, consensus, and full research; neither score is investment conviction or a recommendation.',
  }
  return {
    label: 'legacy pre-edge proxy',
    title: 'Legacy news-only surface estimate. It was not produced by the current lead research priority policy, is not comparable with its 62/100 cap, and is not investment conviction or a recommendation.',
  }
}

export function leadResearchPriorityValue(
  idea: Pick<BoardIdea, 'trade_score' | 'conviction' | 'trade_score_basis'>,
): number {
  const raw = finiteNumber(idea.trade_score)
    ? idea.trade_score
    : finiteNumber(idea.conviction) ? idea.conviction : 0
  const cap = idea.trade_score_basis === 'evidence_gate_v2'
    ? LEAD_RESEARCH_PRIORITY_CAP
    : idea.trade_score_basis === 'evidence_gate_v1'
      ? LEGACY_LEAD_RESEARCH_PRIORITY_CAP
      : 100
  return Math.max(0, Math.min(cap, raw))
}

export function QualifiedIdeaCard({
  idea,
  policy,
  evaluatedAtMs,
  nowMs = Date.now(),
}: {
  idea: QualifiedIdeaEvaluation
  policy?: Partial<QualifiedIdeasBoard['policy']> | null
  evaluatedAtMs?: number
  nowMs?: number
}) {
  const normalized = normalizeQualifiedIdeaRow(idea, policy, evaluatedAtMs ?? nowMs)
  if (!normalized) return null
  const candidate = normalized.candidate
  const metrics = normalized.metrics!
  const returnTag = qualifiedIdeaReturnTag(normalized)
  const horizonLabel = qualifiedIdeaHorizonLabel(candidate.horizon)
  const quoteLabel = qualifiedIdeaQuoteLabel(candidate.quote, candidate.instrument.currency)
  const catalystWindow = qualifiedIdeaCatalystWindowLabel(candidate.catalyst)
  const falsifierDeadline = qualifiedShortDate(candidate.falsifier.deadline)
  const sources = qualifiedIdeaSourceRows(candidate)
  const redFlags = candidate.research.unresolved_red_flags || []
  const calibration = qualifiedIdeaCalibrationPresentation(normalized)
  const freshness = policy
    ? qualifiedIdeaFreshnessNow(normalized, policy, nowMs)
    : { refreshRequired: true, reasons: ['freshness policy unavailable'] }
  return (
    <article className={`bidea${freshness.refreshRequired ? ' bidea--refresh' : ''}`}>
      <div className="bidea__head">
        <span className="bidea__ticker">{candidate.instrument.ticker}</span>
        <span className="bidea__co">{[candidate.instrument.company, candidate.instrument.exchange].filter(Boolean).join(' · ')}</span>
      </div>
      {freshness.refreshRequired && (
        <div className="bidea__refresh" role="status">
          <strong>Refresh required · frozen forecast only</strong>
          <ul>{freshness.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
      )}
      <p className="bidea__reason">{candidate.research.edge_proof}</p>
      <p className="bidea__why">
        <span className="bidea__whylabel">catalyst —</span> {candidate.catalyst.name}
        {catalystWindow && <span className="bidea__window"> · {catalystWindow}</span>}
      </p>
      <p className="bidea__why bidea__why--falsifier">
        <span className="bidea__whylabel">falsifier{falsifierDeadline ? ` by ${falsifierDeadline}` : ''} —</span>{' '}
        {candidate.falsifier.condition}
      </p>
      <div className="bidea__tags">
        <span className="bidea__tag bidea__tag--rated">full research</span>
        {returnTag && <span className="bidea__tag" title={returnTag.title}>{returnTag.label}</span>}
        {returnTag && <span className={`bidea__tag${calibration.warning ? ' bidea__tag--warn' : ''}`} title={calibration.note}>{calibration.label}</span>}
        {returnTag && quoteLabel && <span className="bidea__tag">{quoteLabel}</span>}
        {horizonLabel && <span className="bidea__tag">{horizonLabel}</span>}
        <span className="bidea__tag">worst case {metrics.worst_case_loss_pct.toFixed(1)}% loss</span>
        <span className="bidea__tag">loss chance {metrics.loss_probability_pct.toFixed(1)}%</span>
        <span className="bidea__tag">tail loss {metrics.tail_loss_pct.toFixed(1)}%</span>
      </div>
      <p className="bidea__calibration"><span>Calibration note —</span> {calibration.note}</p>
      {(candidate.catalyst.bullish_trigger || candidate.catalyst.bearish_trigger) && (
        <details className="bidea__disclosure">
          <summary>Catalyst triggers</summary>
          <dl>
            {candidate.catalyst.bullish_trigger && <div><dt>Bullish</dt><dd>{candidate.catalyst.bullish_trigger}</dd></div>}
            {candidate.catalyst.bearish_trigger && <div><dt>Bearish</dt><dd>{candidate.catalyst.bearish_trigger}</dd></div>}
          </dl>
        </details>
      )}
      <details className="bidea__disclosure bidea__scenarios">
        <summary>Scenarios ({candidate.scenarios.length})</summary>
        <ol>
          {candidate.scenarios.map((scenario, index) => {
            const scenarioReturn = metrics.scenario_returns.find((row) => row.label.trim() === scenario.label.trim())?.return_pct
            const target = scenario.price_target.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
            return (
              <li key={`${scenario.scenario_id || scenario.label}-${index}`}>
                <div>
                  <strong>{scenario.label}</strong> · {scenario.probability_pct.toFixed(1)}% probability
                  {' · '}target {candidate.instrument.currency} {target}
                  {typeof scenarioReturn === 'number' && Number.isFinite(scenarioReturn) && <> · return {signedPct(scenarioReturn)}</>}
                </div>
                <ul>{scenario.conditions.map((condition, conditionIndex) => <li key={`${scenario.scenario_id}-condition-${conditionIndex}`}>{condition}</li>)}</ul>
                {scenario.joint_probability_basis && <p><span>Joint probability basis —</span> {scenario.joint_probability_basis}</p>}
              </li>
            )
          })}
        </ol>
      </details>
      {redFlags.length > 0 && (
        <details className="bidea__disclosure bidea__disclosure--risk">
          <summary>{redFlags.length} unresolved risk{redFlags.length === 1 ? '' : 's'}</summary>
          <ul>
            {redFlags.map((flag, index) => (
              <li key={`${flag.id}-${index}`}><strong>{flag.severity}</strong> — {flag.description}</li>
            ))}
          </ul>
        </details>
      )}
      {sources.length > 0 && (
        <details className="bidea__disclosure">
          <summary>Evidence sources</summary>
          <dl>
            {sources.map((row) => (
              <div key={row.label}><dt>{row.label}</dt><dd>{row.source}</dd></div>
            ))}
          </dl>
        </details>
      )}
    </article>
  )
}

type NewsLeadCardProps =
  | { idea: BoardIdea; side: IdeaSide; auditOnly?: false; timelineStatus?: 'current' | 'promoted' }
  | { idea: ArchivedLeadViewRow; side: IdeaSide; auditOnly: true; timelineStatus?: 'expired' }

export function NewsLeadCard(props: NewsLeadCardProps) {
  const { idea, side } = props
  const auditOnly = props.auditOnly === true
  const macro = MACRO_TYPES.has(idea.thesis_type)
  const pc = idea.prior_coverage
  const rated = pc?.has_run
  const themeAttribution = ideaThemeAttribution(idea)
  const pair = idea.direction === 'pair'
  const ticker = pair && side === 'short' ? idea.pair_with : idea.ticker
  const company = pair && side === 'short' ? '' : [idea.company, idea.exchange].filter(Boolean).join(' · ')
  const scorePresentation = ideaScorePresentation(idea)
  const researchPriority = leadResearchPriorityValue(idea)
  const expiredAt = auditOnly ? qualifiedShortDate(idea.decay_at) : null
  const timelineStatus = props.timelineStatus
  const statusLabel = timelineStatus === 'current'
    ? 'Current'
    : timelineStatus === 'promoted'
      ? 'Sent to full research'
      : timelineStatus === 'expired'
        ? 'Expired'
        : auditOnly ? 'expired lead · audit only' : 'unverified news-only lead'
  return (
    <article className={`bidea bidea--lead${auditOnly ? ' bidea--expired' : ''}`}>
      <div className="bidea__head">
        <span className="bidea__ticker">{ticker}</span>
        {company && <span className="bidea__co">{company}</span>}
        {idea.newest_source_at && <span className="bidea__ago">{agoLabel(idea.newest_source_at)}</span>}
      </div>

      <p className="bidea__reason">{idea.reason || 'No plain-English reason produced for this idea.'}</p>

      {idea.why_now && (
        <p className="bidea__why"><span className="bidea__whylabel">why now —</span> {idea.why_now}</p>
      )}

      {(idea.source_headlines?.[0] || idea.source_name) && (
        <p className="bidea__source">
          <span>{auditOnly ? 'expired unverified lead · ' : 'unverified lead · '}</span>
          {idea.source_url
            ? <a href={idea.source_url} target="_blank" rel="noreferrer">{idea.source_headlines?.[0] || idea.source_name}</a>
            : <span>{idea.source_headlines?.[0] || idea.source_name}</span>}
          {idea.source_name && idea.source_headlines?.[0] && <small> · {idea.source_name}</small>}
          {idea.newest_source_at && <time dateTime={idea.newest_source_at}> · {agoLabel(idea.newest_source_at)}</time>}
        </p>
      )}

      <div className="bidea__tags">
        <span className={`bidea__tag ${auditOnly ? 'bidea__tag--expired' : 'bidea__tag--lead'}`}>
          {statusLabel}
        </span>
        {timelineStatus === 'expired' && <span className="bidea__tag">Saved record · view only</span>}
        {auditOnly && expiredAt && <span className="bidea__tag">past shelf life since {expiredAt}</span>}
        {themeAttribution && (
          <span className="bidea__tag bidea__tag--theme" title={themeAttribution.title}>
            {themeAttribution.label}
          </span>
        )}
        {pair && <span className="bidea__tag">pair · {side === 'long' ? `short ${idea.pair_with}` : `long ${idea.ticker}`}</span>}
        {macro && <span className="bidea__tag bidea__tag--warn">{prettyType(idea.thesis_type)} bet — not a pure stock pick</span>}
        {idea.priced_in === 'room' && <span className="bidea__tag">may not be priced in yet</span>}
        {idea.priced_in === 'priced' && <span className="bidea__tag">may already be priced in</span>}
        {!!idea.missing_checks?.length && <span className="bidea__tag bidea__tag--warn">needs {idea.missing_checks.slice(0, 2).join(' + ')}</span>}
        <span className={`bidea__tag bidea__tag--cov${rated ? ' bidea__tag--rated' : ''}`}>
          {rated
            ? `already rated${pc?.latest_decision ? ` · ${pc.latest_decision}` : ''}`
            : pc?.data_pool_present ? 'data on file — never rated' : 'fresh — never rated'}
        </span>
      </div>

      <div className="bidea__foot">
        <div className="bidea__read" title={scorePresentation.title}>
          <span className="bidea__readlabel">{auditOnly ? `historical ${scorePresentation.label}` : scorePresentation.label}</span>
          <span className="bidea__readnum">{researchPriority}<span className="bidea__readden">/100</span></span>
          <span className="bidea__bar" aria-hidden><span className="bidea__barfill" style={{ width: `${researchPriority}%` }} /></span>
        </div>
        {!props.auditOnly && props.idea.status !== 'promoted' && (
          <div className="bidea__actions">
            {props.idea.promotion_available !== false && <IdeaFeedback idea={props.idea} />}
            <PromoteButton idea={props.idea} />
          </div>
        )}
      </div>
    </article>
  )
}

export interface NewsIdeasTimelineRow {
  key: string
  idea: BoardIdea | ArchivedLeadViewRow
  status: 'current' | 'promoted' | 'expired'
  auditOnly: boolean
  timestamp: number
}

function timelineTime(idea: BoardIdea | ArchivedLeadViewRow): number {
  for (const value of [idea.updated_at, idea.surfaced_at, idea.newest_source_at, idea.decay_at]) {
    const parsed = parseRfc3339Ms(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

/** One honest timeline: current, sent-to-research, then expired. Every exact saved occurrence appears once. */
export function ideasTimelineForSide(
  currentIdeas: readonly BoardIdea[],
  archiveValue: unknown,
  side: IdeaSide,
  nowMs = Date.now(),
): { rows: NewsIdeasTimelineRow[]; archive: ArchivedIdeasSideView } {
  const archive = archivedIdeasForSide(currentIdeas, archiveValue, side, nowMs)
  const rows: NewsIdeasTimelineRow[] = []
  const seen = new Set<string>()
  for (const idea of currentIdeas) {
    if (!ideaMatchesSide(idea, side)) continue
    const status = idea.status === 'promoted' ? 'promoted' : ideaIsStaleNow(idea, nowMs) ? null : 'current'
    if (!status) continue
    const key = exactIdeaVersionKey(idea) || `${idea.idea_id}|current|${idea.idea_version_started_at || idea.updated_at}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({ key, idea, status, auditOnly: false, timestamp: timelineTime(idea) })
  }
  for (const idea of archive.ideas) {
    const key = archiveRenderKey(idea)
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({ key, idea, status: 'expired', auditOnly: true, timestamp: archivedIdeaTime(idea) })
  }
  const group = { current: 0, promoted: 1, expired: 2 }
  rows.sort((a, b) => group[a.status] - group[b.status] || b.timestamp - a.timestamp || a.key.localeCompare(b.key))
  return { rows, archive }
}

const IDEAS_TIMELINE_PAGE_SIZE = 20

export function NewsIdeasTimeline({
  currentIdeas,
  archiveValue,
  side,
  nowMs = Date.now(),
}: {
  currentIdeas: readonly BoardIdea[]
  archiveValue: unknown
  side: IdeaSide
  nowMs?: number
}) {
  const timeline = ideasTimelineForSide(currentIdeas, archiveValue, side, nowMs)
  const [visibleCount, setVisibleCount] = useState(IDEAS_TIMELINE_PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasMore = visibleCount < timeline.rows.length
  const showMore = () => setVisibleCount((count) => Math.min(timeline.rows.length, count + IDEAS_TIMELINE_PAGE_SIZE))

  useEffect(() => setVisibleCount(IDEAS_TIMELINE_PAGE_SIZE), [side])
  useEffect(() => {
    if (!hasMore || !sentinelRef.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) showMore()
    }, { rootMargin: '240px 0px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, timeline.rows.length])

  const incomplete = timeline.archive.health?.status !== 'ok' || !timeline.archive.countsExact
  const omitted = timeline.archive.retention?.evicted_count || 0
  const unconfirmed = timeline.archive.unconfirmedCount
  const historyUnchecked = unconfirmed === null
  return (
    <section className="bideas__timeline" aria-labelledby={`ideas-${side}-timeline-heading`}>
      <header className="bideas__sectionhead">
        <div>
          <h2 id={`ideas-${side}-timeline-heading`}>All saved {side.toUpperCase()} ideas</h2>
          <p>Current, sent to full research, and expired ideas in one timeline.</p>
        </div>
        <span>{timeline.rows.length} saved</span>
      </header>
      {(incomplete || omitted > 0 || (unconfirmed || 0) > 0 || historyUnchecked) && (
        <p className="bideas__archivewarning" role="status">
          Showing the saved records that can be confirmed.
          {(unconfirmed || 0) > 0 && ` ${unconfirmed} older record${unconfirmed === 1 ? '' : 's'} could not be confirmed.`}
          {omitted > 0 && ` ${omitted} older record${omitted === 1 ? ' is' : 's are'} no longer stored.`}
          {unconfirmed === null && (incomplete || historyUnchecked) && ' Some older records could not be checked.'}
          {incomplete && unconfirmed !== null && ' The saved list may be incomplete.'}
        </p>
      )}
      {timeline.rows.length > 0 ? (
        <div className="bideas__list bideas__leadlist">
          {timeline.rows.slice(0, visibleCount).map((row) => row.auditOnly
            ? <NewsLeadCard key={row.key} idea={row.idea as ArchivedLeadViewRow} side={side} auditOnly timelineStatus="expired" />
            : <NewsLeadCard key={row.key} idea={row.idea as BoardIdea} side={side} timelineStatus={row.status as 'current' | 'promoted'} />)}
        </div>
      ) : (
        <p className="bideas__queueempty">No saved {side.toUpperCase()} ideas yet.</p>
      )}
      {hasMore && (
        <div className="bideas__timeline-more" ref={sentinelRef}>
          <button type="button" onClick={showMore}>Show more</button>
          <span>{Math.min(visibleCount, timeline.rows.length)} of {timeline.rows.length}</span>
        </div>
      )}
    </section>
  )
}

export function newsLeadQueueEmptyMessage(
  leadsAvailable: boolean,
  leadHealth: unknown,
  loading = false,
): string {
  const health = isRecord(leadHealth) && leadHealth.schema_version === 'ideas-health/v1'
    ? leadHealth
    : null
  if (loading || (health && ['waiting', 'deferred', 'running'].includes(String(health.status)))) {
    return 'Checking for news leads…'
  }
  if (leadsAvailable && health?.status === 'healthy') return 'No live news leads in this direction.'
  return 'News lead queue unavailable.'
}

export function NewsLeadResearchQueue({
  ideas,
  side,
  leadsAvailable,
  leadHealth,
  expanded = false,
  loading = false,
}: {
  ideas: readonly BoardIdea[]
  side: IdeaSide
  leadsAvailable: boolean
  leadHealth: unknown
  expanded?: boolean
  loading?: boolean
}) {
  const health = isRecord(leadHealth) && leadHealth.schema_version === 'ideas-health/v1'
    ? leadHealth
    : null
  const checking = loading || Boolean(health && ['waiting', 'deferred', 'running'].includes(String(health.status)))
  const countLabel = checking
    ? 'checking · unverified · not recommendations'
    : leadsAvailable && health?.status === 'healthy'
      ? `${ideas.length} within shelf life · not recommendations`
      : 'availability unknown · unverified · not recommendations'
  const heading = (
    <>
      <span>Current news leads · unverified</span>
      <small>{countLabel}</small>
    </>
  )
  const body = (
      <div className="bideas__queuebody">
        <p className="bideas__queuedisclaimer">
          <strong>Unverified news-only leads.</strong> These rank what to research next. They are not recommendations or qualified 3–6 month calls.
        </p>
        {ideas.length > 0 ? (
          <div className="bideas__list bideas__leadlist">
            {ideas.map((idea) => <NewsLeadCard key={`lead-${idea.idea_id}`} idea={idea} side={side} />)}
          </div>
        ) : (
          <p className="bideas__queueempty">{newsLeadQueueEmptyMessage(leadsAvailable, leadHealth, loading)}</p>
        )}
      </div>
  )
  return expanded ? (
    <section className="bideas__queue bideas__queue--expanded" aria-label="Current news leads">
      <header className="bideas__queuehead">{heading}</header>
      {body}
    </section>
  ) : (
    <details className="bideas__queue">
      <summary>{heading}</summary>
      {body}
    </details>
  )
}

export function EarlierNewsLeadArchive({ view, side }: { view: ArchivedIdeasSideView; side: IdeaSide }) {
  const incomplete = view.health?.status !== 'ok' || !view.countsExact
  const evictedCount = view.retention?.evicted_count || 0
  if (view.totalCount === 0 && view.health === null && evictedCount === 0) return null
  const countLabel = incomplete
    ? `${view.shownCount} available · inventory incomplete${evictedCount ? ` · at least ${evictedCount} older omitted` : ''} · audit only`
    : `${view.shownCount} shown · ${view.hiddenCount} not shown · ${view.totalCount} retained${evictedCount ? ` · ${evictedCount} older omitted` : ''} · audit only`
  const healthMessage = view.health?.status === 'missing'
    ? 'Archive inventory is incomplete because stored earlier-lead history is missing. Retained expired board rows are shown when available.'
    : view.health?.status === 'degraded'
      ? 'Archive inventory is incomplete because some stored earlier leads could not be read.'
      : view.health?.status === 'unreadable'
        ? 'Archive inventory is incomplete because stored earlier-lead history could not be read. Retained expired board rows are shown when available.'
        : !view.countsExact && view.health === null
          ? 'Stored archive inventory is unavailable in this response. Retained expired board rows are shown when available.'
          : !view.countsExact
            ? 'Archive counts are catching up with leads that changed shelf-life state on this screen. Available audit rows are shown without claiming a complete total.'
            : null
  return (
    <details className="bideas__queue bideas__queue--archive">
      <summary>
        <span>Earlier news leads · past shelf life</span>
        <small>{countLabel}</small>
      </summary>
      <div className="bideas__queuebody">
        {healthMessage && <p className="bideas__archivewarning" role="status">{healthMessage}</p>}
        {evictedCount > 0 && (
          <p className="bideas__archivewarning" role="status">
            This is bounded history: {incomplete ? 'at least ' : ''}{evictedCount} older {side.toUpperCase()} lead revision{evictedCount === 1 ? ' was' : 's were'} omitted from retained history.
          </p>
        )}
        <p className="bideas__queuedisclaimer">
          <strong>Expired, audit-only news leads.</strong> These surfaced earlier but are no longer current. They are not recommendations and cannot be sent to full research from here.
        </p>
        {view.ideas.length > 0
          ? <div className="bideas__list bideas__leadlist">{view.ideas.map((idea) => <NewsLeadCard key={`archive-${archiveRenderKey(idea)}`} idea={idea} side={side} auditOnly />)}</div>
          : <p className="bideas__queueempty">Earlier lead details are not available in this response.</p>}
      </div>
    </details>
  )
}

export function IdeasSidePanel({
  panelSide,
  activeSide,
  leadRows,
  leadArchive,
  qualifiedRuntime,
  loading = false,
  nowMs = Date.now(),
}: {
  panelSide: IdeaSide
  activeSide: IdeaSide
  leadRows: readonly BoardIdea[]
  leadArchive?: unknown
  leadsAvailable: boolean
  leadHealth: unknown
  qualifiedRuntime: QualifiedIdeasRuntime
  loading?: boolean
  nowMs?: number
}) {
  const qualifiedBoard = qualifiedRuntime.board
  const allQualified = qualifiedIdeasForSide(qualifiedBoard, panelSide)
  const qualified = allQualified.filter((idea) => !qualifiedIdeaFreshnessNow(idea, qualifiedBoard?.policy, nowMs).refreshRequired)
  const frozenQualified = allQualified.filter((idea) => qualifiedIdeaFreshnessNow(idea, qualifiedBoard?.policy, nowMs).refreshRequired)
  const emptyState = qualified.length === 0
    ? qualifiedIdeasEmptyState(panelSide, qualifiedRuntime, nowMs)
    : null
  return (
    <section
      id={`ideas-${panelSide}-panel`}
      className="bideas__panel"
      role="tabpanel"
      aria-labelledby={`ideas-${panelSide}-tab`}
      hidden={activeSide !== panelSide}
    >
      <section className="bideas__qualified" aria-labelledby={`ideas-${panelSide}-qualified-heading`}>
        <header className="bideas__sectionhead">
          <div>
            <h2 id={`ideas-${panelSide}-qualified-heading`}>Qualified 3–6 month ideas</h2>
            <p>Ranked on risk/return frontiers: policy-adjusted return against tail loss, worst case, and loss probability; evidence confidence orders each frontier. News leads never enter this list.</p>
          </div>
          <span>{loading ? 'checking' : `${qualified.length} current`}</span>
        </header>
        {loading ? (
          <div className="bideas__list" aria-busy="true"><div className="bidea bidea--skeleton" /><div className="bidea bidea--skeleton" /></div>
        ) : qualified.length > 0 ? (
          <div className="bideas__list bideas__qualified-list">
            {qualified.map((idea) => (
              <QualifiedIdeaCard
                key={`qualified-${idea.candidate.idea_id}`}
                idea={idea}
                policy={qualifiedBoard?.policy}
                evaluatedAtMs={qualifiedBoard ? parseRfc3339Ms(qualifiedBoard.generated_at) : undefined}
                nowMs={nowMs}
              />
            ))}
          </div>
        ) : emptyState ? (
          <div className={`bideas__qualified-empty bideas__qualified-empty--${emptyState.state}`} role="status">
            <strong>{emptyState.heading}</strong>
            <p>{emptyState.body}</p>
            {emptyState.healthReason && <p className="bideas__healthreason"><span>Board health —</span> {emptyState.healthReason}</p>}
          </div>
        ) : null}
        {!loading && frozenQualified.length > 0 && (
          <details className="bideas__frozen">
            <summary>
              <span>Frozen forecast archive</span>
              <small>{frozenQualified.length} prior qualified · audit only</small>
            </summary>
            <div className="bideas__list bideas__frozen-list">
              {frozenQualified.map((idea) => (
                <QualifiedIdeaCard
                  key={`frozen-${idea.candidate.idea_id}`}
                  idea={idea}
                  policy={qualifiedBoard?.policy}
                  evaluatedAtMs={qualifiedBoard ? parseRfc3339Ms(qualifiedBoard.generated_at) : undefined}
                  nowMs={nowMs}
                />
              ))}
            </div>
          </details>
        )}
      </section>
      {!loading && (
        <NewsIdeasTimeline currentIdeas={leadRows} archiveValue={leadArchive} side={panelSide} nowMs={nowMs} />
      )}
    </section>
  )
}

export function BestIdeasView() {
  const scBoard = useStore((s) => s.scBoard)
  const boardFetch = useStore((s) => s.scBoardFetch)
  const refresh = useStore((s) => s.scRefreshBoard)
  const [side, setSide] = useState<IdeaSide>('long')
  const [nowMs, setNowMs] = useState(() => Date.now())

  // Keep both the data and wall-clock expiry backstop fresh while the tab is open. The clock update is
  // independent of a successful fetch, so an offline cached forecast still freezes on time.
  useEffect(() => {
    void refresh()
    const id = setInterval(() => {
      setNowMs(Date.now())
      void refresh()
    }, 30_000)
    return () => clearInterval(id)
  }, [refresh])

  const leadsAvailable = Array.isArray(scBoard?.ideas)
  const leadRows = leadsAvailable ? scBoard!.ideas! : []
  const coldError = !scBoard && boardFetch.status === 'error'
  const qualifiedRuntime = normalizeQualifiedIdeasBoard(scBoard?.qualified_ideas, nowMs)
  const qualifiedBoard = qualifiedRuntime.board
  const qualifiedRuntimeNotice = scBoard ? qualifiedIdeasRuntimeWarning(qualifiedRuntime) : null
  const qualifiedWarning = qualifiedIdeasWarning(qualifiedBoard)
  const qualifiedOutcomeNotice = qualifiedRuntime.invalidRowCount === 0
    ? qualifiedIdeasOutcomeNotice(qualifiedBoard)
    : null
  const outcomeHealthWarning = qualifiedOutcomeHealthWarning(qualifiedBoard, nowMs)

  return (
    <div className="bideas">
      <IdeasTabs active={side} onSelect={setSide} />
      {qualifiedWarning && (
        <div className="bideas__truthwarn" role="status" title={qualifiedWarning.title}>
          <span aria-hidden>!</span> {qualifiedWarning.label}
        </div>
      )}
      {qualifiedRuntimeNotice && (
        <div className="bideas__truthwarn" role="status" title={qualifiedRuntimeNotice.title}>
          <span aria-hidden>!</span> {qualifiedRuntimeNotice.label}
        </div>
      )}
      {qualifiedOutcomeNotice && (
        <div className="bideas__truthwarn bideas__truthwarn--truth" role="status" title={qualifiedOutcomeNotice.title}>
          <span aria-hidden>·</span> {qualifiedOutcomeNotice.label}
        </div>
      )}
      {outcomeHealthWarning && (
        <div className="bideas__truthwarn" role="status" title={outcomeHealthWarning.title}>
          <span aria-hidden>!</span> {outcomeHealthWarning.label}
        </div>
      )}
      {(coldError || (scBoard && boardFetch.error)) && (
        <div className={`bideas__fetch ${coldError ? 'bideas__fetch--bad' : 'bideas__fetch--warn'}`} role={coldError ? 'alert' : 'status'} aria-live={coldError ? 'assertive' : 'polite'} title={boardFetch.error || undefined}>
          <strong>{coldError ? 'Could not load ideas.' : boardFetch.status === 'refreshing' ? 'Refreshing…' : 'Could not refresh. Showing saved ideas.'}</strong>
          <button type="button" disabled={boardFetch.status === 'refreshing'} onClick={() => void refresh()}>{boardFetch.status === 'refreshing' ? 'Retrying…' : 'Retry'}</button>
        </div>
      )}
      {IDEA_SIDES.map((panelSide) => (
        <IdeasSidePanel
          key={panelSide}
          panelSide={panelSide}
          activeSide={side}
          leadRows={leadRows}
          leadArchive={scBoard?.ideas_archive}
          leadsAvailable={leadsAvailable}
          leadHealth={scBoard?.ideas_health}
          qualifiedRuntime={qualifiedRuntime}
          loading={!scBoard && !coldError}
          nowMs={nowMs}
        />
      ))}
    </div>
  )
}
