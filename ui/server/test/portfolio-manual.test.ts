// Hand-logged fills: validation, storage, and the one case the whole feature turns on — an entry stops
// counting the moment a statement covers its date, and is never silently thrown away when it does.
// Hermetic: writes to a throwaway directory, so no real book is involved.
// Run: npx tsx test/portfolio-manual.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  addManual, clearSuperseded, deleteManual, MANUAL_MAX_ENTRIES, normalizeManual, provisionalRead, readManual,
  type ManualTrade, type StatementCoverage,
} from '../src/portfolio-manual'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fundbook-manual-'))

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}
const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps

const TODAY = '2026-08-25'
const good = {
  symbol: 'amzn', side: 'buy', quantity: 10, price: 190.5, currency: 'usd',
  tradeDate: '2026-08-25', commission: 1.25, note: '  added on the print  ',
}
/** A fresh directory per case, so no test can depend on another's file. */
function dir(name: string): string {
  const d = path.join(TMP, name)
  fs.mkdirSync(d, { recursive: true })
  return d
}
function make(over: Partial<typeof good> = {}, today = TODAY): ManualTrade {
  return normalizeManual({ ...good, ...over } as any, today)
}

// ---------- validation ----------
check('a valid entry is normalised — symbol and currency upper-cased, note trimmed', () => {
  const t = make()
  assert.equal(t.symbol, 'AMZN')
  assert.equal(t.currency, 'USD')
  assert.equal(t.note, 'added on the print')
  assert.equal(t.side, 'buy')
  assert.match(t.id, /^[0-9a-f]{16}$/)
})

check('quantity is stored positive and the SIDE carries the direction', () => {
  // A signed quantity plus a side is two sources of truth for one fact, and they can disagree.
  const sell = make({ side: 'sell', quantity: 4 })
  assert.equal(sell.quantity, 4)
  const { trades } = provisionalRead([sell], [], [])
  assert.equal(trades[0]!.signedQuantity, -4)
})

check('nonsense is refused with a message the operator can act on', () => {
  const bad: [Partial<typeof good>, RegExp][] = [
    [{ symbol: '' }, /symbol/],
    [{ symbol: 'A'.repeat(25) }, /symbol/],
    [{ symbol: 'AM;ZN' }, /symbol/],
    [{ side: 'short' }, /buy or sell/],
    [{ quantity: 0 }, /quantity/],
    [{ quantity: -3 }, /quantity/],
    [{ quantity: 'ten' as any }, /quantity/],
    [{ price: 0 }, /price/],
    [{ currency: 'DOLLARS' }, /three-letter/],
    [{ tradeDate: '25-08-2026' }, /calendar date/],
    [{ tradeDate: '2026-02-30' }, /calendar date/], // regex-shaped, not a real day
    [{ commission: -1 }, /commission/],
    [{ note: 'x'.repeat(201) }, /note/],
  ]
  for (const [over, re] of bad) {
    assert.throws(() => make(over), re, `expected ${JSON.stringify(over)} to be refused`)
  }
})

check('a fill dated tomorrow is refused — it could never be superseded', () => {
  // The trap this closes: a mistyped year sits in the list forever, because no statement will ever
  // cover a date that has not arrived.
  assert.throws(() => make({ tradeDate: '2026-08-26' }), /future/)
  assert.doesNotThrow(() => make({ tradeDate: TODAY }), 'today is a valid fill date')
})

check('commission defaults to zero rather than refusing the entry', () => {
  assert.equal(normalizeManual({ ...good, commission: undefined } as any, TODAY).commission, 0)
  assert.equal(normalizeManual({ ...good, commission: '' } as any, TODAY).commission, 0)
})

// ---------- storage ----------
check('entries round-trip through disk, oldest first', () => {
  const d = dir('roundtrip')
  addManual(d, make({ tradeDate: '2026-08-20' }))
  addManual(d, make({ tradeDate: '2026-08-10', symbol: 'CANE' }))
  const all = readManual(d)
  assert.deepEqual(all.map((t) => t.symbol), ['CANE', 'AMZN'])
})

check('a corrupt file reads as empty rather than taking the portfolio down with it', () => {
  // These are an overlay on the book, not the book. Losing them must never cost the operator the
  // statements, which are the thing that actually matters.
  const d = dir('corrupt')
  fs.writeFileSync(path.join(d, 'manual.json'), '[{"id":"aa",')
  assert.deepEqual(readManual(d), [])
  fs.writeFileSync(path.join(d, 'manual.json'), '{"not":"an array"}')
  assert.deepEqual(readManual(d), [])
})

check('a half-written row is skipped, and the readable rows around it survive', () => {
  const d = dir('partial')
  const ok = make()
  fs.writeFileSync(path.join(d, 'manual.json'), JSON.stringify([
    ok,
    { id: 'no-side', symbol: 'X', quantity: 1, price: 1, tradeDate: '2026-08-01' },
    { symbol: 'no-id', side: 'buy', quantity: 1, price: 1, tradeDate: '2026-08-01' },
  ]))
  const all = readManual(d)
  assert.equal(all.length, 1)
  assert.equal(all[0]!.symbol, 'AMZN')
})

check('an id is never a caller-supplied path, and a miss is reported rather than silently succeeding', () => {
  const d = dir('delete')
  const t = addManual(d, make())
  assert.equal(deleteManual(d, '../../etc/passwd'), false)
  assert.equal(deleteManual(d, 'nope'), false)
  assert.equal(readManual(d).length, 1)
  assert.equal(deleteManual(d, t.id), true)
  assert.equal(readManual(d).length, 0)
})

check('the list is bounded', () => {
  const d = dir('cap')
  for (let i = 0; i < MANUAL_MAX_ENTRIES; i++) addManual(d, make())
  assert.throws(() => addManual(d, make()), /full/)
  assert.equal(readManual(d).length, MANUAL_MAX_ENTRIES)
})

// ---------- superseding: the case the feature turns on ----------
const COVER: StatementCoverage[] = [
  { id: 'a'.repeat(16), filename: 'jan-jun.xml', fromDate: '2026-01-01', toDate: '2026-06-30', hasTrades: true },
  { id: 'b'.repeat(16), filename: 'jul.xml', fromDate: '2026-07-01', toDate: '2026-07-31', hasTrades: true },
]

check('an entry inside a statement window is superseded; one after it stays live', () => {
  const inside = make({ tradeDate: '2026-07-15' })
  const after = make({ tradeDate: '2026-08-20' })
  const read = provisionalRead([inside, after], COVER, [])
  assert.equal(read.trades[0]!.supersededBy?.filename, 'jul.xml')
  assert.equal(read.trades[1]!.supersededBy, null)
  assert.equal(read.live, 1)
  assert.equal(read.superseded, 1)
})

check('the window is inclusive at both ends', () => {
  const first = make({ tradeDate: '2026-07-01' })
  const last = make({ tradeDate: '2026-07-31' })
  const dayBefore = make({ tradeDate: '2026-06-30' }) // covered by the OTHER statement
  const gap = make({ tradeDate: '2026-08-01' })
  const read = provisionalRead([first, last, dayBefore, gap], COVER, [])
  assert.deepEqual(read.trades.map((t) => !!t.supersededBy), [true, true, true, false])
})

check('supersede is by DATE COVERAGE, not by matching a row', () => {
  // The entry the operator most needs to see is one the broker never executed. Matching on symbol and
  // quantity would quietly leave it live and let it keep changing the provisional position forever;
  // date coverage answers it, and the entry is then listed as superseded for them to compare.
  const neverHappened = make({ tradeDate: '2026-07-15', symbol: 'GHOST', quantity: 999 })
  const read = provisionalRead([neverHappened], COVER, [])
  assert.equal(read.trades[0]!.supersededBy?.filename, 'jul.xml')
  assert.equal(read.effects.length, 0, 'it no longer moves any position')
})

check('a statement with no stated range answers for nothing', () => {
  const t = make({ tradeDate: '2026-07-15' })
  const noRange: StatementCoverage[] = [{ id: 'c'.repeat(16), filename: 'x.xml', fromDate: null, toDate: null, hasTrades: true }]
  assert.equal(provisionalRead([t], noRange, []).trades[0]!.supersededBy, null)
})

check('a statement that returned no trade rows answers for nothing either', () => {
  // A Flex query run with the Trades section unticked covers the dates and contains not one fill. Letting
  // it supersede on dates alone offered to clear the operator's only record of a real trade on the
  // strength of a statement that never held it.
  const t = make({ tradeDate: '2026-07-15' })
  const noTrades: StatementCoverage[] = [
    { id: 'd'.repeat(16), filename: 'nav-only.xml', fromDate: '2026-07-01', toDate: '2026-07-31', hasTrades: false },
  ]
  assert.equal(provisionalRead([t], noTrades, []).trades[0]!.supersededBy, null)
  assert.equal(provisionalRead([t], noTrades, []).live, 1, 'it stays live, and keeps moving the provisional position')
})

check('superseded entries are KEPT until the operator clears them', () => {
  // Deleting what someone typed, silently, because an unrelated file arrived, is not something a tool
  // holding real money should do.
  const d = dir('supersede')
  addManual(d, make({ tradeDate: '2026-07-15' }))
  addManual(d, make({ tradeDate: '2026-08-20' }))
  assert.equal(readManual(d).length, 2, 'reading never removes anything')
  assert.equal(provisionalRead(readManual(d), COVER, []).superseded, 1)

  assert.equal(clearSuperseded(d, COVER), 1)
  const left = readManual(d)
  assert.equal(left.length, 1)
  assert.equal(left[0]!.tradeDate, '2026-08-20', 'the live entry is untouched')
  assert.equal(clearSuperseded(d, COVER), 0, 'clearing again is a no-op')
})

check('removing a statement makes the entries it answered live again', () => {
  // Superseding is DERIVED on every read, never a flag frozen at upload time. Otherwise removing a bad
  // statement would leave its entries permanently marked as answered by a file that no longer exists.
  const t = make({ tradeDate: '2026-07-15' })
  assert.ok(provisionalRead([t], COVER, []).trades[0]!.supersededBy)
  assert.equal(provisionalRead([t], [COVER[0]!], []).trades[0]!.supersededBy, null)
})

// ---------- the provisional effect ----------
check('live entries roll up per symbol against what the book actually holds', () => {
  const held = [{ symbol: 'AMZN', currency: 'USD', quantity: 100 }, { symbol: 'CANE', currency: 'USD', quantity: 50 }]
  const read = provisionalRead([
    make({ tradeDate: '2026-08-20', symbol: 'AMZN', side: 'buy', quantity: 10, price: 200, commission: 1 }),
    make({ tradeDate: '2026-08-21', symbol: 'AMZN', side: 'sell', quantity: 4, price: 210, commission: 1 }),
    make({ tradeDate: '2026-08-22', symbol: 'NVDA', side: 'buy', quantity: 5, price: 100, commission: 0 }),
  ], COVER, held)

  const amzn = read.effects.find((e) => e.symbol === 'AMZN')!
  assert.equal(amzn.bookQuantity, 100)
  assert.equal(amzn.delta, 6)
  assert.equal(amzn.provisionalQuantity, 106)
  assert.equal(amzn.trades, 2)
  // −(10×200) − 1 + (4×210) − 1 = −2000 − 1 + 840 − 1
  assert.ok(near(amzn.cashEffect, -1162), `got ${amzn.cashEffect}`)

  const nvda = read.effects.find((e) => e.symbol === 'NVDA')!
  assert.equal(nvda.bookQuantity, null, 'a name the book has never held reads as null, not 0')
  assert.equal(nvda.provisionalQuantity, 5)
  assert.equal(read.effects.length, 2, 'CANE has no entries, so it has no provisional row')
})

check('the same ticker in two currencies is two rows, never one blended cash figure', () => {
  const read = provisionalRead([
    make({ tradeDate: '2026-08-20', symbol: 'RIO', currency: 'usd', quantity: 10, price: 60 }),
    make({ tradeDate: '2026-08-20', symbol: 'RIO', currency: 'gbp', quantity: 10, price: 47 }),
  ], COVER, [])
  assert.equal(read.effects.length, 2)
  assert.deepEqual(read.effects.map((e) => e.currency).sort(), ['GBP', 'USD'])
})

check('a hand-entered sell bigger than the holding is flagged, not refused', () => {
  // Usually a typo. But a real short is legitimate, and the book must record what happened rather than
  // argue with it — so this is a flag the screen can show, never a rejection.
  const read = provisionalRead(
    [make({ tradeDate: '2026-08-20', symbol: 'AMZN', side: 'sell', quantity: 130, price: 200 })],
    COVER, [{ symbol: 'AMZN', currency: 'USD', quantity: 100 }],
  )
  const e = read.effects[0]!
  assert.equal(e.provisionalQuantity, -30)
  assert.equal(e.crossesZero, true)
  const fine = provisionalRead(
    [make({ tradeDate: '2026-08-20', symbol: 'AMZN', side: 'sell', quantity: 30, price: 200 })],
    COVER, [{ symbol: 'AMZN', currency: 'USD', quantity: 100 }],
  )
  assert.equal(fine.effects[0]!.crossesZero, false)
})

check('a dual-listed name compares each listing against its OWN holding', () => {
  // Summing held quantity by symbol alone hands BOTH currency rows the combined position: each listing
  // claims to hold what the two hold together. It overstates what is held, and it hides the crossesZero
  // warning on a sell that really does take one listing short.
  const held = [
    { symbol: 'RIO', currency: 'USD', quantity: 100 },
    { symbol: 'RIO', currency: 'GBP', quantity: 40 },
  ]
  const read = provisionalRead([
    make({ tradeDate: '2026-08-20', symbol: 'RIO', currency: 'gbp', side: 'sell', quantity: 60, price: 47 }),
  ], COVER, held)

  const gbp = read.effects.find((e) => e.currency === 'GBP')!
  assert.equal(gbp.bookQuantity, 40, 'only the GBP listing counts, not 140')
  assert.equal(gbp.provisionalQuantity, -20)
  assert.equal(gbp.crossesZero, true, 'selling 60 of a 40 holding goes short — the warning must fire')
  assert.equal(read.effects.length, 1, 'the USD listing has no entries, so it has no provisional row')
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
