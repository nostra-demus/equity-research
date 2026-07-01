// GICS classification for the news wire — the CANONICAL copy (server-side), so the archive search +
// facets (server.ts) can filter/count by sector & sub-sector. The browser keeps a byte-for-byte mirror
// at ui/web/src/lib/gics.ts (it can't import server code); the gics-sync test deep-compares the two
// taxonomies so they can never drift.
//
// The Global Industry Classification Standard (GICS, S&P + MSCI) has 11 sectors at the top; each holds
// a set of industries below it. Every sub-sector belongs to EXACTLY ONE parent sector (the official
// mapping — no sub-sector floats free), so picking a sector and then narrowing to one of its sub-sectors
// is always a strict, correct drill-down.
//
// An item is classified by reading its headline (original + English translation) and its guessed company
// names against each industry's keyword vocabulary — the same whole-word match the Sector/Commodity scope
// dropdowns use, so "oil" never matches "boiler". A keyword hit tags the item with that sub-sector AND its
// parent sector, so the two filters stay consistent. A headline that names no industry simply carries no
// GICS tag (it falls through the filter when one is set) — a miss is honest, not a forced bucket.

export interface Industry {
  /** the sub-sector label shown in the dropdown — globally unique across the taxonomy */
  name: string
  /** whole-word keywords that classify a headline/company into this sub-sector */
  keywords: readonly string[]
  /** Exact-match (case-insensitive, trimmed) aliases checked ONLY against the LLM's own structured
   *  company-guess fields (CompanyGuess.name / .ticker) — NEVER scanned as free text over the headline.
   *  Use this for a short form that's a real collision risk as free text (e.g. "BAT" collides with the
   *  English word "bat" and with BATS Global Markets, the former US exchange operator) but is safe as an
   *  EXACT match against a company's own extracted name/ticker. Optional; most industries won't need it. */
  companyAliases?: { names?: readonly string[]; tickers?: readonly string[] }
}
export interface Sector {
  name: string
  /** sector-level keywords (broad industry talk that isn't specific to one sub-sector) */
  keywords?: readonly string[]
  industries: readonly Industry[]
}

// The 11 GICS sectors, in the standard order, each with its industries (sub-sectors) and keyword vocab.
// KEEP THIS IDENTICAL to ui/web/src/lib/gics.ts (the gics-sync test enforces it).
export const GICS: readonly Sector[] = [
  {
    name: 'Energy',
    keywords: ['opec', 'crude oil'],
    industries: [
      { name: 'Integrated Oil & Gas', keywords: ['oil and gas', 'oil & gas', 'integrated oil', 'oil major', 'oil majors', 'oil giant'] },
      { name: 'Oil & Gas Exploration & Production', keywords: ['exploration and production', 'e&p', 'upstream', 'shale', 'oil producer', 'crude producer', 'gas producer', 'driller', 'drillers'] },
      { name: 'Oil & Gas Refining & Marketing', keywords: ['refiner', 'refiners', 'refinery', 'refineries', 'refining margin', 'fuel retailer', 'downstream'] },
      { name: 'Oil & Gas Equipment & Services', keywords: ['oilfield service', 'oilfield services', 'oil services', 'drilling rig', 'fracking', 'well services'] },
      { name: 'Oil & Gas Storage & Transportation', keywords: ['pipeline operator', 'midstream', 'gas pipeline', 'lng terminal', 'lng exporter'] },
      { name: 'Coal & Consumable Fuels', keywords: ['coal miner', 'coal mining', 'coal producer', 'thermal coal', 'coking coal'] },
    ],
  },
  {
    name: 'Materials',
    industries: [
      { name: 'Chemicals', keywords: ['chemical', 'chemicals', 'petrochemical', 'petrochemicals', 'specialty chemical', 'agrochemical', 'fertiliser', 'fertilizer'] },
      { name: 'Metals & Mining', keywords: ['miner', 'miners', 'mining', 'metals producer', 'smelter', 'iron ore', 'copper miner', 'base metals'] },
      { name: 'Steel', keywords: ['steel', 'steelmaker', 'steelmakers', 'steel mill', 'steel plant'] },
      { name: 'Aluminium', keywords: ['aluminium', 'aluminum', 'alumina'] },
      { name: 'Gold & Precious Metals', keywords: ['gold miner', 'gold mining', 'silver miner', 'precious metals miner', 'bullion producer'] },
      { name: 'Construction Materials', keywords: ['cement', 'cement maker', 'cement plant', 'aggregates', 'building materials'] },
      { name: 'Paper & Forest Products', keywords: ['paper mill', 'pulp', 'forest products', 'paper maker'] },
      { name: 'Containers & Packaging', keywords: ['packaging', 'container maker', 'glass container', 'packaging maker'] },
    ],
  },
  {
    name: 'Industrials',
    industries: [
      { name: 'Aerospace & Defense', keywords: ['defense', 'defence', 'aerospace', 'arms maker', 'weapons maker', 'fighter jet', 'missile', 'defense contractor'] },
      { name: 'Airlines', keywords: ['airline', 'airlines', 'air carrier', 'low-cost carrier', 'aviation'] },
      { name: 'Air Freight & Logistics', keywords: ['logistics', 'freight forwarder', 'parcel delivery', 'courier', 'package delivery'] },
      { name: 'Marine & Shipping', keywords: ['shipping line', 'shipper', 'shippers', 'container line', 'dry bulk', 'tanker operator'] },
      { name: 'Road & Rail', keywords: ['railroad', 'railway', 'freight rail', 'trucking', 'trucker'] },
      { name: 'Machinery', keywords: ['machinery', 'industrial equipment', 'heavy equipment', 'machine tools', 'capital goods'] },
      { name: 'Construction & Engineering', keywords: ['construction firm', 'engineering and construction', 'epc', 'infrastructure builder'] },
      { name: 'Electrical Equipment', keywords: ['electrical equipment', 'power equipment', 'transformers', 'electric motors'] },
      { name: 'Building Products', keywords: ['building products', 'hvac', 'insulation maker'] },
      { name: 'Commercial Services & Supplies', keywords: ['staffing firm', 'waste management', 'facilities services'] },
    ],
  },
  {
    name: 'Consumer Discretionary',
    industries: [
      { name: 'Automobiles', keywords: ['automaker', 'automakers', 'automobile', 'carmaker', 'car maker', 'ev maker', 'auto sector', 'vehicle maker'] },
      { name: 'Auto Components', keywords: ['auto parts', 'auto components', 'tyre', 'tire maker', 'parts supplier'] },
      { name: 'Textiles, Apparel & Luxury Goods', keywords: ['apparel', 'fashion brand', 'luxury goods', 'footwear', 'sportswear', 'clothing maker'] },
      { name: 'Hotels, Restaurants & Leisure', keywords: ['hotel chain', 'restaurant chain', 'restaurants', 'casino', 'leisure', 'hospitality', 'quick-service'] },
      { name: 'Specialty & Internet Retail', keywords: ['retailer', 'retailers', 'e-commerce', 'ecommerce', 'online retailer', 'specialty retail', 'department store'] },
      { name: 'Household Durables', keywords: ['homebuilder', 'homebuilders', 'appliance maker', 'consumer durables', 'furniture maker'] },
    ],
  },
  {
    name: 'Consumer Staples',
    industries: [
      { name: 'Food Products', keywords: ['food maker', 'packaged food', 'food producer', 'foodmaker', 'dairy', 'meatpacker', 'snack maker'] },
      { name: 'Beverages', keywords: ['beverage maker', 'soft drink', 'brewer', 'brewers', 'distiller', 'spirits maker', 'bottler'] },
      { name: 'Tobacco', keywords: ['tobacco', 'cigarette maker'], companyAliases: { names: ['bat'], tickers: ['bats', 'bti'] } },
      { name: 'Household & Personal Products', keywords: ['household products', 'personal care', 'fmcg', 'consumer goods giant'] },
      { name: 'Food & Staples Retailing', keywords: ['grocer', 'grocery chain', 'supermarket', 'hypermarket', 'drugstore chain'] },
    ],
  },
  {
    name: 'Health Care',
    industries: [
      { name: 'Pharmaceuticals', keywords: ['pharma', 'pharmaceutical', 'pharmaceuticals', 'drugmaker', 'drugmakers', 'drug maker'] },
      { name: 'Biotechnology', keywords: ['biotech', 'biotechnology', 'gene therapy', 'biologics'] },
      { name: 'Health Care Equipment & Supplies', keywords: ['medical device', 'medical devices', 'medtech', 'diagnostics maker'] },
      { name: 'Health Care Providers & Services', keywords: ['hospital', 'hospitals', 'health insurer', 'managed care', 'clinic chain'] },
      { name: 'Life Sciences Tools & Services', keywords: ['life sciences', 'lab equipment', 'contract research', 'cro'] },
    ],
  },
  {
    name: 'Financials',
    industries: [
      { name: 'Banks', keywords: ['bank', 'banks', 'banking', 'lender', 'lenders', 'commercial bank'] },
      { name: 'Capital Markets', keywords: ['investment bank', 'stockbroker', 'securities broker', 'brokerage', 'asset manager', 'asset management', 'exchange operator', 'wealth manager'] },
      { name: 'Insurance', keywords: ['insurer', 'insurers', 'insurance', 'reinsurer', 'reinsurance', 'life insurer'] },
      { name: 'Consumer Finance', keywords: ['consumer lender', 'credit card', 'nbfc', 'payday lender', 'auto lender'] },
      { name: 'Mortgage & Housing Finance', keywords: ['mortgage lender', 'housing finance', 'mortgage finance'] },
      { name: 'Payments & Fintech', keywords: ['fintech', 'payments firm', 'payment processor', 'payments company'] },
    ],
  },
  {
    name: 'Information Technology',
    industries: [
      { name: 'Semiconductors', keywords: ['semiconductor', 'semiconductors', 'chipmaker', 'chip maker', 'chip foundry', 'semiconductor foundry', 'silicon wafer', 'wafer fab', 'fabless'] },
      { name: 'Semiconductor Equipment', keywords: ['chip equipment', 'lithography', 'semiconductor equipment', 'fab tool'] },
      { name: 'Software', keywords: ['software', 'saas', 'enterprise software', 'cloud software', 'application software'] },
      { name: 'IT Services', keywords: ['it services', 'system integrator', 'outsourcing', 'managed services'] },
      { name: 'Technology Hardware', keywords: ['hardware maker', 'smartphone maker', 'pc maker', 'server maker'] },
      { name: 'Electronic Components', keywords: ['electronic components', 'circuit board', 'connectors maker'] },
      { name: 'Communications Equipment', keywords: ['telecom equipment', 'networking equipment', '5g equipment', 'router maker'] },
    ],
  },
  {
    name: 'Communication Services',
    industries: [
      { name: 'Telecom Services', keywords: ['telecom', 'telecoms', 'wireless carrier', 'mobile carrier', 'broadband', 'telecom operator'] },
      { name: 'Media', keywords: ['broadcaster', 'tv network', 'publisher', 'advertising agency', 'ad agency', 'media company'] },
      { name: 'Entertainment', keywords: ['film studio', 'streaming service', 'music label', 'video game maker', 'gaming company'] },
      { name: 'Interactive Media & Services', keywords: ['search engine', 'social media', 'internet platform', 'online platform'] },
    ],
  },
  {
    name: 'Utilities',
    keywords: ['utility stocks', 'utility sector', 'utilities sector'],
    industries: [
      { name: 'Electric Utilities', keywords: ['electric utility', 'power utility', 'power producer', 'grid operator', 'electricity provider', 'power company'] },
      { name: 'Gas Utilities', keywords: ['gas utility', 'gas distributor', 'city gas'] },
      { name: 'Water Utilities', keywords: ['water utility', 'water company'] },
      { name: 'Independent Power & Renewables', keywords: ['renewable power', 'solar developer', 'wind farm operator', 'clean power', 'ipp'] },
    ],
  },
  {
    name: 'Real Estate',
    industries: [
      { name: 'REITs', keywords: ['reit', 'reits', 'real estate investment trust'] },
      { name: 'Real Estate Management & Development', keywords: ['real estate developer', 'property developer', 'property manager', 'realty', 'real estate firm'] },
    ],
  },
] as const

// ---- public shape ----
export const GICS_SECTORS: readonly string[] = GICS.map((s) => s.name)
const SUBSECTORS_BY_SECTOR = new Map(GICS.map((s) => [s.name, s.industries.map((i) => i.name)] as const))
/** The sub-sectors (industries) under a sector, in canonical order. Empty for an unknown sector. */
export const gicsSubSectorsFor = (sector: string): readonly string[] => SUBSECTORS_BY_SECTOR.get(sector) || []

// ---- whole-word matcher (mirrors taxonomy.ts / geography.ts) ----
const reCache = new Map<string, RegExp>()
function hasWord(hay: string, kw: string): boolean {
  let re = reCache.get(kw)
  if (!re) {
    re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    reCache.set(kw, re)
  }
  return re.test(hay)
}

export interface GicsTags {
  sectors: ReadonlySet<string>
  subSectors: ReadonlySet<string>
}
const EMPTY: GicsTags = { sectors: new Set(), subSectors: new Set() }

const cache = new Map<string, GicsTags>()
const CACHE_CAP = 50_000 // server scans the whole archive, so a roomier cache than the browser's

function classifyText(hay: string): GicsTags {
  const cached = cache.get(hay)
  if (cached) return cached
  const sectors = new Set<string>()
  const subSectors = new Set<string>()
  for (const sector of GICS) {
    let sectorHit = sector.keywords?.some((k) => hasWord(hay, k)) ?? false
    for (const ind of sector.industries) {
      if (ind.keywords.some((k) => hasWord(hay, k))) {
        subSectors.add(ind.name)
        sectorHit = true
      }
    }
    if (sectorHit) sectors.add(sector.name)
  }
  const tags: GicsTags = { sectors, subSectors }
  if (cache.size >= CACHE_CAP) cache.clear()
  cache.set(hay, tags)
  return tags
}

// ---- company-alias matcher: EXACT match against the LLM's own structured company guess (name/ticker),
// never scanned as free text over the headline — see Industry.companyAliases for why this is a separate,
// narrower pass than the keyword scan above.
interface AliasEntry { subSector: string; sector: string; names: ReadonlySet<string>; tickers: ReadonlySet<string> }
const ALIAS_INDEX: AliasEntry[] = []
for (const sector of GICS) {
  for (const ind of sector.industries) {
    if (ind.companyAliases) {
      ALIAS_INDEX.push({
        subSector: ind.name,
        sector: sector.name,
        names: new Set((ind.companyAliases.names || []).map((n) => n.toLowerCase().trim())),
        tickers: new Set((ind.companyAliases.tickers || []).map((t) => t.toLowerCase().trim())),
      })
    }
  }
}

type CompanyLike = { name: string; ticker?: string | null }

function classifyCompanyAliases(companies: CompanyLike[] | undefined, sectors: Set<string>, subSectors: Set<string>): void {
  if (!companies?.length || !ALIAS_INDEX.length) return
  for (const c of companies) {
    const nm = String(c?.name || '').toLowerCase().trim()
    const tk = String(c?.ticker || '').toLowerCase().trim()
    if (!nm && !tk) continue
    for (const entry of ALIAS_INDEX) {
      if ((nm && entry.names.has(nm)) || (tk && entry.tickers.has(tk))) {
        subSectors.add(entry.subSector)
        sectors.add(entry.sector)
      }
    }
  }
}

/** Tag a wire item with its GICS sector(s) + sub-sector(s), read from its headline, its guessed
 *  companies' names (free-text keyword pass), AND an exact-match company-alias pass (ticker/short-name
 *  aliases like BAT/BATS/BTI for Tobacco) — see Industry.companyAliases. */
export function gicsOf(it: { headline?: string; headline_en?: string | null; companies?: CompanyLike[] }): GicsTags {
  const parts = [it.headline, it.headline_en, ...(it.companies || []).map((c) => c.name)].filter(Boolean)
  const base = parts.length ? classifyText(parts.join(' · ').toLowerCase()) : EMPTY
  if (!ALIAS_INDEX.length || !it.companies?.length) return base
  const sectors = new Set(base.sectors)
  const subSectors = new Set(base.subSectors)
  classifyCompanyAliases(it.companies, sectors, subSectors)
  if (sectors.size === base.sectors.size && subSectors.size === base.subSectors.size) return base
  return { sectors, subSectors }
}

export interface GicsMatchDetail { subSector: string; sector: string; via: 'keyword' | 'company-alias'; term: string }

/** DEBUG ONLY — same classification gicsOf performs, but also returns WHICH keyword or company alias
 *  fired for each sub-sector hit (the "why did/didn't this match" trace for /api/news/debug/explain and
 *  direct unit tests). Not on the hot path — gicsOf stays the fast, cached classifier used everywhere
 *  else; call this only when a human wants to know why an item did or didn't get tagged. */
export function explainGicsOf(it: { headline?: string; headline_en?: string | null; companies?: CompanyLike[] }): GicsMatchDetail[] {
  const parts = [it.headline, it.headline_en, ...(it.companies || []).map((c) => c.name)].filter(Boolean)
  const hay = parts.join(' · ').toLowerCase()
  const details: GicsMatchDetail[] = []
  for (const sector of GICS) {
    for (const ind of sector.industries) {
      const kw = ind.keywords.find((k) => hasWord(hay, k))
      if (kw) details.push({ subSector: ind.name, sector: sector.name, via: 'keyword', term: kw })
    }
  }
  for (const c of it.companies || []) {
    const nm = String(c?.name || '').toLowerCase().trim()
    const tk = String(c?.ticker || '').toLowerCase().trim()
    for (const entry of ALIAS_INDEX) {
      // independent checks (not else-if): a company guess can carry BOTH an aliased name and an aliased
      // ticker at once (e.g. {name:"BAT", ticker:"BTI"}) — report every dimension that matched, not just
      // the first, so the trace is a complete "why" instead of silently dropping a second hit.
      if (nm && entry.names.has(nm)) details.push({ subSector: entry.subSector, sector: entry.sector, via: 'company-alias', term: `name:${nm}` })
      if (tk && entry.tickers.has(tk)) details.push({ subSector: entry.subSector, sector: entry.sector, via: 'company-alias', term: `ticker:${tk}` })
    }
  }
  return details
}
