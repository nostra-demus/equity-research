// The browser twin of ui/server/test/company-filter.test.ts — proves the client's matchesFilters company
// clause behaves IDENTICALLY to the server's matchesFeedFilters (the two must stay in lockstep), and that
// a company pick trips archive mode. The ticker autofill's value is a {ticker, name} pick; the clause
// matches an item tagged with that exact ticker OR named in its headline/company blob.
// Run: npx tsx src/components/screener/companyFilter.test.ts
import assert from 'node:assert/strict'
import { archiveFiltersActive, emptyFilters, filtersActive, matchesFilters, type Filterable, type FeedFilterState } from './FeedFilters'

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

// ---- a company pick trips archive mode + reads as active ----
check('a company pick makes filtersActive + archiveFiltersActive true', () => {
  const f = withCompany({ ticker: 'AMZN', name: 'Amazon' })
  assert.equal(filtersActive(f), true)
  assert.equal(archiveFiltersActive(f), true)
  assert.equal(filtersActive(emptyFilters()), false)
  assert.equal(archiveFiltersActive(emptyFilters()), false)
})

console.log(`\ncompanyFilter.test.ts: ${passed} passed`)
