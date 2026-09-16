/** Discovery state is independent of research verdicts and forecast lifecycles. */
export type IdeaLane = 'long' | 'events' | 'short' | 'chain' | 'archives'
export type DiscoveryKind = 'idea' | 'event' | 'chain'
export interface EventReport {
  event_id: string
  family: string
  headline: string
  at: string
  time_basis: 'source' | 'observed'
  publisher: string
  url: string
  stance: 'reported' | 'supports' | 'challenges'
}
export interface DiscoveryEvent {
  title: string
  latest_change: string
  implications: string[]
  summary_status: 'available' | 'reports_only'
  regions: string[]
  topics: string[]
  reports: EventReport[]
  independent_stories: number
}
export interface DiscoveryCard {
  key: string
  kind: DiscoveryKind
  aliases: string[]
  sides: ('long' | 'short')[]
  listings: { long: string | null; short: string | null }
  updated_at: string
  priority: number
  payload: Record<string, unknown>
  event?: DiscoveryEvent
  expired: boolean
  archived_at: string | null
  archive_reason: 'manual' | 'expired' | null
  action_revision: string | null
}
export interface DiscoveryPage {
  schema_version: 'ideas-workspace/v1'
  rows: DiscoveryCard[]
  total: number
  hidden: number
  next_cursor: string | null
  notices: string[]
  projected_at: string
}

const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v)
const texts = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === 'string')
const date = (v: unknown): v is string => typeof v === 'string' && Number.isFinite(Date.parse(v))
const nullableText = (v: unknown) => v === null || typeof v === 'string'
const optionalTexts = (v: Record<string, any>, keys: string[]) => keys.every((key) => v[key] === undefined || nullableText(v[key]))
const coverage = (v: unknown) => v == null || (object(v) && typeof v.has_run === 'boolean'
  && typeof v.data_pool_present === 'boolean' && optionalTexts(v, ['latest_run', 'latest_decision', 'subject']))

/** Validate the actual render dependencies before storing an HTTP response or folding a saved action. */
export function isDiscoveryCard(v: unknown): v is DiscoveryCard {
  if (!object(v) || !/^(idea|event|chain)-[a-f0-9]{24}$/.test(v.key) || !['idea', 'event', 'chain'].includes(v.kind)
    || !texts(v.aliases) || v.aliases.length === 0 || !Array.isArray(v.sides) || !v.sides.every((s: unknown) => s === 'long' || s === 'short')
    || !object(v.listings) || !nullableText(v.listings.long) || !nullableText(v.listings.short)
    || typeof v.updated_at !== 'string' || !Number.isFinite(v.priority) || !object(v.payload)
    || typeof v.expired !== 'boolean' || !(v.archived_at === null || date(v.archived_at))
    || ![null, 'manual', 'expired'].includes(v.archive_reason) || !nullableText(v.action_revision)) return false
  if (v.kind === 'event') {
    const e = v.event
    return object(e) && typeof e.title === 'string' && typeof e.latest_change === 'string'
      && texts(e.implications) && texts(e.regions) && texts(e.topics) && ['available', 'reports_only'].includes(e.summary_status)
      && Number.isInteger(e.independent_stories) && e.independent_stories >= 1 && Array.isArray(e.reports) && e.reports.length > 0
      && e.reports.every((r: unknown) => object(r) && typeof r.event_id === 'string' && typeof r.family === 'string'
        && typeof r.headline === 'string' && date(r.at) && typeof r.publisher === 'string'
        && typeof r.url === 'string' && /^https?:\/\//i.test(r.url)
        && ['source', 'observed'].includes(r.time_basis) && ['reported', 'supports', 'challenges'].includes(r.stance))
  }
  const p = v.payload
  if (!coverage(p.prior_coverage)) return false
  if (v.kind === 'chain') return typeof p.name === 'string' && typeof p.anchor_ticker === 'string'
    && typeof p.mechanism === 'string' && typeof p.role === 'string'
    && optionalTexts(p, ['listing', 'country', 'industry', 'anchor_name', 'anchor_decision', 'anchor_decision_date', 'symbol', 'source_ref', 'lead_score_cap_reason'])
    && texts(p.evidence_gaps) && Array.isArray(p.path) && p.path.every((step: unknown) => object(step) && typeof step.name === 'string' && optionalTexts(step, ['listing', 'role']))
    && Number.isFinite(p.lead_score) && Number.isFinite(p.order)
  return typeof p.idea_id === 'string' && typeof p.ticker === 'string' && ['long', 'short', 'pair'].includes(p.direction)
    && optionalTexts(p, ['company', 'exchange', 'pair_with', 'reason', 'why_now', 'source_name', 'source_url', 'newest_source_at', 'decay_at', 'idea_version', 'idea_version_started_at', 'trade_score_basis'])
    && typeof p.thesis_type === 'string' && texts(p.source_event_ids) && texts(p.source_headlines)
    && (p.missing_checks === undefined || texts(p.missing_checks))
    && (p.source_themes === undefined || (Array.isArray(p.source_themes) && p.source_themes.every((t: unknown) => object(t) && typeof t.theme_id === 'string' && Number.isFinite(t.theme_rev))))
    && ['live', 'promoted', 'expired'].includes(p.status)
}

export function isDiscoveryPage(v: unknown): v is DiscoveryPage {
  return object(v) && v.schema_version === 'ideas-workspace/v1' && Array.isArray(v.rows) && v.rows.every(isDiscoveryCard)
    && Number.isInteger(v.total) && v.total >= 0 && Number.isInteger(v.hidden) && v.hidden >= 0
    && (v.next_cursor === null || (typeof v.next_cursor === 'string' && /^\d+$/.test(v.next_cursor)))
    && texts(v.notices) && date(v.projected_at)
}
