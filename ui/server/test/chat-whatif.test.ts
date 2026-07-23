// Deterministic what-if modeling for the Ask chat: the pure classification layer + the real engine
// reconciliation, across all four intents (forward move / target level / reverse solve-for / joint ask) and
// the refusals. This is the anti-hallucination core — it pins that a question maps to the RIGHT intent and
// variable, that the number the chat shows is exactly what scripts/sensitivity_math.py computes, and that
// anything it can't model cleanly is REFUSED, never guessed.
// Run: npx tsx test/chat-whatif.test.ts
import assert from 'node:assert/strict'
import {
  detectWhatIf, matchVariable, parseDelta, parseNum, parseLevel, parseReverseTarget, classifyWhatIf,
  computeScenario, computePlan, computedContextBlock, type SensitivitySidecar, type Plan,
} from '../src/chat-whatif'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// NHY's real recorded coefficients (inline, so the test never depends on committed data). revenue_base
// 207,971 → base operating margin 13.891%.
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

await (async () => {
  // ---- detection + matching (incl. the fixes) ----
  await check('detects what-if incl. solve/level phrasing', () => {
    assert.equal(detectWhatIf('what price gets margin to 16%?'), true)
    assert.equal(detectWhatIf('EBITDA if aluminium is at $3,000/mt?'), true)
    assert.equal(detectWhatIf('summarize the risks'), false)
  })
  await check('matches by stem — "extrusion volume" → extrusions_volume (the v1 miss)', () => {
    assert.equal(matchVariable('if extrusion volume drops 10%', NHY)?.variable, 'extrusions_volume')
  })
  await check('alumina does not collide with aluminium; FX matches by alias', () => {
    assert.equal(matchVariable('aluminium rises $45/mt', NHY)?.variable, 'lme_aluminium_price')
    assert.equal(matchVariable('what if alumina goes up 20', NHY)?.variable, 'alumina_price')
    assert.equal(matchVariable('if the dollar moves 0.5', NHY)?.variable, 'usd_nok')
  })

  // ---- extraction primitives ----
  await check('parseDelta: signed move, %, and the from/to bail', () => {
    assert.equal((parseDelta('rises $45/mt', NHY.sensitivities![0]) as any).delta, 45)
    assert.equal((parseDelta('falls 45', NHY.sensitivities![0]) as any).delta, -45)
    assert.ok(near((parseDelta('drops 5%', NHY.sensitivities![0]) as any).delta, -159.6))
    assert.equal(parseDelta('from 3200 to 3000', NHY.sensitivities![0]), null)
  })
  await check('parseLevel: "at/hits/to <n>" → level; a plain move → null', () => {
    assert.equal(parseLevel('aluminium is at $3,000/mt'), 3000)
    assert.equal(parseLevel('if aluminium hits 3500'), 3500)
    assert.equal(parseLevel('aluminium rises to 3484'), 3484)
    assert.equal(parseLevel('aluminium rises $45/mt'), null)
  })
  await check('parseReverseTarget: a margin target', () => {
    assert.deepEqual(parseReverseTarget('what price gets the margin to 16%?'), { targetMargin: 16 })
    assert.deepEqual(parseReverseTarget('16% operating margin'), { targetMargin: 16 })
  })

  // ---- classification: the four intents + refusals ----
  await check('classify → forward', () => {
    const p = classifyWhatIf('margin if aluminium rises $45/mt', NHY)
    assert.equal((p as any).kind, 'forward'); assert.equal((p as any).delta, 45)
  })
  await check('classify → level', () => {
    const p = classifyWhatIf('whats EBITDA if aluminium is at $3000/mt?', NHY)
    assert.equal((p as any).kind, 'level'); assert.equal((p as any).targetLevel, 3000)
  })
  await check('classify → reverse', () => {
    const p = classifyWhatIf('how much must aluminium rise for margin to hit 16%?', NHY)
    assert.equal((p as any).kind, 'reverse'); assert.equal((p as any).targetMargin, 16)
  })
  await check('classify → multi (two distinct variables, one plan each)', () => {
    const p = classifyWhatIf('what if aluminium rises $45/mt and USD/NOK falls 0.5?', NHY) as any
    assert.equal(p.kind, 'multi'); assert.equal(p.plans.length, 2)
    const vars = p.plans.map((x: Plan) => x.variable).sort()
    assert.deepEqual(vars, ['lme_aluminium_price', 'usd_nok'])
    assert.equal(p.plans.find((x: Plan) => x.variable === 'usd_nok').delta, -0.5) // each leg keeps ITS own move
  })
  await check('classify → unsupported (unrecorded variable)', () => {
    const p = classifyWhatIf('what if freight rates rise 20%?', NHY) as any
    assert.equal(p.kind, 'unsupported'); assert.equal(p.reason, 'unrecorded'); assert.equal(p.recorded.length, 4)
  })
  await check('classify → unsupported (margin target, named variable, but no revenue base)', () => {
    const norev = { ...NHY, revenue_base: null }
    const p = classifyWhatIf('what aluminium price gets margin to 16%?', norev) as any
    assert.equal(p.kind, 'unsupported'); assert.equal(p.reason, 'no_revenue_base')
  })
  await check('a reverse question naming no variable refuses as unrecorded (ambiguous which input)', () => {
    const p = classifyWhatIf('what price gets margin to 16%?', NHY) as any
    assert.equal(p.kind, 'unsupported'); assert.equal(p.reason, 'unrecorded')
  })
  await check('classify → null for a non-what-if', () => {
    assert.equal(classifyWhatIf('what is the single biggest risk?', NHY), null)
  })

  // ---- PR #332 review fixes: robustness against stray numbers + citation/metric integrity ----
  await check('parseNum: comma-thousands vs decimal', () => {
    assert.equal(parseNum('1,000'), 1000)
    assert.equal(parseNum('1,000,000'), 1000000)
    assert.equal(parseNum('3,484.5'), 3484.5)
    assert.equal(parseNum('0.5'), 0.5)
    assert.equal(parseNum('45'), 45)
  })
  await check('parseDelta ignores a fiscal YEAR and takes the real move', () => {
    // "FY2026 EBITDA if aluminium rises $45/mt" → +45, NOT +2026
    assert.equal((parseDelta('what is FY2026 EBITDA if aluminium rises $45/mt', NHY.sensitivities![0]) as any).delta, 45)
  })
  await check('parseDelta reads comma-grouped thousands as thousands', () => {
    assert.equal((parseDelta('what if aluminium rises by $1,000/mt', NHY.sensitivities![0]) as any).delta, 1000)
  })
  await check('LEVEL wins over an output-metric target ("EBITDA if aluminium rises to $3,000")', () => {
    const p = classifyWhatIf('what would EBITDA be if aluminium rises to $3,000/mt?', NHY) as any
    assert.equal(p.kind, 'level'); assert.equal(p.targetLevel, 3000)
  })
  await check('an ordinary dated question is NOT refused as a what-if', () => {
    assert.equal(classifyWhatIf('what was EBITDA in FY2025?', NHY), null)
  })
  await check('a coefficient with no source is refused (no_source), not modelled', () => {
    const nosrc = { ...NHY, sensitivities: [{ ...NHY.sensitivities![0], source: null }] }
    const p = classifyWhatIf('margin if aluminium rises $45/mt', nosrc) as any
    assert.equal(p.kind, 'unsupported'); assert.equal(p.reason, 'no_source')
  })
  await check('a coefficient on a different metric is refused (metric_mismatch)', () => {
    const diff = { ...NHY, sensitivities: [{ ...NHY.sensitivities![0], impact_metric: 'revenue_nok_m' }] }
    const p = classifyWhatIf('margin if aluminium rises $45/mt', diff) as any
    assert.equal(p.kind, 'unsupported'); assert.equal(p.reason, 'metric_mismatch')
  })
  await check('margin is labelled by its base metric (EBITDA margin), at unchanged revenue', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', { delta: 45 })
    assert.equal(s!.marginBasis, 'revenue_constant')
    const block = computedContextBlock({ kind: 'scenario', asked: 'q', scenario: s! })
    assert.ok(/EBITDA margin/i.test(block) && /unchanged revenue/i.test(block) && !/operating margin/i.test(block))
  })
  await check('an inferred coefficient carries the "Inference, not from filings" instruction', async () => {
    const s = await computeScenario(NHY, 'alumina_price', { delta: 20 })
    const block = computedContextBlock({ kind: 'scenario', asked: 'q', scenario: s! })
    assert.ok(/INFERRED/i.test(block) && /Inference, not from filings/i.test(block))
  })

  // ---- engine reconciliation: what the card shows == sensitivity_math.py ----
  await check('FORWARD aluminium +45 → +675, +32.5 bps, in range', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', { delta: 45 })
    assert.ok(s); assert.equal(s!.impact, 675); assert.equal(s!.newValue, 29564)
    assert.equal(s!.marginChangeBps, 32.5); assert.equal(s!.withinDisclosedRange, true); assert.equal(s!.mode, 'delta')
  })
  await check('LEVEL aluminium at 3000 → resolved −192 → −2,880 (mode level)', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', { targetLevel: 3000 })
    assert.ok(s); assert.equal(s!.mode, 'level'); assert.equal(s!.resolvedDelta, -192)
    assert.equal(s!.impact, -2880); assert.equal(s!.newValue, 26009); assert.equal(s!.targetLevel, 3000)
  })
  await check('REVERSE margin 16% → +292/mt → level ~3,484, new margin 16 (mode reverse)', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', { targetMargin: 16 })
    assert.ok(s); assert.equal(s!.mode, 'reverse')
    assert.ok(near(s!.targetValue, 33275.36)); assert.ok(near(s!.resolvedDelta, 292.42))
    assert.ok(near(s!.solvedVariableLevel, 3484.42)); assert.ok(near(s!.newMarginPct, 16, 0.05))
  })
  await check('computePlan runs a classified plan end-to-end', async () => {
    const p = classifyWhatIf('aluminium at $3000/mt', NHY) as Plan
    const s = await computePlan(NHY, p)
    assert.ok(s); assert.equal(s!.resolvedDelta, -192)
  })
  await check('unknown variable computes to null (never fabricated)', async () => {
    assert.equal(await computeScenario(NHY, 'freight', { delta: 20 }), null)
  })

  // ---- the injected context block per mode ----
  await check('context block: reverse names the target + the required move, do-not-recompute', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', { targetMargin: 16 })
    const b = computedContextBlock({ kind: 'scenario', asked: 'q', scenario: s! })
    assert.ok(/REACHES a target/i.test(b) && /Required move/i.test(b) && /do NOT recompute/i.test(b))
  })
  await check('context block: multi refusal explains one-at-a-time', () => {
    const b = computedContextBlock({ kind: 'unsupported', asked: 'q', reason: 'multi', recorded: NHY.sensitivities!.map((r) => ({ variable: r.variable, label: r.label, unit: r.unit })) })
    assert.ok(/ONE variable at a time/i.test(b) && /LME aluminium price/i.test(b))
  })

  console.log(`\n${passed} chat-whatif checks passed`)
})()
