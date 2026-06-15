// THE STORY anti-poisoning layer (news/enrich.ts). The reader reads an article body with a free LLM and
// leads with its substance. A transient miss must NOT freeze a useless dek for 12h: a degraded read is
// flagged (short TTL → self-heals), the fallback shows the MOST substantial text we hold (the RSS lede,
// not the og:description dek), a good read is NEVER clobbered by a later miss, and after MAX attempts the
// floor is accepted as final so an unreadable article isn't re-read forever. This proves all of that.
// Run: npx tsx test/enrich.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { bestFallbackSummary, enrichEvent, isEnrichmentComplete, type EventEnrichment } from '../src/news/enrich'
import type { ArticleReadProvider } from '../src/news/triage/article-read'
import type { ArticleBrief } from '../src/news/triage/groq'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- pure: completeness classification (drives the TTL tier) ----
await check('isEnrichmentComplete: a rich brief / SEC parse / accepted floor is complete; a thin summary is not', () => {
  assert.equal(isEnrichmentComplete({ gist: ['x'] } as EventEnrichment), true, 'gist → complete')
  assert.equal(isEnrichmentComplete({ companies: [{ name: 'Acme', ticker: null, role: 'subject', listing_country: null, exchange: null }] } as any), true, 'companies → complete')
  assert.equal(isEnrichmentComplete({ sec: { form: '8-K', items: [] } } as any), true, 'sec → complete')
  assert.equal(isEnrichmentComplete({ complete: true } as EventEnrichment), true, 'explicit complete (accepted floor) → complete')
  assert.equal(isEnrichmentComplete({ summary: 'a thin dek' } as EventEnrichment), false, 'summary-only → DEGRADED (short TTL)')
  assert.equal(isEnrichmentComplete({} as EventEnrichment), false, 'empty → degraded')
})

// ---- pure: the fallback prefers the substantial RSS lede over the vague og:description dek ----
await check('bestFallbackSummary: the richer RSS lede beats the short og:description dek', () => {
  const dekHtml = '<html><head><meta property="og:description" content="There is one overriding theme you cannot ignore here."></head><body><p>x</p></body></html>'
  const richLede =
    'When Tilray announced fiscal third-quarter 2026 earnings it highlighted the most positive things it could. ' +
    'International cannabis revenue grew 73% but is only 12% of the total $206.7 million in sales, and the company remains unprofitable.'
  const out = bestFallbackSummary(dekHtml, richLede, { headline: 'Tilray Q3' }, false)
  assert.ok(out.includes('$206.7 million'), `should surface the substantive lede, got: ${out}`)
  assert.ok(!/one overriding theme/i.test(out), 'should NOT headline the vague marketing dek')
})
await check('bestFallbackSummary: a bodyless filing goes straight to the deterministic floor', () => {
  const out = bestFallbackSummary('', '', { headline: 'ACME LTD: Outcome of Board Meeting', input_nature: 'exchange_announcement', source_tier: 'primary_filing', domain: 'www.bseindia.com', url: 'https://www.bseindia.com/x.pdf' }, true)
  assert.ok(/ACME LTD/i.test(out) && /Board Meeting/i.test(out), `filing floor should restate the disclosure, got: ${out}`)
})

// ---- e2e harness: a temp repo + state dir, an in-firehose event, a controllable LLM provider ----
// Use REAL time so the cache's freshness checks (which compare against Date.now()) behave as in production,
// and date the firehose file to "today" so readFeed's 2-day window always finds it regardless of run date.
const TODAY = new Date().toISOString().slice(0, 10)
const NOW_ISO = new Date().toISOString()
const EVENT_ID = 'EVT-test-tilray'
const SNIPPET =
  'When Tilray announced fiscal third-quarter 2026 earnings it highlighted the most positive things it could. ' +
  'International cannabis revenue grew 73% but is only 12% of total revenue, and the company remains unprofitable at $206.7 million in sales.'
const PAGE_HTML = '<html><head><meta property="og:description" content="There is one overriding theme you cannot ignore."><meta property="article:published_time" content="2026-06-14T10:45:00Z"></head><body><p>short</p></body></html>'

function tmpRepo(): { repoRoot: string; stateDir: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-test-'))
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  const item = {
    kind: 'item', event_id: EVENT_ID, ts: NOW_ISO,
    headline: 'Tilray Is Growing 73% Internationally. Is That a Mistake?',
    url: 'https://www.fool.com/investing/2026/06/14/tilray/', source_name: 'The Motley Fool',
    region: 'US', input_nature: 'news_headline', snippet: SNIPPET,
    companies: [{ name: 'Tilray', ticker: 'TLRY', listing_country: 'US' }], event_types: ['earnings_revenue_margin'], triage_score: 98,
  }
  fs.writeFileSync(path.join(inbox, `${TODAY}_firehose.ndjson`), JSON.stringify(item) + '\n')
  return { repoRoot: root, stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-state-')) }
}

const GOOD_BRIEF: ArticleBrief = {
  gist: ['Tilray reported $206.7M in Q3 sales; international cannabis grew 73% but is only 12% of revenue.', 'The company remains unprofitable.'],
  companies: [{ name: 'Tilray Brands', ticker: 'TLRY', role: 'subject', listing_country: 'United States', exchange: 'NASDAQ' }],
  beneficiaries: [], exposed: [{ name: 'Tilray Brands', named_in_article: true, basis: 'persistent unprofitability' }], theme: 'earnings_revenue_margin',
}
const EMPTY_BRIEF: ArticleBrief = { gist: [], companies: [], beneficiaries: [], exposed: [], theme: '' }

// A fetch that serves the article page for any non-LLM URL and a configurable brief for the LLM endpoint.
function makeFetch(brief: ArticleBrief): typeof fetch {
  return (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      const body = JSON.stringify({ choices: [{ message: { content: JSON.stringify(brief) }, finish_reason: 'stop' }], usage: { total_tokens: 120 } })
      return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response(PAGE_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
  }) as typeof fetch
}

// an isolated provider (its own named limiter + budget file) with headroom so the limiter never blocks the test
const PROVIDER: ArticleReadProvider = {
  id: 'test', kind: 'openai', apiKey: 'k', baseUrl: 'https://provider.test', model: 'm', maxTokens: 900,
  rpm: 10_000, tpm: 100_000_000, dailyReqCap: 1_000_000, dailyTokenCap: 1_000_000_000, budgetFile: 'test-budget.json', limiter: 'test',
}
const baseDeps = (repoRoot: string, stateDir: string, brief: ArticleBrief) => ({
  repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn: makeFetch(brief),
})

await check('e2e: a good read is complete, carries the gist, and is not degraded', async () => {
  const { repoRoot, stateDir } = tmpRepo()
  const r = await enrichEvent({ event_id: EVENT_ID }, baseDeps(repoRoot, stateDir, GOOD_BRIEF))
  assert.ok(r.gist && r.gist.length, 'has gist')
  assert.equal(isEnrichmentComplete(r), true, 'complete')
  assert.equal(r.complete, true, 'complete flag stamped explicitly (client gates refetch on this)')
  assert.equal(r.degraded, false, 'not flagged degraded')
  assert.equal(r.read_attempts, 1, 'one read attempt recorded')
})

await check('e2e: a missed read is DEGRADED, shows the rich lede (not the dek), and is not frozen as final', async () => {
  const { repoRoot, stateDir } = tmpRepo()
  const r = await enrichEvent({ event_id: EVENT_ID }, baseDeps(repoRoot, stateDir, EMPTY_BRIEF))
  assert.equal(isEnrichmentComplete(r), false, 'a miss stays degraded → short TTL → self-heals')
  assert.equal(r.degraded, true, 'flagged degraded')
  assert.ok(r.summary && r.summary.includes('$206.7 million'), `degraded story shows the rich lede, got: ${r.summary}`)
  assert.ok(!/one overriding theme/i.test(r.summary || ''), 'never the vague dek when a richer lede exists')
})

await check('e2e: NO-CLOBBER — a later miss never replaces a good cached read (the backup guard)', async () => {
  const { repoRoot, stateDir } = tmpRepo()
  const good = await enrichEvent({ event_id: EVENT_ID }, baseDeps(repoRoot, stateDir, GOOD_BRIEF))
  assert.ok(good.gist?.length, 'first read good')
  // a force-refresh that momentarily misses must keep the good brief, not overwrite it with a degraded dek
  const after = await enrichEvent({ event_id: EVENT_ID }, baseDeps(repoRoot, stateDir, EMPTY_BRIEF))
  assert.ok(after.gist && after.gist.length, 'the good gist survives a later miss')
  assert.equal(isEnrichmentComplete(after), true, 'still complete after a miss')
  // and the on-disk cache still holds the good read
  const disk = JSON.parse(fs.readFileSync(path.join(stateDir, 'news-enrich-cache.json'), 'utf8'))
  assert.ok(disk[EVENT_ID]?.gist?.length, 'cache file preserved the good read')
})

await check('e2e: after MAX attempts a still-unreadable article accepts the floor as final (bounded retries)', async () => {
  const { repoRoot, stateDir } = tmpRepo()
  let last: EventEnrichment | null = null
  for (let i = 0; i < 3; i++) last = await enrichEvent({ event_id: EVENT_ID }, baseDeps(repoRoot, stateDir, EMPTY_BRIEF))
  assert.equal(last!.read_attempts, 3, 'three attempts counted')
  assert.equal(last!.complete, true, 'accepted as final after MAX_READ_ATTEMPTS (stops re-reading forever)')
  // the accepted floor still carries the substantive lede, not the dek
  assert.ok(last!.summary && last!.summary.includes('$206.7 million'), 'final floor keeps the rich lede')
})

await check('e2e: the cache writes a recoverable .bak backup on save', async () => {
  const { repoRoot, stateDir } = tmpRepo()
  await enrichEvent({ event_id: EVENT_ID }, baseDeps(repoRoot, stateDir, GOOD_BRIEF))
  await enrichEvent({ event_id: EVENT_ID }, baseDeps(repoRoot, stateDir, GOOD_BRIEF)) // second save → .bak is written from the prior good file
  assert.ok(fs.existsSync(path.join(stateDir, 'news-enrich-cache.bak.json')), 'a backup copy exists after a second save')
})

console.log(`\n${passed} checks passed`)
