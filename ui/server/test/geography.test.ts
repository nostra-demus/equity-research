// Country-level geography: the canonical vocabulary, the resolveCountry resolver (company listing →
// gazetteer → region floor), the resolveEventGeography MULTI-country resolver (the Globe view's read),
// and the GICS server↔web sync (the two taxonomies must be byte-identical).
// Pure — no key / network / install. Run: npx tsx test/geography.test.ts
import assert from 'node:assert/strict'
import { COUNTRIES, GEO_REGIONS, countryName, regionOfCountry, countriesInRegion, isCountry, resolveCountry, resolveEventGeography } from '../src/news/geography'
import { GICS as serverGICS } from '../src/news/gics'
import { GICS as webGICS } from '../../web/src/lib/gics'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- vocabulary ----
check('COUNTRIES: covers every region, AE present, codes roll up to a continent', () => {
  assert.ok(Object.keys(COUNTRIES).length > 150, 'a near-complete ISO table')
  assert.equal(COUNTRIES['AE'].name, 'United Arab Emirates')
  assert.equal(COUNTRIES['AE'].region, 'Middle East')
  assert.equal(regionOfCountry('ae'), 'Middle East') // case-insensitive
  assert.equal(countryName('IN'), 'India')
  assert.ok(countriesInRegion('Middle East').includes('AE'))
  assert.ok(GEO_REGIONS.includes('Middle East'))
})
check('isCountry: known code true; junk false', () => {
  assert.equal(isCountry('AE'), true)
  assert.equal(isCountry('ae'), true)
  for (const j of ['', null, undefined, 'ZZ', 'usa', 42]) assert.equal(isCountry(j as any), false, String(j))
})

// ---- resolveCountry: company listing (primary single) wins ----
check('resolveCountry: primary single-company listing_country wins', () => {
  assert.equal(resolveCountry('Some firm posts results', null, [{ name: 'X', listing_country: 'AE' }], 'GLOBAL', 'primary'), 'AE')
  // not primary → company is NOT used for the high-confidence path; falls to gazetteer/floor
  assert.equal(resolveCountry('A neutral headline', null, [{ name: 'X', listing_country: 'AE' }], 'US', 'sector'), 'US')
})

// ---- resolveCountry: the motivating case — "Dubai … defense" → AE (Middle East) ----
check('resolveCountry: a Dubai defense headline resolves to AE', () => {
  const cc = resolveCountry('Dubai defense firm wins missile contract', null, [], 'GLOBAL', 'macro')
  assert.equal(cc, 'AE')
  assert.equal(regionOfCountry(cc), 'Middle East')
})
check('resolveCountry: exchange / city / demonym gazetteer hits', () => {
  assert.equal(resolveCountry('Tadawul-listed group raises capital', null, [], null), 'SA')
  assert.equal(resolveCountry('Riyadh fund backs startup', null, [], null), 'SA')
  assert.equal(resolveCountry('Saudi wealth fund eyes deal', null, [], null), 'SA')
  assert.equal(resolveCountry('NSE-listed Indian lender beats estimates', null, [], null), 'IN')
})
check('resolveCountry: two distinct countries named → ambiguous → null (honest)', () => {
  assert.equal(resolveCountry('Dubai and Riyadh sign trade pact', null, [], null), null) // AE + SA both match
})
check('resolveCountry: no signal → legacy region floor; GLOBAL/OTHER → null', () => {
  assert.equal(resolveCountry('A generic macro print', null, [], 'US', 'macro'), 'US')
  assert.equal(resolveCountry('A generic macro print', null, [], 'GLOBAL', 'macro'), null)
  assert.equal(resolveCountry('A generic macro print', null, [], 'OTHER', 'macro'), null)
  assert.equal(resolveCountry('A generic macro print', null, [], null), null)
})

// ---- resolveEventGeography: the MULTI-country sibling (the Globe view's resolver) ----

// 1. the motivating multi-country case: a headline naming two countries resolves to BOTH, not an
//    ambiguous null (the one deliberate behavioral difference from resolveCountry's bail-to-null).
check('resolveEventGeography: "US weighs sanctions on Iran" resolves to both US and IR', () => {
  const g = resolveEventGeography('US weighs sanctions on Iran over missile program', null, [], 'GLOBAL', 'macro')
  assert.equal(g.countries.length, 2, 'both countries resolved, none dropped as ambiguous')
  assert.deepEqual([...g.countries].sort(), ['IR', 'US'])
  assert.equal(g.confidence, 'medium', 'two-country gazetteer match is medium confidence, not high')
  // IR (Middle East) and US (North America) span two different continents → the honest 'Global' roll-up
  assert.equal(g.region, 'Global')
  assert.ok(g.reason && g.reason.length > 0, 'the reason is a non-empty audit trail')
})

// 2. company-specific event, no place name in the headline → the single company's listing country wins,
//    at 'high' confidence (mirrors resolveCountry's own primary-linkage precedence).
check('resolveEventGeography: a company-specific headline with no place name resolves to the listing country', () => {
  const g = resolveEventGeography(
    'Acme Corp posts record quarterly results',
    null,
    [{ name: 'Acme Corp', listing_country: 'AE' }],
    'GLOBAL',
    'primary',
  )
  assert.deepEqual(g.countries, ['AE'])
  assert.equal(g.region, 'Middle East')
  assert.equal(g.confidence, 'high')
  assert.match(g.reason, /AE/)
})

// 3. pure global-macro event — no company linkage, no place name, no usable region floor — must resolve
//    to the honest 'Global' / [] read, never a forced guess.
check('resolveEventGeography: a pure global-macro headline resolves to Global with no countries', () => {
  const g = resolveEventGeography('Global chip shortage weighs on auto production worldwide', null, [], 'GLOBAL', 'macro')
  assert.deepEqual(g.countries, [])
  assert.equal(g.region, 'Global')
  assert.equal(g.confidence, 'low')
  assert.ok(g.reason && g.reason.length > 0, 'still carries a plain-English reason for the miss')
})

// 4. never forces a country: a non-primary company linkage (a company merely mentioned, not the
//    headline's subject) must NOT leak its listing_country into the read when nothing else resolves —
//    same "no signal → honest miss" contract as resolveCountry's own non-primary-linkage behavior.
check('resolveEventGeography: a non-primary company mention never forces a country', () => {
  const g = resolveEventGeography(
    'A neutral headline about a merger',
    null,
    [{ name: 'X', listing_country: 'AE' }],
    null,
    'sector', // NOT 'primary' — the company linkage must not be used for the high-confidence path
  )
  assert.deepEqual(g.countries, [], 'a non-primary-linkage company must not force AE')
  assert.equal(g.region, 'Global')
  assert.equal(g.confidence, 'low')
})

// ---- GICS server ↔ web sync (no drift) ----
check('gics-sync: server and web GICS taxonomies are byte-identical', () => {
  assert.equal(JSON.stringify(serverGICS), JSON.stringify(webGICS))
})

console.log(`\ngeography.test.ts: ${passed} passed`)
