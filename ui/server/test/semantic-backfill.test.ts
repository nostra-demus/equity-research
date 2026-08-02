process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { backfillSemanticItems, firehoseFiles, savedItems } from '../../../scripts/news-semantic-backfill'
import type { EmbeddingConfig } from '../src/retrieval/semantic'
import type { FeedItem } from '../src/news/types'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-backfill-'))
const inbox = path.join(root, 'screener', 'inbox')
const archive = path.join(root, 'data', 'NEWS-ARCHIVE')
fs.mkdirSync(inbox, { recursive: true })
fs.mkdirSync(archive, { recursive: true })
const row = (id: string): FeedItem => ({
  kind: 'item', ts: '2026-08-02T10:00:00Z', event_id: id, headline: `Company ${id} reports an update`,
  url: `https://reuters.com/${id}`, domain: 'reuters.com', source_name: 'Reuters', via: 'rss', region: 'US',
  input_nature: 'news_headline', triage_score: 75, band: 'watch', triage_reason: 'Material.', relevance: 'material',
  event_types: [], issuer_linkage: 'primary', companies: [], size_bucket: 'mid', dedup_status: 'new', inboxed: true,
})

fs.writeFileSync(path.join(inbox, '2026-08-02_firehose.ndjson'), `${JSON.stringify(row('EVT-inbox-copy'))}\n`)
fs.writeFileSync(path.join(archive, '2026-08-02_firehose.ndjson'), `${JSON.stringify(row('EVT-archive-copy'))}\n`)
const files = firehoseFiles(root, '')
assert.deepEqual(files, [path.join(archive, '2026-08-02_firehose.ndjson')], 'durable archive wins over the copied live file for the same day')
const physicalRows: string[] = []
for await (const item of savedItems(files)) physicalRows.push(item.event_id)
assert.deepEqual(physicalRows, ['EVT-archive-copy'])

const stateDir = path.join(root, 'state')
const cfg: EmbeddingConfig = { enabled: true, apiKey: 'test', baseUrl: 'https://embed.test/v1', model: 'scale-test', timeoutMs: 1_000, batchSize: 50, maxItemsPerCycle: 2_000 }
let providerCalls = 0
const fakeFetch = (async (_url: string, init: any) => {
  providerCalls++
  const input = JSON.parse(String(init.body)).input as string[]
  return { ok: true, json: async () => ({ data: input.map((_text, index) => ({ index, embedding: Array.from({ length: 32 }, (_, i) => (i + index) % 3 ? 0.1 : 1) })) }) }
}) as unknown as typeof fetch
const history = async function* () {
  for (let i = 0; i < 1_200; i++) yield row(`EVT-${i}`)
  yield row('EVT-1199') // same physical event/text revision must not be billed twice
}

const originalCreateReadStream = fs.createReadStream
let indexReads = 0
;(fs as any).createReadStream = function(file: fs.PathLike, ...args: any[]) {
  if (path.basename(String(file)) === 'news-semantic-index.ndjson') indexReads++
  return (originalCreateReadStream as any).call(fs, file, ...args)
}
try {
  const first = await backfillSemanticItems({ items: history(), stateDir, config: cfg, chunkSize: 80, fetchFn: fakeFetch })
  assert.equal(first.indexed, 1_200)
  assert.equal(first.selected, 1_200)
  assert.equal(first.resume_backend, 'sqlite', 'archive-sized resume keys stay in a disk index, not the JS heap')
  assert.equal(indexReads, 1, 'the whole growing index is preloaded once, not rescanned per chunk')

  indexReads = 0
  providerCalls = 0
  const resumed = await backfillSemanticItems({ items: history(), stateDir, config: cfg, chunkSize: 37, fetchFn: fakeFetch })
  assert.equal(resumed.indexed, 0)
  assert.equal(resumed.selected, 0)
  assert.equal(providerCalls, 0, 'resume does not rebill already indexed event/text keys')
  assert.equal(indexReads, 1, 'resume also performs one compact index preload')
} finally {
  ;(fs as any).createReadStream = originalCreateReadStream
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('\n1 semantic-backfill test file passed')
