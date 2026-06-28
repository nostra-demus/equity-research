// Country-level geography for the news wire — the canonical vocabulary AND the read/ingest-time resolver.
//
// Geography's atomic unit is the COUNTRY (ISO 3166-1 alpha-2), rolled up into a CONTINENT/region group
// for a two-level Continent → Country filter — symmetric with the GICS Sector → Sub-sector drill-down
// (gics.ts). This replaces the old 8-bucket `Region` enum (geo.ts) as the geography filter's vocabulary;
// the legacy `region` field is retained on the wire for the trading-market logic and as a coarse floor.
//
// Pure + dependency-free (like rank.ts / scope.ts / geo.ts) so it is trivially unit-testable. Geography is
// server-only canonical: the browser does NOT import this module — it renders the Continent → Country
// drill-down from the server-computed `/api/news/facets` response, so there is no web mirror to keep in
// sync (unlike gics.ts, whose taxonomy the web copies and a gics-sync test deep-compares).
//
// `resolveCountry` says WHERE an event is, most-confident-first: (a) the listing country of the single
// company a primary-linkage headline is about; (b) a curated gazetteer matched whole-word over the
// headline (country names, demonyms, capitals/financial centres, exchanges); (c) the legacy domain
// region as a weak floor. No confident signal → null ("Global / unspecified" — honest, never a forced
// bucket, mirroring the GICS "a miss is honest" rule). The gazetteer is data, extensible without code.

import type { Region } from './types'

/** The continent / sub-region a country rolls up into — the top level of the geography drill-down. */
export type GeoRegion =
  | 'North America'
  | 'South America'
  | 'Europe'
  | 'Middle East'
  | 'Africa'
  | 'Asia'
  | 'Oceania'

export interface CountryInfo {
  /** the display name shown in the dropdown */
  name: string
  /** the continent / sub-region group this country sits under */
  region: GeoRegion
}

// Countries grouped by the continent/region they appear under in the filter. ISO 3166-1 alpha-2 codes.
// Grouping is for NAVIGATION, not politics: Russia/Cyprus → Europe; Turkey/Israel → Middle East; the
// Caucasus + Central Asia → Asia; Central America + the Caribbean fold into North America.
const BY_REGION: Record<GeoRegion, ReadonlyArray<readonly [string, string]>> = {
  'North America': [
    ['US', 'United States'], ['CA', 'Canada'], ['MX', 'Mexico'], ['GT', 'Guatemala'], ['BZ', 'Belize'],
    ['SV', 'El Salvador'], ['HN', 'Honduras'], ['NI', 'Nicaragua'], ['CR', 'Costa Rica'], ['PA', 'Panama'],
    ['BS', 'Bahamas'], ['CU', 'Cuba'], ['JM', 'Jamaica'], ['HT', 'Haiti'], ['DO', 'Dominican Republic'],
    ['PR', 'Puerto Rico'], ['TT', 'Trinidad and Tobago'], ['BB', 'Barbados'], ['GD', 'Grenada'],
    ['LC', 'Saint Lucia'], ['VC', 'Saint Vincent and the Grenadines'], ['AG', 'Antigua and Barbuda'],
    ['DM', 'Dominica'], ['KN', 'Saint Kitts and Nevis'], ['BM', 'Bermuda'], ['KY', 'Cayman Islands'],
    ['VG', 'British Virgin Islands'], ['VI', 'U.S. Virgin Islands'], ['AW', 'Aruba'], ['CW', 'Curaçao'],
    ['GL', 'Greenland'],
  ],
  'South America': [
    ['BR', 'Brazil'], ['AR', 'Argentina'], ['CL', 'Chile'], ['CO', 'Colombia'], ['PE', 'Peru'],
    ['VE', 'Venezuela'], ['EC', 'Ecuador'], ['BO', 'Bolivia'], ['PY', 'Paraguay'], ['UY', 'Uruguay'],
    ['GY', 'Guyana'], ['SR', 'Suriname'], ['GF', 'French Guiana'], ['FK', 'Falkland Islands'],
  ],
  Europe: [
    ['GB', 'United Kingdom'], ['IE', 'Ireland'], ['FR', 'France'], ['DE', 'Germany'], ['IT', 'Italy'],
    ['ES', 'Spain'], ['PT', 'Portugal'], ['NL', 'Netherlands'], ['BE', 'Belgium'], ['LU', 'Luxembourg'],
    ['CH', 'Switzerland'], ['AT', 'Austria'], ['SE', 'Sweden'], ['NO', 'Norway'], ['DK', 'Denmark'],
    ['FI', 'Finland'], ['IS', 'Iceland'], ['PL', 'Poland'], ['CZ', 'Czechia'], ['SK', 'Slovakia'],
    ['HU', 'Hungary'], ['RO', 'Romania'], ['BG', 'Bulgaria'], ['GR', 'Greece'], ['HR', 'Croatia'],
    ['SI', 'Slovenia'], ['RS', 'Serbia'], ['BA', 'Bosnia and Herzegovina'], ['ME', 'Montenegro'],
    ['MK', 'North Macedonia'], ['AL', 'Albania'], ['XK', 'Kosovo'], ['EE', 'Estonia'], ['LV', 'Latvia'],
    ['LT', 'Lithuania'], ['BY', 'Belarus'], ['UA', 'Ukraine'], ['MD', 'Moldova'], ['RU', 'Russia'],
    ['MT', 'Malta'], ['CY', 'Cyprus'], ['MC', 'Monaco'], ['LI', 'Liechtenstein'], ['AD', 'Andorra'],
    ['SM', 'San Marino'], ['VA', 'Vatican City'], ['GI', 'Gibraltar'], ['FO', 'Faroe Islands'],
    ['JE', 'Jersey'], ['GG', 'Guernsey'], ['IM', 'Isle of Man'],
  ],
  'Middle East': [
    ['AE', 'United Arab Emirates'], ['SA', 'Saudi Arabia'], ['QA', 'Qatar'], ['KW', 'Kuwait'],
    ['BH', 'Bahrain'], ['OM', 'Oman'], ['YE', 'Yemen'], ['IQ', 'Iraq'], ['IR', 'Iran'], ['IL', 'Israel'],
    ['PS', 'Palestine'], ['JO', 'Jordan'], ['LB', 'Lebanon'], ['SY', 'Syria'], ['TR', 'Turkey'],
  ],
  Africa: [
    ['ZA', 'South Africa'], ['EG', 'Egypt'], ['NG', 'Nigeria'], ['KE', 'Kenya'], ['ET', 'Ethiopia'],
    ['GH', 'Ghana'], ['TZ', 'Tanzania'], ['UG', 'Uganda'], ['DZ', 'Algeria'], ['MA', 'Morocco'],
    ['TN', 'Tunisia'], ['LY', 'Libya'], ['SD', 'Sudan'], ['SS', 'South Sudan'], ['AO', 'Angola'],
    ['MZ', 'Mozambique'], ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'], ['BW', 'Botswana'], ['NA', 'Namibia'],
    ['MU', 'Mauritius'], ['SN', 'Senegal'], ['CI', "Côte d'Ivoire"], ['CM', 'Cameroon'],
    ['CD', 'DR Congo'], ['CG', 'Congo'], ['GA', 'Gabon'], ['GN', 'Guinea'], ['ML', 'Mali'],
    ['BF', 'Burkina Faso'], ['NE', 'Niger'], ['TD', 'Chad'], ['RW', 'Rwanda'], ['BI', 'Burundi'],
    ['BJ', 'Benin'], ['TG', 'Togo'], ['SL', 'Sierra Leone'], ['LR', 'Liberia'], ['MR', 'Mauritania'],
    ['MG', 'Madagascar'], ['MW', 'Malawi'], ['SO', 'Somalia'], ['ER', 'Eritrea'], ['DJ', 'Djibouti'],
    ['CF', 'Central African Republic'], ['GM', 'Gambia'], ['GW', 'Guinea-Bissau'],
    ['GQ', 'Equatorial Guinea'], ['LS', 'Lesotho'], ['SZ', 'Eswatini'], ['CV', 'Cape Verde'],
    ['ST', 'São Tomé and Príncipe'], ['KM', 'Comoros'], ['SC', 'Seychelles'],
  ],
  Asia: [
    ['CN', 'China'], ['HK', 'Hong Kong'], ['TW', 'Taiwan'], ['JP', 'Japan'], ['KR', 'South Korea'],
    ['KP', 'North Korea'], ['MN', 'Mongolia'], ['IN', 'India'], ['PK', 'Pakistan'], ['BD', 'Bangladesh'],
    ['LK', 'Sri Lanka'], ['NP', 'Nepal'], ['BT', 'Bhutan'], ['MV', 'Maldives'], ['AF', 'Afghanistan'],
    ['KZ', 'Kazakhstan'], ['UZ', 'Uzbekistan'], ['TM', 'Turkmenistan'], ['KG', 'Kyrgyzstan'],
    ['TJ', 'Tajikistan'], ['AZ', 'Azerbaijan'], ['AM', 'Armenia'], ['GE', 'Georgia'], ['SG', 'Singapore'],
    ['MY', 'Malaysia'], ['ID', 'Indonesia'], ['TH', 'Thailand'], ['VN', 'Vietnam'], ['PH', 'Philippines'],
    ['MM', 'Myanmar'], ['KH', 'Cambodia'], ['LA', 'Laos'], ['BN', 'Brunei'], ['TL', 'Timor-Leste'],
    ['MO', 'Macau'],
  ],
  Oceania: [
    ['AU', 'Australia'], ['NZ', 'New Zealand'], ['PG', 'Papua New Guinea'], ['FJ', 'Fiji'],
    ['SB', 'Solomon Islands'], ['VU', 'Vanuatu'], ['NC', 'New Caledonia'], ['PF', 'French Polynesia'],
    ['WS', 'Samoa'], ['TO', 'Tonga'], ['KI', 'Kiribati'], ['FM', 'Micronesia'], ['MH', 'Marshall Islands'],
    ['PW', 'Palau'], ['NR', 'Nauru'], ['TV', 'Tuvalu'], ['GU', 'Guam'],
  ],
}

/** Every continent group, in the order shown in the drill-down. */
export const GEO_REGIONS: readonly GeoRegion[] = Object.keys(BY_REGION) as GeoRegion[]

// ISO alpha-2 → { name, region }. The single source of truth the helpers + facets read.
export const COUNTRIES: Readonly<Record<string, CountryInfo>> = Object.freeze(
  Object.fromEntries(
    GEO_REGIONS.flatMap((region) => BY_REGION[region].map(([cc, name]) => [cc, { name, region }] as const)),
  ),
)

/** Display name for an ISO alpha-2 code (the code itself when unknown). */
export const countryName = (cc?: string | null): string => (cc ? COUNTRIES[cc.toUpperCase()]?.name || cc.toUpperCase() : '')
/** The continent/region group an ISO alpha-2 code rolls up into (null when unknown). */
export const regionOfCountry = (cc?: string | null): GeoRegion | null => (cc ? COUNTRIES[cc.toUpperCase()]?.region || null : null)
/** The ISO alpha-2 codes under a continent group, in canonical order. Empty for an unknown group. */
export const countriesInRegion = (region: string): string[] =>
  (BY_REGION[region as GeoRegion] || []).map(([cc]) => cc)
/** Type guard: a value that is a known ISO alpha-2 country code. */
export const isCountry = (v: unknown): v is string => typeof v === 'string' && !!COUNTRIES[v.toUpperCase()]

// ---- the gazetteer: place / demonym / exchange keyword → ISO alpha-2 (whole-word, case-insensitive) ----
// Curated, NOT exhaustive — the high-confidence path is a company's listing_country (below). Multi-word
// keys are fine (the \b matcher treats the space literally). Extensible: add a row, no code change.
const GAZETTEER: ReadonlyArray<readonly [string, string]> = [
  // Gulf + wider Middle East (the user's motivating example)
  ['united arab emirates', 'AE'], ['uae', 'AE'], ['emirati', 'AE'], ['dubai', 'AE'], ['abu dhabi', 'AE'], ['sharjah', 'AE'], ['dfm', 'AE'], ['adx', 'AE'],
  ['saudi arabia', 'SA'], ['saudi', 'SA'], ['riyadh', 'SA'], ['jeddah', 'SA'], ['aramco', 'SA'], ['tadawul', 'SA'],
  ['qatar', 'QA'], ['qatari', 'QA'], ['doha', 'QA'],
  ['kuwait', 'KW'], ['kuwaiti', 'KW'],
  ['bahrain', 'BH'], ['bahraini', 'BH'], ['manama', 'BH'],
  ['oman', 'OM'], ['omani', 'OM'], ['muscat', 'OM'],
  ['israel', 'IL'], ['israeli', 'IL'], ['tel aviv', 'IL'],
  ['turkey', 'TR'], ['turkish', 'TR'], ['istanbul', 'TR'], ['ankara', 'TR'],
  ['iran', 'IR'], ['iranian', 'IR'], ['tehran', 'IR'],
  ['iraq', 'IQ'], ['iraqi', 'IQ'], ['baghdad', 'IQ'],
  ['egypt', 'EG'], ['egyptian', 'EG'], ['cairo', 'EG'],
  // major global markets
  ['united states', 'US'], ['u.s.', 'US'], ['american', 'US'], ['washington', 'US'], ['new york', 'US'], ['wall street', 'US'], ['nasdaq', 'US'], ['nyse', 'US'], ['silicon valley', 'US'],
  ['india', 'IN'], ['indian', 'IN'], ['mumbai', 'IN'], ['new delhi', 'IN'], ['bengaluru', 'IN'], ['bangalore', 'IN'], ['sensex', 'IN'], ['nifty', 'IN'], ['sebi', 'IN'],
  ['china', 'CN'], ['chinese', 'CN'], ['beijing', 'CN'], ['shanghai', 'CN'], ['shenzhen', 'CN'],
  ['hong kong', 'HK'], ['hkex', 'HK'],
  ['taiwan', 'TW'], ['taiwanese', 'TW'], ['taipei', 'TW'],
  ['japan', 'JP'], ['japanese', 'JP'], ['tokyo', 'JP'], ['osaka', 'JP'], ['nikkei', 'JP'],
  ['south korea', 'KR'], ['korean', 'KR'], ['seoul', 'KR'], ['kospi', 'KR'],
  ['united kingdom', 'GB'], ['britain', 'GB'], ['british', 'GB'], ['london', 'GB'], ['ftse', 'GB'],
  ['germany', 'DE'], ['german', 'DE'], ['berlin', 'DE'], ['frankfurt', 'DE'],
  ['france', 'FR'], ['french', 'FR'], ['paris', 'FR'],
  ['italy', 'IT'], ['italian', 'IT'], ['milan', 'IT'], ['rome', 'IT'],
  ['spain', 'ES'], ['spanish', 'ES'], ['madrid', 'ES'],
  ['netherlands', 'NL'], ['dutch', 'NL'], ['amsterdam', 'NL'],
  ['switzerland', 'CH'], ['swiss', 'CH'], ['zurich', 'CH'], ['geneva', 'CH'],
  ['ireland', 'IE'], ['irish', 'IE'], ['dublin', 'IE'],
  ['sweden', 'SE'], ['swedish', 'SE'], ['stockholm', 'SE'],
  ['russia', 'RU'], ['russian', 'RU'], ['moscow', 'RU'],
  ['canada', 'CA'], ['canadian', 'CA'], ['toronto', 'CA'],
  ['brazil', 'BR'], ['brazilian', 'BR'], ['são paulo', 'BR'], ['sao paulo', 'BR'], ['bovespa', 'BR'],
  ['mexico', 'MX'], ['mexican', 'MX'],
  ['australia', 'AU'], ['australian', 'AU'], ['sydney', 'AU'], ['melbourne', 'AU'],
  ['new zealand', 'NZ'],
  ['singapore', 'SG'],
  ['indonesia', 'ID'], ['indonesian', 'ID'], ['jakarta', 'ID'],
  ['malaysia', 'MY'], ['malaysian', 'MY'], ['kuala lumpur', 'MY'],
  ['thailand', 'TH'], ['bangkok', 'TH'],
  ['vietnam', 'VN'], ['vietnamese', 'VN'], ['hanoi', 'VN'],
  ['philippines', 'PH'], ['filipino', 'PH'], ['manila', 'PH'],
  ['pakistan', 'PK'], ['pakistani', 'PK'], ['karachi', 'PK'],
  ['bangladesh', 'BD'], ['bangladeshi', 'BD'], ['dhaka', 'BD'],
  ['south africa', 'ZA'], ['south african', 'ZA'], ['johannesburg', 'ZA'],
  ['nigeria', 'NG'], ['nigerian', 'NG'], ['lagos', 'NG'],
]

// The legacy 8-bucket Region → a representative country, the weak floor when nothing else resolves.
// GLOBAL / OTHER carry no single country → null (honest "unspecified").
const REGION_TO_COUNTRY: Partial<Record<Region, string>> = { US: 'US', IN: 'IN', JP: 'JP', GB: 'GB', CN: 'CN', KR: 'KR' }

// ---- whole-word matcher (mirrors gics.ts / taxonomy.ts) ----
const reCache = new Map<string, RegExp>()
function hasWord(hay: string, kw: string): boolean {
  let re = reCache.get(kw)
  if (!re) {
    re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    reCache.set(kw, re)
  }
  return re.test(hay)
}

interface CompanyLike {
  name?: string
  listing_country?: string | null
}

/**
 * The ISO alpha-2 country a story is ABOUT, or null when no confident signal. In order:
 *   (a) the listing country of the single company a PRIMARY-linkage headline is about (highest confidence);
 *   (b) the gazetteer, when the headline names EXACTLY ONE distinct country (two countries → ambiguous → skip);
 *   (c) the legacy domain/event region mapped to its representative country (the safe floor — never regresses).
 * Never fabricates: an ambiguous or unknown signal degrades to null, shown as "Global / unspecified".
 */
export function resolveCountry(
  headline: string | null | undefined,
  headlineEn: string | null | undefined,
  companies: ReadonlyArray<CompanyLike> | null | undefined,
  domainRegion?: Region | null,
  issuerLinkage?: string | null,
): string | null {
  // (a) a primary-linkage single company's listing country
  if (issuerLinkage === 'primary' && Array.isArray(companies) && companies.length === 1) {
    const cc = (companies[0]?.listing_country || '').trim().toUpperCase()
    if (isCountry(cc)) return cc
  }
  // (b) the gazetteer over the headline (+ translation) — accept only when exactly one country is named
  const hay = [headline, headlineEn].filter(Boolean).join(' · ').toLowerCase()
  if (hay) {
    const hits = new Set<string>()
    for (const [kw, cc] of GAZETTEER) if (hasWord(hay, kw)) hits.add(cc)
    if (hits.size === 1) return [...hits][0]
  }
  // (c) the legacy region floor
  return (domainRegion && REGION_TO_COUNTRY[domainRegion]) || null
}
