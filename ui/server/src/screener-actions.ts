// Human overrides on screener theses — the cockpit's "move this idea" control. The override is an
// APPEND-ONLY ledger line (never an edit of the engine-owned thesis JSON): the board builder
// (scripts/update_board_index.py) applies the latest override per thesis as `effective_status`
// while the engine's own `status` stays visible — your call and the engine's verdict are never
// confused. Appends route through scripts/append-ndjson.sh (atomic-mkdir lock + idempotency key),
// the same path every other shared ledger uses.

import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT } from './config'

// async execFile (never execFileSync from a request handler — spawning bash synchronously blocks the
// single event loop; append-ndjson.sh serializes with its own mkdir lock, so concurrent async appends
// are as safe as the sequential sync ones were).
const execFileAsync = promisify(execFile)

export const MOVE_TARGETS = ['watchlist', 'provisional', 'full_machine', 'engine'] as const
export type MoveTarget = (typeof MOVE_TARGETS)[number]

export interface ThesisOverride {
  override_id: string
  kind: 'thesis_status'
  thesis_id: string
  from_status: string // the ENGINE status at move time — lets the board flag staleness later
  to_status: string | null // null = follow the engine again; 'watchlist' maps to watchlist_manual
  reason: string
  moved_by: string
  moved_at: string
}

const OVERRIDES = (repoRoot: string) => path.join(repoRoot, 'screener', 'ledger', 'overrides.ndjson')

function readThesisStatus(thesisId: string, repoRoot: string): string | null {
  try {
    const doc = JSON.parse(fs.readFileSync(path.join(repoRoot, 'screener', 'ledger', 'theses', `${thesisId}.json`), 'utf8'))
    const s = doc?.meta?.status ?? doc?.status
    return typeof s === 'string' ? s : null
  } catch {
    return null
  }
}

/**
 * Append a thesis-status override. Returns the record, or null when the thesis doesn't exist.
 * `to: 'engine'` clears the override (to_status null); `to: 'watchlist'` lands as watchlist_manual
 * so a hand-move is never confused with the engine's own watchlist reasons.
 */
export async function moveThesis(thesisId: string, to: MoveTarget, reason: string, user: string, repoRoot: string = REPO_ROOT): Promise<ThesisOverride | null> {
  const engineStatus = readThesisStatus(thesisId, repoRoot)
  if (engineStatus === null) return null
  const moved_at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const to_status = to === 'engine' ? null : to === 'watchlist' ? 'watchlist_manual' : to
  // every human move is a distinct event — a random id, so a move→clear→re-move within the same
  // second can never collide with the append script's idempotency key and silently drop the line
  const record: ThesisOverride = {
    override_id: `OVR-${moved_at.slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8)}`,
    kind: 'thesis_status',
    thesis_id: thesisId,
    from_status: engineStatus,
    to_status,
    reason: (reason || '').trim().slice(0, 500),
    moved_by: user,
    moved_at,
  }
  await execFileAsync('bash', [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), OVERRIDES(repoRoot), JSON.stringify(record), 'override_id', record.override_id], {
    cwd: repoRoot,
  })
  return record
}

export const SIGNAL_ACTIONS = ['hide', 'restore'] as const
export type SignalAction = (typeof SIGNAL_ACTIONS)[number]

/**
 * Hide (or restore) ONE idea from the live book — a SOFT delete. The record is an append-only override
 * line (same overrides.ndjson, same append path as moveThesis); the board builder applies the LATEST hide/
 * restore per signal as `hidden` on the signal entry. Nothing the engine wrote is touched — the run folder,
 * the event ledger and the audit trail all survive — so a restore simply un-hides it. Returns the record id.
 */
export async function hideSignal(signalId: string, action: SignalAction, user: string, repoRoot: string = REPO_ROOT): Promise<{ override_id: string }> {
  const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const kind = action === 'hide' ? 'signal_hide' : 'signal_restore'
  // random id (not a content hash): a hide→restore→hide within the same second must never collide on the
  // append script's idempotency key and get silently dropped — the same reason moveThesis uses a random id.
  const record = { override_id: `OVR-${at.slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8)}`, kind, signal_id: signalId, by: user, at }
  await execFileAsync('bash', [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), OVERRIDES(repoRoot), JSON.stringify(record), 'override_id', record.override_id], {
    cwd: repoRoot,
  })
  return { override_id: record.override_id }
}

/** Append an inbox dismiss/restore audit line (best-effort; the sweep file is the ground truth). */
export async function auditInboxAction(inboxId: string, action: 'inbox_dismiss' | 'inbox_restore', user: string, repoRoot: string = REPO_ROOT): Promise<void> {
  const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const hash = createHash('sha256').update(`${inboxId}|${action}|${at}`).digest('hex').slice(0, 8)
  const record = { override_id: `OVR-${at.slice(0, 10).replace(/-/g, '')}-${hash}`, kind: action, inbox_id: inboxId, by: user, at }
  try {
    await execFileAsync('bash', [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), OVERRIDES(repoRoot), JSON.stringify(record), 'override_id', record.override_id], {
      cwd: repoRoot,
    })
  } catch {
    // audit is best-effort
  }
}
