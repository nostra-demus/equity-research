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

export interface PeriodReturn {
  label: string
  from: string | null
  to: string | null
  /** Time-weighted, percent. Null when the window holds too little to measure. */
  twr: number | null
  days: number
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

/** Month, quarter, year to date and since inception — each a genuine time-weighted return over its own
 *  window, not a slice of one cumulative figure. */
export function returnsByPeriod(navSeries: NavPoint[], flowsByDate: Map<string, number>): PeriodReturn[] {
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
    for (let i = 0; i < navSeries.length; i++) {
      if (navSeries[i]!.date < from) startIndex = i
      else break
    }
    const slice = navSeries.slice(startIndex)
    return {
      label,
      from: slice.length ? slice[0]!.date : null,
      to: asOf,
      twr: computeTwr(slice, flowsByDate),
      days: Math.max(0, slice.length - 1),
    }
  })
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
  flows: { date: string | null; amountBase: number | null }[],
): number | null {
  if (navSeries.length < 2) return null
  const start = navSeries[0]!
  const end = navSeries[navSeries.length - 1]!
  const t0 = Date.parse(`${start.date}T00:00:00Z`)
  const years = (d: string) => (Date.parse(`${d}T00:00:00Z`) - t0) / (365 * 86_400_000)

  // Opening value is money already in; every flow is money in or out; closing value is money returned.
  const cash: { t: number; amount: number }[] = [{ t: 0, amount: -start.total }]
  for (const f of flows) {
    if (!f.date || f.amountBase === null) continue
    if (f.date < start.date || f.date > end.date) continue
    cash.push({ t: years(f.date), amount: -f.amountBase })
  }
  cash.push({ t: years(end.date), amount: end.total })

  const npv = (rate: number) => cash.reduce((a, c) => a + c.amount / (1 + rate) ** c.t, 0)
  let lo = -0.9999
  let hi = 10
  let fLo = npv(lo)
  let fHi = npv(hi)
  if (!Number.isFinite(fLo) || !Number.isFinite(fHi) || fLo * fHi > 0) return null // no sign change: no solution to find
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
