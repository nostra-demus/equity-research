import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { eventIdFor } from '../src/news/normalize'
import { inspectDeferredBacklog, runIngestCycle, saveDeferred } from '../src/news/runCycle'
import { durableQueueDatabasePath, loadDurableQueueHistory, retireDurableQueueItems } from '../src/news/durable-queue'
import type { NewsItem } from '../src/news/types'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'news-terminal-redelivery-'))
const state = path.join(root, 'state')
const now = new Date('2026-09-20T07:00:00Z')
const item = (headline: string, url: string): NewsItem => ({
  event_id: eventIdFor(headline, url), headline, url, domain: 'reuters.com', source_name: 'Reuters',
  input_nature: 'news_headline', region: 'GLOBAL', found_at: now.toISOString(), deferred_at: now.toISOString(), dedup_status: 'new', via: 'gdelt',
})
const completed = item('Central bank holds interest rates steady after review', 'https://reuters.com/completed')
const retired = item('Energy regulator publishes revised production outlook', 'https://reuters.com/retired')
const pending = item('Manufacturer releases its latest trading update today', 'https://reuters.com/pending')
const revision = item('Central bank reverses decision and cuts interest rates', completed.url)

try {
  assert.equal(saveDeferred(state, [completed, retired, pending]), true)
  assert.equal(retireDurableQueueItems(state, [retired], 'fixture-retirement', now), true)
  assert.equal(saveDeferred(state, [pending]), true) // completed receipt survives payload cleanup
  for (let cycle = 0; cycle < 3; cycle++) {
    const summary = await runIngestCycle({
      repoRoot: root, stateDir: state, now: () => now, sleep: async () => {}, signal: AbortSignal.abort(),
      config: { groqApiKey: 'fixture', gdeltBaseUrl: 'https://gdelt.test/doc',
        rssEnabled: false, nseEnabled: false, anthropicFallbackEnabled: false, geminiEnabled: false,
        overflowProviders: [], localProvider: null, themesEnabled: false } as any,
      fetchFn: (async (input: string | URL | Request) => {
        assert.ok(String(input).startsWith('https://gdelt.test/'), 'no provider calls or live network')
        return new Response(JSON.stringify({ articles: [cycle === 0 ? completed : revision, retired, pending].map((row) => ({
          title: row.headline, url: row.url, domain: row.domain, seendate: '20260920T065900Z',
        })) }))
      }) as typeof fetch,
    })
    assert.notEqual(summary.defer_reason, 'storage-emergency', 'terminal redelivery is not lost retry work')
    assert.equal(summary.candidates, cycle === 0 ? 1 : 2, 'only active work and a genuinely new revision enter scheduling')
    assert.equal(summary.new_arrivals, cycle === 1 ? 1 : 0)
    assert.equal(summary.groq_requests, 0)
    assert.deepEqual(new Set(inspectDeferredBacklog(state).items.map((row) => row.event_id)), new Set(cycle === 0 ? [pending.event_id] : [pending.event_id, revision.event_id]))
  }
  assert.deepEqual(loadDurableQueueHistory(state, 'retired').map((row) => row.event_id), [retired.event_id])
  // The database can become unavailable after the initial backlog read, while fetching sources.
  const database = durableQueueDatabasePath(state)
  const failure = await runIngestCycle({
    repoRoot: root, stateDir: state, now: () => now, sleep: async () => {},
    config: { groqApiKey: 'fixture', gdeltBaseUrl: 'https://gdelt.test/doc',
      rssEnabled: false, nseEnabled: false, anthropicFallbackEnabled: false, geminiEnabled: false,
      overflowProviders: [], localProvider: null, themesEnabled: false } as any,
    fetchFn: (async (input: string | URL | Request) => {
      assert.ok(String(input).startsWith('https://gdelt.test/'), 'unreadable completion history stops provider calls')
      if (fs.existsSync(database)) fs.renameSync(database, `${database}.held`)
      return new Response(JSON.stringify({ articles: [{ title: revision.headline, url: revision.url, domain: revision.domain, seendate: '20260920T065900Z' }] }))
    }) as typeof fetch,
  })
  assert.equal(failure.ok, false)
  assert.equal(failure.deferred_read_failed, true)
  assert.equal(failure.defer_reason, 'storage-emergency')
  assert.equal(failure.groq_requests, 0)
  assert.equal(fs.existsSync(database), false, 'missing authority is not rebuilt from a compatibility file')
  fs.renameSync(`${database}.held`, database)
  assert.equal(inspectDeferredBacklog(state).items.length, 2, 'existing retry work was preserved')
  console.log('terminal redelivery: completed/retired IDs stay terminal, revisions and active retries survive')
} finally { fs.rmSync(root, { recursive: true, force: true }) }
