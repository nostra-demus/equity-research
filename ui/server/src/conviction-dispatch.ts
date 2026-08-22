// Phase 3 of the conviction loop — the auto-fire dispatcher (frameworks/screener/CONVICTION_LOOP.md §8).
//
// Two ways a locked thesis's checkpoint gets checked without a human:
//   1. DUE RECONCILER — a self-healing tick: any checkpoint whose by-date has arrived and has no result
//      yet gets a /screener:validate run spawned for it. Crash-safe: a date that passed while the app was
//      down fires on the next tick (no external cron needed).
//   2. WIRE ACCELERANT — when a fresh firewall-passed news item matches an open event-checkpoint's
//      keywords, fire that check EARLY (never later, never instead of the date fire).
//
// OFF by default. Auto-spawning paid validation runs is opt-in: set CONVICTION_LOOP_ENABLED=1. Bounded
// by a max-concurrent cap and a per-day spawn cap so it can never run away. Paid work is injected through
// the common tracked launcher, preserving provider/profile inheritance, admission, quota, activity,
// cancellation, publication, and provenance.

import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT, STATE_DIR } from './config'
import {
  hasProvenLegacyClaudeArtifact,
  type RecordedProviderSelection,
} from './execution-provenance'
import { newsBus } from './news/bus'
import type { FeedItem } from './news/types'
import type { RunStatus } from './types'

const CONV = path.join(REPO_ROOT, 'screener', 'ledger', 'conviction')
const CHECKPOINTS = path.join(CONV, 'checkpoints.ndjson')
const TICKS = path.join(CONV, 'conviction.ndjson')
const STATE_SNAPS = path.join(CONV, 'conviction_state')
const BUDGET_FILE = path.join(STATE_DIR, 'conviction-dispatch.json')

const ENABLED = process.env.CONVICTION_LOOP_ENABLED === '1'
const TICK_MS = Math.max(60, Number(process.env.CONVICTION_TICK_SEC) || 600) * 1000
const MAX_CONCURRENT = Math.max(1, Number(process.env.CONVICTION_MAX_CONCURRENT) || 2)
const DAILY_CAP = Math.max(1, Number(process.env.CONVICTION_DAILY_CAP) || 12)
const WIRE_KINDS = new Set(['convergence_trigger', 'secondary_trigger', 'secondary_falsifier'])

const inflightCheckpoints = new Set<string>()
const inflightTheses = new Set<string>()
const wireFired = new Set<string>() // a checkpoint is wire-fired at most once

export interface TrackedConvictionLaunch {
  thesisId: string
  checkpointId: string
  selection: RecordedProviderSelection
  onTerminal: (status: RunStatus) => void
}
export type TrackedConvictionLauncher = (request: TrackedConvictionLaunch) => Promise<void>
let trackedLauncher: TrackedConvictionLauncher | null = null

const log = (m: string) => console.log(`[conviction] ${m}`) // eslint-disable-line no-console
const today = () => new Date().toISOString().slice(0, 10)

function readNdjson(fp: string): any[] {
  try {
    return fs.readFileSync(fp, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
      .map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
  } catch {
    return []
  }
}

/** Checkpoints already resolved (a validation_result with a real verdict, or the calendar row marked). */
function resolvedIds(): Set<string> {
  const out = new Set<string>()
  for (const r of readNdjson(TICKS)) {
    if (r.row_type === 'validation_result' && r.verdict && r.verdict !== 'unresolved' && r.checkpoint_id) out.add(r.checkpoint_id)
  }
  for (const c of readNdjson(CHECKPOINTS)) {
    if (c.status === 'resolved' && c.checkpoint_id) out.add(c.checkpoint_id)
  }
  return out
}

/** Theses already closed (falsified/expired) — never validate a dead idea. */
function archivedTheses(): Set<string> {
  const out = new Set<string>()
  try {
    for (const f of fs.readdirSync(STATE_SNAPS)) {
      if (!f.endsWith('.json')) continue
      try {
        const s = JSON.parse(fs.readFileSync(path.join(STATE_SNAPS, f), 'utf8'))
        if (s.archived && s.thesis_id) out.add(s.thesis_id)
      } catch { /* skip */ }
    }
  } catch { /* no snapshots yet */ }
  return out
}

function firedToday(): number {
  try {
    const b = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'))
    return b?.date === today() ? Number(b.fired) || 0 : 0
  } catch {
    return 0
  }
}
function bumpFired(): void {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.writeFileSync(BUDGET_FILE, JSON.stringify({ date: today(), fired: firedToday() + 1 }))
  } catch { /* best-effort */ }
}

/** Eligible due checkpoints, earliest-due first, ONE per thesis (so a thesis is never validated twice at once). */
export function dueCheckpoints(): { thesisId: string; checkpointId: string; metric: string }[] {
  const resolved = resolvedIds()
  const archived = archivedTheses()
  const td = today()
  const due = readNdjson(CHECKPOINTS)
    .filter((c) => c.due_at && c.due_at <= td && c.status !== 'resolved' && !resolved.has(c.checkpoint_id) && !archived.has(c.thesis_id))
    .sort((a, b) => (a.due_at < b.due_at ? -1 : 1))
  const perThesis = new Map<string, any>()
  for (const c of due) if (!perThesis.has(c.thesis_id)) perThesis.set(c.thesis_id, c)
  return [...perThesis.values()].map((c) => ({ thesisId: c.thesis_id, checkpointId: c.checkpoint_id, metric: c.metric_name }))
}

export function convictionProviderSelection(thesisId: string): RecordedProviderSelection | null {
  const relative = `screener/ledger/theses/${thesisId}.json`
  let record: any
  try { record = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relative), 'utf8')) } catch { return null }
  const author = record?.execution_provenance?.decision_author
  if (author && ['claude', 'codex'].includes(author.provider)
      && typeof author.model === 'string' && author.model
      && typeof author.reasoning_level === 'string' && author.reasoning_level) {
    return {
      provider: author.provider,
      model: author.model,
      reasoningLevel: author.reasoning_level,
      profileKey: typeof record.execution_provenance.profile_key === 'string'
        ? record.execution_provenance.profile_key : undefined,
    }
  }
  // A pre-provider committed thesis is positive structural evidence of the sole historical runtime.
  // Modern/unknown/malformed provenance never falls back to Claude.
  return !record?.execution_provenance && hasProvenLegacyClaudeArtifact(relative)
    ? { provider: 'claude' }
    : null
}

export function setTrackedConvictionLauncher(launcher: TrackedConvictionLauncher | null): void {
  trackedLauncher = launcher
}

export function spawnValidate(thesisId: string, checkpointId: string, why: string): boolean {
  if (inflightCheckpoints.has(checkpointId) || inflightTheses.has(thesisId)) return false
  if (inflightCheckpoints.size >= MAX_CONCURRENT) return false
  if (firedToday() >= DAILY_CAP) { log(`daily cap ${DAILY_CAP} reached — holding ${checkpointId}`); return false }
  const selection = convictionProviderSelection(thesisId)
  if (!selection) {
    log(`holding ${checkpointId} — locked thesis has no trusted decision-author provider/profile; validate it manually`)
    return false
  }
  if (!trackedLauncher) { log(`holding ${checkpointId} — tracked launcher is not configured`); return false }
  inflightCheckpoints.add(checkpointId)
  inflightTheses.add(thesisId)
  let terminal = false
  const clear = (status?: RunStatus) => {
    if (terminal) return
    terminal = true
    inflightCheckpoints.delete(checkpointId)
    inflightTheses.delete(thesisId)
    if (status) log(`validate ${checkpointId} (${why}) finished ${status}`)
  }
  void trackedLauncher({ thesisId, checkpointId, selection, onTerminal: clear })
    .then(() => { bumpFired(); log(`fired tracked validate ${thesisId} ${checkpointId} (${why}) via ${selection.provider}`) })
    .catch((error: any) => {
      clear()
      wireFired.delete(checkpointId)
      log(`could not admit validate ${checkpointId}: ${error?.message || error}`)
    })
  return true
}

/** The due reconciler — one pass. Crash-safe: re-running fires anything still due and unfired. */
export function dispatchDueConvictionChecks(): void {
  if (!ENABLED) return
  for (const { thesisId, checkpointId } of dueCheckpoints()) {
    if (inflightCheckpoints.size >= MAX_CONCURRENT) break
    spawnValidate(thesisId, checkpointId, 'due')
  }
}

/** The wire accelerant — a fresh news item that strongly matches an open event-checkpoint fires it early. */
function onWireItem(item: FeedItem): void {
  if (!ENABLED) return
  const resolved = resolvedIds()
  const archived = archivedTheses()
  const hay = `${item.headline || ''} ${(item.companies || []).map((c) => c.name).join(' ')}`.toLowerCase()
  for (const c of readNdjson(CHECKPOINTS)) {
    if (!WIRE_KINDS.has(c.kind)) continue
    if (c.status === 'resolved' || resolved.has(c.checkpoint_id) || archived.has(c.thesis_id)) continue
    if (wireFired.has(c.checkpoint_id) || inflightCheckpoints.has(c.checkpoint_id)) continue
    const kw: string[] = (c.wire_keywords || []).map((k: string) => k.toLowerCase())
    if (kw.length && kw.filter((k) => hay.includes(k)).length >= 2) {
      if (spawnValidate(c.thesis_id, c.checkpoint_id, 'wire')) wireFired.add(c.checkpoint_id)
    }
  }
}

export function startConvictionLoop(launcher: TrackedConvictionLauncher): void {
  setTrackedConvictionLauncher(launcher)
  if (!ENABLED) {
    log('loop idle — set CONVICTION_LOOP_ENABLED=1 to auto-fire checkpoint checks (the board still shows progress; you can run /screener:validate by hand)')
    return
  }
  setTimeout(() => dispatchDueConvictionChecks(), 8000)
  const t = setInterval(() => dispatchDueConvictionChecks(), TICK_MS)
  t.unref?.()
  newsBus.subscribe((e) => { if (e.type === 'news-item') { try { onWireItem(e.item) } catch { /* a bad match never breaks ingest */ } } })
  log(`loop on — due reconciler every ${Math.round(TICK_MS / 1000)}s + wire accelerant · max ${MAX_CONCURRENT} concurrent, ${DAILY_CAP}/day`)
}
