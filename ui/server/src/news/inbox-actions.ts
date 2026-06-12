// Human actions on inbox rows — the cockpit's dismiss/restore buttons and the consumed-marking
// that fires when a row is promoted into the paid gauntlet. The sweep JSON is the ground truth for
// this human state (mergeInbox explicitly preserves consumed/launched/dismissed on every merge),
// and the server + in-process ingester share one event loop, so a read-modify-write here is
// race-free against the scheduler. Writes are atomic (tmp + rename) — the same discipline as the
// python board builder — so a reader never sees a half-written file.

import fs from 'node:fs'
import path from 'node:path'
import type { InboxRow } from './types'

const INBOX_DIR = (repoRoot: string) => path.join(repoRoot, 'screener', 'inbox')

interface SweepDoc {
  date?: string
  updated_at?: string
  rows?: InboxRow[]
  [k: string]: unknown
}

interface Located {
  file: string
  doc: SweepDoc
  row: InboxRow
}

/** Find the sweep file holding an inbox row, newest file first. */
function findRow(repoRoot: string, inboxId: string): Located | null {
  let files: string[]
  try {
    files = fs
      .readdirSync(INBOX_DIR(repoRoot))
      .filter((f) => f.endsWith('_sweep.json'))
      .sort()
      .reverse()
  } catch {
    return null
  }
  for (const f of files) {
    const file = path.join(INBOX_DIR(repoRoot), f)
    try {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as SweepDoc
      const row = (doc.rows || []).find((r) => r?.inbox_id === inboxId)
      if (row) return { file, doc, row }
    } catch {
      // unreadable file — keep looking
    }
  }
  return null
}

function writeAtomic(file: string, doc: SweepDoc): void {
  doc.updated_at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const tmp = `${file}.tmp.${process.pid}`
  try {
    fs.writeFileSync(tmp, JSON.stringify(doc, null, 2) + '\n')
    fs.renameSync(tmp, file)
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
  }
}

/** Set or clear a row's dismissed state. Returns the updated row, or null when the id is unknown. */
export function setDismissed(repoRoot: string, inboxId: string, dismissed: boolean, user: string): InboxRow | null {
  const hit = findRow(repoRoot, inboxId)
  if (!hit) return null
  if (dismissed) {
    hit.row.dismissed = true
    hit.row.dismissed_at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    hit.row.dismissed_by = user
  } else {
    delete hit.row.dismissed
    delete hit.row.dismissed_at
    delete hit.row.dismissed_by
  }
  writeAtomic(hit.file, hit.doc)
  return hit.row
}

/** Mark a row consumed by a launched signal run. Idempotent; unknown ids are a logged no-op. */
export function markInboxConsumed(repoRoot: string, inboxId: string, sigId: string): InboxRow | null {
  const hit = findRow(repoRoot, inboxId)
  if (!hit) return null
  hit.row.consumed = true
  hit.row.launched_signal_id = sigId
  writeAtomic(hit.file, hit.doc)
  return hit.row
}
