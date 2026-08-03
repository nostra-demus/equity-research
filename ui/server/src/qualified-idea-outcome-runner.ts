// Durable admission + exact-horizon settlement loop for qualified 3-6 month ideas.
//
// Admission snapshots and outcomes are append-only and lock-protected. Health is a monotonic,
// expiring terminal snapshot, so an old green file can never masquerade as a running system.

import fs from 'node:fs'
import path from 'node:path'
import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { promisify } from 'node:util'
import { listFrozenQualifiedIdeaEvaluations } from './qualified-ideas-store'
import {
  createQualifiedIdeaCohortEntry,
  readQualifiedIdeaCohortEntriesText,
  readQualifiedIdeaOutcomesText,
  resolveQualifiedIdeaOutcome,
  type MarketHistory,
} from './qualified-idea-outcomes'
import { parseRfc3339Ms } from './rfc3339'

const execFileAsync = promisify(execFile)
const DAY_MS = 86_400_000
const QUALIFIED_OUTCOME_HEALTH_MIN_TTL_MS = 30 * 60_000
/** Keep terminal health valid across at least one delayed scheduler pass, including slow deployments. */
export function qualifiedOutcomeHealthTtlMs(loopIntervalMs: number): number {
  const interval = Number.isFinite(loopIntervalMs) && loopIntervalMs > 0
    ? Math.min(loopIntervalMs, Math.floor(Number.MAX_SAFE_INTEGER / 2))
    : 0
  return Math.max(QUALIFIED_OUTCOME_HEALTH_MIN_TTL_MS, Math.ceil(interval * 2))
}
const configuredOutcomeLoopMin = Number(process.env.NEWS_POLL_INTERVAL_MIN)
export const QUALIFIED_OUTCOME_HEALTH_TTL_MS = qualifiedOutcomeHealthTtlMs(
  Math.max(60_000, (Number.isFinite(configuredOutcomeLoopMin) && configuredOutcomeLoopMin > 0 ? configuredOutcomeLoopMin : 5) * 60_000),
)
export const QUALIFIED_OUTCOME_HEALTH_FILE = 'qualified-idea-outcomes-health.json'
const QUALIFIED_OUTCOME_PASS_LOCK = '.qualified-idea-outcomes-pass.flock'

/** Mutable runtime health follows the engine-wide STATE_DIR convention, never the immutable ledger. */
export function qualifiedIdeaOutcomeStateDir(repoRoot: string): string {
  const configured = String(process.env.ENGINE_STATE_DIR || '').trim()
  return configured ? path.resolve(configured) : path.join(path.resolve(repoRoot), 'ui', 'server', '.state')
}

export function qualifiedIdeaOutcomeHealthPath(
  repoRoot: string,
  stateDir = qualifiedIdeaOutcomeStateDir(repoRoot),
): string {
  return path.join(path.resolve(stateDir), QUALIFIED_OUTCOME_HEALTH_FILE)
}

export function qualifiedIdeaOutcomePassLockPath(
  repoRoot: string,
  _stateDir = qualifiedIdeaOutcomeStateDir(repoRoot),
): string {
  let canonicalRepo = path.resolve(repoRoot)
  try { canonicalRepo = fs.realpathSync.native(canonicalRepo) } catch { /* path will be created by the pass */ }
  return path.join(canonicalRepo, 'screener', 'ledger', QUALIFIED_OUTCOME_PASS_LOCK)
}

export type MarketHistoryFailureCode =
  | 'history_not_found'
  | 'provider_timeout'
  | 'provider_execution_failed'
  | 'provider_output_invalid'
  | 'provider_contract_invalid'

export type MarketHistoryLoadResult =
  | { ok: true; history: MarketHistory }
  | { ok: false; code: MarketHistoryFailureCode; reason: string }

export interface QualifiedIdeaOutcomeProviderFailure {
  symbol: string
  role: 'security' | 'benchmark' | 'sector'
  code: MarketHistoryFailureCode
  reason: string
}

export interface QualifiedIdeaOutcomeHealth {
  schema_version: 'qualified-idea-outcomes-health/v2'
  pass_id: string
  pass_sequence: number
  pass_started_at: string
  status: 'pre_data' | 'healthy' | 'degraded' | 'error'
  outcome: 'no_qualified_ideas' | 'nothing_due' | 'endpoint_pending' | 'resolved' | 'history_missing' | 'admission_failed' | 'provider_failed' | 'failed'
  reason: string
  updated_at: string
  expires_at: string
  terminal: true
  qualified_idea_count: number
  admission_count: number
  admission_appended_count: number
  admission_existing_count: number
  admission_conflict_count: number
  due_count: number
  appended_count: number
  existing_count: number
  unresolved_count: number
  endpoint_pending_count: number
  not_due_count: number
  ledger_invalid_count: number
  ledger_conflict_count: number
  missing_history: string[]
  missing_comparators: string[]
  provider_failures: QualifiedIdeaOutcomeProviderFailure[]
  errors: string[]
}

export type QualifiedIdeaOutcomeHealthState =
  | { state: 'valid'; health: QualifiedIdeaOutcomeHealth }
  | { state: 'expired'; health: QualifiedIdeaOutcomeHealth }
  | { state: 'invalid'; health: null }

const nonBlank = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const parse = parseRfc3339Ms

export function assessQualifiedIdeaOutcomeHealth(v: unknown, nowMs = Date.now()): QualifiedIdeaOutcomeHealthState {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { state: 'invalid', health: null }
  const h = v as QualifiedIdeaOutcomeHealth
  const statuses = new Set(['pre_data', 'healthy', 'degraded', 'error'])
  const outcomes = new Set(['no_qualified_ideas', 'nothing_due', 'endpoint_pending', 'resolved', 'history_missing', 'admission_failed', 'provider_failed', 'failed'])
  const countKeys: Array<keyof QualifiedIdeaOutcomeHealth> = [
    'pass_sequence', 'qualified_idea_count', 'admission_count', 'admission_appended_count',
    'admission_existing_count', 'admission_conflict_count', 'due_count', 'appended_count',
    'existing_count', 'unresolved_count', 'endpoint_pending_count', 'not_due_count', 'ledger_invalid_count', 'ledger_conflict_count',
  ]
  const started = parse(h.pass_started_at)
  const updated = parse(h.updated_at)
  const expires = parse(h.expires_at)
  const providerFailuresValid = Array.isArray(h.provider_failures) && h.provider_failures.every((x) =>
    x && nonBlank(x.symbol) && ['security', 'benchmark', 'sector'].includes(x.role) &&
    ['history_not_found', 'provider_timeout', 'provider_execution_failed', 'provider_output_invalid', 'provider_contract_invalid'].includes(x.code) && nonBlank(x.reason))
  const passNumber = Number(String(h.pass_id ?? '').match(/^QOHP-(\d{12})-/)?.[1])
  const statusOutcomeValid =
    (h.status === 'pre_data' && h.outcome === 'no_qualified_ideas') ||
    (h.status === 'healthy' && ['nothing_due', 'endpoint_pending', 'resolved'].includes(h.outcome)) ||
    (h.status === 'degraded' && ['history_missing', 'admission_failed', 'resolved', 'failed'].includes(h.outcome)) ||
    (h.status === 'error' && ['provider_failed', 'failed'].includes(h.outcome))
  const outcomeCountsValid =
    h.due_count === h.appended_count + h.existing_count + h.unresolved_count + h.endpoint_pending_count &&
    (h.outcome !== 'no_qualified_ideas' || (h.qualified_idea_count === 0 && h.admission_count === 0 && h.due_count === 0 && h.appended_count === 0 && h.existing_count === 0 && h.endpoint_pending_count === 0)) &&
    (h.outcome !== 'nothing_due' || (h.due_count === 0 && h.appended_count === 0 && h.existing_count === 0 && h.endpoint_pending_count === 0)) &&
    (h.outcome !== 'endpoint_pending' || (h.endpoint_pending_count > 0 && h.due_count === h.endpoint_pending_count && h.appended_count === 0 && h.existing_count === 0 && h.unresolved_count === 0)) &&
    (h.outcome !== 'resolved' || h.appended_count + h.existing_count > 0) &&
    (h.outcome !== 'history_missing' || h.unresolved_count > 0) &&
    (h.outcome !== 'provider_failed' || h.provider_failures.some((x) => x.role === 'security' && x.code !== 'history_not_found'))
  if (
    h.schema_version !== 'qualified-idea-outcomes-health/v2' || !/^QOHP-\d{12}-[a-f0-9]{12}$/.test(String(h.pass_id ?? '')) ||
    !statuses.has(h.status) || !outcomes.has(h.outcome) || !nonBlank(h.reason) || h.terminal !== true ||
    !finite(started) || !finite(updated) || !finite(expires) || started > updated || updated > nowMs || started > nowMs ||
    expires <= updated || expires !== updated + QUALIFIED_OUTCOME_HEALTH_TTL_MS || passNumber !== h.pass_sequence ||
    !statusOutcomeValid || !outcomeCountsValid ||
    !countKeys.every((key) => Number.isInteger(h[key]) && (h[key] as number) >= 0) ||
    !['missing_history', 'missing_comparators', 'errors'].every((key) => Array.isArray((h as any)[key]) && (h as any)[key].every(nonBlank)) ||
    !providerFailuresValid
  ) return { state: 'invalid', health: null }
  return { state: nowMs > expires ? 'expired' : 'valid', health: h }
}

export async function loadAdjustedMarketHistory(
  repoRoot: string,
  ticker: string,
  identity: { exchange?: string; currency?: string; provider?: string; role?: 'security' | 'benchmark' | 'sector' } = {},
): Promise<MarketHistoryLoadResult> {
  try {
    const args = [path.join(repoRoot, 'scripts', 'market_prices.py'), '--history', ticker]
    if (identity.exchange) args.push('--exchange', identity.exchange)
    if (identity.currency) args.push('--currency', identity.currency)
    if (identity.provider) args.push('--provider', identity.provider)
    if (identity.role) args.push('--role', identity.role)
    const { stdout } = await execFileAsync('python3', args, {
      cwd: repoRoot, timeout: 15_000, maxBuffer: 32_000_000,
    })
    let raw: unknown
    try { raw = JSON.parse(stdout) } catch {
      return { ok: false, code: 'provider_output_invalid', reason: 'Canonical market provider returned non-JSON history.' }
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || (raw as any).schema_version !== 'market-history/v1') {
      return { ok: false, code: 'provider_contract_invalid', reason: 'Canonical market provider did not return market-history/v1.' }
    }
    return { ok: true, history: raw as MarketHistory }
  } catch (err: any) {
    const stdout = String(err?.stdout || '')
    if (Number(err?.code) === 3 || /no source-bound split-adjusted history/i.test(stdout)) {
      return { ok: false, code: 'history_not_found', reason: 'Canonical market feed lacks source-bound split-adjusted history.' }
    }
    if (err?.killed || err?.signal === 'SIGTERM' || err?.code === 'ETIMEDOUT') {
      return { ok: false, code: 'provider_timeout', reason: 'Canonical market history provider timed out.' }
    }
    return { ok: false, code: 'provider_execution_failed', reason: `Canonical market history provider failed: ${String(err?.message || err).slice(0, 180)}` }
  }
}

function readText(file: string): string {
  try { return fs.readFileSync(file, 'utf8') } catch { return '' }
}

async function appendSnapshot(
  repoRoot: string,
  file: string,
  row: unknown,
  key: string,
  value: string,
): Promise<'appended' | 'duplicate'> {
  const { stdout } = await execFileAsync('bash', [
    path.join(repoRoot, 'scripts', 'append-ndjson.sh'), file, JSON.stringify(row), key, value,
  ], { cwd: repoRoot, timeout: 20_000 })
  if (/^APPENDED=1\s*$/m.test(stdout)) return 'appended'
  if (/^DUPLICATE=1\s*$/m.test(stdout)) return 'duplicate'
  throw new Error(`append helper returned no disposition: ${stdout.trim().slice(0, 160)}`)
}

type HealthDraft = Omit<QualifiedIdeaOutcomeHealth, 'pass_id' | 'pass_sequence' | 'updated_at' | 'expires_at'>

/** Health can be shared by independently checked-out repository roots, so it has its own kernel lock.
 * Sequence allocation and the atomic temp-file rename both happen while that descriptor is held. */
async function writeTerminalHealth(file: string, draft: HealthDraft, nowMs: number): Promise<QualifiedIdeaOutcomeHealth> {
  const lease = await acquireFlockLease(
    `${file}.flock`,
    OUTCOME_HEALTH_LOCK_WAIT_MS,
    'timed out waiting to publish qualified-idea outcome health',
  )
  try {
    let priorSequence = 0
    try {
      const prior = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (Number.isInteger(prior?.pass_sequence) && prior.pass_sequence >= 0) priorSequence = prior.pass_sequence
    } catch { /* first pass or invalid old state */ }
    const sequence = priorSequence + 1
    const updatedAt = new Date(nowMs).toISOString()
    const passId = `QOHP-${String(sequence).padStart(12, '0')}-${createHash('sha256')
      .update(`${sequence}|${draft.pass_started_at}|${updatedAt}|${process.pid}`).digest('hex').slice(0, 12)}`
    const health: QualifiedIdeaOutcomeHealth = {
      ...draft,
      pass_id: passId,
      pass_sequence: sequence,
      updated_at: updatedAt,
      expires_at: new Date(nowMs + QUALIFIED_OUTCOME_HEALTH_TTL_MS).toISOString(),
    }
    const tmp = `${file}.tmp.${process.pid}.${sequence}.${Math.random().toString(16).slice(2)}`
    try {
      fs.writeFileSync(tmp, JSON.stringify(health, null, 2) + '\n')
      fs.renameSync(tmp, file)
    } finally {
      try { fs.rmSync(tmp, { force: true }) } catch { /* best effort */ }
    }
    return health
  } finally {
    lease.release()
  }
}

function providerFailure(
  target: QualifiedIdeaOutcomeProviderFailure[],
  symbol: string,
  role: QualifiedIdeaOutcomeProviderFailure['role'],
  failure: Extract<MarketHistoryLoadResult, { ok: false }>,
): void {
  if (!target.some((x) => x.symbol === symbol && x.role === role && x.code === failure.code)) {
    target.push({ symbol, role, code: failure.code, reason: failure.reason })
  }
}

async function executeOutcomePass(repoRoot: string, nowMs: number, passStartedMs: number): Promise<HealthDraft> {
  const ledgerDir = path.join(repoRoot, 'screener', 'ledger')
  const admissionsFile = path.join(ledgerDir, 'qualified_idea_cohort_entries.ndjson')
  const outcomesFile = path.join(ledgerDir, 'qualified_idea_outcomes.ndjson')
  const passStartedAt = new Date(passStartedMs).toISOString()
  const evaluations = listFrozenQualifiedIdeaEvaluations(repoRoot)
  let admissions = readQualifiedIdeaCohortEntriesText(readText(admissionsFile), nowMs)
  const errors: string[] = []
  let admissionAppended = 0
  let admissionExisting = 0

  const admissionByCohort = new Map(admissions.rows.map((row) => [row.cohort_key, row]))
  for (const evaluation of evaluations) {
    const snapshot = createQualifiedIdeaCohortEntry(evaluation, nowMs)
    const c = evaluation.candidate
    const provisionalCohort = [c.policy_version, c.idea_id, c.run_root, new Date(parse(c.horizon.end)).toISOString()].join('|')
    const prior = admissionByCohort.get(provisionalCohort)
    if (prior) {
      admissionExisting++
      if (snapshot && prior.admission_sha256 !== snapshot.admission_sha256) {
        errors.push(`${c.idea_id}: admission_snapshot_changed_after_freeze`)
      }
      continue
    }
    if (!snapshot) {
      errors.push(`${c.idea_id}: admission_capture_window_missed`)
      continue
    }
    try {
      const disposition = await appendSnapshot(repoRoot, admissionsFile, snapshot, 'cohort_key', snapshot.cohort_key)
      if (disposition === 'appended') admissionAppended++
      else admissionExisting++
    } catch (err: any) {
      errors.push(`${c.idea_id}: admission_append_failed (${String(err?.message || err).slice(0, 160)})`)
    }
  }

  // Re-read after locked appends so racing passes settle from the one snapshot that actually won.
  admissions = readQualifiedIdeaCohortEntriesText(readText(admissionsFile), nowMs)
  const outcomes = readQualifiedIdeaOutcomesText(readText(outcomesFile), nowMs)
  const existingByCohort = new Map(outcomes.rows.map((row) => [row.cohort_key, row]))
  const existingIds = new Set(outcomes.rows.map((row) => row.outcome_id))
  const historyCache = new Map<string, Promise<MarketHistoryLoadResult>>()
  const load = (ticker: string, identity: { exchange?: string; currency?: string; provider?: string; role?: 'security' | 'benchmark' | 'sector' } = {}): Promise<MarketHistoryLoadResult> => {
    const key = `${ticker.trim().toUpperCase()}|${identity.exchange?.trim().toUpperCase() || ''}|${identity.currency?.trim().toUpperCase() || ''}|${identity.provider || ''}|${identity.role || ''}`
    let pending = historyCache.get(key)
    if (!pending) { pending = loadAdjustedMarketHistory(repoRoot, ticker, identity); historyCache.set(key, pending) }
    return pending
  }
  const missingHistory = new Set<string>()
  const missingComparators = new Set<string>()
  const providerFailures: QualifiedIdeaOutcomeProviderFailure[] = []
  let due = 0
  let appended = 0
  let existingCount = 0
  let unresolved = 0
  let notDue = 0
  let endpointPending = 0

  if (admissions.invalid_count) errors.push(`admission_ledger: ${admissions.invalid_count} malformed row${admissions.invalid_count === 1 ? '' : 's'}`)
  if (admissions.conflicting_count) errors.push(`admission_ledger: ${admissions.conflicting_count} conflicting cohort duplicate${admissions.conflicting_count === 1 ? '' : 's'}`)
  if (outcomes.invalid_count) errors.push(`outcome_ledger: ${outcomes.invalid_count} malformed or unverifiable row${outcomes.invalid_count === 1 ? '' : 's'}`)
  if (outcomes.conflicting_count) errors.push(`outcome_ledger: ${outcomes.conflicting_count} conflicting duplicate${outcomes.conflicting_count === 1 ? '' : 's'} quarantined`)

  for (const admission of admissions.rows) {
    const c = admission.candidate
    const dueMs = parse(c.horizon.end)
    if (nowMs < dueMs) { notDue++; continue }
    due++
    if (existingByCohort.has(admission.cohort_key)) { existingCount++; continue }
    if (outcomes.quarantined_cohort_keys.includes(admission.cohort_key)) {
      unresolved++
      errors.push(`${c.idea_id}: outcome_cohort_quarantined`)
      continue
    }
    const historyResult = await load(c.instrument.ticker, {
      exchange: c.instrument.exchange,
      currency: c.instrument.currency,
      provider: admission.admitted_provider,
      role: 'security',
    })
    if (!historyResult.ok) {
      providerFailure(providerFailures, c.instrument.ticker, 'security', historyResult)
      if (historyResult.code === 'history_not_found') missingHistory.add(`${c.instrument.exchange}:${c.instrument.ticker}`)
      unresolved++
      continue
    }
    const history = historyResult.history
    let benchmarkHistory: MarketHistory | undefined
    let sectorHistory: MarketHistory | undefined
    if (history.comparators?.benchmark) {
      const loaded = await load(history.comparators.benchmark, {
        currency: c.instrument.currency, provider: admission.admitted_provider, role: 'benchmark',
      })
      if (loaded.ok) benchmarkHistory = loaded.history
      else {
        providerFailure(providerFailures, history.comparators.benchmark, 'benchmark', loaded)
        missingComparators.add(`benchmark:${history.comparators.benchmark}`)
      }
    }
    if (history.comparators?.sector) {
      const loaded = await load(history.comparators.sector, {
        currency: c.instrument.currency, provider: admission.admitted_provider, role: 'sector',
      })
      if (loaded.ok) sectorHistory = loaded.history
      else {
        providerFailure(providerFailures, history.comparators.sector, 'sector', loaded)
        missingComparators.add(`sector:${history.comparators.sector}`)
      }
    }
    const result = resolveQualifiedIdeaOutcome(admission, history, { nowMs, benchmarkHistory, sectorHistory })
    if (result.status !== 'resolved') {
      if (result.status === 'not_due' && result.reason_code === 'endpoint_pending') { endpointPending++; continue }
      if (result.status === 'not_due') { due--; notDue++; continue }
      unresolved++
      errors.push(`${c.idea_id}: ${result.reason_code}`)
      if (['history_unverified', 'history_provenance_invalid', 'history_identity_mismatch', 'history_provider_mismatch', 'history_role_mismatch', 'history_coverage_incomplete', 'delisting_terminal_value_missing'].includes(result.reason_code)) {
        providerFailure(providerFailures, c.instrument.ticker, 'security', {
          ok: false, code: 'provider_contract_invalid', reason: result.reason,
        })
      } else if (['end_price_missing', 'forecast_price_missing', 'entry_price_missing'].includes(result.reason_code)) {
        missingHistory.add(`${c.instrument.exchange}:${c.instrument.ticker} — ${result.reason_code}`)
      } else if (result.reason_code === 'outcome_invariant_failed') {
        errors.push(`system: ${c.idea_id} derived outcome invariant failed`)
      }
      continue
    }
    if (history.comparators?.benchmark && result.outcome.benchmark_return_pct === null) {
      missingComparators.add(`benchmark:${history.comparators.benchmark}`)
      if (benchmarkHistory) providerFailure(providerFailures, history.comparators.benchmark, 'benchmark', {
        ok: false, code: 'provider_contract_invalid', reason: 'Benchmark history failed strict identity, currency, as-of, or point-provenance checks.',
      })
    }
    if (history.comparators?.sector && result.outcome.sector_return_pct === null) {
      missingComparators.add(`sector:${history.comparators.sector}`)
      if (sectorHistory) providerFailure(providerFailures, history.comparators.sector, 'sector', {
        ok: false, code: 'provider_contract_invalid', reason: 'Sector history failed strict identity, currency, as-of, or point-provenance checks.',
      })
    }
    if (existingIds.has(result.outcome.outcome_id)) { existingCount++; continue }
    try {
      const disposition = await appendSnapshot(repoRoot, outcomesFile, result.outcome, 'outcome_id', result.outcome.outcome_id)
      existingIds.add(result.outcome.outcome_id)
      existingByCohort.set(admission.cohort_key, result.outcome)
      if (disposition === 'appended') appended++
      else existingCount++
    } catch (err: any) {
      unresolved++
      errors.push(`${c.idea_id}: outcome_append_failed (${String(err?.message || err).slice(0, 160)})`)
    }
  }

  const providerSystemFailure = providerFailures.some((x) => x.role === 'security' && x.code !== 'history_not_found')
  const appendFailure = errors.some((x) => x.includes('_append_failed'))
  const ledgerConflict = admissions.conflicting_count > 0 || outcomes.conflicting_count > 0
  const systemFailure = errors.some((x) => x.startsWith('system:'))
  const missedAdmission = errors.some((x) => x.includes('admission_capture_window_missed'))
  let status: QualifiedIdeaOutcomeHealth['status'] = 'healthy'
  let outcome: QualifiedIdeaOutcomeHealth['outcome'] = 'nothing_due'
  let reason = 'No admitted qualified-idea horizon is due yet.'
  if (appendFailure || ledgerConflict || systemFailure) {
    status = 'error'; outcome = 'failed'
    reason = ledgerConflict
      ? 'Conflicting immutable ledger rows were quarantined; settlement cannot trust those cohorts.'
      : systemFailure ? 'A derived outcome failed a non-negotiable system invariant.' : 'At least one immutable admission or outcome could not be persisted.'
  } else if (providerSystemFailure) {
    status = 'error'; outcome = 'provider_failed'; reason = 'The canonical market-history provider failed or violated its output contract.'
  } else if (admissions.invalid_count || outcomes.invalid_count) {
    status = 'degraded'; outcome = 'failed'; reason = 'Malformed or unverifiable immutable ledger rows were excluded; the remaining valid rows were not allowed to hide the integrity failure.'
  } else if (!evaluations.length && !admissions.rows.length) {
    status = 'pre_data'; outcome = 'no_qualified_ideas'; reason = 'No immutable qualified-idea admissions exist yet.'
  } else if (missedAdmission && !admissions.rows.length) {
    status = 'degraded'; outcome = 'admission_failed'; reason = 'A candidate was first observed after its immutable admission window and was not retroactively added to the cohort.'
  } else if (missingHistory.size || unresolved > 0) {
    status = 'degraded'; outcome = 'history_missing'; reason = `${unresolved} due outcome${unresolved === 1 ? '' : 's'} could not resolve from admissible point-in-time history.`
  } else if (appended || existingCount) {
    status = missingComparators.size || admissions.invalid_count || outcomes.invalid_count || errors.length ? 'degraded' : 'healthy'
    outcome = 'resolved'
    reason = `${appended} new outcome${appended === 1 ? '' : 's'} appended; ${existingCount} already recorded.` +
      (missingComparators.size ? ` ${missingComparators.size} comparator series missing.` : '') +
      (endpointPending ? ` ${endpointPending} ended horizon${endpointPending === 1 ? '' : 's'} still await${endpointPending === 1 ? 's' : ''} an eligible exit observation.` : '')
  } else if (endpointPending > 0) {
    status = 'healthy'; outcome = 'endpoint_pending'
    reason = `${endpointPending} ended horizon${endpointPending === 1 ? '' : 's'} await${endpointPending === 1 ? 's' : ''} an eligible exit observation.`
  } else if (errors.length) {
    status = 'degraded'; outcome = 'failed'; reason = 'Malformed or changed immutable records were excluded from settlement.'
  }

  return {
    schema_version: 'qualified-idea-outcomes-health/v2',
    pass_started_at: passStartedAt,
    status, outcome, reason, terminal: true,
    qualified_idea_count: evaluations.length,
    admission_count: admissions.rows.length,
    admission_appended_count: admissionAppended,
    admission_existing_count: admissionExisting,
    admission_conflict_count: admissions.conflicting_count,
    due_count: due,
    appended_count: appended,
    existing_count: existingCount,
    unresolved_count: unresolved,
    endpoint_pending_count: endpointPending,
    not_due_count: notDue,
    ledger_invalid_count: admissions.invalid_count + outcomes.invalid_count,
    ledger_conflict_count: admissions.conflicting_count + outcomes.conflicting_count,
    missing_history: [...missingHistory].sort(),
    missing_comparators: [...missingComparators].sort(),
    provider_failures: providerFailures.sort((a, b) => `${a.role}:${a.symbol}:${a.code}`.localeCompare(`${b.role}:${b.symbol}:${b.code}`)),
    errors: errors.slice(0, 50),
  }
}

interface OutcomePassLease { release: () => void }
type OutcomePassClaim = { kind: 'owned'; lease: OutcomePassLease } | { kind: 'observed'; health: QualifiedIdeaOutcomeHealth }
const activeOutcomePasses = new Map<string, Promise<QualifiedIdeaOutcomeHealth>>()
const OUTCOME_PASS_LOCK_WAIT_MS = 30 * 60_000
const OUTCOME_HEALTH_LOCK_WAIT_MS = 30_000
const OUTCOME_PASS_LOCK_POLL_MS = 50
const FLOCK_LEASE_PROGRAM = [
  'import fcntl, sys, time',
  'wait_ms, poll_ms = int(sys.argv[1]), int(sys.argv[2])',
  'deadline = time.monotonic() + wait_ms / 1000',
  'while True:',
  ' try:',
  '  fcntl.flock(3, fcntl.LOCK_EX | fcntl.LOCK_NB)',
  '  break',
  ' except BlockingIOError:',
  '  if time.monotonic() >= deadline:',
  '   print("TIMEOUT", flush=True)',
  '   raise SystemExit(3)',
  '  time.sleep(poll_ms / 1000)',
  'print("LOCKED", flush=True)',
].join('\n')

function readPersistedHealth(file: string, nowMs: number): QualifiedIdeaOutcomeHealth | null {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    const assessed = assessQualifiedIdeaOutcomeHealth(raw, nowMs)
    return assessed.state === 'valid' ? assessed.health : null
  } catch { return null }
}

/** Python performs the portable flock syscall on fd 3 and exits. Node retains the same open-file
 * description, so lock ownership cannot disappear with a helper process; closing this fd is release. */
async function acquireFlockLease(lock: string, waitMs: number, timeoutMessage: string): Promise<OutcomePassLease> {
  fs.mkdirSync(path.dirname(lock), { recursive: true })
  const fd = fs.openSync(lock, 'a+')
  let child: ReturnType<typeof spawn>
  try {
    child = spawn('python3', [
      '-c', FLOCK_LEASE_PROGRAM, String(waitMs), String(OUTCOME_PASS_LOCK_POLL_MS),
    ], { stdio: ['ignore', 'pipe', 'pipe', fd] })
  } catch (err) {
    fs.closeSync(fd)
    throw err
  }
  child.stdout!.setEncoding('utf8')
  child.stderr!.setEncoding('utf8')
  let stdout = ''
  let stderr = ''
  let watchdogExpired = false
  child.stderr!.on('data', (chunk) => { stderr += String(chunk) })
  child.stdout!.on('data', (chunk) => { stdout += String(chunk) })
  try {
    await new Promise<void>((resolve, reject) => {
      const watchdog = setTimeout(() => {
        watchdogExpired = true
        child.kill('SIGKILL')
      }, waitMs + 5_000)
      watchdog.unref()
      child.once('error', (err) => {
        clearTimeout(watchdog)
        reject(err)
      })
      child.once('close', (code, signal) => {
        clearTimeout(watchdog)
        const timedOut = watchdogExpired || code === 3 || /TIMEOUT/.test(stdout)
        if (code === 0 && /(?:^|\n)LOCKED(?:\n|$)/.test(stdout)) resolve()
        else reject(new Error(timedOut
          ? timeoutMessage
          : `flock acquisition helper failed${signal ? ` (${signal})` : ''}${stderr.trim() ? `: ${stderr.trim().slice(0, 200)}` : ''}`))
      })
    })
  } catch (err) {
    try { fs.closeSync(fd) } catch { /* already closed */ }
    throw err
  }

  let released = false
  return {
    release: () => {
      if (released) return
      released = true
      fs.closeSync(fd)
    },
  }
}

async function claimOutcomePass(
  lock: string,
  healthFile: string,
  nowMs: number,
): Promise<OutcomePassClaim> {
  fs.mkdirSync(path.dirname(lock), { recursive: true })
  const priorPassId = readPersistedHealth(healthFile, nowMs)?.pass_id ?? null
  const lease = await acquireFlockLease(
    lock,
    OUTCOME_PASS_LOCK_WAIT_MS,
    'timed out waiting for the repository-scoped qualified-idea outcome pass',
  )
  const completed = readPersistedHealth(healthFile, Math.max(nowMs, Date.now()))
  if (completed && completed.pass_id !== priorPassId) {
    lease.release()
    return { kind: 'observed', health: completed }
  }
  return { kind: 'owned', lease }
}

async function runOwnedQualifiedIdeaOutcomePass(
  repoRoot: string,
  effectiveNow: number,
  stateDir: string,
): Promise<QualifiedIdeaOutcomeHealth> {
  const healthFile = qualifiedIdeaOutcomeHealthPath(repoRoot, stateDir)
  const lock = qualifiedIdeaOutcomePassLockPath(repoRoot, stateDir)
  const claim = await claimOutcomePass(lock, healthFile, Math.max(effectiveNow, Date.now()))
  if (claim.kind === 'observed') return claim.health
  const passStartedMs = Math.max(effectiveNow, Date.now())
  try {
    const draft = await executeOutcomePass(repoRoot, effectiveNow, passStartedMs)
    return await writeTerminalHealth(healthFile, draft, Math.max(passStartedMs, Date.now()))
  } catch (err: any) {
    const message = String(err?.message || err).slice(0, 500)
    const failed: HealthDraft = {
      schema_version: 'qualified-idea-outcomes-health/v2',
      pass_started_at: new Date(passStartedMs).toISOString(),
      status: 'error', outcome: 'failed', reason: 'The outcome pass ended with an unhandled system error.', terminal: true,
      qualified_idea_count: 0, admission_count: 0, admission_appended_count: 0, admission_existing_count: 0,
      admission_conflict_count: 0, due_count: 0, appended_count: 0, existing_count: 0,
      unresolved_count: 0, endpoint_pending_count: 0, not_due_count: 0, ledger_invalid_count: 0, ledger_conflict_count: 0,
      missing_history: [], missing_comparators: [], provider_failures: [], errors: [`system: ${message}`],
    }
    return await writeTerminalHealth(healthFile, failed, Math.max(passStartedMs, Date.now()))
  } finally {
    claim.lease.release()
  }
}

/** One whole settlement pass per repository/state directory, across both callers and processes. */
export function runQualifiedIdeaOutcomePass(
  repoRoot: string,
  nowMs = Date.now(),
  stateDir = qualifiedIdeaOutcomeStateDir(repoRoot),
): Promise<QualifiedIdeaOutcomeHealth> {
  const effectiveNow = finite(nowMs) ? nowMs : Date.now()
  const key = `${qualifiedIdeaOutcomePassLockPath(repoRoot, stateDir)}\0${path.resolve(stateDir)}`
  const active = activeOutcomePasses.get(key)
  if (active) return active
  const pending = runOwnedQualifiedIdeaOutcomePass(repoRoot, effectiveNow, stateDir)
  activeOutcomePasses.set(key, pending)
  const clear = () => { if (activeOutcomePasses.get(key) === pending) activeOutcomePasses.delete(key) }
  pending.then(clear, clear)
  return pending
}
