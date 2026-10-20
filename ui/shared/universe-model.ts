import { isFinvizData, type FinvizData } from './finviz-data'
// Free Finviz screen; the saved preset is account-local, so the public filters are explicit.
export const UNIVERSE_URL = 'https://finviz.com/screener/stocks?f=cap_midover%2Csh_avgvol_o50&preset=s154730211'
export const MODEL_SCHEMA = 'universe-event-model/v1' as const
export const MODEL_REFRESH_MS = 5 * 60_000
export const MODEL_SIGNALS = [
  { id: 'results', label: 'Results', rule: 'Material earnings, revenue or margin results', types: ['earnings_revenue_margin'] },
  { id: 'guidance', label: 'Guidance', rule: 'Material guidance or business outlook change', types: ['guidance_change'] },
  { id: 'contracts', label: 'Contracts / JVs', rule: 'Material commercial win, loss, partnership or agreement', types: ['commercial'] },
  { id: 'capacity', label: 'Capacity / capex', rule: 'Material capacity expansion, capex or commissioning', types: ['capex'] },
  { id: 'product', label: 'Products / approvals', rule: 'Material product launch or approval', types: ['product'] },
  { id: 'operations', label: 'Operations / disruption', rule: 'Material operating disruption, quality or cyber event', types: ['operations', 'cybersecurity'] },
  { id: 'deals', label: 'Deals / restructuring', rule: 'Material acquisition, disposal, merger, strategic review or restructuring', types: ['mna', 'strategic_review', 'restructuring_layoffs'] },
  { id: 'capital', label: 'Capital / returns', rule: 'Material capital raise, dilution, buyback or payout change', types: ['capital_actions', 'dividend_cut'] },
  { id: 'credit', label: 'Debt / distress', rule: 'Material borrowing, rating action, default or insolvency', types: ['debt_credit', 'credit_rating_downgrade', 'credit_rating_upgrade', 'default_distress'] },
  { id: 'ownership', label: 'Ownership', rule: 'Material ownership, activist or insider transaction', types: ['ownership_activist', 'insider_transaction'] },
  { id: 'governance', label: 'Management / governance', rule: 'Material management, auditor or accounting change/red flag', types: ['management', 'executive_exit', 'accounting_restatement'] },
  { id: 'legal', label: 'Legal / regulatory', rule: 'Material legal, regulatory, enforcement or tax action', types: ['litigation_enforcement', 'regulatory'] },
] as const
export type ModelSignal = typeof MODEL_SIGNALS[number]
export type SignalId = ModelSignal['id']
export interface ModelEvent {
  id: string
  source_event_id?: string // exact article identity; id can instead be a deduplicated story group
  headline: string
  excerpt?: string
  classification_reason?: string
  url: string
  source: string
  reported_at: string
  direction: 'positive' | 'negative' | 'mixed' | 'neutral' | 'unknown'
  source_tier: string
  assessment?: ModelSavedAnalysis | null // Exact company/article read; absent or null never earns a tick.
}
export interface ModelSavedAnalysis {
  read_at: string
  story: string[]
  company_role: 'subject' | 'acquirer' | 'target' | 'forecaster' | 'mentioned' | null
  effects: { side: 'beneficiary' | 'exposed'; mechanism: string; magnitude: string | null; horizon: string | null }[]
  event_assessment: string | null
  watch_item: string | null
  provenance: { kind: 'original' | 'filing_doc' | 'alternate' | 'corroborated'; label: string | null; url: string | null }
}
export interface ModelEventRead {
  event_id: string
  ticker: string
  company: string
  analysis: ModelSavedAnalysis | null
}
export function isModelEventRead(value: unknown): value is ModelEventRead {
  const r = value as ModelEventRead | null
  if (!r || typeof r.event_id !== 'string' || typeof r.ticker !== 'string' || typeof r.company !== 'string') return false
  return r.analysis === null || isModelSavedAnalysis(r.analysis)
}
export function isModelSavedAnalysis(value: unknown): value is ModelSavedAnalysis {
  const a = value as ModelSavedAnalysis | null
  const text = (v: unknown) => v === null || typeof v === 'string'
  return !!a && typeof a.read_at === 'string' && Number.isFinite(Date.parse(a.read_at))
    && Array.isArray(a.story) && a.story.length <= 4 && a.story.every((s) => typeof s === 'string')
    && (a.company_role === null || ['subject', 'acquirer', 'target', 'forecaster', 'mentioned'].includes(a.company_role))
    && text(a.event_assessment) && text(a.watch_item)
    && Array.isArray(a.effects) && a.effects.length <= 4 && a.effects.every((e) => e && ['beneficiary', 'exposed'].includes(e.side)
      && typeof e.mechanism === 'string' && text(e.magnitude) && text(e.horizon))
    && !!a.provenance && ['original', 'filing_doc', 'alternate', 'corroborated'].includes(a.provenance.kind)
    && text(a.provenance.label) && (a.provenance.url === null || typeof a.provenance.url === 'string' && /^https?:\/\//i.test(a.provenance.url))
}
export type ModelSignals = Partial<Record<SignalId, ModelEvent[]>>
export interface EventCoverage {
  checked_at: string
  from: string
  to: string
  archive_days: number
  reports_scanned: number
  latest_report_at: string | null
  refreshing: boolean
  error: string | null
}
export interface ModelRow {
  ticker: string
  company: string
  price: number | null
  currency: 'USD'
  retrieved_at: string
  signals: ModelSignals | null
  finviz?: FinvizData // Durable collector data. The grid API omits it; the data API serves it on demand.
}
export interface ModelRead {
  schema_version: typeof MODEL_SCHEMA
  source_url: typeof UNIVERSE_URL
  rows: ModelRow[]
  total: number | null
  complete: boolean
  refreshing: boolean
  fetched: number
  started_at: string | null
  completed_at: string | null
  next_refresh_at: string | null
  stale: boolean
  error: string | null
  events: EventCoverage | null
  data?: { captured: number; expected: number; refreshing: boolean; error: string | null }
}
// Benefit/risk must belong to this issuer, not the headline. Mixed effects are not a favorable verdict.
export function companyImpact(analysis: ModelSavedAnalysis | null | undefined): boolean | null {
  if (!analysis?.effects?.length) return null
  return analysis.effects.some((effect) => effect.side === 'exposed') ? false
    : analysis.effects.some((effect) => effect.side === 'beneficiary') ? true : null
}
// Every retained report must support the benefit; a risk cannot be averaged away by another report.
export function signalResult(row: ModelRow, signal: ModelSignal): boolean | null {
  if (row.signals === null) return null
  const reports = row.signals[signal.id] || []
  if (!reports.length) return false
  const results = reports.map((event) => companyImpact(event.assessment))
  if (results.includes(false)) return false
  return results.every((result) => result === true) ? true : null
}
export function modelTotal(row: ModelRow): number | null {
  return row.signals === null ? null : MODEL_SIGNALS.filter((signal) => signalResult(row, signal) === true).length
}
export function rankModel(rows: ModelRow[]): ModelRow[] {
  return [...rows].sort((a, b) => Number(a.signals === null) - Number(b.signals === null)
    || (modelTotal(b) ?? 0) - (modelTotal(a) ?? 0) || a.company.localeCompare(b.company) || a.ticker.localeCompare(b.ticker))
}
export function isModelRead(value: unknown): value is ModelRead {
  const r = value as ModelRead | null
  return !!r && r.schema_version === MODEL_SCHEMA && r.source_url === UNIVERSE_URL
    && typeof r.complete === 'boolean' && typeof r.refreshing === 'boolean' && typeof r.stale === 'boolean'
    && Number.isInteger(r.fetched) && r.fetched >= 0
    && (r.total === null || (Number.isInteger(r.total) && r.total >= 0))
    && [r.started_at, r.completed_at, r.next_refresh_at].every((t) => t === null || (typeof t === 'string' && Number.isFinite(Date.parse(t))))
    && (r.error === null || typeof r.error === 'string')
    && Array.isArray(r.rows) && r.rows.every((row) => row && typeof row.ticker === 'string' && /^[A-Z0-9.^-]{1,20}$/.test(row.ticker)
      && typeof row.company === 'string' && !!row.company && row.currency === 'USD'
      && (row.price === null || (typeof row.price === 'number' && Number.isFinite(row.price) && row.price > 0))
      && typeof row.retrieved_at === 'string' && Number.isFinite(Date.parse(row.retrieved_at))
      && (row.finviz === undefined || isFinvizData(row.finviz, row.ticker, row.company))
      && (row.signals === null || (typeof row.signals === 'object' && !Array.isArray(row.signals)
        && Object.entries(row.signals).every(([key, events]) => MODEL_SIGNALS.some((s) => s.id === key) && Array.isArray(events) && events.length <= 3
          && events.every((event) => event && typeof event.id === 'string' && typeof event.headline === 'string'
            && [event.source_event_id, event.excerpt, event.classification_reason].every((s) => s === undefined || typeof s === 'string')
            && typeof event.url === 'string' && /^https?:\/\//i.test(event.url) && typeof event.source === 'string'
            && typeof event.reported_at === 'string' && Number.isFinite(Date.parse(event.reported_at))
            && ['positive', 'negative', 'mixed', 'neutral', 'unknown'].includes(event.direction) && typeof event.source_tier === 'string'
            && (event.assessment === undefined || event.assessment === null || isModelSavedAnalysis(event.assessment)))))))
    && (r.events === null || (!!r.events && typeof r.events.checked_at === 'string' && Number.isFinite(Date.parse(r.events.checked_at))
      && typeof r.events.from === 'string' && typeof r.events.to === 'string' && Number.isInteger(r.events.archive_days)
      && Number.isInteger(r.events.reports_scanned) && typeof r.events.refreshing === 'boolean'
      && (r.events.error === null || typeof r.events.error === 'string')
      && (r.events.latest_report_at === null || (typeof r.events.latest_report_at === 'string' && Number.isFinite(Date.parse(r.events.latest_report_at))))))
    && (r.data === undefined || !!r.data && Number.isInteger(r.data.captured) && r.data.captured >= 0 && Number.isInteger(r.data.expected)
      && r.data.expected >= r.data.captured && typeof r.data.refreshing === 'boolean' && (r.data.error === null || typeof r.data.error === 'string'))
    && (!r.complete || (r.rows.length === r.total && !!r.completed_at && new Set(r.rows.map((row) => row.ticker)).size === r.rows.length))
}
