// The watchlist clock end to end (src/watch/monitor.ts), with prices, reports and email faked. It walks the
// operator's own day: switch-on sends ONE summary of what was already true (no flood) and, with email on, ONE
// test email; a price crossing its buy line sends one urgent message and one email, hovering sends nothing
// more, a real move away and back sends again, a name whose research turns Avoid comes off with the reason, a
// long gap in checks is reported rather than silently skipped, and new research that says buy gets one urgent
// message and then only its warnings.
// Run: npx tsx test/watch-monitor.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createWatchMonitor } from '../src/watch/monitor'
import { fingerprintEngineRow, makeListing, mergeWatchlist, type EngineWatchRow } from '../src/watchlist'
import type { PlanItem, WatchPlan } from '../src/watch/plan'
import type { LiveQuote, QuoteOutcome } from '../src/news/equity-quote'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log('  ok ', name)
  } catch (e) {
    console.error('  FAIL', name)
    console.error('   ', e)
    process.exitCode = 1
  }
}

function engineRow(ticker: string, currency: string, exchange: string, run: string, decision = 'Watchlist'): EngineWatchRow {
  const run_root = `analyses/${run}`
  return {
    listing: makeListing({ ticker, currency, exchange, companyName: `${ticker} Inc` }), run_root, decision,
    decision_date: run.slice(-10), size_in_trigger: null, next_review: null, next_review_text: null, entry_price: null,
    final_thesis_path: null, fingerprint: fingerprintEngineRow({ run_root, decision }),
  }
}
function planFor(row: EngineWatchRow, items: PlanItem[]): WatchPlan {
  return {
    schema_version: 'watch-plan/v1', listing_key: row.listing.listing_key, ticker: row.listing.ticker,
    company_name: row.listing.company_name, currency: row.listing.currency, exchange: row.listing.exchange,
    origin: 'research', run_root: row.run_root, decision: row.decision, decision_date: row.decision_date,
    entry_price: null, entry_price_as_of: null, sources: [], source_digest: 'd', items, left_out: [],
    reader: { status: 'ok', model: 'opus', cost_usd: 0.3, at: null, detail: '3 items kept from the text.' },
    created_at: '2026-09-15T00:00:00Z',
  }
}
const src = (quote: string) => ({ file: 'final_thesis.md', quote, field: null })

let clock = new Date('2026-09-15T14:00:00Z')
const later = (min: number) => { clock = new Date(clock.getTime() + min * 60_000) }
const AMZN = engineRow('AMZN', 'USD', 'NasdaqGS', 'AMZN_2026-07-10')
const INDIAMART = engineRow('INDIAMART', 'INR', 'NSE', 'INDIAMART_2026-08-14')
// A buy call whose research is old enough that a Watchlist name would say "research getting old".
const BG_BUY = engineRow('BG', 'USD', 'NYSE', 'BG_2026-01-02', 'Buy')
let engine: EngineWatchRow[] = [AMZN, INDIAMART]
const price: Record<string, number> = { 'AMZN|USD': 230, 'INDIAMART|INR': 1666.5, 'BG|USD': 120 }
const plans: Record<string, WatchPlan> = {
  [AMZN.run_root]: planFor(AMZN, [{ kind: 'price', id: 'p-buy', role: 'buy', low: 190, high: 200, currency: 'USD', source: src('Track at $190-200 for re-entry'), note: null }]),
  [INDIAMART.run_root]: planFor(INDIAMART, [{ kind: 'price', id: 'p-look', role: 'look_again', low: 1699, high: null, currency: 'INR', source: src('revisit if price falls toward the ₹1,699 base fair value'), note: null }]),
  [BG_BUY.run_root]: planFor(BG_BUY, [{ kind: 'price', id: 'p-bad', role: 'bad_case', low: 90, high: null, currency: 'USD', source: { file: 'decision_record.json', quote: null, field: 'scenario "bear"' }, note: null }]),
}
const quoteOf = (ticker: string, currency: string, p: number): LiveQuote => ({
  ticker, symbol: ticker, name: `${ticker} Inc`, exchange: 'X', currency, price: p, as_of: clock.toISOString(),
  as_of_is_close: false, delayed: true, source: 'cnbc', stale: false,
})
const emails: any[][] = []
const isTest = (batch: any[]) => batch.some((e) => e.items.some((i: any) => i.type === 'email_test'))
const alerts = () => emails.filter((b) => !isTest(b))
const tests = () => emails.filter(isTest)
const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-'))
const today = () => clock.toISOString().slice(0, 10)
const monitor = createWatchMonitor({
  stateDir, manual: true, now: () => clock, today,
  loadEngineRows: async () => engine,
  loadEntries: () => [],
  quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.filter((s) => price[s.key] != null)
    .map((s) => [s.key, { quote: quoteOf(s.ticker, s.currency!, price[s.key]), reason: null }])),
  indexLevels: async () => new Map(),
  readPlan: async (row) => ({ status: 'ok', plan: plans[row.run_root], detail: 'read', cost_usd: 0.3 }),
  emailConfig: () => ({ enabled: true, recipients: ['ops@example.com'], appUrl: 'https://cockpit.example', reason: null }),
  sendEmail: async (batch) => { emails.push(batch); return { ok: true, detail: 'Emailed to 1 address.' } },
})
const messages = () => monitor.inbox.list()
const forName = (ticker: string) => messages().filter((m) => m.ticker === ticker)

async function main() {
  await check('switch-on: research names stay quiet until read, then ONE summary of what was already true', async () => {
    await monitor.tick()
    assert.equal(messages().filter((m) => m.kind !== 'system').length, 0, 'nothing before the reports are read')
    await monitor.idle()
    later(1)
    await monitor.tick()
    const all = messages().filter((m) => m.kind === 'summary')
    assert.equal(all.length, 1)
    assert.match(all[0].title, /Watching 2 names — 1 already needs a look/)
    assert.ok(all[0].items.some((i) => i.ticker === 'INDIAMART' && i.type === 'look_again_reached'))
    assert.equal(all[0].urgent, false, 'the switch-on summary is never emailed')
    assert.equal(alerts().length, 0)
  })

  await check('email on: ONE test email goes out, and says it is a test', () => {
    assert.equal(tests().length, 1)
    assert.equal(tests()[0][0].items[0].title, 'This is a test')
    const test = messages().find((m) => m.title === 'Test email')
    assert.equal(test?.email.state, 'sent')
  })

  await check('a price crossing its buy line: one urgent message, one email', async () => {
    later(10)
    price['AMZN|USD'] = 199
    await monitor.tick()
    const amzn = forName('AMZN')
    assert.equal(amzn.length, 1)
    assert.equal(amzn[0].status, 'buy_price_reached')
    assert.equal(amzn[0].urgent, true)
    assert.equal(alerts().length, 1)
    assert.equal(alerts()[0][0].message.ticker, 'AMZN')
    assert.equal(amzn[0].email.state, 'sent')
  })

  await check('hovering at the line sends nothing more', async () => {
    later(10); price['AMZN|USD'] = 203; await monitor.tick()
    later(10); price['AMZN|USD'] = 199.5; await monitor.tick()
    assert.equal(forName('AMZN').length, 1)
    assert.equal(alerts().length, 1)
  })

  await check('a clear move away and back is news again', async () => {
    later(40); price['AMZN|USD'] = 210; await monitor.tick()
    later(40); price['AMZN|USD'] = 198; await monitor.tick()
    assert.equal(forName('AMZN').length, 2)
    assert.equal(alerts().length, 2)
    assert.equal(tests().length, 1, 'the test email is never repeated')
  })

  await check('the list shows each name with its status word, most urgent first', () => {
    const rows = mergeWatchlist({
      entries: [], engine, today: today(),
      quotes: new Map<string, QuoteOutcome>([
        ['AMZN|USD', { quote: quoteOf('AMZN', 'USD', 198), reason: null }],
        ['INDIAMART|INR', { quote: quoteOf('INDIAMART', 'INR', 1666.5), reason: null }],
      ]),
    }).rows
    const decorated = monitor.decorate(rows)
    assert.deepEqual(decorated.map((r) => [r.ticker, r.watch.status]), [['AMZN', 'buy_price_reached'], ['INDIAMART', 'check_now']])
    assert.equal(decorated[0].watch.plan?.state, 'ready')
    assert.ok(decorated[0].watch.unread >= 1)
  })

  await check('a name whose research turns Avoid comes off the list, with the reason', async () => {
    engine = [AMZN, { ...INDIAMART, decision: 'Avoid' }]
    later(10)
    await monitor.tick()
    const off = forName('INDIAMART').find((m) => m.items.some((i) => i.type === 'removed'))
    assert.ok(off)
    assert.match(off!.items[0].detail, /says Avoid/)
    assert.equal(off!.urgent, false)
  })

  await check('a long gap in checks is reported, not silently skipped', async () => {
    later(150)
    await monitor.tick()
    const sys = messages().find((m) => m.kind === 'system' && /was off/.test(m.title))
    assert.ok(sys)
    assert.match(sys!.title, /was off for 2\.5 hours/)
  })

  await check('new research that says buy: ONE urgent "buy now" message, then only its warnings', async () => {
    const before = alerts().length
    engine = [AMZN, BG_BUY]
    later(10); await monitor.tick(); await monitor.idle()
    later(1); await monitor.tick()
    const bg = forName('BG')
    assert.equal(bg.length, 1)
    assert.equal(bg[0].items[0].type, 'research_buy_now')
    assert.equal(bg[0].urgent, true)
    assert.match(bg[0].items[0].detail, /ends in Buy/)
    assert.match(bg[0].items[0].detail, /bad case of USD 90/)
    assert.equal(alerts().length, before + 1, 'emailed once')
    // Research this old would say "check now" on a Watchlist name; for a buy call its age is no longer news.
    later(40); price['BG|USD'] = 118; await monitor.tick()
    assert.equal(forName('BG').length, 1)
    later(40); price['BG|USD'] = 85; await monitor.tick()
    const warn = forName('BG').find((m) => m.status === 'warning')
    assert.ok(warn, 'a fall under its bad case is still a warning')
    assert.equal(warn!.urgent, true)
    assert.equal(forName('BG').length, 2)
  })

  await check('a Short Candidate call is not on the list — like Avoid, it is not a name to buy', () => {
    const TSLA = engineRow('TSLA', 'USD', 'NasdaqGS', 'TSLA_2026-08-01', 'Short Candidate')
    const rows = mergeWatchlist({ entries: [], engine: [AMZN, TSLA], today: today(), quotes: new Map() }).rows
    assert.deepEqual(rows.map((r) => r.ticker), ['AMZN'])
  })

  await check("a report that cannot be read is still watched on the record's own fields, then set up fully once read", async () => {
    // A second watcher, whose model sign-in has expired: its first read fails, a later one succeeds.
    let t = new Date('2026-09-15T14:00:00Z')
    const nhy = engineRow('NHY', 'NOK', 'Oslo Børs (OB:NHY)', 'NHY_2026-07-19')
    const bad: PlanItem = { kind: 'price', id: 'p-bad', role: 'bad_case', low: 45.12, high: null, currency: 'NOK', source: { file: 'decision_record.json', quote: null, field: 'scenario "bear"' }, note: null }
    const look: PlanItem = { kind: 'price', id: 'p-look', role: 'look_again', low: 70, high: 82, currency: 'NOK', source: src('revisit only if price falls toward or below the NOK 70-82 weighted fair-value band'), note: null }
    const partial = { ...planFor(nhy, [bad]), reader: { status: 'failed' as const, model: 'opus', cost_usd: 0, at: null, detail: 'Not signed in.' } }
    let signedIn = false
    let nhyPrice = 50
    const reads: string[] = []
    const m2 = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-2-')), manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [nhy], loadEntries: () => [],
      quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.map((s) => [s.key, { quote: { ...quoteOf('NHY', 'NOK', nhyPrice), as_of: t.toISOString() }, reason: null }])),
      indexLevels: async () => new Map(),
      readPlan: async () => {
        reads.push(signedIn ? 'ok' : 'failed')
        return signedIn
          ? { status: 'ok', plan: planFor(nhy, [look, bad]), detail: 'read', cost_usd: 0.3 }
          : { status: 'failed', plan: partial, detail: "The engine's Claude session isn't signed in on the server.", cost_usd: 0 }
      },
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: 'No address is set for watchlist email.' }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    await m2.tick(); await m2.idle()
    t = new Date(t.getTime() + 60_000); await m2.tick()
    assert.equal(m2.inbox.list().filter((m) => m.kind === 'summary').length, 1, 'switched on without waiting hours for a read')
    t = new Date(t.getTime() + 10 * 60_000); nhyPrice = 44; await m2.tick()
    const warn = m2.inbox.list().find((m) => m.status === 'warning')
    assert.ok(warn, 'the bad case from the record is watched even though the text could not be read')
    assert.equal(warn!.urgent, true)
    signedIn = true
    t = new Date(t.getTime() + 61 * 60_000); nhyPrice = 75; await m2.tick(); await m2.idle()
    t = new Date(t.getTime() + 60_000); await m2.tick()
    assert.deepEqual(reads, ['failed', 'ok'])
    const setUp = m2.inbox.list().find((m) => m.items.some((i) => i.type === 'now_watching'))
    assert.ok(setUp, 'once read, one "now watching" message with the full plan')
    assert.ok(setUp!.items.some((i) => i.type === 'look_again_reached'), 'and what was already true at that point')
  })

  await check('the test email: retried at most hourly if it fails, never repeated once through, sent anew for new addresses', async () => {
    let t = new Date('2026-09-15T14:00:00Z')
    let fail = true
    let to = ['ops@example.com']
    const sent: any[][] = []
    const m3 = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-3-')), manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [], loadEntries: () => [],
      quote: async () => new Map(), indexLevels: async () => new Map(),
      readPlan: async () => ({ status: 'no_sources', plan: null, detail: '', cost_usd: 0 }),
      emailConfig: () => ({ enabled: true, recipients: to, appUrl: '', reason: null }),
      sendEmail: async (batch) => { sent.push(batch); return fail ? { ok: false, detail: 'Could not email: the sender is down' } : { ok: true, detail: 'Emailed to 1 address.' } },
    })
    await m3.tick()
    t = new Date(t.getTime() + 10 * 60_000); await m3.tick()
    assert.equal(sent.length, 1, 'a failed test is not retried within the hour')
    fail = false
    t = new Date(t.getTime() + 61 * 60_000); await m3.tick()
    t = new Date(t.getTime() + 61 * 60_000); await m3.tick()
    assert.equal(sent.length, 2, 'retried once the hour passed, and never again once through')
    assert.equal(sent[1][0].items[0].type, 'email_test')
    const cockpit = m3.inbox.list().filter((m) => m.title === 'Test email')
    assert.equal(cockpit.length, 1, 'one cockpit message, however many tries')
    assert.equal(cockpit[0].email.state, 'sent')
    to = ['ops@example.com', 'banks@example.com']
    t = new Date(t.getTime() + 5 * 60_000); await m3.tick()
    assert.equal(sent.length, 3, 'a new set of addresses gets its own test')
  })

  await check('the same research read at last is not "new research", and nothing already told is told again', async () => {
    // Its first read fails (a sign-in expired), the fall under its bad case is emailed; the read then succeeds.
    let t = new Date('2026-09-15T14:00:00Z')
    const nhy = engineRow('NHY', 'NOK', 'Oslo Børs (OB:NHY)', 'NHY_2026-07-19')
    const bad: PlanItem = { kind: 'price', id: 'p-bad', role: 'bad_case', low: 45.12, high: null, currency: 'NOK', source: { file: 'decision_record.json', quote: null, field: 'scenario "bear"' }, note: null }
    const look: PlanItem = { kind: 'price', id: 'p-look', role: 'look_again', low: 70, high: 82, currency: 'NOK', source: src('revisit only if price falls toward or below the NOK 70-82 weighted fair-value band'), note: null }
    const partial = { ...planFor(nhy, [bad]), reader: { status: 'failed' as const, model: 'opus', cost_usd: 0, at: null, detail: 'Not signed in.' } }
    let signedIn = false
    let nhyPrice = 50
    const sent: any[][] = []
    const m4 = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-4-')), manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [nhy], loadEntries: () => [],
      quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.map((s) => [s.key, { quote: { ...quoteOf('NHY', 'NOK', nhyPrice), as_of: t.toISOString() }, reason: null }])),
      indexLevels: async () => new Map(),
      readPlan: async () => (signedIn
        ? { status: 'ok', plan: planFor(nhy, [look, bad]), detail: 'read', cost_usd: 0.3 }
        : { status: 'failed', plan: partial, detail: 'Not signed in.', cost_usd: 0 }),
      emailConfig: () => ({ enabled: true, recipients: ['ops@example.com'], appUrl: '', reason: null }),
      sendEmail: async (batch) => { sent.push(batch); return { ok: true, detail: 'Emailed to 1 address.' } },
    })
    const alertItems = () => sent.filter((b) => !isTest(b)).flatMap((b) => b.flatMap((e: any) => e.items.map((i: any) => i.type)))
    await m4.tick(); await m4.idle()
    t = new Date(t.getTime() + 60_000); await m4.tick()
    t = new Date(t.getTime() + 10 * 60_000); nhyPrice = 44; await m4.tick()
    assert.deepEqual(alertItems(), ['bad_case_broken'], 'the fall under the bad case is emailed once')
    signedIn = true
    t = new Date(t.getTime() + 61 * 60_000); await m4.tick(); await m4.idle()
    t = new Date(t.getTime() + 60_000); await m4.tick()
    const setUp = m4.inbox.list().find((m) => m.items.some((i) => i.type === 'now_watching'))
    assert.ok(setUp)
    assert.equal(setUp!.items.find((i) => i.type === 'now_watching')!.title, 'Now watching', 'not "new research": the research did not change')
    assert.ok(!setUp!.items.some((i) => i.type === 'bad_case_broken'), 'the bad case was already told')
    assert.ok(setUp!.items.some((i) => i.type === 'look_again_reached'), 'what the read found is told')
    assert.deepEqual(alertItems(), ['bad_case_broken', 'look_again_reached'], 'no second email for the same fall')
  })

  await check('a report corrected in place is read again — its files checked at most hourly', async () => {
    let t = new Date('2026-09-15T14:00:00Z')
    const row = engineRow('UBER', 'USD', 'NYSE', 'UBER_2026-08-09')
    let digest = 'd'
    const reads: string[] = []
    const m5 = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-5-')), manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [row], loadEntries: () => [],
      quote: async () => new Map(), indexLevels: async () => new Map(),
      readPlan: async () => { reads.push(digest); return { status: 'ok', plan: { ...planFor(row, []), source_digest: digest }, detail: 'read', cost_usd: 0.3 } },
      currentDigest: () => digest,
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: null }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    await m5.tick(); await m5.idle()
    t = new Date(t.getTime() + 61 * 60_000); await m5.tick(); await m5.idle()
    assert.deepEqual(reads, ['d'], 'unchanged files are not read again')
    digest = 'e'
    t = new Date(t.getTime() + 10 * 60_000); await m5.tick(); await m5.idle()
    assert.deepEqual(reads, ['d'], 'not before the hour is up')
    t = new Date(t.getTime() + 51 * 60_000); await m5.tick(); await m5.idle()
    assert.deepEqual(reads, ['d', 'e'], 'a corrected report is read again')
  })

  await check('idle drains reads queued by an in-flight tick and stop prevents another read', async () => {
    const row = engineRow('TEST', 'USD', 'NYSE', 'TEST_2026-09-15')
    let allowRows!: () => void
    let finishRead!: () => void
    let announceRead!: () => void
    const rowsReady = new Promise<void>((resolve) => { allowRows = resolve })
    const readDone = new Promise<void>((resolve) => { finishRead = resolve })
    const readStarted = new Promise<void>((resolve) => { announceRead = resolve })
    let reads = 0
    const m = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-drain-')), manual: true, today: () => '2026-09-15',
      loadEngineRows: async () => { await rowsReady; return [row] }, loadEntries: () => [],
      quote: async () => new Map(), indexLevels: async () => new Map(),
      readPlan: async () => { reads++; announceRead(); await readDone; return { status: 'ok', plan: planFor(row, []), detail: 'read', cost_usd: 0 } },
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: null }), sendEmail: async () => ({ ok: true, detail: '' }),
    })
    const tick = m.tick()
    let drained = false
    const drain = m.idle().then(() => { drained = true })
    allowRows()
    await readStarted
    await tick
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(drained, false, 'the read was queued after idle began, and is still running')
    m.stop()
    finishRead()
    await drain
    await m.tick()
    assert.equal(reads, 1)
    const server = fs.readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8')
    const shutdown = server.slice(server.indexOf('async function shutdown('), server.indexOf('function installProcessHandlers('))
    assert.ok(shutdown.indexOf('watchMonitor.stop()') >= 0)
    assert.match(shutdown, /await watchMonitor\.idle\(\)/)
    assert.ok(shutdown.indexOf('watchMonitor.idle()') < shutdown.indexOf('process.exit(code)'))
  })

  await check("the plan's usage limit is waited out once, probed once, and blames no report", async () => {
    // On the live cockpit all ten reports were read inside 23 seconds against a spent Claude plan, each spent
    // its three attempts on the way, and each was then stood down for a day: the watchlist ran 14 hours with no
    // plan read at all. The limit is one condition for the MACHINE, and the plan it belongs to resets in hours.
    let t = new Date('2026-09-16T06:00:00Z')
    let limited = true
    const reads: string[] = []
    const rows = ['AAA', 'BBB', 'CCC'].map((tk, i) => engineRow(tk, 'USD', 'NYSE', `${tk}_2026-08-0${i + 1}`))
    const base = (row: EngineWatchRow): WatchPlan => ({
      ...planFor(row, [{ kind: 'price', id: 'p-bad', role: 'bad_case', low: 10, high: null, currency: 'USD', source: { file: 'decision_record.json', quote: null, field: 'scenario "bear"' }, note: null }]),
      reader: { status: 'not_run', model: null, cost_usd: 0, at: null, detail: 'Claude usage limit reached — try again after the plan resets.' },
    })
    const m6 = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-6-')), manual: true,
      now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => rows, loadEntries: () => [],
      quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.map((s) => [s.key, { quote: quoteOf(s.ticker, s.currency!, 50), reason: null }])),
      indexLevels: async () => new Map(),
      readPlan: async (row) => {
        reads.push(row.run_root)
        // What the reader does on a limit: the record's own bad case is saved and watched, nothing is read.
        return limited
          ? { status: 'limit', plan: base(row), detail: 'Claude usage limit reached — try again after the plan resets.', cost_usd: 0 }
          : { status: 'ok', plan: planFor(row, []), detail: 'read', cost_usd: 0.3 }
      },
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: 'Email is off.' }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    const step = async (min: number) => { t = new Date(t.getTime() + min * 60_000); await m6.tick(); await m6.idle() }
    const views = () => m6.decorate(mergeWatchlist({
      entries: [], engine: rows, today: t.toISOString().slice(0, 10),
      quotes: new Map(rows.map((r) => [r.listing.listing_key, { quote: quoteOf(r.listing.ticker, 'USD', 50), reason: null }])),
    }).rows)
    await m6.tick(); await m6.idle()
    assert.equal(reads.length, 3, 'every name is tried once, so every name ends up watched on its own record')
    assert.deepEqual(views().map((r) => [r.watch.plan?.state, r.watch.plan?.items.length]),
      [['limit', 1], ['limit', 1], ['limit', 1]], 'ready, on the record\u2019s own bad case — not "waiting to read"')
    assert.match(views()[0].watch.plan!.detail, /^Claude usage limit reached/, 'said of the plan, not of the research')
    await step(5)
    assert.equal(reads.length, 3, 'and nothing is tried again while it holds')
    await step(16)
    assert.equal(reads.length, 4, 'once the wait is over ONE probe goes out, not one per report')
    assert.equal(m6.inbox.list().some((m) => m.items.some((i) => i.type === 'setup_failed')), false,
      'and no report is reported unreadable for a limit that is not about it')
    limited = false
    await step(16)
    await step(1)
    await step(1)
    assert.deepEqual(views().map((r) => r.watch.plan?.state), ['ready', 'ready', 'ready'], 'all read once the plan is back')
  })

  await check('a limit recorded before the two were told apart is still a limit', async () => {
    // The state this change exists to repair already holds these as `failed` with three attempts — on the old
    // path they would sit out the whole 24-hour give-up after the upgrade, which is the bug, not the fix.
    let t = new Date('2026-09-16T12:00:00Z')
    const row = engineRow('DDD', 'USD', 'NYSE', 'DDD_2026-08-04')
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-7-'))
    // The monitor keeps its state under <stateDir>/watchlist — written anywhere else it is silently ignored,
    // and the test would prove nothing.
    fs.mkdirSync(path.join(dir, 'watchlist'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'watchlist', 'monitor-state.json'), JSON.stringify({
      schema_version: 'watch-monitor/v1', switched_on_at: '2026-09-15T16:35:00Z', summary_sent_at: '2026-09-15T16:35:00Z',
      last_tick_at: '2026-09-15T18:41:00Z', names: {}, email_paused: [], pending_summary: {}, email_test: null,
      reads: { 'DDD_2026-08-04': { attempts: 3, last_at: '2026-09-15T18:41:32.590Z', status: 'failed',
        detail: 'Claude usage limit reached — try again after the plan resets.' } },
    }))
    let reads = 0
    const m7 = createWatchMonitor({
      stateDir: dir, manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [row], loadEntries: () => [],
      quote: async () => new Map(), indexLevels: async () => new Map(),
      readPlan: async () => { reads += 1; return { status: 'ok', plan: planFor(row, []), detail: 'read', cost_usd: 0.3 } },
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: 'Email is off.' }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    await m7.tick(); await m7.idle()
    assert.equal(reads, 1, 'read again as soon as the wait was over, not a day after the upgrade')
    const view = m7.decorate(mergeWatchlist({ entries: [], engine: [row], today: t.toISOString().slice(0, 10), quotes: new Map() }).rows)
    assert.equal(view[0].watch.plan?.state, 'ready')
  })

  await check('a limit left behind by a name that is gone does not hold the list at one read a tick', async () => {
    // A read record outlives the name it belongs to. Read as "there has been a limit" rather than "there is
    // one", it kept the whole list on single-probe reading for good — and the state is saved, so a restart
    // did not clear it either.
    let t = new Date('2026-09-16T12:00:00Z')
    const rows = ['EEE', 'FFF', 'GGG'].map((tk, i) => engineRow(tk, 'USD', 'NYSE', `${tk}_2026-08-0${i + 1}`))
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-8-'))
    fs.mkdirSync(path.join(dir, 'watchlist'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'watchlist', 'monitor-state.json'), JSON.stringify({
      schema_version: 'watch-monitor/v1', switched_on_at: '2026-09-13T10:00:00Z', summary_sent_at: '2026-09-13T10:00:00Z',
      last_tick_at: '2026-09-13T10:00:00Z', names: {}, email_paused: [], pending_summary: {}, email_test: null,
      reads: { 'ARCHIVED_2026-01-01': { attempts: 0, last_at: '2026-09-13T10:00:00Z', status: 'limit', detail: 'Claude usage limit reached — try again after the plan resets.' } },
    }))
    let reads = 0
    const m8 = createWatchMonitor({
      stateDir: dir, manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => rows, loadEntries: () => [],
      quote: async () => new Map(), indexLevels: async () => new Map(),
      readPlan: async (row) => { reads += 1; return { status: 'ok', plan: planFor(row, []), detail: 'read', cost_usd: 0.3 } },
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: 'Email is off.' }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    await m8.tick(); await m8.idle()
    assert.equal(reads, 3, 'a limit three days old is over: the list is read as usual')
  })

  await check('a buy call is set up while the plan is limited — it never needed the provider', async () => {
    // A buy call's plan is the record's own bad case and kill criteria; readResearchPlan builds it without a
    // model at all. Held back with the reads that do need one, its single "research says buy now" message
    // would wait on a quota it never used.
    let t = new Date('2026-09-16T09:00:00Z')
    const watch = engineRow('HHH', 'USD', 'NYSE', 'HHH_2026-08-05')
    const buy = engineRow('III', 'USD', 'NYSE', 'III_2026-08-06', 'Buy')
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-9-'))
    fs.mkdirSync(path.join(dir, 'watchlist'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'watchlist', 'monitor-state.json'), JSON.stringify({
      schema_version: 'watch-monitor/v1', switched_on_at: '2026-09-16T08:00:00Z', summary_sent_at: '2026-09-16T08:00:00Z',
      last_tick_at: '2026-09-16T08:55:00Z', names: {}, email_paused: [], pending_summary: {}, email_test: null,
      reads: { 'HHH_2026-08-05': { attempts: 0, last_at: '2026-09-16T08:58:00Z', status: 'limit', detail: 'Claude usage limit reached — try again after the plan resets.' } },
    }))
    const read: string[] = []
    const m9 = createWatchMonitor({
      stateDir: dir, manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [watch, buy], loadEntries: () => [],
      quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.map((s) => [s.key, { quote: quoteOf(s.ticker, 'USD', 120), reason: null }])),
      indexLevels: async () => new Map(),
      readPlan: async (row) => {
        read.push(row.listing.ticker)
        // The provider-free path: a buy call is read without a model, so it succeeds while the plan is limited.
        if (row.decision === 'Buy') return { status: 'ok', plan: planFor(row, []), detail: 'a Buy call', cost_usd: 0 }
        return { status: 'limit', plan: null, detail: 'Claude usage limit reached — try again after the plan resets.', cost_usd: 0 }
      },
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: 'Email is off.' }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    await m9.tick(); await m9.idle()
    await m9.tick(); await m9.idle()
    assert.deepEqual(read, ['III'], 'the buy call is set up; the read that needs the provider waits')
    assert.ok(m9.inbox.list().some((m) => m.ticker === 'III' && m.items.some((i) => i.type === 'research_buy_now')),
      'and its one buy-now message goes out')
  })

  await check('a correction the limit turned away is tried again at the limit\u2019s cadence, not the hour\u2019s', async () => {
    // The re-read keeps the earlier reading, so the plan still says `ok` — and the digest clock was stamped
    // just before the attempt. Read as "already looked at this hour", a corrected bad case would wait 45
    // minutes longer than the limit asks for, on a report the engine already knows has changed.
    let t = new Date('2026-09-16T09:00:00Z')
    const row = engineRow('JJJ', 'USD', 'NYSE', 'JJJ_2026-08-07')
    let digest = 'd'
    let limited = false
    const reads: string[] = []
    const m10 = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-10-')), manual: true,
      now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [row], loadEntries: () => [],
      quote: async () => new Map(), indexLevels: async () => new Map(),
      readPlan: async () => {
        reads.push(digest)
        return limited
          ? { status: 'limit', plan: { ...planFor(row, []), source_digest: 'd' }, detail: 'Claude usage limit reached — try again after the plan resets.', cost_usd: 0 }
          : { status: 'ok', plan: { ...planFor(row, []), source_digest: digest }, detail: 'read', cost_usd: 0.3 }
      },
      currentDigest: () => digest,
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: null }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    const step = async (min: number) => { t = new Date(t.getTime() + min * 60_000); await m10.tick(); await m10.idle() }
    await m10.tick(); await m10.idle()
    assert.deepEqual(reads, ['d'])
    // The report is corrected and the hour is up, so it is re-read — and that read hits the limit.
    digest = 'e'
    limited = true
    await step(61)
    assert.deepEqual(reads, ['d', 'e'], 'the correction was picked up')
    await step(5)
    assert.deepEqual(reads, ['d', 'e'], 'and nothing is retried while the limit holds')
    limited = false
    await step(16)
    assert.deepEqual(reads, ['d', 'e', 'e'], 'tried again 16 minutes later, not 61')
    await step(16)
    assert.deepEqual(reads, ['d', 'e', 'e'], 'and once it is read, the hourly clock governs again')
  })

  await check('a report that shows up after the limit is already known is still watched, not left waiting', async () => {
    // AAA is read first and hits the limit. BBB then appears on a later tick, sorted behind AAA — with the old
    // gate it is skipped outright before readPlan ever runs for it, and AAA (which already has a plan) keeps
    // winning every tick's one probe, so BBB stays `waiting` for the whole outage. It should instead get its own
    // record-only plan straight away, at no cost and with no call to the model.
    let t = new Date('2026-09-16T06:00:00Z')
    const AAA = engineRow('AAA', 'USD', 'NYSE', 'AAA_2026-08-01')
    const BBB = engineRow('BBB', 'USD', 'NYSE', 'BBB_2026-08-02')
    let rows: EngineWatchRow[] = [AAA]
    const reads: string[] = []
    const fallbacks: string[] = []
    const bad = (row: EngineWatchRow): WatchPlan => ({
      ...planFor(row, [{ kind: 'price', id: 'p-bad', role: 'bad_case', low: 10, high: null, currency: 'USD', source: { file: 'decision_record.json', quote: null, field: 'scenario "bear"' }, note: null }]),
      reader: { status: 'not_run', model: null, cost_usd: 0, at: null, detail: '' },
    })
    const m11 = createWatchMonitor({
      stateDir: fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-11-')), manual: true,
      now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => rows, loadEntries: () => [],
      quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.map((s) => [s.key, { quote: quoteOf(s.ticker, 'USD', 50), reason: null }])),
      indexLevels: async () => new Map(),
      readPlan: async (row) => {
        reads.push(row.listing.ticker)
        return { status: 'limit', plan: bad(row), detail: 'Claude usage limit reached — try again after the plan resets.', cost_usd: 0 }
      },
      buildFallbackPlan: (row) => {
        fallbacks.push(row.listing.ticker)
        return { status: 'limit', plan: bad(row), detail: "The plan's usage limit holds elsewhere on the machine, so this report has not been read yet.", cost_usd: 0 }
      },
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: null }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    const step = async (min: number) => { t = new Date(t.getTime() + min * 60_000); await m11.tick(); await m11.idle() }
    const views = () => m11.decorate(mergeWatchlist({
      entries: [], engine: rows, today: t.toISOString().slice(0, 10),
      quotes: new Map(rows.map((r) => [r.listing.listing_key, { quote: quoteOf(r.listing.ticker, 'USD', 50), reason: null }])),
    }).rows)
    await m11.tick(); await m11.idle()
    assert.deepEqual(reads, ['AAA'], 'AAA is tried for real and hits the limit')
    assert.equal(views()[0].watch.plan?.state, 'limit')

    // BBB now shows up, sorted behind AAA, while AAA's limit still holds.
    rows = [AAA, BBB]
    await step(2)
    assert.deepEqual(reads, ['AAA'], 'no second real read went out — the machine-wide wait still holds')
    assert.deepEqual(fallbacks, ['BBB'], 'BBB got its own record-only plan, built with no model call')
    assert.deepEqual(views().map((r) => r.watch.plan?.state), ['limit', 'limit'],
      'BBB is watched on its record, not left "waiting to read" for the whole outage')

    // Once the probe window opens, BBB is not asked twice for a fallback, and both are read for real once the
    // limit clears.
    await step(16)
    assert.deepEqual(fallbacks, ['BBB'], 'a report already holding a fallback plan is not given a second one')
  })

  console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
}

void main()
