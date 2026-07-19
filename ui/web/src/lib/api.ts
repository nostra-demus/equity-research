import { staticPromptPath } from './prompts'
import { DEFAULT_RANK_WEIGHTS, type RankWeights, type RankWeightsState } from './rankWeights'
import type { ValuationLeversResponse, ValuationOverride } from './valuationLevers'
import type { AutotuneState, RankWeightChanges, WeightChange } from './types'
import type { ActivityQuery, ActivityResult, CallsResult, ChatConversationDetail, ChatListQuery, ChatListResult, ChatRequest, ChatScopes, CockpitFeedbackCategory, CockpitFeedbackStatus, CockpitFeedbackView, CoverageGroup, DataNeedsRead, DataStatus, EventEnrichment, EventResearchLink, FeedbackRecord, FeedbackSubmitInput, FeedbackSummary, FeedbackType, FeedItem, IntakePlan, IntensityStats, IntensityWindow, LaunchPreflight, NewsCycle, NewsStatus, ResumableRunInfo, RunHistoryEntry, ScreenerBoard, SignalIntakeInput, SignalState, SourcesReport, SwarmGraph, SwarmMeta, ThesisPlan, TickerSummary, UploadResult, Usage, WhatChangedRead, Whoami } from './types'

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
async function get<T>(url: string, timeoutMs = 15_000): Promise<T> {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  // Carry the status on the error (as post() already does) so a caller can tell "this doesn't exist yet"
  // (404) from "the engine is broken/unreachable" (500, timeout) instead of guessing from the message.
  if (!r.ok) throw Object.assign(new Error(`${r.status} ${url}`), { status: r.status })
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
  topics?: FacetCount[] // CapIQ-style subject topics (server news/topics.ts) — optional: absent on old servers
  scheduledEvents?: FacetCount[] // forward/scheduled corporate events (server news/schedule.ts) — optional
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
  // uses tickers(). Static showcase: the bundled snapshot list (or empty).
  swarmSubjects: async (swarmId: string): Promise<string[]> => {
    if ((await ensureMode()) === 'static') return (snap.swarmSubjects?.[swarmId]) || []
    const r = await get<{ swarm: string; subjects: string[] }>(`/api/swarm/subjects?swarm=${encodeURIComponent(swarmId)}`)
    return r.subjects || []
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
  launchSignal: async (body: { sigId?: string; intake?: SignalIntakeInput; inboxId?: string; until?: string; override?: boolean }): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, { kind: 'signal', ...body })
  },
  launchSweep: async (): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, { kind: 'sweep' })
  },
  // Escalate a PM-skim idea into the paid gauntlet ("Run the full machine"). The server maps the idea to a
  // signal intake and launches it through the normal signal path.
  promoteIdea: async (ideaId: string): Promise<{ sigId: string; runId: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/ideas/${encodeURIComponent(ideaId)}/promote`, {})
  },
  // 👍/👎 a surfaced idea (self-grading loop). 'clear' un-votes.
  rateIdea: async (ideaId: string, polarity: 'up' | 'down' | 'clear', reason?: string): Promise<{ ok: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/ideas/${encodeURIComponent(ideaId)}/feedback`, { polarity, ...(reason ? { reason } : {}) })
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
  sendEventToResearch: async (eventId: string, ticker: string): Promise<{ ok: boolean; path: string; already: boolean; duplicateOf?: string; analyzing?: boolean; swarm?: string | null }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/event/${encodeURIComponent(eventId)}/send-to-research`, { ticker })
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
  estimate: async (kind: string, ticker: string, module?: string, agent?: string, swarm?: string): Promise<LaunchPreflight> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return get(`/api/launch/estimate?kind=${kind}&ticker=${encodeURIComponent(ticker)}${module ? `&module=${module}` : ''}${agent ? `&agent=${agent}` : ''}${swarm ? `&swarm=${encodeURIComponent(swarm)}` : ''}`)
  },
  launch: async (body: { kind: string; ticker: string; module?: string; agent?: string; window?: string; model?: string; confirmTicker?: string; force?: boolean; swarm?: string }): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean; skipped?: string[]; planned?: string[]; resumed?: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, body)
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
    if ((await ensureMode()) === 'static') return { calls: snap.calls || [], dashboard: snap.dashboard || null }
    return get(`/api/calls`)
  },
  history: async (ticker: string): Promise<{ history: RunHistoryEntry[] }> => {
    if ((await ensureMode()) === 'static') return { history: [] }
    return get(`/api/runs?ticker=${encodeURIComponent(ticker)}`)
  },
  activeRuns: async (): Promise<{ active: { runId: string; kind: string; ticker: string; module?: string; status: string; swarmId?: string; unit?: string; startedAt?: number }[] }> => {
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
  thesisPlan: async (ticker: string, swarm?: string, reuse?: string[]): Promise<ThesisPlan> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    const q = new URLSearchParams({ ticker })
    if (swarm && swarm !== 'research') q.set('swarm', swarm)
    if (reuse) q.set('reuse', reuse.join(',')) // '' is meaningful: reuse nothing, run everything
    return get(`/api/thesis-plan?${q}`, 12_000)
  },
  // `reuse` = the modules to carry forward rather than re-run. Everything else in the graph runs. The
  // server re-validates this against its own plan, so a stale client can never smuggle a stale module in.
  runThesisPlan: async (
    ticker: string,
    reuse: string[],
    swarm: string,
  ): Promise<{ runId: string; preflight: LaunchPreflight; carried: { module: string; from: string }[]; reused: string[]; willRun: string[]; chained?: boolean; skipped?: string[]; planned?: string[] }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    // `swarm` is ALWAYS sent (never omitted for research), so the server can match positively on it rather
    // than treat an absent field as permission to dispatch a research pipeline at another swarm's subject.
    return post(`/api/thesis-plan/run`, { ticker, reuse, swarm })
  },
  // Launch ONE module of the plan (the RUN pill), resuming from the orbs on disk. `reuse` governs which
  // ancestors get carried into the target root first. Returns the done/planned orb split so the cockpit
  // lights up "N done / M queued" instead of a false from-scratch start.
  runThesisPlanModule: async (
    ticker: string,
    module: string,
    reuse: string[],
    swarm: string,
  ): Promise<{ runId: string; preflight: LaunchPreflight; module: string; willRun: number; doneOrbKeys: string[]; carried: { module: string; from: string }[]; resumed?: boolean; ranClean?: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/thesis-plan/module`, { ticker, module, reuse, swarm })
  },

  // ---- document intake (the scoped rerun plan, frameworks/INTAKE.md) ----
  // The latest scoped plan for a ticker (roster-validated + downstream re-expanded server-side), or null
  // when there's no run/plan yet. A 404 / old server / static deploy → null (fail-closed: the cockpit then
  // shows the honest staleness floor, never a fabricated plan).
  intake: async (ticker: string): Promise<IntakePlan | null> => {
    if ((await ensureMode()) === 'static') return null
    try {
      const r = await get<{ plan: IntakePlan | null }>(`/api/intake/${encodeURIComponent(ticker)}`, 8_000)
      return r.plan ?? null
    } catch {
      return null
    }
  },
  // Trigger the cheap, advisory analysis that (re)writes the scoped plan. Launches NO rerun (reruns stay a
  // human one-click). Returns the run id of the doc-intake run.
  analyzeIntake: async (ticker: string): Promise<{ runId: string }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/intake/${encodeURIComponent(ticker)}/analyze`)
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

  dataNeeds: async (subject: string, swarm: string): Promise<DataNeedsRead | null> => {
    if ((await ensureMode()) === 'static') return null
    try {
      const r = await get<{ read: DataNeedsRead | null }>(`/api/data-needs/${encodeURIComponent(subject)}?swarm=${encodeURIComponent(swarm)}`, 8_000)
      return r.read ?? null
    } catch {
      return null
    }
  },

  runStreamUrl: (runId: string) => `/api/runs/${runId}/stream`,
  dataStreamUrl: () => `/api/data-status/stream`,

  // ---- chat with your data (closed-book Q&A over a run's synthesized output) ----
  // which scopes are present (chat-able) vs not-yet-run. Static showcase: nothing chat-able (no engine).
  chatScopes: async (ticker: string, swarm?: string): Promise<ChatScopes> => {
    if ((await ensureMode()) === 'static') return { ticker, runRoot: null, run: { present: false }, modules: [], orbs: [] }
    if (swarm && swarm !== 'research') return get(`/api/chat/scopes?swarm=${encodeURIComponent(swarm)}&subject=${encodeURIComponent(ticker)}`, 8_000)
    return get(`/api/chat/scopes?ticker=${encodeURIComponent(ticker)}`, 8_000)
  },
  // POST one chat turn and read the streamed SSE body. Runs use EventSource (GET-only) elsewhere; chat is
  // a POST, so it needs the fetch + ReadableStream reader. AbortError-silent: the user's own close (signal
  // abort) is not surfaced as an error. Frames: chat-meta -> chat-token* -> chat-done | chat-error.
  chatStream: async (
    body: ChatRequest,
    cb: {
      onMeta?: (m: { conversationId?: string; scopeResolved: string; sourcePath?: string; degraded?: boolean; degradeNote?: string }) => void
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
