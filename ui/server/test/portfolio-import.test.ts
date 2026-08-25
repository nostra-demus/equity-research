// The Flex XML reader. These are the cases that silently mis-read a statement rather than failing
// loudly — an empty attribute becoming 0, a '>' inside a description truncating a tag, a re-configured
// query emitting a different date format. Each one corrupts the book quietly, so each has a test.
// Run: npx tsx test/portfolio-import.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isoDate, isoDateTime, num, parseFlexXml, parseXml } from '../src/portfolio-import'

const here = path.dirname(fileURLToPath(import.meta.url))
const xml = fs.readFileSync(path.join(here, 'fixtures', 'flex-sample.xml'), 'utf8')

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}

// ---------- coercion: the empty-is-not-zero rule ----------
check('num: empty / dash / N/A read as null, never 0', () => {
  assert.equal(num(''), null)
  assert.equal(num('  '), null)
  assert.equal(num('-'), null)
  assert.equal(num('N/A'), null)
  assert.equal(num(undefined), null)
  assert.equal(num('0'), 0) // a real zero still reads as zero
  assert.equal(num('-150.25'), -150.25)
  assert.equal(num('1,234.5'), 1234.5)
})

check('isoDate accepts both compact and dashed', () => {
  assert.equal(isoDate('20260825'), '2026-08-25')
  assert.equal(isoDate('2026-08-25'), '2026-08-25')
  assert.equal(isoDate(''), null)
  assert.equal(isoDate('not a date'), null)
})

check('isoDateTime accepts every separator IBKR emits', () => {
  assert.equal(isoDateTime('20260825;143005'), '2026-08-25T14:30:05')
  assert.equal(isoDateTime('20260825 143005'), '2026-08-25T14:30:05')
  assert.equal(isoDateTime('2026-08-25 14:30:05'), '2026-08-25T14:30:05')
  assert.equal(isoDateTime('20260825'), '2026-08-25') // date with no time is still a date
  assert.equal(isoDateTime(''), null)
})

// ---------- the tag reader ----------
check('a > inside an attribute value does not truncate the tag', () => {
  const root = parseXml('<Root><Row a="x &gt; y" b="second" /></Root>')
  const row = root.children[0]!.children[0]!
  assert.equal(row.attrs.a, 'x > y')
  assert.equal(row.attrs.b, 'second', 'the attribute AFTER the > must still parse')
})

check('entities decode, including numeric and hex', () => {
  const root = parseXml('<R><Row t="AT&amp;T &lt;tag&gt; &quot;q&quot; &apos;a&apos; &#65;&#x42;" /></R>')
  assert.equal(root.children[0]!.children[0]!.attrs.t, 'AT&T <tag> "q" \'a\' AB')
})

check('self-closing, nesting and declarations all handled', () => {
  const root = parseXml('<?xml version="1.0"?><!-- note --><A><B x="1"/><C><D y="2"/></C></A>')
  const a = root.children[0]!
  assert.equal(a.tag, 'A')
  assert.equal(a.children.length, 2)
  assert.equal(a.children[1]!.children[0]!.attrs.y, '2')
})

check('an unquoted attribute value is rejected, not guessed', () => {
  assert.throws(() => parseXml('<R><Row a=1 /></R>'), /unquoted value/)
})

// ---------- the document ----------
const doc = parseFlexXml(xml)

check('statement header parsed', () => {
  assert.equal(doc.accountId, 'U0000000')
  assert.equal(doc.fromDate, '2026-01-01')
  assert.equal(doc.toDate, '2026-01-04')
  assert.equal(doc.whenGenerated, '2026-01-05T12:00:00')
})

check('all eight sections detected', () => {
  assert.equal(doc.sectionsPresent.length, 8)
  for (const s of ['Trades', 'OpenPositions', 'CashTransactions', 'CorporateActions',
                   'ChangeInNAV', 'EquitySummaryInBase', 'SecuritiesInfo', 'ConversionRates']) {
    assert.ok(doc.sectionsPresent.includes(s), `missing ${s}`)
  }
})

check('row counts', () => {
  assert.equal(doc.trades.length, 10)
  assert.equal(doc.openPositions.length, 3)
  assert.equal(doc.cashTransactions.length, 7)
  assert.equal(doc.corporateActions.length, 1)
  assert.equal(doc.equitySummary.length, 4)
  assert.equal(doc.conversionRates.length, 2)
})

check('an empty commission reads as null, not 0 (the rule that hides bad sums)', () => {
  const t4 = doc.trades.find((t) => t.tradeID === 'T4')!
  assert.equal(t4.ibCommission, null)
  const t1 = doc.trades.find((t) => t.tradeID === 'T1')!
  assert.equal(t1.ibCommission, -1)
})

check('a dashed-date row parses alongside compact-date rows', () => {
  const t4 = doc.trades.find((t) => t.tradeID === 'T4')!
  assert.equal(t4.tradeDate, '2026-01-10')
  assert.equal(t4.dateTime, '2026-01-10T10:00:00')
  const t1 = doc.trades.find((t) => t.tradeID === 'T1')!
  assert.equal(t1.dateTime, '2026-01-05T10:00:00')
})

check('a restated trade keeps its pre-restatement original', () => {
  const t9 = doc.trades.find((t) => t.tradeID === 'T9')!
  assert.equal(t9.origTradeID, 'T9-PRE')
  assert.equal(t9.origTradePrice, 50)
})

check('ChangeInNAV reads from the element attributes, not child rows', () => {
  assert.ok(doc.changeInNav)
  assert.equal(doc.changeInNav!.startingValue, 100000)
  assert.equal(doc.changeInNav!.endingValue, 116000)
  assert.equal(doc.changeInNav!.twr, 10)
  assert.equal(doc.changeInNav!.withholdingTax, -150)
})

check('futures carry their multiplier and expiry', () => {
  const fff = doc.openPositions.find((p) => p.symbol === 'FFF')!
  assert.equal(fff.assetCategory, 'FUT')
  assert.equal(fff.multiplier, 100)
  assert.equal(fff.expiry, '2026-12-30')
})

check('a non-base position carries its fx rate', () => {
  const bbb = doc.openPositions.find((p) => p.symbol === 'BBB')!
  assert.equal(bbb.currency, 'EUR')
  assert.equal(bbb.fxRateToBase, 1.1)
})

check('EVERY FlexStatement is read, not only the first', () => {
  // A two-account export silently dropped half its trades: 10 parsed of 20, with nothing to say so.
  // NOTE the trailing space: '<FlexStatement' also matches the plural <FlexStatements> wrapper.
  const one = xml.slice(xml.indexOf('<FlexStatement '), xml.indexOf('</FlexStatement>') + '</FlexStatement>'.length)
  const two = xml.replace(one, one + '\n' + one.replace('accountId="U0000000"', 'accountId="U1111111"').replace(/tradeID="T/g, 'tradeID="U'))
  const doc2 = parseFlexXml(two)
  assert.equal(doc2.trades.length, doc.trades.length * 2, 'trades from the second statement were dropped')
  assert.equal(doc2.accountIds.length, 2, 'both accounts must be recorded')
  assert.ok(doc2.accountIds.includes('U1111111'))
})

check('an out-of-range numeric entity does not abort the import', () => {
  const root = parseXml('<R><Row a="&#999999999;" b="kept" /></R>')
  const row = root.children[0]!.children[0]!
  assert.equal(row.attrs.a, '&#999999999;', 'left as written rather than thrown')
  assert.equal(row.attrs.b, 'kept')
})

check('a non-Flex document is refused with a useful message', () => {
  assert.throws(() => parseFlexXml('<html><body>nope</body></html>'), /FlexQueryResponse/)
  assert.throws(() => parseFlexXml(''), /empty Flex document/)
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
