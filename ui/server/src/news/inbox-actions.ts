// Human actions on inbox rows — the cockpit's dismiss/restore buttons and the consumed-marking
// that fires when a row is promoted into the paid gauntlet. Sweep JSON is the UI projection and an
// append-only compact action ledger is the durable witness across archival corruption; mergeInbox also
// preserves consumed/launched/dismissed on every exact refresh.
// and the server + in-process ingester share one event loop, so a read-modify-write here is
// race-free against the scheduler. Writes are atomic (tmp + rename) — the same discipline as the
// python board builder — so a reader never sees a half-written file.

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { InboxRow } from './types'
import { eventIdFor } from './normalize'

const INBOX_DIR = (repoRoot: string) => path.join(repoRoot, 'screener', 'inbox')
const HUMAN_ACTION_LEDGER = (repoRoot: string) => path.join(repoRoot, 'screener', 'ledger', 'inbox-human-actions.ndjson')

export interface InboxHumanActionRecord {
  action_id: string
  inbox_id: string
  /** Immutable exact source observation. Unlike inbox_id, this survives slot reuse after an import or
   * data reset and lets a restore close only the dismissal created for these source bytes. */
  observation_id?: string
  action: 'dismissed' | 'restored' | 'consumed'
  action_at: string
  event_id?: string
  headline: string
  headline_en?: string | null
  source_is_english?: true
  url: string
  found_at: string
  observed_at?: string
  dedup_group?: string
  companies?: InboxRow['companies']
}

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

type ActionObservation = Pick<InboxHumanActionRecord, 'headline' | 'url'>

function observationIdFor(row: ActionObservation): string | null {
  const headline = typeof row.headline === 'string' ? row.headline.trim() : ''
  const url = typeof row.url === 'string' ? row.url.trim() : ''
  return headline && url ? eventIdFor(headline, url) : null
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

function appendHumanAction(repoRoot: string, row: InboxRow, action: InboxHumanActionRecord['action'], actionAt: string): string {
  const actionId = `IHA-${actionAt.slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 12)}`
  const observationId = observationIdFor(row)
  if (!observationId) throw new Error(`cannot persist human action for unidentified inbox row ${row.inbox_id}`)
  const record: InboxHumanActionRecord = {
    action_id: actionId,
    inbox_id: row.inbox_id,
    observation_id: observationId,
    action,
    action_at: actionAt,
    ...(typeof (row as InboxRow & { event_id?: unknown }).event_id === 'string'
      ? { event_id: String((row as InboxRow & { event_id?: string }).event_id) } : {}),
    headline: row.headline,
    ...(row.headline_en !== undefined ? { headline_en: row.headline_en } : {}),
    ...(row.source_is_english === true ? { source_is_english: true as const } : {}),
    url: row.url,
    found_at: row.found_at,
    ...(row.observed_at ? { observed_at: row.observed_at } : {}),
    ...(row.dedup_group ? { dedup_group: row.dedup_group } : {}),
    ...(Array.isArray(row.companies) ? { companies: row.companies } : {}),
  }
  const file = HUMAN_ACTION_LEDGER(repoRoot)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  // O_APPEND makes each compact line one atomic local write. Daily sweep projection remains an atomic
  // rename, while this independent history preserves the human decision across archival corruption.
  const fd = fs.openSync(file, 'a')
  try {
    fs.writeSync(fd, `${JSON.stringify(record)}\n`)
    fs.fsyncSync(fd)
  } finally { fs.closeSync(fd) }
  return actionId
}

/** Strictly read/fold the append-only action history. A malformed line makes completeness unknowable. */
export function readInboxHumanActions(repoRoot: string): { rows: InboxHumanActionRecord[]; complete: boolean } {
  let text: string
  try { text = fs.readFileSync(HUMAN_ACTION_LEDGER(repoRoot), 'utf8') }
  catch (error: any) {
    return error?.code === 'ENOENT' ? { rows: [], complete: true } : { rows: [], complete: false }
  }
  const consumed = new Map<string, InboxHumanActionRecord>()
  const dismissed = new Map<string, InboxHumanActionRecord>()
  for (const line of text.split('\n').filter(Boolean)) {
    try {
      const row = JSON.parse(line) as InboxHumanActionRecord
      if (!row || typeof row.action_id !== 'string' || typeof row.inbox_id !== 'string'
        || !['dismissed', 'restored', 'consumed'].includes(row.action)
        || !Number.isFinite(Date.parse(row.action_at)) || typeof row.headline !== 'string'
        || typeof row.url !== 'string' || typeof row.found_at !== 'string') return { rows: [], complete: false }
      // Pre-schema records remain readable because headline+URL were required from the first ledger
      // version. If a new record's explicit identity disagrees with those immutable bytes, completeness
      // is unknowable and Ideas must fail closed rather than fold under either value.
      const derivedObservationId = observationIdFor(row)
      if (!derivedObservationId
        || (row.observation_id !== undefined && row.observation_id !== derivedObservationId)) {
        return { rows: [], complete: false }
      }
      const normalized = { ...row, observation_id: derivedObservationId }
      if (row.action === 'consumed') consumed.set(derivedObservationId, normalized)
      else if (row.action === 'dismissed') dismissed.set(derivedObservationId, normalized)
      else dismissed.delete(derivedObservationId)
    } catch { return { rows: [], complete: false } }
  }
  return { rows: [...consumed.values(), ...dismissed.values()], complete: true }
}

/** Set or clear a row's dismissed state. Returns the updated row, or null when the id is unknown. */
export function setDismissed(repoRoot: string, inboxId: string, dismissed: boolean, user: string): InboxRow | null {
  const hit = findRow(repoRoot, inboxId)
  if (!hit) return null
  if ((hit.row.dismissed === true) === dismissed) return hit.row
  const actionAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  hit.row.human_action_id = appendHumanAction(repoRoot, hit.row, dismissed ? 'dismissed' : 'restored', actionAt)
  if (dismissed) {
    hit.row.dismissed = true
    hit.row.dismissed_at = actionAt
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
  if (!hit.row.consumed_at) hit.row.consumed_at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const observationId = observationIdFor(hit.row)
  if (!observationId) throw new Error(`cannot consume unidentified inbox row ${inboxId}`)
  const durableActions = readInboxHumanActions(repoRoot)
  // A corrupt ledger never proves idempotence. Append the requested action so recovery/repair still has
  // a durable witness; the reader will continue to fail closed until the malformed history is repaired.
  const hasDurableConsume = durableActions.complete && durableActions.rows
    .some((record) => record.observation_id === observationId && record.action === 'consumed')
  if (!hasDurableConsume) hit.row.human_action_id = appendHumanAction(repoRoot, hit.row, 'consumed', hit.row.consumed_at)
  hit.row.consumed = true
  hit.row.launched_signal_id = sigId
  writeAtomic(hit.file, hit.doc)
  return hit.row
}
