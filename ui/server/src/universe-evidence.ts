import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ModelEventRead, ModelRow, ModelSavedAnalysis, ModelSignals } from '../../shared/universe-model'
import { isEnrichmentComplete, peekCachedEnrichment, peekCachedEnrichments, type EventEnrichment } from './news/enrich'
import { coreCompanyName, normTicker } from './news/symbology'
import { discoveryListing } from '../../shared/listing-market'
import { cleanText } from './news/clean'
import { COUNTRIES } from './news/geography'

const text = (v: unknown, max = 900): string | null => typeof v === 'string' && v.trim() ? cleanText(v).slice(0, max) : null
const url = (v: unknown) => typeof v === 'string' && /^https?:\/\//i.test(v) ? v : null
const countryCodes = new Map(Object.entries(COUNTRIES).flatMap(([code, info]) => [[code.toLowerCase(), code] as const, [info.name.toLowerCase(), code] as const]))
const country = (v: unknown) => typeof v === 'string' ? countryCodes.get(v.trim().toLowerCase()) || null : null

/** A read-only projection of an already saved article read. Never fetches, enriches, or starts a run.
 * Event-level sentiment cannot stand in for the selected issuer's economic exposure. */
export function modelSavedAnalysis(hit: EventEnrichment | null, eventId: string, ticker: string, company: string): ModelSavedAnalysis | null {
  if (!hit || !hit.ok || hit.degraded || !isEnrichmentComplete(hit) || hit.event_id !== eventId || !Number.isFinite(Date.parse(hit.fetched_at))) return null
  const targetTicker = normTicker(ticker); const targetName = coreCompanyName(company)
  const same = (p: { name?: string; ticker?: string | null }) => {
    if (!p || typeof p.ticker !== 'string' || normTicker(p.ticker) !== targetTicker || typeof p.name !== 'string') return false
    const name = coreCompanyName(p.name)
    return !!name && name === targetName
  }
  const companies = (Array.isArray(hit.companies) ? hit.companies : []).filter(same)
  const identityConflict = companies.some((c) => country(c.listing_country) && country(c.listing_country) !== 'US'
    || discoveryListing(c.ticker, c.exchange) && discoveryListing(c.ticker, c.exchange) !== 'US')
  const subject = identityConflict ? undefined : companies.find((c) => !country(c.listing_country) || country(c.listing_country) === 'US')
  const effects: ModelSavedAnalysis['effects'] = []
  if (!identityConflict) for (const [side, parties] of [['beneficiary', hit.beneficiaries], ['exposed', hit.exposed]] as const) {
    for (const party of Array.isArray(parties) ? parties : []) {
      if (!same(party) || !party.named_in_article) continue
      const venue = discoveryListing(party.ticker, party.listing) || country(party.listing)
      if (venue && venue !== 'US') continue
      const mechanism = text(party.mechanism) || text('basis' in party ? party.basis : null)
      if (mechanism) effects.push({ side, mechanism, magnitude: text(party.magnitude, 240), horizon: text(party.horizon, 240) })
    }
  }
  const story = (Array.isArray(hit.gist) ? hit.gist : []).map((s) => text(s)).filter((s): s is string => !!s).slice(0, 4)
  if (!story.length) { const summary = text(hit.summary_en || hit.summary, 1600); if (summary) story.push(summary) }
  const readFrom = hit.read_from
  const kind = readFrom?.kind === 'filing_doc' || readFrom?.kind === 'alternate' ? readFrom.kind : hit.corroborated ? 'corroborated' : 'original'
  // The compact popup must retain BOTH sides. Four benefits cannot hide a fifth, adverse effect.
  const opposing = effects.some((e) => e.side === 'beneficiary') && effects.some((e) => e.side === 'exposed')
  const boundedEffects = opposing ? [...effects.filter((e) => e.side === 'beneficiary').slice(0, 2), ...effects.filter((e) => e.side === 'exposed').slice(0, 2)] : effects.slice(0, 4)
  return { read_at: hit.fetched_at, story, company_role: subject && ['subject', 'acquirer', 'target', 'forecaster', 'mentioned'].includes(subject.role) ? subject.role : null, effects: boundedEffects,
    event_assessment: text(hit.news_impact?.why_it_matters || hit.market_angle), watch_item: text(hit.watch_item, 600),
    provenance: { kind, label: text(readFrom?.source_name || readFrom?.domain || hit.corroborated?.domains?.join(', '), 240), url: url(readFrom?.url) } }
}

/** Join saved engine reads once per response. No event direction or absent cache can imply benefit. */
export function projectUniverseAssessments(rows: ModelRow[], cache: Record<string, EventEnrichment>, now = Date.now()): ModelRow[] {
  return rows.map((row) => {
    if (row.signals === null) return row
    const signals: ModelSignals = {}
    for (const [key, reports] of Object.entries(row.signals)) {
      signals[key as keyof ModelSignals] = reports.map((event) => {
        const analysis = event.source_event_id ? modelSavedAnalysis(cache[event.source_event_id] || null, event.source_event_id, row.ticker, row.company) : null
        // Reject future reads and reads older than their article, rather than promoting stale identity.
        const readAt = analysis ? Date.parse(analysis.read_at) : NaN
        return { ...event, assessment: analysis && readAt <= now && readAt >= Date.parse(event.reported_at) ? analysis : null }
      })
    }
    return { ...row, signals }
  })
}

export const readUniverseAssessments = (stateDir: string, rows: ModelRow[]) => projectUniverseAssessments(rows, peekCachedEnrichments(stateDir))

export function registerUniverseEvidence(app: FastifyInstance, stateDir: string, peek = peekCachedEnrichment) {
  const query = z.object({ eventId: z.string().trim().min(1).max(200), ticker: z.string().regex(/^[A-Z0-9.^-]{1,20}$/), company: z.string().trim().min(1).max(300) })
  app.get('/api/screener/universe-model/evidence', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
    reply.header('Cache-Control', 'no-store')
    const parsed = query.safeParse(req.query)
    if (!parsed.success) return reply.code(400).send({ error: 'An exact event and company are required.' })
    const { eventId, ticker, company } = parsed.data
    const result: ModelEventRead = { event_id: eventId, ticker, company, analysis: modelSavedAnalysis(peek(stateDir, eventId), eventId, ticker, company) }
    return result
  })
}
