// Trades logged by hand, for the gap between the last Flex export and now.
//
// WHY THESE ARE A SEPARATE LAYER AND NOT PART OF THE BOOK. The book's whole claim is that every number
// in it ties to the broker — eight reconciliation checks say so on every screen. A hand-typed fill has
// no broker record behind it, so folding it into the book would either break those checks (computed
// positions no longer match the statement's) or, worse, force them to be relaxed. Either way the trust
// anchor is gone, and it is the only thing that makes the rest worth reading.
//
// So a manual entry is PROVISIONAL: it is stored, shown, and used to say what the book will look like
// once the fill lands — and it never touches the reconciled figures.
//
// SUPERSEDING IS BY DATE COVERAGE, NOT BY MATCHING. When a statement covers a day, the broker's record
// of that day is complete: whatever really happened is in it. So an entry whose date falls inside any
// stored statement's range has been answered, whether or not a row in that statement "looks like" it.
// Matching on symbol and quantity instead would be a guess that can both miss a real fill (a partial
// execution arrives as three rows) and drop an entry that never happened at all — and it would hide the
// case the operator most needs to see, where they logged something the broker never executed.
//
// Superseded entries are KEPT, marked, and listed. Deleting what someone typed, silently, on the
// arrival of an unrelated file, is not something a tool holding real money should do: the operator
// clears them once they have compared.

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { isValidCalendarISODate } from './outputs'

export interface ManualTrade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  /** Always positive — `side` carries the direction, so a sign here could disagree with it. */
  quantity: number
  price: number
  currency: string
  tradeDate: string
  /** Entered as a cost: a positive number that reduces the result either way. */
  commission: number
  note: string | null
  loggedAt: string
}

export interface SupersededBy {
  statementId: string
  filename: string
  from: string | null
  to: string | null
}

export interface ProvisionalTrade extends ManualTrade {
  /** Set once a statement covers this date — the entry has been answered by the broker's own record. */
  supersededBy: SupersededBy | null
  /** Signed by side, so callers never re-derive the direction. */
  signedQuantity: number
  /** In the entry's OWN currency, never converted: there is no rate for a fill the book has not seen. */
  cashEffect: number
}

/** What the live entries would do to one symbol, stated against what the book actually holds. */
export interface ProvisionalEffect {
  symbol: string
  currency: string
  /** The reconciled book's quantity, or null when the book does not hold this symbol at all. */
  bookQuantity: number | null
  delta: number
  /** bookQuantity + delta, or just the delta when the book has never held it. */
  provisionalQuantity: number
  cashEffect: number
  trades: number
  /** True when the entries would take the position through zero or past it — worth showing, because a
   *  hand-entered sell larger than the holding is usually a typo rather than a short. */
  crossesZero: boolean
}

export interface ManualRead {
  trades: ProvisionalTrade[]
  live: number
  superseded: number
  effects: ProvisionalEffect[]
}

/** Bounded so the file stays small and a runaway client cannot fill the disk. Far above any real
 *  between-export backlog: a fund logging 200 unreconciled fills has stopped exporting, not started
 *  trading. */
export const MANUAL_MAX_ENTRIES = 200
const NOTE_MAX = 200
const SYMBOL_RE = /^[A-Za-z0-9][A-Za-z0-9.\-/ ]{0,23}$/
const CURRENCY_RE = /^[A-Za-z]{3}$/

export interface ManualInput {
  symbol: unknown
  side: unknown
  quantity: unknown
  price: unknown
  currency: unknown
  tradeDate: unknown
  commission?: unknown
  note?: unknown
}

/** Validate one entry. Returns the stored shape, or throws with a message meant for the operator.
 *  `today` is passed in rather than read from the clock so the rule is testable. */
export function normalizeManual(input: ManualInput, today: string): ManualTrade {
  const symbol = String(input.symbol ?? '').trim().toUpperCase()
  if (!SYMBOL_RE.test(symbol)) throw new Error('symbol must be 1–24 characters of letters, digits, dot, dash or slash')

  const side = String(input.side ?? '').trim().toLowerCase()
  if (side !== 'buy' && side !== 'sell') throw new Error('side must be buy or sell')

  const quantity = Number(input.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('quantity must be a positive number')

  const price = Number(input.price)
  if (!Number.isFinite(price) || price <= 0) throw new Error('price must be a positive number')

  const currency = String(input.currency ?? '').trim().toUpperCase()
  if (!CURRENCY_RE.test(currency)) throw new Error('currency must be a three-letter code')

  const tradeDate = String(input.tradeDate ?? '').trim()
  if (!isValidCalendarISODate(tradeDate)) throw new Error('trade date must be a real calendar date (YYYY-MM-DD)')
  // A fill cannot have happened tomorrow. Without this, a mistyped year sits in the book forever: it can
  // never be superseded, because no statement will ever cover a date that has not arrived.
  if (tradeDate > today) throw new Error('trade date is in the future')

  const commissionRaw = input.commission === undefined || input.commission === null || input.commission === '' ? 0 : Number(input.commission)
  if (!Number.isFinite(commissionRaw) || commissionRaw < 0) throw new Error('commission must be zero or a positive cost')

  const noteRaw = input.note === undefined || input.note === null ? '' : String(input.note).trim()
  if (noteRaw.length > NOTE_MAX) throw new Error(`note must be ${NOTE_MAX} characters or fewer`)

  return {
    id: crypto.randomBytes(8).toString('hex'),
    symbol,
    side,
    quantity,
    price,
    currency,
    tradeDate,
    commission: commissionRaw,
    note: noteRaw || null,
    loggedAt: new Date().toISOString(),
  }
}

// ---------- storage ----------

function filePath(dir: string): string { return path.join(dir, 'manual.json') }

/** Every stored entry, oldest first. A file that has become unreadable reads as empty rather than
 *  taking down the portfolio read around it — the statements are the book, these are an overlay. */
export function readManual(dir: string): ManualTrade[] {
  let raw: unknown
  try { raw = JSON.parse(fs.readFileSync(filePath(dir), 'utf8')) } catch { return [] }
  if (!Array.isArray(raw)) return []
  const out: ManualTrade[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue
    const t = r as Partial<ManualTrade>
    if (typeof t.id !== 'string' || typeof t.symbol !== 'string') continue
    if (t.side !== 'buy' && t.side !== 'sell') continue
    if (!Number.isFinite(t.quantity) || !Number.isFinite(t.price)) continue
    if (typeof t.tradeDate !== 'string') continue
    out.push({
      id: t.id,
      symbol: t.symbol,
      side: t.side,
      quantity: Number(t.quantity),
      price: Number(t.price),
      currency: typeof t.currency === 'string' ? t.currency : '',
      tradeDate: t.tradeDate,
      commission: Number.isFinite(t.commission) ? Number(t.commission) : 0,
      note: typeof t.note === 'string' ? t.note : null,
      loggedAt: typeof t.loggedAt === 'string' ? t.loggedAt : '',
    })
  }
  return out.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate) || a.loggedAt.localeCompare(b.loggedAt))
}

function write(dir: string, trades: ManualTrade[]): void {
  fs.mkdirSync(dir, { recursive: true })
  // Written through a temp file: a crash mid-write would otherwise leave a truncated JSON array, and
  // readManual would report every logged trade as gone.
  const tmp = `${filePath(dir)}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(trades, null, 2) + '\n')
  fs.renameSync(tmp, filePath(dir))
}

export function addManual(dir: string, trade: ManualTrade): ManualTrade {
  const all = readManual(dir)
  if (all.length >= MANUAL_MAX_ENTRIES) {
    throw new Error(`the hand-logged list is full at ${MANUAL_MAX_ENTRIES} entries — import a statement, then clear the ones it covers`)
  }
  all.push(trade)
  write(dir, all)
  return trade
}

export function deleteManual(dir: string, id: string): boolean {
  if (!/^[0-9a-f]{16}$/.test(id)) return false // ids are our own hex — never a caller-supplied path
  const all = readManual(dir)
  const next = all.filter((t) => t.id !== id)
  if (next.length === all.length) return false
  write(dir, next)
  return true
}

/** Remove every entry a statement has answered. Returns how many went. */
export function clearSuperseded(dir: string, coverage: StatementCoverage[]): number {
  const all = readManual(dir)
  const next = all.filter((t) => supersededBy(t, coverage) === null)
  if (next.length === all.length) return 0
  write(dir, next)
  return all.length - next.length
}

// ---------- the provisional read ----------

export interface StatementCoverage {
  id: string
  filename: string
  fromDate: string | null
  toDate: string | null
  /** Whether the export actually returned the Trades section. A Flex query run with Trades unticked
   *  covers the dates without carrying a single fill, so it cannot answer for a hand-logged one. */
  hasTrades: boolean
}

function supersededBy(trade: ManualTrade, coverage: StatementCoverage[]): SupersededBy | null {
  for (const s of coverage) {
    // A statement with no stated range covers nothing: it cannot be used to answer for a date.
    if (!s.fromDate || !s.toDate) continue
    // Nor can one that returned no trade rows. Superseding on dates alone offered to clear the operator's
    // only record of a real fill on the strength of a statement that never contained it.
    if (!s.hasTrades) continue
    if (trade.tradeDate >= s.fromDate && trade.tradeDate <= s.toDate) {
      return { statementId: s.id, filename: s.filename, from: s.fromDate, to: s.toDate }
    }
  }
  return null
}

/** What the book holds today, for the crossing check. Currency is part of the identity, not decoration:
 *  the same ticker on two listings is two positions. */
export interface HeldQuantity { symbol: string | null; currency: string | null; quantity: number | null }

/** One identity for a provisional row and for the position it is compared against. Both sides MUST use
 *  this — keying held quantity by symbol alone while keying the rows by symbol+currency is what let a
 *  dual-listed name report its combined position under each listing. */
function effectKey(symbol: string | null, currency: string | null): string {
  return `${(symbol ?? '').toUpperCase()} ${(currency ?? '').toUpperCase()}`
}

/** Mark each entry against statement coverage and roll the LIVE ones up per symbol. */
export function provisionalRead(
  trades: ManualTrade[],
  coverage: StatementCoverage[],
  held: HeldQuantity[],
): ManualRead {
  const marked: ProvisionalTrade[] = trades.map((t) => {
    const signedQuantity = t.side === 'buy' ? t.quantity : -t.quantity
    return {
      ...t,
      supersededBy: supersededBy(t, coverage),
      signedQuantity,
      // A buy spends cash and a sell raises it; the commission is a cost in both directions.
      cashEffect: (t.side === 'buy' ? -1 : 1) * t.quantity * t.price - t.commission,
    }
  })

  // Keyed by symbol AND currency — the SAME identity the effect rows below use. Summing a dual-listed
  // name across its listings hands both currency rows the combined position: it overstates what is
  // held, and it suppresses the crossesZero warning on a sell that really does take one listing short.
  const bookQty = new Map<string, number>()
  for (const p of held) {
    if (!p.symbol || p.quantity === null) continue
    const k = effectKey(p.symbol, p.currency)
    bookQty.set(k, (bookQty.get(k) ?? 0) + p.quantity)
  }

  const byKey = new Map<string, ProvisionalEffect>()
  for (const t of marked) {
    if (t.supersededBy) continue // answered by a statement — it no longer changes what is held
    // Keyed by symbol AND currency: the same ticker on two listings is two positions, and summing their
    // cash across currencies would produce a number in no currency at all.
    const key = effectKey(t.symbol, t.currency)
    const held0 = bookQty.has(key) ? bookQty.get(key)! : null
    const e = byKey.get(key) ?? {
      symbol: t.symbol, currency: t.currency, bookQuantity: held0,
      delta: 0, provisionalQuantity: held0 ?? 0, cashEffect: 0, trades: 0, crossesZero: false,
    }
    e.delta += t.signedQuantity
    e.cashEffect += t.cashEffect
    e.trades += 1
    e.provisionalQuantity = (e.bookQuantity ?? 0) + e.delta
    // Long going short (or the reverse) through hand-entered rows is almost always a typo. Flagged, not
    // rejected — a real short is legitimate, and the book must not refuse to record what happened.
    e.crossesZero = (e.bookQuantity ?? 0) >= 0 ? e.provisionalQuantity < 0 : e.provisionalQuantity > 0
    byKey.set(key, e)
  }

  return {
    trades: marked,
    live: marked.filter((t) => !t.supersededBy).length,
    superseded: marked.filter((t) => t.supersededBy).length,
    effects: [...byKey.values()].sort((a, b) => a.symbol.localeCompare(b.symbol)),
  }
}
