// Regression tests for the Codex/Gemini review findings on the news→ticker symbology layer (PR #322):
//   F1 (r3636118350) companyNameMatches: a COMMON single-word core must not free-text match unrelated prose
//                    ("Target Corp" → "target" in "price target"), while a DISTINCTIVE single-word core
//                    (tesla/nvidia/netflix) and every multi-word core still match.
//   F3 (r3636118361) cleanTicker: admit '&' so NSE-style symbols (M&M.NS) resolve, without leaking junk/CIK.
//   F4 (r3636118374) coreCompanyName: normalise parenthetical annotations + dotted initialisms so
//                    "J.P. Morgan Chase & Co." and "JP Morgan Chase & Co.", and "Acme Inc. (NYSE: ACME)" and
//                    "Acme Inc.", reduce to the SAME core (and share aliases).
// The web twin (ui/web/src/lib/symbology.ts) carries the byte-identical primitives — see companyFilter.test.ts.
// Expected values are pinned to the design spec in each finding + public authorities (NSE symbol list for
// M&M/L&T; SEC CIK 10-digit format), never to the code under test. Run: npx tsx test/symbology-review-findings.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { cleanTicker, companyNameMatches, coreCompanyName } from '../src/news/symbology'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- F1: common single-word core does NOT match free prose; distinctive single-word core still does ----
check('F1: a common single-word core ("Target Corp" → "target") does not false-match unrelated headline prose', () => {
  // the core "target"/"orange" is an ordinary English word — a whole-word hit in free prose is not evidence
  assert.equal(companyNameMatches('analysts lift their price target on the retailer', 'Target Corporation'), false, '"price target" must not match a Target Corporation pick')
  assert.equal(companyNameMatches('orange juice futures rally on a cold snap in florida', 'Orange S.A.'), false, '"orange juice" must not match an Orange S.A. pick')
})
check('F1: a DISTINCTIVE single-word core (tesla/nvidia/netflix) still matches by core after the legal suffix is stripped', () => {
  assert.equal(companyNameMatches('tesla unveils a cheaper model', 'Tesla Inc'), true)
  assert.equal(companyNameMatches('nvidia results beat estimates', 'NVIDIA Corporation'), true)
  assert.equal(companyNameMatches('netflix adds subscribers in the quarter', 'Netflix Inc'), true)
})
check('F1: a multi-word core is unaffected, and a common core still matches its FULL name when present', () => {
  assert.equal(companyNameMatches('norsk hydro trims full-year output', 'Norsk Hydro ASA'), true, 'multi-word core still matches')
  assert.equal(companyNameMatches('target corporation lifts full-year guidance', 'Target Corporation'), true, 'the full name still matches when actually present')
})

// ---- F3: cleanTicker admits '&' (NSE symbols) but still rejects placeholders + CIK-like runs ----
check('F3: cleanTicker accepts NSE-style "&" symbols (M&M.NS, L&T.NS), upcased', () => {
  // Mahindra & Mahindra and Larsen & Toubro are real NSE symbols with an ampersand (authority: NSE symbol list)
  assert.equal(cleanTicker('M&M.NS'), 'M&M.NS')
  assert.equal(cleanTicker('m&m.ns'), 'M&M.NS')
  assert.equal(cleanTicker('L&T.NS'), 'L&T.NS')
})
check('F3: cleanTicker still rejects placeholder junk and CIK-like long digit runs after admitting "&"', () => {
  assert.equal(cleanTicker('NULL'), null)
  assert.equal(cleanTicker('0000200245'), null, 'a 10-digit SEC CIK is still not a ticker')
  assert.equal(cleanTicker('&BAD'), null, "a leading '&' is not a valid symbol (first char stays alphanumeric)")
})

// ---- F4: coreCompanyName normalises parentheticals + dotted initialisms so variants share a core ----
check('F4: dotted vs undotted initialisms reduce to the same core ("J.P. Morgan" ≡ "JP Morgan")', () => {
  assert.equal(coreCompanyName('J.P. Morgan Chase & Co.'), 'jp morgan chase')
  assert.equal(coreCompanyName('JP Morgan Chase & Co.'), 'jp morgan chase')
  assert.equal(coreCompanyName('J.P. Morgan Chase & Co.'), coreCompanyName('JP Morgan Chase & Co.'))
})
check('F4: a parenthetical annotation is stripped so "Acme Inc. (NYSE: ACME)" ≡ "Acme Inc."', () => {
  assert.equal(coreCompanyName('Acme Inc. (NYSE: ACME)'), 'acme')
  assert.equal(coreCompanyName('Acme Inc.'), 'acme')
  assert.equal(coreCompanyName('Acme Inc. (NYSE: ACME)'), coreCompanyName('Acme Inc.'))
})
check('F4: existing cores are NOT regressed by the new normalisation', () => {
  assert.equal(coreCompanyName('Man Group PLC'), 'man group', '"group" is identity — must not collapse to "man"')
  assert.equal(coreCompanyName('Amazon.com, Inc.'), 'amazon.com', 'a word.word dot is kept (only initialism dots collapse)')
  assert.equal(coreCompanyName('CITIGROUP INC'), 'citigroup')
  assert.equal(coreCompanyName('JPMORGAN CHASE & CO'), 'jpmorgan chase')
  assert.equal(coreCompanyName('The Boeing Company'), 'boeing')
})

console.log(`\nsymbology-review-findings.test.ts: ${passed} passed`)
