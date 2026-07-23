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
  if (!/^[A-Z0-9][A-Z0-9.\-&]*$/.test(n)) return null // '&' admits NSE-style symbols (M&M.NS); first char stays alphanumeric
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
  let s = String(name ?? '').toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // drop parenthetical annotations so "Acme Inc. (NYSE: ACME)" folds with "Acme Inc."
    .replace(/\b(?:[a-z]\.)+/g, (m) => m.replace(/\./g, '')) // collapse dotted initialisms ("J.P." → "jp"); keeps "amazon.com" (its dot is not after a single letter)
    .replace(/[,']/g, '').replace(/\s+/g, ' ').trim().replace(/^the /, '')
  for (;;) {
    const i = s.lastIndexOf(' ')
    if (i <= 0) break
    // Strip ALL dots from the candidate token (not just trailing) so dotted legal forms — "S.A.",
    // "N.V.", "S.p.A." — normalise to "sa" / "nv" / "spa" and match LEGAL_SUFFIXES; otherwise the same
    // issuer spelled dotted vs undotted would fold into two different groups and never share aliases.
    const last = s.slice(i + 1).replace(/\./g, '')
    if (!LEGAL_SUFFIXES.has(last)) break
    s = s.slice(0, i)
  }
  s = s.replace(/\.+$/, '')
  return s.length >= 3 ? s : ''
}

// Ordinary English words that are also single-word company cores. A one-word core equal to one of these is
// NOT distinctive enough to claim an untagged mention in free headline prose: a pick of "Target Corporation"
// reduces to core "target" and would whole-word-match "price target"; "Orange S.A." → "orange" would match
// "orange juice". So the core-name fallback declines a common single word against the free blob. This does
// NOT touch a DISTINCTIVE single word (tesla / nvidia / netflix — absent from this set, so they still match)
// nor any MULTI-word core ("norsk hydro" — inherently distinctive). A common-word company is still reachable
// by its exact ticker and by a tagged company-name match; only the free-prose core rescue is withheld.
// MUST stay identical to the server twin in ui/server/src/news/symbology.ts.
const COMMON_NAME_WORDS = new Set([
  'target', 'orange', 'match', 'peak', 'core', 'edge', 'wave', 'pulse', 'sound', 'boot',
])

/** Does the (lowercased) haystack name this company? Whole-word on the full name OR on its core —
 *  so a pick of "Norsk Hydro ASA" still hits the headline "Norsk Hydro trims output". A single-word core
 *  that is an ordinary English word (COMMON_NAME_WORDS) is not used as a free-prose fallback — it would
 *  false-match unrelated headlines ("price target", "orange juice") — while a distinctive single word and
 *  every multi-word core still match. */
export function companyNameMatches(hay: string, name: unknown): boolean {
  const n = String(name ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
  if (n && nameOccurs(hay, n)) return true
  const core = coreCompanyName(name)
  if (!core || core === n) return false
  if (!core.includes(' ') && COMMON_NAME_WORDS.has(core)) return false
  return nameOccurs(hay, core)
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

// ---- directory-pick listing country (WEB-ONLY population helper, NOT a shared matching primitive) ----
// A company picked ONLY from the global symbol directory carries no listing country (SymbolGroup exposes an
// `exchange`, not a country), so the feed-filter listing-country conflict guard could never engage — letting
// an NYSE `CAT` (Caterpillar) directory pick ticker-match an ASX `CAT` (Catapult) tagged item. These map a
// symbol/exchange to its ISO 3166-1 alpha-2 country so mergeCompanyOptions can stamp a definite country on a
// directory pick and re-arm the existing guard. Lives here (not in the server twin) because the pick is
// assembled in the browser from a SymbolGroup; the server guard already consumes company.listingCountry.

// Yahoo exchange-suffix (the part after the last dot) → country. Covers the same suffix set baseTicker knows.
const SUFFIX_COUNTRY: Record<string, string> = {
  OL: 'NO', ST: 'SE', CO: 'DK', HE: 'FI', IC: 'IS',
  L: 'GB', IL: 'GB', PA: 'FR', AS: 'NL', BR: 'BE', LS: 'PT', MI: 'IT', MC: 'ES',
  DE: 'DE', BE: 'DE', DU: 'DE', HM: 'DE', HA: 'DE', MU: 'DE', SG: 'DE', F: 'DE',
  SW: 'CH', VI: 'AT', AT: 'GR', WA: 'PL', PR: 'CZ', BD: 'HU', IS: 'TR',
  NS: 'IN', BO: 'IN',
  HK: 'HK', T: 'JP', SS: 'CN', SZ: 'CN', TW: 'TW', TWO: 'TW', KS: 'KR', KQ: 'KR', SI: 'SG', KL: 'MY', JK: 'ID', BK: 'TH',
  AX: 'AU', NZ: 'NZ',
  TO: 'CA', V: 'CA', CN: 'CA', NE: 'CA',
  MX: 'MX', SA: 'BR', BA: 'AR', SN: 'CL',
  JO: 'ZA', TA: 'IL', QA: 'QA', SR: 'SA', CA: 'EG', ME: 'RU',
}
// Yahoo exchDisp display name → country, for a suffix-LESS symbol (a Yahoo US listing carries no suffix, so
// its country can only come from the exchange label). Deliberately narrow: unmapped → unknown, so an
// unrecognised exchange NEVER produces a false conflict (it just leaves the pick country-undefined).
const EXCHANGE_COUNTRY: Record<string, string> = {
  NYSE: 'US', NASDAQ: 'US', NASDAQGS: 'US', NASDAQCM: 'US', NASDAQGM: 'US', 'NYSE AMERICAN': 'US', NYSEAMERICAN: 'US',
  NYSEARCA: 'US', 'NYSE ARCA': 'US', AMEX: 'US', BATS: 'US', CBOE: 'US', OTC: 'US', OTCMKTS: 'US', 'OTC MARKETS': 'US', PNK: 'US',
}
// One symbol's country: its exchange suffix if known, else (suffix-less) the exchange display label. null when neither resolves.
const symbolCountry = (sym: string, exchange?: string): string | null => {
  const norm = normTicker(sym)
  const i = norm.lastIndexOf('.')
  if (i > 0 && baseTicker(norm) !== norm) { const c = SUFFIX_COUNTRY[norm.slice(i + 1)]; if (c) return c }
  if (exchange) { const c = EXCHANGE_COUNTRY[exchange.trim().toUpperCase()]; if (c) return c }
  return null
}
/** A directory group's DEFINITE listing country — assigned only when every symbol we can place AGREES on
 *  one. A genuinely cross-country group (a US ADR + its foreign home line, e.g. NHYDY + NHY.OL) resolves to
 *  two countries → returns undefined, so its alias matches keep full recall; a clean single-market group
 *  (US-only CAT) returns its country, so a foreign same-ticker issuer is excluded by the conflict guard. The
 *  primary symbol is placed by its exchange label; aliases are placed by suffix only (no exchange context). */
export function groupListingCountry(primary: string, aliases: string[], exchange?: string): string | undefined {
  const seen = new Set<string>()
  const c0 = symbolCountry(primary, exchange)
  if (c0) seen.add(c0)
  for (const a of aliases) {
    const c = symbolCountry(a)
    // An alias we cannot place (a suffix-less US OTC line like NHYDY, with no exchange context) could belong
    // to a DIFFERENT country. Placing NHY.OL as 'NO' while silently skipping such aliases asserts a DEFINITE
    // single country the group does not have, which then makes the conflict guard reject the very US archive
    // tags carried as aliases. So an unplaceable alias makes the country indefinite → undefined (full recall).
    if (!c) return undefined
    seen.add(c)
  }
  return seen.size === 1 ? [...seen][0] : undefined
}
