import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import Fastify from 'fastify'
import { acquireRetainedFlock, releaseRetainedFlock } from '../src/singleton-lock'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-worker-weights-'))
process.env.ENGINE_STATE_DIR = path.join(root, 'state')
const { readDiscoveryCatalog, readDiscoverySnapshotSafely, registerIdeasWorkspace } = await import('../src/news/ideas/ideas-workspace')
const { saveRankWeights, resetRankWeights } = await import('../src/news/rank-weights')
const { rankScore } = await import('../src/news/rank')
const now = new Date()
try {
  resetRankWeights()
  const item = { kind: 'item', event_id: 'EVT-worker-weight', headline: 'Central bank updates its economic outlook',
    url: 'https://example.test/outlook', source_name: 'Example', domain: 'example.test', found_at: now.toISOString(), ts: now.toISOString(),
    input_nature: 'news_headline', materiality_pre_score: 60, issuer_linkage: 'macro', scope: 'macro', event_types: ['macro_sector'], companies: [], size_bucket: 'unknown', band: 'watch' }
  const ranked = rankScore(item, now)
  const file = path.join(root, 'screener/inbox', `${now.toISOString().slice(0, 10)}_firehose.ndjson`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify({ ...item, triage_score: ranked.rank_score, rank_factors: ranked.rank_factors })}\n`)
  const read = async () => {
    const local = readDiscoveryCatalog(root).cards
    const worker = (await readDiscoverySnapshotSafely(root)).catalog.cards
    assert.deepEqual(worker, local, 'worker uses the main process active weights without a restart')
    return worker
  }
  const original = await read()
  assert.equal(original.length, 1)
  saveRankWeights({ source_tier: { news: 50 }, boost_weight: 2 })
  assert.ok((await read())[0].priority > original[0].priority)
  saveRankWeights({ source_tier: { news: -50 } })
  assert.equal((await read()).length, 0, 'a live weight change can move a report into the drop band')
  resetRankWeights()
  assert.equal((await read())[0].priority, original[0].priority)
  const app = Fastify()
  let lease: number | null = null
  try {
    registerIdeasWorkspace(app, root)
    const lock = path.join(root, 'screener/ledger/idea-workspace-actions.ndjson.lock')
    fs.mkdirSync(path.dirname(lock), { recursive: true })
    lease = await acquireRetainedFlock(lock, { waitMs: 0, busyMessage: 'fixture' })
    const beforeEdit = app.inject('/api/screener/idea-workspace?lane=events').then((response) => response)
    await new Promise((resolve) => setTimeout(resolve, 100))
    saveRankWeights({ source_tier: { news: 50 }, boost_weight: 2 })
    const afterEdit = app.inject('/api/screener/idea-workspace?lane=events&refresh=1').then((response) => response)
    await new Promise((resolve) => setTimeout(resolve, 100))
    releaseRetainedFlock(lease)
    lease = null
    const [before, after] = await Promise.all([beforeEdit, afterEdit])
    assert.equal(before.statusCode, 200)
    assert.equal(after.statusCode, 200)
    assert.equal(before.json().rows[0].priority, original[0].priority)
    assert.ok(after.json().rows[0].priority > original[0].priority, 'explicit refresh must not reuse a pending pre-edit snapshot')
    const cached = await app.inject('/api/screener/idea-workspace?lane=events')
    assert.equal(cached.json().rows[0].priority, after.json().rows[0].priority, 'a superseded read cannot overwrite the refreshed cache')
  } finally {
    if (lease !== null) releaseRetainedFlock(lease)
    await app.close()
  }
  console.log('Ideas worker: runtime scoring edits and reset retain main-thread score/band/filter parity')
} finally { fs.rmSync(root, { recursive: true, force: true }) }
