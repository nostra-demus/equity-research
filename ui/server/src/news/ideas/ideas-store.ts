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
import { readFeed } from '../feed'
import { hasNonLatinScript } from '../lang'
import { cleanTicker, coreCompanyName, normTicker } from '../symbology'
import { SOURCE_TIERS, type SourceTierId } from '../scope'
import { createThemesIndexReader } from '../themes/api-index'
import {
  resolveThemeFamilyState,
  sameThemeStoryObservation,
  themeStoryFamilyKey,
} from '../themes/story-key'
import { loadThemes, readThemesIndex, themesLedgerPath } from '../themes/store'
import type { Theme, ThemeMember } from '../themes/types'
import { admitThemeToIdeas } from '../themes/idea-admission'
import { qualifyTheme } from '../themes/qualification'
import type { FeedItem } from '../types'
import {
  classifyHumanVetoStoryState,
  classifyStoryObservation,
  humanVetoStoryStates,
  type HumanVetoStoryState,
  type StoryObservationKind,
} from '../write-inbox'
import { parseRfc3339Ms } from '../../rfc3339'
import { readInboxHumanActions } from '../inbox-actions'
import { canonicalJsonText } from '../../canonical-json'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../../singleton-lock'
import {
  buildIdeaUserMessage,
  IDEA_SYSTEM,
  THESIS_TYPES,
  type IdeaDirection,
  type IdeaInputRow,
  type IdeaOriginType,
  type IdeaSourceTheme,
  type IdeaThemeContext,
  type IdeaThemeExpression,
  type PricedIn,
  type RawIdea,
  type ThesisType,
} from './surface-ideas'
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
  pair_with: string | null // new pair snapshots persist this only after an independent exact-symbol listing check
  reason: string
  why_now: string
  conviction: number // 0-100 pre-edge PROXY
  conviction_basis: 'pre_edge_proxy' // hard label — never the locked edge score (§7)
  trade_score: number // strict, capped readiness score; still not expected return or a verdict
  trade_score_basis: 'evidence_gate_v1' | 'evidence_gate_v2'
  trade_score_breakdown: TradeScoreBreakdown
  trade_readiness: 'check_now' | 'needs_data' | 'watch_only'
  missing_checks: string[]
  learning: IdeaLearning
  priced_in: PricedIn
  thesis_type: ThesisType
  origin_type?: IdeaOriginType // absent only on deploy-compatible legacy snapshots
  source_themes?: IdeaSourceTheme[] // exact theme revisions attached to the raw source rows the idea used
  source_event_ids: string[] // EVT-* — the join key back to the wire (canonical eventIdFor over the original headline)
  primary_source_event_id?: string // exact launch source; absent only on conservatively preserved wire-only legacy snapshots
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

/** Durable audit copy written before an expired, unpromoted snapshot leaves the live store. */
export interface ArchivedIdeaSnapshot {
  schema_version: 'idea-archive/v1'
  archived_at: string
  archive_reason: 'expired_pruned'
  snapshot: SurfacedIdea
}

/** Evidence-honest recovery row from a committed historical board. It is never a live SurfacedIdea. */
export interface ImportedIdeaArchive {
  schema_version: 'idea-board-recovery/v1'
  recovered_at: string
  recovery_reason: 'latest_board_current' | 'historical_board_expired'
  provenance: {
    source_path: 'screener/board/index.json'
    source_commit: string
    board_generated_at: string
    source_row_sha256: string
  }
  board_row: Record<string, unknown>
}

interface SuppressedIdeaArchive {
  schema_version: 'idea-archive-suppression/v1'
  idea_id: string
  idea_version: string
  idea_version_started_at: string
  direction: IdeaDirection
  pair_with: string | null
  suppressed_at: string
  suppression_reason: 'withdrawn_unadmitted'
}

export type IdeaArchiveStoreStatus = 'missing' | 'ok' | 'degraded' | 'unreadable'
export interface IdeaArchiveStoreRead {
  snapshots: ArchivedIdeaSnapshot[]
  imports: ImportedIdeaArchive[]
  /** Internal recovery-current barriers; never projected as public archive rows. */
  lifecycle_barriers: { idea_id: string; idea_version_started_at: string | null }[]
  status: IdeaArchiveStoreStatus
  file_count: number
  suppression_count: number
  corrupt_count: number
  invalid_count: number
  error: string | null
  retention: IdeaArchiveRetention
}

export interface IdeaArchiveRetention {
  truncated: boolean
  evicted_count: number
  oldest_retained_at: string | null
  side_counts: {
    long: { evicted_count: number; oldest_retained_at: string | null }
    short: { evicted_count: number; oldest_retained_at: string | null }
  }
}

interface IdeaArchiveRetentionFile {
  schema_version: 'idea-archive-retention/v1'
  evicted_count: number
  side_counts: { long: { evicted_count: number }; short: { evicted_count: number } }
  pending_evictions: string[]
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

export type TopSweepStatus = 'ok' | 'missing' | 'corrupt' | 'stale' | 'degraded'
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
  /** Direct feature gate for the Themes → Ideas bridge. Omitted keeps legacy callers enabled. */
  themesEnabled?: boolean
  /** Return every current eligible row after the same evidence-family, human-veto, and Theme-package
   * projection. The Ideas orchestrator uses this to chunk complete coverage itself; ordinary callers keep
   * the explicit `topN` cap. */
  allEligible?: boolean
}

function ideasDir(repoRoot: string): string { return path.join(repoRoot, 'screener', 'ledger', 'ideas') }
function ideasLog(repoRoot: string): string { return path.join(repoRoot, 'screener', 'ledger', 'ideas.ndjson') }
function ideasArchiveDir(repoRoot: string): string { return path.join(repoRoot, 'screener', 'ledger', 'ideas_archive') }
/** One stable file per id, retaining each side independently so a short-heavy feed cannot erase LONG audit history. */
export const IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE = 250
const IDEA_ARCHIVE_MAX_OCCURRENCES_READ = IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE * 2 + 100
const IDEA_ARCHIVE_MAX_FILES_READ = IDEA_ARCHIVE_MAX_OCCURRENCES_READ * 3
const IDEA_ARCHIVE_MAX_DIRECTORY_ENTRIES_READ = IDEA_ARCHIVE_MAX_FILES_READ + 64
type IdeaArchiveFileKind = 'expired' | 'imported' | 'withdrawn'
const IDEA_ARCHIVE_FILE_RE = /^(IDEA-[a-f0-9]{12})--(IDEAV-[a-f0-9]{16})--([a-f0-9]{64})--(long|short|pair)--(expired|imported|withdrawn)\.json$/
const IDEA_ARCHIVE_RETENTION_FILE = 'retention.json'
const IDEA_ARCHIVE_RETENTION_REQUIRED_FILE = '.retention-required'
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

export interface IdeaVersionInput {
  ticker: string
  direction: IdeaDirection
  pairWith: string | null
  thesisType: ThesisType
  reason: string
  whyNow: string
  sourceEventIds: string[]
  primarySourceEventId: string
  sourceHeadline: string
  sourceUrl: string
  sourceName: string
  originType: IdeaOriginType
  sourceThemes: IdeaSourceTheme[]
}

const IDEA_VERSION_SCHEMA = 'surfaced-idea-version/v2' as const
const normalizedIdeaText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

/** Exact thesis snapshot identity. The canonical, versioned JSON payload has no delimiter grammar: a
 * headline, URL, company name, or future field containing `|`, `;`, `[]`, or braces cannot alias another
 * record. scripts/update_board_index.py hashes the same canonical UTF-8 bytes. */
export function ideaVersion(input: IdeaVersionInput): string {
  const sourceThemes = [...input.sourceThemes]
    .map((theme) => ({
      theme_id: theme.theme_id,
      theme_rev: theme.theme_rev,
      evidence_event_ids: [...new Set(theme.evidence_event_ids || [])].sort(),
      why_now_event_id: theme.why_now_event_id ?? null,
    }))
    .sort((a, b) => a.theme_id.localeCompare(b.theme_id) || a.theme_rev - b.theme_rev)
  const payload = {
    schema_version: IDEA_VERSION_SCHEMA,
    thesis: {
      ticker: input.ticker.toUpperCase(),
      direction: input.direction,
      pair_with: input.pairWith === null ? null : normTicker(input.pairWith),
      thesis_type: input.thesisType,
      reason: normalizedIdeaText(input.reason),
      why_now: normalizedIdeaText(input.whyNow),
    },
    sources: {
      event_ids: [...new Set(input.sourceEventIds)].sort(),
      origin_type: input.originType,
      source_themes: sourceThemes,
      primary: {
        event_id: input.primarySourceEventId,
        headline: input.sourceHeadline,
        url: input.sourceUrl,
        name: input.sourceName,
      },
    },
  }
  return 'IDEAV-' + createHash('sha256').update(canonicalJsonText(payload), 'utf8').digest('hex').slice(0, 16)
}

/** Pre-pair-leg recipe accepted only for snapshots that also predate lineage. Absence of both lineage
 * fields is the migration discriminator; no new wire/theme/mixed snapshot may use this hash. */
function legacyIdeaVersion(input: {
  ticker: string; direction: IdeaDirection; pairWith?: string | null; thesisType: ThesisType; reason: string; whyNow: string; sourceEventIds: string[]
  originType?: IdeaOriginType; sourceThemes?: IdeaSourceTheme[]
}, bindPair = false): string {
  const canonical = [
    input.ticker.toUpperCase(), input.direction,
    ...(bindPair ? [`pair:${input.pairWith === null ? 'null' : normTicker(input.pairWith || '')}`] : []),
    input.thesisType,
    input.reason.trim().toLowerCase().replace(/\s+/g, ' '),
    input.whyNow.trim().toLowerCase().replace(/\s+/g, ' '),
    [...new Set(input.sourceEventIds)].sort().join(','),
  ]
  if (input.originType !== undefined) {
    const refs = [...(input.sourceThemes || [])].map((theme) => {
      const evidence = [...new Set(theme.evidence_event_ids || [])].sort().join(',')
      const whyNow = theme.why_now_event_id ? `{why:${theme.why_now_event_id}}` : ''
      return `${theme.theme_id}@${theme.theme_rev}[${evidence}]${whyNow}`
    }).sort().join(';')
    canonical.push(input.originType, refs)
  }
  const text = canonical.join('|')
  return 'IDEAV-' + createHash('sha256').update(text).digest('hex').slice(0, 16)
}

const IDEA_ID_RE = /^IDEA-[a-f0-9]{12}$/
const IDEA_VERSION_RE = /^IDEAV-[a-f0-9]{16}$/
const EVENT_ID_RE = /^EVT-[a-f0-9]{12}$/
const THEME_ID_RE = /^THM-[a-f0-9]{8}$/
const DIRECTIONS = new Set<IdeaDirection>(['long', 'short', 'pair'])
const PRICED_IN = new Set<PricedIn>(['priced', 'room', 'unknown'])
const READINESS = new Set<SurfacedIdea['trade_readiness']>(['check_now', 'needs_data', 'watch_only'])
const THESIS_TYPE_SET = new Set<string>(THESIS_TYPES)
const IDEA_ORIGINS = new Set<IdeaOriginType>(['wire', 'theme', 'mixed'])
const MAX_SOURCE_THEMES = 64
const MAX_ACTIONABLE_THEMES = 64
const MAX_THEME_EVIDENCE_ROWS = 192
const MAX_THEME_EXPRESSIONS = 4
// A 13D-style package can pair today's causal update with structural company proof established weeks
// earlier. The resolver remains tightly bounded: at most 64 themes / 192 exact event IDs / 31 calendar
// files, and canonical Theme members are used first so a healthy ledger does not rescan the firehose.
const MAX_THEME_STRUCTURAL_PROOF_AGE_MS = 30 * 86_400_000
const MAX_THEME_FEED_LOOKBACK_DAYS = 31
const MAX_THEMES_READER_CACHE = 8
// The themes writer runs every default five-minute poll and the full ingest-cycle guard is eight minutes.
// Two polls (10 minutes) is therefore the conservative last-good ceiling: it tolerates one ordinary slow
// cycle, but a disabled/failed themes stage cannot keep a prior actionable assessment alive for hours.
// This is deliberately far tighter than the six-hour evidence window used to qualify actionability.
const THEMES_INDEX_MAX_AGE_MS = 10 * 60_000
const SOURCE_FUTURE_SKEW_MS = 5 * 60_000

interface IdeasThemesReader {
  nowMs: number
  read: ReturnType<typeof createThemesIndexReader>
}
const ideasThemesReaders = new Map<string, IdeasThemesReader>()

/** Reproject content from the canonical ledger, but preserve the persisted index clock: that clock is the
 * last successful Themes stage. Stamping `now` onto a ledger reprojection hid a failed stage and allowed a
 * stale thesis to annotate a newer sweep. */
function readCurrentThemesIndex(repoRoot: string, nowMs: number) {
  if (!fs.existsSync(themesLedgerPath(repoRoot))) return readThemesIndex(repoRoot)
  const key = path.resolve(repoRoot)
  let cached = ideasThemesReaders.get(key)
  if (!cached) {
    if (ideasThemesReaders.size >= MAX_THEMES_READER_CACHE) {
      const oldest = ideasThemesReaders.keys().next().value
      if (oldest) ideasThemesReaders.delete(oldest)
    }
    const state: IdeasThemesReader = { nowMs, read: null as unknown as ReturnType<typeof createThemesIndexReader> }
    state.read = createThemesIndexReader(repoRoot, { now: () => new Date(state.nowMs) })
    cached = state
    ideasThemesReaders.set(key, cached)
  }
  cached.nowMs = nowMs
  const projected = cached.read()
  const lastSuccessful = readThemesIndex(repoRoot)
  return { ...projected, generated_at: lastSuccessful.generated_at }
}

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

const V2_LIVE_DATA_GAP = 'live price, liquidity, and consensus'
const V2_MISSING_CHECKS = new Set([
  'verified listed ticker', 'verified listing', 'live liquidity', 'dated catalyst',
  'raw economic impact', 'priced-in risk', 'price and market expectations',
  'independent confirmation', V2_LIVE_DATA_GAP,
])

/** V2 snapshots cannot be fully replayed from the compact card record because the individual source rows
 * are intentionally not duplicated there. Bind every field that *is* deterministic at this boundary:
 * exact scorer arithmetic, the directory-only listing state, the permanent news-only cap, and all missing
 * checks implied by persisted state. A malformed cache may become less prominent; it may never claim a
 * readiness state the V2 producer cannot emit. */
function validEvidenceGateV2State(value: Record<string, unknown>): boolean {
  if (value.trade_score_basis !== 'evidence_gate_v2') return true
  if (!validTradeBreakdown(value.trade_score_breakdown) || !Array.isArray(value.missing_checks)) return false
  const breakdown = value.trade_score_breakdown
  const missing = value.missing_checks as string[]
  const has = (check: string): boolean => missing.includes(check)
  if (missing.some((check) => !V2_MISSING_CHECKS.has(check))) return false

  // runIdeaPass uses one exact directory result for ticker + listing and deliberately leaves liquidity
  // unverified. Any other combination was not produced by evidence_gate_v2.
  const listingVerified = value.listing_verified === true
  if (value.ticker_verified !== listingVerified || value.liquidity_verified !== false) return false
  if (breakdown.specificity !== (listingVerified ? 15 : 7)) return false
  if (breakdown.expression !== (listingVerified ? 6 : 0)) return false
  if (breakdown.learning_adjustment !== (value.learning as IdeaLearning).adjustment) return false
  if (![0, 3, 7, 14, 18, 23, 25].includes(breakdown.evidence)) return false
  if (![2, 6, 10, 15].includes(breakdown.timing)) return false
  if (![0, 6, 10].includes(breakdown.corroboration)) return false

  if (has('verified listed ticker') !== !listingVerified || has('verified listing') !== !listingVerified) return false
  if (!has('live liquidity') || !has(V2_LIVE_DATA_GAP)) return false
  if (has('dated catalyst') !== (breakdown.timing !== 15)) return false
  if (has('raw economic impact') !== (breakdown.impact === 0)) return false
  if (has('independent confirmation') !== (breakdown.corroboration === 0 && breakdown.evidence < 23)) return false
  if (has('priced-in risk') !== (value.priced_in === 'priced')) return false
  if (has('price and market expectations') !== (value.priced_in === 'unknown')) return false

  let cap = 100
  if (!listingVerified) cap = Math.min(cap, 45)
  if (!listingVerified) cap = Math.min(cap, 55)
  cap = Math.min(cap, 62) // liquidity is deliberately unverified in V2
  if (has('dated catalyst')) cap = Math.min(cap, 65)
  if (has('raw economic impact')) cap = Math.min(cap, 65)
  if (value.priced_in === 'priced') cap = Math.min(cap, 55)
  else if (value.priced_in === 'unknown') cap = Math.min(cap, 60)
  else cap = Math.min(cap, 62)
  if (has('independent confirmation')) cap = Math.min(cap, 62)
  cap = Math.min(cap, 62) // every news-only row carries the explicit live-data ceiling

  const uncapped = Math.max(0, Math.min(100,
    breakdown.evidence + breakdown.impact + breakdown.specificity + breakdown.timing +
    breakdown.expression + breakdown.corroboration + breakdown.learning_adjustment,
  ))
  if (value.trade_score !== Math.min(uncapped, cap)) return false
  const expectedReadiness = listingVerified && value.trade_score >= 45 ? 'needs_data' : 'watch_only'
  return value.trade_readiness === expectedReadiness
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

/** New snapshots carry both lineage fields; legacy snapshots carry neither. Partial or contradictory
 * lineage fails closed so a malformed deploy cannot silently relabel a wire idea as theme-backed. */
function validIdeaLineage(value: Record<string, unknown>, requireWhyNow: boolean): boolean {
  const hasOrigin = Object.prototype.hasOwnProperty.call(value, 'origin_type')
  const hasThemes = Object.prototype.hasOwnProperty.call(value, 'source_themes')
  if (!hasOrigin && !hasThemes) return true
  if (!hasOrigin || !hasThemes || !IDEA_ORIGINS.has(value.origin_type as IdeaOriginType)) return false
  if (!Array.isArray(value.source_themes) || value.source_themes.length > MAX_SOURCE_THEMES) return false
  const seen = new Set<string>()
  let mapped: boolean | null = null
  const sourceEventIds = new Set(Array.isArray(value.source_event_ids) ? value.source_event_ids : [])
  for (const theme of value.source_themes) {
    if (!record(theme) || !exactString(theme.theme_id, 12) || !THEME_ID_RE.test(theme.theme_id)) return false
    if (!boundedNumber(theme.theme_rev, 1, Number.MAX_SAFE_INTEGER, true)) return false
    if (seen.has(theme.theme_id)) return false
    seen.add(theme.theme_id)
    const hasEvidenceIds = Object.prototype.hasOwnProperty.call(theme, 'evidence_event_ids')
    if (mapped === null) mapped = hasEvidenceIds
    else if (mapped !== hasEvidenceIds) return false
    if (hasEvidenceIds) {
      if (!exactStringArray(theme.evidence_event_ids, 64, 16, false, true)) return false
      if (!theme.evidence_event_ids.every((id) => EVENT_ID_RE.test(id) && sourceEventIds.has(id))) return false
    }
    const hasWhyNow = Object.prototype.hasOwnProperty.call(theme, 'why_now_event_id')
    if (hasWhyNow) {
      if (!exactString(theme.why_now_event_id, 16) || !EVENT_ID_RE.test(theme.why_now_event_id)
        || !sourceEventIds.has(theme.why_now_event_id)
        || !hasEvidenceIds
        || !(theme.evidence_event_ids as string[]).includes(theme.why_now_event_id)) return false
    }
    if (requireWhyNow && value.origin_type !== 'wire') {
      if (!hasWhyNow) return false
      const evidenceIds = theme.evidence_event_ids as string[]
      // A Theme-derived idea is a two-source causal package: the fresh why-now trigger plus distinct
      // issuer/expression proof. One event may not wear both hats in persisted lineage either.
      if (evidenceIds.length < 2 || !evidenceIds.some((eventId) => eventId !== theme.why_now_event_id)) return false
    }
  }
  return value.origin_type === 'wire'
    ? value.source_themes.length === 0
    : value.source_themes.length > 0 && mapped === true
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
  if (!exactString(value.ticker, 15) || cleanTicker(value.ticker) !== value.ticker) return false
  if (!DIRECTIONS.has(value.direction as IdeaDirection)) return false
  const direction = value.direction as IdeaDirection
  if (value.idea_id !== ideaId(value.ticker, direction)) return false

  if (!nullableExactString(value.company, 120) || !nullableExactString(value.exchange, 24)) return false
  if (typeof value.ticker_verified !== 'boolean' || typeof value.listing_verified !== 'boolean' || typeof value.liquidity_verified !== 'boolean') return false
  if (value.listing_verification_source !== null && value.listing_verification_source !== 'yahoo_symbol_directory') return false
  if (value.listing_verified && (!value.ticker_verified || value.exchange === null || value.listing_verification_source === null)) return false
  if (value.liquidity_verified && !value.listing_verified) return false
  if (!value.ticker_verified && value.listing_verification_source !== null) return false

  if (value.pair_with !== null && (!exactString(value.pair_with, 15) || cleanTicker(value.pair_with) !== value.pair_with)) return false
  if (direction === 'pair' ? value.pair_with === null : value.pair_with !== null) return false
  if (!exactString(value.reason, 280) || !exactString(value.why_now, 240)) return false
  if (!boundedNumber(value.conviction, 0, 100, true) || value.conviction_basis !== 'pre_edge_proxy') return false
  if (!boundedNumber(value.trade_score, 0, 100, true) || !['evidence_gate_v1', 'evidence_gate_v2'].includes(String(value.trade_score_basis))) return false
  if (!validTradeBreakdown(value.trade_score_breakdown) || !READINESS.has(value.trade_readiness as SurfacedIdea['trade_readiness'])) return false
  if (!exactStringArray(value.missing_checks, 32, 160, true, true) || !validLearning(value.learning)) return false
  if (!validEvidenceGateV2State(value)) return false
  if (!PRICED_IN.has(value.priced_in as PricedIn) || !THESIS_TYPE_SET.has(String(value.thesis_type))) return false
  if (!exactStringArray(value.source_event_ids, 64, 16, false, true) || !value.source_event_ids.every((id) => EVENT_ID_RE.test(id))) return false
  const hasPrimarySource = Object.prototype.hasOwnProperty.call(value, 'primary_source_event_id')
  if (!validIdeaLineage(value, hasPrimarySource)) return false
  if (!exactStringArray(value.source_headlines, 4, 500, false)) return false
  if (!nullableExactString(value.source_headline, 500) || !nullableExactString(value.source_url, 2_000) || !nullableExactString(value.source_name, 160)) return false
  if (hasPrimarySource) {
    if (!exactString(value.primary_source_event_id, 16) || !EVENT_ID_RE.test(value.primary_source_event_id)
      || !(value.source_event_ids as string[]).includes(value.primary_source_event_id)
      || value.source_headline === null || value.source_url === null || value.source_name === null
      || eventIdFor(value.source_headline, value.source_url) !== value.primary_source_event_id) return false
  } else if (value.origin_type === 'theme' || value.origin_type === 'mixed') {
    // Historical Theme lineage without an exact launch source cannot be proven safe. It is intentionally
    // retired by the next pass / omitted by static projection instead of being guessed through migration.
    return false
  }
  if (!boundedNumber(value.materiality_max, 0, 100)) return false
  if (!validPriorCoverage(value.prior_coverage)) return false

  if (hasPrimarySource) {
    const version = ideaVersion({
      ticker: value.ticker,
      direction,
      pairWith: value.pair_with,
      thesisType: value.thesis_type as ThesisType,
      reason: value.reason,
      whyNow: value.why_now,
      sourceEventIds: value.source_event_ids,
      primarySourceEventId: value.primary_source_event_id as string,
      sourceHeadline: value.source_headline as string,
      sourceUrl: value.source_url as string,
      sourceName: value.source_name as string,
      originType: value.origin_type as IdeaOriginType,
      sourceThemes: value.source_themes as IdeaSourceTheme[],
    })
    if (value.idea_version !== version) return false
  } else {
    const hasLineage = Object.prototype.hasOwnProperty.call(value, 'origin_type')
    const legacy = legacyIdeaVersion({
      ticker: value.ticker,
      direction,
      pairWith: value.pair_with,
      thesisType: value.thesis_type as ThesisType,
      reason: value.reason,
      whyNow: value.why_now,
      sourceEventIds: value.source_event_ids,
      ...(hasLineage ? {
        originType: value.origin_type as IdeaOriginType,
        sourceThemes: value.source_themes as IdeaSourceTheme[],
      } : {}),
    }, hasLineage)
    if (value.idea_version !== legacy) return false
  }

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

/** Candidate dedupe is exact-observation level, not a finite English status-word list. The bounded family
 * cap and model-visible story_family label prevent those retained observations from becoming fake breadth. */
function sameIdeaObservation(left: IdeaInputRow, right: IdeaInputRow): boolean {
  return sameThemeStoryObservation(
    { ...left, headline: left.headline_orig || left.headline, headline_en: left.headline || left.headline_orig },
    { ...right, headline: right.headline_orig || right.headline, headline_en: right.headline || right.headline_orig },
  )
}

/** Stable URL identity for human vetoes. Tracking/query order and fragments cannot resurrect the same
 * article, while meaningful non-tracking query parameters remain part of the source identity. */
function canonicalHumanVetoUrl(raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim().slice(0, 4_000) : ''
  if (!value) return ''
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return value
    // Publisher migrations from HTTP to HTTPS do not create a new human-visible article. Human vetoes
    // are conservative aliases, so normalize both schemes to the secure form.
    url.protocol = 'https:'
    if (url.port === '80' || url.port === '443') url.port = ''
    url.hostname = url.hostname.replace(/\.+$/, '').toLowerCase()
    url.hash = ''
    const params = [...url.searchParams.entries()]
      .filter(([key]) => !/^utm_/i.test(key)
        && !/^(fbclid|gclid|dclid|msclkid|srsltid|igshid|mkt_tok|cmpid|mc_cid|mc_eid|vero_id|_hsenc|_hsmi|ref)$/i.test(key))
      // URLSearchParams.sort() orders keys only and preserves duplicate-value insertion order. Human
      // identity must also survive `?a=1&a=2` becoming `?a=2&a=1`, so sort the complete pairs.
      .sort(([leftKey, leftValue], [rightKey, rightValue]) => leftKey.localeCompare(rightKey)
        || leftValue.localeCompare(rightValue))
    url.search = ''
    for (const [key, value] of params) url.searchParams.append(key, value)
    // WHATWG preserves escaped unreserved path bytes. Decode only RFC 3986 unreserved characters so
    // `%7Eissuer` and `~issuer` share identity without collapsing reserved delimiters such as `%2F`.
    url.pathname = url.pathname
      .replace(/%([0-9a-f]{2})/gi, (encoded, hex: string) => {
        const char = String.fromCharCode(Number.parseInt(hex, 16))
        return /[A-Za-z0-9._~-]/.test(char) ? char : encoded.toUpperCase()
      })
      .replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
    return url.toString().replace(/\/$/, '')
  } catch {
    // A malformed but stable imported URL is still a useful negative alias. The exact trimmed value is
    // safer than discarding the only identity a legacy consumed/dismissed row may carry.
    return value
  }
}

/** Human decisions bind the event, the stable publisher-copy family, and canonical URL. Emit both event
 * and family namespaces for every id so a legacy anchor (event=A) and a later copy (family=A) cross-match. */
function ideaHumanVetoKeys(row: { event_id?: unknown; dedup_group?: unknown; url?: unknown }): string[] {
  const ids = [row.event_id, row.dedup_group]
    .flatMap((value) => typeof value === 'string' && value.trim() ? [value.trim()] : [])
  const keys = ids.flatMap((id) => [`event:${id}`, `family:${id}`])
  const url = canonicalHumanVetoUrl(row.url)
  if (url) keys.push(`url:${url}`)
  return [...new Set(keys)]
}

const MAX_IDEA_OBSERVATIONS_PER_STORY_FAMILY = 4
const ideaTierRank = (tier?: string): number => tier ? SOURCE_TIERS[tier as SourceTierId]?.rank ?? 0 : 0
const ideaRowTime = (row: IdeaInputRow): number => {
  const parsed = parseRfc3339Ms(row.found_at)
  return Number.isFinite(parsed) ? parsed : 0
}
const byIdeaEvidenceQuality = (a: IdeaInputRow, b: IdeaInputRow): number => (
  ideaTierRank(b.source_tier) - ideaTierRank(a.source_tier)
  || b.materiality - a.materiality
  || ideaRowTime(b) - ideaRowTime(a)
  || a.event_id.localeCompare(b.event_id)
)
const byIdeaObservationRecency = (a: IdeaInputRow, b: IdeaInputRow): number => (
  ideaRowTime(b) - ideaRowTime(a)
  || ideaTierRank(b.source_tier) - ideaTierRank(a.source_tier)
  || b.materiality - a.materiality
  || a.event_id.localeCompare(b.event_id)
)

function ideaObservationKind(row: IdeaInputRow): StoryObservationKind {
  return classifyStoryObservation({
    headline: row.headline_orig || row.headline,
    headline_en: row.headline || row.headline_orig,
    event_types: row.event_types,
  })
}

function orderedIdeaFamilyRows(group: IdeaInputRow[], cap: number): IdeaInputRow[] {
  const limit = Math.max(0, Math.floor(cap))
  const selected: IdeaInputRow[] = []
  const add = (row: IdeaInputRow | undefined): void => {
    if (row && selected.length < limit && !selected.includes(row)) selected.push(row)
  }
  // First preserve the §4 source winner, then the latest opposing/restorative states and newest exact
  // observation. The shared guarded classifier prevents an unrelated "proceeds" noun from taking the
  // restoration slot; all remaining exact-family observations are still eligible inside the hard cap.
  add([...group].sort(byIdeaEvidenceQuality)[0])
  add([...group].filter((row) => ideaObservationKind(row) === 'adverse').sort(byIdeaObservationRecency)[0])
  add([...group].filter((row) => ideaObservationKind(row) === 'restorative').sort(byIdeaObservationRecency)[0])
  add([...group].sort(byIdeaObservationRecency)[0])
  for (const row of [...group].sort(byIdeaObservationRecency)) add(row)
  return selected
}

/** Collapse publisher copies, bound each family's audit history, then apply the global top-N cap without
 * discarding a family's best source. */
function selectIdeaRows(
  rows: IdeaInputRow[],
  maxRows: number,
  maxPerFamily = MAX_IDEA_OBSERVATIONS_PER_STORY_FAMILY,
): IdeaInputRow[] {
  // Legacy callers without an explicit freshness contract may still supply rows with no source clock.
  // Such a row can remain a singleton fallback, but it cannot become a second "observation" or win a
  // tie once the same family has any properly dated evidence.
  const familiesWithSourceTime = new Set(rows
    .filter((row) => Number.isFinite(parseRfc3339Ms(row.found_at)))
    .map((row) => themeStoryFamilyKey(row) || row.event_id))
  rows = rows.filter((row) => Number.isFinite(parseRfc3339Ms(row.found_at))
    || !familiesWithSourceTime.has(themeStoryFamilyKey(row) || row.event_id))
  const familyPriorities = new Map<string, IdeaInputRow>()
  for (const row of rows) {
    const family = themeStoryFamilyKey(row) || row.event_id
    const prior = familyPriorities.get(family)
    if (!prior || (row.materiality - prior.materiality
      || ideaTierRank(row.source_tier) - ideaTierRank(prior.source_tier)
      || ideaRowTime(row) - ideaRowTime(prior)
      || prior.event_id.localeCompare(row.event_id)) > 0) familyPriorities.set(family, row)
  }
  const ordered = [...rows].sort(byIdeaEvidenceQuality)
  const observations: IdeaInputRow[] = []
  for (const row of ordered) {
    if (!row.event_id || observations.some((prior) => sameIdeaObservation(row, prior))) continue
    observations.push(row)
  }

  const families = new Map<string, IdeaInputRow[]>()
  for (const row of observations) {
    const family = themeStoryFamilyKey(row) || row.event_id
    const group = families.get(family) || []
    group.push(row)
    families.set(family, group)
  }
  const familyCap = Math.max(1, Math.floor(maxPerFamily))
  const selections = [...families.entries()].map(([key, group]) => {
    const selected = orderedIdeaFamilyRows(group, familyCap)
    const priority = familyPriorities.get(key) || [...group].sort((a, b) => b.materiality - a.materiality
      || ideaTierRank(b.source_tier) - ideaTierRank(a.source_tier)
      || ideaRowTime(b) - ideaRowTime(a)
      || a.event_id.localeCompare(b.event_id))[0]
    return { key, priority, rows: selected }
  }).sort((a, b) => b.priority.materiality - a.priority.materiality
    || ideaTierRank(b.priority.source_tier) - ideaTierRank(a.priority.source_tier)
    || ideaRowTime(b.priority) - ideaRowTime(a.priority)
    || a.key.localeCompare(b.key))

  // Choose families by the best material observation, then take one §4 source winner from every chosen
  // family before any second/third observation. A noisy status family can no longer crowd an unrelated
  // high-value filing out, and the final slice cannot undo the source-hierarchy pin.
  const cap = Math.max(0, Math.floor(maxRows))
  const chosen = selections.slice(0, cap)
  const picked: IdeaInputRow[] = []
  for (let depth = 0; picked.length < cap; depth++) {
    let found = false
    for (const family of chosen) {
      const row = family.rows[depth]
      if (!row) continue
      picked.push(row)
      found = true
      if (picked.length >= cap) break
    }
    if (!found) break
  }
  return picked.sort((a, b) => b.materiality - a.materiality
    || ideaTierRank(b.source_tier) - ideaTierRank(a.source_tier)
    || a.event_id.localeCompare(b.event_id))
}

const uniqueBy = <T>(rows: T[], key: (row: T) => string): T[] => {
  const out = new Map<string, T>()
  for (const row of rows) if (!out.has(key(row))) out.set(key(row), row)
  return [...out.values()]
}

/** Coalesce only the SAME canonical event. A publisher copy with a different event id remains a separate,
 * family-labelled observation; silently moving Theme lineage onto a different filing would forge the
 * revision's evidence edge. For an exact event, however, the better source row can safely carry the
 * Theme metadata because the event id still binds the exact headline+URL. */
function coalesceThemeRows(themeRows: IdeaInputRow[], wireRows: IdeaInputRow[]): IdeaInputRow[] {
  const out = new Map<string, IdeaInputRow>()
  for (const themeRow of themeRows) {
    const prior = out.get(themeRow.event_id)
    const wire = wireRows.find((row) => row.event_id === themeRow.event_id)
    const candidates = [prior, wire, themeRow].filter((row): row is IdeaInputRow => Boolean(row))
    const evidence = [...candidates].sort(byIdeaEvidenceQuality)[0]
    const sourceThemes = uniqueBy(
      candidates.flatMap((row) => row.source_themes || []),
      (theme) => `${theme.theme_id}@${theme.theme_rev}:${theme.why_now_event_id || ''}`,
    )
    const themeContexts = uniqueBy(
      candidates.flatMap((row) => row.theme_contexts || []),
      (context) => `${context.theme_id}@${context.theme_rev}:${context.role}:${context.why_now_event_id}`,
    )
    const themeExpressions = uniqueBy(
      candidates.flatMap((row) => row.theme_expressions || []),
      (expression) => `${expression.theme_id}@${expression.theme_rev}:${expression.name_key}:${expression.ticker}:${expression.side}`,
    )
    out.set(themeRow.event_id, {
      ...evidence,
      origin_type: wire || candidates.some((row) => row.origin_type === 'mixed') ? 'mixed' : 'theme',
      source_themes: sourceThemes,
      theme_contexts: themeContexts,
      theme_expressions: themeExpressions,
    })
  }
  return [...out.values()]
}

/** Build the actual model prompt after Theme insertion. Theme rows are indivisible proof packages, but
 * they still count against the same story-family cap as wire rows. Each reserved family's best wire source
 * and at least one independent family are pinned before extra observations, so insertion cannot replace a
 * filing with a weaker copy or crowd every unrelated story out of top-N. */
function projectIdeaRowsWithThemes(
  wireRows: IdeaInputRow[],
  rawThemeRows: IdeaInputRow[],
  maxRows: number,
): IdeaInputRow[] {
  const cap = Math.max(0, Math.floor(maxRows))
  if (!cap) return []
  const familyCap = cap > 1 ? Math.min(MAX_IDEA_OBSERVATIONS_PER_STORY_FAMILY, cap - 1) : 1
  const themeRows = coalesceThemeRows(rawThemeRows, wireRows)
  const picked = [...themeRows]
  const pickedEvents = new Set(picked.map((row) => row.event_id))
  const familyCounts = new Map<string, number>()
  for (const row of picked) {
    const family = themeStoryFamilyKey(row) || row.event_id
    familyCounts.set(family, (familyCounts.get(family) || 0) + 1)
  }
  if ([...familyCounts.values()].some((count) => count > familyCap) || picked.length > cap) return []

  const grouped = new Map<string, IdeaInputRow[]>()
  for (const row of wireRows) {
    if (pickedEvents.has(row.event_id)) continue
    const family = themeStoryFamilyKey(row) || row.event_id
    const group = grouped.get(family) || []
    if (!group.some((prior) => sameIdeaObservation(row, prior))) group.push(row)
    grouped.set(family, group)
  }
  const priority = (rows: IdeaInputRow[]): IdeaInputRow => [...rows].sort((a, b) => b.materiality - a.materiality
    || ideaTierRank(b.source_tier) - ideaTierRank(a.source_tier)
    || ideaRowTime(b) - ideaRowTime(a)
    || a.event_id.localeCompare(b.event_id))[0]
  const families = [...grouped.entries()].map(([key, rows]) => ({
    key,
    rows: orderedIdeaFamilyRows(rows, familyCap),
    priority: priority(rows),
  })).sort((a, b) => b.priority.materiality - a.priority.materiality
    || ideaTierRank(b.priority.source_tier) - ideaTierRank(a.priority.source_tier)
    || ideaRowTime(b.priority) - ideaRowTime(a.priority)
    || a.key.localeCompare(b.key))

  const add = (row: IdeaInputRow | undefined): boolean => {
    if (!row || picked.length >= cap || pickedEvents.has(row.event_id)) return false
    const family = themeStoryFamilyKey(row) || row.event_id
    if ((familyCounts.get(family) || 0) >= familyCap) return false
    picked.push(row)
    pickedEvents.add(row.event_id)
    familyCounts.set(family, (familyCounts.get(family) || 0) + 1)
    return true
  }

  const reservedFamilies = new Set(themeRows.map((row) => themeStoryFamilyKey(row) || row.event_id))
  // Pin the best wire source for every family represented by a Theme package. This is what keeps a
  // primary filing visible beside a different-event news copy without forging the Theme evidence id.
  for (const family of families.filter((entry) => reservedFamilies.has(entry.key))) add(family.rows[0])
  // Then pin the highest-priority independent family before any second observation from a reserved one.
  add(families.find((entry) => !reservedFamilies.has(entry.key))?.rows[0])

  for (let depth = 0; picked.length < cap; depth++) {
    let found = false
    for (const family of families) {
      const row = family.rows[depth]
      if (add(row)) found = true
      if (picked.length >= cap) break
    }
    if (!found && !families.some((family) => family.rows.slice(depth + 1).some((row) => !pickedEvents.has(row.event_id)))) break
  }
  return picked.sort((a, b) => b.materiality - a.materiality
    || ideaTierRank(b.source_tier) - ideaTierRank(a.source_tier)
    || a.event_id.localeCompare(b.event_id))
}

function validThemeRef(theme: unknown): theme is {
  theme_id: string
  rev: number
  description: string
  activity: string
  narrative: { thesis: string; why_now: string; why_now_event_id: string }
  evidence: { event_id: string; found_at?: string; headline?: string; source_name?: string | null; url?: string | null; stance: 'supports' | 'challenges' }[]
  qualified_expressions: {
    name: string
    name_key: string
    ticker: string
    listing_country: string | null
    side: 'beneficiary' | 'harmed'
    role: 'direct' | 'bottleneck' | 'enabler' | 'harmed' | 'hedge'
    mechanism: string
    evidence_event_ids: string[]
  }[]
  idea_ready: true
  assessment: { status: string; activity?: string; metrics: { narrative_support_count: number; narrative_coherence_pct: number; recurring_narrative_token_count: number } }
} {
  if (!record(theme) || !THEME_ID_RE.test(String(theme.theme_id || '')) || !exactString(theme.description, 500)) return false
  if (!boundedNumber(theme.rev, 1, Number.MAX_SAFE_INTEGER, true)) return false
  if (!record(theme.assessment) || !record(theme.assessment.metrics)
    || !boundedNumber(theme.assessment.metrics.narrative_support_count, 0, 10_000, true)
    || !boundedNumber(theme.assessment.metrics.narrative_coherence_pct, 0, 100, true)
    || !boundedNumber(theme.assessment.metrics.recurring_narrative_token_count, 0, 1_000, true)
    || theme.idea_ready !== true || theme.assessment.status !== 'actionable' || theme.activity === 'challenged'
    || theme.assessment.activity === 'challenged' || !record(theme.narrative)
    || !exactString(theme.narrative.thesis, 1_000) || !exactString(theme.narrative.why_now, 1_000)
    || !EVENT_ID_RE.test(String(theme.narrative.why_now_event_id || '')) || !Array.isArray(theme.evidence)) return false
  if (!Array.isArray(theme.qualified_expressions)
    || theme.qualified_expressions.length < 1
    || theme.qualified_expressions.length > MAX_THEME_EXPRESSIONS) return false
  const evidenceIds = new Set<string>()
  for (const evidence of theme.evidence) {
    if (!record(evidence) || (evidence.stance !== 'supports' && evidence.stance !== 'challenges')) return false
    // An explicit challenge is unresolved for as long as the current revision retains it. Recency only
    // changes the activity label; it must never quietly turn a challenged thesis into an Ideas seed.
    if (evidence.stance === 'challenges') return false
    if (evidence.stance === 'supports' && EVENT_ID_RE.test(String(evidence.event_id || ''))) evidenceIds.add(String(evidence.event_id))
  }
  const expressionKeys = new Set<string>()
  for (const expression of theme.qualified_expressions) {
    if (!record(expression)
      || !exactString(expression.name, 160)
      || !exactString(expression.name_key, 160)
      || !exactString(expression.ticker, 15)
      || cleanTicker(expression.ticker) !== expression.ticker
      || (expression.listing_country !== null && !exactString(expression.listing_country, 3))
      || (expression.side !== 'beneficiary' && expression.side !== 'harmed')
      || !['direct', 'bottleneck', 'enabler', 'harmed', 'hedge'].includes(String(expression.role || ''))
      || (expression.role === 'harmed' && expression.side !== 'harmed')
      || !exactString(expression.mechanism, 300)
      || !exactStringArray(expression.evidence_event_ids, 3, 16, false, true)
      || !expression.evidence_event_ids.every((id) => EVENT_ID_RE.test(id) && evidenceIds.has(id))) return false
    const key = `${expression.name_key}|${expression.ticker}|${expression.side}`
    if (expressionKeys.has(key)) return false
    expressionKeys.add(key)
  }
  return true
}

function themeAdmissionForIdeas(theme: {
  rev: number
  narrative: { thesis: string; why_now: string; why_now_event_id: string }
  assessment: { metrics: { narrative_support_count: number; narrative_coherence_pct: number; recurring_narrative_token_count: number } }
  evidence: { event_id: string; found_at?: string; headline?: string; source_name?: string | null; url?: string | null; stance: 'supports' | 'challenges' }[]
  qualified_expressions: Array<{ name: string; ticker: string; side: 'beneficiary' | 'harmed'; mechanism: string; evidence_event_ids: string[] }>
}, retained: Theme | undefined, nowMs: number) {
  // Canonical Themes and Ideas consume the exact same qualification/admission result. Do not rebuild a
  // parallel approximation from the compact index when the exact retained revision is available.
  if (retained) return qualifyTheme(retained, new Date(nowMs)).idea_admission

  const whyNowId = theme.narrative?.why_now_event_id || null
  const whyNowProjection = theme.evidence.find((row) => row.event_id === whyNowId && row.stance === 'supports')
  const metrics = theme.assessment.metrics
  // The normal path reads canonical player rows from the exact ledger revision. Index-only deploy/test
  // migration is allowed only when no ledger exists; qualified_expressions in that index are themselves
  // derived by Themes from eligible players and are never expanded here.
  const players = theme.qualified_expressions.map((expression) => ({
    name: expression.name,
    ticker: expression.ticker,
    listing_status: 'verified_public' as const,
    order: 1 as const,
    side: expression.side,
    relationship: 'direct_subject' as const,
    mechanism: expression.mechanism,
    mechanism_basis: 'engine_inference' as const,
    evidence: expression.evidence_event_ids.map((eventId) => {
      const row = theme.evidence.find((evidence) => evidence.event_id === eventId)
      return {
        kind: 'news' as const, event_id: eventId, headline: row?.headline || null,
        publisher: row?.source_name || null, url: row?.url || null, published_at: row?.found_at || null,
        source_ref: null, source_file: null,
      }
    }),
    idea_eligible: true,
  }))
  return admitThemeToIdeas({
    narrative_complete: Boolean(theme.narrative?.thesis?.trim() && theme.narrative?.why_now?.trim()),
    support_count: metrics.narrative_support_count,
    coherent: metrics.recurring_narrative_token_count >= 2 && metrics.narrative_coherence_pct >= 60,
    unresolved_challenge: false,
    pending_revalidation: false,
    why_now_event_id: whyNowId,
    why_now_exact: Boolean(whyNowProjection),
    why_now_current: Boolean(whyNowProjection?.found_at && parseRfc3339Ms(whyNowProjection.found_at) >= nowMs - 24 * 60 * 60 * 1000),
    players,
    theme_rev: theme.rev,
    package_rev: theme.rev,
  })
}

const canonicalThemeKey = (themeId: string, rev: number) => `${themeId}@${rev}`

/** The PM index is intentionally a small excerpt. Read the current canonical revision once so an
 * explicit challenge outside that excerpt still blocks admission and older exact member provenance can
 * resolve without a broad feed scan. Index-only fixtures/deploy migration keep the bounded feed fallback. */
function canonicalThemeProof(repoRoot: string): {
  byRevision: Map<string, Theme>
  sourcesByEvent: Map<string, ThemeMember>
} {
  const byRevision = new Map<string, Theme>()
  const sourcesByEvent = new Map<string, ThemeMember>()
  if (!fs.existsSync(themesLedgerPath(repoRoot))) return { byRevision, sourcesByEvent }
  for (const theme of loadThemes(repoRoot)) {
    if (theme.status !== 'live') continue
    byRevision.set(canonicalThemeKey(theme.theme_id, theme.rev), theme)
    for (const member of Array.isArray(theme.members) ? theme.members : []) {
      const prior = sourcesByEvent.get(member.event_id)
      // Keep the oldest provenance when malformed duplicate revisions disagree, so a rewritten member
      // cannot make a structural proof look newer than the exact retained evidence.
      if (!prior || parseRfc3339Ms(member.found_at) < parseRfc3339Ms(prior.found_at)) {
        sourcesByEvent.set(member.event_id, member)
      }
    }
  }
  return { byRevision, sourcesByEvent }
}

/** Canonical Theme narratives retain a bounded audit trail, including resolved historical challenges.
 * Re-run the same family-state rule used by the PM projection so only an ACTIVE challenge vetoes Ideas;
 * a later support restores the family only when its source priority meets or beats the challenge. */
function retainedThemeHasActiveChallenge(theme: Theme): boolean {
  if (!theme.narrative) return false
  const memberById = new Map(theme.members.map((member) => [member.event_id, member]))
  const classified = theme.narrative.evidence.flatMap((evidence) => {
    const member = memberById.get(evidence.event_id)
    return member ? [{ member, stance: evidence.stance }] : []
  })
  return resolveThemeFamilyState(classified, (member) => ideaTierRank(member.tier))
    .some((row) => row.stance === 'challenges')
}

type ThemeIdeaFeedSource = Pick<FeedItem, 'event_id' | 'headline' | 'url' | 'source_name' | 'triage_score'>
  & Partial<Pick<FeedItem,
    'headline_en' | 'found_at' | 'observed_at' | 'source_is_english' | 'region' | 'event_types' | 'issuer_linkage' | 'companies' | 'source_tier'
    | 'scheduled_events' | 'event_direction' | 'dedup_group' | 'rank_factors' | 'event_materiality_label'>>

function memberFeedSource(member: ThemeMember | undefined): ThemeIdeaFeedSource | null {
  if (!member || !member.url?.trim() || !member.source_name?.trim()) return null
  return {
    event_id: member.event_id,
    headline: member.headline,
    headline_en: member.headline_en,
    source_is_english: member.source_is_english,
    url: member.url,
    source_name: member.source_name,
    triage_score: member.score,
    found_at: member.found_at,
    observed_at: member.observed_at,
    region: (member.region || '') as FeedItem['region'],
    event_types: Array.isArray(member.event_types) ? member.event_types : [],
    issuer_linkage: (member.issuer_linkage || '') as FeedItem['issuer_linkage'],
    companies: Array.isArray(member.companies) ? member.companies : [],
    source_tier: member.tier as FeedItem['source_tier'],
    dedup_group: member.dedup_group,
  }
}

function sourceTimeIsFresh(sourceAt: string, freshness?: TopSweepFreshnessOptions): boolean {
  const at = parseRfc3339Ms(sourceAt)
  if (!Number.isFinite(at)) return false
  if (!freshness) return true
  const maxAgeMs = Number.isFinite(freshness.maxAgeMs) && freshness.maxAgeMs > 0 ? freshness.maxAgeMs : 1
  const futureSkewMs = Math.max(0, freshness.futureSkewMs ?? SOURCE_FUTURE_SKEW_MS)
  return at >= freshness.nowMs - maxAgeMs && at <= freshness.nowMs + futureSkewMs
}

function themeIdeaRow(
  item: ThemeIdeaFeedSource,
  sourceThemes: IdeaSourceTheme[],
  themeExpressions: IdeaThemeExpression[],
  themeContexts: IdeaThemeContext[],
  sourceAt: string,
): IdeaInputRow | null {
  if (!EVENT_ID_RE.test(String(item.event_id || '')) || !item.url || !item.headline || !item.source_name) return null
  if (!Number.isFinite(item.triage_score)) return null
  const rawMateriality = Number((item as FeedItem & { materiality_pre_score?: number }).materiality_pre_score)
  return {
    // Every value below is copied from the resolved FeedItem. Theme summary evidence is only a lookup key;
    // it cannot invent a URL, publisher, headline, score, company, or promotion anchor.
    event_id: item.event_id,
    headline: item.headline_en || item.headline,
    headline_orig: item.headline,
    url: item.url,
    source_name: item.source_name,
    region: item.region || '',
    materiality: item.triage_score,
    materiality_pre_score: Number.isFinite(rawMateriality) ? rawMateriality : item.rank_factors?.materiality,
    label: item.event_materiality_label || '',
    event_types: Array.isArray(item.event_types) ? item.event_types : [],
    issuer_linkage: item.issuer_linkage || '',
    companies: Array.isArray(item.companies) ? item.companies : [],
    found_at: sourceAt,
    ...(item.observed_at ? { observed_at: item.observed_at } : {}),
    ...(item.source_is_english === true ? { source_is_english: true as const } : {}),
    source_tier: item.source_tier,
    scheduled_events: Array.isArray(item.scheduled_events) ? item.scheduled_events : [],
    event_direction: item.event_direction,
    dedup_group: typeof item.dedup_group === 'string' && item.dedup_group.trim() ? item.dedup_group.trim() : undefined,
    origin_type: 'theme',
    source_themes: sourceThemes,
    theme_expressions: themeExpressions,
    theme_contexts: themeContexts,
  }
}

/** Resolve each actionable Theme into one complete, exact-revision causal package: a fresh WHY_NOW row
 * plus one distinct EXPRESSION_PROOF row. Missing/legacy fields and conflicting revisions fail closed. */
function readActionableThemeRows(
  repoRoot: string,
  freshness?: TopSweepFreshnessOptions,
  indexNotBeforeMs?: number,
  wireAliasesByEvent?: Map<string, Partial<Pick<FeedItem, 'dedup_group' | 'found_at' | 'observed_at' | 'source_is_english'>>>,
  registerRetainedAlias?: (row: Pick<ThemeMember, 'event_id' | 'dedup_group' | 'url'>) => void,
): IdeaInputRow[] {
  const index = readCurrentThemesIndex(repoRoot, freshness?.nowMs ?? Date.now())
  const indexGeneratedMs = parseRfc3339Ms(index.generated_at)
  const nowMs = freshness?.nowMs ?? Date.now()
  const futureSkewMs = Math.max(0, freshness?.futureSkewMs ?? SOURCE_FUTURE_SKEW_MS)
  if (!Number.isFinite(indexGeneratedMs)
    || indexGeneratedMs <= nowMs - THEMES_INDEX_MAX_AGE_MS
    || indexGeneratedMs > nowMs + futureSkewMs
    // The sweep is written before the themes stage. If this cycle's themes stage was disabled or failed,
    // its retained last-good index predates the sweep and must not annotate the new wire.
    || (Number.isFinite(indexNotBeforeMs) && indexGeneratedMs < Number(indexNotBeforeMs))) return []

  const themes = (index.themes as unknown[]).slice(0, MAX_ACTIONABLE_THEMES)
  const canonical = canonicalThemeProof(repoRoot)
  const ledgerPresent = fs.existsSync(themesLedgerPath(repoRoot))
  const revisionsByTheme = new Map<string, Set<number>>()
  for (const raw of themes) {
    if (!record(raw) || !THEME_ID_RE.test(String(raw.theme_id || ''))
      || !boundedNumber(raw.rev, 1, Number.MAX_SAFE_INTEGER, true)) continue
    const revisions = revisionsByTheme.get(String(raw.theme_id)) || new Set<number>()
    revisions.add(Number(raw.rev))
    revisionsByTheme.set(String(raw.theme_id), revisions)
  }
  const conflictingThemeIds = new Set([...revisionsByTheme]
    .filter(([, revisions]) => revisions.size > 1)
    .map(([themeId]) => themeId))
  interface ThemeEvidenceRequest {
    eventId: string
    evidenceAt: string
    sourceTheme: IdeaSourceTheme
    expressions: IdeaThemeExpression[]
    context: IdeaThemeContext
  }
  const requests: ThemeEvidenceRequest[] = []
  const aliasEvidenceIds = new Set<string>()
  let evidenceRowsSeen = 0
  for (const theme of themes) {
    if (!validThemeRef(theme) || conflictingThemeIds.has(theme.theme_id)) continue
    const retained = canonical.byRevision.get(canonicalThemeKey(theme.theme_id, theme.rev))
    if ((ledgerPresent && !retained)
      || (retained && retainedThemeHasActiveChallenge(retained))) continue
    if (!themeAdmissionForIdeas(theme, retained, nowMs).admitted) continue
    // The two-row prompt package is only a projection of a bounded canonical audit. Register every
    // retained member's identity before veto filtering so an intermediate family/URL bridge cannot be
    // hidden merely because that member is neither the current WHY_NOW nor expression proof.
    for (const member of retained?.members || []) registerRetainedAlias?.(member)
    const whyNowEventId = theme.narrative.why_now_event_id
    const proofIds = new Set(theme.qualified_expressions
      .flatMap((expression) => expression.evidence_event_ids)
      .filter((eventId) => eventId !== whyNowEventId))
    // A Theme seed is never one row wearing two hats. The provider sees and must select the causal update
    // and independently bound issuer proof as two exact source rows from one revision.
    if (!proofIds.size) continue
    for (const evidence of theme.evidence) {
      if (!record(evidence) || evidence.stance !== 'supports') continue
      const aliasEventId = EVENT_ID_RE.test(String(evidence.event_id || '')) ? String(evidence.event_id) : ''
      if (aliasEventId && aliasEvidenceIds.size < MAX_THEME_EVIDENCE_ROWS) aliasEvidenceIds.add(aliasEventId)
      if (evidenceRowsSeen >= MAX_THEME_EVIDENCE_ROWS) break
      const eventId = aliasEventId
      const role = eventId === whyNowEventId ? 'WHY_NOW' : proofIds.has(eventId) ? 'EXPRESSION_PROOF' : null
      if (!eventId || !role) continue
      evidenceRowsSeen++
      const expressions: IdeaThemeExpression[] = role === 'EXPRESSION_PROOF'
        ? theme.qualified_expressions.filter((expression) => expression.evidence_event_ids.includes(eventId)).map((expression) => ({
          theme_id: theme.theme_id,
          theme_rev: theme.rev,
          name: expression.name,
          name_key: expression.name_key,
          ticker: expression.ticker,
          listing_country: expression.listing_country,
          side: expression.side,
          role: expression.role,
          mechanism: expression.mechanism,
          evidence_event_ids: [...expression.evidence_event_ids],
        })) : []
      if (role === 'EXPRESSION_PROOF' && !expressions.length) continue
      requests.push({
        eventId,
        evidenceAt: typeof evidence.found_at === 'string' ? evidence.found_at : '',
        sourceTheme: {
          theme_id: theme.theme_id,
          theme_rev: theme.rev,
          evidence_event_ids: role === 'WHY_NOW' ? [whyNowEventId] : [whyNowEventId, eventId],
          why_now_event_id: whyNowEventId,
        },
        expressions,
        context: {
          theme_id: theme.theme_id,
          theme_rev: theme.rev,
          role,
          thesis: theme.narrative.thesis.trim().slice(0, 320),
          context: theme.description.trim().slice(0, 240),
          why_now_event_id: whyNowEventId,
        },
      })
    }
  }
  if (!requests.length) return []

  const targetIds = new Set(requests.map((request) => request.eventId))
  const lookupIds = new Set([...targetIds, ...aliasEvidenceIds])
  const days = freshness ? MAX_THEME_FEED_LOOKBACK_DAYS : 2
  const unresolvedIds = new Set([...lookupIds].filter((eventId) => !memberFeedSource(canonical.sourcesByEvent.get(eventId))))
  const feed = unresolvedIds.size ? readFeed(repoRoot, days, {
    now: () => new Date(nowMs),
    maxItems: unresolvedIds.size,
    predicate: (item) => unresolvedIds.has(item.event_id),
    applyActiveWeights: false,
    // A sparse evidence lookup cannot recompute the canonical story family from only the target rows.
    // Keep the ingest-time group so theme evidence still joins a wire publisher copy of the same story.
    preservePersistedDedupGroups: true,
  }) : { items: [], cycles: [] }
  const byEvent = new Map(feed.items.map((item) => [item.event_id, item]))
  // Index-only migration can retain an identity bridge outside the final two-row prompt package. Join
  // every bounded supporting evidence identity into the veto component without projecting it as a model
  // row; otherwise a why-now row can escape through B->A merely because bridge B was not selected.
  for (const eventId of aliasEvidenceIds) {
    const source = memberFeedSource(canonical.sourcesByEvent.get(eventId)) || byEvent.get(eventId)
    if (source) registerRetainedAlias?.(source)
  }
  const packages = new Map<string, { whyNow: IdeaInputRow | null; proofs: IdeaInputRow[] }>()
  for (const request of requests) {
    const resolved = memberFeedSource(canonical.sourcesByEvent.get(request.eventId)) || byEvent.get(request.eventId)
    if (!resolved) continue
    // A sparse Theme lookup can choose a newer exact event representation whose optional family alias
    // was dropped. Reattach the alias/clock proof already present in the current sweep before human-veto
    // closure, so the Theme reserve cannot launder a grouped wire event into an ungrouped one.
    const wireAlias = wireAliasesByEvent?.get(request.eventId)
    const item: ThemeIdeaFeedSource = wireAlias ? {
      ...resolved,
      ...(wireAlias.dedup_group ? { dedup_group: wireAlias.dedup_group } : {}),
      ...(wireAlias.found_at ? { found_at: wireAlias.found_at } : {}),
      ...(wireAlias.observed_at ? { observed_at: wireAlias.observed_at } : {}),
      ...(wireAlias.source_is_english === true ? { source_is_english: true as const } : {}),
    } : resolved
    const persistedAt = typeof item.found_at === 'string' && Number.isFinite(parseRfc3339Ms(item.found_at))
      ? item.found_at
      : null
    const sourceAt = persistedAt || request.evidenceAt
    const isWhyNow = request.context.role === 'WHY_NOW'
    const sourceMs = parseRfc3339Ms(sourceAt)
    const withinStructuralLookback = !freshness || (Number.isFinite(sourceMs)
      && sourceMs >= nowMs - MAX_THEME_STRUCTURAL_PROOF_AGE_MS
      && sourceMs <= nowMs + (freshness.futureSkewMs ?? SOURCE_FUTURE_SKEW_MS))
    if (isWhyNow ? !sourceTimeIsFresh(sourceAt, freshness) : !withinStructuralLookback) continue
    const row = themeIdeaRow(item, [request.sourceTheme], request.expressions, [request.context], sourceAt)
    if (!row) continue
    row.observed_by_at = index.generated_at
    const key = canonicalThemeKey(request.context.theme_id, request.context.theme_rev)
    const group = packages.get(key) || { whyNow: null, proofs: [] }
    if (isWhyNow) {
      // Duplicate representations of the exact why-now event fail closed for this package rather than
      // letting publisher ordering decide which source launches the paid run.
      if (group.whyNow && group.whyNow.event_id !== row.event_id) continue
      group.whyNow = row
    } else group.proofs.push(row)
    packages.set(key, group)
  }
  const out: IdeaInputRow[] = []
  for (const group of packages.values()) {
    if (!group.whyNow || !group.proofs.length) continue
    const proof = [...group.proofs].sort((a, b) => (
      (b.theme_expressions?.length || 0) - (a.theme_expressions?.length || 0)
      || b.materiality - a.materiality
      || a.event_id.localeCompare(b.event_id)
    ))[0]
    if (proof.event_id === group.whyNow.event_id) continue
    out.push(group.whyNow, proof)
  }
  return out
}

/**
 * Read every trustworthy curated sweep that overlaps the source-freshness window into skim input rows,
 * sorted by materiality and normally capped at `topN`. `allEligible` lets the Ideas orchestrator read the
 * complete current projection and apply the same `topN` as a provider-call chunk size instead. Daily files are storage partitions, not freshness
 * boundaries: a 23:59 story must remain eligible after midnight until its source timestamp ages out.
 * Drops consumed/dismissed rows, duplicate story families, and the low tail. Never throws — a missing
 * sweep yields []. Callers without a freshness contract keep the legacy newest-file-only read.
 */
export function readTopSweep(
  repoRoot: string,
  topN: number,
  freshness?: TopSweepFreshnessOptions,
): TopSweepRead {
  const inboxDir = path.join(repoRoot, 'screener', 'inbox')
  let sweepFiles: string[] = []
  try {
    sweepFiles = fs.readdirSync(inboxDir).filter((f) => f.endsWith('_sweep.json')).sort().reverse()
  } catch { return { rows: [], status: 'missing', sweep_updated_at: null, candidate_count: 0, stale_row_count: 0, invalid_time_count: 0 } }
  if (!sweepFiles.length) return { rows: [], status: 'missing', sweep_updated_at: null, candidate_count: 0, stale_row_count: 0, invalid_time_count: 0 }

  const partitionDayStartMs = (name: string): number => {
    const day = name.match(/^(\d{4}-\d{2}-\d{2})_sweep\.json$/)?.[1]
    return day ? Date.parse(`${day}T00:00:00Z`) : NaN
  }
  interface SweepPartition {
    name: string
    rows: any[]
    updatedAt: string | null
    updatedMs: number
    dayStartMs: number
  }
  const partitionCache = new Map<string, SweepPartition | null>()
  const readPartition = (name: string): SweepPartition | null => {
    if (partitionCache.has(name)) return partitionCache.get(name) ?? null
    let partition: SweepPartition | null = null
    try {
      const doc = JSON.parse(fs.readFileSync(path.join(inboxDir, name), 'utf8'))
      if (Array.isArray(doc?.rows)) {
        const updatedAt = typeof doc.updated_at === 'string' ? doc.updated_at : null
        partition = { name, rows: doc.rows, updatedAt, updatedMs: parseRfc3339Ms(updatedAt), dayStartMs: partitionDayStartMs(name) }
      }
    } catch {}
    partitionCache.set(name, partition)
    return partition
  }
  const partitionDayOverlaps = (name: string, floorMs: number, ceilingMs: number): boolean => {
    const start = partitionDayStartMs(name)
    return Number.isFinite(start) && start <= ceilingMs && start + 86_400_000 > floorMs
  }
  const partitionDayImmediatelyPrecedes = (name: string, floorMs: number): boolean => {
    if (!Number.isFinite(floorMs)) return false
    const start = partitionDayStartMs(name)
    const floorDayStart = Math.floor(floorMs / 86_400_000) * 86_400_000
    return Number.isFinite(start) && start + 86_400_000 === floorDayStart
  }

  // Preserve the existing fail-closed boundary for the newest partition. An older file cannot stand in
  // for current state when the newest write is unreadable: it may contain a consume/dismiss action that
  // would otherwise be silently reversed.
  const newest = readPartition(sweepFiles[0])
  if (!newest) {
    return { rows: [], status: 'corrupt', sweep_updated_at: null, candidate_count: 0, stale_row_count: 0, invalid_time_count: 0 }
  }
  let staleRowCount = 0
  let invalidTimeCount = 0
  let status: TopSweepStatus = 'ok'
  const invalidPartitionNames = new Set<string>()
  const noteInvalidPartition = (name: string, blocksCandidateSet = true): void => {
    if (!invalidPartitionNames.has(name)) {
      invalidPartitionNames.add(name)
      invalidTimeCount++
    }
    if (blocksCandidateSet) status = 'degraded'
  }
  let partitions: SweepPartition[] = [newest]
  let sweepUpdatedAt = newest.updatedAt
  let sweepMs = newest.updatedMs
  if (freshness) {
    const futureSkewMs = Math.max(0, freshness.futureSkewMs ?? 5 * 60_000)
    const maxAgeMs = Number.isFinite(freshness.maxAgeMs) && freshness.maxAgeMs > 0 ? freshness.maxAgeMs : 1
    const floor = freshness.nowMs - maxAgeMs
    const ceiling = freshness.nowMs + futureSkewMs
    if (!Number.isFinite(newest.updatedMs)) {
      return {
        rows: [], status: 'corrupt', sweep_updated_at: newest.updatedAt,
        candidate_count: 0, stale_row_count: 0, invalid_time_count: 1,
      }
    }
    if (newest.updatedMs < floor || newest.updatedMs > ceiling) {
      return {
        rows: [], status: 'stale', sweep_updated_at: newest.updatedAt,
        candidate_count: 0, stale_row_count: 0, invalid_time_count: 0,
      }
    }

    partitions = []
    sweepUpdatedAt = null
    sweepMs = Number.NEGATIVE_INFINITY
    // One partition per day; the extra two cover both date/clock boundaries around a partial-day
    // freshness window. Never synchronously re-read an unbounded archive on the live Ideas route.
    const candidateSweepLookback = Math.max(1, Math.ceil(maxAgeMs / 86_400_000) + 2)
    const candidateFiles = [sweepFiles[0], ...sweepFiles.slice(1).filter((name) => partitionDayOverlaps(name, floor, ceiling))]
      .slice(0, candidateSweepLookback)
    for (let index = 0; index < candidateFiles.length; index++) {
      const partitionName = candidateFiles[index]
      const partition = index === 0 ? newest : readPartition(partitionName)
      // Historical malformed partitions cannot contribute candidates or human state. The newest
      // partition was checked above; skipping an older unreadable file avoids letting archival debris
      // poison a healthy current wire.
      if (!partition) { noteInvalidPartition(partitionName); continue }
      if (!Number.isFinite(partition.updatedMs)) {
        // A readable archival partition containing only already-consumed/dismissed rows cannot have
        // contributed a positive candidate. Keep its negative aliases for the human-state pass and
        // disclose the bad wrapper clock locally, but do not pause unrelated current evidence. If even
        // one live candidate row is present, the missing partition clock still degrades the full sweep.
        const hasPositiveCandidate = partition.rows.some((row) => row && row.url
          && !row.consumed && !row.dismissed && !row.launched_signal_id
          && typeof row.triage_score === 'number')
        noteInvalidPartition(partitionName, hasPositiveCandidate)
        continue
      }
      if (partition.updatedMs < floor || partition.updatedMs > ceiling) continue
      partitions.push(partition)
      if (partition.updatedMs > sweepMs) {
        sweepMs = partition.updatedMs
        sweepUpdatedAt = partition.updatedAt
      }
    }
  }

  interface HumanVetoRecord {
    keys: Set<string>
    exactEventIds: Set<string>
    canProveDistinct: boolean
    sourceStates: Map<string, HumanVetoStoryState>
    sourceIssuer: { tickers: Set<string>; names: Set<string> }
    vetoMs: number
    headline: string
    headlineEn: string
  }
  const issuerIdentity = (companies: IdeaInputRow['companies'] | unknown): { tickers: Set<string>; names: Set<string> } => {
    const tickers = new Set<string>()
    const names = new Set<string>()
    if (!Array.isArray(companies)) return { tickers, names }
    for (const company of companies) {
      if (!company || typeof company !== 'object') continue
      const ticker = cleanTicker((company as { ticker?: unknown }).ticker)
      if (ticker) tickers.add(normTicker(ticker))
      const name = coreCompanyName((company as { name?: unknown }).name)
      if (name) names.add(name)
    }
    return { tickers, names }
  }
  const namedIssuerTokens = (headline: string): Set<string> => {
    // This is only a conflict detector for the guarded exception, never positive issuer extraction.
    // Require a capitalized multi-token proper name and drop obvious sentence/authority phrases. When
    // structured companies are absent, distinct explicit subjects therefore close the exception while a
    // headline with no safely comparable subject remains governed by the stronger family/object checks.
    const out = new Set<string>()
    const stop = new Set(['regulator', 'company', 'issuer', 'board', 'approval', 'permit', 'license', 'licence', 'meeting', 'event'])
    const candidates = [
      ...headline.matchAll(/\bfor\s+([A-Z][A-Za-z0-9&.'’-]*(?:\s+[A-Z][A-Za-z0-9&.'’-]+){0,3})\b/g),
      ...headline.matchAll(/^([A-Z][A-Za-z0-9&.'’-]*(?:\s+[A-Z][A-Za-z0-9&.'’-]+){0,3})\s+(?:says?|said|confirms?|confirmed|restor(?:e|es|ed|ing)|reinstat(?:e|es|ed|ing)|receiv(?:e|es|ed|ing)|obtain(?:s|ed|ing)?|secure(?:s|d|ing)?|wins?|won)\b/g),
    ]
    for (const match of candidates) {
      const name = coreCompanyName(match[1])
      if (name && !name.split(/\s+/).some((token) => stop.has(token))) out.add(name)
    }
    return out
  }
  const issuerIdentityConflicts = (
    source: HumanVetoRecord['sourceIssuer'],
    candidate: ReturnType<typeof issuerIdentity>,
    sourceHeadline: string,
    candidateHeadline: string,
  ): boolean => {
    const sourceHasIdentity = source.tickers.size > 0 || source.names.size > 0
    const candidateHasIdentity = candidate.tickers.size > 0 || candidate.names.size > 0
    if (!sourceHasIdentity || !candidateHasIdentity) {
      const sourceNames = namedIssuerTokens(sourceHeadline)
      const candidateNames = namedIssuerTokens(candidateHeadline)
      return sourceNames.size > 0 && candidateNames.size > 0
        && ![...sourceNames].some((name) => candidateNames.has(name))
    }
    // Exact tickers are authoritative when both sides carry them. Otherwise require an exact
    // identity-preserving issuer name. A status change for Beta must never undo a veto for Alpha merely
    // because an upstream dedup family was broad or corrupt.
    if (source.tickers.size && candidate.tickers.size) {
      return ![...source.tickers].some((ticker) => candidate.tickers.has(ticker))
    }
    return ![...source.names].some((name) => candidate.names.has(name))
  }
  const humanVetoesByKey = new Map<string, HumanVetoRecord[]>()
  const aliasParent = new Map<string, string>()
  const aliasFind = (key: string): string => {
    const parent = aliasParent.get(key)
    if (!parent) { aliasParent.set(key, key); return key }
    if (parent === key) return key
    const root = aliasFind(parent)
    aliasParent.set(key, root)
    return root
  }
  const connectAliases = (keys: Iterable<string>): void => {
    const values = [...new Set(keys)].filter(Boolean)
    if (!values.length) return
    let root = aliasFind(values[0])
    for (const key of values.slice(1)) {
      const other = aliasFind(key)
      if (other === root) continue
      const keep = root < other ? root : other
      const drop = keep === root ? other : root
      aliasParent.set(drop, keep)
      root = keep
    }
  }
  const humanPartitions: Array<{ name: string; partition: SweepPartition }> = []
  let humanStateUnavailable = false
  const humanFloor = freshness ? freshness.nowMs - Math.max(1, freshness.maxAgeMs) : Number.NEGATIVE_INFINITY
  const humanCeiling = freshness ? freshness.nowMs + Math.max(0, freshness.futureSkewMs ?? 5 * 60_000) : Number.POSITIVE_INFINITY
  // Human actions do not expire with the candidate window. Sweep files are already capped at a small
  // row count; scan their negative state independently so a five-day-old dismissal cannot resurrect.
  // A future compact action ledger can replace this compatibility scan without changing semantics.
  const humanFiles = sweepFiles
  for (const [index, name] of humanFiles.entries()) {
    const partition = index === 0 ? newest : readPartition(name)
    if (!partition) {
      // This bounded file may contain the only consume/dismiss veto for a current publisher copy. An
      // unreadable file therefore makes human state unknown even when its date is just outside the
      // positive-candidate window. Never call that fail-closed while continuing to rank candidates: that
      // would resurrect exactly the action this extra partition read exists to preserve.
      if (freshness && (partitionDayOverlaps(name, humanFloor, humanCeiling)
        || partitionDayImmediatelyPrecedes(name, humanFloor))) {
        humanStateUnavailable = true
        noteInvalidPartition(name)
      }
      continue
    }
    if (freshness && !Number.isFinite(partition.updatedMs)) {
      // The partition cannot contribute positive candidates, but its readable negative rows still carry
      // their own action clocks. Keep those vetoes and disclose the bad clock, but do not label the whole
      // candidate set incomplete: affected legacy vetoes fail closed locally, while unrelated current
      // evidence remains safe to analyze.
      noteInvalidPartition(name, false)
    }
    humanPartitions.push({ name, partition })
  }
  const durableActions = readInboxHumanActions(repoRoot)
  if (!durableActions.complete) {
    // The append-only ledger is the only corruption-independent witness for actions created after this
    // schema shipped. A malformed line means a veto may be missing; fail the surface closed.
    humanStateUnavailable = true
    status = 'degraded'
    invalidTimeCount++
  } else if (durableActions.rows.length) {
    const actionRows = durableActions.rows.map((record) => ({
      inbox_id: record.inbox_id,
      event_id: record.event_id,
      headline: record.headline,
      headline_en: record.headline_en,
      source_is_english: record.source_is_english,
      url: record.url,
      found_at: record.found_at,
      observed_at: record.observed_at,
      dedup_group: record.dedup_group,
      companies: record.companies,
      consumed: record.action === 'consumed',
      consumed_at: record.action === 'consumed' ? record.action_at : undefined,
      dismissed: record.action === 'dismissed',
      dismissed_at: record.action === 'dismissed' ? record.action_at : undefined,
    }))
    const newestActionMs = Math.max(...durableActions.rows.map((row) => parseRfc3339Ms(row.action_at)))
    humanPartitions.push({
      name: 'inbox-human-actions.ndjson',
      partition: {
        name: 'inbox-human-actions.ndjson', rows: actionRows,
        updatedAt: Number.isFinite(newestActionMs) ? new Date(newestActionMs).toISOString() : null,
        updatedMs: newestActionMs, dayStartMs: NaN,
      },
    })
  }
  // Human state is durable across midnight and deliberately does not inherit candidate freshness. A
  // stale/invalid partition cannot add a positive candidate, but a readable negative decision still
  // vetoes re-entry. This keeps a current publisher copy from reversing a recent human action.
  for (const { name, partition } of humanPartitions) {
    for (const row of partition.rows) {
      if (!row) continue
      const persistedEventId = typeof row.event_id === 'string' && EVENT_ID_RE.test(row.event_id) ? row.event_id : ''
      const derivedEventId = typeof row.headline === 'string' && row.headline && typeof row.url === 'string' && row.url
        ? eventIdFor(row.headline, row.url) : ''
      const exactEventIds = new Set([persistedEventId, derivedEventId].filter(Boolean))
      // In-place publisher rewrites can retain a persisted event id while the visible headline+URL now
      // derives a second identity. Both are authoritative negative aliases: choosing one would leave a
      // gap through which the other namespace could resurrect the human-vetoed observation.
      const vetoKeys = [...new Set([
        ...ideaHumanVetoKeys({
        dedup_group: typeof row.dedup_group === 'string' && row.dedup_group.trim() ? row.dedup_group.trim() : undefined,
        url: row.url,
        }),
        ...[...exactEventIds].flatMap((event_id) => ideaHumanVetoKeys({ event_id })),
      ])]
      // Human identity is a connected component, not a one-hop lookup. Historical ordinary rows can be
      // the only durable bridge between an old action and a current second-hop publisher copy, so fold
      // every readable row into the alias graph without making stale rows positive candidates.
      if (vetoKeys.length) connectAliases(vetoKeys)
      if (!row.consumed && !row.dismissed && !row.launched_signal_id) continue
      if (!vetoKeys.length) {
        // A readable JSON file can still contain a torn/legacy human-action row. Silently skipping an
        // unidentified dismissal is the same resurrection bug as skipping a corrupt partition: we no
        // longer know which current publisher copy the person vetoed. Non-human malformed rows remain
        // harmless and are ignored above; only an unknowable consume/dismiss pauses the surface.
        humanStateUnavailable = true
        status = 'degraded'
        invalidTimeCount++
        continue
      }
      // Current rows carry a durable clock for each human action. A row with both flags uses the later
      // action. Legacy or malformed action clocks stay NaN, so a status rewrite cannot claim to be newer
      // than an action whose time the engine cannot prove.
      const actionClocks: number[] = []
      let missingActionClock = false
      const sourceMs = typeof row.found_at === 'string' ? parseRfc3339Ms(row.found_at) : NaN
      const allowedSkewMs = freshness ? Math.max(0, freshness.futureSkewMs ?? 5 * 60_000) : 5 * 60_000
      const observedRaw = typeof row.observed_at === 'string' ? row.observed_at : null
      const observedMs = observedRaw ? parseRfc3339Ms(observedRaw) : NaN
      const observedValid = !observedRaw || (
        Number.isFinite(observedMs)
        && Number.isFinite(sourceMs)
        && observedMs + allowedSkewMs >= sourceMs
        && (!Number.isFinite(partition.dayStartMs) || observedMs + allowedSkewMs >= partition.dayStartMs)
        // Both are local persistence clocks written in one process. Adapter/source skew does not apply:
        // a partition cannot have observed a revision after the partition itself was written.
        && (!Number.isFinite(partition.updatedMs) || observedMs <= partition.updatedMs)
        && observedMs <= humanCeiling
      )
      if (!observedValid) noteInvalidPartition(name, false)
      // `observed_at` is immutable across exact refreshes. Legacy rows fall back to their source clock;
      // an invalid persisted observation clock is never silently replaced by a more favorable one.
      const stableObservationMs = observedRaw ? (observedValid ? observedMs : NaN) : sourceMs
      const readActionClock = (raw: unknown): number => {
        const value = typeof raw === 'string' ? parseRfc3339Ms(raw) : NaN
        const valid = Number.isFinite(value)
          && Number.isFinite(sourceMs)
          && Number.isFinite(stableObservationMs)
          && value + allowedSkewMs >= stableObservationMs
          && value + allowedSkewMs >= sourceMs
          // An action recorded in a dated partition cannot predate that storage day by years even when
          // a corrupt legacy row carries internally consistent source/action timestamps.
          && (!Number.isFinite(partition.dayStartMs) || value + allowedSkewMs >= partition.dayStartMs)
          && (!Number.isFinite(partition.updatedMs) || value <= partition.updatedMs)
          && value <= humanCeiling
        if (!valid && typeof raw === 'string') noteInvalidPartition(name, false)
        return valid ? value : NaN
      }
      if (row.dismissed) {
        const value = readActionClock(row.dismissed_at)
        if (Number.isFinite(value)) actionClocks.push(value)
        else missingActionClock = true
      }
      if (row.consumed) {
        const value = readActionClock(row.consumed_at)
        if (Number.isFinite(value)) actionClocks.push(value)
        else missingActionClock = true
      }
      const veto: HumanVetoRecord = {
        keys: new Set(vetoKeys),
        exactEventIds,
        // A family-only legacy record can still block that family, but cannot prove a later status row is
        // a distinct observation. Keep the exception closed unless an event id or source text anchors it.
        // A model translation or bare event id can strengthen exact blocking, but neither proves the
        // prior source state. The transition exception requires the original source headline itself.
        canProveDistinct: Boolean(
          typeof row.headline === 'string'
          && row.headline.trim()
          && !hasNonLatinScript(row.headline)
          && row.source_is_english === true
          && !(typeof row.headline_en === 'string' && row.headline_en.trim()),
        ),
        sourceStates: humanVetoStoryStates({ headline: typeof row.headline === 'string' ? row.headline : '' }),
        sourceIssuer: issuerIdentity(row.companies),
        // A candidate must post-date both the observation and the human action. This matters when the
        // adapter clock is a few minutes ahead of the action clock but still inside allowed skew.
        vetoMs: missingActionClock || !actionClocks.length || !Number.isFinite(stableObservationMs)
          ? NaN
          : Math.max(sourceMs, stableObservationMs, ...actionClocks),
        headline: typeof row.headline === 'string' ? row.headline : '',
        headlineEn: typeof row.headline_en === 'string' ? row.headline_en : '',
      }
      for (const key of veto.keys) {
        const records = humanVetoesByKey.get(key) || []
        records.push(veto)
        humanVetoesByKey.set(key, records)
      }
    }
  }

  const candidates = partitions
    .flatMap((partition) => partition.rows
      .filter((row) => row && row.url && !row.consumed && !row.dismissed && !row.launched_signal_id && typeof row.triage_score === 'number')
      .map((row) => ({ row, partition })))
    .sort((a, b) => (b.row.triage_score ?? -1) - (a.row.triage_score ?? -1))
  let eligible = candidates
  if (freshness) {
    const futureSkewMs = Math.max(0, freshness.futureSkewMs ?? 5 * 60_000)
    const maxAgeMs = Number.isFinite(freshness.maxAgeMs) && freshness.maxAgeMs > 0 ? freshness.maxAgeMs : 1
    const floor = freshness.nowMs - maxAgeMs
    const ceiling = freshness.nowMs + futureSkewMs
    eligible = candidates.filter(({ row }) => {
      const foundMs = typeof row.found_at === 'string' ? parseRfc3339Ms(row.found_at) : NaN
      if (!Number.isFinite(foundMs)) { invalidTimeCount++; return false }
      if (foundMs < floor || foundMs > ceiling) { staleRowCount++; return false }
      return true
    })
    if (!eligible.length && candidates.length && (staleRowCount || invalidTimeCount)) status = 'stale'
  }
  const revisionClockByRow = new WeakMap<IdeaInputRow, number>()
  const wireRows = eligible
    .map(({ row: r, partition }): IdeaInputRow => {
      const ideaRow: IdeaInputRow = {
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
        found_at: r.found_at || partition.updatedAt || '',
        observed_at: typeof r.observed_at === 'string' ? r.observed_at : undefined,
        source_is_english: r.source_is_english === true ? true : undefined,
        source_tier: r.source_tier,
        scheduled_events: Array.isArray(r.scheduled_events) ? r.scheduled_events : [],
        event_direction: r.event_direction,
        dedup_group: typeof r.dedup_group === 'string' && r.dedup_group.trim() ? r.dedup_group.trim() : undefined,
        origin_type: 'wire',
        source_themes: [],
        theme_expressions: [],
      }
      const sourceMs = parseRfc3339Ms(ideaRow.found_at)
      const observedRaw = ideaRow.observed_at
      const allowedSkewMs = freshness ? Math.max(0, freshness.futureSkewMs ?? 5 * 60_000) : 5 * 60_000
      if (!observedRaw) {
        // A provider timestamp cannot order two revisions against a local consume/dismiss action. Only
        // the immutable first-seen clock written when a distinct revision lands may open the exception;
        // legacy rows remain visible when unvetoed but fail closed for a matching human alias.
        revisionClockByRow.set(ideaRow, NaN)
      } else {
        const observedMs = parseRfc3339Ms(observedRaw)
        const valid = Number.isFinite(observedMs)
          && Number.isFinite(sourceMs)
          && observedMs + allowedSkewMs >= sourceMs
          && (!Number.isFinite(partition.dayStartMs) || observedMs + allowedSkewMs >= partition.dayStartMs)
          && (!Number.isFinite(partition.updatedMs) || observedMs <= partition.updatedMs)
          && observedMs <= humanCeiling
        if (!valid) noteInvalidPartition(partition.name, false)
        revisionClockByRow.set(ideaRow, valid ? observedMs : NaN)
      }
      return ideaRow
    })
  // With W wire rows, no more than floor(W/2) Theme rows can fit while Themes remain <= one-third of
  // the final projection. This finite, data-derived bound returns every eligible wire family without a
  // MAX_SAFE_INTEGER sentinel leaking into slice/ratio arithmetic.
  const cap = freshness?.allEligible
    ? Math.max(1, wireRows.length + Math.floor(wireRows.length / 2))
    : Math.max(1, Math.floor(topN))
  const sameVetoObservation = (row: IdeaInputRow, veto: HumanVetoRecord): boolean => {
    const forcedFamily = '__human_veto_observation__'
    const exactText = (left: string, right: string): boolean => Boolean(left && right && sameThemeStoryObservation(
      { dedup_group: forcedFamily, event_id: '__candidate__', headline: left },
      { dedup_group: forcedFamily, event_id: '__veto__', headline: right },
    ))
    const candidateTexts = [...new Set([row.headline_orig, row.headline].filter(Boolean))]
    const vetoTexts = [...new Set([veto.headline, veto.headlineEn].filter(Boolean))]
    return candidateTexts.some((candidate) => vetoTexts.some((prior) => exactText(candidate, prior)))
  }
  const revisionClockForRow = (row: IdeaInputRow): number => {
    const mapped = revisionClockByRow.get(row)
    if (mapped !== undefined) return mapped
    const sourceMs = parseRfc3339Ms(row.found_at)
    // Theme/legacy rows have no daily-partition wrapper at this boundary. Without a persisted first-seen
    // clock they cannot prove that a state revision post-dated the human action.
    if (!row.observed_at) return NaN
    const observedMs = parseRfc3339Ms(row.observed_at)
    const observedByMs = parseRfc3339Ms(row.observed_by_at)
    const allowedSkewMs = freshness ? Math.max(0, freshness.futureSkewMs ?? 5 * 60_000) : 5 * 60_000
    // Theme reserve rows have no daily inbox wrapper here, but their persisted member carries the same
    // immutable source/first-seen pair. Validate that pair and the request ceiling; any malformed clock
    // stays unable to overturn a human veto.
    return Number.isFinite(observedMs)
      && Number.isFinite(sourceMs)
      && observedMs + allowedSkewMs >= sourceMs
      && Number.isFinite(observedByMs)
      // Theme first-seen and index-generation clocks are both local. The index cannot prove an
      // observation that claims to occur after it was generated.
      && observedMs <= observedByMs
      && observedByMs <= humanCeiling
      && observedMs <= humanCeiling
      ? observedMs
      : NaN
  }
  const vetoAliasesByEvent = new Map<string, Set<string>>()
  const addVetoAliases = (row: IdeaInputRow): void => {
    if (!row.event_id) return
    const aliases = vetoAliasesByEvent.get(row.event_id) || new Set<string>()
    for (const key of ideaHumanVetoKeys(row)) aliases.add(key)
    vetoAliasesByEvent.set(row.event_id, aliases)
    connectAliases(aliases)
  }
  // Union every persisted representation before filtering. Otherwise a grouped copy could be vetoed
  // while the same event from an overlapping partition or legacy Theme (with its family omitted) slipped
  // through under the weaker alias set.
  for (const row of wireRows) addVetoAliases(row)

  let humanVetoesByRoot = new Map<string, HumanVetoRecord[]>()
  const reindexHumanVetoes = (): void => {
    humanVetoesByRoot = new Map()
    const records = new Set([...humanVetoesByKey.values()].flat())
    for (const veto of records) {
      const roots = new Set([...veto.keys].map(aliasFind))
      for (const root of roots) {
        const group = humanVetoesByRoot.get(root) || []
        group.push(veto)
        humanVetoesByRoot.set(root, group)
      }
    }
  }
  const blockedByHumanVeto = (row: IdeaInputRow): boolean => {
    const matches = new Set<HumanVetoRecord>()
    const candidateKeys = new Set([
      ...ideaHumanVetoKeys(row),
      ...(vetoAliasesByEvent.get(row.event_id) || []),
    ])
    for (const key of candidateKeys) {
      for (const veto of humanVetoesByRoot.get(aliasFind(key)) || []) matches.add(veto)
    }
    if (!matches.size) return false
    // A model-authored translation may improve display, but it cannot overturn a human decision. The
    // status exception is proven only from the source headline; unknown source-language grammar stays
    // fail-closed until a deterministic native-language parser exists.
    const sourceHeadline = row.headline_orig || ''
    const states = humanVetoStoryStates({ headline: sourceHeadline })
    const candidateIssuer = issuerIdentity(row.companies)
    const sourceProvenEnglish = Boolean(
      sourceHeadline.trim()
      && row.source_is_english === true
      && !hasNonLatinScript(sourceHeadline)
      && row.headline === sourceHeadline,
    )
    const rowMs = revisionClockForRow(row)
    // Exact observations remain vetoed. A broad family/URL veto may admit only a distinct, source-later
    // adverse or restorative update. Ambiguous `other` rewrites and bad/equal clocks fail closed, and a
    // candidate must clear every matching human action rather than slipping past an older alias.
    return [...matches].some((veto) => (
      veto.exactEventIds.has(row.event_id)
      || !veto.canProveDistinct
      || !sourceProvenEnglish
      || issuerIdentityConflicts(veto.sourceIssuer, candidateIssuer, veto.headline, sourceHeadline)
      || sameVetoObservation(row, veto)
      // The source bytes on both sides must prove one of the deliberately small status transitions.
      // Unknown grammar, generic "Correction:", unrelated denial/resumption, and same-state paraphrases
      // remain vetoed. This chooses omission over letting finite status vocabulary undo a human action.
      || ![...veto.sourceStates].some(([object, priorState]) => {
        const state = states.get(object)
        return (priorState === 'positive' && state === 'adverse')
          || (priorState === 'adverse' && state === 'restorative')
          || (priorState === 'restorative' && state === 'adverse')
      })
      || !Number.isFinite(rowMs)
      || !Number.isFinite(veto.vetoMs)
      || rowMs <= veto.vetoMs
    ))
  }
  // Human state applies to the ordinary wire as well as the Theme reserve. A current unconsumed
  // publisher copy cannot resurrect a prior-day consumed/dismissed canonical event or story alias. A
  // genuinely later correction/retraction is new evidence, however, and must be allowed to challenge the
  // thesis; the guarded helper above distinguishes that update from an ordinary publisher rewrite.
  // For any prompt larger than one row, no single story family may consume every slot. A separate filing
  // or event must remain eligible even when one story emits many correction/status observations.
  const maxWireObservationsPerFamily = cap > 1
    ? Math.min(MAX_IDEA_OBSERVATIONS_PER_STORY_FAMILY, cap - 1)
    : 1
  const reserveCap = Math.floor(cap / 3)
  // Themes may widen a healthy wire input; they may never manufacture one. In particular, a cached theme
  // must not turn a stale/corrupt sweep or the provider's fewer-than-two-row refusal into a paid call.
  // Read the bounded Theme reserve before either projection is veto-filtered so exact-event aliases can
  // be unioned symmetrically. A grouped Theme copy must block an otherwise ungrouped wire copy just as a
  // grouped wire copy blocks a weaker legacy Theme representation.
  const rawThemeRows = freshness?.themesEnabled !== false && status === 'ok' && wireRows.length >= 2 && reserveCap > 0
    ? readActionableThemeRows(repoRoot, freshness, sweepMs, new Map(wireRows.map((row) => [row.event_id, {
      dedup_group: row.dedup_group,
      found_at: row.found_at,
      observed_at: row.observed_at,
      source_is_english: row.source_is_english,
    }])), (member) => connectAliases(ideaHumanVetoKeys(member)))
    : []
  for (const row of rawThemeRows) addVetoAliases(row)
  reindexHumanVetoes()
  const ordinaryWireRows = selectIdeaRows(wireRows.filter((row) => !blockedByHumanVeto(row)), cap, maxWireObservationsPerFamily)
  const themeRows = ordinaryWireRows.length >= 2
    ? rawThemeRows.filter((row) => !blockedByHumanVeto(row))
    : []

  // Admission is checked against the ACTUAL final row count, not only `topN`: a sparse two-row wire plus
  // two theme rows would otherwise be half theme even though floor(topN/3) looked safe. The final
  // projector applies the same family/source caps AFTER package insertion; this is the boundary that used
  // to let two Theme rows crowd an independent filing or replace a better source copy.
  let reserved: IdeaInputRow[] = []
  const themePackages = new Map<string, IdeaInputRow[]>()
  for (const row of themeRows) {
    const context = row.theme_contexts?.length === 1 ? row.theme_contexts[0] : null
    if (!context) continue
    const key = canonicalThemeKey(context.theme_id, context.theme_rev)
    const group = themePackages.get(key) || []
    group.push(row)
    themePackages.set(key, group)
  }
  for (const group of themePackages.values()) {
    if (reserved.length >= reserveCap) break
    const whyRows = group.filter((row) => row.theme_contexts?.[0]?.role === 'WHY_NOW')
    const proofRows = group.filter((row) => row.theme_contexts?.[0]?.role === 'EXPRESSION_PROOF')
    if (whyRows.length !== 1 || proofRows.length !== 1 || whyRows[0].event_id === proofRows[0].event_id) continue
    const candidates = [whyRows[0], proofRows[0]]
    const tentative = coalesceThemeRows([...reserved, ...candidates], ordinaryWireRows)
    if (tentative.length > reserveCap) continue
    const tentativeRows = projectIdeaRowsWithThemes(ordinaryWireRows, tentative, cap)
    const themeRowsInProjection = tentativeRows.filter((row) => row.origin_type === 'theme' || row.origin_type === 'mixed')
    const completePackage = candidates.every((candidate) => tentativeRows.some((row) => (
      row.event_id === candidate.event_id
      && row.theme_contexts?.some((context) => candidate.theme_contexts?.some((expected) => (
        context.theme_id === expected.theme_id && context.theme_rev === expected.theme_rev && context.role === expected.role
      )))
    )))
    if (completePackage && themeRowsInProjection.length <= Math.floor(tentativeRows.length / 3)) reserved = tentative
  }
  const projected = projectIdeaRowsWithThemes(ordinaryWireRows, reserved, cap)
  return {
    // Status-aware production callers already pause a degraded sweep. Emptying the projection as well
    // protects row-only/legacy callers from spending on a lead whose human veto history is unknowable.
    rows: humanStateUnavailable ? [] : projected,
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

/** A change key over the exact model-visible prompt. Persistence-only theme revision/origin metadata must
 * not re-spend a provider call when every byte presented to the model is unchanged. */
export function topNHash(rows: IdeaInputRow[], systemPrompt = IDEA_SYSTEM): string {
  return createHash('sha256')
    .update(systemPrompt)
    .update('\0')
    .update(buildIdeaUserMessage(rows))
    .digest('hex')
    .slice(0, 16)
}

/** Separate non-prompt effect key. A Theme revision, proof edge, source timestamp, or raw scoring input
 * can change persistence without changing model-visible prose; treating that as a cache hit would leave
 * a snapshot claiming provenance the current selection no longer has. */
export function topNEffectHash(rows: IdeaInputRow[]): string {
  const canonical = rows.map((row) => ({
    event_id: row.event_id,
    headline_orig: row.headline_orig,
    url: row.url,
    found_at: row.found_at,
    materiality: row.materiality,
    materiality_pre_score: row.materiality_pre_score ?? null,
    source_tier: row.source_tier ?? null,
    scheduled_events: [...(row.scheduled_events || [])].sort(),
    event_direction: row.event_direction ?? null,
    dedup_group: row.dedup_group || null,
    origin_type: row.origin_type || 'wire',
    source_themes: [...(row.source_themes || [])]
      .map((theme) => ({
        theme_id: theme.theme_id,
        theme_rev: theme.theme_rev,
        evidence_event_ids: [...(theme.evidence_event_ids || [])].sort(),
        why_now_event_id: theme.why_now_event_id || null,
      }))
      .sort((a, b) => a.theme_id.localeCompare(b.theme_id)),
    theme_expressions: [...(row.theme_expressions || [])]
      .map((expression) => ({
        theme_id: expression.theme_id,
        theme_rev: expression.theme_rev,
        name: expression.name,
        name_key: expression.name_key,
        ticker: expression.ticker,
        listing_country: expression.listing_country,
        side: expression.side,
        evidence_event_ids: [...expression.evidence_event_ids].sort(),
      }))
      .sort((a, b) => `${a.theme_id}|${a.ticker}|${a.side}`.localeCompare(`${b.theme_id}|${b.ticker}|${b.side}`)),
    theme_contexts: [...(row.theme_contexts || [])]
      .map((context) => ({ ...context }))
      .sort((a, b) => `${a.theme_id}|${a.theme_rev}|${a.role}`.localeCompare(`${b.theme_id}|${b.theme_rev}|${b.role}`)),
  }))
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex').slice(0, 16)
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
      if (isSurfacedIdeaSnapshot(o, expectedIdeaId)) {
        // A withdrawn occurrence becomes non-current as soon as its durable tombstone lands. This keeps
        // an unlink/fsync fault from leaving that exact Theme version visible or promotable.
        if (!ideaArchiveOccurrenceBlocksLive(repoRoot, o)) out.push(o)
      }
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

export function isArchivedIdeaSnapshot(value: unknown, expectedIdeaId?: string): value is ArchivedIdeaSnapshot {
  if (!record(value) || value.schema_version !== 'idea-archive/v1'
    || value.archive_reason !== 'expired_pruned' || !record(value.snapshot)) return false
  if (!Number.isFinite(parseRfc3339Ms(value.archived_at))) return false
  if (!isSurfacedIdeaSnapshot(value.snapshot, expectedIdeaId)) return false
  const archivedAt = parseRfc3339Ms(value.archived_at)
  const decayAt = parseRfc3339Ms(value.snapshot.decay_at)
  // Only expired, unpromoted leads belong here. Promotions retain their live lifecycle snapshot.
  return value.snapshot.status === 'live' && value.snapshot.promoted_signal_id === null && decayAt <= archivedAt
}

function isSuppressedIdeaArchive(value: unknown, expectedIdeaId: string): value is SuppressedIdeaArchive {
  if (!record(value) || value.schema_version !== 'idea-archive-suppression/v1'
    || value.idea_id !== expectedIdeaId || value.suppression_reason !== 'withdrawn_unadmitted'
    || !exactString(value.idea_version, 22) || !IDEA_VERSION_RE.test(value.idea_version)
    || !Number.isFinite(parseRfc3339Ms(value.idea_version_started_at))
    || !DIRECTIONS.has(value.direction as IdeaDirection)
    || !Number.isFinite(parseRfc3339Ms(value.suppressed_at))) return false
  return value.direction === 'pair'
    ? typeof value.pair_with === 'string' && cleanTicker(value.pair_with) === value.pair_with
    : value.pair_with === null
}

function exactObjectKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort()
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index])
}

export function isImportedIdeaArchive(value: unknown, expectedIdeaId?: string): value is ImportedIdeaArchive {
  if (!record(value) || !exactObjectKeys(value, ['schema_version', 'recovered_at', 'recovery_reason', 'provenance', 'board_row'])
    || value.schema_version !== 'idea-board-recovery/v1'
    || (value.recovery_reason !== 'latest_board_current' && value.recovery_reason !== 'historical_board_expired')
    || !record(value.provenance) || !exactObjectKeys(value.provenance, ['source_path', 'source_commit', 'board_generated_at', 'source_row_sha256'])
    || value.provenance.source_path !== 'screener/board/index.json'
    || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(String(value.provenance.source_commit))
    || !/^[a-f0-9]{64}$/.test(String(value.provenance.source_row_sha256))
    || !Number.isFinite(parseRfc3339Ms(value.recovered_at)) || !record(value.board_row)) return false
  const row = value.board_row
  if (createHash('sha256').update(canonicalJsonText(row)).digest('hex') !== value.provenance.source_row_sha256
    || !/^IDEA-[a-f0-9]{12}$/.test(String(row.idea_id)) || (expectedIdeaId && row.idea_id !== expectedIdeaId)
    || !IDEA_VERSION_RE.test(String(row.idea_version)) || !Number.isFinite(parseRfc3339Ms(row.idea_version_started_at))
    || !DIRECTIONS.has(row.direction as IdeaDirection) || typeof row.ticker !== 'string' || !cleanTicker(row.ticker)
    || (row.direction === 'pair' ? typeof row.pair_with !== 'string' || !cleanTicker(row.pair_with) : row.pair_with !== null)
    || row.status !== 'live' || row.promoted_signal_id !== null
    || ![row.decay_at, row.newest_source_at, row.surfaced_at, row.updated_at].every((clock) => Number.isFinite(parseRfc3339Ms(clock)))
    || typeof row.reason !== 'string' || typeof row.why_now !== 'string'
    || typeof row.company !== 'string' && row.company !== null || typeof row.exchange !== 'string' && row.exchange !== null
    || !Array.isArray(row.source_event_ids) || !row.source_event_ids.every((item) => exactString(item, 256))
    || !Array.isArray(row.source_headlines) || !row.source_headlines.every((item) => exactString(item, 500))
    || typeof row.source_url !== 'string' && row.source_url !== null || typeof row.source_name !== 'string' && row.source_name !== null
    || !Number.isFinite(Number(row.conviction)) || !Number.isFinite(Number(row.trade_score)) || !Number.isFinite(Number(row.materiality_max))
    || typeof row.thesis_type !== 'string') return false
  const legacyWire = row.origin_type === undefined && row.source_themes === undefined
  const explicitWire = row.origin_type === 'wire' && Array.isArray(row.source_themes) && row.source_themes.length === 0
  if (!legacyWire && !explicitWire) return false
  const expiredAtBoard = parseRfc3339Ms(row.decay_at) <= parseRfc3339Ms(value.provenance.board_generated_at)
  return value.recovery_reason === 'historical_board_expired'
    ? row.stale === true && expiredAtBoard
    : row.stale === false && !expiredAtBoard
}

type ManagedArchiveNames = {
  names: string[]
  status: 'missing' | 'ok' | 'unreadable' | 'overflow'
}

/**
 * Enumerate at most the supported number of managed siblings plus one overflow sentinel. Directory
 * damage must not turn either reads or writes into O(unbounded-files) work.
 */
function boundedManagedArchiveNames(repoRoot: string): ManagedArchiveNames {
  const dir = ideasArchiveDir(repoRoot)
  let handle: fs.Dir
  try { handle = fs.opendirSync(dir) }
  catch (error: any) {
    return { names: [], status: error?.code === 'ENOENT' ? 'missing' : 'unreadable' }
  }
  const names: string[] = []
  let entriesRead = 0
  try {
    let entry: fs.Dirent | null
    while ((entry = handle.readSync()) !== null) {
      entriesRead++
      if (entriesRead > IDEA_ARCHIVE_MAX_DIRECTORY_ENTRIES_READ) return { names: [], status: 'overflow' }
      if (!entry.isFile() || !IDEA_ARCHIVE_FILE_RE.test(entry.name)) continue
      names.push(entry.name)
      if (names.length > IDEA_ARCHIVE_MAX_FILES_READ) return { names: [], status: 'overflow' }
    }
    return { names, status: 'ok' }
  } catch {
    return { names: [], status: 'unreadable' }
  } finally {
    try { handle.closeSync() } catch { /* read status is already fail-closed */ }
  }
}

function archiveOccurrenceHash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function archiveFilename(ideaId: string, ideaVersion: string, versionStartedAt: string, direction: IdeaDirection, kind: IdeaArchiveFileKind): string {
  return `${ideaId}--${ideaVersion}--${archiveOccurrenceHash(versionStartedAt)}--${direction}--${kind}.json`
}

function archiveFilenameParts(name: string): { ideaId: string; ideaVersion: string; occurrenceHash: string; direction: IdeaDirection; kind: IdeaArchiveFileKind } | null {
  const match = IDEA_ARCHIVE_FILE_RE.exec(name)
  if (!match) return null
  return { ideaId: match[1], ideaVersion: match[2], occurrenceHash: match[3], direction: match[4] as IdeaDirection, kind: match[5] as IdeaArchiveFileKind }
}

function archiveOccurrenceKey(parts: { ideaId: string; ideaVersion: string; occurrenceHash: string; direction: IdeaDirection }): string {
  return `${parts.ideaId}|${parts.ideaVersion}|${parts.occurrenceHash}|${parts.direction}`
}

function fsyncDirectory(dir: string): void {
  // Directory fsync is POSIX-only durability (makes a rename/link into `dir` crash-safe). Windows has no
  // directory file descriptors: fs.openSync(dir, 'r') raises EPERM there, and fs.fsyncSync on a directory
  // handle is unsupported. Skip rather than crash the publish/mutation path on that platform.
  if (process.platform === 'win32') return
  const fd = fs.openSync(dir, 'r')
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

type IdeaArchiveRetentionRead = { value: IdeaArchiveRetentionFile; status: 'missing' | 'ok' | 'invalid' }
function readIdeaArchiveRetentionFile(repoRoot: string): IdeaArchiveRetentionRead {
  const empty: IdeaArchiveRetentionFile = {
    schema_version: 'idea-archive-retention/v1', evicted_count: 0,
    side_counts: { long: { evicted_count: 0 }, short: { evicted_count: 0 } },
    pending_evictions: [],
  }
  try {
    const value = JSON.parse(fs.readFileSync(path.join(ideasArchiveDir(repoRoot), IDEA_ARCHIVE_RETENTION_FILE), 'utf8'))
    const counts = [value?.evicted_count, value?.side_counts?.long?.evicted_count, value?.side_counts?.short?.evicted_count]
    const valid = value?.schema_version === 'idea-archive-retention/v1'
      && counts.every((count) => Number.isInteger(count) && count >= 0)
      && Array.isArray(value.pending_evictions)
      && value.pending_evictions.length <= IDEA_ARCHIVE_MAX_FILES_READ
      && value.pending_evictions.every((key: unknown) => {
        if (typeof key !== 'string') return false
        const parts = archiveFilenameParts(key)
        // Withdrawals are terminal lifecycle barriers, never eviction candidates. Treat old/manual
        // pending state that names one as invalid so reads scan it and writers cannot unlink it.
        return parts !== null && parts.kind !== 'withdrawn'
      })
    return valid ? { value, status: 'ok' } : { value: empty, status: 'invalid' }
  } catch (error: any) {
    const required = fs.existsSync(path.join(ideasArchiveDir(repoRoot), IDEA_ARCHIVE_RETENTION_REQUIRED_FILE))
    return { value: empty, status: error?.code === 'ENOENT' && !required ? 'missing' : 'invalid' }
  }
}

function writeIdeaArchiveRetentionValue(repoRoot: string, next: IdeaArchiveRetentionFile): void {
  const dir = ideasArchiveDir(repoRoot)
  const fp = path.join(dir, IDEA_ARCHIVE_RETENTION_FILE)
  const tmp = `${fp}.tmp.${process.pid}.${randomUUID()}`
  let tmpFd: number | null = null
  try {
    tmpFd = fs.openSync(tmp, 'wx', 0o600)
    fs.writeFileSync(tmpFd, JSON.stringify(next, null, 2) + '\n')
    fs.fsyncSync(tmpFd)
    fs.closeSync(tmpFd)
    tmpFd = null
    fs.renameSync(tmp, fp)
    fsyncDirectory(dir)
  } finally {
    if (tmpFd !== null) try { fs.closeSync(tmpFd) } catch { /* best effort */ }
    try { fs.unlinkSync(tmp) } catch (error: any) { if (error?.code !== 'ENOENT') throw error }
  }
}

function ensureRetentionRequiredMarker(repoRoot: string): void {
  const dir = ideasArchiveDir(repoRoot)
  const fp = path.join(dir, IDEA_ARCHIVE_RETENTION_REQUIRED_FILE)
  if (fs.existsSync(fp)) return
  const fd = fs.openSync(fp, 'wx', 0o600)
  try { fs.writeFileSync(fd, 'idea archive retention metadata required\n'); fs.fsyncSync(fd) }
  finally { fs.closeSync(fd) }
  fsyncDirectory(dir)
}

type IdeaArchiveState = ArchivedIdeaSnapshot | ImportedIdeaArchive | SuppressedIdeaArchive

function archiveStateSides(row: IdeaArchiveState): ('long' | 'short')[] {
  const direction = row.schema_version === 'idea-archive/v1' ? row.snapshot.direction
    : row.schema_version === 'idea-board-recovery/v1' ? row.board_row.direction as IdeaDirection : row.direction
  if (direction === 'pair') return ['long', 'short']
  return [direction]
}

function archiveStateAt(row: IdeaArchiveState): number {
  return parseRfc3339Ms(row.schema_version === 'idea-archive-suppression/v1' ? row.suppressed_at
    : row.schema_version === 'idea-board-recovery/v1' ? row.recovered_at : row.archived_at)
}

function archiveStateLifecycleAt(row: IdeaArchiveState): number {
  if (row.schema_version === 'idea-archive/v1') return parseRfc3339Ms(row.snapshot.decay_at)
  if (row.schema_version === 'idea-board-recovery/v1') return parseRfc3339Ms(row.board_row.decay_at)
  return parseRfc3339Ms(row.suppressed_at)
}

function archiveStateDisplayable(row: IdeaArchiveState): row is ArchivedIdeaSnapshot | ImportedIdeaArchive {
  return row.schema_version !== 'idea-archive-suppression/v1'
}

function parseIdeaArchiveState(
  file: string,
  expected: { ideaId: string; ideaVersion: string; occurrenceHash: string; direction: IdeaDirection; kind: IdeaArchiveFileKind },
): { row: IdeaArchiveState | null; corrupt: boolean } {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (isArchivedIdeaSnapshot(raw, expected.ideaId)
      && raw.snapshot.idea_version === expected.ideaVersion
      && archiveOccurrenceHash(raw.snapshot.idea_version_started_at) === expected.occurrenceHash
      && raw.snapshot.direction === expected.direction && expected.kind === 'expired') return { row: raw, corrupt: false }
    if (isImportedIdeaArchive(raw, expected.ideaId)
      && raw.board_row.idea_version === expected.ideaVersion
      && archiveOccurrenceHash(String(raw.board_row.idea_version_started_at)) === expected.occurrenceHash
      && raw.board_row.direction === expected.direction && expected.kind === 'imported') return { row: raw, corrupt: false }
    if (isSuppressedIdeaArchive(raw, expected.ideaId)
      && raw.idea_version === expected.ideaVersion && archiveOccurrenceHash(raw.idea_version_started_at) === expected.occurrenceHash
      && raw.direction === expected.direction && expected.kind === 'withdrawn') return { row: raw, corrupt: false }
    return { row: null, corrupt: false }
  } catch { return { row: null, corrupt: true } }
}

/** Strict, bounded archive read. Invalid/corrupt managed rows are exposed through health, never counts. */
export function readIdeaArchiveStore(repoRoot: string): IdeaArchiveStoreRead {
  const dir = ideasArchiveDir(repoRoot)
  const emptyRetention: IdeaArchiveRetention = { truncated: false, evicted_count: 0, oldest_retained_at: null, side_counts: { long: { evicted_count: 0, oldest_retained_at: null }, short: { evicted_count: 0, oldest_retained_at: null } } }
  const managed = boundedManagedArchiveNames(repoRoot)
  if (managed.status !== 'ok') {
    if (managed.status === 'missing') return { snapshots: [], imports: [], lifecycle_barriers: [], status: 'missing', file_count: 0, suppression_count: 0, corrupt_count: 0, invalid_count: 0, error: null, retention: emptyRetention }
    // Overflow/unreadable means an unseen withdrawal is possible. Project no archive/import rows and
    // expose only sanitized incomplete-health metadata; exact live lookups remain independently guarded.
    return { snapshots: [], imports: [], lifecycle_barriers: [], status: 'unreadable', file_count: managed.status === 'overflow' ? IDEA_ARCHIVE_MAX_FILES_READ + 1 : 0, suppression_count: 0, corrupt_count: 0, invalid_count: 1, error: 'archive_store_unreadable', retention: emptyRetention }
  }
  const allNames = managed.names
  const retentionRead = readIdeaArchiveRetentionFile(repoRoot)
  const retentionFile = retentionRead.value
  const pendingEvictions = new Set(retentionFile.pending_evictions)
  // The hard enumeration bound already caps work. Parse every retained occurrence inside it so a newer
  // withdrawal/lifecycle barrier can never be omitted by a display-oriented sample.
  const names = allNames.filter((name) => !pendingEvictions.has(name))
  const out: ArchivedIdeaSnapshot[] = []
  const imports: ImportedIdeaArchive[] = []
  const suppressedVersions = new Set<string>()
  const lifecycleBarriers: { idea_id: string; idea_version_started_at: string | null }[] = []
  const suppressionBarrierIndex = new Map<string, number>()
  // A managed withdrawal filename is an exact occurrence barrier even when its bytes are corrupt or
  // unreadable. Count only valid tombstones, but never let malformed evidence resurrect its siblings.
  for (const name of names) {
    const parts = archiveFilenameParts(name)!
    if (parts.kind === 'withdrawn') {
      const key = archiveOccurrenceKey(parts)
      suppressedVersions.add(key)
      suppressionBarrierIndex.set(key, lifecycleBarriers.length)
      lifecycleBarriers.push({ idea_id: parts.ideaId, idea_version_started_at: null })
    }
  }
  let suppressions = 0
  let corrupt = 0
  // More managed files than the writer's side-aware maximum is itself invalid store state. Do not read
  // an unbounded attacker/corruption-created directory merely to make the diagnostics more granular.
  let invalid = pendingEvictions.size
  for (const name of names) {
    const expected = archiveFilenameParts(name)!
    const parsed = parseIdeaArchiveState(path.join(dir, name), expected)
    if (parsed.corrupt) corrupt++
    else if (!parsed.row) invalid++
    else if (parsed.row.schema_version === 'idea-archive/v1') {
      out.push(parsed.row)
      lifecycleBarriers.push({ idea_id: parsed.row.snapshot.idea_id, idea_version_started_at: parsed.row.snapshot.idea_version_started_at })
    }
    else if (parsed.row.schema_version === 'idea-board-recovery/v1') imports.push(parsed.row)
    else {
      const suppressed = parsed.row
      suppressions++
      const barrier = lifecycleBarriers[suppressionBarrierIndex.get(archiveOccurrenceKey(expected)) ?? -1]
      if (barrier) barrier.idea_version_started_at = suppressed.idea_version_started_at
    }
  }
  const occurrenceFor = (idea: any): string => archiveOccurrenceKey({
    ideaId: String(idea.idea_id), ideaVersion: String(idea.idea_version),
    occurrenceHash: archiveOccurrenceHash(String(idea.idea_version_started_at)), direction: idea.direction as IdeaDirection,
  })
  const visible = out.filter((row) => !suppressedVersions.has(occurrenceFor(row.snapshot)))
  const strictOccurrences = new Set(visible.map((row) => occurrenceFor(row.snapshot)))
  // Preserve both immutable files, but prefer the complete strict snapshot for the API occurrence.
  const visibleImports = imports.filter((row) => {
    const key = occurrenceFor(row.board_row)
    return !suppressedVersions.has(key) && !strictOccurrences.has(key)
  })
  const retainedStates: IdeaArchiveState[] = [...visible, ...visibleImports]
  if (retentionRead.status === 'invalid' || (retentionRead.status === 'missing' && allNames.length > 0)) invalid++
  const oldestFor = (side?: 'long' | 'short'): string | null => {
    const eligible = retainedStates.filter((row) => !side || archiveStateSides(row).includes(side))
    if (!eligible.length) return null
    return new Date(Math.min(...eligible.map(archiveStateLifecycleAt))).toISOString().replace(/\.\d{3}Z$/, 'Z')
  }
  return {
    snapshots: visible,
    imports: visibleImports,
    lifecycle_barriers: lifecycleBarriers,
    status: corrupt || invalid ? 'degraded' : 'ok',
    file_count: allNames.length,
    suppression_count: suppressions,
    corrupt_count: corrupt,
    invalid_count: invalid,
    error: null,
    retention: {
      truncated: retentionFile.evicted_count > 0,
      evicted_count: retentionFile.evicted_count,
      oldest_retained_at: oldestFor(),
      side_counts: {
        long: { evicted_count: retentionFile.side_counts.long.evicted_count, oldest_retained_at: oldestFor('long') },
        short: { evicted_count: retentionFile.side_counts.short.evicted_count, oldest_retained_at: oldestFor('short') },
      },
    },
  }
}

export function readArchivedIdeaSnapshots(repoRoot: string): ArchivedIdeaSnapshot[] {
  return readIdeaArchiveStore(repoRoot).snapshots
}

function trimIdeaArchiveUnlocked(repoRoot: string, protectedName?: string): void {
  const dir = ideasArchiveDir(repoRoot)
  const retentionRead = readIdeaArchiveRetentionFile(repoRoot)
  if (retentionRead.status === 'invalid') throw new Error('idea archive retention metadata is invalid')
  let retention = retentionRead.value
  // Finish a crash-interrupted eviction before selecting another. Its counters were already persisted.
  if (retention.pending_evictions.length) {
    for (const name of retention.pending_evictions) {
      try { fs.unlinkSync(path.join(dir, name)); fsyncDirectory(dir) }
      catch (error: any) { if (error?.code !== 'ENOENT') throw error }
    }
    retention = { ...retention, pending_evictions: [] }
    writeIdeaArchiveRetentionValue(repoRoot, retention)
  }
  const managed = boundedManagedArchiveNames(repoRoot)
  if (managed.status !== 'ok') throw new Error('idea archive exceeds its bounded managed-file policy')
  const candidates = managed.names
  const occurrenceCount = new Set(candidates.map(archiveFilenameParts).filter(Boolean)
    .map((parts) => archiveOccurrenceKey(parts!))).size
  if (occurrenceCount > IDEA_ARCHIVE_MAX_OCCURRENCES_READ) throw new Error('idea archive exceeds its bounded occurrence policy')
  const states = candidates.map((name) => {
    const expected = archiveFilenameParts(name)
    return expected ? { name, ...parseIdeaArchiveState(path.join(dir, name), expected) }
      : { name, row: null, corrupt: false }
  })
  const valid = states.filter((entry): entry is typeof entry & { row: IdeaArchiveState } => entry.row !== null)
  const grouped = new Map<string, typeof valid>()
  for (const entry of valid) {
    const parts = archiveFilenameParts(entry.name)!
    const key = archiveOccurrenceKey(parts)
    const group = grouped.get(key) || []
    group.push(entry); grouped.set(key, group)
  }
  const protectedParts = protectedName ? archiveFilenameParts(protectedName) : null
  const protectedKey = protectedParts
    ? archiveOccurrenceKey(protectedParts)
    : null
  const rawLiveOccurrences = new Set<string>()
  try {
    for (const file of fs.readdirSync(ideasDir(repoRoot)).filter((name) => /^IDEA-[a-f0-9]{12}\.json$/.test(name))) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(ideasDir(repoRoot), file), 'utf8'))
        if (!isSurfacedIdeaSnapshot(raw, file.slice(0, -5))) continue
        rawLiveOccurrences.add(archiveOccurrenceKey({
          ideaId: raw.idea_id, ideaVersion: raw.idea_version,
          occurrenceHash: archiveOccurrenceHash(raw.idea_version_started_at), direction: raw.direction,
        }))
      } catch { /* damaged live bytes are handled by snapshot health; never infer an occurrence */ }
    }
  } catch { /* missing live dir */ }
  const groups = [...grouped.entries()].map(([key, entries]) => {
    const suppressed = entries.some((entry) => entry.row.schema_version === 'idea-archive-suppression/v1')
    const evidence = entries.filter((entry) => archiveStateDisplayable(entry.row))
    return {
      key, entries, suppressed, displayable: evidence.length > 0 && !suppressed,
      at: Math.max(...entries.map((entry) => archiveStateLifecycleAt(entry.row))),
      sides: archiveStateSides(entries[0].row),
    }
  }).sort((a, b) => Number(b.displayable) - Number(a.displayable)
    || b.at - a.at || a.key.localeCompare(b.key))
  const keepGroups = new Set<string>()
  const keptBySide = { long: 0, short: 0 }
  for (const group of groups) {
    if (!group.suppressed && group.key !== protectedKey && !rawLiveOccurrences.has(group.key)
      && group.sides.some((side) => keptBySide[side] >= IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE)) continue
    keepGroups.add(group.key)
    // Withdrawal barriers have their own hard total-store bound and never consume a side's 250 slots.
    if (!group.suppressed) for (const side of group.sides) keptBySide[side]++
  }
  // Invalid/corrupt bytes are never selected above and remain repairable. For a valid eviction, persist
  // counters + pending identity before unlink; retry recognizes the pending key and cannot double-count.
  for (const group of groups.filter((entry) => !keepGroups.has(entry.key))) {
    const names = group.entries.map((entry) => entry.name)
    const next: IdeaArchiveRetentionFile = {
      schema_version: 'idea-archive-retention/v1',
      evicted_count: retention.evicted_count + 1,
      side_counts: {
        long: { evicted_count: retention.side_counts.long.evicted_count + (group.sides.includes('long') ? 1 : 0) },
        short: { evicted_count: retention.side_counts.short.evicted_count + (group.sides.includes('short') ? 1 : 0) },
      },
      pending_evictions: names,
    }
    writeIdeaArchiveRetentionValue(repoRoot, next)
    ensureRetentionRequiredMarker(repoRoot)
    for (const name of names) {
      try { fs.unlinkSync(path.join(dir, name)) }
      catch (error: any) { if (error?.code !== 'ENOENT') throw error }
    }
    fsyncDirectory(dir)
    retention = { ...next, pending_evictions: [] }
    writeIdeaArchiveRetentionValue(repoRoot, retention)
  }
}

function writeIdeaArchiveRecordUnlocked(repoRoot: string, row: IdeaArchiveState): void {
  const dir = ideasArchiveDir(repoRoot)
  const created = !fs.existsSync(dir)
  fs.mkdirSync(dir, { recursive: true })
  if (created) fsyncDirectory(path.dirname(dir))
  const retention = readIdeaArchiveRetentionFile(repoRoot)
  if (retention.status === 'invalid') throw new Error('idea archive retention metadata is invalid')
  if (retention.status === 'missing') {
    const existing = boundedManagedArchiveNames(repoRoot)
    if (existing.status !== 'ok' || existing.names.length > 0) {
      throw new Error('idea archive retention metadata is missing for existing records')
    }
    writeIdeaArchiveRetentionValue(repoRoot, retention.value)
  }
  ensureRetentionRequiredMarker(repoRoot)
  const idea = row.schema_version === 'idea-archive/v1' ? row.snapshot
    : row.schema_version === 'idea-board-recovery/v1' ? row.board_row : row
  const kind: IdeaArchiveFileKind = row.schema_version === 'idea-archive/v1' ? 'expired'
    : row.schema_version === 'idea-board-recovery/v1' ? 'imported' : 'withdrawn'
  const name = archiveFilename(String(idea.idea_id), String(idea.idea_version), String(idea.idea_version_started_at), idea.direction as IdeaDirection, kind)
  const fp = path.join(dir, name)
  try {
    fs.lstatSync(fp)
    const parsed = parseIdeaArchiveState(fp, archiveFilenameParts(name)!)
    if (!parsed.row) throw new Error('refusing to overwrite an invalid archive occurrence')
    const compatible = row.schema_version === 'idea-archive/v1' && parsed.row.schema_version === 'idea-archive/v1'
      ? canonicalJsonText(parsed.row.snapshot) === canonicalJsonText(row.snapshot)
      : row.schema_version === 'idea-archive-suppression/v1' && parsed.row.schema_version === 'idea-archive-suppression/v1'
        ? parsed.row.idea_id === row.idea_id && parsed.row.idea_version === row.idea_version
          && parsed.row.idea_version_started_at === row.idea_version_started_at && parsed.row.direction === row.direction
        : canonicalJsonText(parsed.row) === canonicalJsonText(row)
    if (!compatible) throw new Error('refusing to overwrite conflicting archive evidence')
    trimIdeaArchiveUnlocked(repoRoot, name)
    return
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
  const beforeWrite = boundedManagedArchiveNames(repoRoot)
  if (beforeWrite.status !== 'ok' || beforeWrite.names.length >= IDEA_ARCHIVE_MAX_FILES_READ) {
    throw new Error('idea archive has no bounded capacity for another managed file')
  }
  const newParts = archiveFilenameParts(name)!
  const currentOccurrences = new Set(beforeWrite.names.map(archiveFilenameParts).filter(Boolean)
    .map((parts) => archiveOccurrenceKey(parts!)))
  if (!currentOccurrences.has(archiveOccurrenceKey(newParts))
    && currentOccurrences.size >= IDEA_ARCHIVE_MAX_OCCURRENCES_READ) {
    throw new Error('idea archive has no bounded capacity for another occurrence')
  }
  const tmp = path.join(dir, `.${name}.tmp.${process.pid}.${randomUUID()}`)
  let tmpFd: number | null = null
  try {
    tmpFd = fs.openSync(tmp, 'wx', 0o600)
    fs.writeFileSync(tmpFd, JSON.stringify(row, null, 2) + '\n')
    fs.fsyncSync(tmpFd)
    fs.closeSync(tmpFd)
    tmpFd = null
    fs.renameSync(tmp, fp)
    // The archive directory entry must be durable before the live snapshot can be unlinked.
    fsyncDirectory(dir)
    trimIdeaArchiveUnlocked(repoRoot, name)
  } finally {
    if (tmpFd !== null) try { fs.closeSync(tmpFd) } catch { /* best effort */ }
    try { fs.unlinkSync(tmp) } catch (error: any) { if (error?.code !== 'ENOENT') throw error }
  }
}

/** Validated offline recovery sink. It never writes the live store and never overwrites a withdrawal. */
export function recoverBoardIdeaOccurrence(
  repoRoot: string,
  recovery: ImportedIdeaArchive,
): 'created' | 'existing' | 'suppressed' {
  if (!isImportedIdeaArchive(recovery)) throw new Error('invalid historical board recovery record')
  const row = recovery.board_row
  const ideaId = String(row.idea_id)
  const fp = path.join(ideasDir(repoRoot), `${ideaId}.json`)
  const lease = acquireIdeaMutationLease(repoRoot, fp)
  try {
    const identity = [ideaId, String(row.idea_version), String(row.idea_version_started_at), row.direction as IdeaDirection] as const
    for (const kind of ['withdrawn', 'expired', 'imported'] as const) {
      const name = archiveFilename(...identity, kind)
      const archivePath = path.join(ideasArchiveDir(repoRoot), name)
      if (!fs.existsSync(archivePath)) continue
      const current = parseIdeaArchiveState(archivePath, archiveFilenameParts(name)!)
      if (!current.row) throw new Error('refusing to recover beside an invalid archive occurrence')
      if (kind === 'withdrawn') return 'suppressed'
      if (kind === 'expired') return 'existing'
      if (canonicalJsonText(current.row) === canonicalJsonText(recovery)) return 'existing'
      throw new Error('historical board recovery conflicts with an existing occurrence')
    }
    writeIdeaArchiveRecordUnlocked(repoRoot, recovery)
    return 'created'
  } finally { releaseIdeaMutationLease(fp, lease) }
}

function archiveExpiredIdeaUnlocked(repoRoot: string, idea: SurfacedIdea, nowMs: number): void {
  const archivedAt = new Date(nowMs).toISOString().replace(/\.\d{3}Z$/, 'Z')
  const row: ArchivedIdeaSnapshot = {
    schema_version: 'idea-archive/v1',
    archived_at: archivedAt,
    archive_reason: 'expired_pruned',
    snapshot: idea,
  }
  if (!isArchivedIdeaSnapshot(row, idea.idea_id)) throw new Error(`refusing to archive invalid or unexpired idea ${idea.idea_id}`)
  writeIdeaArchiveRecordUnlocked(repoRoot, row)
}

function suppressWithdrawnIdeaArchiveUnlocked(repoRoot: string, idea: SurfacedIdea): void {
  writeIdeaArchiveRecordUnlocked(repoRoot, {
    schema_version: 'idea-archive-suppression/v1',
    idea_id: idea.idea_id,
    idea_version: idea.idea_version,
    idea_version_started_at: idea.idea_version_started_at,
    direction: idea.direction,
    pair_with: idea.pair_with,
    suppressed_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    suppression_reason: 'withdrawn_unadmitted',
  })
}

function ideaArchiveOccurrenceBlocksLive(repoRoot: string, idea: SurfacedIdea): boolean {
  const name = archiveFilename(idea.idea_id, idea.idea_version, idea.idea_version_started_at, idea.direction, 'withdrawn')
  const fp = path.join(ideasArchiveDir(repoRoot), name)
  try { fs.lstatSync(fp) }
  catch (error: any) { return error?.code !== 'ENOENT' }
  const parsed = parseIdeaArchiveState(fp, {
    ideaId: idea.idea_id,
    ideaVersion: idea.idea_version,
    occurrenceHash: archiveOccurrenceHash(idea.idea_version_started_at),
    direction: idea.direction,
    kind: 'withdrawn',
  })
  // A valid expiry archive may coexist briefly with its already-stale live source during archive-first
  // pruning. Only a suppression hides a current row. Malformed bytes at this exact occurrence fail closed.
  return parsed.row?.schema_version === 'idea-archive-suppression/v1' || parsed.row === null
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
  // Normalise both sides to POSIX separators before the prefix check: on Windows, path.resolve returns
  // backslash-separated paths, and a bare `startsWith(dir + path.sep)` is a correctness trap there (it is
  // still a safe REJECT on a mismatch, never a false accept, but path.sep differs per platform and a stray
  // mixed-separator input could slip past a naive comparison). Compare the same normalised form on both sides.
  const posixFp = fp.replace(/\\/g, '/')
  const posixDirPrefix = (dir + path.sep).replace(/\\/g, '/')
  if (!posixFp.startsWith(posixDirPrefix)) return null
  try {
    const o = JSON.parse(fs.readFileSync(fp, 'utf8'))
    return isSurfacedIdeaSnapshot(o, ideaId) && !ideaArchiveOccurrenceBlocksLive(repoRoot, o) ? o : null
  } catch { return null }
}

export type IdeaPromotionEligibility =
  | { status: 'eligible' }
  | { status: 'expired' }
  | { status: 'already_promoted'; signal_id: string }

/** Server-side promotion gate. Idempotent completed promotions win even after their old decay timestamp. */
export function ideaPromotionEligibility(idea: SurfacedIdea, nowMs = Date.now()): IdeaPromotionEligibility {
  if (idea.status === 'promoted' && idea.promoted_signal_id) {
    return { status: 'already_promoted', signal_id: idea.promoted_signal_id }
  }
  const decayMs = parseRfc3339Ms(idea.decay_at)
  if (!Number.isFinite(decayMs) || decayMs <= nowMs) return { status: 'expired' }
  return { status: 'eligible' }
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
export function writeIdeaIfRevision(
  repoRoot: string,
  idea: SurfacedIdea,
  expectedRevision: string,
  precondition?: () => boolean,
): boolean {
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
    // Evaluated synchronously while the repository mutation lease and per-snapshot lock are both held.
    // This closes the last revalidation -> rename gap without making a withdrawn version globally terminal.
    if (precondition && !precondition()) return false
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

export interface IdeaPromotionReservation {
  idea_id: string
  token: string
  started_at: string
  /** Deterministic identity frozen before provider admission. Absent only on rolling-deploy reservations
   * created before crash-safe promotion recovery existed. */
  signal_id?: string
}
// The reservation path is built INLINE in each function below (never via a shared helper). CodeQL's
// path-injection sanitizer does not follow a resolve+contain guard across a function-return boundary, so a
// helper guard is invisible to the scanner at the fs sinks in its callers — two earlier attempts (a callee
// guard, then an inline guard that checked a SEPARATE `path.resolve(fp)` value while the sink still consumed
// the raw `path.join(...)` result) were both re-flagged. Each function therefore reproduces readIdeaById's
// recognised idiom exactly: regex-gate the id, `path.resolve` the path, prefix-check THAT resolved value,
// and pass the SAME resolved value to every fs call — guard and sink in one function, no intervening call.
function readPromotionReservation(fp: string): IdeaPromotionReservation | null {
  try {
    const value = JSON.parse(fs.readFileSync(fp, 'utf8'))
    return value && typeof value === 'object' && !Array.isArray(value)
      && typeof value.idea_id === 'string' && /^IDEA-[a-f0-9]{12}$/.test(value.idea_id)
      && typeof value.token === 'string' && /^[0-9a-f-]{36}$/.test(value.token)
      && typeof value.started_at === 'string'
      && Number.isFinite(parseRfc3339Ms(value.started_at))
      && (value.signal_id === undefined || (typeof value.signal_id === 'string'
        && /^SIG-[0-9]{8}-[a-f0-9]{8}$/.test(value.signal_id)))
      ? value as IdeaPromotionReservation : null
  } catch { return null }
}

function writePromotionReservationAtomic(repoRoot: string, reservation: IdeaPromotionReservation): void {
  // CodeQL barrier — mirror its documented safe pattern exactly: regex-gate the id, resolve the path,
  // check that same resolved value against the resolved directory, then use it at every fs sink below.
  if (!/^IDEA-[a-f0-9]{12}$/.test(reservation.idea_id)) throw new Error('invalid promotion idea id')
  const dir = path.resolve(ideasDir(repoRoot))
  const fp = path.resolve(dir, `${reservation.idea_id}.promotion`)
  if (!fp.startsWith(dir + path.sep)) throw new Error('refusing to write promotion reservation outside ideas dir')
  const tmp = `${fp}.tmp.${process.pid}.${randomUUID()}`
  let fd: number | null = null
  try {
    fd = fs.openSync(tmp, 'wx', 0o600)
    fs.writeFileSync(fd, JSON.stringify(reservation) + '\n')
    fs.fsyncSync(fd)
    fs.closeSync(fd); fd = null
    fs.renameSync(tmp, fp)
    fsyncDirectory(dir)
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.unlinkSync(tmp) } catch (error: any) { if (error?.code !== 'ENOENT') throw error }
  }
}

/** Only a valid, recent reservation protects lifecycle state. */
function activePromotionReservationUnlocked(repoRoot: string, ideaId: string, nowMs: number): boolean {
  // CodeQL barrier — mirror readIdeaById: regex-gate, resolve, prefix-check, then sink the resolved value.
  if (!/^IDEA-[a-f0-9]{12}$/.test(ideaId)) throw new Error('invalid promotion idea id')
  const dir = path.resolve(ideasDir(repoRoot))
  const reservationFile = path.resolve(dir, `${ideaId}.promotion`)
  if (!reservationFile.startsWith(dir + path.sep)) throw new Error('refusing to touch promotion reservation outside ideas dir')
  if (!fs.existsSync(reservationFile)) return false
  const reservation = readPromotionReservation(reservationFile)
  const startedAt = parseRfc3339Ms(reservation?.started_at)
  if (reservation?.idea_id === ideaId && Number.isFinite(startedAt)
    && nowMs >= startedAt && nowMs - startedAt <= IDEA_PROMOTION_STALE_MS) return true
  try {
    fs.unlinkSync(reservationFile)
    fsyncDirectory(dir)
  } catch (error: any) { if (error?.code !== 'ENOENT') throw error }
  return false
}

/** Durable cross-request reservation made before a paid launch. A second request cannot spend twice. */
export function reserveIdeaPromotion(
  repoRoot: string,
  ideaId: string,
  nowMs = Date.now(),
  signalId?: string,
): IdeaPromotionReservation | null {
  if (!/^IDEA-[a-f0-9]{12}$/.test(ideaId)) return null
  if (signalId !== undefined && !/^SIG-[0-9]{8}-[a-f0-9]{8}$/.test(signalId)) return null
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
    // Eligibility is checked on the snapshot re-read under the same lock that creates the reservation.
    // A route-level check is useful UX but cannot close the expiry/refresh TOCTOU window by itself.
    if (!current || ideaPromotionEligibility(current, nowMs).status !== 'eligible') return null
    if (activePromotionReservationUnlocked(repoRoot, ideaId, nowMs)) return null
    const reservation: IdeaPromotionReservation = {
      idea_id: ideaId,
      token: randomUUID(),
      started_at: new Date(nowMs).toISOString().replace(/\.\d{3}Z$/, 'Z'),
      ...(signalId ? { signal_id: signalId } : {}),
    }
    writePromotionReservationAtomic(repoRoot, reservation)
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
    // CodeQL barrier — resolve, prefix-check, then sink the same resolved value. (The id
    // was already regex-gated at the top of this function.)
    const dir = path.resolve(ideasDir(repoRoot))
    const reservationFile = path.resolve(dir, `${ideaId}.promotion`)
    if (!reservationFile.startsWith(dir + path.sep)) throw new Error('refusing to touch promotion reservation outside ideas dir')
    const reservation = readPromotionReservation(reservationFile)
    if (reservation?.token === token) {
      try { fs.unlinkSync(reservationFile); fsyncDirectory(dir) } catch { /* best effort */ }
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
  if (!/^IDEA-[a-f0-9]{12}$/.test(ideaId)) throw new Error('invalid promotion idea id')
  const fp = path.join(ideasDir(repoRoot), `${ideaId}.json`)
  const lease = acquireIdeaMutationLease(repoRoot, fp)
  try {
    // CodeQL barrier — after the local regex gate above, resolve, prefix-check, and sink the same value.
    const reservationDir = path.resolve(ideasDir(repoRoot))
    const reservationFile = path.resolve(reservationDir, `${ideaId}.promotion`)
    if (!reservationFile.startsWith(reservationDir + path.sep)) throw new Error('refusing to touch promotion reservation outside ideas dir')
    const reservation = readPromotionReservation(reservationFile)
    if (!reservation || reservation.token !== token) throw new Error('idea promotion reservation was lost')
    const current = readIdeaById(repoRoot, ideaId) || fallback
    if (current.idea_id !== ideaId) throw new Error('idea promotion identity changed')
    const next: SurfacedIdea = { ...current, status: 'promoted', promoted_signal_id: signalId, updated_at: updatedAt }
    writeIdeaUnlocked(repoRoot, next, fp, lease.repositoryFd)
    fs.unlinkSync(reservationFile)
    fsyncDirectory(ideasDir(repoRoot))
    return next
  } finally {
    releaseIdeaMutationLease(fp, lease)
  }
}

export interface IdeaPromotionReconciliation {
  recovered: number
  released: number
  pending: number
  errors: string[]
}

/**
 * Reconcile promotion reservations left by a killed server. A durable, identity-matching signal intake
 * proves launch admission happened, so the Idea lifecycle can be completed locally without another paid
 * request. A stale reservation with no intake is released for a clean retry. Legacy reservations without
 * a frozen signal id remain protected until their normal stale boundary and can never be guessed.
 */
export function reconcileIdeaPromotionReservations(
  repoRoot: string,
  durableSignalIntakeExists: (signalId: string) => boolean,
  nowMs = Date.now(),
): IdeaPromotionReconciliation {
  const result: IdeaPromotionReconciliation = { recovered: 0, released: 0, pending: 0, errors: [] }
  const dir = path.resolve(ideasDir(repoRoot))
  let entries: string[]
  try {
    entries = fs.readdirSync(dir).filter((entry) => /^IDEA-[a-f0-9]{12}\.promotion$/.test(entry)).sort()
  } catch (error: any) {
    if (error?.code === 'ENOENT') return result
    result.errors.push(`promotion store cannot be read: ${String(error?.message || error).slice(0, 200)}`)
    return result
  }
  const updatedAt = new Date(nowMs).toISOString().replace(/\.\d{3}Z$/, 'Z')
  for (const entry of entries) {
    const ideaId = entry.slice(0, -'.promotion'.length)
    // The directory entry is regex-gated above. Resolve and contain the exact path before every fs sink.
    const reservationFile = path.resolve(dir, entry)
    if (!reservationFile.startsWith(dir + path.sep)) {
      result.errors.push(`${ideaId}: unsafe promotion reservation path`)
      continue
    }
    const reservation = readPromotionReservation(reservationFile)
    if (!reservation || reservation.idea_id !== ideaId) {
      result.errors.push(`${ideaId}: promotion reservation is unreadable`)
      continue
    }
    const current = readIdeaById(repoRoot, ideaId)
    if (current?.status === 'promoted' && current.promoted_signal_id) {
      releaseIdeaPromotion(repoRoot, ideaId, reservation.token)
      if (fs.existsSync(reservationFile)) result.errors.push(`${ideaId}: completed reservation could not be cleared`)
      else result.released++
      continue
    }
    let signalExists = false
    if (reservation.signal_id) {
      try {
        signalExists = durableSignalIntakeExists(reservation.signal_id)
      } catch (error: any) {
        result.errors.push(`${ideaId}: signal admission proof could not be checked: ${String(error?.message || error).slice(0, 160)}`)
        continue
      }
    }
    if (reservation.signal_id && signalExists) {
      if (!current) {
        result.errors.push(`${ideaId}: admitted signal exists but its Idea snapshot is missing`)
        continue
      }
      try {
        finalizeIdeaPromotion(
          repoRoot, ideaId, reservation.token, reservation.signal_id, updatedAt, current,
        )
        result.recovered++
      } catch (error: any) {
        result.errors.push(`${ideaId}: ${String(error?.message || error).slice(0, 200)}`)
      }
      continue
    }
    const startedAt = parseRfc3339Ms(reservation.started_at)
    const stale = !Number.isFinite(startedAt) || nowMs < startedAt || nowMs - startedAt > IDEA_PROMOTION_STALE_MS
    if (!stale) {
      result.pending++
      continue
    }
    releaseIdeaPromotion(repoRoot, ideaId, reservation.token)
    if (fs.existsSync(reservationFile)) result.errors.push(`${ideaId}: stale reservation could not be released`)
    else result.released++
  }
  return result
}

interface ThemeAdmissionEdge { evidence: Set<string>; whyNow: Set<string>; roles: Set<string> }
function themeAdmissionEdges(rows: IdeaInputRow[]): Map<string, ThemeAdmissionEdge> {
  const edges = new Map<string, ThemeAdmissionEdge>()
  const revisionsByTheme = new Map<string, Set<number>>()
  for (const row of rows) {
    if (row.origin_type !== 'theme' && row.origin_type !== 'mixed') continue
    for (const theme of row.source_themes || []) {
      const key = `${theme.theme_id}@${theme.theme_rev}`
      const revisions = revisionsByTheme.get(theme.theme_id) || new Set<number>()
      revisions.add(theme.theme_rev)
      revisionsByTheme.set(theme.theme_id, revisions)
      const edge = edges.get(key) || { evidence: new Set<string>(), whyNow: new Set<string>(), roles: new Set<string>() }
      for (const eventId of theme.evidence_event_ids || []) edge.evidence.add(eventId)
      if (theme.why_now_event_id) edge.whyNow.add(theme.why_now_event_id)
      for (const expression of row.theme_expressions || []) {
        if (expression.theme_id !== theme.theme_id || expression.theme_rev !== theme.theme_rev) continue
        for (const eventId of expression.evidence_event_ids) edge.evidence.add(eventId)
      }
      for (const context of row.theme_contexts || []) {
        if (context.theme_id === theme.theme_id && context.theme_rev === theme.theme_rev) edge.roles.add(context.role)
      }
      edges.set(key, edge)
    }
  }
  for (const [themeId, revisions] of revisionsByTheme) {
    if (revisions.size < 2) continue
    for (const rev of revisions) edges.delete(`${themeId}@${rev}`)
  }
  return edges
}

function themeDerivedIdeaIsAdmitted(idea: SurfacedIdea, edges: Map<string, ThemeAdmissionEdge>): boolean {
  if ((idea.origin_type !== 'theme' && idea.origin_type !== 'mixed') || !idea.source_themes?.length) return true
  return idea.source_themes.every((theme) => {
    const admitted = edges.get(`${theme.theme_id}@${theme.theme_rev}`)
    return Boolean(admitted?.evidence.size && theme.evidence_event_ids?.length && theme.why_now_event_id
      && admitted.whyNow.size === 1 && admitted.whyNow.has(theme.why_now_event_id)
      && admitted.roles.has('WHY_NOW') && admitted.roles.has('EXPRESSION_PROOF')
      && theme.evidence_event_ids.includes(theme.why_now_event_id)
      && theme.evidence_event_ids.every((eventId) => admitted.evidence.has(eventId)))
  })
}

function mixedIdeaHasIndependentWireIssuerProof(idea: SurfacedIdea, rows: IdeaInputRow[]): boolean {
  if (idea.origin_type !== 'mixed' || !idea.primary_source_event_id || !idea.source_headline
    || !idea.source_url || !idea.source_name) return false
  return rows.some((row) => {
    if (row.origin_type !== 'wire' || row.event_id !== idea.primary_source_event_id
      || row.issuer_linkage !== 'primary'
      || row.headline_orig !== idea.source_headline || row.url !== idea.source_url || row.source_name !== idea.source_name
      || eventIdFor(row.headline_orig, row.url) !== row.event_id) return false
    const tickers = new Set((row.companies || []).map((company) => cleanTicker(company.ticker)).filter(Boolean))
    if (!tickers.has(idea.ticker)) return false
    return idea.direction !== 'pair' || Boolean(idea.pair_with && tickers.has(idea.pair_with))
  })
}

/** Immediately retire every unpromoted Theme-derived lead whose exact current revision/package no longer
 * clears admission. A mixed lead survives only when its bound primary event independently clears the
 * current wire as exact primary-issuer proof; a historical `mixed` label alone is not proof. */
export function retireUnadmittedThemeIdeas(repoRoot: string, admittedRows: IdeaInputRow[]): number {
  const edges = themeAdmissionEdges(admittedRows)
  let removed = 0
  for (const idea of readIdeaSnapshots(repoRoot)) {
    if (idea.status === 'promoted' || (idea.origin_type !== 'theme' && idea.origin_type !== 'mixed')
      || themeDerivedIdeaIsAdmitted(idea, edges) || mixedIdeaHasIndependentWireIssuerProof(idea, admittedRows)) continue
    const fp = path.join(ideasDir(repoRoot), `${idea.idea_id}.json`)
    let lease: IdeaMutationLease
    try { lease = acquireIdeaMutationLease(repoRoot, fp) } catch { continue }
    try {
      const current = readIdeaById(repoRoot, idea.idea_id)
      if (!current
        || current.status === 'promoted'
        || (current.origin_type !== 'theme' && current.origin_type !== 'mixed')
        || themeDerivedIdeaIsAdmitted(current, edges)
        || mixedIdeaHasIndependentWireIssuerProof(current, admittedRows)
        || activePromotionReservationUnlocked(repoRoot, current.idea_id, Date.now())) continue
      // A prior expired version of the same stable ticker+direction id must never reappear after the
      // current Theme package is withdrawn. Persist a terminal suppression marker before unlinking; the
      // marker is audit state, not an archive row, and a later valid expiry may safely overwrite it.
      suppressWithdrawnIdeaArchiveUnlocked(repoRoot, current)
      fs.unlinkSync(fp)
      fsyncDirectory(path.dirname(fp))
      removed++
    } finally {
      releaseIdeaMutationLease(fp, lease)
    }
  }
  return removed
}

/**
 * Move snapshots whose decay is well past (older than `hardTtlMs` beyond decay_at) into the bounded audit
 * archive, then remove them from the live store. Archive persistence is fail-closed: if its atomic write
 * fails the live snapshot remains. A PROMOTED or in-flight idea is always kept. Returns removals.
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
      if (!current || current.status === 'promoted' || activePromotionReservationUnlocked(repoRoot, idea.idea_id, nowMs)) continue
      const decay = Date.parse(current.decay_at)
      if (Number.isFinite(decay) && nowMs - decay > hardTtlMs) {
        archiveExpiredIdeaUnlocked(repoRoot, current, nowMs)
        fs.unlinkSync(fp)
        fsyncDirectory(path.dirname(fp))
        removed++
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
export interface IdeaPassChunkState {
  hash: string
  effect_hash: string
  /** Raw valid provider rows returned for this successfully persisted envelope. Zero is the literal
   * empty-success contract; omitted is a legacy checkpoint whose outcome was not recorded. */
  returned_count?: number
}
export interface IdeaPassInFlightState {
  chunk: IdeaPassChunkState
  /** Stable row identities in the prepared provider envelope. If the process loses the final checkpoint,
   * the next owner treats these rows as already attempted instead of charging the same envelope again. */
  input_keys: string[]
  /** Event ids aligned with input_keys. This lets recovery bind a saved idea to its exact selected source
   * rows even when another row has already left the current sweep. Optional only for rolling deploys. */
  input_event_ids?: string[]
  started_at_ms: number
  /** prepared = dispatch is not authorized and no reservation exists; authorized = this exact envelope
   * was durably approved immediately before reservation, so a crash may have happened before or after
   * provider I/O; persisted = the result/snapshots are durable but final marker removal was interrupted.
   * dispatched and missing are conservative rolling-deploy forms of authorized. */
  phase?: 'prepared' | 'authorized' | 'dispatched' | 'persisted'
  attempt_id?: string
  /** Snapshot baseline captured before dispatch. A changed/new exact revision is local proof that this
   * attempt persisted an idea even if the terminal progress write was interrupted. */
  snapshot_revisions?: IdeaPassSnapshotRevision[]
}
export interface IdeaPassIdeaClaim {
  idea_id: string
  /** Stable identities of only the source rows that supported this accepted occurrence. */
  input_keys: string[]
}
export interface IdeaInterruptedAttemptRecord {
  schema_version: 'ideas-interrupted-attempt/v1'
  interruption_id: string
  detected_at: string
  started_at: string | null
  phase: 'authorized' | 'dispatched' | 'legacy_unknown'
  attempt_id: string | null
  provider: string | null
  input_keys: string[]
  /** Aligned with input_keys. Null means the rolling/legacy checkpoint did not retain that event id. */
  input_event_ids: (string | null)[]
  recovered_idea_claims: IdeaPassIdeaClaim[]
  outcome: 'response_unknown'
  disposition: 'quarantined_at_most_once'
}
export interface IdeaPassUncertainInputAudit {
  input_key: string
  interruption_id: string
}
export interface IdeaPassSnapshotRevision {
  idea_id: string
  revision: string
}
export interface IdeaPassState {
  hash: string
  effect_hash?: string
  ran_at_ms: number
  /** Successfully persisted provider chunks for the current coverage window. Absent is the legacy
   * single-call state; callers may treat it as complete only when the whole input still fits one chunk. */
  completed_chunks?: IdeaPassChunkState[]
  /** Stable row order for the current coverage window. New top-ranked rows append to this queue, so a
   * busy wire cannot keep moving unfinished lower-ranked rows behind a freshly rebuilt first chunk. */
  coverage_order?: string[]
  /** Stable prompt+effect identities already covered in this window. Unlike positional chunk hashes,
   * these survive inserts and removals elsewhere in the ranked input set. */
  completed_input_keys?: string[]
  /** First valid ticker+direction calls already committed in this window. Later chunks may repeat a call
   * for comparison context, but must not replace the stronger occurrence admitted from an earlier chunk. */
  completed_idea_ids?: string[]
  /** Source-scoped form of completed_idea_ids. An unrelated row leaving the queue cannot unlock a claim;
   * changing or removing one of its actual support rows does, so refreshed lineage can still be saved. */
  completed_idea_claims?: IdeaPassIdeaClaim[]
  /** Exact prompt+effect row identities from sent requests whose result checkpoint is unknown. They are
   * quarantined, not completed: later/new rows keep flowing, but these rows are never sent again without
   * an explicit audited recovery. Changed or removed rows naturally drop because their identity changes. */
  uncertain_input_keys?: string[]
  /** Permanent-ledger receipt aligned by exact input identity. A live quarantine cannot be cleared until
   * every row has one, so an aging row never erases the only record of an unknown provider response. */
  uncertain_input_audits?: IdeaPassUncertainInputAudit[]
  /** Durable request lifecycle marker. Recovery safely retries prepared, quarantines dispatched, and
   * locally finishes persisted without another provider call. */
  in_flight?: IdeaPassInFlightState
}

export const IDEA_INTERRUPTED_ATTEMPTS_PATH = 'screener/ledger/ideas_interrupted_attempts.ndjson'

/** Append-only, fsynced and idempotent evidence for provider requests whose response is unknowable.
 * Publication is deliberately owned by runIdeaPass, which must push this receipt before clearing the
 * transient in-flight marker. */
export async function appendIdeaInterruptedAttempt(
  repoRoot: string,
  record: IdeaInterruptedAttemptRecord,
): Promise<'appended' | 'duplicate'> {
  const helperInRepo = path.join(repoRoot, 'scripts', 'append-ndjson.sh')
  const helper = fs.existsSync(helperInRepo) ? helperInRepo : sourceTreeAppendHelper
  if (!fs.existsSync(helper)) throw new Error(`Ideas interrupted-attempt append helper is missing: ${helper}`)
  const ledger = path.join(repoRoot, IDEA_INTERRUPTED_ATTEMPTS_PATH)
  try {
    const result = await execFileAsync('bash', [
      helper, ledger, JSON.stringify(record), 'interruption_id', record.interruption_id,
    ], {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 20_000,
      maxBuffer: 256_000,
      env: { ...process.env, NDJSON_REPO_LOCK_WAIT_MS: '15000' },
    })
    const stdout = String(result.stdout || '')
    if (/^APPENDED=1\s*$/m.test(stdout)) return 'appended'
    if (/^DUPLICATE=1\s*$/m.test(stdout)) return 'duplicate'
    const detail = String(result.stderr || '').trim() || stdout.trim() || 'invalid helper output'
    throw Object.assign(new Error(`Ideas interrupted-attempt append failed: ${detail.slice(0, 240)}`), {
      code: 'EIDEA_INTERRUPTION_APPEND',
    })
  } catch (error: any) {
    if (error?.code === 'EIDEA_INTERRUPTION_APPEND') throw error
    const detail = String(error?.stderr || '').trim() || String(error?.stdout || '').trim()
      || String(error?.message || error || 'unknown')
    throw Object.assign(new Error(`Ideas interrupted-attempt append failed: ${detail.slice(0, 240)}`), {
      code: 'EIDEA_INTERRUPTION_APPEND',
    })
  }
}

export function readPassState(stateDir: string, failOnCorrupt = false): IdeaPassState | null {
  const file = path.join(stateDir, 'ideas-pass.json')
  let raw: string
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null
    if (failOnCorrupt) throw Object.assign(new Error('Ideas progress record needs attention.'), { code: 'EIDEA_PASS_STATE' })
    return null
  }
  try {
    const o = JSON.parse(raw)
    const stringArray = (value: unknown): boolean => value === undefined || (Array.isArray(value)
      && value.length <= 10_000 && value.every((entry) => typeof entry === 'string' && entry.length > 0 && entry.length <= 256))
    const chunkValid = (chunk: any): boolean => Boolean(chunk && typeof chunk.hash === 'string'
      && typeof chunk.effect_hash === 'string'
      && (chunk.returned_count === undefined || (Number.isInteger(chunk.returned_count) && chunk.returned_count >= 0)))
    const chunksValid = o?.completed_chunks === undefined || (Array.isArray(o.completed_chunks)
      && o.completed_chunks.length <= 10_000
      && o.completed_chunks.every(chunkValid))
    const inFlightValid = o?.in_flight === undefined || Boolean(o.in_flight
      && chunkValid(o.in_flight.chunk)
      && stringArray(o.in_flight.input_keys)
      && Array.isArray(o.in_flight.input_keys)
      && stringArray(o.in_flight.input_event_ids)
      && (o.in_flight.input_event_ids === undefined
        || o.in_flight.input_event_ids.length === o.in_flight.input_keys.length)
      && typeof o.in_flight.started_at_ms === 'number'
      && Number.isFinite(o.in_flight.started_at_ms)
      && (o.in_flight.phase === undefined || o.in_flight.phase === 'prepared'
        || o.in_flight.phase === 'authorized' || o.in_flight.phase === 'dispatched'
        || o.in_flight.phase === 'persisted')
      && (o.in_flight.attempt_id === undefined || (typeof o.in_flight.attempt_id === 'string'
        && o.in_flight.attempt_id.length > 0 && o.in_flight.attempt_id.length <= 128))
      && (o.in_flight.snapshot_revisions === undefined || (Array.isArray(o.in_flight.snapshot_revisions)
        && o.in_flight.snapshot_revisions.length <= 10_000
        && o.in_flight.snapshot_revisions.every((snapshot: any) => snapshot
          && typeof snapshot.idea_id === 'string' && snapshot.idea_id.length > 0 && snapshot.idea_id.length <= 256
          && typeof snapshot.revision === 'string' && snapshot.revision.length > 0 && snapshot.revision.length <= 256))))
    const claimsValid = o?.completed_idea_claims === undefined || (Array.isArray(o.completed_idea_claims)
      && o.completed_idea_claims.length <= 10_000
      && o.completed_idea_claims.every((claim: any) => claim
        && typeof claim.idea_id === 'string' && claim.idea_id.length > 0 && claim.idea_id.length <= 256
        && Array.isArray(claim.input_keys) && stringArray(claim.input_keys)))
    const uncertainAuditsValid = o?.uncertain_input_audits === undefined || (Array.isArray(o.uncertain_input_audits)
      && o.uncertain_input_audits.length <= 10_000
      && o.uncertain_input_audits.every((audit: any) => audit
        && typeof audit.input_key === 'string' && audit.input_key.length > 0 && audit.input_key.length <= 256
        && typeof audit.interruption_id === 'string' && /^IDEAI-[a-f0-9]{64}$/.test(audit.interruption_id)))
    if (o && typeof o.hash === 'string'
      && (o.effect_hash === undefined || typeof o.effect_hash === 'string')
      && typeof o.ran_at_ms === 'number' && Number.isFinite(o.ran_at_ms)
      && chunksValid
      && stringArray(o.coverage_order)
      && stringArray(o.completed_input_keys)
      && stringArray(o.completed_idea_ids)
      && stringArray(o.uncertain_input_keys)
      && uncertainAuditsValid
      && claimsValid
      && inFlightValid) return o as IdeaPassState
  } catch { /* handled below */ }
  if (failOnCorrupt) throw Object.assign(new Error('Ideas progress record needs attention.'), { code: 'EIDEA_PASS_STATE' })
  return null
}

export function writePassState(stateDir: string, state: IdeaPassState): void {
  const file = path.join(stateDir, 'ideas-pass.json')
  const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(tmp, JSON.stringify(state))
    fs.renameSync(tmp, file)
  } catch (error: any) {
    try { fs.unlinkSync(tmp) } catch { /* absent temp */ }
    // A missed checkpoint can rebill a provider envelope. Surface it so runIdeaPass fails before dispatch
    // or leaves its durable in-flight marker for at-most-once recovery; never pretend this is best-effort.
    throw Object.assign(new Error(`idea pass checkpoint failed: ${String(error?.message || error).slice(0, 200)}`), {
      code: 'EIDEA_PASS_CHECKPOINT',
    })
  }
}
