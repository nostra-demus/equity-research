import type { CallSummary } from './types'

type CallRow = CallSummary | null | undefined

function newestFirst(a: CallRow, b: CallRow): number {
  const ad = typeof a?.decision_date === 'string' ? a.decision_date : ''
  const bd = typeof b?.decision_date === 'string' ? b.decision_date : ''
  if (ad !== bd) return ad < bd ? 1 : -1
  const ar = typeof a?.run_root === 'string' ? a.run_root : ''
  const br = typeof b?.run_root === 'string' ? b.run_root : ''
  return br.localeCompare(ar)
}

/** One current published call per ticker; the complete dated ledger remains available as History. */
export function currentCalls(calls: readonly CallRow[] | null | undefined): CallSummary[] {
  const newest = new Map<string, CallSummary>()
  if (!Array.isArray(calls)) return []
  for (const call of calls) {
    if (!call || typeof call !== 'object') continue
    const ticker = typeof call.ticker === 'string' ? call.ticker.trim().toUpperCase() : ''
    if (!ticker) continue
    const prior = newest.get(ticker)
    if (!prior || newestFirst(call, prior) < 0) newest.set(ticker, call)
  }
  return [...newest.values()].sort(newestFirst)
}
