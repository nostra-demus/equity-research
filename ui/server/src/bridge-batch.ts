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
import { bridgeEventToSubject, matchTrackedSubjects, wireNameMatching } from './research-bridge'

// Re-exported for existing callers/tests that import it from here — the function itself now lives in
// research-bridge.ts so the per-item stream path (autoBridgeItem) can share it too, without a circular
// import (bridge-batch.ts already depends on research-bridge.ts, never the other way around).
export { wireNameMatching }
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
        // A malformed override must NOT install a valid-looking floor. Defaulting to a hardcoded 60 here
        // silently WIDENED ingestion whenever the global floor was >60 (e.g. min_score:75 + a "bad" override
        // → floor 60 for that name — Codex #359 r3673607337). Fail-closed: keep ONLY a valid in-range number;
        // a dropped key falls back to the parsed global floor at lookup time (eligibleFor), never below it.
        if (isValidTicker(k) && !isReservedDataFolder(k) &&
            typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100) {
          bySubject[k] = v
        }
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

/** Null when the manifest is genuinely ABSENT (nothing declared yet — not a config error) or well-formed.
 *  Otherwise names what's wrong. A missing file and a malformed one both made `enabledSubjects` return the
 *  same empty array, so a transient/malformed edit to the manifest silently read as "valid empty coverage"
 *  — the scheduler kept reporting `running: true`, a successful zero-subject sweep, and a null idleReason,
 *  with no signal anywhere that unattended routing had actually stopped (Codex #359, "Surface an unreadable
 *  bridge manifest as a configuration error"). Callers should surface this distinctly from "idle". */
export function bridgeManifestError(manifestPath: string): string | null {
  if (!fs.existsSync(manifestPath)) return null
  let raw: any
  try {
    raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (e: any) {
    return `${manifestPath} is not valid JSON (${e?.message || e})`
  }
  if (!Array.isArray(raw?.subjects)) return `${manifestPath} has no "subjects" array`
  return null
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

// The most items one sweep's reader will return. Also passed as the dedup-clustering scan width (see
// readFeed's dedupMaxScan) so a full 5,000-item catch-up page gets clustered in full — the wire-UI
// default (NEWS.dedupMaxScan, 1,500) would otherwise leave the older ~3,500 rows un-reclustered and
// overwrite their persisted `dedup_group`, un-clustering syndicated pairs the ingest-time pass had
// already grouped (Codex review, PR #359: "Preserve dedup groups beyond the scan cap").
const SWEEP_MAX_ITEMS = 5000

// The explicit, documented catch-up retention boundary: a subject whose cursor is older than this many
// days is NOT walked further back than this many days on this sweep. This is a DELIBERATE, disclosed
// limit (mirrors the bounded `backfillHours` a brand-new subject already gets), not silent data loss —
// when a subject's true gap exceeds it, the sweep still runs (routing whatever falls inside the
// boundary) but reports `retentionGapDays` on that subject's result so the caller can log/surface it
// instead of the cursor quietly advancing past an unread gap with no record it happened (Codex review,
// PR #359: "Remove the 14-day catch-up truncation").
const RETENTION_BOUNDARY_DAYS = 14

const ENABLED_STATE_FILE = 'research-bridge-enabled.json'

/** The subjects the LAST sweep considered enabled — used only to detect a disabled→re-enabled
 *  transition (see the cursor-reset loop in sweepOnce below).
 *
 *  When the state file itself is missing or unreadable — a brand-new state dir, OR (more importantly)
 *  an EXISTING deployment upgrading to this check for the first time, which already has real cursors
 *  but has never written this file — fall back to `Object.keys(cursors)`: grandfather in every subject
 *  that already has a cursor as "previously enabled", so the upgrade never wipes a live cursor out from
 *  under it. A subject with no cursor either way still gets the same bounded backfill a brand-new
 *  subject always got, so this is equally safe on a genuinely fresh install. */
function readPreviouslyEnabled(stateDir: string, cursors: Cursors): Set<string> {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(stateDir, ENABLED_STATE_FILE), 'utf8'))
    if (Array.isArray(raw?.subjects)) return new Set(raw.subjects.filter((s: unknown) => typeof s === 'string'))
  } catch {
    /* fall through to the cursor-grandfathering default below */
  }
  return new Set(Object.keys(cursors))
}

// Best-effort, like writeCursors: this is an auxiliary marker for the re-enable check above, not the
// sweep's core job (routing notes). A write failure here (state disk full, an ENOTDIR state path) must
// NEVER abort the whole sweep before any note gets written — that would be a far worse regression than
// the stale-cursor bug this file exists to fix. Losing an update just means the NEXT sweep falls back to
// the cursor-grandfathering default in readPreviouslyEnabled, which is always safe (see its own comment).
function writeEnabledState(stateDir: string, subjects: string[]): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const fp = path.join(stateDir, ENABLED_STATE_FILE)
    const tmp = `${fp}.tmp.${process.pid}.${Math.random().toString(36).slice(2)}`
    try {
      fs.writeFileSync(tmp, JSON.stringify({ subjects }, null, 2))
      fs.renameSync(tmp, fp)
    } finally {
      try { fs.unlinkSync(tmp) } catch { /* renamed away — the normal case */ }
    }
  } catch {
    /* best-effort — see the doc comment above */
  }
}

export interface SubjectSweep {
  subject: string
  /** notes written THIS sweep (fresh only — a duplicate is not counted) */
  written: string[]
  /** eligible items that were already in the pool (exact or syndicated-cluster duplicate) */
  duplicates: number
  /** items considered for this subject after the ticker match */
  considered: number
  /** of `written`, how many were found ONLY by the company-name fallback (the wire extracted no ticker).
   *  Surfaced so the fallback's yield is visible rather than silently folded into the total. */
  matchedByName: number
  /** true when this subject had no cursor and the sweep used the capped backfill window instead
   *  (a brand-new subject, OR one just reset by a disabled→re-enabled transition — see
   *  RETENTION_BOUNDARY_DAYS / readPreviouslyEnabled above) */
  backfilled: boolean
  /** the new cursor (unchanged when nothing was considered) */
  cursor: string
  /** set (to the approximate number of days) when this subject's cursor was older than
   *  RETENTION_BOUNDARY_DAYS — the sweep did NOT walk back far enough to fully cover it, by explicit,
   *  documented design; null when the cursor was fully covered by this sweep's reader window */
  retentionGapDays: number | null
}

export interface BatchSweepResult {
  sweeps: SubjectSweep[]
  /** subjects that gained at least one FRESH note — the only ones an analysis should be launched for */
  subjectsWithFreshNotes: string[]
  scannedItems: number
  /** set when writeCursors() threw AFTER notes were already written this sweep — subjectsWithFreshNotes
   *  above is still valid (a persistence failure never erases it, see the writeCursors call below), but
   *  the cursors did NOT advance, so the next sweep re-reads this same window (safe: bridgeEventToSubject's
   *  on-disk dedup makes the replay a no-op). */
  cursorWriteError?: string
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
  /** seam over research-bridge's bridgeEventToSubject — defaults to the real writer. Exists so a test can
   *  simulate a transient pool-write failure and assert the cursor does not step past the unpersisted event. */
  writeNote?: (args: Parameters<typeof bridgeEventToSubject>[0]) => { already: boolean; path: string }
  /** where run folders live, for the per-subject company-name lookup that powers the name fallback.
   *  Omitted => no aliases => ticker-only matching, exactly as before. */
  analysesDir?: string
}

/** Canonical company name per subject, from each one's NEWEST decision_record.json (`company_name`).
 *  Best-effort and silent: a subject with no run, no record, or an unreadable one simply gets no alias
 *  and keeps ticker-only matching — the fallback must never be able to break a sweep. */

export function readSubjectNames(subjects: string[], analysesDir?: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!analysesDir) return out
  let dirs: string[] = []
  try { dirs = fs.readdirSync(analysesDir) } catch { return out }
  for (const subject of subjects) {
    const prefix = `${subject}_`
    const runs = dirs.filter((d) => d.startsWith(prefix)).sort()
    for (let i = runs.length - 1; i >= 0; i--) {
      try {
        const raw = fs.readFileSync(path.join(analysesDir, runs[i], 'decision_record.json'), 'utf8')
        const name = String(JSON.parse(raw)?.company_name || '').trim()
        if (name) { out[subject] = name; break }
      } catch { /* try the next-older run */ }
    }
  }
  return out
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
  const writeNote = opts.writeNote ?? bridgeEventToSubject
  const cursors = readCursors(opts.stateDir)

  // A subject transitioning from disabled/absent → enabled must not inherit a stale cursor left over from
  // BEFORE it was disabled: without this, re-enabling a name after (say) a week off silently dumps the
  // whole disabled interval into its pool instead of going through the same bounded `backfillHours` catch-up
  // a brand-new subject gets (Codex review, PR #359: "Reset stale cursors when subjects are re-enabled").
  // Canonical company name per covered subject, read ONCE per sweep (not per item x subject) from each
  // subject's newest decision_record.json — the only place the pool records what the company is called.
  // Feeds the name fallback in matchTrackedSubjects; a subject with no decision record simply has no
  // alias and keeps ticker-only matching.
  const subjectNames = readSubjectNames(subjects, opts.analysesDir)

  const previouslyEnabled = readPreviouslyEnabled(opts.stateDir, cursors)
  for (const s of subjects) {
    if (!previouslyEnabled.has(s)) delete cursors[s]
  }
  writeEnabledState(opts.stateDir, subjects)

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
  // Derived, not fixed; clamped to the explicit RETENTION_BOUNDARY_DAYS so a very old cursor cannot make
  // one sweep walk the entire archive. A subject whose true gap exceeds the boundary is NOT silently
  // covered by this clamp — see the `retentionGapDays` disclosure per-subject below.
  const oldestSinceMs = subjects.length ? Math.min(...subjects.map((s) => sinceMsFor.get(s) as number)) : nowMs
  const neededDays = Math.ceil(Math.max(0, nowMs - oldestSinceMs) / 86_400_000) + 1
  const lookbackDays = opts.lookbackDays ?? Math.min(RETENTION_BOUNDARY_DAYS, Math.max(2, neededDays))
  const windowStartMs = nowMs - lookbackDays * 86_400_000

  const snap = readFeed(opts.repoRoot, lookbackDays, {
    now,
    archiveDir: opts.archiveDir ?? '',
    maxItems: SWEEP_MAX_ITEMS,
    dedupMaxScan: SWEEP_MAX_ITEMS,
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
  // Second pass, only for items the TICKER path did not claim: the wire's enrichment guesses companies
  // from the headline and routinely names a company without a symbol, so a covered name's material news
  // was being dropped silently. Cached alongside the ticker match (same per-item cost profile).
  const nameMatchCache = new Map<string, string[]>()
  const nameMatchesFor = (it: FeedItem): string[] => {
    if (!subjectNames || matchesFor(it).length) return []
    const key = String(it?.event_id || '')
    const hit = nameMatchCache.get(key)
    if (hit) return hit
    let matched: string[] = []
    try { matched = matchTrackedSubjects(it, opts.dataDir, subjectNames) } catch { matched = [] }
    nameMatchCache.set(key, matched)
    return matched
  }

  for (const subject of subjects) {
    const had = typeof cursors[subject] === 'string' && Number.isFinite(Date.parse(cursors[subject]))
    const since = sinceMsFor.get(subject) as number
    let considered = 0
    let duplicates = 0
    let matchedByName = 0
    // Tracked as EPOCH MS, not by string compare: ISO strings only order correctly when their precision
    // matches, and the wire mixes `...:00Z` with `...:00.000Z` — a lexical compare puts the millisecond
    // form BEFORE the bare one at the same instant, which could park a cursor slightly early (harmless,
    // dedup absorbs it) or slightly late (an event silently skipped). Numbers cannot be ambiguous.
    let newestMs = since
    let newestIso = had ? cursors[subject] : new Date(since).toISOString()
    const written: string[] = []
    // The cursor may only cross a CONTIGUOUS PREFIX of fully-accounted items. The first eligible item whose
    // note write throws (a transient pool/FUSE failure) FREEZES the watermark, so the next window re-reads
    // from just before it and retries — otherwise the cursor would step past an event that has no note, and
    // the on-disk dedup could never save it because it never got written (Codex #359 r3673607317). chrono is
    // ascending, so a single freeze flag is enough; later items are still written (their notes dedup on retry).
    let blocked = false

    // A single instant can carry MULTIPLE items — news/runCycle.ts stamps every item from one cycle with
    // the same timestamp, so ties are routine, not exceptional. Advancing the watermark to T as soon as the
    // FIRST item at T succeeds — before a LATER item also at T fails — would still set `blocked`, but the
    // cursor is already sitting at T; the next sweep's `ts <= since` filter then excludes the failed item at
    // that exact T forever. So the watermark only ever commits to a timestamp once every item sharing it has
    // been accounted for: buffer the current instant's outcome and commit it only once a STRICTLY LATER
    // timestamp is seen (or the loop ends) (Codex #359 r3674305109).
    let groupMs: number | null = null
    let groupIso: string | null = null
    let groupFailed = false
    const commitGroup = () => {
      if (!blocked && !groupFailed && groupMs !== null && groupMs > newestMs) {
        newestMs = groupMs
        newestIso = groupIso as string
      }
      if (groupFailed) blocked = true
      groupMs = null
      groupIso = null
      groupFailed = false
    }

    for (const it of chrono) {
      const ts = Date.parse(String(it?.ts || ''))
      if (!Number.isFinite(ts) || ts <= since) continue
      const byTicker = matchesFor(it).includes(subject)
      const byName = !byTicker && nameMatchesFor(it).includes(subject)
      if (!byTicker && !byName) continue
      if (groupMs !== null && ts !== groupMs) commitGroup()
      groupMs = ts
      groupIso = String(it.ts)
      considered++
      let persisted = true
      if (eligibleFor(it, subject, cfg)) {
        try {
          const res = writeNote({
            item: it, ticker: subject, mode: 'auto', user: 'auto', userVia: 'local',
            matchedBy: byName ? 'name' : 'ticker',
            matchedName: byName ? wireNameMatching(it, subjectNames?.[subject]) : undefined,
            opts: { dataDir: opts.dataDir, stateDir: opts.stateDir, now },
          })
          if (res.already) duplicates++
          else { written.push(res.path); if (byName) matchedByName++ }
        } catch {
          // per-item best-effort: one bad item never aborts a subject's window, but it must not be skipped —
          persisted = false
        }
      }
      if (!persisted) groupFailed = true
    }
    commitGroup()

    nextCursors[subject] = newestIso
    if (written.length) fresh.push(subject)
    // The gap the reader's window did NOT reach for this subject — >0 only when its own cursor predates
    // this sweep's actual window start (i.e. the retention boundary clamped how far back we looked).
    const uncoveredMs = Math.max(0, windowStartMs - since)
    const retentionGapDays = uncoveredMs > 0 ? Math.ceil(uncoveredMs / 86_400_000) : null
    sweeps.push({ subject, written, duplicates, considered, matchedByName, backfilled: !had, cursor: newestIso, retentionGapDays })
  }

  // Persist cursors LAST. If this throws (state disk full, rename fails), the window simply repeats next
  // sweep — the on-disk note dedup makes that a no-op. What must NOT happen is losing this cycle's fresh-note
  // report: if we let the throw propagate, the scheduler launches no follow-up analysis, and next sweep those
  // same notes are duplicates (never "fresh"), so the advertised advisory analysis is skipped forever with
  // INTAKE_AUTO_ANALYZE=0 (Codex #359 r3673881630). Report the result regardless of cursor-persist success.
  const result: BatchSweepResult = { sweeps, subjectsWithFreshNotes: fresh, scannedItems: items.length }
  try {
    writeCursors(opts.stateDir, nextCursors)
  } catch (e: any) {
    // Surfaced, not swallowed: the notes/analyses above are safe either way, but an operator should be able
    // to see that the cursor didn't advance instead of the sweep silently reporting as if it were clean.
    result.cursorWriteError = String(e?.message || e)
  }
  return result
}
