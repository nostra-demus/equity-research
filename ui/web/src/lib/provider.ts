export type RunProvider = 'claude' | 'codex'

export const RUN_PROVIDER_STORAGE_KEY = 'nsw.runProvider'

export function isRunProvider(value: unknown): value is RunProvider {
  return value === 'claude' || value === 'codex'
}

export function readRunProvider(storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage): RunProvider {
  try {
    const value = storage?.getItem(RUN_PROVIDER_STORAGE_KEY)
    return isRunProvider(value) ? value : 'claude'
  } catch {
    return 'claude'
  }
}

export function saveRunProvider(provider: RunProvider, storage: Pick<Storage, 'setItem'> | null = typeof localStorage === 'undefined' ? null : localStorage): void {
  try { storage?.setItem(RUN_PROVIDER_STORAGE_KEY, provider) } catch { /* private mode */ }
}

export interface ProviderExecutionProfile {
  key: string
  parentModel?: string
  parentReasoning?: string
  specialistModel?: string
  specialistReasoning?: string
}

export const CODEX_EXECUTION_PROFILE: Required<ProviderExecutionProfile> = {
  key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  parentModel: 'gpt-5.6-sol',
  parentReasoning: 'max',
  specialistModel: 'gpt-5.6-terra',
  specialistReasoning: 'xhigh',
}

/** Immutable provider/profile selection captured at the user launch boundary. The legacy flag is only
 * minted after the provider catalogue endpoint has positively failed closed to Claude-only. */
export interface FrozenProviderLaunch {
  provider: RunProvider
  expectedProfileKey?: string
  model?: string
  reasoningLevel?: string
  executionProfile?: ProviderExecutionProfile
  legacyClaudeFallback?: true
}

export interface ProviderStatus {
  provider: RunProvider
  enabled: boolean
  available: boolean
  checked: boolean
  checking?: boolean
  reason?: string
  status?: string
  profile?: ProviderExecutionProfile
  usage?: import('./types').Usage
}

export type ProvidersRead = Record<RunProvider, ProviderStatus> & {
  /** `fallback` means the provider endpoint was absent or did not prove its contract. In that state
   * Claude is the only safe legacy choice; Codex must never be sent to a server that may ignore it. */
  catalogState?: 'unknown' | 'valid' | 'fallback'
}

export const emptyProviders = (): ProvidersRead => ({
  claude: { provider: 'claude', enabled: true, available: false, checked: false },
  codex: { provider: 'codex', enabled: false, available: false, checked: false },
  catalogState: 'unknown',
})

/** A current provider endpoint that could not be proved is not an old Claude-only server. Keep both
 * choices retryable, but block both launch paths until a fresh, strict catalogue succeeds. */
export function providerCatalogUnknown(reason = 'Provider selection could not be verified. Check again.'): ProvidersRead {
  return {
    claude: { provider: 'claude', enabled: true, available: false, checked: true, status: 'unknown', reason },
    codex: { provider: 'codex', enabled: true, available: false, checked: true, status: 'unknown', reason },
    catalogState: 'unknown',
  }
}

export function providerCatalogFallback(reason = 'This server cannot verify provider selection. Claude only.'): ProvidersRead {
  return {
    // An old cockpit server is itself the proof that the legacy Claude path exists. Keep that path usable,
    // but make Codex impossible to select so a server that ignores `provider` cannot mislabel the run.
    claude: { provider: 'claude', enabled: true, available: true, checked: true },
    codex: { provider: 'codex', enabled: false, available: false, checked: true, reason },
    catalogState: 'fallback',
  }
}

/** Normalize one server status without inventing availability. A rate-limited provider may still be
 * `available: true`; quota state belongs to usage and does not disable the provider choice. */
export function normalizeProviderStatus(raw: unknown, expected?: RunProvider): ProviderStatus | null {
  if (!raw || typeof raw !== 'object') return null
  const entry = raw as Record<string, unknown>
  if (!isRunProvider(entry.provider) || (expected && entry.provider !== expected)) return null
  const availability = entry.availability
  if (availability !== 'available' && availability !== 'unavailable' && availability !== 'unknown') return null
  if (typeof entry.enabled !== 'boolean' || typeof entry.available !== 'boolean' || entry.checked !== true) return null
  if (entry.available !== (entry.enabled && availability === 'available')) return null
  const profile = normalizeProviderExecutionProfile(entry.provider, entry.profile)
  if (!profile) return null
  return {
    provider: entry.provider,
    enabled: entry.enabled,
    available: entry.available,
    checked: true,
    checking: entry.checking === true,
    reason: typeof entry.reason === 'string' && entry.reason.trim() ? entry.reason.trim() : undefined,
    status: availability,
    profile,
    usage: entry.usage && typeof entry.usage === 'object' ? entry.usage as import('./types').Usage : undefined,
  }
}

function cleanString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function normalizeExecutionProfile(raw: unknown): ProviderExecutionProfile | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const row = raw as Record<string, unknown>
  const key = cleanString(row.key)
  if (!key) return null
  return {
    key,
    ...(cleanString(row.parentModel) ? { parentModel: cleanString(row.parentModel) } : {}),
    ...(cleanString(row.parentReasoning) ? { parentReasoning: cleanString(row.parentReasoning) } : {}),
    ...(cleanString(row.specialistModel) ? { specialistModel: cleanString(row.specialistModel) } : {}),
    ...(cleanString(row.specialistReasoning) ? { specialistReasoning: cleanString(row.specialistReasoning) } : {}),
  }
}

/** Validate a complete provider-owned execution profile. Claude's model is configurable, so its key is
 * checked relationally; Codex is a release contract and therefore must match every pinned field exactly. */
export function normalizeProviderExecutionProfile(provider: RunProvider, raw: unknown): ProviderExecutionProfile | null {
  const profile = normalizeExecutionProfile(raw)
  if (!profile?.parentModel || !profile.parentReasoning) return null
  if (provider === 'codex') {
    return JSON.stringify(profile) === JSON.stringify(CODEX_EXECUTION_PROFILE) ? profile : null
  }
  if (profile.parentReasoning !== 'default'
      || profile.key !== `claude:${profile.parentModel}:default`
      || profile.specialistModel !== undefined || profile.specialistReasoning !== undefined) return null
  return profile
}

/** The catalogue is valid only when the current endpoint proves both supported providers. Partial arrays,
 * old record-shaped responses, HTML fallbacks, and malformed rows return null so the caller blocks both. */
export function normalizeProvidersRead(raw: unknown): ProvidersRead | null {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as any).providers)) return null
  const rows = (raw as any).providers as unknown[]
  const normalized = rows.map((row) => normalizeProviderStatus(row))
  if (normalized.some((row) => row === null)) return null
  const claude = normalized.filter((row) => row?.provider === 'claude')
  const codex = normalized.filter((row) => row?.provider === 'codex')
  if (claude.length !== 1 || codex.length !== 1) return null
  return { claude: claude[0]!, codex: codex[0]!, catalogState: 'valid' }
}

/** Only a real HTTP 404 proves the provider endpoint predates this contract. A timeout, 5xx, auth error,
 * malformed body, or any other failure is current-but-unverified and must block both providers. */
export function providerCatalogForError(error: unknown): ProvidersRead {
  return (error as { status?: unknown } | null)?.status === 404
    ? providerCatalogFallback('Provider selection is unavailable on this older server. Claude only.')
    : providerCatalogUnknown('Provider selection could not be verified. Check again.')
}

/** Unknown status is retryable, not a permanently disabled choice. It still cannot launch until a fresh
 * check returns `available`; providerLaunchBlockedReason owns that stricter launch gate. */
export function providerIsBlocked(status: ProviderStatus | undefined): boolean {
  return !!status?.checked && (!status.enabled || (status.status !== 'unknown' && !status.available))
}


export function providerNeedsCheck(status: ProviderStatus | undefined): boolean {
  return !status?.checked || status.checking === true || status.status === 'unknown'
}

export function providerBlockedReason(status: ProviderStatus | undefined): string | null {
  if (!providerIsBlocked(status)) return null
  return status?.reason || (!status?.enabled ? 'Provider disabled on this server' : 'Provider unavailable')
}

/** Codex is a new wire contract, so unlike legacy Claude it may not launch until GET /api/providers has
 * proved the complete current catalogue. This closes the startup race for a persisted Codex preference:
 * an old server cannot receive that launch before its missing endpoint resets the choice to Claude. */
export function providerLaunchBlockedReason(status: ProviderStatus | undefined, catalogState?: ProvidersRead['catalogState']): string | null {
  if (status?.provider === 'codex' && (catalogState !== 'valid' || !status.checked)) {
    return 'Codex availability has not been verified by this server'
  }
  if (catalogState !== 'fallback' && (!status?.checked || status.checking || status.status === 'unknown')) {
    return `${providerLabel(status?.provider || 'claude')} availability is unknown — check again`
  }
  if (catalogState === 'valid' && (!status || !normalizeProviderExecutionProfile(status.provider, status.profile))) {
    return `${providerLabel(status?.provider || 'claude')} execution profile has not been verified`
  }
  return providerBlockedReason(status)
}

/** Freeze the exact execution profile selected by the user. Every paid request is derived from this one
 * value, so an await, catalogue refresh, or toggle cannot silently change model/reasoning mid-launch. */
export function freezeProviderLaunch(status: ProviderStatus | undefined, catalogState?: ProvidersRead['catalogState']): FrozenProviderLaunch | null {
  if (catalogState === 'fallback' && status?.provider === 'claude' && status.enabled && status.available) {
    return { provider: 'claude', legacyClaudeFallback: true }
  }
  if (catalogState !== 'valid' || providerLaunchBlockedReason(status, catalogState)) return null
  if (!status) return null
  const profile = normalizeProviderExecutionProfile(status.provider, status.profile)
  if (!profile) return null
  return {
    provider: status.provider,
    expectedProfileKey: profile.key,
    model: profile.parentModel,
    ...(profile.parentReasoning ? { reasoningLevel: profile.parentReasoning } : {}),
    executionProfile: profile,
  }
}

/** The exact CAS fields understood by every tracked launch/estimate route. Full executionProfile remains
 * client-side receipt truth; expectedProfileKey binds the server's complete versioned profile. */
export function providerLaunchFields(selection: FrozenProviderLaunch): {
  provider: RunProvider
  expectedProfileKey?: string
  model?: string
  reasoningLevel?: string
} {
  return {
    provider: selection.provider,
    ...(selection.expectedProfileKey ? { expectedProfileKey: selection.expectedProfileKey } : {}),
    ...(selection.model ? { model: selection.model } : {}),
    ...(selection.reasoningLevel ? { reasoningLevel: selection.reasoningLevel } : {}),
  }
}

/** A launch receipt is the server's acknowledgement of the provider it actually admitted.  New/current
 * contracts must echo it exactly.  The only missing-echo compatibility case is the positively identified
 * legacy catalogue fallback, whose sole enabled provider is Claude. */
export function launchProviderReceiptMatches(
  value: unknown,
  expected: FrozenProviderLaunch,
  catalogState?: ProvidersRead['catalogState'],
  launched = true,
): boolean {
  if (!launched) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, any>
  const receipts = [row, row.preflight, row.launch, row.launch?.preflight]
    .filter((candidate): candidate is Record<string, any> => !!candidate && typeof candidate === 'object' && !Array.isArray(candidate))
  const providerEchoes = receipts.map((candidate) => candidate.provider).filter((candidate) => candidate != null)
  if (providerEchoes.some((candidate) => !isRunProvider(candidate) || candidate !== expected.provider)) return false
  if (expected.legacyClaudeFallback && expected.provider === 'claude' && catalogState === 'fallback') return true
  if (!expected.expectedProfileKey || !expected.model || !expected.executionProfile) return false
  const expectedProfile = normalizeExecutionProfile(expected.executionProfile)
  if (!expectedProfile || !normalizeProviderExecutionProfile(expected.provider, expectedProfile)) return false

  // One exact preflight must not launder a contradictory echo elsewhere in the response. Every nested
  // field the server chose to emit is an assertion and therefore has to agree with the frozen selection.
  const contradictory = receipts.some((receipt) => {
    if (receipt.provider !== undefined && receipt.provider !== expected.provider) return true
    if (receipt.profileKey !== undefined && receipt.profileKey !== expected.expectedProfileKey) return true
    if (receipt.model !== undefined && receipt.model !== expected.model) return true
    if (receipt.reasoningLevel !== undefined && receipt.reasoningLevel !== expected.reasoningLevel) return true
    if (receipt.executionProfile !== undefined) {
      const profile = normalizeProviderExecutionProfile(expected.provider, receipt.executionProfile)
      if (!profile || JSON.stringify(profile) !== JSON.stringify(expectedProfile)) return true
    }
    return false
  })
  if (contradictory) return false

  return receipts.some((receipt) => {
    const profile = normalizeProviderExecutionProfile(expected.provider, receipt.executionProfile)
    return receipt.provider === expected.provider
      && receipt.profileKey === expected.expectedProfileKey
      && receipt.model === expected.model
      && (receipt.reasoningLevel ?? undefined) === (expected.reasoningLevel ?? undefined)
      && !!profile
      && JSON.stringify(profile) === JSON.stringify(expectedProfile)
  })
}

/** A tracked mutation may omit a receipt only when the server explicitly says it was already done. */
export function trackedLaunchResponseMatches(
  value: unknown,
  expected: FrozenProviderLaunch,
  catalogState: ProvidersRead['catalogState'],
  explicitlyAlready: boolean,
): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (explicitlyAlready) {
    const row = value as Record<string, any>
    const receipts = [row, row.preflight, row.launch, row.launch?.preflight]
      .filter((candidate): candidate is Record<string, any> => !!candidate && typeof candidate === 'object' && !Array.isArray(candidate))
    const asserted = receipts.some((receipt) => ['provider', 'executionProfile', 'profileKey', 'model', 'reasoningLevel']
      .some((field) => receipt[field] !== undefined))
    return !asserted || launchProviderReceiptMatches(value, expected, catalogState)
  }
  const runId = (value as Record<string, unknown>).runId
  return typeof runId === 'string' && runId.trim().length > 0
    && launchProviderReceiptMatches(value, expected, catalogState)
}

/** Event-to-research can be a synchronous note-only write or can start advisory analysis. If a launch is
 * present anywhere in the response it is no longer note-only and must carry a real id plus one exact,
 * contradiction-free receipt for the whole response. */
export function optionalNestedLaunchResponseMatches(
  value: unknown,
  expected: FrozenProviderLaunch,
  catalogState: ProvidersRead['catalogState'],
  requiresLaunch: boolean,
): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const launch = (value as Record<string, unknown>).launch
  const hasLaunch = !!launch && typeof launch === 'object' && !Array.isArray(launch)
  if (!hasLaunch) return !requiresLaunch
  const runId = (launch as Record<string, unknown>).runId
  return typeof runId === 'string' && !!runId.trim()
    && launchProviderReceiptMatches(value, expected, catalogState)
}

export function providerLabel(provider: RunProvider): string {
  return provider === 'codex' ? 'Codex' : 'Claude'
}

/** Manual resume is the one intentional mixed-provider boundary. Return copy only when the user must
 * explicitly acknowledge a provider change or an unattributed original attempt. */
export interface RecordedRunExecution {
  provider?: RunProvider
  executionProfile?: ProviderExecutionProfile
  source?: string
}

export type ResumeExecutionDisposition = 'exact' | 'unknown' | 'conflict' | 'provider-change' | 'profile-drift'

export function resumeExecutionDisposition(
  records: readonly RecordedRunExecution[],
  selected: FrozenProviderLaunch,
): { disposition: ResumeExecutionDisposition; recordedProvider?: RunProvider; recordedProfile?: ProviderExecutionProfile } {
  if (!records.length) return { disposition: 'unknown' }
  const declaredProviders = new Set(records.map((record) => record.provider).filter(isRunProvider))
  if (declaredProviders.size > 1) return { disposition: 'conflict' }

  const normalized = records.map((record) => {
    if (!record.provider) return null
    const profile = normalizeProviderExecutionProfile(record.provider, record.executionProfile)
    return profile ? { provider: record.provider, profile } : null
  })
  // Every authority supplied for this resume must carry an exact profile. This makes a rolling-deploy
  // omission explicit to a person and prevents automatic continuation from guessing.
  if (normalized.some((record) => record === null)) return { disposition: 'unknown', recordedProvider: declaredProviders.values().next().value }
  const exact = normalized as { provider: RunProvider; profile: ProviderExecutionProfile }[]
  const profileKeys = new Set(exact.map((record) => JSON.stringify(record.profile)))
  if (profileKeys.size > 1) return { disposition: 'conflict', recordedProvider: exact[0]?.provider }
  const recorded = exact[0]
  if (!recorded) return { disposition: 'unknown' }
  if (recorded.provider !== selected.provider) {
    return { disposition: 'provider-change', recordedProvider: recorded.provider, recordedProfile: recorded.profile }
  }
  const selectedProfile = normalizeProviderExecutionProfile(selected.provider, selected.executionProfile)
  if (!selectedProfile) return { disposition: 'unknown', recordedProvider: recorded.provider, recordedProfile: recorded.profile }
  if (JSON.stringify(recorded.profile) !== JSON.stringify(selectedProfile)) {
    return { disposition: 'profile-drift', recordedProvider: recorded.provider, recordedProfile: recorded.profile }
  }
  return { disposition: 'exact', recordedProvider: recorded.provider, recordedProfile: recorded.profile }
}

export function automaticResumeMatches(records: readonly RecordedRunExecution[], selected: FrozenProviderLaunch): boolean {
  return resumeExecutionDisposition(records, selected).disposition === 'exact'
}

export function manualResumeConfirmation(records: readonly RecordedRunExecution[], selected: FrozenProviderLaunch): string | null {
  const result = resumeExecutionDisposition(records, selected)
  if (result.disposition === 'exact') return null
  const selectedLabel = providerLabel(selected.provider)
  if (result.disposition === 'conflict') {
    return `The saved provider/profile records for this run disagree. Resume with ${selectedLabel}? The continuation will be recorded as mixed or partially observed.`
  }
  if (result.disposition === 'unknown') {
    return `This run's original exact provider/profile is unknown. Resume with ${selectedLabel}? The continuation will be recorded as potentially mixed-provider.`
  }
  if (result.disposition === 'profile-drift') {
    return `This run used ${result.recordedProfile?.key || providerLabel(result.recordedProvider || selected.provider)}, but ${selectedLabel} is now configured as ${selected.expectedProfileKey || 'an unverified profile'}. Resume with the new profile? The continuation will be recorded as mixed-profile.`
  }
  return `Resume this ${providerLabel(result.recordedProvider!)} run with ${selectedLabel}? The completed run will be recorded as Mixed (${providerLabel(result.recordedProvider!)} → ${selectedLabel}).`
}

/** A missing subscription utilization is an absence, never zero usage. Kept pure so every meter can
 * share the same fail-honest rule without needing to render a component in tests. */
export function providerUsagePercentText(utilization: number | undefined): string | null {
  if (utilization == null || !Number.isFinite(utilization)) return null
  return `${Math.round(Math.max(0, Math.min(1, utilization)) * 100)}%`
}

export function providerUsageUnavailableText(usage: Pick<import('./types').Usage, 'checked' | 'utilization'> | null | undefined): string | null {
  if (!usage?.checked) return 'not checked'
  return providerUsagePercentText(usage.utilization) === null ? 'Usage unavailable' : null
}

export function executionProfileLabel(status: ProviderStatus | undefined): string {
  const p = status?.profile
  if (!p) return providerLabel(status?.provider || 'claude')
  if (p.parentModel && p.specialistModel && p.parentModel !== p.specialistModel) {
    return `${p.parentModel}${p.parentReasoning ? ` ${p.parentReasoning}` : ''} · ${p.specialistModel}${p.specialistReasoning ? ` ${p.specialistReasoning}` : ''}`
  }
  return `${p.parentModel || p.key}${p.parentReasoning ? ` ${p.parentReasoning}` : ''}`
}
