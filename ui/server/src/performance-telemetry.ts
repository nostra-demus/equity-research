import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

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
  // PerformanceObserver reports only tasks which already crossed the browser's 50ms long-task line.
  // Treat each as an incident: one severe freeze must be visible immediately, not after ten freezes.
  'browser.long_task': { label: 'Main-thread freeze', value: 100, percentile: 95, minSamples: 1, unit: 'ms' },
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
const DAY_MS = 24 * 60 * 60_000
// Normal always-open polling produces roughly 3.4 MiB/day before any run activity. Keep more than 2x
// that steady-state load so the safety cap catches abnormal volume rather than ordinary cockpit use.
const MAX_DAILY_BYTES = 8 * 1024 * 1024
const MAX_BATCH = 100
const MAX_VALUE_MS = 10 * 60_000
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60_000
const MAX_BROWSER_REPORTED_DROPS = 10_000
const SUMMARY_CACHE_MS = 15_000
const DROP_BUCKET_MS = 60 * 60_000
const DROP_STATE_FILE = 'dropped-samples.json'
const DAY_FILE_RE = /^\d{4}-\d{2}-\d{2}\.jsonl$/
const RELEASE_RE = /^[A-Za-z0-9._-]{1,80}$/
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

// "Fast" is a system verdict, not a synonym for one healthy backend heartbeat. Require evidence from
// browser boot, an ordinary company selection, a live run paint, and the browser-to-health round trip.
const GOOD_COVERAGE = [
  { name: 'browser.core_ready' },
  { name: 'browser.subject_ready' },
  { name: 'browser.run_event_paint' },
  { name: 'browser.api_latency', operation: '/api/health' },
] as const

export interface ValidatedBrowserPerformanceBatch {
  samples: PerformanceSampleInput[]
  droppedSamples: number
}

function releaseId(): string {
  for (const raw of [process.env.CF_PAGES_COMMIT_SHA, process.env.GIT_COMMIT, process.env.COMMIT_SHA]) {
    if (raw && RELEASE_RE.test(raw)) return raw
  }
  try {
    // The launch service starts in ui/server and carries ENGINE_REPO_ROOT. Resolve once at boot so local
    // production samples retain deploy provenance even when a CI-only commit variable is unavailable.
    const raw = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
      cwd: process.env.ENGINE_REPO_ROOT || process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 500,
    }).trim()
    if (RELEASE_RE.test(raw)) return raw
  } catch {}
  return 'local'
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
  // Fastify supplies the registered route template here, not the request URL, so parameter names are
  // already privacy-safe placeholders (for example, /api/runs/:runId).
  return route.slice(0, 160)
}

export function performanceOutcomeForResponse(operation: string | undefined, statusCode: number): PerformanceOutcome {
  // A company with no saved run is a normal empty state. Keep its duration for observability without
  // treating that expected probe as an operational failure.
  if (operation === '/api/output/run' && statusCode === 404) return 'cancelled'
  return statusCode >= 400 ? 'error' : 'ok'
}

export function validateBrowserPerformanceSamples(value: unknown, now = Date.now()): ValidatedBrowserPerformanceBatch | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const body = value as Record<string, unknown>
  if (Object.keys(body).some((key) => !['samples', 'droppedSamples'].includes(key))
      || !Array.isArray(body.samples) || body.samples.length > MAX_BATCH
      || (body.droppedSamples !== undefined && (typeof body.droppedSamples !== 'number' || !Number.isInteger(body.droppedSamples)
        || Number(body.droppedSamples) < 0 || Number(body.droppedSamples) > MAX_BROWSER_REPORTED_DROPS))) return null
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
  return { samples: out, droppedSamples: Number(body.droppedSamples ?? 0) }
}

export interface PerformanceTelemetryOptions {
  retentionDays?: number
  maxDailyBytes?: number
  maxPendingSamples?: number
  flushDelayMs?: number
  release?: string
}

export class PerformanceTelemetry {
  readonly retentionDays: number
  private readonly dir: string
  private readonly maxDailyBytes: number
  private readonly maxPendingSamples: number
  private readonly flushDelayMs: number
  private readonly release: string
  private queue: StoredPerformanceSample[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private writer: Promise<void> | null = null
  private lastPruneDay = ''
  private pruneInFlight: Promise<void> | null = null
  private droppedByHour = new Map<string, { release: string; startedAt: number; count: number }>()
  private dropsLoaded = false
  private dropsDirty = false
  private dropWriter: Promise<void> | null = null
  private dropPersistTimer: NodeJS.Timeout | null = null
  private delimitedFiles = new Set<string>()
  private summaryCache: { hours: number; at: number; value: PerformanceSummary } | null = null
  private summaryInFlight = new Map<number, Promise<PerformanceSummary>>()
  private historySnapshotCache: { at: number; samples: StoredPerformanceSample[] } | null = null
  private historySnapshotInFlight: Promise<StoredPerformanceSample[]> | null = null

  constructor(stateDir: string, options: PerformanceTelemetryOptions = {}) {
    this.dir = path.join(stateDir, 'performance')
    this.retentionDays = options.retentionDays ?? RETENTION_DAYS
    this.maxDailyBytes = options.maxDailyBytes ?? MAX_DAILY_BYTES
    this.maxPendingSamples = Math.max(MAX_BATCH, options.maxPendingSamples ?? 1_000)
    this.flushDelayMs = options.flushDelayMs ?? 2_000
    this.release = options.release ?? releaseId()
  }

  recordServer(value: number, operation?: string, outcome: PerformanceOutcome = 'ok', ts = Date.now()): void {
    this.enqueue({ name: 'server.api_latency', value, unit: 'ms', operation, outcome, ts }, 'server')
  }

  recordBrowser(samples: PerformanceSampleInput[], droppedSamples = 0): void {
    if (droppedSamples > 0) this.noteDropped(Math.min(MAX_BROWSER_REPORTED_DROPS, Math.floor(droppedSamples)))
    for (const sample of samples) this.enqueue(sample, 'browser')
  }

  private enqueue(sample: PerformanceSampleInput, source: 'server' | 'browser'): void {
    if (!Number.isFinite(sample.value) || sample.value < 0) return
    // One stalled filesystem operation must not turn passive telemetry into an unbounded promise chain.
    // Keep at most a fixed tail waiting behind the single writer and count every discarded observation.
    if (this.queue.length >= this.maxPendingSamples) {
      this.noteDropped(1)
      return
    }
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
    if (this.dropPersistTimer) { clearTimeout(this.dropPersistTimer); this.dropPersistTimer = null }
    if (!this.writer && this.queue.length) {
      this.writer = this.drainQueue().finally(() => {
        this.writer = null
        // An enqueue can land between the drain loop's final check and this cleanup.
        if (this.queue.length) void this.flush()
      })
    }
    if (this.writer) await this.writer
    await this.persistDroppedSamples()
  }

  private async drainQueue(): Promise<void> {
    while (this.queue.length) {
      const batch = this.queue.splice(0, MAX_BATCH)
      const dropped = await this.writeBatch(batch)
      if (dropped > 0) this.noteDropped(dropped)
    }
  }

  private async writeBatch(batch: StoredPerformanceSample[]): Promise<number> {
    let remaining = batch.length
    let dropped = 0
    try {
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
        // Verify once per file on process startup, and again only after an append failure. The steady-state
        // writer avoids an extra open/read on every two-second batch while still healing restart debris.
        if (size > 0 && !this.delimitedFiles.has(file)) size = await this.repairInterruptedTail(file, size)
        const payload = rows.map((row) => JSON.stringify(row)).join('\n') + '\n'
        if (size + Buffer.byteLength(payload) > this.maxDailyBytes) {
          dropped += rows.length
          remaining -= rows.length
          continue
        }
        try {
          await fs.promises.appendFile(file, payload, { encoding: 'utf8', mode: 0o600 })
          this.delimitedFiles.add(file)
          remaining -= rows.length
        } catch {
          this.delimitedFiles.delete(file)
          // Earlier day groups are already durable and capped groups were already counted. Only this day
          // and the still-unattempted suffix were lost.
          return dropped + remaining
        }
      }
      await this.pruneIfDue(Date.now())
      return dropped
    } catch {
      return dropped + remaining
    }
  }

  private async repairInterruptedTail(file: string, size: number): Promise<number> {
    const handle = await fs.promises.open(file, 'r+')
    try {
      const last = Buffer.allocUnsafe(1)
      const tail = await handle.read(last, 0, 1, size - 1)
      if (tail.bytesRead === 1 && last[0] === 0x0a) return size

      // appendFile can leave a partial final row when storage fills mid-write. The failed batch is already
      // counted as lost; truncate only that unterminated row so the next valid row cannot be merged into it.
      const chunk = Buffer.allocUnsafe(4_096)
      let cursor = size
      while (cursor > 0) {
        const start = Math.max(0, cursor - chunk.length)
        const length = cursor - start
        const read = await handle.read(chunk, 0, length, start)
        for (let index = read.bytesRead - 1; index >= 0; index--) {
          if (chunk[index] !== 0x0a) continue
          const repairedSize = start + index + 1
          await handle.truncate(repairedSize)
          await handle.sync()
          return repairedSize
        }
        cursor = start
      }
      await handle.truncate(0)
      await handle.sync()
      return 0
    } finally {
      await handle.close()
    }
  }

  private async pruneIfDue(now: number): Promise<void> {
    const today = new Date(now).toISOString().slice(0, 10)
    if (today === this.lastPruneDay) return
    if (this.pruneInFlight) {
      await this.pruneInFlight
      if (today === this.lastPruneDay) return
    }
    const work = this.prune(now).then(() => { this.lastPruneDay = today })
    let tracked!: Promise<void>
    tracked = work.finally(() => {
      if (this.pruneInFlight === tracked) this.pruneInFlight = null
    })
    this.pruneInFlight = tracked
    await tracked
  }

  private async prune(now: number): Promise<void> {
    const floor = now - this.retentionDays * 24 * 60 * 60_000
    let names: string[] = []
    try { names = await fs.promises.readdir(this.dir) } catch { return }
    await Promise.all(names.filter((name) => DAY_FILE_RE.test(name)).map(async (name) => {
      const day = Date.parse(`${name.slice(0, 10)}T00:00:00.000Z`)
      // A daily file can straddle the exact retention boundary. Keep it until its final possible sample
      // is outside the window; readSamples still filters individual rows by timestamp.
      if (Number.isFinite(day) && day + DAY_MS <= floor) {
        try { await fs.promises.unlink(path.join(this.dir, name)) } catch {}
      }
    }))
  }

  private noteDropped(count: number, now = Date.now()): void {
    const bucket = Math.floor(now / DROP_BUCKET_MS) * DROP_BUCKET_MS
    const key = `${this.release}\0${bucket}`
    const existing = this.droppedByHour.get(key)
    this.droppedByHour.set(key, {
      release: this.release,
      startedAt: bucket,
      count: (existing?.count ?? 0) + count,
    })
    this.pruneDroppedSamples(now)
    this.dropsDirty = true
    this.summaryCache = null
    this.scheduleDroppedSamplePersistence()
  }

  private scheduleDroppedSamplePersistence(): void {
    if (this.dropPersistTimer || this.dropWriter) return
    this.dropPersistTimer = setTimeout(() => {
      this.dropPersistTimer = null
      void this.persistDroppedSamples()
    }, this.flushDelayMs)
    this.dropPersistTimer.unref?.()
  }

  private droppedWithin(since: number, until: number): number {
    let count = 0
    for (const bucket of this.droppedByHour.values()) {
      // Hour buckets keep loss tracking bounded while still expiring an old incident from the selected
      // health window. Include any bucket which overlaps the window rather than hiding a boundary loss.
      if (bucket.release === this.release && bucket.startedAt <= until
          && bucket.startedAt + DROP_BUCKET_MS >= since) count += bucket.count
    }
    return count
  }

  private pruneDroppedSamples(now: number): boolean {
    const floor = now - this.retentionDays * DAY_MS - DROP_BUCKET_MS
    let changed = false
    for (const [key, bucket] of this.droppedByHour) {
      if (bucket.startedAt < floor) {
        this.droppedByHour.delete(key)
        changed = true
      }
    }
    return changed
  }

  private async loadDroppedSamples(): Promise<void> {
    if (this.dropsLoaded) return
    this.dropsLoaded = true
    let parsed: unknown
    try { parsed = JSON.parse(await fs.promises.readFile(path.join(this.dir, DROP_STATE_FILE), 'utf8')) }
    catch { return }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return
    const state = parsed as Record<string, unknown>
    if (state.version !== 1 || !Array.isArray(state.buckets)) return
    for (const candidate of state.buckets) {
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue
      const bucket = candidate as Record<string, unknown>
      if (typeof bucket.release !== 'string' || !RELEASE_RE.test(bucket.release)
          || typeof bucket.startedAt !== 'number' || !Number.isSafeInteger(bucket.startedAt) || bucket.startedAt < 0
          || typeof bucket.count !== 'number' || !Number.isSafeInteger(bucket.count) || bucket.count <= 0) continue
      const key = `${bucket.release}\0${bucket.startedAt}`
      const existing = this.droppedByHour.get(key)
      this.droppedByHour.set(key, {
        release: bucket.release,
        startedAt: bucket.startedAt,
        count: Math.min(Number.MAX_SAFE_INTEGER, (existing?.count ?? 0) + bucket.count),
      })
    }
  }

  private persistDroppedSamples(): Promise<void> {
    if (this.dropWriter) return this.dropWriter
    if (!this.dropsDirty && this.dropsLoaded) return Promise.resolve()
    this.dropWriter = (async () => {
      await this.loadDroppedSamples()
      if (this.pruneDroppedSamples(Date.now())) this.dropsDirty = true
      while (this.dropsDirty) {
        this.dropsDirty = false
        this.pruneDroppedSamples(Date.now())
        await fs.promises.mkdir(this.dir, { recursive: true, mode: 0o700 })
        const target = path.join(this.dir, DROP_STATE_FILE)
        const temp = `${target}.tmp-${process.pid}`
        const body = `${JSON.stringify({ version: 1, buckets: [...this.droppedByHour.values()] })}\n`
        try {
          const handle = await fs.promises.open(temp, 'w', 0o600)
          try {
            await handle.chmod(0o600)
            await handle.writeFile(body, 'utf8')
            await handle.sync()
          } finally {
            await handle.close()
          }
          await fs.promises.rename(temp, target)
        } catch (error) {
          this.dropsDirty = true
          try { await fs.promises.rm(temp, { force: true }) } catch {}
          throw error
        }
      }
    })().catch(() => {
      // Telemetry must never block cockpit work. The in-memory incident remains red and the next flush
      // retries the atomic snapshot; a broken measurement disk cannot recursively record its own loss.
    }).finally(() => {
      this.dropWriter = null
      // A loss can land after the writer's final dirty check but before this cleanup. Preserve one bounded
      // delayed retry rather than creating a promise or fsync for every discarded observation.
      if (this.dropsDirty) this.scheduleDroppedSamplePersistence()
    })
    return this.dropWriter
  }

  private async readSamples(since: number, until: number): Promise<StoredPerformanceSample[]> {
    let names: string[] = []
    try { names = await fs.promises.readdir(this.dir) } catch { return [] }
    const out: StoredPerformanceSample[] = []
    for (const name of names.filter((candidate) => DAY_FILE_RE.test(candidate)).sort()) {
      const day = Date.parse(`${name.slice(0, 10)}T00:00:00.000Z`)
      if (!Number.isFinite(day) || day > until || day + 24 * 60 * 60_000 < since) continue
      let raw = ''
      try { raw = await fs.promises.readFile(path.join(this.dir, name), 'utf8') }
      catch {
        // Missing history is unknown performance, never evidence that the cockpit is fast. Let the
        // deadline-wrapped route surface an unavailable summary instead of silently omitting a bad day.
        throw new Error(`retained performance history is unreadable: ${name}`)
      }
      for (const line of raw.split('\n')) {
        if (!line) continue
        try {
          const row = JSON.parse(line)
          if (row && typeof row === 'object' && !Array.isArray(row)
              && row.version === 1 && typeof row.name === 'string' && NAME_SET.has(row.name)
              && typeof row.ts === 'number' && Number.isSafeInteger(row.ts) && row.ts >= since && row.ts <= until
              && typeof row.value === 'number' && Number.isFinite(row.value) && row.value >= 0
              && row.unit === UNIT_BY_NAME[row.name as PerformanceSampleName]
              && (row.source === 'server' || row.source === 'browser')
              && (row.name === 'server.api_latency') === (row.source === 'server')
              && (row.outcome === 'ok' || row.outcome === 'error' || row.outcome === 'cancelled')
              && typeof row.release === 'string' && RELEASE_RE.test(row.release)
              && row.release === this.release
              && (row.operation === undefined || (typeof row.operation === 'string' && row.operation.length <= 160))) {
            out.push(row as StoredPerformanceSample)
          }
        } catch { /* one interrupted line never hides the rest of the durable history */ }
      }
    }
    return out
  }

  private readHistorySnapshot(now: number): Promise<StoredPerformanceSample[]> {
    const cacheAge = this.historySnapshotCache ? now - this.historySnapshotCache.at : Infinity
    if (this.historySnapshotCache && cacheAge >= 0 && cacheAge < SUMMARY_CACHE_MS) {
      return Promise.resolve(this.historySnapshotCache.samples)
    }
    if (this.historySnapshotInFlight) return this.historySnapshotInFlight
    const work = this.readSamples(now - this.retentionDays * DAY_MS, now)
      .then((samples) => {
        this.historySnapshotCache = { at: now, samples }
        return samples
      })
    let tracked!: Promise<StoredPerformanceSample[]>
    tracked = work.finally(() => {
      if (this.historySnapshotInFlight === tracked) this.historySnapshotInFlight = null
    })
    this.historySnapshotInFlight = tracked
    return tracked
  }

  async summary(windowHours = 24, now = Date.now()): Promise<PerformanceSummary> {
    const hours = Math.max(1, Math.min(168, Math.round(windowHours)))
    const existing = this.summaryInFlight.get(hours)
    if (existing) return existing
    const work = this.buildSummary(hours, now)
    this.summaryInFlight.set(hours, work)
    try { return await work }
    finally {
      if (this.summaryInFlight.get(hours) === work) this.summaryInFlight.delete(hours)
    }
  }

  private async buildSummary(hours: number, now: number): Promise<PerformanceSummary> {
    // Retention is a storage guarantee, not merely a read filter. A quiet engine may have no writes for
    // weeks, so every operator summary read also performs the at-most-daily deletion pass.
    await this.pruneIfDue(now)
    // The Status chip and an open drawer may ask almost together. Reuse a very short snapshot so reading
    // history cannot itself become observable cockpit work; normal samples may trail the panel by 15s.
    const cacheAge = this.summaryCache ? now - this.summaryCache.at : Infinity
    if (this.summaryCache?.hours === hours && cacheAge >= 0 && cacheAge < SUMMARY_CACHE_MS) return this.summaryCache.value
    await this.flush()
    const windowMs = hours * 60 * 60_000
    const droppedSamples = this.droppedWithin(now - windowMs, now)
    // Every accepted window is a projection of one shared, cached 14-day read. Rotating query-window
    // values cannot create parallel filesystem scans after the HTTP deadline has returned.
    const history = await this.readHistorySnapshot(now)
    const current = history.filter((sample) => sample.ts >= now - windowMs && sample.ts <= now)
    const baseline = history.filter((sample) => sample.ts >= now - windowMs - 7 * DAY_MS
      && sample.ts <= now - windowMs)
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
      const successfulRows = rows.filter((row) => row.outcome === 'ok')
      const errorCount = rows.filter((row) => row.outcome === 'error').length
      const errorRate = rows.length ? Math.round((errorCount / rows.length) * 1_000) / 1_000 : 0
      // Fast failures are not fast experiences. Latency percentiles and their sample floor use only
      // successful requests; the separate error-rate gate prevents an erroring route from turning green.
      const values = successfulRows.map((row) => row.value).sort((a, b) => a - b)
      const baselineValues = (baselineGroups.get(key) ?? []).filter((row) => row.outcome === 'ok').map((row) => row.value).sort((a, b) => a - b)
      const budget = budgetFor(name, operation)
      const observed = budget ? percentile(values, budget.percentile) : percentile(values, 95)
      const status = !budget
        ? 'observed'
        : errorCount > 0 && (successfulRows.length === 0 || (rows.length >= budget.minSamples && errorRate > 0.05))
          ? 'needs_attention'
        : successfulRows.length < budget.minSamples
          ? 'learning'
          : observed <= budget.value ? 'good' : 'needs_attention'
      const currentP95 = percentile(values, 95)
      const baselineP95 = baselineValues.length >= 10 ? percentile(baselineValues, 95) : null
      const changePct = baselineP95 && baselineP95 > 0 ? Math.round(((currentP95 - baselineP95) / baselineP95) * 1_000) / 10 : null
      const trend = changePct === null || successfulRows.length < 10
        ? 'learning'
        : changePct > 20 ? 'slower' : changePct < -20 ? 'faster' : 'stable'
      metrics.push({
        name,
        label: budget?.label ?? defaultLabel(name, operation),
        unit: rows[0].unit,
        ...(operation ? { operation } : {}),
        count: rows.length,
        successCount: successfulRows.length,
        errorCount,
        errorRate,
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
    const hasGoodCoverage = GOOD_COVERAGE.every((required) => metrics.some((metric) =>
      metric.name === required.name && metric.status === 'good'
      && (!('operation' in required) || metric.operation === required.operation)))
    const status = droppedSamples > 0 || budgeted.some((metric) => metric.status === 'needs_attention')
      ? 'needs_attention'
      : hasGoodCoverage ? 'good' : 'learning'
    const result: PerformanceSummary = {
      version: 1,
      release: this.release,
      generatedAt: new Date(now).toISOString(),
      windowHours: hours,
      retentionDays: this.retentionDays,
      sampleCount: current.length,
      droppedSamples,
      status,
      metrics,
    }
    this.summaryCache = { hours, at: now, value: result }
    return result
  }
}
