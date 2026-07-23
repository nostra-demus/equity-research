// The browser twin of ui/server/test/company-filter.test.ts — proves the client's matchesFilters company
// clause behaves IDENTICALLY to the server's matchesFeedFilters (the two must stay in lockstep), and that
// a company pick trips archive mode. The ticker autofill's value is a {ticker, name} pick; the clause
// matches an item tagged with that exact ticker OR named in its headline/company blob.
// Run: npx tsx src/components/screener/companyFilter.test.ts
import assert from 'node:assert/strict'
import { archiveFiltersActive, emptyFilters, filtersActive, matchesFilters, type Filterable, type FeedFilterState } from './FeedFilters'
import { rankOption, resolveTypedCompany } from './CompanyFilter'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const it = (over: Partial<Filterable> = {}): Filterable => ({ headline: 'A generic corporate update', companies: [], ...over })
const withCompany = (company: FeedFilterState['company']): FeedFilterState => ({ ...emptyFilters(), company })

// ---- exact ticker ----
check('matches an item tagged with the exact ticker (case-insensitive), not a different one', () => {
  const amzn = it({ headline: 'Retailer lifts guidance', companies: [{ name: 'Amazon.com Inc', ticker: 'AMZN' }] })
  assert.equal(matchesFilters(amzn, withCompany({ ticker: 'AMZN', name: 'Amazon.com Inc' })), true)
  assert.equal(matchesFilters(amzn, withCompany({ ticker: 'amzn', name: '' })), true)
  assert.equal(matchesFilters(amzn, withCompany({ ticker: 'MSFT', name: 'Microsoft' })), false)
})

// ---- name substring over the headline ----
check('matches by name substring in the headline even when nothing is tagged', () => {
  const untagged = it({ headline: 'Amazon opens a new fulfilment centre', companies: [] })
  assert.equal(matchesFilters(untagged, withCompany({ ticker: 'AMZN', name: 'Amazon' })), true)
  assert.equal(matchesFilters(untagged, withCompany({ ticker: 'AMZN', name: '' })), false, 'ticker-only cannot hit an untagged headline')
})

// ---- name-only pick (ticker null) ----
check('a name-only pick matches by name; a ticker-only pick does not falsely match it', () => {
  const startup = it({ headline: 'Some Startup raises a round', companies: [{ name: 'Some Startup', ticker: null }] })
  assert.equal(matchesFilters(startup, withCompany({ ticker: null, name: 'Some Startup' })), true)
  assert.equal(matchesFilters(startup, withCompany({ ticker: 'SOME', name: '' })), false)
})

// ---- reliability: ticker catches a tag the headline never names ----
check('matches by ticker when the headline never spells out the company name', () => {
  const tagged = it({ headline: 'The online retailer beats on cloud growth', companies: [{ name: 'Amazon', ticker: 'AMZN' }] })
  assert.equal(matchesFilters(tagged, withCompany({ ticker: 'AMZN', name: 'Amazon' })), true)
})

// ---- headline_en (translated) blob is searched too ----
check('matches the name against the English translation of a foreign headline', () => {
  const foreign = it({ headline: 'アマゾン、通期見通しを上方修正', headline_en: 'Amazon raises full-year outlook', companies: [] })
  assert.equal(matchesFilters(foreign, withCompany({ ticker: 'AMZN', name: 'Amazon' })), true)
})

// ---- AND with free text ----
check('the company clause ANDs with the free-text clause', () => {
  const amzn = it({ headline: 'Amazon lifts guidance to 8%', companies: [{ name: 'Amazon', ticker: 'AMZN' }] })
  assert.equal(matchesFilters(amzn, { ...emptyFilters(), company: { ticker: 'AMZN', name: 'Amazon' }, text: '8%' }), true)
  assert.equal(matchesFilters(amzn, { ...emptyFilters(), company: { ticker: 'AMZN', name: 'Amazon' }, text: 'buyback' }), false)
})

// ---- ticker match is EXACT, never a sub/superstring (lockstep with the server) ----
check('a ticker filter matches only the exact ticker, not a super/substring', () => {
  const brkA = it({ headline: 'Berkshire class A moves', companies: [{ name: 'Berkshire Hathaway', ticker: 'BRK.A' }] })
  assert.equal(matchesFilters(brkA, withCompany({ ticker: 'BRK', name: '' })), false)
  assert.equal(matchesFilters(brkA, withCompany({ ticker: 'BRK.A', name: '' })), true)
})

// ---- name match is WHOLE-WORD (lockstep with the server) ----
check('the name clause matches a whole word, not a buried substring', () => {
  const hit = it({ headline: 'Meta beats on ad revenue', companies: [] })
  const miss = it({ headline: 'New metadata rules for websites', companies: [] })
  assert.equal(matchesFilters(hit, withCompany({ ticker: 'META', name: 'Meta' })), true)
  assert.equal(matchesFilters(miss, withCompany({ ticker: 'META', name: 'Meta' })), false, '"metadata" must not match "Meta"')
})

// ---- THE FIXED BUG: a free-typed single-word NAME keeps its recall (not misread as a zero-match ticker) ----
check('resolveTypedCompany keeps the typed value as the NAME so a single-word company still matches', () => {
  // "Amazon" is symbol-shaped, but the name must be kept as the recall floor (ticker is only an EXTRA clause)
  assert.deepEqual(resolveTypedCompany('Amazon'), { ticker: 'AMAZON', name: 'Amazon' })
  const untagged = it({ headline: 'Amazon opens a new fulfilment centre', companies: [] })
  assert.equal(matchesFilters(untagged, withCompany(resolveTypedCompany('Amazon'))), true, 'a free-typed "Amazon" still finds untagged Amazon news')
  // a multi-word name is name-only (no ticker); empty is null
  assert.deepEqual(resolveTypedCompany('Reliance Industries'), { ticker: null, name: 'Reliance Industries' })
  assert.equal(resolveTypedCompany('   '), null)
})

// ---- rankOption ranks exact-ticker above prefix above substring ----
check('rankOption ranks exact ticker < ticker-prefix < name-prefix < contains < no-match', () => {
  const o = { ticker: 'AMZN', name: 'Amazon.com', count: 9 }
  assert.equal(rankOption(o, 'amzn'), 0)
  assert.equal(rankOption(o, 'amz'), 1)
  assert.equal(rankOption(o, 'amazon'), 2)
  assert.equal(rankOption({ ticker: 'MSFT', name: 'Microsoft', count: 3 }, 'soft'), 4)
  assert.equal(rankOption(o, 'zzz'), -1)
})

// ---- listingCountry disambiguates two issuers sharing a ticker on different exchanges (client lockstep
// with the server's listingConflicts fix, #319) ----
check('a picked listingCountry excludes a bare-ticker match from a proven-different issuer', () => {
  const catapultTagged = it({ headline: 'Catapult wins a new client contract', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFilters(catapultTagged, withCompany({ ticker: 'CAT', name: 'Caterpillar', listingCountry: 'US' })), false, 'a CAT-tagged AU item must not match a US Caterpillar pick via the bare ticker')
  assert.equal(matchesFilters(catapultTagged, withCompany({ ticker: 'CAT', name: 'Catapult Group International', listingCountry: 'AU' })), true, 'the correct (AU) issuer pick still matches')
  const untaggedCountry = it({ headline: 'A generic corporate update', companies: [{ name: 'Caterpillar', ticker: 'CAT', listing_country: null }] })
  assert.equal(matchesFilters(untaggedCountry, withCompany({ ticker: 'CAT', name: 'Caterpillar', listingCountry: 'US' })), true, 'unknown listing_country on the item is never a conflict')
})

// ---- rankOption must ALSO search aliases, not just the primary name (Codex review, #319): a facet whose
// primary name is "Alphabet" but has an observed alias "Google" must surface when the user types "Google" ----
check('rankOption ranks a query matching only an ALIAS the same as matching the primary name', () => {
  // "Facebook" as an alias, ticker "META" — chosen so the alias prefix never coincidentally also prefixes
  // the ticker string itself, cleanly isolating the alias tiers from the ticker tiers.
  const meta = { ticker: 'META', name: 'Meta Platforms', count: 5, aliases: ['Facebook'] }
  assert.equal(rankOption(meta, 'facebook'), 2, 'an exact alias match ranks at the name-prefix tier')
  assert.equal(rankOption(meta, 'faceb'), 2, 'an alias PREFIX also ranks at the name-prefix tier')
  assert.equal(rankOption(meta, 'cebook'), 4, 'an alias substring ranks at the name-contains tier')
  assert.equal(rankOption({ ticker: 'META', name: 'Meta Platforms', count: 5 }, 'facebook'), -1, 'with no aliases carried, "facebook" still cannot match "Meta Platforms"')
})

// ---- THE REPORTED GAP: a picked LONG-form name alone misses an UNTAGGED short-form headline; its
// aliases (carried on the pick from the facet) recover it — client lockstep with the server fix (#317) ----
check('a picked long-form name alone misses a short-form untagged headline; its aliases recover it', () => {
  const shortForm = it({ headline: 'Amazon raises full-year outlook', companies: [] })
  assert.equal(matchesFilters(shortForm, withCompany({ ticker: 'AMZN', name: 'Amazon.com Inc.' })), false, 'the long form alone does not reach a short-form untagged headline')
  assert.equal(matchesFilters(shortForm, withCompany({ ticker: 'AMZN', name: 'Amazon.com Inc.', aliases: ['Amazon'] })), true, 'an alias recovers the untagged short-form headline')
})

// ---- ALIAS-ONLY QUERY: no ticker/name, only aliases — matchesFilters must still activate the company
// clause and filter correctly, not silently no-op to "everything matches" (client lockstep with the
// server's companyClauseSet fix, #319) ----
check('a company filter with ONLY aliases (no ticker, no name) still activates and filters correctly', () => {
  const hit = it({ headline: 'Amazon raises full-year outlook', companies: [] })
  const miss = it({ headline: 'Microsoft ships an update', companies: [] })
  const aliasOnly = withCompany({ ticker: null, name: '', aliases: ['Amazon'] })
  assert.equal(matchesFilters(hit, aliasOnly), true)
  assert.equal(matchesFilters(miss, aliasOnly), false, 'an alias-only filter must still exclude non-matching items, not pass everything')
})

// ---- a company pick trips archive mode + reads as active ----
check('a company pick makes filtersActive + archiveFiltersActive true', () => {
  const f = withCompany({ ticker: 'AMZN', name: 'Amazon' })
  assert.equal(filtersActive(f), true)
  assert.equal(archiveFiltersActive(f), true)
  assert.equal(filtersActive(emptyFilters()), false)
  assert.equal(archiveFiltersActive(emptyFilters()), false)
})

console.log(`\ncompanyFilter.test.ts: ${passed} passed`)
