process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assembleNewsChatContext, buildNewsChatPrompts, newsQueryTerms } from '../src/news/chat'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e}`)
    process.exitCode = 1
  }
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-'))
function item(id: string, ts: string, headline: string, company: string, score = 80): FeedItem {
  return {
    kind: 'item', ts, event_id: id, headline, url: `https://reuters.com/${id}`, domain: 'reuters.com',
    source_name: 'Reuters', via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: score,
    band: 'pick', triage_reason: 'Material company news.', relevance: 'material', event_types: ['commercial'],
    issuer_linkage: 'primary', companies: [{ name: company, ticker: company === 'Nvidia' ? 'NVDA' : null, listing_country: 'US' }],
    size_bucket: 'mega', scope: 'single_name', source_tier: 'news', dedup_status: 'new', inboxed: true,
  }
}
function writeDay(dir: string, date: string, rows: FeedItem[]) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), rows.map((r) => JSON.stringify(r)).join('\n') + '\n')
}

check('broad starter questions do not turn generic trading words into search filters', () => {
  assert.deepEqual(newsQueryTerms('What changed that may create a trade in the next 1–4 weeks?'), [])
  assert.deepEqual(newsQueryTerms('Show me second-order winners and losers.'), [])
  assert.deepEqual(newsQueryTerms('What looks new compared with history?'), [])
  assert.deepEqual(newsQueryTerms('What changed for Nvidia?'), ['nvidia'])
})

check('24h chat searches the full window and adds a matching older item as history', () => {
  const root = tmp()
  const archive = path.join(root, 'archive')
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-now-nvda', '2026-08-02T10:00:00Z', 'Nvidia signs a new supply agreement', 'Nvidia', 91),
    item('EVT-now-other', '2026-08-02T09:00:00Z', 'Another company opens a factory', 'Other Co', 82),
  ])
  writeDay(archive, '2026-05-01', [item('EVT-old-nvda', '2026-05-01T08:00:00Z', 'Nvidia discussed an earlier supply plan', 'Nvidia', 76)])
  const got = assembleNewsChatContext({ repoRoot: root, archiveDir: archive, window: '24h', question: 'What changed for Nvidia?', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.present, true)
  assert.equal(got.receipt.itemsSearched, 2)
  assert.equal(got.receipt.itemsMatched, 1)
  assert.equal(got.receipt.coverageStart, '2026-05-01')
  assert.ok(got.evidence.some((e) => e.ref === 'N1' && e.item.event_id === 'EVT-now-nvda'))
  assert.ok(got.evidence.some((e) => e.ref === 'H1' && e.item.event_id === 'EVT-old-nvda'))
  assert.match(got.context, /OLDER EVIDENCE/)
})

check('history chat reads both the local firehose and the archive mirror', () => {
  const root = tmp()
  const archive = path.join(root, 'archive')
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [item('EVT-new', '2026-08-02T10:00:00Z', 'Nvidia signs a new supply agreement', 'Nvidia', 91)])
  writeDay(archive, '2025-12-12', [item('EVT-old', '2025-12-12T10:00:00Z', 'Nvidia signs an older supply agreement', 'Nvidia', 73)])
  const got = assembleNewsChatContext({ repoRoot: root, archiveDir: archive, window: 'history', question: 'Show Nvidia supply news', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsSearched, 2)
  assert.equal(got.receipt.itemsMatched, 2)
  assert.equal(got.receipt.coverageStart, '2025-12-12')
  assert.equal(got.receipt.historicalEvidenceCount, 0)
  assert.equal(got.evidence.length, 2)
})

check('news prompt is closed-book, simple, cited, and allowed to reject a trade', () => {
  const assembled = { present: true, context: 'CURRENT EVIDENCE:\n[N1] test', evidence: [], receipt: { window: '24h' as const, label: 'last 24 hours', itemsSearched: 1, itemsMatched: 1, sourceCount: 1, evidenceCount: 1, historicalEvidenceCount: 0, coverageStart: '2026-08-02', coverageEnd: '2026-08-02', queryTerms: [] } }
  const p = buildNewsChatPrompts({ assembled, messages: [{ role: 'user', content: 'Any idea?' }] })
  assert.match(p.system, /very simple words/i)
  assert.match(p.system, /cite every news claim/i)
  assert.match(p.system, /no idea clears the bar/i)
  assert.match(p.user, /\[N1\]/)
})

console.log(`\n${passed} checks passed`)
