process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { evaluateQualifiedIdea, type QualifiedIdeaCandidate, type QualifiedIdeaEvaluation } from '../src/qualified-ideas'
import {
  createQualifiedIdeaCohortEntry,
  isQualifiedIdeaCohortEntry,
  isQualifiedIdeaOutcome,
  readQualifiedIdeaOutcomesText,
  resolveQualifiedIdeaOutcome,
  type MarketHistory,
} from '../src/qualified-idea-outcomes'

const START = '2026-08-03T10:00:00Z'
const DUE = '2026-11-01T10:00:00Z'
const NOW = Date.parse('2026-11-05T12:00:00Z')
const PROVIDER = 'LicensedTest'
const DAY_MS = 86_400_000

function canonical(v: any): any {
  if (Array.isArray(v)) return v.map(canonical)
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]))
  return v
}
function digest(v: any): string { return createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex') }

function candidate(id = 'QIDEA-long'): QualifiedIdeaCandidate {
  return {
    schema_version: 'qualified-idea/v1', policy_version: 'ideas-policy/precal-v1', idea_id: id,
    market_evidence_sha256: 'a'.repeat(64), projection_manifest_sha256: 'e'.repeat(64),
    run_root: 'analyses/TEST_2026-08-03', decision_date: '2026-08-03', created_at: START,
    instrument: { ticker: 'TEST', company: 'Test Holdings', exchange: 'NYSE', currency: 'USD', direction: 'long', asset_type: 'equity' },
    horizon: { start: START, end: DUE },
    quote: { price: 100, as_of: START, source: `${PROVIDER} market feed, 2026-08-03`, identity_verified: true, stale: false },
    liquidity: {
      verified: true, as_of: START, source: `${PROVIDER} market feed close × volume; USD listing`, lookback_days: 60, observed_sessions: 60,
      coverage_pct: 100, window_start: '2026-05-01T10:00:00Z', window_end: START,
      median_daily_value_usd: 20_000_000,
      currency_conversion: { pair: 'USD/USD', rate_usd_per_currency: 1, as_of: START, source: 'USD listing' },
    },
    market_risk: { as_of: START, source: `${PROVIDER} split-adjusted market feed`, lookback_days: 60, ordinary_move_pct: 8 },
    research: {
      decision: 'Buy', integrity_status: 'verified', data_sufficiency_score: 82, edge_score: 65,
      edge_proof: 'The filed KPI will settle above the frozen consensus baseline by 12%.', hard_cap_active: false,
      hard_cap_reason: null, unresolved_red_flags: [], calibration_status: 'pre_data',
    },
    catalyst: {
      forecast_id: `FC-${id}`, name: 'Q3 results', window_start: '2026-10-20T00:00:00Z', window_end: '2026-10-25T00:00:00Z',
      source: 'company calendar', status_at_admission: 'scheduled_unresolved', status_as_of: START,
      causal_steps: ['Company files the KPI result.', 'Consensus revises the KPI and target.'],
      bullish_trigger: 'KPI exceeds the pinned consensus number.', bearish_trigger: 'KPI misses the pinned consensus number.',
    },
    falsifier: { condition: 'The thesis is falsified when the filed KPI misses the frozen baseline.', metric: 'filed KPI', threshold: '< 100', deadline: '2026-10-25T00:00:00Z', source: 'Q3 filing' },
    valuation_bridge: { source_horizon_days: 90, method: 'same_horizon', convergence_fraction: null, rationale: 'The event model resolves entirely inside this holding window.', source: 'event model' },
    scenarios: [
      { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 140, source_price_target: 140, return_pct: 40, conditions: ['KPI exceeds 120'], source: 'frozen event model' },
      { scenario_id: 'base', label: 'base', probability_pct: 55, price_target: 118, source_price_target: 118, return_pct: 18, conditions: ['KPI is 108 to 119'], source: 'frozen event model' },
      { scenario_id: 'bear', label: 'bear', probability_pct: 20, price_target: 88, source_price_target: 88, return_pct: -12, conditions: ['KPI is below 108'], source: 'frozen event model' },
    ],
  }
}

function admittedEvaluation(c = candidate(), admissionSha = 'b'.repeat(64)): QualifiedIdeaEvaluation {
  const evaluation = evaluateQualifiedIdea(c, { nowMs: Date.parse(c.created_at) })
  assert.equal(evaluation.status, 'qualified', evaluation.issues.map((x) => x.code).join(','))
  evaluation.admission = {
    admission_id: `QADM-${c.idea_id}`,
    admission_sha256: admissionSha,
    candidate_sha256: digest(c),
    frozen_at: c.created_at,
  }
  return evaluation
}

function cohort(c = candidate(), admissionSha = 'b'.repeat(64)) {
  const entry = createQualifiedIdeaCohortEntry(admittedEvaluation(c, admissionSha), Date.parse(c.created_at))
  assert.ok(entry)
  return entry
}

function dayIso(value: string | number): string {
  const d = new Date(value)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString()
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
  const ordered = markers.map(([date, close]) => [dayIso(date), close] as const).sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))
  const values = new Map(ordered)
  let close = ordered[0][1]
  return weekdays(ordered[0][0], ordered.at(-1)![0]).map((date) => {
    if (values.has(date)) close = values.get(date)!
    return { date, close }
  })
}

function history(points: Array<[string, number]>, extra: Partial<MarketHistory> = {}): MarketHistory {
  const ticker = extra.ticker ?? 'TEST'
  const asOf = extra.as_of ?? '2026-11-05T00:00:00.000Z'
  return {
    schema_version: 'market-history/v1', ticker: 'TEST', exchange: 'NYSE', currency: 'USD', adjusted: true,
    provider: PROVIDER, instrument_kind: extra.instrument_kind ?? 'equity',
    adjustment_basis: 'split_adjusted_price', source: `${PROVIDER} market feed`,
    as_of: asOf, security_status: 'active',
    session_calendar: {
      source: `${PROVIDER} provider-local session calendar`, source_symbols: [ticker, ticker === 'TEST' ? 'SPY' : 'TEST'],
      dates: weekdays(points[0][0], asOf),
    },
    points: densePoints(points), ...extra,
  }
}

const prices = history([
  [START, 100],
  ['2026-09-01T00:00:00Z', 85],
  ['2026-10-01T00:00:00Z', 125],
  ['2026-11-02T00:00:00Z', 120],
])
const benchmark = history([
  [START, 200], ['2026-11-02T00:00:00Z', 210],
], { ticker: 'SPY', instrument_kind: 'benchmark' })
const entry = cohort()
const resolved = resolveQualifiedIdeaOutcome(entry, { ...prices, comparators: { benchmark: 'SPY', sector: null, beta: 1 } }, {
  nowMs: NOW, benchmarkHistory: benchmark,
})
assert.equal(resolved.status, 'resolved')
if (resolved.status === 'resolved') {
  const o = resolved.outcome
  assert.equal(o.realized_strategy_return_pct, 20)
  assert.equal(o.quote_price_raw, 100)
  assert.equal(o.frozen_quote_price, 100)
  assert.equal(o.entry_price, 100)
  assert.equal(o.entry_slippage_pct, 0)
  assert.equal(o.entry_price_basis, 'split_adjusted_first_close_on_or_after_start')
  assert.equal(o.exit_price_basis, 'split_adjusted_close_on_or_after_due')
  assert.equal(o.max_favorable_excursion_pct, 25)
  assert.equal(o.max_adverse_excursion_pct, 15)
  assert.equal(o.benchmark_return_pct, 5)
  assert.equal(o.excess_vs_benchmark_pct, 15)
  assert.equal(o.brier_positive_return, 0.04)
  assert.equal(o.tail_loss_breached, false)
  assert.ok(isQualifiedIdeaOutcome(o))
  assert.match(o.outcome_id, /^QOUT-[a-f0-9]{20}$/)
}

// Retrospective split adjustment is safe because raw quote is audit-only and every return endpoint uses
// the same adjusted basis.
const split = resolveQualifiedIdeaOutcome(entry, history([
  [START, 50], ['2026-11-02T00:00:00Z', 60],
]), { nowMs: NOW })
assert.equal(split.status, 'resolved')
if (split.status === 'resolved') {
  assert.equal(split.outcome.quote_price_raw, 100)
  assert.equal(split.outcome.frozen_quote_price, 50)
  assert.equal(split.outcome.quote_adjustment_factor, 0.5)
  assert.equal(split.outcome.realized_strategy_return_pct, 20)
}

const delayedStartCandidate = candidate('QIDEA-delayed-start')
delayedStartCandidate.horizon.start = '2026-08-04T10:00:00Z'
delayedStartCandidate.horizon.end = '2026-11-02T10:00:00Z'
const delayedStart = resolveQualifiedIdeaOutcome(cohort(delayedStartCandidate), history([
  [START, 100], ['2026-08-04T00:00:00Z', 110], ['2026-11-02T00:00:00Z', 121],
]), { nowMs: NOW })
assert.equal(delayedStart.status, 'resolved')
if (delayedStart.status === 'resolved') {
  assert.equal(delayedStart.outcome.quote_as_of, new Date(START).toISOString())
  assert.equal(delayedStart.outcome.frozen_quote_price, 100, 'the prior quote remains the forecast denominator')
  assert.equal(delayedStart.outcome.entry_observed_at, '2026-08-04T00:00:00.000Z')
  assert.equal(delayedStart.outcome.entry_price, 110)
  assert.equal(delayedStart.outcome.entry_slippage_pct, 10)
  assert.equal(delayedStart.outcome.horizon_due_at, '2026-11-02T00:00:00.000Z')
  assert.equal(delayedStart.outcome.realized_strategy_return_pct, 10, 'realised return begins at the first executable session, not the earlier forecast quote')
}

// A terminal event inside exit grace wins over a later stale provider price, records its provenance, and
// terminates the path (the later 150 close cannot manufacture favorable excursion).
const delistedHistory = history([
  [START, 100],
  ['2026-10-30T00:00:00Z', 85],
], {
  security_status: 'delisted',
  terminal_value: { date: '2026-11-03T00:00:00Z', price: 0, source: 'bankruptcy distribution notice' },
})
delistedHistory.points.push({ date: '2026-11-03T00:00:00.000Z', close: 140 }, { date: '2026-11-05T00:00:00.000Z', close: 150 })
const delisted = resolveQualifiedIdeaOutcome(entry, delistedHistory, { nowMs: NOW, graceDays: 7 })
assert.equal(delisted.status, 'resolved')
if (delisted.status === 'resolved') {
  assert.equal(delisted.outcome.exit_price, 0)
  assert.equal(delisted.outcome.exit_price_basis, 'source_bound_terminal_value')
  assert.equal(delisted.outcome.exit_source, 'bankruptcy distribution notice')
  assert.equal(delisted.outcome.terminal_source, 'bankruptcy distribution notice')
  assert.equal(delisted.outcome.max_favorable_excursion_pct, 0)
  assert.equal(delisted.outcome.max_adverse_excursion_pct, 100)
}

const terminalWithoutLaterClose = resolveQualifiedIdeaOutcome(entry, history([
  [START, 100], ['2026-10-30T00:00:00Z', 85],
], {
  as_of: '2026-11-03T00:00:00Z', security_status: 'delisted',
  terminal_value: { date: '2026-11-03T00:00:00Z', price: 0, source: 'bankruptcy distribution notice' },
}), { nowMs: Date.parse('2026-11-03T12:00:00Z'), graceDays: 7 })
assert.equal(terminalWithoutLaterClose.status, 'resolved', 'terminal event advances history as-of without requiring a later stale close')

const missingTerminal = resolveQualifiedIdeaOutcome(entry, { ...prices, security_status: 'delisted', terminal_value: null }, { nowMs: NOW })
assert.equal(missingTerminal.status, 'unresolved')
if (missingTerminal.status === 'unresolved') assert.equal(missingTerminal.reason_code, 'delisting_terminal_value_missing')

// A horizon that has ended before its first eligible close is published is pending while the frozen
// exit-grace window remains open. It becomes genuinely missing only after that window expires.
const pendingNow = Date.parse('2026-11-01T12:00:00Z')
const noExitYet = history([[START, 100]], { as_of: '2026-11-01T12:00:00Z' })
const pendingEndpoint = resolveQualifiedIdeaOutcome(entry, noExitYet, { nowMs: pendingNow, graceDays: 7 })
assert.equal(pendingEndpoint.status, 'not_due')
if (pendingEndpoint.status === 'not_due') assert.equal(pendingEndpoint.reason_code, 'endpoint_pending')
const missingEndpoint = resolveQualifiedIdeaOutcome(entry, { ...noExitYet, as_of: '2026-11-09T00:00:00Z' }, {
  nowMs: Date.parse('2026-11-09T00:00:00Z'), graceDays: 7,
})
assert.equal(missingEndpoint.status, 'unresolved')
if (missingEndpoint.status === 'unresolved') assert.equal(missingEndpoint.reason_code, 'end_price_missing')

const futureAsOf = resolveQualifiedIdeaOutcome(entry, { ...prices, as_of: '2026-11-06T00:00:00Z' }, { nowMs: NOW })
assert.equal(futureAsOf.status, 'unresolved')
if (futureAsOf.status === 'unresolved') assert.equal(futureAsOf.reason_code, 'history_unverified')

const futurePoint = resolveQualifiedIdeaOutcome(entry, {
  ...prices, points: [...prices.points, { date: '2026-11-06T00:00:00Z', close: 121 }],
}, { nowMs: NOW })
assert.equal(futurePoint.status, 'unresolved', 'no observed_at beyond the injected replay clock is accepted')

const providerReplacement = {
  ...prices,
  provider: 'ReplacementFeed',
  source: 'ReplacementFeed market feed',
  session_calendar: { ...prices.session_calendar, source: 'ReplacementFeed provider-local session calendar' },
}
const replaced = resolveQualifiedIdeaOutcome(entry, providerReplacement, { nowMs: NOW })
assert.equal(replaced.status, 'unresolved')
if (replaced.status === 'unresolved') assert.equal(replaced.reason_code, 'history_provider_mismatch')

const wrongSecurityRole = resolveQualifiedIdeaOutcome(entry, { ...prices, instrument_kind: 'benchmark' }, { nowMs: NOW })
assert.equal(wrongSecurityRole.status, 'unresolved')
if (wrongSecurityRole.status === 'unresolved') assert.equal(wrongSecurityRole.reason_code, 'history_role_mismatch')

const omittedCrash = resolveQualifiedIdeaOutcome(entry, {
  ...prices,
  points: prices.points.filter((point) => point.date !== '2026-09-01T00:00:00.000Z'),
}, { nowMs: NOW })
assert.equal(omittedCrash.status, 'unresolved', 'a missing crash session cannot flatter the path')
if (omittedCrash.status === 'unresolved') assert.equal(omittedCrash.reason_code, 'history_coverage_incomplete')

const omittedDueSession = resolveQualifiedIdeaOutcome(entry, {
  ...prices,
  points: [
    ...prices.points.filter((point) => point.date !== '2026-11-02T00:00:00.000Z'),
    { date: '2026-11-03T00:00:00.000Z', close: 121 },
  ],
}, { nowMs: NOW })
assert.equal(omittedDueSession.status, 'unresolved', 'a later close cannot conceal an omitted first eligible due session')
if (omittedDueSession.status === 'unresolved') assert.equal(omittedDueSession.reason_code, 'history_coverage_incomplete')

const comparatorFuture = resolveQualifiedIdeaOutcome(entry, {
  ...prices, comparators: { benchmark: 'SPY', sector: null, beta: 1 },
}, { nowMs: NOW, benchmarkHistory: { ...benchmark, as_of: '2026-11-06T00:00:00Z' } })
assert.equal(comparatorFuture.status, 'resolved')
if (comparatorFuture.status === 'resolved') {
  assert.equal(comparatorFuture.outcome.benchmark_return_pct, null, 'future comparator provenance is excluded, never partially trusted')
  assert.equal(comparatorFuture.outcome.benchmark_as_of, null)
}

const wrongComparatorIdentity = resolveQualifiedIdeaOutcome(entry, {
  ...prices, comparators: { benchmark: 'SPY', sector: null, beta: 1 },
}, { nowMs: NOW, benchmarkHistory: { ...benchmark, ticker: 'WRONG' } })
assert.equal(wrongComparatorIdentity.status, 'resolved')
if (wrongComparatorIdentity.status === 'resolved') assert.equal(wrongComparatorIdentity.outcome.benchmark_return_pct, null)

const wrongComparatorRole = resolveQualifiedIdeaOutcome(entry, {
  ...prices, comparators: { benchmark: 'SPY', sector: null, beta: 1 },
}, { nowMs: NOW, benchmarkHistory: { ...benchmark, instrument_kind: 'sector' } })
assert.equal(wrongComparatorRole.status, 'resolved')
if (wrongComparatorRole.status === 'resolved') assert.equal(wrongComparatorRole.outcome.benchmark_return_pct, null)

const futureAdmission = JSON.parse(JSON.stringify(entry))
futureAdmission.captured_at = '2026-12-01T00:00:00Z'
assert.equal(resolveQualifiedIdeaOutcome(futureAdmission, prices, { nowMs: NOW }).status, 'unresolved')

function rehashCohort(value: any): any {
  const copy = JSON.parse(JSON.stringify(value))
  delete copy.cohort_entry_sha256
  return { ...copy, cohort_entry_sha256: digest(copy) }
}
const splitCapture = rehashCohort({ ...entry, admitted_at: '2026-08-03T09:59:59Z' })
assert.equal(isQualifiedIdeaCohortEntry(splitCapture, NOW), false, 'admission and capture must be the identical frozen instant')
const lateCapture = rehashCohort({ ...entry, admitted_at: '2026-08-03T11:00:00Z', captured_at: '2026-08-03T11:00:00Z' })
assert.equal(isQualifiedIdeaCohortEntry(lateCapture, NOW), false, 'capture cannot occur after the declared tradable start')
const mismatchedCandidateDigest = rehashCohort({ ...entry, candidate_sha256: 'f'.repeat(64) })
assert.equal(isQualifiedIdeaCohortEntry(mismatchedCandidateDigest, NOW), false, 'both frozen candidate hashes bind the canonical candidate bytes')
const badAdmissionEvaluation = admittedEvaluation()
badAdmissionEvaluation.admission!.candidate_sha256 = 'f'.repeat(64)
assert.equal(createQualifiedIdeaCohortEntry(badAdmissionEvaluation, Date.parse(START)), null)

if (resolved.status === 'resolved') {
  const good = resolved.outcome
  const tampered = { ...good, realized_strategy_return_pct: 999 }
  assert.equal(isQualifiedIdeaOutcome(tampered), false, 'strict reader recomputes strategy return')
  const badId = { ...good, outcome_id: 'QOUT-' + '0'.repeat(20) }
  assert.equal(isQualifiedIdeaOutcome(badId), false, 'strict reader recomputes deterministic id')
  const duplicate = readQualifiedIdeaOutcomesText([JSON.stringify(good), JSON.stringify(good)].join('\n'))
  assert.equal(duplicate.rows.length, 1)
  assert.equal(duplicate.duplicate_count, 1)
  const conflicting = { ...good, outcome_sha256: 'f'.repeat(64) }
  const conflictRead = readQualifiedIdeaOutcomesText([JSON.stringify(good), JSON.stringify(conflicting)].join('\n'))
  assert.equal(conflictRead.rows.length, 1, 'an invalid forged digest cannot suppress the valid row')
  assert.equal(conflictRead.invalid_count, 1)
  const alternateAdmission = cohort(candidate(), 'c'.repeat(64))
  const alternateResult = resolveQualifiedIdeaOutcome(alternateAdmission, {
    ...prices, comparators: { benchmark: 'SPY', sector: null, beta: 1 },
  }, { nowMs: NOW, benchmarkHistory: benchmark })
  assert.equal(alternateResult.status, 'resolved')
  if (alternateResult.status === 'resolved') {
    const quarantined = readQualifiedIdeaOutcomesText([JSON.stringify(good), JSON.stringify(alternateResult.outcome)].join('\n'))
    assert.equal(quarantined.rows.length, 0, 'two valid outcomes for one frozen cohort are both quarantined')
    assert.equal(quarantined.conflicting_count, 1)
    assert.equal(quarantined.quarantined_cohort_keys.length, 1)
  }
}

console.log('\n1 qualified-idea-outcomes test file passed')
