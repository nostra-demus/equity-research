import type { CreditPreflight } from './types'

// Last-known credit / rate-limit status, learned passively from any run's rate_limit_event
// (free — no extra spend) and refreshed actively by /api/credit-check.
let status: CreditPreflight = { ok: true, checked: false }

export function getCreditStatus(): CreditPreflight {
  return status
}

export function setCreditStatus(s: CreditPreflight) {
  status = s
}
