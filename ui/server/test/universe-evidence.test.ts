import assert from 'node:assert/strict'
import Fastify from 'fastify'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { modelSavedAnalysis, projectUniverseAssessments, readUniverseAssessments, registerUniverseEvidence } from '../src/universe-evidence'
import type { EventEnrichment } from '../src/news/enrich'
import { isModelEventRead, isModelRead, MODEL_SCHEMA, MODEL_SIGNALS, UNIVERSE_URL, signalResult, modelTotal, type ModelRow } from '../../shared/universe-model'

const hit: EventEnrichment = { event_id: 'ARTICLE-1', ok: true, complete: true, fetched_at: '2026-10-19T15:00:00Z', prior_coverage: [], related: [],
  gist: ['Orion agreed to acquire a supplier for $200m.'],
  companies: [{ name: 'Orion Corp', ticker: 'ORN', role: 'acquirer', listing_status: 'public', listing_country: 'US', exchange: 'NYSE' }],
  beneficiaries: [{ name: 'Orion Inc', ticker: 'ORN', named_in_article: true, mechanism: 'Buying the supplier could lower input costs.', magnitude: 'No quantified synergy forecast', horizon: 'After closing', relationship: 'direct_subject' },
    { name: 'Other Company', ticker: 'OTHER', named_in_article: true, mechanism: 'This belongs to a different party.' }],
  exposed: [{ name: 'Orion Corp', ticker: 'ORN', named_in_article: true, mechanism: 'Debt-funded consideration could increase leverage.' }],
  market_angle: 'The overall deal has benefits and financing risks.', watch_item: 'Regulatory approval and financing terms.',
  read_from: { kind: 'alternate', source_name: 'Alternate outlet', url: 'https://example.test/actual-read' } }
const analysis = modelSavedAnalysis(hit, 'ARTICLE-1', 'ORN', 'Orion Corp')!
assert.equal(analysis.company_role, 'acquirer')
assert.deepEqual(analysis.effects.map((e) => e.side), ['beneficiary', 'exposed'], 'retain conflicting benefits and risks rather than averaging away a risk')
assert.equal(analysis.effects.length, 2, 'another issuer cannot supply this company’s impact')
assert.equal(modelSavedAnalysis({ ...hit, companies: [{ ...hit.companies![0], listing_country: 'United States' }] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.effects.length, 2, 'article reads use full English country names')
assert.equal(analysis.provenance.kind, 'alternate')
assert.equal(analysis.provenance.url, 'https://example.test/actual-read')
assert.equal(modelSavedAnalysis(hit, 'STORY-1', 'ORN', 'Orion Corp'), null, 'dedup identity never borrows a different article’s cache')
assert.equal(modelSavedAnalysis(hit, 'ARTICLE-1', 'ORN', 'Unrelated Corp')?.effects.length, 0, 'ticker collision alone is insufficient')
assert.equal(modelSavedAnalysis(null, 'ARTICLE-1', 'ORN', 'Orion Corp'), null)
assert.equal(modelSavedAnalysis({ ...hit, companies: [{ ...hit.companies![0], listing_country: 'IN' }] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.effects.length, 0)
assert.equal(modelSavedAnalysis({ ...hit, companies: [{ ...hit.companies![0], exchange: 'NSE', listing_country: null }] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.company_role, null)
assert.equal(modelSavedAnalysis({ ...hit, companies: [], beneficiaries: [{ ...hit.beneficiaries![0], listing: 'NSE' }], exposed: [] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.effects.length, 0)
for (const listing of ['Canada', 'Japan', 'India', 'CA']) assert.equal(modelSavedAnalysis({ ...hit, companies: [], beneficiaries: [{ ...hit.beneficiaries![0], listing }], exposed: [] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.effects.length, 0, `${listing} cannot supply US-instrument effects`)
assert.equal(modelSavedAnalysis({ ...hit, companies: [], beneficiaries: [{ ...hit.beneficiaries![0], listing: 'United States' }], exposed: [] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.effects.length, 1)
assert.equal(modelSavedAnalysis({ ...hit, beneficiaries: [{ ...hit.beneficiaries![0], named_in_article: false }], exposed: [] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.effects.length, 0, 'inferred sector expressions cannot become exact company exposure')
assert.equal(modelSavedAnalysis({ ...hit, beneficiaries: [], exposed: [] }, 'ARTICLE-1', 'ORN', 'Orion Corp')?.event_assessment, hit.market_angle, 'event assessment remains separate from absent company-specific effects')
for (const changed of [{ ok: false }, { degraded: true }]) assert.equal(modelSavedAnalysis({ ...hit, ...changed }, 'ARTICLE-1', 'ORN', 'Orion Corp'), null, 'failed or degraded reads never qualify')
const manyBenefits = modelSavedAnalysis({ ...hit, beneficiaries: Array.from({ length: 5 }, () => hit.beneficiaries![0]) }, 'ARTICLE-1', 'ORN', 'Orion Corp')!
assert.ok(manyBenefits.effects.some((e) => e.side === 'exposed'), 'effect bounding cannot hide a company risk behind several benefits')
assert.ok(manyBenefits.effects.length <= 4)
const read = { event_id: 'ARTICLE-1', ticker: 'ORN', company: 'Orion Corp', analysis }
assert.ok(isModelEventRead(read))
assert.ok(isModelEventRead({ ...read, analysis: null }))
assert.equal(isModelEventRead({ ...read, analysis: { ...analysis, effects: [{ side: 'beneficiary' }] } }), false)
assert.equal(isModelEventRead({ ...read, analysis: { ...analysis, provenance: { kind: 'alternate', label: null, url: 'javascript:alert(1)' } } }), false)
assert.equal(isModelEventRead({ ...read, analysis: { ...analysis, company_role: '__proto__' } }), false)

const event = { id: 'STORY-1', source_event_id: hit.event_id, headline: 'Positive event headline', url: 'https://example.test/event', source: 'Issuer', reported_at: hit.fetched_at, source_tier: 'company', direction: 'positive' as const }
const subject: ModelRow = { ticker: 'ORN', company: 'Orion Corp', price: 10, currency: 'USD', retrieved_at: hit.fetched_at, signals: { deals: [event] } }
const at = Date.parse(hit.fetched_at) + 60_000
const signal = MODEL_SIGNALS.find((s) => s.id === 'deals')!
const project = (cache: Record<string, EventEnrichment>, row = subject) => projectUniverseAssessments([row], cache, at)[0]
const favorable = { ...hit, exposed: [] }
assert.equal(signalResult(project({ [hit.event_id]: favorable }), signal), true, 'an exact company benefit earns one green tick')
assert.equal(signalResult(project({ [hit.event_id]: hit }), signal), false, 'both benefit and exposure are mixed, never favorable')
assert.equal(signalResult(project({ [hit.event_id]: { ...hit, exposed: [{ ...hit.exposed![0], mechanism: '' }] } }), signal), false, 'a missing adverse explanation cannot erase an identified company risk')
assert.equal(signalResult(project({ [hit.event_id]: { ...hit, exposed: [{ ...hit.exposed![0], listing: 'NSE' }] } }), signal), null, 'conflicting party venues invalidate the company assessment instead of dropping only the risk')
assert.equal(signalResult(project({ [hit.event_id]: { ...hit, exposed: [{ ...hit.exposed![0], named_in_article: false }] } }), signal), null, 'an uncertain opposing party cannot silently leave only favorable effects')
assert.equal(modelTotal(project({ [hit.event_id]: hit })), 0)
assert.equal(signalResult(project({}), signal), null, 'a cache miss remains unassessed despite positive event sentiment')
assert.equal(signalResult(project({ [hit.event_id]: { ...favorable, event_id: 'WRONG-ARTICLE' } }), signal), null)
assert.equal(signalResult(project({ [hit.event_id]: favorable }, { ...subject, company: 'Different Issuer' }), signal), null)
assert.equal(signalResult(project({ [hit.event_id]: { ...favorable, beneficiaries: [{ ...favorable.beneficiaries![0], ticker: 'OTHER' }] } }), signal), null)
assert.equal(signalResult(project({ [hit.event_id]: { ...favorable, fetched_at: '2026-10-19T15:02:00Z' } }), signal), null, 'future reads cannot supply a current tick')
assert.equal(signalResult(project({ [hit.event_id]: { ...favorable, fetched_at: '2026-10-19T14:00:00Z' } }), signal), null, 'a read predating the source observation cannot qualify')
assert.equal(project({ [hit.event_id]: favorable }, { ...subject, signals: null }).signals, null)
assert.equal(subject.signals!.deals![0].assessment, undefined, 'projection does not mutate the archive or Finviz snapshot')
const malformedHit = { ...favorable, read_from: undefined, corroborated: { count: 1, domains: 'malformed' } } as unknown as EventEnrichment
assert.equal(signalResult(project({ [hit.event_id]: malformedHit }), signal), null, 'one malformed saved read stays unassessed rather than failing the full grid')
const anotherEvent = { ...event, id: 'STORY-OTHER', source_event_id: 'ARTICLE-OTHER' }
const isolated = projectUniverseAssessments([subject, { ...subject, ticker: 'COPY', signals: { deals: [anotherEvent] } }], { [hit.event_id]: malformedHit, 'ARTICLE-OTHER': { ...favorable, event_id: 'ARTICLE-OTHER', beneficiaries: [{ ...favorable.beneficiaries![0], ticker: 'COPY' }] } }, at)
assert.equal(isolated.length, 2)
assert.equal(signalResult(isolated[1], signal), true, 'malformed evidence does not suppress another company’s valid assessment')
const model = { schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows: [project({ [hit.event_id]: favorable })], total: 1, complete: true, refreshing: false, fetched: 1, started_at: hit.fetched_at, completed_at: hit.fetched_at, next_refresh_at: hit.fetched_at, stale: false, error: null, events: null }
assert.ok(isModelRead(model))
const malformed = JSON.parse(JSON.stringify(model)); malformed.rows[0].signals.deals[0].assessment.effects[0].side = 'invented'
assert.equal(isModelRead(malformed), false, 'malformed impact cannot enter the grid')
const cacheRoot = fileURLToPath(new URL('../../../.cache/finviz-model-tests/', import.meta.url))
await fs.mkdir(cacheRoot, { recursive: true })
const cacheDir = await fs.mkdtemp(path.join(cacheRoot, 'assessment-'))
await fs.writeFile(path.join(cacheDir, 'news-enrich-cache.json'), JSON.stringify({ [hit.event_id]: favorable }))
assert.equal(signalResult(readUniverseAssessments(cacheDir, [subject])[0], signal), true, 'bulk join reuses the on-disk engine read without enrichment')
assert.equal(signalResult(readUniverseAssessments(path.join(cacheDir, 'missing'), [subject])[0], signal), null)

let peeks = 0
const app = Fastify()
registerUniverseEvidence(app, 'unused-fixture-state', (_state, id) => { peeks++; return id === 'ARTICLE-1' ? hit : null })
const result = await app.inject({ method: 'GET', url: '/api/screener/universe-model/evidence?eventId=ARTICLE-1&ticker=ORN&company=Orion%20Corp' })
assert.equal(result.statusCode, 200)
assert.equal(result.headers['cache-control'], 'no-store')
assert.ok(isModelEventRead(result.json()))
assert.equal(result.json().analysis.effects.length, 2)
const absent = await app.inject({ method: 'GET', url: '/api/screener/universe-model/evidence?eventId=NO-READ&ticker=ORN&company=Orion%20Corp' })
assert.equal(absent.json().analysis, null, 'a cache miss never starts enrichment or a paid fallback')
const invalid = await app.inject({ method: 'GET', url: '/api/screener/universe-model/evidence?eventId=ARTICLE-1&ticker=invalid%20symbol&company=Orion' })
assert.equal(invalid.statusCode, 400)
assert.equal(peeks, 2, 'malformed input does not touch the saved cache')
await app.close()
console.log('universe-evidence: exact identity, opposing effects, source provenance and cache-only reads passed')
