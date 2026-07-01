import { staticPromptPath } from './prompts'
import { DEFAULT_RANK_WEIGHTS, type RankWeights, type RankWeightsState } from './rankWeights'
import type { ActivityQuery, ActivityResult, CallsResult, ChatRequest, ChatScopes, CoverageGroup, DataStatus, EventEnrichment, FeedbackRecord, FeedbackSubmitInput, FeedbackSummary, FeedbackType, FeedItem, IntensityStats, IntensityWindow, LaunchPreflight, NewsCycle, NewsStatus, ScreenerBoard, SignalIntakeInput, SourcesReport, SwarmGraph, SwarmMeta, TickerSummary, UploadResult, Usage, Whoami } from './types'

const BASE = import.meta.env.BASE_URL

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

// Every control-plane GET is time-bounded. A bare fetch with no timeout can hang forever on a dead
// socket (tunnel dropped, laptop asleep mid-request) and, when it gates boot (swarm/tickers), pin the
// whole UI at "connecting". AbortSignal.timeout makes a hang a bounded failure the caller can retry —
// the same pattern the enrich call already uses. Default ~15s covers a cold engine + the tunnel hop +
// heavy JSON; pass a shorter budget for small, frequently-polled endpoints (e.g. news status).
async function get<T>(url: string, timeoutMs = 15_000): Promise<T> {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json() as Promise<T>
}
async function post<T>(url: string, body?: any): Promise<T> {
  // Only set the JSON content-type when there's actually a body. A bodyless POST (cancel, credit-check)
  // sent WITH content-type: application/json makes Fastify reject it 400 FST_ERR_CTP_EMPTY_JSON_BODY
  // before the route even runs — the real cause of the "cancel didn't work" bug.
  const r = await fetch(url, {
    method: 'POST',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error((j as any)?.error || `${r.status}`), { status: r.status, body: j })
  return j as T
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

const STATIC_ERR = () => Object.assign(new Error('static-deploy'), { static: true })

const EMPTY_BOARD: ScreenerBoard = { generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], counts: {}, live: [] }
const EMPTY_FEEDBACK_SUMMARY: FeedbackSummary = { total: 0, active_total: 0, by_type: {} as Record<FeedbackType, number>, top_reasons: [], generated_at: '' }

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
  text?: string
}
export interface SearchCursor { ts: string; id: string }
export interface FeedSearchResponse {
  items: FeedItem[]
  nextCursor: SearchCursor | null
  scannedThroughDate: string | null // oldest day scanned — "searched all history back to <date>"
  exhausted: boolean // true = reached the archive floor (genuinely nothing older)
}
export interface FacetCount { key: string; label: string; count: number; parent?: string }
export interface FeedFacets {
  countries: FacetCount[] // parent = continent
  regions: FacetCount[] // continents
  sectors: FacetCount[]
  subSectors: FacetCount[] // parent = sector
  sources: FacetCount[]
  themes: FacetCount[]
  total: number
  builtThroughDate: string | null
  builtAt: string
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
  if (q.text?.trim()) p.set('text', q.text.trim())
  return p
}

export const api = {
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
  screenerBoard: async (): Promise<ScreenerBoard> => {
    if ((await ensureMode()) === 'static') return snap.screenerBoard || EMPTY_BOARD
    return get<ScreenerBoard>(`/api/screener/board`)
  },
  screenerRun: async (sigId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.screenerRuns?.[sigId] || null
    return get(`/api/screener/run?sig_id=${encodeURIComponent(sigId)}`)
  },
  screenerThesis: async (thesisId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.screenerTheses?.[thesisId] || null
    return get(`/api/screener/thesis/${encodeURIComponent(thesisId)}`)
  },
  screenerCandidates: async (thesisId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.screenerCandidates?.[thesisId] || null
    return get(`/api/screener/candidates/${encodeURIComponent(thesisId)}`)
  },
  launchSignal: async (body: { sigId?: string; intake?: SignalIntakeInput; inboxId?: string; until?: string }): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, { kind: 'signal', ...body })
  },
  launchSweep: async (): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, { kind: 'sweep' })
  },
  // ---- the news wire (auto-scanner visibility + human actions) ----
  newsStatus: async (): Promise<NewsStatus> => {
    if ((await ensureMode()) === 'static')
      return { enabled: false, running: false, intervalMin: 15, model: '', rssEnabled: false, lastCycleAt: null, nextCycleAt: null, lastNote: null, today: { read: 0, kept: 0, dropped: 0, cycles: 0 }, budget: { requests: 0, tokens: 0, reqCap: 0, tokenCap: 0 } }
    return get(`/api/news/status`, 8_000) // small + polled every 60s — a short budget keeps the rail snappy
  },
  newsSources: async (): Promise<SourcesReport> => {
    if ((await ensureMode()) === 'static') return { updated_at: new Date().toISOString(), counts: { total: 0, healthy: 0, quiet: 0, failing: 0, idle: 0 }, sources: [] }
    return get(`/api/news/sources`)
  },
  newsFeed: async (days = 2): Promise<{ items: FeedItem[]; cycles: NewsCycle[] }> => {
    if ((await ensureMode()) === 'static') return { items: [], cycles: [] }
    return get(`/api/news/feed?days=${Math.max(1, Math.floor(days))}`)
  },
  // Archive-spanning, server-filtered search over the WHOLE since-inception archive (not the 2-day wire).
  // Recency-ordered, (ts,event_id) cursor paging. Empty in static showcase mode (no engine).
  newsSearch: async (q: ArchiveQuery, opts: { cursor?: SearchCursor | null; limit?: number } = {}): Promise<FeedSearchResponse> => {
    if ((await ensureMode()) === 'static') return { items: [], nextCursor: null, scannedThroughDate: null, exhausted: true }
    const p = archiveQueryParams(q)
    if (opts.cursor) { p.set('cursorTs', opts.cursor.ts); p.set('cursorId', opts.cursor.id) }
    if (opts.limit) p.set('limit', String(opts.limit))
    return get(`/api/news/search?${p.toString()}`)
  },
  // The available geographies (country + continent) / sectors / sub-sectors / sources / themes WITH COUNTS
  // over the whole archive, honouring the active filter — what populates the dropdowns with archive truth.
  newsFacets: async (q: ArchiveQuery = {}): Promise<FeedFacets> => {
    if ((await ensureMode()) === 'static') return { countries: [], regions: [], sectors: [], subSectors: [], sources: [], themes: [], total: 0, builtThroughDate: null, builtAt: '' }
    return get(`/api/news/facets?${archiveQueryParams(q).toString()}`)
  },
  newsStreamUrl: () => `/api/news/stream`,
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
  // the living themes the firehose is bucketed into (ranked index + one theme's deep-dive)
  newsThemes: async (): Promise<import('./themes').ThemesIndex> => {
    if ((await ensureMode()) === 'static') return { generated_at: '', themes: [], counts: { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 }, history_days: 0 }
    return get(`/api/news/themes`)
  },
  newsTheme: async (id: string): Promise<import('./themes').ThemeDetail | null> => {
    if ((await ensureMode()) === 'static') return null
    return get(`/api/news/themes/${encodeURIComponent(id)}`)
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
  enrichEvent: async (it: Pick<FeedItem, 'event_id' | 'url' | 'headline' | 'companies' | 'event_types' | 'scope'>): Promise<EventEnrichment> => {
    if ((await ensureMode()) === 'static') return { event_id: it.event_id, ok: false, fetched_at: new Date().toISOString(), prior_coverage: [], related: [], note: 'Read-only showcase — enrichment runs on your machine.' }
    const qs = new URLSearchParams({ event_id: it.event_id })
    if (it.url) qs.set('url', it.url)
    if (it.headline) qs.set('headline', it.headline)
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
  screenerCalibration: async (): Promise<any | null> => {
    if ((await ensureMode()) === 'static') return snap.screenerCalibration || null
    return get<any>(`/api/screener/calibration`)
  },
  cancelAllRuns: async (): Promise<{ ok: boolean; cancelled: string[] }> => {
    if ((await ensureMode()) === 'static') return { ok: true, cancelled: [] }
    return post(`/api/runs/cancel-all`)
  },
  handoff: async (thesisId: string, ticker: string): Promise<{ alreadyHandedOff: boolean; runId?: string; handoff?: any }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/handoff`, { thesisId, ticker })
  },
  tickers: async (): Promise<{ tickers: TickerSummary[]; emptyState: boolean; dataDir?: string; driveEnabled?: boolean; coverage?: CoverageGroup[] }> => {
    if ((await ensureMode()) === 'static') return { tickers: snap.tickers, emptyState: snap.emptyState, dataDir: snap.dataDir, driveEnabled: false, coverage: snap.defaultCoverage || [] }
    return get(`/api/tickers`)
  },
  // Create a company = a <TICKER> folder in the shared Drive (the server writes it; it syncs back down to
  // the local mount the engine reads). Throws with e.body.{error,suggested} on a bad/duplicate name.
  addCompany: async (ticker: string): Promise<{ ok: boolean; ticker: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/tickers`, { ticker })
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
        else reject(Object.assign(new Error(body?.error || `${xhr.status}`), { status: xhr.status, body }))
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
  dataStatus: async (ticker: string): Promise<DataStatus> => {
    if ((await ensureMode()) === 'static') return snap.dataStatus[ticker] || { ticker, hasAnyData: false, fileCount: 0, files: [], recentByType: {}, modules: {}, coverage: [], overallReady: false, dataDir: snap.dataDir }
    return get(`/api/data-status/${encodeURIComponent(ticker)}`)
  },
  credit: async (): Promise<Usage> => {
    if ((await ensureMode()) === 'static') return { ok: true, checked: false }
    return get(`/api/credit`, 8_000)
  },
  creditCheck: async (): Promise<Usage> => {
    if ((await ensureMode()) === 'static') return { ok: true, checked: false }
    return post(`/api/credit-check`)
  },
  estimate: async (kind: string, ticker: string, module?: string, agent?: string): Promise<LaunchPreflight> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return get(`/api/launch/estimate?kind=${kind}&ticker=${encodeURIComponent(ticker)}${module ? `&module=${module}` : ''}${agent ? `&agent=${agent}` : ''}`)
  },
  launch: async (body: { kind: string; ticker: string; module?: string; agent?: string; window?: string; model?: string; confirmTicker?: string; force?: boolean }): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, body)
  },
  cancel: async (runId: string) => {
    if ((await ensureMode()) === 'static') return {}
    return post(`/api/runs/${runId}/cancel`)
  },
  readinessDecision: async (runId: string, action: string, acknowledgedText?: string): Promise<{ ok: boolean; status: string }> => {
    if ((await ensureMode()) === 'static') return { ok: false, status: 'static' }
    return post(`/api/runs/${encodeURIComponent(runId)}/readiness-decision`, { action, acknowledgedText })
  },
  output: async (path: string): Promise<{ path: string; markdown: string }> => {
    if ((await ensureMode()) === 'static') {
      const r = await fetch(`${BASE}data/${path}`)
      if (!r.ok) throw new Error('not found')
      return { path, markdown: await r.text() }
    }
    // screener artifacts are served by their own sandboxed reader; analyses/ keeps /api/output
    if (path.startsWith('screener/')) return get(`/api/screener/output?path=${encodeURIComponent(path)}`)
    return get(`/api/output?path=${encodeURIComponent(path)}`)
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
  thesis: async (ticker: string): Promise<{ path: string; markdown?: string }> => {
    if ((await ensureMode()) === 'static') {
      const p = snap.finalThesis?.[ticker]
      if (!p) throw new Error('no thesis')
      return { path: p }
    }
    return get(`/api/output/thesis?ticker=${encodeURIComponent(ticker)}`)
  },
  decision: async (ticker: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.decisions[ticker]
    return get(`/api/output/decision?ticker=${encodeURIComponent(ticker)}`)
  },
  runManifest: async (ticker: string, runRoot?: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.runs[ticker]
    // a runRoot targets that EXACT run folder (older activity rows); ticker resolves the latest run
    const qs = runRoot ? `runRoot=${encodeURIComponent(runRoot)}` : `ticker=${encodeURIComponent(ticker)}`
    return get(`/api/output/run?${qs}`)
  },
  // cross-ticker call ledger + since-the-call timelines (the Calls Tracker). Static -> bundled snapshot.
  calls: async (): Promise<CallsResult> => {
    if ((await ensureMode()) === 'static') return { calls: snap.calls || [], dashboard: snap.dashboard || null }
    return get(`/api/calls`)
  },
  history: async (ticker: string): Promise<{ history: any[] }> => {
    if ((await ensureMode()) === 'static') return { history: [] }
    return get(`/api/runs?ticker=${encodeURIComponent(ticker)}`)
  },
  activeRuns: async (): Promise<{ active: { runId: string; kind: string; ticker: string; module?: string; status: string }[] }> => {
    if ((await ensureMode()) === 'static') return { active: [] }
    return get(`/api/runs`)
  },
  runSnapshot: async (runId: string): Promise<any> => {
    if ((await ensureMode()) === 'static') throw new Error('static')
    return get(`/api/runs/${encodeURIComponent(runId)}`)
  },
  runStreamUrl: (runId: string) => `/api/runs/${runId}/stream`,
  dataStreamUrl: () => `/api/data-status/stream`,

  // ---- chat with your data (closed-book Q&A over a run's synthesized output) ----
  // which scopes are present (chat-able) vs not-yet-run. Static showcase: nothing chat-able (no engine).
  chatScopes: async (ticker: string): Promise<ChatScopes> => {
    if ((await ensureMode()) === 'static') return { ticker, runRoot: null, run: { present: false }, modules: [], orbs: [] }
    return get(`/api/chat/scopes?ticker=${encodeURIComponent(ticker)}`, 8_000)
  },
  // POST one chat turn and read the streamed SSE body. Runs use EventSource (GET-only) elsewhere; chat is
  // a POST, so it needs the fetch + ReadableStream reader. AbortError-silent: the user's own close (signal
  // abort) is not surfaced as an error. Frames: chat-meta -> chat-token* -> chat-done | chat-error.
  chatStream: async (
    body: ChatRequest,
    cb: {
      onMeta?: (m: { scopeResolved: string; sourcePath?: string; degraded?: boolean; degradeNote?: string }) => void
      onToken: (t: string) => void
      onDone: (d: { costUsd?: number }) => void
      onError: (msg: string) => void
      signal: AbortSignal
    },
  ): Promise<void> => {
    if ((await ensureMode()) === 'static') { cb.onError('static-deploy'); return }
    let res: Response
    try {
      res = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: cb.signal })
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
          else if (ev === 'chat-token') cb.onToken(parsed.content ?? '')
          else if (ev === 'chat-done') { cb.onDone(parsed); return }
          else if (ev === 'chat-error') { cb.onError(parsed.message || 'chat failed'); return }
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') cb.onError(e?.message || 'stream interrupted')
    }
  },

  // who is signed in (Cloudflare Access email) — live only
  whoami: async (): Promise<Whoami> => {
    if ((await ensureMode()) === 'static') return { user: 'local', userVia: 'local' }
    return get(`/api/whoami`)
  },
  // perpetual activity/audit log with filters — live only (the static showcase has no run history)
  activity: async (query: ActivityQuery = {}): Promise<ActivityResult> => {
    if ((await ensureMode()) === 'static') return { rows: [], total: 0, allTime: 0, users: [], tickers: [], earliest: null }
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v))
    const s = qs.toString()
    return get(`/api/activity${s ? `?${s}` : ''}`)
  },
}
