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

  await check('"seen it" survives a restart, and a NEW passed date brings the name back', async () => {
    let t = new Date('2026-09-15T14:00:00Z')
    const row = engineRow('KKK', 'USD', 'NYSE', 'KKK_2026-08-01')
    const other = engineRow('LLL', 'USD', 'NYSE', 'LLL_2026-08-01')
    let engineRows = [row, other]
    const dated = (id: string, date: string) => ({
      kind: 'date' as const, id, label: `Event ${id}`, date, window: null, estimated: false,
      what_to_check: null, source: { file: 'final_thesis.md', quote: `Event on ${date}`, field: null },
    })
    let items: PlanItem[] = [dated('d1', '2026-09-04')]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-11-'))
    const make = () => createWatchMonitor({
      stateDir: dir, manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => engineRows, loadEntries: () => [],
      quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.map((s) => [s.key, { quote: quoteOf('KKK', 'USD', 50), reason: null }])),
      indexLevels: async () => new Map(),
      readPlan: async (r: EngineWatchRow) => ({
        status: 'ok' as const, plan: planFor(r, r.listing.ticker === 'KKK' ? items : []), detail: 'read', cost_usd: 0.3,
      }),
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: 'Email is off.' }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    const seen = (m: ReturnType<typeof createWatchMonitor>) => m.decorate(mergeWatchlist({
      entries: [], engine: [row], today: t.toISOString().slice(0, 10),
      quotes: new Map([[row.listing.listing_key, { quote: quoteOf('KKK', 'USD', 50), reason: null }]]),
    }).rows)[0].watch
    const seenIds = () => Object.keys(JSON.parse(
      fs.readFileSync(path.join(dir, 'watchlist', 'monitor-state.json'), 'utf8')).seen ?? {})
    const m11 = make()
    await m11.tick(); await m11.idle(); await m11.tick()
    assert.equal(seen(m11).status, 'check_now', 'a passed date needs a look')
    m11.setSeen(row.listing.listing_key, 'results_out:d1', true)
    assert.equal(seen(m11).status, 'waiting', 'and stops needing one once it is seen')
    assert.equal(seen(m11).conditions.length, 1, 'while staying on the name')
    assert.ok(seen(m11).conditions[0].seen_at, 'with the day it was seen')
    m11.stop()

    // A fresh monitor on the same state directory — the acknowledgement is not memory.
    const m12 = make()
    assert.equal(seen(m12).status, 'waiting', 'a restart does not bring it back')
    // A second date passes: a new fact, a new id, and the name is back.
    items = [dated('d1', '2026-09-04'), dated('d2', '2026-09-16')]
    t = new Date('2026-09-17T14:00:00Z')
    await m12.tick(); await m12.idle(); await m12.tick()
    assert.equal(seen(m12).status, 'check_now', 'the new date speaks for itself')
    assert.equal(seen(m12).conditions.filter((c) => !c.seen_at).length, 1)
    m12.setSeen(row.listing.listing_key, 'results_out:d2', true)
    assert.deepEqual(seenIds(), [row.listing.listing_key], 'the acknowledgements are stored under the name')

    // A type that clears itself cannot be acknowledged, and the write is refused rather than stored for a
    // reader that will always ignore it.
    const stored = () => JSON.parse(fs.readFileSync(path.join(dir, 'watchlist', 'monitor-state.json'), 'utf8'))
      .seen[row.listing.listing_key] ?? {}
    assert.equal(m12.setSeen(row.listing.listing_key, 'buy_price_reached:p1', true), 'not_acknowledgeable')
    assert.equal('buy_price_reached:p1' in stored(), false, 'nothing was written')

    // An id whose condition does not exist is swept on the next tick. Ids are built from their own content —
    // a decision date, a date item's hash — so every re-run mints new ones, and without the sweep the old
    // run's marks would sit in the state file for the life of the install.
    assert.equal(m12.setSeen(row.listing.listing_key, 'results_out:ghost', true), 'ok', 'the type is allowed')
    assert.ok('results_out:ghost' in stored(), 'so it is stored')
    await m12.tick(); await m12.idle()
    assert.equal('results_out:ghost' in stored(), false, 'and swept once no condition answers to it')

    // A STATE DIRECTORY THAT WILL NOT TAKE THE WRITE IS NOT AN ACKNOWLEDGEMENT. saveState logs and carries on,
    // so without propagating it the mark lived in memory, the route answered {ok:true}, and a restart lost it.
    fs.chmodSync(path.join(dir, 'watchlist'), 0o500)
    try {
      assert.equal(m12.setSeen(row.listing.listing_key, 'results_out:d1', false), 'not_saved')
      // ROLLED BACK IN MEMORY TOO, not only on disk. Before the fix, the in-memory mutation happened
      // BEFORE saveState() ran, so decorate() — which reads state.seen directly, no restart needed —
      // would show d1 as un-acknowledged the moment the dropped write returned, even though the disk
      // (and the route's own 500) said the take-back never happened.
      assert.ok(seen(m12).conditions.find((c) => c.id === 'results_out:d1')?.seen_at,
        'a dropped save leaves the in-memory mark exactly as it was, not as the failed write intended')
    } finally {
      fs.chmodSync(path.join(dir, 'watchlist'), 0o700)
    }
    assert.deepEqual(Object.keys(stored()).sort(), ['results_out:d1', 'results_out:d2'], 'the real ones stay')
    // The name comes off the list. What you said you had seen goes with it, so re-adding it does not arrive
    // pre-silenced — the ids are built from the dates, which have not changed.
    engineRows = [other]
    await m12.tick(); await m12.idle(); await m12.tick()
    assert.deepEqual(seenIds(), [], 'and leave with it')
    m12.stop()
  })

  await check('a condition acknowledged before this tick ever ran is not reported as a new message', async () => {
    // The exact race: a date passes between two monitor ticks, and the operator sees and acknowledges it
    // through a fresh /api/watchlist read (decorate() + setSeen) before this monitor's own next tick runs.
    // The id has therefore never been in this monitor's fired history — "new" by that measure alone — so
    // without filtering acknowledged conditions out of stepAlerts's input, it would be reported as news.
    let t = new Date('2026-08-01T14:00:00Z')
    const row = engineRow('MMM', 'USD', 'NYSE', 'MMM_2026-08-01')
    const items: PlanItem[] = [{
      kind: 'date', id: 'd1', label: 'Event d1', date: '2026-09-04', window: null, estimated: false,
      what_to_check: null, source: { file: 'final_thesis.md', quote: 'Event on 2026-09-04', field: null },
    }]
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-monitor-13-'))
    const m = createWatchMonitor({
      stateDir: dir, manual: true, now: () => t, today: () => t.toISOString().slice(0, 10),
      loadEngineRows: async () => [row], loadEntries: () => [],
      quote: async (subjects) => new Map<string, QuoteOutcome>(subjects.map((s) => [s.key, { quote: quoteOf('MMM', 'USD', 50), reason: null }])),
      indexLevels: async () => new Map(),
      readPlan: async (r: EngineWatchRow) => ({ status: 'ok' as const, plan: planFor(r, items), detail: 'read', cost_usd: 0.3 }),
      emailConfig: () => ({ enabled: false, recipients: [], appUrl: '', reason: 'Email is off.' }),
      sendEmail: async () => ({ ok: true, detail: '' }),
    })
    // Baseline, well before the date — nothing pending, so the date passing next is genuinely new to this name.
    await m.tick(); await m.idle(); await m.tick()
    assert.equal(m.inbox.list().filter((msg) => msg.listing_key === row.listing.listing_key).length, 0, 'nothing pending yet')

    // The clock alone carries the date past — the plan is untouched, so no re-read is queued — and the
    // acknowledgement lands before the tick that would otherwise have discovered the date had passed.
    t = new Date('2026-09-10T14:00:00Z')
    assert.equal(m.setSeen(row.listing.listing_key, 'results_out:d1', true), 'ok', 'acknowledged ahead of the tick')

    await m.tick(); await m.idle()
    const named = m.inbox.list().filter((msg) => msg.listing_key === row.listing.listing_key)
    assert.ok(!named.some((msg) => msg.items.some((i) => i.id === 'results_out:d1')),
      'a condition acknowledged before this tick must not be reported as new')
    m.stop()
  })

  console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
}

void main()
