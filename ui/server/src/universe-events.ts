import { MODEL_SIGNALS, type EventCoverage, type ModelEvent, type ModelRow, type ModelSignals } from '../../shared/universe-model'
import { listFirehoseDates, readDayItems } from './news/feed'
import { coreCompanyName, normTicker } from './news/symbology'
import { deriveSourceTier } from './news/scope'
import type { FeedItem } from './news/types'
import { runDiscoveryInWorker } from './news/ideas/ideas-worker'

export type UniverseEventIndex = { coverage: EventCoverage; companies: Record<string, ModelSignals> }
export const universeCompanyKey = (ticker: string, company: string) => `${normTicker(ticker)}|${coreCompanyName(company)}`

/** Uses existing triage tags, never another LLM, paid lookup or new headline classifier. The index is
 * an archive observation, not proof of a still-pending catalyst or a verified trading opportunity. */
export function addUniverseEvent(index: UniverseEventIndex, item: FeedItem): void {
  const time = Date.parse(item.found_at)
  if (!Number.isFinite(time) || time < Date.parse(index.coverage.from) || time > Date.parse(index.coverage.to)) return
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
        reports.splice(3) // One point per event category, with up to three recent source links.
      }
    }
  }
}

// Exported through the existing discovery worker: the 90-day walk never blocks Fastify's event loop.
export function readUniverseEvents(root: string, archiveDir: string, nowISO: string): UniverseEventIndex {
  const now = Date.parse(nowISO)
  const from = new Date(now - 90 * 86_400_000).toISOString()
  const index: UniverseEventIndex = { coverage: { checked_at: nowISO, from, to: nowISO, archive_days: 0,
    reports_scanned: 0, latest_report_at: null, refreshing: false, error: null }, companies: {} }
  for (const date of listFirehoseDates(root, archiveDir)) {
    if (date < from.slice(0, 10) || date > nowISO.slice(0, 10)) continue
    index.coverage.archive_days++
    for (const item of readDayItems(root, date, archiveDir).items) addUniverseEvent(index, item)
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
