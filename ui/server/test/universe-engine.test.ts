import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createUniverseEngine, parseUniverseAnswers, universeTasks } from '../src/universe-engine'
import { MODEL_SCHEMA, UNIVERSE_URL, companyImpact, modelTotal, rankModel, isUniverseEngineRead, type ModelRead, type ModelRow } from '../../shared/universe-model'
import { providerDeployIntentPath } from '../src/deploy-barrier'
const at = Date.parse('2026-10-22T00:00:00Z'), stamp = new Date(at).toISOString()
const excerpt = 'ACME confirmed a binding three-year contract adding $40 million of annual revenue, with deliveries beginning next quarter. Management disclosed no new borrowing or share issuance for the contract.'
const row = (ticker = 'ACME', company = 'Acme Corp'): ModelRow => ({ ticker, company, currency: 'USD', price: 10, retrieved_at: stamp,
  signals: { contracts: [{ id: 'STORY-1', source_event_id: 'ARTICLE-1', headline: `${company} (${ticker}) signs a contract`, url: 'https://example.test/filing', source: 'Company release', source_tier: 'company', reported_at: stamp, direction: 'positive', excerpt }] } })
let rows = [row(), { ...row('EMPTY', 'Empty Corp'), signals: {} }, { ...row('UNKNOWN', 'Unknown Corp'), signals: null }]
const read = (): ModelRead => ({ schema_version: MODEL_SCHEMA, source_url: UNIVERSE_URL, rows, total: rows.length, complete: true, refreshing: false, fetched: rows.length, started_at: stamp, completed_at: stamp, next_refresh_at: stamp, stale: false, error: null,
  events: { checked_at: stamp, from: stamp, to: stamp, archive_days: 90, reports_scanned: 1000, latest_report_at: stamp, refreshing: false, error: null } })
const json = (keys: { key: string; ticker: string }[]) => JSON.stringify(keys.map((t) => ({ key: t.key, verdict: 'favorable', company_quote: t.ticker === 'ACME' ? 'Acme Corp' : t.ticker, quote: excerpt.slice(0, 119), reason: 'The binding contract adds contracted revenue as next-quarter deliveries begin.', risk_quote: null, risk: null, horizon: 'Next-quarter deliveries can affect revenue over the next 3–6 months; impact is inferred.', watch: 'Confirm deliveries and customer acceptance next quarter.' })))
const tasks = universeTasks([row()])
assert.equal(tasks.length, 1)
assert.equal(universeTasks([{ ...row(), signals: { contracts: tasks.map((t) => t.event), guidance: tasks.map((t) => t.event) } }]).length, 1)
assert.equal(companyImpact(parseUniverseAnswers(json(tasks), tasks, stamp, 'codex:test').get(tasks[0].key)), true)
assert.equal(parseUniverseAnswers(json(tasks).replace('binding three-year', 'invented four-year'), tasks, stamp, 'codex:test').size, 0)
assert.throws(() => parseUniverseAnswers(json([{ ...tasks[0], key: 'f'.repeat(64) }]), tasks, stamp, 'codex:test'))
assert.equal(parseUniverseAnswers(json(tasks).replace('"Acme Corp"', '"OTHER"'), tasks, stamp, 'codex:test').size, 0)
assert.notEqual(universeTasks([{ ...row(), signals: { contracts: [{ ...tasks[0].event, excerpt: `${excerpt} Changed source.` }] } }])[0].key, tasks[0].key)
assert.equal(universeTasks([{ ...row(), signals: { contracts: [{ ...tasks[0].event, excerpt: undefined }] } }]).length, 0)
const forRow = row('FOR', 'Forestar Group Inc')
forRow.signals!.contracts![0] = { ...forRow.signals!.contracts![0], headline: 'Other Company FOR IMMEDIATE RELEASE', excerpt: `FOR IMMEDIATE RELEASE. ${excerpt}` }
const forTasks = universeTasks([forRow])
const forAnswer = JSON.parse(json(forTasks)); forAnswer[0].company_quote = 'FOR'
assert.equal(parseUniverseAnswers(JSON.stringify(forAnswer), forTasks, stamp, 'codex:test').size, 0, 'a common-word ticker is not issuer identity')
forRow.signals!.contracts![0].headline = 'Forestar announces a contract (NYSE: FOR)'
const qualified = universeTasks([forRow]), qualifiedAnswer = JSON.parse(json(qualified)); qualifiedAnswer[0].company_quote = 'NYSE: FOR'
assert.equal(parseUniverseAnswers(JSON.stringify(qualifiedAnswer), qualified, stamp, 'codex:test').size, 1)
const eaton = row('ETN', 'Eaton Corp PLC')
eaton.signals!.contracts![0].headline = 'Eaton Vance Corp signs an agreement'
const eatonTasks = universeTasks([eaton]), eatonAnswer = JSON.parse(json(eatonTasks)); eatonAnswer[0].company_quote = 'Eaton Vance Corp'
assert.equal(parseUniverseAnswers(JSON.stringify(eatonAnswer), eatonTasks, stamp, 'codex:test').size, 0, 'a longer unrelated issuer name is not an exact match')
const parent = fileURLToPath(new URL('../../../.cache/finviz-model-tests/', import.meta.url))
await fs.mkdir(parent, { recursive: true })
const dir = await fs.mkdtemp(path.join(parent, 'engine-'))
let calls = 0
const infer: NonNullable<Parameters<typeof createUniverseEngine>[1]['infer']> = async (opts) => {
  calls++; assert.match(opts.model, /^codex:/); opts.onToken(json(JSON.parse(opts.user).tasks)); return { costUsd: 0 }
}
const deps = { universe: async () => read(), infer, now: () => at, lease: async <T>(fn: () => Promise<T>) => fn(), schedule: (_fn: () => Promise<void>) => () => {} }
try {
  const engine = createUniverseEngine(dir, deps)
  await engine.start(); await engine.read(read()); assert.equal(calls, 0)
  assert.equal(modelTotal(engine.project(rows)[0]), null)
  await engine.run(); await engine.settled()
  let status = await engine.read(read())
  assert.ok(isUniverseEngineRead(status)); assert.equal(status.status, 'complete')
  assert.equal(status.total_companies, 3); assert.equal(status.processed_companies, 3)
  assert.equal(status.assessed_companies, 1); assert.equal(status.no_evidence_companies, 1); assert.equal(status.unavailable_companies, 1)
  assert.equal(modelTotal(engine.project(rows)[0]), 1); assert.equal(modelTotal(engine.project(rows)[1]), null)
  const fullRead = { ...rows[0], signals: { contracts: [{ ...tasks[0].event, assessment: { ...engine.project(rows)[0].signals!.contracts![0].assessment!, provenance: { kind: 'original' as const, label: null, url: null }, verdict: 'mixed' as const,
    effects: [{ side: 'exposed' as const, mechanism: 'Full article disclosed debt and dilution.', magnitude: null, horizon: null }] } }] } }
  assert.equal(universeTasks([fullRead]).length, 0, 'known full-document effects are never downgraded to excerpt inference')
  assert.equal(modelTotal(engine.project([fullRead])[0]), 0, 'a later richer adverse read vetoes an older favorable excerpt')
  assert.equal(rankModel(engine.project(rows))[0].ticker, 'ACME'); await engine.close()
  const restart = createUniverseEngine(dir, deps)
  await restart.start(); await restart.settled(); assert.equal(calls, 1)
  assert.equal(modelTotal(restart.project(rows)[0]), 1); await restart.close()
  const saved = JSON.parse(await fs.readFile(path.join(dir, 'universe-engine.json'), 'utf8'))
  const runDir = path.join(dir, 'universe-engine-runs', saved.run_id)
  const receipt = (await fs.readdir(runDir)).find((name) => name.endsWith('.json') && !name.endsWith('.result.json'))!
  saved.active = { tasks, receipt_id: receipt.slice(0, -5) }; saved.records = {}; saved.next_at = 0
  await fs.writeFile(path.join(dir, 'universe-engine.json'), JSON.stringify(saved))
  const recovery = createUniverseEngine(dir, deps)
  await recovery.start(); await recovery.settled(); assert.equal(calls, 1)
  assert.equal(modelTotal(recovery.project(rows)[0]), 1); await recovery.close()
  rows = [{ ...row(), signals: { contracts: [tasks[0].event, { ...tasks[0].event, id: 'STORY-2', source_event_id: 'ARTICLE-2' }] } }]
  const partial = createUniverseEngine(path.join(dir, 'partial'), { ...deps, infer: async (opts) => {
    const answers = JSON.parse(json(JSON.parse(opts.user).tasks)); answers[1].verdict = 'insufficient'
    opts.onToken(JSON.stringify(answers)); return { costUsd: 0 }
  } })
  await partial.run(); await partial.settled(); status = await partial.read(read())
  assert.equal(status.assessed_companies, 0, 'one favorable plus one insufficient report is still an unassessed category')
  assert.equal(status.insufficient_companies, 1); assert.equal(modelTotal(partial.project(rows)[0]), null); await partial.close()
  rows = [row('HUGE', 'Huge Corp'), row()]
  rows[0].signals!.contracts![0].excerpt = 'x'.repeat(43_000)
  const oversized = createUniverseEngine(path.join(dir, 'oversized'), deps)
  await oversized.run(); await oversized.settled(); status = await oversized.read(read())
  assert.equal(status.processed_companies, 2); assert.equal(status.failed_reports, 1)
  assert.equal(modelTotal(oversized.project(rows)[1]), 1, 'oversized evidence cannot block the rest of the universe')
  await oversized.close()
  rows = [row()]
  let clock = at, automaticCalls = 0
  const automatic = createUniverseEngine(path.join(dir, 'automatic'), { ...deps, now: () => clock, infer: async (opts) => {
    automaticCalls++; opts.onToken(json(JSON.parse(opts.user).tasks)); return { costUsd: 0 }
  } })
  await automatic.run(); await automatic.settled(); assert.equal(automaticCalls, 1)
  rows[0].signals!.contracts![0].excerpt += ' The issuer confirmed changed delivery terms.'
  clock += 60_001; await automatic.tick(); await automatic.settled()
  assert.equal(automaticCalls, 2, 'changed evidence is picked up automatically without another run request')
  await automatic.close()
  rows = Array.from({ length: 425 }, (_, i) => row(`CO${i}`, `Company ${i}`))
  const all = createUniverseEngine(path.join(dir, 'all'), { ...deps, infer: async (opts) => {
    calls++; opts.onToken(JSON.stringify(JSON.parse(opts.user).tasks.map((t: any) => ({ key: t.key, verdict: 'insufficient', company_quote: '', quote: '', reason: 'The saved excerpt does not establish the selected issuer identity.', risk: null, risk_quote: null, horizon: '', watch: '' })))); return { costUsd: 0 }
  } })
  await all.run(); await all.settled(); status = await all.read(read())
  assert.equal(status.completed_reports, 425, 'no eviction at the old 400-event enrichment cache limit')
  assert.equal(status.insufficient_companies, 425); assert.equal(status.processed_companies, 425); assert.equal(status.failed_reports, 0); await all.close()
  rows = [row()]
  let blockedCalls = 0
  const quota = createUniverseEngine(path.join(dir, 'quota'), { ...deps, infer: async () => { blockedCalls++; return { costUsd: 0, error: 'Codex usage limit reached — try again after the plan resets.' } } })
  await quota.run(); await quota.settled(); assert.equal((await quota.read(read())).status, 'blocked')
  await quota.tick(); await quota.settled(); assert.equal(blockedCalls, 1); await quota.close()
  const quotaRestart = createUniverseEngine(path.join(dir, 'quota'), { ...deps, infer: async () => { blockedCalls++; return { costUsd: 0 } } })
  await quotaRestart.start(); await quotaRestart.settled(); assert.equal(blockedCalls, 1); await quotaRestart.close()
  let throwCalls = 0
  const throwing = createUniverseEngine(path.join(dir, 'throwing'), { ...deps, infer: async (opts) => {
    if (++throwCalls === 1) throw new Error('private diagnostic')
    opts.onToken(json(JSON.parse(opts.user).tasks)); return { costUsd: 0 }
  } })
  await throwing.run(); await throwing.settled(); status = await throwing.read(read())
  assert.equal(status.failed_reports, 1); assert.equal(status.error, null)
  await throwing.run(true); await throwing.settled()
  assert.equal(throwCalls, 2); assert.equal(modelTotal(throwing.project(rows)[0]), 1, 'one explicit retry recovers an unexpected inference failure')
  await throwing.close()
  const abortDir = path.join(dir, 'abort')
  let abortEntered!: () => void, abortSettled = false
  const abortEntry = new Promise<void>((resolve) => { abortEntered = resolve })
  const aborting = createUniverseEngine(abortDir, { ...deps, infer: async (opts) => {
    abortEntered(); await new Promise<void>((resolve) => opts.signal.addEventListener('abort', () => resolve(), { once: true }))
    await new Promise(setImmediate); abortSettled = true; return { costUsd: 0, error: 'aborted' }
  } })
  await aborting.run(); await abortEntry; await fs.writeFile(providerDeployIntentPath(abortDir), 'local deployment')
  const keepAlive = setInterval(() => {}, 1000)
  try { await aborting.settled() } finally { clearInterval(keepAlive) }
  assert.equal(abortSettled, true)
  assert.equal((await aborting.read(read())).failed_reports, 1, 'uncertain interrupted work requires explicit retry')
  await aborting.close()
  const holdDir = path.join(dir, 'deploy')
  let release!: () => void, entered!: () => void
  const enteredPromise = new Promise<void>((resolve) => { entered = resolve })
  const held = createUniverseEngine(holdDir, { ...deps, infer: async (opts) => { entered(); await new Promise<void>((resolve) => { release = resolve }); opts.onToken(json(JSON.parse(opts.user).tasks)); return { costUsd: 0 } } })
  await held.run(); await enteredPromise; await fs.writeFile(providerDeployIntentPath(holdDir), 'local test deployment')
  let closed = false
  const closing = held.close().then(() => { closed = true })
  await new Promise(setImmediate); assert.equal(closed, false)
  release(); await closing; assert.equal(modelTotal(held.project(rows)[0]), 1)
} finally { await fs.rm(dir, { recursive: true, force: true }) }
console.log('universe-engine: explicit admission, evidence, all-company progress, recovery, quota and deployment settlement passed')
