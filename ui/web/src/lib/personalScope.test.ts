import assert from 'node:assert/strict'
import { api } from './api'
import type { PortfolioRead, WatchlistRead } from './types'
import { enrichMember, memberCountry, memberWithFacets, matchesPersonalScope, portfolioMembers, watchlistMembers, usePersonalScopeStore } from './personalScope'

const portfolio = { error: null, book: { asOf: '2026-09-09', positions: [
  { symbol: 'AMZN', currency: 'USD', quantity: 5 },
  { symbol: 'KAR', currency: 'AUD', quantity: 10 },
  { symbol: 'KAR', currency: 'USD', quantity: 1 },
  { symbol: 'AMZN', currency: 'USD', quantity: 2 },
  { symbol: 'V', currency: 'USD', quantity: -3 },
  { symbol: 'CLOSED', currency: 'USD', quantity: 0 },
  { symbol: null, currency: 'USD', quantity: 1 },
] } } as PortfolioRead
const watchlist = { rows: [
  { ticker: 'META', company_name: 'Meta Platforms', exchange: 'NASDAQ', currency: 'USD', archive: null },
  { ticker: 'OLD', archive: { at: '2026-09-01' } },
], archived: [], unreadable: [], as_of: '2026-09-16' } as unknown as WatchlistRead
const members = portfolioMembers(portfolio)
assert.equal(members.length, 4, 'deduplicate the same listing, keep short holdings and distinct markets, drop closed/null symbols')
assert.deepEqual(watchlistMembers(watchlist).map((m) => m.ticker), ['META'])
assert.equal(memberCountry('CAT', 'ASX'), 'AU')
const kar = enrichMember(members.find((m) => m.ticker === 'KAR' && m.listingCountry === 'AU')!, [
  { symbol: 'KAR', name: 'Openlane', exchange: 'NYSE', aliases: ['KAR'], aliasExchanges: { KAR: 'NYSE' } },
  { symbol: 'KAR.AX', name: 'Karoon Energy', exchange: 'ASX', aliases: ['KAR.AX'], aliasExchanges: { 'KAR.AX': 'ASX' } },
])
assert.equal(kar.name, 'Karoon Energy', 'currency context outranks a different issuer with an exact bare ticker')
assert.equal(matchesPersonalScope({ headline: '', companies: [{ ticker: 'KAR', name: 'Openlane', listing_country: 'US' }] }, 'portfolio', [kar]), false)
assert.equal(matchesPersonalScope({ headline: 'Karoon Energy announces drilling results' }, 'portfolio', [kar]), true)
const hydro = enrichMember({ ticker: 'NHYDY', name: '', listingCountry: 'US' }, [{ symbol: 'NHYDY', name: 'Norsk Hydro ASA', exchange: 'OTC', aliases: ['NHYDY', 'NHY.OL'] }])
assert.equal(matchesPersonalScope({ headline: '', companies: [{ ticker: 'NHY', name: 'Norsk Hydro', listing_country: 'NO' }] }, 'portfolio', [hydro]), true, 'ADR and home listing are the same issuer')
const crossListedCat = enrichMember({ ticker: 'CAT', name: '', listingCountry: 'US' }, [{
  symbol: 'CAT', name: 'Caterpillar', exchange: 'NYSE', aliases: ['CAT', 'CAT.DE'], aliasExchanges: { CAT: 'NYSE', 'CAT.DE': 'XETRA' },
}])
assert.equal(matchesPersonalScope({ headline: '', companies: [{ ticker: 'CAT', name: 'Catapult Group', listing_country: 'AU' }] }, 'portfolio', [crossListedCat]), false)
assert.equal(matchesPersonalScope({ headline: '', companies: [{ ticker: 'CAT.DE', name: 'Caterpillar', listing_country: 'DE' }] }, 'portfolio', [crossListedCat]), true)
const cat = memberWithFacets({ ticker: 'CAT', name: 'Caterpillar', tickerAliases: ['CAT.DE'] }, [
  { ticker: 'CAT', name: 'Catapult Group', aliases: ['Catapult'], count: 10, listingCountry: 'AU' },
  { ticker: 'CAT', name: 'Other issuer', aliases: ['Wrong company'], count: 10 },
])
assert.equal(matchesPersonalScope({ headline: 'Catapult announces results' }, 'portfolio', [cat]), false)
assert.equal(matchesPersonalScope({ headline: 'Wrong company announces results' }, 'portfolio', [cat]), false)
const alphabet = memberWithFacets({ ticker: 'GOOG', name: 'Alphabet', listingCountry: 'US' }, [
  { ticker: 'GOOG', name: 'Alphabet', aliases: ['Google'], count: 10, listingCountry: 'US' },
])
assert.equal(matchesPersonalScope({ headline: 'Google releases a new product' }, 'portfolio', [alphabet]), true)
assert.equal(matchesPersonalScope({ headline: 'Visa earnings', companies: [{ ticker: 'V', name: 'Visa' }] }, 'portfolio', members), true)
assert.equal(matchesPersonalScope({ headline: 'A V shaped recovery' }, 'portfolio', members), false, 'a one-letter ticker must not match headline prose')
assert.equal(matchesPersonalScope({ headline: 'Anything' }, 'universe', []), true)
assert.equal(matchesPersonalScope({ headline: 'Anything' }, 'portfolio', []), false, 'empty membership never falls through to Universe')

api.portfolio = async () => portfolio
api.watchlist = async () => watchlist
api.symbolSearch = async (q) => q === 'AMZN' ? [{ symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', aliases: [] }] : []
await usePersonalScopeStore.getState().refresh()
assert.equal(usePersonalScopeStore.getState().portfolio.status, 'ready')
assert.equal(usePersonalScopeStore.getState().portfolio.members.find((m) => m.ticker === 'AMZN')?.name, 'Amazon.com Inc.')
api.symbolSearch = async () => { throw new Error('directory offline') }
await usePersonalScopeStore.getState().refresh()
assert.equal(usePersonalScopeStore.getState().portfolio.members.length, 4, 'optional lookup failure preserves confirmed members')
assert.equal(usePersonalScopeStore.getState().portfolio.members.find((m) => m.ticker === 'AMZN')?.name, 'Amazon.com Inc.', 'preserve prior names during outage')
assert.ok(usePersonalScopeStore.getState().portfolio.unresolved > 0, 'partial lookup coverage is exposed')
api.portfolio = async () => ({ ...portfolio, book: { ...portfolio.book!, positions: [] } })
await usePersonalScopeStore.getState().refresh()
assert.deepEqual(usePersonalScopeStore.getState().portfolio.members, [], 'closed positions cannot be resurrected by cached aliases')
api.portfolio = async () => { throw new Error('holdings unavailable') }
await usePersonalScopeStore.getState().refresh()
assert.equal(usePersonalScopeStore.getState().portfolio.status, 'error')
assert.deepEqual(usePersonalScopeStore.getState().portfolio.members, [])
assert.equal(usePersonalScopeStore.getState().watchlist.status, 'ready', 'one membership source failing does not fail the other')
console.log('personalScope: identity, membership, outage and source-isolation regressions passed')
