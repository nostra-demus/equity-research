// The watchlist clock end to end (src/watch/monitor.ts), with prices, reports and email faked. It walks the
// operator's own day: switch-on sends ONE summary of what was already true (no flood), a price crossing its
// buy line sends one urgent message and one email, hovering sends nothing more, a real move away and back
// sends again, a name whose research turns Avoid comes off with the reason, and a long gap in checks is
// reported rather than silently skipped.
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
let engine: EngineWatchRow[] = [AMZN, INDIAMART]
const price: Record<string, number> = { 'AMZN|USD': 230, 'INDIAMART|INR': 1666.5 }
const plans: Record<string, WatchPlan> = {
  [AMZN.run_root]: planFor(AMZN, [{ kind: 'price', id: 'p-buy', role: 'buy', low: 190, high: 200, currency: 'USD', source: src('Track at $190-200 for re-entry'), note: null }]),
  [INDIAMART.run_root]: planFor(INDIAMART, [{ kind: 'price', id: 'p-look', role: 'look_again', low: 1699, high: null, currency: 'INR', source: src('revisit if price falls toward the ₹1,699 base fair value'), note: null }]),
}
const quoteOf = (ticker: string, currency: string, p: number): LiveQuote => ({
  ticker, symbol: ticker, name: `${ticker} Inc`, exchange: 'X', currency, price: p, as_of: clock.toISOString(),
  as_of_is_close: false, delayed: true, source: 'cnbc', stale: false,
})
const emails: any[][] = []
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
    assert.equal(messages().length, 0, 'nothing before the reports are read')
    await monitor.idle()
    later(1)
    await monitor.tick()
    const all = messages()
    assert.equal(all.length, 1)
    assert.equal(all[0].kind, 'summary')
    assert.match(all[0].title, /Watching 2 names — 1 already needs a look/)
    assert.ok(all[0].items.some((i) => i.ticker === 'INDIAMART' && i.type === 'look_again_reached'))
    assert.equal(all[0].urgent, false, 'the switch-on summary is never emailed')
    assert.equal(emails.length, 0)
  })

  await check('a price crossing its buy line: one urgent message, one email', async () => {
    later(10)
    price['AMZN|USD'] = 199
    await monitor.tick()
    const amzn = forName('AMZN')
    assert.equal(amzn.length, 1)
    assert.equal(amzn[0].status, 'buy_price_reached')
    assert.equal(amzn[0].urgent, true)
    assert.equal(emails.length, 1)
    assert.equal(emails[0][0].message.ticker, 'AMZN')
    assert.equal(amzn[0].email.state, 'sent')
  })

  await check('hovering at the line sends nothing more', async () => {
    later(10); price['AMZN|USD'] = 203; await monitor.tick()
    later(10); price['AMZN|USD'] = 199.5; await monitor.tick()
    assert.equal(forName('AMZN').length, 1)
    assert.equal(emails.length, 1)
  })

  await check('a clear move away and back is news again', async () => {
    later(40); price['AMZN|USD'] = 210; await monitor.tick()
    later(40); price['AMZN|USD'] = 198; await monitor.tick()
    assert.equal(forName('AMZN').length, 2)
    assert.equal(emails.length, 2)
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
    const sys = messages().find((m) => m.kind === 'system')
    assert.ok(sys)
    assert.match(sys!.title, /was off for 2\.5 hours/)
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

  console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
}

void main()
