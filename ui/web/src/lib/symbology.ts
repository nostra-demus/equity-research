// Client twin of the server's symbology MATCHING primitives (ui/server/src/news/symbology.ts) — the
// browser can't import server code, so the bodies are hand-duplicated and MUST stay byte-identical
// (the client/server lockstep the company filter depends on). The global symbol DIRECTORY has no twin
// here: the browser reaches it through GET /api/news/symbols (lib/api.ts symbolSearch).

// ---- whole-word name matcher ----
// Word chars are ASCII [a-z0-9], so "amazon" hits "amazon's results" / "amazon.com" but NOT "amazons" /
// "metadata" — precision without losing recall on CJK / space-less scripts (every char reads as a
// boundary there).
export function nameOccurs(hay: string, needle: string): boolean {
  if (!needle) return false
  const word = (ch: string) => (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9')
  const headWord = word(needle[0])
  const tailWord = word(needle[needle.length - 1])
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const before = i === 0 ? '' : hay[i - 1]
    const after = i + needle.length >= hay.length ? '' : hay[i + needle.length]
    if ((!before || !word(before) || !headWord) && (!after || !word(after) || !tailWord)) return true
  }
  return false
}

// ---- ticker scrubbing + normalisation ----

const JUNK_TICKERS = new Set(['NULL', 'NONE', 'N/A', 'NA', 'N.A', 'UNKNOWN', 'TBD', 'PRIVATE', 'UNLISTED', 'OTC', 'IPO'])

/** The single rule for "is this a real ticker": null for junk (placeholders like "NULL", CIK-like long
 *  digit runs). Numeric codes up to 6 digits are KEPT (BSE "500325", HK "0005"). Deploy-skew defense on
 *  the client too: an OLD server can still serve unscrubbed facet tickers. */
export function cleanTicker(t: unknown): string | null {
  const n = String(t ?? '').trim().toUpperCase()
  if (!n || n.length > 15) return null
  if (JUNK_TICKERS.has(n)) return null
  if (!/^[A-Z0-9][A-Z0-9.\-]*$/.test(n)) return null
  if (/^\d{7,}$/.test(n.replace(/[.\-]/g, ''))) return null // CIK-like long digit run — not a listing symbol
  return n
}

/** Uppercased, class-separator-normalised spelling ("brk-b" → "BRK.B") — the compare form. */
export const normTicker = (t: unknown): string => String(t ?? '').trim().toUpperCase().replace(/-/g, '.')

const EXCHANGE_SUFFIXES = new Set([
  'OL', 'ST', 'CO', 'HE', 'IC', // Nordics
  'L', 'IL', 'PA', 'AS', 'BR', 'LS', 'MI', 'MC', 'DE', 'BE', 'DU', 'HM', 'HA', 'MU', 'SG', 'SW', 'VI', 'WA', 'PR', 'BD', 'AT', 'IS', // Europe (F excluded: collides with share-class-style suffixes rarely, kept simple below)
  'F', // Frankfurt
  'NS', 'BO', // India NSE / BSE
  'HK', 'T', 'SS', 'SZ', 'TW', 'TWO', 'KS', 'KQ', 'SI', 'KL', 'JK', 'BK', // Asia
  'AX', 'NZ', // Oceania
  'TO', 'V', 'CN', 'NE', // Canada
  'MX', 'SA', 'BA', 'SN', // Latin America
  'JO', 'TA', 'QA', 'SR', 'CA', 'ME', // Africa / Middle East / Moscow
])

/** The listing-agnostic base of a symbol: "NHY.OL" → "NHY", "500325.BO" → "500325" — but "BRK.A" stays
 *  "BRK.A" ("A" is a share class, not an exchange). */
export function baseTicker(t: unknown): string {
  const n = normTicker(t)
  const i = n.lastIndexOf('.')
  if (i > 0 && EXCHANGE_SUFFIXES.has(n.slice(i + 1))) return n.slice(0, i)
  return n
}

// ---- company-name normalisation ----

const LEGAL_SUFFIXES = new Set([
  'inc', 'incorporated', 'corp', 'corporation', 'co', 'company', 'ltd', 'limited', 'plc', 'llc', 'llp', 'lp',
  'sa', 'se', 'nv', 'bv', 'ag', 'asa', 'as', 'ab', 'oyj', 'oy', 'aps', 'spa', 'sarl', 'gmbh', 'kgaa', 'kk',
  'pjsc', 'psc', 'jsc', 'pcl', 'bhd', 'berhad', 'tbk', 'adr', 'ads', '&',
])

/** The core identity of a company name: lowercased, punctuation-lightened, legal suffixes stripped —
 *  "Norsk Hydro ASA" → "norsk hydro", "JPMORGAN CHASE & CO" → "jpmorgan chase", "CITIGROUP INC" →
 *  "citigroup". '' when nothing meaningful remains (guards against over-stripping short names). */
export function coreCompanyName(name: unknown): string {
  let s = String(name ?? '').toLowerCase().replace(/[,']/g, '').replace(/\s+/g, ' ').trim().replace(/^the /, '')
  for (;;) {
    const i = s.lastIndexOf(' ')
    if (i <= 0) break
    const last = s.slice(i + 1).replace(/\.+$/, '')
    if (!LEGAL_SUFFIXES.has(last)) break
    s = s.slice(0, i)
  }
  s = s.replace(/\.+$/, '')
  return s.length >= 3 ? s : ''
}

/** Does the (lowercased) haystack name this company? Whole-word on the full name OR on its core —
 *  so a pick of "Norsk Hydro ASA" still hits the headline "Norsk Hydro trims output". */
export function companyNameMatches(hay: string, name: unknown): boolean {
  const n = String(name ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
  if (n && nameOccurs(hay, n)) return true
  const core = coreCompanyName(name)
  return !!core && core !== n && nameOccurs(hay, core)
}

// ---- the pick's ticker set + the tag-vs-pick ticker test ----

/** Every ticker spelling a company pick carries (the picked symbol + its cross-listing aliases), normalised
 *  + junk-scrubbed + deduped. */
export function pickTickerSet(company: { ticker?: string | null; aliases?: string[] }): string[] {
  const out = new Set<string>()
  const add = (t?: string | null) => { const c = cleanTicker(t); if (c) out.add(normTicker(c)) }
  add(company.ticker)
  for (const a of company.aliases || []) add(a)
  return [...out]
}

/** Does a tagged ticker match ANY of the pick's spellings? Exact after normalisation, or equal on the
 *  exchange-suffix-stripped base (so a pick alias "NHY.OL" catches an archive tag "NHY"). The base
 *  compare needs ≥2 chars so a degenerate one-letter base can't bridge companies. */
export function tickerHitAny(tagTicker: unknown, picks: string[]): boolean {
  const tag = normTicker(tagTicker)
  if (!tag) return false
  const tagBase = baseTicker(tag)
  return picks.some((p) => p === tag || (baseTicker(p).length >= 2 && baseTicker(p) === tagBase))
}
