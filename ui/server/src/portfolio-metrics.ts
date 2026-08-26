// Returns and risk for the fund book. Pure maths — a NAV series and its flows in, numbers out.
//
// THE RULE THAT SHAPES EVERY FUNCTION HERE: a number that cannot be computed honestly is returned as
// null, and the caller says so. A ratio invented from six weeks of data is worse than a blank, because
// a blank is obviously missing while a number is quietly believed.
//
// Two conventions worth stating, because they are the ones people disagree about:
//
//  · RETURN IS TIME-WEIGHTED and flows are removed, so the figure measures decisions rather than when
//    the LP happened to add capital. Money-weighted (IRR) is reported ALONGSIDE it, never instead —
//    it answers a different question (what the investor actually earned) and the gap between them is
//    itself information.
//
//  · RATIOS ARE BUILT FROM DAILY RETURNS, not from an annualised cumulative. Sharpe is
//    mean(excess daily) / stdev(daily) x sqrt(252) — which is standard, and which crucially does NOT
//    extrapolate a short history into a full year the way `(1+r)^(365/days)` does. A seven-month book
//    that returned 18% has not returned 31% annualised in any meaningful sense, and reporting that it
//    has is how a young track record flatters itself.

import { computeTwr, type NavPoint } from './portfolio'

const TRADING_DAYS = 252

/** Below this many daily observations the ratios are too noisy to state at all. One quarter. */
export const MIN_RATIO_DAYS = 60
/** Longest gap between two feed closes still treated as one step. Wider than a long weekend plus a
 *  public holiday, narrow enough that a missing week is caught rather than compounded into a month. */
const MAX_FEED_GAP_DAYS = 7

export interface PeriodReturn {
  label: string
  from: string | null
  to: string | null
  /** Time-weighted, percent. Null when the window holds too little to measure. */
  twr: number | null
  days: number
  /** What cash would have returned over the SAME window, and the book's margin over it. The second
   *  yardstick: beating an index while trailing a deposit account is not a result. */
  hurdle: number | null
  overHurdle: number | null
  /** True when the book has no valued day at or before this period's start, so the window is shorter
   *  than the label implies — a "year to date" on a book that only began in April. */
  partial: boolean
  /** The index over the SAME measured window, percent, and the book's margin over it. Null where the
   *  feed does not cover the window cleanly — never a figure chained across a hole. */
  benchmark: number | null
  excess: number | null
}

export interface DrawdownRead {
  /** Deepest peak-to-trough fall, percent (negative). */
  depth: number | null
  peakDate: string | null
  troughDate: string | null
  /** The day it regained the previous peak, or null if it never has. */
  recoveredDate: string | null
  /** Calendar days from peak to trough. */
  toTroughDays: number | null
  /** Calendar days from peak until recovery — null while still under water. */
  underWaterDays: number | null
  /** How many distinct falls exceeded 3%. */
  episodesOver3pct: number
}

export interface RiskRead {
  /** Daily observations the ratios rest on. */
  sampleDays: number
  /** False when the sample is too short to state ratios — the caller must show blanks, not numbers. */
  sufficient: boolean
  /** Annualised standard deviation of daily returns, percent. */
  volatility: number | null
  sharpe: number | null
  /** Sortino: the same shape as Sharpe but counting only downside deviation. */
  sortino: number | null
  drawdown: DrawdownRead
  /** Period return divided by the worst fall. NOT annualised — see the header. */
  calmar: number | null
}

export interface BenchmarkRead {
  symbol: string
  /** Benchmark return over the same window, percent. */
  benchmarkTwr: number | null
  /** Book minus benchmark, in percentage points. */
  excess: number | null
  from: string | null
  to: string | null
  /** Why the comparison is unavailable, when it is. Never left silently blank. */
  unavailable: string | null
}

// ---------- daily returns ----------

/** The flow-adjusted daily return series the ratios are built from. A day whose opening base is zero or
 *  negative contributes nothing rather than an enormous number — that day is a funding event, not
 *  performance. */
export function dailyReturns(navSeries: NavPoint[], flowsByDate: Map<string, number>): { date: string; r: number }[] {
  const out: { date: string; r: number }[] = []
  for (let i = 1; i < navSeries.length; i++) {
    const prev = navSeries[i - 1]!
    const curr = navSeries[i]!
    const base = prev.total + (flowsByDate.get(curr.date) ?? 0)
    if (base <= 0) continue
    out.push({ date: curr.date, r: curr.total / base - 1 })
  }
  return out
}

/** The stretch of the series the return is ACTUALLY measured over: from the last point before the first
 *  day that had capital, to the end.
 *
 *  This exists for the benchmark. A Flex export carries a NAV row for every calendar day of the query,
 *  including the months before the account was funded — on a real book, 262 points of which only 98 were
 *  valued. `computeTwr` correctly skips the unfunded days, so the book's return covers the 98. Handing
 *  the benchmark the full 262 would measure the index over eight months and the book over three and call
 *  the difference "excess", which is exactly the mismatched-window comparison the module refuses to make
 *  when the FEED is short. The rule has to hold in both directions. */
export function measuredWindow(navSeries: NavPoint[], flowsByDate: Map<string, number>): NavPoint[] {
  for (let i = 1; i < navSeries.length; i++) {
    const prev = navSeries[i - 1]!
    if (prev.total + (flowsByDate.get(navSeries[i]!.date) ?? 0) <= 0) continue
    // Where the capital was ALREADY there, the window opens on that prior close — its move to the next
    // day is real performance. Where the day only became measurable because money arrived that morning,
    // it opens on the funding day itself: that day's own return is zero by construction (money in, no
    // time), so charging the index with it would compare the book against a day it did not trade.
    return navSeries.slice(prev.total > 0 ? i - 1 : i)
  }
  return []
}

function mean(xs: number[]): number { return xs.reduce((a, b) => a + b, 0) / xs.length }

function stdev(xs: number[]): number | null {
  if (xs.length < 2) return null
  const m = mean(xs)
  // Sample standard deviation (n-1): these are a sample of the strategy's behaviour, not a population.
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1))
}

// ---------- returns by period ----------

function startOfMonth(d: string): string { return `${d.slice(0, 7)}-01` }
function startOfQuarter(d: string): string {
  const q = Math.floor((Number(d.slice(5, 7)) - 1) / 3) * 3 + 1
  return `${d.slice(0, 4)}-${String(q).padStart(2, '0')}-01`
}
function startOfYear(d: string): string { return `${d.slice(0, 4)}-01-01` }

/** The index chained over one explicit window, on the SAME days the book is measured over. Returns
 *  null rather than a number whenever the feed cannot carry the window honestly: no step at all, a
 *  non-positive close, or a hole wider than a long weekend. Chained (not first-close-to-last-close) so
 *  a window return can never disagree with the months inside it. */
function benchmarkOverWindow(
  benchmarkCloses: { date: string; close: number }[],
  from: string,
  to: string,
): number | null {
  const sorted = [...benchmarkCloses].sort((a, b) => a.date.localeCompare(b.date))
  let chain = 1
  let steps = 0
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!, curr = sorted[i]!
    // The step's own START must sit inside the window: a step reaching in from before it would credit
    // the index with a move the book was never exposed to.
    if (prev.date < from || curr.date > to) continue
    const gapDays = (Date.parse(`${curr.date}T00:00:00Z`) - Date.parse(`${prev.date}T00:00:00Z`)) / 86_400_000
    if (prev.close <= 0 || gapDays > MAX_FEED_GAP_DAYS) return null
    chain *= curr.close / prev.close
    steps++
  }
  return steps === 0 ? null : (chain - 1) * 100
}

/** Month, quarter, year to date and since inception — each a genuine time-weighted return over its own
 *  window, not a slice of one cumulative figure. */
export function returnsByPeriod(
  navSeries: NavPoint[],
  flowsByDate: Map<string, number>,
  riskFreeAnnualPct = 0,
  benchmarkCloses: { date: string; close: number }[] = [],
): PeriodReturn[] {
  if (navSeries.length === 0) return []
  const asOf = navSeries[navSeries.length - 1]!.date
  const windows: { label: string; from: string }[] = [
    { label: 'Month to date', from: startOfMonth(asOf) },
    { label: 'Quarter to date', from: startOfQuarter(asOf) },
    { label: 'Year to date', from: startOfYear(asOf) },
    { label: 'Since inception', from: navSeries[0]!.date },
  ]
  return windows.map(({ label, from }) => {
    // The window must OPEN on the last point at or before `from`: a return measured from the first
    // point inside the window silently discards that window's first day of performance.
    let startIndex = 0
    let reachesBoundary = false
    for (let i = 0; i < navSeries.length; i++) {
      if (navSeries[i]!.date < from) { startIndex = i; reachesBoundary = true }
      else { if (navSeries[i]!.date === from) reachesBoundary = true; break }
    }
    const slice = navSeries.slice(startIndex)
    const twr = computeTwr(slice, flowsByDate)
    // The hurdle accrues over CALENDAR days, not trading days: cash pays on weekends too.
    const spanDays = slice.length >= 2
      ? Math.max(0, (Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${slice[0]!.date}T00:00:00Z`)) / 86_400_000)
      : 0
    const hurdle = spanDays > 0 ? ((1 + riskFreeAnnualPct / 100) ** (spanDays / 365) - 1) * 100 : null
    const benchmark = slice.length >= 2
      ? benchmarkOverWindow(benchmarkCloses, slice[0]!.date, asOf)
      : null
    return {
      label,
      from: slice.length ? slice[0]!.date : null,
      to: asOf,
      twr,
      benchmark,
      excess: twr === null || benchmark === null ? null : twr - benchmark,
      days: Math.max(0, slice.length - 1),
      hurdle,
      overHurdle: twr === null || hurdle === null ? null : twr - hurdle,
      // No valued day at or before this period's own start, so the figure covers less than its name
      // claims. Kept — the return is real and the window is printed beside it — but MARKED, because
      // four rows showing the same number under four period names is how a reader concludes that one of
      // them must mean something else.
      partial: !reachesBoundary && label !== 'Since inception',
    }
  })
}

// ---------- monthly ----------

export interface MonthRow {
  /** `YYYY-MM`. */
  month: string
  /** Time-weighted book return for the month, percent. */
  book: number | null
  /** Benchmark return over the same month, percent — null where the feed does not cover it. */
  benchmark: number | null
}

/** Month by month, book against benchmark. Built by compounding the SAME daily return series every
 *  other figure rests on, so a month can never disagree with the period return that contains it. */
export function monthlyReturns(
  navSeries: NavPoint[],
  flowsByDate: Map<string, number>,
  benchmarkCloses: { date: string; close: number }[] = [],
): MonthRow[] {
  const book = dailyReturns(navSeries, flowsByDate)
  const byMonth = new Map<string, number>()
  for (const { date, r } of book) {
    const m = date.slice(0, 7)
    byMonth.set(m, (byMonth.get(m) ?? 1) * (1 + r))
  }
  // THE SAME DAYS, on both sides. The book's first month is almost always partial — it starts on the
  // day capital arrived — while the feed carries the whole month, so an unrestricted index chain
  // credited the index with days the book never held anything. On the real book that read as April:
  // book 0.00% against index 10.42%, eight of those days before the fund was funded at all.
  const firstBookDay = book.length ? book[0]!.date : null
  const lastBookDay = book.length ? book[book.length - 1]!.date : null
  // The benchmark is bucketed the SAME way the book is: by chaining daily returns under the date the
  // return lands on, not by comparing the first and last price inside the month. Those are not the same
  // thing — a month's first daily return spans the turn from the previous month, which the book keeps
  // and a first-price-to-last-price reading throws away. Measured the other way, every month would
  // understate the index against a book that included that move.
  const bmByMonth = new Map<string, number>()
  const suspect = new Set<string>()
  const sorted = [...benchmarkCloses].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!, curr = sorted[i]!
    // The step's OWN START must be inside the book's life, not merely its end. Testing only `curr`
    // still admitted the one step that reaches from before the fund existed INTO its first day — on the
    // real book, the index's whole first week of April against a fund that had no capital in it.
    if (firstBookDay === null || prev.date < firstBookDay || curr.date > lastBookDay!) continue
    const m = curr.date.slice(0, 7)
    // A hole in the feed would otherwise dump a multi-week move into whichever month happens to carry
    // the next close. A month built across one is reported as unavailable, not as a number.
    const gapDays = (Date.parse(`${curr.date}T00:00:00Z`) - Date.parse(`${prev.date}T00:00:00Z`)) / 86_400_000
    if (prev.close <= 0 || gapDays > MAX_FEED_GAP_DAYS) { suspect.add(m); continue }
    bmByMonth.set(m, (bmByMonth.get(m) ?? 1) * (curr.close / prev.close))
  }
  return [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, chain]) => {
      const bm = bmByMonth.get(month)
      return {
        month,
        book: (chain - 1) * 100,
        benchmark: bm === undefined || suspect.has(month) ? null : (bm - 1) * 100,
      }
    })
}

// ---------- beta and alpha ----------

export interface BetaAlpha {
  /** How much of the index's movement the book takes on. Null without enough paired days. */
  beta: number | null
  /** Annualised return beyond what that beta explains, percentage points. */
  alpha: number | null
  /** Days on which BOTH series have a return — the pairing the regression actually used. */
  pairedDays: number
}

/** Regress the book on the index over the days both actually moved.
 *
 *  Pairing matters more than it looks: the book has a NAV row every day the account was valued, the
 *  feed only has trading days for its own market, and a holiday on one side is not a zero-return day on
 *  the other. Treating a missing day as flat drags beta toward zero and invents alpha out of the gap. */
export function betaAlpha(
  bookReturns: { date: string; r: number }[],
  benchmarkCloses: { date: string; close: number }[],
  riskFreeAnnualPct: number,
): BetaAlpha {
  const sorted = [...benchmarkCloses].sort((a, b) => a.date.localeCompare(b.date))
  const bmReturns = new Map<string, number>()
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!, curr = sorted[i]!
    if (prev.close <= 0) continue
    // A HOLE IN THE FEED IS NOT A DAY'S MOVE. Without this, a month-long gap becomes one "daily" index
    // return of a month's magnitude, paired against a single book day — which drags beta toward that
    // one pair and invents alpha out of the residual. The monthly table already refuses such a step;
    // the regression must refuse it on the same terms or the two disagree about the same feed.
    const gapDays = (Date.parse(`${curr.date}T00:00:00Z`) - Date.parse(`${prev.date}T00:00:00Z`)) / 86_400_000
    if (gapDays > MAX_FEED_GAP_DAYS) continue
    bmReturns.set(curr.date, curr.close / prev.close - 1)
  }
  const pairs = bookReturns
    .filter((b) => bmReturns.has(b.date))
    .map((b) => ({ rb: b.r, rm: bmReturns.get(b.date)! }))
  if (pairs.length < MIN_RATIO_DAYS) return { beta: null, alpha: null, pairedDays: pairs.length }

  const mb = pairs.reduce((a, p) => a + p.rb, 0) / pairs.length
  const mm = pairs.reduce((a, p) => a + p.rm, 0) / pairs.length
  const varM = pairs.reduce((a, p) => a + (p.rm - mm) ** 2, 0) / (pairs.length - 1)
  if (varM <= 0) return { beta: null, alpha: null, pairedDays: pairs.length }
  const cov = pairs.reduce((a, p) => a + (p.rb - mb) * (p.rm - mm), 0) / (pairs.length - 1)
  const beta = cov / varM
  const rfDaily = riskFreeAnnualPct / 100 / TRADING_DAYS
  const alphaDaily = mb - rfDaily - beta * (mm - rfDaily)
  return { beta, alpha: alphaDaily * TRADING_DAYS * 100, pairedDays: pairs.length }
}

// ---------- money-weighted ----------

/** Internal rate of return over the actual cash flows (XIRR).
 *
 *  THIS FIGURE IS ANNUALISED and the time-weighted figure beside it is CUMULATIVE — they are not
 *  comparable and must never be shown as though they were. XIRR is a rate per year by construction;
 *  there is no un-annualised form of it. On a book only a few months old the two can differ by several
 *  times purely from that, which is why every caller labels this one "annualised" out loud.
 *
 *  What it is for: unlike the time-weighted figure it does NOT remove the timing of capital, so it
 *  answers what the investor actually earned rather than how the decisions performed.
 *
 *  Solved by bisection rather than Newton — slower, but it cannot diverge, and a return that
 *  occasionally explodes is worse than one that takes a few more iterations. */
export function moneyWeightedReturn(
  navSeries: NavPoint[],
  flowsByDate: Map<string, number>,
): number | null {
  if (navSeries.length < 2) return null
  const start = navSeries[0]!
  const end = navSeries[navSeries.length - 1]!
  const t0 = Date.parse(`${start.date}T00:00:00Z`)
  const years = (d: string) => (Date.parse(`${d}T00:00:00Z`) - t0) / (365 * 86_400_000)

  // Opening value is money already in; every flow is money in or out; closing value is money returned.
  //
  // THE FLOWS MUST BE THE ALIGNED MAP, not the raw dated list — the same one every other figure here
  // uses. Two reasons, and each on its own gives a wrong answer:
  //  · A NAV row is the END-of-day value, so it ALREADY contains a flow dated that day. Counting a
  //    deposit on the opening row as a separate contribution charges the book for that money twice.
  //  · A flow on a day with no NAV row (a weekend deposit) is not in the opening value at all, and its
  //    own date can sit outside the series entirely — raw dates dropped it silently. Alignment moves it
  //    to the next valued day, which is exactly the NAV that absorbs it.
  const cash: { t: number; amount: number }[] = [{ t: 0, amount: -start.total }]
  for (const [date, amount] of flowsByDate) {
    if (date <= start.date || date > end.date) continue // on or before the opening row: already inside it
    cash.push({ t: years(date), amount: -amount })
  }
  cash.push({ t: years(end.date), amount: end.total })

  const npv = (rate: number) => cash.reduce((a, c) => a + c.amount / (1 + rate) ** c.t, 0)
  let lo = -0.9999
  let fLo = npv(lo)
  if (!Number.isFinite(fLo)) return null
  // WIDEN THE BRACKET UNTIL IT ACTUALLY BRACKETS. A fixed ceiling of 1,000%/yr returns null for exactly
  // the case this figure exists to describe — a young book with a strong return annualises enormously
  // (+50% over three weeks is several thousand percent a year) — and the screen renders that as "no
  // money-weighted return exists" rather than a big number. Doubling is bounded (40 rounds reach ~10^13)
  // and bisection still cannot diverge.
  let hi = 10
  let fHi = npv(hi)
  for (let i = 0; i < 40 && Number.isFinite(fHi) && fLo * fHi > 0; i++) {
    hi *= 2
    fHi = npv(hi)
  }
  if (!Number.isFinite(fHi) || fLo * fHi > 0) return null // genuinely no sign change: no solution to find
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const fMid = npv(mid)
    if (!Number.isFinite(fMid)) return null
    if (fLo * fMid <= 0) { hi = mid; fHi = fMid } else { lo = mid; fLo = fMid }
    if (Math.abs(hi - lo) < 1e-10) break
  }
  return ((lo + hi) / 2) * 100
}

// ---------- drawdown ----------

/** Distance below the previous high, day by day — the honest measure of what holding it felt like. */
export function drawdown(navSeries: NavPoint[], flowsByDate: Map<string, number>): DrawdownRead {
  const empty: DrawdownRead = {
    depth: null, peakDate: null, troughDate: null, recoveredDate: null,
    toTroughDays: null, underWaterDays: null, episodesOver3pct: 0,
  }
  const returns = dailyReturns(navSeries, flowsByDate)
  if (returns.length === 0) return empty

  // Drawdown must be measured on the FLOW-ADJUSTED index, not on raw NAV: a withdrawal lowers NAV
  // without being a loss, and reading it as one manufactures a drawdown nobody experienced.
  let index = 1
  const curve: { date: string; value: number }[] = [{ date: navSeries[0]!.date, value: 1 }]
  for (const { date, r } of returns) { index *= 1 + r; curve.push({ date, value: index }) }

  let peak = curve[0]!
  let worst = { depth: 0, peakDate: peak.date, troughDate: peak.date }
  let episodes = 0
  let inEpisode = false
  for (const point of curve) {
    if (point.value >= peak.value) {
      peak = point
      inEpisode = false
      continue
    }
    const depth = point.value / peak.value - 1
    if (depth <= -0.03 && !inEpisode) { episodes++; inEpisode = true }
    if (depth < worst.depth) worst = { depth, peakDate: peak.date, troughDate: point.date }
  }
  if (worst.depth === 0) return { ...empty, episodesOver3pct: 0 }

  const peakValue = curve.find((p) => p.date === worst.peakDate)?.value ?? 1
  const recovered = curve.find((p) => p.date > worst.troughDate && p.value >= peakValue)?.date ?? null
  const days = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
  return {
    depth: worst.depth * 100,
    peakDate: worst.peakDate,
    troughDate: worst.troughDate,
    recoveredDate: recovered,
    toTroughDays: days(worst.peakDate, worst.troughDate),
    underWaterDays: recovered ? days(worst.peakDate, recovered) : null,
    episodesOver3pct: episodes,
  }
}

// ---------- risk ----------

/** Sharpe, Sortino, volatility and drawdown. `riskFreeAnnualPct` is the cash hurdle the excess is
 *  measured against. Every ratio is null when the sample is too short to state one. */
export function riskMetrics(
  navSeries: NavPoint[],
  flowsByDate: Map<string, number>,
  riskFreeAnnualPct: number,
): RiskRead {
  const returns = dailyReturns(navSeries, flowsByDate).map((x) => x.r)
  const dd = drawdown(navSeries, flowsByDate)
  const sufficient = returns.length >= MIN_RATIO_DAYS
  const sd = stdev(returns)
  if (!sufficient || sd === null || sd === 0) {
    return { sampleDays: returns.length, sufficient, volatility: null, sharpe: null, sortino: null, drawdown: dd, calmar: null }
  }
  const rfDaily = riskFreeAnnualPct / 100 / TRADING_DAYS
  const excess = returns.map((r) => r - rfDaily)
  const volatility = sd * Math.sqrt(TRADING_DAYS) * 100
  const sharpe = (mean(excess) / sd) * Math.sqrt(TRADING_DAYS)

  // Downside deviation: only returns BELOW the hurdle contribute. Divided by the full sample size, not
  // by the count of down days — dividing by the down-day count rewards a book simply for having few of
  // them, which is the opposite of what the ratio is for.
  const below = returns.map((r) => Math.min(0, r - rfDaily))
  const downside = Math.sqrt(below.reduce((a, x) => a + x * x, 0) / returns.length)
  const sortino = downside > 0 ? (mean(excess) / downside) * Math.sqrt(TRADING_DAYS) : null

  const periodTwr = computeTwr(navSeries, flowsByDate)
  const calmar = periodTwr !== null && dd.depth !== null && dd.depth < 0 ? periodTwr / Math.abs(dd.depth) : null
  return { sampleDays: returns.length, sufficient, volatility, sharpe, sortino, drawdown: dd, calmar }
}

// ---------- benchmark ----------

/** Compare the book against an index over the SAME window. The benchmark series is whatever the market
 *  feed holds; when it does not cover the window the comparison is reported unavailable with a reason,
 *  never quietly computed over a shorter span that would flatter or punish the book. */
export function benchmarkCompare(
  symbol: string,
  bookTwr: number | null,
  navSeries: NavPoint[],
  benchmarkCloses: { date: string; close: number }[],
): BenchmarkRead {
  const base: BenchmarkRead = { symbol, benchmarkTwr: null, excess: null, from: null, to: null, unavailable: null }
  if (navSeries.length < 2) return { ...base, unavailable: 'the book has no measurable window yet' }
  const from = navSeries[0]!.date
  const to = navSeries[navSeries.length - 1]!.date
  if (benchmarkCloses.length === 0) {
    return { ...base, from, to, unavailable: `no ${symbol} price history has been loaded` }
  }
  const inWindow = benchmarkCloses.filter((c) => c.date >= from && c.date <= to).sort((a, b) => a.date.localeCompare(b.date))
  if (inWindow.length < 2) {
    return { ...base, from, to, unavailable: `the ${symbol} history does not cover ${from} to ${to}` }
  }
  const first = inWindow[0]!
  const last = inWindow[inWindow.length - 1]!
  // COUNTING CLOSES IS NOT COVERAGE. A feed holding two months of an eight-month window passes a count
  // test with dozens of rows, and the excess column then subtracts a two-month index return from an
  // eight-month book return and calls the difference outperformance. Both ENDS have to be reached.
  const apart = (a: string, b: string) => Math.abs(Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000
  if (apart(from, first.date) > MAX_FEED_GAP_DAYS || apart(last.date, to) > MAX_FEED_GAP_DAYS) {
    return {
      ...base, from, to,
      unavailable: `the ${symbol} history covers ${first.date} to ${last.date}, not the book\u2019s ${from} to ${to}`,
    }
  }
  if (first.close <= 0) return { ...base, from, to, unavailable: `${symbol} has no usable opening price` }
  const benchmarkTwr = (last.close / first.close - 1) * 100
  return {
    symbol,
    benchmarkTwr,
    excess: bookTwr === null ? null : bookTwr - benchmarkTwr,
    from: first.date,
    to: last.date,
    unavailable: null,
  }
}
