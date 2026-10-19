import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { modelSavedAnalysis, registerUniverseEvidence } from '../src/universe-evidence'
import type { EventEnrichment } from '../src/news/enrich'
import { isModelEventRead } from '../../shared/universe-model'

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
const read = { event_id: 'ARTICLE-1', ticker: 'ORN', company: 'Orion Corp', analysis }
assert.ok(isModelEventRead(read))
assert.ok(isModelEventRead({ ...read, analysis: null }))
assert.equal(isModelEventRead({ ...read, analysis: { ...analysis, effects: [{ side: 'beneficiary' }] } }), false)
assert.equal(isModelEventRead({ ...read, analysis: { ...analysis, provenance: { kind: 'alternate', label: null, url: 'javascript:alert(1)' } } }), false)
assert.equal(isModelEventRead({ ...read, analysis: { ...analysis, company_role: '__proto__' } }), false)

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
