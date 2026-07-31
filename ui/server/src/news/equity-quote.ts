// The EQUITY QUOTE lane — the live market price behind /api/quote, and the one place that re-bases a
// frozen call's expected return onto today's price.
//
// Why it exists: the cockpit's decision banner shows a call that was priced on its decision date
// (decision_record.json: entry_price, as of entry_price_timestamp). Days or months later the market has
// moved, so the headline "expected return" — which is measured FROM that entry price — no longer says
// what you would earn buying now. This lane supplies the missing half: where the price is today, how
// far that is from the entry price, and what the same target implies from there.
//
// It reuses the shared CNBC transport (news/cnbc-quote.ts) that the commodity pulse already uses — one
// keyless batch call, no API key, no vendor account (CLAUDE.md §2: reuse before adding).
//
// ---------------------------------------------------------------------------------------------------
// THE GATES, and why each one exists. Every hazard below was observed on the live feed, not imagined.
// A free quote service will cheerfully answer with SOMETHING for almost any string, and several of its
// wrong answers look completely healthy. A price shown next to a real thesis must be the right company,
// in the right currency, in the right units, from this week — so each of those is checked separately
// and any failure yields ABSENCE, never a caveated number (CLAUDE.md §3).
//
//  1. CURRENCY. Ticker letters repeat across the world's exchanges, so "the symbol resolved" proves
//     nothing. A quote must come back in the currency the call was priced in.
//        Observed: the bare form of an Indian ticker resolves to a US bank at USD 0.0001 — which,
//        against a rupee entry price, would have rendered a fabricated ~100% loss on a live call.
//
//  2. NAME. Currency alone is not enough, because a wrong company can share a currency AND a country.
//        Observed: one Swiss bank's suffixed symbol answers code:0, CHF, "Swiss Exchange" — under a
//        completely different insurer's name. Currency, country and exchange all pass; only the name
//        catches it.
//
//  3. AGE. A stale price is the most dangerous kind of wrong, because nothing about it looks wrong.
//        Observed: a long-delisted ticker still answers with REG_MKT status, realTime:"true" and a
//        plausible daily change — carrying a price from several years ago. Only the timestamp admits
//        it, so a row with no parseable timestamp is refused too (§5: a figure carries its date).
//
//  4. PLAUSIBILITY. The last line of defence, and the only one that catches undeclared units.
//        Observed: London self-declares pence ("GBp"), which is normalised below — but Tel Aviv
//        returns "ILS" while quoting agorot, a 100x error with NOTHING on the row to signal it. A
//        price wildly out of scale with the entry price is refused rather than displayed.
//
// Three CNBC fields are deliberately NOT surfaced, because they were measured to be unreliable:
// `previous_day_closing` (clobbered to equal `last` on roughly half of the exchanges checked, so a
// day-move computed from it reads a false 0.00%), the day-change derived from it, and `curmktstatus`
// (returns REG_MKT for exchanges that are plainly closed, and for delisted tickers — it is not an
// open/closed signal). The banner needs the move since the ENTRY price, which none of them provide.
// ---------------------------------------------------------------------------------------------------
//
// Zero-touch (CLAUDE.md §26): no ticker, company name or exchange of any specific company appears in
// this file. The tables below are generic market metadata. A company the engine has never analysed
// works with no code edit — its symbol is DERIVED from the listing details its decision record already
// carries. The optional override file is the escape hatch for listings derivation cannot reach.

import fs from 'node:fs'
import path from 'node:path'
import { NEWS, STATE_DIR, REPO_ROOT } from '../config'
import { fetchCnbcRows, type CnbcRow } from './cnbc-quote'

// ---- public shapes (the /api/quote contract) ----

/** What the caller knows about a listing, straight off decision_record.json. */
export interface QuoteSubject {
  ticker: string
  /** ISO 4217 the call was priced in. REQUIRED — it is the first gate. */
  currency?: string | null
  /** The record's `exchange` (e.g. "NasdaqGS", "NSE"). Sharpens symbol derivation; optional. */
  exchange?: string | null
  /** The record's `company_name`. Feeds the name gate; when absent that gate cannot run. */
  companyName?: string | null
  /** The record's `entry_price`. Feeds the plausibility gate; when absent that gate cannot run. */
  entryPrice?: number | null
}

/** Why no price is being shown. Surfaced so absence can be explained rather than left as a silent gap. */
export type AbsentReason =
  | 'no_currency'        // the record does not say what currency it was priced in — nothing to verify against
  | 'unknown_symbol'     // the quote service does not price this listing at all
  | 'currency_mismatch'  // it answered, but in another currency — a different security
  | 'name_mismatch'      // right currency, wrong company
  | 'stale_feed'         // the newest price on offer is too old to call current
  | 'implausible_price'  // out of scale with the entry price — wrong units or wrong listing
  | 'feed_unavailable'   // the quote service could not be reached

export interface LiveQuote {
  ticker: string
  /** The quote-service symbol that matched — surfaced so the identity is verifiable by the reader. */
  symbol: string
  name: string | null
  exchange: string | null
  currency: string
  price: number
  as_of: string | null
  /**
   * The timestamp is a settled session (a bare date), i.e. the last close rather than a live tick.
   * The UI must say "last close" then; calling a close a live price would be a §5 defect.
   */
  as_of_is_close: boolean
  /** The feed is exchange-delayed — surfaced, never hidden, so nothing claims to be real-time. */
  delayed: boolean
  source: 'cnbc'
  /** Served from cache past its TTL because the refresh failed: a real price, but not a fresh one. */
  stale: boolean
}

/** Either a usable quote or the reason there isn't one. Never both, never neither. */
export interface QuoteOutcome {
  quote: LiveQuote | null
  reason: AbsentReason | null
}

/**
 * The call re-based onto the live price. Every field derives from two inputs only: the frozen decision
 * record and the live price. Nothing here re-values the company.
 */
export interface CallVsLive {
  entry_price: number
  entry_price_timestamp: string | null
  live_price: number
  currency: string
  /** How far the market has moved since the call was priced: (live / entry − 1) × 100. */
  move_since_call_pct: number
  /**
   * The price target the engine's own call implies: entry × (1 + expected_return/100).
   *
   * This identity is used rather than the probability-weighted sum of `scenarios[].price_target`
   * for two reasons. It is ALWAYS available when the banner has both numbers, whereas several shipped
   * records carry no scenarios at all; and it reconciles with the expected-return figure the banner is
   * displaying beside it, so the two cells can never disagree on screen. Where scenarios DO exist the
   * two agree to rounding — verified across the live ledger (199.97 vs 200.05, 77.82 vs 77.83,
   * 26.69 vs 26.69) — exactly as CLAUDE.md §10 requires.
   */
  implied_target: number
  /** The engine's frozen call, measured from the entry price. Returned UNCHANGED. */
  expected_return_pct: number
  /**
   * The same target measured from today's price: (target / live − 1) × 100.
   *
   * ASSUMPTION, and it must be surfaced wherever this is shown: the target is held FIXED. This is
   * arithmetic on an existing target, not a re-valuation — the engine has not re-examined the company
   * since the decision date. It answers "what does the engine's last target imply from today's price",
   * which is a weaker and different question from "what is this worth today" (CLAUDE.md §3).
   */
  live_expected_return_pct: number
  /** live − frozen, in percentage points. Negative = the move since the call ate into the upside. */
  expected_return_delta_pp: number
  /**
   * HAS THE PRICE LEFT THE SCENARIO BAND? — null when the record carries no usable scenario prices.
   *
   * The engine already had a date-based alarm (eval check AS: "this forecast came due"). It had no
   * PRICE-based one, and that is the faster signal: a date waits, a price does not. On AMZN 2026-07-10
   * the band was 146–247 and the stock closed at 270.87 three weeks later — above the top of the entire
   * distribution. The engine held the live price AND the band and never compared them; the miss surfaced
   * only because a human saw the move.
   *
   * Read it honestly: leaving the band does NOT prove the thesis wrong. It proves the SCENARIO SET no
   * longer contains the present — every case the run modelled is now on one side of the market. That is
   * a prompt to re-examine (§7 / §19), never a verdict, and this field must never be rendered as one.
   */
  band: PriceBand | null
}

// ---- symbol derivation ----

// CNBC addresses a non-US listing as `<TICKER>-<ISO2 country>` and a US listing as the bare ticker
// (verified live across US, Indian, Norwegian and other venues). So derivation reduces to: find the
// country, append it. Exchange first (unambiguous), currency second (not — the euro spans a dozen
// venues). A wrong guess is SAFE by construction: it either fails to resolve or fails a gate.

/** Exchange-name fragment → ISO 3166-1 alpha-2, matched as a lowercase substring. Longest match wins,
 *  so a full venue name always beats a short fragment that happens to also appear. */
const EXCHANGE_COUNTRY: [string, string][] = [
  ['nasdaq', 'US'], ['nyse', 'US'], ['new york stock exchange', 'US'], ['cboe', 'US'], ['otc', 'US'], ['amex', 'US'], ['bats', 'US'],
  ['national stock exchange of india', 'IN'], ['bombay stock exchange', 'IN'], ['nse', 'IN'], ['bse', 'IN'], ['india', 'IN'],
  ['oslo', 'NO'], ['london', 'GB'], ['lse', 'GB'], ['aim', 'GB'],
  ['tokyo', 'JP'], ['hong kong', 'HK'], ['hkex', 'HK'], ['sehk', 'HK'],
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

/** ISO 4217 → ISO2, for when the exchange string is absent or unrecognised. The euro is deliberately
 *  ABSENT: EUR identifies no country, so a euro listing must supply its exchange. */
const CURRENCY_COUNTRY: Record<string, string> = {
  USD: 'US', INR: 'IN', NOK: 'NO', GBP: 'GB', JPY: 'JP', HKD: 'HK',
  CHF: 'CH', SEK: 'SE', DKK: 'DK', ISK: 'IS', CAD: 'CA', AUD: 'AU', NZD: 'NZ',
  SAR: 'SA', AED: 'AE', QAR: 'QA', KWD: 'KW', OMR: 'OM', BHD: 'BH', ILS: 'IL',
  ZAR: 'ZA', NGN: 'NG', EGP: 'EG', KRW: 'KR', TWD: 'TW', SGD: 'SG', CNY: 'CN', CNH: 'CN',
  MYR: 'MY', IDR: 'ID', THB: 'TH', PHP: 'PH', VND: 'VN',
  BRL: 'BR', MXN: 'MX', CLP: 'CL', ARS: 'AR', PEN: 'PE', COP: 'CO',
  PLN: 'PL', TRY: 'TR', CZK: 'CZ', HUF: 'HU',
}

/** Longest-substring match of the record's exchange against EXCHANGE_COUNTRY. Null when unrecognised. */
export function countryFromExchange(exchange: string | null | undefined): string | null {
  const e = String(exchange ?? '').trim().toLowerCase()
  if (!e) return null
  let best: { frag: string; cc: string } | null = null
  for (const [frag, cc] of EXCHANGE_COUNTRY) {
    if (e.includes(frag) && (!best || frag.length > best.frag.length)) best = { frag, cc }
  }
  return best ? best.cc : null
}

/**
 * The ordered CNBC symbol candidates for a listing, most specific first. A US listing is the bare
 * ticker; everything else is `<TICKER>-<CC>`. The bare ticker is appended LAST for non-US listings as a
 * final fallback — safe only because the gates below reject a same-spelling foreign listing.
 */
export function symbolCandidates(subject: QuoteSubject): string[] {
  const t = String(subject.ticker ?? '').trim().toUpperCase()
  if (!t || !/^[A-Z0-9][A-Z0-9.\-]*$/.test(t)) return []
  const out: string[] = []
  const push = (s: string) => { if (s && !out.includes(s)) out.push(s) }

  const ccExchange = countryFromExchange(subject.exchange)
  const ccCurrency = CURRENCY_COUNTRY[normCurrency(subject.currency)] ?? null

  for (const cc of [ccExchange, ccCurrency]) {
    if (!cc) continue
    if (cc === 'US') push(t) // CNBC addresses US listings bare
    else push(`${t}-${cc}`)
  }
  push(t) // last resort; the gates are what make this safe
  return out
}

// ---- currency + minor-unit normalisation ----

// London quotes in PENCE and says so, returning "GBp" where the major unit is "GBP". Because it
// SELF-DECLARES, it can be normalised safely: divide by 100 and compare as GBP. Venues that quote a
// minor unit WITHOUT declaring it (agorot under a plain "ILS") cannot be detected this way and are
// deliberately not special-cased — the plausibility gate is what stops those.
const MINOR_UNIT_DIVISOR: Record<string, { major: string; divisor: number }> = {
  GBP_MINOR: { major: 'GBP', divisor: 100 },
}

/** Upper-cased ISO code. Note this INTENTIONALLY loses the GBp/GBP case distinction, so callers that
 *  care about minor units must use `resolveUnits` instead of comparing normalised codes. */
export const normCurrency = (c: string | null | undefined): string => String(c ?? '').trim().toUpperCase()

/**
 * Map a row's declared currency to its major unit plus the divisor needed to get there. "GBp" (pence)
 * and "GBX" both mean GBP/100; everything else is already its own major unit.
 */
export function resolveUnits(rowCurrency: string): { currency: string; divisor: number } {
  const raw = String(rowCurrency ?? '').trim()
  if (raw === 'GBp' || raw.toUpperCase() === 'GBX') return { currency: MINOR_UNIT_DIVISOR.GBP_MINOR.major, divisor: MINOR_UNIT_DIVISOR.GBP_MINOR.divisor }
  return { currency: raw.toUpperCase(), divisor: 1 }
}

// ---- the name gate ----

// Legal-form suffixes carry no identity, so they are dropped before comparing. Deliberately EXCLUDES
// identity-bearing words like "group" or "holdings" (dropping those would collapse distinct companies).
const LEGAL_SUFFIXES = new Set([
  'inc', 'incorporated', 'corp', 'corporation', 'co', 'company', 'ltd', 'limited', 'plc', 'llc', 'llp', 'lp',
  'sa', 'se', 'nv', 'bv', 'ag', 'asa', 'as', 'ab', 'oyj', 'oy', 'aps', 'spa', 'sarl', 'gmbh', 'kgaa', 'kk',
  'pjsc', 'psc', 'jsc', 'pcl', 'bhd', 'berhad', 'tbk', 'adr', 'ads', 'the', 'and',
])

/** A company name → its identity-bearing lowercase tokens. Splits on ANY run of non-letter/digit, so a
 *  dotted name yields its parts and a short record name can still match a longer feed name.
 *
 *  Diacritics are folded (NFD + strip combining marks) BEFORE splitting, so a filing's "Société Générale"
 *  matches the feed's ASCII "Societe Generale" instead of shattering into unrelated fragments. Tokens are
 *  Unicode letters/digits (\p{L}\p{N}), not ASCII [a-z0-9], so a wholly non-Latin name still yields real
 *  tokens rather than an EMPTY set — an empty set would make namesMatch vacuously bypass the gate for any
 *  non-Latin company, the wrong-company hazard the gate exists to catch. */
export function nameTokens(name: string | null | undefined): Set<string> {
  const out = new Set<string>()
  const folded = String(name ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  for (const tok of folded.split(/[^\p{L}\p{N}]+/u)) {
    if (!tok || tok.length < 2) continue // single letters carry no identity
    if (LEGAL_SUFFIXES.has(tok)) continue
    out.add(tok)
  }
  return out
}

/**
 * Do these two company names plausibly denote the same company?
 *
 * Rule: after dropping legal forms, one token set being a SUBSET of the other is a match (so a record's
 * short name matches the feed's fuller one); otherwise at least TWO shared tokens are required.
 *
 * The two-token floor is what separates a genuine spelling difference from two different companies that
 * merely share a family name — one shared token between two multi-word names is not evidence of
 * identity. When either side has no identity-bearing tokens the gate CANNOT judge and returns true:
 * the other gates still apply, and refusing on "we don't know" would suppress legitimate quotes.
 */
export function namesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const A = nameTokens(a)
  const B = nameTokens(b)
  if (!A.size || !B.size) return true // cannot judge — do not refuse on ignorance
  const [small, big] = A.size <= B.size ? [A, B] : [B, A]
  let shared = 0
  let allShared = true
  for (const t of small) {
    if (big.has(t)) shared++
    else allShared = false
  }
  return allShared || shared >= 2
}

// ---- the combined gate ----

/**
 * How far the live price may sit from the entry price before it is treated as a units error or a wrong
 * listing rather than a market move. The band is deliberately WIDE — a genuine multi-year 5x is real
 * and must not be suppressed — while still catching the two failure classes actually observed: an
 * undeclared minor unit (100x) and a penny-stock false match (many orders of magnitude the other way).
 */
const PLAUSIBLE_MIN_RATIO = 0.05
const PLAUSIBLE_MAX_RATIO = 20

/**
 * Run every gate against one candidate row. Returns the usable price (already converted to the major
 * unit) or the reason this candidate is refused.
 */
export function gateRow(
  row: CnbcRow,
  subject: QuoteSubject,
  nowMs: number,
  maxAgeDays: number,
): { ok: true; price: number; currency: string } | { ok: false; reason: AbsentReason } {
  if (!Number.isFinite(row.last) || row.last <= 0) return { ok: false, reason: 'unknown_symbol' }
  if (!row.currency) return { ok: false, reason: 'currency_mismatch' }

  const units = resolveUnits(row.currency)
  const want = normCurrency(subject.currency)
  if (!want) return { ok: false, reason: 'no_currency' }
  if (units.currency !== want) return { ok: false, reason: 'currency_mismatch' }

  if (!namesMatch(subject.companyName, row.name)) return { ok: false, reason: 'name_mismatch' }

  // Age. A row with no parseable timestamp is refused: a price with no date cannot be called current.
  const t = row.asOf ? Date.parse(row.asOf) : NaN
  if (!Number.isFinite(t)) return { ok: false, reason: 'stale_feed' }
  if (nowMs - t > maxAgeDays * 86_400_000) return { ok: false, reason: 'stale_feed' }

  const price = row.last / units.divisor

  const entry = subject.entryPrice
  if (typeof entry === 'number' && Number.isFinite(entry) && entry > 0) {
    const ratio = price / entry
    if (ratio < PLAUSIBLE_MIN_RATIO || ratio > PLAUSIBLE_MAX_RATIO) return { ok: false, reason: 'implausible_price' }
  }
  return { ok: true, price, currency: units.currency }
}

// ---- optional override map (the escape hatch for listings derivation cannot reach) ----
//
// Some venues are simply absent from the feed. Where a symbol DOES exist but derivation misses it, it
// is declared in a repo config — never in code, so adding one needs no engine change (§26).
//
// Sanitized like loadPulseConfig: symbols only. Any value containing '://' is dropped — the host lives
// in cnbc-quote.ts and can never come from config, so a poisoned file cannot redirect a fetch.

const OVERRIDE_REL = 'frameworks/quote_symbols.json'

export function loadSymbolOverrides(file: string): Record<string, string> {
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'))
    const src = j && typeof j === 'object' && j.symbols && typeof j.symbols === 'object' ? j.symbols : null
    if (!src) return {}
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries<any>(src)) {
      const ticker = String(k ?? '').trim().toUpperCase()
      const sym = String(v ?? '').trim().toUpperCase()
      if (!ticker || !sym || sym.includes('://')) continue
      if (!/^[A-Z0-9][A-Z0-9.\-]*$/.test(sym)) continue
      out[ticker] = sym
    }
    return out
  } catch {
    return {} // absent or malformed — derivation alone, never a crash
  }
}

// ---- the math ----

const round2 = (n: number) => Math.round(n * 100) / 100
const round1 = (n: number) => Math.round(n * 10) / 10


/** The scenario band and where the live price sits against it. */
export interface PriceBand {
  low: number  // the lowest scenario price target
  high: number // the highest
  /** `inside` | `above` (live > high) | `below` (live < low) — pure geometry, no direction applied. */
  state: 'inside' | 'above' | 'below'
  /** How far past the nearest edge, in %, 0 when inside. Always positive. */
  outside_by_pct: number
  /** What it MEANS for this position — the geometry above is direction-blind; a higher price is good for
   *  a long and bad for a short, so the reading flips. Empty when inside the band. */
  note: string
}

/**
 * Where does the live price sit against the run's own scenario band?
 *
 * Direction-aware by `basket` (the documented position key — DECISION_LEDGER §3: "Short Candidate" →
 * "Short"), because the geometry is direction-blind but the MEANING is not: above the band is the market
 * running past a long's best case, and past a short's worst. Exported pure so the meaning is testable
 * without a quote, a clock or a network.
 */
export function priceBand(
  scenarios: unknown,
  livePrice: number | null | undefined,
  basket?: string | null,
): PriceBand | null {
  if (typeof livePrice !== 'number' || !Number.isFinite(livePrice) || livePrice <= 0) return null
  if (!Array.isArray(scenarios)) return null
  const targets = scenarios
    .map((s: any) => (s && typeof s.price_target === 'number' && Number.isFinite(s.price_target) ? s.price_target : null))
    .filter((v): v is number => v !== null && v > 0)
  // One target is a point, not a band — a band needs two sides or "outside" is meaningless.
  if (targets.length < 2) return null
  const low = Math.min(...targets)
  const high = Math.max(...targets)
  // Two-or-more IDENTICAL targets are still a point, not a band: with low === high there is no bull-vs-bear
  // span, so "above/below the band" and outside_by_pct are meaningless (it would read as "above its own best
  // case" off a single level). This is the degenerate §10 collapsed-scenario set — refuse it, don't warn on it.
  if (low === high) return null
  const isShort = /short/i.test(String(basket ?? ''))
  if (livePrice > high) {
    return {
      low, high, state: 'above',
      outside_by_pct: round1((livePrice / high - 1) * 100),
      note: isShort
        ? 'The price is above every case this call modelled — further against the short than its own worst case.'
        : 'The price is above every case this call modelled, including its best one. The call was too cautious, or the facts have changed.',
    }
  }
  if (livePrice < low) {
    return {
      low, high, state: 'below',
      outside_by_pct: round1((1 - livePrice / low) * 100),
      note: isShort
        ? 'The price is below every case this call modelled — the short has run past its own best case.'
        : 'The price is below every case this call modelled, including its worst one. Something the run did not model has happened.',
    }
  }
  return { low, high, state: 'inside', outside_by_pct: 0, note: '' }
}

/**
 * Re-base a frozen call onto the live price. Returns null unless BOTH anchors are real and positive —
 * a zero or missing entry price makes every ratio here meaningless (and would divide by zero), so
 * absence is the honest answer rather than an Infinity dressed up as a return.
 */
export function callVsLive(args: {
  entryPrice: number | null | undefined
  expectedReturnPct: number | null | undefined
  livePrice: number | null | undefined
  currency: string
  entryPriceTimestamp?: string | null
  scenarios?: unknown // decision_record.scenarios — for the band check; absent → band null
  basket?: string | null // the position, so the band's MEANING is direction-aware
}): CallVsLive | null {
  const { entryPrice: E, expectedReturnPct: R, livePrice: P } = args
  if (typeof E !== 'number' || !Number.isFinite(E) || E <= 0) return null
  if (typeof R !== 'number' || !Number.isFinite(R)) return null
  if (typeof P !== 'number' || !Number.isFinite(P) || P <= 0) return null

  const target = E * (1 + R / 100) // carried UNROUNDED into the ratio below; rounded only for display
  const liveReturn = (target / P - 1) * 100
  return {
    entry_price: E,
    entry_price_timestamp: args.entryPriceTimestamp ?? null,
    live_price: round2(P),
    currency: args.currency,
    move_since_call_pct: round1((P / E - 1) * 100),
    implied_target: round2(target),
    expected_return_pct: R,
    live_expected_return_pct: round1(liveReturn),
    expected_return_delta_pp: round1(liveReturn - R),
    band: priceBand(args.scenarios, P, args.basket),
  }
}

// ---- cache: in-memory (single-flight) + persisted under STATE_DIR ----
//
// Mirrors the commodity pulse's contract deliberately (that module's header notes the same mirroring in
// the other direction): prices refresh on their own TTL, concurrent callers share one fetch, and the
// last good snapshot survives a restart so the banner does not open blank. On a failed refresh the
// previous price is KEPT and flagged `stale` — a real price that is not fresh beats no price, as long
// as it says so.

interface CachedQuote { row: CnbcRow; at: number }
// inflight resolves to the batch's SUCCESS boolean (true = rows landed, false = the fetch failed), so
// every waiter — the creator AND anyone who joins the same in-flight promise — reads the same outcome.
// A per-call `batchFailed` set only inside the creator's closure would leave a joiner falsely believing
// the batch succeeded (see getQuotes).
interface QuoteCache { bySymbol: Map<string, CachedQuote>; inflight: Map<string, Promise<boolean>> }

const memCache = new Map<string, QuoteCache>()
const persistFile = (stateDir: string) => path.join(stateDir, 'equity-quotes.json')

function cacheFor(stateDir: string): QuoteCache {
  let c = memCache.get(stateDir)
  if (c) return c
  c = { bySymbol: new Map(), inflight: new Map() }
  try {
    const j = JSON.parse(fs.readFileSync(persistFile(stateDir), 'utf8'))
    for (const [sym, e] of Object.entries<any>(j || {})) {
      if (e && typeof e === 'object' && e.row && typeof e.row === 'object' && Number.isFinite(Number(e.at))) {
        c.bySymbol.set(sym, { row: e.row as CnbcRow, at: Number(e.at) })
      }
    }
  } catch { /* first run / unreadable — start empty */ }
  memCache.set(stateDir, c)
  return c
}

function persist(stateDir: string, cache: QuoteCache): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    const j: Record<string, unknown> = {}
    for (const [sym, e] of cache.bySymbol) j[sym] = { row: e.row, at: e.at }
    fs.writeFileSync(persistFile(stateDir), JSON.stringify(j, null, 2) + '\n')
  } catch { /* best-effort — the in-memory cache still serves */ }
}

/** Test seams: a stub fetch, a frozen clock, an isolated state dir / repo root, explicit TTL + max age. */
export interface QuoteDeps {
  fetchFn?: typeof fetch
  now?: () => Date
  stateDir?: string
  repoRoot?: string
  ttlMs?: number
  maxAgeDays?: number
}

/**
 * Fetch live quotes for a batch of listings. Returns a ticker → outcome map: either a quote that
 * cleared every gate, or the reason there isn't one. A ticker is never given a placeholder price.
 *
 * One batch call covers every candidate symbol of every subject, so quoting the whole calls ledger
 * costs the same single round trip as quoting one company.
 */
export async function getQuotes(subjects: QuoteSubject[], deps: QuoteDeps = {}): Promise<Map<string, QuoteOutcome>> {
  const out = new Map<string, QuoteOutcome>()
  try {
    if (!NEWS.quoteEnabled) return out
    const stateDir = deps.stateDir ?? STATE_DIR
    const repoRoot = deps.repoRoot ?? REPO_ROOT
    const now = deps.now ?? (() => new Date())
    const fetchFn = deps.fetchFn ?? fetch
    const ttlMs = deps.ttlMs ?? NEWS.quoteTtlMin * 60_000
    const maxAgeDays = deps.maxAgeDays ?? NEWS.quoteMaxAgeDays
    const nowMs = now().getTime()

    const overrides = loadSymbolOverrides(path.join(repoRoot, OVERRIDE_REL))
    const cache = cacheFor(stateDir)

    // Plan: every subject's candidate list, in order. A subject with no currency is unquotable — the
    // first gate has nothing to check against, so we refuse rather than show an unverified price.
    const plans: { subject: QuoteSubject; candidates: string[] }[] = []
    for (const s of subjects) {
      if (!normCurrency(s.currency)) { out.set(s.ticker, { quote: null, reason: 'no_currency' }); continue }
      const override = overrides[String(s.ticker ?? '').trim().toUpperCase()]
      const candidates = override ? [override] : symbolCandidates(s)
      if (candidates.length) plans.push({ subject: s, candidates })
      else out.set(s.ticker, { quote: null, reason: 'unknown_symbol' })
    }
    if (!plans.length) return out

    // Refresh every candidate symbol whose cache entry is missing or past its TTL, in ONE batch.
    const needed = [...new Set(plans.flatMap((p) => p.candidates))]
      .filter((sym) => {
        const e = cache.bySymbol.get(sym)
        return !e || nowMs - e.at > ttlMs
      })
      .sort()

    let batchFailed = false
    if (needed.length) {
      // single-flight: concurrent callers wanting the same symbol set share one fetch
      const key = needed.join('|')
      let flight = cache.inflight.get(key)
      if (!flight) {
        flight = (async () => {
          const rows = await fetchCnbcRows(fetchFn, needed, NEWS.quoteTimeoutMs)
          if (!rows) return false // the fetch failed — keep previous entries; they will read as stale
          for (const sym of needed) {
            const row = rows.get(sym)
            // A symbol absent from a GOOD batch is a real "this service does not price it" answer, so
            // it is cached as a negative result. Without this, an unresolvable ticker would re-fetch on
            // every single request forever.
            cache.bySymbol.set(sym, { row: row ?? ({ symbol: sym, last: NaN } as CnbcRow), at: nowMs })
          }
          persist(stateDir, cache)
          return true
        })()
          .catch(() => false)
          .finally(() => { cache.inflight.delete(key) })
        cache.inflight.set(key, flight)
      }
      // Every waiter reads the SHARED result and sets its OWN batchFailed. A joiner that inherited the
      // creator's closure `batchFailed` would stay false on a failed batch and wrongly report
      // `unknown_symbol` (the provider does not carry this listing) during a transient outage.
      if (!(await flight)) batchFailed = true
    }

    for (const { subject, candidates } of plans) {
      let reason: AbsentReason = batchFailed ? 'feed_unavailable' : 'unknown_symbol'
      let quote: LiveQuote | null = null
      for (const sym of candidates) {
        const entry = cache.bySymbol.get(sym)
        if (!entry) continue
        const g = gateRow(entry.row, subject, nowMs, maxAgeDays)
        if (!g.ok) {
          // Remember the most SPECIFIC refusal seen: "the feed priced something but it wasn't yours" is
          // a more useful answer than the generic "unknown symbol" a later candidate would leave.
          if (g.reason !== 'unknown_symbol') reason = g.reason
          continue
        }
        const row = entry.row
        quote = {
          ticker: subject.ticker,
          symbol: row.symbol,
          name: row.name,
          exchange: row.exchange,
          currency: g.currency,
          price: round2(g.price),
          as_of: row.asOf,
          as_of_is_close: row.dateOnly,
          delayed: row.realTime === false,
          source: 'cnbc',
          stale: nowMs - entry.at > ttlMs,
        }
        break // first candidate that clears every gate wins — candidates run most-specific first
      }
      out.set(subject.ticker, quote ? { quote, reason: null } : { quote: null, reason })
    }
    return out
  } catch {
    return out // never throws — the route treats an absent entry as "no live price available"
  }
}
