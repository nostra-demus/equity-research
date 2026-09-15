// A watch plan: what one name on the watchlist is waiting for — the prices, dates and events a careful
// investor would track after reading its research — each item carrying the exact words it came from.
//
// Two halves, deliberately kept apart:
//  - FIELDS the research already stores as data (the scenario prices, the kill criteria, the listing and
//    the decision) are read straight off decision_record.json. No model touches them.
//  - PROSE the research writes for a person ("Track at $190-200 for re-entry", "revisit toward the ₹1,699
//    base fair value") is read by a model, and every item it returns is checked HERE before it is kept:
//    the quote must be in the file word for word, every number and date must be in that quote, and a
//    "buy" price must come from a sentence that actually says buy (CLAUDE.md §3, §5, §18). Whatever fails
//    is left out and listed with the reason — never repaired, never guessed.
//
// Everything in this file is pure: no filesystem, no clock, no network. The reader (reader.ts) does the I/O.
import crypto from 'node:crypto'

export const WATCH_PLAN_SCHEMA = 'watch-plan/v1' as const

/** Research calls that say buy now (CLAUDE.md §18). Such a call gets one "research says buy now" message; after
 *  it only the call's warnings are watched (operator decision, 2026-09-15), so its text is never read for lines. */
export const BUY_NOW_DECISIONS: ReadonlySet<string> = new Set(['Strong Buy', 'Buy', 'Starter Position Only'])

/** What a price means, in the research's own terms. Only `buy` may ever produce "In buy zone". */
export type PriceRole = 'buy' | 'look_again' | 'fair' | 'bad_case'

/** Where an item came from. `quote` is the source's own words (prose items); `field` names a structured
 *  field (items read straight off the record). Exactly one of the two is set. */
export interface PlanSource {
  file: string
  quote: string | null
  field: string | null
}

export interface PlanPrice {
  kind: 'price'
  id: string
  role: PriceRole
  /** A single price has `low` only; a range ("$190-200") has both. */
  low: number
  high: number | null
  currency: string
  source: PlanSource
  /** Set when a check changed how the item is shown (e.g. a claimed buy price shown as look-again). */
  note: string | null
}

export interface PlanDate {
  kind: 'date'
  id: string
  label: string
  /** The day to watch — exact, or only estimated (`estimated`). Null when the source names no day at all. */
  date: string | null
  /** The source's own words for when, whenever it gives no exact day — kept beside an estimated day. */
  window: string | null
  /** The source only estimates this day ("~21-Oct-2026", "estimated November 3, 2026"): everything said about
   *  it says "expected" (CLAUDE.md §3). */
  estimated?: boolean
  what_to_check: string | null
  source: PlanSource
}

export interface PlanDealBreaker { kind: 'deal_breaker'; id: string; text: string; check_where: string | null; source: PlanSource }
export interface PlanWaitingFor { kind: 'waiting_for'; id: string; text: string; source: PlanSource }
export interface PlanNews { kind: 'news'; id: string; topic: string; source: PlanSource }
export type PlanItem = PlanPrice | PlanDate | PlanDealBreaker | PlanWaitingFor | PlanNews

export interface PlanSourceFile { file: string; sha256: string; chars: number }
export interface LeftOut { what: string; why: string }

export interface WatchPlan {
  schema_version: typeof WATCH_PLAN_SCHEMA
  listing_key: string
  ticker: string
  company_name: string | null
  currency: string | null
  exchange: string | null
  origin: 'research'
  run_root: string
  decision: string | null
  decision_date: string | null
  /** The price when the research was written — the call price every "bad case" is measured below. */
  entry_price: number | null
  entry_price_as_of: string | null
  sources: PlanSourceFile[]
  /** sha256 over the source files — the cache key. A new or edited report gets a new plan. */
  source_digest: string
  reader: { status: 'ok' | 'failed' | 'not_run'; model: string | null; cost_usd: number; at: string | null; detail: string }
  items: PlanItem[]
  left_out: LeftOut[]
  created_at: string
}

export const sha256 = (s: string): string => crypto.createHash('sha256').update(s).digest('hex')

/** Stable id from an item's own content, so the same research read twice yields the same ids. */
export function itemId(kind: string, parts: unknown[]): string {
  return `${kind}-${sha256(JSON.stringify(parts)).slice(0, 10)}`
}

export function sourceDigest(files: PlanSourceFile[]): string {
  return sha256(files.map((f) => `${f.file}:${f.sha256}`).sort().join('|')).slice(0, 24)
}

// ---------- matching a quote against its source ----------

/**
 * The comparison form of a text. Research files mix typographic and plain punctuation, markdown emphasis
 * and line wrapping, and a model copying a sentence may normalise any of those — none of which changes
 * what the sentence says. Letters, digits and word order are untouched.
 */
export function normalizeForMatch(s: string): string {
  return String(s ?? '')
    .normalize('NFKC')
    .replace(/[‘’‚‛′`]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/[*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/** Does `quote` appear in `source` word for word? An ellipsis may join two verbatim parts, in order. */
export function quoteFound(source: string, quote: string): boolean {
  const hay = normalizeForMatch(source)
  const parts = String(quote ?? '').split(/\s*(?:\.\.\.|…)\s*/).map(normalizeForMatch).filter(Boolean)
  // A fragment this short can match by accident anywhere in a 100,000-character report.
  if (!parts.length || parts.join(' ').length < 12) return false
  let from = 0
  for (const p of parts) {
    const at = hay.indexOf(p, from)
    if (at < 0) return false
    from = at + p.length
  }
  return true
}

/** Every number written in a text: "1,699" → 1699, "$190-200" → 190 and 200, "12.20" → 12.2. */
export function numbersIn(text: string): number[] {
  const out: number[] = []
  for (const m of String(text ?? '').matchAll(/(?<![\d.,])\d+(?:,\d+)*(?:\.\d+)?/g)) {
    const v = Number(m[0].replace(/,/g, ''))
    if (Number.isFinite(v)) out.push(v)
  }
  return out
}

export function hasNumber(text: string, n: number): boolean {
  return numbersIn(text).some((v) => Math.abs(v - n) <= 1e-9 * Math.max(1, Math.abs(n)))
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
}
const MON = '(jan|feb|mar|apr|may|jun|jul|aug|sept|sep|oct|nov|dec)[a-z]*\\.?'

function isoDay(y: number, m: number, d: number): string | null {
  if (!(y >= 1990 && y <= 2100) || !(m >= 1 && m <= 12) || !(d >= 1 && d <= 31)) return null
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null // 31 Feb and the like
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/**
 * Every exact day written in a text, as YYYY-MM-DD. Reads the forms the research actually uses:
 * 2026-09-04, the "2026-08-27/28" two-day shorthand, 21-Oct-2026, Oct-23-2026, "October 23, 2026", and a
 * day with no year ("July 31", "10 Aug") ONLY when the same sentence names exactly one year. A month on
 * its own ("~Jan-2027") is a window, not a day, and is deliberately not read as one.
 */
export function datesIn(text: string): string[] {
  const s = String(text ?? '').toLowerCase().replace(/[‐-―−]/g, '-')
  const out = new Set<string>()
  const add = (v: string | null) => { if (v) out.add(v) }
  for (const m of s.matchAll(/\b(\d{4})-(\d{2})-(\d{2})(?:\/(\d{2}))?\b/g)) {
    add(isoDay(+m[1], +m[2], +m[3]))
    if (m[4]) add(isoDay(+m[1], +m[2], +m[4]))
  }
  for (const m of s.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?[-\\s]${MON}[-\\s,]+(\\d{4})\\b`, 'g'))) {
    add(isoDay(+m[3], MONTHS[m[2]], +m[1]))
  }
  for (const m of s.matchAll(new RegExp(`\\b${MON}[-\\s](\\d{1,2})(?:st|nd|rd|th)?,?[-\\s]+(\\d{4})\\b`, 'g'))) {
    add(isoDay(+m[3], MONTHS[m[1]], +m[2]))
  }
  const years = [...new Set([...s.matchAll(/\b(20\d{2})\b/g)].map((m) => +m[1]))]
  if (years.length === 1) {
    const y = years[0]
    for (const m of s.matchAll(new RegExp(`\\b${MON}\\s(\\d{1,2})(?:st|nd|rd|th)?\\b(?![-\\s,]*\\d{4})`, 'g'))) {
      add(isoDay(y, MONTHS[m[1]], +m[2]))
    }
    for (const m of s.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s${MON}(?![a-z])(?![-\\s,]*\\d{4})`, 'g'))) {
      add(isoDay(y, MONTHS[m[2]], +m[1]))
    }
  }
  return [...out].sort()
}

// Currency markers, most specific first: "HK$" must be read before a bare "$" is.
const CURRENCY_MARKERS: [RegExp, string][] = [
  [/US\$|\bUSD\b/g, 'USD'], [/HK\$|\bHKD\b/g, 'HKD'], [/\bA\$|\bAUD\b/g, 'AUD'], [/\bC\$|\bCAD\b/g, 'CAD'],
  [/\bS\$|\bSGD\b/g, 'SGD'], [/\bNZ\$|\bNZD\b/g, 'NZD'], [/\bR\$|\bBRL\b/g, 'BRL'],
  [/₹|\bINR\b|\bRs\.?(?=\s?\d)/g, 'INR'], [/\bNOK\b/g, 'NOK'], [/\bAED\b/g, 'AED'], [/\bCNY\b|\bRMB\b|\bCNH\b/g, 'CNY'],
  [/€|\bEUR\b/g, 'EUR'], [/£|\bGBP\b|\bGBp\b|\bGBX\b/g, 'GBP'], [/\bJPY\b/g, 'JPY'], [/\bCHF\b/g, 'CHF'],
  [/\bSEK\b/g, 'SEK'], [/\bDKK\b/g, 'DKK'], [/\bSAR\b/g, 'SAR'], [/\bZAR\b/g, 'ZAR'], [/\bKRW\b/g, 'KRW'], [/\bTWD\b/g, 'TWD'],
]
const DOLLAR_CURRENCIES = new Set(['USD', 'HKD', 'AUD', 'CAD', 'SGD', 'NZD', 'TWD'])

/**
 * The currency a quote prices its numbers in, when that is NOT the listing's own — null when it agrees or
 * says nothing. A bare "$" reads as US dollars except on a listing that trades in another dollar, where a
 * report commonly writes its local dollar the same way.
 */
export function currencyConflict(quote: string, listingCurrency: string): string | null {
  let rest = String(quote ?? '')
  const found = new Set<string>()
  for (const [re, code] of CURRENCY_MARKERS) {
    if (re.test(rest)) found.add(code)
    re.lastIndex = 0
    rest = rest.replace(re, ' ')
  }
  const want = String(listingCurrency ?? '').toUpperCase()
  if (found.has(want)) return null
  if (found.size) return [...found][0]
  if (rest.includes('$') && !DOLLAR_CURRENCIES.has(want)) return 'USD'
  return null
}

// "entry" counts when it names a level ("entry zone", "entry price") or labels one ("Conviction entry: Below
// $185", "entry at $190") — the forms the research writes its entry levels in.
const BUY_PHRASE = /\b(?:re-?entry\b|re-?enter\b|buy(?:ing)?\b|accumulate\b|initiate\b|entry(?:\s+(?:point|price|level|zone|range|at|below|under|near|around)\b|\s*:)|add(?:ing)?\s+(?:at|below|under|on)\b)/gi
const NEGATION_BEFORE = /\b(not|no|never|don'?t|avoid|without)\s+(?:[\w'-]+\s+){0,2}$/i

/**
 * Does this sentence tell the reader to BUY? "Track at $190-200 for re-entry" and "Conviction entry: Below
 * $185" do; "revisit toward the base fair value" does not; "Do not buy at $153.94" is a negation, not a buy.
 * Only a sentence that passes this may make a price a buy price — everything else is at most a look-again
 * price (§18).
 */
export function saysBuy(quote: string): boolean {
  // Markdown emphasis is not part of what a sentence says ("**Conviction entry**: Below $185").
  const q = String(quote ?? '').replace(/[*_]/g, '')
  for (const m of q.matchAll(BUY_PHRASE)) {
    const at = m.index ?? 0
    if (NEGATION_BEFORE.test(q.slice(Math.max(0, at - 40), at))) continue
    const word = m[0].toLowerCase()
    const after = q.slice(at + m[0].length, at + m[0].length + 40)
    // "Buy" and "initiate" are also rating and process words ("a Strong Buy", "the buy case"); they count
    // only when they are tied to a price or a condition.
    if ((word === 'buy' || word === 'buying') && !/^\s+(at|below|under|near|around|if|when|on|toward|up to|zone|range)\b/i.test(after)) continue
    if (word === 'initiate' && !/^\s+(at|below|under|a (?:starter )?position (?:at|below|under))\b/i.test(after)) continue
    return true
  }
  return false
}

/** Is this price named only to say NOT to act at it? ("Do not buy at $153.94.") */
export function negatedAt(quote: string, value: number): boolean {
  const q = String(quote ?? '')
  for (const m of q.matchAll(/(?<![\d.,])\d+(?:,\d+)*(?:\.\d+)?/g)) {
    if (Math.abs(Number(m[0].replace(/,/g, '')) - value) > 1e-9 * Math.max(1, value)) continue
    const before = q.slice(Math.max(0, (m.index ?? 0) - 40), m.index ?? 0)
    if (/\b(not|no|never|don'?t)\s+(buy|initiate|enter|add|own)\b[^.;]*$/i.test(before)) return true
  }
  return false
}

/** Is this price named for the stock RISING past it? ("A confirmed pool price materially above ~$115 … moves
 *  the call from Watchlist toward Avoid.") Every price line here is a level a FALLING price reaches, so reading a
 *  rise as one would announce the opposite of what the research said. */
export function risingAt(quote: string, value: number): boolean {
  const q = String(quote ?? '')
  for (const m of q.matchAll(/(?<![\d.,])\d+(?:,\d+)*(?:\.\d+)?/g)) {
    if (Math.abs(Number(m[0].replace(/,/g, '')) - value) > 1e-9 * Math.max(1, value)) continue
    const before = q.slice(Math.max(0, (m.index ?? 0) - 30), m.index ?? 0)
    if (/\b(above|over|exceed(?:s|ing)?|higher than|more than|rises?|rallies|climbs?)\b[^.;\d]*$/i.test(before)) return true
  }
  return false
}

// ---------- the fields the research already stores as data ----------

const BEARISH_LABEL = /bear|tail|downside|deal.?break|stress|ruin|worst/i

/**
 * The research's bad case, chosen by PRICE, not by label: the highest bear-type scenario that sits BELOW
 * the price the call was made at. Labels are not a fixed vocabulary (bear, bear_cyclical, bear_structural,
 * tail_...), a "structural" bear can sit ABOVE today's price (SMPL: 13.09 against 11.33), and the lowest
 * one is often a ruin tail rather than a line worth a warning (ORCL: 31.44 beside 94.62). With no call
 * price to measure against, the highest bear-type scenario is used.
 */
export function badCase(scenarios: unknown, entryPrice: number | null): { label: string; price: number } | null {
  if (!Array.isArray(scenarios)) return null
  const bears = scenarios
    .map((s: any) => ({ label: String(s?.label ?? ''), price: Number(s?.price_target) }))
    .filter((s) => BEARISH_LABEL.test(s.label) && Number.isFinite(s.price) && s.price > 0)
  const below = entryPrice != null && entryPrice > 0 ? bears.filter((s) => s.price < entryPrice) : bears
  if (!below.length) return null
  return below.reduce((a, b) => (b.price > a.price ? b : a))
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

/** Items read straight off decision_record.json: the bad case and every kill criterion. */
export function recordItems(record: any, currency: string | null): PlanItem[] {
  const items: PlanItem[] = []
  const entry = Number(record?.entry_price)
  const bc = badCase(record?.scenarios, Number.isFinite(entry) && entry > 0 ? entry : null)
  if (bc && currency) {
    items.push({
      kind: 'price', id: itemId('price', ['bad_case', bc.price, null]), role: 'bad_case', low: bc.price, high: null, currency,
      source: { file: 'decision_record.json', quote: null, field: `scenario "${bc.label}"` }, note: null,
    })
  }
  const kills = Array.isArray(record?.kill_criteria) ? record.kill_criteria : []
  kills.forEach((k: any, i: number) => {
    const text = typeof k === 'string' ? k : String(k?.criterion ?? k?.condition ?? k?.text ?? '')
    if (!text.trim()) return
    const where = typeof k === 'object' && k ? (k.monitor ?? k.monitor_via ?? null) : null
    items.push({
      kind: 'deal_breaker', id: itemId('deal', [text]), text: clip(text.trim(), 600),
      check_where: typeof where === 'string' && where.trim() ? clip(where.trim(), 300) : null,
      source: { file: 'decision_record.json', quote: null, field: `kill_criteria[${i}]` },
    })
  })
  return items
}

// ---------- checking what the model read ----------

export interface ReaderOutput { prices?: unknown; dates?: unknown; waiting_for?: unknown; news?: unknown }

/** The JSON object in a model's answer — fenced or bare. Null when there is none to parse. */
export function parseReaderJson(text: string): ReaderOutput | null {
  const s = String(text ?? '')
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const j = JSON.parse(s.slice(start, end + 1))
    return j && typeof j === 'object' && !Array.isArray(j) ? (j as ReaderOutput) : null
  } catch {
    return null
  }
}

export interface ValidateContext {
  /** The exact text each file was sent as, keyed by its name relative to the run folder. */
  sources: Map<string, string>
  currency: string | null
  entryPrice: number | null
}

const arr = (v: unknown): any[] => (Array.isArray(v) ? v : [])
const str = (v: unknown, n: number): string | null => (typeof v === 'string' && v.trim() ? clip(v.trim().replace(/\s+/g, ' '), n) : null)
const num = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(/,/g, '')) : NaN)
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

function normFile(f: unknown): string {
  return String(f ?? '').trim().replace(/^`|`$/g, '').replace(/^\.\//, '').replace(/^analyses\/[^/]+\//, '')
}

/**
 * Keep only what the research actually says. Each rule below is a way a plausible-looking item can be
 * wrong; each failure is listed in `left_out` with its reason so the screen can show what was not kept.
 */
export function validateReaderOutput(out: ReaderOutput, ctx: ValidateContext): { items: PlanItem[]; left_out: LeftOut[] } {
  const items: PlanItem[] = []
  const left: LeftOut[] = []
  const seen = new Set<string>()

  const sourceFor = (what: string, file: unknown, quote: unknown): PlanSource | null => {
    if (typeof quote !== 'string' || !quote.trim()) { left.push({ what, why: 'no quote from the research came with it' }); return null }
    const name = normFile(file)
    const text = ctx.sources.get(name)
    if (text == null) { left.push({ what, why: `it names a file that was not read (${name || 'none'})` }); return null }
    if (!quoteFound(text, quote)) { left.push({ what, why: 'its quote is not in the research word for word' }); return null }
    return { file: name, quote: quote.trim().replace(/\s+/g, ' '), field: null }
  }

  for (const p of arr(out.prices).slice(0, 8)) {
    const role = String(p?.role ?? '')
    const low = num(p?.low)
    const high = p?.high == null || p?.high === '' ? null : num(p?.high)
    const what = `${roleWords(role)} ${Number.isFinite(low) ? low : '?'}${high != null ? `–${high}` : ''}`
    if (!['buy', 'look_again', 'fair'].includes(role)) { left.push({ what, why: 'not a buy, review or fair price' }); continue }
    if (!(low > 0) || (high != null && !(high > 0))) { left.push({ what, why: 'not a usable price' }); continue }
    let lo = low
    let hi = high
    if (hi != null && hi < lo) [lo, hi] = [hi, lo]
    if (hi === lo) hi = null
    const source = sourceFor(what, p?.file, p?.quote)
    if (!source) continue
    const quote = source.quote as string
    if (!hasNumber(quote, lo) || (hi != null && !hasNumber(quote, hi))) { left.push({ what, why: 'the number is not written in its quote' }); continue }
    if (!ctx.currency) { left.push({ what, why: 'the research does not say which currency the stock trades in' }); continue }
    const clash = currencyConflict(quote, ctx.currency)
    if (clash) { left.push({ what, why: `its quote prices it in ${clash}, but this listing trades in ${ctx.currency}` }); continue }
    if (negatedAt(quote, lo) || (hi != null && negatedAt(quote, hi))) { left.push({ what, why: 'the research names this price only to say not to buy at it' }); continue }
    if (risingAt(quote, lo) || (hi != null && risingAt(quote, hi))) { left.push({ what, why: 'the research ties this price to the stock rising past it, and every line here is reached by a fall' }); continue }
    const line = hi ?? lo
    if (ctx.entryPrice && role !== 'fair' && Math.abs(line - ctx.entryPrice) / ctx.entryPrice < 0.005) {
      left.push({ what, why: 'this is the price when the research was written, not a level to act at' })
      continue
    }
    if (ctx.entryPrice && (line / ctx.entryPrice < 0.2 || line / ctx.entryPrice > 5)) {
      left.push({ what, why: 'far out of scale with the price when the research was written — likely the wrong units' })
      continue
    }
    // A fair value the stock was already under when the research was written is no line to wait for: the
    // research saw it and still said wait (UBER: $74.77 fair value against a $68.18 price, waiting on events).
    if (role === 'fair' && ctx.entryPrice && ctx.entryPrice <= line) {
      left.push({ what, why: 'the price was already under it when the research was written, and the research still said to wait' })
      continue
    }
    let finalRole = role as PriceRole
    let note: string | null = null
    if (finalRole === 'buy' && !saysBuy(quote)) {
      finalRole = 'look_again'
      note = 'Read as a buy price, but the sentence does not say buy — so it is shown as a review price.'
    }
    const key = `price|${finalRole}|${lo}|${hi}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({ kind: 'price', id: itemId('price', [finalRole, lo, hi]), role: finalRole, low: lo, high: hi, currency: ctx.currency, source, note })
  }
  // A fair value is its own line only when the research names no price to act at (the prompt asks for that;
  // this makes it so). Beside a buy price it would read as the nearer target and pull the eye away from it.
  if (items.some((i) => i.kind === 'price' && (i.role === 'buy' || i.role === 'look_again'))) {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]
      if (it.kind !== 'price' || it.role !== 'fair') continue
      left.push({ what: `${roleWords('fair')} ${it.low}${it.high != null ? `–${it.high}` : ''}`, why: 'the research also names a price to act at, so its fair value is not a separate line' })
      items.splice(i, 1)
    }
  }
  // One line, one price: research often states a level twice (AMZN: "Target entry zone: $185–$200" in the
  // thesis and "Track at $190-200 for re-entry" in the record — both reached at $200). The strongest role keeps
  // the line; a repeat is listed as left out rather than sent twice.
  const ROLE_RANK: Record<PriceRole, number> = { buy: 0, look_again: 1, fair: 2, bad_case: 3 }
  const lines: PlanPrice[] = []
  const priceText = (x: PlanPrice) => `${x.low}${x.high != null ? `–${x.high}` : ''}`
  for (const p of items.filter((i): i is PlanPrice => i.kind === 'price').sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role])) {
    const twin = lines.find((k) => Math.abs(priceLine(k) - priceLine(p)) <= 0.005 * priceLine(k))
    if (!twin) { lines.push(p); continue }
    left.push({ what: `${roleWords(p.role)} ${priceText(p)}`, why: `the same line as the ${ROLE_LABEL[twin.role].toLowerCase()} ${priceText(twin)} already kept` })
    items.splice(items.indexOf(p), 1)
  }

  // A window's words are shown as the research's timing, so every number and month in them must be written
  // in its quote: "~2026–2027" beside a quote that names no year is invented; "expected 2027" is not.
  const MONTH_WORD = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/g
  const timingInQuote = (words: string, quote: string): boolean =>
    numbersIn(words).every((n) => hasNumber(quote, n))
    && [...words.toLowerCase().matchAll(MONTH_WORD)].every((m) => new RegExp(`\\b${m[1].slice(0, 3)}`).test(quote.toLowerCase()))

  for (const d of arr(out.dates).slice(0, 16)) {
    const label = str(d?.label, 120)
    const what = `date: ${label ?? '(no label)'}`
    if (!label) { left.push({ what, why: 'no label' }); continue }
    const source = sourceFor(what, d?.file, d?.quote)
    if (!source) continue
    let date: string | null = typeof d?.date === 'string' && ISO_DAY.test(d.date.trim()) ? d.date.trim() : null
    let window = str(d?.window, 80)
    if (date && !datesIn(source.quote as string).includes(date)) {
      left.push({ what: `${what} (${date})`, why: 'that exact day is not written in its quote, so it is kept without a day' })
      date = null
    }
    if (window && !timingInQuote(window, source.quote as string)) {
      left.push({ what: `${what} (${window})`, why: 'its timing is not written in its quote, so no time is shown' })
      window = null
    }
    // A day its quote calls an estimate ("estimated November 3, 2026", "CIQ-modeled at ~21-Oct-2026") keeps that
    // qualifier: shown as expected, never as a fixed date (CLAUDE.md §3). Read only when the quote names one day.
    const estimateWord = /~|\best(?:\.|imated?\b)|\bexpected\b|\bapprox(?:imately|\.)?|\bmodell?ed\b|\binferred\b|\bunconfirmed\b|\bnot (?:yet )?confirmed\b|\btentative\b/i
    const quoteEstimates = estimateWord.test(source.quote as string) && datesIn(source.quote as string).length === 1
    let estimated = !!date && quoteEstimates
    // A window may still name the day to watch ("~21-Oct-2026", "(est. 10 Aug)", "due 2026-08-27/28", "Through
    // 2027-03-26"): take it when the window's own words name one day its quote writes — or two or three
    // neighbouring days, the first being when to start looking — and keep those words for the screen. It is an
    // estimate only when the words say so, or leave the day open between neighbours.
    let fromWindow = false
    if (!date && window) {
      const days = datesIn(source.quote as string).filter((day) => datesIn(`${window} ${day.slice(0, 4)}`).includes(day))
      if (days.length && Date.parse(days[days.length - 1]) - Date.parse(days[0]) <= 3 * 86_400_000) {
        date = days[0]
        fromWindow = true
        estimated = days.length > 1 || estimateWord.test(window) || quoteEstimates
      }
    }
    if (!date && !window) window = 'no exact day given'
    const key = `date|${label.toLowerCase()}|${date}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({
      kind: 'date', id: itemId('date', [date, label.toLowerCase()]), label, date, window: date && !fromWindow && !estimated ? null : window, estimated,
      what_to_check: str(d?.what_to_check, 300), source,
    })
  }

  for (const w of arr(out.waiting_for).slice(0, 8)) {
    const text = str(w?.text, 300)
    const what = `waiting for: ${text ?? '(empty)'}`
    if (!text) { left.push({ what, why: 'empty' }); continue }
    const source = sourceFor(what, w?.file, w?.quote)
    if (!source) continue
    const key = `wait|${text.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({ kind: 'waiting_for', id: itemId('wait', [text.toLowerCase()]), text, source })
  }

  for (const n of arr(out.news).slice(0, 8)) {
    const topic = str(n?.topic, 160)
    const what = `news: ${topic ?? '(empty)'}`
    if (!topic) { left.push({ what, why: 'empty' }); continue }
    const source = sourceFor(what, n?.file, n?.quote)
    if (!source) continue
    const key = `news|${topic.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({ kind: 'news', id: itemId('news', [topic.toLowerCase()]), topic, source })
  }

  return { items, left_out: left }
}

/** The price a line is checked at: the TOP of a buy or look-again range (entering the range is reaching it),
 *  the price itself for a fair price or a bad case. */
export function priceLine(p: PlanPrice): number {
  return p.role === 'buy' || p.role === 'look_again' ? (p.high ?? p.low) : p.low
}

export const ROLE_LABEL: Record<PriceRole, string> = {
  buy: 'Buy price',
  look_again: 'Review price',
  fair: 'Fair price',
  bad_case: 'Bad case',
}

/** A price's role in words, for what was left out ("review price 16.79") — never the internal key. The reader's
 *  role is unchecked model output, so an unknown one is shown as written. */
export function roleWords(role: string): string {
  return Object.prototype.hasOwnProperty.call(ROLE_LABEL, role) ? ROLE_LABEL[role as PriceRole].toLowerCase() : role.replace(/_/g, ' ') || 'price'
}
