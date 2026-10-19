import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MODEL_SIGNALS, defaultModelWeights, modelWeights, modelScore, rankModel, signalResult, type ModelRow } from '../../../../shared/universe-model'
import { ModelGrid } from './ModelView'
const event = { id: 'EVT-1', headline: 'Material issuer announcement', url: 'https://example.test/filing', source: 'Issuer filing', reported_at: '2026-10-19T15:00:00Z', source_tier: 'primary_filing', direction: 'positive' as const }
const row = (ticker: string, signals: ModelRow['signals']): ModelRow => ({ ticker, company: `${ticker} Company`, currency: 'USD', price: 12.5, retrieved_at: '2026-10-19T15:00:00Z', signals })
const a = row('AAA', { contracts: [event] })
const b = row('BBB', { results: [event], guidance: [event] })
const weights = defaultModelWeights()
assert.equal(modelScore(a, weights), 1)
assert.equal(modelScore(b, weights), 2)
assert.equal(signalResult(a, MODEL_SIGNALS[0]), false, 'no matching report is distinct from absent coverage')
assert.equal(signalResult(a, MODEL_SIGNALS[2]), true)
assert.equal(signalResult(row('CCC', null), MODEL_SIGNALS[4]), null)
assert.deepEqual(rankModel([a, b], weights).map((r) => r.ticker), ['BBB', 'AAA'])
assert.deepEqual(rankModel([a, b], { ...weights, contracts: 5 }).map((r) => r.ticker), ['AAA', 'BBB'])
assert.equal(modelWeights({ contracts: -1, results: Infinity, guidance: 5 }).contracts, -1)
assert.equal(modelWeights({ results: Infinity }).results, 1)
assert.equal(rankModel([row('CCC', null), a], { ...weights, contracts: -5 })[0].ticker, 'AAA', 'missing coverage never outranks a known negative score')
const markup = renderToStaticMarkup(createElement(ModelGrid, { rows: rankModel([a, b], weights), weights }))
assert.match(markup, /Company<\/th><th scope="col">Market price/)
assert.match(markup, /Results: Present/)
assert.match(markup, /Contracts \/ JVs: No matching report/)
assert.match(markup, /Material issuer announcement/)
assert.doesNotMatch(markup, /tabindex="0"[^>]*aria-label="Results/)
assert.match(markup, /aria-sort="descending"/)
assert.match(markup, /USD · delayed/)
assert.ok(markup.indexOf('BBB Company') < markup.indexOf('AAA Company'))
console.log('ModelView: missingness, boundaries, weighted ranking and grid passed')
