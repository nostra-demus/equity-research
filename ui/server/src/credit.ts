import type { RunProvider } from './providers/types'
import type { CreditPreflight } from './types'

// Last-known plan-usage / rate-limit status, learned passively from any run's rate_limit_event
// (free — no extra spend) and refreshed actively by /api/credit-check. The CLI reports the currently
// BINDING window per call, so we also accumulate each window we've seen into `windows`.
const statuses = new Map<RunProvider, CreditPreflight>()
const windows = new Map<RunProvider, Record<string, { utilization?: number; resetsAt?: number; status?: string; isUsingOverage?: boolean }>>()

export function getCreditStatus(provider: RunProvider = 'claude'): CreditPreflight {
  const status = statuses.get(provider) ?? { ok: true, checked: false }
  return { ...status, windows: { ...(windows.get(provider) ?? {}) } }
}

export function setCreditStatus(s: CreditPreflight, provider: RunProvider = 'claude') {
  statuses.set(provider, s)
  const providerWindows = windows.get(provider) ?? {}
  for (const [name, window] of Object.entries(s.windows ?? {})) {
    providerWindows[name] = { ...providerWindows[name], ...window }
  }
  if (s.rateLimitType) {
    providerWindows[s.rateLimitType] = { utilization: s.utilization, resetsAt: s.resetsAt, status: s.status, isUsingOverage: s.isUsingOverage }
  }
  if (Object.keys(providerWindows).length > 0) windows.set(provider, providerWindows)
}
