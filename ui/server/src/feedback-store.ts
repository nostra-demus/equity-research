// Cockpit-wide product feedback — a prominent "Feedback" surface where anyone behind Cloudflare Access
// can file a bug / UI note / idea (with screenshots), the whole team sees a folded list, and a gated
// one-click action later dispatches an item to a coding agent (feedback-dispatch.ts, PR B).
//
// APPEND-ONLY ledger, same shape as screener-feedback.ts: nothing is ever rewritten. A feedback item is
// one `feedback` line; every status change (triaged / dispatched / pr_open / assessed / done / wontfix)
// is a new `feedback_event` line referencing it by id. The folded view takes the item plus its latest
// event. Unlike the screener ledger (a tracked repo path), this is OPERATIONAL data like the activity
// log: it lives under STATE_DIR/feedback/ (gitignored, durable across restarts/deploys), and screenshots
// sit beside it in per-item folders — the one doer box serving the cockpit makes the list team-visible
// without any git churn.

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Transform, type Readable } from 'node:stream'
import { promisify } from 'node:util'
import { REPO_ROOT, STATE_DIR } from './config'

// async execFile (never execFileSync from a request handler — a sync bash spawn blocks the single event
// loop; append-ndjson.sh's own mkdir lock keeps concurrent async appends safe).
const execFileAsync = promisify(execFile)

export const FEEDBACK_CATEGORIES = ['bug', 'ui', 'idea', 'research_quality', 'other'] as const
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

// The lifecycle. `new` is implicit (an item with no events yet); the rest are appended as events.
export const FEEDBACK_STATUSES = ['new', 'triaged', 'dispatched', 'pr_open', 'assessed', 'done', 'wontfix'] as const
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

// Screenshots only — a subset of the upload allow-list. Kept local (not sniffed) because these files are
// only ever served back to the panel and read by the dispatched agent, never parsed as documents.
export const FEEDBACK_IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif'] as const
export const FEEDBACK_IMAGE_MAX_BYTES = 15 * 1024 * 1024 // 15 MB/image
export const FEEDBACK_MAX_IMAGES = 6
const TEXT_MAX = 8000
const URL_MAX = 400
const NOTE_MAX = 2000

export interface FeedbackItemRecord {
  feedback_id: string // FDB-YYYYMMDD-<8hex> — the item's canonical id + the append-ndjson idempotency key
  kind: 'feedback'
  text: string
  category: FeedbackCategory
  images: string[] // basenames under STATE_DIR/feedback/<feedback_id>/
  url: string // the cockpit route/page it was filed from
  user_id: string // identify(req).user — 'local' when unavailable, never blocks the write
  submitted_at: string
}

export interface FeedbackEventRecord {
  feedback_id: string // a FRESH unique id for THIS event line (idempotency key)
  kind: 'feedback_event'
  target_id: string // the FeedbackItemRecord.feedback_id this updates
  status: FeedbackStatus
  note: string // '' unless assessed / wontfix carry a reason
  pr_url: string | null // set when status === 'pr_open'
  user_id: string
  submitted_at: string
}

export type FeedbackRecord = FeedbackItemRecord | FeedbackEventRecord

// One item folded with its latest event — what the list renders.
export interface FeedbackView {
  feedback_id: string
  text: string
  category: FeedbackCategory
  images: string[]
  url: string
  user_id: string
  submitted_at: string
  status: FeedbackStatus
  pr_url: string | null
  note: string
  last_update_at: string
}

const FEEDBACK_DIR = (stateDir: string) => path.join(stateDir, 'feedback')
const LEDGER = (stateDir: string) => path.join(FEEDBACK_DIR(stateDir), 'feedback.ndjson')
export const itemDir = (feedbackId: string, stateDir: string = STATE_DIR) => path.join(FEEDBACK_DIR(stateDir), feedbackId)

export function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export function newFeedbackId(at: string = nowIso()): string {
  return `FDB-${at.slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8)}`
}

// FDB-YYYYMMDD-<8hex>. Anchored, so a route param can't smuggle a path segment into itemDir().
const FEEDBACK_ID_RE = /^FDB-\d{8}-[0-9a-f]{8}$/
export function isFeedbackId(s: string): boolean {
  return FEEDBACK_ID_RE.test(s)
}

async function appendLedger(record: FeedbackRecord, stateDir: string): Promise<void> {
  fs.mkdirSync(FEEDBACK_DIR(stateDir), { recursive: true })
  await execFileAsync(
    'bash',
    [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER(stateDir), JSON.stringify(record), 'feedback_id', record.feedback_id],
    { cwd: REPO_ROOT },
  )
}

/** Write a feedback ITEM. The id is minted by the caller (the route needs it first to name the image
 * folder before streaming screenshots into it). Every string field is clamped, like screener-feedback. */
export async function writeFeedbackItem(
  input: { feedback_id: string; text: string; category: FeedbackCategory; images: string[]; url: string },
  user: string,
  stateDir: string = STATE_DIR,
): Promise<FeedbackItemRecord> {
  const record: FeedbackItemRecord = {
    feedback_id: input.feedback_id,
    kind: 'feedback',
    text: (input.text || '').trim().slice(0, TEXT_MAX),
    category: FEEDBACK_CATEGORIES.includes(input.category) ? input.category : 'other',
    images: (input.images || []).slice(0, FEEDBACK_MAX_IMAGES),
    url: (input.url || '').slice(0, URL_MAX),
    user_id: user || 'local',
    submitted_at: nowIso(),
  }
  await appendLedger(record, stateDir)
  return record
}

/** Append a status event for an item. Returns null when the target item doesn't exist. */
export async function appendFeedbackEvent(
  targetId: string,
  status: FeedbackStatus,
  opts: { note?: string; prUrl?: string | null; user: string },
  stateDir: string = STATE_DIR,
): Promise<FeedbackEventRecord | null> {
  const items = readAllFeedback(stateDir).filter((r): r is FeedbackItemRecord => r.kind === 'feedback')
  if (!items.some((r) => r.feedback_id === targetId)) return null
  const at = nowIso()
  const record: FeedbackEventRecord = {
    feedback_id: newFeedbackId(at),
    kind: 'feedback_event',
    target_id: targetId,
    status: FEEDBACK_STATUSES.includes(status) ? status : 'triaged',
    note: (opts.note || '').trim().slice(0, NOTE_MAX),
    pr_url: opts.prUrl ? String(opts.prUrl).slice(0, URL_MAX) : null,
    user_id: opts.user || 'local',
    submitted_at: at,
  }
  await appendLedger(record, stateDir)
  return record
}

/** Read every ledger line. [] on a missing file (a fresh install has no feedback yet) — never throws. */
export function readAllFeedback(stateDir: string = STATE_DIR): FeedbackRecord[] {
  let raw: string
  try {
    raw = fs.readFileSync(LEDGER(stateDir), 'utf8')
  } catch {
    return []
  }
  const out: FeedbackRecord[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const parsed = JSON.parse(trimmed)
      // defensively require a real object (a corrupt/hand-edited line could be a primitive, null, or array)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) out.push(parsed as FeedbackRecord)
    } catch {
      // skip a malformed line rather than fail the whole read
    }
  }
  return out
}

/** Fold items + their latest events into the list view, newest item first. */
export function foldFeedback(records: FeedbackRecord[]): FeedbackView[] {
  const items = records.filter((r): r is FeedbackItemRecord => r.kind === 'feedback')
  // latest event per target, by submitted_at (ties: last line wins — append order is chronological)
  const latest = new Map<string, FeedbackEventRecord>()
  for (const r of records) {
    if (r.kind !== 'feedback_event') continue
    const cur = latest.get(r.target_id)
    if (!cur || r.submitted_at >= cur.submitted_at) latest.set(r.target_id, r)
  }
  return items
    .map((it): FeedbackView => {
      const ev = latest.get(it.feedback_id)
      return {
        feedback_id: it.feedback_id,
        text: it.text,
        category: it.category,
        images: it.images,
        url: it.url,
        user_id: it.user_id,
        submitted_at: it.submitted_at,
        status: ev?.status ?? 'new',
        pr_url: ev?.pr_url ?? null,
        note: ev?.note ?? '',
        last_update_at: ev?.submitted_at ?? it.submitted_at,
      }
    })
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
}

/** Validate a screenshot filename → a safe `<seq>.<ext>` basename (image exts only). */
export function safeImageName(rawName: string, seq: number): { ok: true; name: string } | { ok: false; reason: string } {
  const base = path.basename(String(rawName ?? '').split(/[\\/]/).pop() || '')
  const ext = base.includes('.') ? (base.split('.').pop() || '').toLowerCase() : ''
  if (!ext || !(FEEDBACK_IMAGE_EXTS as readonly string[]).includes(ext)) {
    return { ok: false, reason: `unsupported image type — allowed: ${FEEDBACK_IMAGE_EXTS.join(', ')}` }
  }
  // deterministic name — never trust the client's basename for the on-disk name (defeats ../, dotfiles,
  // control chars, collisions in one submission all at once).
  return { ok: true, name: `${seq}.${ext}` }
}

/**
 * Stream one screenshot into STATE_DIR/feedback/<feedbackId>/<seq>.<ext>, capped at FEEDBACK_IMAGE_MAX_BYTES.
 * tmp-then-rename so a partial write is never visible; on overflow the partial is removed and the source
 * drained. Returns the saved basename or a reason. `stream` is a multipart part.file (a Readable).
 */
export async function saveFeedbackImage(
  feedbackId: string,
  seq: number,
  rawName: string,
  stream: Readable,
  stateDir: string = STATE_DIR,
): Promise<{ ok: true; name: string } | { ok: false; reason: string }> {
  const safe = safeImageName(rawName, seq)
  if (!safe.ok) {
    stream.resume()
    return safe
  }
  const dir = itemDir(feedbackId, stateDir)
  fs.mkdirSync(dir, { recursive: true })
  const finalPath = path.join(dir, safe.name)
  const tmpPath = path.join(dir, `.tmp-${safe.name}`)
  let bytes = 0
  let overflow = false
  const counter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      bytes += chunk.length
      if (bytes > FEEDBACK_IMAGE_MAX_BYTES) {
        overflow = true
        cb(new Error('image too large'))
        return
      }
      cb(null, chunk)
    },
  })
  try {
    await pipeline(stream, counter, fs.createWriteStream(tmpPath))
    // the multipart parser's own fileSize limit can truncate the stream WITHOUT throwing (it just ends
    // early and sets .truncated) — reject that partial rather than rename + display a broken image.
    if ((stream as any).truncated) {
      try { fs.rmSync(tmpPath, { force: true }) } catch { /* best-effort */ }
      return { ok: false, reason: `image exceeds the ${Math.round(FEEDBACK_IMAGE_MAX_BYTES / (1024 * 1024))} MB limit` }
    }
    fs.renameSync(tmpPath, finalPath)
    return { ok: true, name: safe.name }
  } catch (e) {
    try { fs.rmSync(tmpPath, { force: true }) } catch { /* best-effort cleanup */ }
    stream.resume()
    if (overflow || (stream as any).truncated) {
      return { ok: false, reason: `image exceeds the ${Math.round(FEEDBACK_IMAGE_MAX_BYTES / (1024 * 1024))} MB limit` }
    }
    return { ok: false, reason: `could not save image (${(e as Error)?.message || 'stream error'})` }
  }
}

/** Absolute path of a stored image, CONFINED to the item's folder (defeats ../ in a route param). Returns
 * null if the id is malformed, the name isn't a plain image basename, or it escapes the folder. */
export function resolveFeedbackImage(feedbackId: string, name: string, stateDir: string = STATE_DIR): string | null {
  if (!isFeedbackId(feedbackId)) return null
  const dir = itemDir(feedbackId, stateDir)
  const full = path.resolve(dir, name)
  if (full !== dir && !full.startsWith(dir + path.sep)) return null // containment barrier
  const ext = full.includes('.') ? (full.split('.').pop() || '').toLowerCase() : ''
  if (!(FEEDBACK_IMAGE_EXTS as readonly string[]).includes(ext)) return null
  return full
}
