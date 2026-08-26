import fs from 'node:fs'
import path from 'node:path'
import type { CycleSummary } from './types'
import { contiguousFirehoseFiles, parseFirehoseName, resolvedFirehoseFiles } from './firehose-files'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../singleton-lock'
import {
  deterministicCycleId,
  readCycleInterruptionAudit,
  recordCycleInterruption,
} from './provider-routing'

export const PIPELINE_FLOW_WINDOW_MINUTES = 60 as const
export const PIPELINE_FLOW_WINDOW_MS = PIPELINE_FLOW_WINDOW_MINUTES * 60_000
/**
 * `runAbortableCycle` fires its guard at `cycleTimeoutMs`, then awaits the aborted cycle while it durably
 * journals the unscored tail and publishes its summary. Give that fail-soft settlement a small, bounded
 * interval; rows beyond it are still treated as damaged rather than stretching the rate window indefinitely.
 */
export const PIPELINE_FLOW_ABORT_SETTLEMENT_MS = 2 * 60_000
const PIPELINE_FLOW_WINDOW_SECONDS = PIPELINE_FLOW_WINDOW_MS / 1000
const UTC_DAY_MS = 24 * 60 * 60_000

export type PipelineFlowCoverage = 'complete' | 'partial' | 'none'
export type PipelineFlowComparisonStatus = 'ahead' | 'equal' | 'behind' | 'unavailable'

export interface PipelineFlowHistory {
  coverage: PipelineFlowCoverage
  requiredDates: string[]
  readDates: string[]
  missingDates: string[]
  unreadableDates: string[]
  corruptCycleRows: number
  /** Started cycles whose durable summary receipt is still absent inside the rate window. */
  incompleteCycles?: number
  /** Permanently audited missing-summary incidents that still overlap the rate window. */
  recordedInterruptions?: number
  /** Missing-summary receipts that started during the current UTC day, including ones older than the rate window. */
  todayIncompleteCycles?: number
  /** Permanently audited missing-summary incidents that started during the current UTC day. */
  todayRecordedInterruptions?: number
  /** Today's summary-derived counters are lower bounds because a receipt is missing or the receipt file is unreadable. */
  todayTotalsLowerBound?: boolean
  /** Readability of today's summary partition. Missing is explicit: zero rows cannot prove zero completed looks. */
  todayHistoryStatus?: 'complete' | 'missing' | 'unreadable'
  /** Malformed cycle-summary rows in today's otherwise-readable partition. */
  todayCorruptCycleRows?: number
  /** The compact completion-gap authority itself could not be trusted. */
  gapMarkerUnreadable?: boolean
  /** The append-only interruption audit could not be trusted. */
  interruptionAuditUnreadable?: boolean
}

export interface PipelineFlowMeasure {
  /** Total queue items in the fixed trailing window. Null means cycle/history coverage cannot prove it. */
  items: number | null
  /** `items / 3,600`, never an elapsed-since-first-observation average. */
  perSecond: number | null
  measured: boolean
  coverage: PipelineFlowCoverage
  knownCycles: number
  totalCycles: number
}

export interface PipelineFlowRates {
  windowMinutes: typeof PIPELINE_FLOW_WINDOW_MINUTES
  from: string
  to: string
  history: PipelineFlowHistory
  inflow: PipelineFlowMeasure
  scanning: PipelineFlowMeasure
  comparison: {
    measured: boolean
    status: PipelineFlowComparisonStatus
    /** Scanning minus new arrivals. Positive is capacity headroom; negative is queue pressure. */
    scanningMinusInflowItemsPerHour: number | null
  }
}

export interface PipelineFlowCycleRead {
  /** Rate/day rows from only the partitions required for the trailing window. */
  cycles: CycleSummary[]
  history: PipelineFlowHistory
  /** Best-effort operational row, independently retained/read and never included in rate or daily totals. */
  latestCycle: CycleSummary | null
}

interface EventIdentity { event_id?: unknown }

const PIPELINE_FLOW_GAP_FILE = 'news-pipeline-flow-gaps.json'
interface PipelineFlowGapFile { v: 1; starts: string[] }

function gapFilePath(stateDir: string): string { return path.join(stateDir, PIPELINE_FLOW_GAP_FILE) }
function gapLockPath(stateDir: string): string { return `${gapFilePath(stateDir)}.lock` }

function readPipelineFlowGapFile(stateDir: string): { status: 'ok'; starts: string[] } | { status: 'missing' | 'unreadable' } {
  try {
    const parsed = JSON.parse(fs.readFileSync(gapFilePath(stateDir), 'utf8')) as Partial<PipelineFlowGapFile>
    if (parsed?.v !== 1 || !Array.isArray(parsed.starts) || parsed.starts.length > 512
      || parsed.starts.some((value) => typeof value !== 'string' || !Number.isFinite(Date.parse(value)))) {
      return { status: 'unreadable' }
    }
    return { status: 'ok', starts: [...new Set(parsed.starts)] }
  } catch (error: any) {
    return error?.code === 'ENOENT' ? { status: 'missing' } : { status: 'unreadable' }
  }
}

function writePipelineFlowGapFile(stateDir: string, starts: readonly string[]): boolean {
  const target = gapFilePath(stateDir)
  const tmp = `${target}.tmp`
  let fd: number | undefined
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fd = fs.openSync(tmp, 'w', 0o600)
    fs.writeFileSync(fd, `${JSON.stringify({ v: 1, starts })}\n`)
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    fs.renameSync(tmp, target)
    const dir = fs.openSync(stateDir, 'r')
    try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
    return true
  } catch {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.rmSync(tmp, { force: true }) } catch { /* best effort */ }
    return false
  }
}

function withPipelineFlowGapMutation(stateDir: string, action: () => boolean): boolean {
  let lock: number | undefined
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    lock = acquireRetainedFlockSync(gapLockPath(stateDir), { waitMs: 2_000, busyMessage: 'pipeline flow receipt writer busy' })
    return action()
  } catch {
    return false
  } finally {
    if (lock !== undefined) releaseRetainedFlock(lock)
  }
}

/** Durable start receipt. If this cannot land, the cycle must not process data: its rate outcome could not
 * be proven later. Retain every receipt through its UTC day; around midnight, also retain any prior-day
 * receipt that can still overlap the trailing rate window. */
export function beginPipelineFlowCycle(stateDir: string, startedAt: string, nowMs: number, cycleTimeoutMs: number): boolean {
  const started = timestampMs(startedAt)
  if (started === null || !Number.isFinite(nowMs) || !validTimeoutMs(cycleTimeoutMs)) return false
  return withPipelineFlowGapMutation(stateDir, () => {
    const prior = readPipelineFlowGapFile(stateDir)
    if (prior.status === 'unreadable') return false
    const rateFloor = nowMs - PIPELINE_FLOW_WINDOW_MS - maximumCycleDurationMs(cycleTimeoutMs, true)
    const todayFloor = Date.parse(`${isoDay(nowMs)}T00:00:00Z`)
    const floor = Math.min(rateFloor, todayFloor)
    const starts = (prior.status === 'ok' ? prior.starts : [])
      .filter((value) => (timestampMs(value) ?? -Infinity) >= floor)
    if (!starts.includes(startedAt)) starts.push(startedAt)
    return starts.length <= 512 && writePipelineFlowGapFile(stateDir, starts)
  })
}

/** Clear a start receipt only after its cycle summary is fsynced. Failure leaves a conservative gap. */
export function completePipelineFlowCycle(stateDir: string, startedAt: string): boolean {
  return withPipelineFlowGapMutation(stateDir, () => {
    const prior = readPipelineFlowGapFile(stateDir)
    if (prior.status !== 'ok' || !prior.starts.includes(startedAt)) return false
    return writePipelineFlowGapFile(stateDir, prior.starts.filter((value) => value !== startedAt))
  })
}

/** Count unique fetched IDs that were not already resident in the saved backlog. */
export function countUniqueNewArrivals(delivered: readonly EventIdentity[], backlog: readonly EventIdentity[]): number {
  if (delivered.length === 0) return 0
  const resident = new Set<string>()
  for (const item of backlog) {
    if (typeof item.event_id === 'string' && item.event_id) resident.add(item.event_id)
  }
  const arrivals = new Set<string>()
  for (const item of delivered) {
    const id = typeof item.event_id === 'string' ? item.event_id : ''
    if (id && !resident.has(id)) arrivals.add(id)
  }
  return arrivals.size
}

function queueCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null
}

/**
 * Read genuinely NEW queue arrivals from one summary.
 *
 * `fresh` cannot answer this: a source redelivery of an item already in the deferred backlog travels through
 * runCycle's fresh pool so it can preserve priority and residence time. New summaries therefore emit the
 * backlog-partitioned `new_arrivals`. For legacy rows only an empty candidate queue proves zero arrivals;
 * every non-empty legacy row is unknown rather than a falsely reassuring underestimate.
 */
export function cycleNewArrivalItems(cycle: CycleSummary): number | null {
  const arrivals = queueCount(cycle.new_arrivals)
  if (arrivals !== null) return arrivals
  return queueCount(cycle.candidates) === 0 ? 0 : null
}

/** One scored queue item ends in exactly one of these three bands. Loss/defer counters are not scanning. */
export function cycleScannedItems(cycle: CycleSummary): number | null {
  if (cycle.feed_commit_version !== 1) return null
  const picked = queueCount(cycle.picked)
  const watched = queueCount(cycle.watched)
  const dropped = queueCount(cycle.dropped)
  return picked === null || watched === null || dropped === null ? null : picked + watched + dropped
}

function timestampMs(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const at = Date.parse(value)
  return Number.isFinite(at) ? at : null
}

function validTimeoutMs(cycleTimeoutMs: number): boolean {
  return Number.isFinite(cycleTimeoutMs) && cycleTimeoutMs >= 0
}

function maximumCycleDurationMs(cycleTimeoutMs: number, aborted: boolean): number {
  return cycleTimeoutMs + (aborted ? PIPELINE_FLOW_ABORT_SETTLEMENT_MS : 0)
}

/**
 * Strict result placement for rate math.
 *
 * A cycle cannot finish before it starts. An ordinary cycle cannot finish after the scheduler's wall-clock
 * guard; an explicitly aborted cycle gets only the bounded journal/publish settlement interval above. Legacy
 * summaries that predate `completed_at` completed at their only recorded timestamp. Operational diagnostics
 * use the more tolerant helper below so a damaged completion field cannot erase loss/provider evidence.
 */
export function cycleCompletionMs(cycle: CycleSummary, cycleTimeoutMs: number): number | null {
  if (!validTimeoutMs(cycleTimeoutMs)) return null
  const started = timestampMs(cycle.ts)
  if (started === null) return null
  if (cycle.completed_at === undefined) return started
  const completed = timestampMs(cycle.completed_at)
  const latestAllowed = started + maximumCycleDurationMs(cycleTimeoutMs, cycle.aborted === true)
  if (completed === null || completed < started || completed > latestAllowed) return null
  return completed
}

/** Select operational "Last look" truth without letting a bad additive completion field delete the row. */
export function cycleDiagnosticMs(cycle: CycleSummary, cycleTimeoutMs: number): number | null {
  const started = timestampMs(cycle.ts)
  if (started === null) return null
  return cycleCompletionMs(cycle, cycleTimeoutMs) ?? started
}

export function latestPipelineCycle(cycles: readonly CycleSummary[], cycleTimeoutMs: number): CycleSummary | null {
  let latest: CycleSummary | null = null
  let latestAt = -Infinity
  for (const cycle of cycles) {
    const at = cycleDiagnosticMs(cycle, cycleTimeoutMs)
    if (at !== null && at >= latestAt) { latest = cycle; latestAt = at }
  }
  return latest
}

function isoDay(at: number): string { return new Date(at).toISOString().slice(0, 10) }

export function requiredPipelineFlowDates(nowMs: number, cycleTimeoutMs: number): string[] {
  if (!Number.isFinite(nowMs) || !validTimeoutMs(cycleTimeoutMs)) return []
  // Summaries are partitioned by START but placed in the rate by COMPLETION. The earliest start that could
  // still finish inside the trailing hour is therefore window-start minus the configured cycle guard and
  // the bounded post-abort settlement interval. We do not know whether a row aborted until its partition is
  // read, so coverage must use the longest valid duration and may not silently omit that start-day partition.
  const earliestStart = nowMs - PIPELINE_FLOW_WINDOW_MS - maximumCycleDurationMs(cycleTimeoutMs, true)
  const firstDay = Date.parse(`${isoDay(earliestStart)}T00:00:00Z`)
  const lastDay = Date.parse(`${isoDay(nowMs)}T00:00:00Z`)
  const dates: string[] = []
  for (let day = firstDay; day <= lastDay; day += UTC_DAY_MS) dates.push(isoDay(day))
  return dates
}

function potentiallyWindowRelevant(cycle: CycleSummary, fromMs: number, nowMs: number, cycleTimeoutMs: number): boolean {
  const started = timestampMs(cycle.ts)
  if (started !== null) {
    const latestAllowed = started + maximumCycleDurationMs(cycleTimeoutMs, cycle.aborted === true)
    return started <= nowMs && latestAllowed >= fromMs
  }
  const completed = timestampMs(cycle.completed_at)
  return completed === null || (completed >= fromMs && completed <= nowMs)
}

function malformedSummaryPotentiallyRelevant(text: string, fromMs: number, nowMs: number, cycleTimeoutMs: number): boolean {
  const match = text.match(/"ts"\s*:\s*"([^"]+)"/)
  const started = timestampMs(match?.[1])
  // The row cannot be parsed well enough to trust its `aborted` bit, so use the longest valid duration.
  return started === null || (started <= nowMs && started + maximumCycleDurationMs(cycleTimeoutMs, true) >= fromMs)
}

function readPartition(repoRoot: string, archiveDir: string, date: string): { status: 'read'; texts: string[] } | { status: 'missing' | 'unreadable' } {
  let files: ReturnType<typeof resolvedFirehoseFiles>
  try { files = resolvedFirehoseFiles(repoRoot, date, archiveDir) }
  catch { return { status: 'unreadable' } }
  if (!files.length) return { status: 'missing' }
  if (!contiguousFirehoseFiles(files)) return { status: 'unreadable' }
  const texts: string[] = []
  for (const row of files) {
    try { texts.push(fs.readFileSync(row.file, 'utf8')) }
    catch { return { status: 'unreadable' } }
  }
  return { status: 'read', texts }
}

function durableSummaryStarts(
  repoRoot: string,
  archiveDir: string,
  date: string,
): { status: 'read'; starts: Set<number>; ambiguous: Set<number> } | { status: 'missing' | 'unreadable' } {
  const partition = readPartition(repoRoot, archiveDir, date)
  if (partition.status !== 'read') return partition
  const starts = new Set<number>()
  const ambiguous = new Set<number>()
  for (const partitionText of partition.texts) {
    for (const line of partitionText.split('\n')) {
      const text = line.trim()
      if (!text || !/"kind"\s*:\s*"cycle/.test(text)) continue
      try {
        const row = JSON.parse(text)
        if (row?.kind !== 'cycle_summary') continue
        const started = timestampMs(row.ts)
        if (started === null) continue
        if (row.feed_commit_version === 1) starts.add(started)
        else ambiguous.add(started)
      } catch {
        const match = text.match(/"ts"\s*:\s*"([^"]+)"/)
        const started = timestampMs(match?.[1])
        if (started !== null) ambiguous.add(started)
      }
    }
  }
  return { status: 'read', starts, ambiguous }
}

/**
 * Convert stale start receipts into permanent interruption incidents.
 *
 * The append-only audit lands and fsyncs first. Only then is the compact active-incident marker cleared.
 * A crash between those writes is idempotent: the next pass finds the deterministic cycle ID in the audit
 * and clears the marker without appending a duplicate. A matching durable summary clears a false marker;
 * unreadable or ambiguous evidence remains active and visible for manual storage repair.
 */
export function reconcilePipelineFlowGaps(
  repoRoot: string,
  archiveDir: string,
  stateDir: string,
  nowMs: number,
  cycleTimeoutMs: number,
): boolean {
  if (!Number.isFinite(nowMs) || nowMs < 0 || nowMs > 8.64e15 || !validTimeoutMs(cycleTimeoutMs)) return false
  return withPipelineFlowGapMutation(stateDir, () => {
    const prior = readPipelineFlowGapFile(stateDir)
    if (prior.status !== 'ok') return prior.status === 'missing'
    if (!prior.starts.length) return true

    const byDate = new Map<string, ReturnType<typeof durableSummaryStarts>>()
    const summaryFor = (date: string) => {
      const known = byDate.get(date)
      if (known) return known
      const read = durableSummaryStarts(repoRoot, archiveDir, date)
      byDate.set(date, read)
      return read
    }
    const stale = prior.starts.filter((value) => {
      const started = timestampMs(value)
      return started !== null && started + maximumCycleDurationMs(cycleTimeoutMs, true) < nowMs
    })
    const earliestStale = stale.reduce((min, value) => Math.min(min, timestampMs(value) ?? min), Infinity)
    const existingAudit = Number.isFinite(earliestStale)
      ? readCycleInterruptionAudit(repoRoot, archiveDir, earliestStale, nowMs + 1)
      : { events: [], readable: true, corruptRows: 0, unreadableDays: [], truncated: false }
    const recorded = new Set(existingAudit.events.map((event) => event.cycleId))
    const retained: string[] = []
    let changed = false
    let unresolved = !existingAudit.readable && stale.length > 0
    const detectedAt = new Date(nowMs).toISOString()

    for (const startedAt of prior.starts) {
      const started = timestampMs(startedAt)
      if (started === null) { retained.push(startedAt); unresolved = true; continue }
      const summaries = summaryFor(isoDay(started))
      if (summaries.status === 'read' && summaries.starts.has(started)) {
        changed = true
        continue
      }
      if (started + maximumCycleDurationMs(cycleTimeoutMs, true) >= nowMs) {
        retained.push(startedAt)
        continue
      }
      if (summaries.status === 'unreadable'
        || (summaries.status === 'read' && summaries.ambiguous.has(started))
        || !existingAudit.readable) {
        retained.push(startedAt)
        unresolved = true
        continue
      }
      const cycleId = deterministicCycleId(startedAt)
      if (!recorded.has(cycleId)) {
        if (!recordCycleInterruption(repoRoot, {
          kind: 'cycle_interruption',
          ts: detectedAt,
          cycleId,
          startedAt,
          reason: 'missing-summary-after-timeout',
        })) {
          retained.push(startedAt)
          unresolved = true
          continue
        }
        recorded.add(cycleId)
      }
      changed = true
    }

    if (changed && !writePipelineFlowGapFile(stateDir, retained)) return false
    return !unresolved
  })
}

// The diagnostics endpoint polls every 10 seconds. Retain exactly one operational row per storage target so
// a quiet period does not repeatedly reread an item-heavy old partition; a process that starts during an
// outage discovers the same row once from disk below.
const HISTORICAL_CYCLE_RESCAN_MS = 60_000
interface LatestCycleCacheEntry { cycle: CycleSummary | null; checkedAtMs: number }
const latestCycleCache = new Map<string, LatestCycleCacheEntry>()

function cycleCacheKey(repoRoot: string, archiveDir: string): string {
  return `${path.resolve(repoRoot)}\u0000${archiveDir ? path.resolve(archiveDir) : ''}`
}

function availablePartitionDates(repoRoot: string, archiveDir: string, throughDate: string): string[] {
  const dates = new Set<string>()
  const dirs = [...new Set([
    path.join(repoRoot, 'screener', 'inbox'),
    ...(archiveDir ? [archiveDir] : []),
  ].map((dir) => path.resolve(dir)))]
  for (const dir of dirs) {
    let names: string[]
    try { names = fs.readdirSync(dir) }
    catch { continue }
    for (const name of names) {
      const match = parseFirehoseName(name)
      if (!match || match.date > throughDate) continue
      const at = Date.parse(`${match.date}T00:00:00Z`)
      if (Number.isFinite(at) && isoDay(at) === match.date) dates.add(match.date)
    }
  }
  return [...dates].sort().reverse()
}

function latestCycleInPartition(repoRoot: string, archiveDir: string, date: string, cycleTimeoutMs: number): CycleSummary | null {
  const partition = readPartition(repoRoot, archiveDir, date)
  if (partition.status !== 'read') return null
  const cycles: CycleSummary[] = []
  for (const partitionText of partition.texts) {
    for (const line of partitionText.split('\n')) {
      const text = line.trim()
      if (!text || !/"kind"\s*:\s*"cycle_summary"/.test(text)) continue
      try {
        const row = JSON.parse(text)
        if (row?.kind === 'cycle_summary') cycles.push(row as CycleSummary)
      } catch { /* Last look is best-effort; rate coverage accounts for relevant corruption separately. */ }
    }
  }
  return latestPipelineCycle(cycles, cycleTimeoutMs)
}

function resolveLatestCycle(
  repoRoot: string,
  archiveDir: string,
  requiredDates: readonly string[],
  cycles: readonly CycleSummary[],
  nowMs: number,
  cycleTimeoutMs: number,
): CycleSummary | null {
  const key = cycleCacheKey(repoRoot, archiveDir)
  const cached = latestCycleCache.get(key)
  const cachedCycle = cached?.cycle ?? null
  const current = latestPipelineCycle(cycles, cycleTimeoutMs)
  let latest = latestPipelineCycle([...(cachedCycle ? [cachedCycle] : []), ...(current ? [current] : [])], cycleTimeoutMs)

  // A normal poll finds the newest row in the already-required partitions. Only a cold process with no such
  // row walks older partition names, newest first. Cache an empty search briefly too, otherwise a brand-new
  // install with item-only archives would reread every old partition on every 10-second panel poll.
  const historicalSearchDue = !cached
    || nowMs < cached.checkedAtMs
    || nowMs - cached.checkedAtMs >= HISTORICAL_CYCLE_RESCAN_MS
  let searchedHistory = false
  if (!latest && Number.isFinite(nowMs) && historicalSearchDue) {
    searchedHistory = true
    const required = new Set(requiredDates)
    for (const date of availablePartitionDates(repoRoot, archiveDir, isoDay(nowMs))) {
      if (required.has(date)) continue
      latest = latestCycleInPartition(repoRoot, archiveDir, date, cycleTimeoutMs)
      if (latest) break
    }
  }
  if (latest || searchedHistory || current) latestCycleCache.set(key, { cycle: latest, checkedAtMs: nowMs })
  return latest
}

/**
 * Read only cycle-summary lines from the start-date partitions that can own a trailing-hour completion.
 *
 * Unlike `readFeed`, this never hydrates/ranks/deduplicates thousands of item rows on the panel's 10-second
 * poll. Local storage wins; `NEWS.newsArchiveDir` is the fallback supplied by the caller. Every parseable
 * summary is preserved for operational/day diagnostics. Rate validity is applied separately below.
 */
export function readPipelineFlowCycles(
  repoRoot: string,
  archiveDir: string,
  nowMs: number,
  cycleTimeoutMs: number,
  stateDir = '',
): PipelineFlowCycleRead {
  const requiredDates = requiredPipelineFlowDates(nowMs, cycleTimeoutMs)
  const fromMs = nowMs - PIPELINE_FLOW_WINDOW_MS
  const readDates: string[] = []
  const missingDates: string[] = []
  const unreadableDates: string[] = []
  const cycles: CycleSummary[] = []
  let corruptCycleRows = 0
  let incompleteCycles = 0
  let recordedInterruptions = 0
  let todayIncompleteCycles = 0
  let todayRecordedInterruptions = 0
  let gapMarkerUnreadable = false
  let gapMarkerMissing = false
  let interruptionAuditUnreadable = false
  let todayCorruptCycleRows = 0
  const today = Number.isFinite(nowMs) ? isoDay(nowMs) : ''
  const activeCycleIds = new Set<string>()

  if (stateDir) {
    const gaps = readPipelineFlowGapFile(stateDir)
    gapMarkerUnreadable = gaps.status === 'unreadable'
    gapMarkerMissing = gaps.status === 'missing'
    if (gaps.status === 'ok') {
      for (const value of gaps.starts) {
        const started = timestampMs(value)
        if (started === null) {
          incompleteCycles++
          continue
        }
        activeCycleIds.add(deterministicCycleId(value))
        if (started <= nowMs && started + maximumCycleDurationMs(cycleTimeoutMs, true) >= fromMs) incompleteCycles++
        if (started <= nowMs && today && isoDay(started) === today) todayIncompleteCycles++
      }
    }
  }

  if (Number.isFinite(nowMs) && validTimeoutMs(cycleTimeoutMs)) {
    const todayStart = today ? Date.parse(`${today}T00:00:00Z`) : nowMs
    const auditFrom = Math.min(todayStart, fromMs - maximumCycleDurationMs(cycleTimeoutMs, true))
    const audit = readCycleInterruptionAudit(repoRoot, archiveDir, auditFrom, nowMs + 1)
    interruptionAuditUnreadable = !audit.readable
    for (const event of audit.events) {
      if (activeCycleIds.has(event.cycleId)) continue
      const started = timestampMs(event.startedAt)
      if (started === null || started > nowMs) continue
      if (started + maximumCycleDurationMs(cycleTimeoutMs, true) >= fromMs) recordedInterruptions++
      if (today && isoDay(started) === today) todayRecordedInterruptions++
    }
  }

  for (const date of requiredDates) {
    const partition = readPartition(repoRoot, archiveDir, date)
    if (partition.status === 'missing') { missingDates.push(date); continue }
    if (partition.status === 'unreadable') { unreadableDates.push(date); continue }
    if (partition.status !== 'read') continue
    readDates.push(date)
    for (const partitionText of partition.texts) {
      for (const line of partitionText.split('\n')) {
        const text = line.trim()
        // Item rows dominate the file. Avoid even JSON.parse for them; no item hydration is needed here.
        // Match the prefix too: a torn `"cycle_summ...` record is missing flow authority, not an item row that
        // can be skipped. Valid non-summary `cycle_*` records still parse and are ignored by the kind check.
        if (!text || !/"kind"\s*:\s*"cycle/.test(text)) continue
        try {
          const row = JSON.parse(text)
          if (row?.kind !== 'cycle_summary') continue
          // Preserve it even if its completion field is bad: loss/provider/Last-look diagnostics still need
          // every other parseable field. buildPipelineFlowRates applies strict chronology only to rate math.
          cycles.push(row as CycleSummary)
        } catch {
          if (date === today) todayCorruptCycleRows++
          if (malformedSummaryPotentiallyRelevant(text, fromMs, nowMs, cycleTimeoutMs)) corruptCycleRows++
        }
      }
    }
  }

  // This file is introduced in the same deploy as feed_commit_version=1 and successful completion keeps an
  // empty file rather than deleting it. Therefore ENOENT is a safe first-boot state only while no v1 summary
  // exists. Once a v1 receipt exists, a missing file means the completion authority was lost; treating it as
  // an empty gap set could hide a crashed high-inflow/low-scan cycle and manufacture headroom.
  if (stateDir && gapMarkerMissing && cycles.some((cycle) => cycle.feed_commit_version === 1)) {
    gapMarkerUnreadable = true
  }
  const todayHistoryStatus: NonNullable<PipelineFlowHistory['todayHistoryStatus']> = !today
    ? 'unreadable'
    : unreadableDates.includes(today)
      ? 'unreadable'
      : missingDates.includes(today)
        ? 'missing'
        : 'complete'
  const todayTotalsLowerBound = todayIncompleteCycles > 0
    || todayRecordedInterruptions > 0
    || gapMarkerUnreadable
    || interruptionAuditUnreadable
    || todayHistoryStatus !== 'complete'
    || todayCorruptCycleRows > 0

  const allDatesRead = readDates.length === requiredDates.length
  const coverage: PipelineFlowCoverage = allDatesRead && corruptCycleRows === 0
    && incompleteCycles === 0 && recordedInterruptions === 0
    && !gapMarkerUnreadable && !interruptionAuditUnreadable
    ? 'complete'
    : readDates.length > 0 ? 'partial' : 'none'
  return {
    cycles,
    history: {
      coverage, requiredDates, readDates, missingDates, unreadableDates, corruptCycleRows,
      ...(incompleteCycles ? { incompleteCycles } : {}),
      ...(recordedInterruptions ? { recordedInterruptions } : {}),
      todayIncompleteCycles,
      todayRecordedInterruptions,
      todayTotalsLowerBound,
      todayHistoryStatus,
      ...(todayCorruptCycleRows ? { todayCorruptCycleRows } : {}),
      ...(gapMarkerUnreadable ? { gapMarkerUnreadable: true } : {}),
      ...(interruptionAuditUnreadable ? { interruptionAuditUnreadable: true } : {}),
    },
    latestCycle: resolveLatestCycle(repoRoot, archiveDir, requiredDates, cycles, nowMs, cycleTimeoutMs),
  }
}

function completeHistory(nowMs: number, cycleTimeoutMs: number): PipelineFlowHistory {
  const requiredDates = requiredPipelineFlowDates(nowMs, cycleTimeoutMs)
  return { coverage: 'complete', requiredDates, readDates: requiredDates, missingDates: [], unreadableDates: [], corruptCycleRows: 0 }
}

function historyCoverage(history: PipelineFlowHistory, corruptCycleRows = history.corruptCycleRows): PipelineFlowCoverage {
  const read = new Set(history.readDates)
  const everyRequiredDateRead = history.requiredDates.every((date) => read.has(date))
  if (everyRequiredDateRead && history.missingDates.length === 0 && history.unreadableDates.length === 0
    && corruptCycleRows === 0 && (history.incompleteCycles ?? 0) === 0
    && (history.recordedInterruptions ?? 0) === 0
    && history.gapMarkerUnreadable !== true && history.interruptionAuditUnreadable !== true) return 'complete'
  return history.readDates.length > 0 ? 'partial' : 'none'
}

function measure(values: Array<number | null>, totalCycles: number, historyCoverage: PipelineFlowCoverage): PipelineFlowMeasure {
  const known = values.filter((value): value is number => value !== null)
  const knownCycles = known.length
  const fieldCoverage: PipelineFlowCoverage = totalCycles === 0 ? 'none' : knownCycles === totalCycles ? 'complete' : knownCycles > 0 ? 'partial' : 'none'
  const coverage: PipelineFlowCoverage = historyCoverage === 'complete'
    ? fieldCoverage
    : historyCoverage === 'partial' || fieldCoverage === 'partial' || fieldCoverage === 'complete' ? 'partial' : 'none'
  const measured = totalCycles > 0 && historyCoverage === 'complete' && fieldCoverage === 'complete'
  const items = measured ? known.reduce((sum, value) => sum + value, 0) : null
  return {
    items,
    perSecond: items === null ? null : items / PIPELINE_FLOW_WINDOW_SECONDS,
    measured,
    coverage,
    knownCycles,
    totalCycles,
  }
}

/**
 * Build like-for-like queue flow over a fixed trailing 60-minute wall-clock window.
 *
 * Cycle completion time determines placement; legacy rows without it fall back to `ts`. A comparison is
 * published only when required partition history and every in-window queue unit are complete.
 */
export function buildPipelineFlowRates(
  cycles: readonly CycleSummary[],
  nowMs: number,
  cycleTimeoutMs: number,
  history: PipelineFlowHistory = completeHistory(nowMs, cycleTimeoutMs),
): PipelineFlowRates {
  const safeNow = Number.isFinite(nowMs) ? nowMs : Date.now()
  const fromMs = safeNow - PIPELINE_FLOW_WINDOW_MS
  const inWindow: CycleSummary[] = []
  let invalidRelevantCycles = 0
  for (const cycle of cycles) {
    const at = cycleCompletionMs(cycle, cycleTimeoutMs)
    if (at === null) {
      if (potentiallyWindowRelevant(cycle, fromMs, safeNow, cycleTimeoutMs)) invalidRelevantCycles++
      continue
    }
    if (at >= fromMs && at <= safeNow) inWindow.push(cycle)
  }

  // Reader corruption and parseable-but-impossible chronology are separate debts. Only rows whose allowed
  // start→completion interval overlaps this window count; an old damaged row cannot black out live rates.
  const corruptCycleRows = history.corruptCycleRows + invalidRelevantCycles
  const resolvedHistory: PipelineFlowHistory = {
    ...history,
    corruptCycleRows,
    coverage: historyCoverage(history, corruptCycleRows),
  }

  const inflow = measure(inWindow.map(cycleNewArrivalItems), inWindow.length, resolvedHistory.coverage)
  const scanning = measure(inWindow.map(cycleScannedItems), inWindow.length, resolvedHistory.coverage)
  const comparisonMeasured = inflow.measured && scanning.measured
  const gap = comparisonMeasured && inflow.items !== null && scanning.items !== null
    ? scanning.items - inflow.items
    : null
  const status: PipelineFlowComparisonStatus = gap === null ? 'unavailable' : gap > 0 ? 'ahead' : gap < 0 ? 'behind' : 'equal'

  return {
    windowMinutes: PIPELINE_FLOW_WINDOW_MINUTES,
    from: new Date(fromMs).toISOString(),
    to: new Date(safeNow).toISOString(),
    history: resolvedHistory,
    inflow,
    scanning,
    comparison: {
      measured: comparisonMeasured,
      status,
      // The window is exactly one hour, so the integer item gap is also the items/hour gap.
      scanningMinusInflowItemsPerHour: gap,
    },
  }
}
