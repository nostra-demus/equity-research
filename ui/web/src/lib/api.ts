import type { DataStatus, LaunchPreflight, SwarmGraph, TickerSummary, Usage } from './types'

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
    try {
      const r = await fetch('/api/health', { signal: AbortSignal.timeout(2500) })
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
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error((j as any)?.error || `${r.status}`), { status: r.status, body: j })
  return j as T
}

const STATIC_ERR = () => Object.assign(new Error('static-deploy'), { static: true })

export const api = {
  swarm: async (ticker?: string): Promise<SwarmGraph> => {
    if ((await ensureMode()) === 'static') return snap.swarmGraph
    return get<SwarmGraph>(`/api/swarm${ticker ? `?ticker=${encodeURIComponent(ticker)}` : ''}`)
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
  launch: async (body: { kind: string; ticker: string; module?: string; agent?: string; model?: string; confirmTicker?: string }): Promise<{ runId: string; preflight: LaunchPreflight }> => {
    if ((await ensureMode()) === 'static') throw STATIC_ERR()
    return post(`/api/launch`, body)
  },
  cancel: async (runId: string) => {
    if ((await ensureMode()) === 'static') return {}
    return post(`/api/runs/${runId}/cancel`)
  },
  output: async (path: string): Promise<{ path: string; markdown: string }> => {
    if ((await ensureMode()) === 'static') {
      const r = await fetch(`${BASE}data/${path}`)
      if (!r.ok) throw new Error('not found')
      return { path, markdown: await r.text() }
    }
    return get(`/api/output?path=${encodeURIComponent(path)}`)
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
  history: async (ticker: string): Promise<{ history: any[] }> => {
    if ((await ensureMode()) === 'static') return { history: [] }
    return get(`/api/runs?ticker=${encodeURIComponent(ticker)}`)
  },
  runStreamUrl: (runId: string) => `/api/runs/${runId}/stream`,
  dataStreamUrl: () => `/api/data-status/stream`,
}
