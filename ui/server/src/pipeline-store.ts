// Data-pipeline ledger — the append-only record behind the cockpit's "Data Pipeline" panel: a user adds a
// SOURCE (a website / API endpoint) against a run's open data_needs, a read-only agent SCANS its relevance,
// and — if it clears the bar — a coding agent BUILDS a durable connector and opens a PR. This module owns the
// durable state of that loop.
//
// APPEND-ONLY, same shape + guarantees as feedback-store.ts: nothing is ever rewritten. One added source is a
// single `pipeline_source` line; every step (scanning / scanned / building / pr_open / assessed / done /
// wontfix) is a new `pipeline_event` line referencing it by id. The folded view = the source plus its latest
// event (+ the scan verdict once scanned). Like the feedback ledger this is OPERATIONAL data, not a tracked
// repo path: it lives under STATE_DIR/pipeline/ (gitignored, durable across restarts/deploys). A connector's
// CODE lands via a PR (§28) — only the pipeline BOOK-KEEPING lives here.

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT, STATE_DIR } from './config'

// async execFile (never sync from a request handler — a sync bash spawn blocks the single event loop;
// append-ndjson.sh's own kernel lock keeps concurrent async appends safe).
const execFileAsync = promisify(execFile)

// How the user says they think the source is reached (a hint for the scan/build — the scan re-derives it).
export const PIPELINE_SOURCE_KINDS = ['api', 'scrape', 'web', 'file'] as const
export type PipelineSourceKind = (typeof PIPELINE_SOURCE_KINDS)[number]

// The lifecycle. `new` is implicit (a source with no events yet); the rest are appended as events.
export const PIPELINE_STATUSES = ['new', 'scanning', 'scanned', 'building', 'pr_open', 'assessed', 'done', 'wontfix'] as const
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number]

// What the read-only scan agent decided about a source's fit against the run's open data_needs. The tier
// stays inside the §4 connector-eligible band {5,9,10} (never a filing); relevance is the headline verdict.
export const SCAN_RELEVANCE = ['exact', 'partial', 'none'] as const
export type ScanRelevance = (typeof SCAN_RELEVANCE)[number]
export interface ScanVerdict {
  relevance: ScanRelevance
  confidence: number // 0-100
  series: string // the concrete data series this source provides, in plain English
  matched_need_ids: string[] // the open need_id(s) it would satisfy (exact) or help (partial); [] if none
  entry_modules: string[] // the orb(s) it feeds — the modules that consume the series
  acquisition: string // official_api | free_key_api | paid_api | scrape | manual
  tier: number // 5 | 9 | 10 — the §4 tier a connector for this source would earn
  cadence: string // connector release cadence; vocabulary is defined by connector-registry.ts CADENCE_MS
  host: string // the single host a connector may reach (the host_allowlist entry)
  endpoint_hint: string // the concrete URL / API endpoint to fetch
  verdict_note: string // plain-English why it does / doesn't help
  buildable: boolean // false = advisory only (e.g. needs a login/filing; no durable public connector)
}

const TEXT_MAX = 4000
const URL_MAX = 2000
const NOTE_MAX = 2000
const SERIES_MAX = 400

export interface PipelineSourceRecord {
  pipeline_id: string // PIPE-YYYYMMDD-<8hex> — the source's canonical id + the append-ndjson idempotency key
  kind: 'pipeline_source'
  subject: string // uppercased ticker / commodity
  swarm: string // swarm id (research | commodity | …)
  need_id: string | null // the data_need this source targets, or null = free-form "does this help anywhere?"
  series_hint: string // what the user thinks it provides (optional)
  source_url: string // the website / API endpoint
  source_kind: PipelineSourceKind
  sample: string // an optional pasted sample row / JSON so the scan can judge the actual data shape
  note: string
  user_id: string
  submitted_at: string
}

export interface PipelineEventRecord {
  pipeline_id: string // a FRESH unique id for THIS event line (idempotency key)
  kind: 'pipeline_event'
  target_id: string // the PipelineSourceRecord.pipeline_id this updates
  status: PipelineStatus
  verdict: ScanVerdict | null // set on status === 'scanned'
  note: string
  pr_url: string | null // set on status === 'pr_open'
  // The connector slug the build actually authored, when it authored one. This is the JOIN that lets the
  // cockpit follow a build past its PR: once the PR merges and the feed appears in the registry, the id links
  // the ledger row to that connector's live fetch health — which is what turns "PR open" into a truthful
  // "built, live, feeding the pool" instead of a claim nobody checked. Optional: older lines predate it.
  connector_id?: string | null
  user_id: string
  submitted_at: string
}

export type PipelineRecord = PipelineSourceRecord | PipelineEventRecord

// One source folded with its latest event — what the panel renders.
export interface PipelineView {
  pipeline_id: string
  subject: string
  swarm: string
  need_id: string | null
  series_hint: string
  source_url: string
  source_kind: PipelineSourceKind
  sample: string
  note: string
  user_id: string
  submitted_at: string
  status: PipelineStatus
  verdict: ScanVerdict | null
  pr_url: string | null
  connector_id: string | null
  last_note: string
  last_update_at: string
}

const PIPELINE_DIR = (stateDir: string) => path.join(stateDir, 'pipeline')
const LEDGER = (stateDir: string) => path.join(PIPELINE_DIR(stateDir), 'pipeline.ndjson')

export function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export function newPipelineId(at: string = nowIso()): string {
  return `PIPE-${at.slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8)}`
}

// PIPE-YYYYMMDD-<8hex>. Anchored, so a route param can't smuggle a path segment anywhere it is used.
const PIPELINE_ID_RE = /^PIPE-\d{8}-[0-9a-f]{8}$/
// A connector folder slug (mirrors the registry's own id rule) — anchored for the same reason.
const CONNECTOR_SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,120}$/
export function isPipelineId(s: string): boolean {
  return PIPELINE_ID_RE.test(s)
}

async function appendLedger(record: PipelineRecord, stateDir: string): Promise<void> {
  fs.mkdirSync(PIPELINE_DIR(stateDir), { recursive: true })
  await execFileAsync(
    'bash',
    [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER(stateDir), JSON.stringify(record), 'pipeline_id', record.pipeline_id],
    { cwd: REPO_ROOT },
  )
}

/** Write a pipeline SOURCE. Every free-text field is clamped, like feedback/screener. Returns the record. */
export async function writePipelineSource(
  input: {
    subject: string
    swarm: string
    need_id: string | null
    series_hint?: string
    source_url: string
    source_kind: PipelineSourceKind
    sample?: string
    note?: string
  },
  user: string,
  stateDir: string = STATE_DIR,
): Promise<PipelineSourceRecord> {
  const at = nowIso()
  const record: PipelineSourceRecord = {
    pipeline_id: newPipelineId(at),
    kind: 'pipeline_source',
    subject: (input.subject || '').toUpperCase().slice(0, 64),
    swarm: (input.swarm || '').slice(0, 64),
    need_id: input.need_id ? String(input.need_id).slice(0, 128) : null,
    series_hint: (input.series_hint || '').trim().slice(0, SERIES_MAX),
    source_url: (input.source_url || '').trim().slice(0, URL_MAX),
    source_kind: PIPELINE_SOURCE_KINDS.includes(input.source_kind) ? input.source_kind : 'web',
    sample: (input.sample || '').slice(0, TEXT_MAX),
    note: (input.note || '').trim().slice(0, NOTE_MAX),
    user_id: user || 'local',
    submitted_at: at,
  }
  await appendLedger(record, stateDir)
  return record
}

/** Append a status event for a source. Returns null when the target source doesn't exist. */
export async function appendPipelineEvent(
  targetId: string,
  status: PipelineStatus,
  opts: { verdict?: ScanVerdict | null; note?: string; prUrl?: string | null; connectorId?: string | null; user: string },
  stateDir: string = STATE_DIR,
): Promise<PipelineEventRecord | null> {
  const sources = readAllPipeline(stateDir).filter((r): r is PipelineSourceRecord => r.kind === 'pipeline_source')
  if (!sources.some((r) => r.pipeline_id === targetId)) return null
  const at = nowIso()
  const record: PipelineEventRecord = {
    pipeline_id: newPipelineId(at),
    kind: 'pipeline_event',
    target_id: targetId,
    status: PIPELINE_STATUSES.includes(status) ? status : 'scanned',
    verdict: opts.verdict ? sanitizeVerdict(opts.verdict) : null,
    note: (opts.note || '').trim().slice(0, NOTE_MAX),
    pr_url: opts.prUrl ? String(opts.prUrl).slice(0, URL_MAX) : null,
    // clamped to the connector-folder slug shape — it is agent output, and it is later matched against the
    // discovered manifests, so anything that is not a plain slug is dropped rather than stored
    connector_id: typeof opts.connectorId === 'string' && CONNECTOR_SLUG_RE.test(opts.connectorId) ? opts.connectorId : null,
    user_id: opts.user || 'local',
    submitted_at: at,
  }
  await appendLedger(record, stateDir)
  return record
}

// Defensively clamp a verdict before it is persisted (it comes from an agent reading an untrusted source).
const TIERS = new Set([5, 9, 10])
export function sanitizeVerdict(v: any): ScanVerdict {
  const rel: ScanRelevance = SCAN_RELEVANCE.includes(v?.relevance) ? v.relevance : 'none'
  const conf = Number(v?.confidence)
  const tierN = Number(v?.tier)
  const asArr = (x: any) => (Array.isArray(x) ? x.filter((s) => typeof s === 'string' && s).map((s) => s.slice(0, 128)).slice(0, 12) : [])
  return {
    relevance: rel,
    confidence: Number.isFinite(conf) ? Math.max(0, Math.min(100, Math.round(conf))) : 0,
    series: String(v?.series ?? '').slice(0, SERIES_MAX),
    matched_need_ids: asArr(v?.matched_need_ids),
    entry_modules: asArr(v?.entry_modules),
    acquisition: String(v?.acquisition ?? '').slice(0, 40),
    tier: TIERS.has(tierN) ? tierN : (rel === 'none' ? 10 : 9),
    cadence: String(v?.cadence ?? '').slice(0, 40),
    host: String(v?.host ?? '').slice(0, 253),
    endpoint_hint: String(v?.endpoint_hint ?? '').slice(0, URL_MAX),
    verdict_note: String(v?.verdict_note ?? '').slice(0, NOTE_MAX),
    buildable: v?.buildable === true,
  }
}

/** Read every ledger line. [] on a missing file (a fresh install has no pipeline yet) — never throws. */
export function readAllPipeline(stateDir: string = STATE_DIR): PipelineRecord[] {
  let raw: string
  try {
    raw = fs.readFileSync(LEDGER(stateDir), 'utf8')
  } catch {
    return []
  }
  const out: PipelineRecord[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) out.push(parsed as PipelineRecord)
    } catch {
      // skip a malformed line rather than fail the whole read
    }
  }
  return out
}

/** Fold sources + their latest events into the list view, newest source first. */
export function foldPipeline(records: PipelineRecord[]): PipelineView[] {
  const sources = records.filter((r): r is PipelineSourceRecord => r.kind === 'pipeline_source')
  const latest = new Map<string, PipelineEventRecord>()
  for (const r of records) {
    if (r.kind !== 'pipeline_event') continue
    const cur = latest.get(r.target_id)
    if (!cur || r.submitted_at >= cur.submitted_at) latest.set(r.target_id, r)
  }
  // the verdict may have landed on the `scanned` event even if a later `building`/`pr_open` event supersedes
  // the status — so carry the most recent NON-null verdict forward, not only the latest event's. Same for the
  // PR url and the connector slug: they land on `pr_open` and must survive any later `done`/`wontfix` line.
  const latestVerdict = new Map<string, ScanVerdict>()
  const latestPrUrl = new Map<string, string>()
  const latestConnector = new Map<string, string>()
  for (const r of records) {
    if (r.kind !== 'pipeline_event') continue
    if (r.verdict) latestVerdict.set(r.target_id, r.verdict) // records are chronological → last write wins
    if (r.pr_url) latestPrUrl.set(r.target_id, r.pr_url)
    if (r.connector_id) latestConnector.set(r.target_id, r.connector_id)
  }
  return sources
    .map((s): PipelineView => {
      const ev = latest.get(s.pipeline_id)
      return {
        pipeline_id: s.pipeline_id,
        subject: s.subject,
        swarm: s.swarm,
        need_id: s.need_id,
        series_hint: s.series_hint,
        source_url: s.source_url,
        source_kind: s.source_kind,
        sample: s.sample,
        note: s.note,
        user_id: s.user_id,
        submitted_at: s.submitted_at,
        status: ev?.status ?? 'new',
        verdict: latestVerdict.get(s.pipeline_id) ?? ev?.verdict ?? null,
        pr_url: latestPrUrl.get(s.pipeline_id) ?? ev?.pr_url ?? null,
        connector_id: latestConnector.get(s.pipeline_id) ?? null,
        last_note: ev?.note ?? '',
        last_update_at: ev?.submitted_at ?? s.submitted_at,
      }
    })
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
}

/**
 * The folded pipeline view ACROSS every subject, most recently updated first — what the cross-swarm Data
 * Library shows as "feeds being built". Ordered by last activity (not submission) so an old source that just
 * opened a PR rises to the top, which is what a reader watching a build actually wants to see.
 */
export function listRecentPipeline(limit = 40, stateDir: string = STATE_DIR): PipelineView[] {
  return foldPipeline(readAllPipeline(stateDir))
    .sort((a, b) => b.last_update_at.localeCompare(a.last_update_at))
    .slice(0, Math.max(1, Math.min(200, limit)))
}

/** The folded pipeline view for ONE subject+swarm, newest first. */
export function listPipelineForSubject(swarm: string, subject: string, stateDir: string = STATE_DIR): PipelineView[] {
  const want = (subject || '').toUpperCase()
  return foldPipeline(readAllPipeline(stateDir)).filter((v) => v.swarm === swarm && v.subject === want)
}

/** Look up one source record by id (the scan/build routes need its fields). Null if absent. */
export function getPipelineSource(id: string, stateDir: string = STATE_DIR): PipelineSourceRecord | null {
  if (!isPipelineId(id)) return null
  const s = readAllPipeline(stateDir).find(
    (r): r is PipelineSourceRecord => r.kind === 'pipeline_source' && r.pipeline_id === id,
  )
  return s ?? null
}

/** The folded view for ONE source id — carries its status + latest verdict (the build route needs both). */
export function getPipelineView(id: string, stateDir: string = STATE_DIR): PipelineView | null {
  if (!isPipelineId(id)) return null
  return foldPipeline(readAllPipeline(stateDir)).find((v) => v.pipeline_id === id) ?? null
}
