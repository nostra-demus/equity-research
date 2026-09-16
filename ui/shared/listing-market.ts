// Listing venue resolution shared by quotes and live/static discovery. Never use issuer domicile.
export const EXCHANGE_COUNTRY: [string, string][] = [
  ['nasdaq', 'US'], ['nyse', 'US'], ['new york stock exchange', 'US'], ['cboe', 'US'], ['otc', 'US'], ['amex', 'US'], ['bats', 'US'],
  ['national stock exchange of india', 'IN'], ['bombay stock exchange', 'IN'], ['nse', 'IN'], ['bse', 'IN'], ['india', 'IN'],
  ['oslo', 'NO'], ['london', 'GB'], ['lse', 'GB'], ['aim', 'GB'],
  ['tokyo', 'JP'], ['shanghai', 'CN'], ['shse', 'CN'], ['shenzhen', 'CN'], ['szse', 'CN'], ['hong kong', 'HK'], ['hkex', 'HK'], ['sehk', 'HK'],
  ['xetra', 'DE'], ['frankfurt', 'DE'], ['deutsche', 'DE'], ['euronext paris', 'FR'], ['paris', 'FR'],
  ['euronext amsterdam', 'NL'], ['amsterdam', 'NL'], ['euronext brussels', 'BE'], ['brussels', 'BE'],
  ['euronext lisbon', 'PT'], ['lisbon', 'PT'], ['borsa italiana', 'IT'], ['milan', 'IT'],
  ['madrid', 'ES'], ['bme', 'ES'], ['six', 'CH'], ['swiss', 'CH'], ['vienna', 'AT'], ['wiener', 'AT'],
  ['stockholm', 'SE'], ['copenhagen', 'DK'], ['helsinki', 'FI'], ['iceland', 'IS'],
  ['toronto', 'CA'], ['tsx', 'CA'], ['australian securities', 'AU'], ['asx', 'AU'], ['new zealand', 'NZ'], ['nzx', 'NZ'],
  ['tadawul', 'SA'], ['saudi', 'SA'], ['dubai financial', 'AE'], ['abu dhabi', 'AE'], ['dfm', 'AE'], ['adx', 'AE'],
  ['qatar', 'QA'], ['kuwait', 'KW'], ['muscat', 'OM'], ['bahrain', 'BH'], ['tel aviv', 'IL'],
  ['johannesburg', 'ZA'], ['jse', 'ZA'], ['nigeria', 'NG'], ['egypt', 'EG'],
  ['korea', 'KR'], ['krx', 'KR'], ['kospi', 'KR'], ['taiwan', 'TW'], ['singapore', 'SG'], ['sgx', 'SG'],
  ['shanghai', 'CN'], ['shenzhen', 'CN'], ['bursa malaysia', 'MY'], ['jakarta', 'ID'], ['idx', 'ID'],
  ['thailand', 'TH'], ['philippine', 'PH'], ['ho chi minh', 'VN'], ['hanoi', 'VN'],
  ['sao paulo', 'BR'], ['b3', 'BR'], ['bovespa', 'BR'], ['mexican', 'MX'], ['bmv', 'MX'],
  ['santiago', 'CL'], ['buenos aires', 'AR'], ['lima', 'PE'], ['colombia', 'CO'],
  ['warsaw', 'PL'], ['istanbul', 'TR'], ['borsa istanbul', 'TR'], ['prague', 'CZ'], ['budapest', 'HU'], ['athens', 'GR'],
]

export function countryFromExchange(exchange: string | null | undefined): string | null {
  const e = String(exchange ?? '').trim().toLowerCase()
  if (!e) return null
  let best: { frag: string; cc: string } | null = null
  for (const [frag, cc] of EXCHANGE_COUNTRY) {
    if (e.includes(frag) && (!best || frag.length > best.frag.length)) best = { frag, cc }
  }
  return best ? best.cc : null
}

/** Instrument metadata only. A US ADR is not hidden because of its issuer's domicile. */
export function discoveryListing(symbol: unknown, exchange?: unknown): string | null {
  const ticker = String(symbol || '').trim().toUpperCase()
  const prefix = ticker.includes(':') ? ticker.split(':')[0] : ''
  const venue = String(exchange || prefix).trim()
  const mic: Record<string, string> = { XHKG: 'HK', HKG: 'HK', HK: 'HK', XNSE: 'IN', XBOM: 'IN', XNAS: 'US', XNYS: 'US' }
  const market = mic[venue.toUpperCase()] || countryFromExchange(venue)
  // A listing-qualified symbol is stronger than the skim's unverified exchange guess.
  if (/\.HK$/.test(ticker)) return 'HK'
  if (/\.(NS|BO)$/.test(ticker)) return 'IN'
  const explicitMarket = mic[prefix] || countryFromExchange(prefix)
  if (explicitMarket) return explicitMarket
  if (market) return market
  return null
}
