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
  closeTradeID: string | null
}

export interface BookPosition {
  symbol: string | null
  conid: string | null
  assetCategory: string | null
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
  coverage: { from: string | null; to: string | null; documents: number }
  sectionsPresent: string[]
  sectionsUnmodelled: string[]
  positions: BookPosition[]
  openLots: BookLot[]
  closures: BookClosure[]
  flows: BookFlow[]
  income: BookIncome
  navSeries: NavPoint[]
  twr: number | null
  corporateActions: FlexCorporateAction[]
  reconciliation: Reconciliation
  warnings: string[]
}

// ---------- merge (idempotent) ----------

/** Position identity. `conid` is IBKR's stable contract id and survives a ticker rename; symbol is the
 *  fallback for rows that carry no conid. */
function positionKey(row: { conid: string | null; symbol: string | null }): string {
  return row.conid ? `conid:${row.conid}` : `sym:${row.symbol ?? 'UNKNOWN'}`
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
export function runFifo(trades: FlexTrade[]): { lots: BookLot[]; closures: BookClosure[]; warnings: string[] } {
  const warnings: string[] = []
  const open = new Map<string, BookLot[]>()
  const closures: BookClosure[] = []

  const ordered = [...trades].sort((a, b) => {
    const at = a.dateTime ?? a.tradeDate ?? ''
    const bt = b.dateTime ?? b.tradeDate ?? ''
    if (at !== bt) return at < bt ? -1 : 1
    return (a.tradeID ?? '').localeCompare(b.tradeID ?? '')
  })

  for (const t of ordered) {
    // Only EXECUTION rows are real fills; a SUMMARY row is the same fills aggregated, and counting both
    // would double the book.
    if (t.levelOfDetail && t.levelOfDetail.toUpperCase() !== 'EXECUTION') continue
    const qty = t.quantity
    const price = t.tradePrice
    if (qty === null || qty === 0 || price === null) continue

    const key = positionKey(t)
    const multiplier = t.multiplier ?? 1
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
        const grossLocal = (price - lot.price) * signedMatched * multiplier
        // COMMISSION IS CHARGED ON BOTH LEGS. The broker's fifoPnlRealized is net of the closing
        // commission AND of the opening lot's commission apportioned to the quantity being closed —
        // verified against a real statement, where gross-only left a break of exactly the two shares
        // combined. Commissions arrive negative, so they simply add.
        const openShare = lot.openedQuantityAbs > 0 ? lot.commission * (matched / lot.openedQuantityAbs) : 0
        const closeShare = Math.abs(qty) > 0 ? (t.ibCommission ?? 0) * (matched / Math.abs(qty)) : 0
        const commissionLocal = openShare + closeShare
        const realizedLocal = grossLocal + commissionLocal
        closures.push({
          key,
          symbol: t.symbol ?? lot.symbol,
          assetCategory: t.assetCategory ?? lot.assetCategory,
          currency: t.currency ?? lot.currency,
          quantity: matched,
          entryPrice: lot.price,
          exitPrice: price,
          openedAt: lot.openedAt,
          closedAt: t.dateTime ?? t.tradeDate,
          holdingDays: daysBetween(lot.openedAt, t.dateTime ?? t.tradeDate),
          realizedLocal,
          grossLocal,
          commissionLocal,
          realizedBase: t.fxRateToBase === null ? null : realizedLocal * t.fxRateToBase,
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
        multiplier,
        openedAt: t.dateTime ?? t.tradeDate,
        tradeID: t.tradeID,
        // Only the share of the opening commission belonging to the quantity that actually stays open.
        commission: (t.ibCommission ?? 0) * (Math.abs(remaining) / Math.abs(qty)),
        openedQuantityAbs: Math.abs(remaining),
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
    const landing = dates.find((d) => d >= f.date!)
    if (landing === undefined) continue
    byDate.set(landing, (byDate.get(landing) ?? 0) + (f.amountBase ?? f.amount))
  }
  return byDate
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
      if (best) return entry.rates.get(best) ?? null
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
  const accountIds = new Set(docs.map((d) => d.accountId).filter((a): a is string => !!a))
  if (accountIds.size > 1) {
    warnings.push(`documents span ${accountIds.size} accounts (${[...accountIds].join(', ')}) — a book must be one account`)
  }

  const trades = dropSupersededTrades(dedupeBy(docs.flatMap((d) => d.trades), (t) => t.tradeID ?? t.transactionID))
  const cash = dedupeBy(docs.flatMap((d) => d.cashTransactions), (c) => c.transactionID)
  const corporateActions = dedupeBy(docs.flatMap((d) => d.corporateActions), (c) => c.transactionID ?? c.actionID)

  // The newest document wins for point-in-time state (positions are a snapshot, not a history).
  const newest = [...docs].sort((a, b) => (a.toDate ?? '') < (b.toDate ?? '') ? -1 : 1)[docs.length - 1]!

  // Daily NAV: one row per day across every document, deduped on date, oldest first.
  const navByDate = new Map<string, number>()
  for (const doc of docs) {
    for (const row of doc.equitySummary) {
      if (row.reportDate && row.total !== null) navByDate.set(row.reportDate, row.total)
    }
  }
  const navSeries: NavPoint[] = [...navByDate.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  const { lots, closures, warnings: fifoWarnings } = runFifo(trades)
  warnings.push(...fifoWarnings)

  const baseCurrency =
    newest.changeInNav?.currency
    ?? docs.flatMap((d) => d.equitySummary).find((r) => r.currency !== null)?.currency
    ?? null
  const fx = buildFxResolver(docs, baseCurrency)

  /** The row's own rate first (it is the broker's, for that exact fill), then the statement's rate grid.
   *  Null means we genuinely cannot value it in the base currency. */
  const rateFor = (currency: string | null, rowRate: number | null, date: string | null): number | null =>
    rowRate !== null ? rowRate : fx(currency, date)

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
  for (const c of cash) {
    if (isCapitalFlow(c.type)) continue
    const bucket = classifyIncome(c.type, c.description)
    if (!bucket || c.amount === null) continue
    const rate = rateFor(c.currency, c.fxRateToBase, c.dateTime ? c.dateTime.slice(0, 10) : c.settleDate)
    if (rate === null) {
      // Adding a foreign amount straight into a base-currency total is how a EUR 1,000 dividend becomes
      // USD 1,000. Excluding it and saying so is the only honest option.
      warnings.push(`${c.type ?? 'a cash transaction'} in ${c.currency ?? 'an unknown currency'} could not be valued in ${baseCurrency ?? 'the base currency'} — it is excluded from income`)
      continue
    }
    income[bucket] += c.amount * rate
  }
  income.net = income.dividendsGross + income.paymentInLieu + income.interest + income.withholdingTax + income.fees

  const positions: BookPosition[] = newest.openPositions
    .filter((p) => !p.levelOfDetail || p.levelOfDetail.toUpperCase() === 'SUMMARY')
    .map((p) => ({
      symbol: p.symbol,
      conid: p.conid,
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
  const twr = computeTwr(navSeries, flowsByDate)

  return {
    accountId: newest.accountId,
    baseCurrency,
    asOf: navSeries.length ? navSeries[navSeries.length - 1]!.date : newest.toDate,
    coverage: {
      from: docs.map((d) => d.fromDate).filter(Boolean).sort()[0] ?? null,
      to: docs.map((d) => d.toDate).filter(Boolean).sort().reverse()[0] ?? null,
      documents: docs.length,
    },
    sectionsPresent: [...new Set(docs.flatMap((d) => d.sectionsPresent))].sort(),
    sectionsUnmodelled: [...new Set(docs.flatMap((d) => d.sectionsUnmodelled))].sort(),
    positions,
    openLots: lots,
    closures,
    flows,
    income,
    navSeries,
    twr,
    corporateActions,
    reconciliation: reconcile(docs, navSeries, twr, closures, trades),
    warnings,
  }
}

/** Futures and options carry NOTIONAL, not a NAV allocation — a 3-lot gold future is ~$776k of exposure
 *  against ~$29k of margin. Weighting them like equity overstates NAV and every other weight with it. */
function isDerivativeCategory(assetCategory: string | null): boolean {
  const c = (assetCategory ?? '').toUpperCase()
  return c === 'FUT' || c === 'OPT' || c === 'FOP' || c === 'CFD' || c === 'FSOPT'
}

// ---------- reconciliation ----------

/** The trust anchor. Every number in the book is derived; these checks are what prove the derivation.
 *  A break is reported, never hidden — and any failing check makes the whole book un-reconciled. */
export function reconcile(
  docs: FlexDocument[],
  navSeries: NavPoint[],
  ourTwr: number | null,
  closures: BookClosure[],
  /** The DEDUPED, superseded-dropped trades the closures were actually built from. Summing the raw
   *  union instead doubles the broker side on any overlapping re-import, so a book that reconciles
   *  from one file reports a huge break from two — the exact case dedup exists to make safe. */
  tradesForRealized: FlexTrade[],
): Reconciliation {
  const checks: ReconciliationCheck[] = []
  // Newest by toDate, NOT by argument order — callers may pass documents in any order, and picking the
  // last argument produced spurious NAV breaks on perfectly consistent data.
  const nav = [...docs]
    .filter((d) => d.changeInNav !== null)
    .sort((a, b) => ((a.toDate ?? '') < (b.toDate ?? '') ? -1 : 1))
    .map((d) => d.changeInNav!)
  const latestNav = nav.length ? nav[nav.length - 1]! : null

  // 1. NAV: the statement's ending value against the last day of its own daily series.
  const lastPoint = navSeries.length ? navSeries[navSeries.length - 1]! : null
  if (latestNav?.endingValue != null && lastPoint) {
    const diff = lastPoint.total - latestNav.endingValue
    checks.push({
      name: 'Net asset value',
      ours: lastPoint.total,
      broker: latestNav.endingValue,
      break: diff,
      tolerance: 1,
      ok: Math.abs(diff) <= 1,
      detail: 'Last day of the daily series against the statement’s ending value',
    })
  }

  // 2. The NAV bridge identity: starting value plus every component must equal the ending value.
  if (latestNav?.startingValue != null && latestNav.endingValue != null) {
    const components = [
      latestNav.realized, latestNav.changeInUnrealized, latestNav.mtm, latestNav.dividends,
      latestNav.withholdingTax, latestNav.interest, latestNav.commissions, latestNav.otherFees,
      latestNav.depositsWithdrawals, latestNav.fxTranslation,
      latestNav.changeInDividendAccruals, latestNav.changeInInterestAccruals,
    ].filter((v): v is number => v !== null)
    const rebuilt = latestNav.startingValue + components.reduce((a, b) => a + b, 0)
    const diff = rebuilt - latestNav.endingValue
    checks.push({
      name: 'NAV bridge',
      ours: rebuilt,
      broker: latestNav.endingValue,
      break: diff,
      tolerance: 1,
      ok: Math.abs(diff) <= 1,
      detail: 'Starting value plus every stated component should rebuild the ending value',
    })
  }

  // 3. Return: ours against the statement's own time-weighted return.
  if (latestNav?.twr != null && ourTwr !== null && docs.length === 1) {
    const diff = ourTwr - latestNav.twr
    checks.push({
      name: 'Time-weighted return',
      ours: ourTwr,
      broker: latestNav.twr,
      break: diff,
      tolerance: 0.05,
      ok: Math.abs(diff) <= 0.05,
      detail: 'Daily-chained return with flows removed, against the statement’s twr (percentage points)',
    })
  }

  // 4. Realised P&L: our FIFO matching against the broker's own per-trade figure.
  const brokerRealized = tradesForRealized
    .filter((t) => !t.levelOfDetail || t.levelOfDetail.toUpperCase() === 'EXECUTION')
    .map((t) => t.fifoPnlRealized)
    .filter((v): v is number => v !== null)
  if (brokerRealized.length > 0 && closures.length > 0) {
    const theirs = brokerRealized.reduce((a, b) => a + b, 0)
    const ours = closures.reduce((a, c) => a + c.realizedLocal, 0)
    const diff = ours - theirs
    const tolerance = Math.max(1, Math.abs(theirs) * 0.001)
    checks.push({
      name: 'Realised P&L',
      ours,
      broker: theirs,
      break: diff,
      tolerance,
      ok: Math.abs(diff) <= tolerance,
      detail: 'Our FIFO matching against the statement’s own fifoPnlRealized',
    })
  }

  return { ok: checks.length > 0 && checks.every((c) => c.ok), checks }
}
