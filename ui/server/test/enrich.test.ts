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
import { bestFallbackSummary, corroboratesSameEvent, enrichEvent, extractReadable, isEnrichmentComplete, listCoveredTickers, scrubParties, type EventEnrichment } from '../src/news/enrich'
import { resetGdeltBackoff } from '../src/news/sources/gdelt'
import type { ArticleReadProvider } from '../src/news/triage/article-read'
import type { ArticleBrief } from '../src/news/triage/groq'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- pure: scrubParties drops non-tradable groups in BOTH the named and inferred paths ----
await check('scrubParties keeps tradable sectors/firms, drops non-tradable groups (the "World Cup soccer team" backstop)', () => {
  const kept = scrubParties([
    { name: 'Reliance Industries', named_in_article: true, mechanism: 'higher refining margins' }, // named firm → kept
    { name: 'oil & gas producers', named_in_article: false, mechanism: 'higher crude realisations' }, // tradable sector → kept
    { name: 'Indian private banks', named_in_article: false, mechanism: 'wider NIMs' }, // tradable sector → kept
    { name: 'gold', named_in_article: false, mechanism: 'safe-haven bid' }, // tradable asset → kept
    { name: 'Iranian World Cup soccer team', named_in_article: false, mechanism: 'missed the finals' }, // non-tradable → dropped
    { name: 'taxpayers', named_in_article: false, mechanism: 'foot the bill' }, // population → dropped
    { name: 'the Federal Reserve', named_in_article: false, mechanism: 'sets the rate' }, // rate-setter → dropped
    { name: 'India', named_in_article: true, mechanism: 'country, not a firm' }, // named non-firm → dropped by isCompanyName
  ])
  const names = kept.map((p) => p.name)
  assert.deepEqual(names, ['Reliance Industries', 'oil & gas producers', 'Indian private banks', 'gold'])
})

// ---- regression: an INFERRED non-tradable party caught ONLY by the entity denylist (not the
// NON_TRADABLE_PARTY_RE backstop) must be dropped too. Pre-fix, the inferred path short-circuited past
// isCompanyName (`!named_in_article || isCompanyName`), so a country / index / rate / regulator / named
// individual emitted as an inferred group sailed straight through — the prompt's INVESTABILITY GATE
// (groq.ts ARTICLE_SYSTEM: "NEVER list a country, a government, a central bank, a regulator, a market
// index, or a rate") + CLAUDE.md §24 say all of these must be dropped. ----
await check('scrubParties drops INFERRED denylist entities the regex backstop does not enumerate (Fed/index/rate/person)', () => {
  const kept = scrubParties([
    { name: 'gold', named_in_article: false, mechanism: 'safe-haven bid' }, // tradable asset → kept (control)
    { name: 'the Fed', named_in_article: false, mechanism: 'sets the rate' }, // abbrev not in the regex → denylist → dropped
    { name: 'India', named_in_article: false, mechanism: 'sovereign' }, // inferred country → dropped
    { name: 'S&P 500', named_in_article: false, mechanism: 'index level' }, // index → dropped
    { name: 'SOFR', named_in_article: false, mechanism: 'reference rate' }, // rate → dropped
    { name: 'Donald Trump', named_in_article: false, mechanism: 'policy' }, // person → dropped
    { name: 'European Commission', named_in_article: false, mechanism: 'antitrust' }, // regulator → dropped
  ])
  assert.deepEqual(kept.map((p) => p.name), ['gold'])
})

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
  beneficiaries: [], exposed: [{ name: 'Tilray Brands', named_in_article: true, mechanism: 'persistent unprofitability' }], theme: 'earnings_revenue_margin',
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

// ---- readability extraction: the no-LLM guarantee that a fetched page yields real prose ----

await check('extractReadable: keeps the article paragraphs, drops nav/footer/cookie chrome', () => {
  const html = '<html><body><nav><p>Home About Contact</p></nav>' +
    '<script type="text/javascript">var leak = "EVIL_SCRIPT_TEXT should never reach the reader.";</script\t\n bar>' + // junk-trailing end tag browsers still accept
    '<article>' +
    '<p>Vantage Drilling shareholders approved the $257.6 million all-cash takeover by Eldorado Drilling at a special meeting in Bermuda.</p>' +
    '<p>The transaction is expected to close in the third quarter of 2026, subject to customary conditions.</p>' +
    '<p>We use cookies to improve your experience on this site.</p>' +
    '</article><footer><p>All rights reserved 2026.</p></footer></body></html>'
  const out = extractReadable(html)
  assert.ok(out.includes('$257.6 million') && out.includes('third quarter'), `keeps the real article prose, got: ${out}`)
  assert.ok(!/cookies|rights reserved|Home About/i.test(out), `drops nav/cookie/footer boilerplate, got: ${out}`)
  assert.ok(!/EVIL_SCRIPT_TEXT/.test(out), `strips script even with a junk-trailing end tag </script\\t\\n bar>, got: ${out}`)
})

await check('bestFallbackSummary: real article prose beats a vague og:description dek', () => {
  const html = '<html><head><meta property="og:description" content="One theme today."></head><body>' +
    '<p>Vantage Drilling shareholders approved a $257.6 million cash takeover by Eldorado Drilling, with the deal set to close in the third quarter of 2026.</p></body></html>'
  const out = bestFallbackSummary(html, '', { headline: 'Vantage votes on merger' }, false)
  assert.ok(out.includes('$257.6 million'), `surfaces the real article lede, got: ${out}`)
})

// ---- corroboration same-event gate (pure): the §3 guard against false cross-outlet confidence ----
await check('corroboratesSameEvent: rejects a DIFFERENT event about the same company, accepts the genuine one', () => {
  const tilray = [{ name: 'Tilray', ticker: 'TLRY', listing_country: 'US' }] as any
  const lawsuit = 'Tilray sued by shareholders over disclosure fraud'
  assert.equal(corroboratesSameEvent(lawsuit, tilray, 'Tilray Q3 sales reach $206.7M but stays unprofitable'), false) // same company, DIFFERENT event
  assert.equal(corroboratesSameEvent(lawsuit, tilray, 'Tilray faces a shareholder lawsuit over disclosure failures'), true) // same event
})
await check('corroboratesSameEvent: a short company name matches WHOLE-WORD only (no "itc" inside "switch")', () => {
  const itc = [{ name: 'ITC', ticker: null, listing_country: 'IN' }] as any
  const div = 'ITC raises its dividend payout'
  assert.equal(corroboratesSameEvent(div, itc, 'Companies switch dividend strategy amid payout pressure'), false) // "itc" only inside "switch" → not the company
  assert.equal(corroboratesSameEvent(div, itc, 'ITC hikes its dividend in a surprise payout move'), true) // "ITC" as a real word
})
await check('corroboratesSameEvent: a macro (no-company) story needs ≥2 distinctive tokens, not one', () => {
  const macro = 'Federal Reserve holds interest rates steady, signals patience'
  assert.equal(corroboratesSameEvent(macro, [], 'European Central Bank cuts rates as inflation cools'), false) // a different central bank
  assert.equal(corroboratesSameEvent(macro, [], 'Federal Reserve keeps interest rates unchanged in June'), true) // same event
})

// ---- corroboration: a blocked publisher is pieced together from the secondary wire ----

const SECONDARIES = [
  { domain: 'reuters.com', title: 'Tilray international cannabis revenue jumps 73% in fiscal third quarter', url: 'https://www.reuters.com/a' },
  { domain: 'benzinga.com', title: 'Tilray Q3 sales reach $206.7M but the company stays unprofitable', url: 'https://www.benzinga.com/b' },
  { domain: 'globenewswire.com', title: 'Tilray Brands reports record international growth, narrower loss', url: 'https://www.globenewswire.com/c' },
]
const CORROB_BRIEF: ArticleBrief = {
  gist: ['Tilray international cannabis revenue grew 73%; Q3 sales were $206.7M and the company remains unprofitable.'],
  companies: [{ name: 'Tilray Brands', ticker: 'TLRY', role: 'subject', listing_country: 'United States', exchange: 'NASDAQ' }],
  beneficiaries: [], exposed: [], theme: 'earnings_revenue_margin',
}
// a fetch that BLOCKS the source page (403), serves the GDELT keyword query, and (optionally) an LLM brief
function makeCorroborFetch(secondaries: { domain: string; title: string; url: string }[], brief: ArticleBrief | null): typeof fetch {
  return (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      if (!brief) return new Response('{}', { status: 503 }) // no LLM capacity
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(brief) }, finish_reason: 'stop' }], usage: { total_tokens: 120 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.includes('gdelt.test')) {
      return new Response(JSON.stringify({ articles: secondaries.map((s) => ({ url: s.url, domain: s.domain, title: s.title, seendate: '20260619T120000Z' })) }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response('blocked', { status: 403 }) // the publisher refuses the direct read
  }) as typeof fetch
}
const CORROBORATE = { enabled: true, baseUrl: 'https://gdelt.test/api/v2/doc/doc' }

await check('corroboration: a blocked publisher is synthesised from the secondary wire (with LLM) and flagged', async () => {
  resetGdeltBackoff()
  const { repoRoot, stateDir } = tmpRepo('') // no snippet → no body → the block path
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn: makeCorroborFetch(SECONDARIES, CORROB_BRIEF), corroborate: CORROBORATE })
  assert.ok(r.gist && r.gist.length, 'synthesised a gist from the secondary wire')
  assert.ok(r.gist![0].includes('$206.7M'), `the gist carries the corroborated facts, got: ${r.gist}`)
  assert.ok(r.corroborated && r.corroborated.count >= 2, `flagged corroborated with the outlet count, got: ${JSON.stringify(r.corroborated)}`)
  assert.ok(r.corroborated!.domains.some((d) => d === 'reuters.com'), `names the corroborating outlets, got: ${JSON.stringify(r.corroborated)}`)
})

await check('corroboration: no LLM budget → still names the corroborating outlets (beats the bare floor)', async () => {
  resetGdeltBackoff()
  const { repoRoot, stateDir } = tmpRepo('')
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [], fetchFn: makeCorroborFetch(SECONDARIES, null), corroborate: CORROBORATE })
  assert.ok(r.corroborated && r.corroborated.count >= 2, 'flagged corroborated even without an LLM')
  assert.ok(r.summary && /other outlet/i.test(r.summary) && /reporting this/i.test(r.summary), `the summary names the corroboration, got: ${r.summary}`)
  assert.ok(!r.gist?.length, 'never a fabricated gist without an LLM read')
})

await check('corroboration: a single outlet is NOT corroboration — the honest floor stands', async () => {
  resetGdeltBackoff()
  const { repoRoot, stateDir } = tmpRepo('')
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn: makeCorroborFetch([SECONDARIES[0]], CORROB_BRIEF), corroborate: CORROBORATE })
  assert.ok(!r.corroborated, 'one outlet does not clear the ≥2 corroboration bar')
  assert.ok(r.summary && /headline/i.test(r.summary), `keeps the deterministic headline floor, got: ${r.summary}`)
})

await check('corroboration: the blocked publisher is excluded from its own corroboration (no self-counting)', async () => {
  resetGdeltBackoff()
  const { repoRoot, stateDir } = tmpRepo('') // the event url is www.fool.com → that publisher blocked us
  const withSelf = [{ domain: 'www.fool.com', title: 'The blocked publisher reporting its own blocked story here', url: 'https://www.fool.com/self' }, ...SECONDARIES]
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [], fetchFn: makeCorroborFetch(withSelf, null), corroborate: CORROBORATE })
  assert.ok(r.corroborated, 'corroborated from the OTHER outlets')
  assert.ok(!r.corroborated!.domains.some((d) => d === 'fool.com'), `the blocked publisher is never counted as its own corroboration, got: ${JSON.stringify(r.corroborated!.domains)}`)
  assert.ok(r.corroborated!.domains.some((d) => d === 'reuters.com'), 'genuine other outlets are kept')
})

await check('corroboration: a DIFFERENT event about the same company is NOT corroborated (same-event gate, §3)', async () => {
  resetGdeltBackoff()
  const { repoRoot, stateDir } = tmpRepo('') // event = the Tilray international-growth story
  // GDELT's loose query (company + a token, 14-day window, body match) pulls Tilray stories about an
  // UNRELATED event (a lawsuit) — same company, different event. Before the gate these were passed off as
  // "corroboration" and a growth story got a lawsuit brief; now they must be dropped → honest floor stands.
  const wrongEvent = [
    { domain: 'reuters.com', title: 'Tilray sued by investors over alleged accounting fraud', url: 'https://www.reuters.com/x' },
    { domain: 'benzinga.com', title: 'Tilray faces a shareholder lawsuit over disclosure failures', url: 'https://www.benzinga.com/y' },
  ]
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn: makeCorroborFetch(wrongEvent, CORROB_BRIEF), corroborate: CORROBORATE })
  assert.ok(!r.corroborated, `a different-event set must not corroborate, got: ${JSON.stringify(r.corroborated)}`)
  assert.ok(!r.gist?.length, 'no fabricated gist synthesised from a different event')
  assert.ok(r.summary && /headline/i.test(r.summary), `falls back to the honest headline floor, got: ${r.summary}`)
})

// omitting the corroborate dep must leave the exact legacy floor behaviour — NOT the production default
// (production sets NEWS.enrichCorroborate ON unless NEWS_ENRICH_CORROBORATE=0; server.ts always passes it).
await check('corroboration: omitting the corroborate dep leaves the legacy floor untouched (function default off)', async () => {
  resetGdeltBackoff()
  const { repoRoot, stateDir } = tmpRepo('')
  const r = await enrichEvent({ event_id: EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn: makeCorroborFetch(SECONDARIES, CORROB_BRIEF) })
  assert.ok(!r.corroborated, 'corroboration never runs unless explicitly enabled by the caller')
  assert.ok(r.complete === true && r.summary && /headline/i.test(r.summary), 'the no-body floor is accepted as final, exactly as before')
})

// ---- listCoveredTickers: the batch-review "portfolio companies" proxy ----
await check('listCoveredTickers: real <TICKER>_<date> run folders are picked up, non-ticker aggregate folders (eval/performance/portfolio/tracking) are not', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'covered-test-'))
  const analyses = path.join(root, 'analyses')
  for (const d of ['BG_2026-05-11', 'BG_2026-06-01', 'tmcv_2026-06-07', 'eval', 'performance', 'portfolio', 'tracking']) {
    fs.mkdirSync(path.join(analyses, d), { recursive: true })
  }
  assert.deepEqual(listCoveredTickers(root), ['BG', 'TMCV'])
})
await check('listCoveredTickers: a missing analyses/ dir returns [] and never throws', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'covered-empty-'))
  assert.deepEqual(listCoveredTickers(root), [])
})

console.log(`\n${passed} checks passed`)
