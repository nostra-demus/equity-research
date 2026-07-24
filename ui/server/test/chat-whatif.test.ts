// Deterministic what-if modeling for the Ask chat — v3 (model parse + code validation + python engine).
// The anti-hallucination core is the VALIDATOR: the parse model may only SELECT (a recorded variable, a
// number literally present in the question); anything invented is dropped in code, and the engine computes
// every number. These tests pin: the parser prompt contract, output parsing, the validator (red-teamed),
// and the end-to-end path with a STUBBED parse + the REAL engine — including the exact production failure
// that motivated v3 ("if LME is 3,467/mt" must resolve as a LEVEL, +275, never a +3,467 move) and the old
// regex-parser bugs kept as regressions through the new path.
// Run: npx tsx test/chat-whatif.test.ts
import assert from 'node:assert/strict'
import {
  detectWhatIf, recordedList, buildParserPrompt, parseModelOutput, parseWhatIf, valueAppearsInQuestion,
  validateIntents, computePlan, computedContextBlock,
  type SensitivitySidecar, type ParseResult, type ParserCall,
} from '../src/chat-whatif'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// NHY's real recorded coefficients (inline, so the test never depends on committed data). revenue_base
// 207,971 → base EBITDA margin 13.891%; the aluminium row's own level is 3,192 USD/mt.
const NHY: SensitivitySidecar = {
  base_metric: 'adjusted_ebitda_nok_m', base_value: 28889, base_period: 'FY2025', revenue_base: 207971,
  sensitivities: [
    { variable: 'lme_aluminium_price', label: 'LME aluminium price', unit: 'USD/mt', base_value: 3192, coefficient: 15.0, confidence: 'high', basis: 'company-disclosed', valid_range: { low: -400, high: 300 }, source: 'FY2025 Annual Report, p.38' },
    { variable: 'usd_nok', label: 'USD/NOK exchange rate', unit: 'NOK', base_value: 9.72, coefficient: 4900.0, confidence: 'high', basis: 'company-disclosed', valid_range: { low: -1, high: 1 }, source: 'FY2025 AR p.38' },
    { variable: 'alumina_price', label: 'Alumina price (Platts PAX)', unit: 'USD/mt', base_value: 345, coefficient: 72.0, confidence: 'low', basis: 'inferred', valid_range: { low: -50, high: 65 }, source: 'Q1 2026 deck p.15' },
    { variable: 'extrusions_volume', label: 'Extrusions external sales volume', unit: 'kmt', base_value: 1004, coefficient: 19.1, confidence: 'medium', basis: 'inferred', valid_range: { low: -40, high: 50 }, source: 'Q1 2026 report p.16' },
  ],
}
const near = (a: number | null | undefined, b: number, tol = 0.5) => typeof a === 'number' && Math.abs(a - b) <= tol
const stub = (r: ParseResult | string | null): ParserCall => async () => (r == null ? null : typeof r === 'string' ? r : JSON.stringify({ intents: r.intents, asks_unrecorded: r.asksUnrecorded ?? null, period_note: r.periodNote === true }))

await (async () => {
  // ---- detection: the free gate (every hit now pays a parse, so bare question words don't fire) ----
  await check('detects conditional/change/signed what-ifs; margin-solve needs the % signal', () => {
    assert.equal(detectWhatIf('how does margin change if the aluminium price rises $45/mt?'), true)
    assert.equal(detectWhatIf('EBITDA if aluminium is 3,467/mt?'), true)
    assert.equal(detectWhatIf('what price gets margin to 16%?'), true)
    assert.equal(detectWhatIf('What was EBITDA in FY2025?'), false) // bare question word + a year ≠ what-if
    assert.equal(detectWhatIf('summarize the risks'), false)
  })

  // ---- the parser prompt: what the model is told (pinned) ----
  await check('buildParserPrompt carries every recorded variable, the question, and the JSON-only contract', () => {
    const { system, user } = buildParserPrompt('if LME is 3,467/mt what happens?', NHY)
    for (const v of ['lme_aluminium_price', 'usd_nok', 'alumina_price', 'extrusions_volume']) assert.ok(user.includes(v), `missing ${v}`)
    assert.ok(user.includes('if LME is 3,467/mt what happens?'))
    assert.ok(/Output ONLY a single JSON object/i.test(system))
    assert.ok(/NEVER calculate/i.test(system) && /NEVER invent/i.test(system))
    assert.ok(user.includes('current level 3192'), 'the variable base level informs level-vs-move reading')
  })

  // ---- parseModelOutput: tolerant of wrapping, strict on shape ----
  await check('parseModelOutput handles clean JSON, fenced JSON, and prose-wrapped JSON', () => {
    const j = '{"intents":[{"variable":"usd_nok","mode":"move","value":0.5,"direction":"down"}],"asks_unrecorded":null,"period_note":false}'
    for (const t of [j, '```json\n' + j + '\n```', 'Here you go:\n' + j]) {
      const r = parseModelOutput(t)
      assert.equal(r?.intents.length, 1)
      assert.equal(r?.intents[0].direction, 'down')
    }
  })
  await check('parseModelOutput rejects garbage and malformed shapes (never throws)', () => {
    assert.equal(parseModelOutput(null), null)
    assert.equal(parseModelOutput('no json here'), null)
    assert.equal(parseModelOutput('[1,2,3]'), null)
    assert.equal(parseModelOutput('{"intents":[{"variable":"x","mode":"teleport","value":5}]}')?.intents.length, 0) // bad mode dropped
    assert.equal(parseModelOutput('{"intents":[{"variable":"x","mode":"move","value":"45"}]}')?.intents.length, 0) // string value dropped
  })

  // ---- valueAppearsInQuestion: the anti-invention gate ----
  await check('valueAppearsInQuestion: comma-grouped, boundary-checked, sign-tolerant', () => {
    assert.equal(valueAppearsInQuestion(3467, 'if LME is 3,467/mt then what'), true)
    assert.equal(valueAppearsInQuestion(45, 'rises $45/mt'), true)
    assert.equal(valueAppearsInQuestion(0.5, 'falls 0.5'), true)
    assert.equal(valueAppearsInQuestion(45, 'rises $450/mt'), false)  // 45 must not match inside 450
    assert.equal(valueAppearsInQuestion(45, 'multiple of 3.45x'), false) // …or inside 3.45
    assert.equal(valueAppearsInQuestion(999, 'rises $45/mt'), false)  // an invented number is rejected
    assert.equal(valueAppearsInQuestion(-45, 'falls by 45'), true)    // model returned a signed copy
  })

  // ---- validateIntents: red-teamed ----
  await check('valid single move → one plan with the right signed delta', () => {
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45, direction: 'up' }] }, 'rises $45/mt', NHY)
    assert.equal(v.plans.length, 1)
    assert.deepEqual(v.plans[0].req, { delta: 45 })
  })
  await check('direction down / signed value → negative delta', () => {
    const q = 'USD/NOK falls 0.5'
    assert.deepEqual(validateIntents({ intents: [{ variable: 'usd_nok', mode: 'move', value: 0.5, direction: 'down' }] }, q, NHY).plans[0].req, { delta: -0.5 })
    assert.deepEqual(validateIntents({ intents: [{ variable: 'usd_nok', mode: 'move', value: -0.5 }] }, 'moves -0.5', NHY).plans[0].req, { delta: -0.5 })
  })
  await check('percent move sizes off the row base level (extrusions −10% of 1004)', () => {
    const v = validateIntents({ intents: [{ variable: 'extrusions_volume', mode: 'move', value: 10, direction: 'down', percent: true }] }, 'extrusion volume drops 10%', NHY)
    assert.ok(near((v.plans[0].req as any).delta, -100.4, 1e-9))
  })
  await check('RED TEAM: an invented value (not in the question) is dropped', () => {
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 999 }] }, 'rises $45/mt', NHY)
    assert.equal(v.plans.length, 0)
  })
  await check('RED TEAM: an unrecorded variable key from the parse is dropped; asks_unrecorded → refusal', () => {
    const v = validateIntents({ intents: [{ variable: 'freight_rates', mode: 'move', value: 20 }], asksUnrecorded: 'freight rates' }, 'freight rates rise 20%', NHY)
    assert.equal(v.plans.length, 0)
    assert.equal(v.refusal, 'unrecorded')
  })
  await check('margin target without a revenue base → no_revenue_base refusal', () => {
    const norev = { ...NHY, revenue_base: null }
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'target_margin', value: 16 }] }, 'margin to 16%', norev)
    assert.equal(v.refusal, 'no_revenue_base')
  })
  await check('an uncited coefficient → no_source; a different impact metric → metric_mismatch', () => {
    const nosrc = { ...NHY, sensitivities: [{ ...NHY.sensitivities![0], source: null }] }
    assert.equal(validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45 }] }, 'rises 45', nosrc).refusal, 'no_source')
    const diff = { ...NHY, sensitivities: [{ ...NHY.sensitivities![0], impact_metric: 'revenue_nok_m' }] }
    assert.equal(validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45 }] }, 'rises 45', diff).refusal, 'metric_mismatch')
  })
  await check('multi: two distinct variables → two plans; duplicates deduped', () => {
    const q = 'aluminium rises 45 and USD/NOK falls 0.5'
    const v = validateIntents({ intents: [
      { variable: 'lme_aluminium_price', mode: 'move', value: 45 },
      { variable: 'usd_nok', mode: 'move', value: 0.5, direction: 'down' },
      { variable: 'lme_aluminium_price', mode: 'move', value: 45 }, // dup dropped
    ] }, q, NHY)
    assert.equal(v.plans.length, 2)
    assert.deepEqual(v.plans.map((p) => p.variable).sort(), ['lme_aluminium_price', 'usd_nok'])
  })
  await check('empty intents + no asks_unrecorded → no plans, no refusal (normal answer)', () => {
    const v = validateIntents({ intents: [] }, 'what were the margins in FY2025?', NHY)
    assert.equal(v.plans.length, 0)
    assert.equal(v.refusal, null)
  })

  // ---- parseWhatIf with a stubbed model call ----
  await check('parseWhatIf: stubbed call round-trips; a throwing/failing call → null (normal answer)', async () => {
    const ok = await parseWhatIf('q', NHY, stub({ intents: [{ variable: 'usd_nok', mode: 'move', value: 0.5 }] }))
    assert.equal(ok?.intents.length, 1)
    assert.equal(await parseWhatIf('q', NHY, stub(null)), null)
    assert.equal(await parseWhatIf('q', NHY, async () => { throw new Error('cli absent') }), null)
    assert.equal(await parseWhatIf('q', NHY, stub('total garbage, no json')), null)
  })

  // ---- END-TO-END (stubbed parse + REAL engine): the production failure + the old regex bugs ----
  await check('THE v3 case: "if LME is 3,467/mt … 2026/27" → LEVEL +275 → 33,014 → 15.87% margin, in range', async () => {
    const q = 'if LME is 3,467/mt; then what would be the ebitda margins for 2026/27'
    const pr = parseModelOutput(JSON.stringify({ intents: [{ variable: 'lme_aluminium_price', mode: 'level', value: 3467 }], asks_unrecorded: null, period_note: true }))!
    const v = validateIntents(pr, q, NHY)
    assert.equal(v.plans.length, 1)
    const s = await computePlan(NHY, v.plans[0])
    assert.ok(s)
    assert.equal(s!.mode, 'level')
    assert.equal(s!.resolvedDelta, 275)          // 3,467 − 3,192 — NEVER a +3,467 move
    assert.equal(s!.impact, 4125)
    assert.equal(s!.newValue, 33014)
    assert.ok(near(s!.newMarginPct, 15.874, 0.01))
    assert.equal(s!.withinDisclosedRange, true)
    // the period flag flows into the context block as a canned line
    s!.periodBase = NHY.base_period ?? null
    const block = computedContextBlock({ kind: 'scenario', asked: q, scenario: s! })
    assert.ok(/single-period scenario on the FY2025 base/.test(block))
    assert.ok(/do NOT recompute/i.test(block))
  })
  await check('regression (comma thousands): "rises by $1,000/mt" → +1000 → +15,000', async () => {
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 1000 }] }, 'what if aluminium rises by $1,000/mt', NHY)
    const s = await computePlan(NHY, v.plans[0])
    assert.equal(s!.impact, 15000)
  })
  await check('regression (spelled unit): "at 3000 USD/mt" → LEVEL −192 → −2,880 (no USD/NOK collision)', async () => {
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'level', value: 3000 }] }, 'whats EBITDA if aluminium is at 3000 USD/mt?', NHY)
    const s = await computePlan(NHY, v.plans[0])
    assert.equal(s!.resolvedDelta, -192)
    assert.equal(s!.impact, -2880)
  })
  await check('regression (year in question): "FY2026 EBITDA if aluminium rises $45/mt" → +45, not +2026', async () => {
    const q = 'what is FY2026 EBITDA if aluminium rises $45/mt'
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45 }] }, q, NHY)
    const s = await computePlan(NHY, v.plans[0])
    assert.equal(s!.impact, 675)
  })
  await check('reverse solve end-to-end: margin 16% → +292.4 → level ≈ 3,484', async () => {
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'target_margin', value: 16 }] }, 'what aluminium price gets the margin to 16%?', NHY)
    const s = await computePlan(NHY, v.plans[0])
    assert.equal(s!.mode, 'reverse')
    assert.ok(near(s!.resolvedDelta, 292.42))
    assert.ok(near(s!.solvedVariableLevel, 3484.42))
    assert.ok(near(s!.newMarginPct, 16, 0.05))
  })
  await check('unknown variable at the engine still computes to null (belt and suspenders)', async () => {
    const s = await computePlan(NHY, { variable: 'freight', row: NHY.sensitivities![0], req: { delta: 20 } })
    assert.equal(s, null)
  })

  // ---- the refusal context block ----
  await check('context block: unrecorded refusal names the recorded variables; period line only when set', () => {
    const b = computedContextBlock({ kind: 'unsupported', asked: 'q', reason: 'unrecorded', recorded: recordedList(NHY) })
    assert.ok(/could NOT model/i.test(b) && /LME aluminium price/.test(b))
    const s = { variable: 'v', delta: 1, coefficient: 1, impact: 1 } as any
    assert.ok(!/single-period scenario/.test(computedContextBlock({ kind: 'scenario', asked: 'q', scenario: s })))
  })

  console.log(`\n${passed} chat-whatif checks passed`)
})()
