// Which runs belong to what you're looking at, and is anything actually in flight.
//
// Extracted so the Activity dock's shell (which decides when to pop open and whether closing is allowed)
// and the live section inside it (which draws the cards) read the SAME set. When these two disagreed the
// dock could pin itself open over an empty list, or offer a close button while a run was still streaming.

// Typed structurally (not against the store's ActiveRun) so this stays a leaf module the store itself can
// import without a cycle. Only the fields the scoping actually reads are named.
type ScopedRun = { ticker: string; status: string; startedAt?: number }
type ScopedPending = { ticker: string } | null | undefined

/** Every in-flight server status, including the pre-spawn gate phases an early-acked launch surfaces —
 *  a gate-parked run is still live: it keeps its card, its Cancel, and its progress bar. */
export const LIVEISH: ReadonlySet<string> = new Set(['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'])

/** The runs for the current scope (live + just-finished), oldest first. Research keys on the selected
 *  company; a flow swarm's unit of work is a signal or a sweep, whose `ticker` is a SIG- id or the literal
 *  'sweep' — filtering those by the research `selectedTicker` would hide a running scan entirely. */
export function runsForScope<T extends ScopedRun>(activeRuns: Record<string, T>, activeSwarm: string, ticker: string | null): T[] {
  return Object.values(activeRuns)
    .filter((r) => (activeSwarm === 'screener' ? r.ticker === 'sweep' || r.ticker.startsWith('SIG-') : r.ticker === ticker))
    .sort((a, b) => (a.startedAt ?? 0) - (b.startedAt ?? 0))
}

/** A launch fired for THIS subject whose server ack hasn't landed yet — so the dock opens in the same frame
 *  as the click instead of staying silent while the request is in flight. */
export function pendingForScope(launchPending: ScopedPending, activeSwarm: string, ticker: string | null): boolean {
  return !!launchPending && (launchPending.ticker === ticker || activeSwarm !== 'research')
}

/** Is anything actually in flight right now? Drives the auto-open, and gates the close button (a live run
 *  keeps the dock pinned so progress stays visible). */
export function anyLive(runs: ScopedRun[], pending: boolean): boolean {
  return runs.some((r) => LIVEISH.has(r.status)) || pending
}
