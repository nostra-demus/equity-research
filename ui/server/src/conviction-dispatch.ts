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
// by a max-concurrent cap and a per-day spawn cap so it can never run away. Spawns the CLI directly
// (same flags the launcher uses) and serializes per thesis itself, so it needs no launcher/admission
// surgery — the result shows up on the board via the conviction_state the validate run writes.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { CLAUDE_BIN, DEFAULT_MODEL, REPO_ROOT, STATE_DIR } from './config'
import { newsBus } from './news/bus'
import type { FeedItem } from './news/types'

const CONV = path.join(REPO_ROOT, 'screener', 'ledger', 'conviction')
const CHECKPOINTS = path.join(CONV, 'checkpoints.ndjson')
const TICKS = path.join(CONV, 'conviction.ndjson')
const STATE_SNAPS = path.join(CONV, 'conviction_state')
const BUDGET_FILE = path.join(STATE_DIR, 'conviction-dispatch.json')

const ENABLED = process.env.CONVICTION_LOOP_ENABLED === '1'
const TICK_MS = Math.max(60, Number(process.env.CONVICTION_TICK_SEC) || 600) * 1000
const MAX_CONCURRENT = Math.max(1, Number(process.env.CONVICTION_MAX_CONCURRENT) || 2)
const DAILY_CAP = Math.max(1, Number(process.env.CONVICTION_DAILY_CAP) || 12)
const MAX_TURNS = Math.max(10, Number(process.env.ENGINE_SCREENER_VALIDATE_MAX_TURNS) || 60)
const BUDGET_USD = Math.max(1, Number(process.env.ENGINE_SCREENER_VALIDATE_BUDGET_USD) || 10)
const WIRE_KINDS = new Set(['convergence_trigger', 'secondary_trigger', 'secondary_falsifier'])

const inflightCheckpoints = new Set<string>()
const inflightTheses = new Set<string>()
const wireFired = new Set<string>() // a checkpoint is wire-fired at most once

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

function spawnValidate(thesisId: string, checkpointId: string, why: string): boolean {
  if (inflightCheckpoints.has(checkpointId) || inflightTheses.has(thesisId)) return false
  if (inflightCheckpoints.size >= MAX_CONCURRENT) return false
  if (firedToday() >= DAILY_CAP) { log(`daily cap ${DAILY_CAP} reached — holding ${checkpointId}`); return false }
  inflightCheckpoints.add(checkpointId)
  inflightTheses.add(thesisId)
  bumpFired()
  const args = ['--print', `/screener:validate ${thesisId} ${checkpointId}`, '--output-format', 'stream-json', '--verbose',
    '--permission-mode', 'bypassPermissions', '--model', DEFAULT_MODEL, '--max-turns', String(MAX_TURNS), '--max-budget-usd', String(BUDGET_USD)]
  try {
    const child = spawn(CLAUDE_BIN, args, { cwd: REPO_ROOT, stdio: 'ignore', detached: true })
    const clear = () => { inflightCheckpoints.delete(checkpointId); inflightTheses.delete(thesisId) }
    child.on('exit', (code) => { clear(); log(`validate ${checkpointId} (${why}) exited ${code}`) })
    child.on('error', (e) => { clear(); log(`validate ${checkpointId} spawn error: ${e.message}`) })
    child.unref()
    log(`fired validate ${thesisId} ${checkpointId} (${why})`)
    return true
  } catch (e: any) {
    inflightCheckpoints.delete(checkpointId)
    inflightTheses.delete(thesisId)
    log(`could not spawn validate ${checkpointId}: ${e?.message || e}`)
    return false
  }
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

export function startConvictionLoop(): void {
  if (!ENABLED) {
    log('loop idle — set CONVICTION_LOOP_ENABLED=1 to auto-fire checkpoint checks (the board still shows progress; you can run /screener:validate by hand)')
    return
  }
  setTimeout(() => dispatchDueConvictionChecks(), 8000)
  const t = setInterval(() => dispatchDueConvictionChecks(), TICK_MS)
  t.unref?.()
  newsBus.subscribe((e) => { if (e.type === 'news-item') { try { onWireItem(e.item) } catch { /* a bad match never breaks ingest */ } } })
  log(`loop on — due reconciler every ${Math.round(TICK_MS / 1000)}s + wire accelerant · max ${MAX_CONCURRENT} concurrent, ${DAILY_CAP}/day, ~$${BUDGET_USD}/check`)
}
