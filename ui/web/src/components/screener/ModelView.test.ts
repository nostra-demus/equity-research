import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MODEL_SIGNALS, modelTotal, rankModel, signalResult, type ModelRow } from '../../../../shared/universe-model'
import { ModelGrid } from './ModelView'
const event = { id: 'EVT-1', headline: 'Material issuer announcement', url: 'https://example.test/filing', source: 'Issuer filing', reported_at: '2026-10-19T15:00:00Z', source_tier: 'primary_filing', direction: 'positive' as const }
const row = (ticker: string, signals: ModelRow['signals']): ModelRow => ({ ticker, company: `${ticker} Company`, currency: 'USD', price: 12.5, retrieved_at: '2026-10-19T15:00:00Z', signals })
const a = row('AAA', { contracts: [event] })
const b = row('BBB', { results: [event], guidance: [event] })
assert.equal(modelTotal(a), 1)
assert.equal(modelTotal(b), 2)
assert.equal(modelTotal(row('DDD', { contracts: [event, { ...event, id: 'EVT-2' }] })), 1, 'several reports in one signal still count as one green tick')
assert.equal(modelTotal(row('EMPTY', {})), 0)
assert.equal(modelTotal(row('UNKNOWN', null)), null, 'unavailable coverage is not a zero')
assert.equal(signalResult(a, MODEL_SIGNALS[0]), false, 'no matching report is distinct from absent coverage')
assert.equal(signalResult(a, MODEL_SIGNALS[2]), true)
assert.equal(signalResult(row('CCC', null), MODEL_SIGNALS[4]), null)
assert.deepEqual(rankModel([a, b]).map((r) => r.ticker), ['BBB', 'AAA'])
assert.equal(rankModel([row('CCC', null), row('EMPTY', {})])[0].ticker, 'EMPTY', 'unavailable rows remain below assessed zero-count rows')
const markup = renderToStaticMarkup(createElement(ModelGrid, { rows: rankModel([a, b]) }))
assert.match(markup, /Company<\/th><th scope="col">Market price/)
assert.match(markup, /Results: Present/)
assert.match(markup, /Contracts \/ JVs: No matching report/)
assert.match(markup, /aria-haspopup="dialog"/)
assert.doesNotMatch(markup, /Material issuer announcement/, 'article details are opened on demand')
assert.doesNotMatch(markup, /tabindex="0"[^>]*aria-label="Results/)
assert.match(markup, /aria-sort="descending"/)
assert.match(markup, /USD · delayed/)
assert.ok(markup.indexOf('BBB Company') < markup.indexOf('AAA Company'))
console.log('ModelView: missingness, category counting, descending green-count ranking and grid passed')
