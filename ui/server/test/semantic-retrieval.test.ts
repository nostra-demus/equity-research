process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { binarySignature, searchSemanticIndex, signatureSimilarity, updateSemanticIndex, type EmbeddingConfig } from '../src/retrieval/semantic'
import type { FeedItem } from '../src/news/types'

const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-news-'))
const cfg: EmbeddingConfig = { enabled: true, apiKey: 'test-key', baseUrl: 'https://embed.test/v1', model: 'test-embed', timeoutMs: 1000, batchSize: 8, maxItemsPerCycle: 20 }
function item(id: string, headline: string): FeedItem {
  return {
    kind: 'item', ts: '2026-08-02T10:00:00Z', event_id: id, headline,
    url: `https://reuters.com/${id}`, domain: 'reuters.com', source_name: 'Reuters', via: 'rss', region: 'US',
    input_nature: 'news_headline', triage_score: 80, band: 'pick', triage_reason: 'Material.', relevance: 'material',
    event_types: [], issuer_linkage: 'primary', companies: [], size_bucket: 'mega', dedup_status: 'new', inboxed: true,
  }
}
const amazon = Array.from({ length: 32 }, (_, i) => i % 3 === 0 ? 1 : 0.1)
const oil = Array.from({ length: 32 }, (_, i) => i % 3 === 0 ? -1 : 0.1)
const fakeFetch = (async (_url: string, init: any) => {
  const body = JSON.parse(String(init.body))
  const inputs: string[] = body.input
  return {
    ok: true, status: 200,
    json: async () => ({ data: inputs.map((text, index) => ({ index, embedding: /amazon|bedrock/i.test(text) ? amazon : oil })) }),
  }
}) as unknown as typeof fetch

assert.equal(signatureSimilarity(binarySignature(amazon), binarySignature(amazon)), 1)
assert.ok(signatureSimilarity(binarySignature(amazon), binarySignature(oil)) < 1)

const stateDir = temp()
const updated = await updateSemanticIndex({ stateDir, items: [item('E-amazon', 'Amazon Bedrock adoption rises'), item('E-oil', 'Oil supply falls')], config: cfg, fetchFn: fakeFetch })
assert.equal(updated.status, 'active')
assert.equal(updated.indexed, 2)
const searched = await searchSemanticIndex({ stateDir, query: 'growth in Amazon AI platform use', config: cfg, fetchFn: fakeFetch })
assert.equal(searched.status, 'active')
assert.equal(searched.hits[0]?.eventId, 'E-amazon')
assert.equal(searched.indexedItems, 2)

let calls = 0
const off = await searchSemanticIndex({ stateDir, query: 'anything', config: { ...cfg, enabled: false }, fetchFn: (async () => { calls++; throw new Error('must not call') }) as unknown as typeof fetch })
assert.equal(off.status, 'not_configured')
assert.equal(calls, 0)

const broken = await searchSemanticIndex({ stateDir, query: 'anything', config: cfg, fetchFn: (async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch })
assert.equal(broken.status, 'provider_error')
assert.deepEqual(broken.hits, [])

console.log('\n1 semantic-retrieval test file passed')
