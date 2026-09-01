import { onCLS, onFCP, onINP, onLCP } from 'web-vitals'

export const BROWSER_PERFORMANCE_NAMES = [
  'browser.api_latency',
  'browser.core_ready',
  'browser.first_contentful_paint',
  'browser.largest_contentful_paint',
  'browser.interaction_latency',
  'browser.layout_shift',
  'browser.long_task',
  'browser.run_stream_connect',
  'browser.run_event_paint',
  'browser.run_reconnect',
  'browser.subject_ready',
] as const

export type BrowserPerformanceName = typeof BROWSER_PERFORMANCE_NAMES[number]
export type PerformanceUnit = 'ms' | 'score'
export type PerformanceOutcome = 'ok' | 'error' | 'cancelled'

export interface BrowserPerformanceSample {
  name: BrowserPerformanceName
  value: number
  unit: PerformanceUnit
  ts: number
  operation?: string
  outcome?: PerformanceOutcome
}

export interface PerformanceMetricSummary {
  name: string
  label: string
  unit: PerformanceUnit
  operation?: string
  count: number
  errorCount: number
  p50: number
  p75: number
  p95: number
  max: number
  budget: number | null
  budgetPercentile: 75 | 95
  status: 'good' | 'needs_attention' | 'learning' | 'observed'
  baselineP95: number | null
  changePct: number | null
  trend: 'faster' | 'stable' | 'slower' | 'learning'
}

export interface PerformanceSummary {
  version: 1
  generatedAt: string
  windowHours: number
  retentionDays: number
  sampleCount: number
  droppedSamples: number
  status: 'good' | 'needs_attention' | 'learning'
  metrics: PerformanceMetricSummary[]
}

type CollectionMode = 'unknown' | 'live' | 'static'
type Transport = (samples: BrowserPerformanceSample[], pageExit: boolean) => Promise<boolean>

const MAX_QUEUE = 300
const MAX_BATCH = 50
const FLUSH_MS = 5_000
const API_FAMILIES = new Set([
  'activity', 'bridge', 'calendar', 'calls', 'chat', 'chats', 'credit', 'credit-check', 'data-needs',
  'data-status', 'feedback', 'health', 'intake', 'intake-plan', 'internal', 'launch', 'memory', 'news',
  'output', 'pending-admissions', 'performance', 'pipeline', 'pipelines', 'portfolio', 'prompt', 'providers',
  'quote', 'resumable', 'runs', 'screener', 'swarm', 'swarms', 'tasks', 'thesis-plan', 'tickers', 'tools',
  'valuation-levers', 'watchlist', 'what-changed', 'whoami',
])
const CONTEXT_OPERATIONS = new Set([
  '/asset/*', '/context/other', '/boot/core', '/subject/select', '/run/stream',
  '/reconnect/ready', '/reconnect/settled', '/reconnect/cancelled', '/reconnect/error',
])
const EVENT_OPERATIONS = new Set([
  'run-started', 'agent-started', 'agent-done', 'agent-failed', 'layer-advanced', 'module-done',
  'module-routed', 'cost-tick', 'run-done', 'run-error', 'run-heartbeat', 'run-activity',
  'readiness-checking', 'readiness-report', 'readiness-blocked', 'readiness-resolved',
].map((event) => `/event/${event}`))

const EXACT_OPERATIONS: [RegExp, string | ((match: RegExpMatchArray) => string)][] = [
  [/^\/api\/health$/, '/api/health'],
  [/^\/api\/swarms$/, '/api/swarms'],
  [/^\/api\/swarm(?:\/subjects|\/pulse)?$/, (match) => match[0]],
  [/^\/api\/tickers$/, '/api/tickers'],
  [/^\/api\/runs$/, '/api/runs'],
  [/^\/api\/runs\/[^/]+$/, '/api/runs/:runId'],
  [/^\/api\/runs\/[^/]+\/stream$/, '/api/runs/:runId/stream'],
  [/^\/api\/output\/run$/, '/api/output/run'],
  [/^\/api\/performance(?:\/.*)?$/, '/api/performance/*'],
]

/** Reduce a request to a route family before it leaves the browser. Query strings and dynamic ids never
 * enter telemetry; an unknown API keeps only its first static family (for example `/api/news/*`). */
export function normalizePerformanceOperation(input: string): string {
  let pathname = ''
  try { pathname = new URL(input, typeof location === 'undefined' ? 'http://localhost' : location.origin).pathname }
  catch { return '/unknown' }
  for (const [pattern, label] of EXACT_OPERATIONS) {
    const match = pathname.match(pattern)
    if (match) return typeof label === 'string' ? label : label(match)
  }
  const family = pathname.match(/^\/api\/([A-Za-z0-9_-]+)/)?.[1]
  return family ? `/api/${family}/*` : '/asset/*'
}

function cleanOperation(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (CONTEXT_OPERATIONS.has(value) || EVENT_OPERATIONS.has(value)) return value
  const exactApi = EXACT_OPERATIONS.some(([pattern]) => pattern.test(value))
  if (exactApi) return value
  const family = value.match(/^\/api\/([A-Za-z0-9_-]+)\/\*$/)?.[1]
  return family && API_FAMILIES.has(family) ? value : '/context/other'
}

async function defaultTransport(samples: BrowserPerformanceSample[], pageExit: boolean): Promise<boolean> {
  const body = JSON.stringify({ samples })
  if (pageExit && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      if (navigator.sendBeacon('/api/performance/samples', new Blob([body], { type: 'application/json' }))) return true
    } catch {}
  }
  try {
    const response = await fetch('/api/performance/samples', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: pageExit,
    })
    return response.ok
  } catch {
    return false
  }
}

export class BrowserPerformanceCollector {
  private mode: CollectionMode = 'unknown'
  private queue: BrowserPerformanceSample[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private flushing: Promise<void> | null = null

  constructor(private readonly transport: Transport = defaultTransport) {}

  setMode(mode: Exclude<CollectionMode, 'unknown'>): void {
    this.mode = mode
    if (mode === 'static') {
      this.queue = []
      if (this.timer) clearTimeout(this.timer)
      this.timer = null
      return
    }
    if (this.queue.length) this.schedule()
  }

  record(name: BrowserPerformanceName, value: number, unit: PerformanceUnit = 'ms', options: { operation?: string; outcome?: PerformanceOutcome; ts?: number } = {}): void {
    if (this.mode === 'static' || !Number.isFinite(value) || value < 0) return
    const rounded = unit === 'score' ? Math.round(value * 10_000) / 10_000 : Math.round(value * 10) / 10
    this.queue.push({
      name,
      value: rounded,
      unit,
      ts: options.ts ?? Date.now(),
      ...(options.operation ? { operation: cleanOperation(options.operation) } : {}),
      ...(options.outcome ? { outcome: options.outcome } : {}),
    })
    if (this.queue.length > MAX_QUEUE) this.queue.splice(0, this.queue.length - MAX_QUEUE)
    if (this.mode === 'live') this.schedule()
  }

  private schedule(): void {
    if (this.timer || this.mode !== 'live') return
    this.timer = setTimeout(() => { this.timer = null; void this.flush(false) }, FLUSH_MS)
    ;(this.timer as any).unref?.() // standalone Node regression tests must never be kept alive by telemetry
  }

  async flush(pageExit = false): Promise<void> {
    if (this.mode !== 'live' || this.queue.length === 0) return this.flushing ?? Promise.resolve()
    // A closing page may have more than one batch pending, or an ordinary upload already in flight.
    // Drain every still-queued batch through sendBeacon/keepalive immediately; there may be no later timer.
    if (pageExit) {
      const sends: Promise<boolean>[] = []
      while (this.queue.length) sends.push(this.transport(this.queue.splice(0, MAX_BATCH), true))
      await Promise.allSettled(sends)
      return
    }
    if (this.flushing) return this.flushing
    const batch = this.queue.splice(0, MAX_BATCH)
    this.flushing = this.transport(batch, pageExit).then((ok) => {
      if (!ok && !pageExit) this.queue.unshift(...batch)
    }).finally(() => {
      this.flushing = null
      if (this.queue.length) this.schedule()
    })
    return this.flushing
  }

  pending(): readonly BrowserPerformanceSample[] {
    return this.queue
  }
}

const collector = new BrowserPerformanceCollector()
let monitoringStarted = false

export function setPerformanceCollectionMode(mode: 'live' | 'static'): void {
  collector.setMode(mode)
}

export function recordBrowserPerformance(
  name: BrowserPerformanceName,
  value: number,
  unit: PerformanceUnit = 'ms',
  options: { operation?: string; outcome?: PerformanceOutcome; ts?: number } = {},
): void {
  collector.record(name, value, unit, options)
}

export function recordNextPaint(name: BrowserPerformanceName, startedAt: number, operation?: string): void {
  if (typeof requestAnimationFrame !== 'function' || (typeof document !== 'undefined' && document.hidden)) return
  requestAnimationFrame(() => recordBrowserPerformance(name, performance.now() - startedAt, 'ms', { operation }))
}

/** Fetch wrapper for every API transport. It stops at response headers, which separates network/backend
 * latency from later JSON parsing and React work. The collector endpoint bypasses itself. */
export async function performanceFetch(url: string, init?: RequestInit): Promise<Response> {
  const operation = normalizePerformanceOperation(url)
  if (operation === '/api/performance/*') return fetch(url, init)
  const started = performance.now()
  try {
    const response = await fetch(url, init)
    recordBrowserPerformance('browser.api_latency', performance.now() - started, 'ms', {
      operation,
      outcome: response.ok ? 'ok' : 'error',
    })
    return response
  } catch (error: any) {
    recordBrowserPerformance('browser.api_latency', performance.now() - started, 'ms', {
      operation,
      outcome: error?.name === 'AbortError' || error?.name === 'TimeoutError' ? 'cancelled' : 'error',
    })
    throw error
  }
}

export function startBrowserPerformanceMonitoring(): void {
  if (monitoringStarted || typeof window === 'undefined') return
  monitoringStarted = true
  onFCP((metric) => recordBrowserPerformance('browser.first_contentful_paint', metric.value))
  onLCP((metric) => recordBrowserPerformance('browser.largest_contentful_paint', metric.value))
  onINP((metric) => recordBrowserPerformance('browser.interaction_latency', metric.value))
  onCLS((metric) => recordBrowserPerformance('browser.layout_shift', metric.value, 'score'))

  if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) recordBrowserPerformance('browser.long_task', entry.duration)
      })
      observer.observe({ type: 'longtask', buffered: true })
    } catch {}
  }

  window.addEventListener('pagehide', () => { void collector.flush(true) }, { capture: true })
}
