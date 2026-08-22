import type { ProviderAdapter, ProviderProfile, RunProvider } from './types'

const adapters = new Map<RunProvider, ProviderAdapter>()

export function registerProviderAdapter(adapter: ProviderAdapter): void {
  const current = adapters.get(adapter.profile.provider)
  if (current && current !== adapter) throw new Error(`Provider adapter '${adapter.profile.provider}' is already registered`)
  adapters.set(adapter.profile.provider, adapter)
}

export function getProviderAdapter(provider: RunProvider): ProviderAdapter {
  const adapter = adapters.get(provider)
  if (!adapter) {
    const error: any = new Error(`Provider '${provider}' is not installed in this cockpit runtime.`)
    error.statusCode = 503
    error.code = 'PROVIDER_NOT_INSTALLED'
    throw error
  }
  return adapter
}

export function listProviderAdapters(): ProviderAdapter[] {
  return [...adapters.values()]
}

export function listProviderProfiles(): ProviderProfile[] {
  return listProviderAdapters().map((adapter) => adapter.profile)
}

export function isRunProvider(value: unknown): value is RunProvider {
  return value === 'claude' || value === 'codex'
}

/** Subscription-provider rollout gate. Claude is the established runtime; Codex is fail-closed until
 * the operator explicitly opts this server process in with ENGINE_CODEX_ENABLED=1. */
export function isProviderEnabled(
  provider: RunProvider,
  env: NodeJS.ProcessEnv = process.env,
  scope: 'normal' | 'provider-parity' = 'normal',
): boolean {
  return provider === 'claude'
    || env.ENGINE_CODEX_ENABLED === '1'
    || (scope === 'provider-parity' && env.ENGINE_PROVIDER_PARITY_ENABLED === '1')
}

export function providerDisabledReason(provider: RunProvider): string | undefined {
  return isProviderEnabled(provider)
    ? undefined
    : 'Codex runs are disabled on this cockpit server. Set ENGINE_CODEX_ENABLED=1 and restart the server to enable them.'
}
