// Company-news bridge — the 12-HOURLY BATCH mode.
//
// The wire already scans all day, scores every event, and dedupes syndicated copies. research-bridge.ts
// already turns ONE event into ONE pool note (`data/<TICKER>/screener_event_<EVENT_ID>.md`, tier 10) with
// two-level dedup + an audit ledger, and the doc-intake machinery already reacts to a note landing. What
// was missing is the trigger between them: a periodic sweep that routes the events a covered subject
// accumulated since the last window, instead of per-item streaming (SCREENER_RESEARCH_BRIDGE=1, which
// ships off) or nothing at all.
//
// WHY BATCH, NOT PER-ITEM: two windows a day cap the follow-up analysis at <=2 cheap runs per subject per
// day, and a quiet window costs nothing (no notes, no analysis, no dock nag). The MANUAL "Send to
// research" menu remains the fast lane for anything that should not wait for a window — same notes, same
// dedup, no score floor (the human click IS the judgment, research-bridge.ts's stated design).
//
// WHY IN-SERVER (not a connector fetch.py): scripts/run_connectors.py is the sole connector fetcher, and
// the repair watchdog treats a connector whose LATEST ledger decision is `failed` as broken source code
// and hands it to the auto-repair PR loop. A connector whose "fetch" is an HTTP self-call would post a
// `failed` row every time the cockpit happened to be down — pointing the repair loop at a fetcher that is
// perfectly fine. So this rides the same in-server scheduled-loop pattern as news/scheduler.ts: one
// unref'd interval, singleton-locked per state dir, that can never keep the process alive on its own.
//
// DUPLICATES ARE A NON-EVENT, IN BOTH DIRECTIONS: the note filename IS the event id, and
// bridgeEventToSubject() checks the file, then the syndicated-story cluster, before writing. So
// batch-then-manual, manual-then-batch, another outlet's copy of the same story, and two engines sweeping
// the same pool all converge on "the note is already there" — no second file, and (because the follow-up
// analysis is gated on FRESH notes only) no second analysis.

import fs from 'node:fs'
import path from 'node:path'
import { isReservedDataFolder } from './config'
import { readFeed } from './news/feed'
import type { FeedItem } from './news/types'
import { bridgeEventToSubject, matchTrackedSubjects } from './research-bridge'
import { isValidTicker } from './sandbox'

export const CURSOR_FILE = 'research-bridge-cursor.json'

/** Per-subject knobs. The ENABLED SET is not here — it is the connector manifest's `subjects` array (one
 *  source of truth); this file only tunes how selective the sweep is for a name that is already enabled. */
export interface BridgeBatchConfig {
  /** default triage-score floor when a subject has no override (research-bridge's own default is 60) */
  minScore: number
  /** per-subject floor override — a high-flow name (TSLA) can demand a higher bar than a quiet one */
  minScoreBySubject: Record<string, number>
  /** how far back a NEWLY enabled subject may reach on its first sweep (it has no cursor yet). Without
   *  this, switching a name on would dump every archived story it ever appeared in into its pool. */
  backfillHours: number
}

export const DEFAULT_BATCH_CONFIG: BridgeBatchConfig = { minScore: 60, minScoreBySubject: {}, backfillHours: 48 }

/** Read + fail-closed-validate the config sidecar. Anything malformed falls back to the defaults: a
 *  broken config must never silently WIDEN what gets routed. */
export function readBatchConfig(filePath: string): BridgeBatchConfig {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_BATCH_CONFIG
    const num = (v: unknown, d: number, lo: number, hi: number) =>
      (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d)
    const bySubject: Record<string, number> = {}
    const rawBy = raw.min_score_by_subject
    if (rawBy && typeof rawBy === 'object' && !Array.isArray(rawBy)) {
      for (const [k, v] of Object.entries(rawBy)) {
        if (isValidTicker(k) && !isReservedDataFolder(k)) bySubject[k] = num(v, DEFAULT_BATCH_CONFIG.minScore, 0, 100)
      }
    }
    return {
      minScore: num(raw.min_score, DEFAULT_BATCH_CONFIG.minScore, 0, 100),
      minScoreBySubject: bySubject,
      backfillHours: num(raw.backfill_hours, DEFAULT_BATCH_CONFIG.backfillHours, 1, 24 * 30),
    }
  } catch {
    return DEFAULT_BATCH_CONFIG
  }
}

/** The enabled set: the connector manifest's `subjects` array, filtered to subjects that really have a
 *  pool. Reading it from the manifest (not a second list) is what keeps the Data Library row and the
 *  sweep from ever disagreeing about which names are covered. */
export function enabledSubjects(manifestPath: string, dataDir: string): string[] {
  let raw: any
  try { raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) } catch { return [] }
  const list = Array.isArray(raw?.subjects) ? raw.subjects : []
  const out: string[] = []
  for (const s of list) {
    // dataDir is passed through: the reservation check resolves the archive folder against the pool it is
    // actually reading, so a test (or a custom ENGINE_DATA_DIR) is judged against ITS pool, not the global
    // one (Gemini #359 r3673576795).
    if (typeof s !== 'string' || !isValidTicker(s) || isReservedDataFolder(s, dataDir)) continue
    try { if (fs.statSync(path.join(dataDir, s)).isDirectory()) out.push(s) } catch { /* no pool → not covered */ }
  }
  return [...new Set(out)].sort()
}

// ---- cursors ----------------------------------------------------------------------------------------
// PER SUBJECT, never global: enabling a new name in wave 2 must not replay every other subject's window,
// and must not silently inherit a cursor that makes its own first sweep see nothing.

export type Cursors = Record<string, string> // ticker → ISO timestamp of the last swept item

export function readCursors(stateDir: string): Cursors {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(stateDir, CURSOR_FILE), 'utf8'))
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const out: Cursors = {}
    for (const [k, v] of Object.entries(raw)) if (typeof v === 'string' && !Number.isNaN(Date.parse(v))) out[k] = v
    return out
  } catch {
    return {}
  }
}

export function writeCursors(stateDir: string, cursors: Cursors): void {
  fs.mkdirSync(stateDir, { recursive: true })
  const fp = path.join(stateDir, CURSOR_FILE)
  const tmp = `${fp}.tmp.${process.pid}.${Math.random().toString(36).slice(2)}`
  try {
    fs.writeFileSync(tmp, JSON.stringify(cursors, null, 2))
    fs.renameSync(tmp, fp)
  } finally {
    try { fs.unlinkSync(tmp) } catch { /* renamed away — the normal case */ }
  }
}

// ---- eligibility ------------------------------------------------------------------------------------

/** Is this item eligible to enter THIS subject's pool unattended? Deliberately the same shape as
 *  research-bridge's shouldAutoBridge, minus the env flag (mode is the caller's decision) and with a
 *  per-subject floor. Social chatter and caution-flagged items never seed an evidence pool; only
 *  `material` relevance qualifies; the score floor is the last gate. */
export function eligibleFor(item: FeedItem, subject: string, cfg: BridgeBatchConfig): boolean {
  if (!item || item.caution) return false
  if (item.source_tier === 'social') return false
  if (item.relevance !== 'material') return false
  const floor = Object.prototype.hasOwnProperty.call(cfg.minScoreBySubject, subject)
    ? cfg.minScoreBySubject[subject]
    : cfg.minScore
  return (item.triage_score ?? 0) >= floor
}

// ---- accumulated notes (the "how much has landed" read) ---------------------------------------------

/** How many routed event notes a subject's pool currently holds, and when the newest one landed. Counts
 *  the notes on DISK (the durable truth) rather than a running tally, so it survives restarts and stays
 *  right if a note is deleted by hand. Powers GET /api/bridge/status — and the cockpit indicator. */
export function accumulatedFor(dataDir: string, subject: string): { notes: number; newestAt: string | null } {
  const dir = path.join(dataDir, subject)
  let names: string[] = []
  try { names = fs.readdirSync(dir) } catch { return { notes: 0, newestAt: null } }
  let notes = 0
  let newestMs = 0
  for (const n of names) {
    if (!/^screener_event_EVT-[0-9a-f]{12}\.md$/.test(n)) continue
    notes++
    try {
      const ms = fs.statSync(path.join(dir, n)).mtimeMs
      if (ms > newestMs) newestMs = ms
    } catch { /* vanished mid-scan */ }
  }
  return { notes, newestAt: newestMs ? new Date(newestMs).toISOString() : null }
}

// ---- the sweep --------------------------------------------------------------------------------------

export interface SubjectSweep {
  subject: string
  /** notes written THIS sweep (fresh only — a duplicate is not counted) */
  written: string[]
  /** eligible items that were already in the pool (exact or syndicated-cluster duplicate) */
  duplicates: number
  /** items considered for this subject after the ticker match */
  considered: number
  /** true when this subject had no cursor and the sweep used the capped backfill window instead */
  backfilled: boolean
  /** the new cursor (unchanged when nothing was considered) */
  cursor: string
}

export interface BatchSweepResult {
  sweeps: SubjectSweep[]
  /** subjects that gained at least one FRESH note — the only ones an analysis should be launched for */
  subjectsWithFreshNotes: string[]
  scannedItems: number
}

export interface SweepOpts {
  repoRoot: string
  dataDir: string
  stateDir: string
  archiveDir?: string
  now?: () => Date
  /** how many days of wire the sweep reads (the window is bounded by the cursor anyway; this only caps
   *  how far the reader looks back on a first/backfilled sweep) */
  lookbackDays?: number
}

/**
 * One batch window: for every enabled subject, route the eligible wire items that arrived since that
 * subject's cursor. PURE with respect to launching — it writes notes and cursors, and REPORTS which
 * subjects earned a follow-up analysis; it never launches one itself (the caller owns admission, locks
 * and busy-checks, exactly as the manual route does).
 *
 * Ordering guarantee: the cursor advances to the newest item CONSIDERED for that subject, and only after
 * its notes are written — a crash mid-sweep re-considers the same window next time, where the on-disk
 * dedup makes the retry a no-op. Losing a window is impossible; repeating one is harmless.
 */
export function sweepOnce(subjects: string[], cfg: BridgeBatchConfig, opts: SweepOpts): BatchSweepResult {
  const now = opts.now ?? (() => new Date())
  const nowMs = now().getTime()
  const cursors = readCursors(opts.stateDir)

  // Per-subject window start, computed BEFORE the read: a subject with no cursor gets the capped backfill,
  // one with a cursor resumes exactly where it stopped.
  const sinceMsFor = new Map<string, number>()
  for (const s of subjects) {
    const c = cursors[s]
    const parsed = typeof c === 'string' ? Date.parse(c) : NaN
    sinceMsFor.set(s, Number.isFinite(parsed) ? parsed : nowMs - cfg.backfillHours * 3600_000)
  }
  // The reader window must COVER the oldest subject's cursor, or an outage longer than the window would
  // silently drop every event in the gap — the cursor would resume past days the reader never returned.
  // Derived, not fixed; clamped so a very old cursor cannot make one sweep walk the entire archive.
  const oldestSinceMs = subjects.length ? Math.min(...subjects.map((s) => sinceMsFor.get(s) as number)) : nowMs
  const neededDays = Math.ceil(Math.max(0, nowMs - oldestSinceMs) / 86_400_000) + 1
  const lookbackDays = opts.lookbackDays ?? Math.min(14, Math.max(2, neededDays))

  const snap = readFeed(opts.repoRoot, lookbackDays, {
    now,
    archiveDir: opts.archiveDir ?? '',
    maxItems: 5000,
  })
  const items: FeedItem[] = Array.isArray((snap as any)?.items) ? (snap as any).items : []
  // oldest → newest, so a cursor is always the NEWEST thing we have seen for that subject
  const chrono = [...items].sort((a, b) => String(a.ts || '').localeCompare(String(b.ts || '')))

  const sweeps: SubjectSweep[] = []
  const fresh: string[] = []
  const nextCursors: Cursors = { ...cursors }

  // EXACT symbol match only, same rule as the unattended per-item path: a bare-symbol collision across
  // exchanges must never route company A's news into company B's evidence pool. Resolved ONCE per item and
  // shared across subjects — the matcher hits the filesystem, so re-deriving it per (item × subject) would
  // multiply the sweep's syscalls for an answer that cannot differ.
  const matchCache = new Map<string, string[]>()
  const matchesFor = (it: FeedItem): string[] => {
    const key = String(it?.event_id || '')
    const hit = matchCache.get(key)
    if (hit) return hit
    let matched: string[] = []
    try { matched = matchTrackedSubjects(it, opts.dataDir) } catch { matched = [] }
    matchCache.set(key, matched)
    return matched
  }

  for (const subject of subjects) {
    const had = typeof cursors[subject] === 'string' && Number.isFinite(Date.parse(cursors[subject]))
    const since = sinceMsFor.get(subject) as number
    let considered = 0
    let duplicates = 0
    // Tracked as EPOCH MS, not by string compare: ISO strings only order correctly when their precision
    // matches, and the wire mixes `...:00Z` with `...:00.000Z` — a lexical compare puts the millisecond
    // form BEFORE the bare one at the same instant, which could park a cursor slightly early (harmless,
    // dedup absorbs it) or slightly late (an event silently skipped). Numbers cannot be ambiguous.
    let newestMs = since
    let newestIso = had ? cursors[subject] : new Date(since).toISOString()
    const written: string[] = []

    for (const it of chrono) {
      const ts = Date.parse(String(it?.ts || ''))
      if (!Number.isFinite(ts) || ts <= since) continue
      if (!matchesFor(it).includes(subject)) continue
      considered++
      if (ts > newestMs) { newestMs = ts; newestIso = String(it.ts) }
      if (!eligibleFor(it, subject, cfg)) continue
      try {
        const res = bridgeEventToSubject({
          item: it, ticker: subject, mode: 'auto', user: 'auto', userVia: 'local',
          opts: { dataDir: opts.dataDir, stateDir: opts.stateDir, now },
        })
        if (res.already) duplicates++
        else written.push(res.path)
      } catch {
        /* per-item best-effort: one bad item never aborts a subject's window */
      }
    }

    nextCursors[subject] = newestIso
    if (written.length) fresh.push(subject)
    sweeps.push({ subject, written, duplicates, considered, backfilled: !had, cursor: newestIso })
  }

  writeCursors(opts.stateDir, nextCursors)
  return { sweeps, subjectsWithFreshNotes: fresh, scannedItems: items.length }
}
