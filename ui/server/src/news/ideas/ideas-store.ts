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
import { cleanTicker, normTicker } from '../symbology'
import { SOURCE_TIERS, type SourceTierId } from '../scope'
import { createThemesIndexReader } from '../themes/api-index'
import { themeStoryKey } from '../themes/story-key'
import { loadThemes, readThemesIndex, themesLedgerPath } from '../themes/store'
import type { Theme, ThemeMember } from '../themes/types'
import type { FeedItem } from '../types'
import { parseRfc3339Ms } from '../../rfc3339'
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

/** `dedup_group` is the earliest member's event id. Treat both fields as aliases so a legacy anchor
 * without a persisted group still joins a newer publisher copy whose group points at that anchor. */
function ideaStoryIds(row: Pick<IdeaInputRow, 'event_id' | 'dedup_group'>): string[] {
  const group = row.dedup_group?.trim()
  return group && group !== row.event_id ? [row.event_id, group] : [row.event_id]
}

/** Preserve a separate correction/reversal lane inside one publisher-copy family. Otherwise a highly
 * trusted original can suppress the later row that falsifies it before the model ever sees the change. */
function ideaStoryKeys(row: Pick<IdeaInputRow, 'event_id' | 'dedup_group' | 'headline' | 'headline_orig' | 'event_types'>): string[] {
  return ideaStoryIds(row).map((id) => themeStoryKey({
    event_id: id,
    headline: row.headline_orig || row.headline,
    headline_en: row.headline,
    event_types: row.event_types,
  }))
}

function sameIdeaStory(left: IdeaInputRow, right: IdeaInputRow): boolean {
  const rightKeys = new Set(ideaStoryKeys(right))
  return ideaStoryKeys(left).some((key) => rightKeys.has(key))
}

function dedupeIdeaRows(rows: IdeaInputRow[]): IdeaInputRow[] {
  const tierRank = (tier?: string): number => tier ? SOURCE_TIERS[tier as SourceTierId]?.rank ?? 0 : 0
  const ordered = [...rows].sort((a, b) =>
    tierRank(b.source_tier) - tierRank(a.source_tier)
    || b.materiality - a.materiality
    || parseRfc3339Ms(b.found_at) - parseRfc3339Ms(a.found_at)
    || a.event_id.localeCompare(b.event_id),
  )
  const seenStoryIds = new Set<string>()
  return ordered.filter((row) => {
    const keys = ideaStoryKeys(row)
    if (!row.event_id || keys.some((key) => seenStoryIds.has(key))) return false
    for (const key of keys) seenStoryIds.add(key)
    return true
  })
}

function validThemeRef(theme: unknown): theme is {
  theme_id: string
  rev: number
  description: string
  activity: string
  assessment: { status: string; activity?: string }
  narrative: { thesis: string; why_now: string; why_now_event_id: string }
  evidence: { event_id: string; found_at?: string; stance: 'supports' | 'challenges' }[]
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
} {
  if (!record(theme) || !THEME_ID_RE.test(String(theme.theme_id || '')) || !exactString(theme.description, 500)) return false
  if (!boundedNumber(theme.rev, 1, Number.MAX_SAFE_INTEGER, true)) return false
  if (!record(theme.assessment) || theme.assessment.status !== 'actionable' || theme.activity === 'challenged'
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

type ThemeIdeaFeedSource = Pick<FeedItem, 'event_id' | 'headline' | 'url' | 'source_name' | 'triage_score'>
  & Partial<Pick<FeedItem,
    'headline_en' | 'found_at' | 'region' | 'event_types' | 'issuer_linkage' | 'companies' | 'source_tier'
    | 'scheduled_events' | 'event_direction' | 'dedup_group' | 'rank_factors' | 'event_materiality_label'>>

function memberFeedSource(member: ThemeMember | undefined): ThemeIdeaFeedSource | null {
  if (!member || !member.url?.trim() || !member.source_name?.trim()) return null
  return {
    event_id: member.event_id,
    headline: member.headline,
    headline_en: member.headline_en,
    url: member.url,
    source_name: member.source_name,
    triage_score: member.score,
    found_at: member.found_at,
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
  let evidenceRowsSeen = 0
  for (const theme of themes) {
    if (!validThemeRef(theme) || conflictingThemeIds.has(theme.theme_id)) continue
    const retained = canonical.byRevision.get(canonicalThemeKey(theme.theme_id, theme.rev))
    if ((ledgerPresent && !retained)
      || retained?.narrative?.evidence.some((evidence) => evidence.stance === 'challenges')) continue
    const whyNowEventId = theme.narrative.why_now_event_id
    const proofIds = new Set(theme.qualified_expressions
      .flatMap((expression) => expression.evidence_event_ids)
      .filter((eventId) => eventId !== whyNowEventId))
    // A Theme seed is never one row wearing two hats. The provider sees and must select the causal update
    // and independently bound issuer proof as two exact source rows from one revision.
    if (!proofIds.size) continue
    for (const evidence of theme.evidence) {
      if (!record(evidence) || evidence.stance !== 'supports') continue
      if (evidenceRowsSeen >= MAX_THEME_EVIDENCE_ROWS) break
      const eventId = EVENT_ID_RE.test(String(evidence.event_id || '')) ? String(evidence.event_id) : ''
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
  const days = freshness ? MAX_THEME_FEED_LOOKBACK_DAYS : 2
  const unresolvedIds = new Set([...targetIds].filter((eventId) => !memberFeedSource(canonical.sourcesByEvent.get(eventId))))
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
  const packages = new Map<string, { whyNow: IdeaInputRow | null; proofs: IdeaInputRow[] }>()
  for (const request of requests) {
    const item = memberFeedSource(canonical.sourcesByEvent.get(request.eventId)) || byEvent.get(request.eventId)
    if (!item) continue
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
 * sorted by materiality and capped at `topN`. Daily files are storage partitions, not freshness
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

  interface SweepPartition {
    rows: any[]
    updatedAt: string | null
    updatedMs: number
  }
  const partitionCache = new Map<string, SweepPartition | null>()
  const readPartition = (name: string): SweepPartition | null => {
    if (partitionCache.has(name)) return partitionCache.get(name) ?? null
    let partition: SweepPartition | null = null
    try {
      const doc = JSON.parse(fs.readFileSync(path.join(inboxDir, name), 'utf8'))
      if (Array.isArray(doc?.rows)) {
        const updatedAt = typeof doc.updated_at === 'string' ? doc.updated_at : null
        partition = { rows: doc.rows, updatedAt, updatedMs: parseRfc3339Ms(updatedAt) }
      }
    } catch {}
    partitionCache.set(name, partition)
    return partition
  }
  const partitionDayOverlaps = (name: string, floorMs: number, ceilingMs: number): boolean => {
    const day = name.match(/^(\d{4}-\d{2}-\d{2})_sweep\.json$/)?.[1]
    const start = day ? Date.parse(`${day}T00:00:00Z`) : NaN
    return Number.isFinite(start) && start <= ceilingMs && start + 86_400_000 > floorMs
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
  const noteInvalidPartition = (name: string): void => {
    if (!invalidPartitionNames.has(name)) {
      invalidPartitionNames.add(name)
      invalidTimeCount++
    }
    status = 'degraded'
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
      if (!Number.isFinite(partition.updatedMs)) { noteInvalidPartition(partitionName); continue }
      if (partition.updatedMs < floor || partition.updatedMs > ceiling) continue
      partitions.push(partition)
      if (partition.updatedMs > sweepMs) {
        sweepMs = partition.updatedMs
        sweepUpdatedAt = partition.updatedAt
      }
    }
  }

  const blockedStoryIds = new Set<string>()
  const humanSweepLookback = freshness && Number.isFinite(freshness.maxAgeMs) && freshness.maxAgeMs > 0
    // Human actions have no separate durable clock on every legacy row. Retain the prior bounded
    // partition lookback so a decision just before the source-time floor still blocks a current copy.
    ? Math.max(2, Math.ceil(freshness.maxAgeMs / 86_400_000) + 2)
    : 2
  const humanPartitions: SweepPartition[] = []
  const humanFloor = freshness ? freshness.nowMs - Math.max(1, freshness.maxAgeMs) : Number.NEGATIVE_INFINITY
  const humanCeiling = freshness ? freshness.nowMs + Math.max(0, freshness.futureSkewMs ?? 5 * 60_000) : Number.POSITIVE_INFINITY
  const humanFiles = freshness
    ? [sweepFiles[0], ...sweepFiles.slice(1).filter((name) => partitionDayOverlaps(name, humanFloor, humanCeiling))].slice(0, humanSweepLookback)
    : sweepFiles.slice(0, humanSweepLookback)
  for (const [index, name] of humanFiles.entries()) {
    const partition = index === 0 ? newest : readPartition(name)
    if (!partition) {
      noteInvalidPartition(name)
      continue
    }
    humanPartitions.push(partition)
  }
  // Human state is durable across midnight and deliberately does not inherit candidate freshness. A
  // stale/invalid partition cannot add a positive candidate, but a readable negative decision still
  // vetoes re-entry. This keeps a current publisher copy from reversing a recent human action.
  for (const partition of humanPartitions) {
    for (const row of partition.rows) {
      if (!row || (!row.consumed && !row.dismissed)) continue
      const eventId = typeof row.event_id === 'string' && EVENT_ID_RE.test(row.event_id)
        ? row.event_id
        : typeof row.headline === 'string' && row.headline && typeof row.url === 'string' && row.url
          ? eventIdFor(row.headline, row.url) : ''
      if (!eventId) continue
      for (const key of ideaStoryKeys({
        event_id: eventId,
        dedup_group: typeof row.dedup_group === 'string' && row.dedup_group.trim() ? row.dedup_group.trim() : undefined,
        headline: row.headline_en || row.headline || '',
        headline_orig: row.headline || '',
        event_types: Array.isArray(row.event_types) ? row.event_types : [],
      })) blockedStoryIds.add(key)
    }
  }

  const candidates = partitions
    .flatMap((partition) => partition.rows
      .filter((row) => row && row.url && !row.consumed && !row.dismissed && typeof row.triage_score === 'number')
      .map((row) => ({ row, sweepUpdatedAt: partition.updatedAt || '' })))
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
  const cap = Math.max(1, Math.floor(topN))
  const wireRows = eligible
    .map(({ row: r, sweepUpdatedAt: partitionUpdatedAt }): IdeaInputRow => ({
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
      found_at: r.found_at || partitionUpdatedAt,
      source_tier: r.source_tier,
      scheduled_events: Array.isArray(r.scheduled_events) ? r.scheduled_events : [],
      event_direction: r.event_direction,
      dedup_group: typeof r.dedup_group === 'string' && r.dedup_group.trim() ? r.dedup_group.trim() : undefined,
      origin_type: 'wire',
      source_themes: [],
      theme_expressions: [],
    }))
  // Human state applies to the ordinary wire as well as the Theme reserve. A current unconsumed
  // publisher copy cannot resurrect a prior-day consumed/dismissed canonical event or story alias.
  const ordinaryWireRows = dedupeIdeaRows(wireRows.filter((row) => (
    !ideaStoryKeys(row).some((key) => blockedStoryIds.has(key))
  ))).sort((a, b) => b.materiality - a.materiality || a.event_id.localeCompare(b.event_id)).slice(0, cap)
  const reserveCap = Math.floor(cap / 3)
  // Themes may widen a healthy wire input; they may never manufacture one. In particular, a cached theme
  // must not turn a stale/corrupt sweep or the provider's fewer-than-two-row refusal into a paid call.
  const themeRows = freshness?.themesEnabled !== false && status === 'ok' && ordinaryWireRows.length >= 2 && reserveCap > 0
    ? readActionableThemeRows(repoRoot, freshness, sweepMs).filter((row) => {
      return !ideaStoryKeys(row).some((key) => blockedStoryIds.has(key))
    })
    : []

  // Admission is checked against the ACTUAL final row count, not only `topN`: a sparse two-row wire plus
  // two theme rows would otherwise be half theme even though floor(topN/3) looked safe. Mixed rows count
  // toward the same minority ceiling. A row is mixed only when it independently cleared the ordinary
  // capped wire; matching an uncapped low-tail row is still a theme admission.
  const reserved: IdeaInputRow[] = []
  const projectWith = (themeReserve: IdeaInputRow[]): IdeaInputRow[] => [
    ...themeReserve,
    ...ordinaryWireRows
      .filter((row) => !themeReserve.some((reservedRow) => sameIdeaStory(row, reservedRow)))
      .slice(0, cap - themeReserve.length),
  ]
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
    const candidates = [whyRows[0], proofRows[0]].map((themeRow) => {
      const wireMatch = ordinaryWireRows.find((wireRow) => sameIdeaStory(wireRow, themeRow))
      return wireMatch ? { ...themeRow, origin_type: 'mixed' as const } : themeRow
    })
    if (reserved.length + candidates.length > reserveCap) continue
    const tentative = [...reserved, ...candidates]
    const tentativeRows = projectWith(tentative)
    if (tentative.length <= Math.floor(tentativeRows.length / 3)) reserved.push(...candidates)
  }
  const projected = projectWith(reserved).sort((a, b) => b.materiality - a.materiality)
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
        || fs.existsSync(promotionReservationPath(repoRoot, current.idea_id))) continue
      try { fs.unlinkSync(fp); removed++ } catch { /* best effort */ }
    } finally {
      releaseIdeaMutationLease(fp, lease)
    }
  }
  return removed
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
export interface IdeaPassState { hash: string; effect_hash?: string; ran_at_ms: number }

export function readPassState(stateDir: string): IdeaPassState | null {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(stateDir, 'ideas-pass.json'), 'utf8'))
    if (o && typeof o.hash === 'string'
      && (o.effect_hash === undefined || typeof o.effect_hash === 'string')
      && typeof o.ran_at_ms === 'number') return o as IdeaPassState
  } catch { /* fresh */ }
  return null
}

export function writePassState(stateDir: string, state: IdeaPassState): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, 'ideas-pass.json'), JSON.stringify(state))
  } catch { /* a missed write only risks one redundant pass next tick */ }
}
