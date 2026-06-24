import fs from 'node:fs'
import path from 'node:path'

// Single-instance lock — one named long-running job per state dir, across processes.
//
// Two engines pointed at the SAME ENGINE_STATE_DIR (a stray manual start, a wrong-port instance, a
// duplicated deploy) would otherwise BOTH run the news ingester AND the resume supervisor — doubling
// every fetch/relaunch and racing every write (the 2026-06-20 ":8799" incident: a forgotten manual
// instance double-loaded the machine for ~2 days). This is the atomic PID lock that prevents it,
// generalized from the ingester's original lock so the resume supervisor reuses the exact same proven
// path (a different lock FILE per job, so the ingester and the supervisor never block each other).
//
// Returns true iff THIS process now owns `lockFile`. FAILS OPEN: any unexpected fs error returns true,
// so the guard can never stop the legitimate sole engine from doing its job — it returns false ONLY
// when it positively confirms another LIVE owner. A crashed holder leaves a stale lock the next start
// steals via the PID-liveness check (a SIGTERM/SIGKILL never fires the clean-exit release).
export function acquireSingletonLock(stateDir: string, lockFile: string): boolean {
  const fp = path.join(stateDir, lockFile)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      fs.mkdirSync(stateDir, { recursive: true })
      const fd = fs.openSync(fp, 'wx') // atomic create-exclusive: win the race, or throw EEXIST
      try { fs.writeSync(fd, String(process.pid)) } finally { fs.closeSync(fd) }
      return true
    } catch (e: any) {
      if (e?.code !== 'EEXIST') return true // unexpected fs error → never block the sole engine
      let holder = 0
      try { holder = parseInt(fs.readFileSync(fp, 'utf8').trim(), 10) || 0 } catch { /* unreadable */ }
      if (holder === process.pid) return true // re-entrant: we already own it
      if (holder > 0) {
        let alive = false
        try { process.kill(holder, 0); alive = true } catch (err: any) { alive = err?.code === 'EPERM' } // EPERM = exists, not ours
        if (alive) return false // another LIVE engine owns this job for this state dir
      }
      try { fs.unlinkSync(fp) } catch { /* cleared elsewhere */ } // stale (dead/zero/unreadable) → drop, retry create
    }
  }
  return true // couldn't prove a live owner after stealing a stale lock → fail open
}

// Best-effort release of OUR lock (clean exit only). A crash leaves a stale lock that the next start
// steals via acquireSingletonLock's liveness check, so this is a courtesy, not a correctness requirement.
export function releaseSingletonLock(stateDir: string, lockFile: string): void {
  const fp = path.join(stateDir, lockFile)
  try { if (fs.readFileSync(fp, 'utf8').trim() === String(process.pid)) fs.unlinkSync(fp) } catch { /* nothing to release */ }
}
