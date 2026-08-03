// Point-in-time admission and outcome contracts for qualified 3-6 month ideas.
//
// An idea enters the learning cohort only through an immutable admission snapshot captured near the
// frozen entry date. Outcome settlement consumes that snapshot, never a mutable research artifact.
// Every persisted row is content-addressed and every derived number is recomputed at the reader boundary.

import { createHash } from 'node:crypto'
import {
  evaluateQualifiedIdea,
  type QualifiedIdeaCandidate,
  type QualifiedIdeaEvaluation,
  type QualifiedIdeaMetrics,
} from './qualified-ideas'
import { parseRfc3339Ms } from './rfc3339'

export const MARKET_HISTORY_SCHEMA = 'market-history/v1' as const
export const QUALIFIED_IDEA_COHORT_ENTRY_SCHEMA = 'qualified-idea-cohort-entry/v1' as const
export const QUALIFIED_IDEA_OUTCOME_SCHEMA = 'qualified-idea-outcome/v2' as const

export interface MarketPricePoint { date: string; close: number }
export interface MarketHistory {
  schema_version: typeof MARKET_HISTORY_SCHEMA
  ticker: string
  exchange: string
  currency: string
  provider: string
  instrument_kind: 'equity' | 'benchmark' | 'sector'
  adjusted: boolean
  adjustment_basis: 'split_adjusted_price'
  source: string
  as_of: string
  security_status: 'active' | 'delisted'
  terminal_value?: { date: string; price: number; source: string } | null
  comparators?: { benchmark: string | null; sector: string | null; beta: number }
  session_calendar: { source: string; source_symbols: string[]; dates: string[] }
  points: MarketPricePoint[]
}

export interface QualifiedIdeaCohortEntry {
  schema_version: typeof QUALIFIED_IDEA_COHORT_ENTRY_SCHEMA
  admission_id: string
  cohort_key: string
  cohort_entry_sha256: string
  admission_sha256: string
  candidate_sha256: string
  evaluation_candidate_sha256: string
  market_evidence_sha256: string
  admitted_provider: string
  instrument_kind: 'equity'
  admitted_at: string
  captured_at: string
  candidate: QualifiedIdeaCandidate
  metrics: QualifiedIdeaMetrics
}

export type OutcomeHorizonDays = number
export type OutcomeExitBasis = 'split_adjusted_close_on_or_after_due' | 'source_bound_terminal_value'

export interface QualifiedIdeaOutcome {
  schema_version: typeof QUALIFIED_IDEA_OUTCOME_SCHEMA
  outcome_id: string
  outcome_sha256: string
  admission_id: string
  cohort_key: string
  admission_sha256: string
  candidate_sha256: string
  market_evidence_sha256: string
  admitted_at: string
  captured_at: string
  idea_id: string
  policy_version: string
  run_root: string
  ticker: string
  exchange: string
  currency: string
  price_provider: string
  instrument_kind: 'equity'
  direction: 'long' | 'short'
  horizon_days: OutcomeHorizonDays
  declared_horizon_started_at: string
  declared_horizon_due_at: string
  horizon_started_at: string
  horizon_due_at: string
  horizon_ended_at: string
  resolved_at: string
  price_source: string
  history_as_of: string
  quote_price_raw: number
  quote_as_of: string
  // `frozen_quote_price`, `admission_price`, and `entry_price` deliberately share one split-adjusted
  // basis. `quote_price_raw` retains the original audit value and the adjustment factor reconciles it.
  frozen_quote_price: number
  quote_adjustment_factor: number
  admission_price: number
  entry_price: number
  entry_price_basis: 'split_adjusted_first_close_on_or_after_start'
  entry_observed_at: string
  entry_slippage_pct: number
  exit_price: number
  exit_price_basis: OutcomeExitBasis
  exit_observed_at: string
  exit_grace_days: number
  exit_source: string
  terminal_source: string | null
  path_min_price: number
  path_max_price: number
  realized_strategy_return_pct: number
  max_favorable_excursion_pct: number
  max_adverse_excursion_pct: number
  benchmark_return_pct: number | null
  benchmark_beta: number | null
  benchmark_ticker: string | null
  benchmark_currency: string | null
  benchmark_source: string | null
  benchmark_as_of: string | null
  benchmark_provider: string | null
  sector_return_pct: number | null
  sector_ticker: string | null
  sector_currency: string | null
  sector_source: string | null
  sector_as_of: string | null
  sector_provider: string | null
  excess_vs_benchmark_pct: number | null
  excess_vs_sector_pct: number | null
  predicted_expected_return_pct: number
  predicted_loss_probability_pct: number
  predicted_positive_probability_pct: number
  predicted_tail_loss_pct: number
  predicted_min_return_pct: number
  predicted_max_return_pct: number
  realized_positive: boolean
  brier_positive_return: number
  within_scenario_range: boolean
  tail_loss_breached: boolean
  calibration_status: 'pre_data' | 'insufficient' | 'measured' | 'calibrated'
}

export type OutcomeResolution =
  | { status: 'resolved'; outcome: QualifiedIdeaOutcome }
  | { status: 'not_due' | 'unresolved'; reason_code: string; reason: string }

export interface QualifiedIdeaOutcomeReadResult {
  rows: QualifiedIdeaOutcome[]
  invalid_count: number
  duplicate_count: number
  conflicting_count: number
  quarantined_outcome_ids: string[]
  quarantined_cohort_keys: string[]
}

export interface QualifiedIdeaCohortEntryReadResult {
  rows: QualifiedIdeaCohortEntry[]
  invalid_count: number
  duplicate_count: number
  conflicting_count: number
  quarantined_cohort_keys: string[]
}

const DAY_MS = 86_400_000
const round = (n: number, places = 2) => {
  const p = 10 ** places
  return Math.round((n + Number.EPSILON) * p) / p
}
const parse = parseRfc3339Ms
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const nullableFinite = (v: unknown): boolean => v === null || finite(v)
const nonBlank = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const iso = (ms: number) => new Date(ms).toISOString()
const utcDayStart = (ms: number) => {
  const d = new Date(ms)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}
const exitGraceEnd = (dueMs: number, graceDays: number) => utcDayStart(dueMs) + (graceDays + 1) * DAY_MS - 1

function canonical(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('non-finite number')
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>
    return `{${Object.keys(row).sort().map((k) => `${JSON.stringify(k)}:${canonical(row[k])}`).join(',')}}`
  }
  throw new Error('non-JSON value')
}

function sha256(value: unknown): string {
  return createHash('sha256').update(canonical(value)).digest('hex')
}

function admissionCohortKey(c: QualifiedIdeaCandidate): string {
  return [c.policy_version, c.idea_id, c.run_root, iso(parse(c.horizon.end))].join('|')
}

function admittedProviderFor(c: QualifiedIdeaCandidate): string | null {
  const quote = c.quote.source.match(/^(.+) market feed, \d{4}-\d{2}-\d{2}$/)
  if (!quote?.[1]?.trim()) return null
  const provider = quote[1].trim()
  if (!c.liquidity.source.startsWith(`${provider} market feed close × volume;`)) return null
  if (c.market_risk.source !== `${provider} split-adjusted market feed`) return null
  return provider
}

function cohortEntryContent(snapshot: Omit<QualifiedIdeaCohortEntry, 'cohort_entry_sha256'>): unknown {
  return snapshot
}

export function createQualifiedIdeaCohortEntry(
  evaluation: QualifiedIdeaEvaluation,
  nowMs: number,
): QualifiedIdeaCohortEntry | null {
  if (evaluation.status !== 'qualified' || !evaluation.metrics || !evaluation.admission || !finite(nowMs)) return null
  const c = evaluation.candidate
  const createdMs = parse(c.created_at)
  const startMs = parse(c.horizon.start)
  const dueMs = parse(c.horizon.end)
  const capturedAtMs = parse(evaluation.admission.frozen_at)
  const evidenceTimes = [c.created_at, c.quote.as_of, c.liquidity.as_of, c.market_risk.as_of].map(parse)
  const evaluationCandidateSha = sha256(c)
  const admittedProvider = admittedProviderFor(c)
  if (
    !evidenceTimes.every(finite) || !finite(startMs) || !finite(dueMs) || dueMs <= startMs ||
    createdMs > capturedAtMs || evidenceTimes.some((x) => x > capturedAtMs) || capturedAtMs > nowMs ||
    capturedAtMs > startMs || !admittedProvider || c.instrument.asset_type !== 'equity' ||
    !/^[a-f0-9]{64}$/.test(evaluation.admission.admission_sha256) ||
    !/^[a-f0-9]{64}$/.test(evaluation.admission.candidate_sha256) ||
    evaluation.admission.candidate_sha256 !== evaluationCandidateSha
  ) return null
  const candidate = JSON.parse(JSON.stringify(c)) as QualifiedIdeaCandidate
  const metrics = JSON.parse(JSON.stringify(evaluation.metrics)) as QualifiedIdeaMetrics
  const capturedAt = iso(capturedAtMs)
  const admittedAt = capturedAt
  const cohortKey = admissionCohortKey(candidate)
  const base: Omit<QualifiedIdeaCohortEntry, 'cohort_entry_sha256'> = {
    schema_version: QUALIFIED_IDEA_COHORT_ENTRY_SCHEMA,
    admission_id: evaluation.admission.admission_id,
    cohort_key: cohortKey,
    admission_sha256: evaluation.admission.admission_sha256,
    candidate_sha256: evaluation.admission.candidate_sha256,
    evaluation_candidate_sha256: evaluationCandidateSha,
    market_evidence_sha256: candidate.market_evidence_sha256,
    admitted_provider: admittedProvider,
    instrument_kind: 'equity',
    admitted_at: admittedAt,
    captured_at: capturedAt,
    candidate,
    metrics,
  }
  return { ...base, cohort_entry_sha256: sha256(cohortEntryContent(base)) }
}

export function isQualifiedIdeaCohortEntry(v: unknown, nowMs = Number.POSITIVE_INFINITY): v is QualifiedIdeaCohortEntry {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const a = v as QualifiedIdeaCohortEntry
  try {
    const admitted = parse(a.admitted_at)
    const captured = parse(a.captured_at)
    const start = parse(a.candidate?.horizon?.start)
    if (
      a.schema_version !== QUALIFIED_IDEA_COHORT_ENTRY_SCHEMA || !nonBlank(a.admission_id) ||
      !nonBlank(a.cohort_key) || !/^[a-f0-9]{64}$/.test(a.cohort_entry_sha256) || !/^[a-f0-9]{64}$/.test(a.admission_sha256) ||
      !/^[a-f0-9]{64}$/.test(a.candidate_sha256) || !/^[a-f0-9]{64}$/.test(a.evaluation_candidate_sha256) ||
      !/^[a-f0-9]{64}$/.test(a.market_evidence_sha256) || a.market_evidence_sha256 !== a.candidate?.market_evidence_sha256 || !finite(admitted) || !finite(captured) ||
      admitted !== captured || a.admitted_at !== a.captured_at || captured > nowMs || !finite(start) || captured > start ||
      !a.candidate || !a.metrics || a.cohort_key !== admissionCohortKey(a.candidate) ||
      a.candidate.instrument.asset_type !== 'equity' || a.instrument_kind !== 'equity' ||
      !nonBlank(a.admitted_provider) || a.admitted_provider !== admittedProviderFor(a.candidate) ||
      a.candidate_sha256 !== sha256(a.candidate) || a.evaluation_candidate_sha256 !== sha256(a.candidate)
    ) return false
    const reconstructed = evaluateQualifiedIdea(a.candidate, { nowMs: admitted })
    if (reconstructed.status !== 'qualified' || !reconstructed.metrics || canonical(reconstructed.metrics) !== canonical(a.metrics)) return false
    const { cohort_entry_sha256: _digest, ...base } = a
    return a.cohort_entry_sha256 === sha256(cohortEntryContent(base))
  } catch { return false }
}

/** First valid admission per cohort wins; conflicting snapshots quarantine the whole cohort. */
export function readQualifiedIdeaCohortEntriesText(text: string, nowMs = Number.POSITIVE_INFINITY): QualifiedIdeaCohortEntryReadResult {
  const byCohort = new Map<string, QualifiedIdeaCohortEntry>()
  const bad = new Set<string>()
  let invalid = 0
  let duplicate = 0
  let conflicting = 0
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let raw: unknown
    try { raw = JSON.parse(line) } catch { invalid++; continue }
    if (!isQualifiedIdeaCohortEntry(raw, nowMs)) { invalid++; continue }
    const prior = byCohort.get(raw.cohort_key)
    if (!prior) { byCohort.set(raw.cohort_key, raw); continue }
    if (prior.cohort_entry_sha256 === raw.cohort_entry_sha256) duplicate++
    else { conflicting++; bad.add(raw.cohort_key) }
  }
  return {
    rows: [...byCohort.values()].filter((row) => !bad.has(row.cohort_key)),
    invalid_count: invalid,
    duplicate_count: duplicate,
    conflicting_count: conflicting,
    quarantined_cohort_keys: [...bad].sort(),
  }
}

export function outcomeIdFor(input: Pick<QualifiedIdeaOutcome,
  'policy_version' | 'idea_id' | 'run_root' | 'horizon_due_at' | 'candidate_sha256' | 'admission_sha256'
>): string {
  return 'QOUT-' + createHash('sha256').update([
    input.policy_version, input.idea_id, input.run_root, iso(parse(input.horizon_due_at)),
    input.candidate_sha256, input.admission_sha256,
  ].join('|')).digest('hex').slice(0, 20)
}

function outcomeDigest(o: Omit<QualifiedIdeaOutcome, 'outcome_sha256'>): string { return sha256(o) }

function strategyReturn(direction: 'long' | 'short', entry: number, price: number): number {
  const long = ((price - entry) / entry) * 100
  return direction === 'long' ? long : -long
}

function approximately(a: number, b: number, tolerance = 0.011): boolean {
  return Math.abs(a - b) <= tolerance
}

/** Strict reader boundary. Persisted IDs, digests, and every derivable metric are verified. */
export function isQualifiedIdeaOutcome(v: unknown, nowMs = Number.POSITIVE_INFINITY): v is QualifiedIdeaOutcome {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const o = v as QualifiedIdeaOutcome
  try {
    const start = parse(o.horizon_started_at)
    const due = parse(o.horizon_due_at)
    const declaredStart = parse(o.declared_horizon_started_at)
    const declaredDue = parse(o.declared_horizon_due_at)
    const ended = parse(o.horizon_ended_at)
    const resolved = parse(o.resolved_at)
    const admitted = parse(o.admitted_at)
    const captured = parse(o.captured_at)
    const entryAt = parse(o.entry_observed_at)
    const exitAt = parse(o.exit_observed_at)
    const historyAsOf = parse(o.history_as_of)
    const quoteAt = parse(o.quote_as_of)
    const declaredDurationMs = declaredDue - declaredStart
    const expectedDays = declaredDurationMs / DAY_MS
    const requiredStrings = [o.outcome_id, o.admission_id, o.idea_id, o.policy_version, o.run_root,
      o.ticker, o.exchange, o.currency, o.price_source, o.exit_source]
    if (
      o.schema_version !== QUALIFIED_IDEA_OUTCOME_SCHEMA || requiredStrings.some((x) => !nonBlank(x)) || !nonBlank(o.cohort_key) ||
      !/^[a-f0-9]{64}$/.test(o.outcome_sha256) || !/^[a-f0-9]{64}$/.test(o.admission_sha256) ||
      !/^[a-f0-9]{64}$/.test(o.candidate_sha256) || !/^[a-f0-9]{64}$/.test(o.market_evidence_sha256) ||
      !/^analyses\/[^/]+_\d{4}-\d{2}-\d{2}$/.test(o.run_root) || !/^[A-Z]{3}$/.test(o.currency) ||
      !nonBlank(o.price_provider) || o.instrument_kind !== 'equity' ||
      (o.direction !== 'long' && o.direction !== 'short') || !Number.isInteger(o.horizon_days) ||
      o.horizon_days < 90 || o.horizon_days > 183 || ![declaredStart, declaredDue, start, due, ended, resolved, admitted, captured, entryAt, exitAt, historyAsOf, quoteAt].every(finite) ||
      declaredDue <= declaredStart || due <= start || due - start !== declaredDurationMs ||
      ended !== Math.max(due, exitAt) || resolved < ended || admitted !== captured || o.admitted_at !== o.captured_at || captured > declaredStart ||
      quoteAt > admitted || entryAt !== start || utcDayStart(entryAt) < Math.max(utcDayStart(captured), utcDayStart(declaredStart)) ||
      utcDayStart(entryAt) > Math.max(utcDayStart(captured), utcDayStart(declaredStart)) + 7 * DAY_MS ||
      exitAt < start || exitAt > exitGraceEnd(due, o.exit_grace_days) ||
      exitAt > resolved || historyAsOf > resolved || historyAsOf < exitAt || resolved > nowMs ||
      Math.abs(o.horizon_days - expectedDays) > 0.51 ||
      o.cohort_key !== [o.policy_version, o.idea_id, o.run_root, iso(declaredDue)].join('|') ||
      !finite(o.quote_price_raw) || o.quote_price_raw <= 0 || !finite(o.frozen_quote_price) || o.frozen_quote_price <= 0 ||
      !finite(o.quote_adjustment_factor) || o.quote_adjustment_factor <= 0 ||
      !finite(o.admission_price) || !finite(o.entry_price) || o.entry_price <= 0 ||
      o.entry_price_basis !== 'split_adjusted_first_close_on_or_after_start' || !finite(o.entry_slippage_pct) ||
      !approximately(o.frozen_quote_price, o.admission_price, 1e-8) ||
      !approximately(o.quote_adjustment_factor, o.frozen_quote_price / o.quote_price_raw, 0.000001) ||
      !approximately(o.entry_slippage_pct, round(((o.entry_price - o.frozen_quote_price) / o.frozen_quote_price) * 100)) ||
      !finite(o.exit_price) || o.exit_price < 0 ||
      !['split_adjusted_close_on_or_after_due', 'source_bound_terminal_value'].includes(o.exit_price_basis) ||
      !Number.isInteger(o.exit_grace_days) || o.exit_grace_days < 0 || o.exit_grace_days > 10 ||
      (o.exit_price_basis === 'source_bound_terminal_value'
        ? !nonBlank(o.terminal_source) || o.terminal_source !== o.exit_source
        : o.terminal_source !== null || o.exit_source !== o.price_source || utcDayStart(exitAt) < utcDayStart(due)) ||
      !finite(o.path_min_price) || o.path_min_price < 0 || !finite(o.path_max_price) || o.path_max_price < o.path_min_price ||
      !finite(o.realized_strategy_return_pct) || !finite(o.max_favorable_excursion_pct) || o.max_favorable_excursion_pct < 0 ||
      !finite(o.max_adverse_excursion_pct) || o.max_adverse_excursion_pct < 0 ||
      !nullableFinite(o.benchmark_return_pct) || !nullableFinite(o.benchmark_beta) || !nullableFinite(o.sector_return_pct) ||
      !nullableFinite(o.excess_vs_benchmark_pct) || !nullableFinite(o.excess_vs_sector_pct) ||
      !finite(o.predicted_expected_return_pct) || !finite(o.predicted_loss_probability_pct) || o.predicted_loss_probability_pct < 0 || o.predicted_loss_probability_pct > 100 ||
      !finite(o.predicted_positive_probability_pct) || o.predicted_positive_probability_pct < 0 || o.predicted_positive_probability_pct > 100 ||
      !finite(o.predicted_tail_loss_pct) || o.predicted_tail_loss_pct < 0 ||
      !finite(o.predicted_min_return_pct) || !finite(o.predicted_max_return_pct) || o.predicted_min_return_pct > o.predicted_max_return_pct ||
      typeof o.realized_positive !== 'boolean' || !finite(o.brier_positive_return) || o.brier_positive_return < 0 || o.brier_positive_return > 1 ||
      typeof o.within_scenario_range !== 'boolean' || typeof o.tail_loss_breached !== 'boolean' ||
      !['pre_data', 'insufficient', 'measured', 'calibrated'].includes(o.calibration_status)
    ) return false
    const benchmarkConsistent = o.benchmark_return_pct === null
      ? o.benchmark_ticker === null && o.benchmark_currency === null && o.benchmark_source === null && o.benchmark_as_of === null && o.benchmark_provider === null && o.benchmark_beta === null && o.excess_vs_benchmark_pct === null
      : nonBlank(o.benchmark_ticker) && o.benchmark_currency === o.currency && nonBlank(o.benchmark_source) && o.benchmark_provider === o.price_provider && finite(parse(o.benchmark_as_of)) && parse(o.benchmark_as_of) >= due && parse(o.benchmark_as_of) <= resolved &&
        finite(o.benchmark_beta) && finite(o.excess_vs_benchmark_pct)
    const sectorConsistent = o.sector_return_pct === null
      ? o.sector_ticker === null && o.sector_currency === null && o.sector_source === null && o.sector_as_of === null && o.sector_provider === null && o.excess_vs_sector_pct === null
      : nonBlank(o.sector_ticker) && o.sector_currency === o.currency && nonBlank(o.sector_source) && o.sector_provider === o.price_provider && finite(parse(o.sector_as_of)) && parse(o.sector_as_of) >= due && parse(o.sector_as_of) <= resolved && finite(o.excess_vs_sector_pct)
    if (!benchmarkConsistent || !sectorConsistent) return false

    const realised = round(strategyReturn(o.direction, o.entry_price, o.exit_price))
    const favorable = round(Math.max(0,
      strategyReturn(o.direction, o.entry_price, o.path_min_price),
      strategyReturn(o.direction, o.entry_price, o.path_max_price)))
    const adverse = round(Math.max(0,
      -strategyReturn(o.direction, o.entry_price, o.path_min_price),
      -strategyReturn(o.direction, o.entry_price, o.path_max_price)))
    const positive = realised > 0
    const brier = round((o.predicted_positive_probability_pct / 100 - (positive ? 1 : 0)) ** 2, 4)
    const expectedBenchmarkExcess = o.benchmark_return_pct === null ? null
      : round(realised + (o.direction === 'long' ? -1 : 1) * (o.benchmark_beta ?? 1) * o.benchmark_return_pct)
    const expectedSectorExcess = o.sector_return_pct === null ? null
      : round(realised + (o.direction === 'long' ? -1 : 1) * o.sector_return_pct)
    if (
      !approximately(o.realized_strategy_return_pct, realised) || !approximately(o.max_favorable_excursion_pct, favorable) ||
      !approximately(o.max_adverse_excursion_pct, adverse) || o.realized_positive !== positive ||
      !approximately(o.brier_positive_return, brier, 0.00011) ||
      o.within_scenario_range !== (realised >= o.predicted_min_return_pct && realised <= o.predicted_max_return_pct) ||
      o.tail_loss_breached !== (Math.max(0, -realised) > o.predicted_tail_loss_pct) ||
      (expectedBenchmarkExcess === null ? o.excess_vs_benchmark_pct !== null : !approximately(o.excess_vs_benchmark_pct!, expectedBenchmarkExcess)) ||
      (expectedSectorExcess === null ? o.excess_vs_sector_pct !== null : !approximately(o.excess_vs_sector_pct!, expectedSectorExcess)) ||
      o.outcome_id !== outcomeIdFor(o)
    ) return false
    const { outcome_sha256: _digest, ...base } = o
    return o.outcome_sha256 === outcomeDigest(base)
  } catch { return false }
}

function outcomeCohortKey(o: QualifiedIdeaOutcome): string {
  return o.cohort_key
}

/** Reads an append-only ledger without letting a conflicting duplicate win by file order. */
export function readQualifiedIdeaOutcomesText(text: string, nowMs = Number.POSITIVE_INFINITY): QualifiedIdeaOutcomeReadResult {
  const byId = new Map<string, QualifiedIdeaOutcome>()
  const byCohort = new Map<string, QualifiedIdeaOutcome>()
  const badIds = new Set<string>()
  const badCohorts = new Set<string>()
  let invalid = 0
  let duplicate = 0
  let conflicting = 0
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let raw: unknown
    try { raw = JSON.parse(line) } catch { invalid++; continue }
    if (!isQualifiedIdeaOutcome(raw, nowMs)) { invalid++; continue }
    const row = raw
    const priorId = byId.get(row.outcome_id)
    const cohort = outcomeCohortKey(row)
    const priorCohort = byCohort.get(cohort)
    if (priorId) {
      if (priorId.outcome_sha256 === row.outcome_sha256) duplicate++
      else { conflicting++; badIds.add(row.outcome_id); badCohorts.add(cohort) }
      continue
    }
    if (priorCohort && priorCohort.outcome_sha256 !== row.outcome_sha256) {
      conflicting++; badIds.add(priorCohort.outcome_id); badIds.add(row.outcome_id); badCohorts.add(cohort)
      continue
    }
    byId.set(row.outcome_id, row)
    byCohort.set(cohort, row)
  }
  const rows = [...byId.values()].filter((row) => !badIds.has(row.outcome_id) && !badCohorts.has(outcomeCohortKey(row)))
  return {
    rows,
    invalid_count: invalid,
    duplicate_count: duplicate,
    conflicting_count: conflicting,
    quarantined_outcome_ids: [...badIds].sort(),
    quarantined_cohort_keys: [...badCohorts].sort(),
  }
}

interface ValidatedHistory {
  history: MarketHistory
  points: MarketPricePoint[]
  calendarDates: number[]
  asOfMs: number
}

function validateHistory(history: unknown, nowMs: number): ValidatedHistory | null {
  if (!history || typeof history !== 'object') return null
  const h = history as MarketHistory
  const asOfMs = parse(h.as_of)
  if (
    h.schema_version !== MARKET_HISTORY_SCHEMA || h.adjusted !== true || h.adjustment_basis !== 'split_adjusted_price' ||
    !nonBlank(h.ticker) || !nonBlank(h.exchange) || !/^[A-Za-z]{3}$/.test(h.currency) || !nonBlank(h.provider) ||
    !['equity', 'benchmark', 'sector'].includes(h.instrument_kind) || h.source !== `${h.provider} market feed` ||
    !finite(asOfMs) || asOfMs > nowMs || (h.security_status !== 'active' && h.security_status !== 'delisted') || !Array.isArray(h.points)
  ) return null
  if (h.security_status === 'active' && h.terminal_value != null) return null
  if (h.instrument_kind !== 'equity' && h.comparators != null) return null
  if (h.comparators != null && (
    typeof h.comparators !== 'object' ||
    ![h.comparators.benchmark, h.comparators.sector].every((x) => x === null || nonBlank(x)) ||
    !finite(h.comparators.beta) || h.comparators.beta < 0
  )) return null
  const calendar = h.session_calendar
  if (!calendar || calendar.source !== `${h.provider} provider-local session calendar` ||
      !Array.isArray(calendar.source_symbols) || !Array.isArray(calendar.dates)) return null
  const sourceSymbols = calendar.source_symbols.map((x) => typeof x === 'string' ? x.trim().toUpperCase() : '')
  if (sourceSymbols.some((x) => !x) || new Set(sourceSymbols).size !== sourceSymbols.length ||
      sourceSymbols.length < 2 || !sourceSymbols.includes(h.ticker.trim().toUpperCase())) return null
  const calendarDates: number[] = []
  const calendarDays = new Set<number>()
  for (const date of calendar.dates) {
    const ms = parse(date)
    const day = finite(ms) ? utcDayStart(ms) : NaN
    if (!finite(ms) || ms !== day || ms > asOfMs || ms > nowMs || calendarDays.has(day)) return null
    calendarDays.add(day)
    calendarDates.push(day)
  }
  calendarDates.sort((a, b) => a - b)
  if (!calendarDates.length) return null
  const byDay = new Map<number, MarketPricePoint>()
  for (const p of h.points) {
    const ms = parse(p?.date)
    const day = finite(ms) ? utcDayStart(ms) : NaN
    if (!finite(ms) || ms !== day || ms > asOfMs || ms > nowMs || !calendarDays.has(day) || !finite(p?.close) || p.close <= 0) return null
    const date = iso(day)
    const prior = byDay.get(day)
    if (prior && prior.close !== p.close) return null
    if (prior) return null
    byDay.set(day, { date, close: p.close })
  }
  const points = [...byDay.values()].sort((a, b) => parse(a.date) - parse(b.date))
  return { history: h, points, calendarDates, asOfMs }
}

function hasCompleteRelevantCoverage(v: ValidatedHistory, startMs: number, endMs: number): boolean {
  const startDay = utcDayStart(startMs)
  const endDay = utcDayStart(endMs)
  if (endDay < startDay) return false
  const expected = v.calendarDates.filter((day) => day >= startDay && day <= endDay)
  const observed = new Set(v.points.map((point) => utcDayStart(parse(point.date))))
  if (!expected.length || expected.some((day) => !observed.has(day))) return false
  const spanDays = Math.floor((endDay - startDay) / DAY_MS) + 1
  if (expected.length < Math.ceil(spanDays * 0.45)) return false
  for (let i = 1; i < expected.length; i++) {
    if (expected[i] - expected[i - 1] > 7 * DAY_MS) return false
  }
  return true
}

interface ExitPoint {
  date: string
  close: number
  basis: OutcomeExitBasis
  source: string
  terminalSource: string | null
}

function terminalEvent(v: ValidatedHistory, startMs: number, dueMs: number, graceDays: number, nowMs: number): ExitPoint | null | false {
  if (v.history.security_status !== 'delisted') return null
  const t = v.history.terminal_value
  const ms = parse(t?.date)
  if (
    !t || !finite(ms) || ms !== utcDayStart(ms) || ms < startMs || ms > nowMs || ms > v.asOfMs ||
    !finite(t.price) || t.price < 0 || !nonBlank(t.source)
  ) return false
  // A valid terminal event after the allowed exit window does not overwrite an earlier eligible due
  // close. It remains irrelevant to this frozen horizon rather than making a settleable outcome fail.
  if (ms > exitGraceEnd(dueMs, graceDays)) return null
  return { date: iso(ms), close: t.price, basis: 'source_bound_terminal_value', source: t.source.trim(), terminalSource: t.source.trim() }
}

function endpoint(v: ValidatedHistory, startMs: number, dueMs: number, graceDays: number, nowMs: number): ExitPoint | null | false {
  const terminal = terminalEvent(v, startMs, dueMs, graceDays, nowMs)
  if (terminal === false) return false
  const dueDay = utcDayStart(dueMs)
  const regular = v.points.find((p) => parse(p.date) >= dueDay && parse(p.date) <= dueDay + graceDays * DAY_MS)
  // A terminal event ends the security. It overrides all stale/provider prices at or after that event.
  if (terminal && (!regular || utcDayStart(parse(terminal.date)) <= utcDayStart(parse(regular.date)))) return terminal
  return regular ? {
    date: regular.date, close: regular.close, basis: 'split_adjusted_close_on_or_after_due',
    source: v.history.source, terminalSource: null,
  } : terminal
}

function forecastPoint(v: ValidatedHistory, quoteMs: number): MarketPricePoint | null {
  const quoteDay = utcDayStart(quoteMs)
  return v.points.find((p) => parse(p.date) === quoteDay) || null
}

function executableStartpoint(v: ValidatedHistory, admittedMs: number, declaredStartMs: number): MarketPricePoint | null {
  const earliestDay = Math.max(utcDayStart(admittedMs), utcDayStart(declaredStartMs))
  const expectedDay = v.calendarDates.find((day) => day >= earliestDay && day <= earliestDay + 7 * DAY_MS)
  if (!finite(expectedDay)) return null
  return v.points.find((point) => parse(point.date) === expectedDay) || null
}

interface RelativeResult { returnPct: number; source: string; asOf: string; provider: string }
function relativeReturn(
  history: MarketHistory | undefined,
  expectedTicker: string | null,
  expectedKind: 'benchmark' | 'sector',
  expectedProvider: string,
  currency: string,
  startMs: number,
  dueMs: number,
  graceDays: number,
  nowMs: number,
): RelativeResult | null {
  if (!expectedTicker || !history) return null
  const v = validateHistory(history, nowMs)
  if (!v || v.history.security_status !== 'active' || v.history.instrument_kind !== expectedKind ||
      v.history.provider !== expectedProvider || v.history.ticker.trim().toUpperCase() !== expectedTicker.trim().toUpperCase() ||
      v.history.currency.trim().toUpperCase() !== currency.trim().toUpperCase()) return null
  const startDay = utcDayStart(startMs)
  const dueDay = utcDayStart(dueMs)
  const expectedStartDay = v.calendarDates.find((day) => day >= startDay && day <= startDay + 3 * DAY_MS)
  const start = finite(expectedStartDay) ? v.points.find((p) => parse(p.date) === expectedStartDay) : null
  const end = v.points.find((p) => parse(p.date) >= dueDay && parse(p.date) <= dueDay + graceDays * DAY_MS)
  if (!start || !end || v.asOfMs < parse(end.date) || !hasCompleteRelevantCoverage(v, parse(start.date), parse(end.date))) return null
  return {
    returnPct: round(((end.close - start.close) / start.close) * 100),
    source: v.history.source,
    asOf: iso(v.asOfMs),
    provider: v.history.provider,
  }
}

export function resolveQualifiedIdeaOutcome(
  admission: QualifiedIdeaCohortEntry,
  history: MarketHistory,
  opts: {
    nowMs?: number
    graceDays?: number
    benchmarkHistory?: MarketHistory
    sectorHistory?: MarketHistory
  },
): OutcomeResolution {
  const nowMs = opts.nowMs ?? Date.now()
  const graceDays = opts.graceDays ?? 7
  if (!isQualifiedIdeaCohortEntry(admission, nowMs)) {
    return { status: 'unresolved', reason_code: 'admission_snapshot_invalid', reason: 'Settlement requires an immutable, content-addressed admission snapshot captured near entry.' }
  }
  const c = admission.candidate
  const metrics = admission.metrics
  const declaredStartMs = parse(c.horizon.start)
  const declaredDueMs = parse(c.horizon.end)
  const quoteMs = parse(c.quote.as_of)
  const capturedMs = parse(admission.captured_at)
  const exactHorizonDays = (declaredDueMs - declaredStartMs) / DAY_MS
  if (!finite(exactHorizonDays) || exactHorizonDays < 90 || exactHorizonDays > 183) {
    return { status: 'unresolved', reason_code: 'forecast_horizon_mismatch', reason: 'The admission snapshot does not contain one exact 90-183 day holding period.' }
  }
  if (![c.created_at, c.quote.as_of, c.liquidity.as_of, c.market_risk.as_of].map(parse).every((x) => finite(x) && x <= nowMs) || capturedMs > nowMs) {
    return { status: 'unresolved', reason_code: 'future_admission_evidence', reason: 'Admission evidence cannot be observed after the injected settlement clock.' }
  }
  if (!Number.isInteger(graceDays) || graceDays < 0 || graceDays > 10) {
    return { status: 'unresolved', reason_code: 'invalid_grace_window', reason: 'The exit grace window must be an integer from zero to ten calendar days.' }
  }
  if (nowMs < declaredDueMs) return { status: 'not_due', reason_code: 'horizon_open', reason: 'The earliest possible executable holding period has not ended.' }
  const v = validateHistory(history, nowMs)
  if (!v) return { status: 'unresolved', reason_code: 'history_unverified', reason: 'A source-bound split-adjusted history with no future observations is required.' }
  if (
    v.history.ticker.trim().toUpperCase() !== c.instrument.ticker.trim().toUpperCase() ||
    v.history.exchange.trim().toUpperCase() !== c.instrument.exchange.trim().toUpperCase() ||
    v.history.currency.trim().toUpperCase() !== c.instrument.currency.trim().toUpperCase()
  ) return { status: 'unresolved', reason_code: 'history_identity_mismatch', reason: 'Price history does not identify the admitted listing and currency.' }
  if (v.history.instrument_kind !== 'equity') {
    return { status: 'unresolved', reason_code: 'history_role_mismatch', reason: 'The admitted security must settle from a history explicitly identified as an equity.' }
  }
  if (v.history.provider !== admission.admitted_provider) {
    return { status: 'unresolved', reason_code: 'history_provider_mismatch', reason: 'Outcome history must come from the exact provider frozen at admission.' }
  }

  const forecast = forecastPoint(v, quoteMs)
  if (!forecast) return { status: 'unresolved', reason_code: 'forecast_price_missing', reason: 'No adjusted observation reconciles the frozen forecast quote session.' }
  const start = executableStartpoint(v, capturedMs, declaredStartMs)
  if (!start) return { status: 'unresolved', reason_code: 'entry_price_missing', reason: 'The first provider-calendar session on or after admission and the declared start has no executable adjusted close.' }
  const startMs = parse(start.date)
  const dueMs = startMs + exactHorizonDays * DAY_MS
  if (nowMs < dueMs) return { status: 'not_due', reason_code: 'horizon_open', reason: 'The holding period derived from the first executable entry session has not ended.' }
  const end = endpoint(v, startMs, dueMs, graceDays, nowMs)
  if (end === false) return { status: 'unresolved', reason_code: 'delisting_terminal_value_missing', reason: 'A delisted security needs a source-bound terminal value within the allowed exit window.' }
  if (!end) {
    // The horizon can end before that session's official close is published, or on a holiday/weekend.
    // While the declared exit-grace window is still open, absence is expected pending data—not missing
    // history and not a provider failure. Once the window closes, the same absence becomes unresolved.
    if (v.history.security_status === 'active' && nowMs <= exitGraceEnd(dueMs, graceDays)) {
      return { status: 'not_due', reason_code: 'endpoint_pending', reason: 'The first eligible exit observation has not occurred yet.' }
    }
    return { status: 'unresolved', reason_code: 'end_price_missing', reason: `No split-adjusted close or terminal value exists within ${graceDays} days of the frozen due date.` }
  }
  if (parse(end.date) > nowMs) return { status: 'not_due', reason_code: 'endpoint_pending', reason: 'The first eligible exit observation has not occurred yet.' }
  if (v.asOfMs < parse(end.date)) return { status: 'unresolved', reason_code: 'history_provenance_invalid', reason: 'History as-of must cover the selected exit observation without exceeding the settlement clock.' }
  const terminal = terminalEvent(v, startMs, dueMs, graceDays, nowMs)
  const terminalDay = terminal ? utcDayStart(parse(terminal.date)) : Number.POSITIVE_INFINITY
  const lastPreTerminal = terminal
    ? [...v.points].reverse().find((point) => parse(point.date) < terminalDay && parse(point.date) >= startMs)
    : null
  const coverageEnd = terminal ? parse(lastPreTerminal?.date ?? start.date) : parse(end.date)
  if (!hasCompleteRelevantCoverage(v, startMs, coverageEnd)) {
    return { status: 'unresolved', reason_code: 'history_coverage_incomplete', reason: 'Provider-calendar sessions are missing from the executable entry-to-exit path.' }
  }
  const path = v.points.filter((p) => parse(p.date) >= parse(start.date) && parse(p.date) <= parse(end.date) && utcDayStart(parse(p.date)) < terminalDay)
  path.push({ date: end.date, close: end.close })
  const entry = start.close
  const direction = c.instrument.direction
  const pathPrices = [entry, ...path.map((p) => p.close), end.close]
  const pathMin = Math.min(...pathPrices)
  const pathMax = Math.max(...pathPrices)
  const realised = round(strategyReturn(direction, entry, end.close))
  const favorable = round(Math.max(0, strategyReturn(direction, entry, pathMin), strategyReturn(direction, entry, pathMax)))
  const adverse = round(Math.max(0, -strategyReturn(direction, entry, pathMin), -strategyReturn(direction, entry, pathMax)))
  const expectedBenchmark = nonBlank(v.history.comparators?.benchmark) ? v.history.comparators!.benchmark!.trim() : null
  const expectedSector = nonBlank(v.history.comparators?.sector) ? v.history.comparators!.sector!.trim() : null
  const benchmark = relativeReturn(opts.benchmarkHistory, expectedBenchmark, 'benchmark', admission.admitted_provider, c.instrument.currency, startMs, dueMs, graceDays, nowMs)
  const sector = relativeReturn(opts.sectorHistory, expectedSector, 'sector', admission.admitted_provider, c.instrument.currency, startMs, dueMs, graceDays, nowMs)
  const beta = benchmark && finite(v.history.comparators?.beta) && v.history.comparators!.beta >= 0 ? v.history.comparators!.beta : null
  const benchmarkReturn = beta === null ? null : benchmark!.returnPct
  const sectorReturn = sector?.returnPct ?? null
  const relative = (comparator: number | null, factor: number) => comparator === null ? null
    : round(realised + (direction === 'long' ? -1 : 1) * factor * comparator)
  const scenarioValues = metrics.scenario_returns.map((x) => x.return_pct)
  const predictedPositive = round(Math.max(0, Math.min(100,
    metrics.scenario_returns.filter((x) => x.return_pct > 0).reduce((n, x) => n + x.probability_pct, 0),
  )))
  const realisedPositive = realised > 0
  const horizonEnded = iso(Math.max(dueMs, parse(end.date)))
  const base: Omit<QualifiedIdeaOutcome, 'outcome_sha256'> = {
    schema_version: QUALIFIED_IDEA_OUTCOME_SCHEMA,
    outcome_id: outcomeIdFor({
      policy_version: c.policy_version, idea_id: c.idea_id, run_root: c.run_root,
      horizon_due_at: iso(dueMs), candidate_sha256: admission.candidate_sha256,
      admission_sha256: admission.admission_sha256,
    }),
    admission_id: admission.admission_id,
    cohort_key: admission.cohort_key,
    admission_sha256: admission.admission_sha256,
    candidate_sha256: admission.candidate_sha256,
    market_evidence_sha256: admission.market_evidence_sha256,
    admitted_at: admission.admitted_at,
    captured_at: admission.captured_at,
    idea_id: c.idea_id,
    policy_version: c.policy_version,
    run_root: c.run_root,
    ticker: c.instrument.ticker,
    exchange: c.instrument.exchange,
    currency: c.instrument.currency,
    price_provider: admission.admitted_provider,
    instrument_kind: 'equity',
    direction,
    horizon_days: Math.round(exactHorizonDays),
    declared_horizon_started_at: iso(declaredStartMs),
    declared_horizon_due_at: iso(declaredDueMs),
    horizon_started_at: iso(startMs),
    horizon_due_at: iso(dueMs),
    horizon_ended_at: horizonEnded,
    resolved_at: iso(nowMs),
    price_source: v.history.source,
    history_as_of: iso(v.asOfMs),
    quote_price_raw: c.quote.price,
    quote_as_of: iso(quoteMs),
    frozen_quote_price: forecast.close,
    quote_adjustment_factor: round(forecast.close / c.quote.price, 8),
    admission_price: forecast.close,
    entry_price: entry,
    entry_price_basis: 'split_adjusted_first_close_on_or_after_start',
    entry_observed_at: start.date,
    entry_slippage_pct: round(((entry - forecast.close) / forecast.close) * 100),
    exit_price: end.close,
    exit_price_basis: end.basis,
    exit_observed_at: end.date,
    exit_grace_days: graceDays,
    exit_source: end.source,
    terminal_source: end.terminalSource,
    path_min_price: pathMin,
    path_max_price: pathMax,
    realized_strategy_return_pct: realised,
    max_favorable_excursion_pct: favorable,
    max_adverse_excursion_pct: adverse,
    benchmark_return_pct: benchmarkReturn,
    benchmark_beta: beta,
    benchmark_ticker: benchmarkReturn === null ? null : expectedBenchmark,
    benchmark_currency: benchmarkReturn === null ? null : c.instrument.currency,
    benchmark_source: benchmarkReturn === null ? null : benchmark!.source,
    benchmark_as_of: benchmarkReturn === null ? null : benchmark!.asOf,
    benchmark_provider: benchmarkReturn === null ? null : benchmark!.provider,
    sector_return_pct: sectorReturn,
    sector_ticker: sectorReturn === null ? null : expectedSector,
    sector_currency: sectorReturn === null ? null : c.instrument.currency,
    sector_source: sectorReturn === null ? null : sector!.source,
    sector_as_of: sectorReturn === null ? null : sector!.asOf,
    sector_provider: sectorReturn === null ? null : sector!.provider,
    excess_vs_benchmark_pct: relative(benchmarkReturn, beta ?? 1),
    excess_vs_sector_pct: relative(sectorReturn, 1),
    predicted_expected_return_pct: metrics.expected_return_pct,
    predicted_loss_probability_pct: metrics.loss_probability_pct,
    predicted_positive_probability_pct: predictedPositive,
    predicted_tail_loss_pct: metrics.tail_loss_pct,
    predicted_min_return_pct: Math.min(...scenarioValues),
    predicted_max_return_pct: Math.max(...scenarioValues),
    realized_positive: realisedPositive,
    brier_positive_return: round((predictedPositive / 100 - (realisedPositive ? 1 : 0)) ** 2, 4),
    within_scenario_range: realised >= Math.min(...scenarioValues) && realised <= Math.max(...scenarioValues),
    tail_loss_breached: Math.max(0, -realised) > metrics.tail_loss_pct,
    calibration_status: c.research.calibration_status,
  }
  const outcome: QualifiedIdeaOutcome = { ...base, outcome_sha256: outcomeDigest(base) }
  if (!isQualifiedIdeaOutcome(outcome)) {
    return { status: 'unresolved', reason_code: 'outcome_invariant_failed', reason: 'The derived outcome failed its own strict persisted-row contract.' }
  }
  return { status: 'resolved', outcome }
}
