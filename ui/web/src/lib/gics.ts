// GICS classification for the news wire — powers the Sector / Sub-sector dropdown filters.
//
// The Global Industry Classification Standard (GICS, S&P + MSCI) has 11 sectors at the top; each holds
// a set of industries below it. This file is the canonical client copy of that hierarchy: every
// sub-sector belongs to EXACTLY ONE parent sector (the official mapping — no sub-sector floats free),
// so picking a sector and then narrowing to one of its sub-sectors is always a strict, correct drill-down.
//
// An item is classified by reading its headline (original + English translation) and its guessed company
// names against each industry's keyword vocabulary — the same whole-word match the Sector/Commodity
// scope dropdowns use (lib/taxonomy.ts), so "oil" never matches "boiler". A keyword hit tags the item with
// that sub-sector AND its parent sector, so the two filters stay consistent: every sub-sector match is
// also a match for its sector. A headline that names no industry simply carries no GICS tag (it falls
// through the filter when one is set) — a miss is honest, not a forced bucket.
//
// The engine's research side speaks GICS too (the screener beneficiary-map maps the blast radius as GICS
// industries); this is the cockpit-side vocabulary for the live wire. Keep the sector names identical to
// the official 11 so the two never drift.

interface Industry {
  /** the sub-sector label shown in the dropdown — globally unique across the taxonomy */
  name: string
  /** whole-word keywords that classify a headline/company into this sub-sector */
  keywords: readonly string[]
}
interface Sector {
  name: string
  /** sector-level keywords (broad industry talk that isn't specific to one sub-sector) */
  keywords?: readonly string[]
  industries: readonly Industry[]
}

// The 11 GICS sectors, in the standard order, each with its industries (sub-sectors) and keyword vocab.
const GICS: readonly Sector[] = [
  {
    name: 'Energy',
    // sector-level catch terms for oil-market macro that names no specific company. 'opec' also matches
    // "OPEC+" (the '+' is a word boundary); bare 'oil'/'crude' are deliberately avoided (ambiguous), but
    // the two-word 'crude oil' is safe.
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
      { name: 'Tobacco', keywords: ['tobacco', 'cigarette maker'] },
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
      // Known trade-off: bare 'bank' also matches central-bank / 'World Bank' macro headlines that name no
      // commercial lender. We keep it — most real bank stories say only "<Name> Bank" — and accept that
      // monetary-policy news (highly relevant to banks) also surfaces under Financials.
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
    // 'utility stocks/sector' are unambiguous power references; bare 'utility'/'utilities' are NOT kept —
    // they fire on "utility vehicle" (autos), "utility software" (IT), "utility token" (crypto), etc.
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

// ---- whole-word matcher (mirrors lib/taxonomy.ts) ----
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

// Classification is only ever run when a GICS filter is actually set (matchesFilters early-outs otherwise),
// but the same headline gets re-tested across renders and across the two views — so cache by haystack.
const cache = new Map<string, GicsTags>()
const CACHE_CAP = 20_000

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
  if (cache.size >= CACHE_CAP) cache.clear() // simple bound — the wire rarely holds more than this
  cache.set(hay, tags)
  return tags
}

/** Tag a wire item with its GICS sector(s) + sub-sector(s), read from its headline and guessed companies. */
export function gicsOf(it: { headline?: string; headline_en?: string | null; companies?: { name: string }[] }): GicsTags {
  const parts = [it.headline, it.headline_en, ...(it.companies || []).map((c) => c.name)].filter(Boolean)
  if (!parts.length) return EMPTY
  return classifyText(parts.join(' · ').toLowerCase())
}
