// The pure tier-meter helper for the Pipeline diagnostics panel — kept in a React/CSS-free module so it is
// unit-testable (mirrors ReviewFilters.ts / reviewFilters.test.ts). PipelineDiagnostics.tsx imports tierMeter.

import type { TierDiagnostics } from '../../lib/types'

const kfmt = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(Math.round(n)))

/** Which of a tier's two budget dimensions to show — whichever is closer to its cap (the binding one), so the
 *  bar tells the truth (a flaky day can burn the request cap while tokens stay tiny). $-metered tiers show $.
 *  A dimension the tier does NOT have (no cap) is scored -1 so it never wins the "closer to cap" compare — this
 *  is what lets a token-gated tier (tokenCap, no reqCap) report tokens even while idle, per the tokenCap contract
 *  ("set only for token-gated providers … its binding limit", TierDiagnostics.tokenCap / scheduler.ts). */
export function tierMeter(t: TierDiagnostics): { label: string; frac: number } {
  if (t.meter === 'usd') {
    const used = t.usdToday ?? 0
    const cap = t.usdCap ?? 0
    return { label: `$${used.toFixed(2)} / $${kfmt(cap)}`, frac: cap > 0 ? Math.min(1, used / cap) : 0 }
  }
  // Unlimited tier (the LOCAL primary brain): no reqCap AND no tokenCap → there is nothing to meter against.
  // Show the raw live counts (tokens + requests processed today) and signal "no bar" with frac -1, so the panel
  // renders an "∞ no cap" affordance instead of a misleading "/0 req" bar.
  if (!t.reqCap && !t.tokenCap) {
    return { label: `${kfmt(t.tokensToday ?? 0)} tok · ${kfmt(t.requestsToday ?? 0)} req`, frac: -1 }
  }
  const reqFrac = t.reqCap ? (t.requestsToday ?? 0) / t.reqCap : -1
  const tokFrac = t.tokenCap ? (t.tokensToday ?? 0) / t.tokenCap : -1
  if (tokFrac > reqFrac) return { label: `${kfmt(t.tokensToday ?? 0)}/${kfmt(t.tokenCap ?? 0)} tok`, frac: Math.min(1, tokFrac) }
  return { label: `${kfmt(t.requestsToday ?? 0)}/${kfmt(t.reqCap ?? 0)} req`, frac: Math.min(1, Math.max(0, reqFrac)) }
}
