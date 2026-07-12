// The audit + control layer for automatic rank-weight changes. rank-weights.ts overwrites its JSON in
// place with no history; this adds the "who/what/when/why" the auto-tune loop needs to be auditable and
// correctable:
//   - an APPEND-ONLY changes ledger (STATE_DIR/rank-weights-changes.jsonl) — one line per applied nudge,
//     carrying the before/after per weight, the feedback ids that drove it, and the backtest result;
//   - REVERT as a second (tombstone) line that restores the before-values — never a rewrite, same shape
//     as the feedback ledger's undo (screener-feedback.ts);
//   - PIN / PAUSE state (STATE_DIR/rank-weights-autotune.json) — a pinned weight the loop won't touch and
//     a global pause switch, both runtime-editable from the Scoring panel with no redeploy.
// Everything is best-effort-read (a missing file = empty history / defaults) but STRICT-write for an
// apply record: appendChange throws so the orchestrator can refuse to move a weight it can't record.

import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from '../config'
import { saveRankWeights, type RankWeights } from './rank-weights'

const CHANGES_FILE = path.join(STATE_DIR, 'rank-weights-changes.jsonl')
const STATE_FILE = path.join(STATE_DIR, 'rank-weights-autotune.json')

export interface WeightDelta {
  dimension: string
  category: string
  before: number
  after: number
}

export interface Backtest {
  holdout_evaluable: number
  directional_improvement: number | null
  passes: boolean | null
}

export interface WeightChange {
  v: 1
  change_id: string
  ts: string
  actor: string // 'auto' for the loop, or a user id for a manual apply/revert
  kind: 'apply' | 'revert'
  reverts?: string // the change_id this revert undoes (kind === 'revert')
  status?: string // the tuner status behind an apply ('recommendations')
  deltas: WeightDelta[]
  evidence_feedback_ids?: string[] // the feedback that drove the change — clicks back to the reasons
  backtest?: Backtest | null
  tuner_generated_at?: string
  note?: string
  reverted?: boolean // computed on read, never persisted
}

export interface AutotuneState {
  paused: boolean
  pins: string[] // "dimension:category", e.g. "scope:macro" — the loop skips these
  daily: { date: string; count: number }
}

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}
function today(): string {
  return new Date().toISOString().slice(0, 10)
}
function newChangeId(): string {
  return `CHG-${nowIso().replace(/[-:TZ]/g, '').slice(0, 14)}-${randomUUID().slice(0, 6)}`
}

function readChangesRaw(): WeightChange[] {
  let raw: string
  try {
    raw = fs.readFileSync(CHANGES_FILE, 'utf8')
  } catch {
    return []
  }
  const out: WeightChange[] = []
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      out.push(JSON.parse(t) as WeightChange)
    } catch {
      /* skip a malformed line rather than fail the whole read */
    }
  }
  return out
}

/** Newest-first history, each apply flagged `reverted` when a later revert line names it. */
export function readChanges(): WeightChange[] {
  const all = readChangesRaw()
  const reverted = new Set(all.filter((c) => c.kind === 'revert' && c.reverts).map((c) => c.reverts as string))
  return all.map((c) => (c.kind === 'apply' ? { ...c, reverted: reverted.has(c.change_id) } : c)).reverse()
}

/** Append one change line. STRICT: throws on a write failure so a caller can refuse to apply unaudited. */
export function appendChange(c: WeightChange): WeightChange {
  fs.mkdirSync(path.dirname(CHANGES_FILE), { recursive: true })
  fs.appendFileSync(CHANGES_FILE, JSON.stringify(c) + '\n')
  return c
}

/** Record an applied nudge (audit-FIRST — the orchestrator calls this before it moves the weights). */
export function recordApply(params: {
  actor: string
  deltas: WeightDelta[]
  evidence_feedback_ids?: string[]
  backtest?: Backtest | null
  status?: string
  tuner_generated_at?: string
  note?: string
}): WeightChange {
  return appendChange({ v: 1, change_id: newChangeId(), ts: nowIso(), kind: 'apply', ...params })
}

/**
 * Revert a prior apply: restore its before-values via saveRankWeights and append a tombstone line.
 * Returns null when the change_id is unknown or already reverted. Restores the weights even if the
 * tombstone write then fails (a safe prior state beats a blocked revert), surfacing the error to the caller.
 */
export function revertChange(changeId: string, actor: string): WeightChange | null {
  const all = readChangesRaw()
  const target = all.find((c) => c.change_id === changeId && c.kind === 'apply')
  if (!target) return null
  if (all.some((c) => c.kind === 'revert' && c.reverts === changeId)) return null

  const patch: Partial<RankWeights> = {}
  for (const d of target.deltas) {
    ;(patch as any)[d.dimension] = (patch as any)[d.dimension] || {}
    ;(patch as any)[d.dimension][d.category] = d.before
  }
  saveRankWeights(patch)
  return appendChange({
    v: 1,
    change_id: newChangeId(),
    ts: nowIso(),
    actor,
    kind: 'revert',
    reverts: changeId,
    deltas: target.deltas.map((d) => ({ dimension: d.dimension, category: d.category, before: d.after, after: d.before })),
    note: `reverted ${changeId}`,
  })
}

/** Current pause/pins/daily-count state — defaults (unpaused, no pins) when the file is absent. */
export function getAutotuneState(): AutotuneState {
  let s: any = null
  try {
    s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
  } catch {
    s = null
  }
  const daily = s?.daily?.date === today() ? { date: s.daily.date, count: Number(s.daily.count) || 0 } : { date: today(), count: 0 }
  return {
    paused: Boolean(s?.paused),
    pins: Array.isArray(s?.pins) ? s.pins.filter((x: any) => typeof x === 'string') : [],
    daily,
  }
}

function writeState(s: AutotuneState): void {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
    fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2))
  } catch {
    /* best-effort; the in-file state governs, a lost write just means defaults next read */
  }
}

export function setAutotunePaused(paused: boolean): AutotuneState {
  const s = getAutotuneState()
  s.paused = paused
  writeState(s)
  return s
}

export function setAutotunePins(pins: string[]): AutotuneState {
  const s = getAutotuneState()
  s.pins = [...new Set(pins.filter((p) => typeof p === 'string' && p.includes(':')))]
  writeState(s)
  return s
}

export function bumpAutotuneDaily(): void {
  const s = getAutotuneState()
  s.daily = { date: today(), count: s.daily.count + 1 }
  writeState(s)
}
