// Global ticker symbology — the "type ANY ticker from ANY country" layer under the pick-a-company
// filter, plus the scrubbing that keeps the news→ticker mapping honest end-to-end.
//
// Three jobs:
//  1. SCRUB: the cheap title-only triage writes junk tickers onto company guesses — the literal string
//     "NULL", SEC CIK numbers ("0000200245"), placeholders. cleanTicker() is the single rule for what a
//     real ticker looks like; hydrate (news/feed.ts) applies it on read so the WHOLE backlog is clean
//     with no backfill, and the facet/autofill never surfaces a CIK as a symbol.
//  2. MATCH: primitives shared by the canonical filter (feed-filter.ts), the facet index (facets.ts)
//     and — as a hand-maintained twin — the browser (ui/web/src/lib/symbology.ts): normalise a ticker
//     across exchange-suffix spellings (NHY vs NHY.OL), strip legal suffixes off a company name
//     ("Norsk Hydro ASA" → "norsk hydro", "CITIGROUP INC" → "citigroup") so one company folds into ONE
//     entry however a source spelled it, and the whole-word name matcher.
//  3. DIRECTORY: searchSymbols() queries a free, keyless global symbol search (Yahoo Finance search —
//     covers US, Oslo, NSE/BSE, LSE, HK, Tokyo, and the rest) so the autofill resolves a ticker the
//     archive has never tagged (the OTC ADR NHYDY → Norsk Hydro ASA with its Oslo sibling NHY.OL),
//     grouped per company with the full cross-listing alias set, TTL-cached, fail-closed to [].

// ---- whole-word name matcher (moved here from feed-filter.ts; re-exported there for compat) ----
// Word chars are ASCII [a-z0-9], so "amazon" hits "amazon's results" / "amazon.com" but NOT "amazons" /
// "metadata" — the precision partner to the recall-first design. ASCII-only word chars ⇒ it stays
// PERMISSIVE for CJK / space-less scripts (every char reads as a boundary there), so a non-Latin headline
// never loses a match. MUST stay identical to the web twin in ui/web/src/lib/symbology.ts.
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

// Placeholder strings the triage writes when it has no symbol — never real tickers.
const JUNK_TICKERS = new Set(['NULL', 'NONE', 'N/A', 'NA', 'N.A', 'UNKNOWN', 'TBD', 'PRIVATE', 'UNLISTED', 'OTC', 'IPO'])

/** The single rule for "is this a real ticker": null for junk. Rejects placeholders ("NULL"), anything
 *  with spaces/odd characters, over-long strings, and CIK-like long digit runs ("0000200245" — SEC CIK
 *  ids are 7–10 digits). Numeric codes up to 6 digits are KEPT: they are real symbols (BSE "500325",
 *  HK "0005"/"00700", Tokyo-style 4-digit codes). */
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

// Yahoo-style exchange suffixes (the part after the LAST dot). Share-class letters (BRK.A) are NOT here,
// so a class suffix never strips. Used to equate cross-spellings of the SAME listing (NHY vs NHY.OL).
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

// A saved title-only ticker is often exchange-native while Yahoo returns its venue-qualified spelling.
// Treat that as the same exact local listing only when the saved listing country explicitly licenses the
// returned suffix. A saved suffix remains exact-only, and an unknown country never enables base matching.
const DIRECTORY_SUFFIXES_BY_COUNTRY: Record<string, ReadonlySet<string>> = {
  NO: new Set(['OL']), SE: new Set(['ST']), DK: new Set(['CO']), FI: new Set(['HE']), IS: new Set(['IC']),
  GB: new Set(['L', 'IL']), FR: new Set(['PA']), NL: new Set(['AS']), BE: new Set(['BR']), PT: new Set(['LS']),
  IT: new Set(['MI']), ES: new Set(['MC']), DE: new Set(['DE', 'BE', 'DU', 'HM', 'HA', 'MU', 'F']),
  CH: new Set(['SW']), AT: new Set(['VI']), PL: new Set(['WA']), CZ: new Set(['PR']), HU: new Set(['BD']),
  TR: new Set(['IS']), IN: new Set(['NS', 'BO']), HK: new Set(['HK']), JP: new Set(['T']),
  CN: new Set(['SS', 'SZ']), TW: new Set(['TW', 'TWO']), KR: new Set(['KS', 'KQ']), SG: new Set(['SI']),
  MY: new Set(['KL']), ID: new Set(['JK']), TH: new Set(['BK']), AU: new Set(['AX']), NZ: new Set(['NZ']),
  CA: new Set(['TO', 'V', 'CN', 'NE']), MX: new Set(['MX']), BR: new Set(['SA']), AR: new Set(['BA']),
  CL: new Set(['SN']), ZA: new Set(['JO']), IL: new Set(['TA']), QA: new Set(['QA']), SA: new Set(['SR']),
  EG: new Set(['CA']),
}

/** Exact directory symbol match, allowing only the country-proven Yahoo suffix for a saved bare symbol. */
export function directoryTickerMatches(saved: unknown, returned: unknown, listingCountry?: string | null): boolean {
  const wanted = cleanTicker(saved)
  const actual = cleanTicker(returned)
  if (!wanted || !actual) return false
  const wantedNorm = normTicker(wanted)
  const actualNorm = normTicker(actual)
  if (wantedNorm === actualNorm) return true
  if (baseTicker(wantedNorm) !== wantedNorm || baseTicker(actualNorm) !== wantedNorm) return false
  const dot = actualNorm.lastIndexOf('.')
  if (dot <= 0) return false
  const allowed = DIRECTORY_SUFFIXES_BY_COUNTRY[String(listingCountry || '').trim().toUpperCase()]
  return allowed?.has(actualNorm.slice(dot + 1)) === true
}

// ---- company-name normalisation ----

// Legal-form suffixes stripped (repeatedly) off the END of a name to get its core identity. Deliberately
// EXCLUDES identity-bearing words like "group" / "holdings" ("Man Group" must not collapse to "man").
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
// MUST stay identical to the web twin in ui/web/src/lib/symbology.ts.
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

// ---- the global symbol directory (free, keyless; fail-closed) ----

export interface SymbolQuote { symbol: string; name: string; exchange: string }
// One company across its listings: the primary symbol (the best match for what was typed) + every
// sibling listing as an alias — what the autofill offers and what the pick carries into the filter.
export interface SymbolGroup {
  name: string
  symbol: string
  exchange: string
  aliases: string[]
  /** Venue provenance for each alias returned by the same raw directory query. */
  aliasExchanges?: Record<string, string>
}

/** Fold raw search quotes into one group per company (keyed by core name), preserving relevance order.
 *  Pure — unit-tested without network. */
export function groupQuotes(quotes: SymbolQuote[]): SymbolGroup[] {
  const groups = new Map<string, SymbolGroup>()
  for (const q of quotes) {
    const sym = cleanTicker(q.symbol)
    if (!sym) continue
    const key = coreCompanyName(q.name) || baseTicker(sym)
    const g = groups.get(key)
    const normalized = normTicker(sym)
    if (!g) groups.set(key, {
      name: q.name, symbol: normalized, exchange: q.exchange, aliases: [normalized],
      aliasExchanges: { [normalized]: q.exchange },
    })
    else if (!g.aliases.includes(normalized)) {
      g.aliases.push(normalized)
      g.aliasExchanges = { ...g.aliasExchanges, [normalized]: q.exchange }
    }
  }
  return [...groups.values()]
}

const SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search'
export type FetchLike = typeof fetch

// Shared with the existing enriched UI search. A rescue cache hit still consumes its already-reserved
// daily review slot, but it avoids another request to the free directory.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const CACHE_MAX = 500
const symCache = new Map<string, { at: number; groups: SymbolGroup[] }>()

export type SymbolSearchUnavailableReason = 'timeout_or_network' | 'http_error' | 'invalid_response'
export type SymbolSearchCheckedResult =
  | { status: 'ok'; groups: SymbolGroup[] }
  | { status: 'unavailable'; groups: []; reason: SymbolSearchUnavailableReason; httpStatus?: number }

/** One raw directory query with an honest availability result. A healthy empty result is NOT the same
 * as a timeout/429/5xx. The second-look lane uses this seam so an upstream outage can never render as
 * "nothing qualified". At most one request is made; sibling enrichment belongs to the existing UI path. */
export async function searchSymbolsChecked(
  q: string,
  fetchImpl: FetchLike = fetch,
  options: { useCache?: boolean } = {},
): Promise<SymbolSearchCheckedResult> {
  const key = q.trim().toLowerCase()
  const now = Date.now()
  const cached = options.useCache ? symCache.get(key) : undefined
  if (cached && now - cached.at < CACHE_TTL_MS) return { status: 'ok', groups: cached.groups }
  try {
    const url = `${SEARCH_URL}?q=${encodeURIComponent(q)}&quotesCount=12&newsCount=0&listsCount=0`
    const r = await fetchImpl(url, {
      signal: AbortSignal.timeout(4500),
      headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0 (compatible; equity-research-cockpit)' },
    })
    if (!r.ok) return { status: 'unavailable', groups: [], reason: 'http_error', ...(typeof r.status === 'number' ? { httpStatus: r.status } : {}) }
    const j: any = await r.json().catch(() => null)
    if (!j || typeof j !== 'object' || !Array.isArray(j.quotes)) {
      return { status: 'unavailable', groups: [], reason: 'invalid_response' }
    }
    const quotes: SymbolQuote[] = j.quotes
      .filter((x: any) => x && x.quoteType === 'EQUITY' && typeof x.symbol === 'string' && x.symbol && (x.longname || x.shortname))
      .map((x: any) => ({ symbol: String(x.symbol), name: String(x.longname || x.shortname), exchange: String(x.exchDisp || x.exchange || '') }))
    const groups = groupQuotes(quotes)
    // As before, never cache an empty result: the legacy facade cannot distinguish a healthy empty
    // result from an outage, so pinning [] would preserve a transient failure for six hours.
    if (options.useCache && groups.length > 0) {
      if (symCache.size >= CACHE_MAX) symCache.delete(symCache.keys().next().value as string)
      symCache.set(key, { at: now, groups })
    }
    return { status: 'ok', groups }
  } catch {
    return { status: 'unavailable', groups: [], reason: 'timeout_or_network' }
  }
}

/** Back-compatible facade for existing callers: any failure still collapses to []. */
export async function searchSymbols(q: string, fetchImpl: FetchLike = fetch): Promise<SymbolGroup[]> {
  return (await searchSymbolsChecked(q, fetchImpl)).groups
}

async function cachedSearch(q: string, fetchImpl: FetchLike): Promise<SymbolGroup[]> {
  const key = q.trim().toLowerCase()
  const hit = symCache.get(key)
  const now = Date.now()
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.groups
  const groups = await searchSymbols(q, fetchImpl)
  if (groups.length > 0) {
    if (symCache.size >= CACHE_MAX) symCache.delete(symCache.keys().next().value as string)
    symCache.set(key, { at: now, groups })
  }
  return groups
}

/** The endpoint's entry: search, then — when the top hit came back as a lone listing (typing one exact
 *  symbol usually does, e.g. "NHYDY") — ONE follow-up search by the company's core name to pull in its
 *  sibling listings (NHY.OL, NHYKF, …) so the pick carries the full alias set. Fail-closed to []. */
export async function searchSymbolsEnriched(q: string, fetchImpl: FetchLike = fetch): Promise<SymbolGroup[]> {
  let groups: SymbolGroup[]
  try {
    groups = (await cachedSearch(q, fetchImpl)).map((g) => ({
      ...g, aliases: [...g.aliases], ...(g.aliasExchanges ? { aliasExchanges: { ...g.aliasExchanges } } : {}),
    }))
  } catch {
    return [] // primary search offline / blocked / slow — the filter degrades to archive-facet + free-typed matching
  }
  const top = groups[0]
  if (top && top.aliases.length < 2) {
    const core = coreCompanyName(top.name)
    if (core && core !== q.trim().toLowerCase()) {
      try {
        const byName = await cachedSearch(core, fetchImpl)
        const sib = byName.find((g) => coreCompanyName(g.name) === core)
        for (const a of sib?.aliases || []) if (!top.aliases.includes(a)) {
          top.aliases.push(a)
          const exchange = sib?.aliasExchanges?.[a]
          if (exchange) top.aliasExchanges = { ...top.aliasExchanges, [a]: exchange }
        }
      } catch {
        // Sibling-enrichment failed (transient) — keep the successfully-fetched primary groups rather
        // than discarding them; the pick just carries fewer cross-listing aliases this time.
      }
    }
  }
  return groups
}

export interface VerifiedEquityListing {
  ticker: string
  exchange: string
  companyName: string
  source: 'yahoo_symbol_directory'
}

/**
 * Verify that a model/user symbol resolves to an independently returned EQUITY listing. This proves
 * ticker + venue identity only; it deliberately makes no liquidity claim. Any mismatch/failure is null.
 */
export async function verifyEquityListing(ticker: string, companyName?: string | null, fetchImpl: FetchLike = fetch): Promise<VerifiedEquityListing | null> {
  const wanted = cleanTicker(ticker)
  if (!wanted) return null
  const wantedNorm = normTicker(wanted)
  const groups = await searchSymbolsEnriched(wanted, fetchImpl)
  const hit = groups.find((group) => {
    // SymbolGroup carries venue provenance only for its primary `symbol`; aliases are sibling listings
    // without per-alias venues. Exactness prevents attaching the primary's exchange to a sibling ticker.
    if (normTicker(group.symbol) !== wantedNorm || !String(group.exchange || '').trim()) return false
    if (!companyName) return true
    const expected = String(companyName).toLowerCase()
    const actual = String(group.name).toLowerCase()
    return companyNameMatches(actual, expected) || companyNameMatches(expected, actual)
  })
  return hit ? { ticker: wanted, exchange: hit.exchange, companyName: hit.name, source: 'yahoo_symbol_directory' } : null
}

/** Test/ops hook — drop the directory cache. */
export function invalidateSymbolCache(): void { symCache.clear() }
