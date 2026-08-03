process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  qualifiedIdeaCalibrationStatusFor,
  summarizeQualifiedIdeaCalibration,
} from '../src/qualified-idea-calibration'
import { evaluateQualifiedIdea, type QualifiedIdeaCandidate } from '../src/qualified-ideas'
import {
  createQualifiedIdeaCohortEntry,
  isQualifiedIdeaOutcome,
  outcomeIdFor,
  resolveQualifiedIdeaOutcome,
  type MarketHistory,
  type QualifiedIdeaCohortEntry,
  type QualifiedIdeaOutcome,
} from '../src/qualified-idea-outcomes'

const START = '2026-01-01T00:00:00Z'
const DUE = '2026-04-01T00:00:00Z'
const RESOLVE_NOW = Date.parse('2026-04-03T12:00:00Z')
const PROVIDER = 'LicensedTest'
const DAY_MS = 86_400_000
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-calibration-'))
const ledger = path.join(root, 'screener', 'ledger', 'qualified_idea_outcomes.ndjson')
const cohortLedger = path.join(root, 'screener', 'ledger', 'qualified_idea_cohort_entries.ndjson')
fs.mkdirSync(path.dirname(ledger), { recursive: true })

function canonical(v: any): any {
  if (Array.isArray(v)) return v.map(canonical)
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]))
  return v
}
const digest = (v: any) => createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex')

function candidate(id: number, ticker = `T${id}`, start = START, due = DUE): QualifiedIdeaCandidate {
  return {
    schema_version: 'qualified-idea/v1', policy_version: 'ideas-policy/precal-v1', idea_id: `QIDEA-${id}`,
    market_evidence_sha256: 'a'.repeat(64), projection_manifest_sha256: 'e'.repeat(64),
    run_root: `analyses/R${id}_${start.slice(0, 10)}`, decision_date: start.slice(0, 10), created_at: start,
    instrument: { ticker, company: `${ticker} Holdings`, exchange: 'NYSE', currency: 'USD', direction: 'long', asset_type: 'equity' },
    horizon: { start, end: due }, quote: { price: 100, as_of: start, source: `${PROVIDER} market feed, ${start.slice(0, 10)}`, identity_verified: true, stale: false },
    liquidity: {
      verified: true, as_of: start, source: `${PROVIDER} market feed close × volume; USD listing`, lookback_days: 60, observed_sessions: 60, coverage_pct: 100,
      window_start: new Date(Date.parse(start) - 84 * 86_400_000).toISOString(), window_end: start,
      median_daily_value_usd: 50_000_000,
      currency_conversion: { pair: 'USD/USD', rate_usd_per_currency: 1, as_of: start, source: 'USD listing' },
    },
    market_risk: { as_of: start, source: `${PROVIDER} split-adjusted market feed`, lookback_days: 60, ordinary_move_pct: 8 },
    research: { decision: 'Buy', integrity_status: 'verified', data_sufficiency_score: 82, edge_score: 66, edge_proof: 'Filed KPI beats the frozen consensus by 12%.', hard_cap_active: false, hard_cap_reason: null, unresolved_red_flags: [], calibration_status: 'pre_data' },
    catalyst: {
      forecast_id: `FC-${id}`, name: 'Results', window_start: new Date(Date.parse(start) + 40 * 86_400_000).toISOString(), window_end: new Date(Date.parse(start) + 45 * 86_400_000).toISOString(),
      source: 'company calendar', status_at_admission: 'scheduled_unresolved', status_as_of: start,
      causal_steps: ['Company files KPI.', 'Consensus revises estimates.'], bullish_trigger: 'KPI is above 112.', bearish_trigger: 'KPI is below 100.',
    },
    falsifier: { condition: 'Filed KPI is below 100.', metric: 'KPI', threshold: '<100', deadline: new Date(Date.parse(start) + 45 * 86_400_000).toISOString(), source: 'filing' },
    valuation_bridge: { source_horizon_days: 90, method: 'same_horizon', convergence_fraction: null, rationale: 'The event payoff resolves inside the exact holding window.', source: 'event model' },
    scenarios: [
      { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 140, source_price_target: 140, conditions: ['KPI above 120'], source: 'frozen event model' },
      { scenario_id: 'base', label: 'base', probability_pct: 55, price_target: 118, source_price_target: 118, conditions: ['KPI 108 to 119'], source: 'frozen event model' },
      { scenario_id: 'bear', label: 'bear', probability_pct: 20, price_target: 88, source_price_target: 88, conditions: ['KPI below 108'], source: 'frozen event model' },
    ],
  }
}

interface Settlement { cohort: QualifiedIdeaCohortEntry; outcome: QualifiedIdeaOutcome }

function dayIso(value: string | number): string {
  const date = new Date(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString()
}

function weekdays(from: string, through: string): string[] {
  const out: string[] = []
  for (let ms = Date.parse(dayIso(from)); ms <= Date.parse(dayIso(through)); ms += DAY_MS) {
    const day = new Date(ms).getUTCDay()
    if (day !== 0 && day !== 6) out.push(new Date(ms).toISOString())
  }
  return out
}

function densePoints(markers: Array<[string, number]>): Array<{ date: string; close: number }> {
  const ordered = markers.map(([date, close]) => [dayIso(date), close] as const)
    .sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))
  const values = new Map(ordered)
  let close = ordered[0][1]
  return weekdays(ordered[0][0], ordered.at(-1)![0]).map((date) => {
    if (values.has(date)) close = values.get(date)!
    return { date, close }
  })
}

function makeSettlement(
  id: number,
  exit: number,
  opts: { ticker?: string; benchmark?: boolean; start?: string; due?: string; now?: number; admissionSha?: string } = {},
): Settlement {
  const c = candidate(id, opts.ticker, opts.start, opts.due)
  const evaluation = evaluateQualifiedIdea(c, { nowMs: Date.parse(c.created_at) })
  assert.equal(evaluation.status, 'qualified', evaluation.issues.map((x) => x.code).join(','))
  evaluation.admission = {
    admission_id: `QADM-${id}`,
    admission_sha256: opts.admissionSha ?? 'b'.repeat(64),
    candidate_sha256: digest(c),
    frozen_at: c.created_at,
  }
  const entry = createQualifiedIdeaCohortEntry(evaluation, Date.parse(c.created_at))
  assert.ok(entry)
  const now = opts.now ?? RESOLVE_NOW
  const asOf = new Date(now - 3_600_000).toISOString()
  const history: MarketHistory = {
    schema_version: 'market-history/v1', ticker: c.instrument.ticker, exchange: 'NYSE', currency: 'USD',
    provider: PROVIDER, instrument_kind: 'equity', adjusted: true, adjustment_basis: 'split_adjusted_price',
    source: `${PROVIDER} market feed`, as_of: asOf, security_status: 'active',
    comparators: opts.benchmark ? { benchmark: 'SPY', sector: null, beta: 1 } : undefined,
    session_calendar: {
      source: `${PROVIDER} provider-local session calendar`,
      source_symbols: [c.instrument.ticker, 'SPY'],
      dates: weekdays(c.horizon.start, asOf),
    },
    points: densePoints([[c.horizon.start, 100], [c.horizon.end, exit]]),
  }
  const benchmark: MarketHistory | undefined = opts.benchmark ? {
    ...history, ticker: 'SPY', exchange: 'INDEX', instrument_kind: 'benchmark', comparators: undefined,
    points: densePoints([[c.horizon.start, 200], [c.horizon.end, 210]]),
  } : undefined
  const result = resolveQualifiedIdeaOutcome(entry, history, { nowMs: now, benchmarkHistory: benchmark })
  assert.equal(result.status, 'resolved')
  if (result.status !== 'resolved') throw new Error('unreachable')
  return { cohort: entry, outcome: result.outcome }
}

function writeCohorts(rows: Settlement[]): void {
  fs.writeFileSync(cohortLedger, rows.map((x) => JSON.stringify(x.cohort)).join('\n') + (rows.length ? '\n' : ''))
}

function writeOutcomes(rows: Settlement[], extraLines: string[] = []): void {
  const lines = [...rows.map((x) => JSON.stringify(x.outcome)), ...extraLines]
  fs.writeFileSync(ledger, lines.join('\n') + (lines.length ? '\n' : ''))
}

function rewriteOutcome(
  source: QualifiedIdeaOutcome,
  changes: Partial<QualifiedIdeaOutcome>,
): QualifiedIdeaOutcome {
  const row = { ...source, ...changes }
  row.cohort_key = [row.policy_version, row.idea_id, row.run_root, new Date(row.declared_horizon_due_at).toISOString()].join('|')
  row.outcome_id = outcomeIdFor(row)
  const { outcome_sha256: _oldDigest, ...base } = row
  row.outcome_sha256 = digest(base)
  assert.equal(isQualifiedIdeaOutcome(row, RESOLVE_NOW), true, 'cross-ledger mismatch fixture remains internally valid')
  return row
}

try {
  const empty = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
  assert.equal(empty.status, 'pre_data')
  assert.equal(empty.valid_outcome_count, 0)
  assert.equal(qualifiedIdeaCalibrationStatusFor(empty, 'ideas-policy/precal-v1', 90, 'long'), 'pre_data')

  const a = makeSettlement(1, 120, { benchmark: true })
  const b = makeSettlement(2, 80)
  const excluded = makeSettlement(99, 120)
  writeCohorts([a, b])
  writeOutcomes([a, b, excluded], ['{bad'])
  const small = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
  assert.equal(small.status, 'insufficient')
  assert.equal(small.valid_outcome_count, 2)
  assert.equal(small.invalid_outcome_count, 1)
  assert.equal(small.excluded_nonstanding_count, 1)
  assert.equal(small.overall.average_predicted_positive_pct, 80)
  assert.equal(small.overall.realized_positive_pct, 50)
  assert.equal(small.overall.positive_calibration_gap_pp, -30)
  assert.equal(small.overall.mean_brier_positive, 0.34)
  assert.equal(small.overall.average_realized_return_pct, 0)
  assert.equal(small.overall.mean_absolute_return_error_pct, 20)
  assert.equal(small.overall.return_forecast_error_pct, -17.5)
  assert.equal(small.overall.scenario_range_coverage_pct, 50)
  assert.equal(small.overall.tail_loss_breach_pct, 50)
  assert.equal(small.overall.benchmark_observations, 1)
  assert.equal(small.by_horizon_direction['90-119d|long'].status, 'insufficient')
  assert.equal(small.by_horizon_direction['90-119d|short'].status, 'pre_data')

  // Calibration is owned by the immutable ledgers. Removing the mutable source research cannot select a
  // settled winner or loser out of the denominator after its result is known.
  for (const settled of [a, b]) {
    fs.mkdirSync(path.join(root, settled.outcome.run_root), { recursive: true })
    fs.writeFileSync(path.join(root, settled.outcome.run_root, 'idea_admission.json'), '{}\n')
  }
  fs.rmSync(path.join(root, 'analyses'), { recursive: true, force: true })
  const afterSourceRemoval = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
  assert.equal(afterSourceRemoval.valid_outcome_count, 2)
  assert.equal(afterSourceRemoval.overall.average_realized_return_pct, 0)

  // A self-consistent outcome is still ineligible unless every immutable cross-ledger identity matches
  // its cohort entry. The old idea_id|run_root lookup admitted each of these rows.
  const exact = makeSettlement(80, 120)
  const mismatches: Array<[string, QualifiedIdeaOutcome]> = [
    ['idea_id', rewriteOutcome(exact.outcome, { idea_id: 'QIDEA-80-other' })],
    ['run_root', rewriteOutcome(exact.outcome, { run_root: 'analyses/OTHER_2026-01-01' })],
    ['admission_id', rewriteOutcome(exact.outcome, { admission_id: 'QADM-other' })],
    ['admission_sha256', rewriteOutcome(exact.outcome, { admission_sha256: 'c'.repeat(64) })],
    ['candidate_sha256', rewriteOutcome(exact.outcome, { candidate_sha256: 'd'.repeat(64) })],
    ['market_evidence_sha256', rewriteOutcome(exact.outcome, { market_evidence_sha256: 'f'.repeat(64) })],
  ]
  writeCohorts([exact])
  for (const [field, mismatch] of mismatches) {
    writeOutcomes([], [JSON.stringify(mismatch)])
    const rejected = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
    assert.equal(rejected.valid_outcome_count, 0, `${field} mismatch must not enter calibration`)
    assert.equal(rejected.excluded_nonstanding_count, 1, `${field} mismatch is reported as excluded`)
  }

  const differentDue = makeSettlement(80, 120, { due: '2026-04-02T00:00:00Z', now: RESOLVE_NOW })
  writeOutcomes([differentDue])
  const dueRejected = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
  assert.equal(dueRejected.valid_outcome_count, 0, 'horizon due mismatch must not enter calibration')
  assert.equal(dueRejected.excluded_nonstanding_count, 1)

  const futureStart = '2027-01-01T00:00:00Z'
  const futureDue = '2027-04-01T00:00:00Z'
  const futureNow = Date.parse('2027-04-03T12:00:00Z')
  const future = makeSettlement(50, 120, { start: futureStart, due: futureDue, now: futureNow })
  writeCohorts([future])
  writeOutcomes([future])
  const futureFiltered = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
  assert.equal(futureFiltered.valid_outcome_count, 0)
  assert.equal(futureFiltered.future_outcome_count, 1, 'ended/resolved timestamps beyond injected now never enter calibration')

  // Same frozen cohort with two valid but different admission digests is quarantined rather than made
  // dependent on line order.
  const conflictA = makeSettlement(70, 120, { admissionSha: 'b'.repeat(64) })
  const conflictB = makeSettlement(70, 120, { admissionSha: 'c'.repeat(64) })
  writeCohorts([conflictA])
  writeOutcomes([conflictA, conflictB])
  const conflicts = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
  assert.equal(conflicts.valid_outcome_count, 0)
  assert.equal(conflicts.conflicting_outcome_count, 1)

  const fullRows = Array.from({ length: 30 }, (_, i) => makeSettlement(i + 200, 120, { ticker: `D${i % 20}`, benchmark: true }))
  writeCohorts(fullRows)
  writeOutcomes(fullRows)
  const full = summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW)
  assert.equal(full.status, 'measured')
  assert.equal(full.overall.unique_tickers, 20)
  assert.equal(full.by_horizon_direction['90-119d|long'].status, 'measured')
  assert.equal(qualifiedIdeaCalibrationStatusFor(full, 'ideas-policy/precal-v1', 90, 'long'), 'measured')
  assert.equal(qualifiedIdeaCalibrationStatusFor(full, 'ideas-policy/precal-v1', 90, 'short'), 'pre_data')
  assert.equal(qualifiedIdeaCalibrationStatusFor(full, 'ideas-policy/unknown', 90, 'long'), 'pre_data')
  assert.throws(
    () => summarizeQualifiedIdeaCalibration(root, RESOLVE_NOW, 'ideas-policy/unknown-v99'),
    /unregistered qualification policy/,
  )
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('\n1 qualified-idea-calibration test file passed')
