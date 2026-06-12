import { staticPromptPath } from './prompts'
import type { ActivityQuery, ActivityResult, CallsResult, DataStatus, FeedItem, LaunchPreflight, NewsCycle, NewsStatus, ScreenerBoard, SignalIntakeInput, SwarmGraph, SwarmMeta, TickerSummary, Usage, Whoami } from './types'

const BASE = import.meta.env.BASE_URL

// ---- live/static mode detection ----
// Local dev (Fastify backend up) -> live. Cloudflare Pages (no backend) -> static snapshot, read-only.
let mode: 'live' | 'static' | null = null
let snap: any = null
let modeProbe: Promise<'live' | 'static'> | null = null

async function ensureMode(): Promise<'live' | 'static'> {
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

async function get<T>(url: string): Promise<T> {
  const r = await fetch(url)
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

const STATIC_ERR = () => Object.assign(new Error('static-deploy'), { static: true })

const EMPTY_BOARD: ScreenerBoard = { generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], counts: {}, live: [] }

export const api = {
  swarm: async (ticker?: string): Promise<SwarmGraph> => {
    if ((await ensureMode()) === 'static') return snap.swarmGraph
    return get<SwarmGraph>(`/api/swarm${ticker ? `?ticker=${encodeURIComponent(ticker)}` : ''}`)
  },
  // ---- swarms (the switcher) + the screener swarm's surface ----
  swarms: async (): Promise<SwarmMeta[]> => {
    if ((await ensureMode()) === 'static') return snap.swarms || [{ id: 'research', label: 'Research', color: '#e0a33e', unit: 'ticker', order: 1, layout: 'constellation' }]
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
  launchSignal: async (body: { sigId?: string; intake?: SignalIntakeInput; inboxId?: string }): Promise<{ runId: string; preflight: LaunchPreflight }> => {
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
    return get(`/api/news/status`)
  },
  newsFeed: async (days: 1 | 2 = 2): Promise<{ items: FeedItem[]; cycles: NewsCycle[] }> => {
    if ((await ensureMode()) === 'static') return { items: [], cycles: [] }
    return get(`/api/news/feed?days=${days}`)
  },
  newsStreamUrl: () => `/api/news/stream`,
  inboxAction: async (inboxId: string, action: 'dismiss' | 'restore'): Promise<{ ok: boolean }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/inbox/action`, { inboxId, action })
  },
  thesisMove: async (thesisId: string, to: 'watchlist' | 'provisional' | 'full_machine' | 'engine', reason?: string): Promise<{ ok: boolean; effective_status: string | null }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/thesis/${encodeURIComponent(thesisId)}/move`, { to, reason })
  },
  cancelAllRuns: async (): Promise<{ ok: boolean; cancelled: string[] }> => {
    if ((await ensureMode()) === 'static') return { ok: true, cancelled: [] }
    return post(`/api/runs/cancel-all`)
  },
  handoff: async (thesisId: string, ticker: string): Promise<{ alreadyHandedOff: boolean; runId?: string; handoff?: any }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/screener/handoff`, { thesisId, ticker })
  },
  tickers: async (): Promise<{ tickers: TickerSummary[]; emptyState: boolean; dataDir?: string }> => {
    if ((await ensureMode()) === 'static') return { tickers: snap.tickers, emptyState: snap.emptyState, dataDir: snap.dataDir }
    return get(`/api/tickers`)
  },
  dataStatus: async (ticker: string): Promise<DataStatus> => {
    if ((await ensureMode()) === 'static') return snap.dataStatus[ticker] || { ticker, hasAnyData: false, fileCount: 0, files: [], recentByType: {}, modules: {}, overallReady: false, dataDir: snap.dataDir }
    return get(`/api/data-status/${encodeURIComponent(ticker)}`)
  },
  credit: async (): Promise<Usage> => {
    if ((await ensureMode()) === 'static') return { ok: true, checked: false }
    return get(`/api/credit`)
  },
  creditCheck: async (): Promise<Usage> => {
    if ((await ensureMode()) === 'static') return { ok: true, checked: false }
    return post(`/api/credit-check`)
  },
  estimate: async (kind: string, ticker: string, module?: string, agent?: string): Promise<LaunchPreflight> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return get(`/api/launch/estimate?kind=${kind}&ticker=${encodeURIComponent(ticker)}${module ? `&module=${module}` : ''}${agent ? `&agent=${agent}` : ''}`)
  },
  launch: async (body: { kind: string; ticker: string; module?: string; agent?: string; window?: string; model?: string; confirmTicker?: string }): Promise<{ runId: string; preflight: LaunchPreflight; chained?: boolean }> => {
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
  runManifest: async (ticker: string): Promise<any> => {
    if ((await ensureMode()) === 'static') return snap.runs[ticker]
    return get(`/api/output/run?ticker=${encodeURIComponent(ticker)}`)
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
