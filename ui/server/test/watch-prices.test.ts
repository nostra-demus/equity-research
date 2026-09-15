// The watcher's own price record (src/watch/prices.ts). The feed's "previous close" cannot be trusted on
// about half of exchanges, so the day move is measured against the last price this record saw in an
// earlier session — and a listing's venue identifies its market, with currency for ambiguous descriptions.
// Run: npx tsx test/watch-prices.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { emptyPriceRecord, marketIndexFor, observe, previousClose, quoteListings, sessionMove, sessionOf } from '../src/watch/prices'
import type { QuoteOutcome, QuoteSubject } from '../src/news/equity-quote'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log('  ok ', name)
  } catch (e) {
    console.error('  FAIL', name)
    console.error('   ', e)
    process.exitCode = 1
  }
}

const now = new Date('2026-09-15T15:00:00Z')

async function main() {
  await check('a session is the UTC date of the price itself', () => {
    assert.equal(sessionOf('2026-09-14T00:00:00.000Z', now), '2026-09-14') // a settled close
    assert.equal(sessionOf('2026-09-15T07:09:24.000Z', now), '2026-09-15') // a live tick
    assert.equal(sessionOf(null, now), '2026-09-15')
  })

  await check("the day move is against our own previous session's last price", () => {
    const rec = emptyPriceRecord()
    observe(rec, 'A|USD', 100, '2026-09-14T00:00:00Z', now)
    observe(rec, 'A|USD', 95, '2026-09-15T14:00:00Z', now)
    observe(rec, 'A|USD', 92, '2026-09-15T15:00:00Z', now)
    assert.equal(previousClose(rec, 'A|USD', '2026-09-15'), 100)
    assert.equal(sessionMove(rec, 'A|USD', 90, '2026-09-15'), -10)
    observe(rec, 'A|USD', 50, '2026-09-13T00:00:00Z', now)
    assert.equal(rec.series['A|USD'].length, 2, 'an older session arriving late never rewrites history')
  })

  await check('no previous session recorded yet: no day move, never a zero', () => {
    const rec = emptyPriceRecord()
    observe(rec, 'B|USD', 10, '2026-09-15T14:00:00Z', now)
    assert.equal(sessionMove(rec, 'B|USD', 9, '2026-09-15'), null)
  })

  await check("a listing's venue identifies its market, with currency for ambiguous descriptions", () => {
    assert.equal(marketIndexFor('NasdaqGS', 'USD')?.symbol, '.SPX')
    assert.equal(marketIndexFor('LSE', 'USD'), null, 'a foreign-currency London line is not the S&P 500')
    assert.equal(marketIndexFor('TSX', 'USD'), null, 'a foreign-currency Toronto line is not the S&P 500')
    assert.equal(marketIndexFor('HKEX', 'USD')?.symbol, '.HSI')
    assert.equal(marketIndexFor('SHSE (also HKEX-listed)', 'EUR'), null, 'ambiguity without a matching currency stays unknown')
    assert.equal(marketIndexFor('SHSE:600690 (also HKEX-listed)', 'CNY')?.symbol, '.SSEC')
    assert.equal(marketIndexFor('DFM', 'AED')?.symbol, '.DFMGI')
    assert.equal(marketIndexFor('Oslo Børs (OB:NHY)', 'NOK')?.symbol, '.OSEAX')
    assert.equal(marketIndexFor('NSE (also listed BSE:542726)', 'INR')?.symbol, '.NSEI')
    assert.equal(marketIndexFor('XTRA (Deutsche Börse Xetra)', 'EUR'), null, 'no index for that market: no comparison, said plainly')
  })

  await check('one quote call per collision depth, and none for a listing with no currency', async () => {
    const calls: QuoteSubject[][] = []
    const fake = async (s: QuoteSubject[]) => {
      calls.push(s)
      return new Map<string, QuoteOutcome>(s.map((x) => [x.ticker, { quote: null, reason: 'unknown_symbol' }]))
    }
    const out = await quoteListings([
      { key: 'X|USD', ticker: 'X', currency: 'USD', exchange: null, companyName: null, entryPrice: null },
      { key: 'X|GBP', ticker: 'X', currency: 'GBP', exchange: null, companyName: null, entryPrice: null },
      { key: 'Y|USD', ticker: 'Y', currency: 'USD', exchange: null, companyName: null, entryPrice: null },
      { key: 'Z|', ticker: 'Z', currency: null, exchange: null, companyName: null, entryPrice: null },
    ], fake)
    assert.equal(calls.length, 2)
    assert.deepEqual([...out.keys()].sort(), ['X|GBP', 'X|USD', 'Y|USD'])
  })

  console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
}

void main()
