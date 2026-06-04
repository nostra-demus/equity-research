import type { DataStatus, LaunchPreflight, SwarmGraph, TickerSummary, Usage } from './types'

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

export const api = {
  swarm: (ticker?: string) => get<SwarmGraph>(`/api/swarm${ticker ? `?ticker=${encodeURIComponent(ticker)}` : ''}`),
  tickers: () => get<{ tickers: TickerSummary[]; emptyState: boolean }>(`/api/tickers`),
  dataStatus: (ticker: string) => get<DataStatus>(`/api/data-status/${encodeURIComponent(ticker)}`),
  credit: () => get<Usage>(`/api/credit`),
  creditCheck: () => post<Usage>(`/api/credit-check`),
  estimate: (kind: string, ticker: string, module?: string, agent?: string) =>
    get<LaunchPreflight>(`/api/launch/estimate?kind=${kind}&ticker=${encodeURIComponent(ticker)}${module ? `&module=${module}` : ''}${agent ? `&agent=${agent}` : ''}`),
  launch: (body: { kind: string; ticker: string; module?: string; agent?: string; model?: string; confirmTicker?: string }) =>
    post<{ runId: string; preflight: LaunchPreflight }>(`/api/launch`, body),
  cancel: (runId: string) => post(`/api/runs/${runId}/cancel`),
  output: (path: string) => get<{ path: string; markdown: string }>(`/api/output?path=${encodeURIComponent(path)}`),
  thesis: (ticker: string) => get<{ path: string; markdown: string }>(`/api/output/thesis?ticker=${encodeURIComponent(ticker)}`),
  decision: (ticker: string) => get<any>(`/api/output/decision?ticker=${encodeURIComponent(ticker)}`),
  runManifest: (ticker: string) => get<any>(`/api/output/run?ticker=${encodeURIComponent(ticker)}`),
  history: (ticker: string) => get<{ history: any[] }>(`/api/runs?ticker=${encodeURIComponent(ticker)}`),
  runStreamUrl: (runId: string) => `/api/runs/${runId}/stream`,
  dataStreamUrl: () => `/api/data-status/stream`,
}
