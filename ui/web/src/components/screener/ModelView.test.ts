import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { companyImpact, MODEL_SIGNALS, modelTotal, rankModel, signalResult, type ModelPricesRead, type ModelRow, type ModelSavedAnalysis } from '../../../../shared/universe-model'
import { ModelGrid, modelPriceView } from './ModelView'
const assessment: ModelSavedAnalysis = { read_at: '2026-10-19T15:00:00Z', story: ['The issuer has won a contract.'], company_role: 'subject', effects: [{ side: 'beneficiary', mechanism: 'Adds contracted sales.', magnitude: null, horizon: null }], event_assessment: null, watch_item: null, provenance: { kind: 'original', label: null, url: null } }
assert.equal(companyImpact({} as ModelSavedAnalysis), null, 'missing legacy effects cannot assert a favorable result or crash the helper')
const event = { id: 'EVT-1', headline: 'Material issuer announcement', url: 'https://example.test/filing', source: 'Issuer filing', reported_at: '2026-10-19T15:00:00Z', source_tier: 'primary_filing', direction: 'positive' as const, assessment }
const row = (ticker: string, signals: ModelRow['signals']): ModelRow => ({ ticker, company: `${ticker} Company`, currency: 'USD', price: 12.5, retrieved_at: '2026-10-19T15:00:00Z', signals })
const a = row('AAA', { contracts: [event] })
const b = row('BBB', { results: [event], guidance: [event] })
assert.equal(modelTotal(a), 1)
assert.equal(modelTotal(b), 2)
assert.equal(modelTotal(row('DDD', { contracts: [event, { ...event, id: 'EVT-2' }] })), 1, 'several reports in one signal still count as one green tick')
assert.equal(modelTotal(row('EMPTY', {})), null)
assert.equal(modelTotal(row('UNKNOWN', null)), null, 'unavailable coverage is not a zero')
assert.equal(signalResult(a, MODEL_SIGNALS[0]), null, 'no matching evidence cannot assert a negative company effect')
assert.equal(signalResult(a, MODEL_SIGNALS[2]), true)
assert.equal(signalResult(row('CCC', null), MODEL_SIGNALS[4]), null)
const unassessed = { ...event, assessment: null }
const adverse = { ...event, assessment: { ...assessment, effects: [{ ...assessment.effects[0], side: 'exposed' as const }] } }
assert.equal(modelTotal(row('HEADLINE', { contracts: [unassessed] })), null, 'positive headline direction without exact company analysis earns no tick')
assert.equal(signalResult(row('HEADLINE', { contracts: [unassessed] }), MODEL_SIGNALS[2]), null)
assert.equal(signalResult(row('LEGACY', { contracts: [{ ...event, assessment: undefined }] }), MODEL_SIGNALS[2]), null, 'an older server cannot turn event presence green')
assert.equal(signalResult(row('ADVERSE', { contracts: [adverse] }), MODEL_SIGNALS[2]), false)
assert.equal(signalResult(row('MIXED', { contracts: [{ ...event, assessment: { ...assessment, effects: [...assessment.effects, ...adverse.assessment.effects] } }] }), MODEL_SIGNALS[2]), false)
assert.equal(signalResult(row('CONFLICT', { contracts: [event, adverse] }), MODEL_SIGNALS[2]), false, 'a benefit in one report cannot hide another report’s company risk')
assert.equal(signalResult(row('PARTIAL', { contracts: [event, unassessed] }), MODEL_SIGNALS[2]), null, 'incomplete company assessment is not asserted favorable')
assert.equal(modelTotal(row('NEUTRAL', { contracts: [{ ...event, assessment: { ...assessment, verdict: 'neutral', effects: [] } }] })), 0, 'an explicitly neutral assessment is a known zero')
assert.equal(signalResult(row('NEUTRAL', { contracts: [{ ...event, assessment: { ...assessment, effects: [] } }] }), MODEL_SIGNALS[2]), null)
assert.equal(signalResult(row('NEGATIVE-HEADLINE', { contracts: [{ ...event, direction: 'negative' }] }), MODEL_SIGNALS[2]), true, 'the selected company’s saved benefit decides, not event-level sentiment')
assert.deepEqual(rankModel([a, b]).map((r) => r.ticker), ['BBB', 'AAA'])
assert.equal(rankModel([row('CCC', null), row('ADVERSE', { contracts: [adverse] })])[0].ticker, 'ADVERSE', 'unavailable rows remain below assessed zero-count rows')
const markup = renderToStaticMarkup(createElement(ModelGrid, { rows: rankModel([a, b]) }))
assert.match(markup, /Company<\/th><th scope="col">Market price/)
assert.match(markup, /Results: Favorable impact/)
assert.match(markup, /Contracts \/ JVs: Unassessed/)
assert.match(markup, /aria-haspopup="dialog"/)
assert.doesNotMatch(markup, /Material issuer announcement/, 'article details are opened on demand')
assert.doesNotMatch(markup, /tabindex="0"[^>]*aria-label="Results/)
assert.match(markup, /aria-sort="descending"/)
assert.match(markup, /Finviz · delayed/)
const now = Date.parse('2026-10-21T14:00:00Z')
const prices: ModelPricesRead = { checked_at: new Date(now).toISOString(), rows: [{ ticker: 'AAA', company: 'AAA Company', quote: {
  price: 20, symbol: 'AAA', currency: 'USD', source: 'cnbc', as_of: new Date(now - 10_000).toISOString(),
  as_of_is_close: false, real_time: true, delayed: false, stale: false, retrieved_at: new Date(now).toISOString(),
} }] }
assert.equal(modelPriceView(a, prices, false, now).price, 20, 'the current free feed replaces the Finviz price only for this exact issuer')
assert.equal(modelPriceView(a, prices, false, now).label, 'CNBC · Live')
assert.match(modelPriceView(a, prices, false, now).time, /^As of /)
assert.match(modelPriceView(a, null, false, now).time, /^Checked /, 'Finviz retrieval time must not look like market time')
assert.equal(modelPriceView(a, prices, true, now).label, 'Saved · CNBC · Latest trade', 'a failed refresh cannot keep claiming live')
assert.match(modelPriceView(a, prices, false, now + 60_000).label, /^Saved/, 'a sleeping tab ages its delivery status')
const change = (value: Partial<NonNullable<ModelPricesRead['rows'][number]['quote']>>) => ({ ...prices, rows: [{ ...prices.rows[0], quote: { ...prices.rows[0].quote!, ...value } }] })
assert.equal(modelPriceView(a, change({ real_time: null }), false, now).label, 'CNBC · Latest trade', 'an absent real-time flag is not proof of live delivery')
assert.equal(modelPriceView(a, change({ delayed: true, real_time: false }), false, now).label, 'CNBC · Delayed')
assert.equal(modelPriceView(a, change({ as_of_is_close: true, as_of: '2026-10-20T00:00:00Z' }), false, now).label, 'CNBC · Last close')
assert.equal(modelPriceView(a, change({ as_of_is_close: true, as_of: null }), false, now).label, 'CNBC · Time unavailable')
assert.equal(modelPriceView(a, change({ as_of: new Date(now - 10 * 60_000).toISOString() }), false, now).label, 'CNBC · Latest trade', 'an old trade is not called live merely because a flag says true')
assert.equal(modelPriceView(b, prices, false, now).price, b.price, 'a quote for another company cannot leak across rows')
assert.ok(markup.indexOf('BBB Company') < markup.indexOf('AAA Company'))
console.log('ModelView: missingness, category counting, descending green-count ranking and grid passed')
