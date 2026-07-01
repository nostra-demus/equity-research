// news_impact e2e contract (news/enrich.ts + triage/groq.ts). Proves the 4 required scenarios end-to-end
// through the REAL enrichEvent(), including the routine-notice wiring fix: a brief whose gist/companies/
// beneficiaries/exposed are ALL empty (the DIGEST RULE's honest response to a boilerplate article) must
// still produce a news_impact verdict on the EventEnrichment — because "no real impact" is itself the
// correct, decision-useful answer, not a data gap to hide.
// Run: npx tsx test/news-impact.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { enrichEvent } from '../src/news/enrich'
import type { ArticleReadProvider } from '../src/news/triage/article-read'
import type { ArticleBrief } from '../src/news/triage/groq'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const TODAY = new Date().toISOString().slice(0, 10)
const NOW_ISO = new Date().toISOString()

function tmpRepo(eventId: string, headline: string, snippet: string): { repoRoot: string; stateDir: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'news-impact-test-'))
  const inbox = path.join(root, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  const item = {
    kind: 'item', event_id: eventId, ts: NOW_ISO, headline,
    url: 'https://example.com/a', source_name: 'Test Wire', region: 'US',
    input_nature: 'news_headline', snippet,
    companies: [{ name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' }], event_types: ['earnings_revenue_margin'], triage_score: 90,
  }
  fs.writeFileSync(path.join(inbox, `${TODAY}_firehose.ndjson`), JSON.stringify(item) + '\n')
  return { repoRoot: root, stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'news-impact-state-')) }
}

const PAGE_HTML = '<html><head><meta property="og:description" content="teaser"></head><body><p>x</p></body></html>'
function makeFetch(brief: ArticleBrief): typeof fetch {
  return (async (input: any) => {
    const url = String(input?.url || input)
    if (url.includes('/chat/completions')) {
      const body = JSON.stringify({ choices: [{ message: { content: JSON.stringify(brief) }, finish_reason: 'stop' }], usage: { total_tokens: 140 } })
      return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } })
    }
    return new Response(PAGE_HTML, { status: 200, headers: { 'content-type': 'text/html' } })
  }) as typeof fetch
}
// an isolated provider (its own named limiter + budget file) with headroom so the limiter never blocks the test
const PROVIDER: ArticleReadProvider = {
  id: 'test', kind: 'openai', apiKey: 'k', baseUrl: 'https://provider.test', model: 'm', maxTokens: 900,
  rpm: 10_000, tpm: 100_000_000, dailyReqCap: 1_000_000, dailyTokenCap: 1_000_000_000, budgetFile: 'test-budget-ni.json', limiter: 'test-ni',
}
const deps = (repoRoot: string, stateDir: string, brief: ArticleBrief) => ({
  repoRoot, stateDir, force: true, articleProviders: [PROVIDER], fetchFn: makeFetch(brief),
})

// ---- scenario 1: profit warning → negative + high + quantified loss range ----
await check('scenario 1: profit warning → negative direction, high magnitude, quantified numbers', async () => {
  const brief: ArticleBrief = {
    gist: ['Acme Corp cut FY guidance, now sees a $40-60M operating loss versus prior $20M profit guidance.'],
    companies: [{ name: 'Acme Corp', ticker: 'ACME', role: 'subject', listing_country: 'United States', exchange: 'NYSE' }],
    beneficiaries: [], exposed: [{ name: 'Acme Corp', named_in_article: true, mechanism: 'demand shortfall drives a swing to an operating loss' }],
    theme: 'guidance_change',
    news_impact: {
      impact_direction: 'negative', impact_magnitude: 'high',
      affected_metric: ['revenue', 'ebitda', 'pat_net_income'],
      quantified_impact_available: true,
      extracted_numbers: ['$40-60M operating loss guided, vs prior $20M profit guidance', 'revenue guidance cut 15%'],
      quick_dirty_calculation: 'Guidance swings from +$20M profit to a $40-60M loss — a ~$60-80M negative swing at the midpoint.',
      why_it_matters: 'A guided swing to an operating loss is a direct hit to near-term earnings and likely forces consensus estimates down.',
      analyst_takeaway: 'This is a real earnings reset, not noise — consensus EPS estimates should fall materially.',
      confidence: 85,
    },
  } as any
  const { repoRoot, stateDir } = tmpRepo('EVT-ni-1', 'Acme Corp slashes guidance, now sees a loss', 'Acme Corp said it now expects a $40-60M operating loss for the year, down from prior guidance of $20M profit, citing a sharp demand slowdown.')
  const r = await enrichEvent({ event_id: 'EVT-ni-1' }, deps(repoRoot, stateDir, brief))
  assert.ok(r.news_impact, 'news_impact present')
  assert.equal(r.news_impact!.impact_direction, 'negative')
  assert.equal(r.news_impact!.impact_magnitude, 'high')
  assert.equal(r.news_impact!.quantified_impact_available, true)
  assert.ok(r.news_impact!.extracted_numbers.some((n) => /40-60M|60-80M/.test(n)), 'carries the quantified loss range')
  assert.ok(r.news_impact!.quick_dirty_calculation.length > 0, 'has a back-of-envelope calc')
})

// ---- scenario 2: generic market-color article → low/no specific impact ----
await check('scenario 2: generic market color → low magnitude, no quantified impact', async () => {
  const brief: ArticleBrief = {
    gist: ["A wire round-up of today's market moves, no single company driving the tape."],
    companies: [], beneficiaries: [], exposed: [], theme: 'macro_sector',
    news_impact: {
      impact_direction: 'unknown', impact_magnitude: 'low', affected_metric: [],
      quantified_impact_available: false, extracted_numbers: [], quick_dirty_calculation: '',
      why_it_matters: '', analyst_takeaway: 'Pure market color — no company-specific read here.', confidence: 15,
    },
  } as any
  const { repoRoot, stateDir } = tmpRepo('EVT-ni-2', 'Markets mixed in early trading', 'Stocks were mixed Tuesday as investors weighed a batch of economic data with no single catalyst driving the session.')
  const r = await enrichEvent({ event_id: 'EVT-ni-2' }, deps(repoRoot, stateDir, brief))
  assert.ok(r.news_impact, 'news_impact present even for market color')
  assert.equal(r.news_impact!.impact_magnitude, 'low')
  assert.equal(r.news_impact!.quantified_impact_available, false)
  assert.equal(r.news_impact!.extracted_numbers.length, 0)
  assert.deepEqual(r.news_impact!.affected_metric, [])
})

// ---- scenario 3: major capex announcement → theme/sector-level impact ----
await check('scenario 3: major capex announcement → sector/theme-level impact, capex + commodity metrics', async () => {
  const brief: ArticleBrief = {
    gist: ['Acme Corp will invest $3B in a new chip fab, its largest capex commitment ever.'],
    companies: [{ name: 'Acme Corp', ticker: 'ACME', role: 'subject', listing_country: 'United States', exchange: 'NASDAQ' }],
    beneficiaries: [{ name: 'semiconductor equipment makers', named_in_article: false, mechanism: 'new fab construction drives equipment orders' }],
    exposed: [], theme: 'capital_actions',
    news_impact: {
      impact_direction: 'mixed', impact_magnitude: 'high',
      affected_metric: ['capex', 'cash_flow', 'debt'],
      quantified_impact_available: true,
      extracted_numbers: ['$3B capex commitment', 'construction over 3 years'],
      quick_dirty_calculation: '',
      why_it_matters: 'A $3B capex step-up raises near-term cash outflow and likely pressures free cash flow for several years before the new capacity contributes revenue.',
      analyst_takeaway: 'Near-term free cash flow takes a hit; the payoff is a multi-year capacity bet, not an immediate earnings driver.',
      confidence: 70,
    },
  } as any
  const { repoRoot, stateDir } = tmpRepo('EVT-ni-3', 'Acme Corp to build $3B chip fab', 'Acme Corp announced a $3 billion investment in a new semiconductor fabrication plant, its largest-ever capital commitment, with construction expected to run three years.')
  const r = await enrichEvent({ event_id: 'EVT-ni-3' }, deps(repoRoot, stateDir, brief))
  assert.ok(r.news_impact, 'news_impact present')
  assert.equal(r.news_impact!.impact_magnitude, 'high')
  assert.deepEqual(r.news_impact!.affected_metric.slice().sort(), ['capex', 'cash_flow', 'debt'].sort())
  assert.ok(r.news_impact!.extracted_numbers.some((n) => /\$3B|\$3 billion/i.test(n)), 'carries the capex number')
  // quick_dirty_calculation legitimately empty here — no share count/market cap in the body to size a per-share effect
  assert.equal(r.news_impact!.quick_dirty_calculation, '')
})

// ---- scenario 4: routine board-meeting notice → no valuation impact, THE CORE WIRING FIX ----
await check('scenario 4: routine board-meeting notice → news_impact still present even though gist/companies/etc. are ALL empty', async () => {
  // this is the DIGEST RULE's honest response to a boilerplate filing: gist:[], companies:[], beneficiaries:[],
  // exposed:[] — exactly the shape that, PRE-FIX, made both hasContent() (article-read.ts) and enrich.ts's
  // own `if (brief && (...))` gate treat the brief as "no usable content" and discard news_impact entirely.
  const brief: ArticleBrief = {
    gist: [], companies: [], beneficiaries: [], exposed: [], theme: 'management',
    news_impact: {
      impact_direction: 'neutral', impact_magnitude: 'low', affected_metric: [],
      quantified_impact_available: false, extracted_numbers: [], quick_dirty_calculation: '',
      why_it_matters: '', analyst_takeaway: 'A routine board-meeting notice with no stated financial impact.', confidence: 60,
    },
  } as any
  const { repoRoot, stateDir } = tmpRepo('EVT-ni-4', 'Acme Corp: Outcome of Board Meeting', 'Acme Corp held its scheduled quarterly board meeting on Tuesday. The board noted the meeting was conducted in the ordinary course of business.')
  const r = await enrichEvent({ event_id: 'EVT-ni-4' }, deps(repoRoot, stateDir, brief))
  assert.ok(r.news_impact, 'news_impact present DESPITE empty gist/companies/beneficiaries/exposed — the core wiring fix')
  assert.equal(r.news_impact!.impact_direction, 'neutral')
  assert.equal(r.news_impact!.impact_magnitude, 'low')
  assert.equal(r.news_impact!.quantified_impact_available, false)
  assert.equal(r.news_impact!.quick_dirty_calculation, '', 'no valuation impact — the UI renders the fixed insufficient-data string')
  assert.ok(/routine/i.test(r.news_impact!.analyst_takeaway), 'takeaway correctly identifies this as routine')
})

console.log(`\n${passed} passed`)
