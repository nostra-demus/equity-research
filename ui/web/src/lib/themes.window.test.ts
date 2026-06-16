// Theme time-window helpers (lib/themes.ts): the pure math behind the "1h … 3m" window selector —
// how much flow a theme took in a window, which series to sparkline, how to rank/size by it, and which
// windows the engine honestly has the history to show. No DOM, no network.
// Run: npx tsx src/lib/themes.window.test.ts
import assert from 'node:assert/strict'
import { flowInWindow, windowSeries, heatInWindow, windowCoverage, heatOf, THEME_WINDOWS, type Theme } from './themes'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// 6 hourly buckets (newest last) + 7 daily buckets (newest last, today = 7)
const T = { flow_series: [0, 0, 1, 2, 0, 3], flow_daily: [5, 0, 2, 4, 0, 1, 7], member_count: 100, composite: 60 } as unknown as Theme
const win = (id: string) => THEME_WINDOWS.find((w) => w.id === id)!

check('flowInWindow: Live = all-time member count; short windows read the hourly series', () => {
  assert.equal(flowInWindow(T, null), 100)
  assert.equal(flowInWindow(T, 1), 3) // newest hour
  assert.equal(flowInWindow(T, 3), 5) // last 3 hours: 2+0+3
  assert.equal(flowInWindow(T, 6), 6) // all six hourly buckets
})

check('flowInWindow: windows past the hourly series fall to the daily accumulator', () => {
  assert.equal(flowInWindow(T, 24 * 7), 19) // 7 daily buckets: 5+0+2+4+0+1+7
  assert.equal(flowInWindow(T, 48), 8) // > 6 hourly buckets → ceil(48/24)=2 daily: 1+7
})

check('flowInWindow: missing series never throws → 0', () => {
  assert.equal(flowInWindow({ flow_series: [], member_count: 0 } as unknown as Theme, 6), 0)
  assert.equal(flowInWindow({ flow_series: [1, 2], member_count: 3 } as unknown as Theme, 24 * 30), 0) // no flow_daily
})

check('windowSeries: Live = the hourly series; short = hourly slice; long = daily slice', () => {
  assert.deepEqual(windowSeries(T, null), [0, 0, 1, 2, 0, 3])
  assert.deepEqual(windowSeries(T, 3), [2, 0, 3])
  assert.deepEqual(windowSeries(T, 24 * 7), [5, 0, 2, 4, 0, 1, 7])
  assert.deepEqual(windowSeries(T, 48), [1, 7]) // > hourly length → last 2 daily buckets
})

check('heatInWindow: Live defers to heatOf; a window ranks by its own volume', () => {
  assert.equal(heatInWindow(T, null), heatOf(T))
  const quiet = { flow_series: [0, 0, 0, 0, 0, 0], flow_daily: [0, 0, 0, 0, 0, 0, 1], composite: 90, member_count: 1 } as unknown as Theme
  const busy = { flow_series: [0, 0, 0, 0, 0, 0], flow_daily: [0, 0, 0, 0, 0, 0, 40], composite: 30, member_count: 40 } as unknown as Theme
  // over the last 24h the busy theme took far more news → it must out-rank the higher-composite quiet one
  assert.ok(heatInWindow(busy, 24) > heatInWindow(quiet, 24), 'windowed volume drives the ranking, not the all-time score')
})

check('windowCoverage: Live + short windows are always backed by the hourly ring', () => {
  for (const id of ['live', '1h', '6h', '24h']) {
    const c = windowCoverage(win(id), 0)
    assert.equal(c.selectable, true, `${id} selectable with zero daily history`)
    assert.equal(c.partial, false)
  }
})

check('windowCoverage: long windows gate on accrued daily history and report partial coverage', () => {
  const c0 = windowCoverage(win('7d'), 0)
  assert.equal(c0.selectable, false, '7d with no daily history is locked, not faked')
  const c3 = windowCoverage(win('7d'), 3)
  assert.deepEqual({ selectable: c3.selectable, coveredDays: c3.coveredDays, neededDays: c3.neededDays, partial: c3.partial }, { selectable: true, coveredDays: 3, neededDays: 7, partial: true })
  const c10 = windowCoverage(win('7d'), 10)
  assert.equal(c10.partial, false, 'once ≥7 days exist the 7d window is fully covered')
  assert.equal(windowCoverage(win('3m'), 120).partial, false, '3m needs 90 days; 120 covers it')
  assert.equal(windowCoverage(win('3m'), 45).partial, true, '45 of 90 days → partial')
})

console.log(`\n${passed} checks passed`)
