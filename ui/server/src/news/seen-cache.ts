// Cross-cycle memory of articles we've already triaged, keyed by the screener event_id. Two payoffs:
//   - cost: a Groq score is never paid twice for the same story (cached items cost 0 tokens);
//   - churn: an article already inboxed isn't re-added on the next overlapping look-back window.
// It lives in the engine STATE_DIR (survives restarts, gitignored). Entries older than the TTL are
// pruned on load so the file can't grow without bound. This is a cost/dedup optimisation, not the
// authoritative dedup — the events ledger (Phase 0.1) remains the source of truth for processed signals.

import fs from 'node:fs'
import path from 'node:path'

// Cover the longest configured source redelivery window (gov-data is 21 days). A durable firehose row
// must not be paid for or appended again merely because a source legitimately replays it a week later.
const TTL_MS = 30 * 24 * 60 * 60 * 1000

interface Entry { score: number; ts: number }

export class SeenCache {
  private map = new Map<string, Entry>()
  constructor(private file: string) {}

  static load(stateDir: string): SeenCache {
    const c = new SeenCache(path.join(stateDir, 'news-seen.json'))
    try {
      const raw = JSON.parse(fs.readFileSync(c.file, 'utf8')) as Record<string, Entry>
      const now = Date.now()
      for (const [k, v] of Object.entries(raw)) {
        if (v && typeof v.ts === 'number' && now - v.ts < TTL_MS) c.map.set(k, v)
      }
    } catch {
      // missing/corrupt cache is fine — start empty
    }
    return c
  }

  has(eventId: string): boolean {
    return this.map.has(eventId)
  }

  add(eventId: string, score: number): void {
    this.map.set(eventId, { score, ts: Date.now() })
  }

  save(): boolean {
    const dirPath = path.dirname(this.file)
    const tmp = `${this.file}.tmp`
    let fd: number | undefined
    try {
      fs.mkdirSync(dirPath, { recursive: true })
      const obj: Record<string, Entry> = {}
      for (const [k, v] of this.map) obj[k] = v
      fd = fs.openSync(tmp, 'w', 0o600)
      fs.writeFileSync(fd, `${JSON.stringify(obj)}\n`)
      fs.fsyncSync(fd)
      fs.closeSync(fd)
      fd = undefined
      fs.renameSync(tmp, this.file)
      const dir = fs.openSync(dirPath, 'r')
      try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
      return true
    } catch {
      if (fd !== undefined) try { fs.closeSync(fd) } catch { /* best effort */ }
      try { fs.rmSync(tmp, { force: true }) } catch { /* best effort */ }
      return false
    }
  }

  get size(): number {
    return this.map.size
  }
}
