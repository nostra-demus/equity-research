import { create } from 'zustand'
import { api, ensureMode, isStatic } from './api'
import type { ArchiveQuery, FeedFacets, SearchCursor } from './api'
import { downstreamCascade, type CascadeNode } from './cascade'
import { displayHeadline, originalHeadline, plainRoute, plainStage } from './plain'
import type { Theme, ThemeDetail, ThemeBrief } from './themes'
import { intensityWindowForHours } from './themes'
import type { ActiveRunLite, AgentNode, BoardInboxRow, BookFilterState, BookSort, ChatMessage, ChatScope, ChatStyle, ConvictionDetail, CoverageGroup, DataStatus, EventEnrichment, FeedbackSubmitInput, FeedbackType, FeedItem, HealthState, IntensityStats, IntensityWindow, LaunchPreflight, NewsStatus, NodeRuntime, NodeStatus, ReadinessReport, ScreenerBoard, SignalIntakeInput, SseEvent, SwarmGraph, SwarmMeta, TickerSummary, Usage } from './types'
import { feedbackInputFromItem, feedbackLabel } from './feedbackTypes'
import { emptyBookFilters } from '../components/screener/BookFilters'
import { emptyReviewFilters, matchesReviewFilters, type ReviewFilterState } from '../components/screener/ReviewFilters'

// A company the user drilled into from an event (the COMPANIES NAMED chips) — the main stage then
// shows every wire story about it. listing_country/exchange ride along from the article-body read.
export interface FocusedCompany { name: string; ticker: string | null; listing_country?: string | null; exchange?: string | null }

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

// The research stage's renderer: the 3D globe (default) or the flat 2D constellation. A per-browser
// presentation preference like the theme — persisted to localStorage, never leaves the machine. Globe is
// the default; only an explicit 'constellation' choice opts out. init() coerces a stored/default 'globe'
// back to 'constellation' when WebGL is unavailable (no strand).
const VIEW_KEY = 'nsw.researchView'
function loadView(): 'constellation' | 'globe' {
  try { return localStorage.getItem(VIEW_KEY) === 'constellation' ? 'constellation' : 'globe' } catch { return 'globe' }
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

const RUN_EVENT_TYPES = ['run-started', 'agent-started', 'agent-done', 'agent-failed', 'layer-advanced', 'module-done', 'module-routed', 'cost-tick', 'run-done', 'run-error', 'readiness-checking', 'readiness-report', 'readiness-blocked', 'readiness-resolved']

// Live SSE streams for the SELECTED ticker only, keyed by runId. A ticker switch closes them all;
// background runs keep executing server-side and are rediscovered via /api/runs on return.
const runSources = new Map<string, EventSource>()
// in-flight chat turn's aborter (module-level so closeChat / scope-change / ticker-switch can cancel it
// without threading it through React state). Chat is ephemeral — one conversation at a time.
let chatAbort: AbortController | null = null
// narration style is a STICKY preference (persisted) — unlike the ephemeral conversation, the user's
// "explain it like X" choice should survive across companies and reloads. Default = plain-English 'simple'.
const CHAT_STYLE_KEY = 'nsw.chatStyle'
function loadChatStyle(): ChatStyle {
  try { const v = localStorage.getItem(CHAT_STYLE_KEY); if (v === 'simple' || v === 'analyst' || v === 'detailed') return v } catch { /* SSR / blocked storage */ }
  return 'simple'
}
let dataSource: EventSource | null = null
let bloomTimer: any = null
let pollTimer: any = null
let intensityRefetchTimer: any = null // debounces the screener intensity re-fetch on each news cycle
let selectGen = 0 // bumped on every selectTicker; async work bails if it changed (fast-switch guard)
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
const OFFLINE_THRESHOLD = 3 // consecutive GENUINE fails before the red bar (anti-flicker; ~5s end-to-end)
// A news/run SSE event within this window proves the engine is up — the live data plane is the ground
// truth, so a slow/failed health probe is overridden while the wire is demonstrably alive. Updated on every
// SSE message by _noteStreamLive(); paired with newsSource.readyState===OPEN for the event-quiet gaps.
const STREAM_LIVE_MS = 20000
let lastStreamActivityAt = 0
const HARD_DOWN = new Set<HealthState>(['engine-offline', 'your-network', 'session-expired'])

// Auto-resume of interrupted screener runs (a closed laptop / dropped connection): per-signal attempt
// bookkeeping so we never spin a persistently-failing run forever, and never double-launch one already
// resuming. Module-level (not store state) so re-attempts don't churn React. A capacity/exclusivity
// reject doesn't count as a try — it just means "wait for a slot", retried on the next board fetch.
const autoResumeTries = new Map<string, { count: number; lastAt: number }>()
const AUTO_RESUME_MAX = 3 // give up after this many real failures → fall back to the manual Continue
const AUTO_RESUME_COOLDOWN_MS = 30_000 // min gap between re-attempts of the SAME signal
const AUTO_RESUME_BATCH = 4 // most to kick off per cycle (the server's own cap gates the rest)

export interface StreamRow { runId: string; ticker: string; key: string; name: string; module: string; layer: number; status: NodeStatus; verdict?: string | null; ts: number }
export interface ActiveRun { runId: string; ticker: string; kind: string; module?: string; agent?: string; status: string; costUsd?: number; willCommitToMain?: boolean; plannedCount?: number; startedAt?: number }
// A toast may carry ONE inline action (e.g. "Run anyway" on a run-lock conflict) so a dead-end rejection
// becomes a one-click recovery. A toast with an action stays up longer (the user has to read + click it).
export interface Toast { msg: string; tone: 'info' | 'good' | 'bad'; action?: { label: string; onClick: () => void } }

// A run is "live" (counts for launch guards) only while starting/running. Finished runs linger in
// activeRuns for the panel until the next ticker switch prunes them.
const LIVE_RUN = new Set(['starting', 'running'])
const runsForTicker = (runs: Record<string, ActiveRun>, t: string | null): ActiveRun[] =>
  t ? Object.values(runs).filter((r) => r.ticker === t && LIVE_RUN.has(r.status)) : []

interface State {
  connected: boolean
  health: HealthState
  healthFailCount: number
  lastHealthOkAt: number | null
  staticMode: boolean
  dataDir: string | null
  tickers: TickerSummary[]
  emptyState: boolean
  driveEnabled: boolean // true when the server has a Drive destination + credential — gates add-company/upload UI
  defaultCoverage: CoverageGroup[] // upload-guide groups (all unmet), for the zero-folders onboarding state
  selectedTicker: string | null
  graph: SwarmGraph | null
  nodesByKey: Map<string, AgentNode>
  dataStatus: DataStatus | null
  dataLoading: boolean
  credit: Usage | null
  creditChecking: boolean
  nodeRuntime: Record<string, NodeRuntime>
  now: number // shared 1s clock for every live timer (orb/module/panel/tooltip); ticked only while orbs run
  activeRuns: Record<string, ActiveRun> // selected-ticker live runs (+ just-finished, until next switch)
  activeRunsByTicker: Set<string>
  chainTickers: Set<string> // tickers whose full run is a per-module CHAIN — defer the "complete" celebration to the master step
  selectToken: number
  runStream: StreamRow[]
  dismissRunStream: () => void // clear the persisted last-run rows (closes the run-stream side panel)
  coreBloom: boolean
  decision: any | null
  runRoot: string | null
  reports: { memo: boolean; thesis: boolean; dossier: boolean }
  // per-module three tiers (run-root-relative paths), keyed by module folder name. Generic — any module lights up.
  moduleReports: Record<string, { synthesis?: string; memo?: string; dossier?: string }>
  openOutput: { path?: string; title: string; verdict?: string | null; nodeKey?: string; pending?: boolean } | null
  // ---- chat with your data (closed-book Q&A over a scope's synthesized output) ----
  chatOpen: boolean
  chatScope: ChatScope
  chatModule?: string
  chatOrbPath?: string
  chatOrbKey?: string
  chatTitle: string
  chatModel: string
  chatStyle: ChatStyle // narration style — sticky preference, default 'simple'
  chatMessages: ChatMessage[]
  chatStreaming: boolean
  chatError?: string
  chatSource?: string // sourcePath from chat-meta — "answering from …"
  activityOpen: boolean
  scoringOpen: boolean
  callsOpen: boolean
  selectedNodeKey: string | null
  launchConfirm: { kind: 'full' | 'rerun'; preflight: LaunchPreflight; cascade?: CascadeNode[]; node?: { module: string; name: string; key: string } } | null
  toast: Toast | null

  // ---- swarms (multi-swarm cockpit; research is the grandfathered default) ----
  swarms: SwarmMeta[]
  activeSwarm: string // 'research' | 'screener' | future swarms
  // research stage renderer: the 3D globe (default) or the flat 2D constellation. Persisted.
  researchView: 'constellation' | 'globe'
  setResearchView: (v: 'constellation' | 'globe') => void
  webglOK: boolean // WebGL available — gates the globe; when false the flat DOM constellation is shown instead
  // the warp transition between swarms; landing carries an optional research ticker to preselect
  warp: { from: string; to: string; payloadTicker?: string; landTicker?: string; phase: 'collapse' | 'traverse' | 'bloom' } | null
  // screener slice (self-contained so the research paths stay untouched)
  scGraph: SwarmGraph | null
  scNodesByKey: Map<string, AgentNode>
  scRuntime: Record<string, NodeRuntime>
  scSelectedSignal: string | null // SIG id whose run folder is shown on the gauntlet
  scBoard: ScreenerBoard | null
  scRouted: Record<string, { route: string; terminal: boolean }> // module -> latest routing (lights the switchyard)
  signalIntakeOpen: boolean
  pipelineOpen: boolean
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
  selectTicker: (t: string) => Promise<void>
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
  addCompany: (ticker: string) => Promise<boolean>
  uploadFiles: (ticker: string, files: File[]) => Promise<void>
  refreshActiveRuns: () => Promise<void>
  checkCredit: () => Promise<void>
  selectNode: (key: string | null) => void
  setNow: (n: number) => void
  nodeStatus: (key: string) => NodeStatus
  activeRunsForTicker: (t: string | null) => ActiveRun[]
  anyRunForTicker: (t: string | null) => boolean
  targetInFlight: (t: string | null, keys: string[]) => boolean
  launchAgent: (node: AgentNode, force?: boolean) => Promise<void>
  launchModule: (module: string, force?: boolean) => Promise<void>
  requestFull: () => Promise<void>
  confirmFull: () => Promise<void>
  launchRerun: (node: { module: string; name: string; key: string }) => Promise<void>
  confirmRerun: () => Promise<void>
  cancelLaunch: () => void
  cancelRun: (runId: string) => Promise<void>
  readinessGate: { runId: string; report: ReadinessReport } | null // pre-flight gate panel (null = hidden)
  decideReadiness: (runId: string, action: string, ack?: string) => Promise<void>
  selectNodeForRun: (node: AgentNode) => void
  openOutputForNode: (node: AgentNode) => Promise<void>
  openThesis: () => Promise<void>
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
  sendChatMessage: (text: string) => Promise<void>
  clearChat: () => void
  openActivity: () => void
  closeActivity: () => void
  openScoring: () => void
  closeScoring: () => void
  openCalls: () => void
  closeCalls: () => void
  openCallFile: (path: string, title: string) => void
  updateCall: (ticker: string) => Promise<void>
  fileDueReview: (ticker: string, window: string) => Promise<void>
  refreshDashboard: () => Promise<void>
  setToast: (t: Toast | null) => void
  _handleEvent: (e: SseEvent) => void

  // ---- swarm/screener actions ----
  switchSwarm: (to: string, opts?: { payloadTicker?: string; landTicker?: string }) => void
  _advanceWarp: () => void
  scInit: () => Promise<void>
  scRefreshBoard: () => Promise<void>
  _maybeAutoResume: (resumable: ScreenerBoard['resumable']) => Promise<void>
  scSelectSignal: (sigId: string | null) => Promise<void>
  scNodeStatus: (key: string) => NodeStatus
  openSignalIntake: () => void
  closeSignalIntake: () => void
  submitSignal: (intake: SignalIntakeInput, until?: string) => Promise<void>
  relaunchSignal: (sigId: string) => Promise<void>
  // resume a stopped/partial signal run from where it left off — reuses the finished orbs on disk and
  // only runs the remaining ones (the gauntlet command skips completed modules). NOT a fresh restart.
  continueSignal: (sigId: string) => Promise<void>
  runSweep: () => Promise<void>
  openPipeline: () => void
  closePipeline: () => void
  setBookFilters: (f: BookFilterState) => void
  setBookSort: (s: BookSort) => void
  setBookArchivedOpen: (v: boolean) => void
  openThesisDetail: (thesisId: string) => Promise<void>
  closeThesisDetail: () => void
  sendToResearch: (thesisId: string, ticker: string, poolPresent: boolean) => Promise<void>
  openScreenerOutput: (node: AgentNode) => void
  _handleScreenerEvent: (e: SseEvent) => void
  // the persistent event rail: keep the wire backfilled+streaming whenever the screener stage is mounted,
  // let the user open one event to read it, and run the paid checks straight from that event
  scEnsureNewsStream: () => Promise<void>
  scSelectEvent: (it: FeedItem | null) => void
  scFocusCompany: (c: FocusedCompany | null) => void
  runEventChecks: (it: FeedItem, until?: string) => Promise<void>
  // shelving: set an event aside (or bring it back) — local, persisted, filters the rail
  shelvedEvents: Set<string>
  toggleShelve: (eventId: string) => void
  // card feedback ("flag as irrelevant / mis-scored / …") — flaggedEvents is a local display cache;
  // the server ledger (screener/ledger/screener_feedback.ndjson) is the source of truth
  flaggedEvents: Set<string>
  submitFeedback: (input: FeedbackSubmitInput) => Promise<void>
  undoFeedbackFlow: (feedbackId: string, eventId: string) => Promise<void>
  // fast batch review mode: a focused, filtered, keyboard-driven queue over the same wire — reuses
  // submitFeedback above, so there is exactly one storage path for both flows
  reviewOpen: boolean
  reviewFilters: ReviewFilterState
  reviewQueue: FeedItem[] // snapshotted on open / filter change — NOT live-reactive mid-review
  reviewIndex: number
  reviewSessionCount: number // in-memory only; resets every time the panel opens (never persisted)
  coveredTickers: Set<string> // "portfolio companies" proxy — fetched once per panel-open
  openReview: () => void
  closeReview: () => void
  setReviewFilters: (f: ReviewFilterState) => void
  reviewSubmit: (feedbackType: FeedbackType, reason: string) => Promise<void>
  reviewSkip: () => void
  // on-demand enrichment for the opened event (the real story / SEC items / prior coverage / related)
  enrichCache: Record<string, EventEnrichment | 'loading'>
  fetchEnrichment: (it: FeedItem) => Promise<void>

  // ---- the news wire (live scanner view) + manual board actions + kill switch ----
  newsFeedOpen: boolean
  sourcesOpen: boolean
  newsItems: FeedItem[]
  freshEvents: Set<string> // event_ids that just streamed in over SSE — drive the "new detected" glow
  newsArrivedTotal: number // monotonic count of items read off the wire (survives the 1000 cap) — paces the live themes map
  lastScan: { fetched: number; candidates: number; seq: number } | null // the latest ingest cycle's RAW fetch volume — the true "data coming in" intensity that drives the live themes-map flow
  scIntensity: IntensityStats | null // windowed intake rollup for the ThemeMap (small server aggregates)
  scIntensityWindow: IntensityWindow // derived from the "When" ribbon (themesWindow) — drives the map readout + lane mix; 'scan' = the live per-cycle path
  setIntensityWindow: (w: IntensityWindow) => Promise<void> // internal — driven by setThemesWindow; not a separate user control
  newsStatus: NewsStatus | null
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
  scFacets: FeedFacets | null // archive-wide facet counts that populate the dropdowns
  scFacetsLoading: boolean
  scRunArchiveSearch: (q: ArchiveQuery) => Promise<void> // set the filter + fetch page 1 (+ facets); empty q → LIVE mode
  scLoadMoreArchive: () => Promise<void> // fetch the next page and append
  scLoadFacets: (q: ArchiveQuery) => Promise<void> // populate the dropdowns from the archive (e.g. on mount, contextless)
  globalActive: ActiveRunLite[]
  stopListOpen: boolean
  openNewsFeed: () => Promise<void>
  closeNewsFeed: () => void
  openSources: () => void
  closeSources: () => void
  refreshNewsStatus: () => Promise<void>
  revive: () => void // wake/focus/network-return: force a health re-check + status refresh + stream reconnect
  _setNewsStreamOnline: (v: boolean) => void // internal — flips the wire-reachable flag from SSE open/close
  _noteStreamLive: () => void // internal — any SSE event proves the engine is up → flip health online instantly
  checkInboxItem: (row: BoardInboxRow) => Promise<void>
  dismissInbox: (inboxId: string) => Promise<void>
  restoreInbox: (inboxId: string) => Promise<void>
  moveThesis: (thesisId: string, to: 'watchlist' | 'provisional' | 'full_machine' | 'engine', reason?: string) => Promise<void>
  restoreConviction: (thesisId: string) => Promise<void>
  setStopListOpen: (open: boolean) => void
  stopEverything: () => Promise<void>
  _handleNewsEvent: (e: any) => void

  // ---- dynamic themes (the firehose bucketed into living, ranked investment themes) ----
  themes: Theme[]
  themesView: 'map' | 'board' | null // null = themes view closed (gauntlet/idle canvas shows)
  themesWindow: number | null // the selected time-window lookback in HOURS; null = Live (real-time)
  themesHistoryDays: number // days of real daily-flow history the engine has (gates the long windows)
  selectedTheme: string | null // open deep-dive
  themeDetail: ThemeDetail | null // the open theme's resolved members + companies-by-order
  themeBrief: ThemeBrief | null // the open theme's plain-English explainer (loaded separately, may lag the detail)
  themeBriefLoading: boolean
  themesStatus: 'idle' | 'loading' | 'ready' | 'error'
  themesLoading: boolean
  openThemes: (view: 'map' | 'board') => Promise<void>
  closeThemes: () => void
  setThemesView: (view: 'map' | 'board') => void
  setThemesWindow: (hours: number | null) => void
  selectTheme: (id: string | null) => Promise<void>
  regenerateThemeBrief: () => Promise<void>
  refreshThemes: () => Promise<void>
}

function flatten(graph: SwarmGraph): Map<string, AgentNode> {
  const m = new Map<string, AgentNode>()
  for (const mod of graph.modules) for (const a of Object.values(mod.layers).flat()) m.set(a.key, a)
  return m
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
const CHAT_RESET = { chatOpen: false, chatStreaming: false, chatMessages: [] as ChatMessage[], chatError: undefined as string | undefined, chatSource: undefined as string | undefined }

export const useStore = create<State>((set, get) => ({
  connected: true,
  health: 'connecting',
  healthFailCount: 0,
  lastHealthOkAt: null,
  staticMode: false,
  dataDir: null,
  tickers: [],
  emptyState: false,
  driveEnabled: false,
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
  credit: null,
  creditChecking: false,
  nodeRuntime: {},
  now: Date.now(),
  activeRuns: {},
  activeRunsByTicker: new Set(),
  chainTickers: new Set(),
  selectToken: 0,
  runStream: [],
  coreBloom: false,
  decision: null,
  runRoot: null,
  reports: { memo: false, thesis: false, dossier: false },
  moduleReports: {},
  openOutput: null,
  chatOpen: false,
  chatScope: 'run',
  chatModule: undefined,
  chatOrbPath: undefined,
  chatOrbKey: undefined,
  chatTitle: '',
  chatModel: 'sonnet',
  chatStyle: loadChatStyle(),
  chatMessages: [],
  chatStreaming: false,
  chatError: undefined,
  chatSource: undefined,
  activityOpen: false,
  scoringOpen: false,
  callsOpen: false,
  selectedNodeKey: null,
  launchConfirm: null,
  readinessGate: null,
  toast: null,

  swarms: [],
  // Default landing view = the screener (the live idea-generation wire). Seeded from the live-engine
  // marker (the server injects window.__ENGINE_LIVE__ into the HTML it serves) so the production app
  // paints the screener on the very first frame with no flash, while a static/read-only showcase — which
  // has no marker and can't load the live wire — seeds research and never flashes cyan→amber. init()
  // makes the authoritative decision once the mode + swarm list resolve.
  activeSwarm: typeof window !== 'undefined' && (window as any).__ENGINE_LIVE__ === true ? 'screener' : 'research',
  researchView: loadView(),
  webglOK: true, // optimistic; init() probes and corrects + coerces the view if WebGL is missing
  warp: null,
  scGraph: null,
  scNodesByKey: new Map(),
  scRuntime: {},
  scSelectedSignal: null,
  scBoard: null,
  scRouted: {},
  signalIntakeOpen: false,
  pipelineOpen: false,
  scBookFilters: emptyBookFilters(),
  scBookSort: 'rank',
  scBookArchivedOpen: false,
  scThesisDetail: null,
  scSelectedEvent: null,
  scFocusedCompany: null,
  shelvedEvents: loadShelf(),
  flaggedEvents: loadFlagged(),
  reviewOpen: false,
  reviewFilters: emptyReviewFilters(),
  reviewQueue: [],
  reviewIndex: 0,
  reviewSessionCount: 0,
  coveredTickers: new Set(),
  enrichCache: {},
  newsFeedOpen: false,
  sourcesOpen: false,
  newsItems: [],
  freshEvents: new Set(),
  newsArrivedTotal: 0,
  lastScan: null,
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
  scFacets: null,
  scFacetsLoading: false,
  newsStatus: null,
  newsStreamOnline: false,
  themes: [],
  themesView: null,
  themesWindow: null,
  themesHistoryDays: 0,
  selectedTheme: null,
  themeDetail: null,
  themeBrief: null,
  themeBriefLoading: false,
  themesStatus: 'idle',
  themesLoading: false,
  globalActive: [],
  stopListOpen: false,

  init: async () => {
    // WebGL capability gates the 3D globe. Probe once; if it's unavailable, disable the option and coerce
    // a previously-persisted 'globe' back to the flat constellation so a no-WebGL browser is never stranded.
    const webglOK = detectWebGL()
    set({ webglOK, ...(webglOK ? {} : { researchView: 'constellation' as const }) })
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
    set({ staticMode: stat })
    if (!stat) {
      get().startHealth() // begin the engine heartbeat (live mode only); idempotent across reconnects
      // live data-folder watcher (Drive sync) — backend only
      if (!dataSource) {
        dataSource = new EventSource(api.dataStreamUrl())
        dataSource.addEventListener('data-changed', (ev: MessageEvent) => {
          try {
            const d = JSON.parse(ev.data)
            if (d.ticker === get().selectedTicker) get().refreshData()
            refreshTickersSoon(get, set) // live count update + keep polling while Drive is still syncing
          } catch {}
        })
      }
      // one cheap usage probe on first connect (backend only)
      if (!creditProbed) {
        creditProbed = true
        get().checkCredit()
      }
    }
    // Landing view: the screener is the default, but ONLY when the live engine actually SERVES it
    // (CLAUDE.md §26 — research is the only guaranteed swarm; the screener is discovered, never assumed)
    // and we're live (a static/read-only showcase can't load the screener wire). Decided off the RESOLVED
    // swarm list, so the swarms:[] seed can never misfire and a research-only engine never strands the
    // user on an empty, unswitchable screener. Independent of the heavy company data, so a slow graph/
    // tickers load never delays the landing decision. scInit is idempotent + self-guarded.
    api.swarms()
      .then((swarms) => {
        set({ swarms })
        const screenerDefault = !stat && swarms.some((s) => s.id === 'screener')
        set({ activeSwarm: screenerDefault ? 'screener' : 'research' })
        if (screenerDefault) void get().scInit()
      })
      .catch(() => {
        // couldn't load the swarm list → only research is reachable (the switcher hides with one
        // swarm), so the active view MUST be research or the user is stranded with no way back
        set({ swarms: [{ id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' }], activeSwarm: 'research' })
      })
    // Load the heavy core data (graph + ticker list) resiliently: each part sets as it resolves, the
    // still-missing parts retry in the background, and NONE of it touches connected/health (the heartbeat
    // owns those). No auto-select — the cockpit opens on the "Select a company" placeholder until the user
    // picks (or adds) a company.
    void loadCore(get, set, stat, true)
  },

  selectTicker: async (t) => {
    closeAllRunSources() // stop the previous company's live streams before anything else (no event bleed)
    const token = ++selectGen
    // keep only still-live runs across tickers (drop finished); the new ticker rebuilds from snapshots
    const activeRuns = Object.fromEntries(Object.entries(get().activeRuns).filter(([, r]) => LIVE_RUN.has(r.status)))
    chatAbort?.abort(); chatAbort = null // a new company → drop any in-flight chat + its thread
    set({ selectToken: token, selectedTicker: t, dataStatus: null, dataLoading: true, nodeRuntime: {}, decision: null, runRoot: null, reports: { memo: false, thesis: false, dossier: false }, moduleReports: {}, coreBloom: false, selectedNodeKey: null, runStream: [], activeRuns, openOutput: null, ...CHAT_RESET })
    const graph = await api.swarm(t)
    if (get().selectToken !== token) return // a newer selection superseded this one
    set({ graph, nodesByKey: flatten(graph) })
    await get().refreshData()
    if (get().selectToken !== token) return
    // seed prior-run results into the swarm
    try {
      const manifest = await api.runManifest(t)
      if (get().selectToken !== token) return
      const seed: Record<string, NodeRuntime> = {}
      for (const [, agents] of Object.entries<any>(manifest.modules || {})) {
        for (const a of agents) seed[a.agentKey] = { status: 'done', verdict: a.verdict, outputPath: `${manifest.runRoot}/${a.agentKey}.md` }
      }
      if (manifest.finalThesis) seed['master/synthesizer'] = { status: 'done', outputPath: `${manifest.runRoot}/final_thesis.md` }
      set({ nodeRuntime: seed, runRoot: manifest.runRoot ?? null, reports: { memo: !!manifest.memo, thesis: !!manifest.finalThesis, dossier: !!manifest.fullDossier }, moduleReports: manifest.moduleReports ?? {} })
    } catch {}
    try {
      const decision = await api.decision(t)
      if (get().selectToken !== token) return
      set({ decision })
    } catch {
      if (get().selectToken === token) set({ decision: null })
    }
    // reconnect to EVERY run in flight for this company (concurrent runs are supported)
    try {
      const { active } = await api.activeRuns()
      if (get().selectToken !== token) return
      set({ activeRunsByTicker: new Set(active.map((r) => r.ticker)) })
      for (const r of active.filter((r) => r.ticker === t)) await reconnectRun(set, get, r.runId, token)
      schedulePoll(get, active.length > 0)
    } catch {}
  },

  refreshData: async () => {
    const t = get().selectedTicker
    if (!t) return
    // token-guard so a slow response for a just-deselected ticker can't overwrite the new selection or
    // clear its loading flag (mirrors selectTicker's selectToken invariant)
    const token = get().selectToken
    // an unusable folder name (e.g. "TATA MOTORS") would 400 on data-status — skip the fetch and let the
    // empty-state surface the rename guidance instead of failing silently
    const sel = get().tickers.find((x) => x.ticker === t)
    if (sel && sel.valid === false) { if (get().selectToken === token) set({ dataStatus: null, dataLoading: false }); return }
    set({ dataLoading: true })
    try {
      const dataStatus = await api.dataStatus(t)
      if (get().selectToken !== token) return // a newer selection superseded this fetch
      set({ dataStatus })
    } catch {
      // leave dataStatus as-is; the loading flag clears below so the UI stops showing "reading…"
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
  addCompany: async (ticker) => {
    if (get().staticMode) { get().setToast({ msg: 'Read-only showcase — add companies on your machine via npm run dev', tone: 'info' }); return false }
    try {
      await api.addCompany(ticker)
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
      set({ activeRunsByTicker: new Set(active.map((r) => r.ticker)), globalActive: active as ActiveRunLite[] })
      // live-follow: connect to any active run for the SELECTED ticker we're not already streaming. A
      // chained full run launches each step under a new runId server-side; without this the swarm would
      // go dark between steps. Benign for normal runs (it only attaches to this ticker's own live runs).
      const sel = get().selectedTicker
      if (sel) {
        const token = get().selectToken
        for (const r of active) if (r.ticker === sel && !runSources.has(r.runId)) reconnectRun(set, get, r.runId, token)
      }
      schedulePoll(get, active.length > 0)
    } catch {}
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

  // The flat constellation and the globe are the SAME WebGL scene at morph 0 / 1 — switching just changes
  // the morph target, which the scene animates as one continuous wrap/unwrap. No renderer swap.
  setResearchView: (v) => {
    if (v === 'globe' && !get().webglOK) return // never strand into a view WebGL can't render
    try { localStorage.setItem(VIEW_KEY, v) } catch {}
    set({ researchView: v })
  },

  selectNode: (key) => set({ selectedNodeKey: key }),
  setNow: (n) => set({ now: n }),

  nodeStatus: (key) => {
    const { nodeRuntime, nodesByKey, dataStatus, selectedTicker } = get()
    const rt = nodeRuntime[key]
    if (rt) return rt.status
    if (!selectedTicker || !dataStatus) return 'dormant'
    const node = nodesByKey.get(key)
    if (!node) return 'dormant'
    const mod = dataStatus.modules[node.module]
    if (mod?.status === 'Insufficient') return 'locked'
    return node.soloRunnable ? 'ready' : 'notready'
  },

  // LIVE runs for a ticker (launch-guard truth); finished runs are excluded.
  activeRunsForTicker: (t) => runsForTicker(get().activeRuns, t),
  anyRunForTicker: (t) => runsForTicker(get().activeRuns, t).length > 0,
  // is any of these orb keys already queued/running for this ticker? (disjoint-target client guard)
  targetInFlight: (t, keys) => {
    if (!runsForTicker(get().activeRuns, t).length) return false
    const rt = get().nodeRuntime
    return keys.some((k) => rt[k]?.status === 'queued' || rt[k]?.status === 'running')
  },

  launchAgent: async (node, force) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    if (!node.soloRunnable) {
      get().setToast({ msg: `${node.name} needs upstream — run the module first`, tone: 'info' })
      return
    }
    // Local launcher capturing `t` + `node` so the "Run anyway" retry forces on the ticker that PRODUCED
    // the lock, NOT get().selectedTicker read at click time — the user may switch companies while the
    // toast is up (was a cross-ticker force bug).
    const doLaunch = async (f?: boolean) => {
      try {
        const { runId } = await api.launch({ kind: 'agent', ticker: t, module: node.module, agent: node.name, force: f })
        beginRun(set, get, runId, { kind: 'agent', module: node.module, agent: node.name, willCommitToMain: false }, [node.key])
        get().setToast({ msg: `${f ? 'Re-launched' : 'Launched'} ${node.name} on ${t}`, tone: 'good' })
      } catch (e: any) {
        launchErrorToast(get, e, t, node.name, f ? undefined : () => doLaunch(true))
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
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    const planned = [...get().nodesByKey.values()].filter((n) => n.module === module).map((n) => n.key)
    // Local launcher capturing `t` so the "Run anyway" retry forces on the ticker that produced the lock.
    const doLaunch = async (f?: boolean) => {
      try {
        const { runId } = await api.launch({ kind: 'module', ticker: t, module, force: f })
        beginRun(set, get, runId, { kind: 'module', module, willCommitToMain: true }, planned)
        get().setToast({ msg: `${f ? 'Re-launched' : 'Launched'} ${module} module on ${t}`, tone: 'good' })
      } catch (e: any) {
        launchErrorToast(get, e, t, `${module} module`, f ? undefined : () => doLaunch(true))
      }
    }
    // Guard-trip offers "Run anyway" too, so a UI-live-but-dead module lock isn't a dead end (see launchAgent).
    if (!force && get().targetInFlight(t, planned)) {
      return get().setToast({ msg: `${module} is already running`, tone: 'info', action: { label: 'Run anyway', onClick: () => doLaunch(true) } })
    }
    await doLaunch(force)
  },

  requestFull: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — a full run executes on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    if (get().anyRunForTicker(t)) return get().setToast({ msg: `Finish the in-flight run on ${t} first — a full run needs exclusive access`, tone: 'info' })
    const preflight = await api.estimate('full', t)
    set({ launchConfirm: { kind: 'full', preflight } })
  },

  confirmFull: async () => {
    const t = get().selectedTicker
    if (!t) return
    if (HARD_DOWN.has(get().health)) { set({ launchConfirm: null }); return get().setToast({ msg: 'Engine offline — the run was not started.', tone: 'bad' }) }
    set({ launchConfirm: null })
    const planned = [...get().nodesByKey.keys()]
    try {
      const { runId, chained } = await api.launch({ kind: 'full', ticker: t, confirmTicker: t })
      // a chained full run is a sequence of per-module runs + master; mark the ticker so run-done defers
      // the "complete" celebration to the master step and the cockpit live-follows every step.
      if (chained) set({ chainTickers: new Set(get().chainTickers).add(t) })
      beginRun(set, get, runId, { kind: 'full', willCommitToMain: true }, planned)
      get().setToast({ msg: `Launched full run on ${t}${chained ? ' (per-module)' : ''}`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, t, 'full run')
    }
  },

  // re-run one orb + everything downstream of it (its module synthesis -> dependent module syntheses -> master Memo).
  // opens the cascade confirm dialog; confirmRerun() actually launches. Live-only.
  launchRerun: async (node) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — re-runs happen on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    const cascade = downstreamCascade(get().graph, node.module, node.name)
    if (!cascade.length) return get().setToast({ msg: `Can't resolve the downstream of ${node.name}`, tone: 'bad' })
    if (get().targetInFlight(t, cascade.map((c) => c.key))) return get().setToast({ msg: `${node.name} or its downstream is already running`, tone: 'info' })
    try {
      const preflight = await api.estimate('rerun', t, node.module, node.name)
      set({ launchConfirm: { kind: 'rerun', preflight, cascade, node } })
    } catch (e: any) {
      get().setToast({ msg: `Re-run estimate failed: ${e?.message || e}`, tone: 'bad' })
    }
  },

  confirmRerun: async () => {
    const t = get().selectedTicker
    const lc = get().launchConfirm
    if (!t || !lc?.node) return
    if (HARD_DOWN.has(get().health)) { set({ launchConfirm: null }); return get().setToast({ msg: 'Engine offline — the run was not started.', tone: 'bad' }) }
    const node = lc.node
    const planned = (lc.cascade ?? downstreamCascade(get().graph, node.module, node.name)).map((c) => c.key)
    set({ launchConfirm: null, openOutput: null })
    // Local launcher so the conflict "Run anyway" retry can re-fire with force AFTER the confirm dialog is
    // gone — node + planned are captured here, not re-read from the (now-cleared) launchConfirm.
    const doRerun = async (force?: boolean) => {
      try {
        const { runId } = await api.launch({ kind: 'rerun', ticker: t, module: node.module, agent: node.name, force })
        beginRun(set, get, runId, { kind: 'rerun', module: node.module, agent: node.name, willCommitToMain: true }, planned)
        get().setToast({ msg: `Re-running ${node.name} + downstream on ${t}`, tone: 'good' })
      } catch (e: any) {
        launchErrorToast(get, e, t, `re-run of ${node.name}`, force ? undefined : () => doRerun(true))
      }
    }
    await doRerun()
  },

  cancelLaunch: () => set({ launchConfirm: null }),

  dismissRunStream: () => set({ runStream: [] }),

  cancelRun: async (runId) => {
    try {
      await api.cancel(runId)
    } catch (e: any) {
      // never swallow silently — a failed cancel looked exactly like "it didn't cancel"
      get().setToast({ msg: `Couldn't cancel the run: ${e?.message || 'the request failed'}`, tone: 'bad' })
    }
  },

  // Resolve a run paused at the pre-flight readiness gate. The SSE events (readiness-resolved / report)
  // drive the panel open/close; here we just POST the decision and surface any rejection (412 bad ack, 409).
  decideReadiness: async (runId, action, ack) => {
    try {
      await api.readinessDecision(runId, action, ack)
      if (action === 'cancel') get().setToast({ msg: 'Run cancelled at the data check', tone: 'info' })
    } catch (e: any) {
      get().setToast({ msg: e?.message || 'Could not apply the decision', tone: 'bad' })
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
    try {
      const res = await api.thesis(t)
      set({ openOutput: { path: res.path, title: `Investment Thesis — ${t}`, verdict: get().decision?.decision ?? null, nodeKey: 'master/synthesizer' } })
    } catch {
      get().setToast({ msg: 'No final thesis yet', tone: 'info' })
    }
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
    const { reports, moduleReports, nodeRuntime, nodesByKey, graph } = get()
    const anySynth = Object.values(moduleReports).some((r) => !!r?.synthesis)
    const modules = (graph?.modules ?? []).map((m) => ({ module: m.name, present: !!moduleReports[m.name]?.synthesis }))
    const orbs = [...nodesByKey.values()].map((n) => {
      const rt = nodeRuntime[n.key]
      return { key: n.key, module: n.module, path: rt?.outputPath, title: n.name, present: rt?.status === 'done' && !!rt?.outputPath }
    })
    return { run: reports.thesis || anySynth, modules, orbs }
  },
  openChat: (scope, opts) => {
    const t = get().selectedTicker
    if (!t) { get().setToast({ msg: 'Select a company first', tone: 'info' }); return }
    // reopening the SAME scope keeps the thread; a different scope target starts fresh
    const sameScope = get().chatOpen && get().chatScope === scope && get().chatModule === opts?.module && get().chatOrbKey === opts?.orbKey
    chatAbort?.abort(); chatAbort = null
    set({
      chatOpen: true, chatScope: scope,
      chatModule: opts?.module, chatOrbPath: opts?.orbPath, chatOrbKey: opts?.orbKey,
      chatTitle: defaultChatTitle(scope, t, opts),
      chatError: undefined, chatSource: undefined, chatStreaming: false,
      ...(sameScope ? {} : { chatMessages: [] }),
    })
  },
  closeChat: () => { chatAbort?.abort(); chatAbort = null; set({ chatOpen: false, chatStreaming: false }) },
  setChatScope: (scope, opts) => {
    chatAbort?.abort(); chatAbort = null
    set({
      chatScope: scope, chatModule: opts?.module, chatOrbPath: opts?.orbPath, chatOrbKey: opts?.orbKey,
      chatMessages: [], chatStreaming: false, chatError: undefined, chatSource: undefined,
      chatTitle: defaultChatTitle(scope, get().selectedTicker || '', opts),
    })
  },
  setChatModel: (m) => set({ chatModel: m }),
  setChatStyle: (s) => { try { localStorage.setItem(CHAT_STYLE_KEY, s) } catch { /* blocked storage */ } set({ chatStyle: s }) },
  clearChat: () => { chatAbort?.abort(); chatAbort = null; set({ chatMessages: [], chatError: undefined, chatStreaming: false, chatSource: undefined }) },
  sendChatMessage: async (text) => {
    const q = text.trim()
    if (!q || get().chatStreaming) return
    if (get().staticMode) { set({ chatError: 'static-deploy' }); return }
    const ticker = get().selectedTicker
    if (!ticker) return
    const baseline = get().chatMessages
    // optimistic: append the user turn + an empty assistant turn we grow token-by-token
    set({ chatMessages: [...baseline, { role: 'user', content: q }, { role: 'assistant', content: '' }], chatStreaming: true, chatError: undefined, chatSource: undefined })
    const idx = baseline.length + 1 // index of the assistant turn we mutate
    chatAbort?.abort()
    chatAbort = new AbortController()
    await api.chatStream(
      {
        ticker, runRoot: get().runRoot ?? undefined, scope: get().chatScope,
        module: get().chatModule, orbPath: get().chatOrbPath, model: get().chatModel, style: get().chatStyle,
        messages: [...baseline, { role: 'user', content: q }],
      },
      {
        signal: chatAbort.signal,
        onMeta: (m) => set({ chatSource: m.sourcePath }),
        onToken: (tok) => {
          const msgs = get().chatMessages.slice()
          if (msgs[idx]?.role === 'assistant') { msgs[idx] = { role: 'assistant', content: msgs[idx].content + tok }; set({ chatMessages: msgs }) }
        },
        onDone: () => set({ chatStreaming: false }),
        onError: (msg) => {
          // drop the empty assistant bubble if nothing streamed, then surface the error + retry
          const msgs = get().chatMessages.slice()
          if (msgs[idx]?.role === 'assistant' && msgs[idx].content === '') msgs.splice(idx, 1)
          set({ chatMessages: msgs, chatStreaming: false, chatError: msg })
        },
      },
    )
  },

  openActivity: () => set({ activityOpen: true }),
  closeActivity: () => set({ activityOpen: false }),
  openScoring: () => set({ scoringOpen: true }),
  closeScoring: () => set({ scoringOpen: false }),
  openCalls: () => set({ callsOpen: true }),
  closeCalls: () => set({ callsOpen: false }),
  // open any analyses/ file (review JSON / thesis md / dashboard md) in the OutputReader (renders text).
  openCallFile: (path, title) => set({ openOutput: { path, title } }),

  // file an ad-hoc outcome review for one call ("update what's happened since now"). Delegates to
  // Phase 3 /research:review-decisions <ticker> ad-hoc via the launch system; the tracker auto-refreshes.
  updateCall: async (ticker) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — updates run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live updates are paused until it reconnects.', tone: 'info' })
    try {
      await api.launch({ kind: 'review', ticker, window: 'ad-hoc' })
      get().setToast({ msg: `Filing an ad-hoc review for ${ticker} — see Activity; the tracker refreshes when it lands`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, ticker, `${ticker} review`)
    }
  },
  // file a specific scheduled (due/overdue) review window — never silently ad-hoc.
  fileDueReview: async (ticker, window) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — updates run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live updates are paused until it reconnects.', tone: 'info' })
    try {
      await api.launch({ kind: 'review', ticker, window })
      get().setToast({ msg: `Filing the ${window} review for ${ticker} — see Activity`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, ticker, `${ticker} ${window} review`)
    }
  },
  // regenerate the committed markdown/JSON calls dashboard (/research:track). It is cross-ticker and
  // ignores the ticker; the launch validator requires a roster ticker, so pass an ignored placeholder.
  refreshDashboard: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — the dashboard regenerates on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker || get().tickers[0]?.ticker
    if (!t) return get().setToast({ msg: 'No company loaded to run the dashboard from', tone: 'info' })
    try {
      await api.launch({ kind: 'track', ticker: t })
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
      set({ health: 'your-network', connected: false })
      return
    }
    healthAbort?.abort()
    const ac = new AbortController()
    healthAbort = ac
    const to = setTimeout(() => ac.abort(), HEALTH_TIMEOUT_MS)
    let outcome: 'ok' | 'engine' | 'session' = 'engine'
    try {
      const r = await fetch('/api/health', { cache: 'no-store', headers: { accept: 'application/json' }, signal: ac.signal })
      const ct = r.headers.get('content-type') || ''
      if (r.headers.get('x-engine-status') === 'offline' || r.status >= 520) {
        outcome = 'engine' // the edge Worker / Cloudflare says the origin is down
      } else if (r.ok && ct.includes('application/json')) {
        const j = await r.json().catch(() => null)
        outcome = j && j.ok === true ? 'ok' : 'engine' // {ok:true}=live; {ok:false}=worker offline marker
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
      const reconnected = get().health !== 'online' // down → up (or the first connect)
      set({ health: 'online', healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
      // connection is back — re-pull the screener board so any run the engine forgot during the break
      // resumes on its own (scRefreshBoard → _maybeAutoResume). The cooldown/live guards stop doubles.
      if (reconnected && get().activeSwarm === 'screener') void get().scRefreshBoard()
    } else if (outcome === 'session') {
      set({ health: 'session-expired', connected: false })
    } else {
      // The SSE data plane is the ground truth. If a stream event arrived very recently, OR the news
      // stream socket is still OPEN (the server's 15s keep-alive holds it open and the browser would flip
      // readyState on a real drop), the engine is provably up — a slow or failed /api/health probe is a
      // false alarm, so DON'T flap to offline. This is the fix for the red "Engine offline" bar appearing
      // while the wire is plainly still streaming events.
      const wireAlive = Date.now() - lastStreamActivityAt < STREAM_LIVE_MS || newsSource?.readyState === 1
      if (wireAlive) {
        const reconnected = get().health !== 'online'
        set({ health: 'online', healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
        if (reconnected && get().activeSwarm === 'screener') void get().scRefreshBoard()
      } else {
        const n = get().healthFailCount + 1
        const health: HealthState = n >= OFFLINE_THRESHOLD ? 'engine-offline' : 'reconnecting'
        // back-fill legacy `connected` (online/reconnecting = true) so the TickerPicker dot stays consistent
        set({ health, healthFailCount: n, connected: health === 'reconnecting' })
      }
    }
  },

  _handleEvent: (e) => {
    const selected = get().selectedTicker
    // only run-started carries ticker; for every other event derive it from the owning run
    const evTicker = e.type === 'run-started' ? e.ticker : get().activeRuns[e.runId]?.ticker
    const forSelected = !evTicker || evTicker === selected

    const patch: Partial<State> = {}
    const rt = { ...get().nodeRuntime }
    const stream = get().runStream.slice()
    const upsertRow = (runId: string, key: string, name: string, module: string, layer: number, status: NodeStatus, verdict?: string | null) => {
      const i = stream.findIndex((r) => r.key === key)
      const row: StreamRow = { runId, ticker: evTicker || selected || '', key, name, module, layer, status, verdict, ts: Date.now() }
      if (i >= 0) stream[i] = row
      else stream.unshift(row)
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
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'done', verdict: e.verdict, outputPath: e.outputPath, runId: e.runId, endedAt: e.ts }
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
        if (e.rateLimit) api.credit().then((c) => set({ credit: c })).catch(() => {})
        break
      }
      case 'run-done': {
        if (get().readinessGate?.runId === e.runId) patch.readinessGate = null // a terminal event always closes the gate panel
        get().refreshActiveRuns() // drops the finished run from the dots AND connects the next chain step
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: 'done', costUsd: e.costUsd ?? r.costUsd } }
        if (r && r.ticker === selected) {
          // a chained full run finishes once PER STEP; only the master step (the last) is "complete".
          const chained = get().chainTickers.has(r.ticker)
          const isFinal = !chained || r.module === 'master'
          // keep reports/decision current as each step lands (memo/thesis stay false until the master)
          api.runManifest(selected).then((m) => {
            if (m.finalThesis) set({ nodeRuntime: { ...get().nodeRuntime, ['master/synthesizer']: { status: 'done', outputPath: `${m.runRoot}/final_thesis.md` } } })
            set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier }, moduleReports: m.moduleReports ?? get().moduleReports })
          }).catch(() => {})
          if (isFinal) {
            patch.coreBloom = true
            if (bloomTimer) clearTimeout(bloomTimer)
            bloomTimer = setTimeout(() => set({ coreBloom: false }), 4500)
            api.decision(selected).then((d) => set({ decision: d })).catch(() => {})
            if (chained) set({ chainTickers: new Set([...get().chainTickers].filter((x) => x !== r.ticker)) })
            get().setToast({ msg: 'Run complete', tone: 'good' })
          } else {
            // mid-chain step done — the next module auto-starts (and is now being streamed); show progress
            get().setToast({ msg: `${r.module || 'Module'} done — continuing the pipeline…`, tone: 'good' })
          }
        }
        break
      }
      case 'run-error': {
        if (get().readinessGate?.runId === e.runId) patch.readinessGate = null // a terminal event (incl. a generic cancel of a gate-paused run, which emits run-error not readiness-resolved) always closes the gate panel
        get().refreshActiveRuns()
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: e.status } }
        // a chained full run stops advancing when a step fails/cancels/comes back incomplete — the engine
        // won't launch the next step, so clear the chain and say exactly where it stopped.
        if (r && get().chainTickers.has(r.ticker)) {
          set({ chainTickers: new Set([...get().chainTickers].filter((x) => x !== r.ticker)) })
          if (r.ticker === selected) {
            const msg = e.status === 'incomplete'
              ? (e.message || 'The pipeline finished but the final thesis & memo were not produced.')
              : `Pipeline stopped at ${r.module || 'a step'} (${e.status}) — fix it and re-run from there.`
            get().setToast({ msg, tone: 'bad' })
            api.runManifest(selected).then((m) => set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier }, moduleReports: m.moduleReports ?? get().moduleReports })).catch(() => {})
          }
          break
        }
        if (!r || r.ticker === selected) {
          if (e.status === 'incomplete') {
            // honest signal: the process exited but the final memos weren't produced (budget/turn cut-off)
            get().setToast({ msg: e.message || 'Run finished but the final thesis & memo were not produced — re-run from the master to finish.', tone: 'bad' })
            // surface whatever DID get written so the cockpit isn't blank
            if (r && r.ticker === selected) api.runManifest(selected).then((m) => set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier }, moduleReports: m.moduleReports ?? get().moduleReports })).catch(() => {})
          } else {
            get().setToast({ msg: e.reason === 'out_of_credits' ? 'Out of credits — run could not execute' : `Run ${e.status}: ${e.reason}`, tone: 'bad' })
            if (e.reason === 'out_of_credits') patch.credit = { ok: false, reason: 'out_of_credits', checked: true }
          }
        }
        break
      }
      case 'readiness-blocked':
        // the pre-flight gate paused the run before any token spend — open the panel for the run's OWN
        // ticker (authoritative from the report, not the activeRuns lookup which may not have it yet)
        if (!selected || e.report.ticker === selected) patch.readinessGate = { runId: e.runId, report: e.report }
        break
      case 'readiness-report':
        // refresh the open gate panel (e.g. after a recheck that came back still-not-clean)
        if (get().readinessGate?.runId === e.runId) patch.readinessGate = { runId: e.runId, report: e.report }
        break
      case 'readiness-resolved':
        // any decision (proceed / override / recheck-clean / cancel) resolves the gate -> close the panel
        if (get().readinessGate?.runId === e.runId) patch.readinessGate = null
        break
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
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    chatAbort?.abort(); chatAbort = null // chat is research-only — leaving the swarm closes it
    if (reduced) {
      set({ activeSwarm: to, warp: null, openOutput: null, selectedNodeKey: null, signalIntakeOpen: false, pipelineOpen: false, scThesisDetail: null, scSelectedEvent: null, scFocusedCompany: null, newsFeedOpen: false, ...CHAT_RESET })
      if (to !== 'research') void get().scInit()
      if (opts?.landTicker) void get().selectTicker(opts.landTicker)
      return
    }
    set({ warp: { from, to, payloadTicker: opts?.payloadTicker, landTicker: opts?.landTicker, phase: 'collapse' }, openOutput: null, selectedNodeKey: null, signalIntakeOpen: false, pipelineOpen: false, scThesisDetail: null, scSelectedEvent: null, scFocusedCompany: null, newsFeedOpen: false, ...CHAT_RESET })
    if (warpTimer) clearTimeout(warpTimer)
    warpTimer = setTimeout(() => get()._advanceWarp(), 420) // collapse -> traverse
  },

  _advanceWarp: () => {
    const w = get().warp
    if (!w) return
    if (w.phase === 'collapse') {
      // mid-flight: flip the active swarm so the target constellation mounts underneath the void
      set({ warp: { ...w, phase: 'traverse' }, activeSwarm: w.to })
      if (w.to !== 'research') void get().scInit()
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
    try {
      if (!get().scGraph) {
        const g = await api.swarmGraph('screener')
        set({ scGraph: g, scNodesByKey: flatten(g) })
      }
      await get().scRefreshBoard()
      // auto-show the most recent signal on the gauntlet so the stage is never empty
      if (!get().scSelectedSignal) {
        const latest = get().scBoard?.signals?.[0]?.signal_id || get().scBoard?.live?.find((l) => l.kind === 'signal')?.subjectId || null
        if (latest) await get().scSelectSignal(latest)
      }
      // attach to any screener runs already in flight
      const live = get().scBoard?.live || []
      for (const l of live) if (!scRunSources.has(l.runId)) connectScreenerRun(get, l.runId)
      // the event rail is part of the screener stage now — keep the wire backfilled + streaming live
      void get().scEnsureNewsStream()
      // Themes is the screener's default landing view — open it on entry (the user can switch to
      // Ranked/Latest/Everything from the rail, which closes it). Guarded so it never clobbers a
      // deep-link into a specific event/company already in focus.
      if (get().themesView === null && !get().scSelectedEvent && !get().scFocusedCompany) void get().openThemes('map')
    } catch {}
  },

  // Backfill the wire from disk (restart-proof) and attach the live SSE stream, WITHOUT opening the old
  // overlay. Idempotent: connectNewsStream guards a single global source, and we only backfill when empty
  // so we never clobber items already streamed in. Drives the persistent left-rail feed.
  scEnsureNewsStream: async () => {
    void get().refreshNewsStatus()
    if (!get().newsItems.length || !get().lastScan) {
      try {
        const { items, cycles } = await api.newsFeed(2)
        const patch: Partial<State> = {}
        if (!get().newsItems.length) patch.newsItems = items
        // seed the live map from the most recent scan's RAW fetch volume so it's alive on open (not dead
        // until the next 5-min cycle). cycles come back newest-first from readFeed.
        if (cycles?.length && !get().lastScan) patch.lastScan = { fetched: cycles[0].fetched || 0, candidates: cycles[0].candidates || 0, seq: (get().lastScan?.seq || 0) + 1 }
        if (Object.keys(patch).length) set(patch)
      } catch {}
    }
    if (!get().staticMode) connectNewsStream(get)
  },

  scSelectEvent: (it) => {
    // opening any event exits the company drill-down (the CompanyView takes main-stage precedence)
    set({ scSelectedEvent: it, scFocusedCompany: null })
    if (it) void get().fetchEnrichment(it) // kick the enrichment the moment an event opens
  },

  scFocusCompany: (c) => set({ scFocusedCompany: c }),

  // ---- dynamic themes ----
  refreshThemes: async () => {
    try {
      const idx = await api.newsThemes()
      set({ themes: idx.themes, themesHistoryDays: idx.history_days || 0, themesStatus: 'ready' })
    } catch {
      set({ themesStatus: 'error' })
    }
  },
  openThemes: async (view) => {
    set({ themesView: view, scSelectedEvent: null, themesStatus: get().themes.length ? 'ready' : 'loading' })
    void get().setIntensityWindow(intensityWindowForHours(get().themesWindow)) // map readout follows the "When" window (the single control)
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
  setThemesView: (view) => set({ themesView: view, selectedTheme: null }),
  setThemesWindow: (hours) => {
    set({ themesWindow: hours })
    void get().setIntensityWindow(intensityWindowForHours(hours)) // one control: the "When" window also drives the map readout + lane mix
  },
  closeThemes: () => set({ themesView: null, selectedTheme: null, themeDetail: null, themeBrief: null, themeBriefLoading: false }),
  selectTheme: async (id) => {
    if (!id) { set({ selectedTheme: null, themeDetail: null, themeBrief: null, themeBriefLoading: false }); return }
    set({ selectedTheme: id, themeDetail: null, themeBrief: null, themesLoading: true, themeBriefLoading: true })
    // members/companies + the plain-English brief load in PARALLEL — the deep-dive renders instantly while
    // the brief (a first-time Groq read can take a beat) streams into its own slot. Each guards on the
    // still-open id so a fast click-through never lands a stale result on the new theme.
    void api.newsTheme(id).then(
      (detail) => { if (get().selectedTheme === id) set({ themeDetail: detail, themesLoading: false }) },
      () => { if (get().selectedTheme === id) set({ themesLoading: false }) },
    )
    void api.newsThemeBrief(id).then(
      (brief) => { if (get().selectedTheme === id) set({ themeBrief: brief, themeBriefLoading: false }) },
      () => { if (get().selectedTheme === id) set({ themeBriefLoading: false }) },
    )
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

  // set an event aside / bring it back (local, persisted). If the shelved event is the open one, close it.
  toggleShelve: (eventId) => {
    const next = new Set(get().shelvedEvents)
    if (next.has(eventId)) next.delete(eventId)
    else next.add(eventId)
    saveShelf(next)
    const open = get().scSelectedEvent
    set({ shelvedEvents: next, ...(open && open.event_id === eventId && next.has(eventId) ? { scSelectedEvent: null } : {}) })
  },

  // submit card feedback: mark it flagged (optimistic, local display cache), persist to the server
  // ledger, and toast a confirmation with a short-window Undo. Rolled back on a failed save.
  submitFeedback: async (input) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — feedback needs a live engine.', tone: 'info' })
    const next = new Set(get().flaggedEvents)
    next.add(input.event_id)
    saveFlagged(next)
    set({ flaggedEvents: next })
    try {
      const { feedback } = await api.submitFeedback(input)
      get().setToast({
        msg: `Feedback saved — ${feedbackLabel(input.feedback_type)}`,
        tone: 'good',
        action: { label: 'Undo', onClick: () => void get().undoFeedbackFlow(feedback.feedback_id, input.event_id) },
      })
    } catch (e: any) {
      const rollback = new Set(get().flaggedEvents)
      rollback.delete(input.event_id)
      saveFlagged(rollback)
      set({ flaggedEvents: rollback })
      get().setToast({ msg: e?.body?.error || e?.message || 'Could not save feedback', tone: 'bad' })
    }
  },
  undoFeedbackFlow: async (feedbackId, eventId) => {
    try {
      await api.undoFeedback(feedbackId)
      const next = new Set(get().flaggedEvents)
      next.delete(eventId)
      saveFlagged(next)
      set({ flaggedEvents: next })
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
      api.coveredTickers().then((tickers) => set({ coveredTickers: new Set(tickers) })).catch(() => {})
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
    const it = get().reviewQueue[get().reviewIndex]
    if (!it) return
    await get().submitFeedback(feedbackInputFromItem(it, feedbackType, reason))
    set({ reviewIndex: get().reviewIndex + 1, reviewSessionCount: get().reviewSessionCount + 1 })
  },
  // pure client-side advance — never calls the API, never counts toward the session counter
  reviewSkip: () => set({ reviewIndex: get().reviewIndex + 1 }),

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
  runEventChecks: async (it, until) => {
    // bail BEFORE tearing down the reader — submitSignal no-ops (toast only) in static/offline, and clearing
    // first would drop the user back to the empty constellation on a confusing no-op, losing their place.
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
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
    }, until) // until = target module to run THROUGH then stop (undefined = the full gauntlet)
  },

  scRefreshBoard: async () => {
    try {
      const scBoard = await api.screenerBoard()
      set({ scBoard })
      // a partial run the engine forgot (it came back after a break) shows up here as resumable — pick
      // it back up on its own so the user never has to hunt for a "failed" run and click Continue.
      void get()._maybeAutoResume(scBoard.resumable)
    } catch {}
  },

  // Auto-resume every interrupted (non-terminal, non-aborted) partial run the server surfaced. Fires on
  // each board fetch (cockpit open, reconnect, the live-book's 30s tick), so a run resumes the moment the
  // connection is back. Capped + cooled-down so a genuinely-broken run can't loop, and capacity rejects
  // are retried (not counted) on the next fetch. The selected run animates; the rest run in the background.
  _maybeAutoResume: async (resumable) => {
    if (get().staticMode || HARD_DOWN.has(get().health) || get().activeSwarm !== 'screener') return
    const list = (resumable || []).filter((r) => {
      const t = autoResumeTries.get(r.sigId)
      if (t && t.count >= AUTO_RESUME_MAX) return false // gave up — manual Continue from here
      if (t && Date.now() - t.lastAt < AUTO_RESUME_COOLDOWN_MS) return false // still cooling down
      return true
    })
    if (!list.length) return
    let resumed = 0
    for (const r of list.slice(0, AUTO_RESUME_BATCH)) {
      const prev = autoResumeTries.get(r.sigId)
      autoResumeTries.set(r.sigId, { count: (prev?.count || 0) + 1, lastAt: Date.now() })
      try {
        const { runId } = await api.launchSignal({ sigId: r.sigId })
        // if this is the run the user is watching, keep its finished orbs and re-queue the rest so the
        // constellation animates exactly where it stopped (mirrors continueSignal). Background runs just
        // run server-side; the board reflects them on the next fetch (we don't wire their SSE into the
        // selected constellation, whose orb keys are module-relative and would collide).
        if (get().scSelectedSignal === r.sigId) {
          const done = { ...get().scRuntime }
          const rt: Record<string, NodeRuntime> = {}
          for (const k of get().scNodesByKey.keys()) rt[k] = done[k]?.status === 'done' ? done[k] : { status: 'queued', runId }
          set({ scRuntime: rt })
          connectScreenerRun(get, runId)
        }
        resumed++
      } catch (e: any) {
        // no slot right now (cap) or it's already in flight — not a real failure; un-count so the next
        // board fetch retries it as soon as capacity frees, instead of burning a try.
        const code = e?.body?.code
        if (code === 'capacity' || code === 'exclusivity') {
          if (prev) autoResumeTries.set(r.sigId, prev)
          else autoResumeTries.delete(r.sigId)
        }
      }
    }
    if (resumed) {
      void get().refreshActiveRuns()
      get().setToast({
        msg: resumed === 1 ? 'Resuming an interrupted run — picking up where the connection dropped' : `Resuming ${resumed} interrupted runs — picking up where they left off`,
        tone: 'good',
      })
    }
  },

  // load one signal's run folder onto the gauntlet: seed orb states from its saved outputs
  scSelectSignal: async (sigId) => {
    set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {} })
    if (!sigId) return
    try {
      const m = await api.screenerRun(sigId)
      if (get().scSelectedSignal !== sigId) return
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
    } catch {
      if (get().scSelectedSignal === sigId) set({ scRuntime: {}, scRouted: {} })
    }
  },

  scNodeStatus: (key) => {
    const rt = get().scRuntime[key]
    if (rt) return rt.status
    return get().scSelectedSignal ? 'dormant' : 'dormant'
  },

  openSignalIntake: () => set({ signalIntakeOpen: true }),
  closeSignalIntake: () => set({ signalIntakeOpen: false }),

  submitSignal: async (intake, until) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const { runId, preflight } = await api.launchSignal({ intake, until })
      set({ signalIntakeOpen: false })
      const sigId = preflight.ticker
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {} })
      beginScreenerRun(set, get, runId, sigId)
      get().setToast({ msg: `Checks started for ${sigId} — watch them run left to right`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not start the checks', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  // re-run an existing signal (e.g. a PARK the human overrides, or an inbox row promoted to a run)
  relaunchSignal: async (sigId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const { runId } = await api.launchSignal({ sigId })
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {}, pipelineOpen: false })
      beginScreenerRun(set, get, runId, sigId)
      get().setToast({ msg: `Re-running the checks for ${sigId}`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not start the checks', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  // RESUME a stopped run: relaunch the same signal but KEEP the orbs that already finished (the gauntlet
  // command skips any module whose synthesis is already on disk, so only the remaining orbs actually run).
  // Unlike relaunchSignal (a clean restart), this preserves the done orbs so the constellation picks up
  // exactly where it stopped — 3 done, the rest queued → running.
  continueSignal: async (sigId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      // make sure we hold the authoritative finished-orb set from disk before relaunching
      if (get().scSelectedSignal !== sigId || !Object.keys(get().scRuntime).length) await get().scSelectSignal(sigId)
      const done = { ...get().scRuntime } // the orbs already finished (loaded from disk / frozen from the stop)
      const { runId } = await api.launchSignal({ sigId })
      // keep finished orbs as-is; re-queue everything else under the new runId so they animate as they run
      const rt: Record<string, NodeRuntime> = {}
      for (const k of get().scNodesByKey.keys()) rt[k] = done[k]?.status === 'done' ? done[k] : { status: 'queued', runId }
      set({ scSelectedSignal: sigId, scRuntime: rt, pipelineOpen: false })
      connectScreenerRun(get, runId)
      void get().refreshActiveRuns()
      get().setToast({ msg: `Resuming ${sigId} — picking up where it stopped`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Could not resume the checks', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  runSweep: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — sweeps run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const { runId } = await api.launchSweep()
      beginScreenerRun(set, get, runId, 'sweep')
      get().setToast({ msg: 'Looking for news — new items will appear in the Inbox when done', tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'The news scan could not start', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  openPipeline: () => {
    set({ pipelineOpen: true, newsFeedOpen: false }) // one overlay at a time — the wire yields to the board
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

  // The handoff: seed data/<TICKER>/ from the locked thesis (idempotent server-side), then warp to
  // the research swarm with the ticker preselected. The research run itself stays a separate,
  // human-confirmed launch — if the pool already has filings we open the full-run confirm on landing.
  sendToResearch: async (thesisId, ticker, poolPresent) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — handoffs run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const res = await api.handoff(thesisId, ticker)
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
    }
  },

  // ---- the news wire: watch the scanner live ----
  openNewsFeed: async () => {
    set({ newsFeedOpen: true, pipelineOpen: false, scThesisDetail: null })
    void get().refreshNewsStatus()
    try {
      const { items } = await api.newsFeed(get().feedWindowDays || 2)
      set({ newsItems: items })
    } catch {
      set({ newsItems: [] })
    }
    if (!get().staticMode) connectNewsStream(get)
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
  scRunArchiveSearch: async (q: ArchiveQuery) => {
    const active = !!(q.themes?.length || q.country || q.geoRegion || q.source || q.band || q.size || q.linkage || q.gicsSector || q.gicsSubSector || (q.text && q.text.trim()))
    if (!active) { // back to LIVE mode — drop the archive snapshot, keep the live wire
      archiveToken++
      set({ scArchiveQuery: {}, scArchiveResults: [], scArchiveCursor: null, scArchiveLoading: false, scArchiveLoadingMore: false, scArchiveScannedThrough: null, scArchiveExhausted: false })
      // Restore the FULL-archive facets so the Geography (and other) dropdowns show every option again.
      // A prior active search overwrote scFacets with filter-narrowed facets; without this reload, clearing
      // a non-geo filter (e.g. a sector) would leave the country dropdown stuck on that sector's subset.
      void get().scLoadFacets({})
      return
    }
    const token = ++archiveToken
    facetsToken++ // this contextful facets load supersedes any in-flight contextless scLoadFacets
    set({ scArchiveQuery: q, scArchiveLoading: true, scFacetsLoading: true })
    try {
      const [res, facets] = await Promise.all([api.newsSearch(q, { limit: 60 }), api.newsFacets(q)])
      if (token !== archiveToken) return // a newer search superseded this one
      set({ scArchiveResults: res.items, scArchiveCursor: res.nextCursor, scArchiveScannedThrough: res.scannedThroughDate, scArchiveExhausted: res.exhausted, scArchiveLoading: false, scFacets: facets, scFacetsLoading: false })
    } catch {
      if (token !== archiveToken) return
      set({ scArchiveResults: [], scArchiveCursor: null, scArchiveExhausted: true, scArchiveLoading: false, scFacetsLoading: false })
    }
  },
  scLoadFacets: async (q: ArchiveQuery) => {
    const token = ++facetsToken
    set({ scFacetsLoading: true })
    try {
      const f = await api.newsFacets(q)
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
      const res = await api.newsSearch(scArchiveQuery, { cursor: scArchiveCursor, limit: 60 })
      if (token !== archiveToken) return // the filter changed mid-page — discard this page
      const seen = new Set(get().scArchiveResults.map((i) => i.event_id))
      const fresh = res.items.filter((i) => !seen.has(i.event_id))
      set({ scArchiveResults: [...get().scArchiveResults, ...fresh], scArchiveCursor: res.nextCursor, scArchiveScannedThrough: res.scannedThroughDate, scArchiveExhausted: res.exhausted, scArchiveLoadingMore: false })
    } catch {
      set({ scArchiveLoadingMore: false })
    }
  },
  openSources: () => set({ sourcesOpen: true }),
  closeSources: () => set({ sourcesOpen: false }),
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
    // a live SSE event is the data plane proving itself — flip to online INSTANTLY (don't wait for the next
    // health poll). This is what makes recovery feel instant and stops a false "offline" while events flow.
    // Guarded so it only writes state on an actual transition (no re-render churn when already online).
    if (get().health !== 'online') set({ health: 'online', healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
  },
  // Wake / tab-refocus / network-return: pull everything back to live at once instead of waiting for the
  // next 20s health beat (and, for the news status + stream, which had no wake hook at all, ever).
  revive: () => {
    if (get().staticMode) return
    get().checkHealthNow() // force an immediate /api/health probe (no-op if the loop isn't running)
    void get().refreshNewsStatus() // re-pull the scanner status (bounded fetch — always settles)
    reviveNewsStream(get) // re-create the news SSE if it died (CLOSED) — browser auto-reconnect can give up
  },
  _handleNewsEvent: (e) => {
    // The server emits this the instant the SSE opens — it proves the wire is reachable even before any
    // item arrives, so the rail can leave "connecting to the scanner…" without waiting on the status fetch.
    if (e?.type === 'news-connected') {
      set({ newsStreamOnline: true })
      void get().refreshNewsStatus() // a status fetch that failed at boot recovers the moment the stream opens
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
    } else if (e?.type === 'news-cycle') {
      void get().refreshNewsStatus()
      // the cycle's RAW fetch volume drives the live themes map's scanning flow — top it up each scan
      const sum = (e as any).summary
      if (sum && typeof sum.fetched === 'number') set({ lastScan: { fetched: sum.fetched, candidates: sum.candidates || 0, seq: (get().lastScan?.seq || 0) + 1 } })
      // keep the chosen intensity window live as cycles land (debounced; the rollup is a tiny aggregate)
      if (get().themesView && get().scIntensityWindow !== 'scan') {
        if (intensityRefetchTimer) clearTimeout(intensityRefetchTimer)
        intensityRefetchTimer = setTimeout(() => void get().setIntensityWindow(get().scIntensityWindow), 1200)
      }
      if (get().activeSwarm === 'screener') void get().scRefreshBoard() // the board is screener UI — don't refetch it from the research swarm every cycle
    } else if (e?.type === 'theme-update' && e.theme) {
      // upsert the changed theme; the map/board re-rank from the array. Only when the themes view is
      // open (otherwise we'd hold stale themes until next open anyway).
      if (get().themesView === null && !get().themes.length) return
      const t = e.theme as Theme
      const cur = get().themes
      const i = cur.findIndex((x) => x.theme_id === t.theme_id)
      const next = i >= 0 ? cur.map((x) => (x.theme_id === t.theme_id ? t : x)) : [...cur, t]
      next.sort((a, b) => b.composite - a.composite)
      set({ themes: next })
    }
  },

  // promote one Inbox row into the paid gauntlet (the component shows the two-click cost confirm)
  checkInboxItem: async (row) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — checks run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const { runId, preflight } = await api.launchSignal({
        intake: { headline: row.headline, source_url: row.url, source_name: row.source_name, input_nature: (row.input_nature as any) || 'news_headline' },
        inboxId: row.inbox_id,
      })
      const sigId = preflight.ticker
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {}, pipelineOpen: false })
      beginScreenerRun(set, get, runId, sigId)
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
    const rt = { ...get().scRuntime }
    const stream = get().runStream.slice()
    const upsert = (runId: string, key: string, name: string, module: string, layer: number, status: NodeStatus, verdict?: string | null) => {
      const i = stream.findIndex((r) => r.key === key)
      const row: StreamRow = { runId, ticker: get().scSelectedSignal || 'screener', key, name, module, layer, status, verdict, ts: Date.now() }
      if (i >= 0) stream[i] = row
      else stream.unshift(row)
    }
    switch (e.type) {
      case 'agent-started':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'running', runId: e.runId, startedAt: e.ts, endedAt: undefined }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'running')
        break
      case 'agent-done':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'done', verdict: e.verdict, outputPath: e.outputPath, runId: e.runId, endedAt: e.ts }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'done', e.verdict)
        break
      case 'agent-failed':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'failed', runId: e.runId, endedAt: e.ts }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'failed')
        break
      case 'module-routed': {
        const scRouted = { ...get().scRouted, [e.module]: { route: e.route, terminal: e.terminal } }
        set({ scRouted })
        if (e.terminal) get().setToast({ msg: `Stopped at "${plainStage(e.module)}": ${plainRoute(e.route)}. A normal outcome, not a failure.`, tone: 'info' })
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
        const sig = get().scSelectedSignal
        if (sig) void get().scSelectSignal(sig) // reload saved outputs + final routing lights
        get().setToast({ msg: 'Checks finished', tone: 'good' })
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
        // a stopped/failed signal run: reload the truthful finished-orb set from disk (the done orbs stay
        // done, the rest fall back to dormant) so the constellation shows exactly what completed — and the
        // Continue button can resume from there. A user STOP reads as a calm pause, not a failure.
        const sig = get().scSelectedSignal
        if (sig) void get().scSelectSignal(sig)
        const stopped = /cancel/i.test(String(e.reason || ''))
        // A user STOP reads as a calm pause. An interruption (connection drop / killed mid-run) is NOT a
        // failure: the finished checks are saved and scRefreshBoard above re-pulls the board, so the run
        // surfaces as resumable and _maybeAutoResume picks it up on its own (its "Resuming…" toast then
        // replaces this one). No scary error — exactly what the engine just did, said plainly.
        get().setToast(stopped
          ? { msg: 'Stopped — your finished checks are saved. Press Continue to resume from here.', tone: 'info' }
          : { msg: 'The run paused — your finished checks are saved; it resumes on its own when the connection is back.', tone: 'info' })
        break
      }
    }
    set({ scRuntime: rt, runStream: stream })
  },
}))

// DEV-only: expose the store so live timer/ETA visuals can be exercised locally without paying for a real
// run (simulate running orbs via __store.setState). Tree-shaken out of the production build.
if (import.meta.env.DEV && typeof window !== 'undefined') (window as any).__store = useStore

function beginRun(set: any, get: () => State, runId: string, info: { kind: string; module?: string; agent?: string; willCommitToMain?: boolean }, plannedKeys: string[]) {
  const ticker = get().selectedTicker || ''
  const rt = { ...get().nodeRuntime }
  for (const k of plannedKeys) rt[k] = { status: 'queued', runId }
  if (info.kind === 'full') rt['master/synthesizer'] = { status: 'queued', runId }
  const plannedCount = plannedKeys.length + (info.kind === 'full' ? 1 : 0)
  // drop finished runs for this ticker, add the new live one (other tickers' / other runs' state kept)
  const activeRuns = Object.fromEntries(Object.entries(get().activeRuns).filter(([, r]) => r.ticker !== ticker || LIVE_RUN.has(r.status)))
  activeRuns[runId] = { runId, ticker, ...info, status: 'running', plannedCount, startedAt: Date.now() }
  // close the output panel so the user is dropped back to the swarm to watch the run live; keep
  // other concurrent runs' stream rows, just clear any stale rows from this runId
  set({ activeRuns, nodeRuntime: rt, runStream: get().runStream.filter((r) => r.runId !== runId), coreBloom: false, selectedNodeKey: null, openOutput: null })
  connectRun(get, runId)
  get().refreshActiveRuns()
}

// open the live SSE for a run and pipe its events (incl. the server's replayed backlog) into the store.
// Does NOT close other runs' streams — concurrent same-ticker runs each get their own EventSource.
function connectRun(get: () => State, runId: string) {
  if (runSources.has(runId)) return
  const es = new EventSource(api.runStreamUrl(runId))
  for (const t of RUN_EVENT_TYPES) {
    es.addEventListener(t, (ev: MessageEvent) => {
      get()._noteStreamLive() // run traffic also proves the engine is up — keep the indicator green
      try {
        get()._handleEvent(JSON.parse(ev.data))
      } catch {}
    })
  }
  es.onerror = () => { /* keep open; server may still be streaming */ }
  runSources.set(runId, es)
}

// rebuild the live view for one in-flight run from its snapshot, then attach the stream.
// Merges into the existing view so multiple concurrent runs for the ticker coexist.
async function reconnectRun(set: any, get: () => State, runId: string, token: number) {
  try {
    const snap = await api.runSnapshot(runId)
    if (get().selectToken !== token) return
    const rt = { ...get().nodeRuntime }
    const stream = get().runStream.filter((r) => r.runId !== runId)
    for (const a of snap.agents || []) {
      rt[a.key] = { status: a.status, verdict: a.verdict ?? null, outputPath: a.outputPath, runId }
      if (a.status !== 'queued') stream.unshift({ runId, ticker: snap.ticker, key: a.key, name: a.name, module: a.module, layer: a.layer, status: a.status, verdict: a.verdict ?? null, ts: Date.now() })
    }
    const plannedCount = (snap.expected?.length ?? snap.agents?.length ?? 0) + (snap.kind === 'full' ? 1 : 0)
    const activeRuns = { ...get().activeRuns, [runId]: { runId, ticker: snap.ticker, kind: snap.kind, module: snap.module, agent: snap.agent, status: snap.status, costUsd: snap.costUsd, willCommitToMain: snap.willCommitToMain, plannedCount, startedAt: snap.startedAt } }
    set({ activeRuns, nodeRuntime: rt, runStream: stream })
    connectRun(get, runId)
  } catch {}
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
          set({ tickers: tk.tickers, emptyState: tk.emptyState, defaultCoverage: tk.coverage ?? [], dataDir: (tk as any).dataDir ?? null, driveEnabled: (tk as any).driveEnabled ?? false })
          reconcileSelection(get, set) // a reconnect may carry a now-removed selection — drop it
        })
        .catch(() => {}),
    )
  if (withCredit) jobs.push(api.credit().then((c) => set({ credit: c })).catch(() => {}))
  await Promise.all(jobs) // every job is .catch'd → this never rejects
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
    set({ selectedTicker: null, dataStatus: null, dataLoading: false, decision: null, runRoot: null, nodeRuntime: {}, reports: { memo: false, thesis: false, dossier: false }, moduleReports: {}, selectedNodeKey: null, openOutput: null })
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
      set({ tickers: t.tickers, emptyState: t.emptyState, defaultCoverage: t.coverage ?? get().defaultCoverage, dataDir: (t as any).dataDir ?? get().dataDir, driveEnabled: (t as any).driveEnabled ?? get().driveEnabled })
      const removed = reconcileSelection(get, set)
      if (removed) get().setToast({ msg: `${removed} is no longer in the data folder — pick a ticker`, tone: 'info' })
      if (tickersSyncTimer) { clearTimeout(tickersSyncTimer); tickersSyncTimer = null }
      if (!get().staticMode && t.tickers.some((x) => x.syncing)) tickersSyncTimer = setTimeout(() => refreshTickersSoon(get, set), 5000)
    })
    .catch(() => {})
}

function schedulePoll(get: () => State, keepGoing: boolean) {
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null }
  if (keepGoing && !get().staticMode) pollTimer = setTimeout(() => get().refreshActiveRuns(), 5000)
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
}

// ---- the news wire's live stream (one global EventSource, like dataSource) ----
// "new detected" glow: an event_id stays in freshEvents for FRESH_MS after it streams in, then clears
// itself so the glow plays exactly once. Timers tracked here so a re-seen id resets cleanly.
const FRESH_MS = 2600
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
  for (const t of ['news-connected', 'news-item', 'news-cycle', 'theme-update']) {
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
// Wake / focus / network-return: re-create the news stream if it died (CLOSED) or was never opened. A
// healthy or still-connecting source is left untouched so a focus event never stacks a duplicate stream.
function reviveNewsStream(get: () => State) {
  if (isStatic()) return
  if (newsSource && newsSource.readyState !== 2) return
  if (newsSource) { try { newsSource.close() } catch {} ; newsSource = null }
  if (newsRetryTimer) { clearTimeout(newsRetryTimer); newsRetryTimer = null }
  newsRetry = 0
  connectNewsStream(get)
}

// ---- screener run streams (separate map so research streams are never disturbed) ----
const scRunSources = new Map<string, EventSource>()
// Handoff runs being watched for completion: runId → toast context. The launch API returns as soon
// as the CLI spawns, so "memo seeded" is only true at run-done — these runs get a tailored
// completion/failure toast instead of the generic "Screener run complete".
const scHandoffWatch = new Map<string, { ticker: string; poolPresent: boolean }>()
let warpTimer: any = null

// Terminal routing values mirror the SWARM.md routing contract. Kept as a display heuristic only —
// the server's module-routed events carry the authoritative `terminal` flag; this covers seeding
// from saved run folders where only the routing string is known.
const TERMINAL_ROUTES = new Set(['log', 'park', 'suppress', 'watchlist_no_source', 'watchlist_no_world_change', 'return_to_m0_2', 'watchlist_no_edge'])
function isTerminalRoute(route: string): boolean {
  return TERMINAL_ROUTES.has(String(route).toLowerCase())
}

function connectScreenerRun(get: () => State, runId: string) {
  if (scRunSources.has(runId)) return
  const es = new EventSource(api.runStreamUrl(runId))
  for (const t of RUN_EVENT_TYPES) {
    es.addEventListener(t, (ev: MessageEvent) => {
      get()._noteStreamLive() // screener run traffic also proves the engine is up — keep the indicator green
      try {
        get()._handleScreenerEvent(JSON.parse(ev.data))
      } catch {}
    })
  }
  es.onerror = () => { /* keep open; server may still be streaming */ }
  scRunSources.set(runId, es)
}

function beginScreenerRun(set: any, get: () => State, runId: string, subject: string) {
  // seed every screener orb as queued when a full signal enters the gauntlet (sweeps have no orbs)
  if (subject.startsWith('SIG-')) {
    const rt: Record<string, NodeRuntime> = {}
    for (const k of get().scNodesByKey.keys()) rt[k] = { status: 'queued', runId }
    set({ scRuntime: rt, runStream: get().runStream.filter((r) => r.runId !== runId) })
  }
  connectScreenerRun(get, runId)
  void get().refreshActiveRuns() // the kill-switch pill ("N running") tracks screener runs too
}

function closeScreenerRunSource(runId: string) {
  const es = scRunSources.get(runId)
  if (es) {
    es.close()
    scRunSources.delete(runId)
  }
}

function closeAllRunSources() {
  for (const es of runSources.values()) es.close()
  runSources.clear()
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
  get().setToast({
    msg,
    tone: info ? 'info' : 'bad',
    ...(isLock && onForce ? { action: { label: 'Run anyway', onClick: onForce } } : {}),
  })
}
