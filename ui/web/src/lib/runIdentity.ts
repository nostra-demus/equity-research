import {
  isRunProvider,
  normalizeProviderExecutionProfile,
  type ProviderExecutionProfile,
  type RunProvider,
} from './provider'

export interface ImmutableRunIdentity {
  runId: string
  ticker: string
  swarmId: string
  kind?: string
  continuation?: boolean
  module?: string
  agent?: string
  runRoot?: string | null
  provider?: RunProvider
  executionProfile?: ProviderExecutionProfile
  profileKey?: string
  model?: string
  reasoningLevel?: string
  chainId?: string
  executionEpoch?: string
}

const text = (value: unknown): string | undefined => typeof value === 'string' && value.trim() ? value.trim() : undefined
const own = (row: Record<string, unknown>, key: string): boolean => Object.prototype.hasOwnProperty.call(row, key)
const sameProfile = (a: ProviderExecutionProfile | undefined, b: ProviderExecutionProfile | undefined): boolean =>
  a === b || (!!a && !!b && JSON.stringify(a) === JSON.stringify(b))

/**
 * Reconcile one snapshot/SSE assertion into an already adopted run identity. Identity fields are
 * write-once: an omitted field means "no new assertion", while any contradictory or malformed assertion
 * rejects the entire frame. A profile assertion is accepted only as the complete provider-owned profile
 * plus its scalar aliases, so one good nested object cannot launder a contradictory model or key.
 */
export function reconcileRunIdentity<T extends ImmutableRunIdentity>(existing: T, incoming: unknown): T | null {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return null
  const row = incoming as Record<string, unknown>
  if (text(row.runId) !== existing.runId) return null

  const next: ImmutableRunIdentity = { ...existing }
  const immutableText: (keyof Pick<ImmutableRunIdentity, 'ticker' | 'swarmId' | 'chainId' | 'executionEpoch'>)[] = [
    'ticker', 'swarmId', 'chainId', 'executionEpoch',
  ]
  for (const key of immutableText) {
    if (!own(row, key)) continue
    const value = text(row[key])
    if (!value || (existing[key] !== undefined && existing[key] !== value)) return null
    ;(next as any)[key] = value
  }
  if (own(row, 'continuation')) {
    if (typeof row.continuation !== 'boolean'
        || (existing.continuation !== undefined && existing.continuation !== row.continuation)) return null
    next.continuation = row.continuation
  }
  if (own(row, 'runRoot')) {
    // null means the supervisor has not allocated/published a folder yet; it is not an identity value.
    if (row.runRoot !== null) {
      const value = text(row.runRoot)
      if (!value || (existing.runRoot != null && existing.runRoot !== value)) return null
      next.runRoot = value
    }
  }

  const assertedProvider = own(row, 'provider') ? row.provider : undefined
  if (assertedProvider !== undefined && !isRunProvider(assertedProvider)) return null
  const provider = assertedProvider as RunProvider | undefined
  if (provider && existing.provider && provider !== existing.provider) return null
  if (provider) next.provider = provider

  const profileFields = ['executionProfile', 'profileKey', 'model', 'reasoningLevel'] as const
  const assertsProfile = profileFields.some((key) => own(row, key))
  if (assertsProfile) {
    const effectiveProvider = provider || existing.provider
    const rawProfile = own(row, 'executionProfile') ? row.executionProfile : existing.executionProfile
    const profile = effectiveProvider ? normalizeProviderExecutionProfile(effectiveProvider, rawProfile) : null
    const profileKey = own(row, 'profileKey') ? text(row.profileKey) : existing.profileKey
    const model = own(row, 'model') ? text(row.model) : existing.model
    const reasoning = own(row, 'reasoningLevel') ? text(row.reasoningLevel) : existing.reasoningLevel
    if (!effectiveProvider || !profile || !profileKey || !model || !reasoning
        || profile.key !== profileKey || profile.parentModel !== model || profile.parentReasoning !== reasoning) return null
    if (existing.executionProfile && !sameProfile(existing.executionProfile, profile)) return null
    if (existing.profileKey !== undefined && existing.profileKey !== profileKey) return null
    if (existing.model !== undefined && existing.model !== model) return null
    if (existing.reasoningLevel !== undefined && existing.reasoningLevel !== reasoning) return null
    next.provider = effectiveProvider
    next.executionProfile = profile
    next.profileKey = profileKey
    next.model = model
    next.reasoningLevel = reasoning
  }

  return next as T
}

/** A reconnect snapshot must prove the stream, subject and swarm it is about before any orb is painted. */
export function normalizeRunSnapshotIdentity(
  snapshot: unknown,
  expected: { runId: string; ticker: string; swarmId: string; existing?: ImmutableRunIdentity },
): ImmutableRunIdentity | null {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return null
  const row = snapshot as Record<string, unknown>
  if (text(row.runId) !== expected.runId || text(row.ticker) !== expected.ticker || text(row.swarmId) !== expected.swarmId) return null
  const kind = text(row.kind)
  if (!kind) return null
  const base: ImmutableRunIdentity = expected.existing || {
    runId: expected.runId,
    ticker: expected.ticker,
    swarmId: expected.swarmId,
    kind,
  }
  return reconcileRunIdentity(base, row)
}

/** EventSource listeners are bound to one URL. Ignore a malformed/cross-run frame before dispatch. */
export function sseFrameForRun(value: unknown, runId: string, allowedTypes: readonly string[]): value is { runId: string; type: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return text(row.runId) === runId && typeof row.type === 'string' && allowedTypes.includes(row.type)
}
