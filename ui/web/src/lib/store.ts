import { create } from 'zustand'
import { api, ensureMode, EXACT_DECISION_LAUNCH_CONTRACT, isQueuedLaunchResponse, isStatic, snapshotGeneratedAt } from './api'
import type { ArchiveQuery, FeedFacets, SearchCursor } from './api'
import { downstreamCascade, type CascadeNode } from './cascade'
import { moduleLabel, preferRunRoot, resolveVerdict } from './format'
import { coerceViewForWebgl, isPersistableView, normalizeStoredView, type ResearchView } from './researchView'
import type { WatchRowInput, WatchlistRead } from './types'
import { displayHeadline, originalHeadline, plainRoute, plainStage } from './plain'
import type { Theme, ThemeCompilerHealth, ThemeDetail, ThemeBrief, ThemeFormationQueue, ThemeRemoval } from './themes'
import { compareBriefingThemes, intensityWindowForHours, normalizeThemeCompilerHealth, normalizeThemeFormationQueue, themeSurfaceStatus, themeWindowForView } from './themes'
import { deriveWireConfig, type WireConfig, type WirePulseSubject } from './wire'
import { archiveErrorNote } from './archiveError'
import { selectNewsChatHandoffEvidence } from './newsChatHandoff'
import { stageDockHUpdate } from './stageDock'
import { affectedModules, focusKeysFor } from './intake'
import { moduleRunAffordance, moduleRunInputModules } from './moduleRun'
import { preflightConfirmationMatches } from './launchExperience'
import type { BridgeStatus } from './types'
import type { ActiveRunLite, AgentNode, AskMemoryMeta, AskMemoryMode, BoardIdea, BoardInboxRow, BookFilterState, BookSort, ChatMessage, ChatScope, ChatStyle, ChatWork, ConvictionDetail, CoverageGroup, CycleSummary, DataNeedsRead, DataScanProgress, DataStatus, DeploymentLag, EventEnrichment, FeedbackSubmitInput, FeedbackType, FeedItem, HealthState, IntakePlan, IntensityStats, IntensityWindow, LaunchPreflight, ListingStatus, NewCompanyInput, NewsChatCompletedTurn, NewsChatEvidence, NewsChatReceipt, NewsChatWindow, NewsDiagnostics, NewsStatus, NodeRuntime, NodeStatus, PendingAdmission, QuoteRead, ReadinessReport, ResumableRunInfo, RunActivity, RunKind, RunPublicationPhase, ScreenerBoard, SignalIntakeInput, SignalState, SseEvent, SwarmGraph, SwarmMeta, SwarmSubjectSummary, ThesisPlan, ThesisPlanIntake, TickerSummary, Usage, WhatChangedRead } from './types'
import { isDataScanProgress } from './dataScan'
import { feedbackInputFromItem, feedbackLabel, polarityOf } from './feedbackTypes'
import { emptyBookFilters } from '../components/screener/BookFilters'
import { emptyDlFilters, type DlFilterState } from '../components/datalibrary/DataLibraryFilters'
import type { PipelinesRead } from './types'
import { emptyReviewFilters, matchesReviewFilters, type ReviewFilterState } from '../components/screener/ReviewFilters'
import { automaticResumeMatches, emptyProviders, freezeProviderLaunch, isRunProvider, launchProviderReceiptMatches, optionalNestedLaunchResponseMatches, providerCatalogUnknown, providerIsBlocked, providerLaunchBlockedReason, providerLabel, providerNeedsCheck, readRunProfileKey, readRunProvider, saveRunProfileKey, saveRunProvider, selectedProviderProfile, trackedLaunchResponseMatches, type FrozenProviderLaunch, type ProvidersRead, type RecordedRunExecution, type RunProvider } from './provider'
import { normalizeRunSnapshotIdentity, reconcileRunIdentity, sseFrameForRun } from './runIdentity'
import { projectRunManifest } from './runManifestProjection'
import { readChatModel, saveChatModel } from './chatModels'
import { performanceFetch, recordBrowserPerformance, recordNextPaint } from './performance'

const SIGNAL_INPUT_NATURES = new Set([
  'news_headline', 'regulatory_filing', 'earnings_release', 'earnings_call_transcript',
  'company_press_release', 'exchange_announcement', 'price_alert', 'commodity_price_move',
  'shipping_rate_move', 'options_flow_alert', 'chart_pattern', 'geopolitical_event', 'macro_data_release',
])
const signalNatureFromNews = (value: string | undefined) => value && SIGNAL_INPUT_NATURES.has(value) ? value : 'news_headline'

// A company the user drilled into from an event (the COMPANIES NAMED chips) — the main stage then
// shows every wire story about it. listing_country/exchange + listing_status (public/private/unknown)
// ride along from the article-body read, so the drill-down labels the name the same way the reader did.
export interface FocusedCompany { name: string; ticker: string | null; listing_status?: ListingStatus; listing_country?: string | null; exchange?: string | null }

// --- shelved events: a local, per-browser "set aside" set for wire items the user has judged not
//     worth a paid check. Persisted to localStorage (the wire is ephemeral firehose data, not server
//     state), keyed by event_id. Survives reloads; intentionally never leaves this machine. ---
const SHELF_KEY = 'nsw.shelvedEvents'
function loadShelf(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(SHELF_KEY) || '[]')
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}
function saveShelf(s: Set<string>): void {
  try { localStorage.setItem(SHELF_KEY, JSON.stringify([...s].slice(-500))) } catch {}
}

// --- flagged events: a local display cache of which event_ids the user has already sent feedback on
//     this browser — the server ledger is authoritative, this only drives the row/detail indicator so
//     it survives a reload without a network round-trip per card. Same persistence shape as the shelf. ---
const FLAGGED_KEY = 'nsw.flaggedEvents'
function loadFlagged(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(FLAGGED_KEY) || '[]')
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}
function saveFlagged(s: Set<string>): void {
  try { localStorage.setItem(FLAGGED_KEY, JSON.stringify([...s].slice(-500))) } catch {}
}

// --- which THUMB the reader last rated an event with (up / down) — drives the filled thumb in the reader
//     so a rating survives a reload. Same local-cache spirit as flaggedEvents; the server ledger is still
//     authoritative for the actual reasons. ---
const RATED_KEY = 'nsw.ratedPolarity'
function loadRated(): Record<string, 'up' | 'down'> {
  try {
    const raw = JSON.parse(localStorage.getItem(RATED_KEY) || '{}')
    if (!raw || typeof raw !== 'object') return {}
    const out: Record<string, 'up' | 'down'> = {}
    for (const [k, v] of Object.entries(raw)) if (v === 'up' || v === 'down') out[k] = v
    return out
  } catch {
    return {}
  }
}
function saveRated(m: Record<string, 'up' | 'down'>): void {
  // Keep only the most-recent ~500 (insertion order) so the cache can't grow unbounded — same cap as the shelf.
  try {
    const keys = Object.keys(m)
    const trimmed = keys.length > 500 ? Object.fromEntries(keys.slice(-500).map((k) => [k, m[k]])) : m
    localStorage.setItem(RATED_KEY, JSON.stringify(trimmed))
  } catch {}
}

// --- read events: which wire items the user has already seen — the persistent read/unread state (an
//     unopened item shows an unread dot + brighter headline; opening it, or "mark all read", clears it).
//     Same per-browser localStorage shape as the shelf, keyed by event_id. A larger cap than the shelf
//     because it accumulates as you read (Set keeps insertion order, so slice(-N) keeps the newest). The
//     one-time READ_SEEDED marker gives a first-EVER visit a clean slate: everything already on the wire is
//     marked read once, so only genuinely new arrivals from then on show as unread (no wall of dots). ---
const READ_KEY = 'nsw.readEvents'
const READ_SEEDED_KEY = 'nsw.readSeeded'
function loadRead(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(READ_KEY) || '[]')
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}
function saveRead(s: Set<string>): void {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...s].slice(-4000))) } catch {}
}

// The research stage's renderer: the 3D globe (default) or the flat 2D constellation. A per-browser
// presentation preference like the theme — persisted to localStorage, never leaves the machine. The flat
// constellation is the default; the globe is an explicit choice and is remembered once made. init()
// coerces a stored 'globe' back to 'constellation' when WebGL is unavailable (no strand).
const VIEW_KEY = 'nsw.researchView'
function loadView(): ResearchView {
  try { return normalizeStoredView(localStorage.getItem(VIEW_KEY)) } catch { return 'constellation' }
}
// How the watchlist is drawn. Unlike the stage view this IS a home: whichever way you read the list is the
// way you want it next time, so an explicit choice persists and anything unrecognized falls back to the
// grid rather than to a stored value we cannot interpret.
const WL_LAYOUT_KEY = 'nsw.watchlistLayout'
export type WatchlistLayout = 'grid' | 'table'
function loadWatchlistLayout(): WatchlistLayout {
  try { return localStorage.getItem(WL_LAYOUT_KEY) === 'table' ? 'table' : 'grid' } catch { return 'grid' }
}
// One-time, cached WebGL capability probe (a context creation, immediately released). The globe needs it;
// the toggle disables the Globe option and we coerce away from it when this is false.
let webglProbe: boolean | null = null
function detectWebGL(): boolean {
  if (webglProbe !== null) return webglProbe
  try {
    const c = document.createElement('canvas')
    webglProbe = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    webglProbe = false
  }
  return webglProbe
}

const RUN_EVENT_TYPES = ['run-started', 'agent-started', 'agent-done', 'agent-failed', 'layer-advanced', 'module-done', 'module-routed', 'cost-tick', 'run-done', 'run-error', 'run-heartbeat', 'run-activity', 'readiness-checking', 'readiness-report', 'readiness-blocked', 'readiness-resolved']

// How many steps of a run's activity feed the client keeps. Matches the server's own ring (registry's
// ACTIVITY_RING), so a subscribe-time replay never overflows what we hold and silently drop its head.
const ACTIVITY_CAP = 80

// Live SSE streams for the SELECTED ticker only, keyed by runId. A ticker switch closes them all;
// background runs keep executing server-side and are rediscovered via /api/runs on return.
const runSources = new Map<string, EventSource>()
const runStreamHealth = new Map<string, { state: 'open' | 'error'; at: number }>()
const runStreamRetryAt = new Map<string, number>()
type ReconnectOutcome = 'ready' | 'settled' | 'cancelled' | 'error'
const reconnectRunInFlight = new Map<string, Promise<ReconnectOutcome>>()
const chainedReadinessRecoveryTried = new Set<string>()
const chainedReadinessRecoveryInFlight = new Set<string>()
const chainedReadinessRecoveryTail = new Map<string, Promise<void>>()
// in-flight chat turn's aborter (module-level so closeChat / scope-change / ticker-switch can cancel it
// without threading it through React state). Chat is ephemeral — one conversation at a time.
let chatAbort: AbortController | null = null
// The last committed transcript before an in-flight turn. Switching Ask contexts or closing the drawer
// aborts the request and restores this baseline, so a half-written paid response never becomes the thread.
let chatPendingBaseline: { messages: ChatMessage[]; conversationId?: string; source?: string; memory?: AskMemoryMeta } | null = null
// Saved-chat resumes cross multiple awaits. A newer Ask/navigation action invalidates an older resume so a
// slow history read can never close the drawer the user just opened or replace the newer conversation.
let chatResumeSeq = 0
// Monotonic stamp for "complete the thesis" re-pricing requests: only the newest response may be applied.
let thesisPriceSeq = 0
// Full/rerun estimates and provider re-prices share one last-choice-wins generation. It is intentionally
// separate from thesis pricing: the two dialogs can never make each other's valid response stale.
let launchPriceSeq = 0
let providerCatalogSeq = 0
const providerCheckSeq: Record<RunProvider, number> = { claude: 0, codex: 0 }
let providerChecksInFlight = 0
let providerRediscoveryTimer: ReturnType<typeof setTimeout> | null = null
let providerRediscoveryAttempt = 0
// Most-recent turns sent to the model per request. The server's ChatBody caps the transcript at 40, so a
// long or resumed conversation (whose full history lives in chatMessages + on disk) is windowed to the last
// 40 here — anything larger would be rejected 400 and break "continue chatting". The closed-book CONTEXT is
// re-sent every turn, so trimming only limits how much back-and-forth the model sees, never the evidence.
const CHAT_MAX_SEND = 40
function newChatTurnId(): string {
  const uuid = globalThis.crypto?.randomUUID?.().replace(/-/g, '')
  return `turn_${uuid || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`
}
// The Screener news chat is a different closed book, so it gets its own aborter and state. Closing one
// panel can never stop the other panel's request.
let newsChatAbort: AbortController | null = null
let newsChatPendingBaseline: { messages: ChatMessage[]; conversationId?: string } | null = null
const NEWS_CHAT_MAX_MESSAGES = 30
// narration style is a STICKY preference (persisted) — unlike the ephemeral conversation, the user's
// "explain it like X" choice should survive across companies and reloads. Default = plain-English 'simple'.
const CHAT_STYLE_KEY = 'nsw.chatStyle'
function loadChatStyle(): ChatStyle {
  try { const v = localStorage.getItem(CHAT_STYLE_KEY); if (v === 'simple' || v === 'analyst' || v === 'detailed') return v } catch { /* SSR / blocked storage */ }
  return 'simple'
}
let dataSource: EventSource | null = null
let dataScanRequest: { ticker: string; controller: AbortController; promise: Promise<DataStatus> } | null = null
let bloomTimer: any = null
let pollTimer: any = null
let intensityRefetchTimer: any = null // debounces the screener intensity re-fetch on each news cycle
let themesGeoRefetchTimer: any = null // debounces the geo-sliced themes re-fetch on each theme-update
// Every Themes request gets a generation. Slice labels alone are not enough: two requests for the same
// slice can finish out of order, and an owner switch can briefly recreate the same empty geo/subject.
let themesRequestSeq = 0
// Detail reads have their own generation. The selected id alone is not a sufficient guard: retrying the
// same id can leave two responses in flight, and the slower old response must never overwrite the newer.
let themeDetailRequestSeq = 0
// Only explicit user retries are coalesced. Background projection refreshes retain their existing
// newest-request-wins semantics, while a double-click cannot launch duplicate recovery requests.
let themesRetryPromise: Promise<void> | null = null
// Unlike ordinary theme revisions, a qualification/time-decay projection can change without bumping
// Theme.rev. Track every live upsert so a response that began before it cannot overwrite the SSE truth.
let themeUpsertMutationSeq = 0
// A removal can race an already-buffered theme-update frame. Keep its revision for this session so an
// older update cannot resurrect a retired/merged row after the explicit invalidation lands.
const themeRemovalRevs = new Map<string, number>()

const canonicalContractValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalContractValue)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => [key, canonicalContractValue(entry)]),
  )
}

// Only fields that determine the PM thesis belong here. Slice-specific flow/member counts and read-time
// heat can legitimately differ; the index and detail now use the same evidence projection.
const themeDetailContractKey = (theme: Theme | null | undefined): string | null => theme
  ? JSON.stringify(canonicalContractValue({
      theme_id: theme.theme_id,
      rev: theme.rev,
      name: theme.name,
      description: theme.description,
      narrative: theme.narrative ?? null,
      activity: theme.activity ?? null,
      conviction: theme.conviction ?? null,
      assessment: theme.assessment || theme.opportunity || null,
      evidence: theme.evidence || [],
      qualified_expressions: theme.qualified_expressions || [],
      idea_ready: theme.idea_ready === true,
      idea_blockers: theme.idea_blockers || [],
      player_counts: theme.player_counts || null,
    }))
  : null

/** Reconcile one exact formation-row invalidation from SSE. The formation excerpt and compiler-health
 * debt are separate totals: building-evidence rows are disclosed formation patterns but are not runnable
 * compiler debt, so only the three compiler states decrement health. */
function withoutFormationCandidate(
  formation: ThemeFormationQueue | null,
  health: ThemeCompilerHealth | null,
  themeId: string,
): { formation: ThemeFormationQueue | null; health: ThemeCompilerHealth | null } {
  const candidate = formation?.candidates.find((row) => row.theme_id === themeId)
  if (!formation || !candidate) return { formation, health }

  const candidates = formation.candidates.filter((row) => row.theme_id !== themeId)
  const nextFormation: ThemeFormationQueue = {
    ...formation,
    total: candidates.length + formation.hidden + (formation.client_withheld || 0),
    shown: candidates.length,
    ...(candidate.state === 'awaiting_validation' ? { awaiting_validation: Math.max(0, formation.awaiting_validation - 1) } : {}),
    ...(candidate.state === 'awaiting_revalidation' ? { awaiting_revalidation: Math.max(0, formation.awaiting_revalidation - 1) } : {}),
    ...(candidate.state === 'blocked_incomplete_audit' ? { blocked_incomplete_audit: Math.max(0, formation.blocked_incomplete_audit - 1) } : {}),
    ...(candidate.state === 'building_evidence' ? { building_evidence: Math.max(0, formation.building_evidence - 1) } : {}),
    candidates,
  }

  if (!health || candidate.state === 'building_evidence') return { formation: nextFormation, health }
  const awaitingValidation = Math.max(0, health.queue.awaiting_validation - (candidate.state === 'awaiting_validation' ? 1 : 0))
  const awaitingRevalidation = Math.max(0, health.queue.awaiting_revalidation - (candidate.state === 'awaiting_revalidation' ? 1 : 0))
  const blockedIncompleteAudit = Math.max(0, health.queue.blocked_incomplete_audit - (candidate.state === 'blocked_incomplete_audit' ? 1 : 0))
  const total = awaitingValidation + awaitingRevalidation + blockedIncompleteAudit
  const removedOldest = candidate.queued_at && health.queue.oldest_queued_at
    ? Date.parse(candidate.queued_at) === Date.parse(health.queue.oldest_queued_at)
    : false
  // Recompute from the remaining queue rather than blanking it: other candidates can still be waiting.
  // Mirrors the server's own ordering (formation.ts buildThemeCompilerHealth / compilerDebtForThemes) —
  // only the three compiler-debt states carry queue age; a still-building candidate isn't durable
  // compiler work, so it must not seed the recomputed oldest_queued_at either.
  const oldestQueuedAt = removedOldest
    ? candidates
        .filter((row) => row.state !== 'building_evidence' && row.queued_at)
        .map((row) => row.queued_at as string)
        .sort()[0] || null
    : health.queue.oldest_queued_at
  return {
    formation: nextFormation,
    health: {
      ...health,
      ...(total === 0 ? {
        state: 'idle' as const,
        blocker: null,
        message: nextFormation.building_evidence
          ? `${nextFormation.building_evidence} provisional pattern${nextFormation.building_evidence === 1 ? ' is' : 's are'} still building evidence.`
          : 'No theme compilation work is queued.',
      } : {}),
      queue: {
        ...health.queue,
        total,
        awaiting_validation: awaitingValidation,
        awaiting_revalidation: awaitingRevalidation,
        blocked_incomplete_audit: blockedIncompleteAudit,
        oldest_queued_at: oldestQueuedAt,
      },
    },
  }
}

const cancelThemeDetailRequest = () => { themeDetailRequestSeq++ }
let selectGen = 0 // bumped on every selectTicker; async work bails if it changed (fast-switch guard)
let dataNeedsRequestSeq = 0 // same-selection refreshes can also race; newest exact-run request owns the dock
export const DATA_NEEDS_RETRY_MS = 750 // one bounded cold-read recovery; exact selection is rechecked around it
let archiveToken = 0 // bumped on every archive search; a stale slow response bails if it changed (last-write-wins)
let facetsToken = 0 // same guard for a standalone facets load (contextless / on dropdown open)
let creditProbed = false
// ---- resilient core-data load (decoupled from the heartbeat) ----
// init() loads the heavy graph + ticker list AFTER starting the heartbeat, so a slow/failing swarm or
// tickers can never pin the UI. These track which parts have loaded so the background retry refetches
// only what's still missing, and stops once both are in. `connected`/`health` are owned solely by the
// heartbeat — loadCore never touches them (in live mode).
let coreGraphLoaded = false
let coreTickersLoaded = false
let coreReadyRecorded = false
let coreRetryTimer: any = null

// ---- engine heartbeat (the real source of truth for the online/offline indicator) ----
// `connected` (below) only flips false on the INITIAL load failure; SSE onerror keeps run streams open,
// so a mid-session engine loss (the laptop sleeps) is invisible to it. This independent /api/health poll
// detects it and drives `health`. A generation counter lets checkHealthNow()/restart cancel an in-flight
// tick's continuation, so two timers never coexist.
let healthTimer: any = null
let healthAbort: AbortController | null = null
let healthLoopRunning = false
let healthListenersBound = false
let healthGen = 0
const HEALTH_OK_MS = 20000 // healthy cadence
const HEALTH_DEGRADED_MS = 2500 // poll fast while down so recovery is near-instant
// Tolerate a tunnel/cold-start spike. The edge Worker gives /api/health an 8s budget, so the client must
// not give up first — a 4s client timeout was a cause of false "engine offline" while the wire was live.
const HEALTH_TIMEOUT_MS = 7000
const OFFLINE_THRESHOLD = 3 // consecutive GENUINE fails before we even consider the red bar (anti-flicker)
// A restart/redeploy of the laptop engine takes ~15-30s; a genuinely asleep/offline machine stays down. So
// while the engine is unreachable we hold the calm 'reconnecting' state (amber pill, no alarming red bar)
// until the outage has continuously outlasted this grace window — only then do we escalate to
// 'engine-offline'. Without it, every routine redeploy flashed the scary "machine is asleep or offline"
// banner for the ~20s the engine was restarting. `outageStartedAt` is the wall-clock ms the current outage
// began (0 = not in an outage), cleared the moment the engine answers again.
const OFFLINE_GRACE_MS = 40000
let outageStartedAt = 0
// A reviewed deploy keeps the read/SSE planes alive while the admission kernel is intentionally closed.
// Once /api/health proves that state, only a later health response may clear it; an unrelated live SSE
// byte must never repaint the cockpit as launch-ready between probes.
let deploymentAdmissionBlocked = false
// A news/run SSE event within this window proves the engine is up — the live data plane is the ground
// truth, so a slow/failed health probe is overridden while the wire is demonstrably alive. Updated on every
// SSE message by _noteStreamLive(); paired with newsSource.readyState===OPEN for the event-quiet gaps.
const STREAM_LIVE_MS = 20000
let lastStreamActivityAt = 0
const HARD_DOWN = new Set<HealthState>(['engine-offline', 'your-network', 'session-expired'])
export const isLaunchHealthBlocked = (health: HealthState): boolean => health === 'updating' || HARD_DOWN.has(health)
export const isEngineUnavailable = (health: HealthState): boolean => HARD_DOWN.has(health)

export const PROVIDER_REDISCOVERY_DELAYS_MS = [2_000, 5_000, 10_000, 20_000, 30_000] as const

export function providerCatalogNeedsRediscovery(providers: ProvidersRead): boolean {
  if (providers.catalogState === 'fallback') return false
  return providers.catalogState === 'unknown'
    || providers.claude.status === 'unknown'
    || providers.codex.status === 'unknown'
}

function clearProviderRediscovery(): void {
  if (providerRediscoveryTimer) clearTimeout(providerRediscoveryTimer)
  providerRediscoveryTimer = null
  providerRediscoveryAttempt = 0
}

function reconcileProviderRediscovery(get: () => State): void {
  if (!providerCatalogNeedsRediscovery(get().providers)) {
    clearProviderRediscovery()
    return
  }
  if (providerRediscoveryTimer) return
  const delay = PROVIDER_REDISCOVERY_DELAYS_MS[Math.min(providerRediscoveryAttempt, PROVIDER_REDISCOVERY_DELAYS_MS.length - 1)]
  providerRediscoveryTimer = setTimeout(() => {
    providerRediscoveryTimer = null
    const state = get()
    if (!providerCatalogNeedsRediscovery(state.providers)) {
      clearProviderRediscovery()
      return
    }
    if (state.staticMode || providerChecksInFlight > 0 || HARD_DOWN.has(state.health)) {
      reconcileProviderRediscovery(get)
      return
    }
    providerRediscoveryAttempt++
    void state.refreshProviders()
  }, delay)
}

// Auto-resume of interrupted screener runs (a closed laptop / dropped connection): per-signal attempt
// bookkeeping so we never spin a persistently-failing run forever, and never double-launch one already
// resuming. Module-level (not store state) so re-attempts don't churn React. A capacity/exclusivity
// reject doesn't count as a try — it just means "wait for a slot", retried on the next board fetch.
const autoResumeTries = new Map<string, { count: number; lastAt: number }>()
// events whose signal-state read is currently in flight — guards concurrent fetchSignalState WITHOUT
// parking a 'loading' sentinel in the store, so a refetch keeps the last-known badge visible (no flash).
const signalStateInFlight = new Set<string>()
let scBoardFetchGeneration = 0 // newest board request owns fetch status/data; slow older responses are ignored
const AUTO_RESUME_MAX = 3 // give up after this many real failures → fall back to the manual Continue
const AUTO_RESUME_COOLDOWN_MS = 30_000 // min gap between re-attempts of the SAME signal
const AUTO_RESUME_BATCH = 4 // most to kick off per cycle (the server's own cap gates the rest)

export interface StreamRow { runId: string; ticker: string; key: string; name: string; module: string; layer: number; status: NodeStatus; verdict?: string | null; ts: number }
export interface ActiveRun {
  runId: string; ticker: string; kind: string; module?: string; agent?: string; status: string; swarmId?: string; costUsd?: number; willCommitToMain?: boolean; plannedCount?: number; startedAt?: number
  continuation?: boolean
  // this run's OWN folder, captured from the run-started event — lets the run-done/run-error refresh target
  // exactly the run that finished, instead of resolving by ticker to the (possibly older) standing run
  runRoot?: string | null
  provider?: RunProvider
  executionProfile?: import('./provider').ProviderExecutionProfile
  profileKey?: string
  model?: string
  reasoningLevel?: string
  chainId?: string
  executionEpoch?: string
  // live-heartbeat fields (run-heartbeat SSE, ~3s cadence) — all optional so an older server (deploy
  // skew) simply renders no heartbeat line (fail closed):
  agentsDone?: number
  agentsTotal?: number
  lastStdoutAt?: number // when the engine child last produced ANY output — the "alive" signal
  lastActivity?: RunActivity // the orchestrator's latest tool call — what it's DOING
  publicationPhase?: RunPublicationPhase // backend-owned save/publish state after provider work ends
}

export interface ReadinessGateState {
  runId: string
  report: ReadinessReport
  chainId?: string
  /** Deploy-skew fallback: one logical chain can have several old-server child owners. */
  memberRunIds?: string[]
  rechecking?: boolean
}

export interface ReadinessRecoveryState {
  chainId: string
  state: 'rechecking' | 'incompatible'
  message: string
}

export type ReadinessDecisionOutcome = 'accepted' | 'active' | 'stale' | 'failed'

/** Recheck POSTs acknowledge before the scan finishes; only SSE may release this UI latch. */
export function readinessDecisionWaitsForSse(action: string, outcome: ReadinessDecisionOutcome): boolean {
  return action === 'recheck' && (outcome === 'accepted' || outcome === 'active')
}

/** Keep this byte-for-byte equivalent to the server's positive empty proof. Parser usability is not proof. */
export function isPhysicallyEmptyReadiness(report: ReadinessReport): boolean {
  return report.physicalPool?.state === 'empty'
    && report.physicalPool.nonEmptyFileCount === 0
    && report.physicalPool.fileCount === report.fileCount
    && (
      (report.physicalPool.fileCount === 0
        && report.issues.some((issue) => issue.severity === 'blocker' && issue.code === 'zero_files'))
      || (report.physicalPool.fileCount > 0
        && report.issues.some((issue) => issue.severity === 'blocker' && issue.code === 'zero_usable_data'))
    )
}

function readinessGateKey(gate: Pick<ReadinessGateState, 'runId' | 'chainId'>): string {
  return gate.chainId ? `chain:${gate.chainId}` : `run:${gate.runId}`
}

function readinessGateMembers(gate: ReadinessGateState): string[] {
  return Array.from(new Set([gate.runId, ...(gate.memberRunIds ?? [])]))
}

function readinessGateOwnsRun(gate: ReadinessGateState, runId: string): boolean {
  return readinessGateMembers(gate).includes(runId)
}

function mergeReadinessGate(owner: ReadinessGateState, incoming: ReadinessGateState): ReadinessGateState {
  const ownerReplay = owner.runId === incoming.runId
  return {
    ...owner,
    ...(ownerReplay ? incoming : {}),
    runId: owner.runId,
    chainId: owner.chainId ?? incoming.chainId,
    memberRunIds: Array.from(new Set([...readinessGateMembers(owner), ...readinessGateMembers(incoming)])),
  }
}

/**
 * One chain owns one prompt. Different chains remain FIFO; an older server's per-child owners are folded
 * into the first chain owner so deploy skew cannot turn one Full/Continue into several user decisions.
 */
export function enqueueReadinessGate(
  current: ReadinessGateState | null,
  queued: ReadinessGateState[],
  incoming: ReadinessGateState,
): { current: ReadinessGateState; queued: ReadinessGateState[] } {
  if (!current) return { current: { ...incoming, memberRunIds: readinessGateMembers(incoming) }, queued }
  if (readinessGateKey(current) === readinessGateKey(incoming)) {
    return { current: mergeReadinessGate(current, incoming), queued }
  }
  const i = queued.findIndex((gate) => readinessGateKey(gate) === readinessGateKey(incoming))
  if (i < 0) return { current, queued: [...queued, incoming] }
  const next = queued.slice()
  next[i] = mergeReadinessGate(next[i], incoming)
  return { current, queued: next }
}

export function updateReadinessGate(
  current: ReadinessGateState | null,
  queued: ReadinessGateState[],
  runId: string,
  update: (gate: ReadinessGateState) => ReadinessGateState,
): { current: ReadinessGateState | null; queued: ReadinessGateState[] } {
  if (current && readinessGateOwnsRun(current, runId)) return { current: update(current), queued }
  const i = queued.findIndex((gate) => readinessGateOwnsRun(gate, runId))
  if (i < 0) return { current, queued }
  const next = queued.slice()
  next[i] = update(next[i])
  return { current, queued: next }
}

export function resolveReadinessGate(
  current: ReadinessGateState | null,
  queued: ReadinessGateState[],
  runId: string,
): { current: ReadinessGateState | null; queued: ReadinessGateState[] } {
  if (!current || !readinessGateOwnsRun(current, runId)) {
    const nextQueued = queued.flatMap((gate) => {
      if (!readinessGateOwnsRun(gate, runId)) return [gate]
      if (gate.runId === runId) return []
      return [{ ...gate, memberRunIds: readinessGateMembers(gate).filter((id) => id !== runId) }]
    })
    return { current, queued: nextQueued }
  }
  // The elected owner resolving releases the one visible chain prompt. A non-owner terminal frame only
  // removes that old-server member; the real owner remains actionable.
  if (current.runId !== runId) {
    return {
      current: { ...current, memberRunIds: readinessGateMembers(current).filter((id) => id !== runId) },
      queued,
    }
  }
  const [next, ...rest] = queued
  return { current: next ?? null, queued: rest }
}

/** A terminal/404 frame is not a chain-wide readiness decision. During rolling deploys several old-server
 * children can still own independent gates which the browser folded into one logical prompt. If the elected
 * owner ends, keep that chain in its FIFO position and promote one surviving member instead of making the
 * remaining paused child invisible. `resolveReadinessGate` remains the chain-decision path. */
export function terminateReadinessGateMember(
  current: ReadinessGateState | null,
  queued: ReadinessGateState[],
  runId: string,
): { current: ReadinessGateState | null; queued: ReadinessGateState[] } {
  const removeMember = (gate: ReadinessGateState): ReadinessGateState | null => {
    if (!readinessGateOwnsRun(gate, runId)) return gate
    const remaining = readinessGateMembers(gate).filter((id) => id !== runId)
    if (remaining.length === 0) return null
    if (gate.runId !== runId) return { ...gate, memberRunIds: remaining }
    return { ...gate, runId: remaining[0], memberRunIds: remaining, rechecking: false }
  }

  if (current && readinessGateOwnsRun(current, runId)) {
    const nextCurrent = removeMember(current)
    if (nextCurrent) return { current: nextCurrent, queued }
    const [next, ...rest] = queued
    return { current: next ?? null, queued: rest }
  }

  const nextQueued = queued.flatMap((gate) => {
    const next = removeMember(gate)
    return next ? [next] : []
  })
  return { current, queued: nextQueued }
}

/** Snapshot polling may observe the middle of an accepted re-check before its outcome SSE. Preserve the
 * exact gate and its FIFO position in that state; only a confirmed non-gate state may resolve it. */
export function reconcileReadinessGateSnapshot(
  current: ReadinessGateState | null,
  queued: ReadinessGateState[],
  runId: string,
  status: string,
): { current: ReadinessGateState | null; queued: ReadinessGateState[] } {
  return status === 'readiness-checking'
    ? updateReadinessGate(current, queued, runId, (gate) => ({ ...gate, rechecking: true }))
    : resolveReadinessGate(current, queued, runId)
}

function resolveReadinessChain(
  current: ReadinessGateState | null,
  queued: ReadinessGateState[],
  chainId: string,
): { current: ReadinessGateState | null; queued: ReadinessGateState[] } {
  if (current?.chainId === chainId) {
    const [next, ...rest] = queued
    return { current: next ?? null, queued: rest }
  }
  return { current, queued: queued.filter((gate) => gate.chainId !== chainId) }
}

function withoutReadinessRecovery(
  recovery: Record<string, ReadinessRecoveryState>,
  runIds: string[],
): Record<string, ReadinessRecoveryState> {
  if (!runIds.some((runId) => recovery[runId])) return recovery
  const next = { ...recovery }
  for (const runId of runIds) delete next[runId]
  return next
}
// A toast may carry ONE inline action (e.g. "Run anyway" on a run-lock conflict) so a dead-end rejection
// becomes a one-click recovery. A toast with an action stays up longer (the user has to read + click it).
export interface Toast { msg: string; tone: 'info' | 'good' | 'bad'; action?: { label: string; onClick: () => void } }

// A priced launch belongs to one exact cockpit selection. The estimate and the confirmation retain this
// identity instead of re-reading selectedTicker/activeSwarm after an await, when the user may already be
// looking at another company or swarm.
export interface LaunchSelectionBinding extends FrozenProviderLaunch {
  subject: string
  swarm: string
  selectToken: number
  runRoot?: string
  decisionFingerprint?: string
  planOrigin?: {
    planPath: string
    planSha256: string
    sourceDecisionFingerprint: string
  }
}

type LaunchConfirmation =
  | {
      kind: 'module'
      selection: LaunchSelectionBinding
      module: string
      unfinishedSpecialists: number
      inputModules: string[]
    }
  | {
      kind: 'full' | 'rerun'
      selection: LaunchSelectionBinding
      preflight: LaunchPreflight
      cascade?: CascadeNode[]
      node?: { module: string; name: string; key: string }
    }

export type ResumeConfirmation = {
  selection: FrozenProviderLaunch
  records: RecordedRunExecution[]
  label: string
  doneCount: number
  totalCount: number
  unit: ResumableRunInfo['unit']
  preflight?: LaunchPreflight
  /** Exact v2 plan shown in this modal. Confirm posts this byte-for-byte receipt; it must never fetch a
   * newer/wider payable scope behind the user's already-given consent. Provider/profile changes replace it. */
  reviewedPlan?: ThesisPlan
  requestId?: string
} & (
  | { kind: 'run'; info: ResumableRunInfo }
  | { kind: 'signal'; sigId: string; until?: string; override?: boolean }
)

// A run is "live" (counts for launch guards) only while starting/running. Finished runs linger in
// activeRuns for the panel until the next ticker switch prunes them.
// Every server status a run holds while in flight — INCLUDING the pre-spawn gate states, which the
// early-acked launch now surfaces to the client (heartbeat/snapshot) instead of hiding inside a held
// HTTP response. Dropping them here would evict a gate-parked run from the live view.
const LIVE_RUN = new Set(['starting', 'readiness-checking', 'awaiting-readiness-decision', 'running'])
// Subject labels are only unique INSIDE a swarm (research GOLD and commodity GOLD are different work).
// Every live-run decision therefore uses the compound identity. A missing swarm id fails closed: current
// engines always return it, and guessing "research" during deploy skew can reconnect/paint another swarm.
const runMatchesSubject = (run: { ticker: string; swarmId?: string }, subject: string | null, swarm: string): boolean =>
  !!subject && run.ticker === subject && run.swarmId === swarm
const runsForSubject = (runs: Record<string, ActiveRun>, subject: string | null, swarm: string): ActiveRun[] =>
  subject ? Object.values(runs).filter((r) => runMatchesSubject(r, subject, swarm) && LIVE_RUN.has(r.status)) : []
const runningSubjectsForSwarm = (runs: { ticker: string; swarmId?: string }[], swarm: string): Set<string> =>
  new Set(runs.filter((r) => r.swarmId === swarm).map((r) => r.ticker))
const runSubjectKey = (swarm: string, subject: string): string => `${swarm}\0${subject}`

interface State {
  connected: boolean
  health: HealthState
  deploymentLag: DeploymentLag | null
  healthFailCount: number
  lastHealthOkAt: number | null
  staticMode: boolean
  snapshotAt: string | null
  dataDir: string | null
  tickers: TickerSummary[]
  emptyState: boolean
  driveEnabled: boolean // true when the server has a Drive destination + credential — gates add-company/upload UI
  /** Weaker, separate capability: watchlist thesis PDFs need only a writable Drive MOUNT (data/ is a
   *  symlink into Drive for Desktop), which needs no credential. Gating attachments on driveEnabled hid
   *  the feature on every machine where the API was never configured — which is the normal setup. */
  watchlistFilesEnabled: boolean
  defaultCoverage: CoverageGroup[] // upload-guide groups (all unmet), for the zero-folders onboarding state
  selectedTicker: string | null
  graph: SwarmGraph | null
  nodesByKey: Map<string, AgentNode>
  dataStatus: DataStatus | null
  dataLoading: boolean
  dataScan: DataScanProgress | null
  credit: Usage | null
  creditChecking: boolean
  runProvider: RunProvider
  runProfileKeys: Record<RunProvider, string>
  providers: ProvidersRead
  providersChecking: boolean
  setRunProvider: (provider: RunProvider) => void
  setRunProfile: (provider: RunProvider, profileKey: string) => void
  refreshProviders: (provider?: RunProvider) => Promise<void>
  nodeRuntime: Record<string, NodeRuntime>
  now: number // shared 1s clock for every live timer (orb/module/panel/tooltip); ticked only while orbs run
  activeRuns: Record<string, ActiveRun> // selected-ticker live runs (+ just-finished, until next switch)
  pendingAdmissions: PendingAdmission[] // durable Run/Continue intents waiting across a reviewed update/restart
  resumableRuns: ResumableRunInfo[] // disk-truth set of interrupted runs the cockpit can resume (all swarms)
  activeRunsByTicker: Set<string> // live subject labels in activeSwarm only; globalActive remains unfiltered
  chainTickers: Set<string> // swarm\0subject keys whose full run is a per-module CHAIN
  selectToken: number
  runStream: StreamRow[]
  coreBloom: boolean
  decision: any | null
  runRoot: string | null
  reports: { memo: boolean; thesis: boolean; dossier: boolean }
  // per-module three tiers (run-root-relative paths), keyed by module folder name. Generic — any module lights up.
  moduleReports: Record<string, { synthesis?: string; memo?: string; dossier?: string }>
  /** `body` is content the panel already HAS, for a document that is not a readable repo path — a
   *  watchlist thesis attachment lives under a reserved data folder that `api.output` cannot read. With a
   *  body present the reader renders it directly instead of fetching. */
  /** `embedUrl` renders the document IN the reader via the PDF viewer plugin instead of navigating to it.
   *  Navigation is what a browser can be configured to intercept — Chrome's "download PDFs instead of
   *  opening them" setting turns any inline PDF into a download no header can override — whereas an
   *  embedded frame still renders. So a PDF thesis opens in the cockpit rather than depending on how the
   *  reader's browser happens to be configured. */
  openOutput: { path?: string; title: string; verdict?: string | null; nodeKey?: string; pending?: boolean; body?: string; embedUrl?: string; publishedCalls?: boolean } | null
  // ---- chat with your data (closed-book Q&A over a scope's synthesized output) ----
  chatOpen: boolean
  chatScope: ChatScope
  chatModule?: string
  chatOrbPath?: string
  chatOrbKey?: string
  // Set only when RESUMING a saved conversation whose scope the CURRENT run can't serve (a newer/mid-flight
  // run replaced it): the run folder the next turn is answered from — the run the conversation was originally
  // answered from, whose files are still on disk. undefined ⇒ answer from the live current run (fresh chats,
  // and resumes the current run still serves). Also tells the panel a resumed thread is answerable (not "run first").
  chatAnswerRunRoot?: string
  chatTitle: string
  chatModel: string
  chatStyle: ChatStyle // narration style — sticky preference, default 'simple'
  chatMemoryMode: AskMemoryMode // Auto by default; run/news are optional in-drawer overrides
  chatMemory?: AskMemoryMeta // receipt from the most recent completed/active turn
  chatMessages: ChatMessage[]
  chatStreaming: boolean
  // What the in-flight turn is doing right now (real streamed stages — see ChatWork in types.ts). null ⇒ idle.
  chatWork: ChatWork | null
  chatError?: string
  chatRetryText?: string // failed turns roll back; this keeps the exact question available to Retry
  chatRetryTurnId?: string // Retry reuses the same durable idempotency key; it never saves a duplicate turn
  chatSource?: string // sourcePath from chat-meta — "answering from …"
  chatConversationId?: string // id of the persisted conversation this thread belongs to (from chat-meta)
  chatHistoryOpen: boolean // the saved-conversation browser is open
  // ---- news chat (closed-book Q&A over the saved firehose + archive) ----
  newsChatOpen: boolean
  newsChatWindow: NewsChatWindow
  newsChatMessages: ChatMessage[]
  newsChatStreaming: boolean
  newsChatError?: string
  newsChatReceipt?: NewsChatReceipt
  newsChatEvidence: NewsChatEvidence[]
  newsChatCompletedTurn?: NewsChatCompletedTurn
  newsChatRetryText?: string
  newsChatRetryTurnId?: string
  newsChatConversationId?: string
  activityOpen: boolean // the Activity dock (live runs + the audit history) — auto-opens whenever a run goes live
  scoringOpen: boolean
  valuationPlaygroundOpen: boolean
  callsOpen: boolean
  selectedNodeKey: string | null
  launchConfirm: LaunchConfirmation | null
  // Every manual continuation stops here before it can spend. Unlike automatic recovery (which remains
  // exact-profile only), this user-owned boundary may intentionally select another reviewed profile or
  // provider; the runtime records that continuation as mixed-profile / mixed-provider provenance.
  resumeConfirm: ResumeConfirmation | null
  // Synchronous click→feedback state: set BEFORE any launch-family await so every Run control renders
  // an instant pending state (spinner + disabled), cleared in the action's finally. `key` identifies
  // the specific control so only IT spins; `ticker` scopes stage-level ambient indicators.
  launchPending: { key: string; label: string; ticker: string; selection?: LaunchSelectionBinding } | null
  // Runs the user asked to stop, before the terminal SSE lands — drives "Stopping…" button states.
  stoppingRuns: Record<string, true>
  toast: Toast | null

  // ---- swarms (multi-swarm cockpit; research is the grandfathered default) ----
  swarms: SwarmMeta[]
  activeSwarm: string // 'research' | 'screener' | future swarms
  // which constellation swarm currently owns the SHARED graph/selectedTicker slices (research or a
  // constellation swarm like commodity). Both use the same constellation UI, so switching between them
  // must reset the selection — this tracks the owner so a screener detour never clears it.
  constellationSwarm: string
  // subjects of the active NON-research constellation swarm (e.g. commodity ids GOLD/SUGAR), for its
  // subject picker; research uses `tickers`.
  swarmSubjectList: string[]
  // per-subject run summary (verdict/confidence/date), keyed by subject id — the constellation twin of
  // the research `tickers` decision pill, so the commodity picker can show runs the way research does.
  // Only subjects that have run carry a verdict; the rest come back hasRun:false.
  swarmSubjectRuns: Record<string, SwarmSubjectSummary>
  // true while loadSwarmSubjects is in flight — lets the subject picker show a real loading state on
  // first entry instead of flashing "no subjects yet" before the list resolves.
  swarmSubjectsLoading: boolean
  loadSwarmSubjects: (swarmId: string) => Promise<void>
  // research stage renderer: the 3D globe (default) or the flat 2D constellation. Persisted.
  researchView: ResearchView
  // ---- watchlist (the research stage's third view) ----
  watchlist: WatchlistRead | null
  watchlistLoading: boolean
  watchlistError: string | null
  watchlistAt: number | null
  /** How many conditions are met right now — the count badge on the pill, visible from the other views. */
  watchlistMetCount: number
  watchlistShowArchived: boolean
  watchlistPending: string | null
  watchlistLayout: WatchlistLayout
  setWatchlistLayout: (l: WatchlistLayout) => void
  /** The add/edit panel. `prefill` carries what the decision record already knows, so a researched name
   *  needs nothing retyped and is quotable the moment it is saved. */
  watchComposer: { open: boolean; entryId: string | null; prefill: WatchRowInput | null; openedAt: number } | null
  loadWatchlist: (force?: boolean) => Promise<void>
  setWatchlistShowArchived: (v: boolean) => void
  archiveWatch: (ticker: string, currency: string | null, reason: string, muteScope?: 'assertion' | 'listing') => Promise<boolean>
  restoreWatch: (ticker: string, currency: string | null) => Promise<boolean>
  openWatchComposer: (prefill?: WatchRowInput | null, entryId?: string | null) => void
  closeWatchComposer: () => void
  saveWatchRow: (input: WatchRowInput, entryId?: string | null, files?: File[]) => Promise<boolean>
  detachWatchFile: (entryId: string, attachmentId: string) => Promise<void>
  setResearchView: (v: ResearchView) => void
  webglOK: boolean // WebGL available — gates the globe; when false the flat DOM constellation is shown instead
  // the warp transition between swarms; landing carries an optional research ticker to preselect
  warp: { from: string; to: string; payloadTicker?: string; landTicker?: string; phase: 'collapse' | 'traverse' | 'bloom' } | null
  // screener slice (self-contained so the research paths stay untouched)
  scGraph: SwarmGraph | null
  scNodesByKey: Map<string, AgentNode>
  scRuntime: Record<string, NodeRuntime>
  scSelectedSignal: string | null // SIG id whose run folder is shown on the gauntlet
  scBoard: ScreenerBoard | null
  // The board poll previously swallowed every exception, so an unreachable engine looked exactly like
  // an eternally-empty Ideas tab. Preserve the last good board but expose whether it is still refreshing.
  scBoardFetch: { status: 'idle' | 'loading' | 'refreshing' | 'ready' | 'error'; error: string | null; lastSuccessAt: number | null }
  scRouted: Record<string, { route: string; terminal: boolean }> // module -> latest routing (lights the switchyard)
  signalIntakeOpen: boolean
  signalIntakeSeed: SignalIntakeInput | null
  pipelineOpen: boolean
  // Bumped to ask the (always-mounted, self-collapsing) Data-pool panel to expand itself right now — e.g.
  // the news-bridge chip, after selecting the subject holding the newest routed note, so the click actually
  // reveals the note instead of just switching the selected ticker behind a still-collapsed panel (Codex
  // #374 P2). A nonce, not a boolean: the panel's own open/close state stays local (each click can toggle
  // it independently), this only ever pushes it OPEN, once, on each bump — the effect fires on every change,
  // including a nonce that happens to repeat a prior value's tail digits, because it is a monotonic counter.
  dataPoolExpandRequest: number
  // ---- Data Library (cross-swarm — deliberately NOT reset on a swarm switch) ----
  dataLibraryOpen: boolean
  // ---- Memory (one read-only, cross-swarm overlay; deliberately survives a swarm switch) ----
  memoryOpen: boolean
  // ---- Tools (small cross-swarm utilities; one workspace, many future mini-apps) ----
  toolsOpen: boolean
  dlSelectedId: string | null // THE list<->detail field: null = list, an id = that pipeline's detail
  pipelines: PipelinesRead | null // null until /api/pipelines answers (the Data button gates on this, §5)
  pipelinesError: string | null
  dlFilters: DlFilterState
  // live-book (Recent-runs drawer) filter + sort + archived-tray state — held here, not in the panel,
  // because the panel unmounts on close (a glance-leave-return surface; filters should survive reopen)
  scBookFilters: BookFilterState
  scBookSort: BookSort
  scBookArchivedOpen: boolean
  scThesisDetail: { thesis: any; candidates: any; handoffs: any[]; conviction?: ConvictionDetail | null } | null
  scSelectedEvent: FeedItem | null // a wire event the user clicked to read in the main stage (before deciding to run it)
  scFocusedCompany: FocusedCompany | null // a company the user drilled into — the main stage shows all its wire news

  init: () => Promise<void>
  startHealth: () => void
  stopHealth: () => void
  checkHealthNow: () => Promise<void>
  _tickHealth: () => Promise<void>
  // runRoot (optional): open a SPECIFIC historical run of the ticker from the run-history expander; omitted,
  // the ticker resolves to its standing run (newest that decided).
  selectTicker: (t: string, runRoot?: string) => Promise<void>
  requestDataPoolExpand: () => void
  refreshData: () => Promise<void>
  // ---- in-app add-company + Drive upload (Change C) ----
  addCompanyOpen: boolean
  uploadTarget: string | null // ticker the uploader writes into (a new company, or the selected one)
  uploadProgress: Record<string, number> // filename -> 0..1 live upload progress
  uploadErrors: { filename: string; reason: string }[]
  uploading: boolean
  openAddCompany: () => void
  closeAddCompany: () => void
  openUploader: (ticker: string) => void
  addCompany: (input: NewCompanyInput) => Promise<boolean>
  uploadFiles: (ticker: string, files: File[]) => Promise<void>
  refreshActiveRuns: () => Promise<void>
  refreshPendingAdmissions: () => Promise<void>
  cancelPendingAdmission: (requestId: string) => Promise<void>
  // disk-truth resumable set (interrupted runs across all swarms) + the manual Resume trigger. The
  // Activity log and the orb view join their rows/subjects against `resumableRuns` to show a Resume
  // affordance; `resumeRun` relaunches the unit into its existing folder, continuing from work on disk.
  refreshResumable: () => Promise<void>
  resumeRun: (info: ResumableRunInfo) => Promise<void>
  confirmResume: () => Promise<void>
  changeResumeProvider: (provider: RunProvider) => Promise<void>
  changeResumeProfile: (profileKey: string) => Promise<void>
  cancelResume: () => void
  checkCredit: () => Promise<void>
  selectNode: (key: string | null) => void
  setNow: (n: number) => void
  // The decision dock's MEASURED height. It is an absolute, bottom-anchored overlay on the same stage as
  // the constellation, so the field has to reserve real pixels under itself or the master-thesis core is
  // drawn behind it (it was). Measured rather than assumed because the dock grows a "newer data" notice
  // and its metric strip wraps — a static guess is wrong in exactly the states that matter. 0 when the
  // dock is not mounted, which is the honest "no reserve needed".
  stageDockH: number
  setStageDockH: (h: number) => void
  nodeStatus: (key: string) => NodeStatus
  activeRunsForTicker: (t: string | null) => ActiveRun[]
  anyRunForTicker: (t: string | null) => boolean
  targetInFlight: (t: string | null, keys: string[]) => boolean
  launchAgent: (node: AgentNode, force?: boolean) => Promise<void>
  launchModule: (module: string, force?: boolean) => Promise<void>
  confirmModule: () => Promise<void>
  requestFull: () => Promise<void>
  confirmFull: () => Promise<void>
  launchRerun: (node: { module: string; name: string; key: string }, planOrigin?: LaunchSelectionBinding['planOrigin']) => Promise<void>
  confirmRerun: () => Promise<void>
  changeLaunchProvider: (provider: RunProvider) => Promise<void>
  changeLaunchProfile: (profileKey: string) => Promise<void>
  cancelLaunch: () => void
  cancelRun: (runId: string) => Promise<void>
  readinessGate: ReadinessGateState | null // one visible decision owner; null = hidden
  readinessGateQueue: ReadinessGateState[] // FIFO across distinct logical chains
  readinessRecovery: Record<string, ReadinessRecoveryState> // non-empty chained deploy-skew recovery; never a user prompt
  decideReadiness: (runId: string, action: string, ack?: string) => Promise<ReadinessDecisionOutcome>
  selectNodeForRun: (node: AgentNode) => void
  openOutputForNode: (node: AgentNode) => Promise<void>
  openThesis: () => Promise<void>

  // ---- complete the thesis ----
  // The core orb used to dead-end on "No final thesis yet". Now a click with no thesis opens a plan: what is
  // missing, what already exists on disk (and in which dated run), and what finishing it actually costs.
  thesisPlan: ThesisPlan | null
  thesisPlanExecution: FrozenProviderLaunch | null
  thesisPlanOpen: boolean
  thesisPlanLoading: boolean // first load — the panel shows its skeleton
  thesisPlanPricing: boolean // re-pricing after a checkbox toggle — the old price stays put, no flicker
  thesisPlanError: string | null
  // The intake plan for the selected ticker (frameworks/INTAKE.md), refreshed on select + on data-changed.
  // Advisory guidance over the staleness floor — it never flips a module fresh, only pre-selects what to keep.
  intake: IntakePlan | null
  // Orb keys the intake surface lights: focus = transient (hover a doc/plan row), plan = persistent (the
  // affected orbs while a scoped plan exists). SwarmField unions these into its highlight/selection sets.
  intakeFocusKeys: Set<string>
  intakePlanKeys: Set<string>
  intakeAnalyzing: boolean // a manual "analyze new documents" run is in flight (auto-analysis is silent)
  // Every step a live run has taken, oldest first, keyed by runId — one entry per orchestrator tool
  // call (run-activity SSE). This is what lets the "New data" dock name each document as it is read
  // instead of showing a spinner. Capped per run; cleared with the rest of the view on subject switch.
  runActivity: Record<string, RunActivity[]>
  setIntakeFocus: (keys: Set<string>) => void
  analyzeIntake: () => Promise<void> // manual trigger — writes/refreshes the scoped plan; launches no rerun
  // When the thesis plan was scoped by intake, what it kept vs re-ran — so the panel can explain + offer the
  // "re-run everything" escape hatch. Null = the blunt floor (no plan, or the plan didn't narrow anything).
  thesisPlanIntake: ThesisPlanIntake | null
  refreshIntake: () => Promise<void>
  // The structured data needs the run's terminal synthesizer surfaced (decision_record.json data_needs[]),
  // refreshed on select + on data-changed — read by the read-only "Data needs" dock. Null = none / no run.
  dataNeeds: DataNeedsRead | null
  refreshDataNeeds: (runRoot?: string) => Promise<void>
  refreshPipelines: () => Promise<void>
  openDataLibrary: () => void
  closeDataLibrary: () => void
  openMemory: () => void
  closeMemory: () => void
  openTools: () => void
  closeTools: () => void
  setDlSelected: (id: string | null) => void
  setDlFilters: (f: DlFilterState) => void
  // "What changed since the last version" — the server-computed git delta for the run on screen.
  whatChanged: WhatChangedRead | null
  whatChangedOpen: boolean
  refreshWhatChanged: () => Promise<void>
  // Where the price is NOW for the run on screen, plus that run's call re-based onto it. Null until it
  // loads, and null forever when the listing can't be priced honestly — the banner's live cells gate on
  // a positive match, so null simply means those cells don't render.
  liveQuote: QuoteRead | null
  liveQuoteAt: number | null
  refreshLiveQuote: (force?: boolean, runRoot?: string) => Promise<void>
  openWhatChanged: () => void
  closeWhatChanged: () => void
  openThesisPlan: () => Promise<void>
  closeThesisPlan: () => void
  toggleThesisRerun: (module: string) => void // flip one module between "reuse" and "re-run", then re-price
  resetThesisReuse: () => void // the "re-run everything" escape hatch — drop the intake scoping, re-run all stale
  completeThesis: () => Promise<void>
  resumeThesisModule: (module: string) => Promise<void> // the RUN pill — launch one module, resuming its orbs
  // the New-data dock's one-pass scoped rerun (POST /api/intake-plan/run-exact) — attaches immediately
  scopedRerunPending: boolean
  prepareScopedRerun: () => Promise<boolean>
  runScopedRerun: () => Promise<void>

  openReport: (tier: 'memo' | 'thesis' | 'dossier') => Promise<void>
  openModuleReport: (module: string, tier: 'synthesis' | 'memo' | 'dossier') => void
  closeOutput: () => void
  // ---- chat with your data ----
  chatScopesAvailable: () => { run: boolean; modules: { module: string; present: boolean }[]; orbs: { key: string; module: string; path?: string; title: string; present: boolean }[] }
  openChat: (scope: ChatScope, opts?: { module?: string; orbPath?: string; orbKey?: string; title?: string }) => void
  closeChat: () => void
  setChatScope: (scope: ChatScope, opts?: { module?: string; orbPath?: string; orbKey?: string }) => void
  setChatModel: (m: string) => void
  setChatStyle: (s: ChatStyle) => void
  setChatMemoryMode: (mode: AskMemoryMode) => void
  sendChatMessage: (text: string, retryTurnId?: string) => Promise<void>
  clearChat: () => void
  // ---- saved chat history (persisted Ask conversations) ----
  openChatHistory: () => void
  closeChatHistory: () => void
  resumeConversation: (id: string) => Promise<void> // reopen a saved conversation and keep chatting
  startNewChat: () => void // open a fresh Ask conversation (from the history panel or elsewhere)
  deleteConversation: (id: string) => Promise<boolean>
  openActivity: () => void
  closeActivity: () => void
  openScoring: () => void
  closeScoring: () => void
  openValuationPlayground: () => void
  closeValuationPlayground: () => void
  openCalls: () => void
  closeCalls: () => void
  openCallFile: (path: string, title: string) => void
  openInlineDoc: (title: string, body: string) => void
  openEmbeddedDoc: (title: string, embedUrl: string) => void
  updateCall: (ticker: string) => Promise<void>
  fileDueReview: (ticker: string, window: string) => Promise<void>
  refreshDashboard: () => Promise<void>
  setToast: (t: Toast | null) => void
  _handleEvent: (e: SseEvent) => void

  // ---- swarm/screener actions ----
  switchSwarm: (to: string, opts?: { payloadTicker?: string; landTicker?: string }) => void
  // land on a swarm: screener boots its board (scInit); a constellation swarm (research/commodity) resets
  // the shared selection when it changes owner and loads the swarm's subjects. Called on every swarm entry.
  _enterSwarm: (to: string) => void
  _advanceWarp: () => void
  scInit: () => Promise<void>
  // Ordinary refreshes surface errors in scBoardFetch and resolve. Bootstrap asks this one call to
  // propagate a cold failure so scInit can schedule recovery instead of accepting a half-loaded stage.
  scRefreshBoard: (propagateColdFailure?: boolean, bootstrapEpoch?: number) => Promise<void>
  scPromoteIdea: (idea: BoardIdea) => Promise<void>
  scRateIdea: (idea: BoardIdea, polarity: 'up' | 'down' | 'clear', reason?: string) => Promise<void>
  _maybeAutoResume: (resumable: ScreenerBoard['resumable']) => Promise<void>
  scSelectSignal: (sigId: string | null, bootstrapEpoch?: number) => Promise<void>
  scNodeStatus: (key: string) => NodeStatus
  openSignalIntake: () => void
  openSignalIntakeWith: (seed: SignalIntakeInput) => void
  closeSignalIntake: () => void
  submitSignal: (intake: SignalIntakeInput, until?: string) => Promise<void>
  relaunchSignal: (sigId: string) => Promise<void>
  // resume a stopped/partial signal run from where it left off — reuses the finished orbs on disk and
  // only runs the remaining ones (the gauntlet command skips completed modules). NOT a fresh restart.
  // `until` = continue only THROUGH that stage then stop again (undefined = continue to the end).
  // `override` stamps override_promote onto the sig's intake so the gauntlet pushes a signal-gate PARK/LOG
  // cull past the promotion gate — the "Override & run forward" affordance for a "noted, no action" signal.
  continueSignal: (sigId: string, until?: string, override?: boolean) => Promise<void>
  runSweep: () => Promise<void>
  openPipeline: () => void
  closePipeline: () => void
  setBookFilters: (f: BookFilterState) => void
  setBookSort: (s: BookSort) => void
  setBookArchivedOpen: (v: boolean) => void
  openThesisDetail: (thesisId: string) => Promise<void>
  closeThesisDetail: () => void
  sendToResearch: (thesisId: string, ticker: string, poolPresent: boolean) => Promise<void>
  // event-level twin of sendToResearch: route ONE wire event into a tracked subject's data pool as a
  // tier-10 note — the doc-intake machinery then flags the affected orbs in the research tab.
  sendEventToResearch: (it: FeedItem, ticker: string) => Promise<boolean>
  openScreenerOutput: (node: AgentNode) => void
  _handleScreenerEvent: (e: SseEvent) => void
  // the persistent event rail: keep the wire backfilled+streaming whenever the screener stage is mounted,
  // let the user open one event to read it, and run the paid checks straight from that event
  scEnsureNewsStream: (bootstrapEpoch?: number) => Promise<void>
  scSelectEvent: (it: FeedItem | null) => void
  scFocusCompany: (c: FocusedCompany | null) => void
  // `until` = run only THROUGH that stage then stop; `override` = force past a PARK/LOG gate (§ human override).
  runEventChecks: (it: FeedItem, until?: string, override?: boolean) => Promise<void>
  // the run-state of the open event's signal (for the "Run the checks" split button + badge). Keyed by
  // event_id; a lazy READ on open (GET /api/screener/signal-state), refreshed each time the reader opens.
  scSignalState: Record<string, SignalState | 'loading'>
  fetchSignalState: (it: FeedItem) => Promise<void>
  cancelSignalRun: (sigId: string) => Promise<void>
  // shelving: set an event aside (or bring it back) — local, persisted, filters the rail
  shelvedEvents: Set<string>
  toggleShelve: (eventId: string) => void
  // read/unread: which wire items the user has already seen (local, persisted). Opening an event marks it
  // read; markEventsRead is also the "mark all read" verb; seedReadBaseline gives a first-ever visit a
  // clean slate so only genuinely new arrivals show as unread.
  readEvents: Set<string>
  markEventsRead: (ids: string[]) => void
  seedReadBaseline: (items: FeedItem[]) => void
  // card feedback ("flag as irrelevant / mis-scored / …") — flaggedEvents is a local display cache;
  // the server ledger (screener/ledger/screener_feedback.ndjson) is the source of truth
  flaggedEvents: Set<string>
  // which thumb the reader last rated each event with — drives the filled 👍/👎 in the reader (persisted)
  ratedPolarity: Record<string, 'up' | 'down'>
  // `polarity` records which thumb lit up; omit it and it's derived from the reason (`other` needs it explicit)
  submitFeedback: (input: FeedbackSubmitInput, polarity?: 'up' | 'down') => Promise<boolean>
  undoFeedbackFlow: (feedbackId: string, eventId: string) => Promise<void>
  // fast batch review mode: a focused, filtered, keyboard-driven queue over the same wire — reuses
  // submitFeedback above, so there is exactly one storage path for both flows
  reviewOpen: boolean
  reviewFilters: ReviewFilterState
  reviewQueue: FeedItem[] // snapshotted on open / filter change — NOT live-reactive mid-review
  reviewIndex: number
  reviewSessionCount: number // in-memory only; resets every time the panel opens (never persisted)
  reviewSubmitting: boolean // in-flight guard: one review POST at a time, so a held key / double-click can't
  // fire multiple records for the same card or advance past later cards before the save resolves
  coveredTickers: Set<string> // "portfolio companies" proxy — fetched once per panel-open
  openReview: () => void
  closeReview: () => void
  setReviewFilters: (f: ReviewFilterState) => void
  // cockpit-wide product feedback panel — boolean only; the panel owns its own list/compose state
  // (ActivityLog/ReviewPanel pattern), so no fresh-array store selectors (the getSnapshot footgun)
  cockpitFeedbackOpen: boolean
  openCockpitFeedback: () => void
  closeCockpitFeedback: () => void
  // The "Data Pipeline" builder panel (recommended data + add a source + live relevance scan + build → PR).
  // Distinct from the screener's `pipelineOpen`/PipelineBoard. focusNeed prefills the add-source form's
  // target when opened from a data-need card's "Build a feed →".
  dataPipelineOpen: boolean
  dataPipelineFocusNeed: string | null
  openDataPipeline: (needId?: string) => void
  closeDataPipeline: () => void
  reviewSubmit: (feedbackType: FeedbackType, reason: string) => Promise<void>
  reviewSkip: () => void
  // on-demand enrichment for the opened event (the real story / SEC items / prior coverage / related)
  enrichCache: Record<string, EventEnrichment | 'loading'>
  fetchEnrichment: (it: FeedItem) => Promise<void>

  // ask the whole saved news wire, then send a useful answer into the existing Signal Check intake
  openNewsChat: () => void
  closeNewsChat: () => void
  setNewsChatWindow: (window: NewsChatWindow) => void
  sendNewsChatMessage: (text: string, retryTurnId?: string) => Promise<void>
  clearNewsChat: () => void
  sendNewsChatToSignalCheck: () => void

  // ---- the news wire (live scanner view) + manual board actions + kill switch ----
  newsFeedOpen: boolean
  sourcesOpen: boolean
  newsItems: FeedItem[]
  freshEvents: Set<string> // event_ids that just streamed in over SSE — drive the "new detected" glow
  newsArrivedTotal: number // monotonic count of items read off the wire (survives the 1000 cap) — paces the live themes map
  lastScan: { fetched: number; candidates: number; seq: number } | null // the latest ingest cycle's RAW fetch volume — the true "data coming in" intensity that drives the live themes-map flow
  // ---- what the scanner is doing, right now (the visibility surface) ----
  // The engine already streams a full CycleSummary per cycle and a cycle-START the moment one begins; both
  // used to be dropped on the floor. `lastCycle` is the newest summary, `cycleLog` the last CYCLE_LOG_CAP of
  // them (newest first, in-memory only — the firehose file is the durable record).
  lastCycle: CycleSummary | null
  cycleLog: CycleSummary[]
  // set by news-cycle-start, cleared by the matching news-cycle. `since` lets the view expire a stale
  // "looking now" on its own (a cycle that throws emits a start with no matching end), and `phase`
  // separates a real network look ('fetch') from a backlog catch-up ('drain').
  scanningSince: { since: number; phase: 'fetch' | 'drain' } | null
  scIntensity: IntensityStats | null // windowed intake rollup for the ThemeMap (small server aggregates)
  scIntensityWindow: IntensityWindow // derived from the "When" ribbon (themesWindow) — drives the map readout + lane mix; 'scan' = the live per-cycle path
  setIntensityWindow: (w: IntensityWindow) => Promise<void> // internal — driven by setThemesWindow; not a separate user control
  newsStatus: NewsStatus | null
  bridgeStatus: BridgeStatus | null
  newsStreamOnline: boolean // the live news SSE is open — proves the wire is reachable even if the status fetch failed
  feedWindowDays: number // the time-travel window the wire is showing (2 = live; 14/30/90/180/370 = history)
  feedWindowLoading: boolean
  setFeedWindow: (days: number) => Promise<void>
  // ---- archive search (the rail's whole-history filtered read) ----
  scArchiveQuery: ArchiveQuery // the active structured filter; empty = LIVE mode (the 2-day SSE wire)
  scArchiveResults: FeedItem[] // server-filtered matches over the WHOLE archive (recency-ordered, paged)
  scArchiveCursor: SearchCursor | null // resume cursor for the next page (null = no more)
  scArchiveLoading: boolean // a search is in flight (first page)
  scArchiveLoadingMore: boolean // a follow-up page is in flight
  scArchiveScannedThrough: string | null // oldest day searched — "searched all history back to <date>"
  scArchiveExhausted: boolean // reached the archive floor (genuinely nothing older)
  // The search did not COMPLETE (timed out / the engine errored) — as opposed to completing with no matches.
  // An empty result list means those two opposite things, and only this tells them apart. Without it the
  // rail rendered a failed request as the authoritative "genuinely nothing matches AMZN (Amazon) — this is
  // the WHOLE archive", for a company the wire had 160 items about. An unproven absence must never be
  // reported as a proven one (CLAUDE.md §3).
  scArchiveError: string | null
  scFacets: FeedFacets | null // archive-wide facet counts that populate the dropdowns
  scFacetsLoading: boolean
  scRunArchiveSearch: (q: ArchiveQuery) => Promise<void> // set the filter + fetch page 1 (+ facets); empty q → LIVE mode
  scLoadMoreArchive: () => Promise<void> // fetch the next page and append
  scLoadFacets: (q: ArchiveQuery) => Promise<void> // populate the dropdowns from the archive (e.g. on mount, contextless)
  globalActive: ActiveRunLite[]
  stopListOpen: boolean
  openNewsFeed: () => Promise<void>
  // The panel's "refresh": re-pull the window AND force-rebuild the live stream. Split from openNewsFeed so
  // merely opening the panel never tears down a healthy SSE — only an explicit user refresh does.
  refreshNewsFeed: () => Promise<void>
  closeNewsFeed: () => void
  openSources: () => void
  closeSources: () => void
  refreshNewsStatus: () => Promise<void>
  refreshBridgeStatus: () => Promise<void>
  // ---- pipeline diagnostics (the full end-to-end triage/tier/backlog/defer view) ----
  diagnosticsOpen: boolean
  newsDiagnostics: NewsDiagnostics | null
  openDiagnostics: () => Promise<void>
  closeDiagnostics: () => void
  refreshDiagnostics: () => Promise<void>
  revive: () => void // wake/focus/network-return: force a health re-check + status refresh + stream reconnect
  _setNewsStreamOnline: (v: boolean) => void // internal — flips the wire-reachable flag from SSE open/close
  _noteStreamLive: () => void // internal — any SSE event proves the engine is up → flip health online instantly
  checkInboxItem: (row: BoardInboxRow) => Promise<void>
  dismissInbox: (inboxId: string) => Promise<void>
  restoreInbox: (inboxId: string) => Promise<void>
  moveThesis: (thesisId: string, to: 'watchlist' | 'provisional' | 'full_machine' | 'engine', reason?: string) => Promise<void>
  restoreConviction: (thesisId: string) => Promise<void>
  hideIdea: (signalId: string) => Promise<void>
  restoreIdea: (signalId: string) => Promise<void>
  scRebuildBoard: () => Promise<void>
  setStopListOpen: (open: boolean) => void
  stopEverything: () => Promise<void>
  _handleNewsEvent: (e: any) => void

  // ---- dynamic themes (the firehose bucketed into living, ranked investment themes) ----
  themes: Theme[]
  // A separate, non-investable disclosure lane. It never feeds map nodes, dossier selection, or Ideas.
  // Null means the server did not disclose this contract (rolling deploy), not that the queue is empty.
  themeFormationQueue: ThemeFormationQueue | null
  themeCompilerHealth: ThemeCompilerHealth | null
  themesView: 'map' | 'board' | null // null = themes view closed (gauntlet/idle canvas shows)
  // "Best ideas" tab — the PM skim. A sibling of Themes in the wire's tab row: when true, the main pane
  // shows BestIdeasView instead of the home/gauntlet. Mutually exclusive with Themes (opening one closes
  // the other), exactly like themesView.
  ideasOpen: boolean
  // "Calendar" tab — the forward events calendar (upcoming earnings + macro, server /api/calendar). Another
  // sibling of Themes/Best-ideas in the wire's tab row; mutually exclusive with them.
  calendarOpen: boolean
  themesWindow: number | null // the selected time-window lookback in HOURS; null = Live (real-time)
  themesHistoryDays: number // days of real daily-flow history the engine has (gates the long windows)
  themesGeneratedAt: string | null // server timestamp for the last successfully loaded index (cached-state honesty)
  themesProjectedAt: string | null // read-time decay projection; never substitutes for themesGeneratedAt freshness
  // the "Where" geography picker (owned by the Event rail) mirrored here so the Themes view slices by it —
  // empty country+geoRegion = the global (un-filtered) index. `label` is the country/continent display name.
  themesGeo: { country: string; geoRegion: string; label: string }
  setThemesGeo: (geo: { country: string; geoRegion: string; label: string }) => void
  selectedTheme: string | null // open deep-dive
  themeDetail: ThemeDetail | null // the open theme's resolved members + companies-by-order
  themeDetailError: string | null // explicit detail GET failure; null while loading/ready
  themeBrief: ThemeBrief | null // the open theme's plain-English explainer (loaded separately, may lag the detail)
  themeBriefLoading: boolean
  themesStatus: 'idle' | 'loading' | 'ready' | 'error'
  themesLoading: boolean
  openThemes: (view: 'map' | 'board') => Promise<void>
  closeThemes: () => void
  openIdeas: () => void
  closeIdeas: () => void
  openCalendar: () => void
  closeCalendar: () => void
  setThemesView: (view: 'map' | 'board') => void
  setThemesWindow: (hours: number | null) => void
  selectTheme: (id: string | null) => Promise<void>
  regenerateThemeBrief: () => Promise<void>
  refreshThemes: () => Promise<void>
  retryThemes: () => Promise<void>

  // ---- wire (the swarm-generic news-wire surface — lib/wire.ts; shared by every swarm that declares one) ----
  wireSwarm: string // which swarm OWNS the wire view state (archive query, themes geo/subject) — reset on change
  themesSubject: string | null // single selected subject chip, mirrored to the Themes slice (like themesGeo)
  setThemesSubject: (s: string | null) => void
  wirePulse: Record<string, WirePulseSubject> // per-subject pulse (price / positioning / reports / verdict)
  wirePulseAt: number | null // when the snapshot landed (ms) — the refresh TTL
  wirePulseStale: boolean // the server said its own upstream fetch failed (serving cached)
  refreshWirePulse: (force?: boolean) => Promise<void>
  requestFullForSubject: (subject: string) => Promise<void> // one-click "Run full ▸ GOLD" (select + confirm arc)
  _enterWire: (to: string) => void // owner-keyed wire view-state reset (mirrors constellationSwarm)
}

function flatten(graph: SwarmGraph): Map<string, AgentNode> {
  const m = new Map<string, AgentNode>()
  for (const mod of graph.modules) for (const a of Object.values(mod.layers).flat()) m.set(a.key, a)
  return m
}

// ---- wire (the swarm-generic news-wire surface — lib/wire.ts) ----
// The ACTIVE swarm's wire config, derived fresh each call from the swarm list + subject list (both tiny).
// Null = no wire for this swarm (an old server's meta carries no `wire`, so this fails closed by shape).
export function activeWireConfig(s: { swarms: SwarmMeta[]; activeSwarm: string; swarmSubjectList: string[] }): WireConfig | null {
  return deriveWireConfig(s.swarms.find((m) => m.id === s.activeSwarm), s.swarmSubjectList)
}
// the swarm-level wire-membership clause merged into every archive/facets query a NON-flow wire sends
function withWireClause(s: { swarms: SwarmMeta[]; activeSwarm: string; swarmSubjectList: string[] }, q: ArchiveQuery): ArchiveQuery {
  const cfg = activeWireConfig(s)
  return cfg && !cfg.flow && cfg.eventScope && !q.commodities?.length ? { ...q, wireScope: cfg.eventScope } : q
}

function archiveQueryActive(q: ArchiveQuery): boolean {
  return !!(q.themes?.length || q.country || q.geoRegion || q.source || q.band || q.size || q.linkage || q.gicsSector || q.gicsSubSector || q.companyTicker || q.companyName || q.companyAliases?.length || q.companyTickerAliases?.length || q.commodities?.length || (q.text && q.text.trim()))
}
// is the active swarm the flow stage? (layout-driven, mirroring App.tsx's first-frame fallback — the
// board/gauntlet are flow-stage features, not tied to a hardcoded swarm id beyond that grandfathered default)
export function isFlowActive(s: { swarms: SwarmMeta[]; activeSwarm: string }): boolean {
  return (s.swarms.find((m) => m.id === s.activeSwarm)?.layout ?? (s.activeSwarm === 'screener' ? 'flow' : 'constellation')) === 'flow'
}

const RESEARCH_SWARM: SwarmMeta = { id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' }
export const BOOTSTRAP_RETRY_MS = 3000
let swarmDiscoveryRetryTimer: any = null
let swarmDiscoveryPromise: Promise<void> | null = null
let screenerInitRetryTimer: any = null
let screenerInitPromise: Promise<void> | null = null
let screenerOwnershipEpoch = 0
let screenerReconnectRefreshPending = false
let screenerSignalHydrationPending: string | null = null
let screenerSignalFetchGeneration = 0
let lastStreamBootstrapHealAt = 0

// A missing/unsupported endpoint is an authoritative old-server answer, while a gateway failure,
// timeout, rate limit, network exception, or expired Access session says nothing about which swarms the
// live engine serves. The health loop owns the session-expired banner; discovery preserves its current
// view and retries rather than misreporting authentication as a research-only engine.
function isTransientBootstrapFailure(error: unknown): boolean {
  const status = typeof (error as any)?.status === 'number' ? (error as any).status as number : null
  return status === null || status === 408 || status === 425 || status === 429 || status >= 500
}

export function shouldRetrySwarmDiscovery(staticMode: boolean, error: unknown): boolean {
  return !staticMode && isTransientBootstrapFailure(error)
}

export function shouldPreserveSwarmDiscovery(staticMode: boolean, error: unknown): boolean {
  const status = typeof (error as any)?.status === 'number' ? (error as any).status as number : null
  return !staticMode && (status === 401 || status === 403 || isTransientBootstrapFailure(error))
}

export function bootstrapSwarmId(staticMode: boolean, swarms: SwarmMeta[]): string {
  return !staticMode && swarms.some((swarm) => swarm.id === 'screener') ? 'screener' : 'research'
}

function clearSwarmDiscoveryRetry(): void {
  if (!swarmDiscoveryRetryTimer) return
  clearTimeout(swarmDiscoveryRetryTimer)
  swarmDiscoveryRetryTimer = null
}

function scheduleSwarmDiscoveryRetry(): void {
  if (swarmDiscoveryRetryTimer) return
  swarmDiscoveryRetryTimer = setTimeout(() => {
    swarmDiscoveryRetryTimer = null
    const state = useStore.getState()
    if (!state.staticMode && state.health !== 'session-expired') void discoverSwarms(false)
  }, BOOTSTRAP_RETRY_MS)
}

async function discoverSwarms(staticMode: boolean): Promise<void> {
  if (swarmDiscoveryPromise) return swarmDiscoveryPromise
  const attempt = (async () => {
    try {
      const swarms = await api.swarms()
      clearSwarmDiscoveryRetry()
      const activeSwarm = bootstrapSwarmId(staticMode, swarms)
      if (useStore.getState().activeSwarm === 'screener' && activeSwarm !== 'screener') invalidateScreenerBootstrap()
      useStore.setState({ swarms, activeSwarm })
      if (activeSwarm === 'screener') void useStore.getState().scInit()
    } catch (error) {
      if (shouldPreserveSwarmDiscovery(staticMode, error)) {
        // Keep the live HTML marker's screener seed. A transient failure or expired session is absence
        // of evidence, not evidence that the live engine is research-only.
        if (shouldRetrySwarmDiscovery(staticMode, error)) scheduleSwarmDiscoveryRetry()
        else clearSwarmDiscoveryRetry() // auth is retried by the heartbeat after sign-in, never every 3s
        return
      }
      clearSwarmDiscoveryRetry()
      if (useStore.getState().activeSwarm === 'screener') invalidateScreenerBootstrap()
      useStore.setState({ swarms: [RESEARCH_SWARM], activeSwarm: 'research' })
    }
  })()
  swarmDiscoveryPromise = attempt
  try {
    await attempt
  } finally {
    if (swarmDiscoveryPromise === attempt) swarmDiscoveryPromise = null
  }
}

function clearScreenerInitRetry(): void {
  if (!screenerInitRetryTimer) return
  clearTimeout(screenerInitRetryTimer)
  screenerInitRetryTimer = null
}

function invalidateScreenerBootstrap(): void {
  screenerOwnershipEpoch++
  clearScreenerInitRetry()
  screenerReconnectRefreshPending = false
  // The underlying fetch cannot always be aborted, but it is epoch-guarded. Detach it so returning to the
  // screener can start a new owner attempt immediately; the old handled promise remains safe for callers.
  screenerInitPromise = null
}

function scheduleScreenerInitRetry(): void {
  if (screenerInitRetryTimer) return
  const state = useStore.getState()
  if (state.staticMode || state.health === 'session-expired' || state.activeSwarm !== 'screener') return
  screenerInitRetryTimer = setTimeout(() => {
    screenerInitRetryTimer = null
    const current = useStore.getState()
    if (!current.staticMode && current.health !== 'session-expired' && current.activeSwarm === 'screener') void current.scInit()
  }, BOOTSTRAP_RETRY_MS)
}

// A healthy poll is already paced at HEALTH_OK_MS, so every one may repair missing bootstrap state; a true
// reconnect also refreshes an existing board to preserve run-resume behavior. SSE messages can be far more
// frequent, so cap their repair attempts to the same cadence. In-flight calls coalesce independently.
function healMissingLiveBootstrap(proof: 'health' | 'stream', refreshScreener = false): void {
  const state = useStore.getState()
  if (state.staticMode || state.health === 'session-expired') return
  const discoveryMissing = state.swarms.length === 0
  const screenerNeedsHeal = state.activeSwarm === 'screener'
    && (refreshScreener || !state.scGraph || !state.scBoard || screenerSignalHydrationPending !== null)
  if (!discoveryMissing && !screenerNeedsHeal) return
  if (proof === 'stream' && !refreshScreener) {
    const now = Date.now()
    if (now - lastStreamBootstrapHealAt < HEALTH_OK_MS) return
    lastStreamBootstrapHealAt = now
  }
  if (discoveryMissing) void discoverSwarms(false)
  // If initialization is already beyond its board read (for example, waiting on the wire backfill), a
  // reconnect must not disappear into the coalesced promise. Drain one newest-board refresh after that
  // owner finishes. Multiple reconnect signals while it is in flight collapse into this single bit.
  if (refreshScreener && state.activeSwarm === 'screener' && screenerInitPromise) screenerReconnectRefreshPending = true
  if (screenerNeedsHeal) void state.scInit()
}

// The subject a chat answers about, for the active swarm — the ONE accessor the chat slice keys off so it
// never hardcodes a swarm id. A flow swarm (screener) chats a SIGNAL run (scSelectedSignal is a SIG id); a
// constellation swarm (research/commodity) chats a subject run (selectedTicker is a ticker/commodity id).
// The server resolves either shape to a run folder via (swarm, subject). Exported so the history + command
// bar surfaces gate on the same value.
export function chatSubjectOf(s: { swarms: SwarmMeta[]; activeSwarm: string; scSelectedSignal: string | null; selectedTicker: string | null }): string | null {
  return isFlowActive(s) ? s.scSelectedSignal : s.selectedTicker
}

// default header title for the chat panel given a scope + the company
function defaultChatTitle(scope: ChatScope, ticker: string, opts?: { module?: string; title?: string }): string {
  if (opts?.title) return opts.title
  if (scope === 'run') return `Ask · ${ticker} — whole run`
  if (scope === 'module') return `Ask · ${ticker} — ${(opts?.module || '').replace(/-/g, ' ')}`
  return `Ask · ${ticker}`
}

// the chat-panel scope state cleared on every teardown (ticker switch, swarm switch) so a conversation
// never bleeds across companies. Mirrors how openOutput is nulled alongside it.
const CHAT_RESET = { chatOpen: false, chatStreaming: false, chatWork: null as ChatWork | null, chatMessages: [] as ChatMessage[], chatError: undefined as string | undefined, chatRetryText: undefined as string | undefined, chatRetryTurnId: undefined as string | undefined, chatSource: undefined as string | undefined, chatConversationId: undefined as string | undefined, chatAnswerRunRoot: undefined as string | undefined, chatMemory: undefined as AskMemoryMeta | undefined }
const NEWS_CHAT_RESET = {
  newsChatOpen: false,
  newsChatStreaming: false,
  newsChatMessages: [] as ChatMessage[],
  newsChatError: undefined as string | undefined,
  newsChatReceipt: undefined as NewsChatReceipt | undefined,
  newsChatEvidence: [] as NewsChatEvidence[],
  newsChatCompletedTurn: undefined as NewsChatCompletedTurn | undefined,
  newsChatRetryText: undefined as string | undefined,
  newsChatRetryTurnId: undefined as string | undefined,
  newsChatConversationId: undefined as string | undefined,
}

function captureProviderLaunch(state: State, provider: RunProvider = state.runProvider): FrozenProviderLaunch | null {
  return freezeProviderLaunch(state.providers[provider], state.providers.catalogState, state.runProfileKeys[provider])
}

// A Resume click must still reach the chooser when the command-bar provider is unavailable. Refresh the
// authoritative server catalogue, then seed the dialog with the first exact launchable profile (current
// preference first, original provider second, the other provider last). This only prepares a choice; it
// never launches and does not silently rewrite the user's saved provider preference.
async function captureAvailableResumeLaunch(
  get: () => State,
  recordedProviders: readonly RunProvider[] = [],
): Promise<FrozenProviderLaunch | null> {
  if (get().providers.catalogState !== 'valid') await get().refreshProviders()
  const candidates = [get().runProvider, ...recordedProviders, 'claude', 'codex'] as RunProvider[]
  const seen = new Set<RunProvider>()
  for (const provider of candidates) {
    if (seen.has(provider)) continue
    seen.add(provider)
    if (providerNeedsCheck(get().providers[provider])) await get().refreshProviders(provider)
    const execution = captureProviderLaunch(get(), provider)
    if (execution) return execution
  }
  return null
}

function reconcileRunProfileKeys(
  current: Record<RunProvider, string>,
  providers: ProvidersRead,
): Record<RunProvider, string> {
  const next = { ...current }
  for (const provider of ['claude', 'codex'] as RunProvider[]) {
    const option = selectedProviderProfile(providers[provider], next[provider])
    const key = option?.key || providers[provider].defaultProfileKey
    if (key && key !== next[provider]) {
      next[provider] = key
      saveRunProfileKey(provider, key)
    }
  }
  return next
}

function captureLaunchSelection(state: State): LaunchSelectionBinding | null {
  if (!state.selectedTicker) return null
  const execution = captureProviderLaunch(state)
  if (!execution) return null
  const read = state.dataNeeds
  const exactDecision = read && state.runRoot && read.subject === state.selectedTicker
    && read.swarm === state.activeSwarm && read.run_root === state.runRoot
    && /^sha256:[a-f0-9]{64}$/.test(read.decision_fingerprint)
    ? { runRoot: read.run_root, decisionFingerprint: read.decision_fingerprint }
    : {}
  return { subject: state.selectedTicker, swarm: state.activeSwarm, selectToken: state.selectToken, ...execution, ...exactDecision }
}

function hasExactDecisionBinding(
  selection: LaunchSelectionBinding,
): selection is LaunchSelectionBinding & { runRoot: string; decisionFingerprint: string } {
  return !!selection.runRoot && !!selection.decisionFingerprint
    && /^sha256:[a-f0-9]{64}$/.test(selection.decisionFingerprint)
}

function launchSelectionIsCurrent(state: State, selection: LaunchSelectionBinding): boolean {
  // A warp starts before activeSwarm changes. Treat that transition itself as navigation so an estimate
  // resolving during the animation cannot reopen a confirmation for the stage being left.
  if (state.warp || state.selectedTicker !== selection.subject || state.activeSwarm !== selection.swarm
      || state.selectToken !== selection.selectToken) return false
  if (!selection.runRoot && !selection.decisionFingerprint) return true
  const read = state.dataNeeds
  return !!selection.runRoot && !!selection.decisionFingerprint && state.runRoot === selection.runRoot
    && read?.subject === selection.subject && read.swarm === selection.swarm
    && read.run_root === selection.runRoot && read.decision_fingerprint === selection.decisionFingerprint
}

// Every launch control shares one pending slot. Keep the admission rule here so an agent click and a
// module-heading click cannot overwrite each other's spinner while either request is still preparing.
// The ticker comparison is deliberate: research mutations are serialized per ticker on the server too.
function hasPendingLaunchForTicker(state: State, selection: LaunchSelectionBinding): boolean {
  return state.launchPending?.ticker === selection.subject
}

function requireCurrentLaunchSelection(state: State, selection: LaunchSelectionBinding): boolean {
  if (launchSelectionIsCurrent(state, selection)) return true
  state.setToast({ msg: 'The selected call changed. Nothing was launched.', tone: 'info' })
  return false
}

function launchPreflightMatches(
  preflight: LaunchPreflight | null | undefined,
  selection: LaunchSelectionBinding,
  kind: 'full' | 'rerun',
  catalogState: ProvidersRead['catalogState'],
  node?: { module: string; name: string },
): boolean {
  if (!preflight) return false
  const swarmMatches = selection.swarm === 'research'
    ? preflight.swarm === undefined || preflight.swarm === 'research'
    : preflight.swarm === selection.swarm
  const exactReceiptMatches = kind !== 'rerun' || (hasExactDecisionBinding(selection)
    && preflight.exactDecisionBinding?.contractVersion === EXACT_DECISION_LAUNCH_CONTRACT
    && preflight.exactDecisionBinding.runRoot === selection.runRoot
    && preflight.exactDecisionBinding.decisionFingerprint === selection.decisionFingerprint)
  const planReceiptMatches = !selection.planOrigin || (kind === 'rerun'
    && preflight.exactDecisionBinding?.intakePlan?.contractVersion === 'exact-intake-orb/1'
    && preflight.exactDecisionBinding.intakePlan.planPath === selection.planOrigin.planPath
    && preflight.exactDecisionBinding.intakePlan.planSha256 === selection.planOrigin.planSha256
    && preflight.exactDecisionBinding.intakePlan.sourceDecisionFingerprint === selection.planOrigin.sourceDecisionFingerprint)
  return preflight.kind === kind && preflight.ticker === selection.subject && swarmMatches
    && preflightConfirmationMatches(kind, preflight.requiresTypedConfirm)
    && launchProviderReceiptMatches(preflight, selection, catalogState)
    && exactReceiptMatches && planReceiptMatches
    && (kind !== 'rerun' || (!!node && preflight.module === node.module && preflight.agent === node.name))
}

function requireLaunchProviderReceipt(
  value: unknown,
  selection: FrozenProviderLaunch,
  catalogState: ProvidersRead['catalogState'],
  launched = true,
): void {
  // `launched` controls only the recovery copy. Estimates and launch responses both have to echo the
  // provider; a missing estimate echo is the same rolling-deploy hazard, even though no run exists yet.
  if (launchProviderReceiptMatches(value, selection, catalogState)) return
  throw Object.assign(new Error(
    launched
      ? `The engine did not confirm that this run started with the selected ${providerLabel(selection.provider)} profile. Check Activity before retrying.`
      : `The engine did not confirm the selected ${providerLabel(selection.provider)} execution profile.`,
  ), { body: { code: 'provider_receipt_mismatch' } })
}

// Admission must have one deterministic visibility effect across every provider and entry point. Do not
// wait for polling/SSE/subject navigation to make a real run discoverable: open Activity now, then reconcile
// the supervisor's authoritative row in the background.
function revealAcceptedTrackedLaunch(set: any, get: () => State): void {
  set({ activityOpen: true })
  void get().refreshActiveRuns()
}

async function exactResumePlan(info: ResumableRunInfo, execution: FrozenProviderLaunch): Promise<ThesisPlan | undefined> {
  if ((info.swarm || 'research') !== 'research' || (info.kind !== 'full' && info.kind !== 'module')) return undefined
  const module = info.kind === 'module' ? info.module : undefined
  const plan = await api.thesisPlan(info.subject, execution, 'research', undefined, module, info.runRoot)
  const strictContinue = plan.continuationReceipt?.version === 2
    && plan.continuationReceipt.action === 'continue'
    && plan.continuationReceipt.targetRunRoot === info.runRoot
  const legacyMigration = info.kind === 'full'
    && plan.continuationReceipt?.version === 2
    && plan.continuationReceipt.action === 'complete'
    && plan.continuationReceipt.sourceRunRoots.length === 1
    && plan.continuationReceipt.sourceRunRoots[0] === info.runRoot
    && plan.continuationReceipt.targetRunRoot !== info.runRoot
    && plan.reuse.length > 0
  if (!strictContinue && !legacyMigration) {
    throw new Error('The exact saved-run plan is unavailable. Refresh before continuing; nothing was started.')
  }
  if (module && (plan.moduleResumeVersion !== 2 || typeof plan.dataPool.newestMs !== 'number'
      || !plan.modules.some((entry) => entry.module === module))) {
    throw new Error('The saved module scope could not be verified. Refresh before continuing.')
  }
  return plan
}

async function verifyScopedRerunCapability(
  get: () => State,
  selection: LaunchSelectionBinding & { runRoot: string; decisionFingerprint: string },
): Promise<NonNullable<LaunchSelectionBinding['planOrigin']>> {
  const plan = get().intake
  if (!plan || (plan.subject ?? plan.ticker) !== selection.subject
      || (plan.swarm ?? 'research') !== selection.swarm || plan.run_root !== selection.runRoot
      || plan.actionable !== true
      || !/^sha256:[a-f0-9]{64}$/.test(plan.decision_fingerprint ?? '')
      || !/^sha256:[a-f0-9]{64}$/.test(plan.plan_sha256 ?? '')
      || typeof plan.plan_path !== 'string' || !plan.plan_path) {
    throw new Error('The scoped plan is not tied to this exact call. Re-analyze the data first.')
  }
  const firstCommand = plan.rerun_plan?.commands?.[0]
  if (!firstCommand) throw new Error('The scoped plan has no exact orb to verify. Re-analyze the data first.')
  const planOrigin = {
    planPath: plan.plan_path,
    planSha256: plan.plan_sha256!,
    sourceDecisionFingerprint: plan.decision_fingerprint!,
  }
  const capability = await api.estimate(
    'rerun', selection.subject, selection, firstCommand.module, firstCommand.agent,
    selection.swarm !== 'research' ? selection.swarm : undefined,
    { runRoot: selection.runRoot, decisionFingerprint: selection.decisionFingerprint, ...planOrigin },
  )
  if (!launchSelectionIsCurrent(get(), selection)) {
    throw new Error('The selected call changed. Nothing was launched.')
  }
  if (!launchPreflightMatches(capability, { ...selection, planOrigin }, 'rerun', get().providers.catalogState, {
    module: firstCommand.module,
    name: firstCommand.agent,
  })) {
    throw new Error('This engine cannot verify the exact call before spending. Refresh after the Mac Pro update; nothing was launched.')
  }
  return planOrigin
}

export const useStore = create<State>((set, get) => ({
  connected: true,
  health: 'connecting',
  deploymentLag: null,
  healthFailCount: 0,
  lastHealthOkAt: null,
  staticMode: false,
  snapshotAt: null,
  dataDir: null,
  tickers: [],
  emptyState: false,
  driveEnabled: false,
  watchlistFilesEnabled: false,
  defaultCoverage: [],
  addCompanyOpen: false,
  uploadTarget: null,
  uploadProgress: {},
  uploadErrors: [],
  uploading: false,
  selectedTicker: null,
  graph: null,
  nodesByKey: new Map(),
  dataStatus: null,
  dataLoading: false,
  dataScan: null,
  credit: null,
  creditChecking: false,
  runProvider: readRunProvider(),
  runProfileKeys: { claude: readRunProfileKey('claude'), codex: readRunProfileKey('codex') },
  providers: emptyProviders(),
  providersChecking: false,
  nodeRuntime: {},
  now: Date.now(),
  activeRuns: {},
  pendingAdmissions: [],
  resumableRuns: [],
  activeRunsByTicker: new Set(),
  chainTickers: new Set(),
  selectToken: 0,
  runStream: [],
  coreBloom: false,
  decision: null,
  runRoot: null,
  reports: { memo: false, thesis: false, dossier: false },
  moduleReports: {},
  thesisPlan: null,
  thesisPlanExecution: null,
  thesisPlanOpen: false,
  thesisPlanLoading: false,
  thesisPlanPricing: false,
  thesisPlanError: null,
  intake: null,
  dataNeeds: null,
  whatChanged: null,
  whatChangedOpen: false,
  liveQuote: null,
  liveQuoteAt: null,
  intakeFocusKeys: new Set(),
  intakePlanKeys: new Set(),
  intakeAnalyzing: false,
  runActivity: {},
  thesisPlanIntake: null,
  openOutput: null,
  chatOpen: false,
  chatScope: 'run',
  chatModule: undefined,
  chatOrbPath: undefined,
  chatOrbKey: undefined,
  chatAnswerRunRoot: undefined,
  chatTitle: '',
  chatModel: readChatModel(),
  chatStyle: loadChatStyle(),
  chatMemoryMode: 'auto',
  chatMemory: undefined,
  chatMessages: [],
  chatStreaming: false,
  chatWork: null,
  chatError: undefined,
  chatRetryText: undefined,
  chatRetryTurnId: undefined,
  chatSource: undefined,
  chatConversationId: undefined,
  chatHistoryOpen: false,
  newsChatOpen: false,
  newsChatWindow: '24h',
  newsChatMessages: [],
  newsChatStreaming: false,
  newsChatError: undefined,
  newsChatReceipt: undefined,
  newsChatEvidence: [],
  newsChatCompletedTurn: undefined,
  newsChatRetryText: undefined,
  newsChatRetryTurnId: undefined,
  newsChatConversationId: undefined,
  activityOpen: false,
  scoringOpen: false,
  valuationPlaygroundOpen: false,
  callsOpen: false,
  selectedNodeKey: null,
  launchConfirm: null,
  resumeConfirm: null,
  launchPending: null,
  scopedRerunPending: false,
  stoppingRuns: {},
  readinessGate: null,
  readinessGateQueue: [],
  readinessRecovery: {},
  toast: null,

  swarms: [],
  // Default landing view = the screener (the live idea-generation wire). Seeded from the live-engine
  // marker (the server injects window.__ENGINE_LIVE__ into the HTML it serves) so the production app
  // paints the screener on the very first frame with no flash, while a static/read-only showcase — which
  // has no marker and can't load the live wire — seeds research and never flashes cyan→amber. init()
  // makes the authoritative decision once the mode + swarm list resolve.
  activeSwarm: typeof window !== 'undefined' && (window as any).__ENGINE_LIVE__ === true ? 'screener' : 'research',
  constellationSwarm: 'research',
  swarmSubjectList: [],
  swarmSubjectRuns: {},
  swarmSubjectsLoading: false,
  researchView: loadView(),
  watchlist: null,
  watchlistLoading: false,
  watchlistError: null,
  watchlistAt: null,
  watchlistMetCount: 0,
  watchlistShowArchived: false,
  watchlistPending: null,
  watchlistLayout: loadWatchlistLayout(),
  watchComposer: null,
  webglOK: true, // optimistic; init() probes and corrects + coerces the view if WebGL is missing
  warp: null,
  scGraph: null,
  scNodesByKey: new Map(),
  scRuntime: {},
  scSelectedSignal: null,
  scBoard: null,
  scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  scRouted: {},
  signalIntakeOpen: false,
  signalIntakeSeed: null,
  pipelineOpen: false,
  dataPoolExpandRequest: 0,
  dataLibraryOpen: false,
  memoryOpen: false,
  toolsOpen: false,
  dlSelectedId: null,
  pipelines: null,
  pipelinesError: null,
  dlFilters: emptyDlFilters(),
  scBookFilters: emptyBookFilters(),
  scBookSort: 'rank',
  scBookArchivedOpen: false,
  scThesisDetail: null,
  scSelectedEvent: null,
  scFocusedCompany: null,
  shelvedEvents: loadShelf(),
  readEvents: loadRead(),
  flaggedEvents: loadFlagged(),
  ratedPolarity: loadRated(),
  reviewOpen: false,
  cockpitFeedbackOpen: false,
  dataPipelineOpen: false,
  dataPipelineFocusNeed: null,
  reviewFilters: emptyReviewFilters(),
  reviewQueue: [],
  reviewIndex: 0,
  reviewSessionCount: 0,
  reviewSubmitting: false,
  coveredTickers: new Set(),
  enrichCache: {},
  scSignalState: {},
  newsFeedOpen: false,
  sourcesOpen: false,
  diagnosticsOpen: false,
  newsDiagnostics: null,
  newsItems: [],
  freshEvents: new Set(),
  newsArrivedTotal: 0,
  lastScan: null,
  lastCycle: null,
  cycleLog: [],
  scanningSince: null,
  scIntensity: null,
  scIntensityWindow: 'scan', // derived from the "When" ribbon (themesWindow) — Live → scan; the ribbon is the single window control
  feedWindowDays: 2,
  feedWindowLoading: false,
  scArchiveQuery: {},
  scArchiveResults: [],
  scArchiveCursor: null,
  scArchiveLoading: false,
  scArchiveLoadingMore: false,
  scArchiveScannedThrough: null,
  scArchiveExhausted: false,
  scArchiveError: null,
  scFacets: null,
  scFacetsLoading: false,
  newsStatus: null,
  bridgeStatus: null,
  newsStreamOnline: false,
  themes: [],
  themeFormationQueue: null,
  themeCompilerHealth: null,
  themesView: null,
  ideasOpen: false,
  calendarOpen: false,
  themesWindow: null,
  themesHistoryDays: 0,
  themesGeneratedAt: null,
  themesProjectedAt: null,
  themesGeo: { country: '', geoRegion: '', label: '' },
  selectedTheme: null,
  themeDetail: null,
  themeDetailError: null,
  themeBrief: null,
  themeBriefLoading: false,
  themesStatus: 'idle',
  themesLoading: false,
  wireSwarm: '',
  themesSubject: null,
  wirePulse: {},
  wirePulseAt: null,
  wirePulseStale: false,
  globalActive: [],
  stopListOpen: false,

  init: async () => {
    // WebGL capability gates the 3D globe. Probe once; if it's unavailable, disable the option and coerce
    // a previously-persisted 'globe' back to the flat constellation so a no-WebGL browser is never stranded.
    const webglOK = detectWebGL()
    // Coerce ONLY a globe view — a stored 'watchlist' must survive a WebGL-less browser.
    set({ webglOK, researchView: coerceViewForWebgl(get().researchView, webglOK) })
    // Resolve live/static FIRST — independent of the heavy company data — and start the engine heartbeat
    // immediately in live mode. The heartbeat (not these data loads) owns `connected`/`health`, so a slow
    // or failing /api/swarm or /api/tickers can no longer pin the whole UI at "connecting"/"offline".
    // ensureMode has its own 6s probe and an __ENGINE_LIVE__ fast-path, and never throws.
    let stat: boolean
    try {
      stat = (await ensureMode()) === 'static'
    } catch {
      stat = isStatic()
    }
    set({ staticMode: stat, snapshotAt: stat ? snapshotGeneratedAt() : null })
    if (!stat) {
      get().startHealth() // begin the engine heartbeat (live mode only); idempotent across reconnects
      // Rediscover any run still executing server-side. A page refresh remounts this store with no
      // selected ticker, so without this the picker/kill-switch would be blind to an in-flight run until
      // the user happened to pick its company. Populating activeRunsByTicker + globalActive here lights the
      // "resume live run" affordance on the picker (and the top-bar N-running pill), and starts the poll so
      // the banner clears itself the moment the run ends. Self-guarded (no-op in static mode).
      void get().refreshActiveRuns()
      void get().refreshPendingAdmissions()
      // live data-folder watcher (Drive sync) — backend only
      if (!dataSource) {
        dataSource = new EventSource(api.dataStreamUrl())
        dataSource.addEventListener('data-changed', (ev: MessageEvent) => {
          try {
            const d = JSON.parse(ev.data)
            // data/ is the research pool. A commodity with the same label is a different subject and must
            // not receive its status/intake refresh merely because the ticker string matches.
            if (get().activeSwarm === 'research' && d.ticker === get().selectedTicker) {
              get().refreshData(); void get().refreshIntake(); void get().refreshDataNeeds()
            }
            refreshTickersSoon(get, set) // live count update + keep polling while Drive is still syncing
          } catch {}
        })
        dataSource.addEventListener('data-scan-progress', (ev: MessageEvent) => {
          try {
            const progress = JSON.parse(ev.data)?.progress
            if (isDataScanProgress(progress) && get().activeSwarm === 'research' && progress.ticker === get().selectedTicker) {
              set({ dataScan: progress })
              if (progress.stage === 'ready') {
                const token = get().selectToken
                void api.dataStatusResult(progress.ticker).then((dataStatus) => {
                  if (dataStatus && get().selectToken === token && get().selectedTicker === progress.ticker) {
                    set({ dataStatus, dataLoading: false })
                  }
                }).catch(() => {})
              } else if (progress.stage === 'failed') {
                set({ dataLoading: false })
              }
            }
          } catch {}
        })
      }
      // one cheap usage probe on first connect (backend only)
      if (!creditProbed) {
        creditProbed = true
        get().checkCredit()
        void get().refreshProviders()
      }
    }
    // Landing view: the screener is the default, but ONLY when the live engine actually SERVES it
    // (CLAUDE.md §26 — research is the only guaranteed swarm; the screener is discovered, never assumed)
    // and we're live (a static/read-only showcase can't load the screener wire). Decided off the RESOLVED
    // swarm list, so the swarms:[] seed can never misfire and a research-only engine never strands the
    // user on an empty, unswitchable screener. Independent of the heavy company data, so a slow graph/
    // tickers load never delays the landing decision. scInit is idempotent + self-guarded.
    // A transient gateway/network failure is not an authoritative research-only answer. In live mode,
    // preserve the HTML marker's first-frame screener seed and rediscover in the background; static mode,
    // an explicit unsupported response, and a successful research-only list still fail closed to research.
    void discoverSwarms(stat)
    // Load the heavy core data (graph + ticker list) resiliently: each part sets as it resolves, the
    // still-missing parts retry in the background, and NONE of it touches connected/health (the heartbeat
    // owns those). No auto-select — the cockpit opens on the "Select a company" placeholder until the user
    // picks (or adds) a company.
    void loadCore(get, set, stat, true)
  },

  selectTicker: async (t, runRoot) => {
    const selectionStartedAt = performance.now()
    closeAllRunSources() // stop the previous company's live streams before anything else (no event bleed)
    if (dataScanRequest?.ticker !== t) {
      dataScanRequest?.controller.abort()
      dataScanRequest = null
    }
    // the active swarm owns this selection: research loads the research graph + data pool; a constellation
    // swarm (e.g. commodity) loads ITS graph + resolves reads/chat by subject. Non-research subjects have
    // no research data pool, so dataStatus stays null (its own in-run triage owns sufficiency).
    const sw = get().activeSwarm
    const isResearch = sw === 'research'
    const token = ++selectGen
    let selectionFailed = false
    // keep only still-live runs across tickers (drop finished); the new ticker rebuilds from snapshots
    const activeRuns = Object.fromEntries(Object.entries(get().activeRuns).filter(([, r]) => LIVE_RUN.has(r.status)))
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null // a new subject → drop any in-flight chat + its thread
    // the completion plan is per-subject disk truth — never let a previous subject's plan survive a switch
    set({ selectToken: token, selectedTicker: t, constellationSwarm: sw, dataStatus: null, dataLoading: isResearch, dataScan: null, nodeRuntime: {}, decision: null, runRoot: null, reports: { memo: false, thesis: false, dossier: false }, moduleReports: {}, coreBloom: false, selectedNodeKey: null, runStream: [], activeRuns, openOutput: null, thesisPlan: null, thesisPlanExecution: null, thesisPlanOpen: false, thesisPlanError: null, intake: null, dataNeeds: null, whatChanged: null, whatChangedOpen: false, intakeFocusKeys: new Set(), intakePlanKeys: new Set(), intakeAnalyzing: false, runActivity: {}, thesisPlanIntake: null, liveQuote: null, liveQuoteAt: null, launchConfirm: null, launchPending: get().launchPending?.selection ? null : get().launchPending, readinessGate: null, readinessGateQueue: [], readinessRecovery: {}, ...CHAT_RESET })
    let graph: SwarmGraph
    try {
      graph = isResearch ? await api.swarm(t) : await api.swarmGraph(sw, t)
    } catch (error) {
      if (get().selectToken === token && get().activeSwarm === sw && get().selectedTicker === t) {
        recordBrowserPerformance('browser.subject_ready', performance.now() - selectionStartedAt, 'ms', {
          operation: '/subject/select', outcome: 'error',
        })
      }
      throw error
    }
    if (get().selectToken !== token) return // a newer selection superseded this one
    set({ graph, nodesByKey: flatten(graph) })
    void get().refreshResumable() // so the orb-view Resume chip knows if this subject has an interrupted run
    if (isResearch) {
      await get().refreshData()
      selectionFailed = get().selectToken === token && get().dataScan?.stage === 'failed'
    }
    void get().refreshPipelines() // the cross-swarm pipeline library (the Data button gates on this, §5)
    if (get().selectToken !== token) return
    // seed prior-run results into the swarm
    try {
      const manifest = await api.runManifest(t, isResearch ? runRoot : undefined, isResearch ? undefined : sw)
      if (get().selectToken !== token) return
      set(projectRunManifest(manifest))
    } catch {}
    // AFTER the manifest sets runRoot: document intake is a manifest capability shared by research and
    // constellation swarms. An exact historical research selection must read that run, while a singleton
    // swarm echoes its server-owned root. The reader fails closed when the swarm has no intake command/plan.
    void get().refreshIntake()
    // AFTER the manifest sets runRoot: a historical research selection must read that exact call's gaps.
    // Passing the original selection is the fail-closed fallback if the manifest vanished mid-read.
    void get().refreshDataNeeds(isResearch ? (get().runRoot ?? runRoot) : undefined)
    // AFTER the manifest set runRoot: the version delta must target the run the banner is about to show,
    // not whatever run resolving the bare ticker would pick.
    if (isResearch) void get().refreshWhatChanged()
    try {
      // honor the run-history pick: an explicit runRoot loads THAT run's decision (not the standing run's),
      // so the manifest and the decision banner stay on the same run instead of mixing an older verdict in.
      const decision = await api.decision(t, isResearch ? undefined : sw, isResearch ? runRoot : undefined)
      if (get().selectToken !== token) return
      set({ decision })
    } catch {
      if (get().selectToken === token) set({ decision: null })
    }
    // AFTER the decision: the live price is only meaningful next to the call it re-bases, and forcing
    // past the TTL is right here because the ticker just changed (the cached price is another company's).
    if (isResearch) void get().refreshLiveQuote(true)
    // reconnect to EVERY run in flight for this company (concurrent runs are supported)
    try {
      const { active } = await api.activeRuns()
      if (get().selectToken !== token || get().activeSwarm !== sw || get().selectedTicker !== t) return
      set({ activeRunsByTicker: runningSubjectsForSwarm(active, sw), globalActive: active as ActiveRunLite[] })
      for (const r of active.filter((r) => runMatchesSubject(r, t, sw))) {
        await reconnectRun(set, get, r.runId, token, { subject: t, swarm: sw })
      }
      schedulePoll(get, active.length > 0)
    } catch {}
    if (get().selectToken === token && get().activeSwarm === sw && get().selectedTicker === t) {
      if (selectionFailed) {
        recordBrowserPerformance('browser.subject_ready', performance.now() - selectionStartedAt, 'ms', {
          operation: '/subject/select', outcome: 'error',
        })
      } else {
        recordNextPaint('browser.subject_ready', selectionStartedAt, '/subject/select')
      }
    }
  },

  requestDataPoolExpand: () => set((s) => ({ dataPoolExpandRequest: s.dataPoolExpandRequest + 1 })),

  refreshData: async () => {
    const t = get().selectedTicker
    if (!t) return
    // token-guard so a slow response for a just-deselected ticker can't overwrite the new selection or
    // clear its loading flag (mirrors selectTicker's selectToken invariant)
    const token = get().selectToken
    // an unusable folder name (e.g. "TATA MOTORS") would 400 on data-status — skip the fetch and let the
    // empty-state surface the rename guidance instead of failing silently
    const sel = get().tickers.find((x) => x.ticker === t)
    if (sel && sel.valid === false) { if (get().selectToken === token) set({ dataStatus: null, dataLoading: false, dataScan: null }); return }
    set({ dataLoading: true })
    try {
      if (!dataScanRequest || dataScanRequest.ticker !== t) {
        const controller = new AbortController()
        const promise = api.dataStatus(t, controller.signal, (progress) => {
          if (get().selectToken === token && get().selectedTicker === t && isDataScanProgress(progress)) {
            set({ dataScan: progress })
          }
        })
        dataScanRequest = { ticker: t, controller, promise }
        void promise.finally(() => {
          if (dataScanRequest?.promise === promise) dataScanRequest = null
        }).catch(() => {})
      }
      const dataStatus = await dataScanRequest.promise
      if (get().selectToken !== token) return // a newer selection superseded this fetch
      set({ dataStatus })
    } catch (error: any) {
      // Never make a failed scan disappear. The server normally sends the exact file over SSE; this local
      // fallback covers a broken connection before that frame arrives.
      const scan = get().dataScan
      if (get().selectToken === token && (!scan || !['finding', 'reading', 'checking', 'failed'].includes(scan.stage))) {
        const now = Date.now()
        set({ dataScan: {
          scanId: `browser-${now}`, ticker: t, stage: 'failed', completed: 0, total: sel?.fileCount ?? 0,
          currentFile: null, error: String(error?.body?.error || error?.message || 'The data scan stopped.').slice(0, 180),
          startedAt: now, updatedAt: now,
        } })
      }
    } finally {
      if (get().selectToken === token) set({ dataLoading: false })
    }
  },

  // ---- in-app add-company + Drive upload ----
  // Uploads write into the shared Google Drive folder (the server holds one app credential). The engine
  // keeps reading the local Drive mount, so a new company/file appears in the cockpit once Drive syncs it
  // back down (a few seconds) — surfaced by refreshTickersSoon + the data watcher, not an optimistic insert.
  openAddCompany: () => set({ addCompanyOpen: true, uploadTarget: null, uploadErrors: [], uploadProgress: {} }),
  closeAddCompany: () => set({ addCompanyOpen: false, uploadTarget: null, uploadErrors: [], uploadProgress: {} }),
  openUploader: (ticker) => set({ uploadTarget: ticker, uploadErrors: [], uploadProgress: {} }),
  addCompany: async (input) => {
    if (get().staticMode) { get().setToast({ msg: 'Read-only showcase — add companies on your machine via npm run dev', tone: 'info' }); return false }
    const ticker = input.ticker
    try {
      await api.addCompany(input)
      refreshTickersSoon(get, set) // the new folder surfaces once Drive syncs it down; this keeps polling
      // target the uploader at the new ticker STRING (don't selectTicker yet — the folder isn't on the local
      // mount until Drive syncs it down, and reconcileSelection would drop a not-yet-present selection)
      set({ uploadTarget: ticker, uploadErrors: [], uploadProgress: {} })
      get().setToast({ msg: `Created ${ticker} in Drive — add its documents below`, tone: 'good' })
      return true
    } catch (e: any) {
      const sug = e?.body?.suggested ? ` (try ${e.body.suggested})` : ''
      get().setToast({ msg: `${e?.body?.error || e?.message || 'could not create the company'}${sug}`, tone: 'bad' })
      return false
    }
  },
  uploadFiles: async (ticker, files) => {
    if (get().staticMode) { get().setToast({ msg: 'Read-only showcase — uploads happen on your machine via npm run dev', tone: 'info' }); return }
    if (!files.length) return
    set({ uploading: true, uploadErrors: [], uploadProgress: Object.fromEntries(files.map((f) => [f.name, 0])) })
    try {
      const res = await api.uploadFiles(ticker, files, (frac) => {
        // xhr reports progress for the whole request body — reflect it on every file in the batch
        set({ uploadProgress: Object.fromEntries(files.map((f) => [f.name, frac])) })
      })
      set({ uploadErrors: res.errors || [] })
      const okN = res.written?.length || 0
      if (okN) get().setToast({ msg: `Uploaded ${okN} file${okN === 1 ? '' : 's'} to ${ticker} in Drive — they appear here once Drive syncs (a few seconds)`, tone: 'good' })
      else if (res.errors?.length) get().setToast({ msg: `Upload failed: ${res.errors[0].reason}`, tone: 'bad' })
      refreshTickersSoon(get, set) // nudge the live file counts
      if (get().selectedTicker === ticker) setTimeout(() => get().refreshData(), 1500)
    } catch (e: any) {
      get().setToast({ msg: e?.body?.error || e?.message || 'upload failed', tone: 'bad' })
    } finally {
      set({ uploading: false })
    }
  },

  // which companies have a run in flight (drives the ticker-menu dots). Self-polls while any run is active.
  refreshActiveRuns: async () => {
    if (get().staticMode) return
    try {
      const { active } = await api.activeRuns()
      const activeSwarm = get().activeSwarm
      set({ activeRunsByTicker: runningSubjectsForSwarm(active, activeSwarm), globalActive: active as ActiveRunLite[] })
      // live-follow: connect to any active run for the SELECTED ticker we're not already streaming. A
      // chained full run launches each step under a new runId server-side; without this the swarm would
      // go dark between steps. Benign for normal runs (it only attaches to this ticker's own live runs).
      const sel = get().selectedTicker
      if (sel) {
        const token = get().selectToken
        const activeIds = new Set(active.map((run) => run.runId))
        const gates = [get().readinessGate, ...get().readinessGateQueue].filter((gate): gate is ReadinessGateState => !!gate)
        const watchedDecisionIds = new Set([
          ...gates.flatMap((gate) => readinessGateMembers(gate)),
          ...Object.keys(get().readinessRecovery),
        ])
        for (const r of active) {
          if (runMatchesSubject(r, sel, activeSwarm)
              && (!runSources.has(r.runId) || runStreamHealth.get(r.runId)?.state === 'error'
                || watchedDecisionIds.has(r.runId))) {
            void reconnectRun(set, get, r.runId, token, { subject: sel, swarm: activeSwarm })
          }
        }
        // A resolved/terminal frame can be lost across an edge or engine restart. `/api/runs` omitting the
        // old id is not enough by itself (the list can race a restart), so ask the exact snapshot for every
        // locally-live run in this cockpit; only its terminal status or authoritative 404 may clear the card.
        // Decision/recovery owners remain included even if their local card has already disappeared.
        const missingLocalIds = new Set([
          ...watchedDecisionIds,
          ...Object.values(get().activeRuns)
            .filter((run) => LIVE_RUN.has(run.status) && runMatchesSubject(run, sel, activeSwarm))
            .map((run) => run.runId),
        ])
        for (const runId of missingLocalIds) {
          if (activeIds.has(runId)) continue
          const local = get().activeRuns[runId]
          if (local && runMatchesSubject(local, sel, activeSwarm)) {
            void reconnectRun(set, get, runId, token, { subject: sel, swarm: activeSwarm })
          }
        }
      }
      schedulePoll(get, active.length > 0 || !!get().readinessGate || get().readinessGateQueue.length > 0
        || Object.keys(get().readinessRecovery).length > 0)
      void get().refreshPendingAdmissions()
    } catch {}
  },

  // Durable admission truth is separate from active-run truth: while the engine is updating there is no
  // runId yet, and inventing one would create the fake Activity entry this boundary exists to prevent.
  refreshPendingAdmissions: async () => {
    if (get().staticMode) return
    try {
      const { requests } = await api.pendingAdmissions()
      const prior = new Map(get().pendingAdmissions.map((request) => [request.requestId, request.status]))
      const newlyNeedsAttention = requests.some((request) => request.status === 'needs_attention' && prior.get(request.requestId) !== 'needs_attention')
      set({ pendingAdmissions: requests, ...(newlyNeedsAttention ? { activityOpen: true } : {}) })
    } catch {}
  },

  cancelPendingAdmission: async (requestId) => {
    try {
      await api.cancelPendingAdmission(requestId)
      await get().refreshPendingAdmissions()
      get().setToast({ msg: 'Waiting request cancelled — no run was started.', tone: 'info' })
    } catch (e: any) {
      get().setToast({ msg: e?.body?.error || e?.message || 'Could not cancel the waiting request.', tone: 'bad' })
    }
  },

  // Pull the disk-truth set of interrupted runs the cockpit can resume (all swarms). Cheap, read-only;
  // the Activity log refreshes it alongside its rows, and the orb view refreshes it on subject select.
  refreshResumable: async () => {
    if (get().staticMode) return
    try {
      const { runs } = await api.resumable()
      set({ resumableRuns: runs })
    } catch {}
  },

  // Open the universal manual-continuation boundary. No resume request leaves the browser until the user
  // has seen and chosen the exact provider + reviewed model profile that will finish the saved work.
  resumeRun: async (info) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    const mayQueueThroughUpdate = get().health === 'updating' && (info.swarm || 'research') === 'research' && info.kind === 'full'
    if (isLaunchHealthBlocked(get().health) && !mayQueueThroughUpdate) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    // Screener signals resume through their own path — it keeps the finished orbs and re-queues the rest.
    // That path compares both the board and disk receipts; do not seed its chooser from only this row.
    if (info.kind === 'signal') { await get().continueSignal(info.subject); return }
    const records: RecordedRunExecution[] = [{
      provider: isRunProvider(info.provider) ? info.provider : undefined,
      executionProfile: info.executionProfile,
      source: 'disk',
    }]
    const recorded = records.map((record) => record.provider).filter(isRunProvider)
    const execution = await captureAvailableResumeLaunch(get, recorded)
    if (!execution) return get().setToast({ msg: 'No verified provider/model is available to resume this run. Check Claude or Codex and try again.', tone: 'bad' })
    let reviewedPlan: ThesisPlan | undefined
    try { reviewedPlan = await exactResumePlan(info, execution) }
    catch (e: any) { return get().setToast({ msg: e?.message || 'The saved run could not be planned safely.', tone: 'bad' }) }
    set({
      resumeConfirm: {
        kind: 'run', info, selection: execution, records,
        label: info.label || info.subject,
        doneCount: info.doneCount, totalCount: info.totalCount, unit: info.unit,
        preflight: reviewedPlan?.preflight,
        reviewedPlan,
        requestId: reviewedPlan ? crypto.randomUUID() : undefined,
      },
    })
  },

  changeResumeProvider: async (provider) => {
    const rc = get().resumeConfirm
    if (!rc || get().launchPending || providerIsBlocked(get().providers[provider])) return
    if (providerNeedsCheck(get().providers[provider])) {
      await get().refreshProviders(provider)
      if (get().resumeConfirm !== rc || get().launchPending) return
    }
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) {
      const problem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
      return get().setToast({ msg: problem || `The ${providerLabel(provider)} profile could not be verified.`, tone: 'bad' })
    }
    set({ resumeConfirm: { ...rc, selection: execution, preflight: undefined, reviewedPlan: undefined, requestId: undefined } })
    if (rc.kind === 'run') {
      try {
        const reviewedPlan = await exactResumePlan(rc.info, execution)
        if (get().resumeConfirm?.selection === execution) set({ resumeConfirm: {
          ...get().resumeConfirm!, preflight: reviewedPlan?.preflight, reviewedPlan,
          requestId: reviewedPlan ? crypto.randomUUID() : undefined,
        } })
      } catch (e: any) {
        if (get().resumeConfirm?.selection === execution) set({ resumeConfirm: null })
        get().setToast({ msg: e?.message || 'The saved run could not be re-planned safely.', tone: 'bad' })
      }
    }
  },

  changeResumeProfile: async (profileKey) => {
    const rc = get().resumeConfirm
    if (!rc || get().launchPending) return
    const provider = rc.selection.provider
    const option = selectedProviderProfile(get().providers[provider], profileKey)
    if (!option || option.key === rc.selection.expectedProfileKey) return
    const execution = freezeProviderLaunch(get().providers[provider], get().providers.catalogState, option.key)
    if (!execution) return get().setToast({ msg: 'That execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ resumeConfirm: { ...rc, selection: execution, preflight: undefined, reviewedPlan: undefined, requestId: undefined } })
    if (rc.kind === 'run') {
      try {
        const reviewedPlan = await exactResumePlan(rc.info, execution)
        if (get().resumeConfirm?.selection === execution) set({ resumeConfirm: {
          ...get().resumeConfirm!, preflight: reviewedPlan?.preflight, reviewedPlan,
          requestId: reviewedPlan ? crypto.randomUUID() : undefined,
        } })
      } catch (e: any) {
        if (get().resumeConfirm?.selection === execution) set({ resumeConfirm: null })
        get().setToast({ msg: e?.message || 'The saved run could not be re-planned safely.', tone: 'bad' })
      }
    }
  },

  cancelResume: () => {
    if (!get().launchPending) set({ resumeConfirm: null })
  },

  confirmResume: async () => {
    const rc = get().resumeConfirm
    if (!rc || get().launchPending) return
    const mayQueueThroughUpdate = get().health === 'updating' && rc.kind === 'run'
      && (rc.info.swarm || 'research') === 'research' && rc.info.kind === 'full'
    if (isLaunchHealthBlocked(get().health) && !mayQueueThroughUpdate) {
      set({ resumeConfirm: null })
      return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    }
    const providerProblem = providerLaunchBlockedReason(get().providers[rc.selection.provider], get().providers.catalogState)
    const current = freezeProviderLaunch(
      get().providers[rc.selection.provider],
      get().providers.catalogState,
      rc.selection.expectedProfileKey,
    )
    if (providerProblem || !current || JSON.stringify(current) !== JSON.stringify(rc.selection)) {
      set({ resumeConfirm: null })
      return get().setToast({ msg: providerProblem || 'The selected provider/model changed before resume. Open Resume and choose again.', tone: 'bad' })
    }
    // Persist the explicit choice only at this final boundary. The request below always uses `selection`,
    // the immutable snapshot shown in the dialog, rather than re-reading command-bar state after an await.
    get().setRunProvider(rc.selection.provider)
    if (rc.selection.expectedProfileKey) get().setRunProfile(rc.selection.provider, rc.selection.expectedProfileKey)
    const execution = rc.selection

    if (rc.kind === 'signal') {
      const { sigId, until, override } = rc
      const pending = { key: `continue:${sigId}`, label: override ? `Running ${sigId} forward…` : `Resuming ${sigId}…`, ticker: sigId }
      set({ launchPending: pending })
      try {
        // Load disk truth before launch so finished checks stay done while the remaining ones re-queue.
        if (get().scSelectedSignal !== sigId || !Object.keys(get().scRuntime).length) await get().scSelectSignal(sigId)
        const done = { ...get().scRuntime }
        const out = await api.launchSignal(execution, { sigId, until, override })
        requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
        revealAcceptedTrackedLaunch(set, get)
        const { runId } = out
        const rt: Record<string, NodeRuntime> = {}
        for (const k of get().scNodesByKey.keys()) rt[k] = done[k]?.status === 'done' ? done[k] : { status: 'queued', runId }
        set({ resumeConfirm: null, scSelectedSignal: sigId, scRuntime: rt, pipelineOpen: false })
        connectScreenerRun(get, runId, sigId)
        void get().refreshActiveRuns()
        void get().refreshResumable()
        get().setToast({ msg: override ? `Running ${sigId} forward — overriding the gate, reusing finished checks` : `Resuming ${sigId} — picking up where it stopped`, tone: 'good' })
      } catch (e: any) {
        set({ resumeConfirm: null })
        get().setToast({ msg: e?.message ? String(e.message) : (override ? 'Could not run the checks forward' : 'Could not resume the checks'), tone: e?.body?.code ? 'info' : 'bad' })
      } finally {
        if (get().launchPending === pending) set({ launchPending: null })
      }
      return
    }

    const { info } = rc
    const swarm = info.swarm && info.swarm !== 'research' ? info.swarm : undefined
    const label = rc.label
    const doResume = async (force?: boolean) => {
      const pending = { key: `resume:${info.subject}:${info.module || ''}`, label: `Completing ${label}…`, ticker: info.subject }
      set({ launchPending: pending })
      try {
        let out: any
        if ((info.swarm || 'research') === 'research' && info.kind === 'full') {
          // Continue is an exact saved-run action. Submit the exact v2 plan the user reviewed in the modal.
          // The server recomputes it under lock and returns 409 if one artifact changed; the browser must not
          // silently fetch a wider payable plan after consent.
          const plan = rc.reviewedPlan
          const receipt = plan?.continuationReceipt
          const strictContinue = receipt?.version === 2
            && receipt.action === 'continue'
            && receipt.targetRunRoot === info.runRoot
          const legacyMigration = receipt?.version === 2
            && receipt.action === 'complete'
            && receipt.sourceRunRoots.length === 1
            && receipt.sourceRunRoots[0] === info.runRoot
            && receipt.targetRunRoot !== info.runRoot
            && (plan?.reuse.length ?? 0) > 0
          if (!plan || !receipt || (!strictContinue && !legacyMigration) || !rc.requestId) {
            throw new Error('The exact saved-run receipt is unavailable. Refresh before continuing; nothing was started.')
          }
          out = await api.runThesisPlan(
            info.subject, plan.reuse, 'research', execution, rc.requestId,
            receipt, info.runRoot,
          )
          if (isQueuedLaunchResponse(out)) {
            set({ resumeConfirm: null, activityOpen: true })
            await get().refreshPendingAdmissions()
            get().setToast({ msg: `Saved Continue for ${info.subject}. It will start once after the update, using only the work still needed.`, tone: 'good' })
            return
          }
        } else if ((info.swarm || 'research') === 'research' && info.kind === 'module' && info.module) {
          const plan = rc.reviewedPlan
          const entry = plan?.modules.find((candidate) => candidate.module === info.module)
          if (!plan || plan.moduleResumeVersion !== 2 || typeof plan.dataPool.newestMs !== 'number' || !entry
              || plan.continuationReceipt?.version !== 2 || plan.continuationReceipt.action !== 'continue'
              || plan.continuationReceipt.targetRunRoot !== info.runRoot || !rc.requestId) {
            throw new Error('The saved module scope could not be verified. Refresh before continuing.')
          }
          out = await api.runThesisPlanModule(
            info.subject, info.module, plan.reuse, 'research', entry.willRunAgents, entry.doneOrbKeys,
            plan.targetRunRoot, plan.dataPool.files, plan.dataPool.newestMs, execution, info.runRoot,
            rc.requestId, plan.continuationReceipt,
          )
        } else {
          const body: { selection: FrozenProviderLaunch; kind: 'full' | 'module'; ticker: string; module?: string; confirmTicker?: string; force?: boolean; swarm?: string } =
            { selection: execution, kind: info.kind as 'full' | 'module', ticker: info.subject, module: info.module, force, swarm }
          if (info.kind === 'full') body.confirmTicker = info.subject
          out = await api.launch(body)
        }
        // The engine reports the resume split: `skipped` = modules already finished on disk (NOT re-run),
        // `planned` = modules this relaunch will actually run. Use it to keep the UI honest.
        requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
        revealAcceptedTrackedLaunch(set, get)
        const { runId, chained, skipped, planned: plannedMods, resumed } = out
        if (chained) set({ chainTickers: new Set(get().chainTickers).add(runSubjectKey(info.swarm || 'research', info.subject)) })
        // If the resumed subject is the one on screen, light up its orbs and follow live (beginRun keys off
        // the selected ticker). Otherwise just attach the stream + refresh — the Activity log row settles on
        // its own, and the user can select the subject to watch it run.
        const onScreen = info.subject === get().selectedTicker && get().activeSwarm === (info.swarm || 'research')
        // Compute the resume split once. `hasSplit` keys off PRESENCE of the array, not its length: the
        // per-module engine always returns an array (even []), while a monolithic/older engine omits it —
        // so an empty `planned: []` (every module already done, only the master synthesis remains) is a
        // real split, NOT "no split". Keying off `.length` here would fall through to "queue all orbs" and
        // re-show the exact false "reprocessing everything" alarm this whole change removes.
        const nodes = [...get().nodesByKey.values()]
        const hasSplit = Array.isArray(plannedMods)
        const runSet = hasSplit ? new Set(plannedMods) : null
        const doneSet = new Set(skipped || [])
        let plannedKeys: string[]
        let doneKeys: string[] = []
        if (info.kind === 'module' && info.module) {
          plannedKeys = nodes.filter((n) => n.module === info.module).map((n) => n.key)
        } else if (hasSplit) {
          // queue ONLY the modules that will run; show the already-finished ones as done (green), not
          // "starting". When planned is empty (only master left) plannedKeys is [] and every module is done.
          plannedKeys = nodes.filter((n) => runSet!.has(n.module)).map((n) => n.key)
          doneKeys = nodes.filter((n) => doneSet.has(n.module)).map((n) => n.key)
        } else {
          plannedKeys = nodes.map((n) => n.key) // no split (monolithic full, or an older engine) — run all
        }
        if (runId && onScreen) {
          beginRun(set, get, runId, { subject: info.subject, swarmId: info.swarm || 'research', execution, kind: info.kind, continuation: true, module: info.module, willCommitToMain: true }, plannedKeys, doneKeys)
        } else if (runId) {
          connectRun(get, runId)
          void get().refreshActiveRuns()
        } else {
          // runId === '' — the engine ran the master directly (every module was already done). It runs
          // under its OWN runId, adopted via refreshActiveRuns; NEVER open a stream to an empty id or write
          // a phantom activeRuns[''] card. Just mark the finished modules done so the on-screen
          // constellation is honest (not a false all-"starting").
          if (onScreen && doneKeys.length) {
            const rt = { ...get().nodeRuntime }
            for (const k of doneKeys) rt[k] = { status: 'done' }
            set({ nodeRuntime: rt })
          }
          void get().refreshActiveRuns()
        }
        set({ resumeConfirm: null })
        void get().refreshResumable()
        const skippedN = skipped?.length || 0
        const runningLabel = hasSplit ? (plannedMods!.length ? plannedMods!.join(', ') : 'the final synthesis') : 'the rest'
        get().setToast({
          msg: resumed && skippedN
            ? `Completing ${label} — ${skippedN} module${skippedN === 1 ? '' : 's'} already done, running only ${runningLabel}`
            : `Completing ${label} — picking up where it stopped`,
          tone: 'good',
        })
      } catch (e: any) {
        set({ resumeConfirm: null })
        const exactResearchContinue = (info.swarm || 'research') === 'research'
        launchErrorToast(get, e, info.subject, `resume of ${label}`,
          exactResearchContinue || force ? undefined : () => doResume(true))
      } finally {
        if (get().launchPending === pending) set({ launchPending: null })
      }
    }
    await doResume()
  },

  checkCredit: async () => {
    if (get().staticMode) return
    set({ creditChecking: true })
    try {
      const credit = await api.creditCheck()
      set({ credit })
    } catch {
      // keep last-known usage on a transient failure — don't wipe the windows we already have
    } finally {
      set({ creditChecking: false })
    }
  },

  setRunProvider: (provider) => {
    if (providerIsBlocked(get().providers[provider])) return
    saveRunProvider(provider)
    set({ runProvider: provider })
  },

  setRunProfile: (provider, profileKey) => {
    const option = selectedProviderProfile(get().providers[provider], profileKey)
    if (!option) return
    saveRunProfileKey(provider, option.key)
    set({ runProfileKeys: { ...get().runProfileKeys, [provider]: option.key } })
  },

  refreshProviders: async (provider) => {
    if (get().staticMode) return
    providerChecksInFlight++
    set({ providersChecking: true })
    if (provider) {
      const current = get().providers
      set({ providers: { ...current, [provider]: { ...current[provider], checking: true } } })
    }
    const catalogGeneration = providerCatalogSeq
    const targetedGeneration = provider ? ++providerCheckSeq[provider] : undefined
    let claudeGeneration: number | undefined
    let codexGeneration: number | undefined
    let fullCatalogGeneration: number | undefined
    if (!provider) {
      fullCatalogGeneration = ++providerCatalogSeq
      claudeGeneration = ++providerCheckSeq.claude
      codexGeneration = ++providerCheckSeq.codex
    }
    const targetedIsCurrent = () => !!provider && targetedGeneration === providerCheckSeq[provider]
      && catalogGeneration === providerCatalogSeq
    const catalogIsCurrent = () => fullCatalogGeneration === providerCatalogSeq
    try {
      if (provider) {
        const status = await api.providerCheck(provider)
        if (!targetedIsCurrent()) return
        const providers = { ...get().providers, [provider]: { ...status, provider, checked: true, checking: false } }
        set({ providers, runProfileKeys: reconcileRunProfileKeys(get().runProfileKeys, providers) })
      } else {
        const providers = await api.providers()
        if (!catalogIsCurrent()) return
        if (providers.catalogState === 'fallback' && get().runProvider === 'codex') {
          saveRunProvider('claude')
          set({ providers, runProvider: 'claude', runProfileKeys: reconcileRunProfileKeys(get().runProfileKeys, providers) })
        } else {
          // A targeted check that began after this catalogue read owns its provider row. Keep that newer
          // answer while still applying the catalogue's contract state and the other row.
          const current = get().providers
          const reconciledProviders = {
            ...providers,
            claude: claudeGeneration === providerCheckSeq.claude ? providers.claude : current.claude,
            codex: codexGeneration === providerCheckSeq.codex ? providers.codex : current.codex,
          }
          set({ providers: reconciledProviders, runProfileKeys: reconcileRunProfileKeys(get().runProfileKeys, reconciledProviders) })
        }
      }
    } catch {
      if (provider) {
        if (!targetedIsCurrent()) return
        set({ providers: { ...get().providers, [provider]: { ...get().providers[provider], checked: true, checking: false, status: 'unavailable', available: false, reason: 'Availability check failed' } } })
      } else {
        if (!catalogIsCurrent()) return
        // Only api.providers() can mint the exact-404 legacy fallback. An exception here is transient or
        // unclassified: retain the user's choice, make both rows retryable, and block all launches.
        set({ providers: providerCatalogUnknown('Provider selection could not be verified. Check again.') })
      }
    } finally {
      providerChecksInFlight = Math.max(0, providerChecksInFlight - 1)
      set({ providersChecking: providerChecksInFlight > 0 })
      reconcileProviderRediscovery(get)
    }
  },

  // The flat constellation and the globe are the SAME WebGL scene at morph 0 / 1 — switching just changes
  // the morph target, which the scene animates as one continuous wrap/unwrap. No renderer swap.
  setResearchView: (v) => {
    if (v === 'globe' && !get().webglOK) return // never strand into a view WebGL can't render
    // The watchlist is a destination, not a home — see isPersistableView. Selecting it leaves the
    // remembered stage view alone, so a reload returns you to the constellation or globe you were on.
    try { if (isPersistableView(v)) localStorage.setItem(VIEW_KEY, v) } catch {}
    set({ researchView: v })
  },

  setWatchlistShowArchived: (v) => set({ watchlistShowArchived: v }),
  setWatchlistLayout: (l) => {
    try { localStorage.setItem(WL_LAYOUT_KEY, l) } catch { /* private mode — the choice just does not persist */ }
    set({ watchlistLayout: l })
  },

  // Opening from the decision banner switches to the view AND opens the form, so the button lands you
  // where the thing you just created will appear rather than leaving you to go find it.
  openWatchComposer: (prefill, entryId) => {
    set({ watchComposer: { open: true, entryId: entryId ?? null, prefill: prefill ?? null, openedAt: Date.now() } })
    if (get().constellationSwarm === 'research') get().setResearchView('watchlist')
  },
  closeWatchComposer: () => set({ watchComposer: null }),

  saveWatchRow: async (input, entryId, files) => {
    if (get().staticMode) { get().setToast({ msg: 'Adding to the watchlist needs the live engine.', tone: 'bad' }); return false }
    try {
      // A PDF needs an entry to hang off, so the row is written first and the files follow. A failed
      // upload therefore never loses the row — it says the row saved and the file did not.
      const saved: any = entryId ? await api.watchUpdate(entryId, input) : await api.watchCreate(input)
      const id = entryId ?? saved?.entry?.entry_id ?? null
      // Tracked so the row-saved success toast below never PAPERS OVER a real attach failure — it used to
      // fire unconditionally right after this block, replacing the specific "N files did not attach"
      // warning with a bare "saved" a moment later, and the composer had already closed by then too.
      let attachWarning: string | null = null
      if (files?.length && id) {
        try {
          const r = await api.watchAttach(id, files)
          if (r.fileErrors?.length) {
            attachWarning = `${input.ticker} saved, but ${r.fileErrors.length} file${r.fileErrors.length === 1 ? '' : 's'} did not attach: ${r.fileErrors[0].reason}`
          }
        } catch (e: any) {
          attachWarning = `${input.ticker} saved, but the file did not attach: ${e?.message ?? 'upload failed'}`
        }
      }
      await get().loadWatchlist(true)
      set({ watchComposer: null })
      // publish_error: the row saved to this machine's disk, but the git commit/push that is supposed to
      // make it durable (CLAUDE.md §25/§28 — watchlist/** is data) failed. Nothing typed is lost — it is
      // still readable from the local file on the next load — but it has not left this machine yet, and
      // silence here is exactly the failure mode a prior review round found: a mutation that reached no
      // git history at all, with nothing in the UI ever saying so.
      const pubWarning = saved?.publish_error ? `${input.ticker} saved locally, but did not sync: ${saved.publish_error}` : null
      get().setToast(attachWarning
        ? { msg: attachWarning, tone: 'bad' }
        : pubWarning
          ? { msg: pubWarning, tone: 'bad' }
          : { msg: entryId ? `${input.ticker} updated.` : `${input.ticker} added to the watchlist.`, tone: 'good' })
      return true
    } catch (e: any) {
      const msg = e?.status === 409 ? `${input.ticker} is already on the watchlist.`
        : e?.message === 'static-deploy' ? 'Adding to the watchlist needs the live engine.'
        : e?.message ? String(e.message) : 'Could not save.'
      get().setToast({ msg, tone: 'bad' })
      return false
    }
  },

  // Mirrors refreshLiveQuote: a TTL gate unless forced, a static-mode early return, and FAIL TO NULL
  // rather than fabricate — a stale list beside a live price would be worse than an honest gap.
  loadWatchlist: async (force) => {
    // NOT gated on staticMode: the showcase carries the list (without prices) and api.watchlist serves it
    // from the snapshot. Only the WRITES are gated, below.
    const at = get().watchlistAt
    if (!force && at && Date.now() - at < 60_000) return
    set({ watchlistLoading: true })
    try {
      const read = await api.watchlist()
      set({
        watchlist: read,
        watchlistAt: Date.now(),
        watchlistError: null,
        watchlistLoading: false,
        // The count of CONDITIONS met, not rows — the badge says "N conditions have been met" (ViewToggle),
        // and one row can carry several simultaneously met triggers (an upper AND a lower price level, plus
        // a margin-of-safety condition). Counting rows undercounted whenever more than one fired together.
        watchlistMetCount: read.rows.reduce((n, r) => n + r.evals.filter((e) => e.state === 'condition_met').length, 0),
      })
    } catch (e: any) {
      // an engine older than this bundle has no route yet: feature off, never an error surface
      if (e?.status === 404) { set({ watchlist: null, watchlistError: null, watchlistLoading: false, watchlistMetCount: 0 }); return }
      set({ watchlistError: e?.message ? String(e.message) : 'could not load the watchlist', watchlistLoading: false })
    }
  },

  detachWatchFile: async (entryId, attachmentId) => {
    if (get().staticMode) { get().setToast({ msg: 'Removing a file needs the live engine.', tone: 'bad' }); return }
    try {
      await api.watchDetach(entryId, attachmentId)
      await get().loadWatchlist(true)
    } catch {
      get().setToast({ msg: 'Could not remove the file.', tone: 'bad' })
    }
  },

  archiveWatch: async (ticker, currency, reason, muteScope = 'assertion') => {
    if (get().staticMode) { get().setToast({ msg: 'Archiving needs the live engine.', tone: 'bad' }); return false }
    set({ watchlistPending: ticker })
    try {
      const r = await api.watchArchive(ticker, currency, reason, muteScope)
      await get().loadWatchlist(true)
      get().setToast(r?.publish_error
        ? { msg: `${ticker} archived locally, but did not sync: ${r.publish_error}`, tone: 'bad' }
        : { msg: `${ticker} archived.`, tone: 'good' })
      return true
    } catch (e: any) {
      get().setToast({ msg: e?.message === 'static-deploy' ? 'Archiving needs the live engine.' : `Could not archive ${ticker}.`, tone: 'bad' })
      return false
    } finally {
      set({ watchlistPending: null })
    }
  },

  restoreWatch: async (ticker, currency) => {
    if (get().staticMode) { get().setToast({ msg: 'Restoring needs the live engine.', tone: 'bad' }); return false }
    set({ watchlistPending: ticker })
    try {
      const r = await api.watchRestore(ticker, currency)
      await get().loadWatchlist(true)
      get().setToast(r?.publish_error
        ? { msg: `${ticker} restored locally, but did not sync: ${r.publish_error}`, tone: 'bad' }
        : { msg: `${ticker} restored.`, tone: 'good' })
      return true
    } catch {
      get().setToast({ msg: `Could not restore ${ticker}.`, tone: 'bad' })
      return false
    } finally {
      set({ watchlistPending: null })
    }
  },

  selectNode: (key) => set({ selectedNodeKey: key }),
  setNow: (n) => set({ now: n }),
  stageDockH: 0,
  // guarded so a ResizeObserver firing the same height (very common) never re-renders the whole field
  setStageDockH: (h) => { const next = stageDockHUpdate(h, get().stageDockH); if (next !== null) set({ stageDockH: next }) },

  nodeStatus: (key) => {
    const { nodeRuntime, nodesByKey, dataStatus, selectedTicker, activeSwarm } = get()
    const rt = nodeRuntime[key]
    if (rt) return rt.status
    if (!selectedTicker) return 'dormant'
    const node = nodesByKey.get(key)
    if (!node) return 'dormant'
    // a non-research constellation swarm (e.g. commodity) has no research data pool — gate purely on
    // whether an orb's upstream is present (soloRunnable), never on dataStatus (which is null there).
    if (activeSwarm !== 'research') return node.soloRunnable ? 'ready' : 'notready'
    if (!dataStatus) return 'dormant'
    const mod = dataStatus.modules[node.module]
    if (mod?.status === 'Insufficient') return 'locked'
    return node.soloRunnable ? 'ready' : 'notready'
  },

  // LIVE runs for a ticker (launch-guard truth); finished runs are excluded.
  activeRunsForTicker: (t) => runsForSubject(get().activeRuns, t, get().activeSwarm),
  anyRunForTicker: (t) => runsForSubject(get().activeRuns, t, get().activeSwarm).length > 0,
  // is any of these orb keys already queued/running for this ticker? (disjoint-target client guard)
  targetInFlight: (t, keys) => {
    if (!runsForSubject(get().activeRuns, t, get().activeSwarm).length) return false
    const rt = get().nodeRuntime
    return keys.some((k) => rt[k]?.status === 'queued' || rt[k]?.status === 'running')
  },

  launchAgent: async (node, force) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const providerProblem = providerLaunchBlockedReason(get().providers[get().runProvider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const selection = captureLaunchSelection(get())
    const t = selection?.subject
    if (!selection || !t) return
    if (hasPendingLaunchForTicker(get(), selection)) return
    if (!node.soloRunnable) {
      get().setToast({ msg: `${node.name} needs upstream — run the module first`, tone: 'info' })
      return
    }
    // Local launcher captures the complete selection identity. A retry toast from an old company must not
    // silently force the same-named orb after the user has navigated away (or away and back).
    const doLaunch = async (f?: boolean) => {
      if (!requireCurrentLaunchSelection(get(), selection)) return
      if (hasPendingLaunchForTicker(get(), selection)) return
      // instant feedback: the pending flag flips the button to a spinner IN THE SAME FRAME as the click
      const pending = { key: `agent:${node.key}`, label: `Starting ${node.name}…`, ticker: t, selection }
      set({ launchPending: pending })
      try {
        const out = await api.launch({ selection, kind: 'agent', ticker: t, module: node.module, agent: node.name, force: f, swarm: selection.swarm !== 'research' ? selection.swarm : undefined })
        requireLaunchProviderReceipt(out, selection, get().providers.catalogState)
        const { runId } = out
        beginRun(set, get, runId, { subject: t, swarmId: selection.swarm, execution: selection, kind: 'agent', module: node.module, agent: node.name, willCommitToMain: false }, [node.key])
        if (!launchSelectionIsCurrent(get(), selection)) {
          get().setToast({ msg: `${node.name} started on ${t}. Follow it in Activity.`, tone: 'good' })
          return
        }
        get().setToast({ msg: `${f ? 'Re-launched' : 'Launched'} ${node.name} on ${t}`, tone: 'good' })
      } catch (e: any) {
        launchErrorToast(get, e, t, node.name, f ? undefined : () => doLaunch(true))
      } finally {
        if (get().launchPending === pending) set({ launchPending: null })
      }
    }
    // Client-side in-flight guard. A forced retry skips it. When it trips on a run the UI THINKS is live but
    // whose engine process has actually died (the exact stuck-lock this patch targets), a plain
    // "already running" toast would be a dead end — the first launch never reaches the server, so the
    // server's reap-dead path never runs. So the guard-trip toast itself offers "Run anyway", which forces
    // to the server (reaping the corpse and relaunching).
    if (!force && get().targetInFlight(t, [node.key])) {
      return get().setToast({ msg: `${node.name} is already running`, tone: 'info', action: { label: 'Run anyway', onClick: () => doLaunch(true) } })
    }
    await doLaunch(force)
  },

  launchModule: async (module, force) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const providerProblem = providerLaunchBlockedReason(get().providers[get().runProvider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const selection = captureLaunchSelection(get())
    const t = selection?.subject
    if (!selection || !t) return
    if (hasPendingLaunchForTicker(get(), selection)) return
    const planned = [...get().nodesByKey.values()].filter((n) => n.module === module).map((n) => n.key)
    // Research module headings use the same disk-truth resume contract as the completion panel. That contract
    // carries valid finished specialists + upstream modules, runs only the missing specialists, and refreshes
    // the synthesis. The old direct /api/launch path could neither see filled orbs in an older run nor safely
    // handle a historical synthesis whose roster had since grown.
    const graphModule = get().graph?.modules.find((entry) => entry.name === module)
    if (selection.swarm === 'research' && typeof graphModule?.exactResume !== 'boolean') {
      return get().setToast({
        msg: 'The engine is still updating. Refresh once, then click the module again.',
        tone: 'info',
      })
    }
    const exactResume = selection.swarm === 'research' && graphModule?.exactResume === true
    if (exactResume) {
      // A heading click is only a request to REVIEW the smart-resume scope. Its confirmation is synchronous
      // and entirely local: no plan GET, cancellation, publication or paid run starts until Run is pressed.
      // Preserve the established stale-lock recovery: an already-live module still offers Stop & run again,
      // while that second explicit action bypasses this confirmation and performs the guarded force path.
      if (force || get().targetInFlight(t, planned)) {
        await runExactResearchModule(set, get, module, selection, force)
        return
      }
      const moduleNodes = [...get().nodesByKey.values()].filter((node) => node.module === module)
      const scope = moduleRunAffordance(moduleNodes, get().nodeStatus)
      set({
        launchConfirm: {
          kind: 'module',
          selection,
          module,
          unfinishedSpecialists: scope.unfinishedSpecialists,
          inputModules: moduleRunInputModules(get().graph?.modules ?? [], module),
        },
      })
      return
    }
    // Non-research module retries carry the same exact selection binding as research retries.
    const doLaunch = async (f?: boolean) => {
      if (!requireCurrentLaunchSelection(get(), selection)) return
      if (hasPendingLaunchForTicker(get(), selection)) return
      const pending = { key: `module:${module}`, label: `Starting the ${module} module…`, ticker: t, selection }
      set({ launchPending: pending })
      try {
        const out = await api.launch({ selection, kind: 'module', ticker: t, module, force: f, swarm: selection.swarm !== 'research' ? selection.swarm : undefined })
        requireLaunchProviderReceipt(out, selection, get().providers.catalogState)
        const { runId } = out
        beginRun(set, get, runId, { subject: t, swarmId: selection.swarm, execution: selection, kind: 'module', module, willCommitToMain: true }, planned)
        if (!launchSelectionIsCurrent(get(), selection)) {
          get().setToast({ msg: `${moduleLabel(module)} started on ${t}. Follow it in Activity.`, tone: 'good' })
          return
        }
        get().setToast({ msg: `${f ? 'Re-launched' : 'Launched'} ${module} module on ${t}`, tone: 'good' })
      } catch (e: any) {
        launchErrorToast(get, e, t, `${module} module`, f ? undefined : () => doLaunch(true))
      } finally {
        if (get().launchPending === pending) set({ launchPending: null })
      }
    }
    // Guard-trip offers "Run anyway" too, so a UI-live-but-dead module lock isn't a dead end (see launchAgent).
    if (!force && get().targetInFlight(t, planned)) {
      return get().setToast({ msg: `${module} is already running`, tone: 'info', action: { label: 'Run anyway', onClick: () => doLaunch(true) } })
    }
    await doLaunch(force)
  },

  confirmModule: async () => {
    const lc = get().launchConfirm
    if (!lc || lc.kind !== 'module') return
    const selection = lc.selection
    if (!launchSelectionIsCurrent(get(), selection) || get().launchConfirm !== lc) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'The selected call changed. Nothing was launched.', tone: 'info' })
    }
    if (get().staticMode) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    }
    if (isLaunchHealthBlocked(get().health)) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'Engine offline — the run was not started.', tone: 'bad' })
    }
    const graphModule = get().graph?.modules.find((entry) => entry.name === lc.module)
    const currentInputModules = moduleRunInputModules(get().graph?.modules ?? [], lc.module)
    const inputsUnchanged = currentInputModules.length === lc.inputModules.length
      && currentInputModules.every((input, index) => input === lc.inputModules[index])
    if (selection.swarm !== 'research' || graphModule?.exactResume !== true || !inputsUnchanged) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'The engine is still updating. Refresh once, then click the module again.', tone: 'info' })
    }
    try {
      await runExactResearchModule(set, get, lc.module, selection, false)
    } finally {
      if (get().launchConfirm === lc) set({ launchConfirm: null })
    }
  },

  requestFull: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — a full run executes on your machine via npm run dev', tone: 'info' })
    const mayQueueThroughUpdate = get().health === 'updating' && get().activeSwarm === 'research'
    if (isLaunchHealthBlocked(get().health) && !mayQueueThroughUpdate) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const providerProblem = providerLaunchBlockedReason(get().providers[get().runProvider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const selection = captureLaunchSelection(get())
    if (!selection) return
    const existingPending = get().launchPending
    if (existingPending?.ticker === selection.subject && existingPending.key !== 'full:request') return
    const seq = ++launchPriceSeq
    if (get().anyRunForTicker(selection.subject)) return get().setToast({ msg: `Finish the in-flight run on ${selection.subject} first — a full run needs exclusive access`, tone: 'info' })
    const pending = { key: 'full:request', label: 'Preparing the run plan…', ticker: selection.subject, selection }
    set({ launchPending: pending })
    try {
      const preflight = await api.estimate('full', selection.subject, selection, undefined, undefined, selection.swarm !== 'research' ? selection.swarm : undefined)
      if (seq !== launchPriceSeq || !launchSelectionIsCurrent(get(), selection)) return
      if (!launchPreflightMatches(preflight, selection, 'full', get().providers.catalogState)) {
        return get().setToast({ msg: 'Couldn\'t verify that this run plan belongs to the call on screen. Refresh and try again.', tone: 'bad' })
      }
      set({ launchConfirm: { kind: 'full', selection, preflight } })
    } catch (e: any) {
      if (seq !== launchPriceSeq || !launchSelectionIsCurrent(get(), selection)) return
      // was an unhandled rejection — the button just did nothing on a failed estimate
      get().setToast({ msg: `Couldn't prepare the run: ${e?.message || 'the estimate failed'}`, tone: 'bad' })
    } finally {
      // A late estimate must not clear feedback for a newer launch request.
      if (get().launchPending === pending) set({ launchPending: null })
    }
  },

  confirmFull: async () => {
    const lc = get().launchConfirm
    if (!lc || lc.kind !== 'full') return
    const selection = lc.selection
    const providerProblem = providerLaunchBlockedReason(get().providers[selection.provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Nothing was launched.`, tone: 'bad' })
    if (!launchSelectionIsCurrent(get(), selection) || get().launchConfirm !== lc) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'The selected call changed. Nothing was launched.', tone: 'info' })
    }
    const mayQueueThroughUpdate = get().health === 'updating' && selection.swarm === 'research'
    if (isLaunchHealthBlocked(get().health) && !mayQueueThroughUpdate) { set({ launchConfirm: null }); return get().setToast({ msg: 'Engine offline — the run was not started.', tone: 'bad' }) }
    const planned = [...get().nodesByKey.keys()]
    // keep the confirm modal OPEN with its Launch button spinning until the server acks — closing it
    // immediately read as "dismissed", not "launching" (the old dead-air window)
    const pending = { key: 'confirm', label: `Starting the full run on ${selection.subject}…`, ticker: selection.subject, selection }
    set({ launchPending: pending })
    try {
      // Recheck immediately before constructing the paid request. The body uses the captured identity;
      // current store fields are never re-read as launch authority after the confirmation was priced.
      if (!launchSelectionIsCurrent(get(), selection) || get().launchConfirm !== lc) {
        set({ launchConfirm: null })
        return get().setToast({ msg: 'The selected call changed. Nothing was launched.', tone: 'info' })
      }
      const out = await api.launch({ selection, kind: 'full', ticker: selection.subject, confirmTicker: selection.subject, requestId: crypto.randomUUID(), swarm: selection.swarm !== 'research' ? selection.swarm : undefined })
      if (isQueuedLaunchResponse(out)) {
        set({ launchConfirm: null, activityOpen: true })
        await get().refreshPendingAdmissions()
        get().setToast({ msg: `Full run on ${selection.subject} is waiting for the update and will start once.`, tone: 'good' })
        return
      }
      const { runId, chained, preflight } = out
      if (typeof runId !== 'string' || !runId.trim()
          || !launchProviderReceiptMatches(out, selection, get().providers.catalogState)
          || !launchPreflightMatches(preflight, selection, 'full', get().providers.catalogState)) {
        revealAcceptedTrackedLaunch(set, get)
        return get().setToast({ msg: 'The run started, but its receipt did not match this call. Check Activity before doing anything else.', tone: 'bad' })
      }
      revealAcceptedTrackedLaunch(set, get)
      // The paid request may finish after navigation. It still targeted the captured subject, but must not
      // paint that run onto the newly selected graph.
      if (!launchSelectionIsCurrent(get(), selection)) {
        void get().refreshActiveRuns()
        return get().setToast({ msg: `The full run started on ${selection.subject}. Follow it in Activity.`, tone: 'good' })
      }
      // a chained full run is a sequence of per-module runs + master; mark the ticker so run-done defers
      // the "complete" celebration to the master step and the cockpit live-follows every step.
      if (chained) set({ chainTickers: new Set(get().chainTickers).add(runSubjectKey(selection.swarm, selection.subject)) })
      set({ launchConfirm: null })
      beginRun(set, get, runId, { subject: selection.subject, swarmId: selection.swarm, execution: selection, kind: 'full', willCommitToMain: true }, planned)
      get().setToast({ msg: `Launched full run on ${selection.subject}${chained ? ' (per-module)' : ''}`, tone: 'good' })
    } catch (e: any) {
      if (get().launchConfirm === lc) set({ launchConfirm: null }) // close so the error toast is unobstructed
      launchErrorToast(get, e, selection.subject, 'full run')
    } finally {
      if (get().launchPending === pending) set({ launchPending: null })
    }
  },

  // re-run one orb + everything downstream of it (its module synthesis -> dependent module syntheses -> master Memo).
  // opens the cascade confirm dialog; confirmRerun() actually launches. Live-only.
  launchRerun: async (node, planOrigin) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — re-runs happen on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const selection = captureLaunchSelection(get())
    if (!selection) return
    if (hasPendingLaunchForTicker(get(), selection)) return
    const seq = ++launchPriceSeq
    const providerProblem = providerLaunchBlockedReason(get().providers[selection.provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    // A re-run changes an existing call, so it must be bound to that call's immutable run folder and
    // decision fingerprint. If the projection is still loading/missing, stop before even pricing work.
    // Full runs remain available because they create a new call rather than mutate this one.
    if (!hasExactDecisionBinding(selection)) {
      return get().setToast({ msg: 'I can’t safely re-run this call yet — its exact evidence record is missing. Refresh the call and try again.', tone: 'bad' })
    }
    if (planOrigin) selection.planOrigin = { ...planOrigin }
    const cascade = downstreamCascade(get().graph, node.module, node.name)
    if (!cascade.length) return get().setToast({ msg: `Can't resolve the downstream of ${node.name}`, tone: 'bad' })
    if (get().targetInFlight(selection.subject, cascade.map((c) => c.key))) return get().setToast({ msg: `${node.name} or its downstream is already running`, tone: 'info' })
    const pending = { key: `rerun:request:${node.key}`, label: `Preparing the re-run of ${node.name}…`, ticker: selection.subject, selection }
    set({ launchPending: pending })
    try {
      const preflight = await api.estimate(
        'rerun', selection.subject, selection, node.module, node.name,
        selection.swarm !== 'research' ? selection.swarm : undefined,
        { runRoot: selection.runRoot, decisionFingerprint: selection.decisionFingerprint, ...selection.planOrigin },
      )
      if (seq !== launchPriceSeq || !launchSelectionIsCurrent(get(), selection)) return
      const liveNode = get().nodesByKey.get(node.key)
      if (!liveNode || liveNode.module !== node.module || liveNode.name !== node.name
          || !launchPreflightMatches(preflight, selection, 'rerun', get().providers.catalogState, node)) {
        return get().setToast({ msg: 'Couldn\'t verify that this re-run belongs to the live orb on screen. Refresh and try again.', tone: 'bad' })
      }
      set({ launchConfirm: { kind: 'rerun', selection, preflight, cascade, node } })
    } catch (e: any) {
      if (seq !== launchPriceSeq || !launchSelectionIsCurrent(get(), selection)) return
      get().setToast({ msg: `Re-run estimate failed: ${e?.message || e}`, tone: 'bad' })
    } finally {
      if (get().launchPending === pending) set({ launchPending: null })
    }
  },

  confirmRerun: async () => {
    const lc = get().launchConfirm
    if (!lc || lc.kind !== 'rerun' || !lc.node) return
    const selection = lc.selection
    const providerProblem = providerLaunchBlockedReason(get().providers[selection.provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Nothing was launched.`, tone: 'bad' })
    if (!hasExactDecisionBinding(selection)) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'This re-run is not tied to an exact call. Nothing was launched.', tone: 'bad' })
    }
    if (!launchSelectionIsCurrent(get(), selection) || get().launchConfirm !== lc) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'The selected call changed. Nothing was launched.', tone: 'info' })
    }
    if (isLaunchHealthBlocked(get().health)) { set({ launchConfirm: null }); return get().setToast({ msg: 'Engine offline — the run was not started.', tone: 'bad' }) }
    const node = lc.node
    const liveNode = get().nodesByKey.get(node.key)
    if (!liveNode || liveNode.module !== node.module || liveNode.name !== node.name) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'That orb is no longer part of the live graph. Nothing was launched.', tone: 'info' })
    }
    // Recheck the server-minted capability at the final spend boundary too. This covers a confirmation
    // restored from stale client state or crafted by an old bundle: immutable local identity alone does
    // not prove the server understood it, and an old server would silently strip the binding fields.
    if (!launchPreflightMatches(lc.preflight, selection, 'rerun', get().providers.catalogState, node)) {
      set({ launchConfirm: null })
      return get().setToast({ msg: 'This engine did not verify the exact call. Nothing was launched.', tone: 'bad' })
    }
    const planned = (lc.cascade ?? downstreamCascade(get().graph, node.module, node.name)).map((c) => c.key)
    // Local launcher so the conflict "Run anyway" retry can re-fire with force AFTER the confirm dialog is
    // gone — node + planned are captured here, not re-read from the (now-cleared) launchConfirm.
    // The modal stays open with its Launch button spinning until the server acks (same as confirmFull).
    const doRerun = async (force?: boolean) => {
      if (!launchSelectionIsCurrent(get(), selection)) {
        set({ launchConfirm: null })
        return get().setToast({ msg: 'The selected call changed. Nothing was launched.', tone: 'info' })
      }
      const pending = { key: 'confirm', label: `Starting the re-run of ${node.name}…`, ticker: selection.subject, selection }
      set({ launchPending: pending })
      try {
        const out = await api.launchExact({
          selection, kind: 'rerun', ticker: selection.subject, module: node.module, agent: node.name, force,
          swarm: selection.swarm !== 'research' ? selection.swarm : undefined,
          runRoot: selection.runRoot,
          decisionFingerprint: selection.decisionFingerprint,
          ...selection.planOrigin,
        })
        const { runId, preflight } = out
        if (typeof runId !== 'string' || !runId.trim()
            || !launchProviderReceiptMatches(out, selection, get().providers.catalogState)
            || !launchPreflightMatches(preflight, selection, 'rerun', get().providers.catalogState, node)) {
          revealAcceptedTrackedLaunch(set, get)
          return get().setToast({ msg: 'The re-run started, but its receipt did not match this call. Check Activity before doing anything else.', tone: 'bad' })
        }
        revealAcceptedTrackedLaunch(set, get)
        if (!launchSelectionIsCurrent(get(), selection)) {
          void get().refreshActiveRuns()
          return get().setToast({ msg: `The re-run of ${node.name} started on ${selection.subject}. Follow it in Activity.`, tone: 'good' })
        }
        set({ launchConfirm: null })
        beginRun(set, get, runId, { subject: selection.subject, swarmId: selection.swarm, execution: selection, kind: 'rerun', module: node.module, agent: node.name, willCommitToMain: true }, planned)
        get().setToast({ msg: `Re-running ${node.name} + downstream on ${selection.subject}`, tone: 'good' })
      } catch (e: any) {
        if (get().launchConfirm === lc) set({ launchConfirm: null })
        launchErrorToast(get, e, selection.subject, `re-run of ${node.name}`, force ? undefined : () => doRerun(true))
      } finally {
        if (get().launchPending === pending) set({ launchPending: null })
      }
    }
    await doRerun()
  },

  cancelLaunch: () => { launchPriceSeq++; set({ launchConfirm: null }) },
  changeLaunchProvider: async (provider) => {
    const lc = get().launchConfirm
    if (!lc || get().launchPending) return
    const seq = ++launchPriceSeq
    if (providerIsBlocked(get().providers[provider])) return
    if (providerNeedsCheck(get().providers[provider])) {
      await get().refreshProviders(provider)
      if (seq !== launchPriceSeq || get().launchConfirm !== lc) return
      if (providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)) return
    }
    if (seq !== launchPriceSeq || get().launchConfirm !== lc) return
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return
    if (lc.selection.provider === provider
        && lc.selection.expectedProfileKey === execution.expectedProfileKey
        && lc.selection.model === execution.model
        && lc.selection.reasoningLevel === execution.reasoningLevel
        && JSON.stringify(lc.selection.executionProfile) === JSON.stringify(execution.executionProfile)) return
    const node = lc.kind === 'rerun' ? lc.node : undefined
    const moduleName = lc.kind === 'module' ? lc.module : undefined
    const planOrigin = lc.selection.planOrigin
    get().setRunProvider(provider)
    set({ launchConfirm: null })
    if (moduleName) await get().launchModule(moduleName)
    else if (lc.kind === 'rerun' && node) await get().launchRerun(node, planOrigin)
    else await get().requestFull()
  },

  changeLaunchProfile: async (profileKey) => {
    const lc = get().launchConfirm
    if (!lc || get().launchPending) return
    const provider = lc.selection.provider
    const option = selectedProviderProfile(get().providers[provider], profileKey)
    if (!option || option.key === lc.selection.expectedProfileKey) return
    ++launchPriceSeq
    const node = lc.kind === 'rerun' ? lc.node : undefined
    const moduleName = lc.kind === 'module' ? lc.module : undefined
    const planOrigin = lc.selection.planOrigin
    get().setRunProvider(provider)
    get().setRunProfile(provider, option.key)
    set({ launchConfirm: null })
    if (moduleName) await get().launchModule(moduleName)
    else if (lc.kind === 'rerun' && node) await get().launchRerun(node, planOrigin)
    else await get().requestFull()
  },

  // Hide the run-stream panel. Keep the run rows in state (so reopening restores them); a boolean flag drives
  // visibility. The panel re-shows automatically on the next live run (see RunStreamPanel's anyLive effect).

  cancelRun: async (runId) => {
    const run = get().activeRuns[runId]
    const ticker = run?.ticker
    const swarm = run?.swarmId || 'research'
    // A chained full run advances through a NEW runId per module. Stop the WHOLE chain by subject so the
    // live step is cancelled no matter which id the panel is following — cancelling a single (possibly
    // already-ended) step id could 404 while the next module keeps spending. A plain run cancels by id.
    const chained = !!ticker && get().chainTickers.has(runSubjectKey(swarm, ticker))
    // instant "Stopping…" state; cleared by the terminal run-error/run-done SSE (or rolled back on failure)
    set({ stoppingRuns: { ...get().stoppingRuns, [runId]: true } })
    try {
      if (chained && ticker) {
        // Stop the whole chain by subject. Deploy-skew guard: an OLDER engine (new bundle served off an
        // engine mid-deploy) has no subject-cancel route and returns 404 — fall back to the single-run
        // cancel it DOES have (which still halts the chain via run.chained when it reaches a live step).
        // If THAT single-cancel also 404s (the followed step already ended, so it neither cancels nor
        // halts anything), escalate to the kill switch — every engine has cancel-all and it unconditionally
        // halts every chain. Fail CLOSED: a missing/stale route must never be read as "already stopped"
        // while a live module keeps spending.
        try {
          await api.cancelSubject(swarm, ticker)
        } catch (e: any) {
          if (e?.status !== 404) throw e
          try { await api.cancel(runId) }
          catch (e2: any) { if (e2?.status === 404) await api.cancelAllRuns(); else throw e2 }
        }
        // The followed id may never get its OWN terminal SSE (the chain had already advanced past it), so
        // nothing would clear its "Stopping…" spinner. The whole chain is stopping — clear it now; a
        // genuinely-live step re-clears itself when its own run-error lands.
        const s = { ...get().stoppingRuns }; delete s[runId]; set({ stoppingRuns: s })
      } else {
        await api.cancel(runId)
      }
      // reconcile the live set + resurface the Resume affordance for what was saved (pause → resume)
      void get().refreshActiveRuns()
      void get().refreshResumable()
    } catch (e: any) {
      // A 404 means the run already ended (it finished, or its closing SSE was missed on an edge/tunnel
      // drop) — it is already stopped, so this is success, not a failure. Reconcile and move on quietly.
      if (e?.status === 404) {
        const s = { ...get().stoppingRuns }; delete s[runId]; set({ stoppingRuns: s })
        void get().refreshActiveRuns()
        void get().refreshResumable()
        return
      }
      const s = { ...get().stoppingRuns }
      delete s[runId]
      set({ stoppingRuns: s })
      // never swallow silently — a failed cancel looked exactly like "it didn't cancel"
      get().setToast({ msg: `Couldn't cancel the run: ${e?.message || 'the request failed'}`, tone: 'bad' })
    }
  },

  // Resolve a run paused at the pre-flight readiness gate. SSE remains the lifecycle authority: an early
  // HTTP recheck acknowledgment means only "the check was accepted", never "the check finished". The
  // returned outcome lets the modal keep its pending state until readiness-checking/report/resolved arrives.
  decideReadiness: async (runId, action, ack) => {
    const gateBeforeRequest = get().readinessGate?.runId === runId
      ? get().readinessGate
      : get().readinessGateQueue.find((gate) => gate.runId === runId)
    const olderServerMembers = gateBeforeRequest ? readinessGateMembers(gateBeforeRequest).filter((id) => id !== runId) : []
    try {
      await api.readinessDecision(runId, action, ack)
      // Current servers resolve one chain owner. During a brief old-server deploy skew, the singleton gate
      // can contain several child owners; carry the same empty-safe action to them in order so one user click
      // remains one logical decision. Only empty gates expose recheck/cancel, never an invented override.
      if (olderServerMembers.length > 0 && (action === 'recheck' || action === 'cancel')) {
        void (async () => {
          for (const memberRunId of olderServerMembers) {
            try { await api.readinessDecision(memberRunId, action, ack) }
            catch (memberError: any) {
              if (memberError?.status !== 404 && memberError?.status !== 409) {
                get().setToast({ msg: 'One older engine step is still being checked. Its status will refresh automatically.', tone: 'info' })
              }
            }
          }
          void get().refreshActiveRuns()
        })()
      }
      if (action === 'cancel') get().setToast({ msg: 'Run cancelled at the data check', tone: 'info' })
      return 'accepted'
    } catch (e: any) {
      const status = e?.status as number | undefined
      if (status === 409) {
        // 409 is not proof that the gate is stale. A fast second recheck gets 409 while the first is
        // legitimately `readiness-checking`; proceed against blockers also returns 409 while the SAME
        // gate remains actionable. Ask the exact run before changing UI state. When the recheck is live,
        // preserve (or recover) the pre-request report and wait for its SSE outcome.
        try {
          const snap = await api.runSnapshot(runId)
          if (snap?.status === 'readiness-checking') {
            const current = get().readinessGate
            const queued = get().readinessGateQueue
            const stillPresent = current?.runId === runId || queued.some((gate) => gate.runId === runId)
            if (!stillPresent && gateBeforeRequest) {
              const gates = enqueueReadinessGate(current, queued, { ...gateBeforeRequest, rechecking: true })
              set({ readinessGate: gates.current, readinessGateQueue: gates.queued })
            }
            get().setToast({ msg: 'The data re-check is already running.', tone: 'info' })
            return 'active'
          }
          if (snap?.status === 'awaiting-readiness-decision') {
            const report = snap.readiness as ReadinessReport | undefined
            const current = get().readinessGate
            const queued = get().readinessGateQueue
            const fallback = report && Array.isArray(report.issues)
              ? { runId, report, chainId: gateBeforeRequest?.chainId, rechecking: false }
              : gateBeforeRequest && { ...gateBeforeRequest, rechecking: false }
            if (fallback) {
              const gates = enqueueReadinessGate(current, queued, fallback)
              set({ readinessGate: gates.current, readinessGateQueue: gates.queued })
            }
            get().setToast({ msg: e?.message || 'The data check still needs a decision.', tone: 'bad' })
            return 'failed'
          }
          // A confirmed non-gate state means this member ended and its closing SSE was missed. During
          // rolling old-server skew, a folded same-chain sibling can still be paused and must stay visible.
          const gates = terminateReadinessGateMember(get().readinessGate, get().readinessGateQueue, runId)
          set({ readinessGate: gates.current, readinessGateQueue: gates.queued })
          void get().refreshActiveRuns()
          get().setToast({ msg: 'This data check is no longer active — the run already started or ended.', tone: 'info' })
          return 'stale'
        } catch {
          // An ambiguous conflict must fail safe: leave the decision visible. Deleting it here can strand
          // a live check with no way for the user to see or recover it.
          get().setToast({ msg: 'Could not confirm the data-check state. It remains open; please wait a moment.', tone: 'bad' })
          return 'failed'
        }
      }
      if (status === 404) {
        const gates = terminateReadinessGateMember(get().readinessGate, get().readinessGateQueue, runId)
        set({ readinessGate: gates.current, readinessGateQueue: gates.queued })
        void get().refreshActiveRuns()
        get().setToast({ msg: 'This data check is no longer active — the run already started or ended.', tone: 'info' })
        return 'stale'
      }
      // A still-actionable rejection (bad ticker ack 412, invalid body 400) — keep the panel open.
      get().setToast({ msg: e?.message || 'Could not apply the decision', tone: 'bad' })
      return 'failed'
    }
  },

  // select a not-yet-run orb and open the panel in "pending" mode (no output to load) so the
  // Run button sits in the same place as Re-run, with the orb visibly selected.
  selectNodeForRun: (node) => {
    set({ selectedNodeKey: node.key, openOutput: { title: node.name, nodeKey: node.key, pending: true } })
  },

  openOutputForNode: async (node) => {
    const rt = get().nodeRuntime[node.key]
    if (!rt?.outputPath) {
      get().setToast({ msg: `${node.name} has no output yet`, tone: 'info' })
      return
    }
    set({ selectedNodeKey: node.key, openOutput: { path: rt.outputPath, title: node.name, verdict: rt.verdict, nodeKey: node.key } })
  },

  openThesis: async () => {
    const t = get().selectedTicker
    if (!t) return
    const sw = get().constellationSwarm
    const isResearch = sw === 'research'
    try {
      // open the thesis of the CURRENTLY-loaded run (get().runRoot, which selectTicker set to the run the
      // user opened — standing by default, or a specific run picked from history) rather than re-resolving
      // by ticker to the standing run — otherwise opening an older run would show the standing run's thesis.
      const res = await api.thesis(t, isResearch ? undefined : sw, isResearch ? (get().runRoot ?? undefined) : undefined)
      const vf = get().swarms.find((w) => w.id === sw)?.verdictField
      // a swarm's final deliverable is its terminal module's synthesis (the dossier) — derive the
      // reader's prompt/re-run target from the returned path; research keeps the master node.
      const runRoot = get().runRoot
      const rel = !isResearch && runRoot && res.path.startsWith(`${runRoot}/`) ? res.path.slice(runRoot.length + 1).replace(/\.md$/, '') : null
      set({ openOutput: { path: res.path, title: isResearch ? `Investment Thesis — ${t}` : `Dossier — ${t}`, verdict: resolveVerdict(get().decision, vf), nodeKey: isResearch ? 'master/synthesizer' : rel ?? undefined } })
    } catch (e: any) {
      // Tell "there is no thesis yet" (404) apart from "we could not ask" (500, timeout, tunnel drop). Only
      // the first means the thesis is unbuilt. Showing a completion plan for the second would turn a failed
      // request into a confident answer — and invite the user to pay for a run they may not need. A fetch
      // timeout/network drop carries NO status at all (undefined) — that is not proof of a 404 either, so
      // it must fail the same way an explicit 500 does, not fall through as if the thesis were missing.
      const status = e?.status as number | undefined
      if (status !== 404) {
        get().setToast({ msg: status === undefined ? 'Couldn’t reach the engine to check this run’s output.' : `Couldn’t check this run’s output — the engine returned ${status}.`, tone: 'bad' })
        return
      }
      // No final deliverable yet. "No final thesis yet" was true and useless — worse, it hid the fact that
      // finished modules may already be sitting on disk (possibly in an OLDER dated run folder), so the only
      // obvious next move, "Run full", silently re-ran and re-charged for all of them. Open the plan instead:
      // what's missing, what already exists, and what finishing it actually costs.
      await get().openThesisPlan()
    }
  },

  // ---- complete the thesis ----
  // Always fetched fresh from disk. The whole promise of this panel is "we will not re-run what already
  // exists", and a cached picture of what exists is exactly how that promise gets broken.
  openThesisPlan: async () => {
    const t = get().selectedTicker
    if (!t) { get().setToast({ msg: 'Select a company first', tone: 'info' }); return }
    if (get().staticMode) { get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' }); return }
    const sw = get().constellationSwarm
    const token = get().selectToken
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) { get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' }); return }
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) { get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' }); return }
    // Bump the price-request generation on every (re)open, not just on each toggle. Without this, a reprice
    // still in flight when the panel closes can resolve AFTER the panel is reopened (same ticker) and land
    // a stale override on top of the fresh disk snapshot just loaded below — `seq !== thesisPriceSeq` alone
    // can't catch that, since no toggle happened in the new session to advance the counter past it.
    const seq = ++thesisPriceSeq
    // thesisPlanPricing MUST be cleared here: a toggle whose re-price was still in flight when the panel
    // closed returns early and leaves it true, and nothing else resets it — which would leave the Run button
    // permanently disabled on every subsequent open (a dead button, the failure mode of the readiness gate).
    set({ thesisPlanOpen: true, thesisPlanLoading: true, thesisPlanPricing: false, thesisPlanError: null, thesisPlan: null, thesisPlanExecution: execution, thesisPlanIntake: null })
    try {
      let plan = await api.thesisPlan(t, execution, sw)
      // the user may have switched subject or closed the panel while this was in flight
      if (seq !== thesisPriceSeq || get().selectToken !== token || get().selectedTicker !== t
          || get().constellationSwarm !== sw || get().runProvider !== provider || get().thesisPlanExecution !== execution || !get().thesisPlanOpen) return
      requireLaunchProviderReceipt(plan.preflight, execution, get().providers.catalogState, false)
      requireLaunchProviderReceipt(plan.fullPreflight, execution, get().providers.catalogState, false)
      // INTELLIGENT DEFAULT (frameworks/INTAKE.md): if intake has read the docs that landed since the last
      // run and scoped the impact, don't default to "re-run every stale module". Keep the finished modules
      // the evidence doesn't touch; re-run only the affected ones + their DAG cascade. This is ADDITIVE over
      // the floor — the stale badges stay honest, and "re-run everything" (resetThesisReuse) is one click away.
      let scoped: ThesisPlanIntake | null = null
      const intake = get().intake
      const affected = affectedModules(intake)
      if (sw === 'research' && intake && affected.size && plan.reusable.length) {
        const keep = plan.reusable.filter((m) => !affected.has(m))
        const bluntKeeps = new Set(plan.reuse)
        // only override when it genuinely narrows the run (keeps something the blunt default would re-run)
        if (keep.length && keep.some((m) => !bluntKeeps.has(m))) {
          const scopedPlan = await api.thesisPlan(t, execution, sw, keep)
          if (seq !== thesisPriceSeq || get().selectToken !== token || get().selectedTicker !== t
              || get().constellationSwarm !== sw || get().runProvider !== provider || get().thesisPlanExecution !== execution || !get().thesisPlanOpen) return
          requireLaunchProviderReceipt(scopedPlan.preflight, execution, get().providers.catalogState, false)
          requireLaunchProviderReceipt(scopedPlan.fullPreflight, execution, get().providers.catalogState, false)
          plan = scopedPlan
          const present = new Set(plan.modules.map((m) => m.module))
          scoped = { affected: [...affected].filter((m) => present.has(m)), keep, scanDate: intake.scan_date, summary: intake.summary }
        }
      }
      set({ thesisPlan: plan, thesisPlanLoading: false, thesisPlanIntake: scoped })
    } catch (e: any) {
      if (seq !== thesisPriceSeq || get().selectToken !== token || get().selectedTicker !== t
          || get().constellationSwarm !== sw || get().runProvider !== provider || get().thesisPlanExecution !== execution || !get().thesisPlanOpen) return
      set({ thesisPlanLoading: false, thesisPlanError: e?.message || 'Could not read what this run still needs' })
    }
  },

  closeThesisPlan: () => set({ thesisPlanOpen: false, thesisPlanExecution: null, thesisPlanPricing: false, thesisPlanError: null, thesisPlanIntake: null }),

  // Fetch the scoped rerun plan for the selected ticker (advisory; the server validates + re-expands it).
  // Fails to null — the cockpit then shows the honest staleness floor, never a fabricated plan.
  refreshIntake: async () => {
    const t = get().selectedTicker
    const sw = get().activeSwarm
    if (!t || get().staticMode || sw === 'screener') return
    const token = get().selectToken
    const runRoot = get().runRoot ?? undefined
    const exactRead = get().dataNeeds
    const decisionFingerprint = runRoot && exactRead?.subject === t && exactRead.swarm === sw
      && exactRead.run_root === runRoot && /^sha256:[a-f0-9]{64}$/.test(exactRead.decision_fingerprint)
      ? exactRead.decision_fingerprint
      : undefined
    try {
      const plan = await api.intake(t, sw, runRoot, decisionFingerprint)
      if (get().selectToken !== token || get().selectedTicker !== t || get().activeSwarm !== sw
          || (runRoot !== undefined && get().runRoot !== runRoot)) return
      // Positive identity match for the new generic wire. During deploy skew, an old research-only server
      // omits `swarm`; accept that only for research. Never paint a commodity plan from a defaulted equity read.
      if (plan && ((plan.swarm !== undefined && plan.swarm !== sw)
          || (plan.subject !== undefined && plan.subject !== t)
          || (runRoot !== undefined && plan.run_root !== runRoot))) return
      // recompute which orbs the plan lights (nodesByKey is already set by selectTicker before this runs)
      set({ intake: plan, intakePlanKeys: focusKeysFor(plan, get().nodesByKey) })
    } catch {
      if (get().selectToken === token && get().selectedTicker === t && get().activeSwarm === sw) {
        set({ intake: null, intakePlanKeys: new Set() })
      }
    }
  },
  refreshDataNeeds: async (selectedRunRoot) => {
    const t = get().selectedTicker
    const sw = get().activeSwarm
    // constellation swarms only (research + commodity); the screener has no decision_record with data_needs.
    if (!t || get().staticMode || sw === 'screener') return
    const token = get().selectToken
    const requestSeq = ++dataNeedsRequestSeq
    const expectedRunRoot = sw === 'research' ? (selectedRunRoot ?? get().runRoot ?? undefined) : get().runRoot ?? undefined
    const startingFingerprint = get().dataNeeds?.run_root === expectedRunRoot
      ? get().dataNeeds?.decision_fingerprint
      : undefined
    const runRoot = sw === 'research' ? expectedRunRoot : undefined
    const requestStillOwnsSelection = () => get().selectToken === token && requestSeq === dataNeedsRequestSeq
      && get().selectedTicker === t && get().activeSwarm === sw
      && (expectedRunRoot === undefined || get().runRoot === expectedRunRoot)
      && (startingFingerprint === undefined || get().dataNeeds?.decision_fingerprint === startingFingerprint)
    const commit = (read: DataNeedsRead | null) => {
      if (!requestStillOwnsSelection()
          || get().selectedTicker !== t || get().activeSwarm !== sw
          || (read !== null && expectedRunRoot !== undefined && read.run_root !== expectedRunRoot)) return false
      set({ dataNeeds: read })
      return true
    }
    try {
      commit(await api.dataNeeds(t, sw, runRoot))
    } catch {
      // Keep the last known exact-decision projection on a transient timeout/500. A successful `{read:null}`
      // above is still authoritative and clears it; transport failure is not evidence that the needs vanished.
      // One delayed retry covers the measured cold-host path. Every boundary is exact-selection guarded,
      // so switching ticker/run while it waits (or while the retry is in flight) makes it a no-op.
      if (!requestStillOwnsSelection()) return
      await new Promise<void>((resolve) => setTimeout(resolve, DATA_NEEDS_RETRY_MS))
      if (!requestStillOwnsSelection()) return
      try { commit(await api.dataNeeds(t, sw, runRoot)) } catch { /* keep the last exact-decision projection */ }
    }
  },

  refreshWhatChanged: async () => {
    const t = get().selectedTicker
    // research-only v1, matched POSITIVELY (never `!== 'screener'`): an old engine mid-deploy 404s and
    // api.whatChanged returns null, so the chip hides rather than defaulting permissive.
    if (!t || get().staticMode || get().activeSwarm !== 'research') return
    const token = get().selectToken
    try {
      // the SAME runRoot the banner's decision was fetched with — selectTicker(t, runRoot) honours a
      // run-history pick, so a ticker-only fetch would describe a DIFFERENT run than the one on screen.
      const read = await api.whatChanged(t, get().runRoot ?? undefined)
      if (get().selectToken !== token) return // a newer selection superseded this fetch
      set({ whatChanged: read })
    } catch {
      if (get().selectToken === token) set({ whatChanged: null }) // fail to null, never fabricate
    }
  },
  // The live price for the run on screen. Combines the two established idioms: refreshWhatChanged's
  // select-token guard + fail-to-null, and refreshWirePulse's TTL gate so callers can fire it freely.
  // There is deliberately NO timer — the price refreshes when the user's own actions say it should
  // (selecting a company, a run finishing, re-opening the tab), which is also why the server keeps its
  // own TTL cache: repeated calls inside the window cost nothing.
  refreshLiveQuote: async (force = false, runRoot) => {
    const t = get().selectedTicker
    // research-only, matched POSITIVELY (never `!== 'screener'`): an engine older than the bundle 404s
    // /api/quote and api.quote returns null, so the cells hide rather than defaulting permissive.
    if (!t || get().staticMode || get().activeSwarm !== 'research') return
    const at = get().liveQuoteAt
    if (!force && at && Date.now() - at < 60_000) return
    const token = get().selectToken
    try {
      // the SAME runRoot the banner's decision came from — a ticker-only fetch could re-base against a
      // different run's entry price than the one displayed beside it. An EXPLICIT root (e.g. a run that
      // just finished) wins over the store's `runRoot`, which a concurrent manifest callback may not have
      // updated yet — otherwise the new run's call re-bases against the previous run's entry price.
      const read = await api.quote(t, preferRunRoot(runRoot, get().runRoot))
      if (get().selectToken !== token) return // a newer selection superseded this fetch
      set({ liveQuote: read, liveQuoteAt: Date.now() })
    } catch {
      if (get().selectToken === token) set({ liveQuote: null }) // fail to null, never fabricate
    }
  },

  openWhatChanged: () => set({ whatChangedOpen: true }),
  closeWhatChanged: () => set({ whatChangedOpen: false }),

  setIntakeFocus: (keys) => set({ intakeFocusKeys: keys }),

  // Manual "understand these documents" trigger. Launches the cheap advisory analysis (NO rerun) and polls
  // for the fresh plan (it's written to analyses/, which the data watcher doesn't announce). Auto-analysis
  // covers the common case silently; this is the on-demand button.
  analyzeIntake: async () => {
    const t = get().selectedTicker
    const sw = get().activeSwarm
    const runRoot = get().runRoot ?? undefined
    if (!t || get().staticMode || sw === 'screener' || get().intakeAnalyzing) return
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — analysis is paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ intakeAnalyzing: true })
    get().setToast({ msg: 'Reading the new documents — I’ll light up the orbs to re-run when it’s done (about a minute).', tone: 'info' })
    const token = get().selectToken
    const exactRead = get().dataNeeds
    const decisionFingerprint = runRoot && exactRead?.subject === t && exactRead.swarm === sw
      && exactRead.run_root === runRoot && /^sha256:[a-f0-9]{64}$/.test(exactRead.decision_fingerprint)
      ? exactRead.decision_fingerprint
      : undefined
    const before = get().intake?.analyzed_at
    try {
      try {
        const out = await api.analyzeIntake(t, sw, execution, runRoot, decisionFingerprint)
        requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
        revealAcceptedTrackedLaunch(set, get)
        // Attach to the run's live stream NOW rather than waiting for the next background poll: this is
        // what feeds the dock's reading list, and the run starts reading the moment it spawns. (The
        // server replays its activity ring on subscribe, so the steps taken in this gap are not lost —
        // but every second the stream is late is a second the panel has nothing to show.)
        await get().refreshActiveRuns()
        if (get().selectToken !== token) return
      } catch (e: any) {
        if (e?.body?.code !== 'subject_busy') throw e
        // The server's 409 subject_busy covers two different races under the same code: (1) ANY
        // run in flight on this ticker with no doc-intake run alongside it (a full/module run —
        // no intake plan is coming from it), or (2) a doc-intake run IS live for this ticker
        // (whether or not a module run is also going — the two coexist server-side), and its
        // write IS the plan we want. Only (2) is progress worth polling for — for (1), say so and
        // stop instead of spinning "Analyzing…" for 3 minutes with nothing to show for it.
        // activeRunsForTicker can be stale (another tab, or a headless run refreshActiveRuns
        // hasn't reconciled yet), so refresh from the server and read globalActive — it's set
        // synchronously when refreshActiveRuns resolves, unlike activeRuns (reconciled async via
        // reconnectRun).
        await get().refreshActiveRuns()
        const runsForTicker = get().globalActive.filter((r) => runMatchesSubject(r, t, sw))
        if (runsForTicker.length > 0 && !runsForTicker.some((r) => r.kind === 'doc-intake')) {
          get().setToast({ msg: `A run is already in progress on ${t} — finish or stop it before analyzing new documents.`, tone: 'info' })
          return
        }
        // A doc-intake run is live for this ticker (an auto-analyze-on-landing, an earlier click,
        // or another tab) — fall through to the same poll loop instead of surfacing an error toast.
        // If the server hasn't reconciled either run yet, fall through too rather than guess wrong.
      }
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 15_000))
        if (get().selectToken !== token) return
        await get().refreshIntake()
        if (get().selectToken !== token) return
        if (get().intake && get().intake!.analyzed_at !== before) break
      }
    } catch (e: any) {
      get().setToast({ msg: `Couldn’t analyze the new documents: ${e?.message || 'the run failed'}`, tone: 'bad' })
    } finally {
      if (get().selectToken === token) set({ intakeAnalyzing: false })
    }
  },

  // The "re-run everything" escape hatch: drop the intake scoping and re-price against the honest floor
  // (reuse only done-and-current → re-run every stale module). Intake guidance can narrow, never trap.
  resetThesisReuse: () => {
    const plan = get().thesisPlan
    const t = get().selectedTicker
    if (!plan || !t) return
    const token = get().selectToken
    const provider = get().runProvider
    const execution = get().thesisPlanExecution
    if (!execution || execution.provider !== provider) return
    set({ thesisPlanIntake: null, thesisPlanPricing: true })
    const sw = plan.swarm
    const seq = ++thesisPriceSeq
    api.thesisPlan(t, execution, sw)
      .then((fresh) => {
        if (get().selectToken !== token || seq !== thesisPriceSeq || get().selectedTicker !== t
            || get().runProvider !== provider || get().thesisPlanExecution !== execution || get().thesisPlan?.swarm !== sw || !get().thesisPlanOpen) return
        requireLaunchProviderReceipt(fresh.preflight, execution, get().providers.catalogState, false)
        requireLaunchProviderReceipt(fresh.fullPreflight, execution, get().providers.catalogState, false)
        set({ thesisPlan: fresh, thesisPlanPricing: false })
      })
      .catch((e: any) => {
        if (seq !== thesisPriceSeq || get().selectToken !== token || get().runProvider !== provider || get().thesisPlanExecution !== execution) return
        set({ thesisPlanPricing: false })
        get().setToast({ msg: e?.message || 'Couldn’t re-price that change — nothing was changed.', tone: 'bad' })
      })
  },

  // Flip ONE module between "reuse what's on disk" and "re-run it", then ask the SERVER to re-price. The
  // server owns pricing (it is what the launcher will charge), so the button's number can never drift from
  // the truth. The old plan stays on screen while the new price lands — a priced button must not flicker.
  toggleThesisRerun: (module) => {
    const plan = get().thesisPlan
    const t = get().selectedTicker
    if (!plan || !t) return
    if (!plan.reusable.includes(module)) return // nothing on disk to reuse — this module always runs
    if (plan.mustReuse.includes(module)) return // its synthesis is already in the target run root — the launcher skips it regardless
    const provider = get().runProvider
    const execution = get().thesisPlanExecution
    if (!execution || execution.provider !== provider) return

    const next = plan.reuse.includes(module) ? plan.reuse.filter((m) => m !== module) : [...plan.reuse, module]

    // Optimistic: flip the checkbox now (the click must feel instant), then reconcile with the server's price.
    set({ thesisPlan: { ...plan, reuse: next }, thesisPlanPricing: true })
    const token = get().selectToken
    const sw = plan.swarm
    // Clicks are faster than a disk walk, and responses can land out of order. Stamp each request and apply
    // only the newest — otherwise a slow earlier response overwrites a later one, visibly re-ticking a box the
    // user just unticked, and `completeThesis` launches with a reuse set the user can see they changed.
    const seq = ++thesisPriceSeq
    void (async () => {
      try {
        const repriced = await api.thesisPlan(t, execution, sw, next)
        if (seq !== thesisPriceSeq || get().selectToken !== token || get().selectedTicker !== t
            || get().runProvider !== provider || get().thesisPlanExecution !== execution || get().thesisPlan?.swarm !== sw || !get().thesisPlanOpen) return
        requireLaunchProviderReceipt(repriced.preflight, execution, get().providers.catalogState, false)
        requireLaunchProviderReceipt(repriced.fullPreflight, execution, get().providers.catalogState, false)
        set({ thesisPlan: repriced, thesisPlanPricing: false })
      } catch (e: any) {
        if (seq !== thesisPriceSeq || get().selectToken !== token || get().selectedTicker !== t
            || get().runProvider !== provider || get().thesisPlanExecution !== execution || get().thesisPlan?.swarm !== sw) return
        // Roll THIS toggle back off current state (not a stale closure, which would also undo later toggles),
        // and surface the failure as a toast — a transient re-price must never unmount the plan the user is
        // reading, and it is not the "couldn't read your run folders" error the panel's error state describes.
        const cur = get().thesisPlan
        set({ thesisPlan: cur ? { ...cur, reuse: plan.reuse } : plan, thesisPlanPricing: false })
        get().setToast({ msg: e?.message || 'Couldn’t re-price that change — nothing was changed.', tone: 'bad' })
      }
    })()
  },

  // One-pass scoped rerun (the New-data dock's confirm strip). Attaches to the returned run IMMEDIATELY
  // via beginRun — the same treatment every other launch path gets — so readiness decisions, progress and
  // cancel are on screen at once instead of waiting ~20s for the background active-run poll (Codex #358
  // r3672400227). Orb lighting is honest at ORB level (not just module level): only each stale module's
  // named omitted specialists + its synthesis are queued — staging carries every sibling/downstream
  // specialist forward untouched, so queuing the whole module would leave those carried orbs looking stuck
  // "queued" forever with no agent events ever arriving for them (Codex #358 r3673980749).
  prepareScopedRerun: async () => {
    const selection = captureLaunchSelection(get())
    if (!selection || get().scopedRerunPending) return false
    if (selection.swarm !== 'research') {
      get().setToast({ msg: 'This swarm reruns each affected orb through its normal confirmation.', tone: 'info' })
      return false
    }
    if (!hasExactDecisionBinding(selection)) {
      get().setToast({ msg: 'I can’t safely prepare this scoped re-run — the exact call record is missing. Refresh and try again.', tone: 'bad' })
      return false
    }
    if (get().staticMode) {
      get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
      return false
    }
    if (isLaunchHealthBlocked(get().health)) {
      get().setToast({ msg: 'Engine updating — scoped re-runs resume when it finishes.', tone: 'info' })
      return false
    }
    set({ scopedRerunPending: true })
    try {
      await verifyScopedRerunCapability(get, selection)
      return true
    } catch (e: any) {
      get().setToast({ msg: e?.message || 'Could not verify this scoped re-run. Nothing was launched.', tone: 'bad' })
      return false
    } finally {
      set({ scopedRerunPending: false })
    }
  },

  runScopedRerun: async () => {
    const selection = captureLaunchSelection(get())
    if (!selection || get().scopedRerunPending) return
    if (selection.swarm !== 'research') {
      get().setToast({ msg: 'This swarm reruns each affected orb through its normal confirmation.', tone: 'info' })
      return
    }
    // A scoped pass is still a paid mutation of ONE completed call. Never let a bare ticker resolve to
    // whatever call happens to be newest by the time the POST reaches the server.
    if (!hasExactDecisionBinding(selection)) {
      get().setToast({ msg: 'I can’t safely start this scoped re-run — the exact call record is missing. Refresh and try again.', tone: 'bad' })
      return
    }
    const t = selection.subject
    if (get().staticMode) { get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' }); return }
    if (isLaunchHealthBlocked(get().health)) { get().setToast({ msg: 'Engine updating — the scoped re-run was not started.', tone: 'info' }); return }
    // Captured BEFORE the request: if the user switches tickers while this is in flight, `nodesByKey` and
    // `beginRun` (which reads `selectedTicker` itself) would both resolve against the NEW ticker — silently
    // registering and rendering ticker A's scoped run as ticker B's (Codex #358 r3673980759).
    const token = selection.selectToken
    set({ scopedRerunPending: true })
    try {
      // During deploy skew an old server would strip runRoot/fingerprint from the legacy scoped body and
      // spend against whatever plan was current. Ask the same versioned estimate boundary used by one-orb
      // reruns first; only its exact identity echo unlocks the versioned POST.
      const planOrigin = await verifyScopedRerunCapability(get, selection)
      const out = await api.runIntakePlan(
        t,
        selection.swarm,
        selection.runRoot,
        selection.decisionFingerprint,
        planOrigin,
        selection,
      )
      requireLaunchProviderReceipt(out, selection, get().providers.catalogState)
      revealAcceptedTrackedLaunch(set, get)
      const { runId, staleModules, carried, scoped, chained } = out
      if (chained) set({ chainTickers: new Set(get().chainTickers).add(runSubjectKey('research', t)) })
      if (!launchSelectionIsCurrent(get(), selection)) {
        // Selection moved on — attach the run in the background (mirrors resumeRun's "not onScreen" path)
        // instead of mutating whatever ticker is now selected with A's run info.
        if (runId) { connectRun(get, runId); void get().refreshActiveRuns() }
        get().setToast({ msg: `Scoped re-run started on ${t} — running in the background.`, tone: 'good' })
        return
      }
      const nodes = [...get().nodesByKey.values()]
      const staleSet = new Set(staleModules ?? [])
      const carriedSet = new Set((carried ?? []).map((c) => c.module))
      // Map each specialist orb's output filename (`${nn}_${slug}.md`, roster.ts's outputRel convention) to
      // its node key, scoped by module, so `scoped[].omittedOrbs` (server-side filenames) can be translated
      // into the exact keys to queue.
      const fileToKey = new Map<string, string>()
      for (const n of nodes) if (!n.isSynthesis) fileToKey.set(`${n.module}::${n.nn}_${n.slug}.md`, n.key)
      const scopedByModule = new Map((scoped ?? []).map((s) => [s.module, s]))
      const plannedKeys: string[] = []
      for (const m of staleSet) {
        const s = scopedByModule.get(m)
        if (s) {
          for (const f of s.omittedOrbs ?? []) {
            const k = fileToKey.get(`${m}::${f}`)
            if (k) plannedKeys.push(k)
          }
        } else {
          // Defensive fallback only: a stale module the server could not stage with holes (never finished
          // anywhere) runs WHOLE — queue every one of its orbs rather than silently under-report it.
          for (const n of nodes) if (n.module === m && !n.isSynthesis) plannedKeys.push(n.key)
        }
        const synth = nodes.find((n) => n.isSynthesis && n.module === m)
        if (synth) plannedKeys.push(synth.key)
      }
      const plannedSet = new Set(plannedKeys)
      // Everything else in a stale module (the carried specialists) — or a wholly-carried module — is
      // already done, not "queued": it never runs again, so it must not sit on screen looking stuck.
      const doneKeys = nodes.filter((n) => carriedSet.has(n.module) || (staleSet.has(n.module) && !plannedSet.has(n.key))).map((n) => n.key)
      if (runId) {
        beginRun(set, get, runId, { subject: selection.subject, swarmId: selection.swarm, execution: selection, kind: 'full', willCommitToMain: true }, plannedKeys, doneKeys)
      } else {
        void get().refreshActiveRuns()
      }
      get().setToast({ msg: 'Scoped re-run started — one pass, one final thesis.', tone: 'good' })
    } catch (e: any) {
      // the route's honest codes (no_plan / plan_stale / plan_widened / run_incomplete / already_complete /
      // subject_busy / CLAUDE_CLI_MISSING) surface verbatim — never a silent fallback to a bigger run
      get().setToast({ msg: e?.body?.error || e?.message || 'Could not start the scoped re-run.', tone: 'bad' })
    } finally {
      set({ scopedRerunPending: false })
    }
  },

  completeThesis: async () => {
    const plan = get().thesisPlan
    const t = get().selectedTicker
    if (!plan || !t) return
    // Research-only, matched positively (a missing/unknown swarm must never read as permitted).
    if (plan.swarm !== 'research') return get().setToast({ msg: `Completing a ${plan.swarm} dossier from here isn’t supported yet.`, tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = get().thesisPlanExecution
    if (!execution || execution.provider !== provider) return get().setToast({ msg: 'This plan was priced for a different execution profile. Reopen it before launching.', tone: 'bad' })

    if (plan.continuationReceipt?.action === 'complete'
        && plan.continuationReceipt.sourceRunRoots.length > 0) {
      return get().setToast({
        msg: 'Pick Complete old run to continue one exact saved run, or choose Run full. Nothing was started.',
        tone: 'info',
      })
    }

    // Nothing to reuse ⇒ this IS a full run: same orbs, same price, same commits pushed to main. Hand it to
    // the normal full-run confirm dialog, which asks the user to type the ticker and shows the plan-usage row.
    // A cheaper run earns the one-click path; a full one does not, whichever modal you happen to be standing in.
    if (plan.reuse.length === 0) {
      set({ thesisPlanOpen: false, thesisPlanExecution: null })
      await get().requestFull()
      return
    }

    set({ launchPending: { key: 'complete-thesis', label: `Completing ${t}…`, ticker: t } })
    try {
      // The panel can sit open for a while before the click. A module the user never touched — reused only
      // because it was `done` by DEFAULT, not because they clicked "Keep" on a stale row — can go `stale` in
      // that window if new data lands. The request to the server carries only a bare module-name list, so the
      // server cannot tell "explicitly kept despite staleness" apart from "was fresh a while ago and never
      // reconsidered" (that distinction only exists here, in what the user actually saw and clicked). Re-check
      // fresh, from disk, immediately before submitting, and abort rather than silently carry evidence the
      // user never agreed to keep past its shelf life.
      const fresh = await api.thesisPlan(t, execution, plan.swarm, plan.reuse)
      requireLaunchProviderReceipt(fresh.preflight, execution, get().providers.catalogState, false)
      requireLaunchProviderReceipt(fresh.fullPreflight, execution, get().providers.catalogState, false)
      const turnedStale = plan.reuse.filter((m) => {
        const was = plan.modules.find((x) => x.module === m)
        const now = fresh.modules.find((x) => x.module === m)
        return was?.state === 'done' && now?.state === 'stale'
      })
      if (turnedStale.length > 0) {
        set({ thesisPlan: fresh, launchPending: null })
        const names = turnedStale.map((m) => moduleLabel(m)).join(', ')
        get().setToast({ msg: `New data landed while this was open — ${names} ${turnedStale.length === 1 ? 'is' : 'are'} now stale. Review the plan again.`, tone: 'info' })
        return
      }

      if (fresh.continuationReceipt?.version !== 2 || fresh.continuationReceipt.action !== 'complete') {
        throw new Error('The completion receipt is unavailable. Refresh before trying again; nothing was started.')
      }
      const out = await api.runThesisPlan(
        t, plan.reuse, plan.swarm, execution, crypto.randomUUID(), fresh.continuationReceipt,
      )
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      revealAcceptedTrackedLaunch(set, get)
      const { runId, chained, carried, willRun } = out
      if (chained) set({ chainTickers: new Set(get().chainTickers).add(runSubjectKey(plan.swarm, t)) })

      // Light up ONLY the modules that will actually run; show the reused ones as done (green), never as
      // "starting" — the client lying about that is the exact scare this feature exists to remove.
      const nodes = [...get().nodesByKey.values()]
      const runSet = new Set(willRun)
      const reuseSet = new Set(plan.reuse)
      const plannedKeys = nodes.filter((n) => runSet.has(n.module)).map((n) => n.key)
      const doneKeys = nodes.filter((n) => reuseSet.has(n.module)).map((n) => n.key)

      set({ thesisPlanOpen: false, thesisPlanExecution: null, launchPending: null })
      if (runId) {
        beginRun(set, get, runId, { subject: t, swarmId: plan.swarm, execution, kind: 'full', willCommitToMain: true }, plannedKeys, doneKeys)
      } else {
        // runId === '' — every module was already on disk, so the engine launched the master synthesizer
        // directly under its OWN runId (adopted via refreshActiveRuns). NEVER open a stream to an empty id or
        // write a phantom activeRuns[''] card that never terminates and blocks "Run full" until reload.
        const rt = { ...get().nodeRuntime }
        for (const k of doneKeys) rt[k] = { status: 'done' }
        set({ nodeRuntime: rt })
        void get().refreshActiveRuns()
      }

      const carriedNote = carried.length ? ` · reused ${carried.length} finished module${carried.length === 1 ? '' : 's'}` : ''
      get().setToast({ msg: willRun.length ? `Completing the thesis — running ${willRun.length} module${willRun.length === 1 ? '' : 's'} + the memo${carriedNote}` : `Writing the memo${carriedNote}`, tone: 'good' })
    } catch (e: any) {
      set({ launchPending: null })
      // api.post() throws `Object.assign(new Error(msg), { status, body })` — the discriminated code the
      // server sends lives at e.body.code, NOT e.code. Reading e.code silently never matched.
      const code = e?.body?.code
      if (code === 'already_complete') {
        // Someone else's run (or a chained run) finished this thesis while the panel was open. Don't error —
        // the user asked for the thesis, and it now exists: give them it.
        set({ thesisPlanOpen: false, thesisPlanExecution: null })
        get().setToast({ msg: 'This run already has a final thesis — opening it.', tone: 'info' })
        void get().openThesis()
        return
      }
      set({ thesisPlanError: e?.message || 'Could not start the completion run' })
    }
  },

  // The RUN pill on a Run row: launch ONE module now, resuming from the orbs already on disk. Unlike
  // `completeThesis`, a stale module here is NOT an abort — the server runs it clean and says so (decision
  // #2), so the client just reflects the done/planned split the server returns.
  resumeThesisModule: async (module) => {
    const plan = get().thesisPlan
    const t = get().selectedTicker
    if (!plan || !t) return
    if (plan.swarm !== 'research') return get().setToast({ msg: `Running a single module of a ${plan.swarm} dossier from here isn’t supported yet.`, tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = get().thesisPlanExecution
    if (!execution || execution.provider !== provider) return get().setToast({ msg: 'This plan was priced for a different execution profile. Reopen it before launching.', tone: 'bad' })
    const selection = captureLaunchSelection(get())
    if (!selection || selection.provider !== execution.provider
        || selection.expectedProfileKey !== execution.expectedProfileKey
        || selection.model !== execution.model
        || selection.reasoningLevel !== execution.reasoningLevel
        || JSON.stringify(selection.executionProfile) !== JSON.stringify(execution.executionProfile)) {
      return get().setToast({ msg: 'This plan was priced for a different execution profile. Reopen it before launching.', tone: 'bad' })
    }
    await runPlannedResearchModule(set, get, module, plan, `complete-module:${module}`, true, selection)
  },

  // open one of the three run tiers (memo / thesis / dossier) by resolving its file under the run root.
  // routes through OutputReader -> api.output, so it works in both live and static modes.
  openReport: async (tier) => {
    const t = get().selectedTicker
    const runRoot = get().runRoot
    if (!t || !runRoot) return get().setToast({ msg: 'No run output yet', tone: 'info' })
    const file = tier === 'memo' ? 'memo.md' : tier === 'dossier' ? 'audit_dossier.md' : 'final_thesis.md'
    const title = tier === 'memo' ? `Memo — ${t}` : tier === 'dossier' ? `Full Dossier — ${t}` : `Investment Thesis — ${t}`
    set({ openOutput: { path: `${runRoot}/${file}`, title, verdict: get().decision?.decision ?? null, nodeKey: 'master/synthesizer' } })
  },

  // open one of a module's three tiers (synthesis / memo / dossier). The path comes straight from the
  // manifest's moduleReports (already run-root-relative), so this works in both live and static modes.
  // nodeKey points at the module synthesis so the reader has a valid prompt + Re-run target.
  openModuleReport: (module, tier) => {
    const path = get().moduleReports[module]?.[tier]
    if (!path) return get().setToast({ msg: 'That document was not generated', tone: 'info' })
    const titleTier = tier === 'memo' ? 'Memo' : tier === 'dossier' ? 'Dossier' : 'Synthesis'
    const name = module.replace(/-/g, ' ')
    set({ openOutput: { path, title: `${name} — ${titleTier}`, verdict: null, nodeKey: `${module}/99_${module}-synthesis` } })
  },

  closeOutput: () => set({ openOutput: null, selectedNodeKey: null }),

  // ---- chat with your data ----
  // which scopes are present (chat-able) vs not-yet-run — derived LIVE from the store, so the picker
  // updates the instant an orb/module finishes over the run SSE (no extra fetch needed).
  chatScopesAvailable: () => {
    const s = get()
    // the flow stage (screener) chats the SELECTED signal's run — its scopes come from the screener graph
    // + per-orb runtime (scGraph/scNodesByKey/scRuntime), not the constellation slices. A module is
    // chat-able once its 99_*-synthesis orb finished; the whole-run scope opens on any finished synthesis.
    if (isFlowActive(s)) {
      const nodes = [...s.scNodesByKey.values()]
      const orbs = nodes.map((n) => {
        const rt = s.scRuntime[n.key]
        return { key: n.key, module: n.module, path: rt?.outputPath, title: n.name, present: rt?.status === 'done' && !!rt?.outputPath }
      })
      const synthDone = (module: string) => nodes.some((n) => n.module === module && n.isSynthesis && s.scRuntime[n.key]?.status === 'done' && !!s.scRuntime[n.key]?.outputPath)
      const modules = (s.scGraph?.modules ?? []).map((m) => ({ module: m.name, present: synthDone(m.name) }))
      return { run: modules.some((m) => m.present), modules, orbs }
    }
    const { reports, moduleReports, nodeRuntime, nodesByKey, graph } = s
    const anySynth = Object.values(moduleReports).some((r) => !!r?.synthesis)
    const modules = (graph?.modules ?? []).map((m) => ({ module: m.name, present: !!moduleReports[m.name]?.synthesis }))
    const orbs = [...nodesByKey.values()].map((n) => {
      const rt = nodeRuntime[n.key]
      return { key: n.key, module: n.module, path: rt?.outputPath, title: n.name, present: rt?.status === 'done' && !!rt?.outputPath }
    })
    return { run: reports.thesis || anySynth, modules, orbs }
  },
  openChat: (scope, opts) => {
    const t = chatSubjectOf(get())
    if (!t) { get().setToast({ msg: isFlowActive(get()) ? 'Open a signal first' : 'Select a company first', tone: 'info' }); return }
    // Ask has one visible entry point. A selected run opens the unified drawer; its Auto router can include
    // saved news and earlier chats without making the user choose a second Ask path first.
    if (get().newsChatOpen || get().newsChatStreaming) get().closeNewsChat()
    chatResumeSeq++
    // Re-addressing the open panel keeps its thread. An explicit Close followed by Ask starts fresh; the
    // completed prior thread remains available in History (the documented close contract).
    const sameScope = get().chatOpen && get().chatScope === scope && get().chatModule === opts?.module && get().chatOrbKey === opts?.orbKey
    const rollback = chatPendingBaseline
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null
    set({
      chatHistoryOpen: false, chatOpen: true, chatScope: scope,
      chatModule: opts?.module, chatOrbPath: opts?.orbPath, chatOrbKey: opts?.orbKey,
      chatTitle: defaultChatTitle(scope, t, opts),
      chatError: undefined, chatRetryText: undefined, chatRetryTurnId: undefined, chatStreaming: false, chatWork: null,
      // a different scope starts a fresh thread AND a fresh saved conversation; reopening the same scope keeps both
      ...(sameScope
        ? (rollback ? { chatMessages: rollback.messages, chatConversationId: rollback.conversationId, chatSource: rollback.source, chatMemory: rollback.memory } : {})
        : { chatMessages: [], chatConversationId: undefined, chatSource: undefined, chatAnswerRunRoot: undefined, chatMemory: undefined }),
    })
  },
  closeChat: () => {
    const rollback = chatPendingBaseline
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null
    set({
      chatOpen: false, chatStreaming: false, chatWork: null, chatRetryText: undefined, chatRetryTurnId: undefined,
      ...(rollback ? { chatMessages: rollback.messages, chatConversationId: rollback.conversationId, chatSource: rollback.source, chatMemory: rollback.memory } : {}),
    })
  },
  setChatScope: (scope, opts) => {
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null
    set({
      chatScope: scope, chatModule: opts?.module, chatOrbPath: opts?.orbPath, chatOrbKey: opts?.orbKey, chatAnswerRunRoot: undefined,
      chatMessages: [], chatStreaming: false, chatWork: null, chatError: undefined, chatRetryText: undefined, chatRetryTurnId: undefined, chatSource: undefined, chatConversationId: undefined, chatMemory: undefined,
      chatTitle: defaultChatTitle(scope, chatSubjectOf(get()) || '', opts),
    })
  },
  setChatModel: (m) => { saveChatModel(m); set({ chatModel: m }) },
  setChatStyle: (s) => { try { localStorage.setItem(CHAT_STYLE_KEY, s) } catch { /* blocked storage */ } set({ chatStyle: s }) },
  setChatMemoryMode: (mode) => set({ chatMemoryMode: mode }),
  // Clear starts a NEW conversation (fresh saved thread); the prior one stays in history — nothing is lost.
  clearChat: () => { chatPendingBaseline = null; chatAbort?.abort(); chatAbort = null; set({ chatMessages: [], chatError: undefined, chatRetryText: undefined, chatRetryTurnId: undefined, chatStreaming: false, chatWork: null, chatSource: undefined, chatConversationId: undefined, chatAnswerRunRoot: undefined, chatMemory: undefined }) },

  // ---- saved chat history (persisted Ask conversations) ----
  openChatHistory: () => {
    chatResumeSeq++
    if (get().newsChatOpen || get().newsChatStreaming) get().closeNewsChat()
    set({ chatHistoryOpen: true })
  },
  closeChatHistory: () => { chatResumeSeq++; set({ chatHistoryOpen: false }) },
  // Reopen a saved conversation and keep chatting: fetch its transcript, make sure the right swarm +
  // company are selected (so the closed-book context resolves against the same run), then load the thread
  // and its saved conversation id into the panel. The next turn appends to the SAME saved conversation.
  resumeConversation: async (id) => {
    if (get().staticMode) { get().setToast({ msg: 'Chat history lives on the live engine (npm run dev)', tone: 'info' }); return }
    const resumeSeq = ++chatResumeSeq
    const navAtStart = {
      activeSwarm: get().activeSwarm,
      selectToken: get().selectToken,
      selectedTicker: get().selectedTicker,
      selectedSignal: get().scSelectedSignal,
    }
    // stop any in-flight turn FIRST — otherwise its streaming callback keeps writing tokens into the thread
    // we're about to replace (the same-swarm/same-ticker path below runs neither the swarm switch nor
    // selectTicker, so nothing else would abort it).
    const rollback = chatPendingBaseline
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null
    if (rollback) set({ chatMessages: rollback.messages, chatConversationId: rollback.conversationId, chatSource: rollback.source, chatMemory: rollback.memory, chatStreaming: false, chatWork: null })
    const c = await api.getChat(id).catch(() => null)
    if (resumeSeq !== chatResumeSeq) return
    if (get().activeSwarm !== navAtStart.activeSwarm || get().selectToken !== navAtStart.selectToken || get().selectedTicker !== navAtStart.selectedTicker || get().scSelectedSignal !== navAtStart.selectedSignal) return
    if (!c) { get().setToast({ msg: 'Could not open that conversation', tone: 'info' }); return }
    // History is now the winning navigation. Cancel even a same-swarm collapse that was already scheduled;
    // otherwise its old timer can fire after this await and replace the conversation we just resumed.
    if (warpTimer) { clearTimeout(warpTimer); warpTimer = null }
    if (get().warp) set({ warp: null })
    const targetSwarm = c.swarm || 'research'
    // A different swarm is a deliberate jump — switch directly (no animated warp), mirroring switchSwarm's
    // reduced-motion reset so no panel or in-flight warp is left dangling over the new view.
    if (get().activeSwarm !== targetSwarm) {
      if (!get().swarms.some((s) => s.id === targetSwarm)) { get().setToast({ msg: `The ${targetSwarm} view isn’t available here`, tone: 'info' }); return }
      if (get().newsChatOpen || get().newsChatStreaming) get().closeNewsChat()
      set({ activeSwarm: targetSwarm, warp: null, openOutput: null, selectedNodeKey: null, signalIntakeOpen: false, pipelineOpen: false, scThesisDetail: null, scSelectedEvent: null, scFocusedCompany: null, newsFeedOpen: false, ideasOpen: false, diagnosticsOpen: false, ...CHAT_RESET })
      get()._enterSwarm(targetSwarm)
    } else if (get().newsChatOpen || get().newsChatStreaming) {
      get().closeNewsChat()
    }
    // Saved-wire conversations share the same History drawer but do not belong to a signal run. Reopen the
    // durable news drawer directly; never feed the synthetic NEWS subject into scSelectSignal.
    if (c.scope === 'wire') {
      const messages = Array.isArray(c.messages) ? c.messages : []
      let lastAssistantIndex = -1
      for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === 'assistant') { lastAssistantIndex = i; break }
      const assistant = lastAssistantIndex >= 0 ? messages[lastAssistantIndex] : undefined
      const question = lastAssistantIndex > 0 ? messages.slice(0, lastAssistantIndex).reverse().find((message) => message.role === 'user') : undefined
      const memory = assistant?.memory?.kind === 'news-wire' ? assistant.memory : undefined
      const window = memory?.window || (c.style?.startsWith('news:') ? c.style.slice(5) : '')
      const newsWindow: NewsChatWindow = window === '7d' || window === 'history' ? window : '24h'
      set({
        chatHistoryOpen: false,
        chatOpen: false,
        newsChatOpen: true,
        chatModel: c.model || get().chatModel,
        newsChatWindow: newsWindow,
        newsChatMessages: messages.map((message) => ({ role: message.role, content: message.content, turnId: message.turnId, memory: message.memory })),
        newsChatConversationId: c.id,
        newsChatStreaming: false,
        newsChatError: undefined,
        newsChatRetryText: undefined,
        newsChatRetryTurnId: undefined,
        newsChatReceipt: memory?.receipt,
        newsChatEvidence: Array.isArray(memory?.evidence) ? memory.evidence : [],
        newsChatCompletedTurn: memory && assistant && question
          ? { question: question.content, answer: assistant.content, receipt: memory.receipt, evidence: Array.isArray(memory.evidence) ? memory.evidence : [] }
          : undefined,
      })
      return
    }
    // select the subject if we're not already on it (loads its graph/manifest). A flow swarm (screener)
    // reopens the SIGNAL run; a constellation swarm reopens the company/commodity run (selectTicker applies
    // its own CHAT_RESET). Either way the server re-resolves the run from (swarm, subject).
    if (isFlowActive(get())) {
      if (get().scSelectedSignal !== c.subject) {
        await get().scSelectSignal(c.subject)
        if (resumeSeq !== chatResumeSeq || get().scSelectedSignal !== c.subject) return
      }
    } else if (get().selectedTicker !== c.subject) {
      await get().selectTicker(c.subject)
      if (resumeSeq !== chatResumeSeq || get().selectedTicker !== c.subject) return
    }
    // Decide which run to answer this resumed conversation from, and keep the thread chat-able. Prefer the
    // CURRENT run when it can still serve the conversation's scope (so "continue" chats the latest output);
    // otherwise fall back to the run the conversation was originally answered from (c.runRoot) — analyses/
    // runs are committed, so those files are still on disk. Either way a saved conversation is never gated as
    // "not produced" just because a newer run replaced it or one is mid-flight (the old failure: a stale orb
    // path was re-checked against the current run's manifest and rejected by both the panel and the server).
    // Research only: only its chat route honours an explicit older runRoot — a constellation swarm resolves
    // the run from the subject, so the override can't reach it; leave those on today's behaviour.
    const cur = get()
    const research = cur.activeSwarm === 'research'
    let orbPath = c.orbPath
    let answerRunRoot: string | undefined // undefined ⇒ answer from the live current run
    if (c.scope === 'orb') {
      const rt = c.orbKey ? cur.nodeRuntime[c.orbKey] : undefined
      if (rt?.status === 'done' && rt.outputPath) orbPath = rt.outputPath // latest output of this orb, current run
      else if (research && c.orbPath) {
        // current run can't serve it → answer from the run this orb was originally answered from: c.runRoot
        // when stored (#170+), else derived from the saved path (analyses/<TICKER>_<DATE>/<module>/<file>.md),
        // so even a pre-#170 orb conversation with no stored runRoot still reopens.
        const orig = c.runRoot || c.orbPath.match(/^(analyses\/[^/]+)\//)?.[1]
        if (orig) { orbPath = c.orbPath; answerRunRoot = orig }
      }
    } else if (c.scope === 'module') {
      if (research && !cur.moduleReports[c.module || '']?.synthesis && c.runRoot) answerRunRoot = c.runRoot
    } else { // whole run
      const hereServesRun = cur.reports.thesis || Object.values(cur.moduleReports).some((r) => !!r?.synthesis)
      if (research && !hereServesRun && c.runRoot) answerRunRoot = c.runRoot
    }
    const messages = Array.isArray(c.messages) ? c.messages : []
    const lastAssistantMemory = [...messages].reverse().find((message) => message.role === 'assistant')?.memory
    set({
      chatHistoryOpen: false,
      chatOpen: true,
      chatScope: c.scope,
      chatModule: c.module,
      chatOrbPath: orbPath,
      chatOrbKey: c.orbKey,
      chatAnswerRunRoot: answerRunRoot,
      chatTitle: c.title || defaultChatTitle(c.scope, c.subject, { module: c.module }),
      chatMessages: messages.map((m) => ({ role: m.role, content: m.content, turnId: m.turnId, thinking: m.thinking, computed: m.computed, memory: m.memory })),
      chatConversationId: c.id,
      chatModel: c.model || get().chatModel,
      chatStyle: (c.style as ChatStyle) || get().chatStyle,
      chatStreaming: false,
      chatWork: null,
      chatError: undefined,
      chatRetryText: undefined,
      chatRetryTurnId: undefined,
      chatSource: undefined,
      chatMemory: lastAssistantMemory?.kind === 'news-wire' ? undefined : lastAssistantMemory as AskMemoryMeta | undefined,
    })
  },
  // Start a brand-new Ask conversation about the selected company — used by the History panel's "New chat"
  // button and its empty-state CTA. Always a fresh thread on the whole-run scope: closes History, opens Ask.
  startNewChat: () => {
    const t = chatSubjectOf(get())
    if (!t) { get().setToast({ msg: isFlowActive(get()) ? 'Open a signal first' : 'Select a company first', tone: 'info' }); return }
    chatResumeSeq++
    if (get().newsChatOpen || get().newsChatStreaming) get().closeNewsChat()
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null
    set({
      chatHistoryOpen: false, chatOpen: true, chatScope: 'run',
      chatModule: undefined, chatOrbPath: undefined, chatOrbKey: undefined, chatAnswerRunRoot: undefined,
      chatTitle: defaultChatTitle('run', t), chatMessages: [], chatConversationId: undefined,
      chatError: undefined, chatRetryText: undefined, chatRetryTurnId: undefined, chatSource: undefined, chatMemory: undefined, chatStreaming: false, chatWork: null,
    })
  },
  deleteConversation: async (id) => {
    if (get().staticMode) return false
    try {
      const result = await api.deleteChat(id)
      if (!result.deleted) { get().setToast({ msg: 'Could not delete that conversation', tone: 'info' }); return false }
    } catch { get().setToast({ msg: 'Could not delete that conversation', tone: 'info' }); return false }
    // if the deleted one is the thread currently open, detach so the next turn starts a fresh saved conversation
    if (get().chatConversationId === id) set({ chatConversationId: undefined })
    if (get().newsChatConversationId === id) set({ newsChatConversationId: undefined })
    return true
  },
  sendChatMessage: async (text, retryTurnId) => {
    const q = text.trim()
    if (!q || get().chatStreaming) return
    if (get().staticMode) { set({ chatError: 'static-deploy' }); return }
    const subject = chatSubjectOf(get())
    if (!subject) return
    const turnId = retryTurnId || newChatTurnId()
    const baseline = get().chatMessages
    chatPendingBaseline = { messages: baseline, conversationId: get().chatConversationId, source: get().chatSource, memory: get().chatMemory }
    // optimistic: append the user turn + an empty assistant turn we grow token-by-token. chatWork starts
    // at 'sending' NOW (the one stage the client itself knows to be true) and then follows the server's
    // streamed real stages — never a guessed progress state.
    const t0 = Date.now()
    set({ chatMessages: [...baseline, { role: 'user', content: q, turnId }, { role: 'assistant', content: '', turnId }], chatStreaming: true, chatWork: { stage: 'sending', startedAt: t0, stageAt: t0 }, chatError: undefined, chatRetryText: undefined, chatRetryTurnId: undefined, chatSource: undefined, chatMemory: undefined })
    const idx = baseline.length + 1 // index of the assistant turn we mutate
    // advance the live working state, preserving the turn's start time (the panel's stopwatch) + the model
    // id once known. Positively matches known stages only (deploy skew — DESIGN.md §5).
    const advance = (stage: ChatWork['stage'], model?: string) => {
      const w = get().chatWork
      set({ chatWork: { stage, model: model ?? w?.model, startedAt: w?.startedAt ?? t0, stageAt: Date.now() } })
    }
    chatAbort?.abort()
    const controller = new AbortController()
    chatAbort = controller
    const sw = get().activeSwarm
    const isResearch = sw === 'research'
    await api.chatStream(
      {
        // Research answers from an explicit run root (chatAnswerRunRoot lets a resumed conversation the current
        // run can't serve fall back to its original committed run). A non-research swarm (commodity/screener)
        // resolves the run folder server-side from (swarm, subject) — so it sends NO ticker/runRoot (a screener
        // SIG id would fail the server's ticker regex), only swarm + subject.
        scope: get().chatScope,
        ...(isResearch
          ? { ticker: subject, runRoot: get().chatAnswerRunRoot ?? get().runRoot ?? undefined }
          : { swarm: sw, subject }),
        module: get().chatModule, orbPath: get().chatOrbPath, orbKey: get().chatOrbKey, model: get().chatModel, style: get().chatStyle,
        memoryMode: get().chatMemoryMode,
        // chat-history persistence: attach to the saved conversation (server mints its id on the first turn)
        conversationId: get().chatConversationId, turnId, title: get().chatTitle,
        // Only the most-recent CHAT_MAX_SEND turns go to the model — the server rejects a transcript over that
        // (ChatBody caps it), so a long or resumed thread (the full history is kept in chatMessages + on disk)
        // must be windowed here or "continue chatting" would 400 once it grows past the cap.
        messages: [...baseline, { role: 'user' as const, content: q, turnId }].slice(-CHAT_MAX_SEND),
      },
      {
        signal: controller.signal,
        // capture the server-minted conversation id so later turns append to the same saved thread.
        // meta arriving = the server assembled the closed-book context — a real stage transition.
        onMeta: (m) => { if (chatAbort !== controller || controller.signal.aborted) return; set({ chatSource: m.sourcePath, chatMemory: m.memory, ...(m.conversationId ? { chatConversationId: m.conversationId } : {}) }); advance('context') },
        // real lifecycle stages streamed by the server (starting → connected → thinking → writing);
        // an unknown/future stage is ignored rather than mis-rendered.
        onStatus: (st) => {
          if (chatAbort !== controller || controller.signal.aborted) return
          if (st.stage === 'modeling' || st.stage === 'starting' || st.stage === 'connected' || st.stage === 'thinking' || st.stage === 'writing') advance(st.stage, st.model)
        },
        // the model's own reasoning, streamed verbatim — grows the assistant turn's thinking text live
        onThinking: (tok) => {
          if (chatAbort !== controller || controller.signal.aborted) return
          const msgs = get().chatMessages.slice()
          if (msgs[idx]?.role === 'assistant') { msgs[idx] = { ...msgs[idx], thinking: (msgs[idx].thinking || '') + tok }; set({ chatMessages: msgs }) }
        },
        // deterministic what-if card(s) the engine computed for this turn — APPENDED (a joint ask streams one
        // card per variable). The numbers are the engine's; the streamed text narrates around them.
        onComputed: (c) => {
          if (chatAbort !== controller || controller.signal.aborted) return
          const msgs = get().chatMessages.slice()
          if (msgs[idx]?.role === 'assistant') { msgs[idx] = { ...msgs[idx], computed: [...(msgs[idx].computed || []), c] }; set({ chatMessages: msgs }) }
        },
        // If the terminal SSE frame was lost after the durable commit, the API reconciles by turn id and
        // returns the canonical saved answer. Replace partial text exactly; do not append and duplicate it.
        onRecovered: (turn) => {
          if (chatAbort !== controller || controller.signal.aborted) return
          const msgs = get().chatMessages.slice()
          if (msgs[idx]?.role === 'assistant') {
            msgs[idx] = { ...msgs[idx], content: turn.answer, thinking: turn.thinking, computed: turn.computed }
            set({ chatMessages: msgs, chatConversationId: turn.conversationId, chatSource: turn.sourcePath, chatMemory: turn.memory?.kind === 'news-wire' ? undefined : turn.memory })
          }
        },
        onToken: (tok) => {
          // first answer token also flips the stage to 'writing' — covers a stream whose text arrives
          // without a preceding chat-status (an older engine during deploy skew).
          if (chatAbort !== controller || controller.signal.aborted) return
          if (get().chatWork?.stage !== 'writing') advance('writing')
          const msgs = get().chatMessages.slice()
          if (msgs[idx]?.role === 'assistant') { msgs[idx] = { ...msgs[idx], content: msgs[idx].content + tok }; set({ chatMessages: msgs }) }
        },
        onDone: () => {
          if (chatAbort !== controller || controller.signal.aborted) return
          chatAbort = null
          chatPendingBaseline = null
          set({ chatStreaming: false, chatWork: null, chatRetryText: undefined, chatRetryTurnId: undefined })
        },
        onError: (msg) => {
          if (chatAbort !== controller || controller.signal.aborted) return
          chatAbort = null
          const rollback = chatPendingBaseline
          chatPendingBaseline = null
          // A turn enters durable History only with a completed assistant answer. Mirror that contract in
          // the drawer for model and transport failures: restore the last committed transcript, but retain
          // the exact question separately so Retry remains one click.
          set({
            chatMessages: rollback?.messages ?? baseline,
            chatConversationId: rollback?.conversationId,
            chatSource: rollback?.source,
            chatMemory: rollback?.memory,
            chatStreaming: false,
            chatWork: null,
            chatError: msg,
            chatRetryText: q,
            chatRetryTurnId: turnId,
          })
        },
      },
    )
  },

  openActivity: () => set({ activityOpen: true }),
  closeActivity: () => set({ activityOpen: false }),
  openCockpitFeedback: () => set({ cockpitFeedbackOpen: true }),
  closeCockpitFeedback: () => set({ cockpitFeedbackOpen: false }),
  openDataPipeline: (needId?: string) => set({ dataPipelineOpen: true, dataPipelineFocusNeed: needId ?? null }),
  closeDataPipeline: () => set({ dataPipelineOpen: false, dataPipelineFocusNeed: null }),
  openScoring: () => set({ scoringOpen: true }),
  closeScoring: () => set({ scoringOpen: false }),
  openValuationPlayground: () => set({ valuationPlaygroundOpen: true }),
  closeValuationPlayground: () => set({ valuationPlaygroundOpen: false }),
  openCalls: () => set({ callsOpen: true, memoryOpen: false, toolsOpen: false }),
  closeCalls: () => set({ callsOpen: false }),

  // ---- Data Library (cross-swarm overlay; one overlay at a time, the openPipeline idiom) ----
  openDataLibrary: () => {
    set({ dataLibraryOpen: true, memoryOpen: false, toolsOpen: false, newsFeedOpen: false, pipelineOpen: false, callsOpen: false, diagnosticsOpen: false })
    void get().refreshPipelines()
  },
  closeDataLibrary: () => set({ dataLibraryOpen: false, dlSelectedId: null }),
  // Memory is a destination, not a swarm mode. Opening it closes every competing reading surface; the
  // flag itself is intentionally absent from switchSwarm resets so the same view stays open across a jump.
  openMemory: () => {
    // Closing a streaming chat through its own action also aborts the request; merely hiding its boolean
    // would leave a paid/background response running behind Memory.
    if (get().chatOpen || get().chatStreaming) get().closeChat()
    if (get().newsChatOpen || get().newsChatStreaming) get().closeNewsChat()
    set({
      memoryOpen: true,
      toolsOpen: false,
      openOutput: null,
      chatHistoryOpen: false,
      watchComposer: null,
      dataLibraryOpen: false,
      dataPipelineOpen: false,
      newsFeedOpen: false,
      pipelineOpen: false,
      callsOpen: false,
      diagnosticsOpen: false,
      sourcesOpen: false,
      scoringOpen: false,
      valuationPlaygroundOpen: false,
      reviewOpen: false,
      cockpitFeedbackOpen: false,
      signalIntakeOpen: false,
      thesisPlanOpen: false,
      whatChangedOpen: false,
      addCompanyOpen: false,
    })
  },
  closeMemory: () => set({ memoryOpen: false }),
  // Tools follows the same destination semantics as Memory: opening it stops/hides competing reading
  // surfaces, but it is not a swarm mode and therefore stays open across a swarm switch.
  openTools: () => {
    if (get().chatOpen || get().chatStreaming) get().closeChat()
    if (get().newsChatOpen || get().newsChatStreaming) get().closeNewsChat()
    set({
      toolsOpen: true,
      activityOpen: false,
      memoryOpen: false,
      openOutput: null,
      chatHistoryOpen: false,
      watchComposer: null,
      dataLibraryOpen: false,
      dataPipelineOpen: false,
      newsFeedOpen: false,
      pipelineOpen: false,
      callsOpen: false,
      diagnosticsOpen: false,
      sourcesOpen: false,
      scoringOpen: false,
      valuationPlaygroundOpen: false,
      reviewOpen: false,
      cockpitFeedbackOpen: false,
      signalIntakeOpen: false,
      thesisPlanOpen: false,
      whatChangedOpen: false,
      addCompanyOpen: false,
    })
  },
  closeTools: () => set({ toolsOpen: false }),
  setDlSelected: (id) => set({ dlSelectedId: id }),
  setDlFilters: (f) => set({ dlFilters: f }),
  refreshPipelines: async () => {
    if (get().staticMode) return // static showcase: no engine — the Data button stays hidden (§5)
    try {
      const { read } = await api.pipelines()
      set({ pipelines: read, pipelinesError: null })
    } catch (e: any) {
      // old engine mid-deploy (no /api/pipelines yet): feature off, never an error surface (§5)
      if (e?.status === 404) { set({ pipelines: null, pipelinesError: null }); return }
      set({ pipelinesError: e?.message ? String(e.message) : 'could not load the pipelines read' }) // KEEP prior data
    }
  },
  // Open only the published artifact advertised by Calls. OutputReader routes the marker through the
  // narrow Git-backed endpoint, so a dirty local checkout cannot show different bytes from the card.
  openCallFile: (path, title) => set({ openOutput: { path, title, publishedCalls: true } }),
  openInlineDoc: (title, body) => set({ openOutput: { title, body } }),
  openEmbeddedDoc: (title, embedUrl) => set({ openOutput: { title, embedUrl } }),

  // file an ad-hoc outcome review for one call ("update what's happened since now"). Delegates to
  // Phase 3 /research:review-decisions <ticker> ad-hoc via the launch system; the tracker auto-refreshes.
  updateCall: async (ticker) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — updates run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live updates are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ launchPending: { key: `review:${ticker}`, label: `Filing the review for ${ticker}…`, ticker } })
    try {
      const out = await api.launch({ selection: execution, kind: 'review', ticker, window: 'ad-hoc' })
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      revealAcceptedTrackedLaunch(set, get) // flip the card's busy state NOW, not on the next 20s idle poll
      get().setToast({ msg: `Filing an ad-hoc review for ${ticker} — see Activity; the tracker refreshes when it lands`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, ticker, `${ticker} review`)
    } finally {
      set({ launchPending: null })
    }
  },
  // file a specific scheduled (due/overdue) review window — never silently ad-hoc.
  fileDueReview: async (ticker, window) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — updates run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live updates are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ launchPending: { key: `review:${ticker}:${window}`, label: `Filing the ${window} review…`, ticker } })
    try {
      const out = await api.launch({ selection: execution, kind: 'review', ticker, window })
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      revealAcceptedTrackedLaunch(set, get)
      get().setToast({ msg: `Filing the ${window} review for ${ticker} — see Activity`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, ticker, `${ticker} ${window} review`)
    } finally {
      set({ launchPending: null })
    }
  },
  // regenerate the committed markdown/JSON calls dashboard (/research:track). It is cross-ticker and
  // ignores the ticker; the launch validator requires a roster ticker, so pass an ignored placeholder.
  refreshDashboard: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — the dashboard regenerates on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker || get().tickers[0]?.ticker
    if (!t) return get().setToast({ msg: 'No company loaded to run the dashboard from', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    try {
      const out = await api.launch({ selection: execution, kind: 'track', ticker: t })
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      revealAcceptedTrackedLaunch(set, get)
      get().setToast({ msg: 'Rebuilding the calls dashboard — see Activity; it commits when done', tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, t, 'calls dashboard')
    }
  },
  setToast: (t) => {
    set({ toast: t })
    // An actionable toast lingers (you have to read it + reach the button); a plain one auto-clears fast.
    if (t) setTimeout(() => { if (get().toast === t) set({ toast: null }) }, t.action ? 9000 : 3200)
  },

  startHealth: () => {
    if (get().staticMode || healthLoopRunning) return
    healthLoopRunning = true
    if (!healthListenersBound && typeof window !== 'undefined') {
      healthListenersBound = true
      // bring EVERYTHING back to live the instant the visitor's network returns or the tab refocuses —
      // health probe + scanner status + a news-stream reconnect, not just the health probe.
      window.addEventListener('online', () => get().revive())
      window.addEventListener('offline', () => set({ health: 'your-network', connected: false, newsStreamOnline: false }))
      document.addEventListener('visibilitychange', () => { if (!document.hidden) get().revive() })
    }
    pumpHealth(get)
  },

  stopHealth: () => {
    healthLoopRunning = false
    healthGen++
    if (healthTimer) { clearTimeout(healthTimer); healthTimer = null }
    healthAbort?.abort()
    healthAbort = null
  },

  checkHealthNow: async () => {
    if (!healthLoopRunning) return
    pumpHealth(get) // immediate probe + reschedule (gen guard voids the prior in-flight continuation)
  },

  _tickHealth: async () => {
    if (get().staticMode) return
    // the visitor's OWN connection is down — never blame the engine
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      outageStartedAt = 0 // not an engine outage — don't let it seed the grace clock
      set({ health: 'your-network', connected: false })
      return
    }
    healthAbort?.abort()
    const ac = new AbortController()
    healthAbort = ac
    const to = setTimeout(() => ac.abort(), HEALTH_TIMEOUT_MS)
    let outcome: 'ok' | 'engine' | 'session' = 'engine'
    let deploymentPending = false
    let deploymentLag: DeploymentLag | null = null
    try {
      const r = await performanceFetch('/api/health', { cache: 'no-store', headers: { accept: 'application/json' }, signal: ac.signal })
      const ct = r.headers.get('content-type') || ''
      if (r.headers.get('x-engine-status') === 'offline' || r.status >= 520) {
        outcome = 'engine' // the edge Worker / Cloudflare says the origin is down
      } else if (r.ok && ct.includes('application/json')) {
        const j = await r.json().catch(() => null)
        outcome = j && j.ok === true ? 'ok' : 'engine' // {ok:true}=live; {ok:false}=worker offline marker
        deploymentPending = outcome === 'ok' && j?.deploymentPending === true
        const deployment = j?.deployment
        if (outcome === 'ok' && deployment?.status === 'pending'
          && typeof deployment.targetSha === 'string' && /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(deployment.targetSha)
          && (deployment.deployedSha === null || (typeof deployment.deployedSha === 'string'
            && /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(deployment.deployedSha)))
          && Number.isSafeInteger(deployment.pendingSince) && deployment.pendingSince > 0
          && Number.isSafeInteger(deployment.checkedAt) && deployment.checkedAt > 0
          && typeof deployment.reason === 'string') {
          deploymentLag = {
            targetSha: deployment.targetSha,
            deployedSha: deployment.deployedSha,
            pendingSince: deployment.pendingSince,
            checkedAt: deployment.checkedAt,
            reason: deployment.reason,
          }
        }
      } else if (r.status === 401 || r.status === 403 || r.redirected || !ct.includes('application/json')) {
        outcome = 'session' // Access login/redirect (HTML) — an auth issue, not an engine outage
      } else {
        outcome = 'engine'
      }
    } catch {
      outcome = 'engine' // network error / abort / timeout (navigator.onLine was true)
    } finally {
      clearTimeout(to)
      if (healthAbort === ac) healthAbort = null
    }

    if (outcome === 'ok') {
      deploymentAdmissionBlocked = deploymentPending
      const reconnected = get().health !== 'online'
      outageStartedAt = 0 // engine answered — end any grace clock
      // A pending reviewed deploy keeps reads live but closes every paid admission at the server's kernel
      // barrier. Reflect that distinct state in the cockpit instead of claiming "Live" and letting a run
      // button reach a guaranteed 503/profile-refresh race. The next healthy poll returns to online.
      set({ health: deploymentPending ? 'updating' : 'online', deploymentLag, healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
      // Every proven-healthy poll repairs ONLY missing bootstrap pieces. This must not depend on a health
      // transition: /api/swarms can return an auth response while health was already online. The health
      // cadence bounds these attempts, and the underlying calls coalesce.
      if (!deploymentPending) healMissingLiveBootstrap('health', reconnected)
    } else if (outcome === 'session') {
      outageStartedAt = 0 // an Access/session issue, not an engine outage
      clearSwarmDiscoveryRetry() // sign-in recovery owns the next attempt; never hammer Access every 3s
      invalidateScreenerBootstrap()
      // A Themes request belongs to the authenticated screener bootstrap too. Invalidate it explicitly:
      // activeSwarm/wireSwarm do not change on session expiry, so their normal ownership guards alone
      // cannot reject a pre-expiry response. Resetting the view lets the first healthy recovery reopen it.
      themesRequestSeq++
      cancelThemeDetailRequest()
      if (themesGeoRefetchTimer) { clearTimeout(themesGeoRefetchTimer); themesGeoRefetchTimer = null }
      lastStreamBootstrapHealAt = 0 // the first proven-live event after sign-in may heal immediately
      set({
        health: 'session-expired', connected: false,
        themesView: null, themesStatus: 'idle', themesLoading: false, themeBriefLoading: false,
        themeFormationQueue: null, themeCompilerHealth: null,
        selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null,
      })
    } else {
      // The SSE data plane is the ground truth. If a stream event arrived very recently, OR the news
      // stream socket is still OPEN (the server's 15s keep-alive holds it open and the browser would flip
      // readyState on a real drop), the engine is provably up — a slow or failed /api/health probe is a
      // false alarm, so DON'T flap to offline. This is the fix for the red "Engine offline" bar appearing
      // while the wire is plainly still streaming events.
      const wireAlive = Date.now() - lastStreamActivityAt < STREAM_LIVE_MS || newsSource?.readyState === 1
      if (wireAlive) {
        const reconnected = get().health !== 'online'
        outageStartedAt = 0 // the live wire proves the engine is up — end any grace clock
        set({ health: deploymentAdmissionBlocked ? 'updating' : 'online', healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
        if (!deploymentAdmissionBlocked) healMissingLiveBootstrap('health', reconnected)
      } else {
        const n = get().healthFailCount + 1
        if (deploymentAdmissionBlocked) {
          // A reviewed deploy deliberately creates a short origin restart gap. Keep the sticky admission
          // state authoritative until a successful non-pending health response clears it; otherwise the
          // generic reconnecting state would re-enable paid controls in the middle of the restart.
          set({ health: 'updating', healthFailCount: n, connected: false })
          return
        }
        if (!outageStartedAt) outageStartedAt = Date.now() // first genuine fail of this outage → start the grace clock
        // Escalate to the red 'engine-offline' bar only once the outage has BOTH failed enough times
        // (anti-flicker) AND outlasted the grace window (so a ~20s redeploy/restart stays 'reconnecting',
        // never flashing "machine is asleep or offline"). A real sleep/outage persists and does escalate.
        const hardDown = n >= OFFLINE_THRESHOLD && Date.now() - outageStartedAt >= OFFLINE_GRACE_MS
        const health: HealthState = hardDown ? 'engine-offline' : 'reconnecting'
        // back-fill legacy `connected` (online/reconnecting = true) so the TickerPicker dot stays consistent
        set({ health, healthFailCount: n, connected: health === 'reconnecting' })
      }
    }
  },

  _handleEvent: (e) => {
    if (!sseFrameForRun(e, e?.runId, RUN_EVENT_TYPES)) return
    const adopted = get().activeRuns[e.runId]
    if (adopted) {
      if (!adopted.swarmId) return
      const reconciled = reconcileRunIdentity(adopted as ActiveRun & { swarmId: string }, e)
      if (!reconciled) return
      set({ activeRuns: { ...get().activeRuns, [e.runId]: reconciled } })
    }
    const selected = get().selectedTicker
    const activeSwarm = get().activeSwarm
    // A label is not a global identity. Derive both halves from the owning run and fail closed if either
    // is absent; otherwise a research GOLD event can paint the commodity GOLD graph (and vice versa).
    const eventRun = get().activeRuns[e.runId]
    const evTicker = eventRun?.ticker ?? (e.type === 'run-started' ? e.ticker : undefined)
    const evSwarm = eventRun?.swarmId
    const forSelected = !!selected && evTicker === selected && evSwarm === activeSwarm
    const selectionToken = get().selectToken
    const eventSelectionStillOwnsView = () => get().selectToken === selectionToken
      && get().selectedTicker === selected && get().activeSwarm === activeSwarm

    const patch: Partial<State> = {}
    const rt = { ...get().nodeRuntime }
    const stream = get().runStream.slice()
    const upsertRow = (runId: string, key: string, name: string, module: string, layer: number, status: NodeStatus, verdict?: string | null) => {
      const i = stream.findIndex((r) => r.key === key)
      const row: StreamRow = { runId, ticker: evTicker || selected || '', key, name, module, layer, status, verdict, ts: Date.now() }
      // Activity is a live feed: whichever row changed most recently belongs at the top. Replacing it in
      // its old slot left current work underneath older completed work.
      if (i >= 0) stream.splice(i, 1)
      stream.unshift(row)
    }

    switch (e.type) {
      case 'agent-started':
        if (forSelected) {
          // e.ts (server) marks when the orb's clock starts; clear any stale endedAt (e.g. a re-run)
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'running', runId: e.runId, startedAt: e.ts, endedAt: undefined }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'running')
        }
        break
      case 'agent-done':
        if (forSelected) {
          // preserve startedAt (set on agent-started, incl. the replayed backlog on reconnect) so the
          // finished orb can show its true duration
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'done', verdict: e.verdict, outputPath: e.outputPath, runId: e.runId, endedAt: e.ts, terminalValidated: e.terminalValidated === true }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'done', e.verdict)
        }
        break
      case 'agent-failed':
        if (forSelected) {
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'failed', runId: e.runId, endedAt: e.ts }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'failed')
        }
        break
      case 'cost-tick': {
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, costUsd: e.costUsdSoFar ?? r.costUsd } }
        const rateProvider = isRunProvider(e.provider) ? e.provider : isRunProvider(r?.provider) ? r.provider : undefined
        if (e.rateLimit && rateProvider) void get().refreshProviders(rateProvider)
        break
      }
      case 'run-heartbeat': {
        // transient liveness pulse (~3s): keeps status/cost/progress honest between agent events and
        // powers the "engine active · <tool> · Xs ago" ambient line — the anti-"is it stuck?" signal
        const r = get().activeRuns[e.runId]
        if (r) {
          patch.activeRuns = {
            ...get().activeRuns,
            [e.runId]: { ...r, status: e.status ?? r.status, costUsd: e.costUsd ?? r.costUsd, agentsDone: e.agentsDone, agentsTotal: e.agentsTotal, lastStdoutAt: e.lastStdoutAt, lastActivity: e.lastActivity, publicationPhase: e.publicationPhase ?? r.publicationPhase, provider: e.provider ?? r.provider, executionProfile: e.executionProfile ?? r.executionProfile, profileKey: e.profileKey ?? r.profileKey, model: e.model ?? r.model, reasoningLevel: e.reasoningLevel ?? r.reasoningLevel, chainId: e.chainId ?? r.chainId, executionEpoch: e.executionEpoch ?? r.executionEpoch },
          }
        }
        break
      }
      case 'run-activity': {
        // One step of a live run, in order — the feed behind the "New data" dock's reading list. The
        // server replays its ring on subscribe, so the same step can arrive twice (replay + live) if a
        // stream reconnects; a tool+ts match drops the duplicate rather than showing a document twice.
        const prev = get().runActivity[e.runId] ?? []
        if (prev.some((a) => a.ts === e.ts && a.tool === e.tool && a.target === e.target)) break
        const next = [...prev, { tool: e.tool, target: e.target, ts: e.ts, provider: e.provider, executionProfile: e.executionProfile }]
        patch.runActivity = { ...get().runActivity, [e.runId]: next.length > ACTIVITY_CAP ? next.slice(-ACTIVITY_CAP) : next }
        break
      }
      case 'run-started': {
        // capture the run's OWN folder so the run-done/run-error refresh below can target THIS run (the
        // just-finished folder) instead of resolving by ticker to the standing run. A fresh module-only
        // re-run writes a new dated folder with no decision record; a by-ticker (preferComplete) refresh
        // would otherwise roll the cockpit back to the older complete run and hide what just landed.
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, ...(e.runRoot ? { runRoot: e.runRoot } : {}), continuation: e.continuation ?? r.continuation, provider: e.provider ?? r.provider, executionProfile: e.executionProfile ?? r.executionProfile, profileKey: e.profileKey ?? r.profileKey, model: e.model ?? r.model, reasoningLevel: e.reasoningLevel ?? r.reasoningLevel, chainId: e.chainId ?? r.chainId, executionEpoch: e.executionEpoch ?? r.executionEpoch } }
        break
      }
      case 'run-done': {
        const gates = terminateReadinessGateMember(get().readinessGate, get().readinessGateQueue, e.runId)
        patch.readinessGate = gates.current // terminal is member-scoped; a surviving old-server sibling becomes the owner
        patch.readinessGateQueue = gates.queued
        patch.readinessRecovery = withoutReadinessRecovery(get().readinessRecovery, [e.runId])
        chainedReadinessRecoveryTried.delete(e.runId)
        if (get().stoppingRuns[e.runId]) { const s = { ...get().stoppingRuns }; delete s[e.runId]; patch.stoppingRuns = s }
        get().refreshActiveRuns() // drops the finished run from the dots AND connects the next chain step
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: 'done', costUsd: e.costUsd ?? r.costUsd } }
        // Refresh the swarm's per-subject verdict pills whenever ANY of its runs FINISHES — even a run for a
        // subject the user isn't currently viewing (start GOLD, switch to COPPER, GOLD finishes): the block
        // below is gated on r.ticker === selected, so without this the picker keeps GOLD's stale pill until a
        // swarm re-entry. loadSwarmSubjects self-guards on activeSwarm, so this is a no-op off the swarm.
        if (r && r.swarmId && r.swarmId !== 'research') {
          const bgFinal = !get().chainTickers.has(runSubjectKey(r.swarmId, r.ticker)) || r.module === 'master'
          if (bgFinal) void get().loadSwarmSubjects(r.swarmId)
        }
        const runOnScreen = !!r && runMatchesSubject(r, selected, activeSwarm)
        if (runOnScreen) {
          // A finished DOC-INTAKE (the "Analyze new data" advisory read) wrote/refreshed the scoped
          // re-run plan under analyses/ — which the data/ watcher can't see, so nothing else refreshes
          // the "New data" panel for an auto-launched read. Refresh it HERE and tell the user the
          // OUTCOME (what the read found and what to do next) instead of a generic "Run complete".
          if (r.kind === 'doc-intake') {
            const tok = get().selectToken // the selection identity at read time
            void get().refreshIntake().then(() => {
              // The user may have switched tickers while the read refreshed; refreshIntake discards the stale
              // response, but this continuation would otherwise announce THIS run's outcome against whatever
              // ticker is now selected. Suppress it when the selection changed (selectToken is bumped on every
              // ticker switch), so a completed A run never toasts a result while B is viewed.
              if (get().selectToken !== tok) return
              const plan = get().intake
              const n = plan?.rerun_plan?.commands?.length ?? 0
              const msg = !plan
                ? 'New-data read complete — open the New data panel'
                : plan.verdict === 'scoped_rerun' && n > 0
                  ? `New data affects ${n} check${n === 1 ? '' : 's'} — the New data panel has the scoped re-run`
                  : plan.verdict === 'insufficient'
                    ? 'New-data read: not enough evidence to scope a re-run — see the New data panel'
                    : 'New data read: filed to the pool — nothing needs re-running'
              get().setToast({ msg, tone: 'good' })
            })
            break
          }
          // a chained full run finishes once PER STEP; only the master step (the last) is "complete".
          const chainKey = r.swarmId ? runSubjectKey(r.swarmId, r.ticker) : ''
          const chained = get().chainTickers.has(chainKey)
          const isFinal = !chained || r.module === 'master'
          // resolve the finished run's OWN swarm (positive match only — an absent swarmId means an
          // older engine, which only ever runs research; never default a swarm in permissively)
          const rSw = r.swarmId && r.swarmId !== 'research' ? r.swarmId : undefined
          // keep reports/decision current as each step lands (memo/thesis stay false until the master).
          // target the run's OWN folder (r.runRoot, from run-started) so a module-only re-run surfaces what
          // just landed instead of the by-ticker refresh resolving back to the older standing run.
          api.runManifest(selected!, r.runRoot ?? undefined, rSw).then((m) => {
            if (!eventSelectionStillOwnsView()) return
            set(projectRunManifest(m, get().nodeRuntime, e.runId))
          }).catch(() => {})
          if (isFinal) {
            patch.coreBloom = true
            if (bloomTimer) clearTimeout(bloomTimer)
            bloomTimer = setTimeout(() => set({ coreBloom: false }), 4500)
            api.decision(selected!, rSw, r.runRoot ?? undefined).then((d) => {
              if (eventSelectionStillOwnsView()) set({ decision: d })
            }).catch(() => {})
            // A finished run means a NEW entry price and expected return, so the re-based numbers beside
            // them must be recomputed against it — forced past the TTL for exactly that reason. Pass the
            // finished run's OWN root (the same one the decision above was fetched with): the manifest
            // callback that updates the store's `runRoot` runs concurrently and may not have landed yet,
            // so reading get().runRoot here could re-base the new call against the previous run's price.
            void get().refreshLiveQuote(true, r.runRoot ?? undefined)
            // (the swarm's per-subject verdict pills are refreshed above, unconditionally on any finished
            // non-research run, so a background completion for a non-selected subject also updates.)
            // A finished re-run is exactly when a new version of the record exists. Deliberately NOT on
            // the data-changed SSE: that watches data/, and a document landing does not change the diff —
            // only a re-run does. And because the reader treats the working tree as current, the delta is
            // right the moment the run WRITES, so no analyses/ watcher is needed either.
            // `rSw` is UNDEFINED for research (it is an API param where undefined MEANS research, set at
            // the top of this block) — so `rSw === 'research'` is never true and this once silently never
            // fired: the chip would sit stale until the next company switch, quietly describing the run
            // before the one that just finished.
            if (!rSw) void get().refreshWhatChanged()
            if (chained) set({ chainTickers: new Set([...get().chainTickers].filter((x) => x !== chainKey)) })
            get().setToast({ msg: 'Run complete', tone: 'good' })
          } else {
            // mid-chain step done — the next module auto-starts (and is now being streamed); show progress
            get().setToast({ msg: `${r.module || 'Module'} done — continuing the pipeline…`, tone: 'good' })
          }
        }
        break
      }
      case 'run-error': {
        const gates = terminateReadinessGateMember(get().readinessGate, get().readinessGateQueue, e.runId)
        patch.readinessGate = gates.current // generic cancellation may skip readiness-resolved; preserve any sibling gate
        patch.readinessGateQueue = gates.queued
        patch.readinessRecovery = withoutReadinessRecovery(get().readinessRecovery, [e.runId])
        chainedReadinessRecoveryTried.delete(e.runId)
        if (get().stoppingRuns[e.runId]) { const s = { ...get().stoppingRuns }; delete s[e.runId]; patch.stoppingRuns = s }
        get().refreshActiveRuns()
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: e.status } }
        // a chained full run stops advancing when a step fails/cancels/comes back incomplete — the engine
        // won't launch the next step, so clear the chain and say exactly where it stopped.
        const chainKey = r?.swarmId ? runSubjectKey(r.swarmId, r.ticker) : ''
        const runOnScreen = !!r && runMatchesSubject(r, selected, activeSwarm)
        if (r && get().chainTickers.has(chainKey)) {
          set({ chainTickers: new Set([...get().chainTickers].filter((x) => x !== chainKey)) })
          if (runOnScreen) {
            const msg = e.status === 'incomplete'
              ? (e.message || 'The pipeline finished but the final thesis & memo were not produced.')
              : `Pipeline stopped at ${r.module || 'a step'} (${e.status}) — fix it and re-run from there.`
            get().setToast({ msg, tone: 'bad' })
            const rSw = r.swarmId && r.swarmId !== 'research' ? r.swarmId : undefined
            api.runManifest(selected!, r.runRoot ?? undefined, rSw).then((m) => {
              if (eventSelectionStillOwnsView()) set(projectRunManifest(m, get().nodeRuntime, e.runId))
            }).catch(() => {})
          }
          break
        }
        if ((!r && !selected) || runOnScreen) {
          if (e.status === 'incomplete') {
            // honest signal: the process exited but the final memos weren't produced (budget/turn cut-off)
            get().setToast({ msg: e.message || 'Run finished but the final thesis & memo were not produced — re-run from the master to finish.', tone: 'bad' })
            // surface whatever DID get written so the cockpit isn't blank (in the run's OWN swarm)
            const rSw = r?.swarmId && r.swarmId !== 'research' ? r.swarmId : undefined
            if (runOnScreen) api.runManifest(selected!, r.runRoot ?? undefined, rSw).then((m) => {
              if (eventSelectionStillOwnsView()) set(projectRunManifest(m, get().nodeRuntime, e.runId))
            }).catch(() => {})
          } else {
            const failedProvider = isRunProvider(e.provider) ? e.provider : isRunProvider(r?.provider) ? r.provider : undefined
            get().setToast({ msg: e.reason === 'out_of_credits' && failedProvider ? `${providerLabel(failedProvider)} plan usage is exhausted — run paused` : `Run ${e.status}: ${e.reason}`, tone: 'bad' })
            if (e.reason === 'out_of_credits' && failedProvider) {
              const providers = get().providers
              patch.providers = { ...providers, [failedProvider]: { ...providers[failedProvider], usage: { ok: false, reason: 'out_of_credits', checked: true } } }
              void get().refreshProviders(failedProvider)
            }
          }
        }
        break
      }
      case 'readiness-blocked':
        // New servers elect one decision owner for the whole logical chain. During deploy skew an older
        // server can still block several children at once; queue those exact run ids instead of letting the
        // latest event overwrite the only visible modal and strand its siblings invisibly.
        if (forSelected && e.report.ticker === selected) {
          const chainId = eventRun?.chainId ?? e.chainId
          if (chainId && !isPhysicallyEmptyReadiness(e.report)) {
            // A Full/Continue chain may ask only on positive physical emptiness. Old/deploy-skew servers can
            // still park on parser weakness; recover through the server's deterministic recheck instead of
            // fabricating human consent or silently hiding a paused run.
            const gates = resolveReadinessChain(get().readinessGate, get().readinessGateQueue, chainId)
            patch.readinessGate = gates.current
            patch.readinessGateQueue = gates.queued
            void recoverNonEmptyChainedReadiness(set, get, e.runId, chainId)
          } else {
            const gates = enqueueReadinessGate(get().readinessGate, get().readinessGateQueue, {
              runId: e.runId,
              report: e.report,
              chainId,
              // A recheck that is still empty re-emits readiness-blocked. That event is the completion
              // signal which re-enables the one chain decision; never carry the old spinner through it.
              rechecking: false,
            })
            patch.readinessGate = gates.current
            patch.readinessGateQueue = gates.queued
          }
        }
        break
      case 'readiness-checking': {
        // a re-check is running for the OPEN gate — mark it so the panel shows a spinner and disables
        // its buttons instead of looking frozen for the (up to a few minutes) OCR/extract pass. The
        // initial pre-flight check also emits this, but the gate isn't open yet, so it's a no-op then.
        const gates = updateReadinessGate(get().readinessGate, get().readinessGateQueue, e.runId, (gate) => ({ ...gate, rechecking: true }))
        patch.readinessGate = gates.current
        patch.readinessGateQueue = gates.queued
        break
      }
      case 'readiness-report': {
        const chainId = eventRun?.chainId ?? e.chainId
        // A chained non-empty report is internal triage truth, never a browser decision. This also removes
        // the old empty modal as soon as a successful recheck proves files arrived; readiness-resolved then
        // confirms the automatic continuation. Standalone runs retain their strict panel semantics.
        const gates = chainId && !isPhysicallyEmptyReadiness(e.report)
          ? resolveReadinessChain(get().readinessGate, get().readinessGateQueue, chainId)
          : updateReadinessGate(get().readinessGate, get().readinessGateQueue, e.runId, (gate) => ({
              ...gate,
              report: e.report,
              rechecking: false,
            }))
        patch.readinessGate = gates.current
        patch.readinessGateQueue = gates.queued
        break
      }
      case 'readiness-resolved': {
        // any decision (proceed / override / recheck-clean / cancel) resolves the gate -> close the panel
        const gates = resolveReadinessGate(get().readinessGate, get().readinessGateQueue, e.runId)
        patch.readinessGate = gates.current
        patch.readinessGateQueue = gates.queued
        patch.readinessRecovery = withoutReadinessRecovery(get().readinessRecovery, [e.runId])
        chainedReadinessRecoveryTried.delete(e.runId)
        break
      }
    }
    patch.nodeRuntime = rt
    patch.runStream = stream
    set(patch)
  },

  // ================= swarm switcher + warp =================
  // The warp is the cinematic transition between swarms: collapse (current constellation implodes)
  // -> traverse (a comet crosses the void; the swarm flips mid-flight) -> bloom (the target
  // constellation awakens). Reduced-motion visitors get a quick crossfade (the CSS handles it);
  // the phase timings here match the keyframes in global.css.
  switchSwarm: (to, opts) => {
    const from = get().activeSwarm
    if (to === from || get().warp) return
    if (!get().swarms.some((s) => s.id === to)) return
    chatResumeSeq++ // invalidate any slower History resume before the animated navigation begins
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null // chat is research-only — leaving the swarm closes it
    newsChatAbort?.abort(); newsChatAbort = null
    newsChatPendingBaseline = null
    if (reduced) {
      set({ activeSwarm: to, warp: null, openOutput: null, selectedNodeKey: null, signalIntakeOpen: false, signalIntakeSeed: null, pipelineOpen: false, scThesisDetail: null, scSelectedEvent: null, scFocusedCompany: null, newsFeedOpen: false, ideasOpen: false, diagnosticsOpen: false, launchConfirm: null, launchPending: get().launchPending?.selection ? null : get().launchPending, ...CHAT_RESET, ...NEWS_CHAT_RESET })
      get()._enterSwarm(to)
      if (opts?.landTicker) void get().selectTicker(opts.landTicker)
      return
    }
    set({ warp: { from, to, payloadTicker: opts?.payloadTicker, landTicker: opts?.landTicker, phase: 'collapse' }, openOutput: null, selectedNodeKey: null, signalIntakeOpen: false, signalIntakeSeed: null, pipelineOpen: false, scThesisDetail: null, scSelectedEvent: null, scFocusedCompany: null, newsFeedOpen: false, ideasOpen: false, diagnosticsOpen: false, launchConfirm: null, launchPending: get().launchPending?.selection ? null : get().launchPending, ...CHAT_RESET, ...NEWS_CHAT_RESET })
    if (warpTimer) clearTimeout(warpTimer)
    warpTimer = setTimeout(() => get()._advanceWarp(), 420) // collapse -> traverse
  },

  _enterSwarm: (to) => {
    if (to !== 'screener') invalidateScreenerBootstrap()
    // Picker dots follow the cockpit being viewed; Activity keeps the unfiltered globalActive list.
    // Recompute synchronously on entry so a same-named subject from the previous swarm never flashes live.
    set({ activeRunsByTicker: runningSubjectsForSwarm(get().globalActive, to) })
    const layout = get().swarms.find((s) => s.id === to)?.layout
    if (layout === 'flow') {
      get()._enterWire(to)
      // Flow is a layout contract, not a screener identity. Future flow swarms own their own graph/board;
      // only the discovered screener may enter this hardcoded screener initialization path.
      if (to === 'screener') void get().scInit()
      else set({
        // Fail closed until a non-screener flow declares its own graph/board adapter. Never show the
        // previous screener's gauntlet, selected signal, or board under a different swarm's identity.
        scGraph: null, scNodesByKey: new Map(), scRuntime: {}, scRouted: {}, scSelectedSignal: null,
        scBoard: null, scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
      })
      return
    }
    // constellation swarm (research or commodity): both share the graph/selectedTicker slices, so reset
    // the selection when the owner changes (a screener detour leaves constellationSwarm untouched, so
    // returning to research keeps its selection). Then load the swarm's subject list (commodity only).
    if (get().constellationSwarm !== to) {
      dataScanRequest?.controller.abort()
      dataScanRequest = null
      set({
        constellationSwarm: to, selectedTicker: null, graph: null, nodesByKey: new Map(),
        dataStatus: null, dataLoading: false, dataScan: null, nodeRuntime: {}, decision: null, runRoot: null,
        reports: { memo: false, thesis: false, dossier: false }, moduleReports: {}, selectedNodeKey: null,
        readinessGate: null, readinessGateQueue: [], readinessRecovery: {}, ...CHAT_RESET,
      })
    }
    if (to !== 'research') void get().loadSwarmSubjects(to)
    // a constellation swarm that DECLARES a wire (manifest `wire:` block) boots the shared wire surface
    // too: reset the wire's view state to this owner, backfill + attach the one shared news stream, and
    // pull the pulse. Absent on old servers → none of this runs (fail-closed).
    if (get().swarms.find((s) => s.id === to)?.wire) {
      get()._enterWire(to)
      void get().scEnsureNewsStream()
      void get().refreshWirePulse(true)
    }
  },

  // Owner-keyed wire view-state reset (mirrors the constellationSwarm pattern above): the archive query,
  // facets, themes geo/subject/window and open theme belong to ONE wire at a time — switching wire owners
  // must never leak a commodity archive query into the screener rail (or vice versa). The shared data
  // plane (newsItems, the SSE singleton, enrichment cache, shelf/flags) is deliberately NOT touched.
  _enterWire: (to) => {
    if (get().wireSwarm === to) return
    archiveToken++ // invalidate any history page still owned by the wire we are leaving
    facetsToken++ // invalidate its delayed/background facet recount too
    themesRequestSeq++ // invalidate any response owned by the wire we are leaving
    cancelThemeDetailRequest()
    if (themesGeoRefetchTimer) { clearTimeout(themesGeoRefetchTimer); themesGeoRefetchTimer = null }
    set({
      wireSwarm: to,
      scArchiveQuery: {}, scArchiveResults: [], scArchiveCursor: null, scArchiveLoading: false,
      scArchiveLoadingMore: false, scArchiveScannedThrough: null, scArchiveExhausted: false, scArchiveError: null,
      scFacets: null, scFacetsLoading: false,
      themes: [], themeFormationQueue: null, themeCompilerHealth: null, themesStatus: 'idle', themesView: null, themesWindow: null, themesHistoryDays: 0, themesGeneratedAt: null, themesProjectedAt: null,
      themesGeo: { country: '', geoRegion: '', label: '' }, themesSubject: null,
      selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false,
      feedWindowDays: 2,
    })
  },

  loadSwarmSubjects: async (swarmId) => {
    set({ swarmSubjectsLoading: true })
    try {
      const { subjects, summaries } = await api.swarmSubjects(swarmId)
      // guard: a swarm switch mid-flight must not stamp this list onto the new owner (mirrors the activeSwarm
      // check the fetch below relies on). Keep names and the per-subject run map in lockstep.
      if (get().activeSwarm === swarmId) {
        set({ swarmSubjectList: subjects, swarmSubjectRuns: Object.fromEntries(summaries.map((s) => [s.subject, s])) })
      }
    } catch { /* keep the prior list on a transient failure */ }
    finally { if (get().activeSwarm === swarmId) set({ swarmSubjectsLoading: false }) }
  },

  _advanceWarp: () => {
    const w = get().warp
    if (!w) return
    if (w.phase === 'collapse') {
      // mid-flight: flip the active swarm so the target constellation mounts underneath the void
      set({ warp: { ...w, phase: 'traverse' }, activeSwarm: w.to })
      get()._enterSwarm(w.to)
      if (w.landTicker) void get().selectTicker(w.landTicker)
      if (warpTimer) clearTimeout(warpTimer)
      warpTimer = setTimeout(() => get()._advanceWarp(), 520)
    } else if (w.phase === 'traverse') {
      set({ warp: { ...w, phase: 'bloom' } })
      if (warpTimer) clearTimeout(warpTimer)
      warpTimer = setTimeout(() => get()._advanceWarp(), 520)
    } else {
      set({ warp: null })
    }
  },

  // ================= screener slice =================
  scInit: async () => {
    if (get().activeSwarm !== 'screener') return
    if (screenerInitPromise) return screenerInitPromise
    const ownershipEpoch = screenerOwnershipEpoch
    const stillOwnsBootstrap = () => get().activeSwarm === 'screener' && screenerOwnershipEpoch === ownershipEpoch
    const attempt = (async () => {
      if (!get().scGraph) {
        const g = await api.swarmGraph('screener')
        if (!stillOwnsBootstrap()) return
        set({ scGraph: g, scNodesByKey: flatten(g) })
      }
      await get().scRefreshBoard(true, ownershipEpoch)
      if (!stillOwnsBootstrap()) return
      // A concurrent board refresh may supersede this generation before either response commits. A cold
      // bootstrap is not complete without a board; turn that silent supersession into bounded recovery.
      if (!get().scBoard) throw new Error('Screener board bootstrap did not commit')
      // Auto-show the most recent signal on a fresh gauntlet. If a prior owner was invalidated while its
      // selected signal was hydrating, preserve the selection but re-read its saved run on return.
      if (get().scSelectedSignal && screenerSignalHydrationPending === get().scSelectedSignal) {
        await get().scSelectSignal(get().scSelectedSignal, ownershipEpoch)
      } else if (!get().scSelectedSignal) {
        const latest = get().scBoard?.signals?.[0]?.signal_id || get().scBoard?.live?.find((l) => l.kind === 'signal')?.subjectId || null
        if (latest) await get().scSelectSignal(latest, ownershipEpoch)
      }
      if (!stillOwnsBootstrap()) return
      // attach to any screener runs already in flight
      const live = get().scBoard?.live || []
      for (const l of live) if (!scRunSources.has(l.runId)) void reconnectScreenerRun(get, l.runId, l.subjectId)
      // the event rail is part of the screener stage now — keep the wire backfilled + streaming live
      await get().scEnsureNewsStream(ownershipEpoch)
      if (!stillOwnsBootstrap()) return
      // Themes is the screener's default landing view — open it on entry (the user can switch to
      // Ranked/Latest/Everything from the rail, which closes it). Guarded so it never clobbers a
      // deep-link into a specific event/company already in focus.
      if (get().themesView === null && !get().scSelectedEvent && !get().scFocusedCompany) void get().openThemes('board')
    })()
    // Store the HANDLED promise, not the raw attempt: every concurrent caller observes the same fulfilled
    // recovery contract even when the underlying graph/board request rejects. Returning the raw attempt to
    // followers was an unhandled-rejection race hidden by the first caller's catch.
    const handled: Promise<void> = attempt
      .then(() => {
        if (!stillOwnsBootstrap()) return
        clearScreenerInitRetry()
        // A real reconnect that landed while this coalesced init was already past its board read owns one
        // follow-up refresh. Clear before starting it so another reconnect can queue the next generation.
        if (screenerReconnectRefreshPending) {
          screenerReconnectRefreshPending = false
          void get().scRefreshBoard(false, ownershipEpoch)
        }
      })
      .catch((error) => {
        // A cold graph or board gateway failure used to disappear here forever, leaving a permanently
        // partial screener until a full reload. Only the screener owns this hardcoded initialization path;
        // a future flow-layout swarm must never be contaminated with screener graph/board state.
        if (!get().staticMode && stillOwnsBootstrap() && isTransientBootstrapFailure(error)) scheduleScreenerInitRetry()
      })
      .finally(() => {
        if (screenerInitPromise === handled) screenerInitPromise = null
      })
    screenerInitPromise = handled
    return handled
  },

  // Backfill the wire from disk (restart-proof) and attach the live SSE stream, WITHOUT opening the old
  // overlay. Idempotent: connectNewsStream guards a single global source, and we only backfill when empty
  // so we never clobber items already streamed in. Drives the persistent left-rail feed.
  scEnsureNewsStream: async (bootstrapEpoch?: number) => {
    const stillOwnsBootstrap = () => bootstrapEpoch === undefined
      || (get().activeSwarm === 'screener' && screenerOwnershipEpoch === bootstrapEpoch)
    if (!stillOwnsBootstrap()) return
    void get().refreshNewsStatus()
    if (!get().newsItems.length || !get().lastScan) {
      try {
        const { items, cycles } = await api.newsFeed(2)
        if (!stillOwnsBootstrap()) return
        const patch: Partial<State> = {}
        if (!get().newsItems.length) patch.newsItems = items
        // seed the live map from the most recent scan's RAW fetch volume so it's alive on open (not dead
        // until the next 5-min cycle). cycles come back newest-first from readFeed.
        if (cycles?.length && !get().lastScan) patch.lastScan = { fetched: cycles[0].fetched || 0, candidates: cycles[0].candidates || 0, seq: (get().lastScan?.seq || 0) + 1 }
        if (Object.keys(patch).length) set(patch)
      } catch {}
    }
    if (!stillOwnsBootstrap()) return
    // first-ever visit: everything already on the wire counts as seen (once-only; see seedReadBaseline)
    if (get().newsItems.length) get().seedReadBaseline(get().newsItems)
    if (!get().staticMode) connectNewsStream(get)
  },

  scSelectEvent: (it) => {
    // opening any event exits the company drill-down (the CompanyView takes main-stage precedence)
    set({ scSelectedEvent: it, scFocusedCompany: null })
    if (it) {
      get().markEventsRead([it.event_id]) // opening an item is what marks it read (RSS/Gmail standard)
      void get().fetchEnrichment(it) // kick the enrichment the moment an event opens
    }
  },

  scFocusCompany: (c) => set({ scFocusedCompany: c }),

  // ---- dynamic themes ----
  refreshThemes: async () => {
    const requestSeq = ++themesRequestSeq
    const requestUpsertMutationSeq = themeUpsertMutationSeq
    const requestState = get()
    const g = requestState.themesGeo
    const subject = requestState.themesSubject
    const cfg = activeWireConfig(requestState)
    const sliced = !!(g.country || g.geoRegion || subject || (cfg && !cfg.flow && cfg.eventScope))
    // Full owner identity matters in addition to the visible slice. A slow response from one wire can
    // otherwise land after _enterWire resets both wires to the same empty geo/subject values.
    const owner = {
      activeSwarm: requestState.activeSwarm,
      wireSwarm: requestState.wireSwarm,
      configSwarm: cfg?.swarmId || '',
      flow: cfg?.flow ?? null,
      eventScope: cfg?.eventScope || '',
    }
    const stillOwnsRequest = () => {
      if (requestSeq !== themesRequestSeq) return false
      const now = get()
      const nowCfg = activeWireConfig(now)
      return now.activeSwarm === owner.activeSwarm
        && now.wireSwarm === owner.wireSwarm
        && (nowCfg?.swarmId || '') === owner.configSwarm
        && (nowCfg?.flow ?? null) === owner.flow
        && (nowCfg?.eventScope || '') === owner.eventScope
        && now.themesGeo.country === g.country
        && now.themesGeo.geoRegion === g.geoRegion
        && now.themesSubject === subject
    }
    try {
      const geo = g.country || g.geoRegion ? { country: g.country || undefined, geoRegion: g.geoRegion || undefined } : undefined
      // a non-flow wire slices the SAME themes to its own flow (server themes/commodity-index.ts) —
      // narrowed further to one subject when a single chip is selected (themesSubject, like themesGeo)
      const slice = cfg && !cfg.flow && cfg.eventScope ? { scope: cfg.eventScope, commodity: subject || undefined } : undefined
      const idx = await api.newsThemes(geo, slice)
      // Newest request wins even within one slice. Owner + config identity also prevent a response from a
      // previous wire being mistaken for the matching empty slice on the wire the user just entered.
      if (!stillOwnsRequest()) return
      // A live upsert that landed after this request began may carry the SAME Theme.rev (assessment/time
      // projection changes do). Do not let the older snapshot overwrite it; fetch once more from the
      // now-authoritative store. Request generations bound concurrent retries and owner/slice switches.
      if (themeUpsertMutationSeq !== requestUpsertMutationSeq) return get().refreshThemes()
      const currentThemes = idx.themes.filter((t) => {
        const removedAt = themeRemovalRevs.get(t.theme_id)
        if (removedAt === undefined) return true
        if (Number.isFinite(t.rev) && t.rev > removedAt) { themeRemovalRevs.delete(t.theme_id); return true }
        return false
      })
      // A global removal deliberately lets an already-useful index read settle. Apply the same session
      // tombstones to its additive formation excerpt before commit, otherwise a pre-removal HTTP response
      // can resurrect the exact non-investable row that SSE just invalidated.
      let nextFormation = normalizeThemeFormationQueue(idx.formation_queue)
      let nextCompilerHealth = normalizeThemeCompilerHealth(idx.compiler_health)
      for (const candidate of nextFormation?.candidates || []) {
        if (!themeRemovalRevs.has(candidate.theme_id)) continue
        const reconciled = withoutFormationCandidate(nextFormation, nextCompilerHealth, candidate.theme_id)
        nextFormation = reconciled.formation
        nextCompilerHealth = reconciled.health
      }
      // The full index is also the authoritative removal reconciliation after a lossy SSE gap. If the
      // currently open detail no longer belongs to this exact owner/slice, close every piece of its cached
      // state in the same synchronous write. The request/owner guard above makes an older response unable
      // to dismiss a selection made on a newer owner or slice; the async detail callbacks also key off the
      // selected id, so they cannot repopulate it after this clear.
      const stateBeforeSet = get()
      const selectedTheme = stateBeforeSet.selectedTheme
      const previousSelectedSummary = selectedTheme ? stateBeforeSet.themes.find((t) => t.theme_id === selectedTheme) : undefined
      const nextSelectedSummary = selectedTheme ? currentThemes.find((t) => t.theme_id === selectedTheme) : undefined
      const selectedMissing = !!selectedTheme && (!nextSelectedSummary || themeSurfaceStatus(nextSelectedSummary) === 'context')
      // The detail endpoint is global. On the global index, compare the complete thesis contract; on a
      // geo/subject slice, only revision identity is portable because the slice has its own qualification.
      const selectedContractChanged = !!selectedTheme && !!nextSelectedSummary && !selectedMissing && (
        sliced
          ? (!!previousSelectedSummary && previousSelectedSummary.rev !== nextSelectedSummary.rev)
          : (
              (!!previousSelectedSummary && themeDetailContractKey(previousSelectedSummary) !== themeDetailContractKey(nextSelectedSummary))
              || (!!stateBeforeSet.themeDetail && themeDetailContractKey(stateBeforeSet.themeDetail.theme) !== themeDetailContractKey(nextSelectedSummary))
            )
      )
      if (selectedMissing || selectedContractChanged) cancelThemeDetailRequest()
      set({
        themes: currentThemes,
        themeFormationQueue: nextFormation,
        themeCompilerHealth: nextCompilerHealth,
        themesHistoryDays: idx.history_days || 0,
        themesGeneratedAt: idx.generated_at || null,
        themesProjectedAt: idx.projected_at || null,
        themesStatus: 'ready',
        ...(selectedMissing || selectedContractChanged ? {
          selectedTheme: selectedMissing ? null : selectedTheme,
          themeDetail: null,
          themeDetailError: null,
          themeBrief: null,
          themesLoading: false,
          themeBriefLoading: false,
        } : {}),
      })
      // Keep an open global dossier aligned with the exact summary revision/qualification. Calling the
      // normal selector gives the replacement read a new generation, so the invalidated response cannot
      // land even if it resolves a moment later.
      if (selectedContractChanged && selectedTheme) void get().selectTheme(selectedTheme)
    } catch {
      // A failed superseded request cannot turn a newer success (or a different owner/slice) red.
      if (stillOwnsRequest()) set({ themesStatus: 'error' })
    }
  },
  retryThemes: () => {
    if (themesRetryPromise) return themesRetryPromise
    set({ themesStatus: 'loading' })
    const pending = get().refreshThemes().finally(() => {
      if (themesRetryPromise === pending) themesRetryPromise = null
    })
    themesRetryPromise = pending
    return pending
  },
  // the wire rail's subject chips call this so the Themes map/board slice to the same single subject —
  // the exact themesGeo pattern (debounced refetch, display updates without a wasted round-trip).
  setThemesSubject: (s) => {
    if (get().themesSubject === s) return
    themesRequestSeq++ // invalidate immediately; the matching refetch is deliberately debounced below
    cancelThemeDetailRequest()
    const open = get().themesView !== null
    // A cached index has one implicit slice. Once the subject changes it is not evidence for the new
    // label, so clear it instead of briefly (or after a failed fetch, indefinitely) relabelling it.
    set({
      themesSubject: s,
      themes: [], themeFormationQueue: null, themeCompilerHealth: null, themesHistoryDays: 0, themesGeneratedAt: null, themesProjectedAt: null,
      themesStatus: open ? 'loading' : 'idle',
      selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false,
    })
    if (open) {
      if (themesGeoRefetchTimer) clearTimeout(themesGeoRefetchTimer)
      themesGeoRefetchTimer = setTimeout(() => void get().refreshThemes(), 300)
    }
  },
  // the Event rail's "Where" picker calls this so the Themes map/board slice to the same geography. Only
  // refetches when the geography (country/continent) actually changes — a late-arriving label refresh
  // updates the display without a wasted round-trip — and only while the themes view is showing (else
  // openThemes picks up the current geo). Debounced so scrubbing the dropdown collapses to one request.
  setThemesGeo: (geo) => {
    const cur = get().themesGeo
    const geoChanged = cur.country !== geo.country || cur.geoRegion !== geo.geoRegion
    if (!geoChanged && cur.label === geo.label) return
    if (!geoChanged) { set({ themesGeo: geo }); return }
    themesRequestSeq++ // invalidate immediately; old results cannot land during the debounce window
    cancelThemeDetailRequest()
    const open = get().themesView !== null
    // Same fail-closed slice rule as subject changes: old geography rows never wear the new geography's
    // label. Clearing is intentionally blunt and honest; a matching fresh index replaces it shortly.
    set({
      themesGeo: geo,
      themes: [], themeFormationQueue: null, themeCompilerHealth: null, themesHistoryDays: 0, themesGeneratedAt: null, themesProjectedAt: null,
      themesStatus: open ? 'loading' : 'idle',
      selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false,
    })
    if (open) {
      if (themesGeoRefetchTimer) clearTimeout(themesGeoRefetchTimer)
      themesGeoRefetchTimer = setTimeout(() => void get().refreshThemes(), 300)
    }
  },
  // The "Best ideas" tab. Mirrors openThemes: takes the main pane, clears any open event, and closes the
  // sibling Themes view. Kicks a board refresh so the freshly-skimmed ideas land without waiting for the
  // 30s poll. Read-only — surfacing happens server-side on the ingester tick.
  openIdeas: () => {
    cancelThemeDetailRequest()
    set({ ideasOpen: true, calendarOpen: false, themesView: null, selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false, scSelectedEvent: null, scFocusedCompany: null })
    void get().scRefreshBoard()
  },
  closeIdeas: () => set({ ideasOpen: false }),
  // The "Calendar" tab. Mirrors openIdeas: takes the main pane, clears any open event, closes the sibling
  // tabs. CalendarView fetches /api/calendar itself (no store data to seed) — this just flips the pane.
  openCalendar: () => {
    cancelThemeDetailRequest()
    set({ calendarOpen: true, ideasOpen: false, themesView: null, selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false, scSelectedEvent: null, scFocusedCompany: null })
  },
  closeCalendar: () => set({ calendarOpen: false }),
  openThemes: async (view) => {
    const themesWindow = themeWindowForView(view, get().themesWindow)
    // An explicit Themes-tab open is navigation to the first-look surface, not a resurrection of whichever
    // deep dive happened to be open before Ideas/Calendar. Clear its whole async state synchronously so an
    // old detail callback sees a different selected id and cannot land during the new index request.
    cancelThemeDetailRequest()
    set({
      themesView: view,
      themesWindow,
      ideasOpen: false,
      calendarOpen: false,
      scSelectedEvent: null,
      themesStatus: 'loading',
      selectedTheme: null,
      themeDetail: null,
      themeDetailError: null,
      themeBrief: null,
      themesLoading: false,
      themeBriefLoading: false,
    })
    void get().setIntensityWindow(intensityWindowForHours(themesWindow)) // Briefing is current-only; Explore owns historical windows
    await get().refreshThemes()
    if (!get().staticMode) connectNewsStream(get) // reuse the one news EventSource; theme-update flows on it
  },
  setIntensityWindow: async (w) => {
    set({ scIntensityWindow: w })
    try {
      const s = await api.screenerIntensity(w)
      if (get().scIntensityWindow === w) set({ scIntensity: s }) // ignore a stale response after a fast switch
    } catch { /* keep the prior reading */ }
  },
  setThemesView: (view) => {
    const themesWindow = themeWindowForView(view, get().themesWindow)
    cancelThemeDetailRequest()
    set({ themesView: view, themesWindow, selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false })
    void get().setIntensityWindow(intensityWindowForHours(themesWindow))
  },
  setThemesWindow: (hours) => {
    const themesWindow = themeWindowForView(get().themesView, hours)
    set({ themesWindow })
    void get().setIntensityWindow(intensityWindowForHours(themesWindow)) // historical windows belong only to Explore
  },
  closeThemes: () => {
    cancelThemeDetailRequest()
    set({ themesView: null, selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false })
  },
  selectTheme: async (id) => {
    const requestSeq = ++themeDetailRequestSeq
    if (!id) { set({ selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false }); return }
    const requestState = get()
    const summaryAtRequest = requestState.themes.find((theme) => theme.theme_id === id)
    const cfg = activeWireConfig(requestState)
    const expectedContract = themeDetailContractKey(summaryAtRequest)
    const geo = requestState.themesGeo.country || requestState.themesGeo.geoRegion
      ? { country: requestState.themesGeo.country || undefined, geoRegion: requestState.themesGeo.geoRegion || undefined }
      : undefined
    const slice = cfg && !cfg.flow && cfg.eventScope
      ? { scope: cfg.eventScope, commodity: requestState.themesSubject || undefined }
      : undefined
    set({ selectedTheme: id, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: true, themeBriefLoading: false })
    // The detail payload already carries the canonical narrative dossier. Do not launch the retired
    // headline-only brief synthesizer on every open; it could disagree with the contract and spend budget
    // for output this UI no longer renders.
    try {
      const detail = await api.newsTheme(id, geo, slice)
      if (requestSeq !== themeDetailRequestSeq || get().selectedTheme !== id) return
      if (!detail) {
        set({ themeDetail: null, themeDetailError: 'The theme detail endpoint returned no current dossier.', themesLoading: false })
        return
      }
      const currentSummary = get().themes.find((theme) => theme.theme_id === id)
      const currentContract = themeDetailContractKey(currentSummary)
      const responseContract = themeDetailContractKey(detail.theme)
      const revisionMatches = !!currentSummary
        && Number.isFinite(currentSummary.rev)
        && Number.isFinite(detail.theme.rev)
        && currentSummary.rev === detail.theme.rev
      const contractMatches = revisionMatches && !!expectedContract
        && expectedContract === currentContract
        && currentContract === responseContract
      if (!currentSummary || themeSurfaceStatus(currentSummary) === 'context' || detail.theme.theme_id !== id || !contractMatches) {
        set({ themeDetail: null, themeDetailError: 'The theme changed while its detail was loading. Retry from the current Themes screen.', themesLoading: false })
        return
      }
      set({ themeDetail: detail, themeDetailError: null, themesLoading: false })
    } catch (error: any) {
      if (requestSeq === themeDetailRequestSeq && get().selectedTheme === id) {
        set({ themeDetailError: error?.message || 'The theme detail could not be loaded.', themesLoading: false })
      }
    }
  },
  // force a fresh read of the open theme's brief (the deep-dive "↻" — useful when new news has landed)
  regenerateThemeBrief: async () => {
    const id = get().selectedTheme
    if (!id || get().themeBriefLoading) return
    set({ themeBriefLoading: true })
    try {
      const brief = await api.newsThemeBrief(id, true)
      if (get().selectedTheme === id) set({ themeBrief: brief, themeBriefLoading: false })
    } catch {
      if (get().selectedTheme === id) set({ themeBriefLoading: false })
    }
  },

  // ---- wire pulse + one-click launch (the swarm-generic wire's own actions) ----
  // Pull the per-subject pulse snapshot (price / positioning / next reports / last verdict) for the
  // active wire. TTL-gated (60s) so the news-cycle hook can call it freely; `force` on wire entry.
  // Failure keeps the prior snapshot — the strip degrades to its own quiet error state, never blanks.
  refreshWirePulse: async (force = false) => {
    const cfg = activeWireConfig(get())
    if (!cfg?.pulse) return
    const at = get().wirePulseAt
    if (!force && at && Date.now() - at < 60_000) return
    try {
      const snap = await api.swarmPulse(cfg.swarmId)
      if (!snap || get().activeSwarm !== cfg.swarmId) return // stale landing after a swarm switch
      set({ wirePulse: snap.subjects || {}, wirePulseAt: Date.now(), wirePulseStale: !!snap.stale })
    } catch { /* keep the prior snapshot */ }
  },

  // One-click "Run full ▸ <SUBJECT>" from the wire (reader launch bar / subject chips): select the
  // subject (loads its graph + last decision, exactly like the picker) then open the existing Run-full
  // confirm arc (estimate → LaunchConfirm → /<ns>:full <SUBJECT> → the constellation animates).
  requestFullForSubject: async (subject) => {
    if (!subject) return
    await get().selectTicker(subject)
    await get().requestFull()
  },

  // set an event aside / bring it back (local, persisted). If the shelved event is the open one, close it.
  toggleShelve: (eventId) => {
    const next = new Set(get().shelvedEvents)
    if (next.has(eventId)) next.delete(eventId)
    else next.add(eventId)
    saveShelf(next)
    const open = get().scSelectedEvent
    set({ shelvedEvents: next, ...(open && open.event_id === eventId && next.has(eventId) ? { scSelectedEvent: null } : {}) })
  },

  // mark one or many events read (opening an event, or "mark all read"). Idempotent — a no-op if nothing
  // new, so it never fires a needless re-render.
  markEventsRead: (ids) => {
    const cur = get().readEvents
    let next: Set<string> | null = null
    for (const id of ids) {
      if (!id || cur.has(id) || next?.has(id)) continue
      if (!next) next = new Set(cur)
      next.add(id)
    }
    if (!next) return
    saveRead(next)
    set({ readEvents: next })
  },
  // First-EVER visit only (gated by the persistent READ_SEEDED marker): fold everything already on the
  // wire into the read set so the user starts clean and only new arrivals show unread. On every later
  // visit this is a no-op, so genuine unread items are preserved across reloads.
  seedReadBaseline: (items) => {
    try {
      if (localStorage.getItem(READ_SEEDED_KEY)) return
      localStorage.setItem(READ_SEEDED_KEY, '1')
    } catch {
      return // storage blocked → skip seeding; unread simply tracks from now (worst case: some extra dots)
    }
    const next = new Set(get().readEvents)
    for (const it of items) if (it?.event_id) next.add(it.event_id)
    saveRead(next)
    set({ readEvents: next })
  },

  // submit card feedback: mark it flagged (optimistic, local display cache), persist to the server
  // ledger, and toast a confirmation with a short-window Undo. Rolled back on a failed save.
  // Returns true only when the ledger POST actually succeeded — the batch-review path relies on this to
  // decide whether to advance to the next card (a failed save must NOT silently skip a card).
  submitFeedback: async (input, polarity) => {
    if (get().staticMode) { get().setToast({ msg: 'Read-only showcase — feedback needs a live engine.', tone: 'info' }); return false }
    const pol = polarity ?? polarityOf(input.feedback_type) // `other` arrives with an explicit thumb; the rest derive
    // Snapshot the PRIOR state so a failed POST restores exactly what was there — re-rating an
    // already-rated event and hitting a network error must not wipe the rating it already had.
    const prevFlagged = get().flaggedEvents.has(input.event_id)
    const prevPol = get().ratedPolarity[input.event_id]
    // Only a 👎 is a "flag": the rail row's ⚑ means "I marked this as off". A 👍 lights no flag, and a
    // 👍 after a prior 👎 clears it — so `flaggedEvents` always reflects "currently rated down".
    const next = new Set(get().flaggedEvents)
    pol === 'down' ? next.add(input.event_id) : next.delete(input.event_id)
    const rated = { ...get().ratedPolarity, [input.event_id]: pol }
    saveFlagged(next)
    saveRated(rated)
    set({ flaggedEvents: next, ratedPolarity: rated })
    try {
      const { feedback } = await api.submitFeedback(input)
      get().setToast({
        msg: `Feedback saved — ${feedbackLabel(input.feedback_type)}`,
        tone: 'good',
        action: { label: 'Undo', onClick: () => void get().undoFeedbackFlow(feedback.feedback_id, input.event_id) },
      })
      return true
    } catch (e: any) {
      const rollback = new Set(get().flaggedEvents)
      prevFlagged ? rollback.add(input.event_id) : rollback.delete(input.event_id)
      const rolledRated = { ...get().ratedPolarity }
      if (prevPol) rolledRated[input.event_id] = prevPol
      else delete rolledRated[input.event_id]
      saveFlagged(rollback)
      saveRated(rolledRated)
      set({ flaggedEvents: rollback, ratedPolarity: rolledRated })
      get().setToast({ msg: e?.body?.error || e?.message || 'Could not save feedback', tone: 'bad' })
      return false
    }
  },
  undoFeedbackFlow: async (feedbackId, eventId) => {
    try {
      await api.undoFeedback(feedbackId)
      const next = new Set(get().flaggedEvents)
      next.delete(eventId)
      const rated = { ...get().ratedPolarity }; delete rated[eventId]
      saveFlagged(next)
      saveRated(rated)
      set({ flaggedEvents: next, ratedPolarity: rated })
      // Rewind batch review when THIS undo tombstones the card the queue just advanced past. reviewSubmit
      // already moved reviewIndex forward and counted the card, so an immediate Undo would otherwise leave
      // the card skipped and still counted as flagged. Only rewind when the panel is open AND the card
      // directly behind the cursor (reviewQueue[reviewIndex - 1]) is exactly this event — so a stray undo
      // of some OTHER (per-card FeedbackMenu) feedback never disturbs the queue position or the counter.
      const s = get()
      if (s.reviewOpen && s.reviewIndex > 0 && s.reviewQueue[s.reviewIndex - 1]?.event_id === eventId) {
        set({ reviewIndex: s.reviewIndex - 1, reviewSessionCount: Math.max(0, s.reviewSessionCount - 1) })
      }
      get().setToast({ msg: 'Feedback undone', tone: 'info' })
    } catch (e: any) {
      get().setToast({ msg: e?.body?.error || e?.message || 'Could not undo feedback', tone: 'bad' })
    }
  },

  // fast batch review: a focused queue over the CURRENT wire, snapshotted on open (and on every filter
  // change) so the queue stays stable while reviewing even as fresh items keep streaming into newsItems.
  openReview: () => {
    const filters = get().reviewFilters
    const covered = get().coveredTickers
    set({
      reviewOpen: true,
      reviewQueue: get().newsItems.filter((it) => matchesReviewFilters(it, filters, covered)),
      reviewIndex: 0,
      reviewSessionCount: 0,
    })
    if (covered.size === 0 && !get().staticMode) {
      api.coveredTickers().then((tickers) => {
        const coveredNow = new Set(tickers)
        // Re-filter the snapshot against the tickers that just arrived: the queue was built while the set was
        // still empty, so the "portfolio companies" filter would show nothing until the user toggled a filter.
        // Rebuild ONLY when that rebuild can actually matter and can't lose the reviewer's place:
        //   - the panel is still open, AND
        //   - the portfolio-companies filter is on (the ONLY filter whose result depends on coveredTickers —
        //     with it off, the queue is identical before and after, so a rebuild would just reset the index
        //     for no reason), AND
        //   - the reviewer is still at the initial position (reviewIndex === 0). Once they've advanced,
        //     re-snapping to 0 would throw them back to the start and re-present already-flagged/skipped
        //     cards, so we only refresh coveredTickers and leave their queue/position untouched.
        const s = get()
        if (s.reviewOpen && s.reviewFilters.portfolioCompanies && s.reviewIndex === 0) {
          set({ coveredTickers: coveredNow, reviewQueue: s.newsItems.filter((it) => matchesReviewFilters(it, s.reviewFilters, coveredNow)), reviewIndex: 0 })
        } else {
          set({ coveredTickers: coveredNow })
        }
      }).catch(() => {})
    }
  },
  closeReview: () => set({ reviewOpen: false }),
  setReviewFilters: (f) => {
    set({
      reviewFilters: f,
      reviewIndex: 0,
      reviewQueue: get().newsItems.filter((it) => matchesReviewFilters(it, f, get().coveredTickers)),
    })
  },
  // submit feedback for the item at the front of the queue, then advance — one code path shared by
  // both the mouse buttons and the keyboard shortcuts in ReviewPanel.
  reviewSubmit: async (feedbackType, reason) => {
    if (get().reviewSubmitting) return // one save in flight — a held key / double-click can't stack records
    const it = get().reviewQueue[get().reviewIndex]
    if (!it) return
    set({ reviewSubmitting: true })
    try {
      const ok = await get().submitFeedback(feedbackInputFromItem(it, feedbackType, reason))
      // Advance + count ONLY on a real save. A failed POST leaves the same card in front (with its
      // "could not save" toast) so the human can retry — it is never silently skipped with no ledger record.
      if (ok) set({ reviewIndex: get().reviewIndex + 1, reviewSessionCount: get().reviewSessionCount + 1 })
    } finally {
      set({ reviewSubmitting: false })
    }
  },
  // pure client-side advance — never calls the API, never counts toward the session counter.
  // No-op while a feedback save is in flight: reviewSubmit advances on success, so a skip pressed BEFORE
  // that POST returns would advance the index once here and once again when the save resolves — skipping
  // one card with no ledger record. Blocking skip during the in-flight window keeps the queue in lockstep
  // with the one save reviewSubmit already guards.
  reviewSkip: () => {
    if (get().reviewSubmitting) return
    set({ reviewIndex: get().reviewIndex + 1 })
  },

  // fetch (once, then cache) the on-demand enrichment for an opened event. Keyed by event_id;
  // a 'loading' sentinel prevents duplicate in-flight fetches. A FAILED or DEGRADED result is NOT cached as
  // final — reopening the event re-fires the fetch (the human's retry actually retries). Never throws into UI.
  fetchEnrichment: async (it) => {
    const cur = get().enrichCache[it.event_id]
    if (cur === 'loading') return // a fetch is already in flight
    // Only stop refetching once the server says the read is COMPLETE (a rich brief, an SEC parse, a filing
    // floor, or retries exhausted). A degraded read — where the article body read momentarily missed and we
    // fell back to a thin dek — re-fires on reopen, so a transient miss can't freeze a useless story. The
    // server's short degraded TTL + background heal mean the retry returns the real read.
    if (cur && cur.complete) return
    set({ enrichCache: { ...get().enrichCache, [it.event_id]: 'loading' } })
    try {
      const enrichment = await api.enrichEvent(it)
      set({ enrichCache: { ...get().enrichCache, [it.event_id]: enrichment } })
      // A body read can floor this item's rank the moment it lands (news/impact-floor.ts) — patch the wire
      // row the reader is already looking at immediately, instead of leaving it showing its stale
      // headline-only score until a later full feed refetch (Codex review, PR #350).
      const rescored = enrichment.rescored
      if (rescored) {
        set({
          newsItems: get().newsItems.map((row) =>
            row.event_id === it.event_id
              ? { ...row, triage_score: rescored.rank_score, band: rescored.band, rank_factors: rescored.rank_factors }
              : row,
          ),
        })
      }
    } catch (e: any) {
      // The server always returns SOMETHING within its budget, so a throw here means the request itself
      // failed (timeout / network / tunnel blip). DON'T drop the entry back to undefined — that re-renders
      // the "Reading the article…" shimmer with no fetch in flight, i.e. it hangs forever (the original
      // bug). Cache an honest headline-only fallback so THE STORY always shows something; ok:false keeps it
      // non-sticky, so reopening the event re-fires the fetch (the human's retry actually retries).
      const fallback: EventEnrichment = {
        event_id: it.event_id,
        ok: false,
        fetched_at: new Date().toISOString(),
        prior_coverage: [],
        related: [],
        summary: it.headline ? `Couldn’t reach the reader just now. From the headline: ${displayHeadline(it)}` : undefined,
        note: 'The article read timed out or the source was unreachable — open the source to read it. Reopening this event retries the read.',
      }
      set({ enrichCache: { ...get().enrichCache, [it.event_id]: fallback } })
    }
  },

  // Run the paid gauntlet straight from a wire event: map the FeedItem to the intake schema and reuse
  // submitSignal (which selects the new signal + animates the orbs). Clearing the read view first means
  // the main stage swaps from the event detail to the constellation as soon as the run begins.
  runEventChecks: async (it, until, override) => {
    // bail BEFORE tearing down the reader — submitSignal no-ops (toast only) in static/offline, and clearing
    // first would drop the user back to the empty constellation on a confusing no-op, losing their place.
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    set({ scSelectedEvent: null })
    // keep the ORIGINAL headline as the signal headline so the Gate-0 event_id matches the wire item
    // (the recipe hashes headline|url); hand the English translation to the gauntlet as body context.
    const orig = originalHeadline(it)
    await get().submitSignal({
      headline: it.headline,
      source_url: it.url || undefined,
      source_name: it.source_name || undefined,
      input_nature: it.input_nature || 'news_headline',
      body_text: [orig ? `English translation of the headline: ${displayHeadline(it)}` : null, it.triage_reason].filter(Boolean).join('\n') || undefined,
      // human override: force a PARK/LOG-bound signal past the promotion gate (signal-gate reads this and
      // routes PROMOTE, recording the override). Only set when the user explicitly picks "Override" — never
      // by default, so the gauntlet's own routing stands untouched for a normal run.
      override_promote: override || undefined,
    }, until) // until = target module to run THROUGH then stop (undefined = the full gauntlet)
  },

  // Escalate a surfaced idea into the paid gauntlet. Fire the launch, then refresh the board so the card
  // flips to "In the machine" (the server stamped the snapshot promoted). Re-throws so the card can show a
  // failure inline — a paid launch that didn't happen must never look like it did.
  scPromoteIdea: async (idea) => {
    if (isLaunchHealthBlocked(get().health)) {
      throw new Error(get().health === 'updating'
        ? 'Engine update in progress — the idea was not promoted.'
        : 'Engine offline — the idea was not promoted.')
    }
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) throw new Error(`${providerProblem}. Choose another run provider.`)
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) throw new Error('The selected execution profile could not be frozen. Check the provider again.')
    const out = await api.promoteIdea(idea.idea_id, execution)
    if (!trackedLaunchResponseMatches(out, execution, get().providers.catalogState, out.alreadyPromoted === true)) {
      throw Object.assign(new Error('The engine did not return an exact provider receipt for the promoted run.'), { body: { code: 'provider_receipt_mismatch' } })
    }
    if (out.alreadyPromoted !== true) revealAcceptedTrackedLaunch(set, get)
    await get().scRefreshBoard()
  },
  // 👍/👎 a surfaced idea — the self-grading loop. Optimistic (the thumb reacts instantly), then persist +
  // refresh so the board's scorecard + any decay change land. Reverts by refetch on failure.
  scRateIdea: async (idea, polarity, reason) => {
    const next = polarity === 'clear' ? null : polarity
    set((s) => (s.scBoard && Array.isArray(s.scBoard.ideas)
      ? { scBoard: { ...s.scBoard, ideas: s.scBoard.ideas.map((i) => (i.idea_id === idea.idea_id ? { ...i, feedback: next } : i)) } }
      : {}))
    try {
      await api.rateIdea(idea.idea_id, polarity, reason)
    } catch {
      await get().scRefreshBoard() // revert the optimistic vote to the server's truth
      return
    }
    // On success keep the optimistic vote; the periodic poll reads the live snapshot/feedback projection
    // and reconciles the scorecard without depending on the deferred generated-board rebuild.
  },

  scRefreshBoard: async (propagateColdFailure = false, bootstrapEpoch?: number) => {
    // Every board read has a screener owner, including ordinary manual/news/SSE refreshes. Capturing the
    // current epoch prevents a response started on Screener from repopulating its cache after navigation.
    const ownerEpoch = bootstrapEpoch ?? screenerOwnershipEpoch
    const stillOwnsBootstrap = () => get().activeSwarm === 'screener' && screenerOwnershipEpoch === ownerEpoch
    if (!stillOwnsBootstrap()) return
    const generation = ++scBoardFetchGeneration
    // A cold fetch owns the skeleton. A background refresh keeps the last board and any prior failure
    // visible until a successful response replaces both; clicking Retry must not briefly paint green.
    set((s) => ({
      scBoardFetch: {
        ...s.scBoardFetch,
        status: s.scBoard ? 'refreshing' : 'loading',
        error: s.scBoard ? s.scBoardFetch.error : null,
      },
    }))
    try {
      const scBoard = await api.screenerBoard()
      if (generation !== scBoardFetchGeneration || !stillOwnsBootstrap()) return
      set({ scBoard, scBoardFetch: { status: 'ready', error: null, lastSuccessAt: Date.now() } })
      // a partial run the engine forgot (it came back after a break) shows up here as resumable — pick
      // it back up on its own so the user never has to hunt for a "failed" run and click Continue.
      void get()._maybeAutoResume(scBoard.resumable)
    } catch (e: any) {
      if (generation !== scBoardFetchGeneration || !stillOwnsBootstrap()) return
      const message = typeof e?.message === 'string' && e.message ? e.message : 'The board request failed.'
      set((s) => ({ scBoardFetch: { status: 'error', error: message, lastSuccessAt: s.scBoardFetch.lastSuccessAt } }))
      // Keep every ordinary refresh's long-standing resolve-and-render-error contract. Only scInit opts
      // into rejection, and only when no prior board can keep the stage usable while a refresh recovers.
      if (propagateColdFailure && !get().scBoard) throw e
    }
  },

  // Auto-resume every interrupted (non-terminal, non-aborted) partial run the server surfaced. Fires on
  // each board fetch (cockpit open, reconnect, the live-book's 30s tick), so a run resumes the moment the
  // connection is back. Capped + cooled-down so a genuinely-broken run can't loop, and capacity rejects
  // are retried (not counted) on the next fetch. The selected run animates; the rest run in the background.
  _maybeAutoResume: async (resumable) => {
    if (get().staticMode || isLaunchHealthBlocked(get().health) || get().activeSwarm !== 'screener') return
    const ownerEpoch = screenerOwnershipEpoch
    const stillOwnsResume = () => get().activeSwarm === 'screener'
      && screenerOwnershipEpoch === ownerEpoch
      && !get().staticMode
      && !isLaunchHealthBlocked(get().health)
    const list = (resumable || []).filter((r) => {
      const t = autoResumeTries.get(r.sigId)
      if (t && t.count >= AUTO_RESUME_MAX) return false // gave up — manual Continue from here
      if (t && Date.now() - t.lastAt < AUTO_RESUME_COOLDOWN_MS) return false // still cooling down
      return true
    })
    if (!list.length) return
    let resumed = 0
    for (const r of list.slice(0, AUTO_RESUME_BATCH)) {
      if (!stillOwnsResume()) break
      const prev = autoResumeTries.get(r.sigId)
      autoResumeTries.set(r.sigId, { count: (prev?.count || 0) + 1, lastAt: Date.now() })
      try {
        const recorded = get().resumableRuns.find((entry) => entry.kind === 'signal' && entry.subject === r.sigId)
        const hold = () => {
          if (prev) autoResumeTries.set(r.sigId, prev)
          else autoResumeTries.delete(r.sigId)
        }
        // Automatic continuation requires two agreeing authorities: the live board row and the disk-truth
        // resumable projection. Provider-only rows, missing profiles, profile drift, and any disagreement
        // stay paused for a human; none may be guessed into Claude or a current catalogue profile.
        if (!recorded) { hold(); continue }
        const records: RecordedRunExecution[] = [
          { provider: isRunProvider(r.provider) ? r.provider : undefined, executionProfile: r.executionProfile, source: 'board' },
          { provider: isRunProvider(recorded.provider) ? recorded.provider : undefined, executionProfile: recorded.executionProfile, source: 'disk' },
        ]
        const provider = isRunProvider(recorded.provider) ? recorded.provider : undefined
        if (!provider) { hold(); continue }
        // A quota pause is owned by the server supervisor. The browser may continue it only when the
        // server explicitly says this exact item is due in both board and disk projections; absent or
        // contradictory rolling-deploy metadata fails closed.
        if ((r.reason === 'out_of_credits' || recorded?.reason === 'out_of_credits')
            && (r.autoResumeDue !== true || recorded?.autoResumeDue !== true)) {
          hold()
          continue
        }
        const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
        if (providerProblem) { hold(); continue }
        const execution = captureProviderLaunch(get(), provider)
        if (!execution || !automaticResumeMatches(records, execution)) { hold(); continue }
        const out = await api.launchSignal(execution, { sigId: r.sigId })
        requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
        revealAcceptedTrackedLaunch(set, get)
        const { runId } = out
        resumed++ // the server accepted it even if the user navigated while this await was pending
        if (!stillOwnsResume()) break
        // if this is the run the user is watching, keep its finished orbs and re-queue the rest so the
        // constellation animates exactly where it stopped (mirrors continueSignal). Background runs just
        // run server-side; the board reflects them on the next fetch (we don't wire their SSE into the
        // selected constellation, whose orb keys are module-relative and would collide).
        if (get().scSelectedSignal === r.sigId) {
          const done = { ...get().scRuntime }
          const rt: Record<string, NodeRuntime> = {}
          for (const k of get().scNodesByKey.keys()) rt[k] = done[k]?.status === 'done' ? done[k] : { status: 'queued', runId }
          set({ scRuntime: rt })
          connectScreenerRun(get, runId, r.sigId)
        }
      } catch (e: any) {
        // no slot right now (cap) or it's already in flight — not a real failure; un-count so the next
        // board fetch retries it as soon as capacity frees, instead of burning a try.
        const code = e?.body?.code
        if (code === 'capacity' || code === 'exclusivity') {
          if (prev) autoResumeTries.set(r.sigId, prev)
          else autoResumeTries.delete(r.sigId)
        }
        if (!stillOwnsResume()) break
      }
    }
    if (resumed) void get().refreshActiveRuns() // global activity truth still matters after navigation
    if (resumed && stillOwnsResume()) {
      get().setToast({
        msg: resumed === 1 ? 'Resuming an interrupted run — picking up where the connection dropped' : `Resuming ${resumed} interrupted runs — picking up where they left off`,
        tone: 'good',
      })
    }
  },

  // load one signal's run folder onto the gauntlet: seed orb states from its saved outputs
  scSelectSignal: async (sigId, bootstrapEpoch?: number) => {
    const ownerEpoch = bootstrapEpoch ?? screenerOwnershipEpoch
    const stillOwnsBootstrap = () => get().activeSwarm === 'screener' && screenerOwnershipEpoch === ownerEpoch
    if (!stillOwnsBootstrap()) return
    // Epoch ownership prevents writes after navigation; this generation also orders overlapping reads
    // inside the same Screener visit. Two requests for the same signal are otherwise indistinguishable,
    // so an older response could clear the newer recovery intent or replace its runtime.
    const generation = ++screenerSignalFetchGeneration
    const stillOwnsRequest = () => generation === screenerSignalFetchGeneration
      && get().scSelectedSignal === sigId
      && stillOwnsBootstrap()
    // Every owned signal read carries rehydration intent, not only cold bootstrap reads. If navigation or
    // session expiry invalidates the request after we clear runtime, returning to Screener must retry it.
    screenerSignalHydrationPending = sigId
    // a different signal is a different run — reset chat state exactly like selectTicker does, so an open
    // (or saved) conversation can't keep posting against the signal it was opened for after the board moves
    // on to another one (cross-run answer contamination: wrong SIG context + wrong saved thread/id).
    chatPendingBaseline = null
    chatAbort?.abort(); chatAbort = null
    set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {}, ...CHAT_RESET })
    if (!sigId) return
    try {
      const m = await api.screenerRun(sigId)
      if (!stillOwnsRequest()) return
      const seed: Record<string, NodeRuntime> = {}
      const routed: Record<string, { route: string; terminal: boolean }> = {}
      for (const [mod, agents] of Object.entries<any>(m?.modules || {})) {
        for (const a of agents) {
          seed[a.agentKey] = { status: 'done', verdict: a.verdict, outputPath: `${m.runRoot}/${a.agentKey}.md` }
          if (a.routing) routed[mod] = { route: a.routing, terminal: isTerminalRoute(a.routing) }
        }
      }
      // thesis status is the authoritative switchyard light once Phase 1 locked
      const status = m?.thesisRecord?.meta?.status
      if (status) routed['__thesis__'] = { route: status, terminal: true }
      set({ scRuntime: seed, scRouted: routed })
      if (stillOwnsRequest() && screenerSignalHydrationPending === sigId) screenerSignalHydrationPending = null
    } catch (error) {
      if (!stillOwnsRequest()) return
      set({ scRuntime: {}, scRouted: {} })
      // An authoritative client error (for example, a genuinely missing saved run) ends hydration. Keep
      // intent only for network/gateway/rate-limit and Access-session failures that may heal later.
      if (!shouldPreserveSwarmDiscovery(false, error) && screenerSignalHydrationPending === sigId) {
        screenerSignalHydrationPending = null
      }
      // During scInit, a transient saved-run failure is a failed bootstrap, not an empty successful
      // gauntlet. Propagate it into scInit's handled retry path; explicit 4xx absence remains fail-closed.
      if (bootstrapEpoch !== undefined && stillOwnsBootstrap() && isTransientBootstrapFailure(error)) throw error
    }
  },

  scNodeStatus: (key) => {
    const rt = get().scRuntime[key]
    if (rt) return rt.status
    return get().scSelectedSignal ? 'dormant' : 'dormant'
  },

  // ---- ask the saved news wire ----
  openNewsChat: () => {
    chatResumeSeq++
    if (get().chatOpen || get().chatStreaming) get().closeChat()
    set({ chatHistoryOpen: false, newsChatOpen: true })
  },
  closeNewsChat: () => {
    newsChatAbort?.abort()
    newsChatAbort = null
    const completed = get().newsChatCompletedTurn
    const rollback = newsChatPendingBaseline
    newsChatPendingBaseline = null
    set({
      newsChatOpen: false,
      newsChatStreaming: false,
      ...(rollback ? { newsChatMessages: rollback.messages, newsChatConversationId: rollback.conversationId } : {}),
      newsChatReceipt: completed?.receipt,
      newsChatEvidence: completed?.evidence || [],
      newsChatError: undefined,
      newsChatRetryText: undefined,
      newsChatRetryTurnId: undefined,
    })
  },
  setNewsChatWindow: (window) => {
    if (window === get().newsChatWindow) return
    newsChatAbort?.abort(); newsChatAbort = null
    newsChatPendingBaseline = null
    set({ newsChatWindow: window, newsChatMessages: [], newsChatStreaming: false, newsChatError: undefined, newsChatReceipt: undefined, newsChatEvidence: [], newsChatCompletedTurn: undefined, newsChatRetryText: undefined, newsChatRetryTurnId: undefined, newsChatConversationId: undefined })
  },
  clearNewsChat: () => {
    newsChatAbort?.abort(); newsChatAbort = null
    newsChatPendingBaseline = null
    set({ newsChatMessages: [], newsChatStreaming: false, newsChatError: undefined, newsChatReceipt: undefined, newsChatEvidence: [], newsChatCompletedTurn: undefined, newsChatRetryText: undefined, newsChatRetryTurnId: undefined, newsChatConversationId: undefined })
  },
  sendNewsChatMessage: async (text, retryTurnId) => {
    const q = text.trim()
    if (!q || get().newsChatStreaming) return
    if (get().staticMode) { set({ newsChatError: 'static-deploy' }); return }
    // Keep the local transcript and the request below the server's 30-message hard limit. A completed
    // turn is two messages, so retaining 28 leaves room for the user + assistant placeholders.
    const baseline = get().newsChatMessages.slice(-(NEWS_CHAT_MAX_MESSAGES - 2))
    const baselineConversationId = get().newsChatConversationId
    const previousCompleted = get().newsChatCompletedTurn
    const turnId = retryTurnId || newChatTurnId()
    const userMessage: ChatMessage = { role: 'user', content: q, turnId }
    set({
      newsChatMessages: [...baseline, userMessage, { role: 'assistant', content: '' }],
      newsChatStreaming: true,
      newsChatError: undefined,
      newsChatReceipt: undefined,
      newsChatEvidence: [],
      newsChatRetryText: undefined,
      newsChatRetryTurnId: undefined,
    })
    const idx = baseline.length + 1
    newsChatAbort?.abort()
    const controller = new AbortController()
    newsChatAbort = controller
    newsChatPendingBaseline = { messages: baseline, conversationId: baselineConversationId }
    let turnReceipt: NewsChatReceipt | undefined
    let turnEvidence: NewsChatEvidence[] = []
    let settled = false
    const fail = (msg: string) => {
      if (settled || newsChatAbort !== controller || controller.signal.aborted) return
      settled = true
      newsChatAbort = null
      newsChatPendingBaseline = null
      set({
        newsChatMessages: baseline,
        newsChatConversationId: baselineConversationId,
        newsChatStreaming: false,
        newsChatError: msg,
        newsChatRetryText: q,
        newsChatRetryTurnId: turnId,
        newsChatReceipt: previousCompleted?.receipt,
        newsChatEvidence: previousCompleted?.evidence || [],
      })
    }
    await api.newsChatStream(
      {
        window: get().newsChatWindow, model: get().chatModel,
        conversationId: baselineConversationId, turnId, title: 'Ask · news wire',
        messages: [...baseline, userMessage].slice(-NEWS_CHAT_MAX_MESSAGES),
      },
      {
        signal: controller.signal,
        onMeta: (m) => {
          if (newsChatAbort !== controller || controller.signal.aborted) return
          turnReceipt = m.receipt
          turnEvidence = m.evidence
          set({ newsChatReceipt: m.receipt, newsChatEvidence: m.evidence, ...(m.conversationId ? { newsChatConversationId: m.conversationId } : {}) })
        },
        onToken: (tok) => {
          if (newsChatAbort !== controller || controller.signal.aborted) return
          const msgs = get().newsChatMessages.slice()
          if (msgs[idx]?.role === 'assistant') { msgs[idx] = { ...msgs[idx], content: msgs[idx].content + tok }; set({ newsChatMessages: msgs }) }
        },
        onDone: () => {
          if (settled || newsChatAbort !== controller || controller.signal.aborted) return
          const answer = get().newsChatMessages[idx]?.content.trim() || ''
          if (!answer || !turnReceipt) { fail('News chat ended before the answer completed. Please retry.'); return }
          settled = true
          newsChatAbort = null
          newsChatPendingBaseline = null
          const msgs = get().newsChatMessages.slice()
          if (msgs[idx]?.role === 'assistant') msgs[idx] = { ...msgs[idx], turnId, memory: { kind: 'news-wire', window: get().newsChatWindow, receipt: turnReceipt, evidence: turnEvidence } }
          set({
            newsChatMessages: msgs,
            newsChatStreaming: false,
            newsChatError: undefined,
            newsChatRetryText: undefined,
            newsChatRetryTurnId: undefined,
            newsChatCompletedTurn: { question: q, answer, receipt: turnReceipt, evidence: turnEvidence },
          })
        },
        onError: fail,
      },
    )
    if (!settled && newsChatAbort === controller && !controller.signal.aborted) fail('News chat ended before the answer completed. Please retry.')
  },
  sendNewsChatToSignalCheck: () => {
    const turn = get().newsChatCompletedTurn
    if (!turn || get().newsChatStreaming) return
    const { answer, question, receipt, evidence: allEvidence } = turn
    const refs = new Set([...answer.matchAll(/\[((?:N|H)\d+)\]/g)].map((m) => m[1]))
    const citedEvidence = refs.size ? allEvidence.filter((e) => refs.has(e.ref)) : allEvidence.slice(0, 8)
    const topCandidate = receipt.tradeCandidates?.[0]
    const candidateRefs = new Set(topCandidate?.evidenceRefs || [])
    const candidateEvidence = allEvidence.filter((e) => candidateRefs.has(e.ref))
    // If the receipt promotes a strict top candidate, its own evidence anchors both Gate 0 and the note.
    // Never describe candidate A while silently seeding candidate B from a lower-ranked row.
    const evidence = (candidateEvidence.length
      ? [...new Map([...candidateEvidence, ...citedEvidence].map((row) => [row.ref, row])).values()]
      : citedEvidence).slice(0, 14)
    const tradeCandidate = candidateEvidence.length ? topCandidate : undefined
    const sourceLines = evidence.map((e) => `[${e.ref}] ${e.item.source_name}, ${e.item.ts}: ${displayHeadline(e.item)} — ${e.item.url || e.item.event_id}`)
    const sourcesText = sourceLines.join('\n').slice(0, 1200)
    const note = [
      `Question: ${question}`,
      '',
      'News-chat answer:',
      answer.slice(0, 2500),
      '',
      'Evidence used:',
      sourcesText || 'No cited news item was found in the answer.',
      ...(tradeCandidate ? [
        '',
        `Strict chat rank: ${tradeCandidate.ticker} ${tradeCandidate.score}/100 (${tradeCandidate.readiness}; ${tradeCandidate.direction}).`,
        `Still needs: ${tradeCandidate.missingChecks.join('; ') || 'none listed'}.`,
      ] : []),
    ].join('\n').slice(0, 3950)
    // When the answer cites a real saved event, keep that source as Gate 0's anchor. The question and
    // answer travel as body text. Falling back to a human prompt remains honest when no cited URL exists.
    const usableEvidence = (topCandidate ? candidateEvidence : evidence)
      .filter((e) => e.item.url && e.item.source_name)
    const anchor = selectNewsChatHandoffEvidence(usableEvidence, receipt)
    get().openSignalIntakeWith(anchor ? {
      headline: anchor.item.headline.slice(0, 500),
      source_url: anchor.item.url,
      source_name: anchor.item.source_name,
      input_nature: signalNatureFromNews(anchor.item.input_nature),
      body_text: note,
    } : {
      headline: question.length >= 8 ? question.slice(0, 500) : `News idea: ${question}`.slice(0, 500),
      input_nature: 'human_prompt',
      human_prompt_note: note,
    })
  },

  openSignalIntake: () => set({ signalIntakeOpen: true, signalIntakeSeed: null }),
  openSignalIntakeWith: (seed) => set({ signalIntakeOpen: true, signalIntakeSeed: seed }),
  closeSignalIntake: () => set({ signalIntakeOpen: false, signalIntakeSeed: null }),

  submitSignal: async (intake, until) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ launchPending: { key: 'signal:intake', label: 'Starting the checks…', ticker: '' } })
    try {
      const out = await api.launchSignal(execution, { intake, until })
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      const { runId, preflight } = out
      set({ signalIntakeOpen: false, signalIntakeSeed: null })
      const sigId = preflight.ticker
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {} })
      beginScreenerRun(set, get, runId, { subject: sigId, swarmId: 'screener', execution })
      get().setToast({ msg: `Checks started for ${sigId} — watch them run left to right`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not start the checks', tone: e?.body?.code ? 'info' : 'bad' })
    } finally {
      set({ launchPending: null })
    }
  },

  // re-run an existing signal (e.g. a PARK the human overrides, or an inbox row promoted to a run)
  relaunchSignal: async (sigId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ launchPending: { key: `signal:${sigId}`, label: `Starting the checks for ${sigId}…`, ticker: sigId } })
    try {
      const out = await api.launchSignal(execution, { sigId })
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      const { runId } = out
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {}, pipelineOpen: false })
      beginScreenerRun(set, get, runId, { subject: sigId, swarmId: 'screener', execution })
      get().setToast({ msg: `Re-running the checks for ${sigId}`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not start the checks', tone: e?.body?.code ? 'info' : 'bad' })
    } finally {
      set({ launchPending: null })
    }
  },

  // RESUME a stopped run: relaunch the same signal but KEEP the orbs that already finished (the gauntlet
  // command skips any module whose synthesis is already on disk, so only the remaining orbs actually run).
  // Unlike relaunchSignal (a clean restart), this preserves the done orbs so the constellation picks up
  // exactly where it stopped — 3 done, the rest queued → running.
  continueSignal: async (sigId, until, override) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const disk = get().resumableRuns.find((entry) => entry.kind === 'signal' && entry.subject === sigId)
    const board = get().scBoard?.resumable?.find((entry) => entry.sigId === sigId)
    const records: RecordedRunExecution[] = [
      ...(board ? [{ provider: isRunProvider(board.provider) ? board.provider : undefined, executionProfile: board.executionProfile, source: 'board' }] : []),
      ...(disk ? [{ provider: isRunProvider(disk.provider) ? disk.provider : undefined, executionProfile: disk.executionProfile, source: 'disk' }] : []),
    ]
    const recorded = records.map((record) => record.provider).filter(isRunProvider)
    const execution = await captureAvailableResumeLaunch(get, recorded)
    if (!execution) return get().setToast({ msg: 'No verified provider/model is available to resume these checks. Check Claude or Codex and try again.', tone: 'bad' })
    const progress = disk || board
    set({
      resumeConfirm: {
        kind: 'signal', sigId, until, override, selection: execution, records,
        label: board?.headline || disk?.label || sigId,
        doneCount: progress?.doneCount || 0,
        totalCount: progress?.totalCount || 0,
        unit: 'module',
      },
    })
  },

  // Read (and cache) the run-state of an opened event's signal, so the "Run the checks" split button can pick
  // the right primary action + status badge. A lazy GET keyed by event_id, refreshed on each open. The server
  // derives the SIG-id the SAME way a launch would (headline|url|today) and reports never / running / parked /
  // logged / watchlist / partial / complete. Read-only: touches no run, spends nothing. Never throws into UI.
  fetchSignalState: async (it) => {
    const key = it.event_id
    if (signalStateInFlight.has(key)) return // a read is already in flight for this event
    signalStateInFlight.add(key)
    // Only show the 'loading' sentinel on the FIRST read (no prior value). On a REFETCH (after resume/stop, or
    // a reopen) keep the last-known state visible so the reader never flashes back to the "never / Run the
    // checks" default over a signal that is actually running/parked/complete.
    const prior = get().scSignalState[key]
    if (prior === undefined) set({ scSignalState: { ...get().scSignalState, [key]: 'loading' } })
    try {
      // api.signalState short-circuits to { state:'never' } in static/offline, so no mode guard is needed here
      const st = await api.signalState({ headline: it.headline, sourceUrl: it.url || undefined })
      set({ scSignalState: { ...get().scSignalState, [key]: st } })
    } catch {
      // On the first read, don't leave a stuck 'loading' — drop the key so a reopen retries. On a refetch,
      // leave the last-known value in place (a transient probe blip shouldn't blank a good badge).
      if (prior === undefined) {
        const m = { ...get().scSignalState }
        delete m[key]
        set({ scSignalState: m })
      }
    } finally {
      signalStateInFlight.delete(key)
    }
  },

  // Stop an in-flight signal run from the split button's "Cancel" action. Cancels by SUBJECT (every run for
  // this SIG-id), mirroring cancelRun's subject path, then reconciles the live set + the board so the badge
  // and the constellation reflect the stop. Best-effort: a 404 means it already ended (success, not failure).
  cancelSignalRun: async (sigId) => {
    if (get().staticMode || HARD_DOWN.has(get().health)) return
    try {
      const { cancelled } = await api.cancelSubject('screener', sigId)
      void get().refreshActiveRuns()
      void get().scRefreshBoard()
      // cancelSubject is idempotent — it returns 200 { cancelled: [] } when nothing matched (it does not
      // 404), so only claim a stop when one actually happened. A Stop clicked after the run already ended
      // (or a self-finish race) otherwise shows a false "Stopped the checks" confirmation.
      if (cancelled.length) get().setToast({ msg: `Stopped the checks for ${sigId}`, tone: 'info' })
    } catch (e: any) {
      if (e?.status === 404) {
        void get().refreshActiveRuns()
        void get().scRefreshBoard()
        return
      }
      get().setToast({ msg: `Couldn't stop the run: ${e?.message || 'the request failed'}`, tone: 'bad' })
    }
  },

  runSweep: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — sweeps run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ launchPending: { key: 'sweep', label: 'Starting the news scan…', ticker: 'sweep' } })
    try {
      const out = await api.launchSweep(execution)
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      const { runId } = out
      scSweepWatch.add(runId) // tag this run so run-done/run-error give it sweep copy, not signal copy
      beginScreenerRun(set, get, runId, { subject: 'sweep', swarmId: 'screener', execution })
      // open the wire so the scan is watchable AS it runs — the visibility surface, not a black box
      void get().openNewsFeed()
      get().setToast({ msg: 'Scanning for news — watch it come in on the wire; new leads land in the Inbox.', tone: 'good' })
    } catch (e: any) {
      // A launch REJECTION (admission/pre-flight) carries a structured body.code → an expected block (e.g.
      // a sweep already running), shown calm. Anything else is a real failure. Either way, say what it is.
      get().setToast({ msg: e?.message ? String(e.message) : 'The news scan could not start', tone: e?.body?.code ? 'info' : 'bad' })
    } finally {
      set({ launchPending: null })
    }
  },

  openPipeline: () => {
    set({ pipelineOpen: true, newsFeedOpen: false, diagnosticsOpen: false }) // one overlay at a time — the wire yields to the board
    void get().scRefreshBoard()
  },
  closePipeline: () => set({ pipelineOpen: false, scThesisDetail: null }),
  setBookFilters: (f) => set({ scBookFilters: f }),
  setBookSort: (s) => set({ scBookSort: s }),
  setBookArchivedOpen: (v) => set({ scBookArchivedOpen: v }),

  openThesisDetail: async (thesisId) => {
    try {
      const d = await api.screenerThesis(thesisId)
      set({ scThesisDetail: d })
    } catch {
      get().setToast({ msg: 'Could not open this idea', tone: 'bad' })
    }
  },
  closeThesisDetail: () => set({ scThesisDetail: null }),

  // One-click un-discard: re-open an archived (killed/expired) idea onto the live book. The discard is
  // a SOFT discard — the engine flips its snapshot back and records the recover; the board rebuilds.
  restoreConviction: async (thesisId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — restores run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — try again once it reconnects.', tone: 'info' })
    try {
      await api.convictionRestore(thesisId)
      get().setToast({ msg: 'Idea restored to the live book', tone: 'good' })
      await get().scRefreshBoard()
      const d = get().scThesisDetail
      if (d?.thesis?.meta?.thesis_id === thesisId) await get().openThesisDetail(thesisId)
    } catch (e: any) {
      get().setToast({ msg: e?.message || 'Could not restore', tone: 'bad' })
    }
  },

  // Soft-delete: hide one idea from the live book (an append-only override; the engine's ledger/run are
  // untouched, so it's reversible). Optimistic — the card leaves at once — with an inline Undo, and the
  // board is reconciled from the server after, which also un-does the optimistic hide if the call failed.
  hideIdea: async (signalId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — actions run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — try again once it reconnects.', tone: 'info' })
    set((s) => ({ scBoard: s.scBoard ? { ...s.scBoard, signals: s.scBoard.signals.map((sig) => (sig.signal_id === signalId ? { ...sig, hidden: true } : sig)) } : s.scBoard }))
    try {
      await api.hideSignal(signalId, 'hide')
      get().setToast({ msg: 'Idea hidden from your book', tone: 'info', action: { label: 'Undo', onClick: () => void get().restoreIdea(signalId) } })
    } catch (e: any) {
      set((s) => ({ scBoard: s.scBoard ? { ...s.scBoard, signals: s.scBoard.signals.map((sig) => (sig.signal_id === signalId ? { ...sig, hidden: false } : sig)) } : s.scBoard }))
      get().setToast({ msg: e?.message || 'Could not hide the idea', tone: 'bad' })
    }
    await get().scRefreshBoard()
  },
  restoreIdea: async (signalId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — actions run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — try again once it reconnects.', tone: 'info' })
    set((s) => ({ scBoard: s.scBoard ? { ...s.scBoard, signals: s.scBoard.signals.map((sig) => (sig.signal_id === signalId ? { ...sig, hidden: false } : sig)) } : s.scBoard }))
    try {
      await api.hideSignal(signalId, 'restore')
      get().setToast({ msg: 'Idea restored to your book', tone: 'good' })
    } catch (e: any) {
      set((s) => ({ scBoard: s.scBoard ? { ...s.scBoard, signals: s.scBoard.signals.map((sig) => (sig.signal_id === signalId ? { ...sig, hidden: true } : sig)) } : s.scBoard }))
      get().setToast({ msg: e?.message || 'Could not restore the idea', tone: 'bad' })
    }
    await get().scRefreshBoard()
  },
  // Force a server-side board rebuild from the live ledger (picks up runs that finished since the last
  // snapshot), then swap in the fresh board. Falls back to a plain re-read if the rebuild endpoint fails.
  scRebuildBoard: async () => {
    if (get().staticMode) return get().scRefreshBoard()
    try {
      set({ scBoard: await api.rebuildBoard() })
    } catch {
      await get().scRefreshBoard()
    }
  },

  // The handoff: seed data/<TICKER>/ from the locked thesis (idempotent server-side), then warp to
  // the research swarm with the ticker preselected. The research run itself stays a separate,
  // human-confirmed launch — if the pool already has filings we open the full-run confirm on landing.
  sendToResearch: async (thesisId, ticker, poolPresent) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — handoffs run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    set({ launchPending: { key: `handoff:${thesisId}:${ticker}`, label: `Sending ${ticker} to research…`, ticker } })
    try {
      const res = await api.handoff(thesisId, ticker, execution)
      if (!trackedLaunchResponseMatches(res, execution, get().providers.catalogState, res.alreadyHandedOff === true)) {
        throw Object.assign(new Error('The engine did not return an exact provider receipt for the handoff run.'), { body: { code: 'provider_receipt_mismatch' } })
      }
      if (res.alreadyHandedOff !== true) revealAcceptedTrackedLaunch(set, get)
      const already = res.alreadyHandedOff
      set({ pipelineOpen: false, scThesisDetail: null })
      get().switchSwarm('research', { payloadTicker: ticker, landTicker: poolPresent ? ticker : undefined })
      if (already) {
        get().setToast({ msg: `${ticker} was already sent — its idea memo is in place. ${poolPresent ? 'Start the research run when ready.' : 'Add its filings to the data folder first.'}`, tone: 'info' })
      } else {
        // The API returns at CLI spawn, not at memo/ledger completion — say "started", and attach
        // the run stream so run-done can confirm "saved" truthfully (see _handleScreenerEvent).
        if (res.runId) {
          scHandoffWatch.set(res.runId, { ticker, poolPresent })
          connectScreenerRun(get, res.runId)
        }
        get().setToast({ msg: `Sending ${ticker} to research — writing its idea memo now…`, tone: 'good' })
        // fallback board refresh in case the stream drops before run-done lands
        setTimeout(() => void get().scRefreshBoard(), 8000)
      }
    } catch (e: any) {
      // admission rejections (e.g. exclusivity: this exact handoff is already running) are expected
      // and actionable — surface them as info like the sibling launchers, not as a failure
      get().setToast({ msg: e?.message ? String(e.message) : 'Handoff failed', tone: e?.body?.code ? 'info' : 'bad' })
    } finally {
      set({ launchPending: null })
    }
  },

  // Event-level twin of sendToResearch: the note write is synchronous server-side, so the toast can
  // speak in the past tense. Returns whether the send landed (drives the "✓ sent" row without a
  // refetch). The user stays on the wire — the actionable toast offers the jump, so triaging three
  // events in a row never warps them away mid-flow.
  sendEventToResearch: async (it, ticker) => {
    if (get().staticMode) { get().setToast({ msg: 'Read-only showcase — sending to research runs on your machine via npm run dev', tone: 'info' }); return false }
    if (isLaunchHealthBlocked(get().health)) { get().setToast({ msg: 'Engine offline — try again when it reconnects.', tone: 'info' }); return false }
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) { get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' }); return false }
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) { get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' }); return false }
    try {
      const res = await api.sendEventToResearch(it.event_id, ticker, execution)
      if (!optionalNestedLaunchResponseMatches(res, execution, get().providers.catalogState, res.analyzing === true)) {
        throw Object.assign(new Error('The engine did not return an exact provider receipt for the event analysis run.'), { body: { code: 'provider_receipt_mismatch' } })
      }
      if (res.analyzing === true) revealAcceptedTrackedLaunch(set, get)
      const targetSwarm = typeof res.swarm === 'string' && res.swarm ? res.swarm : 'research'
      const openIt = () => {
        get().scSelectEvent(null)
        // switchSwarm no-ops on to === from, so land the ticker directly when already there
        if (get().activeSwarm === targetSwarm) void get().selectTicker(ticker)
        else get().switchSwarm(targetSwarm, { payloadTicker: ticker, landTicker: ticker })
      }
      if (res.already === true && typeof res.duplicateOf === 'string' && res.duplicateOf) {
        get().setToast({ msg: `${ticker} already has this story — another outlet's copy (${res.duplicateOf}) is in its data pool. Not adding a duplicate.`, tone: 'info', action: { label: 'Open research', onClick: openIt } })
      } else if (res.already === true) {
        get().setToast({ msg: `${ticker} already has this event in its data pool.`, tone: 'info', action: { label: 'Open research', onClick: openIt } })
      } else if (res.analyzing === true) {
        get().setToast({ msg: `Sent to ${ticker} — research is checking what it changes; affected orbs will show up in its plan.`, tone: 'good', action: { label: 'Open research', onClick: openIt } })
      } else {
        get().setToast({ msg: `Sent to ${ticker} — the note is in its data pool; use "Analyze new data" there to scope what it changes.`, tone: 'good', action: { label: 'Open research', onClick: openIt } })
      }
      return true
    } catch (e: any) {
      // an old engine during the deploy-skew window (or a stale tab) 404s with a bare "not found"
      const raw = e?.message ? String(e.message) : ''
      const msg = /not found/i.test(raw)
        ? 'The engine doesn’t know this event — it may be too old, or the engine hasn’t restarted onto this feature yet.'
        : raw || 'Could not send this event to research'
      get().setToast({ msg, tone: 'bad' })
      return false
    }
  },

  // ---- the news wire: watch the scanner live ----
  openNewsFeed: async () => {
    set({ newsFeedOpen: true, pipelineOpen: false, diagnosticsOpen: false, scThesisDetail: null })
    await loadNewsFeed(set, get, false)
  },
  refreshNewsFeed: async () => {
    await loadNewsFeed(set, get, true)
  },
  // Switch the wire's time window. 2 = live (SSE keeps appending); bigger = a historical snapshot pulled
  // from the daily firehose archive (newest items in that range). Live items still prepend on top.
  setFeedWindow: async (days: number) => {
    set({ feedWindowDays: days, feedWindowLoading: true })
    try {
      const { items } = await api.newsFeed(days)
      set({ newsItems: items })
    } catch {
      // keep whatever's shown on failure
    }
    set({ feedWindowLoading: false })
  },
  closeNewsFeed: () => set({ newsFeedOpen: false, feedWindowDays: 2 }),
  // ARCHIVE SEARCH — when the rail has a structured filter set, read the WHOLE archive server-side instead
  // of filtering the 2-day wire. An empty query returns the rail to LIVE mode (the SSE wire). A monotonic
  // token guards against a stale slow response overwriting a newer search (last-write-wins by query).
  //
  // The search and the facets are SETTLED SEPARATELY, and that separation is the fix for
  // a real, reproduced failure: they used to share one `Promise.all`, so when the (much heavier) facets call
  // exceeded the client's request budget, its rejection threw away a search that had already succeeded — and
  // the catch then wrote `results: [], exhausted: true`, which the rail renders as "genuinely nothing matches
  // <filter> — this is the WHOLE archive". Measured on a 29-day archive: search 5.2s (fine), facets 15.8s
  // (over the 15s budget) → a wire full of Amazon news reported as an empty archive. They answer two
  // different questions (what matched vs what the dropdowns should offer); a failure of one must never be
  // able to erase or contradict the other.
  scRunArchiveSearch: async (q: ArchiveQuery) => {
    const active = archiveQueryActive(q)
    if (!active) { // back to LIVE mode — drop the archive snapshot, keep the live wire
      const previous = get().scArchiveQuery
      const wasActive = archiveQueryActive(previous)
      archiveToken++
      set({ scArchiveQuery: {}, scArchiveResults: [], scArchiveCursor: null, scArchiveLoading: false, scArchiveLoadingMore: false, scArchiveScannedThrough: null, scArchiveExhausted: false, scArchiveError: null })
      // Restore the FULL-archive facets so the Geography (and other) dropdowns show every option again.
      // A prior active search overwrote scFacets with filter-narrowed facets; without this reload, clearing
      // a non-geo filter (e.g. a sector) would leave the country dropdown stuck on that sector's subset.
      // The rail also calls this empty path on mount; that is not a user filter and must not trigger the
      // expensive whole-archive scan during startup.
      if (wasActive) void get().scLoadFacets({})
      return
    }
    const token = ++archiveToken
    facetsToken++ // this contextful facets load supersedes any in-flight contextless scLoadFacets
    // a non-flow wire pre-scopes every archive read to its own wire (wireScope clause) — the stored
    // scArchiveQuery stays the USER's filter; the clause is merged at the request edge only
    const wq = withWireClause(get(), q)
    set({ scArchiveQuery: q, scArchiveLoading: true, scArchiveError: null, scFacetsLoading: true })
    // THE RESULTS — the only call whose outcome may write the result list.
    const search = api.newsSearch(wq, { limit: 60 }).then(
      (res) => {
        if (token !== archiveToken) return // a newer search superseded this one
        set({ scArchiveResults: res.items, scArchiveCursor: res.nextCursor, scArchiveScannedThrough: res.scannedThroughDate, scArchiveExhausted: res.exhausted, scArchiveLoading: false, scArchiveError: null })
      },
      (e: any) => {
        if (token !== archiveToken) return
        // Clear scannedThrough too: a date left over from the PREVIOUS query would otherwise lend a failed
        // search the false authority of a specific horizon ("searched all history back to 17 Jul").
        set({ scArchiveResults: [], scArchiveCursor: null, scArchiveScannedThrough: null, scArchiveExhausted: false, scArchiveLoading: false, scArchiveError: archiveErrorNote(e) })
      },
    )
    // Let the lightweight result page finish before the worker starts its full-archive facet recount. Both
    // reads share the archive files, so starting them together made the 100ms history search wait 3–6s for
    // disk while the recount ran. The previous facet snapshot remains usable while its counts refresh.
    await search
    if (token !== archiveToken) return
    // THE DROPDOWNS — never touches the result list. On failure the previous facets stand (stale counts in a
    // dropdown are a cosmetic loss; an erased result list is a false answer).
    try {
      const f = await api.newsFacets(wq)
      if (token === archiveToken) set({ scFacets: f, scFacetsLoading: false })
    } catch {
      if (token === archiveToken) set({ scFacetsLoading: false })
    }
  },
  scLoadFacets: async (q: ArchiveQuery) => {
    const token = ++facetsToken
    set({ scFacetsLoading: true })
    try {
      const f = await api.newsFacets(withWireClause(get(), q))
      if (token !== facetsToken) return
      set({ scFacets: f, scFacetsLoading: false })
    } catch {
      if (token !== facetsToken) return
      set({ scFacetsLoading: false })
    }
  },
  scLoadMoreArchive: async () => {
    const { scArchiveCursor, scArchiveQuery, scArchiveLoadingMore } = get()
    if (!scArchiveCursor || scArchiveLoadingMore) return
    const token = archiveToken
    set({ scArchiveLoadingMore: true })
    try {
      const res = await api.newsSearch(withWireClause(get(), scArchiveQuery), { cursor: scArchiveCursor, limit: 60 })
      if (token !== archiveToken) return // the filter changed mid-page — discard this page
      const seen = new Set(get().scArchiveResults.map((i) => i.event_id))
      const fresh = res.items.filter((i) => !seen.has(i.event_id))
      set({ scArchiveResults: [...get().scArchiveResults, ...fresh], scArchiveCursor: res.nextCursor, scArchiveScannedThrough: res.scannedThroughDate, scArchiveExhausted: res.exhausted, scArchiveLoadingMore: false })
    } catch (e: any) {
      if (token !== archiveToken) { set({ scArchiveLoadingMore: false }); return }
      // Keep the pages already loaded AND the cursor, so the failure is recoverable (scrolling retries) —
      // but say so, rather than letting the list quietly stop deeper than it actually reached.
      set({ scArchiveLoadingMore: false, scArchiveError: archiveErrorNote(e) })
    }
  },
  openSources: () => set({ sourcesOpen: true, diagnosticsOpen: false }),
  closeSources: () => set({ sourcesOpen: false }),
  // ---- pipeline diagnostics: the full end-to-end tier/backlog/defer view (one-overlay-at-a-time) ----
  openDiagnostics: async () => {
    set({ diagnosticsOpen: true, newsFeedOpen: false, pipelineOpen: false, sourcesOpen: false, dataLibraryOpen: false, dataPipelineOpen: false, callsOpen: false, scThesisDetail: null })
    await get().refreshDiagnostics()
  },
  closeDiagnostics: () => set({ diagnosticsOpen: false }),
  refreshDiagnostics: async () => {
    try {
      set({ newsDiagnostics: await api.newsDiagnostics() })
    } catch {
      // read-only view — never toast; keep the last-known snapshot on a transient failure (matches refreshNewsStatus)
    }
  },
  // Same shape + same "decoration, never toast" rule as refreshNewsStatus: a transient failure keeps the
  // last-known snapshot rather than blanking the chip.
  refreshBridgeStatus: async () => {
    try {
      set({ bridgeStatus: await api.bridgeStatus() })
    } catch {
      /* status is decoration — keep the last-known value */
    }
  },
  refreshNewsStatus: async () => {
    try {
      set({ newsStatus: await api.newsStatus() })
    } catch {
      /* status is decoration — never toast for it. Keep the last-known status; a transient failure must
         not blank the rail. The news SSE's `news-connected` flag (newsStreamOnline) covers the case where
         this fetch failed at boot but the stream is actually open. */
    }
  },
  _setNewsStreamOnline: (v) => set({ newsStreamOnline: v }),
  _noteStreamLive: () => {
    lastStreamActivityAt = Date.now()
    if (get().staticMode) return
    if (deploymentAdmissionBlocked) {
      // An old authenticated SSE socket can outlive an Access session, and browser network state is local
      // truth. Keep those higher-priority recovery instructions visible while retaining the deploy latch.
      if (get().health === 'session-expired' || get().health === 'your-network') return
      if (get().health !== 'updating') set({ health: 'updating', healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
      return
    }
    // a live SSE event is the data plane proving itself — flip to online INSTANTLY (don't wait for the next
    // health poll). This is what makes recovery feel instant and stops a false "offline" while events flow.
    // Guarded so it only writes state on an actual transition (no re-render churn when already online).
    const reconnected = get().health !== 'online'
    if (reconnected) set({ health: 'online', healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
    healMissingLiveBootstrap('stream', reconnected)
  },
  // Wake / tab-refocus / network-return: pull everything back to live at once instead of waiting for the
  // next 20s health beat (and, for the news status + stream, which had no wake hook at all, ever).
  revive: () => {
    if (get().staticMode) return
    get().checkHealthNow() // force an immediate /api/health probe (no-op if the loop isn't running)
    void get().refreshNewsStatus() // re-pull the scanner status (bounded fetch — always settles)
    void get().refreshActiveRuns() // catch up on runs that started/finished while we were away (other tab / headless)
    if (get().themesView !== null) void get().refreshThemes() // SSE is not replayed; heal missed remove/decay updates
    reviveNewsStream(get) // re-create the news SSE if it died (CLOSED) — browser auto-reconnect can give up
  },
  _handleNewsEvent: (e) => {
    // The server emits this the instant the SSE opens — it proves the wire is reachable even before any
    // item arrives, so the rail can leave "connecting to the scanner…" without waiting on the status fetch.
    if (e?.type === 'news-connected') {
      set({ newsStreamOnline: true })
      void get().refreshNewsStatus() // a status fetch that failed at boot recovers the moment the stream opens
      if (get().themesView !== null) void get().refreshThemes() // authoritative reconciliation after a lossy SSE gap
      return
    }
    if (e?.type === 'news-item' && e.item) {
      const it = e.item as FeedItem
      // when a HISTORICAL time-window is showing (feedWindowDays > 2), keep that archive snapshot stable —
      // a live prepend + slice(1000) would collapse a 6-month view back to 1000. Still tick the live
      // counter so the themes map keeps pulsing; the snapshot refreshes when the user returns to Live·2d.
      if (get().feedWindowDays > 2) { set({ newsArrivedTotal: get().newsArrivedTotal + 1 }); return }
      // a refresh that read the file in the append→emit window may already hold this item
      if (get().newsItems.some((x) => x.event_id === it.event_id && x.ts === it.ts)) return
      // mark it FRESH so the rail glows it in ("new detected"); the glow self-expires after FRESH_MS so
      // it never lingers and never fires on backfill (only genuine live SSE arrivals pass through here)
      const fresh = new Set(get().freshEvents)
      fresh.add(it.event_id)
      set({ newsItems: [it, ...get().newsItems].slice(0, 1000), freshEvents: fresh, newsArrivedTotal: get().newsArrivedTotal + 1 })
      const prev = freshTimers.get(it.event_id)
      if (prev) clearTimeout(prev)
      freshTimers.set(it.event_id, setTimeout(() => {
        freshTimers.delete(it.event_id)
        const n = new Set(get().freshEvents)
        n.delete(it.event_id)
        set({ freshEvents: n })
      }, FRESH_MS))
    } else if (e?.type === 'news-cycle-start') {
      // the scanner just started a look — say so for the whole cycle instead of staying silent until the
      // summary lands minutes later. An OLDER engine never sends this; the view falls back to status.running.
      set({ scanningSince: { since: Date.now(), phase: (e as any).phase === 'drain' ? 'drain' : 'fetch' } })
    } else if (e?.type === 'news-cycle') {
      void get().refreshNewsStatus()
      if (get().diagnosticsOpen) void get().refreshDiagnostics() // keep the open diagnostics panel live per cycle
      // the cycle's RAW fetch volume drives the live themes map's scanning flow — top it up each scan
      const sum = (e as any).summary as CycleSummary | undefined
      if (sum && typeof sum.fetched === 'number') set({ lastScan: { fetched: sum.fetched, candidates: sum.candidates || 0, seq: (get().lastScan?.seq || 0) + 1 } })
      // keep the WHOLE summary, not just two fields of it: it is the only record of what this look read,
      // kept, dropped and why — the "no visibility" gap. Newest first, capped; the firehose file is durable.
      if (sum) set({ lastCycle: sum, cycleLog: [sum, ...get().cycleLog].slice(0, CYCLE_LOG_CAP), scanningSince: null })
      else set({ scanningSince: null })
      // keep the chosen intensity window live as cycles land (debounced; the rollup is a tiny aggregate)
      if (get().themesView && get().scIntensityWindow !== 'scan') {
        if (intensityRefetchTimer) clearTimeout(intensityRefetchTimer)
        intensityRefetchTimer = setTimeout(() => void get().setIntensityWindow(get().scIntensityWindow), 1200)
      }
      if (get().activeSwarm === 'screener') void get().scRefreshBoard()
      void get().refreshWirePulse() // TTL-gated no-op unless the active wire declares a pulse and it's due
    } else if (e?.type === 'theme-remove' && e.removal) {
      const removal = e.removal as ThemeRemoval
      if (!removal.theme_id || !['retired', 'merged'].includes(removal.reason) || !Number.isFinite(removal.rev)) return
      const priorRemovalRev = themeRemovalRevs.get(removal.theme_id) ?? -Infinity
      if (removal.rev < priorRemovalRev) return
      themeRemovalRevs.set(removal.theme_id, removal.rev)
      const g = get().themesGeo
      const wireCfg = activeWireConfig(get())
      const sliced = !!(g.country || g.geoRegion || get().themesSubject || (wireCfg && !wireCfg.flow && wireCfg.eventScope))
      const refetchSlice = sliced && get().themesView !== null
      // A global in-flight response is still useful: its tombstone-filtered result settles loading without
      // resurrecting this row. A sliced projection can change more broadly around a merge, so only that
      // active slice invalidates its request and schedules a full replacement below.
      if (refetchSlice) themesRequestSeq++
      const selected = get().selectedTheme === removal.theme_id
      if (selected) cancelThemeDetailRequest()
      const reconciledFormation = withoutFormationCandidate(get().themeFormationQueue, get().themeCompilerHealth, removal.theme_id)
      set({
        themes: get().themes.filter((t) => t.theme_id !== removal.theme_id),
        themeFormationQueue: reconciledFormation.formation,
        themeCompilerHealth: reconciledFormation.health,
        ...(selected ? { selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false } : {}),
      })
      // Global removal is exact, so the delete above is sufficient. A sliced projection may also need
      // re-ranking/member-count changes around a merge; rebuild that matching slice rather than guessing.
      if (refetchSlice) {
        if (themesGeoRefetchTimer) clearTimeout(themesGeoRefetchTimer)
        themesGeoRefetchTimer = setTimeout(() => void get().refreshThemes(), 300)
      }
    } else if (e?.type === 'theme-update' && e.theme) {
      const t = e.theme as Theme
      if (!t.theme_id) return
      themeUpsertMutationSeq++
      // upsert the changed theme; the map/board re-rank from the array. Only when the themes view is
      // open (otherwise we'd hold stale themes until next open anyway).
      if (get().themesView === null && !get().themes.length) return
      // in a geo- OR wire-sliced view the SSE patch is a GLOBAL theme summary that doesn't match the
      // sliced projection (different member_count / flow / ranking), so recompute the whole sliced index
      // (debounced) instead of upserting a mismatched row.
      const g = get().themesGeo
      const wireCfg = activeWireConfig(get())
      if (g.country || g.geoRegion || get().themesSubject || (wireCfg && !wireCfg.flow && wireCfg.eventScope)) {
        // The SSE summary is global and cannot be stamped into a sliced index. If it targets the open
        // dossier, close that dossier immediately rather than displaying a revision the matching slice
        // has not yet requalified; the debounced index refresh makes it reopenable when proven there.
        if (get().selectedTheme === t.theme_id) {
          cancelThemeDetailRequest()
          set({ selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false })
        }
        if (themesGeoRefetchTimer) clearTimeout(themesGeoRefetchTimer)
        themesGeoRefetchTimer = setTimeout(() => void get().refreshThemes(), 1200)
        return
      }
      const removedAt = themeRemovalRevs.get(t.theme_id)
      if (removedAt !== undefined) {
        if (!Number.isFinite(t.rev) || t.rev <= removedAt) return
        themeRemovalRevs.delete(t.theme_id) // a strictly newer revision is an explicit re-creation
      }
      const cur = get().themes
      const i = cur.findIndex((x) => x.theme_id === t.theme_id)
      if (i >= 0 && Number.isFinite(cur[i].rev) && Number.isFinite(t.rev) && cur[i].rev > t.rev) return
      const selected = get().selectedTheme === t.theme_id
      const selectedInvalid = selected && themeSurfaceStatus(t) === 'context'
      const selectedChanged = selected && !selectedInvalid && themeDetailContractKey(cur[i]) !== themeDetailContractKey(t)
      if (selectedInvalid || selectedChanged) cancelThemeDetailRequest()
      const next = i >= 0 ? cur.map((x) => (x.theme_id === t.theme_id ? t : x)) : [...cur, t]
      // Match the server's evidence-first index contract. Composite-only sorting would let a hot Context
      // row jump above an actionable pattern after any live patch until the next full refresh.
      next.sort(compareBriefingThemes)
      // A validated SSE summary can be the promotion of one disclosed formation candidate. Remove only
      // that exact candidate; unrelated compiler debt stays visible until the authoritative index refresh.
      // A Context update is not a promotion and must not erase its own developing-pattern disclosure.
      const reconciledFormation = themeSurfaceStatus(t) !== 'context'
        ? withoutFormationCandidate(get().themeFormationQueue, get().themeCompilerHealth, t.theme_id)
        : { formation: get().themeFormationQueue, health: get().themeCompilerHealth }
      set({
        themes: next,
        themeFormationQueue: reconciledFormation.formation,
        themeCompilerHealth: reconciledFormation.health,
        ...(selectedInvalid ? {
          selectedTheme: null, themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false,
        } : selectedChanged ? {
          themeDetail: null, themeDetailError: null, themeBrief: null, themesLoading: false, themeBriefLoading: false,
        } : {}),
      })
      if (selectedChanged) void get().selectTheme(t.theme_id)
    }
  },

  // promote one Inbox row into the paid gauntlet (the component shows the two-click cost confirm)
  checkInboxItem: async (row) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — checks run on your machine via npm run dev', tone: 'info' })
    if (isLaunchHealthBlocked(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const provider = get().runProvider
    const providerProblem = providerLaunchBlockedReason(get().providers[provider], get().providers.catalogState)
    if (providerProblem) return get().setToast({ msg: `${providerProblem}. Choose another run provider.`, tone: 'bad' })
    const execution = captureProviderLaunch(get(), provider)
    if (!execution) return get().setToast({ msg: 'The selected execution profile could not be frozen. Check the provider again.', tone: 'bad' })
    try {
      const out = await api.launchSignal(execution, {
        intake: { headline: row.headline, source_url: row.url, source_name: row.source_name, input_nature: (row.input_nature as any) || 'news_headline' },
        inboxId: row.inbox_id,
      })
      requireLaunchProviderReceipt(out, execution, get().providers.catalogState)
      const { runId, preflight } = out
      const sigId = preflight.ticker
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {}, pipelineOpen: false })
      beginScreenerRun(set, get, runId, { subject: sigId, swarmId: 'screener', execution })
      get().setToast({ msg: `Checks started for ${sigId} — watch them run left to right`, tone: 'good' })
      void get().scRefreshBoard()
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not start the checks', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  dismissInbox: async (inboxId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — actions run on your machine via npm run dev', tone: 'info' })
    try {
      await api.inboxAction(inboxId, 'dismiss')
      get().setToast({ msg: 'Set aside. Use "show set-aside" below the Inbox if you change your mind.', tone: 'info' })
      void get().scRefreshBoard()
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not set the item aside', tone: 'bad' })
    }
  },
  restoreInbox: async (inboxId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — actions run on your machine via npm run dev', tone: 'info' })
    try {
      await api.inboxAction(inboxId, 'restore')
      get().setToast({ msg: 'Back in the Inbox.', tone: 'good' })
      void get().scRefreshBoard()
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not restore the item', tone: 'bad' })
    }
  },

  // hand-move an idea between lanes — recorded as YOUR call; the checks' own verdict stays visible
  moveThesis: async (thesisId, to, reason) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — actions run on your machine via npm run dev', tone: 'info' })
    try {
      await api.thesisMove(thesisId, to, reason)
      get().setToast({
        msg: to === 'engine' ? 'Following the checks again — your move is cleared.' : 'Moved. It is marked as your call; the checks’ own verdict stays visible on the card.',
        tone: 'good',
      })
      void get().scRefreshBoard()
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not move the idea', tone: 'bad' })
    }
  },

  // the kill switch
  setStopListOpen: (open) => set({ stopListOpen: open }),
  stopEverything: async () => {
    try {
      const { cancelled } = await api.cancelAllRuns()
      set({ stopListOpen: false, chainTickers: new Set() })
      get().setToast({
        msg: cancelled.length ? `Stopped ${cancelled.length} run${cancelled.length === 1 ? '' : 's'}. Nothing else will start on its own.` : 'Nothing was running.',
        tone: 'info',
      })
      void get().refreshActiveRuns()
      void get().scRefreshBoard()
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Stop failed — check the engine', tone: 'bad' })
    }
  },

  openScreenerOutput: (node) => {
    const rt = get().scRuntime[node.key]
    if (!rt?.outputPath) return get().setToast({ msg: `${node.name} has no output yet`, tone: 'info' })
    set({ selectedNodeKey: node.key, openOutput: { path: rt.outputPath, title: node.name, verdict: rt.verdict, nodeKey: node.key } })
  },

  // screener SSE -> the screener slice (the research handler stays untouched)
  _handleScreenerEvent: (e) => {
    if (!sseFrameForRun(e, e?.runId, RUN_EVENT_TYPES)) return
    const adopted = get().activeRuns[e.runId]
    if (adopted) {
      if (!adopted.swarmId) return
      const reconciled = reconcileRunIdentity(adopted as ActiveRun & { swarmId: string }, e)
      if (!reconciled) return
      set({ activeRuns: { ...get().activeRuns, [e.runId]: reconciled } })
    }
    const existingSubject = scRunSubjects.get(e.runId)
    const candidateSubject = existingSubject
      ?? get().activeRuns[e.runId]?.ticker
      ?? (e.type === 'run-started' && typeof e.ticker === 'string' ? e.ticker : undefined)
    if (existingSubject === undefined && candidateSubject) scRunSubjects.set(e.runId, candidateSubject)
    // Once learned from the launch receipt/active snapshot, a run's subject never follows the selected
    // signal. A contradictory run-started frame is untrusted for orb mutation.
    const eventSubject = e.type === 'run-started' && existingSubject && e.ticker && e.ticker !== existingSubject
      ? undefined
      : candidateSubject
    const ownsSelectedSignal = typeof eventSubject === 'string'
      && eventSubject.startsWith('SIG-') && eventSubject === get().scSelectedSignal
    const eventProvider = isRunProvider(e.provider)
      ? e.provider
      : isRunProvider(get().activeRuns[e.runId]?.provider) ? get().activeRuns[e.runId]!.provider : undefined
    if (e.type === 'run-error' && e.reason === 'out_of_credits' && eventProvider) {
      const providers = get().providers
      set({ providers: { ...providers, [eventProvider]: { ...providers[eventProvider], usage: { ok: false, reason: 'out_of_credits', checked: true } } } })
      void get().refreshProviders(eventProvider)
    }
    // The EventSource can deliver one queued frame after navigation. The board/manifest will catch up when
    // Screener is entered again; never let that late frame repopulate another swarm's cleared gauntlet.
    if (get().activeSwarm !== 'screener') {
      if (e.type === 'run-done' || e.type === 'run-error') {
        closeScreenerRunSource(e.runId)
        void get().refreshActiveRuns()
        const handoff = scHandoffWatch.get(e.runId)
        if (handoff) {
          scHandoffWatch.delete(e.runId)
          get().setToast(e.type === 'run-done'
            ? {
                msg: handoff.poolPresent
                  ? `${handoff.ticker} is ready ✓ — its idea memo is saved. Start the deep research run when you want.`
                  : `${handoff.ticker} idea memo saved ✓ — but its data folder has no filings yet. Add them before starting research.`,
                tone: 'good',
              }
            : { msg: `Sending ${handoff.ticker} to research failed (${e.reason}) — the memo may not be saved. Try again from the idea board.`, tone: 'bad' })
        } else if (scSweepWatch.has(e.runId)) {
          scSweepWatch.delete(e.runId)
          if (e.type === 'run-done') {
            void get().refreshNewsFeed()
            get().setToast({ msg: 'Scan finished — fresh leads are on the wire and in the Inbox.', tone: 'good' })
          } else if (/cancel/i.test(String(e.reason || ''))) {
            get().setToast({ msg: 'Scan stopped. Nothing was charged for the part that did not run.', tone: 'info' })
          } else {
            get().setToast({
              msg: `The scan could not finish — ${plainReason(e.reason, e.message, eventProvider)} (${e.reason || 'unknown'}).`,
              tone: 'bad',
              action: { label: 'Try again', onClick: () => void get().runSweep() },
            })
          }
        }
      }
      return
    }
    const rt = { ...get().scRuntime }
    const stream = get().runStream.slice()
    const upsert = (runId: string, key: string, name: string, module: string, layer: number, status: NodeStatus, verdict?: string | null) => {
      const i = stream.findIndex((r) => r.key === key)
      const row: StreamRow = { runId, ticker: eventSubject || 'screener', key, name, module, layer, status, verdict, ts: Date.now() }
      if (i >= 0) stream.splice(i, 1)
      stream.unshift(row)
    }
    switch (e.type) {
      case 'agent-started':
        if (!ownsSelectedSignal) break
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'running', runId: e.runId, startedAt: e.ts, endedAt: undefined }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'running')
        break
      case 'agent-done':
        if (!ownsSelectedSignal) break
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'done', verdict: e.verdict, outputPath: e.outputPath, runId: e.runId, endedAt: e.ts }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'done', e.verdict)
        break
      case 'agent-failed':
        if (!ownsSelectedSignal) break
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'failed', runId: e.runId, endedAt: e.ts }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'failed')
        break
      case 'module-routed': {
        if (!ownsSelectedSignal) break
        const scRouted = { ...get().scRouted, [e.module]: { route: e.route, terminal: e.terminal } }
        set({ scRouted })
        if (e.terminal) get().setToast({ msg: `Stopped at "${plainStage(e.module)}": ${plainRoute(e.route)}. A normal outcome, not a failure.`, tone: 'info' })
        break
      }
      case 'run-heartbeat': {
        // A sweep has no orbs, so without this it renders as a silent black box — the "no visibility" gap.
        // The server already pulses this ~every 3s carrying the live tool (lastActivity) + elapsed; patch it
        // onto the run so RunStreamPanel can show "engine active · WebSearch · Xs ago" for a running scan.
        // Mirrors the research handler (case 'run-heartbeat' above). Screener signal runs get it too, free.
        const r = get().activeRuns[e.runId]
        if (r) {
          set({
            activeRuns: {
              ...get().activeRuns,
              [e.runId]: { ...r, status: e.status ?? r.status, costUsd: e.costUsd ?? r.costUsd, agentsDone: e.agentsDone, agentsTotal: e.agentsTotal, lastStdoutAt: e.lastStdoutAt, lastActivity: e.lastActivity, publicationPhase: e.publicationPhase ?? r.publicationPhase, provider: e.provider ?? r.provider, executionProfile: e.executionProfile ?? r.executionProfile, profileKey: e.profileKey ?? r.profileKey, model: e.model ?? r.model, reasoningLevel: e.reasoningLevel ?? r.reasoningLevel, chainId: e.chainId ?? r.chainId, executionEpoch: e.executionEpoch ?? r.executionEpoch },
            },
          })
        }
        break
      }
      case 'run-done': {
        closeScreenerRunSource(e.runId)
        void get().scRefreshBoard()
        void get().refreshActiveRuns() // drop this run from the kill-switch pill
        const handoff = scHandoffWatch.get(e.runId)
        if (handoff) {
          scHandoffWatch.delete(e.runId)
          get().setToast({
            msg: handoff.poolPresent
              ? `${handoff.ticker} is ready ✓ — its idea memo is saved. Start the deep research run when you want.`
              : `${handoff.ticker} idea memo saved ✓ — but its data folder has no filings yet. Add them before starting research.`,
            tone: 'good',
          })
          break
        }
        // A sweep ("scan now") is not a signal — no orbs, no checks, no selected-signal reload. Announce the
        // scan on its own terms and refresh the wire so the new leads it just wrote appear immediately.
        if (scSweepWatch.has(e.runId)) {
          scSweepWatch.delete(e.runId)
          void get().refreshNewsFeed()
          get().setToast({ msg: 'Scan finished — fresh leads are on the wire and in the Inbox.', tone: 'good' })
          break
        }
        if (ownsSelectedSignal) {
          void get().scSelectSignal(eventSubject!) // reload saved outputs + final routing lights
          get().setToast({ msg: 'Checks finished', tone: 'good' })
        }
        break
      }
      case 'run-error': {
        closeScreenerRunSource(e.runId)
        void get().scRefreshBoard()
        void get().refreshActiveRuns() // drop this run from the kill-switch pill
        const handoff = scHandoffWatch.get(e.runId)
        if (handoff) {
          scHandoffWatch.delete(e.runId)
          get().setToast({ msg: `Sending ${handoff.ticker} to research failed (${e.reason}) — the memo may not be saved. Try again from the idea board.`, tone: 'bad' })
          break
        }
        // A sweep failure must NOT borrow the signal copy below: a sweep has no saved checks, and it never
        // auto-resumes (_maybeAutoResume only relaunches SIG- ids). Say what actually broke, and offer a
        // one-click retry — the honest fix for the "run paused… resumes on its own" lie the user hit.
        if (scSweepWatch.has(e.runId)) {
          scSweepWatch.delete(e.runId)
          if (/cancel/i.test(String(e.reason || ''))) {
            get().setToast({ msg: 'Scan stopped. Nothing was charged for the part that did not run.', tone: 'info' })
            break
          }
          get().setToast({
            msg: `The scan could not finish — ${plainReason(e.reason, e.message, eventProvider)} (${e.reason || 'unknown'}).`,
            tone: 'bad',
            action: { label: 'Try again', onClick: () => void get().runSweep() },
          })
          break
        }
        // a stopped/failed signal run: reload the truthful finished-orb set from disk (the done orbs stay
        // done, the rest fall back to dormant) so the constellation shows exactly what completed — and the
        // Continue button can resume from there. A user STOP reads as a calm pause, not a failure.
        if (ownsSelectedSignal) void get().scSelectSignal(eventSubject!)
        const stopped = /cancel/i.test(String(e.reason || ''))
        // A user STOP reads as a calm pause. An interruption (connection drop / killed mid-run) is NOT a
        // failure: the finished checks are saved and scRefreshBoard above re-pulls the board, so the run
        // surfaces as resumable and _maybeAutoResume picks it up on its own (its "Resuming…" toast then
        // replaces this one). No scary error — exactly what the engine just did, said plainly.
        if (ownsSelectedSignal) {
          get().setToast(stopped
            ? { msg: 'Stopped — your finished checks are saved. Press Continue to resume from here.', tone: 'info' }
            : e.reason === 'out_of_credits' && eventProvider
              ? { msg: `${providerLabel(eventProvider)} plan usage is exhausted — finished checks are saved; the server resumes this run when its reset is due.`, tone: 'info' }
              : { msg: 'The run paused — your finished checks are saved; the server resumes it when the connection is back.', tone: 'info' })
        }
        break
      }
    }
    set({ scRuntime: rt, runStream: stream })
  },
}))

// DEV-only: expose the store so live timer/ETA visuals can be exercised locally without paying for a real
// run (simulate running orbs via __store.setState). Tree-shaken out of the production build.
if (import.meta.env?.DEV && typeof window !== 'undefined') (window as any).__store = useStore

/** Execute the exact research-module path only after its local confirmation (or an explicit force action).
 * The fresh plan remains authoritative; the pre-confirm count is display-only and never broadens this scope. */
async function runExactResearchModule(
  set: any,
  get: () => State,
  module: string,
  selection: LaunchSelectionBinding,
  force = false,
): Promise<void> {
  if (!requireCurrentLaunchSelection(get(), selection) || hasPendingLaunchForTicker(get(), selection)) return
  const ticker = selection.subject
  const planned = [...get().nodesByKey.values()].filter((node) => node.module === module).map((node) => node.key)
  const pendingKey = `module:${module}`
  const forceWhenCurrent = () => {
    if (!requireCurrentLaunchSelection(get(), selection)) return
    void get().launchModule(module, true)
  }
  if (get().targetInFlight(ticker, planned) && !force) {
    return get().setToast({
      msg: `${moduleLabel(module)} is already running`, tone: 'info',
      action: { label: 'Stop & run again', onClick: forceWhenCurrent },
    })
  }

  // A forced retry explicitly stops any registry-held run even when the local node snapshot is stale and
  // no longer paints it as active. Wait for confirmed server-side cancellation before any resume staging.
  if (force) {
    const stopping = { key: pendingKey, label: `Stopping the old ${moduleLabel(module)} run…`, ticker, selection }
    set({ launchPending: stopping })
    try {
      await api.cancelSubject('research', ticker)
      await get().refreshActiveRuns()
    } catch (e: any) {
      if (launchSelectionIsCurrent(get(), selection)) {
        get().setToast({ msg: e?.message || `Could not stop the old ${moduleLabel(module)} run`, tone: 'bad' })
      }
      return
    } finally {
      if (get().launchPending === stopping) set({ launchPending: null })
    }
    if (!launchSelectionIsCurrent(get(), selection)) return
  }

  const pending = { key: pendingKey, label: `Checking unfinished ${moduleLabel(module)} orbs…`, ticker, selection }
  set({ launchPending: pending })
  let plan: ThesisPlan | null = null
  try {
    plan = await api.thesisPlan(ticker, selection, 'research', undefined, module)
    if (!launchSelectionIsCurrent(get(), selection)) return
    requireLaunchProviderReceipt(plan.preflight, selection, get().providers.catalogState)
    requireLaunchProviderReceipt(plan.fullPreflight, selection, get().providers.catalogState)
    if (plan.moduleResumeVersion !== 2 || typeof plan.dataPool.newestMs !== 'number') {
      get().setToast({ msg: 'The engine is still updating. Refresh once, then click the module again.', tone: 'info' })
      return
    }
    if (plan.complete) {
      set({ thesisPlan: plan, thesisPlanError: null })
      get().setToast({ msg: `Today’s call is sealed. Start a new analysis version before refreshing ${moduleLabel(module)}.`, tone: 'info' })
      return
    }
    const moduleEntry = plan.modules.find((entry) => entry.module === module)
    // Exact saved inputs are server-selected and content-validated. A module-specific response without this
    // receipt is an older/rolling backend; never fall back to the blunt module launch or invent a reuse set in
    // the browser, because either can broaden paid work beyond the confirmation the user just approved.
    if (plan.exactModuleScope?.module !== module) {
      set({ thesisPlan: plan, thesisPlanError: null })
      get().setToast({ msg: 'The engine is still updating. Refresh once, then click the module again.', tone: 'info' })
      return
    }
    // A heading confirmation means "finish the saved module", never an unannounced clean rerun. Newer evidence
    // invalidates reuse, so stop before spending and let the user choose a full refresh explicitly.
    if (moduleEntry?.staleReason) {
      set({ thesisPlan: plan, thesisPlanError: null })
      get().setToast({ msg: `New source data means ${moduleLabel(module)} cannot safely reuse its filled orbs. Run the whole module from the analysis controls.`, tone: 'info' })
      return
    }
    set({ thesisPlan: plan, thesisPlanError: null })
  } catch (e: any) {
    // A plan that failed provider/profile validation is not partial authority. Clear it before leaving the
    // verification block so the paid module POST below cannot run from an unverified server response.
    plan = null
    if (launchSelectionIsCurrent(get(), selection)) {
      get().setToast({ msg: e?.message || `Could not check ${moduleLabel(module)}`, tone: 'bad' })
    }
  } finally {
    if (get().launchPending === pending) set({ launchPending: null })
  }
  if (plan && launchSelectionIsCurrent(get(), selection)) {
    await runPlannedResearchModule(set, get, module, plan, pendingKey, false, selection)
  }
}

async function runPlannedResearchModule(
  set: any,
  get: () => State,
  module: string,
  plan: ThesisPlan,
  pendingKey: string,
  closePlanOnStart: boolean,
  suppliedSelection?: LaunchSelectionBinding,
): Promise<void> {
  const selection = suppliedSelection ?? captureLaunchSelection(get())
  const ticker = selection?.subject
  if (!selection || !ticker || selection.swarm !== 'research' || plan.swarm !== 'research' || plan.subject !== ticker) return
  if (!launchSelectionIsCurrent(get(), selection)) return
  if (plan.moduleResumeVersion !== 2 || typeof plan.dataPool.newestMs !== 'number') {
    return get().setToast({ msg: 'The engine is still updating. Refresh once, then try again.', tone: 'info' })
  }
  const entry = plan.modules.find((m) => m.module === module)
  if (entry?.publicationPending) {
    const pending = { key: `${pendingKey}:publish`, label: `Saving finished ${moduleLabel(module)}…`, ticker, selection }
    set({ launchPending: pending })
    try {
      await api.publishThesisPlanModule(
        ticker,
        module,
        plan.swarm,
        entry.publicationPending.targetRunRoot,
        entry.publicationPending.fingerprint,
      )
      if (!launchSelectionIsCurrent(get(), selection)) {
        get().setToast({ msg: `${moduleLabel(module)} was saved for ${ticker}.`, tone: 'good' })
        return
      }
      set({
        ...(closePlanOnStart ? { thesisPlanOpen: false } : {}),
        thesisPlan: {
          ...plan,
          modules: plan.modules.map((candidate) => candidate.module === module
            ? { ...candidate, publicationPending: undefined }
            : candidate),
        },
      })
      get().setToast({ msg: `${moduleLabel(module)} is saved. No analysis was rerun.`, tone: 'good' })
    } catch (e: any) {
      if (launchSelectionIsCurrent(get(), selection)) {
        get().setToast({ msg: e?.message || `Could not save ${moduleLabel(module)}. Click the module to try saving again.`, tone: 'bad' })
      }
    } finally {
      if (get().launchPending === pending) set({ launchPending: null })
    }
    return
  }
  if (!entry?.runnable) {
    if (entry?.blockedBy.length) {
      const upstream = entry.blockedBy.map(moduleLabel).join(', ')
      get().setToast({ msg: `Run ${upstream} first — ${moduleLabel(module)} reads ${entry.blockedBy.length === 1 ? 'it' : 'them'}.`, tone: 'info' })
    } else if (entry && !plan.run.includes(module)) {
      get().setToast({ msg: `${moduleLabel(module)} is already complete — there are no empty orbs to run.`, tone: 'info' })
    } else {
      get().setToast({ msg: `${moduleLabel(module)} cannot run yet. Refresh and try again.`, tone: 'info' })
    }
    return
  }

  const pending = { key: pendingKey, label: `Running ${moduleLabel(module)}…`, ticker, selection }
  set({ launchPending: pending })
  try {
    const out = await api.runThesisPlanModule(
      ticker,
      module,
      plan.reuse,
      plan.swarm,
      entry.willRunAgents,
      entry.doneOrbKeys,
      plan.targetRunRoot,
      plan.dataPool.files,
      plan.dataPool.newestMs,
      selection,
    )
    requireLaunchProviderReceipt(out, selection, get().providers.catalogState)
    revealAcceptedTrackedLaunch(set, get)
    const { runId, doneOrbKeys, carried, resumed, ranClean } = out
    if (!launchSelectionIsCurrent(get(), selection)) {
      void get().refreshActiveRuns()
      get().setToast({ msg: `${moduleLabel(module)} started on ${ticker}. Follow it in Activity.`, tone: 'good' })
      return
    }

    // Light up only THIS module's orbs: valid files on disk remain done; the missing specialists and the
    // refreshed synthesis queue. The server—not the circles on screen—decides which saved outputs are valid.
    const nodes = [...get().nodesByKey.values()].filter((node) => node.module === module)
    const doneSet = new Set(doneOrbKeys)
    const doneKeys = nodes.filter((node) => doneSet.has(node.key)).map((node) => node.key)
    const plannedKeys = nodes.filter((node) => !doneSet.has(node.key)).map((node) => node.key)
    const plannedSpecialists = nodes.filter((node) => !node.isSynthesis && !doneSet.has(node.key))
    const specialistRuns = plannedSpecialists.length
    // Read the user's visible gap BEFORE beginRun changes an old-but-dependent saved check from done to queued.
    // That distinction is what lets the toast say "6 empty + 1 related check" instead of calling all 7 empty.
    // Intersect the painted-empty set with the server's actual plan. A historical merge can prove an orb done
    // even when the currently displayed run has no runtime row for it; that orb must not inflate this count.
    const visibleEmptyOrbsBeforeLaunch = plannedSpecialists
      .filter((node) => get().nodeStatus(node.key) !== 'done').length

    set({
      ...(closePlanOnStart ? { thesisPlanOpen: false } : {}),
      ...(get().launchPending === pending ? { launchPending: null } : {}),
    })
    if (runId) beginRun(set, get, runId, {
      subject: ticker, swarmId: selection.swarm, execution: selection,
      kind: 'module', module, willCommitToMain: true,
    }, plannedKeys, doneKeys)
    else void get().refreshActiveRuns()

    const carriedNote = carried.length ? ` · reused ${carried.length} upstream module${carried.length === 1 ? '' : 's'}` : ''
    const dependentChecks = Math.max(0, specialistRuns - visibleEmptyOrbsBeforeLaunch)
    const parts: string[] = []
    if (visibleEmptyOrbsBeforeLaunch) parts.push(`${visibleEmptyOrbsBeforeLaunch} empty orb${visibleEmptyOrbsBeforeLaunch === 1 ? '' : 's'}`)
    if (dependentChecks) parts.push(`${dependentChecks} related saved check${dependentChecks === 1 ? '' : 's'}`)
    if (!parts.length && specialistRuns) parts.push(`${specialistRuns} check${specialistRuns === 1 ? '' : 's'}`)
    parts.push('a fresh summary')
    const remaining = parts.join(' + ')
    const msg = ranClean
      ? `Re-running ${moduleLabel(module)} clean on ${ticker} — newer data landed${carriedNote}`
      : resumed
        ? `Finishing ${moduleLabel(module)} on ${ticker} — ${remaining}${carriedNote}`
        : `Running ${moduleLabel(module)} on ${ticker} — ${remaining}${carriedNote}`
    get().setToast({ msg, tone: 'good' })
  } catch (e: any) {
    const code = e?.body?.code
    if (code === 'already_complete' && closePlanOnStart) {
      set({ thesisPlanOpen: false })
      get().setToast({ msg: 'This run already has a final thesis — opening it.', tone: 'info' })
      void get().openThesis()
      return
    }
    const info = ['upstream_incomplete', 'not_runnable', 'module_scope_changed', 'sealed_run'].includes(code)
    get().setToast({
      msg: e?.message || `Could not run ${moduleLabel(module)}`,
      tone: info ? 'info' : 'bad',
      ...(code === 'subject_busy'
        ? {
            action: {
              label: 'Stop & run again',
              onClick: () => {
                if (!requireCurrentLaunchSelection(get(), selection)) return
                void get().launchModule(module, true)
              },
            },
          }
        : {}),
    })
  } finally {
    if (get().launchPending === pending) set({ launchPending: null })
  }
}

function beginRun(
  set: any,
  get: () => State,
  runId: string,
  info: { subject: string; swarmId: string; execution: FrozenProviderLaunch; kind: string; continuation?: boolean; module?: string; agent?: string; willCommitToMain?: boolean },
  plannedKeys: string[],
  doneKeys: string[] = [],
) {
  const ticker = info.subject
  const swarmId = info.swarmId
  const onScreen = get().selectedTicker === ticker && get().activeSwarm === swarmId
  const rt = { ...get().nodeRuntime }
  // Resume: modules already finished on disk are shown as done, NOT queued — so the constellation doesn't
  // read as "starting… / 0-of-N" for work that isn't being redone (the "it's reprocessing everything and
  // burning money" false alarm). Only plannedKeys are queued, and the run's orb total counts only them.
  if (onScreen) {
    for (const k of doneKeys) rt[k] = { status: 'done', runId }
    for (const k of plannedKeys) rt[k] = { status: 'queued', runId }
    if (info.kind === 'full') rt['master/synthesizer'] = { status: 'queued', runId }
  }
  const plannedCount = plannedKeys.length + (info.kind === 'full' ? 1 : 0)
  // drop finished runs for this ticker, add the new live one (other tickers' / other runs' state kept)
  const activeRuns = Object.fromEntries(Object.entries(get().activeRuns).filter(([, r]) =>
    !runMatchesSubject(r, ticker, swarmId) || LIVE_RUN.has(r.status)))
  // the run belongs to the selection's swarm (constellationSwarm at launch), so the run-done refresh
  // can resolve the manifest/decision against the run's OWN run root (e.g. commodity/runs/<subject>)
  activeRuns[runId] = {
    runId, ticker, swarmId, kind: info.kind, continuation: info.continuation, module: info.module, agent: info.agent,
    willCommitToMain: info.willCommitToMain,
    provider: info.execution.provider,
    executionProfile: info.execution.executionProfile,
    profileKey: info.execution.expectedProfileKey,
    model: info.execution.model,
    reasoningLevel: info.execution.reasoningLevel,
    status: 'running', plannedCount, startedAt: Date.now(),
  }
  // close the output panel so the user is dropped back to the swarm to watch the run live; keep
  // other concurrent runs' stream rows, just clear any stale rows from this runId
  set(onScreen
    ? { activeRuns, activityOpen: true, nodeRuntime: rt, runStream: get().runStream.filter((r) => r.runId !== runId), coreBloom: false, selectedNodeKey: null, openOutput: null }
    : { activeRuns, activityOpen: true })
  connectRun(get, runId)
  get().refreshActiveRuns()
}

function setReadinessRecovery(
  set: any,
  runId: string,
  recovery: ReadinessRecoveryState | null,
): void {
  set((state: State) => {
    const next = { ...state.readinessRecovery }
    if (recovery) next[runId] = recovery
    else delete next[runId]
    return { readinessRecovery: next }
  })
}

/** Recover a deploy-skew chained gate without inventing consent. Recheck is deterministic/pre-spend; the
 * current server automatically continues every non-empty chain. One bounded attempt prevents an old server
 * from looping forever; an incompatible owner stays visibly paused while authoritative snapshots poll. */
async function recoverNonEmptyChainedReadiness(
  set: any,
  get: () => State,
  runId: string,
  chainId: string,
): Promise<void> {
  if (chainedReadinessRecoveryInFlight.has(runId)) return
  if (chainedReadinessRecoveryTried.has(runId)) {
    setReadinessRecovery(set, runId, {
      chainId,
      state: 'incompatible',
      message: 'This run is waiting for the engine to finish updating. No click or tokens are needed; status is checked automatically.',
    })
    return
  }
  chainedReadinessRecoveryTried.add(runId)
  chainedReadinessRecoveryInFlight.add(runId)
  setReadinessRecovery(set, runId, {
    chainId,
    state: 'rechecking',
    message: 'Finishing the data check automatically…',
  })
  // An older server can emit one blocked event for every child in the same chain. Serialize their bounded
  // recovery rechecks so siblings cannot race the shared decision owner while distinct chains stay independent.
  const previous = chainedReadinessRecoveryTail.get(chainId) ?? Promise.resolve()
  const task = previous.catch(() => undefined).then(async () => {
    try {
      await api.readinessDecision(runId, 'recheck')
      // The HTTP response is only an acknowledgement. readiness-report/resolved SSE or the exact snapshot
      // owns the outcome; keep the plain automatic-recovery message until one of them arrives.
    } catch (error: any) {
      if (error?.status === 404) {
        setReadinessRecovery(set, runId, null)
        chainedReadinessRecoveryTried.delete(runId)
        return
      }
      if (error?.status === 409) {
        try {
          const snapshot = await api.runSnapshot(runId)
          if (snapshot?.status !== 'awaiting-readiness-decision') {
            setReadinessRecovery(set, runId, null)
            chainedReadinessRecoveryTried.delete(runId)
            return
          }
        } catch (snapshotError: any) {
          if (snapshotError?.status === 404) {
            setReadinessRecovery(set, runId, null)
            chainedReadinessRecoveryTried.delete(runId)
            return
          }
        }
      }
      setReadinessRecovery(set, runId, {
        chainId,
        state: 'incompatible',
        message: 'This run is waiting for the engine to finish updating. No click or tokens are needed; status is checked automatically.',
      })
    } finally {
      chainedReadinessRecoveryInFlight.delete(runId)
      void get().refreshActiveRuns()
    }
  })
  chainedReadinessRecoveryTail.set(chainId, task)
  try {
    await task
  } finally {
    if (chainedReadinessRecoveryTail.get(chainId) === task) {
      chainedReadinessRecoveryTail.delete(chainId)
    }
  }
}

// open the live SSE for a run and pipe its events (incl. the server's replayed backlog) into the store.
// Does NOT close other runs' streams — concurrent same-ticker runs each get their own EventSource.
function connectRun(get: () => State, runId: string) {
  if (runSources.has(runId)) return
  const retryAt = runStreamRetryAt.get(runId) ?? 0
  if (retryAt > Date.now()) return
  const connectStartedAt = performance.now()
  let opened = false
  let failureRecorded = false
  const es = new EventSource(api.runStreamUrl(runId))
  es.onopen = () => {
    opened = true
    runStreamRetryAt.delete(runId)
    runStreamHealth.set(runId, { state: 'open', at: Date.now() })
    recordBrowserPerformance('browser.run_stream_connect', performance.now() - connectStartedAt, 'ms', {
      operation: '/run/stream',
    })
  }
  for (const t of RUN_EVENT_TYPES) {
    es.addEventListener(t, (ev: MessageEvent) => {
      runStreamHealth.set(runId, { state: 'open', at: Date.now() })
      get()._noteStreamLive() // run traffic also proves the engine is up — keep the indicator green
      try {
        const frameStartedAt = performance.now()
        const frame = JSON.parse(ev.data)
        if (sseFrameForRun(frame, runId, RUN_EVENT_TYPES)) {
          get()._handleEvent(frame as SseEvent)
          recordNextPaint('browser.run_event_paint', frameStartedAt, `/event/${frame.type}`)
        }
      } catch {}
    })
  }
  es.onerror = () => {
    if (runSources.get(runId) !== es) return
    // Browsers can invoke onerror more than once for one source. Count that attempt once, then allow the
    // next freshly-created EventSource attempt to contribute its own failure-rate observation.
    if (!opened && !failureRecorded) {
      failureRecorded = true
      recordBrowserPerformance('browser.run_stream_connect', performance.now() - connectStartedAt, 'ms', {
        operation: '/run/stream',
        outcome: 'error',
      })
    }
    runStreamHealth.set(runId, { state: 'error', at: Date.now() })
    // EventSource's implicit retry cannot restore a readiness decision whose terminal frame disappeared
    // with a server restart. Retire this stream and let the exact snapshot reconcile before reattaching.
    es.close()
    runSources.delete(runId)
    const delay = 2_000
    runStreamRetryAt.set(runId, Date.now() + delay)
    setTimeout(() => {
      if ((runStreamRetryAt.get(runId) ?? 0) <= Date.now()) void get().refreshActiveRuns()
    }, delay)
  }
  runSources.set(runId, es)
}

// rebuild the live view for one in-flight run from its snapshot, then attach the stream.
// Merges into the existing view so multiple concurrent runs for the ticker coexist.
async function reconnectRun(
  set: any,
  get: () => State,
  runId: string,
  token: number,
  expected: { subject: string; swarm: string },
): Promise<void> {
  const inFlightKey = `${runId}:${token}`
  const existing = reconnectRunInFlight.get(inFlightKey)
  if (existing) { await existing; return }
  const reconnectStartedAt = performance.now()
  const task = reconnectRunOnce(set, get, runId, token, expected)
  reconnectRunInFlight.set(inFlightKey, task)
  try {
    const outcome = await task
    if (outcome === 'ready' || outcome === 'settled') {
      recordNextPaint('browser.run_reconnect', reconnectStartedAt, `/reconnect/${outcome}`)
    } else {
      recordBrowserPerformance('browser.run_reconnect', performance.now() - reconnectStartedAt, 'ms', {
        operation: `/reconnect/${outcome}`,
        outcome: outcome === 'cancelled' ? 'cancelled' : 'error',
      })
    }
  } catch (error) {
    recordBrowserPerformance('browser.run_reconnect', performance.now() - reconnectStartedAt, 'ms', {
      operation: '/reconnect/error',
      outcome: 'error',
    })
    throw error
  } finally {
    if (reconnectRunInFlight.get(inFlightKey) === task) reconnectRunInFlight.delete(inFlightKey)
  }
}

async function reconnectRunOnce(
  set: any,
  get: () => State,
  runId: string,
  token: number,
  expected: { subject: string; swarm: string },
): Promise<ReconnectOutcome> {
  try {
    const snap = await api.runSnapshot(runId)
    const current = get().activeRuns[runId]
    const identity = normalizeRunSnapshotIdentity(snap, {
      runId,
      ticker: expected.subject,
      swarmId: expected.swarm,
      ...(current?.swarmId ? { existing: current as ActiveRun & { swarmId: string } } : {}),
    })
    if (!identity || get().selectToken !== token || get().selectedTicker !== expected.subject
        || get().activeSwarm !== expected.swarm) return 'cancelled'
    const rt = { ...get().nodeRuntime }
    const stream = get().runStream.filter((r) => r.runId !== runId)
    for (const a of snap.agents || []) {
      rt[a.key] = { status: a.status, verdict: a.verdict ?? null, outputPath: a.outputPath, runId }
      if (a.status !== 'queued') stream.unshift({ runId, ticker: identity.ticker, key: a.key, name: a.name, module: a.module, layer: a.layer, status: a.status, verdict: a.verdict ?? null, ts: Date.now() })
    }
    const plannedCount = (snap.expected?.length ?? snap.agents?.length ?? 0) + (snap.kind === 'full' ? 1 : 0)
    const activeRuns = { ...get().activeRuns, [runId]: { ...identity, kind: identity.kind || snap.kind, continuation: identity.continuation ?? snap.continuation, module: identity.module || snap.module, agent: identity.agent || snap.agent, status: snap.status, costUsd: snap.costUsd, willCommitToMain: snap.willCommitToMain, plannedCount, startedAt: snap.startedAt, publicationPhase: snap.publicationPhase } }
    const report = snap.readiness as ReadinessReport | undefined
    if (snap.status === 'awaiting-readiness-decision' && report?.ticker === identity.ticker && Array.isArray(report.issues)) {
      if (identity.chainId && !isPhysicallyEmptyReadiness(report)) {
        // Never restore a human prompt for a non-empty Full/Continue chain. Keep its true paused status,
        // expose compatibility recovery in Activity, and ask the server to re-verify/continue safely.
        const gates = resolveReadinessChain(get().readinessGate, get().readinessGateQueue, identity.chainId)
        set({ activeRuns, nodeRuntime: rt, runStream: stream, readinessGate: gates.current, readinessGateQueue: gates.queued })
        void recoverNonEmptyChainedReadiness(set, get, runId, identity.chainId)
      } else {
        // Hard refresh loses the browser FIFO. Rebuild the one empty chain owner (or a strict standalone
        // gate) from exact snapshot truth; replay frames dedupe by logical chain.
        const gates = enqueueReadinessGate(get().readinessGate, get().readinessGateQueue, {
          runId,
          report,
          chainId: identity.chainId,
        })
        const recovery = withoutReadinessRecovery(get().readinessRecovery, [runId])
        set({ activeRuns, nodeRuntime: rt, runStream: stream, readinessGate: gates.current, readinessGateQueue: gates.queued, readinessRecovery: recovery })
      }
    } else {
      const gates = reconcileReadinessGateSnapshot(
        get().readinessGate,
        get().readinessGateQueue,
        runId,
        snap.status,
      )
      const keepRecovery = snap.status === 'readiness-checking'
      const recovery = keepRecovery ? get().readinessRecovery : withoutReadinessRecovery(get().readinessRecovery, [runId])
      if (!keepRecovery) chainedReadinessRecoveryTried.delete(runId)
      set({ activeRuns, nodeRuntime: rt, runStream: stream, readinessGate: gates.current, readinessGateQueue: gates.queued, readinessRecovery: recovery })
    }
    connectRun(get, runId)
    return 'ready'
  } catch (error: any) {
    if (get().selectToken !== token || get().selectedTicker !== expected.subject
        || get().activeSwarm !== expected.swarm) return 'cancelled'
    if (error?.status !== 404) return 'error'
    // A 404 from the exact snapshot is authoritative: the stream's terminal/resolved frame was missed or
    // the in-memory run disappeared during restart. Remove only this stale live claim and its decision.
    const lostRun = get().activeRuns[runId]
    const gates = terminateReadinessGateMember(get().readinessGate, get().readinessGateQueue, runId)
    const activeRuns = { ...get().activeRuns }
    if (activeRuns[runId] && LIVE_RUN.has(activeRuns[runId].status)) delete activeRuns[runId]
    set({
      activeRuns,
      readinessGate: gates.current,
      readinessGateQueue: gates.queued,
      readinessRecovery: withoutReadinessRecovery(get().readinessRecovery, [runId]),
    })
    chainedReadinessRecoveryTried.delete(runId)
    closeRunSource(runId)
    // The browser can miss the terminal SSE frame while the backend still finishes and saves output.
    // Re-read that exact run's durable manifest before leaving the graph stale. No run root means there is
    // no exact artifact identity to reconcile, so fail closed rather than resolving a different run.
    const lostRunRoot = lostRun?.runRoot
    if (lostRunRoot) {
      const rSw = lostRun.swarmId && lostRun.swarmId !== 'research' ? lostRun.swarmId : undefined
      try {
        const manifest = await api.runManifest(expected.subject, lostRunRoot, rSw)
        if (get().selectToken !== token || get().selectedTicker !== expected.subject
            || get().activeSwarm !== expected.swarm) return 'cancelled'
        set(projectRunManifest(manifest, get().nodeRuntime, runId))
        if (manifest.finalThesis || manifest.finalReport) {
          try {
            const decision = await api.decision(expected.subject, rSw, lostRunRoot)
            if (get().selectToken !== token || get().selectedTicker !== expected.subject
                || get().activeSwarm !== expected.swarm) return 'cancelled'
            set({ decision })
          } catch { return 'error' }
        }
      } catch { return 'error' }
    }
    return 'settled'
  }
}

// Load the heavy boot data (graph + ticker list, + usage on the first call) WITHOUT ever gating the UI on
// it. Each part sets as it resolves; whatever fails is retried in the background until both the graph and
// the tickers are in. connected/health are owned by the heartbeat — loadCore never writes them in live
// mode (in static mode there's no heartbeat, so it marks `connected` once the data is reachable). This is
// what lets a slow /api/swarm or /api/tickers degrade to "data still loading" instead of "whole app
// offline" (the old Promise.all in init() rejected the entire boot on either one failing).
async function loadCore(get: () => State, set: (p: Partial<State>) => void, stat: boolean, withCredit = false) {
  const jobs: Promise<void>[] = []
  if (!coreGraphLoaded)
    jobs.push(
      api
        .swarm()
        .then((g) => { coreGraphLoaded = true; set({ graph: g, nodesByKey: flatten(g) }) })
        .catch(() => {}),
    )
  if (!coreTickersLoaded)
    jobs.push(
      api
        .tickers()
        .then((tk) => {
          coreTickersLoaded = true
          set({ tickers: tk.tickers, emptyState: tk.emptyState, defaultCoverage: tk.coverage ?? [], dataDir: (tk as any).dataDir ?? null, driveEnabled: (tk as any).driveEnabled ?? false, watchlistFilesEnabled: (tk as any).watchlistFilesEnabled ?? (tk as any).driveEnabled ?? false })
          reconcileSelection(get, set) // a reconnect may carry a now-removed selection — drop it
        })
        .catch(() => {}),
    )
  if (withCredit) jobs.push(api.credit().then((c) => set({ credit: c })).catch(() => {}))
  await Promise.all(jobs) // every job is .catch'd → this never rejects
  if (!coreReadyRecorded && coreGraphLoaded && coreTickersLoaded) {
    coreReadyRecorded = true
    recordNextPaint('browser.core_ready', 0, '/boot/core')
  }
  if (stat) set({ connected: true }) // static showcase has no heartbeat — mark reachable once data is in
  if (coreRetryTimer) { clearTimeout(coreRetryTimer); coreRetryTimer = null }
  // Retry ONLY the still-missing parts; stop once both are loaded. Never in static mode (no engine to wait
  // for). The heartbeat already reports reachability, so this loop is purely about backfilling data.
  if (!stat && (!coreGraphLoaded || !coreTickersLoaded)) coreRetryTimer = setTimeout(() => void loadCore(get, set, stat, false), 3000)
}

// If the currently-selected company's folder was renamed or removed (so it's no longer in the list),
// drop the stale selection — otherwise the picker keeps showing a ghost ticker that can't be loaded.
// Returns the cleared name (for a toast) or null. Guards on a non-empty list so a transient/failed
// fetch never clears a valid selection.
function reconcileSelection(get: () => State, set: (p: Partial<State>) => void): string | null {
  const sel = get().selectedTicker
  const list = get().tickers
  if (sel && list.length > 0 && !list.some((t) => t.ticker === sel)) {
    set({ selectedTicker: null, dataStatus: null, dataLoading: false, dataScan: null, decision: null, runRoot: null, nodeRuntime: {}, reports: { memo: false, thesis: false, dossier: false }, moduleReports: {}, selectedNodeKey: null, openOutput: null, readinessGate: null, readinessGateQueue: [], readinessRecovery: {} })
    return sel
  }
  return null
}

// Refresh the ticker list (live file counts + sync state). While any ticker is still syncing from Drive,
// keep re-polling so the count keeps climbing and the "syncing…" flag clears once files stop arriving —
// even after the file-event stream goes quiet.
let tickersSyncTimer: any = null
function refreshTickersSoon(get: () => State, set: (p: Partial<State>) => void) {
  api
    .tickers()
    .then((t) => {
      set({ tickers: t.tickers, emptyState: t.emptyState, defaultCoverage: t.coverage ?? get().defaultCoverage, dataDir: (t as any).dataDir ?? get().dataDir, driveEnabled: (t as any).driveEnabled ?? get().driveEnabled, watchlistFilesEnabled: (t as any).watchlistFilesEnabled ?? (t as any).driveEnabled ?? get().watchlistFilesEnabled })
      const removed = reconcileSelection(get, set)
      if (removed) get().setToast({ msg: `${removed} is no longer in the data folder — pick a ticker`, tone: 'info' })
      if (tickersSyncTimer) { clearTimeout(tickersSyncTimer); tickersSyncTimer = null }
      if (!get().staticMode && t.tickers.some((x) => x.syncing)) tickersSyncTimer = setTimeout(() => refreshTickersSoon(get, set), 5000)
    })
    .catch(() => {})
}

// `active` = at least one run is live for the selected ticker. Poll fast (5s) while something is live so
// the swarm stays smooth; keep a gentle 20s heartbeat while a company is merely selected so a run started
// elsewhere (another tab, or a headless/autonomous run) surfaces in the constellation on its own — no
// stale "▸ run module" over a module that's actually in flight. refreshActiveRuns is a cheap in-memory
// registry read and never touches health, so the idle beat can't cause offline flapping.
function schedulePoll(get: () => State, active: boolean) {
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null }
  if (get().staticMode) return
  if (!active && !get().selectedTicker) return
  pollTimer = setTimeout(() => get().refreshActiveRuns(), active ? 5000 : 20000)
}

// One health probe now, then self-reschedule (20s healthy / 5s degraded). The generation guard makes a
// restart/checkHealthNow cancel any in-flight tick's continuation, so two timers never coexist.
function pumpHealth(get: () => State) {
  const gen = ++healthGen
  if (healthTimer) { clearTimeout(healthTimer); healthTimer = null }
  const tick = async () => {
    if (gen !== healthGen) return
    await get()._tickHealth()
    if (gen !== healthGen || !healthLoopRunning) return
    healthTimer = setTimeout(tick, get().health === 'online' ? HEALTH_OK_MS : HEALTH_DEGRADED_MS)
  }
  void tick()
}

function closeRunSource(runId?: string) {
  if (!runId) return closeAllRunSources()
  const es = runSources.get(runId)
  if (es) {
    es.close()
    runSources.delete(runId)
  }
  runStreamHealth.delete(runId)
  runStreamRetryAt.delete(runId)
}

// ---- the news wire's live stream (one global EventSource, like dataSource) ----
// "new detected" glow: an event_id stays in freshEvents for FRESH_MS after it streams in, then clears
// itself so the glow plays exactly once. Timers tracked here so a re-seen id resets cleanly.
const FRESH_MS = 2600
// how many ingest cycles the live scan log remembers (in-memory; the daily firehose file is the durable record)
const CYCLE_LOG_CAP = 50
const freshTimers = new Map<string, ReturnType<typeof setTimeout>>()
let newsSource: EventSource | null = null
// App-level reconnect for the news wire. The browser's native EventSource auto-reconnect gives up
// permanently on some errors (a 4xx, or a Cloudflare Access redirect when the session expires) — leaving
// the wire dead with no recovery. So once the source goes CLOSED we own the reconnect with capped backoff,
// and reviveNewsStream() re-creates it immediately on wake/focus/network-return.
const NEWS_BACKOFF_MS = [1000, 2000, 5000, 10000, 20000]
let newsRetry = 0
let newsRetryTimer: any = null
function connectNewsStream(get: () => State) {
  // never open a live SSE on a static/read-only deploy: the screener stage can briefly mount on first
  // paint, and on Cloudflare Pages this would open an EventSource that errors + reconnects forever. The
  // resolved api-level isStatic() is authoritative here (every caller reaches this after an api.* await).
  if (isStatic()) return
  if (newsSource) return
  const es = new EventSource(api.newsStreamUrl())
  // 'news-connected' is sent immediately on open — handled in _handleNewsEvent to flip the rail online.
  for (const t of ['news-connected', 'news-item', 'news-cycle-start', 'news-cycle', 'theme-update', 'theme-remove']) {
    es.addEventListener(t, (ev: MessageEvent) => {
      get()._noteStreamLive() // any wire byte = the engine is up → flip health online instantly
      try {
        get()._handleNewsEvent(JSON.parse(ev.data))
      } catch {}
    })
  }
  es.onopen = () => {
    newsRetry = 0 // a clean open resets the backoff ladder
    if (newsRetryTimer) { clearTimeout(newsRetryTimer); newsRetryTimer = null }
  }
  es.onerror = () => {
    // readyState 2 = CLOSED: the browser gave up — we reconnect with backoff. readyState 0 = CONNECTING:
    // the browser is already retrying, so leave it (don't stack a second source).
    if (es.readyState === 2) {
      try { es.close() } catch {}
      if (newsSource === es) newsSource = null
      get()._setNewsStreamOnline(false)
      scheduleNewsReconnect(get)
    }
  }
  newsSource = es
}
function scheduleNewsReconnect(get: () => State) {
  if (newsRetryTimer || isStatic()) return
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return // wait for the 'online' event
  const delay = NEWS_BACKOFF_MS[Math.min(newsRetry, NEWS_BACKOFF_MS.length - 1)]
  newsRetry++
  newsRetryTimer = setTimeout(() => { newsRetryTimer = null; connectNewsStream(get) }, delay)
}
// Load (or reload) the wire's current time-window and make sure the live stream is running. Shared by
// openNewsFeed and the panel's refresh button, so both carry the same two guarantees:
//  1. a FAILED load never blanks the list — it keeps whatever is shown (same posture as setFeedWindow).
//     The old openNewsFeed did `set({ newsItems: [] })` here, so one flaky fetch turned a healthy
//     1000-item wire into "Nothing read yet today" — and refresh was the quickest way to hit it.
//  2. feedWindowLoading is held for the whole fetch, so the refresh button can show a pending state
//     instead of looking dead when a successful reload returns visually identical data.
async function loadNewsFeed(set: any, get: () => State, force: boolean) {
  set({ feedWindowLoading: true })
  void get().refreshNewsStatus()
  try {
    const { items } = await api.newsFeed(get().feedWindowDays || 2)
    set({ newsItems: items })
    if (items.length) get().seedReadBaseline(items) // first-ever visit → clean slate (once-only)
  } catch {
    // keep whatever's shown — a transient failure must not destroy the data we were asked to reload
  } finally {
    set({ feedWindowLoading: false })
  }
  if (!get().staticMode) reviveNewsStream(get, force)
}

// Wake / focus / network-return: re-create the news stream if it died (CLOSED) or was never opened. A
// healthy or still-connecting source is left untouched so a focus event never stacks a duplicate stream.
//
// `force` is for an EXPLICIT user refresh only. A stream wedged OPEN-but-silent (readyState 1, a half-open
// hop through the tunnel, the server no longer pushing) is indistinguishable from a healthy one from here,
// so the passive path must leave it alone — but when the user presses "refresh" and asks for exactly this,
// tearing it down and reconnecting is both what they meant and cheap (one reconnect, items dedup by id).
function reviveNewsStream(get: () => State, force = false) {
  if (isStatic()) return
  if (!force && newsSource && newsSource.readyState !== 2) return
  if (newsSource) { try { newsSource.close() } catch {} ; newsSource = null }
  if (newsRetryTimer) { clearTimeout(newsRetryTimer); newsRetryTimer = null }
  newsRetry = 0
  connectNewsStream(get)
}

// ---- screener run streams (separate map so research streams are never disturbed) ----
const scRunSources = new Map<string, EventSource>()
// Immutable subject ownership for each screener stream. Orb keys repeat across signals, so the selected
// signal can never be used as a fallback identity for a late/background run frame.
const scRunSubjects = new Map<string, string>()
// Handoff runs being watched for completion: runId → toast context. The launch API returns as soon
// as the CLI spawns, so "memo seeded" is only true at run-done — these runs get a tailored
// completion/failure toast instead of the generic "Screener run complete".
const scHandoffWatch = new Map<string, { ticker: string; poolPresent: boolean }>()
// Sweep ("scan now") runs in flight. A sweep has no signal, no orbs, no board entry and does NOT resume on
// its own (_maybeAutoResume only relaunches SIG- ids), so it must never inherit the signal-run copy — this
// tags the runId so run-done/run-error branch to sweep-specific messages.
const scSweepWatch = new Set<string>()
// Turn the engine's machine failure reason into one plain-English clause (CLAUDE.md §21). Falls back to the
// first line of the raw message, then the code itself — never a blank or a lie.
const SWEEP_FAILURE_COPY: Record<string, string> = {
  error_max_turns: 'it ran out of steps before finishing',
  error_during_execution: 'the engine stopped mid-scan',
  incomplete_deliverables: 'it finished without saving anything',
  spawn_failed: 'the engine could not start',
  launch_failed: 'the engine could not start',
  nonzero_exit: 'the engine exited with an error',
}
function plainReason(reason?: string, message?: string, provider?: RunProvider): string {
  const label = providerLabel(provider || 'claude')
  if (reason === 'api_error_403' || reason === 'api_error_401') return `the engine's ${label} login was rejected`
  if (reason === 'api_error_429') return `${label} is rate-limiting the engine — give it a moment`
  if (reason === 'out_of_credits') return `${label} plan usage is exhausted for now`
  if (reason && SWEEP_FAILURE_COPY[reason]) return SWEEP_FAILURE_COPY[reason]
  const firstLine = (message || '').split('\n')[0].trim()
  if (firstLine) return firstLine.slice(0, 90)
  return reason || 'the scan could not start'
}
let warpTimer: any = null

// Terminal routing values mirror the SWARM.md routing contract. Kept as a display heuristic only —
// the server's module-routed events carry the authoritative `terminal` flag; this covers seeding
// from saved run folders where only the routing string is known.
const TERMINAL_ROUTES = new Set(['log', 'park', 'suppress', 'watchlist_no_source', 'watchlist_no_world_change', 'return_to_m0_2', 'watchlist_no_edge', 'watchlist_integrity_downgrade', 'watchlist_integrity_broken'])
function isTerminalRoute(route: string): boolean {
  return TERMINAL_ROUTES.has(String(route).toLowerCase())
}

function connectScreenerRun(get: () => State, runId: string, subject?: string) {
  const resolvedSubject = subject || get().activeRuns[runId]?.ticker
  if (resolvedSubject && !scRunSubjects.has(runId)) scRunSubjects.set(runId, resolvedSubject)
  if (scRunSources.has(runId)) return
  const es = new EventSource(api.runStreamUrl(runId))
  for (const t of RUN_EVENT_TYPES) {
    es.addEventListener(t, (ev: MessageEvent) => {
      get()._noteStreamLive() // screener run traffic also proves the engine is up — keep the indicator green
      try {
        const frame = JSON.parse(ev.data)
        if (sseFrameForRun(frame, runId, RUN_EVENT_TYPES)) get()._handleScreenerEvent(frame as SseEvent)
      } catch {}
    })
  }
  es.onerror = () => { /* keep open; server may still be streaming */ }
  scRunSources.set(runId, es)
}

// A board row is only an index into a live run. Before reconnecting after reload, bind the stream to the
// snapshot's exact run/subject/swarm identity and adopt its immutable provider/profile/epoch fields.
async function reconnectScreenerRun(get: () => State, runId: string, subject: string): Promise<void> {
  try {
    const snap = await api.runSnapshot(runId)
    if (get().activeSwarm !== 'screener') return
    const current = get().activeRuns[runId]
    const identity = normalizeRunSnapshotIdentity(snap, {
      runId,
      ticker: subject,
      swarmId: 'screener',
      ...(current?.swarmId ? { existing: current as ActiveRun & { swarmId: string } } : {}),
    })
    if (!identity) return
    useStore.setState((state) => ({
      activeRuns: {
        ...state.activeRuns,
        [runId]: {
          ...identity,
          kind: identity.kind || snap.kind,
          continuation: identity.continuation ?? snap.continuation,
          module: identity.module || snap.module,
          agent: identity.agent || snap.agent,
          status: snap.status,
          costUsd: snap.costUsd,
          willCommitToMain: snap.willCommitToMain,
          startedAt: snap.startedAt,
          plannedCount: snap.expected?.length ?? snap.agents?.length,
        },
      },
    }))
    connectScreenerRun(get, runId, subject)
  } catch {
    // No identity proof means no stream adoption. The board stays readable and the next refresh retries.
  }
}

function beginScreenerRun(
  set: any,
  get: () => State,
  runId: string,
  identity: { subject: string; swarmId: 'screener'; execution: FrozenProviderLaunch },
) {
  const { subject, swarmId, execution } = identity
  const ownsVisibleSignal = get().activeSwarm === swarmId && get().scSelectedSignal === subject
  const activeRuns = {
    ...get().activeRuns,
    [runId]: {
      ...get().activeRuns[runId], runId, ticker: subject, swarmId,
      kind: subject.startsWith('SIG-') ? 'signal' : 'sweep', status: 'running',
      provider: execution.provider, executionProfile: execution.executionProfile,
      profileKey: execution.expectedProfileKey, model: execution.model, reasoningLevel: execution.reasoningLevel,
      startedAt: Date.now(),
    },
  }
  // seed every screener orb as queued when a full signal enters the gauntlet (sweeps have no orbs)
  if (subject.startsWith('SIG-') && ownsVisibleSignal) {
    const rt: Record<string, NodeRuntime> = {}
    for (const k of get().scNodesByKey.keys()) rt[k] = { status: 'queued', runId }
    set({ activeRuns, activityOpen: true, scRuntime: rt, runStream: get().runStream.filter((r) => r.runId !== runId) })
  } else {
    set({ activeRuns, activityOpen: true })
  }
  connectScreenerRun(get, runId, subject)
  void get().refreshActiveRuns() // the kill-switch pill ("N running") tracks screener runs too
}

function closeScreenerRunSource(runId: string) {
  const es = scRunSources.get(runId)
  if (es) {
    es.close()
    scRunSources.delete(runId)
  }
  scRunSubjects.delete(runId)
}

function closeAllRunSources() {
  for (const es of runSources.values()) es.close()
  runSources.clear()
  runStreamHealth.clear()
  runStreamRetryAt.clear()
}

// A same-subject run-LOCK conflict — a run already holds this ticker's files. Force (stop it + relaunch)
// resolves these. NOT upstream_incomplete (the deps genuinely aren't on disk — force won't conjure them)
// and NOT capacity (a global cost cap across other tickers — force never bypasses it).
const LOCK_CONFLICTS = new Set(['target_conflict', 'exclusivity', 'dependency_conflict'])

// Map a launch failure to a clear toast. Admission rejections (expected, user can act) read as info;
// genuine failures read as bad. When the rejection is a same-subject lock and an `onForce` retry was
// supplied, the toast gets a one-click "Run anyway" that stops the blocking run and relaunches — so a
// conflict is never a dead end (CLAUDE.md §2: the engine must always be runnable on demand).
function launchErrorToast(get: () => State, e: any, ticker: string, what: string, onForce?: () => void) {
  const code = e?.body?.code
  const isLock = LOCK_CONFLICTS.has(code)
  const info = isLock || code === 'upstream_incomplete'
  const msg = e?.message ? String(e.message) : `Launch failed for ${what} on ${ticker}`
  // A same-subject lock means a run we may not be tracking is live for this ticker — typically one
  // started in another tab or by a headless/autonomous run, so it never entered this session's state.
  // Reconcile now: refreshActiveRuns discovers it, attaches its stream + snapshot, and lights up the
  // in-flight module in the constellation. The conflict becomes VISIBLE (not just a toast), and the
  // client-side guard will catch the next attempt with a clean "already running" — no dead-end.
  if (isLock) void get().refreshActiveRuns()
  get().setToast({
    msg,
    tone: info ? 'info' : 'bad',
    ...(isLock && onForce ? { action: { label: 'Run anyway', onClick: onForce } } : {}),
  })
}
