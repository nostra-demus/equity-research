// The production archive is large enough that a full facet recount takes seconds. It must remain complete,
// but it must never run on Fastify's event-loop thread or make every other endpoint wait behind it.
// Run: npx tsx test/facets-service.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  closeFacetsWorkerForTests,
  computeFacetsAsync,
  invalidateAndWarmFacets,
} from '../src/news/facets-service'
import type { FeedItem } from '../src/news/types'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'facets-service-'))
const day = '2026-08-27'
const inbox = path.join(repo, 'screener', 'inbox')
const firehose = path.join(inbox, `${day}_firehose.ndjson`)

const item = (eventId: string, country: string, headline: string): FeedItem => ({
  kind: 'item', event_id: eventId, ts: `${day}T10:00:00Z`, headline,
  url: `https://example.com/${eventId}`, domain: 'example.com', source_name: 'Example Wire', via: 'rss',
  region: country === 'AE' ? 'ME' : 'US', country, input_nature: 'news_headline', triage_score: 60,
  band: 'watch', triage_reason: 'test', relevance: 'material', event_types: ['product'],
  issuer_linkage: 'primary', companies: [], size_bucket: 'unknown', dedup_status: 'new', inboxed: true,
})

try {
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(firehose, `${JSON.stringify(item('EVT-WORKER-1', 'AE', 'UAE company expands'))}\n`)

  let eventLoopTurnRan = false
  const firstBuild = computeFacetsAsync(repo, {})
  setImmediate(() => { eventLoopTurnRan = true })
  const first = await firstBuild
  assert.equal(eventLoopTurnRan, true, 'the main event loop advances while the archive worker builds')
  assert.equal(first.total, 1)
  assert.equal(first.countries.find((row) => row.key === 'AE')?.count, 1)

  const cached = await computeFacetsAsync(repo, {})
  assert.strictEqual(cached, first, 'an identical request reuses the warm response snapshot')

  fs.appendFileSync(firehose, `${JSON.stringify(item('EVT-WORKER-2', 'US', 'US company reports'))}\n`)
  invalidateAndWarmFacets(repo)
  const refreshed = await computeFacetsAsync(repo, {})
  assert.equal(refreshed.total, 2, 'ingest invalidation refreshes the complete filter universe')
  assert.equal(refreshed.countries.find((row) => row.key === 'US')?.count, 1)

  console.log('\nfacets-service.test.ts: 6 passed')
} finally {
  await closeFacetsWorkerForTests()
  fs.rmSync(repo, { recursive: true, force: true })
}
