// Reading a research report into a watch plan (src/watch/reader.ts), with the model faked. What must hold:
// the report is read ONCE (a second ask for the same files costs nothing), the only spending limit is the
// day's total — a read may use all that is left of it, and none starts once it is spent — and a failed or
// unreadable answer still leaves the record's own fields watched, never a guessed plan.
// Run: npx tsx test/watch-reader.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { READER_SYSTEM, loadPlan, readResearchPlan, type ReaderBudget } from '../src/watch/reader'
import { makeListing } from '../src/watchlist'

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

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-reader-'))
const analyses = path.join(root, 'analyses')
const RUN = 'AMZN_2026-07-10'
fs.mkdirSync(path.join(analyses, RUN), { recursive: true })
fs.writeFileSync(path.join(analyses, RUN, 'decision_record.json'), JSON.stringify({
  ticker: 'AMZN', company_name: 'Amazon.com, Inc.', exchange: 'NasdaqGS', currency: 'USD', decision: 'Watchlist',
  decision_date: '2026-07-10', entry_price: 238.34, entry_price_timestamp: '2026-07-01',
  suggested_action: 'No new position. Track at $190-200 for re-entry (>12% margin of safety on base fair value $210). July 31 Q2 2026 earnings is the first real test.',
  scenarios: [{ label: 'bull', price_target: 247 }, { label: 'base', price_target: 210 }, { label: 'bear', price_target: 146 }],
  kill_criteria: ['Q2 2026 AWS margin <30% AND infrastructure costs growing >25% YoY'],
}))
fs.writeFileSync(path.join(analyses, RUN, 'final_thesis.md'), '# Thesis\n\nWatch for layoffs in the retail arm.\n')

const row = {
  listing: makeListing({ ticker: 'AMZN', currency: 'USD', exchange: 'NasdaqGS', companyName: 'Amazon.com, Inc.' }),
  run_root: `analyses/${RUN}`, decision: 'Watchlist', decision_date: '2026-07-10',
}
const ANSWER = JSON.stringify({
  prices: [
    { role: 'buy', low: 190, high: 200, quote: 'Track at $190-200 for re-entry', file: 'decision_record.json' },
    { role: 'fair', low: 210, high: null, quote: 'base fair value $210', file: 'decision_record.json' },
  ],
  dates: [{ label: 'Q2 2026 earnings', date: '2026-07-31', window: null, what_to_check: null, quote: 'July 31 Q2 2026 earnings is the first real test.', file: 'decision_record.json' }],
  waiting_for: [],
  news: [{ topic: 'Layoffs', quote: 'Watch for layoffs in the retail arm.', file: 'final_thesis.md' }],
})

function fakeBudget(cap: number): ReaderBudget & { spent: () => number } {
  let spent = 0
  let held = 0
  return {
    remaining: () => Math.max(0, cap - spent - held),
    tryReserve: (usd: number) => (usd <= cap - spent - held ? ((held += usd), { usd }) : null),
    reconcile: (r: any, actual: number) => { held -= r.usd; spent += actual },
    spent: () => spent,
  }
}

const calls: any[] = []
const answering = (text: string, costUsd = 0.31) => async (opts: any) => {
  calls.push(opts)
  opts.onToken(text.slice(0, 40))
  opts.onToken(text.slice(40))
  return { costUsd }
}

async function main() {
  const state = path.join(root, 'state')
  const clock = () => new Date('2026-09-15T10:00:00Z')

  await check("reads once: keeps what the text says, adds the record's own fields, records the cost", async () => {
    const budget = fakeBudget(20)
    const out = await readResearchPlan(row, { runTurn: answering(ANSWER), budget, stateDir: state, analysesDir: analyses, model: 'opus', now: clock })
    assert.equal(out.status, 'ok')
    const items = out.plan!.items as any[]
    const prices = items.filter((i) => i.kind === 'price').map((i) => `${i.role}:${i.low}-${i.high}`)
    assert.deepEqual(prices, ['buy:190-200', 'bad_case:146-null'], 'a fair value is not its own line beside a buy price')
    assert.ok(out.plan!.left_out.some((l) => /^fair 210/.test(l.what) && /price to act at/.test(l.why)))
    assert.equal(items.filter((i) => i.kind === 'date')[0].date, '2026-07-31')
    assert.equal(items.filter((i) => i.kind === 'deal_breaker').length, 1)
    assert.equal(items.filter((i) => i.kind === 'news').length, 1)
    assert.equal(out.plan!.reader.cost_usd, 0.31)
    assert.equal(budget.spent(), 0.31)
    assert.equal(calls[0].budgetUsd, 20, 'no stop per read: the whole of what is left today')
    assert.equal(calls[0].model, 'opus')
    assert.equal(calls[0].system, READER_SYSTEM)
    assert.match(calls[0].user, /=== FILE: final_thesis\.md ===/)
    assert.equal(loadPlan(RUN, state)?.reader.status, 'ok')
  })

  await check('the whole day stays readable: each read may use all that is left, and the next is still admitted', async () => {
    // The real ledger, with the costs the first real reads reported. Holding "everything left" once rounded a
    // hair past the ceiling (16.933714000000002 held as 16.933714001) and refused every read after the third.
    const { UsdBudget } = await import('../src/news/triage/budget')
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-reader-budget-'))
    const budget = UsdBudget.load(dir, 20, clock().getTime(), 'watchlist-reader-budget.json')
    const statuses: string[] = []
    for (const cost of [0.607286, 0.852412, 0.856512, 0.750076, 0.8]) {
      const out = await readResearchPlan(row, { runTurn: answering(ANSWER, cost), budget, stateDir: dir, analysesDir: analyses, model: 'opus', now: clock, force: true })
      statuses.push(out.status)
    }
    assert.deepEqual(statuses, ['ok', 'ok', 'ok', 'ok', 'ok'])
    assert.ok(Math.abs(budget.usd - 3.866286) < 1e-9, `spent ${budget.usd}`)
  })

  await check('the same report is never read twice', async () => {
    const before = calls.length
    const out = await readResearchPlan(row, { runTurn: answering(ANSWER), budget: fakeBudget(20), stateDir: state, analysesDir: analyses, model: 'opus', now: clock })
    assert.equal(out.status, 'cached')
    assert.equal(calls.length, before)
  })

  await check('a changed report is read again', async () => {
    fs.appendFileSync(path.join(analyses, RUN, 'final_thesis.md'), '\nAn erratum.\n')
    const before = calls.length
    const out = await readResearchPlan(row, { runTurn: answering(ANSWER), budget: fakeBudget(20), stateDir: state, analysesDir: analyses, model: 'opus', now: clock })
    assert.equal(out.status, 'ok')
    assert.equal(calls.length, before + 1)
  })

  await check("nothing starts once the day's total is spent", async () => {
    const before = calls.length
    const out = await readResearchPlan(row, { runTurn: answering(ANSWER), budget: fakeBudget(0.01), stateDir: path.join(root, 'state-broke'), analysesDir: analyses, model: 'opus', now: clock })
    assert.equal(out.status, 'budget')
    assert.match(out.detail, /reading limit is used up/)
    assert.equal(calls.length, before)
  })

  await check("a failed read still watches the record's own fields, and says why", async () => {
    const stateF = path.join(root, 'state-fail')
    const out = await readResearchPlan(row, {
      runTurn: async () => ({ costUsd: 0.05, error: 'The model was busy.' }),
      budget: fakeBudget(20), stateDir: stateF, analysesDir: analyses, model: 'opus', now: clock,
    })
    assert.equal(out.status, 'failed')
    const saved = loadPlan(RUN, stateF)!
    assert.equal(saved.reader.status, 'failed')
    assert.match(saved.reader.detail, /busy/)
    assert.deepEqual(saved.items.filter((i) => i.kind === 'price').map((i: any) => i.role), ['bad_case'])
  })

  await check('an answer that is not the list is a failure, never a guess', async () => {
    const out = await readResearchPlan(row, { runTurn: answering('Sorry, I cannot help with that.'), budget: fakeBudget(20), stateDir: path.join(root, 'state-junk'), analysesDir: analyses, model: 'opus', now: clock, force: true })
    assert.equal(out.status, 'failed')
    assert.match(out.detail, /not the list/)
  })

  await check('on Codex, which shows no cost per read, each read counts at the estimate', async () => {
    const budget = fakeBudget(20)
    const before = calls.length
    const out = await readResearchPlan(row, { runTurn: answering(ANSWER, 0), budget, stateDir: path.join(root, 'state-codex'), analysesDir: analyses, model: 'codex:gpt-5.6-luna', now: clock })
    assert.equal(out.status, 'ok')
    assert.equal(calls[before].budgetUsd, undefined)
    assert.equal(budget.spent(), 0.5)
  })

  console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
}

void main()
