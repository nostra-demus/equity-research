process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildHybridQuery } from '../src/retrieval/hybrid'
import { NewsRelationshipGraph } from '../src/news/relationship-graph'
import type { FeedItem } from '../src/news/types'

function item(id: string, headline: string, company = 'Amazon', ticker: string | null = 'AMZN'): FeedItem {
  return {
    kind: 'item', ts: '2026-08-02T10:00:00Z', event_id: id, headline,
    url: `https://reuters.com/${id}`, domain: 'reuters.com', source_name: 'Reuters', via: 'rss',
    region: 'US', input_nature: 'news_headline', triage_score: 88, band: 'pick',
    triage_reason: 'Material company news.', relevance: 'material', event_types: ['commercial'],
    issuer_linkage: 'primary', companies: [{ name: company, ticker, listing_country: 'US' }],
    size_bucket: 'mega', source_tier: 'news', dedup_status: 'new', inboxed: true,
    materiality_pre_score: 61,
  } as FeedItem
}

const query = buildHybridQuery('Amazon Bedrock growth rate', { metricTerms: ['growth', 'rate'] })
const graph = new NewsRelationshipGraph(query)
const direct = item('EVT-direct', 'Amazon launches a cloud update')
graph.add(direct, { summary: 'Amazon Bedrock usage growth accelerated in the quarter.' })
const connected = item('EVT-connected', 'Amazon raises data-center capital spending')
graph.add(connected)
graph.add(item('EVT-unrelated', 'OtherCo growth rate improved', 'OtherCo', 'OTHR'))

const relationships = graph.relationships()
assert.ok(relationships.some((r) => r.seed === 'bedrock' && r.related === 'Amazon'))
assert.ok(relationships.every((r) => r.evidence.length > 0), 'every relationship keeps cited evidence')
assert.ok(!relationships.some((r) => r.related === 'OtherCo'), 'generic metric text cannot create a named-subject edge')

const candidates = graph.candidates(new Set(['EVT-direct']))
assert.equal(candidates.length, 0, 'plain co-mentions are displayed but never expand into unrelated company history')

const savedDirection = new NewsRelationshipGraph(buildHybridQuery('Bedrock', {}))
savedDirection.add(direct, {
  summary: 'Bedrock demand increased.',
  beneficiaries: [{ name: 'Nvidia', named_in_article: true, ticker: 'NVDA', listing: 'NASDAQ listed', listing_verified: true, mechanism: 'GPU demand rises', order: 'first' }],
})
savedDirection.add(item('EVT-nvidia', 'Nvidia raises its outlook', 'Nvidia', 'NVDA'))
assert.ok(savedDirection.relationships().some((r) => r.related === 'Nvidia' && r.relation === 'saved_beneficiary'))
assert.ok(savedDirection.candidates(new Set(['EVT-direct'])).some((c) => c.item.event_id === 'EVT-nvidia' && c.reason.includes('saved beneficiary')))

const modelOnlyListing = new NewsRelationshipGraph(buildHybridQuery('Bedrock', {}))
modelOnlyListing.add(direct, {
  summary: 'Bedrock demand increased.',
  beneficiaries: [{ name: 'Nvidia', named_in_article: true, ticker: 'NVDA', listing_status: 'public', mechanism: 'GPU demand rises', order: 'first' }],
})
modelOnlyListing.add(item('EVT-model-nvidia', 'Nvidia raises its outlook', 'Nvidia', 'NVDA'))
assert.ok(modelOnlyListing.relationships().some((r) => r.related === 'Nvidia' && !r.expansionValidated))
assert.equal(modelOnlyListing.candidates(new Set(['EVT-direct'])).length, 0, 'LLM-authored public/ticker text is display-only without trusted listing verification')

const inferredGroup = new NewsRelationshipGraph(buildHybridQuery('Bedrock', {}))
inferredGroup.add(direct, {
  summary: 'Bedrock demand increased.',
  beneficiaries: [{ name: 'AI chip suppliers', named_in_article: false, ticker: null, listing: null, mechanism: 'May sell more accelerators', order: 'second' }],
})
inferredGroup.add(item('EVT-group', 'AI chip suppliers rise', 'AI chip suppliers', null))
assert.ok(inferredGroup.relationships().some((r) => r.related === 'AI chip suppliers' && !r.expansionValidated))
assert.equal(inferredGroup.candidates(new Set(['EVT-direct'])).length, 0, 'an inferred group cannot expand as a concrete listed company')

console.log('\n1 relationship-graph test file passed')
