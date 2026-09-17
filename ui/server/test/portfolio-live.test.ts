// liveMark (portfolio-live.ts) — the gap between the last statement and today, priced at the market.
//
// The two hazards this file exists to catch:
//   - a bought OPTION reusing its underlying's broker symbol getting quoted as if it were the stock
//     (its $5 premium repriced to a $200 share price), and
//   - a London/pence-style statement mark (a per-share price in the minor unit under one currency code)
//     compared directly against a live quote already normalised to the major unit — a ~100x error either
//     way.
// Run: npx tsx test/portfolio-live.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { NEWS } from '../src/config'
import { liveMark } from '../src/portfolio-live'
import type { Book, BookPosition } from '../src/portfolio'
import type { QuoteDeps } from '../src/news/equity-quote'

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void | Promise<void>): void | Promise<void> {
  const done = (): void => { passed++; console.log(`  ok   ${name}`) }
  const failed = (e: any): void => { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.stack || e?.message || e}`) }
  try {
    const r = fn()
    if (r && typeof (r as any).then === 'function') return (r as Promise<void>).then(done, failed)
    done()
  } catch (e) { failed(e) }
}

if (!NEWS.quoteEnabled) {
  console.log('portfolio-live.test.ts: skipped (NEWS_QUOTE_ENABLED=0 in this environment)')
  process.exit(0)
}

const tmpdirs: string[] = []
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-live-')); tmpdirs.push(d); return d }
const T0 = Date.parse('2026-07-23T10:00:00Z')

function stubFetch(bodyFor: (url: string) => string | null): typeof fetch {
  return (async (url: any) => {
    const body = bodyFor(String(url))
    if (body === null) return { ok: false, status: 503, text: async () => '' } as any
    return { ok: true, status: 200, text: async () => body } as any
  }) as unknown as typeof fetch
}
const cnbcBody = (rows: unknown) => JSON.stringify({ FormattedQuoteResult: { FormattedQuote: rows } })
const baseDeps = (fetchFn: typeof fetch): QuoteDeps => ({
  now: () => new Date(T0), stateDir: tmp(), repoRoot: tmp(), ttlMs: 60_000, maxAgeDays: 7, fetchFn,
})

const pos = (o: Partial<BookPosition> & { symbol: string }): BookPosition => ({
  conid: '1', assetCategory: 'STK', subCategory: null, expiry: null, strike: null, putCall: null,
  currency: 'USD', quantity: 100, markPrice: 50, costBasisPrice: 40, costBasisMoney: 4000,
  positionValue: 5000, percentOfNAV: 5, unrealizedLocal: 1000, fxRateToBase: 1, multiplier: 1,
  isDerivative: false, ...o,
})
const bookOf = (positions: BookPosition[], nav = 100_000): Book => ({
  positionsAsOf: null, accountId: 'U1', baseCurrency: 'USD', asOf: '2026-07-16',
  coverage: { from: '2026-01-01', to: '2026-07-16', documents: 1, gaps: [] },
  sectionsPresent: [], sectionsUnmodelled: [], positions, openLots: [], closures: [], executions: [],
  flows: [], income: { dividendsGross: 0, withholdingTax: 0, paymentInLieu: 0, interest: 0, fees: 0, net: 0 },
  accruals: { dividend: null, interest: null, total: null }, navSeries: [{ date: '2026-07-16', total: nav }],
  twr: null, corporateActions: [], reconciliation: { ok: true, checks: [] }, warnings: [],
})

// ---- P1: a bought option never rides its underlying's own equity quote ----

await check('an OPTION sharing its underlying\'s broker symbol is never quoted as the equity', async () => {
  const stock = pos({ symbol: 'AAPL', conid: '1' })
  const option = pos({
    symbol: 'AAPL', conid: '2', assetCategory: 'OPT', isDerivative: false,
    markPrice: 5, positionValue: 500, costBasisMoney: 400, quantity: 10, multiplier: 100,
  })
  const fetchFn = stubFetch(() => cnbcBody([
    { symbol: 'AAPL', name: 'Apple Inc', last: '200.00', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NASDAQ', curmktstatus: 'POST_MKT', realTime: 'true' },
  ]))
  const m = await liveMark(bookOf([stock, option]), baseDeps(fetchFn))
  assert.equal(m.priced.length, 1, 'exactly one row is priced — the equity')
  assert.equal(m.priced[0]!.symbol, 'AAPL')
  assert.ok(Math.abs(m.priced[0]!.value - 5000 * (200 / 50)) < 0.01, 'the equity itself is repriced normally')
  // The option never appears in `priced` (it is excluded from the quote-eligible holdings before the
  // fetch is even made) and its statement value is folded into cash, exactly like a derivative's.
  assert.equal(m.unpriced.includes('AAPL'), false, 'the option is excluded outright, not merely unpriced')
  assert.ok(Math.abs(m.cash - (100_000 - 5000)) < 0.01, 'the option\'s $500 statement value sits in cash, not mispriced at $20,000')
})

// ---- P1: a London/pence-style statement mark is aligned to the live quote's major unit ----

await check('a pence statement mark (GBP currency code, pence-scale price) is aligned before scaling', async () => {
  // £12.75 live against a position whose OWN value (£1,250) reconciles with a markPrice of "1250" only if
  // that 1250 is read as pence (1250p = £12.50), not as £1,250 a share.
  const lse = pos({
    symbol: 'AAA', currency: 'GBP', markPrice: 1250, positionValue: 1250, costBasisMoney: 1000,
    quantity: 100, multiplier: 1, fxRateToBase: 1.3,
  })
  const fetchFn = stubFetch(() => cnbcBody([
    { symbol: 'AAA-GB', name: 'Example Plc', last: '1275', last_time: '2026-07-22', currencyCode: 'GBp', exchange: 'London Stock Exchange', curmktstatus: 'REG_MKT', realTime: 'true' },
  ]))
  const m = await liveMark(bookOf([lse]), baseDeps(fetchFn))
  assert.equal(m.priced.length, 1)
  const row = m.priced[0]!
  assert.ok(Math.abs(row.price - 12.75) < 0.001, 'the live price is already normalised to pounds')
  // Without alignment: 1250 * (12.75/1250) * 1.3 ≈ 16.6 (a ~99% collapse). Aligned: 1250 * (12.75/12.50) *
  // 1.3 ≈ 1,657.5 (base currency) — the same ~+2% move the statement's own value would have made.
  assert.ok(Math.abs(row.value - 1250 * (12.75 / 12.50) * 1.3) < 0.5, `expected ~1,657.5 (aligned), got ${row.value}`)
  assert.ok(row.movePct !== null && Math.abs(row.movePct - 2) < 1, `expected a ~+2% move, got ${row.movePct}`)
})

await check('a percent-of-par bond is not mistaken for a pence/pounds units error', async () => {
  // value = face × price/100: 10,000 face at 98.5 is worth 9,850, so the implied ratio is legitimately
  // 0.01 — inside the pence-detector's band. A BOND is already on the same percent-of-par basis as its
  // live quote, so no ÷100 applies; before the fix the spurious divisor scaled a ~99 quote as a ~100×
  // move (value ≈ 990,000 instead of ≈ 9,900).
  const bond = pos({
    symbol: 'GB00', assetCategory: 'BOND', currency: 'USD', markPrice: 98.5, positionValue: 9_850,
    costBasisMoney: 9_800, quantity: 10_000, multiplier: 1, fxRateToBase: 1,
  })
  const fetchFn = stubFetch(() => cnbcBody([
    { symbol: 'GB00', name: 'Example Bond', last: '99.00', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NASDAQ', curmktstatus: 'REG_MKT', realTime: 'true' },
  ]))
  const m = await liveMark(bookOf([bond]), baseDeps(fetchFn))
  assert.equal(m.priced.length, 1)
  const row = m.priced[0]!
  assert.ok(Math.abs(row.value - 9_850 * (99 / 98.5)) < 0.5, `expected the par-scaled value ~9,900, got ${row.value}`)
  assert.ok(row.value < 20_000, `a percent-of-par bond must not be inflated ~100× (got ${row.value})`)
})

await check('a genuine ~5x move between the statement and today is never mistaken for a pence/pounds mismatch', async () => {
  const p = pos({ symbol: 'MOON', markPrice: 10, positionValue: 1000, quantity: 100 })
  const fetchFn = stubFetch(() => cnbcBody([
    { symbol: 'MOON', name: 'Moon Co', last: '48.00', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NYSE', curmktstatus: 'POST_MKT', realTime: 'true' },
  ]))
  const m = await liveMark(bookOf([p]), baseDeps(fetchFn))
  assert.ok(Math.abs(m.priced[0]!.value - 1000 * (48 / 10)) < 0.01, `a real 4.8x move must scale normally, got ${m.priced[0]!.value}`)
})

// ---- each row carries its OWN quote date, not only the mark's aggregate ----

await check('each priced row carries its own quote date and close status', async () => {
  const p = pos({ symbol: 'GOOG' })
  const fetchFn = stubFetch(() => cnbcBody([
    { symbol: 'GOOG', name: 'Alphabet Inc', last: '55.00', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NASDAQ', curmktstatus: 'POST_MKT', realTime: 'true' },
  ]))
  const m = await liveMark(bookOf([p]), baseDeps(fetchFn))
  assert.equal(m.priced[0]!.asOf, '2026-07-22')
  assert.equal(m.priced[0]!.asOfIsClose, true, 'a bare date is a settled session, not a live tick')
})

// ---- a symbol held more than once (two lots, or two currency lines) is carried on the statement ----
// The blotter (positionMarks.ts livePriceIndex, `seen !== 1`) drops a symbol held by more than one position
// and shows every such line on the statement. This estimate is the whole the blotter's weights and cash
// residual divide by (navNow = live.nav), so a duplicated symbol must be carried on the SAME statement basis.
// Pricing it here inflates live.nav by its move, which the blotter then leaks into displayed cash — the
// precise §15 defect: a holding's move must not be absorbed into the cash residual.
await check('a symbol held more than once is carried on the statement, not summed into the live NAV', async () => {
  // Two lots of SHEL in one currency (the case the quote map genuinely double-counts) beside a uniquely-held
  // SOLO. A two-currency SHEL is excluded the same way (heldCount keys by symbol); this covers the lot case.
  const shelA = pos({ symbol: 'SHEL', conid: '10', currency: 'USD', markPrice: 50, positionValue: 1000, costBasisMoney: 800, quantity: 20, fxRateToBase: 1 })
  const shelB = pos({ symbol: 'SHEL', conid: '11', currency: 'USD', markPrice: 50, positionValue: 1000, costBasisMoney: 800, quantity: 20, fxRateToBase: 1 })
  const solo = pos({ symbol: 'SOLO', conid: '12', currency: 'USD', markPrice: 50, positionValue: 5000, costBasisMoney: 5000, quantity: 100, fxRateToBase: 1 })
  const fetchFn = stubFetch(() => cnbcBody([
    { symbol: 'SHEL', name: 'Shell', last: '55.00', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NYSE', curmktstatus: 'POST_MKT', realTime: 'true' },
    { symbol: 'SOLO', name: 'Solo Co', last: '55.00', last_time: '2026-07-22', currencyCode: 'USD', exchange: 'NYSE', curmktstatus: 'POST_MKT', realTime: 'true' },
  ]))
  const m = await liveMark(bookOf([shelA, shelB, solo]), baseDeps(fetchFn))
  // Only the uniquely-held symbol is priced; the duplicated SHEL never appears in `priced`.
  // Pre-fix: both SHEL lots are priced (`['SOLO','SHEL','SHEL']`).
  assert.deepEqual(m.priced.map((r) => r.symbol), ['SOLO'], `only the uniquely-held symbol is priced, got ${JSON.stringify(m.priced.map((r) => r.symbol))}`)
  // SOLO moved 5,000 -> 5,500 (+500); SHEL is carried at its 2×1,000 statement value, so the live NAV moves
  // by SOLO's +500 ONLY. Pre-fix, BOTH SHEL lots were priced at 1,100 (a +200 move), inflating NAV to 100,700
  // — a move the blotter (which shows SHEL on the statement) would then leak into displayed cash.
  assert.ok(m.nav !== null && Math.abs(m.nav - 100_500) < 0.01, `SHEL's move must NOT reach the live NAV (expected 100,500, got ${m.nav})`)
  // Cash stays the statement residual (100,000 − 7,000 of priceable statement value).
  assert.ok(m.cash !== null && Math.abs(m.cash - (100_000 - 7_000)) < 0.01, `cash is the statement residual (got ${m.cash})`)
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
