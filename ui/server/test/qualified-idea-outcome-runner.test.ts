process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import {
  assessQualifiedIdeaOutcomeHealth,
  qualifiedIdeaOutcomeHealthPath,
  qualifiedIdeaOutcomePassLockPath,
  runQualifiedIdeaOutcomePass,
} from '../src/qualified-idea-outcome-runner'
import { qualifiedIdeaJsonSha256 } from '../src/qualified-ideas-store'
import type { QualifiedIdeaCandidate } from '../src/qualified-ideas'

const digest = (v: unknown) => qualifiedIdeaJsonSha256(v)
const fileDigest = (file: string) => createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const execFileAsync = promisify(execFile)
const sourceAppend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/append-ndjson.sh')
const sourceMarket = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/market_prices.py')
const sourceCanonicalJson = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/canonical_json.py')
const NOW = Date.parse('2026-08-04T12:00:00Z')
const PROVIDER = 'LicensedTest'
const DAY_MS = 86_400_000

function newRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qualified-outcome-runner-'))
  fs.mkdirSync(path.join(root, 'analyses'), { recursive: true })
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
  fs.copyFileSync(sourceAppend, path.join(root, 'scripts', 'append-ndjson.sh'))
  fs.chmodSync(path.join(root, 'scripts', 'append-ndjson.sh'), 0o755)
  fs.copyFileSync(sourceMarket, path.join(root, 'scripts', 'market_prices.py'))
  fs.copyFileSync(sourceCanonicalJson, path.join(root, 'scripts', 'canonical_json.py'))
  return root
}

function candidate(ticker = 'TEST'): QualifiedIdeaCandidate {
  const runRoot = `analyses/${ticker}_2026-01-01`
  const created = '2026-01-01T00:00:00Z'
  const c: QualifiedIdeaCandidate = {
    schema_version: 'qualified-idea/v1', policy_version: 'ideas-policy/precal-v1', idea_id: `QIDEA-${ticker}`,
    market_evidence_sha256: 'a'.repeat(64), projection_manifest_sha256: 'e'.repeat(64),
    run_root: runRoot, decision_date: '2026-01-01', created_at: created,
    instrument: { ticker, company: `${ticker} Holdings`, exchange: 'NYSE', currency: 'USD', direction: 'long', asset_type: 'equity' },
    horizon: { start: created, end: '2026-06-30T00:00:00Z' },
    quote: { price: 100, as_of: created, source: `${PROVIDER} market feed, 2026-01-01`, identity_verified: true, stale: false },
    liquidity: {
      verified: true, as_of: created, source: `${PROVIDER} market feed close × volume; USD listing`, lookback_days: 60, observed_sessions: 60,
      coverage_pct: 100, window_start: '2025-10-01T00:00:00Z', window_end: created,
      median_daily_value_usd: 20_000_000,
      currency_conversion: { pair: 'USD/USD', rate_usd_per_currency: 1, as_of: created, source: 'USD listing' },
    },
    market_risk: { as_of: created, source: `${PROVIDER} split-adjusted market feed`, lookback_days: 60, ordinary_move_pct: 8 },
    research: {
      decision: 'Buy', integrity_status: 'verified', data_sufficiency_score: 80, edge_score: 65,
      edge_proof: 'The filed KPI will exceed the frozen consensus baseline by a testable 12%.', hard_cap_active: false,
      hard_cap_reason: null, unresolved_red_flags: [], calibration_status: 'pre_data',
    },
    catalyst: {
      forecast_id: `FC-${ticker}`, name: 'Q1 filing', window_start: '2026-03-15T00:00:00Z', window_end: '2026-03-20T00:00:00Z',
      source: 'company calendar', status_at_admission: 'scheduled_unresolved', status_as_of: created,
      causal_steps: ['Company files the KPI result.', 'Consensus revises the KPI and target.'],
      bullish_trigger: 'KPI is at least 112 against consensus 100.', bearish_trigger: 'KPI is below consensus 100.',
    },
    falsifier: { condition: 'The edge is falsified when the filed KPI is below consensus 100.', metric: 'filed KPI', threshold: '< 100', deadline: '2026-03-20T00:00:00Z', source: 'Q1 filing' },
    valuation_bridge: { source_horizon_days: 180, method: 'same_horizon', convergence_fraction: null, rationale: 'Targets resolve inside this exact event holding window.', source: 'event model' },
    scenarios: [
      { scenario_id: 'bull', label: 'bull', probability_pct: 25, price_target: 140, source_price_target: 140, conditions: ['KPI exceeds 120'], source: 'frozen event model' },
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

function denseCsv(markers: Array<[string, string, number]>): string[] {
  const bySymbol = new Map<string, Array<[number, number]>>()
  for (const [date, symbol, close] of markers) {
    const rows = bySymbol.get(symbol) ?? []
    rows.push([Date.parse(`${date}T00:00:00Z`), close])
    bySymbol.set(symbol, rows)
  }
  const lines: string[] = []
  for (const [symbol, rows] of bySymbol) {
    rows.sort((a, b) => a[0] - b[0])
    const values = new Map(rows)
    let close = rows[0][1]
    for (let ms = rows[0][0]; ms <= rows.at(-1)![0]; ms += DAY_MS) {
      const day = new Date(ms).getUTCDay()
      if (day === 0 || day === 6) continue
      if (values.has(ms)) close = values.get(ms)!
      lines.push(`${new Date(ms).toISOString().slice(0, 10)},${symbol},${close}`)
    }
  }
  return lines.sort()
}

function writeAdmittedRun(root: string, c: QualifiedIdeaCandidate): void {
  const runDir = path.join(root, c.run_root)
  fs.mkdirSync(runDir, { recursive: true })
  fs.writeFileSync(path.join(runDir, 'final_thesis.md'), '# Thesis\n')
  const authorityScenarios = c.scenarios.map((row) => ({
    scenario_id: row.scenario_id, label: row.label, probability_pct: row.probability_pct,
    source_price_target: row.source_price_target, conditions: row.conditions, source: row.source,
    joint_probability_basis: row.joint_probability_basis ?? null,
  })).sort((a, b) => a.scenario_id < b.scenario_id ? -1 : a.scenario_id > b.scenario_id ? 1 : 0)
  const selectedForecast = {
    forecast_id: c.catalyst.forecast_id, prediction: c.catalyst.name, window_start: c.catalyst.window_start,
    window_end: c.catalyst.window_end, status_as_of: c.catalyst.status_as_of, source_citation: c.catalyst.source,
    metric: c.falsifier.metric, threshold: c.falsifier.threshold, confirmation_trigger: c.catalyst.bullish_trigger,
    falsification_trigger: c.falsifier.condition, stock_bullish_trigger: c.catalyst.bullish_trigger,
    stock_bearish_trigger: c.catalyst.bearish_trigger, causal_steps: c.catalyst.causal_steps,
  }
  const decisionRecord = {
    run_root: c.run_root, decision_date: c.decision_date, ticker: c.instrument.ticker, company_name: c.instrument.company,
    exchange: c.instrument.exchange, currency: c.instrument.currency, decision: c.research.decision,
    post_mortem_decision: c.research.decision, data_sufficiency_score: c.research.data_sufficiency_score,
    edge_score: c.research.edge_score, edge_proof: c.research.edge_proof, rating_cap: null,
    red_flags: [], confidence_inputs: { rating_cap_ceiling: null, critical_governance_unresolved: false },
    scenario_horizon_days: c.valuation_bridge.source_horizon_days, idea_valuation_bridge: c.valuation_bridge,
    scenarios: c.scenarios.map((row) => ({
      scenario_id: row.scenario_id, label: row.label, probability: row.probability_pct, return_pct: row.return_pct ?? null,
      price_target: row.source_price_target, conditions: row.conditions, source: row.source,
      joint_probability_basis: row.joint_probability_basis ?? null,
    })),
    forecast_ledger: [{ ...selectedForecast, status: 'open' }],
  }
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify(decisionRecord))

  const thesisSha = fileDigest(path.join(runDir, 'final_thesis.md'))
  const decisionSha = fileDigest(path.join(runDir, 'decision_record.json'))
  const auditIdentity = {
    schema_version: '1.0', ticker: c.instrument.ticker, run_root: c.run_root,
    final_thesis_path: `${c.run_root}/final_thesis.md`, decision_record_path: `${c.run_root}/decision_record.json`,
    final_thesis_sha256: thesisSha, decision_record_sha256: decisionSha,
  }
  const verification = {
    ...auditIdentity, verified_at: c.created_at, verifier: 'verify-evidence', verdict: 'Clean',
    integrity_score: 95, blocking_findings: [],
  }
  const preMortem = {
    ...auditIdentity, performed_at: c.created_at, auditor: 'pre-mortem', verdict: 'Survives', survives: true,
    original_confidence: 70, confidence_haircut: 5, recommended_confidence: 65, recommended_rating_cap: '',
  }
  const expectationsGap = {
    ...auditIdentity, performed_at: c.created_at, analyst: 'expectations-gap', variant_perception_quality: 'Strong',
    is_exploitable: true, edge_score: c.research.edge_score,
  }
  fs.writeFileSync(path.join(runDir, 'verification_report.json'), JSON.stringify(verification))
  fs.writeFileSync(path.join(runDir, 'pre_mortem.json'), JSON.stringify(preMortem))
  fs.writeFileSync(path.join(runDir, 'expectations_gap.json'), JSON.stringify(expectationsGap))

  const manifest: any = {
    schema_version: 'idea-projection-manifest/v1', run_root: c.run_root, created_at: c.created_at,
    artifacts: {
      final_thesis: { path: 'final_thesis.md', sha256: thesisSha },
      decision_record: { path: 'decision_record.json', sha256: decisionSha },
      verification: { path: 'verification_report.json', sha256: fileDigest(path.join(runDir, 'verification_report.json')) },
      pre_mortem: { path: 'pre_mortem.json', sha256: fileDigest(path.join(runDir, 'pre_mortem.json')) },
      expectations_gap: { path: 'expectations_gap.json', sha256: fileDigest(path.join(runDir, 'expectations_gap.json')) },
    },
  }
  manifest.manifest_sha256 = digest(manifest)
  fs.writeFileSync(path.join(runDir, 'idea_projection_manifest.json'), JSON.stringify(manifest))
  c.projection_manifest_sha256 = manifest.manifest_sha256

  const assessment = {
    schema_version: 'idea-assessment/v1', assessment_id: `ASSESS-${c.instrument.ticker}`, run_root: c.run_root,
    created_at: c.created_at, ticker: c.instrument.ticker, company: c.instrument.company, status: 'candidate', gaps: [], candidate: c,
  } as const
  fs.writeFileSync(path.join(runDir, 'idea_3_6m.json'), JSON.stringify(assessment))
  const authority = {
    run_root: c.run_root, decision_date: c.decision_date, ticker: c.instrument.ticker, company: c.instrument.company, exchange: c.instrument.exchange,
    currency: c.instrument.currency, decision: c.research.decision, data_sufficiency_score: c.research.data_sufficiency_score,
    edge_score: Math.min(decisionRecord.edge_score, expectationsGap.edge_score), edge_proof: c.research.edge_proof,
    hard_cap_required: false, rating_cap_reason: null, red_flags: c.research.unresolved_red_flags,
    scenario_horizon_days: c.valuation_bridge.source_horizon_days, scenarios: authorityScenarios,
    idea_valuation_bridge: c.valuation_bridge, selected_forecast: selectedForecast,
    post_audit: {
      pre_mortem: {
        verdict: preMortem.verdict, survives: preMortem.survives,
        recommended_confidence: preMortem.recommended_confidence, recommended_rating_cap: null,
      },
      expectations_gap: {
        variant_perception_quality: expectationsGap.variant_perception_quality,
        is_exploitable: expectationsGap.is_exploitable, edge_score: expectationsGap.edge_score,
      },
    },
  }
  const integrity = {
    status: 'verified', verification_verdict: verification.verdict,
    verification_report_sha256: fileDigest(path.join(runDir, 'verification_report.json')), final_thesis_sha256: thesisSha,
  }
  const admission: any = {
    schema_version: 'qualified-idea-admission/v1', admission_id: `${c.idea_id}|${digest(c).slice(0, 16)}`,
    status: 'admitted', run_root: c.run_root, frozen_at: c.created_at, candidate: c, candidate_sha256: digest(c),
    assessment, assessment_sha256: digest(assessment),
    decision_authority: authority, decision_authority_sha256: digest(authority), market_evidence_sha256: c.market_evidence_sha256,
    market_evidence: marketEvidence(c), projection_manifest_sha256: manifest.manifest_sha256,
    integrity_evidence: integrity, integrity_evidence_sha256: digest(integrity), gaps: [],
  }
  admission.admission_sha256 = digest(admission)
  fs.writeFileSync(path.join(runDir, 'idea_admission.json'), JSON.stringify(admission))
}

const root = newRoot()
const stateDir = path.join(root, 'ui', 'server', '.state')
const runPass = (nowMs = NOW) => runQualifiedIdeaOutcomePass(root, nowMs, stateDir)
try {
  assert.equal(qualifiedIdeaOutcomeHealthPath(root, stateDir), path.join(stateDir, 'qualified-idea-outcomes-health.json'))
  assert.equal(qualifiedIdeaOutcomePassLockPath(root, stateDir), path.join(fs.realpathSync(root), 'screener', 'ledger', '.qualified-idea-outcomes-pass.lock'))
  const empty = await runPass()
  assert.equal(empty.status, 'pre_data')
  assert.equal(empty.outcome, 'no_qualified_ideas')
  assert.equal(empty.terminal, true)
  assert.equal(empty.pass_sequence, 1)
  assert.equal(fs.existsSync(path.join(root, 'screener', 'ledger', 'qualified_idea_outcomes_health.json')), false, 'mutable health never enters the immutable ledger')
  assert.equal(assessQualifiedIdeaOutcomeHealth(empty, NOW).state, 'valid')
  assert.equal(assessQualifiedIdeaOutcomeHealth(empty, Date.parse(empty.expires_at) + 1).state, 'expired')
  const futureHealth = {
    ...empty,
    pass_started_at: new Date(NOW + 60_000).toISOString(),
    updated_at: new Date(NOW + 60_000).toISOString(),
    expires_at: new Date(NOW + 60_000 + 30 * 60_000).toISOString(),
  }
  assert.equal(assessQualifiedIdeaOutcomeHealth(futureHealth, NOW).state, 'invalid', 'future health cannot mask a stopped loop')
  assert.equal(assessQualifiedIdeaOutcomeHealth({ ...empty, status: 'healthy', outcome: 'failed' }, NOW).state, 'invalid')
  assert.equal(assessQualifiedIdeaOutcomeHealth({ ...empty, qualified_idea_count: 1 }, NOW).state, 'invalid')
  assert.equal(assessQualifiedIdeaOutcomeHealth({ ...empty, status: 'healthy', outcome: 'nothing_due', due_count: 1 }, NOW).state, 'invalid')
  assert.equal(assessQualifiedIdeaOutcomeHealth({ ...empty, status: 'healthy', outcome: 'resolved' }, NOW).state, 'invalid')

  const c = candidate()
  writeAdmittedRun(root, c)
  const providerDir = path.join(root, 'data', '_market', 'LicensedTest')
  fs.mkdirSync(providerDir, { recursive: true })
  fs.writeFileSync(path.join(providerDir, '_symbols.json'), JSON.stringify({
    TEST: { kind: 'equity', exchange: 'NYSE', currency: 'USD', price_basis: 'split_adjusted', security_status: 'active' },
    SPY: { kind: 'benchmark', exchange: 'INDEX', currency: 'USD', price_basis: 'split_adjusted', security_status: 'active' },
  }))
  fs.writeFileSync(path.join(providerDir, 'prices.csv'), ['date,symbol,close', '2026-01-01,TEST,100', '2026-01-01,SPY,200'].join('\n') + '\n')
  const pending = await runPass(Date.parse('2026-06-30T12:00:00Z'))
  assert.equal(pending.status, 'healthy', JSON.stringify(pending))
  assert.equal(pending.outcome, 'endpoint_pending')
  assert.equal(pending.due_count, 1)
  assert.equal(pending.admission_appended_count, 1)
  assert.equal(pending.endpoint_pending_count, 1)
  assert.equal(pending.unresolved_count, 0)
  assert.equal(assessQualifiedIdeaOutcomeHealth(pending, Date.parse(pending.updated_at)).state, 'valid')

  const replacementDir = path.join(root, 'data', '_market', 'ReplacementFeed')
  fs.renameSync(providerDir, replacementDir)
  const missing = await runPass()
  assert.equal(missing.status, 'degraded')
  assert.equal(missing.outcome, 'history_missing')
  assert.equal(missing.due_count, 1)
  assert.equal(missing.admission_count, 1)
  assert.equal(missing.admission_appended_count, 0)
  assert.equal(missing.admission_existing_count, 1)
  assert.equal(missing.provider_failures[0]?.code, 'history_not_found')
  assert.match(missing.provider_failures[0]?.reason ?? '', /lacks source-bound split-adjusted history/i,
    'a replacement provider cannot take over the provider identity frozen at admission')
  assert.equal(missing.pass_sequence, 3)

  fs.mkdirSync(providerDir, { recursive: true })
  fs.writeFileSync(path.join(providerDir, '_symbols.json'), JSON.stringify({
    TEST: { kind: 'equity', exchange: 'NYSE', currency: 'USD', price_basis: 'split_adjusted', security_status: 'active', benchmark: 'SPY', beta: 1.5 },
    SPY: { kind: 'benchmark', exchange: 'INDEX', currency: 'USD', price_basis: 'split_adjusted', security_status: 'active' },
  }))
  fs.writeFileSync(path.join(providerDir, 'prices.csv'), [
    'date,symbol,close',
    ...denseCsv([
      ['2026-01-01', 'TEST', 100], ['2026-02-02', 'TEST', 90], ['2026-04-01', 'TEST', 115],
      ['2026-06-30', 'TEST', 125], ['2026-08-03', 'TEST', 130],
      ['2026-01-01', 'SPY', 200], ['2026-06-30', 'SPY', 210], ['2026-08-03', 'SPY', 215],
    ]),
  ].join('\n') + '\n')

  // Two independent Node processes pointed at the same repository/state directory join one whole pass.
  // Slow the canonical provider in this isolated fixture so the process startup race is deterministic.
  const marketScript = path.join(root, 'scripts', 'market_prices.py')
  const slowTarget = path.join(root, 'scripts', 'market_prices-real.py')
  fs.renameSync(marketScript, slowTarget)
  fs.writeFileSync(marketScript, [
    'import runpy, time',
    'time.sleep(0.35)',
    `runpy.run_path(${JSON.stringify(slowTarget)}, run_name="__main__")`,
  ].join('\n') + '\n')
  const runnerUrl = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/qualified-idea-outcome-runner.ts')).href
  const childNow = Date.now()
  const childCode = [
    `import { runQualifiedIdeaOutcomePass } from ${JSON.stringify(runnerUrl)}`,
    `const health = await runQualifiedIdeaOutcomePass(${JSON.stringify(root)}, ${childNow}, ${JSON.stringify(stateDir)})`,
    'console.log(JSON.stringify(health))',
  ].join(';')
  const childPass = async () => {
    const { stdout } = await execFileAsync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', childCode], {
      cwd: path.dirname(fileURLToPath(import.meta.url)), timeout: 30_000,
      env: { ...process.env, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
    })
    return JSON.parse(stdout.trim().split('\n').at(-1) || '{}')
  }
  const [processA, processB] = await Promise.all([childPass(), childPass()])
  assert.equal(processA.pass_id, processB.pass_id, 'repository-scoped lock makes competing processes observe one pass')
  assert.equal(processA.appended_count, 1)
  assert.equal(processB.appended_count, 1)
  assert.ok(Date.parse(processA.updated_at) > Date.parse(processA.pass_started_at), 'health completion time is measured after the slow pass finishes')

  const [first, racing] = await Promise.all([
    runPass(),
    runPass(),
  ])
  assert.equal(first.existing_count, 1)
  assert.equal(racing.existing_count, 1)
  assert.equal(first.pass_id, racing.pass_id, 'same-process callers join one whole pass')
  assert.equal(first.pass_sequence, racing.pass_sequence, 'one whole pass allocates one health sequence')
  const ledgerFile = path.join(root, 'screener', 'ledger', 'qualified_idea_outcomes.ndjson')
  const rows = fs.readFileSync(ledgerFile, 'utf8').trim().split('\n')
  assert.equal(rows.length, 1)
  const outcome = JSON.parse(rows[0])
  assert.equal(outcome.benchmark_return_pct, 5)
  assert.equal(outcome.benchmark_beta, 1.5)
  assert.equal(outcome.excess_vs_benchmark_pct, 17.5)
  assert.equal(outcome.admission_sha256.length, 64)

  fs.rmSync(path.join(root, 'data'), { recursive: true, force: true })
  const existing = await runPass()
  assert.equal(existing.appended_count, 0)
  assert.equal(existing.existing_count, 1)
  assert.equal(existing.status, 'healthy', 'strict existing row is recognized before provider reload')

  fs.appendFileSync(ledgerFile, JSON.stringify({ schema_version: 'qualified-idea-outcome/v2', outcome_id: 'half-written' }) + '\n')
  const corrupt = await runPass()
  assert.equal(corrupt.status, 'degraded')
  assert.equal(corrupt.outcome, 'failed')
  assert.equal(corrupt.ledger_invalid_count, 1)
  assert.ok(corrupt.errors.some((x) => x.includes('malformed or unverifiable')))

  // A provider execution failure is distinct from an unavailable symbol, and even this unexpected path
  // produces a terminal expiring health record rather than leaving the last healthy snapshot in place.
  const c2 = candidate('FAIL')
  writeAdmittedRun(root, c2)
  fs.rmSync(path.join(root, 'scripts', 'market_prices.py'))
  const failedProvider = await runPass()
  assert.equal(failedProvider.status, 'error')
  assert.equal(failedProvider.outcome, 'provider_failed')
  assert.equal(failedProvider.terminal, true)
  assert.ok(failedProvider.provider_failures.some((x) => x.symbol === 'FAIL' && x.code === 'provider_execution_failed'))
  const persisted = JSON.parse(fs.readFileSync(qualifiedIdeaOutcomeHealthPath(root, stateDir), 'utf8'))
  assert.equal(persisted.pass_id, failedProvider.pass_id)
  assert.equal(assessQualifiedIdeaOutcomeHealth(persisted, NOW).state, 'valid')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('\n1 qualified-idea-outcome-runner test file passed')
