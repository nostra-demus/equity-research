// Equity quote lane (news/equity-quote.ts) — the live market price behind /api/quote and the re-basing
// of a frozen call onto today's price.
//
// The tests that matter most are the SAFETY ones, not the happy path. A free quote service answers with
// SOMETHING for almost any string, and several of its wrong answers look completely healthy, so each of
// the four gates gets its own failing case, modelled on a hazard observed on the live feed:
//   - currency: an Indian ticker's bare form resolving to a US penny stock,
//   - name:     a suffixed symbol answering in the right currency AND country under another company's name,
//   - age:      a delisted ticker still serving a years-old price with a live-looking status,
//   - units:    a venue quoting a minor unit (pence / agorot) at 100x the major unit.
// Plus the call-vs-live math against the REAL shipped records, honest absence with a named reason,
// override sanitization, and the cache contract (serve within TTL, keep-previous + stale on a failed
// refresh, single-flight, negative caching). Isolated tmpdirs, stubbed fetch, no network.
// Run: npx tsx test/equity-quote.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { NEWS } from '../src/config'
import {
  callVsLive,
  countryFromExchange,
  gateRow,
  getQuotes,
  loadSymbolOverrides,
  nameTokens,
  namesMatch,
  resolveUnits,
  symbolCandidates,
  type QuoteDeps,
} from '../src/news/equity-quote'
import type { CnbcRow } from '../src/news/cnbc-quote'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

// getQuotes is gated on NEWS.quoteEnabled, which freezes at config import — a hostile env would make
// every flow check below fail for the wrong reason, so bail out honestly instead.
if (!NEWS.quoteEnabled) {
  console.log('equity-quote.test.ts: skipped (NEWS_QUOTE_ENABLED=0 in this environment)')
  process.exit(0)
}

const tmpdirs: string[] = []
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'equity-quote-')); tmpdirs.push(d); return d }
const T0 = Date.parse('2026-07-23T10:00:00Z')
const at = (ms: number) => () => new Date(ms)

// ---- symbol derivation ----

await check('countryFromExchange: longest fragment wins, so a specific venue beats a generic one', () => {
  assert.equal(countryFromExchange('National Stock Exchange of India'), 'IN')
  assert.equal(countryFromExchange('NasdaqGS'), 'US')
  assert.equal(countryFromExchange('NYSE'), 'US')
  assert.equal(countryFromExchange('Oslo Stock Exchange'), 'NO')
  assert.equal(countryFromExchange('Euronext Paris'), 'FR', 'the two-word venue beats the bare city')
  assert.equal(countryFromExchange('Dubai Financial Market'), 'AE')
  assert.equal(countryFromExchange(''), null)
  assert.equal(countryFromExchange(null), null)
  assert.equal(countryFromExchange('Some Venue Nobody Has Heard Of'), null)
})

await check('symbolCandidates: a US listing is the BARE ticker; everything else is <TICKER>-<CC>', () => {
  assert.deepEqual(symbolCandidates({ ticker: 'AMZN', currency: 'USD', exchange: 'NasdaqGS' }), ['AMZN'])
  assert.deepEqual(symbolCandidates({ ticker: 'HCG', currency: 'INR', exchange: 'NSE' }), ['HCG-IN', 'HCG'])
  assert.deepEqual(symbolCandidates({ ticker: 'NHY', currency: 'NOK', exchange: 'Oslo Stock Exchange' }), ['NHY-NO', 'NHY'])
})

await check('symbolCandidates: exchange beats currency, and the bare ticker is always the LAST resort', () => {
  const c = symbolCandidates({ ticker: 'XYZ', currency: 'USD', exchange: 'London Stock Exchange' })
  assert.equal(c[0], 'XYZ-GB', 'the exchange-derived candidate comes first')
  assert.equal(c[c.length - 1], 'XYZ', 'the ambiguous bare ticker is only ever the fallback')
})

await check('symbolCandidates: the euro does NOT derive a country — a EUR listing needs its exchange', () => {
  assert.deepEqual(symbolCandidates({ ticker: 'SAP', currency: 'EUR' }), ['SAP'])
  assert.deepEqual(symbolCandidates({ ticker: 'SAP', currency: 'EUR', exchange: 'Xetra' }), ['SAP-DE', 'SAP'])
})

await check('symbolCandidates: no ticker hardcoding needed — an unseen ticker+currency just works', () => {
  // The §26 zero-touch property: a company the engine has never analysed derives a symbol with no code
  // edit, purely from the listing details its decision record already carries.
  assert.deepEqual(symbolCandidates({ ticker: 'NEWCO', currency: 'JPY', exchange: 'Tokyo Stock Exchange' }), ['NEWCO-JP', 'NEWCO'])
  assert.deepEqual(symbolCandidates({ ticker: 'FOO', currency: 'ZAR' }), ['FOO-ZA', 'FOO'])
})

await check('symbolCandidates: junk tickers derive nothing, and share-class dots survive', () => {
  assert.deepEqual(symbolCandidates({ ticker: '', currency: 'USD' }), [])
  assert.deepEqual(symbolCandidates({ ticker: '../etc', currency: 'USD' }), [])
  assert.deepEqual(symbolCandidates({ ticker: 'BRK.B', currency: 'USD', exchange: 'NYSE' }), ['BRK.B'])
})

// ---- gate 2: the name check ----

await check('nameTokens drops legal forms and splits dotted names into their parts', () => {
  assert.deepEqual([...nameTokens('Amazon.com, Inc.')].sort(), ['amazon', 'com'])
  assert.deepEqual([...nameTokens('Norsk Hydro ASA')].sort(), ['hydro', 'norsk'])
  assert.deepEqual([...nameTokens('Emaar Properties PJSC')].sort(), ['emaar', 'properties'])
  assert.deepEqual([...nameTokens('')].length, 0)
})

await check('namesMatch: a short record name matches the feed\'s fuller spelling (subset rule)', () => {
  assert.equal(namesMatch('Amazon', 'Amazon.com Inc'), true)
  assert.equal(namesMatch('Amazon.com, Inc.', 'Amazon.com Inc'), true)
  assert.equal(namesMatch('Tata Motors Limited', 'Tata Motors Ltd'), true)
  assert.equal(namesMatch('Healthcare Global Enterprises Limited', 'Healthcare Global Enterprises Ltd'), true)
})

await check('namesMatch REFUSES a different company that shares the currency and country', () => {
  // The observed hazard: a suffixed symbol answers code:0, right currency, right country, right
  // exchange — under a completely different company's name. Only this gate catches it.
  assert.equal(namesMatch('Credit Suisse Group AG', 'AXA SA'), false)
  assert.equal(namesMatch('Healthcare Global Enterprises Ltd', 'Temecula Valley Bancorp Inc'), false)
})

await check('namesMatch: one shared family name is NOT identity — two tokens required', () => {
  assert.equal(namesMatch('Tata Motors Ltd', 'Tata Steel Ltd'), false, 'sharing "tata" alone proves nothing')
  assert.equal(namesMatch('Tata Motors Ltd', 'Tata Motors Finance Ltd'), true, 'two shared tokens is identity enough')
})

await check('namesMatch cannot judge without names — it permits, and leaves the other gates to work', () => {
  assert.equal(namesMatch(null, 'Amazon.com Inc'), true)
  assert.equal(namesMatch('Amazon.com Inc', null), true)
  assert.equal(namesMatch('Inc Ltd', 'Amazon'), true, 'a name of pure legal forms carries no identity')
})

// ---- gate 4: units ----

await check('resolveUnits normalises self-declared pence to pounds; leaves everything else alone', () => {
  assert.deepEqual(resolveUnits('GBp'), { currency: 'GBP', divisor: 100 })
  assert.deepEqual(resolveUnits('GBX'), { currency: 'GBP', divisor: 100 })
  assert.deepEqual(resolveUnits('GBP'), { currency: 'GBP', divisor: 1 })
  assert.deepEqual(resolveUnits('USD'), { currency: 'USD', divisor: 1 })
  // Agorot are quoted under a plain "ILS" with NOTHING on the row to declare them, so they are
  // deliberately not special-cased here — the plausibility gate is what stops that one.
  assert.deepEqual(resolveUnits('ILS'), { currency: 'ILS', divisor: 1 })
})

// ---- the gates, individually ----

const row = (over: Partial<CnbcRow>): CnbcRow => ({
  symbol: 'X', last: 100, prevClose: 99, asOf: '2026-07-23T09:00:00.000Z', dateOnly: false,
  name: 'Some Co', currency: 'USD', exchange: 'NYSE', marketStatus: 'REG_MKT', realTime: true, ...over,
})
const subj = { ticker: 'X', currency: 'USD', companyName: 'Some Co', entryPrice: 100 }

await check('gateRow accepts a clean row and reports the usable price', () => {
  const g = gateRow(row({}), subj, T0, 7)
  assert.equal(g.ok, true)
  assert.equal((g as any).price, 100)
  assert.equal((g as any).currency, 'USD')
})

await check('gateRow refuses each failure class with its own named reason', () => {
  const reason = (r: Partial<CnbcRow>, s: any = subj) => (gateRow(row(r), s, T0, 7) as any).reason
  assert.equal(reason({ last: NaN }), 'unknown_symbol', 'an unpriced row')
  assert.equal(reason({ last: 0 }), 'unknown_symbol', 'a zero price is not a price')
  assert.equal(reason({ currency: 'INR' }), 'currency_mismatch')
  assert.equal(reason({ name: 'Totally Different Company' }), 'name_mismatch')
  assert.equal(reason({ asOf: '2022-10-27T00:00:00.000Z' }), 'stale_feed', 'a years-old price')
  assert.equal(reason({ asOf: null }), 'stale_feed', 'a price with no date cannot be called current')
  assert.equal(reason({ last: 10_000 }), 'implausible_price', 'a 100x gap reads as a units error')
  assert.equal(reason({ last: 0.0001 }), 'implausible_price', 'a penny-stock false match')
})

await check('gateRow converts self-declared pence to pounds and then passes', () => {
  // A London listing quoting 9,533 pence against a £95.33 entry price is the SAME price, correctly
  // converted — it must pass, not trip the plausibility band.
  const g = gateRow(row({ last: 9533, currency: 'GBp', name: 'Some Co' }),
    { ticker: 'X', currency: 'GBP', companyName: 'Some Co', entryPrice: 95.33 }, T0, 7)
  assert.equal(g.ok, true)
  assert.equal((g as any).price, 95.33)
  assert.equal((g as any).currency, 'GBP')
})

await check('gateRow catches an UNDECLARED minor unit through the plausibility band', () => {
  // Agorot: the row says ILS while quoting 100x. Nothing declares it, so only the scale gap catches it.
  const g = gateRow(row({ last: 9533, currency: 'ILS', name: 'Some Co' }),
    { ticker: 'X', currency: 'ILS', companyName: 'Some Co', entryPrice: 95.33 }, T0, 7)
  assert.equal(g.ok, false)
  assert.equal((g as any).reason, 'implausible_price')
})

await check('gateRow: the plausibility band still allows a genuinely large market move', () => {
  // A real 4x since the call must NOT be suppressed — the band exists for units errors, not for
  // refusing to believe the market.
  const g = gateRow(row({ last: 400 }), subj, T0, 7)
  assert.equal(g.ok, true)
})

await check('gateRow skips the gates it cannot run rather than refusing on ignorance', () => {
  const noName = gateRow(row({ name: 'Anything At All' }), { ticker: 'X', currency: 'USD' }, T0, 7)
  assert.equal(noName.ok, true, 'no company_name on the record → the name gate cannot judge')
  const noEntry = gateRow(row({ last: 99_999 }), { ticker: 'X', currency: 'USD', companyName: 'Some Co' }, T0, 7)
  assert.equal(noEntry.ok, true, 'no entry price → nothing to measure plausibility against')
})

// ---- the math, against the REAL shipped records ----

await check('callVsLive reproduces the shipped AMZN call re-based onto a live price', () => {
  // analyses/AMZN_2026-07-10/decision_record.json: entry 238.34 USD, expected return -16.1%.
  // Target = 238.34 x (1 - 0.161) = 199.97 — which reconciles with that record's own
  // probability-weighted scenario target of 200.05 (CLAUDE.md §10).
  const r = callVsLive({ entryPrice: 238.34, expectedReturnPct: -16.1, livePrice: 244.85, currency: 'USD', entryPriceTimestamp: '2026-07-01' })
  assert.ok(r)
  assert.equal(r!.implied_target, 199.97)
  assert.equal(r!.move_since_call_pct, 2.7, 'the market rose 2.7% since the call was priced')
  assert.equal(r!.live_expected_return_pct, -18.3, 'buying higher makes the same target a worse return')
  assert.equal(r!.expected_return_delta_pp, -2.2)
  assert.equal(r!.expected_return_pct, -16.1, "the engine's frozen call is returned UNCHANGED")
})

await check('callVsLive: a price BELOW the entry improves the return against the same target', () => {
  const r = callVsLive({ entryPrice: 100, expectedReturnPct: 20, livePrice: 80, currency: 'USD' })
  assert.equal(r!.implied_target, 120)
  assert.equal(r!.move_since_call_pct, -20)
  assert.equal(r!.live_expected_return_pct, 50, '120 from 80 is +50%')
  assert.equal(r!.expected_return_delta_pp, 30)
})

await check('callVsLive: an unmoved price reproduces the original return exactly', () => {
  const r = callVsLive({ entryPrice: 646.15, expectedReturnPct: -13.4, livePrice: 646.15, currency: 'INR' })
  assert.equal(r!.move_since_call_pct, 0)
  assert.equal(r!.live_expected_return_pct, -13.4)
  assert.equal(r!.expected_return_delta_pp, 0)
})

await check('callVsLive: absence, never a fabricated or infinite number', () => {
  // BG_2026-06-01 ships with expected_return_pct but NO entry_price — the re-basing has no anchor.
  assert.equal(callVsLive({ entryPrice: null, expectedReturnPct: -11.5, livePrice: 123.88, currency: 'USD' }), null)
  assert.equal(callVsLive({ entryPrice: 0, expectedReturnPct: 10, livePrice: 50, currency: 'USD' }), null, 'no divide-by-zero Infinity')
  assert.equal(callVsLive({ entryPrice: 100, expectedReturnPct: null, livePrice: 50, currency: 'USD' }), null)
  assert.equal(callVsLive({ entryPrice: 100, expectedReturnPct: 10, livePrice: null, currency: 'USD' }), null)
  assert.equal(callVsLive({ entryPrice: 100, expectedReturnPct: 10, livePrice: 0, currency: 'USD' }), null)
})

// ---- override config sanitization ----

await check('loadSymbolOverrides ignores any value containing :// — hosts can never come from config', () => {
  const f = path.join(tmp(), 'quote_symbols.json')
  fs.writeFileSync(f, JSON.stringify({
    symbols: { EMAAR: 'EMAAR-AE', EVIL: 'https://attacker.example/x', BAD: 'has space', ok2: 'abc-de' },
  }))
  const o = loadSymbolOverrides(f)
  assert.equal(o.EMAAR, 'EMAAR-AE')
  assert.equal(o.EVIL, undefined, 'a URL is never accepted as a symbol')
  assert.equal(o.BAD, undefined)
  assert.equal(o.OK2, 'ABC-DE', 'keys and values are normalised to upper case')
})

await check('loadSymbolOverrides: a missing or malformed file is empty, never a crash', () => {
  assert.deepEqual(loadSymbolOverrides(path.join(tmp(), 'nope.json')), {})
  const f = path.join(tmp(), 'bad.json')
  fs.writeFileSync(f, 'not json at all')
  assert.deepEqual(loadSymbolOverrides(f), {})
})

// ---- the full getQuotes flow ----

const cnbcBody = (rows: unknown) => JSON.stringify({ FormattedQuoteResult: { FormattedQuote: rows } })
const AMZN_ROW = { symbol: 'AMZN', name: 'Amazon.com Inc', last: '244.85', previous_day_closing: '247.55', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NASDAQ', curmktstatus: 'POST_MKT', realTime: 'true' }
const HCG_IN_ROW = { symbol: 'HCG-IN', name: 'Healthcare Global Enterprises Ltd', last: '671.10', last_time: '2026-07-23T09:52:29.000+0500', currencyCode: 'INR', exchange: 'National Stock Exchange of India', curmktstatus: 'REG_MKT', realTime: 'false' }
// The wrong-company hazard, made concrete: the BARE ticker resolves to a different, USD-priced company.
const HCG_BARE_ROW = { symbol: 'HCG', name: 'Some Unrelated US Company', last: '12.34', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NYSE' }

const AMZN_SUBJ = { ticker: 'AMZN', currency: 'USD', exchange: 'NasdaqGS', companyName: 'Amazon.com, Inc.', entryPrice: 238.34 }
const HCG_SUBJ = { ticker: 'HCG', currency: 'INR', exchange: 'NSE', companyName: 'Healthcare Global Enterprises Limited', entryPrice: 646.15 }

function stubFetch(bodyFor: (url: string) => string | null): { fn: typeof fetch; calls: string[] } {
  const calls: string[] = []
  const fn = (async (url: any) => {
    const u = String(url)
    calls.push(u)
    const body = bodyFor(u)
    if (body === null) return { ok: false, status: 503, text: async () => '' } as any
    return { ok: true, status: 200, text: async () => body } as any
  }) as unknown as typeof fetch
  return { fn, calls }
}

const baseDeps = (over: Partial<QuoteDeps> = {}): QuoteDeps => ({
  now: at(T0), stateDir: tmp(), repoRoot: tmp(), ttlMs: 60_000, maxAgeDays: 7, ...over,
})

await check('getQuotes happy path: price, identity fields and the settled-session flag', async () => {
  const { fn } = stubFetch(() => cnbcBody([AMZN_ROW]))
  const q = (await getQuotes([AMZN_SUBJ], baseDeps({ fetchFn: fn }))).get('AMZN')?.quote
  assert.ok(q, 'AMZN resolved')
  assert.equal(q!.symbol, 'AMZN')
  assert.equal(q!.price, 244.85)
  assert.equal(q!.currency, 'USD')
  assert.equal(q!.name, 'Amazon.com Inc')
  assert.equal(q!.as_of_is_close, true, 'a bare date means a settled session, not a live tick')
  assert.equal(q!.delayed, false)
  assert.equal(q!.stale, false)
})

await check('getQuotes picks the exchange-specific symbol and IGNORES the wrong-currency bare match', async () => {
  // Both HCG-IN and HCG come back in one batch. HCG-IN is tried first and clears every gate, so the
  // USD homonym is never even considered. This is the defect the whole module exists to prevent.
  const { fn } = stubFetch(() => cnbcBody([HCG_IN_ROW, HCG_BARE_ROW]))
  const q = (await getQuotes([HCG_SUBJ], baseDeps({ fetchFn: fn }))).get('HCG')?.quote
  assert.ok(q)
  assert.equal(q!.symbol, 'HCG-IN')
  assert.equal(q!.price, 671.1)
  assert.equal(q!.currency, 'INR')
  assert.equal(q!.delayed, true, 'the feed flags itself as not real-time — surfaced, not hidden')
})

await check('getQuotes refuses when ONLY a wrong-currency match exists, and NAMES the reason', async () => {
  const { fn } = stubFetch(() => cnbcBody([HCG_BARE_ROW]))
  const o = (await getQuotes([HCG_SUBJ], baseDeps({ fetchFn: fn }))).get('HCG')
  assert.equal(o!.quote, null, 'no price beats the wrong price')
  assert.equal(o!.reason, 'currency_mismatch')
})

await check('getQuotes refuses a RIGHT-currency, WRONG-company answer', async () => {
  // The subtlest hazard: right currency, right country, right exchange, different company.
  const imposter = { symbol: 'CS-CH', name: 'AXA SA', last: '31.20', last_time: '2026-07-22', currencyCode: 'CHF', exchange: 'Swiss Exchange' }
  const { fn } = stubFetch(() => cnbcBody([imposter]))
  const o = (await getQuotes([{ ticker: 'CS', currency: 'CHF', exchange: 'SIX Swiss Exchange', companyName: 'Credit Suisse Group AG', entryPrice: 30 }],
    baseDeps({ fetchFn: fn }))).get('CS')
  assert.equal(o!.quote, null)
  assert.equal(o!.reason, 'name_mismatch')
})

await check('getQuotes refuses a delisted ticker still serving a years-old price', async () => {
  // Everything on this row looks healthy — REG_MKT, realTime true, a plausible change. Only the date
  // gives it away.
  const dead = { symbol: 'ZZZ', name: 'Gone Co', last: '53.70', last_time: '2022-10-27', currencyCode: 'USD', exchange: 'NYSE', curmktstatus: 'REG_MKT', realTime: 'true' }
  const { fn } = stubFetch(() => cnbcBody([dead]))
  const o = (await getQuotes([{ ticker: 'ZZZ', currency: 'USD', exchange: 'NYSE', companyName: 'Gone Co', entryPrice: 50 }],
    baseDeps({ fetchFn: fn }))).get('ZZZ')
  assert.equal(o!.quote, null, 'a stale price is the most dangerous kind of wrong — nothing looks wrong')
  assert.equal(o!.reason, 'stale_feed')
})

await check('getQuotes converts a pence-quoted London listing to pounds end to end', async () => {
  const lse = { symbol: 'AAA-GB', name: 'Example Plc', last: '1,250.50', last_time: '2026-07-22', currencyCode: 'GBp', exchange: 'London Stock Exchange' }
  const { fn } = stubFetch(() => cnbcBody([lse]))
  const q = (await getQuotes([{ ticker: 'AAA', currency: 'GBP', exchange: 'London Stock Exchange', companyName: 'Example Plc', entryPrice: 12 }],
    baseDeps({ fetchFn: fn }))).get('AAA')?.quote
  assert.ok(q)
  assert.equal(q!.price, 12.51, '1,250.50 pence is £12.51 — not £1,250.50')
  assert.equal(q!.currency, 'GBP')
})

await check('getQuotes: a listing no feed can price is absent with a reason (the Dubai case)', async () => {
  const { fn } = stubFetch(() => cnbcBody([AMZN_ROW, { symbol: 'EMAAR-AE', code: 3 }]))
  const m = await getQuotes([
    { ticker: 'EMAAR', currency: 'AED', exchange: 'Dubai Financial Market', companyName: 'Emaar Properties PJSC', entryPrice: 12.2 },
    AMZN_SUBJ,
  ], baseDeps({ fetchFn: fn }))
  assert.equal(m.get('EMAAR')!.quote, null)
  assert.equal(m.get('EMAAR')!.reason, 'unknown_symbol')
  assert.ok(m.get('AMZN')!.quote, 'one unquotable listing never suppresses the others in the batch')
})

await check('getQuotes: a subject with no currency is refused — the first gate has nothing to check', async () => {
  const { fn, calls } = stubFetch(() => cnbcBody([AMZN_ROW]))
  const m = await getQuotes([{ ticker: 'AMZN', currency: null }], baseDeps({ fetchFn: fn }))
  assert.equal(m.get('AMZN')!.quote, null)
  assert.equal(m.get('AMZN')!.reason, 'no_currency')
  assert.equal(calls.length, 0, 'an unverifiable subject does not even cost a fetch')
})

await check('getQuotes batches every subject into ONE call', async () => {
  const { fn, calls } = stubFetch(() => cnbcBody([AMZN_ROW, HCG_IN_ROW]))
  const m = await getQuotes([AMZN_SUBJ, HCG_SUBJ], baseDeps({ fetchFn: fn }))
  assert.ok(m.get('AMZN')!.quote && m.get('HCG')!.quote)
  assert.equal(calls.length, 1, 'quoting the whole ledger costs one round trip')
})

await check('getQuotes serves the cache within TTL — no refetch', async () => {
  const { fn, calls } = stubFetch(() => cnbcBody([AMZN_ROW]))
  const deps = baseDeps({ fetchFn: fn })
  await getQuotes([AMZN_SUBJ], deps)
  assert.equal(calls.length, 1)
  await getQuotes([AMZN_SUBJ], { ...deps, now: at(T0 + 30_000) }) // still inside the 60s TTL
  assert.equal(calls.length, 1, 'the second call was served from cache')
})

await check('getQuotes keeps the previous price and flags stale when a due refresh fails', async () => {
  let fail = false
  const { fn, calls } = stubFetch(() => (fail ? null : cnbcBody([AMZN_ROW])))
  const deps = baseDeps({ fetchFn: fn })
  const first = await getQuotes([AMZN_SUBJ], deps)
  assert.equal(first.get('AMZN')!.quote!.stale, false)

  fail = true
  // Past the TTL and past nothing else: the clock advance stays inside maxAgeDays so the AGE gate is
  // not what is being tested here — only the refresh failing.
  const q = (await getQuotes([AMZN_SUBJ], { ...deps, now: at(T0 + 120_000) })).get('AMZN')!.quote
  assert.ok(q, 'a real-but-old price beats no price')
  assert.equal(q!.price, 244.85)
  assert.equal(q!.stale, true, 'and it must say it is not fresh')
  assert.ok(calls.length >= 2, 'the refresh was genuinely attempted')
})

await check('getQuotes single-flight: two concurrent calls share ONE fetch', async () => {
  let release: (() => void) | null = null
  const gate = new Promise<void>((r) => { release = r })
  const calls: string[] = []
  const fn = (async (url: any) => {
    calls.push(String(url))
    await gate
    return { ok: true, status: 200, text: async () => cnbcBody([AMZN_ROW]) } as any
  }) as unknown as typeof fetch
  const deps = baseDeps({ fetchFn: fn })
  const both = Promise.all([getQuotes([AMZN_SUBJ], deps), getQuotes([AMZN_SUBJ], deps)])
  release!()
  const [a, b] = await both
  assert.equal(calls.length, 1, 'the concurrent caller joined the in-flight fetch')
  assert.equal(a.get('AMZN')!.quote!.price, 244.85)
  assert.equal(b.get('AMZN')!.quote!.price, 244.85)
})

await check('getQuotes caches the NEGATIVE answer so an unknown symbol does not refetch forever', async () => {
  const { fn, calls } = stubFetch(() => cnbcBody([AMZN_ROW])) // EMAAR-AE never appears
  const deps = baseDeps({ fetchFn: fn })
  const subject = [{ ticker: 'EMAAR', currency: 'AED', exchange: 'Dubai Financial Market', companyName: 'Emaar Properties PJSC', entryPrice: 12.2 }]
  await getQuotes(subject, deps)
  const n = calls.length
  await getQuotes(subject, { ...deps, now: at(T0 + 30_000) })
  assert.equal(calls.length, n, 'an unresolvable ticker is not re-fetched on every single request')
})

await check('getQuotes reports feed_unavailable when the service cannot be reached at all', async () => {
  const { fn } = stubFetch(() => null)
  const o = (await getQuotes([AMZN_SUBJ], baseDeps({ fetchFn: fn }))).get('AMZN')
  assert.equal(o!.quote, null)
  assert.equal(o!.reason, 'feed_unavailable', 'a dead feed is named, not silently blank')
})

await check('getQuotes honours an override symbol from the repo config', async () => {
  const repoRoot = tmp()
  fs.mkdirSync(path.join(repoRoot, 'frameworks'), { recursive: true })
  fs.writeFileSync(path.join(repoRoot, 'frameworks', 'quote_symbols.json'), JSON.stringify({ symbols: { WEIRD: 'AMZN' } }))
  const { fn } = stubFetch(() => cnbcBody([AMZN_ROW]))
  const m = await getQuotes([{ ticker: 'WEIRD', currency: 'USD', exchange: 'Some Venue', companyName: 'Amazon.com, Inc.', entryPrice: 238.34 }],
    baseDeps({ fetchFn: fn, repoRoot }))
  assert.equal(m.get('WEIRD')!.quote!.symbol, 'AMZN', 'the override replaces derivation entirely')
})

await check('getQuotes never throws — a hostile fetch is absence, not a crash', async () => {
  const fn = (async () => { throw new Error('boom') }) as unknown as typeof fetch
  const m = await getQuotes([AMZN_SUBJ], baseDeps({ fetchFn: fn }))
  assert.equal(m.get('AMZN')?.quote ?? null, null)
})

for (const d of tmpdirs) { try { fs.rmSync(d, { recursive: true, force: true }) } catch { /* best effort */ } }
console.log(`\nequity-quote.test.ts: ${passed} passed`)
