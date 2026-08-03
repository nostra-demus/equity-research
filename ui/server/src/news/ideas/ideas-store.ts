// Persistence + free (no-LLM) enrichment for the PM skim. The ledger is the source of truth the board
// projects; nothing here spends a token. Idea identity is a hash of ticker+direction so a re-surfacing of
// the same directional call UPDATES in place (and accumulates corroborating source events) instead of
// piling up duplicates — the shelf-life (`decay_at`) then ages a call off the board for free at build
// time, by pure date compare, with no paid pass.

import fs from 'node:fs'
import path from 'node:path'
import { execFile, spawnSync } from 'node:child_process'
import { promisify } from 'node:util'
import { createHash, randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { eventIdFor } from '../normalize'
import { parseRfc3339Ms } from '../../rfc3339'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../../singleton-lock'
import { THESIS_TYPES, type IdeaDirection, type IdeaInputRow, type PricedIn, type RawIdea, type ThesisType } from './surface-ideas'
import type { TradeScoreBreakdown } from '../trade-score'
import type { IdeaLearning } from './idea-learning'

const execFileAsync = promisify(execFile)

// The persisted idea: the LLM's raw read plus the free-derived fields (resolved source ids, freshness,
// prior coverage) and the lifecycle stamps. A strict superset of the candidates.schema.json subset the
// paid gauntlet later fills, so a promoted run maps onto — never fights — this shape.
export interface SurfacedIdea {
  idea_id: string // IDEA-<sha256-12 of ticker|direction>
  idea_version: string // immutable thesis/source snapshot key; realized outcomes must match this exact version
  idea_version_started_at: string // ISO; resets if a prior version later cycles back to the same hash
  ticker: string
  company: string | null
  exchange: string | null
  ticker_verified: boolean
  listing_verified: boolean
  liquidity_verified: boolean
  listing_verification_source: 'yahoo_symbol_directory' | null
  direction: IdeaDirection
  pair_with: string | null
  reason: string
  why_now: string
  conviction: number // 0-100 pre-edge PROXY
  conviction_basis: 'pre_edge_proxy' // hard label — never the locked edge score (§7)
  trade_score: number // strict, capped readiness score; still not expected return or a verdict
  trade_score_basis: 'evidence_gate_v1'
  trade_score_breakdown: TradeScoreBreakdown
  trade_readiness: 'check_now' | 'needs_data' | 'watch_only'
  missing_checks: string[]
  learning: IdeaLearning
  priced_in: PricedIn
  thesis_type: ThesisType
  source_event_ids: string[] // EVT-* — the join key back to the wire (canonical eventIdFor over the original headline)
  source_headlines: string[] // for the card, newest first (display — may be the English translation)
  source_headline: string | null // the primary source's ORIGINAL-language headline — the promote intake uses THIS so its SIG_ID byte-matches the wire launch
  source_url: string | null // the primary (highest-materiality) source's URL — so a promotion's SIG_ID byte-matches the wire event
  source_name: string | null // the primary source's publisher — Gate 0 checks it against the allowlist on promotion
  materiality_max: number // top triage_score among the source events (ranking blend input)
  newest_source_at: string // ISO — the freshest contributing event, drives freshness + decay
  prior_coverage: PriorCoverage | null
  surfaced_at: string // ISO — first time this idea appeared (preserved across updates)
  updated_at: string // ISO — this pass
  decay_at: string // ISO — surfaced/refreshed + shelf-life; board marks it stale past this
  status: 'live' | 'promoted'
  promoted_signal_id: string | null
}

export interface PriorCoverage {
  has_run: boolean // a finished analyses/<TICKER>_* run exists
  latest_run: string | null // repo-relative path of the newest run folder
  latest_decision: string | null // that run's decision, when readable
  data_pool_present: boolean // data/<TICKER>/ exists (real filings already gathered)
}

export type IdeaSnapshotStoreStatus = 'missing' | 'ok' | 'degraded' | 'unreadable'
export interface IdeaSnapshotStoreRead {
  snapshots: SurfacedIdea[]
  status: IdeaSnapshotStoreStatus
  file_count: number
  corrupt_count: number
  invalid_count: number
  error: string | null
}

export type TopSweepStatus = 'ok' | 'missing' | 'corrupt' | 'stale'
export interface TopSweepRead {
  rows: IdeaInputRow[]
  status: TopSweepStatus
  sweep_updated_at: string | null
  candidate_count: number
  stale_row_count: number
  invalid_time_count: number
}

export interface TopSweepFreshnessOptions {
  nowMs: number
  maxAgeMs: number
  futureSkewMs?: number
}

function ideasDir(repoRoot: string): string { return path.join(repoRoot, 'screener', 'ledger', 'ideas') }
function ideasLog(repoRoot: string): string { return path.join(repoRoot, 'screener', 'ledger', 'ideas.ndjson') }
const IDEA_PROMOTION_STALE_MS = 30 * 60_000
const IDEA_LOCK_WAIT_MS = 2_000
const IDEA_LOCK_POLL_MS = 10

function acquireIdeaLock(fp: string): number {
  const lock = `${fp}.lock`
  return acquireRetainedFlockSync(lock, {
    waitMs: IDEA_LOCK_WAIT_MS,
    pollMs: IDEA_LOCK_POLL_MS,
    busyMessage: `idea snapshot busy: ${path.basename(fp)}`,
  })
}

function releaseIdeaLock(_fp: string, fd: number): void {
  releaseRetainedFlock(fd)
}

interface IdeaMutationLease {
  repositoryFd: number | null
  snapshotFd: number
}

function repositoryMutationLockPath(repoRoot: string): string | null {
  const root = path.resolve(repoRoot)
  // Unit callers may intentionally use a plain temporary directory. A real checkout always has a .git
  // file/directory; if Git then fails, that is an operational fault and must not silently disable locking.
  if (!fs.existsSync(path.join(root, '.git'))) return null
  const result = spawnSync('git', [
    '-C', root, 'rev-parse', '--show-toplevel', '--git-path', 'nostra-engine-mutation.flock',
  ], { encoding: 'utf8', timeout: 5_000, maxBuffer: 64_000 })
  if (result.status !== 0) {
    const detail = result.error?.message || String(result.stderr || '').trim() || `exit ${result.status ?? result.signal ?? 'unknown'}`
    throw new Error(`cannot resolve repository mutation lock: ${detail.slice(0, 200)}`)
  }
  const [top, rawLock, ...extra] = String(result.stdout || '').trim().split(/\r?\n/)
  if (!top || !rawLock || extra.length) throw new Error('cannot resolve repository mutation lock: invalid git output')
  return path.isAbsolute(rawLock) ? rawLock : path.join(top, rawLock)
}

/** Lock order is repository then snapshot, matching deploy/commit -> data mutation ordering. This keeps
 * a checkout from replacing either the journal or projection halfway through one Ideas transaction. */
function acquireIdeaMutationLease(repoRoot: string, fp: string): IdeaMutationLease {
  const repositoryLock = repositoryMutationLockPath(repoRoot)
  const repositoryFd = repositoryLock === null
    ? null
    : acquireRetainedFlockSync(repositoryLock, {
      waitMs: IDEA_LOCK_WAIT_MS,
      pollMs: IDEA_LOCK_POLL_MS,
      busyMessage: 'ideas store busy: repository mutation in progress',
    })
  try {
    return { repositoryFd, snapshotFd: acquireIdeaLock(fp) }
  } catch (error) {
    if (repositoryFd !== null) releaseIdeaLock(repositoryLock!, repositoryFd)
    throw error
  }
}

function releaseIdeaMutationLease(fp: string, lease: IdeaMutationLease): void {
  releaseIdeaLock(fp, lease.snapshotFd)
  if (lease.repositoryFd !== null) releaseIdeaLock('', lease.repositoryFd)
}

const sourceTreeAppendHelper = fileURLToPath(new URL('../../../../../scripts/append-ndjson.sh', import.meta.url))

function appendIdeaHistory(repoRoot: string, idea: SurfacedIdea, repositoryFd: number | null): void {
  const helperInRepo = path.join(repoRoot, 'scripts', 'append-ndjson.sh')
  const helper = fs.existsSync(helperInRepo) ? helperInRepo : sourceTreeAppendHelper
  if (!fs.existsSync(helper)) throw new Error(`Ideas history append helper is missing: ${helper}`)
  // Event first, projection second. The deterministic id makes a retry after a crash safe: an already
  // fsynced journal event is recognized, then the still-missing snapshot projection can be completed.
  const ideaHistoryId = 'IDEAH-' + createHash('sha256').update(JSON.stringify(idea)).digest('hex')
  // Derived envelope keys are last so an unexpected extra field on a disk-loaded snapshot cannot spoof
  // the idempotency identity or journal time used by the append helper.
  const row = { ...idea, ts: idea.updated_at, idea_history_id: ideaHistoryId }
  const inherited = repositoryFd !== null
  const result = spawnSync('bash', [
    helper, ideasLog(repoRoot), JSON.stringify(row), 'idea_history_id', ideaHistoryId,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 20_000,
    maxBuffer: 256_000,
    stdio: (inherited ? ['ignore', 'pipe', 'pipe', repositoryFd] : ['ignore', 'pipe', 'pipe']) as any,
    env: {
      ...process.env,
      NDJSON_REPO_LOCK_WAIT_MS: '15000',
      ...(inherited ? { NOSTRA_REPO_LOCK_FD: '3' } : {}),
    },
  })
  const stdout = String(result.stdout || '')
  if (result.status === 0 && /^(?:APPENDED|DUPLICATE)=1\s*$/m.test(stdout)) return
  const stderr = String(result.stderr || '').trim()
  const detail = result.error?.message || stderr || stdout.trim() || `exit ${result.status ?? result.signal ?? 'unknown'}`
  throw Object.assign(new Error(`Ideas history append failed: ${detail.slice(0, 240)}`), { code: 'EIDEA_APPEND' })
}

/** Stable idea identity: same ticker + same direction = the same directional call, refreshed in place. */
export function ideaId(ticker: string, direction: IdeaDirection): string {
  return 'IDEA-' + createHash('sha256').update(`${ticker.toUpperCase()}|${direction}`).digest('hex').slice(0, 12)
}

/** Exact thesis snapshot identity. Refreshing the same ticker/direction never reuses an old outcome. */
export function ideaVersion(input: {
  ticker: string; direction: IdeaDirection; thesisType: ThesisType; reason: string; whyNow: string; sourceEventIds: string[]
}): string {
  const canonical = [
    input.ticker.toUpperCase(), input.direction, input.thesisType,
    input.reason.trim().toLowerCase().replace(/\s+/g, ' '),
    input.whyNow.trim().toLowerCase().replace(/\s+/g, ' '),
    [...new Set(input.sourceEventIds)].sort().join(','),
  ].join('|')
  return 'IDEAV-' + createHash('sha256').update(canonical).digest('hex').slice(0, 16)
}

const IDEA_ID_RE = /^IDEA-[a-f0-9]{12}$/
const IDEA_VERSION_RE = /^IDEAV-[a-f0-9]{16}$/
const EVENT_ID_RE = /^EVT-[a-f0-9]{12}$/
const TICKER_RE = /^[A-Z0-9.-]{1,12}$/
const DIRECTIONS = new Set<IdeaDirection>(['long', 'short', 'pair'])
const PRICED_IN = new Set<PricedIn>(['priced', 'room', 'unknown'])
const READINESS = new Set<SurfacedIdea['trade_readiness']>(['check_now', 'needs_data', 'watch_only'])
const THESIS_TYPE_SET = new Set<string>(THESIS_TYPES)

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function exactString(value: unknown, max: number, allowEmpty = false): value is string {
  return typeof value === 'string' && value.length <= max && value === value.trim() && (allowEmpty || value.length > 0)
}

function nullableExactString(value: unknown, max: number): value is string | null {
  return value === null || exactString(value, max)
}

function boundedNumber(value: unknown, min: number, max: number, integer = false): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    && (!integer || Number.isInteger(value))
}

function exactStringArray(value: unknown, maxItems: number, maxLength: number, allowEmpty = true, unique = false): value is string[] {
  if (!Array.isArray(value) || value.length > maxItems || (!allowEmpty && value.length === 0)) return false
  if (!value.every((item) => exactString(item, maxLength))) return false
  return !unique || new Set(value).size === value.length
}

function validPriorCoverage(value: unknown): value is PriorCoverage | null {
  if (value === null) return true
  if (!record(value) || typeof value.has_run !== 'boolean' || typeof value.data_pool_present !== 'boolean') return false
  if (!nullableExactString(value.latest_run, 240) || !nullableExactString(value.latest_decision, 60)) return false
  if (value.latest_run !== null && !/^analyses\/[^/]+$/.test(value.latest_run)) return false
  if (value.has_run !== (value.latest_run !== null)) return false
  if (!value.has_run && value.latest_decision !== null) return false
  return true
}

function validTradeBreakdown(value: unknown): value is TradeScoreBreakdown {
  if (!record(value)) return false
  return boundedNumber(value.evidence, 0, 25, true)
    && boundedNumber(value.impact, 0, 25, true)
    && boundedNumber(value.specificity, 0, 15, true)
    && boundedNumber(value.timing, 0, 15, true)
    && boundedNumber(value.expression, 0, 10, true)
    && boundedNumber(value.corroboration, 0, 10, true)
    && boundedNumber(value.learning_adjustment, -8, 8, true)
}

function validLearning(value: unknown): value is IdeaLearning {
  if (!record(value)) return false
  const counts = [value.resolved, value.positive, value.negative, value.neutral]
  if (!counts.every((count) => boundedNumber(count, 0, Number.MAX_SAFE_INTEGER, true))) return false
  if (value.resolved !== Number(value.positive) + Number(value.negative) + Number(value.neutral)) return false
  if (!boundedNumber(value.adjustment, -8, 8, true)) return false
  if (value.basis !== 'not_enough_outcomes' && value.basis !== 'realized_returns') return false
  if (!exactStringArray(value.evidenceIds, 20, 160, true, true)) return false
  if (value.basis === 'not_enough_outcomes' && Number(value.resolved) >= 5) return false
  if (value.basis === 'realized_returns' && Number(value.resolved) < 5) return false
  return true
}

/**
 * Runtime boundary for the persisted lead store. TypeScript types disappear at disk, so every field that
 * can reach the live board is checked again here. Identity is recomputed from the embedded thesis rather
 * than trusted, and a caller reading a named file can bind the payload to that exact filename.
 */
export function isSurfacedIdeaSnapshot(value: unknown, expectedIdeaId?: string): value is SurfacedIdea {
  if (!record(value)) return false
  if (!exactString(value.idea_id, 17) || !IDEA_ID_RE.test(value.idea_id)) return false
  if (expectedIdeaId !== undefined && value.idea_id !== expectedIdeaId) return false
  if (!exactString(value.idea_version, 22) || !IDEA_VERSION_RE.test(value.idea_version)) return false
  if (!exactString(value.ticker, 12) || !TICKER_RE.test(value.ticker)) return false
  if (!DIRECTIONS.has(value.direction as IdeaDirection)) return false
  const direction = value.direction as IdeaDirection
  if (value.idea_id !== ideaId(value.ticker, direction)) return false

  if (!nullableExactString(value.company, 120) || !nullableExactString(value.exchange, 24)) return false
  if (typeof value.ticker_verified !== 'boolean' || typeof value.listing_verified !== 'boolean' || typeof value.liquidity_verified !== 'boolean') return false
  if (value.listing_verification_source !== null && value.listing_verification_source !== 'yahoo_symbol_directory') return false
  if (value.listing_verified && (!value.ticker_verified || value.exchange === null || value.listing_verification_source === null)) return false
  if (value.liquidity_verified && !value.listing_verified) return false
  if (!value.ticker_verified && value.listing_verification_source !== null) return false

  if (value.pair_with !== null && (!exactString(value.pair_with, 12) || !TICKER_RE.test(value.pair_with))) return false
  if (direction === 'pair' ? value.pair_with === null : value.pair_with !== null) return false
  if (!exactString(value.reason, 280) || !exactString(value.why_now, 240)) return false
  if (!boundedNumber(value.conviction, 0, 100, true) || value.conviction_basis !== 'pre_edge_proxy') return false
  if (!boundedNumber(value.trade_score, 0, 100, true) || value.trade_score_basis !== 'evidence_gate_v1') return false
  if (!validTradeBreakdown(value.trade_score_breakdown) || !READINESS.has(value.trade_readiness as SurfacedIdea['trade_readiness'])) return false
  if (!exactStringArray(value.missing_checks, 32, 160, true, true) || !validLearning(value.learning)) return false
  if (!PRICED_IN.has(value.priced_in as PricedIn) || !THESIS_TYPE_SET.has(String(value.thesis_type))) return false

  if (!exactStringArray(value.source_event_ids, 64, 16, false, true) || !value.source_event_ids.every((id) => EVENT_ID_RE.test(id))) return false
  if (!exactStringArray(value.source_headlines, 4, 500, false)) return false
  if (!nullableExactString(value.source_headline, 500) || !nullableExactString(value.source_url, 2_000) || !nullableExactString(value.source_name, 160)) return false
  if (!boundedNumber(value.materiality_max, 0, 100)) return false
  if (!validPriorCoverage(value.prior_coverage)) return false

  const version = ideaVersion({
    ticker: value.ticker,
    direction,
    thesisType: value.thesis_type as ThesisType,
    reason: value.reason,
    whyNow: value.why_now,
    sourceEventIds: value.source_event_ids,
  })
  if (value.idea_version !== version) return false

  const versionStarted = parseRfc3339Ms(value.idea_version_started_at)
  const newestSource = parseRfc3339Ms(value.newest_source_at)
  const surfaced = parseRfc3339Ms(value.surfaced_at)
  const updated = parseRfc3339Ms(value.updated_at)
  const decay = parseRfc3339Ms(value.decay_at)
  if (![versionStarted, newestSource, surfaced, updated, decay].every(Number.isFinite)) return false
  // Source adapters permit at most five minutes of clock skew. The other lifecycle stamps are local and
  // must be monotonic. Expired leads remain valid records, but expiry can never precede their evidence.
  if (surfaced > versionStarted || versionStarted > updated || newestSource > updated + 5 * 60_000 || decay <= newestSource) return false

  if (value.status !== 'live' && value.status !== 'promoted') return false
  if (value.status === 'live' ? value.promoted_signal_id !== null : !exactString(value.promoted_signal_id, 160)) return false
  return true
}

/**
 * Read the freshest curated sweep (the top-N the auto-ingester writes every cycle) into skim input rows,
 * sorted by materiality, capped at `topN`. Drops nothing but consumed/dismissed rows and the low tail:
 * a surfacing candidate must have cleared the wire's own pick/watch bar (triage_score present). Never
 * throws — a missing sweep yields [].
 */
export function readTopSweep(
  repoRoot: string,
  topN: number,
  freshness?: TopSweepFreshnessOptions,
): TopSweepRead {
  const inboxDir = path.join(repoRoot, 'screener', 'inbox')
  let file: string | null = null
  try {
    const files = fs.readdirSync(inboxDir).filter((f) => f.endsWith('_sweep.json')).sort().reverse()
    file = files.length ? path.join(inboxDir, files[0]) : null
  } catch { return { rows: [], status: 'missing', sweep_updated_at: null, candidate_count: 0, stale_row_count: 0, invalid_time_count: 0 } }
  if (!file) return { rows: [], status: 'missing', sweep_updated_at: null, candidate_count: 0, stale_row_count: 0, invalid_time_count: 0 }
  let doc: any
  try { doc = JSON.parse(fs.readFileSync(file, 'utf8')) } catch {
    return { rows: [], status: 'corrupt', sweep_updated_at: null, candidate_count: 0, stale_row_count: 0, invalid_time_count: 0 }
  }
  if (!Array.isArray(doc?.rows)) {
    return {
      rows: [], status: 'corrupt',
      sweep_updated_at: typeof doc?.updated_at === 'string' ? doc.updated_at : null,
      candidate_count: 0, stale_row_count: 0, invalid_time_count: 0,
    }
  }
  const rows: any[] = doc.rows
  const candidates = rows
    .filter((r) => r && r.url && !r.consumed && !r.dismissed && typeof r.triage_score === 'number')
    .sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))
  const sweepUpdatedAt = typeof doc?.updated_at === 'string' ? doc.updated_at : null
  let staleRowCount = 0
  let invalidTimeCount = 0
  let status: TopSweepStatus = 'ok'
  let eligible = candidates
  if (freshness) {
    const futureSkewMs = Math.max(0, freshness.futureSkewMs ?? 5 * 60_000)
    const maxAgeMs = Number.isFinite(freshness.maxAgeMs) && freshness.maxAgeMs > 0 ? freshness.maxAgeMs : 1
    const floor = freshness.nowMs - maxAgeMs
    const ceiling = freshness.nowMs + futureSkewMs
    const sweepMs = sweepUpdatedAt ? parseRfc3339Ms(sweepUpdatedAt) : NaN
    if (!Number.isFinite(sweepMs)) {
      status = 'corrupt'
      invalidTimeCount++
      eligible = []
    } else if (sweepMs < floor || sweepMs > ceiling) {
      status = 'stale'
      eligible = []
    } else {
      eligible = candidates.filter((r) => {
        const foundMs = typeof r.found_at === 'string' ? parseRfc3339Ms(r.found_at) : NaN
        if (!Number.isFinite(foundMs)) { invalidTimeCount++; return false }
        if (foundMs < floor || foundMs > ceiling) { staleRowCount++; return false }
        return true
      })
      if (!eligible.length && candidates.length && (staleRowCount || invalidTimeCount)) status = 'stale'
    }
  }
  const projected = eligible
    .slice(0, Math.max(1, topN))
    .map((r): IdeaInputRow => ({
      // event_id isn't stored on the inbox row; re-derive it with the CANONICAL recipe (eventIdFor over the
      // ORIGINAL headline, lower-cased + whitespace-collapsed) so the idea's source ids match the
      // firehose/enrich/ledger join key exactly — a bespoke hash over the translation would never line up.
      event_id: eventIdFor(r.headline || '', r.url || ''),
      headline: r.headline_en || r.headline || '', // display + the model prompt (English when available)
      headline_orig: r.headline || '', // the original — anchors a promotion's SIG_ID to the wire launch
      url: r.url || '',
      source_name: r.source_name || '',
      region: r.region || '',
      materiality: Number(r.triage_score) || 0,
      materiality_pre_score: Number.isFinite(Number(r.materiality_pre_score)) ? Number(r.materiality_pre_score) : undefined,
      label: r.event_materiality_label || '',
      event_types: Array.isArray(r.event_types) ? r.event_types : [],
      issuer_linkage: r.issuer_linkage || '',
      companies: Array.isArray(r.companies) ? r.companies : [],
      found_at: r.found_at || doc?.updated_at || '',
      source_tier: r.source_tier,
      scheduled_events: Array.isArray(r.scheduled_events) ? r.scheduled_events : [],
      event_direction: r.event_direction,
      dedup_group: typeof r.dedup_group === 'string' && r.dedup_group.trim() ? r.dedup_group.trim() : undefined,
    }))
  return {
    rows: projected,
    status,
    sweep_updated_at: sweepUpdatedAt,
    candidate_count: candidates.length,
    stale_row_count: staleRowCount,
    invalid_time_count: invalidTimeCount,
  }
}

/** Backward-compatible row-only reader. Production passes a freshness contract; legacy callers that
 * only need structural parsing may omit it. */
export function readTopSweepRows(repoRoot: string, topN: number, freshness?: TopSweepFreshnessOptions): IdeaInputRow[] {
  return readTopSweep(repoRoot, topN, freshness).rows
}

/** A change key over the top-N so the pass only re-spends when the input set actually shifts. */
export function topNHash(rows: IdeaInputRow[]): string {
  return createHash('sha256').update(rows.map((r) => r.event_id).sort().join(',')).digest('hex').slice(0, 16)
}

/** Lead expiry is anchored to evidence time, not provider time. Re-reading a 30-hour-old headline must
 * not grant it a brand-new 36-hour life. The now cap handles the small permitted source clock skew. */
export function ideaDecayAt(newestSourceAt: string, nowMs: number, shelfLifeHrs: number): string | null {
  const sourceMs = parseRfc3339Ms(newestSourceAt)
  const shelfMs = Number(shelfLifeHrs) * 3_600_000
  if (!Number.isFinite(sourceMs) || !Number.isFinite(shelfMs) || shelfMs <= 0) return null
  return new Date(Math.min(nowMs + shelfMs, sourceMs + shelfMs)).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

/** Read every persisted idea snapshot (for in-place merge + board projection). Never throws. */
export function readIdeaSnapshotStore(repoRoot: string): IdeaSnapshotStoreRead {
  const dir = ideasDir(repoRoot)
  let names: string[]
  try { names = fs.readdirSync(dir).filter((f) => f.endsWith('.json')) } catch (e: any) {
    if (e?.code === 'ENOENT') return { snapshots: [], status: 'missing', file_count: 0, corrupt_count: 0, invalid_count: 0, error: null }
    return { snapshots: [], status: 'unreadable', file_count: 0, corrupt_count: 0, invalid_count: 0, error: String(e?.message || e).slice(0, 240) }
  }
  const out: SurfacedIdea[] = []
  let corrupt = 0
  let invalid = 0
  for (const n of names) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))
      const expectedIdeaId = n.slice(0, -'.json'.length)
      if (isSurfacedIdeaSnapshot(o, expectedIdeaId)) out.push(o)
      else invalid++
    } catch { corrupt++ }
  }
  return {
    snapshots: out,
    status: corrupt || invalid ? 'degraded' : 'ok',
    file_count: names.length,
    corrupt_count: corrupt,
    invalid_count: invalid,
    error: null,
  }
}

/** Read every persisted idea snapshot (for in-place merge + board projection). Never throws. */
export function readIdeaSnapshots(repoRoot: string): SurfacedIdea[] {
  return readIdeaSnapshotStore(repoRoot).snapshots
}

/** Read one idea snapshot by id (for the promote endpoint). Returns null when absent/corrupt. */
export function readIdeaById(repoRoot: string, ideaId: string): SurfacedIdea | null {
  // Defence-in-depth at the sink: `ideaId` reaches here from a route param (`:id`). Reject anything that
  // isn't a strict IDEA-<12 hex> token, then confirm the RESOLVED file still sits inside the ideas dir —
  // a normalised-path containment check (path.resolve collapses any `../`, startsWith bounds it) that the
  // path-injection scanner recognises as a barrier, so no traversal can escape regardless of any caller.
  if (!/^IDEA-[a-f0-9]{12}$/.test(ideaId)) return null
  const dir = path.resolve(ideasDir(repoRoot))
  const fp = path.resolve(dir, `${ideaId}.json`)
  if (!fp.startsWith(dir + path.sep)) return null
  try {
    const o = JSON.parse(fs.readFileSync(fp, 'utf8'))
    return isSurfacedIdeaSnapshot(o, ideaId) ? o : null
  } catch { return null }
}

function writeIdeaUnlocked(repoRoot: string, idea: SurfacedIdea, fp: string, repositoryFd: number | null): void {
  appendIdeaHistory(repoRoot, idea, repositoryFd)
  const tmp = path.join(path.dirname(fp), `.${path.basename(fp)}.tmp.${process.pid}.${randomUUID()}`)
  let tmpFd: number | null = null
  try {
    tmpFd = fs.openSync(tmp, 'wx', 0o600)
    fs.writeFileSync(tmpFd, JSON.stringify(idea, null, 2) + '\n')
    fs.fsyncSync(tmpFd)
    fs.closeSync(tmpFd)
    tmpFd = null
    fs.renameSync(tmp, fp)
  } finally {
    if (tmpFd !== null) try { fs.closeSync(tmpFd) } catch { /* best effort */ }
    try { fs.unlinkSync(tmp) } catch (error: any) { if (error?.code !== 'ENOENT') throw error }
  }
}

/** Write one idea snapshot (overwrite, atomic tmp+rename) AND append the append-only history log. */
export function writeIdea(repoRoot: string, idea: SurfacedIdea): void {
  const dir = ideasDir(repoRoot)
  fs.mkdirSync(dir, { recursive: true })
  const fp = path.join(dir, `${idea.idea_id}.json`)
  const lease = acquireIdeaMutationLease(repoRoot, fp)
  try { writeIdeaUnlocked(repoRoot, idea, fp, lease.repositoryFd) }
  finally { releaseIdeaMutationLease(fp, lease) }
}

/** A compact revision token for optimistic snapshot updates. It binds every field, not only updated_at,
 * because a promotion and a provider refresh can legitimately share a second-resolution timestamp. */
export function ideaSnapshotRevision(idea: SurfacedIdea | null): string {
  if (!idea) return 'absent'
  return createHash('sha256').update(JSON.stringify(idea)).digest('hex')
}

/** Compare-and-swap one snapshot. The current file is re-read immediately before the synchronous atomic
 * rename, so an in-process promotion/refresh cannot be overwritten from a snapshot captured before an
 * awaited listing lookup. A false result tells the caller to re-read, merge lifecycle state, and retry. */
export function writeIdeaIfRevision(repoRoot: string, idea: SurfacedIdea, expectedRevision: string): boolean {
  const dir = ideasDir(repoRoot)
  fs.mkdirSync(dir, { recursive: true })
  const fp = path.join(dir, `${idea.idea_id}.json`)
  let lease: IdeaMutationLease
  try { lease = acquireIdeaMutationLease(repoRoot, fp) } catch (e: any) {
    if (e?.code === 'EBUSY') return false
    throw e
  }
  try {
    const current = readIdeaById(repoRoot, idea.idea_id)
    if (ideaSnapshotRevision(current) !== expectedRevision) return false
    writeIdeaUnlocked(repoRoot, idea, fp, lease.repositoryFd)
    return true
  } finally {
    releaseIdeaMutationLease(fp, lease)
  }
}

/** Read-modify-write one snapshot while holding the same cross-process lock used by provider refreshes. */
export function updateIdeaSnapshot(
  repoRoot: string,
  ideaId: string,
  update: (current: SurfacedIdea) => SurfacedIdea,
): SurfacedIdea | null {
  if (!/^IDEA-[a-f0-9]{12}$/.test(ideaId)) return null
  const dir = ideasDir(repoRoot)
  const fp = path.join(dir, `${ideaId}.json`)
  let lease: IdeaMutationLease
  try { lease = acquireIdeaMutationLease(repoRoot, fp) } catch (e: any) {
    if (e?.code === 'EBUSY') return null
    throw e
  }
  try {
    const current = readIdeaById(repoRoot, ideaId)
    if (!current) return null
    const next = update(current)
    if (next.idea_id !== ideaId) throw new Error('idea snapshot update changed immutable identity')
    writeIdeaUnlocked(repoRoot, next, fp, lease.repositoryFd)
    return next
  } finally {
    releaseIdeaMutationLease(fp, lease)
  }
}

export interface IdeaPromotionReservation { idea_id: string; token: string; started_at: string }
function promotionReservationPath(repoRoot: string, ideaId: string): string {
  return path.join(ideasDir(repoRoot), `${ideaId}.promotion`)
}
function readPromotionReservation(fp: string): IdeaPromotionReservation | null {
  try {
    const value = JSON.parse(fs.readFileSync(fp, 'utf8'))
    return value?.idea_id && value?.token && value?.started_at ? value as IdeaPromotionReservation : null
  } catch { return null }
}

/** Durable cross-request reservation made before a paid launch. A second request cannot spend twice. */
export function reserveIdeaPromotion(repoRoot: string, ideaId: string, nowMs = Date.now()): IdeaPromotionReservation | null {
  if (!/^IDEA-[a-f0-9]{12}$/.test(ideaId)) return null
  const dir = ideasDir(repoRoot)
  fs.mkdirSync(dir, { recursive: true })
  const fp = path.join(dir, `${ideaId}.json`)
  let lease: IdeaMutationLease
  try { lease = acquireIdeaMutationLease(repoRoot, fp) } catch (e: any) {
    if (e?.code === 'EBUSY') return null
    throw e
  }
  try {
    const current = readIdeaById(repoRoot, ideaId)
    if (!current || current.status === 'promoted') return null
    const reservationFile = promotionReservationPath(repoRoot, ideaId)
    const prior = readPromotionReservation(reservationFile)
    const priorAt = Date.parse(prior?.started_at || '')
    if (prior && Number.isFinite(priorAt) && nowMs - priorAt <= IDEA_PROMOTION_STALE_MS) return null
    try { fs.unlinkSync(reservationFile) } catch (e: any) { if (e?.code !== 'ENOENT') throw e }
    const reservation: IdeaPromotionReservation = {
      idea_id: ideaId,
      token: randomUUID(),
      started_at: new Date(nowMs).toISOString().replace(/\.\d{3}Z$/, 'Z'),
    }
    fs.writeFileSync(reservationFile, JSON.stringify(reservation) + '\n', { flag: 'wx', mode: 0o600 })
    return reservation
  } finally {
    releaseIdeaMutationLease(fp, lease)
  }
}

/** Release only the caller's own pre-launch reservation. */
export function releaseIdeaPromotion(repoRoot: string, ideaId: string, token: string): void {
  if (!/^IDEA-[a-f0-9]{12}$/.test(ideaId)) return
  const fp = path.join(ideasDir(repoRoot), `${ideaId}.json`)
  let lease: IdeaMutationLease
  try { lease = acquireIdeaMutationLease(repoRoot, fp) } catch { return }
  try {
    const reservationFile = promotionReservationPath(repoRoot, ideaId)
    if (readPromotionReservation(reservationFile)?.token === token) {
      try { fs.unlinkSync(reservationFile) } catch { /* best effort */ }
    }
  } finally {
    releaseIdeaMutationLease(fp, lease)
  }
}

/** Merge only promotion lifecycle fields into the newest provider snapshot, then consume the reservation. */
export function finalizeIdeaPromotion(
  repoRoot: string,
  ideaId: string,
  token: string,
  signalId: string,
  updatedAt: string,
  fallback: SurfacedIdea,
): SurfacedIdea {
  const fp = path.join(ideasDir(repoRoot), `${ideaId}.json`)
  const lease = acquireIdeaMutationLease(repoRoot, fp)
  try {
    const reservationFile = promotionReservationPath(repoRoot, ideaId)
    if (readPromotionReservation(reservationFile)?.token !== token) throw new Error('idea promotion reservation was lost')
    const current = readIdeaById(repoRoot, ideaId) || fallback
    if (current.idea_id !== ideaId) throw new Error('idea promotion identity changed')
    const next: SurfacedIdea = { ...current, status: 'promoted', promoted_signal_id: signalId, updated_at: updatedAt }
    writeIdeaUnlocked(repoRoot, next, fp, lease.repositoryFd)
    fs.unlinkSync(reservationFile)
    return next
  } finally {
    releaseIdeaMutationLease(fp, lease)
  }
}

/**
 * Delete snapshots whose decay is well past (older than `hardTtlMs` beyond decay_at) so the ledger can't
 * grow without bound. A still-fresh or recently-decayed idea is kept (the board shows decayed ones dimmed
 * for a while); a PROMOTED idea is always kept (it links to a real run). Returns how many were removed.
 */
export function pruneExpiredIdeas(repoRoot: string, nowMs: number, hardTtlMs: number): number {
  let removed = 0
  for (const idea of readIdeaSnapshots(repoRoot)) {
    const fp = path.join(ideasDir(repoRoot), `${idea.idea_id}.json`)
    let lease: IdeaMutationLease
    try { lease = acquireIdeaMutationLease(repoRoot, fp) } catch { continue }
    try {
      // Re-read inside the writer lock. A refresh/promotion that landed after the directory scan wins.
      const current = readIdeaById(repoRoot, idea.idea_id)
      if (!current || current.status === 'promoted' || fs.existsSync(promotionReservationPath(repoRoot, idea.idea_id))) continue
      const decay = Date.parse(current.decay_at)
      if (Number.isFinite(decay) && nowMs - decay > hardTtlMs) {
        try { fs.unlinkSync(fp); removed++ } catch { /* best effort */ }
      }
    } finally {
      releaseIdeaMutationLease(fp, lease)
    }
  }
  return removed
}

/**
 * Free prior-coverage read (no LLM): has the engine already looked at this ticker? Two cheap filesystem
 * checks — a finished analyses/<TICKER>_* run (with its decision) and a data/<TICKER>/ pool. Lets the card
 * say "fresh — never rated" vs "already rated · <decision>", which kills half the "did we look at this?"
 * friction. Never throws.
 */
export function priorCoverage(repoRoot: string, ticker: string): PriorCoverage {
  const t = ticker.toUpperCase()
  const out: PriorCoverage = { has_run: false, latest_run: null, latest_decision: null, data_pool_present: false }
  try { out.data_pool_present = fs.existsSync(path.join(repoRoot, 'data', t)) && fs.statSync(path.join(repoRoot, 'data', t)).isDirectory() } catch { /* absent */ }
  try {
    const runs = fs.readdirSync(path.join(repoRoot, 'analyses'))
      .filter((f) => f === t || f.startsWith(`${t}_`))
      .sort()
      .reverse()
    if (runs.length) {
      out.has_run = true
      out.latest_run = path.posix.join('analyses', runs[0])
      const dr = readDecision(path.join(repoRoot, 'analyses', runs[0], 'decision_record.json'))
      out.latest_decision = dr
    }
  } catch { /* no analyses dir */ }
  return out
}

function readDecision(fp: string): string | null {
  try {
    const o = JSON.parse(fs.readFileSync(fp, 'utf8'))
    const d = o?.decision ?? o?.verdict ?? o?.rating ?? o?.recommendation
    return typeof d === 'string' ? d.slice(0, 60) : null
  } catch { return null }
}

// ---- human feedback on a surfaced idea (the self-grading loop) ------------------------------------
// A 👍/👎 (with an optional reason) on an idea card. Its OWN ledger — never the wire's screener_feedback,
// so idea-quality is not conflated with wire-materiality. Append-only, last line per idea_id wins (the
// board reader + the python scorecard both take the latest). A 'clear' un-votes.
export type IdeaFeedbackPolarity = 'up' | 'down' | 'clear'
export interface IdeaFeedbackRecord {
  idea_feedback_id: string
  ts: string
  idea_id: string
  ticker: string
  polarity: IdeaFeedbackPolarity
  reason: string | null
  user: string
}

/** Append one idea-feedback record via the shared atomic-locked ndjson appender (idempotency key is the
 *  per-submit id, so every vote appends and the reader takes the last per idea_id). Never throws fatally
 *  to the caller beyond the exec — the endpoint wraps it. */
export async function appendIdeaFeedback(repoRoot: string, rec: IdeaFeedbackRecord): Promise<void> {
  const ledger = path.join(repoRoot, 'screener', 'ledger', 'ideas_feedback.ndjson')
  await execFileAsync('bash', [path.join(repoRoot, 'scripts', 'append-ndjson.sh'), ledger, JSON.stringify(rec), 'idea_feedback_id', rec.idea_feedback_id], { cwd: repoRoot, timeout: 15_000 })
}

// ---- pass state (change-detection + interval throttle) --------------------------------------------
export interface IdeaPassState { hash: string; ran_at_ms: number }

export function readPassState(stateDir: string): IdeaPassState | null {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(stateDir, 'ideas-pass.json'), 'utf8'))
    if (o && typeof o.hash === 'string' && typeof o.ran_at_ms === 'number') return o as IdeaPassState
  } catch { /* fresh */ }
  return null
}

export function writePassState(stateDir: string, state: IdeaPassState): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, 'ideas-pass.json'), JSON.stringify(state))
  } catch { /* a missed write only risks one redundant pass next tick */ }
}
