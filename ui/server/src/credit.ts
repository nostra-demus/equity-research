import type { CreditPreflight } from './types'

// Last-known plan-usage / rate-limit status, learned passively from any run's rate_limit_event
// (free — no extra spend) and refreshed actively by /api/credit-check. The CLI reports the currently
// BINDING window per call, so we also accumulate each window we've seen into `windows`.
let status: CreditPreflight = { ok: true, checked: false }
const windows: Record<string, { utilization?: number; resetsAt?: number; status?: string; isUsingOverage?: boolean }> = {}

export function getCreditStatus(): CreditPreflight {
  return { ...status, windows: { ...windows } }
}

export function setCreditStatus(s: CreditPreflight) {
  status = s
  if (s.rateLimitType) {
    windows[s.rateLimitType] = { utilization: s.utilization, resetsAt: s.resetsAt, status: s.status, isUsingOverage: s.isUsingOverage }
  }
}
