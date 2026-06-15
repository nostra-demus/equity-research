// Specific sectors & commodities pulled out of a headline — powers the Sector / Commodity multi-select
// dropdowns on the wire. The commodity vocabulary mirrors the server's COMMODITY_TERMS (news/scope.ts);
// the sector vocabulary is the major investable industries. "Dynamic growing" = the dropdowns only list
// the values actually found on the wire right now, with live counts. Whole-word matching avoids false
// hits (e.g. "oil" must not match "boiler"). A miss just leaves the item under the broad scope chip.

type Group = readonly [canonical: string, keywords: readonly string[]]

const COMMODITY_GROUPS: readonly Group[] = [
  ['Oil', ['oil', 'crude', 'brent', 'wti', 'opec', 'gasoline', 'petrol', 'diesel', 'jet fuel']],
  ['Natural gas', ['natural gas', 'lng', 'lpg', 'naphtha']],
  ['Copper', ['copper']],
  ['Aluminium', ['aluminium', 'aluminum']],
  ['Lithium', ['lithium']],
  ['Nickel', ['nickel']],
  ['Zinc/Tin/Lead', ['zinc', 'tin', 'lead ingot']],
  ['Cobalt', ['cobalt']],
  ['Uranium', ['uranium']],
  ['Gold', ['gold', 'bullion']],
  ['Silver', ['silver']],
  ['Platinum/Palladium', ['platinum', 'palladium']],
  ['Iron ore', ['iron ore']],
  ['Steel', ['steel']],
  ['Coal', ['coal', 'coking coal', 'thermal coal']],
  ['Wheat', ['wheat']],
  ['Corn', ['corn', 'maize']],
  ['Soybean', ['soybean', 'soyoil']],
  ['Sugar', ['sugar']],
  ['Coffee', ['coffee']],
  ['Cocoa', ['cocoa']],
  ['Cotton', ['cotton']],
  ['Palm oil', ['palm oil']],
  ['Rubber', ['rubber']],
  ['Rice', ['rice']],
  ['Freight/Shipping', ['freight rate', 'baltic', 'tanker rate', 'dry bulk', 'container rate', 'shipping rate', 'charter rate']],
]

const SECTOR_GROUPS: readonly Group[] = [
  ['Semiconductors', ['semiconductor', 'semiconductors', 'chipmaker', 'chip maker', 'foundry', 'wafer']],
  ['Banks', ['bank', 'banks', 'banking', 'lender', 'lenders']],
  ['Insurance', ['insurer', 'insurers', 'insurance']],
  ['Airlines', ['airline', 'airlines', 'aviation', 'air carrier']],
  ['Autos', ['automaker', 'automakers', 'automobile', 'carmaker', 'car maker', 'ev maker', 'auto sector']],
  ['Pharma/Biotech', ['pharma', 'pharmaceutical', 'pharmaceuticals', 'biotech', 'drugmaker', 'drugmakers']],
  ['Oil & gas', ['oil and gas', 'oil & gas', 'refiner', 'refiners', 'refineries', 'upstream', 'driller', 'drillers']],
  ['Retail', ['retailer', 'retailers', 'e-commerce', 'ecommerce']],
  ['Real estate', ['real estate', 'reit', 'reits', 'homebuilder', 'homebuilders', 'housing market']],
  ['Telecom', ['telecom', 'telecoms', 'wireless carrier', 'broadband']],
  ['Utilities', ['utility', 'utilities', 'power producer', 'power utility']],
  ['Defense', ['defense', 'defence', 'arms maker', 'weapons maker']],
  ['Mining', ['miner', 'miners', 'mining']],
  ['Chemicals', ['chemical', 'chemicals', 'petrochemical', 'petrochemicals']],
  ['Shipping', ['shipping line', 'shipper', 'shippers', 'container line']],
  ['Software/Internet', ['software', 'saas', 'cloud computing', 'internet sector']],
  ['Healthcare', ['hospital', 'hospitals', 'healthcare', 'health care']],
  ['Tech', ['big tech', 'tech sector', 'technology sector']],
]

const reCache = new Map<string, RegExp>()
function hasWord(hay: string, kw: string): boolean {
  let re = reCache.get(kw)
  if (!re) {
    re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    reCache.set(kw, re)
  }
  return re.test(hay)
}

function extract(groups: readonly Group[], text?: string | null): string[] {
  if (!text) return []
  const out: string[] = []
  for (const [canon, kws] of groups) if (kws.some((k) => hasWord(text, k))) out.push(canon)
  return out
}

export const extractCommodities = (text?: string | null): string[] => extract(COMMODITY_GROUPS, text)
export const extractSectors = (text?: string | null): string[] => extract(SECTOR_GROUPS, text)
