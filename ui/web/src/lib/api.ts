import { staticPromptPath } from './prompts'
import type {
  PipelinesRead, PortfolioIdeaCreated, WatchResolveRead, WatchRowInput, WatchlistRead,
} from './types'
import { DEFAULT_RANK_WEIGHTS, type RankWeights, type RankWeightsState } from './rankWeights'
import { QUOTE_CLIENT_TIMEOUT_MS } from './quoteTimeout'
import type { ValuationLeversResponse, ValuationOverride } from './valuationLevers'
import type { AutotuneState, RankWeightChanges, WeightChange } from './types'
import type { BridgeStatus } from './types'
import { parseMemoryRead, parseMemoryRuntimeRead, unavailableMemoryRead } from './memoryView'
import { publishedPaperExecutionResult } from './paperPortfolioView'
import { retryTaskPlanning } from './taskPlanning'
import { CHAT_MODELS, chatModelsReadAfterFailure, normalizeChatModelsRead, type ChatModelsRead } from './chatModels'
import { normalizeProvidersRead, normalizeProviderStatus, providerCatalogForError, providerCatalogUnknown, providerLaunchFields, type FrozenProviderLaunch, type ProviderExecutionProfile, type ProvidersRead, type RunProvider } from './provider'
import type { ActivityQuery, ActivityResult, AddPipelineSourceInput, BuildStep, CallsResult, ChatComputed, ChatConversationDetail, ChatListQuery, ChatListResult, ChatRequest, ChatScopes, CockpitFeedbackCategory, CockpitFeedbackStatus, CockpitFeedbackView, CompletedChatTurn, ContinuationPlanReceipt, CoverageGroup, DataNeedsRead, DataNeedUploadRead, DataScanProgress, DataStatus, DiscoveredFeed, EventEnrichment, EventResearchLink, FeedbackRecord, FeedbackSubmitInput, FeedbackSummary, FeedbackType, FeedItem, IbkrPaperPortfolioRead, IntakePlan, IntensityStats, IntensityWindow, LaunchableRunKind, LaunchPreflight, MemoryRead, MemoryRuntimeRead, NewCompanyInput, NewsChatEvidence, NewsChatReceipt, NewsChatRequest, NewsCycle, NewsDiagnostics, NewsStatus, PaperExecutionResult, PendingAdmission, PipelineAuditEvent, PipelineTrend, PipelineView, QuoteRead, PortfolioManualInput, PortfolioManualRead, PortfolioLiveMark, PortfolioOverrides, PortfolioRead, PortfolioUploadResult, ResumableRunInfo, RunHistoryEntry, RunKind, ScanVerdict, ScreenerBoard, SignalIntakeInput, SignalState, SourcesReport, SwarmGraph, SwarmMeta, SwarmSubjectSummary, ThesisPlan, TickerSummary, UploadResult, Usage, WhatChangedRead, Whoami } from './types'

// Vite supplies `import.meta.env` in the app; standalone tsx regression tests do not.
const BASE = import.meta.env?.BASE_URL || '/'
// The first data-needs read warms filesystem/manifest caches and has been observed at ~14s on the
// always-on host. Keep this bounded, but above that measured cold path so a healthy engine is not
// mistaken for an empty decision contract.
export const DATA_NEEDS_CLIENT_TIMEOUT_MS = 20_000
// A cold Memory read runs two sequential, independently bounded 30s Python commands (project + query).
// The browser must outlast that complete server window; later reads are stale-while-revalidate and fast.
export const MEMORY_CLIENT_TIMEOUT_MS = 65_000
export const REEL_TRANSCRIPT_CLIENT_TIMEOUT_MS = 150_000
export const EXACT_DECISION_LAUNCH_CONTRACT = 'exact-decision-launch/1' as const
let chatModelsPending: Promise<ChatModelsRead> | null = null
export interface ProviderReceiptFields {
  provider?: RunProvider
  executionProfile?: ProviderExecutionProfile
  profileKey?: string
  model?: string
  reasoningLevel?: string
}
export type LaunchResponse = ProviderReceiptFields & { runId: string; preflight: LaunchPreflight; chained?: boolean; skipped?: string[]; planned?: string[]; resumed?: boolean }
export interface QueuedLaunchResponse {
  queued: true
  requestId: string
  status: 'waiting_for_update' | 'admitting' | 'needs_attention'
  ticker: string
  action: 'continue' | 'full'
  sourceRunRoot?: string
  provider: RunProvider
  expectedProfileKey?: string
}
export function isQueuedLaunchResponse(value: unknown): value is QueuedLaunchResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return row.queued === true && typeof row.requestId === 'string'
    && (row.action === 'continue' || row.action === 'full')
    && (row.provider === 'claude' || row.provider === 'codex')
}
export interface ProviderParityCanaryRequest {
  provider: RunProvider
  model: string
  reasoningLevel: string
  expectedProfileKey: string
  runRoot: string
  freezeReceipt: string
}
export interface ProviderParityCanaryStatus {
  runRoot: string
  runId: string | null
  status: 'starting' | 'readiness-checking' | 'awaiting-readiness-decision' | 'running' | 'done' | 'error' | 'cancelled' | 'incomplete' | 'unknown'
  startedAt: number | null
  endedAt: number | null
  provider: RunProvider | null
  profileKey: string | null
  message: string | null
  failureNote: string | null
  interruption: Record<string, unknown> | null
  artifacts: Record<string, boolean>
}

export interface ReelTranscriptRead {
  transcript: string
  sourceUrl: string
  title: string | null
  author: string | null
  durationSeconds: number | null
  language: string | null
}

export const REEL_TRANSCRIPT_PROGRESS_STEPS = [
  'validate-link',
  'prepare-runtime',
  'inspect-reel',
  'download-media',
  'check-media',
  'transcribe-speech',
  'prepare-output',
  'clean-up',
] as const
export type ReelTranscriptProgressStep = typeof REEL_TRANSCRIPT_PROGRESS_STEPS[number]
export interface ReelTranscriptProgressEvent {
  step: ReelTranscriptProgressStep
  status: 'running' | 'complete' | 'failed' | 'warning'
  elapsedMs: number
  stepElapsedMs?: number
  detail?: {
    sourceUrl?: string
    title?: string | null
    author?: string | null
    durationSeconds?: number | null
    bytes?: number
    maxSeconds?: number
    maxBytes?: number
    language?: string | null
    transcriptCharacters?: number
    mediaRemoved?: boolean
  }
}

function isReelTranscriptRead(value: unknown): value is ReelTranscriptRead {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const read = value as Record<string, unknown>
  return typeof read.transcript === 'string' && Boolean(read.transcript.trim())
    && typeof read.sourceUrl === 'string'
    && (read.title === null || typeof read.title === 'string')
    && (read.author === null || typeof read.author === 'string')
    && (read.durationSeconds === null || (typeof read.durationSeconds === 'number' && Number.isFinite(read.durationSeconds) && read.durationSeconds >= 0))
    && (read.language === null || typeof read.language === 'string')
}

function isReelTranscriptProgress(value: unknown): value is ReelTranscriptProgressEvent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const progress = value as Record<string, unknown>
  const detail = progress.detail as Record<string, unknown> | undefined
  const nullableString = (item: unknown) => item === null || typeof item === 'string'
  const nonnegativeNumber = (item: unknown) => typeof item === 'number' && Number.isFinite(item) && item >= 0
  const validDetail = detail === undefined || (
    Boolean(detail) && typeof detail === 'object' && !Array.isArray(detail)
    && (detail.sourceUrl === undefined || typeof detail.sourceUrl === 'string')
    && (detail.title === undefined || nullableString(detail.title))
    && (detail.author === undefined || nullableString(detail.author))
    && (detail.durationSeconds === undefined || detail.durationSeconds === null || nonnegativeNumber(detail.durationSeconds))
    && (detail.bytes === undefined || nonnegativeNumber(detail.bytes))
    && (detail.maxSeconds === undefined || nonnegativeNumber(detail.maxSeconds))
    && (detail.maxBytes === undefined || nonnegativeNumber(detail.maxBytes))
    && (detail.language === undefined || nullableString(detail.language))
    && (detail.transcriptCharacters === undefined || nonnegativeNumber(detail.transcriptCharacters))
    && (detail.mediaRemoved === undefined || typeof detail.mediaRemoved === 'boolean')
  )
  return REEL_TRANSCRIPT_PROGRESS_STEPS.includes(progress.step as ReelTranscriptProgressStep)
    && typeof progress.status === 'string' && ['running', 'complete', 'failed', 'warning'].includes(progress.status)
    && typeof progress.elapsedMs === 'number' && Number.isFinite(progress.elapsedMs) && progress.elapsedMs >= 0
    && (progress.stepElapsedMs === undefined
      || (typeof progress.stepElapsedMs === 'number' && Number.isFinite(progress.stepElapsedMs) && progress.stepElapsedMs >= 0))
    && validDetail
}

// ---- live/static mode detection ----
// Local dev (Fastify backend up) -> live. Cloudflare Pages (no backend) -> static snapshot, read-only.
let mode: 'live' | 'static' | null = null
let snap: any = null
let modeProbe: Promise<'live' | 'static'> | null = null

export async function ensureMode(): Promise<'live' | 'static'> {
  if (mode) return mode
  if (modeProbe) return modeProbe
  modeProbe = (async () => {
    // the live engine server injects this marker into the HTML it serves -> go live
    // immediately, skipping the tunnel-slow /api/health probe (no read-only fallback).
    if (typeof window !== 'undefined' && (window as any).__ENGINE_LIVE__ === true) {
      mode = 'live'
      return mode
    }
    try {
      const r = await fetch('/api/health', { signal: AbortSignal.timeout(6000) })
      if (r.ok) {
        // validate it's really the backend, not an SPA/HTML fallback returning 200
        const j = await r.json().catch(() => null)
        if (j && j.ok === true) {
          mode = 'live'
          return mode
        }
      }
    } catch {}
    try {
      snap = await (await fetch(`${BASE}data/snapshot.json`)).json()
      mode = 'static'
    } catch {
      mode = 'live' // no backend AND no snapshot — surface live errors rather than hide them
    }
    return mode!
  })()
  return modeProbe
}

export function getMode(): 'live' | 'static' | null {
  return mode
}
export function isStatic(): boolean {
  return mode === 'static'
}
// Build time (ISO) of the loaded static snapshot, or null in live mode / before the probe. Lets the
// read-only status chip show "synced Xh ago" so a stale snapshot is never mistaken for live data.
export function snapshotGeneratedAt(): string | null {
  return mode === 'static' && snap && typeof snap.generatedAt === 'string' ? snap.generatedAt : null
}

// Every control-plane GET is time-bounded. A bare fetch with no timeout can hang forever on a dead
// socket (tunnel dropped, laptop asleep mid-request) and, when it gates boot (swarm/tickers), pin the
// whole UI at "connecting". AbortSignal.timeout makes a hang a bounded failure the caller can retry —
// the same pattern the enrich call already uses. Default ~15s covers a cold engine + the tunnel hop +
// heavy JSON; pass a shorter budget for small, frequently-polled endpoints (e.g. news status).
async function get<T>(url: string, timeoutMs = 15_000, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(timeoutMs)
  const r = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout })
  // Carry the status on the error (as post() already does) so a caller can tell "this doesn't exist yet"
  // (404) from "the engine is broken/unreachable" (500, timeout) instead of guessing from the message.
  if (!r.ok) throw Object.assign(new Error(`${r.status} ${url}`), { status: r.status })
  return r.json() as Promise<T>
}
async function staticOutput(path: string): Promise<{ path: string; markdown: string }> {
  const r = await fetch(`${BASE}data/${path}`)
  if (!r.ok) throw new Error('not found')
  return { path, markdown: await r.text() }
}
async function post<T>(url: string, body?: any, timeoutMs?: number, signal?: AbortSignal): Promise<T> {
  // Only set the JSON content-type when there's actually a body. A bodyless POST (cancel, credit-check)
  // sent WITH content-type: application/json makes Fastify reject it 400 FST_ERR_CTP_EMPTY_JSON_BODY
  // before the route even runs — the real cause of the "cancel didn't work" bug.
  const r = await fetch(url, {
    method: 'POST',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: timeoutMs && signal
      ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
      : signal || (timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error((j as any)?.message || (j as any)?.error || `${r.status}`), { status: r.status, body: j })
  return j as T
}

async function paperCommand(url: string, confirmation: 'SYNC PAPER' | 'CANCEL PAPER' | 'CLOSE PAPER', action: PaperExecutionResult['action']): Promise<PaperExecutionResult> {
  const raw = await post<unknown>(url, { confirmation, idempotency_key: crypto.randomUUID() }, 30_000)
  const result = publishedPaperExecutionResult(raw, action)
  if (!result) throw new Error('IBKR Paper returned an incomplete command receipt. Refresh the portfolio before trying anything else.')
  return result
}

async function put<T>(url: string, body?: any): Promise<T> {
  const r = await fetch(url, {
    method: 'PUT',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error((j as any)?.error || `${r.status}`), { status: r.status, body: j })
  return j as T
}

async function del<T>(url: string): Promise<T> {
  const r = await fetch(url, { method: 'DELETE' })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error((j as any)?.error || `${r.status}`), { status: r.status, body: j })
  return j as T
}

async function patch<T>(url: string, body?: any, timeoutMs?: number): Promise<T> {
  const r = await fetch(url, {
    method: 'PATCH',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error((j as any)?.error || `${r.status}`), { status: r.status, body: j })
  return j as T
}

const STATIC_ERR = () => Object.assign(new Error('static-deploy'), { static: true })

// Manual evidence is a write surface, so deploy skew must fail closed. TypeScript types do not validate
// a response from an older or malformed server; positively match the immutable selected-call binding and
// the small status vocabulary before the cockpit renders it or offers a follow-on read.
export function validDataNeedUploadRead(
  value: unknown,
  selected: DataNeedsRead,
  needId: string,
  series: string,
): value is DataNeedUploadRead {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const v = value as Record<string, any>
  if (v.contract_version !== 'data-need-upload/1' || v.subject !== selected.subject || v.swarm !== selected.swarm
      || v.run_root !== selected.run_root || v.decision_fingerprint !== selected.decision_fingerprint
      || v.need_id !== needId || v.series !== series
      || !['none', 'staged_waiting', 'routed_provenance_verified', 'rejected_policy', 'failed_tampered'].includes(v.status)
      || !Array.isArray(v.items)) return false
  const itemOk = v.items.every((item: any) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)
        || !/^DNU-[a-f0-9]{32}$/.test(item.request_id)
        || typeof item.filename !== 'string' || !item.filename || item.filename.length > 255
        || !/^[a-f0-9]{64}$/.test(item.sha256)
        || typeof item.staged_at !== 'string' || !Number.isFinite(Date.parse(item.staged_at))) return false
    const routed = item.routed_path !== undefined
    const failed = item.reason !== undefined
    if (routed && (typeof item.routed_path !== 'string' || !item.routed_path.startsWith('data/')
        || item.routed_path.includes('\\') || item.routed_path.split('/').includes('..'))) return false
    if (failed && !['malformed_request', 'tampered_request', 'routing_failed', 'policy_rejected'].includes(item.reason)) return false
    return !(routed && failed)
  })
  if (!itemOk) return false
  if (v.status === 'none') return v.items.length === 0
  if (!v.items.length) return false
  // The ledger is append-only and the top-level status belongs to the newest request. Validate that
  // exact relationship; an older successful route may legitimately precede a newer policy rejection.
  const latest = [...v.items].sort((a: any, b: any) => a.staged_at.localeCompare(b.staged_at)
    || a.request_id.localeCompare(b.request_id)).at(-1)
  if (v.status === 'routed_provenance_verified') return typeof latest.routed_path === 'string'
  if (v.status === 'staged_waiting') return latest.routed_path === undefined && latest.reason === undefined
  if (v.status === 'rejected_policy') return latest.routed_path === undefined && latest.reason === 'policy_rejected'
  return latest.routed_path === undefined && latest.reason !== undefined && latest.reason !== 'policy_rejected'
}

/**
 * Read an SSE body off a fetch (the browser's EventSource is GET-only, and several of these streams are
 * POSTs). One reader for every pipeline stream — frame splitting, the trailing partial frame, multi-line
 * `data:`, and AbortError-silence are the kind of details that go subtly wrong when copied per call site.
 * `onFrame` returns 'stop' to end the read early (a terminal frame); onError is never called for the
 * caller's own abort.
 */
async function readSse(
  url: string,
  init: RequestInit,
  signal: AbortSignal,
  onFrame: (event: string, data: any) => 'stop' | void,
  onError: (msg: string) => void,
  onEnd?: () => void,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch (e: any) {
    if (e?.name !== 'AbortError') onError(e?.message || 'network error')
    return
  }
  if (!res.ok || !res.body) {
    let msg = `${res.status}`
    try { const j = await res.json(); msg = (j as any)?.error || msg } catch { /* keep the status */ }
    onError(msg)
    return
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const frames = buf.split('\n\n')
      buf = frames.pop() ?? '' // keep the trailing partial frame
      for (const frame of frames) {
        let ev = 'message'
        let data = ''
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) ev = line.slice(6).trim()
          else if (line.startsWith('data:')) data += line.slice(5).trim()
        }
        if (!data) continue
        let parsed: any
        try { parsed = JSON.parse(data) } catch { continue }
        if (onFrame(ev, parsed) === 'stop') return
      }
    }
    onEnd?.()
  } catch (e: any) {
    if (e?.name !== 'AbortError' && !signal.aborted) onError(e?.message || 'stream interrupted')
  }
}

const EMPTY_WATCHLIST: WatchlistRead = {
  rows: [], archived: [], engine_source: { file: null, generated_at: null }, unreadable: [],
  quotes_enabled: false, as_of: '',
}
const EMPTY_BOARD: ScreenerBoard = { generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], counts: {}, live: [] }
const EMPTY_FEEDBACK_SUMMARY: FeedbackSummary = { total: 0, active_total: 0, by_type: {} as Record<FeedbackType, number>, top_reasons: [], clustered_reasons: [], generated_at: '' }

// ---- archive search + facets (the whole-history filtered read) ----
/** The structured filter sent to /api/news/search + /api/news/facets. Geography is country-level. */
export interface ArchiveQuery {
  themes?: string[]
  country?: string // ISO alpha-2
  geoRegion?: string // continent group
  source?: string
  band?: string
  size?: string
  linkage?: string
  gicsSector?: string
  gicsSubSector?: string
  scope?: string // exact scope bucket (server news/scope.ts) — a wire swarm's declared eventScope
  commodities?: string[] // canonical commodity subjects (server news/commodities.ts) — OR within the set
  topics?: string[] // CapIQ-style subject topics (server news/topics.ts) — OR within the set
  scheduledEvents?: string[] // forward/scheduled corporate events (server news/schedule.ts) — OR within the set
  wireScope?: string // wire-membership disjunction: scope equals this OR the item carries a commodity tag
  // Pick-a-company filter (the ticker autofill): match items tagged with this exact ticker OR whose
  // headline/company blob contains this name OR any of its known aliases. Sending BOTH (the picked
  // suggestion carries both) is the reliable path — the ticker catches items the name misses and
  // vice-versa. `companyAliases` carries other spellings the archive has tagged for the same ticker (e.g. a
  // short form like "Amazon" alongside "Amazon.com Inc."), so an untagged item using a less-common spelling
  // still matches (Codex review, PR #317). Any of ticker/name/an alias alone still matches.
  companyTicker?: string
  companyName?: string
  companyAliases?: string[]
  // the company's OTHER listing symbols from the global directory (a pick of the ADR NHYDY carries Oslo's
  // NHY.OL), matched exactly or on the exchange-suffix-stripped base — distinct from companyAliases, which
  // are NAME spellings
  companyTickerAliases?: string[]
  // when the picked facet has a definite listing_country, an item's own definite listing_country for that
  // ticker must not disagree — tells apart two different issuers reusing the same ticker letters on
  // different exchanges (e.g. NYSE:CAT Caterpillar vs ASX:CAT Catapult Group International). Unknown on
  // either side is never a conflict (Codex review, PR #319).
  companyListingCountry?: string
  text?: string
  // The companies the free-text keyword turns out to NAME — the ticker→company reading of `text`, resolved
  // from the archive company facet (components/screener/CompanyFilter.resolveKeywordCompanies). The keyword
  // box is a literal substring search, so a typed symbol only ever reached the minority of items whose tag
  // carried that symbol ("amzn" → 44 of the archive's 198 Amazon items; "amazon" → all 198). Sent so the
  // server widens the text clause the same way the browser does — OR'd with the literal match, never
  // replacing it. Structurally a CompanyPick; typed inline so lib/ never imports from components/.
  textAs?: { ticker: string | null; name: string; aliases?: string[]; listingCountry?: string | null }[]
}
export interface SearchCursor {
  ts: string
  id: string
  scanDate?: string
  scanShard?: number
  scanLine?: number
}
export interface FeedSearchResponse {
  items: FeedItem[]
  nextCursor: SearchCursor | null
  scannedThroughDate: string | null // oldest day scanned — "searched all history back to <date>"
  exhausted: boolean // true = reached the archive floor (genuinely nothing older)
}
// One company resolved by the GLOBAL symbol directory (GET /api/news/symbols — server news/symbology.ts):
// the primary symbol for what was typed plus every sibling listing as an alias, so ANY country's ticker
// finds the company. Empty on an old server or offline — the autofill degrades to the archive facet.
export interface SymbolGroup { name: string; symbol: string; exchange: string; aliases: string[] }

export interface FacetCount { key: string; label: string; count: number; parent?: string }
// A distinct company observed on the wire, with how many archived items mention it — the source for the
// company/ticker autofill. `ticker` is null for a name-only guess the scanner never resolved a symbol for.
// `aliases`: other spellings the archive has tagged for the same ticker (most-mentioned first, capped),
// carried through the pick so an item using a less-common spelling still matches (server news/facets.ts).
// Optional (not just possibly-empty) so an older server response — or a test fixture — that omits it still
// type-checks; callers treat a missing `aliases` the same as an empty one.
// `listingCountry`: the definite listing_country the archive agrees on for this identity, or null/absent
// when unknown or mixed. Two mentions sharing ticker LETTERS but proven to be different issuers (disagreeing
// definite countries) arrive as SEPARATE CompanyFacet rows — this is what lets a pick (and the ticker match)
// tell them apart (Codex review, PR #319).
export interface CompanyFacet { ticker: string | null; name: string; count: number; aliases?: string[]; listingCountry?: string | null }
export interface FeedFacets {
  countries: FacetCount[] // parent = continent
  regions: FacetCount[] // continents
  sectors: FacetCount[]
  subSectors: FacetCount[] // parent = sector
  sources: FacetCount[]
  themes: FacetCount[]
  topics?: FacetCount[] // CapIQ-style subject topics (server news/topics.ts) — optional: absent on old servers
  scheduledEvents?: FacetCount[] // forward/scheduled corporate events (server news/schedule.ts) — optional
  companies?: CompanyFacet[] // distinct companies on the wire, for the ticker autofill — optional: absent on old servers
  total: number
  builtThroughDate: string | null
  builtAt: string
}

// The forward events calendar (server news/events-calendar.ts). Mirrors the server CalendarSnapshot.
export interface CalendarEvent {
  id: string
  kind: 'earnings' | 'macro'
  date: string // ISO YYYY-MM-DD
  time: string | null // 'bmo' | 'amc' | 'HH:MM' | null
  region: string // US | IN | ...
  title: string // company (earnings) or indicator (macro)
  ticker: string | null
  detail: string | null
  importance: 'high' | 'medium' | 'low' | null // macro
  source: string // nasdaq | nse | bea
}
export interface CalendarHealth { source: string; ok: boolean; at: string | null; count: number; note?: string }
export interface CalendarSnapshot {
  as_of: string
  stale: boolean
  window: { from: string; to: string }
  events: CalendarEvent[]
  health: CalendarHealth[]
}

function archiveQueryParams(q: ArchiveQuery): URLSearchParams {
  const p = new URLSearchParams()
  if (q.themes?.length) p.set('themes', q.themes.join(','))
  if (q.country) p.set('country', q.country)
  if (q.geoRegion) p.set('geoRegion', q.geoRegion)
  if (q.source) p.set('source', q.source)
  if (q.band) p.set('band', q.band)
  if (q.size) p.set('size', q.size)
  if (q.linkage) p.set('linkage', q.linkage)
  if (q.gicsSector) p.set('gicsSector', q.gicsSector)
  if (q.gicsSubSector) p.set('gicsSubSector', q.gicsSubSector)
  if (q.scope) p.set('scope', q.scope)
  if (q.commodities?.length) p.set('commodities', q.commodities.join(','))
  if (q.topics?.length) p.set('topics', q.topics.join(','))
  if (q.scheduledEvents?.length) p.set('scheduledEvents', q.scheduledEvents.join(','))
  if (q.wireScope) p.set('wireScope', q.wireScope)
  if (q.companyTicker?.trim()) p.set('companyTicker', q.companyTicker.trim())
  if (q.companyName?.trim()) p.set('companyName', q.companyName.trim())
  // '|' not ',' — some tagged company names contain a comma; see the matching split in feed-filter.ts
  if (q.companyAliases?.length) p.set('companyAliases', q.companyAliases.join('|'))
  if (q.companyTickerAliases?.length) p.set('companyTickerAliases', q.companyTickerAliases.join(',')) // ',' fine — symbols never contain commas
  if (q.companyListingCountry) p.set('companyListingCountry', q.companyListingCountry)
  if (q.text?.trim()) p.set('text', q.text.trim())
  // one json param, not a delimiter split: this is a LIST of company objects, and any separator scheme would
  // need a nested one and would break on the first company name containing it (the server bounds + validates
  // it, and falls back to plain literal text on anything malformed)
  if (q.textAs?.length) p.set('textAs', JSON.stringify(q.textAs))
  return p
}

/** The static-mode stand-in for the provisional layer. A shape, never a claim: an artefact-only build
 *  has no engine to hold hand-logged fills, and returning nothing at all would make the caller guess. */
const EMPTY_MANUAL: PortfolioManualRead = { trades: [], live: 0, superseded: 0, effects: [] }
const EMPTY_OVERRIDES: PortfolioOverrides = { cashEquivalents: [] }

export const api = {
  // One bounded, read-only view over the shared research memory. Static hosting returns an explicit
  // unavailable state without touching the network; deploy skew or a malformed response fails closed.
  memory: async (): Promise<MemoryRead> => {
    if ((await ensureMode()) === 'static') return unavailableMemoryRead()
    const read = parseMemoryRead(await get<unknown>('/api/memory', MEMORY_CLIENT_TIMEOUT_MS))
    if (!read) throw Object.assign(new Error('The live engine returned an unsupported memory view.'), { code: 'memory-contract-invalid' })
    return read
  },
  memoryRuntime: async (): Promise<MemoryRuntimeRead | null> => {
    if ((await ensureMode()) === 'static') return null
    const read = parseMemoryRuntimeRead(await get<unknown>('/api/memory/runtime', MEMORY_CLIENT_TIMEOUT_MS))
    if (!read) throw Object.assign(new Error('The live engine returned an unsupported memory runtime view.'), { code: 'memory-runtime-contract-invalid' })
    return read
  },
  reelTranscript: async (url: string, signal?: AbortSignal): Promise<ReelTranscriptRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post<ReelTranscriptRead>('/api/tools/reel-transcript', { url }, REEL_TRANSCRIPT_CLIENT_TIMEOUT_MS, signal)
  },
  reelTranscriptLive: async (
    url: string,
    onProgress: (progress: ReelTranscriptProgressEvent) => void,
    signal?: AbortSignal,
  ): Promise<ReelTranscriptRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const requestSignal = signal
      ? AbortSignal.any([signal, AbortSignal.timeout(REEL_TRANSCRIPT_CLIENT_TIMEOUT_MS)])
      : AbortSignal.timeout(REEL_TRANSCRIPT_CLIENT_TIMEOUT_MS)
    let result: ReelTranscriptRead | null = null
    let failure: Error | null = null
    await readSse(
      '/api/tools/reel-transcript',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
        body: JSON.stringify({ url }),
        signal: requestSignal,
      },
      requestSignal,
      (event, parsed) => {
        if (event === 'reel-progress') {
          if (isReelTranscriptProgress(parsed)) onProgress(parsed)
          return
        }
        if (event === 'reel-result') {
          if (isReelTranscriptRead(parsed?.result)) result = parsed.result
          else failure = Object.assign(new Error('The engine returned an unsupported transcript.'), { code: 'transcription-contract-invalid' })
          return 'stop'
        }
        if (event === 'reel-error') {
          const message = typeof parsed?.error === 'string' && parsed.error.trim()
            ? parsed.error
            : 'The Reel could not be transcribed. Try again.'
          failure = Object.assign(new Error(message), {
            status: typeof parsed?.status === 'number' ? parsed.status : undefined,
            body: { code: typeof parsed?.code === 'string' ? parsed.code : 'transcription-failed' },
          })
          return 'stop'
        }
      },
      (message) => {
        const readable = message === 'engine-offline'
          ? 'The live engine connection was interrupted before transcription started. Wait a moment and try again.'
          : message || 'The live update was interrupted.'
        failure = new Error(readable)
      },
      () => { if (!result && !failure) failure = new Error('The live update ended before the transcript was ready.') },
    )
    if (result) return result
    if (signal?.aborted) throw signal.reason || new DOMException('The operation was aborted.', 'AbortError')
    if (requestSignal.aborted) throw requestSignal.reason || new DOMException('The operation was aborted.', 'AbortError')
    throw failure || new Error('The live update ended before the transcript was ready.')
  },
  swarm: async (ticker?: string): Promise<SwarmGraph> => {
    if ((await ensureMode()) === 'static') return snap.swarmGraph
    return get<SwarmGraph>(`/api/swarm${ticker ? `?ticker=${encodeURIComponent(ticker)}` : ''}`)
  },
  // ---- swarms (the switcher) + the screener swarm's surface ----
  swarms: async (): Promise<SwarmMeta[]> => {
    if ((await ensureMode()) === 'static') return snap.swarms || [{ id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' }]
    return get<SwarmMeta[]>(`/api/swarms`)
  },
  swarmGraph: async (swarmId: string, subject?: string): Promise<SwarmGraph> => {
    if ((await ensureMode()) === 'static') {
      if (swarmId === 'research' || !snap.swarmGraphs?.[swarmId]) return snap.swarmGraph
      return snap.swarmGraphs[swarmId]
    }
    if (swarmId === 'research') return get<SwarmGraph>(`/api/swarm`)
    return get<SwarmGraph>(`/api/swarm?swarm=${encodeURIComponent(swarmId)}${subject ? `&subject=${encodeURIComponent(subject)}` : ''}`)
  },
  // The per-subject pulse snapshot (price / positioning / next reports / last verdict) for a swarm whose
  // manifest declares `wire.pulse`. 404 (→ null) when undeclared or on an old server — the pulse strip
  // simply doesn't render (fail-closed). Static showcase: no engine → null.
  swarmPulse: async (swarmId: string): Promise<import('./wire').WirePulseSnapshot | null> => {
    if ((await ensureMode()) === 'static') return null
    try {
      return await get<import('./wire').WirePulseSnapshot>(`/api/swarm/pulse?swarm=${encodeURIComponent(swarmId)}`)
    } catch {
      return null // undeclared / old server / transient — absence, never an error surface
    }
  },
  // Subjects of a non-research constellation swarm (e.g. commodity) for its subject picker. Research
  // uses tickers(). Returns both the plain name list (used for the wire's subject grouping) AND the
  // per-subject run summaries (verdict/confidence/date) so the picker can show runs like research does.
  // Static showcase: the bundled snapshot lists (or empty); `summaries` may be absent on an older snapshot.
  swarmSubjects: async (swarmId: string): Promise<{ subjects: string[]; summaries: SwarmSubjectSummary[] }> => {
    if ((await ensureMode()) === 'static') {
      return { subjects: snap.swarmSubjects?.[swarmId] || [], summaries: snap.swarmSubjectSummaries?.[swarmId] || [] }
    }
    const r = await get<{ swarm: string; subjects: string[]; summaries?: SwarmSubjectSummary[] }>(`/api/swarm/subjects?swarm=${encodeURIComponent(swarmId)}`)
    return { subjects: r.subjects || [], summaries: r.summaries || [] }
  },
  screenerBoard: async (): Promise<ScreenerBoard> => {
    if ((await ensureMode()) === 'static') return snap.screenerBoard || EMPTY_BOARD
    return get<ScreenerBoard>(`/api/screener/board`)
  },
  screenerRun: async (sigId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.screenerRuns?.[sigId] || null
    return get(`/api/screener/run?sig_id=${encodeURIComponent(sigId)}`)
  },
  signalState: async (p: { headline: string; sourceUrl?: string }): Promise<SignalState> => {
    if ((await ensureMode()) === 'static') return { sigId: '', state: 'never', running: false }
    const qs = new URLSearchParams({ headline: p.headline })
    if (p.sourceUrl) qs.set('source_url', p.sourceUrl)
    return get<SignalState>(`/api/screener/signal-state?${qs.toString()}`)
  },
  screenerThesis: async (thesisId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.screenerTheses?.[thesisId] || null
    return get(`/api/screener/thesis/${encodeURIComponent(thesisId)}`)
  },
  screenerCandidates: async (thesisId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.screenerCandidates?.[thesisId] || null
    return get(`/api/screener/candidates/${encodeURIComponent(thesisId)}`)
  },
  launchSignal: async (selection: FrozenProviderLaunch, body: { sigId?: string; intake?: SignalIntakeInput; inboxId?: string; until?: string; override?: boolean }): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, { kind: 'signal', ...body, ...providerLaunchFields(selection) })
  },
  launchSweep: async (selection: FrozenProviderLaunch): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, { kind: 'sweep', ...providerLaunchFields(selection) })
  },
  // Escalate a PM-skim idea into the paid gauntlet ("Run the full machine"). The server maps the idea to a
  // signal intake and launches it through the normal signal path.
  promoteIdea: async (ideaId: string, selection: FrozenProviderLaunch): Promise<ProviderReceiptFields & { sigId: string; runId: string | null; alreadyPromoted?: boolean; preflight?: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/ideas/${encodeURIComponent(ideaId)}/promote`, providerLaunchFields(selection))
  },
  // 👍/👎 a surfaced idea (self-grading loop). 'clear' un-votes.
  rateIdea: async (ideaId: string, polarity: 'up' | 'down' | 'clear', reason?: string): Promise<{ ok: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/ideas/${encodeURIComponent(ideaId)}/feedback`, { polarity, ...(reason ? { reason } : {}) })
  },
  // ---- the news wire (auto-scanner visibility + human actions) ----
  // The company-news bridge's status (running / routed-note counts / next sweep). Read-only decoration:
  // the static showcase reports an honest "off" rather than failing the chip.
  bridgeStatus: async (): Promise<BridgeStatus> => {
    if ((await ensureMode()) === 'static')
      return { mode: 'off', running: false, sweeping: false, intervalMin: 720, subjects: [], totalNotes: 0, lastSweepAt: null, nextSweepAt: null, last: null, idleReason: 'read-only showcase', manifestError: null }
    return get(`/api/bridge/status`, 8_000) // small + polled every 60s, same budget as the news status
  },
  newsStatus: async (): Promise<NewsStatus> => {
    if ((await ensureMode()) === 'static')
      return { enabled: false, running: false, intervalMin: 15, model: '', rssEnabled: false, lastCycleAt: null, nextCycleAt: null, lastNote: null, today: { read: 0, kept: 0, dropped: 0, cycles: 0 }, budget: { requests: 0, tokens: 0, reqCap: 0, tokenCap: 0 } }
    return get(`/api/news/status`, 8_000) // small + polled every 60s — a short budget keeps the rail snappy
  },
  // The FULL pipeline diagnostics: every triage tier's budget + health + cooldown, the deferred backlog vs
  // its active work window, the last cycle's flow, and the honest defer reason. Backs the Pipeline diagnostics
  // panel. Read-only + fail-soft server-side; a short budget keeps the panel poll snappy.
  newsDiagnostics: async (): Promise<NewsDiagnostics> => {
    if ((await ensureMode()) === 'static')
      return { ts: new Date().toISOString(), enabled: false, running: false, readOnly: false, intervalMin: 15, lastCycleAt: null, nextCycleAt: null, tiers: [], backlog: { count: 0, cap: 0, pctOfCap: 0, nearLimit: false, trend: null, lostToday: 0, retiredToday: 0 }, today: { read: 0, kept: 0, dropped: 0, cycles: 0 }, lastCycle: null, defer: { active: false, reason: null, plainNote: null, lastResort: null, blockingTiers: [] } }
    return get(`/api/news/diagnostics`, 8_000)
  },
  newsDiagnosticsTrend: async (from: string, to: string, bucket = 'auto'): Promise<PipelineTrend> => {
    if ((await ensureMode()) === 'static') return { from, to, bucketMs: 3_600_000, timezone: 'UTC', coverage: { complete: false, missingPipelineDays: [], missingFirehoseDays: [], corruptRows: 0, unreadableDays: [], truncated: false }, buckets: [], providers: [] }
    const query = new URLSearchParams({ from, to, bucket })
    return get(`/api/news/diagnostics/trend?${query.toString()}`, 15_000)
  },
  newsDiagnosticsTrendEvents: async (from: string, to: string, providerId = '', cursor = '', limit = 250): Promise<{ events: PipelineAuditEvent[]; nextCursor: string | null; coverage: { corruptRows: number; unreadableDays: string[]; truncated: boolean } }> => {
    if ((await ensureMode()) === 'static') return { events: [], nextCursor: null, coverage: { corruptRows: 0, unreadableDays: [], truncated: false } }
    const query = new URLSearchParams({ from, to, limit: String(Math.min(250, Math.max(1, limit))) })
    if (providerId) query.set('providerId', providerId)
    if (cursor) query.set('cursor', cursor)
    return get(`/api/news/diagnostics/trend/events?${query.toString()}`, 15_000)
  },
  newsSources: async (): Promise<SourcesReport> => {
    if ((await ensureMode()) === 'static') return { updated_at: new Date().toISOString(), counts: { total: 0, healthy: 0, quiet: 0, failing: 0, idle: 0 }, sources: [] }
    return get(`/api/news/sources`)
  },
  // Optional filters (the same ArchiveQuery keys /search takes) apply server-side at the read site, so a
  // wire swarm's scoped backfill (e.g. scope=commodity) still fills its window (matches are counted, not
  // raw lines). No filters → byte-identical to the unfiltered read on any server version.
  newsFeed: async (days = 2, q?: ArchiveQuery): Promise<{ items: FeedItem[]; cycles: NewsCycle[] }> => {
    if ((await ensureMode()) === 'static') return { items: [], cycles: [] }
    const p = q ? archiveQueryParams(q) : new URLSearchParams()
    p.set('days', String(Math.max(1, Math.floor(days))))
    return get(`/api/news/feed?${p.toString()}`)
  },
  // Archive-spanning, server-filtered search over the WHOLE since-inception archive (not the 2-day wire).
  // Recency-ordered, loss-free cursor paging. Empty in static showcase mode (no engine).
  newsSearch: async (q: ArchiveQuery, opts: { cursor?: SearchCursor | null; limit?: number } = {}): Promise<FeedSearchResponse> => {
    if ((await ensureMode()) === 'static') return { items: [], nextCursor: null, scannedThroughDate: null, exhausted: true }
    const p = archiveQueryParams(q)
    if (opts.cursor) {
      p.set('cursorTs', opts.cursor.ts)
      p.set('cursorId', opts.cursor.id)
      if (opts.cursor.scanDate !== undefined) p.set('cursorScanDate', opts.cursor.scanDate)
      if (opts.cursor.scanShard !== undefined) p.set('cursorScanShard', String(opts.cursor.scanShard))
      if (opts.cursor.scanLine !== undefined) p.set('cursorScanLine', String(opts.cursor.scanLine))
    }
    if (opts.limit) p.set('limit', String(opts.limit))
    return get(`/api/news/search?${p.toString()}`)
  },
  // The available geographies (country + continent) / sectors / sub-sectors / sources / themes WITH COUNTS
  // over the whole archive, honouring the active filter — what populates the dropdowns with archive truth.
  // The server builds this archive-wide index off-thread and pre-warms the unfiltered response. Keep the
  // larger timeout for a cold deploy or a new filtered context: a slow recount may delay dropdown counts,
  // but it can no longer freeze unrelated server requests or erase independently-returned search results.
  newsFacets: async (q: ArchiveQuery = {}): Promise<FeedFacets> => {
    if ((await ensureMode()) === 'static') return { countries: [], regions: [], sectors: [], subSectors: [], sources: [], themes: [], companies: [], total: 0, builtThroughDate: null, builtAt: '' }
    return get(`/api/news/facets?${archiveQueryParams(q).toString()}`, 45_000)
  },
  // The GLOBAL symbol directory behind the company autofill — resolves ANY country's ticker (or a name)
  // to its company with the full cross-listing alias set. Fail-closed to [] on a 404 (old server), static
  // mode, or any transient failure, so the autofill degrades to the archive facet + free-typed matching.
  symbolSearch: async (q: string): Promise<SymbolGroup[]> => {
    if ((await ensureMode()) === 'static') return []
    try {
      const r = await get<{ groups: SymbolGroup[] }>(`/api/news/symbols?q=${encodeURIComponent(q)}`, 8_000)
      return Array.isArray(r.groups) ? r.groups : []
    } catch {
      return []
    }
  },
  newsStreamUrl: () => `/api/news/stream`,
  // The forward EVENTS CALENDAR (server news/events-calendar.ts): upcoming earnings (Nasdaq US + NSE India)
  // + macro (BEA US). 404 (→ null) when disabled or on an old server — the Calendar tab hides itself then.
  calendar: async (): Promise<CalendarSnapshot | null> => {
    if ((await ensureMode()) === 'static') return null
    try { return await get<CalendarSnapshot>('/api/calendar') } catch { return null }
  },
  // the global scoring weights behind every event's triage score (the Scoring panel reads + writes these).
  // Static showcase: no engine → hand back the bundled defaults so the panel still renders + previews.
  rankWeights: async (): Promise<RankWeightsState> => {
    if ((await ensureMode()) === 'static') return { active: DEFAULT_RANK_WEIGHTS, defaults: DEFAULT_RANK_WEIGHTS, customised: false }
    return get<RankWeightsState>(`/api/news/rank-weights`)
  },
  saveRankWeights: async (body: Partial<RankWeights> | { reset: true }): Promise<RankWeightsState> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return put<RankWeightsState>(`/api/news/rank-weights`, body)
  },
  // AUTO-TUNE — the append-only history of automatic weight changes + the pause/pins the loop obeys, a
  // one-click revert, and a manual "run now". Static showcase has no engine → empty history, unpaused.
  rankWeightChanges: async (): Promise<RankWeightChanges> => {
    if ((await ensureMode()) === 'static') return { changes: [], autotune: { paused: false, pins: [], daily: { date: '', count: 0 } } }
    return get<RankWeightChanges>(`/api/news/rank-weights/changes`)
  },
  revertRankWeightChange: async (id: string): Promise<{ ok: boolean; reverted: WeightChange; active: RankWeights }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/news/rank-weights/changes/${encodeURIComponent(id)}/revert`)
  },
  setAutotune: async (body: { paused?: boolean; pins?: string[] }): Promise<AutotuneState> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return put<AutotuneState>(`/api/news/rank-weights/autotune`, body)
  },
  // Valuation Playground — the levers a run emitted (valuation_summary.json) + the frozen decision
  // scenarios, and the append-only what-if override ledger. Recompute is client-side (valuationLevers.ts).
  valuationLevers: async (ctx: { ticker?: string; runRoot?: string }): Promise<ValuationLeversResponse> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const p = new URLSearchParams()
    if (ctx.runRoot) p.set('runRoot', ctx.runRoot)
    else if (ctx.ticker) p.set('ticker', ctx.ticker)
    return get<ValuationLeversResponse>(`/api/valuation-levers?${p.toString()}`)
  },
  saveValuationOverride: async (body: { runRoot: string; reason?: string; overrides?: Record<string, unknown>; levels?: Record<string, number> }): Promise<{ ok: boolean; override: ValuationOverride; overrides: ValuationOverride[] }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/valuation-levers/override`, body)
  },
  // One-pass scoped rerun of the intake plan (the New-data dock's confirm strip). The server re-reads and
  // re-validates the plan itself. The exact run root + decision fingerprint bind the click to the call
  // the user reviewed; the client still never sends orb lists.
  runIntakePlan: async (
    ticker: string, swarm: string, runRoot: string, decisionFingerprint: string,
    plan: { planPath: string; planSha256: string; sourceDecisionFingerprint: string },
    selection: FrozenProviderLaunch,
  ): Promise<{ runId: string; preflight: LaunchPreflight; carried: { module: string; from: string }[]; scoped: { module: string; omittedOrbs: string[]; synthesisOnly: boolean }[]; staleModules: string[]; chained?: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/intake-plan/run-exact`, { ticker, swarm, runRoot, decisionFingerprint, ...plan, ...providerLaunchFields(selection) })
  },
  // the living themes the firehose is bucketed into (ranked index + one theme's deep-dive). An optional
  // geography (country ISO alpha-2 and/or continent) slices the SAME themes to that geography's news flow —
  // the server re-ranks + re-sizes them — so the "Where" picker narrows the Themes view like the Events list.
  // An optional wire slice (scope=commodity, or one canonical subject) composes with the geography —
  // the server re-ranks + re-sizes the SAME themes by that slice's news flow (themes/commodity-index.ts).
  newsThemes: async (geo?: { country?: string; geoRegion?: string }, slice?: { scope?: string; commodity?: string }): Promise<import('./themes').ThemesIndex> => {
    if ((await ensureMode()) === 'static') return { generated_at: '', themes: [], counts: { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 }, history_days: 0 }
    const p = new URLSearchParams()
    if (geo?.country) p.set('country', geo.country)
    if (geo?.geoRegion) p.set('geoRegion', geo.geoRegion)
    if (slice?.scope) p.set('scope', slice.scope)
    if (slice?.commodity) p.set('commodity', slice.commodity)
    const qs = p.toString()
    return get(`/api/news/themes${qs ? `?${qs}` : ''}`)
  },
  newsTheme: async (id: string, geo?: { country?: string; geoRegion?: string }, slice?: { scope?: string; commodity?: string }): Promise<import('./themes').ThemeDetail | null> => {
    if ((await ensureMode()) === 'static') return null
    const p = new URLSearchParams()
    if (geo?.country) p.set('country', geo.country)
    if (geo?.geoRegion) p.set('geoRegion', geo.geoRegion)
    if (slice?.scope) p.set('scope', slice.scope)
    if (slice?.commodity) p.set('commodity', slice.commodity)
    const qs = p.toString()
    return get(`/api/news/themes/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`)
  },
  // The opened theme's plain-English brief — a few sentences on what it's about and what's happening.
  // Generated on the host by one free Groq pass (cached, degrading to a headline synthesis); the static
  // showcase has no model, so it returns null and the deep-dive falls back to the one-line description.
  newsThemeBrief: async (id: string, force = false): Promise<import('./themes').ThemeBrief | null> => {
    if ((await ensureMode()) === 'static') return null
    return get(`/api/news/themes/${encodeURIComponent(id)}/brief${force ? '?force=1' : ''}`)
  },
  // On-demand enrichment for ONE opened event: the real story (read from the article body by one free
  // Groq pass), parsed SEC filing items, prior coverage of the named companies, and related events.
  // No CLAUDE spend (the body-read uses the free Groq key, paced + budgeted alongside the scanner).
  enrichEvent: async (it: Pick<FeedItem, 'event_id' | 'url' | 'headline' | 'companies' | 'event_types' | 'scope' | 'ts'>): Promise<EventEnrichment> => {
    if ((await ensureMode()) === 'static') return { event_id: it.event_id, ok: false, fetched_at: new Date().toISOString(), prior_coverage: [], related: [], note: 'Read-only showcase — enrichment runs on your machine.' }
    const qs = new URLSearchParams({ event_id: it.event_id })
    if (it.url) qs.set('url', it.url)
    if (it.headline) qs.set('headline', it.headline)
    // the row's timestamp, so the server opens THIS event's archive day directly instead of hoping the
    // record is inside its recent-wire window. An older server ignores the unknown param (zod strips it).
    if (it.ts) qs.set('ts', it.ts)
    if (it.companies?.length) qs.set('companies', JSON.stringify(it.companies))
    if (it.event_types?.length) qs.set('event_types', JSON.stringify(it.event_types))
    if (it.scope) qs.set('scope', it.scope)
    // The server caps its own work at ~23s worst case (≤9s page fetch + ≤14s LLM budget). A client timeout
    // a little above that guarantees the reader never waits on a dead socket forever — on a timeout the
    // store falls back to a headline-only story rather than spinning the shimmer. (The default get() has no
    // timeout — the bug that let the shimmer hang.)
    const url = `/api/news/enrich?${qs.toString()}`
    const r = await fetch(url, { signal: AbortSignal.timeout(28_000) })
    if (!r.ok) throw new Error(`${r.status} ${url}`)
    return r.json() as Promise<EventEnrichment>
  },
  inboxAction: async (inboxId: string, action: 'dismiss' | 'restore'): Promise<{ ok: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/inbox/action`, { inboxId, action })
  },
  thesisMove: async (thesisId: string, to: 'watchlist' | 'provisional' | 'full_machine' | 'engine', reason?: string): Promise<{ ok: boolean; effective_status: string | null }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/thesis/${encodeURIComponent(thesisId)}/move`, { to, reason })
  },
  convictionRestore: async (thesisId: string): Promise<{ ok: boolean; message?: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/conviction/${encodeURIComponent(thesisId)}/restore`, {})
  },
  hideSignal: async (signalId: string, action: 'hide' | 'restore'): Promise<{ ok: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/signal/${encodeURIComponent(signalId)}/hide`, { action })
  },
  // force a board rebuild from the live ledger (picks up runs that finished since the last snapshot)
  rebuildBoard: async (): Promise<ScreenerBoard> => {
    if ((await ensureMode()) === 'static') return snap.screenerBoard || EMPTY_BOARD
    return post<ScreenerBoard>(`/api/screener/board/rebuild`, {})
  },
  submitFeedback: async (input: FeedbackSubmitInput): Promise<{ ok: boolean; feedback: FeedbackRecord }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/feedback`, input)
  },
  undoFeedback: async (feedbackId: string): Promise<{ ok: boolean; undone: FeedbackRecord }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/feedback/${encodeURIComponent(feedbackId)}/undo`, {})
  },
  feedbackSummary: async (): Promise<FeedbackSummary> => {
    if ((await ensureMode()) === 'static') return EMPTY_FEEDBACK_SUMMARY
    return get<FeedbackSummary>(`/api/screener/feedback/summary`)
  },
  coveredTickers: async (): Promise<string[]> => {
    if ((await ensureMode()) === 'static') return []
    const { tickers } = await get<{ tickers: string[] }>(`/api/screener/covered-tickers`)
    return tickers
  },

  // ---- cockpit-wide product feedback ----
  listFeedback: async (): Promise<CockpitFeedbackView[]> => {
    if ((await ensureMode()) === 'static') return []
    const { items } = await get<{ items: CockpitFeedbackView[] }>(`/api/feedback`)
    return items
  },
  // multipart (text + category + url + up to N screenshots) via XHR so the composer can show progress.
  submitCockpitFeedback: async (
    input: { text: string; category: CockpitFeedbackCategory; url: string; images: File[] },
    onProgress?: (frac: number) => void,
  ): Promise<{ ok: boolean; feedback: any; imageErrors: { filename: string; reason: string }[] }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const fd = new FormData()
    fd.append('text', input.text)
    fd.append('category', input.category)
    fd.append('url', input.url)
    for (const f of input.images) fd.append('images', f, f.name)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/feedback`)
      if (onProgress) xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total) }
      xhr.onload = () => {
        let j: any = {}
        try { j = JSON.parse(xhr.responseText) } catch { /* non-JSON error body */ }
        if (xhr.status >= 200 && xhr.status < 300) resolve(j)
        else reject(Object.assign(new Error(j?.error || `${xhr.status}`), { status: xhr.status }))
      }
      xhr.onerror = () => reject(new Error('network error'))
      xhr.send(fd)
    })
  },
  feedbackImageUrl: (feedbackId: string, name: string): string =>
    `/api/feedback/${encodeURIComponent(feedbackId)}/image/${encodeURIComponent(name)}`,
  setFeedbackStatus: async (feedbackId: string, status: CockpitFeedbackStatus, note?: string): Promise<{ ok: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/feedback/${encodeURIComponent(feedbackId)}/status`, { status, ...(note ? { note } : {}) })
  },
  dispatchFeedback: async (feedbackId: string): Promise<{ ok: boolean; status: string; message: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/feedback/${encodeURIComponent(feedbackId)}/dispatch`, {})
  },
  // Send/retry the resolution email to a resolved item's reporter (the "Notify reporter" card action).
  notifyFeedback: async (feedbackId: string): Promise<{ ok: boolean; reason?: string; recipient?: string; detail?: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/feedback/${encodeURIComponent(feedbackId)}/notify`, {})
  },
  screenerCalibration: async (): Promise<any | null> => {
    if ((await ensureMode()) === 'static') return snap.screenerCalibration || null
    return get<any>(`/api/screener/calibration`)
  },
  cancelAllRuns: async (): Promise<{ ok: boolean; cancelled: string[] }> => {
    if ((await ensureMode()) === 'static') return { ok: true, cancelled: [] }
    return post(`/api/runs/cancel-all`)
  },
  handoff: async (thesisId: string, ticker: string, selection: FrozenProviderLaunch): Promise<ProviderReceiptFields & { alreadyHandedOff: boolean; runId?: string; handoff?: any; preflight?: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/handoff`, { thesisId, ticker, ...providerLaunchFields(selection) })
  },
  // ---- wire event → research data bridge (event-level twin of the thesis handoff above) ----
  // Which tracked subjects this event was already routed to. Fail-closed to [] (old server / static).
  eventResearchLinks: async (eventId: string): Promise<EventResearchLink[]> => {
    if ((await ensureMode()) === 'static') return []
    try {
      const r = await get<{ links: EventResearchLink[] }>(`/api/screener/event/${encodeURIComponent(eventId)}/research-links`, 8_000)
      return Array.isArray(r.links) ? r.links : []
    } catch {
      return []
    }
  },
  // Route the event into one tracked subject's data pool. The server builds the note from ITS stored
  // wire record (never client fields), dedupes syndicated copies of the same story (duplicateOf), and
  // — for a fresh send — launches the advisory intake analysis (analyzing) so the quality gate runs
  // before anything re-runs.
  sendEventToResearch: async (eventId: string, ticker: string, selection: FrozenProviderLaunch): Promise<ProviderReceiptFields & { ok: boolean; path: string; already: boolean; duplicateOf?: string; analyzing?: boolean; swarm?: string | null; launch?: ProviderReceiptFields & { runId: string; preflight: LaunchPreflight } }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/event/${encodeURIComponent(eventId)}/send-to-research`, { ticker, ...providerLaunchFields(selection) })
  },
  tickers: async (): Promise<{ tickers: TickerSummary[]; emptyState: boolean; dataDir?: string; driveEnabled?: boolean; coverage?: CoverageGroup[] }> => {
    if ((await ensureMode()) === 'static') return { tickers: snap.tickers, emptyState: snap.emptyState, dataDir: snap.dataDir, driveEnabled: false, coverage: snap.defaultCoverage || [] }
    return get(`/api/tickers`)
  },
  // Create a company = a <TICKER> folder plus its immutable legal-listing identity in the shared Drive
  // (the server writes them; they sync back down to the local mount the engine reads). Throws with
  // e.body.{error,suggested} on a bad or duplicate identity.
  addCompany: async (input: NewCompanyInput): Promise<{ ok: boolean; ticker: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/tickers`, input)
  },
  // Upload documents into a company's Drive folder. Uses XHR (not fetch) so the dropzone can show upload
  // progress; onProgress reports 0..1 of the whole request body. Resolves with per-file {written,errors}.
  uploadFiles: async (ticker: string, files: File[], onProgress?: (frac: number) => void): Promise<UploadResult> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const fd = new FormData()
    for (const f of files) fd.append('files', f, f.name)
    return new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/tickers/${encodeURIComponent(ticker)}/files`)
      // do NOT set content-type — the browser sets the multipart boundary itself
      xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total) }
      xhr.onload = () => {
        let body: any = {}
        try { body = JSON.parse(xhr.responseText || '{}') } catch {}
        if (xhr.status >= 200 && xhr.status < 300) resolve(body as UploadResult)
        else reject(Object.assign(new Error(body?.error || body?.fileErrors?.[0]?.reason || `${xhr.status}`), { status: xhr.status, body }))
      }
      xhr.onerror = () => reject(new Error('network error during upload'))
      xhr.send(fd)
    })
  },
  // Time-windowed intake intensity for the screener ThemeMap (small server-side aggregates).
  screenerIntensity: async (window: IntensityWindow): Promise<IntensityStats> => {
    if ((await ensureMode()) === 'static') return { window, from: null, to: new Date().toISOString(), scans: 0, totalFetched: 0, ratePerSec: 0, byTier: {}, hourly: [] }
    return get(`/api/screener/intensity?window=${encodeURIComponent(window)}`)
  },
  dataStatus: async (ticker: string, signal?: AbortSignal, onProgress?: (progress: DataScanProgress) => void): Promise<DataStatus> => {
    if ((await ensureMode()) === 'static') return snap.dataStatus[ticker] || { ticker, hasAnyData: false, fileCount: 0, files: [], recentByType: {}, modules: {}, coverage: [], overallReady: false, dataDir: snap.dataDir }
    const encoded = encodeURIComponent(ticker)
    const started = await post<{ progress: DataScanProgress | null }>(`/api/data-status/${encoded}/scan`, undefined, 8_000, signal)
    if (started.progress) onProgress?.(started.progress)
    // Poll small snapshots instead of holding one fragile request open for an entire cold Drive scan.
    // The SSE carries live progress; this loop only retrieves the final result for the store.
    for (;;) {
      const read = await get<{
        status: 'not_started' | 'running' | 'ready' | 'failed'
        progress: DataScanProgress | null
        data: DataStatus | null
      }>(`/api/data-status/${encoded}/result`, 8_000, signal)
      if (read.progress) onProgress?.(read.progress)
      if (read.status === 'ready' && read.data) return read.data
      if (read.status === 'failed') throw new Error(read.progress?.error || 'The data scan stopped.')
      await new Promise<void>((resolve, reject) => {
        const onAbort = () => { clearTimeout(timer); reject(signal?.reason || new DOMException('The operation was aborted.', 'AbortError')) }
        const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve() }, 750)
        if (signal?.aborted) { clearTimeout(timer); reject(signal.reason); return }
        signal?.addEventListener('abort', onAbort, { once: true })
      })
    }
  },
  dataStatusResult: async (ticker: string): Promise<DataStatus | null> => {
    if ((await ensureMode()) === 'static') return snap.dataStatus[ticker] || null
    const read = await get<{ status: string; data: DataStatus | null }>(`/api/data-status/${encodeURIComponent(ticker)}/result`, 8_000)
    return read.status === 'ready' ? read.data : null
  },
  credit: async (): Promise<Usage> => {
    if ((await ensureMode()) === 'static') return { ok: true, checked: false }
    return get(`/api/credit`, 8_000)
  },
  creditCheck: async (): Promise<Usage> => {
    if ((await ensureMode()) === 'static') return { ok: true, checked: false }
    return post(`/api/credit-check`)
  },
  providers: async (): Promise<ProvidersRead> => {
    if ((await ensureMode()) === 'static') return providerCatalogUnknown('Provider launches are unavailable in the read-only showcase.')
    try {
      const read = await get<unknown>(`/api/providers`, 8_000)
      return normalizeProvidersRead(read)
        || providerCatalogUnknown('The provider catalogue response was malformed. Check again after the server is updated.')
    } catch (error) {
      return providerCatalogForError(error)
    }
  },
  providerCheck: async (provider: RunProvider): Promise<ProvidersRead[RunProvider]> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const raw = await post<unknown>(`/api/providers/${provider}/check`)
    const status = normalizeProviderStatus(raw, provider)
    if (!status) throw new Error(`Invalid ${provider} provider status`)
    return status
  },
  estimate: async (
    kind: LaunchableRunKind,
    ticker: string,
    selection: FrozenProviderLaunch,
    module?: string,
    agent?: string,
    swarm?: string,
    exactDecision?: {
      runRoot: string
      decisionFingerprint: string
      planPath?: string
      planSha256?: string
      sourceDecisionFingerprint?: string
    },
  ): Promise<LaunchPreflight> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const fields = providerLaunchFields(selection)
    const qs = new URLSearchParams({ kind, ticker, provider: fields.provider })
    if (fields.expectedProfileKey) qs.set('expectedProfileKey', fields.expectedProfileKey)
    if (fields.model) qs.set('model', fields.model)
    if (fields.reasoningLevel) qs.set('reasoningLevel', fields.reasoningLevel)
    if (module) qs.set('module', module)
    if (agent) qs.set('agent', agent)
    if (swarm) qs.set('swarm', swarm)
    if (exactDecision) {
      qs.set('runRoot', exactDecision.runRoot)
      qs.set('decisionFingerprint', exactDecision.decisionFingerprint)
      if (exactDecision.planPath) qs.set('planPath', exactDecision.planPath)
      if (exactDecision.planSha256) qs.set('planSha256', exactDecision.planSha256)
      if (exactDecision.sourceDecisionFingerprint) qs.set('sourceDecisionFingerprint', exactDecision.sourceDecisionFingerprint)
    }
    return get(`/api/launch/estimate?${qs.toString()}`)
  },
  launch: async (body: { selection: FrozenProviderLaunch; kind: LaunchableRunKind; ticker: string; module?: string; agent?: string; window?: string; confirmTicker?: string; requestId?: string; force?: boolean; swarm?: string; runRoot?: string; decisionFingerprint?: string }): Promise<LaunchResponse> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    if (body.kind === 'rerun') throw new Error('exact reruns require the versioned launch endpoint')
    const { selection, ...request } = body
    return post(`/api/launch`, { ...request, ...providerLaunchFields(selection) })
  },
  // Versioned exact-rerun path. Never fall back to /api/launch: an older server must 404 rather than
  // ignore runRoot/fingerprint and spend against a different current call during rolling deploy skew.
  launchExact: async (body: { selection: FrozenProviderLaunch; kind: 'rerun'; ticker: string; module: string; agent: string; force?: boolean; swarm?: string; runRoot: string; decisionFingerprint: string; planPath?: string; planSha256?: string; sourceDecisionFingerprint?: string }): Promise<LaunchResponse> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const { selection, ...request } = body
    return post(`/api/launch/exact`, { ...request, ...providerLaunchFields(selection) })
  },
  cancel: async (runId: string) => {
    if ((await ensureMode()) === 'static') return {}
    return post(`/api/runs/${runId}/cancel`)
  },
  // Stop a whole subject's in-flight work (a chained full run + its live module step). Used by the run
  // panel's Cancel so a chain stops reliably even when the followed runId has already ended as it advanced.
  cancelSubject: async (swarm: string, subject: string): Promise<{ ok: boolean; cancelled: string[] }> => {
    if ((await ensureMode()) === 'static') return { ok: true, cancelled: [] }
    return post(`/api/runs/subject/${encodeURIComponent(swarm)}/${encodeURIComponent(subject)}/cancel`)
  },
  readinessDecision: async (runId: string, action: string, acknowledgedText?: string): Promise<{ ok: boolean; status: string }> => {
    if ((await ensureMode()) === 'static') return { ok: false, status: 'static' }
    return post(`/api/runs/${encodeURIComponent(runId)}/readiness-decision`, { action, acknowledgedText })
  },
  output: async (path: string): Promise<{ path: string; markdown: string }> => {
    if ((await ensureMode()) === 'static') return staticOutput(path)
    // screener artifacts are served by their own sandboxed reader; analyses/ keeps /api/output
    if (path.startsWith('screener/')) return get(`/api/screener/output?path=${encodeURIComponent(path)}`)
    return get(`/api/output?path=${encodeURIComponent(path)}`)
  },
  // A Calls row must open the same published Git bytes used to build that row, never mutable local disk.
  callArtifact: async (path: string): Promise<{ path: string; markdown: string }> => {
    if ((await ensureMode()) === 'static') return staticOutput(path)
    return get(`/api/calls/artifact?path=${encodeURIComponent(path)}`)
  },
  // Read-only prompt surface (agent definitions / module rules / constitution). Works in both modes:
  // live -> the engine's sandboxed /api/prompt; static -> the bundled snapshot under data/prompts/.
  prompt: async (path: string): Promise<{ path: string; markdown: string }> => {
    if ((await ensureMode()) === 'static') {
      const r = await fetch(`${BASE}data/${staticPromptPath(path)}`)
      if (!r.ok) throw new Error('not found')
      return { path, markdown: await r.text() }
    }
    return get(`/api/prompt?path=${encodeURIComponent(path)}`)
  },
  // research: an explicit runRoot opens THAT run's thesis/decision (a run-history pick, or the just-finished
  // run on a live refresh); without it the ticker resolves server-side to its standing run. Keeps the
  // manifest and the decision/thesis reads on the SAME run instead of mixing an older run's verdict in.
  thesis: async (ticker: string, swarm?: string, runRoot?: string): Promise<{ path: string; markdown?: string }> => {
    if ((await ensureMode()) === 'static') {
      const p = snap.finalThesis?.[ticker]
      if (!p) throw new Error('no thesis')
      return { path: p }
    }
    // a constellation swarm resolves its subject's terminal deliverable (the dossier) by swarm+subject
    if (swarm && swarm !== 'research') return get(`/api/output/thesis?swarm=${encodeURIComponent(swarm)}&subject=${encodeURIComponent(ticker)}`)
    return get(`/api/output/thesis?${runRoot ? `runRoot=${encodeURIComponent(runRoot)}` : `ticker=${encodeURIComponent(ticker)}`}`)
  },
  decision: async (ticker: string, swarm?: string, runRoot?: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.decisions[ticker]
    if (swarm && swarm !== 'research') return get(`/api/output/decision?swarm=${encodeURIComponent(swarm)}&subject=${encodeURIComponent(ticker)}`)
    return get(`/api/output/decision?${runRoot ? `runRoot=${encodeURIComponent(runRoot)}` : `ticker=${encodeURIComponent(ticker)}`}`)
  },
  runManifest: async (ticker: string, runRoot?: string, swarm?: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.runs[ticker]
    // a constellation swarm resolves its subject's run folder; else a runRoot targets that EXACT run
    // folder (older activity rows) and a ticker resolves the latest research run.
    const qs = swarm && swarm !== 'research'
      ? `swarm=${encodeURIComponent(swarm)}&subject=${encodeURIComponent(ticker)}`
      : runRoot ? `runRoot=${encodeURIComponent(runRoot)}` : `ticker=${encodeURIComponent(ticker)}`
    return get(`/api/output/run?${qs}`)
  },
  // cross-ticker call ledger + since-the-call timelines (the Calls Tracker). Static -> bundled snapshot.
  calls: async (): Promise<CallsResult> => {
    if ((await ensureMode()) === 'static') return {
      calls: snap.calls || [], scorecard: snap.scorecard, dashboard: snap.dashboard || null,
      needs_attention: snap.needsAttention || [], updates: snap.callUpdates || [],
    }
    return get(`/api/calls`)
  },
  paperPortfolio: async (): Promise<IbkrPaperPortfolioRead> => {
    if ((await ensureMode()) === 'static') return {
      schema_version: 'ibkr-paper-portfolio/v2', broker: 'IBKR', mode: 'paper', status: 'disabled', paper_only: true,
      as_of: new Date(0).toISOString(), connection: { host: 'localhost', port: 7497, detail: 'IBKR Paper is available only in the live cockpit.' },
      account: null, open_orders: [],
      history: {
        schema_version: 'nostra-paper-history/v2', available: false, unit: 'normalized_nav', starting_value: 100, present_value: 100,
        cash_value: 100, invested_value: 0, total_return_pct: 0, calls_examined: 0, non_trade_calls: 0,
        trade_calls: 0, open_trades: 0, closed_trades: 0,
        rules: { low_conviction_weight_pct: 5, high_conviction_weight_pct: 10, high_conviction_min_confidence: 75, eligible_baskets: ['Selected', 'Short'], provisional_calls_trade: false },
        call_states: [], trades: [], blocked_calls: [], detail: 'Open the live cockpit to replay published calls.',
      },
      target: { valid: false, source_path: null, generated_at: new Date(0).toISOString(), gross_pct: null, cash_pct: null, positions: [], blocked_calls: [], detail: 'The static showcase cannot build a broker target.' },
      reconciliation: { status: 'unavailable', differences: [], detail: 'Open the live cockpit to compare IBKR Paper with Nostra’s sized book.' },
      execution: { status: 'locked', can_execute: false, automatic: { enabled: false, last_attempt: null }, low_conviction_weight_pct: 5, high_conviction_weight_pct: 10, high_conviction_min_confidence: 75, detail: 'Paper execution is available only in the live cockpit.' },
    }
    return get('/api/calls/paper-portfolio')
  },
  paperPortfolioSync: async (): Promise<PaperExecutionResult> => paperCommand('/api/calls/paper-portfolio/sync', 'SYNC PAPER', 'sync'),
  paperOrderCancel: async (orderId: number): Promise<PaperExecutionResult> => paperCommand(`/api/calls/paper-orders/${encodeURIComponent(orderId)}/cancel`, 'CANCEL PAPER', 'cancel'),
  paperPositionClose: async (contractId: number): Promise<PaperExecutionResult> => paperCommand(`/api/calls/paper-positions/${encodeURIComponent(contractId)}/close`, 'CLOSE PAPER', 'close'),
  // ---- fund book (the REAL portfolio, fed by IBKR Flex exports) ----
  portfolio: async (): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') {
      return { statements: [], book: null, performance: null, manual: EMPTY_MANUAL, overrides: EMPTY_OVERRIDES, error: null }
    }
    return get('/api/portfolio')
  },
  uploadStatements: async (files: File[], onProgress?: (frac: number) => void): Promise<PortfolioUploadResult> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const fd = new FormData()
    for (const f of files) fd.append('file', f, f.name)
    // XHR rather than fetch: a year of statement is megabytes, and upload progress is the difference
    // between "is it working?" and a visible bar.
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/portfolio/statements')
      if (onProgress) xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total) }
      xhr.onload = () => {
        let j: any = {}
        try { j = JSON.parse(xhr.responseText) } catch { /* non-JSON error body */ }
        if (xhr.status >= 200 && xhr.status < 300) resolve(j as PortfolioUploadResult)
        else reject(Object.assign(new Error(j?.error || `upload failed (${xhr.status})`), { status: xhr.status, body: j }))
      }
      xhr.onerror = () => reject(new Error('upload failed — the engine did not respond'))
      xhr.send(fd)
    })
  },
  deleteStatement: async (id: string): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return del(`/api/portfolio/statements/${encodeURIComponent(id)}`)
  },
  // Hand-logged fills for the gap since the last export. Provisional by construction — the engine keeps
  // them out of the book, and marks them answered once a statement covers their date.
  logManualTrade: async (entry: PortfolioManualInput): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/manual', entry)
  },
  deleteManualTrade: async (id: string): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return del(`/api/portfolio/manual/${encodeURIComponent(id)}`)
  },
  clearSupersededManual: async (): Promise<PortfolioRead & { cleared: number }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/manual/clear-superseded')
  },
  /** The gap between the last statement and today, priced at the market. A SECOND read on purpose —
   *  the book is broker-tied and synchronous, this needs the network and ties to nothing. */
  portfolioLive: async (): Promise<PortfolioLiveMark> => {
    if ((await ensureMode()) === 'static') {
      return { asOf: null, asOfIsClose: true, delayed: true, stale: false, bookAsOf: null, staleDays: null,
        nav: null, unrealised: null, cash: null, priced: [], unpriced: [], unavailable: 'not available here' }
    }
    return get('/api/portfolio/live')
  },
  /** Declare a holding a cash equivalent (a T-bill ETF is cash with a ticker), or take it back. */
  setCashEquivalent: async (symbol: string, isCash: boolean): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/cash-equivalent', { symbol, isCash })
  },
  /** Name a new idea. Idempotent on the slug, so re-adding "Sugar" returns the existing one. */
  createIdea: async (label: string): Promise<PortfolioIdeaCreated> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/idea', { label })
  },
  renameIdea: async (id: string, label: string): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/idea/rename', { id, label })
  },
  deleteIdea: async (id: string): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/idea/delete', { id })
  },
  /** Label a HOLDING, or clear it with null. */
  setHoldingIdea: async (symbol: string, ideaId: string | null): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/idea/holding', { symbol, ideaId })
  },
  /** Label a CLOSED ROUND TRIP by every broker trade id behind it, or clear it with null. */
  setTradeIdea: async (closeTradeIDs: string[], ideaId: string | null): Promise<PortfolioRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post('/api/portfolio/idea/trade', { closeTradeIDs, ideaId })
  },

  history: async (ticker: string): Promise<{ history: RunHistoryEntry[] }> => {
    if ((await ensureMode()) === 'static') return { history: [] }
    return get(`/api/runs?ticker=${encodeURIComponent(ticker)}`)
  },
  activeRuns: async (): Promise<{ active: import('./types').ActiveRunLite[] }> => {
    if ((await ensureMode()) === 'static') return { active: [] }
    return get(`/api/runs`)
  },
  runSnapshot: async (runId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') throw new Error('static')
    return get(`/api/runs/${encodeURIComponent(runId)}`)
  },
  // Every run the cockpit can resume right now (disk-truth). Static showcase has no engine → empty.
  resumable: async (): Promise<{ runs: ResumableRunInfo[] }> => {
    if ((await ensureMode()) === 'static') return { runs: [] }
    return get(`/api/resumable`, 8_000)
  },

  // ---- complete the thesis ----
  // Recomputed from disk on every call — the panel must never show a stale picture of what already exists,
  // because that picture is what decides whether the user pays to re-run a finished module.
  // `reuse` re-prices the plan for a chosen selection. Omit it for the safe default (reuse what is finished
  // AND current). The server prices every selection — the client never does its own cost math, so the number
  // on the button is always the number the launcher will charge.
  thesisPlan: async (ticker: string, selection: FrozenProviderLaunch, swarm?: string, reuse?: string[], module?: string, runRoot?: string): Promise<ThesisPlan> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const q = new URLSearchParams({ ticker })
    const fields = providerLaunchFields(selection)
    q.set('provider', fields.provider)
    if (fields.expectedProfileKey) q.set('expectedProfileKey', fields.expectedProfileKey)
    if (fields.model) q.set('model', fields.model)
    if (fields.reasoningLevel) q.set('reasoningLevel', fields.reasoningLevel)
    if (swarm && swarm !== 'research') q.set('swarm', swarm)
    if (reuse) q.set('reuse', reuse.join(',')) // '' is meaningful: reuse nothing, run everything
    // A module heading asks the server for its exact, server-owned saved-input scope. This is distinct from
    // the full-thesis reuse picker: an older valid upstream synthesis may be usable as a disclosed input even
    // when a newer partial attempt means that upstream is not reusable as a whole completed module.
    if (module) q.set('module', module)
    if (runRoot) q.set('runRoot', runRoot)
    return get(`/api/thesis-plan?${q}`, 12_000)
  },
  // `reuse` = the modules to carry forward rather than re-run. Everything else in the graph runs. The
  // server re-validates this against its own plan, so a stale client can never smuggle a stale module in.
  runThesisPlan: async (
    ticker: string,
    reuse: string[],
    swarm: string,
    selection: FrozenProviderLaunch,
    requestId: string,
    continuationReceipt: ContinuationPlanReceipt,
    sourceRunRoot?: string,
  ): Promise<{ runId: string; preflight: LaunchPreflight; carried: { module: string; from: string }[]; reused: string[]; willRun: string[]; chained?: boolean; skipped?: string[]; planned?: string[] }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    // `swarm` is ALWAYS sent (never omitted for research), so the server can match positively on it rather
    // than treat an absent field as permission to dispatch a research pipeline at another swarm's subject.
    return post(`/api/thesis-plan/run`, {
      ticker, reuse, swarm, requestId, continuationReceipt, sourceRunRoot,
      ...providerLaunchFields(selection),
    })
  },
  // Launch ONE module of the plan (the RUN pill), resuming from the orbs on disk. `reuse` governs which
  // ancestors get carried into the target root first. Returns the done/planned orb split so the cockpit
  // lights up "N done / M queued" instead of a false from-scratch start.
  runThesisPlanModule: async (
    ticker: string,
    module: string,
    reuse: string[],
    swarm: string,
    expectedWillRun: number,
    expectedDoneOrbKeys: string[],
    expectedTargetRunRoot: string,
    poolFiles: number,
    poolNewestMs: number,
    selection: FrozenProviderLaunch,
    sourceRunRoot?: string,
    requestId?: string,
    continuationReceipt?: ContinuationPlanReceipt,
  ): Promise<{ runId: string; preflight: LaunchPreflight; module: string; willRun: number; doneOrbKeys: string[]; carried: { module: string; from: string }[]; resumed?: boolean; ranClean?: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/thesis-plan/module`, {
      ticker,
      module,
      reuse,
      swarm,
      planVersion: 2,
      expectedWillRun,
      expectedDoneOrbKeys,
      expectedTargetRunRoot,
      poolFiles,
      poolNewestMs,
      sourceRunRoot,
      requestId,
      continuationReceipt,
      ...providerLaunchFields(selection),
    })
  },

  // Retry only the final Git publication for an already-finished exact-resume module. The server binds the
  // request to its durable marker + current module bytes and never calls the research launcher here.
  publishThesisPlanModule: async (
    ticker: string,
    module: string,
    swarm: string,
    targetRunRoot: string,
    expectedFingerprint: string,
  ): Promise<{ published: true }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/thesis-plan/module/publish`, {
      ticker,
      module,
      swarm,
      targetRunRoot,
      expectedFingerprint,
    })
  },

  // ---- document intake (the scoped rerun plan, frameworks/INTAKE.md) ----
  // The latest scoped plan for a ticker (roster-validated + downstream re-expanded server-side), or null
  // when there's no run/plan yet. A 404 / old server / static deploy → null (fail-closed: the cockpit then
  // shows the honest staleness floor, never a fabricated plan).
  intake: async (ticker: string, swarm: string, runRoot?: string, decisionFingerprint?: string): Promise<IntakePlan | null> => {
    if ((await ensureMode()) === 'static') return null
    try {
      const qs = new URLSearchParams({ swarm })
      if (runRoot) qs.set('runRoot', runRoot)
      if (decisionFingerprint) qs.set('decisionFingerprint', decisionFingerprint)
      const r = await get<{ plan: IntakePlan | null }>(`/api/intake/${encodeURIComponent(ticker)}?${qs}`, DATA_NEEDS_CLIENT_TIMEOUT_MS)
      return r.plan ?? null
    } catch {
      return null
    }
  },
  // Trigger the cheap, advisory analysis that (re)writes the scoped plan. Launches NO rerun (reruns stay a
  // human one-click). Returns the run id of the doc-intake run.
  analyzeIntake: async (ticker: string, swarm: string, selection: FrozenProviderLaunch, runRoot?: string, decisionFingerprint?: string): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const qs = new URLSearchParams({ swarm })
    if (runRoot) qs.set('runRoot', runRoot)
    if (decisionFingerprint) qs.set('decisionFingerprint', decisionFingerprint)
    return post(`/api/intake/${encodeURIComponent(ticker)}/analyze-exact?${qs}`, providerLaunchFields(selection))
  },

  // ---- data needs (the "surface a data gap → build a durable connector → re-score" loop) ----
  // The structured data_needs[] the run's terminal synthesizer surfaced, roster-validated server-side, or
  // null when there's no run/record. 404 / old server / static → null (fail-closed: the dock stays hidden).
  // The git-history delta for ONE run. runRoot targets the EXACT run on screen — selectTicker(t, runRoot)
  // honours a run-history pick, so a ticker-only fetch would describe a DIFFERENT run than the banner.
  // Any failure (404 on an older engine mid-deploy, static mode) -> null -> the chip stays hidden.
  whatChanged: async (ticker: string, runRoot?: string): Promise<WhatChangedRead | null> => {
    if ((await ensureMode()) === 'static') return null
    try {
      const qs = runRoot ? `?runRoot=${encodeURIComponent(runRoot)}` : ''
      const r = await get<{ read: WhatChangedRead | null }>(`/api/what-changed/${encodeURIComponent(ticker)}${qs}`, 8_000)
      return r.read ?? null
    } catch {
      return null
    }
  },

  // ---- live market price for the run on screen ----
  // Where the price is NOW, plus the call re-based onto it. runRoot targets the EXACT run the banner is
  // showing, for the same reason whatChanged does: a ticker-only fetch could describe a different run's
  // entry price. A static snapshot has no live feed by definition, and an older engine mid-deploy 404s —
  // both return null, and the banner then renders exactly as it did before this feature existed.
  // ---- watchlist ----
  // Reads degrade to an empty list in the static showcase; every write throws so the caller can say
  // "this needs the live engine" rather than silently appearing to work.
  watchlist: async (): Promise<WatchlistRead> => {
    // The showcase carries the list but NO prices and no trigger states — see build-snapshot.mjs. A
    // baked "condition met" would be a build-time assertion rendered as a current one.
    if ((await ensureMode()) === 'static') return (snap.watchlist as WatchlistRead) || EMPTY_WATCHLIST
    return get<WatchlistRead>('/api/watchlist', 20_000)
  },
  watchResolve: async (q: string): Promise<WatchResolveRead> => {
    if ((await ensureMode()) === 'static') return { query: q, candidates: [], reason: 'directory_unavailable' }
    return get<WatchResolveRead>(`/api/watchlist/resolve?q=${encodeURIComponent(q)}`, 12_000)
  },
  watchCreate: async (input: WatchRowInput) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    // `publish_error` is set when the row saved to disk but the serialized commit/push to git (CLAUDE.md
    // §25/§28 — watchlist/** is data) failed, e.g. the sandbox has no writable git remote. The row is
    // never lost (it is still readable from the local file), but it has not left this machine yet.
    return post<{ ok: boolean; publish_error?: string }>('/api/watchlist', input)
  },
  watchUpdate: async (entryId: string, input: Partial<WatchRowInput>) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return patch<{ ok: boolean; publish_error?: string }>(`/api/watchlist/${encodeURIComponent(entryId)}`, input)
  },
  watchArchive: async (ticker: string, currency: string | null, reason: string, muteScope: 'assertion' | 'listing' = 'assertion') => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post<{ ok: boolean; publish_error?: string }>('/api/watchlist/archive', { ticker, currency, reason, mute_scope: muteScope })
  },
  // XHR rather than fetch so the composer can show progress on a large PDF, the same shape
  // submitCockpitFeedback uses.
  watchAttach: async (entryId: string, files: File[], onProgress?: (frac: number) => void): Promise<{ ok: boolean; fileErrors: { filename: string; reason: string }[]; publish_error?: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const fd = new FormData()
    for (const f of files) fd.append('files', f, f.name)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/watchlist/${encodeURIComponent(entryId)}/attachments`)
      if (onProgress) xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total) }
      xhr.onload = () => {
        let j: any = {}
        try { j = JSON.parse(xhr.responseText) } catch { /* keep {} */ }
        if (xhr.status >= 200 && xhr.status < 300) resolve(j)
        else reject(Object.assign(new Error(j?.error || `${xhr.status}`), { status: xhr.status, body: j }))
      }
      xhr.onerror = () => reject(new Error('upload failed'))
      xhr.send(fd)
    })
  },
  watchDetach: async (entryId: string, attachmentId: string) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return del<{ ok: boolean; publish_error?: string }>(`/api/watchlist/${encodeURIComponent(entryId)}/attachment/${encodeURIComponent(attachmentId)}`)
  },
  // The scenario price targets a finished run recorded — offered as a pre-filled trigger, never armed
  // automatically. Fetched only when a panel opens, since most rows have no decision record at all.
  watchScenarios: async (runRoot: string): Promise<{ record: boolean; scenarios: { label: string; price_target: number; probability: number | null; source: string | null }[]; currency?: string | null; decision_date?: string | null }> =>
    get(`/api/watchlist/scenarios?run_root=${encodeURIComponent(runRoot)}`),
  watchAttachmentUrl: (entryId: string, attachmentId: string) =>
    `/api/watchlist/${encodeURIComponent(entryId)}/attachment/${encodeURIComponent(attachmentId)}`,

  watchAssign: async (ticker: string, currency: string | null, assignee: import('./types').TaskAssignee | null) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post<{ ok: boolean; publish_error?: string }>('/api/watchlist/assign', { ticker, currency, assignee })
  },
  watchRestore: async (ticker: string, currency: string | null) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post<{ ok: boolean; publish_error?: string }>('/api/watchlist/restore', { ticker, currency })
  },

  // ---- Tasks board ----
  tasks: async (): Promise<import('./types').TasksRead> => {
    if ((await ensureMode()) === 'static') return snap.tasks || { tasks: [], people: [
      { id: 'AB', name: 'Ayush Banka' }, { id: 'NV', name: 'Noel Vaz' }, { id: 'CK', name: 'Chiraag Kapil' },
    ], unreadable: [], attachments_enabled: false, as_of: new Date().toISOString() }
    return get<import('./types').TasksRead>('/api/tasks')
  },
  taskCreate: async (input: import('./types').TaskInput) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return retryTaskPlanning(() => post<{ ok: boolean; task: import('./types').TaskCard; publish_error?: string }>('/api/tasks', input))
  },
  taskUpdate: async (taskId: string, input: Partial<import('./types').TaskInput>) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    // Durable git publication normally completes in seconds. Bound the request so one broken connection
    // can never pin the ordered board-save queue behind it indefinitely.
    return retryTaskPlanning(() => patch<{ ok: boolean; task: import('./types').TaskCard; publish_error?: string }>(`/api/tasks/${encodeURIComponent(taskId)}`, input, 90_000))
  },
  taskAttach: async (taskId: string, files: File[]): Promise<{ ok: boolean; task: import('./types').TaskCard; fileErrors: { filename: string; reason: string }[]; publish_error?: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return retryTaskPlanning(() => new Promise((resolve, reject) => {
      // Build a fresh multipart body for every retry; some browser engines consume request bodies.
      const fd = new FormData()
      for (const file of files) fd.append('files', file, file.name)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/tasks/${encodeURIComponent(taskId)}/attachments`)
      xhr.onload = () => {
        let body: any = {}
        try { body = JSON.parse(xhr.responseText) } catch { /* keep empty */ }
        if (xhr.status >= 200 && xhr.status < 300) resolve(body)
        else reject(Object.assign(new Error(body?.error || body?.fileErrors?.[0]?.reason || `${xhr.status}`), { status: xhr.status, body }))
      }
      xhr.onerror = () => reject(new Error('upload failed'))
      xhr.send(fd)
    }))
  },
  taskDetach: async (taskId: string, attachmentId: string) => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return retryTaskPlanning(() => del<{ ok: boolean; task: import('./types').TaskCard; publish_error?: string }>(`/api/tasks/${encodeURIComponent(taskId)}/attachment/${encodeURIComponent(attachmentId)}`))
  },
  taskAttachmentUrl: (taskId: string, attachmentId: string) =>
    `/api/tasks/${encodeURIComponent(taskId)}/attachment/${encodeURIComponent(attachmentId)}`,

  quote: async (ticker: string, runRoot?: string): Promise<QuoteRead | null> => {
    if ((await ensureMode()) === 'static') return null
    try {
      const qs = runRoot ? `?ticker=${encodeURIComponent(ticker)}&runRoot=${encodeURIComponent(runRoot)}` : `?ticker=${encodeURIComponent(ticker)}`
      // Client budget must outlast the server's worst-case CNBC window, or a slow-but-succeeding fetch
      // aborts here and refreshLiveQuote suppresses the next attempt for 60s (see quoteTimeout.ts).
      const r = await get<QuoteRead>(`/api/quote${qs}`, QUOTE_CLIENT_TIMEOUT_MS)
      // Positive match only: a body without a real quote object is treated as no quote at all.
      return r && typeof r === 'object'
        ? { ticker: r.ticker ?? null, quote: r.quote ?? null, call: r.call ?? null, reason: r.reason ?? null }
        : null
    } catch {
      return null
    }
  },

  dataNeeds: async (subject: string, swarm: string, runRoot?: string): Promise<DataNeedsRead | null> => {
    if ((await ensureMode()) === 'static') return null
    const query = new URLSearchParams({ swarm })
    if (runRoot) query.set('runRoot', runRoot)
    const r = await get<{ read: DataNeedsRead | null }>(
      `/api/data-needs/${encodeURIComponent(subject)}?${query}`,
      DATA_NEEDS_CLIENT_TIMEOUT_MS,
    )
    const read = r.read
    // Positive-match deploy contract. A new client talking to an old server hides this action surface;
    // it never sends a targeted write without immutable decision identity.
    if (!read || read.contract_version !== 'data-needs-read/2'
        || read.subject !== subject.toUpperCase() || read.swarm !== swarm
        || typeof read.run_root !== 'string' || (runRoot !== undefined && read.run_root !== runRoot)
        || !/^sha256:[a-f0-9]{64}$/.test(read.decision_fingerprint)
        || !Array.isArray(read.needs) || !Array.isArray(read.widened)) return null
    return read
  },

  dataNeedUploadStatus: async (read: DataNeedsRead, needId: string, series: string): Promise<DataNeedUploadRead> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const query = new URLSearchParams({
      swarm: read.swarm,
      runRoot: read.run_root,
      decisionFingerprint: read.decision_fingerprint,
      need_id: needId,
      series,
    })
    const upload = await get<unknown>(`/api/data-needs/${encodeURIComponent(read.subject)}/upload-status?${query}`, 12_000)
    if (!validDataNeedUploadRead(upload, read, needId, series)) throw new Error('upload status could not be verified')
    return upload
  },

  uploadDataNeed: async (
    read: DataNeedsRead,
    needId: string,
    series: string,
    provider: string,
    sourceUrl: string,
    file: File,
    onProgress?: (fraction: number) => void,
    signal?: AbortSignal,
  ): Promise<{ ok: true; upload: DataNeedUploadRead }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const query = new URLSearchParams({ swarm: read.swarm })
    const fd = new FormData()
    fd.append('run_root', read.run_root)
    fd.append('decision_fingerprint', read.decision_fingerprint)
    fd.append('need_id', needId)
    fd.append('series', series)
    fd.append('provider', provider)
    if (sourceUrl.trim()) fd.append('source_url', sourceUrl.trim())
    fd.append('file', file, file.name)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      let settled = false
      const cleanup = () => signal?.removeEventListener('abort', abort)
      const fail = (error: Error & { status?: number; body?: unknown }) => {
        if (settled) return
        settled = true; cleanup(); reject(error)
      }
      const abort = () => { xhr.abort(); fail(Object.assign(new Error('upload cancelled'), { name: 'AbortError' })) }
      if (signal?.aborted) return abort()
      signal?.addEventListener('abort', abort, { once: true })
      xhr.open('POST', `/api/data-needs/${encodeURIComponent(read.subject)}/upload?${query}`)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(event.loaded / event.total)
      }
      xhr.onload = () => {
        let body: any = {}
        try { body = JSON.parse(xhr.responseText || '{}') } catch {}
        if (xhr.status >= 200 && xhr.status < 300) {
          if (body?.ok !== true || !validDataNeedUploadRead(body.upload, read, needId, series)) {
            return fail(new Error('upload receipt could not be verified'))
          }
          if (settled) return
          settled = true; cleanup(); resolve(body)
        } else fail(Object.assign(new Error(body?.error || `${xhr.status}`), { status: xhr.status, body }))
      }
      xhr.onerror = () => fail(new Error('network error during upload'))
      xhr.onabort = () => fail(Object.assign(new Error('upload cancelled'), { name: 'AbortError' }))
      xhr.send(fd)
    })
  },

  // ---- data pipeline: find/add a source → live relevance scan → build a connector → PR → live feed ----
  // The folded pipeline ledger for a subject (added sources + scan verdicts + build status). Fail-closed to []
  // so an old engine mid-deploy (no route) simply shows an empty panel rather than erroring.
  pipeline: async (subject: string, swarm: string): Promise<PipelineView[]> => {
    if ((await ensureMode()) === 'static') return []
    try {
      const r = await get<{ items: PipelineView[] }>(`/api/pipeline/${encodeURIComponent(subject)}?swarm=${encodeURIComponent(swarm)}`, 8_000)
      return r.items ?? []
    } catch {
      return []
    }
  },
  addPipelineSource: async (subject: string, swarm: string, input: AddPipelineSourceInput): Promise<{ ok: boolean; item: PipelineView }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/pipeline/${encodeURIComponent(subject)}/source?swarm=${encodeURIComponent(swarm)}`, input)
  },
  buildConnector: async (pipelineId: string): Promise<{ ok: boolean; status: string; message: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/pipeline/source/${encodeURIComponent(pipelineId)}/build`, {})
  },
  // POST one relevance scan and read the streamed SSE body (mirrors chatStream — EventSource is GET-only).
  // Frames: scan-status → (scan-activity | scan-thinking)* → scan-verdict → (nothing more) | scan-error.
  // onActivity is "what is being scanned/checked right now"; onVerdict carries the final structured decision.
  pipelineScanStream: async (
    subject: string,
    swarm: string,
    pipelineId: string,
    cb: {
      onStatus?: (s: { stage?: string; model?: string; openNeeds?: number }) => void
      onActivity?: (a: { tool: string; target: string }) => void
      onThinking?: (t: string) => void
      onVerdict: (v: ScanVerdict, costUsd?: number) => void
      onError: (msg: string) => void
      onEnd?: () => void
      signal: AbortSignal
    },
  ): Promise<void> => {
    if ((await ensureMode()) === 'static') { cb.onError('static-deploy'); return }
    await readSse(
      `/api/pipeline/${encodeURIComponent(subject)}/scan?swarm=${encodeURIComponent(swarm)}`,
      { method: 'POST', headers: { 'content-type': 'application/json', accept: 'text/event-stream' }, body: JSON.stringify({ pipeline_id: pipelineId }), signal: cb.signal },
      cb.signal,
      (ev, parsed) => {
        if (ev === 'scan-status') cb.onStatus?.(parsed)
        else if (ev === 'scan-activity') cb.onActivity?.({ tool: parsed.tool ?? '', target: parsed.target ?? '' })
        else if (ev === 'scan-thinking') cb.onThinking?.(parsed.content ?? '')
        else if (ev === 'scan-verdict') cb.onVerdict(parsed.verdict, parsed.costUsd)
        else if (ev === 'scan-error') { cb.onError(parsed.message || 'scan failed'); return 'stop' }
      },
      cb.onError,
      cb.onEnd,
    )
  },

  // The cross-swarm data-pipeline library read (connector registry + freshness + recommended-to-add).
  // Static showcase returns a sensible absent read; live errors keep their `status` (the get()
  // convention) so the store can tell a mid-deploy 404 (feature off, §5) from a real failure.
  pipelines: async (): Promise<{ read: PipelinesRead }> => {
    if ((await ensureMode()) === 'static')
      return { read: { generatedAt: '', poolAvailable: false, pipelines: [], recommended: [], widened: [] } }
    return get(`/api/pipelines`)
  },

  // Every build the ledger knows about (cross-subject), newest activity first. Fail-closed to [] so an older
  // engine mid-deploy simply shows no builds rather than an error (§5).
  pipelineBuilds: async (): Promise<PipelineView[]> => {
    if ((await ensureMode()) === 'static') return []
    try {
      const r = await get<{ items: PipelineView[] }>(`/api/pipelines/builds`, 8_000)
      return r.items ?? []
    } catch {
      return []
    }
  },

  // POST one deep search for feeds and read the streamed SSE body (same shape as pipelineScanStream — the
  // browser's EventSource is GET-only). Frames: discover-status → (discover-activity | discover-thinking)* →
  // discover-found* → discover-done | discover-error. Each `found` is already persisted and buildable by id.
  pipelineDiscoverStream: async (
    subject: string,
    swarm: string,
    opts: { need_id?: string | null; runRoot?: string; decisionFingerprint?: string; want?: string; autoBuild?: boolean },
    cb: {
      onStatus?: (s: { stage?: string; model?: string; openNeeds?: number; wired?: number }) => void
      onActivity?: (a: { tool: string; target: string }) => void
      onFound: (f: DiscoveredFeed) => void
      onDone: (d: { found: number; autoBuilt: number; decisionFingerprint?: string; superseded?: boolean }) => void
      onError: (msg: string) => void
      // A clean stream always supplies discover-done. EOF without a terminal frame is a transport failure,
      // not evidence that no source exists; callers use this hook to keep those states distinct.
      onEnd?: () => void
      signal: AbortSignal
    },
  ): Promise<void> => {
    if ((await ensureMode()) === 'static') { cb.onError('static-deploy'); return }
    if (opts.need_id && (!opts.runRoot || !/^sha256:[a-f0-9]{64}$/.test(opts.decisionFingerprint || ''))) {
      cb.onError('selected-decision-contract-unavailable')
      return
    }
    await readSse(
      `/api/pipelines/discover?swarm=${encodeURIComponent(swarm)}`,
      { method: 'POST', headers: { 'content-type': 'application/json', accept: 'text/event-stream' }, body: JSON.stringify({ subject, ...opts }), signal: cb.signal },
      cb.signal,
      (ev, parsed) => {
        if (ev === 'discover-status') cb.onStatus?.(parsed)
        else if (ev === 'discover-activity') cb.onActivity?.({ tool: parsed.tool ?? '', target: parsed.target ?? '' })
        else if (ev === 'discover-found') {
          cb.onFound({
            pipeline_id: parsed.pipeline_id, source_url: parsed.source_url, why: parsed.why ?? '',
            verdict: parsed.verdict, building: parsed.building === true,
            connector_exists: typeof parsed.connector_exists === 'string' ? parsed.connector_exists : undefined,
          })
        } else if (ev === 'discover-done') {
          if (opts.need_id && parsed.decisionFingerprint !== opts.decisionFingerprint) {
            cb.onError('selected-decision-changed')
            return 'stop'
          }
          cb.onDone({
            found: parsed.found ?? 0, autoBuilt: parsed.autoBuilt ?? 0,
            decisionFingerprint: typeof parsed.decisionFingerprint === 'string' ? parsed.decisionFingerprint : undefined,
            superseded: parsed.superseded === true,
          })
          return 'stop'
        }
        else if (ev === 'discover-error') { cb.onError(parsed.message || 'the search failed'); return 'stop' }
      },
      cb.onError,
      cb.onEnd,
    )
  },

  // Watch ONE build: replays the steps so far, then streams each new one. `build-absent` means this server has
  // no live transcript (a restart, or another host ran it) — the caller falls back to the ledger status.
  pipelineBuildStream: async (
    pipelineId: string,
    cb: {
      onStep: (s: BuildStep) => void
      onDone: (d: { outcome: string | null; prUrl: string | null; connectorId: string | null; note: string }) => void
      onAbsent: (d: { status: string | null; prUrl: string | null; connectorId: string | null; note: string }) => void
      onError: (msg: string) => void
      signal: AbortSignal
    },
  ): Promise<void> => {
    if ((await ensureMode()) === 'static') { cb.onError('static-deploy'); return }
    await readSse(
      `/api/pipelines/build/${encodeURIComponent(pipelineId)}/stream`,
      { headers: { accept: 'text/event-stream' }, signal: cb.signal },
      cb.signal,
      (ev, parsed) => {
        if (ev === 'build-step') cb.onStep({ tool: parsed.tool ?? '', target: parsed.target ?? '' })
        else if (ev === 'build-done') { cb.onDone({ outcome: parsed.outcome ?? null, prUrl: parsed.prUrl ?? null, connectorId: parsed.connectorId ?? null, note: parsed.note ?? '' }); return 'stop' }
        else if (ev === 'build-absent') { cb.onAbsent({ status: parsed.status ?? null, prUrl: parsed.prUrl ?? null, connectorId: parsed.connectorId ?? null, note: parsed.note ?? '' }); return 'stop' }
      },
      cb.onError,
    )
  },

  runStreamUrl: (runId: string) => `/api/runs/${runId}/stream`,
  dataStreamUrl: () => `/api/data-status/stream`,

  // ---- chat with your data (closed-book Q&A over a run's synthesized output) ----
  // The host's admitted Ask catalogue. Only a confirmed 404 means an old server and earns the legacy
  // Claude catalogue. A transient/malformed response rejects so each picker can keep its last truthful
  // catalogue and retry; it can never overwrite a valid host-pinned choice with Sonnet.
  chatModels: async (): Promise<ChatModelsRead> => {
    const all = { models: CHAT_MODELS.map((choice) => choice.id), defaultModel: 'sonnet' }
    if ((await ensureMode()) === 'static') return all
    if (chatModelsPending) return chatModelsPending
    const pending = (async () => {
      try {
        const read = normalizeChatModelsRead(await get<unknown>('/api/chat/models', 8_000))
        if (!read) throw new Error('Ask model catalogue was invalid')
        return read
      } catch (error) {
        const fallback = chatModelsReadAfterFailure(error, null)
        if (!fallback) throw error
        return fallback
      }
    })()
    chatModelsPending = pending
    try {
      return await pending
    } finally {
      // Share only the in-flight request. A loaded browser must notice a server upgrade/reconfiguration;
      // caching a legacy 404 forever would hide newly deployed GPT choices until the user reloaded.
      if (chatModelsPending === pending) chatModelsPending = null
    }
  },
  // which scopes are present (chat-able) vs not-yet-run. Static showcase: nothing chat-able (no engine).
  chatScopes: async (ticker: string, swarm?: string): Promise<ChatScopes> => {
    if ((await ensureMode()) === 'static') return { ticker, runRoot: null, run: { present: false }, modules: [], orbs: [] }
    if (swarm && swarm !== 'research') return get(`/api/chat/scopes?swarm=${encodeURIComponent(swarm)}&subject=${encodeURIComponent(ticker)}`, 8_000)
    return get(`/api/chat/scopes?ticker=${encodeURIComponent(ticker)}`, 8_000)
  },
  // POST one chat turn and read the streamed SSE body. Runs use EventSource (GET-only) elsewhere; chat is
  // a POST, so it needs the fetch + ReadableStream reader. AbortError-silent: the user's own close (signal
  // abort) is not surfaced as an error. Frames: chat-meta -> (chat-status | chat-thinking)* interleaved
  // with chat-token* -> chat-done | chat-error. onStatus/onThinking are optional and simply absent from an
  // older engine's stream (deploy skew §5) — the turn still works without them.
  chatStream: async (
    body: ChatRequest,
    cb: {
      onMeta?: (m: { conversationId?: string; scopeResolved: string; sourcePath?: string; degraded?: boolean; degradeNote?: string; memory?: import('./types').AskMemoryMeta }) => void
      onStatus?: (s: { stage?: string; model?: string }) => void
      onThinking?: (t: string) => void
      onComputed?: (c: ChatComputed) => void
      // Exact completed answer recovered by turn id when the SSE connection dies after the server committed
      // but before the browser received chat-done. The store replaces any partial assistant text with this.
      onRecovered: (turn: CompletedChatTurn) => void
      onToken: (t: string) => void
      onDone: (d: { costUsd?: number }) => void
      onError: (msg: string) => void
      signal: AbortSignal
    },
  ): Promise<void> => {
    if ((await ensureMode()) === 'static') { cb.onError('static-deploy'); return }
    let terminal = false
    const recoverCommittedTurn = async (): Promise<boolean> => {
      if (!body.turnId || cb.signal.aborted) return false
      try {
        const r = await fetch(`/api/chat/turn/${encodeURIComponent(body.turnId)}`, { signal: cb.signal })
        if (!r.ok) return false
        const turn = await r.json() as CompletedChatTurn
        const question = [...body.messages].reverse().find((message) => message.role === 'user')?.content
        if (cb.signal.aborted || turn.turnId !== body.turnId || turn.question !== question || !turn.conversationId) return false
        cb.onRecovered(turn)
        cb.onDone({ costUsd: 0 })
        terminal = true
        return true
      } catch (e: any) {
        if (e?.name === 'AbortError') return false
        return false
      }
    }
    const ambiguousFailure = async (message: string) => {
      if (terminal || cb.signal.aborted) return
      if (await recoverCommittedTurn()) return
      if (!cb.signal.aborted) { terminal = true; cb.onError(message) }
    }
    let res: Response
    try {
      // The Cloudflare offline gate removes its ordinary request deadline only for explicit SSE traffic.
      // Without this Accept header, slow context assembly is misread as an offline origin after 15s even
      // though the engine is healthy, and the user's safely rolled-back turn surfaces as `engine-offline`.
      res = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'text/event-stream' }, body: JSON.stringify(body), signal: cb.signal })
    } catch (e: any) {
      if (e?.name !== 'AbortError') await ambiguousFailure(e?.message || 'network error')
      return
    }
    if (!res.ok || !res.body) {
      let msg = `${res.status}`
      try { const j = await res.json(); msg = (j as any)?.hint || (j as any)?.error || msg } catch {}
      cb.onError(msg)
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    try {
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const frames = buf.split('\n\n')
        buf = frames.pop() ?? '' // keep the trailing partial frame
        for (const frame of frames) {
          let ev = 'message'
          let data = ''
          for (const line of frame.split('\n')) {
            if (line.startsWith('event:')) ev = line.slice(6).trim()
            else if (line.startsWith('data:')) data += line.slice(5).trim()
          }
          if (!data) continue
          let parsed: any
          try { parsed = JSON.parse(data) } catch { continue }
          if (ev === 'chat-meta') cb.onMeta?.(parsed)
          else if (ev === 'chat-status') cb.onStatus?.(parsed)
          else if (ev === 'chat-thinking') cb.onThinking?.(parsed.content ?? '')
          else if (ev === 'chat-computed') { if (parsed.payload) cb.onComputed?.(parsed.payload) }
          else if (ev === 'chat-token') cb.onToken(parsed.content ?? '')
          else if (ev === 'chat-done') { terminal = true; cb.onDone(parsed); return }
          else if (ev === 'chat-error') { terminal = true; cb.onError(parsed.message || 'chat failed'); return }
        }
      }
      // A successful or model-error stream returns from the terminal frame above. EOF without one is a
      // transport interruption; surface it so the store can restore the committed baseline and offer Retry.
      await ambiguousFailure('stream interrupted')
    } catch (e: any) {
      if (e?.name !== 'AbortError') await ambiguousFailure(e?.message || 'stream interrupted')
    }
  },

  // The Screener's news chat. Same streamed POST shape as research chat, but its first frame carries
  // the search receipt and exact firehose rows used as evidence.
  newsChatStream: async (
    body: NewsChatRequest,
    cb: {
      onMeta: (m: { conversationId?: string; receipt: NewsChatReceipt; evidence: NewsChatEvidence[]; recovered?: boolean }) => void
      onToken: (t: string) => void
      onDone: (d: { costUsd?: number }) => void
      onError: (msg: string) => void
      signal: AbortSignal
    },
  ): Promise<void> => {
    if ((await ensureMode()) === 'static') { cb.onError('static-deploy'); return }
    let res: Response
    try {
      res = await fetch('/api/news/chat', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'text/event-stream' }, body: JSON.stringify(body), signal: cb.signal })
    } catch (e: any) {
      if (e?.name !== 'AbortError') cb.onError(e?.message || 'network error')
      return
    }
    if (!res.ok || !res.body) {
      let msg = `${res.status}`
      try { const j = await res.json(); msg = (j as any)?.hint || (j as any)?.error || msg } catch {}
      cb.onError(msg)
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    let terminal = false
    try {
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const frames = buf.split('\n\n')
        buf = frames.pop() ?? ''
        for (const frame of frames) {
          let ev = 'message'
          let data = ''
          for (const line of frame.split('\n')) {
            if (line.startsWith('event:')) ev = line.slice(6).trim()
            else if (line.startsWith('data:')) data += line.slice(5).trim()
          }
          if (!data) continue
          let parsed: any
          try { parsed = JSON.parse(data) } catch { continue }
          if (ev === 'news-chat-meta') cb.onMeta(parsed)
          else if (ev === 'news-chat-token') cb.onToken(parsed.content ?? '')
          else if (ev === 'news-chat-done') { terminal = true; cb.onDone(parsed); return }
          else if (ev === 'news-chat-error') { terminal = true; cb.onError(parsed.message || 'news chat failed'); return }
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || cb.signal.aborted) return
      terminal = true
      cb.onError(e?.message || 'stream interrupted')
      return
    }
    // A clean transport EOF is not a successful answer. The server's done frame is the commit marker;
    // without it, any partial tokens/meta must be rolled back by the store. User aborts stay silent.
    if (!terminal && !cb.signal.aborted) cb.onError('News chat ended before the answer completed. Please retry.')
  },

  // who is signed in (Cloudflare Access email) — live only
  whoami: async (): Promise<Whoami> => {
    if ((await ensureMode()) === 'static') return { user: 'local', userVia: 'local' }
    return get(`/api/whoami`)
  },
  // Admin-only release canary. The browser contributes no privileged header: Cloudflare Access identity
  // on this same-origin request is the authority, and the server repeats both admin + feature gates.
  providerParityCanary: async (body: ProviderParityCanaryRequest): Promise<LaunchResponse> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/internal/provider-parity/canary`, body, 30_000)
  },
  providerParityCanaryStatus: async (runRoot: string): Promise<ProviderParityCanaryStatus> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const query = new URLSearchParams({ runRoot })
    return get(`/api/internal/provider-parity/canary-status?${query.toString()}`)
  },
  // perpetual activity/audit log with filters — live only (the static showcase has no run history)
  activity: async (query: ActivityQuery = {}): Promise<ActivityResult> => {
    if ((await ensureMode()) === 'static') return { rows: [], total: 0, allTime: 0, users: [], tickers: [], earliest: null }
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v))
    const s = qs.toString()
    return get(`/api/activity${s ? `?${s}` : ''}`)
  },
  pendingAdmissions: async (): Promise<{ requests: PendingAdmission[] }> => {
    if ((await ensureMode()) === 'static') return { requests: [] }
    return get('/api/pending-admissions')
  },
  cancelPendingAdmission: async (requestId: string): Promise<{ ok: boolean; request: PendingAdmission }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/pending-admissions/${encodeURIComponent(requestId)}/cancel`)
  },

  // ---- saved chat history (persisted Ask conversations) — live only ----
  // list saved conversations as summaries (who asked, when, about which company), newest-updated first.
  listChats: async (query: ChatListQuery = {}): Promise<ChatListResult> => {
    if ((await ensureMode()) === 'static') return { conversations: [], total: 0, allTime: 0, users: [], subjects: [], earliest: null }
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v))
    const s = qs.toString()
    return get(`/api/chats${s ? `?${s}` : ''}`)
  },
  // one saved conversation with its full transcript — the basis for continuing it
  getChat: async (id: string): Promise<ChatConversationDetail> => get(`/api/chats/${encodeURIComponent(id)}`),
  // delete one saved conversation
  deleteChat: async (id: string): Promise<{ deleted: boolean }> => {
    if ((await ensureMode()) === 'static') return { deleted: false }
    const r = await fetch(`/api/chats/${encodeURIComponent(id)}`, { method: 'DELETE' })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw Object.assign(new Error((j as any)?.error || `${r.status}`), { status: r.status })
    return j as { deleted: boolean }
  },
}
