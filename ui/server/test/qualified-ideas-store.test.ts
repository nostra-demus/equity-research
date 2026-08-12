process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  buildQualifiedIdeasBoard,
  canonicalQualifiedIdeaJson,
  listFrozenQualifiedIdeaEvaluations,
  qualifiedIdeaJsonSha256,
} from '../src/qualified-ideas-store'
import { qualifiedIdeaOutcomeHealthPath } from '../src/qualified-idea-outcome-runner'
import { createRun, finishRun, setActiveTickerRun } from '../src/registry'
import type { QualifiedIdeaCandidate } from '../src/qualified-ideas'

const NOW = Date.parse('2026-08-03T12:00:00Z')
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-'))
fs.mkdirSync(path.join(root, 'analyses'), { recursive: true })

function digest(value: any): string { return qualifiedIdeaJsonSha256(value) }
function fileDigest(file: string): string { return createHash('sha256').update(fs.readFileSync(file)).digest('hex') }

const parityFixture = JSON.parse(fs.readFileSync(path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/canonical_json_parity.json',
), 'utf8'))
assert.equal(parityFixture.schema_version, 'idea-canonical-json-parity/v1')
for (const vector of parityFixture.accepted) {
  assert.equal(canonicalQualifiedIdeaJson(vector.value), vector.canonical, `${vector.name} canonical bytes match Python`)
  assert.equal(qualifiedIdeaJsonSha256(vector.value), vector.sha256, `${vector.name} SHA-256 matches Python`)
}
const rejectedParityValues: Record<string, unknown> = {
  'not-a-number': Number.NaN,
  'positive-infinity': Number.POSITIVE_INFINITY,
  'unsafe-integer': 9_007_199_254_740_992,
  'unsafe-integral-float': 1e20,
  'lone-surrogate': String.fromCharCode(0xd800),
  'non-json-value': undefined,
}
for (const vector of parityFixture.rejected) {
  assert.throws(() => canonicalQualifiedIdeaJson(rejectedParityValues[vector.name]), undefined, `${vector.name} must fail closed in TypeScript`)
}

function candidate(runRoot: string, createdAt?: string): QualifiedIdeaCandidate {
  const ticker = path.basename(runRoot).split('_')[0]
  const created = createdAt ?? `${runRoot.slice(-10)}T10:00:00Z`
  const c: QualifiedIdeaCandidate = {
    schema_version: 'qualified-idea/v1', policy_version: 'ideas-policy/precal-v1', idea_id: `QIDEA-${path.basename(runRoot)}`, market_evidence_sha256: '0'.repeat(64), projection_manifest_sha256: 'e'.repeat(64), run_root: runRoot, decision_date: runRoot.slice(-10), created_at: created,
    instrument: { ticker, company: `${ticker} Holdings`, exchange: 'NYSE', currency: 'USD', direction: 'long', asset_type: 'equity' },
    horizon: { start: created, end: new Date(Date.parse(created) + 180 * 86_400_000).toISOString() },
    quote: { price: 100, as_of: created, source: 'exchange', identity_verified: true, stale: false },
    liquidity: { verified: true, as_of: created, source: 'exchange OHLCV', lookback_days: 60, observed_sessions: 60, coverage_pct: 100, window_start: new Date(Date.parse(created) - 84 * 86_400_000).toISOString(), window_end: created, median_daily_value_usd: 50_000_000, currency_conversion: { pair: 'USD/USD', rate_usd_per_currency: 1, as_of: created, source: 'USD listing currency' } },
    market_risk: { as_of: created, source: 'adjusted closes', lookback_days: 60, ordinary_move_pct: 8 },
    research: {
      decision: 'Buy', integrity_status: 'verified', data_sufficiency_score: 82, edge_score: 66,
      edge_proof: 'The filed KPI exceeds the frozen consensus baseline by a falsifiable 12%.', hard_cap_active: false,
      hard_cap_reason: null, unresolved_red_flags: [], calibration_status: 'pre_data',
    },
    catalyst: {
      forecast_id: `FC-${ticker}`,
      name: 'Q3 results', window_start: '2026-10-20T00:00:00Z', window_end: '2026-10-25T00:00:00Z', source: 'company calendar',
      status_at_admission: 'scheduled_unresolved', status_as_of: created,
      causal_steps: ['Company files the KPI result.', 'Consensus revises the same KPI and valuation.'],
      bullish_trigger: 'KPI is at least 112 against 100 consensus.', bearish_trigger: 'KPI is below 100 consensus.',
    },
    falsifier: { condition: 'The edge is falsified when the filed KPI is below 100.', metric: 'filed KPI', threshold: '< 100', deadline: '2026-10-25T00:00:00Z', source: 'Q3 filing' },
    valuation_bridge: { source_horizon_days: 180, method: 'same_horizon', convergence_fraction: null, rationale: 'The targets come directly from the event payoff inside this holding window.', source: 'event model' },
    scenarios: [
      { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 140, source_price_target: 140, conditions: ['KPI is at least 120'], source: 'frozen event model' },
      { scenario_id: 'base', label: 'base', probability_pct: 55, price_target: 118, source_price_target: 118, conditions: ['KPI is 108 to 119'], source: 'frozen event model' },
      { scenario_id: 'bear', label: 'bear', probability_pct: 20, price_target: 88, source_price_target: 88, conditions: ['KPI is below 108'], source: 'frozen event model' },
    ],
  }
  c.market_evidence_sha256 = digest(marketEvidence(c))
  return c
}

function marketEvidence(c: QualifiedIdeaCandidate): Record<string, any> {
  return {
    schema_version: 'idea-market-evidence/v1', symbol: c.instrument.ticker, available: true, gaps: [],
    instrument: { ticker: c.instrument.ticker, exchange: c.instrument.exchange, currency: c.instrument.currency, asset_type: 'equity' },
    quote: c.quote, liquidity: c.liquidity, market_risk: c.market_risk,
  }
}

function writeRun(name: string, opts: {
  createdAt?: string
  verify?: boolean
  correction?: any
  malformed?: boolean
  halfWritten?: boolean
  notAssessable?: boolean
  wrapperMismatch?: boolean
  entryStartsEarly?: boolean
  malformedAudit?: boolean
  verificationBlockingMismatch?: boolean
  preMortemConfidenceMismatch?: boolean
  expectationsEdgeMismatch?: boolean
  preMortemSurvives?: boolean
  preMortemVerdict?: string
  preMortemCap?: string
  expectationsQuality?: 'None' | 'Weak' | 'Moderate' | 'Strong'
  expectationsExploitable?: boolean
  expectationsEdge?: number
  unnamedNegative?: boolean
  lowConservativeReturn?: boolean
} = {}, repoRoot = root) {
  const dir = path.join(repoRoot, 'analyses', name)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'final_thesis.md'), '# Thesis\n')
  const runRoot = `analyses/${name}`
  const c = candidate(runRoot, opts.createdAt)
  if (!opts.lowConservativeReturn) {
    c.scenarios[0].price_target = c.scenarios[0].source_price_target = 160
    c.scenarios[1].price_target = c.scenarios[1].source_price_target = 135
  }
  if (opts.entryStartsEarly) c.horizon.start = '2026-08-01T10:00:00Z'
  const authorityScenarios = c.scenarios.map((row) => ({
    scenario_id: row.scenario_id, label: row.label, probability_pct: row.probability_pct,
    source_price_target: row.source_price_target, conditions: row.conditions, source: row.source,
    joint_probability_basis: row.joint_probability_basis ?? null,
  })).sort((a, b) => a.scenario_id.localeCompare(b.scenario_id))
  const selectedForecast = {
    forecast_id: c.catalyst.forecast_id, prediction: c.catalyst.name, window_start: c.catalyst.window_start,
    window_end: c.catalyst.window_end, status_as_of: c.catalyst.status_as_of, source_citation: c.catalyst.source,
    metric: c.falsifier.metric, threshold: c.falsifier.threshold, confirmation_trigger: c.catalyst.bullish_trigger,
    falsification_trigger: c.falsifier.condition, stock_bullish_trigger: c.catalyst.bullish_trigger,
    stock_bearish_trigger: c.catalyst.bearish_trigger, causal_steps: c.catalyst.causal_steps,
  }
  const decisionRecord = {
    run_root: runRoot, decision_date: c.decision_date, ticker: c.instrument.ticker,
    company_name: opts.unnamedNegative ? '' : c.instrument.company, exchange: c.instrument.exchange,
    currency: c.instrument.currency, decision: c.research.decision, post_mortem_decision: c.research.decision,
    data_sufficiency_score: c.research.data_sufficiency_score, edge_score: c.research.edge_score,
    edge_proof: c.research.edge_proof, rating_cap: null, red_flags: c.research.unresolved_red_flags,
    confidence_inputs: { rating_cap_ceiling: null, critical_governance_unresolved: false },
    scenario_horizon_days: c.valuation_bridge.source_horizon_days, idea_valuation_bridge: c.valuation_bridge,
    scenarios: c.scenarios.map((row) => ({ scenario_id: row.scenario_id, label: row.label, probability: row.probability_pct, return_pct: row.return_pct ?? null, price_target: row.source_price_target, conditions: row.conditions, source: row.source, joint_probability_basis: row.joint_probability_basis ?? null })),
    forecast_ledger: [{ ...selectedForecast, status: 'open' }],
  }
  fs.writeFileSync(path.join(dir, 'decision_record.json'), JSON.stringify(decisionRecord))

  const thesisSha = fileDigest(path.join(dir, 'final_thesis.md'))
  const decisionSha = fileDigest(path.join(dir, 'decision_record.json'))
  const auditIdentity = {
    schema_version: '1.0', ticker: c.instrument.ticker, run_root: runRoot,
    final_thesis_path: `${runRoot}/final_thesis.md`, decision_record_path: `${runRoot}/decision_record.json`,
    final_thesis_sha256: thesisSha, decision_record_sha256: decisionSha,
  }
  const verification = {
    ...auditIdentity, verified_at: c.created_at, verifier: 'verify-evidence',
    verdict: opts.verify ? 'Clean' : 'Material issues', integrity_score: opts.verify ? 95 : 45,
    blocking_findings: opts.verify
      ? opts.verificationBlockingMismatch ? ['A clean verdict cannot carry this blocker.'] : []
      : ['The test run is not clean at admission.'],
  }
  const canonicalPreSurvives = opts.preMortemSurvives ?? true
  const preMortem = {
    ...auditIdentity, performed_at: c.created_at, auditor: 'pre-mortem',
    verdict: opts.preMortemVerdict ?? (canonicalPreSurvives ? 'Survives' : 'Thesis broken'),
    survives: opts.malformedAudit ? !canonicalPreSurvives : canonicalPreSurvives,
    original_confidence: 70, confidence_haircut: opts.preMortemConfidenceMismatch ? 4 : 5,
    recommended_confidence: 65, recommended_rating_cap: opts.preMortemCap ?? (canonicalPreSurvives ? '' : 'Watchlist'),
  }
  const expectationsQuality = opts.expectationsQuality ?? 'Strong'
  const expectationsExploitable = opts.expectationsExploitable ?? !['None', 'Weak'].includes(expectationsQuality)
  const expectationsGap = {
    ...auditIdentity, performed_at: c.created_at, analyst: 'expectations-gap',
    variant_perception_quality: expectationsQuality,
    is_exploitable: opts.expectationsEdgeMismatch ? false
      : opts.malformedAudit ? (expectationsQuality === 'Weak' ? true : expectationsExploitable) : expectationsExploitable,
    edge_score: opts.expectationsEdgeMismatch ? 50 : (opts.expectationsEdge ?? 66),
  }
  fs.writeFileSync(path.join(dir, 'verification_report.json'), JSON.stringify(verification))
  fs.writeFileSync(path.join(dir, 'pre_mortem.json'), JSON.stringify(preMortem))
  fs.writeFileSync(path.join(dir, 'expectations_gap.json'), JSON.stringify(expectationsGap))

  const manifest: any = {
    schema_version: 'idea-projection-manifest/v1', run_root: runRoot, created_at: c.created_at,
    artifacts: {
      final_thesis: { path: 'final_thesis.md', sha256: thesisSha },
      decision_record: { path: 'decision_record.json', sha256: decisionSha },
      verification: { path: 'verification_report.json', sha256: fileDigest(path.join(dir, 'verification_report.json')) },
      pre_mortem: { path: 'pre_mortem.json', sha256: fileDigest(path.join(dir, 'pre_mortem.json')) },
      expectations_gap: { path: 'expectations_gap.json', sha256: fileDigest(path.join(dir, 'expectations_gap.json')) },
    },
  }
  manifest.manifest_sha256 = digest(manifest)
  fs.writeFileSync(path.join(dir, 'idea_projection_manifest.json'), JSON.stringify(manifest))
  c.projection_manifest_sha256 = manifest.manifest_sha256

  const preCap = preMortem.recommended_rating_cap.trim() || null
  const auditCapReasons: string[] = []
  if (preMortem.survives !== true || preCap) {
    auditCapReasons.push(`pre-mortem audit: ${preMortem.verdict || 'did not survive'}${preCap ? ` (${preCap})` : ''}`)
  }
  if (expectationsGap.is_exploitable !== true || !['Moderate', 'Strong'].includes(expectationsGap.variant_perception_quality)) {
    auditCapReasons.push(
      `expectations-gap audit found no proven exploitable edge (quality=${expectationsGap.variant_perception_quality || 'missing'}, is_exploitable=${String(expectationsGap.is_exploitable).toLowerCase()})`,
    )
  }
  c.research.edge_score = Math.min(decisionRecord.edge_score, expectationsGap.edge_score)
  c.research.hard_cap_active = auditCapReasons.length > 0
  c.research.hard_cap_reason = auditCapReasons.length ? auditCapReasons.join('; ') : null

  const wrapper: any = {
    schema_version: 'idea-assessment/v1', assessment_id: `ASSESS-${name}`, run_root: runRoot,
    created_at: opts.createdAt || c.created_at, ticker: c.instrument.ticker,
    company: opts.unnamedNegative ? null : c.instrument.company,
    status: opts.notAssessable ? 'not_assessable' : 'candidate', gaps: opts.notAssessable ? ['Fresh measured liquidity is missing.'] : [],
    candidate: opts.notAssessable ? null : JSON.parse(JSON.stringify(c)),
  }
  if (opts.halfWritten && wrapper.candidate) delete wrapper.candidate.research
  if (opts.wrapperMismatch) wrapper.created_at = '2026-08-03T11:59:59Z'
  fs.writeFileSync(path.join(dir, 'idea_3_6m.json'), opts.malformed ? '{bad' : JSON.stringify(wrapper))

  let admission: any = null
  if (opts.notAssessable && !opts.malformed && !opts.halfWritten && !opts.wrapperMismatch) {
    admission = {
      schema_version: 'qualified-idea-admission/v1', admission_id: `${wrapper.assessment_id}|${digest(wrapper).slice(0, 16)}`,
      status: 'not_applicable', run_root: runRoot, frozen_at: wrapper.created_at,
      assessment: wrapper, assessment_sha256: digest(wrapper),
      candidate: null, candidate_sha256: null, decision_authority: null, decision_authority_sha256: null,
      market_evidence_sha256: null, market_evidence: null, projection_manifest_sha256: manifest.manifest_sha256,
      integrity_evidence: null, integrity_evidence_sha256: null, gaps: wrapper.gaps,
    }
    admission.admission_sha256 = digest(admission)
    fs.writeFileSync(path.join(dir, 'idea_admission.json'), JSON.stringify(admission))
  } else if (!opts.malformed && !opts.halfWritten && !opts.wrapperMismatch) {
    const decisionAuthority = {
      run_root: runRoot, decision_date: c.decision_date, ticker: c.instrument.ticker, company: c.instrument.company, exchange: c.instrument.exchange,
      currency: c.instrument.currency, decision: c.research.decision, data_sufficiency_score: c.research.data_sufficiency_score,
      edge_score: c.research.edge_score, edge_proof: c.research.edge_proof, hard_cap_required: c.research.hard_cap_active,
      rating_cap_reason: c.research.hard_cap_reason, red_flags: c.research.unresolved_red_flags,
      scenario_horizon_days: c.valuation_bridge.source_horizon_days, scenarios: authorityScenarios,
      idea_valuation_bridge: c.valuation_bridge, selected_forecast: selectedForecast,
      post_audit: {
        pre_mortem: {
          verdict: preMortem.verdict, survives: preMortem.survives,
          recommended_confidence: preMortem.recommended_confidence, recommended_rating_cap: preCap,
        },
        expectations_gap: {
          variant_perception_quality: expectationsGap.variant_perception_quality,
          is_exploitable: expectationsGap.is_exploitable, edge_score: expectationsGap.edge_score,
        },
      },
    }
    const clean = opts.verify === true
    const integrityEvidence = {
      status: clean ? 'verified' : 'provisional', verification_verdict: verification.verdict,
      verification_report_sha256: fileDigest(path.join(dir, 'verification_report.json')), final_thesis_sha256: thesisSha,
    }
    admission = {
      schema_version: 'qualified-idea-admission/v1', admission_id: `${c.idea_id}|${digest(c).slice(0, 16)}`,
      status: clean ? 'admitted' : 'not_admitted', run_root: runRoot, frozen_at: c.created_at,
      assessment: wrapper, assessment_sha256: digest(wrapper), candidate: c, candidate_sha256: digest(c), decision_authority: decisionAuthority,
      decision_authority_sha256: digest(decisionAuthority), market_evidence_sha256: c.market_evidence_sha256,
      market_evidence: marketEvidence(c), projection_manifest_sha256: manifest.manifest_sha256,
      integrity_evidence: integrityEvidence, integrity_evidence_sha256: digest(integrityEvidence),
      gaps: clean ? [] : ['the run did not have a clean pre-admission verification verdict'],
    }
    admission.admission_sha256 = digest(admission)
    fs.writeFileSync(path.join(dir, 'idea_admission.json'), JSON.stringify(admission))
  }
  if (opts.correction) fs.writeFileSync(path.join(dir, 'corrections.json'), JSON.stringify(opts.correction))
  return { dir, candidate: c, assessment: wrapper, admission, manifest, decisionRecord }
}

const empty = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(empty.health.outcome, 'no_artifacts')
assert.equal(empty.health.status, 'pre_data')
assert.equal(empty.policy_version, 'ideas-policy/precal-v1')

const unreadableRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-store-error-'))
fs.writeFileSync(path.join(unreadableRoot, 'analyses'), 'not a directory')
const unreadable = buildQualifiedIdeasBoard(unreadableRoot, { nowMs: NOW })
assert.equal(unreadable.health.outcome, 'storage_error', 'a storage failure cannot masquerade as a genuine empty research set')
assert.equal(unreadable.health.status, 'degraded')
fs.rmSync(unreadableRoot, { recursive: true, force: true })

writeRun('TEST_2026-08-01', { verify: true, createdAt: '2026-08-01T10:00:00Z' })
const one = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(one.health.outcome, 'qualified')
assert.equal(one.health.assessment_count, 1)
assert.equal(one.qualified.length, 1)
assert.equal(one.qualified[0].candidate.research.integrity_status, 'verified')

// Use a clean, isolated board so these health assertions cannot be satisfied by malformed fixtures
// created elsewhere in this cumulative test file.
const mutableDriftRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-mutable-drift-'))
writeRun('STANDING_2026-08-03', { verify: true }, mutableDriftRoot)
const mutableDrift = writeRun('MUTABLEDRIFT_2026-08-03', { verify: true }, mutableDriftRoot)
const cleanMutableBoard = buildQualifiedIdeasBoard(mutableDriftRoot, { nowMs: NOW })
assert.equal(cleanMutableBoard.health.status, 'healthy')
assert.equal(cleanMutableBoard.health.invalid_count, 0)
const mutableDriftAssessment = JSON.parse(fs.readFileSync(path.join(mutableDrift.dir, 'idea_3_6m.json'), 'utf8'))
mutableDriftAssessment.candidate.scenarios[0].price_target = 190
mutableDriftAssessment.candidate.scenarios[0].source_price_target = 190
fs.writeFileSync(path.join(mutableDrift.dir, 'idea_3_6m.json'), JSON.stringify(mutableDriftAssessment))
const mutableDriftBoard = buildQualifiedIdeasBoard(mutableDriftRoot, { nowMs: NOW })
assert.equal(mutableDriftBoard.health.status, 'degraded', 'mutable assessment drift degrades current board health')
assert.equal(mutableDriftBoard.health.invalid_count, 1)
assert.equal(mutableDriftBoard.health.outcome, 'qualified', 'the unrelated clean standing idea still clears')
assert.match(mutableDriftBoard.health.reason, /1 invalid current run/, 'the qualified warning tooltip names the integrity defect count')
assert.ok(mutableDriftBoard.needs_research.find((x) => x.candidate.instrument.ticker === 'MUTABLEDRIFT')?.issues
  .some((x) => x.code === 'authoritative_research_mismatch'))
assert.equal(
  listFrozenQualifiedIdeaEvaluations(mutableDriftRoot).find((x) => x.candidate.instrument.ticker === 'MUTABLEDRIFT')
    ?.candidate.scenarios[0].price_target,
  160,
  'mutable drift does not rewrite the admitted scenario used for outcome grading',
)
fs.rmSync(mutableDriftRoot, { recursive: true, force: true })

const authorityDriftRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-authority-drift-'))
const authorityDrift = writeRun('AUTHORITYDRIFT_2026-08-03', { verify: true }, authorityDriftRoot)
assert.equal(buildQualifiedIdeasBoard(authorityDriftRoot, { nowMs: NOW }).health.status, 'healthy')
fs.appendFileSync(path.join(authorityDrift.dir, 'final_thesis.md'), '\nRetrospective edit.\n')
const authorityDriftBoard = buildQualifiedIdeasBoard(authorityDriftRoot, { nowMs: NOW })
assert.equal(authorityDriftBoard.health.status, 'degraded', 'current manifest or decision drift degrades board health')
assert.equal(authorityDriftBoard.health.invalid_count, 1)
assert.ok(authorityDriftBoard.needs_research[0]?.issues.some((x) => x.code === 'authoritative_research_mismatch'))
assert.ok(listFrozenQualifiedIdeaEvaluations(authorityDriftRoot)
  .some((x) => x.candidate.instrument.ticker === 'AUTHORITYDRIFT'), 'authority drift leaves the frozen outcome cohort intact')
fs.rmSync(authorityDriftRoot, { recursive: true, force: true })

const lowRankingRun = writeRun('LOWRANK_2026-08-01', { verify: true, lowConservativeReturn: true })
const lowRankingBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
const lowRanking = lowRankingBoard.does_not_clear.find((x) => x.candidate.instrument.ticker === 'LOWRANK')
assert.ok(lowRanking?.issues.some((x) => x.code === 'conservative_return_below_bar'), 'a raw-qualified prior cannot appear live when its calibration-adjusted return misses the bar')
assert.equal(lowRanking?.metrics?.expected_return_pct, 17.5, 'the raw immutable scenario math remains visible and unchanged')
assert.equal(lowRanking?.ranking?.conservative_expected_return_pct, 6.13)
assert.ok(
  listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.run_root === lowRankingRun.candidate.run_root),
  'the live ranking gate must not rewrite the immutable admission or select the observation out of outcome grading',
)

writeRun('LOWRANKMIX_2026-08-01', {
  verify: true,
  lowConservativeReturn: true,
  correction: { schema: 'corrections/v1', errata: [{ field: 'final_thesis', kind: 'research_correction' }] },
})
const mixedIssueBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
const mixedIssueLowReturn = mixedIssueBoard.does_not_clear.find((x) => x.candidate.instrument.ticker === 'LOWRANKMIX')
assert.ok(mixedIssueLowReturn?.issues.some((x) => x.code === 'research_not_verified'), 'fixture carries an independent research-only defect')
assert.ok(mixedIssueLowReturn?.issues.some((x) => x.code === 'conservative_return_below_bar'), 'a deterministic below-bar return remains a reject even when another issue already requires research')
assert.equal(mixedIssueLowReturn?.status, 'does_not_clear')

// The newest standing directional call wins; it cannot inherit the older run's clean verification.
writeRun('TEST_2026-08-02', { createdAt: '2026-08-02T10:00:00Z' })
const newerUnaudited = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(newerUnaudited.qualified.length, 0)
assert.equal(newerUnaudited.needs_research.length, 1)
assert.equal(newerUnaudited.needs_research[0].candidate.run_root, 'analyses/TEST_2026-08-02')
assert.ok(newerUnaudited.needs_research[0].issues.some((x) => x.code === 'research_not_verified'))

// A corrected derivative must be regenerated; a previously clean report cannot bless stale math.
writeRun('OTHER_2026-08-01', { verify: true, correction: { schema: 'corrections/v1', errata: [{ field: 'scenarios[].probability', kind: 'scale_fix' }] } })
const corrected = buildQualifiedIdeasBoard(root, { nowMs: NOW })
const other = corrected.needs_research.find((x) => x.candidate.run_root === 'analyses/OTHER_2026-08-01')
assert.ok(other?.issues.some((x) => x.code === 'research_not_verified'))

writeRun('GAP_2026-08-01', { notAssessable: true })
const gap = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(gap.health.not_assessable_count, 1)
assert.deepEqual(gap.not_assessable[0].gaps, ['Fresh measured liquidity is missing.'])

// A completed run that stopped before its projection manifest/admission is a production gap, not an
// empty Ideas data plane. It stays out of candidate evaluation and makes board health visibly degraded
// until a genuinely new run completes the immutable sequence.
const unfinished = writeRun('UNFINISHED_2026-08-03', { notAssessable: true, createdAt: '2026-08-03T04:00:00Z' })
fs.rmSync(path.join(unfinished.dir, 'idea_admission.json'))
fs.rmSync(path.join(unfinished.dir, 'idea_projection_manifest.json'))
const unfinishedBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(unfinishedBoard.health.incomplete_count, 1)
assert.equal(unfinishedBoard.health.status, 'degraded')
assert.match(unfinishedBoard.health.reason, /did not finish immutable publication/)
const unfinishedGap = unfinishedBoard.not_assessable.find((x) => x.ticker === 'UNFINISHED')
assert.ok(unfinishedGap?.gaps.some((message) => /immutable idea publication did not finish/i.test(message)))
assert.ok(![...unfinishedBoard.qualified, ...unfinishedBoard.needs_research, ...unfinishedBoard.does_not_clear]
  .some((x) => x.candidate.instrument.ticker === 'UNFINISHED'), 'a mutable preliminary result is never evaluated as an investment idea')

// Python's authority normalizes a blank decision company to null. The reader must do the same so an
// honestly unnamed not-assessable result does not become an integrity defect at recovery time.
const invalidBeforeUnnamed = gap.health.invalid_count
writeRun('NEGUNNAMED_2026-08-01', { notAssessable: true, unnamedNegative: true })
const unnamedNegativeBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(unnamedNegativeBoard.not_assessable.find((x) => x.ticker === 'NEGUNNAMED')?.company, null)
assert.equal(unnamedNegativeBoard.health.invalid_count, invalidBeforeUnnamed)

// A frozen negative is a first-class admission result. Rewriting the mutable assessment later cannot
// manufacture a candidate after its return path is observable.
const frozenNegativeFixture = writeRun('FROZENNEG_2026-08-01', { notAssessable: true })
assert.equal(frozenNegativeFixture.admission.status, 'not_applicable')
assert.equal(frozenNegativeFixture.admission.candidate, null)
assert.equal(frozenNegativeFixture.admission.decision_authority, null)
assert.equal(frozenNegativeFixture.admission.projection_manifest_sha256, frozenNegativeFixture.manifest.manifest_sha256)
const rewrittenNegative = JSON.parse(JSON.stringify(frozenNegativeFixture.assessment))
rewrittenNegative.status = 'candidate'
rewrittenNegative.gaps = []
rewrittenNegative.candidate = frozenNegativeFixture.candidate
fs.writeFileSync(path.join(frozenNegativeFixture.dir, 'idea_3_6m.json'), JSON.stringify(rewrittenNegative))
const frozenNegativeBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(![...frozenNegativeBoard.qualified, ...frozenNegativeBoard.needs_research, ...frozenNegativeBoard.does_not_clear]
  .some((x) => x.candidate.instrument.ticker === 'FROZENNEG'))
assert.deepEqual(
  frozenNegativeBoard.not_assessable.find((x) => x.ticker === 'FROZENNEG')?.gaps,
  ['Fresh measured liquidity is missing.'],
  'the first frozen not-assessable result remains authoritative after a mutable rewrite',
)

writeRun('BROKEN_2026-08-01', { malformed: true })
writeRun('PARTIAL_2026-08-01', { halfWritten: true })
writeRun('MISMATCH_2026-08-01', { wrapperMismatch: true })
const broken = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(broken.health.status, 'degraded')
assert.equal(broken.health.invalid_count, 4, 'three malformed artifacts plus the detected frozen-negative rewrite are degraded')

const frozenNegativeManifest = writeRun('NEGDRIFT_2026-08-01', { notAssessable: true })
const driftedNegativeManifest = JSON.parse(fs.readFileSync(path.join(frozenNegativeManifest.dir, 'idea_projection_manifest.json'), 'utf8'))
driftedNegativeManifest.created_at = '2026-08-01T10:01:00Z'
fs.writeFileSync(path.join(frozenNegativeManifest.dir, 'idea_projection_manifest.json'), JSON.stringify(driftedNegativeManifest))
const negativeManifestBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(negativeManifestBoard.not_assessable.some((x) => x.ticker === 'NEGDRIFT'), 'manifest drift cannot retrospectively replace a frozen negative')
assert.equal(negativeManifestBoard.health.status, 'degraded', 'negative admission manifest drift remains visible as an integrity defect')

const beforeMissingNegative = negativeManifestBoard.health.invalid_count
const missingNegative = writeRun('NEGMISSING_2026-08-01', { notAssessable: true })
fs.unlinkSync(path.join(missingNegative.dir, 'idea_3_6m.json'))
const missingNegativeBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(missingNegativeBoard.not_assessable.some((x) => x.ticker === 'NEGMISSING'), 'deleting the mutable witness cannot erase its frozen negative')
assert.equal(missingNegativeBoard.health.invalid_count, beforeMissingNegative + 1, 'a missing sealed-negative assessment degrades health')

function rewriteFrozenNegative(fixture: ReturnType<typeof writeRun>, mutate: (assessment: any) => void): void {
  const admission = JSON.parse(JSON.stringify(fixture.admission))
  mutate(admission.assessment)
  admission.assessment_sha256 = digest(admission.assessment)
  admission.gaps = admission.assessment.gaps
  delete admission.admission_sha256
  admission.admission_sha256 = digest(admission)
  fs.writeFileSync(path.join(fixture.dir, 'idea_3_6m.json'), JSON.stringify(admission.assessment))
  fs.writeFileSync(path.join(fixture.dir, 'idea_admission.json'), JSON.stringify(admission))
}

function resealFrozenNegativeDecision(
  fixture: ReturnType<typeof writeRun>,
  mutate: (decision: any) => void,
): void {
  const decisionFile = path.join(fixture.dir, 'decision_record.json')
  const decision = JSON.parse(fs.readFileSync(decisionFile, 'utf8'))
  mutate(decision)
  fs.writeFileSync(decisionFile, JSON.stringify(decision))
  const decisionSha = fileDigest(decisionFile)
  for (const name of ['verification_report.json', 'pre_mortem.json', 'expectations_gap.json']) {
    const auditFile = path.join(fixture.dir, name)
    const audit = JSON.parse(fs.readFileSync(auditFile, 'utf8'))
    audit.ticker = decision.ticker
    audit.decision_record_sha256 = decisionSha
    fs.writeFileSync(auditFile, JSON.stringify(audit))
  }
  const manifestFile = path.join(fixture.dir, 'idea_projection_manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  manifest.artifacts.decision_record.sha256 = decisionSha
  manifest.artifacts.verification.sha256 = fileDigest(path.join(fixture.dir, 'verification_report.json'))
  manifest.artifacts.pre_mortem.sha256 = fileDigest(path.join(fixture.dir, 'pre_mortem.json'))
  manifest.artifacts.expectations_gap.sha256 = fileDigest(path.join(fixture.dir, 'expectations_gap.json'))
  delete manifest.manifest_sha256
  manifest.manifest_sha256 = digest(manifest)
  fs.writeFileSync(manifestFile, JSON.stringify(manifest))

  const admission = JSON.parse(JSON.stringify(fixture.admission))
  admission.assessment.ticker = decision.ticker
  admission.assessment.company = typeof decision.company_name === 'string' && decision.company_name.trim()
    ? decision.company_name.trim() : null
  admission.assessment_sha256 = digest(admission.assessment)
  admission.projection_manifest_sha256 = manifest.manifest_sha256
  delete admission.admission_sha256
  admission.admission_sha256 = digest(admission)
  fs.writeFileSync(path.join(fixture.dir, 'idea_3_6m.json'), JSON.stringify(admission.assessment))
  fs.writeFileSync(path.join(fixture.dir, 'idea_admission.json'), JSON.stringify(admission))
}

const beforeIdentityNegative = missingNegativeBoard.health.invalid_count
const identityNegative = writeRun('NEGIDENTITY_2026-08-01', { notAssessable: true })
rewriteFrozenNegative(identityNegative, (assessment) => { assessment.company = 'Wrong Holdings' })
const identityNegativeBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(identityNegativeBoard.not_assessable.some((x) => x.ticker === 'NEGIDENTITY'), 'identity drift cannot replace the frozen negative')
assert.equal(identityNegativeBoard.health.invalid_count, beforeIdentityNegative + 1, 'negative identity must reconcile to the sealed decision')

const beforeOrderNegative = identityNegativeBoard.health.invalid_count
const orderNegative = writeRun('NEGORDER_2026-08-01', { notAssessable: true })
rewriteFrozenNegative(orderNegative, (assessment) => { assessment.created_at = '2026-08-01T09:59:59Z' })
const orderNegativeBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(orderNegativeBoard.not_assessable.some((x) => x.ticker === 'NEGORDER'), 'publication-order drift cannot replace the frozen negative')
assert.equal(orderNegativeBoard.health.invalid_count, beforeOrderNegative + 1, 'manifest creation must precede the frozen negative assessment')

// Rehashing every internal witness cannot move an admission to a different listing or run date. The
// folder name is the external identity anchor, including for the frozen-negative path.
const wrongTickerNegative = writeRun('NEGFOLDERTICKER_2026-08-01', { notAssessable: true })
resealFrozenNegativeDecision(wrongTickerNegative, (decision) => { decision.ticker = 'OTHER' })
const wrongTickerNegativeBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.equal(wrongTickerNegativeBoard.health.invalid_count, orderNegativeBoard.health.invalid_count + 1)

const wrongDateNegative = writeRun('NEGFOLDERDATE_2026-08-01', { notAssessable: true })
resealFrozenNegativeDecision(wrongDateNegative, (decision) => { decision.decision_date = '2026-08-02' })
const wrongDateNegativeBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(wrongDateNegativeBoard.not_assessable.some((x) => x.ticker === 'NEGFOLDERDATE'))
assert.equal(wrongDateNegativeBoard.health.invalid_count, wrongTickerNegativeBoard.health.invalid_count + 1)

writeRun('OLD_2026-08-01', { verify: true, correction: { schema: 'corrections/v1', superseded_by: { run_root: 'analyses/OLD_2026-08-02' } } })
const superseded = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(![...superseded.qualified, ...superseded.needs_research, ...superseded.does_not_clear].some((x) => x.candidate.run_root === 'analyses/OLD_2026-08-01'))
assert.ok(listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.run_root === 'analyses/OLD_2026-08-01'), 'supersession removes a live call without erasing its ex-ante outcome cohort')

// A newer honest gap is authoritative. It must not leave yesterday's qualified card on screen.
writeRun('SHADOWGAP_2026-08-01', { verify: true, createdAt: '2026-08-01T10:00:00Z' })
writeRun('SHADOWGAP_2026-08-02', { notAssessable: true, createdAt: '2026-08-02T10:00:00Z' })
const shadowedByGap = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(![...shadowedByGap.qualified, ...shadowedByGap.needs_research, ...shadowedByGap.does_not_clear].some((x) => x.candidate.instrument.ticker === 'SHADOWGAP'))
assert.equal(shadowedByGap.not_assessable.find((x) => x.ticker === 'SHADOWGAP')?.run_root, 'analyses/SHADOWGAP_2026-08-02')

// A newer malformed artifact also shadows the old call, but degrades health instead of pretending the
// malformed run said "nothing clears".
writeRun('SHADOWBAD_2026-08-01', { verify: true, createdAt: '2026-08-01T10:00:00Z' })
writeRun('SHADOWBAD_2026-08-02', { malformed: true, createdAt: '2026-08-02T10:00:00Z' })
const shadowedByInvalid = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(![...shadowedByInvalid.qualified, ...shadowedByInvalid.needs_research, ...shadowedByInvalid.does_not_clear].some((x) => x.candidate.instrument.ticker === 'SHADOWBAD'))
assert.equal(shadowedByInvalid.health.status, 'degraded')
assert.ok(shadowedByInvalid.health.invalid_count >= 4)

writeRun('SKEW_2026-08-03', { verify: true, createdAt: '2026-08-03T10:00:00Z', entryStartsEarly: true })
assert.ok(!listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'SKEW'), 'a holding period that starts before publication cannot count pre-publication returns')

const outcomeHealthFile = qualifiedIdeaOutcomeHealthPath(root)
fs.mkdirSync(path.dirname(outcomeHealthFile), { recursive: true })
fs.writeFileSync(outcomeHealthFile, JSON.stringify({
  schema_version: 'qualified-idea-outcomes-health/v1', status: 'healthy', outcome: 'nothing_due',
  reason: 'Purported healthy state.', updated_at: '2026-08-03', qualified_idea_count: 1, due_count: 0,
  appended_count: 0, existing_count: 0, unresolved_count: 0, not_due_count: 1,
  missing_history: [], missing_comparators: [], errors: [],
}))
assert.equal(buildQualifiedIdeasBoard(root, { nowMs: NOW }).outcome_health, null, 'malformed outcome health is unknown, never silently healthy')

writeRun('NODEC_2026-08-03', { verify: true })
fs.unlinkSync(path.join(root, 'analyses', 'NODEC_2026-08-03', 'decision_record.json'))
const missingAuthority = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!missingAuthority.qualified.some((x) => x.candidate.instrument.ticker === 'NODEC'), 'a derivative cannot qualify without its same-run decision record')
assert.ok(missingAuthority.needs_research.find((x) => x.candidate.instrument.ticker === 'NODEC')?.issues.some((x) => x.code === 'authoritative_research_mismatch'))

writeRun('DOWNGRADE_2026-08-03', { verify: true })
const downgradeDecision = path.join(root, 'analyses', 'DOWNGRADE_2026-08-03', 'decision_record.json')
const downgraded = JSON.parse(fs.readFileSync(downgradeDecision, 'utf8'))
downgraded.post_mortem_decision = 'Watchlist'
fs.writeFileSync(downgradeDecision, JSON.stringify(downgraded))
const downgradedBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!downgradedBoard.qualified.some((x) => x.candidate.instrument.ticker === 'DOWNGRADE'), 'a post-mortem downgrade cannot leave a frozen Buy live')

// The manifest binds the exact final thesis bytes. Live display is quarantined after mutation, while
// the immutable ex-ante candidate remains available to the outcome loop.
const thesisDrift = writeRun('THESISDRIFT_2026-08-03', { verify: true })
fs.appendFileSync(path.join(thesisDrift.dir, 'final_thesis.md'), '\nRetrospective edit.\n')
const thesisDriftBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!thesisDriftBoard.qualified.some((x) => x.candidate.instrument.ticker === 'THESISDRIFT'))
assert.ok(thesisDriftBoard.needs_research.find((x) => x.candidate.instrument.ticker === 'THESISDRIFT')?.issues
  .some((x) => x.code === 'authoritative_research_mismatch'))
assert.ok(listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'THESISDRIFT'))

// A later audit version invalidates a manifest that pinned the older set. It cannot silently replace the
// evidence that authorized the live card or erase the already-frozen outcome cohort.
const newerAudit = writeRun('NEWERAUDIT_2026-08-03', { verify: true })
fs.copyFileSync(path.join(newerAudit.dir, 'verification_report.json'), path.join(newerAudit.dir, 'verification_report_v2.json'))
const newerAuditBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!newerAuditBoard.qualified.some((x) => x.candidate.instrument.ticker === 'NEWERAUDIT'))
assert.ok(newerAuditBoard.needs_research.find((x) => x.candidate.instrument.ticker === 'NEWERAUDIT')?.issues
  .some((x) => x.code === 'authoritative_research_mismatch'))
assert.ok(listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'NEWERAUDIT'))

// A digest-valid manifest is not enough: canonical audit identities and conclusions are revalidated.
const malformedAudit = writeRun('BADAUDIT_2026-08-03', { verify: true, malformedAudit: true })
const malformedAuditBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!malformedAuditBoard.qualified.some((x) => x.candidate.instrument.ticker === 'BADAUDIT'))
assert.ok([...malformedAuditBoard.needs_research, ...malformedAuditBoard.does_not_clear]
  .find((x) => x.candidate.instrument.ticker === 'BADAUDIT')?.issues
  .some((x) => x.code === 'authoritative_research_mismatch'))
assert.equal(malformedAudit.manifest.manifest_sha256.length, 64)

for (const [name, malformed] of [
  ['BLOCKING', { verificationBlockingMismatch: true }],
  ['HAIRCUT', { preMortemConfidenceMismatch: true }],
  ['NOEDGE', { expectationsEdgeMismatch: true, expectationsQuality: 'Moderate' as const }],
] as const) {
  writeRun(`${name}_2026-08-03`, { verify: true, ...malformed })
  const semanticBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
  const evaluation = [...semanticBoard.needs_research, ...semanticBoard.does_not_clear]
    .find((x) => x.candidate.instrument.ticker === name)
  assert.ok(evaluation?.issues.some((x) => x.code === 'authoritative_research_mismatch'), `${name} audit semantics must fail closed`)
}

// Recompute the post-audit authority exactly: audit edge is the binding minimum and cap reasons retain
// producer order and wording. Matching authority must not be mislabeled as a digest drift.
const auditCap = writeRun('AUDITCAP_2026-08-03', {
  verify: true,
  preMortemSurvives: false,
  preMortemVerdict: 'Thesis broken',
  preMortemCap: 'Watchlist',
  expectationsQuality: 'Weak',
  expectationsExploitable: false,
  expectationsEdge: 30,
})
assert.equal(auditCap.admission.decision_authority.edge_score, 30)
assert.equal(
  auditCap.admission.decision_authority.rating_cap_reason,
  'pre-mortem audit: Thesis broken (Watchlist); expectations-gap audit found no proven exploitable edge (quality=Weak, is_exploitable=false)',
)
assert.deepEqual(auditCap.admission.decision_authority.post_audit, {
  pre_mortem: { verdict: 'Thesis broken', survives: false, recommended_confidence: 65, recommended_rating_cap: 'Watchlist' },
  expectations_gap: { variant_perception_quality: 'Weak', is_exploitable: false, edge_score: 30 },
})
const auditCapBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
const auditCapEvaluation = [...auditCapBoard.needs_research, ...auditCapBoard.does_not_clear]
  .find((x) => x.candidate.instrument.ticker === 'AUDITCAP')
assert.ok(auditCapEvaluation)
assert.ok(!auditCapEvaluation?.issues.some((x) => x.code === 'authoritative_research_mismatch'))

writeRun('LATEAUDIT_2026-08-03')
assert.ok(!listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'LATEAUDIT'))
fs.writeFileSync(path.join(root, 'analyses', 'LATEAUDIT_2026-08-03', 'verification_report.json'), JSON.stringify({ verdict: 'Clean', integrity_score: 99 }))
assert.ok(!listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'LATEAUDIT'), 'a late clean audit cannot backdate admission after outcomes are observable')

writeRun('MUTATED_2026-08-03', { verify: true })
const mutableAssessmentPath = path.join(root, 'analyses', 'MUTATED_2026-08-03', 'idea_3_6m.json')
const mutableAssessment = JSON.parse(fs.readFileSync(mutableAssessmentPath, 'utf8'))
mutableAssessment.candidate.scenarios[0].price_target = 190
mutableAssessment.candidate.scenarios[0].source_price_target = 190
fs.writeFileSync(mutableAssessmentPath, JSON.stringify(mutableAssessment))
const mutatedBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!mutatedBoard.qualified.some((x) => x.candidate.instrument.ticker === 'MUTATED'), 'post-admission scenario edits quarantine the live card')
const frozenMutated = listFrozenQualifiedIdeaEvaluations(root).find((x) => x.candidate.instrument.ticker === 'MUTATED')
assert.equal(frozenMutated?.candidate.scenarios[0].price_target, 160, 'outcomes retain the exact ex-ante admitted scenario')

writeRun('DELETED_2026-08-03', { verify: true })
fs.unlinkSync(path.join(root, 'analyses', 'DELETED_2026-08-03', 'idea_3_6m.json'))
assert.ok(listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'DELETED'), 'deleting a mutable assessment cannot erase its admitted outcome cohort')
const deletedBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(deletedBoard.needs_research.some((x) => x.candidate.instrument.ticker === 'DELETED'), 'a missing mutable assessment quarantines only the live card')
assert.ok(deletedBoard.health.artifact_count > 0, 'an immutable admission still counts as an artifact')

writeRun('CORRUPTED_2026-08-03', { verify: true })
fs.writeFileSync(path.join(root, 'analyses', 'CORRUPTED_2026-08-03', 'idea_3_6m.json'), '{bad')
assert.ok(listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'CORRUPTED'), 'corrupting a mutable assessment cannot erase its admitted outcome cohort')

writeRun('RELABELED_2026-08-03', { verify: true })
const relabeledPath = path.join(root, 'analyses', 'RELABELED_2026-08-03', 'idea_3_6m.json')
const relabeled = JSON.parse(fs.readFileSync(relabeledPath, 'utf8'))
relabeled.status = 'not_assessable'; relabeled.gaps = ['Later mutable relabel']; relabeled.candidate = null
fs.writeFileSync(relabeledPath, JSON.stringify(relabeled))
assert.ok(listFrozenQualifiedIdeaEvaluations(root).some((x) => x.candidate.instrument.ticker === 'RELABELED'), 'changing a mutable wrapper to not_assessable cannot erase admission')

// Isolated publication-grace regression: the synthesizer writes final_thesis/decision_record before
// idea_3_6m. While the owning run has recent trustworthy progress, that normal interval must neither be
// called a failure nor hide the prior sealed call. The exact same state fails closed once progress ages
// beyond the six-hour publication window.
const graceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-publication-grace-'))
writeRun('GRACE_2026-08-02', { verify: true, createdAt: '2026-08-02T10:00:00Z' }, graceRoot)
const gracePendingDir = path.join(graceRoot, 'analyses', 'GRACE_2026-08-03')
fs.mkdirSync(gracePendingDir, { recursive: true })
fs.writeFileSync(path.join(gracePendingDir, 'final_thesis.md'), '# New GRACE thesis\n')
fs.writeFileSync(path.join(gracePendingDir, 'decision_record.json'), JSON.stringify({ ticker: 'GRACE', company_name: 'Grace Holdings' }))
const graceRun = createRun({
  kind: 'full', ticker: 'GRACE', model: 'sonnet', prompt: '/research:full GRACE',
  runRoot: 'analyses/GRACE_2026-08-03', willCommitToMain: true,
  writeTargetsAbs: [gracePendingDir], coveredModules: [], readDepsAbs: [],
})
graceRun.status = 'running'
graceRun.startedAt = NOW - 60 * 60_000
setActiveTickerRun(graceRun.runId, 'GRACE')
const insidePublicationGrace = buildQualifiedIdeasBoard(graceRoot, { nowMs: NOW })
assert.equal(insidePublicationGrace.health.publishing_count, 1)
assert.ok(insidePublicationGrace.qualified.some((row) => row.candidate.instrument.ticker === 'GRACE'), 'a missing preliminary assessment inside grace does not hide the prior sealed card')
assert.ok(!insidePublicationGrace.not_assessable.some((row) => row.ticker === 'GRACE'), 'normal pre-assessment production is not mislabeled as failed')

graceRun.startedAt = NOW - 7 * 60 * 60_000
const afterPublicationGrace = buildQualifiedIdeasBoard(graceRoot, { nowMs: NOW })
assert.equal(afterPublicationGrace.health.publishing_count, 0)
assert.ok(!afterPublicationGrace.qualified.some((row) => row.candidate.instrument.ticker === 'GRACE'), 'the newer incomplete run shadows the old card after grace expires')
assert.ok(afterPublicationGrace.not_assessable.some((row) => row.ticker === 'GRACE' && row.gaps.some((gap) => /publication did not finish/.test(gap))))
finishRun(graceRun, 'done')
fs.rmSync(graceRoot, { recursive: true, force: true })

// Direct /research:full producers can write the terminal thesis and decision without ever entering the
// cockpit registry/activity ledger. Their two still-uncommitted artifacts supply a durable restart-safe
// grace clock, but only while their identities agree and their writes are close together. A clean
// checkout/replay is not uncommitted, so refreshing its mtimes cannot revive grace.
const directRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-direct-publication-'))
for (const ticker of ['DIRECTA', 'DIRECTB']) {
  writeRun(`${ticker}_2026-08-02`, { verify: true, createdAt: '2026-08-02T10:00:00Z' }, directRoot)
  const pending = path.join(directRoot, 'analyses', `${ticker}_2026-08-03`)
  fs.mkdirSync(pending, { recursive: true })
  fs.writeFileSync(path.join(pending, 'final_thesis.md'), `# New ${ticker} thesis\n`)
  fs.writeFileSync(path.join(pending, 'decision_record.json'), JSON.stringify({
    run_root: `analyses/${ticker}_2026-08-03`, decision_date: '2026-08-03', ticker,
    company_name: `${ticker} Holdings`,
  }))
  const fresh = new Date(NOW - 60 * 60_000)
  fs.utimesSync(path.join(pending, 'final_thesis.md'), fresh, fresh)
  fs.utimesSync(path.join(pending, 'decision_record.json'), fresh, fresh)
}
let activityReads = 0
let uncommittedScans = 0
const directFreshBoard = buildQualifiedIdeasBoard(directRoot, {
  nowMs: NOW,
  readActivityRows: () => {
    activityReads++
    return { rows: [], total: 0, allTime: 0, users: [], tickers: [], tickerLabels: {}, earliest: null }
  },
  readUncommittedPublicationRuns: () => {
    uncommittedScans++
    return new Set(['analyses/DIRECTA_2026-08-03', 'analyses/DIRECTB_2026-08-03'])
  },
})
assert.equal(activityReads, 1, 'one board projection reads and groups the activity ledger once across unsealed tickers')
assert.equal(uncommittedScans, 1, 'one board projection runs at most one bounded Git scan across unsealed tickers')
assert.equal(directFreshBoard.health.publishing_count, 2)
assert.ok(directFreshBoard.qualified.some((row) => row.candidate.instrument.ticker === 'DIRECTA'), 'a fresh direct producer retains the older sealed card during grace')
assert.ok(directFreshBoard.qualified.some((row) => row.candidate.instrument.ticker === 'DIRECTB'))

const truncatedLedgerBoard = buildQualifiedIdeasBoard(directRoot, {
  nowMs: NOW,
  readActivityRows: () => ({ rows: [], total: 5_001, allTime: 5_001, users: [], tickers: [], tickerLabels: {}, earliest: NOW - 1 }),
  readUncommittedPublicationRuns: () => new Set(['analyses/DIRECTA_2026-08-03', 'analyses/DIRECTB_2026-08-03']),
})
assert.equal(truncatedLedgerBoard.health.publishing_count, 0, 'a truncated global ledger read cannot hide a terminal retry and grant artifact-clock grace')
assert.ok(!truncatedLedgerBoard.qualified.some((row) => row.candidate.instrument.ticker === 'DIRECTA'))

const malformedLedgerBoard = buildQualifiedIdeasBoard(directRoot, {
  nowMs: NOW,
  readActivityRows: () => ({
    rows: [{ runId: 'malformed-valid-json-row', ticker: null } as any], total: 1, allTime: 1,
    users: [], tickers: [], tickerLabels: {}, earliest: NOW - 1,
  }),
  readUncommittedPublicationRuns: () => new Set(['analyses/DIRECTA_2026-08-03', 'analyses/DIRECTB_2026-08-03']),
})
assert.equal(malformedLedgerBoard.health.publishing_count, 0, 'a malformed activity row cannot crash the board or make the ledger look complete enough for direct grace')
assert.ok(!malformedLedgerBoard.qualified.some((row) => row.candidate.instrument.ticker === 'DIRECTA'))

const directGitRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-direct-git-positive-'))
writeRun('DIRECTGIT_2026-08-02', { verify: true, createdAt: '2026-08-02T10:00:00Z' }, directGitRoot)
execFileSync('git', ['init', '-q'], { cwd: directGitRoot })
execFileSync('git', ['add', 'analyses'], { cwd: directGitRoot })
execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'sealed baseline'], { cwd: directGitRoot })
const directGitPending = path.join(directGitRoot, 'analyses', 'DIRECTGIT_2026-08-03')
fs.mkdirSync(directGitPending, { recursive: true })
fs.writeFileSync(path.join(directGitPending, 'final_thesis.md'), '# New DIRECTGIT thesis\n')
fs.writeFileSync(path.join(directGitPending, 'decision_record.json'), JSON.stringify({
  run_root: 'analyses/DIRECTGIT_2026-08-03', decision_date: '2026-08-03', ticker: 'DIRECTGIT',
  company_name: 'Direct Git Holdings',
}))
const directGitFresh = new Date(NOW - 60 * 60_000)
fs.utimesSync(path.join(directGitPending, 'final_thesis.md'), directGitFresh, directGitFresh)
fs.utimesSync(path.join(directGitPending, 'decision_record.json'), directGitFresh, directGitFresh)
const directGitBoard = buildQualifiedIdeasBoard(directGitRoot, {
  nowMs: NOW,
  readActivityRows: () => ({ rows: [], total: 0, allTime: 0, users: [], tickers: [], tickerLabels: {}, earliest: null }),
})
assert.equal(directGitBoard.health.publishing_count, 1, 'the production Git parser recognizes two fresh untracked direct-producer artifacts')
assert.ok(directGitBoard.qualified.some((row) => row.candidate.instrument.ticker === 'DIRECTGIT'))
fs.rmSync(directGitRoot, { recursive: true, force: true })

const stale = new Date(NOW - 7 * 60 * 60_000)
for (const ticker of ['DIRECTA', 'DIRECTB']) {
  const pending = path.join(directRoot, 'analyses', `${ticker}_2026-08-03`)
  fs.utimesSync(path.join(pending, 'final_thesis.md'), stale, stale)
  fs.utimesSync(path.join(pending, 'decision_record.json'), stale, stale)
}
const directStaleBoard = buildQualifiedIdeasBoard(directRoot, {
  nowMs: NOW,
  readUncommittedPublicationRuns: () => new Set([
    'analyses/DIRECTA_2026-08-03', 'analyses/DIRECTB_2026-08-03',
  ]),
})
assert.equal(directStaleBoard.health.publishing_count, 0, 'an abandoned direct producer fails closed after grace')
assert.ok(!directStaleBoard.qualified.some((row) => row.candidate.instrument.ticker === 'DIRECTA'))
assert.ok(directStaleBoard.not_assessable.some((row) => row.ticker === 'DIRECTA' && row.gaps.some((gap) => /publication did not finish/.test(gap))))

const replayFresh = new Date(NOW - 10 * 60_000)
execFileSync('git', ['init', '-q'], { cwd: directRoot })
execFileSync('git', ['add', 'analyses'], { cwd: directRoot })
execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture'], { cwd: directRoot })
for (const ticker of ['DIRECTA', 'DIRECTB']) {
  const pending = path.join(directRoot, 'analyses', `${ticker}_2026-08-03`)
  fs.utimesSync(path.join(pending, 'final_thesis.md'), replayFresh, replayFresh)
  fs.utimesSync(path.join(pending, 'decision_record.json'), replayFresh, replayFresh)
}
const replayBoard = buildQualifiedIdeasBoard(directRoot, {
  nowMs: NOW,
})
assert.equal(replayBoard.health.publishing_count, 0, 'fresh checkout/replay mtimes cannot reset grace when Git reports clean artifacts')
assert.ok(!replayBoard.qualified.some((row) => row.candidate.instrument.ticker === 'DIRECTA'))
fs.rmSync(directRoot, { recursive: true, force: true })

const terminalRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-terminal-publication-'))
writeRun('TERMINAL_2026-08-02', { verify: true, createdAt: '2026-08-02T10:00:00Z' }, terminalRoot)
const terminalPendingDir = path.join(terminalRoot, 'analyses', 'TERMINAL_2026-08-03')
fs.mkdirSync(terminalPendingDir, { recursive: true })
fs.writeFileSync(path.join(terminalPendingDir, 'final_thesis.md'), '# Terminal thesis\n')
fs.writeFileSync(path.join(terminalPendingDir, 'decision_record.json'), JSON.stringify({ ticker: 'TERMINAL', company_name: 'Terminal Holdings' }))
const terminalPublicationBoard = buildQualifiedIdeasBoard(terminalRoot, {
  nowMs: NOW,
  readActivityRows: () => ({
    rows: [
      {
        runId: 'qualified-ideas-terminal-publication-newer', user: 'local', userVia: 'local', kind: 'full',
        ticker: 'TERMINAL', runRoot: 'analyses/TERMINAL_2026-08-03', model: 'sonnet',
        launchedAt: NOW - 2 * 60 * 60_000, finishedAt: NOW - 60 * 60_000, status: 'done',
      },
      {
        runId: 'qualified-ideas-terminal-publication-orphan', user: 'local', userVia: 'local', kind: 'full',
        ticker: 'TERMINAL', runRoot: 'analyses/TERMINAL_2026-08-03', model: 'sonnet',
        launchedAt: NOW - 3 * 60 * 60_000, status: 'running',
      },
    ],
    total: 2, allTime: 2, users: ['local'], tickers: ['TERMINAL'], tickerLabels: {}, earliest: NOW - 3 * 60 * 60_000,
  }),
})
assert.equal(terminalPublicationBoard.health.publishing_count, 0, 'an older orphaned launch cannot hold grace open after a newer retry ended')
assert.ok(!terminalPublicationBoard.qualified.some((row) => row.candidate.instrument.ticker === 'TERMINAL'), 'the latest terminal attempt fails closed instead of leaving the older sealed card active')
assert.ok(terminalPublicationBoard.not_assessable.some((row) => row.ticker === 'TERMINAL' && row.gaps.some((gap) => /stopped before immutable idea publication finished/.test(gap))))
fs.rmSync(terminalRoot, { recursive: true, force: true })

const terminalPreliminaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-terminal-preliminary-'))
writeRun('TERMPRE_2026-08-02', { verify: true, createdAt: '2026-08-02T10:00:00Z' }, terminalPreliminaryRoot)
const terminalPreliminary = writeRun(
  'TERMPRE_2026-08-03', { verify: true, createdAt: '2026-08-03T11:30:00Z' }, terminalPreliminaryRoot,
)
fs.unlinkSync(path.join(terminalPreliminary.dir, 'idea_admission.json'))
const stoppedAfterPreliminary = buildQualifiedIdeasBoard(terminalPreliminaryRoot, {
  nowMs: NOW,
  readActivityRows: () => ({
    rows: [{
      runId: 'qualified-ideas-terminal-after-preliminary', user: 'local', userVia: 'local', kind: 'full',
      ticker: 'TERMPRE', runRoot: 'analyses/TERMPRE_2026-08-03', model: 'sonnet',
      launchedAt: NOW - 60 * 60_000, finishedAt: NOW - 10 * 60_000, status: 'error',
    }],
    total: 1, allTime: 1, users: ['local'], tickers: ['TERMPRE'], tickerLabels: {}, earliest: NOW - 60 * 60_000,
  }),
})
assert.equal(stoppedAfterPreliminary.health.publishing_count, 0, 'a terminal producer closes grace even after writing a recent preliminary assessment')
assert.ok(!stoppedAfterPreliminary.qualified.some((row) => row.candidate.instrument.ticker === 'TERMPRE'), 'a stopped newer producer quarantines the prior sealed card')
assert.ok(stoppedAfterPreliminary.not_assessable.some((row) => (
  row.ticker === 'TERMPRE' && row.gaps.some((gap) => /stopped before immutable idea publication finished/.test(gap))
)))
fs.rmSync(terminalPreliminaryRoot, { recursive: true, force: true })

writeRun('MISSINGIDEA_2026-08-02', { verify: true, createdAt: '2026-08-02T10:00:00Z' })
const missingIdeaNew = path.join(root, 'analyses', 'MISSINGIDEA_2026-08-03')
fs.mkdirSync(missingIdeaNew, { recursive: true })
fs.writeFileSync(path.join(missingIdeaNew, 'final_thesis.md'), '# Newer thesis\n')
fs.writeFileSync(path.join(missingIdeaNew, 'decision_record.json'), JSON.stringify({ ticker: 'MISSINGIDEA', company_name: 'Newer Holdings' }))
const abandonedAt = new Date(NOW - 7 * 60 * 60_000)
fs.utimesSync(path.join(missingIdeaNew, 'final_thesis.md'), abandonedAt, abandonedAt)
fs.utimesSync(path.join(missingIdeaNew, 'decision_record.json'), abandonedAt, abandonedAt)
const incompleteShadows = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!incompleteShadows.qualified.some((x) => x.candidate.instrument.ticker === 'MISSINGIDEA'), 'a newer unsealed research result quarantines the older live call')
assert.ok(incompleteShadows.not_assessable.some((x) => x.ticker === 'MISSINGIDEA' && x.gaps.some((gap) => /publication did not finish/.test(gap))))
fs.writeFileSync(path.join(missingIdeaNew, 'idea_projection_manifest.json'), JSON.stringify({ schema_version: 'idea-projection-manifest/v1' }))
fs.utimesSync(path.join(missingIdeaNew, 'idea_projection_manifest.json'), abandonedAt, abandonedAt)
const markerOnly = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!markerOnly.qualified.some((x) => x.candidate.instrument.ticker === 'MISSINGIDEA'), 'a post-cutoff marker without admission never authorizes mutable candidate data')
assert.ok(markerOnly.not_assessable.some((x) => x.ticker === 'MISSINGIDEA' && x.gaps.some((gap) => /not available/.test(gap))))
fs.writeFileSync(path.join(missingIdeaNew, 'idea_admission.json'), '{bad')
const malformedAdmission = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!malformedAdmission.qualified.some((x) => x.candidate.instrument.ticker === 'MISSINGIDEA'))
assert.ok(malformedAdmission.not_assessable.some((x) => x.ticker === 'MISSINGIDEA' && x.gaps.some((gap) => /publication failed/.test(gap))))
fs.unlinkSync(path.join(missingIdeaNew, 'final_thesis.md'))
const damagedMarkerChain = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!damagedMarkerChain.qualified.some((x) => x.candidate.instrument.ticker === 'MISSINGIDEA'), 'a downstream marker still quarantines the old card when an earlier completion witness is deleted')
assert.ok(damagedMarkerChain.not_assessable.some((x) => x.ticker === 'MISSINGIDEA' && x.gaps.some((gap) => /downstream marker exists/.test(gap))))

writeRun('MISSINGIDEA_2026-08-04', { verify: true, createdAt: '2026-08-04T10:00:00Z' })
const recoveredPublication = buildQualifiedIdeasBoard(root, { nowMs: Date.parse('2026-08-04T12:00:00Z') })
assert.ok(recoveredPublication.qualified.some((x) => x.candidate.instrument.ticker === 'MISSINGIDEA'), 'a later sealed run clears the older publication gap')
assert.ok(!recoveredPublication.not_assessable.some((x) => x.ticker === 'MISSINGIDEA'), 'historical incomplete runs do not accumulate on the live board')
const incompleteBeforePending = recoveredPublication.health.incomplete_count

const pendingRun = path.join(root, 'analyses', 'PENDING_2026-08-04')
fs.mkdirSync(pendingRun, { recursive: true })
fs.writeFileSync(path.join(pendingRun, 'final_thesis.md'), '# Pending thesis\n')
fs.writeFileSync(path.join(pendingRun, 'decision_record.json'), JSON.stringify({ ticker: 'PENDING', company_name: 'Pending Holdings' }))
fs.writeFileSync(path.join(pendingRun, 'idea_3_6m.json'), JSON.stringify({
  schema_version: 'idea-assessment/v1', assessment_id: 'PENDING-2026-08-04-3-6m',
  run_root: 'analyses/PENDING_2026-08-04', created_at: '2026-08-04T11:00:00Z',
  ticker: 'PENDING', company: 'Pending Holdings', status: 'not_assessable',
  gaps: ['Pending post-audit projection manifest and canonical market evidence.'], candidate: null,
}))
const publicationPending = buildQualifiedIdeasBoard(root, { nowMs: Date.parse('2026-08-04T12:00:00Z') })
assert.equal(publicationPending.health.publishing_count, 1)
assert.ok(!publicationPending.not_assessable.some((x) => x.ticker === 'PENDING'))
assert.equal(publicationPending.health.incomplete_count, incompleteBeforePending, 'a normal in-flight publication inside the grace window is not called failed')

const publishingOnlyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-board-publishing-'))
const publishingOnlyRun = path.join(publishingOnlyRoot, 'analyses', 'PENDING_2026-08-04')
fs.mkdirSync(publishingOnlyRun, { recursive: true })
for (const name of ['final_thesis.md', 'decision_record.json', 'idea_3_6m.json']) {
  fs.copyFileSync(path.join(pendingRun, name), path.join(publishingOnlyRun, name))
}
const publishingOnly = buildQualifiedIdeasBoard(publishingOnlyRoot, { nowMs: Date.parse('2026-08-04T12:00:00Z') })
assert.equal(publishingOnly.health.outcome, 'publishing', 'an in-grace run is process state, not an investment rejection')
assert.equal(publishingOnly.health.not_assessable_count, 0)
fs.rmSync(publishingOnlyRoot, { recursive: true, force: true })

fs.writeFileSync(path.join(pendingRun, 'idea_3_6m.json'), '{')
const malformedPending = buildQualifiedIdeasBoard(root, { nowMs: Date.parse('2026-08-04T12:00:00Z') })
assert.equal(malformedPending.health.publishing_count, 0)
assert.ok(malformedPending.not_assessable.some((x) => x.ticker === 'PENDING'), 'a malformed preliminary write fails closed instead of exposing or reviving an idea')

fs.writeFileSync(path.join(pendingRun, 'idea_3_6m.json'), JSON.stringify({
  schema_version: 'idea-assessment/v1', assessment_id: 'PENDING-2026-08-04-3-6m',
  run_root: 'analyses/PENDING_2026-08-04', created_at: '2099-08-04T11:00:00Z',
  ticker: 'PENDING', company: 'Pending Holdings', status: 'not_assessable', gaps: ['Pending publication.'], candidate: null,
}))
const futurePublication = buildQualifiedIdeasBoard(root, { nowMs: Date.parse('2026-08-04T12:00:00Z') })
assert.equal(futurePublication.health.publishing_count, 0, 'a future producer clock can never hold grace open forever')
assert.ok(futurePublication.not_assessable.some((x) => x.ticker === 'PENDING' && x.gaps.some((gap) => /timestamp is in the future/.test(gap))))

writeRun('SCHEMAFAIL_2026-08-03', { verify: true })
const schemaFailPath = path.join(root, 'analyses', 'SCHEMAFAIL_2026-08-03', 'idea_3_6m.json')
const schemaFail = JSON.parse(fs.readFileSync(schemaFailPath, 'utf8'))
schemaFail.candidate.research.edge_score = 1_000
fs.writeFileSync(schemaFailPath, JSON.stringify(schemaFail))
const schemaFailBoard = buildQualifiedIdeasBoard(root, { nowMs: NOW })
assert.ok(!schemaFailBoard.qualified.some((x) => x.candidate.instrument.ticker === 'SCHEMAFAIL'), 'schema-invalid scores cannot qualify live')

fs.rmSync(root, { recursive: true, force: true })
console.log('\n1 qualified-ideas-store test file passed')
