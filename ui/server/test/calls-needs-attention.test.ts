// AS (forecast overdue) / AW (kill-criteria overdue): live TS port of scripts/eval.py's
// eval_as_forecast_overdue / eval_aw_kill_criteria_overdue (PR #435's suggested next step — surface
// both in GET /api/calls / /research:track without waiting for a manual `/research:eval` run).
// Fixture dates are pinned far in the past (2020) / far in the future (2099) so the assertions never
// drift with the real clock. Run: npx tsx test/calls-needs-attention.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { forecastsOverdue, listAllCalls } from '../src/outputs'
import type { ReviewForecastSource } from '../src/outputs'
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

await check('a forecast resolved by a filed review is not overdue; a walked-back resolution is flagged', async () => {
    const root = mkCallDir('ZZATTF', {
      ticker: 'ZZATTF', company_name: 'Attention Co F', decision_date: DATE, decision: 'Watchlist',
      forecast_ledger: [
        { prediction: 'Revenue beats', status: 'open', time_window: 'By 2020-02-01' }, // resolved by text
        { prediction: 'Margin holds', status: 'open', time_window: 'By 2020-02-01' },  // resolved by forecast_index
        { prediction: 'Capex cut', status: 'open', time_window: 'By 2020-02-01' },     // confirmed, then walked back
        { prediction: 'Dup', status: 'open', time_window: 'By 2020-02-01' },           // ambiguous text — never linked
        { prediction: 'dup', status: 'open', time_window: 'By 2020-02-01' },
      ],
    })
    const review = (date: string, rows: unknown[], suffix = '') =>
      files.set(`${root}/reviews/${date}_30d_decision_review${suffix}.json`,
        Buffer.from(JSON.stringify({ review_date: date, review_window: '30d', forecast_results: rows })))
    review('2020-03-01', [
      { prediction: '  revenue   BEATS ', status: 'Confirmed' },
      { prediction: 'see ledger', forecast_index: 2, status: 'falsified' },
      { prediction: 'Capex cut', status: 'confirmed' },
      { prediction: 'DUP', status: 'confirmed' },
    ])
    review('2020-03-01', [{ prediction: 'forecast #3', status: 'not assessable' }], '_v2')
    const { calls } = await listAllCalls(authority())
    const c = calls.find((c: any) => c.ticker === 'ZZATTF')
    const owed = c.needs_attention.forecasts_overdue
    assert.deepEqual(owed.map((o: any) => o.description.match(/forecast_ledger\[(\d+)\]/)[1]), ['2', '3', '4'])
    assert.match(owed[0].description, /CONTRADICTION — the 2020-03-01 review recorded 'confirmed'/)
    assert.deepEqual(owed[0].contradicted_resolution, { status: 'confirmed', date: '2020-03-01' })
    assert.deepEqual(owed[0].last_review, { date: '2020-03-01', status: 'not assessable' })
    assert.equal(owed[1].last_review, undefined, 'ambiguous duplicate text is never linked')
})

const openForecast = (prediction: unknown, probability: unknown = 55) => ({
  prediction, probability, status: 'open', due_date: '2020-02-01',
})
const filedReview = (rows: unknown[], date = '2020-03-01', suffix = ''): ReviewForecastSource => ({
  review_date: date, basename: `${date}_30d_decision_review${suffix}.json`, forecast_results: rows,
})

await check('the filed HCG identity pair links once without rewriting either original prediction', () => {
  // Frozen identity from HCG_2026-06-01 ledger[2] and its 2026-09-02 90d review[2].
  // Due dates below are synthetic; this tests identity, not source timing or financial outcomes.
  const original = 'FQ1 FY27 revenue misses the ~INR 7,340.9M (~+20% implied) consensus bar'
  const reviewed = 'FQ1 FY27 revenue misses the ~INR 7,340.9M (~+20% implied) consensus bar.'
  const ledger = [openForecast('Debt rises'), openForecast('Margin holds'), openForecast(original)]
  const before = forecastsOverdue(ledger, '2026-09-03')
  const after = forecastsOverdue(ledger, '2026-09-03', [filedReview([
    { prediction: reviewed, status: 'confirmed' },
  ], '2026-09-02')])
  assert.equal(before.length, 3)
  assert.equal(after.length, 2, 'one filed outcome clears exactly its original forecast')
  assert.deepEqual(after, before.slice(0, 2), 'other original forecasts remain owed')
  assert.equal(ledger[2].prediction, original)
})

await check('one terminal ASCII full stop links in either direction with existing whitespace normalization', () => {
  const prediction = 'Q1 FY27 revenue below INR 7,340.9M'
  for (const [ledgerText, reviewText] of [[prediction, prediction + '.'], [prediction + '.', prediction]]) {
    assert.deepEqual(forecastsOverdue([openForecast(ledgerText)], '2020-04-01', [filedReview([
      { prediction: `  ${reviewText.replace('revenue below', 'REVENUE   below')}  `, status: 'confirmed' },
    ])]), [])
  }
})

await check('terminal-full-stop fallback rejects changed claims, other punctuation and malformed identities', () => {
  const prediction = 'Q1 FY27 revenue below INR 7,340.9M by 2020-03-01'
  const changed: unknown[] = [
    prediction.replace('7,340.9', '7,340.8') + '.',
    prediction.replace('below', 'above') + '.',
    prediction.replace('Q1', 'Q2') + '.',
    prediction.replace('FY27', 'FY28') + '.',
    prediction.replace('2020-03-01', '2020-03-02') + '.',
    prediction.replace('below', 'not below') + '.',
    prediction.replace('below', 'materially below') + '.',
    prediction + '!', prediction + '?', prediction + '..', prediction + ' .', prediction + '。',
    null, [], {}, '', '.',
  ]
  for (const text of changed) {
    const owed = forecastsOverdue([openForecast(prediction)], '2020-04-01', [filedReview([
      { prediction: text, status: 'confirmed' },
    ])])
    assert.equal(owed.length, 1, `changed or malformed review remains unmatched: ${JSON.stringify(text)}`)
    assert.equal(owed[0].last_review, undefined, 'no positional fallback')
  }
  for (const [ledgerText, reviewText] of [
    ['Revenue < 100', 'Revenue <= 100.'], ['Revenue < 100', 'Revenue < 100.0.'],
    ['EPS up..', 'EPS up...'], ['EPS up .', 'EPS up'],
    ...['!', '?', '$', '--', '()', '>='].map(token => [token, token + '.']),
  ]) {
    const owed = forecastsOverdue([openForecast(ledgerText)], '2020-04-01', [filedReview([
      { prediction: reviewText, status: 'confirmed' },
    ])])
    assert.equal(owed.length, 1, `unsupported identity stays unmatched: ${ledgerText} / ${reviewText}`)
    assert.equal(owed[0].last_review, undefined)
  }
})

await check('every original ledger row blocks ambiguous fallback, including invalid probabilities', () => {
  for (const duplicate of ['Margin expands', '  MARGIN   expands  ']) {
    const ledger = [openForecast('Margin expands'), openForecast(duplicate, 0.8)]
    const owed = forecastsOverdue(ledger, '2020-04-01', [filedReview([
      { prediction: 'Margin expands.', status: 'confirmed' },
    ])])
    assert.equal(owed.length, 2, 'invalid-probability duplicates remain identity candidates')
    assert.ok(owed.every(item => item.last_review === undefined))
  }
  const variants = [openForecast('Margin expands'), openForecast('Margin expands.', 0.8)]
  const owed = forecastsOverdue(variants, '2020-04-01', [filedReview([
    { prediction: 'Margin expands.', status: 'confirmed' },
  ])])
  assert.equal(owed.length, 1, 'an exact unique variant still wins before fallback ambiguity')
  assert.match(owed[0].description, /forecast_ledger\[0\]/)
})

await check('existing numeric index, exact-text and # reference precedence stays ahead of fallback', () => {
  const ledger = [openForecast('EPS up'), openForecast('Debt rises')]
  for (const row of [
    { prediction: 'EPS up.', forecast_index: 2.0, status: 'confirmed' },
    { prediction: 'EPS up', forecast_index: 2, status: 'confirmed' },
  ]) {
    const owed = forecastsOverdue(ledger, '2020-04-01', [filedReview([row])])
    assert.equal(owed.length, 1)
    assert.match(owed[0].description, /forecast_ledger\[0\]/, 'explicit index keeps priority')
  }
  const refLedger = [openForecast('forecast #2.'), openForecast('Debt rises')]
  const referred = forecastsOverdue(refLedger, '2020-04-01', [filedReview([
    { prediction: 'forecast #2', status: 'confirmed' },
  ])])
  assert.equal(referred.length, 1)
  assert.match(referred[0].description, /forecast_ledger\[0\]/, '# reference precedes sentence fallback')
  const exact = forecastsOverdue([openForecast('forecast #2'), openForecast('Debt rises')], '2020-04-01', [filedReview([
    { prediction: 'forecast #2', status: 'confirmed' },
  ])])
  assert.equal(exact.length, 1)
  assert.match(exact[0].description, /forecast_ledger\[1\]/, 'unique exact text precedes # reference')
  assert.equal(forecastsOverdue(ledger, '2020-04-01', [filedReview([
    { prediction: 'forecast 2', forecast_index: '2', status: 'confirmed' },
  ])]).length, 2, 'no # or string-index broadening')
})

await check('full-stop fallback preserves latest-per-entry history and walked-back-resolution contradictions', () => {
  const ledger = [openForecast('EPS up'), openForecast('Debt rises')]
  const reviews = [
    filedReview([{ prediction: 'EPS up.', status: 'not assessable' }], '2020-04-01', '_v2'),
    filedReview([{ prediction: 'EPS up.', status: 'confirmed' }], '2020-04-01'),
    filedReview([{ prediction: 'EPS up', status: 'still open' }], '2020-03-01'),
    filedReview([{ prediction: 'Debt rises.', status: 'confirmed' }], '2020-02-15'),
  ]
  const owed = forecastsOverdue(ledger, '2020-05-01', reviews)
  assert.equal(owed.length, 1, 'a later review of another forecast does not erase the earlier debt resolution')
  assert.deepEqual(owed[0].last_review, { date: '2020-04-01', status: 'not assessable' })
  assert.deepEqual(owed[0].contradicted_resolution, { date: '2020-04-01', status: 'confirmed' })
  assert.match(owed[0].description, /CONTRADICTION/)
  assert.deepEqual(forecastsOverdue(ledger, '2020-06-01', [...reviews,
    filedReview([{ prediction: 'EPS up.', status: 'falsified' }], '2020-05-01'),
  ]), [], 'a later resolution clears the contradiction using the existing status policy')
})

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
