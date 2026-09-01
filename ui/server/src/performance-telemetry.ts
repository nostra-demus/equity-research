import fs from 'node:fs'
import path from 'node:path'

export const PERFORMANCE_SAMPLE_NAMES = [
  'server.api_latency',
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

export type PerformanceSampleName = typeof PERFORMANCE_SAMPLE_NAMES[number]
export type PerformanceUnit = 'ms' | 'score'
export type PerformanceOutcome = 'ok' | 'error' | 'cancelled'

export interface PerformanceSampleInput {
  name: PerformanceSampleName
  value: number
  unit: PerformanceUnit
  ts?: number
  operation?: string
  outcome?: PerformanceOutcome
}

interface StoredPerformanceSample extends Required<Pick<PerformanceSampleInput, 'name' | 'value' | 'unit'>> {
  version: 1
  ts: number
  source: 'server' | 'browser'
  operation?: string
  outcome: PerformanceOutcome
  release: string
}

export interface PerformanceMetricSummary {
  name: PerformanceSampleName
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

interface Budget {
  label: string
  value: number
  percentile: 75 | 95
  minSamples: number
  unit: PerformanceUnit
}

// Core Web Vitals use Google's p75 thresholds. Cockpit-specific budgets use p95 because an occasional
// freeze is exactly what makes a single-operator control surface feel unreliable even when its average is
// fast. API budgets apply only to the small control-plane reads that should never include model work.
const BUDGETS: Partial<Record<PerformanceSampleName, Budget>> = {
  'browser.core_ready': { label: 'Cockpit ready', value: 1_500, percentile: 95, minSamples: 10, unit: 'ms' },
  'browser.first_contentful_paint': { label: 'First content', value: 1_800, percentile: 75, minSamples: 10, unit: 'ms' },
  'browser.largest_contentful_paint': { label: 'Main content', value: 2_500, percentile: 75, minSamples: 10, unit: 'ms' },
  'browser.interaction_latency': { label: 'Click response', value: 200, percentile: 75, minSamples: 10, unit: 'ms' },
  'browser.layout_shift': { label: 'Visual stability', value: 0.1, percentile: 75, minSamples: 10, unit: 'score' },
  'browser.long_task': { label: 'Main-thread freeze', value: 100, percentile: 95, minSamples: 10, unit: 'ms' },
  'browser.run_stream_connect': { label: 'Live connection', value: 1_000, percentile: 95, minSamples: 10, unit: 'ms' },
  'browser.run_event_paint': { label: 'Live update shown', value: 250, percentile: 95, minSamples: 20, unit: 'ms' },
  'browser.run_reconnect': { label: 'Run recovery', value: 1_000, percentile: 95, minSamples: 10, unit: 'ms' },
  'browser.subject_ready': { label: 'Company ready', value: 1_000, percentile: 95, minSamples: 10, unit: 'ms' },
}

const CRITICAL_OPERATIONS = new Set([
  '/api/health',
  '/api/swarm',
  '/api/swarms',
  '/api/tickers',
  '/api/runs',
  '/api/runs/:runId',
  '/api/output/run',
])

const API_BUDGETS: Record<'server.api_latency' | 'browser.api_latency', Budget> = {
  'server.api_latency': { label: 'Backend response', value: 250, percentile: 95, minSamples: 20, unit: 'ms' },
  'browser.api_latency': { label: 'API round trip', value: 500, percentile: 95, minSamples: 20, unit: 'ms' },
}

const RETENTION_DAYS = 14
const MAX_DAILY_BYTES = 2 * 1024 * 1024
const MAX_BATCH = 100
const MAX_VALUE_MS = 10 * 60_000
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60_000
const SUMMARY_CACHE_MS = 15_000
const DAY_FILE_RE = /^\d{4}-\d{2}-\d{2}\.jsonl$/
const NAME_SET = new Set<string>(PERFORMANCE_SAMPLE_NAMES)
const UNIT_BY_NAME: Record<PerformanceSampleName, PerformanceUnit> = Object.fromEntries(
  PERFORMANCE_SAMPLE_NAMES.map((name) => [name, name === 'browser.layout_shift' ? 'score' : 'ms']),
) as Record<PerformanceSampleName, PerformanceUnit>
const BROWSER_API_FAMILIES = [
  'activity', 'bridge', 'calendar', 'calls', 'chat', 'chats', 'credit', 'credit-check', 'data-needs',
  'data-status', 'feedback', 'health', 'intake', 'intake-plan', 'internal', 'launch', 'memory', 'news',
  'output', 'pending-admissions', 'performance', 'pipeline', 'pipelines', 'portfolio', 'prompt', 'providers',
  'quote', 'resumable', 'runs', 'screener', 'swarm', 'swarms', 'tasks', 'thesis-plan', 'tickers', 'tools',
  'valuation-levers', 'watchlist', 'what-changed', 'whoami',
]
const SAFE_BROWSER_OPERATIONS = new Set([
  '/asset/*', '/context/other', '/boot/core', '/subject/select', '/run/stream',
  '/reconnect/ready', '/reconnect/settled', '/reconnect/cancelled', '/reconnect/error',
  '/api/health', '/api/swarms', '/api/swarm', '/api/swarm/subjects', '/api/swarm/pulse', '/api/tickers',
  '/api/runs', '/api/runs/:runId', '/api/runs/:runId/stream', '/api/output/run', '/api/performance/*',
  ...BROWSER_API_FAMILIES.map((family) => `/api/${family}/*`),
  ...['run-started', 'agent-started', 'agent-done', 'agent-failed', 'layer-advanced', 'module-done',
    'module-routed', 'cost-tick', 'run-done', 'run-error', 'run-heartbeat', 'run-activity',
    'readiness-checking', 'readiness-report', 'readiness-blocked', 'readiness-resolved']
    .map((event) => `/event/${event}`),
])

function releaseId(): string {
  const raw = process.env.CF_PAGES_COMMIT_SHA || process.env.GIT_COMMIT || process.env.COMMIT_SHA || 'local'
  return /^[A-Za-z0-9._-]{1,80}$/.test(raw) ? raw : 'local'
}

function roundValue(value: number, unit: PerformanceUnit): number {
  return unit === 'score' ? Math.round(value * 10_000) / 10_000 : Math.round(value * 10) / 10
}

function percentile(sorted: number[], pct: number): number {
  if (sorted.length === 0) return 0
  const index = Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1)
  return sorted[Math.min(index, sorted.length - 1)]
}

function budgetFor(name: PerformanceSampleName, operation?: string): Budget | null {
  if (name === 'server.api_latency' || name === 'browser.api_latency') {
    return operation && CRITICAL_OPERATIONS.has(operation) ? API_BUDGETS[name] : null
  }
  return BUDGETS[name] ?? null
}

function defaultLabel(name: PerformanceSampleName, operation?: string): string {
  if (name === 'server.api_latency') return operation ? `Backend · ${operation}` : 'Backend response'
  if (name === 'browser.api_latency') return operation ? `Browser · ${operation}` : 'API round trip'
  return BUDGETS[name]?.label ?? name
}

export function normalizeServerOperation(route: string | undefined): string | undefined {
  if (!route || !route.startsWith('/api/')) return undefined
  return route
    .replace(/:runId\b/g, ':runId')
    .replace(/:ticker\b/g, ':ticker')
    .slice(0, 160)
}

export function validateBrowserPerformanceSamples(value: unknown, now = Date.now()): PerformanceSampleInput[] | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const body = value as Record<string, unknown>
  if (Object.keys(body).some((key) => key !== 'samples') || !Array.isArray(body.samples) || body.samples.length > MAX_BATCH) return null
  const out: PerformanceSampleInput[] = []
  for (const row of body.samples) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null
    const sample = row as Record<string, unknown>
    if (Object.keys(sample).some((key) => !['name', 'value', 'unit', 'ts', 'operation', 'outcome'].includes(key))) return null
    if (typeof sample.name !== 'string' || !NAME_SET.has(sample.name) || sample.name === 'server.api_latency') return null
    if (sample.unit !== 'ms' && sample.unit !== 'score') return null
    if (sample.unit !== UNIT_BY_NAME[sample.name as PerformanceSampleName]) return null
    if (typeof sample.value !== 'number' || !Number.isFinite(sample.value) || sample.value < 0) return null
    if (sample.unit === 'ms' && sample.value > MAX_VALUE_MS) return null
    if (sample.unit === 'score' && sample.value > 10) return null
    if (sample.ts !== undefined && (typeof sample.ts !== 'number' || !Number.isInteger(sample.ts) || Math.abs(sample.ts - now) > MAX_CLOCK_SKEW_MS)) return null
    if (sample.operation !== undefined && (typeof sample.operation !== 'string' || !SAFE_BROWSER_OPERATIONS.has(sample.operation))) return null
    if (sample.outcome !== undefined && !['ok', 'error', 'cancelled'].includes(String(sample.outcome))) return null
    out.push({
      name: sample.name as PerformanceSampleName,
      value: roundValue(sample.value, sample.unit),
      unit: sample.unit,
      ...(sample.ts !== undefined ? { ts: sample.ts } : {}),
      ...(sample.operation !== undefined ? { operation: sample.operation } : {}),
      ...(sample.outcome !== undefined ? { outcome: sample.outcome as PerformanceOutcome } : {}),
    })
  }
  return out
}

export interface PerformanceTelemetryOptions {
  retentionDays?: number
  maxDailyBytes?: number
  flushDelayMs?: number
  release?: string
}

export class PerformanceTelemetry {
  readonly retentionDays: number
  private readonly dir: string
  private readonly maxDailyBytes: number
  private readonly flushDelayMs: number
  private readonly release: string
  private queue: StoredPerformanceSample[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private flushPromise: Promise<void> = Promise.resolve()
  private lastPruneDay = ''
  private dropped = 0
  private summaryCache: { hours: number; at: number; value: PerformanceSummary } | null = null

  constructor(stateDir: string, options: PerformanceTelemetryOptions = {}) {
    this.dir = path.join(stateDir, 'performance')
    this.retentionDays = options.retentionDays ?? RETENTION_DAYS
    this.maxDailyBytes = options.maxDailyBytes ?? MAX_DAILY_BYTES
    this.flushDelayMs = options.flushDelayMs ?? 2_000
    this.release = options.release ?? releaseId()
  }

  recordServer(value: number, operation?: string, outcome: PerformanceOutcome = 'ok', ts = Date.now()): void {
    this.enqueue({ name: 'server.api_latency', value, unit: 'ms', operation, outcome, ts }, 'server')
  }

  recordBrowser(samples: PerformanceSampleInput[]): void {
    for (const sample of samples) this.enqueue(sample, 'browser')
  }

  private enqueue(sample: PerformanceSampleInput, source: 'server' | 'browser'): void {
    if (!Number.isFinite(sample.value) || sample.value < 0) return
    this.queue.push({
      version: 1,
      name: sample.name,
      value: roundValue(sample.value, sample.unit),
      unit: sample.unit,
      ts: sample.ts ?? Date.now(),
      source,
      ...(sample.operation ? { operation: sample.operation } : {}),
      outcome: sample.outcome ?? 'ok',
      release: this.release,
    })
    if (this.queue.length >= MAX_BATCH) void this.flush()
    else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => { this.flushTimer = null; void this.flush() }, this.flushDelayMs)
      this.flushTimer.unref?.()
    }
  }

  async flush(): Promise<void> {
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null }
    if (this.queue.length === 0) return this.flushPromise
    const batch = this.queue.splice(0, this.queue.length)
    this.flushPromise = this.flushPromise.then(() => this.writeBatch(batch)).catch(() => {
      this.dropped += batch.length
    })
    return this.flushPromise
  }

  private async writeBatch(batch: StoredPerformanceSample[]): Promise<void> {
    await fs.promises.mkdir(this.dir, { recursive: true, mode: 0o700 })
    const byDay = new Map<string, StoredPerformanceSample[]>()
    for (const sample of batch) {
      const day = new Date(sample.ts).toISOString().slice(0, 10)
      const rows = byDay.get(day) ?? []
      rows.push(sample)
      byDay.set(day, rows)
    }
    for (const [day, rows] of byDay) {
      const file = path.join(this.dir, `${day}.jsonl`)
      let size = 0
      try { size = (await fs.promises.stat(file)).size } catch {}
      const payload = rows.map((row) => JSON.stringify(row)).join('\n') + '\n'
      if (size + Buffer.byteLength(payload) > this.maxDailyBytes) {
        this.dropped += rows.length
        continue
      }
      await fs.promises.appendFile(file, payload, { encoding: 'utf8', mode: 0o600 })
    }
    const today = new Date().toISOString().slice(0, 10)
    if (today !== this.lastPruneDay) {
      this.lastPruneDay = today
      await this.prune()
    }
  }

  private async prune(): Promise<void> {
    const floor = Date.now() - this.retentionDays * 24 * 60 * 60_000
    let names: string[] = []
    try { names = await fs.promises.readdir(this.dir) } catch { return }
    await Promise.all(names.filter((name) => DAY_FILE_RE.test(name)).map(async (name) => {
      const day = Date.parse(`${name.slice(0, 10)}T00:00:00.000Z`)
      if (Number.isFinite(day) && day < floor) {
        try { await fs.promises.unlink(path.join(this.dir, name)) } catch {}
      }
    }))
  }

  private async readSamples(since: number, until: number): Promise<StoredPerformanceSample[]> {
    let names: string[] = []
    try { names = await fs.promises.readdir(this.dir) } catch { return [] }
    const out: StoredPerformanceSample[] = []
    for (const name of names.filter((candidate) => DAY_FILE_RE.test(candidate)).sort()) {
      const day = Date.parse(`${name.slice(0, 10)}T00:00:00.000Z`)
      if (!Number.isFinite(day) || day > until || day + 24 * 60 * 60_000 < since) continue
      let raw = ''
      try { raw = await fs.promises.readFile(path.join(this.dir, name), 'utf8') } catch { continue }
      for (const line of raw.split('\n')) {
        if (!line) continue
        try {
          const row = JSON.parse(line) as StoredPerformanceSample
          if (row.version === 1 && NAME_SET.has(row.name) && row.ts >= since && row.ts <= until
              && Number.isFinite(row.value) && (row.unit === 'ms' || row.unit === 'score')) out.push(row)
        } catch { /* one interrupted line never hides the rest of the durable history */ }
      }
    }
    return out
  }

  async summary(windowHours = 24, now = Date.now()): Promise<PerformanceSummary> {
    const hours = Math.max(1, Math.min(168, Math.round(windowHours)))
    // The Status chip and an open drawer may ask almost together. Reuse a very short snapshot so reading
    // history cannot itself become observable cockpit work; normal samples may trail the panel by 15s.
    const cacheAge = this.summaryCache ? now - this.summaryCache.at : Infinity
    if (this.summaryCache?.hours === hours && cacheAge >= 0 && cacheAge < SUMMARY_CACHE_MS) return this.summaryCache.value
    await this.flush()
    const windowMs = hours * 60 * 60_000
    const current = await this.readSamples(now - windowMs, now)
    const baseline = await this.readSamples(now - windowMs - 7 * 24 * 60 * 60_000, now - windowMs)
    const groups = new Map<string, StoredPerformanceSample[]>()
    const baselineGroups = new Map<string, StoredPerformanceSample[]>()
    const add = (target: Map<string, StoredPerformanceSample[]>, sample: StoredPerformanceSample) => {
      const key = `${sample.name}\0${sample.operation ?? ''}`
      const rows = target.get(key) ?? []
      rows.push(sample)
      target.set(key, rows)
    }
    current.forEach((sample) => add(groups, sample))
    baseline.forEach((sample) => add(baselineGroups, sample))
    const metrics: PerformanceMetricSummary[] = []
    for (const [key, rows] of groups) {
      const [nameRaw, operationRaw] = key.split('\0')
      const name = nameRaw as PerformanceSampleName
      const operation = operationRaw || undefined
      const values = rows.map((row) => row.value).sort((a, b) => a - b)
      const baselineValues = (baselineGroups.get(key) ?? []).map((row) => row.value).sort((a, b) => a - b)
      const budget = budgetFor(name, operation)
      const observed = budget ? percentile(values, budget.percentile) : percentile(values, 95)
      const status = !budget
        ? 'observed'
        : rows.length < budget.minSamples
          ? 'learning'
          : observed <= budget.value ? 'good' : 'needs_attention'
      const currentP95 = percentile(values, 95)
      const baselineP95 = baselineValues.length >= 10 ? percentile(baselineValues, 95) : null
      const changePct = baselineP95 && baselineP95 > 0 ? Math.round(((currentP95 - baselineP95) / baselineP95) * 1_000) / 10 : null
      const trend = changePct === null || rows.length < 10
        ? 'learning'
        : changePct > 20 ? 'slower' : changePct < -20 ? 'faster' : 'stable'
      metrics.push({
        name,
        label: budget?.label ?? defaultLabel(name, operation),
        unit: rows[0].unit,
        ...(operation ? { operation } : {}),
        count: rows.length,
        errorCount: rows.filter((row) => row.outcome === 'error').length,
        p50: percentile(values, 50),
        p75: percentile(values, 75),
        p95: currentP95,
        max: values[values.length - 1] ?? 0,
        budget: budget?.value ?? null,
        budgetPercentile: budget?.percentile ?? 95,
        status,
        baselineP95,
        changePct,
        trend,
      })
    }
    metrics.sort((a, b) => {
      const rank = (status: PerformanceMetricSummary['status']) => status === 'needs_attention' ? 0 : status === 'good' ? 1 : status === 'learning' ? 2 : 3
      return rank(a.status) - rank(b.status) || (b.budget ? b.p95 / b.budget : b.p95) - (a.budget ? a.p95 / a.budget : a.p95)
    })
    const budgeted = metrics.filter((metric) => metric.budget !== null)
    const status = budgeted.some((metric) => metric.status === 'needs_attention')
      ? 'needs_attention'
      : budgeted.some((metric) => metric.status === 'good') ? 'good' : 'learning'
    const result: PerformanceSummary = {
      version: 1,
      generatedAt: new Date(now).toISOString(),
      windowHours: hours,
      retentionDays: this.retentionDays,
      sampleCount: current.length,
      droppedSamples: this.dropped,
      status,
      metrics,
    }
    this.summaryCache = { hours, at: now, value: result }
    return result
  }
}
