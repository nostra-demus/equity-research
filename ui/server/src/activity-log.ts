import fs from 'node:fs'
import path from 'node:path'
import { ACTIVITY_LOG_PATH, STATE_DIR } from './config'
import type { RunKind, RunStatus } from './types'

// Perpetual, append-only audit log of who ran what, when, on which company. One JSON object per line
// (JSONL). Never rotated or truncated, so the full history is always recoverable. A run writes a
// `launched` line when it spawns and a `finished` line when it ends; the read API folds the two by
// runId into one row. Identity comes from Cloudflare Access (the engine sits behind it), falling back
// to "local" for direct/dev access.

export type ActivityEventType = 'launched' | 'finished'

export interface ActivityEvent {
  v: 1
  ts: number // epoch ms
  event: ActivityEventType
  runId: string
  user: string // authenticated email, or "local" (dev / direct)
  userVia: 'cf-access' | 'local'
  kind: RunKind // full | module | agent | rerun
  ticker: string
  module?: string
  agent?: string
  model?: string
  // finished-only
  status?: RunStatus
  costUsd?: number
  durationMs?: number
  numTurns?: number
  note?: string // e.g. why a run ended incomplete
}

// One run, folded from its launched (+ optional finished) events for the activity table.
export interface ActivityRow {
  runId: string
  user: string
  userVia: 'cf-access' | 'local'
  kind: RunKind
  ticker: string
  module?: string
  agent?: string
  model?: string
  launchedAt: number
  finishedAt?: number
  status: RunStatus // from the finished event; 'running' if none yet
  costUsd?: number
  durationMs?: number
  numTurns?: number
  note?: string
}

function append(ev: ActivityEvent) {
  if (process.env.ENGINE_ACTIVITY_LOG_DISABLED === '1') return // tests: keep the perpetual audit log free of fixture runs
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true })
    fs.appendFileSync(ACTIVITY_LOG_PATH, JSON.stringify(ev) + '\n')
  } catch {
    // never let audit-logging break a run; a failed append is logged to stderr only
    // eslint-disable-next-line no-console
    console.error('[activity-log] append failed for run', ev.runId)
  }
}

export function logLaunch(e: Omit<ActivityEvent, 'v' | 'event' | 'ts'>) {
  append({ v: 1, event: 'launched', ts: Date.now(), ...e })
}

export function logFinish(e: Omit<ActivityEvent, 'v' | 'event' | 'ts'>) {
  append({ v: 1, event: 'finished', ts: Date.now(), ...e })
}

export interface ActivityQuery {
  from?: number // epoch ms (inclusive)
  to?: number // epoch ms (inclusive)
  ticker?: string
  kind?: RunKind
  user?: string
  status?: RunStatus
  q?: string // free-text across user/ticker/module/agent
  limit?: number // rows returned (default 500)
}

export interface ActivityResult {
  rows: ActivityRow[]
  total: number // rows matching the filter (before limit)
  allTime: number // total runs ever recorded
  users: string[] // distinct users (for the filter dropdown)
  tickers: string[] // distinct tickers
  earliest: number | null // ts of the first record ever (perpetual-history anchor)
}

function readAllEvents(): ActivityEvent[] {
  let raw: string
  try {
    raw = fs.readFileSync(ACTIVITY_LOG_PATH, 'utf8')
  } catch {
    return [] // no log yet
  }
  const out: ActivityEvent[] = []
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      const ev = JSON.parse(t) as ActivityEvent
      if (ev && ev.runId && ev.event) out.push(ev)
    } catch {
      // skip a corrupt/partial line rather than failing the whole read
    }
  }
  return out
}

// Fold events into one row per run (launched seeds it; finished overlays outcome).
function foldRows(events: ActivityEvent[]): ActivityRow[] {
  const byRun = new Map<string, ActivityRow>()
  for (const ev of events) {
    let row = byRun.get(ev.runId)
    if (!row) {
      row = {
        runId: ev.runId,
        user: ev.user,
        userVia: ev.userVia,
        kind: ev.kind,
        ticker: ev.ticker,
        module: ev.module,
        agent: ev.agent,
        model: ev.model,
        launchedAt: ev.ts,
        status: 'running',
      }
      byRun.set(ev.runId, row)
    }
    if (ev.event === 'launched') {
      row.launchedAt = ev.ts
      // a launched event carries the authoritative identity/target
      row.user = ev.user
      row.userVia = ev.userVia
      row.kind = ev.kind
      row.ticker = ev.ticker
      row.module = ev.module
      row.agent = ev.agent
      row.model = ev.model
    } else if (ev.event === 'finished') {
      row.finishedAt = ev.ts
      row.status = ev.status ?? 'done'
      if (ev.costUsd != null) row.costUsd = ev.costUsd
      if (ev.durationMs != null) row.durationMs = ev.durationMs
      if (ev.numTurns != null) row.numTurns = ev.numTurns
      if (ev.note) row.note = ev.note
    }
  }
  return [...byRun.values()]
}

export function readActivity(query: ActivityQuery = {}): ActivityResult {
  const events = readAllEvents()
  const allRows = foldRows(events).sort((a, b) => b.launchedAt - a.launchedAt)

  const users = [...new Set(allRows.map((r) => r.user))].sort()
  const tickers = [...new Set(allRows.map((r) => r.ticker))].sort()
  const earliest = events.length ? Math.min(...events.map((e) => e.ts)) : null

  const q = query.q?.trim().toLowerCase()
  const matched = allRows.filter((r) => {
    if (query.from != null && r.launchedAt < query.from) return false
    if (query.to != null && r.launchedAt > query.to) return false
    if (query.ticker && r.ticker !== query.ticker) return false
    if (query.kind && r.kind !== query.kind) return false
    if (query.user && r.user !== query.user) return false
    if (query.status && r.status !== query.status) return false
    if (q) {
      const hay = `${r.user} ${r.ticker} ${r.module ?? ''} ${r.agent ?? ''} ${r.kind}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const limit = Math.max(1, Math.min(5000, query.limit ?? 500))
  return {
    rows: matched.slice(0, limit),
    total: matched.length,
    allTime: allRows.length,
    users,
    tickers,
    earliest,
  }
}
