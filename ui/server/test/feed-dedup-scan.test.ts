// readFeed's dedup pass (withDedup) vs the maxScan cap (news/dedup.ts's assignDedupGroups only
// re-clusters the newest `maxScan` items of whatever page it's handed). Pins two things:
//   1. a row OUTSIDE the recomputation window keeps its own PERSISTED dedup_group instead of being
//      overwritten to its own event id (the PR #359 defect — this used to silently un-cluster a
//      syndicated pair that ingest-time clustering had already correctly grouped);
//   2. a caller reading a page LARGER than the wire-UI default (bridge-batch.ts's 12-hourly sweep) can
//      widen the scan via readFeed's `dedupMaxScan` override to cover its whole page.
// Run: npx tsx test/feed-dedup-scan.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readFeed } from '../src/news/feed'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-07-29T12:00:00Z')
const now = () => NOW
const minAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')

function mk(over: Partial<FeedItem> = {}): FeedItem {
  return {
    kind: 'item', ts: minAgo(0), event_id: 'EVT-000000000000',
    headline: 'placeholder headline', url: 'https://example.com/x', domain: 'example.com',
    source_name: 'Example', via: 'rss', region: 'OTHER', country: 'US', input_nature: 'news_headline',
    triage_score: 75, band: 'act', triage_reason: 'material', relevance: 'material', event_types: ['company'],
    issuer_linkage: 'direct', companies: [], size_bucket: 'unknown', source_tier: 'wire', scope: 'single_name',
    ...over,
  } as FeedItem
}

function writeRepo(items: FeedItem[]): { repo: string } {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'feed-dedup-scan-'))
  const dir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  const date = NOW.toISOString().slice(0, 10)
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), items.map((it) => JSON.stringify(it)).join('\n') + '\n')
  return { repo }
}

check('a row outside dedupMaxScan keeps its persisted dedup_group instead of being reset to its own id', () => {
  // Newest-first order matters: assignDedupGroups slices the FIRST `maxScan` of whatever order it's
  // handed, and readFeed hands it items newest-first. With dedupMaxScan=2, only the two newest below
  // get recomputed; the three older ones fall outside the scan.
  const newA = mk({ event_id: 'EVT-aaaaaaaaaaa1', ts: minAgo(0), headline: 'Distinct fresh story A' })
  const newB = mk({ event_id: 'EVT-aaaaaaaaaaa2', ts: minAgo(1), headline: 'Distinct fresh story B, unrelated' })
  // A syndicated pair that INGEST-TIME clustering already grouped (persisted dedup_group='cluster-old') —
  // both fall outside the maxScan=2 recomputation window.
  const oldCopyA = mk({ event_id: 'EVT-bbbbbbbbbbb1', ts: minAgo(10), headline: 'Old smelter outage story', dedup_group: 'cluster-old' } as any)
  const oldCopyB = mk({ event_id: 'EVT-bbbbbbbbbbb2', ts: minAgo(11), headline: 'Old smelter outage story, other outlet', source_name: 'Other Outlet', dedup_group: 'cluster-old' } as any)
  // An old row that was NEVER clustered at ingest (no persisted dedup_group) — must still degrade to its
  // own event id, same as before this fix, when there is nothing to preserve.
  const oldStandalone = mk({ event_id: 'EVT-ccccccccccc1', ts: minAgo(12), headline: 'Old unrelated single story' })

  const { repo } = writeRepo([newA, newB, oldCopyA, oldCopyB, oldStandalone])
  const snap = readFeed(repo, 1, { now, maxItems: 100, dedupMaxScan: 2 })
  const byId = new Map(snap.items.map((it) => [it.event_id, it]))

  assert.equal(byId.get(oldCopyA.event_id)!.dedup_group, 'cluster-old', 'outside the scan window, the PERSISTED group is kept')
  assert.equal(byId.get(oldCopyB.event_id)!.dedup_group, 'cluster-old', 'its syndicated partner keeps the SAME persisted group — still clustered together')
  assert.equal(
    byId.get(oldCopyA.event_id)!.dedup_group,
    byId.get(oldCopyB.event_id)!.dedup_group,
    'the syndicated pair remains one cluster — this is exactly what the pre-fix code broke',
  )
  assert.equal(byId.get(oldStandalone.event_id)!.dedup_group, oldStandalone.event_id, 'nothing persisted → safe fallback to its own id, unchanged')
  // the two newest rows WERE inside the scan window and got a real (possibly self) recomputed group
  assert.ok(byId.get(newA.event_id)!.dedup_group, 'recomputed rows still get a group')
  assert.ok(byId.get(newB.event_id)!.dedup_group)
})

check('without an override, readFeed still uses the NEWS.dedupMaxScan default (unchanged behaviour for existing callers)', () => {
  const a = mk({ event_id: 'EVT-ddddddddddd1', ts: minAgo(0), headline: 'Central bank raises interest rates by 50 basis points' })
  const b = mk({ event_id: 'EVT-ddddddddddd2', ts: minAgo(1), headline: 'Local bakery wins a regional pastry award' })
  const { repo } = writeRepo([a, b])
  const snap = readFeed(repo, 1, { now, maxItems: 100 }) // no dedupMaxScan passed
  const byId = new Map(snap.items.map((it) => [it.event_id, it]))
  // well within the default 1,500 scan — both get freshly recomputed (self) groups, same as before this change
  assert.equal(byId.get(a.event_id)!.dedup_group, a.event_id)
  assert.equal(byId.get(b.event_id)!.dedup_group, b.event_id)
})

console.log(`\n${passed} feed-dedup-scan checks passed`)
