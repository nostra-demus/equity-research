import { MODEL_SIGNALS, type EventCoverage, type ModelEvent, type ModelRow, type ModelSignals } from '../../shared/universe-model'
import { firehoseStamp, listFirehoseDates, scanDayItems } from './news/feed'
import { coreCompanyName, normTicker } from './news/symbology'
import { deriveSourceTier } from './news/scope'
import type { FeedItem } from './news/types'
import { runDiscoveryInWorker } from './news/ideas/ideas-worker'

export type UniverseEventIndex = { coverage: EventCoverage; companies: Record<string, ModelSignals> }
export const universeCompanyKey = (ticker: string, company: string) => `${normTicker(ticker)}|${coreCompanyName(company)}`
const timeBounds = new WeakMap<EventCoverage, { from: number; to: number }>()

/** Uses existing triage tags, never another LLM, paid lookup or new headline classifier. The index is
 * an archive observation, not proof of a still-pending catalyst or a verified trading opportunity. */
export function addUniverseEvent(index: UniverseEventIndex, item: FeedItem, evidenceLimit = 3, time = Date.parse(item.found_at)): void {
  let bounds = timeBounds.get(index.coverage)
  if (!bounds) { bounds = { from: Date.parse(index.coverage.from), to: Date.parse(index.coverage.to) }; timeBounds.set(index.coverage, bounds) }
  if (!Number.isFinite(time) || time < bounds.from || time > bounds.to) return
  index.coverage.reports_scanned++
  if (!index.coverage.latest_report_at || time > Date.parse(index.coverage.latest_report_at)) index.coverage.latest_report_at = item.found_at
  if (item.relevance !== 'material' || (!['high', 'critical'].includes(item.event_materiality_label || '') && (item.materiality_pre_score ?? 0) < 70)
    || !['primary', 'secondary'].includes(item.issuer_linkage) || item.event_types?.includes('rumor') || !/^https?:\/\//i.test(item.url || '')) return
  const tier = item.source_tier || deriveSourceTier(item)
  if (tier === 'social' || tier === 'unconfirmed') return
  const signals = MODEL_SIGNALS.filter((signal) => signal.types.some((tag) => item.event_types?.includes(tag)))
  if (!signals.length) return
  const event: ModelEvent = { id: item.dedup_group || item.event_id, headline: item.headline_en || item.headline,
    url: item.url, source: item.source_name, reported_at: item.found_at, source_tier: tier,
    direction: item.event_direction || 'unknown' }
  for (const company of item.companies || []) {
    // Headline tags are inferred. Require BOTH exact ticker and normalized company name when joining
    // Finviz; never borrow an event from an identically named symbol on a foreign exchange.
    if (!company.ticker || !coreCompanyName(company.name) || (company.listing_country && company.listing_country !== 'US')) continue
    const key = universeCompanyKey(company.ticker, company.name)
    const target = index.companies[key] ??= {}
    for (const signal of signals) {
      const reports = target[signal.id] ??= []
      if (!reports.some((r) => r.id === event.id || r.url === event.url)) {
        reports.push(event)
        reports.sort((a, b) => b.reported_at.localeCompare(a.reported_at))
        if (Number.isFinite(evidenceLimit)) reports.splice(evidenceLimit)
      }
    }
  }
}

// Exported through the existing discovery worker: the 90-day walk never blocks Fastify's event loop.
const days = new Map<string, { stamp: string; index: UniverseEventIndex; times: number[] }>()
function lowerBound(values: number[], target: number): number {
  let lo = 0; let hi = values.length
  while (lo < hi) { const mid = (lo + hi) >>> 1; if (values[mid] < target) lo = mid + 1; else hi = mid }
  return lo
}
export async function readUniverseEvents(root: string, archiveDir: string, nowISO: string, io = {
  dates: listFirehoseDates, stamp: firehoseStamp, scan: scanDayItems,
}): Promise<UniverseEventIndex> {
  const now = Date.parse(nowISO)
  const fromMs = now - 90 * 86_400_000
  const from = new Date(fromMs).toISOString()
  const index: UniverseEventIndex = { coverage: { checked_at: nowISO, from, to: nowISO, archive_days: 0,
    reports_scanned: 0, latest_report_at: null, refreshing: false, error: null }, companies: {} }
  for (const date of io.dates(root, archiveDir)) {
    if (date < from.slice(0, 10) || date > nowISO.slice(0, 10)) continue
    const stamp = io.stamp(root, date, archiveDir)
    if (!stamp) throw new Error(`Event archive could not be read for ${date}.`)
    const key = JSON.stringify([root, archiveDir, date])
    const cached = days.get(key)
    let day = cached?.stamp === stamp ? cached.index : null
    let times = cached?.stamp === stamp ? cached.times : []
    if (!day) {
      // Partitions are INGESTION days. Cache source observations across midnight, and retain future
      // timestamps for filtering at read time; neither clock may be frozen to the initial scan.
      day = { coverage: { ...index.coverage, to: '9999-12-31T23:59:59.999Z', reports_scanned: 0, latest_report_at: null }, companies: {} }
      const scan = io.scan(root, date, archiveDir, { strict: true }, (item) => {
        const time = Date.parse(item.found_at); if (Number.isFinite(time)) times.push(time)
        addUniverseEvent(day!, item, Infinity, time); return true
      })
      if (scan.status !== 'read' || !scan.complete) throw new Error(`Event archive is incomplete for ${date}.`)
      times.sort((a, b) => a - b)
      // Cache compact per-company evidence, never all hydrated reports. Only changing partitions reparse.
      if (io.stamp(root, date, archiveDir) === stamp) days.set(key, { stamp, index: day, times })
      while (days.size > 180) days.delete(days.keys().next().value!)
    }
    index.coverage.archive_days++
    const start = lowerBound(times, fromMs); const end = lowerBound(times, now + 1)
    index.coverage.reports_scanned += end - start
    const latest = end > start ? new Date(times[end - 1]).toISOString() : null
    if (latest && (!index.coverage.latest_report_at || latest > index.coverage.latest_report_at)) index.coverage.latest_report_at = latest
    for (const [company, signals] of Object.entries(day.companies)) {
      const target = index.companies[company] ??= {}
      for (const signal of MODEL_SIGNALS) {
        for (const report of signals[signal.id] || []) {
          const reportedAt = Date.parse(report.reported_at)
          if (reportedAt < fromMs || reportedAt > now) continue
          const reports = target[signal.id] ??= []
          if (!reports.some((r) => r.id === report.id || r.url === report.url)) reports.push(report)
          reports.sort((a, b) => b.reported_at.localeCompare(a.reported_at)); reports.splice(3)
        }
      }
    }
    // Other archive operations can run between dates during the first cold build.
    await new Promise(setImmediate)
  }
  return index
}

export function createUniverseEventsReader(root: string, archiveDir: string,
  readIndex = (at: string) => runDiscoveryInWorker<UniverseEventIndex>('readUniverseEvents', [root, archiveDir, at])) {
  let index: UniverseEventIndex | null = null
  let pending: Promise<void> | null = null
  let checkedAt = 0
  let error: string | null = null
  return (rows: ModelRow[], now = Date.now()): { rows: ModelRow[]; events: EventCoverage | null } => {
    if (!pending && now - checkedAt >= 60_000) {
      checkedAt = now
      pending = readIndex(new Date(now).toISOString()).then((value) => { index = value; error = null })
        .catch(() => { error = 'The event archive could not be read. Event signals are unavailable; retrying in one minute.' })
        .finally(() => { pending = null })
    }
    const coverage: EventCoverage = { checked_at: index?.coverage.checked_at || new Date(now).toISOString(),
      from: new Date(now - 90 * 86_400_000).toISOString(), to: new Date(now).toISOString(), archive_days: 0,
      reports_scanned: 0, latest_report_at: null, ...index?.coverage, refreshing: !!pending, error }
    // No archive, stale ingestion (>48h), failed read or expired snapshot cannot prove a negative.
    const available = !!index && !error && now - Date.parse(index.coverage.checked_at) < 5 * 60_000
      && !!index.coverage.latest_report_at && now - Date.parse(index.coverage.latest_report_at) < 48 * 60 * 60_000
    return { events: coverage, rows: rows.map((row) => ({ ...row,
      signals: available ? index!.companies[universeCompanyKey(row.ticker, row.company)] || {} : null })) }
  }
}
