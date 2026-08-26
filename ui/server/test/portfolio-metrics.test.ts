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
  const irr = moneyWeightedReturn(nav, [])
  assert.ok(irr !== null && Math.abs(irr - 100) < 0.5, `expected ~100%, got ${irr}`)
})

check('IRR rises when capital arrives before the good stretch — the point of reporting it', () => {
  // Same time-weighted path either way; only the timing of the contribution differs.
  const nav: NavPoint[] = [{ date: '2026-01-01', total: 1000 }, { date: '2026-07-01', total: 2100 }, { date: '2027-01-01', total: 4200 }]
  const early = moneyWeightedReturn(nav, [{ date: '2026-07-01', amountBase: 1000 }])
  const none = moneyWeightedReturn(nav, [])
  assert.ok(early !== null && none !== null)
  assert.ok(early < none, 'adding capital that must also be earned back lowers the money-weighted rate')
})

check('IRR says null rather than guessing when there is no solution', () => {
  assert.equal(moneyWeightedReturn([{ date: '2026-01-01', total: 100 }], []), null)
  assert.equal(moneyWeightedReturn([], []), null)
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

check('volatility annualises the daily deviation', () => {
  // Alternating ±1% around a flat path: daily deviation is ~1%, annualised ~15.9%.
  const nav: NavPoint[] = []
  let v = 1000
  const d = new Date(Date.UTC(2026, 0, 1))
  for (let i = 0; i < 201; i++) {
    nav.push({ date: d.toISOString().slice(0, 10), total: v })
    v *= i % 2 === 0 ? 1.01 : 1 / 1.01
    d.setUTCDate(d.getUTCDate() + 1)
  }
  const risk = riskMetrics(nav, new Map(), 0)
  assert.ok(risk.volatility !== null && risk.volatility > 14 && risk.volatility < 18, `expected ~16%, got ${risk.volatility}`)
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

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
