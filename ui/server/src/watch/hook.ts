// A one-way nudge from the run supervisor to the watchlist monitor: "a research run just finished". Kept as
// its own tiny module so launcher.ts never imports the monitor (and everything the monitor imports). The
// monitor does not trust the nudge for anything — it re-reads the published calls itself — so a missed or
// duplicate nudge only changes WHEN the next check happens, never what it finds.
export interface FinishedRun { runId: string; ticker: string; kind: string; swarmId: string }

type Listener = (run: FinishedRun) => void
const listeners = new Set<Listener>()

export function onFinishedRun(fn: Listener): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export function nudgeWatchlistAfterRun(run: FinishedRun): void {
  for (const fn of listeners) {
    try { fn(run) } catch { /* a listener failure must never reach the run supervisor */ }
  }
}
