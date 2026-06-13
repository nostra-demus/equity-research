// Scope + source-tier derivation and on-demand enrichment — pure-function unit tests with mocked
// fetch + an isolated tmp repo, so no key / network / install is needed. Run: npx tsx test/scope.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { deriveScope, deriveSourceTier, familyOf, SCOPES } from '../src/news/scope'
import { extractSummary, parseSecFiling, findPriorCoverage, findRelatedEvents, enrichEvent, isSafeFetchUrl } from '../src/news/enrich'
import { appendFeedItems } from '../src/news/feed'
import type { FeedItem } from '../src/news/types'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}
function res(body: string, status = 200, headers: Record<string, string> = {}): any {
  const h = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return { ok: status >= 200 && status < 300, status, headers: { get: (k: string) => h.get(k.toLowerCase()) ?? null }, text: async () => body }
}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'scope-'))

// ---- scope derivation ----

await check('single company + primary linkage → single_name (company family)', () => {
  const s = deriveScope({ issuer_linkage: 'primary', companies: [{ name: 'Acme Corp', ticker: 'ACME' }], event_types: ['earnings_revenue_margin'], headline: 'Acme Corp profit jumps 20%' })
  assert.equal(s, 'single_name')
  assert.equal(familyOf(s), 'company')
})

await check('two named companies / M&A → multi_name (a deal/pair, company family)', () => {
  assert.equal(deriveScope({ issuer_linkage: 'primary', companies: [{ name: 'Paramount', ticker: 'PARA' }, { name: 'Warner Bros', ticker: 'WBD' }], event_types: ['mna'], headline: 'Paramount takeover of Warner Bros wins approval' }), 'multi_name')
  // M&A with a single named acquirer is still a deal
  assert.equal(deriveScope({ issuer_linkage: 'primary', companies: [{ name: 'Acme', ticker: 'ACME' }], event_types: ['mna'], headline: 'Acme to acquire a rival' }), 'multi_name')
  assert.equal(familyOf('multi_name'), 'company')
})

await check('commodity move → commodity, even when linkage came through macro', () => {
  assert.equal(deriveScope({ issuer_linkage: 'macro', companies: [], event_types: ['macro_sector'], headline: 'Oil nears two-month lows on US-Iran peace deal' }), 'commodity')
  assert.equal(deriveScope({ issuer_linkage: 'sector', companies: [], headline: 'Copper hits record on supply squeeze' }), 'commodity')
  // but a commodity move pinned to ONE named producer stays company-scoped
  assert.equal(deriveScope({ issuer_linkage: 'primary', companies: [{ name: 'Saudi Aramco', ticker: null }], headline: 'Saudi Aramco lifts crude output' }), 'single_name')
})

await check('central bank / tariff / court (no single company subject) → policy', () => {
  assert.equal(deriveScope({ issuer_linkage: 'macro', companies: [{ name: 'Fed', ticker: null }], headline: 'Newly led Fed poses wildcard, rate decision looms' }), 'policy')
  assert.equal(deriveScope({ issuer_linkage: 'sector', companies: [], event_types: ['regulatory'], headline: 'US slaps fresh tariffs on steel imports' }), 'policy')
  assert.equal(familyOf('policy'), 'broad')
})

await check('"SEC charges Acme" — a company IS the subject → single_name, not policy', () => {
  // the enforcement names one company as the subject; that beats the policy keyword
  assert.equal(deriveScope({ issuer_linkage: 'primary', companies: [{ name: 'Acme Corp', ticker: 'ACME' }], event_types: ['litigation_enforcement'], headline: 'SEC charges Acme Corp over accounting' }), 'single_name')
})

await check('macro print → macro; sector-only → sector; trade policy (FTA) → policy', () => {
  assert.equal(deriveScope({ issuer_linkage: 'macro', companies: [], headline: 'India GDP growth beats forecast, inflation cools' }), 'macro')
  // a clean industry read-across with no policy/commodity/macro words stays sector
  assert.equal(deriveScope({ issuer_linkage: 'sector', companies: [], event_types: ['macro_sector'], headline: 'Auto component makers gain as demand recovers' }), 'sector')
  // free-trade agreements are trade POLICY — the actionable frame, not a vague sector read
  assert.equal(deriveScope({ issuer_linkage: 'sector', companies: [], event_types: ['macro_sector'], headline: 'India FTAs set stage for $1 trillion export target' }), 'policy')
})

await check('every scope id has a definition + family; unknown is the floor', () => {
  for (const id of Object.keys(SCOPES)) assert.ok(SCOPES[id as keyof typeof SCOPES].label && SCOPES[id as keyof typeof SCOPES].meaning)
  assert.equal(deriveScope({}), 'unknown')
})

// ---- source tier (CLAUDE.md §4) ----

await check('source tier maps input_nature to the §4 ladder; rumor overrides', () => {
  assert.equal(deriveSourceTier({ input_nature: 'regulatory_filing' }), 'primary_filing')
  assert.equal(deriveSourceTier({ input_nature: 'exchange_announcement' }), 'primary_filing')
  assert.equal(deriveSourceTier({ input_nature: 'macro_data_release' }), 'official_data')
  assert.equal(deriveSourceTier({ input_nature: 'company_press_release' }), 'company')
  assert.equal(deriveSourceTier({ input_nature: 'news_headline' }), 'news')
  assert.equal(deriveSourceTier({ input_nature: 'news_headline', event_types: ['rumor'] }), 'unconfirmed')
})

// ---- summary extraction ----

await check('extractSummary prefers og:description, falls back to first real <p>', () => {
  assert.equal(
    extractSummary('<html><head><meta property="og:description" content="Acme reported record quarterly revenue of $5bn, up 20% year on year."></head></html>'),
    'Acme reported record quarterly revenue of $5bn, up 20% year on year.',
  )
  const lede = extractSummary('<html><body><p>x</p><p>The company said it expects demand to stay firm through the second half on the back of new contracts.</p></body></html>')
  assert.ok(lede && lede.includes('demand to stay firm'))
})

// ---- SEC filing parse ----

const EDGAR_INDEX = `
<html><body>
<div id="formName"><strong>Form 8-K</strong> - Current report</div>
<div class="companyName">International Seaways, Inc. (Filer) <acronym>CIK</acronym></div>
<div class="formGrouping">
  <div class="infoHead">Filing Date</div><div class="info">2026-06-13</div>
  <div class="infoHead">Period of Report</div><div class="info">2026-06-12</div>
</div>
<div class="formGrouping">
  <div class="infoHead">Items</div>
  <div class="info">8.01</div>
  <div class="info">2.02</div>
</div>
</body></html>`

await check('parseSecFiling pulls form, items (with plain labels), filer, period', () => {
  const sec = parseSecFiling(EDGAR_INDEX)
  assert.ok(sec)
  assert.equal(sec!.form, '8-K')
  assert.equal(sec!.filer, 'International Seaways, Inc.')
  assert.equal(sec!.period, '2026-06-12')
  assert.equal(sec!.filed, '2026-06-13')
  const codes = sec!.items.map((i) => i.code)
  assert.deepEqual(codes, ['2.02', '8.01']) // sorted, deduped
  assert.ok(sec!.items.find((i) => i.code === '2.02')!.label.toLowerCase().includes('results'))
})

await check('parseSecFiling flags a restatement (Item 4.02) in plain words', () => {
  const sec = parseSecFiling('<div id="formName"><strong>Form 8-K</strong></div><div class="infoHead">Items</div><div class="info">4.02</div>')
  assert.ok(sec!.items.find((i) => i.code === '4.02')!.label.toLowerCase().includes('non-reliance'))
})

await check('parseSecFiling returns undefined on a non-filing page', () => {
  assert.equal(parseSecFiling('<html><body><p>just an article</p></body></html>'), undefined)
})

// ---- prior coverage against a seeded repo ----

await check('findPriorCoverage surfaces a finished analysis and its last call (name reconciles)', () => {
  const root = tmp()
  fs.mkdirSync(path.join(root, 'data', 'HCG'), { recursive: true })
  fs.mkdirSync(path.join(root, 'analyses', 'HCG_2026-06-01'), { recursive: true })
  // the decision record carries company_name — that's what reconciles the guessed name to the run
  fs.writeFileSync(path.join(root, 'analyses', 'HCG_2026-06-01', 'decision_record.json'), JSON.stringify({ ticker: 'HCG', company_name: 'HealthCare Global', decision: 'Avoid', decision_date: '2026-06-01', confidence_score: 38 }))
  const cov = findPriorCoverage(root, [{ name: 'HealthCare Global', ticker: 'HCG', listing_country: 'IN' }])
  assert.equal(cov.length, 1)
  assert.equal(cov[0].kind, 'analysis')
  assert.ok(cov[0].detail.includes('Avoid') && cov[0].detail.includes('2026-06-01'))
})

await check('findPriorCoverage: a guessed ticker that does NOT reconcile by name is NOT asserted (§3)', () => {
  const root = tmp()
  fs.mkdirSync(path.join(root, 'analyses', 'HCG_2026-06-01'), { recursive: true })
  fs.writeFileSync(path.join(root, 'analyses', 'HCG_2026-06-01', 'decision_record.json'), JSON.stringify({ ticker: 'HCG', company_name: 'HealthCare Global', decision: 'Avoid', decision_date: '2026-06-01' }))
  // a headline mis-guessed the ticker "HCG" for an unrelated company — we must NOT claim prior coverage
  const cov = findPriorCoverage(root, [{ name: 'Hentai Card Games', ticker: 'HCG', listing_country: 'US' }])
  assert.deepEqual(cov, [])
})

await check('findPriorCoverage reports a bare data pool as not-yet-analyzed (folder name corroborates)', () => {
  const root = tmp()
  fs.mkdirSync(path.join(root, 'data', 'BUNGE'), { recursive: true })
  const cov = findPriorCoverage(root, [{ name: 'Bunge', ticker: 'BG', listing_country: 'US' }])
  assert.equal(cov[0].kind, 'data_pool')
})

await check('findPriorCoverage is empty for an unknown name', () => {
  const root = tmp()
  fs.mkdirSync(path.join(root, 'data'), { recursive: true })
  assert.deepEqual(findPriorCoverage(root, [{ name: 'Nobody Inc', ticker: 'NOPE', listing_country: 'US' }]), [])
})

// ---- word-boundary matching: the keyword lexicons must not fire inside unrelated words ----
await check('scope keyword match respects BOTH word edges (no "gold" in Goldman, no "fta" in after)', () => {
  // two named banks, no commodity — must be a deal/pair, NOT commodity (would mis-fire on "gold")
  assert.equal(deriveScope({ issuer_linkage: 'sector', companies: [{ name: 'Goldman', ticker: 'GS' }, { name: 'JPMorgan', ticker: 'JPM' }], headline: 'Goldman and JPMorgan ease office rules' }), 'multi_name')
  // "Bojangles" must not match policy term "boj"; "European" must not match macro "euro"
  assert.notEqual(deriveScope({ issuer_linkage: 'sector', companies: [], headline: 'Bojangles opens 50 new outlets across the southeast' }), 'policy')
  assert.notEqual(deriveScope({ issuer_linkage: 'sector', companies: [], headline: 'European tour dates announced for the summer' }), 'macro')
  // but the real policy action still classifies: a tariff on a commodity is policy, not commodity
  assert.equal(deriveScope({ issuer_linkage: 'sector', companies: [], event_types: ['regulatory'], headline: 'US slaps fresh tariffs on steel imports' }), 'policy')
})

// ---- SSRF gate ----
await check('isSafeFetchUrl: approved public host over http(s) only; blocks scheme/port/userinfo/IP/off-list', () => {
  assert.equal(isSafeFetchUrl('https://www.sec.gov/Archives/edgar/x-index.htm'), true)
  assert.equal(isSafeFetchUrl('http://reuters.com/x'), true)
  assert.equal(isSafeFetchUrl('https://nytimes.com/x'), false) // off the approved list
  assert.equal(isSafeFetchUrl('file:///etc/passwd'), false) // non-http scheme
  assert.equal(isSafeFetchUrl('https://sec.gov:8080/x'), false) // non-default port
  assert.equal(isSafeFetchUrl('https://user:pass@sec.gov/x'), false) // userinfo
  assert.equal(isSafeFetchUrl('https://169.254.169.254/latest/meta-data/'), false) // IP literal / metadata
})

// ---- enrichEvent orchestration: cache + off-list gating + SEC parse, all with mocked fetch ----

await check('enrichEvent parses an on-list SEC filing and caches the result', async () => {
  const root = tmp()
  const state = tmp()
  let calls = 0
  const fetchFn = (async (_u: string) => { calls++; return res(EDGAR_INDEX) }) as unknown as typeof fetch
  const input = { event_id: 'EVT-abc123', url: 'https://www.sec.gov/Archives/edgar/data/1679049/x-index.htm', headline: '8-K - International Seaways', companies: [{ name: 'International Seaways', ticker: null, listing_country: 'US' }] }
  const e1 = await enrichEvent(input, { repoRoot: root, stateDir: state, fetchFn })
  assert.equal(e1.ok, true)
  assert.equal(e1.sec?.form, '8-K')
  // the EDGAR header is boilerplate, never a story — a parsed filing must NOT carry a summary
  assert.equal(e1.summary, undefined)
  assert.equal(calls, 1)
  // second call within TTL is served from cache (no extra fetch)
  const e2 = await enrichEvent(input, { repoRoot: root, stateDir: state, fetchFn })
  assert.equal(e2.sec?.form, '8-K')
  assert.equal(calls, 1)
})

await check('enrichEvent does NOT fetch an off-list domain', async () => {
  const root = tmp()
  const state = tmp()
  let calls = 0
  const fetchFn = (async () => { calls++; return res('<html></html>') }) as unknown as typeof fetch
  const e = await enrichEvent({ event_id: 'EVT-off', url: 'https://nytimes.com/x', companies: [] }, { repoRoot: root, stateDir: state, fetchFn })
  assert.equal(calls, 0)
  assert.equal(e.ok, true)
  assert.ok((e.note || '').includes('off the approved list'))
})

await check('findRelatedEvents: same company always relates; unrelated single-names do NOT', () => {
  const root = tmp()
  const today = '2026-06-13'
  const mk = (id: string, headline: string, scope: string, types: string[], companies: any[]): FeedItem => ({
    kind: 'item', ts: `${today}T10:00:00Z`, event_id: id, headline, url: `https://x/${id}`, domain: 'x', source_name: 'SEC EDGAR',
    via: 'gdelt', region: 'US', input_nature: 'regulatory_filing', triage_score: 80, band: 'pick', triage_reason: '', relevance: 'material',
    event_types: types, issuer_linkage: 'primary', companies, size_bucket: 'unknown', scope: scope as any, dedup_status: 'new', inboxed: true,
  })
  // seed a firehose with two unrelated single-name filings + one same-company-as-self
  appendFeedItems(root, today, [
    mk('EVT-other-co', '8-K - Beta Corp', 'single_name', ['litigation_enforcement'], [{ name: 'Beta Corp', ticker: 'BETA', listing_country: 'US' }]),
    mk('EVT-same-co', '8-K - Acme Corp follow-up', 'single_name', ['litigation_enforcement'], [{ name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' }]),
  ], 100)
  const rel = findRelatedEvents(root, { event_id: 'EVT-self', headline: '8-K - Acme Corp', companies: [{ name: 'Acme Corp', ticker: 'ACME', listing_country: 'US' }], event_types: ['litigation_enforcement'], scope: 'single_name' }, () => new Date(`${today}T11:00:00Z`))
  const ids = rel.map((r) => r.event_id)
  assert.ok(ids.includes('EVT-same-co'), 'same company should relate')
  assert.ok(!ids.includes('EVT-other-co'), 'a different single-name 8-K with the same theme must NOT relate')
})

await check('findRelatedEvents: broad-scope items relate by shared theme', () => {
  const root = tmp()
  const today = '2026-06-13'
  const mk = (id: string, headline: string): FeedItem => ({
    kind: 'item', ts: `${today}T10:00:00Z`, event_id: id, headline, url: `https://x/${id}`, domain: 'x', source_name: 'Reuters',
    via: 'gdelt', region: 'GLOBAL', input_nature: 'news_headline', triage_score: 70, band: 'watch', triage_reason: '', relevance: 'material',
    event_types: ['macro_sector'], issuer_linkage: 'macro', companies: [], size_bucket: 'unknown', scope: 'commodity' as any, dedup_status: 'new', inboxed: true,
  })
  appendFeedItems(root, today, [mk('EVT-oil2', 'Crude steadies after selloff')], 100)
  const rel = findRelatedEvents(root, { event_id: 'EVT-oil1', headline: 'Oil falls', companies: [], event_types: ['macro_sector'], scope: 'commodity' }, () => new Date(`${today}T11:00:00Z`))
  assert.ok(rel.map((r) => r.event_id).includes('EVT-oil2'), 'two commodity items sharing a theme should relate')
})

console.log(`\nscope + enrich: ${passed} checks passed`)
