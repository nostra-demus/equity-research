// Country-level geography: the canonical vocabulary, the resolveCountry resolver (company listing →
// gazetteer → region floor), and the GICS server↔web sync (the two taxonomies must be byte-identical).
// Pure — no key / network / install. Run: npx tsx test/geography.test.ts
import assert from 'node:assert/strict'
import { COUNTRIES, GEO_REGIONS, countryName, regionOfCountry, countriesInRegion, isCountry, resolveCountry } from '../src/news/geography'
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

// ---- GICS server ↔ web sync (no drift) ----
check('gics-sync: server and web GICS taxonomies are byte-identical', () => {
  assert.equal(JSON.stringify(serverGICS), JSON.stringify(webGICS))
})

console.log(`\ngeography.test.ts: ${passed} passed`)
