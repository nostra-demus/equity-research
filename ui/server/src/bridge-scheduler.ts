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
  BRIDGE_DIR, BRIDGE_INTERVAL_MIN, BRIDGE_MODE, DATA_DIR, NEWS, REPO_ROOT, STATE_DIR,
} from './config'
import { acquireSingletonLock, releaseSingletonLock } from './singleton-lock'
import { accumulatedFor, enabledSubjects, readBatchConfig, sweepOnce } from './bridge-batch'

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
}

export function getBridgeStatus(): BridgeStatus {
  const subjects = currentSubjects().map((subject) => ({ subject, ...accumulatedFor(DATA_DIR, subject) }))
  const running = BRIDGE_MODE === 'batch' && timer !== null
  return {
    mode: BRIDGE_MODE,
    running,
    sweeping: running && sweeping,
    intervalMin: BRIDGE_INTERVAL_MIN,
    subjects,
    totalNotes: subjects.reduce((a, s) => a + s.notes, 0),
    lastSweepAt,
    nextSweepAt,
    last: lastSummary,
    idleReason: running ? null : idleReason,
  }
}

/** The enabled set, re-read every tick: adding a name is a manifest edit, never a redeploy. */
function currentSubjects(): string[] {
  return enabledSubjects(path.join(BRIDGE_DIR, 'company-news-bridge.json'), DATA_DIR)
}

/** One sweep + its follow-up analyses. `launchAnalysis` is injected so this stays testable without the
 *  CLI and without server.ts's admission stack; it returns true when an analysis actually started. */
export async function runBridgeSweep(launchAnalysis: (ticker: string) => Promise<boolean>): Promise<void> {
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
  })
  const written = res.sweeps.reduce((a, s) => a + s.written.length, 0)
  const duplicates = res.sweeps.reduce((a, s) => a + s.duplicates, 0)

  // ONE analysis per subject that gained a FRESH note. A subject whose window produced only duplicates
  // (the manual-send-then-batch case) earns nothing — the pool did not change.
  let analyses = 0
  for (const subject of res.subjectsWithFreshNotes) {
    try { if (await launchAnalysis(subject)) analyses++ } catch { /* busy / capacity — the notes still landed */ }
  }

  lastSweepAt = new Date().toISOString()
  lastSummary = { subjects: subjects.length, written, duplicates, analyses }
  if (written || duplicates) {
    log(`swept ${subjects.length} subject(s): ${written} note(s) written, ${duplicates} duplicate(s) skipped, ${analyses} analysis/es started`)
  }
}

export function startBridgeScheduler(launchAnalysis: (ticker: string) => Promise<boolean>): void {
  if (BRIDGE_MODE !== 'batch') {
    log(BRIDGE_MODE === 'stream'
      ? 'batch loop idle — BRIDGE_MODE=stream routes per ingested item instead (research-bridge.ts)'
      : 'idle — set BRIDGE_MODE=batch to route company news into research pools on a schedule')
    idleReason = BRIDGE_MODE === 'stream'
      ? 'BRIDGE_MODE=stream — routing happens per ingested item instead of on a schedule'
      : 'BRIDGE_MODE is off — set BRIDGE_MODE=batch to route company news on a schedule'
    return
  }
  if (timer) return
  if (!fs.existsSync(path.join(BRIDGE_DIR, 'company-news-bridge.json'))) {
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
