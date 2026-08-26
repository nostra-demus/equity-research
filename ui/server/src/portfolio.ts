// The fund book: what we actually own, what we actually closed, and proof that it matches the broker.
//
// This is the REAL book — distinct from the engine's model paper-portfolio (`/research:size` →
// `analyses/portfolio/*_sizing.json`), which answers what the research SAID to own. Both exist on
// purpose and must never merge: the calibration loop depends on the model book being untouched by
// execution reality.
//
// FOUR DECISIONS WORTH KNOWING BEFORE READING THE CODE:
//
//  1. THE BROKER IS AUTHORITATIVE, OUR ARITHMETIC IS THE CHECK. IBKR already computes realised P&L per
//     trade (`fifoPnlRealized`), position weights (`percentOfNAV`) and even the time-weighted return
//     (`ChangeInNAV.twr`). We recompute independently and RECONCILE. Where they disagree the break is
//     surfaced, never averaged away — a tracker that quietly diverges from the statement is worse than
//     no tracker, because it is believed.
//
//  2. WE MATCH LOTS; WE DO NOT INVENT P&L. Our FIFO engine exists to recover STRUCTURE the statement
//     does not give — which open lot each close consumed, and therefore holding periods and round
//     trips. The money on each closure is reported both ways (ours and the broker's) so the difference
//     is visible per trade rather than only in aggregate.
//
//  3. IDEMPOTENT BY CONSTRUCTION. A year per Flex query means full history is several overlapping
//     files. Every row is keyed on the broker's own `tradeID` / `transactionID`, so re-importing an
//     overlapping range can never double-count. This is not retrofittable — dedup that arrives later
//     has already corrupted the book.
//
//  4. CORPORATE ACTIONS ARRIVE AS DATA, NOT INFERENCE. IBKR restates the affected trades in place and
//     leaves `origTradeID` / `origTradePrice` pointing at the pre-restatement original. So the lot
//     engine simply runs on the restated rows — it never tries to detect a split from a price jump,
//     which is the classic way a book reads a 2:1 split as a 50% loss.
//
// Pure: documents in, book out. No filesystem and no clock — persistence lives in the caller.

import type { FlexCorporateAction, FlexDocument, FlexTrade } from './portfolio-import'

// ---------- shapes ----------

export interface BookLot {
  key: string
  symbol: string | null
  assetCategory: string | null
  currency: string | null
  /** Signed: positive is long, negative is short. */
  quantity: number
  price: number
  multiplier: number
  openedAt: string | null
  tradeID: string | null
  /** The opening trade's commission, and the quantity it was charged on. A close nets the SHARE of it
   *  belonging to the quantity being closed — see the commission note in runFifo. */
  commission: number
  openedQuantityAbs: number
  /** The base-currency rate on the day the lot OPENED. Without it a closure can only be valued at the
   *  closing rate, which silently folds the currency move into the stock result — the one split a
   *  cross-border book most needs to see. */
  openFxRateToBase: number | null
}

export interface BookClosure {
  key: string
  symbol: string | null
  assetCategory: string | null
  currency: string | null
  quantity: number
  entryPrice: number
  exitPrice: number
  openedAt: string | null
  closedAt: string | null
  holdingDays: number | null
  /** NET of commission on both legs, matching how the broker states realised P&L. */
  realizedLocal: number
  /** The gross price difference before commission, kept so the two can be shown apart. */
  grossLocal: number
  /** Commission attributed to this closure: the closing leg's share plus the opening lot's share. */
  commissionLocal: number
  /** Approximate base-currency value using the closing trade's own `fxRateToBase`. */
  realizedBase: number | null
  /** Rates at each end, so the caller can split the result into what the STOCK did and what the
   *  CURRENCY did. Equal (or both 1) on a single-currency book, where the split is correctly zero. */
  openFxRateToBase: number | null
  closeFxRateToBase: number | null
  closeTradeID: string | null
}

export interface BookPosition {
  symbol: string | null
  conid: string | null
  assetCategory: string | null
  /** COMMON / ETF / ADR and the like. The only asset-class signal the statement carries — it does NOT
   *  distinguish a T-bill ETF from a commodity one, which is why cash equivalence is declared. */
  subCategory: string | null
  /** Contract identity, carried so positionKey() answers the SAME on this side as on the trade side.
   *  Without them the conid-less fallback key differed between the two — the very mismatch the note on
   *  positionKey claims to have closed — and reconciliation check 5 broke on every no-conid derivative. */
  expiry: string | null
  strike: number | null
  putCall: string | null
  currency: string | null
  quantity: number | null
  markPrice: number | null
  costBasisPrice: number | null
  costBasisMoney: number | null
  positionValue: number | null
  /** The statement's own weight — broker-computed, not derived. */
  percentOfNAV: number | null
  unrealizedLocal: number | null
  fxRateToBase: number | null
  multiplier: number | null
  /** Futures carry notional EXPOSURE, not a NAV allocation — the UI must not weight them like equity. */
  isDerivative: boolean
}

export interface BookFlow {
  transactionID: string | null
  date: string | null
  currency: string | null
  amount: number
  amountBase: number | null
  description: string | null
}

export interface BookIncome {
  dividendsGross: number
  withholdingTax: number
  paymentInLieu: number
  interest: number
  fees: number
  /** What actually reached the book: gross income less withholding and fees. */
  net: number
}

/** Income the broker has already credited to NAV but has NOT yet paid out — it is in the ending value
 *  and in no cash transaction, so a bridge built from paid income alone lands short of NAV by exactly
 *  this much. Present only when the newest statement's own window covers the book's whole life, which
 *  is what makes its stated CHANGE equal to the balance; otherwise null, and the bridge says
 *  "not explained" rather than guessing. */
export interface BookAccruals {
  dividend: number | null
  interest: number | null
  total: number | null
}

export interface NavPoint {
  date: string
  total: number
}

export interface ReconciliationCheck {
  name: string
  ours: number | null
  broker: number | null
  break: number | null
  tolerance: number
  ok: boolean
  detail: string
}

export interface Reconciliation {
  ok: boolean
  checks: ReconciliationCheck[]
}

export interface Book {
  accountId: string | null
  baseCurrency: string | null
  asOf: string | null
  coverage: { from: string | null; to: string | null; documents: number; gaps: { after: string; before: string }[] }
  sectionsPresent: string[]
  sectionsUnmodelled: string[]
  positions: BookPosition[]
  openLots: BookLot[]
  closures: BookClosure[]
  flows: BookFlow[]
  income: BookIncome
  /** Accrued-but-unpaid income at `asOf`. Null where the statements cannot prove the balance. */
  accruals: BookAccruals
  navSeries: NavPoint[]
  twr: number | null
  corporateActions: FlexCorporateAction[]
  reconciliation: Reconciliation
  warnings: string[]
}

// ---------- merge (idempotent) ----------

/** Position identity. `conid` is IBKR's stable contract id and survives a ticker rename, so it is used
 *  alone whenever present. Without it, a bare symbol would merge instruments that merely share a
 *  ticker — a stock and its option, two listings in different currencies, two futures expiries — and a
 *  close in one could then consume the other's lot and manufacture P&L. The fallback therefore pins
 *  every field that distinguishes a contract. */
function positionKey(row: {
  conid: string | null; symbol: string | null; assetCategory?: string | null
  currency?: string | null; multiplier?: number | null; expiry?: string | null
  strike?: number | null; putCall?: string | null
}): string {
  if (row.conid) return `conid:${row.conid}`
  return [
    `sym:${row.symbol ?? 'UNKNOWN'}`, row.assetCategory ?? '', row.currency ?? '', row.multiplier ?? '',
    // Expiry, strike and right are what separate one derivative contract from the next. They were named
    // in this key before the trade rows carried them, so they always resolved to '' on one side —
    // silently merging two futures expiries into one FIFO queue, and mismatching the trade-side key
    // against the position-side key that DID have them.
    row.expiry ?? '', row.strike ?? '', (row.putCall ?? '').toUpperCase(),
  ].join('|')
}

/** Later documents win on a key collision: a re-export of the same range carries the CURRENT truth,
 *  including any restatement a corporate action applied since the earlier file was generated. */
function dedupeBy<T>(rows: T[], key: (row: T) => string | null): T[] {
  const byKey = new Map<string, T>()
  for (const row of rows) {
    // A row with no broker id still must not duplicate on re-import. Falling back to the row's own
    // content is safe here because these rows ARE their content — two byte-identical cash rows in
    // overlapping exports are the same event, not two events that happen to match.
    const k = key(row) ?? `content:${JSON.stringify(row)}`
    byKey.set(k, row)
  }
  return [...byKey.values()]
}

/** A corporate action does not edit a trade in place — IBKR emits a NEW row with a new `tradeID` whose
 *  `origTradeID` names the row it replaces. Dedup by id therefore keeps BOTH across overlapping
 *  exports, double-counting the position (a 2:1 split leaves 300 shares where 200 are held). Anything
 *  another row claims as its original is superseded and dropped. */
function dropSupersededTrades(trades: FlexTrade[]): FlexTrade[] {
  const superseded = new Set<string>()
  for (const t of trades) {
    if (t.origTradeID) superseded.add(t.origTradeID)
    if (t.origTransactionID) superseded.add(t.origTransactionID)
  }
  if (superseded.size === 0) return trades
  return trades.filter((t) => !(t.tradeID && superseded.has(t.tradeID)) && !(t.transactionID && superseded.has(t.transactionID)))
}

// ---------- FIFO ----------

const EPS = 1e-9

/** Match closes against open lots, oldest first, recovering the structure the statement omits.
 *  Handles the `C;O` flip (close the existing side, then open the opposite one) and a short book
 *  symmetrically — a short opens a negative lot and closes with a buy. */
export function runFifo(
  trades: FlexTrade[],
  /** Fallback FX when the closing row itself carries no `fxRateToBase`. IBKR leaves that attribute blank
   *  on a trade already IN the base currency, where the right answer is 1 — not "unconvertible". Without
   *  it the reconciliation counted every such closure as un-valuable and refused to compare realised P&L
   *  on a single-currency book, while the broker side of the same check resolved fine through the grid. */
  rateFor?: (currency: string | null, date: string | null) => number | null,
): { lots: BookLot[]; closures: BookClosure[]; warnings: string[] } {
  const warnings: string[] = []
  const open = new Map<string, BookLot[]>()
  const closures: BookClosure[] = []

  // Timestamp first; for fills sharing a second, keep the order the statement listed them in. Sorting
  // ids lexicographically would put "10" before "9" and could flip an open ahead of the close it
  // belongs to — file order is the only execution order actually available at second resolution.
  const ordered = trades
    .map((trade, index) => ({ trade, index }))
    .sort((a, b) => {
      const at = a.trade.dateTime ?? a.trade.tradeDate ?? ''
      const bt = b.trade.dateTime ?? b.trade.tradeDate ?? ''
      const byTime = at.localeCompare(bt)
      return byTime !== 0 ? byTime : a.index - b.index
    })
    .map((x) => x.trade)

  for (const t of ordered) {
    // Only EXECUTION rows are real fills; a SUMMARY row is the same fills aggregated, and counting both
    // would double the book.
    if (t.levelOfDetail && t.levelOfDetail.toUpperCase() !== 'EXECUTION') continue
    const qty = t.quantity
    const price = t.tradePrice
    if (qty === null || qty === 0 || price === null) continue

    const key = positionKey(t)
    const indicator = (t.openCloseIndicator ?? '').toUpperCase()
    // IBKR leaves the indicator EMPTY for several asset classes. Treating that as "open" turns a sell
    // against a long into a phantom short lot, with no closure and no warning. A blank indicator is
    // therefore inferred from position state: close what it can, open whatever is left — which is what
    // an explicit `C;O` does, and what the position actually did.
    const explicit = indicator !== ''
    const wantsClose = indicator.includes('C') || !explicit
    const wantsOpen = indicator.includes('O') || !explicit
    const lots = open.get(key) ?? []
    let remaining = qty

    // CLOSE first — `C;O` means close the existing side before opening the opposite one.
    if (wantsClose) {
      while (Math.abs(remaining) > EPS && lots.length > 0) {
        const lot = lots[0]!
        // A close must oppose the lot's sign. Same-sign means this is really an add, not a close.
        if (Math.sign(lot.quantity) === Math.sign(remaining)) break
        const matched = Math.min(Math.abs(lot.quantity), Math.abs(remaining))
        const signedMatched = matched * Math.sign(lot.quantity)
        // The LOT's multiplier wins: a closing row that omits it would otherwise value a 100x contract
        // at 1x and report one hundredth of the real P&L.
        const contract = lot.multiplier || t.multiplier || 1
        const grossLocal = (price - lot.price) * signedMatched * contract
        // COMMISSION IS CHARGED ON BOTH LEGS. The broker's fifoPnlRealized is net of the closing
        // commission AND of the opening lot's commission apportioned to the quantity being closed —
        // verified against a real statement, where gross-only left a break of exactly the two shares
        // combined. Commissions arrive negative, so they simply add.
        const openShare = lot.openedQuantityAbs > 0 ? lot.commission * (matched / lot.openedQuantityAbs) : 0
        // Transaction taxes (stamp duty and the like) are an execution cost exactly as commission is,
        // and the broker's cost basis includes them — omitting them leaves realised P&L overstated.
        const closeCost = (t.ibCommission ?? 0) + (t.taxes ?? 0)
        const closeShare = Math.abs(qty) > 0 ? closeCost * (matched / Math.abs(qty)) : 0
        const commissionLocal = openShare + closeShare
        const realizedLocal = grossLocal + commissionLocal
        const closedAt = t.dateTime ?? t.tradeDate
        const closeRate = t.fxRateToBase ?? (rateFor ? rateFor(t.currency ?? lot.currency, closedAt ? closedAt.slice(0, 10) : null) : null)
        closures.push({
          key,
          symbol: t.symbol ?? lot.symbol,
          assetCategory: t.assetCategory ?? lot.assetCategory,
          currency: t.currency ?? lot.currency,
          quantity: matched,
          entryPrice: lot.price,
          exitPrice: price,
          openedAt: lot.openedAt,
          closedAt,
          holdingDays: daysBetween(lot.openedAt, closedAt),
          realizedLocal,
          grossLocal,
          commissionLocal,
          realizedBase: closeRate === null ? null : realizedLocal * closeRate,
          openFxRateToBase: lot.openFxRateToBase,
          closeFxRateToBase: closeRate,
          closeTradeID: t.tradeID,
        })
        lot.quantity -= signedMatched
        remaining += signedMatched
        if (Math.abs(lot.quantity) <= EPS) lots.shift()
      }
      if (Math.abs(remaining) > EPS && !wantsOpen) {
        // A close with nothing left to close against — the history is starting mid-position.
        warnings.push(`close exceeds open quantity for ${t.symbol ?? key} (trade ${t.tradeID ?? '?'}) — history may start after this position was opened`)
        remaining = 0
      }
    }

    if (Math.abs(remaining) > EPS && wantsOpen) {
      lots.push({
        key,
        symbol: t.symbol,
        assetCategory: t.assetCategory,
        currency: t.currency,
        quantity: remaining,
        price,
        multiplier: t.multiplier ?? 1,
        openedAt: t.dateTime ?? t.tradeDate,
        tradeID: t.tradeID,
        // Only the share of the opening commission belonging to the quantity that actually stays open.
        commission: ((t.ibCommission ?? 0) + (t.taxes ?? 0)) * (Math.abs(remaining) / Math.abs(qty)),
        openedQuantityAbs: Math.abs(remaining),
        openFxRateToBase: t.fxRateToBase ?? (rateFor ? rateFor(t.currency, (t.dateTime ?? t.tradeDate)?.slice(0, 10) ?? null) : null),
      })
    }
    open.set(key, lots)
  }

  const lots: BookLot[] = []
  for (const group of open.values()) for (const lot of group) if (Math.abs(lot.quantity) > EPS) lots.push(lot)
  return { lots, closures, warnings }
}

function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null
  const from = Date.parse(a.length === 10 ? `${a}T00:00:00Z` : `${a}Z`)
  const to = Date.parse(b.length === 10 ? `${b}T00:00:00Z` : `${b}Z`)
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null
  return Math.round((to - from) / 86_400_000)
}

// ---------- returns ----------

/** Daily-chained time-weighted return, as a percentage, with external flows removed.
 *
 *  Flows are treated as arriving at the START of their day (so they participate in that day's return),
 *  matching the convention IBKR's own `twr` uses. A day whose opening base is zero or negative is
 *  skipped rather than producing an infinite return — that happens on the funding day itself.
 *
 *  This is THE number that makes a track record comparable to an index: it strips out when capital
 *  arrived, so it measures decisions rather than the LP's timing. */
/** A capital flow dated on a weekend or a market holiday has no NAV row of its own, so it must be
 *  carried to the NEXT valued day — the day the money actually shows up in the series. Dropping it
 *  instead (the naive same-date lookup) makes that day's NAV jump read as performance: on a real
 *  statement a Saturday deposit produced a phantom +99% day and threw the whole chained return out by
 *  over 100 percentage points. A flow after the last NAV date has nowhere to land and is ignored. */
export function alignFlowsToNavDates(flows: { date: string | null; amount: number; amountBase: number | null }[], navSeries: NavPoint[]): Map<string, number> {
  const byDate = new Map<string, number>()
  const dates = navSeries.map((p) => p.date)
  for (const f of flows) {
    if (!f.date) continue
    // A flow with no base-currency value is EXCLUDED, exactly as buildBook's warning says it is. Falling
    // back to the local amount would push, say, an INR deposit into a USD return chain unconverted —
    // wrong by the size of the exchange rate, and silently, since the warning claims the opposite.
    if (f.amountBase === null) continue
    const landing = dates.find((d) => d >= f.date!)
    if (landing === undefined) continue
    byDate.set(landing, (byDate.get(landing) ?? 0) + f.amountBase)
  }
  return byDate
}

/** Periods the imported statements do not cover, as the pair of dates the hole sits between.
 *
 *  This matters because a daily-chained return has no way to notice one. Import 2024 and 2026 without
 *  2025 and the chain simply joins the last 2024 NAV to the first 2026 NAV as though it were one step —
 *  so every deposit and withdrawal made during 2025 is counted as investment performance. Nothing else
 *  catches it: the reconciliation checks are scoped to the newest statement's own window, so the book
 *  reads "Reconciled" while the headline return is wrong by the size of a year's contributions. */
export function coverageGaps(docs: { fromDate: string | null; toDate: string | null }[]): { after: string; before: string }[] {
  const windows = docs
    .filter((d): d is { fromDate: string; toDate: string } => !!d.fromDate && !!d.toDate)
    .sort((a, b) => a.fromDate.localeCompare(b.fromDate))
  const gaps: { after: string; before: string }[] = []
  let reach: string | null = null
  for (const w of windows) {
    if (reach !== null && w.fromDate > nextDay(reach)) gaps.push({ after: reach, before: w.fromDate })
    if (reach === null || w.toDate > reach) reach = w.toDate
  }
  return gaps
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function computeTwr(navSeries: NavPoint[], flowsByDate: Map<string, number>): number | null {
  if (navSeries.length < 2) return null
  let chain = 1
  let used = 0
  for (let i = 1; i < navSeries.length; i++) {
    const prev = navSeries[i - 1]!
    const curr = navSeries[i]!
    const flow = flowsByDate.get(curr.date) ?? 0
    const base = prev.total + flow
    // Zero OR negative: a day that opens with no capital has no return to speak of, and dividing by a
    // negative base produces a large wrong number rather than a meaningful one.
    if (base <= EPS) continue
    chain *= curr.total / base
    used++
  }
  if (used === 0) return null
  return (chain - 1) * 100
}

// ---------- income ----------

const INCOME_MATCHERS: { key: keyof Omit<BookIncome, 'net'>; test: RegExp }[] = [
  { key: 'withholdingTax', test: /withholding/i },
  { key: 'paymentInLieu', test: /payment\s*in\s*lieu/i },
  { key: 'dividendsGross', test: /dividend/i },
  { key: 'interest', test: /interest/i },
  { key: 'fees', test: /fee|commission/i },
]

/** Order matters: "Payment In Lieu Of Dividends" and "Withholding Tax" both contain a dividend-ish word,
 *  so the specific matchers run before the general one. Withholding is the most frequent cash row in a
 *  real cross-border export — folding it into dividends would overstate income on every screen. */
function classifyIncome(type: string | null, description: string | null): keyof Omit<BookIncome, 'net'> | null {
  const text = `${type ?? ''} ${description ?? ''}`
  for (const m of INCOME_MATCHERS) if (m.test.test(text)) return m.key
  return null
}

/** Resolve a currency to the base currency using the statement's OWN ConversionRates matrix, which the
 *  export already ships (a full daily grid). Falls back to the most recent rate on or before the date,
 *  because a dividend can settle on a day the grid does not price. Returns null when the pair is simply
 *  unknown — the caller must then EXCLUDE the row and say so, never treat a foreign amount as base. */
function buildFxResolver(docs: FlexDocument[], base: string | null): (currency: string | null, date: string | null) => number | null {
  const byPair = new Map<string, { dates: string[]; rates: Map<string, number> }>()
  for (const doc of docs) {
    for (const r of doc.conversionRates) {
      if (!r.reportDate || !r.fromCurrency || !r.toCurrency || r.rate === null) continue
      const pair = `${r.fromCurrency}|${r.toCurrency}`
      let entry = byPair.get(pair)
      if (!entry) { entry = { dates: [], rates: new Map() }; byPair.set(pair, entry) }
      if (!entry.rates.has(r.reportDate)) entry.dates.push(r.reportDate)
      entry.rates.set(r.reportDate, r.rate)
    }
  }
  for (const entry of byPair.values()) entry.dates.sort()
  return (currency, date) => {
    if (!currency) return null
    if (base && currency === base) return 1
    if (!base) return null
    const entry = byPair.get(`${currency}|${base}`)
    if (!entry || entry.dates.length === 0) return null
    if (date) {
      const exact = entry.rates.get(date)
      if (exact !== undefined) return exact
      let lo = 0, hi = entry.dates.length - 1, best: string | null = null
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (entry.dates[mid]! <= date) { best = entry.dates[mid]!; lo = mid + 1 } else hi = mid - 1
      }
      // ON OR BEFORE, never after. Falling back to the newest rate in the whole grid would value a
      // transaction that predates the grid at a rate struck months or years later — a made-up number
      // that looks like a real one. No earlier rate means the row genuinely cannot be valued, and the
      // caller already knows to exclude it and say so.
      return best === null ? null : entry.rates.get(best) ?? null
    }
    return entry.rates.get(entry.dates[entry.dates.length - 1]!) ?? null
  }
}

function isCapitalFlow(type: string | null): boolean {
  return /deposit|withdraw/i.test(type ?? '')
}

// ---------- build ----------

export function buildBook(documents: FlexDocument[]): Book {
  const docs = documents.filter(Boolean)
  if (docs.length === 0) throw new Error('no Flex documents to build a book from')

  const warnings: string[] = []

  // A book is ONE account. Merging two accounts' trades, cash and NAV produces neither account's book —
  // and it can still reconcile by coincidence, which is worse than failing. Refuse rather than warn.
  // A statement that does not name its account cannot be shown to belong to this one. Filtering the
  // missing identity out instead let an unidentifiable export slip past the one-account test — the set
  // stayed at size 1 and its trades, NAV and flows merged into a book labelled with the known account.
  const unidentified = docs.filter((d) => !d.accountIds.length && !d.accountId)
  if (unidentified.length > 0) {
    throw new Error(`${unidentified.length} export(s) do not name an account — every statement must identify the same one`)
  }
  const accountIds = new Set(docs.flatMap((d) => d.accountIds.length ? d.accountIds : [d.accountId]).filter((a): a is string => !!a))
  if (accountIds.size > 1) {
    throw new Error(`these exports span ${accountIds.size} accounts (${[...accountIds].sort().join(', ')}) — build one book per account`)
  }

  // ORDER ONCE, HERE. Dedup keeps the LAST row for a key and the NAV map keeps the last value for a
  // date, so "newest wins" is only true if the documents are in chronological order. Relying on the
  // caller's argument order let a stale export overwrite a newer one.
  // `whenGenerated` breaks the tie: re-exporting the same range after a restatement produces two files
  // with the SAME toDate, and without the tie-break their order is whatever the store happened to list,
  // so the STALE one could win the "newest document" snapshot and still reconcile against its own stale
  // summary.
  docs.sort((a, b) =>
    (a.toDate ?? '').localeCompare(b.toDate ?? '') || (a.whenGenerated ?? '').localeCompare(b.whenGenerated ?? ''))

  // The key carries levelOfDetail. IBKR can emit CLOSED_LOT and SUMMARY rows alongside the EXECUTION
  // they belong to, all sharing one tradeID — and on an id-only key the last one written wins. Both the
  // FIFO run and the realised-P&L check then filter to EXECUTION, so if a lot row won, the fill
  // disappears from the book AND from the check that exists to catch a missing fill.
  const trades = dropSupersededTrades(dedupeBy(docs.flatMap((d) => d.trades), (t) => {
    const id = t.tradeID ?? t.transactionID
    return id === null ? null : `${(t.levelOfDetail ?? '').toUpperCase()}|${id}`
  }))
  const cash = dedupeBy(docs.flatMap((d) => d.cashTransactions), (c) => c.transactionID)
  const corporateActions = dedupeBy(docs.flatMap((d) => d.corporateActions), (c) => c.transactionID ?? c.actionID)

  // The newest document wins for point-in-time state (positions are a snapshot, not a history).
  const newest = docs[docs.length - 1]!

  // Daily NAV: one row per day across every document, deduped on date, oldest first.
  const navByDate = new Map<string, number>()
  for (const doc of docs) {
    for (const row of doc.equitySummary) {
      if (row.reportDate && row.total !== null) navByDate.set(row.reportDate, row.total)
    }
  }
  const navSeries: NavPoint[] = [...navByDate.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // BASE_SUMMARY is IBKR's REPORTING sentinel, not an ISO code. Taken literally it matches no currency
  // in the rate grid and not even the base itself, so every closure, flow and income row became
  // unconvertible and the header read "Reported in BASE_SUMMARY".
  const isSentinel = (c: string | null) => (c ?? '').toUpperCase() === 'BASE_SUMMARY'
  const realCurrency = (c: string | null) => (c === null || isSentinel(c) ? null : c)

  // One book, one base currency. The NAV series is built from EquitySummaryInBase totals across every
  // document; if the account's reporting currency changed mid-history those totals are in different
  // units, and chaining them turns the switch into a fabricated daily return. Row-level fxRateToBase
  // values are also rates to their ORIGINAL base. Refuse, exactly as the multi-account case does.
  const baseCurrencies = new Set(
    [...docs.map((d) => d.changeInNav?.currency ?? null), ...docs.flatMap((d) => d.equitySummary).map((r) => r.currency)]
      .map(realCurrency).filter((c): c is string => !!c))
  if (baseCurrencies.size > 1) {
    throw new Error(`these exports report in ${baseCurrencies.size} base currencies (${[...baseCurrencies].sort().join(', ')}) — build one book per reporting currency`)
  }

  const baseCurrency =
    realCurrency(newest.changeInNav?.currency ?? null)
    ?? docs.flatMap((d) => d.equitySummary).map((r) => realCurrency(r.currency)).find((c) => c !== null)
    ?? null
  const fx = buildFxResolver(docs, baseCurrency)

  /** The row's own rate first (it is the broker's, for that exact fill), then the statement's rate grid.
   *  Null means we genuinely cannot value it in the base currency. */
  const rateFor = (currency: string | null, rowRate: number | null, date: string | null): number | null =>
    rowRate !== null ? rowRate : fx(currency, date)

  // FIFO runs with the rate grid available, so a base-currency close (whose row carries no rate) values
  // at 1 rather than counting as unconvertible — see the note on runFifo's second parameter.
  const { lots, closures, warnings: fifoWarnings } = runFifo(trades, (currency, date) => fx(currency, date))
  warnings.push(...fifoWarnings)

  const flows: BookFlow[] = cash
    .filter((c) => isCapitalFlow(c.type))
    .map((c) => {
      const date = c.dateTime ? c.dateTime.slice(0, 10) : c.settleDate
      const rate = rateFor(c.currency, c.fxRateToBase, date)
      if (rate === null && c.amount !== null) {
        warnings.push(`capital flow in ${c.currency ?? 'an unknown currency'} could not be valued in ${baseCurrency ?? 'the base currency'} — it is excluded from the return calculation`)
      }
      return {
        transactionID: c.transactionID,
        date,
        currency: c.currency,
        amount: c.amount ?? 0,
        amountBase: c.amount === null || rate === null ? null : c.amount * rate,
        description: c.description,
      }
    })

  const income: BookIncome = { dividendsGross: 0, withholdingTax: 0, paymentInLieu: 0, interest: 0, fees: 0, net: 0 }
  // Kept per row, with its date, so the reconciliation can take the SAME window the statement it is
  // checking against covers. Without this the dividend and withholding checks could only run on a
  // single-document book — see incomeBetween below.
  const incomeRows: { date: string | null; bucket: keyof BookIncome; base: number }[] = []
  for (const c of cash) {
    if (isCapitalFlow(c.type)) continue
    const bucket = classifyIncome(c.type, c.description)
    if (!bucket || c.amount === null) continue
    const date = c.dateTime ? c.dateTime.slice(0, 10) : c.settleDate
    const rate = rateFor(c.currency, c.fxRateToBase, date)
    if (rate === null) {
      // Adding a foreign amount straight into a base-currency total is how a EUR 1,000 dividend becomes
      // USD 1,000. Excluding it and saying so is the only honest option.
      warnings.push(`${c.type ?? 'a cash transaction'} in ${c.currency ?? 'an unknown currency'} could not be valued in ${baseCurrency ?? 'the base currency'} — it is excluded from income`)
      continue
    }
    income[bucket] += c.amount * rate
    incomeRows.push({ date, bucket, base: c.amount * rate })
  }
  income.net = income.dividendsGross + income.paymentInLieu + income.interest + income.withholdingTax + income.fees

  /** Income restricted to one statement's own window. A row with no usable date is EXCLUDED rather than
   *  assumed inside it: a check that quietly counts undated rows on one side is worse than one that
   *  reports it could not be evaluated. */
  const incomeBetween = (from: string | null, to: string | null): BookIncome | null => {
    if (!from || !to) return null
    const out: BookIncome = { dividendsGross: 0, withholdingTax: 0, paymentInLieu: 0, interest: 0, fees: 0, net: 0 }
    for (const r of incomeRows) {
      if (!r.date) return null // an undated income row makes any windowed total unprovable
      if (r.date < from || r.date > to) continue
      out[r.bucket] += r.base
    }
    out.net = out.dividendsGross + out.paymentInLieu + out.interest + out.withholdingTax + out.fees
    return out
  }

  // ACCRUALS. IBKR carries dividends and interest that have been EARNED but not yet PAID inside the
  // ending value, while no cash transaction exists for them yet — so paid income alone rebuilds NAV
  // short by exactly the accrued balance ($24.88 of interest on the real book). The statement states
  // the CHANGE over its own window, which equals the BALANCE only when that window covers the book's
  // whole life; anywhere else the honest answer is null, and the bridge then prints an unexplained
  // residual instead of a number wearing a label it cannot support.
  const accrualDoc = [...docs].reverse().find((d) => d.changeInNav !== null)
  const bookStart = docs.map((d) => d.fromDate).filter((x): x is string => !!x).sort()[0] ?? null
  const accrualsProvable = accrualDoc != null && accrualDoc.fromDate != null && bookStart != null
    && accrualDoc.fromDate <= bookStart
  const accrualDividend = accrualsProvable ? accrualDoc!.changeInNav!.changeInDividendAccruals : null
  const accrualInterest = accrualsProvable ? accrualDoc!.changeInNav!.changeInInterestAccruals : null
  const accruals: BookAccruals = {
    dividend: accrualDividend,
    interest: accrualInterest,
    total: accrualDividend === null && accrualInterest === null
      ? null
      : (accrualDividend ?? 0) + (accrualInterest ?? 0),
  }

  // THE NEWEST DOCUMENT THAT ACTUALLY CARRIES A SNAPSHOT, not simply the newest document. A
  // Trades-only export is a normal thing to run, and taking positions from it emptied the Holdings tab
  // while the badge still read "Reconciled" — because the position check is gated on the same document
  // and silently skipped itself too. The older snapshot is the best available truth; `asOf` already
  // states the date it belongs to.
  const positionSource = [...docs].reverse().find((d) => d.sectionsPresent.includes('OpenPositions')) ?? newest
  if (positionSource !== newest && newest.sectionsPresent.length > 0) {
    warnings.push(`the newest export carries no OpenPositions section — holdings are shown as of ${positionSource.toDate ?? 'the last statement that had them'}`)
  }
  const positions: BookPosition[] = positionSource.openPositions
    .filter((p) => !p.levelOfDetail || p.levelOfDetail.toUpperCase() === 'SUMMARY')
    .map((p) => ({
      symbol: p.symbol,
      conid: p.conid,
      subCategory: p.subCategory,
      expiry: p.expiry,
      strike: p.strike,
      putCall: p.putCall,
      assetCategory: p.assetCategory,
      currency: p.currency,
      quantity: p.position,
      markPrice: p.markPrice,
      costBasisPrice: p.costBasisPrice,
      costBasisMoney: p.costBasisMoney,
      positionValue: p.positionValue,
      percentOfNAV: p.percentOfNAV,
      unrealizedLocal: p.fifoPnlUnrealized,
      fxRateToBase: p.fxRateToBase,
      multiplier: p.multiplier,
      isDerivative: isDerivativeCategory(p.assetCategory),
    }))

  const flowsByDate = alignFlowsToNavDates(flows, navSeries)
  const gaps = coverageGaps(docs)
  for (const g of gaps) {
    warnings.push(`no statement covers ${nextDay(g.after)} to ${g.before} — the all-history return and risk figures are withheld for that reason`)
  }
  // An all-history return computed across a hole is not a conservative estimate of the real one; it is a
  // different number with flows counted as performance. Withhold it rather than publish it.
  const twr = gaps.length > 0 ? null : computeTwr(navSeries, flowsByDate)

  return {
    accountId: newest.accountId,
    baseCurrency,
    asOf: navSeries.length ? navSeries[navSeries.length - 1]!.date : newest.toDate,
    coverage: {
      from: docs.map((d) => d.fromDate).filter((x): x is string => !!x).sort()[0] ?? null,
      to: docs.map((d) => d.toDate).filter((x): x is string => !!x).sort().reverse()[0] ?? null,
      documents: docs.length,
      gaps,
    },
    sectionsPresent: [...new Set(docs.flatMap((d) => d.sectionsPresent))].sort(),
    sectionsUnmodelled: [...new Set(docs.flatMap((d) => d.sectionsUnmodelled))].sort(),
    positions,
    openLots: lots,
    closures,
    flows,
    income,
    accruals,
    navSeries,
    twr,
    corporateActions,
    reconciliation: reconcile({ docs, navSeries, twr, closures, trades, corporateActions, flows, income, incomeBetween, positions, openLots: lots, flowsByDate, fx, gaps }),
    warnings,
  }
}

/** MARGIN-BACKED NOTIONAL, not a NAV allocation — a 3-lot gold future is ~$776k of exposure against
 *  ~$29k of margin. Weighting that like equity overstates NAV and every other weight with it.
 *
 *  Bought options are deliberately NOT in this list. An option's marked premium is a real asset (or, when
 *  short, a real liability) that sits inside NAV exactly as a share does, so flagging it notional would
 *  strike its value out of the invested total and understate any book that holds options. Future-style
 *  options (FSOPT) settle on margin like a future, so they belong here. */
function isDerivativeCategory(assetCategory: string | null): boolean {
  const c = (assetCategory ?? '').toUpperCase()
  return c === 'FUT' || c === 'CFD' || c === 'FSOPT'
}

// ---------- reconciliation ----------

/** The trust anchor. Every number in the book is derived; these checks are what prove the derivation.
 *  A break is reported, never hidden — and any failing check makes the whole book un-reconciled.
 *
 *  Two rules keep the verdict honest rather than merely green:
 *   · A check that CANNOT be evaluated is recorded as un-evaluated and fails the book. Silently
 *     dropping it lets "reconciles" mean "the checks we happened to run passed".
 *   · Money is compared in the BASE currency. Summing realised P&L across trade currencies adds
 *     unlike units, so it can only agree by coincidence. */
export function reconcile(ctx: {
  docs: FlexDocument[]
  navSeries: NavPoint[]
  twr: number | null
  closures: BookClosure[]
  trades: FlexTrade[]
  flows: BookFlow[]
  income: BookIncome
  /** Income over one statement's window, or null when it cannot be established. */
  incomeBetween: (from: string | null, to: string | null) => BookIncome | null
  positions: BookPosition[]
  openLots: BookLot[]
  flowsByDate: Map<string, number>
  fx: (currency: string | null, date: string | null) => number | null
  corporateActions: FlexCorporateAction[]
  /** Periods no statement covers. A hole makes the all-history figures unverifiable, not merely noisy. */
  gaps: { after: string; before: string }[]
}): Reconciliation {
  const checks: ReconciliationCheck[] = []
  const { docs, navSeries, closures, trades, corporateActions, flows, income, incomeBetween, positions, openLots, fx, gaps } = ctx
  // docs arrive chronologically ordered from buildBook, so the last statement is the newest.
  const withNav = docs.filter((d) => d.changeInNav !== null)
  const latestNav = withNav.length ? withNav[withNav.length - 1]!.changeInNav! : null

  const add = (c: ReconciliationCheck) => checks.push(c)
  const cmp = (name: string, ours: number | null, broker: number | null, tolerance: number, detail: string) => {
    if (ours === null || broker === null) {
      add({ name, ours, broker, break: null, tolerance, ok: false, detail: `${detail} — could not be evaluated` })
      return
    }
    const diff = ours - broker
    add({ name, ours, broker, break: diff, tolerance, ok: Math.abs(diff) <= tolerance, detail })
  }

  // 0. The floor. Six of the eight checks below read from ChangeInNAV; without that section they add
  //    nothing at all, and `checks.every(...)` over the two that survive returned ok:true \u2014 the badge
  //    read "Reconciled" on a book with no broker evidence for NAV, return, flows or income. That is the
  //    exact failure this function's own docstring forbids, so record the absence as a failed check
  //    rather than letting it disappear.
  if (!latestNav) {
    add({ name: 'Statement summary', ours: null, broker: null, break: null, tolerance: 0, ok: false,
      detail: 'no export carried a ChangeInNAV section \u2014 NAV, the NAV bridge, return, capital flows and income have no broker figure to check against' })
  }
  // A hole between statements cannot be reconciled away by the newest statement's own window, which is
  // all the checks below ever see.
  for (const g of gaps) {
    add({ name: 'Coverage', ours: null, broker: null, break: null, tolerance: 0, ok: false,
      detail: `no statement covers ${g.after} to ${g.before} \u2014 flows and performance inside that period are unverifiable, so the all-history return is withheld` })
  }

  // 1. NAV: the statement's ending value against the last day of ITS OWN window.
  //    Taking the last point of the MERGED series compared two different dates whenever the newest
  //    export carried daily NAV but no ChangeInNAV \u2014 reporting a break equal to all account movement
  //    since the older statement, on a book where both files were correct.
  const navAtStatementEnd = latestNav?.toDate ? navSeries.find((p) => p.date === latestNav.toDate) ?? null : null
  const lastPoint = navSeries.length ? navSeries[navSeries.length - 1]! : null
  if (latestNav?.endingValue != null) {
    const ourEnd = navAtStatementEnd ?? (latestNav.toDate ? null : lastPoint)
    cmp('Net asset value', ourEnd ? ourEnd.total : null, latestNav.endingValue, 1,
      'The statement\u2019s own ending date in the daily series against its stated ending value')
  }

  // 2. The NAV bridge identity: starting value plus every component must equal the ending value.
  if (latestNav?.startingValue != null && latestNav.endingValue != null) {
    const components = [
      latestNav.realized, latestNav.changeInUnrealized, latestNav.mtm, latestNav.dividends,
      latestNav.withholdingTax, latestNav.interest, latestNav.commissions, latestNav.otherFees,
      latestNav.depositsWithdrawals, latestNav.fxTranslation,
      latestNav.changeInDividendAccruals, latestNav.changeInInterestAccruals,
    ]
    // An absent component is UNKNOWN, not zero — the parser preserves that distinction deliberately, and
    // filtering the nulls out threw it away, then compared the partial sum as though the bridge were
    // complete. This is the check that proves NAV is rebuildable; it must not pass by luck.
    const complete = components.every((v): v is number => v !== null)
    cmp('NAV bridge',
      complete ? latestNav.startingValue + (components as number[]).reduce((a, b) => a + b, 0) : null,
      latestNav.endingValue, 1,
      'Starting value plus every stated component should rebuild the ending value')
  }

  // 3. Return. With several overlapping exports the merged series spans more than the newest
  //    statement's window, so the comparison is made over THAT window rather than skipped — a
  //    multi-file import must not be certified on the other checks alone.
  if (latestNav?.twr != null) {
    const from = latestNav.fromDate, to = latestNav.toDate
    // LEFT AS IT IS, deliberately. A review suggested opening the slice on the last point BEFORE
    // `from`, on the theory that IBKR's twr covers the move ON fromDate while a slice starting there
    // does not. It may well be right — but the convention cannot be settled from the data available:
    // in the real statement startingValue, the fromDate NAV row and the row before it are all zero, so
    // both readings fit. Changing the arithmetic of a RECONCILIATION CHECK on an untestable hypothesis
    // is the wrong risk: this check passes today, and if the convention is the other way the "fix"
    // manufactures the break it claims to prevent. Settle it with a multi-period export whose
    // startingValue differs from its fromDate NAV row, then change it with a test that fails first.
    const windowed = from && to ? navSeries.filter((p) => p.date >= from && p.date <= to) : navSeries
    // Recompute whenever coverage has a hole: ctx.twr is deliberately withheld (null) in that case, but
    // ONE statement's own window is still continuous and still worth checking.
    const ourWindowTwr = windowed.length === navSeries.length && gaps.length === 0
      ? ctx.twr
      : computeTwr(windowed, ctx.flowsByDate)
    cmp('Time-weighted return', ourWindowTwr, latestNav.twr, 0.05,
      'Daily-chained return with flows removed, over the statement\u2019s own window (percentage points)')
  }

  // 4. Realised P&L, IN BASE CURRENCY on both sides.
  const executions = trades.filter((t) => !t.levelOfDetail || t.levelOfDetail.toUpperCase() === 'EXECUTION')
  const brokerRows = executions.filter((t) => t.fifoPnlRealized !== null)
  // An OPENING execution still carries fifoPnlRealized="0" — it is a real attribute with a real value,
  // so it belongs in the sum, but it is NOT evidence that anything was closed. Only a row that says it
  // closed, or that realised money, can prove a missing opening lot.
  const brokerClosingRows = brokerRows.filter(
    (t) => t.fifoPnlRealized !== 0 || (t.openCloseIndicator ?? '').toUpperCase().includes('C'))
  // Same date basis the FIFO side uses (dateTime first, tradeDate second). Resolving on tradeDate alone
  // meant a row carrying only dateTime fell through to fx(currency, null), which returns the NEWEST rate
  // in the whole grid — so the two sides of this very check converted at different dates and broke a
  // valid multi-currency book.
  const rate = (t: FlexTrade) => t.fxRateToBase ?? fx(t.currency, (t.dateTime ?? t.tradeDate)?.slice(0, 10) ?? null)
  /** A row's realised money in the base currency. A ZERO-P&L row (every opening execution carries
   *  fifoPnlRealized="0") contributes nothing whatever the rate is, so it is not an obstacle to the
   *  comparison and must not be multiplied by a rate that may legitimately be absent. */
  const realisedBase = (t: FlexTrade) => (t.fifoPnlRealized ? t.fifoPnlRealized * rate(t)! : 0)
  // Zero converts at every rate, so a zero-P&L opening row with no rate is not an obstacle to comparing.
  const unconvertible = brokerRows.filter((t) => t.fifoPnlRealized !== 0 && rate(t) === null).length
    + closures.filter((c) => c.realizedBase === null).length
  // A corporate action can realise money with no Trade row behind it — a cash merger or cash-in-lieu.
  // It is parsed and published, and it was outside this check entirely, so the realised total could be
  // short while the badge stayed green.
  const caRows = corporateActions.filter((c) => c.fifoPnlRealized !== null && c.fifoPnlRealized !== 0)
  const caRate = (c: FlexCorporateAction) =>
    c.fxRateToBase ?? fx(c.currency, (c.dateTime ?? c.reportDate)?.slice(0, 10) ?? null)
  if (brokerRows.length === 0 && closures.length === 0 && latestNav?.realized != null && latestNav.realized !== 0) {
    // The statement says money was realised and no trade detail was imported to reconstruct it. Skipping
    // the check here certified a book whose entire closed-trade history could be missing.
    add({ name: 'Realised P&L', ours: null, broker: latestNav.realized, break: null, tolerance: 0, ok: false,
      detail: 'the statement reports realised P&L but no trade rows were imported — re-run the Flex query with the Trades section enabled' })
  } else if (caRows.length > 0 && caRows.some((c) => caRate(c) === null)) {
    add({ name: 'Realised P&L', ours: null, broker: null, break: null, tolerance: 0, ok: false,
      detail: `${caRows.length} corporate action(s) realised money that could not be valued in the base currency` })
  } else if (brokerRows.length > 0 || closures.length > 0 || caRows.length > 0) {
    if (unconvertible > 0) {
      add({ name: 'Realised P&L', ours: null, broker: null, break: null, tolerance: 0, ok: false,
        detail: `${unconvertible} row(s) could not be valued in the base currency, so realised P&L cannot be compared` })
    } else if (brokerClosingRows.length > 0 && closures.length === 0) {
      // Every close failed to match an opening lot (history starting mid-position). The book has no
      // realised P&L of its own, so skipping the check would certify a book that never verified one.
      // Note this fires on CLOSING rows only: an opening-only account reports zeros on both sides and
      // falls through to the ordinary comparison below, which passes, as it should.
      add({ name: 'Realised P&L', ours: 0, broker: brokerRows.reduce((a, t) => a + realisedBase(t), 0),
        break: null, tolerance: 0, ok: false,
        detail: 'the statement reports realised trades but no close matched an opening lot — the imported history starts too late' })
    } else {
      const caRealised = caRows.reduce((a, c) => a + c.fifoPnlRealized! * caRate(c)!, 0)
      const theirs = brokerRows.reduce((a, t) => a + realisedBase(t), 0) + caRealised
      const ours = closures.reduce((a, c) => a + c.realizedBase!, 0) + caRealised
      cmp('Realised P&L', ours, theirs, Math.max(1, Math.abs(theirs) * 0.001),
        'Our FIFO matching against the statement\u2019s own fifoPnlRealized, both in the base currency')
    }
  }

  // 5. Our derived lots against the broker's position snapshot. This is what catches a history that
  //    starts after a position was opened, or an opening execution the query never returned.
  //    Gated on the SECTION being present, not on the snapshot being non-empty: an empty OpenPositions
  //    section is a positive statement that the account is flat, and requiring at least one row would
  //    skip the check exactly when our lots disagree most — the broker says nothing is held and the FIFO
  //    engine still shows open lots.
  // Gated on the document the positions actually CAME from, not on the newest one — otherwise a
  // Trades-only newest export both empties the snapshot and quietly drops the check that would have
  // caught it.
  const positionsSection = docs.some((d) => d.sectionsPresent.includes('OpenPositions'))
  if (positionsSection || positions.length > 0) {
    const held = new Map<string, number>()
    for (const p of positions) if (p.quantity !== null) held.set(positionKey(p), p.quantity)
    const derived = new Map<string, number>()
    for (const l of openLots) derived.set(l.key, (derived.get(l.key) ?? 0) + l.quantity)
    let worst = 0
    for (const key of new Set([...held.keys(), ...derived.keys()])) {
      worst = Math.max(worst, Math.abs((derived.get(key) ?? 0) - (held.get(key) ?? 0)))
    }
    add({ name: 'Open positions', ours: derived.size, broker: held.size, break: worst, tolerance: EPS,
      ok: worst <= EPS,
      detail: 'Lots rebuilt from trades against the statement\u2019s position snapshot (largest quantity difference)' })
  }

  // 6. Cash we derived against the cash the statement states. A missed type or a duplicate row corrupts
  //    the TWR inputs without touching NAV, so nothing else would notice.
  if (latestNav?.depositsWithdrawals != null) {
    const inWindow = latestNav.fromDate && latestNav.toDate
      ? flows.filter((f) => f.date && f.date >= latestNav.fromDate! && f.date <= latestNav.toDate!)
      : flows
    const ours = inWindow.reduce((a, f) => a + (f.amountBase ?? Number.NaN), 0)
    cmp('Capital flows', Number.isFinite(ours) ? ours : null, latestNav.depositsWithdrawals, 1,
      'Deposits and withdrawals we classified against the statement\u2019s own total')
  }
  // The statement's own dividend and withholding totals cover ITS window, while `income` spans every
  // document — so these two checks compare like with like by taking the same window, exactly as the
  // capital-flows check above already does. They used to be switched off whenever more than one export
  // was loaded, which is the NORMAL state of a book assembled a year at a time: two of the checks
  // silently vanished while the badge still read "Reconciled".
  const windowIncome = incomeBetween(latestNav?.fromDate ?? null, latestNav?.toDate ?? null)
  if (latestNav?.dividends != null) {
    // Gross dividends only. Payment-in-lieu is a separate statement line, and folding it in here would
    // make the check disagree with a perfectly correct statement.
    cmp('Dividends', windowIncome ? windowIncome.dividendsGross : null, latestNav.dividends, 1,
      'Dividend income we classified against the statement\u2019s own total, over that statement\u2019s window')
  }
  if (latestNav?.withholdingTax != null) {
    cmp('Withholding tax', windowIncome ? windowIncome.withholdingTax : null, latestNav.withholdingTax, 1,
      'Withholding we classified against the statement\u2019s own total, over that statement\u2019s window')
  }
  // Interest and fees were published on the Income card and never checked. A cash row the classifier
  // does not recognise is dropped silently, so without these two the displayed income can be wrong with
  // every check green.
  if (latestNav?.interest != null) {
    cmp('Interest', windowIncome ? windowIncome.interest : null, latestNav.interest, 1,
      'Interest we classified against the statement\u2019s own total, over that statement\u2019s window')
  }
  if (latestNav?.otherFees != null) {
    cmp('Fees', windowIncome ? windowIncome.fees : null, latestNav.otherFees, 1,
      'Fees we classified against the statement\u2019s own total, over that statement\u2019s window')
  }

  return { ok: checks.length > 0 && checks.every((c) => c.ok), checks }
}
