// Shared accounting identities, not company forecasts: three issuer contexts through the REAL
// sandboxed loader -> stubbed selected-model parser -> Python CLI -> authoritative backend context.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const outputRoot = path.join(sourceRoot, '.cache', 'test-output')
fs.mkdirSync(outputRoot, { recursive: true })
const scratch = fs.mkdtempSync(path.join(outputRoot, 'chat-additive-'))
fs.mkdirSync(path.join(scratch, 'analyses'), { recursive: true })
fs.mkdirSync(path.join(scratch, 'scripts'), { recursive: true })
fs.mkdirSync(path.join(scratch, '.claude', 'agents'), { recursive: true })
process.env.ENGINE_REPO_ROOT = scratch
process.env.ENGINE_STATE_DIR = path.join(scratch, '.state')
process.env.NOSTRA_ENGINE_CONFIG_DIR = path.join(scratch, 'no-secrets')
process.env.ENGINE_TEST_RUN = '1'
const engine = path.join(scratch, 'scripts', 'sensitivity_math.py')
const callsLog = path.join(scratch, 'engine-calls.jsonl')
const realEngine = path.join(sourceRoot, 'scripts', 'sensitivity_math.py')
const engineWrapper = [
  'import runpy,sys,json',
  `sys.path.insert(0, ${JSON.stringify(path.join(sourceRoot, 'scripts'))})`,
  `with open(${JSON.stringify(callsLog)}, 'a') as log: log.write(json.dumps({'engine':${JSON.stringify(realEngine)}})+'\\n')`,
  `runpy.run_path(${JSON.stringify(realEngine)}, run_name='__main__')`,
  '',
].join('\n')
fs.writeFileSync(engine, engineWrapper)

// Environment isolation happens before config/load-env imports; no provider or production file is read.
const api = await import('../src/chat-whatif')
type Sidecar = import('../src/chat-whatif').SensitivitySidecar
type Intent = import('../src/chat-whatif').ParsedAdditiveIntent
const fixtureFile = path.join(sourceRoot, 'scripts', 'fixtures', 'sensitivity_additive_cases.json')
const fixtures = JSON.parse(fs.readFileSync(fixtureFile, 'utf8')).fixtures as {
  case_id: string; sidecar: Sidecar; request: Record<string, any>; expected: Record<string, any>
}[]
assert.equal(fixtures.length, 3, 'Never silently pass with no representative fixtures')
const clone = <T>(value: T): T => structuredClone(value)
const engineCalls = () => fs.existsSync(callsLog) ? fs.readFileSync(callsLog, 'utf8').trim().split('\n').filter(Boolean).length : 0
let serial = 0
let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}
function writeSidecar(sidecar: Sidecar): string {
  const run = `analyses/CASE_${++serial}`
  const dest = path.join(scratch, run, 'earnings')
  fs.mkdirSync(dest, { recursive: true })
  fs.writeFileSync(path.join(dest, 'sensitivity_summary.json'), JSON.stringify(sidecar))
  return run
}
function intentFrom(request: Record<string, any>): Intent {
  const { operation: _operation, question: _question, ...intent } = request
  return intent as Intent
}
async function run(sidecar: Sidecar, question: string, intent: unknown) {
  let parserCalls = 0
  let starts = 0
  const result = await api.runAdditiveAccounting(writeSidecar(sidecar), question, async (system, user) => {
    parserCalls++
    assert.match(system, /NEVER calculate/)
    assert.ok(user.includes(question), 'The exact original question must reach the parser')
    assert.ok(user.includes('RECORDED ADDITIVE ACCOUNTING IDENTITIES'))
    return JSON.stringify({ intents: [], additive_intents: [intent] })
  }, undefined, () => { starts++ })
  return { turn: result, parserCalls, starts }
}
function assertRefused(turn: Awaited<ReturnType<typeof api.runAdditiveAccounting>>) {
  assert.ok(turn, 'A selected accounting question needs an explicit result/refusal')
  assert.notEqual(turn.result?.status, 'computed')
  assert.equal(turn.result?.remainder ?? null, null)
  assert.match(turn.context, /REFUSAL|WITHHELD/)
  assert.match(turn.context, /not|never|withheld/i)
}

await check('actual Ask wiring invokes the shared pipeline before the digit-only coefficient gate', () => {
  const source = fs.readFileSync(path.join(sourceRoot, 'ui/server/src/server.ts'), 'utf8')
  const start = source.indexOf('let computedBlock: string | undefined')
  const end = source.indexOf('buildChatPrompts({ assembled', start)
  assert.ok(start >= 0 && end > start)
  const branch = source.slice(start, end)
  const additiveCall = branch.indexOf('await runAdditiveAccounting(runRoot, last.content, parserCall, ac.signal')
  assert.ok(additiveCall >= 0, 'Removing the real Ask caller must fail this regression')
  assert.ok(additiveCall < branch.indexOf('detectWhatIf(last.content)'), 'Numberless additive questions must reach the shared caller')
  assert.match(branch, /if \(additive\) \{\s*computedBlock = additive\.context\s*\} else if/)
  assert.doesNotMatch(branch, /computedPayloads\.push\(additive|kind:\s*['"]additive['"]/)
})

await check('loader/detector supports numberless additive data without stealing coefficient questions', () => {
  for (const fixture of fixtures) {
    const loaded = api.loadSidecar(writeSidecar(fixture.sidecar))
    assert.ok(loaded)
    assert.equal(api.detectAdditiveWhatIf(fixture.request.question, loaded.sidecar), true)
    assert.equal(api.detectWhatIf(fixture.request.question), false, 'These historical queries must not depend on the old digit gate')
    assert.equal(api.detectAdditiveWhatIf('how much is EBITDA if input price rises 10?', loaded.sidecar), false)
  }
})

for (const fixture of fixtures) await check(`${fixture.case_id}: source-bound real-loader/parser/CLI/context roundtrip`, async () => {
  const before = engineCalls()
  const { turn, parserCalls, starts } = await run(fixture.sidecar, fixture.request.question, intentFrom(fixture.request))
  assert.equal(parserCalls, 1)
  assert.equal(starts, 1)
  assert.equal(engineCalls(), before + 1, 'A helper-only or stubbed numerical answer cannot pass')
  assert.ok(turn?.result)
  assert.equal(turn.result.component_sum, fixture.expected.displayed_sum)
  assert.equal(turn.result.displayed_gap, fixture.expected.displayed_gap)
  assert.equal(turn.result.remainder, fixture.expected.required_remainder)
  assert.ok(turn.result.sources.length)
  assert.ok(turn.context.includes('accounting_standard') && turn.context.includes('scope'))
  assert.match(turn.context, /not a company forecast/)
  assert.equal('coefficient' in turn.result, false)
  assert.equal('impact' in turn.result, false)
  if (fixture.expected.required_remainder === null) assertRefused(turn)
  else assert.equal(turn.result.status, 'computed')
})

await check('reconciliation exposes the full signed build without inventing a remainder or ignoring a target', async () => {
  for (const fixture of fixtures) {
    const identity: any = fixture.sidecar.additive_identities![0]
    const question = `Reconcile ${identity.label} for ${identity.context.period_label}?`
    const intent: Intent = { identity_id: identity.identity_id, mode: 'reconcile' }
    const turn = (await run(fixture.sidecar, question, intent)).turn
    assert.ok(turn?.result)
    assert.equal(turn.result.component_sum, fixture.expected.displayed_sum)
    assert.equal(turn.result.displayed_gap, fixture.expected.displayed_gap)
    assert.equal(turn.result.remainder, null)
    assert.equal(turn.result.mode, 'reconcile')
    if (fixture.expected.displayed_gap) assertRefused(turn)
    else assert.match(turn.context, /No remainder was requested/)
    assertRefused((await run(fixture.sidecar, question, { ...intent, target: 1 })).turn)
  }
})

await check('recorded IDs cannot select a different component or enlarge the requested group', async () => {
  const alphabet = fixtures[1]
  const wrong = { ...intentFrom(alphabet.request), remainder_component_ids: ['other_bets'] }
  assertRefused((await run(alphabet.sidecar, alphabet.request.question, wrong)).turn)
  const amazon = fixtures[0]
  const question = amazon.request.question.replace('North America plus International', 'North America')
  assertRefused((await run(amazon.sidecar, question, intentFrom(amazon.request))).turn)
  assertRefused((await run(alphabet.sidecar, alphabet.request.question.replace('Google Cloud?', 'not Google Cloud?'), intentFrom(alphabet.request))).turn)
})

await check('money targets must be the literal requested total in the recorded currency/scale', async () => {
  const fixture = fixtures[0]
  const prefix = fixture.request.question.replace(/\?$/, '')
  for (const [clause, target] of [
    ['if total is 31 USD billion', 31],
    ['if total is 31 billion', 31000],
    ['if total is 31,000 NOK million', 31000],
    ['for the year 2027', 2027],
    ['with AWS at 17,773 USD million', 17773],
    ['if total is 31,000 USD million or total is 32,000 USD million', 31000],
  ] as const) {
    assertRefused((await run(fixture.sidecar, `${prefix} ${clause}?`, { ...intentFrom(fixture.request), target })).turn)
  }
  const result = await run(fixture.sidecar, `${prefix} if total is 0 USD million?`, { ...intentFrom(fixture.request), target: 0 })
  assert.equal(result.turn?.result?.status, 'computed')
  assert.equal(result.turn?.result?.remainder, -17773, 'Zero target and negative remainder are real values, not missing/clamped')
  assert.equal(result.turn.result.target_hypothetical, true)
})

await check('future period requires grounded target/profile, held references and separately explicit residual', async () => {
  const fixture = clone(fixtures[0])
  const identity: any = fixture.sidecar.additive_identities![0]
  const profile = identity.conditional_profiles[0]
  const prefix = fixture.request.question.replace(/\?$/, '')
  const futureQuestion = `${prefix} if total is 31,000 USD million for ${profile.target_period_label} under ${profile.label}?`
  const intent = { ...intentFrom(fixture.request), target: 31000, conditional_profile_id: profile.profile_id }
  const unknownResidual = (await run(fixture.sidecar, futureQuestion, intent)).turn
  assertRefused(unknownResidual)
  assert.equal(unknownResidual?.result?.reason, 'unknown_future_residual')
  assert.equal(unknownResidual.result.source_total, 28076, 'Qualified withholding keeps the original source facts')
  profile.residual.assumption = 'Future reconciliation amount is unknown; no zero is inferred from the historical identity.'
  const qualifiedUnknown = (await run(fixture.sidecar, futureQuestion, intent)).turn
  assertRefused(qualifiedUnknown)
  assert.equal(qualifiedUnknown?.result?.reason, 'unknown_future_residual')
  assert.ok(qualifiedUnknown.result.assumptions.includes(profile.residual.assumption))
  profile.residual = { value: 0, assumption: 'Explicit software sensitivity assumption: no new reconciliation term; not an observed Q4 fact.' }
  const good = (await run(fixture.sidecar, futureQuestion, intent)).turn
  assert.equal(good?.result?.status, 'computed')
  assert.equal(good.result.remainder, 13227)
  assert.equal(good.result.source_period?.label, 'Q3 2026')
  assert.equal(good.result.target_period?.label, 'Q4 2026')
  assert.equal(good.result.conditional_profile_id, profile.profile_id)
  assert.equal(good.result.assumed_residual, 0)
  assert.ok(good.result.assumptions.length >= 2)
  assertRefused((await run(fixture.sidecar, `${prefix} for ${profile.target_period_label} under ${profile.label}?`, { ...intent, target: undefined })).turn)
  assertRefused((await run(fixture.sidecar, futureQuestion.replace('for Q4 2026', 'for Q4 2027'), intent)).turn)
  assertRefused((await run(fixture.sidecar, futureQuestion.replace('for Q4 2026', 'for next quarter'), intent)).turn)
  delete profile.component_holds.aws
  assertRefused((await run(fixture.sidecar, futureQuestion, intent)).turn)
})

await check('a future hold cannot repair a gapped source identity and its refused context keeps the request', async () => {
  const fixture: any = clone(fixtures[2])
  const identity = fixture.sidecar.additive_identities[0]
  const selected = fixture.request.remainder_component_ids
  const profile = {
    profile_id: 'held_reference_next', label: 'Q2 2026 held source reference',
    target_period_start: '2026-04-01', target_period_end: '2026-06-30', target_period_basis: 'standalone_flow', target_period_label: 'Q2 2026',
    assumption: 'Software test conditional hold only; no forecast or source-gap repair.',
    component_holds: Object.fromEntries(identity.components.filter((component: any) => !selected.includes(component.component_id)).map((component: any) => [component.component_id, `Assume ${component.label} unchanged for the conditional target period.`])),
    residual: { value: 0, assumption: 'Explicit hypothetical future residual, not a measured correction to the source gap.' },
  }
  identity.conditional_profiles = [profile]
  const question = fixture.request.question.replace(/\?$/, '') + ` if total is 10,000 NOK million for ${profile.target_period_label} under ${profile.label}?`
  const turn = (await run(fixture.sidecar, question, { ...intentFrom(fixture.request), target: 10000, conditional_profile_id: profile.profile_id })).turn
  assertRefused(turn)
  assert.equal(turn?.result?.reason, 'unresolved_displayed_gap')
  assert.equal(turn.result.displayed_gap, 1)
  assert.deepEqual(turn.result.remainder_component_ids, selected)
  assert.equal(turn.result.source_period?.label, 'Q1 2026')
  assert.equal(turn.result.target_period?.label, 'Q2 2026')
  assert.equal(turn.result.conditional_profile_id, profile.profile_id)
  assert.equal(turn.result.assumed_residual, 0)
  assert.equal(turn.result.known_components.length, identity.components.length - selected.length)
})

await check('basis, currency, scale, scope, regime and source-period mismatches never yield a remainder', async () => {
  const fixture = fixtures[0]
  for (const [key, value] of [
    ['basis', 'company_adjusted:other'], ['currency', 'NOK'], ['scale', 'thousands'],
    ['scope', 'standalone_entity'], ['accounting_standard', 'IFRS'], ['period_start', '2025-07-01'],
    ['entity', 'A different reporting parent'], ['period_basis', 'cumulative_flow'],
  ]) {
    const sidecar = clone(fixture.sidecar)
    ;(sidecar.additive_identities![0].components[0].context as any)[key] = value
    assertRefused((await run(sidecar, fixture.request.question, intentFrom(fixture.request))).turn)
  }
  for (const metric of ['EPS', 'per_share', 'EBITDA_margin', 'growth', 'return', 'cash_balance']) {
    const sidecar: any = clone(fixture.sidecar)
    const identity = sidecar.additive_identities[0]
    for (const operand of [identity, identity.total, ...identity.components]) operand.context.metric = metric
    assertRefused((await run(sidecar, fixture.request.question, intentFrom(fixture.request))).turn)
  }
})

await check('missing sources, duplicate/overlapping components and nonnumeric operands cannot bypass the caller', async () => {
  const fixture = fixtures[0]
  const mutations: ((identity: any) => void)[] = [
    (identity) => { identity.components[0].source = '' },
    (identity) => { identity.components[0].value = null },
    (identity) => { identity.components[0].value = true },
    (identity) => { identity.components[0].value = '8723' },
    (identity) => { identity.components.push(clone(identity.components[0])) },
    (identity) => { identity.components[0].coverage.push('aws') },
    (identity) => { identity.components.pop() },
  ]
  for (const mutate of mutations) {
    const sidecar: any = clone(fixture.sidecar); mutate(sidecar.additive_identities[0])
    assertRefused((await run(sidecar, fixture.request.question, intentFrom(fixture.request))).turn)
  }
})

await check('malformed supplied legacy data is retained for whole-sidecar refusal, never repaired', async () => {
  const fixture = fixtures[0]
  for (const legacy of [
    { sensitivities: null }, { sensitivities: {} }, { sensitivities: [] }, { sensitivities: [{}] },
    { base_metric: 'operating_income' },
    { sensitivities: [{ variable: 'input', coefficient: 1, source: 'Software source, section1' }] },
  ]) {
    const sidecar = { ...clone(fixture.sidecar), ...legacy } as any
    assert.ok(api.loadSidecar(writeSidecar(sidecar)), 'Untrusted loading must not strip away the invalid declaration')
    const turn = (await run(sidecar, fixture.request.question, intentFrom(fixture.request))).turn
    assertRefused(turn)
    assert.equal(turn?.result?.reason, 'invalid_legacy')
  }
})

await check('malformed additive declarations are explicit refusals without a parser call', async () => {
  const fixture = fixtures[0]
  for (const additive_identities of [null, {}, []]) {
    const { turn, parserCalls } = await run({ ...fixture.sidecar, additive_identities } as any, fixture.request.question, intentFrom(fixture.request))
    assertRefused(turn)
    assert.equal(parserCalls, 0)
    const withoutIntro = await run({ ...fixture.sidecar, additive_identities } as any, 'how much is North America plus International?', intentFrom(fixture.request))
    assertRefused(withoutIntro.turn)
    assert.equal(withoutIntro.parserCalls, 0)
  }
})

await check('parser cannot override raw question/operands or smuggle a malformed target', async () => {
  const fixture = fixtures[0]
  for (const patch of [{ question: 'forged' }, { target: '31000' }, { components: [] }, { sidecar: {} }]) {
    const before = engineCalls()
    assertRefused((await run(fixture.sidecar, fixture.request.question, { ...intentFrom(fixture.request), ...patch })).turn)
    assert.equal(engineCalls(), before, 'Malformed selection must not reach a numerical authority')
  }
})

await check('CLI failure, malformed output and a fake computed shape produce explicit nonnumeric refusal', async () => {
  const fixture = fixtures[0]
  const valid = (await run(fixture.sidecar, fixture.request.question, intentFrom(fixture.request))).turn!.result!
  assert.equal(valid.status, 'computed')
  try {
    for (const program of [
      'import sys;print("{}");sys.exit(1)',
      'print("not json")',
      'print(\'{"kind":"scenario","impact":999}\')',
      'print(\'{"kind":"additive","status":"computed","remainder":999}\')',
      `print(${JSON.stringify(JSON.stringify({ ...valid, total: {} }))})`,
      `print(${JSON.stringify(JSON.stringify({ ...valid, symbolic_build: null }))})`,
    ]) {
      fs.writeFileSync(engine, program + '\n')
      const turn = (await run(fixture.sidecar, fixture.request.question, intentFrom(fixture.request))).turn
      assertRefused(turn)
      assert.equal(turn?.result, null)
      assert.equal(turn?.context.includes('999'), false, 'Unvalidated stdout must never be quoted as a computed number')
    }
  } finally { fs.writeFileSync(engine, engineWrapper) }
})

await check('well-shaped stdout must preserve the exact source operands, context, sources, known set and future assumptions', async () => {
  const fixture: any = clone(fixtures[0])
  const historical = (await run(fixture.sidecar, fixture.request.question, intentFrom(fixture.request))).turn!.result!
  const gapped = fixtures[2]
  const withheld = (await run(gapped.sidecar, gapped.request.question, intentFrom(gapped.request))).turn!.result!
  assert.equal(withheld.status, 'withheld')
  const profile = fixture.sidecar.additive_identities[0].conditional_profiles[0]
  profile.residual = { value: 0, assumption: 'Explicit test assumption only: future residual held at zero, not an observed fact.' }
  const futureQuestion = fixture.request.question.replace(/\?$/, '') + ` if total is 31,000 USD million for ${profile.target_period_label} under ${profile.label}?`
  const futureIntent = { ...intentFrom(fixture.request), target: 31000, conditional_profile_id: profile.profile_id }
  const future = (await run(fixture.sidecar, futureQuestion, futureIntent)).turn!.result!
  assert.equal(future.status, 'computed')
  const mutations: [string, (result: any) => void][] = [
    ['wrong currency', (result) => { result.context.currency = 'NOK' }],
    ['wrong reporting scope', (result) => { result.context.scope = 'standalone_company' }],
    ['changed original total', (result) => { result.total.value = 123; result.source_total = 123; result.chosen_total = 123 }],
    ['changed component amount', (result) => { result.components.at(-1).value = 999; result.known_components[0].value = 999 }],
    ['changed source references', (result) => { result.sources[0] = 'Forged replacement citation' }],
    ['missing known component set', (result) => { result.known_components = [] }],
    ['changed original metric', (result) => { result.source_metric = 'EPS' }],
    ['extra source-period property', (result) => { result.source_period.unbound_amount = 999 }],
    ['extra target-period property', (result) => { result.target_period.unbound_amount = 999 }],
  ]
  try {
    for (const [name, mutate] of mutations) {
      const stdout = clone(historical); mutate(stdout)
      fs.writeFileSync(engine, `print(${JSON.stringify(JSON.stringify(stdout))})\n`)
      const turn = (await run(fixture.sidecar, fixture.request.question, intentFrom(fixture.request))).turn
      assertRefused(turn)
      assert.equal(turn?.result, null, name)
      assert.doesNotMatch(turn!.context, /123|999|Forged replacement|"EPS"/, name)
    }
    const dropped = { ...future, assumptions: [] }
    fs.writeFileSync(engine, `print(${JSON.stringify(JSON.stringify(dropped))})\n`)
    const turn = (await run(fixture.sidecar, futureQuestion, futureIntent)).turn
    assertRefused(turn)
    assert.equal(turn?.result, null, 'dropped future assumptions')
    const changedWithheld = clone(withheld); changedWithheld.total!.value = 999
    fs.writeFileSync(engine, `print(${JSON.stringify(JSON.stringify(changedWithheld))})\n`)
    const refusedGap = (await run(gapped.sidecar, gapped.request.question, intentFrom(gapped.request))).turn
    assertRefused(refusedGap)
    assert.equal(refusedGap?.result, null, 'withheld results must bind the same original source facts')
  } finally { fs.writeFileSync(engine, engineWrapper) }
})

await check('sandbox escape and cancellation cannot parse or compute', async () => {
  const fixture = fixtures[0]
  const outside = path.join(scratch, 'outside', 'earnings'); fs.mkdirSync(outside, { recursive: true })
  fs.writeFileSync(path.join(outside, 'sensitivity_summary.json'), JSON.stringify(fixture.sidecar))
  fs.symlinkSync(path.dirname(outside), path.join(scratch, 'analyses', 'escape'))
  assert.equal(api.loadSidecar('analyses/escape'), null)
  const ac = new AbortController(); ac.abort()
  let calls = 0
  assert.equal(await api.runAdditiveAccounting(writeSidecar(fixture.sidecar), fixture.request.question, async () => { calls++; return null }, ac.signal), null)
  assert.equal(calls, 0)
})

console.log(`\n${passed} additive backend checks passed; three issuer contexts, not investment outcomes.`)
console.log(`Retained isolated test outputs: ${scratch}`)
