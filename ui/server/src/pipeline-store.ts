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
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT, STATE_DIR } from './config'
import { safeConnectorSourceUrl } from './connector-url-policy'
import { isRfc3339 } from './rfc3339'

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
  // Present for a source discovered against one exact selected decision. Legacy/free-form sources omit
  // these; only decision-scoped sources may satisfy a data-need lookup overlay.
  run_root?: string | null
  decision_fingerprint?: string | null
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

export const NEED_LOOKUP_STATUSES = ['public_link_found', 'could_not_find'] as const
export type NeedLookupStatus = (typeof NEED_LOOKUP_STATUSES)[number]

// A source search is operational state, not part of the frozen investment decision.  The terminal
// synthesizer may suggest a publisher, but only this server-owned row can say that an admissible public
// HTTPS link was actually found.  A clean, completed search may also record the explicit no-result state;
// timeouts, tool failures and aborted searches write nothing, so they can never masquerade as "not found".
export interface PipelineLookupRecord {
  pipeline_id: string
  kind: 'pipeline_lookup'
  subject: string
  swarm: string
  need_id: string
  need_fingerprint: string
  run_root: string
  decision_fingerprint: string
  // Request start time, not completion time. A slow older search that finishes after a newer one therefore
  // cannot overwrite the newer terminal truth in an append-only ledger.
  lookup_started_at: string
  lookup_status: NeedLookupStatus
  public_url: string | null
  lookup_note: string
  source_pipeline_id: string | null
  user_id: string
  submitted_at: string
}

export type PipelineRecord = PipelineSourceRecord | PipelineEventRecord | PipelineLookupRecord

export interface NeedLookupView {
  lookup_status: NeedLookupStatus
  public_url: string | null
  checked_at: string
  lookup_note: string
  stale: boolean
  // Deliberately narrower than "reachable", "licensed" or "lawful": discovery validated HTTPS syntax,
  // exact-host binding and public DNS only. It did not prove an HTTP response or reuse rights.
  access_basis: 'https_url_public_dns'
}

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

/** Stable join key for one authored need.  Including the series prevents an old link attaching when a
 * later run accidentally reuses the same slug for a different question. */
export function dataNeedFingerprint(needId: string, series: string): string {
  const cleanSeries = String(series || '').trim().replace(/\s+/g, ' ')
  return createHash('sha256').update(`${String(needId || '').trim()}\n${cleanSeries}`, 'utf8').digest('hex')
}

// PIPE-YYYYMMDD-<8hex>. Anchored, so a route param can't smuggle a path segment anywhere it is used.
const PIPELINE_ID_RE = /^PIPE-\d{8}-[0-9a-f]{8}$/
// A connector folder slug (mirrors the registry's own id rule) — anchored for the same reason.
const CONNECTOR_SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,120}$/
const NEED_ID_RE = /^[a-z0-9][a-z0-9_-]{0,127}$/
const CANONICAL_UTC_SECONDS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
const CANONICAL_UTC_MILLIS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const DECISION_FINGERPRINT_RE = /^sha256:[a-f0-9]{64}$/
const LOOKUP_STALE_MS = 30 * 24 * 60 * 60 * 1000
export function isPipelineId(s: string): boolean {
  return PIPELINE_ID_RE.test(s)
}

function canonicalUtcSeconds(value: unknown): value is string {
  return typeof value === 'string' && CANONICAL_UTC_SECONDS_RE.test(value) && isRfc3339(value)
}

function canonicalUtcMillis(value: unknown): value is string {
  return typeof value === 'string' && CANONICAL_UTC_MILLIS_RE.test(value) && isRfc3339(value)
}

function validRunRootIdentity(value: unknown): value is string {
  if (typeof value !== 'string' || !value || value.length > 300 || value.includes('\\') || path.isAbsolute(value)) return false
  const parts = value.split('/')
  return parts.every((part) => !!part && part !== '.' && part !== '..' && /^[A-Za-z0-9._-]+$/.test(part))
}

function lookupSourceMatches(
  source: Partial<PipelineSourceRecord> | undefined,
  input: {
    subject: string; swarm: string; run_root: string; decision_fingerprint: string
    need_id: string; public_url: string
  },
): boolean {
  if (!source || source.kind !== 'pipeline_source' || !isPipelineId(String(source.pipeline_id || ''))) return false
  const sourceUrl = safeConnectorSourceUrl(source.source_url)
  const publicUrl = safeConnectorSourceUrl(input.public_url)
  return !!sourceUrl && !!publicUrl && sourceUrl.url === publicUrl.url
    && source.subject === input.subject.toUpperCase() && source.swarm === input.swarm
    && source.run_root === input.run_root && source.decision_fingerprint === input.decision_fingerprint
    && source.need_id === input.need_id
}

async function appendLedger(record: PipelineRecord, stateDir: string): Promise<void> {
  fs.mkdirSync(PIPELINE_DIR(stateDir), { recursive: true })
  await execFileAsync(
    'bash',
    [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER(stateDir), JSON.stringify(record), 'pipeline_id', record.pipeline_id],
    { cwd: REPO_ROOT },
  )
}

/** Persist one terminal lookup outcome.  Invalid URL/status combinations fail closed before append. */
export async function writeNeedLookup(
  input: {
    subject: string
    swarm: string
    run_root: string
    decision_fingerprint: string
    need_id: string
    series: string
    lookup_status: NeedLookupStatus
    public_url?: string | null
    lookup_note?: string
    source_pipeline_id?: string | null
    lookup_started_at: string
  },
  user: string,
  stateDir: string = STATE_DIR,
): Promise<PipelineLookupRecord> {
  const needId = String(input.need_id || '').trim()
  const subject = String(input.subject || '').trim().toUpperCase()
  const swarm = String(input.swarm || '').trim()
  const runRoot = String(input.run_root || '').trim()
  const decisionFingerprint = String(input.decision_fingerprint || '').trim()
  const series = String(input.series || '').trim()
  if (!NEED_ID_RE.test(needId)) throw new Error('invalid need id')
  if (!subject || subject.length > 64 || !swarm || swarm.length > 64 || !series || series.length > SERIES_MAX
      || !validRunRootIdentity(runRoot) || !DECISION_FINGERPRINT_RE.test(decisionFingerprint)
      || !canonicalUtcMillis(input.lookup_started_at)) {
    throw new Error('invalid lookup identity')
  }
  if (!NEED_LOOKUP_STATUSES.includes(input.lookup_status)) throw new Error('invalid lookup status')
  const safe = input.public_url == null ? null : safeConnectorSourceUrl(input.public_url)
  if (input.lookup_status === 'public_link_found' && !safe) throw new Error('found lookup requires a safe public URL')
  if (input.lookup_status === 'could_not_find' && input.public_url != null) throw new Error('no-result lookup cannot carry a URL')
  const sourceId = input.source_pipeline_id == null ? null : String(input.source_pipeline_id)
  if (sourceId !== null && !isPipelineId(sourceId)) throw new Error('invalid source pipeline id')
  if (input.lookup_status === 'could_not_find' && sourceId !== null) throw new Error('no-result lookup cannot carry a source')
  if (input.lookup_status === 'public_link_found') {
    if (!sourceId) throw new Error('found lookup requires a persisted source')
    const source = readAllPipeline(stateDir).find(
      (r): r is PipelineSourceRecord => r.kind === 'pipeline_source' && r.pipeline_id === sourceId,
    )
    if (!lookupSourceMatches(source, {
      subject, swarm, run_root: runRoot, decision_fingerprint: decisionFingerprint,
      need_id: needId, public_url: safe!.url,
    })) {
      throw new Error('found lookup source does not match the need and URL')
    }
  }
  const current = latestNeedLookupRecord({
    swarm, subject, run_root: runRoot, decision_fingerprint: decisionFingerprint,
    need_id: needId, series,
  }, stateDir)
  if (current && current.lookup_started_at > input.lookup_started_at) {
    throw new Error('stale lookup attempt cannot replace a newer result')
  }
  const at = nowIso()
  const record: PipelineLookupRecord = {
    pipeline_id: newPipelineId(at),
    kind: 'pipeline_lookup',
    subject,
    swarm,
    need_id: needId,
    need_fingerprint: dataNeedFingerprint(needId, series),
    run_root: runRoot,
    decision_fingerprint: decisionFingerprint,
    lookup_started_at: input.lookup_started_at,
    lookup_status: input.lookup_status,
    public_url: safe?.url ?? null,
    lookup_note: String(input.lookup_note || '').trim().slice(0, NOTE_MAX),
    source_pipeline_id: sourceId,
    user_id: user || 'local',
    submitted_at: at,
  }
  await appendLedger(record, stateDir)
  return record
}

/** Write a pipeline SOURCE. Every free-text field is clamped, like feedback/screener. Returns the record. */
export async function writePipelineSource(
  input: {
    subject: string
    swarm: string
    run_root?: string | null
    decision_fingerprint?: string | null
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
  const runRoot = input.run_root == null ? null : String(input.run_root).trim()
  const decisionFingerprint = input.decision_fingerprint == null ? null : String(input.decision_fingerprint).trim()
  if ((runRoot === null) !== (decisionFingerprint === null)
      || (runRoot !== null && (!validRunRootIdentity(runRoot) || !DECISION_FINGERPRINT_RE.test(decisionFingerprint!)))) {
    throw new Error('invalid decision source identity')
  }
  const record: PipelineSourceRecord = {
    pipeline_id: newPipelineId(at),
    kind: 'pipeline_source',
    subject: (input.subject || '').toUpperCase().slice(0, 64),
    swarm: (input.swarm || '').slice(0, 64),
    ...(runRoot !== null ? { run_root: runRoot, decision_fingerprint: decisionFingerprint } : {}),
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

interface NeedLookupIdentity {
  swarm: string
  subject: string
  run_root: string
  decision_fingerprint: string
  need_id: string
  series: string
  cadence?: string
}

function latestNeedLookupRecord(identity: NeedLookupIdentity, stateDir: string): PipelineLookupRecord | undefined {
  const fingerprint = dataNeedFingerprint(identity.need_id, identity.series)
  const wantSubject = String(identity.subject || '').toUpperCase()
  let best: PipelineLookupRecord | undefined
  const sources = new Map<string, PipelineSourceRecord>()
  for (const raw of readAllPipeline(stateDir)) {
    if (raw.kind === 'pipeline_source') {
      // Idempotency makes source ids unique. For a hand-edited ledger, keep the first well-formed source so
      // a later duplicate id cannot rewrite the lookup join in place.
      if (isPipelineId(raw.pipeline_id) && !sources.has(raw.pipeline_id)) sources.set(raw.pipeline_id, raw)
      continue
    }
    if (raw.kind !== 'pipeline_lookup') continue
    const r = raw as Partial<PipelineLookupRecord>
    if (r.swarm !== identity.swarm || r.subject !== wantSubject || r.need_id !== identity.need_id
        || r.need_fingerprint !== fingerprint || r.run_root !== identity.run_root
        || r.decision_fingerprint !== identity.decision_fingerprint) continue
    if (!NEED_LOOKUP_STATUSES.includes(r.lookup_status as NeedLookupStatus)
        || !isPipelineId(String(r.pipeline_id || '')) || !canonicalUtcSeconds(r.submitted_at)
        || !canonicalUtcMillis(r.lookup_started_at)) continue
    if (r.lookup_status === 'public_link_found') {
      if (typeof r.public_url !== 'string' || typeof r.source_pipeline_id !== 'string'
          || !lookupSourceMatches(sources.get(r.source_pipeline_id), {
            subject: wantSubject, swarm: identity.swarm, run_root: identity.run_root,
            decision_fingerprint: identity.decision_fingerprint,
            need_id: identity.need_id, public_url: r.public_url,
          })) continue
    } else if (r.public_url !== null || r.source_pipeline_id !== null) continue
    // Request start time owns last-search-wins. Append order breaks a true same-millisecond tie only.
    if (!best || r.lookup_started_at >= best.lookup_started_at) best = r as PipelineLookupRecord
  }
  return best
}

/** Latest valid lookup for one exact immutable decision+need. Malformed/unscoped historical lines are
 * ignored, and URLs are re-admitted on read so a hand-edited ledger cannot surface an unsafe link. */
export function latestNeedLookup(
  identity: NeedLookupIdentity,
  stateDir: string = STATE_DIR,
): NeedLookupView | undefined {
  const best = latestNeedLookupRecord(identity, stateDir)
  if (!best) return undefined
  const checkedMs = Date.parse(best.submitted_at)
  return {
    lookup_status: best.lookup_status,
    public_url: best.lookup_status === 'public_link_found' ? safeConnectorSourceUrl(best.public_url)?.url ?? null : null,
    checked_at: best.submitted_at,
    lookup_note: String(best.lookup_note || '').slice(0, NOTE_MAX),
    stale: !Number.isFinite(checkedMs) || Date.now() - checkedMs > LOOKUP_STALE_MS,
    access_basis: 'https_url_public_dns',
  }
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
