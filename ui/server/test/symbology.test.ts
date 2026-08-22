// Symbology unit tests — the news→ticker mapping rules end-to-end: junk-ticker scrubbing (the literal
// "NULL" and CIK numbers that surfaced in the autofill), exchange-suffix base equivalence (NHY vs NHY.OL),
// legal-suffix core names (CITIGROUP INC ≡ Citigroup), the pick-vs-tag ticker test, the name matcher, and
// the directory's quote grouping (pure — no network anywhere). The web twin lives in
// ui/web/src/lib/symbology.ts; these pins are what keep the two honest. Run: npx tsx test/symbology.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  baseTicker, cleanTicker, companyNameMatches, coreCompanyName, directoryTickerIdentityKey,
  directoryTickerMatches, groupQuotes, normTicker, pickTickerSet, tickerHitAny,
} from '../src/news/symbology'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- cleanTicker: the junk scrub (the exact garbage seen in the live dropdown) ----
check('cleanTicker rejects placeholder junk: "NULL", "N/A", "NONE", "UNKNOWN", "-", empty', () => {
  for (const junk of ['NULL', 'null', 'N/A', 'NA', 'NONE', 'UNKNOWN', 'TBD', '-', '', '  ', null, undefined]) {
    assert.equal(cleanTicker(junk), null, `"${junk}" must scrub to null`)
  }
})
check('cleanTicker rejects CIK-like long digit runs but KEEPS real numeric exchange codes', () => {
  assert.equal(cleanTicker('0000200245'), null, 'a 10-digit SEC CIK is not a ticker')
  assert.equal(cleanTicker('1234567'), null, '7+ digits reads as an id, not a symbol')
  assert.equal(cleanTicker('500325'), '500325', 'a 6-digit BSE code is a real symbol')
  assert.equal(cleanTicker('0005'), '0005', 'a short HK code is a real symbol')
  assert.equal(cleanTicker('7203'), '7203', 'a 4-digit Tokyo code is a real symbol')
})
check('cleanTicker keeps real symbols (upcased) and rejects space/garbage strings', () => {
  assert.equal(cleanTicker('nhydy'), 'NHYDY')
  assert.equal(cleanTicker('NHY.OL'), 'NHY.OL')
  assert.equal(cleanTicker('BRK-B'), 'BRK-B')
  assert.equal(cleanTicker('NOT A TICKER'), null)
  assert.equal(cleanTicker('ABCDEFGHIJKLMNOP'), null, 'over-long strings are junk')
})

// ---- baseTicker: exchange-suffix equivalence without touching share classes ----
check('baseTicker strips known exchange suffixes only', () => {
  assert.equal(baseTicker('NHY.OL'), 'NHY')
  assert.equal(baseTicker('RELIANCE.NS'), 'RELIANCE')
  assert.equal(baseTicker('500325.BO'), '500325')
  assert.equal(baseTicker('0005.HK'), '0005')
  assert.equal(baseTicker('7203.T'), '7203')
  assert.equal(baseTicker('BRK.A'), 'BRK.A', 'a share class is NOT an exchange suffix')
  assert.equal(baseTicker('brk-b'), 'BRK.B', 'class separator normalised, class kept')
  assert.equal(baseTicker('AMZN'), 'AMZN')
})
check('directoryTickerMatches licenses Dubai and Abu Dhabi suffixes only for UAE listings', () => {
  assert.equal(directoryTickerMatches('EMAAR', 'EMAAR.DU', 'AE'), true)
  assert.equal(directoryTickerMatches('ADNOCDRILL', 'ADNOCDRILL.AD', 'AE'), true)
  assert.equal(directoryTickerMatches('EMAAR', 'EMAAR.DU', 'US'), false)
})
check('directoryTickerIdentityKey folds only country-proven directory spellings', () => {
  assert.equal(directoryTickerIdentityKey('NHY', 'NO'), 'NHY')
  assert.equal(directoryTickerIdentityKey('NHY.OL', 'NO'), 'NHY')
  assert.equal(directoryTickerIdentityKey('NHY.OL', null), 'NHY.OL')
  assert.equal(directoryTickerIdentityKey('BRK.A', 'US'), 'BRK.A')
})

// ---- coreCompanyName: legal-suffix-stripped identity ----
check('coreCompanyName strips legal suffixes and normalises case', () => {
  assert.equal(coreCompanyName('Norsk Hydro ASA'), 'norsk hydro')
  assert.equal(coreCompanyName('CITIGROUP INC'), 'citigroup')
  assert.equal(coreCompanyName('JPMORGAN CHASE & CO'), 'jpmorgan chase')
  assert.equal(coreCompanyName('Amazon.com, Inc.'), 'amazon.com')
  assert.equal(coreCompanyName('Tata Motors Limited'), 'tata motors')
  assert.equal(coreCompanyName('The Boeing Company'), 'boeing')
})
check('coreCompanyName keeps identity-bearing words and guards short names', () => {
  assert.equal(coreCompanyName('Man Group PLC'), 'man group', '"group" is identity, only PLC strips')
  assert.equal(coreCompanyName('SAP SE'), 'sap')
  assert.equal(coreCompanyName('SA'), '', 'nothing meaningful left → empty, never a junk key')
})

// ---- tickerHitAny: pick-vs-tag across spellings ----
check('tickerHitAny matches exact, alias-base, and never a sub/superstring', () => {
  assert.equal(tickerHitAny('NHY', ['NHYDY', 'NHY.OL']), true, 'the Oslo alias NHY.OL catches the bare tag NHY')
  assert.equal(tickerHitAny('NHY', ['NHYDY']), false, 'a different symbol never matches by shape')
  assert.equal(tickerHitAny('BRK.A', ['BRK']), false, 'a class tag never matches a shorter pick')
  assert.equal(tickerHitAny('BRK.B', ['BRK-B']), true, 'class-separator spellings are equivalent')
})
check('pickTickerSet scrubs junk and dedups spellings', () => {
  assert.deepEqual(pickTickerSet({ ticker: 'NHYDY', aliases: ['NHY.OL', 'nhy.ol', 'NULL', '0000200245'] }), ['NHYDY', 'NHY.OL'])
  assert.deepEqual(pickTickerSet({ ticker: null, aliases: [] }), [])
})

// ---- companyNameMatches: full name OR core, whole-word ----
check('companyNameMatches hits the core name in a headline and never a buried substring', () => {
  assert.equal(companyNameMatches('norsk hydro trims full-year output', 'Norsk Hydro ASA'), true)
  assert.equal(companyNameMatches('citigroup beats estimates', 'CITIGROUP INC'), true)
  assert.equal(companyNameMatches('new metadata rules for websites', 'Meta Platforms Inc'), false)
})

// ---- groupQuotes: the directory's per-company fold ----
check('groupQuotes folds cross-listings of one company into a single group with aliases', () => {
  const groups = groupQuotes([
    { symbol: 'NHYDY', name: 'Norsk Hydro ASA', exchange: 'OTC Markets' },
    { symbol: 'NHY.OL', name: 'Norsk Hydro ASA', exchange: 'Oslo' },
    { symbol: 'NHYKF', name: 'Norsk Hydro ASA', exchange: 'OTC Markets' },
    { symbol: 'AA', name: 'Alcoa Corp', exchange: 'NYSE' },
  ])
  assert.equal(groups.length, 2)
  assert.equal(groups[0].symbol, 'NHYDY', 'primary = first (most relevant) quote')
  assert.deepEqual(groups[0].aliases, ['NHYDY', 'NHY.OL', 'NHYKF'])
  assert.deepEqual(groups[0].listings?.map((listing) => [listing.symbol, listing.exchange]), [
    ['NHYDY', 'OTC Markets'], ['NHY.OL', 'Oslo'], ['NHYKF', 'OTC Markets'],
  ], 'each raw listing keeps its own venue for ambiguity checks')
  assert.equal(groups[1].symbol, 'AA')
})
check('groupQuotes drops junk symbols instead of grouping them', () => {
  const groups = groupQuotes([
    { symbol: 'NULL', name: 'Man Group PLC', exchange: 'LSE' },
    { symbol: 'EMG.L', name: 'Man Group PLC', exchange: 'LSE' },
  ])
  assert.equal(groups.length, 1)
  assert.deepEqual(groups[0].aliases, ['EMG.L'])
})

// ---- normTicker sanity ----
check('normTicker upcases and normalises the class separator', () => {
  assert.equal(normTicker(' brk-b '), 'BRK.B')
  assert.equal(normTicker('nhy.ol'), 'NHY.OL')
})

console.log(`\nsymbology.test.ts: ${passed} passed`)
