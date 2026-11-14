// Deterministic what-if modeling for the Ask chat — v3 (model parse + code validation + python engine).
// The anti-hallucination core is the VALIDATOR: the parse model may only SELECT (a recorded variable, a
// number literally present in the question); anything invented is dropped in code, and the engine computes
// every number. These tests pin: the parser prompt contract, output parsing, the validator (red-teamed),
// and the end-to-end path with a STUBBED parse + the REAL engine — including the exact production failure
// that motivated v3 ("if LME is 3,467/mt" must resolve as a LEVEL, +275, never a +3,467 move) and the old
// regex-parser bugs kept as regressions through the new path.
// Run: npx tsx test/chat-whatif.test.ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  detectWhatIf, recordedList, buildParserPrompt, parseModelOutput, parseWhatIf, valueAppearsInQuestion,
  questionMentionsRow, validateIntents, computePlan, computedContextBlock, repriceFromMetric, repricedBlock,
  isNumberlessTargetFollowUp, findPriorScenarioComputed, resolveAuthenticatedPriorScenario,
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
// Generic same-metric software control only: this does not assert that NHY's historical base matches
// its normal-production coefficient or that the retained NHY sidecar can pass the chat metric gate.
const disclosedPositionsControl = (patch: Record<string, unknown> = {}) => {
  const row = {
    variable: 'input_price', label: 'Input price', unit: 'units', base_value: 10, coefficient: 5,
    impact_metric: 'adjusted_ebitda_units', confidence: 'low', basis: 'company-disclosed',
    source: 'Generic software disclosure fixture, sensitivity and existing-positions note',
    mitigation_basis: 'disclosed_positions',
    mitigation_scope: 'fixed_existing_positions_no_additional_response',
    embedded_hedges: 'Existing source hedge positions; no quantified per-channel decomposition',
    embedded_hedges_as_of: '2025-12-31',
    ...patch,
  }
  const sidecar: SensitivitySidecar = {
    schema_version: '1.0', ticker: 'UNIT', as_of: '2026-11-14',
    base_metric: 'adjusted_ebitda_units', base_value: 100, base_period: 'control_period',
    revenue_base: 1000, revenue_period: 'control_period', sensitivities: [row],
  }
  return { sidecar, row }
}
// One retained NHY source table / four correlated positive points, not four financial cases. Unlike the
// legacy same-metric arithmetic fixtures above, these rows deliberately withhold the unmatched FY2025 base.
const SOURCE_EFFECT_METRIC = 'annual_2026_normal_production_adjusted_ebitda_nok_m'
const SOURCE_EFFECT_ROWS = [
  { variable: 'lme_aluminium_price', label: 'Aluminium price', unit: 'USD/mt', coefficient: 15, context_level_only: { value: 3467, period: 'Q1 2026 quarter-end, context only' } },
  { variable: 'usd_nok', label: 'USD/NOK — NOK per USD', unit: 'NOK/USD', coefficient: 4900, context_level_only: { value: 9.73, period: 'Q1 2026 average, not source calibration' } },
  { variable: 'brl_nok', label: 'BRL/NOK — NOK per BRL', unit: 'NOK/BRL', coefficient: -5200, context_level_only: { value: 1.85, period: 'Q1 2026 average, not source calibration' } },
  { variable: 'eur_nok', label: 'EUR/NOK — NOK per EUR', unit: 'NOK/EUR', coefficient: -210, context_level_only: { value: 11.38, period: 'Q1 2026 average, not source calibration' } },
].map((row) => ({
  ...disclosedPositionsControl().row, ...row, base_value: null, impact_metric: SOURCE_EFFECT_METRIC,
  confidence: 'high', confidence_scope: 'Disclosed positive test point and exact normalization only; not a broad linear or forecast confidence.',
  valid_range: null,
  source: 'Integrated Annual Report 2025, p.38, Key financial exposures: 2026 normal annual production; 31-Dec-2025 positions included; derivative revaluations excluded',
  embedded_hedges: 'Financial risk-management contracts and strategic hedge positions included by the source; not stripped or refreshed.',
  non_linearity: '2026 normal annual production; source positions at 2025-12-31. Aluminium assumes USD/NOK 10.00. Reverse signs/scaling are inference; no validated linear interval. Gross exposure and measured offset unavailable.',
}))
const SOURCE_EFFECTS: SensitivitySidecar = {
  schema_version: '1.0', ticker: 'NHY', as_of: '2026-11-14',
  base_metric: 'historical_fy2025_adjusted_ebitda_nok_m', base_value: 28889,
  base_period: 'FY2025 actual; historical reference only', revenue_base: null,
  base_scope: 'Historical reference only; not a matched base for annual 2026 normal-production coefficients.',
  sensitivities: SOURCE_EFFECT_ROWS,
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
    // formatting variants (review fix): numeric token comparison, not string matching
    assert.equal(valueAppearsInQuestion(3.4, 'rises 3.40 this year'), true)
    assert.equal(valueAppearsInQuestion(10, 'a 10.0 move'), true)
    assert.equal(valueAppearsInQuestion(0.5, 'falls .5'), true)
  })

  // ---- questionMentionsRow: the wrong-variable gate ----
  await check('questionMentionsRow: generous on real mentions, hard NO when the variable is never named', () => {
    const [alu, fx, , vol] = NHY.sensitivities!
    assert.equal(questionMentionsRow('if LME is 3,467/mt then what', alu), true)      // key token "lme"
    assert.equal(questionMentionsRow('aluminum rises $45', alu), true)                // spelling alias
    assert.equal(questionMentionsRow('if the dollar strengthens 0.5', fx), true)      // currency alias
    assert.equal(questionMentionsRow('extrusion volume drops 10%', vol), true)        // singular stem
    assert.equal(questionMentionsRow('what if freight falls 10%?', alu), false)       // never named → gate
    assert.equal(questionMentionsRow('what if freight falls 10%?', fx), false)
  })
  await check('RED TEAM: a parse naming a recorded variable for an UNRELATED question is dropped', () => {
    // "what if freight falls 10%?" but the parse (wrongly) returns lme_aluminium_price / 10 — without the
    // mention gate this would stream an authoritative aluminium card for a question about freight
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10, direction: 'down' }], asksUnrecorded: 'freight' }, 'what if freight falls 10%?', NHY)
    assert.equal(v.plans.length, 0)
    assert.equal(v.refusal, 'unrecorded')
  })

  // ---- validateIntents: red-teamed ----
  await check('valid single move → one plan with the right signed delta', () => {
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45, direction: 'up' }] }, 'aluminium rises $45/mt', NHY)
    assert.equal(v.plans.length, 1)
    assert.deepEqual(v.plans[0].req, { delta: 45 })
  })
  await check('direction down / signed value → negative delta', () => {
    const q = 'USD/NOK falls 0.5'
    assert.deepEqual(validateIntents({ intents: [{ variable: 'usd_nok', mode: 'move', value: 0.5, direction: 'down' }] }, q, NHY).plans[0].req, { delta: -0.5 })
    assert.deepEqual(validateIntents({ intents: [{ variable: 'usd_nok', mode: 'move', value: -0.5 }] }, 'the dollar moves -0.5', NHY).plans[0].req, { delta: -0.5 })
  })
  await check('percent move sizes off the row base level (extrusions −10% of 1004)', () => {
    const v = validateIntents({ intents: [{ variable: 'extrusions_volume', mode: 'move', value: 10, direction: 'down', percent: true }] }, 'extrusion volume drops 10%', NHY)
    assert.ok(near((v.plans[0].req as any).delta, -100.4, 1e-9))
  })
  await check('RED TEAM: an invented value (not in the question) is dropped', () => {
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 999 }] }, 'aluminium rises $45/mt', NHY)
    assert.equal(v.plans.length, 0)
  })
  await check('RED TEAM: an unrecorded variable key from the parse is dropped; asks_unrecorded → refusal', () => {
    const v = validateIntents({ intents: [{ variable: 'freight_rates', mode: 'move', value: 20 }], asksUnrecorded: 'freight rates' }, 'freight rates rise 20%', NHY)
    assert.equal(v.plans.length, 0)
    assert.equal(v.refusal, 'unrecorded')
  })
  await check('margin target without a revenue base → no_revenue_base refusal', () => {
    const norev = { ...NHY, revenue_base: null }
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'target_margin', value: 16 }] }, 'what aluminium price gets margin to 16%', norev)
    assert.equal(v.refusal, 'no_revenue_base')
  })
  await check('an uncited coefficient → no_source; an unlike-metric move without an explicit own unit → metric_mismatch', () => {
    const nosrc = { ...NHY, sensitivities: [{ ...NHY.sensitivities![0], source: null }] }
    assert.equal(validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45 }] }, 'aluminium rises 45', nosrc).refusal, 'no_source')
    const diff = { ...NHY, sensitivities: [{ ...NHY.sensitivities![0], impact_metric: 'revenue_nok_m' }] }
    assert.equal(validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45 }] }, 'aluminium rises 45', diff).refusal, 'metric_mismatch')
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
    // the period flag flows into the context block as a canned line (mirrors the server route: periodNote
    // gates the disclaimer; periodBase decorates it)
    s!.periodNote = true; s!.periodBase = NHY.base_period ?? null
    const block = computedContextBlock({ kind: 'scenario', asked: q, scenario: s! })
    assert.ok(/single-period scenario on the FY2025 base/.test(block))
    assert.ok(/do NOT recompute/i.test(block))
  })
  // Codex #335 r3644942615: a future-period question must carry the "not a forecast" disclaimer even when
  // the sidecar records NO base_period. The warning is gated on periodNote, NOT on periodBase being truthy
  // (§ anti-false-confidence: a single-period number may never be presented as a multi-year forecast
  // without the disclaimer). RED on the old code (gated on periodBase → null → no line); GREEN on the new.
  await check('period disclaimer survives an absent base_period (periodNote gates it, not periodBase)', () => {
    const s = { variable: 'v', delta: 1, coefficient: 1, impact: 1, periodNote: true, periodBase: null } as any
    const block = computedContextBlock({ kind: 'scenario', asked: 'ebitda in 2027?', scenario: s })
    assert.ok(/single-period scenario on an unstated base period/.test(block), 'disclaimer must appear even with null base_period')
    assert.ok(/not a multi-year forecast/.test(block))
    // and it must NOT fabricate a base period name
    assert.ok(!/on the null base/.test(block))
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

  // ---- review round 2 (Codex r3643707261/266/271): unit-collision, honest cap, mode sanity ----
  await check('a commodity price quoted in USD does not "mention" the FX row (unit, not subject)', () => {
    const fx = NHY.sensitivities[1], alu = NHY.sensitivities[0]
    const q = 'what is EBITDA if aluminium is at 3000 USD/mt?'
    assert.equal(questionMentionsRow(q, fx), false, 'usd inside a price unit must not match usd_nok')
    assert.equal(questionMentionsRow(q, alu), true)
    // the FX pair named AS a pair (or by alias) still matches
    assert.equal(questionMentionsRow('if usd/nok hits 11 next year', fx), true)
    assert.equal(questionMentionsRow('if the dollar strengthens 0.5', fx), true)
    // and the red-team combination: a mis-parse returning usd_nok for the aluminium question is dropped
    const v = validateIntents({ intents: [{ variable: 'usd_nok', mode: 'level', value: 3000 }] }, q, NHY)
    assert.equal(v.plans.length, 0)
  })
  await check('a margin-target intent from a question that never says margin/% is dropped (mode sanity)', () => {
    const q = 'aluminium rises $45/mt'
    const bad = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'target_margin', value: 45 }] }, q, NHY)
    assert.equal(bad.plans.length, 0, 'a 45% margin solve for a $45 move question must not pass')
    const ok = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'target_margin', value: 16 }] }, 'what price for a 16% margin?', NHY)
    assert.equal(ok.plans.length, 1)
    assert.deepEqual(ok.plans[0].req, { targetMargin: 16 })
  })
  await check('valid asks beyond the cap are COUNTED as omitted, and junk intents do not eat slots', () => {
    const five: SensitivitySidecar = { ...NHY, sensitivities: [...NHY.sensitivities,
      { variable: 'energy_price', label: 'Nordic power price', unit: 'EUR/MWh', base_value: 55, coefficient: 30, confidence: 'medium', basis: 'inferred', valid_range: { low: -20, high: 20 }, source: 'Q1 2026 deck p.9' }] }
    const q = 'aluminium +45, usd/nok +0.5, alumina +20, extrusions volume +10, power price +5'
    const intents = [
      { variable: 'not_recorded_junk', mode: 'move' as const, value: 45 }, // junk: must not consume a slot
      { variable: 'lme_aluminium_price', mode: 'move' as const, value: 45 },
      { variable: 'usd_nok', mode: 'move' as const, value: 0.5 },
      { variable: 'alumina_price', mode: 'move' as const, value: 20 },
      { variable: 'extrusions_volume', mode: 'move' as const, value: 10 },
      { variable: 'energy_price', mode: 'move' as const, value: 5 },
    ]
    const v = validateIntents({ intents }, q, five)
    assert.equal(v.plans.length, 4, `cap holds: got ${v.plans.length}`)
    assert.equal(v.omitted, 1, 'the fifth VALID ask is counted, not silently dropped')
    assert.equal(v.plans[0].variable, 'lme_aluminium_price', 'junk intent did not eat the first slot')
  })

  // ---- the DRIVER -> TARGET hop: the follow-up the chat used to call not-in-context ----
  // "if LME is 3,467/mt, what's the EBITDA change?" already worked. "…and what would the price upside or
  // target change be?" came back not-in-context, because nothing linked the sensitivity sidecar to
  // valuation_summary.json. These pin the link, using NHY's real committed shape and the REAL python engine.
  const NHY_VSC = {
    schema_version: '1.3', ticker: 'NHY', basis: 'equity', shares: 1965.28, net_debt: 13090,
    scenarios: [
      { label: 'bull', forward_metric: 28889.0, multiple: 8.21, basis: 'ev', level: 107.70, multiple_basis: 'EV/FY2025 Adj. EBITDA',
        bridge: { net_debt: 17919, net_debt_basis: 'adj', minority: 7495, other: 0, shares: 1965.28 } },
      { label: 'base', forward_metric: 28889.0, multiple: 6.45, basis: 'ev', level: 81.83, multiple_basis: 'EV/FY2025 Adj. EBITDA',
        bridge: { net_debt: 17919, net_debt_basis: 'adj', minority: 7495, other: 0, shares: 1965.28 } },
      { label: 'bear', forward_metric: 28889.0, multiple: 3.95, basis: 'ev', level: 45.12, multiple_basis: 'EV/FY2025 Adj. EBITDA',
        bridge: { net_debt: 17919, net_debt_basis: 'adj', minority: 7495, other: 0, shares: 1965.28 },
        derivation: { model: 'margin_runoff_dcf', ev: 114095, net_debt: 17919, minority: 7495, shares: 1965.28, source: '07 §3' } },
    ],
  }
  const NHY_DEC = { entry_price: 84.96, basket: 'Watchlist', scenarios: [
    { label: 'bull', probability: 20, price_target: 107.70 },
    { label: 'base', probability: 55, price_target: 81.83 },
    { label: 'bear', probability: 25, price_target: 45.12 } ] }

  await check('driver → target: the real engine re-prices each case through its OWN multiple and bridge', async () => {
    const rv = await repriceFromMetric({ valuationSidecar: NHY_VSC, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    assert.ok(rv, 'the engine returned nothing — is python3 present?')
    assert.equal(rv!.ok, true, JSON.stringify(rv))
    const by = Object.fromEntries((rv!.cases ?? []).map((c) => [c.label, c]))
    // the BEFORE expected return must reproduce the published −8.4, or the chain started from the wrong place
    assert.ok(Math.abs((rv!.expected_return_pct_before as number) + 8.4) < 0.1, `before ${rv!.expected_return_pct_before}`)
    assert.ok(Math.abs((by.bull.level_after as number) - 124.9852) < 0.01, `bull ${by.bull.level_after}`)
    assert.ok(Math.abs((by.base.level_after as number) - 95.4196) < 0.01, `base ${by.base.level_after}`)
    assert.ok(Math.abs((rv!.expected_return_pct_after as number) - 4.5) < 0.1, `after ${rv!.expected_return_pct_after}`)
  })

  await check('driver → target: a chain-priced case is HELD, and says why', async () => {
    const rv = await repriceFromMetric({ valuationSidecar: NHY_VSC, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    const bear = (rv!.cases ?? []).find((c) => c.label === 'bear')!
    assert.equal(bear.responds, false)
    assert.equal(bear.level_after, bear.level_before, 'a multi-year impairment path must not move on a spot driver')
    assert.match(String(bear.why), /derivation chain/)
    assert.deepEqual(rv!.held, ['bear'])
  })

  await check('driver → target: an EBITDA coefficient is REFUSED against a revenue-priced case', async () => {
    const rev = { schema_version: '1.3', basis: 'ev', shares: 4252.5, scenarios: [
      { label: 'base', forward_metric: 110860, multiple: 1.0, basis: 'ev', level: 32.37,
        bridge: { net_debt: -27444, net_debt_basis: 'broad', minority: 661, other: 0, shares: 4252.5 } } ] }
    const rv = await repriceFromMetric({ valuationSidecar: rev, decision: { entry_price: 319.69, scenarios: [{ label: 'base', probability: 100, price_target: 32.37 }] }, newMetric: 33014, baseMetric: 28889 })
    assert.equal(rv!.ok, false)
    assert.equal(rv!.reason, 'metric_mismatch')
    const block = repricedBlock(rv).join('\n')
    assert.match(block, /not derivable/)
    assert.match(block, /Do NOT estimate a price target/)
  })

  await check('the context block states the target lines the model must narrate', async () => {
    const rv = await repriceFromMetric({ valuationSidecar: NHY_VSC, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    const block = computedContextBlock({ kind: 'scenario', asked: 'if LME is 3,467/mt what happens to the target?',
      scenario: { variable: 'lme_aluminium_price', delta: 275, coefficient: 15, impact: 4125,
                  baseValue: 28889, newValue: 33014, impactMetric: 'adjusted_ebitda_nok_m' } as any, reprice: rv })
    assert.match(block, /TARGET \/ UPSIDE/)
    assert.match(block, /bull: 107\.70 → 124\.99/)   // 2dp: a per-share level must not print as '108'
    assert.match(block, /bear: HELD at 45\.12/)
    assert.match(block, /at a price of 84\.96/)   // and the entry price is not rounded to 85
    assert.match(block, /EXPECTED RETURN: -8\.4% → \+4\.5%/)
    assert.match(block, /never re-weight or re-derive them/)
    // and the driver half is still there, unchanged
    assert.match(block, /28,889 → 33,014/)   // the driver half, unchanged, thousands-separated
  })

  await check('driver → target: the VALUATION\'s own source is carried per case, separate from the driver\'s (§5, Codex #371 P1)', async () => {
    const vsc = { ...NHY_VSC, scenarios: NHY_VSC.scenarios.map((s, i) => i === 0
      ? { ...s, source: '07_scenario-and-fair-value.md §2 scenario table', bridge: { ...s.bridge, source: '05_balance-sheet-survival.md debt note' } }
      : s) }
    const rv = await repriceFromMetric({ valuationSidecar: vsc, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    assert.equal(rv!.ok, true, JSON.stringify(rv))
    const bull = (rv!.cases ?? []).find((c) => c.label === 'bull')!
    assert.equal(bull.source, '07_scenario-and-fair-value.md §2 scenario table')
    assert.equal(bull.bridge_source, '05_balance-sheet-survival.md debt note')
    const block = repricedBlock(rv).join('\n')
    assert.match(block, /valuation: 07_scenario-and-fair-value\.md §2 scenario table/)
    assert.match(block, /bridge: 05_balance-sheet-survival\.md debt note/)
    assert.match(block, /do NOT reuse the driver coefficient's own source/)
    // the HELD bear still carries its own derivation source
    const bear = (rv!.cases ?? []).find((c) => c.label === 'bear')!
    assert.equal(bear.derivation_source, '07 §3')
    assert.match(block, /derivation: 07 §3/)
  })

  await check('driver → target: the anchor price carries its OWN date, not just the number (§5/§20, Codex #371 P2)', async () => {
    const dec = { ...NHY_DEC, entry_price_timestamp: '2026-06-15' }
    const rv = await repriceFromMetric({ valuationSidecar: NHY_VSC, decision: dec, newMetric: 33014, baseMetric: 28889 })
    assert.equal(rv!.price_as_of, '2026-06-15')
    const block = repricedBlock(rv).join('\n')
    assert.match(block, /its recorded entry price of 84\.96 \(as of 2026-06-15\)/)
    // control: no recorded date must NOT silently read as "today's price"
    const rvNoDate = await repriceFromMetric({ valuationSidecar: NHY_VSC, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    assert.equal(rvNoDate!.price_as_of, null)
    assert.match(repricedBlock(rvNoDate).join('\n'), /no recorded date — do not imply this is today's price/)
  })

  await check('no valuation levers → the section is simply absent, never a guess', async () => {
    assert.deepEqual(repricedBlock(null), [])
    const rv = await repriceFromMetric({ valuationSidecar: {}, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    assert.equal(rv!.ok, false)
    const block = repricedBlock(rv).join('\n')
    assert.match(block, /not derivable/)
  })

  // ---- the NUMBERLESS follow-up: "…and what would the target change be?" (Codex #371 P1) ----
  // detectWhatIf requires a digit in the LATEST message. The PR's own headline example is a follow-up with
  // NONE — these pin that the gate is real, and that the fix resolves it deterministically against a prior
  // turn's already-computed result instead of leaving it to the model's own (unguaranteed) prior prose.
  await check('isNumberlessTargetFollowUp: the PR\'s exact headline follow-up has no number, but names the target', () => {
    assert.equal(detectWhatIf('and what would the price upside or target change be?'), false, 'detectWhatIf must NOT catch this — no digit in the question')
    assert.equal(isNumberlessTargetFollowUp('and what would the price upside or target change be?'), true)
    assert.equal(isNumberlessTargetFollowUp('what would that do to fair value?'), true)
    assert.equal(isNumberlessTargetFollowUp('what is the fair value?'), false, 'standalone valuation asks must not replay an old scenario')
    assert.equal(isNumberlessTargetFollowUp('What is this company’s fair value?'), false, '"this company" is not an anaphoric scenario reference')
    assert.equal(isNumberlessTargetFollowUp('Compare fair value and market expectations'), false, 'a conjunction inside a standalone ask is not a follow-up connector')
  })
  await check('isNumberlessTargetFollowUp: a question WITH its own number is the normal what-if path\'s job, not this one', () => {
    assert.equal(isNumberlessTargetFollowUp('what if LME hits 3500?'), false, 'has a number — detectWhatIf owns it')
  })
  await check('isNumberlessTargetFollowUp: an unrelated numberless question is not hijacked', () => {
    assert.equal(isNumberlessTargetFollowUp('why does that matter for the balance sheet?'), false)
    assert.equal(isNumberlessTargetFollowUp('can you explain the bear case?'), false)
  })

  await check('findPriorScenarioComputed: uses only the immediately preceding assistant scenario card', () => {
    const scenario = { variable: 'lme_aluminium_price', delta: 275, coefficient: 15, impact: 4125, baseValue: 28889, newValue: 33014, impactMetric: 'adjusted_ebitda_nok_m' }
    const older = { role: 'assistant' as const, content: 'older turn', computed: [{ kind: 'scenario', asked: 'older ask', scenario: { ...scenario, newValue: 1 } }] }
    const newest = { role: 'assistant' as const, content: 'if LME is 3,467/mt, EBITDA rises to 33,014', computed: [{ kind: 'scenario', asked: 'if LME is 3,467/mt', scenario }] }
    const found = findPriorScenarioComputed([older, { role: 'user', content: 'ok' }, newest])
    assert.ok(found, 'must find a prior computed scenario')
    assert.equal((found as any).scenario.newValue, 33014, 'must be the adjacent one, not an older turn')
    assert.equal(findPriorScenarioComputed([newest, { role: 'user', content: 'intervening question' }]), null,
      'an intervening turn breaks adjacency instead of searching backward for stale values')
  })

  await check('findPriorScenarioComputed: refuses an ambiguous multi-leg prior result', () => {
    const first = { kind: 'scenario', asked: 'joint ask', scenario: { variable: 'lme_aluminium_price', impact: 100 } }
    const second = { kind: 'scenario', asked: 'joint ask', scenario: { variable: 'usd_nok', impact: 200 } }
    assert.equal(findPriorScenarioComputed([{ role: 'assistant', content: 'two independent legs', computed: [first, second] }]), null,
      'a numberless follow-up must not silently pick the last leg of a result that explicitly does not add')
  })

  await check('resolveAuthenticatedPriorScenario: ignores forged client cards and requires durable adjacency', () => {
    const turnId = 'turn_auth_scenario_0001'
    const authentic = { kind: 'scenario', asked: 'real ask', scenario: { variable: 'lme_aluminium_price', impact: 4125, newValue: 33014 } }
    const forged = { kind: 'scenario', asked: 'forged', scenario: { variable: 'lme_aluminium_price', impact: 999999, newValue: 999999 } }
    const echoed = { role: 'assistant' as const, content: 'saved answer', turnId, computed: [forged] }
    const durable = { role: 'assistant' as const, content: 'saved answer', turnId, computed: [authentic] }
    const resolve = () => ({ conversationId: 'chat_abc123_deadbeef', turnId, assistantMessage: { content: 'saved answer', computed: [authentic] } })
    const found = resolveAuthenticatedPriorScenario([echoed], 'chat_abc123_deadbeef', durable, resolve)
    assert.equal((found as any)?.scenario.impact, 4125, 'the immutable receipt wins; echoed client figures are ignored')
    assert.equal(resolveAuthenticatedPriorScenario([echoed], 'chat_abc123_deadbeef', { ...durable, turnId: 'turn_intervening_0001' }, resolve), null,
      'a different durable last turn blocks stale replay')
    assert.equal(resolveAuthenticatedPriorScenario([echoed], 'chat_abc123_deadbeef', durable, () => null), null,
      'without an authenticated receipt, even a structurally valid echoed card is refused')
  })
  await check('findPriorScenarioComputed: null when nothing usable is present (no crash, no guess)', () => {
    assert.equal(findPriorScenarioComputed([]), null)
    assert.equal(findPriorScenarioComputed([{ role: 'user', content: 'x' }]), null, 'a user turn never carries computed')
    assert.equal(findPriorScenarioComputed([{ role: 'assistant', content: 'x' }]), null, 'no computed array at all')
    assert.equal(findPriorScenarioComputed([{ role: 'assistant', content: 'x', computed: [{ kind: 'unsupported' }] }]), null, 'an unsupported card is not a resolvable scenario')
    assert.equal(findPriorScenarioComputed([{ role: 'assistant', content: 'x', computed: [{ kind: 'scenario', scenario: { impact: 'not a number' } }] }]), null,
      'a malformed/tampered echoed shape is refused, never partially trusted')
  })

  await check('computedContextBlock carriedForward: replays the SAME numbers with an explicit "carried forward" note, never recomputes', async () => {
    const rv = await repriceFromMetric({ valuationSidecar: NHY_VSC, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    const scenario = { variable: 'lme_aluminium_price', delta: 275, coefficient: 15, impact: 4125, baseValue: 28889, newValue: 33014, impactMetric: 'adjusted_ebitda_nok_m' } as any
    const prior = { kind: 'scenario' as const, asked: 'if LME is 3,467/mt, what is the EBITDA change?', scenario, reprice: rv }
    // exercise the ACTUAL two-turn flow this fix targets: turn 1 has the number and computes; turn 2 (the
    // PR's own headline example) has NONE, and must resolve against turn 1's already-computed result.
    assert.equal(detectWhatIf('and what would the price upside or target change be?'), false)
    assert.equal(isNumberlessTargetFollowUp('and what would the price upside or target change be?'), true)
    const turnId = 'turn_carried_forward_0001'
    const priorMessage = { role: 'assistant' as const, content: 'EBITDA rises to 33,014', turnId, computed: [prior] }
    const found = resolveAuthenticatedPriorScenario(
      [priorMessage],
      'chat_abc123_deadbeef',
      priorMessage,
      () => ({ conversationId: 'chat_abc123_deadbeef', turnId, assistantMessage: { content: priorMessage.content, computed: [prior] } }),
    )
    assert.ok(found, 'the fix must find turn 1\'s computed scenario')
    const block = computedContextBlock({ ...(found as any), asked: 'and what would the price upside or target change be?' }, { carriedForward: true })
    assert.match(block, /SAME computed result from earlier in this conversation/, 'must say plainly this is carried forward, not a fresh computation')
    assert.match(block, /Do not recompute it/)
    // and the SAME deterministic TARGET/UPSIDE numbers are present, unchanged
    assert.match(block, /bull: 107\.70 → 124\.99/)
    assert.match(block, /EXPECTED RETURN: -8\.4% → \+4\.5%/)
  })

  // CLAUDE.md §9/§3: a zero-mitigation coefficient is a BOUND, and that label must travel with the number
  // through the REAL engine into the narration context — before this, the chat stated the bound as THE answer.
  await check('§9 mitigation: a gross bound with a measured offset is labelled BOUND and carries the realised case', async () => {
    const row = { ...NHY.sensitivities[0], mitigation_basis: 'zero_bound', realised_offset_pct: 38, realised_offset_source: 'FY2024 AR, Note 5' } as any
    const sc: SensitivitySidecar = { ...NHY, sensitivities: [row] }
    const s = await computePlan(sc, { variable: 'lme_aluminium_price', row, req: { delta: 45 } })
    assert.equal(s!.impact, 675)
    assert.equal(s!.isBound, true)
    assert.ok(near(s!.mitigatedImpact, 418.5, 0.01))
    const block = computedContextBlock({ kind: 'scenario', asked: 'q', scenario: s! })
    assert.match(block, /Mitigation \(§9/)
    assert.match(block, /BOUND, not as the expected outcome/)
    assert.match(block, /realised 38% offset/)
  })
  await check('§9 mitigation: a legacy row with no recorded basis is conservatively labelled an unrecorded bound', async () => {
    const s = await computePlan(NHY, { variable: 'lme_aluminium_price', row: NHY.sensitivities[0], req: { delta: 45 } })
    assert.equal(s!.isBound, true)
    assert.match(computedContextBlock({ kind: 'scenario', asked: 'q', scenario: s! }), /NOT recorded/)
  })

  await check('§9 disclosed positions: all absent/null offset variants retain the scoped source note through the real engine and context', async () => {
    const variants = [
      {},
      { realised_offset_pct: null, realised_offset_source: null },
      { realised_offset_source: null },
      { realised_offset_pct: null },
    ]
    for (const optionalOffset of variants) {
      const { sidecar, row } = disclosedPositionsControl(optionalOffset)
      const question = 'if input price rises 2 units, what is the earnings change?'
      const validated = validateIntents({ intents: [{ variable: row.variable, mode: 'move', value: 2, direction: 'up' }] }, question, sidecar)
      assert.equal(validated.refusal, null)
      assert.equal(validated.plans.length, 1, 'the generic same-metric control must reach the existing compute path')
      const s = await computePlan(sidecar, validated.plans[0])
      assert.ok(s)
      assert.equal(s.impact, 10)
      assert.equal(s.newValue, 110)
      assert.equal(s.impactMetric, sidecar.base_metric)
      assert.equal(s.mitigationBasis, 'disclosed_positions')
      assert.equal(s.isBound, true)
      assert.equal(s.source, row.source)
      assert.equal(s.basis, 'company-disclosed')
      assert.equal(s.realisedOffsetPct, null, 'unknown offset must not become an invented measured zero')
      assert.equal(s.mitigatedImpact, null)
      assert.equal(s.mitigatedNewValue, null)
      assert.equal(s.grossBoundImpact, null)
      assert.ok(s.mitigationNote)
      assert.match(s.mitigationNote, /zero-ADDITIONAL-response BOUND/)
      assert.ok(s.mitigationNote.includes(row.embedded_hedges_as_of))
      assert.ok(s.mitigationNote.includes(row.embedded_hedges))
      assert.ok(s.mitigationNote.includes(row.source))
      assert.match(s.mitigationNote, /analyst assumption, not a company forecast/)
      assert.match(s.mitigationNote, /not an unhedged gross coefficient or a proven worst-case outcome/)
      assert.match(s.mitigationNote, /Gross exposure and a measured realised offset are not assessable/)
      const block = computedContextBlock({ kind: 'scenario', asked: question, scenario: s })
      assert.ok(block.includes(s.mitigationNote), 'the complete engine note, including snapshot, scope and source, must survive narration')
      assert.match(block, /BOUND, not as the expected outcome/)
    }
  })

  await check('§9 disclosed positions: authenticated carried-forward output retains the original full note and ignores forged client metadata', async () => {
    const { sidecar, row } = disclosedPositionsControl({ realised_offset_pct: null, realised_offset_source: null })
    const s = await computePlan(sidecar, { variable: row.variable, row, req: { delta: 2 } })
    assert.ok(s)
    const prior = { kind: 'scenario' as const, asked: 'if input price rises 2 units?', scenario: s }
    const turnId = 'turn_disclosed_positions_0001'
    const durable = { role: 'assistant' as const, content: 'Recorded source positions remain included.', turnId, computed: [prior] }
    const forged = { ...prior, scenario: { ...s, mitigationBasis: 'disclosed_zero', mitigationNote: 'Invented client zero-response measurement' } }
    const found = resolveAuthenticatedPriorScenario(
      [{ ...durable, computed: [forged] }],
      'chat_positions_control',
      durable,
      () => ({ conversationId: 'chat_positions_control', turnId, assistantMessage: { content: durable.content, computed: [prior] } }),
    )
    assert.ok(found)
    assert.equal(found.scenario.mitigationBasis, 'disclosed_positions')
    assert.equal(found.scenario.isBound, true)
    assert.equal(found.scenario.source, row.source)
    assert.equal(found.scenario.mitigationNote, s.mitigationNote)
    const block = computedContextBlock({ ...found, asked: 'and what would that change mean for the target?' }, { carriedForward: true })
    assert.match(block, /SAME computed result from earlier in this conversation/)
    assert.ok(block.includes(s.mitigationNote!))
    assert.ok(!block.includes('Invented client'))
  })

  await check('§9 disclosed positions: malformed new-state metadata returns null rather than a generic zero-mitigation result', async () => {
    const invalid: [string, Record<string, unknown>][] = [
      ['blank source', { source: ' ' }],
      ['BOM-only source', { source: '\uFEFF' }],
      ['BOM-only position description', { embedded_hedges: '\uFEFF' }],
      ['U+0085-only source', { source: '\u0085' }],
      ['U+001C-only position description', { embedded_hedges: '\u001C' }],
      ['unsupported scope', { mitigation_scope: 'all_response_zero' }],
      ['invalid calendar date', { embedded_hedges_as_of: '2025-02-30' }],
      ['year zero snapshot', { embedded_hedges_as_of: '0000-01-01' }],
      ['missing source snapshot', { embedded_hedges_as_of: undefined }],
      ['inferred basis', { basis: 'inferred' }],
      ['invented zero offset', { realised_offset_pct: 0 }],
      ['claimed offset citation', { realised_offset_source: 'Not a measured offset' }],
      ['blank offset citation', { realised_offset_source: '' }],
      ['blank position description', { embedded_hedges: ' ' }],
      ['wrong-type position description', { embedded_hedges: [] }],
    ]
    for (const [label, patch] of invalid) {
      const { sidecar, row } = disclosedPositionsControl(patch)
      assert.equal(await computePlan(sidecar, { variable: row.variable, row, req: { delta: 2 } }), null, label)
    }
  })


  // Predeclared F3 controls: fixed parser outputs exercise the backend, never a real model/provider call.
  await check('source effect-only: four exact NHY positive points retain their own annual basis and withhold all earnings/margin levels', async () => {
    const cases: { id: string; question: string; parse: ParseResult; impact: number }[] = [
      {"id": "lme_aluminium_price-disclosed-point", "question": "What is the 2026 normal annual production Adjusted EBITDA effect if LME aluminium rises 10 USD/mt, keeping the source positions fixed?", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "direction": "up", "percent": false}], "periodNote": true}, "impact": 150},
      {"id": "usd_nok-disclosed-point", "question": "What is the 2026 normal annual production Adjusted EBITDA effect if USD/NOK rises 1 NOK per USD, keeping source positions fixed?", "parse": {"intents": [{"variable": "usd_nok", "mode": "move", "value": 1, "direction": "up", "percent": false}], "periodNote": true}, "impact": 4900},
      {"id": "brl_nok-disclosed-point", "question": "What is the 2026 normal annual production Adjusted EBITDA effect if BRL/NOK rises 0.10 NOK per BRL, keeping source positions fixed?", "parse": {"intents": [{"variable": "brl_nok", "mode": "move", "value": 0.1, "direction": "up", "percent": false}], "periodNote": true}, "impact": -520},
      {"id": "eur_nok-disclosed-point", "question": "What is the 2026 normal annual production Adjusted EBITDA effect if EUR/NOK rises 1 NOK per EUR, keeping source positions fixed?", "parse": {"intents": [{"variable": "eur_nok", "mode": "move", "value": 1, "direction": "up", "percent": false}], "periodNote": true}, "impact": -210},
    ]
    for (const c of cases) {
      const v = validateIntents(c.parse, c.question, SOURCE_EFFECTS)
      assert.equal(v.refusal, null, c.id)
      assert.equal(v.plans.length, 1, c.id)
      const s = await computePlan(SOURCE_EFFECTS, v.plans[0])
      assert.ok(s, c.id)
      assert.equal(s.impact, c.impact)
      assert.equal(s.impactMetric, SOURCE_EFFECT_METRIC)
      for (const value of [s.baseValue, s.newValue, s.baseMarginPct, s.newMarginPct, s.marginChangeBps]) assert.equal(value, null)
      assert.equal(s.periodNote, true)
      assert.equal(s.periodBase, null, 'the unused historical FY2025 reference cannot become an applied base')
      assert.equal(s.mitigationBasis, 'disclosed_positions')
      assert.equal(s.isBound, true)
      assert.ok(s.metricNote)
      assert.ok(s.source)
      assert.ok(s.mitigationNote)
      const block = computedContextBlock({ kind: 'scenario', asked: c.question, scenario: s })
      assert.match(block, /Effect only.*change in/)
      assert.ok(block.includes(SOURCE_EFFECT_METRIC))
      assert.match(block, /Starting\/resulting earnings levels and margin: Not assessable/)
      assert.ok(block.includes(s.metricNote), 'retain the honest explanation of unlike metrics, including the historical metric explicitly NOT applied')
      assert.ok(block.includes(s.source))
      assert.ok(block.includes(s.mitigationNote))
      assert.match(block, /2026 normal annual production/)
      assert.match(block, /2025-12-31/)
      assert.match(block, /zero-ADDITIONAL-response BOUND/)
      assert.match(block, /not a company forecast/)
      assert.match(block, /not a multi-year forecast/)
      assert.doesNotMatch(block, /— → —/)
      assert.doesNotMatch(block, /on the FY2025.*base/)
      assert.doesNotMatch(block, /TARGET \/ UPSIDE|EXPECTED RETURN:/)
    }
  })

  await check('source raw-move gate: predeclared values, variable clauses, units and signs refuse parser contradictions and preserve decimal controls', async () => {
    const cases: { id: string; question: string; parse: ParseResult; impact: number | null }[] = [
      {"id": "raw-false-percent", "question": "aluminium rises 5%", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 5, "percent": false}]}, "impact": null},
      {"id": "raw-false-percentage-word", "question": "aluminium rises 5 percent", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 5, "percent": false}]}, "impact": null},
      {"id": "raw-false-bps", "question": "aluminium rises 10 bps", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false}]}, "impact": null},
      {"id": "raw-level-misparsed-as-move", "question": "aluminium is at 3500 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 3500, "percent": false}]}, "impact": null},
      {"id": "raw-year-selected", "question": "What is the 2026 normal annual production Adjusted EBITDA effect if aluminium rises 10 USD/mt?", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 2026, "percent": false}]}, "impact": null},
      {"id": "raw-target-endpoint-selected", "question": "aluminium rises 10 USD/mt to 3500 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 3500, "percent": false}]}, "impact": null},
      {"id": "raw-from-endpoint-selected", "question": "aluminium moves from 3450 USD/mt to 3460 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 3450, "percent": false}]}, "impact": null},
      {"id": "raw-to-endpoint-selected", "question": "aluminium moves from 3450 USD/mt to 3460 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 3460, "percent": false}]}, "impact": null},
      {"id": "raw-explicit-change-with-endpoints", "question": "aluminium rises 10 USD/mt from 3450 USD/mt to 3460 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": 150},
      {"id": "raw-other-variable-number-same-unit", "question": "aluminium rises 10 USD/mt; freight rises 20 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 20, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-other-variable-fx-number", "question": "aluminium rises 10 USD/mt; USD/NOK rises 1 NOK per USD", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 1, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-other-variable-aluminium-number", "question": "aluminium rises 10 USD/mt; USD/NOK rises 1 NOK per USD", "parse": {"intents": [{"variable": "usd_nok", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-contradictory-fall-up", "question": "aluminium falls 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-contradictory-rise-down", "question": "aluminium rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "down"}]}, "impact": null},
      {"id": "raw-contradictory-rise-negative", "question": "aluminium rises -10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": -10, "percent": false}]}, "impact": null},
      {"id": "raw-negative-move-consistent", "question": "aluminium falls 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "down"}]}, "impact": -150},
      {"id": "raw-signed-own-clause-positive", "question": "aluminium +10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": 150},
      {"id": "raw-signed-own-clause-negative", "question": "aluminium -10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": -10, "percent": false}]}, "impact": -150},
      {"id": "raw-signed-ambiguous-variable-clause", "question": "aluminium and freight +10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-no-change-or-sign", "question": "aluminium 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-missing-unit", "question": "aluminium rises 10", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-wrong-unit", "question": "aluminium rises 10 NOK per USD", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": null},
      {"id": "raw-decimal-usd-fx", "question": "USD/NOK rises .50 NOK per USD", "parse": {"intents": [{"variable": "usd_nok", "mode": "move", "value": 0.5, "percent": false, "direction": "up"}]}, "impact": 2450},
      {"id": "raw-decimal-brl-fx", "question": "BRL/NOK rises 0.10 NOK/BRL", "parse": {"intents": [{"variable": "brl_nok", "mode": "move", "value": 0.1, "percent": false, "direction": "up"}]}, "impact": -520},
      {"id": "raw-decimal-eur-fx", "question": "EUR/NOK rises +0.25 NOK per EUR", "parse": {"intents": [{"variable": "eur_nok", "mode": "move", "value": 0.25, "percent": false, "direction": "up"}]}, "impact": -52.5},
      {"id": "raw-by-verb-own-unit", "question": "aluminium rises by 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}]}, "impact": 150},
    ]
    for (const c of cases) {
      const v = validateIntents(c.parse, c.question, SOURCE_EFFECTS)
      assert.equal(v.plans.length, c.impact === null ? 0 : 1, c.id)
      if (c.impact === null) continue
      const s = await computePlan(SOURCE_EFFECTS, v.plans[0])
      assert.ok(s, c.id)
      assert.equal(s.impact, c.impact, c.id)
      assert.equal(s.newValue, null)
      assert.equal(s.newMarginPct, null)
    }
  })

  // Discovered after the original matrix freeze: retain these as development regressions, not members
  // of its 58 predeclared software controls or additional financial evidence.
  await check('source name binding: a different FX counterpart or an unrelated price cannot select the recorded row', () => {
    assert.equal(validateIntents({ intents: [{ variable: 'usd_nok', mode: 'move', value: 1 }] }, 'USD/JPY rises 1 NOK per USD', SOURCE_EFFECTS).plans.length, 0)
    assert.equal(validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10 }] }, 'zinc price rises 10 USD/mt', SOURCE_EFFECTS).plans.length, 0)
  })

  // Post-review development controls from the preserved v2 NEEDS_REVISION evidence. These 14+4
  // requests are not additions to the original 73-record sample or new unseen financial cases.
  await check('post-review subject/negation controls: reproduce the exact 14 independent v2 requests', () => {
    const cases: { id: string; question: string; parse: ParseResult; expectedPlans: number }[] = [
      {"id": "positive-source-aluminium", "question": "aluminium rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 1},
      {"id": "positive-source-brl", "question": "BRL/NOK rises 0.10 NOK per BRL", "parse": {"intents": [{"variable": "brl_nok", "mode": "move", "value": 0.1, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 1},
      {"id": "simple-unrecorded-commodity", "question": "copper price rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "simple-unrecorded-fx", "question": "USD/JPY rises 1 NOK per USD", "parse": {"intents": [{"variable": "usd_nok", "mode": "move", "value": 1, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "recorded-name-earlier-unchanged-as-copper-moves", "question": "aluminium price is unchanged as copper price rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "recorded-name-earlier-unchanged-when-alumina-moves", "question": "aluminium price is unchanged when alumina price rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "recorded-name-earlier-comparison-colon", "question": "aluminium price comparison: copper price rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "negated-rise", "question": "aluminium does not rise 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "negated-fall", "question": "aluminium does not fall 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "down"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "contracted-negated-rise", "question": "aluminium doesn't rise 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "wrong-commodity-existing-separator", "question": "aluminium is unchanged; copper rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "wrong-currency-unit", "question": "aluminium rises 10 EUR/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "wrong-sign", "question": "aluminium falls 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "false-percent", "question": "aluminium rises 5%", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 5, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
    ]
    for (const c of cases) assert.equal(validateIntents(c.parse, c.question, SOURCE_EFFECTS).plans.length, c.expectedPlans, c.id)
  })

  await check('post-review source controls: reject all four independently observed Unicode/ASCII blank citations', () => {
    const cases = [
      {"id": "NEL", "codePoints": [133], "expectedPlans": 0},
      {"id": "file-separator", "codePoints": [28], "expectedPlans": 0},
      {"id": "ASCII-blank", "codePoints": [32, 9, 13, 10], "expectedPlans": 0},
      {"id": "BOM", "codePoints": [65279], "expectedPlans": 0},
    ]
    for (const c of cases) {
      const sc = { ...SOURCE_EFFECTS, sensitivities: [{ ...SOURCE_EFFECT_ROWS[0], source: String.fromCodePoint(...c.codePoints) }] }
      const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10, direction: 'up', percent: false }], periodNote: true }, 'aluminium rises 10 USD/mt', sc)
      assert.equal(v.plans.length, c.expectedPlans, c.id)
      assert.equal(v.refusal, 'no_source', c.id)
    }
  })

  // Exact post-v3-review development cases; the preserved NEEDS_REVISION finding and original
  // 73-record matrix remain unchanged. These exclusion/comparison controls are not unseen samples.
  await check('post-review excluded/comparison subjects cannot select the excluded recorded commodity', () => {
    const cases: { id: string; question: string; parse: ParseResult; expectedPlans: number }[] = [
      {"id": "contrast-rather-than", "question": "copper rather than aluminium rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "contrast-instead-of", "question": "copper instead of aluminium rises 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "exclusion-except", "question": "all metals except aluminium rise 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
      {"id": "exclusion-excluding", "question": "metals excluding aluminium rise 10 USD/mt", "parse": {"intents": [{"variable": "lme_aluminium_price", "mode": "move", "value": 10, "percent": false, "direction": "up"}], "periodNote": true}, "expectedPlans": 0},
    ]
    for (const c of cases) assert.equal(validateIntents(c.parse, c.question, SOURCE_EFFECTS).plans.length, c.expectedPlans, c.id)
  })

  await check('source metric gate: malformed row/base labels never become authoritative; matched missing/null row fallback stays valid', async () => {
    const malformed: unknown[] = [{ metric: 'unknown' }, ['unknown'], 123, true, false, '', ' \t\r\n', '\uFEFF', '\u0085']
    for (const value of malformed) {
      for (const field of ['row', 'base']) {
        const sc = field === 'base'
          ? { ...SOURCE_EFFECTS, base_metric: value } as any
          : { ...SOURCE_EFFECTS, sensitivities: [{ ...SOURCE_EFFECT_ROWS[0], impact_metric: value }] } as any
        const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10, direction: 'up' }] }, 'aluminium rises 10 USD/mt', sc)
        assert.equal(v.plans.length, 0, `${field}: ${JSON.stringify(value)}`)
        assert.equal(v.refusal, 'metric_mismatch')
      }
    }
    for (const value of [null, undefined]) {
      const sc = { ...SOURCE_EFFECTS } as any
      if (value === undefined) delete sc.base_metric
      else sc.base_metric = value
      assert.equal(validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10 }] }, 'aluminium rises 10 USD/mt', sc).plans.length, 0)
    }
    for (const value of [null, undefined]) {
      const { sidecar, row } = disclosedPositionsControl({ variable: 'price', label: 'Price' })
      const legacyRow = { ...row } as any
      if (value === undefined) delete legacyRow.impact_metric
      else legacyRow.impact_metric = value
      const sc = { ...sidecar, sensitivities: [legacyRow] }
      const v = validateIntents({ intents: [{ variable: 'price', mode: 'move', value: 2 }] }, 'price rises 2 units', sc)
      assert.equal(v.plans.length, 1)
      const s = await computePlan(sc, v.plans[0])
      assert.equal(s!.impact, 10)
      assert.equal(s!.newValue, 110)
      assert.equal(s!.impactMetric, sidecar.base_metric)
    }
  })

  await check('source effect-only: level, context-based percentage and margin anchors remain unavailable; source/number/variable guards remain', () => {
    const base = { variable: 'lme_aluminium_price', mode: 'move' as const, value: 10 }
    const bad: { question: string; parse: ParseResult; sidecar?: SensitivitySidecar }[] = [
      { question: 'what aluminium price gets margin to 15%', parse: { intents: [{ ...base, mode: 'target_margin', value: 15 }] } },
      { question: 'aluminium is at 3500 USD/mt', parse: { intents: [{ ...base, mode: 'level', value: 3500 }] } },
      { question: 'aluminium rises 5%', parse: { intents: [{ ...base, value: 5, percent: true }] } },
      { question: 'aluminium rises 10 USD/mt', parse: { intents: [base] }, sidecar: { ...SOURCE_EFFECTS, sensitivities: [{ ...SOURCE_EFFECT_ROWS[0], source: null }] } },
      { question: 'freight rises 10 units', parse: { intents: [{ variable: 'freight_rates', mode: 'move', value: 10 }], asksUnrecorded: 'freight rates' } },
      { question: 'aluminium rises 10 USD/mt', parse: { intents: [{ ...base, value: 20 }] } },
    ]
    for (const c of bad) assert.equal(validateIntents(c.parse, c.question, c.sidecar ?? SOURCE_EFFECTS).plans.length, 0, c.question)
  })

  await check('computePlan owns period qualifiers: effect-only true/false/absent never applies FY2025, including an absent sidecar period', async () => {
    for (const missingPeriod of [false, true]) {
      const sc = { ...SOURCE_EFFECTS }
      if (missingPeriod) delete sc.base_period
      for (const flag of [true, false, undefined]) {
        const pr: ParseResult = { intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10, direction: 'up' }], ...(flag === undefined ? {} : { periodNote: flag }) }
        const q = 'What is the 2026 normal annual production effect if aluminium rises 10 USD/mt?'
        const v = validateIntents(pr, q, sc)
        assert.equal(v.plans.length, 1)
        const s = await computePlan(sc, v.plans[0])
        assert.ok(s)
        assert.equal(s.impact, 150)
        assert.equal(s.periodBase ?? null, null)
        assert.equal(s.periodNote, flag === true ? true : undefined)
        const block = computedContextBlock({ kind: 'scenario', asked: q, scenario: s })
        assert.doesNotMatch(block, /on the FY2025.*base/)
        if (flag) assert.match(block, /no comparable earnings base applied.*not a multi-year forecast/)
      }
    }
  })

  await check('computePlan matched periods: future annotation retains the applied base; default/false plans preserve complete prior output', async () => {
    const control = disclosedPositionsControl({ variable: 'price', label: 'Price' })
    const sidecar = { ...control.sidecar, base_period: 'FY2026', revenue_period: 'FY2026' }
    const row = control.row
    const direct = await computePlan(sidecar, { variable: 'price', row, req: { delta: 2 } })
    assert.ok(direct)
    assert.equal(Object.hasOwn(direct, 'periodNote'), false)
    assert.equal(Object.hasOwn(direct, 'periodBase'), false)
    for (const flag of [false, undefined]) {
      const v = validateIntents({ intents: [{ variable: 'price', mode: 'move', value: 2 }], ...(flag === undefined ? {} : { periodNote: flag }) }, 'price rises 2 units', sidecar)
      assert.deepEqual(await computePlan(sidecar, v.plans[0]), direct)
    }
    for (const missingPeriod of [false, true]) {
      const sc = { ...sidecar }
      if (missingPeriod) delete sc.base_period
      const q = 'What is FY2027 earnings if price rises 2 units?'
      const v = validateIntents({ intents: [{ variable: 'price', mode: 'move', value: 2 }], periodNote: true }, q, sc)
      const s = await computePlan(sc, v.plans[0])
      assert.equal(s!.newValue, 110)
      assert.equal(s!.periodNote, true)
      assert.equal(s!.periodBase, missingPeriod ? null : 'FY2026')
      assert.match(computedContextBlock({ kind: 'scenario', asked: q, scenario: s! }), missingPeriod ? /on an unstated base period/ : /on the FY2026 base/)
    }
  })

  await check('generic matched controls retain move, level, percentage and margin-target arithmetic', async () => {
    const { sidecar } = disclosedPositionsControl({ variable: 'price', label: 'Price' })
    const cases: { question: string; parse: ParseResult; delta: number; newValue: number }[] = [
      { question: 'price rises 2 units', parse: { intents: [{ variable: 'price', mode: 'move', value: 2 }] }, delta: 2, newValue: 110 },
      { question: 'price is at 12 units', parse: { intents: [{ variable: 'price', mode: 'level', value: 12 }] }, delta: 2, newValue: 110 },
      { question: 'price rises 20%', parse: { intents: [{ variable: 'price', mode: 'move', value: 20, percent: true }] }, delta: 2, newValue: 110 },
      { question: 'what price gets margin to 15%', parse: { intents: [{ variable: 'price', mode: 'target_margin', value: 15 }] }, delta: 10, newValue: 150 },
    ]
    for (const c of cases) {
      const v = validateIntents(c.parse, c.question, sidecar)
      assert.equal(v.plans.length, 1)
      const s = await computePlan(sidecar, v.plans[0])
      assert.equal(s!.resolvedDelta, c.delta)
      assert.equal(s!.newValue, c.newValue)
      assert.equal(s!.newMarginPct, c.newValue / 10)
      assert.equal(s!.marginBasis, 'revenue_constant')
    }
  })

  await check('source effect-only: authenticated carried context keeps exact withheld-level payload and ignores forged levels/valuation', async () => {
    const q = 'aluminium rises 10 USD/mt'
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10 }], periodNote: true }, q, SOURCE_EFFECTS)
    const s = await computePlan(SOURCE_EFFECTS, v.plans[0])
    assert.ok(s)
    const prior = { kind: 'scenario' as const, asked: q, scenario: s }
    const turnId = 'turn_source_effect_0001'
    const durable = { role: 'assistant' as const, turnId, content: 'Annual source effect only; earnings levels unavailable.', computed: [prior] }
    const forged = { ...prior, scenario: { ...s, baseValue: 28889, newValue: 999999, newMarginPct: 99, mitigationNote: 'forged client note' }, reprice: { ok: true } }
    const found = resolveAuthenticatedPriorScenario(
      [{ ...durable, computed: [forged] }], 'chat_source_effect', durable,
      () => ({ conversationId: 'chat_source_effect', turnId, assistantMessage: { content: durable.content, computed: [prior] } }),
    )
    assert.ok(found)
    assert.deepEqual(found.scenario, s)
    assert.equal(found.scenario.newValue, null)
    assert.equal(found.scenario.newMarginPct, null)
    assert.equal(found.reprice, undefined)
    const block = computedContextBlock({ ...found, asked: 'and what would that change mean for the target?' }, { carriedForward: true })
    assert.match(block, /SAME computed result/)
    assert.match(block, /Effect only/)
    assert.ok(block.includes(s.metricNote!))
    assert.ok(block.includes(s.mitigationNote!))
    assert.doesNotMatch(block, /forged client|999,999|TARGET \/ UPSIDE/)
    assert.doesNotMatch(block, /on the FY2025.*base/)
  })

  await check('source effect-only: separate source legs remain separate and an already-aborted plan produces no calculation', async () => {
    const q = 'aluminium rises 10 USD/mt; USD/NOK rises 1 NOK per USD'
    const v = validateIntents({ intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 10 }, { variable: 'usd_nok', mode: 'move', value: 1 }] }, q, SOURCE_EFFECTS)
    assert.equal(v.plans.length, 2)
    const effects = []
    for (const plan of v.plans) effects.push((await computePlan(SOURCE_EFFECTS, plan))!.impact)
    assert.deepEqual(effects, [150, 4900])
    const controller = new AbortController()
    controller.abort()
    assert.equal(await computePlan(SOURCE_EFFECTS, v.plans[0], controller.signal), null)
  })

  await check('actual route keeps shared period ownership and numeric-newValue valuation guard for effect-only results', () => {
    const route = readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8')
    assert.match(route, /await computePlan\(loaded\.sidecar, pl, ac\.signal\)/)
    assert.doesNotMatch(route, /scenario\.period(?:Note|Base)\s*=/, 'route must not override the shared result with an unused historical period')
    assert.match(route, /if \(vsc && typeof scenario\.newValue === 'number'\)/, 'effect-only null newValue cannot enter the existing valuation hop')
  })

  await check('pre-aborted deterministic modeling never starts a scenario or repricing subprocess', async () => {
    const controller = new AbortController()
    controller.abort()
    const plan = validateIntents(
      { intents: [{ variable: 'lme_aluminium_price', mode: 'move', value: 45, direction: 'up' }] },
      'aluminium rises $45/mt',
      NHY,
    ).plans[0]
    assert.equal(await computePlan(NHY, plan, controller.signal), null)
    assert.equal(await repriceFromMetric({
      valuationSidecar: NHY_VSC, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889,
      signal: controller.signal,
    }), null)
  })

  console.log(`\n${passed} chat-whatif checks passed`)
})()
