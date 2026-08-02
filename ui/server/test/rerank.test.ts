process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { rerankCandidates, type RerankConfig } from '../src/retrieval/rerank'

const config: RerankConfig = { enabled: true, apiKey: 'test', baseUrl: 'https://rerank.test/v1', model: 'test-reranker', timeoutMs: 1000, maxCandidates: 5 }
const candidates = [{ id: 'N1', text: 'Amazon evidence' }, { id: 'N2', text: 'AWS evidence' }]
const goodFetch = (async () => ({
  ok: true, status: 200,
  json: async () => ({ choices: [{ message: { content: JSON.stringify({ ranked: [{ id: 'MADE-UP', score: 100 }, { id: 'N2', score: 91 }] }) } }] }),
})) as unknown as typeof fetch
const ranked = await rerankCandidates({ query: 'Amazon growth', candidates, config, fetchFn: goodFetch })
assert.equal(ranked.status, 'active')
assert.deepEqual(ranked.order, ['N2', 'N1'], 'unknown ids are rejected and omitted known ids are appended')
assert.equal(ranked.scores['MADE-UP'], undefined)

const failed = await rerankCandidates({ query: 'Amazon growth', candidates, config, fetchFn: (async () => { throw new Error('network down') }) as unknown as typeof fetch })
assert.equal(failed.status, 'provider_error')
assert.deepEqual(failed.order, [], 'caller keeps the deterministic order on provider failure')

const off = await rerankCandidates({ query: 'Amazon growth', candidates, config: { ...config, enabled: false }, fetchFn: goodFetch })
assert.equal(off.status, 'not_configured')

console.log('\n1 rerank test file passed')
