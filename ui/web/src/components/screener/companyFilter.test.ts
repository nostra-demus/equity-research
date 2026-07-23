// The browser twin of ui/server/test/company-filter.test.ts — proves the client's matchesFilters company
// clause behaves IDENTICALLY to the server's matchesFeedFilters (the two must stay in lockstep), and that
// a company pick trips archive mode. The ticker autofill's value is a {ticker, name} pick; the clause
// matches an item tagged with that exact ticker OR named in its headline/company blob.
// Run: npx tsx src/components/screener/companyFilter.test.ts
import assert from 'node:assert/strict'
import { archiveFiltersActive, emptyFilters, filtersActive, matchesFilters, type Filterable, type FeedFilterState } from './FeedFilters'
import { mergeCompanyOptions, rankOption, resolveTypedCompany } from './CompanyFilter'
import { baseTicker, cleanTicker, coreCompanyName } from '../../lib/symbology'

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

// ---- rankOption ranks exact-ticker above prefix above substring, and scans ALIASES too ----
check('rankOption ranks exact ticker < ticker-prefix < name-prefix < contains < no-match', () => {
  const o = { ticker: 'AMZN', name: 'Amazon.com' }
  assert.equal(rankOption(o, 'amzn'), 0)
  assert.equal(rankOption(o, 'amz'), 1)
  assert.equal(rankOption(o, 'amazon'), 2)
  assert.equal(rankOption({ ticker: 'MSFT', name: 'Microsoft' }, 'soft'), 4)
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

// ---- imports for the global-symbology twins (appended with the NHYDY/global-directory feature) ----

// ---- THE NHYDY LOCKSTEP TWINS: a cross-listing tickerAlias + the core-name matcher ----
check('an ADR pick with the Oslo tickerAlias matches an item tagged with the bare Oslo symbol', () => {
  const tagged = it({ headline: 'Hydro reports quarterly results', companies: [{ name: 'Norsk Hydro', ticker: 'NHY' }] })
  const pick = { ticker: 'NHYDY', name: 'Norsk Hydro ASA', tickerAliases: ['NHY.OL', 'NHYKF'] }
  assert.equal(matchesFilters(tagged, withCompany(pick)), true, 'the NHY.OL alias base-matches the bare NHY tag')
  const untagged = it({ headline: 'Norsk Hydro to curtail aluminium output', companies: [] })
  assert.equal(matchesFilters(untagged, withCompany(pick)), true, 'core name "norsk hydro" hits despite the ASA suffix on the pick')
  const other = it({ headline: 'Alcoa lifts guidance', companies: [{ name: 'Alcoa', ticker: 'AA' }] })
  assert.equal(matchesFilters(other, withCompany(pick)), false)
})

// ---- a tickerAlias hit still respects the listing-country conflict guard ----
check('a tickerAlias match is still excluded by a proven-different listing country', () => {
  const catapult = it({ headline: 'Catapult wins a contract', companies: [{ name: 'Catapult Group International', ticker: 'CAT', listing_country: 'AU' }] })
  assert.equal(matchesFilters(catapult, withCompany({ ticker: 'CAT.X', name: 'Caterpillar', tickerAliases: ['CAT'], listingCountry: 'US' })), false)
})

// ---- junk scrub twins (deploy-skew: an old server can still serve dirty facet tickers) ----
check('cleanTicker/baseTicker/coreCompanyName twins behave like the server', () => {
  assert.equal(cleanTicker('NULL'), null)
  assert.equal(cleanTicker('0000200245'), null)
  assert.equal(cleanTicker('500325'), '500325')
  assert.equal(baseTicker('NHY.OL'), 'NHY')
  assert.equal(baseTicker('BRK.A'), 'BRK.A')
  assert.equal(coreCompanyName('CITIGROUP INC'), 'citigroup')
  assert.equal(coreCompanyName('JPMORGAN CHASE & CO'), 'jpmorgan chase')
})

// ---- rankOption searches the TICKER aliases too — typing NHYDY ranks the enriched NHY entry first ----
check('rankOption matches through the tickerAlias set at the symbol tiers', () => {
  const enriched = { ticker: 'NHY', name: 'Norsk Hydro', count: 12, tickerAliases: ['NHYDY', 'NHY.OL'] }
  assert.equal(rankOption(enriched, 'nhydy'), 0, 'an exact ticker-alias hit ranks like an exact ticker hit')
  assert.equal(rankOption(enriched, 'nhyd'), 1, 'a ticker-alias prefix ranks like a ticker prefix')
})

// ---- mergeCompanyOptions: directory groups enrich (not duplicate) archive entries ----
check('a directory group for an archive company attaches its ticker aliases to that entry', () => {
  const merged = mergeCompanyOptions(
    [{ ticker: 'NHY', name: 'Norsk Hydro', count: 12, aliases: ['Hydro'], listingCountry: 'NO' }],
    [{ name: 'Norsk Hydro ASA', symbol: 'NHYDY', exchange: 'OTC Markets', aliases: ['NHYDY', 'NHY.OL', 'NHYKF'] }],
  )
  assert.equal(merged.length, 1, 'one row — the archive entry enriched, not a duplicate')
  assert.equal(merged[0].ticker, 'NHY')
  assert.equal(merged[0].count, 12, 'the archive mention count is kept')
  assert.deepEqual(merged[0].aliases, ['Hydro'], 'the archive NAME aliases are kept untouched')
  assert.equal(merged[0].listingCountry, 'NO', 'the listing country is kept')
  assert.deepEqual([...(merged[0].tickerAliases || [])].sort(), ['NHY.OL', 'NHYDY', 'NHYKF'])
})
check('an unknown company appends as a global-only row; junk facet tickers are scrubbed', () => {
  const merged = mergeCompanyOptions(
    [{ ticker: 'NULL', name: 'Man Group PLC', count: 95 }],
    [{ name: 'Rio Tinto PLC', symbol: 'RIO.L', exchange: 'LSE', aliases: ['RIO.L', 'RIO'] }],
  )
  const man = merged.find((o) => /man group/i.test(o.name))
  assert.equal(man?.ticker, null, 'the junk "NULL" facet ticker is scrubbed to a name-only entry')
  const rio = merged.find((o) => /rio tinto/i.test(o.name))
  assert.equal(rio?.ticker, 'RIO.L')
  assert.equal(rio?.exchange, 'LSE')
  assert.deepEqual(rio?.tickerAliases, ['RIO'], 'the primary symbol is not repeated in its own aliases')
})

console.log(`\ncompanyFilter.test.ts: ${passed} passed`)
