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

function tmpRepo(snippet: string = SNIPPET): { repoRoot: string; stateDir: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-test-'))
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  const item = {
    kind: 'item', event_id: EVENT_ID, ts: NOW_ISO,
    headline: 'Tilray Is Growing 73% Internationally. Is That a Mistake?',
    url: 'https://www.fool.com/investing/2026/06/14/tilray/', source_name: 'The Motley Fool',
    region: 'US', input_nature: 'news_headline', snippet,
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
// a provider whose daily budget is exhausted (cap 0) → readArticleBrief SKIPS it without any LLM call
// (attempted=false). Models the exact provider-saturation that caused the original bug.
const SKIP_PROVIDER: ArticleReadProvider = { ...PROVIDER, id: 'skip', budgetFile: 'skip-budget.json', limiter: 'skip', dailyReqCap: 0, dailyTokenCap: 0 }
// a fetch that 403s the article page (no body) and is never asked for an LLM read
const fetchPage403: typeof fetch = (async () => new Response('blocked', { status: 403 })) as typeof fetch
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

// ---- regression tests for the adversarial-review findings ----

await check('regression(F1): a SKIP (provider saturated, no LLM call) never counts as a read attempt or freezes the article', async () => {
  const { repoRoot, stateDir } = tmpRepo() // readable body (snippet present)
  let last: EventEnrichment | null = null
  // even after MANY skips, the read must stay degraded (short TTL → self-heals when capacity returns),
  // NOT promote to complete=true on the floor — that was the exact saturation that caused the original bug.
  for (let i = 0; i < 4; i++) last = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [SKIP_PROVIDER], fetchFn: makeFetch(GOOD_BRIEF) })
  assert.equal(last!.complete, false, 'a pure skip never accepts the floor as final')
  assert.equal(last!.degraded, true, 'stays degraded so it keeps retrying')
  assert.ok(!last!.read_attempts, `skips do not increment read_attempts (got ${last!.read_attempts})`)
  assert.ok(last!.summary && last!.summary.includes('$206.7 million'), 'still shows the rich lede while degraded')
})

await check('regression(F4/F5): a no-readable-body article (unfetchable page, no snippet) converges to complete (no infinite churn)', async () => {
  const { repoRoot, stateDir } = tmpRepo('') // NO snippet
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn: fetchPage403 })
  assert.equal(r.complete, true, 'no body to ever read → floor accepted as final (stops the heal pass churning it)')
  assert.equal(r.degraded, false, 'not flagged degraded')
  assert.ok(r.summary && /headline/i.test(r.summary), `shows the honest floor restatement, got: ${r.summary}`)
})

await check('regression(F2): a short vague og:description dek never out-ranks the honest floor', () => {
  const dekHtml = '<html><head><meta property="og:description" content="There is one overriding theme you cannot ignore."></head><body><p>x</p></body></html>'
  const out = bestFallbackSummary(dekHtml, '', { headline: 'Tilray Is Growing 73% Internationally. The Market Is Paying Almost No Attention. Is That a Mistake?' }, false)
  assert.ok(!/one overriding theme/i.test(out), `the vague dek must not be the story, got: ${out}`)
  assert.ok(/headline/i.test(out), 'falls back to the honest headline restatement when there is no real lede')
})

await check('e2e: a multi-word EDGAR form (SC 13D) gets the FULL code + meaning, not the truncated "SC"', async () => {
  // parseSecFiling's form regex stops at the first space → "Form SC 13D" parses to "SC" (no dictionary
  // meaning). The headline carries the full code, so the reader must still get "SC 13D" + its meaning.
  const headline = 'SC 13D - SOME ACQUIRER LLC (0001234567) (Filer)'
  const url = 'https://www.sec.gov/Archives/edgar/data/1234567/000123456726000001/0001234567-26-000001-index.html'
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-edgar-'))
  fs.mkdirSync(path.join(root, 'screener', 'inbox'), { recursive: true })
  const item = { kind: 'item', event_id: EVENT_ID, ts: NOW_ISO, headline, url, source_name: 'SEC EDGAR', region: 'US', input_nature: 'news_headline', snippet: '', companies: [{ name: 'Some Acquirer LLC', ticker: null, listing_country: 'US' }], event_types: ['capital_actions'], triage_score: 90 }
  fs.writeFileSync(path.join(root, 'screener', 'inbox', `${TODAY}_firehose.ndjson`), JSON.stringify(item) + '\n')
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-edgar-state-'))
  // an EDGAR index page whose formName div carries the FULL multi-word code "Form SC 13D"
  const indexHtml = '<html><body><div id="formName"><strong>Form SC 13D</strong> - Statement of beneficial ownership</div></body></html>'
  const fetchFn = (async (input: any) => {
    const u = String(input?.url || input)
    if (u.includes('/chat/completions')) return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    return new Response(indexHtml, { status: 200, headers: { 'content-type': 'text/html' } })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot: root, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  assert.ok(r.sec, 'an sec block was produced')
  assert.equal(r.sec!.form, 'SC 13D', 'the FULL multi-word code, not the truncated "SC"')
  assert.ok(r.sec!.form_meaning && /stake|5%|activist/i.test(r.sec!.form_meaning), `carries the plain-English meaning: ${r.sec!.form_meaning}`)
})

console.log(`\n${passed} checks passed`)
