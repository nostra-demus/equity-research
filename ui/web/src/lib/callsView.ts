import type { CallSummary } from './types'

function newestFirst(a: CallSummary, b: CallSummary): number {
  const ad = a.decision_date || ''
  const bd = b.decision_date || ''
  if (ad !== bd) return ad < bd ? 1 : -1
  return b.run_root.localeCompare(a.run_root)
}

/** One current published call per ticker; the complete dated ledger remains available as History. */
export function currentCalls(calls: CallSummary[]): CallSummary[] {
  const newest = new Map<string, CallSummary>()
  for (const call of calls) {
    const ticker = call.ticker.trim().toUpperCase()
    if (!ticker) continue
    const prior = newest.get(ticker)
    if (!prior || newestFirst(call, prior) < 0) newest.set(ticker, call)
  }
  return [...newest.values()].sort(newestFirst)
}
