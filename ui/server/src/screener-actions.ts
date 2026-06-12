// Human overrides on screener theses — the cockpit's "move this idea" control. The override is an
// APPEND-ONLY ledger line (never an edit of the engine-owned thesis JSON): the board builder
// (scripts/update_board_index.py) applies the latest override per thesis as `effective_status`
// while the engine's own `status` stays visible — your call and the engine's verdict are never
// confused. Appends route through scripts/append-ndjson.sh (atomic-mkdir lock + idempotency key),
// the same path every other shared ledger uses.

import { execFileSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'

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
export function moveThesis(thesisId: string, to: MoveTarget, reason: string, user: string, repoRoot: string = REPO_ROOT): ThesisOverride | null {
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
  execFileSync('bash', [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), OVERRIDES(repoRoot), JSON.stringify(record), 'override_id', record.override_id], {
    cwd: repoRoot,
    stdio: 'ignore',
  })
  return record
}

/** Append an inbox dismiss/restore audit line (best-effort; the sweep file is the ground truth). */
export function auditInboxAction(inboxId: string, action: 'inbox_dismiss' | 'inbox_restore', user: string, repoRoot: string = REPO_ROOT): void {
  const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const hash = createHash('sha256').update(`${inboxId}|${action}|${at}`).digest('hex').slice(0, 8)
  const record = { override_id: `OVR-${at.slice(0, 10).replace(/-/g, '')}-${hash}`, kind: action, inbox_id: inboxId, by: user, at }
  try {
    execFileSync('bash', [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), OVERRIDES(repoRoot), JSON.stringify(record), 'override_id', record.override_id], {
      cwd: repoRoot,
      stdio: 'ignore',
    })
  } catch {
    // audit is best-effort
  }
}
