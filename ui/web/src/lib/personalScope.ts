import { create } from 'zustand'
import { useMemo } from 'react'
import { api, type CompanyFacet, type SymbolGroup } from './api'
import { useStore } from './store'
import type { PortfolioRead, WatchlistRead } from './types'
import { cleanTicker, coreCompanyName, groupListingCountry, normTicker, tickerHitAny } from './symbology'
import { companyMatches, type Filterable, type CompanyPick } from '../components/screener/FeedFilters'
import { mergeCompanyOptions } from '../components/screener/CompanyFilter'

export type PersonalScope = 'portfolio' | 'watchlist' | 'universe'
export const SCOPE_LABELS = { portfolio: 'Portfolio', watchlist: 'Watchlist', universe: 'Universe' }
// Same currency-to-market fallback as the portfolio quote lane; EUR has no single market.
const CURRENCY_MARKET: Record<string, string> = { USD: 'US', INR: 'IN', NOK: 'NO', GBP: 'GB', JPY: 'JP', HKD: 'HK', CHF: 'CH', SEK: 'SE', DKK: 'DK', ISK: 'IS', CAD: 'CA', AUD: 'AU', NZD: 'NZ', SAR: 'SA', AED: 'AE', QAR: 'QA', KWD: 'KW', OMR: 'OM', BHD: 'BH', ILS: 'IL', ZAR: 'ZA', NGN: 'NG', EGP: 'EG', KRW: 'KR', TWD: 'TW', SGD: 'SG', CNY: 'CN', CNH: 'CN', MYR: 'MY', IDR: 'ID', THB: 'TH', PHP: 'PH', VND: 'VN', BRL: 'BR', MXN: 'MX', CLP: 'CL', ARS: 'AR', PEN: 'PE', COP: 'CO', PLN: 'PL', TRY: 'TR', CZK: 'CZ', HUF: 'HU' }
export function memberCountry(ticker: string, exchange = '', currency = ''): string | undefined {
  return groupListingCountry(ticker, [], exchange) || CURRENCY_MARKET[currency.toUpperCase()]
}
const STORAGE_KEY = 'nsw.personalScope'
export function readPersonalScope(): PersonalScope {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'watchlist' || saved === 'universe') return saved
  } catch { /* private browsing */ }
  return 'portfolio'
}

export function portfolioMembers(read: PortfolioRead): CompanyPick[] {
  const members = new Map<string, CompanyPick>()
  for (const position of read.book?.positions || []) {
    const ticker = cleanTicker(position.symbol)
    if (!ticker || position.quantity === 0 || position.quantity === null) continue
    const listingCountry = memberCountry(ticker, '', position.currency || '')
    members.set(`${ticker}|${listingCountry || ''}`, { ticker, name: '', listingCountry })
  }
  return [...members.values()]
}
export function watchlistMembers(read: WatchlistRead): CompanyPick[] {
  return read.rows.filter((row) => !row.archive).map((row) => ({
    ticker: row.ticker, name: row.company_name || '',
    listingCountry: memberCountry(row.ticker, row.exchange || '', row.currency || ''),
  }))
}

// Resolve only a unique directory identity. Search results are suggestions, not proof that every
// returned company is owned. Ambiguous bare symbols retain exact ticker matching without name expansion.
export function enrichMember(member: CompanyPick, groups: SymbolGroup[]): CompanyPick {
  const eligible = groups.filter((group) => {
    const listings = group.listings?.length ? group.listings : [group.symbol, ...(group.aliases || [])].map((symbol) => ({
      symbol, exchange: group.aliasExchanges?.[symbol] || (normTicker(symbol) === normTicker(group.symbol) ? group.exchange : ''),
    }))
    return listings.some((listing) => {
      if (!tickerHitAny(member.ticker, [normTicker(listing.symbol)])) return false
      const country = groupListingCountry(listing.symbol, [], listing.exchange)
      return !member.listingCountry || !country || country === member.listingCountry
    })
  })
  const exact = eligible.filter((g) => [g.symbol, ...(g.aliases || [])].some((s) => normTicker(s) === normTicker(member.ticker)))
  const candidates = exact.length ? exact : eligible.filter((g) => tickerHitAny(member.ticker, [g.symbol, ...(g.aliases || [])].map(normTicker)))
  if (candidates.length !== 1) return member
  const option = mergeCompanyOptions([], candidates)[0]
  return { ...option, ticker: member.ticker, tickerAliases: [option.ticker!, ...(option.tickerAliases || [])], aliases: member.name ? [member.name] : undefined }
}

export function memberWithFacets(member: CompanyPick, facets: CompanyFacet[]): CompanyPick {
  const identityNames = [member.name, ...(member.aliases || [])].map(coreCompanyName).filter(Boolean)
  const matches = facets.filter((facet) => identityNames.length > 0
    && [facet.name, ...(facet.aliases || [])].some((name) => identityNames.includes(coreCompanyName(name)))
    && tickerHitAny(facet.ticker, [member.ticker || '', ...(member.tickerAliases || [])].map(normTicker))
    && (!member.listingCountry || !facet.listingCountry || member.listingCountry === facet.listingCountry))
  return { ...member, aliases: [...(member.aliases || []), ...matches.flatMap((facet) => [facet.name, ...(facet.aliases || [])])] }
}

export function matchesPersonalScope(item: Filterable, scope: PersonalScope, members: readonly CompanyPick[]): boolean {
  return scope === 'universe' || members.some((member) => companyMatches(item, member))
}

type Membership = { members: CompanyPick[]; status: 'idle' | 'loading' | 'ready' | 'error'; error: string | null; asOf: string | null; unresolved: number }
const emptyMembership = (): Membership => ({ members: [], status: 'idle', error: null, asOf: null, unresolved: 0 })
interface PersonalScopeState {
  scope: PersonalScope
  portfolio: Membership
  watchlist: Membership
  setScope: (scope: PersonalScope) => void
  refresh: () => Promise<void>
}
let pending: Promise<void> | null = null
const resolvedMembers = new Map<string, CompanyPick>()
export const usePersonalScopeStore = create<PersonalScopeState>((set) => ({
  scope: readPersonalScope(), portfolio: emptyMembership(), watchlist: emptyMembership(),
  setScope: (scope) => { set({ scope }); try { localStorage.setItem(STORAGE_KEY, scope) } catch { /* private browsing */ } },
  refresh: () => {
    if (pending) return pending
    set((s) => ({ portfolio: { ...s.portfolio, status: 'loading' }, watchlist: { ...s.watchlist, status: 'loading' } }))
    const load = async (kind: 'portfolio' | 'watchlist') => {
      try {
        const read = kind === 'portfolio' ? await api.portfolio() : await api.watchlist()
        if ('error' in read && read.error) throw new Error(read.error)
        if ('unreadable' in read && read.unreadable.length) throw new Error('Some watchlist entries could not be read.')
        let members = kind === 'portfolio' ? portfolioMembers(read as PortfolioRead) : watchlistMembers(read as WatchlistRead)
        let unresolved = 0
        members = await Promise.all(members.map(async (member) => {
          let groups: SymbolGroup[] = []
          try { groups = await api.symbolSearch(member.ticker || member.name) } catch { /* membership survives lookup failure */ }
          const key = `${kind}|${member.ticker}|${member.listingCountry || ''}|${member.name}`
          const enriched = enrichMember(member, groups)
          if (enriched !== member) { resolvedMembers.set(key, enriched); return enriched }
          unresolved++
          // Keep a known identity only for the same broker/watchlist listing. Removed holdings are
          // never resurrected: this loop runs over the newly fetched authoritative membership only.
          return resolvedMembers.get(key) || member
        }))
        set({ [kind]: { members, status: 'ready', error: null, unresolved, asOf: kind === 'portfolio' ? (read as PortfolioRead).book?.asOf || null : (read as WatchlistRead).as_of } })
      } catch (error) {
        set({ [kind]: { members: [], status: 'error', error: error instanceof Error ? error.message : 'Could not load companies.', asOf: null, unresolved: 0 } })
      }
    }
    pending = Promise.all([load('portfolio'), load('watchlist')]).then(() => {}).finally(() => { pending = null })
    return pending
  },
}))

export function usePersonalScope(enabled = true) {
  const selected = usePersonalScopeStore((s) => s.scope)
  const portfolio = usePersonalScopeStore((s) => s.portfolio)
  const watchlist = usePersonalScopeStore((s) => s.watchlist)
  const facets = useStore((s) => s.scFacets?.companies)
  const scope = enabled ? selected : 'universe'
  const membership = scope === 'watchlist' ? watchlist : portfolio
  return useMemo(() => {
    const members = membership.status === 'ready' || membership.status === 'loading' ? membership.members.map((member) => memberWithFacets(member, facets || [])) : []
    return ({
    scope, label: SCOPE_LABELS[scope], membership,
    matches: (item: Filterable) => matchesPersonalScope(item, scope, members),
    company: (ticker?: string | null, name = '', listingCountry?: string | null) => matchesPersonalScope({ headline: '', companies: [{ ticker: ticker || null, name, listing_country: listingCountry }] }, scope, members),
  }) }, [scope, membership, facets])
}
