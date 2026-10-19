import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { ModelEventRead, ModelSavedAnalysis } from '../../shared/universe-model'
import { peekCachedEnrichment, type EventEnrichment } from './news/enrich'
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
  if (!hit || hit.event_id !== eventId || !Number.isFinite(Date.parse(hit.fetched_at))) return null
  const same = (p: { name?: string; ticker?: string | null }) => !!p && typeof p.ticker === 'string' && normTicker(p.ticker) === normTicker(ticker)
    && typeof p.name === 'string' && !!coreCompanyName(p.name) && coreCompanyName(p.name) === coreCompanyName(company)
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
      if (mechanism && effects.length < 4) effects.push({ side, mechanism, magnitude: text(party.magnitude, 240), horizon: text(party.horizon, 240) })
    }
  }
  const story = (Array.isArray(hit.gist) ? hit.gist : []).map((s) => text(s)).filter((s): s is string => !!s).slice(0, 4)
  if (!story.length) { const summary = text(hit.summary_en || hit.summary, 1600); if (summary) story.push(summary) }
  const readFrom = hit.read_from
  const kind = readFrom?.kind === 'filing_doc' || readFrom?.kind === 'alternate' ? readFrom.kind : hit.corroborated ? 'corroborated' : 'original'
  return { read_at: hit.fetched_at, story, company_role: subject && ['subject', 'acquirer', 'target', 'forecaster', 'mentioned'].includes(subject.role) ? subject.role : null, effects,
    event_assessment: text(hit.news_impact?.why_it_matters || hit.market_angle), watch_item: text(hit.watch_item, 600),
    provenance: { kind, label: text(readFrom?.source_name || readFrom?.domain || hit.corroborated?.domains?.join(', '), 240), url: url(readFrom?.url) } }
}

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
