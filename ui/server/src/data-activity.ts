// Tracks recent Google-Drive-mount activity per ticker so the cockpit can show a live "syncing…" state
// instead of a silent file count. The data/ folder is a Drive CloudStorage mount: after an upload, files
// materialize locally over seconds-to-minutes, so the engine's local count climbs from 0. When the
// fs-watcher sees adds/removes we stamp the ticker here; listTickers reports `syncing` while changes are
// recent, and the count keeps climbing live. The engine cannot see un-synced cloud files, so "syncing"
// means "files are actively arriving/changing now", which is the honest, observable signal.

interface Activity {
  at: number // last change (epoch ms)
  adds: number // cumulative add events seen this process
  removes: number
}

const byTicker = new Map<string, Activity>()

// how long after the last change we still call it "syncing" (Drive materializes in bursts)
export const SYNC_WINDOW_MS = 25_000

export function recordDataChange(ticker: string, change: 'added' | 'removed'): void {
  const cur = byTicker.get(ticker) || { at: 0, adds: 0, removes: 0 }
  byTicker.set(ticker, {
    at: Date.now(),
    adds: cur.adds + (change === 'added' ? 1 : 0),
    removes: cur.removes + (change === 'removed' ? 1 : 0),
  })
}

export function syncingState(ticker: string): { syncing: boolean; lastChangeAt: number | null } {
  const e = byTicker.get(ticker)
  if (!e) return { syncing: false, lastChangeAt: null }
  return { syncing: Date.now() - e.at < SYNC_WINDOW_MS, lastChangeAt: e.at }
}

// is ANY ticker syncing right now? (lets the UI know to keep polling counts)
export function anySyncing(): boolean {
  const now = Date.now()
  for (const e of byTicker.values()) if (now - e.at < SYNC_WINDOW_MS) return true
  return false
}
