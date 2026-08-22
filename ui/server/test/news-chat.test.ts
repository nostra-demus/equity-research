process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assembleNewsChatContext, buildNewsChatPrompts, newsQueryTerms } from '../src/news/chat'
import type { FeedItem } from '../src/news/types'

let passed = 0
let checks = Promise.resolve()
function check(name: string, fn: () => Promise<void> | void) {
  checks = checks.then(async () => {
    try {
      await fn()
      passed++
      console.log(`  ok  ${name}`)
    } catch (e: any) {
      console.error(`FAIL  ${name}\n      ${e?.stack || e}`)
      process.exitCode = 1
    }
  })
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'news-chat-'))
function item(id: string, ts: string, headline: string, company: string, score = 80): FeedItem {
  const tickers: Record<string, string> = { Nvidia: 'NVDA', Amazon: 'AMZN' }
  return {
    kind: 'item', ts, event_id: id, headline, url: `https://reuters.com/${id}`, domain: 'reuters.com',
    source_name: 'Reuters', via: 'rss', region: 'US', input_nature: 'news_headline', triage_score: score,
    band: 'pick', triage_reason: 'Material company news.', relevance: 'material', event_types: ['commercial'],
    issuer_linkage: 'primary', companies: [{ name: company, ticker: tickers[company] || null, listing_country: 'US' }],
    size_bucket: 'mega', scope: 'single_name', source_tier: 'news', dedup_status: 'new', inboxed: true,
  }
}
function writeDay(dir: string, date: string, rows: FeedItem[]) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${date}_firehose.ndjson`), rows.map((r) => JSON.stringify(r)).join('\n') + '\n')
}
function writeConcepts(root: string) {
  const dir = path.join(root, 'frameworks', 'retrieval')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'concepts.json'), JSON.stringify({ groups: [
    { id: 'amazon_web_services', terms: ['Amazon Web Services', 'AWS'] },
    { id: 'capital_expenditure', terms: ['capital spending', 'capex'] },
  ] }))
}

check('broad starter questions do not turn generic trading words into search filters', () => {
  assert.deepEqual(newsQueryTerms('What changed that may create a trade in the next 1–4 weeks?'), [])
  assert.deepEqual(newsQueryTerms('Show me second-order winners and losers.'), [])
  assert.deepEqual(newsQueryTerms('What looks new compared with history?'), [])
  assert.deepEqual(newsQueryTerms('What changed for Nvidia?'), ['nvidia'])
  assert.deepEqual(newsQueryTerms('What is the Amazon Bedrock growth rate? Show me all saved evidence and tell me if it is tradable.'), ['amazon', 'bedrock', 'growth', 'rate'])
  assert.deepEqual(newsQueryTerms('What do all saved news items say about Amazon Bedrock growth rate? Separate facts from inference and tell me what exact trade I should screen.'), ['amazon', 'bedrock', 'growth', 'rate'])
})

check('24h chat searches the full window and adds a matching older item as history', async () => {
  const root = tmp()
  const archive = path.join(root, 'archive')
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-now-nvda', '2026-08-02T10:00:00Z', 'Nvidia signs a new supply agreement', 'Nvidia', 91),
    item('EVT-now-other', '2026-08-02T09:00:00Z', 'Another company opens a factory', 'Other Co', 82),
  ])
  writeDay(archive, '2026-05-01', [item('EVT-old-nvda', '2026-05-01T08:00:00Z', 'Nvidia discussed an earlier supply plan', 'Nvidia', 76)])
  const got = await assembleNewsChatContext({ repoRoot: root, archiveDir: archive, window: '24h', question: 'What changed for Nvidia?', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.present, true)
  assert.equal(got.receipt.itemsSearched, 2)
  assert.equal(got.receipt.itemsMatched, 1)
  assert.equal(got.receipt.coverageStart, '2026-05-01')
  assert.ok(got.evidence.some((e) => e.ref === 'N1' && e.item.event_id === 'EVT-now-nvda'))
  assert.ok(got.evidence.some((e) => e.ref === 'H1' && e.item.event_id === 'EVT-old-nvda'))
  assert.match(got.context, /OLDER EVIDENCE/)
})

check('history chat reads both the local firehose and the archive mirror', async () => {
  const root = tmp()
  const archive = path.join(root, 'archive')
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [item('EVT-new', '2026-08-02T10:00:00Z', 'Nvidia signs a new supply agreement', 'Nvidia', 91)])
  writeDay(archive, '2025-12-12', [item('EVT-old', '2025-12-12T10:00:00Z', 'Nvidia signs an older supply agreement', 'Nvidia', 73)])
  const got = await assembleNewsChatContext({ repoRoot: root, archiveDir: archive, window: 'history', question: 'Show Nvidia supply news', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsSearched, 2)
  assert.equal(got.receipt.itemsMatched, 2)
  assert.equal(got.receipt.coverageStart, '2025-12-12')
  assert.equal(got.receipt.historicalEvidenceCount, 0)
  assert.equal(got.evidence.length, 2)
})

check('history uses data/NEWS-ARCHIVE even when NEWS_ARCHIVE_DIR is not set', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [item('EVT-new', '2026-08-02T10:00:00Z', 'Nvidia opens a new factory', 'Nvidia', 91)])
  writeDay(path.join(root, 'data', 'NEWS-ARCHIVE'), '2025-11-03', [item('EVT-old', '2025-11-03T10:00:00Z', 'Nvidia opened an older factory', 'Nvidia', 73)])
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Nvidia factory', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsSearched, 2)
  assert.equal(got.receipt.itemsMatched, 2)
  assert.equal(got.receipt.coverageStart, '2025-11-03')
  assert.ok(got.receipt.dataStores.includes('live wire'))
  assert.ok(got.receipt.dataStores.includes('saved archive'))
})

check('archive streaming drops an oversized corrupt row and continues with bounded memory', async () => {
  const root = tmp()
  const dir = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(dir, { recursive: true })
  const good = item('EVT-after-large-row', '2026-08-02T10:00:00Z', 'Nvidia opens a bounded archive test', 'Nvidia', 91)
  fs.writeFileSync(path.join(dir, '2026-08-02_firehose.ndjson'), `${JSON.stringify({ kind: 'item', junk: 'x'.repeat(1_050_000) })}\n${JSON.stringify(good)}\n`)
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Nvidia bounded archive', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsSearched, 1)
  assert.equal(got.evidence[0]?.item.event_id, 'EVT-after-large-row')
})

check('high-match archives keep exact scan counts while evidence and retained graph inputs stay bounded', async () => {
  const root = tmp()
  const rows = Array.from({ length: 2_500 }, (_, i) => item(
    `EVT-volume-${i}`,
    `2026-08-02T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`,
    `Nvidia archive volume match ${i}`,
    'Nvidia',
    50 + (i % 50),
  ))
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', rows)
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Nvidia archive volume', now: () => new Date('2026-08-03T00:00:00Z') })
  assert.equal(got.receipt.itemsSearched, 2_500)
  assert.equal(got.receipt.itemsMatched, 2_500)
  assert.ok(got.evidence.length <= 60)
  assert.ok(got.receipt.relationships.length <= 12)
})

check('an already-closed request aborts before archive retrieval starts', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [item('EVT-abort', '2026-08-02T10:00:00Z', 'Nvidia abort test', 'Nvidia')])
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(
    assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Nvidia', signal: controller.signal }),
    (error: any) => error?.name === 'AbortError',
  )
})

check('legacy firehose arrays and partial theme rows are normalized instead of crashing chat', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [{
    ...item('EVT-legacy', '2026-08-02T10:00:00Z', 'Amazon Bedrock adds a production feature', 'Amazon', 80),
    event_types: {} as any,
    companies: true as any,
  }])
  const board = path.join(root, 'screener', 'board')
  fs.mkdirSync(board, { recursive: true })
  fs.writeFileSync(path.join(board, 'themes_index.json'), JSON.stringify({
    generated_at: '2026-08-02T10:00:00Z', history_days: 1, counts: {},
    themes: [{ theme_id: 'partial', name: 'Amazon Bedrock', description: 'Partial legacy theme', tier: 'active', composite: 50, member_count: 1 }],
  }))
  const stateDir = path.join(root, 'ui', 'server', '.state')
  fs.mkdirSync(stateDir, { recursive: true })
  fs.writeFileSync(path.join(stateDir, 'news-enrich-cache.json'), JSON.stringify({
    'EVT-legacy': { summary: 'Amazon Bedrock saved read', gist: { text: 'not an array' }, companies: 'Amazon', beneficiaries: true, news_impact: { extracted_numbers: '50%' } },
  }))
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Amazon Bedrock', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.present, true)
  assert.equal(got.receipt.itemsMatched, 1)
  assert.deepEqual(got.evidence[0]?.item.event_types, [])
  assert.deepEqual(got.evidence[0]?.item.companies, [])
  assert.match(got.context, /Amazon Bedrock/)
})

check('all explicit named parts are required so Amazon-only and generic growth stories cannot pretend to answer Bedrock', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-amazon', '2026-08-02T10:00:00Z', 'Amazon reports faster AWS growth', 'Amazon', 65),
    item('EVT-other', '2026-08-02T11:00:00Z', 'OtherCo reports a record annual growth rate', 'OtherCo', 100),
  ])
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Amazon Bedrock growth rate', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsSearched, 2)
  assert.equal(got.receipt.itemsMatched, 0)
  assert.equal(got.evidence.length, 0)
  assert.equal(got.receipt.queryTermHits.amazon, 0)
  assert.equal(got.receipt.queryTermHits.bedrock, 0)
  assert.ok(!got.evidence.some((e) => e.item.event_id === 'EVT-other'))
})

check('answer-format words cannot replace a missing named product anchor', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-real-bedrock', '2026-08-02T10:00:00Z', 'Amazon Bedrock adds a production feature', 'Amazon', 70),
    item('EVT-shopping', '2026-08-02T11:00:00Z', 'Amazon marks down an emergency kit', 'Amazon', 100),
  ])
  const question = 'What do all saved news items say about Amazon Bedrock growth rate? Separate facts from inference and tell me what exact trade I should screen.'
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question, now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsMatched, 1)
  assert.equal(got.evidence[0]?.item.event_id, 'EVT-real-bedrock')
  assert.ok(!got.evidence.some((e) => e.item.event_id === 'EVT-shopping'))
})

check('saved article reads are searchable and are sent to the answer with the source citation', async () => {
  const root = tmp()
  const event = item('EVT-bedrock', '2026-08-02T10:00:00Z', 'Amazon launches a cloud update', 'Amazon', 72)
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [event])
  const stateDir = path.join(root, 'ui', 'server', '.state')
  fs.mkdirSync(stateDir, { recursive: true })
  fs.writeFileSync(path.join(stateDir, 'news-enrich-cache.json'), JSON.stringify({
    'EVT-bedrock': {
      event_id: 'EVT-bedrock',
      summary: 'Amazon said the Bedrock growth rate reached 50% in the saved article body.',
      gist: ['Bedrock usage rose as more customers moved AI work into production.'],
      news_impact: { extracted_numbers: ['50%'], why_it_matters: 'Faster use may support AWS revenue.' },
    },
  }))
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Amazon Bedrock growth rate', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsMatched, 1)
  assert.equal(got.receipt.queryTermHits.bedrock, 1)
  assert.ok(got.receipt.dataStores.includes('saved article reads'))
  assert.match(got.context, /saved article read: Amazon said the Bedrock growth rate reached 50%/)
  assert.match(got.context, /saved figures: 50%/)
})

check('news chat uses alias, typo, and exact ranking without hiding direct-text gaps', async () => {
  const root = tmp()
  writeConcepts(root)
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-exact', '2026-08-02T09:00:00Z', 'Amazon Bedrock growth accelerated', 'Amazon', 70),
    item('EVT-alias', '2026-08-02T10:00:00Z', 'Amazon Web Services growth accelerated', 'Amazon', 98),
  ])
  const exact = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Amazon Bedrock growth', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(exact.evidence[0]?.item.event_id, 'EVT-exact')
  assert.equal(exact.receipt.retrievalMode, 'hybrid')

  const alias = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'AWS growth', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.ok(alias.evidence.some((e) => e.item.event_id === 'EVT-alias'))
  assert.ok(alias.receipt.expandedTerms.aws?.includes('amazon web services'))

  const typo = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Amazon Bedrok growth', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(typo.receipt.queryTermHits.bedrok, 0)
  assert.equal(typo.receipt.retrievalTermHits.bedrok, 1)
  assert.ok(typo.evidence[0]?.whyMatched?.includes('fuzzy:bedrok→bedrock'))
})

check('a single misspelled named subject reaches fuzzy matching without a second exact anchor', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-nvidia-earnings', '2026-08-02T10:00:00Z', 'Nvidia reports quarterly earnings', 'Nvidia', 88),
    item('EVT-amazon-earnings', '2026-08-02T11:00:00Z', 'Amazon reports quarterly earnings', 'Amazon', 99),
  ])
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Nvdia earnings', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsSearched, 2)
  assert.equal(got.receipt.itemsMatched, 1)
  assert.equal(got.evidence[0]?.item.event_id, 'EVT-nvidia-earnings')
  assert.ok(got.evidence[0]?.whyMatched?.includes('fuzzy:nvdia→nvidia'))
})

check('sentence-leading instructions and question contractions do not become named-company anchors', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-nvidia-earnings', '2026-08-02T10:00:00Z', 'Nvidia reports quarterly earnings', 'Nvidia', 88),
    item('EVT-amazon-earnings', '2026-08-02T11:00:00Z', 'Amazon reports quarterly earnings', 'Amazon', 99),
  ])
  for (const question of [
    'Summarize Nvdia earnings',
    "What's happening with Nvdia?",
    'Please Summarize Nvdia earnings',
    "Please, What's happening with Nvdia?",
    'Please quickly Summarize Nvdia earnings',
  ]) {
    const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question, now: () => new Date('2026-08-02T12:00:00Z') })
    assert.equal(got.receipt.itemsMatched, 1, question)
    assert.equal(got.evidence[0]?.item.event_id, 'EVT-nvidia-earnings', question)
    assert.ok(got.evidence[0]?.whyMatched?.includes('fuzzy:nvdia→nvidia'), question)
  }
})

check('a sentence-leading instruction does not weaken explicit multiple-company anchors', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [
    item('EVT-amazon-only', '2026-08-02T10:00:00Z', 'Amazon reports quarterly earnings', 'Amazon', 99),
    item('EVT-nvidia-only', '2026-08-02T11:00:00Z', 'Nvidia reports quarterly earnings', 'Nvidia', 98),
  ])
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Please Summarize Amazon and Nvidia earnings', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.equal(got.receipt.itemsMatched, 0)
  assert.equal(got.evidence.length, 0)
})

check('cited graph expands only an explicitly saved beneficiary and ranks it as a strict trade-check candidate', async () => {
  const root = tmp()
  const first = item('EVT-bedrock-edge', '2026-08-02T10:00:00Z', 'Amazon launches a cloud AI update', 'Amazon', 93)
  const connected = item('EVT-nvidia-outlook', '2026-08-02T09:00:00Z', 'Nvidia raises its data-center outlook', 'Nvidia', 89)
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [first, connected])
  const stateDir = path.join(root, 'ui', 'server', '.state')
  fs.mkdirSync(stateDir, { recursive: true })
  fs.writeFileSync(path.join(stateDir, 'news-enrich-cache.json'), JSON.stringify({
    'EVT-bedrock-edge': { event_id: 'EVT-bedrock-edge', summary: 'Amazon Bedrock usage increased as customers moved AI workloads into production.', beneficiaries: [{ name: 'Nvidia', named_in_article: true, ticker: 'NVDA', listing: 'Nasdaq listed', listing_verified: true, mechanism: 'AI infrastructure demand', order: 'first' }] },
  }))
  const got = await assembleNewsChatContext({ repoRoot: root, window: 'history', question: 'Bedrock growth', now: () => new Date('2026-08-02T12:00:00Z') })
  assert.ok(got.receipt.relationships.some((r) => r.seed === 'bedrock' && r.related === 'Amazon'))
  assert.ok(got.evidence.some((e) => e.item.event_id === 'EVT-nvidia-outlook' && e.whyMatched?.some((x) => x.includes('saved beneficiary'))))
  const nvidia = got.receipt.tradeCandidates.find((c) => c.ticker === 'NVDA')
  assert.ok(nvidia, 'the cited saved beneficiary becomes a trade-check candidate')
  assert.ok(nvidia?.missingChecks.includes('price and market expectations'))
  assert.match(got.context, /Co-mention is not causation/i)
})

check('source failures are visible in the receipt and the model context', async () => {
  const root = tmp()
  writeDay(path.join(root, 'screener', 'inbox'), '2026-08-02', [item('EVT-one', '2026-08-02T10:00:00Z', 'Amazon Bedrock update', 'Amazon')])
  const got = await assembleNewsChatContext({
    repoRoot: root, window: 'history', question: 'Amazon Bedrock', now: () => new Date('2026-08-02T12:00:00Z'),
    sourceReport: {
      updated_at: '2026-08-02T12:00:00Z',
      counts: { total: 2, healthy: 1, quiet: 0, failing: 1, idle: 0 },
      sources: [
        { name: 'Reuters', region: 'US', feed_type: 'news', via: 'rss', health: 'healthy', last_data_at: '2026-08-02T10:00:00Z', items_24h: 1, items_7d: 1, fetch_status: 'ok', last_error: null, last_ok_at: '2026-08-02T12:00:00Z' },
        { name: 'Broken Wire', region: 'US', feed_type: 'news', via: 'rss', health: 'failing', last_data_at: null, items_24h: 0, items_7d: 0, fetch_status: 'error', last_error: 'timeout', last_ok_at: null },
      ],
    },
  })
  assert.match(got.receipt.coverageWarnings[0], /Broken Wire/)
  assert.match(got.context, /Results may be incomplete/)
})

check('news prompt is closed-book, simple, cited, and allowed to reject a trade', () => {
  const assembled = { present: true, context: 'CURRENT EVIDENCE:\n[N1] test', evidence: [], receipt: { window: '24h' as const, label: 'last 24 hours', itemsSearched: 1, itemsMatched: 1, sourceCount: 1, evidenceCount: 1, historicalEvidenceCount: 0, coverageStart: '2026-08-02', coverageEnd: '2026-08-02', queryTerms: [], queryTermHits: {}, retrievalTermHits: {}, expandedTerms: {}, retrievalMode: 'hybrid' as const, retrievalChannels: [], dataStores: ['live wire'], coverageWarnings: [], sourceHealth: null, semantic: null, rerank: null, relationships: [], tradeCandidates: [] } }
  const p = buildNewsChatPrompts({ assembled, messages: [{ role: 'user', content: 'Any idea?' }] })
  assert.match(p.system, /very simple words/i)
  assert.match(p.system, /cite every news claim/i)
  assert.match(p.system, /no idea clears the bar/i)
  assert.match(p.system, /zero hits/i)
  assert.match(p.system, /exact figure is missing/i)
  assert.match(p.user, /\[N1\]/)
  assert.match(p.user, /NEWS_CHAT_FINAL_QUESTION_CHARS:/)
})

check('news prompt carries exact prior-call learning into Screener wire chat without rewriting it', () => {
  const assembled = { present: true, context: 'CURRENT EVIDENCE:\n[N1] Amazon filed results', evidence: [], receipt: { window: '24h' as const, label: 'last 24 hours', itemsSearched: 1, itemsMatched: 1, sourceCount: 1, evidenceCount: 1, historicalEvidenceCount: 0, coverageStart: '2026-08-02', coverageEnd: '2026-08-02', queryTerms: [], queryTermHits: {}, retrievalTermHits: {}, expandedTerms: {}, retrievalMode: 'hybrid' as const, retrievalChannels: [], dataStores: ['live wire'], coverageWarnings: [], sourceHealth: null, semantic: null, rerank: null, relationships: [], tradeCandidates: [] } }
  const calls = [{
    ticker: 'AMZN', company: 'Amazon.com, Inc.', decision_date: '2026-07-10', original_decision: 'Watchlist',
    original_confidence: 72, original_price: 238.34, currency: 'USD', latest_review_date: '2026-08-09', latest_price: 274.48,
    price_change_pct: 15.16, benchmark_relative_pct: 11.49, thesis_status: 'broken', decision_quality: 'genuine miss',
    action_now: 'Keep watching' as const, action_reason: 'Re-run earnings before acting.', confidence_after: 45,
    confidence_reason: 'AWS margin expanded.', why_right_or_wrong: 'Nostra underestimated AWS growth.', error_taxonomy: ['bad base rate'],
    future_research_check: 'Recheck AWS growth and margin.', next_check_date: '2026-10-30', next_check_label: 'Q3 AWS check',
    source_path: 'analyses/AMZN_2026-07-10/reviews/2026-08-09_30d_decision_review.json',
  }]
  const p = buildNewsChatPrompts({ assembled, messages: [{ role: 'user', content: 'What changed?' }], calls })
  assert.match(p.system, /Begin with one short paragraph labelled "Memory check:"/)
  assert.match(p.system, /Never call Watchlist, Avoid, or Stay away an entry call/)
  assert.match(p.user, /FROZEN ORIGINAL: Nostra rated it Watchlist/)
  assert.match(p.user, /RECHECK NOW: Recheck AWS growth and margin/)
})

await checks
console.log(`\n${passed} checks passed`)
