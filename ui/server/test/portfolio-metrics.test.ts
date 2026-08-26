// Returns and risk. Every expectation here is hand-computable, and the cases that matter most are the
// ones where the honest answer is NO answer: too short a sample, a benchmark that does not cover the
// window, a series with no measurable return. A ratio invented from thin data is worse than a blank.
// Run: npx tsx test/portfolio-metrics.test.ts
import assert from 'node:assert/strict'
import {
  benchmarkCompare, betaAlpha, dailyReturns, drawdown, measuredWindow, monthlyReturns, moneyWeightedReturn,
  returnsByPeriod, riskMetrics, MIN_RATIO_DAYS,
} from '../src/portfolio-metrics'
import type { NavPoint } from '../src/portfolio'

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps

/** A deterministic series: `days` observations compounding at exactly `daily`, from 2026-01-01. */
function series(days: number, daily: number, start = 1000): NavPoint[] {
  const out: NavPoint[] = []
  let v = start
  const d = new Date(Date.UTC(2026, 0, 1))
  for (let i = 0; i < days; i++) {
    out.push({ date: d.toISOString().slice(0, 10), total: v })
    v *= 1 + daily
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return out
}

// ---------- daily returns ----------
check('a funding day contributes no return rather than an enormous one', () => {
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 0 }, { date: '2026-01-02', total: 5000 }, { date: '2026-01-03', total: 5500 }]
  const r = dailyReturns(nav, new Map([['2026-01-02', 5000]]))
  // The funding day opens with a base of 0+5000 and returns 0; only the second day is performance.
  assert.equal(r.length, 2)
  assert.ok(near(r[0]!.r, 0))
  assert.ok(near(r[1]!.r, 0.1))
})

// ---------- returns by period ----------
check('each period window opens on the last point BEFORE it, not the first point inside', () => {
  // Otherwise the window silently discards its own first day of performance.
  const nav: NavPoint[] = [
    { date: '2026-01-30', total: 100 },
    { date: '2026-01-31', total: 100 },
    { date: '2026-02-02', total: 110 },
    { date: '2026-02-03', total: 121 },
  ]
  const mtd = returnsByPeriod(nav, new Map()).find((p) => p.label === 'Month to date')!
  assert.equal(mtd.from, '2026-01-31', 'February must be measured from the 31 Jan close')
  assert.ok(near(mtd.twr!, 21, 1e-9), `100 → 121 is +21%, got ${mtd.twr}`)
})

check('since inception spans the whole series', () => {
  const nav = series(5, 0.01)
  const itd = returnsByPeriod(nav, new Map()).find((p) => p.label === 'Since inception')!
  assert.equal(itd.from, '2026-01-01')
  assert.ok(near(itd.twr!, (1.01 ** 4 - 1) * 100, 1e-9))
})

// ---------- money-weighted ----------
check('IRR of a simple doubling over one year is ~100%', () => {
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 1000 }, { date: '2027-01-01', total: 2000 }]
  const irr = moneyWeightedReturn(nav, new Map())
  assert.ok(irr !== null && Math.abs(irr - 100) < 0.5, `expected ~100%, got ${irr}`)
})

check('IRR rises when capital arrives before the good stretch — the point of reporting it', () => {
  // Same time-weighted path either way; only the timing of the contribution differs.
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 1000 }, { date: '2026-07-01', total: 2100 }, { date: '2027-01-01', total: 4200 }]
  const early = moneyWeightedReturn(nav, new Map([['2026-07-01', 1000]]))
  const none = moneyWeightedReturn(nav, new Map())
  assert.ok(early !== null && none !== null)
  assert.ok(early < none, 'adding capital that must also be earned back lowers the money-weighted rate')
})

check('IRR says null rather than guessing when there is no solution', () => {
  assert.equal(moneyWeightedReturn([{ date: '2026-01-01', total: 100 }], new Map()), null)
  assert.equal(moneyWeightedReturn([], new Map()), null)
})

// ---------- drawdown ----------
check('drawdown is measured on the flow-adjusted index, so a withdrawal is not a loss', () => {
  // NAV falls 1000 → 500 purely because half the money was taken out. That is not a drawdown.
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 1000 }, { date: '2026-01-02', total: 500 }, { date: '2026-01-03', total: 500 }]
  const dd = drawdown(nav, new Map([['2026-01-02', -500]]))
  assert.equal(dd.depth, null, `a pure withdrawal must not read as a fall, got ${dd.depth}`)
})

check('a real fall is measured peak to trough, with recovery dated', () => {
  const nav: NavPoint[] = [
    { date: '2026-01-01', total: 100 },
    { date: '2026-01-02', total: 110 }, // peak
    { date: '2026-01-03', total: 99 },  // trough: -10% from the peak
    { date: '2026-01-04', total: 104.5 },
    { date: '2026-01-05', total: 110 }, // regains the peak
  ]
  const dd = drawdown(nav, new Map())
  assert.ok(near(dd.depth!, -10, 1e-9), `expected -10%, got ${dd.depth}`)
  assert.equal(dd.peakDate, '2026-01-02')
  assert.equal(dd.troughDate, '2026-01-03')
  assert.equal(dd.recoveredDate, '2026-01-05')
  assert.equal(dd.toTroughDays, 1)
  assert.equal(dd.underWaterDays, 3)
  assert.equal(dd.episodesOver3pct, 1)
})

check('a book still under water reports no recovery date rather than a false one', () => {
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 100 }, { date: '2026-01-02', total: 80 }]
  const dd = drawdown(nav, new Map())
  assert.ok(near(dd.depth!, -20, 1e-9))
  assert.equal(dd.recoveredDate, null)
  assert.equal(dd.underWaterDays, null)
})

// ---------- risk ----------
check('a short sample states NO ratios instead of noisy ones', () => {
  const risk = riskMetrics(series(20, 0.001), new Map(), 4.3)
  assert.equal(risk.sufficient, false)
  assert.equal(risk.sharpe, null)
  assert.equal(risk.sortino, null)
  assert.equal(risk.volatility, null)
  assert.ok(risk.sampleDays < MIN_RATIO_DAYS)
})

check('a flat series has no volatility, so it has no Sharpe to state', () => {
  const flat: NavPoint[] = series(200, 0)
  const risk = riskMetrics(flat, new Map(), 4.3)
  assert.equal(risk.sufficient, true)
  assert.equal(risk.sharpe, null, 'zero deviation cannot produce a ratio')
})

check('volatility annualises on the calendar the series is actually observed on', () => {
  // Alternating ±1% on EVERY calendar day: the series really does move 365 times a year, so the daily
  // ~1% deviation annualises at √365 ≈ 19.1%, not at √252.
  //
  // This band used to say ~15.9%, which asserted a trading-day calendar over a series carrying a row per
  // calendar day. A Flex export is calendar-daily (see the note on measuredWindow), so that convention
  // understated annualised volatility by about 17% on every real book.
  const nav: NavPoint[] = []
  let v = 1000
  const d = new Date(Date.UTC(2026, 0, 1))
  for (let i = 0; i < 201; i++) {
    nav.push({ date: d.toISOString().slice(0, 10), total: v })
    v *= i % 2 === 0 ? 1.01 : 1 / 1.01
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const risk = riskMetrics(nav, new Map(), 0)
  assert.ok(risk.volatility !== null && risk.volatility > 17 && risk.volatility < 21, `expected ~19%, got ${risk.volatility}`)
})

check('a calendar series with quiet weekends annualises like the trading days it really moves on', () => {
  // THE POINT OF DERIVING THE FREQUENCY FROM THE SAMPLE. A real export carries a NAV row every calendar
  // day; the ~113 weekend rows are flat, which deflates the measured deviation. Scaling that deflated
  // number by √252 understated the answer twice over. Measuring the observation frequency instead makes
  // the two ways of holding the same risk agree, which is the property that has to hold.
  const move = 0.01
  const calendar: NavPoint[] = []
  let v = 1000
  const d = new Date(Date.UTC(2026, 0, 5)) // a Monday
  let step = 0
  for (let i = 0; i < 400; i++) {
    calendar.push({ date: d.toISOString().slice(0, 10), total: v })
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) { v *= step % 2 === 0 ? 1 + move : 1 / (1 + move); step++ }
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const withWeekends = riskMetrics(calendar, new Map(), 0).volatility
  const tradingOnly = riskMetrics(
    calendar.filter((p) => { const w = new Date(`${p.date}T00:00:00Z`).getUTCDay(); return w !== 0 && w !== 6 }),
    new Map(), 0).volatility
  assert.ok(withWeekends !== null && tradingOnly !== null)
  assert.ok(Math.abs(withWeekends - tradingOnly) / tradingOnly < 0.1,
    `the same risk read two ways must agree: calendar ${withWeekends}, trading-day ${tradingOnly}`)
})

check('Sortino exceeds Sharpe when the volatility is mostly upside', () => {
  // Small steady losses with occasional large gains: total deviation is dominated by the jumps up,
  // which Sortino ignores, so it must read higher than Sharpe on the same series.
  const nav: NavPoint[] = []
  let v = 1000
  const d = new Date(Date.UTC(2026, 0, 1))
  for (let i = 0; i < 201; i++) {
    nav.push({ date: d.toISOString().slice(0, 10), total: v })
    v *= i % 20 === 0 ? 1.05 : 0.999
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const risk = riskMetrics(nav, new Map(), 0)
  assert.ok(risk.sharpe !== null && risk.sortino !== null, 'both ratios need a real deviation to exist')
  assert.ok(risk.sortino! > risk.sharpe!, `sortino ${risk.sortino} should exceed sharpe ${risk.sharpe}`)
})

check('a book that never falls below the hurdle has no downside, so no Sortino to state', () => {
  // Not a failure: with zero downside deviation the ratio is undefined, and a blank is the honest
  // answer rather than an arbitrarily large number.
  const nav: NavPoint[] = []
  let v = 1000
  const d = new Date(Date.UTC(2026, 0, 1))
  for (let i = 0; i < 201; i++) {
    nav.push({ date: d.toISOString().slice(0, 10), total: v })
    v *= i % 20 === 0 ? 1.05 : 1.0001
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const risk = riskMetrics(nav, new Map(), 0)
  assert.equal(risk.sortino, null)
  assert.ok(risk.sharpe !== null, 'Sharpe still exists — total deviation is non-zero')
})

check('Calmar is the PERIOD return over the worst fall, never an annualised one', () => {
  const nav: NavPoint[] = [
    ...series(100, 0.001),
  ]
  nav.push({ date: '2026-04-11', total: nav[nav.length - 1]!.total * 0.9 }) // a 10% fall
  nav.push({ date: '2026-04-12', total: nav[nav.length - 1]!.total * 1.05 })
  const risk = riskMetrics(nav, new Map(), 4.3)
  assert.ok(risk.calmar !== null && risk.drawdown.depth !== null)
  // If Calmar had been built from an annualised return it would be several times larger than this.
  const periodReturn = (nav[nav.length - 1]!.total / nav[0]!.total - 1) * 100
  assert.ok(Math.abs(risk.calmar! - periodReturn / Math.abs(risk.drawdown.depth!)) < 0.2)
})

// ---------- benchmark ----------
check('the benchmark is compared over the SAME window', () => {
  const nav = series(5, 0.02) // +8.24% over the window
  const closes = [
    { date: '2025-12-01', close: 50 },  // before the window — must be ignored
    { date: '2026-01-01', close: 100 },
    { date: '2026-01-05', close: 104 },
    { date: '2026-06-01', close: 200 }, // after the window — must be ignored
  ]
  const b = benchmarkCompare('SPY', 8.243216, nav, closes)
  assert.equal(b.unavailable, null)
  assert.ok(near(b.benchmarkTwr!, 4, 1e-9), `100 → 104 is +4%, got ${b.benchmarkTwr}`)
  assert.ok(near(b.excess!, 4.243216, 1e-5))
  assert.equal(b.from, '2026-01-01')
})

check('a missing benchmark says WHY, and never quietly computes a shorter window', () => {
  const nav = series(5, 0.02)
  const none = benchmarkCompare('SPY', 8, nav, [])
  assert.equal(none.benchmarkTwr, null)
  assert.match(none.unavailable ?? '', /no SPY price history/)

  const partial = benchmarkCompare('SPY', 8, nav, [{ date: '2026-01-03', close: 100 }])
  assert.equal(partial.benchmarkTwr, null)
  assert.match(partial.unavailable ?? '', /does not cover/)
})

check('the benchmark window is the funded window, not every calendar row in the export', () => {
  // A Flex export carries a NAV row for every day of the query, including the months before the account
  // was funded. computeTwr skips those days, so the book's return covers only the funded stretch —
  // measuring the index over the whole export would compare eight months against three and call the
  // difference "excess". On the real book that was 262 calendar points against 98 valued days.
  const unfunded = [
    { date: '2026-01-01', total: 0 },
    { date: '2026-01-02', total: 0 },
    { date: '2026-01-03', total: 0 },
  ]
  const nav = [...unfunded, ...series(3, 0.01, 1000).map((p, i) => ({ ...p, date: ['2026-01-04', '2026-01-05', '2026-01-06'][i]! }))]
  const flows = new Map([['2026-01-04', 1000]])
  const window = measuredWindow(nav, flows)
  assert.equal(window[0]!.date, '2026-01-04', 'the window opens on the first day that had capital')
  assert.equal(window.length, 3)

  const closes = [
    { date: '2026-01-01', close: 100 }, // the unfunded run — must not set the benchmark's start
    { date: '2026-01-04', close: 200 },
    { date: '2026-01-06', close: 210 },
  ]
  const b = benchmarkCompare('SPY', 2, window, closes)
  assert.equal(b.from, '2026-01-04')
  assert.ok(near(b.benchmarkTwr!, 5, 1e-9), `200 → 210 is +5%, got ${b.benchmarkTwr}`)
})

check('a book that was never funded has no window to compare over', () => {
  const nav = [{ date: '2026-01-01', total: 0 }, { date: '2026-01-02', total: 0 }]
  assert.deepEqual(measuredWindow(nav, new Map()), [])
  const b = benchmarkCompare('SPY', null, measuredWindow(nav, new Map()), [{ date: '2026-01-01', close: 1 }])
  assert.match(b.unavailable ?? '', /no measurable window/)
})

// ---------- the cash hurdle ----------
check('the cash hurdle accrues over calendar days, not trading days', () => {
  // 366 daily points = 365 calendar days apart. A 5% deposit account earns exactly 5% over that span,
  // and it earns it on weekends too — a trading-day accrual would report ~5% of 252/365.
  const nav = series(366, 0, 1000)
  const [, , , inception] = returnsByPeriod(nav, new Map(), 5)
  assert.equal(inception!.label, 'Since inception')
  assert.ok(near(inception!.hurdle!, 5, 1e-9), `expected 5%, got ${inception!.hurdle}`)
  // A flat book over that year did not beat cash — it lost 5 points to it.
  assert.ok(near(inception!.overHurdle!, -5, 1e-9))
})

check('with no cash rate the hurdle is zero, not absent — and over-hurdle is the return itself', () => {
  const nav = series(31, 0.001, 1000)
  const inception = returnsByPeriod(nav, new Map())[3]!
  assert.equal(inception.hurdle, 0)
  assert.ok(near(inception.overHurdle!, inception.twr!, 1e-9))
})

check('a single-point window has no span, so it states no hurdle rather than 0%', () => {
  const one = returnsByPeriod([{ date: '2026-01-01', total: 1000 }], new Map(), 5)[3]!
  assert.equal(one.hurdle, null)
  assert.equal(one.overHurdle, null)
})

check('a period never charges cash for days the book held none', () => {
  // A Flex export starts when the ACCOUNT opened, not when it was funded. Measured from there, a book
  // funded for 100 days is charged a full year of hurdle — and the sign of "over cash" flips.
  const unfunded = Array.from({ length: 265 }, (_, i) => ({
    date: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10), total: 0,
  }))
  const funded = series(101, 0.0004, 1000).map((p, i) => ({
    ...p, date: new Date(Date.UTC(2025, 9, 1 + i)).toISOString().slice(0, 10),
  }))
  const nav = [...unfunded, ...funded]
  const flows = new Map([[funded[0]!.date, 1000]])

  const raw = returnsByPeriod(nav, flows, 5)[3]!
  const measured = returnsByPeriod(measuredWindow(nav, flows), flows, 5)[3]!
  assert.ok(near(raw.twr!, measured.twr!, 1e-9), 'the RETURN is the same either way — only the span differs')
  assert.equal(measured.from, funded[0]!.date, 'the window opens on the first funded day')
  // 100 calendar days of a 5% cash rate, not 365.
  assert.ok(near(measured.hurdle!, ((1.05 ** (100 / 365)) - 1) * 100, 1e-9), `got ${measured.hurdle}`)
  assert.ok(raw.hurdle! > measured.hurdle! * 2, 'measuring from the unfunded start inflates the hurdle')
  assert.ok(measured.overHurdle! > 0 && raw.overHurdle! < 0, 'and it inverts the verdict against cash')
})

// ---------- month by month ----------
check('months compound back to the period return that contains them', () => {
  // 40 points from 2026-01-01 at 0.1%/day: 30 returns land in January, 9 in February.
  const nav = series(40, 0.001, 1000)
  const months = monthlyReturns(nav, new Map())
  assert.deepEqual(months.map((m) => m.month), ['2026-01', '2026-02'])
  assert.ok(near(months[0]!.book!, (1.001 ** 30 - 1) * 100, 1e-9))
  assert.ok(near(months[1]!.book!, (1.001 ** 9 - 1) * 100, 1e-9))
  // The identity that makes the table trustworthy: a month can never disagree with its period.
  const chained = months.reduce((a, m) => a * (1 + m.book! / 100), 1)
  const inception = returnsByPeriod(nav, new Map())[3]!
  assert.ok(near((chained - 1) * 100, inception.twr!, 1e-9), `${(chained - 1) * 100} vs ${inception.twr}`)
})

check('the benchmark month keeps the turn-of-month move, exactly as the book does', () => {
  const nav = series(40, 0.001, 1000)
  // Jan 30 → Feb 2 is +10%. That step belongs to February on BOTH sides: the book's first February
  // daily return spans the same turn. Reading first-price-to-last-price inside February would drop it.
  const closes = [
    { date: '2026-01-28', close: 100 },
    { date: '2026-01-30', close: 100 },
    { date: '2026-02-02', close: 110 },
    { date: '2026-02-04', close: 110 },
  ]
  const months = monthlyReturns(nav, new Map(), closes)
  assert.ok(near(months[0]!.benchmark!, 0, 1e-9), 'January: 100 → 100 is flat')
  assert.ok(near(months[1]!.benchmark!, 10, 1e-9), `February must carry the turn, got ${months[1]!.benchmark}`)
})

check('a month the feed does not cover reports nothing rather than 0%', () => {
  const nav = series(40, 0.001, 1000)
  const noFeb = monthlyReturns(nav, new Map(), [{ date: '2026-01-05', close: 100 }, { date: '2026-01-28', close: 105 }])
  assert.equal(noFeb[1]!.benchmark, null, 'February has no closes at all')
  // And a HOLE in the feed must not dump a multi-week move into whichever month catches the next close.
  const gap = monthlyReturns(nav, new Map(), [{ date: '2026-01-05', close: 100 }, { date: '2026-02-04', close: 130 }])
  assert.equal(gap[1]!.benchmark, null, 'a 30-day step is a gap, not a February return')
})

// ---------- beta and alpha ----------
check('a book that moves exactly twice the index has beta 2 and no alpha', () => {
  const closes: { date: string; close: number }[] = []
  const book: { date: string; r: number }[] = []
  let close = 100
  const d = new Date(Date.UTC(2026, 0, 1))
  // Alternating moves, so the index has real variance to regress against.
  for (let i = 0; i <= 80; i++) {
    const date = d.toISOString().slice(0, 10)
    if (i > 0) {
      const rm = i % 2 ? 0.01 : -0.005
      close *= 1 + rm
      book.push({ date, r: 2 * rm })
    }
    closes.push({ date, close })
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const { beta, alpha, pairedDays } = betaAlpha(book, closes, 0)
  assert.equal(pairedDays, 80)
  assert.ok(near(beta!, 2, 1e-9), `expected beta 2, got ${beta}`)
  assert.ok(near(alpha!, 0, 1e-9), `expected no alpha, got ${alpha}`)
})

check('a day only one side traded is dropped, not treated as flat', () => {
  // The book is valued daily; the feed only carries its own market's sessions. Counting a missing
  // index day as a zero-return day would drag beta toward zero and invent alpha out of the hole.
  const book = Array.from({ length: 70 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10), r: 0.001,
  }))
  const closes = book.slice(0, 30).map((b, i) => ({ date: b.date, close: 100 + i }))
  const { beta, pairedDays } = betaAlpha(book, closes, 0)
  assert.equal(pairedDays, 29, 'only the days the index actually moved are paired')
  assert.equal(beta, null, 'under the minimum sample it states nothing rather than a number')
})

// ---------- review fixes ----------
check('a deposit already inside the opening NAV is not charged twice', () => {
  // A NAV row is the END-of-day value, so a flow dated on the first row is ALREADY in it. Counting it
  // again as a separate contribution says the investor put in twice the money for the same result.
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 1000 }, { date: '2027-01-01', total: 1100 }]
  const onOpening = moneyWeightedReturn(nav, new Map([['2026-01-01', 1000]]))
  const none = moneyWeightedReturn(nav, new Map())
  assert.ok(near(none!, 10, 1e-6), `1000 -> 1100 over a year is 10%, got ${none}`)
  assert.ok(near(onOpening!, none!, 1e-9), 'a same-day opening flow must not change the answer')
})

check('a flow after the opening row still counts', () => {
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 1000 }, { date: '2027-01-01', total: 2100 }]
  const withFlow = moneyWeightedReturn(nav, new Map([['2026-07-01', 1000]]))
  const none = moneyWeightedReturn(nav, new Map())
  assert.ok(withFlow !== null && none !== null && withFlow < none, 'capital added mid-year lowers the rate')
})

check('a young book with a huge annualised rate reports it rather than reporting nothing', () => {
  // +50% in three weeks annualises past 1,000%/yr. A fixed bracket returned null, which the screen
  // renders as "no money-weighted return exists" — the worst possible answer for the best possible run.
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 1000 }, { date: '2026-01-22', total: 1500 }]
  const irr = moneyWeightedReturn(nav, new Map())
  assert.ok(irr !== null, 'a solution exists and must be found')
  assert.ok(irr > 1000, `expected a very large annualised rate, got ${irr}`)
  // Cross-check against the closed form: (1.5)^(365/21) - 1.
  assert.ok(near(irr, ((1.5 ** (365 / 21)) - 1) * 100, 1e-3), `got ${irr}`)
})

check('a benchmark that covers only part of the window is refused, not silently compared', () => {
  // Counting closes is not coverage: two months of feed inside an eight-month window passes a count
  // test with dozens of rows, and "excess" then subtracts a two-month index return from an eight-month
  // book return.
  const nav = series(240, 0.0005, 1000)
  const to = nav[nav.length - 1]!.date
  const short = nav.slice(0, 60).map((p, i) => ({ date: p.date, close: 100 + i }))
  const partial = benchmarkCompare('SPY', 12, nav, short)
  assert.equal(partial.benchmarkTwr, null)
  assert.equal(partial.excess, null)
  assert.match(partial.unavailable ?? '', /covers .* not the book/)

  // The same feed extended to both ends is compared normally.
  const full = nav.map((p, i) => ({ date: p.date, close: 100 + i }))
  const ok = benchmarkCompare('SPY', 12, nav, full)
  assert.equal(ok.unavailable, null)
  assert.ok(ok.benchmarkTwr !== null && ok.excess !== null)
})

check('a weekend or holiday gap at the edges is still coverage', () => {
  // The rule has to tolerate a market that simply was not open on the book's first or last day.
  const nav = series(200, 0.0005, 1000)
  const to = nav[nav.length - 1]!.date
  const trimmed = nav.slice(2, nav.length - 2).map((p, i) => ({ date: p.date, close: 100 + i }))
  const read = benchmarkCompare('SPY', 10, nav, trimmed)
  assert.equal(read.unavailable, null, `a 2-day gap at each end must not refuse the comparison (to ${to})`)
})

check('a period that cannot reach its own boundary is marked partial', () => {
  // A book that began in April has no January NAV, so its "year to date" is not a year to date — and
  // printing the same number under two period names without saying so invites the reader to believe one
  // of them means something else.
  const nav = Array.from({ length: 40 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 3, 9 + i)).toISOString().slice(0, 10), total: 1000 * 1.0002 ** i,
  }))
  const periods = returnsByPeriod(nav, new Map())
  const byLabel = Object.fromEntries(periods.map((p) => [p.label, p]))
  assert.equal(byLabel['Year to date']!.partial, true, 'no NAV before 1 January')
  assert.equal(byLabel['Quarter to date']!.partial, true, 'no NAV before 1 April')
  assert.equal(byLabel['Month to date']!.partial, false, 'April data exists before 1 May')
  assert.equal(byLabel['Since inception']!.partial, false, 'inception is never partial — it IS the start')
})

check('beta refuses an index step built across a hole in the feed', () => {
  // One month-long gap becomes a single "daily" index return of a month's magnitude, paired against one
  // book day. That pair alone drags beta toward it and leaves the residual as invented alpha. The
  // monthly table already refuses such a step; the regression must refuse it on the same terms.
  const book: { date: string; r: number }[] = []
  const closes: { date: string; close: number }[] = []
  let close = 100
  const d = new Date(Date.UTC(2026, 0, 1))
  // Long enough that the sample still clears MIN_RATIO_DAYS after a month is punched out of the feed.
  for (let i = 0; i <= 120; i++) {
    const date = d.toISOString().slice(0, 10)
    if (i > 0) {
      const rm = i % 2 ? 0.01 : -0.005
      close *= 1 + rm
      book.push({ date, r: 2 * rm })
    }
    // The hole is in the FEED only — the book still has every day.
    if (i < 30 || i > 60) closes.push({ date, close })
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const { beta, pairedDays } = betaAlpha(book, closes, 0)
  assert.ok(pairedDays >= MIN_RATIO_DAYS, `needs a usable sample, got ${pairedDays}`)
  assert.ok(near(beta!, 2, 1e-9), `the gap step must be dropped, leaving beta 2 — got ${beta}`)
})

check('the benchmark month covers the days the BOOK held capital, not the whole calendar month', () => {
  // The book's first month starts the day capital arrived. Chaining the feed across the WHOLE month
  // credited the index with days the fund did not exist for — on the real book that read as April:
  // book 0.00% against index 10.42%, eight of those days before it was funded.
  //
  // The feed is DAILY here on purpose: a sparse fixture trips the gap guard instead, and would have
  // passed for the wrong reason.
  const nav: NavPoint[] = []
  const closes: { date: string; close: number }[] = []
  const d = new Date(Date.UTC(2026, 3, 1))
  let close = 100
  for (let i = 0; i < 30; i++) {
    const date = d.toISOString().slice(0, 10)
    // The index climbs 1%/day for the eight days BEFORE the fund is funded, then 0.1%/day after.
    if (i > 0) close *= i < 8 ? 1.01 : 1.001
    closes.push({ date, close })
    nav.push({ date, total: i < 8 ? 0 : 1000 * 1.0005 ** (i - 8) })
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const flows = new Map([[nav[8]!.date, 1000]])
  const april = monthlyReturns(nav, flows, closes).find((m) => m.month === '2026-04')!

  const fundedOnly = (closes[29]!.close / closes[8]!.close - 1) * 100
  const wholeMonth = (closes[29]!.close / closes[0]!.close - 1) * 100
  assert.ok(near(april.benchmark!, fundedOnly, 1e-9), `expected the funded window ${fundedOnly}, got ${april.benchmark}`)
  assert.ok(wholeMonth > fundedOnly + 5, 'the fixture must actually distinguish the two readings')
})

// ---------- benchmark per period window ----------
// The SP500 and Excess columns used to be filled for the since-inception row only and dashed everywhere
// else, so a month in which the book beat the index read as if it had never been compared. Each row now
// measures the index over ITS OWN window — the same recurring trap as the cash hurdle, which once
// charged a full year of interest against a four-month return and flipped the sign of "over cash".
check('each period measures the index over its own window, not the whole history', () => {
  // Flat book, so the only thing under test is the index side. Index: +1%/day for the first 10 days,
  // then dead flat — so a month-to-date window must NOT inherit the earlier climb.
  const nav: NavPoint[] = []
  const closes: { date: string; close: number }[] = []
  const d = new Date(Date.UTC(2026, 0, 22))
  let c = 100
  for (let i = 0; i < 20; i++) {
    const date = d.toISOString().slice(0, 10)
    nav.push({ date, total: 1000 })
    closes.push({ date, close: c })
    if (i < 10) c *= 1.01
    d.setUTCDate(d.getUTCDate() + 1)
  }
  // 22 Jan .. 10 Feb. Month to date opens on the last point at or before 31 Jan and runs to 10 Feb.
  const rows = returnsByPeriod(nav, new Map(), 0, closes)
  const mtd = rows.find((p) => p.label === 'Month to date')!
  const itd = rows.find((p) => p.label === 'Since inception')!
  const from = closes.find((x) => x.date === mtd.from)!.close
  const to = closes[closes.length - 1]!.close
  assert.ok(near(mtd.benchmark!, (to / from - 1) * 100, 1e-9), `MTD index ${mtd.benchmark}`)
  assert.ok(near(itd.benchmark!, (to / closes[0]!.close - 1) * 100, 1e-9), `ITD index ${itd.benchmark}`)
  // The fixture must actually distinguish them, or this passes for the wrong reason.
  assert.ok(itd.benchmark! > mtd.benchmark! + 5, 'fixture does not separate the two windows')
  // Excess is the book's own return less the index over that SAME window.
  assert.ok(near(mtd.excess!, mtd.twr! - mtd.benchmark!, 1e-9))
})

check('a hole in the feed leaves the row blank rather than chaining across it', () => {
  const nav: NavPoint[] = []
  const closes: { date: string; close: number }[] = []
  const d = new Date(Date.UTC(2026, 1, 1))
  for (let i = 0; i < 40; i++) {
    const date = d.toISOString().slice(0, 10)
    nav.push({ date, total: 1000 * 1.001 ** i })
    // A three-week hole in the middle: wider than a long weekend, so it must not be compounded.
    if (i < 10 || i > 30) closes.push({ date, close: 100 * 1.002 ** i })
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const itd = returnsByPeriod(nav, new Map(), 0, closes).find((p) => p.label === 'Since inception')!
  assert.equal(itd.benchmark, null)
  assert.equal(itd.excess, null)
  assert.ok(itd.twr !== null, 'the book return is unaffected by the feed')
})

check('no feed at all is a dash, never a zero', () => {
  const nav: NavPoint[] = [
    { date: '2026-03-01', total: 1000 }, { date: '2026-03-02', total: 1010 }, { date: '2026-03-03', total: 1020 },
  ]
  const itd = returnsByPeriod(nav, new Map())[3]!
  assert.equal(itd.benchmark, null)
  assert.equal(itd.excess, null)
})

check('a window opening on a non-trading day still gets that day\u2019s market level', () => {
  // The book has a NAV row every calendar day; the feed has trading days only. A month-to-date whose
  // boundary falls on a Saturday used to skip the Friday->Monday step entirely, so a big Monday read
  // as nothing for the index while the book\u2019s own return over the identical window included it.
  const nav: NavPoint[] = []
  const closes: { date: string; close: number }[] = []
  const d = new Date(Date.UTC(2026, 9, 26))          // Mon 26 Oct
  for (let i = 0; i < 16; i++) {
    const date = d.toISOString().slice(0, 10)
    const dow = d.getUTCDay()
    nav.push({ date, total: 1000 })                   // every calendar day, as the statement gives it
    if (dow !== 0 && dow !== 6) {
      // Flat except one +5% Monday, 2 Nov — the first trading day of the new month.
      closes.push({ date, close: date === '2026-11-02' ? 105 : (date < '2026-11-02' ? 100 : 105) })
    }
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const mtd = returnsByPeriod(nav, new Map(), 0, closes).find((p) => p.label === 'Month to date')!
  assert.equal(mtd.from, '2026-10-31', 'the window opens on the Saturday, as the NAV series has one')
  assert.ok(mtd.benchmark !== null, 'and the index must still be measurable over it')
  assert.ok(near(mtd.benchmark!, 5, 1e-9), `the Monday move belongs to this window, got ${mtd.benchmark}`)
})

check('a feed that covers only the tail of the book fills no row at all', () => {
  // Any single usable step used to produce a number, so a two-month feed filled every column of an
  // eight-month book — while the footer of that same panel said the history does not cover it.
  const nav: NavPoint[] = []
  const closes: { date: string; close: number }[] = []
  const d = new Date(Date.UTC(2026, 0, 1))
  for (let i = 0; i < 240; i++) {
    const date = d.toISOString().slice(0, 10)
    nav.push({ date, total: 1000 * 1.0002 ** i })
    if (i >= 200) closes.push({ date, close: 100 * 1.0003 ** i })   // feed starts 200 days in
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const itd = returnsByPeriod(nav, new Map(), 0, closes).find((p) => p.label === 'Since inception')!
  assert.equal(itd.benchmark, null, 'the feed does not reach the book\u2019s start')
  assert.equal(itd.excess, null)
  // ...while a window the feed DOES cover still reports.
  const mtd = returnsByPeriod(nav, new Map(), 0, closes).find((p) => p.label === 'Month to date')!
  assert.ok(mtd.benchmark !== null, 'a covered window is unaffected')
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
