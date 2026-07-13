// Tests for the forward EVENTS CALENDAR (news/events-calendar.ts): the pure parsers (Nasdaq JSON, NSE
// JSON, investing.com HTML-in-JSON), the date parsing, and — the point of the design — the RESILIENCE:
// a source that fails keeps last-good + is marked unhealthy + flags the snapshot stale, and the calendar
// degrades to the sources that still work instead of crashing or faking.
import assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  parseNasdaqEarnings, parseNseEarnings, parseNseDate, parseBeaIcs,
  buildNasdaqEarningsUrl, getCalendar, _resetCalendarCache,
} from '../src/news/events-calendar'

let passed = 0
function check(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ok  ${name}`) })
    .catch((e) => { console.error(`  ✗   ${name}\n      ${(e as Error).message}`); process.exitCode = 1 })
}

// ---- pure parsers ----
await check('parseNseDate: DD-Mon-YYYY → ISO, null on anything else', () => {
  assert.equal(parseNseDate('14-Jul-2026'), '2026-07-14')
  assert.equal(parseNseDate('01-Jan-2027'), '2027-01-01')
  assert.equal(parseNseDate('2026-07-14'), null)
  assert.equal(parseNseDate('14-Xyz-2026'), null)
  assert.equal(parseNseDate(''), null)
})

await check('parseNasdaqEarnings: rows → US earnings events; empty/missing → []', () => {
  const json = { data: { asOf: '2026-07-13', rows: [
    { symbol: 'FBK', name: 'FB Financial Corp', time: 'time-after-hours', epsForecast: '$1.14', noOfEsts: '3' },
    { symbol: 'AAA', name: 'Acme A', time: 'time-before-open', epsForecast: '', noOfEsts: '' },
  ] } }
  const ev = parseNasdaqEarnings(json, '2026-07-13')
  assert.equal(ev.length, 2)
  assert.equal(ev[0].kind, 'earnings'); assert.equal(ev[0].region, 'US'); assert.equal(ev[0].source, 'nasdaq')
  assert.equal(ev[0].ticker, 'FBK'); assert.equal(ev[0].time, 'amc'); assert.equal(ev[0].detail, 'EPS est $1.14 (3 ests)')
  assert.equal(ev[1].time, 'bmo'); assert.equal(ev[1].detail, null, 'no EPS → no detail')
  assert.deepEqual(parseNasdaqEarnings({ data: { rows: [] } }, '2026-07-13'), [])
  assert.deepEqual(parseNasdaqEarnings({}, '2026-07-13'), [])
  assert.deepEqual(parseNasdaqEarnings(null, '2026-07-13'), [])
})

await check('parseNseEarnings: forward-only, date-parsed, honest absence', () => {
  const json = [
    { symbol: 'A2ZINFRA', company: 'A2Z Infra Engineering', purpose: 'Financial Results', date: '14-Jul-2026' },
    { symbol: 'OLD', company: 'Old Co', purpose: 'Financial Results', date: '01-Jan-2020' }, // past → dropped
    { symbol: 'BAD', company: 'Bad Date', purpose: 'x', date: 'not-a-date' }, // unparseable → dropped
  ]
  const ev = parseNseEarnings(json, '2026-07-13')
  assert.equal(ev.length, 1)
  assert.equal(ev[0].region, 'IN'); assert.equal(ev[0].ticker, 'A2ZINFRA'); assert.equal(ev[0].date, '2026-07-14')
  assert.equal(ev[0].detail, 'Financial Results')
  assert.deepEqual(parseNseEarnings({}, '2026-07-13'), [], 'non-array → []')
})

await check('parseBeaIcs: VEVENT → US macro events; unfolds folded lines, unescapes, forward-only, importance', () => {
  // note the folded SUMMARY (continuation line starts with a space) + escaped comma \, — both must resolve
  const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Gross Domestic Product\\, 4th Quarter and Year 2026 (Advance Estima
 te)
DTSTART;VALUE=DATE-TIME:20260730T133000Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:U.S. International Trade in Goods and Services\\, June 2026
DTSTART;VALUE=DATE-TIME:20260805T123000Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:Ancient GDP release
DTSTART;VALUE=DATE-TIME:20200101T133000Z
END:VEVENT`
  const ev = parseBeaIcs(ics, '2026-07-13')
  assert.equal(ev.length, 2, 'the 2020 row is forward-filtered out')
  assert.equal(ev[0].kind, 'macro'); assert.equal(ev[0].region, 'US'); assert.equal(ev[0].source, 'bea')
  assert.equal(ev[0].date, '2026-07-30'); assert.equal(ev[0].time, '13:30')
  assert.equal(ev[0].title, 'Gross Domestic Product, 4th Quarter and Year 2026 (Advance Estimate)', 'unfolded + unescaped')
  assert.equal(ev[0].importance, 'high', 'GDP is high-impact')
  assert.equal(ev[1].importance, 'medium', 'trade is medium')
  assert.deepEqual(parseBeaIcs('', '2026-07-13'), [])
  assert.deepEqual(parseBeaIcs(null, '2026-07-13'), [])
})

await check('url builder', () => {
  assert.equal(buildNasdaqEarningsUrl('2026-07-13'), 'https://api.nasdaq.com/api/calendar/earnings?date=2026-07-13')
})

// ---- getCalendar: resilience + merge/sort (with a mock fetch + isolated state dir) ----
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cal-'))
const NOW = () => new Date('2026-07-13T12:00:00Z')

// a mock fetch that serves canned responses per URL, or FAILS on demand
function mockFetch(opts: { failMacro?: boolean; failUs?: boolean; failIn?: boolean } = {}): typeof fetch {
  return (async (url: string) => {
    const u = String(url)
    const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) })
    const okText = (s: string) => ({ ok: true, status: 200, json: async () => ({}), text: async () => s })
    const fail = { ok: false, status: 500, json: async () => ({}), text: async () => '' }
    if (u.includes('api.nasdaq.com')) {
      if (opts.failUs) return fail as any
      return ok({ data: { rows: [{ symbol: 'AAPL', name: 'Apple', time: 'time-after-hours', epsForecast: '1.5', noOfEsts: '20' }] } }) as any
    }
    if (u.includes('nseindia.com')) {
      if (opts.failIn) return fail as any
      return ok([{ symbol: 'RELIANCE', company: 'Reliance', purpose: 'Financial Results', date: '20-Jul-2026' }]) as any
    }
    if (u.includes('bea.gov')) {
      if (opts.failMacro) return fail as any
      return okText('BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Gross Domestic Product\\, Q2 2026\nDTSTART;VALUE=DATE-TIME:20260713T133000Z\nEND:VEVENT\nEND:VCALENDAR') as any
    }
    return { ok: false, status: 404, json: async () => ({}), text: async () => '' } as any
  }) as unknown as typeof fetch
}

await check('getCalendar: all sources good → merged, forward, date-sorted, all-healthy', async () => {
  _resetCalendarCache()
  const snap = (await getCalendar({ fetchFn: mockFetch(), now: NOW, stateDir: fs.mkdtempSync(path.join(tmp, 'a')) }))!
  assert.ok(snap, 'enabled by default')
  assert.equal(snap.stale, false, 'all fresh')
  assert.ok(snap.events.length >= 3)
  // sorted soonest-first; the 2026-07-13 macro comes before the 2026-07-20 earnings
  assert.ok(snap.events[0].date <= snap.events[snap.events.length - 1].date)
  assert.equal(snap.events[0].date, '2026-07-13'); assert.equal(snap.events[0].kind, 'macro')
  assert.ok(snap.health.every((h) => h.ok), 'every source healthy')
  assert.equal(snap.health.find((h) => h.source === 'nse')!.count, 1)
})

await check('getCalendar: a failing macro source keeps the others + marks itself unhealthy + stale', async () => {
  _resetCalendarCache()
  const dir = fs.mkdtempSync(path.join(tmp, 'b'))
  const snap = (await getCalendar({ fetchFn: mockFetch({ failMacro: true }), now: NOW, stateDir: dir }))!
  assert.equal(snap.stale, true, 'a failed source → stale')
  const macro = snap.health.find((h) => h.source === 'bea')!
  assert.equal(macro.ok, false); assert.ok(macro.note && macro.note.includes('BEA'))
  // earnings still present — degraded, not down
  assert.ok(snap.events.some((e) => e.source === 'nasdaq'))
  assert.ok(snap.events.some((e) => e.source === 'nse'))
  assert.ok(!snap.events.some((e) => e.kind === 'macro'), 'no macro events (source down, no last-good yet)')
})

await check('getCalendar: total outage → empty, all-unhealthy, stale — never throws', async () => {
  _resetCalendarCache()
  const dir = fs.mkdtempSync(path.join(tmp, 'c'))
  const snap = (await getCalendar({ fetchFn: mockFetch({ failMacro: true, failUs: true, failIn: true }), now: NOW, stateDir: dir }))!
  assert.equal(snap.events.length, 0)
  assert.equal(snap.stale, true)
  assert.ok(snap.health.every((h) => !h.ok), 'all sources unhealthy')
})

Promise.resolve().then(() => console.log(`\n${passed} checks passed`))
