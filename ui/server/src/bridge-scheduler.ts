// The 12-hourly company-news bridge loop — one guarded call from server.ts, mirroring news/scheduler.ts.
//
// Ships OFF (BRIDGE_MODE=off). With BRIDGE_MODE=batch it sweeps every BRIDGE_INTERVAL_MIN minutes: route
// the eligible wire events each covered subject accumulated since its own cursor (bridge-batch.ts), then
// launch ONE cheap advisory intake analysis per subject that gained a FRESH note — the same read-only
// analysis the manual "Send to research" click triggers, behind the same subject lock and busy check.
// Paid re-runs stay behind their own human click in the research tab (INTAKE.md §1 / CLAUDE.md §24).
//
// Like the news ingester: the interval is unref'd (it can never by itself keep the process alive), a tick
// never throws, an overlapping tick is skipped, and the whole loop is singleton-locked per state dir so a
// second engine pointed at the same pool stays read-only instead of double-routing.

import fs from 'node:fs'
import path from 'node:path'
import {
  ANALYSES_DIR, BRIDGE_DIR, BRIDGE_INTERVAL_MIN, BRIDGE_MODE, DATA_DIR, NEWS, REPO_ROOT, STATE_DIR,
} from './config'
import { acquireSingletonLock, releaseSingletonLock } from './singleton-lock'
import { accumulatedFor, bridgeManifestError, enabledSubjects, readBatchConfig, readSubjectNames, sweepOnce } from './bridge-batch'
import { isPerItemBridgeActive } from './research-bridge'

const LOCK_FILE = 'bridge-batch.lock'
const log = (m: string) => console.log(`[bridge] ${m}`) // eslint-disable-line no-console

let timer: ReturnType<typeof setInterval> | null = null
// the overlap guard doubles as the honest "a sweep is in flight RIGHT NOW" signal the chip pulses on —
// distinct from `running` (the loop is live), which stays true between windows
let sweeping = false
let lastSweepAt: string | null = null
let nextSweepAt: string | null = null
export interface BridgeSweepSummary { subjects: number; written: number; duplicates: number; analyses: number }
let lastSummary: BridgeSweepSummary | null = null
// why the loop is dark, in the loop's own words — so the status never reports a bare `running:false`
let idleReason: string | null = 'not started'
// Subjects whose follow-up analysis did not actually start on a PRIOR sweep — a busy run, exhausted
// capacity, or a missing CLI. `sweepOnce` only reports a subject as "fresh" for the window that wrote its
// note; the next sweep sees that same note as a duplicate (it's already on disk), so a dropped launch would
// otherwise never be retried and the advisory analysis is silently skipped forever (Codex #359 r3674305113).
let pendingAnalysisSubjects = new Set<string>()
// The manifest EXISTS but fails to parse, or has no subjects[] array — a real config error, distinct from
// "not configured yet" (no manifest) and from "configured with zero subjects". Surfaced separately from
// `running`/`idleReason` so a transient/malformed edit is never reported as a quiet, successful zero-subject
// sweep (Codex #359, "Surface an unreadable bridge manifest as a configuration error").
let manifestError: string | null = null

export interface BridgeSubjectStatus {
  subject: string
  /** routed event notes currently in this subject's pool (counted on disk, so it survives restarts) */
  notes: number
  /** when the newest routed note landed, or null when none has */
  newestAt: string | null
}

export interface BridgeStatus {
  mode: string
  /** the loop is genuinely ticking (batch mode AND this engine won the singleton lock) */
  running: boolean
  /** a sweep is executing at this moment — the chip's pulse, and never merely "between windows" */
  sweeping: boolean
  intervalMin: number
  subjects: BridgeSubjectStatus[]
  /** total routed notes across every covered subject — the "how much has accumulated" number */
  totalNotes: number
  lastSweepAt: string | null
  nextSweepAt: string | null
  last: BridgeSweepSummary | null
  /** why the loop is not running, when it is not — never a silent false */
  idleReason: string | null
  /** the manifest exists but is unreadable/malformed right now — a real config error, reported even while
   *  `running` is otherwise true, so a bad edit never reads as a quiet, valid zero-subject sweep */
  manifestError: string | null
}

// ---- routed-note count cache --------------------------------------------------------------------------
// GET /api/bridge/status is polled every ~60s by every open cockpit tab (the news-bridge chip). Each call
// used to `statSync` every routed note in every covered subject's pool (accumulatedFor) on every single
// request — on a Drive/FUSE mount that blocks Fastify's one event loop, and the cost grows with total note
// history AND with how many tabs are polling. A short TTL cache means at most one full rescan per window
// regardless of how many tabs ask; it's invalidated right after every sweep (below) so a poll immediately
// after a sweep still sees the fresh counts, never a stale pre-sweep number (Codex review, PR #359:
// "Cache routed-note counts outside the status request").
const SUBJECT_COUNTS_TTL_MS = 20_000
let subjectCountsCache: { at: number; subjects: string[]; counts: BridgeSubjectStatus[] } | null = null

function subjectCounts(subjects: string[]): BridgeSubjectStatus[] {
  const cache = subjectCountsCache
  const fresh = cache
    && Date.now() - cache.at < SUBJECT_COUNTS_TTL_MS
    && cache.subjects.length === subjects.length
    && cache.subjects.every((s, i) => s === subjects[i])
  if (fresh) return cache!.counts
  const counts = subjects.map((subject) => ({ subject, ...accumulatedFor(DATA_DIR, subject) }))
  subjectCountsCache = { at: Date.now(), subjects, counts }
  return counts
}

// ---- subject-name alias cache (feeds the STREAM per-item path's name fallback) -------------------------
// The batch sweep reads every covered subject's canonical company name ONCE per sweep (bridge-batch.ts's
// own comment). The stream path (research-bridge.ts's autoBridgeItem) has no sweep — it runs on the wire's
// ingest hot path, once per item — so re-reading every subject's newest decision_record.json per item
// would multiply a filesystem read by the wire's full item rate for an answer that changes on the order of
// "a new run finished", not "a new wire item arrived". A short TTL keeps it off the hot path while staying
// fresh enough that a newly-finished run's canonical name shows up within a few minutes (Codex #374 P2:
// the stream path silently lacked the name fallback the batch path gained).
const SUBJECT_NAMES_TTL_MS = 5 * 60_000
let subjectNamesCache: { at: number; names: Record<string, string> } | null = null

export function getBridgeSubjectNames(): Record<string, string> {
  const cache = subjectNamesCache
  if (cache && Date.now() - cache.at < SUBJECT_NAMES_TTL_MS) return cache.names
  const names = readSubjectNames(currentSubjects(), ANALYSES_DIR)
  subjectNamesCache = { at: Date.now(), names }
  return names
}

export function getBridgeStatus(): BridgeStatus {
  const subjects = subjectCounts(currentSubjects())
  // 'running' must mean "is SOME automatic routing live", not just "is the batch timer ticking" — a
  // BRIDGE_MODE=stream deployment routes every material item through research-bridge.ts's per-item path,
  // with no timer of its own, and previously reported as fully idle here (Codex #359, "Report stream mode
  // as active without the legacy flag"). `sweeping`/`nextSweepAt` stay scoped to the batch loop
  // specifically — the stream path has no sweep concept to report.
  const batchRunning = BRIDGE_MODE === 'batch' && timer !== null
  const streamActive = isPerItemBridgeActive()
  const running = batchRunning || streamActive
  return {
    mode: BRIDGE_MODE,
    running,
    sweeping: batchRunning && sweeping,
    intervalMin: BRIDGE_INTERVAL_MIN,
    subjects,
    totalNotes: subjects.reduce((a, s) => a + s.notes, 0),
    lastSweepAt,
    nextSweepAt,
    last: lastSummary,
    idleReason: running ? null : idleReason,
    manifestError,
  }
}

function manifestPath(): string {
  return path.join(BRIDGE_DIR, 'company-news-bridge.json')
}

/** The enabled set, re-read every tick: adding a name is a manifest edit, never a redeploy. */
function currentSubjects(): string[] {
  return enabledSubjects(manifestPath(), DATA_DIR)
}

/** One sweep + its follow-up analyses. `launchAnalysis` is injected so this stays testable without the
 *  CLI and without server.ts's admission stack; it returns true when an analysis actually started. */
export async function runBridgeSweep(launchAnalysis: (ticker: string) => Promise<boolean>): Promise<void> {
  // Checked every tick, BEFORE deciding subjects.length===0 means "nothing configured" — a manifest that
  // exists but fails to parse must read as broken, not as valid empty coverage (Codex #359, "Surface an
  // unreadable bridge manifest as a configuration error").
  const newManifestError = bridgeManifestError(manifestPath())
  if (newManifestError && newManifestError !== manifestError) log(`manifest error: ${newManifestError}`)
  manifestError = newManifestError

  const subjects = currentSubjects()
  if (!subjects.length) {
    lastSweepAt = new Date().toISOString()
    lastSummary = { subjects: 0, written: 0, duplicates: 0, analyses: 0 }
    return
  }
  const cfg = readBatchConfig(path.join(BRIDGE_DIR, 'bridge_config.json'))
  const res = sweepOnce(subjects, cfg, {
    repoRoot: REPO_ROOT,
    dataDir: DATA_DIR,
    stateDir: STATE_DIR,
    archiveDir: NEWS.newsArchiveDir || '',
    analysesDir: ANALYSES_DIR,
  })
  const written = res.sweeps.reduce((a, s) => a + s.written.length, 0)
  const duplicates = res.sweeps.reduce((a, s) => a + s.duplicates, 0)
  // How many of the fresh notes only the NAME fallback found. Logged separately so the fallback's yield is
  // visible: if it is always 0 the wire's ticker extraction is healthy; a steady non-zero count is the
  // measure of what ticker-only matching was silently dropping.
  const byName = res.sweeps.reduce((a, s) => a + s.matchedByName, 0)

  // ONE analysis per subject that gained a FRESH note THIS window, plus any subject still owed one from a
  // prior window whose launch didn't start (busy / capacity / CLI). A subject whose window produced only
  // duplicates (the manual-send-then-batch case) earns nothing NEW — but a still-pending retry from before
  // is not a new note, so it must not be dropped just because this window was quiet.
  const candidates = new Set<string>([...res.subjectsWithFreshNotes, ...pendingAnalysisSubjects])
  const stillPending = new Set<string>()
  let analyses = 0
  for (const subject of candidates) {
    try {
      if (await launchAnalysis(subject)) analyses++
      else stillPending.add(subject) // busy right now — retry next sweep
    } catch {
      stillPending.add(subject) // capacity / CLI unavailable — the note still landed; retry next sweep
    }
  }
  pendingAnalysisSubjects = stillPending

  // A note landed this sweep → the cached status counts are now stale.
  if (written > 0) subjectCountsCache = null

  // Honest disclosure, not a silent skip: a subject whose cursor predates the retention boundary had its
  // catch-up window intentionally clamped (bridge-batch.ts's RETENTION_BOUNDARY_DAYS) — surface it so an
  // operator can see it instead of the gap just vanishing (Codex review, PR #359).
  const gapped = res.sweeps.filter((s) => s.retentionGapDays)
  if (gapped.length) {
    log(`retention boundary hit for ${gapped.map((s) => `${s.subject} (~${s.retentionGapDays}d uncovered)`).join(', ')} — cursor older than the catch-up window; that gap is an intentional, disclosed limit, not routed`)
  }
  // A cursor-persistence failure never erases the notes/analyses already landed above (sweepOnce always
  // returns subjectsWithFreshNotes even when writeCursors throws) — but it DOES mean the cursor didn't
  // advance, so say so instead of pretending the sweep was clean (Codex review, PR #359).
  if (res.cursorWriteError) {
    log(`cursor persistence failed after this sweep (${res.cursorWriteError}) — the next sweep re-reads this same window (safe: on-disk note dedup makes the replay a no-op)`)
  }

  lastSweepAt = new Date().toISOString()
  lastSummary = { subjects: subjects.length, written, duplicates, analyses }
  if (written || duplicates) {
    log(`swept ${subjects.length} subject(s): ${written} note(s) written${byName ? ` (${byName} by company name — the wire extracted no ticker)` : ''}, ${duplicates} duplicate(s) skipped, ${analyses} analysis/es started`)
  }
}

export function startBridgeScheduler(launchAnalysis: (ticker: string) => Promise<boolean>): void {
  if (BRIDGE_MODE !== 'batch') {
    // BRIDGE_MODE=stream is authoritative on its own now (research-bridge.ts's shouldAutoBridge no longer
    // needs the legacy SCREENER_RESEARCH_BRIDGE=1 flag too) — say so accurately, don't describe routing as
    // dark when it is actually live. This message only affects the BATCH loop's own log/idleReason;
    // getBridgeStatus's `running` is computed independently via isPerItemBridgeActive() and reports the
    // stream path as active regardless of what's logged here (Codex #359, "Report stream mode as active
    // without the legacy flag").
    log(BRIDGE_MODE === 'stream'
      ? 'batch loop idle — BRIDGE_MODE=stream owns routing instead (per-item, no schedule; the mode alone enables it)'
      : 'idle — set BRIDGE_MODE=batch to route company news into research pools on a schedule')
    idleReason = BRIDGE_MODE === 'stream'
      ? 'BRIDGE_MODE=stream — the batch loop is off; per-item routing is active via the stream path instead'
      : 'BRIDGE_MODE is off — set BRIDGE_MODE=batch to route company news on a schedule'
    return
  }
  if (timer) return
  if (!fs.existsSync(manifestPath())) {
    log(`idle — no bridge manifest at ${BRIDGE_DIR}/company-news-bridge.json (nothing declares which subjects are covered)`)
    idleReason = 'no bridge manifest — nothing declares which subjects are covered'
    return
  }
  // One sweeper per state dir: a second engine must not double-route into the same pools.
  if (!acquireSingletonLock(STATE_DIR, LOCK_FILE)) {
    log('another engine already owns the bridge sweep for this data dir — staying read-only')
    idleReason = 'another engine owns the sweep for this data dir (staying read-only)'
    return
  }
  process.once('exit', () => releaseSingletonLock(STATE_DIR, LOCK_FILE))

  const tick = async () => {
    // advance BEFORE the overlap guard, so a skipped tick still reports an honest next-due time
    nextSweepAt = new Date(Date.now() + BRIDGE_INTERVAL_MIN * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
    if (sweeping) return
    sweeping = true
    try { await runBridgeSweep(launchAnalysis) } catch (e: any) { log(`sweep failed: ${e?.message || e}`) } finally { sweeping = false }
  }
  idleReason = null
  timer = setInterval(tick, BRIDGE_INTERVAL_MIN * 60_000)
  timer.unref?.()
  log(`batch mode on — sweeping every ${BRIDGE_INTERVAL_MIN} min over: ${currentSubjects().join(', ') || '(no subjects yet)'}`)
  void tick() // catch up immediately on boot; a window missed while the cockpit was down is picked up here
}

export function stopBridgeScheduler(): void {
  if (timer) { clearInterval(timer); timer = null }
  idleReason = 'stopped'
  releaseSingletonLock(STATE_DIR, LOCK_FILE)
}
