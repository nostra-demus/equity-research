// Shadow-only second-look runner. It executes after the normal Ideas pass, spends a clock-paced maximum
// of identity checks, and never reads an article or creates an idea. Live work is a later rollout stage.

import fs from 'node:fs'
import path from 'node:path'
import { dailyQuotaAdmission } from '../triage/budget'
import { countryFromExchange } from '../equity-quote'
import {
  cleanTicker, companyNameMatches, coreCompanyName, directoryTickerMatches, normTicker,
  searchSymbolsChecked, type FetchLike,
} from '../symbology'
import { RESCUE_SELECTOR_VERSION, selectRescueCandidates, type RescueCandidate } from './selector'
import {
  completeRescueCheck, loadRecentRescueChecks, loadRescueDay, loadRescueQueue, noteDirectoryResult,
  readRescueHealth, readRescueMode, reconcileRescueDayLedgers, repairRescueReservationAuthority,
  RESCUE_DIAGNOSTICS_WRITE_ERROR, RESCUE_RESERVATION_WRITE_ERROR, rescueAuditCanAccept, rescueCheckMatchesCandidate,
  rescueFeedCheckpointMatches, reserveRescueCheck, updateRescueHealth,
  type RescueCheckRecord, type RescueFeedCheckpointSnapshot, type RescueIdentityStatus,
} from './store'

export interface RescueShadowConfig {
  mode: 'off' | 'shadow'
  maxAgeHrs: number
  dailyChecks: number
  perCycle: number
  nameDailyCap: number
  paceFloorFraction: number
  auditMaxBytes: number
}

export interface RescueDiagnostics {
  mode: 'off' | 'shadow'
  selectorVersion: string
  status: 'disabled' | 'warming' | 'ready' | 'paused_core_work' | 'directory_paused' | 'audit_unavailable'
  reason: string
  candidatesFound: number | null
  primaryCandidates: number | null
  nameCandidates: number | null
  identityChecks: number | null
  checksReleased: number | null
  verified: number | null
  identityUnresolved: number | null
  directoryUnavailable: number | null
  articleReads: number
  ideasCreated: number
  capacityMisses: number | null
  queuedForLater: number | null
  retryCooling: number | null
  retryExhausted: number | null
  auditHealthy: boolean
  circuitOpenUntil: string | null
  dailyCap: number
  reconciliation: ReturnType<typeof selectRescueCandidates>['reconciled'] | null
}

export interface RescueShadowResult extends RescueDiagnostics {
  checkedThisCycle: number
}

const emptyReconciliation = (): RescueDiagnostics['reconciliation'] => ({
  total: 0, inboxed: 0, outside_score: 0, social: 0, routine_filing: 0,
  duplicate: 0, manually_blocked: 0, no_identity: 0, no_signal: 0, candidates: 0,
})

const RESCUE_AUDIT_PREFLIGHT_ERROR = 'The detailed second-look record is full or cannot accept another result.'

function utcDate(now: number): string { return new Date(now).toISOString().slice(0, 10) }

const diagnosticsFile = (stateDir: string): string => path.join(stateDir, 'news-rescue', 'diagnostics.json')
const runtimeDiagnosticsFailures = new Set<string>()
const runtimeNormalIdeasPauses = new Map<string, string>()
const diagnosticsRuntimeKey = (stateDir: string): string => path.resolve(stateDir)

export function setRescueNormalIdeasRuntimePause(stateDir: string, reason: string | null): void {
  const key = diagnosticsRuntimeKey(stateDir)
  if (reason) runtimeNormalIdeasPauses.set(key, reason)
  else runtimeNormalIdeasPauses.delete(key)
}

function saveDiagnosticsSnapshot(stateDir: string, diagnostics: RescueDiagnostics, now: number): boolean {
  const file = diagnosticsFile(stateDir)
  const temp = `${file}.${process.pid}.tmp`
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(temp, `${JSON.stringify({ v: 1, saved_at: new Date(now).toISOString(), diagnostics })}\n`, {
      encoding: 'utf8', mode: 0o600,
    })
    fs.renameSync(temp, file)
    return true
  } catch {
    try { fs.unlinkSync(temp) } catch { /* no-op */ }
    return false
  }
}

function isCount(value: unknown, nullable = true): boolean {
  return (nullable && value === null) || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)
}

function isDiagnostics(value: unknown): value is RescueDiagnostics {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  if (!['off', 'shadow'].includes(String(row.mode)) || typeof row.selectorVersion !== 'string'
    || !['disabled', 'warming', 'ready', 'paused_core_work', 'directory_paused', 'audit_unavailable']
      .includes(String(row.status))
    || typeof row.reason !== 'string' || typeof row.auditHealthy !== 'boolean') return false
  for (const key of [
    'candidatesFound', 'primaryCandidates', 'nameCandidates', 'identityChecks', 'checksReleased',
    'verified', 'identityUnresolved', 'directoryUnavailable', 'capacityMisses', 'queuedForLater',
    'retryCooling', 'retryExhausted',
  ]) if (!isCount(row[key])) return false
  if (!isCount(row.articleReads, false) || !isCount(row.ideasCreated, false) || !isCount(row.dailyCap, false)) return false
  if (row.circuitOpenUntil !== null
    && (typeof row.circuitOpenUntil !== 'string' || !Number.isFinite(Date.parse(row.circuitOpenUntil)))) return false
  if (row.reconciliation !== null) {
    if (!row.reconciliation || typeof row.reconciliation !== 'object' || Array.isArray(row.reconciliation)) return false
    const reconciliation = row.reconciliation as Record<string, unknown>
    for (const key of [
      'total', 'inboxed', 'outside_score', 'social', 'routine_filing', 'duplicate',
      'manually_blocked', 'no_identity', 'no_signal', 'candidates',
    ]) if (!isCount(reconciliation[key], false)) return false
  }
  return true
}

function loadDiagnosticsSnapshot(stateDir: string): { savedAt: number; diagnostics: RescueDiagnostics } | null {
  const file = diagnosticsFile(stateDir)
  try {
    const stat = fs.statSync(file)
    if (!stat.isFile() || stat.size < 2 || stat.size > 256 * 1024) return null
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    const savedAt = typeof raw?.saved_at === 'string' ? Date.parse(raw.saved_at) : Number.NaN
    if (raw?.v !== 1 || !Number.isFinite(savedAt) || new Date(savedAt).toISOString() !== raw.saved_at
      || !isDiagnostics(raw.diagnostics)) return null
    return { savedAt, diagnostics: raw.diagnostics }
  } catch {
    return null
  }
}

function withoutSnapshotMetrics(diagnostics: RescueDiagnostics): RescueDiagnostics {
  return {
    ...diagnostics,
    candidatesFound: null, primaryCandidates: null, nameCandidates: null,
    identityChecks: null, checksReleased: null, verified: null, identityUnresolved: null,
    directoryUnavailable: null, capacityMisses: null, queuedForLater: null,
    retryCooling: null, retryExhausted: null, reconciliation: null,
  }
}

function emptyDiagnostics(config: RescueShadowConfig, status: RescueDiagnostics['status'], reason: string): RescueDiagnostics {
  return {
    mode: config.mode, selectorVersion: RESCUE_SELECTOR_VERSION, status, reason,
    candidatesFound: null, primaryCandidates: null, nameCandidates: null,
    identityChecks: null, checksReleased: null, verified: null, identityUnresolved: null,
    directoryUnavailable: null, articleReads: 0, ideasCreated: 0, capacityMisses: null,
    queuedForLater: null, retryCooling: null, retryExhausted: null, auditHealthy: false,
    circuitOpenUntil: null, dailyCap: config.dailyChecks, reconciliation: null,
  }
}

function recentChecks(stateDir: string, now: number): { available: boolean; checks: RescueCheckRecord[] } {
  return loadRecentRescueChecks(stateDir, now)
}

function directoryPaused(until: string | null, now: number): boolean {
  if (!until) return false
  const parsed = Date.parse(until)
  return Number.isFinite(parsed) && parsed > now
}

function checksForCandidate(candidate: RescueCandidate, checks: readonly RescueCheckRecord[]): RescueCheckRecord[] {
  return checks.filter((check) => rescueCheckMatchesCandidate(check, candidate))
}

function uniqueReviewCandidates(candidates: readonly RescueCandidate[]): RescueCandidate[] {
  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    const key = JSON.stringify([candidate.identity_key, candidate.story_key])
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function verifyCandidate(
  candidate: RescueCandidate,
  fetchImpl: FetchLike,
): Promise<{ status: RescueIdentityStatus; networkAttempted: boolean; ticker?: string | null; companyName?: string | null; exchange?: string | null }> {
  const result = await searchSymbolsChecked(candidate.query, fetchImpl, { useCache: true })
  if (result.status === 'unavailable') return { status: 'directory_unavailable', networkAttempted: true }
  const wantedCountry = String(candidate.listing_country || '').trim().toUpperCase()
  if (candidate.ticker) {
    const hit = result.groups.flatMap((group) => {
      const matching = [group.symbol, ...group.aliases].flatMap((symbol) => {
        if (!directoryTickerMatches(candidate.ticker, symbol, candidate.listing_country)) return []
        const exchange = String(group.aliasExchanges?.[symbol] || (symbol === group.symbol ? group.exchange : '')).trim()
        if (!exchange || (wantedCountry && countryFromExchange(exchange) !== wantedCountry)) return []
        return [{ symbol, exchange }]
      })[0]
      if (!matching) return []
      if (candidate.company_name) {
        const actual = String(group.name || '').toLowerCase()
        const expected = candidate.company_name.toLowerCase()
        if (!companyNameMatches(actual, expected) && !companyNameMatches(expected, actual)) return []
      }
      return [{ group, matchingSymbol: matching.symbol, exchange: matching.exchange }]
    })[0]
    return hit
      ? { status: 'verified', networkAttempted: result.networkAttempted, ticker: cleanTicker(hit.matchingSymbol), companyName: hit.group.name, exchange: hit.exchange }
      : { status: 'identity_unresolved', networkAttempted: result.networkAttempted }
  }
  const expected = coreCompanyName(candidate.company_name)
  const matchingGroups = result.issuerGroups.flatMap((group) => {
    if (!expected || coreCompanyName(group.name) !== expected) return []
    const listings = group.listings || [{ symbol: group.symbol, name: group.name, exchange: group.exchange }]
    const matches = listings.filter((listing) => {
      if (!cleanTicker(listing.symbol) || !String(listing.exchange || '').trim()) return false
      return !wantedCountry || countryFromExchange(listing.exchange) === wantedCountry
    })
    return matches.length ? [{ group, matches }] : []
  })
  if (matchingGroups.length !== 1) {
    return { status: 'identity_unresolved', networkAttempted: result.networkAttempted }
  }
  const { group, matches } = matchingGroups[0]
  const listing = [...matches].sort((left, right) => {
    const leftPrimary = normTicker(left.symbol) === normTicker(group.symbol) ? 0 : 1
    const rightPrimary = normTicker(right.symbol) === normTicker(group.symbol) ? 0 : 1
    return leftPrimary - rightPrimary
      || normTicker(left.symbol).localeCompare(normTicker(right.symbol))
      || left.exchange.localeCompare(right.exchange)
  })[0]
  return {
    status: 'verified', networkAttempted: result.networkAttempted, ticker: cleanTicker(listing.symbol),
    companyName: listing.name, exchange: listing.exchange,
  }
}

function directoryHealthPatch(checks: readonly RescueCheckRecord[], now: number): Partial<{
  consecutive_directory_failures: number
  directory_pause_until: string | null
  last_directory_status: RescueIdentityStatus | null
}> {
  const completed = checks.filter((check): check is RescueCheckRecord & { identity_status: RescueIdentityStatus } =>
    !!check.identity_status && check.network_attempted !== false
      && Number.isFinite(Date.parse(check.completed_at || check.reserved_at)))
    .sort((left, right) => Date.parse(left.completed_at || left.reserved_at)
      - Date.parse(right.completed_at || right.reserved_at) || left.key.localeCompare(right.key))
  const last = completed.at(-1)
  let failures = 0
  for (let index = completed.length - 1; index >= 0 && completed[index].identity_status === 'directory_unavailable'; index--) failures++
  const lastAt = last ? Date.parse(last.completed_at || last.reserved_at) : 0
  const pauseUntilMs = failures >= 3 ? lastAt + 30 * 60_000 : 0
  return {
    consecutive_directory_failures: failures,
    directory_pause_until: pauseUntilMs > now ? new Date(pauseUntilMs).toISOString() : null,
    last_directory_status: last?.identity_status || null,
  }
}

function diagnosticsFromState(
  stateDir: string,
  config: RescueShadowConfig,
  now: number,
  coreReady: boolean,
  blockedEventIds: ReadonlySet<string>,
  humanActionsReady: boolean,
  normalIdeasReady: boolean,
  feedCheckpoint?: RescueFeedCheckpointSnapshot,
): RescueDiagnostics {
  const health = readRescueHealth(stateDir)
  const modeState = readRescueMode(stateDir)
  const queue = loadRescueQueue(stateDir)
  const date = utcDate(now)
  const day = loadRescueDay(stateDir, date)
  const history = recentChecks(stateDir, now)
  const selection = queue.available
    ? selectRescueCandidates(queue.items, now, config.maxAgeHrs, blockedEventIds)
    : { candidates: [], primary_count: 0, name_count: 0, reconciled: emptyReconciliation() }
  const checks = day.available ? day.ledger.checks : []
  const released = Math.floor(dailyQuotaAdmission({
    id: 'news-rescue-shadow', meter: 'requests', used: checks.length, cap: config.dailyChecks,
    cost: 1, paceCost: 1, floorFraction: config.paceFloorFraction,
  }, now).released)
  const complete = checks.filter((check) => !!check.identity_status)
  const verified = complete.filter((check) => check.identity_status === 'verified').length
  const unresolved = complete.filter((check) => check.identity_status === 'identity_unresolved').length
  const unavailable = complete.filter((check) => check.identity_status === 'directory_unavailable').length
  const candidates = uniqueReviewCandidates(selection.candidates)
  const candidateStates = candidates.map((candidate) => {
    const matching = checksForCandidate(candidate, history.checks)
    const terminal = matching.some((check) => check.identity_status !== 'directory_unavailable')
    const unavailableChecks = matching.filter((check) => check.identity_status === 'directory_unavailable')
    const unavailableAttempts = unavailableChecks.length
    const lastUnavailableAt = Math.max(0, ...unavailableChecks
      .map((check) => Date.parse(check.completed_at || check.reserved_at) || 0))
    const retryExhausted = !terminal && unavailableAttempts >= 2
    const retryCooling = !terminal && !retryExhausted && lastUnavailableAt > 0
      && now - lastUnavailableAt < 30 * 60_000
    return { candidate, terminal, retryExhausted, retryCooling }
  })
  const remaining = candidateStates.filter((state) => !state.terminal && !state.retryExhausted && !state.retryCooling)
  const nameUsed = checks.filter((check) => check.pool === 'name').length
  const nameCapBlocked = nameUsed >= config.nameDailyCap
    ? remaining.filter((state) => state.candidate.pool === 'name').length
    : 0
  const dailyCapReached = checks.length >= config.dailyChecks
  const capacityMisses = dailyCapReached ? remaining.length : nameCapBlocked
  const queuedForLater = dailyCapReached ? 0 : Math.max(0, remaining.length - nameCapBlocked)
  const coverageStartedAt = Date.parse(queue.coverage_started_at || '')
  const coverageReady = Number.isFinite(coverageStartedAt)
    && now - coverageStartedAt >= Math.max(1, config.maxAgeHrs) * 3_600_000 + 5 * 60_000
  const checkpointReadable = feedCheckpoint?.available !== false
  const checkpointContinuous = !feedCheckpoint
    || (feedCheckpoint.available && rescueFeedCheckpointMatches(queue.feed_checkpoint, feedCheckpoint.checkpoint))
  const modeReady = modeState.available && modeState.mode === 'shadow'
  const metricsAvailable = queue.available && queue.committed && modeReady && checkpointContinuous
    && coverageReady && day.available && history.available
  const selectionMetricsAvailable = metricsAvailable && humanActionsReady
  const rescueStateHealthy = health.audit_healthy && queue.available && queue.committed
    && modeState.available && checkpointReadable && day.available && history.available
  const auditHealthy = rescueStateHealthy && humanActionsReady
  const ideasReady = normalIdeasReady && health.normal_ideas_ready
  let status: RescueDiagnostics['status'] = 'ready'
  let reason = 'The second look is running in shadow mode. It checks company identity but reads no articles and creates no ideas.'
  if (config.mode === 'off') { status = 'disabled'; reason = 'The second look is turned off.' }
  else if (!modeState.available || !checkpointReadable) {
    status = 'audit_unavailable'
    reason = 'The second look cannot prove its saved coverage state, so no stock-listing checks will run.'
  }
  else if (!queue.available || !queue.committed) {
    status = 'audit_unavailable'
    reason = queue.incomplete_since
      ? 'A second-look queue update is incomplete. No stock-listing checks will run until the omitted window is safely rebuilt.'
      : 'The second-look queue cannot be safely read or written.'
  }
  else if (!rescueStateHealthy) { status = 'audit_unavailable'; reason = health.audit_error || 'The second-look record cannot be safely read or written.' }
  else if (!humanActionsReady) {
    status = 'audit_unavailable'
    reason = 'Saved dismissals and manual blocks cannot be read safely, so the second look is paused until that record is repaired.'
  }
  else if (!modeReady || !checkpointContinuous) {
    status = 'warming'
    reason = `The second look found a gap in its saved news coverage. It is rebuilding a complete ${Math.max(1, config.maxAgeHrs)}-hour history before any company checks run.`
  }
  else if (!ideasReady) {
    status = 'paused_core_work'
    reason = health.normal_ideas_reason || 'Normal Ideas work did not finish, so the second look did no work.'
  }
  else if (!coverageReady) {
    status = 'warming'
    reason = `The second look is building its first complete ${Math.max(1, config.maxAgeHrs)}-hour history. Counts stay unavailable and no company checks run until that window is complete.`
  }
  else if (!coreReady) { status = 'paused_core_work'; reason = 'Normal news or Ideas work is still waiting, so the second look did no work.' }
  else if (directoryPaused(health.directory_pause_until, now)) {
    status = 'directory_paused'
    reason = 'The stock-listing lookup failed three times. It is paused for 30 minutes before trying again.'
  }
  return {
    mode: config.mode,
    selectorVersion: RESCUE_SELECTOR_VERSION,
    status,
    reason,
    candidatesFound: selectionMetricsAvailable ? candidates.length : null,
    primaryCandidates: selectionMetricsAvailable ? candidates.filter((candidate) => candidate.pool === 'ticker').length : null,
    nameCandidates: selectionMetricsAvailable ? candidates.filter((candidate) => candidate.pool === 'name').length : null,
    identityChecks: metricsAvailable ? checks.length : null,
    checksReleased: metricsAvailable ? released : null,
    verified: metricsAvailable ? verified : null,
    identityUnresolved: metricsAvailable ? unresolved : null,
    directoryUnavailable: metricsAvailable ? unavailable : null,
    articleReads: 0,
    ideasCreated: 0,
    capacityMisses: selectionMetricsAvailable ? capacityMisses : null,
    queuedForLater: selectionMetricsAvailable ? queuedForLater : null,
    retryCooling: selectionMetricsAvailable ? candidateStates.filter((state) => state.retryCooling).length : null,
    retryExhausted: selectionMetricsAvailable ? candidateStates.filter((state) => state.retryExhausted).length : null,
    auditHealthy,
    circuitOpenUntil: health.directory_pause_until,
    dailyCap: config.dailyChecks,
    reconciliation: selectionMetricsAvailable ? selection.reconciled : null,
  }
}

export function getRescueDiagnostics(
  stateDir: string,
  config: RescueShadowConfig,
  now = Date.now(),
  coreReady = true,
  blockedEventIds: ReadonlySet<string> = new Set(),
  humanActionsReady = true,
  normalIdeasReady = true,
  feedCheckpoint?: RescueFeedCheckpointSnapshot,
): RescueDiagnostics {
  void blockedEventIds
  void feedCheckpoint
  if (config.mode === 'off') {
    return emptyDiagnostics(config, 'disabled', 'The second look is turned off.')
  }
  const health = readRescueHealth(stateDir)
  const loaded = loadDiagnosticsSnapshot(stateDir)
  const saved = loaded?.diagnostics || null
  const runtimeNormalIdeasReason = runtimeNormalIdeasPauses.get(diagnosticsRuntimeKey(stateDir)) || null
  if (runtimeDiagnosticsFailures.has(diagnosticsRuntimeKey(stateDir))) return {
    ...(saved && saved.mode === config.mode && saved.selectorVersion === RESCUE_SELECTOR_VERSION
      ? withoutSnapshotMetrics(saved)
      : emptyDiagnostics(config, 'audit_unavailable', '')),
    status: 'audit_unavailable',
    reason: 'The second-look status could not be saved. Counts stay unavailable until a safe write succeeds.',
    auditHealthy: false,
    circuitOpenUntil: health.directory_pause_until,
  }
  if (!humanActionsReady) return {
    ...(saved && saved.mode === config.mode && saved.selectorVersion === RESCUE_SELECTOR_VERSION
      ? saved
      : emptyDiagnostics(config, 'audit_unavailable', '')),
    status: 'audit_unavailable',
    reason: 'Saved dismissals and manual blocks cannot be read safely, so the second look is paused until that record is repaired.',
    candidatesFound: null, primaryCandidates: null, nameCandidates: null, capacityMisses: null,
    queuedForLater: null, retryCooling: null, retryExhausted: null, reconciliation: null,
    auditHealthy: false,
  }
  if (!health.audit_healthy) return {
    ...(saved && saved.mode === config.mode && saved.selectorVersion === RESCUE_SELECTOR_VERSION
      ? saved
      : emptyDiagnostics(config, 'audit_unavailable', '')),
    status: 'audit_unavailable',
    reason: health.audit_error || 'The second-look record cannot be safely read or written.',
    auditHealthy: false,
  }
  if (!normalIdeasReady || runtimeNormalIdeasReason) return {
    ...(saved && saved.mode === config.mode && saved.selectorVersion === RESCUE_SELECTOR_VERSION
      ? saved
      : emptyDiagnostics(config, 'paused_core_work', '')),
    status: 'paused_core_work',
    reason: runtimeNormalIdeasReason || health.normal_ideas_reason
      || 'The normal Ideas scan did not finish, so the second look waited.',
  }
  if (!health.normal_ideas_ready) return {
    ...(saved && saved.mode === config.mode && saved.selectorVersion === RESCUE_SELECTOR_VERSION
      ? saved
      : emptyDiagnostics(config, 'paused_core_work', '')),
    status: 'paused_core_work',
    reason: health.normal_ideas_reason
      || 'The normal Ideas scan did not finish, so the second look waited.',
  }
  if (!saved || saved.mode !== config.mode || saved.selectorVersion !== RESCUE_SELECTOR_VERSION) {
    return emptyDiagnostics(
      config, health.audit_healthy ? 'warming' : 'audit_unavailable',
      health.audit_healthy
        ? 'The second look has not completed a safe shadow pass yet. Counts stay unavailable until it does.'
        : health.audit_error || 'The second-look record cannot be safely read or written.',
    )
  }
  const snapshotDate = new Date(loaded!.savedAt).toISOString().slice(0, 10)
  const snapshotAge = now - loaded!.savedAt
  const snapshotCurrent = snapshotDate === utcDate(now)
    && snapshotAge <= 30 * 60_000 && snapshotAge >= -5 * 60_000
  const stagePending = fs.existsSync(path.join(stateDir, 'news-rescue', 'queue-stage.json'))
  if (directoryPaused(health.directory_pause_until, now)) return {
    ...(snapshotCurrent && !stagePending ? saved : withoutSnapshotMetrics(saved)),
    status: 'directory_paused',
    reason: 'The stock-listing lookup failed three times. It is paused for 30 minutes before trying again.',
    circuitOpenUntil: health.directory_pause_until,
  }
  if (!snapshotCurrent) {
    return {
      ...withoutSnapshotMetrics(saved),
      status: 'warming',
      reason: snapshotDate !== utcDate(now)
        ? 'The second look has not completed a safe pass for this UTC day yet. Today’s counts stay unavailable.'
        : 'The saved second-look status is old. Counts stay unavailable until the next safe pass.',
    }
  }
  if (stagePending) return {
    ...withoutSnapshotMetrics(saved),
    status: 'warming',
    reason: 'New scored items are waiting for normal Ideas work to finish before second-look counts refresh.',
  }
  if (!coreReady && saved.status === 'ready') return {
    ...saved,
    status: 'paused_core_work',
    reason: 'Normal news or Ideas work is still waiting, so the second look did no work.',
  }
  return saved
}

export async function runRescueShadowPass(deps: {
  stateDir: string
  config: RescueShadowConfig
  coreReady: boolean
  fetchImpl?: FetchLike
  now?: () => number
  log?: (message: string) => void
  blockedEventIds?: ReadonlySet<string>
  humanActionsReady?: boolean
  normalIdeasReady?: boolean
  feedCheckpoint?: RescueFeedCheckpointSnapshot
}): Promise<RescueShadowResult> {
  const now = deps.now?.() ?? Date.now()
  const log = deps.log || (() => {})
  const blockedEventIds = deps.blockedEventIds || new Set<string>()
  const humanActionsReady = deps.humanActionsReady !== false
  const normalIdeasReady = deps.normalIdeasReady !== false
  const snapshotFailure = (result: RescueShadowResult): RescueShadowResult => {
    runtimeDiagnosticsFailures.add(diagnosticsRuntimeKey(deps.stateDir))
    updateRescueHealth(deps.stateDir, {
      audit_healthy: false,
      audit_error: RESCUE_DIAGNOSTICS_WRITE_ERROR,
    }, deps.now?.() ?? Date.now())
    return {
      ...result,
      status: 'audit_unavailable',
      reason: 'The second-look status could not be saved. Further stock-listing checks are paused.',
      auditHealthy: false,
    }
  }
  const finish = (result: RescueShadowResult): RescueShadowResult => {
    return saveDiagnosticsSnapshot(deps.stateDir, result, deps.now?.() ?? Date.now())
      ? result
      : snapshotFailure(result)
  }

  // Off mode is a hard no-work path. Its tiny durable transition marker is written at the ingest boundary,
  // before any feed omission can occur; an Ideas tick must not rewrite a potentially 256 MiB queue.
  if (deps.config.mode === 'off') {
    return finish({
      ...emptyDiagnostics(deps.config, 'disabled', 'The second look is turned off.'),
      checkedThisCycle: 0,
    })
  }
  // Prove the small UI snapshot is writable before any directory request. A prior failure is cleared
  // only by this exact lightweight write; otherwise checks could continue while diagnostics stayed stale.
  const snapshotProbe: RescueShadowResult = {
    ...withoutSnapshotMetrics(getRescueDiagnostics(
      deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds, humanActionsReady,
      normalIdeasReady, deps.feedCheckpoint,
    )),
    status: 'warming',
    reason: 'The second look is refreshing its saved counts. Counts stay unavailable until this safe pass finishes.',
    auditHealthy: false,
    checkedThisCycle: 0,
  }
  if (!saveDiagnosticsSnapshot(deps.stateDir, snapshotProbe, now)) return snapshotFailure(snapshotProbe)
  runtimeDiagnosticsFailures.delete(diagnosticsRuntimeKey(deps.stateDir))
  const snapshotHealth = readRescueHealth(deps.stateDir)
  if (snapshotHealth.audit_error_code === 'diagnostics_snapshot') {
    updateRescueHealth(deps.stateDir, {
      audit_healthy: true, audit_error: null, audit_error_code: null,
    }, now)
  }
  const date = utcDate(now)
  const initialHealth = readRescueHealth(deps.stateDir)
  if (deps.config.mode === 'shadow' && initialHealth.audit_error === RESCUE_RESERVATION_WRITE_ERROR
    && repairRescueReservationAuthority(deps.stateDir, date)) {
    updateRescueHealth(deps.stateDir, { audit_healthy: true, audit_error: null, audit_error_code: null }, now)
  }
  const capacityHealth = readRescueHealth(deps.stateDir)
  // A preflight refusal has no pending result to repair. Re-probe it before honoring the stale latch so
  // a transient directory fault — or the start of a new monthly audit file — can recover without a
  // manual health-file edit. Result-write failures use a different error and remain fail-closed.
  if (deps.config.mode === 'shadow' && capacityHealth.audit_error === RESCUE_AUDIT_PREFLIGHT_ERROR
    && rescueAuditCanAccept(deps.stateDir, now, deps.config.auditMaxBytes)) {
    updateRescueHealth(deps.stateDir, { audit_healthy: true, audit_error: null, audit_error_code: null }, now)
  }
  // Repair all bounded day ledgers before consulting the health latch. This lets a service that was down
  // for several days finish a pending monthly append, and turns retiring crash reservations into explicit
  // interrupted records instead of silently deleting them.
  const beforeReconcile = readRescueHealth(deps.stateDir)
  const reconciledLedgers = reconcileRescueDayLedgers(deps.stateDir, now, deps.config.auditMaxBytes)
  if (!reconciledLedgers) {
    updateRescueHealth(deps.stateDir, {
      audit_healthy: false,
      audit_error: 'The detailed second-look record is full or could not be saved.',
    }, now)
  } else if (!beforeReconcile.audit_healthy && beforeReconcile.audit_error_code === 'audit_result') {
    updateRescueHealth(deps.stateDir, { audit_healthy: true, audit_error: null, audit_error_code: null }, now)
  }
  const repairHistory = deps.config.mode === 'shadow' ? recentChecks(deps.stateDir, now) : null
  const directoryHealthSaved = deps.config.mode !== 'shadow' || !repairHistory?.available
    || updateRescueHealth(deps.stateDir, directoryHealthPatch(repairHistory.checks, now), now)
  let diagnostic = diagnosticsFromState(
    deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds, humanActionsReady,
    normalIdeasReady, deps.feedCheckpoint,
  )
  if (!directoryHealthSaved) return finish({
    ...diagnostic,
    status: 'audit_unavailable',
    reason: 'The second-look health record could not be saved. No stock-listing checks were made.',
    auditHealthy: false,
    checkedThisCycle: 0,
  })
  if (diagnostic.status !== 'ready') return finish({ ...diagnostic, checkedThisCycle: 0 })

  const queue = loadRescueQueue(deps.stateDir)
  const day = loadRescueDay(deps.stateDir, date)
  const history = recentChecks(deps.stateDir, now)
  if (!queue.available || !day.available || !history.available) return finish({
    ...diagnosticsFromState(
      deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds, humanActionsReady,
      normalIdeasReady, deps.feedCheckpoint,
    ), checkedThisCycle: 0,
  })
  const selection = selectRescueCandidates(queue.items, now, deps.config.maxAgeHrs, blockedEventIds)
  const checks = [...day.ledger.checks]
  // A bare reservation may have crossed the network boundary before a crash. Treat it as spent and do
  // not repeat it after restart. If a better article later becomes the representative — even after the
  // first row ages out — the saved story key still reuses this same check.
  const eligible = uniqueReviewCandidates(selection.candidates).filter((candidate) => {
    const matching = checksForCandidate(candidate, history.checks)
    if (matching.some((check) => check.identity_status !== 'directory_unavailable')) return false
    if (matching.length >= 2) return false
    const unavailableAt = Math.max(0, ...matching
      .filter((check) => check.identity_status === 'directory_unavailable')
      .map((check) => Date.parse(check.completed_at || check.reserved_at) || 0))
    return !unavailableAt || now - unavailableAt >= 30 * 60_000
  })
  const ticker = eligible.filter((candidate) => candidate.pool === 'ticker')
  const name = eligible.filter((candidate) => candidate.pool === 'name')
  let used = checks.length
  let nameUsed = checks.filter((check) => check.pool === 'name').length
  let checkedThisCycle = 0

  while (checkedThisCycle < deps.config.perCycle) {
    const loopNow = deps.now?.() ?? Date.now()
    if (utcDate(loopNow) !== date) break
    const admission = dailyQuotaAdmission({
      id: 'news-rescue-shadow', meter: 'requests', used, cap: deps.config.dailyChecks,
      cost: 1, paceCost: 1, floorFraction: deps.config.paceFloorFraction,
    }, loopNow)
    if (!admission.pacedFit) break
    if (!rescueAuditCanAccept(deps.stateDir, loopNow, deps.config.auditMaxBytes)) {
      updateRescueHealth(deps.stateDir, {
        audit_healthy: false,
        audit_error: RESCUE_AUDIT_PREFLIGHT_ERROR,
      }, loopNow)
      break
    }
    // A name-only lookup is earned only after four ticker checks. An unused name slot may pass to a
    // ticker, but an empty ticker slot never passes to a name: that one-way spillover keeps the promised
    // 4:1 daily mix even when the candidate pools are badly imbalanced.
    const earnedNameSlots = Math.min(deps.config.nameDailyCap, Math.floor((used + 1) / 5))
    const wantName = nameUsed < earnedNameSlots
    const candidate = wantName ? (name.shift() || ticker.shift()) : ticker.shift()
    if (!candidate) break

    const reservation = reserveRescueCheck(deps.stateDir, date, candidate, RESCUE_SELECTOR_VERSION, loopNow)
    if (!reservation) {
      updateRescueHealth(deps.stateDir, { audit_healthy: false, audit_error: RESCUE_RESERVATION_WRITE_ERROR }, loopNow)
      break
    }
    used++
    if (candidate.pool === 'name') nameUsed++
    checkedThisCycle++
    const result = await verifyCandidate(candidate, deps.fetchImpl || fetch)
    if (!completeRescueCheck(deps.stateDir, date, reservation.key, result, deps.config.auditMaxBytes, deps.now?.() ?? Date.now())) {
      updateRescueHealth(deps.stateDir, {
        audit_healthy: false,
        audit_error: 'The detailed second-look result could not be saved. Further checks are stopped.',
      }, deps.now?.() ?? Date.now())
      break
    }
    const noted = result.networkAttempted
      ? noteDirectoryResult(deps.stateDir, result.status, deps.now?.() ?? Date.now())
      : { saved: true, health: readRescueHealth(deps.stateDir) }
    log(`second look shadow: ${candidate.event_id} → ${result.status}`)
    if (!noted.saved) {
      const failedAt = deps.now?.() ?? Date.now()
      diagnostic = diagnosticsFromState(
        deps.stateDir, deps.config, utcDate(failedAt) === date ? failedAt : now, deps.coreReady,
        blockedEventIds, humanActionsReady, normalIdeasReady, deps.feedCheckpoint,
      )
      return finish({
        ...diagnostic,
        status: 'audit_unavailable',
        reason: 'The second-look health record could not be saved. Further stock-listing checks were stopped.',
        auditHealthy: false,
        checkedThisCycle,
      })
    }
    if (directoryPaused(noted.health.directory_pause_until, deps.now?.() ?? Date.now())) break
  }
  const finalNow = deps.now?.() ?? Date.now()
  diagnostic = diagnosticsFromState(
    deps.stateDir, deps.config, utcDate(finalNow) === date ? finalNow : now, deps.coreReady,
    blockedEventIds, humanActionsReady, normalIdeasReady, deps.feedCheckpoint,
  )
  return finish({ ...diagnostic, checkedThisCycle })
}
