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
// ---- the Adani-QIP defect: a BSE/NSE- or PDF-attachment filing whose PDF read but the LLM missed. The
// document opening we hold is cover-page LETTERHEAD (address / CIN / phone / scrip codes), longer and
// prose-like — the old "longest wins" ranking surfaced THAT over the parsed subject. filingIsAttachment=true
// (the disclosure is a BSE/NSE or PDF attachment) must force the headline floor.
await check('bestFallbackSummary: an attachment-filing letterhead lede never outranks the headline floor', () => {
  const letterhead =
    'Adani Enterprises Limited Am Shantigram, Near Vaishno Devi Circle, S. G. Highway, Khodiyar Ahmedabad 382421 Gujarat, ' +
    'India Tel +91 79 2656 5555 Fax +91 79 2555 5500 investor.ael@adani.com www.adanienterprises.com CIN L51100GJ1993PLC019067 ' +
    'Registered Office BSE Limited P J Towers, Dalal Street, Mumbai 400001 Scrip Code 512599 Scrip Code ADANIENT'
  const filingInput = {
    headline: 'Adani Enterprises Ltd: Allotment of Equity Share to Eligible Qualified Institutional Investors',
    input_nature: 'exchange_announcement', source_tier: 'primary_filing', domain: 'www.bseindia.com',
    url: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/abc123.pdf',
  }
  const out = bestFallbackSummary('', letterhead, filingInput, false, true) // not bodyless (PDF read), but a BSE attachment filing
  assert.ok(/Adani Enterprises Ltd/i.test(out), `names the issuer, got: ${out}`)
  assert.ok(/Allotment of Equity Share/i.test(out), `carries the headline disclosure subject, got: ${out}`)
  assert.ok(!/CIN|Dalal Street|Vaishno Devi|Fax|2656 5555|Scrip Code/i.test(out), `letterhead boilerplate leaked into the story: ${out}`)
})
// ---- scoping guard #3 (Codex review follow-up on #189): a BSE/NSE filing with a generic exchange title
// (e.g. "General Updates") whose extracted PDF text opens DIRECTLY with the real disclosure — no CIN /
// address / Tel / Fax / Scrip-Code cover page — must NOT be discarded for the terse headline floor just
// because the host is bseindia/nseindia. Only text that actually looks like a cover page forces the floor.
await check('bestFallbackSummary: a BSE/NSE filing whose text is NOT a cover page still leads with its real body', () => {
  const realBody =
    'The Company wishes to inform the Exchange that pursuant to the resolution passed by the Board of ' +
    'Directors, the Company has approved the allotment of 12,50,000 equity shares of face value Re. 1 each ' +
    'to the qualified institutional buyers pursuant to the QIP, with effect from today, in accordance with ' +
    'the applicable provisions of the SEBI ICDR Regulations, 2018, as amended from time to time.'
  const filingInput = {
    headline: 'ACME LTD: General Updates', input_nature: 'exchange_announcement', source_tier: 'primary_filing',
    domain: 'www.bseindia.com', url: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/xyz456.pdf',
  }
  const out = bestFallbackSummary('', realBody, filingInput, false, true) // not bodyless (PDF read), BSE attachment filing
  assert.ok(/qualified institutional buyers|QIP|12,50,000/i.test(out), `real filing body should win over the terse floor, got: ${out}`)
})
// ---- scoping guard #4 (Codex review follow-up on #189): a BSE/NSE cover page FOLLOWED BY the real body.
// The text IS letterhead (CIN/address/Tel/Fax/Scrip cluster → looksLikeLetterhead true), but the real
// disclosure follows a "Sub:" line. The letterhead must be STRIPPED and the body kept — not the whole lede
// discarded for the terse floor. Body-only facts (the 200 MW plant, the Rs 1,450 crore) must survive; the
// letterhead tokens must NOT leak.
await check('bestFallbackSummary: a BSE cover page followed by a real "Sub:" body keeps the body, strips the letterhead', () => {
  const coverPlusBody =
    'Acme Industries Limited Regd. Office: 12 MG Road, Mumbai 400001 CIN: L12345MH1990PLC012345 ' +
    'Tel: +91 22 1234 5678 Fax: +91 22 1234 5679 www.acme.example Scrip Code: 500123 ' +
    'To, BSE Limited, Dalal Street, Mumbai. Dear Sir/Madam, Sub: General Updates. ' +
    'The Board of Directors at its meeting held today approved the establishment of a new 200 MW solar power ' +
    'plant in Rajasthan at an estimated cost of Rs 1,450 crore, funded through internal accruals and debt, ' +
    'with commercial commissioning targeted by March 2027 and expected annual generation of 480 million units.'
  const filingInput = {
    headline: 'Acme Industries Ltd: General Updates', input_nature: 'exchange_announcement', source_tier: 'primary_filing',
    domain: 'www.bseindia.com', url: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/acme.pdf',
  }
  const out = bestFallbackSummary('', coverPlusBody, filingInput, false, true) // letterhead-prone BSE attachment, PDF read
  assert.ok(/200 MW solar|1,450 crore|480 million units/i.test(out), `the disclosure body after the letterhead should survive, got: ${out}`)
  assert.ok(!/CIN|MG Road|Dalal Street|1234 5678|Scrip Code/i.test(out), `the stripped letterhead must not leak, got: ${out}`)
})
// ---- scoping guard #5 (Codex review follow-up on #189, discussion_r3549811417): a cover page whose
// letterhead runs PAST 600 characters before the "Sub:" boundary. The old fallbackLede was sliced to 600
// chars BEFORE stripLetterhead ran, so a long letterhead cut off the "Sub:" anchor entirely and the whole
// (truncated, still-boilerplate) lede lost to the floor. fallbackLede must carry a wider window so
// stripLetterhead can still find the boundary; the final output is truncated to 600 only afterward.
await check('bestFallbackSummary: a letterhead longer than 600 chars still finds the "Sub:" boundary and keeps the body', () => {
  const longLetterhead =
    'Acme Industries Limited Regd. Office: 12 MG Road, Bengaluru 560001, Karnataka, India CIN: L12345KA1990PLC012345 ' +
    'Tel: +91 80 1234 5678 Fax: +91 80 1234 5679 Email: investors@acme.example www.acme.example Scrip Code: 500123 ' +
    'Corporate Identity Number as above. Registered with the Ministry of Corporate Affairs. Listed on BSE and NSE. ' +
    'This letter is addressed to the Deputy General Manager, Listing Department, BSE Limited, Phiroze Jeejeebhoy ' +
    'Towers, Dalal Street, Mumbai 400001, and to the Vice President, Listing Department, National Stock Exchange ' +
    'of India Limited, Exchange Plaza, Bandra Kurla Complex, Mumbai 400051, in compliance with Regulation 30 of ' +
    'the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, as amended from time to time. ' +
    'Dear Sir/Madam, Sub: Update on new manufacturing facility. ' +
    'The Board of Directors at its meeting held today approved the establishment of a new 200 MW solar power ' +
    'plant in Rajasthan at an estimated cost of Rs 1,450 crore, funded through internal accruals and debt, ' +
    'with commercial commissioning targeted by March 2027 and expected annual generation of 480 million units.'
  assert.ok(longLetterhead.slice(0, 600).search(/\bSub\b\s*[:\-–]/i) === -1, 'fixture must place "Sub:" past the old 600-char cutoff')
  const filingInput = {
    headline: 'Acme Industries Ltd: Update on new manufacturing facility', input_nature: 'exchange_announcement', source_tier: 'primary_filing',
    domain: 'www.bseindia.com', url: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/acme-long.pdf',
  }
  const out = bestFallbackSummary('', longLetterhead, filingInput, false, true)
  assert.ok(/200 MW solar|1,450 crore|480 million units/i.test(out), `the disclosure body past the long letterhead should survive, got: ${out}`)
  assert.ok(!/CIN|MG Road|Dalal Street|Bandra Kurla|1234 5678/i.test(out), `the stripped letterhead must not leak, got: ${out}`)
})
// ---- scoping guard #6 (Codex review follow-up on #189, discussion_r3549811423): a cover letter whose
// internal "Ref:" line sits ABOVE the real "Sub:" line. Anchoring on whichever comes first (the old
// leftmost-match behaviour) returned a tail starting at the Ref: reference number — still boilerplate
// (date, addressee) — instead of the real Sub: subject boundary. Sub/Subject must win when both are present.
await check('bestFallbackSummary: a "Ref:" line above "Sub:" does not win — the Sub: boundary is preferred', () => {
  const refThenSub =
    'Acme Industries Limited Regd. Office: 12 MG Road, Mumbai 400001 CIN: L12345MH1990PLC012345 ' +
    'Ref: ACME/SEC/2026-27/145 dated 09th July 2026, addressed to the Listing Department. ' +
    'Dear Sir/Madam, Sub: General Updates. ' +
    'The Board of Directors at its meeting held today approved the establishment of a new 200 MW solar power ' +
    'plant in Rajasthan at an estimated cost of Rs 1,450 crore, funded through internal accruals and debt, ' +
    'with commercial commissioning targeted by March 2027 and expected annual generation of 480 million units.'
  const filingInput = {
    headline: 'Acme Industries Ltd: General Updates', input_nature: 'exchange_announcement', source_tier: 'primary_filing',
    domain: 'www.bseindia.com', url: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/acme-ref.pdf',
  }
  const out = bestFallbackSummary('', refThenSub, filingInput, false, true)
  assert.ok(/200 MW solar|1,450 crore|480 million units/i.test(out), `the disclosure body should survive, got: ${out}`)
  assert.ok(!/ACME\/SEC\/2026-27\/145|dated 09th July|Listing Department/i.test(out), `the Ref: line boilerplate must not lead the body, got: ${out}`)
})
// ---- scoping guard #7 (Codex review follow-up on #189, discussion_r3551546331): a cover page whose real
// disclosure body after the "Sub:" line is SHORTER than the deterministic headline floor. In the plain
// length sort the longer floor won, so a terse-but-material body-only fact (a one-line CFO resignation) was
// dropped. A body we deliberately isolated from letterhead is the filing's OWN words (§4) and must beat the
// floor regardless of length. Expected outcome pinned to §4 (primary source over headline restatement), not
// to code output — the assertion keys on a body-only token ("Sharma"/"resigned") absent from the floor.
await check('bestFallbackSummary: a stripped disclosure body SHORTER than the floor still wins (§4 primary source over headline restatement)', () => {
  const coverPlusShortBody =
    'Acme Industries Limited Regd. Office: 12 MG Road, Mumbai 400001 CIN: L12345MH1990PLC012345 ' +
    'Tel: +91 22 1234 5678 Fax: +91 22 1234 5679 www.acme.example Scrip Code: 500123 ' +
    'Dear Sir/Madam, Sub: Change in KMP. Mr R K Sharma has resigned as CFO with effect from today.'
  const filingInput = {
    headline: 'Acme Industries Ltd: General Updates and Other Corporate Matters', input_nature: 'exchange_announcement',
    source_tier: 'primary_filing', domain: 'www.bseindia.com', url: 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/acme-kmp.pdf',
  }
  const out = bestFallbackSummary('', coverPlusShortBody, filingInput, false, true)
  assert.ok(/Sharma|resigned as CFO/i.test(out), `the short stripped body must win over the longer floor, got: ${out}`)
  assert.ok(!/CIN|MG Road|1234 5678|Scrip Code/i.test(out), `the stripped letterhead must not leak, got: ${out}`)
})
// ---- scoping guard #1: the fix must NOT over-floor a NON-attachment filing whose document opens with real
// content. An ASX announcement (filingIsAttachment=false — fetched via documentKey, not a BSE/NSE or .pdf
// URL) whose PDF opens with the actual announcement must still lead with that content, not the terse floor.
await check('bestFallbackSummary: a non-attachment filing document (ASX-style, substantive opening) still leads with its real content', () => {
  const asxDoc =
    'For personal use only Triton Minerals said completion of the sale of its Mozambique graphite assets did not ' +
    'occur on 1 July 2026 because NQM failed to take the required steps, and Triton has issued a default notice.'
  const out = bestFallbackSummary('', asxDoc, { headline: 'TON: Completion delay and issue of default notice', input_nature: 'exchange_announcement', source_name: 'ASX (Australia Exchange Filing)', domain: 'www.asx.com.au' }, false, false)
  // assert on tokens that appear ONLY in the document body, never in the headline-derived floor — so a
  // regression that wrongly floored this would FAIL here (the floor's "Subject — …default notice" would pass
  // a laxer check even though the real content was lost).
  assert.ok(/Mozambique|graphite|NQM|completion of the sale/i.test(out), `the real document content should win, got: ${out}`)
})
// ---- scoping guard #2: the fix must NOT over-floor a regulator PRESS RELEASE — a readable ARTICLE whose
// real page prose (filingIsAttachment=false) must still win over the terse headline floor, even though the
// item is classified a filing (input_nature: regulatory_filing → isFilingEvent true).
await check('bestFallbackSummary: a readable regulator press release (not an attachment filing) still leads with its real prose', () => {
  const pressHtml =
    '<html><body><p>The Financial Conduct Authority fined Acme Bank 5 million pounds for anti-money-laundering ' +
    'failures between 2019 and 2022, citing weak transaction monitoring and inadequate staff training.</p></body></html>'
  const out = bestFallbackSummary(pressHtml, '', { headline: 'FCA fines Acme Bank', input_nature: 'regulatory_filing', source_name: 'FCA', domain: 'www.fca.org.uk' }, false, false)
  assert.ok(/5 million pounds|anti-money-laundering/i.test(out), `the real page prose should win, got: ${out}`)
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

// ---- the two reported incidents, end-to-end ----
// Incident 1: an ASX filing event (TON default notice). The stored URL is the ASX viewer page, which
// serves a terms-of-use interstitial — the old reader showed THAT text as THE STORY, with a stale meta
// date as "Published". The fix reads the filing DOCUMENT itself (the PDF behind the viewer's
// documentKey) and never fetches the interstitial page at all.
// Incident 2: a paywalled/bot-walled article (KPMG via Bloomberg) whose story the wire ALSO carries
// from another approved outlet (The Business Times) in the same dedup cluster. The fix reads the
// alternate outlet's article in full and labels the provenance.

function tmpRepoItems(items: any[]): { repoRoot: string; stateDir: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-scen-'))
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, `${TODAY}_firehose.ndjson`), items.map((i) => JSON.stringify({ kind: 'item', ts: NOW_ISO, triage_score: 95, ...i })).join('\n') + '\n')
  return { repoRoot: root, stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'enrich-scen-state-')) }
}

/** A minimal PDF whose text is the given lines. Parens must not appear in lines. */
function tinyPdf(lines: string[]): Buffer {
  const content = `BT /F1 12 Tf ${lines.map((l) => `(${l}) Tj T*`).join(' ')} ET`
  return Buffer.from(
    `%PDF-1.4\n1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n4 0 obj <</Length ${content.length}>>\nstream\n${content}\nendstream\nendobj\ntrailer\n<</Size 9/Root 1 0 R>>\n%%EOF\n`,
    'latin1',
  )
}

const ASX_EVENT_ID = 'EVT-test-ton-asx'
const ASX_URL = 'https://www.asx.com.au/markets/trade-our-cash-market/announcements.TON?key=2924-03106938-6A1332187'
const ASX_DOC_URL = 'https://cdn-api.markitdigital.com/apiman-gateway/ASX/asx-research/1.0/file/2924-03106938-6A1332187'
const ANNOUNCEMENT_TEXT =
  'Triton Minerals said completion of the sale of its Mozambique graphite assets did not occur on 1 July 2026 ' +
  'because NQM failed to take the steps required of it, and Triton has issued a default notice requiring completion by Thursday 9 July 2026.'
const INTERSTITIAL_HTML =
  '<html><head><meta property="article:published_time" content="2025-08-22T09:30:00Z"></head><body>' +
  '<p>An email containing a verification link has been sent to {{verificationEmail}}. All company announcements are also available to view via brokers and news agencies.</p>' +
  '<p>The access to and use of information made available on the ASX website, including Market Announcements, is subject to the terms of use. Market data is provided and copyrighted by LSEG Data and Analytics and Morningstar. Click for restrictions.</p>' +
  '<p>By clicking agree and proceed below, you acknowledge that you have read this notice and the Terms of Use and agree to be bound by them.</p>' +
  '</body></html>'
const TON_BRIEF: ArticleBrief = {
  gist: ['NQM failed to complete the Mozambique graphite asset sale by 1 July 2026; Triton issued a default notice requiring completion by 9 July 2026.'],
  companies: [{ name: 'Triton Minerals', ticker: 'TON', role: 'subject', listing_country: 'Australia', exchange: 'ASX' }],
  beneficiaries: [], exposed: [], theme: 'deals_takeovers',
}

await check('INCIDENT 1 e2e: an ASX filing reads the PDF document itself — the interstitial can never become THE STORY', async () => {
  const { repoRoot, stateDir } = tmpRepoItems([{
    event_id: ASX_EVENT_ID,
    headline: 'TON: Completion delay and issue of default notice [price-sensitive]',
    url: ASX_URL, source_name: 'ASX (Australia Exchange Filing)', region: 'OTHER',
    input_nature: 'exchange_announcement', companies: [{ name: 'Triton Minerals', ticker: 'TON' }], event_types: ['forecast_changed'],
  }])
  const calls: string[] = []
  const llmBodies: string[] = []
  const fetchFn = (async (input: any, init?: any) => {
    const url = String(input?.url || input)
    calls.push(url)
    if (url.includes('/chat/completions')) {
      llmBodies.push(String(init?.body || ''))
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(TON_BRIEF) }, finish_reason: 'stop' }], usage: { total_tokens: 200 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.startsWith(ASX_DOC_URL)) return new Response(tinyPdf(['For personal use only', ANNOUNCEMENT_TEXT]), { status: 200, headers: { 'content-type': 'application/pdf' } })
    // the viewer page — MUST never be fetched, but if it were, this is what it serves
    return new Response(INTERSTITIAL_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: ASX_EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  assert.ok(r.gist && r.gist.length, 'the filing read produced a real gist')
  assert.deepEqual(r.read_from, { kind: 'filing_doc', url: ASX_DOC_URL }, 'provenance says: read from the filing document')
  assert.ok(!calls.some((u) => u.includes('asx.com.au/markets')), 'the interstitial viewer page is never fetched')
  assert.equal(r.published, undefined, 'no stale meta date leaks in as Published')
  assert.ok(llmBodies.length === 1 && llmBodies[0].includes('Mozambique graphite'), 'the LLM read the PDF text, not page chrome')
  assert.ok(!/verification link|terms of use/i.test(JSON.stringify([r.summary, r.gist])), 'no interstitial text anywhere in the story')
  assert.equal(r.complete, true, 'a documented read is complete')
})

await check('INCIDENT 1 floor: when the filing PDF is unreadable, the story falls to the honest floor — never the interstitial', async () => {
  const { repoRoot, stateDir } = tmpRepoItems([{
    event_id: ASX_EVENT_ID,
    headline: 'TON: Completion delay and issue of default notice [price-sensitive]',
    url: ASX_URL, source_name: 'ASX (Australia Exchange Filing)', region: 'OTHER',
    input_nature: 'exchange_announcement', companies: [{ name: 'Triton Minerals', ticker: 'TON' }], event_types: ['forecast_changed'],
  }])
  const fetchFn = (async (input: any) => {
    const url = String(input?.url || input)
    if (url.startsWith(ASX_DOC_URL)) return new Response('x', { status: 503 })
    return new Response(INTERSTITIAL_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: ASX_EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  assert.ok(r.summary && /completion delay|default notice/i.test(r.summary), `floor restates the disclosure, got: ${r.summary}`)
  assert.ok(!/verification link|agree and proceed|terms of use/i.test(r.summary || ''), 'interstitial text never leaks into the floor')
  assert.equal(r.published, undefined, 'no stale meta date')
})

// The Adani-QIP defect, end-to-end: a BSE exchange filing whose PDF document READS (so it is NOT bodyless —
// the old `if (bodylessFiling) return floor` early-out does not fire) but the LLM body read MISSES (returns
// no usable brief). The document opening we hold is the cover-page letterhead (registered address, CIN,
// phone/fax, scrip codes); the old "longest substantial prose wins" fallback surfaced THAT as THE STORY.
// The fix: a filing-document lede can never outrank the headline-derived floor — so the clean parsed subject
// stands, and none of the letterhead leaks.
await check('INCIDENT 1 / Adani-QIP e2e: a filing whose PDF read but the LLM missed falls to the clean headline floor, never the letterhead', async () => {
  const PDF_URL = 'https://www.bseindia.com/xml-data/corpfiling/AttachLive/adani-qip.pdf'
  const ADANI_EVENT_ID = 'EVT-test-adani-qip'
  const { repoRoot, stateDir } = tmpRepoItems([{
    event_id: ADANI_EVENT_ID,
    headline: 'Adani Enterprises Ltd: Allotment of Equity Share to Eligible Qualified Institutional Investors',
    url: PDF_URL, source_name: 'BSE / NSE Exchange Filing', region: 'IN',
    input_nature: 'exchange_announcement',
    companies: [{ name: 'Adani Enterprises Ltd', ticker: 'ADANIENT' }], event_types: ['capital_actions'],
  }])
  // the PDF's own opening — pure cover-page letterhead, exactly what leaked in the reported screenshot
  const LETTERHEAD = [
    'Adani Enterprises Limited Am Shantigram, Near Vaishno Devi Circle, S. G. Highway, Khodiyar Ahmedabad 382421 Gujarat India',
    'Tel +91 79 2656 5555 Fax +91 79 2555 5500 investor.ael@adani.com www.adanienterprises.com CIN L51100GJ1993PLC019067',
    'Registered Office BSE Limited P J Towers, Dalal Street, Mumbai 400001 Scrip Code 512599 Scrip Code ADANIENT',
    'Sub Qualified institutions placement of equity shares of face value 1 each by Adani Enterprises Limited',
  ]
  const MISS_BRIEF: ArticleBrief = { gist: [], companies: [], beneficiaries: [], exposed: [], theme: 'capital_actions' } // the LLM read produced nothing usable
  const fetchFn = (async (input: any, init?: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(MISS_BRIEF) }, finish_reason: 'stop' }], usage: { total_tokens: 120 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.startsWith(PDF_URL)) return new Response(tinyPdf(LETTERHEAD), { status: 200, headers: { 'content-type': 'application/pdf' } })
    return new Response('should not be fetched', { status: 404 })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: ADANI_EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  assert.ok(!r.gist?.length, 'no fabricated gist from a letterhead-only read')
  assert.ok(r.summary && /Adani Enterprises Ltd/i.test(r.summary), `names the issuer, got: ${r.summary}`)
  assert.ok(r.summary && /Allotment of Equity Share|Qualified Institutional/i.test(r.summary), `carries the disclosure subject, got: ${r.summary}`)
  assert.ok(!/CIN|Dalal Street|Vaishno Devi|Fax|2656 5555/i.test(r.summary || ''), `letterhead leaked as THE STORY: ${r.summary}`)
})

// ---- HKEX regression (Codex review on #189): the letterhead-suppression must be scoped to the letterhead-
// prone BSE/NSE HOST, NOT to every direct PDF. A DIRECT-PDF filing on ANOTHER exchange (HKEXnews) opens with
// the REAL announcement, not a cover page (story-floor.ts / CLAUDE.md §27). When its PDF READS (so it is not
// bodyless) but the LLM MISSES, the fallback must keep that real body — flooring it for a generic headline
// would DISCARD the primary source (§4). Passing `bodylessFiling` (= BSE/NSE host OR any .pdf) as the
// attachment signal wrongly caught this HKEX .pdf; the fix passes a host-scoped signal so it does not.
// Expected value pinned to §4 (the filing document IS the primary source, floor is a last resort), NOT to
// current code behaviour: the assertion keys on body-only tokens that never appear in the headline floor.
await check('INCIDENT 1 / HKEX regression: a direct-PDF HKEX filing whose PDF read but the LLM missed keeps its real body, not the generic floor', async () => {
  const HKEX_URL = 'https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0708/2026070800123.pdf'
  const HKEX_EVENT_ID = 'EVT-test-hkex-pdf'
  const { repoRoot, stateDir } = tmpRepoItems([{
    event_id: HKEX_EVENT_ID,
    headline: 'BYD Company Limited: Voluntary Announcement',
    url: HKEX_URL, source_name: 'HKEXnews (HK Exchange Filing)', region: 'CN',
    input_nature: 'exchange_announcement',
    companies: [{ name: 'BYD Company Limited', ticker: '1211' }], event_types: ['operational_update'],
  }])
  // the PDF's own opening — a REAL HKEX announcement body (NOT cover-page letterhead). tinyPdf forbids parens.
  const ANNOUNCEMENT = [
    'BYD Company Limited announced that its new energy vehicle sales reached 500000 units in June 2026',
    'a year on year increase of 35 percent driven by strong demand for its Dynasty and Ocean series overseas',
  ]
  const MISS_BRIEF: ArticleBrief = { gist: [], companies: [], beneficiaries: [], exposed: [], theme: 'operational_update' } // LLM read produced nothing usable
  const fetchFn = (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(MISS_BRIEF) }, finish_reason: 'stop' }], usage: { total_tokens: 120 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.startsWith(HKEX_URL)) return new Response(tinyPdf(ANNOUNCEMENT), { status: 200, headers: { 'content-type': 'application/pdf' } })
    return new Response('should not be fetched', { status: 404 })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: HKEX_EVENT_ID }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  // tokens that appear ONLY in the document body, never in the headline-derived floor — so a regression that
  // floored this real HKEX body FAILS here (the floor's "Subject — Voluntary Announcement" carries none of them).
  assert.ok(r.summary && /new energy vehicle sales|500000 units|35 percent/i.test(r.summary), `the real HKEX announcement body should lead, got: ${r.summary}`)
})

await check('INCIDENT 1 non-filing page: a consent interstitial on ANY site yields the floor + an honest note, no junk, no stale date', async () => {
  const { repoRoot, stateDir } = tmpRepoItems([{
    event_id: 'EVT-test-interstitial',
    headline: 'Acme Industries wins large multi-year supply contract',
    url: 'https://www.fool.com/investing/2026/07/02/acme/', source_name: 'The Motley Fool', region: 'US',
    input_nature: 'news_headline', companies: [{ name: 'Acme Industries' }], event_types: ['contracts_customers'],
  }])
  const fetchFn = (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) throw new Error('LLM must not be called — there is no article body')
    return new Response(INTERSTITIAL_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: 'EVT-test-interstitial' }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  assert.ok(!/verification link|agree and proceed/i.test(r.summary || ''), `no interstitial text as the story, got: ${r.summary}`)
  assert.match(r.note || '', /interstitial/, 'the note says what the page was')
  assert.equal(r.published, undefined, 'the stale meta date from the interstitial is not extracted')
})

const KPMG_HEADLINE = 'KPMG Australia Chair, Partners to Exit in Overhaul Amid Scandal'
const KPMG_BRIEF: ArticleBrief = {
  gist: ['KPMG Australia will replace its chair and several partners in a governance overhaul following the audit scandal.'],
  companies: [], beneficiaries: [], exposed: [], theme: 'lawsuits_penalties',
}
const BT_ARTICLE_HTML =
  '<html><body>' +
  '<p>KPMG Australia said its chair and a group of senior partners will leave the firm as part of a sweeping governance overhaul following the widening audit scandal.</p>' +
  '<p>The professional services firm has faced mounting scrutiny from regulators and clients since the misconduct came to light, and said the leadership changes would take effect within weeks.</p>' +
  '<p>People familiar with the matter said further departures are possible as the internal review continues across the audit and consulting practices.</p>' +
  '</body></html>'

await check('INCIDENT 2 e2e: a bot-walled original is read IN FULL from the alternate outlet carrying the same story', async () => {
  const { repoRoot, stateDir } = tmpRepoItems([
    {
      event_id: 'EVT-test-kpmg-bbg', headline: KPMG_HEADLINE,
      url: 'https://www.bloomberg.com/news/articles/2026-06-23/kpmg-australia', source_name: 'Bloomberg', region: 'GLOBAL',
      input_nature: 'news_headline', companies: [{ name: 'KPMG Australia' }], event_types: ['lawsuits_penalties'], triage_score: 99,
    },
    {
      event_id: 'EVT-test-kpmg-bt', headline: 'KPMG Australia Chair and Partners to Exit in Overhaul Amid KPMG Scandal',
      url: 'https://www.businesstimes.com.sg/companies/kpmg-australia-exit', source_name: 'The Business Times (Singapore)', region: 'GLOBAL',
      input_nature: 'news_headline', companies: [{ name: 'KPMG Australia' }], event_types: ['lawsuits_penalties'], triage_score: 90,
    },
  ])
  const llmBodies: string[] = []
  const fetchFn = (async (input: any, init?: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      llmBodies.push(String(init?.body || ''))
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(KPMG_BRIEF) }, finish_reason: 'stop' }], usage: { total_tokens: 200 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.includes('bloomberg.com')) return new Response('blocked', { status: 403 })
    if (url.includes('businesstimes.com.sg')) return new Response(BT_ARTICLE_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
    throw new Error(`unexpected fetch: ${url}`)
  }) as typeof fetch
  const r = await enrichEvent({ event_id: 'EVT-test-kpmg-bbg' }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  assert.ok(r.gist && r.gist.length, 'the alternate read produced a real gist')
  assert.equal(r.read_from?.kind, 'alternate', 'provenance says: read from an alternate outlet')
  assert.equal(r.read_from?.domain, 'businesstimes.com.sg')
  assert.match(r.note || '', /read from The Business Times/i, 'the note names the outlet')
  assert.ok(!r.corroborated, 'a full alternate read is not headline corroboration')
  assert.ok(llmBodies.length === 1 && llmBodies[0].includes('governance overhaul'), 'the LLM read the alternate article body')
})

await check('INCIDENT 2 guard: when the direct read succeeds, alternates are never touched', async () => {
  const { repoRoot, stateDir } = tmpRepoItems([
    {
      event_id: 'EVT-test-kpmg-ok', headline: KPMG_HEADLINE,
      url: 'https://www.bloomberg.com/news/articles/2026-06-23/kpmg-ok', source_name: 'Bloomberg', region: 'GLOBAL',
      input_nature: 'news_headline', companies: [{ name: 'KPMG Australia' }], event_types: ['lawsuits_penalties'], triage_score: 99,
    },
    {
      event_id: 'EVT-test-kpmg-bt2', headline: 'KPMG Australia Chair and Partners to Exit in Overhaul Amid KPMG Scandal',
      url: 'https://www.businesstimes.com.sg/companies/kpmg-exit-2', source_name: 'The Business Times (Singapore)', region: 'GLOBAL',
      input_nature: 'news_headline', companies: [{ name: 'KPMG Australia' }], event_types: ['lawsuits_penalties'], triage_score: 90,
    },
  ])
  const calls: string[] = []
  const fetchFn = (async (input: any) => {
    const url = String(input?.url || input)
    calls.push(url)
    if (url.includes('/chat/completions')) {
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(KPMG_BRIEF) }, finish_reason: 'stop' }], usage: { total_tokens: 200 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response(BT_ARTICLE_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: 'EVT-test-kpmg-ok' }, { repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn })
  assert.ok(r.gist && r.gist.length, 'direct read produced the gist')
  assert.equal(r.read_from, undefined, 'no alternate provenance on a direct read')
  assert.ok(!calls.some((u) => u.includes('businesstimes')), 'the alternate outlet is never fetched')
})

// ---- review-confirmed regressions: corroboration gating around the new read paths ----

await check('REVIEW FIX: a 403-blocked page WITH a readable snippet never triggers GDELT corroboration on a transient LLM miss (the snippet lede survives)', async () => {
  resetGdeltBackoff()
  const richSnippet =
    'KPMG Australia said its chair and several senior partners will leave the firm as part of a governance overhaul ' +
    'following the audit scandal, with the changes taking effect within weeks according to the statement.'
  const { repoRoot, stateDir } = tmpRepoItems([{
    event_id: 'EVT-test-snippet-403', headline: KPMG_HEADLINE, snippet: richSnippet,
    url: 'https://www.bloomberg.com/news/articles/2026-06-23/kpmg-snip', source_name: 'Bloomberg', region: 'GLOBAL',
    input_nature: 'news_headline', companies: [{ name: 'KPMG Australia' }], event_types: ['lawsuits_penalties'],
  }])
  let gdeltCalled = 0
  const fetchFn = (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      // transient miss: the provider answers but with an empty brief
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(EMPTY_BRIEF) }, finish_reason: 'stop' }], usage: { total_tokens: 50 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.includes('gdeltproject')) { gdeltCalled++; return new Response(JSON.stringify({ articles: [] }), { status: 200, headers: { 'content-type': 'application/json' } }) }
    return new Response('blocked', { status: 403 })
  }) as typeof fetch
  const r = await enrichEvent({ event_id: 'EVT-test-snippet-403' }, {
    repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn,
    corroborate: { enabled: true, baseUrl: 'https://api.gdeltproject.org/api/v2/doc/doc' },
  })
  assert.equal(gdeltCalled, 0, 'GDELT is never probed while a readable snippet exists (retry beats headline synthesis)')
  assert.ok(!r.corroborated, 'not marked corroborated')
  assert.ok(r.summary && r.summary.includes('governance overhaul'), `the snippet lede survives as the story, got: ${r.summary}`)
  assert.ok(!/other outlets? are reporting/i.test(r.summary || ''), 'the generic corroboration stub never displaces real text')
})

await check('REVIEW FIX: after a successful gist-less alternate read, corroboration is skipped — no headline synthesis under the "read in full" label', async () => {
  resetGdeltBackoff()
  const GISTLESS_BRIEF: ArticleBrief = {
    gist: [], beneficiaries: [], exposed: [], theme: 'lawsuits_penalties',
    companies: [{ name: 'KPMG Australia', ticker: null, role: 'subject', listing_country: 'Australia', exchange: null }],
  }
  const { repoRoot, stateDir } = tmpRepoItems([
    {
      event_id: 'EVT-test-kpmg-gistless', headline: KPMG_HEADLINE,
      url: 'https://www.bloomberg.com/news/articles/2026-06-23/kpmg-gl', source_name: 'Bloomberg', region: 'GLOBAL',
      input_nature: 'news_headline', companies: [{ name: 'KPMG Australia' }], event_types: ['lawsuits_penalties'], triage_score: 99,
    },
    {
      event_id: 'EVT-test-kpmg-bt3', headline: 'KPMG Australia Chair and Partners to Exit in Overhaul Amid KPMG Scandal',
      url: 'https://www.businesstimes.com.sg/companies/kpmg-exit-3', source_name: 'The Business Times (Singapore)', region: 'GLOBAL',
      input_nature: 'news_headline', companies: [{ name: 'KPMG Australia' }], event_types: ['lawsuits_penalties'], triage_score: 90,
    },
  ])
  let gdeltCalled = 0
  const fetchFn = (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(GISTLESS_BRIEF) }, finish_reason: 'stop' }], usage: { total_tokens: 80 } }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    if (url.includes('gdeltproject')) { gdeltCalled++; return new Response(JSON.stringify({ articles: [] }), { status: 200, headers: { 'content-type': 'application/json' } }) }
    if (url.includes('bloomberg.com')) return new Response('blocked', { status: 403 })
    if (url.includes('businesstimes.com.sg')) return new Response(BT_ARTICLE_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
    throw new Error(`unexpected fetch: ${url}`)
  }) as typeof fetch
  const r = await enrichEvent({ event_id: 'EVT-test-kpmg-gistless' }, {
    repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn,
    corroborate: { enabled: true, baseUrl: 'https://api.gdeltproject.org/api/v2/doc/doc' },
  })
  assert.equal(r.read_from?.kind, 'alternate', 'the gist-less alternate read is still a real read')
  assert.equal(gdeltCalled, 0, 'corroboration never runs on top of a successful alternate read')
  assert.ok(!r.corroborated, 'no corroboration metadata over an alternate read')
  assert.match(r.note || '', /read from The Business Times/i, 'the alternate provenance note is not overwritten')
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
