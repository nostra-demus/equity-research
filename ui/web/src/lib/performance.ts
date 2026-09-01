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
  successCount: number
  errorCount: number
  errorRate: number
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
  release: string
  generatedAt: string
  windowHours: number
  retentionDays: number
  sampleCount: number
  droppedSamples: number
  status: 'good' | 'needs_attention' | 'learning'
  metrics: PerformanceMetricSummary[]
}

type CollectionMode = 'unknown' | 'live' | 'static'
type Transport = (samples: BrowserPerformanceSample[], pageExit: boolean, droppedSamples: number) => Promise<boolean>

const MAX_QUEUE = 300
const MAX_BATCH = 50
const MAX_REPORTED_DROPS = 10_000
const MAX_REPORTED_DURATION_MS = 10 * 60_000
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

async function defaultTransport(samples: BrowserPerformanceSample[], pageExit: boolean, droppedSamples: number): Promise<boolean> {
  const body = JSON.stringify({ samples, ...(droppedSamples > 0 ? { droppedSamples } : {}) })
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
      // Every telemetry upload is small and lifecycle-independent. Keeping ordinary uploads alive across
      // navigation means pagehide only has to drain the still-queued tail and never duplicates a batch
      // which the server may already have accepted.
      keepalive: true,
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
  private dropped = 0

  constructor(private readonly transport: Transport = defaultTransport) {}

  setMode(mode: Exclude<CollectionMode, 'unknown'>): void {
    this.mode = mode
    if (mode === 'static') {
      this.queue = []
      this.dropped = 0
      if (this.timer) clearTimeout(this.timer)
      this.timer = null
      return
    }
    if (this.queue.length) this.schedule()
  }

  record(name: BrowserPerformanceName, value: number, unit: PerformanceUnit = 'ms', options: { operation?: string; outcome?: PerformanceOutcome; ts?: number } = {}): void {
    if (this.mode === 'static' || !Number.isFinite(value) || value < 0) return
    // A boot that eventually recovers after ten minutes is still useful (and very red) evidence. Bound
    // lifecycle outliers to the server contract so one recovery cannot make its whole upload invalid.
    const bounded = unit === 'score' ? Math.min(value, 10) : Math.min(value, MAX_REPORTED_DURATION_MS)
    const rounded = unit === 'score' ? Math.round(bounded * 10_000) / 10_000 : Math.round(bounded * 10) / 10
    this.queue.push({
      name,
      value: rounded,
      unit,
      ts: options.ts ?? Date.now(),
      ...(options.operation ? { operation: cleanOperation(options.operation) } : {}),
      ...(options.outcome ? { outcome: options.outcome } : {}),
    })
    if (this.queue.length > MAX_QUEUE) {
      const overflow = this.queue.length - MAX_QUEUE
      this.queue.splice(0, overflow)
      this.noteDropped(overflow)
    }
    if (this.mode === 'live') this.schedule()
  }

  private schedule(): void {
    if (this.timer || this.mode !== 'live') return
    this.timer = setTimeout(() => { this.timer = null; void this.flush(false) }, FLUSH_MS)
    ;(this.timer as any).unref?.() // standalone Node regression tests must never be kept alive by telemetry
  }

  async flush(pageExit = false): Promise<void> {
    if (this.mode !== 'live') return
    // Ordinary uploads always use fetch keepalive, so a closing page sends only the still-queued tail.
    // Re-sending the already in-flight batch here could count it twice if the server accepted both copies.
    if (pageExit) {
      if (this.timer) clearTimeout(this.timer)
      this.timer = null
      const sends: Promise<void>[] = []
      while (this.queue.length) sends.push(this.send(this.queue.splice(0, MAX_BATCH), true))
      await Promise.allSettled(sends)
      return
    }
    if (this.queue.length === 0) return this.flushing ?? Promise.resolve()
    if (this.flushing) return this.flushing
    const batch = this.queue.splice(0, MAX_BATCH)
    // Best-effort means drop this batch on transport failure. Re-queueing would make an offline engine
    // wake the browser every five seconds forever. Its bounded loss count rides on the next successful
    // upload instead, so the speed verdict cannot silently turn green after missing observations.
    this.flushing = this.send(batch, pageExit).finally(() => {
      this.flushing = null
      if (this.queue.length) this.schedule()
    })
    return this.flushing
  }

  private noteDropped(count: number): void {
    this.dropped = Math.min(MAX_REPORTED_DROPS, this.dropped + count)
  }

  private async send(batch: BrowserPerformanceSample[], pageExit: boolean): Promise<void> {
    // Reserve prior loss to exactly one concurrent request. If that request also fails, restore both its
    // carried loss and its own samples; a later successful upload reports the bounded total once.
    const carriedDropped = this.dropped
    this.dropped = 0
    let sent = false
    try { sent = await this.transport(batch, pageExit, carriedDropped) } catch {}
    if (!sent) this.noteDropped(carriedDropped + batch.length)
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

export function flushBrowserPerformance(pageExit = false): Promise<void> {
  return collector.flush(pageExit)
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
  // rAF callbacks run before their frame is painted. The second frame boundary includes the first frame's
  // React layout + paint instead of reporting only the work required to schedule it.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    recordBrowserPerformance(name, performance.now() - startedAt, 'ms', { operation })
  }))
}

export function performanceOutcomeForStatus(operation: string, status: number): PerformanceOutcome {
  if (operation === '/api/output/run' && status === 404) return 'cancelled'
  return status >= 200 && status < 300 ? 'ok' : 'error'
}

export function performanceOutcomeForFetchError(error: unknown): PerformanceOutcome {
  // AbortError means the caller intentionally moved on. AbortSignal.timeout() uses TimeoutError: that is
  // a real failed user wait and must trip the error-rate budget rather than disappear as a cancellation.
  return (error as { name?: unknown } | null)?.name === 'AbortError' ? 'cancelled' : 'error'
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
      outcome: performanceOutcomeForStatus(operation, response.status),
    })
    return response
  } catch (error: any) {
    recordBrowserPerformance('browser.api_latency', performance.now() - started, 'ms', {
      operation,
      outcome: performanceOutcomeForFetchError(error),
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

  window.addEventListener('pagehide', () => { void flushBrowserPerformance(true) }, { capture: true })
}
