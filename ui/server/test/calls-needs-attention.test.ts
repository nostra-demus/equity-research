// AS (forecast overdue) / AW (kill-criteria overdue): live TS port of scripts/eval.py's
// eval_as_forecast_overdue / eval_aw_kill_criteria_overdue (PR #435's suggested next step — surface
// both in GET /api/calls / /research:track without waiting for a manual `/research:eval` run).
// Fixture dates are pinned far in the past (2020) / far in the future (2099) so the assertions never
// drift with the real clock. Run: npx tsx test/calls-needs-attention.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { listAllCalls } from '../src/outputs'
import type { PublishedTreeAuthority } from '../src/published-git'

const DATE = '2020-01-01'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

const files = new Map<string, Buffer>()

function mkCallDir(ticker: string, record: Record<string, unknown>): string {
  const root = `analyses/${ticker}_${DATE}`
  files.set(`${root}/decision_record.json`, Buffer.from(JSON.stringify(record, null, 2)))
  files.set(`${root}/final_thesis.md`, Buffer.from(`# ${ticker}\n`))
  return root
}

function authority(): PublishedTreeAuthority {
  const snapshot = new Map(files)
  return {
    commit: 'a'.repeat(40),
    paths: new Set(snapshot.keys()),
    readRequired(repoPath: string): Buffer {
      const value = snapshot.get(repoPath)
      if (!value) throw Object.assign(new Error('missing test blob'), { code: 'CALLS_AUTHORITY_UNAVAILABLE' })
      return value
    },
    async loadRequired(repoPaths: Iterable<string>): Promise<void> {
      for (const repoPath of repoPaths) {
        const value = snapshot.get(repoPath)
        if (!value) throw Object.assign(new Error('missing test blob'), { code: 'CALLS_AUTHORITY_UNAVAILABLE' })
      }
    },
  }
}

await check('an overdue, still-open forecast_ledger entry is reported with its due date and index', async () => {
    mkCallDir('ZZATTA', {
      ticker: 'ZZATTA', company_name: 'Attention Co A', decision_date: DATE, decision: 'Watchlist',
      forecast_ledger: [
        { prediction: 'thing happens', status: 'open', time_window: 'By 2020-02-01' },
        { prediction: 'later thing', status: 'open', time_window: 'By 2099-01-01' }, // not yet due
        { prediction: 'settled thing', status: 'confirmed', time_window: 'By 2020-02-01' }, // resolved
      ],
    })
    const { calls, needs_attention } = await listAllCalls(authority())
    const c = calls.find((c: any) => c.ticker === 'ZZATTA')
    assert.ok(c, 'call must appear in listAllCalls()')
    assert.equal(c.needs_attention.forecasts_overdue.length, 1, 'only the overdue, still-open entry is flagged')
    assert.equal(c.needs_attention.forecasts_overdue[0].due_date, '2020-02-01')
    assert.match(c.needs_attention.forecasts_overdue[0].description, /forecast_ledger\[0\]/)
    assert.equal(c.needs_attention.kill_criteria_overdue.length, 0)
    const na = needs_attention.filter((n: any) => n.ticker === 'ZZATTA')
    assert.equal(na.length, 1, 'the top-level ranked list must carry the same overdue item')
    assert.equal(na[0].type, 'forecast')
    assert.equal(na[0].run_root, 'analyses/ZZATTA_2020-01-01')
})

await check('an overdue kill_criteria monitor event (free-text month) is reported; an undateable one is not', async () => {
    mkCallDir('ZZATTB', {
      ticker: 'ZZATTB', company_name: 'Attention Co B', decision_date: DATE, decision: 'Watchlist',
      kill_criteria: [
        { criterion: 'auditor resigns', monitor: 'FY2020 results release (~Feb 2020)' }, // overdue (bare month closes on the 28th)
        { criterion: 'regulator acts', monitor: 'a ruling sometime in the future (~Dec 2099)' }, // not yet due
        { criterion: 'no date at all', monitor: 'ongoing management commentary' }, // undateable — never flagged
        'a legacy plain-string kill criterion with no monitor field at all', // undateable — never flagged, never crashes
      ],
    })
    const { calls } = await listAllCalls(authority())
    const c = calls.find((c: any) => c.ticker === 'ZZATTB')
    assert.ok(c)
    assert.equal(c.needs_attention.kill_criteria_overdue.length, 1)
    assert.equal(c.needs_attention.kill_criteria_overdue[0].due_date, '2020-02-28')
    assert.match(c.needs_attention.kill_criteria_overdue[0].description, /kill_criteria\[0\]/)
    assert.match(c.needs_attention.kill_criteria_overdue[0].description, /auditor resigns/)
})

await check('an invalid calendar date embedded in free text (Feb 30) is never returned as a due date', async () => {
    mkCallDir('ZZATTC', {
      ticker: 'ZZATTC', company_name: 'Attention Co C', decision_date: DATE, decision: 'Watchlist',
      forecast_ledger: [{ prediction: 'bad date', status: 'open', time_window: 'By 2020-02-30' }],
    })
    const { calls } = await listAllCalls(authority())
    const c = calls.find((c: any) => c.ticker === 'ZZATTC')
    assert.equal(c.needs_attention.forecasts_overdue.length, 0, 'an invalid calendar date must fall through to undateable, never overdue')
})

await check('the top-level needs_attention list is ranked oldest-due-date first, across tickers', async () => {
    mkCallDir('ZZATTD', {
      ticker: 'ZZATTD', company_name: 'Attention Co D', decision_date: DATE, decision: 'Watchlist',
      forecast_ledger: [{ prediction: 'later', status: 'open', time_window: 'By 2020-06-01' }],
    })
    mkCallDir('ZZATTE', {
      ticker: 'ZZATTE', company_name: 'Attention Co E', decision_date: DATE, decision: 'Watchlist',
      forecast_ledger: [{ prediction: 'earlier', status: 'open', time_window: 'By 2020-03-01' }],
    })
    const { needs_attention } = await listAllCalls(authority())
    const idxD = needs_attention.findIndex((n: any) => n.ticker === 'ZZATTD')
    const idxE = needs_attention.findIndex((n: any) => n.ticker === 'ZZATTE')
    assert.ok(idxE >= 0 && idxD >= 0)
    assert.ok(idxE < idxD, 'the earlier (more overdue) due date must rank first')
})

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
