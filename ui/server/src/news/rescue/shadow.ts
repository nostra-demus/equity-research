// Shadow-only second-look runner. It executes after the normal Ideas pass, spends a clock-paced maximum
// of identity checks, and never reads an article or creates an idea. Live work is a later rollout stage.

import { dailyQuotaAdmission } from '../triage/budget'
import { countryFromExchange } from '../equity-quote'
import {
  baseTicker, cleanTicker, companyNameMatches, coreCompanyName, directoryTickerMatches, normTicker,
  searchSymbolsChecked, type FetchLike,
} from '../symbology'
import { RESCUE_SELECTOR_VERSION, selectRescueCandidates, type RescueCandidate } from './selector'
import {
  completeRescueCheck, loadRecentRescueChecks, loadRescueDay, loadRescueQueue, noteDirectoryResult,
  readRescueHealth, reconcileRescueDayLedgers, repairRescueReservationAuthority,
  RESCUE_RESERVATION_WRITE_ERROR, rescueAuditCanAccept, rescueCheckMatchesCandidate,
  reserveRescueCheck, updateRescueHealth,
  type RescueCheckRecord, type RescueIdentityStatus,
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
  status: 'disabled' | 'ready' | 'paused_core_work' | 'directory_paused' | 'audit_unavailable'
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
): Promise<{ status: RescueIdentityStatus; ticker?: string | null; companyName?: string | null; exchange?: string | null }> {
  const result = await searchSymbolsChecked(candidate.query, fetchImpl, { useCache: true })
  if (result.status === 'unavailable') return { status: 'directory_unavailable' }
  const wantedCountry = String(candidate.listing_country || '').trim().toUpperCase()
  if (candidate.ticker) {
    const hit = result.groups.flatMap((group) => {
      const matching = [group.symbol, ...group.aliases].flatMap((symbol) => {
        if (!directoryTickerMatches(candidate.ticker, symbol, candidate.listing_country)) return []
        const exchange = String(group.aliasExchanges?.[symbol] || (symbol === group.symbol ? group.exchange : '')).trim()
        const savedNorm = normTicker(candidate.ticker)
        const exactBare = baseTicker(savedNorm) === savedNorm && normTicker(symbol) === savedNorm
        if (!exchange || (wantedCountry && exactBare && countryFromExchange(exchange) !== wantedCountry)) return []
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
      ? { status: 'verified', ticker: cleanTicker(hit.matchingSymbol), companyName: hit.group.name, exchange: hit.exchange }
      : { status: 'identity_unresolved' }
  }
  const expected = coreCompanyName(candidate.company_name)
  const matches = result.groups.flatMap((group) => {
    if (!expected || coreCompanyName(group.name) !== expected) return []
    const listings = group.listings || [{ symbol: group.symbol, name: group.name, exchange: group.exchange }]
    return listings.filter((listing) => {
      if (!cleanTicker(listing.symbol) || !String(listing.exchange || '').trim()) return false
      return !wantedCountry || countryFromExchange(listing.exchange) === wantedCountry
    })
  })
  if (matches.length !== 1) return { status: 'identity_unresolved' }
  return {
    status: 'verified', ticker: cleanTicker(matches[0].symbol),
    companyName: matches[0].name, exchange: matches[0].exchange,
  }
}

function directoryHealthPatch(checks: readonly RescueCheckRecord[], now: number): Partial<{
  consecutive_directory_failures: number
  directory_pause_until: string | null
  last_directory_status: RescueIdentityStatus | null
}> {
  const completed = checks.filter((check): check is RescueCheckRecord & { identity_status: RescueIdentityStatus } =>
    !!check.identity_status && Number.isFinite(Date.parse(check.completed_at || check.reserved_at)))
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
): RescueDiagnostics {
  const health = readRescueHealth(stateDir)
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
  const metricsAvailable = queue.available && day.available && history.available
  const rescueStateHealthy = health.audit_healthy && queue.available && day.available && history.available
  const auditHealthy = rescueStateHealthy && humanActionsReady
  const ideasReady = normalIdeasReady && health.normal_ideas_ready
  let status: RescueDiagnostics['status'] = 'ready'
  let reason = 'The second look is running in shadow mode. It checks company identity but reads no articles and creates no ideas.'
  if (config.mode === 'off') { status = 'disabled'; reason = 'The second look is turned off.' }
  else if (!rescueStateHealthy) { status = 'audit_unavailable'; reason = health.audit_error || 'The second-look record cannot be safely read or written.' }
  else if (!humanActionsReady) {
    status = 'audit_unavailable'
    reason = 'Saved dismissals and manual blocks cannot be read safely, so the second look is paused until that record is repaired.'
  }
  else if (!ideasReady) {
    status = 'paused_core_work'
    reason = health.normal_ideas_reason || 'Normal Ideas work did not finish, so the second look did no work.'
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
    candidatesFound: metricsAvailable ? candidates.length : null,
    primaryCandidates: metricsAvailable ? candidates.filter((candidate) => candidate.pool === 'ticker').length : null,
    nameCandidates: metricsAvailable ? candidates.filter((candidate) => candidate.pool === 'name').length : null,
    identityChecks: metricsAvailable ? checks.length : null,
    checksReleased: metricsAvailable ? released : null,
    verified: metricsAvailable ? verified : null,
    identityUnresolved: metricsAvailable ? unresolved : null,
    directoryUnavailable: metricsAvailable ? unavailable : null,
    articleReads: 0,
    ideasCreated: 0,
    capacityMisses: metricsAvailable ? capacityMisses : null,
    queuedForLater: metricsAvailable ? queuedForLater : null,
    retryCooling: metricsAvailable ? candidateStates.filter((state) => state.retryCooling).length : null,
    retryExhausted: metricsAvailable ? candidateStates.filter((state) => state.retryExhausted).length : null,
    auditHealthy,
    circuitOpenUntil: health.directory_pause_until,
    dailyCap: config.dailyChecks,
    reconciliation: metricsAvailable ? selection.reconciled : null,
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
): RescueDiagnostics {
  return diagnosticsFromState(stateDir, config, now, coreReady, blockedEventIds, humanActionsReady, normalIdeasReady)
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
}): Promise<RescueShadowResult> {
  const now = deps.now?.() ?? Date.now()
  const log = deps.log || (() => {})
  const blockedEventIds = deps.blockedEventIds || new Set<string>()
  const humanActionsReady = deps.humanActionsReady !== false
  const normalIdeasReady = deps.normalIdeasReady !== false
  const date = utcDate(now)
  const initialHealth = readRescueHealth(deps.stateDir)
  if (deps.config.mode === 'shadow' && initialHealth.audit_error === RESCUE_RESERVATION_WRITE_ERROR
    && repairRescueReservationAuthority(deps.stateDir, date)) {
    updateRescueHealth(deps.stateDir, { audit_healthy: true, audit_error: null }, now)
  }
  const capacityHealth = readRescueHealth(deps.stateDir)
  // A preflight refusal has no pending result to repair. Re-probe it before honoring the stale latch so
  // a transient directory fault — or the start of a new monthly audit file — can recover without a
  // manual health-file edit. Result-write failures use a different error and remain fail-closed.
  if (deps.config.mode === 'shadow' && capacityHealth.audit_error === RESCUE_AUDIT_PREFLIGHT_ERROR
    && rescueAuditCanAccept(deps.stateDir, now, deps.config.auditMaxBytes)) {
    updateRescueHealth(deps.stateDir, { audit_healthy: true, audit_error: null }, now)
  }
  // A crash can happen after the monthly append fsync but before the day ledger clears audit_pending.
  // Repair that bounded record before consulting the stale health latch, otherwise a recoverable write
  // failure would prevent its own repair forever. Unrelated queue/overflow failures are never cleared here.
  const repairHistory = deps.config.mode === 'shadow' ? recentChecks(deps.stateDir, now) : null
  if (repairHistory?.available && repairHistory.checks.some((check) => check.audit_pending && check.identity_status)) {
    const before = readRescueHealth(deps.stateDir)
    const repaired = reconcileRescueDayLedgers(deps.stateDir, now, deps.config.auditMaxBytes)
    if (repaired && (!before.audit_error || before.audit_error.startsWith('The detailed second-look'))) {
      updateRescueHealth(deps.stateDir, { audit_healthy: true, audit_error: null }, now)
    } else if (!repaired) {
      updateRescueHealth(deps.stateDir, {
        audit_healthy: false,
        audit_error: 'The detailed second-look record is full or could not be saved.',
      }, now)
    }
  }
  const directoryHealthSaved = deps.config.mode !== 'shadow' || !repairHistory?.available
    || updateRescueHealth(deps.stateDir, directoryHealthPatch(repairHistory.checks, now), now)
  let diagnostic = diagnosticsFromState(
    deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds, humanActionsReady, normalIdeasReady,
  )
  if (!directoryHealthSaved) return {
    ...diagnostic,
    status: 'audit_unavailable',
    reason: 'The second-look health record could not be saved. No stock-listing checks were made.',
    auditHealthy: false,
    checkedThisCycle: 0,
  }
  if (diagnostic.status !== 'ready') return { ...diagnostic, checkedThisCycle: 0 }
  if (!reconcileRescueDayLedgers(deps.stateDir, now, deps.config.auditMaxBytes)) {
    updateRescueHealth(deps.stateDir, {
      audit_healthy: false,
      audit_error: 'The detailed second-look record is full or could not be saved.',
    }, now)
    diagnostic = diagnosticsFromState(
      deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds, humanActionsReady, normalIdeasReady,
    )
    return { ...diagnostic, checkedThisCycle: 0 }
  }

  const queue = loadRescueQueue(deps.stateDir)
  const day = loadRescueDay(deps.stateDir, date)
  const history = recentChecks(deps.stateDir, now)
  if (!queue.available || !day.available || !history.available) return {
    ...diagnosticsFromState(
      deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds, humanActionsReady, normalIdeasReady,
    ), checkedThisCycle: 0,
  }
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
    const wantName = (used + 1) % 5 === 0 && nameUsed < deps.config.nameDailyCap
    let candidate = wantName ? name.shift() : ticker.shift()
    if (!candidate) candidate = ticker.shift()
    if (!candidate && nameUsed < deps.config.nameDailyCap) candidate = name.shift()
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
    const noted = noteDirectoryResult(deps.stateDir, result.status, deps.now?.() ?? Date.now())
    log(`second look shadow: ${candidate.event_id} → ${result.status}`)
    if (!noted.saved) {
      const failedAt = deps.now?.() ?? Date.now()
      diagnostic = diagnosticsFromState(
        deps.stateDir, deps.config, utcDate(failedAt) === date ? failedAt : now, deps.coreReady,
        blockedEventIds, humanActionsReady, normalIdeasReady,
      )
      return {
        ...diagnostic,
        status: 'audit_unavailable',
        reason: 'The second-look health record could not be saved. Further stock-listing checks were stopped.',
        auditHealthy: false,
        checkedThisCycle,
      }
    }
    if (directoryPaused(noted.health.directory_pause_until, deps.now?.() ?? Date.now())) break
  }
  const finalNow = deps.now?.() ?? Date.now()
  diagnostic = diagnosticsFromState(
    deps.stateDir, deps.config, utcDate(finalNow) === date ? finalNow : now, deps.coreReady,
    blockedEventIds, humanActionsReady, normalIdeasReady,
  )
  return { ...diagnostic, checkedThisCycle }
}
