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
  questionMentionsRow, validateIntents, computePlan, computedContextBlock, repriceFromMetric, repricedBlock,
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
  await check('an uncited coefficient → no_source; a different impact metric → metric_mismatch', () => {
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

  await check('no valuation levers → the section is simply absent, never a guess', async () => {
    assert.deepEqual(repricedBlock(null), [])
    const rv = await repriceFromMetric({ valuationSidecar: {}, decision: NHY_DEC, newMetric: 33014, baseMetric: 28889 })
    assert.equal(rv!.ok, false)
    const block = repricedBlock(rv).join('\n')
    assert.match(block, /not derivable/)
  })

  console.log(`\n${passed} chat-whatif checks passed`)
})()
